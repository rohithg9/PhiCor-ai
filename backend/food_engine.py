"""
PhiCor Food Mathematical Model Engine
=====================================
Treats food as a parameterized biological input signal with deep 
molecular/biochemical analysis and organ system effects.

Data Sources:
- USDA FoodData Central (nutrient profiles)
- Open Food Facts (packaged foods, barcodes)
- FooDB (molecular compounds)
"""

import os
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from uuid import uuid4

# Food nutrient categories and their effects on organ systems
NUTRIENT_ORGAN_EFFECTS = {
    # Macronutrients
    "protein": {
        "organs_affected": ["kidneys", "liver", "muscles"],
        "effects": {
            "kidneys": {"direction": "load", "mechanism": "Nitrogen metabolism and urea production"},
            "liver": {"direction": "metabolic_load", "mechanism": "Protein synthesis and amino acid metabolism"},
            "muscles": {"direction": "anabolic", "mechanism": "Muscle protein synthesis"}
        },
        "conditions_sensitive": ["CKD", "liver_cirrhosis", "sarcopenia"]
    },
    "carbohydrates": {
        "organs_affected": ["pancreas", "liver", "brain"],
        "effects": {
            "pancreas": {"direction": "insulin_demand", "mechanism": "Beta cell insulin secretion"},
            "liver": {"direction": "glycogen_storage", "mechanism": "Hepatic glucose metabolism"},
            "brain": {"direction": "energy_supply", "mechanism": "Primary glucose utilization"}
        },
        "conditions_sensitive": ["diabetes", "insulin_resistance", "hypoglycemia"]
    },
    "fats": {
        "organs_affected": ["liver", "heart", "gallbladder"],
        "effects": {
            "liver": {"direction": "lipid_metabolism", "mechanism": "Triglyceride and cholesterol processing"},
            "heart": {"direction": "variable", "mechanism": "Depends on fat type (saturated vs unsaturated)"},
            "gallbladder": {"direction": "stimulation", "mechanism": "Bile secretion for fat emulsification"}
        },
        "conditions_sensitive": ["NAFLD", "hyperlipidemia", "gallstones", "CAD"]
    },
    "fiber": {
        "organs_affected": ["intestines", "liver", "pancreas"],
        "effects": {
            "intestines": {"direction": "beneficial", "mechanism": "Gut motility and microbiome support"},
            "liver": {"direction": "cholesterol_reduction", "mechanism": "Bile acid binding"},
            "pancreas": {"direction": "glucose_modulation", "mechanism": "Slows glucose absorption"}
        },
        "conditions_sensitive": ["constipation", "diabetes", "hyperlipidemia"]
    },
    
    # Electrolytes
    "sodium": {
        "organs_affected": ["kidneys", "heart", "blood_vessels"],
        "effects": {
            "kidneys": {"direction": "retention", "mechanism": "Fluid and electrolyte balance"},
            "heart": {"direction": "preload_increase", "mechanism": "Volume expansion"},
            "blood_vessels": {"direction": "vasoconstriction", "mechanism": "Blood pressure elevation"}
        },
        "conditions_sensitive": ["hypertension", "heart_failure", "CKD", "cirrhosis"]
    },
    "potassium": {
        "organs_affected": ["heart", "kidneys", "muscles"],
        "effects": {
            "heart": {"direction": "electrophysiology", "mechanism": "Cardiac action potential regulation"},
            "kidneys": {"direction": "excretion", "mechanism": "Renal potassium handling"},
            "muscles": {"direction": "function", "mechanism": "Neuromuscular transmission"}
        },
        "conditions_sensitive": ["CKD", "heart_failure", "arrhythmias", "hyperkalemia"]
    },
    "phosphorus": {
        "organs_affected": ["kidneys", "bones", "parathyroid"],
        "effects": {
            "kidneys": {"direction": "excretion_load", "mechanism": "Phosphate clearance"},
            "bones": {"direction": "mineralization", "mechanism": "Calcium-phosphate balance"},
            "parathyroid": {"direction": "PTH_stimulation", "mechanism": "Feedback regulation"}
        },
        "conditions_sensitive": ["CKD", "hyperphosphatemia", "osteoporosis"]
    },
    "calcium": {
        "organs_affected": ["bones", "heart", "kidneys", "parathyroid"],
        "effects": {
            "bones": {"direction": "mineralization", "mechanism": "Bone density maintenance"},
            "heart": {"direction": "contractility", "mechanism": "Cardiac muscle function"},
            "kidneys": {"direction": "stone_risk", "mechanism": "Calcium oxalate precipitation"}
        },
        "conditions_sensitive": ["osteoporosis", "kidney_stones", "hypercalcemia"]
    },
    "magnesium": {
        "organs_affected": ["heart", "muscles", "brain"],
        "effects": {
            "heart": {"direction": "rhythm_stability", "mechanism": "Ion channel regulation"},
            "muscles": {"direction": "relaxation", "mechanism": "Neuromuscular function"},
            "brain": {"direction": "neuroprotective", "mechanism": "NMDA receptor modulation"}
        },
        "conditions_sensitive": ["arrhythmias", "hypertension", "diabetes"]
    },
    
    # Vitamins
    "vitamin_a": {
        "organs_affected": ["eyes", "skin", "immune_system", "liver"],
        "effects": {
            "eyes": {"direction": "vision_support", "mechanism": "Rhodopsin synthesis"},
            "skin": {"direction": "epithelial_health", "mechanism": "Cell differentiation"},
            "liver": {"direction": "storage", "mechanism": "Retinol storage (toxicity risk if excess)"}
        },
        "conditions_sensitive": ["liver_disease", "malabsorption"]
    },
    "vitamin_d": {
        "organs_affected": ["bones", "kidneys", "immune_system", "parathyroid"],
        "effects": {
            "bones": {"direction": "calcium_absorption", "mechanism": "Intestinal calcium uptake"},
            "kidneys": {"direction": "calcium_reabsorption", "mechanism": "Renal calcium handling"},
            "immune_system": {"direction": "modulation", "mechanism": "Immune cell function"}
        },
        "conditions_sensitive": ["osteoporosis", "CKD", "autoimmune_diseases"]
    },
    "vitamin_k": {
        "organs_affected": ["liver", "blood", "bones"],
        "effects": {
            "liver": {"direction": "clotting_factors", "mechanism": "Coagulation protein synthesis"},
            "blood": {"direction": "coagulation", "mechanism": "Factor activation"},
            "bones": {"direction": "osteocalcin", "mechanism": "Bone protein carboxylation"}
        },
        "conditions_sensitive": ["anticoagulation_therapy", "liver_disease"]
    },
    "vitamin_b12": {
        "organs_affected": ["blood", "brain", "nerves"],
        "effects": {
            "blood": {"direction": "rbc_synthesis", "mechanism": "DNA synthesis for erythropoiesis"},
            "brain": {"direction": "neuroprotection", "mechanism": "Myelin synthesis"},
            "nerves": {"direction": "function", "mechanism": "Peripheral nerve health"}
        },
        "conditions_sensitive": ["pernicious_anemia", "neuropathy", "vegan_diet"]
    },
    "folate": {
        "organs_affected": ["blood", "brain", "fetus"],
        "effects": {
            "blood": {"direction": "rbc_synthesis", "mechanism": "DNA synthesis"},
            "brain": {"direction": "neurotransmitters", "mechanism": "Methylation reactions"},
            "fetus": {"direction": "neural_tube", "mechanism": "Neural tube development"}
        },
        "conditions_sensitive": ["anemia", "pregnancy", "methotrexate_therapy"]
    },
    
    # Minerals
    "iron": {
        "organs_affected": ["blood", "liver", "heart"],
        "effects": {
            "blood": {"direction": "hemoglobin", "mechanism": "Oxygen transport capacity"},
            "liver": {"direction": "storage", "mechanism": "Ferritin storage"},
            "heart": {"direction": "overload_risk", "mechanism": "Iron cardiomyopathy if excess"}
        },
        "conditions_sensitive": ["anemia", "hemochromatosis", "CKD"]
    },
    "zinc": {
        "organs_affected": ["immune_system", "skin", "pancreas"],
        "effects": {
            "immune_system": {"direction": "function", "mechanism": "T-cell maturation"},
            "skin": {"direction": "wound_healing", "mechanism": "Collagen synthesis"},
            "pancreas": {"direction": "insulin_storage", "mechanism": "Zinc-insulin complexes"}
        },
        "conditions_sensitive": ["immune_deficiency", "diabetes", "malabsorption"]
    },
    
    # Specific compounds
    "purines": {
        "organs_affected": ["kidneys", "joints"],
        "effects": {
            "kidneys": {"direction": "uric_acid_load", "mechanism": "Uric acid production"},
            "joints": {"direction": "gout_risk", "mechanism": "Urate crystal deposition"}
        },
        "conditions_sensitive": ["gout", "hyperuricemia", "CKD"]
    },
    "oxalates": {
        "organs_affected": ["kidneys"],
        "effects": {
            "kidneys": {"direction": "stone_risk", "mechanism": "Calcium oxalate precipitation"}
        },
        "conditions_sensitive": ["kidney_stones", "hyperoxaluria"]
    },
    "caffeine": {
        "organs_affected": ["heart", "brain", "kidneys", "adrenal"],
        "effects": {
            "heart": {"direction": "stimulation", "mechanism": "Heart rate and contractility increase"},
            "brain": {"direction": "alertness", "mechanism": "Adenosine receptor antagonism"},
            "kidneys": {"direction": "diuretic", "mechanism": "Increased GFR and urine output"}
        },
        "conditions_sensitive": ["arrhythmias", "anxiety", "hypertension", "pregnancy"]
    }
}

# Glycemic Index categories
GLYCEMIC_CATEGORIES = {
    "low": {"range": [0, 55], "effect": "Minimal glucose spike, slow absorption"},
    "medium": {"range": [56, 69], "effect": "Moderate glucose response"},
    "high": {"range": [70, 100], "effect": "Rapid glucose spike, insulin demand"}
}

# Medical condition food constraints
CONDITION_FOOD_CONSTRAINTS = {
    "diabetes": {
        "hard_constraints": ["limit_sugar", "limit_refined_carbs"],
        "soft_constraints": ["prefer_low_gi", "distribute_carbs"],
        "targets": {"carbohydrates": {"max_per_meal": 45, "unit": "g"}, "fiber": {"min_daily": 25, "unit": "g"}},
        "key_nutrients": ["carbohydrates", "fiber", "sugar"]
    },
    "hypertension": {
        "hard_constraints": ["sodium_restriction"],
        "soft_constraints": ["increase_potassium", "dash_diet"],
        "targets": {"sodium": {"max_daily": 1500, "unit": "mg"}, "potassium": {"min_daily": 4700, "unit": "mg"}},
        "key_nutrients": ["sodium", "potassium", "magnesium"]
    },
    "CKD": {
        "hard_constraints": ["potassium_restriction", "phosphorus_restriction", "protein_moderation"],
        "soft_constraints": ["fluid_restriction", "sodium_restriction"],
        "targets": {
            "potassium": {"max_daily": 2000, "unit": "mg"},
            "phosphorus": {"max_daily": 800, "unit": "mg"},
            "protein": {"range": [0.6, 0.8], "unit": "g/kg/day"}
        },
        "key_nutrients": ["potassium", "phosphorus", "sodium", "protein"]
    },
    "heart_failure": {
        "hard_constraints": ["sodium_restriction", "fluid_restriction"],
        "soft_constraints": ["limit_saturated_fat"],
        "targets": {"sodium": {"max_daily": 2000, "unit": "mg"}, "fluid": {"max_daily": 1500, "unit": "mL"}},
        "key_nutrients": ["sodium", "potassium", "fluid"]
    },
    "gout": {
        "hard_constraints": ["purine_restriction"],
        "soft_constraints": ["limit_alcohol", "limit_fructose"],
        "targets": {"purines": {"max_daily": 400, "unit": "mg"}},
        "key_nutrients": ["purines", "fructose"]
    },
    "celiac_disease": {
        "hard_constraints": ["gluten_free"],
        "soft_constraints": [],
        "targets": {},
        "key_nutrients": ["gluten"]
    },
    "liver_cirrhosis": {
        "hard_constraints": ["sodium_restriction", "protein_moderation"],
        "soft_constraints": ["limit_alcohol_absolute"],
        "targets": {"sodium": {"max_daily": 2000, "unit": "mg"}, "protein": {"range": [1.0, 1.5], "unit": "g/kg/day"}},
        "key_nutrients": ["sodium", "protein", "vitamin_k"]
    }
}

# Sample food database with comprehensive nutrient profiles
SAMPLE_FOODS_DATABASE = [
    {
        "id": "food_001",
        "name": "Banana",
        "category": "fruit",
        "serving_size": 118,
        "serving_unit": "g",
        "description": "Medium banana, raw",
        "nutrients": {
            "calories": {"value": 105, "unit": "kcal"},
            "protein": {"value": 1.3, "unit": "g"},
            "carbohydrates": {"value": 27, "unit": "g"},
            "fiber": {"value": 3.1, "unit": "g"},
            "sugar": {"value": 14, "unit": "g"},
            "fat": {"value": 0.4, "unit": "g"},
            "potassium": {"value": 422, "unit": "mg"},
            "magnesium": {"value": 32, "unit": "mg"},
            "vitamin_b6": {"value": 0.4, "unit": "mg"},
            "vitamin_c": {"value": 10.3, "unit": "mg"},
            "sodium": {"value": 1, "unit": "mg"},
            "phosphorus": {"value": 26, "unit": "mg"}
        },
        "glycemic_index": 51,
        "glycemic_category": "low",
        "compounds": ["dopamine", "serotonin_precursors", "resistant_starch"],
        "allergens": [],
        "medical_considerations": {
            "beneficial_for": ["hypertension", "muscle_cramps", "constipation"],
            "caution_for": ["CKD", "hyperkalemia", "diabetes"],
            "contraindicated_for": []
        },
        "organ_effects": {
            "heart": {"effect": "beneficial", "mechanism": "Potassium supports cardiac rhythm"},
            "kidneys": {"effect": "caution", "mechanism": "High potassium load in renal impairment"},
            "intestines": {"effect": "beneficial", "mechanism": "Fiber supports gut motility"},
            "pancreas": {"effect": "moderate", "mechanism": "Medium glycemic load"}
        },
        "source": "USDA FDC"
    },
    {
        "id": "food_002",
        "name": "Salmon (Atlantic, cooked)",
        "category": "protein",
        "serving_size": 100,
        "serving_unit": "g",
        "description": "Atlantic salmon, cooked, dry heat",
        "nutrients": {
            "calories": {"value": 208, "unit": "kcal"},
            "protein": {"value": 20, "unit": "g"},
            "carbohydrates": {"value": 0, "unit": "g"},
            "fat": {"value": 13, "unit": "g"},
            "saturated_fat": {"value": 3.1, "unit": "g"},
            "omega_3": {"value": 2260, "unit": "mg"},
            "potassium": {"value": 363, "unit": "mg"},
            "phosphorus": {"value": 252, "unit": "mg"},
            "sodium": {"value": 59, "unit": "mg"},
            "vitamin_d": {"value": 526, "unit": "IU"},
            "vitamin_b12": {"value": 2.8, "unit": "mcg"},
            "selenium": {"value": 36.5, "unit": "mcg"}
        },
        "glycemic_index": 0,
        "glycemic_category": "none",
        "compounds": ["EPA", "DHA", "astaxanthin"],
        "allergens": ["fish"],
        "medical_considerations": {
            "beneficial_for": ["cardiovascular_disease", "inflammation", "brain_health"],
            "caution_for": ["CKD", "hyperphosphatemia", "anticoagulation"],
            "contraindicated_for": ["fish_allergy"]
        },
        "organ_effects": {
            "heart": {"effect": "beneficial", "mechanism": "Omega-3 reduces inflammation and triglycerides"},
            "brain": {"effect": "beneficial", "mechanism": "DHA supports neuronal membrane integrity"},
            "kidneys": {"effect": "caution", "mechanism": "Phosphorus load in renal impairment"},
            "blood_vessels": {"effect": "beneficial", "mechanism": "Anti-inflammatory, antiplatelet effects"}
        },
        "source": "USDA FDC"
    },
    {
        "id": "food_003",
        "name": "Spinach (raw)",
        "category": "vegetable",
        "serving_size": 100,
        "serving_unit": "g",
        "description": "Raw spinach leaves",
        "nutrients": {
            "calories": {"value": 23, "unit": "kcal"},
            "protein": {"value": 2.9, "unit": "g"},
            "carbohydrates": {"value": 3.6, "unit": "g"},
            "fiber": {"value": 2.2, "unit": "g"},
            "fat": {"value": 0.4, "unit": "g"},
            "potassium": {"value": 558, "unit": "mg"},
            "magnesium": {"value": 79, "unit": "mg"},
            "iron": {"value": 2.7, "unit": "mg"},
            "calcium": {"value": 99, "unit": "mg"},
            "vitamin_a": {"value": 9377, "unit": "IU"},
            "vitamin_k": {"value": 483, "unit": "mcg"},
            "folate": {"value": 194, "unit": "mcg"},
            "vitamin_c": {"value": 28, "unit": "mg"},
            "oxalates": {"value": 970, "unit": "mg"}
        },
        "glycemic_index": 15,
        "glycemic_category": "low",
        "compounds": ["lutein", "zeaxanthin", "nitrates", "oxalic_acid"],
        "allergens": [],
        "medical_considerations": {
            "beneficial_for": ["anemia", "bone_health", "eye_health"],
            "caution_for": ["kidney_stones", "anticoagulation", "CKD"],
            "contraindicated_for": []
        },
        "organ_effects": {
            "eyes": {"effect": "beneficial", "mechanism": "Lutein and zeaxanthin protect retina"},
            "blood": {"effect": "beneficial", "mechanism": "Iron and folate support erythropoiesis"},
            "kidneys": {"effect": "caution", "mechanism": "High oxalate content, stone risk"},
            "liver": {"effect": "caution_warfarin", "mechanism": "High vitamin K affects anticoagulation"}
        },
        "source": "USDA FDC"
    },
    {
        "id": "food_004", 
        "name": "White Rice (cooked)",
        "category": "grain",
        "serving_size": 158,
        "serving_unit": "g",
        "description": "White rice, medium-grain, cooked",
        "nutrients": {
            "calories": {"value": 242, "unit": "kcal"},
            "protein": {"value": 4.4, "unit": "g"},
            "carbohydrates": {"value": 53, "unit": "g"},
            "fiber": {"value": 0.6, "unit": "g"},
            "sugar": {"value": 0, "unit": "g"},
            "fat": {"value": 0.4, "unit": "g"},
            "sodium": {"value": 0, "unit": "mg"},
            "potassium": {"value": 55, "unit": "mg"},
            "phosphorus": {"value": 68, "unit": "mg"},
            "iron": {"value": 2.8, "unit": "mg"}
        },
        "glycemic_index": 73,
        "glycemic_category": "high",
        "compounds": [],
        "allergens": [],
        "medical_considerations": {
            "beneficial_for": ["CKD_low_potassium"],
            "caution_for": ["diabetes", "insulin_resistance"],
            "contraindicated_for": []
        },
        "organ_effects": {
            "pancreas": {"effect": "high_demand", "mechanism": "High glycemic index causes insulin spike"},
            "kidneys": {"effect": "favorable", "mechanism": "Low potassium and phosphorus"},
            "liver": {"effect": "glycogen_storage", "mechanism": "Rapid glucose absorption"}
        },
        "source": "USDA FDC"
    },
    {
        "id": "food_005",
        "name": "Egg (whole, cooked)",
        "category": "protein",
        "serving_size": 50,
        "serving_unit": "g",
        "description": "Whole egg, hard-boiled",
        "nutrients": {
            "calories": {"value": 78, "unit": "kcal"},
            "protein": {"value": 6.3, "unit": "g"},
            "carbohydrates": {"value": 0.6, "unit": "g"},
            "fat": {"value": 5.3, "unit": "g"},
            "cholesterol": {"value": 186, "unit": "mg"},
            "sodium": {"value": 62, "unit": "mg"},
            "potassium": {"value": 63, "unit": "mg"},
            "phosphorus": {"value": 86, "unit": "mg"},
            "vitamin_d": {"value": 44, "unit": "IU"},
            "vitamin_b12": {"value": 0.6, "unit": "mcg"},
            "choline": {"value": 147, "unit": "mg"},
            "selenium": {"value": 15.4, "unit": "mcg"}
        },
        "glycemic_index": 0,
        "glycemic_category": "none",
        "compounds": ["choline", "lutein", "zeaxanthin"],
        "allergens": ["egg"],
        "medical_considerations": {
            "beneficial_for": ["protein_needs", "brain_health", "muscle_building"],
            "caution_for": ["CKD", "hyperlipidemia"],
            "contraindicated_for": ["egg_allergy"]
        },
        "organ_effects": {
            "brain": {"effect": "beneficial", "mechanism": "Choline supports neurotransmitter synthesis"},
            "liver": {"effect": "beneficial", "mechanism": "Choline prevents fatty liver"},
            "muscles": {"effect": "beneficial", "mechanism": "Complete protein for muscle synthesis"},
            "kidneys": {"effect": "moderate", "mechanism": "Moderate phosphorus content"}
        },
        "source": "USDA FDC"
    }
]

logger = logging.getLogger(__name__)
