"""
PhiCor Food Engine - Additional Common Foods
Adds more commonly searched foods to the database
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

ADDITIONAL_FOODS = [
    # ============================================================
    # BREAKFAST FOODS
    # ============================================================
    {
        "id": "eggs_scrambled",
        "name": "Eggs, Scrambled",
        "description": "Scrambled eggs made with butter",
        "category": "breakfast",
        "serving_size": 91,
        "nutrients": {
            "energy": {"value": 147, "unit": "kcal", "percent_daily_value": 7},
            "protein": {"value": 10, "unit": "g", "percent_daily_value": 20},
            "carbohydrates": {"value": 1.6, "unit": "g", "percent_daily_value": 1},
            "fat_total": {"value": 11, "unit": "g", "percent_daily_value": 14},
            "fat_saturated": {"value": 4.1, "unit": "g", "percent_daily_value": 21},
            "cholesterol": {"value": 286, "unit": "mg", "percent_daily_value": 95},
            "sodium": {"value": 171, "unit": "mg", "percent_daily_value": 7},
            "potassium": {"value": 94, "unit": "mg", "percent_daily_value": 2},
            "vitamin_a": {"value": 172, "unit": "mcg", "percent_daily_value": 19},
            "vitamin_d": {"value": 1.3, "unit": "mcg", "percent_daily_value": 7},
            "vitamin_b12": {"value": 0.9, "unit": "mcg", "percent_daily_value": 38},
            "selenium": {"value": 22, "unit": "mcg", "percent_daily_value": 40},
            "choline": {"value": 186, "unit": "mg", "percent_daily_value": 34},
        },
    },
    {
        "id": "oatmeal_cooked",
        "name": "Oatmeal, Cooked",
        "description": "Plain oatmeal cooked with water",
        "category": "breakfast",
        "serving_size": 234,
        "nutrients": {
            "energy": {"value": 158, "unit": "kcal", "percent_daily_value": 8},
            "protein": {"value": 6, "unit": "g", "percent_daily_value": 12},
            "carbohydrates": {"value": 27, "unit": "g", "percent_daily_value": 9},
            "fiber": {"value": 4, "unit": "g", "percent_daily_value": 14},
            "fat_total": {"value": 3, "unit": "g", "percent_daily_value": 4},
            "sodium": {"value": 115, "unit": "mg", "percent_daily_value": 5},
            "potassium": {"value": 164, "unit": "mg", "percent_daily_value": 3},
            "iron": {"value": 2.1, "unit": "mg", "percent_daily_value": 12},
            "magnesium": {"value": 56, "unit": "mg", "percent_daily_value": 13},
            "phosphorus": {"value": 180, "unit": "mg", "percent_daily_value": 14},
            "zinc": {"value": 2.3, "unit": "mg", "percent_daily_value": 21},
        },
        "bioactive_compounds": ["beta_glucan", "avenanthramides"],
    },
    {
        "id": "toast_whole_wheat",
        "name": "Toast, Whole Wheat",
        "description": "Toasted whole wheat bread, 1 slice",
        "category": "breakfast",
        "serving_size": 25,
        "nutrients": {
            "energy": {"value": 67, "unit": "kcal", "percent_daily_value": 3},
            "protein": {"value": 3.6, "unit": "g", "percent_daily_value": 7},
            "carbohydrates": {"value": 12, "unit": "g", "percent_daily_value": 4},
            "fiber": {"value": 1.9, "unit": "g", "percent_daily_value": 7},
            "fat_total": {"value": 1.1, "unit": "g", "percent_daily_value": 1},
            "sodium": {"value": 132, "unit": "mg", "percent_daily_value": 6},
            "iron": {"value": 0.7, "unit": "mg", "percent_daily_value": 4},
            "manganese": {"value": 0.6, "unit": "mg", "percent_daily_value": 26},
        },
    },
    {
        "id": "pancakes",
        "name": "Pancakes",
        "description": "Buttermilk pancakes, 2 medium",
        "category": "breakfast",
        "serving_size": 152,
        "nutrients": {
            "energy": {"value": 310, "unit": "kcal", "percent_daily_value": 16},
            "protein": {"value": 8, "unit": "g", "percent_daily_value": 16},
            "carbohydrates": {"value": 43, "unit": "g", "percent_daily_value": 14},
            "fiber": {"value": 1.2, "unit": "g", "percent_daily_value": 4},
            "sugars": {"value": 10, "unit": "g"},
            "fat_total": {"value": 12, "unit": "g", "percent_daily_value": 15},
            "sodium": {"value": 576, "unit": "mg", "percent_daily_value": 24},
            "calcium": {"value": 146, "unit": "mg", "percent_daily_value": 11},
        },
    },
    
    # ============================================================
    # FAST FOOD / POPULAR ITEMS
    # ============================================================
    {
        "id": "pizza_cheese",
        "name": "Pizza, Cheese",
        "description": "Cheese pizza, regular crust, 1 slice",
        "category": "fast_food",
        "serving_size": 107,
        "nutrients": {
            "energy": {"value": 285, "unit": "kcal", "percent_daily_value": 14},
            "protein": {"value": 12, "unit": "g", "percent_daily_value": 24},
            "carbohydrates": {"value": 36, "unit": "g", "percent_daily_value": 12},
            "fiber": {"value": 2.5, "unit": "g", "percent_daily_value": 9},
            "sugars": {"value": 4, "unit": "g"},
            "fat_total": {"value": 10, "unit": "g", "percent_daily_value": 13},
            "fat_saturated": {"value": 4.8, "unit": "g", "percent_daily_value": 24},
            "sodium": {"value": 640, "unit": "mg", "percent_daily_value": 27},
            "calcium": {"value": 219, "unit": "mg", "percent_daily_value": 17},
        },
    },
    {
        "id": "hamburger",
        "name": "Hamburger",
        "description": "Single patty hamburger with bun",
        "category": "fast_food",
        "serving_size": 110,
        "nutrients": {
            "energy": {"value": 295, "unit": "kcal", "percent_daily_value": 15},
            "protein": {"value": 17, "unit": "g", "percent_daily_value": 34},
            "carbohydrates": {"value": 24, "unit": "g", "percent_daily_value": 8},
            "fiber": {"value": 1.3, "unit": "g", "percent_daily_value": 5},
            "fat_total": {"value": 14, "unit": "g", "percent_daily_value": 18},
            "fat_saturated": {"value": 5.2, "unit": "g", "percent_daily_value": 26},
            "cholesterol": {"value": 50, "unit": "mg", "percent_daily_value": 17},
            "sodium": {"value": 378, "unit": "mg", "percent_daily_value": 16},
            "iron": {"value": 2.9, "unit": "mg", "percent_daily_value": 16},
            "zinc": {"value": 3.8, "unit": "mg", "percent_daily_value": 35},
        },
    },
    {
        "id": "french_fries",
        "name": "French Fries",
        "description": "Medium serving of french fries",
        "category": "fast_food",
        "serving_size": 117,
        "nutrients": {
            "energy": {"value": 365, "unit": "kcal", "percent_daily_value": 18},
            "protein": {"value": 4, "unit": "g", "percent_daily_value": 8},
            "carbohydrates": {"value": 48, "unit": "g", "percent_daily_value": 16},
            "fiber": {"value": 4.4, "unit": "g", "percent_daily_value": 16},
            "fat_total": {"value": 17, "unit": "g", "percent_daily_value": 22},
            "fat_saturated": {"value": 2.7, "unit": "g", "percent_daily_value": 14},
            "sodium": {"value": 246, "unit": "mg", "percent_daily_value": 10},
            "potassium": {"value": 541, "unit": "mg", "percent_daily_value": 12},
            "vitamin_c": {"value": 9, "unit": "mg", "percent_daily_value": 10},
        },
    },
    {
        "id": "fried_chicken",
        "name": "Fried Chicken",
        "description": "Fried chicken drumstick with skin",
        "category": "fast_food",
        "serving_size": 72,
        "nutrients": {
            "energy": {"value": 193, "unit": "kcal", "percent_daily_value": 10},
            "protein": {"value": 16, "unit": "g", "percent_daily_value": 32},
            "carbohydrates": {"value": 6, "unit": "g", "percent_daily_value": 2},
            "fat_total": {"value": 11, "unit": "g", "percent_daily_value": 14},
            "fat_saturated": {"value": 3, "unit": "g", "percent_daily_value": 15},
            "cholesterol": {"value": 62, "unit": "mg", "percent_daily_value": 21},
            "sodium": {"value": 194, "unit": "mg", "percent_daily_value": 8},
            "iron": {"value": 0.8, "unit": "mg", "percent_daily_value": 4},
        },
    },
    {
        "id": "burrito",
        "name": "Burrito, Bean and Cheese",
        "description": "Bean and cheese burrito",
        "category": "fast_food",
        "serving_size": 186,
        "nutrients": {
            "energy": {"value": 380, "unit": "kcal", "percent_daily_value": 19},
            "protein": {"value": 15, "unit": "g", "percent_daily_value": 30},
            "carbohydrates": {"value": 55, "unit": "g", "percent_daily_value": 18},
            "fiber": {"value": 10, "unit": "g", "percent_daily_value": 36},
            "fat_total": {"value": 12, "unit": "g", "percent_daily_value": 15},
            "sodium": {"value": 850, "unit": "mg", "percent_daily_value": 35},
            "calcium": {"value": 214, "unit": "mg", "percent_daily_value": 16},
            "iron": {"value": 3.5, "unit": "mg", "percent_daily_value": 19},
        },
    },
    
    # ============================================================
    # BEVERAGES
    # ============================================================
    {
        "id": "coffee_black",
        "name": "Coffee, Black",
        "description": "Brewed coffee without additives",
        "category": "beverages",
        "serving_size": 240,
        "nutrients": {
            "energy": {"value": 2, "unit": "kcal", "percent_daily_value": 0},
            "protein": {"value": 0.3, "unit": "g", "percent_daily_value": 1},
            "carbohydrates": {"value": 0, "unit": "g", "percent_daily_value": 0},
            "fat_total": {"value": 0, "unit": "g", "percent_daily_value": 0},
            "sodium": {"value": 5, "unit": "mg", "percent_daily_value": 0},
            "potassium": {"value": 116, "unit": "mg", "percent_daily_value": 2},
            "magnesium": {"value": 7, "unit": "mg", "percent_daily_value": 2},
            "niacin": {"value": 0.5, "unit": "mg", "percent_daily_value": 3},
        },
        "bioactive_compounds": ["caffeine", "chlorogenic_acid", "trigonelline"],
    },
    {
        "id": "green_tea",
        "name": "Green Tea",
        "description": "Brewed green tea, unsweetened",
        "category": "beverages",
        "serving_size": 245,
        "nutrients": {
            "energy": {"value": 2, "unit": "kcal", "percent_daily_value": 0},
            "protein": {"value": 0, "unit": "g", "percent_daily_value": 0},
            "carbohydrates": {"value": 0, "unit": "g", "percent_daily_value": 0},
            "fat_total": {"value": 0, "unit": "g", "percent_daily_value": 0},
            "sodium": {"value": 2, "unit": "mg", "percent_daily_value": 0},
            "potassium": {"value": 20, "unit": "mg", "percent_daily_value": 0},
            "manganese": {"value": 0.4, "unit": "mg", "percent_daily_value": 17},
        },
        "bioactive_compounds": ["EGCG", "L-theanine", "catechins", "caffeine"],
    },
    {
        "id": "orange_juice",
        "name": "Orange Juice",
        "description": "Fresh squeezed orange juice",
        "category": "beverages",
        "serving_size": 248,
        "nutrients": {
            "energy": {"value": 112, "unit": "kcal", "percent_daily_value": 6},
            "protein": {"value": 1.7, "unit": "g", "percent_daily_value": 3},
            "carbohydrates": {"value": 26, "unit": "g", "percent_daily_value": 9},
            "sugars": {"value": 21, "unit": "g"},
            "fat_total": {"value": 0.5, "unit": "g", "percent_daily_value": 1},
            "sodium": {"value": 2, "unit": "mg", "percent_daily_value": 0},
            "potassium": {"value": 496, "unit": "mg", "percent_daily_value": 11},
            "vitamin_c": {"value": 124, "unit": "mg", "percent_daily_value": 138},
            "folate": {"value": 74, "unit": "mcg", "percent_daily_value": 19},
        },
    },
    {
        "id": "soda_cola",
        "name": "Soda, Cola",
        "description": "Regular cola soft drink",
        "category": "beverages",
        "serving_size": 355,
        "nutrients": {
            "energy": {"value": 140, "unit": "kcal", "percent_daily_value": 7},
            "protein": {"value": 0, "unit": "g", "percent_daily_value": 0},
            "carbohydrates": {"value": 39, "unit": "g", "percent_daily_value": 13},
            "sugars": {"value": 39, "unit": "g"},
            "fat_total": {"value": 0, "unit": "g", "percent_daily_value": 0},
            "sodium": {"value": 45, "unit": "mg", "percent_daily_value": 2},
            "phosphorus": {"value": 44, "unit": "mg", "percent_daily_value": 4},
        },
        "bioactive_compounds": ["caffeine", "phosphoric_acid"],
    },
    {
        "id": "smoothie_mixed_berry",
        "name": "Smoothie, Mixed Berry",
        "description": "Mixed berry smoothie with yogurt",
        "category": "beverages",
        "serving_size": 280,
        "nutrients": {
            "energy": {"value": 180, "unit": "kcal", "percent_daily_value": 9},
            "protein": {"value": 6, "unit": "g", "percent_daily_value": 12},
            "carbohydrates": {"value": 36, "unit": "g", "percent_daily_value": 12},
            "fiber": {"value": 4, "unit": "g", "percent_daily_value": 14},
            "sugars": {"value": 28, "unit": "g"},
            "fat_total": {"value": 2, "unit": "g", "percent_daily_value": 3},
            "sodium": {"value": 80, "unit": "mg", "percent_daily_value": 3},
            "potassium": {"value": 420, "unit": "mg", "percent_daily_value": 9},
            "vitamin_c": {"value": 45, "unit": "mg", "percent_daily_value": 50},
            "calcium": {"value": 180, "unit": "mg", "percent_daily_value": 14},
        },
        "bioactive_compounds": ["anthocyanins", "probiotics"],
    },
    
    # ============================================================
    # SNACKS
    # ============================================================
    {
        "id": "almonds_raw",
        "name": "Almonds, Raw",
        "description": "Raw almonds, 1 oz serving",
        "category": "nuts_seeds",
        "serving_size": 28,
        "nutrients": {
            "energy": {"value": 164, "unit": "kcal", "percent_daily_value": 8},
            "protein": {"value": 6, "unit": "g", "percent_daily_value": 12},
            "carbohydrates": {"value": 6, "unit": "g", "percent_daily_value": 2},
            "fiber": {"value": 3.5, "unit": "g", "percent_daily_value": 13},
            "fat_total": {"value": 14, "unit": "g", "percent_daily_value": 18},
            "fat_saturated": {"value": 1.1, "unit": "g", "percent_daily_value": 6},
            "sodium": {"value": 0, "unit": "mg", "percent_daily_value": 0},
            "potassium": {"value": 208, "unit": "mg", "percent_daily_value": 4},
            "magnesium": {"value": 77, "unit": "mg", "percent_daily_value": 18},
            "vitamin_e": {"value": 7.3, "unit": "mg", "percent_daily_value": 49},
            "calcium": {"value": 76, "unit": "mg", "percent_daily_value": 6},
        },
        "bioactive_compounds": ["phytosterols", "polyphenols"],
    },
    {
        "id": "potato_chips",
        "name": "Potato Chips",
        "description": "Regular salted potato chips",
        "category": "snacks",
        "serving_size": 28,
        "nutrients": {
            "energy": {"value": 152, "unit": "kcal", "percent_daily_value": 8},
            "protein": {"value": 2, "unit": "g", "percent_daily_value": 4},
            "carbohydrates": {"value": 15, "unit": "g", "percent_daily_value": 5},
            "fiber": {"value": 1.2, "unit": "g", "percent_daily_value": 4},
            "fat_total": {"value": 10, "unit": "g", "percent_daily_value": 13},
            "fat_saturated": {"value": 3.1, "unit": "g", "percent_daily_value": 16},
            "sodium": {"value": 147, "unit": "mg", "percent_daily_value": 6},
            "potassium": {"value": 361, "unit": "mg", "percent_daily_value": 8},
        },
    },
    {
        "id": "dark_chocolate",
        "name": "Dark Chocolate",
        "description": "Dark chocolate, 70-85% cacao",
        "category": "sweets",
        "serving_size": 28,
        "nutrients": {
            "energy": {"value": 170, "unit": "kcal", "percent_daily_value": 9},
            "protein": {"value": 2.2, "unit": "g", "percent_daily_value": 4},
            "carbohydrates": {"value": 13, "unit": "g", "percent_daily_value": 4},
            "fiber": {"value": 3, "unit": "g", "percent_daily_value": 11},
            "sugars": {"value": 7, "unit": "g"},
            "fat_total": {"value": 12, "unit": "g", "percent_daily_value": 15},
            "fat_saturated": {"value": 7, "unit": "g", "percent_daily_value": 35},
            "sodium": {"value": 6, "unit": "mg", "percent_daily_value": 0},
            "iron": {"value": 3.3, "unit": "mg", "percent_daily_value": 18},
            "magnesium": {"value": 64, "unit": "mg", "percent_daily_value": 15},
            "copper": {"value": 0.5, "unit": "mg", "percent_daily_value": 56},
        },
        "bioactive_compounds": ["flavanols", "theobromine", "phenylethylamine"],
    },
    {
        "id": "popcorn_air_popped",
        "name": "Popcorn, Air-Popped",
        "description": "Plain air-popped popcorn without butter",
        "category": "snacks",
        "serving_size": 30,
        "nutrients": {
            "energy": {"value": 120, "unit": "kcal", "percent_daily_value": 6},
            "protein": {"value": 4, "unit": "g", "percent_daily_value": 8},
            "carbohydrates": {"value": 24, "unit": "g", "percent_daily_value": 8},
            "fiber": {"value": 4, "unit": "g", "percent_daily_value": 14},
            "fat_total": {"value": 1.4, "unit": "g", "percent_daily_value": 2},
            "sodium": {"value": 2, "unit": "mg", "percent_daily_value": 0},
            "magnesium": {"value": 36, "unit": "mg", "percent_daily_value": 9},
            "phosphorus": {"value": 90, "unit": "mg", "percent_daily_value": 7},
        },
        "bioactive_compounds": ["polyphenols", "ferulic_acid"],
    },
    {
        "id": "hummus",
        "name": "Hummus",
        "description": "Traditional chickpea hummus",
        "category": "snacks",
        "serving_size": 62,
        "nutrients": {
            "energy": {"value": 109, "unit": "kcal", "percent_daily_value": 5},
            "protein": {"value": 3, "unit": "g", "percent_daily_value": 6},
            "carbohydrates": {"value": 10, "unit": "g", "percent_daily_value": 3},
            "fiber": {"value": 2, "unit": "g", "percent_daily_value": 7},
            "fat_total": {"value": 7, "unit": "g", "percent_daily_value": 9},
            "sodium": {"value": 152, "unit": "mg", "percent_daily_value": 6},
            "potassium": {"value": 107, "unit": "mg", "percent_daily_value": 2},
            "iron": {"value": 1, "unit": "mg", "percent_daily_value": 6},
            "folate": {"value": 25, "unit": "mcg", "percent_daily_value": 6},
        },
    },
    
    # ============================================================
    # SALADS & HEALTHY OPTIONS
    # ============================================================
    {
        "id": "caesar_salad",
        "name": "Caesar Salad",
        "description": "Classic caesar salad with dressing and croutons",
        "category": "salads",
        "serving_size": 200,
        "nutrients": {
            "energy": {"value": 190, "unit": "kcal", "percent_daily_value": 10},
            "protein": {"value": 8, "unit": "g", "percent_daily_value": 16},
            "carbohydrates": {"value": 8, "unit": "g", "percent_daily_value": 3},
            "fiber": {"value": 2, "unit": "g", "percent_daily_value": 7},
            "fat_total": {"value": 15, "unit": "g", "percent_daily_value": 19},
            "sodium": {"value": 470, "unit": "mg", "percent_daily_value": 20},
            "vitamin_a": {"value": 210, "unit": "mcg", "percent_daily_value": 23},
            "vitamin_k": {"value": 78, "unit": "mcg", "percent_daily_value": 65},
            "calcium": {"value": 142, "unit": "mg", "percent_daily_value": 11},
        },
    },
    {
        "id": "quinoa_cooked",
        "name": "Quinoa, Cooked",
        "description": "Plain cooked quinoa",
        "category": "grains",
        "serving_size": 185,
        "nutrients": {
            "energy": {"value": 222, "unit": "kcal", "percent_daily_value": 11},
            "protein": {"value": 8, "unit": "g", "percent_daily_value": 16},
            "carbohydrates": {"value": 39, "unit": "g", "percent_daily_value": 13},
            "fiber": {"value": 5, "unit": "g", "percent_daily_value": 18},
            "fat_total": {"value": 3.5, "unit": "g", "percent_daily_value": 5},
            "sodium": {"value": 13, "unit": "mg", "percent_daily_value": 1},
            "potassium": {"value": 318, "unit": "mg", "percent_daily_value": 7},
            "magnesium": {"value": 118, "unit": "mg", "percent_daily_value": 28},
            "phosphorus": {"value": 281, "unit": "mg", "percent_daily_value": 22},
            "iron": {"value": 2.8, "unit": "mg", "percent_daily_value": 16},
            "zinc": {"value": 2, "unit": "mg", "percent_daily_value": 18},
            "folate": {"value": 78, "unit": "mcg", "percent_daily_value": 20},
        },
        "bioactive_compounds": ["saponins", "quercetin", "kaempferol"],
    },
    {
        "id": "avocado",
        "name": "Avocado",
        "description": "Fresh avocado, half medium",
        "category": "fruits",
        "serving_size": 100,
        "nutrients": {
            "energy": {"value": 160, "unit": "kcal", "percent_daily_value": 8},
            "protein": {"value": 2, "unit": "g", "percent_daily_value": 4},
            "carbohydrates": {"value": 9, "unit": "g", "percent_daily_value": 3},
            "fiber": {"value": 7, "unit": "g", "percent_daily_value": 25},
            "fat_total": {"value": 15, "unit": "g", "percent_daily_value": 19},
            "fat_saturated": {"value": 2.1, "unit": "g", "percent_daily_value": 11},
            "sodium": {"value": 7, "unit": "mg", "percent_daily_value": 0},
            "potassium": {"value": 485, "unit": "mg", "percent_daily_value": 10},
            "vitamin_k": {"value": 21, "unit": "mcg", "percent_daily_value": 18},
            "vitamin_e": {"value": 2.1, "unit": "mg", "percent_daily_value": 14},
            "folate": {"value": 81, "unit": "mcg", "percent_daily_value": 20},
            "vitamin_c": {"value": 10, "unit": "mg", "percent_daily_value": 11},
        },
        "bioactive_compounds": ["oleic_acid", "lutein", "zeaxanthin", "beta_sitosterol"],
    },
    
    # ============================================================
    # PROTEINS
    # ============================================================
    {
        "id": "tofu_firm",
        "name": "Tofu, Firm",
        "description": "Firm tofu, raw",
        "category": "protein",
        "serving_size": 126,
        "nutrients": {
            "energy": {"value": 94, "unit": "kcal", "percent_daily_value": 5},
            "protein": {"value": 10, "unit": "g", "percent_daily_value": 20},
            "carbohydrates": {"value": 2, "unit": "g", "percent_daily_value": 1},
            "fiber": {"value": 0.4, "unit": "g", "percent_daily_value": 1},
            "fat_total": {"value": 5, "unit": "g", "percent_daily_value": 6},
            "sodium": {"value": 14, "unit": "mg", "percent_daily_value": 1},
            "potassium": {"value": 150, "unit": "mg", "percent_daily_value": 3},
            "calcium": {"value": 258, "unit": "mg", "percent_daily_value": 20},
            "iron": {"value": 1.7, "unit": "mg", "percent_daily_value": 9},
            "magnesium": {"value": 38, "unit": "mg", "percent_daily_value": 9},
        },
        "bioactive_compounds": ["isoflavones", "genistein", "daidzein"],
    },
    {
        "id": "tuna_canned",
        "name": "Tuna, Canned in Water",
        "description": "Light tuna canned in water, drained",
        "category": "seafood",
        "serving_size": 85,
        "nutrients": {
            "energy": {"value": 73, "unit": "kcal", "percent_daily_value": 4},
            "protein": {"value": 16, "unit": "g", "percent_daily_value": 32},
            "carbohydrates": {"value": 0, "unit": "g", "percent_daily_value": 0},
            "fat_total": {"value": 0.8, "unit": "g", "percent_daily_value": 1},
            "cholesterol": {"value": 26, "unit": "mg", "percent_daily_value": 9},
            "sodium": {"value": 230, "unit": "mg", "percent_daily_value": 10},
            "potassium": {"value": 176, "unit": "mg", "percent_daily_value": 4},
            "vitamin_d": {"value": 1.7, "unit": "mcg", "percent_daily_value": 9},
            "vitamin_b12": {"value": 2.5, "unit": "mcg", "percent_daily_value": 104},
            "niacin": {"value": 8.6, "unit": "mg", "percent_daily_value": 54},
            "selenium": {"value": 56, "unit": "mcg", "percent_daily_value": 102},
        },
        "bioactive_compounds": ["omega_3_EPA", "omega_3_DHA"],
    },
    {
        "id": "shrimp_cooked",
        "name": "Shrimp, Cooked",
        "description": "Cooked shrimp, peeled",
        "category": "seafood",
        "serving_size": 85,
        "nutrients": {
            "energy": {"value": 84, "unit": "kcal", "percent_daily_value": 4},
            "protein": {"value": 18, "unit": "g", "percent_daily_value": 36},
            "carbohydrates": {"value": 0.2, "unit": "g", "percent_daily_value": 0},
            "fat_total": {"value": 0.9, "unit": "g", "percent_daily_value": 1},
            "cholesterol": {"value": 166, "unit": "mg", "percent_daily_value": 55},
            "sodium": {"value": 190, "unit": "mg", "percent_daily_value": 8},
            "potassium": {"value": 155, "unit": "mg", "percent_daily_value": 3},
            "vitamin_b12": {"value": 1.4, "unit": "mcg", "percent_daily_value": 58},
            "selenium": {"value": 34, "unit": "mcg", "percent_daily_value": 62},
            "zinc": {"value": 1.3, "unit": "mg", "percent_daily_value": 12},
            "phosphorus": {"value": 116, "unit": "mg", "percent_daily_value": 9},
        },
        "bioactive_compounds": ["astaxanthin", "omega_3"],
    },
    {
        "id": "turkey_breast",
        "name": "Turkey Breast, Roasted",
        "description": "Roasted turkey breast without skin",
        "category": "meat",
        "serving_size": 85,
        "nutrients": {
            "energy": {"value": 125, "unit": "kcal", "percent_daily_value": 6},
            "protein": {"value": 26, "unit": "g", "percent_daily_value": 52},
            "carbohydrates": {"value": 0, "unit": "g", "percent_daily_value": 0},
            "fat_total": {"value": 1.8, "unit": "g", "percent_daily_value": 2},
            "cholesterol": {"value": 71, "unit": "mg", "percent_daily_value": 24},
            "sodium": {"value": 48, "unit": "mg", "percent_daily_value": 2},
            "potassium": {"value": 248, "unit": "mg", "percent_daily_value": 5},
            "vitamin_b6": {"value": 0.5, "unit": "mg", "percent_daily_value": 29},
            "vitamin_b12": {"value": 0.4, "unit": "mcg", "percent_daily_value": 17},
            "niacin": {"value": 6.3, "unit": "mg", "percent_daily_value": 39},
            "selenium": {"value": 24, "unit": "mcg", "percent_daily_value": 44},
            "zinc": {"value": 1.5, "unit": "mg", "percent_daily_value": 14},
        },
    },
    
    # ============================================================
    # DAIRY & ALTERNATIVES
    # ============================================================
    {
        "id": "almond_milk",
        "name": "Almond Milk, Unsweetened",
        "description": "Unsweetened almond milk",
        "category": "dairy_alternatives",
        "serving_size": 240,
        "nutrients": {
            "energy": {"value": 30, "unit": "kcal", "percent_daily_value": 2},
            "protein": {"value": 1, "unit": "g", "percent_daily_value": 2},
            "carbohydrates": {"value": 1, "unit": "g", "percent_daily_value": 0},
            "fat_total": {"value": 2.5, "unit": "g", "percent_daily_value": 3},
            "sodium": {"value": 170, "unit": "mg", "percent_daily_value": 7},
            "calcium": {"value": 450, "unit": "mg", "percent_daily_value": 35},
            "vitamin_d": {"value": 2.5, "unit": "mcg", "percent_daily_value": 13},
            "vitamin_e": {"value": 7.5, "unit": "mg", "percent_daily_value": 50},
        },
    },
    {
        "id": "cottage_cheese",
        "name": "Cottage Cheese, Low Fat",
        "description": "Low-fat cottage cheese",
        "category": "dairy",
        "serving_size": 113,
        "nutrients": {
            "energy": {"value": 81, "unit": "kcal", "percent_daily_value": 4},
            "protein": {"value": 14, "unit": "g", "percent_daily_value": 28},
            "carbohydrates": {"value": 3, "unit": "g", "percent_daily_value": 1},
            "fat_total": {"value": 1.2, "unit": "g", "percent_daily_value": 2},
            "sodium": {"value": 459, "unit": "mg", "percent_daily_value": 19},
            "calcium": {"value": 69, "unit": "mg", "percent_daily_value": 5},
            "phosphorus": {"value": 151, "unit": "mg", "percent_daily_value": 12},
            "vitamin_b12": {"value": 0.5, "unit": "mcg", "percent_daily_value": 21},
            "selenium": {"value": 10, "unit": "mcg", "percent_daily_value": 18},
        },
    },
    
    # ============================================================
    # ETHNIC FOODS
    # ============================================================
    {
        "id": "sushi_roll",
        "name": "Sushi Roll, California",
        "description": "California roll sushi (6 pieces)",
        "category": "ethnic",
        "serving_size": 180,
        "nutrients": {
            "energy": {"value": 255, "unit": "kcal", "percent_daily_value": 13},
            "protein": {"value": 9, "unit": "g", "percent_daily_value": 18},
            "carbohydrates": {"value": 38, "unit": "g", "percent_daily_value": 13},
            "fiber": {"value": 5.8, "unit": "g", "percent_daily_value": 21},
            "fat_total": {"value": 7, "unit": "g", "percent_daily_value": 9},
            "sodium": {"value": 510, "unit": "mg", "percent_daily_value": 21},
            "vitamin_a": {"value": 91, "unit": "mcg", "percent_daily_value": 10},
        },
    },
    {
        "id": "pad_thai",
        "name": "Pad Thai",
        "description": "Thai stir-fried noodles with shrimp",
        "category": "ethnic",
        "serving_size": 300,
        "nutrients": {
            "energy": {"value": 450, "unit": "kcal", "percent_daily_value": 23},
            "protein": {"value": 18, "unit": "g", "percent_daily_value": 36},
            "carbohydrates": {"value": 58, "unit": "g", "percent_daily_value": 19},
            "fiber": {"value": 2.5, "unit": "g", "percent_daily_value": 9},
            "fat_total": {"value": 16, "unit": "g", "percent_daily_value": 21},
            "sodium": {"value": 1200, "unit": "mg", "percent_daily_value": 50},
        },
    },
    {
        "id": "curry_chicken",
        "name": "Chicken Curry",
        "description": "Indian-style chicken curry with rice",
        "category": "ethnic",
        "serving_size": 350,
        "nutrients": {
            "energy": {"value": 520, "unit": "kcal", "percent_daily_value": 26},
            "protein": {"value": 28, "unit": "g", "percent_daily_value": 56},
            "carbohydrates": {"value": 48, "unit": "g", "percent_daily_value": 16},
            "fiber": {"value": 3, "unit": "g", "percent_daily_value": 11},
            "fat_total": {"value": 22, "unit": "g", "percent_daily_value": 28},
            "sodium": {"value": 850, "unit": "mg", "percent_daily_value": 35},
            "vitamin_a": {"value": 125, "unit": "mcg", "percent_daily_value": 14},
            "iron": {"value": 3.2, "unit": "mg", "percent_daily_value": 18},
        },
        "bioactive_compounds": ["curcumin", "capsaicin", "gingerol"],
    },
    {
        "id": "ramen_noodles",
        "name": "Ramen Noodles",
        "description": "Japanese ramen with pork broth",
        "category": "ethnic",
        "serving_size": 450,
        "nutrients": {
            "energy": {"value": 480, "unit": "kcal", "percent_daily_value": 24},
            "protein": {"value": 20, "unit": "g", "percent_daily_value": 40},
            "carbohydrates": {"value": 65, "unit": "g", "percent_daily_value": 22},
            "fiber": {"value": 2, "unit": "g", "percent_daily_value": 7},
            "fat_total": {"value": 15, "unit": "g", "percent_daily_value": 19},
            "sodium": {"value": 1800, "unit": "mg", "percent_daily_value": 75},
        },
    },
]

async def add_foods():
    """Add additional foods to the database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    added = 0
    updated = 0
    skipped = 0
    
    for food in ADDITIONAL_FOODS:
        # Check if food already exists
        existing = await db.foods.find_one({"id": food["id"]})
        
        food_doc = {
            **food,
            "source": "PhiCor Expanded Database",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        
        if existing:
            # Update if exists
            await db.foods.update_one(
                {"id": food["id"]},
                {"$set": food_doc}
            )
            updated += 1
        else:
            # Insert new
            await db.foods.insert_one(food_doc)
            added += 1
    
    # Get final count
    total = await db.foods.count_documents({})
    
    print(f"=== Food Database Update Complete ===")
    print(f"Added: {added} new foods")
    print(f"Updated: {updated} existing foods")
    print(f"Total foods in database: {total}")
    
    # Show category breakdown
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    categories = await db.foods.aggregate(pipeline).to_list(30)
    print("\nBy category:")
    for cat in categories:
        print(f"  {cat['_id']}: {cat['count']}")

if __name__ == "__main__":
    asyncio.run(add_foods())
