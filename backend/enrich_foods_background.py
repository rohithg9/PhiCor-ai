#!/usr/bin/env python3
"""
Background Food Enrichment Script
Fetches full nutrient data from USDA and computes organ effects for all foods.
Run: nohup python3 enrich_foods_background.py > /tmp/food_enrichment.log 2>&1 &
"""

import asyncio
import os
import requests
from motor.motor_asyncio import AsyncIOMotorClient
import time
import sys
sys.path.insert(0, '/app/backend')

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'phicor')
USDA_API_KEY = os.environ.get('USDA_API_KEY', 'wXvZzd5NonZl7ENFgzPZNCG1sCd7gpTWNtDdFRQO')
USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1'

# Nutrient ID mapping from USDA to our schema
NUTRIENT_ID_MAP = {
    1008: ('energy', 'kcal'),
    1003: ('protein', 'g'),
    1004: ('fat_total', 'g'),
    1005: ('carbohydrates', 'g'),
    1079: ('fiber', 'g'),
    2000: ('sugars', 'g'),
    1258: ('fat_saturated', 'g'),
    1253: ('cholesterol', 'mg'),
    1093: ('sodium', 'mg'),
    1092: ('potassium', 'mg'),
    1087: ('calcium', 'mg'),
    1089: ('iron', 'mg'),
    1090: ('magnesium', 'mg'),
    1091: ('phosphorus', 'mg'),
    1095: ('zinc', 'mg'),
    1098: ('copper', 'mg'),
    1101: ('manganese', 'mg'),
    1103: ('selenium', 'mcg'),
    1162: ('vitamin_c', 'mg'),
    1106: ('vitamin_a', 'mcg'),
    1114: ('vitamin_d', 'mcg'),
    1109: ('vitamin_e', 'mg'),
    1185: ('vitamin_k', 'mcg'),
    1165: ('thiamin', 'mg'),
    1166: ('riboflavin', 'mg'),
    1167: ('niacin', 'mg'),
    1170: ('vitamin_b6', 'mg'),
    1177: ('folate', 'mcg'),
    1178: ('vitamin_b12', 'mcg'),
}

# Load nutrient effects mapping
try:
    from data.nutrients_database import NUTRIENTS_DATABASE
    NUTRIENT_EFFECTS = {nid: ndata.get('parameter_effects', {}) 
                        for nid, ndata in NUTRIENTS_DATABASE.items() 
                        if ndata.get('parameter_effects')}
except:
    NUTRIENT_EFFECTS = {}

def compute_organ_effects(nutrients):
    """Compute organ effects based on nutrients present"""
    organ_effects = {}
    
    for nutrient_id, nutrient_val in nutrients.items():
        nid = nutrient_id.lower().replace('-', '_')
        
        if nid in NUTRIENT_EFFECTS:
            for organ, effect_info in NUTRIENT_EFFECTS[nid].items():
                if organ not in organ_effects:
                    organ_effects[organ] = []
                
                if isinstance(effect_info, dict):
                    organ_effects[organ].append({
                        'nutrient': nid,
                        'effect': effect_info.get('effect', 'neutral'),
                        'mechanism': effect_info.get('mechanism', ''),
                        'magnitude': effect_info.get('magnitude', 'moderate')
                    })
                elif isinstance(effect_info, str):
                    organ_effects[organ].append({
                        'nutrient': nid,
                        'effect': effect_info,
                        'mechanism': ''
                    })
    
    return organ_effects

async def enrich_batch(db, fdc_ids, foods_map):
    """Fetch nutrients for a batch of foods from USDA API"""
    try:
        response = requests.post(
            f"{USDA_BASE_URL}/foods",
            json={'fdcIds': [str(fid) for fid in fdc_ids], 'format': 'full'},
            params={'api_key': USDA_API_KEY},
            timeout=60
        )
        
        if response.status_code != 200:
            print(f"  API error: {response.status_code}")
            return 0
            
        foods_data = response.json()
        enriched = 0
        
        for food_data in foods_data:
            fdc_id = food_data.get('fdcId')
            nutrients = {}
            
            for fn in food_data.get('foodNutrients', []):
                nutrient_id = fn.get('nutrient', {}).get('id') or fn.get('nutrientId')
                value = fn.get('amount', 0)
                
                if nutrient_id in NUTRIENT_ID_MAP and value and value > 0:
                    key, unit = NUTRIENT_ID_MAP[nutrient_id]
                    nutrients[key] = {'value': round(value, 2), 'unit': unit}
            
            if nutrients:
                organ_effects = compute_organ_effects(nutrients)
                
                await db.foods.update_one(
                    {"fdc_id": fdc_id},
                    {"$set": {
                        "nutrients": nutrients,
                        "organ_effects": organ_effects,
                        "enriched_at": time.strftime("%Y-%m-%d %H:%M:%S")
                    }}
                )
                enriched += 1
        
        return enriched
        
    except Exception as e:
        print(f"  Error: {e}")
        return 0

async def main():
    print("=" * 60)
    print("FOOD DATABASE ENRICHMENT")
    print("=" * 60)
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Count foods needing enrichment
    total_to_enrich = await db.foods.count_documents({
        "fdc_id": {"$exists": True, "$ne": None},
        "$or": [
            {"nutrients": {"$exists": False}},
            {"nutrients": {}},
        ]
    })
    
    print(f"\nFoods needing enrichment: {total_to_enrich}")
    
    if total_to_enrich == 0:
        print("All foods already enriched!")
        return
    
    batch_size = 20
    enriched_total = 0
    processed = 0
    
    while True:
        # Get batch of foods to enrich
        foods_to_enrich = await db.foods.find(
            {
                "fdc_id": {"$exists": True, "$ne": None},
                "$or": [
                    {"nutrients": {"$exists": False}},
                    {"nutrients": {}},
                ]
            },
            {"_id": 1, "fdc_id": 1, "name": 1}
        ).limit(batch_size).to_list(batch_size)
        
        if not foods_to_enrich:
            break
            
        fdc_ids = [f['fdc_id'] for f in foods_to_enrich]
        foods_map = {f['fdc_id']: f for f in foods_to_enrich}
        
        enriched = await enrich_batch(db, fdc_ids, foods_map)
        enriched_total += enriched
        processed += len(foods_to_enrich)
        
        if processed % 500 == 0:
            print(f"  Progress: {processed}/{total_to_enrich} processed, {enriched_total} enriched")
        
        # Rate limiting
        time.sleep(0.2)
        
        # Safety limit - process in chunks
        if processed >= 10000:
            print(f"\nStopping at 10,000 for this run. Re-run to continue.")
            break
    
    # Final stats
    final_with_nutrients = await db.foods.count_documents({"nutrients": {"$ne": {}, "$exists": True}})
    final_with_organs = await db.foods.count_documents({"organ_effects": {"$ne": {}, "$exists": True}})
    
    print(f"\n" + "=" * 60)
    print(f"ENRICHMENT COMPLETE")
    print(f"  Total enriched this run: {enriched_total}")
    print(f"  Foods with nutrients: {final_with_nutrients}")
    print(f"  Foods with organ effects: {final_with_organs}")
    print("=" * 60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
