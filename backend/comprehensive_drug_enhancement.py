"""
PhiCor Drug Engine - Comprehensive Drug Parameter Enhancement
Adds detailed parameter effects for ALL organ systems to drugs
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from comprehensive_parameter_database import ORGAN_SYSTEMS

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# ============================================================
# DRUG CLASS TO PARAMETER EFFECTS MAPPING
# ============================================================

DRUG_CLASS_EFFECTS = {
    "ACE Inhibitor": {
        "cardiovascular": [
            {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "-10 to -15 mmHg", "mechanism": "Inhibits angiotensin-converting enzyme, reducing angiotensin II"},
            {"parameter": "bp_diastolic", "direction": "decrease", "magnitude": "-5 to -10 mmHg", "mechanism": "Decreased peripheral vascular resistance"},
            {"parameter": "peripheral_resistance", "direction": "decrease", "magnitude": "-15 to -25%", "mechanism": "Vasodilation from reduced angiotensin II"},
            {"parameter": "cardiac_output", "direction": "increase", "magnitude": "mild", "mechanism": "Reduced afterload improves cardiac function"},
            {"parameter": "ldl_cholesterol", "direction": "neutral", "mechanism": "No direct effect on lipids"},
        ],
        "renal": [
            {"parameter": "gfr", "direction": "decrease", "magnitude": "initial -10-15%, stabilizes", "mechanism": "Reduced intraglomerular pressure (nephroprotective long-term)"},
            {"parameter": "serum_potassium", "direction": "increase", "magnitude": "+0.3-0.5 mEq/L", "mechanism": "Reduced aldosterone secretion"},
            {"parameter": "serum_creatinine", "direction": "increase", "magnitude": "initial 10-20%", "mechanism": "Hemodynamic effect on GFR"},
            {"parameter": "urine_protein", "direction": "decrease", "magnitude": "-30 to -50%", "mechanism": "Reduces intraglomerular pressure"},
        ],
        "endocrine": [
            {"parameter": "aldosterone", "direction": "decrease", "mechanism": "Reduced angiotensin II stimulation of adrenal glands"},
        ],
        "respiratory": [
            {"parameter": "respiratory_rate", "direction": "neutral", "mechanism": "Cough is side effect (bradykinin accumulation), not respiratory rate change"},
        ],
    },
    "ARB": {
        "cardiovascular": [
            {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "-10 to -14 mmHg", "mechanism": "Blocks angiotensin II type 1 receptors"},
            {"parameter": "bp_diastolic", "direction": "decrease", "magnitude": "-5 to -9 mmHg", "mechanism": "Vasodilation from AT1 receptor blockade"},
            {"parameter": "peripheral_resistance", "direction": "decrease", "magnitude": "-15 to -20%", "mechanism": "Arterial vasodilation"},
            {"parameter": "ldl_cholesterol", "direction": "neutral", "mechanism": "No direct effect"},
        ],
        "renal": [
            {"parameter": "gfr", "direction": "decrease", "magnitude": "initial mild", "mechanism": "Reduced intraglomerular pressure"},
            {"parameter": "serum_potassium", "direction": "increase", "magnitude": "+0.2-0.4 mEq/L", "mechanism": "Reduced aldosterone"},
            {"parameter": "uric_acid", "direction": "decrease", "magnitude": "-10 to -15% (losartan)", "mechanism": "Uricosuric effect unique to losartan"},
            {"parameter": "urine_protein", "direction": "decrease", "magnitude": "-25 to -40%", "mechanism": "Nephroprotective effect"},
        ],
    },
    "Beta Blocker": {
        "cardiovascular": [
            {"parameter": "heart_rate", "direction": "decrease", "magnitude": "-10 to -20 bpm", "mechanism": "Blocks beta-1 adrenergic receptors in heart"},
            {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "-8 to -12 mmHg", "mechanism": "Reduced cardiac output and renin release"},
            {"parameter": "bp_diastolic", "direction": "decrease", "magnitude": "-5 to -8 mmHg", "mechanism": "Decreased peripheral resistance over time"},
            {"parameter": "cardiac_output", "direction": "decrease", "magnitude": "-15 to -25%", "mechanism": "Negative inotropic and chronotropic effects"},
            {"parameter": "ejection_fraction", "direction": "increase", "magnitude": "+5-10% in heart failure", "mechanism": "Reverse remodeling in cardiomyopathy"},
        ],
        "glycemic": [
            {"parameter": "fasting_glucose", "direction": "increase", "magnitude": "+5-10 mg/dL", "mechanism": "Impaired insulin secretion and glucose metabolism"},
            {"parameter": "hba1c", "direction": "increase", "magnitude": "+0.2-0.4%", "mechanism": "Beta-2 blockade affects glucose homeostasis"},
        ],
        "respiratory": [
            {"parameter": "fev1", "direction": "decrease", "magnitude": "-5-15% (non-selective)", "mechanism": "Beta-2 blockade causes bronchospasm"},
            {"parameter": "peak_flow", "direction": "decrease", "magnitude": "variable", "mechanism": "Bronchoconstriction risk"},
        ],
        "endocrine": [
            {"parameter": "tsh", "direction": "neutral", "mechanism": "May affect thyroid hormone conversion slightly"},
        ],
    },
    "Calcium Channel Blocker": {
        "cardiovascular": [
            {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "-10 to -15 mmHg", "mechanism": "Blocks L-type calcium channels, causes vasodilation"},
            {"parameter": "bp_diastolic", "direction": "decrease", "magnitude": "-6 to -10 mmHg", "mechanism": "Reduced peripheral vascular resistance"},
            {"parameter": "heart_rate", "direction": "decrease", "magnitude": "-5 to -15 bpm (non-DHP)", "mechanism": "Diltiazem/Verapamil slow AV conduction"},
            {"parameter": "peripheral_resistance", "direction": "decrease", "magnitude": "-20 to -30%", "mechanism": "Arterial smooth muscle relaxation"},
        ],
        "renal": [
            {"parameter": "gfr", "direction": "neutral", "mechanism": "Maintains renal blood flow via afferent vasodilation"},
        ],
        "gastrointestinal": [
            {"parameter": "intestinal_motility", "direction": "decrease", "magnitude": "mild (verapamil)", "mechanism": "Smooth muscle relaxation causes constipation"},
        ],
    },
    "Thiazide Diuretic": {
        "cardiovascular": [
            {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "-8 to -12 mmHg", "mechanism": "Volume depletion and reduced peripheral resistance"},
            {"parameter": "bp_diastolic", "direction": "decrease", "magnitude": "-4 to -8 mmHg", "mechanism": "Decreased blood volume"},
        ],
        "renal": [
            {"parameter": "serum_sodium", "direction": "decrease", "magnitude": "-2 to -5 mEq/L", "mechanism": "Inhibits Na-Cl cotransporter in DCT"},
            {"parameter": "serum_potassium", "direction": "decrease", "magnitude": "-0.3 to -0.6 mEq/L", "mechanism": "Increased K+ excretion"},
            {"parameter": "uric_acid", "direction": "increase", "magnitude": "+0.5 to +1.5 mg/dL", "mechanism": "Decreased uric acid excretion"},
            {"parameter": "urine_output", "direction": "increase", "magnitude": "moderate", "mechanism": "Diuretic effect"},
        ],
        "glycemic": [
            {"parameter": "fasting_glucose", "direction": "increase", "magnitude": "+5-10 mg/dL", "mechanism": "Hypokalemia impairs insulin secretion"},
        ],
        "musculoskeletal": [
            {"parameter": "calcium_serum", "direction": "increase", "magnitude": "+0.2-0.5 mg/dL", "mechanism": "Increased renal calcium reabsorption"},
        ],
    },
    "Loop Diuretic": {
        "cardiovascular": [
            {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "-5 to -10 mmHg", "mechanism": "Volume depletion"},
        ],
        "renal": [
            {"parameter": "urine_output", "direction": "increase", "magnitude": "significant", "mechanism": "Blocks Na-K-2Cl in loop of Henle"},
            {"parameter": "serum_potassium", "direction": "decrease", "magnitude": "-0.5 to -1.0 mEq/L", "mechanism": "Increased K+ excretion"},
            {"parameter": "serum_sodium", "direction": "decrease", "magnitude": "variable", "mechanism": "Natriuresis"},
            {"parameter": "serum_magnesium", "direction": "decrease", "mechanism": "Increased Mg excretion"},
        ],
        "musculoskeletal": [
            {"parameter": "calcium_serum", "direction": "decrease", "magnitude": "mild", "mechanism": "Increased calcium excretion"},
        ],
    },
    "Statin": {
        "cardiovascular": [
            {"parameter": "ldl_cholesterol", "direction": "decrease", "magnitude": "-30 to -55%", "mechanism": "Inhibits HMG-CoA reductase, reduces cholesterol synthesis"},
            {"parameter": "total_cholesterol", "direction": "decrease", "magnitude": "-20 to -35%", "mechanism": "Decreased hepatic cholesterol production"},
            {"parameter": "hdl_cholesterol", "direction": "increase", "magnitude": "+5 to -15%", "mechanism": "Upregulates HDL synthesis"},
            {"parameter": "triglycerides", "direction": "decrease", "magnitude": "-10 to -30%", "mechanism": "Reduced VLDL production"},
            {"parameter": "crp", "direction": "decrease", "magnitude": "-15 to -40%", "mechanism": "Pleiotropic anti-inflammatory effect"},
        ],
        "hepatic": [
            {"parameter": "alt", "direction": "increase", "magnitude": "transient mild", "mechanism": "Hepatocyte stress (rare clinically significant)"},
            {"parameter": "ast", "direction": "increase", "magnitude": "transient mild", "mechanism": "Usually <3x ULN is acceptable"},
        ],
        "musculoskeletal": [
            {"parameter": "creatine_kinase", "direction": "increase", "magnitude": "rare but monitor", "mechanism": "Myopathy risk (mitochondrial dysfunction)"},
        ],
        "glycemic": [
            {"parameter": "hba1c", "direction": "increase", "magnitude": "+0.1-0.3%", "mechanism": "Small increased diabetes risk"},
        ],
    },
    "Metformin": {
        "glycemic": [
            {"parameter": "fasting_glucose", "direction": "decrease", "magnitude": "-25 to -40 mg/dL", "mechanism": "Reduces hepatic glucose production"},
            {"parameter": "hba1c", "direction": "decrease", "magnitude": "-1.0 to -1.5%", "mechanism": "Improves insulin sensitivity"},
            {"parameter": "homa_ir", "direction": "decrease", "magnitude": "-15 to -30%", "mechanism": "Enhances peripheral glucose uptake"},
            {"parameter": "fasting_insulin", "direction": "decrease", "magnitude": "-10 to -25%", "mechanism": "Reduces insulin resistance"},
        ],
        "cardiovascular": [
            {"parameter": "ldl_cholesterol", "direction": "decrease", "magnitude": "mild -5-10%", "mechanism": "Secondary to weight loss"},
            {"parameter": "triglycerides", "direction": "decrease", "magnitude": "-10 to -15%", "mechanism": "Improved lipid metabolism"},
        ],
        "gastrointestinal": [
            {"parameter": "intestinal_motility", "direction": "increase", "mechanism": "GI side effects common (diarrhea)"},
        ],
        "hematologic": [
            {"parameter": "vitamin_b12", "direction": "decrease", "magnitude": "long-term -10-30%", "mechanism": "Reduced intrinsic factor-B12 absorption"},
        ],
    },
    "SGLT2 Inhibitor": {
        "glycemic": [
            {"parameter": "fasting_glucose", "direction": "decrease", "magnitude": "-20 to -35 mg/dL", "mechanism": "Increases urinary glucose excretion"},
            {"parameter": "hba1c", "direction": "decrease", "magnitude": "-0.5 to -1.0%", "mechanism": "Insulin-independent glucose lowering"},
        ],
        "cardiovascular": [
            {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "-3 to -6 mmHg", "mechanism": "Osmotic diuresis and natriuresis"},
            {"parameter": "bnp", "direction": "decrease", "magnitude": "-20 to -40%", "mechanism": "Reduces cardiac preload in heart failure"},
        ],
        "renal": [
            {"parameter": "gfr", "direction": "decrease", "magnitude": "initial mild, nephroprotective long-term", "mechanism": "Reduces intraglomerular pressure"},
            {"parameter": "urine_output", "direction": "increase", "mechanism": "Osmotic diuresis"},
            {"parameter": "uric_acid", "direction": "decrease", "magnitude": "-10 to -15%", "mechanism": "Increased uric acid excretion"},
        ],
    },
    "GLP-1 Agonist": {
        "glycemic": [
            {"parameter": "fasting_glucose", "direction": "decrease", "magnitude": "-20 to -40 mg/dL", "mechanism": "Glucose-dependent insulin secretion"},
            {"parameter": "hba1c", "direction": "decrease", "magnitude": "-0.8 to -1.5%", "mechanism": "Multiple mechanisms including satiety"},
            {"parameter": "postprandial_glucose", "direction": "decrease", "magnitude": "-30 to -50 mg/dL", "mechanism": "Delayed gastric emptying"},
        ],
        "cardiovascular": [
            {"parameter": "bp_systolic", "direction": "decrease", "magnitude": "-2 to -5 mmHg", "mechanism": "Weight loss and direct vascular effects"},
            {"parameter": "heart_rate", "direction": "increase", "magnitude": "+2 to +5 bpm", "mechanism": "Direct sinoatrial node effect"},
            {"parameter": "ldl_cholesterol", "direction": "decrease", "magnitude": "mild", "mechanism": "Weight loss effect"},
        ],
        "gastrointestinal": [
            {"parameter": "gastric_emptying", "direction": "increase", "magnitude": "delayed", "mechanism": "Slows gastric motility (satiety effect)"},
        ],
    },
    "Insulin": {
        "glycemic": [
            {"parameter": "fasting_glucose", "direction": "decrease", "magnitude": "dose-dependent", "mechanism": "Promotes glucose uptake into cells"},
            {"parameter": "hba1c", "direction": "decrease", "magnitude": "-1.5 to -3.5%", "mechanism": "Direct glucose control"},
            {"parameter": "postprandial_glucose", "direction": "decrease", "magnitude": "significant", "mechanism": "Rapid glucose disposal"},
        ],
        "renal": [
            {"parameter": "serum_potassium", "direction": "decrease", "magnitude": "acute -0.5 to -1.0 mEq/L", "mechanism": "Drives K+ into cells"},
        ],
    },
    "Sulfonylurea": {
        "glycemic": [
            {"parameter": "fasting_glucose", "direction": "decrease", "magnitude": "-40 to -70 mg/dL", "mechanism": "Stimulates pancreatic insulin secretion"},
            {"parameter": "hba1c", "direction": "decrease", "magnitude": "-1.0 to -2.0%", "mechanism": "Increases insulin release"},
        ],
    },
    "PPI": {
        "gastrointestinal": [
            {"parameter": "gastric_ph", "direction": "increase", "magnitude": "pH 4-6", "mechanism": "Irreversibly inhibits H+/K+ ATPase"},
            {"parameter": "h_pylori", "direction": "neutral", "mechanism": "Used in eradication therapy but not direct effect"},
        ],
        "musculoskeletal": [
            {"parameter": "bone_density", "direction": "decrease", "magnitude": "long-term use", "mechanism": "Reduced calcium absorption"},
            {"parameter": "calcium_serum", "direction": "decrease", "magnitude": "rare", "mechanism": "Impaired calcium absorption"},
        ],
        "hematologic": [
            {"parameter": "vitamin_b12", "direction": "decrease", "magnitude": "long-term use", "mechanism": "Reduced B12 absorption without acid"},
            {"parameter": "iron_serum", "direction": "decrease", "magnitude": "long-term use", "mechanism": "Reduced iron absorption"},
        ],
        "renal": [
            {"parameter": "serum_magnesium", "direction": "decrease", "magnitude": "rare hypomagnesemia", "mechanism": "Long-term use affects Mg absorption"},
        ],
    },
    "SSRI": {
        "neurological": [
            {"parameter": "depression_score", "direction": "decrease", "magnitude": "-5 to -10 points", "mechanism": "Increases synaptic serotonin"},
            {"parameter": "anxiety_score", "direction": "decrease", "magnitude": "variable", "mechanism": "Serotonergic anxiolytic effect"},
            {"parameter": "serotonin", "direction": "increase", "mechanism": "Blocks serotonin reuptake transporters"},
            {"parameter": "sleep_quality", "direction": "variable", "mechanism": "Can disrupt REM sleep initially"},
        ],
        "cardiovascular": [
            {"parameter": "heart_rate", "direction": "neutral", "mechanism": "Generally cardiovascular neutral"},
            {"parameter": "bp_systolic", "direction": "neutral", "mechanism": "No significant effect"},
        ],
        "gastrointestinal": [
            {"parameter": "intestinal_motility", "direction": "increase", "mechanism": "Serotonin affects GI tract (nausea, diarrhea initially)"},
        ],
        "hematologic": [
            {"parameter": "platelet_count", "direction": "neutral", "mechanism": "Can affect platelet aggregation (bleeding risk)"},
        ],
    },
    "Benzodiazepine": {
        "neurological": [
            {"parameter": "anxiety_score", "direction": "decrease", "magnitude": "rapid effect", "mechanism": "Enhances GABA-A receptor activity"},
            {"parameter": "sleep_quality", "direction": "increase", "magnitude": "short-term", "mechanism": "Sedative-hypnotic effect"},
            {"parameter": "gaba", "direction": "increase", "mechanism": "Positive allosteric modulator of GABA-A"},
            {"parameter": "cognitive_function", "direction": "decrease", "magnitude": "acute and long-term", "mechanism": "CNS depression"},
            {"parameter": "reaction_time", "direction": "increase", "magnitude": "slower", "mechanism": "Psychomotor impairment"},
        ],
        "respiratory": [
            {"parameter": "respiratory_rate", "direction": "decrease", "magnitude": "dose-dependent", "mechanism": "CNS respiratory depression"},
        ],
    },
    "Opioid": {
        "neurological": [
            {"parameter": "cognitive_function", "direction": "decrease", "mechanism": "CNS depression"},
            {"parameter": "reaction_time", "direction": "increase", "mechanism": "Sedation and psychomotor slowing"},
        ],
        "gastrointestinal": [
            {"parameter": "intestinal_motility", "direction": "decrease", "magnitude": "significant", "mechanism": "Mu-receptor activation in GI tract (constipation)"},
            {"parameter": "gastric_emptying", "direction": "increase", "magnitude": "delayed", "mechanism": "Reduced GI motility"},
        ],
        "respiratory": [
            {"parameter": "respiratory_rate", "direction": "decrease", "magnitude": "dose-dependent", "mechanism": "Medullary respiratory center depression"},
            {"parameter": "oxygen_saturation", "direction": "decrease", "mechanism": "Respiratory depression"},
        ],
        "endocrine": [
            {"parameter": "testosterone", "direction": "decrease", "magnitude": "chronic use", "mechanism": "Hypothalamic suppression"},
            {"parameter": "cortisol_morning", "direction": "decrease", "mechanism": "Adrenal suppression with chronic use"},
        ],
    },
    "Corticosteroid": {
        "immune": [
            {"parameter": "wbc_count", "direction": "increase", "magnitude": "leukocytosis", "mechanism": "Demargination of neutrophils"},
            {"parameter": "lymphocytes", "direction": "decrease", "mechanism": "Lymphopenia from redistribution"},
            {"parameter": "il6", "direction": "decrease", "mechanism": "Powerful anti-inflammatory effect"},
            {"parameter": "tnf_alpha", "direction": "decrease", "mechanism": "Suppresses inflammatory cytokines"},
        ],
        "glycemic": [
            {"parameter": "fasting_glucose", "direction": "increase", "magnitude": "+20-100 mg/dL", "mechanism": "Gluconeogenesis and insulin resistance"},
            {"parameter": "hba1c", "direction": "increase", "magnitude": "chronic use", "mechanism": "Steroid-induced diabetes"},
        ],
        "musculoskeletal": [
            {"parameter": "bone_density", "direction": "decrease", "magnitude": "-3 to -10% annually", "mechanism": "Inhibits osteoblasts, increases osteoclasts"},
            {"parameter": "muscle_mass", "direction": "decrease", "mechanism": "Protein catabolism (steroid myopathy)"},
        ],
        "endocrine": [
            {"parameter": "cortisol_morning", "direction": "decrease", "mechanism": "Suppresses HPA axis"},
            {"parameter": "acth", "direction": "decrease", "mechanism": "Negative feedback suppression"},
        ],
        "cardiovascular": [
            {"parameter": "bp_systolic", "direction": "increase", "magnitude": "+5-15 mmHg", "mechanism": "Sodium retention and vascular effects"},
        ],
        "dermatological": [
            {"parameter": "skin_elasticity", "direction": "decrease", "mechanism": "Collagen breakdown"},
            {"parameter": "wound_healing", "direction": "decrease", "mechanism": "Impaired fibroblast function"},
        ],
    },
    "Antibiotic": {
        "gastrointestinal": [
            {"parameter": "gut_microbiome_diversity", "direction": "decrease", "mechanism": "Disrupts normal flora"},
            {"parameter": "stool_frequency", "direction": "increase", "mechanism": "Antibiotic-associated diarrhea"},
        ],
        "hepatic": [
            {"parameter": "alt", "direction": "increase", "magnitude": "rare hepatotoxicity", "mechanism": "Drug-induced liver injury (some antibiotics)"},
        ],
        "hematologic": [
            {"parameter": "platelet_count", "direction": "decrease", "magnitude": "rare", "mechanism": "Drug-induced thrombocytopenia"},
        ],
    },
    "Anticoagulant": {
        "hematologic": [
            {"parameter": "pt_inr", "direction": "increase", "magnitude": "target 2-3 for warfarin", "mechanism": "Inhibits vitamin K-dependent clotting factors"},
            {"parameter": "d_dimer", "direction": "decrease", "mechanism": "Reduced fibrin formation"},
        ],
        "hepatic": [
            {"parameter": "alt", "direction": "neutral", "mechanism": "Monitor for hepatotoxicity with some agents"},
        ],
    },
    "NSAID": {
        "gastrointestinal": [
            {"parameter": "gastric_ph", "direction": "decrease", "magnitude": "indirectly", "mechanism": "Reduces protective prostaglandins"},
            {"parameter": "fecal_calprotectin", "direction": "increase", "mechanism": "GI inflammation and ulcer risk"},
        ],
        "renal": [
            {"parameter": "gfr", "direction": "decrease", "magnitude": "-10-20% in susceptible", "mechanism": "Reduces renal prostaglandins"},
            {"parameter": "serum_potassium", "direction": "increase", "magnitude": "mild", "mechanism": "Reduced aldosterone effect"},
            {"parameter": "serum_sodium", "direction": "decrease", "mechanism": "Fluid retention can cause dilutional hyponatremia"},
        ],
        "cardiovascular": [
            {"parameter": "bp_systolic", "direction": "increase", "magnitude": "+2-5 mmHg", "mechanism": "Sodium and fluid retention"},
        ],
        "hematologic": [
            {"parameter": "platelet_count", "direction": "neutral", "mechanism": "Inhibits platelet aggregation (bleeding risk)"},
        ],
    },
    "Thyroid Hormone": {
        "endocrine": [
            {"parameter": "tsh", "direction": "decrease", "mechanism": "Negative feedback from T4 replacement"},
            {"parameter": "free_t4", "direction": "increase", "mechanism": "Exogenous T4 supplementation"},
            {"parameter": "free_t3", "direction": "increase", "mechanism": "Peripheral conversion from T4"},
        ],
        "cardiovascular": [
            {"parameter": "heart_rate", "direction": "increase", "magnitude": "if over-replaced", "mechanism": "Thyroid hormone increases HR"},
            {"parameter": "bp_systolic", "direction": "increase", "magnitude": "if over-replaced", "mechanism": "Increased cardiac output"},
        ],
        "musculoskeletal": [
            {"parameter": "bone_density", "direction": "decrease", "magnitude": "if over-replaced", "mechanism": "Thyrotoxicosis increases bone turnover"},
        ],
        "glycemic": [
            {"parameter": "fasting_glucose", "direction": "increase", "magnitude": "if over-replaced", "mechanism": "Increased gluconeogenesis"},
        ],
    },
}

async def enhance_drug_parameters():
    """Add comprehensive parameter effects to all drugs based on drug class"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    drugs = await db.drugs.find({}, {'_id': 0}).to_list(500)
    
    enhanced = 0
    skipped = 0
    
    for drug in drugs:
        drug_class = drug.get('drug_class', '')
        category = drug.get('category', '')
        
        # Find matching class effects
        class_effects = None
        for class_name, effects in DRUG_CLASS_EFFECTS.items():
            if class_name.lower() in drug_class.lower() or class_name.lower() in category.lower():
                class_effects = effects
                break
        
        # Also try name-based matching
        if not class_effects:
            drug_name = drug.get('name', '').lower()
            if 'metformin' in drug_name:
                class_effects = DRUG_CLASS_EFFECTS.get('Metformin')
            elif 'statin' in drug_name or drug_name.endswith('statin'):
                class_effects = DRUG_CLASS_EFFECTS.get('Statin')
            elif 'pril' in drug_name:
                class_effects = DRUG_CLASS_EFFECTS.get('ACE Inhibitor')
            elif 'sartan' in drug_name:
                class_effects = DRUG_CLASS_EFFECTS.get('ARB')
            elif 'olol' in drug_name:
                class_effects = DRUG_CLASS_EFFECTS.get('Beta Blocker')
            elif 'dipine' in drug_name:
                class_effects = DRUG_CLASS_EFFECTS.get('Calcium Channel Blocker')
            elif 'prazole' in drug_name or 'tidine' in drug_name:
                class_effects = DRUG_CLASS_EFFECTS.get('PPI')
            elif 'gliflozin' in drug_name:
                class_effects = DRUG_CLASS_EFFECTS.get('SGLT2 Inhibitor')
            elif 'glutide' in drug_name:
                class_effects = DRUG_CLASS_EFFECTS.get('GLP-1 Agonist')
        
        if not class_effects:
            skipped += 1
            continue
        
        # Build organ_system_parameter_effects
        organ_effects = {}
        for system_id in ORGAN_SYSTEMS.keys():
            effects_for_system = class_effects.get(system_id, [])
            if effects_for_system:
                overall = "therapeutic"
                # Determine overall effect
                decreases_good = sum(1 for e in effects_for_system if e.get('direction') == 'decrease' and any(x in e.get('parameter', '') for x in ['bp', 'cholesterol', 'glucose']))
                increases_bad = sum(1 for e in effects_for_system if e.get('direction') == 'increase' and any(x in e.get('parameter', '') for x in ['glucose', 'potassium']))
                
                if decreases_good > increases_bad:
                    overall = "therapeutic"
                elif increases_bad > 0:
                    overall = "caution"
                
                organ_effects[system_id] = {
                    "overall_effect": overall,
                    "parameters_affected": [
                        {
                            "parameter": e.get('parameter'),
                            "direction": e.get('direction'),
                            "magnitude": e.get('magnitude', 'variable'),
                            "mechanism": e.get('mechanism'),
                            "quantified_change": e.get('magnitude'),
                            "from_drug": drug.get('name')
                        }
                        for e in effects_for_system
                    ]
                }
        
        # Update drug
        await db.drugs.update_one(
            {"id": drug.get('id')},
            {
                "$set": {
                    "organ_system_parameter_effects": organ_effects,
                    "has_comprehensive_effects": True,
                    "enhanced_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        enhanced += 1
    
    # Get stats
    total = await db.drugs.count_documents({})
    with_effects = await db.drugs.count_documents({"has_comprehensive_effects": True})
    
    print(f"=== Drug Parameter Enhancement Complete ===")
    print(f"Enhanced: {enhanced} drugs")
    print(f"Skipped (no matching class): {skipped}")
    print(f"Total drugs: {total}")
    print(f"Drugs with comprehensive effects: {with_effects}")

if __name__ == "__main__":
    asyncio.run(enhance_drug_parameters())
