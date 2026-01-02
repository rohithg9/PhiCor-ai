#!/usr/bin/env python3
"""
Comprehensive migration script to import ALL static frontend diseases into MongoDB.
This script:
1. Reads all disease JS files from the frontend
2. Parses disease definitions
3. Checks for existing diseases in MongoDB
4. Generates comprehensive parameter_modifications using AI
5. Inserts new diseases into MongoDB
"""

import asyncio
import os
import re
import json
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
FRONTEND_DATA_PATH = '/app/frontend/src/data'

# Import LLM for AI generation
try:
    from emergentintegrations.llm.chat import chat, LlmModel
    EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
    HAS_LLM = bool(EMERGENT_LLM_KEY)
except:
    HAS_LLM = False
    print("Warning: LLM not available, will use template fallback")


def parse_js_diseases(file_path):
    """Parse JavaScript disease files and extract disease definitions."""
    diseases = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to match disease objects in JS
        # Look for patterns like: name: "Disease Name", or name: 'Disease Name',
        disease_pattern = r"\{\s*(?:name|'name'|\"name\")\s*:\s*['\"]([^'\"]+)['\"]"
        icd_pattern = r"(?:icd10|icd10Code|icd10_code|'icd10'|\"icd10\")\s*:\s*['\"]([^'\"]+)['\"]"
        category_pattern = r"(?:category|'category'|\"category\")\s*:\s*['\"]([^'\"]+)['\"]"
        definition_pattern = r"(?:definition|description|'definition'|\"definition\")\s*:\s*['\"]([^'\"]+)['\"]"
        
        # Find all name matches
        names = re.findall(disease_pattern, content)
        
        for i, name in enumerate(names):
            # Try to find associated ICD-10 code and category nearby
            start_idx = content.find(name)
            search_area = content[max(0, start_idx-50):min(len(content), start_idx+500)]
            
            icd_match = re.search(icd_pattern, search_area)
            cat_match = re.search(category_pattern, search_area)
            def_match = re.search(definition_pattern, search_area)
            
            disease = {
                'name': name,
                'icd10_code': icd_match.group(1) if icd_match else '',
                'category': cat_match.group(1) if cat_match else infer_category_from_filename(file_path),
                'definition': def_match.group(1) if def_match else name,
                'source_file': os.path.basename(file_path)
            }
            
            if disease['name'] and len(disease['name']) > 2:  # Filter out noise
                diseases.append(disease)
        
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
    
    return diseases


def infer_category_from_filename(filename):
    """Infer disease category from the filename."""
    name = os.path.basename(filename).lower()
    
    if 'cardiac' in name or 'heart' in name:
        return 'cardiovascular'
    elif 'respiratory' in name or 'lung' in name or 'pulmonary' in name:
        return 'respiratory'
    elif 'renal' in name or 'kidney' in name:
        return 'renal'
    elif 'hepatic' in name or 'liver' in name:
        return 'gastrointestinal'
    elif 'neuro' in name or 'brain' in name:
        return 'neurological'
    elif 'hematol' in name or 'blood' in name:
        return 'hematological'
    elif 'metabolic' in name or 'diabetes' in name or 'endocrine' in name:
        return 'endocrine'
    elif 'oncology' in name or 'cancer' in name:
        return 'oncology'
    elif 'infectious' in name or 'infection' in name:
        return 'infectious'
    elif 'autoimmune' in name or 'rheumat' in name:
        return 'rheumatological'
    elif 'gi' in name or 'gastro' in name:
        return 'gastrointestinal'
    elif 'dermat' in name or 'skin' in name:
        return 'dermatological'
    elif 'psych' in name or 'mental' in name:
        return 'psychiatric'
    elif 'pediatric' in name or 'child' in name:
        return 'pediatric'
    elif 'obgyn' in name or 'obstetric' in name or 'gynec' in name:
        return 'obstetric_gynecologic'
    elif 'congenital' in name or 'genetic' in name:
        return 'genetic'
    else:
        return 'general'


def create_disease_id(name, icd10):
    """Create a unique disease ID."""
    base = name.lower().replace(' ', '_').replace('-', '_').replace("'", "")
    base = re.sub(r'[^a-z0-9_]', '', base)
    base = re.sub(r'_+', '_', base)
    return base[:50]  # Truncate if too long


# Comprehensive template for parameter modifications by category
CATEGORY_TEMPLATES = {
    "cardiovascular": {
        "heart": {
            "vital_signs": {
                "systolic_bp": {"change_percent": 15, "direction": "increase", "evidence": "Cardiovascular response", "value": 150, "normal_min": 90, "normal_max": 120, "unit": "mmHg"},
                "diastolic_bp": {"change_percent": 10, "direction": "increase", "evidence": "Vascular resistance", "value": 95, "normal_min": 60, "normal_max": 80, "unit": "mmHg"},
                "heart_rate": {"change_percent": 20, "direction": "increase", "evidence": "Compensatory tachycardia", "value": 96, "normal_min": 60, "normal_max": 100, "unit": "bpm"},
                "respiratory_rate": {"change_percent": 25, "direction": "increase", "evidence": "Increased metabolic demand", "value": 22, "normal_min": 12, "normal_max": 20, "unit": "breaths/min"}
            },
            "physical_exam": {
                "s3_gallop": {"value": 1, "direction": "present", "evidence": "Volume overload"},
                "jvp": {"change_percent": 50, "direction": "increase", "evidence": "Elevated right atrial pressure"},
                "peripheral_edema": {"value": 1, "direction": "present", "evidence": "Fluid retention"}
            },
            "lab_tests": {
                "troponin_i": {"change_percent": 100, "direction": "increase", "evidence": "Myocardial stress", "value": 0.08, "normal_max": 0.04, "unit": "ng/mL"},
                "bnp": {"change_percent": 300, "direction": "increase", "evidence": "Cardiac strain", "value": 400, "normal_max": 100, "unit": "pg/mL"},
                "crp": {"change_percent": 150, "direction": "increase", "evidence": "Inflammation", "value": 15, "normal_max": 3, "unit": "mg/L"}
            },
            "ecg": {
                "qtc_interval": {"change_percent": 10, "direction": "increase", "evidence": "Repolarization abnormality", "value": 480, "normal_max": 450, "unit": "ms"},
                "qrs_duration": {"change_percent": 15, "direction": "increase", "evidence": "Conduction delay", "value": 120, "normal_max": 100, "unit": "ms"}
            },
            "imaging": {
                "echo_lvef": {"change_percent": 30, "direction": "decrease", "evidence": "Systolic dysfunction", "value": 40, "normal_min": 55, "unit": "%"},
                "cxr_cardiomegaly": {"value": 1, "direction": "present", "evidence": "Cardiac enlargement"}
            }
        },
        "blood": {
            "lab_tests": {
                "hemoglobin": {"change_percent": 10, "direction": "decrease", "evidence": "Anemia of chronic disease"},
                "creatinine": {"change_percent": 25, "direction": "increase", "evidence": "Renal impairment"}
            }
        },
        "cellular": {
            "dna": {
                "raas_activation": {"change_percent": 100, "direction": "increase", "evidence": "Neurohormonal activation"},
                "bnp_expression": {"change_percent": 100, "direction": "increase", "evidence": "Cardiac stress response"}
            }
        }
    },
    "respiratory": {
        "lungs": {
            "vital_signs": {
                "respiratory_rate": {"change_percent": 40, "direction": "increase", "evidence": "Respiratory distress", "value": 28, "normal_min": 12, "normal_max": 20, "unit": "breaths/min"},
                "spo2": {"change_percent": 10, "direction": "decrease", "evidence": "Hypoxemia", "value": 90, "normal_min": 95, "unit": "%"}
            },
            "physical_exam": {
                "wheezing": {"value": 1, "direction": "present", "evidence": "Airway obstruction"},
                "crackles": {"value": 1, "direction": "present", "evidence": "Fluid/inflammation"},
                "accessory_muscle_use": {"value": 1, "direction": "present", "evidence": "Increased work of breathing"}
            },
            "lab_tests": {
                "pao2": {"change_percent": 20, "direction": "decrease", "evidence": "Hypoxemia"},
                "paco2": {"change_percent": 25, "direction": "increase", "evidence": "CO2 retention"},
                "ph": {"change_percent": 2, "direction": "decrease", "evidence": "Respiratory acidosis"}
            },
            "imaging": {
                "chest_xray": {"value": "abnormal", "direction": "change", "evidence": "Pulmonary pathology"},
                "fev1_fvc": {"change_percent": 20, "direction": "decrease", "evidence": "Obstructive pattern"}
            }
        },
        "heart": {
            "vital_signs": {
                "heart_rate": {"change_percent": 20, "direction": "increase", "evidence": "Compensatory response"}
            }
        },
        "cellular": {
            "dna": {
                "inflammatory_cytokines": {"change_percent": 100, "direction": "increase", "evidence": "Pulmonary inflammation"}
            }
        }
    },
    "endocrine": {
        "pancreas": {
            "lab_tests": {
                "fasting_glucose": {"change_percent": 80, "direction": "increase", "evidence": "Hyperglycemia", "value": 180, "normal_max": 100, "unit": "mg/dL"},
                "hba1c": {"change_percent": 50, "direction": "increase", "evidence": "Poor glycemic control", "value": 9.0, "normal_max": 5.7, "unit": "%"},
                "insulin": {"change_percent": 50, "direction": "variable", "evidence": "Insulin dysregulation"}
            }
        },
        "kidneys": {
            "lab_tests": {
                "microalbumin": {"change_percent": 200, "direction": "increase", "evidence": "Early nephropathy"},
                "creatinine": {"change_percent": 20, "direction": "increase", "evidence": "Renal involvement"}
            }
        },
        "blood": {
            "lab_tests": {
                "triglycerides": {"change_percent": 100, "direction": "increase", "evidence": "Dyslipidemia"},
                "ldl": {"change_percent": 50, "direction": "increase", "evidence": "Dyslipidemia"}
            }
        },
        "cellular": {
            "dna": {
                "insulin_receptor": {"change_percent": 50, "direction": "decrease", "evidence": "Insulin resistance"},
                "glut4_expression": {"change_percent": 40, "direction": "decrease", "evidence": "Impaired glucose uptake"}
            }
        }
    },
    "neurological": {
        "brain": {
            "vital_signs": {
                "blood_pressure": {"change_percent": 20, "direction": "variable", "evidence": "Neurological involvement"},
                "heart_rate": {"change_percent": 15, "direction": "variable", "evidence": "Autonomic effects"}
            },
            "physical_exam": {
                "gcs": {"value": 12, "direction": "decrease", "evidence": "Altered consciousness"},
                "pupil_response": {"value": "abnormal", "direction": "change", "evidence": "Neural dysfunction"},
                "motor_strength": {"change_percent": 30, "direction": "decrease", "evidence": "Motor impairment"}
            },
            "lab_tests": {
                "csf_protein": {"change_percent": 100, "direction": "increase", "evidence": "CNS inflammation"},
                "csf_glucose": {"change_percent": 30, "direction": "decrease", "evidence": "Infection/inflammation"}
            },
            "imaging": {
                "mri_brain": {"value": "abnormal", "direction": "change", "evidence": "Structural changes"},
                "ct_head": {"value": "abnormal", "direction": "change", "evidence": "Acute pathology"}
            }
        },
        "cellular": {
            "dna": {
                "neurotransmitter_levels": {"change_percent": 50, "direction": "variable", "evidence": "Neural dysfunction"},
                "inflammatory_markers": {"change_percent": 100, "direction": "increase", "evidence": "Neuroinflammation"}
            }
        }
    },
    "hematological": {
        "blood": {
            "lab_tests": {
                "hemoglobin": {"change_percent": 40, "direction": "decrease", "evidence": "Anemia", "value": 8.5, "normal_min": 12, "unit": "g/dL"},
                "hematocrit": {"change_percent": 35, "direction": "decrease", "evidence": "Reduced RBC mass"},
                "wbc": {"change_percent": 100, "direction": "variable", "evidence": "Leukocyte disorder"},
                "platelet_count": {"change_percent": 50, "direction": "variable", "evidence": "Platelet disorder"},
                "mcv": {"change_percent": 20, "direction": "variable", "evidence": "RBC morphology change"}
            },
            "physical_exam": {
                "pallor": {"value": 1, "direction": "present", "evidence": "Anemia"},
                "splenomegaly": {"value": 1, "direction": "present", "evidence": "Hematological pathology"},
                "lymphadenopathy": {"value": 1, "direction": "present", "evidence": "Lymphoid involvement"}
            }
        },
        "bone_marrow": {
            "lab_tests": {
                "reticulocyte_count": {"change_percent": 50, "direction": "variable", "evidence": "Marrow response"},
                "iron_studies": {"change_percent": 40, "direction": "variable", "evidence": "Iron metabolism"}
            }
        },
        "cellular": {
            "dna": {
                "hemoglobin_genes": {"change_percent": 100, "direction": "variable", "evidence": "Genetic involvement"},
                "coagulation_factors": {"change_percent": 50, "direction": "variable", "evidence": "Coagulation pathway"}
            }
        }
    },
    "gastrointestinal": {
        "liver": {
            "lab_tests": {
                "alt": {"change_percent": 200, "direction": "increase", "evidence": "Hepatocyte injury", "value": 120, "normal_max": 40, "unit": "U/L"},
                "ast": {"change_percent": 180, "direction": "increase", "evidence": "Hepatocyte injury", "value": 95, "normal_max": 35, "unit": "U/L"},
                "bilirubin": {"change_percent": 150, "direction": "increase", "evidence": "Biliary dysfunction"},
                "albumin": {"change_percent": 30, "direction": "decrease", "evidence": "Synthetic dysfunction"},
                "inr": {"change_percent": 30, "direction": "increase", "evidence": "Coagulopathy"}
            },
            "physical_exam": {
                "hepatomegaly": {"value": 1, "direction": "present", "evidence": "Liver enlargement"},
                "jaundice": {"value": 1, "direction": "present", "evidence": "Hyperbilirubinemia"},
                "ascites": {"value": 1, "direction": "present", "evidence": "Portal hypertension"}
            },
            "imaging": {
                "ultrasound_liver": {"value": "abnormal", "direction": "change", "evidence": "Structural changes"}
            }
        },
        "gi_tract": {
            "lab_tests": {
                "lipase": {"change_percent": 300, "direction": "increase", "evidence": "Pancreatic involvement"},
                "amylase": {"change_percent": 200, "direction": "increase", "evidence": "Pancreatic/GI pathology"}
            }
        },
        "cellular": {
            "dna": {
                "inflammatory_cytokines": {"change_percent": 100, "direction": "increase", "evidence": "GI inflammation"}
            }
        }
    },
    "renal": {
        "kidneys": {
            "lab_tests": {
                "creatinine": {"change_percent": 100, "direction": "increase", "evidence": "Renal dysfunction", "value": 2.5, "normal_max": 1.2, "unit": "mg/dL"},
                "bun": {"change_percent": 120, "direction": "increase", "evidence": "Azotemia", "value": 45, "normal_max": 20, "unit": "mg/dL"},
                "egfr": {"change_percent": 50, "direction": "decrease", "evidence": "Reduced filtration"},
                "potassium": {"change_percent": 30, "direction": "increase", "evidence": "Hyperkalemia"},
                "phosphorus": {"change_percent": 40, "direction": "increase", "evidence": "Hyperphosphatemia"}
            },
            "urinalysis": {
                "proteinuria": {"change_percent": 200, "direction": "increase", "evidence": "Glomerular damage"},
                "hematuria": {"value": 1, "direction": "present", "evidence": "Renal pathology"}
            },
            "imaging": {
                "renal_ultrasound": {"value": "abnormal", "direction": "change", "evidence": "Structural changes"}
            }
        },
        "heart": {
            "vital_signs": {
                "blood_pressure": {"change_percent": 25, "direction": "increase", "evidence": "Volume overload/RAAS"}
            }
        },
        "blood": {
            "lab_tests": {
                "hemoglobin": {"change_percent": 20, "direction": "decrease", "evidence": "Renal anemia"},
                "bicarbonate": {"change_percent": 25, "direction": "decrease", "evidence": "Metabolic acidosis"}
            }
        },
        "cellular": {
            "dna": {
                "epo_production": {"change_percent": 50, "direction": "decrease", "evidence": "Reduced erythropoietin"}
            }
        }
    },
    "oncology": {
        "tumor_site": {
            "lab_tests": {
                "tumor_markers": {"change_percent": 200, "direction": "increase", "evidence": "Tumor activity"},
                "ldh": {"change_percent": 100, "direction": "increase", "evidence": "Cell turnover"},
                "alkaline_phosphatase": {"change_percent": 80, "direction": "increase", "evidence": "Bone/liver involvement"}
            },
            "imaging": {
                "ct_scan": {"value": "abnormal", "direction": "change", "evidence": "Mass lesion"},
                "pet_scan": {"value": "abnormal", "direction": "change", "evidence": "Metabolic activity"}
            }
        },
        "blood": {
            "lab_tests": {
                "hemoglobin": {"change_percent": 25, "direction": "decrease", "evidence": "Anemia of malignancy"},
                "wbc": {"change_percent": 50, "direction": "variable", "evidence": "Bone marrow involvement"},
                "albumin": {"change_percent": 20, "direction": "decrease", "evidence": "Cachexia"}
            }
        },
        "cellular": {
            "dna": {
                "oncogene_activation": {"change_percent": 100, "direction": "increase", "evidence": "Oncogenic mutation"},
                "tumor_suppressor": {"change_percent": 100, "direction": "decrease", "evidence": "Loss of tumor suppression"},
                "proliferation_markers": {"change_percent": 200, "direction": "increase", "evidence": "High proliferation"}
            }
        }
    },
    "infectious": {
        "immune_system": {
            "vital_signs": {
                "temperature": {"change_percent": 15, "direction": "increase", "evidence": "Fever", "value": 39.0, "normal_max": 37.5, "unit": "°C"},
                "heart_rate": {"change_percent": 30, "direction": "increase", "evidence": "Sepsis response"},
                "respiratory_rate": {"change_percent": 25, "direction": "increase", "evidence": "Metabolic demand"}
            },
            "lab_tests": {
                "wbc": {"change_percent": 100, "direction": "increase", "evidence": "Leukocytosis", "value": 18000, "normal_max": 11000, "unit": "/μL"},
                "crp": {"change_percent": 500, "direction": "increase", "evidence": "Acute phase response"},
                "procalcitonin": {"change_percent": 1000, "direction": "increase", "evidence": "Bacterial infection"}
            }
        },
        "blood": {
            "lab_tests": {
                "lactate": {"change_percent": 100, "direction": "increase", "evidence": "Tissue hypoperfusion"},
                "platelets": {"change_percent": 40, "direction": "decrease", "evidence": "Consumptive process"}
            }
        },
        "cellular": {
            "dna": {
                "inflammatory_cytokines": {"change_percent": 500, "direction": "increase", "evidence": "Immune response"},
                "pathogen_dna": {"change_percent": 100, "direction": "increase", "evidence": "Infectious agent"}
            }
        }
    },
    "rheumatological": {
        "joints": {
            "physical_exam": {
                "joint_swelling": {"value": 1, "direction": "present", "evidence": "Synovitis"},
                "joint_tenderness": {"value": 1, "direction": "present", "evidence": "Inflammation"},
                "morning_stiffness": {"change_percent": 100, "direction": "increase", "evidence": "Inflammatory arthritis"}
            },
            "lab_tests": {
                "esr": {"change_percent": 200, "direction": "increase", "evidence": "Inflammation"},
                "crp": {"change_percent": 300, "direction": "increase", "evidence": "Acute phase response"},
                "rf": {"change_percent": 100, "direction": "increase", "evidence": "Autoimmunity"},
                "anti_ccp": {"change_percent": 100, "direction": "increase", "evidence": "RA specific"}
            },
            "imaging": {
                "joint_xray": {"value": "abnormal", "direction": "change", "evidence": "Joint destruction"}
            }
        },
        "cellular": {
            "dna": {
                "hla_associations": {"change_percent": 100, "direction": "variable", "evidence": "Genetic susceptibility"},
                "autoantibodies": {"change_percent": 100, "direction": "increase", "evidence": "Autoimmune process"}
            }
        }
    },
    "general": {
        "systemic": {
            "vital_signs": {
                "temperature": {"change_percent": 5, "direction": "variable", "evidence": "Systemic response"},
                "heart_rate": {"change_percent": 15, "direction": "increase", "evidence": "Metabolic demand"},
                "blood_pressure": {"change_percent": 10, "direction": "variable", "evidence": "Hemodynamic response"}
            },
            "lab_tests": {
                "crp": {"change_percent": 100, "direction": "increase", "evidence": "Inflammation"},
                "albumin": {"change_percent": 15, "direction": "decrease", "evidence": "Chronic illness"}
            }
        },
        "cellular": {
            "dna": {
                "stress_response": {"change_percent": 50, "direction": "increase", "evidence": "Cellular stress"}
            }
        }
    }
}


def get_template_for_category(category):
    """Get the appropriate template based on disease category."""
    category_lower = category.lower() if category else 'general'
    
    # Map various category names to our templates
    category_map = {
        'cardiovascular': 'cardiovascular',
        'cardiac': 'cardiovascular',
        'heart': 'cardiovascular',
        'respiratory': 'respiratory',
        'pulmonary': 'respiratory',
        'lung': 'respiratory',
        'endocrine': 'endocrine',
        'metabolic': 'endocrine',
        'diabetes': 'endocrine',
        'neurological': 'neurological',
        'neuro': 'neurological',
        'brain': 'neurological',
        'hematological': 'hematological',
        'blood': 'hematological',
        'gastrointestinal': 'gastrointestinal',
        'gi': 'gastrointestinal',
        'hepatic': 'gastrointestinal',
        'liver': 'gastrointestinal',
        'renal': 'renal',
        'kidney': 'renal',
        'nephrology': 'renal',
        'oncology': 'oncology',
        'cancer': 'oncology',
        'infectious': 'infectious',
        'infection': 'infectious',
        'rheumatological': 'rheumatological',
        'autoimmune': 'rheumatological',
        'dermatological': 'general',
        'psychiatric': 'neurological',
        'pediatric': 'general',
        'obstetric': 'general',
        'genetic': 'hematological',
        'congenital': 'hematological'
    }
    
    template_key = category_map.get(category_lower, 'general')
    return CATEGORY_TEMPLATES.get(template_key, CATEGORY_TEMPLATES['general'])


async def generate_ai_params(disease_name, icd10, category, affected_organs=None):
    """Generate parameter modifications using AI (if available) or template fallback."""
    if not HAS_LLM:
        # Use template fallback
        return get_template_for_category(category)
    
    prompt = f"""Generate comprehensive clinical parameter modifications for:
Disease: {disease_name}
ICD-10: {icd10 or 'Unknown'}
Category: {category}
Affected Organs: {', '.join(affected_organs) if affected_organs else 'Based on disease'}

Return ONLY a valid JSON object with parameter_modifications for each affected organ system.
Include vital_signs, physical_exam, lab_tests, imaging, and cellular/dna sections as appropriate.
Each parameter should have: change_percent, direction (increase/decrease/variable), evidence, and optionally value, normal_min, normal_max, unit.

Example format:
{{"heart": {{"vital_signs": {{"systolic_bp": {{"change_percent": 20, "direction": "increase", "evidence": "Hypertension"}}}}}}}}

Generate medically accurate data for {disease_name}:"""
    
    try:
        response = await chat(
            api_key=EMERGENT_LLM_KEY,
            model=LlmModel.GPT4O,
            user_message=prompt,
            system_prompt="You are a medical expert. Generate accurate clinical parameter modifications in valid JSON only. No markdown, no explanations."
        )
        
        content = response.strip()
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]
        content = content.strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"  AI generation failed for {disease_name}: {e}")
        return get_template_for_category(category)


async def migrate_diseases():
    """Main migration function."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Get existing disease names/ICD codes from DB
    existing = await db.diseases.find({}, {'name': 1, 'icd10_code': 1}).to_list(None)
    existing_names = {d['name'].lower() for d in existing}
    existing_icds = {d.get('icd10_code', '') for d in existing if d.get('icd10_code')}
    
    print(f"Existing diseases in DB: {len(existing)}")
    
    # Parse all static disease files
    all_static_diseases = []
    disease_files = [
        f for f in os.listdir(FRONTEND_DATA_PATH) 
        if f.endswith('.js') and ('Disease' in f or 'disease' in f) and 'Index' not in f
    ]
    
    print(f"\nParsing {len(disease_files)} disease files...")
    
    for filename in sorted(disease_files):
        filepath = os.path.join(FRONTEND_DATA_PATH, filename)
        diseases = parse_js_diseases(filepath)
        print(f"  {filename}: found {len(diseases)} diseases")
        all_static_diseases.extend(diseases)
    
    print(f"\nTotal static diseases parsed: {len(all_static_diseases)}")
    
    # Filter out diseases that already exist
    new_diseases = []
    for disease in all_static_diseases:
        name_lower = disease['name'].lower()
        icd = disease.get('icd10_code', '')
        
        # Skip if name or ICD already exists
        if name_lower in existing_names:
            continue
        if icd and icd in existing_icds:
            continue
        
        new_diseases.append(disease)
    
    # Remove duplicates by name
    seen_names = set()
    unique_new = []
    for d in new_diseases:
        if d['name'].lower() not in seen_names:
            seen_names.add(d['name'].lower())
            unique_new.append(d)
    
    print(f"New unique diseases to migrate: {len(unique_new)}")
    
    # Migrate in batches
    batch_size = 10
    migrated = 0
    failed = 0
    
    for i in range(0, len(unique_new), batch_size):
        batch = unique_new[i:i+batch_size]
        print(f"\nProcessing batch {i//batch_size + 1}/{(len(unique_new) + batch_size - 1)//batch_size}...")
        
        for disease in batch:
            try:
                disease_id = create_disease_id(disease['name'], disease.get('icd10_code', ''))
                
                # Generate parameter_modifications
                params = await generate_ai_params(
                    disease['name'],
                    disease.get('icd10_code', ''),
                    disease.get('category', 'general')
                )
                
                # Prepare document
                doc = {
                    'id': disease_id,
                    'name': disease['name'],
                    'icd10_code': disease.get('icd10_code', ''),
                    'category': disease.get('category', 'general'),
                    'description': disease.get('definition', disease['name']),
                    'definition': disease.get('definition', disease['name']),
                    'parameter_modifications': params,
                    'source': 'static_migration',
                    'source_file': disease.get('source_file', ''),
                    'created_at': datetime.now(timezone.utc).isoformat(),
                    'clinical_data_filled': True
                }
                
                # Insert into DB
                await db.diseases.insert_one(doc)
                migrated += 1
                print(f"  ✓ Migrated: {disease['name']}")
                
            except Exception as e:
                failed += 1
                print(f"  ✗ Failed: {disease['name']} - {e}")
        
        # Small delay between batches to avoid rate limiting
        await asyncio.sleep(0.5)
    
    print(f"\n=== Migration Complete ===")
    print(f"Migrated: {migrated}")
    print(f"Failed: {failed}")
    
    # Final count
    total = await db.diseases.count_documents({})
    print(f"Total diseases in DB now: {total}")
    
    client.close()
    return migrated, failed


if __name__ == "__main__":
    asyncio.run(migrate_diseases())
