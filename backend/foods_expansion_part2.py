"""
PhiCor Food Engine - Additional Foods Expansion Part 2
More superfoods, healthy meals, regional cuisines, and specific products
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

def calculate_organ_effects(nutrients):
    """Calculate organ system effects based on nutrient content"""
    effects = {}
    
    # Cardiovascular
    cardio_effects = []
    if nutrients.get('sodium', {}).get('value', 0) > 400:
        cardio_effects.append({"parameter": "blood_pressure", "direction": "increase", "magnitude": "moderate", "mechanism": "High sodium content"})
    if nutrients.get('potassium', {}).get('value', 0) > 300:
        cardio_effects.append({"parameter": "blood_pressure", "direction": "decrease", "magnitude": "mild", "mechanism": "Potassium vasodilation"})
    if nutrients.get('fiber', {}).get('value', 0) > 3:
        cardio_effects.append({"parameter": "LDL_cholesterol", "direction": "decrease", "magnitude": "mild", "mechanism": "Fiber binds bile acids"})
    if nutrients.get('fat_saturated', {}).get('value', 0) > 5:
        cardio_effects.append({"parameter": "LDL_cholesterol", "direction": "increase", "magnitude": "moderate", "mechanism": "Saturated fat raises LDL"})
    effects['cardiovascular'] = {"overall": "beneficial" if len([e for e in cardio_effects if e['direction'] == 'decrease']) > len([e for e in cardio_effects if e['direction'] == 'increase']) else "caution" if cardio_effects else "neutral", "effects": cardio_effects}
    
    # Glycemic
    glycemic_effects = []
    carbs = nutrients.get('carbohydrates', {}).get('value', 0)
    fiber = nutrients.get('fiber', {}).get('value', 0)
    sugars = nutrients.get('sugars', {}).get('value', 0)
    if carbs > 20:
        gi_impact = "high" if sugars > 10 and fiber < 3 else "moderate" if fiber < 5 else "low"
        glycemic_effects.append({"parameter": "blood_glucose", "direction": "increase", "magnitude": gi_impact, "mechanism": f"Carbohydrate content"})
    effects['glycemic'] = {"overall": "caution" if any(e['magnitude'] == 'high' for e in glycemic_effects) else "neutral", "effects": glycemic_effects}
    
    # Renal
    renal_effects = []
    protein = nutrients.get('protein', {}).get('value', 0)
    potassium = nutrients.get('potassium', {}).get('value', 0)
    if protein > 15:
        renal_effects.append({"parameter": "BUN", "direction": "increase", "magnitude": "mild", "mechanism": "Protein metabolism"})
    if potassium > 400:
        renal_effects.append({"parameter": "serum_potassium", "direction": "increase", "magnitude": "moderate", "mechanism": "High potassium"})
    effects['renal'] = {"overall": "caution" if potassium > 500 else "neutral", "effects": renal_effects}
    
    # Hepatic
    hepatic_effects = []
    if nutrients.get('fat_total', {}).get('value', 0) > 15:
        hepatic_effects.append({"parameter": "hepatic_fat", "direction": "increase", "magnitude": "mild", "mechanism": "Dietary fat processing"})
    effects['hepatic'] = {"overall": "neutral", "effects": hepatic_effects}
    
    # GI
    gi_effects = []
    if fiber > 5:
        gi_effects.append({"parameter": "bowel_motility", "direction": "increase", "magnitude": "beneficial", "mechanism": "Fiber bulk effect"})
    effects['gastrointestinal'] = {"overall": "beneficial" if fiber > 3 else "neutral", "effects": gi_effects}
    
    return effects

# Additional foods database
ADDITIONAL_FOODS = [
    # =========== SUPERFOODS ===========
    {"name": "Acai berries, frozen", "category": "superfoods", "serving_size": "1 packet (100g)", "serving_size_g": 100, "nutrients": {"energy": {"value": 70, "unit": "kcal"}, "protein": {"value": 1.5, "unit": "g"}, "carbohydrates": {"value": 6, "unit": "g"}, "fiber": {"value": 4, "unit": "g"}, "fat_total": {"value": 5, "unit": "g"}, "vitamin_c": {"value": 10, "unit": "mg"}}, "glycemic_index": 10, "compounds": ["anthocyanins", "polyphenols", "oleic_acid"]},
    {"name": "Goji berries, dried", "category": "superfoods", "serving_size": "1 oz (28g)", "serving_size_g": 28, "nutrients": {"energy": {"value": 98, "unit": "kcal"}, "protein": {"value": 4, "unit": "g"}, "carbohydrates": {"value": 22, "unit": "g"}, "fiber": {"value": 3.6, "unit": "g"}, "vitamin_a": {"value": 501, "unit": "mcg"}, "vitamin_c": {"value": 13, "unit": "mg"}, "iron": {"value": 1.9, "unit": "mg"}}, "glycemic_index": 29, "compounds": ["zeaxanthin", "polysaccharides"]},
    {"name": "Spirulina powder", "category": "superfoods", "serving_size": "1 tbsp (7g)", "serving_size_g": 7, "nutrients": {"energy": {"value": 20, "unit": "kcal"}, "protein": {"value": 4, "unit": "g"}, "carbohydrates": {"value": 1.7, "unit": "g"}, "iron": {"value": 2, "unit": "mg"}, "vitamin_b12": {"value": 0.5, "unit": "mcg"}, "vitamin_k": {"value": 2, "unit": "mcg"}}, "glycemic_index": 0, "compounds": ["phycocyanin", "chlorophyll", "GLA"]},
    {"name": "Chlorella powder", "category": "superfoods", "serving_size": "1 tbsp (7g)", "serving_size_g": 7, "nutrients": {"energy": {"value": 25, "unit": "kcal"}, "protein": {"value": 4, "unit": "g"}, "carbohydrates": {"value": 1, "unit": "g"}, "iron": {"value": 1.5, "unit": "mg"}, "vitamin_b12": {"value": 0.1, "unit": "mcg"}}, "compounds": ["chlorophyll", "CGF"]},
    {"name": "Maca powder", "category": "superfoods", "serving_size": "1 tbsp (15g)", "serving_size_g": 15, "nutrients": {"energy": {"value": 50, "unit": "kcal"}, "protein": {"value": 1.5, "unit": "g"}, "carbohydrates": {"value": 10, "unit": "g"}, "fiber": {"value": 1.2, "unit": "g"}, "vitamin_c": {"value": 4, "unit": "mg"}, "iron": {"value": 1, "unit": "mg"}}, "compounds": ["macamides", "glucosinolates"]},
    {"name": "Cacao nibs", "category": "superfoods", "serving_size": "1 oz (28g)", "serving_size_g": 28, "nutrients": {"energy": {"value": 175, "unit": "kcal"}, "protein": {"value": 4, "unit": "g"}, "carbohydrates": {"value": 10, "unit": "g"}, "fiber": {"value": 9, "unit": "g"}, "fat_total": {"value": 15, "unit": "g"}, "magnesium": {"value": 64, "unit": "mg"}, "iron": {"value": 1.3, "unit": "mg"}}, "compounds": ["theobromine", "flavonoids", "PEA"]},
    {"name": "Matcha powder", "category": "superfoods", "serving_size": "1 tsp (2g)", "serving_size_g": 2, "nutrients": {"energy": {"value": 6, "unit": "kcal"}, "caffeine": {"value": 70, "unit": "mg"}}, "compounds": ["EGCG", "L-theanine", "chlorophyll"]},
    {"name": "Moringa powder", "category": "superfoods", "serving_size": "1 tbsp (10g)", "serving_size_g": 10, "nutrients": {"energy": {"value": 30, "unit": "kcal"}, "protein": {"value": 2.5, "unit": "g"}, "carbohydrates": {"value": 4, "unit": "g"}, "fiber": {"value": 2, "unit": "g"}, "vitamin_a": {"value": 378, "unit": "mcg"}, "vitamin_c": {"value": 52, "unit": "mg"}, "calcium": {"value": 185, "unit": "mg"}, "iron": {"value": 2.8, "unit": "mg"}}, "compounds": ["isothiocyanates", "quercetin"]},
    {"name": "Turmeric, ground", "category": "superfoods", "serving_size": "1 tsp (3g)", "serving_size_g": 3, "nutrients": {"energy": {"value": 9, "unit": "kcal"}, "carbohydrates": {"value": 2, "unit": "g"}, "fiber": {"value": 0.7, "unit": "g"}, "manganese": {"value": 0.5, "unit": "mg"}, "iron": {"value": 1.6, "unit": "mg"}}, "compounds": ["curcumin", "turmerone"]},
    {"name": "Ginger, fresh", "category": "superfoods", "serving_size": "1 tbsp grated (6g)", "serving_size_g": 6, "nutrients": {"energy": {"value": 5, "unit": "kcal"}, "carbohydrates": {"value": 1, "unit": "g"}, "potassium": {"value": 25, "unit": "mg"}, "magnesium": {"value": 2.6, "unit": "mg"}}, "compounds": ["gingerol", "shogaol"]},
    {"name": "Wheatgrass juice", "category": "superfoods", "serving_size": "1 oz (30ml)", "serving_size_g": 30, "nutrients": {"energy": {"value": 8, "unit": "kcal"}, "protein": {"value": 1, "unit": "g"}, "vitamin_a": {"value": 120, "unit": "mcg"}, "vitamin_c": {"value": 8, "unit": "mg"}, "iron": {"value": 1.2, "unit": "mg"}}, "compounds": ["chlorophyll"]},
    {"name": "Bee pollen", "category": "superfoods", "serving_size": "1 tbsp (10g)", "serving_size_g": 10, "nutrients": {"energy": {"value": 40, "unit": "kcal"}, "protein": {"value": 2.5, "unit": "g"}, "carbohydrates": {"value": 6, "unit": "g"}, "vitamin_b1": {"value": 0.1, "unit": "mg"}, "vitamin_b2": {"value": 0.1, "unit": "mg"}}, "compounds": ["flavonoids", "phenolic_acids"]},
    {"name": "Manuka honey", "category": "superfoods", "serving_size": "1 tbsp (21g)", "serving_size_g": 21, "nutrients": {"energy": {"value": 64, "unit": "kcal"}, "carbohydrates": {"value": 17, "unit": "g"}, "sugars": {"value": 17, "unit": "g"}}}, "compounds": ["methylglyoxal", "leptosperin"]},
    {"name": "Collagen peptides", "category": "superfoods", "serving_size": "1 scoop (11g)", "serving_size_g": 11, "nutrients": {"energy": {"value": 40, "unit": "kcal"}, "protein": {"value": 10, "unit": "g"}}}, "compounds": ["hydroxyproline", "glycine", "proline"]},
    {"name": "MCT oil", "category": "superfoods", "serving_size": "1 tbsp (14g)", "serving_size_g": 14, "nutrients": {"energy": {"value": 120, "unit": "kcal"}, "fat_total": {"value": 14, "unit": "g"}, "fat_saturated": {"value": 14, "unit": "g"}}}, "compounds": ["caprylic_acid", "capric_acid"]},
    
    # =========== HEALTHY MEAL PREPS ===========
    {"name": "Grilled chicken salad", "category": "healthy_meals", "serving_size": "1 bowl (350g)", "serving_size_g": 350, "nutrients": {"energy": {"value": 320, "unit": "kcal"}, "protein": {"value": 35, "unit": "g"}, "carbohydrates": {"value": 12, "unit": "g"}, "fiber": {"value": 5, "unit": "g"}, "fat_total": {"value": 15, "unit": "g"}, "sodium": {"value": 450, "unit": "mg"}}},
    {"name": "Salmon with roasted vegetables", "category": "healthy_meals", "serving_size": "1 plate (400g)", "serving_size_g": 400, "nutrients": {"energy": {"value": 480, "unit": "kcal"}, "protein": {"value": 38, "unit": "g"}, "carbohydrates": {"value": 25, "unit": "g"}, "fiber": {"value": 6, "unit": "g"}, "fat_total": {"value": 24, "unit": "g"}, "potassium": {"value": 850, "unit": "mg"}}},
    {"name": "Quinoa Buddha bowl", "category": "healthy_meals", "serving_size": "1 bowl (400g)", "serving_size_g": 400, "nutrients": {"energy": {"value": 420, "unit": "kcal"}, "protein": {"value": 15, "unit": "g"}, "carbohydrates": {"value": 55, "unit": "g"}, "fiber": {"value": 12, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "iron": {"value": 4.5, "unit": "mg"}}},
    {"name": "Turkey and avocado wrap", "category": "healthy_meals", "serving_size": "1 wrap (250g)", "serving_size_g": 250, "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 28, "unit": "g"}, "carbohydrates": {"value": 30, "unit": "g"}, "fiber": {"value": 8, "unit": "g"}, "fat_total": {"value": 18, "unit": "g"}}},
    {"name": "Overnight oats with berries", "category": "healthy_meals", "serving_size": "1 jar (300g)", "serving_size_g": 300, "nutrients": {"energy": {"value": 350, "unit": "kcal"}, "protein": {"value": 12, "unit": "g"}, "carbohydrates": {"value": 55, "unit": "g"}, "fiber": {"value": 8, "unit": "g"}, "fat_total": {"value": 10, "unit": "g"}}},
    {"name": "Greek yogurt parfait", "category": "healthy_meals", "serving_size": "1 serving (280g)", "serving_size_g": 280, "nutrients": {"energy": {"value": 320, "unit": "kcal"}, "protein": {"value": 20, "unit": "g"}, "carbohydrates": {"value": 42, "unit": "g"}, "fiber": {"value": 4, "unit": "g"}, "fat_total": {"value": 8, "unit": "g"}, "calcium": {"value": 280, "unit": "mg"}}},
    {"name": "Lentil soup", "category": "healthy_meals", "serving_size": "1 bowl (350ml)", "serving_size_g": 350, "nutrients": {"energy": {"value": 230, "unit": "kcal"}, "protein": {"value": 14, "unit": "g"}, "carbohydrates": {"value": 32, "unit": "g"}, "fiber": {"value": 12, "unit": "g"}, "fat_total": {"value": 4, "unit": "g"}, "iron": {"value": 5, "unit": "mg"}}},
    {"name": "Grilled tofu stir-fry", "category": "healthy_meals", "serving_size": "1 plate (350g)", "serving_size_g": 350, "nutrients": {"energy": {"value": 320, "unit": "kcal"}, "protein": {"value": 22, "unit": "g"}, "carbohydrates": {"value": 28, "unit": "g"}, "fiber": {"value": 6, "unit": "g"}, "fat_total": {"value": 14, "unit": "g"}, "calcium": {"value": 350, "unit": "mg"}}},
    {"name": "Mediterranean grain bowl", "category": "healthy_meals", "serving_size": "1 bowl (380g)", "serving_size_g": 380, "nutrients": {"energy": {"value": 450, "unit": "kcal"}, "protein": {"value": 16, "unit": "g"}, "carbohydrates": {"value": 52, "unit": "g"}, "fiber": {"value": 10, "unit": "g"}, "fat_total": {"value": 20, "unit": "g"}}},
    {"name": "Egg white omelette with vegetables", "category": "healthy_meals", "serving_size": "1 omelette (200g)", "serving_size_g": 200, "nutrients": {"energy": {"value": 150, "unit": "kcal"}, "protein": {"value": 20, "unit": "g"}, "carbohydrates": {"value": 8, "unit": "g"}, "fiber": {"value": 2, "unit": "g"}, "fat_total": {"value": 4, "unit": "g"}}},
    {"name": "Smoothie bowl (acai)", "category": "healthy_meals", "serving_size": "1 bowl (350g)", "serving_size_g": 350, "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 65, "unit": "g"}, "fiber": {"value": 10, "unit": "g"}, "fat_total": {"value": 12, "unit": "g"}}},
    {"name": "Chicken and vegetable soup", "category": "healthy_meals", "serving_size": "1 bowl (400ml)", "serving_size_g": 400, "nutrients": {"energy": {"value": 180, "unit": "kcal"}, "protein": {"value": 18, "unit": "g"}, "carbohydrates": {"value": 15, "unit": "g"}, "fiber": {"value": 3, "unit": "g"}, "fat_total": {"value": 5, "unit": "g"}, "sodium": {"value": 680, "unit": "mg"}}},
    
    # =========== BREAKFAST ITEMS ===========
    {"name": "Scrambled eggs (2 eggs)", "category": "breakfast", "serving_size": "2 eggs (100g)", "serving_size_g": 100, "nutrients": {"energy": {"value": 182, "unit": "kcal"}, "protein": {"value": 12, "unit": "g"}, "carbohydrates": {"value": 2, "unit": "g"}, "fat_total": {"value": 14, "unit": "g"}, "cholesterol": {"value": 370, "unit": "mg"}, "selenium": {"value": 23, "unit": "mcg"}}},
    {"name": "Oatmeal with banana and honey", "category": "breakfast", "serving_size": "1 bowl (300g)", "serving_size_g": 300, "nutrients": {"energy": {"value": 350, "unit": "kcal"}, "protein": {"value": 10, "unit": "g"}, "carbohydrates": {"value": 65, "unit": "g"}, "fiber": {"value": 6, "unit": "g"}, "sugars": {"value": 20, "unit": "g"}, "fat_total": {"value": 6, "unit": "g"}}},
    {"name": "Avocado toast (whole grain)", "category": "breakfast", "serving_size": "2 slices (200g)", "serving_size_g": 200, "nutrients": {"energy": {"value": 340, "unit": "kcal"}, "protein": {"value": 10, "unit": "g"}, "carbohydrates": {"value": 32, "unit": "g"}, "fiber": {"value": 12, "unit": "g"}, "fat_total": {"value": 20, "unit": "g"}, "potassium": {"value": 580, "unit": "mg"}}},
    {"name": "Pancakes (2) with maple syrup", "category": "breakfast", "serving_size": "2 pancakes (150g)", "serving_size_g": 150, "nutrients": {"energy": {"value": 360, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 60, "unit": "g"}, "sugars": {"value": 24, "unit": "g"}, "fat_total": {"value": 10, "unit": "g"}}},
    {"name": "French toast (2 slices)", "category": "breakfast", "serving_size": "2 slices (140g)", "serving_size_g": 140, "nutrients": {"energy": {"value": 280, "unit": "kcal"}, "protein": {"value": 10, "unit": "g"}, "carbohydrates": {"value": 36, "unit": "g"}, "fat_total": {"value": 10, "unit": "g"}, "cholesterol": {"value": 120, "unit": "mg"}}},
    {"name": "Breakfast burrito", "category": "breakfast", "serving_size": "1 burrito (250g)", "serving_size_g": 250, "nutrients": {"energy": {"value": 420, "unit": "kcal"}, "protein": {"value": 18, "unit": "g"}, "carbohydrates": {"value": 38, "unit": "g"}, "fat_total": {"value": 22, "unit": "g"}, "sodium": {"value": 780, "unit": "mg"}}},
    {"name": "Granola with milk", "category": "breakfast", "serving_size": "1 bowl (200g)", "serving_size_g": 200, "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 10, "unit": "g"}, "carbohydrates": {"value": 55, "unit": "g"}, "fiber": {"value": 5, "unit": "g"}, "sugars": {"value": 18, "unit": "g"}, "fat_total": {"value": 14, "unit": "g"}}},
    {"name": "Bacon (3 strips)", "category": "breakfast", "serving_size": "3 strips (34g)", "serving_size_g": 34, "nutrients": {"energy": {"value": 161, "unit": "kcal"}, "protein": {"value": 12, "unit": "g"}, "fat_total": {"value": 12, "unit": "g"}, "fat_saturated": {"value": 4, "unit": "g"}, "sodium": {"value": 581, "unit": "mg"}}},
    {"name": "Sausage links (2)", "category": "breakfast", "serving_size": "2 links (56g)", "serving_size_g": 56, "nutrients": {"energy": {"value": 180, "unit": "kcal"}, "protein": {"value": 10, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "fat_saturated": {"value": 5, "unit": "g"}, "sodium": {"value": 450, "unit": "mg"}}},
    {"name": "Croissant", "category": "breakfast", "serving_size": "1 croissant (57g)", "serving_size_g": 57, "nutrients": {"energy": {"value": 231, "unit": "kcal"}, "protein": {"value": 5, "unit": "g"}, "carbohydrates": {"value": 26, "unit": "g"}, "fat_total": {"value": 12, "unit": "g"}, "fat_saturated": {"value": 7, "unit": "g"}}},
    {"name": "Bagel with cream cheese", "category": "breakfast", "serving_size": "1 bagel (130g)", "serving_size_g": 130, "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 12, "unit": "g"}, "carbohydrates": {"value": 55, "unit": "g"}, "fat_total": {"value": 12, "unit": "g"}, "sodium": {"value": 520, "unit": "mg"}}},
    {"name": "English muffin with butter", "category": "breakfast", "serving_size": "1 muffin (75g)", "serving_size_g": 75, "nutrients": {"energy": {"value": 200, "unit": "kcal"}, "protein": {"value": 5, "unit": "g"}, "carbohydrates": {"value": 26, "unit": "g"}, "fat_total": {"value": 8, "unit": "g"}}},
    
    # =========== SNACKS & APPETIZERS ===========
    {"name": "Trail mix", "category": "snacks", "serving_size": "1/4 cup (40g)", "serving_size_g": 40, "nutrients": {"energy": {"value": 200, "unit": "kcal"}, "protein": {"value": 5, "unit": "g"}, "carbohydrates": {"value": 18, "unit": "g"}, "fiber": {"value": 2, "unit": "g"}, "fat_total": {"value": 13, "unit": "g"}, "iron": {"value": 1, "unit": "mg"}}},
    {"name": "Cheese and crackers", "category": "snacks", "serving_size": "1 oz cheese + 6 crackers (45g)", "serving_size_g": 45, "nutrients": {"energy": {"value": 210, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 15, "unit": "g"}, "fat_total": {"value": 13, "unit": "g"}, "calcium": {"value": 180, "unit": "mg"}}},
    {"name": "Hummus with vegetables", "category": "snacks", "serving_size": "1/4 cup hummus + veggies (120g)", "serving_size_g": 120, "nutrients": {"energy": {"value": 150, "unit": "kcal"}, "protein": {"value": 5, "unit": "g"}, "carbohydrates": {"value": 18, "unit": "g"}, "fiber": {"value": 5, "unit": "g"}, "fat_total": {"value": 7, "unit": "g"}}},
    {"name": "Popcorn, air-popped", "category": "snacks", "serving_size": "3 cups (24g)", "serving_size_g": 24, "nutrients": {"energy": {"value": 93, "unit": "kcal"}, "protein": {"value": 3, "unit": "g"}, "carbohydrates": {"value": 19, "unit": "g"}, "fiber": {"value": 3.5, "unit": "g"}, "fat_total": {"value": 1, "unit": "g"}}},
    {"name": "Edamame, in shell", "category": "snacks", "serving_size": "1 cup (155g)", "serving_size_g": 155, "nutrients": {"energy": {"value": 188, "unit": "kcal"}, "protein": {"value": 18, "unit": "g"}, "carbohydrates": {"value": 14, "unit": "g"}, "fiber": {"value": 8, "unit": "g"}, "fat_total": {"value": 8, "unit": "g"}, "folate": {"value": 482, "unit": "mcg"}}},
    {"name": "Apple slices with peanut butter", "category": "snacks", "serving_size": "1 apple + 2 tbsp PB (180g)", "serving_size_g": 180, "nutrients": {"energy": {"value": 290, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 32, "unit": "g"}, "fiber": {"value": 6, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}}},
    {"name": "String cheese", "category": "snacks", "serving_size": "1 stick (28g)", "serving_size_g": 28, "nutrients": {"energy": {"value": 80, "unit": "kcal"}, "protein": {"value": 7, "unit": "g"}, "carbohydrates": {"value": 1, "unit": "g"}, "fat_total": {"value": 6, "unit": "g"}, "calcium": {"value": 200, "unit": "mg"}}},
    {"name": "Rice cakes", "category": "snacks", "serving_size": "2 cakes (18g)", "serving_size_g": 18, "nutrients": {"energy": {"value": 70, "unit": "kcal"}, "protein": {"value": 1.5, "unit": "g"}, "carbohydrates": {"value": 15, "unit": "g"}, "fiber": {"value": 0.4, "unit": "g"}, "fat_total": {"value": 0.5, "unit": "g"}}},
    {"name": "Beef jerky", "category": "snacks", "serving_size": "1 oz (28g)", "serving_size_g": 28, "nutrients": {"energy": {"value": 116, "unit": "kcal"}, "protein": {"value": 9, "unit": "g"}, "carbohydrates": {"value": 3, "unit": "g"}, "fat_total": {"value": 7, "unit": "g"}, "sodium": {"value": 590, "unit": "mg"}, "zinc": {"value": 2, "unit": "mg"}}},
    {"name": "Pretzels", "category": "snacks", "serving_size": "1 oz (28g)", "serving_size_g": 28, "nutrients": {"energy": {"value": 108, "unit": "kcal"}, "protein": {"value": 3, "unit": "g"}, "carbohydrates": {"value": 23, "unit": "g"}, "fat_total": {"value": 1, "unit": "g"}, "sodium": {"value": 385, "unit": "mg"}}},
    {"name": "Dark chocolate (70%)", "category": "snacks", "serving_size": "1 oz (28g)", "serving_size_g": 28, "nutrients": {"energy": {"value": 170, "unit": "kcal"}, "protein": {"value": 2, "unit": "g"}, "carbohydrates": {"value": 13, "unit": "g"}, "fiber": {"value": 3, "unit": "g"}, "fat_total": {"value": 12, "unit": "g"}, "magnesium": {"value": 64, "unit": "mg"}, "iron": {"value": 3.3, "unit": "mg"}}},
    {"name": "Greek yogurt dip with veggies", "category": "snacks", "serving_size": "1/2 cup + veggies (150g)", "serving_size_g": 150, "nutrients": {"energy": {"value": 100, "unit": "kcal"}, "protein": {"value": 12, "unit": "g"}, "carbohydrates": {"value": 10, "unit": "g"}, "fiber": {"value": 2, "unit": "g"}, "fat_total": {"value": 2, "unit": "g"}}},
    {"name": "Bruschetta", "category": "snacks", "serving_size": "3 pieces (120g)", "serving_size_g": 120, "nutrients": {"energy": {"value": 180, "unit": "kcal"}, "protein": {"value": 4, "unit": "g"}, "carbohydrates": {"value": 24, "unit": "g"}, "fat_total": {"value": 8, "unit": "g"}}},
    {"name": "Deviled eggs (2)", "category": "snacks", "serving_size": "2 halves (60g)", "serving_size_g": 60, "nutrients": {"energy": {"value": 130, "unit": "kcal"}, "protein": {"value": 6, "unit": "g"}, "carbohydrates": {"value": 1, "unit": "g"}, "fat_total": {"value": 11, "unit": "g"}, "cholesterol": {"value": 185, "unit": "mg"}}},
    {"name": "Caprese skewers (3)", "category": "snacks", "serving_size": "3 skewers (90g)", "serving_size_g": 90, "nutrients": {"energy": {"value": 150, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 4, "unit": "g"}, "fat_total": {"value": 12, "unit": "g"}, "calcium": {"value": 180, "unit": "mg"}}},
    
    # =========== DESSERTS ===========
    {"name": "Apple pie (1 slice)", "category": "desserts", "serving_size": "1 slice (125g)", "serving_size_g": 125, "nutrients": {"energy": {"value": 296, "unit": "kcal"}, "protein": {"value": 2, "unit": "g"}, "carbohydrates": {"value": 43, "unit": "g"}, "sugars": {"value": 23, "unit": "g"}, "fat_total": {"value": 14, "unit": "g"}}},
    {"name": "Chocolate cake (1 slice)", "category": "desserts", "serving_size": "1 slice (100g)", "serving_size_g": 100, "nutrients": {"energy": {"value": 352, "unit": "kcal"}, "protein": {"value": 4, "unit": "g"}, "carbohydrates": {"value": 51, "unit": "g"}, "sugars": {"value": 35, "unit": "g"}, "fat_total": {"value": 15, "unit": "g"}}},
    {"name": "Cheesecake (1 slice)", "category": "desserts", "serving_size": "1 slice (100g)", "serving_size_g": 100, "nutrients": {"energy": {"value": 321, "unit": "kcal"}, "protein": {"value": 6, "unit": "g"}, "carbohydrates": {"value": 26, "unit": "g"}, "sugars": {"value": 21, "unit": "g"}, "fat_total": {"value": 22, "unit": "g"}}},
    {"name": "Brownie", "category": "desserts", "serving_size": "1 brownie (60g)", "serving_size_g": 60, "nutrients": {"energy": {"value": 243, "unit": "kcal"}, "protein": {"value": 3, "unit": "g"}, "carbohydrates": {"value": 32, "unit": "g"}, "sugars": {"value": 22, "unit": "g"}, "fat_total": {"value": 12, "unit": "g"}}},
    {"name": "Banana bread (1 slice)", "category": "desserts", "serving_size": "1 slice (60g)", "serving_size_g": 60, "nutrients": {"energy": {"value": 196, "unit": "kcal"}, "protein": {"value": 3, "unit": "g"}, "carbohydrates": {"value": 33, "unit": "g"}, "sugars": {"value": 14, "unit": "g"}, "fat_total": {"value": 6, "unit": "g"}}},
    {"name": "Chocolate chip cookie", "category": "desserts", "serving_size": "1 large cookie (40g)", "serving_size_g": 40, "nutrients": {"energy": {"value": 190, "unit": "kcal"}, "protein": {"value": 2, "unit": "g"}, "carbohydrates": {"value": 26, "unit": "g"}, "sugars": {"value": 14, "unit": "g"}, "fat_total": {"value": 9, "unit": "g"}}},
    {"name": "Creme brulee", "category": "desserts", "serving_size": "1 serving (100g)", "serving_size_g": 100, "nutrients": {"energy": {"value": 280, "unit": "kcal"}, "protein": {"value": 4, "unit": "g"}, "carbohydrates": {"value": 26, "unit": "g"}, "sugars": {"value": 24, "unit": "g"}, "fat_total": {"value": 18, "unit": "g"}}},
    {"name": "Panna cotta", "category": "desserts", "serving_size": "1 serving (120g)", "serving_size_g": 120, "nutrients": {"energy": {"value": 310, "unit": "kcal"}, "protein": {"value": 4, "unit": "g"}, "carbohydrates": {"value": 28, "unit": "g"}, "sugars": {"value": 26, "unit": "g"}, "fat_total": {"value": 20, "unit": "g"}}},
    {"name": "Fruit sorbet", "category": "desserts", "serving_size": "1/2 cup (100g)", "serving_size_g": 100, "nutrients": {"energy": {"value": 120, "unit": "kcal"}, "carbohydrates": {"value": 30, "unit": "g"}, "sugars": {"value": 26, "unit": "g"}, "fat_total": {"value": 0, "unit": "g"}}},
    {"name": "Frozen yogurt", "category": "desserts", "serving_size": "1/2 cup (100g)", "serving_size_g": 100, "nutrients": {"energy": {"value": 127, "unit": "kcal"}, "protein": {"value": 3, "unit": "g"}, "carbohydrates": {"value": 22, "unit": "g"}, "sugars": {"value": 17, "unit": "g"}, "fat_total": {"value": 4, "unit": "g"}}},
    {"name": "Rice pudding", "category": "desserts", "serving_size": "1/2 cup (130g)", "serving_size_g": 130, "nutrients": {"energy": {"value": 200, "unit": "kcal"}, "protein": {"value": 5, "unit": "g"}, "carbohydrates": {"value": 36, "unit": "g"}, "sugars": {"value": 18, "unit": "g"}, "fat_total": {"value": 4, "unit": "g"}}},
    {"name": "Bread pudding", "category": "desserts", "serving_size": "1 serving (150g)", "serving_size_g": 150, "nutrients": {"energy": {"value": 340, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 48, "unit": "g"}, "sugars": {"value": 28, "unit": "g"}, "fat_total": {"value": 13, "unit": "g"}}},
    
    # =========== SAUCES & CONDIMENTS ===========
    {"name": "Ketchup", "category": "condiments", "serving_size": "1 tbsp (17g)", "serving_size_g": 17, "nutrients": {"energy": {"value": 19, "unit": "kcal"}, "carbohydrates": {"value": 5, "unit": "g"}, "sugars": {"value": 4, "unit": "g"}, "sodium": {"value": 154, "unit": "mg"}}},
    {"name": "Mustard, yellow", "category": "condiments", "serving_size": "1 tsp (5g)", "serving_size_g": 5, "nutrients": {"energy": {"value": 3, "unit": "kcal"}, "sodium": {"value": 57, "unit": "mg"}}},
    {"name": "Mayonnaise", "category": "condiments", "serving_size": "1 tbsp (13g)", "serving_size_g": 13, "nutrients": {"energy": {"value": 94, "unit": "kcal"}, "fat_total": {"value": 10, "unit": "g"}, "sodium": {"value": 88, "unit": "mg"}}},
    {"name": "BBQ sauce", "category": "condiments", "serving_size": "2 tbsp (36g)", "serving_size_g": 36, "nutrients": {"energy": {"value": 52, "unit": "kcal"}, "carbohydrates": {"value": 13, "unit": "g"}, "sugars": {"value": 10, "unit": "g"}, "sodium": {"value": 349, "unit": "mg"}}},
    {"name": "Hot sauce (Tabasco)", "category": "condiments", "serving_size": "1 tsp (5ml)", "serving_size_g": 5, "nutrients": {"energy": {"value": 1, "unit": "kcal"}, "sodium": {"value": 35, "unit": "mg"}}},
    {"name": "Soy sauce", "category": "condiments", "serving_size": "1 tbsp (16ml)", "serving_size_g": 16, "nutrients": {"energy": {"value": 9, "unit": "kcal"}, "protein": {"value": 1, "unit": "g"}, "carbohydrates": {"value": 1, "unit": "g"}, "sodium": {"value": 879, "unit": "mg"}}},
    {"name": "Sriracha", "category": "condiments", "serving_size": "1 tsp (5g)", "serving_size_g": 5, "nutrients": {"energy": {"value": 5, "unit": "kcal"}, "carbohydrates": {"value": 1, "unit": "g"}, "sodium": {"value": 80, "unit": "mg"}}},
    {"name": "Ranch dressing", "category": "condiments", "serving_size": "2 tbsp (30g)", "serving_size_g": 30, "nutrients": {"energy": {"value": 145, "unit": "kcal"}, "fat_total": {"value": 15, "unit": "g"}, "carbohydrates": {"value": 2, "unit": "g"}, "sodium": {"value": 260, "unit": "mg"}}},
    {"name": "Italian dressing", "category": "condiments", "serving_size": "2 tbsp (30g)", "serving_size_g": 30, "nutrients": {"energy": {"value": 86, "unit": "kcal"}, "fat_total": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 3, "unit": "g"}, "sodium": {"value": 243, "unit": "mg"}}},
    {"name": "Balsamic vinaigrette", "category": "condiments", "serving_size": "2 tbsp (30g)", "serving_size_g": 30, "nutrients": {"energy": {"value": 90, "unit": "kcal"}, "fat_total": {"value": 9, "unit": "g"}, "carbohydrates": {"value": 3, "unit": "g"}, "sodium": {"value": 190, "unit": "mg"}}},
    {"name": "Olive oil", "category": "condiments", "serving_size": "1 tbsp (14g)", "serving_size_g": 14, "nutrients": {"energy": {"value": 119, "unit": "kcal"}, "fat_total": {"value": 14, "unit": "g"}, "fat_saturated": {"value": 2, "unit": "g"}, "fat_monounsaturated": {"value": 10, "unit": "g"}, "vitamin_e": {"value": 1.9, "unit": "mg"}}},
    {"name": "Pesto sauce", "category": "condiments", "serving_size": "2 tbsp (30g)", "serving_size_g": 30, "nutrients": {"energy": {"value": 160, "unit": "kcal"}, "protein": {"value": 3, "unit": "g"}, "carbohydrates": {"value": 2, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "sodium": {"value": 280, "unit": "mg"}}},
    {"name": "Teriyaki sauce", "category": "condiments", "serving_size": "2 tbsp (36g)", "serving_size_g": 36, "nutrients": {"energy": {"value": 32, "unit": "kcal"}, "carbohydrates": {"value": 6, "unit": "g"}, "sugars": {"value": 5, "unit": "g"}, "sodium": {"value": 690, "unit": "mg"}}},
    {"name": "Tahini", "category": "condiments", "serving_size": "1 tbsp (15g)", "serving_size_g": 15, "nutrients": {"energy": {"value": 89, "unit": "kcal"}, "protein": {"value": 2.6, "unit": "g"}, "carbohydrates": {"value": 3.2, "unit": "g"}, "fat_total": {"value": 8, "unit": "g"}, "calcium": {"value": 64, "unit": "mg"}}},
    {"name": "Honey", "category": "condiments", "serving_size": "1 tbsp (21g)", "serving_size_g": 21, "nutrients": {"energy": {"value": 64, "unit": "kcal"}, "carbohydrates": {"value": 17, "unit": "g"}, "sugars": {"value": 17, "unit": "g"}}},
    {"name": "Maple syrup", "category": "condiments", "serving_size": "1 tbsp (20g)", "serving_size_g": 20, "nutrients": {"energy": {"value": 52, "unit": "kcal"}, "carbohydrates": {"value": 13, "unit": "g"}, "sugars": {"value": 12, "unit": "g"}, "manganese": {"value": 0.5, "unit": "mg"}}},
]

async def insert_additional_foods():
    """Insert additional foods into the database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    foods_collection = db.foods
    
    print(f"\n{'='*60}")
    print(f"PhiCor Food Engine - Additional Foods Expansion")
    print(f"{'='*60}")
    print(f"Total foods to process: {len(ADDITIONAL_FOODS)}")
    
    inserted = 0
    updated = 0
    
    for food in ADDITIONAL_FOODS:
        food_id = food['name'].lower().replace(' ', '_').replace("'", "").replace('(', '').replace(')', '').replace('/', '_').replace(',', '').replace('-', '_')
        food_id = ''.join(c for c in food_id if c.isalnum() or c == '_')[:50]
        
        if 'organ_effects' not in food:
            food['organ_effects'] = calculate_organ_effects(food.get('nutrients', {}))
        
        food_doc = {
            "id": food_id,
            **food,
            "source": "PhiCor Comprehensive Database",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        try:
            existing = await foods_collection.find_one({"id": food_id})
            if existing:
                await foods_collection.update_one(
                    {"id": food_id},
                    {"$set": food_doc}
                )
                updated += 1
            else:
                await foods_collection.insert_one(food_doc)
                inserted += 1
                print(f"  ✓ {food['name'][:50]}")
        except Exception as e:
            print(f"  ✗ Error with {food['name']}: {e}")
    
    total_count = await foods_collection.count_documents({})
    
    print(f"\n{'='*60}")
    print(f"Additional Foods Expansion Complete!")
    print(f"{'='*60}")
    print(f"Inserted: {inserted}")
    print(f"Updated: {updated}")
    print(f"Total foods in database: {total_count}")
    
    client.close()
    return total_count

if __name__ == "__main__":
    asyncio.run(insert_additional_foods())
