#!/usr/bin/env python3
"""
Generate parameter_modifications for diseases that don't have them.
This enables the Mathematical Human Body dashboard to show how each disease
affects physiological parameters.
"""

import asyncio
import os
import sys
import json
import re
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from motor.motor_asyncio import AsyncIOMotorClient

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/param_generation.log'),
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


PARAM_GEN_PROMPT = """You are a clinical medicine expert and systems biologist. Generate COMPREHENSIVE clinical parameter modifications for: {disease_name}

MISSION: Transform ALL medical knowledge about this disease from text into QUANTIFIABLE PARAMETERS. Every clinical finding must be expressed mathematically as a deviation from normal.

Return a JSON object with this structure:
{{
    "disease_id": "{disease_id}",
    "disease_name": "{disease_name}",
    "parameter_modifications": {{
        
        // === VITAL SIGNS (heart organ, vital_signs scale) ===
        "heart": {{
            "vital_signs": {{
                "systolic_bp": {{ "change_percent": X, "direction": "increase/decrease", "evidence": "..." }},
                "diastolic_bp": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "resting_hr": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "physical_exam": {{
                "s3_present": {{ "value": 1, "direction": "increase", "evidence": "Heart failure" }},
                "jvp": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "lab_tests": {{
                "troponin_i": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "bnp": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "crp": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "imaging": {{
                "echo_ef": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }}
        }},
        
        // === BLOOD COUNTS ===
        "blood": {{
            "geometry": {{
                "rbc_count": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "wbc_count": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "platelet_count": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "physiology": {{
                "hemoglobin": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "esr": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "lab_tests": {{
                "neutrophils_absolute": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "lymphocytes_absolute": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }}
        }},
        
        // === METABOLIC PANEL ===
        "kidneys": {{
            "lab_tests": {{
                "creatinine": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "bun": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "egfr": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "sodium": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "potassium": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }}
        }},
        
        // === LIVER FUNCTION ===
        "liver": {{
            "lab_tests": {{
                "ast": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "alt": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "albumin": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "bilirubin_total": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }}
        }},
        
        // === RESPIRATORY ===
        "lungs": {{
            "physiology": {{
                "spo2": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "respiratory_rate": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "fev1": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }}
        }},
        
        // === MOLECULAR/GENETIC (if applicable) ===
        "cellular": {{
            "gene_expression": {{
                // Disease-specific gene markers
            }},
            "molecular": {{
                // Disease-specific molecular markers
            }}
        }}
    }}
}}

CRITICAL RULES:
1. ONLY include parameters that this disease actually affects based on medical evidence
2. Use realistic change_percent values (e.g., 10-500% for significant changes)
3. Include "evidence" field citing the clinical rationale
4. If a parameter is not affected, DO NOT include it
5. Focus on the PRIMARY organ systems affected by this disease
6. Include any unique biomarkers or molecular findings specific to this disease

Return ONLY the JSON object, no additional text."""


class ParameterModificationGenerator:
    """Generates parameter_modifications for diseases."""
    
    def __init__(self):
        self.mongo_url = os.environ.get('MONGO_URL')
        self.db_name = os.environ.get('DB_NAME', 'test_database')
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        self.client = None
        self.db = None
        
    async def connect(self):
        """Connect to MongoDB."""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        logger.info(f"Connected to database: {self.db_name}")
        
    async def get_diseases_without_params(self) -> list:
        """Get diseases that need parameter_modifications."""
        diseases = await self.db.diseases.find(
            {'$or': [
                {'parameter_modifications': {'$exists': False}},
                {'parameter_modifications': {}},
                {'parameter_modifications': None}
            ]},
            {'_id': 0, 'id': 1, 'name': 1, 'category': 1}
        ).to_list(500)
        return diseases
    
    async def generate_params(self, disease_id: str, disease_name: str) -> Optional[Dict]:
        """Generate parameter_modifications for a disease."""
        if not EMERGENT_AVAILABLE or not self.api_key:
            logger.error("LLM not available")
            return None
            
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"param_gen_{disease_id}",
                system_message="You are a medical expert that generates precise physiological parameter modifications for diseases. Return only valid JSON."
            ).with_model("openai", "gpt-4o")
            
            prompt = PARAM_GEN_PROMPT.format(
                disease_name=disease_name,
                disease_id=disease_id
            )
            
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Parse JSON
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                data = json.loads(json_match.group())
                return data.get('parameter_modifications', data)
            
            logger.warning(f"Could not parse JSON for {disease_name}")
            return None
            
        except Exception as e:
            logger.error(f"Error generating params for {disease_name}: {e}")
            return None
    
    async def update_disease_params(self, disease_id: str, params: Dict) -> bool:
        """Update disease with parameter_modifications."""
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
        """Run parameter generation for all diseases that need it."""
        await self.connect()
        
        diseases = await self.get_diseases_without_params()
        
        if max_count:
            diseases = diseases[:max_count]
        
        logger.info(f"Found {len(diseases)} diseases needing parameter_modifications")
        
        if not diseases:
            logger.info("All diseases have parameter_modifications!")
            return
        
        success_count = 0
        fail_count = 0
        
        for i, disease in enumerate(diseases):
            disease_id = disease['id']
            disease_name = disease['name']
            
            logger.info(f"[{i+1}/{len(diseases)}] Generating params for: {disease_name}")
            
            params = await self.generate_params(disease_id, disease_name)
            
            if params:
                updated = await self.update_disease_params(disease_id, params)
                if updated:
                    success_count += 1
                    logger.info(f"✓ Updated: {disease_name}")
                else:
                    fail_count += 1
                    logger.warning(f"✗ Failed to update: {disease_name}")
            else:
                fail_count += 1
                logger.warning(f"✗ Failed to generate: {disease_name}")
            
            # Rate limiting
            await asyncio.sleep(1)
            
            # Batch delay
            if (i + 1) % batch_size == 0 and i + 1 < len(diseases):
                logger.info(f"Progress: {success_count} success, {fail_count} failed")
                logger.info("Waiting 3 seconds before next batch...")
                await asyncio.sleep(3)
        
        logger.info("\n" + "=" * 50)
        logger.info("PARAMETER GENERATION COMPLETE")
        logger.info(f"Success: {success_count}")
        logger.info(f"Failed: {fail_count}")


async def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate parameter_modifications for diseases')
    parser.add_argument('--batch-size', type=int, default=3, help='Batch size')
    parser.add_argument('--max', type=int, default=None, help='Maximum diseases to process')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be generated')
    
    args = parser.parse_args()
    
    generator = ParameterModificationGenerator()
    
    if args.dry_run:
        await generator.connect()
        diseases = await generator.get_diseases_without_params()
        print(f"\nWould generate params for {len(diseases)} diseases:")
        for d in diseases[:20]:
            print(f"  - {d['name']} ({d.get('category', 'unknown')})")
        if len(diseases) > 20:
            print(f"  ... and {len(diseases) - 20} more")
    else:
        await generator.run(batch_size=args.batch_size, max_count=args.max)


if __name__ == "__main__":
    asyncio.run(main())
