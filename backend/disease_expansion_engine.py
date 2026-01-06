"""
PhiCor Disease Expansion Engine
================================
This script expands the disease database to include more ICD-10 codes.
It generates complete disease profiles using AI and the established schema.

Features:
- Batch generation of new diseases by category
- ICD-10 code integration
- Automatic parameter and symptom generation
- Mathematical model assignment
"""

import asyncio
import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import LLM client
try:
    from emergentintegrations.llm.chat import chat, LlmModel
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    logger.warning("emergentintegrations not available")

# Priority ICD-10 codes to add (most common/important diseases not in current database)
PRIORITY_DISEASES = {
    "cardiovascular": [
        {"icd10": "I25.10", "name": "Atherosclerotic Heart Disease", "description": "Chronic coronary artery disease with atherosclerotic plaque"},
        {"icd10": "I10", "name": "Essential Hypertension", "description": "Primary high blood pressure without identifiable cause"},
        {"icd10": "I63.9", "name": "Cerebral Infarction, Unspecified", "description": "Ischemic stroke"},
        {"icd10": "I70.0", "name": "Atherosclerosis of Aorta", "description": "Atherosclerotic disease of the aorta"},
        {"icd10": "I71.4", "name": "Abdominal Aortic Aneurysm", "description": "Pathological dilation of the abdominal aorta"},
        {"icd10": "I26.99", "name": "Other Pulmonary Embolism", "description": "Blood clot in pulmonary arteries"},
        {"icd10": "I42.0", "name": "Dilated Cardiomyopathy", "description": "Enlarged and weakened heart muscle"},
        {"icd10": "I44.2", "name": "Complete Heart Block", "description": "Third-degree AV block"},
    ],
    "respiratory": [
        {"icd10": "J44.1", "name": "COPD with Acute Exacerbation", "description": "Chronic obstructive pulmonary disease flare-up"},
        {"icd10": "J45.20", "name": "Mild Intermittent Asthma", "description": "Asthma with intermittent symptoms"},
        {"icd10": "J45.40", "name": "Moderate Persistent Asthma", "description": "Asthma with daily symptoms"},
        {"icd10": "J84.10", "name": "Pulmonary Fibrosis, Idiopathic", "description": "Progressive scarring of lung tissue"},
        {"icd10": "J80", "name": "Acute Respiratory Distress Syndrome", "description": "Severe inflammatory lung condition"},
        {"icd10": "J93.11", "name": "Primary Spontaneous Pneumothorax", "description": "Collapsed lung without underlying disease"},
        {"icd10": "J96.00", "name": "Acute Respiratory Failure", "description": "Sudden inability to maintain adequate gas exchange"},
    ],
    "endocrine": [
        {"icd10": "E11.9", "name": "Type 2 Diabetes Mellitus", "description": "Insulin-resistant diabetes"},
        {"icd10": "E10.9", "name": "Type 1 Diabetes Mellitus", "description": "Autoimmune destruction of pancreatic beta cells"},
        {"icd10": "E05.00", "name": "Hyperthyroidism", "description": "Overactive thyroid gland"},
        {"icd10": "E03.9", "name": "Hypothyroidism", "description": "Underactive thyroid gland"},
        {"icd10": "E21.0", "name": "Primary Hyperparathyroidism", "description": "Excess parathyroid hormone production"},
        {"icd10": "E24.0", "name": "Cushing Syndrome", "description": "Excess cortisol production"},
        {"icd10": "E27.1", "name": "Primary Adrenal Insufficiency", "description": "Addison's disease"},
        {"icd10": "E66.01", "name": "Morbid Obesity", "description": "BMI ≥40 or BMI ≥35 with comorbidities"},
    ],
    "gastrointestinal": [
        {"icd10": "K21.0", "name": "GERD with Esophagitis", "description": "Acid reflux with esophageal inflammation"},
        {"icd10": "K25.9", "name": "Gastric Ulcer", "description": "Peptic ulcer of the stomach"},
        {"icd10": "K50.90", "name": "Crohn's Disease", "description": "Inflammatory bowel disease affecting any part of GI tract"},
        {"icd10": "K51.90", "name": "Ulcerative Colitis", "description": "Inflammatory bowel disease of the colon"},
        {"icd10": "K70.30", "name": "Alcoholic Cirrhosis", "description": "End-stage liver disease from alcohol"},
        {"icd10": "K74.60", "name": "Cirrhosis, Unspecified", "description": "End-stage liver disease"},
        {"icd10": "K85.90", "name": "Acute Pancreatitis", "description": "Sudden inflammation of the pancreas"},
        {"icd10": "K80.20", "name": "Cholelithiasis with Acute Cholecystitis", "description": "Gallstones with inflamed gallbladder"},
    ],
    "neurological": [
        {"icd10": "G20", "name": "Parkinson's Disease", "description": "Progressive dopaminergic neurodegeneration"},
        {"icd10": "G30.9", "name": "Alzheimer's Disease", "description": "Progressive dementia with amyloid plaques"},
        {"icd10": "G35", "name": "Multiple Sclerosis", "description": "Autoimmune demyelinating disease"},
        {"icd10": "G40.909", "name": "Epilepsy, Unspecified", "description": "Recurrent unprovoked seizures"},
        {"icd10": "G43.909", "name": "Migraine", "description": "Recurrent headache disorder"},
        {"icd10": "G61.0", "name": "Guillain-Barré Syndrome", "description": "Acute inflammatory demyelinating polyneuropathy"},
        {"icd10": "G70.00", "name": "Myasthenia Gravis", "description": "Autoimmune neuromuscular junction disorder"},
    ],
    "infectious": [
        {"icd10": "A41.9", "name": "Sepsis, Unspecified", "description": "Life-threatening organ dysfunction from infection"},
        {"icd10": "B20", "name": "HIV Disease", "description": "Human immunodeficiency virus infection"},
        {"icd10": "A15.0", "name": "Pulmonary Tuberculosis", "description": "Mycobacterial lung infection"},
        {"icd10": "A04.72", "name": "Clostridioides difficile Colitis", "description": "C. diff infection of the colon"},
        {"icd10": "B00.9", "name": "Herpes Simplex Infection", "description": "HSV infection"},
        {"icd10": "A69.20", "name": "Lyme Disease", "description": "Borrelia burgdorferi infection"},
        {"icd10": "B27.90", "name": "Infectious Mononucleosis", "description": "EBV infection"},
    ],
    "renal": [
        {"icd10": "N17.9", "name": "Acute Kidney Injury", "description": "Sudden decline in kidney function"},
        {"icd10": "N18.6", "name": "End-Stage Renal Disease", "description": "Kidney failure requiring dialysis"},
        {"icd10": "N04.9", "name": "Nephrotic Syndrome", "description": "Heavy proteinuria with edema"},
        {"icd10": "N10", "name": "Acute Pyelonephritis", "description": "Upper urinary tract infection"},
        {"icd10": "N20.0", "name": "Nephrolithiasis", "description": "Kidney stones"},
        {"icd10": "N03.9", "name": "Chronic Nephritic Syndrome", "description": "Chronic glomerulonephritis"},
    ],
    "hematological": [
        {"icd10": "D50.9", "name": "Iron Deficiency Anemia", "description": "Anemia from iron deficiency"},
        {"icd10": "D64.9", "name": "Anemia, Unspecified", "description": "Low hemoglobin/red blood cells"},
        {"icd10": "D69.6", "name": "Thrombocytopenia", "description": "Low platelet count"},
        {"icd10": "D65", "name": "Disseminated Intravascular Coagulation", "description": "Systemic activation of coagulation"},
        {"icd10": "D68.9", "name": "Coagulation Disorder", "description": "Bleeding disorder"},
        {"icd10": "D57.1", "name": "Sickle Cell Disease with Crisis", "description": "Vaso-occlusive sickle cell crisis"},
    ],
    "rheumatological": [
        {"icd10": "M06.9", "name": "Rheumatoid Arthritis", "description": "Chronic inflammatory joint disease"},
        {"icd10": "M32.9", "name": "Systemic Lupus Erythematosus", "description": "Multisystem autoimmune disease"},
        {"icd10": "M10.9", "name": "Gout", "description": "Crystal arthropathy from uric acid"},
        {"icd10": "M45.9", "name": "Ankylosing Spondylitis", "description": "Inflammatory spine disease"},
        {"icd10": "M34.9", "name": "Systemic Sclerosis", "description": "Scleroderma"},
        {"icd10": "M35.9", "name": "Sjögren Syndrome", "description": "Autoimmune exocrine gland dysfunction"},
    ],
    "psychiatric": [
        {"icd10": "F32.9", "name": "Major Depressive Disorder", "description": "Clinical depression"},
        {"icd10": "F41.1", "name": "Generalized Anxiety Disorder", "description": "Chronic excessive worry"},
        {"icd10": "F31.9", "name": "Bipolar Disorder", "description": "Mood disorder with manic and depressive episodes"},
        {"icd10": "F20.9", "name": "Schizophrenia", "description": "Psychotic disorder"},
        {"icd10": "F43.10", "name": "Post-Traumatic Stress Disorder", "description": "Trauma-related anxiety disorder"},
        {"icd10": "F50.00", "name": "Anorexia Nervosa", "description": "Restrictive eating disorder"},
    ],
    "oncology": [
        {"icd10": "C34.90", "name": "Lung Cancer", "description": "Malignant neoplasm of lung"},
        {"icd10": "C50.919", "name": "Breast Cancer", "description": "Malignant neoplasm of breast"},
        {"icd10": "C61", "name": "Prostate Cancer", "description": "Malignant neoplasm of prostate"},
        {"icd10": "C18.9", "name": "Colon Cancer", "description": "Malignant neoplasm of colon"},
        {"icd10": "C22.0", "name": "Hepatocellular Carcinoma", "description": "Primary liver cancer"},
        {"icd10": "C25.9", "name": "Pancreatic Cancer", "description": "Malignant neoplasm of pancreas"},
        {"icd10": "C43.9", "name": "Malignant Melanoma", "description": "Aggressive skin cancer"},
        {"icd10": "C91.00", "name": "Acute Lymphoblastic Leukemia", "description": "ALL"},
        {"icd10": "C92.00", "name": "Acute Myeloid Leukemia", "description": "AML"},
    ]
}

DISEASE_GENERATION_PROMPT = """You are a medical expert AI assistant creating a comprehensive disease profile for the PhiCor clinical knowledge base.

Create a COMPLETE and ACCURATE disease profile for:
Disease: {disease_name}
ICD-10: {icd_code}
Category: {category}
Description: {description}

Generate a comprehensive JSON profile including ALL of the following sections:

1. BASIC INFORMATION:
- id (lowercase, underscores)
- name
- icd10_code
- category
- subcategory
- description (2-3 sentences)
- synonyms (list of alternative names)

2. EPIDEMIOLOGY:
- prevalence
- incidence
- mortality
- age_distribution
- sex_ratio
- risk_factors (list)
- protective_factors (list)

3. PATHOPHYSIOLOGY:
- mechanism (detailed description)
- molecular_basis
- progression

4. SYMPTOMS (5-10 key symptoms):
Each with: name, description, frequency (always/common/occasional/rare), onset (acute/subacute/chronic), sensitivity (0-100), specificity (0-100), associated_symptoms, red_flags

5. CLINICAL_SIGNS (5-10 physical exam findings):
Each with: name, description, examination_technique, frequency, sensitivity, specificity, interpretation

6. PARAMETER_MODIFICATIONS (by organ system):
For each affected organ system, include:
- parameters: dict of parameter_name -> {{direction, magnitude, typical_value, normal_range, unit, sensitivity, specificity}}
- symptoms: list of symptoms for this organ
- clinical_signs: list of signs for this organ
- lab_tests: list of relevant labs

Include systems: affected_organ, heart, blood, lungs, kidneys, liver, brain, cellular, molecular, endocrine, immune, etc.

7. DIAGNOSTIC_TESTS (5-10 tests):
Each with: name, type (laboratory/imaging/pathology/genetic/functional), description, sensitivity, specificity, expected_result, normal_range, interpretation_guide

8. DIAGNOSTIC_CRITERIA (if applicable):
- name (e.g., "DSM-5 Criteria")
- source
- major_criteria (list)
- minor_criteria (list)
- diagnosis_requires

9. DIFFERENTIAL_DIAGNOSIS (5-10 alternatives)

10. TREATMENTS (3-5 approaches):
Each with: name, type (pharmacological/surgical/interventional/supportive/lifestyle), description, indication, first_line (boolean), medications (if applicable with dose, route, frequency), monitoring, efficacy_evidence

11. PROGNOSIS:
- overall
- with_treatment
- without_treatment
- mortality_rate
- complications (list)

12. MATHEMATICAL_MODELS (2-5 relevant equations/scores):
Each with: name, category, equation, variables (with descriptions and units), interpretation, clinical_thresholds

Return ONLY valid JSON matching this structure exactly. Be medically accurate and comprehensive."""


class DiseaseExpansionEngine:
    def __init__(self, mongo_url: str, db_name: str, llm_key: str = None):
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        self.llm_key = llm_key
        self.stats = {
            "total_generated": 0,
            "successfully_added": 0,
            "failed": 0,
            "already_exists": 0
        }
    
    async def disease_exists(self, icd_code: str = None, name: str = None) -> bool:
        """Check if disease already exists in database"""
        query = {"$or": []}
        if icd_code:
            query["$or"].append({"icd10_code": icd_code})
        if name:
            query["$or"].append({"name": {"$regex": f"^{name}$", "$options": "i"}})
        
        if not query["$or"]:
            return False
            
        exists = await self.db.diseases.find_one(query)
        return exists is not None
    
    async def generate_disease_profile(self, disease_info: Dict) -> Optional[Dict]:
        """Generate a complete disease profile using AI"""
        if not LLM_AVAILABLE or not self.llm_key:
            logger.error("LLM not available for disease generation")
            return None
        
        try:
            prompt = DISEASE_GENERATION_PROMPT.format(
                disease_name=disease_info["name"],
                icd_code=disease_info["icd10"],
                category=disease_info.get("category", "general"),
                description=disease_info.get("description", "")
            )
            
            response = await asyncio.to_thread(
                chat,
                api_key=self.llm_key,
                prompt=prompt,
                model=LlmModel.GPT4O,
                response_format={"type": "json_object"}
            )
            
            disease_profile = json.loads(response.message)
            
            # Ensure required fields
            disease_profile["id"] = disease_profile.get("id", disease_info["name"].lower().replace(" ", "_").replace("-", "_"))
            disease_profile["icd10_code"] = disease_info["icd10"]
            disease_profile["category"] = disease_info.get("category", "general")
            disease_profile["clinical_data_filled"] = True
            disease_profile["ai_enhanced"] = True
            disease_profile["mathematical_models_added"] = True
            disease_profile["last_updated"] = datetime.now(timezone.utc).isoformat()
            disease_profile["model_version"] = "3.0-generated"
            
            return disease_profile
            
        except Exception as e:
            logger.error(f"Failed to generate disease profile for {disease_info['name']}: {e}")
            return None
    
    async def add_disease(self, disease_profile: Dict) -> bool:
        """Add new disease to database"""
        try:
            await self.db.diseases.insert_one(disease_profile)
            logger.info(f"Added new disease: {disease_profile['name']}")
            return True
        except Exception as e:
            logger.error(f"Failed to add disease {disease_profile.get('name')}: {e}")
            return False
    
    async def expand_category(self, category: str, limit: int = 5) -> Dict:
        """Expand diseases for a specific category"""
        diseases_to_add = PRIORITY_DISEASES.get(category, [])[:limit]
        
        for disease_info in diseases_to_add:
            disease_info["category"] = category
            
            # Check if already exists
            if await self.disease_exists(disease_info["icd10"], disease_info["name"]):
                logger.info(f"Disease already exists: {disease_info['name']}")
                self.stats["already_exists"] += 1
                continue
            
            # Generate profile
            profile = await self.generate_disease_profile(disease_info)
            
            if profile:
                # Remove _id if present (for MongoDB)
                profile.pop("_id", None)
                
                if await self.add_disease(profile):
                    self.stats["successfully_added"] += 1
                else:
                    self.stats["failed"] += 1
            else:
                self.stats["failed"] += 1
            
            self.stats["total_generated"] += 1
            
            # Small delay to avoid rate limiting
            await asyncio.sleep(2)
        
        return self.stats
    
    async def expand_all_categories(self, limit_per_category: int = 3) -> Dict:
        """Expand diseases across all categories"""
        for category in PRIORITY_DISEASES.keys():
            logger.info(f"Expanding category: {category}")
            await self.expand_category(category, limit_per_category)
        
        return self.stats
    
    async def get_coverage_report(self) -> Dict:
        """Generate a report on ICD-10 coverage"""
        total_diseases = await self.db.diseases.count_documents({})
        
        # Count by category
        pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        categories = await self.db.diseases.aggregate(pipeline).to_list(100)
        
        # Count diseases with complete data
        complete = await self.db.diseases.count_documents({
            "symptoms": {"$exists": True, "$ne": []},
            "diagnostic_tests": {"$exists": True, "$ne": []},
            "treatments": {"$exists": True, "$ne": []}
        })
        
        return {
            "total_diseases": total_diseases,
            "complete_profiles": complete,
            "incomplete_profiles": total_diseases - complete,
            "by_category": {c["_id"]: c["count"] for c in categories},
            "priority_diseases_pending": {
                cat: len([d for d in diseases if not await self.disease_exists(d["icd10"])])
                for cat, diseases in list(PRIORITY_DISEASES.items())[:3]  # Sample
            }
        }


async def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="PhiCor Disease Expansion Engine")
    parser.add_argument("--category", type=str, help="Category to expand")
    parser.add_argument("--limit", type=int, default=5, help="Diseases per category")
    parser.add_argument("--all", action="store_true", help="Expand all categories")
    parser.add_argument("--report", action="store_true", help="Generate coverage report")
    
    args = parser.parse_args()
    
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "test_database")
    llm_key = os.environ.get("EMERGENT_LLM_KEY")
    
    engine = DiseaseExpansionEngine(mongo_url, db_name, llm_key)
    
    if args.report:
        report = await engine.get_coverage_report()
        print(json.dumps(report, indent=2, default=str))
    elif args.all:
        stats = await engine.expand_all_categories(args.limit)
        print(f"Expansion complete: {stats}")
    elif args.category:
        stats = await engine.expand_category(args.category, args.limit)
        print(f"Expansion complete: {stats}")
    else:
        print("Please specify --category, --all, or --report")


if __name__ == "__main__":
    asyncio.run(main())
