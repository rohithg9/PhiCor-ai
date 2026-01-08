#!/usr/bin/env python3
"""
Open Food Facts Importer for PhiCor.ai
Imports branded foods, international products, and nutritional data from Open Food Facts API
"""
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import uuid
import requests
import time

load_dotenv()

# MongoDB connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

# Open Food Facts API base URL
OFF_API_BASE = "https://world.openfoodfacts.org/api/v2"
OFF_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl"

# Categories to import from Open Food Facts
CATEGORIES_TO_IMPORT = [
    # Popular branded categories
    "beverages", "sodas", "juices", "energy-drinks", "teas", "coffees",
    "cereals", "breakfast-cereals", "mueslis", "granolas",
    "chocolates", "chocolate-bars", "candies", "sweets",
    "chips", "crisps", "snacks", "crackers", "cookies", "biscuits",
    "breads", "bread-loaves", "bagels", "croissants",
    "pizzas", "frozen-pizzas", "frozen-meals",
    "yogurts", "dairy-desserts", "ice-creams",
    "pasta", "noodles", "ramen", "instant-noodles",
    "sauces", "condiments", "ketchup", "mayonnaise", "mustard",
    "cheeses", "processed-cheeses", "cream-cheeses",
    "meats", "sausages", "hams", "bacons",
    "plant-based-foods", "plant-based-meats", "tofu",
    "organic-foods", "gluten-free-foods",
    # International
    "asian-foods", "mexican-foods", "indian-foods", "italian-foods",
]

# Nutrient mapping from Open Food Facts to our schema
NUTRIENT_MAPPING = {
    "energy-kcal_100g": "energy",
    "proteins_100g": "protein",
    "carbohydrates_100g": "carbohydrates",
    "sugars_100g": "sugars",
    "fiber_100g": "fiber",
    "fat_100g": "fat_total",
    "saturated-fat_100g": "fat_saturated",
    "sodium_100g": "sodium",
    "salt_100g": "salt",
    "calcium_100g": "calcium",
    "iron_100g": "iron",
    "potassium_100g": "potassium",
    "vitamin-a_100g": "vitamin_a",
    "vitamin-c_100g": "vitamin_c",
    "vitamin-d_100g": "vitamin_d",
    "vitamin-e_100g": "vitamin_e",
    "cholesterol_100g": "cholesterol",
    "trans-fat_100g": "fat_trans",
}

def calculate_organ_effects(nutrients):
    """Calculate organ system effects based on nutrient composition"""
    effects = {}
    
    # Cardiovascular effects
    cardio_effects = []
    if nutrients.get("sodium", {}).get("value", 0) > 500:
        cardio_effects.append({
            "parameter": "blood_pressure_systolic",
            "change": "+2-5 mmHg",
            "direction": "increase",
            "mechanism": "High sodium increases blood volume and vascular resistance",
            "source_nutrient": "Sodium"
        })
    if nutrients.get("potassium", {}).get("value", 0) > 200:
        cardio_effects.append({
            "parameter": "blood_pressure_systolic",
            "change": "-1-2 mmHg",
            "direction": "decrease",
            "mechanism": "Potassium promotes vasodilation and sodium excretion",
            "source_nutrient": "Potassium"
        })
    if nutrients.get("fat_saturated", {}).get("value", 0) > 5:
        cardio_effects.append({
            "parameter": "ldl_cholesterol",
            "change": "+5-10 mg/dL",
            "direction": "increase",
            "mechanism": "Saturated fats increase hepatic LDL cholesterol synthesis",
            "source_nutrient": "Saturated Fat"
        })
    if cardio_effects:
        effects["cardiovascular"] = {"parameters": cardio_effects}
    
    # Glycemic effects
    glycemic_effects = []
    if nutrients.get("sugars", {}).get("value", 0) > 10:
        glycemic_effects.append({
            "parameter": "blood_glucose",
            "change": "+15-40 mg/dL",
            "direction": "increase",
            "mechanism": "Rapid glucose absorption from simple sugars",
            "source_nutrient": "Sugars"
        })
    if nutrients.get("fiber", {}).get("value", 0) > 3:
        glycemic_effects.append({
            "parameter": "blood_glucose",
            "change": "-5-10 mg/dL",
            "direction": "decrease",
            "mechanism": "Fiber slows glucose absorption and improves insulin sensitivity",
            "source_nutrient": "Fiber"
        })
    if glycemic_effects:
        effects["glycemic"] = {"parameters": glycemic_effects}
    
    # Renal effects
    renal_effects = []
    if nutrients.get("protein", {}).get("value", 0) > 20:
        renal_effects.append({
            "parameter": "bun",
            "change": "+2-5 mg/dL",
            "direction": "increase",
            "mechanism": "Increased protein metabolism generates urea",
            "source_nutrient": "Protein"
        })
    if nutrients.get("sodium", {}).get("value", 0) > 500:
        renal_effects.append({
            "parameter": "sodium_serum",
            "change": "+0.5-1 mEq/L",
            "direction": "increase",
            "mechanism": "High sodium intake increases serum sodium",
            "source_nutrient": "Sodium"
        })
    if renal_effects:
        effects["renal"] = {"parameters": renal_effects}
    
    # Hepatic effects
    hepatic_effects = []
    if nutrients.get("fat_total", {}).get("value", 0) > 20:
        hepatic_effects.append({
            "parameter": "triglycerides",
            "change": "+10-30 mg/dL",
            "direction": "increase",
            "mechanism": "Excess dietary fat increases hepatic triglyceride synthesis",
            "source_nutrient": "Total Fat"
        })
    if nutrients.get("fat_saturated", {}).get("value", 0) > 5:
        hepatic_effects.append({
            "parameter": "alt",
            "change": "+2-5 U/L",
            "direction": "increase",
            "mechanism": "Saturated fats may contribute to hepatic lipotoxicity",
            "source_nutrient": "Saturated Fat"
        })
    if hepatic_effects:
        effects["hepatic"] = {"parameters": hepatic_effects}
    
    # Gastrointestinal effects
    gi_effects = []
    if nutrients.get("fiber", {}).get("value", 0) > 3:
        gi_effects.append({
            "parameter": "gut_transit_time",
            "change": "-2-4 hours",
            "direction": "decrease",
            "mechanism": "Fiber increases stool bulk and promotes peristalsis",
            "source_nutrient": "Fiber"
        })
    if gi_effects:
        effects["gastrointestinal"] = {"parameters": gi_effects}
    
    return effects

def transform_off_product(product):
    """Transform Open Food Facts product to PhiCor format"""
    
    # Extract basic info
    name = product.get("product_name", "").strip()
    if not name or len(name) < 2:
        return None
    
    brands = product.get("brands", "")
    if brands:
        name = f"{name} ({brands.split(',')[0].strip()})"
    
    # Get category
    categories = product.get("categories_tags", [])
    category = "processed_foods"
    if categories:
        first_cat = categories[0].replace("en:", "").replace("-", "_")
        category = first_cat
    
    # Extract nutrients
    nutriments = product.get("nutriments", {})
    nutrients = {}
    
    for off_key, our_key in NUTRIENT_MAPPING.items():
        if off_key in nutriments:
            value = nutriments[off_key]
            if isinstance(value, (int, float)) and value >= 0:
                # Determine unit based on nutrient type
                if "vitamin" in our_key.lower():
                    unit = "mcg" if "vitamin_d" in our_key else "mg"
                elif our_key in ["energy"]:
                    unit = "kcal"
                elif our_key in ["cholesterol", "sodium", "potassium", "calcium", "iron"]:
                    unit = "mg"
                else:
                    unit = "g"
                
                nutrients[our_key] = {"value": round(value, 2), "unit": unit}
    
    if not nutrients:
        return None
    
    # Get serving size
    serving_size = product.get("serving_size", "100g")
    serving_size_g = 100
    if product.get("serving_quantity"):
        try:
            serving_size_g = float(product["serving_quantity"])
        except:
            pass
    
    # Calculate organ effects
    organ_effects = calculate_organ_effects(nutrients)
    
    # Get nutriscore and nova
    nutriscore = product.get("nutriscore_grade", "").upper()
    nova_group = product.get("nova_group")
    
    # Build food document
    food_doc = {
        "id": str(uuid.uuid4()),  # Main ID field for MongoDB index
        "food_id": str(uuid.uuid4()),
        "name": name[:100],  # Limit name length
        "category": category[:50],
        "source": "open_food_facts",
        "barcode": product.get("code"),
        "serving_size": serving_size,
        "serving_size_g": serving_size_g,
        "nutrients": nutrients,
        "organ_effects": organ_effects,
        "brands": brands,
        "countries": product.get("countries", ""),
        "nutriscore": nutriscore if nutriscore in ["A", "B", "C", "D", "E"] else None,
        "nova_group": nova_group,
        "ingredients": product.get("ingredients_text", "")[:500] if product.get("ingredients_text") else None,
        "allergens": product.get("allergens", ""),
        "image_url": product.get("image_url", ""),
    }
    
    return food_doc

def search_off_products(query, page=1, page_size=100):
    """Search Open Food Facts for products"""
    params = {
        "search_terms": query,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page": page,
        "page_size": page_size,
        "fields": "code,product_name,brands,categories_tags,nutriments,serving_size,serving_quantity,nutriscore_grade,nova_group,ingredients_text,allergens,countries,image_url"
    }
    
    headers = {"User-Agent": "PhiCor.ai/1.0 (https://phicor.ai; contact@phicor.ai)"}
    
    try:
        response = requests.get(OFF_SEARCH_URL, params=params, headers=headers, timeout=30)
        if response.status_code == 200:
            data = response.json()
            return data.get("products", [])
    except Exception as e:
        print(f"Error searching OFF: {e}")
    
    return []

async def import_from_open_food_facts(max_products=500):
    """Import products from Open Food Facts"""
    
    # Search queries for diverse products
    search_queries = [
        # Branded products
        "coca cola", "pepsi", "nestle", "kraft", "kelloggs", "general mills",
        "doritos", "lays", "pringles", "oreo", "chips ahoy",
        "nutella", "ferrero", "lindt", "godiva", "hershey",
        "red bull", "monster energy", "gatorade", "powerade",
        "starbucks", "dunkin", "green tea", "iced tea",
        # Fast food items
        "mcdonalds", "burger king", "wendys", "subway", "pizza hut",
        "taco bell", "chipotle", "kfc", "chick fil a",
        # Healthy/Organic brands
        "organic", "whole foods", "trader joes", "amy's",
        "kind bar", "clif bar", "rxbar", "quest bar",
        "oatly", "silk", "almond breeze", "beyond meat", "impossible",
        # International foods
        "pocky", "ramune", "mochi", "matcha",
        "masala", "tikka", "curry", "biryani", "naan",
        "kimchi", "gochujang", "bibimbap",
        "pho", "banh mi", "spring roll",
        "tacos", "enchiladas", "churros", "empanadas",
        # Snacks & desserts
        "ice cream", "gelato", "frozen yogurt",
        "chocolate cake", "brownie", "muffin", "croissant",
        "popcorn", "pretzels", "trail mix", "granola",
    ]
    
    imported = 0
    existing_names = set()
    
    # Get existing food names to avoid duplicates
    cursor = db.foods.find({}, {"_id": 0, "name": 1})
    async for doc in cursor:
        existing_names.add(doc["name"].lower())
    
    print(f"Starting import from Open Food Facts...")
    print(f"Existing foods in database: {len(existing_names)}")
    
    foods_to_insert = []
    
    for query in search_queries:
        if imported >= max_products:
            break
        
        print(f"\nSearching for: {query}")
        products = search_off_products(query, page_size=50)
        
        for product in products:
            if imported >= max_products:
                break
            
            food_doc = transform_off_product(product)
            if food_doc and food_doc["name"].lower() not in existing_names:
                existing_names.add(food_doc["name"].lower())
                foods_to_insert.append(food_doc)
                imported += 1
                
                if imported % 50 == 0:
                    print(f"  Processed {imported} products...")
        
        # Rate limiting - be nice to the API
        time.sleep(0.5)
    
    # Insert one by one to handle duplicates
    if foods_to_insert:
        inserted = 0
        for food in foods_to_insert:
            try:
                await db.foods.insert_one(food)
                inserted += 1
            except Exception as e:
                pass  # Skip duplicates silently
        print(f"\n✅ Successfully imported {inserted} products from Open Food Facts!")
        return inserted
    
    return 0

async def main():
    """Main function to run the importer"""
    print("=" * 60)
    print("PhiCor.ai - Open Food Facts Importer")
    print("=" * 60)
    
    # Get current counts
    current_foods = await db.foods.count_documents({})
    print(f"\nCurrent food count: {current_foods}")
    
    # Import from Open Food Facts
    imported = await import_from_open_food_facts(max_products=300)
    
    # Final count
    final_foods = await db.foods.count_documents({})
    print(f"\n{'=' * 60}")
    print(f"Import Complete!")
    print(f"Foods before: {current_foods}")
    print(f"Foods imported: {imported}")
    print(f"Foods after: {final_foods}")
    print(f"{'=' * 60}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
