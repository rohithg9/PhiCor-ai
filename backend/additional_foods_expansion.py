#!/usr/bin/env python3
"""
Additional Foods Expansion - More Diverse Foods for PhiCor.ai
Adds additional superfoods, health foods, dietary alternatives, and specialty items
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import uuid

load_dotenv()

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

ADDITIONAL_FOODS = [
    # ========== SUPERFOODS & HEALTH FOODS ==========
    {"name": "Spirulina powder", "category": "superfoods", "serving_size": "1 tbsp (7g)", "serving_size_g": 7,
     "nutrients": {"energy": {"value": 20, "unit": "kcal"}, "protein": {"value": 4, "unit": "g"}, "iron": {"value": 2, "unit": "mg"}, "vitamin_b12": {"value": 0, "unit": "mcg"}, "beta_carotene": {"value": 1800, "unit": "mcg"}},
     "glycemic_index": 0, "compounds": ["phycocyanin", "chlorophyll", "GLA"]},
    
    {"name": "Chlorella tablets", "category": "superfoods", "serving_size": "3g (tablets)", "serving_size_g": 3,
     "nutrients": {"energy": {"value": 12, "unit": "kcal"}, "protein": {"value": 2, "unit": "g"}, "iron": {"value": 3.6, "unit": "mg"}, "vitamin_b12": {"value": 2.4, "unit": "mcg"}},
     "glycemic_index": 0, "compounds": ["chlorophyll", "CGF"]},
    
    {"name": "Maca root powder", "category": "superfoods", "serving_size": "1 tbsp (5g)", "serving_size_g": 5,
     "nutrients": {"energy": {"value": 16, "unit": "kcal"}, "protein": {"value": 0.5, "unit": "g"}, "carbohydrates": {"value": 3.5, "unit": "g"}, "fiber": {"value": 0.4, "unit": "g"}, "iron": {"value": 0.6, "unit": "mg"}, "copper": {"value": 0.3, "unit": "mg"}},
     "glycemic_index": 50, "compounds": ["macamides", "macaenes"]},
    
    {"name": "Ashwagandha powder", "category": "superfoods", "serving_size": "1 tsp (3g)", "serving_size_g": 3,
     "nutrients": {"energy": {"value": 10, "unit": "kcal"}, "carbohydrates": {"value": 2, "unit": "g"}, "iron": {"value": 0.3, "unit": "mg"}},
     "compounds": ["withanolides", "sitoindosides"]},
    
    {"name": "Moringa leaf powder", "category": "superfoods", "serving_size": "1 tbsp (5g)", "serving_size_g": 5,
     "nutrients": {"energy": {"value": 13, "unit": "kcal"}, "protein": {"value": 1.4, "unit": "g"}, "calcium": {"value": 100, "unit": "mg"}, "iron": {"value": 1.4, "unit": "mg"}, "vitamin_a": {"value": 378, "unit": "mcg"}, "vitamin_c": {"value": 4.5, "unit": "mg"}},
     "compounds": ["isothiocyanates", "quercetin"]},
    
    {"name": "Bee pollen", "category": "superfoods", "serving_size": "1 tbsp (10g)", "serving_size_g": 10,
     "nutrients": {"energy": {"value": 25, "unit": "kcal"}, "protein": {"value": 2.5, "unit": "g"}, "carbohydrates": {"value": 4, "unit": "g"}, "vitamin_b1": {"value": 0.1, "unit": "mg"}, "vitamin_b2": {"value": 0.1, "unit": "mg"}},
     "compounds": ["flavonoids", "phenolic_acids"]},
    
    {"name": "Royal jelly", "category": "superfoods", "serving_size": "1 tsp (5g)", "serving_size_g": 5,
     "nutrients": {"energy": {"value": 7, "unit": "kcal"}, "protein": {"value": 0.6, "unit": "g"}, "fat_total": {"value": 0.2, "unit": "g"}, "vitamin_b5": {"value": 2.5, "unit": "mg"}},
     "compounds": ["10-HDA", "royalactin"]},
    
    {"name": "Baobab powder", "category": "superfoods", "serving_size": "1 tbsp (10g)", "serving_size_g": 10,
     "nutrients": {"energy": {"value": 23, "unit": "kcal"}, "carbohydrates": {"value": 5, "unit": "g"}, "fiber": {"value": 2.8, "unit": "g"}, "vitamin_c": {"value": 28, "unit": "mg"}, "potassium": {"value": 225, "unit": "mg"}, "calcium": {"value": 29, "unit": "mg"}}},
    
    {"name": "Camu camu powder", "category": "superfoods", "serving_size": "1 tsp (3g)", "serving_size_g": 3,
     "nutrients": {"energy": {"value": 8, "unit": "kcal"}, "carbohydrates": {"value": 2, "unit": "g"}, "vitamin_c": {"value": 680, "unit": "mg"}}},
    
    {"name": "Acerola cherry powder", "category": "superfoods", "serving_size": "1 tsp (3g)", "serving_size_g": 3,
     "nutrients": {"energy": {"value": 10, "unit": "kcal"}, "carbohydrates": {"value": 2.5, "unit": "g"}, "vitamin_c": {"value": 500, "unit": "mg"}}},
    
    # ========== SEEDS & SEED BUTTERS ==========
    {"name": "Hemp seeds, hulled", "category": "nuts_seeds", "serving_size": "3 tbsp (30g)", "serving_size_g": 30,
     "nutrients": {"energy": {"value": 166, "unit": "kcal"}, "protein": {"value": 10, "unit": "g"}, "fat_total": {"value": 14, "unit": "g"}, "fiber": {"value": 1.2, "unit": "g"}, "magnesium": {"value": 210, "unit": "mg"}, "zinc": {"value": 3, "unit": "mg"}},
     "glycemic_index": 0, "compounds": ["omega3_ALA", "omega6_GLA", "complete_protein"]},
    
    {"name": "Sunflower seed butter", "category": "nuts_seeds", "serving_size": "2 tbsp (32g)", "serving_size_g": 32,
     "nutrients": {"energy": {"value": 187, "unit": "kcal"}, "protein": {"value": 7, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "fiber": {"value": 2, "unit": "g"}, "vitamin_e": {"value": 8.3, "unit": "mg"}, "magnesium": {"value": 58, "unit": "mg"}}},
    
    {"name": "Tahini (sesame butter)", "category": "nuts_seeds", "serving_size": "2 tbsp (30g)", "serving_size_g": 30,
     "nutrients": {"energy": {"value": 178, "unit": "kcal"}, "protein": {"value": 5, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "fiber": {"value": 1.4, "unit": "g"}, "calcium": {"value": 128, "unit": "mg"}, "iron": {"value": 2.7, "unit": "mg"}, "copper": {"value": 0.4, "unit": "mg"}},
     "compounds": ["sesamin", "sesamolin"]},
    
    {"name": "Sacha inchi seeds", "category": "nuts_seeds", "serving_size": "1 oz (28g)", "serving_size_g": 28,
     "nutrients": {"energy": {"value": 170, "unit": "kcal"}, "protein": {"value": 9, "unit": "g"}, "fat_total": {"value": 13, "unit": "g"}, "fiber": {"value": 5, "unit": "g"}, "vitamin_e": {"value": 5, "unit": "mg"}},
     "compounds": ["omega3_ALA"]},
    
    {"name": "Black cumin seeds (Nigella)", "category": "nuts_seeds", "serving_size": "1 tsp (2g)", "serving_size_g": 2,
     "nutrients": {"energy": {"value": 8, "unit": "kcal"}, "protein": {"value": 0.4, "unit": "g"}, "fat_total": {"value": 0.6, "unit": "g"}, "fiber": {"value": 0.5, "unit": "g"}, "iron": {"value": 0.2, "unit": "mg"}},
     "compounds": ["thymoquinone"]},
    
    # ========== DAIRY ALTERNATIVES ==========
    {"name": "Oat milk, unsweetened", "category": "dairy_alternatives", "serving_size": "1 cup (240ml)", "serving_size_g": 240,
     "nutrients": {"energy": {"value": 120, "unit": "kcal"}, "protein": {"value": 3, "unit": "g"}, "carbohydrates": {"value": 16, "unit": "g"}, "fiber": {"value": 2, "unit": "g"}, "fat_total": {"value": 5, "unit": "g"}, "calcium": {"value": 350, "unit": "mg"}, "vitamin_d": {"value": 2.5, "unit": "mcg"}},
     "glycemic_index": 69, "compounds": ["beta_glucan"]},
    
    {"name": "Coconut milk (carton)", "category": "dairy_alternatives", "serving_size": "1 cup (240ml)", "serving_size_g": 240,
     "nutrients": {"energy": {"value": 45, "unit": "kcal"}, "protein": {"value": 0, "unit": "g"}, "carbohydrates": {"value": 2, "unit": "g"}, "fat_total": {"value": 4.5, "unit": "g"}, "fat_saturated": {"value": 4, "unit": "g"}, "calcium": {"value": 450, "unit": "mg"}}},
    
    {"name": "Cashew milk, unsweetened", "category": "dairy_alternatives", "serving_size": "1 cup (240ml)", "serving_size_g": 240,
     "nutrients": {"energy": {"value": 25, "unit": "kcal"}, "protein": {"value": 1, "unit": "g"}, "carbohydrates": {"value": 1, "unit": "g"}, "fat_total": {"value": 2, "unit": "g"}, "calcium": {"value": 450, "unit": "mg"}}},
    
    {"name": "Pea milk, unsweetened", "category": "dairy_alternatives", "serving_size": "1 cup (240ml)", "serving_size_g": 240,
     "nutrients": {"energy": {"value": 70, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 0, "unit": "g"}, "fat_total": {"value": 4.5, "unit": "g"}, "calcium": {"value": 440, "unit": "mg"}, "vitamin_d": {"value": 2.5, "unit": "mcg"}}},
    
    {"name": "Coconut yogurt", "category": "dairy_alternatives", "serving_size": "1 cup (240g)", "serving_size_g": 240,
     "nutrients": {"energy": {"value": 190, "unit": "kcal"}, "protein": {"value": 2, "unit": "g"}, "carbohydrates": {"value": 16, "unit": "g"}, "fat_total": {"value": 14, "unit": "g"}, "fat_saturated": {"value": 12, "unit": "g"}, "calcium": {"value": 30, "unit": "mg"}},
     "compounds": ["MCTs", "probiotics"]},
    
    {"name": "Cashew cheese, aged", "category": "dairy_alternatives", "serving_size": "1 oz (28g)", "serving_size_g": 28,
     "nutrients": {"energy": {"value": 90, "unit": "kcal"}, "protein": {"value": 3, "unit": "g"}, "carbohydrates": {"value": 5, "unit": "g"}, "fat_total": {"value": 7, "unit": "g"}, "sodium": {"value": 200, "unit": "mg"}}},
    
    # ========== PROTEIN ALTERNATIVES ==========
    {"name": "Seitan (wheat gluten)", "category": "protein", "serving_size": "3 oz (85g)", "serving_size_g": 85,
     "nutrients": {"energy": {"value": 120, "unit": "kcal"}, "protein": {"value": 21, "unit": "g"}, "carbohydrates": {"value": 4, "unit": "g"}, "fat_total": {"value": 2, "unit": "g"}, "sodium": {"value": 320, "unit": "mg"}, "iron": {"value": 2.1, "unit": "mg"}}},
    
    {"name": "Beyond Burger patty", "category": "protein", "serving_size": "1 patty (113g)", "serving_size_g": 113,
     "nutrients": {"energy": {"value": 250, "unit": "kcal"}, "protein": {"value": 20, "unit": "g"}, "carbohydrates": {"value": 3, "unit": "g"}, "fat_total": {"value": 18, "unit": "g"}, "fat_saturated": {"value": 6, "unit": "g"}, "sodium": {"value": 390, "unit": "mg"}, "iron": {"value": 4.5, "unit": "mg"}}},
    
    {"name": "Impossible Burger patty", "category": "protein", "serving_size": "1 patty (113g)", "serving_size_g": 113,
     "nutrients": {"energy": {"value": 240, "unit": "kcal"}, "protein": {"value": 19, "unit": "g"}, "carbohydrates": {"value": 9, "unit": "g"}, "fat_total": {"value": 14, "unit": "g"}, "fat_saturated": {"value": 8, "unit": "g"}, "sodium": {"value": 370, "unit": "mg"}, "iron": {"value": 4.2, "unit": "mg"}},
     "compounds": ["heme_iron"]},
    
    {"name": "Jackfruit, young/green (meat substitute)", "category": "protein", "serving_size": "1 cup (165g)", "serving_size_g": 165,
     "nutrients": {"energy": {"value": 155, "unit": "kcal"}, "protein": {"value": 2.8, "unit": "g"}, "carbohydrates": {"value": 40, "unit": "g"}, "fiber": {"value": 2.5, "unit": "g"}, "fat_total": {"value": 1, "unit": "g"}, "potassium": {"value": 448, "unit": "mg"}}},
    
    {"name": "Textured vegetable protein (TVP)", "category": "protein", "serving_size": "1/4 cup dry (24g)", "serving_size_g": 24,
     "nutrients": {"energy": {"value": 80, "unit": "kcal"}, "protein": {"value": 12, "unit": "g"}, "carbohydrates": {"value": 7, "unit": "g"}, "fiber": {"value": 4, "unit": "g"}, "fat_total": {"value": 0, "unit": "g"}, "iron": {"value": 2.5, "unit": "mg"}}},
    
    {"name": "Mycoprotein (Quorn)", "category": "protein", "serving_size": "3.5 oz (100g)", "serving_size_g": 100,
     "nutrients": {"energy": {"value": 85, "unit": "kcal"}, "protein": {"value": 11, "unit": "g"}, "carbohydrates": {"value": 3, "unit": "g"}, "fiber": {"value": 6, "unit": "g"}, "fat_total": {"value": 3, "unit": "g"}, "cholesterol": {"value": 0, "unit": "mg"}}},
    
    # ========== FERMENTED FOODS ==========
    {"name": "Kombucha", "category": "fermented", "serving_size": "8 oz (240ml)", "serving_size_g": 240,
     "nutrients": {"energy": {"value": 30, "unit": "kcal"}, "carbohydrates": {"value": 7, "unit": "g"}, "sugars": {"value": 4, "unit": "g"}},
     "compounds": ["probiotics", "organic_acids", "polyphenols"]},
    
    {"name": "Kefir, plain whole milk", "category": "fermented", "serving_size": "1 cup (240ml)", "serving_size_g": 240,
     "nutrients": {"energy": {"value": 160, "unit": "kcal"}, "protein": {"value": 9, "unit": "g"}, "carbohydrates": {"value": 12, "unit": "g"}, "fat_total": {"value": 8, "unit": "g"}, "calcium": {"value": 300, "unit": "mg"}, "vitamin_b12": {"value": 0.7, "unit": "mcg"}},
     "compounds": ["probiotics", "kefiran"]},
    
    {"name": "Sauerkraut, unpasteurized", "category": "fermented", "serving_size": "1/2 cup (71g)", "serving_size_g": 71,
     "nutrients": {"energy": {"value": 13, "unit": "kcal"}, "carbohydrates": {"value": 3, "unit": "g"}, "fiber": {"value": 2, "unit": "g"}, "sodium": {"value": 469, "unit": "mg"}, "vitamin_c": {"value": 10, "unit": "mg"}, "vitamin_k": {"value": 8, "unit": "mcg"}},
     "compounds": ["probiotics", "glucosinolates"]},
    
    {"name": "Miso paste, white", "category": "fermented", "serving_size": "1 tbsp (17g)", "serving_size_g": 17,
     "nutrients": {"energy": {"value": 33, "unit": "kcal"}, "protein": {"value": 2, "unit": "g"}, "carbohydrates": {"value": 4, "unit": "g"}, "fat_total": {"value": 1, "unit": "g"}, "sodium": {"value": 634, "unit": "mg"}, "manganese": {"value": 0.1, "unit": "mg"}},
     "compounds": ["probiotics", "isoflavones"]},
    
    {"name": "Natto", "category": "fermented", "serving_size": "3.5 oz (100g)", "serving_size_g": 100,
     "nutrients": {"energy": {"value": 212, "unit": "kcal"}, "protein": {"value": 18, "unit": "g"}, "carbohydrates": {"value": 14, "unit": "g"}, "fiber": {"value": 5, "unit": "g"}, "fat_total": {"value": 11, "unit": "g"}, "vitamin_k2": {"value": 1103, "unit": "mcg"}, "iron": {"value": 8.6, "unit": "mg"}},
     "compounds": ["nattokinase", "vitamin_k2", "probiotics"]},
    
    {"name": "Water kefir", "category": "fermented", "serving_size": "8 oz (240ml)", "serving_size_g": 240,
     "nutrients": {"energy": {"value": 20, "unit": "kcal"}, "carbohydrates": {"value": 5, "unit": "g"}, "sugars": {"value": 3, "unit": "g"}},
     "compounds": ["probiotics", "organic_acids"]},
    
    {"name": "Pickled ginger (gari)", "category": "fermented", "serving_size": "1 oz (28g)", "serving_size_g": 28,
     "nutrients": {"energy": {"value": 20, "unit": "kcal"}, "carbohydrates": {"value": 4, "unit": "g"}, "fiber": {"value": 0.5, "unit": "g"}, "sodium": {"value": 85, "unit": "mg"}},
     "compounds": ["gingerol", "probiotics"]},
    
    # ========== SPECIALTY OILS ==========
    {"name": "MCT oil", "category": "fats_oils", "serving_size": "1 tbsp (14g)", "serving_size_g": 14,
     "nutrients": {"energy": {"value": 126, "unit": "kcal"}, "fat_total": {"value": 14, "unit": "g"}, "fat_saturated": {"value": 14, "unit": "g"}},
     "compounds": ["caprylic_acid", "capric_acid"]},
    
    {"name": "Algae oil (omega-3)", "category": "fats_oils", "serving_size": "1 tsp (5ml)", "serving_size_g": 5,
     "nutrients": {"energy": {"value": 45, "unit": "kcal"}, "fat_total": {"value": 5, "unit": "g"}, "omega3_DHA": {"value": 0.5, "unit": "g"}, "omega3_EPA": {"value": 0.2, "unit": "g"}}},
    
    {"name": "Hemp seed oil", "category": "fats_oils", "serving_size": "1 tbsp (14g)", "serving_size_g": 14,
     "nutrients": {"energy": {"value": 126, "unit": "kcal"}, "fat_total": {"value": 14, "unit": "g"}, "fat_saturated": {"value": 1.4, "unit": "g"}, "omega3_ALA": {"value": 2.5, "unit": "g"}, "omega6_GLA": {"value": 0.8, "unit": "g"}}},
    
    {"name": "Black seed oil (Nigella)", "category": "fats_oils", "serving_size": "1 tsp (5ml)", "serving_size_g": 5,
     "nutrients": {"energy": {"value": 45, "unit": "kcal"}, "fat_total": {"value": 5, "unit": "g"}},
     "compounds": ["thymoquinone"]},
    
    {"name": "Perilla oil", "category": "fats_oils", "serving_size": "1 tbsp (14g)", "serving_size_g": 14,
     "nutrients": {"energy": {"value": 120, "unit": "kcal"}, "fat_total": {"value": 14, "unit": "g"}, "omega3_ALA": {"value": 8, "unit": "g"}}},
    
    # ========== SWEETENERS ==========
    {"name": "Monk fruit sweetener", "category": "sweeteners", "serving_size": "1 packet (1g)", "serving_size_g": 1,
     "nutrients": {"energy": {"value": 0, "unit": "kcal"}, "carbohydrates": {"value": 1, "unit": "g"}},
     "glycemic_index": 0, "compounds": ["mogrosides"]},
    
    {"name": "Stevia extract", "category": "sweeteners", "serving_size": "1 packet (1g)", "serving_size_g": 1,
     "nutrients": {"energy": {"value": 0, "unit": "kcal"}, "carbohydrates": {"value": 1, "unit": "g"}},
     "glycemic_index": 0, "compounds": ["steviol_glycosides"]},
    
    {"name": "Coconut sugar", "category": "sweeteners", "serving_size": "1 tsp (4g)", "serving_size_g": 4,
     "nutrients": {"energy": {"value": 15, "unit": "kcal"}, "carbohydrates": {"value": 4, "unit": "g"}, "sugars": {"value": 4, "unit": "g"}, "potassium": {"value": 10, "unit": "mg"}, "iron": {"value": 0.1, "unit": "mg"}},
     "glycemic_index": 54, "compounds": ["inulin"]},
    
    {"name": "Date syrup", "category": "sweeteners", "serving_size": "1 tbsp (21g)", "serving_size_g": 21,
     "nutrients": {"energy": {"value": 60, "unit": "kcal"}, "carbohydrates": {"value": 15, "unit": "g"}, "sugars": {"value": 13, "unit": "g"}, "fiber": {"value": 0.8, "unit": "g"}, "potassium": {"value": 90, "unit": "mg"}},
     "glycemic_index": 47},
    
    {"name": "Yacon syrup", "category": "sweeteners", "serving_size": "1 tbsp (20g)", "serving_size_g": 20,
     "nutrients": {"energy": {"value": 20, "unit": "kcal"}, "carbohydrates": {"value": 11, "unit": "g"}, "fiber": {"value": 7, "unit": "g"}, "sugars": {"value": 3, "unit": "g"}},
     "glycemic_index": 1, "compounds": ["FOS", "inulin"]},
    
    {"name": "Allulose", "category": "sweeteners", "serving_size": "1 tsp (4g)", "serving_size_g": 4,
     "nutrients": {"energy": {"value": 0.4, "unit": "kcal"}, "carbohydrates": {"value": 4, "unit": "g"}},
     "glycemic_index": 0},
    
    # ========== SPECIALTY GRAINS ==========
    {"name": "Teff flour", "category": "grains", "serving_size": "1/4 cup (30g)", "serving_size_g": 30,
     "nutrients": {"energy": {"value": 113, "unit": "kcal"}, "protein": {"value": 4, "unit": "g"}, "carbohydrates": {"value": 22, "unit": "g"}, "fiber": {"value": 3.6, "unit": "g"}, "iron": {"value": 2.3, "unit": "mg"}, "calcium": {"value": 53, "unit": "mg"}},
     "glycemic_index": 57},
    
    {"name": "Sorghum flour", "category": "grains", "serving_size": "1/4 cup (30g)", "serving_size_g": 30,
     "nutrients": {"energy": {"value": 109, "unit": "kcal"}, "protein": {"value": 3.2, "unit": "g"}, "carbohydrates": {"value": 23, "unit": "g"}, "fiber": {"value": 2, "unit": "g"}, "iron": {"value": 1.3, "unit": "mg"}, "magnesium": {"value": 48, "unit": "mg"}},
     "glycemic_index": 70},
    
    {"name": "Amaranth grain, cooked", "category": "grains", "serving_size": "1 cup (246g)", "serving_size_g": 246,
     "nutrients": {"energy": {"value": 251, "unit": "kcal"}, "protein": {"value": 9.3, "unit": "g"}, "carbohydrates": {"value": 46, "unit": "g"}, "fiber": {"value": 5, "unit": "g"}, "iron": {"value": 5.2, "unit": "mg"}, "manganese": {"value": 2.1, "unit": "mg"}, "magnesium": {"value": 160, "unit": "mg"}},
     "glycemic_index": 35, "compounds": ["complete_protein", "squalene"]},
    
    {"name": "Buckwheat groats, cooked", "category": "grains", "serving_size": "1 cup (168g)", "serving_size_g": 168,
     "nutrients": {"energy": {"value": 155, "unit": "kcal"}, "protein": {"value": 6, "unit": "g"}, "carbohydrates": {"value": 33, "unit": "g"}, "fiber": {"value": 4.5, "unit": "g"}, "manganese": {"value": 0.7, "unit": "mg"}, "magnesium": {"value": 86, "unit": "mg"}},
     "glycemic_index": 45, "compounds": ["rutin", "quercetin"]},
    
    {"name": "Freekeh, cooked", "category": "grains", "serving_size": "1 cup (252g)", "serving_size_g": 252,
     "nutrients": {"energy": {"value": 170, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 32, "unit": "g"}, "fiber": {"value": 8, "unit": "g"}, "iron": {"value": 2, "unit": "mg"}, "zinc": {"value": 2, "unit": "mg"}},
     "glycemic_index": 43},
    
    {"name": "Spelt berries, cooked", "category": "grains", "serving_size": "1 cup (194g)", "serving_size_g": 194,
     "nutrients": {"energy": {"value": 246, "unit": "kcal"}, "protein": {"value": 11, "unit": "g"}, "carbohydrates": {"value": 51, "unit": "g"}, "fiber": {"value": 8, "unit": "g"}, "niacin": {"value": 5, "unit": "mg"}, "manganese": {"value": 2.1, "unit": "mg"}},
     "glycemic_index": 54},
    
    {"name": "Kamut (Khorasan wheat), cooked", "category": "grains", "serving_size": "1 cup (172g)", "serving_size_g": 172,
     "nutrients": {"energy": {"value": 227, "unit": "kcal"}, "protein": {"value": 10, "unit": "g"}, "carbohydrates": {"value": 47, "unit": "g"}, "fiber": {"value": 7, "unit": "g"}, "selenium": {"value": 55, "unit": "mcg"}, "zinc": {"value": 3.4, "unit": "mg"}},
     "glycemic_index": 45},
    
    # ========== EXOTIC FRUITS ==========
    {"name": "Dragon fruit (pitaya)", "category": "fruits", "serving_size": "1 fruit (200g)", "serving_size_g": 200,
     "nutrients": {"energy": {"value": 102, "unit": "kcal"}, "protein": {"value": 2, "unit": "g"}, "carbohydrates": {"value": 22, "unit": "g"}, "fiber": {"value": 5, "unit": "g"}, "vitamin_c": {"value": 9, "unit": "mg"}, "magnesium": {"value": 36, "unit": "mg"}},
     "glycemic_index": 48, "compounds": ["betalains", "oligosaccharides"]},
    
    {"name": "Rambutan", "category": "fruits", "serving_size": "5 fruits (100g)", "serving_size_g": 100,
     "nutrients": {"energy": {"value": 68, "unit": "kcal"}, "protein": {"value": 0.9, "unit": "g"}, "carbohydrates": {"value": 16, "unit": "g"}, "fiber": {"value": 0.9, "unit": "g"}, "vitamin_c": {"value": 4.9, "unit": "mg"}, "iron": {"value": 0.4, "unit": "mg"}},
     "glycemic_index": 59},
    
    {"name": "Longan fruit", "category": "fruits", "serving_size": "10 fruits (100g)", "serving_size_g": 100,
     "nutrients": {"energy": {"value": 60, "unit": "kcal"}, "protein": {"value": 1.3, "unit": "g"}, "carbohydrates": {"value": 15, "unit": "g"}, "fiber": {"value": 1.1, "unit": "g"}, "vitamin_c": {"value": 84, "unit": "mg"}, "potassium": {"value": 266, "unit": "mg"}},
     "glycemic_index": 42},
    
    {"name": "Durian", "category": "fruits", "serving_size": "1/2 cup (121g)", "serving_size_g": 121,
     "nutrients": {"energy": {"value": 175, "unit": "kcal"}, "protein": {"value": 1.8, "unit": "g"}, "carbohydrates": {"value": 32, "unit": "g"}, "fiber": {"value": 4.5, "unit": "g"}, "fat_total": {"value": 6, "unit": "g"}, "vitamin_c": {"value": 23, "unit": "mg"}, "potassium": {"value": 515, "unit": "mg"}},
     "glycemic_index": 49},
    
    {"name": "Jackfruit, ripe", "category": "fruits", "serving_size": "1 cup (165g)", "serving_size_g": 165,
     "nutrients": {"energy": {"value": 155, "unit": "kcal"}, "protein": {"value": 2.8, "unit": "g"}, "carbohydrates": {"value": 40, "unit": "g"}, "fiber": {"value": 2.5, "unit": "g"}, "vitamin_c": {"value": 22, "unit": "mg"}, "potassium": {"value": 739, "unit": "mg"}},
     "glycemic_index": 50},
    
    {"name": "Soursop (graviola)", "category": "fruits", "serving_size": "1 cup (225g)", "serving_size_g": 225,
     "nutrients": {"energy": {"value": 148, "unit": "kcal"}, "protein": {"value": 2.3, "unit": "g"}, "carbohydrates": {"value": 38, "unit": "g"}, "fiber": {"value": 7.4, "unit": "g"}, "vitamin_c": {"value": 46, "unit": "mg"}, "potassium": {"value": 626, "unit": "mg"}},
     "compounds": ["annonacin", "acetogenins"]},
    
    {"name": "Persimmon, Fuyu", "category": "fruits", "serving_size": "1 fruit (168g)", "serving_size_g": 168,
     "nutrients": {"energy": {"value": 118, "unit": "kcal"}, "protein": {"value": 1, "unit": "g"}, "carbohydrates": {"value": 31, "unit": "g"}, "fiber": {"value": 6, "unit": "g"}, "vitamin_a": {"value": 136, "unit": "mcg"}, "vitamin_c": {"value": 12.6, "unit": "mg"}, "manganese": {"value": 0.6, "unit": "mg"}},
     "glycemic_index": 50, "compounds": ["tannins", "carotenoids"]},
    
    {"name": "Feijoa (pineapple guava)", "category": "fruits", "serving_size": "2 fruits (100g)", "serving_size_g": 100,
     "nutrients": {"energy": {"value": 55, "unit": "kcal"}, "protein": {"value": 1, "unit": "g"}, "carbohydrates": {"value": 13, "unit": "g"}, "fiber": {"value": 6.4, "unit": "g"}, "vitamin_c": {"value": 32.9, "unit": "mg"}, "potassium": {"value": 172, "unit": "mg"}}},
]

def calculate_organ_effects(nutrients):
    """Calculate organ system effects based on nutrient composition"""
    effects = {}
    
    # Get nutrient values
    sodium = nutrients.get("sodium", {}).get("value", 0)
    potassium = nutrients.get("potassium", {}).get("value", 0)
    sat_fat = nutrients.get("fat_saturated", {}).get("value", 0)
    fiber = nutrients.get("fiber", {}).get("value", 0)
    sugars = nutrients.get("sugars", {}).get("value", 0)
    carbs = nutrients.get("carbohydrates", {}).get("value", 0)
    protein = nutrients.get("protein", {}).get("value", 0)
    fat_total = nutrients.get("fat_total", {}).get("value", 0)
    calcium = nutrients.get("calcium", {}).get("value", 0)
    iron = nutrients.get("iron", {}).get("value", 0)
    vitamin_c = nutrients.get("vitamin_c", {}).get("value", 0)
    
    # Cardiovascular
    cardio = []
    if sodium > 200:
        cardio.append({"parameter": "blood_pressure_systolic", "change": f"+{min(sodium/200, 5):.1f} mmHg", "direction": "increase", "mechanism": "Sodium increases blood volume", "source_nutrient": "Sodium"})
    if potassium > 150:
        cardio.append({"parameter": "blood_pressure_systolic", "change": f"-{min(potassium/300, 3):.1f} mmHg", "direction": "decrease", "mechanism": "Potassium promotes vasodilation", "source_nutrient": "Potassium"})
    if sat_fat > 3:
        cardio.append({"parameter": "ldl_cholesterol", "change": f"+{min(sat_fat*2, 15):.0f} mg/dL", "direction": "increase", "mechanism": "Saturated fat increases LDL synthesis", "source_nutrient": "Saturated Fat"})
    if fiber > 3:
        cardio.append({"parameter": "ldl_cholesterol", "change": f"-{min(fiber*1.5, 8):.0f} mg/dL", "direction": "decrease", "mechanism": "Fiber binds bile acids reducing cholesterol", "source_nutrient": "Fiber"})
    if cardio:
        effects["cardiovascular"] = {"parameters": cardio}
    
    # Glycemic
    glycemic = []
    if sugars > 5:
        glycemic.append({"parameter": "blood_glucose", "change": f"+{min(sugars*3, 50):.0f} mg/dL", "direction": "increase", "mechanism": "Rapid glucose absorption", "source_nutrient": "Sugars"})
    elif carbs > 15:
        glycemic.append({"parameter": "blood_glucose", "change": f"+{min(carbs*0.5, 25):.0f} mg/dL", "direction": "increase", "mechanism": "Carbohydrate digestion raises glucose", "source_nutrient": "Carbohydrates"})
    if fiber > 3:
        glycemic.append({"parameter": "insulin_sensitivity", "change": "+5-10%", "direction": "increase", "mechanism": "Fiber improves insulin response", "source_nutrient": "Fiber"})
    if glycemic:
        effects["glycemic"] = {"parameters": glycemic}
    
    # Renal
    renal = []
    if protein > 10:
        renal.append({"parameter": "bun", "change": f"+{min(protein*0.15, 5):.1f} mg/dL", "direction": "increase", "mechanism": "Protein metabolism generates urea", "source_nutrient": "Protein"})
    if potassium > 300:
        renal.append({"parameter": "serum_potassium", "change": f"+{min(potassium/500, 0.5):.2f} mEq/L", "direction": "increase", "mechanism": "High potassium intake", "source_nutrient": "Potassium"})
    if renal:
        effects["renal"] = {"parameters": renal}
    
    # Hepatic
    hepatic = []
    if fat_total > 10:
        hepatic.append({"parameter": "triglycerides", "change": f"+{min(fat_total*1.5, 30):.0f} mg/dL", "direction": "increase", "mechanism": "Dietary fat increases hepatic lipogenesis", "source_nutrient": "Total Fat"})
    if hepatic:
        effects["hepatic"] = {"parameters": hepatic}
    
    # Gastrointestinal
    gi = []
    if fiber > 2:
        gi.append({"parameter": "transit_time", "change": "-1-3 hours", "direction": "decrease", "mechanism": "Fiber increases stool bulk", "source_nutrient": "Fiber"})
        gi.append({"parameter": "microbiome_diversity", "change": "+5-10%", "direction": "increase", "mechanism": "Fiber feeds beneficial bacteria", "source_nutrient": "Fiber"})
    if gi:
        effects["gastrointestinal"] = {"parameters": gi}
    
    # Musculoskeletal
    musculo = []
    if protein > 8:
        musculo.append({"parameter": "muscle_protein_synthesis", "change": "+10-20%", "direction": "increase", "mechanism": "Amino acids stimulate MPS", "source_nutrient": "Protein"})
    if calcium > 50:
        musculo.append({"parameter": "bone_mineral_density", "change": "+0.3-0.8%", "direction": "increase", "mechanism": "Calcium supports bone matrix", "source_nutrient": "Calcium"})
    if musculo:
        effects["musculoskeletal"] = {"parameters": musculo}
    
    # Immune
    immune = []
    if vitamin_c > 10:
        immune.append({"parameter": "immune_function", "change": "+5-15%", "direction": "increase", "mechanism": "Vitamin C supports immune cell function", "source_nutrient": "Vitamin C"})
    if iron > 1:
        immune.append({"parameter": "oxygen_transport", "change": "+3-8%", "direction": "increase", "mechanism": "Iron supports hemoglobin synthesis", "source_nutrient": "Iron"})
    if immune:
        effects["immune"] = {"parameters": immune}
    
    return effects

async def expand_additional_foods():
    """Add additional specialty foods to the database"""
    
    # Get existing names
    existing = set()
    cursor = db.foods.find({}, {"_id": 0, "name": 1})
    async for doc in cursor:
        existing.add(doc["name"].lower())
    
    inserted = 0
    
    for food in ADDITIONAL_FOODS:
        if food["name"].lower() not in existing:
            # Add calculated organ effects
            food["organ_effects"] = calculate_organ_effects(food["nutrients"])
            food["id"] = str(uuid.uuid4())
            food["food_id"] = str(uuid.uuid4())
            food["source"] = "phicor_curated"
            
            try:
                await db.foods.insert_one(food)
                inserted += 1
                existing.add(food["name"].lower())
            except Exception as e:
                print(f"  Skipped: {food['name']} - {e}")
    
    print(f"✅ Added {inserted} additional specialty foods")
    return inserted

async def main():
    print("=" * 60)
    print("PhiCor.ai - Additional Foods Expansion")
    print("=" * 60)
    
    before = await db.foods.count_documents({})
    print(f"Foods before: {before}")
    
    added = await expand_additional_foods()
    
    after = await db.foods.count_documents({})
    print(f"\nFoods after: {after}")
    print(f"Added: {added} new foods")
    
    # Show categories
    categories = await db.foods.distinct("category")
    print(f"\nTotal categories: {len(categories)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
