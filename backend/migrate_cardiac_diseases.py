#!/usr/bin/env python3
"""
Migrate frontend static cardiac diseases to MongoDB with proper parameter_modifications.
Converts the rich clinical data from frontend format to parameter_modifications format.
"""

import asyncio
import os
import json
import re
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')


# Comprehensive heart failure parameters template
HEART_FAILURE_PARAMS = {
    "heart": {
        "vital_signs": {
            "systolic_bp": {"change_percent": 15, "direction": "decrease", "evidence": "Reduced cardiac output in acute HF"},
            "diastolic_bp": {"change_percent": 10, "direction": "decrease", "evidence": "Hypoperfusion"},
            "resting_hr": {"change_percent": 35, "direction": "increase", "evidence": "Compensatory tachycardia"},
            "respiratory_rate": {"change_percent": 50, "direction": "increase", "evidence": "Pulmonary congestion/edema"},
            "spo2": {"change_percent": 12, "direction": "decrease", "evidence": "Impaired gas exchange from pulmonary edema"},
            "temperature": {"change_percent": 0, "direction": "normal", "evidence": "Usually normal unless infected"}
        },
        "physical_exam": {
            "s3_gallop": {"value": 1, "direction": "present", "evidence": "Pathognomonic for volume overload and ventricular dysfunction"},
            "s4_gallop": {"value": 1, "direction": "present", "evidence": "Diastolic dysfunction, reduced compliance"},
            "jvp_elevation": {"value": 1, "direction": "present", "evidence": "Elevated right atrial pressure"},
            "peripheral_edema": {"value": 1, "direction": "present", "evidence": "Fluid retention, right heart failure"},
            "lung_crackles": {"value": 1, "direction": "present", "evidence": "Pulmonary congestion/edema"},
            "hepatomegaly": {"value": 1, "direction": "present", "evidence": "Hepatic congestion"},
            "displaced_pmi": {"value": 1, "direction": "present", "evidence": "Cardiomegaly, LV dilation"},
            "murmur": {"value": 1, "direction": "present", "evidence": "Functional MR from LV dilation"}
        },
        "lab_tests": {
            "bnp": {"change_percent": 900, "direction": "increase", "evidence": "Highly elevated (>400 pg/mL, often >1000 in acute HF)"},
            "nt_probnp": {"change_percent": 1200, "direction": "increase", "evidence": "Highly elevated (>900 pg/mL, often >5000)"},
            "troponin_i": {"change_percent": 150, "direction": "increase", "evidence": "Elevated from myocardial stress/demand ischemia"},
            "creatinine": {"change_percent": 35, "direction": "increase", "evidence": "Cardiorenal syndrome"},
            "sodium": {"change_percent": 6, "direction": "decrease", "evidence": "Dilutional hyponatremia"},
            "lactate": {"change_percent": 100, "direction": "increase", "evidence": "Tissue hypoperfusion, especially in cardiogenic shock"},
            "albumin": {"change_percent": 15, "direction": "decrease", "evidence": "Hepatic congestion, third-spacing"}
        },
        "ecg": {
            "pr_interval": {"change_percent": 10, "direction": "increase", "evidence": "First-degree AV block common"},
            "qrs_duration": {"change_percent": 25, "direction": "increase", "evidence": "Bundle branch block, intraventricular conduction delay"},
            "qtc_interval": {"change_percent": 15, "direction": "increase", "evidence": "Repolarization abnormality, arrhythmia risk"},
            "lv_hypertrophy": {"value": 1, "direction": "present", "evidence": "Voltage criteria for LVH"},
            "st_changes": {"value": 1, "direction": "present", "evidence": "Strain pattern, ischemia"}
        },
        "imaging": {
            "lvef": {"change_percent": 50, "direction": "decrease", "evidence": "Reduced to <40% in HFrEF, may be preserved in HFpEF"},
            "lv_edv": {"change_percent": 60, "direction": "increase", "evidence": "Ventricular dilation from volume overload"},
            "lv_esv": {"change_percent": 80, "direction": "increase", "evidence": "Impaired contractility"},
            "la_volume": {"change_percent": 50, "direction": "increase", "evidence": "Left atrial remodeling from elevated filling pressures"},
            "e_e_prime": {"change_percent": 80, "direction": "increase", "evidence": "Elevated filling pressures (>14 indicates elevated PCWP)"},
            "tapse": {"change_percent": 30, "direction": "decrease", "evidence": "RV dysfunction"},
            "pa_systolic": {"change_percent": 50, "direction": "increase", "evidence": "Pulmonary hypertension secondary to LV failure"}
        }
    },
    "lungs": {
        "imaging": {
            "pulmonary_edema": {"value": 1, "direction": "present", "evidence": "Bat-wing pattern on CXR, B-lines on lung US"},
            "kerley_b_lines": {"value": 1, "direction": "present", "evidence": "Interstitial edema"},
            "pleural_effusion": {"value": 1, "direction": "present", "evidence": "Transudative effusion, bilateral common"},
            "cardiomegaly": {"value": 1, "direction": "present", "evidence": "Cardiothoracic ratio >0.5"}
        },
        "physical_exam": {
            "crackles": {"value": 1, "direction": "present", "evidence": "Bilateral basilar crackles, may extend to apices"},
            "wheezes": {"value": 1, "direction": "present", "evidence": "Cardiac asthma from bronchial edema"},
            "decreased_breath_sounds": {"value": 1, "direction": "present", "evidence": "Pleural effusion"}
        }
    },
    "kidneys": {
        "lab_tests": {
            "creatinine": {"change_percent": 40, "direction": "increase", "evidence": "Type 1 cardiorenal syndrome"},
            "bun": {"change_percent": 50, "direction": "increase", "evidence": "Prerenal azotemia from hypoperfusion"},
            "egfr": {"change_percent": 35, "direction": "decrease", "evidence": "Acute kidney injury"},
            "urine_sodium": {"change_percent": 50, "direction": "decrease", "evidence": "Avid sodium retention (<20 mEq/L)"}
        }
    },
    "liver": {
        "lab_tests": {
            "ast": {"change_percent": 150, "direction": "increase", "evidence": "Congestive hepatopathy"},
            "alt": {"change_percent": 120, "direction": "increase", "evidence": "Hepatic congestion"},
            "bilirubin": {"change_percent": 80, "direction": "increase", "evidence": "Cholestasis from hepatic congestion"},
            "inr": {"change_percent": 30, "direction": "increase", "evidence": "Impaired hepatic synthetic function"}
        }
    },
    "blood": {
        "lab_tests": {
            "hemoglobin": {"change_percent": 12, "direction": "decrease", "evidence": "Hemodilution, anemia of chronic disease"},
            "hematocrit": {"change_percent": 10, "direction": "decrease", "evidence": "Hemodilution"},
            "crp": {"change_percent": 100, "direction": "increase", "evidence": "Inflammatory activation"}
        }
    },
    "cellular": {
        "dna": {
            "bnp_gene_expression": {"change_percent": 100, "direction": "increase", "evidence": "NPPB gene upregulation from myocyte stretch"},
            "raas_activation": {"change_percent": 100, "direction": "increase", "evidence": "Angiotensinogen, ACE, AT1R upregulation"},
            "beta_adrenergic_downregulation": {"change_percent": 50, "direction": "decrease", "evidence": "ADRB1 receptor downregulation"},
            "myosin_heavy_chain": {"change_percent": 100, "direction": "change", "evidence": "MYH7 to MYH6 isoform switch (fetal gene program)"},
            "collagen_expression": {"change_percent": 100, "direction": "increase", "evidence": "COL1A1, COL3A1 upregulation - fibrosis"},
            "titin_mutation": {"change_percent": 100, "direction": "present", "evidence": "TTN truncating variants in ~25% DCM"}
        },
        "gene_expression": {
            "anp_expression": {"change_percent": 100, "direction": "increase", "evidence": "NPPA gene activation"},
            "endothelin_expression": {"change_percent": 80, "direction": "increase", "evidence": "EDN1 upregulation - vasoconstriction"},
            "no_synthase": {"change_percent": 40, "direction": "decrease", "evidence": "Endothelial dysfunction"}
        }
    }
}


# Cardiovascular disease parameters (for other cardiac diseases)
CARDIOVASCULAR_PARAMS = {
    "heart": {
        "vital_signs": {
            "systolic_bp": {"change_percent": 15, "direction": "increase", "evidence": "Hypertensive response to cardiac stress"},
            "diastolic_bp": {"change_percent": 10, "direction": "increase", "evidence": "Increased vascular resistance"},
            "resting_hr": {"change_percent": 25, "direction": "increase", "evidence": "Compensatory tachycardia"},
            "respiratory_rate": {"change_percent": 20, "direction": "increase", "evidence": "Respiratory compensation"},
            "spo2": {"change_percent": 5, "direction": "decrease", "evidence": "Mild hypoxemia possible"}
        },
        "physical_exam": {
            "murmur": {"value": 1, "direction": "present", "evidence": "Cardiac murmur depending on lesion"},
            "s3_gallop": {"value": 1, "direction": "present", "evidence": "If heart failure present"},
            "jvp_elevation": {"value": 1, "direction": "present", "evidence": "Right heart involvement"},
            "peripheral_edema": {"value": 1, "direction": "present", "evidence": "If right heart failure present"}
        },
        "lab_tests": {
            "troponin_i": {"change_percent": 100, "direction": "increase", "evidence": "Myocardial stress/injury"},
            "bnp": {"change_percent": 200, "direction": "increase", "evidence": "Cardiac strain"},
            "crp": {"change_percent": 80, "direction": "increase", "evidence": "Inflammatory component"},
            "ldl": {"change_percent": 30, "direction": "increase", "evidence": "If atherosclerotic etiology"},
            "creatinine": {"change_percent": 15, "direction": "increase", "evidence": "Renal involvement"}
        },
        "ecg": {
            "pr_interval": {"change_percent": 10, "direction": "change", "evidence": "Conduction abnormality"},
            "qrs_duration": {"change_percent": 15, "direction": "increase", "evidence": "Ventricular conduction delay"},
            "qtc_interval": {"change_percent": 10, "direction": "increase", "evidence": "Repolarization changes"},
            "st_segment": {"value": "abnormal", "direction": "change", "evidence": "Ischemia/strain pattern"}
        },
        "imaging": {
            "lvef": {"change_percent": 20, "direction": "decrease", "evidence": "If systolic dysfunction"},
            "lv_wall_thickness": {"change_percent": 20, "direction": "increase", "evidence": "If hypertrophy present"},
            "la_volume": {"change_percent": 30, "direction": "increase", "evidence": "Atrial remodeling"}
        }
    },
    "blood": {
        "lab_tests": {
            "hemoglobin": {"change_percent": 8, "direction": "decrease", "evidence": "Possible anemia"},
            "d_dimer": {"change_percent": 50, "direction": "increase", "evidence": "Thrombotic risk"}
        }
    },
    "kidneys": {
        "lab_tests": {
            "creatinine": {"change_percent": 20, "direction": "increase", "evidence": "Possible cardiorenal involvement"},
            "egfr": {"change_percent": 15, "direction": "decrease", "evidence": "Reduced renal perfusion"}
        }
    },
    "cellular": {
        "dna": {
            "inflammatory_markers": {"change_percent": 100, "direction": "increase", "evidence": "Inflammatory gene activation"},
            "oxidative_stress": {"change_percent": 100, "direction": "increase", "evidence": "ROS pathway activation"}
        }
    }
}


async def migrate_cardiac_diseases():
    """Migrate frontend cardiac diseases to MongoDB with proper parameter_modifications."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    diseases_collection = db.diseases
    
    print(f"Connected to MongoDB: {DB_NAME}")
    
    # Get existing disease IDs and ICD codes
    existing = set()
    async for doc in diseases_collection.find({}, {'id': 1, 'icd10_code': 1}):
        existing.add(doc.get('id', ''))
        if doc.get('icd10_code'):
            existing.add(doc['icd10_code'].upper())
    
    print(f"Existing diseases: {len(existing)//2}")
    
    # Define the cardiac diseases to add
    cardiac_diseases = [
        {
            "id": "left_ventricular_failure_i50_1",
            "name": "Left Ventricular Failure (Acute Pulmonary Edema)",
            "icd10_code": "I50.1",
            "category": "heartFailure",
            "description": "Acute decompensation of left ventricular function leading to pulmonary congestion and edema",
            "affected_organs": ["heart", "lungs", "kidneys", "liver"],
            "primary_organ": "heart",
            "parameter_modifications": HEART_FAILURE_PARAMS
        },
        {
            "id": "combined_systolic_diastolic_hf_i50_4",
            "name": "Combined Systolic and Diastolic Heart Failure",
            "icd10_code": "I50.4",
            "category": "heartFailure",
            "description": "Heart failure with both impaired systolic contraction and diastolic relaxation",
            "affected_organs": ["heart", "lungs", "kidneys", "liver"],
            "primary_organ": "heart",
            "parameter_modifications": HEART_FAILURE_PARAMS
        },
        {
            "id": "heart_failure_unspecified_i50_9",
            "name": "Heart Failure, Unspecified",
            "icd10_code": "I50.9",
            "category": "heartFailure",
            "description": "Heart failure without further specification",
            "affected_organs": ["heart", "lungs", "kidneys"],
            "primary_organ": "heart",
            "parameter_modifications": HEART_FAILURE_PARAMS
        },
        {
            "id": "hfpef_i50_3",
            "name": "Heart Failure with Preserved Ejection Fraction (HFpEF)",
            "icd10_code": "I50.3",
            "category": "heartFailure",
            "description": "Heart failure with preserved ejection fraction (≥50%), diastolic dysfunction predominant",
            "affected_organs": ["heart", "lungs", "kidneys"],
            "primary_organ": "heart",
            "parameter_modifications": HEART_FAILURE_PARAMS
        },
        {
            "id": "acute_myocardial_infarction_i21",
            "name": "Acute Myocardial Infarction (STEMI)",
            "icd10_code": "I21",
            "category": "cardiovascular",
            "description": "ST-elevation myocardial infarction with complete coronary artery occlusion",
            "affected_organs": ["heart", "blood"],
            "primary_organ": "heart",
            "parameter_modifications": {
                "heart": {
                    "vital_signs": {
                        "systolic_bp": {"change_percent": 20, "direction": "change", "evidence": "May increase (stress) or decrease (cardiogenic shock)"},
                        "resting_hr": {"change_percent": 30, "direction": "increase", "evidence": "Compensatory tachycardia"},
                        "respiratory_rate": {"change_percent": 25, "direction": "increase", "evidence": "Pain, anxiety, LV dysfunction"}
                    },
                    "physical_exam": {
                        "s4_gallop": {"value": 1, "direction": "present", "evidence": "LV stiffness from ischemia"},
                        "new_murmur": {"value": 1, "direction": "present", "evidence": "Possible papillary muscle dysfunction/rupture"},
                        "diaphoresis": {"value": 1, "direction": "present", "evidence": "Autonomic response"}
                    },
                    "lab_tests": {
                        "troponin_i": {"change_percent": 5000, "direction": "increase", "evidence": "Highly elevated, peaks 12-24h"},
                        "troponin_t": {"change_percent": 5000, "direction": "increase", "evidence": "Highly elevated"},
                        "ck_mb": {"change_percent": 1000, "direction": "increase", "evidence": "Elevated, peaks 24h"},
                        "bnp": {"change_percent": 400, "direction": "increase", "evidence": "LV strain"}
                    },
                    "ecg": {
                        "st_elevation": {"value": 1, "direction": "present", "evidence": "≥1mm in 2 contiguous leads"},
                        "pathological_q_waves": {"value": 1, "direction": "present", "evidence": "Indicates transmural infarction"},
                        "reciprocal_changes": {"value": 1, "direction": "present", "evidence": "ST depression in opposite leads"}
                    },
                    "imaging": {
                        "lvef": {"change_percent": 30, "direction": "decrease", "evidence": "Regional wall motion abnormality"},
                        "rwma": {"value": 1, "direction": "present", "evidence": "Akinesis/hypokinesis in infarct zone"}
                    }
                },
                "blood": {
                    "lab_tests": {
                        "glucose": {"change_percent": 40, "direction": "increase", "evidence": "Stress hyperglycemia"},
                        "wbc": {"change_percent": 30, "direction": "increase", "evidence": "Inflammatory response"}
                    }
                },
                "cellular": {
                    "dna": {
                        "apoptosis_markers": {"change_percent": 100, "direction": "increase", "evidence": "BAX, caspase activation"},
                        "hif1a_expression": {"change_percent": 100, "direction": "increase", "evidence": "Hypoxia response"},
                        "nfkb_activation": {"change_percent": 100, "direction": "increase", "evidence": "Inflammatory cascade"}
                    }
                }
            }
        },
        {
            "id": "atrial_fibrillation_i48",
            "name": "Atrial Fibrillation",
            "icd10_code": "I48",
            "category": "cardiovascular",
            "description": "Irregular and often rapid heart rhythm originating from the atria",
            "affected_organs": ["heart", "blood", "brain"],
            "primary_organ": "heart",
            "parameter_modifications": {
                "heart": {
                    "vital_signs": {
                        "resting_hr": {"change_percent": 50, "direction": "increase", "evidence": "Rapid ventricular response (100-180 bpm)"},
                        "systolic_bp": {"change_percent": 15, "direction": "decrease", "evidence": "Loss of atrial kick reduces CO"},
                        "pulse_irregularity": {"value": 1, "direction": "present", "evidence": "Irregularly irregular pulse"}
                    },
                    "physical_exam": {
                        "irregular_pulse": {"value": 1, "direction": "present", "evidence": "Pathognomonic finding"},
                        "pulse_deficit": {"value": 1, "direction": "present", "evidence": "Difference between apical and radial pulse"},
                        "variable_s1": {"value": 1, "direction": "present", "evidence": "Variable AV valve position"}
                    },
                    "ecg": {
                        "p_waves": {"value": 0, "direction": "absent", "evidence": "Replaced by fibrillatory waves"},
                        "rr_interval": {"value": "irregular", "direction": "variable", "evidence": "Irregularly irregular"},
                        "fibrillatory_waves": {"value": 1, "direction": "present", "evidence": "Fine or coarse fibrillation"},
                        "ventricular_rate": {"change_percent": 50, "direction": "increase", "evidence": "Rapid if uncontrolled"}
                    },
                    "imaging": {
                        "la_volume": {"change_percent": 40, "direction": "increase", "evidence": "Atrial remodeling/dilation"},
                        "la_appendage_thrombus": {"value": 1, "direction": "possible", "evidence": "Stroke risk, seen on TEE"}
                    }
                },
                "blood": {
                    "lab_tests": {
                        "d_dimer": {"change_percent": 50, "direction": "increase", "evidence": "Thrombotic tendency"},
                        "bnp": {"change_percent": 100, "direction": "increase", "evidence": "Atrial stretch"}
                    }
                },
                "cellular": {
                    "dna": {
                        "scn5a_variants": {"change_percent": 100, "direction": "present", "evidence": "Sodium channel gene variants"},
                        "kcnq1_variants": {"change_percent": 100, "direction": "present", "evidence": "Potassium channel variants"},
                        "pitx2_expression": {"change_percent": 100, "direction": "decrease", "evidence": "Transcription factor downregulation"}
                    }
                }
            }
        },
        {
            "id": "aortic_stenosis_i35_0",
            "name": "Aortic Stenosis",
            "icd10_code": "I35.0",
            "category": "cardiovascular",
            "description": "Narrowing of the aortic valve causing LV outflow obstruction",
            "affected_organs": ["heart", "brain"],
            "primary_organ": "heart",
            "parameter_modifications": {
                "heart": {
                    "vital_signs": {
                        "systolic_bp": {"change_percent": 15, "direction": "decrease", "evidence": "Reduced stroke volume across stenotic valve"},
                        "pulse_pressure": {"change_percent": 30, "direction": "decrease", "evidence": "Parvus et tardus pulse"},
                        "resting_hr": {"change_percent": 10, "direction": "increase", "evidence": "Mild compensatory tachycardia"}
                    },
                    "physical_exam": {
                        "systolic_murmur": {"value": 1, "direction": "present", "evidence": "Crescendo-decrescendo at right 2nd ICS"},
                        "radiation_to_carotids": {"value": 1, "direction": "present", "evidence": "Characteristic radiation"},
                        "s4_gallop": {"value": 1, "direction": "present", "evidence": "LV hypertrophy, diastolic dysfunction"},
                        "parvus_et_tardus": {"value": 1, "direction": "present", "evidence": "Weak and delayed carotid upstroke"},
                        "soft_a2": {"value": 1, "direction": "present", "evidence": "Calcified, immobile valve"}
                    },
                    "ecg": {
                        "lv_hypertrophy": {"value": 1, "direction": "present", "evidence": "Voltage criteria, strain pattern"},
                        "st_depression": {"value": 1, "direction": "present", "evidence": "LV strain pattern"},
                        "t_wave_inversion": {"value": 1, "direction": "present", "evidence": "Lateral leads"}
                    },
                    "imaging": {
                        "aortic_valve_area": {"change_percent": 75, "direction": "decrease", "evidence": "<1.0 cm² severe, <0.6 cm² critical"},
                        "mean_gradient": {"change_percent": 200, "direction": "increase", "evidence": ">40 mmHg severe"},
                        "peak_velocity": {"change_percent": 150, "direction": "increase", "evidence": ">4 m/s severe"},
                        "lv_wall_thickness": {"change_percent": 40, "direction": "increase", "evidence": "Concentric LVH"},
                        "lvef": {"change_percent": 0, "direction": "preserved", "evidence": "Usually preserved until late"}
                    }
                },
                "cellular": {
                    "dna": {
                        "notch1_mutation": {"change_percent": 100, "direction": "present", "evidence": "Bicuspid aortic valve gene"},
                        "osteogenic_genes": {"change_percent": 100, "direction": "increase", "evidence": "RUNX2, BMP2 - valve calcification"},
                        "inflammatory_genes": {"change_percent": 100, "direction": "increase", "evidence": "IL-1β, TNF-α in valve"}
                    }
                }
            }
        }
    ]
    
    added = 0
    updated = 0
    skipped = 0
    
    for disease in cardiac_diseases:
        disease_id = disease['id']
        icd10 = disease['icd10_code'].upper()
        
        # Check if exists
        if disease_id in existing or icd10 in existing:
            # Update existing disease with comprehensive params
            result = await diseases_collection.update_one(
                {'$or': [{'id': disease_id}, {'icd10_code': icd10}]},
                {'$set': {
                    'parameter_modifications': disease['parameter_modifications'],
                    'comprehensive_data': True,
                    'enhanced_at': datetime.utcnow().isoformat()
                }}
            )
            if result.modified_count > 0:
                updated += 1
                print(f"  Updated: {disease['name']}")
            else:
                skipped += 1
        else:
            # Add new disease
            disease['created_at'] = datetime.utcnow().isoformat()
            disease['source'] = 'frontend_migration'
            disease['comprehensive_data'] = True
            await diseases_collection.insert_one(disease)
            added += 1
            print(f"  Added: {disease['name']}")
    
    print(f"\n=== Migration Complete ===")
    print(f"Added: {added}")
    print(f"Updated: {updated}")
    print(f"Skipped: {skipped}")
    
    # Now update ALL heart failure diseases in the database
    print("\n=== Updating all heart failure diseases ===")
    hf_updated = 0
    async for disease in diseases_collection.find({
        '$or': [
            {'category': {'$regex': 'heart', '$options': 'i'}},
            {'category': {'$regex': 'failure', '$options': 'i'}},
            {'name': {'$regex': 'heart failure', '$options': 'i'}},
            {'name': {'$regex': 'ventricular', '$options': 'i'}},
            {'icd10_code': {'$regex': '^I50', '$options': 'i'}}
        ]
    }):
        mods = disease.get('parameter_modifications', {})
        
        # Check if already has comprehensive heart data
        heart_mods = mods.get('heart', {})
        if len(heart_mods) >= 5:  # Already comprehensive
            continue
        
        # Merge with heart failure template
        new_mods = dict(mods) if mods else {}
        for organ, organ_params in HEART_FAILURE_PARAMS.items():
            if organ not in new_mods:
                new_mods[organ] = organ_params
            else:
                for scale, scale_params in organ_params.items():
                    if scale not in new_mods[organ] or len(new_mods[organ].get(scale, {})) < 3:
                        new_mods[organ][scale] = scale_params
        
        await diseases_collection.update_one(
            {'_id': disease['_id']},
            {'$set': {
                'parameter_modifications': new_mods,
                'comprehensive_data': True,
                'enhanced_at': datetime.utcnow().isoformat()
            }}
        )
        hf_updated += 1
        print(f"  Enhanced: {disease.get('name')}")
    
    print(f"Heart failure diseases enhanced: {hf_updated}")
    
    client.close()
    return added, updated, hf_updated


if __name__ == "__main__":
    asyncio.run(migrate_cardiac_diseases())
