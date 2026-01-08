#!/usr/bin/env python3
"""
USDA FoodData Central Importer for PhiCor.ai
Imports comprehensive food data from USDA API with full nutrient profiles
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

# MongoDB connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

# USDA API Configuration
USDA_API_KEY = os.environ.get('USDA_API_KEY', '')
USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

# Nutrient ID mapping from USDA to our schema
USDA_NUTRIENT_MAP = {
    1008: {"key": "energy", "unit": "kcal", "name": "Energy"},
    1003: {"key": "protein", "unit": "g", "name": "Protein"},
    1004: {"key": "fat_total", "unit": "g", "name": "Total Fat"},
    1005: {"key": "carbohydrates", "unit": "g", "name": "Carbohydrates"},
    1079: {"key": "fiber", "unit": "g", "name": "Fiber"},
    2000: {"key": "sugars", "unit": "g", "name": "Total Sugars"},
    1258: {"key": "fat_saturated", "unit": "g", "name": "Saturated Fat"},
    1257: {"key": "fat_trans", "unit": "g", "name": "Trans Fat"},
    1253: {"key": "cholesterol", "unit": "mg", "name": "Cholesterol"},
    1093: {"key": "sodium", "unit": "mg", "name": "Sodium"},
    1092: {"key": "potassium", "unit": "mg", "name": "Potassium"},
    1087: {"key": "calcium", "unit": "mg", "name": "Calcium"},
    1089: {"key": "iron", "unit": "mg", "name": "Iron"},
    1090: {"key": "magnesium", "unit": "mg", "name": "Magnesium"},
    1091: {"key": "phosphorus", "unit": "mg", "name": "Phosphorus"},
    1095: {"key": "zinc", "unit": "mg", "name": "Zinc"},
    1098: {"key": "copper", "unit": "mg", "name": "Copper"},
    1101: {"key": "manganese", "unit": "mg", "name": "Manganese"},
    1103: {"key": "selenium", "unit": "mcg", "name": "Selenium"},
    1106: {"key": "vitamin_a", "unit": "mcg", "name": "Vitamin A"},
    1162: {"key": "vitamin_c", "unit": "mg", "name": "Vitamin C"},
    1114: {"key": "vitamin_d", "unit": "mcg", "name": "Vitamin D"},
    1109: {"key": "vitamin_e", "unit": "mg", "name": "Vitamin E"},
    1185: {"key": "vitamin_k", "unit": "mcg", "name": "Vitamin K"},
    1165: {"key": "thiamin", "unit": "mg", "name": "Thiamin (B1)"},
    1166: {"key": "riboflavin", "unit": "mg", "name": "Riboflavin (B2)"},
    1167: {"key": "niacin", "unit": "mg", "name": "Niacin (B3)"},
    1170: {"key": "vitamin_b6", "unit": "mg", "name": "Vitamin B6"},
    1177: {"key": "folate", "unit": "mcg", "name": "Folate"},
    1178: {"key": "vitamin_b12", "unit": "mcg", "name": "Vitamin B12"},
    1180: {"key": "choline", "unit": "mg", "name": "Choline"},
    1186: {"key": "betaine", "unit": "mg", "name": "Betaine"},
    1292: {"key": "omega3_ala", "unit": "g", "name": "Omega-3 ALA"},
    1278: {"key": "omega3_epa", "unit": "g", "name": "Omega-3 EPA"},
    1272: {"key": "omega3_dha", "unit": "g", "name": "Omega-3 DHA"},
}

# Daily values for percentage calculations
DAILY_VALUES = {
    "energy": 2000, "protein": 50, "fat_total": 78, "carbohydrates": 275,
    "fiber": 28, "sugars": 50, "fat_saturated": 20, "cholesterol": 300,
    "sodium": 2300, "potassium": 4700, "calcium": 1300, "iron": 18,
    "magnesium": 420, "phosphorus": 1250, "zinc": 11, "copper": 0.9,
    "manganese": 2.3, "selenium": 55, "vitamin_a": 900, "vitamin_c": 90,
    "vitamin_d": 20, "vitamin_e": 15, "vitamin_k": 120, "thiamin": 1.2,
    "riboflavin": 1.3, "niacin": 16, "vitamin_b6": 1.7, "folate": 400,
    "vitamin_b12": 2.4, "choline": 550
}

def calculate_organ_effects(nutrients):
    """Calculate organ system effects based on nutrient composition"""
    effects = {}
    
    # Get values with defaults
    sodium = nutrients.get("sodium", {}).get("value", 0) or 0
    potassium = nutrients.get("potassium", {}).get("value", 0) or 0
    sat_fat = nutrients.get("fat_saturated", {}).get("value", 0) or 0
    fiber = nutrients.get("fiber", {}).get("value", 0) or 0
    sugars = nutrients.get("sugars", {}).get("value", 0) or 0
    carbs = nutrients.get("carbohydrates", {}).get("value", 0) or 0
    protein = nutrients.get("protein", {}).get("value", 0) or 0
    fat_total = nutrients.get("fat_total", {}).get("value", 0) or 0
    calcium = nutrients.get("calcium", {}).get("value", 0) or 0
    iron = nutrients.get("iron", {}).get("value", 0) or 0
    vitamin_c = nutrients.get("vitamin_c", {}).get("value", 0) or 0
    cholesterol = nutrients.get("cholesterol", {}).get("value", 0) or 0
    omega3 = (nutrients.get("omega3_dha", {}).get("value", 0) or 0) + (nutrients.get("omega3_epa", {}).get("value", 0) or 0)
    
    # Cardiovascular System
    cardio = []
    if sodium > 200:
        cardio.append({"parameter": "blood_pressure_systolic", "change": f"+{min(sodium/200, 8):.1f} mmHg", "direction": "increase", "mechanism": "Sodium increases blood volume and vascular resistance", "source_nutrient": "Sodium", "amount": f"{sodium:.0f} mg"})
    if potassium > 150:
        cardio.append({"parameter": "blood_pressure_systolic", "change": f"-{min(potassium/250, 5):.1f} mmHg", "direction": "decrease", "mechanism": "Potassium promotes vasodilation and sodium excretion", "source_nutrient": "Potassium", "amount": f"{potassium:.0f} mg"})
    if sat_fat > 3:
        cardio.append({"parameter": "ldl_cholesterol", "change": f"+{min(sat_fat*2.5, 20):.0f} mg/dL", "direction": "increase", "mechanism": "Saturated fat increases hepatic LDL cholesterol synthesis", "source_nutrient": "Saturated Fat", "amount": f"{sat_fat:.1f} g"})
    if fiber > 2:
        cardio.append({"parameter": "ldl_cholesterol", "change": f"-{min(fiber*2, 12):.0f} mg/dL", "direction": "decrease", "mechanism": "Soluble fiber binds bile acids reducing cholesterol absorption", "source_nutrient": "Fiber", "amount": f"{fiber:.1f} g"})
    if cholesterol > 50:
        cardio.append({"parameter": "serum_cholesterol", "change": f"+{min(cholesterol/10, 15):.0f} mg/dL", "direction": "increase", "mechanism": "Dietary cholesterol contributes to serum levels", "source_nutrient": "Cholesterol", "amount": f"{cholesterol:.0f} mg"})
    if omega3 > 0.1:
        cardio.append({"parameter": "triglycerides", "change": f"-{min(omega3*20, 30):.0f} mg/dL", "direction": "decrease", "mechanism": "Omega-3 fatty acids reduce hepatic VLDL synthesis", "source_nutrient": "Omega-3", "amount": f"{omega3:.2f} g"})
    if cardio:
        effects["cardiovascular"] = {"parameters": cardio, "summary": f"{len(cardio)} cardiovascular effects identified"}
    
    # Glycemic System
    glycemic = []
    if sugars > 5:
        glycemic.append({"parameter": "blood_glucose", "change": f"+{min(sugars*3.5, 60):.0f} mg/dL", "direction": "increase", "mechanism": "Rapid glucose absorption from simple sugars", "source_nutrient": "Sugars", "amount": f"{sugars:.1f} g"})
    elif carbs > 15:
        glycemic.append({"parameter": "blood_glucose", "change": f"+{min(carbs*0.6, 35):.0f} mg/dL", "direction": "increase", "mechanism": "Carbohydrate digestion elevates blood glucose", "source_nutrient": "Carbohydrates", "amount": f"{carbs:.1f} g"})
    if fiber > 3:
        glycemic.append({"parameter": "insulin_sensitivity", "change": "+5-15%", "direction": "increase", "mechanism": "Fiber slows glucose absorption and improves insulin response", "source_nutrient": "Fiber", "amount": f"{fiber:.1f} g"})
        glycemic.append({"parameter": "postprandial_glucose_peak", "change": "-10-20%", "direction": "decrease", "mechanism": "Fiber delays gastric emptying", "source_nutrient": "Fiber", "amount": f"{fiber:.1f} g"})
    if glycemic:
        effects["glycemic"] = {"parameters": glycemic, "summary": f"{len(glycemic)} glycemic effects identified"}
    
    # Renal System
    renal = []
    if protein > 10:
        renal.append({"parameter": "bun", "change": f"+{min(protein*0.2, 8):.1f} mg/dL", "direction": "increase", "mechanism": "Protein metabolism generates urea as waste product", "source_nutrient": "Protein", "amount": f"{protein:.1f} g"})
    if potassium > 300:
        renal.append({"parameter": "serum_potassium", "change": f"+{min(potassium/400, 0.8):.2f} mEq/L", "direction": "increase", "mechanism": "High potassium intake increases serum levels", "source_nutrient": "Potassium", "amount": f"{potassium:.0f} mg"})
    if sodium > 500:
        renal.append({"parameter": "sodium_excretion", "change": "+25-50 mEq/day", "direction": "increase", "mechanism": "Kidneys excrete excess sodium", "source_nutrient": "Sodium", "amount": f"{sodium:.0f} mg"})
    if renal:
        effects["renal"] = {"parameters": renal, "summary": f"{len(renal)} renal effects identified"}
    
    # Hepatic System
    hepatic = []
    if fat_total > 15:
        hepatic.append({"parameter": "triglycerides", "change": f"+{min(fat_total*1.8, 40):.0f} mg/dL", "direction": "increase", "mechanism": "Excess dietary fat increases hepatic triglyceride synthesis", "source_nutrient": "Total Fat", "amount": f"{fat_total:.1f} g"})
    if sat_fat > 5:
        hepatic.append({"parameter": "hepatic_fat_content", "change": "+2-5%", "direction": "increase", "mechanism": "Saturated fats may contribute to hepatic lipid accumulation", "source_nutrient": "Saturated Fat", "amount": f"{sat_fat:.1f} g"})
    if fiber > 5:
        hepatic.append({"parameter": "bile_acid_excretion", "change": "+15-25%", "direction": "increase", "mechanism": "Fiber binds bile acids increasing fecal excretion", "source_nutrient": "Fiber", "amount": f"{fiber:.1f} g"})
    if hepatic:
        effects["hepatic"] = {"parameters": hepatic, "summary": f"{len(hepatic)} hepatic effects identified"}
    
    # Gastrointestinal System
    gi = []
    if fiber > 2:
        gi.append({"parameter": "transit_time", "change": "-2-6 hours", "direction": "decrease", "mechanism": "Fiber increases stool bulk and promotes peristalsis", "source_nutrient": "Fiber", "amount": f"{fiber:.1f} g"})
        gi.append({"parameter": "microbiome_diversity", "change": "+5-15%", "direction": "increase", "mechanism": "Fiber serves as prebiotic feeding beneficial gut bacteria", "source_nutrient": "Fiber", "amount": f"{fiber:.1f} g"})
    if protein > 20:
        gi.append({"parameter": "gastric_emptying_time", "change": "+15-30 min", "direction": "increase", "mechanism": "Protein slows gastric emptying promoting satiety", "source_nutrient": "Protein", "amount": f"{protein:.1f} g"})
    if gi:
        effects["gastrointestinal"] = {"parameters": gi, "summary": f"{len(gi)} gastrointestinal effects identified"}
    
    # Musculoskeletal System
    musculo = []
    if protein > 8:
        musculo.append({"parameter": "muscle_protein_synthesis", "change": f"+{min(protein*1.5, 35):.0f}%", "direction": "increase", "mechanism": "Amino acids stimulate mTOR pathway and MPS", "source_nutrient": "Protein", "amount": f"{protein:.1f} g"})
    if calcium > 50:
        musculo.append({"parameter": "bone_mineral_density", "change": "+0.3-1.2%", "direction": "increase", "mechanism": "Calcium supports bone matrix mineralization", "source_nutrient": "Calcium", "amount": f"{calcium:.0f} mg"})
    if vitamin_c > 10:
        musculo.append({"parameter": "collagen_synthesis", "change": "+10-20%", "direction": "increase", "mechanism": "Vitamin C is essential cofactor for collagen production", "source_nutrient": "Vitamin C", "amount": f"{vitamin_c:.0f} mg"})
    if musculo:
        effects["musculoskeletal"] = {"parameters": musculo, "summary": f"{len(musculo)} musculoskeletal effects identified"}
    
    # Immune System
    immune = []
    if vitamin_c > 10:
        immune.append({"parameter": "immune_cell_function", "change": "+10-25%", "direction": "increase", "mechanism": "Vitamin C enhances neutrophil and lymphocyte activity", "source_nutrient": "Vitamin C", "amount": f"{vitamin_c:.0f} mg"})
    if iron > 1:
        immune.append({"parameter": "oxygen_transport", "change": "+5-15%", "direction": "increase", "mechanism": "Iron supports hemoglobin and myoglobin synthesis", "source_nutrient": "Iron", "amount": f"{iron:.1f} mg"})
    if zinc := nutrients.get("zinc", {}).get("value", 0):
        if zinc > 1:
            immune.append({"parameter": "immune_response", "change": "+8-18%", "direction": "increase", "mechanism": "Zinc supports T-cell and NK cell function", "source_nutrient": "Zinc", "amount": f"{zinc:.1f} mg"})
    if immune:
        effects["immune"] = {"parameters": immune, "summary": f"{len(immune)} immune effects identified"}
    
    # Neurological System
    neuro = []
    if omega3 > 0.2:
        neuro.append({"parameter": "cognitive_function", "change": "+5-12%", "direction": "increase", "mechanism": "DHA supports neuronal membrane fluidity and signaling", "source_nutrient": "Omega-3", "amount": f"{omega3:.2f} g"})
    if choline := nutrients.get("choline", {}).get("value", 0):
        if choline > 50:
            neuro.append({"parameter": "acetylcholine_synthesis", "change": "+10-20%", "direction": "increase", "mechanism": "Choline is precursor for neurotransmitter synthesis", "source_nutrient": "Choline", "amount": f"{choline:.0f} mg"})
    if b12 := nutrients.get("vitamin_b12", {}).get("value", 0):
        if b12 > 0.5:
            neuro.append({"parameter": "myelin_synthesis", "change": "+5-15%", "direction": "increase", "mechanism": "B12 supports nerve myelination", "source_nutrient": "Vitamin B12", "amount": f"{b12:.1f} mcg"})
    if neuro:
        effects["neurological"] = {"parameters": neuro, "summary": f"{len(neuro)} neurological effects identified"}
    
    return effects

def categorize_food(food_data):
    """Categorize food based on USDA data type and food category"""
    data_type = food_data.get("dataType", "")
    category = food_data.get("foodCategory", {})
    cat_desc = category.get("description", "") if isinstance(category, dict) else str(category)
    
    # Map USDA categories to our categories
    category_map = {
        "Vegetables": "vegetables", "Fruits": "fruits", "Dairy": "dairy",
        "Beef": "meat", "Pork": "meat", "Poultry": "meat", "Lamb": "meat",
        "Fish": "seafood", "Shellfish": "seafood", "Seafood": "seafood",
        "Legumes": "legumes", "Beans": "legumes", "Nuts": "nuts_seeds", "Seeds": "nuts_seeds",
        "Grains": "grains", "Cereals": "grains", "Bread": "grains", "Pasta": "grains",
        "Beverages": "beverages", "Drinks": "beverages",
        "Sweets": "sweets", "Candy": "sweets", "Desserts": "desserts",
        "Snacks": "snacks", "Chips": "snacks",
        "Baby Foods": "baby_foods", "Infant": "baby_foods",
        "Baked": "baked_goods", "Breakfast": "breakfast",
        "Soups": "soups", "Sauces": "condiments", "Spices": "spices",
        "Fats": "fats_oils", "Oils": "fats_oils",
        "Fast Foods": "fast_food", "Restaurant": "restaurant",
    }
    
    for key, value in category_map.items():
        if key.lower() in cat_desc.lower():
            return value
    
    if data_type == "Branded":
        return "branded_foods"
    elif data_type == "Foundation":
        return "foundation_foods"
    elif data_type == "SR Legacy":
        return "sr_legacy"
    
    return "other"

def transform_usda_food(food_data):
    """Transform USDA food data to PhiCor format"""
    
    # Get basic info
    name = food_data.get("description", "").strip()
    if not name or len(name) < 2:
        return None
    
    # Extract brand if available
    brand = food_data.get("brandOwner", "") or food_data.get("brandName", "")
    if brand and brand not in name:
        display_name = f"{name} ({brand})"[:100]
    else:
        display_name = name[:100]
    
    # Get category
    category = categorize_food(food_data)
    
    # Extract nutrients
    nutrients = {}
    food_nutrients = food_data.get("foodNutrients", [])
    
    for fn in food_nutrients:
        nutrient_id = fn.get("nutrientId") or fn.get("nutrient", {}).get("id")
        if nutrient_id and nutrient_id in USDA_NUTRIENT_MAP:
            mapping = USDA_NUTRIENT_MAP[nutrient_id]
            value = fn.get("value") or fn.get("amount", 0)
            if value and value > 0:
                dv = DAILY_VALUES.get(mapping["key"])
                nutrients[mapping["key"]] = {
                    "value": round(value, 2),
                    "unit": mapping["unit"],
                    "name": mapping["name"],
                    "percent_dv": round((value / dv) * 100, 1) if dv else None
                }
    
    if not nutrients:
        return None
    
    # Get serving size
    serving_size = food_data.get("servingSize", 100)
    serving_unit = food_data.get("servingSizeUnit", "g")
    household_serving = food_data.get("householdServingFullText", "")
    
    if household_serving:
        serving_display = f"{household_serving} ({serving_size}{serving_unit})"
    else:
        serving_display = f"{serving_size}{serving_unit}"
    
    # Calculate organ effects
    organ_effects = calculate_organ_effects(nutrients)
    
    # Build food document
    food_doc = {
        "id": str(uuid.uuid4()),
        "food_id": str(uuid.uuid4()),
        "fdc_id": food_data.get("fdcId"),
        "name": display_name,
        "category": category,
        "source": "USDA FoodData Central",
        "data_type": food_data.get("dataType", ""),
        "serving_size": serving_display,
        "serving_size_g": float(serving_size) if serving_size else 100,
        "nutrients": nutrients,
        "organ_effects": organ_effects,
        "brand": brand,
        "gtin_upc": food_data.get("gtinUpc", ""),
        "ingredients": food_data.get("ingredients", "")[:1000] if food_data.get("ingredients") else None,
        "food_category": food_data.get("foodCategory", {}).get("description") if isinstance(food_data.get("foodCategory"), dict) else food_data.get("foodCategory"),
        "publication_date": food_data.get("publicationDate"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    
    return food_doc

def fetch_usda_foods_page(page_number=1, page_size=200, data_type=None):
    """Fetch a page of foods from USDA API"""
    url = f"{USDA_BASE_URL}/foods/list"
    params = {
        "api_key": USDA_API_KEY,
        "pageNumber": page_number,
        "pageSize": page_size,
    }
    if data_type:
        params["dataType"] = [data_type]  # Must be a list
    
    try:
        response = requests.get(url, params=params, timeout=30)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"  Error fetching page {page_number}: {response.status_code}")
            return []
    except Exception as e:
        print(f"  Exception fetching page {page_number}: {e}")
        return []

def fetch_food_details(fdc_ids):
    """Fetch detailed food info for multiple FDC IDs"""
    url = f"{USDA_BASE_URL}/foods"
    
    try:
        response = requests.post(
            url,
            params={"api_key": USDA_API_KEY},
            json={"fdcIds": fdc_ids},
            timeout=60
        )
        if response.status_code == 200:
            return response.json()
        else:
            print(f"  Error fetching details: {response.status_code}")
            return []
    except Exception as e:
        print(f"  Exception fetching details: {e}")
        return []

async def update_live_stats():
    """Update stats so landing page shows real-time counts"""
    foods_count = await db.foods.count_documents({})
    nutrients_count = await db.nutrients.count_documents({})
    
    # Update a stats document that can be queried
    await db.live_stats.update_one(
        {"id": "food_import_progress"},
        {
            "$set": {
                "foods_count": foods_count,
                "nutrients_count": nutrients_count,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    return foods_count

async def import_usda_foods(max_foods=10000, batch_size=200):
    """Import foods from USDA FoodData Central API"""
    
    if not USDA_API_KEY:
        print("ERROR: USDA_API_KEY not found in environment")
        return 0
    
    print(f"Starting USDA FoodData Central import (target: {max_foods} foods)...")
    
    # Get existing FDC IDs to avoid duplicates
    existing_fdc_ids = set()
    existing_names = set()
    cursor = db.foods.find({}, {"_id": 0, "fdc_id": 1, "name": 1})
    async for doc in cursor:
        if doc.get("fdc_id"):
            existing_fdc_ids.add(doc["fdc_id"])
        existing_names.add(doc.get("name", "").lower())
    
    print(f"Found {len(existing_fdc_ids)} existing USDA foods to skip")
    
    imported = 0
    
    # Import from different data types for variety
    data_types = [
        ("Foundation", 1500),      # High-quality foundational foods
        ("SR Legacy", 4000),       # Standard Reference (legacy database)
        ("Branded", 4500),         # Branded/commercial products
    ]
    
    for data_type, type_limit in data_types:
        if imported >= max_foods:
            break
            
        print(f"\n📦 Importing {data_type} foods (limit: {type_limit})...")
        type_imported = 0
        page = 1
        consecutive_empty = 0
        
        while type_imported < type_limit and imported < max_foods:
            # Get list of foods
            foods_list = fetch_usda_foods_page(page, batch_size, data_type)
            
            if not foods_list:
                consecutive_empty += 1
                if consecutive_empty >= 3:
                    print(f"  No more {data_type} foods available")
                    break
                page += 1
                time.sleep(0.5)
                continue
            
            consecutive_empty = 0
            
            # Filter out existing and get FDC IDs to fetch
            fdc_ids_to_fetch = []
            for food in foods_list:
                fdc_id = food.get("fdcId")
                if fdc_id and fdc_id not in existing_fdc_ids:
                    fdc_ids_to_fetch.append(fdc_id)
            
            if not fdc_ids_to_fetch:
                page += 1
                continue
            
            # Fetch detailed info in batches of 20
            for i in range(0, len(fdc_ids_to_fetch), 20):
                batch_ids = fdc_ids_to_fetch[i:i+20]
                detailed_foods = fetch_food_details(batch_ids)
                
                if not detailed_foods:
                    continue
                
                foods_to_insert = []
                for food_data in detailed_foods:
                    fdc_id = food_data.get("fdcId")
                    if fdc_id in existing_fdc_ids:
                        continue
                    
                    food_doc = transform_usda_food(food_data)
                    if food_doc and food_doc["name"].lower() not in existing_names:
                        foods_to_insert.append(food_doc)
                        existing_fdc_ids.add(fdc_id)
                        existing_names.add(food_doc["name"].lower())
                
                # Insert batch
                if foods_to_insert:
                    try:
                        await db.foods.insert_many(foods_to_insert, ordered=False)
                        imported += len(foods_to_insert)
                        type_imported += len(foods_to_insert)
                    except Exception as e:
                        for food in foods_to_insert:
                            try:
                                await db.foods.insert_one(food)
                                imported += 1
                                type_imported += 1
                            except:
                                pass
                
                # Rate limiting
                time.sleep(0.2)
            
            # Update live stats periodically
            if imported % 200 == 0 and imported > 0:
                current_count = await update_live_stats()
                print(f"  📊 Progress: {imported} imported ({type_imported} {data_type}), {current_count} total foods")
            
            page += 1
        
        print(f"  ✅ {data_type}: Imported {type_imported} foods")
    
    # Final stats update
    final_count = await update_live_stats()
    print(f"\n{'='*60}")
    print(f"USDA Import Complete!")
    print(f"Total imported this session: {imported}")
    print(f"Total foods in database: {final_count}")
    print(f"{'='*60}")
    
    return imported

async def main():
    print("=" * 60)
    print("PhiCor.ai - USDA FoodData Central Importer")
    print("=" * 60)
    
    before = await db.foods.count_documents({})
    print(f"\nFoods before import: {before}")
    
    # Import up to 10,000 foods
    imported = await import_usda_foods(max_foods=10000, batch_size=200)
    
    after = await db.foods.count_documents({})
    print(f"\nFoods after import: {after}")
    print(f"Net increase: {after - before}")
    
    # Show category breakdown
    pipeline = [
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    sources = await db.foods.aggregate(pipeline).to_list(10)
    print("\nFoods by source:")
    for src in sources:
        print(f"  {src['_id']}: {src['count']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
