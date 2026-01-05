#!/usr/bin/env python3
"""
Batch regeneration script for comprehensive clinical data extraction.
Runs in background and processes all diseases.
"""
import asyncio
import aiohttp
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL = 'mongodb://localhost:27017'
DB_NAME = 'test_database'
API_URL = 'https://phicor-ai.preview.emergentagent.com'
LOG_FILE = '/tmp/batch_regen.log'

def log(msg):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f"[{timestamp}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, 'a') as f:
        f.write(line + '\n')

async def regenerate_disease(session, disease_id, disease_name, category):
    """Regenerate parameters for a single disease"""
    try:
        async with session.post(
            f'{API_URL}/api/diseases-db/generate-parameter-mods',
            json={'disease_id': disease_id, 'disease_name': disease_name, 'category': category},
            timeout=aiohttp.ClientTimeout(total=120)
        ) as response:
            if response.status == 200:
                data = await response.json()
                return data.get('success', False), disease_name
            return False, disease_name
    except Exception as e:
        log(f"  ERROR: {disease_name}: {str(e)[:50]}")
        return False, disease_name

async def main():
    log("=" * 60)
    log("STARTING COMPREHENSIVE DISEASE REGENERATION")
    log("=" * 60)
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Get all diseases
    diseases = await db.diseases.find({}, {'_id': 0, 'id': 1, 'name': 1, 'category': 1}).to_list(500)
    total = len(diseases)
    log(f"Total diseases to process: {total}")
    
    # Process in batches of 3 (to avoid overwhelming the API)
    batch_size = 3
    total_success = 0
    total_failed = 0
    
    async with aiohttp.ClientSession() as session:
        for i in range(0, total, batch_size):
            batch = diseases[i:i+batch_size]
            batch_num = i // batch_size + 1
            total_batches = (total + batch_size - 1) // batch_size
            
            log(f"Batch {batch_num}/{total_batches}: Processing {len(batch)} diseases...")
            
            tasks = [
                regenerate_disease(session, d['id'], d['name'], d.get('category', 'unknown'))
                for d in batch
            ]
            results = await asyncio.gather(*tasks)
            
            success = sum(1 for r, _ in results if r)
            failed = len(results) - success
            total_success += success
            total_failed += failed
            
            # Log individual results
            for result, name in results:
                status = "✓" if result else "✗"
                log(f"  {status} {name[:40]}")
            
            log(f"  Batch complete: {success}/{len(batch)} success | Running total: {total_success}/{i+len(batch)}")
            
            # Small delay between batches
            await asyncio.sleep(1)
    
    log("=" * 60)
    log(f"REGENERATION COMPLETE")
    log(f"Total Success: {total_success}/{total}")
    log(f"Total Failed: {total_failed}/{total}")
    log("=" * 60)

if __name__ == '__main__':
    asyncio.run(main())
