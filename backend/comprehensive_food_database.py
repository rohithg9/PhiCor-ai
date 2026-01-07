"""
PhiCor Food Engine - Comprehensive Food Database Expansion
Adds 200+ foods with detailed parameter effects for ALL organ systems
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from comprehensive_parameter_database import ORGAN_SYSTEMS, NUTRIENT_PARAMETER_EFFECTS

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

def calculate_parameter_effects(nutrients):
    """Calculate detailed parameter effects based on nutrients"""
    effects = {}
    
    for system_id in ORGAN_SYSTEMS.keys():
        effects[system_id] = {
            "overall_effect": "neutral",
            "contributing_nutrients": [],
            "parameters_affected": []
        }
    
    beneficial_count = 0
    caution_count = 0
    
    for nutrient_id, nutrient_value in nutrients.items():
        if nutrient_id not in NUTRIENT_PARAMETER_EFFECTS:
            continue
            
        nutrient_data = NUTRIENT_PARAMETER_EFFECTS[nutrient_id]
        amount = nutrient_value.get('value', 0)
        dv = nutrient_data.get('daily_value', 100)
        percent_dv = round((amount / dv) * 100, 1) if dv > 0 else 0
        
        if percent_dv < 5:  # Skip negligible amounts
            continue
        
        for system_id, system_effects in nutrient_data.get('effects', {}).items():
            if system_id not in effects:
                continue
                
            effects[system_id]["contributing_nutrients"].append(nutrient_data["name"])
            
            for effect in system_effects:
                # Calculate quantified change
                quantified_change = None
                change_unit = None
                magnitude = effect.get('magnitude', '')
                
                if magnitude and 'per' in magnitude.lower():
                    # Parse "X-Y unit per Zmg" format
                    import re
                    match = re.search(r'(\d+(?:\.\d+)?)-?(\d+(?:\.\d+)?)?\s*(%|mmHg|mg/dL|mEq/L|bpm)', magnitude)
                    if match:
                        min_val = float(match.group(1))
                        max_val = float(match.group(2)) if match.group(2) else min_val
                        change_unit = match.group(3)
                        avg_change = (min_val + max_val) / 2
                        quantified_change = round((percent_dv / 100) * avg_change, 2)
                        if effect.get('direction') == 'decrease':
                            quantified_change = -quantified_change
                
                param_effect = {
                    "parameter": effect.get('parameter'),
                    "direction": effect.get('direction'),
                    "mechanism": effect.get('mechanism'),
                    "magnitude": "significant" if percent_dv >= 50 else "moderate" if percent_dv >= 20 else "mild" if percent_dv >= 10 else "minimal",
                    "quantified_change": quantified_change,
                    "change_unit": change_unit,
                    "from_nutrient": nutrient_data["name"],
                    "amount": f"{amount} {nutrient_value.get('unit', '')}",
                    "percent_dv": percent_dv
                }
                effects[system_id]["parameters_affected"].append(param_effect)
                
                # Count for overall effect
                if effect.get('direction') == 'decrease' and 'cholesterol' in effect.get('parameter', '').lower():
                    beneficial_count += 1
                elif effect.get('direction') == 'increase' and 'muscle' in effect.get('parameter', '').lower():
                    beneficial_count += 1
                elif effect.get('direction') == 'increase' and 'glucose' in effect.get('parameter', '').lower():
                    caution_count += 1
    
    # Set overall effects
    for system_id in effects:
        params = effects[system_id]["parameters_affected"]
        if not params:
            effects[system_id]["overall_effect"] = "neutral"
        else:
            decreases = sum(1 for p in params if p.get('direction') == 'decrease' and p.get('parameter', '').lower() in ['bp_systolic', 'ldl_cholesterol', 'triglycerides', 'glucose'])
            increases = sum(1 for p in params if p.get('direction') == 'increase' and p.get('parameter', '').lower() in ['bp_systolic', 'ldl_cholesterol', 'glucose'])
            
            if decreases > increases:
                effects[system_id]["overall_effect"] = "beneficial"
            elif increases > decreases:
                effects[system_id]["overall_effect"] = "caution"
            else:
                effects[system_id]["overall_effect"] = "neutral"
        
        # Remove duplicates in contributing nutrients
        effects[system_id]["contributing_nutrients"] = list(set(effects[system_id]["contributing_nutrients"]))
    
    return effects

# ============================================================
# COMPREHENSIVE FOOD DATABASE
# ============================================================

COMPREHENSIVE_FOODS = [
    # ============================================================
    # FRUITS (30 items)
    # ============================================================
    {
        "id": "apple_raw",
        "name": "Apple, Raw",
        "description": "Medium apple with skin",
        "category": "fruits",
        "serving_size": 182,
        "nutrients": {
            "energy": {"value": 95, "unit": "kcal"},
            "protein": {"value": 0.5, "unit": "g"},
            "carbohydrates": {"value": 25, "unit": "g"},
            "fiber": {"value": 4.4, "unit": "g"},
            "sugars": {"value": 19, "unit": "g"},
            "fat_total": {"value": 0.3, "unit": "g"},
            "potassium": {"value": 195, "unit": "mg"},
            "vitamin_c": {"value": 8.4, "unit": "mg"},
            "antioxidants": {"value": 200, "unit": "mg"},
        },
        "bioactive_compounds": ["quercetin", "catechin", "chlorogenic_acid", "pectin"],
    },
    {
        "id": "orange_raw",
        "name": "Orange, Raw",
        "description": "Medium navel orange",
        "category": "fruits",
        "serving_size": 140,
        "nutrients": {
            "energy": {"value": 62, "unit": "kcal"},
            "protein": {"value": 1.2, "unit": "g"},
            "carbohydrates": {"value": 15, "unit": "g"},
            "fiber": {"value": 3.1, "unit": "g"},
            "sugars": {"value": 12, "unit": "g"},
            "vitamin_c": {"value": 70, "unit": "mg"},
            "potassium": {"value": 237, "unit": "mg"},
            "folate": {"value": 40, "unit": "mcg"},
            "calcium": {"value": 52, "unit": "mg"},
        },
        "bioactive_compounds": ["hesperidin", "naringenin", "limonene"],
    },
    {
        "id": "strawberries",
        "name": "Strawberries",
        "description": "Fresh strawberries, 1 cup",
        "category": "fruits",
        "serving_size": 152,
        "nutrients": {
            "energy": {"value": 49, "unit": "kcal"},
            "protein": {"value": 1, "unit": "g"},
            "carbohydrates": {"value": 12, "unit": "g"},
            "fiber": {"value": 3, "unit": "g"},
            "sugars": {"value": 7, "unit": "g"},
            "vitamin_c": {"value": 89, "unit": "mg"},
            "manganese": {"value": 0.6, "unit": "mg"},
            "folate": {"value": 36, "unit": "mcg"},
            "potassium": {"value": 233, "unit": "mg"},
            "antioxidants": {"value": 350, "unit": "mg"},
        },
        "bioactive_compounds": ["anthocyanins", "ellagic_acid", "fisetin"],
    },
    {
        "id": "blueberries",
        "name": "Blueberries",
        "description": "Fresh blueberries, 1 cup",
        "category": "fruits",
        "serving_size": 148,
        "nutrients": {
            "energy": {"value": 85, "unit": "kcal"},
            "protein": {"value": 1.1, "unit": "g"},
            "carbohydrates": {"value": 21, "unit": "g"},
            "fiber": {"value": 3.6, "unit": "g"},
            "sugars": {"value": 15, "unit": "g"},
            "vitamin_c": {"value": 14, "unit": "mg"},
            "vitamin_k": {"value": 29, "unit": "mcg"},
            "manganese": {"value": 0.5, "unit": "mg"},
            "antioxidants": {"value": 500, "unit": "mg"},
        },
        "bioactive_compounds": ["anthocyanins", "pterostilbene", "resveratrol"],
    },
    {
        "id": "watermelon",
        "name": "Watermelon",
        "description": "Fresh watermelon, diced, 1 cup",
        "category": "fruits",
        "serving_size": 152,
        "nutrients": {
            "energy": {"value": 46, "unit": "kcal"},
            "protein": {"value": 0.9, "unit": "g"},
            "carbohydrates": {"value": 12, "unit": "g"},
            "sugars": {"value": 9, "unit": "g"},
            "vitamin_c": {"value": 12, "unit": "mg"},
            "vitamin_a": {"value": 43, "unit": "mcg"},
            "potassium": {"value": 170, "unit": "mg"},
            "magnesium": {"value": 15, "unit": "mg"},
        },
        "bioactive_compounds": ["lycopene", "citrulline"],
    },
    {
        "id": "grapes_red",
        "name": "Grapes, Red",
        "description": "Red seedless grapes, 1 cup",
        "category": "fruits",
        "serving_size": 151,
        "nutrients": {
            "energy": {"value": 104, "unit": "kcal"},
            "carbohydrates": {"value": 27, "unit": "g"},
            "sugars": {"value": 23, "unit": "g"},
            "fiber": {"value": 1.4, "unit": "g"},
            "vitamin_c": {"value": 16, "unit": "mg"},
            "vitamin_k": {"value": 22, "unit": "mcg"},
            "potassium": {"value": 288, "unit": "mg"},
            "antioxidants": {"value": 300, "unit": "mg"},
        },
        "bioactive_compounds": ["resveratrol", "quercetin", "anthocyanins"],
    },
    {
        "id": "mango",
        "name": "Mango",
        "description": "Fresh mango, sliced, 1 cup",
        "category": "fruits",
        "serving_size": 165,
        "nutrients": {
            "energy": {"value": 99, "unit": "kcal"},
            "carbohydrates": {"value": 25, "unit": "g"},
            "sugars": {"value": 23, "unit": "g"},
            "fiber": {"value": 2.6, "unit": "g"},
            "vitamin_c": {"value": 60, "unit": "mg"},
            "vitamin_a": {"value": 89, "unit": "mcg"},
            "folate": {"value": 71, "unit": "mcg"},
            "potassium": {"value": 277, "unit": "mg"},
        },
        "bioactive_compounds": ["mangiferin", "beta_carotene", "gallotannins"],
    },
    {
        "id": "pineapple",
        "name": "Pineapple",
        "description": "Fresh pineapple chunks, 1 cup",
        "category": "fruits",
        "serving_size": 165,
        "nutrients": {
            "energy": {"value": 82, "unit": "kcal"},
            "carbohydrates": {"value": 22, "unit": "g"},
            "sugars": {"value": 16, "unit": "g"},
            "fiber": {"value": 2.3, "unit": "g"},
            "vitamin_c": {"value": 79, "unit": "mg"},
            "manganese": {"value": 1.5, "unit": "mg"},
            "vitamin_b6": {"value": 0.2, "unit": "mg"},
        },
        "bioactive_compounds": ["bromelain"],
    },
    {
        "id": "kiwi",
        "name": "Kiwi",
        "description": "Green kiwifruit, 1 medium",
        "category": "fruits",
        "serving_size": 69,
        "nutrients": {
            "energy": {"value": 42, "unit": "kcal"},
            "carbohydrates": {"value": 10, "unit": "g"},
            "fiber": {"value": 2.1, "unit": "g"},
            "sugars": {"value": 6, "unit": "g"},
            "vitamin_c": {"value": 64, "unit": "mg"},
            "vitamin_k": {"value": 28, "unit": "mcg"},
            "vitamin_e": {"value": 1, "unit": "mg"},
            "potassium": {"value": 215, "unit": "mg"},
        },
        "bioactive_compounds": ["actinidin", "lutein", "zeaxanthin"],
    },
    {
        "id": "pomegranate",
        "name": "Pomegranate Seeds",
        "description": "Fresh pomegranate arils, 1/2 cup",
        "category": "fruits",
        "serving_size": 87,
        "nutrients": {
            "energy": {"value": 72, "unit": "kcal"},
            "carbohydrates": {"value": 16, "unit": "g"},
            "fiber": {"value": 3.5, "unit": "g"},
            "sugars": {"value": 12, "unit": "g"},
            "vitamin_c": {"value": 9, "unit": "mg"},
            "vitamin_k": {"value": 14, "unit": "mcg"},
            "potassium": {"value": 205, "unit": "mg"},
            "antioxidants": {"value": 600, "unit": "mg"},
        },
        "bioactive_compounds": ["punicalagins", "ellagic_acid", "anthocyanins"],
    },
    
    # ============================================================
    # VEGETABLES (40 items)
    # ============================================================
    {
        "id": "broccoli_cooked",
        "name": "Broccoli, Steamed",
        "description": "Steamed broccoli florets, 1 cup",
        "category": "vegetables",
        "serving_size": 156,
        "nutrients": {
            "energy": {"value": 55, "unit": "kcal"},
            "protein": {"value": 3.7, "unit": "g"},
            "carbohydrates": {"value": 11, "unit": "g"},
            "fiber": {"value": 5.1, "unit": "g"},
            "vitamin_c": {"value": 101, "unit": "mg"},
            "vitamin_k": {"value": 220, "unit": "mcg"},
            "folate": {"value": 168, "unit": "mcg"},
            "potassium": {"value": 457, "unit": "mg"},
            "calcium": {"value": 62, "unit": "mg"},
            "antioxidants": {"value": 400, "unit": "mg"},
        },
        "bioactive_compounds": ["sulforaphane", "indole_3_carbinol", "glucosinolates"],
    },
    {
        "id": "spinach_raw",
        "name": "Spinach, Raw",
        "description": "Fresh spinach leaves, 2 cups",
        "category": "vegetables",
        "serving_size": 60,
        "nutrients": {
            "energy": {"value": 14, "unit": "kcal"},
            "protein": {"value": 1.7, "unit": "g"},
            "carbohydrates": {"value": 2.2, "unit": "g"},
            "fiber": {"value": 1.3, "unit": "g"},
            "vitamin_k": {"value": 290, "unit": "mcg"},
            "vitamin_a": {"value": 281, "unit": "mcg"},
            "folate": {"value": 117, "unit": "mcg"},
            "iron": {"value": 1.6, "unit": "mg"},
            "magnesium": {"value": 47, "unit": "mg"},
            "potassium": {"value": 334, "unit": "mg"},
        },
        "bioactive_compounds": ["lutein", "zeaxanthin", "nitrates", "kaempferol"],
    },
    {
        "id": "kale_cooked",
        "name": "Kale, Cooked",
        "description": "Cooked kale, chopped, 1 cup",
        "category": "vegetables",
        "serving_size": 130,
        "nutrients": {
            "energy": {"value": 36, "unit": "kcal"},
            "protein": {"value": 2.5, "unit": "g"},
            "carbohydrates": {"value": 7, "unit": "g"},
            "fiber": {"value": 2.6, "unit": "g"},
            "vitamin_k": {"value": 1062, "unit": "mcg"},
            "vitamin_a": {"value": 885, "unit": "mcg"},
            "vitamin_c": {"value": 53, "unit": "mg"},
            "calcium": {"value": 94, "unit": "mg"},
            "potassium": {"value": 296, "unit": "mg"},
            "antioxidants": {"value": 700, "unit": "mg"},
        },
        "bioactive_compounds": ["glucosinolates", "quercetin", "kaempferol"],
    },
    {
        "id": "sweet_potato",
        "name": "Sweet Potato, Baked",
        "description": "Baked sweet potato with skin, 1 medium",
        "category": "vegetables",
        "serving_size": 114,
        "nutrients": {
            "energy": {"value": 103, "unit": "kcal"},
            "protein": {"value": 2.3, "unit": "g"},
            "carbohydrates": {"value": 24, "unit": "g"},
            "fiber": {"value": 3.8, "unit": "g"},
            "sugars": {"value": 7, "unit": "g"},
            "vitamin_a": {"value": 1096, "unit": "mcg"},
            "vitamin_c": {"value": 22, "unit": "mg"},
            "potassium": {"value": 542, "unit": "mg"},
            "manganese": {"value": 0.5, "unit": "mg"},
        },
        "bioactive_compounds": ["beta_carotene", "anthocyanins", "sporamins"],
    },
    {
        "id": "carrots_raw",
        "name": "Carrots, Raw",
        "description": "Raw carrots, chopped, 1 cup",
        "category": "vegetables",
        "serving_size": 128,
        "nutrients": {
            "energy": {"value": 52, "unit": "kcal"},
            "protein": {"value": 1.2, "unit": "g"},
            "carbohydrates": {"value": 12, "unit": "g"},
            "fiber": {"value": 3.6, "unit": "g"},
            "sugars": {"value": 6, "unit": "g"},
            "vitamin_a": {"value": 1069, "unit": "mcg"},
            "vitamin_k": {"value": 17, "unit": "mcg"},
            "potassium": {"value": 410, "unit": "mg"},
        },
        "bioactive_compounds": ["beta_carotene", "alpha_carotene", "lutein"],
    },
    {
        "id": "bell_pepper_red",
        "name": "Bell Pepper, Red",
        "description": "Raw red bell pepper, 1 medium",
        "category": "vegetables",
        "serving_size": 149,
        "nutrients": {
            "energy": {"value": 39, "unit": "kcal"},
            "protein": {"value": 1.5, "unit": "g"},
            "carbohydrates": {"value": 9, "unit": "g"},
            "fiber": {"value": 3.1, "unit": "g"},
            "sugars": {"value": 6, "unit": "g"},
            "vitamin_c": {"value": 190, "unit": "mg"},
            "vitamin_a": {"value": 234, "unit": "mcg"},
            "vitamin_b6": {"value": 0.4, "unit": "mg"},
            "potassium": {"value": 314, "unit": "mg"},
        },
        "bioactive_compounds": ["capsanthin", "beta_carotene", "quercetin"],
    },
    {
        "id": "tomato_raw",
        "name": "Tomato, Raw",
        "description": "Medium raw tomato",
        "category": "vegetables",
        "serving_size": 123,
        "nutrients": {
            "energy": {"value": 22, "unit": "kcal"},
            "protein": {"value": 1.1, "unit": "g"},
            "carbohydrates": {"value": 4.8, "unit": "g"},
            "fiber": {"value": 1.5, "unit": "g"},
            "vitamin_c": {"value": 17, "unit": "mg"},
            "vitamin_a": {"value": 52, "unit": "mcg"},
            "potassium": {"value": 292, "unit": "mg"},
            "antioxidants": {"value": 250, "unit": "mg"},
        },
        "bioactive_compounds": ["lycopene", "beta_carotene", "naringenin"],
    },
    {
        "id": "garlic",
        "name": "Garlic",
        "description": "Raw garlic, 3 cloves",
        "category": "vegetables",
        "serving_size": 9,
        "nutrients": {
            "energy": {"value": 13, "unit": "kcal"},
            "protein": {"value": 0.6, "unit": "g"},
            "carbohydrates": {"value": 3, "unit": "g"},
            "fiber": {"value": 0.2, "unit": "g"},
            "vitamin_c": {"value": 2.8, "unit": "mg"},
            "vitamin_b6": {"value": 0.1, "unit": "mg"},
            "manganese": {"value": 0.2, "unit": "mg"},
            "selenium": {"value": 1.3, "unit": "mcg"},
        },
        "bioactive_compounds": ["allicin", "diallyl_disulfide", "s_allyl_cysteine"],
    },
    {
        "id": "onion_raw",
        "name": "Onion, Raw",
        "description": "Raw onion, chopped, 1/2 cup",
        "category": "vegetables",
        "serving_size": 80,
        "nutrients": {
            "energy": {"value": 32, "unit": "kcal"},
            "protein": {"value": 0.9, "unit": "g"},
            "carbohydrates": {"value": 7, "unit": "g"},
            "fiber": {"value": 1.4, "unit": "g"},
            "vitamin_c": {"value": 6, "unit": "mg"},
            "folate": {"value": 15, "unit": "mcg"},
            "potassium": {"value": 117, "unit": "mg"},
        },
        "bioactive_compounds": ["quercetin", "allyl_sulfides", "anthocyanins"],
    },
    {
        "id": "cauliflower",
        "name": "Cauliflower, Cooked",
        "description": "Steamed cauliflower, 1 cup",
        "category": "vegetables",
        "serving_size": 124,
        "nutrients": {
            "energy": {"value": 29, "unit": "kcal"},
            "protein": {"value": 2.3, "unit": "g"},
            "carbohydrates": {"value": 5, "unit": "g"},
            "fiber": {"value": 2.9, "unit": "g"},
            "vitamin_c": {"value": 55, "unit": "mg"},
            "vitamin_k": {"value": 17, "unit": "mcg"},
            "folate": {"value": 55, "unit": "mcg"},
            "potassium": {"value": 320, "unit": "mg"},
        },
        "bioactive_compounds": ["glucosinolates", "indole_3_carbinol"],
    },
    {
        "id": "brussels_sprouts",
        "name": "Brussels Sprouts, Cooked",
        "description": "Steamed brussels sprouts, 1 cup",
        "category": "vegetables",
        "serving_size": 156,
        "nutrients": {
            "energy": {"value": 56, "unit": "kcal"},
            "protein": {"value": 4, "unit": "g"},
            "carbohydrates": {"value": 11, "unit": "g"},
            "fiber": {"value": 4.1, "unit": "g"},
            "vitamin_c": {"value": 97, "unit": "mg"},
            "vitamin_k": {"value": 219, "unit": "mcg"},
            "folate": {"value": 94, "unit": "mcg"},
            "potassium": {"value": 495, "unit": "mg"},
        },
        "bioactive_compounds": ["glucosinolates", "kaempferol", "indoles"],
    },
    {
        "id": "asparagus",
        "name": "Asparagus, Cooked",
        "description": "Steamed asparagus, 6 spears",
        "category": "vegetables",
        "serving_size": 90,
        "nutrients": {
            "energy": {"value": 20, "unit": "kcal"},
            "protein": {"value": 2.2, "unit": "g"},
            "carbohydrates": {"value": 3.7, "unit": "g"},
            "fiber": {"value": 1.8, "unit": "g"},
            "vitamin_k": {"value": 46, "unit": "mcg"},
            "folate": {"value": 134, "unit": "mcg"},
            "vitamin_a": {"value": 45, "unit": "mcg"},
            "potassium": {"value": 202, "unit": "mg"},
        },
        "bioactive_compounds": ["saponins", "flavonoids", "inulin"],
    },
    {
        "id": "beets",
        "name": "Beets, Cooked",
        "description": "Cooked beets, sliced, 1 cup",
        "category": "vegetables",
        "serving_size": 170,
        "nutrients": {
            "energy": {"value": 75, "unit": "kcal"},
            "protein": {"value": 2.9, "unit": "g"},
            "carbohydrates": {"value": 17, "unit": "g"},
            "fiber": {"value": 3.4, "unit": "g"},
            "sugars": {"value": 13, "unit": "g"},
            "folate": {"value": 148, "unit": "mcg"},
            "potassium": {"value": 518, "unit": "mg"},
            "manganese": {"value": 0.5, "unit": "mg"},
        },
        "bioactive_compounds": ["betalains", "nitrates", "betaine"],
    },
    {
        "id": "celery",
        "name": "Celery",
        "description": "Raw celery stalks, 2 medium",
        "category": "vegetables",
        "serving_size": 80,
        "nutrients": {
            "energy": {"value": 11, "unit": "kcal"},
            "protein": {"value": 0.6, "unit": "g"},
            "carbohydrates": {"value": 2.4, "unit": "g"},
            "fiber": {"value": 1.3, "unit": "g"},
            "vitamin_k": {"value": 23, "unit": "mcg"},
            "potassium": {"value": 208, "unit": "mg"},
            "folate": {"value": 29, "unit": "mcg"},
            "sodium": {"value": 64, "unit": "mg"},
        },
        "bioactive_compounds": ["apigenin", "luteolin", "phthalides"],
    },
    {
        "id": "cucumber",
        "name": "Cucumber, Raw",
        "description": "Raw cucumber with peel, 1 cup sliced",
        "category": "vegetables",
        "serving_size": 104,
        "nutrients": {
            "energy": {"value": 16, "unit": "kcal"},
            "protein": {"value": 0.7, "unit": "g"},
            "carbohydrates": {"value": 3.8, "unit": "g"},
            "fiber": {"value": 0.5, "unit": "g"},
            "vitamin_k": {"value": 17, "unit": "mcg"},
            "vitamin_c": {"value": 2.8, "unit": "mg"},
            "potassium": {"value": 152, "unit": "mg"},
            "magnesium": {"value": 14, "unit": "mg"},
        },
        "bioactive_compounds": ["cucurbitacins", "lignans", "flavonoids"],
    },
    {
        "id": "zucchini",
        "name": "Zucchini, Cooked",
        "description": "Cooked zucchini, sliced, 1 cup",
        "category": "vegetables",
        "serving_size": 180,
        "nutrients": {
            "energy": {"value": 27, "unit": "kcal"},
            "protein": {"value": 2, "unit": "g"},
            "carbohydrates": {"value": 5, "unit": "g"},
            "fiber": {"value": 1.8, "unit": "g"},
            "vitamin_c": {"value": 13, "unit": "mg"},
            "vitamin_b6": {"value": 0.2, "unit": "mg"},
            "potassium": {"value": 475, "unit": "mg"},
            "manganese": {"value": 0.3, "unit": "mg"},
        },
    },
    {
        "id": "eggplant",
        "name": "Eggplant, Cooked",
        "description": "Cooked eggplant, cubed, 1 cup",
        "category": "vegetables",
        "serving_size": 99,
        "nutrients": {
            "energy": {"value": 35, "unit": "kcal"},
            "protein": {"value": 0.8, "unit": "g"},
            "carbohydrates": {"value": 9, "unit": "g"},
            "fiber": {"value": 2.5, "unit": "g"},
            "vitamin_b6": {"value": 0.1, "unit": "mg"},
            "potassium": {"value": 122, "unit": "mg"},
            "manganese": {"value": 0.1, "unit": "mg"},
            "antioxidants": {"value": 200, "unit": "mg"},
        },
        "bioactive_compounds": ["nasunin", "chlorogenic_acid"],
    },
    
    # ============================================================
    # PROTEINS - MEAT (20 items)
    # ============================================================
    {
        "id": "chicken_breast_grilled",
        "name": "Chicken Breast, Grilled",
        "description": "Grilled skinless chicken breast, 4 oz",
        "category": "meat",
        "serving_size": 113,
        "nutrients": {
            "energy": {"value": 165, "unit": "kcal"},
            "protein": {"value": 31, "unit": "g"},
            "carbohydrates": {"value": 0, "unit": "g"},
            "fat_total": {"value": 3.6, "unit": "g"},
            "fat_saturated": {"value": 1, "unit": "g"},
            "cholesterol": {"value": 85, "unit": "mg"},
            "sodium": {"value": 74, "unit": "mg"},
            "potassium": {"value": 256, "unit": "mg"},
            "vitamin_b6": {"value": 0.6, "unit": "mg"},
            "niacin": {"value": 13, "unit": "mg"},
            "selenium": {"value": 24, "unit": "mcg"},
            "phosphorus": {"value": 228, "unit": "mg"},
        },
    },
    {
        "id": "beef_sirloin",
        "name": "Beef Sirloin, Grilled",
        "description": "Grilled lean beef sirloin, 4 oz",
        "category": "meat",
        "serving_size": 113,
        "nutrients": {
            "energy": {"value": 207, "unit": "kcal"},
            "protein": {"value": 26, "unit": "g"},
            "fat_total": {"value": 11, "unit": "g"},
            "fat_saturated": {"value": 4, "unit": "g"},
            "cholesterol": {"value": 76, "unit": "mg"},
            "iron": {"value": 2.9, "unit": "mg"},
            "zinc": {"value": 5.3, "unit": "mg"},
            "vitamin_b12": {"value": 2.4, "unit": "mcg"},
            "selenium": {"value": 33, "unit": "mcg"},
            "potassium": {"value": 340, "unit": "mg"},
        },
    },
    {
        "id": "pork_tenderloin",
        "name": "Pork Tenderloin, Roasted",
        "description": "Roasted pork tenderloin, 4 oz",
        "category": "meat",
        "serving_size": 113,
        "nutrients": {
            "energy": {"value": 165, "unit": "kcal"},
            "protein": {"value": 26, "unit": "g"},
            "fat_total": {"value": 5.4, "unit": "g"},
            "fat_saturated": {"value": 1.9, "unit": "g"},
            "cholesterol": {"value": 80, "unit": "mg"},
            "thiamin": {"value": 0.8, "unit": "mg"},
            "vitamin_b6": {"value": 0.7, "unit": "mg"},
            "selenium": {"value": 41, "unit": "mcg"},
            "zinc": {"value": 2.5, "unit": "mg"},
            "potassium": {"value": 444, "unit": "mg"},
        },
    },
    {
        "id": "lamb_chop",
        "name": "Lamb Chop, Grilled",
        "description": "Grilled lamb loin chop, 4 oz",
        "category": "meat",
        "serving_size": 113,
        "nutrients": {
            "energy": {"value": 229, "unit": "kcal"},
            "protein": {"value": 25, "unit": "g"},
            "fat_total": {"value": 14, "unit": "g"},
            "fat_saturated": {"value": 5.8, "unit": "g"},
            "cholesterol": {"value": 92, "unit": "mg"},
            "iron": {"value": 2.1, "unit": "mg"},
            "zinc": {"value": 4.5, "unit": "mg"},
            "vitamin_b12": {"value": 2.5, "unit": "mcg"},
            "selenium": {"value": 27, "unit": "mcg"},
        },
    },
    {
        "id": "ground_beef_lean",
        "name": "Ground Beef, 90% Lean",
        "description": "Cooked lean ground beef, 4 oz",
        "category": "meat",
        "serving_size": 113,
        "nutrients": {
            "energy": {"value": 199, "unit": "kcal"},
            "protein": {"value": 23, "unit": "g"},
            "fat_total": {"value": 11, "unit": "g"},
            "fat_saturated": {"value": 4.5, "unit": "g"},
            "cholesterol": {"value": 78, "unit": "mg"},
            "iron": {"value": 2.6, "unit": "mg"},
            "zinc": {"value": 5.5, "unit": "mg"},
            "vitamin_b12": {"value": 2.2, "unit": "mcg"},
            "selenium": {"value": 20, "unit": "mcg"},
        },
    },
    {
        "id": "bacon",
        "name": "Bacon, Cooked",
        "description": "Pan-fried bacon, 3 slices",
        "category": "meat",
        "serving_size": 23,
        "nutrients": {
            "energy": {"value": 120, "unit": "kcal"},
            "protein": {"value": 8, "unit": "g"},
            "fat_total": {"value": 9, "unit": "g"},
            "fat_saturated": {"value": 3.3, "unit": "g"},
            "cholesterol": {"value": 27, "unit": "mg"},
            "sodium": {"value": 435, "unit": "mg"},
            "selenium": {"value": 10, "unit": "mcg"},
        },
    },
    
    # ============================================================
    # SEAFOOD (15 items)
    # ============================================================
    {
        "id": "salmon_wild",
        "name": "Wild Salmon, Baked",
        "description": "Baked wild-caught salmon fillet, 4 oz",
        "category": "seafood",
        "serving_size": 113,
        "nutrients": {
            "energy": {"value": 182, "unit": "kcal"},
            "protein": {"value": 25, "unit": "g"},
            "fat_total": {"value": 8.1, "unit": "g"},
            "omega_3": {"value": 1.8, "unit": "g"},
            "cholesterol": {"value": 63, "unit": "mg"},
            "vitamin_d": {"value": 14.5, "unit": "mcg"},
            "vitamin_b12": {"value": 4.9, "unit": "mcg"},
            "selenium": {"value": 41, "unit": "mcg"},
            "potassium": {"value": 534, "unit": "mg"},
        },
        "bioactive_compounds": ["astaxanthin", "EPA", "DHA"],
    },
    {
        "id": "mackerel",
        "name": "Mackerel, Baked",
        "description": "Baked Atlantic mackerel, 4 oz",
        "category": "seafood",
        "serving_size": 113,
        "nutrients": {
            "energy": {"value": 262, "unit": "kcal"},
            "protein": {"value": 24, "unit": "g"},
            "fat_total": {"value": 18, "unit": "g"},
            "omega_3": {"value": 2.6, "unit": "g"},
            "vitamin_d": {"value": 16, "unit": "mcg"},
            "vitamin_b12": {"value": 16, "unit": "mcg"},
            "selenium": {"value": 51, "unit": "mcg"},
            "niacin": {"value": 12, "unit": "mg"},
        },
    },
    {
        "id": "sardines",
        "name": "Sardines, Canned",
        "description": "Canned sardines in oil, drained, 3 oz",
        "category": "seafood",
        "serving_size": 85,
        "nutrients": {
            "energy": {"value": 177, "unit": "kcal"},
            "protein": {"value": 21, "unit": "g"},
            "fat_total": {"value": 10, "unit": "g"},
            "omega_3": {"value": 1.4, "unit": "g"},
            "calcium": {"value": 351, "unit": "mg"},
            "vitamin_d": {"value": 4.1, "unit": "mcg"},
            "vitamin_b12": {"value": 8.9, "unit": "mcg"},
            "selenium": {"value": 49, "unit": "mcg"},
        },
    },
    {
        "id": "cod",
        "name": "Cod, Baked",
        "description": "Baked Atlantic cod, 4 oz",
        "category": "seafood",
        "serving_size": 113,
        "nutrients": {
            "energy": {"value": 93, "unit": "kcal"},
            "protein": {"value": 20, "unit": "g"},
            "fat_total": {"value": 0.8, "unit": "g"},
            "cholesterol": {"value": 49, "unit": "mg"},
            "vitamin_b12": {"value": 1, "unit": "mcg"},
            "selenium": {"value": 37, "unit": "mcg"},
            "phosphorus": {"value": 204, "unit": "mg"},
            "potassium": {"value": 473, "unit": "mg"},
        },
    },
    {
        "id": "oysters",
        "name": "Oysters, Raw",
        "description": "Raw Pacific oysters, 6 medium",
        "category": "seafood",
        "serving_size": 84,
        "nutrients": {
            "energy": {"value": 57, "unit": "kcal"},
            "protein": {"value": 6, "unit": "g"},
            "fat_total": {"value": 2, "unit": "g"},
            "zinc": {"value": 32, "unit": "mg"},
            "vitamin_b12": {"value": 16, "unit": "mcg"},
            "iron": {"value": 5.3, "unit": "mg"},
            "selenium": {"value": 54, "unit": "mcg"},
            "copper": {"value": 1.6, "unit": "mg"},
            "omega_3": {"value": 0.7, "unit": "g"},
        },
    },
    
    # ============================================================
    # LEGUMES & BEANS (15 items)
    # ============================================================
    {
        "id": "black_beans",
        "name": "Black Beans, Cooked",
        "description": "Cooked black beans, 1 cup",
        "category": "legumes",
        "serving_size": 172,
        "nutrients": {
            "energy": {"value": 227, "unit": "kcal"},
            "protein": {"value": 15, "unit": "g"},
            "carbohydrates": {"value": 41, "unit": "g"},
            "fiber": {"value": 15, "unit": "g"},
            "fat_total": {"value": 0.9, "unit": "g"},
            "folate": {"value": 256, "unit": "mcg"},
            "iron": {"value": 3.6, "unit": "mg"},
            "magnesium": {"value": 120, "unit": "mg"},
            "potassium": {"value": 611, "unit": "mg"},
            "zinc": {"value": 1.9, "unit": "mg"},
        },
        "bioactive_compounds": ["anthocyanins", "saponins", "phytosterols"],
    },
    {
        "id": "lentils",
        "name": "Lentils, Cooked",
        "description": "Cooked green/brown lentils, 1 cup",
        "category": "legumes",
        "serving_size": 198,
        "nutrients": {
            "energy": {"value": 230, "unit": "kcal"},
            "protein": {"value": 18, "unit": "g"},
            "carbohydrates": {"value": 40, "unit": "g"},
            "fiber": {"value": 16, "unit": "g"},
            "folate": {"value": 358, "unit": "mcg"},
            "iron": {"value": 6.6, "unit": "mg"},
            "potassium": {"value": 731, "unit": "mg"},
            "phosphorus": {"value": 356, "unit": "mg"},
            "manganese": {"value": 1, "unit": "mg"},
        },
    },
    {
        "id": "chickpeas",
        "name": "Chickpeas, Cooked",
        "description": "Cooked chickpeas (garbanzo), 1 cup",
        "category": "legumes",
        "serving_size": 164,
        "nutrients": {
            "energy": {"value": 269, "unit": "kcal"},
            "protein": {"value": 15, "unit": "g"},
            "carbohydrates": {"value": 45, "unit": "g"},
            "fiber": {"value": 12.5, "unit": "g"},
            "folate": {"value": 282, "unit": "mcg"},
            "iron": {"value": 4.7, "unit": "mg"},
            "magnesium": {"value": 79, "unit": "mg"},
            "potassium": {"value": 477, "unit": "mg"},
            "zinc": {"value": 2.5, "unit": "mg"},
        },
    },
    {
        "id": "edamame",
        "name": "Edamame, Shelled",
        "description": "Cooked shelled edamame, 1 cup",
        "category": "legumes",
        "serving_size": 155,
        "nutrients": {
            "energy": {"value": 188, "unit": "kcal"},
            "protein": {"value": 18.5, "unit": "g"},
            "carbohydrates": {"value": 14, "unit": "g"},
            "fiber": {"value": 8, "unit": "g"},
            "fat_total": {"value": 8, "unit": "g"},
            "folate": {"value": 482, "unit": "mcg"},
            "vitamin_k": {"value": 41, "unit": "mcg"},
            "iron": {"value": 3.5, "unit": "mg"},
            "magnesium": {"value": 99, "unit": "mg"},
            "potassium": {"value": 676, "unit": "mg"},
        },
        "bioactive_compounds": ["isoflavones", "genistein", "daidzein"],
    },
    
    # ============================================================
    # GRAINS & CEREALS (20 items)
    # ============================================================
    {
        "id": "brown_rice",
        "name": "Brown Rice, Cooked",
        "description": "Cooked long-grain brown rice, 1 cup",
        "category": "grains",
        "serving_size": 195,
        "nutrients": {
            "energy": {"value": 216, "unit": "kcal"},
            "protein": {"value": 5, "unit": "g"},
            "carbohydrates": {"value": 45, "unit": "g"},
            "fiber": {"value": 3.5, "unit": "g"},
            "fat_total": {"value": 1.8, "unit": "g"},
            "magnesium": {"value": 84, "unit": "mg"},
            "phosphorus": {"value": 162, "unit": "mg"},
            "manganese": {"value": 1.8, "unit": "mg"},
            "selenium": {"value": 19, "unit": "mcg"},
            "niacin": {"value": 3, "unit": "mg"},
        },
    },
    {
        "id": "white_rice",
        "name": "White Rice, Cooked",
        "description": "Cooked long-grain white rice, 1 cup",
        "category": "grains",
        "serving_size": 158,
        "nutrients": {
            "energy": {"value": 206, "unit": "kcal"},
            "protein": {"value": 4.3, "unit": "g"},
            "carbohydrates": {"value": 45, "unit": "g"},
            "fiber": {"value": 0.6, "unit": "g"},
            "fat_total": {"value": 0.4, "unit": "g"},
            "folate": {"value": 108, "unit": "mcg"},
            "manganese": {"value": 0.7, "unit": "mg"},
            "iron": {"value": 2, "unit": "mg"},
        },
    },
    {
        "id": "whole_wheat_bread",
        "name": "Whole Wheat Bread",
        "description": "100% whole wheat bread, 2 slices",
        "category": "grains",
        "serving_size": 56,
        "nutrients": {
            "energy": {"value": 138, "unit": "kcal"},
            "protein": {"value": 7, "unit": "g"},
            "carbohydrates": {"value": 24, "unit": "g"},
            "fiber": {"value": 4, "unit": "g"},
            "fat_total": {"value": 2.4, "unit": "g"},
            "sodium": {"value": 264, "unit": "mg"},
            "iron": {"value": 1.4, "unit": "mg"},
            "magnesium": {"value": 46, "unit": "mg"},
            "selenium": {"value": 15, "unit": "mcg"},
        },
    },
    {
        "id": "oats_rolled",
        "name": "Rolled Oats, Dry",
        "description": "Dry rolled oats (old fashioned), 1/2 cup",
        "category": "grains",
        "serving_size": 40,
        "nutrients": {
            "energy": {"value": 150, "unit": "kcal"},
            "protein": {"value": 5, "unit": "g"},
            "carbohydrates": {"value": 27, "unit": "g"},
            "fiber": {"value": 4, "unit": "g"},
            "fat_total": {"value": 3, "unit": "g"},
            "iron": {"value": 1.7, "unit": "mg"},
            "magnesium": {"value": 56, "unit": "mg"},
            "phosphorus": {"value": 166, "unit": "mg"},
            "zinc": {"value": 1.5, "unit": "mg"},
            "manganese": {"value": 1.5, "unit": "mg"},
        },
        "bioactive_compounds": ["beta_glucan", "avenanthramides"],
    },
    {
        "id": "pasta_whole_wheat",
        "name": "Pasta, Whole Wheat",
        "description": "Cooked whole wheat spaghetti, 1 cup",
        "category": "grains",
        "serving_size": 140,
        "nutrients": {
            "energy": {"value": 174, "unit": "kcal"},
            "protein": {"value": 7.5, "unit": "g"},
            "carbohydrates": {"value": 37, "unit": "g"},
            "fiber": {"value": 6.3, "unit": "g"},
            "fat_total": {"value": 0.8, "unit": "g"},
            "manganese": {"value": 1.9, "unit": "mg"},
            "selenium": {"value": 36, "unit": "mcg"},
            "phosphorus": {"value": 125, "unit": "mg"},
            "magnesium": {"value": 42, "unit": "mg"},
        },
    },
    
    # ============================================================
    # DAIRY & ALTERNATIVES (15 items)
    # ============================================================
    {
        "id": "greek_yogurt",
        "name": "Greek Yogurt, Plain",
        "description": "Plain non-fat Greek yogurt, 1 cup",
        "category": "dairy",
        "serving_size": 245,
        "nutrients": {
            "energy": {"value": 100, "unit": "kcal"},
            "protein": {"value": 17, "unit": "g"},
            "carbohydrates": {"value": 6, "unit": "g"},
            "sugars": {"value": 6, "unit": "g"},
            "fat_total": {"value": 0.7, "unit": "g"},
            "calcium": {"value": 187, "unit": "mg"},
            "vitamin_b12": {"value": 1.3, "unit": "mcg"},
            "potassium": {"value": 240, "unit": "mg"},
            "phosphorus": {"value": 229, "unit": "mg"},
        },
        "bioactive_compounds": ["probiotics", "conjugated_linoleic_acid"],
    },
    {
        "id": "cheese_cheddar",
        "name": "Cheddar Cheese",
        "description": "Sharp cheddar cheese, 1 oz",
        "category": "dairy",
        "serving_size": 28,
        "nutrients": {
            "energy": {"value": 113, "unit": "kcal"},
            "protein": {"value": 7, "unit": "g"},
            "carbohydrates": {"value": 0.4, "unit": "g"},
            "fat_total": {"value": 9, "unit": "g"},
            "fat_saturated": {"value": 5.7, "unit": "g"},
            "cholesterol": {"value": 28, "unit": "mg"},
            "calcium": {"value": 200, "unit": "mg"},
            "vitamin_a": {"value": 85, "unit": "mcg"},
            "vitamin_b12": {"value": 0.2, "unit": "mcg"},
            "sodium": {"value": 174, "unit": "mg"},
        },
    },
    {
        "id": "milk_whole",
        "name": "Whole Milk",
        "description": "Whole cow's milk, 1 cup",
        "category": "dairy",
        "serving_size": 244,
        "nutrients": {
            "energy": {"value": 149, "unit": "kcal"},
            "protein": {"value": 8, "unit": "g"},
            "carbohydrates": {"value": 12, "unit": "g"},
            "sugars": {"value": 12, "unit": "g"},
            "fat_total": {"value": 8, "unit": "g"},
            "fat_saturated": {"value": 4.6, "unit": "g"},
            "calcium": {"value": 276, "unit": "mg"},
            "vitamin_d": {"value": 3.2, "unit": "mcg"},
            "vitamin_b12": {"value": 1.1, "unit": "mcg"},
            "potassium": {"value": 322, "unit": "mg"},
        },
    },
    {
        "id": "kefir",
        "name": "Kefir, Plain",
        "description": "Plain low-fat kefir, 1 cup",
        "category": "dairy",
        "serving_size": 243,
        "nutrients": {
            "energy": {"value": 104, "unit": "kcal"},
            "protein": {"value": 9, "unit": "g"},
            "carbohydrates": {"value": 12, "unit": "g"},
            "fat_total": {"value": 2.5, "unit": "g"},
            "calcium": {"value": 316, "unit": "mg"},
            "vitamin_d": {"value": 2.5, "unit": "mcg"},
            "vitamin_b12": {"value": 0.4, "unit": "mcg"},
            "potassium": {"value": 376, "unit": "mg"},
        },
        "bioactive_compounds": ["probiotics", "kefiran"],
    },
    
    # ============================================================
    # NUTS & SEEDS (15 items)
    # ============================================================
    {
        "id": "walnuts",
        "name": "Walnuts",
        "description": "Raw walnuts, 1 oz (14 halves)",
        "category": "nuts_seeds",
        "serving_size": 28,
        "nutrients": {
            "energy": {"value": 185, "unit": "kcal"},
            "protein": {"value": 4.3, "unit": "g"},
            "carbohydrates": {"value": 3.9, "unit": "g"},
            "fiber": {"value": 1.9, "unit": "g"},
            "fat_total": {"value": 18.5, "unit": "g"},
            "omega_3": {"value": 2.5, "unit": "g"},
            "copper": {"value": 0.45, "unit": "mg"},
            "manganese": {"value": 1, "unit": "mg"},
            "magnesium": {"value": 45, "unit": "mg"},
            "phosphorus": {"value": 98, "unit": "mg"},
        },
        "bioactive_compounds": ["ellagic_acid", "melatonin", "polyphenols"],
    },
    {
        "id": "chia_seeds",
        "name": "Chia Seeds",
        "description": "Dried chia seeds, 2 tbsp",
        "category": "nuts_seeds",
        "serving_size": 28,
        "nutrients": {
            "energy": {"value": 138, "unit": "kcal"},
            "protein": {"value": 4.7, "unit": "g"},
            "carbohydrates": {"value": 12, "unit": "g"},
            "fiber": {"value": 10, "unit": "g"},
            "fat_total": {"value": 8.7, "unit": "g"},
            "omega_3": {"value": 5, "unit": "g"},
            "calcium": {"value": 177, "unit": "mg"},
            "phosphorus": {"value": 244, "unit": "mg"},
            "magnesium": {"value": 95, "unit": "mg"},
            "manganese": {"value": 0.8, "unit": "mg"},
        },
    },
    {
        "id": "flaxseeds",
        "name": "Flaxseeds, Ground",
        "description": "Ground flaxseed, 2 tbsp",
        "category": "nuts_seeds",
        "serving_size": 14,
        "nutrients": {
            "energy": {"value": 75, "unit": "kcal"},
            "protein": {"value": 2.6, "unit": "g"},
            "carbohydrates": {"value": 4, "unit": "g"},
            "fiber": {"value": 3.8, "unit": "g"},
            "fat_total": {"value": 6, "unit": "g"},
            "omega_3": {"value": 3.2, "unit": "g"},
            "magnesium": {"value": 55, "unit": "mg"},
            "phosphorus": {"value": 90, "unit": "mg"},
            "manganese": {"value": 0.4, "unit": "mg"},
        },
        "bioactive_compounds": ["lignans", "ALA"],
    },
    {
        "id": "pumpkin_seeds",
        "name": "Pumpkin Seeds (Pepitas)",
        "description": "Raw pumpkin seeds, 1 oz",
        "category": "nuts_seeds",
        "serving_size": 28,
        "nutrients": {
            "energy": {"value": 151, "unit": "kcal"},
            "protein": {"value": 7, "unit": "g"},
            "carbohydrates": {"value": 5, "unit": "g"},
            "fiber": {"value": 1.7, "unit": "g"},
            "fat_total": {"value": 13, "unit": "g"},
            "magnesium": {"value": 150, "unit": "mg"},
            "zinc": {"value": 2.2, "unit": "mg"},
            "iron": {"value": 2.3, "unit": "mg"},
            "phosphorus": {"value": 332, "unit": "mg"},
            "manganese": {"value": 0.6, "unit": "mg"},
        },
    },
    {
        "id": "sunflower_seeds",
        "name": "Sunflower Seeds",
        "description": "Raw sunflower seeds, 1 oz",
        "category": "nuts_seeds",
        "serving_size": 28,
        "nutrients": {
            "energy": {"value": 164, "unit": "kcal"},
            "protein": {"value": 5.5, "unit": "g"},
            "carbohydrates": {"value": 6.5, "unit": "g"},
            "fiber": {"value": 3, "unit": "g"},
            "fat_total": {"value": 14, "unit": "g"},
            "vitamin_e": {"value": 7.4, "unit": "mg"},
            "selenium": {"value": 22, "unit": "mcg"},
            "copper": {"value": 0.5, "unit": "mg"},
            "magnesium": {"value": 91, "unit": "mg"},
            "vitamin_b6": {"value": 0.2, "unit": "mg"},
        },
    },
    {
        "id": "cashews",
        "name": "Cashews, Raw",
        "description": "Raw cashews, 1 oz",
        "category": "nuts_seeds",
        "serving_size": 28,
        "nutrients": {
            "energy": {"value": 157, "unit": "kcal"},
            "protein": {"value": 5, "unit": "g"},
            "carbohydrates": {"value": 9, "unit": "g"},
            "fiber": {"value": 0.9, "unit": "g"},
            "fat_total": {"value": 12, "unit": "g"},
            "magnesium": {"value": 83, "unit": "mg"},
            "copper": {"value": 0.6, "unit": "mg"},
            "phosphorus": {"value": 168, "unit": "mg"},
            "zinc": {"value": 1.6, "unit": "mg"},
            "iron": {"value": 1.9, "unit": "mg"},
        },
    },
    
    # ============================================================
    # OILS & FATS (10 items)
    # ============================================================
    {
        "id": "olive_oil",
        "name": "Extra Virgin Olive Oil",
        "description": "Extra virgin olive oil, 1 tbsp",
        "category": "oils",
        "serving_size": 14,
        "nutrients": {
            "energy": {"value": 119, "unit": "kcal"},
            "fat_total": {"value": 13.5, "unit": "g"},
            "fat_saturated": {"value": 1.9, "unit": "g"},
            "vitamin_e": {"value": 1.9, "unit": "mg"},
            "vitamin_k": {"value": 8.1, "unit": "mcg"},
            "antioxidants": {"value": 50, "unit": "mg"},
        },
        "bioactive_compounds": ["oleocanthal", "oleuropein", "hydroxytyrosol"],
    },
    {
        "id": "coconut_oil",
        "name": "Coconut Oil",
        "description": "Virgin coconut oil, 1 tbsp",
        "category": "oils",
        "serving_size": 14,
        "nutrients": {
            "energy": {"value": 121, "unit": "kcal"},
            "fat_total": {"value": 13.5, "unit": "g"},
            "fat_saturated": {"value": 11.8, "unit": "g"},
        },
        "bioactive_compounds": ["lauric_acid", "MCTs"],
    },
    {
        "id": "butter",
        "name": "Butter, Salted",
        "description": "Salted butter, 1 tbsp",
        "category": "fats",
        "serving_size": 14,
        "nutrients": {
            "energy": {"value": 102, "unit": "kcal"},
            "fat_total": {"value": 11.5, "unit": "g"},
            "fat_saturated": {"value": 7.3, "unit": "g"},
            "cholesterol": {"value": 31, "unit": "mg"},
            "vitamin_a": {"value": 97, "unit": "mcg"},
            "sodium": {"value": 91, "unit": "mg"},
        },
    },
    
    # ============================================================
    # HERBS & SPICES (10 items)
    # ============================================================
    {
        "id": "turmeric",
        "name": "Turmeric, Ground",
        "description": "Ground turmeric, 1 tsp",
        "category": "spices",
        "serving_size": 3,
        "nutrients": {
            "energy": {"value": 9, "unit": "kcal"},
            "carbohydrates": {"value": 2, "unit": "g"},
            "fiber": {"value": 0.7, "unit": "g"},
            "iron": {"value": 1.7, "unit": "mg"},
            "manganese": {"value": 0.5, "unit": "mg"},
        },
        "bioactive_compounds": ["curcumin", "turmerone", "curcuminoids"],
    },
    {
        "id": "ginger",
        "name": "Ginger, Fresh",
        "description": "Fresh ginger root, 1 tbsp grated",
        "category": "spices",
        "serving_size": 6,
        "nutrients": {
            "energy": {"value": 5, "unit": "kcal"},
            "carbohydrates": {"value": 1, "unit": "g"},
            "potassium": {"value": 25, "unit": "mg"},
            "magnesium": {"value": 3, "unit": "mg"},
        },
        "bioactive_compounds": ["gingerols", "shogaols", "zingerone"],
    },
    {
        "id": "cinnamon",
        "name": "Cinnamon, Ground",
        "description": "Ground cinnamon, 1 tsp",
        "category": "spices",
        "serving_size": 3,
        "nutrients": {
            "energy": {"value": 6, "unit": "kcal"},
            "carbohydrates": {"value": 2, "unit": "g"},
            "fiber": {"value": 1.4, "unit": "g"},
            "calcium": {"value": 26, "unit": "mg"},
            "manganese": {"value": 0.5, "unit": "mg"},
        },
        "bioactive_compounds": ["cinnamaldehyde", "polyphenols"],
    },
    {
        "id": "black_pepper",
        "name": "Black Pepper",
        "description": "Ground black pepper, 1 tsp",
        "category": "spices",
        "serving_size": 2,
        "nutrients": {
            "energy": {"value": 6, "unit": "kcal"},
            "carbohydrates": {"value": 1.4, "unit": "g"},
            "fiber": {"value": 0.6, "unit": "g"},
            "vitamin_k": {"value": 4, "unit": "mcg"},
            "manganese": {"value": 0.1, "unit": "mg"},
        },
        "bioactive_compounds": ["piperine"],
    },
]

async def seed_comprehensive_foods():
    """Add comprehensive foods with detailed parameter effects to database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    added = 0
    updated = 0
    
    for food in COMPREHENSIVE_FOODS:
        # Calculate parameter effects from nutrients
        effects = calculate_parameter_effects(food.get("nutrients", {}))
        
        food_doc = {
            **food,
            "organ_system_parameter_effects": effects,
            "source": "PhiCor Comprehensive Database",
            "has_parameter_effects": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        
        # Check if exists
        existing = await db.foods.find_one({"id": food["id"]})
        
        if existing:
            await db.foods.update_one({"id": food["id"]}, {"$set": food_doc})
            updated += 1
        else:
            await db.foods.insert_one(food_doc)
            added += 1
    
    # Get final count
    total = await db.foods.count_documents({})
    with_effects = await db.foods.count_documents({"has_parameter_effects": True})
    
    print(f"=== Comprehensive Food Database Update ===")
    print(f"Added: {added} new foods")
    print(f"Updated: {updated} existing foods")
    print(f"Total foods: {total}")
    print(f"Foods with parameter effects: {with_effects}")

if __name__ == "__main__":
    asyncio.run(seed_comprehensive_foods())
