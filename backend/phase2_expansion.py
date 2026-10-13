#!/usr/bin/env python3
"""
Phase 2 Expansion: Add underrepresented ICD-10 categories and enhance drug-disease connections
- Eye/Ear (H chapter)
- Pregnancy/Obstetrics (O chapter)
- Perinatal (P chapter)
- Gynecology, Urology, Dermatology, Musculoskeletal
"""

import asyncio
import os
import sys
import json
import re
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from motor.motor_asyncio import AsyncIOMotorClient
from services.medical_knowledge_generator import MedicalKnowledgeGenerator
from additional_icd10 import get_additional_icd10_conditions

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/phase2_expansion.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False


class Phase2Expander:
    """Phase 2: Add more ICD-10 categories and enhance connections."""
    
    def __init__(self):
        self.mongo_url = os.environ.get('MONGO_URL')
        self.db_name = os.environ.get('DB_NAME', 'test_database')
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        self.client = None
        self.db = None
        self.generator = None
        
    async def connect(self):
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        self.generator = MedicalKnowledgeGenerator()
        logger.info(f"Connected to database: {self.db_name}")
        
    async def get_existing_diseases(self) -> set:
        existing = await self.db.diseases.find({}, {'_id': 0, 'name': 1}).to_list(1000)
        return {d['name'].lower() for d in existing}
    
    async def get_existing_icd10_codes(self) -> set:
        existing = await self.db.diseases.find({}, {'_id': 0, 'icd10_code': 1}).to_list(1000)
        return {d.get('icd10_code', '').upper().replace('.', '') for d in existing if d.get('icd10_code')}
    
    async def find_new_conditions(self) -> List[Dict]:
        """Find conditions from additional list that need to be added."""
        existing_names = await self.get_existing_diseases()
        existing_codes = await self.get_existing_icd10_codes()
        
        conditions = get_additional_icd10_conditions()
        to_add = []
        
        for condition in conditions:
            name_lower = condition['name'].lower()
            icd_normalized = condition.get('icd10', '').upper().replace('.', '')
            
            # Skip if already exists
            if icd_normalized in existing_codes:
                continue
            if name_lower in existing_names:
                continue
                
            # Check for similar names
            found = False
            for e in existing_names:
                if name_lower in e or e in name_lower:
                    found = True
                    break
            if not found:
                to_add.append(condition)
        
        return to_add
    
    async def generate_disease(self, condition: Dict) -> Optional[Dict]:
        """Generate disease data for a condition."""
        name = condition['name']
        category = condition['category']
        icd10 = condition.get('icd10', '')
        
        logger.info(f"Generating: {name} ({category})")
        
        try:
            additional_context = f"ICD-10 Code: {icd10}" if icd10 else ""
            result = await self.generator.generate_disease_data(
                disease_name=name,
                category=category,
                additional_context=additional_context
            )
            
            if result:
                if icd10 and not result.get('icd10_code'):
                    result['icd10_code'] = icd10
                logger.info(f"✓ Generated: {name}")
                return result
            else:
                logger.warning(f"✗ Failed: {name}")
                return None
                
        except Exception as e:
            logger.error(f"Error generating {name}: {e}")
            return None
    
    async def generate_params(self, disease_id: str, disease_name: str) -> Optional[Dict]:
        """Generate parameter_modifications for a disease."""
        if not EMERGENT_AVAILABLE or not self.api_key:
            return None
            
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"param_gen_{disease_id}",
                system_message="You are a medical expert generating physiological parameter modifications. Return only valid JSON."
            ).with_model("openai", "gpt-4o")
            
            prompt = f"""Generate parameter_modifications for: {disease_name}

Return JSON with this structure (only include parameters this disease actually affects):
{{
    "heart": {{
        "vital_signs": {{"systolic_bp": {{"change_percent": X, "direction": "increase/decrease"}}}},
        "lab_tests": {{"troponin_i": {{"change_percent": X, "direction": "..."}}}}
    }},
    "blood": {{
        "geometry": {{"wbc_count": {{"change_percent": X, "direction": "..."}}}},
        "physiology": {{"hemoglobin": {{"change_percent": X, "direction": "..."}}}}
    }},
    "kidneys": {{
        "lab_tests": {{"creatinine": {{"change_percent": X, "direction": "..."}}}}
    }},
    "liver": {{
        "lab_tests": {{"alt": {{"change_percent": X, "direction": "..."}}}}
    }},
    "lungs": {{
        "physiology": {{"spo2": {{"change_percent": X, "direction": "..."}}}}
    }}
}}

Only include organs/parameters that this specific disease affects."""

            response = await chat.send_message(UserMessage(text=prompt))
            
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                return json.loads(json_match.group())
            return None
            
        except Exception as e:
            logger.error(f"Error generating params for {disease_name}: {e}")
            return None
    
    async def save_disease(self, disease: Dict) -> bool:
        """Save disease to database."""
        try:
            disease_id = disease.get('id', disease['name'].lower().replace(' ', '_'))
            
            existing = await self.db.diseases.find_one({'id': disease_id})
            if existing:
                await self.db.diseases.update_one({'id': disease_id}, {'$set': disease})
                logger.info(f"Updated: {disease['name']}")
            else:
                await self.db.diseases.insert_one(disease)
                logger.info(f"Inserted: {disease['name']}")
            
            return True
        except Exception as e:
            logger.error(f"Error saving {disease.get('name', 'unknown')}: {e}")
            return False
    
    async def enhance_drug_disease_connections(self):
        """Enhance drug-disease connections with better linking."""
        logger.info("Enhancing drug-disease connections...")
        
        # Get all diseases for matching
        diseases = await self.db.diseases.find(
            {}, 
            {'_id': 0, 'id': 1, 'name': 1, 'icd10_code': 1, 'category': 1}
        ).to_list(1000)
        
        disease_by_name = {d['name'].lower(): d for d in diseases}
        disease_by_id = {d['id']: d for d in diseases}
        
        # Common drug-disease mappings
        drug_disease_map = {
            # Cardiovascular
            'ace inhibitor': ['heart failure', 'hypertension', 'diabetic nephropathy', 'myocardial infarction'],
            'arb': ['heart failure', 'hypertension', 'diabetic nephropathy'],
            'beta blocker': ['heart failure', 'hypertension', 'atrial fibrillation', 'angina', 'myocardial infarction'],
            'calcium channel blocker': ['hypertension', 'angina', 'atrial fibrillation'],
            'statin': ['hyperlipidemia', 'coronary artery disease', 'stroke prevention'],
            'anticoagulant': ['atrial fibrillation', 'deep vein thrombosis', 'pulmonary embolism', 'stroke'],
            'antiplatelet': ['coronary artery disease', 'stroke', 'peripheral artery disease'],
            'diuretic': ['heart failure', 'hypertension', 'edema', 'cirrhosis'],
            
            # Endocrine
            'insulin': ['diabetes', 'diabetic ketoacidosis', 'hyperglycemia'],
            'metformin': ['type 2 diabetes', 'polycystic ovary', 'prediabetes'],
            'sulfonylurea': ['type 2 diabetes'],
            'thyroxine': ['hypothyroidism', 'myxedema'],
            'antithyroid': ['hyperthyroidism', 'graves disease', 'thyroid storm'],
            
            # Respiratory
            'bronchodilator': ['asthma', 'copd', 'bronchitis'],
            'inhaled corticosteroid': ['asthma', 'copd'],
            
            # GI
            'proton pump inhibitor': ['gerd', 'peptic ulcer', 'gastritis', 'h. pylori'],
            'h2 blocker': ['gerd', 'peptic ulcer', 'gastritis'],
            
            # Neurological
            'antiepileptic': ['epilepsy', 'seizure', 'neuropathic pain'],
            'antidepressant': ['depression', 'anxiety', 'neuropathic pain'],
            'antipsychotic': ['schizophrenia', 'bipolar', 'psychosis'],
            
            # Pain/Inflammation
            'nsaid': ['arthritis', 'pain', 'inflammation', 'gout'],
            'opioid': ['pain', 'cancer pain'],
            'corticosteroid': ['asthma', 'copd', 'arthritis', 'lupus', 'inflammatory bowel'],
            
            # Antibiotics
            'antibiotic': ['pneumonia', 'urinary tract infection', 'cellulitis', 'sepsis'],
            'antiviral': ['hiv', 'hepatitis', 'herpes', 'influenza'],
            'antifungal': ['candidiasis', 'aspergillosis', 'cryptococcosis'],
        }
        
        # Get all drugs
        drugs = await self.db.drugs_generated.find({}).to_list(1000)
        enhanced_count = 0
        
        for drug in drugs:
            drug_class = drug.get('drug_class', '').lower()
            drug_name = drug.get('name', '').lower()
            current_indications = drug.get('indications', [])
            
            # Find matching diseases based on drug class
            new_indications = list(current_indications) if isinstance(current_indications, list) else []
            
            for class_pattern, disease_patterns in drug_disease_map.items():
                if class_pattern in drug_class or class_pattern in drug_name:
                    for disease_pattern in disease_patterns:
                        # Find matching diseases in our database
                        for disease_name, disease_data in disease_by_name.items():
                            if disease_pattern in disease_name:
                                # Check if already in indications
                                existing_ids = {
                                    ind.get('disease_id') if isinstance(ind, dict) else None 
                                    for ind in new_indications
                                }
                                if disease_data['id'] not in existing_ids:
                                    new_indications.append({
                                        'disease_id': disease_data['id'],
                                        'disease_name': disease_data['name'],
                                        'icd10_code': disease_data.get('icd10_code', ''),
                                        'efficacy': 'moderate',
                                        'evidence_level': 'B'
                                    })
            
            # Update if we have new indications
            if len(new_indications) > len(current_indications):
                await self.db.drugs_generated.update_one(
                    {'id': drug['id']},
                    {'$set': {'indications': new_indications}}
                )
                enhanced_count += 1
        
        logger.info(f"Enhanced {enhanced_count} drug records with disease connections")
        return enhanced_count
    
    async def run(self, batch_size: int = 3, max_count: int = None):
        """Run the phase 2 expansion."""
        await self.connect()
        
        # Find new conditions to add
        to_add = await self.find_new_conditions()
        
        if max_count:
            to_add = to_add[:max_count]
        
        logger.info(f"Found {len(to_add)} new conditions to add")
        
        success_count = 0
        fail_count = 0
        
        # Generate diseases
        for i, condition in enumerate(to_add):
            result = await self.generate_disease(condition)
            if result:
                # Also generate parameter modifications
                disease_id = result.get('id', result['name'].lower().replace(' ', '_'))
                params = await self.generate_params(disease_id, result['name'])
                if params:
                    result['parameter_modifications'] = params
                
                saved = await self.save_disease(result)
                if saved:
                    success_count += 1
                else:
                    fail_count += 1
            else:
                fail_count += 1
            
            await asyncio.sleep(1)
            
            if (i + 1) % batch_size == 0 and i + 1 < len(to_add):
                logger.info(f"Progress: {success_count} success, {fail_count} failed")
                await asyncio.sleep(3)
        
        # Enhance drug-disease connections
        enhanced = await self.enhance_drug_disease_connections()
        
        # Summary
        logger.info("\n" + "=" * 50)
        logger.info("PHASE 2 EXPANSION COMPLETE")
        logger.info(f"Diseases generated: {success_count}")
        logger.info(f"Diseases failed: {fail_count}")
        logger.info(f"Drug connections enhanced: {enhanced}")
        
        # Final stats
        total = await self.db.diseases.count_documents({})
        with_params = await self.db.diseases.count_documents({
            'parameter_modifications': {'$exists': True, '$ne': {}}
        })
        logger.info(f"Total diseases: {total}")
        logger.info(f"With parameters: {with_params}")


async def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Phase 2 Knowledge Base Expansion')
    parser.add_argument('--batch-size', type=int, default=3, help='Batch size')
    parser.add_argument('--max', type=int, default=None, help='Maximum conditions')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be added')
    parser.add_argument('--enhance-only', action='store_true', help='Only enhance drug connections')
    
    args = parser.parse_args()
    
    expander = Phase2Expander()
    
    if args.dry_run:
        await expander.connect()
        to_add = await expander.find_new_conditions()
        print(f"\nWould add {len(to_add)} new conditions:")
        
        # Group by category
        by_cat = {}
        for c in to_add:
            cat = c['category']
            if cat not in by_cat:
                by_cat[cat] = []
            by_cat[cat].append(c['name'])
        
        for cat, names in sorted(by_cat.items()):
            print(f"\n{cat.upper()} ({len(names)}):")
            for name in names[:5]:
                print(f"  - {name}")
            if len(names) > 5:
                print(f"  ... and {len(names) - 5} more")
    elif args.enhance_only:
        await expander.connect()
        await expander.enhance_drug_disease_connections()
    else:
        await expander.run(batch_size=args.batch_size, max_count=args.max)


if __name__ == "__main__":
    asyncio.run(main())
