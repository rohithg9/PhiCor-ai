"""
PhiCor Food Engine - Comprehensive Nutrients Database
THE BACKBONE of the Food Engine

This module contains scientifically accurate data for all nutrients including:
- Daily Values (RDI for adults)
- Parameter effects on each organ system
- Disease interactions (beneficial/harmful/contraindicated)
- Drug interactions
- Deficiency and toxicity effects

Data sources: NIH, WHO, USDA, peer-reviewed literature
"""

# Daily Value Reference: FDA 2020 Daily Values for Adults
# Based on 2000 calorie diet

NUTRIENTS_DATABASE = {
    # ============================================================
    # MACRONUTRIENTS
    # ============================================================
    "energy": {
        "id": "energy",
        "name": "Energy",
        "category": "macronutrient",
        "unit": "kcal",
        "daily_value": 2000,
        "daily_value_unit": "kcal",
        "description": "Total caloric energy from food",
        "parameter_effects": {
            "metabolic": [
                {"parameter": "basal_metabolic_rate", "direction": "increase", "mechanism": "Substrate availability for cellular respiration"},
                {"parameter": "body_weight", "direction": "increase", "mechanism": "Positive energy balance leads to fat storage", "threshold": ">2500 kcal/day chronic"},
                {"parameter": "blood_glucose", "direction": "increase", "mechanism": "Carbohydrate and protein metabolism", "duration": "acute postprandial"}
            ],
            "cardiovascular": [
                {"parameter": "cardiac_workload", "direction": "increase", "mechanism": "Increased metabolic demand", "magnitude": "proportional to intake"}
            ]
        },
        "disease_interactions": {
            "beneficial": [],
            "caution": [
                {"disease": "obesity", "reason": "Excess energy stored as adipose tissue"},
                {"disease": "type_2_diabetes", "reason": "Excess intake worsens insulin resistance"},
                {"disease": "heart_failure", "reason": "Excess weight increases cardiac workload"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [],
        "deficiency_effects": ["weight_loss", "muscle_wasting", "fatigue", "weakened_immunity"],
        "toxicity_effects": ["obesity", "metabolic_syndrome", "fatty_liver"]
    },
    
    "protein": {
        "id": "protein",
        "name": "Protein",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 50,
        "daily_value_unit": "g",
        "description": "Essential macronutrient for tissue building and repair",
        "parameter_effects": {
            "renal": [
                {"parameter": "GFR", "direction": "decrease", "mechanism": "High protein increases glomerular filtration pressure", "threshold": ">1.5g/kg/day in CKD"},
                {"parameter": "serum_creatinine", "direction": "increase", "mechanism": "Increased creatinine production from protein metabolism"},
                {"parameter": "BUN", "direction": "increase", "mechanism": "Urea is end product of protein metabolism"}
            ],
            "hepatic": [
                {"parameter": "albumin_synthesis", "direction": "increase", "mechanism": "Amino acids required for hepatic protein synthesis"},
                {"parameter": "ammonia", "direction": "increase", "mechanism": "Deamination of amino acids produces ammonia", "concern_in": "hepatic_encephalopathy"}
            ],
            "musculoskeletal": [
                {"parameter": "muscle_protein_synthesis", "direction": "increase", "mechanism": "Amino acids are building blocks for muscle"},
                {"parameter": "bone_mineral_density", "direction": "variable", "mechanism": "Adequate protein supports bone matrix, excess may increase calcium excretion"}
            ],
            "metabolic": [
                {"parameter": "satiety", "direction": "increase", "mechanism": "Protein has highest satiety index among macros"},
                {"parameter": "thermogenesis", "direction": "increase", "mechanism": "Diet-induced thermogenesis highest for protein (20-30%)"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "sarcopenia", "reason": "Essential for muscle maintenance"},
                {"disease": "wound_healing", "reason": "Required for tissue repair"},
                {"disease": "malnutrition", "reason": "Critical macronutrient"}
            ],
            "caution": [
                {"disease": "chronic_kidney_disease", "reason": "May accelerate GFR decline in advanced CKD", "recommendation": "0.6-0.8g/kg/day"},
                {"disease": "hepatic_encephalopathy", "reason": "Ammonia from protein worsens encephalopathy", "recommendation": "temporary restriction"},
                {"disease": "gout", "reason": "Purine-rich proteins increase uric acid"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "levodopa", "interaction": "competition", "mechanism": "Amino acids compete with levodopa for absorption"},
            {"drug": "warfarin", "interaction": "variable", "mechanism": "High protein intake may affect vitamin K status"}
        ],
        "deficiency_effects": ["muscle_wasting", "edema", "impaired_immunity", "poor_wound_healing", "hair_loss"],
        "toxicity_effects": ["kidney_strain", "dehydration", "calcium_loss"]
    },
    
    "carbohydrates": {
        "id": "carbohydrates",
        "name": "Carbohydrates",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 275,
        "daily_value_unit": "g",
        "description": "Primary energy source for the body",
        "parameter_effects": {
            "glycemic": [
                {"parameter": "blood_glucose", "direction": "increase", "mechanism": "Direct conversion to glucose", "magnitude": "depends on glycemic index"},
                {"parameter": "insulin", "direction": "increase", "mechanism": "Glucose stimulates pancreatic insulin release"},
                {"parameter": "HbA1c", "direction": "increase", "mechanism": "Chronic high carb intake elevates average glucose", "duration": "chronic"}
            ],
            "hepatic": [
                {"parameter": "glycogen_stores", "direction": "increase", "mechanism": "Excess glucose stored as hepatic glycogen"},
                {"parameter": "triglycerides", "direction": "increase", "mechanism": "De novo lipogenesis from excess carbohydrates"}
            ],
            "neurological": [
                {"parameter": "cognitive_function", "direction": "increase", "mechanism": "Brain's primary fuel source"},
                {"parameter": "mood", "direction": "variable", "mechanism": "Affects serotonin synthesis"}
            ],
            "cardiovascular": [
                {"parameter": "triglycerides", "direction": "increase", "mechanism": "Simple carbs converted to VLDL triglycerides"},
                {"parameter": "HDL_cholesterol", "direction": "decrease", "mechanism": "High carb, low fat diets may lower HDL"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "hypoglycemia", "reason": "Rapid glucose source"},
                {"disease": "athletic_performance", "reason": "Primary fuel for high-intensity exercise"}
            ],
            "caution": [
                {"disease": "type_2_diabetes", "reason": "Elevates blood glucose", "recommendation": "focus on complex carbs, limit simple sugars"},
                {"disease": "type_1_diabetes", "reason": "Requires insulin dosing adjustment"},
                {"disease": "NAFLD", "reason": "Excess converted to hepatic fat"},
                {"disease": "hypertriglyceridemia", "reason": "Simple carbs increase triglyceride synthesis"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "metformin", "interaction": "beneficial", "mechanism": "Reducing carb intake enhances metformin efficacy"},
            {"drug": "insulin", "interaction": "dosing", "mechanism": "Carb intake determines insulin requirements"}
        ],
        "deficiency_effects": ["ketosis", "fatigue", "muscle_weakness", "constipation"],
        "toxicity_effects": ["obesity", "insulin_resistance", "fatty_liver", "dental_caries"]
    },
    
    "fiber": {
        "id": "fiber",
        "name": "Dietary Fiber",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 28,
        "daily_value_unit": "g",
        "description": "Indigestible plant material essential for gut health",
        "parameter_effects": {
            "gastrointestinal": [
                {"parameter": "bowel_transit_time", "direction": "decrease", "mechanism": "Bulk-forming effect speeds transit"},
                {"parameter": "stool_consistency", "direction": "improve", "mechanism": "Water absorption and bulk formation"},
                {"parameter": "microbiome_diversity", "direction": "increase", "mechanism": "Prebiotic effect feeds beneficial bacteria"},
                {"parameter": "colonic_pH", "direction": "decrease", "mechanism": "SCFA production lowers pH"}
            ],
            "glycemic": [
                {"parameter": "blood_glucose", "direction": "decrease", "mechanism": "Slows carbohydrate absorption"},
                {"parameter": "insulin_sensitivity", "direction": "increase", "mechanism": "Reduced glucose spikes improve sensitivity"},
                {"parameter": "postprandial_glucose_peak", "direction": "decrease", "mechanism": "Gel-forming fibers delay gastric emptying"}
            ],
            "cardiovascular": [
                {"parameter": "LDL_cholesterol", "direction": "decrease", "mechanism": "Soluble fiber binds bile acids, increases LDL clearance"},
                {"parameter": "total_cholesterol", "direction": "decrease", "mechanism": "5-10% reduction with adequate intake"},
                {"parameter": "blood_pressure", "direction": "decrease", "mechanism": "Improved vascular function from SCFA"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "constipation", "reason": "Increases stool bulk and promotes regularity"},
                {"disease": "type_2_diabetes", "reason": "Improves glycemic control"},
                {"disease": "hypercholesterolemia", "reason": "Lowers LDL cholesterol"},
                {"disease": "colorectal_cancer", "reason": "Protective effect from SCFA and reduced transit time"},
                {"disease": "diverticular_disease", "reason": "Prevents diverticula formation"},
                {"disease": "obesity", "reason": "Increases satiety, reduces caloric intake"}
            ],
            "caution": [
                {"disease": "IBD_flare", "reason": "Insoluble fiber may worsen symptoms during flares"},
                {"disease": "bowel_obstruction", "reason": "Can worsen obstruction"},
                {"disease": "gastroparesis", "reason": "May worsen gastric retention"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "all_medications", "interaction": "absorption", "mechanism": "Take medications 1 hour before or 2 hours after high fiber meals"},
            {"drug": "levothyroxine", "interaction": "reduced_absorption", "mechanism": "Fiber binds thyroid hormone"},
            {"drug": "digoxin", "interaction": "reduced_absorption", "mechanism": "Fiber may reduce digoxin bioavailability"}
        ],
        "deficiency_effects": ["constipation", "increased_cholesterol", "poor_glycemic_control", "increased_colorectal_cancer_risk"],
        "toxicity_effects": ["bloating", "gas", "abdominal_cramping", "mineral_malabsorption_if_excessive"]
    },
    
    "fat_total": {
        "id": "fat_total",
        "name": "Total Fat",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 78,
        "daily_value_unit": "g",
        "description": "Essential macronutrient for energy, hormone production, and nutrient absorption",
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "LDL_cholesterol", "direction": "variable", "mechanism": "Depends on fat type - saturated increases, unsaturated neutral/decreases"},
                {"parameter": "HDL_cholesterol", "direction": "variable", "mechanism": "Monounsaturated fats may increase HDL"},
                {"parameter": "triglycerides", "direction": "variable", "mechanism": "Omega-3 decreases, excess calories increase"}
            ],
            "hepatic": [
                {"parameter": "hepatic_fat_content", "direction": "increase", "mechanism": "Excess fat stored in liver", "threshold": "excess intake"},
                {"parameter": "bile_production", "direction": "increase", "mechanism": "Fat stimulates cholecystokinin and bile release"}
            ],
            "endocrine": [
                {"parameter": "testosterone", "direction": "increase", "mechanism": "Cholesterol is precursor for steroid hormones"},
                {"parameter": "estrogen", "direction": "increase", "mechanism": "Adipose tissue produces estrogen"}
            ],
            "neurological": [
                {"parameter": "myelin_integrity", "direction": "maintain", "mechanism": "Fat essential for myelin sheath"},
                {"parameter": "cognitive_function", "direction": "maintain", "mechanism": "Brain is 60% fat by dry weight"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "fat_soluble_vitamin_deficiency", "reason": "Required for absorption of A, D, E, K"},
                {"disease": "essential_fatty_acid_deficiency", "reason": "Source of omega-3 and omega-6"}
            ],
            "caution": [
                {"disease": "obesity", "reason": "Most calorie-dense macronutrient (9 kcal/g)"},
                {"disease": "cardiovascular_disease", "reason": "Saturated/trans fats increase CVD risk"},
                {"disease": "gallbladder_disease", "reason": "High fat meals trigger gallbladder contraction"},
                {"disease": "pancreatitis", "reason": "High fat worsens pancreatic inflammation"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "orlistat", "interaction": "mechanism", "mechanism": "Orlistat blocks fat absorption - take with fat-containing meals"},
            {"drug": "fat_soluble_drugs", "interaction": "enhanced_absorption", "mechanism": "Fat increases absorption of lipophilic drugs"}
        ],
        "deficiency_effects": ["essential_fatty_acid_deficiency", "fat_soluble_vitamin_deficiency", "dry_skin", "hormone_imbalance"],
        "toxicity_effects": ["obesity", "cardiovascular_disease", "fatty_liver"]
    },
    
    "fat_saturated": {
        "id": "fat_saturated",
        "name": "Saturated Fat",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 20,
        "daily_value_unit": "g",
        "daily_value_note": "Limit to <10% of calories",
        "description": "Fat with no double bonds, solid at room temperature",
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "LDL_cholesterol", "direction": "increase", "mechanism": "Downregulates hepatic LDL receptors", "magnitude": "significant"},
                {"parameter": "total_cholesterol", "direction": "increase", "mechanism": "Increases hepatic cholesterol synthesis"},
                {"parameter": "atherosclerosis_risk", "direction": "increase", "mechanism": "Promotes plaque formation"}
            ],
            "metabolic": [
                {"parameter": "insulin_sensitivity", "direction": "decrease", "mechanism": "Saturated fat promotes insulin resistance"},
                {"parameter": "inflammation", "direction": "increase", "mechanism": "Activates inflammatory pathways"}
            ]
        },
        "disease_interactions": {
            "beneficial": [],
            "caution": [
                {"disease": "cardiovascular_disease", "reason": "Strongly associated with increased CVD risk", "recommendation": "<7% of calories"},
                {"disease": "hypercholesterolemia", "reason": "Primary dietary driver of elevated LDL"},
                {"disease": "type_2_diabetes", "reason": "Worsens insulin resistance"},
                {"disease": "obesity", "reason": "Calorie-dense, promotes fat storage"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "statins", "interaction": "counteract", "mechanism": "High saturated fat intake reduces statin efficacy"}
        ],
        "deficiency_effects": [],
        "toxicity_effects": ["elevated_LDL", "atherosclerosis", "cardiovascular_disease", "insulin_resistance"]
    },
    
    "fat_trans": {
        "id": "fat_trans",
        "name": "Trans Fat",
        "category": "macronutrient",
        "unit": "g",
        "daily_value": 0,
        "daily_value_unit": "g",
        "daily_value_note": "Avoid completely - no safe level",
        "description": "Industrially hydrogenated fats, most harmful fat type",
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "LDL_cholesterol", "direction": "increase", "mechanism": "More potent than saturated fat at raising LDL", "magnitude": "severe"},
                {"parameter": "HDL_cholesterol", "direction": "decrease", "mechanism": "Uniquely lowers protective HDL"},
                {"parameter": "Lp(a)", "direction": "increase", "mechanism": "Raises atherogenic lipoprotein(a)"},
                {"parameter": "inflammation", "direction": "increase", "mechanism": "Promotes systemic inflammation"}
            ]
        },
        "disease_interactions": {
            "beneficial": [],
            "caution": [],
            "contraindicated": [
                {"disease": "cardiovascular_disease", "reason": "Strongest dietary risk factor for CVD"},
                {"disease": "all_conditions", "reason": "No safe level - avoid completely"}
            ]
        },
        "drug_interactions": [],
        "deficiency_effects": [],
        "toxicity_effects": ["cardiovascular_disease", "stroke", "type_2_diabetes", "sudden_cardiac_death"]
    },
    
    "cholesterol": {
        "id": "cholesterol",
        "name": "Dietary Cholesterol",
        "category": "macronutrient",
        "unit": "mg",
        "daily_value": 300,
        "daily_value_unit": "mg",
        "description": "Sterol found in animal products",
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "serum_cholesterol", "direction": "increase", "mechanism": "Variable response - some individuals hyper-responders", "magnitude": "mild_to_moderate"},
                {"parameter": "LDL_cholesterol", "direction": "increase", "mechanism": "Less impact than saturated fat on LDL"}
            ],
            "hepatic": [
                {"parameter": "bile_production", "direction": "increase", "mechanism": "Cholesterol excreted in bile"},
                {"parameter": "endogenous_cholesterol_synthesis", "direction": "decrease", "mechanism": "Feedback inhibition of HMG-CoA reductase"}
            ]
        },
        "disease_interactions": {
            "beneficial": [],
            "caution": [
                {"disease": "hypercholesterolemia", "reason": "Contributes to elevated cholesterol in hyper-responders"},
                {"disease": "cardiovascular_disease", "reason": "May increase CVD risk in susceptible individuals"},
                {"disease": "familial_hypercholesterolemia", "reason": "Strict limitation required"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "ezetimibe", "interaction": "target", "mechanism": "Ezetimibe blocks intestinal cholesterol absorption"}
        ],
        "deficiency_effects": [],
        "toxicity_effects": ["hypercholesterolemia", "gallstones"]
    },

    # ============================================================
    # ELECTROLYTES
    # ============================================================
    "sodium": {
        "id": "sodium",
        "name": "Sodium",
        "category": "electrolyte",
        "unit": "mg",
        "daily_value": 2300,
        "daily_value_unit": "mg",
        "daily_value_note": "Upper limit - ideal is 1500mg for most adults",
        "description": "Essential electrolyte for fluid balance and nerve function",
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "blood_pressure_systolic", "direction": "increase", "mechanism": "Sodium retention increases blood volume and vascular resistance", "magnitude": "2-8 mmHg per 2300mg"},
                {"parameter": "blood_pressure_diastolic", "direction": "increase", "mechanism": "Volume expansion increases cardiac output"},
                {"parameter": "left_ventricular_mass", "direction": "increase", "mechanism": "Chronic hypertension causes LVH", "duration": "chronic"}
            ],
            "renal": [
                {"parameter": "urine_sodium", "direction": "increase", "mechanism": "Kidneys excrete excess sodium"},
                {"parameter": "GFR", "direction": "variable", "mechanism": "Acute sodium load increases GFR, chronic excess damages nephrons"},
                {"parameter": "proteinuria", "direction": "increase", "mechanism": "High sodium worsens proteinuria in CKD"}
            ],
            "neurological": [
                {"parameter": "serum_sodium", "direction": "increase", "mechanism": "Direct elevation", "normal_range": "136-145 mEq/L"},
                {"parameter": "nerve_conduction", "direction": "maintain", "mechanism": "Essential for action potentials"}
            ],
            "fluid_balance": [
                {"parameter": "extracellular_fluid_volume", "direction": "increase", "mechanism": "Sodium is primary ECF cation"},
                {"parameter": "edema", "direction": "increase", "mechanism": "Sodium retention causes fluid accumulation", "threshold": ">3000mg/day chronic"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "hyponatremia", "reason": "Replacement therapy for sodium deficiency"},
                {"disease": "orthostatic_hypotension", "reason": "May help maintain blood pressure"}
            ],
            "caution": [
                {"disease": "hypertension", "reason": "Primary dietary factor in BP elevation", "recommendation": "<1500mg/day"},
                {"disease": "heart_failure", "reason": "Causes fluid retention, worsens congestion", "recommendation": "<2000mg/day"},
                {"disease": "chronic_kidney_disease", "reason": "Impaired excretion leads to retention", "recommendation": "<2000mg/day"},
                {"disease": "cirrhosis_with_ascites", "reason": "Worsens fluid accumulation", "recommendation": "<2000mg/day"},
                {"disease": "nephrotic_syndrome", "reason": "Exacerbates edema"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "ACE_inhibitors", "interaction": "reduced_efficacy", "mechanism": "High sodium blunts antihypertensive effect"},
            {"drug": "diuretics", "interaction": "balance", "mechanism": "High sodium counteracts diuretic effect"},
            {"drug": "lithium", "interaction": "toxicity_risk", "mechanism": "Low sodium intake increases lithium levels"},
            {"drug": "corticosteroids", "interaction": "enhanced_retention", "mechanism": "Steroids increase sodium retention"}
        ],
        "deficiency_effects": ["hyponatremia", "confusion", "seizures", "muscle_cramps", "fatigue"],
        "toxicity_effects": ["hypertension", "edema", "stroke", "heart_failure", "kidney_disease", "osteoporosis"]
    },
    
    "potassium": {
        "id": "potassium",
        "name": "Potassium",
        "category": "electrolyte",
        "unit": "mg",
        "daily_value": 4700,
        "daily_value_unit": "mg",
        "description": "Essential electrolyte for heart, muscle, and nerve function",
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "blood_pressure_systolic", "direction": "decrease", "mechanism": "Promotes sodium excretion, vasodilation", "magnitude": "2-4 mmHg per 1000mg increase"},
                {"parameter": "blood_pressure_diastolic", "direction": "decrease", "mechanism": "Reduces vascular resistance"},
                {"parameter": "heart_rate", "direction": "regulate", "mechanism": "Essential for cardiac action potential"},
                {"parameter": "arrhythmia_risk", "direction": "decrease", "mechanism": "Stabilizes cardiac membrane potential", "optimal_range": "3.5-5.0 mEq/L"},
                {"parameter": "stroke_risk", "direction": "decrease", "mechanism": "BP reduction and vascular protection"}
            ],
            "renal": [
                {"parameter": "serum_potassium", "direction": "increase", "mechanism": "Direct elevation from dietary intake"},
                {"parameter": "urine_potassium", "direction": "increase", "mechanism": "Excess excreted by kidneys"},
                {"parameter": "kidney_stone_risk", "direction": "decrease", "mechanism": "Reduces urinary calcium excretion"}
            ],
            "musculoskeletal": [
                {"parameter": "muscle_contraction", "direction": "maintain", "mechanism": "Required for neuromuscular junction function"},
                {"parameter": "bone_mineral_density", "direction": "increase", "mechanism": "Alkaline effect reduces calcium loss"},
                {"parameter": "muscle_cramps", "direction": "decrease", "mechanism": "Adequate potassium prevents cramping"}
            ],
            "metabolic": [
                {"parameter": "insulin_secretion", "direction": "facilitate", "mechanism": "Potassium required for beta cell function"},
                {"parameter": "glucose_tolerance", "direction": "improve", "mechanism": "Supports insulin action"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "hypertension", "reason": "Significant BP-lowering effect", "recommendation": "4700mg/day"},
                {"disease": "stroke_prevention", "reason": "High intake reduces stroke risk by 20%"},
                {"disease": "osteoporosis", "reason": "Reduces urinary calcium loss"},
                {"disease": "kidney_stones", "reason": "Decreases stone formation"},
                {"disease": "hypokalemia", "reason": "Replacement therapy"}
            ],
            "caution": [
                {"disease": "chronic_kidney_disease", "reason": "Impaired excretion leads to dangerous accumulation", "recommendation": "2000-3000mg/day in CKD 3-5"},
                {"disease": "acute_kidney_injury", "reason": "Risk of life-threatening hyperkalemia"},
                {"disease": "adrenal_insufficiency", "reason": "Reduced aldosterone impairs potassium excretion"},
                {"disease": "type_1_diabetes_with_DKA", "reason": "Total body potassium often depleted despite elevated serum levels"}
            ],
            "contraindicated": [
                {"disease": "severe_hyperkalemia", "reason": "Life-threatening cardiac effects at K+ >6.5 mEq/L"}
            ]
        },
        "drug_interactions": [
            {"drug": "ACE_inhibitors", "interaction": "hyperkalemia_risk", "mechanism": "Both reduce potassium excretion"},
            {"drug": "ARBs", "interaction": "hyperkalemia_risk", "mechanism": "Similar mechanism to ACE inhibitors"},
            {"drug": "potassium_sparing_diuretics", "interaction": "hyperkalemia_risk", "mechanism": "Spironolactone, amiloride reduce K+ excretion"},
            {"drug": "NSAIDs", "interaction": "hyperkalemia_risk", "mechanism": "Reduce renal potassium excretion"},
            {"drug": "digoxin", "interaction": "toxicity_protection", "mechanism": "Normal potassium levels protect against digoxin toxicity"},
            {"drug": "loop_diuretics", "interaction": "increased_need", "mechanism": "Furosemide increases potassium excretion"},
            {"drug": "thiazide_diuretics", "interaction": "increased_need", "mechanism": "Thiazides increase potassium excretion"}
        ],
        "deficiency_effects": ["hypokalemia", "muscle_weakness", "cardiac_arrhythmias", "fatigue", "constipation", "paralysis"],
        "toxicity_effects": ["hyperkalemia", "cardiac_arrest", "muscle_weakness", "paresthesias", "bradycardia"]
    },
    
    "calcium": {
        "id": "calcium",
        "name": "Calcium",
        "category": "electrolyte",
        "unit": "mg",
        "daily_value": 1300,
        "daily_value_unit": "mg",
        "description": "Essential mineral for bones, teeth, muscle, and nerve function",
        "parameter_effects": {
            "musculoskeletal": [
                {"parameter": "bone_mineral_density", "direction": "increase", "mechanism": "Primary structural component of bone matrix"},
                {"parameter": "bone_resorption", "direction": "decrease", "mechanism": "Adequate calcium suppresses PTH-mediated bone loss"},
                {"parameter": "fracture_risk", "direction": "decrease", "mechanism": "Stronger bones resist fracture"}
            ],
            "cardiovascular": [
                {"parameter": "blood_pressure", "direction": "decrease", "mechanism": "Mild BP-lowering effect", "magnitude": "1-2 mmHg"},
                {"parameter": "vascular_calcification", "direction": "variable", "mechanism": "Excess supplemental calcium may increase calcification risk"},
                {"parameter": "cardiac_muscle_contraction", "direction": "maintain", "mechanism": "Calcium essential for excitation-contraction coupling"}
            ],
            "neurological": [
                {"parameter": "nerve_transmission", "direction": "maintain", "mechanism": "Required for neurotransmitter release"},
                {"parameter": "muscle_contraction", "direction": "maintain", "mechanism": "Triggers actin-myosin interaction"}
            ],
            "coagulation": [
                {"parameter": "clotting_factor_activity", "direction": "maintain", "mechanism": "Calcium is clotting factor IV"}
            ],
            "renal": [
                {"parameter": "serum_calcium", "direction": "increase", "mechanism": "Absorbed from gut, tightly regulated"},
                {"parameter": "urinary_calcium", "direction": "increase", "mechanism": "Excess excreted in urine"},
                {"parameter": "kidney_stone_risk", "direction": "variable", "mechanism": "Dietary calcium reduces risk, supplements may increase it"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "osteoporosis", "reason": "Essential for bone maintenance", "recommendation": "1200mg/day with vitamin D"},
                {"disease": "hypocalcemia", "reason": "Replacement therapy"},
                {"disease": "hypertension", "reason": "Modest BP-lowering effect"},
                {"disease": "colon_cancer", "reason": "May reduce colorectal cancer risk"}
            ],
            "caution": [
                {"disease": "hypercalcemia", "reason": "Can worsen elevated calcium levels"},
                {"disease": "kidney_stones_calcium_oxalate", "reason": "Supplements (not dietary) may increase risk"},
                {"disease": "sarcoidosis", "reason": "Increased calcium absorption and hypercalcemia risk"},
                {"disease": "cardiovascular_disease", "reason": "High-dose supplements may increase CV risk"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "bisphosphonates", "interaction": "absorption_interference", "mechanism": "Take bisphosphonates separately - calcium blocks absorption"},
            {"drug": "levothyroxine", "interaction": "absorption_interference", "mechanism": "Calcium reduces thyroid hormone absorption"},
            {"drug": "fluoroquinolones", "interaction": "absorption_interference", "mechanism": "Calcium chelates quinolone antibiotics"},
            {"drug": "tetracyclines", "interaction": "absorption_interference", "mechanism": "Forms insoluble complexes"},
            {"drug": "thiazide_diuretics", "interaction": "hypercalcemia_risk", "mechanism": "Thiazides reduce urinary calcium excretion"},
            {"drug": "digoxin", "interaction": "toxicity_risk", "mechanism": "Hypercalcemia increases digoxin toxicity"}
        ],
        "deficiency_effects": ["osteoporosis", "osteomalacia", "muscle_cramps", "tetany", "numbness", "seizures"],
        "toxicity_effects": ["hypercalcemia", "kidney_stones", "constipation", "nausea", "vascular_calcification"]
    },
    
    "magnesium": {
        "id": "magnesium",
        "name": "Magnesium",
        "category": "electrolyte",
        "unit": "mg",
        "daily_value": 420,
        "daily_value_unit": "mg",
        "description": "Essential mineral involved in >300 enzymatic reactions",
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "blood_pressure", "direction": "decrease", "mechanism": "Vasodilation and reduced vascular resistance", "magnitude": "2-3 mmHg"},
                {"parameter": "heart_rhythm", "direction": "stabilize", "mechanism": "Regulates cardiac ion channels"},
                {"parameter": "arrhythmia_risk", "direction": "decrease", "mechanism": "Prevents abnormal electrical activity"},
                {"parameter": "endothelial_function", "direction": "improve", "mechanism": "Reduces oxidative stress"}
            ],
            "musculoskeletal": [
                {"parameter": "muscle_relaxation", "direction": "improve", "mechanism": "Antagonizes calcium-mediated contraction"},
                {"parameter": "bone_mineral_density", "direction": "maintain", "mechanism": "60% of body magnesium in bones"},
                {"parameter": "muscle_cramps", "direction": "decrease", "mechanism": "Adequate magnesium prevents cramping"}
            ],
            "neurological": [
                {"parameter": "NMDA_receptor_activity", "direction": "modulate", "mechanism": "Natural NMDA receptor antagonist"},
                {"parameter": "migraine_frequency", "direction": "decrease", "mechanism": "Reduces cortical spreading depression"},
                {"parameter": "anxiety", "direction": "decrease", "mechanism": "GABAergic effects"}
            ],
            "metabolic": [
                {"parameter": "insulin_sensitivity", "direction": "increase", "mechanism": "Required for insulin receptor function"},
                {"parameter": "blood_glucose", "direction": "decrease", "mechanism": "Improves glucose uptake"},
                {"parameter": "ATP_production", "direction": "maintain", "mechanism": "Mg-ATP is active form of ATP"}
            ],
            "renal": [
                {"parameter": "serum_magnesium", "direction": "increase", "mechanism": "Absorbed from gut", "normal_range": "1.7-2.3 mg/dL"},
                {"parameter": "kidney_stone_risk", "direction": "decrease", "mechanism": "Inhibits calcium oxalate crystallization"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "hypertension", "reason": "Modest BP-lowering effect"},
                {"disease": "type_2_diabetes", "reason": "Improves insulin sensitivity"},
                {"disease": "migraine", "reason": "Prophylactic effect on migraine frequency"},
                {"disease": "constipation", "reason": "Osmotic laxative effect"},
                {"disease": "preeclampsia", "reason": "IV magnesium is first-line treatment"},
                {"disease": "arrhythmias", "reason": "Stabilizes cardiac membrane"}
            ],
            "caution": [
                {"disease": "chronic_kidney_disease", "reason": "Impaired excretion can cause accumulation", "recommendation": "monitor levels"},
                {"disease": "myasthenia_gravis", "reason": "May worsen neuromuscular weakness"}
            ],
            "contraindicated": [
                {"disease": "severe_renal_failure", "reason": "Risk of life-threatening hypermagnesemia"}
            ]
        },
        "drug_interactions": [
            {"drug": "bisphosphonates", "interaction": "absorption_interference", "mechanism": "Separate administration by 2 hours"},
            {"drug": "fluoroquinolones", "interaction": "absorption_interference", "mechanism": "Chelation reduces antibiotic absorption"},
            {"drug": "proton_pump_inhibitors", "interaction": "deficiency_risk", "mechanism": "Long-term PPI use reduces magnesium absorption"},
            {"drug": "loop_diuretics", "interaction": "increased_loss", "mechanism": "Increase urinary magnesium excretion"},
            {"drug": "digoxin", "interaction": "toxicity_protection", "mechanism": "Adequate magnesium reduces digoxin toxicity risk"}
        ],
        "deficiency_effects": ["muscle_cramps", "tremor", "arrhythmias", "seizures", "hypokalemia", "hypocalcemia"],
        "toxicity_effects": ["diarrhea", "hypotension", "respiratory_depression", "cardiac_arrest"]
    },
    
    "phosphorus": {
        "id": "phosphorus",
        "name": "Phosphorus",
        "category": "electrolyte",
        "unit": "mg",
        "daily_value": 1250,
        "daily_value_unit": "mg",
        "description": "Essential mineral for bones, energy metabolism, and cell function",
        "parameter_effects": {
            "musculoskeletal": [
                {"parameter": "bone_mineral_density", "direction": "maintain", "mechanism": "Calcium-phosphorus ratio critical for bone health"},
                {"parameter": "bone_formation", "direction": "support", "mechanism": "Phosphate incorporated into hydroxyapatite"}
            ],
            "renal": [
                {"parameter": "serum_phosphorus", "direction": "increase", "mechanism": "Absorbed from gut, renally excreted", "normal_range": "2.5-4.5 mg/dL"},
                {"parameter": "FGF23", "direction": "increase", "mechanism": "High phosphorus stimulates FGF23 release"},
                {"parameter": "PTH", "direction": "increase", "mechanism": "Hyperphosphatemia stimulates PTH secretion"}
            ],
            "cardiovascular": [
                {"parameter": "vascular_calcification", "direction": "increase", "mechanism": "High phosphorus promotes arterial calcification in CKD"},
                {"parameter": "cardiovascular_mortality", "direction": "increase", "mechanism": "Elevated phosphorus associated with CV death in CKD"}
            ],
            "metabolic": [
                {"parameter": "ATP_production", "direction": "maintain", "mechanism": "Phosphate essential for ATP synthesis"},
                {"parameter": "DNA_RNA_synthesis", "direction": "maintain", "mechanism": "Nucleotides contain phosphate groups"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "hypophosphatemia", "reason": "Replacement therapy"},
                {"disease": "refeeding_syndrome", "reason": "Critical to prevent during nutritional rehabilitation"}
            ],
            "caution": [
                {"disease": "chronic_kidney_disease", "reason": "Impaired excretion leads to dangerous accumulation", "recommendation": "800-1000mg/day"},
                {"disease": "cardiovascular_disease_with_CKD", "reason": "Contributes to vascular calcification"},
                {"disease": "secondary_hyperparathyroidism", "reason": "High phosphorus worsens PTH elevation"}
            ],
            "contraindicated": [
                {"disease": "severe_hyperphosphatemia", "reason": "Risk of metastatic calcification"}
            ]
        },
        "drug_interactions": [
            {"drug": "phosphate_binders", "interaction": "target", "mechanism": "Sevelamer, calcium acetate bind dietary phosphorus"},
            {"drug": "aluminum_antacids", "interaction": "reduced_absorption", "mechanism": "Aluminum binds phosphate"},
            {"drug": "vitamin_D_analogs", "interaction": "increased_absorption", "mechanism": "Calcitriol increases phosphorus absorption"}
        ],
        "deficiency_effects": ["muscle_weakness", "bone_pain", "rickets", "confusion", "respiratory_failure"],
        "toxicity_effects": ["vascular_calcification", "secondary_hyperparathyroidism", "renal_osteodystrophy"]
    },

    "chloride": {
        "id": "chloride",
        "name": "Chloride",
        "category": "electrolyte",
        "unit": "mg",
        "daily_value": 2300,
        "daily_value_unit": "mg",
        "description": "Essential electrolyte for fluid balance and gastric acid",
        "parameter_effects": {
            "gastrointestinal": [
                {"parameter": "gastric_acid_production", "direction": "maintain", "mechanism": "Chloride is component of HCl"},
                {"parameter": "gastric_pH", "direction": "decrease", "mechanism": "Enables acid secretion"}
            ],
            "fluid_balance": [
                {"parameter": "extracellular_fluid_volume", "direction": "maintain", "mechanism": "Major ECF anion"},
                {"parameter": "serum_chloride", "direction": "increase", "mechanism": "Direct effect", "normal_range": "98-106 mEq/L"}
            ],
            "acid_base": [
                {"parameter": "serum_bicarbonate", "direction": "inverse", "mechanism": "Reciprocal relationship - hyperchloremia causes acidosis"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "hypochloremia", "reason": "Replacement therapy"},
                {"disease": "metabolic_alkalosis", "reason": "Chloride-responsive alkalosis"}
            ],
            "caution": [
                {"disease": "hypertension", "reason": "Usually consumed with sodium"},
                {"disease": "heart_failure", "reason": "Contributes to fluid retention"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [],
        "deficiency_effects": ["metabolic_alkalosis", "muscle_weakness", "confusion"],
        "toxicity_effects": ["metabolic_acidosis", "fluid_retention"]
    },

    # ============================================================
    # VITAMINS - FAT SOLUBLE
    # ============================================================
    "vitamin_a": {
        "id": "vitamin_a",
        "name": "Vitamin A",
        "category": "vitamin_fat_soluble",
        "unit": "mcg_rae",
        "daily_value": 900,
        "daily_value_unit": "mcg RAE",
        "description": "Essential for vision, immunity, and cell differentiation",
        "forms": ["retinol", "retinal", "retinoic_acid", "beta_carotene"],
        "parameter_effects": {
            "ophthalmologic": [
                {"parameter": "night_vision", "direction": "maintain", "mechanism": "Retinal is component of rhodopsin"},
                {"parameter": "corneal_integrity", "direction": "maintain", "mechanism": "Required for epithelial cell differentiation"},
                {"parameter": "xerophthalmia_risk", "direction": "decrease", "mechanism": "Prevents drying of conjunctiva"}
            ],
            "immune": [
                {"parameter": "immune_function", "direction": "enhance", "mechanism": "Required for lymphocyte development and function"},
                {"parameter": "mucosal_barrier", "direction": "maintain", "mechanism": "Supports epithelial integrity"},
                {"parameter": "infection_susceptibility", "direction": "decrease", "mechanism": "Enhances innate and adaptive immunity"}
            ],
            "dermatologic": [
                {"parameter": "skin_cell_turnover", "direction": "regulate", "mechanism": "Retinoic acid controls keratinocyte differentiation"},
                {"parameter": "wound_healing", "direction": "support", "mechanism": "Required for tissue repair"}
            ],
            "reproductive": [
                {"parameter": "spermatogenesis", "direction": "support", "mechanism": "Required for sperm development"},
                {"parameter": "fetal_development", "direction": "support", "mechanism": "Critical for organogenesis - teratogenic if excess"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "vitamin_a_deficiency", "reason": "Replacement therapy"},
                {"disease": "measles", "reason": "Reduces severity and mortality"},
                {"disease": "night_blindness", "reason": "Restores rhodopsin function"}
            ],
            "caution": [
                {"disease": "liver_disease", "reason": "Impaired storage and metabolism"},
                {"disease": "hypervitaminosis_A", "reason": "Fat-soluble - accumulates and causes toxicity"}
            ],
            "contraindicated": [
                {"disease": "pregnancy", "reason": "High doses teratogenic - limit to <3000mcg/day", "exception": "beta-carotene is safe"}
            ]
        },
        "drug_interactions": [
            {"drug": "isotretinoin", "interaction": "toxicity", "mechanism": "Additive vitamin A toxicity - do not combine"},
            {"drug": "warfarin", "interaction": "enhanced_effect", "mechanism": "High doses may increase bleeding risk"},
            {"drug": "orlistat", "interaction": "reduced_absorption", "mechanism": "Fat malabsorption reduces vitamin A uptake"}
        ],
        "deficiency_effects": ["night_blindness", "xerophthalmia", "keratomalacia", "impaired_immunity", "growth_retardation"],
        "toxicity_effects": ["hepatotoxicity", "teratogenicity", "hypercalcemia", "bone_pain", "intracranial_hypertension"]
    },
    
    "vitamin_d": {
        "id": "vitamin_d",
        "name": "Vitamin D",
        "category": "vitamin_fat_soluble",
        "unit": "mcg",
        "daily_value": 20,
        "daily_value_unit": "mcg",
        "alternate_unit": "800 IU",
        "description": "Essential for calcium absorption and bone health",
        "forms": ["D2_ergocalciferol", "D3_cholecalciferol", "25_OH_D", "1_25_OH2_D"],
        "parameter_effects": {
            "musculoskeletal": [
                {"parameter": "calcium_absorption", "direction": "increase", "mechanism": "Upregulates intestinal calcium transporters", "magnitude": "10-40% increase"},
                {"parameter": "bone_mineral_density", "direction": "increase", "mechanism": "Promotes calcium deposition in bone"},
                {"parameter": "PTH", "direction": "decrease", "mechanism": "Adequate D suppresses PTH secretion"},
                {"parameter": "muscle_strength", "direction": "increase", "mechanism": "Vitamin D receptors in muscle tissue"},
                {"parameter": "fall_risk", "direction": "decrease", "mechanism": "Improved muscle function and balance"}
            ],
            "immune": [
                {"parameter": "innate_immunity", "direction": "enhance", "mechanism": "Induces cathelicidin and defensins"},
                {"parameter": "autoimmune_risk", "direction": "decrease", "mechanism": "Modulates T-cell response"},
                {"parameter": "respiratory_infection_risk", "direction": "decrease", "mechanism": "Enhanced mucosal immunity"}
            ],
            "cardiovascular": [
                {"parameter": "blood_pressure", "direction": "decrease", "mechanism": "Inhibits renin-angiotensin system", "magnitude": "modest"},
                {"parameter": "endothelial_function", "direction": "improve", "mechanism": "Reduces oxidative stress"}
            ],
            "metabolic": [
                {"parameter": "insulin_sensitivity", "direction": "increase", "mechanism": "VDR expression in pancreatic beta cells"},
                {"parameter": "serum_25_OH_D", "direction": "increase", "mechanism": "Primary storage form", "optimal_range": "30-50 ng/mL"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "osteoporosis", "reason": "Essential for calcium absorption and bone health"},
                {"disease": "rickets", "reason": "Curative in children"},
                {"disease": "osteomalacia", "reason": "Curative in adults"},
                {"disease": "secondary_hyperparathyroidism", "reason": "Suppresses PTH elevation"},
                {"disease": "multiple_sclerosis", "reason": "May reduce relapse rate and progression"},
                {"disease": "type_1_diabetes_prevention", "reason": "Early supplementation may reduce risk"}
            ],
            "caution": [
                {"disease": "hypercalcemia", "reason": "Can worsen elevated calcium"},
                {"disease": "sarcoidosis", "reason": "Granulomas convert D to active form causing hypercalcemia"},
                {"disease": "kidney_stones", "reason": "High doses may increase stone risk"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "thiazide_diuretics", "interaction": "hypercalcemia_risk", "mechanism": "Both increase serum calcium"},
            {"drug": "digoxin", "interaction": "toxicity_risk", "mechanism": "Hypercalcemia increases digoxin toxicity"},
            {"drug": "phenytoin", "interaction": "increased_metabolism", "mechanism": "Anticonvulsants increase vitamin D catabolism"},
            {"drug": "corticosteroids", "interaction": "increased_need", "mechanism": "Steroids reduce calcium absorption, increase D catabolism"},
            {"drug": "orlistat", "interaction": "reduced_absorption", "mechanism": "Fat malabsorption reduces vitamin D uptake"}
        ],
        "deficiency_effects": ["osteomalacia", "rickets", "osteoporosis", "muscle_weakness", "increased_infection_risk", "depression"],
        "toxicity_effects": ["hypercalcemia", "hypercalciuria", "kidney_stones", "soft_tissue_calcification", "nausea"]
    },
    
    "vitamin_e": {
        "id": "vitamin_e",
        "name": "Vitamin E",
        "category": "vitamin_fat_soluble",
        "unit": "mg",
        "daily_value": 15,
        "daily_value_unit": "mg alpha-tocopherol",
        "description": "Primary fat-soluble antioxidant",
        "forms": ["alpha_tocopherol", "gamma_tocopherol", "tocotrienols"],
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "LDL_oxidation", "direction": "decrease", "mechanism": "Protects LDL from oxidative modification"},
                {"parameter": "platelet_aggregation", "direction": "decrease", "mechanism": "Inhibits platelet adhesion"}
            ],
            "immune": [
                {"parameter": "T_cell_function", "direction": "enhance", "mechanism": "Supports lymphocyte membrane integrity"},
                {"parameter": "antibody_response", "direction": "enhance", "mechanism": "Improves humoral immunity in elderly"}
            ],
            "neurological": [
                {"parameter": "neurodegeneration", "direction": "slow", "mechanism": "Protects neuronal membranes from oxidation"},
                {"parameter": "cognitive_decline", "direction": "slow", "mechanism": "Antioxidant protection in brain"}
            ],
            "dermatologic": [
                {"parameter": "skin_aging", "direction": "slow", "mechanism": "Protects against UV-induced oxidative damage"}
            ],
            "coagulation": [
                {"parameter": "bleeding_time", "direction": "increase", "mechanism": "Inhibits vitamin K-dependent clotting factors", "threshold": ">1000mg/day"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "vitamin_e_deficiency", "reason": "Replacement therapy"},
                {"disease": "NAFLD", "reason": "May improve liver histology in non-diabetic patients"},
                {"disease": "ataxia_with_vitamin_E_deficiency", "reason": "Essential treatment"}
            ],
            "caution": [
                {"disease": "bleeding_disorders", "reason": "Antiplatelet effect may increase bleeding"},
                {"disease": "vitamin_K_deficiency", "reason": "May worsen coagulopathy"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "warfarin", "interaction": "enhanced_bleeding", "mechanism": "Additive anticoagulant effect - monitor INR"},
            {"drug": "antiplatelet_agents", "interaction": "enhanced_bleeding", "mechanism": "Additive antiplatelet effect"},
            {"drug": "chemotherapy", "interaction": "variable", "mechanism": "May reduce efficacy of some agents - consult oncologist"},
            {"drug": "statins", "interaction": "reduced_efficacy", "mechanism": "May reduce statin effect on LDL"}
        ],
        "deficiency_effects": ["ataxia", "peripheral_neuropathy", "muscle_weakness", "retinopathy", "immune_dysfunction"],
        "toxicity_effects": ["bleeding", "nausea", "fatigue", "possible_increased_mortality_at_high_doses"]
    },
    
    "vitamin_k": {
        "id": "vitamin_k",
        "name": "Vitamin K",
        "category": "vitamin_fat_soluble",
        "unit": "mcg",
        "daily_value": 120,
        "daily_value_unit": "mcg",
        "description": "Essential for blood clotting and bone metabolism",
        "forms": ["K1_phylloquinone", "K2_menaquinone"],
        "parameter_effects": {
            "coagulation": [
                {"parameter": "prothrombin_time", "direction": "decrease", "mechanism": "Activates factors II, VII, IX, X"},
                {"parameter": "INR", "direction": "decrease", "mechanism": "Enhances vitamin K-dependent clotting"},
                {"parameter": "bleeding_risk", "direction": "decrease", "mechanism": "Normalizes coagulation cascade"}
            ],
            "musculoskeletal": [
                {"parameter": "bone_mineral_density", "direction": "increase", "mechanism": "Activates osteocalcin for calcium binding"},
                {"parameter": "fracture_risk", "direction": "decrease", "mechanism": "Improved bone matrix formation"},
                {"parameter": "osteocalcin_carboxylation", "direction": "increase", "mechanism": "K2 specifically activates bone proteins"}
            ],
            "cardiovascular": [
                {"parameter": "vascular_calcification", "direction": "decrease", "mechanism": "K2 activates matrix Gla protein which inhibits calcification"},
                {"parameter": "arterial_stiffness", "direction": "decrease", "mechanism": "Prevents calcium deposition in vessel walls"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "vitamin_k_deficiency", "reason": "Replacement therapy"},
                {"disease": "warfarin_reversal", "reason": "Antidote for warfarin toxicity"},
                {"disease": "osteoporosis", "reason": "K2 improves bone quality"},
                {"disease": "hemorrhagic_disease_of_newborn", "reason": "Prophylactic administration at birth"}
            ],
            "caution": [
                {"disease": "thrombophilia", "reason": "Enhanced clotting may increase thrombosis risk"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "warfarin", "interaction": "antagonism", "mechanism": "Vitamin K reverses warfarin effect - maintain consistent intake"},
            {"drug": "antibiotics", "interaction": "deficiency_risk", "mechanism": "Broad-spectrum antibiotics kill gut bacteria that produce K2"},
            {"drug": "orlistat", "interaction": "reduced_absorption", "mechanism": "Fat malabsorption reduces vitamin K uptake"},
            {"drug": "cholestyramine", "interaction": "reduced_absorption", "mechanism": "Bile acid sequestrants reduce fat-soluble vitamin absorption"}
        ],
        "deficiency_effects": ["bleeding", "easy_bruising", "prolonged_PT_INR", "osteoporosis"],
        "toxicity_effects": ["rare_from_diet", "possible_hemolysis_with_synthetic_K3"]
    },

    # ============================================================
    # VITAMINS - WATER SOLUBLE
    # ============================================================
    "vitamin_c": {
        "id": "vitamin_c",
        "name": "Vitamin C",
        "category": "vitamin_water_soluble",
        "unit": "mg",
        "daily_value": 90,
        "daily_value_unit": "mg",
        "description": "Essential antioxidant and cofactor for collagen synthesis",
        "parameter_effects": {
            "immune": [
                {"parameter": "immune_function", "direction": "enhance", "mechanism": "Supports neutrophil function and lymphocyte proliferation"},
                {"parameter": "infection_duration", "direction": "decrease", "mechanism": "May reduce cold duration by 8%"},
                {"parameter": "wound_healing", "direction": "enhance", "mechanism": "Required for collagen synthesis"}
            ],
            "cardiovascular": [
                {"parameter": "endothelial_function", "direction": "improve", "mechanism": "Enhances nitric oxide availability"},
                {"parameter": "blood_pressure", "direction": "decrease", "mechanism": "Mild antihypertensive effect", "magnitude": "3-5 mmHg"}
            ],
            "musculoskeletal": [
                {"parameter": "collagen_synthesis", "direction": "increase", "mechanism": "Cofactor for prolyl and lysyl hydroxylase"},
                {"parameter": "iron_absorption", "direction": "increase", "mechanism": "Reduces Fe3+ to Fe2+ for absorption"}
            ],
            "dermatologic": [
                {"parameter": "skin_elasticity", "direction": "maintain", "mechanism": "Required for dermal collagen"},
                {"parameter": "photoprotection", "direction": "enhance", "mechanism": "Antioxidant protection against UV"}
            ],
            "hematologic": [
                {"parameter": "non_heme_iron_absorption", "direction": "increase", "mechanism": "Enhances iron bioavailability 2-3 fold"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "scurvy", "reason": "Curative"},
                {"disease": "common_cold", "reason": "May reduce duration slightly"},
                {"disease": "iron_deficiency_anemia", "reason": "Enhances iron absorption"},
                {"disease": "wound_healing", "reason": "Essential for collagen formation"}
            ],
            "caution": [
                {"disease": "kidney_stones_oxalate", "reason": "High doses increase oxalate excretion", "threshold": ">1000mg/day"},
                {"disease": "hemochromatosis", "reason": "Enhanced iron absorption worsens iron overload"},
                {"disease": "G6PD_deficiency", "reason": "High doses may cause hemolysis"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "warfarin", "interaction": "reduced_effect", "mechanism": "High doses may reduce warfarin efficacy"},
            {"drug": "chemotherapy", "interaction": "variable", "mechanism": "May protect cancer cells - discuss with oncologist"},
            {"drug": "estrogen", "interaction": "increased_levels", "mechanism": "May increase estrogen bioavailability"}
        ],
        "deficiency_effects": ["scurvy", "bleeding_gums", "poor_wound_healing", "fatigue", "petechiae"],
        "toxicity_effects": ["diarrhea", "kidney_stones", "nausea", "iron_overload_in_susceptible"]
    },
    
    "thiamin": {
        "id": "thiamin",
        "name": "Thiamin (B1)",
        "category": "vitamin_water_soluble",
        "unit": "mg",
        "daily_value": 1.2,
        "daily_value_unit": "mg",
        "description": "Essential for carbohydrate metabolism and nerve function",
        "parameter_effects": {
            "neurological": [
                {"parameter": "nerve_conduction", "direction": "maintain", "mechanism": "Required for peripheral nerve function"},
                {"parameter": "cognitive_function", "direction": "maintain", "mechanism": "Essential for brain glucose metabolism"},
                {"parameter": "wernicke_encephalopathy_risk", "direction": "decrease", "mechanism": "Prevents thiamin-deficiency encephalopathy"}
            ],
            "cardiovascular": [
                {"parameter": "cardiac_function", "direction": "maintain", "mechanism": "Required for myocardial energy metabolism"},
                {"parameter": "heart_failure_symptoms", "direction": "improve", "mechanism": "Deficiency causes wet beriberi"}
            ],
            "metabolic": [
                {"parameter": "pyruvate_dehydrogenase", "direction": "activate", "mechanism": "TPP is essential cofactor"},
                {"parameter": "lactate", "direction": "decrease", "mechanism": "Enables aerobic glucose metabolism"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "beriberi", "reason": "Curative"},
                {"disease": "wernicke_korsakoff_syndrome", "reason": "Treatment and prevention"},
                {"disease": "alcoholism", "reason": "Replacement for common deficiency"},
                {"disease": "heart_failure", "reason": "Loop diuretics deplete thiamin"}
            ],
            "caution": [],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "loop_diuretics", "interaction": "deficiency_risk", "mechanism": "Furosemide increases thiamin excretion"},
            {"drug": "metformin", "interaction": "deficiency_risk", "mechanism": "Long-term use may reduce thiamin levels"}
        ],
        "deficiency_effects": ["beriberi", "wernicke_encephalopathy", "peripheral_neuropathy", "heart_failure", "confusion"],
        "toxicity_effects": ["rare", "possible_anaphylaxis_with_IV_administration"]
    },
    
    "riboflavin": {
        "id": "riboflavin",
        "name": "Riboflavin (B2)",
        "category": "vitamin_water_soluble",
        "unit": "mg",
        "daily_value": 1.3,
        "daily_value_unit": "mg",
        "description": "Essential for energy metabolism and antioxidant function",
        "parameter_effects": {
            "metabolic": [
                {"parameter": "FAD_FMN_levels", "direction": "maintain", "mechanism": "Precursor to flavin coenzymes"},
                {"parameter": "energy_production", "direction": "maintain", "mechanism": "Essential for electron transport chain"}
            ],
            "ophthalmologic": [
                {"parameter": "cataract_risk", "direction": "decrease", "mechanism": "Antioxidant protection in lens"}
            ],
            "neurological": [
                {"parameter": "migraine_frequency", "direction": "decrease", "mechanism": "High-dose riboflavin effective for migraine prophylaxis", "dose": "400mg/day"}
            ],
            "dermatologic": [
                {"parameter": "skin_integrity", "direction": "maintain", "mechanism": "Required for tissue repair"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "riboflavin_deficiency", "reason": "Replacement therapy"},
                {"disease": "migraine", "reason": "400mg/day reduces frequency"},
                {"disease": "cataracts", "reason": "May reduce risk"}
            ],
            "caution": [],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "phenobarbital", "interaction": "increased_metabolism", "mechanism": "Induces riboflavin catabolism"},
            {"drug": "tricyclic_antidepressants", "interaction": "deficiency_risk", "mechanism": "Interfere with riboflavin metabolism"}
        ],
        "deficiency_effects": ["angular_cheilitis", "glossitis", "seborrheic_dermatitis", "anemia", "neuropathy"],
        "toxicity_effects": ["none_known", "excess_excreted_in_urine"]
    },
    
    "niacin": {
        "id": "niacin",
        "name": "Niacin (B3)",
        "category": "vitamin_water_soluble",
        "unit": "mg",
        "daily_value": 16,
        "daily_value_unit": "mg NE",
        "description": "Essential for NAD/NADP synthesis and lipid metabolism",
        "forms": ["nicotinic_acid", "nicotinamide", "NMN", "NR"],
        "parameter_effects": {
            "cardiovascular": [
                {"parameter": "HDL_cholesterol", "direction": "increase", "mechanism": "Most effective HDL-raising agent", "magnitude": "15-35% increase", "dose": "1-3g/day"},
                {"parameter": "LDL_cholesterol", "direction": "decrease", "mechanism": "Reduces hepatic VLDL synthesis", "magnitude": "5-25% decrease"},
                {"parameter": "triglycerides", "direction": "decrease", "mechanism": "Inhibits lipolysis in adipose", "magnitude": "20-50% decrease"},
                {"parameter": "Lp(a)", "direction": "decrease", "mechanism": "Only agent that significantly reduces Lp(a)", "magnitude": "20-30% decrease"}
            ],
            "metabolic": [
                {"parameter": "NAD_levels", "direction": "increase", "mechanism": "Precursor to NAD+ synthesis"},
                {"parameter": "insulin_sensitivity", "direction": "decrease", "mechanism": "High-dose nicotinic acid worsens glucose tolerance"}
            ],
            "dermatologic": [
                {"parameter": "flushing", "direction": "increase", "mechanism": "Prostaglandin-mediated vasodilation", "with": "nicotinic_acid"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "pellagra", "reason": "Curative"},
                {"disease": "dyslipidemia", "reason": "Effective for raising HDL, lowering triglycerides"},
                {"disease": "elevated_Lp(a)", "reason": "Only effective therapy"}
            ],
            "caution": [
                {"disease": "diabetes", "reason": "Nicotinic acid worsens glycemic control"},
                {"disease": "gout", "reason": "Increases uric acid levels"},
                {"disease": "peptic_ulcer", "reason": "May exacerbate ulcers"},
                {"disease": "liver_disease", "reason": "Hepatotoxic at high doses"}
            ],
            "contraindicated": [
                {"disease": "active_liver_disease", "reason": "Hepatotoxic"}
            ]
        },
        "drug_interactions": [
            {"drug": "statins", "interaction": "myopathy_risk", "mechanism": "Increased risk of rhabdomyolysis"},
            {"drug": "aspirin", "interaction": "beneficial", "mechanism": "Reduces flushing from nicotinic acid"},
            {"drug": "antihypertensives", "interaction": "enhanced_effect", "mechanism": "Niacin may cause hypotension"}
        ],
        "deficiency_effects": ["pellagra", "dermatitis", "diarrhea", "dementia", "glossitis"],
        "toxicity_effects": ["flushing", "hepatotoxicity", "hyperglycemia", "hyperuricemia", "GI_upset"]
    },
    
    "vitamin_b6": {
        "id": "vitamin_b6",
        "name": "Vitamin B6",
        "category": "vitamin_water_soluble",
        "unit": "mg",
        "daily_value": 1.7,
        "daily_value_unit": "mg",
        "description": "Essential for amino acid metabolism and neurotransmitter synthesis",
        "forms": ["pyridoxine", "pyridoxal", "pyridoxamine", "PLP"],
        "parameter_effects": {
            "neurological": [
                {"parameter": "serotonin_synthesis", "direction": "maintain", "mechanism": "PLP required for tryptophan to serotonin conversion"},
                {"parameter": "dopamine_synthesis", "direction": "maintain", "mechanism": "Required for DOPA decarboxylase"},
                {"parameter": "GABA_synthesis", "direction": "maintain", "mechanism": "Required for glutamate decarboxylase"},
                {"parameter": "peripheral_neuropathy_risk", "direction": "decrease", "mechanism": "Prevents deficiency-related neuropathy"}
            ],
            "cardiovascular": [
                {"parameter": "homocysteine", "direction": "decrease", "mechanism": "Cofactor for cystathionine beta-synthase"}
            ],
            "hematologic": [
                {"parameter": "hemoglobin_synthesis", "direction": "maintain", "mechanism": "Required for heme synthesis"},
                {"parameter": "sideroblastic_anemia_risk", "direction": "decrease", "mechanism": "Prevents B6-responsive anemia"}
            ],
            "immune": [
                {"parameter": "lymphocyte_proliferation", "direction": "maintain", "mechanism": "Required for immune cell development"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "vitamin_b6_deficiency", "reason": "Replacement therapy"},
                {"disease": "morning_sickness", "reason": "First-line treatment for nausea in pregnancy"},
                {"disease": "premenstrual_syndrome", "reason": "May reduce symptoms"},
                {"disease": "carpal_tunnel_syndrome", "reason": "May provide relief"},
                {"disease": "isoniazid_toxicity", "reason": "Prevents INH-induced neuropathy"}
            ],
            "caution": [
                {"disease": "parkinsons_on_levodopa", "reason": "Reduces levodopa efficacy unless carbidopa given"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "levodopa", "interaction": "reduced_efficacy", "mechanism": "B6 accelerates peripheral levodopa metabolism - use with carbidopa"},
            {"drug": "isoniazid", "interaction": "deficiency_risk", "mechanism": "INH is B6 antagonist - supplement 25-50mg/day"},
            {"drug": "phenytoin", "interaction": "reduced_efficacy", "mechanism": "B6 may increase phenytoin metabolism"},
            {"drug": "oral_contraceptives", "interaction": "deficiency_risk", "mechanism": "Estrogen increases B6 requirements"}
        ],
        "deficiency_effects": ["peripheral_neuropathy", "seborrheic_dermatitis", "glossitis", "depression", "confusion", "anemia"],
        "toxicity_effects": ["sensory_neuropathy", "ataxia", "photosensitivity"],
        "toxicity_threshold": ">200mg/day chronic"
    },
    
    "folate": {
        "id": "folate",
        "name": "Folate (B9)",
        "category": "vitamin_water_soluble",
        "unit": "mcg",
        "daily_value": 400,
        "daily_value_unit": "mcg DFE",
        "description": "Essential for DNA synthesis and cell division",
        "forms": ["folic_acid", "methylfolate", "folinic_acid"],
        "parameter_effects": {
            "hematologic": [
                {"parameter": "red_blood_cell_production", "direction": "maintain", "mechanism": "Required for DNA synthesis in erythropoiesis"},
                {"parameter": "MCV", "direction": "normalize", "mechanism": "Deficiency causes megaloblastic anemia"}
            ],
            "neurological": [
                {"parameter": "neural_tube_development", "direction": "support", "mechanism": "Critical during first 28 days of pregnancy"},
                {"parameter": "homocysteine", "direction": "decrease", "mechanism": "Cofactor for homocysteine remethylation"},
                {"parameter": "cognitive_function", "direction": "maintain", "mechanism": "Required for neurotransmitter synthesis"}
            ],
            "cardiovascular": [
                {"parameter": "homocysteine", "direction": "decrease", "mechanism": "Reduces cardiovascular risk marker", "magnitude": "25% reduction"}
            ],
            "cell_division": [
                {"parameter": "DNA_synthesis", "direction": "maintain", "mechanism": "Required for thymidine synthesis"},
                {"parameter": "cell_proliferation", "direction": "support", "mechanism": "Essential for rapidly dividing cells"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "folate_deficiency", "reason": "Replacement therapy"},
                {"disease": "neural_tube_defects", "reason": "Prevention with 400-800mcg before conception"},
                {"disease": "megaloblastic_anemia", "reason": "Curative if folate-deficient"},
                {"disease": "hyperhomocysteinemia", "reason": "Effective at lowering homocysteine"}
            ],
            "caution": [
                {"disease": "vitamin_b12_deficiency", "reason": "Folate can mask B12 deficiency while neurological damage progresses"},
                {"disease": "cancer", "reason": "High folate may promote cancer progression in some cases"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "methotrexate", "interaction": "antagonism", "mechanism": "MTX is folate antagonist - may need leucovorin rescue"},
            {"drug": "phenytoin", "interaction": "bidirectional", "mechanism": "Each reduces levels of the other"},
            {"drug": "sulfasalazine", "interaction": "deficiency_risk", "mechanism": "Inhibits folate absorption"},
            {"drug": "metformin", "interaction": "deficiency_risk", "mechanism": "Long-term use may reduce folate absorption"},
            {"drug": "trimethoprim", "interaction": "antagonism", "mechanism": "Inhibits dihydrofolate reductase"}
        ],
        "deficiency_effects": ["megaloblastic_anemia", "neural_tube_defects", "glossitis", "diarrhea", "elevated_homocysteine"],
        "toxicity_effects": ["masks_B12_deficiency", "possible_cancer_promotion", "generally_safe_from_food"]
    },
    
    "vitamin_b12": {
        "id": "vitamin_b12",
        "name": "Vitamin B12",
        "category": "vitamin_water_soluble",
        "unit": "mcg",
        "daily_value": 2.4,
        "daily_value_unit": "mcg",
        "description": "Essential for nerve function and DNA synthesis",
        "forms": ["cyanocobalamin", "methylcobalamin", "hydroxocobalamin", "adenosylcobalamin"],
        "parameter_effects": {
            "neurological": [
                {"parameter": "myelin_synthesis", "direction": "maintain", "mechanism": "Required for methylation reactions in myelin formation"},
                {"parameter": "peripheral_neuropathy_risk", "direction": "decrease", "mechanism": "Prevents subacute combined degeneration"},
                {"parameter": "cognitive_function", "direction": "maintain", "mechanism": "Deficiency causes cognitive impairment"}
            ],
            "hematologic": [
                {"parameter": "red_blood_cell_production", "direction": "maintain", "mechanism": "Required for DNA synthesis"},
                {"parameter": "MCV", "direction": "normalize", "mechanism": "Deficiency causes macrocytic anemia"}
            ],
            "cardiovascular": [
                {"parameter": "homocysteine", "direction": "decrease", "mechanism": "Cofactor for methionine synthase"}
            ],
            "metabolic": [
                {"parameter": "methylmalonic_acid", "direction": "decrease", "mechanism": "Cofactor for methylmalonyl-CoA mutase", "marker": "elevated in deficiency"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "pernicious_anemia", "reason": "Lifelong parenteral replacement required"},
                {"disease": "vitamin_b12_deficiency", "reason": "Replacement therapy"},
                {"disease": "subacute_combined_degeneration", "reason": "Treatment and prevention"},
                {"disease": "megaloblastic_anemia", "reason": "Curative if B12-deficient"}
            ],
            "caution": [],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "metformin", "interaction": "deficiency_risk", "mechanism": "Reduces B12 absorption - monitor levels"},
            {"drug": "proton_pump_inhibitors", "interaction": "deficiency_risk", "mechanism": "Reduced gastric acid impairs B12 liberation"},
            {"drug": "H2_blockers", "interaction": "deficiency_risk", "mechanism": "Similar mechanism to PPIs"},
            {"drug": "colchicine", "interaction": "deficiency_risk", "mechanism": "Impairs ileal absorption"},
            {"drug": "nitrous_oxide", "interaction": "inactivation", "mechanism": "N2O oxidizes B12 causing acute deficiency"}
        ],
        "deficiency_effects": ["megaloblastic_anemia", "peripheral_neuropathy", "subacute_combined_degeneration", "glossitis", "dementia"],
        "toxicity_effects": ["none_known", "excess_excreted"]
    },

    # ============================================================
    # TRACE ELEMENTS
    # ============================================================
    "iron": {
        "id": "iron",
        "name": "Iron",
        "category": "trace_element",
        "unit": "mg",
        "daily_value": 18,
        "daily_value_unit": "mg",
        "daily_value_note": "8mg for men, 18mg for premenopausal women",
        "description": "Essential for oxygen transport and cellular metabolism",
        "forms": ["heme_iron", "non_heme_iron", "ferrous", "ferric"],
        "parameter_effects": {
            "hematologic": [
                {"parameter": "hemoglobin", "direction": "increase", "mechanism": "Iron is central atom in heme"},
                {"parameter": "red_blood_cell_production", "direction": "maintain", "mechanism": "Required for erythropoiesis"},
                {"parameter": "MCV", "direction": "normalize", "mechanism": "Deficiency causes microcytic anemia"},
                {"parameter": "ferritin", "direction": "increase", "mechanism": "Storage form of iron", "normal_range": "30-300 ng/mL"},
                {"parameter": "transferrin_saturation", "direction": "increase", "mechanism": "Transport marker", "normal_range": "20-50%"}
            ],
            "metabolic": [
                {"parameter": "oxygen_delivery", "direction": "maintain", "mechanism": "Hemoglobin transports O2"},
                {"parameter": "cytochrome_function", "direction": "maintain", "mechanism": "Required for electron transport chain"}
            ],
            "immune": [
                {"parameter": "immune_function", "direction": "variable", "mechanism": "Required for immune cells but excess feeds pathogens"}
            ],
            "hepatic": [
                {"parameter": "hepatic_iron_content", "direction": "increase", "mechanism": "Liver is primary storage site"},
                {"parameter": "liver_fibrosis_risk", "direction": "increase", "mechanism": "Iron overload causes oxidative liver damage"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "iron_deficiency_anemia", "reason": "Replacement therapy"},
                {"disease": "restless_leg_syndrome", "reason": "May improve symptoms if iron-deficient"}
            ],
            "caution": [
                {"disease": "hemochromatosis", "reason": "Iron overload - avoid supplementation"},
                {"disease": "thalassemia", "reason": "Chronic transfusions cause overload"},
                {"disease": "chronic_liver_disease", "reason": "Impaired regulation increases toxicity risk"},
                {"disease": "inflammatory_conditions", "reason": "May feed pathogens and worsen inflammation"}
            ],
            "contraindicated": [
                {"disease": "hemochromatosis", "reason": "Genetic iron overload disorder"}
            ]
        },
        "drug_interactions": [
            {"drug": "levothyroxine", "interaction": "reduced_absorption", "mechanism": "Take 4 hours apart"},
            {"drug": "tetracyclines", "interaction": "mutual_reduction", "mechanism": "Chelation reduces both drug and iron absorption"},
            {"drug": "fluoroquinolones", "interaction": "mutual_reduction", "mechanism": "Chelation - separate by 2 hours"},
            {"drug": "proton_pump_inhibitors", "interaction": "reduced_absorption", "mechanism": "Gastric acid required for iron absorption"},
            {"drug": "levodopa", "interaction": "reduced_absorption", "mechanism": "Iron chelates levodopa"}
        ],
        "deficiency_effects": ["iron_deficiency_anemia", "fatigue", "pallor", "koilonychia", "pica", "cognitive_impairment"],
        "toxicity_effects": ["hemochromatosis", "liver_cirrhosis", "cardiomyopathy", "diabetes", "arthritis", "acute_toxicity_fatal"]
    },
    
    "zinc": {
        "id": "zinc",
        "name": "Zinc",
        "category": "trace_element",
        "unit": "mg",
        "daily_value": 11,
        "daily_value_unit": "mg",
        "description": "Essential for immunity, wound healing, and enzyme function",
        "parameter_effects": {
            "immune": [
                {"parameter": "immune_function", "direction": "enhance", "mechanism": "Required for T-cell development and function"},
                {"parameter": "wound_healing", "direction": "enhance", "mechanism": "Essential for cell proliferation and collagen synthesis"},
                {"parameter": "cold_duration", "direction": "decrease", "mechanism": "Zinc lozenges may reduce cold duration", "dose": "75mg/day"}
            ],
            "dermatologic": [
                {"parameter": "skin_integrity", "direction": "maintain", "mechanism": "Required for keratinocyte function"},
                {"parameter": "acne_severity", "direction": "decrease", "mechanism": "Anti-inflammatory and antimicrobial effects"}
            ],
            "reproductive": [
                {"parameter": "testosterone", "direction": "maintain", "mechanism": "Required for testosterone synthesis"},
                {"parameter": "sperm_quality", "direction": "maintain", "mechanism": "Essential for spermatogenesis"}
            ],
            "metabolic": [
                {"parameter": "insulin_function", "direction": "support", "mechanism": "Zinc is component of insulin crystals"},
                {"parameter": "taste_perception", "direction": "maintain", "mechanism": "Required for gustin function"}
            ],
            "ophthalmologic": [
                {"parameter": "macular_degeneration_progression", "direction": "slow", "mechanism": "Component of AREDS formula"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "zinc_deficiency", "reason": "Replacement therapy"},
                {"disease": "common_cold", "reason": "May reduce duration"},
                {"disease": "diarrhea_in_children", "reason": "Reduces duration and severity"},
                {"disease": "macular_degeneration", "reason": "Part of AREDS supplement"},
                {"disease": "wilson_disease", "reason": "Reduces copper absorption"}
            ],
            "caution": [
                {"disease": "copper_deficiency", "reason": "High zinc inhibits copper absorption"},
                {"disease": "prostate_cancer", "reason": "High zinc associated with increased risk"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "fluoroquinolones", "interaction": "reduced_absorption", "mechanism": "Chelation - separate by 2 hours"},
            {"drug": "tetracyclines", "interaction": "reduced_absorption", "mechanism": "Chelation reduces antibiotic absorption"},
            {"drug": "penicillamine", "interaction": "reduced_absorption", "mechanism": "Chelation"},
            {"drug": "thiazide_diuretics", "interaction": "increased_loss", "mechanism": "Increase urinary zinc excretion"}
        ],
        "deficiency_effects": ["impaired_immunity", "delayed_wound_healing", "hair_loss", "diarrhea", "taste_changes", "growth_retardation"],
        "toxicity_effects": ["copper_deficiency", "nausea", "vomiting", "impaired_immunity_at_high_doses"]
    },
    
    "selenium": {
        "id": "selenium",
        "name": "Selenium",
        "category": "trace_element",
        "unit": "mcg",
        "daily_value": 55,
        "daily_value_unit": "mcg",
        "description": "Essential for antioxidant defense and thyroid function",
        "parameter_effects": {
            "endocrine": [
                {"parameter": "thyroid_hormone_conversion", "direction": "maintain", "mechanism": "Required for deiodinase enzymes (T4 to T3)"},
                {"parameter": "thyroid_antibodies", "direction": "decrease", "mechanism": "May reduce autoimmune thyroid inflammation"}
            ],
            "immune": [
                {"parameter": "antioxidant_capacity", "direction": "increase", "mechanism": "Component of glutathione peroxidases"},
                {"parameter": "viral_resistance", "direction": "increase", "mechanism": "Enhances immune response to viruses"}
            ],
            "cardiovascular": [
                {"parameter": "cardiovascular_disease_risk", "direction": "variable", "mechanism": "Both deficiency and excess may increase risk"}
            ],
            "reproductive": [
                {"parameter": "sperm_motility", "direction": "maintain", "mechanism": "Required for sperm mitochondrial function"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "selenium_deficiency", "reason": "Replacement therapy"},
                {"disease": "Keshan_disease", "reason": "Curative cardiomyopathy of deficiency"},
                {"disease": "Kashin_Beck_disease", "reason": "Prevents osteoarthropathy"},
                {"disease": "autoimmune_thyroiditis", "reason": "May reduce TPO antibodies"}
            ],
            "caution": [
                {"disease": "diabetes", "reason": "Excess selenium associated with diabetes risk"},
                {"disease": "prostate_cancer", "reason": "SELECT trial showed no benefit, possible harm"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "statins", "interaction": "possible_interaction", "mechanism": "May affect statin efficacy - monitor"},
            {"drug": "chemotherapy", "interaction": "variable", "mechanism": "May protect normal cells - discuss with oncologist"}
        ],
        "deficiency_effects": ["keshan_disease", "kashin_beck_disease", "impaired_immunity", "hypothyroidism"],
        "toxicity_effects": ["selenosis", "hair_loss", "nail_brittleness", "nausea", "neuropathy", "garlic_breath"]
    },
    
    "iodine": {
        "id": "iodine",
        "name": "Iodine",
        "category": "trace_element",
        "unit": "mcg",
        "daily_value": 150,
        "daily_value_unit": "mcg",
        "description": "Essential for thyroid hormone synthesis",
        "parameter_effects": {
            "endocrine": [
                {"parameter": "T4_production", "direction": "maintain", "mechanism": "Iodine is component of T4 (thyroxine)"},
                {"parameter": "T3_production", "direction": "maintain", "mechanism": "Iodine is component of T3"},
                {"parameter": "TSH", "direction": "normalize", "mechanism": "Adequate iodine prevents compensatory TSH elevation"},
                {"parameter": "thyroid_size", "direction": "normalize", "mechanism": "Prevents goiter formation"}
            ],
            "neurological": [
                {"parameter": "cognitive_development", "direction": "support", "mechanism": "Critical for fetal brain development"},
                {"parameter": "IQ", "direction": "maintain", "mechanism": "Deficiency causes intellectual disability"}
            ],
            "metabolic": [
                {"parameter": "basal_metabolic_rate", "direction": "maintain", "mechanism": "Thyroid hormones regulate metabolism"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "iodine_deficiency", "reason": "Replacement therapy"},
                {"disease": "goiter", "reason": "Prevents and treats iodine-deficiency goiter"},
                {"disease": "cretinism_prevention", "reason": "Adequate maternal iodine prevents fetal hypothyroidism"}
            ],
            "caution": [
                {"disease": "hyperthyroidism", "reason": "Excess iodine may worsen hyperthyroidism"},
                {"disease": "hashimotos_thyroiditis", "reason": "Excess may trigger or worsen autoimmune thyroiditis"},
                {"disease": "thyroid_nodules", "reason": "Excess may promote nodule growth"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "levothyroxine", "interaction": "variable", "mechanism": "Iodine status affects thyroid hormone requirements"},
            {"drug": "amiodarone", "interaction": "thyroid_dysfunction", "mechanism": "Amiodarone contains large amounts of iodine"},
            {"drug": "lithium", "interaction": "additive_hypothyroidism", "mechanism": "Both can cause hypothyroidism"}
        ],
        "deficiency_effects": ["goiter", "hypothyroidism", "cretinism", "cognitive_impairment", "pregnancy_complications"],
        "toxicity_effects": ["thyroiditis", "hyperthyroidism_or_hypothyroidism", "iodine_induced_thyrotoxicosis"]
    },
    
    "copper": {
        "id": "copper",
        "name": "Copper",
        "category": "trace_element",
        "unit": "mg",
        "daily_value": 0.9,
        "daily_value_unit": "mg",
        "description": "Essential for iron metabolism and connective tissue",
        "parameter_effects": {
            "hematologic": [
                {"parameter": "iron_absorption", "direction": "facilitate", "mechanism": "Ceruloplasmin oxidizes Fe2+ for transferrin loading"},
                {"parameter": "hemoglobin", "direction": "maintain", "mechanism": "Required for iron incorporation into heme"}
            ],
            "musculoskeletal": [
                {"parameter": "collagen_crosslinking", "direction": "maintain", "mechanism": "Lysyl oxidase requires copper"},
                {"parameter": "bone_strength", "direction": "maintain", "mechanism": "Required for collagen in bone matrix"}
            ],
            "neurological": [
                {"parameter": "myelin_synthesis", "direction": "maintain", "mechanism": "Required for neurotransmitter synthesis"},
                {"parameter": "dopamine_synthesis", "direction": "maintain", "mechanism": "Dopamine beta-hydroxylase requires copper"}
            ],
            "cardiovascular": [
                {"parameter": "vascular_integrity", "direction": "maintain", "mechanism": "Required for elastin crosslinking"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "copper_deficiency", "reason": "Replacement therapy"},
                {"disease": "menkes_disease", "reason": "Treatment with copper histidine"}
            ],
            "caution": [],
            "contraindicated": [
                {"disease": "wilson_disease", "reason": "Genetic copper overload - restrict dietary copper"}
            ]
        },
        "drug_interactions": [
            {"drug": "zinc_supplements", "interaction": "reduced_absorption", "mechanism": "Zinc induces metallothionein which sequesters copper"},
            {"drug": "penicillamine", "interaction": "reduced_absorption", "mechanism": "Chelates copper"}
        ],
        "deficiency_effects": ["anemia", "neutropenia", "osteoporosis", "neuropathy", "hypopigmentation"],
        "toxicity_effects": ["wilson_disease_features", "liver_damage", "nausea", "hemolysis"]
    },
    
    "manganese": {
        "id": "manganese",
        "name": "Manganese",
        "category": "trace_element",
        "unit": "mg",
        "daily_value": 2.3,
        "daily_value_unit": "mg",
        "description": "Essential for bone formation and metabolism",
        "parameter_effects": {
            "musculoskeletal": [
                {"parameter": "bone_formation", "direction": "support", "mechanism": "Required for glycosyltransferases in cartilage"},
                {"parameter": "cartilage_synthesis", "direction": "maintain", "mechanism": "Essential for proteoglycan production"}
            ],
            "metabolic": [
                {"parameter": "gluconeogenesis", "direction": "maintain", "mechanism": "Pyruvate carboxylase requires manganese"},
                {"parameter": "antioxidant_capacity", "direction": "maintain", "mechanism": "Component of MnSOD"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "manganese_deficiency", "reason": "Replacement therapy"},
                {"disease": "osteoporosis", "reason": "May support bone health"}
            ],
            "caution": [
                {"disease": "liver_disease", "reason": "Impaired biliary excretion increases toxicity risk"},
                {"disease": "iron_deficiency", "reason": "Increased manganese absorption may occur"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "antacids", "interaction": "reduced_absorption", "mechanism": "Decreased gastric acid reduces absorption"},
            {"drug": "iron_supplements", "interaction": "competition", "mechanism": "Compete for absorption"}
        ],
        "deficiency_effects": ["impaired_growth", "skeletal_abnormalities", "impaired_glucose_tolerance"],
        "toxicity_effects": ["manganism", "parkinsonian_symptoms", "psychiatric_symptoms"]
    },
    
    "chromium": {
        "id": "chromium",
        "name": "Chromium",
        "category": "trace_element",
        "unit": "mcg",
        "daily_value": 35,
        "daily_value_unit": "mcg",
        "description": "May enhance insulin action",
        "parameter_effects": {
            "metabolic": [
                {"parameter": "insulin_sensitivity", "direction": "increase", "mechanism": "May potentiate insulin receptor signaling", "evidence": "limited"},
                {"parameter": "blood_glucose", "direction": "decrease", "mechanism": "Enhanced insulin action", "evidence": "inconsistent"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "chromium_deficiency", "reason": "Replacement therapy"},
                {"disease": "type_2_diabetes", "reason": "May modestly improve glycemic control", "evidence": "mixed"}
            ],
            "caution": [],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "insulin", "interaction": "enhanced_effect", "mechanism": "May potentiate insulin - monitor glucose"},
            {"drug": "metformin", "interaction": "additive", "mechanism": "Both improve insulin sensitivity"}
        ],
        "deficiency_effects": ["impaired_glucose_tolerance", "weight_loss", "neuropathy"],
        "toxicity_effects": ["kidney_damage", "liver_damage", "with_hexavalent_chromium"]
    },
    
    "molybdenum": {
        "id": "molybdenum",
        "name": "Molybdenum",
        "category": "trace_element",
        "unit": "mcg",
        "daily_value": 45,
        "daily_value_unit": "mcg",
        "description": "Essential cofactor for several enzymes",
        "parameter_effects": {
            "metabolic": [
                {"parameter": "sulfite_oxidase", "direction": "maintain", "mechanism": "Molybdenum cofactor essential"},
                {"parameter": "xanthine_oxidase", "direction": "maintain", "mechanism": "Required for purine metabolism"},
                {"parameter": "uric_acid_production", "direction": "maintain", "mechanism": "Via xanthine oxidase"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "molybdenum_cofactor_deficiency", "reason": "Replacement therapy"}
            ],
            "caution": [
                {"disease": "gout", "reason": "Supports uric acid production"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [],
        "deficiency_effects": ["rare", "sulfite_sensitivity", "neurological_abnormalities"],
        "toxicity_effects": ["gout_like_symptoms", "copper_deficiency"]
    },

    # ============================================================
    # OTHER COMPOUNDS
    # ============================================================
    "caffeine": {
        "id": "caffeine",
        "name": "Caffeine",
        "category": "bioactive_compound",
        "unit": "mg",
        "daily_value": 400,
        "daily_value_unit": "mg",
        "daily_value_note": "Safe limit for most adults",
        "description": "Central nervous system stimulant",
        "parameter_effects": {
            "neurological": [
                {"parameter": "alertness", "direction": "increase", "mechanism": "Adenosine receptor antagonism"},
                {"parameter": "cognitive_performance", "direction": "improve", "mechanism": "Enhanced attention and concentration"},
                {"parameter": "sleep_latency", "direction": "increase", "mechanism": "Blocks sleep-promoting adenosine"}
            ],
            "cardiovascular": [
                {"parameter": "heart_rate", "direction": "increase", "mechanism": "Sympathetic stimulation", "magnitude": "5-10 bpm acute"},
                {"parameter": "blood_pressure", "direction": "increase", "mechanism": "Vasoconstriction", "magnitude": "5-10 mmHg acute, tolerance develops"}
            ],
            "metabolic": [
                {"parameter": "metabolic_rate", "direction": "increase", "mechanism": "Thermogenic effect", "magnitude": "3-11% increase"},
                {"parameter": "lipolysis", "direction": "increase", "mechanism": "Enhanced fat oxidation"}
            ],
            "renal": [
                {"parameter": "urine_output", "direction": "increase", "mechanism": "Mild diuretic effect"}
            ],
            "gastrointestinal": [
                {"parameter": "gastric_acid", "direction": "increase", "mechanism": "Stimulates acid secretion"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "fatigue", "reason": "Central stimulant effect"},
                {"disease": "migraine", "reason": "Vasoconstrictor - component of some migraine drugs"},
                {"disease": "parkinsons_disease", "reason": "Associated with reduced risk"}
            ],
            "caution": [
                {"disease": "anxiety_disorders", "reason": "May worsen anxiety and panic"},
                {"disease": "insomnia", "reason": "Blocks sleep"},
                {"disease": "arrhythmias", "reason": "May trigger arrhythmias in susceptible individuals"},
                {"disease": "GERD", "reason": "Increases gastric acid and relaxes LES"},
                {"disease": "osteoporosis", "reason": "High intake may increase calcium excretion"},
                {"disease": "pregnancy", "reason": "Limit to <200mg/day - associated with miscarriage risk"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [
            {"drug": "adenosine", "interaction": "antagonism", "mechanism": "Blocks adenosine effect - stop caffeine before adenosine stress test"},
            {"drug": "lithium", "interaction": "reduced_levels", "mechanism": "Caffeine increases lithium excretion"},
            {"drug": "theophylline", "interaction": "additive", "mechanism": "Both are xanthines - additive toxicity"},
            {"drug": "fluoroquinolones", "interaction": "increased_caffeine", "mechanism": "Ciprofloxacin inhibits caffeine metabolism"},
            {"drug": "MAOIs", "interaction": "hypertensive_crisis", "mechanism": "Dangerous combination"}
        ],
        "deficiency_effects": [],
        "toxicity_effects": ["anxiety", "insomnia", "tachycardia", "arrhythmias", "GI_upset", "seizures_at_high_doses"]
    },
    
    "alcohol": {
        "id": "alcohol",
        "name": "Alcohol (Ethanol)",
        "category": "bioactive_compound",
        "unit": "g",
        "daily_value": 0,
        "daily_value_unit": "g",
        "daily_value_note": "No safe level - moderate drinking defined as ≤1 drink/day women, ≤2 drinks/day men",
        "description": "Central nervous system depressant",
        "parameter_effects": {
            "neurological": [
                {"parameter": "CNS_function", "direction": "depress", "mechanism": "GABA enhancement, glutamate inhibition"},
                {"parameter": "cognitive_function", "direction": "impair", "mechanism": "Acute and chronic effects on cognition"},
                {"parameter": "cerebellar_function", "direction": "impair", "mechanism": "Ataxia, incoordination"}
            ],
            "cardiovascular": [
                {"parameter": "HDL_cholesterol", "direction": "increase", "mechanism": "Light drinking increases HDL", "dose": "1-2 drinks/day"},
                {"parameter": "blood_pressure", "direction": "increase", "mechanism": "Chronic heavy use causes hypertension"},
                {"parameter": "cardiomyopathy_risk", "direction": "increase", "mechanism": "Direct myocardial toxicity", "threshold": "heavy_chronic_use"},
                {"parameter": "atrial_fibrillation_risk", "direction": "increase", "mechanism": "Holiday heart syndrome"}
            ],
            "hepatic": [
                {"parameter": "liver_enzymes", "direction": "increase", "mechanism": "Hepatocellular damage"},
                {"parameter": "fatty_liver", "direction": "increase", "mechanism": "Impaired lipid metabolism"},
                {"parameter": "cirrhosis_risk", "direction": "increase", "mechanism": "Progressive fibrosis"}
            ],
            "metabolic": [
                {"parameter": "blood_glucose", "direction": "variable", "mechanism": "Initial increase, then hypoglycemia risk"},
                {"parameter": "triglycerides", "direction": "increase", "mechanism": "Impaired VLDL clearance"},
                {"parameter": "uric_acid", "direction": "increase", "mechanism": "Reduced renal excretion"}
            ],
            "gastrointestinal": [
                {"parameter": "gastric_acid", "direction": "increase", "mechanism": "Stimulates acid secretion"},
                {"parameter": "pancreatitis_risk", "direction": "increase", "mechanism": "Direct pancreatic toxicity"}
            ]
        },
        "disease_interactions": {
            "beneficial": [],
            "caution": [
                {"disease": "all_conditions", "reason": "Alcohol has risks at any level of consumption"}
            ],
            "contraindicated": [
                {"disease": "liver_disease", "reason": "Worsens hepatic damage"},
                {"disease": "pancreatitis", "reason": "Major cause and exacerbant"},
                {"disease": "cardiomyopathy", "reason": "Cardiotoxic"},
                {"disease": "pregnancy", "reason": "Fetal alcohol syndrome - no safe level"},
                {"disease": "epilepsy", "reason": "Lowers seizure threshold, withdrawal risk"},
                {"disease": "gastritis_peptic_ulcer", "reason": "Worsens mucosal damage"},
                {"disease": "gout", "reason": "Increases uric acid"}
            ]
        },
        "drug_interactions": [
            {"drug": "metronidazole", "interaction": "disulfiram_reaction", "mechanism": "Severe nausea, flushing"},
            {"drug": "benzodiazepines", "interaction": "synergistic_CNS_depression", "mechanism": "Additive sedation - respiratory depression risk"},
            {"drug": "opioids", "interaction": "synergistic_CNS_depression", "mechanism": "High overdose and death risk"},
            {"drug": "acetaminophen", "interaction": "hepatotoxicity", "mechanism": "Chronic alcohol increases NAPQI formation"},
            {"drug": "warfarin", "interaction": "variable", "mechanism": "Acute alcohol increases INR, chronic decreases"},
            {"drug": "metformin", "interaction": "lactic_acidosis", "mechanism": "Both impair lactate metabolism"},
            {"drug": "antihypertensives", "interaction": "enhanced_hypotension", "mechanism": "Additive BP lowering"}
        ],
        "deficiency_effects": [],
        "toxicity_effects": ["intoxication", "addiction", "liver_disease", "cardiomyopathy", "pancreatitis", "cancer_risk", "fetal_alcohol_syndrome"]
    },
    
    "purines": {
        "id": "purines",
        "name": "Purines",
        "category": "bioactive_compound",
        "unit": "mg",
        "daily_value": None,
        "daily_value_unit": "mg",
        "daily_value_note": "No DV - limit in gout",
        "description": "Nucleotide bases metabolized to uric acid",
        "parameter_effects": {
            "metabolic": [
                {"parameter": "uric_acid", "direction": "increase", "mechanism": "Purines catabolized to uric acid via xanthine oxidase"},
                {"parameter": "serum_urate", "direction": "increase", "mechanism": "Direct precursor"}
            ],
            "renal": [
                {"parameter": "urate_excretion", "direction": "increase", "mechanism": "Increased uric acid load"},
                {"parameter": "kidney_stone_risk", "direction": "increase", "mechanism": "Uric acid stones"}
            ]
        },
        "disease_interactions": {
            "beneficial": [],
            "caution": [],
            "contraindicated": [
                {"disease": "gout", "reason": "Directly increases uric acid and triggers flares"},
                {"disease": "hyperuricemia", "reason": "Elevates already high uric acid"},
                {"disease": "uric_acid_kidney_stones", "reason": "Increases stone formation"}
            ]
        },
        "drug_interactions": [
            {"drug": "allopurinol", "interaction": "target", "mechanism": "Allopurinol inhibits xanthine oxidase to reduce uric acid from purines"}
        ],
        "deficiency_effects": [],
        "toxicity_effects": ["gout_flares", "kidney_stones", "hyperuricemia"]
    },
    
    "oxalates": {
        "id": "oxalates",
        "name": "Oxalates",
        "category": "antinutrient",
        "unit": "mg",
        "daily_value": None,
        "daily_value_unit": "mg",
        "daily_value_note": "No DV - limit to <100mg/day if prone to kidney stones",
        "description": "Plant compounds that bind calcium and form kidney stones",
        "parameter_effects": {
            "renal": [
                {"parameter": "kidney_stone_risk", "direction": "increase", "mechanism": "Calcium oxalate is most common stone type"},
                {"parameter": "urinary_oxalate", "direction": "increase", "mechanism": "Absorbed oxalate excreted in urine"}
            ],
            "musculoskeletal": [
                {"parameter": "calcium_absorption", "direction": "decrease", "mechanism": "Oxalate binds dietary calcium, reducing absorption"}
            ]
        },
        "disease_interactions": {
            "beneficial": [],
            "caution": [],
            "contraindicated": [
                {"disease": "calcium_oxalate_kidney_stones", "reason": "Primary dietary risk factor"},
                {"disease": "primary_hyperoxaluria", "reason": "Worsens oxalate accumulation"},
                {"disease": "inflammatory_bowel_disease", "reason": "Increased oxalate absorption in fat malabsorption"}
            ]
        },
        "drug_interactions": [],
        "deficiency_effects": [],
        "toxicity_effects": ["kidney_stones", "reduced_calcium_absorption", "oxalate_nephropathy"]
    },
    
    "phytates": {
        "id": "phytates",
        "name": "Phytates (Phytic Acid)",
        "category": "antinutrient",
        "unit": "mg",
        "daily_value": None,
        "daily_value_unit": "mg",
        "description": "Plant storage form of phosphorus that binds minerals",
        "parameter_effects": {
            "mineral_absorption": [
                {"parameter": "iron_absorption", "direction": "decrease", "mechanism": "Phytate chelates non-heme iron"},
                {"parameter": "zinc_absorption", "direction": "decrease", "mechanism": "Phytate chelates zinc"},
                {"parameter": "calcium_absorption", "direction": "decrease", "mechanism": "Phytate binds calcium"}
            ]
        },
        "disease_interactions": {
            "beneficial": [
                {"disease": "cancer", "reason": "May have anticancer properties - research ongoing"}
            ],
            "caution": [
                {"disease": "iron_deficiency", "reason": "Further impairs iron absorption"},
                {"disease": "zinc_deficiency", "reason": "Further impairs zinc absorption"}
            ],
            "contraindicated": []
        },
        "drug_interactions": [],
        "deficiency_effects": [],
        "toxicity_effects": ["mineral_deficiencies_if_diet_limited"]
    }
}

# Daily Value reference for quick lookup
DAILY_VALUES = {nutrient_id: data["daily_value"] for nutrient_id, data in NUTRIENTS_DATABASE.items()}

# Get nutrients by category
def get_nutrients_by_category(category):
    """Get all nutrients in a specific category"""
    return {k: v for k, v in NUTRIENTS_DATABASE.items() if v.get("category") == category}

# Get all disease interactions for a nutrient
def get_disease_interactions(nutrient_id):
    """Get all disease interactions for a nutrient"""
    if nutrient_id in NUTRIENTS_DATABASE:
        return NUTRIENTS_DATABASE[nutrient_id].get("disease_interactions", {})
    return {}

# Get all drug interactions for a nutrient
def get_drug_interactions(nutrient_id):
    """Get all drug interactions for a nutrient"""
    if nutrient_id in NUTRIENTS_DATABASE:
        return NUTRIENTS_DATABASE[nutrient_id].get("drug_interactions", [])
    return []

# Get parameter effects for a nutrient
def get_parameter_effects(nutrient_id):
    """Get all parameter effects for a nutrient"""
    if nutrient_id in NUTRIENTS_DATABASE:
        return NUTRIENTS_DATABASE[nutrient_id].get("parameter_effects", {})
    return {}

# Calculate percent daily value
def calculate_percent_dv(nutrient_id, amount):
    """Calculate percentage of daily value"""
    if nutrient_id in DAILY_VALUES and DAILY_VALUES[nutrient_id]:
        return round((amount / DAILY_VALUES[nutrient_id]) * 100, 1)
    return None


if __name__ == "__main__":
    # Print summary
    categories = {}
    for nutrient_id, data in NUTRIENTS_DATABASE.items():
        cat = data.get("category", "unknown")
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(nutrient_id)
    
    print("PhiCor Nutrients Database Summary")
    print("=" * 50)
    print(f"Total nutrients: {len(NUTRIENTS_DATABASE)}")
    print("\nBy category:")
    for cat, nutrients in categories.items():
        print(f"  {cat}: {len(nutrients)}")
    
    print("\n\nSample nutrient data (Potassium):")
    import json
    print(json.dumps(NUTRIENTS_DATABASE["potassium"], indent=2)[:2000])
