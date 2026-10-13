#!/usr/bin/env python3
"""
Fast USDA Importer - Uses list endpoint with abridged data
Faster but with less nutrient detail - good for bulk import
"""
import asyncio
import os
import requests
import time
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import uuid
from datetime import datetime, timezone

load_dotenv()

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

USDA_API_KEY = os.environ.get('USDA_API_KEY', '')
USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

def categorize_food(description, data_type):
    """Categorize food based on description"""
    desc_lower = description.lower()
    
    categories = {
        "vegetables": ["vegetable", "broccoli", "carrot", "spinach", "lettuce", "tomato", "pepper", "onion", "celery", "potato", "squash", "cabbage", "cauliflower", "asparagus", "bean", "pea", "corn", "zucchini", "cucumber", "eggplant"],
        "fruits": ["fruit", "apple", "banana", "orange", "grape", "berry", "melon", "mango", "peach", "pear", "plum", "cherry", "kiwi", "pineapple", "watermelon", "lemon", "lime", "grapefruit", "avocado"],
        "meat": ["beef", "pork", "lamb", "veal", "ham", "bacon", "sausage", "steak", "roast", "ground meat", "turkey", "chicken", "duck", "goose"],
        "poultry": ["chicken", "turkey", "duck", "goose", "poultry"],
        "seafood": ["fish", "salmon", "tuna", "shrimp", "crab", "lobster", "oyster", "clam", "mussel", "scallop", "cod", "tilapia", "trout", "mackerel", "sardine", "anchovy", "squid", "octopus"],
        "dairy": ["milk", "cheese", "yogurt", "butter", "cream", "ice cream", "cottage", "ricotta", "mozzarella", "cheddar", "parmesan"],
        "grains": ["bread", "rice", "pasta", "wheat", "oat", "barley", "quinoa", "cereal", "flour", "noodle", "tortilla", "bagel", "muffin", "croissant", "biscuit"],
        "legumes": ["bean", "lentil", "chickpea", "hummus", "tofu", "tempeh", "soy", "peanut"],
        "nuts_seeds": ["almond", "walnut", "cashew", "pistachio", "pecan", "hazelnut", "macadamia", "sunflower", "pumpkin seed", "chia", "flax", "sesame"],
        "beverages": ["juice", "soda", "tea", "coffee", "water", "drink", "beverage", "smoothie", "shake", "lemonade"],
        "sweets": ["candy", "chocolate", "cookie", "cake", "pie", "brownie", "pastry", "donut", "dessert", "sugar", "syrup", "honey", "jam", "jelly"],
        "snacks": ["chip", "cracker", "pretzel", "popcorn", "snack", "bar", "trail mix"],
        "condiments": ["sauce", "ketchup", "mustard", "mayonnaise", "dressing", "vinegar", "oil", "spice", "herb", "seasoning", "salt", "pepper"],
        "baby_foods": ["baby", "infant", "formula", "gerber"],
        "fast_food": ["mcdonald", "burger king", "wendy", "taco bell", "pizza hut", "subway", "kfc", "chick-fil-a"],
    }
    
    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in desc_lower:
                return cat
    
    if data_type == "Branded":
        return "branded_foods"
    elif data_type == "Foundation":
        return "foundation_foods"
    elif data_type == "SR Legacy":
        return "sr_legacy"
    
    return "other"

def transform_simple_food(food_data):
    """Transform USDA food from list endpoint to PhiCor format"""
    name = food_data.get("description", "").strip()
    if not name or len(name) < 2:
        return None
    
    data_type = food_data.get("dataType", "")
    category = categorize_food(name, data_type)
    
    # Extract nutrients from abridged list (limited data)
    nutrients = {}
    food_nutrients = food_data.get("foodNutrients", [])
    
    for fn in food_nutrients:
        nutrient_name = fn.get("nutrientName", "")
        value = fn.get("value", 0)
        unit = fn.get("unitName", "")
        
        if not value or value <= 0:
            continue
        
        # Map common nutrients
        nutrient_map = {
            "Energy": ("energy", "kcal"),
            "Protein": ("protein", "g"),
            "Total lipid (fat)": ("fat_total", "g"),
            "Carbohydrate, by difference": ("carbohydrates", "g"),
            "Fiber, total dietary": ("fiber", "g"),
            "Sugars, total including NLEA": ("sugars", "g"),
            "Fatty acids, total saturated": ("fat_saturated", "g"),
            "Cholesterol": ("cholesterol", "mg"),
            "Sodium, Na": ("sodium", "mg"),
            "Potassium, K": ("potassium", "mg"),
            "Calcium, Ca": ("calcium", "mg"),
            "Iron, Fe": ("iron", "mg"),
            "Vitamin C, total ascorbic acid": ("vitamin_c", "mg"),
            "Vitamin A, RAE": ("vitamin_a", "mcg"),
            "Vitamin D (D2 + D3)": ("vitamin_d", "mcg"),
        }
        
        for usda_name, (our_key, our_unit) in nutrient_map.items():
            if usda_name.lower() in nutrient_name.lower():
                nutrients[our_key] = {"value": round(value, 2), "unit": our_unit}
                break
    
    # Build food document
    food_doc = {
        "id": str(uuid.uuid4()),
        "food_id": str(uuid.uuid4()),
        "fdc_id": food_data.get("fdcId"),
        "name": name[:100],
        "category": category,
        "source": "USDA FoodData Central",
        "data_type": data_type,
        "serving_size": "100g",
        "serving_size_g": 100,
        "nutrients": nutrients,
        "organ_effects": {},  # Will be calculated if nutrients available
        "publication_date": food_data.get("publicationDate"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    
    # Calculate basic organ effects if we have nutrients
    if nutrients:
        food_doc["organ_effects"] = calculate_basic_effects(nutrients)
    
    return food_doc

def calculate_basic_effects(nutrients):
    """Calculate basic organ effects from available nutrients"""
    effects = {}
    
    sodium = nutrients.get("sodium", {}).get("value", 0) or 0
    potassium = nutrients.get("potassium", {}).get("value", 0) or 0
    fiber = nutrients.get("fiber", {}).get("value", 0) or 0
    sugars = nutrients.get("sugars", {}).get("value", 0) or 0
    protein = nutrients.get("protein", {}).get("value", 0) or 0
    fat = nutrients.get("fat_total", {}).get("value", 0) or 0
    sat_fat = nutrients.get("fat_saturated", {}).get("value", 0) or 0
    
    # Cardiovascular
    cardio = []
    if sodium > 200:
        cardio.append({"parameter": "blood_pressure", "change": f"+{min(sodium/200, 5):.1f} mmHg", "direction": "increase", "source_nutrient": "Sodium"})
    if potassium > 200:
        cardio.append({"parameter": "blood_pressure", "change": f"-{min(potassium/300, 3):.1f} mmHg", "direction": "decrease", "source_nutrient": "Potassium"})
    if sat_fat > 3:
        cardio.append({"parameter": "ldl_cholesterol", "change": f"+{min(sat_fat*2, 12):.0f} mg/dL", "direction": "increase", "source_nutrient": "Saturated Fat"})
    if cardio:
        effects["cardiovascular"] = {"parameters": cardio}
    
    # Glycemic
    glycemic = []
    if sugars > 5:
        glycemic.append({"parameter": "blood_glucose", "change": f"+{min(sugars*3, 45):.0f} mg/dL", "direction": "increase", "source_nutrient": "Sugars"})
    if fiber > 2:
        glycemic.append({"parameter": "insulin_sensitivity", "change": "+5-10%", "direction": "increase", "source_nutrient": "Fiber"})
    if glycemic:
        effects["glycemic"] = {"parameters": glycemic}
    
    # Renal
    if protein > 10:
        effects["renal"] = {"parameters": [{"parameter": "bun", "change": f"+{min(protein*0.15, 5):.1f} mg/dL", "direction": "increase", "source_nutrient": "Protein"}]}
    
    # Hepatic
    if fat > 15:
        effects["hepatic"] = {"parameters": [{"parameter": "triglycerides", "change": f"+{min(fat*1.5, 25):.0f} mg/dL", "direction": "increase", "source_nutrient": "Total Fat"}]}
    
    # GI
    if fiber > 2:
        effects["gastrointestinal"] = {"parameters": [{"parameter": "transit_time", "change": "-2-4 hours", "direction": "decrease", "source_nutrient": "Fiber"}]}
    
    return effects

async def update_live_stats():
    """Update stats for real-time display"""
    foods_count = await db.foods.count_documents({})
    await db.live_stats.update_one(
        {"id": "food_import_progress"},
        {"$set": {"foods_count": foods_count, "last_updated": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return foods_count

async def fast_import_usda(max_foods=10000, page_size=200):
    """Fast import using list endpoint only"""
    
    if not USDA_API_KEY:
        print("ERROR: USDA_API_KEY not found")
        return 0
    
    print(f"Starting fast USDA import (target: {max_foods} foods)...")
    
    # Get existing
    existing_fdc_ids = set()
    existing_names = set()
    cursor = db.foods.find({}, {"_id": 0, "fdc_id": 1, "name": 1})
    async for doc in cursor:
        if doc.get("fdc_id"):
            existing_fdc_ids.add(doc["fdc_id"])
        existing_names.add(doc.get("name", "").lower())
    
    print(f"Existing foods to skip: {len(existing_fdc_ids)}")
    
    imported = 0
    
    data_types = [
        ("Foundation", 2000),
        ("SR Legacy", 4000),
        ("Branded", 4000),
    ]
    
    for data_type, type_limit in data_types:
        if imported >= max_foods:
            break
        
        print(f"\n📦 {data_type} foods (limit: {type_limit})...")
        type_imported = 0
        page = 1
        empty_count = 0
        
        while type_imported < type_limit and imported < max_foods:
            url = f"{USDA_BASE_URL}/foods/list"
            params = {
                "api_key": USDA_API_KEY,
                "pageNumber": page,
                "pageSize": page_size,
                "dataType": [data_type]
            }
            
            try:
                response = requests.get(url, params=params, timeout=30)
                foods_data = response.json() if response.status_code == 200 else []
            except Exception as e:
                print(f"  Error page {page}: {e}")
                page += 1
                empty_count += 1
                if empty_count >= 5:
                    break
                continue
            
            if not foods_data:
                empty_count += 1
                if empty_count >= 3:
                    print(f"  No more {data_type} foods")
                    break
                page += 1
                continue
            
            empty_count = 0
            foods_to_insert = []
            
            for food in foods_data:
                fdc_id = food.get("fdcId")
                if fdc_id in existing_fdc_ids:
                    continue
                
                food_doc = transform_simple_food(food)
                if food_doc and food_doc["name"].lower() not in existing_names:
                    foods_to_insert.append(food_doc)
                    existing_fdc_ids.add(fdc_id)
                    existing_names.add(food_doc["name"].lower())
            
            if foods_to_insert:
                try:
                    await db.foods.insert_many(foods_to_insert, ordered=False)
                    imported += len(foods_to_insert)
                    type_imported += len(foods_to_insert)
                except Exception:
                    for f in foods_to_insert:
                        try:
                            await db.foods.insert_one(f)
                            imported += 1
                            type_imported += 1
                        except Exception:
                            pass
            
            if imported % 500 == 0 and imported > 0:
                current = await update_live_stats()
                print(f"  📊 {imported} imported, {current} total")
            
            time.sleep(0.15)
            page += 1
        
        print(f"  ✅ {data_type}: {type_imported} foods")
    
    final = await update_live_stats()
    print(f"\n{'='*50}")
    print(f"Import complete! Total: {final} foods")
    print(f"{'='*50}")
    return imported

async def main():
    print("="*50)
    print("PhiCor.ai - Fast USDA Importer")
    print("="*50)
    
    before = await db.foods.count_documents({})
    print(f"Foods before: {before}")
    
    imported = await fast_import_usda(max_foods=10000)
    
    after = await db.foods.count_documents({})
    print(f"\nFoods after: {after}")
    print(f"Added: {after - before}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
