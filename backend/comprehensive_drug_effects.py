#!/usr/bin/env python3
"""
Comprehensive Drug Parameter Effects Calculator for PhiCor.ai
Adds detailed parameter effects for ALL major organ systems based on drug class and mechanism
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone
import re

load_dotenv()

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

# Drug class to organ effect mappings
DRUG_CLASS_EFFECTS = {
    # ==================== CARDIOVASCULAR DRUGS ====================
    "ace_inhibitor": {
        "drug_patterns": ["lisinopril", "enalapril", "ramipril", "captopril", "benazepril", "quinapril", "fosinopril", "perindopril", "trandolapril", "moexipril"],
        "effects": {
            "cardiovascular": [
                {"parameter": "blood_pressure_systolic", "change": "-15-25 mmHg", "direction": "decrease", "mechanism": "Blocks ACE, reducing angiotensin II formation and aldosterone secretion", "clinical_significance": "high"},
                {"parameter": "blood_pressure_diastolic", "change": "-10-15 mmHg", "direction": "decrease", "mechanism": "Reduces systemic vascular resistance through decreased angiotensin II", "clinical_significance": "high"},
                {"parameter": "cardiac_output", "change": "+5-15%", "direction": "increase", "mechanism": "Reduced afterload improves cardiac ejection", "clinical_significance": "moderate"},
                {"parameter": "cardiac_remodeling", "change": "-20-40%", "direction": "decrease", "mechanism": "Prevents angiotensin II-mediated myocardial fibrosis", "clinical_significance": "high"}
            ],
            "renal": [
                {"parameter": "gfr", "change": "-5-15%", "direction": "decrease", "mechanism": "Reduces efferent arteriolar tone, initially decreasing filtration pressure", "clinical_significance": "moderate"},
                {"parameter": "proteinuria", "change": "-30-50%", "direction": "decrease", "mechanism": "Reduces glomerular capillary pressure and permeability", "clinical_significance": "high"},
                {"parameter": "potassium_serum", "change": "+0.3-0.7 mEq/L", "direction": "increase", "mechanism": "Decreased aldosterone reduces potassium excretion", "clinical_significance": "moderate"}
            ],
            "endocrine": [
                {"parameter": "aldosterone", "change": "-40-60%", "direction": "decrease", "mechanism": "Reduced angiotensin II decreases adrenal aldosterone synthesis", "clinical_significance": "moderate"}
            ]
        }
    },
    "arb": {
        "drug_patterns": ["losartan", "valsartan", "irbesartan", "candesartan", "olmesartan", "telmisartan", "azilsartan", "eprosartan"],
        "effects": {
            "cardiovascular": [
                {"parameter": "blood_pressure_systolic", "change": "-12-20 mmHg", "direction": "decrease", "mechanism": "Blocks AT1 receptors, preventing angiotensin II vasoconstriction", "clinical_significance": "high"},
                {"parameter": "blood_pressure_diastolic", "change": "-8-12 mmHg", "direction": "decrease", "mechanism": "Reduces peripheral vascular resistance", "clinical_significance": "high"},
                {"parameter": "cardiac_remodeling", "change": "-15-30%", "direction": "decrease", "mechanism": "Prevents AT1-mediated cardiac hypertrophy and fibrosis", "clinical_significance": "high"}
            ],
            "renal": [
                {"parameter": "proteinuria", "change": "-25-45%", "direction": "decrease", "mechanism": "Reduces intraglomerular pressure and podocyte injury", "clinical_significance": "high"},
                {"parameter": "potassium_serum", "change": "+0.2-0.5 mEq/L", "direction": "increase", "mechanism": "Reduced aldosterone decreases potassium excretion", "clinical_significance": "moderate"}
            ]
        }
    },
    "beta_blocker": {
        "drug_patterns": ["metoprolol", "atenolol", "propranolol", "carvedilol", "bisoprolol", "nebivolol", "labetalol", "nadolol", "timolol", "betaxolol", "acebutolol", "pindolol"],
        "effects": {
            "cardiovascular": [
                {"parameter": "heart_rate", "change": "-15-25 bpm", "direction": "decrease", "mechanism": "Blocks β1 receptors in SA node, reducing chronotropy", "clinical_significance": "high"},
                {"parameter": "blood_pressure_systolic", "change": "-10-15 mmHg", "direction": "decrease", "mechanism": "Reduces cardiac output and renin release", "clinical_significance": "high"},
                {"parameter": "cardiac_contractility", "change": "-10-20%", "direction": "decrease", "mechanism": "Blocks β1 receptor-mediated inotropy", "clinical_significance": "moderate"},
                {"parameter": "myocardial_oxygen_demand", "change": "-20-30%", "direction": "decrease", "mechanism": "Reduced heart rate and contractility decrease oxygen consumption", "clinical_significance": "high"}
            ],
            "respiratory": [
                {"parameter": "bronchial_resistance", "change": "+5-15%", "direction": "increase", "mechanism": "β2 blockade (non-selective) reduces bronchodilation", "clinical_significance": "moderate"}
            ],
            "glycemic": [
                {"parameter": "hypoglycemia_awareness", "change": "-20-40%", "direction": "decrease", "mechanism": "Masks adrenergic symptoms of hypoglycemia", "clinical_significance": "moderate"}
            ],
            "endocrine": [
                {"parameter": "renin", "change": "-40-60%", "direction": "decrease", "mechanism": "Blocks β1-mediated renin release from juxtaglomerular cells", "clinical_significance": "moderate"}
            ]
        }
    },
    "calcium_channel_blocker": {
        "drug_patterns": ["amlodipine", "nifedipine", "diltiazem", "verapamil", "felodipine", "nicardipine", "nisoldipine", "isradipine", "clevidipine"],
        "effects": {
            "cardiovascular": [
                {"parameter": "blood_pressure_systolic", "change": "-15-25 mmHg", "direction": "decrease", "mechanism": "Blocks L-type calcium channels in vascular smooth muscle, causing vasodilation", "clinical_significance": "high"},
                {"parameter": "blood_pressure_diastolic", "change": "-10-15 mmHg", "direction": "decrease", "mechanism": "Reduces systemic vascular resistance", "clinical_significance": "high"},
                {"parameter": "heart_rate", "change": "-10-20 bpm", "direction": "decrease", "mechanism": "Non-dihydropyridines slow AV nodal conduction (diltiazem, verapamil)", "clinical_significance": "moderate"},
                {"parameter": "coronary_blood_flow", "change": "+15-30%", "direction": "increase", "mechanism": "Dilates coronary arteries increasing myocardial perfusion", "clinical_significance": "high"}
            ],
            "gastrointestinal": [
                {"parameter": "intestinal_transit_time", "change": "+15-30%", "direction": "increase", "mechanism": "Reduces smooth muscle contraction in GI tract (verapamil)", "clinical_significance": "low"}
            ]
        }
    },
    "diuretic_thiazide": {
        "drug_patterns": ["hydrochlorothiazide", "chlorthalidone", "metolazone", "indapamide", "bendroflumethiazide"],
        "effects": {
            "cardiovascular": [
                {"parameter": "blood_pressure_systolic", "change": "-10-20 mmHg", "direction": "decrease", "mechanism": "Reduces blood volume and decreases vascular resistance long-term", "clinical_significance": "high"},
                {"parameter": "blood_pressure_diastolic", "change": "-5-10 mmHg", "direction": "decrease", "mechanism": "Volume depletion and vascular remodeling", "clinical_significance": "moderate"}
            ],
            "renal": [
                {"parameter": "urine_output", "change": "+30-50%", "direction": "increase", "mechanism": "Inhibits Na-Cl cotransporter in distal tubule", "clinical_significance": "high"},
                {"parameter": "sodium_serum", "change": "-2-5 mEq/L", "direction": "decrease", "mechanism": "Increased sodium excretion leads to hyponatremia", "clinical_significance": "moderate"},
                {"parameter": "potassium_serum", "change": "-0.5-1.0 mEq/L", "direction": "decrease", "mechanism": "Increased distal sodium delivery enhances potassium secretion", "clinical_significance": "high"}
            ],
            "glycemic": [
                {"parameter": "blood_glucose", "change": "+5-15 mg/dL", "direction": "increase", "mechanism": "Hypokalemia impairs insulin secretion", "clinical_significance": "moderate"}
            ],
            "musculoskeletal": [
                {"parameter": "calcium_balance", "change": "+50-100 mg/day", "direction": "increase", "mechanism": "Enhances distal tubular calcium reabsorption", "clinical_significance": "moderate"}
            ]
        }
    },
    "diuretic_loop": {
        "drug_patterns": ["furosemide", "bumetanide", "torsemide", "ethacrynic acid"],
        "effects": {
            "cardiovascular": [
                {"parameter": "blood_volume", "change": "-10-20%", "direction": "decrease", "mechanism": "Potent natriuresis reduces extracellular fluid volume", "clinical_significance": "high"},
                {"parameter": "blood_pressure_systolic", "change": "-10-15 mmHg", "direction": "decrease", "mechanism": "Reduced preload and volume", "clinical_significance": "moderate"}
            ],
            "renal": [
                {"parameter": "urine_output", "change": "+100-300%", "direction": "increase", "mechanism": "Inhibits Na-K-2Cl cotransporter in thick ascending limb", "clinical_significance": "high"},
                {"parameter": "potassium_serum", "change": "-0.5-1.5 mEq/L", "direction": "decrease", "mechanism": "Increased distal delivery and aldosterone activation", "clinical_significance": "high"},
                {"parameter": "magnesium_serum", "change": "-0.2-0.5 mEq/L", "direction": "decrease", "mechanism": "Reduced paracellular magnesium reabsorption", "clinical_significance": "moderate"},
                {"parameter": "calcium_serum", "change": "-0.2-0.5 mg/dL", "direction": "decrease", "mechanism": "Inhibits calcium reabsorption in loop of Henle", "clinical_significance": "moderate"}
            ]
        }
    },
    "statin": {
        "drug_patterns": ["atorvastatin", "rosuvastatin", "simvastatin", "pravastatin", "lovastatin", "fluvastatin", "pitavastatin"],
        "effects": {
            "cardiovascular": [
                {"parameter": "ldl_cholesterol", "change": "-30-55%", "direction": "decrease", "mechanism": "Inhibits HMG-CoA reductase, upregulating hepatic LDL receptors", "clinical_significance": "high"},
                {"parameter": "total_cholesterol", "change": "-25-45%", "direction": "decrease", "mechanism": "Reduced hepatic cholesterol synthesis", "clinical_significance": "high"},
                {"parameter": "triglycerides", "change": "-10-30%", "direction": "decrease", "mechanism": "Reduced VLDL synthesis and secretion", "clinical_significance": "moderate"},
                {"parameter": "hdl_cholesterol", "change": "+5-15%", "direction": "increase", "mechanism": "Increased apoA-I synthesis and reverse cholesterol transport", "clinical_significance": "moderate"},
                {"parameter": "plaque_stability", "change": "+20-40%", "direction": "increase", "mechanism": "Reduces inflammation and lipid content in atherosclerotic plaques", "clinical_significance": "high"}
            ],
            "hepatic": [
                {"parameter": "alt", "change": "+5-20 U/L", "direction": "increase", "mechanism": "Mild hepatocyte stress from reduced mevalonate pathway flux", "clinical_significance": "low"}
            ],
            "musculoskeletal": [
                {"parameter": "creatine_kinase", "change": "+10-50 U/L", "direction": "increase", "mechanism": "Reduced CoQ10 synthesis may affect muscle mitochondria", "clinical_significance": "low"}
            ]
        }
    },
    "antiplatelet": {
        "drug_patterns": ["aspirin", "clopidogrel", "prasugrel", "ticagrelor", "dipyridamole", "cilostazol"],
        "effects": {
            "cardiovascular": [
                {"parameter": "platelet_aggregation", "change": "-50-90%", "direction": "decrease", "mechanism": "Inhibits COX-1 (aspirin) or P2Y12 receptor (thienopyridines)", "clinical_significance": "high"},
                {"parameter": "thrombus_formation", "change": "-40-70%", "direction": "decrease", "mechanism": "Reduced platelet activation and aggregation", "clinical_significance": "high"}
            ],
            "hematological": [
                {"parameter": "bleeding_time", "change": "+50-200%", "direction": "increase", "mechanism": "Impaired platelet plug formation", "clinical_significance": "high"}
            ],
            "gastrointestinal": [
                {"parameter": "gastric_mucosal_protection", "change": "-20-40%", "direction": "decrease", "mechanism": "COX-1 inhibition reduces protective prostaglandins (aspirin)", "clinical_significance": "moderate"}
            ]
        }
    },
    
    # ==================== DIABETES DRUGS ====================
    "metformin": {
        "drug_patterns": ["metformin", "glucophage"],
        "effects": {
            "glycemic": [
                {"parameter": "fasting_glucose", "change": "-20-40 mg/dL", "direction": "decrease", "mechanism": "Reduces hepatic gluconeogenesis via AMPK activation", "clinical_significance": "high"},
                {"parameter": "hba1c", "change": "-1.0-1.5%", "direction": "decrease", "mechanism": "Improves insulin sensitivity and reduces glucose output", "clinical_significance": "high"},
                {"parameter": "insulin_sensitivity", "change": "+20-40%", "direction": "increase", "mechanism": "Enhances peripheral glucose uptake via GLUT4", "clinical_significance": "high"}
            ],
            "cardiovascular": [
                {"parameter": "ldl_cholesterol", "change": "-5-15%", "direction": "decrease", "mechanism": "AMPK activation enhances lipid oxidation", "clinical_significance": "moderate"}
            ],
            "gastrointestinal": [
                {"parameter": "gi_symptoms", "change": "+20-40%", "direction": "increase", "mechanism": "GI side effects common initially (nausea, diarrhea)", "clinical_significance": "moderate"}
            ]
        }
    },
    "sulfonylurea": {
        "drug_patterns": ["glipizide", "glyburide", "glimepiride", "gliclazide", "glibenclamide"],
        "effects": {
            "glycemic": [
                {"parameter": "blood_glucose", "change": "-40-70 mg/dL", "direction": "decrease", "mechanism": "Closes K-ATP channels, stimulating insulin secretion", "clinical_significance": "high"},
                {"parameter": "hba1c", "change": "-1.0-2.0%", "direction": "decrease", "mechanism": "Increased endogenous insulin secretion", "clinical_significance": "high"},
                {"parameter": "hypoglycemia_risk", "change": "+30-60%", "direction": "increase", "mechanism": "Glucose-independent insulin secretion can cause hypoglycemia", "clinical_significance": "high"}
            ]
        }
    },
    "sglt2_inhibitor": {
        "drug_patterns": ["empagliflozin", "dapagliflozin", "canagliflozin", "ertugliflozin"],
        "effects": {
            "glycemic": [
                {"parameter": "blood_glucose", "change": "-25-50 mg/dL", "direction": "decrease", "mechanism": "Inhibits renal glucose reabsorption in proximal tubule", "clinical_significance": "high"},
                {"parameter": "hba1c", "change": "-0.5-1.0%", "direction": "decrease", "mechanism": "Increased urinary glucose excretion lowers serum glucose", "clinical_significance": "high"}
            ],
            "cardiovascular": [
                {"parameter": "blood_pressure_systolic", "change": "-3-6 mmHg", "direction": "decrease", "mechanism": "Osmotic diuresis and natriuresis", "clinical_significance": "moderate"},
                {"parameter": "heart_failure_risk", "change": "-30-40%", "direction": "decrease", "mechanism": "Reduces preload and improves cardiac energetics", "clinical_significance": "high"}
            ],
            "renal": [
                {"parameter": "urine_glucose", "change": "+40-80 g/day", "direction": "increase", "mechanism": "SGLT2 inhibition prevents glucose reabsorption", "clinical_significance": "high"},
                {"parameter": "proteinuria", "change": "-20-40%", "direction": "decrease", "mechanism": "Reduces intraglomerular pressure", "clinical_significance": "high"}
            ]
        }
    },
    "glp1_agonist": {
        "drug_patterns": ["semaglutide", "liraglutide", "dulaglutide", "exenatide", "tirzepatide", "ozempic", "wegovy", "mounjaro"],
        "effects": {
            "glycemic": [
                {"parameter": "blood_glucose", "change": "-30-60 mg/dL", "direction": "decrease", "mechanism": "Glucose-dependent insulin secretion via GLP-1 receptor", "clinical_significance": "high"},
                {"parameter": "hba1c", "change": "-1.0-2.0%", "direction": "decrease", "mechanism": "Enhanced insulin secretion and reduced glucagon", "clinical_significance": "high"},
                {"parameter": "glucagon", "change": "-20-40%", "direction": "decrease", "mechanism": "GLP-1 suppresses alpha-cell glucagon secretion", "clinical_significance": "moderate"}
            ],
            "gastrointestinal": [
                {"parameter": "gastric_emptying_time", "change": "+30-60%", "direction": "increase", "mechanism": "GLP-1 slows gastric motility", "clinical_significance": "moderate"},
                {"parameter": "appetite", "change": "-20-40%", "direction": "decrease", "mechanism": "Central satiety signaling via hypothalamic GLP-1 receptors", "clinical_significance": "high"}
            ],
            "cardiovascular": [
                {"parameter": "cardiovascular_events", "change": "-15-25%", "direction": "decrease", "mechanism": "Cardioprotective effects independent of glucose lowering", "clinical_significance": "high"},
                {"parameter": "blood_pressure_systolic", "change": "-2-5 mmHg", "direction": "decrease", "mechanism": "Weight loss and natriuretic effects", "clinical_significance": "moderate"}
            ]
        }
    },
    "dpp4_inhibitor": {
        "drug_patterns": ["sitagliptin", "saxagliptin", "linagliptin", "alogliptin", "vildagliptin"],
        "effects": {
            "glycemic": [
                {"parameter": "blood_glucose", "change": "-15-30 mg/dL", "direction": "decrease", "mechanism": "Increases endogenous GLP-1 by preventing DPP-4 degradation", "clinical_significance": "moderate"},
                {"parameter": "hba1c", "change": "-0.5-0.8%", "direction": "decrease", "mechanism": "Enhanced incretin effect on insulin secretion", "clinical_significance": "moderate"}
            ]
        }
    },
    "insulin": {
        "drug_patterns": ["insulin", "lantus", "levemir", "tresiba", "humalog", "novolog", "humulin", "novolin", "basaglar", "toujeo"],
        "effects": {
            "glycemic": [
                {"parameter": "blood_glucose", "change": "-50-150 mg/dL", "direction": "decrease", "mechanism": "Direct insulin receptor activation enhances glucose uptake", "clinical_significance": "high"},
                {"parameter": "hba1c", "change": "-1.5-3.0%", "direction": "decrease", "mechanism": "Comprehensive glycemic control with exogenous insulin", "clinical_significance": "high"},
                {"parameter": "hypoglycemia_risk", "change": "+40-80%", "direction": "increase", "mechanism": "Exogenous insulin can lower glucose below normal", "clinical_significance": "high"}
            ],
            "hepatic": [
                {"parameter": "glycogen_synthesis", "change": "+50-100%", "direction": "increase", "mechanism": "Insulin activates glycogen synthase", "clinical_significance": "moderate"}
            ]
        }
    },
    
    # ==================== NEUROLOGICAL/PSYCHIATRIC DRUGS ====================
    "ssri": {
        "drug_patterns": ["fluoxetine", "sertraline", "paroxetine", "citalopram", "escitalopram", "fluvoxamine", "prozac", "zoloft", "lexapro", "paxil"],
        "effects": {
            "neurological": [
                {"parameter": "serotonin", "change": "+40-80%", "direction": "increase", "mechanism": "Blocks serotonin reuptake transporter (SERT) increasing synaptic 5-HT", "clinical_significance": "high"},
                {"parameter": "mood", "change": "+30-50%", "direction": "increase", "mechanism": "Enhanced serotonergic neurotransmission improves depressive symptoms", "clinical_significance": "high"},
                {"parameter": "anxiety", "change": "-20-40%", "direction": "decrease", "mechanism": "5-HT1A receptor desensitization reduces anxiety", "clinical_significance": "high"}
            ],
            "gastrointestinal": [
                {"parameter": "gi_motility", "change": "-10-20%", "direction": "decrease", "mechanism": "Serotonin affects enteric nervous system", "clinical_significance": "low"}
            ],
            "hematological": [
                {"parameter": "platelet_aggregation", "change": "-10-20%", "direction": "decrease", "mechanism": "Reduced platelet serotonin content affects aggregation", "clinical_significance": "moderate"}
            ]
        }
    },
    "snri": {
        "drug_patterns": ["venlafaxine", "duloxetine", "desvenlafaxine", "levomilnacipran", "effexor", "cymbalta"],
        "effects": {
            "neurological": [
                {"parameter": "serotonin", "change": "+40-70%", "direction": "increase", "mechanism": "Inhibits serotonin reuptake", "clinical_significance": "high"},
                {"parameter": "norepinephrine", "change": "+30-60%", "direction": "increase", "mechanism": "Inhibits norepinephrine reuptake", "clinical_significance": "high"},
                {"parameter": "mood", "change": "+30-50%", "direction": "increase", "mechanism": "Dual monoamine enhancement improves depression", "clinical_significance": "high"},
                {"parameter": "pain_perception", "change": "-20-40%", "direction": "decrease", "mechanism": "Descending inhibitory pain modulation (duloxetine)", "clinical_significance": "moderate"}
            ],
            "cardiovascular": [
                {"parameter": "blood_pressure_systolic", "change": "+2-5 mmHg", "direction": "increase", "mechanism": "Norepinephrine effects on vascular tone", "clinical_significance": "low"},
                {"parameter": "heart_rate", "change": "+2-5 bpm", "direction": "increase", "mechanism": "Increased sympathetic tone", "clinical_significance": "low"}
            ]
        }
    },
    "benzodiazepine": {
        "drug_patterns": ["alprazolam", "lorazepam", "diazepam", "clonazepam", "temazepam", "midazolam", "oxazepam", "chlordiazepoxide", "xanax", "ativan", "valium", "klonopin"],
        "effects": {
            "neurological": [
                {"parameter": "gaba", "change": "+50-100%", "direction": "increase", "mechanism": "Positive allosteric modulation of GABA-A receptors", "clinical_significance": "high"},
                {"parameter": "anxiety", "change": "-50-80%", "direction": "decrease", "mechanism": "Enhanced inhibitory neurotransmission reduces limbic activity", "clinical_significance": "high"},
                {"parameter": "sedation", "change": "+40-70%", "direction": "increase", "mechanism": "GABAergic inhibition in reticular activating system", "clinical_significance": "high"},
                {"parameter": "memory", "change": "-10-30%", "direction": "decrease", "mechanism": "Hippocampal GABA-A activation impairs encoding", "clinical_significance": "moderate"}
            ],
            "musculoskeletal": [
                {"parameter": "muscle_tone", "change": "-20-40%", "direction": "decrease", "mechanism": "Spinal GABA-A activation reduces muscle tone", "clinical_significance": "moderate"}
            ]
        }
    },
    "antipsychotic": {
        "drug_patterns": ["risperidone", "olanzapine", "quetiapine", "aripiprazole", "haloperidol", "ziprasidone", "paliperidone", "clozapine", "lurasidone", "risperdal", "zyprexa", "seroquel", "abilify"],
        "effects": {
            "neurological": [
                {"parameter": "dopamine_d2", "change": "-60-90%", "direction": "decrease", "mechanism": "D2 receptor antagonism in mesolimbic pathway", "clinical_significance": "high"},
                {"parameter": "psychotic_symptoms", "change": "-40-70%", "direction": "decrease", "mechanism": "Reduced dopaminergic hyperactivity in limbic system", "clinical_significance": "high"},
                {"parameter": "prolactin", "change": "+50-200%", "direction": "increase", "mechanism": "D2 blockade in tuberoinfundibular pathway releases prolactin", "clinical_significance": "moderate"},
                {"parameter": "extrapyramidal_symptoms", "change": "+20-40%", "direction": "increase", "mechanism": "D2 blockade in nigrostriatal pathway (typical antipsychotics)", "clinical_significance": "moderate"}
            ],
            "glycemic": [
                {"parameter": "insulin_resistance", "change": "+15-30%", "direction": "increase", "mechanism": "5-HT2C and H1 antagonism promote weight gain and insulin resistance (olanzapine, clozapine)", "clinical_significance": "moderate"}
            ],
            "cardiovascular": [
                {"parameter": "qtc_interval", "change": "+5-20 ms", "direction": "increase", "mechanism": "HERG channel blockade prolongs repolarization (ziprasidone)", "clinical_significance": "moderate"}
            ]
        }
    },
    "opioid": {
        "drug_patterns": ["morphine", "oxycodone", "hydrocodone", "fentanyl", "tramadol", "codeine", "methadone", "buprenorphine", "hydromorphone", "oxycontin", "percocet", "vicodin"],
        "effects": {
            "neurological": [
                {"parameter": "pain_perception", "change": "-60-90%", "direction": "decrease", "mechanism": "Mu-opioid receptor activation inhibits pain signaling", "clinical_significance": "high"},
                {"parameter": "sedation", "change": "+30-60%", "direction": "increase", "mechanism": "CNS depression via opioid receptors", "clinical_significance": "moderate"},
                {"parameter": "euphoria", "change": "+40-70%", "direction": "increase", "mechanism": "Dopamine release in nucleus accumbens", "clinical_significance": "high"}
            ],
            "respiratory": [
                {"parameter": "respiratory_rate", "change": "-20-50%", "direction": "decrease", "mechanism": "Mu-receptor mediated respiratory depression in brainstem", "clinical_significance": "high"}
            ],
            "gastrointestinal": [
                {"parameter": "intestinal_transit_time", "change": "+50-100%", "direction": "increase", "mechanism": "Opioid receptors in enteric nervous system reduce motility", "clinical_significance": "high"}
            ]
        }
    },
    
    # ==================== ANTIBIOTIC/ANTIMICROBIAL ====================
    "antibiotic_penicillin": {
        "drug_patterns": ["amoxicillin", "ampicillin", "penicillin", "piperacillin", "augmentin", "amoxil"],
        "effects": {
            "immune": [
                {"parameter": "bacterial_load", "change": "-90-99%", "direction": "decrease", "mechanism": "Inhibits cell wall synthesis by binding penicillin-binding proteins", "clinical_significance": "high"}
            ],
            "gastrointestinal": [
                {"parameter": "microbiome_diversity", "change": "-20-40%", "direction": "decrease", "mechanism": "Broad-spectrum killing affects commensal bacteria", "clinical_significance": "moderate"}
            ]
        }
    },
    "antibiotic_fluoroquinolone": {
        "drug_patterns": ["ciprofloxacin", "levofloxacin", "moxifloxacin", "ofloxacin", "cipro", "levaquin"],
        "effects": {
            "immune": [
                {"parameter": "bacterial_load", "change": "-90-99%", "direction": "decrease", "mechanism": "Inhibits DNA gyrase and topoisomerase IV", "clinical_significance": "high"}
            ],
            "musculoskeletal": [
                {"parameter": "tendon_integrity", "change": "-5-15%", "direction": "decrease", "mechanism": "Disrupts collagen synthesis in tendons (tendinopathy risk)", "clinical_significance": "moderate"}
            ],
            "neurological": [
                {"parameter": "cns_effects", "change": "+5-15%", "direction": "increase", "mechanism": "GABA-A antagonism can cause CNS excitation", "clinical_significance": "low"}
            ]
        }
    },
    
    # ==================== GI DRUGS ====================
    "ppi": {
        "drug_patterns": ["omeprazole", "esomeprazole", "pantoprazole", "lansoprazole", "rabeprazole", "dexlansoprazole", "prilosec", "nexium", "protonix"],
        "effects": {
            "gastrointestinal": [
                {"parameter": "gastric_ph", "change": "+3-5 units", "direction": "increase", "mechanism": "Irreversibly inhibits H+/K+-ATPase proton pump", "clinical_significance": "high"},
                {"parameter": "acid_secretion", "change": "-80-95%", "direction": "decrease", "mechanism": "Blocks final step of acid production", "clinical_significance": "high"}
            ],
            "musculoskeletal": [
                {"parameter": "calcium_absorption", "change": "-10-20%", "direction": "decrease", "mechanism": "Reduced gastric acidity impairs calcium dissolution", "clinical_significance": "moderate"}
            ],
            "hematological": [
                {"parameter": "vitamin_b12_absorption", "change": "-10-30%", "direction": "decrease", "mechanism": "Reduced pepsin activity impairs B12 release from food", "clinical_significance": "moderate"}
            ]
        }
    },
    "h2_blocker": {
        "drug_patterns": ["famotidine", "ranitidine", "cimetidine", "nizatidine", "pepcid", "zantac"],
        "effects": {
            "gastrointestinal": [
                {"parameter": "gastric_ph", "change": "+1-3 units", "direction": "increase", "mechanism": "Blocks histamine H2 receptors on parietal cells", "clinical_significance": "moderate"},
                {"parameter": "acid_secretion", "change": "-50-70%", "direction": "decrease", "mechanism": "Reduces histamine-stimulated acid secretion", "clinical_significance": "moderate"}
            ]
        }
    },
    
    # ==================== THYROID DRUGS ====================
    "levothyroxine": {
        "drug_patterns": ["levothyroxine", "synthroid", "levoxyl", "tirosint", "liothyronine", "cytomel"],
        "effects": {
            "endocrine": [
                {"parameter": "tsh", "change": "-50-90%", "direction": "decrease", "mechanism": "Negative feedback suppresses pituitary TSH", "clinical_significance": "high"},
                {"parameter": "t4", "change": "+50-200%", "direction": "increase", "mechanism": "Exogenous T4 replacement", "clinical_significance": "high"},
                {"parameter": "t3", "change": "+30-100%", "direction": "increase", "mechanism": "Peripheral T4 to T3 conversion", "clinical_significance": "high"}
            ],
            "glycemic": [
                {"parameter": "metabolic_rate", "change": "+10-30%", "direction": "increase", "mechanism": "Thyroid hormone increases basal metabolic rate", "clinical_significance": "moderate"}
            ],
            "cardiovascular": [
                {"parameter": "heart_rate", "change": "+5-15 bpm", "direction": "increase", "mechanism": "Thyroid hormone increases cardiac β-receptor sensitivity", "clinical_significance": "moderate"}
            ]
        }
    },
    
    # ==================== CORTICOSTEROIDS ====================
    "corticosteroid": {
        "drug_patterns": ["prednisone", "prednisolone", "dexamethasone", "methylprednisolone", "hydrocortisone", "budesonide", "fluticasone", "triamcinolone", "betamethasone"],
        "effects": {
            "immune": [
                {"parameter": "inflammation", "change": "-50-90%", "direction": "decrease", "mechanism": "Inhibits NF-κB and reduces pro-inflammatory cytokines", "clinical_significance": "high"},
                {"parameter": "wbc_count", "change": "+20-50%", "direction": "increase", "mechanism": "Demargination of neutrophils and lymphopenia", "clinical_significance": "moderate"},
                {"parameter": "immune_suppression", "change": "+40-70%", "direction": "increase", "mechanism": "Inhibits T-cell activation and cytokine production", "clinical_significance": "high"}
            ],
            "glycemic": [
                {"parameter": "blood_glucose", "change": "+20-60 mg/dL", "direction": "increase", "mechanism": "Promotes gluconeogenesis and insulin resistance", "clinical_significance": "high"}
            ],
            "musculoskeletal": [
                {"parameter": "bone_mineral_density", "change": "-3-10%/year", "direction": "decrease", "mechanism": "Inhibits osteoblast function and calcium absorption", "clinical_significance": "high"},
                {"parameter": "muscle_wasting", "change": "+10-30%", "direction": "increase", "mechanism": "Promotes protein catabolism", "clinical_significance": "moderate"}
            ],
            "endocrine": [
                {"parameter": "adrenal_function", "change": "-30-70%", "direction": "decrease", "mechanism": "HPA axis suppression with prolonged use", "clinical_significance": "high"}
            ]
        }
    },
    
    # ==================== ANTICOAGULANTS ====================
    "warfarin": {
        "drug_patterns": ["warfarin", "coumadin", "jantoven"],
        "effects": {
            "hematological": [
                {"parameter": "inr", "change": "+100-300%", "direction": "increase", "mechanism": "Inhibits vitamin K epoxide reductase reducing clotting factors", "clinical_significance": "high"},
                {"parameter": "coagulation_factors", "change": "-60-80%", "direction": "decrease", "mechanism": "Reduces synthesis of factors II, VII, IX, X", "clinical_significance": "high"},
                {"parameter": "bleeding_risk", "change": "+50-150%", "direction": "increase", "mechanism": "Impaired coagulation cascade", "clinical_significance": "high"}
            ]
        }
    },
    "doac": {
        "drug_patterns": ["apixaban", "rivaroxaban", "dabigatran", "edoxaban", "eliquis", "xarelto", "pradaxa"],
        "effects": {
            "hematological": [
                {"parameter": "coagulation", "change": "-60-80%", "direction": "decrease", "mechanism": "Direct inhibition of factor Xa (apixaban, rivaroxaban) or thrombin (dabigatran)", "clinical_significance": "high"},
                {"parameter": "bleeding_risk", "change": "+30-80%", "direction": "increase", "mechanism": "Anticoagulant effect increases bleeding risk", "clinical_significance": "high"}
            ]
        }
    }
}

def get_drug_class(drug_name):
    """Identify drug class from drug name"""
    drug_lower = drug_name.lower()
    
    for drug_class, class_data in DRUG_CLASS_EFFECTS.items():
        for pattern in class_data["drug_patterns"]:
            if pattern.lower() in drug_lower:
                return drug_class, class_data["effects"]
    
    return None, None

def generate_generic_effects(drug_name):
    """Generate generic effects for drugs without specific class mapping"""
    effects = {
        "hepatic": [
            {"parameter": "alt", "change": "+5-15 U/L", "direction": "increase", "mechanism": "Most drugs undergo hepatic metabolism", "clinical_significance": "low"},
        ],
        "renal": [
            {"parameter": "creatinine", "change": "+0.1-0.2 mg/dL", "direction": "increase", "mechanism": "Renal excretion of drug metabolites", "clinical_significance": "low"}
        ]
    }
    return effects

async def update_drug_effects():
    """Update all drugs with comprehensive parameter effects"""
    
    print("Calculating comprehensive parameter effects for all drugs...")
    
    cursor = db.drugs.find({}, {"_id": 1, "name": 1, "generic_name": 1, "brand_names": 1, "drug_class": 1})
    drugs = await cursor.to_list(None)
    
    print(f"Found {len(drugs)} drugs to process")
    
    updated = 0
    class_matched = 0
    
    for drug in drugs:
        drug_name = drug.get("name", "") or drug.get("generic_name", "")
        brand_names = drug.get("brand_names", [])
        
        # Try to match drug class
        drug_class, effects = get_drug_class(drug_name)
        
        # Also try brand names
        if not drug_class and brand_names:
            for brand in brand_names:
                drug_class, effects = get_drug_class(brand)
                if drug_class:
                    break
        
        if not effects:
            effects = generate_generic_effects(drug_name)
        else:
            class_matched += 1
        
        # Format effects for storage
        parameter_effects = []
        for system, system_effects in effects.items():
            for effect in system_effects:
                parameter_effects.append({
                    "organ_system": system,
                    "system_name": DRUG_CLASS_EFFECTS.get(drug_class, {}).get("effects", {}).get(system, [{}])[0].get("system_name", system.replace("_", " ").title()),
                    **effect
                })
        
        if parameter_effects:
            await db.drugs.update_one(
                {"_id": drug["_id"]},
                {
                    "$set": {
                        "parameter_effects": parameter_effects,
                        "drug_class_identified": drug_class,
                        "effects_updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            updated += 1
    
    print(f"\n✅ Updated {updated} drugs with parameter effects")
    print(f"   {class_matched} drugs matched to specific drug classes")
    return updated

async def main():
    print("="*60)
    print("PhiCor.ai - Comprehensive Drug Effects Calculator")
    print("="*60)
    
    updated = await update_drug_effects()
    
    # Show sample
    sample = await db.drugs.find_one(
        {"parameter_effects": {"$exists": True, "$ne": []}},
        {"_id": 0, "name": 1, "drug_class_identified": 1, "parameter_effects": 1}
    )
    if sample:
        print(f"\nSample: {sample['name']} ({sample.get('drug_class_identified', 'unknown')})")
        print(f"Effects count: {len(sample.get('parameter_effects', []))}")
        for eff in sample.get("parameter_effects", [])[:3]:
            print(f"  {eff['organ_system']}: {eff['parameter']} {eff['change']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
