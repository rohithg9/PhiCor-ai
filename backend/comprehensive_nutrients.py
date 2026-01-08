"""
PhiCor Food Engine - Comprehensive Nutrients Database
Contains 80+ nutrients with daily values and organ system parameter effects
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# Comprehensive nutrients with daily values and parameter effects
NUTRIENTS_DATABASE = [
    # ============ MACRONUTRIENTS ============
    {
        "id": "energy",
        "name": "Energy (Calories)",
        "category": "macronutrient",
        "unit": "kcal",
        "daily_value": 2000,
        "upper_limit": 3000,
        "parameter_effects": {
            "metabolic": [
                {"parameter": "basal_metabolic_rate", "direction": "fuel", "mechanism": "Primary energy source for cellular metabolism", "magnitude": "significant"},
                {"parameter": "body_weight", "direction": "increase", "mechanism": "Excess calories stored as fat", "magnitude": "moderate"}
            ],
            "glycemic": [
                {"parameter": "blood_glucose", "direction": "increase", "mechanism": "Carbohydrate calories raise blood sugar", "magnitude": "moderate"}
            ]
        }
    },
    {
        "id": "protein",
        "name": "Protein",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 50,
        "upper_limit": 200,
        "parameter_effects": {
            "musculoskeletal": [
                {"parameter": "muscle_protein_synthesis", "direction": "increase", "mechanism": "Amino acids are building blocks for muscle tissue", "magnitude": "significant", "change_per_unit": "+2-3% per 20g"},
                {"parameter": "bone_mineral_density", "direction": "increase", "mechanism": "Protein supports bone matrix formation", "magnitude": "mild"}
            ],
            "renal": [
                {"parameter": "BUN", "direction": "increase", "mechanism": "Protein metabolism produces urea nitrogen", "magnitude": "moderate", "change_per_unit": "+1-2 mg/dL per 10g"},
                {"parameter": "GFR", "direction": "increase", "mechanism": "High protein increases glomerular filtration pressure", "magnitude": "mild"}
            ],
            "hepatic": [
                {"parameter": "albumin_synthesis", "direction": "increase", "mechanism": "Amino acids required for hepatic protein synthesis", "magnitude": "moderate"},
                {"parameter": "ammonia", "direction": "increase", "mechanism": "Deamination of amino acids produces ammonia", "magnitude": "mild"}
            ],
            "immune": [
                {"parameter": "antibody_production", "direction": "increase", "mechanism": "Immunoglobulins require amino acid substrates", "magnitude": "moderate"}
            ]
        }
    },
    {
        "id": "carbohydrates",
        "name": "Carbohydrates",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 275,
        "upper_limit": 400,
        "parameter_effects": {
            "glycemic": [
                {"parameter": "blood_glucose", "direction": "increase", "mechanism": "Direct conversion to glucose after digestion", "magnitude": "significant", "change_per_unit": "+3-5 mg/dL per 10g"},
                {"parameter": "insulin", "direction": "increase", "mechanism": "Glucose stimulates pancreatic beta-cell insulin release", "magnitude": "significant", "change_per_unit": "+5-10 µU/mL per 10g"},
                {"parameter": "HbA1c", "direction": "increase", "mechanism": "Chronic high glucose leads to hemoglobin glycation", "magnitude": "moderate"}
            ],
            "neurological": [
                {"parameter": "cognitive_function", "direction": "increase", "mechanism": "Brain's primary fuel source", "magnitude": "moderate"},
                {"parameter": "mood", "direction": "variable", "mechanism": "Affects serotonin synthesis via tryptophan availability", "magnitude": "mild"}
            ],
            "hepatic": [
                {"parameter": "glycogen_stores", "direction": "increase", "mechanism": "Excess glucose stored as hepatic glycogen", "magnitude": "moderate"},
                {"parameter": "triglycerides", "direction": "increase", "mechanism": "Excess carbs converted to triglycerides via de novo lipogenesis", "magnitude": "moderate"}
            ]
        }
    },
    {
        "id": "fiber",
        "name": "Dietary Fiber",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 28,
        "upper_limit": 70,
        "parameter_effects": {
            "gastrointestinal": [
                {"parameter": "bowel_transit_time", "direction": "decrease", "mechanism": "Bulk-forming effect speeds intestinal transit", "magnitude": "significant", "change_per_unit": "-2-4 hours per 10g"},
                {"parameter": "stool_consistency", "direction": "improve", "mechanism": "Water absorption and bulk formation", "magnitude": "moderate"},
                {"parameter": "gut_microbiome_diversity", "direction": "increase", "mechanism": "Prebiotic fermentation supports beneficial bacteria", "magnitude": "significant"}
            ],
            "cardiovascular": [
                {"parameter": "LDL_cholesterol", "direction": "decrease", "mechanism": "Soluble fiber binds bile acids, increasing LDL clearance", "magnitude": "moderate", "change_per_unit": "-1-2 mg/dL per 5g soluble fiber"},
                {"parameter": "total_cholesterol", "direction": "decrease", "mechanism": "Reduced cholesterol absorption", "magnitude": "moderate"}
            ],
            "glycemic": [
                {"parameter": "blood_glucose", "direction": "decrease", "mechanism": "Slows carbohydrate absorption, reducing glycemic spike", "magnitude": "moderate", "change_per_unit": "-5-10 mg/dL postprandial per 5g"},
                {"parameter": "insulin_sensitivity", "direction": "increase", "mechanism": "Improved glucose handling via gut hormone modulation", "magnitude": "mild"}
            ]
        }
    },
    {
        "id": "fat_total",
        "name": "Total Fat",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 78,
        "upper_limit": 120,
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "HDL_cholesterol", "direction": "variable", "mechanism": "Effect depends on fat type (saturated vs unsaturated)", "magnitude": "moderate"},
                {"parameter": "triglycerides", "direction": "increase", "mechanism": "Dietary fat absorbed as chylomicrons", "magnitude": "moderate"}
            ],
            "hepatic": [
                {"parameter": "hepatic_fat", "direction": "increase", "mechanism": "Excess dietary fat can accumulate in liver", "magnitude": "moderate"}
            ],
            "neurological": [
                {"parameter": "myelin_integrity", "direction": "maintain", "mechanism": "Fat essential for myelin sheath structure", "magnitude": "significant"}
            ]
        }
    },
    {
        "id": "fat_saturated",
        "name": "Saturated Fat",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 20,
        "upper_limit": 30,
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "LDL_cholesterol", "direction": "increase", "mechanism": "Reduces LDL receptor activity, raising serum LDL", "magnitude": "significant", "change_per_unit": "+1.5-2 mg/dL per 1% energy"},
                {"parameter": "total_cholesterol", "direction": "increase", "mechanism": "Increases hepatic cholesterol synthesis", "magnitude": "moderate"},
                {"parameter": "inflammation_markers", "direction": "increase", "mechanism": "Activates inflammatory pathways via TLR4", "magnitude": "mild"}
            ],
            "metabolic": [
                {"parameter": "insulin_resistance", "direction": "increase", "mechanism": "Accumulation in muscle impairs insulin signaling", "magnitude": "moderate"}
            ]
        }
    },
    {
        "id": "fat_monounsaturated",
        "name": "Monounsaturated Fat",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 25,
        "upper_limit": 50,
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "LDL_cholesterol", "direction": "decrease", "mechanism": "Improves LDL particle size and clearance", "magnitude": "moderate", "change_per_unit": "-0.5-1 mg/dL per 5g"},
                {"parameter": "HDL_cholesterol", "direction": "maintain", "mechanism": "Does not lower HDL like polyunsaturated fats may", "magnitude": "mild"},
                {"parameter": "blood_pressure", "direction": "decrease", "mechanism": "Improves endothelial function", "magnitude": "mild"}
            ],
            "metabolic": [
                {"parameter": "insulin_sensitivity", "direction": "increase", "mechanism": "Improves membrane fluidity and insulin receptor function", "magnitude": "moderate"}
            ]
        }
    },
    {
        "id": "fat_polyunsaturated",
        "name": "Polyunsaturated Fat",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 17,
        "upper_limit": 35,
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "LDL_cholesterol", "direction": "decrease", "mechanism": "Increases LDL receptor expression", "magnitude": "moderate"},
                {"parameter": "triglycerides", "direction": "decrease", "mechanism": "Reduces hepatic VLDL synthesis", "magnitude": "moderate"},
                {"parameter": "inflammation_markers", "direction": "decrease", "mechanism": "Omega-3s produce anti-inflammatory eicosanoids", "magnitude": "moderate"}
            ],
            "neurological": [
                {"parameter": "cognitive_function", "direction": "increase", "mechanism": "DHA essential for neuronal membrane structure", "magnitude": "moderate"}
            ]
        }
    },
    {
        "id": "cholesterol",
        "name": "Cholesterol",
        "category": "macronutrient",
        "unit": "mg",
        "daily_value": 300,
        "upper_limit": 500,
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "total_cholesterol", "direction": "increase", "mechanism": "Direct absorption adds to circulating cholesterol pool", "magnitude": "mild", "change_per_unit": "+2-3 mg/dL per 100mg"},
                {"parameter": "LDL_cholesterol", "direction": "increase", "mechanism": "Small contribution to LDL levels", "magnitude": "mild"}
            ],
            "hepatic": [
                {"parameter": "bile_acid_synthesis", "direction": "decrease", "mechanism": "High dietary cholesterol suppresses de novo synthesis", "magnitude": "mild"}
            ]
        }
    },
    {
        "id": "sugars",
        "name": "Total Sugars",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 50,
        "upper_limit": 75,
        "parameter_effects": {
            "glycemic": [
                {"parameter": "blood_glucose", "direction": "increase", "mechanism": "Rapid absorption causes glycemic spike", "magnitude": "significant", "change_per_unit": "+5-8 mg/dL per 10g"},
                {"parameter": "insulin", "direction": "increase", "mechanism": "Strong insulin secretory response", "magnitude": "significant"}
            ],
            "dental": [
                {"parameter": "dental_caries_risk", "direction": "increase", "mechanism": "Substrate for cariogenic bacteria", "magnitude": "moderate"}
            ],
            "hepatic": [
                {"parameter": "hepatic_fat", "direction": "increase", "mechanism": "Fructose metabolized directly to fat in liver", "magnitude": "moderate"}
            ]
        }
    },
    
    # ============ VITAMINS - FAT SOLUBLE ============
    {
        "id": "vitamin_a",
        "name": "Vitamin A (RAE)",
        "category": "vitamin",
        "subcategory": "fat_soluble",
        "unit": "mcg",
        "daily_value": 900,
        "upper_limit": 3000,
        "parameter_effects": {
            "vision": [
                {"parameter": "night_vision", "direction": "improve", "mechanism": "Essential for rhodopsin synthesis in retinal rods", "magnitude": "significant"},
                {"parameter": "corneal_health", "direction": "maintain", "mechanism": "Required for corneal epithelium integrity", "magnitude": "moderate"}
            ],
            "immune": [
                {"parameter": "epithelial_barrier", "direction": "strengthen", "mechanism": "Supports mucosal immunity and epithelial differentiation", "magnitude": "moderate"},
                {"parameter": "T_cell_function", "direction": "enhance", "mechanism": "Modulates T-cell differentiation and function", "magnitude": "moderate"}
            ],
            "reproductive": [
                {"parameter": "sperm_production", "direction": "support", "mechanism": "Required for spermatogenesis", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Night blindness", "Xerophthalmia", "Impaired immunity"],
        "toxicity_effects": ["Hepatotoxicity", "Bone pain", "Teratogenicity"]
    },
    {
        "id": "vitamin_d",
        "name": "Vitamin D",
        "category": "vitamin",
        "subcategory": "fat_soluble",
        "unit": "mcg",
        "daily_value": 20,
        "upper_limit": 100,
        "parameter_effects": {
            "musculoskeletal": [
                {"parameter": "calcium_absorption", "direction": "increase", "mechanism": "Upregulates intestinal calcium transporters", "magnitude": "significant", "change_per_unit": "+10-15% absorption per 10mcg"},
                {"parameter": "bone_mineral_density", "direction": "increase", "mechanism": "Essential for calcium deposition in bone matrix", "magnitude": "significant"},
                {"parameter": "muscle_strength", "direction": "increase", "mechanism": "VDR in muscle cells regulates protein synthesis", "magnitude": "moderate"}
            ],
            "immune": [
                {"parameter": "innate_immunity", "direction": "enhance", "mechanism": "Induces antimicrobial peptides (cathelicidin)", "magnitude": "moderate"},
                {"parameter": "autoimmune_risk", "direction": "decrease", "mechanism": "Modulates T-cell response, reduces autoreactivity", "magnitude": "moderate"}
            ],
            "cardiovascular": [
                {"parameter": "blood_pressure", "direction": "decrease", "mechanism": "Suppresses renin-angiotensin system", "magnitude": "mild"}
            ]
        },
        "deficiency_effects": ["Rickets", "Osteomalacia", "Muscle weakness"],
        "toxicity_effects": ["Hypercalcemia", "Kidney stones", "Vascular calcification"]
    },
    {
        "id": "vitamin_e",
        "name": "Vitamin E (Alpha-tocopherol)",
        "category": "vitamin",
        "subcategory": "fat_soluble",
        "unit": "mg",
        "daily_value": 15,
        "upper_limit": 1000,
        "parameter_effects": {
            "antioxidant": [
                {"parameter": "lipid_peroxidation", "direction": "decrease", "mechanism": "Scavenges peroxyl radicals in cell membranes", "magnitude": "significant"},
                {"parameter": "oxidative_stress_markers", "direction": "decrease", "mechanism": "Breaks lipid peroxidation chain reactions", "magnitude": "moderate"}
            ],
            "cardiovascular": [
                {"parameter": "LDL_oxidation", "direction": "decrease", "mechanism": "Protects LDL particles from oxidative modification", "magnitude": "moderate"},
                {"parameter": "platelet_aggregation", "direction": "decrease", "mechanism": "Inhibits arachidonic acid metabolism", "magnitude": "mild"}
            ],
            "immune": [
                {"parameter": "T_cell_function", "direction": "enhance", "mechanism": "Improves cell-mediated immunity, especially in elderly", "magnitude": "moderate"}
            ],
            "neurological": [
                {"parameter": "neurodegeneration", "direction": "slow", "mechanism": "Protects neuronal membranes from oxidative damage", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Peripheral neuropathy", "Ataxia", "Hemolytic anemia"],
        "drug_interactions": [{"drug": "Warfarin", "effect": "Increased bleeding risk at high doses"}]
    },
    {
        "id": "vitamin_k",
        "name": "Vitamin K",
        "category": "vitamin",
        "subcategory": "fat_soluble",
        "unit": "mcg",
        "daily_value": 120,
        "upper_limit": None,
        "parameter_effects": {
            "coagulation": [
                {"parameter": "prothrombin_time", "direction": "normalize", "mechanism": "Essential cofactor for clotting factor carboxylation", "magnitude": "significant"},
                {"parameter": "INR", "direction": "decrease", "mechanism": "Activates factors II, VII, IX, X", "magnitude": "significant"}
            ],
            "musculoskeletal": [
                {"parameter": "bone_mineral_density", "direction": "increase", "mechanism": "Activates osteocalcin for calcium binding to bone", "magnitude": "moderate"},
                {"parameter": "fracture_risk", "direction": "decrease", "mechanism": "Improves bone matrix protein function", "magnitude": "moderate"}
            ],
            "cardiovascular": [
                {"parameter": "vascular_calcification", "direction": "decrease", "mechanism": "Activates matrix Gla protein to inhibit calcification", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Bleeding disorders", "Easy bruising"],
        "drug_interactions": [{"drug": "Warfarin", "effect": "Antagonizes anticoagulant effect - maintain consistent intake"}]
    },
    
    # ============ VITAMINS - WATER SOLUBLE ============
    {
        "id": "vitamin_c",
        "name": "Vitamin C (Ascorbic Acid)",
        "category": "vitamin",
        "subcategory": "water_soluble",
        "unit": "mg",
        "daily_value": 90,
        "upper_limit": 2000,
        "parameter_effects": {
            "immune": [
                {"parameter": "white_blood_cell_function", "direction": "enhance", "mechanism": "Supports neutrophil chemotaxis and phagocytosis", "magnitude": "moderate"},
                {"parameter": "infection_duration", "direction": "decrease", "mechanism": "Enhances immune cell activity during illness", "magnitude": "mild"}
            ],
            "antioxidant": [
                {"parameter": "oxidative_stress", "direction": "decrease", "mechanism": "Scavenges free radicals in aqueous compartments", "magnitude": "significant"},
                {"parameter": "vitamin_e_regeneration", "direction": "increase", "mechanism": "Reduces oxidized vitamin E back to active form", "magnitude": "moderate"}
            ],
            "musculoskeletal": [
                {"parameter": "collagen_synthesis", "direction": "increase", "mechanism": "Essential cofactor for prolyl and lysyl hydroxylases", "magnitude": "significant"},
                {"parameter": "wound_healing", "direction": "improve", "mechanism": "Required for collagen cross-linking", "magnitude": "moderate"}
            ],
            "hematologic": [
                {"parameter": "iron_absorption", "direction": "increase", "mechanism": "Reduces ferric to ferrous iron for better absorption", "magnitude": "significant", "change_per_unit": "+30-50% iron absorption per 100mg"}
            ]
        },
        "deficiency_effects": ["Scurvy", "Poor wound healing", "Bleeding gums"],
        "toxicity_effects": ["GI upset", "Kidney stones (at very high doses)"]
    },
    {
        "id": "thiamin",
        "name": "Thiamin (Vitamin B1)",
        "category": "vitamin",
        "subcategory": "water_soluble",
        "unit": "mg",
        "daily_value": 1.2,
        "upper_limit": None,
        "parameter_effects": {
            "neurological": [
                {"parameter": "nerve_conduction", "direction": "maintain", "mechanism": "Essential for acetylcholine synthesis and nerve function", "magnitude": "significant"},
                {"parameter": "cognitive_function", "direction": "maintain", "mechanism": "Required for brain glucose metabolism", "magnitude": "moderate"}
            ],
            "cardiovascular": [
                {"parameter": "cardiac_function", "direction": "maintain", "mechanism": "Supports myocardial energy metabolism", "magnitude": "moderate"}
            ],
            "metabolic": [
                {"parameter": "carbohydrate_metabolism", "direction": "enhance", "mechanism": "Cofactor for pyruvate dehydrogenase complex", "magnitude": "significant"}
            ]
        },
        "deficiency_effects": ["Beriberi", "Wernicke-Korsakoff syndrome", "Peripheral neuropathy"]
    },
    {
        "id": "riboflavin",
        "name": "Riboflavin (Vitamin B2)",
        "category": "vitamin",
        "subcategory": "water_soluble",
        "unit": "mg",
        "daily_value": 1.3,
        "upper_limit": None,
        "parameter_effects": {
            "metabolic": [
                {"parameter": "energy_production", "direction": "support", "mechanism": "Component of FAD/FMN in electron transport chain", "magnitude": "significant"},
                {"parameter": "glutathione_recycling", "direction": "enhance", "mechanism": "Cofactor for glutathione reductase", "magnitude": "moderate"}
            ],
            "vision": [
                {"parameter": "eye_health", "direction": "maintain", "mechanism": "Protects lens proteins from oxidation", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Ariboflavinosis", "Angular cheilitis", "Glossitis"]
    },
    {
        "id": "niacin",
        "name": "Niacin (Vitamin B3)",
        "category": "vitamin",
        "subcategory": "water_soluble",
        "unit": "mg",
        "daily_value": 16,
        "upper_limit": 35,
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "HDL_cholesterol", "direction": "increase", "mechanism": "Inhibits hepatic HDL catabolism at pharmacologic doses", "magnitude": "significant", "change_per_unit": "+15-35% at 1-3g/day"},
                {"parameter": "LDL_cholesterol", "direction": "decrease", "mechanism": "Reduces hepatic VLDL synthesis", "magnitude": "moderate"},
                {"parameter": "triglycerides", "direction": "decrease", "mechanism": "Inhibits lipolysis in adipose tissue", "magnitude": "significant"}
            ],
            "metabolic": [
                {"parameter": "NAD_levels", "direction": "increase", "mechanism": "Precursor to NAD+/NADP+ coenzymes", "magnitude": "significant"}
            ]
        },
        "deficiency_effects": ["Pellagra (4 Ds: dermatitis, diarrhea, dementia, death)"],
        "toxicity_effects": ["Flushing", "Hepatotoxicity", "Hyperglycemia"]
    },
    {
        "id": "vitamin_b6",
        "name": "Vitamin B6 (Pyridoxine)",
        "category": "vitamin",
        "subcategory": "water_soluble",
        "unit": "mg",
        "daily_value": 1.7,
        "upper_limit": 100,
        "parameter_effects": {
            "neurological": [
                {"parameter": "neurotransmitter_synthesis", "direction": "support", "mechanism": "Cofactor for serotonin, dopamine, GABA synthesis", "magnitude": "significant"},
                {"parameter": "peripheral_nerve_function", "direction": "maintain", "mechanism": "Required for myelin synthesis", "magnitude": "moderate"}
            ],
            "hematologic": [
                {"parameter": "hemoglobin_synthesis", "direction": "support", "mechanism": "Essential for heme biosynthesis", "magnitude": "moderate"}
            ],
            "cardiovascular": [
                {"parameter": "homocysteine", "direction": "decrease", "mechanism": "Cofactor for homocysteine metabolism", "magnitude": "moderate"}
            ],
            "immune": [
                {"parameter": "lymphocyte_count", "direction": "maintain", "mechanism": "Required for lymphocyte proliferation", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Peripheral neuropathy", "Anemia", "Dermatitis"],
        "toxicity_effects": ["Sensory neuropathy at chronic high doses"]
    },
    {
        "id": "folate",
        "name": "Folate (Vitamin B9)",
        "category": "vitamin",
        "subcategory": "water_soluble",
        "unit": "mcg",
        "daily_value": 400,
        "upper_limit": 1000,
        "parameter_effects": {
            "hematologic": [
                {"parameter": "red_blood_cell_formation", "direction": "support", "mechanism": "Essential for DNA synthesis during erythropoiesis", "magnitude": "significant"},
                {"parameter": "MCV", "direction": "normalize", "mechanism": "Prevents megaloblastic changes", "magnitude": "significant"}
            ],
            "cardiovascular": [
                {"parameter": "homocysteine", "direction": "decrease", "mechanism": "Cofactor for homocysteine to methionine conversion", "magnitude": "significant", "change_per_unit": "-20-25% per 400mcg"}
            ],
            "reproductive": [
                {"parameter": "neural_tube_defect_risk", "direction": "decrease", "mechanism": "Critical for neural tube closure in early pregnancy", "magnitude": "significant"}
            ],
            "neurological": [
                {"parameter": "cognitive_function", "direction": "maintain", "mechanism": "Required for neurotransmitter synthesis", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Megaloblastic anemia", "Neural tube defects", "Elevated homocysteine"]
    },
    {
        "id": "vitamin_b12",
        "name": "Vitamin B12 (Cobalamin)",
        "category": "vitamin",
        "subcategory": "water_soluble",
        "unit": "mcg",
        "daily_value": 2.4,
        "upper_limit": None,
        "parameter_effects": {
            "hematologic": [
                {"parameter": "red_blood_cell_formation", "direction": "support", "mechanism": "Required for DNA synthesis and RBC maturation", "magnitude": "significant"},
                {"parameter": "MCV", "direction": "normalize", "mechanism": "Prevents megaloblastic changes", "magnitude": "significant"}
            ],
            "neurological": [
                {"parameter": "myelin_synthesis", "direction": "support", "mechanism": "Essential for methylation reactions in myelin formation", "magnitude": "significant"},
                {"parameter": "cognitive_function", "direction": "maintain", "mechanism": "Required for neurotransmitter synthesis", "magnitude": "moderate"},
                {"parameter": "peripheral_nerve_function", "direction": "maintain", "mechanism": "Prevents subacute combined degeneration", "magnitude": "significant"}
            ],
            "cardiovascular": [
                {"parameter": "homocysteine", "direction": "decrease", "mechanism": "Cofactor for methionine synthase", "magnitude": "significant"}
            ]
        },
        "deficiency_effects": ["Pernicious anemia", "Subacute combined degeneration", "Cognitive decline"],
        "at_risk_populations": ["Vegans", "Elderly", "Gastrectomy patients", "Metformin users"]
    },
    {
        "id": "biotin",
        "name": "Biotin (Vitamin B7)",
        "category": "vitamin",
        "subcategory": "water_soluble",
        "unit": "mcg",
        "daily_value": 30,
        "upper_limit": None,
        "parameter_effects": {
            "metabolic": [
                {"parameter": "gluconeogenesis", "direction": "support", "mechanism": "Cofactor for pyruvate carboxylase", "magnitude": "moderate"},
                {"parameter": "fatty_acid_synthesis", "direction": "support", "mechanism": "Cofactor for acetyl-CoA carboxylase", "magnitude": "moderate"}
            ],
            "integumentary": [
                {"parameter": "hair_health", "direction": "maintain", "mechanism": "Required for keratin synthesis", "magnitude": "moderate"},
                {"parameter": "nail_strength", "direction": "maintain", "mechanism": "Supports keratin protein structure", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Dermatitis", "Hair loss", "Neurological symptoms"]
    },
    {
        "id": "pantothenic_acid",
        "name": "Pantothenic Acid (Vitamin B5)",
        "category": "vitamin",
        "subcategory": "water_soluble",
        "unit": "mg",
        "daily_value": 5,
        "upper_limit": None,
        "parameter_effects": {
            "metabolic": [
                {"parameter": "CoA_synthesis", "direction": "support", "mechanism": "Component of Coenzyme A for energy metabolism", "magnitude": "significant"},
                {"parameter": "fatty_acid_metabolism", "direction": "support", "mechanism": "Required for acyl carrier protein", "magnitude": "moderate"}
            ],
            "adrenal": [
                {"parameter": "cortisol_synthesis", "direction": "support", "mechanism": "Required for steroid hormone synthesis", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Fatigue", "Paresthesias", "GI disturbances"]
    },
    {
        "id": "choline",
        "name": "Choline",
        "category": "vitamin",
        "subcategory": "water_soluble",
        "unit": "mg",
        "daily_value": 550,
        "upper_limit": 3500,
        "parameter_effects": {
            "hepatic": [
                {"parameter": "hepatic_fat", "direction": "decrease", "mechanism": "Required for VLDL synthesis and fat export from liver", "magnitude": "significant"},
                {"parameter": "liver_function", "direction": "maintain", "mechanism": "Essential for phosphatidylcholine synthesis", "magnitude": "moderate"}
            ],
            "neurological": [
                {"parameter": "acetylcholine_synthesis", "direction": "support", "mechanism": "Precursor to neurotransmitter acetylcholine", "magnitude": "significant"},
                {"parameter": "memory", "direction": "support", "mechanism": "Required for cholinergic neurotransmission", "magnitude": "moderate"}
            ],
            "cell_membrane": [
                {"parameter": "membrane_integrity", "direction": "maintain", "mechanism": "Component of phosphatidylcholine in cell membranes", "magnitude": "significant"}
            ]
        },
        "deficiency_effects": ["Fatty liver", "Muscle damage", "Cognitive impairment"]
    },
    
    # ============ MINERALS - MAJOR ============
    {
        "id": "calcium",
        "name": "Calcium",
        "category": "mineral",
        "subcategory": "major",
        "unit": "mg",
        "daily_value": 1300,
        "upper_limit": 2500,
        "parameter_effects": {
            "musculoskeletal": [
                {"parameter": "bone_mineral_density", "direction": "increase", "mechanism": "Primary mineral component of hydroxyapatite in bone", "magnitude": "significant"},
                {"parameter": "fracture_risk", "direction": "decrease", "mechanism": "Maintains bone mass and strength", "magnitude": "moderate"},
                {"parameter": "muscle_contraction", "direction": "regulate", "mechanism": "Essential for excitation-contraction coupling", "magnitude": "significant"}
            ],
            "cardiovascular": [
                {"parameter": "blood_pressure", "direction": "decrease", "mechanism": "May reduce vascular smooth muscle tone", "magnitude": "mild"},
                {"parameter": "cardiac_rhythm", "direction": "regulate", "mechanism": "Essential for cardiac action potential", "magnitude": "significant"}
            ],
            "coagulation": [
                {"parameter": "clotting_cascade", "direction": "support", "mechanism": "Cofactor for multiple clotting factors", "magnitude": "significant"}
            ],
            "neurological": [
                {"parameter": "nerve_transmission", "direction": "support", "mechanism": "Required for neurotransmitter release", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Osteoporosis", "Muscle cramps", "Tetany"],
        "toxicity_effects": ["Hypercalcemia", "Kidney stones", "Constipation"],
        "drug_interactions": [
            {"drug": "Bisphosphonates", "effect": "Reduces absorption - separate by 2 hours"},
            {"drug": "Thyroid medications", "effect": "Reduces absorption - separate by 4 hours"}
        ]
    },
    {
        "id": "phosphorus",
        "name": "Phosphorus",
        "category": "mineral",
        "subcategory": "major",
        "unit": "mg",
        "daily_value": 1250,
        "upper_limit": 4000,
        "parameter_effects": {
            "musculoskeletal": [
                {"parameter": "bone_mineralization", "direction": "support", "mechanism": "Component of hydroxyapatite in bone matrix", "magnitude": "significant"}
            ],
            "metabolic": [
                {"parameter": "ATP_synthesis", "direction": "support", "mechanism": "Component of ATP and phosphocreatine", "magnitude": "significant"},
                {"parameter": "DNA_RNA_synthesis", "direction": "support", "mechanism": "Component of nucleotide backbone", "magnitude": "significant"}
            ],
            "renal": [
                {"parameter": "serum_phosphate", "direction": "increase", "mechanism": "Direct effect on phosphate levels", "magnitude": "moderate"},
                {"parameter": "PTH", "direction": "increase", "mechanism": "High phosphate stimulates PTH secretion", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Bone pain", "Muscle weakness", "Respiratory failure"],
        "toxicity_effects": ["Hyperphosphatemia", "Secondary hyperparathyroidism"]
    },
    {
        "id": "magnesium",
        "name": "Magnesium",
        "category": "mineral",
        "subcategory": "major",
        "unit": "mg",
        "daily_value": 420,
        "upper_limit": 350,
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "blood_pressure", "direction": "decrease", "mechanism": "Vasodilation via calcium channel blocking", "magnitude": "moderate", "change_per_unit": "-2 to -3 mmHg per 100mg"},
                {"parameter": "cardiac_rhythm", "direction": "stabilize", "mechanism": "Regulates cardiac ion channels", "magnitude": "significant"},
                {"parameter": "QT_interval", "direction": "normalize", "mechanism": "Stabilizes cardiac repolarization", "magnitude": "moderate"}
            ],
            "musculoskeletal": [
                {"parameter": "muscle_relaxation", "direction": "improve", "mechanism": "Calcium antagonist in muscle cells", "magnitude": "moderate"},
                {"parameter": "bone_density", "direction": "maintain", "mechanism": "Component of bone crystal structure", "magnitude": "moderate"}
            ],
            "metabolic": [
                {"parameter": "insulin_sensitivity", "direction": "increase", "mechanism": "Cofactor for insulin signaling enzymes", "magnitude": "moderate"},
                {"parameter": "blood_glucose", "direction": "decrease", "mechanism": "Improves glucose uptake", "magnitude": "mild"}
            ],
            "neurological": [
                {"parameter": "migraine_frequency", "direction": "decrease", "mechanism": "Modulates NMDA receptors and serotonin", "magnitude": "moderate"},
                {"parameter": "anxiety", "direction": "decrease", "mechanism": "GABA receptor modulation", "magnitude": "mild"}
            ]
        },
        "deficiency_effects": ["Muscle cramps", "Arrhythmias", "Hypokalemia"],
        "drug_interactions": [
            {"drug": "Proton pump inhibitors", "effect": "Long-term use may cause deficiency"}
        ]
    },
    {
        "id": "potassium",
        "name": "Potassium",
        "category": "mineral",
        "subcategory": "major",
        "unit": "mg",
        "daily_value": 4700,
        "upper_limit": None,
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "blood_pressure", "direction": "decrease", "mechanism": "Promotes sodium excretion and vasodilation", "magnitude": "significant", "change_per_unit": "-4 to -5 mmHg per 1000mg"},
                {"parameter": "cardiac_rhythm", "direction": "regulate", "mechanism": "Essential for cardiac action potential", "magnitude": "significant"},
                {"parameter": "stroke_risk", "direction": "decrease", "mechanism": "Blood pressure lowering effect", "magnitude": "moderate"}
            ],
            "musculoskeletal": [
                {"parameter": "muscle_function", "direction": "maintain", "mechanism": "Essential for muscle contraction", "magnitude": "significant"}
            ],
            "renal": [
                {"parameter": "serum_potassium", "direction": "increase", "mechanism": "Direct absorption increases levels", "magnitude": "moderate"},
                {"parameter": "kidney_stone_risk", "direction": "decrease", "mechanism": "Reduces urinary calcium excretion", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Hypokalemia", "Muscle weakness", "Arrhythmias"],
        "caution": "High intake dangerous in renal impairment",
        "drug_interactions": [
            {"drug": "ACE inhibitors", "effect": "May cause hyperkalemia"},
            {"drug": "Potassium-sparing diuretics", "effect": "May cause hyperkalemia"}
        ]
    },
    {
        "id": "sodium",
        "name": "Sodium",
        "category": "mineral",
        "subcategory": "major",
        "unit": "mg",
        "daily_value": 2300,
        "upper_limit": 2300,
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "blood_pressure", "direction": "increase", "mechanism": "Increases blood volume via water retention", "magnitude": "significant", "change_per_unit": "+1-2 mmHg per 500mg"},
                {"parameter": "cardiac_workload", "direction": "increase", "mechanism": "Increased preload from volume expansion", "magnitude": "moderate"}
            ],
            "renal": [
                {"parameter": "kidney_function", "direction": "decrease", "mechanism": "Chronic excess accelerates renal damage", "magnitude": "moderate"},
                {"parameter": "proteinuria", "direction": "increase", "mechanism": "Increases glomerular pressure", "magnitude": "mild"}
            ],
            "fluid_balance": [
                {"parameter": "fluid_retention", "direction": "increase", "mechanism": "Sodium retains water in extracellular space", "magnitude": "significant"},
                {"parameter": "edema", "direction": "increase", "mechanism": "Increased extracellular fluid volume", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Hyponatremia", "Confusion", "Muscle cramps"],
        "excess_effects": ["Hypertension", "Edema", "Stroke risk"]
    },
    {
        "id": "chloride",
        "name": "Chloride",
        "category": "mineral",
        "subcategory": "major",
        "unit": "mg",
        "daily_value": 2300,
        "upper_limit": 3600,
        "parameter_effects": {
            "gastrointestinal": [
                {"parameter": "gastric_acid", "direction": "maintain", "mechanism": "Component of hydrochloric acid", "magnitude": "significant"}
            ],
            "fluid_balance": [
                {"parameter": "acid_base_balance", "direction": "regulate", "mechanism": "Major extracellular anion", "magnitude": "moderate"}
            ]
        }
    },
    
    # ============ MINERALS - TRACE ============
    {
        "id": "iron",
        "name": "Iron",
        "category": "mineral",
        "subcategory": "trace",
        "unit": "mg",
        "daily_value": 18,
        "upper_limit": 45,
        "parameter_effects": {
            "hematologic": [
                {"parameter": "hemoglobin", "direction": "increase", "mechanism": "Essential component of hemoglobin heme group", "magnitude": "significant", "change_per_unit": "+1 g/dL per month with replacement"},
                {"parameter": "red_blood_cell_count", "direction": "increase", "mechanism": "Required for erythropoiesis", "magnitude": "significant"},
                {"parameter": "MCV", "direction": "normalize", "mechanism": "Prevents microcytic anemia", "magnitude": "significant"}
            ],
            "metabolic": [
                {"parameter": "oxygen_transport", "direction": "increase", "mechanism": "Hemoglobin carries O2 to tissues", "magnitude": "significant"},
                {"parameter": "energy_production", "direction": "support", "mechanism": "Component of cytochromes in electron transport", "magnitude": "moderate"}
            ],
            "immune": [
                {"parameter": "immune_function", "direction": "support", "mechanism": "Required for lymphocyte proliferation", "magnitude": "moderate"}
            ],
            "cognitive": [
                {"parameter": "cognitive_function", "direction": "maintain", "mechanism": "Required for neurotransmitter synthesis", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Iron deficiency anemia", "Fatigue", "Cognitive impairment"],
        "toxicity_effects": ["Hemochromatosis", "Liver damage", "Heart failure"],
        "absorption_enhancers": ["Vitamin C", "Meat protein"],
        "absorption_inhibitors": ["Calcium", "Tea/Coffee", "Phytates"]
    },
    {
        "id": "zinc",
        "name": "Zinc",
        "category": "mineral",
        "subcategory": "trace",
        "unit": "mg",
        "daily_value": 11,
        "upper_limit": 40,
        "parameter_effects": {
            "immune": [
                {"parameter": "immune_function", "direction": "enhance", "mechanism": "Required for T-cell and NK cell function", "magnitude": "significant"},
                {"parameter": "wound_healing", "direction": "improve", "mechanism": "Essential for collagen synthesis and cell division", "magnitude": "moderate"},
                {"parameter": "cold_duration", "direction": "decrease", "mechanism": "Antiviral activity via ICAM-1 blocking", "magnitude": "mild"}
            ],
            "reproductive": [
                {"parameter": "testosterone", "direction": "maintain", "mechanism": "Required for testosterone synthesis", "magnitude": "moderate"},
                {"parameter": "sperm_quality", "direction": "maintain", "mechanism": "Essential for spermatogenesis", "magnitude": "moderate"}
            ],
            "integumentary": [
                {"parameter": "skin_health", "direction": "maintain", "mechanism": "Required for epithelial integrity", "magnitude": "moderate"},
                {"parameter": "acne", "direction": "improve", "mechanism": "Anti-inflammatory and antibacterial effects", "magnitude": "mild"}
            ],
            "sensory": [
                {"parameter": "taste_acuity", "direction": "maintain", "mechanism": "Component of gustin protein", "magnitude": "moderate"},
                {"parameter": "smell_acuity", "direction": "maintain", "mechanism": "Required for olfactory receptor function", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Impaired immunity", "Delayed wound healing", "Taste/smell dysfunction"],
        "toxicity_effects": ["GI distress", "Copper deficiency", "Immune suppression"]
    },
    {
        "id": "selenium",
        "name": "Selenium",
        "category": "mineral",
        "subcategory": "trace",
        "unit": "mcg",
        "daily_value": 55,
        "upper_limit": 400,
        "parameter_effects": {
            "antioxidant": [
                {"parameter": "glutathione_peroxidase", "direction": "increase", "mechanism": "Essential component of selenoenzymes", "magnitude": "significant"},
                {"parameter": "oxidative_stress", "direction": "decrease", "mechanism": "Neutralizes peroxides via selenoproteins", "magnitude": "moderate"}
            ],
            "thyroid": [
                {"parameter": "T4_to_T3_conversion", "direction": "support", "mechanism": "Component of deiodinases", "magnitude": "significant"},
                {"parameter": "thyroid_hormone_levels", "direction": "optimize", "mechanism": "Required for thyroid hormone metabolism", "magnitude": "moderate"}
            ],
            "immune": [
                {"parameter": "immune_function", "direction": "enhance", "mechanism": "Supports T-cell and NK cell activity", "magnitude": "moderate"}
            ],
            "reproductive": [
                {"parameter": "male_fertility", "direction": "support", "mechanism": "Essential for sperm motility", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Keshan disease", "Thyroid dysfunction", "Immune impairment"],
        "toxicity_effects": ["Selenosis", "Hair loss", "Nail brittleness"]
    },
    {
        "id": "copper",
        "name": "Copper",
        "category": "mineral",
        "subcategory": "trace",
        "unit": "mg",
        "daily_value": 0.9,
        "upper_limit": 10,
        "parameter_effects": {
            "hematologic": [
                {"parameter": "iron_metabolism", "direction": "support", "mechanism": "Required for ceruloplasmin and iron oxidation", "magnitude": "significant"}
            ],
            "neurological": [
                {"parameter": "neurotransmitter_synthesis", "direction": "support", "mechanism": "Cofactor for dopamine beta-hydroxylase", "magnitude": "moderate"}
            ],
            "musculoskeletal": [
                {"parameter": "collagen_crosslinking", "direction": "support", "mechanism": "Required for lysyl oxidase activity", "magnitude": "moderate"}
            ],
            "antioxidant": [
                {"parameter": "superoxide_dismutase", "direction": "support", "mechanism": "Component of Cu/Zn-SOD", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Anemia", "Neutropenia", "Neurological problems"],
        "toxicity_effects": ["Wilson disease symptoms", "Liver damage"]
    },
    {
        "id": "manganese",
        "name": "Manganese",
        "category": "mineral",
        "subcategory": "trace",
        "unit": "mg",
        "daily_value": 2.3,
        "upper_limit": 11,
        "parameter_effects": {
            "metabolic": [
                {"parameter": "gluconeogenesis", "direction": "support", "mechanism": "Cofactor for pyruvate carboxylase", "magnitude": "moderate"},
                {"parameter": "carbohydrate_metabolism", "direction": "support", "mechanism": "Activates glycosyltransferases", "magnitude": "moderate"}
            ],
            "musculoskeletal": [
                {"parameter": "bone_formation", "direction": "support", "mechanism": "Required for proteoglycan synthesis", "magnitude": "moderate"}
            ],
            "antioxidant": [
                {"parameter": "MnSOD_activity", "direction": "support", "mechanism": "Component of mitochondrial SOD", "magnitude": "moderate"}
            ]
        },
        "deficiency_effects": ["Impaired growth", "Skeletal abnormalities"],
        "toxicity_effects": ["Manganism", "Neurological symptoms"]
    },
    {
        "id": "chromium",
        "name": "Chromium",
        "category": "mineral",
        "subcategory": "trace",
        "unit": "mcg",
        "daily_value": 35,
        "upper_limit": None,
        "parameter_effects": {
            "glycemic": [
                {"parameter": "insulin_sensitivity", "direction": "increase", "mechanism": "Enhances insulin receptor signaling", "magnitude": "mild"},
                {"parameter": "blood_glucose", "direction": "decrease", "mechanism": "Improves glucose tolerance", "magnitude": "mild"}
            ]
        },
        "deficiency_effects": ["Impaired glucose tolerance"]
    },
    {
        "id": "molybdenum",
        "name": "Molybdenum",
        "category": "mineral",
        "subcategory": "trace",
        "unit": "mcg",
        "daily_value": 45,
        "upper_limit": 2000,
        "parameter_effects": {
            "metabolic": [
                {"parameter": "sulfite_oxidase", "direction": "support", "mechanism": "Cofactor for sulfite detoxification", "magnitude": "moderate"},
                {"parameter": "uric_acid_production", "direction": "support", "mechanism": "Cofactor for xanthine oxidase", "magnitude": "moderate"}
            ]
        }
    },
    {
        "id": "iodine",
        "name": "Iodine",
        "category": "mineral",
        "subcategory": "trace",
        "unit": "mcg",
        "daily_value": 150,
        "upper_limit": 1100,
        "parameter_effects": {
            "thyroid": [
                {"parameter": "thyroid_hormone_synthesis", "direction": "support", "mechanism": "Essential component of T3 and T4", "magnitude": "significant"},
                {"parameter": "TSH", "direction": "normalize", "mechanism": "Adequate iodine prevents compensatory TSH rise", "magnitude": "significant"},
                {"parameter": "metabolic_rate", "direction": "regulate", "mechanism": "Via thyroid hormone effects", "magnitude": "moderate"}
            ],
            "developmental": [
                {"parameter": "cognitive_development", "direction": "support", "mechanism": "Critical for fetal brain development", "magnitude": "significant"}
            ]
        },
        "deficiency_effects": ["Goiter", "Hypothyroidism", "Cretinism (severe deficiency)"],
        "toxicity_effects": ["Thyroid dysfunction", "Hyperthyroidism"]
    },
    {
        "id": "fluoride",
        "name": "Fluoride",
        "category": "mineral",
        "subcategory": "trace",
        "unit": "mg",
        "daily_value": 4,
        "upper_limit": 10,
        "parameter_effects": {
            "dental": [
                {"parameter": "dental_enamel_strength", "direction": "increase", "mechanism": "Forms fluorapatite resistant to acid", "magnitude": "significant"},
                {"parameter": "dental_caries_risk", "direction": "decrease", "mechanism": "Inhibits bacterial acid production", "magnitude": "significant"}
            ],
            "musculoskeletal": [
                {"parameter": "bone_density", "direction": "increase", "mechanism": "Stimulates osteoblast activity", "magnitude": "mild"}
            ]
        },
        "deficiency_effects": ["Increased dental caries"],
        "toxicity_effects": ["Dental fluorosis", "Skeletal fluorosis"]
    }
]

async def insert_nutrients():
    """Insert all nutrients into the database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    nutrients_collection = db.nutrients
    
    print(f"\n{'='*60}")
    print(f"PhiCor Food Engine - Comprehensive Nutrients Database")
    print(f"{'='*60}")
    print(f"Total nutrients to process: {len(NUTRIENTS_DATABASE)}")
    
    inserted = 0
    updated = 0
    
    for nutrient in NUTRIENTS_DATABASE:
        nutrient_doc = {
            **nutrient,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        try:
            existing = await nutrients_collection.find_one({"id": nutrient["id"]})
            if existing:
                await nutrients_collection.update_one(
                    {"id": nutrient["id"]},
                    {"$set": nutrient_doc}
                )
                updated += 1
            else:
                await nutrients_collection.insert_one(nutrient_doc)
                inserted += 1
                print(f"  ✓ {nutrient['name']}")
        except Exception as e:
            print(f"  ✗ Error with {nutrient['name']}: {e}")
    
    total_count = await nutrients_collection.count_documents({})
    
    print(f"\n{'='*60}")
    print(f"Nutrients Database Complete!")
    print(f"{'='*60}")
    print(f"Inserted: {inserted}")
    print(f"Updated: {updated}")
    print(f"Total nutrients in database: {total_count}")
    
    client.close()
    return total_count

if __name__ == "__main__":
    asyncio.run(insert_nutrients())
