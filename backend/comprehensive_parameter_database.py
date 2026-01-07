"""
PhiCor Comprehensive Parameter Database
Defines ALL body organ systems and their measurable parameters
"""

# ============================================================
# ALL ORGAN SYSTEMS WITH THEIR PARAMETERS
# ============================================================

ORGAN_SYSTEMS = {
    "cardiovascular": {
        "name": "Cardiovascular System",
        "icon": "❤️",
        "parameters": [
            {"id": "bp_systolic", "name": "Blood Pressure (Systolic)", "unit": "mmHg", "normal_range": "90-120"},
            {"id": "bp_diastolic", "name": "Blood Pressure (Diastolic)", "unit": "mmHg", "normal_range": "60-80"},
            {"id": "heart_rate", "name": "Heart Rate", "unit": "bpm", "normal_range": "60-100"},
            {"id": "cardiac_output", "name": "Cardiac Output", "unit": "L/min", "normal_range": "4-8"},
            {"id": "stroke_volume", "name": "Stroke Volume", "unit": "mL", "normal_range": "60-100"},
            {"id": "ejection_fraction", "name": "Ejection Fraction", "unit": "%", "normal_range": "55-70"},
            {"id": "peripheral_resistance", "name": "Peripheral Vascular Resistance", "unit": "dynes·s/cm⁵", "normal_range": "800-1200"},
            {"id": "ldl_cholesterol", "name": "LDL Cholesterol", "unit": "mg/dL", "normal_range": "<100"},
            {"id": "hdl_cholesterol", "name": "HDL Cholesterol", "unit": "mg/dL", "normal_range": ">40"},
            {"id": "total_cholesterol", "name": "Total Cholesterol", "unit": "mg/dL", "normal_range": "<200"},
            {"id": "triglycerides", "name": "Triglycerides", "unit": "mg/dL", "normal_range": "<150"},
            {"id": "homocysteine", "name": "Homocysteine", "unit": "µmol/L", "normal_range": "5-15"},
            {"id": "crp", "name": "C-Reactive Protein", "unit": "mg/L", "normal_range": "<3"},
            {"id": "bnp", "name": "BNP (Brain Natriuretic Peptide)", "unit": "pg/mL", "normal_range": "<100"},
        ]
    },
    "renal": {
        "name": "Renal System",
        "icon": "🫘",
        "parameters": [
            {"id": "gfr", "name": "Glomerular Filtration Rate", "unit": "mL/min/1.73m²", "normal_range": ">90"},
            {"id": "serum_creatinine", "name": "Serum Creatinine", "unit": "mg/dL", "normal_range": "0.7-1.3"},
            {"id": "bun", "name": "Blood Urea Nitrogen", "unit": "mg/dL", "normal_range": "7-20"},
            {"id": "serum_potassium", "name": "Serum Potassium", "unit": "mEq/L", "normal_range": "3.5-5.0"},
            {"id": "serum_sodium", "name": "Serum Sodium", "unit": "mEq/L", "normal_range": "136-145"},
            {"id": "serum_phosphorus", "name": "Serum Phosphorus", "unit": "mg/dL", "normal_range": "2.5-4.5"},
            {"id": "uric_acid", "name": "Uric Acid", "unit": "mg/dL", "normal_range": "3.5-7.2"},
            {"id": "urine_protein", "name": "Urine Protein", "unit": "mg/24h", "normal_range": "<150"},
            {"id": "urine_albumin", "name": "Urine Albumin (Microalbumin)", "unit": "mg/24h", "normal_range": "<30"},
            {"id": "urine_output", "name": "Urine Output", "unit": "mL/day", "normal_range": "800-2000"},
        ]
    },
    "hepatic": {
        "name": "Hepatic System",
        "icon": "🫀",
        "parameters": [
            {"id": "alt", "name": "ALT (Alanine Aminotransferase)", "unit": "U/L", "normal_range": "7-56"},
            {"id": "ast", "name": "AST (Aspartate Aminotransferase)", "unit": "U/L", "normal_range": "10-40"},
            {"id": "alp", "name": "Alkaline Phosphatase", "unit": "U/L", "normal_range": "44-147"},
            {"id": "ggt", "name": "GGT (Gamma-Glutamyl Transferase)", "unit": "U/L", "normal_range": "9-48"},
            {"id": "bilirubin_total", "name": "Total Bilirubin", "unit": "mg/dL", "normal_range": "0.1-1.2"},
            {"id": "bilirubin_direct", "name": "Direct Bilirubin", "unit": "mg/dL", "normal_range": "0-0.3"},
            {"id": "albumin", "name": "Serum Albumin", "unit": "g/dL", "normal_range": "3.5-5.0"},
            {"id": "pt_inr", "name": "PT/INR", "unit": "ratio", "normal_range": "0.8-1.2"},
            {"id": "ammonia", "name": "Ammonia", "unit": "µmol/L", "normal_range": "15-45"},
            {"id": "liver_fat", "name": "Liver Fat Content", "unit": "%", "normal_range": "<5"},
        ]
    },
    "glycemic": {
        "name": "Glycemic/Metabolic System",
        "icon": "🍬",
        "parameters": [
            {"id": "fasting_glucose", "name": "Fasting Blood Glucose", "unit": "mg/dL", "normal_range": "70-100"},
            {"id": "postprandial_glucose", "name": "Postprandial Glucose (2hr)", "unit": "mg/dL", "normal_range": "<140"},
            {"id": "hba1c", "name": "HbA1c", "unit": "%", "normal_range": "<5.7"},
            {"id": "fasting_insulin", "name": "Fasting Insulin", "unit": "µU/mL", "normal_range": "2-25"},
            {"id": "homa_ir", "name": "HOMA-IR (Insulin Resistance)", "unit": "index", "normal_range": "<2.5"},
            {"id": "c_peptide", "name": "C-Peptide", "unit": "ng/mL", "normal_range": "0.5-2.0"},
            {"id": "glycemic_variability", "name": "Glycemic Variability", "unit": "CV%", "normal_range": "<36"},
            {"id": "time_in_range", "name": "Time in Range", "unit": "%", "normal_range": ">70"},
        ]
    },
    "gastrointestinal": {
        "name": "Gastrointestinal System",
        "icon": "🥗",
        "parameters": [
            {"id": "gastric_ph", "name": "Gastric pH", "unit": "pH", "normal_range": "1.5-3.5"},
            {"id": "gastric_emptying", "name": "Gastric Emptying Time", "unit": "min", "normal_range": "60-120"},
            {"id": "intestinal_motility", "name": "Intestinal Motility", "unit": "contractions/min", "normal_range": "10-12"},
            {"id": "stool_frequency", "name": "Stool Frequency", "unit": "per day", "normal_range": "1-3"},
            {"id": "fecal_calprotectin", "name": "Fecal Calprotectin", "unit": "µg/g", "normal_range": "<50"},
            {"id": "h_pylori", "name": "H. Pylori Status", "unit": "positive/negative", "normal_range": "negative"},
            {"id": "gut_microbiome_diversity", "name": "Gut Microbiome Diversity", "unit": "Shannon index", "normal_range": ">3"},
            {"id": "intestinal_permeability", "name": "Intestinal Permeability", "unit": "lactulose/mannitol ratio", "normal_range": "<0.03"},
        ]
    },
    "neurological": {
        "name": "Neurological System",
        "icon": "🧠",
        "parameters": [
            {"id": "cognitive_function", "name": "Cognitive Function (MMSE)", "unit": "score", "normal_range": "24-30"},
            {"id": "reaction_time", "name": "Reaction Time", "unit": "ms", "normal_range": "200-300"},
            {"id": "sleep_quality", "name": "Sleep Quality Index", "unit": "score", "normal_range": "<5"},
            {"id": "anxiety_score", "name": "Anxiety Score (GAD-7)", "unit": "score", "normal_range": "<5"},
            {"id": "depression_score", "name": "Depression Score (PHQ-9)", "unit": "score", "normal_range": "<5"},
            {"id": "serotonin", "name": "Serotonin Levels", "unit": "ng/mL", "normal_range": "101-283"},
            {"id": "dopamine", "name": "Dopamine Activity", "unit": "relative", "normal_range": "normal"},
            {"id": "gaba", "name": "GABA Activity", "unit": "relative", "normal_range": "normal"},
            {"id": "cortisol_morning", "name": "Morning Cortisol", "unit": "µg/dL", "normal_range": "6-23"},
            {"id": "melatonin", "name": "Melatonin (Night)", "unit": "pg/mL", "normal_range": "10-80"},
        ]
    },
    "musculoskeletal": {
        "name": "Musculoskeletal System",
        "icon": "💪",
        "parameters": [
            {"id": "bone_density", "name": "Bone Mineral Density (T-score)", "unit": "SD", "normal_range": ">-1.0"},
            {"id": "calcium_serum", "name": "Serum Calcium", "unit": "mg/dL", "normal_range": "8.5-10.5"},
            {"id": "vitamin_d", "name": "Vitamin D (25-OH)", "unit": "ng/mL", "normal_range": "30-100"},
            {"id": "pth", "name": "Parathyroid Hormone", "unit": "pg/mL", "normal_range": "15-65"},
            {"id": "muscle_mass", "name": "Muscle Mass Index", "unit": "kg/m²", "normal_range": "7-10"},
            {"id": "grip_strength", "name": "Grip Strength", "unit": "kg", "normal_range": ">26"},
            {"id": "creatine_kinase", "name": "Creatine Kinase", "unit": "U/L", "normal_range": "30-200"},
            {"id": "osteocalcin", "name": "Osteocalcin", "unit": "ng/mL", "normal_range": "11-43"},
        ]
    },
    "immune": {
        "name": "Immune System",
        "icon": "🛡️",
        "parameters": [
            {"id": "wbc_count", "name": "White Blood Cell Count", "unit": "cells/µL", "normal_range": "4500-11000"},
            {"id": "lymphocytes", "name": "Lymphocyte Count", "unit": "%", "normal_range": "20-40"},
            {"id": "neutrophils", "name": "Neutrophil Count", "unit": "%", "normal_range": "40-70"},
            {"id": "iga", "name": "IgA", "unit": "mg/dL", "normal_range": "70-400"},
            {"id": "igg", "name": "IgG", "unit": "mg/dL", "normal_range": "700-1600"},
            {"id": "igm", "name": "IgM", "unit": "mg/dL", "normal_range": "40-230"},
            {"id": "complement_c3", "name": "Complement C3", "unit": "mg/dL", "normal_range": "90-180"},
            {"id": "il6", "name": "Interleukin-6", "unit": "pg/mL", "normal_range": "<7"},
            {"id": "tnf_alpha", "name": "TNF-alpha", "unit": "pg/mL", "normal_range": "<8.1"},
            {"id": "nk_cell_activity", "name": "NK Cell Activity", "unit": "%", "normal_range": "10-30"},
        ]
    },
    "endocrine": {
        "name": "Endocrine System",
        "icon": "⚖️",
        "parameters": [
            {"id": "tsh", "name": "TSH", "unit": "mIU/L", "normal_range": "0.4-4.0"},
            {"id": "free_t4", "name": "Free T4", "unit": "ng/dL", "normal_range": "0.8-1.8"},
            {"id": "free_t3", "name": "Free T3", "unit": "pg/mL", "normal_range": "2.3-4.2"},
            {"id": "testosterone", "name": "Testosterone (Total)", "unit": "ng/dL", "normal_range": "300-1000"},
            {"id": "estradiol", "name": "Estradiol", "unit": "pg/mL", "normal_range": "varies"},
            {"id": "dhea_s", "name": "DHEA-S", "unit": "µg/dL", "normal_range": "varies by age"},
            {"id": "igf1", "name": "IGF-1", "unit": "ng/mL", "normal_range": "varies by age"},
            {"id": "prolactin", "name": "Prolactin", "unit": "ng/mL", "normal_range": "2-18"},
            {"id": "acth", "name": "ACTH", "unit": "pg/mL", "normal_range": "7-63"},
            {"id": "aldosterone", "name": "Aldosterone", "unit": "ng/dL", "normal_range": "3-16"},
        ]
    },
    "hematologic": {
        "name": "Hematologic System",
        "icon": "🩸",
        "parameters": [
            {"id": "hemoglobin", "name": "Hemoglobin", "unit": "g/dL", "normal_range": "12-17"},
            {"id": "hematocrit", "name": "Hematocrit", "unit": "%", "normal_range": "36-50"},
            {"id": "rbc_count", "name": "Red Blood Cell Count", "unit": "million/µL", "normal_range": "4.5-5.5"},
            {"id": "mcv", "name": "Mean Corpuscular Volume", "unit": "fL", "normal_range": "80-100"},
            {"id": "platelet_count", "name": "Platelet Count", "unit": "thousand/µL", "normal_range": "150-400"},
            {"id": "reticulocytes", "name": "Reticulocyte Count", "unit": "%", "normal_range": "0.5-2.5"},
            {"id": "ferritin", "name": "Ferritin", "unit": "ng/mL", "normal_range": "20-200"},
            {"id": "iron_serum", "name": "Serum Iron", "unit": "µg/dL", "normal_range": "60-170"},
            {"id": "tibc", "name": "Total Iron Binding Capacity", "unit": "µg/dL", "normal_range": "250-370"},
            {"id": "vitamin_b12", "name": "Vitamin B12", "unit": "pg/mL", "normal_range": "200-900"},
            {"id": "folate", "name": "Folate", "unit": "ng/mL", "normal_range": "2.7-17"},
            {"id": "d_dimer", "name": "D-Dimer", "unit": "ng/mL", "normal_range": "<500"},
        ]
    },
    "respiratory": {
        "name": "Respiratory System",
        "icon": "🫁",
        "parameters": [
            {"id": "fev1", "name": "FEV1 (Forced Expiratory Volume)", "unit": "% predicted", "normal_range": ">80"},
            {"id": "fvc", "name": "FVC (Forced Vital Capacity)", "unit": "% predicted", "normal_range": ">80"},
            {"id": "fev1_fvc_ratio", "name": "FEV1/FVC Ratio", "unit": "%", "normal_range": ">70"},
            {"id": "peak_flow", "name": "Peak Expiratory Flow", "unit": "L/min", "normal_range": "400-700"},
            {"id": "oxygen_saturation", "name": "Oxygen Saturation (SpO2)", "unit": "%", "normal_range": "95-100"},
            {"id": "pao2", "name": "Arterial pO2", "unit": "mmHg", "normal_range": "75-100"},
            {"id": "paco2", "name": "Arterial pCO2", "unit": "mmHg", "normal_range": "35-45"},
            {"id": "respiratory_rate", "name": "Respiratory Rate", "unit": "breaths/min", "normal_range": "12-20"},
        ]
    },
    "dermatological": {
        "name": "Dermatological System",
        "icon": "🧴",
        "parameters": [
            {"id": "skin_hydration", "name": "Skin Hydration", "unit": "AU", "normal_range": ">40"},
            {"id": "sebum_production", "name": "Sebum Production", "unit": "µg/cm²", "normal_range": "100-220"},
            {"id": "skin_elasticity", "name": "Skin Elasticity", "unit": "R2 value", "normal_range": ">0.55"},
            {"id": "melanin_index", "name": "Melanin Index", "unit": "AU", "normal_range": "varies"},
            {"id": "collagen_density", "name": "Collagen Density", "unit": "AU", "normal_range": "varies"},
            {"id": "wound_healing", "name": "Wound Healing Rate", "unit": "days", "normal_range": "7-21"},
        ]
    }
}

# ============================================================
# NUTRIENT TO PARAMETER EFFECTS MAPPING
# Detailed effects of each nutrient on body parameters
# ============================================================

NUTRIENT_PARAMETER_EFFECTS = {
    "potassium": {
        "name": "Potassium",
        "daily_value": 4700,
        "unit": "mg",
        "effects": {
            "cardiovascular": [
                {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "2-4 mmHg per 1000mg", "mechanism": "Promotes sodium excretion and arterial vasodilation"},
                {"parameter": "bp_diastolic", "direction": "decrease", "magnitude": "1-2 mmHg per 1000mg", "mechanism": "Reduces peripheral vascular resistance"},
                {"parameter": "heart_rate", "direction": "neutral", "mechanism": "Stabilizes cardiac rhythm"},
            ],
            "renal": [
                {"parameter": "serum_potassium", "direction": "increase", "magnitude": "0.1-0.3 mEq/L per 1000mg", "mechanism": "Direct supplementation"},
                {"parameter": "serum_sodium", "direction": "decrease", "magnitude": "mild", "mechanism": "Promotes natriuresis"},
                {"parameter": "urine_output", "direction": "increase", "mechanism": "Mild diuretic effect"},
            ],
            "neurological": [
                {"parameter": "cognitive_function", "direction": "neutral", "mechanism": "Essential for nerve impulse transmission"},
            ],
            "musculoskeletal": [
                {"parameter": "muscle_mass", "direction": "neutral", "mechanism": "Prevents muscle cramps, essential for contraction"},
                {"parameter": "bone_density", "direction": "increase", "magnitude": "mild", "mechanism": "Reduces urinary calcium excretion"},
            ]
        }
    },
    "sodium": {
        "name": "Sodium",
        "daily_value": 2300,
        "unit": "mg",
        "effects": {
            "cardiovascular": [
                {"parameter": "bp_systolic", "direction": "increase", "magnitude": "3-6 mmHg per 1000mg excess", "mechanism": "Fluid retention and arterial stiffening"},
                {"parameter": "bp_diastolic", "direction": "increase", "magnitude": "1-3 mmHg per 1000mg excess", "mechanism": "Increased blood volume"},
            ],
            "renal": [
                {"parameter": "serum_sodium", "direction": "increase", "mechanism": "Direct supplementation"},
                {"parameter": "gfr", "direction": "decrease", "magnitude": "chronic excess", "mechanism": "Hyperfiltration injury"},
                {"parameter": "urine_output", "direction": "decrease", "mechanism": "Water retention"},
            ],
            "musculoskeletal": [
                {"parameter": "bone_density", "direction": "decrease", "magnitude": "chronic high intake", "mechanism": "Increases urinary calcium loss"},
            ]
        }
    },
    "fiber": {
        "name": "Dietary Fiber",
        "daily_value": 28,
        "unit": "g",
        "effects": {
            "cardiovascular": [
                {"parameter": "ldl_cholesterol", "direction": "decrease", "magnitude": "5-10% per 10g", "mechanism": "Binds bile acids, increases excretion"},
                {"parameter": "total_cholesterol", "direction": "decrease", "magnitude": "3-5%", "mechanism": "Reduces cholesterol absorption"},
            ],
            "glycemic": [
                {"parameter": "postprandial_glucose", "direction": "decrease", "magnitude": "20-30%", "mechanism": "Slows glucose absorption"},
                {"parameter": "fasting_glucose", "direction": "decrease", "magnitude": "5-10 mg/dL", "mechanism": "Improves insulin sensitivity"},
                {"parameter": "hba1c", "direction": "decrease", "magnitude": "0.2-0.5%", "mechanism": "Better glycemic control"},
            ],
            "gastrointestinal": [
                {"parameter": "stool_frequency", "direction": "increase", "mechanism": "Adds bulk and promotes motility"},
                {"parameter": "gut_microbiome_diversity", "direction": "increase", "mechanism": "Prebiotic effect"},
                {"parameter": "intestinal_permeability", "direction": "decrease", "mechanism": "Supports gut barrier function"},
            ],
            "immune": [
                {"parameter": "il6", "direction": "decrease", "mechanism": "Anti-inflammatory effects via SCFA production"},
            ]
        }
    },
    "protein": {
        "name": "Protein",
        "daily_value": 50,
        "unit": "g",
        "effects": {
            "musculoskeletal": [
                {"parameter": "muscle_mass", "direction": "increase", "mechanism": "Essential for muscle protein synthesis"},
                {"parameter": "grip_strength", "direction": "increase", "mechanism": "Supports muscle function"},
                {"parameter": "bone_density", "direction": "increase", "magnitude": "moderate with adequate calcium", "mechanism": "Matrix protein for bone"},
            ],
            "renal": [
                {"parameter": "gfr", "direction": "increase", "magnitude": "acute", "mechanism": "Hyperfiltration response"},
                {"parameter": "bun", "direction": "increase", "mechanism": "Protein metabolism byproduct"},
            ],
            "glycemic": [
                {"parameter": "postprandial_glucose", "direction": "decrease", "mechanism": "Slows gastric emptying, stimulates insulin"},
            ],
            "immune": [
                {"parameter": "igg", "direction": "increase", "mechanism": "Antibody synthesis requires amino acids"},
            ]
        }
    },
    "vitamin_d": {
        "name": "Vitamin D",
        "daily_value": 20,
        "unit": "mcg",
        "effects": {
            "musculoskeletal": [
                {"parameter": "vitamin_d", "direction": "increase", "mechanism": "Direct supplementation"},
                {"parameter": "calcium_serum", "direction": "increase", "mechanism": "Enhances intestinal calcium absorption"},
                {"parameter": "bone_density", "direction": "increase", "magnitude": "1-2% annually", "mechanism": "Promotes bone mineralization"},
                {"parameter": "muscle_mass", "direction": "increase", "mechanism": "VDR in muscle tissue"},
            ],
            "immune": [
                {"parameter": "lymphocytes", "direction": "increase", "mechanism": "Modulates T-cell function"},
                {"parameter": "il6", "direction": "decrease", "mechanism": "Anti-inflammatory effects"},
            ],
            "cardiovascular": [
                {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "2-4 mmHg", "mechanism": "Renin-angiotensin modulation"},
            ],
            "neurological": [
                {"parameter": "depression_score", "direction": "decrease", "mechanism": "VDR in brain, serotonin synthesis"},
            ],
            "endocrine": [
                {"parameter": "pth", "direction": "decrease", "mechanism": "Negative feedback with adequate vitamin D"},
            ]
        }
    },
    "omega_3": {
        "name": "Omega-3 Fatty Acids",
        "daily_value": 1.6,
        "unit": "g",
        "effects": {
            "cardiovascular": [
                {"parameter": "triglycerides", "direction": "decrease", "magnitude": "15-30%", "mechanism": "Reduces hepatic VLDL production"},
                {"parameter": "heart_rate", "direction": "decrease", "magnitude": "2-3 bpm", "mechanism": "Membrane stabilization"},
                {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "2-4 mmHg", "mechanism": "Improves endothelial function"},
                {"parameter": "crp", "direction": "decrease", "mechanism": "Anti-inflammatory"},
            ],
            "neurological": [
                {"parameter": "cognitive_function", "direction": "increase", "mechanism": "DHA is brain structural component"},
                {"parameter": "depression_score", "direction": "decrease", "mechanism": "Anti-inflammatory, membrane fluidity"},
            ],
            "immune": [
                {"parameter": "il6", "direction": "decrease", "mechanism": "Resolvin and protectin production"},
                {"parameter": "tnf_alpha", "direction": "decrease", "mechanism": "Anti-inflammatory eicosanoids"},
            ],
            "dermatological": [
                {"parameter": "skin_hydration", "direction": "increase", "mechanism": "Lipid barrier support"},
            ]
        }
    },
    "iron": {
        "name": "Iron",
        "daily_value": 18,
        "unit": "mg",
        "effects": {
            "hematologic": [
                {"parameter": "hemoglobin", "direction": "increase", "mechanism": "Essential for heme synthesis"},
                {"parameter": "ferritin", "direction": "increase", "mechanism": "Iron storage"},
                {"parameter": "mcv", "direction": "increase", "magnitude": "if deficient", "mechanism": "Corrects microcytosis"},
            ],
            "neurological": [
                {"parameter": "cognitive_function", "direction": "increase", "magnitude": "if deficient", "mechanism": "Neurotransmitter synthesis"},
            ],
            "immune": [
                {"parameter": "lymphocytes", "direction": "increase", "magnitude": "if deficient", "mechanism": "Immune cell proliferation"},
            ],
            "musculoskeletal": [
                {"parameter": "muscle_mass", "direction": "neutral", "mechanism": "Myoglobin for oxygen storage"},
            ]
        }
    },
    "magnesium": {
        "name": "Magnesium",
        "daily_value": 420,
        "unit": "mg",
        "effects": {
            "cardiovascular": [
                {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "2-4 mmHg", "mechanism": "Vasodilation, calcium channel blocking"},
                {"parameter": "heart_rate", "direction": "neutral", "mechanism": "Stabilizes cardiac rhythm"},
            ],
            "glycemic": [
                {"parameter": "fasting_glucose", "direction": "decrease", "magnitude": "5-10 mg/dL", "mechanism": "Improves insulin sensitivity"},
                {"parameter": "homa_ir", "direction": "decrease", "mechanism": "Enhances insulin signaling"},
            ],
            "neurological": [
                {"parameter": "anxiety_score", "direction": "decrease", "mechanism": "GABA receptor modulation"},
                {"parameter": "sleep_quality", "direction": "increase", "mechanism": "Melatonin regulation"},
            ],
            "musculoskeletal": [
                {"parameter": "bone_density", "direction": "increase", "mechanism": "Bone crystal formation"},
                {"parameter": "muscle_mass", "direction": "neutral", "mechanism": "ATP production, muscle relaxation"},
            ]
        }
    },
    "vitamin_c": {
        "name": "Vitamin C",
        "daily_value": 90,
        "unit": "mg",
        "effects": {
            "immune": [
                {"parameter": "wbc_count", "direction": "increase", "magnitude": "if deficient", "mechanism": "Supports immune cell function"},
                {"parameter": "nk_cell_activity", "direction": "increase", "mechanism": "Enhances natural killer cell activity"},
            ],
            "dermatological": [
                {"parameter": "collagen_density", "direction": "increase", "mechanism": "Essential for collagen synthesis"},
                {"parameter": "wound_healing", "direction": "increase", "mechanism": "Antioxidant and collagen support"},
            ],
            "cardiovascular": [
                {"parameter": "ldl_cholesterol", "direction": "decrease", "magnitude": "mild", "mechanism": "Antioxidant protection"},
            ],
            "hematologic": [
                {"parameter": "iron_serum", "direction": "increase", "mechanism": "Enhances non-heme iron absorption"},
            ]
        }
    },
    "vitamin_b12": {
        "name": "Vitamin B12",
        "daily_value": 2.4,
        "unit": "mcg",
        "effects": {
            "hematologic": [
                {"parameter": "hemoglobin", "direction": "increase", "magnitude": "if deficient", "mechanism": "RBC maturation"},
                {"parameter": "mcv", "direction": "decrease", "magnitude": "if megaloblastic", "mechanism": "Corrects macrocytosis"},
                {"parameter": "vitamin_b12", "direction": "increase", "mechanism": "Direct supplementation"},
            ],
            "neurological": [
                {"parameter": "cognitive_function", "direction": "increase", "magnitude": "if deficient", "mechanism": "Myelin synthesis"},
            ],
            "cardiovascular": [
                {"parameter": "homocysteine", "direction": "decrease", "mechanism": "Methionine metabolism"},
            ]
        }
    },
    "calcium": {
        "name": "Calcium",
        "daily_value": 1000,
        "unit": "mg",
        "effects": {
            "musculoskeletal": [
                {"parameter": "bone_density", "direction": "increase", "mechanism": "Primary bone mineral"},
                {"parameter": "calcium_serum", "direction": "increase", "mechanism": "Direct supplementation"},
            ],
            "cardiovascular": [
                {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "mild", "mechanism": "Vasodilation"},
            ],
            "neurological": [
                {"parameter": "anxiety_score", "direction": "decrease", "magnitude": "mild", "mechanism": "Nerve impulse regulation"},
            ]
        }
    },
    "zinc": {
        "name": "Zinc",
        "daily_value": 11,
        "unit": "mg",
        "effects": {
            "immune": [
                {"parameter": "wbc_count", "direction": "increase", "magnitude": "if deficient", "mechanism": "T-cell development"},
                {"parameter": "nk_cell_activity", "direction": "increase", "mechanism": "Immune cell function"},
            ],
            "dermatological": [
                {"parameter": "wound_healing", "direction": "increase", "mechanism": "Cell division and protein synthesis"},
                {"parameter": "sebum_production", "direction": "decrease", "magnitude": "high doses", "mechanism": "Anti-androgenic effects"},
            ],
            "endocrine": [
                {"parameter": "testosterone", "direction": "increase", "magnitude": "if deficient", "mechanism": "Hormone synthesis"},
            ]
        }
    },
    "carbohydrates": {
        "name": "Carbohydrates",
        "daily_value": 275,
        "unit": "g",
        "effects": {
            "glycemic": [
                {"parameter": "postprandial_glucose", "direction": "increase", "magnitude": "varies by GI", "mechanism": "Direct glucose source"},
                {"parameter": "fasting_insulin", "direction": "increase", "mechanism": "Stimulates insulin release"},
            ],
            "neurological": [
                {"parameter": "serotonin", "direction": "increase", "mechanism": "Tryptophan uptake enhancement"},
                {"parameter": "cognitive_function", "direction": "increase", "magnitude": "acute", "mechanism": "Brain glucose supply"},
            ],
            "hepatic": [
                {"parameter": "liver_fat", "direction": "increase", "magnitude": "excess simple carbs", "mechanism": "De novo lipogenesis"},
            ]
        }
    },
    "saturated_fat": {
        "name": "Saturated Fat",
        "daily_value": 20,
        "unit": "g",
        "effects": {
            "cardiovascular": [
                {"parameter": "ldl_cholesterol", "direction": "increase", "magnitude": "10-15% with excess", "mechanism": "Reduces LDL receptor activity"},
                {"parameter": "total_cholesterol", "direction": "increase", "mechanism": "Hepatic cholesterol synthesis"},
                {"parameter": "crp", "direction": "increase", "magnitude": "chronic excess", "mechanism": "Pro-inflammatory"},
            ],
            "hepatic": [
                {"parameter": "liver_fat", "direction": "increase", "magnitude": "chronic excess", "mechanism": "Lipid accumulation"},
            ],
            "glycemic": [
                {"parameter": "homa_ir", "direction": "increase", "magnitude": "chronic excess", "mechanism": "Insulin resistance"},
            ]
        }
    },
    "cholesterol_dietary": {
        "name": "Dietary Cholesterol",
        "daily_value": 300,
        "unit": "mg",
        "effects": {
            "cardiovascular": [
                {"parameter": "total_cholesterol", "direction": "increase", "magnitude": "mild in most people", "mechanism": "Absorbed intestinally"},
                {"parameter": "ldl_cholesterol", "direction": "increase", "magnitude": "variable response", "mechanism": "Hyper-responders affected more"},
            ],
            "hepatic": [
                {"parameter": "liver_fat", "direction": "increase", "magnitude": "excess intake", "mechanism": "Hepatic accumulation"},
            ]
        }
    },
    "sugar": {
        "name": "Added Sugars",
        "daily_value": 50,
        "unit": "g",
        "effects": {
            "glycemic": [
                {"parameter": "postprandial_glucose", "direction": "increase", "magnitude": "rapid spike", "mechanism": "Rapid absorption"},
                {"parameter": "hba1c", "direction": "increase", "magnitude": "chronic excess", "mechanism": "Poor glycemic control"},
                {"parameter": "homa_ir", "direction": "increase", "mechanism": "Insulin resistance development"},
            ],
            "hepatic": [
                {"parameter": "liver_fat", "direction": "increase", "magnitude": "fructose especially", "mechanism": "De novo lipogenesis"},
                {"parameter": "alt", "direction": "increase", "magnitude": "chronic excess", "mechanism": "NAFLD development"},
            ],
            "cardiovascular": [
                {"parameter": "triglycerides", "direction": "increase", "mechanism": "Hepatic VLDL production"},
            ],
            "dermatological": [
                {"parameter": "skin_elasticity", "direction": "decrease", "mechanism": "Advanced glycation end products"},
            ]
        }
    },
    "antioxidants": {
        "name": "Antioxidants (Polyphenols)",
        "daily_value": 1000,
        "unit": "mg",
        "effects": {
            "cardiovascular": [
                {"parameter": "ldl_cholesterol", "direction": "decrease", "magnitude": "5-10%", "mechanism": "Prevents LDL oxidation"},
                {"parameter": "crp", "direction": "decrease", "mechanism": "Anti-inflammatory"},
                {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "2-4 mmHg", "mechanism": "Nitric oxide enhancement"},
            ],
            "neurological": [
                {"parameter": "cognitive_function", "direction": "increase", "mechanism": "Neuroprotection"},
            ],
            "immune": [
                {"parameter": "il6", "direction": "decrease", "mechanism": "Anti-inflammatory"},
            ],
            "dermatological": [
                {"parameter": "skin_elasticity", "direction": "increase", "mechanism": "Collagen protection"},
            ]
        }
    }
}

# Export for use in other scripts
if __name__ == "__main__":
    print(f"Defined {len(ORGAN_SYSTEMS)} organ systems")
    total_params = sum(len(s['parameters']) for s in ORGAN_SYSTEMS.values())
    print(f"Total parameters: {total_params}")
    print(f"Defined {len(NUTRIENT_PARAMETER_EFFECTS)} nutrient effect mappings")
