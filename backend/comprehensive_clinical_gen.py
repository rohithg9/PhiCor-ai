#!/usr/bin/env python3
"""
Comprehensive Clinical Data Model Generator

Expands parameter_modifications to include ALL clinical data points needed for
differential diagnosis and risk prediction:

1. VITAL SIGNS - BP, HR, RR, Temp, SpO2, Weight, BMI
2. ECG PARAMETERS - PR interval, QRS duration, QT/QTc, axis, rhythm, ST changes
3. PHYSICAL EXAMINATION - By system (cardiac, respiratory, neuro, abdominal, etc.)
4. LABORATORY TESTS - Complete panels (CBC, BMP, LFT, Coagulation, Cardiac, Thyroid)
5. IMAGING FINDINGS - Chest X-ray, CT, MRI, Ultrasound, Echo
6. RISK FACTORS - Smoking, alcohol, family history, past medical history
7. MEDICATIONS - Current medications that affect disease presentation
8. FUNCTIONAL SCORES - NYHA, APACHE II, Glasgow Coma Scale, etc.

Each parameter includes:
- Normal range/baseline
- Disease-specific deviation (value and direction)
- Clinical significance
- Probability weight for differential diagnosis
"""

import asyncio
import os
import sys
import json
import re
import logging
from typing import Dict, Any, Optional, List

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from motor.motor_asyncio import AsyncIOMotorClient

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/comprehensive_clinical_gen.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False


COMPREHENSIVE_PROMPT = """You are a clinical medicine expert and medical informaticist. Generate COMPREHENSIVE clinical parameters for differential diagnosis for: {disease_name}

This must include ALL data points that would be found in a complete EMR workup and would be useful for making a diagnosis. Think like a clinician doing a complete H&P.

Return ONLY a valid JSON object with this structure:

{{
    "heart": {{
        "vital_signs": {{
            "systolic_bp": {{ "value": 130, "normal_min": 90, "normal_max": 120, "unit": "mmHg", "change_direction": "increase", "change_percent": 10, "clinical_significance": "mild hypertension", "diagnostic_weight": 0.3 }},
            "diastolic_bp": {{ "value": 85, "normal_min": 60, "normal_max": 80, "unit": "mmHg", "change_direction": "increase", "change_percent": 7, "diagnostic_weight": 0.3 }},
            "heart_rate": {{ "value": 88, "normal_min": 60, "normal_max": 100, "unit": "bpm", "change_direction": "normal", "diagnostic_weight": 0.2 }},
            "respiratory_rate": {{ "value": 18, "normal_min": 12, "normal_max": 20, "unit": "/min", "diagnostic_weight": 0.2 }},
            "temperature": {{ "value": 37.2, "normal_min": 36.5, "normal_max": 37.5, "unit": "°C", "diagnostic_weight": 0.1 }},
            "spo2": {{ "value": 96, "normal_min": 95, "normal_max": 100, "unit": "%", "diagnostic_weight": 0.4 }},
            "weight": {{ "value": 75, "unit": "kg" }},
            "bmi": {{ "value": 26, "normal_min": 18.5, "normal_max": 25, "unit": "kg/m²", "change_direction": "increase", "diagnostic_weight": 0.2 }}
        }},
        "ecg": {{
            "rhythm": {{ "finding": "Normal sinus rhythm", "abnormal": false, "diagnostic_weight": 0.5 }},
            "rate": {{ "value": 75, "normal_min": 60, "normal_max": 100, "unit": "bpm", "abnormal": false }},
            "pr_interval": {{ "value": 160, "normal_min": 120, "normal_max": 200, "unit": "ms", "abnormal": false, "diagnostic_weight": 0.3 }},
            "qrs_duration": {{ "value": 90, "normal_min": 80, "normal_max": 120, "unit": "ms", "abnormal": false, "diagnostic_weight": 0.3 }},
            "qt_interval": {{ "value": 400, "unit": "ms", "abnormal": false }},
            "qtc_interval": {{ "value": 420, "normal_max": 450, "unit": "ms", "abnormal": false, "diagnostic_weight": 0.4 }},
            "axis": {{ "value": 60, "normal_min": -30, "normal_max": 90, "unit": "degrees", "abnormal": false }},
            "st_changes": {{ "finding": "No ST elevation or depression", "abnormal": false, "diagnostic_weight": 0.8 }},
            "t_wave": {{ "finding": "Normal T waves", "abnormal": false, "diagnostic_weight": 0.5 }},
            "q_waves": {{ "finding": "No pathological Q waves", "abnormal": false, "diagnostic_weight": 0.6 }},
            "lvh_criteria": {{ "finding": "No LVH by voltage criteria", "abnormal": false, "diagnostic_weight": 0.4 }},
            "bundle_branch_block": {{ "finding": "None", "abnormal": false, "diagnostic_weight": 0.3 }}
        }},
        "physical_exam": {{
            "general_appearance": {{ "finding": "Alert, comfortable", "abnormal": false }},
            "jvp": {{ "value": 7, "normal_max": 8, "unit": "cmH2O", "abnormal": false, "diagnostic_weight": 0.6 }},
            "carotid_pulse": {{ "finding": "Normal upstroke, no bruits", "abnormal": false }},
            "pmi": {{ "finding": "Normal location and character", "abnormal": false }},
            "heart_sounds": {{ "finding": "S1 S2 normal, no murmurs/gallops/rubs", "abnormal": false, "diagnostic_weight": 0.7 }},
            "s3_gallop": {{ "present": false, "diagnostic_weight": 0.8 }},
            "s4_gallop": {{ "present": false, "diagnostic_weight": 0.5 }},
            "murmur": {{ "present": false, "grade": 0, "location": "", "timing": "", "diagnostic_weight": 0.7 }},
            "peripheral_edema": {{ "value": 0, "scale_max": 4, "location": "", "abnormal": false, "diagnostic_weight": 0.6 }},
            "lung_sounds": {{ "finding": "Clear to auscultation bilaterally", "abnormal": false, "diagnostic_weight": 0.5 }},
            "hepatomegaly": {{ "present": false, "diagnostic_weight": 0.4 }},
            "ascites": {{ "present": false, "diagnostic_weight": 0.5 }}
        }},
        "lab_tests": {{
            "troponin_i": {{ "value": 0.02, "normal_max": 0.04, "unit": "ng/mL", "abnormal": false, "diagnostic_weight": 0.9 }},
            "troponin_t": {{ "value": 0.01, "normal_max": 0.01, "unit": "ng/mL", "abnormal": false, "diagnostic_weight": 0.9 }},
            "bnp": {{ "value": 50, "normal_max": 100, "unit": "pg/mL", "abnormal": false, "diagnostic_weight": 0.8 }},
            "nt_probnp": {{ "value": 125, "normal_max": 300, "unit": "pg/mL", "abnormal": false, "diagnostic_weight": 0.8 }},
            "crp": {{ "value": 3, "normal_max": 5, "unit": "mg/L", "abnormal": false, "diagnostic_weight": 0.4 }},
            "esr": {{ "value": 12, "normal_max": 20, "unit": "mm/hr", "abnormal": false }},
            "d_dimer": {{ "value": 0.3, "normal_max": 0.5, "unit": "µg/mL", "abnormal": false, "diagnostic_weight": 0.6 }},
            "ldh": {{ "value": 180, "normal_min": 140, "normal_max": 280, "unit": "U/L", "abnormal": false }},
            "ck_mb": {{ "value": 3, "normal_max": 5, "unit": "ng/mL", "abnormal": false, "diagnostic_weight": 0.7 }}
        }},
        "imaging": {{
            "chest_xray": {{ "finding": "Normal cardiac silhouette, clear lung fields", "abnormal": false, "diagnostic_weight": 0.5 }},
            "ctr": {{ "value": 0.45, "normal_max": 0.5, "abnormal": false, "diagnostic_weight": 0.4 }},
            "echo_lvef": {{ "value": 60, "normal_min": 55, "normal_max": 70, "unit": "%", "abnormal": false, "diagnostic_weight": 0.8 }},
            "echo_lv_size": {{ "value": 50, "normal_max": 58, "unit": "mm", "abnormal": false }},
            "echo_la_size": {{ "value": 38, "normal_max": 40, "unit": "mm", "abnormal": false }},
            "echo_wall_motion": {{ "finding": "Normal", "abnormal": false, "diagnostic_weight": 0.7 }},
            "echo_valves": {{ "finding": "No significant valvular abnormalities", "abnormal": false }}
        }}
    }},
    "blood": {{
        "cbc": {{
            "wbc": {{ "value": 7500, "normal_min": 4500, "normal_max": 11000, "unit": "/µL", "abnormal": false, "diagnostic_weight": 0.4 }},
            "hemoglobin": {{ "value": 14, "normal_min": 12, "normal_max": 16, "unit": "g/dL", "abnormal": false, "diagnostic_weight": 0.5 }},
            "hematocrit": {{ "value": 42, "normal_min": 36, "normal_max": 48, "unit": "%", "abnormal": false }},
            "platelets": {{ "value": 250, "normal_min": 150, "normal_max": 400, "unit": "×10³/µL", "abnormal": false, "diagnostic_weight": 0.3 }},
            "mcv": {{ "value": 88, "normal_min": 80, "normal_max": 100, "unit": "fL", "abnormal": false }},
            "rdw": {{ "value": 13, "normal_max": 15, "unit": "%", "abnormal": false }},
            "neutrophils": {{ "value": 60, "normal_min": 40, "normal_max": 70, "unit": "%", "abnormal": false }},
            "lymphocytes": {{ "value": 30, "normal_min": 20, "normal_max": 40, "unit": "%", "abnormal": false }},
            "monocytes": {{ "value": 6, "normal_min": 2, "normal_max": 8, "unit": "%", "abnormal": false }},
            "eosinophils": {{ "value": 3, "normal_max": 6, "unit": "%", "abnormal": false }},
            "basophils": {{ "value": 1, "normal_max": 2, "unit": "%", "abnormal": false }}
        }},
        "coagulation": {{
            "pt": {{ "value": 12, "normal_min": 11, "normal_max": 13.5, "unit": "seconds", "abnormal": false }},
            "inr": {{ "value": 1.0, "normal_min": 0.9, "normal_max": 1.1, "abnormal": false, "diagnostic_weight": 0.4 }},
            "ptt": {{ "value": 30, "normal_min": 25, "normal_max": 35, "unit": "seconds", "abnormal": false }},
            "fibrinogen": {{ "value": 300, "normal_min": 200, "normal_max": 400, "unit": "mg/dL", "abnormal": false }}
        }}
    }},
    "kidneys": {{
        "renal_function": {{
            "creatinine": {{ "value": 1.0, "normal_min": 0.7, "normal_max": 1.3, "unit": "mg/dL", "abnormal": false, "diagnostic_weight": 0.6 }},
            "bun": {{ "value": 15, "normal_min": 7, "normal_max": 20, "unit": "mg/dL", "abnormal": false, "diagnostic_weight": 0.4 }},
            "egfr": {{ "value": 90, "normal_min": 90, "unit": "mL/min/1.73m²", "abnormal": false, "diagnostic_weight": 0.6 }},
            "bun_creatinine_ratio": {{ "value": 15, "normal_min": 10, "normal_max": 20, "abnormal": false }}
        }},
        "electrolytes": {{
            "sodium": {{ "value": 140, "normal_min": 136, "normal_max": 145, "unit": "mEq/L", "abnormal": false, "diagnostic_weight": 0.5 }},
            "potassium": {{ "value": 4.2, "normal_min": 3.5, "normal_max": 5.0, "unit": "mEq/L", "abnormal": false, "diagnostic_weight": 0.6 }},
            "chloride": {{ "value": 102, "normal_min": 98, "normal_max": 106, "unit": "mEq/L", "abnormal": false }},
            "bicarbonate": {{ "value": 24, "normal_min": 22, "normal_max": 28, "unit": "mEq/L", "abnormal": false, "diagnostic_weight": 0.4 }},
            "calcium": {{ "value": 9.5, "normal_min": 8.5, "normal_max": 10.5, "unit": "mg/dL", "abnormal": false }},
            "magnesium": {{ "value": 2.0, "normal_min": 1.7, "normal_max": 2.2, "unit": "mg/dL", "abnormal": false }},
            "phosphorus": {{ "value": 3.5, "normal_min": 2.5, "normal_max": 4.5, "unit": "mg/dL", "abnormal": false }}
        }},
        "urinalysis": {{
            "specific_gravity": {{ "value": 1.020, "normal_min": 1.005, "normal_max": 1.030 }},
            "ph": {{ "value": 6.0, "normal_min": 5.0, "normal_max": 8.0 }},
            "protein": {{ "finding": "Negative", "abnormal": false, "diagnostic_weight": 0.5 }},
            "glucose": {{ "finding": "Negative", "abnormal": false }},
            "blood": {{ "finding": "Negative", "abnormal": false, "diagnostic_weight": 0.4 }},
            "wbc": {{ "finding": "0-2/hpf", "abnormal": false }},
            "rbc": {{ "finding": "0-2/hpf", "abnormal": false }}
        }}
    }},
    "liver": {{
        "lft": {{
            "ast": {{ "value": 25, "normal_min": 10, "normal_max": 40, "unit": "U/L", "abnormal": false, "diagnostic_weight": 0.4 }},
            "alt": {{ "value": 30, "normal_min": 7, "normal_max": 56, "unit": "U/L", "abnormal": false, "diagnostic_weight": 0.4 }},
            "alp": {{ "value": 70, "normal_min": 44, "normal_max": 147, "unit": "U/L", "abnormal": false }},
            "ggt": {{ "value": 30, "normal_min": 9, "normal_max": 48, "unit": "U/L", "abnormal": false }},
            "total_bilirubin": {{ "value": 0.8, "normal_max": 1.2, "unit": "mg/dL", "abnormal": false, "diagnostic_weight": 0.3 }},
            "direct_bilirubin": {{ "value": 0.2, "normal_max": 0.3, "unit": "mg/dL", "abnormal": false }},
            "albumin": {{ "value": 4.0, "normal_min": 3.5, "normal_max": 5.0, "unit": "g/dL", "abnormal": false, "diagnostic_weight": 0.4 }},
            "total_protein": {{ "value": 7.0, "normal_min": 6.0, "normal_max": 8.0, "unit": "g/dL", "abnormal": false }}
        }}
    }},
    "pancreas": {{
        "metabolic": {{
            "glucose_fasting": {{ "value": 95, "normal_min": 70, "normal_max": 100, "unit": "mg/dL", "abnormal": false, "diagnostic_weight": 0.5 }},
            "glucose_random": {{ "value": 120, "normal_max": 140, "unit": "mg/dL", "abnormal": false }},
            "hba1c": {{ "value": 5.4, "normal_max": 5.7, "unit": "%", "abnormal": false, "diagnostic_weight": 0.6 }},
            "lipase": {{ "value": 40, "normal_min": 10, "normal_max": 140, "unit": "U/L", "abnormal": false, "diagnostic_weight": 0.7 }},
            "amylase": {{ "value": 70, "normal_min": 25, "normal_max": 125, "unit": "U/L", "abnormal": false, "diagnostic_weight": 0.6 }}
        }},
        "lipid_panel": {{
            "total_cholesterol": {{ "value": 190, "normal_max": 200, "unit": "mg/dL", "abnormal": false }},
            "ldl": {{ "value": 110, "normal_max": 100, "unit": "mg/dL", "abnormal": true, "change_direction": "increase", "diagnostic_weight": 0.4 }},
            "hdl": {{ "value": 50, "normal_min": 40, "unit": "mg/dL", "abnormal": false }},
            "triglycerides": {{ "value": 140, "normal_max": 150, "unit": "mg/dL", "abnormal": false, "diagnostic_weight": 0.3 }},
            "vldl": {{ "value": 28, "normal_max": 30, "unit": "mg/dL", "abnormal": false }}
        }}
    }},
    "risk_factors": {{
        "smoking": {{
            "status": "former_smoker",
            "pack_years": 10,
            "quit_years_ago": 5,
            "risk_multiplier": 1.5,
            "diagnostic_weight": 0.6
        }},
        "alcohol": {{
            "status": "social_drinker",
            "drinks_per_week": 4,
            "risk_multiplier": 1.1,
            "diagnostic_weight": 0.3
        }},
        "family_history": {{
            "cad": {{ "present": true, "first_degree": true, "age_onset": 55, "risk_multiplier": 2.0, "diagnostic_weight": 0.7 }},
            "stroke": {{ "present": false, "risk_multiplier": 1.0 }},
            "diabetes": {{ "present": true, "first_degree": true, "risk_multiplier": 1.5, "diagnostic_weight": 0.5 }},
            "cancer": {{ "present": false, "type": "", "risk_multiplier": 1.0 }},
            "hypertension": {{ "present": true, "risk_multiplier": 1.3, "diagnostic_weight": 0.4 }}
        }},
        "past_medical_history": {{
            "hypertension": {{ "present": true, "years_diagnosed": 5, "controlled": true, "diagnostic_weight": 0.6 }},
            "diabetes": {{ "present": false }},
            "hyperlipidemia": {{ "present": true, "on_statin": true, "diagnostic_weight": 0.4 }},
            "prior_mi": {{ "present": false, "diagnostic_weight": 0.8 }},
            "prior_stroke": {{ "present": false }},
            "chf": {{ "present": false, "diagnostic_weight": 0.7 }},
            "ckd": {{ "present": false, "stage": 0 }},
            "copd": {{ "present": false }},
            "atrial_fibrillation": {{ "present": false, "diagnostic_weight": 0.6 }}
        }},
        "current_medications": {{
            "antihypertensives": ["lisinopril 10mg daily"],
            "statins": ["atorvastatin 20mg daily"],
            "antiplatelets": [],
            "anticoagulants": [],
            "diabetic_medications": [],
            "beta_blockers": [],
            "diuretics": []
        }},
        "allergies": {{
            "medications": ["penicillin"],
            "reaction_type": "rash",
            "severity": "moderate"
        }},
        "surgical_history": {{
            "procedures": ["appendectomy 2010"],
            "cardiac_procedures": []
        }},
        "social_history": {{
            "occupation": "office_worker",
            "exercise": "moderate",
            "exercise_minutes_per_week": 90,
            "diet": "average",
            "stress_level": "moderate"
        }}
    }},
    "functional_scores": {{
        "nyha_class": {{ "value": 1, "description": "No limitation of physical activity", "diagnostic_weight": 0.7 }},
        "cha2ds2_vasc": {{ "value": 2, "stroke_risk_per_year": "2.2%", "diagnostic_weight": 0.6 }},
        "hasbled": {{ "value": 1, "bleeding_risk": "low", "diagnostic_weight": 0.5 }},
        "framingham_risk": {{ "value": 8, "unit": "%", "ten_year_cvd_risk": "moderate" }},
        "wells_dvt": {{ "value": 0, "probability": "low" }},
        "wells_pe": {{ "value": 0, "probability": "low" }},
        "curb65": {{ "value": 0, "mortality_risk": "low" }},
        "apache_ii": {{ "value": 5, "mortality_risk": "low" }},
        "sofa": {{ "value": 0, "mortality_risk": "low" }},
        "gcs": {{ "value": 15, "description": "fully alert" }}
    }}
}}

CRITICAL INSTRUCTIONS:
1. ONLY include parameters that this SPECIFIC DISEASE ({disease_name}) affects
2. For affected parameters, set abnormal=true and provide change_direction and change_percent
3. Include diagnostic_weight (0-1) indicating how important each finding is for diagnosing this disease
4. All values must be realistic and evidence-based
5. For risk_factors, include those most relevant to this disease
6. Include functional scores relevant to this disease type

Return ONLY the JSON object."""


class ComprehensiveClinicalGenerator:
    """Generates complete EMR-style clinical data for all diseases."""
    
    def __init__(self):
        self.mongo_url = os.environ.get('MONGO_URL')
        self.db_name = os.environ.get('DB_NAME', 'test_database')
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        self.client = None
        self.db = None
        
    async def connect(self):
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        logger.info(f"Connected to database: {self.db_name}")
    
    async def get_diseases_needing_expansion(self) -> List[Dict]:
        """Find diseases needing comprehensive clinical data."""
        # Get diseases without ECG parameters or risk factors
        diseases = await self.db.diseases.find(
            {
                '$or': [
                    {'parameter_modifications.heart.ecg.pr_interval': {'$exists': False}},
                    {'parameter_modifications.risk_factors': {'$exists': False}},
                    {'parameter_modifications.functional_scores': {'$exists': False}}
                ]
            },
            {'_id': 0, 'id': 1, 'name': 1, 'category': 1, 'icd10_code': 1}
        ).to_list(1000)
        
        return diseases
    
    async def generate_comprehensive_params(self, disease: Dict) -> Optional[Dict]:
        """Generate comprehensive clinical parameters."""
        if not EMERGENT_AVAILABLE or not self.api_key:
            return None
        
        disease_name = disease['name']
        
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"comprehensive_{disease['id']}",
                system_message="You are an expert clinical medicine informaticist. Generate comprehensive EMR-compatible parameter data for differential diagnosis. Return only valid JSON."
            ).with_model("openai", "gpt-4o")
            
            prompt = COMPREHENSIVE_PROMPT.format(disease_name=disease_name)
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                return json.loads(json_match.group())
            
            return None
            
        except Exception as e:
            logger.error(f"Error generating params for {disease_name}: {e}")
            return None
    
    async def merge_and_update(self, disease_id: str, new_params: Dict) -> bool:
        """Merge new params with existing and update database."""
        try:
            # Get existing
            existing = await self.db.diseases.find_one(
                {'id': disease_id},
                {'_id': 0, 'parameter_modifications': 1}
            )
            
            existing_params = existing.get('parameter_modifications', {}) if existing else {}
            
            # Deep merge
            def deep_merge(base, new):
                result = dict(base)
                for key, value in new.items():
                    if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                        result[key] = deep_merge(result[key], value)
                    else:
                        result[key] = value
                return result
            
            merged = deep_merge(existing_params, new_params)
            
            result = await self.db.diseases.update_one(
                {'id': disease_id},
                {'$set': {'parameter_modifications': merged}}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error updating {disease_id}: {e}")
            return False
    
    async def run(self, batch_size: int = 3, max_count: int = None):
        """Run comprehensive clinical data generation."""
        await self.connect()
        
        diseases = await self.get_diseases_needing_expansion()
        
        if max_count:
            diseases = diseases[:max_count]
        
        logger.info(f"Found {len(diseases)} diseases needing comprehensive clinical data")
        
        success = 0
        fail = 0
        
        for i, disease in enumerate(diseases):
            logger.info(f"[{i+1}/{len(diseases)}] Processing: {disease['name']}")
            
            params = await self.generate_comprehensive_params(disease)
            
            if params:
                if await self.merge_and_update(disease['id'], params):
                    success += 1
                    logger.info(f"✓ Updated: {disease['name']}")
                else:
                    fail += 1
            else:
                fail += 1
                logger.warning(f"✗ Failed: {disease['name']}")
            
            await asyncio.sleep(1)
            
            if (i + 1) % batch_size == 0 and i + 1 < len(diseases):
                logger.info(f"Progress: {success}/{i+1}")
                await asyncio.sleep(3)
        
        logger.info("\n" + "=" * 50)
        logger.info("COMPREHENSIVE CLINICAL DATA GENERATION COMPLETE")
        logger.info(f"Success: {success}")
        logger.info(f"Failed: {fail}")


async def main():
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--batch-size', type=int, default=3)
    parser.add_argument('--max', type=int, default=None)
    parser.add_argument('--dry-run', action='store_true')
    
    args = parser.parse_args()
    
    generator = ComprehensiveClinicalGenerator()
    
    if args.dry_run:
        await generator.connect()
        diseases = await generator.get_diseases_needing_expansion()
        print(f"\n{len(diseases)} diseases need comprehensive clinical data")
        for d in diseases[:15]:
            print(f"  - {d['name']}")
        if len(diseases) > 15:
            print(f"  ... and {len(diseases) - 15} more")
    else:
        await generator.run(batch_size=args.batch_size, max_count=args.max)


if __name__ == "__main__":
    asyncio.run(main())
