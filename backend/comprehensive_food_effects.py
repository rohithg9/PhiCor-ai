#!/usr/bin/env python3
"""
Comprehensive Organ System Effects Calculator for Foods
Adds detailed parameter effects for ALL 12 major organ systems
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

# Complete list of body organ systems and their parameters
ORGAN_SYSTEMS = {
    "cardiovascular": {
        "name": "Cardiovascular System",
        "parameters": [
            "blood_pressure_systolic", "blood_pressure_diastolic", "heart_rate",
            "ldl_cholesterol", "hdl_cholesterol", "total_cholesterol", "triglycerides",
            "homocysteine", "crp", "fibrinogen", "platelet_aggregation",
            "vascular_resistance", "cardiac_output", "stroke_volume"
        ]
    },
    "glycemic": {
        "name": "Glycemic/Metabolic System",
        "parameters": [
            "blood_glucose", "fasting_glucose", "postprandial_glucose", "hba1c",
            "insulin_level", "insulin_sensitivity", "insulin_resistance_homa",
            "glucagon", "c_peptide", "glycemic_index_response", "metabolic_rate"
        ]
    },
    "hepatic": {
        "name": "Hepatic System (Liver)",
        "parameters": [
            "alt", "ast", "alp", "ggt", "bilirubin_total", "bilirubin_direct",
            "albumin", "total_protein", "prothrombin_time", "inr",
            "hepatic_fat_content", "bile_acid_synthesis", "ammonia"
        ]
    },
    "renal": {
        "name": "Renal System (Kidneys)",
        "parameters": [
            "creatinine", "bun", "gfr", "uric_acid", "cystatin_c",
            "sodium_serum", "potassium_serum", "chloride", "bicarbonate",
            "urine_protein", "urine_albumin", "urine_specific_gravity"
        ]
    },
    "gastrointestinal": {
        "name": "Gastrointestinal System",
        "parameters": [
            "gastric_ph", "gastric_emptying_time", "intestinal_transit_time",
            "gut_motility", "microbiome_diversity", "scfa_production",
            "intestinal_permeability", "bile_flow", "pancreatic_enzyme_output",
            "gastrin", "ghrelin", "leptin", "cholecystokinin"
        ]
    },
    "musculoskeletal": {
        "name": "Musculoskeletal System",
        "parameters": [
            "muscle_protein_synthesis", "muscle_breakdown", "bone_mineral_density",
            "osteocalcin", "ctx", "calcium_balance", "phosphorus_balance",
            "vitamin_d_status", "parathyroid_hormone", "muscle_glycogen",
            "creatine_kinase", "lactate", "myoglobin"
        ]
    },
    "neurological": {
        "name": "Neurological System",
        "parameters": [
            "cognitive_function", "memory", "attention", "reaction_time",
            "serotonin", "dopamine", "norepinephrine", "gaba", "glutamate",
            "acetylcholine", "brain_derived_neurotrophic_factor", "nerve_conduction",
            "sleep_quality", "alertness", "mood"
        ]
    },
    "immune": {
        "name": "Immune System",
        "parameters": [
            "wbc_count", "neutrophils", "lymphocytes", "monocytes", "eosinophils",
            "nk_cell_activity", "t_cell_function", "b_cell_function",
            "immunoglobulin_a", "immunoglobulin_g", "complement_c3",
            "inflammatory_markers", "cytokine_balance", "antioxidant_capacity"
        ]
    },
    "endocrine": {
        "name": "Endocrine System",
        "parameters": [
            "tsh", "t3", "t4", "cortisol", "dhea", "testosterone", "estrogen",
            "progesterone", "growth_hormone", "igf1", "prolactin",
            "aldosterone", "renin", "adrenal_function"
        ]
    },
    "respiratory": {
        "name": "Respiratory System",
        "parameters": [
            "oxygen_saturation", "respiratory_rate", "lung_function_fev1",
            "lung_function_fvc", "bronchial_reactivity", "mucus_production",
            "airway_inflammation", "gas_exchange_efficiency"
        ]
    },
    "hematological": {
        "name": "Hematological System",
        "parameters": [
            "hemoglobin", "hematocrit", "rbc_count", "mcv", "mch", "mchc",
            "reticulocytes", "iron_serum", "ferritin", "transferrin",
            "tibc", "vitamin_b12_serum", "folate_serum", "epo"
        ]
    },
    "dermatological": {
        "name": "Dermatological System (Skin)",
        "parameters": [
            "skin_hydration", "collagen_synthesis", "elastin_production",
            "sebum_production", "melanin_synthesis", "wound_healing",
            "skin_inflammation", "antioxidant_skin_protection"
        ]
    }
}

def calculate_comprehensive_effects(nutrients):
    """Calculate effects on ALL organ systems based on nutrient composition"""
    effects = {}
    
    # Extract all nutrient values with defaults
    energy = nutrients.get("energy", {}).get("value", 0) or 0
    protein = nutrients.get("protein", {}).get("value", 0) or 0
    carbs = nutrients.get("carbohydrates", {}).get("value", 0) or 0
    fiber = nutrients.get("fiber", {}).get("value", 0) or 0
    sugars = nutrients.get("sugars", {}).get("value", 0) or 0
    fat_total = nutrients.get("fat_total", {}).get("value", 0) or 0
    fat_sat = nutrients.get("fat_saturated", {}).get("value", 0) or 0
    fat_trans = nutrients.get("fat_trans", {}).get("value", 0) or 0
    cholesterol = nutrients.get("cholesterol", {}).get("value", 0) or 0
    sodium = nutrients.get("sodium", {}).get("value", 0) or 0
    potassium = nutrients.get("potassium", {}).get("value", 0) or 0
    calcium = nutrients.get("calcium", {}).get("value", 0) or 0
    iron = nutrients.get("iron", {}).get("value", 0) or 0
    magnesium = nutrients.get("magnesium", {}).get("value", 0) or 0
    phosphorus = nutrients.get("phosphorus", {}).get("value", 0) or 0
    zinc = nutrients.get("zinc", {}).get("value", 0) or 0
    selenium = nutrients.get("selenium", {}).get("value", 0) or 0
    vitamin_a = nutrients.get("vitamin_a", {}).get("value", 0) or 0
    vitamin_c = nutrients.get("vitamin_c", {}).get("value", 0) or 0
    vitamin_d = nutrients.get("vitamin_d", {}).get("value", 0) or 0
    vitamin_e = nutrients.get("vitamin_e", {}).get("value", 0) or 0
    vitamin_k = nutrients.get("vitamin_k", {}).get("value", 0) or 0
    thiamin = nutrients.get("thiamin", {}).get("value", 0) or 0
    riboflavin = nutrients.get("riboflavin", {}).get("value", 0) or 0
    niacin = nutrients.get("niacin", {}).get("value", 0) or 0
    vitamin_b6 = nutrients.get("vitamin_b6", {}).get("value", 0) or 0
    folate = nutrients.get("folate", {}).get("value", 0) or 0
    vitamin_b12 = nutrients.get("vitamin_b12", {}).get("value", 0) or 0
    choline = nutrients.get("choline", {}).get("value", 0) or 0
    omega3 = (nutrients.get("omega3_dha", {}).get("value", 0) or 0) + \
             (nutrients.get("omega3_epa", {}).get("value", 0) or 0) + \
             (nutrients.get("omega3_ala", {}).get("value", 0) or 0)
    
    # ==================== CARDIOVASCULAR SYSTEM ====================
    cardio = []
    
    if sodium > 100:
        cardio.append({
            "parameter": "blood_pressure_systolic",
            "change": f"+{min(sodium/150, 10):.1f} mmHg",
            "direction": "increase",
            "mechanism": "Sodium increases blood volume through water retention and raises vascular resistance",
            "source_nutrient": "Sodium",
            "amount": f"{sodium:.0f} mg",
            "clinical_significance": "high" if sodium > 500 else "moderate" if sodium > 200 else "low"
        })
        cardio.append({
            "parameter": "blood_pressure_diastolic",
            "change": f"+{min(sodium/250, 6):.1f} mmHg",
            "direction": "increase",
            "mechanism": "Sodium-induced volume expansion affects diastolic pressure",
            "source_nutrient": "Sodium",
            "amount": f"{sodium:.0f} mg",
            "clinical_significance": "moderate" if sodium > 300 else "low"
        })
    
    if potassium > 100:
        cardio.append({
            "parameter": "blood_pressure_systolic",
            "change": f"-{min(potassium/200, 8):.1f} mmHg",
            "direction": "decrease",
            "mechanism": "Potassium promotes vasodilation and enhances sodium excretion via Na-K-ATPase",
            "source_nutrient": "Potassium",
            "amount": f"{potassium:.0f} mg",
            "clinical_significance": "high" if potassium > 400 else "moderate"
        })
        cardio.append({
            "parameter": "heart_rate",
            "change": "-2-5 bpm",
            "direction": "decrease",
            "mechanism": "Potassium stabilizes cardiac cell membranes and reduces arrhythmia risk",
            "source_nutrient": "Potassium",
            "amount": f"{potassium:.0f} mg",
            "clinical_significance": "moderate"
        })
    
    if fat_sat > 2:
        cardio.append({
            "parameter": "ldl_cholesterol",
            "change": f"+{min(fat_sat*3, 25):.0f} mg/dL",
            "direction": "increase",
            "mechanism": "Saturated fat downregulates hepatic LDL receptors, increasing serum LDL",
            "source_nutrient": "Saturated Fat",
            "amount": f"{fat_sat:.1f} g",
            "clinical_significance": "high" if fat_sat > 7 else "moderate"
        })
        cardio.append({
            "parameter": "total_cholesterol",
            "change": f"+{min(fat_sat*4, 35):.0f} mg/dL",
            "direction": "increase",
            "mechanism": "Saturated fat increases hepatic cholesterol synthesis",
            "source_nutrient": "Saturated Fat",
            "amount": f"{fat_sat:.1f} g",
            "clinical_significance": "high" if fat_sat > 7 else "moderate"
        })
    
    if fiber > 2:
        cardio.append({
            "parameter": "ldl_cholesterol",
            "change": f"-{min(fiber*2.5, 15):.0f} mg/dL",
            "direction": "decrease",
            "mechanism": "Soluble fiber binds bile acids, forcing hepatic LDL receptor upregulation",
            "source_nutrient": "Fiber",
            "amount": f"{fiber:.1f} g",
            "clinical_significance": "high" if fiber > 5 else "moderate"
        })
        cardio.append({
            "parameter": "triglycerides",
            "change": f"-{min(fiber*3, 20):.0f} mg/dL",
            "direction": "decrease",
            "mechanism": "Fiber slows carbohydrate absorption, reducing hepatic VLDL synthesis",
            "source_nutrient": "Fiber",
            "amount": f"{fiber:.1f} g",
            "clinical_significance": "moderate"
        })
    
    if cholesterol > 50:
        cardio.append({
            "parameter": "total_cholesterol",
            "change": f"+{min(cholesterol/8, 20):.0f} mg/dL",
            "direction": "increase",
            "mechanism": "Dietary cholesterol contributes directly to serum cholesterol pool",
            "source_nutrient": "Cholesterol",
            "amount": f"{cholesterol:.0f} mg",
            "clinical_significance": "moderate" if cholesterol > 100 else "low"
        })
    
    if omega3 > 0.1:
        cardio.append({
            "parameter": "triglycerides",
            "change": f"-{min(omega3*25, 40):.0f} mg/dL",
            "direction": "decrease",
            "mechanism": "Omega-3s inhibit hepatic VLDL synthesis and enhance lipoprotein lipase activity",
            "source_nutrient": "Omega-3 Fatty Acids",
            "amount": f"{omega3:.2f} g",
            "clinical_significance": "high" if omega3 > 0.5 else "moderate"
        })
        cardio.append({
            "parameter": "hdl_cholesterol",
            "change": f"+{min(omega3*5, 8):.0f} mg/dL",
            "direction": "increase",
            "mechanism": "Omega-3s upregulate apoA-I synthesis, increasing HDL production",
            "source_nutrient": "Omega-3 Fatty Acids",
            "amount": f"{omega3:.2f} g",
            "clinical_significance": "moderate"
        })
        cardio.append({
            "parameter": "platelet_aggregation",
            "change": "-10-20%",
            "direction": "decrease",
            "mechanism": "EPA competes with arachidonic acid, reducing thromboxane A2 synthesis",
            "source_nutrient": "Omega-3 Fatty Acids",
            "amount": f"{omega3:.2f} g",
            "clinical_significance": "moderate"
        })
    
    if magnesium > 20:
        cardio.append({
            "parameter": "vascular_resistance",
            "change": "-3-8%",
            "direction": "decrease",
            "mechanism": "Magnesium acts as a natural calcium channel blocker, promoting vasodilation",
            "source_nutrient": "Magnesium",
            "amount": f"{magnesium:.0f} mg",
            "clinical_significance": "moderate" if magnesium > 50 else "low"
        })
    
    if cardio:
        effects["cardiovascular"] = {
            "system_name": "Cardiovascular System",
            "parameters": cardio,
            "summary": f"{len(cardio)} cardiovascular parameters affected"
        }
    
    # ==================== GLYCEMIC/METABOLIC SYSTEM ====================
    glycemic = []
    
    if sugars > 3:
        glycemic.append({
            "parameter": "blood_glucose",
            "change": f"+{min(sugars*4, 70):.0f} mg/dL",
            "direction": "increase",
            "mechanism": "Rapid absorption of simple sugars causes acute hyperglycemia",
            "source_nutrient": "Sugars",
            "amount": f"{sugars:.1f} g",
            "clinical_significance": "high" if sugars > 15 else "moderate"
        })
        glycemic.append({
            "parameter": "insulin_level",
            "change": f"+{min(sugars*3, 50):.0f}%",
            "direction": "increase",
            "mechanism": "Glucose spike triggers pancreatic beta-cell insulin secretion",
            "source_nutrient": "Sugars",
            "amount": f"{sugars:.1f} g",
            "clinical_significance": "high" if sugars > 15 else "moderate"
        })
    
    if carbs > 15 and sugars < 5:
        glycemic.append({
            "parameter": "blood_glucose",
            "change": f"+{min(carbs*0.8, 40):.0f} mg/dL",
            "direction": "increase",
            "mechanism": "Complex carbohydrate digestion provides sustained glucose release",
            "source_nutrient": "Carbohydrates",
            "amount": f"{carbs:.1f} g",
            "clinical_significance": "moderate"
        })
    
    if fiber > 2:
        glycemic.append({
            "parameter": "insulin_sensitivity",
            "change": f"+{min(fiber*3, 20):.0f}%",
            "direction": "increase",
            "mechanism": "Fiber slows glucose absorption and improves peripheral insulin signaling",
            "source_nutrient": "Fiber",
            "amount": f"{fiber:.1f} g",
            "clinical_significance": "high" if fiber > 5 else "moderate"
        })
        glycemic.append({
            "parameter": "postprandial_glucose",
            "change": f"-{min(fiber*5, 25):.0f}%",
            "direction": "decrease",
            "mechanism": "Fiber creates viscous gel that slows gastric emptying and glucose absorption",
            "source_nutrient": "Fiber",
            "amount": f"{fiber:.1f} g",
            "clinical_significance": "high" if fiber > 5 else "moderate"
        })
    
    if protein > 10:
        glycemic.append({
            "parameter": "glucagon",
            "change": f"+{min(protein*2, 25):.0f}%",
            "direction": "increase",
            "mechanism": "Amino acids stimulate pancreatic alpha-cell glucagon secretion",
            "source_nutrient": "Protein",
            "amount": f"{protein:.1f} g",
            "clinical_significance": "low"
        })
    
    if magnesium > 30:
        glycemic.append({
            "parameter": "insulin_sensitivity",
            "change": "+5-12%",
            "direction": "increase",
            "mechanism": "Magnesium is cofactor for insulin receptor tyrosine kinase activity",
            "source_nutrient": "Magnesium",
            "amount": f"{magnesium:.0f} mg",
            "clinical_significance": "moderate"
        })
    
    if chromium := nutrients.get("chromium", {}).get("value", 0):
        if chromium > 10:
            glycemic.append({
                "parameter": "insulin_sensitivity",
                "change": "+8-15%",
                "direction": "increase",
                "mechanism": "Chromium enhances insulin receptor binding and glucose transporter activity",
                "source_nutrient": "Chromium",
                "amount": f"{chromium:.0f} mcg",
                "clinical_significance": "moderate"
            })
    
    if glycemic:
        effects["glycemic"] = {
            "system_name": "Glycemic/Metabolic System",
            "parameters": glycemic,
            "summary": f"{len(glycemic)} metabolic parameters affected"
        }
    
    # ==================== HEPATIC SYSTEM ====================
    hepatic = []
    
    if fat_total > 10:
        hepatic.append({
            "parameter": "triglycerides",
            "change": f"+{min(fat_total*2.5, 45):.0f} mg/dL",
            "direction": "increase",
            "mechanism": "Dietary fat increases hepatic chylomicron processing and VLDL synthesis",
            "source_nutrient": "Total Fat",
            "amount": f"{fat_total:.1f} g",
            "clinical_significance": "high" if fat_total > 25 else "moderate"
        })
    
    if fat_sat > 5:
        hepatic.append({
            "parameter": "hepatic_fat_content",
            "change": "+3-8%",
            "direction": "increase",
            "mechanism": "Saturated fat promotes hepatic lipogenesis and reduces fatty acid oxidation",
            "source_nutrient": "Saturated Fat",
            "amount": f"{fat_sat:.1f} g",
            "clinical_significance": "high" if fat_sat > 10 else "moderate"
        })
        hepatic.append({
            "parameter": "alt",
            "change": f"+{min(fat_sat*1.5, 12):.0f} U/L",
            "direction": "increase",
            "mechanism": "Hepatic lipid accumulation can cause subclinical hepatocyte stress",
            "source_nutrient": "Saturated Fat",
            "amount": f"{fat_sat:.1f} g",
            "clinical_significance": "low"
        })
    
    if fiber > 3:
        hepatic.append({
            "parameter": "bile_acid_synthesis",
            "change": "+15-30%",
            "direction": "increase",
            "mechanism": "Fiber binding of bile acids increases hepatic de novo bile synthesis from cholesterol",
            "source_nutrient": "Fiber",
            "amount": f"{fiber:.1f} g",
            "clinical_significance": "moderate"
        })
    
    if protein > 15:
        hepatic.append({
            "parameter": "albumin",
            "change": "+0.1-0.3 g/dL",
            "direction": "increase",
            "mechanism": "Adequate protein supports hepatic albumin synthesis",
            "source_nutrient": "Protein",
            "amount": f"{protein:.1f} g",
            "clinical_significance": "low"
        })
        hepatic.append({
            "parameter": "ammonia",
            "change": f"+{min(protein*0.5, 10):.0f}%",
            "direction": "increase",
            "mechanism": "Protein deamination generates ammonia requiring hepatic urea cycle processing",
            "source_nutrient": "Protein",
            "amount": f"{protein:.1f} g",
            "clinical_significance": "low"
        })
    
    if choline > 50:
        hepatic.append({
            "parameter": "hepatic_fat_content",
            "change": "-5-15%",
            "direction": "decrease",
            "mechanism": "Choline is essential for VLDL synthesis and hepatic fat export",
            "source_nutrient": "Choline",
            "amount": f"{choline:.0f} mg",
            "clinical_significance": "high" if choline > 100 else "moderate"
        })
    
    if hepatic:
        effects["hepatic"] = {
            "system_name": "Hepatic System",
            "parameters": hepatic,
            "summary": f"{len(hepatic)} hepatic parameters affected"
        }
    
    # ==================== RENAL SYSTEM ====================
    renal = []
    
    if protein > 8:
        renal.append({
            "parameter": "bun",
            "change": f"+{min(protein*0.25, 8):.1f} mg/dL",
            "direction": "increase",
            "mechanism": "Protein catabolism generates urea as primary nitrogen waste product",
            "source_nutrient": "Protein",
            "amount": f"{protein:.1f} g",
            "clinical_significance": "moderate" if protein > 25 else "low"
        })
        renal.append({
            "parameter": "gfr",
            "change": "+5-15%",
            "direction": "increase",
            "mechanism": "High protein intake increases renal blood flow and glomerular filtration",
            "source_nutrient": "Protein",
            "amount": f"{protein:.1f} g",
            "clinical_significance": "moderate"
        })
    
    if potassium > 200:
        renal.append({
            "parameter": "potassium_serum",
            "change": f"+{min(potassium/350, 0.8):.2f} mEq/L",
            "direction": "increase",
            "mechanism": "Dietary potassium transiently elevates serum levels before renal excretion",
            "source_nutrient": "Potassium",
            "amount": f"{potassium:.0f} mg",
            "clinical_significance": "moderate" if potassium > 500 else "low"
        })
    
    if sodium > 200:
        renal.append({
            "parameter": "sodium_serum",
            "change": f"+{min(sodium/500, 2):.1f} mEq/L",
            "direction": "increase",
            "mechanism": "High sodium intake increases serum sodium before compensatory excretion",
            "source_nutrient": "Sodium",
            "amount": f"{sodium:.0f} mg",
            "clinical_significance": "low"
        })
        renal.append({
            "parameter": "urine_protein",
            "change": "+5-15%",
            "direction": "increase",
            "mechanism": "Chronic high sodium increases glomerular pressure and proteinuria risk",
            "source_nutrient": "Sodium",
            "amount": f"{sodium:.0f} mg",
            "clinical_significance": "moderate" if sodium > 1000 else "low"
        })
    
    if phosphorus > 100:
        renal.append({
            "parameter": "phosphorus_serum",
            "change": f"+{min(phosphorus/200, 1.5):.1f} mg/dL",
            "direction": "increase",
            "mechanism": "Dietary phosphorus is absorbed and elevates serum levels",
            "source_nutrient": "Phosphorus",
            "amount": f"{phosphorus:.0f} mg",
            "clinical_significance": "low"
        })
    
    if renal:
        effects["renal"] = {
            "system_name": "Renal System",
            "parameters": renal,
            "summary": f"{len(renal)} renal parameters affected"
        }
    
    # ==================== GASTROINTESTINAL SYSTEM ====================
    gi = []
    
    if fiber > 1.5:
        gi.append({
            "parameter": "intestinal_transit_time",
            "change": f"-{min(fiber*1.5, 8):.0f} hours",
            "direction": "decrease",
            "mechanism": "Fiber increases stool bulk and stimulates peristalsis",
            "source_nutrient": "Fiber",
            "amount": f"{fiber:.1f} g",
            "clinical_significance": "high" if fiber > 5 else "moderate"
        })
        gi.append({
            "parameter": "microbiome_diversity",
            "change": f"+{min(fiber*3, 20):.0f}%",
            "direction": "increase",
            "mechanism": "Fiber serves as prebiotic substrate for beneficial gut bacteria",
            "source_nutrient": "Fiber",
            "amount": f"{fiber:.1f} g",
            "clinical_significance": "high" if fiber > 5 else "moderate"
        })
        gi.append({
            "parameter": "scfa_production",
            "change": f"+{min(fiber*8, 40):.0f}%",
            "direction": "increase",
            "mechanism": "Bacterial fermentation of fiber produces butyrate, propionate, acetate",
            "source_nutrient": "Fiber",
            "amount": f"{fiber:.1f} g",
            "clinical_significance": "high" if fiber > 5 else "moderate"
        })
    
    if protein > 15:
        gi.append({
            "parameter": "gastric_emptying_time",
            "change": f"+{min(protein*2, 40):.0f} min",
            "direction": "increase",
            "mechanism": "Protein triggers cholecystokinin release, slowing gastric emptying",
            "source_nutrient": "Protein",
            "amount": f"{protein:.1f} g",
            "clinical_significance": "moderate"
        })
        gi.append({
            "parameter": "cholecystokinin",
            "change": f"+{min(protein*3, 45):.0f}%",
            "direction": "increase",
            "mechanism": "Amino acids and fatty acids stimulate CCK release from I-cells",
            "source_nutrient": "Protein",
            "amount": f"{protein:.1f} g",
            "clinical_significance": "moderate"
        })
    
    if fat_total > 10:
        gi.append({
            "parameter": "bile_flow",
            "change": f"+{min(fat_total*3, 50):.0f}%",
            "direction": "increase",
            "mechanism": "Dietary fat triggers gallbladder contraction and bile release",
            "source_nutrient": "Total Fat",
            "amount": f"{fat_total:.1f} g",
            "clinical_significance": "moderate"
        })
        gi.append({
            "parameter": "pancreatic_enzyme_output",
            "change": f"+{min(fat_total*4, 60):.0f}%",
            "direction": "increase",
            "mechanism": "Fat stimulates CCK-mediated pancreatic lipase and enzyme secretion",
            "source_nutrient": "Total Fat",
            "amount": f"{fat_total:.1f} g",
            "clinical_significance": "moderate"
        })
    
    if gi:
        effects["gastrointestinal"] = {
            "system_name": "Gastrointestinal System",
            "parameters": gi,
            "summary": f"{len(gi)} gastrointestinal parameters affected"
        }
    
    # ==================== MUSCULOSKELETAL SYSTEM ====================
    musculo = []
    
    if protein > 6:
        musculo.append({
            "parameter": "muscle_protein_synthesis",
            "change": f"+{min(protein*2.5, 45):.0f}%",
            "direction": "increase",
            "mechanism": "Amino acids activate mTORC1 pathway stimulating ribosomal protein synthesis",
            "source_nutrient": "Protein",
            "amount": f"{protein:.1f} g",
            "clinical_significance": "high" if protein > 20 else "moderate"
        })
    
    if calcium > 50:
        musculo.append({
            "parameter": "bone_mineral_density",
            "change": "+0.3-1.5%",
            "direction": "increase",
            "mechanism": "Calcium integrates into hydroxyapatite crystal lattice of bone matrix",
            "source_nutrient": "Calcium",
            "amount": f"{calcium:.0f} mg",
            "clinical_significance": "high" if calcium > 200 else "moderate"
        })
        musculo.append({
            "parameter": "calcium_balance",
            "change": f"+{min(calcium/5, 80):.0f} mg/day",
            "direction": "increase",
            "mechanism": "Dietary calcium contributes to positive calcium balance",
            "source_nutrient": "Calcium",
            "amount": f"{calcium:.0f} mg",
            "clinical_significance": "moderate"
        })
    
    if vitamin_d > 1:
        musculo.append({
            "parameter": "calcium_absorption",
            "change": f"+{min(vitamin_d*5, 30):.0f}%",
            "direction": "increase",
            "mechanism": "Vitamin D upregulates intestinal calcium-binding proteins",
            "source_nutrient": "Vitamin D",
            "amount": f"{vitamin_d:.1f} mcg",
            "clinical_significance": "high" if vitamin_d > 5 else "moderate"
        })
    
    if phosphorus > 80:
        musculo.append({
            "parameter": "bone_mineral_density",
            "change": "+0.2-0.8%",
            "direction": "increase",
            "mechanism": "Phosphorus is essential component of bone hydroxyapatite",
            "source_nutrient": "Phosphorus",
            "amount": f"{phosphorus:.0f} mg",
            "clinical_significance": "moderate"
        })
    
    if vitamin_c > 10:
        musculo.append({
            "parameter": "collagen_synthesis",
            "change": f"+{min(vitamin_c*1.5, 40):.0f}%",
            "direction": "increase",
            "mechanism": "Vitamin C is essential cofactor for prolyl and lysyl hydroxylases in collagen formation",
            "source_nutrient": "Vitamin C",
            "amount": f"{vitamin_c:.0f} mg",
            "clinical_significance": "high" if vitamin_c > 30 else "moderate"
        })
    
    if magnesium > 30:
        musculo.append({
            "parameter": "muscle_function",
            "change": "+5-15%",
            "direction": "increase",
            "mechanism": "Magnesium is required for ATP-dependent muscle contraction and relaxation",
            "source_nutrient": "Magnesium",
            "amount": f"{magnesium:.0f} mg",
            "clinical_significance": "moderate"
        })
    
    if musculo:
        effects["musculoskeletal"] = {
            "system_name": "Musculoskeletal System",
            "parameters": musculo,
            "summary": f"{len(musculo)} musculoskeletal parameters affected"
        }
    
    # ==================== NEUROLOGICAL SYSTEM ====================
    neuro = []
    
    if omega3 > 0.1:
        neuro.append({
            "parameter": "cognitive_function",
            "change": "+5-15%",
            "direction": "increase",
            "mechanism": "DHA maintains neuronal membrane fluidity and synaptic plasticity",
            "source_nutrient": "Omega-3 Fatty Acids",
            "amount": f"{omega3:.2f} g",
            "clinical_significance": "high" if omega3 > 0.5 else "moderate"
        })
        neuro.append({
            "parameter": "brain_derived_neurotrophic_factor",
            "change": "+8-20%",
            "direction": "increase",
            "mechanism": "Omega-3s upregulate BDNF expression supporting neurogenesis",
            "source_nutrient": "Omega-3 Fatty Acids",
            "amount": f"{omega3:.2f} g",
            "clinical_significance": "moderate"
        })
    
    if choline > 50:
        neuro.append({
            "parameter": "acetylcholine",
            "change": f"+{min(choline/5, 25):.0f}%",
            "direction": "increase",
            "mechanism": "Choline is direct precursor for acetylcholine neurotransmitter synthesis",
            "source_nutrient": "Choline",
            "amount": f"{choline:.0f} mg",
            "clinical_significance": "high" if choline > 150 else "moderate"
        })
        neuro.append({
            "parameter": "memory",
            "change": "+5-12%",
            "direction": "increase",
            "mechanism": "Acetylcholine is critical for hippocampal memory formation",
            "source_nutrient": "Choline",
            "amount": f"{choline:.0f} mg",
            "clinical_significance": "moderate"
        })
    
    if vitamin_b6 > 0.2:
        neuro.append({
            "parameter": "serotonin",
            "change": "+5-15%",
            "direction": "increase",
            "mechanism": "B6 is cofactor for aromatic amino acid decarboxylase in serotonin synthesis",
            "source_nutrient": "Vitamin B6",
            "amount": f"{vitamin_b6:.2f} mg",
            "clinical_significance": "moderate"
        })
        neuro.append({
            "parameter": "dopamine",
            "change": "+5-12%",
            "direction": "increase",
            "mechanism": "B6 is required for DOPA decarboxylase activity in dopamine synthesis",
            "source_nutrient": "Vitamin B6",
            "amount": f"{vitamin_b6:.2f} mg",
            "clinical_significance": "moderate"
        })
    
    if folate > 30:
        neuro.append({
            "parameter": "homocysteine",
            "change": f"-{min(folate/10, 20):.0f}%",
            "direction": "decrease",
            "mechanism": "Folate is required for homocysteine remethylation to methionine",
            "source_nutrient": "Folate",
            "amount": f"{folate:.0f} mcg",
            "clinical_significance": "moderate"
        })
    
    if vitamin_b12 > 0.5:
        neuro.append({
            "parameter": "nerve_conduction",
            "change": "+3-8%",
            "direction": "increase",
            "mechanism": "B12 is essential for myelin synthesis and nerve fiber maintenance",
            "source_nutrient": "Vitamin B12",
            "amount": f"{vitamin_b12:.1f} mcg",
            "clinical_significance": "moderate"
        })
    
    if magnesium > 30:
        neuro.append({
            "parameter": "gaba",
            "change": "+5-12%",
            "direction": "increase",
            "mechanism": "Magnesium enhances GABA receptor binding and inhibitory neurotransmission",
            "source_nutrient": "Magnesium",
            "amount": f"{magnesium:.0f} mg",
            "clinical_significance": "moderate"
        })
    
    if neuro:
        effects["neurological"] = {
            "system_name": "Neurological System",
            "parameters": neuro,
            "summary": f"{len(neuro)} neurological parameters affected"
        }
    
    # ==================== IMMUNE SYSTEM ====================
    immune = []
    
    if vitamin_c > 10:
        immune.append({
            "parameter": "neutrophil_function",
            "change": f"+{min(vitamin_c*1.2, 35):.0f}%",
            "direction": "increase",
            "mechanism": "Vitamin C enhances neutrophil chemotaxis, phagocytosis, and oxidative burst",
            "source_nutrient": "Vitamin C",
            "amount": f"{vitamin_c:.0f} mg",
            "clinical_significance": "high" if vitamin_c > 50 else "moderate"
        })
        immune.append({
            "parameter": "antioxidant_capacity",
            "change": f"+{min(vitamin_c*0.8, 30):.0f}%",
            "direction": "increase",
            "mechanism": "Vitamin C directly scavenges ROS and regenerates vitamin E",
            "source_nutrient": "Vitamin C",
            "amount": f"{vitamin_c:.0f} mg",
            "clinical_significance": "high" if vitamin_c > 50 else "moderate"
        })
    
    if zinc > 1:
        immune.append({
            "parameter": "t_cell_function",
            "change": f"+{min(zinc*8, 30):.0f}%",
            "direction": "increase",
            "mechanism": "Zinc is essential for T-cell maturation and cytokine production",
            "source_nutrient": "Zinc",
            "amount": f"{zinc:.1f} mg",
            "clinical_significance": "high" if zinc > 3 else "moderate"
        })
        immune.append({
            "parameter": "nk_cell_activity",
            "change": f"+{min(zinc*6, 25):.0f}%",
            "direction": "increase",
            "mechanism": "Zinc supports NK cell cytolytic activity and IFN-gamma production",
            "source_nutrient": "Zinc",
            "amount": f"{zinc:.1f} mg",
            "clinical_significance": "moderate"
        })
    
    if selenium > 10:
        immune.append({
            "parameter": "antioxidant_capacity",
            "change": f"+{min(selenium*0.5, 25):.0f}%",
            "direction": "increase",
            "mechanism": "Selenium is cofactor for glutathione peroxidase antioxidant enzymes",
            "source_nutrient": "Selenium",
            "amount": f"{selenium:.0f} mcg",
            "clinical_significance": "moderate"
        })
    
    if vitamin_e > 2:
        immune.append({
            "parameter": "t_cell_function",
            "change": "+8-18%",
            "direction": "increase",
            "mechanism": "Vitamin E protects immune cell membranes from lipid peroxidation",
            "source_nutrient": "Vitamin E",
            "amount": f"{vitamin_e:.1f} mg",
            "clinical_significance": "moderate"
        })
    
    if vitamin_a > 100:
        immune.append({
            "parameter": "mucosal_immunity",
            "change": "+10-25%",
            "direction": "increase",
            "mechanism": "Vitamin A maintains epithelial barrier integrity and IgA production",
            "source_nutrient": "Vitamin A",
            "amount": f"{vitamin_a:.0f} mcg",
            "clinical_significance": "moderate"
        })
    
    if iron > 1:
        immune.append({
            "parameter": "oxygen_transport",
            "change": f"+{min(iron*5, 20):.0f}%",
            "direction": "increase",
            "mechanism": "Iron is essential for hemoglobin synthesis and oxygen delivery",
            "source_nutrient": "Iron",
            "amount": f"{iron:.1f} mg",
            "clinical_significance": "high" if iron > 3 else "moderate"
        })
    
    if immune:
        effects["immune"] = {
            "system_name": "Immune System",
            "parameters": immune,
            "summary": f"{len(immune)} immune parameters affected"
        }
    
    # ==================== ENDOCRINE SYSTEM ====================
    endocrine = []
    
    if iodine := nutrients.get("iodine", {}).get("value", 0):
        if iodine > 20:
            endocrine.append({
                "parameter": "thyroid_function",
                "change": "+5-15%",
                "direction": "increase",
                "mechanism": "Iodine is essential substrate for T3 and T4 thyroid hormone synthesis",
                "source_nutrient": "Iodine",
                "amount": f"{iodine:.0f} mcg",
                "clinical_significance": "high" if iodine > 50 else "moderate"
            })
    
    if selenium > 15:
        endocrine.append({
            "parameter": "t3_conversion",
            "change": "+5-12%",
            "direction": "increase",
            "mechanism": "Selenium is cofactor for deiodinase enzymes converting T4 to active T3",
            "source_nutrient": "Selenium",
            "amount": f"{selenium:.0f} mcg",
            "clinical_significance": "moderate"
        })
    
    if zinc > 2:
        endocrine.append({
            "parameter": "testosterone",
            "change": "+3-10%",
            "direction": "increase",
            "mechanism": "Zinc inhibits aromatase and supports Leydig cell function",
            "source_nutrient": "Zinc",
            "amount": f"{zinc:.1f} mg",
            "clinical_significance": "moderate" if zinc > 5 else "low"
        })
    
    if vitamin_d > 2:
        endocrine.append({
            "parameter": "parathyroid_hormone",
            "change": "-5-15%",
            "direction": "decrease",
            "mechanism": "Vitamin D suppresses PTH through VDR-mediated negative feedback",
            "source_nutrient": "Vitamin D",
            "amount": f"{vitamin_d:.1f} mcg",
            "clinical_significance": "moderate"
        })
    
    if protein > 20:
        endocrine.append({
            "parameter": "igf1",
            "change": f"+{min(protein*0.8, 20):.0f}%",
            "direction": "increase",
            "mechanism": "Adequate protein intake supports hepatic IGF-1 synthesis",
            "source_nutrient": "Protein",
            "amount": f"{protein:.1f} g",
            "clinical_significance": "moderate"
        })
    
    if endocrine:
        effects["endocrine"] = {
            "system_name": "Endocrine System",
            "parameters": endocrine,
            "summary": f"{len(endocrine)} endocrine parameters affected"
        }
    
    # ==================== HEMATOLOGICAL SYSTEM ====================
    hema = []
    
    if iron > 0.5:
        hema.append({
            "parameter": "hemoglobin",
            "change": f"+{min(iron*0.3, 1.5):.1f} g/dL",
            "direction": "increase",
            "mechanism": "Iron is incorporated into heme groups of hemoglobin molecules",
            "source_nutrient": "Iron",
            "amount": f"{iron:.1f} mg",
            "clinical_significance": "high" if iron > 3 else "moderate"
        })
        hema.append({
            "parameter": "ferritin",
            "change": f"+{min(iron*5, 30):.0f} ng/mL",
            "direction": "increase",
            "mechanism": "Excess iron is stored as ferritin in hepatocytes and macrophages",
            "source_nutrient": "Iron",
            "amount": f"{iron:.1f} mg",
            "clinical_significance": "moderate"
        })
    
    if vitamin_b12 > 0.5:
        hema.append({
            "parameter": "rbc_count",
            "change": "+2-8%",
            "direction": "increase",
            "mechanism": "B12 is essential for DNA synthesis in erythroid precursors",
            "source_nutrient": "Vitamin B12",
            "amount": f"{vitamin_b12:.1f} mcg",
            "clinical_significance": "moderate"
        })
        hema.append({
            "parameter": "mcv",
            "change": "-2-5 fL",
            "direction": "decrease",
            "mechanism": "B12 sufficiency prevents macrocytic changes in RBC development",
            "source_nutrient": "Vitamin B12",
            "amount": f"{vitamin_b12:.1f} mcg",
            "clinical_significance": "moderate"
        })
    
    if folate > 30:
        hema.append({
            "parameter": "rbc_count",
            "change": "+2-6%",
            "direction": "increase",
            "mechanism": "Folate is required for purine and pyrimidine synthesis in RBC production",
            "source_nutrient": "Folate",
            "amount": f"{folate:.0f} mcg",
            "clinical_significance": "moderate"
        })
    
    if vitamin_c > 20:
        hema.append({
            "parameter": "iron_absorption",
            "change": f"+{min(vitamin_c*1.5, 50):.0f}%",
            "direction": "increase",
            "mechanism": "Vitamin C reduces Fe3+ to Fe2+ enhancing non-heme iron absorption",
            "source_nutrient": "Vitamin C",
            "amount": f"{vitamin_c:.0f} mg",
            "clinical_significance": "high" if vitamin_c > 50 else "moderate"
        })
    
    if vitamin_k > 10:
        hema.append({
            "parameter": "coagulation_factors",
            "change": "+5-15%",
            "direction": "increase",
            "mechanism": "Vitamin K is cofactor for gamma-carboxylation of clotting factors II, VII, IX, X",
            "source_nutrient": "Vitamin K",
            "amount": f"{vitamin_k:.0f} mcg",
            "clinical_significance": "moderate"
        })
    
    if hema:
        effects["hematological"] = {
            "system_name": "Hematological System",
            "parameters": hema,
            "summary": f"{len(hema)} hematological parameters affected"
        }
    
    # ==================== RESPIRATORY SYSTEM ====================
    resp = []
    
    if vitamin_c > 30:
        resp.append({
            "parameter": "airway_inflammation",
            "change": "-10-25%",
            "direction": "decrease",
            "mechanism": "Vitamin C antioxidant activity protects airway epithelium from oxidative damage",
            "source_nutrient": "Vitamin C",
            "amount": f"{vitamin_c:.0f} mg",
            "clinical_significance": "moderate"
        })
    
    if omega3 > 0.3:
        resp.append({
            "parameter": "bronchial_reactivity",
            "change": "-8-18%",
            "direction": "decrease",
            "mechanism": "Omega-3s reduce pro-inflammatory eicosanoid production in airways",
            "source_nutrient": "Omega-3 Fatty Acids",
            "amount": f"{omega3:.2f} g",
            "clinical_significance": "moderate"
        })
    
    if vitamin_d > 3:
        resp.append({
            "parameter": "respiratory_infections",
            "change": "-15-30%",
            "direction": "decrease",
            "mechanism": "Vitamin D enhances antimicrobial peptide production in respiratory epithelium",
            "source_nutrient": "Vitamin D",
            "amount": f"{vitamin_d:.1f} mcg",
            "clinical_significance": "moderate"
        })
    
    if resp:
        effects["respiratory"] = {
            "system_name": "Respiratory System",
            "parameters": resp,
            "summary": f"{len(resp)} respiratory parameters affected"
        }
    
    # ==================== DERMATOLOGICAL SYSTEM ====================
    derm = []
    
    if vitamin_c > 15:
        derm.append({
            "parameter": "collagen_synthesis",
            "change": f"+{min(vitamin_c*1.2, 35):.0f}%",
            "direction": "increase",
            "mechanism": "Vitamin C is essential cofactor for procollagen hydroxylation",
            "source_nutrient": "Vitamin C",
            "amount": f"{vitamin_c:.0f} mg",
            "clinical_significance": "high" if vitamin_c > 40 else "moderate"
        })
        derm.append({
            "parameter": "wound_healing",
            "change": "+10-25%",
            "direction": "increase",
            "mechanism": "Vitamin C supports fibroblast proliferation and collagen deposition",
            "source_nutrient": "Vitamin C",
            "amount": f"{vitamin_c:.0f} mg",
            "clinical_significance": "moderate"
        })
    
    if vitamin_e > 3:
        derm.append({
            "parameter": "skin_protection",
            "change": "+15-30%",
            "direction": "increase",
            "mechanism": "Vitamin E protects skin cell membranes from UV-induced lipid peroxidation",
            "source_nutrient": "Vitamin E",
            "amount": f"{vitamin_e:.1f} mg",
            "clinical_significance": "moderate"
        })
    
    if vitamin_a > 150:
        derm.append({
            "parameter": "skin_cell_turnover",
            "change": "+10-20%",
            "direction": "increase",
            "mechanism": "Vitamin A regulates keratinocyte differentiation and epidermal renewal",
            "source_nutrient": "Vitamin A",
            "amount": f"{vitamin_a:.0f} mcg",
            "clinical_significance": "moderate"
        })
    
    if zinc > 2:
        derm.append({
            "parameter": "wound_healing",
            "change": "+8-18%",
            "direction": "increase",
            "mechanism": "Zinc is essential for metalloproteinase activity in tissue remodeling",
            "source_nutrient": "Zinc",
            "amount": f"{zinc:.1f} mg",
            "clinical_significance": "moderate"
        })
    
    if omega3 > 0.2:
        derm.append({
            "parameter": "skin_hydration",
            "change": "+10-20%",
            "direction": "increase",
            "mechanism": "Omega-3s are incorporated into cell membranes improving barrier function",
            "source_nutrient": "Omega-3 Fatty Acids",
            "amount": f"{omega3:.2f} g",
            "clinical_significance": "moderate"
        })
    
    if derm:
        effects["dermatological"] = {
            "system_name": "Dermatological System",
            "parameters": derm,
            "summary": f"{len(derm)} dermatological parameters affected"
        }
    
    return effects

async def update_food_effects(batch_size=500):
    """Update all foods with comprehensive organ effects"""
    
    print("Calculating comprehensive organ effects for all foods...")
    
    # Find foods with nutrients
    cursor = db.foods.find(
        {"nutrients": {"$exists": True, "$ne": {}}},
        {"_id": 1, "name": 1, "nutrients": 1}
    )
    
    foods = await cursor.to_list(None)
    print(f"Found {len(foods)} foods with nutrient data")
    
    updated = 0
    
    for i, food in enumerate(foods):
        nutrients = food.get("nutrients", {})
        if not nutrients:
            continue
        
        # Calculate comprehensive effects
        effects = calculate_comprehensive_effects(nutrients)
        
        if effects:
            await db.foods.update_one(
                {"_id": food["_id"]},
                {
                    "$set": {
                        "organ_effects": effects,
                        "effects_updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            updated += 1
        
        if (i + 1) % 500 == 0:
            print(f"  Processed {i + 1}/{len(foods)} foods, {updated} updated")
    
    print(f"\n✅ Updated {updated} foods with comprehensive organ effects")
    return updated

async def main():
    print("="*60)
    print("PhiCor.ai - Comprehensive Food Organ Effects Calculator")
    print("="*60)
    
    updated = await update_food_effects()
    
    # Show sample
    sample = await db.foods.find_one(
        {"organ_effects": {"$exists": True, "$ne": {}}},
        {"_id": 0, "name": 1, "organ_effects": 1}
    )
    if sample:
        print(f"\nSample: {sample['name']}")
        print(f"Organ systems: {list(sample['organ_effects'].keys())}")
        for sys_name, sys_data in list(sample['organ_effects'].items())[:2]:
            print(f"  {sys_name}: {len(sys_data.get('parameters', []))} parameters")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
