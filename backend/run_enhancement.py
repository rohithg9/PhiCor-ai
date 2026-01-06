import asyncio
import os
import json
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid

CATEGORIES = ["cardiovascular", "respiratory", "gastrointestinal", "neurological", "infectious", "endocrine", "renal", "hematological"]

async def enhance_disease(db, disease, llm_key):
    try:
        session_id = str(uuid.uuid4())
        prompt = f"""For "{disease.get('name')}" (ICD-10: {disease.get('icd10_code')}, Category: {disease.get('category')}), provide clinical data as JSON only:
{{"symptoms": [{{"name": "...", "description": "...", "frequency": "common", "onset": "chronic", "sensitivity": 80, "specificity": 60}}],
"clinical_signs": [{{"name": "...", "examination_technique": "...", "sensitivity": 70, "specificity": 65}}],
"diagnostic_tests": [{{"name": "...", "type": "laboratory", "sensitivity": 85, "specificity": 80, "expected_result": "...", "normal_range": "..."}}],
"treatments": [{{"name": "...", "type": "pharmacological", "first_line": true, "medications": [{{"generic_name": "...", "dose": "...", "route": "oral", "frequency": "..."}}]}}],
"mathematical_models": [{{"name": "...", "equation": "...", "variables": {{}}, "interpretation": "...", "clinical_thresholds": {{}}}}],
"differential_diagnosis": ["..."], "complications": ["..."], "prognosis": {{"overall": "..."}}}}
Include 8 symptoms, 6 signs, 8 tests, 5 treatments, 4 models. Return ONLY JSON."""

        llm = LlmChat(api_key=llm_key, session_id=session_id, system_message="Return only valid JSON.")
        response = await llm.send_message(UserMessage(text=prompt))
        text = str(response.message if hasattr(response, 'message') else response)
        start, end = text.find('{'), text.rfind('}') + 1
        enhancement = json.loads(text[start:end].strip())
        
        disease.update({
            "symptoms": enhancement.get("symptoms", []),
            "clinical_signs": enhancement.get("clinical_signs", []),
            "diagnostic_tests": enhancement.get("diagnostic_tests", []),
            "treatments": enhancement.get("treatments", []),
            "mathematical_models": enhancement.get("mathematical_models", []),
            "differential_diagnosis": enhancement.get("differential_diagnosis", []),
            "complications": enhancement.get("complications", []),
            "prognosis": enhancement.get("prognosis", {}),
            "ai_enhanced": True, "mathematical_models_added": True,
            "last_updated": datetime.now(timezone.utc).isoformat(), "model_version": "3.0-enhanced"
        })
        await db.diseases.update_one({"id": disease["id"]}, {"$set": disease})
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    llm_key = os.environ.get("EMERGENT_LLM_KEY")
    total = 0
    for cat in CATEGORIES:
        diseases = await db.diseases.find({"category": cat, "$or": [{"ai_enhanced": {"$ne": True}}, {"mathematical_models": {"$size": 0}}]}, {"_id": 0}).limit(10).to_list(10)
        print(f"\n=== {cat.upper()} ({len(diseases)}) ===")
        for d in diseases:
            print(f"  {d.get('name')[:40]}...", end=" ")
            if await enhance_disease(db, d, llm_key): total += 1; print("✅")
            else: print("❌")
            await asyncio.sleep(2)
    print(f"\n🎉 Enhanced {total} diseases!")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
