#!/usr/bin/env python3
"""
Fast Phase 2: Parallel comprehensive model generation
Runs multiple workers to speed up processing
"""

import asyncio
import json
import os
import sys
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Number of parallel workers
NUM_WORKERS = 3
# Delay between requests per worker (to avoid rate limits)
REQUEST_DELAY = 2

async def generate_model_fast(disease_name: str, category: str) -> dict:
    """Generate comprehensive model using simplified prompt (faster)"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    prompt = f"""Generate a comprehensive clinical JSON model for: {disease_name} ({category})

Include these sections with medically accurate data:
{{
  "clinicalPresentation": {{
    "symptoms": [{{"name": "symptom", "severity_range": "mild/moderate/severe", "frequency": "common/uncommon"}}],
    "signs": [{{"name": "sign", "detection_method": "how to detect", "sensitivity": "high/medium/low"}}]
  }},
  "diagnosticWorkup": {{
    "laboratory": [{{"test": "test name", "expected_finding": "what to expect", "sensitivity": "X%"}}],
    "imaging": [{{"modality": "CT/MRI/Echo/etc", "findings": "what to look for"}}],
    "other": [{{"test": "name", "purpose": "why"}}]
  }},
  "treatment": {{
    "first_line": [{{"drug_class": "class name", "examples": ["drug1", "drug2"], "dosing": "typical dose"}}],
    "second_line": [{{"drug_class": "class name", "examples": ["drug1"], "when_to_use": "indication"}}],
    "interventional": [{{"procedure": "name", "indication": "when to do"}}]
  }},
  "prognosis": {{
    "natural_history": "course without treatment",
    "with_treatment": "expected outcomes",
    "mortality": "X% at Y years"
  }},
  "monitoring": {{
    "parameters": ["what to monitor"],
    "frequency": "how often",
    "warning_signs": ["signs of deterioration"]
  }}
}}

Include at least: 8 symptoms, 5 signs, 8 lab tests, 3 imaging, comprehensive treatments.
Return ONLY valid JSON, no markdown."""

    try:
        llm = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"fast_{disease_name[:10]}_{datetime.now().strftime('%H%M%S')}",
            system_message="You are a senior clinical expert. Return only valid, comprehensive JSON."
        ).with_model("openai", "gpt-4o-mini")
        
        response = await llm.send_message(UserMessage(text=prompt))
        
        # Clean response
        content = response.strip()
        if content.startswith('```'):
            lines = content.split('\n')
            content = '\n'.join(lines[1:-1] if lines[-1] == '```' else lines[1:])
            if content.startswith('json'):
                content = content[4:]
        content = content.strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"    Error: {str(e)[:60]}")
        return None

async def process_disease(db, disease: dict, worker_id: int) -> bool:
    """Process a single disease"""
    name = disease.get('name', 'Unknown')
    disease_id = disease.get('id')
    category = disease.get('category', 'general')
    
    # Skip if already has model
    if disease.get('comprehensive_model'):
        return True
    
    print(f"  [W{worker_id}] Processing: {name[:40]}...")
    
    model = await generate_model_fast(name, category)
    
    if model:
        # Save to database
        await db.diseases.update_one(
            {'id': disease_id} if disease_id else {'name': name},
            {'$set': {
                'comprehensive_model': model,
                'model_version': '2.1-fast',
                'model_generated_at': datetime.now(timezone.utc).isoformat()
            }}
        )
        print(f"  [W{worker_id}] ✓ Saved: {name[:40]}")
        return True
    else:
        print(f"  [W{worker_id}] ✗ Failed: {name[:40]}")
        return False

async def worker(worker_id: int, queue: asyncio.Queue, db):
    """Worker that processes diseases from queue"""
    success = 0
    failed = 0
    
    while True:
        try:
            disease = await asyncio.wait_for(queue.get(), timeout=5)
        except asyncio.TimeoutError:
            break
        
        try:
            result = await process_disease(db, disease, worker_id)
            if result:
                success += 1
            else:
                failed += 1
        except Exception as e:
            print(f"  [W{worker_id}] Error: {e}")
            failed += 1
        
        queue.task_done()
        await asyncio.sleep(REQUEST_DELAY)
    
    return success, failed

async def main():
    print("\n" + "=" * 60)
    print("FAST PHASE 2: PARALLEL COMPREHENSIVE MODEL GENERATION")
    print("=" * 60)
    print(f"Workers: {NUM_WORKERS}")
    print(f"Request delay: {REQUEST_DELAY}s per worker")
    print()
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Get diseases without comprehensive_model
    diseases = await db.diseases.find(
        {'comprehensive_model': {'$exists': False}},
        {'_id': 0}
    ).to_list(None)
    
    # Also get ones with empty model
    diseases_empty = await db.diseases.find(
        {'comprehensive_model': {}},
        {'_id': 0}
    ).to_list(None)
    
    all_diseases = diseases + diseases_empty
    total = len(all_diseases)
    
    print(f"Found {total} diseases to process")
    
    if total == 0:
        print("All diseases already have comprehensive models!")
        return
    
    # Create queue and add diseases
    queue = asyncio.Queue()
    for d in all_diseases:
        await queue.put(d)
    
    print(f"Starting {NUM_WORKERS} workers...\n")
    start_time = datetime.now()
    
    # Start workers
    workers = [
        asyncio.create_task(worker(i+1, queue, db))
        for i in range(NUM_WORKERS)
    ]
    
    # Wait for all workers to complete
    results = await asyncio.gather(*workers)
    
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    total_success = sum(r[0] for r in results)
    total_failed = sum(r[1] for r in results)
    
    print("\n" + "=" * 60)
    print("COMPLETED")
    print("=" * 60)
    print(f"Success: {total_success}")
    print(f"Failed: {total_failed}")
    print(f"Duration: {duration/60:.1f} minutes")
    print(f"Rate: {total_success/(duration/60):.1f} per minute")
    
    # Final count
    final_count = await db.diseases.count_documents({'comprehensive_model': {'$exists': True, '$ne': {}}})
    total_diseases = await db.diseases.count_documents({})
    print(f"\nTotal with models: {final_count}/{total_diseases} ({100*final_count/total_diseases:.1f}%)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
