"""
PhiCor Smart Disease Enhancement Engine
========================================
A more intelligent enhancement engine that:
1. Processes diseases in priority order (most common first)
2. Handles errors gracefully with retries
3. Saves progress continuously
4. Can be resumed after interruption
5. Provides detailed logging and progress tracking
"""

import asyncio
import os
import json
import logging
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
import re

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/app/backend/enhancement_progress.log')
    ]
)
logger = logging.getLogger(__name__)

# Import LLM
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    logger.warning("emergentintegrations not available")

# Mathematical equations by category
CATEGORY_EQUATIONS = {
    "cardiovascular": [
        {"name": "Cardiac Output (Fick)", "equation": "CO = VO₂ / (CaO₂ - CvO₂)", "category": "physiologic"},
        {"name": "Ejection Fraction", "equation": "EF = (EDV - ESV) / EDV × 100%", "category": "diagnostic"},
        {"name": "Mean Arterial Pressure", "equation": "MAP = DBP + ⅓(SBP - DBP)", "category": "physiologic"},
        {"name": "Stroke Volume", "equation": "SV = CO / HR", "category": "physiologic"},
    ],
    "respiratory": [
        {"name": "A-a Gradient", "equation": "A-a = PAO₂ - PaO₂", "category": "diagnostic"},
        {"name": "PaO₂/FiO₂ Ratio", "equation": "P/F = PaO₂ / FiO₂", "category": "diagnostic"},
        {"name": "Alveolar Gas Equation", "equation": "PAO₂ = FiO₂(Patm - PH₂O) - PaCO₂/RQ", "category": "physiologic"},
    ],
    "renal": [
        {"name": "GFR (CKD-EPI)", "equation": "GFR = 141 × min(SCr/κ,1)^α × max(SCr/κ,1)^-1.209 × 0.993^Age", "category": "diagnostic"},
        {"name": "Fractional Excretion of Sodium", "equation": "FENa = (UNa × PCr) / (PNa × UCr) × 100", "category": "diagnostic"},
        {"name": "Anion Gap", "equation": "AG = Na - (Cl + HCO₃)", "category": "diagnostic"},
    ],
    "endocrine": [
        {"name": "BMI", "equation": "BMI = weight(kg) / height(m)²", "category": "diagnostic"},
        {"name": "HOMA-IR", "equation": "HOMA-IR = (Glucose × Insulin) / 405", "category": "diagnostic"},
        {"name": "Corrected Calcium", "equation": "Ca_corrected = Ca + 0.8(4.0 - Albumin)", "category": "diagnostic"},
    ],
    "hematological": [
        {"name": "Corrected Reticulocyte Count", "equation": "CRC = Retic% × (Hct/45)", "category": "diagnostic"},
        {"name": "Absolute Neutrophil Count", "equation": "ANC = WBC × (% Neutrophils + % Bands) / 100", "category": "diagnostic"},
    ],
    "neurological": [
        {"name": "Glasgow Coma Scale", "equation": "GCS = Eye + Verbal + Motor (3-15)", "category": "prognostic"},
        {"name": "NIHSS Score", "equation": "Sum of 11 neurological domains (0-42)", "category": "prognostic"},
    ],
    "infectious": [
        {"name": "qSOFA Score", "equation": "qSOFA = RR≥22 + SBP≤100 + Altered mentation (0-3)", "category": "prognostic"},
        {"name": "CURB-65 Score", "equation": "Score = C + U + R + B + 65 (0-5)", "category": "prognostic"},
    ],
    "gastrointestinal": [
        {"name": "MELD Score", "equation": "MELD = 3.78×ln(bilirubin) + 11.2×ln(INR) + 9.57×ln(creatinine) + 6.43", "category": "prognostic"},
        {"name": "Child-Pugh Score", "equation": "Sum of 5 parameters (5-15)", "category": "prognostic"},
    ]
}

# Priority categories (process these first)
PRIORITY_ORDER = [
    "cardiovascular", "respiratory", "infectious", "neurological", "renal",
    "endocrine", "gastrointestinal", "hematological", "oncology", 
    "rheumatological", "psychiatric", "dermatological", "pediatric", "general"
]

ENHANCEMENT_PROMPT = """You are a medical expert AI. For the disease "{disease_name}" (ICD-10: {icd_code}), provide comprehensive clinical data.

Return ONLY a valid JSON object with these sections (no markdown, no explanation):

{{
  "symptoms": [
    {{"name": "symptom", "frequency": "common/occasional/rare", "sensitivity": 70, "specificity": 80}}
  ],
  "clinical_signs": [
    {{"name": "sign", "description": "finding", "frequency": "common"}}
  ],
  "diagnostic_tests": [
    {{"name": "test", "type": "laboratory/imaging", "sensitivity": 85, "specificity": 90, "expected_result": "finding"}}
  ],
  "treatments": [
    {{"name": "treatment", "type": "pharmacological/surgical/lifestyle", "first_line": true, "indication": "when to use", "medications": [{{"generic_name": "drug", "dose": "dosage"}}]}}
  ],
  "mathematical_models": [
    {{"name": "equation name", "category": "diagnostic/prognostic", "equation": "formula", "variables": {{"var": {{"description": "desc", "unit": "unit"}}}}, "interpretation": "meaning"}}
  ],
  "complications": ["complication1", "complication2"],
  "prognosis": {{"overall": "description", "with_treatment": "outcome", "mortality_rate": "X%"}}
}}

Include:
- 5-8 symptoms with sensitivity/specificity (0-100)
- 4-6 clinical signs
- 5-8 diagnostic tests
- 4-6 treatments with medications
- 3-5 mathematical models relevant to this disease
- Be medically accurate based on current guidelines

RETURN ONLY THE JSON OBJECT."""


class SmartEnhancer:
    def __init__(self, llm_key: str, mongo_url: str = "mongodb://localhost:27017"):
        self.llm_key = llm_key
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client['test_database']
        self.stats = {
            "total_processed": 0,
            "enhanced": 0,
            "failed": 0,
            "skipped": 0,
            "start_time": time.time()
        }
        self.errors = []
    
    async def get_progress(self) -> Dict:
        """Get current enhancement progress"""
        total = await self.db.diseases.count_documents({})
        enhanced = await self.db.diseases.count_documents({
            'mathematical_models': {'$exists': True, '$ne': []},
            'symptoms': {'$exists': True, '$ne': []},
            'treatments': {'$exists': True, '$ne': []}
        })
        
        # Get by category
        pipeline = [
            {'$match': {'mathematical_models': {'$exists': True, '$ne': []}}},
            {'$group': {'_id': '$category', 'count': {'$sum': 1}}}
        ]
        by_category = await self.db.diseases.aggregate(pipeline).to_list(100)
        
        return {
            "total": total,
            "enhanced": enhanced,
            "remaining": total - enhanced,
            "percentage": round(enhanced / total * 100, 1) if total > 0 else 0,
            "by_category": {c['_id']: c['count'] for c in by_category}
        }
    
    async def get_next_batch(self, batch_size: int = 10) -> List[Dict]:
        """Get next batch of diseases to enhance, prioritized by category"""
        # Find diseases without full enhancement
        query = {
            '$or': [
                {'mathematical_models': {'$exists': False}},
                {'mathematical_models': {'$size': 0}},
                {'symptoms': {'$exists': False}},
                {'symptoms': {'$size': 0}},
                {'treatments': {'$exists': False}},
                {'treatments': {'$size': 0}}
            ]
        }
        
        diseases = []
        
        # Get diseases in priority order
        for category in PRIORITY_ORDER:
            cat_query = {**query, 'category': category}
            batch = await self.db.diseases.find(cat_query, {'_id': 0}).limit(batch_size - len(diseases)).to_list(batch_size - len(diseases))
            diseases.extend(batch)
            
            if len(diseases) >= batch_size:
                break
        
        # If still need more, get any remaining
        if len(diseases) < batch_size:
            remaining = await self.db.diseases.find(query, {'_id': 0}).limit(batch_size - len(diseases)).to_list(batch_size - len(diseases))
            for d in remaining:
                if d not in diseases:
                    diseases.append(d)
        
        return diseases[:batch_size]
    
    def get_category_equations(self, category: str) -> List[Dict]:
        """Get standard equations for a category"""
        # Normalize category name
        cat = category.lower().replace('_', '').replace('-', '')
        
        for key, equations in CATEGORY_EQUATIONS.items():
            if key in cat or cat in key:
                return equations
        
        # Default equations for all diseases
        return [
            {"name": "Body Mass Index", "equation": "BMI = weight(kg) / height(m)²", "category": "diagnostic"},
        ]
    
    async def enhance_disease(self, disease: Dict, retry_count: int = 2) -> bool:
        """Enhance a single disease with AI-generated data"""
        disease_name = disease.get('name', 'Unknown')
        disease_id = disease.get('id')
        
        for attempt in range(retry_count + 1):
            try:
                logger.info(f"Enhancing: {disease_name} (attempt {attempt + 1})")
                
                # Create LLM request
                session_id = str(uuid.uuid4())
                llm = LlmChat(
                    api_key=self.llm_key,
                    session_id=session_id,
                    system_message="You are a medical expert. Return only valid JSON."
                )
                
                prompt = ENHANCEMENT_PROMPT.format(
                    disease_name=disease_name,
                    icd_code=disease.get('icd10_code', 'Unknown')
                )
                
                response = await llm.send_message(UserMessage(text=prompt))
                
                # Parse response - handle both string and object responses
                if hasattr(response, 'text'):
                    text = response.text.strip()
                elif isinstance(response, str):
                    text = response.strip()
                else:
                    text = str(response).strip()
                
                # Clean markdown if present
                if text.startswith('```'):
                    text = re.sub(r'^```\w*\n?', '', text)
                    text = re.sub(r'\n?```$', '', text)
                
                data = json.loads(text)
                
                # Add category-specific equations if not enough
                if len(data.get('mathematical_models', [])) < 3:
                    category_eqs = self.get_category_equations(disease.get('category', 'general'))
                    existing_names = [m.get('name', '').lower() for m in data.get('mathematical_models', [])]
                    for eq in category_eqs:
                        if eq['name'].lower() not in existing_names:
                            data.setdefault('mathematical_models', []).append(eq)
                
                # Update database
                update_data = {
                    'symptoms': data.get('symptoms', []),
                    'clinical_signs': data.get('clinical_signs', []),
                    'diagnostic_tests': data.get('diagnostic_tests', []),
                    'treatments': data.get('treatments', []),
                    'mathematical_models': data.get('mathematical_models', []),
                    'complications': data.get('complications', []),
                    'prognosis': data.get('prognosis', {}),
                    'fully_enhanced': True,
                    'enhancement_date': datetime.now(timezone.utc).isoformat(),
                    'enhancement_version': '2.0'
                }
                
                # Update the disease
                result = await self.db.diseases.update_one(
                    {'id': disease_id},
                    {'$set': update_data}
                )
                
                if result.modified_count > 0:
                    logger.info(f"✅ Enhanced: {disease_name}")
                    self.stats['enhanced'] += 1
                    return True
                else:
                    logger.warning(f"⚠️ No changes for: {disease_name}")
                    self.stats['skipped'] += 1
                    return False
                    
            except json.JSONDecodeError as e:
                logger.warning(f"JSON parse error for {disease_name}: {e}")
                if attempt < retry_count:
                    await asyncio.sleep(2)
                    continue
                    
            except Exception as e:
                logger.error(f"Error enhancing {disease_name}: {e}")
                if attempt < retry_count:
                    await asyncio.sleep(3)
                    continue
        
        self.stats['failed'] += 1
        self.errors.append(disease_name)
        return False
    
    async def run_batch(self, batch_size: int = 10, delay: float = 1.5) -> Dict:
        """Run enhancement on a batch of diseases"""
        diseases = await self.get_next_batch(batch_size)
        
        if not diseases:
            logger.info("No diseases to enhance!")
            return self.stats
        
        logger.info(f"Processing batch of {len(diseases)} diseases...")
        
        for i, disease in enumerate(diseases):
            self.stats['total_processed'] += 1
            await self.enhance_disease(disease)
            
            # Progress log
            if (i + 1) % 5 == 0:
                progress = await self.get_progress()
                logger.info(f"Progress: {progress['enhanced']}/{progress['total']} ({progress['percentage']}%)")
            
            # Rate limiting
            await asyncio.sleep(delay)
        
        return self.stats
    
    async def run_continuous(self, batch_size: int = 10, max_batches: int = 100):
        """Run continuous enhancement until all diseases are done"""
        logger.info("=" * 60)
        logger.info("STARTING CONTINUOUS ENHANCEMENT")
        logger.info("=" * 60)
        
        initial_progress = await self.get_progress()
        logger.info(f"Initial state: {initial_progress['enhanced']}/{initial_progress['total']} enhanced")
        
        batch_count = 0
        
        while batch_count < max_batches:
            batch_count += 1
            
            # Check remaining
            progress = await self.get_progress()
            if progress['remaining'] == 0:
                logger.info("🎉 All diseases fully enhanced!")
                break
            
            logger.info(f"\n--- Batch {batch_count}/{max_batches} ---")
            logger.info(f"Remaining: {progress['remaining']} diseases")
            
            await self.run_batch(batch_size=batch_size, delay=1.5)
            
            # Summary
            elapsed = time.time() - self.stats['start_time']
            rate = self.stats['enhanced'] / elapsed * 60 if elapsed > 0 else 0
            
            logger.info(f"Stats: Enhanced={self.stats['enhanced']}, Failed={self.stats['failed']}")
            logger.info(f"Rate: {rate:.1f} diseases/minute")
            
            # Brief pause between batches
            await asyncio.sleep(2)
        
        # Final report
        final_progress = await self.get_progress()
        logger.info("\n" + "=" * 60)
        logger.info("ENHANCEMENT SESSION COMPLETE")
        logger.info("=" * 60)
        logger.info(f"Total processed: {self.stats['total_processed']}")
        logger.info(f"Successfully enhanced: {self.stats['enhanced']}")
        logger.info(f"Failed: {self.stats['failed']}")
        logger.info(f"Database status: {final_progress['enhanced']}/{final_progress['total']} ({final_progress['percentage']}%)")
        
        if self.errors:
            logger.info(f"Failed diseases: {self.errors[:10]}...")
        
        return self.stats


async def main():
    """Main entry point"""
    llm_key = os.environ.get('EMERGENT_LLM_KEY')
    
    if not llm_key:
        logger.error("EMERGENT_LLM_KEY not set!")
        return
    
    enhancer = SmartEnhancer(llm_key=llm_key)
    
    # Run continuous enhancement (process up to 500 diseases per session)
    await enhancer.run_continuous(batch_size=10, max_batches=50)


if __name__ == "__main__":
    asyncio.run(main())
