"""
PhiCor Food Engine - USDA FoodData Central Importer
Imports food data from USDA's public API

USDA FoodData Central API:
- Foundation Foods: ~900 foods with comprehensive nutrient data
- SR Legacy: ~8,000 foods from the Standard Reference database
- Survey Foods (FNDDS): ~8,000 foods from What We Eat in America
"""
import asyncio
import aiohttp
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import json

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# USDA FoodData Central API
USDA_API_KEY = os.environ.get('USDA_API_KEY', 'DEMO_KEY')  # Get free key at https://fdc.nal.usda.gov/api-key-signup.html
USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

# Mapping USDA nutrient IDs to our nutrient IDs
USDA_NUTRIENT_MAPPING = {
    # Energy
    1008: "energy",  # Energy (kcal)
    
    # Macronutrients
    1003: "protein",  # Protein
    1005: "carbohydrates",  # Carbohydrate, by difference
    1079: "fiber",  # Fiber, total dietary
    1063: "sugars",  # Sugars, Total
    1004: "fat_total",  # Total lipid (fat)
    1258: "fat_saturated",  # Fatty acids, total saturated
    1257: "fat_trans",  # Fatty acids, total trans
    1253: "cholesterol",  # Cholesterol
    
    # Electrolytes
    1093: "sodium",  # Sodium
    1092: "potassium",  # Potassium
    1087: "calcium",  # Calcium
    1090: "magnesium",  # Magnesium
    1091: "phosphorus",  # Phosphorus
    
    # Vitamins - Fat Soluble
    1106: "vitamin_a",  # Vitamin A, RAE
    1114: "vitamin_d",  # Vitamin D (D2 + D3)
    1109: "vitamin_e",  # Vitamin E (alpha-tocopherol)
    1185: "vitamin_k",  # Vitamin K (phylloquinone)
    
    # Vitamins - Water Soluble
    1162: "vitamin_c",  # Vitamin C
    1165: "thiamin",  # Thiamin (B1)
    1166: "riboflavin",  # Riboflavin (B2)
    1167: "niacin",  # Niacin (B3)
    1175: "vitamin_b6",  # Vitamin B6
    1177: "folate",  # Folate, total
    1178: "vitamin_b12",  # Vitamin B12
    
    # Trace Elements
    1089: "iron",  # Iron
    1095: "zinc",  # Zinc
    1103: "selenium",  # Selenium
    1100: "iodine",  # Iodine
    1098: "copper",  # Copper
    1101: "manganese",  # Manganese
    1096: "chromium",  # Chromium
}


def normalize_nutrient_value(nutrient_id, value, unit):
    """Normalize nutrient values to standard units"""
    if value is None:
        return None
    
    # Convert mcg to mg for some nutrients
    if unit == "UG" and nutrient_id in ["vitamin_a", "folate", "vitamin_b12", "selenium", "iodine", "chromium"]:
        return {"value": value, "unit": "mcg"}
    elif unit == "UG" and nutrient_id not in ["vitamin_a", "folate", "vitamin_b12", "selenium", "iodine", "chromium"]:
        # Convert to mg
        return {"value": value / 1000, "unit": "mg"}
    elif unit == "MG":
        return {"value": value, "unit": "mg"}
    elif unit == "G":
        return {"value": value, "unit": "g"}
    elif unit == "KCAL":
        return {"value": value, "unit": "kcal"}
    elif unit == "IU":
        return {"value": value, "unit": "IU"}
    
    return {"value": value, "unit": unit}


async def fetch_usda_foods(session, data_type="Foundation", page_size=200, page=1):
    """Fetch foods from USDA FoodData Central API"""
    url = f"{USDA_BASE_URL}/foods/list"
    params = {
        "api_key": USDA_API_KEY,
        "dataType": [data_type],
        "pageSize": page_size,
        "pageNumber": page
    }
    
    async with session.get(url, params=params) as response:
        if response.status == 200:
            return await response.json()
        else:
            print(f"Error fetching foods: {response.status}")
            return []


async def fetch_food_details(session, fdc_id):
    """Fetch detailed nutrient data for a specific food"""
    url = f"{USDA_BASE_URL}/food/{fdc_id}"
    params = {"api_key": USDA_API_KEY}
    
    async with session.get(url, params=params) as response:
        if response.status == 200:
            return await response.json()
        else:
            return None


def extract_nutrients(food_data):
    """Extract nutrients from USDA food data into our format"""
    nutrients = {}
    
    food_nutrients = food_data.get("foodNutrients", [])
    
    for fn in food_nutrients:
        # Get nutrient ID
        nutrient_id = fn.get("nutrient", {}).get("id")
        if not nutrient_id:
            continue
            
        # Check if we have a mapping for this nutrient
        if nutrient_id in USDA_NUTRIENT_MAPPING:
            our_nutrient_id = USDA_NUTRIENT_MAPPING[nutrient_id]
            amount = fn.get("amount")
            unit = fn.get("nutrient", {}).get("unitName", "")
            
            if amount is not None:
                normalized = normalize_nutrient_value(our_nutrient_id, amount, unit)
                if normalized:
                    nutrients[our_nutrient_id] = normalized
    
    return nutrients


def categorize_food(food_data):
    """Categorize food based on USDA category"""
    category = food_data.get("foodCategory", {}).get("description", "")
    
    category_mapping = {
        "Dairy and Egg Products": "dairy",
        "Spices and Herbs": "spices",
        "Baby Foods": "baby_food",
        "Fats and Oils": "fats_oils",
        "Poultry Products": "meat",
        "Soups, Sauces, and Gravies": "prepared",
        "Sausages and Luncheon Meats": "processed_meat",
        "Breakfast Cereals": "grains",
        "Fruits and Fruit Juices": "fruits",
        "Pork Products": "meat",
        "Vegetables and Vegetable Products": "vegetables",
        "Nut and Seed Products": "nuts_seeds",
        "Beef Products": "meat",
        "Beverages": "beverages",
        "Finfish and Shellfish Products": "seafood",
        "Legumes and Legume Products": "legumes",
        "Lamb, Veal, and Game Products": "meat",
        "Baked Products": "baked",
        "Snacks": "snacks",
        "Sweets": "sweets",
        "Cereal Grains and Pasta": "grains",
        "Fast Foods": "fast_food",
        "Meals, Entrees, and Side Dishes": "prepared",
        "Restaurant Foods": "restaurant"
    }
    
    return category_mapping.get(category, "other")


async def import_usda_foods(data_type="Foundation", max_foods=None):
    """Import foods from USDA into MongoDB"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    foods_collection = db.foods
    
    print(f"\n{'='*60}")
    print(f"Importing USDA {data_type} Foods")
    print(f"{'='*60}")
    
    async with aiohttp.ClientSession() as session:
        page = 1
        total_imported = 0
        
        while True:
            print(f"\nFetching page {page}...")
            foods = await fetch_usda_foods(session, data_type, page_size=200, page=page)
            
            if not foods:
                break
            
            for food in foods:
                fdc_id = food.get("fdcId")
                
                # Check if already imported
                existing = await foods_collection.find_one({"fdc_id": fdc_id})
                if existing:
                    continue
                
                # Fetch detailed nutrient data
                details = await fetch_food_details(session, fdc_id)
                if not details:
                    continue
                
                # Extract nutrients
                nutrients = extract_nutrients(details)
                
                # Create food document
                food_doc = {
                    "id": f"usda_{fdc_id}",
                    "fdc_id": fdc_id,
                    "name": food.get("description", "").title(),
                    "description": food.get("description", ""),
                    "category": categorize_food(details),
                    "data_type": data_type,
                    "serving_size": "100g",
                    "serving_size_g": 100,
                    "nutrients": nutrients,
                    "source": "USDA FoodData Central",
                    "imported_at": datetime.utcnow()
                }
                
                # Insert into database
                try:
                    await foods_collection.insert_one(food_doc)
                    total_imported += 1
                    print(f"  ✓ {food_doc['name'][:50]}")
                except Exception as e:
                    print(f"  ✗ Error: {e}")
                
                if max_foods and total_imported >= max_foods:
                    break
                
                # Rate limiting
                await asyncio.sleep(0.1)
            
            if max_foods and total_imported >= max_foods:
                break
            
            if len(foods) < 200:
                break
            
            page += 1
    
    print(f"\n✓ Imported {total_imported} {data_type} foods")
    client.close()
    return total_imported


async def seed_sample_foods():
    """Seed some sample foods for immediate use without USDA API"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    foods_collection = db.foods
    
    print("\nSeeding sample foods...")
    
    # Comprehensive sample foods with full nutrient data
    sample_foods = [
        {
            "id": "banana_raw",
            "name": "Banana, raw",
            "description": "Fresh raw banana, medium sized",
            "category": "fruits",
            "serving_size": "1 medium (118g)",
            "serving_size_g": 118,
            "nutrients": {
                "energy": {"value": 105, "unit": "kcal"},
                "protein": {"value": 1.3, "unit": "g"},
                "carbohydrates": {"value": 27, "unit": "g"},
                "fiber": {"value": 3.1, "unit": "g"},
                "sugars": {"value": 14.4, "unit": "g"},
                "fat_total": {"value": 0.4, "unit": "g"},
                "fat_saturated": {"value": 0.1, "unit": "g"},
                "cholesterol": {"value": 0, "unit": "mg"},
                "sodium": {"value": 1, "unit": "mg"},
                "potassium": {"value": 422, "unit": "mg"},
                "calcium": {"value": 6, "unit": "mg"},
                "magnesium": {"value": 32, "unit": "mg"},
                "phosphorus": {"value": 26, "unit": "mg"},
                "iron": {"value": 0.3, "unit": "mg"},
                "zinc": {"value": 0.2, "unit": "mg"},
                "vitamin_c": {"value": 10.3, "unit": "mg"},
                "vitamin_b6": {"value": 0.4, "unit": "mg"},
                "folate": {"value": 24, "unit": "mcg"},
                "vitamin_a": {"value": 3, "unit": "mcg"},
            },
            "bioactive_compounds": ["dopamine", "serotonin_precursors", "resistant_starch"],
            "source": "PhiCor Sample Database"
        },
        {
            "id": "salmon_atlantic_raw",
            "name": "Salmon, Atlantic, raw",
            "description": "Fresh Atlantic salmon, raw",
            "category": "seafood",
            "serving_size": "3 oz (85g)",
            "serving_size_g": 85,
            "nutrients": {
                "energy": {"value": 177, "unit": "kcal"},
                "protein": {"value": 19.8, "unit": "g"},
                "carbohydrates": {"value": 0, "unit": "g"},
                "fat_total": {"value": 10.4, "unit": "g"},
                "fat_saturated": {"value": 2.3, "unit": "g"},
                "cholesterol": {"value": 47, "unit": "mg"},
                "sodium": {"value": 59, "unit": "mg"},
                "potassium": {"value": 363, "unit": "mg"},
                "calcium": {"value": 9, "unit": "mg"},
                "magnesium": {"value": 27, "unit": "mg"},
                "phosphorus": {"value": 252, "unit": "mg"},
                "iron": {"value": 0.3, "unit": "mg"},
                "zinc": {"value": 0.4, "unit": "mg"},
                "selenium": {"value": 24, "unit": "mcg"},
                "vitamin_d": {"value": 10.9, "unit": "mcg"},
                "vitamin_b12": {"value": 2.6, "unit": "mcg"},
                "niacin": {"value": 8.0, "unit": "mg"},
            },
            "bioactive_compounds": ["omega3_EPA", "omega3_DHA", "astaxanthin"],
            "source": "PhiCor Sample Database"
        },
        {
            "id": "spinach_raw",
            "name": "Spinach, raw",
            "description": "Fresh raw spinach leaves",
            "category": "vegetables",
            "serving_size": "1 cup (30g)",
            "serving_size_g": 30,
            "nutrients": {
                "energy": {"value": 7, "unit": "kcal"},
                "protein": {"value": 0.9, "unit": "g"},
                "carbohydrates": {"value": 1.1, "unit": "g"},
                "fiber": {"value": 0.7, "unit": "g"},
                "sugars": {"value": 0.1, "unit": "g"},
                "fat_total": {"value": 0.1, "unit": "g"},
                "sodium": {"value": 24, "unit": "mg"},
                "potassium": {"value": 167, "unit": "mg"},
                "calcium": {"value": 30, "unit": "mg"},
                "magnesium": {"value": 24, "unit": "mg"},
                "iron": {"value": 0.8, "unit": "mg"},
                "zinc": {"value": 0.2, "unit": "mg"},
                "vitamin_a": {"value": 141, "unit": "mcg"},
                "vitamin_c": {"value": 8.4, "unit": "mg"},
                "vitamin_k": {"value": 145, "unit": "mcg"},
                "folate": {"value": 58, "unit": "mcg"},
            },
            "bioactive_compounds": ["lutein", "zeaxanthin", "nitrates", "oxalates"],
            "antinutrients": {"oxalates": {"value": 750, "unit": "mg", "note": "High oxalate food"}},
            "source": "PhiCor Sample Database"
        },
        {
            "id": "egg_whole_raw",
            "name": "Egg, whole, raw",
            "description": "Large raw egg, whole",
            "category": "dairy",
            "serving_size": "1 large (50g)",
            "serving_size_g": 50,
            "nutrients": {
                "energy": {"value": 72, "unit": "kcal"},
                "protein": {"value": 6.3, "unit": "g"},
                "carbohydrates": {"value": 0.4, "unit": "g"},
                "fat_total": {"value": 4.8, "unit": "g"},
                "fat_saturated": {"value": 1.6, "unit": "g"},
                "cholesterol": {"value": 186, "unit": "mg"},
                "sodium": {"value": 71, "unit": "mg"},
                "potassium": {"value": 69, "unit": "mg"},
                "calcium": {"value": 28, "unit": "mg"},
                "phosphorus": {"value": 99, "unit": "mg"},
                "iron": {"value": 0.9, "unit": "mg"},
                "zinc": {"value": 0.6, "unit": "mg"},
                "selenium": {"value": 15.4, "unit": "mcg"},
                "vitamin_a": {"value": 80, "unit": "mcg"},
                "vitamin_d": {"value": 1.0, "unit": "mcg"},
                "vitamin_b12": {"value": 0.4, "unit": "mcg"},
                "folate": {"value": 24, "unit": "mcg"},
                "riboflavin": {"value": 0.2, "unit": "mg"},
            },
            "bioactive_compounds": ["choline", "lutein", "zeaxanthin"],
            "source": "PhiCor Sample Database"
        },
        {
            "id": "oatmeal_regular",
            "name": "Oatmeal, regular, cooked",
            "description": "Cooked oatmeal made from regular oats",
            "category": "grains",
            "serving_size": "1 cup cooked (234g)",
            "serving_size_g": 234,
            "nutrients": {
                "energy": {"value": 158, "unit": "kcal"},
                "protein": {"value": 6, "unit": "g"},
                "carbohydrates": {"value": 27, "unit": "g"},
                "fiber": {"value": 4, "unit": "g"},
                "sugars": {"value": 0.6, "unit": "g"},
                "fat_total": {"value": 3.2, "unit": "g"},
                "fat_saturated": {"value": 0.5, "unit": "g"},
                "sodium": {"value": 115, "unit": "mg"},
                "potassium": {"value": 164, "unit": "mg"},
                "calcium": {"value": 21, "unit": "mg"},
                "magnesium": {"value": 63, "unit": "mg"},
                "phosphorus": {"value": 180, "unit": "mg"},
                "iron": {"value": 2.1, "unit": "mg"},
                "zinc": {"value": 2.3, "unit": "mg"},
                "thiamin": {"value": 0.3, "unit": "mg"},
                "folate": {"value": 14, "unit": "mcg"},
            },
            "bioactive_compounds": ["beta_glucan", "avenanthramides"],
            "source": "PhiCor Sample Database"
        },
        {
            "id": "chicken_breast_raw",
            "name": "Chicken breast, boneless, skinless, raw",
            "description": "Raw boneless skinless chicken breast",
            "category": "meat",
            "serving_size": "4 oz (113g)",
            "serving_size_g": 113,
            "nutrients": {
                "energy": {"value": 136, "unit": "kcal"},
                "protein": {"value": 25.4, "unit": "g"},
                "carbohydrates": {"value": 0, "unit": "g"},
                "fat_total": {"value": 2.9, "unit": "g"},
                "fat_saturated": {"value": 0.9, "unit": "g"},
                "cholesterol": {"value": 73, "unit": "mg"},
                "sodium": {"value": 54, "unit": "mg"},
                "potassium": {"value": 370, "unit": "mg"},
                "calcium": {"value": 7, "unit": "mg"},
                "magnesium": {"value": 31, "unit": "mg"},
                "phosphorus": {"value": 223, "unit": "mg"},
                "iron": {"value": 0.4, "unit": "mg"},
                "zinc": {"value": 0.8, "unit": "mg"},
                "selenium": {"value": 27, "unit": "mcg"},
                "niacin": {"value": 11.6, "unit": "mg"},
                "vitamin_b6": {"value": 0.6, "unit": "mg"},
                "vitamin_b12": {"value": 0.3, "unit": "mcg"},
            },
            "bioactive_compounds": [],
            "source": "PhiCor Sample Database"
        },
        {
            "id": "brown_rice_cooked",
            "name": "Brown rice, cooked",
            "description": "Cooked long-grain brown rice",
            "category": "grains",
            "serving_size": "1 cup cooked (195g)",
            "serving_size_g": 195,
            "nutrients": {
                "energy": {"value": 216, "unit": "kcal"},
                "protein": {"value": 5, "unit": "g"},
                "carbohydrates": {"value": 45, "unit": "g"},
                "fiber": {"value": 3.5, "unit": "g"},
                "sugars": {"value": 0.7, "unit": "g"},
                "fat_total": {"value": 1.8, "unit": "g"},
                "sodium": {"value": 10, "unit": "mg"},
                "potassium": {"value": 154, "unit": "mg"},
                "calcium": {"value": 20, "unit": "mg"},
                "magnesium": {"value": 84, "unit": "mg"},
                "phosphorus": {"value": 162, "unit": "mg"},
                "iron": {"value": 1.0, "unit": "mg"},
                "zinc": {"value": 1.2, "unit": "mg"},
                "manganese": {"value": 1.8, "unit": "mg"},
                "thiamin": {"value": 0.2, "unit": "mg"},
                "niacin": {"value": 3.0, "unit": "mg"},
            },
            "bioactive_compounds": ["gamma_oryzanol"],
            "source": "PhiCor Sample Database"
        },
        {
            "id": "almonds_raw",
            "name": "Almonds, raw",
            "description": "Raw whole almonds",
            "category": "nuts_seeds",
            "serving_size": "1 oz (28g)",
            "serving_size_g": 28,
            "nutrients": {
                "energy": {"value": 164, "unit": "kcal"},
                "protein": {"value": 6, "unit": "g"},
                "carbohydrates": {"value": 6, "unit": "g"},
                "fiber": {"value": 3.5, "unit": "g"},
                "sugars": {"value": 1.2, "unit": "g"},
                "fat_total": {"value": 14, "unit": "g"},
                "fat_saturated": {"value": 1.1, "unit": "g"},
                "sodium": {"value": 0, "unit": "mg"},
                "potassium": {"value": 208, "unit": "mg"},
                "calcium": {"value": 76, "unit": "mg"},
                "magnesium": {"value": 76, "unit": "mg"},
                "phosphorus": {"value": 136, "unit": "mg"},
                "iron": {"value": 1.0, "unit": "mg"},
                "zinc": {"value": 0.9, "unit": "mg"},
                "vitamin_e": {"value": 7.3, "unit": "mg"},
                "riboflavin": {"value": 0.3, "unit": "mg"},
            },
            "bioactive_compounds": ["flavonoids", "polyphenols"],
            "source": "PhiCor Sample Database"
        },
        {
            "id": "broccoli_raw",
            "name": "Broccoli, raw",
            "description": "Fresh raw broccoli florets",
            "category": "vegetables",
            "serving_size": "1 cup chopped (91g)",
            "serving_size_g": 91,
            "nutrients": {
                "energy": {"value": 31, "unit": "kcal"},
                "protein": {"value": 2.6, "unit": "g"},
                "carbohydrates": {"value": 6, "unit": "g"},
                "fiber": {"value": 2.4, "unit": "g"},
                "sugars": {"value": 1.5, "unit": "g"},
                "fat_total": {"value": 0.3, "unit": "g"},
                "sodium": {"value": 30, "unit": "mg"},
                "potassium": {"value": 288, "unit": "mg"},
                "calcium": {"value": 43, "unit": "mg"},
                "magnesium": {"value": 19, "unit": "mg"},
                "phosphorus": {"value": 60, "unit": "mg"},
                "iron": {"value": 0.7, "unit": "mg"},
                "zinc": {"value": 0.4, "unit": "mg"},
                "vitamin_c": {"value": 81, "unit": "mg"},
                "vitamin_k": {"value": 93, "unit": "mcg"},
                "vitamin_a": {"value": 28, "unit": "mcg"},
                "folate": {"value": 57, "unit": "mcg"},
            },
            "bioactive_compounds": ["sulforaphane", "indole_3_carbinol", "glucosinolates"],
            "source": "PhiCor Sample Database"
        },
        {
            "id": "avocado_raw",
            "name": "Avocado, raw",
            "description": "Fresh raw Hass avocado",
            "category": "fruits",
            "serving_size": "1/2 avocado (100g)",
            "serving_size_g": 100,
            "nutrients": {
                "energy": {"value": 160, "unit": "kcal"},
                "protein": {"value": 2, "unit": "g"},
                "carbohydrates": {"value": 8.5, "unit": "g"},
                "fiber": {"value": 6.7, "unit": "g"},
                "sugars": {"value": 0.7, "unit": "g"},
                "fat_total": {"value": 14.7, "unit": "g"},
                "fat_saturated": {"value": 2.1, "unit": "g"},
                "sodium": {"value": 7, "unit": "mg"},
                "potassium": {"value": 485, "unit": "mg"},
                "calcium": {"value": 12, "unit": "mg"},
                "magnesium": {"value": 29, "unit": "mg"},
                "phosphorus": {"value": 52, "unit": "mg"},
                "iron": {"value": 0.6, "unit": "mg"},
                "zinc": {"value": 0.6, "unit": "mg"},
                "vitamin_c": {"value": 10, "unit": "mg"},
                "vitamin_e": {"value": 2.1, "unit": "mg"},
                "vitamin_k": {"value": 21, "unit": "mcg"},
                "vitamin_b6": {"value": 0.3, "unit": "mg"},
                "folate": {"value": 81, "unit": "mcg"},
            },
            "bioactive_compounds": ["lutein", "beta_sitosterol", "oleic_acid"],
            "source": "PhiCor Sample Database"
        },
        # Supplements and nutrients
        {
            "id": "vitamin_d3_supplement",
            "name": "Vitamin D3 Supplement",
            "description": "Vitamin D3 (cholecalciferol) 1000 IU supplement",
            "category": "supplement",
            "serving_size": "1 tablet",
            "serving_size_g": 0.5,
            "nutrients": {
                "vitamin_d": {"value": 25, "unit": "mcg"}
            },
            "bioactive_compounds": [],
            "source": "PhiCor Sample Database"
        },
        {
            "id": "omega3_fish_oil",
            "name": "Omega-3 Fish Oil",
            "description": "Fish oil supplement with EPA and DHA",
            "category": "supplement",
            "serving_size": "1 softgel (1g)",
            "serving_size_g": 1,
            "nutrients": {
                "energy": {"value": 10, "unit": "kcal"},
                "fat_total": {"value": 1, "unit": "g"}
            },
            "bioactive_compounds": ["omega3_EPA", "omega3_DHA"],
            "source": "PhiCor Sample Database"
        },
        # Beverages
        {
            "id": "green_tea",
            "name": "Green Tea, brewed",
            "description": "Brewed green tea without sugar",
            "category": "beverages",
            "serving_size": "1 cup (240ml)",
            "serving_size_g": 240,
            "nutrients": {
                "energy": {"value": 2, "unit": "kcal"},
                "caffeine": {"value": 28, "unit": "mg"},
                "potassium": {"value": 20, "unit": "mg"},
                "magnesium": {"value": 2, "unit": "mg"}
            },
            "bioactive_compounds": ["EGCG", "catechins", "L_theanine"],
            "source": "PhiCor Sample Database"
        },
        {
            "id": "coffee_brewed",
            "name": "Coffee, brewed",
            "description": "Black brewed coffee without additions",
            "category": "beverages",
            "serving_size": "1 cup (240ml)",
            "serving_size_g": 240,
            "nutrients": {
                "energy": {"value": 2, "unit": "kcal"},
                "caffeine": {"value": 95, "unit": "mg"},
                "potassium": {"value": 116, "unit": "mg"},
                "magnesium": {"value": 7, "unit": "mg"},
                "niacin": {"value": 0.5, "unit": "mg"}
            },
            "bioactive_compounds": ["chlorogenic_acid", "caffeic_acid"],
            "source": "PhiCor Sample Database"
        }
    ]
    
    inserted = 0
    updated = 0
    
    for food in sample_foods:
        food["created_at"] = datetime.utcnow()
        food["updated_at"] = datetime.utcnow()
        
        result = await foods_collection.update_one(
            {"id": food["id"]},
            {"$set": food},
            upsert=True
        )
        
        if result.upserted_id:
            inserted += 1
            print(f"  ✓ {food['name']}")
        else:
            updated += 1
    
    print(f"\n✓ Sample foods: {inserted} inserted, {updated} updated")
    
    total = await foods_collection.count_documents({})
    print(f"✓ Total foods in database: {total}")
    
    client.close()


async def main():
    """Main entry point"""
    print("=" * 60)
    print("PhiCor Food Engine - Food Importer")
    print("=" * 60)
    
    # Always seed sample foods
    await seed_sample_foods()
    
    # Check if USDA API key is available
    if USDA_API_KEY != "DEMO_KEY":
        print("\nUSDA API key found. Starting USDA import...")
        
        # Import Foundation Foods (highest quality data)
        await import_usda_foods("Foundation", max_foods=100)
        
        # Import SR Legacy (comprehensive)
        # await import_usda_foods("SR Legacy", max_foods=500)
    else:
        print("\n⚠️  No USDA API key found. Using sample foods only.")
        print("   Get free API key at: https://fdc.nal.usda.gov/api-key-signup.html")
        print("   Set USDA_API_KEY environment variable to enable full import.")


if __name__ == "__main__":
    asyncio.run(main())
