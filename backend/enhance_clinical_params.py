#!/usr/bin/env python3
"""
Comprehensive Clinical Parameter Generator
Ensures ALL diseases have complete clinical data including:
- Vital signs (BP, HR, RR, Temp, SpO2)
- Physical exam findings (auscultation, inspection, palpation)
- Lab tests (CBC, BMP, LFT, cardiac markers, etc.)
- ECG findings
- Imaging findings
- Molecular/cellular changes

This enables the Mathematical Human Body to show real clinical data
that can be matched against EMR for differential diagnosis.
"""

import asyncio
import os
import sys
import json
import re
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from motor.motor_asyncio import AsyncIOMotorClient

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/clinical_params_gen.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False
    logger.error("Emergent integrations not available!")


# Comprehensive prompt for clinical parameter generation
CLINICAL_PARAMS_PROMPT = """You are a clinical medicine expert. Generate COMPREHENSIVE clinical parameters for: {disease_name}

This disease affects the {primary_organ} system. Generate parameters that would be found in a patient's EMR/clinical record.

Return ONLY a valid JSON object with this exact structure (include ALL relevant parameters):

{{
    "heart": {{
        "vital_signs": {{
            "systolic_bp": {{ "value": 140, "change_percent": 20, "direction": "increase", "unit": "mmHg", "normal_range": "90-120" }},
            "diastolic_bp": {{ "value": 90, "change_percent": 15, "direction": "increase", "unit": "mmHg", "normal_range": "60-80" }},
            "heart_rate": {{ "value": 100, "change_percent": 25, "direction": "increase", "unit": "bpm", "normal_range": "60-100" }},
            "respiratory_rate": {{ "value": 22, "change_percent": 20, "direction": "increase", "unit": "/min", "normal_range": "12-20" }},
            "temperature": {{ "value": 37.5, "change_percent": 2, "direction": "increase", "unit": "°C", "normal_range": "36.5-37.5" }},
            "spo2": {{ "value": 94, "change_percent": -4, "direction": "decrease", "unit": "%", "normal_range": "95-100" }}
        }},
        "physical_exam": {{
            "heart_sounds": {{ "finding": "S3 gallop present", "abnormal": true }},
            "jvp": {{ "value": 12, "change_percent": 50, "direction": "increase", "unit": "cmH2O", "normal_range": "6-8" }},
            "edema": {{ "finding": "2+ pitting edema bilateral lower extremities", "abnormal": true }},
            "lung_sounds": {{ "finding": "Bilateral crackles at bases", "abnormal": true }}
        }},
        "ecg": {{
            "rhythm": {{ "finding": "Atrial fibrillation", "abnormal": true }},
            "rate": {{ "value": 110, "abnormal": true }},
            "pr_interval": {{ "value": 180, "unit": "ms", "normal_range": "120-200", "abnormal": false }},
            "qrs_duration": {{ "value": 100, "unit": "ms", "normal_range": "80-120", "abnormal": false }},
            "qt_interval": {{ "value": 420, "unit": "ms", "abnormal": false }},
            "st_changes": {{ "finding": "ST depression in V4-V6", "abnormal": true }}
        }},
        "lab_tests": {{
            "troponin_i": {{ "value": 2.5, "change_percent": 500, "direction": "increase", "unit": "ng/mL", "normal_range": "<0.04" }},
            "bnp": {{ "value": 1500, "change_percent": 1400, "direction": "increase", "unit": "pg/mL", "normal_range": "<100" }},
            "nt_probnp": {{ "value": 5000, "change_percent": 1500, "direction": "increase", "unit": "pg/mL", "normal_range": "<300" }},
            "crp": {{ "value": 25, "change_percent": 400, "direction": "increase", "unit": "mg/L", "normal_range": "<5" }},
            "d_dimer": {{ "value": 1.5, "change_percent": 200, "direction": "increase", "unit": "µg/mL", "normal_range": "<0.5" }}
        }},
        "imaging": {{
            "chest_xray": {{ "finding": "Cardiomegaly, pulmonary congestion", "abnormal": true }},
            "echo_ef": {{ "value": 35, "change_percent": -40, "direction": "decrease", "unit": "%", "normal_range": "55-70" }},
            "lv_size": {{ "value": 65, "change_percent": 20, "direction": "increase", "unit": "mm", "normal_range": "42-58" }}
        }}
    }},
    "blood": {{
        "lab_tests": {{
            "hemoglobin": {{ "value": 11, "change_percent": -20, "direction": "decrease", "unit": "g/dL", "normal_range": "12-16" }},
            "wbc": {{ "value": 12000, "change_percent": 30, "direction": "increase", "unit": "/µL", "normal_range": "4500-11000" }},
            "platelets": {{ "value": 180, "unit": "×10³/µL", "normal_range": "150-400" }},
            "hematocrit": {{ "value": 33, "change_percent": -20, "direction": "decrease", "unit": "%", "normal_range": "36-48" }}
        }}
    }},
    "kidneys": {{
        "lab_tests": {{
            "creatinine": {{ "value": 1.8, "change_percent": 50, "direction": "increase", "unit": "mg/dL", "normal_range": "0.7-1.3" }},
            "bun": {{ "value": 35, "change_percent": 75, "direction": "increase", "unit": "mg/dL", "normal_range": "7-20" }},
            "egfr": {{ "value": 45, "change_percent": -40, "direction": "decrease", "unit": "mL/min/1.73m²", "normal_range": ">90" }},
            "sodium": {{ "value": 132, "change_percent": -5, "direction": "decrease", "unit": "mEq/L", "normal_range": "136-145" }},
            "potassium": {{ "value": 5.2, "change_percent": 15, "direction": "increase", "unit": "mEq/L", "normal_range": "3.5-5.0" }}
        }}
    }},
    "liver": {{
        "lab_tests": {{
            "ast": {{ "value": 45, "change_percent": 50, "direction": "increase", "unit": "U/L", "normal_range": "10-40" }},
            "alt": {{ "value": 55, "change_percent": 60, "direction": "increase", "unit": "U/L", "normal_range": "7-56" }},
            "albumin": {{ "value": 3.0, "change_percent": -25, "direction": "decrease", "unit": "g/dL", "normal_range": "3.5-5.0" }},
            "bilirubin": {{ "value": 1.5, "change_percent": 30, "direction": "increase", "unit": "mg/dL", "normal_range": "0.1-1.2" }},
            "inr": {{ "value": 1.3, "change_percent": 20, "direction": "increase", "normal_range": "0.9-1.1" }}
        }}
    }},
    "lungs": {{
        "physiology": {{
            "fev1": {{ "value": 2.5, "change_percent": -30, "direction": "decrease", "unit": "L", "normal_range": "3.0-4.5" }},
            "fvc": {{ "value": 3.2, "change_percent": -25, "direction": "decrease", "unit": "L", "normal_range": "3.5-5.0" }},
            "fev1_fvc_ratio": {{ "value": 78, "unit": "%", "normal_range": ">70" }}
        }},
        "blood_gas": {{
            "pao2": {{ "value": 65, "change_percent": -25, "direction": "decrease", "unit": "mmHg", "normal_range": "80-100" }},
            "paco2": {{ "value": 50, "change_percent": 25, "direction": "increase", "unit": "mmHg", "normal_range": "35-45" }},
            "ph": {{ "value": 7.32, "change_percent": -1, "direction": "decrease", "normal_range": "7.35-7.45" }}
        }}
    }},
    "pancreas": {{
        "lab_tests": {{
            "glucose_fasting": {{ "value": 130, "change_percent": 30, "direction": "increase", "unit": "mg/dL", "normal_range": "70-100" }},
            "hba1c": {{ "value": 7.5, "change_percent": 35, "direction": "increase", "unit": "%", "normal_range": "<5.7" }},
            "lipase": {{ "value": 50, "unit": "U/L", "normal_range": "10-140" }},
            "amylase": {{ "value": 80, "unit": "U/L", "normal_range": "25-125" }}
        }}
    }},
    "brain": {{
        "clinical_findings": {{
            "consciousness": {{ "finding": "Alert and oriented", "gcs": 15 }},
            "motor_exam": {{ "finding": "Normal strength bilateral" }},
            "sensory_exam": {{ "finding": "Intact to light touch" }},
            "reflexes": {{ "finding": "2+ symmetric" }},
            "cranial_nerves": {{ "finding": "Intact II-XII" }}
        }}
    }},
    "cellular": {{
        "molecular": {{
            "inflammatory_markers": {{ "il6": {{ "change_percent": 200, "direction": "increase" }}, "tnf_alpha": {{ "change_percent": 150, "direction": "increase" }} }},
            "oxidative_stress": {{ "ros_level": {{ "change_percent": 50, "direction": "increase" }} }}
        }},
        "gene_expression": {{
            "relevant_genes": {{ "description": "Gene expression changes specific to this disease" }}
        }}
    }}
}}

CRITICAL RULES:
1. ONLY include parameters that THIS SPECIFIC DISEASE actually affects
2. Use realistic, evidence-based values
3. Include both value and change_percent where applicable  
4. Include normal_range for reference
5. Focus on the PRIMARY affected organ system first
6. Include common lab abnormalities for this condition
7. For cardiovascular diseases: MUST include vital_signs, ecg, cardiac markers
8. For respiratory diseases: MUST include SpO2, blood gas, pulmonary function
9. For renal diseases: MUST include kidney function tests
10. For neurological diseases: MUST include neurological exam findings

Return ONLY the JSON object, no explanations."""


class ClinicalParameterEnhancer:
    """Enhances diseases with comprehensive clinical parameters."""
    
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
    
    async def get_diseases_needing_clinical_params(self) -> List[Dict]:
        """Find diseases that are missing clinical parameters."""
        # Find diseases without vital_signs OR with only cellular params
        diseases = await self.db.diseases.find(
            {
                '$or': [
                    {'parameter_modifications.heart.vital_signs': {'$exists': False}},
                    {'parameter_modifications.heart.lab_tests': {'$exists': False}},
                    {'parameter_modifications.heart.physical_exam': {'$exists': False}}
                ],
                'parameter_modifications': {'$exists': True, '$ne': {}}
            },
            {'_id': 0, 'id': 1, 'name': 1, 'category': 1, 'icd10_code': 1, 'parameter_modifications': 1}
        ).to_list(1000)
        
        return diseases
    
    def get_primary_organ(self, category: str) -> str:
        """Determine primary organ from category."""
        category_map = {
            'cardiovascular': 'heart',
            'cardiac': 'heart',
            'respiratory': 'lungs',
            'pulmonary': 'lungs',
            'renal': 'kidneys',
            'nephrology': 'kidneys',
            'hepatic': 'liver',
            'gastrointestinal': 'liver',
            'neurological': 'brain',
            'psychiatric': 'brain',
            'hematological': 'blood',
            'oncology': 'blood',
            'endocrine': 'pancreas',
            'metabolic': 'pancreas',
            'infectious': 'blood',
            'rheumatological': 'blood',
            'dermatological': 'blood',
            'ophthalmology': 'brain',
            'otolaryngology': 'brain',
            'obstetrics': 'blood',
            'gynecology': 'blood',
            'neonatology': 'lungs',
            'urology': 'kidneys',
            'musculoskeletal': 'blood',
            'emergency': 'heart',
            'pediatric': 'heart'
        }
        return category_map.get(category.lower(), 'heart')
    
    async def generate_clinical_params(self, disease: Dict) -> Optional[Dict]:
        """Generate comprehensive clinical parameters for a disease."""
        if not EMERGENT_AVAILABLE or not self.api_key:
            logger.error("LLM not available")
            return None
        
        disease_name = disease['name']
        category = disease.get('category', 'general')
        primary_organ = self.get_primary_organ(category)
        
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"clinical_params_{disease['id']}",
                system_message="You are a clinical medicine expert generating comprehensive EMR-compatible parameter data. Return only valid JSON."
            ).with_model("openai", "gpt-4o")
            
            prompt = CLINICAL_PARAMS_PROMPT.format(
                disease_name=disease_name,
                primary_organ=primary_organ
            )
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            # Parse JSON
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                params = json.loads(json_match.group())
                return params
            
            logger.warning(f"Could not parse JSON for {disease_name}")
            return None
            
        except Exception as e:
            logger.error(f"Error generating params for {disease_name}: {e}")
            return None
    
    async def merge_params(self, existing: Dict, new_params: Dict) -> Dict:
        """Merge new clinical params with existing, preserving existing data."""
        merged = dict(existing) if existing else {}
        
        for organ, scales in new_params.items():
            if organ not in merged:
                merged[organ] = scales
            elif isinstance(scales, dict):
                if not isinstance(merged[organ], dict):
                    merged[organ] = scales
                else:
                    for scale, params in scales.items():
                        if scale not in merged[organ]:
                            merged[organ][scale] = params
                        elif isinstance(params, dict) and isinstance(merged[organ][scale], dict):
                            # Merge individual parameters
                            for param, value in params.items():
                                if param not in merged[organ][scale]:
                                    merged[organ][scale][param] = value
        
        return merged
    
    async def update_disease(self, disease_id: str, params: Dict) -> bool:
        """Update disease with new parameters."""
        try:
            result = await self.db.diseases.update_one(
                {'id': disease_id},
                {'$set': {'parameter_modifications': params}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating {disease_id}: {e}")
            return False
    
    async def run(self, batch_size: int = 3, max_count: int = None):
        """Run the clinical parameter enhancement."""
        await self.connect()
        
        diseases = await self.get_diseases_needing_clinical_params()
        
        if max_count:
            diseases = diseases[:max_count]
        
        logger.info(f"Found {len(diseases)} diseases needing clinical parameters")
        
        if not diseases:
            logger.info("All diseases have clinical parameters!")
            return
        
        success = 0
        fail = 0
        
        for i, disease in enumerate(diseases):
            logger.info(f"[{i+1}/{len(diseases)}] Enhancing: {disease['name']}")
            
            new_params = await self.generate_clinical_params(disease)
            
            if new_params:
                # Merge with existing
                existing = disease.get('parameter_modifications', {})
                merged = await self.merge_params(existing, new_params)
                
                if await self.update_disease(disease['id'], merged):
                    success += 1
                    logger.info(f"✓ Enhanced: {disease['name']}")
                else:
                    fail += 1
            else:
                fail += 1
                logger.warning(f"✗ Failed: {disease['name']}")
            
            await asyncio.sleep(1)
            
            if (i + 1) % batch_size == 0 and i + 1 < len(diseases):
                logger.info(f"Progress: {success} success, {fail} failed")
                await asyncio.sleep(3)
        
        logger.info("\n" + "=" * 50)
        logger.info("CLINICAL ENHANCEMENT COMPLETE")
        logger.info(f"Success: {success}")
        logger.info(f"Failed: {fail}")
        
        # Final stats
        with_vitals = await self.db.diseases.count_documents({
            'parameter_modifications.heart.vital_signs': {'$exists': True, '$ne': {}}
        })
        with_labs = await self.db.diseases.count_documents({
            'parameter_modifications.heart.lab_tests': {'$exists': True, '$ne': {}}
        })
        logger.info(f"Diseases with vital_signs: {with_vitals}")
        logger.info(f"Diseases with lab_tests: {with_labs}")


async def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Enhance diseases with clinical parameters')
    parser.add_argument('--batch-size', type=int, default=3, help='Batch size')
    parser.add_argument('--max', type=int, default=None, help='Maximum diseases')
    parser.add_argument('--dry-run', action='store_true', help='Show what needs enhancement')
    
    args = parser.parse_args()
    
    enhancer = ClinicalParameterEnhancer()
    
    if args.dry_run:
        await enhancer.connect()
        diseases = await enhancer.get_diseases_needing_clinical_params()
        print(f"\n{len(diseases)} diseases need clinical parameter enhancement:")
        for d in diseases[:20]:
            existing = d.get('parameter_modifications', {})
            has = [k for k in existing.keys()]
            print(f"  - {d['name']}: has {has}")
        if len(diseases) > 20:
            print(f"  ... and {len(diseases) - 20} more")
    else:
        await enhancer.run(batch_size=args.batch_size, max_count=args.max)


if __name__ == "__main__":
    asyncio.run(main())
