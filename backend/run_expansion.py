"""
PhiCor Disease Expansion - Run Script
Adds new diseases from priority ICD-10 codes
"""
import asyncio
import os
import json
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid

# Priority diseases to add
NEW_DISEASES = [
    {"name": "Essential Hypertension", "icd10": "I10", "category": "cardiovascular"},
    {"name": "Type 2 Diabetes Mellitus", "icd10": "E11.9", "category": "endocrine"},
    {"name": "Major Depressive Disorder", "icd10": "F32.9", "category": "psychiatric"},
    {"name": "Chronic Obstructive Pulmonary Disease", "icd10": "J44.9", "category": "respiratory"},
    {"name": "Osteoarthritis", "icd10": "M19.90", "category": "rheumatological"},
    {"name": "Gastroesophageal Reflux Disease", "icd10": "K21.0", "category": "gastrointestinal"},
    {"name": "Hypothyroidism", "icd10": "E03.9", "category": "endocrine"},
    {"name": "Iron Deficiency Anemia", "icd10": "D50.9", "category": "hematological"},
    {"name": "Acute Kidney Injury", "icd10": "N17.9", "category": "renal"},
    {"name": "Sepsis", "icd10": "A41.9", "category": "infectious"},
    {"name": "Migraine", "icd10": "G43.909", "category": "neurological"},
    {"name": "Generalized Anxiety Disorder", "icd10": "F41.1", "category": "psychiatric"},
    {"name": "Parkinson's Disease", "icd10": "G20", "category": "neurological"},
    {"name": "Rheumatoid Arthritis", "icd10": "M06.9", "category": "rheumatological"},
    {"name": "Pulmonary Embolism", "icd10": "I26.99", "category": "cardiovascular"},
]

async def generate_disease(db, disease_info, llm_key):
    """Generate a complete disease profile"""
    try:
        # Check if already exists
        existing = await db.diseases.find_one({"icd10_code": disease_info["icd10"]})
        if existing:
            print(f"  ⏭️ Already exists: {disease_info['name']}")
            return False
        
        session_id = str(uuid.uuid4())
        prompt = f"""Create a complete disease profile for "{disease_info['name']}" (ICD-10: {disease_info['icd10']}, Category: {disease_info['category']}).

Return ONLY valid JSON with this structure:
{{
  "id": "{disease_info['name'].lower().replace(' ', '_').replace('-', '_')}",
  "name": "{disease_info['name']}",
  "icd10_code": "{disease_info['icd10']}",
  "category": "{disease_info['category']}",
  "description": "2-3 sentence description",
  "synonyms": ["list of alternative names"],
  "epidemiology": {{"prevalence": "...", "incidence": "...", "risk_factors": ["..."]}},
  "pathophysiology": {{"mechanism": "...", "molecular_basis": "..."}},
  "symptoms": [{{"name": "...", "description": "...", "frequency": "common", "onset": "chronic", "sensitivity": 80, "specificity": 60}}],
  "clinical_signs": [{{"name": "...", "examination_technique": "...", "sensitivity": 70, "specificity": 65}}],
  "parameter_modifications": {{
    "affected_organ": {{"parameters": {{"param_name": {{"direction": "increase", "magnitude": "moderate", "typical_value": "...", "normal_range": "...", "unit": "..."}}}}, "symptoms": ["..."], "clinical_signs": ["..."]}},
    "blood": {{"parameters": {{}}, "symptoms": [], "lab_tests": []}},
    "general": {{"parameters": {{}}, "symptoms": []}}
  }},
  "diagnostic_tests": [{{"name": "...", "type": "laboratory", "sensitivity": 85, "specificity": 80, "expected_result": "...", "normal_range": "..."}}],
  "treatments": [{{"name": "...", "type": "pharmacological", "first_line": true, "medications": [{{"generic_name": "...", "dose": "...", "route": "oral", "frequency": "..."}}]}}],
  "mathematical_models": [{{"name": "...", "equation": "...", "variables": {{}}, "interpretation": "...", "clinical_thresholds": {{}}}}],
  "differential_diagnosis": ["..."],
  "complications": ["..."],
  "prognosis": {{"overall": "...", "with_treatment": "...", "5_year_survival": "..."}}
}}

Include 8 symptoms, 6 signs, at least 5 organ systems in parameter_modifications, 8 tests, 5 treatments, 4 math models. Return ONLY JSON."""

        llm = LlmChat(api_key=llm_key, session_id=session_id, system_message="Return only valid JSON.")
        response = await llm.send_message(UserMessage(text=prompt))
        
        text = str(response.message if hasattr(response, 'message') else response)
        start, end = text.find('{'), text.rfind('}') + 1
        disease_profile = json.loads(text[start:end].strip())
        
        # Add metadata
        disease_profile.update({
            "clinical_data_filled": True,
            "ai_enhanced": True,
            "mathematical_models_added": True,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "model_version": "3.0-generated"
        })
        
        # Remove _id if present
        disease_profile.pop("_id", None)
        
        await db.diseases.insert_one(disease_profile)
        return True
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    llm_key = os.environ.get("EMERGENT_LLM_KEY")
    
    print("=" * 50)
    print("PHICOR DISEASE EXPANSION")
    print("=" * 50)
    
    total_added = 0
    
    for disease_info in NEW_DISEASES:
        print(f"\n📋 {disease_info['name']} ({disease_info['icd10']})")
        if await generate_disease(db, disease_info, llm_key):
            total_added += 1
            print(f"  ✅ Added successfully!")
        await asyncio.sleep(3)
    
    # Final count
    total = await db.diseases.count_documents({})
    print(f"\n" + "=" * 50)
    print(f"🎉 EXPANSION COMPLETE!")
    print(f"   New diseases added: {total_added}")
    print(f"   Total diseases now: {total}")
    print("=" * 50)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
