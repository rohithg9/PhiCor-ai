#!/usr/bin/env python3
"""
USDA Nutrient Enrichment - Fetches detailed nutrients for foods missing them
"""
import asyncio
import os
import requests
import time
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

USDA_API_KEY = os.environ.get('USDA_API_KEY', '')
USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

# Nutrient ID mapping
NUTRIENT_MAP = {
    1008: ("energy", "kcal"), 1003: ("protein", "g"), 1004: ("fat_total", "g"),
    1005: ("carbohydrates", "g"), 1079: ("fiber", "g"), 2000: ("sugars", "g"),
    1258: ("fat_saturated", "g"), 1253: ("cholesterol", "mg"), 1093: ("sodium", "mg"),
    1092: ("potassium", "mg"), 1087: ("calcium", "mg"), 1089: ("iron", "mg"),
    1090: ("magnesium", "mg"), 1091: ("phosphorus", "mg"), 1095: ("zinc", "mg"),
    1103: ("selenium", "mcg"), 1106: ("vitamin_a", "mcg"), 1162: ("vitamin_c", "mg"),
    1114: ("vitamin_d", "mcg"), 1109: ("vitamin_e", "mg"), 1185: ("vitamin_k", "mcg"),
    1165: ("thiamin", "mg"), 1166: ("riboflavin", "mg"), 1167: ("niacin", "mg"),
    1170: ("vitamin_b6", "mg"), 1177: ("folate", "mcg"), 1178: ("vitamin_b12", "mcg"),
}

def calculate_effects(nutrients):
    """Calculate organ effects from nutrients"""
    effects = {}
    
    sodium = nutrients.get("sodium", {}).get("value", 0) or 0
    potassium = nutrients.get("potassium", {}).get("value", 0) or 0
    fiber = nutrients.get("fiber", {}).get("value", 0) or 0
    sugars = nutrients.get("sugars", {}).get("value", 0) or 0
    protein = nutrients.get("protein", {}).get("value", 0) or 0
    fat = nutrients.get("fat_total", {}).get("value", 0) or 0
    sat_fat = nutrients.get("fat_saturated", {}).get("value", 0) or 0
    vitamin_c = nutrients.get("vitamin_c", {}).get("value", 0) or 0
    calcium = nutrients.get("calcium", {}).get("value", 0) or 0
    iron = nutrients.get("iron", {}).get("value", 0) or 0
    
    # Cardiovascular
    cardio = []
    if sodium > 100:
        cardio.append({"parameter": "blood_pressure_systolic", "change": f"+{min(sodium/180, 8):.1f} mmHg", "direction": "increase", "source_nutrient": "Sodium", "amount": f"{sodium:.0f} mg"})
    if potassium > 100:
        cardio.append({"parameter": "blood_pressure_systolic", "change": f"-{min(potassium/250, 5):.1f} mmHg", "direction": "decrease", "source_nutrient": "Potassium", "amount": f"{potassium:.0f} mg"})
    if sat_fat > 2:
        cardio.append({"parameter": "ldl_cholesterol", "change": f"+{min(sat_fat*2.5, 18):.0f} mg/dL", "direction": "increase", "source_nutrient": "Saturated Fat", "amount": f"{sat_fat:.1f} g"})
    if fiber > 1:
        cardio.append({"parameter": "ldl_cholesterol", "change": f"-{min(fiber*2, 10):.0f} mg/dL", "direction": "decrease", "source_nutrient": "Fiber", "amount": f"{fiber:.1f} g"})
    if cardio:
        effects["cardiovascular"] = {"parameters": cardio}
    
    # Glycemic
    glycemic = []
    if sugars > 3:
        glycemic.append({"parameter": "blood_glucose", "change": f"+{min(sugars*4, 55):.0f} mg/dL", "direction": "increase", "source_nutrient": "Sugars", "amount": f"{sugars:.1f} g"})
    if fiber > 2:
        glycemic.append({"parameter": "insulin_sensitivity", "change": "+5-12%", "direction": "increase", "source_nutrient": "Fiber", "amount": f"{fiber:.1f} g"})
    if glycemic:
        effects["glycemic"] = {"parameters": glycemic}
    
    # Renal
    renal = []
    if protein > 8:
        renal.append({"parameter": "bun", "change": f"+{min(protein*0.18, 6):.1f} mg/dL", "direction": "increase", "source_nutrient": "Protein", "amount": f"{protein:.1f} g"})
    if potassium > 250:
        renal.append({"parameter": "serum_potassium", "change": f"+{min(potassium/350, 0.6):.2f} mEq/L", "direction": "increase", "source_nutrient": "Potassium", "amount": f"{potassium:.0f} mg"})
    if renal:
        effects["renal"] = {"parameters": renal}
    
    # Hepatic
    hepatic = []
    if fat > 10:
        hepatic.append({"parameter": "triglycerides", "change": f"+{min(fat*2, 35):.0f} mg/dL", "direction": "increase", "source_nutrient": "Total Fat", "amount": f"{fat:.1f} g"})
    if hepatic:
        effects["hepatic"] = {"parameters": hepatic}
    
    # GI
    gi = []
    if fiber > 1.5:
        gi.append({"parameter": "transit_time", "change": "-1-4 hours", "direction": "decrease", "source_nutrient": "Fiber", "amount": f"{fiber:.1f} g"})
        gi.append({"parameter": "microbiome_diversity", "change": "+5-12%", "direction": "increase", "source_nutrient": "Fiber", "amount": f"{fiber:.1f} g"})
    if gi:
        effects["gastrointestinal"] = {"parameters": gi}
    
    # Musculoskeletal
    musculo = []
    if protein > 6:
        musculo.append({"parameter": "muscle_protein_synthesis", "change": f"+{min(protein*2, 30):.0f}%", "direction": "increase", "source_nutrient": "Protein", "amount": f"{protein:.1f} g"})
    if calcium > 50:
        musculo.append({"parameter": "bone_mineral_density", "change": "+0.3-1%", "direction": "increase", "source_nutrient": "Calcium", "amount": f"{calcium:.0f} mg"})
    if musculo:
        effects["musculoskeletal"] = {"parameters": musculo}
    
    # Immune
    immune = []
    if vitamin_c > 5:
        immune.append({"parameter": "immune_function", "change": "+8-20%", "direction": "increase", "source_nutrient": "Vitamin C", "amount": f"{vitamin_c:.0f} mg"})
    if iron > 0.5:
        immune.append({"parameter": "oxygen_transport", "change": "+5-12%", "direction": "increase", "source_nutrient": "Iron", "amount": f"{iron:.1f} mg"})
    if immune:
        effects["immune"] = {"parameters": immune}
    
    return effects

def fetch_food_details(fdc_ids):
    """Fetch detailed nutrients for foods"""
    url = f"{USDA_BASE_URL}/foods"
    try:
        response = requests.post(
            url,
            params={"api_key": USDA_API_KEY},
            json={"fdcIds": fdc_ids},
            timeout=90
        )
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"  Error fetching: {e}")
    return []

async def enrich_foods(batch_size=50, max_foods=5000):
    """Enrich foods missing nutrients"""
    
    print("Finding foods that need nutrient data...")
    
    # Find foods with empty nutrients
    cursor = db.foods.find(
        {
            "source": "USDA FoodData Central",
            "fdc_id": {"$exists": True},
            "$or": [
                {"nutrients": {}},
                {"nutrients": {"$exists": False}},
                {"nutrients.energy": {"$exists": False}}
            ]
        },
        {"_id": 1, "fdc_id": 1, "name": 1}
    ).limit(max_foods)
    
    foods_to_enrich = await cursor.to_list(max_foods)
    print(f"Found {len(foods_to_enrich)} foods needing enrichment")
    
    if not foods_to_enrich:
        return 0
    
    enriched = 0
    
    # Process in batches of 20 (API limit)
    for i in range(0, len(foods_to_enrich), 20):
        batch = foods_to_enrich[i:i+20]
        fdc_ids = [f["fdc_id"] for f in batch if f.get("fdc_id")]
        
        if not fdc_ids:
            continue
        
        detailed_foods = fetch_food_details(fdc_ids)
        
        if not detailed_foods:
            time.sleep(1)
            continue
        
        # Create lookup by FDC ID
        detailed_map = {d["fdcId"]: d for d in detailed_foods}
        
        for food in batch:
            fdc_id = food.get("fdc_id")
            if fdc_id not in detailed_map:
                continue
            
            detailed = detailed_map[fdc_id]
            food_nutrients = detailed.get("foodNutrients", [])
            
            nutrients = {}
            for fn in food_nutrients:
                nutrient_id = fn.get("nutrient", {}).get("id")
                if nutrient_id and nutrient_id in NUTRIENT_MAP:
                    key, unit = NUTRIENT_MAP[nutrient_id]
                    value = fn.get("amount", 0)
                    if value and value > 0:
                        nutrients[key] = {"value": round(value, 2), "unit": unit}
            
            if nutrients:
                organ_effects = calculate_effects(nutrients)
                
                await db.foods.update_one(
                    {"_id": food["_id"]},
                    {
                        "$set": {
                            "nutrients": nutrients,
                            "organ_effects": organ_effects,
                            "enriched_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                enriched += 1
        
        if enriched % 100 == 0 and enriched > 0:
            print(f"  📊 Enriched {enriched} foods so far...")
        
        time.sleep(0.3)
    
    print(f"✅ Enriched {enriched} foods with detailed nutrient data")
    return enriched

async def main():
    print("="*50)
    print("PhiCor.ai - USDA Nutrient Enrichment")
    print("="*50)
    
    enriched = await enrich_foods(max_foods=5000)
    
    # Show sample
    sample = await db.foods.find_one(
        {"source": "USDA FoodData Central", "nutrients.energy": {"$exists": True}},
        {"_id": 0, "name": 1, "nutrients": 1}
    )
    if sample:
        print(f"\nSample enriched food: {sample['name']}")
        print(f"Nutrients: {list(sample['nutrients'].keys())}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
