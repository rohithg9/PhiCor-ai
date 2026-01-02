#!/usr/bin/env python3
"""
Script to ensure all diseases have comprehensive clinical data filled.
This fills in missing vital_signs, lab_tests, physical_exam, dna, ecg, risk_factors
for diseases that are missing this data.
"""

import asyncio
import os
import json
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# Template clinical data for different disease categories
CLINICAL_TEMPLATES = {
    "cardiovascular": {
        "vital_signs": {
            "systolic_bp": {"change_percent": 15, "direction": "increase", "evidence": "Hypertensive response common"},
            "diastolic_bp": {"change_percent": 10, "direction": "increase", "evidence": "Diastolic dysfunction"},
            "resting_hr": {"change_percent": 20, "direction": "increase", "evidence": "Compensatory tachycardia"},
            "respiratory_rate": {"change_percent": 15, "direction": "increase", "evidence": "Respiratory compensation"},
            "spo2": {"change_percent": 5, "direction": "decrease", "evidence": "Impaired gas exchange"}
        },
        "lab_tests": {
            "troponin_i": {"change_percent": 200, "direction": "increase", "evidence": "Cardiac muscle damage marker"},
            "bnp": {"change_percent": 150, "direction": "increase", "evidence": "Heart failure marker"},
            "nt_probnp": {"change_percent": 180, "direction": "increase", "evidence": "Cardiac strain indicator"},
            "ldl_cholesterol": {"change_percent": 30, "direction": "increase", "evidence": "Atherosclerotic risk factor"},
            "creatinine": {"change_percent": 20, "direction": "increase", "evidence": "Cardiorenal syndrome"}
        },
        "physical_exam": {
            "s3_gallop": {"value": 1, "direction": "present", "evidence": "Volume overload sign"},
            "jvp_elevation": {"value": 1, "direction": "present", "evidence": "Right heart failure"},
            "peripheral_edema": {"value": 1, "direction": "present", "evidence": "Fluid retention"},
            "lung_crackles": {"value": 1, "direction": "present", "evidence": "Pulmonary congestion"}
        },
        "ecg": {
            "pr_interval": {"change_percent": 10, "direction": "increase", "evidence": "Conduction delay"},
            "qrs_duration": {"change_percent": 15, "direction": "increase", "evidence": "Bundle branch involvement"},
            "qtc_interval": {"change_percent": 8, "direction": "increase", "evidence": "Repolarization abnormality"},
            "st_segment": {"value": "abnormal", "direction": "change", "evidence": "Ischemia marker"}
        },
        "risk_factors": {
            "smoking": {"risk_level": "high", "evidence": "Major cardiovascular risk factor"},
            "hypertension": {"risk_level": "high", "evidence": "Pressure overload"},
            "diabetes": {"risk_level": "moderate", "evidence": "Metabolic cardiovascular risk"},
            "family_history": {"risk_level": "moderate", "evidence": "Genetic predisposition"}
        }
    },
    "metabolic": {
        "vital_signs": {
            "systolic_bp": {"change_percent": 10, "direction": "increase", "evidence": "Hypertension in metabolic syndrome"},
            "resting_hr": {"change_percent": 8, "direction": "increase", "evidence": "Autonomic dysfunction"},
            "bmi": {"change_percent": 25, "direction": "increase", "evidence": "Obesity component"}
        },
        "lab_tests": {
            "fasting_glucose": {"change_percent": 80, "direction": "increase", "evidence": "Hyperglycemia"},
            "hba1c": {"change_percent": 40, "direction": "increase", "evidence": "Chronic hyperglycemia marker"},
            "total_cholesterol": {"change_percent": 25, "direction": "increase", "evidence": "Dyslipidemia"},
            "triglycerides": {"change_percent": 60, "direction": "increase", "evidence": "Metabolic dysfunction"},
            "hdl": {"change_percent": 20, "direction": "decrease", "evidence": "Atherogenic profile"},
            "creatinine": {"change_percent": 15, "direction": "increase", "evidence": "Nephropathy development"}
        },
        "physical_exam": {
            "acanthosis_nigricans": {"value": 1, "direction": "present", "evidence": "Insulin resistance sign"},
            "central_obesity": {"value": 1, "direction": "present", "evidence": "Metabolic syndrome component"},
            "peripheral_neuropathy": {"value": 1, "direction": "present", "evidence": "Diabetic complication"}
        },
        "risk_factors": {
            "obesity": {"risk_level": "high", "evidence": "Central to metabolic syndrome"},
            "sedentary_lifestyle": {"risk_level": "high", "evidence": "Insulin resistance contributor"},
            "family_history_diabetes": {"risk_level": "moderate", "evidence": "Genetic component"}
        }
    },
    "respiratory": {
        "vital_signs": {
            "respiratory_rate": {"change_percent": 40, "direction": "increase", "evidence": "Respiratory distress"},
            "spo2": {"change_percent": 12, "direction": "decrease", "evidence": "Hypoxemia"},
            "resting_hr": {"change_percent": 25, "direction": "increase", "evidence": "Hypoxic tachycardia"},
            "temperature": {"change_percent": 10, "direction": "increase", "evidence": "Infectious component"}
        },
        "lab_tests": {
            "wbc": {"change_percent": 50, "direction": "increase", "evidence": "Infectious/inflammatory response"},
            "crp": {"change_percent": 100, "direction": "increase", "evidence": "Acute inflammation"},
            "procalcitonin": {"change_percent": 80, "direction": "increase", "evidence": "Bacterial infection marker"},
            "arterial_pco2": {"change_percent": 20, "direction": "increase", "evidence": "Ventilatory failure"},
            "arterial_po2": {"change_percent": 25, "direction": "decrease", "evidence": "Hypoxemic failure"}
        },
        "physical_exam": {
            "wheezing": {"value": 1, "direction": "present", "evidence": "Bronchospasm/airway obstruction"},
            "crackles": {"value": 1, "direction": "present", "evidence": "Alveolar fluid/infiltrate"},
            "decreased_breath_sounds": {"value": 1, "direction": "present", "evidence": "Consolidation/effusion"},
            "accessory_muscle_use": {"value": 1, "direction": "present", "evidence": "Respiratory distress"}
        },
        "risk_factors": {
            "smoking": {"risk_level": "very_high", "evidence": "Primary respiratory risk factor"},
            "occupational_exposure": {"risk_level": "moderate", "evidence": "Environmental lung disease"},
            "immunocompromised": {"risk_level": "high", "evidence": "Infection susceptibility"}
        }
    },
    "neurological": {
        "vital_signs": {
            "systolic_bp": {"change_percent": 20, "direction": "increase", "evidence": "Cushing response or hypertensive emergency"},
            "respiratory_rate": {"change_percent": 10, "direction": "change", "evidence": "Central control changes"},
            "temperature": {"change_percent": 5, "direction": "increase", "evidence": "Hypothalamic dysfunction"}
        },
        "lab_tests": {
            "csf_protein": {"change_percent": 50, "direction": "increase", "evidence": "Blood-brain barrier disruption"},
            "csf_glucose": {"change_percent": 20, "direction": "decrease", "evidence": "Infection/inflammation"},
            "sodium": {"change_percent": 8, "direction": "change", "evidence": "SIADH or diabetes insipidus"},
            "d_dimer": {"change_percent": 60, "direction": "increase", "evidence": "Thrombotic risk in stroke"}
        },
        "physical_exam": {
            "altered_mental_status": {"value": 1, "direction": "present", "evidence": "Cerebral dysfunction"},
            "focal_deficit": {"value": 1, "direction": "present", "evidence": "Localized lesion"},
            "papilledema": {"value": 1, "direction": "present", "evidence": "Increased intracranial pressure"},
            "meningismus": {"value": 1, "direction": "present", "evidence": "Meningeal irritation"}
        },
        "risk_factors": {
            "hypertension": {"risk_level": "high", "evidence": "Stroke risk factor"},
            "atrial_fibrillation": {"risk_level": "high", "evidence": "Embolic stroke risk"},
            "diabetes": {"risk_level": "moderate", "evidence": "Vascular risk"}
        }
    },
    "oncology": {
        "vital_signs": {
            "weight": {"change_percent": 15, "direction": "decrease", "evidence": "Cancer cachexia"},
            "temperature": {"change_percent": 8, "direction": "increase", "evidence": "Tumor-related fever or infection"},
            "resting_hr": {"change_percent": 15, "direction": "increase", "evidence": "Paraneoplastic or anemia"}
        },
        "lab_tests": {
            "hemoglobin": {"change_percent": 25, "direction": "decrease", "evidence": "Anemia of chronic disease"},
            "platelets": {"change_percent": 30, "direction": "decrease", "evidence": "Bone marrow involvement"},
            "albumin": {"change_percent": 20, "direction": "decrease", "evidence": "Malnutrition/cachexia"},
            "ldh": {"change_percent": 80, "direction": "increase", "evidence": "Tumor burden marker"},
            "cea": {"change_percent": 200, "direction": "increase", "evidence": "Tumor marker (colorectal)"},
            "ca125": {"change_percent": 150, "direction": "increase", "evidence": "Tumor marker (ovarian)"},
            "psa": {"change_percent": 300, "direction": "increase", "evidence": "Tumor marker (prostate)"}
        },
        "physical_exam": {
            "lymphadenopathy": {"value": 1, "direction": "present", "evidence": "Metastatic spread"},
            "hepatomegaly": {"value": 1, "direction": "present", "evidence": "Liver metastasis"},
            "palpable_mass": {"value": 1, "direction": "present", "evidence": "Primary or metastatic tumor"},
            "cachexia": {"value": 1, "direction": "present", "evidence": "Advanced disease"}
        },
        "dna": {
            "tumor_mutation_burden": {"change_percent": 100, "direction": "increase", "evidence": "Immunotherapy predictor"},
            "microsatellite_instability": {"value": "high", "direction": "present", "evidence": "Lynch syndrome indicator"},
            "p53_mutation": {"value": 1, "direction": "present", "evidence": "Tumor suppressor loss"},
            "kras_mutation": {"value": 1, "direction": "present", "evidence": "Oncogenic driver"}
        },
        "risk_factors": {
            "smoking": {"risk_level": "very_high", "evidence": "Multiple cancer risk"},
            "family_history": {"risk_level": "high", "evidence": "Hereditary cancer syndromes"},
            "alcohol": {"risk_level": "moderate", "evidence": "GI and liver cancer risk"}
        }
    },
    "infectious": {
        "vital_signs": {
            "temperature": {"change_percent": 20, "direction": "increase", "evidence": "Infectious fever"},
            "resting_hr": {"change_percent": 30, "direction": "increase", "evidence": "Septic response"},
            "systolic_bp": {"change_percent": 15, "direction": "decrease", "evidence": "Septic hypotension"},
            "respiratory_rate": {"change_percent": 35, "direction": "increase", "evidence": "Metabolic acidosis compensation"}
        },
        "lab_tests": {
            "wbc": {"change_percent": 70, "direction": "increase", "evidence": "Leukocytosis in infection"},
            "crp": {"change_percent": 200, "direction": "increase", "evidence": "Acute phase response"},
            "procalcitonin": {"change_percent": 500, "direction": "increase", "evidence": "Bacterial infection marker"},
            "lactate": {"change_percent": 100, "direction": "increase", "evidence": "Tissue hypoperfusion"},
            "blood_culture": {"value": "positive", "direction": "present", "evidence": "Bacteremia"}
        },
        "physical_exam": {
            "fever": {"value": 1, "direction": "present", "evidence": "Infectious response"},
            "tachycardia": {"value": 1, "direction": "present", "evidence": "Systemic response"},
            "altered_mental_status": {"value": 1, "direction": "present", "evidence": "Septic encephalopathy"}
        },
        "risk_factors": {
            "immunocompromised": {"risk_level": "very_high", "evidence": "Infection susceptibility"},
            "recent_hospitalization": {"risk_level": "high", "evidence": "Healthcare-associated infection"},
            "diabetes": {"risk_level": "moderate", "evidence": "Impaired immunity"}
        }
    },
    "renal": {
        "vital_signs": {
            "systolic_bp": {"change_percent": 25, "direction": "increase", "evidence": "Renal hypertension"},
            "weight": {"change_percent": 8, "direction": "increase", "evidence": "Fluid retention"}
        },
        "lab_tests": {
            "creatinine": {"change_percent": 100, "direction": "increase", "evidence": "Decreased GFR"},
            "bun": {"change_percent": 80, "direction": "increase", "evidence": "Uremia"},
            "egfr": {"change_percent": 50, "direction": "decrease", "evidence": "Renal function decline"},
            "potassium": {"change_percent": 30, "direction": "increase", "evidence": "Hyperkalemia"},
            "phosphorus": {"change_percent": 40, "direction": "increase", "evidence": "Mineral metabolism disorder"},
            "albumin_urine": {"change_percent": 500, "direction": "increase", "evidence": "Proteinuria"}
        },
        "physical_exam": {
            "peripheral_edema": {"value": 1, "direction": "present", "evidence": "Fluid overload"},
            "hypertension": {"value": 1, "direction": "present", "evidence": "Volume/RAAS mediated"},
            "uremic_frost": {"value": 1, "direction": "present", "evidence": "Advanced uremia"}
        },
        "risk_factors": {
            "diabetes": {"risk_level": "very_high", "evidence": "Leading cause of CKD"},
            "hypertension": {"risk_level": "high", "evidence": "Second leading cause"},
            "nsaid_use": {"risk_level": "moderate", "evidence": "Nephrotoxic"}
        }
    },
    "hepatic": {
        "vital_signs": {
            "systolic_bp": {"change_percent": 15, "direction": "decrease", "evidence": "Portal hypertension"},
            "resting_hr": {"change_percent": 20, "direction": "increase", "evidence": "Hyperdynamic circulation"}
        },
        "lab_tests": {
            "ast": {"change_percent": 200, "direction": "increase", "evidence": "Hepatocellular injury"},
            "alt": {"change_percent": 250, "direction": "increase", "evidence": "Liver-specific injury"},
            "alkaline_phosphatase": {"change_percent": 100, "direction": "increase", "evidence": "Cholestatic component"},
            "bilirubin": {"change_percent": 150, "direction": "increase", "evidence": "Impaired conjugation/excretion"},
            "albumin": {"change_percent": 30, "direction": "decrease", "evidence": "Synthetic dysfunction"},
            "inr": {"change_percent": 50, "direction": "increase", "evidence": "Coagulopathy"},
            "ammonia": {"change_percent": 100, "direction": "increase", "evidence": "Hepatic encephalopathy risk"}
        },
        "physical_exam": {
            "jaundice": {"value": 1, "direction": "present", "evidence": "Hyperbilirubinemia"},
            "ascites": {"value": 1, "direction": "present", "evidence": "Portal hypertension"},
            "hepatomegaly": {"value": 1, "direction": "present", "evidence": "Liver enlargement"},
            "spider_angiomata": {"value": 1, "direction": "present", "evidence": "Chronic liver disease"},
            "asterixis": {"value": 1, "direction": "present", "evidence": "Hepatic encephalopathy"}
        },
        "risk_factors": {
            "alcohol": {"risk_level": "very_high", "evidence": "Alcoholic liver disease"},
            "hepatitis_b": {"risk_level": "high", "evidence": "Chronic viral hepatitis"},
            "hepatitis_c": {"risk_level": "high", "evidence": "Chronic viral hepatitis"},
            "obesity": {"risk_level": "moderate", "evidence": "NAFLD/NASH"}
        }
    },
    "hematological": {
        "vital_signs": {
            "resting_hr": {"change_percent": 25, "direction": "increase", "evidence": "Compensatory for anemia"},
            "respiratory_rate": {"change_percent": 15, "direction": "increase", "evidence": "Hypoxia compensation"}
        },
        "lab_tests": {
            "hemoglobin": {"change_percent": 40, "direction": "decrease", "evidence": "Anemia"},
            "hematocrit": {"change_percent": 35, "direction": "decrease", "evidence": "Reduced RBC mass"},
            "mcv": {"change_percent": 20, "direction": "change", "evidence": "RBC size abnormality"},
            "platelets": {"change_percent": 50, "direction": "change", "evidence": "Thrombocytopenia/thrombocytosis"},
            "wbc": {"change_percent": 60, "direction": "change", "evidence": "Leukocyte abnormality"},
            "reticulocytes": {"change_percent": 100, "direction": "increase", "evidence": "Bone marrow response"},
            "ferritin": {"change_percent": 80, "direction": "change", "evidence": "Iron stores indicator"},
            "ldh": {"change_percent": 100, "direction": "increase", "evidence": "Hemolysis marker"}
        },
        "physical_exam": {
            "pallor": {"value": 1, "direction": "present", "evidence": "Anemia sign"},
            "petechiae": {"value": 1, "direction": "present", "evidence": "Thrombocytopenia"},
            "splenomegaly": {"value": 1, "direction": "present", "evidence": "Hematologic malignancy/hemolysis"},
            "lymphadenopathy": {"value": 1, "direction": "present", "evidence": "Lymphoproliferative disorder"}
        },
        "risk_factors": {
            "chemotherapy": {"risk_level": "high", "evidence": "Bone marrow suppression"},
            "autoimmune_disease": {"risk_level": "moderate", "evidence": "Autoimmune cytopenias"}
        }
    }
}

def get_category_template(category, name, icd10):
    """Determine the best clinical template based on disease category/name/ICD-10."""
    name_lower = name.lower() if name else ""
    icd10_upper = (icd10 or "").upper()
    
    # Check ICD-10 codes first
    if icd10_upper.startswith('I'):
        return CLINICAL_TEMPLATES.get("cardiovascular", {})
    elif icd10_upper.startswith('E'):
        return CLINICAL_TEMPLATES.get("metabolic", {})
    elif icd10_upper.startswith('J'):
        return CLINICAL_TEMPLATES.get("respiratory", {})
    elif icd10_upper.startswith('G'):
        return CLINICAL_TEMPLATES.get("neurological", {})
    elif icd10_upper.startswith('C'):
        return CLINICAL_TEMPLATES.get("oncology", {})
    elif icd10_upper.startswith('A') or icd10_upper.startswith('B'):
        return CLINICAL_TEMPLATES.get("infectious", {})
    elif icd10_upper.startswith('N'):
        return CLINICAL_TEMPLATES.get("renal", {})
    elif icd10_upper.startswith('K'):
        return CLINICAL_TEMPLATES.get("hepatic", {})
    elif icd10_upper.startswith('D'):
        return CLINICAL_TEMPLATES.get("hematological", {})
    
    # Check category
    cat_lower = (category or "").lower()
    if cat_lower in ['cardiovascular', 'cardiac', 'heart']:
        return CLINICAL_TEMPLATES.get("cardiovascular", {})
    elif cat_lower in ['metabolic', 'endocrine', 'diabetes']:
        return CLINICAL_TEMPLATES.get("metabolic", {})
    elif cat_lower in ['respiratory', 'pulmonary']:
        return CLINICAL_TEMPLATES.get("respiratory", {})
    elif cat_lower in ['neurological', 'neurology']:
        return CLINICAL_TEMPLATES.get("neurological", {})
    elif cat_lower in ['oncology', 'cancer', 'oncological']:
        return CLINICAL_TEMPLATES.get("oncology", {})
    elif cat_lower in ['infectious']:
        return CLINICAL_TEMPLATES.get("infectious", {})
    elif cat_lower in ['renal', 'nephrology']:
        return CLINICAL_TEMPLATES.get("renal", {})
    elif cat_lower in ['hepatic', 'gastrointestinal']:
        return CLINICAL_TEMPLATES.get("hepatic", {})
    elif cat_lower in ['hematological', 'hematology']:
        return CLINICAL_TEMPLATES.get("hematological", {})
    
    # Default to cardiovascular as it has broad applicability
    return CLINICAL_TEMPLATES.get("cardiovascular", {})


async def fill_missing_clinical_data():
    """Fill in missing clinical data for all diseases."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    diseases_collection = db.diseases
    
    print(f"Connected to MongoDB: {DB_NAME}")
    
    # Get all diseases
    total = await diseases_collection.count_documents({})
    print(f"Total diseases: {total}")
    
    updated = 0
    skipped = 0
    
    async for disease in diseases_collection.find({}):
        disease_id = disease.get('id', '')
        name = disease.get('name', '')
        category = disease.get('category', '')
        icd10 = disease.get('icd10_code', '')
        mods = disease.get('parameter_modifications', {})
        
        # Check if clinical data is missing
        has_vitals = any('vital_signs' in str(v) or 'vitals' in str(v) for v in mods.values() if isinstance(v, dict))
        has_labs = any('lab_tests' in str(v) or 'labs' in str(v) for v in mods.values() if isinstance(v, dict))
        has_physical = any('physical_exam' in str(v) for v in mods.values() if isinstance(v, dict))
        
        # Also check if the scales themselves exist at the organ level
        for organ_id, organ_mods in mods.items():
            if isinstance(organ_mods, dict):
                if 'vital_signs' in organ_mods or 'vitals' in organ_mods:
                    has_vitals = True
                if 'lab_tests' in organ_mods or 'labs' in organ_mods:
                    has_labs = True
                if 'physical_exam' in organ_mods:
                    has_physical = True
        
        if has_vitals and has_labs and has_physical:
            skipped += 1
            continue
        
        # Get the appropriate template
        template = get_category_template(category, name, icd10)
        
        # Build the new modifications
        new_mods = dict(mods) if mods else {}
        
        # Ensure 'heart' organ exists for vitals
        if 'heart' not in new_mods:
            new_mods['heart'] = {}
        
        # Add missing clinical data to the 'heart' organ (as it's the main organ for vitals)
        if not has_vitals and 'vital_signs' in template:
            new_mods['heart']['vital_signs'] = template['vital_signs']
        
        if not has_labs and 'lab_tests' in template:
            new_mods['heart']['lab_tests'] = template['lab_tests']
        
        if not has_physical and 'physical_exam' in template:
            new_mods['heart']['physical_exam'] = template['physical_exam']
        
        # Add ECG data if available in template
        if 'ecg' in template and 'ecg' not in new_mods.get('heart', {}):
            new_mods['heart']['ecg'] = template['ecg']
        
        # Add risk factors to a 'general' category
        if 'risk_factors' in template:
            if 'general' not in new_mods:
                new_mods['general'] = {}
            new_mods['general']['risk_factors'] = template['risk_factors']
        
        # Add DNA data to cellular organ
        if 'dna' in template:
            if 'cellular' not in new_mods:
                new_mods['cellular'] = {}
            if 'dna' not in new_mods.get('cellular', {}):
                new_mods['cellular']['dna'] = template['dna']
        
        # Update the disease
        await diseases_collection.update_one(
            {'_id': disease['_id']},
            {'$set': {
                'parameter_modifications': new_mods,
                'clinical_data_filled': True,
                'clinical_data_filled_at': datetime.utcnow().isoformat()
            }}
        )
        updated += 1
        
        if updated % 50 == 0:
            print(f"  Updated {updated} diseases...")
    
    print(f"\n=== Clinical Data Fill Complete ===")
    print(f"Updated: {updated}")
    print(f"Skipped (already had data): {skipped}")
    print(f"Total processed: {updated + skipped}")
    
    client.close()
    return updated, skipped


if __name__ == "__main__":
    asyncio.run(fill_missing_clinical_data())
