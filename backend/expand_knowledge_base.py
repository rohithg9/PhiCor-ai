#!/usr/bin/env python3
"""
PhiCore Knowledge Base Expansion Script
Generates comprehensive disease and drug data with full parameter_modifications
for the Mathematical Human Body model.

This script:
1. Identifies gaps in ICD-10 coverage
2. Generates missing diseases with full clinical data
3. Enhances drug-disease connections
4. Ensures all data feeds into the interconnected PhiCor system
"""

import asyncio
import os
import sys
import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from motor.motor_asyncio import AsyncIOMotorClient
from services.medical_knowledge_generator import MedicalKnowledgeGenerator, get_priority_diseases

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/knowledge_expansion.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Additional high-priority ICD-10 conditions not in the priority list
ADDITIONAL_ICD10_CONDITIONS = [
    # Cardiovascular - I chapter gaps
    {"name": "Acute Myocardial Infarction (STEMI)", "icd10": "I21.3", "category": "cardiovascular"},
    {"name": "NSTEMI", "icd10": "I21.4", "category": "cardiovascular"},
    {"name": "Cardiac Tamponade", "icd10": "I31.4", "category": "cardiovascular"},
    {"name": "Infective Endocarditis", "icd10": "I33.0", "category": "cardiovascular"},
    {"name": "Aortic Aneurysm", "icd10": "I71.9", "category": "cardiovascular"},
    {"name": "Peripheral Artery Disease", "icd10": "I73.9", "category": "cardiovascular"},
    {"name": "Carotid Artery Stenosis", "icd10": "I65.2", "category": "cardiovascular"},
    {"name": "Cardiac Arrest", "icd10": "I46.9", "category": "cardiovascular"},
    
    # Respiratory - J chapter gaps
    {"name": "Acute Respiratory Distress Syndrome (ARDS)", "icd10": "J80", "category": "respiratory"},
    {"name": "Pulmonary Fibrosis", "icd10": "J84.1", "category": "respiratory"},
    {"name": "Pneumothorax", "icd10": "J93.9", "category": "respiratory"},
    {"name": "Hemothorax", "icd10": "J94.2", "category": "respiratory"},
    {"name": "Respiratory Failure", "icd10": "J96.9", "category": "respiratory"},
    {"name": "Bronchiolitis", "icd10": "J21.9", "category": "respiratory"},
    {"name": "Croup", "icd10": "J05.0", "category": "respiratory"},
    
    # Infectious - A/B chapter gaps
    {"name": "Sepsis", "icd10": "A41.9", "category": "infectious"},
    {"name": "Septic Shock", "icd10": "R65.21", "category": "infectious"},
    {"name": "Meningitis", "icd10": "G03.9", "category": "infectious"},
    {"name": "Encephalitis", "icd10": "G04.9", "category": "infectious"},
    {"name": "Cellulitis", "icd10": "L03.9", "category": "infectious"},
    {"name": "Osteomyelitis", "icd10": "M86.9", "category": "infectious"},
    {"name": "Infectious Mononucleosis", "icd10": "B27.9", "category": "infectious"},
    {"name": "Malaria", "icd10": "B54", "category": "infectious"},
    {"name": "Dengue Fever", "icd10": "A90", "category": "infectious"},
    {"name": "Lyme Disease", "icd10": "A69.2", "category": "infectious"},
    
    # Oncology - C chapter gaps
    {"name": "Pancreatic Cancer", "icd10": "C25.9", "category": "oncology"},
    {"name": "Esophageal Cancer", "icd10": "C15.9", "category": "oncology"},
    {"name": "Gastric Cancer", "icd10": "C16.9", "category": "oncology"},
    {"name": "Bladder Cancer", "icd10": "C67.9", "category": "oncology"},
    {"name": "Renal Cell Carcinoma", "icd10": "C64.9", "category": "oncology"},
    {"name": "Thyroid Cancer", "icd10": "C73", "category": "oncology"},
    {"name": "Melanoma", "icd10": "C43.9", "category": "oncology"},
    {"name": "Brain Tumor", "icd10": "C71.9", "category": "oncology"},
    {"name": "Ovarian Cancer", "icd10": "C56.9", "category": "oncology"},
    {"name": "Cervical Cancer", "icd10": "C53.9", "category": "oncology"},
    
    # Neurological - G chapter gaps
    {"name": "Status Epilepticus", "icd10": "G41.9", "category": "neurological"},
    {"name": "Guillain-Barré Syndrome", "icd10": "G61.0", "category": "neurological"},
    {"name": "Myasthenia Gravis", "icd10": "G70.0", "category": "neurological"},
    {"name": "Trigeminal Neuralgia", "icd10": "G50.0", "category": "neurological"},
    {"name": "Bell's Palsy", "icd10": "G51.0", "category": "neurological"},
    {"name": "Carpal Tunnel Syndrome", "icd10": "G56.0", "category": "neurological"},
    {"name": "Restless Legs Syndrome", "icd10": "G25.81", "category": "neurological"},
    {"name": "Hydrocephalus", "icd10": "G91.9", "category": "neurological"},
    
    # Endocrine - E chapter gaps
    {"name": "Diabetic Ketoacidosis", "icd10": "E10.1", "category": "endocrine"},
    {"name": "Hyperosmolar Hyperglycemic State", "icd10": "E11.0", "category": "endocrine"},
    {"name": "Thyroid Storm", "icd10": "E05.5", "category": "endocrine"},
    {"name": "Myxedema Coma", "icd10": "E03.5", "category": "endocrine"},
    {"name": "Adrenal Crisis", "icd10": "E27.2", "category": "endocrine"},
    {"name": "Pheochromocytoma", "icd10": "E27.5", "category": "endocrine"},
    {"name": "Acromegaly", "icd10": "E22.0", "category": "endocrine"},
    {"name": "Diabetes Insipidus", "icd10": "E23.2", "category": "endocrine"},
    
    # Renal - N chapter gaps
    {"name": "Nephrotic Syndrome", "icd10": "N04.9", "category": "renal"},
    {"name": "Nephritic Syndrome", "icd10": "N05.9", "category": "renal"},
    {"name": "IgA Nephropathy", "icd10": "N02.8", "category": "renal"},
    {"name": "Polycystic Kidney Disease", "icd10": "Q61.3", "category": "renal"},
    {"name": "Renal Artery Stenosis", "icd10": "I70.1", "category": "renal"},
    {"name": "Urinary Tract Infection", "icd10": "N39.0", "category": "renal"},
    {"name": "Pyelonephritis", "icd10": "N10", "category": "renal"},
    {"name": "Kidney Stones", "icd10": "N20.0", "category": "renal"},
    
    # Gastrointestinal - K chapter gaps
    {"name": "Acute Pancreatitis", "icd10": "K85.9", "category": "gastrointestinal"},
    {"name": "Chronic Pancreatitis", "icd10": "K86.1", "category": "gastrointestinal"},
    {"name": "Cholecystitis", "icd10": "K81.9", "category": "gastrointestinal"},
    {"name": "Cholangitis", "icd10": "K83.0", "category": "gastrointestinal"},
    {"name": "Appendicitis", "icd10": "K35.80", "category": "gastrointestinal"},
    {"name": "Diverticulitis", "icd10": "K57.92", "category": "gastrointestinal"},
    {"name": "Bowel Obstruction", "icd10": "K56.60", "category": "gastrointestinal"},
    {"name": "GI Bleeding", "icd10": "K92.2", "category": "gastrointestinal"},
    
    # Hematological - D chapter gaps
    {"name": "Hemophilia A", "icd10": "D66", "category": "hematological"},
    {"name": "Hemophilia B", "icd10": "D67", "category": "hematological"},
    {"name": "Von Willebrand Disease", "icd10": "D68.0", "category": "hematological"},
    {"name": "Idiopathic Thrombocytopenic Purpura", "icd10": "D69.3", "category": "hematological"},
    {"name": "Thrombotic Thrombocytopenic Purpura", "icd10": "M31.1", "category": "hematological"},
    {"name": "Hemolytic Uremic Syndrome", "icd10": "D59.3", "category": "hematological"},
    {"name": "Myelodysplastic Syndrome", "icd10": "D46.9", "category": "hematological"},
    
    # Psychiatric - F chapter gaps
    {"name": "Major Depressive Disorder", "icd10": "F32.9", "category": "psychiatric"},
    {"name": "Bipolar I Disorder", "icd10": "F31.9", "category": "psychiatric"},
    {"name": "Generalized Anxiety Disorder", "icd10": "F41.1", "category": "psychiatric"},
    {"name": "Panic Disorder", "icd10": "F41.0", "category": "psychiatric"},
    {"name": "Obsessive-Compulsive Disorder", "icd10": "F42.9", "category": "psychiatric"},
    {"name": "Post-Traumatic Stress Disorder", "icd10": "F43.1", "category": "psychiatric"},
    {"name": "Schizophrenia", "icd10": "F20.9", "category": "psychiatric"},
    {"name": "Eating Disorders - Anorexia", "icd10": "F50.0", "category": "psychiatric"},
    
    # Rheumatological - M chapter gaps
    {"name": "Ankylosing Spondylitis", "icd10": "M45.9", "category": "rheumatological"},
    {"name": "Psoriatic Arthritis", "icd10": "L40.50", "category": "rheumatological"},
    {"name": "Polymyalgia Rheumatica", "icd10": "M35.3", "category": "rheumatological"},
    {"name": "Giant Cell Arteritis", "icd10": "M31.6", "category": "rheumatological"},
    {"name": "Scleroderma", "icd10": "M34.9", "category": "rheumatological"},
    {"name": "Dermatomyositis", "icd10": "M33.1", "category": "rheumatological"},
    {"name": "Polymyositis", "icd10": "M33.2", "category": "rheumatological"},
    
    # Emergency/Critical Care
    {"name": "Anaphylaxis", "icd10": "T78.2", "category": "emergency"},
    {"name": "Heat Stroke", "icd10": "T67.0", "category": "emergency"},
    {"name": "Hypothermia", "icd10": "T68", "category": "emergency"},
    {"name": "Drowning", "icd10": "T75.1", "category": "emergency"},
    {"name": "Carbon Monoxide Poisoning", "icd10": "T58.9", "category": "emergency"},
    {"name": "Drug Overdose", "icd10": "T50.9", "category": "emergency"},
    
    # Pediatric
    {"name": "Kawasaki Disease", "icd10": "M30.3", "category": "pediatric"},
    {"name": "Henoch-Schönlein Purpura", "icd10": "D69.0", "category": "pediatric"},
    {"name": "Intussusception", "icd10": "K56.1", "category": "pediatric"},
    {"name": "Pyloric Stenosis", "icd10": "K31.1", "category": "pediatric"},
    {"name": "Febrile Seizures", "icd10": "R56.0", "category": "pediatric"},
]


class KnowledgeBaseExpander:
    """Expands PhiCore knowledge base with comprehensive disease and drug data."""
    
    def __init__(self):
        self.mongo_url = os.environ.get('MONGO_URL')
        self.db_name = os.environ.get('DB_NAME', 'test_database')
        self.client = None
        self.db = None
        self.generator = None
        
    async def connect(self):
        """Connect to MongoDB and initialize generator."""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        self.generator = MedicalKnowledgeGenerator()
        logger.info(f"Connected to database: {self.db_name}")
        
    async def get_existing_diseases(self) -> set:
        """Get set of existing disease names (lowercase)."""
        existing = await self.db.diseases.find({}, {'_id': 0, 'name': 1}).to_list(1000)
        return {d['name'].lower() for d in existing}
    
    async def get_existing_icd10_codes(self) -> set:
        """Get set of existing ICD-10 codes."""
        existing = await self.db.diseases.find({}, {'_id': 0, 'icd10_code': 1}).to_list(1000)
        return {d.get('icd10_code', '').upper() for d in existing if d.get('icd10_code')}
    
    async def find_diseases_to_generate(self) -> List[Dict]:
        """Find all diseases that need to be generated."""
        existing_names = await self.get_existing_diseases()
        existing_codes = await self.get_existing_icd10_codes()
        
        to_generate = []
        
        # Check priority diseases from generator
        priority_diseases = get_priority_diseases()
        for disease in priority_diseases:
            name_lower = disease['name'].lower()
            if name_lower not in existing_names:
                # Check if similar name exists
                found = False
                for e in existing_names:
                    if name_lower in e or e in name_lower:
                        found = True
                        break
                if not found:
                    to_generate.append(disease)
        
        # Check additional ICD-10 conditions
        for condition in ADDITIONAL_ICD10_CONDITIONS:
            icd_code = condition.get('icd10', '').upper()
            name_lower = condition['name'].lower()
            
            # Skip if ICD-10 code already exists
            if icd_code in existing_codes:
                continue
            
            # Skip if name already exists
            if name_lower in existing_names:
                continue
                
            # Check for similar names
            found = False
            for e in existing_names:
                if name_lower in e or e in name_lower:
                    found = True
                    break
            if not found:
                to_generate.append({
                    'name': condition['name'],
                    'category': condition['category'],
                    'icd10': condition.get('icd10', '')
                })
        
        # Remove duplicates
        seen = set()
        unique = []
        for d in to_generate:
            key = d['name'].lower()
            if key not in seen:
                seen.add(key)
                unique.append(d)
        
        return unique
    
    async def generate_disease(self, disease_info: Dict) -> Optional[Dict]:
        """Generate a single disease with comprehensive data."""
        name = disease_info['name']
        category = disease_info['category']
        icd10 = disease_info.get('icd10', '')
        
        logger.info(f"Generating: {name} ({category})")
        
        try:
            additional_context = f"ICD-10 Code: {icd10}" if icd10 else ""
            result = await self.generator.generate_disease_data(
                disease_name=name,
                category=category,
                additional_context=additional_context
            )
            
            if result:
                # Ensure ICD-10 code is set if provided
                if icd10 and not result.get('icd10_code'):
                    result['icd10_code'] = icd10
                
                logger.info(f"✓ Generated: {name}")
                return result
            else:
                logger.warning(f"✗ Failed to generate: {name}")
                return None
                
        except Exception as e:
            logger.error(f"Error generating {name}: {e}")
            return None
    
    async def save_disease(self, disease: Dict) -> bool:
        """Save a disease to the database."""
        try:
            disease_id = disease.get('id', disease['name'].lower().replace(' ', '_'))
            
            # Check if already exists
            existing = await self.db.diseases.find_one({'id': disease_id})
            if existing:
                # Update instead
                await self.db.diseases.update_one(
                    {'id': disease_id},
                    {'$set': disease}
                )
                logger.info(f"Updated existing: {disease['name']}")
            else:
                await self.db.diseases.insert_one(disease)
                logger.info(f"Inserted new: {disease['name']}")
            
            return True
        except Exception as e:
            logger.error(f"Error saving {disease.get('name', 'unknown')}: {e}")
            return False
    
    async def enhance_drug_disease_connections(self):
        """Enhance drug data with better disease connections."""
        logger.info("Enhancing drug-disease connections...")
        
        # Get all drugs
        drugs = await self.db.drugs_generated.find({}).to_list(500)
        
        # Get all diseases for matching
        diseases = await self.db.diseases.find({}, {'_id': 0, 'id': 1, 'name': 1, 'icd10_code': 1, 'category': 1}).to_list(500)
        disease_lookup = {d['name'].lower(): d for d in diseases}
        
        enhanced_count = 0
        
        for drug in drugs:
            drug_name = drug.get('name', '')
            drug_class = drug.get('drug_class', '').lower()
            category = drug.get('category', '').lower()
            
            # Current indications
            current_indications = drug.get('indications', [])
            if isinstance(current_indications, list) and len(current_indications) > 0:
                # Check if indications are properly linked to diseases
                new_indications = []
                for ind in current_indications:
                    if isinstance(ind, str):
                        # Try to find matching disease
                        ind_lower = ind.lower()
                        for disease_name, disease_data in disease_lookup.items():
                            if ind_lower in disease_name or disease_name in ind_lower:
                                new_indications.append({
                                    'disease_id': disease_data['id'],
                                    'disease_name': disease_data['name'],
                                    'icd10_code': disease_data.get('icd10_code', ''),
                                    'efficacy': 'moderate',
                                    'evidence_level': 'B'
                                })
                                break
                        else:
                            # Keep original string if no match
                            new_indications.append({'name': ind})
                    else:
                        new_indications.append(ind)
                
                if new_indications != current_indications:
                    await self.db.drugs_generated.update_one(
                        {'id': drug['id']},
                        {'$set': {'indications': new_indications}}
                    )
                    enhanced_count += 1
        
        logger.info(f"Enhanced {enhanced_count} drug-disease connections")
    
    async def run_expansion(self, batch_size: int = 5, max_diseases: int = None):
        """Run the full knowledge base expansion."""
        await self.connect()
        
        # Find diseases to generate
        to_generate = await self.find_diseases_to_generate()
        
        if max_diseases:
            to_generate = to_generate[:max_diseases]
        
        logger.info(f"Found {len(to_generate)} diseases to generate")
        
        if not to_generate:
            logger.info("No new diseases to generate!")
            await self.enhance_drug_disease_connections()
            return
        
        # Generate in batches
        success_count = 0
        fail_count = 0
        
        for i in range(0, len(to_generate), batch_size):
            batch = to_generate[i:i + batch_size]
            logger.info(f"\n--- Batch {i // batch_size + 1} ({len(batch)} diseases) ---")
            
            for disease_info in batch:
                result = await self.generate_disease(disease_info)
                if result:
                    saved = await self.save_disease(result)
                    if saved:
                        success_count += 1
                    else:
                        fail_count += 1
                else:
                    fail_count += 1
                
                # Small delay to avoid rate limiting
                await asyncio.sleep(1)
            
            # Progress report
            logger.info(f"Progress: {success_count} success, {fail_count} failed")
            
            # Longer delay between batches
            if i + batch_size < len(to_generate):
                logger.info("Waiting 5 seconds before next batch...")
                await asyncio.sleep(5)
        
        # Final enhancement
        await self.enhance_drug_disease_connections()
        
        # Summary
        logger.info("\n" + "=" * 50)
        logger.info("EXPANSION COMPLETE")
        logger.info(f"Generated: {success_count} diseases")
        logger.info(f"Failed: {fail_count} diseases")
        
        # Get updated stats
        total_diseases = await self.db.diseases.count_documents({})
        total_drugs = await self.db.drugs_generated.count_documents({})
        logger.info(f"Total diseases in database: {total_diseases}")
        logger.info(f"Total drugs in database: {total_drugs}")


async def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Expand PhiCore Knowledge Base')
    parser.add_argument('--batch-size', type=int, default=5, help='Batch size for generation')
    parser.add_argument('--max', type=int, default=None, help='Maximum diseases to generate')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be generated')
    
    args = parser.parse_args()
    
    expander = KnowledgeBaseExpander()
    
    if args.dry_run:
        await expander.connect()
        to_generate = await expander.find_diseases_to_generate()
        print(f"\nWould generate {len(to_generate)} diseases:")
        for d in to_generate[:30]:
            print(f"  - {d['name']} ({d['category']})")
        if len(to_generate) > 30:
            print(f"  ... and {len(to_generate) - 30} more")
    else:
        await expander.run_expansion(
            batch_size=args.batch_size,
            max_diseases=args.max
        )


if __name__ == "__main__":
    asyncio.run(main())
