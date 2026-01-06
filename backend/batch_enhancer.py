"""
PhiCor Batch Enhancement Runner
================================
Runs disease enhancement in batches using the Emergent LLM API.
"""

import asyncio
import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

ENHANCEMENT_PROMPT = """For the disease "{disease_name}" (ICD-10: {icd_code}, Category: {category}), provide comprehensive clinical data.

Current parameter systems: {current_params}

Return ONLY valid JSON with these sections:

{{
  "symptoms": [
    {{"name": "symptom name", "description": "detailed description", "frequency": "always/common/occasional/rare", "onset": "acute/subacute/chronic", "sensitivity": 0-100, "specificity": 0-100, "associated_symptoms": ["list"], "red_flags": ["list"]}}
  ],
  "clinical_signs": [
    {{"name": "sign name", "description": "what is observed", "examination_technique": "how to elicit", "frequency": "always/common/occasional/rare", "sensitivity": 0-100, "specificity": 0-100, "interpretation": "clinical meaning"}}
  ],
  "diagnostic_tests": [
    {{"name": "test name", "type": "laboratory/imaging/pathology/functional", "description": "what it measures", "sensitivity": 0-100, "specificity": 0-100, "expected_result": "in this disease", "normal_range": "reference range", "interpretation_guide": "how to interpret"}}
  ],
  "treatments": [
    {{"name": "treatment name", "type": "pharmacological/surgical/interventional/supportive/lifestyle", "description": "mechanism", "indication": "when to use", "first_line": true/false, "medications": [{{"generic_name": "name", "dose": "dose range", "route": "oral/IV/etc", "frequency": "timing", "monitoring": ["parameters"]}}], "efficacy_evidence": "strength of evidence"}}
  ],
  "mathematical_models": [
    {{"name": "model/equation name", "category": "diagnostic/prognostic/physiologic/pharmacokinetic", "equation": "formula in text", "equation_latex": "LaTeX version", "variables": {{"var": {{"description": "what it is", "unit": "unit", "normal": "normal range"}}}}, "interpretation": "what result means", "clinical_thresholds": {{"threshold": "interpretation"}}, "when_to_use": "clinical application", "limitations": ["list"]}}
  ],
  "differential_diagnosis": ["disease1", "disease2"],
  "complications": ["complication1", "complication2"],
  "prognosis": {{"overall": "description", "with_treatment": "outcome", "without_treatment": "outcome", "mortality_rate": "percentage", "5_year_survival": "percentage"}}
}}

Requirements:
- 8 symptoms with sensitivity/specificity values
- 6 clinical signs with examination techniques
- 8 diagnostic tests with performance characteristics
- 5 treatments including first-line options
- 4 mathematical models/equations relevant to this disease
- Be medically accurate based on current guidelines
- Include only evidence-based information

Return ONLY the JSON object, no markdown formatting."""


class BatchEnhancer:
    def __init__(self, llm_key: str, mongo_url: str = "mongodb://localhost:27017", db_name: str = "test_database"):
        self.llm_key = llm_key
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        self.stats = {
            "total": 0,
            "enhanced": 0,
            "failed": 0,
            "skipped": 0
        }
    
    async def get_diseases(self, category: str = None, limit: int = 10, skip_enhanced: bool = True) -> List[Dict]:
        """Get diseases to enhance"""
        query = {}
        if category:
            query["category"] = category
        if skip_enhanced:
            query["$or"] = [
                {"ai_enhanced": {"$ne": True}},
                {"mathematical_models": {"$exists": False}},
                {"mathematical_models": {"$size": 0}}
            ]
        
        diseases = await self.db.diseases.find(query, {"_id": 0}).limit(limit).to_list(limit)
        return diseases
    
    async def enhance_disease(self, disease: Dict) -> Dict:
        """Enhance a single disease using AI"""
        try:
            session_id = str(uuid.uuid4())
            system_msg = "You are a medical expert. Return only valid JSON without any markdown formatting or explanation."
            
            prompt = ENHANCEMENT_PROMPT.format(
                disease_name=disease.get("name", "Unknown"),
                icd_code=disease.get("icd10_code", "Unknown"),
                category=disease.get("category", "Unknown"),
                current_params=list(disease.get("parameter_modifications", {}).keys())
            )
            
            llm = LlmChat(api_key=self.llm_key, session_id=session_id, system_message=system_msg)
            user_msg = UserMessage(text=prompt)
            response = await llm.send_message(user_msg)
            
            response_text = response.message if hasattr(response, 'message') else str(response)
            
            # Parse JSON
            text = str(response_text)
            if "```json" in text:
                json_str = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                json_str = text.split("```")[1].split("```")[0]
            else:
                start = text.find('{')
                end = text.rfind('}') + 1
                json_str = text[start:end] if start >= 0 else text
            
            enhancement = json.loads(json_str.strip())
            
            # Merge with existing disease
            disease.update({
                "symptoms": enhancement.get("symptoms", []),
                "clinical_signs": enhancement.get("clinical_signs", []),
                "diagnostic_tests": enhancement.get("diagnostic_tests", []),
                "treatments": enhancement.get("treatments", []),
                "mathematical_models": enhancement.get("mathematical_models", []),
                "differential_diagnosis": enhancement.get("differential_diagnosis", []),
                "complications": enhancement.get("complications", []),
                "prognosis": enhancement.get("prognosis", {}),
                "ai_enhanced": True,
                "mathematical_models_added": True,
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "model_version": "3.0-enhanced"
            })
            
            return disease
            
        except Exception as e:
            logger.error(f"Enhancement failed for {disease.get('name')}: {e}")
            raise
    
    async def save_disease(self, disease: Dict):
        """Save enhanced disease"""
        await self.db.diseases.update_one(
            {"id": disease["id"]},
            {"$set": disease}
        )
    
    async def run_batch(self, category: str = None, limit: int = 10, delay: float = 2.0):
        """Run batch enhancement"""
        diseases = await self.get_diseases(category, limit)
        logger.info(f"Found {len(diseases)} diseases to enhance")
        
        self.stats["total"] = len(diseases)
        
        for i, disease in enumerate(diseases):
            try:
                logger.info(f"[{i+1}/{len(diseases)}] Enhancing: {disease.get('name')}")
                
                enhanced = await self.enhance_disease(disease)
                await self.save_disease(enhanced)
                
                self.stats["enhanced"] += 1
                logger.info(f"  ✅ Enhanced with {len(enhanced.get('symptoms', []))} symptoms, {len(enhanced.get('mathematical_models', []))} models")
                
                # Rate limiting
                await asyncio.sleep(delay)
                
            except Exception as e:
                self.stats["failed"] += 1
                logger.error(f"  ❌ Failed: {e}")
        
        return self.stats
    
    async def get_progress_report(self) -> Dict:
        """Get enhancement progress"""
        total = await self.db.diseases.count_documents({})
        enhanced = await self.db.diseases.count_documents({"ai_enhanced": True})
        with_models = await self.db.diseases.count_documents({
            "mathematical_models": {"$exists": True, "$ne": []}
        })
        
        return {
            "total_diseases": total,
            "ai_enhanced": enhanced,
            "with_math_models": with_models,
            "enhancement_percentage": f"{(enhanced/total)*100:.1f}%" if total > 0 else "0%"
        }


async def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="PhiCor Batch Enhancement")
    parser.add_argument("--category", type=str, help="Category to enhance")
    parser.add_argument("--limit", type=int, default=10, help="Number of diseases")
    parser.add_argument("--delay", type=float, default=2.0, help="Delay between API calls")
    parser.add_argument("--report", action="store_true", help="Show progress report")
    
    args = parser.parse_args()
    
    llm_key = os.environ.get("EMERGENT_LLM_KEY")
    if not llm_key:
        print("Error: EMERGENT_LLM_KEY not set")
        return
    
    enhancer = BatchEnhancer(llm_key)
    
    if args.report:
        report = await enhancer.get_progress_report()
        print(json.dumps(report, indent=2))
    else:
        stats = await enhancer.run_batch(args.category, args.limit, args.delay)
        print(f"\n📊 Enhancement Complete: {stats}")
        
        report = await enhancer.get_progress_report()
        print(f"📈 Overall Progress: {report}")


if __name__ == "__main__":
    asyncio.run(main())
