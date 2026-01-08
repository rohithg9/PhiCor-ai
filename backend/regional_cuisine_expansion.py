#!/usr/bin/env python3
"""
Regional Cuisine Expansion for PhiCor.ai
Adds comprehensive international and regional foods with detailed nutritional data
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import uuid

load_dotenv()

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

REGIONAL_FOODS = [
    # ========== MIDDLE EASTERN ==========
    {"name": "Falafel (4 pieces)", "category": "middle_eastern", "serving_size": "4 pieces (68g)", "serving_size_g": 68,
     "nutrients": {"energy": {"value": 333, "unit": "kcal"}, "protein": {"value": 13, "unit": "g"}, "carbohydrates": {"value": 32, "unit": "g"}, "fiber": {"value": 5, "unit": "g"}, "fat_total": {"value": 18, "unit": "g"}, "iron": {"value": 2.4, "unit": "mg"}},
     "glycemic_index": 35, "compounds": ["chickpea_protein", "cumin"]},
    
    {"name": "Shawarma, chicken", "category": "middle_eastern", "serving_size": "1 wrap (250g)", "serving_size_g": 250,
     "nutrients": {"energy": {"value": 550, "unit": "kcal"}, "protein": {"value": 35, "unit": "g"}, "carbohydrates": {"value": 42, "unit": "g"}, "fat_total": {"value": 26, "unit": "g"}, "sodium": {"value": 890, "unit": "mg"}},
     "glycemic_index": 45},
    
    {"name": "Baba Ganoush", "category": "middle_eastern", "serving_size": "1/4 cup (60g)", "serving_size_g": 60,
     "nutrients": {"energy": {"value": 72, "unit": "kcal"}, "protein": {"value": 2, "unit": "g"}, "carbohydrates": {"value": 6, "unit": "g"}, "fiber": {"value": 2, "unit": "g"}, "fat_total": {"value": 5, "unit": "g"}},
     "glycemic_index": 25},
    
    {"name": "Tabbouleh", "category": "middle_eastern", "serving_size": "1 cup (160g)", "serving_size_g": 160,
     "nutrients": {"energy": {"value": 120, "unit": "kcal"}, "protein": {"value": 3, "unit": "g"}, "carbohydrates": {"value": 14, "unit": "g"}, "fiber": {"value": 4, "unit": "g"}, "vitamin_c": {"value": 25, "unit": "mg"}, "vitamin_k": {"value": 300, "unit": "mcg"}},
     "glycemic_index": 30, "compounds": ["parsley", "bulgur"]},
    
    {"name": "Lamb Kofta", "category": "middle_eastern", "serving_size": "3 pieces (120g)", "serving_size_g": 120,
     "nutrients": {"energy": {"value": 340, "unit": "kcal"}, "protein": {"value": 22, "unit": "g"}, "fat_total": {"value": 27, "unit": "g"}, "fat_saturated": {"value": 12, "unit": "g"}, "iron": {"value": 2.8, "unit": "mg"}, "zinc": {"value": 4.5, "unit": "mg"}}},
    
    {"name": "Fattoush Salad", "category": "middle_eastern", "serving_size": "2 cups (200g)", "serving_size_g": 200,
     "nutrients": {"energy": {"value": 180, "unit": "kcal"}, "protein": {"value": 4, "unit": "g"}, "carbohydrates": {"value": 18, "unit": "g"}, "fiber": {"value": 5, "unit": "g"}, "vitamin_a": {"value": 450, "unit": "mcg"}, "vitamin_c": {"value": 35, "unit": "mg"}},
     "glycemic_index": 25},
    
    # ========== AFRICAN ==========
    {"name": "Jollof Rice", "category": "african", "serving_size": "1.5 cups (300g)", "serving_size_g": 300,
     "nutrients": {"energy": {"value": 450, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 72, "unit": "g"}, "fiber": {"value": 3, "unit": "g"}, "fat_total": {"value": 14, "unit": "g"}, "vitamin_a": {"value": 200, "unit": "mcg"}},
     "glycemic_index": 65},
    
    {"name": "Injera (Ethiopian bread)", "category": "african", "serving_size": "1 piece (120g)", "serving_size_g": 120,
     "nutrients": {"energy": {"value": 180, "unit": "kcal"}, "protein": {"value": 7, "unit": "g"}, "carbohydrates": {"value": 36, "unit": "g"}, "fiber": {"value": 5, "unit": "g"}, "iron": {"value": 4.2, "unit": "mg"}, "calcium": {"value": 50, "unit": "mg"}},
     "glycemic_index": 68, "compounds": ["teff"]},
    
    {"name": "Doro Wat (Ethiopian chicken stew)", "category": "african", "serving_size": "1 cup (240g)", "serving_size_g": 240,
     "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 32, "unit": "g"}, "carbohydrates": {"value": 12, "unit": "g"}, "fat_total": {"value": 22, "unit": "g"}, "iron": {"value": 3.5, "unit": "mg"}, "vitamin_b12": {"value": 0.8, "unit": "mcg"}}},
    
    {"name": "Moroccan Tagine, chicken", "category": "african", "serving_size": "1.5 cups (350g)", "serving_size_g": 350,
     "nutrients": {"energy": {"value": 420, "unit": "kcal"}, "protein": {"value": 38, "unit": "g"}, "carbohydrates": {"value": 28, "unit": "g"}, "fiber": {"value": 6, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "vitamin_a": {"value": 320, "unit": "mcg"}}},
    
    {"name": "Fufu with Egusi Soup", "category": "african", "serving_size": "1 serving (400g)", "serving_size_g": 400,
     "nutrients": {"energy": {"value": 520, "unit": "kcal"}, "protein": {"value": 18, "unit": "g"}, "carbohydrates": {"value": 68, "unit": "g"}, "fiber": {"value": 4, "unit": "g"}, "fat_total": {"value": 22, "unit": "g"}, "iron": {"value": 4, "unit": "mg"}}},
    
    {"name": "Bobotie (South African)", "category": "african", "serving_size": "1 cup (240g)", "serving_size_g": 240,
     "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 26, "unit": "g"}, "carbohydrates": {"value": 18, "unit": "g"}, "fat_total": {"value": 24, "unit": "g"}, "calcium": {"value": 120, "unit": "mg"}}},
    
    # ========== CARIBBEAN ==========
    {"name": "Jerk Chicken", "category": "caribbean", "serving_size": "1 thigh (150g)", "serving_size_g": 150,
     "nutrients": {"energy": {"value": 280, "unit": "kcal"}, "protein": {"value": 28, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "sodium": {"value": 520, "unit": "mg"}, "vitamin_b6": {"value": 0.5, "unit": "mg"}},
     "compounds": ["capsaicin", "allspice"]},
    
    {"name": "Rice and Peas (Jamaican)", "category": "caribbean", "serving_size": "1 cup (200g)", "serving_size_g": 200,
     "nutrients": {"energy": {"value": 290, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 48, "unit": "g"}, "fiber": {"value": 6, "unit": "g"}, "fat_total": {"value": 8, "unit": "g"}, "iron": {"value": 2.2, "unit": "mg"}},
     "glycemic_index": 55},
    
    {"name": "Plantain, fried", "category": "caribbean", "serving_size": "1 cup slices (120g)", "serving_size_g": 120,
     "nutrients": {"energy": {"value": 230, "unit": "kcal"}, "protein": {"value": 1.5, "unit": "g"}, "carbohydrates": {"value": 38, "unit": "g"}, "fiber": {"value": 3, "unit": "g"}, "fat_total": {"value": 9, "unit": "g"}, "potassium": {"value": 465, "unit": "mg"}, "vitamin_a": {"value": 112, "unit": "mcg"}},
     "glycemic_index": 65},
    
    {"name": "Ackee and Saltfish", "category": "caribbean", "serving_size": "1 cup (240g)", "serving_size_g": 240,
     "nutrients": {"energy": {"value": 320, "unit": "kcal"}, "protein": {"value": 24, "unit": "g"}, "carbohydrates": {"value": 8, "unit": "g"}, "fat_total": {"value": 22, "unit": "g"}, "sodium": {"value": 890, "unit": "mg"}, "potassium": {"value": 520, "unit": "mg"}}},
    
    {"name": "Roti (Caribbean)", "category": "caribbean", "serving_size": "1 roti (100g)", "serving_size_g": 100,
     "nutrients": {"energy": {"value": 280, "unit": "kcal"}, "protein": {"value": 6, "unit": "g"}, "carbohydrates": {"value": 48, "unit": "g"}, "fiber": {"value": 2, "unit": "g"}, "fat_total": {"value": 7, "unit": "g"}},
     "glycemic_index": 62},
    
    # ========== SOUTH AMERICAN ==========
    {"name": "Ceviche, shrimp", "category": "south_american", "serving_size": "1 cup (200g)", "serving_size_g": 200,
     "nutrients": {"energy": {"value": 150, "unit": "kcal"}, "protein": {"value": 22, "unit": "g"}, "carbohydrates": {"value": 8, "unit": "g"}, "fat_total": {"value": 3, "unit": "g"}, "vitamin_c": {"value": 45, "unit": "mg"}, "selenium": {"value": 38, "unit": "mcg"}}},
    
    {"name": "Empanadas, beef", "category": "south_american", "serving_size": "2 empanadas (160g)", "serving_size_g": 160,
     "nutrients": {"energy": {"value": 440, "unit": "kcal"}, "protein": {"value": 18, "unit": "g"}, "carbohydrates": {"value": 38, "unit": "g"}, "fat_total": {"value": 24, "unit": "g"}, "fat_saturated": {"value": 8, "unit": "g"}, "iron": {"value": 2.8, "unit": "mg"}}},
    
    {"name": "Feijoada (Brazilian black bean stew)", "category": "south_american", "serving_size": "1.5 cups (350g)", "serving_size_g": 350,
     "nutrients": {"energy": {"value": 520, "unit": "kcal"}, "protein": {"value": 32, "unit": "g"}, "carbohydrates": {"value": 38, "unit": "g"}, "fiber": {"value": 12, "unit": "g"}, "fat_total": {"value": 28, "unit": "g"}, "iron": {"value": 5.5, "unit": "mg"}}},
    
    {"name": "Arepas, cheese", "category": "south_american", "serving_size": "2 arepas (150g)", "serving_size_g": 150,
     "nutrients": {"energy": {"value": 320, "unit": "kcal"}, "protein": {"value": 10, "unit": "g"}, "carbohydrates": {"value": 36, "unit": "g"}, "fat_total": {"value": 14, "unit": "g"}, "calcium": {"value": 180, "unit": "mg"}}},
    
    {"name": "Chimichurri Steak", "category": "south_american", "serving_size": "6 oz steak with sauce (200g)", "serving_size_g": 200,
     "nutrients": {"energy": {"value": 420, "unit": "kcal"}, "protein": {"value": 42, "unit": "g"}, "fat_total": {"value": 26, "unit": "g"}, "fat_saturated": {"value": 8, "unit": "g"}, "iron": {"value": 4.2, "unit": "mg"}, "zinc": {"value": 8, "unit": "mg"}, "vitamin_b12": {"value": 3.5, "unit": "mcg"}}},
    
    {"name": "Lomo Saltado (Peruvian stir-fry)", "category": "south_american", "serving_size": "1.5 cups (300g)", "serving_size_g": 300,
     "nutrients": {"energy": {"value": 480, "unit": "kcal"}, "protein": {"value": 32, "unit": "g"}, "carbohydrates": {"value": 38, "unit": "g"}, "fat_total": {"value": 22, "unit": "g"}, "vitamin_c": {"value": 28, "unit": "mg"}, "potassium": {"value": 680, "unit": "mg"}}},
    
    # ========== SOUTHEAST ASIAN ==========
    {"name": "Pad See Ew", "category": "thai", "serving_size": "1 plate (350g)", "serving_size_g": 350,
     "nutrients": {"energy": {"value": 580, "unit": "kcal"}, "protein": {"value": 28, "unit": "g"}, "carbohydrates": {"value": 62, "unit": "g"}, "fat_total": {"value": 24, "unit": "g"}, "sodium": {"value": 1200, "unit": "mg"}}},
    
    {"name": "Massaman Curry", "category": "thai", "serving_size": "1.5 cups (350g)", "serving_size_g": 350,
     "nutrients": {"energy": {"value": 520, "unit": "kcal"}, "protein": {"value": 26, "unit": "g"}, "carbohydrates": {"value": 32, "unit": "g"}, "fat_total": {"value": 32, "unit": "g"}, "potassium": {"value": 680, "unit": "mg"}}},
    
    {"name": "Laksa (Malaysian)", "category": "malaysian", "serving_size": "1 bowl (450g)", "serving_size_g": 450,
     "nutrients": {"energy": {"value": 580, "unit": "kcal"}, "protein": {"value": 28, "unit": "g"}, "carbohydrates": {"value": 52, "unit": "g"}, "fat_total": {"value": 28, "unit": "g"}, "sodium": {"value": 1400, "unit": "mg"}}},
    
    {"name": "Nasi Goreng (Indonesian fried rice)", "category": "indonesian", "serving_size": "1.5 cups (350g)", "serving_size_g": 350,
     "nutrients": {"energy": {"value": 520, "unit": "kcal"}, "protein": {"value": 18, "unit": "g"}, "carbohydrates": {"value": 68, "unit": "g"}, "fat_total": {"value": 18, "unit": "g"}, "sodium": {"value": 980, "unit": "mg"}}},
    
    {"name": "Satay with Peanut Sauce", "category": "indonesian", "serving_size": "6 skewers (180g)", "serving_size_g": 180,
     "nutrients": {"energy": {"value": 420, "unit": "kcal"}, "protein": {"value": 32, "unit": "g"}, "carbohydrates": {"value": 12, "unit": "g"}, "fat_total": {"value": 28, "unit": "g"}, "vitamin_e": {"value": 3, "unit": "mg"}}},
    
    {"name": "Gado-Gado", "category": "indonesian", "serving_size": "1 plate (300g)", "serving_size_g": 300,
     "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 16, "unit": "g"}, "carbohydrates": {"value": 28, "unit": "g"}, "fiber": {"value": 8, "unit": "g"}, "fat_total": {"value": 24, "unit": "g"}, "vitamin_a": {"value": 380, "unit": "mcg"}}},
    
    {"name": "Banh Xeo (Vietnamese crepe)", "category": "vietnamese", "serving_size": "1 crepe (200g)", "serving_size_g": 200,
     "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 14, "unit": "g"}, "carbohydrates": {"value": 32, "unit": "g"}, "fat_total": {"value": 22, "unit": "g"}, "turmeric": {"value": 200, "unit": "mg"}}},
    
    {"name": "Bun Bo Hue", "category": "vietnamese", "serving_size": "1 bowl (500g)", "serving_size_g": 500,
     "nutrients": {"energy": {"value": 480, "unit": "kcal"}, "protein": {"value": 32, "unit": "g"}, "carbohydrates": {"value": 48, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "iron": {"value": 4.5, "unit": "mg"}}},
    
    {"name": "Char Kway Teow", "category": "malaysian", "serving_size": "1 plate (350g)", "serving_size_g": 350,
     "nutrients": {"energy": {"value": 620, "unit": "kcal"}, "protein": {"value": 22, "unit": "g"}, "carbohydrates": {"value": 58, "unit": "g"}, "fat_total": {"value": 32, "unit": "g"}, "sodium": {"value": 1350, "unit": "mg"}}},
    
    {"name": "Hainanese Chicken Rice", "category": "singaporean", "serving_size": "1 plate (400g)", "serving_size_g": 400,
     "nutrients": {"energy": {"value": 580, "unit": "kcal"}, "protein": {"value": 35, "unit": "g"}, "carbohydrates": {"value": 62, "unit": "g"}, "fat_total": {"value": 18, "unit": "g"}, "selenium": {"value": 32, "unit": "mcg"}}},
    
    # ========== EUROPEAN ==========
    {"name": "Moussaka (Greek)", "category": "greek", "serving_size": "1 serving (300g)", "serving_size_g": 300,
     "nutrients": {"energy": {"value": 420, "unit": "kcal"}, "protein": {"value": 22, "unit": "g"}, "carbohydrates": {"value": 28, "unit": "g"}, "fat_total": {"value": 26, "unit": "g"}, "calcium": {"value": 180, "unit": "mg"}}},
    
    {"name": "Spanakopita", "category": "greek", "serving_size": "1 piece (150g)", "serving_size_g": 150,
     "nutrients": {"energy": {"value": 320, "unit": "kcal"}, "protein": {"value": 12, "unit": "g"}, "carbohydrates": {"value": 24, "unit": "g"}, "fat_total": {"value": 20, "unit": "g"}, "vitamin_k": {"value": 420, "unit": "mcg"}, "calcium": {"value": 220, "unit": "mg"}}},
    
    {"name": "Souvlaki, pork", "category": "greek", "serving_size": "2 skewers (140g)", "serving_size_g": 140,
     "nutrients": {"energy": {"value": 280, "unit": "kcal"}, "protein": {"value": 28, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "iron": {"value": 1.5, "unit": "mg"}, "vitamin_b12": {"value": 0.8, "unit": "mcg"}}},
    
    {"name": "Pierogi, potato & cheese", "category": "polish", "serving_size": "6 pierogi (180g)", "serving_size_g": 180,
     "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 12, "unit": "g"}, "carbohydrates": {"value": 52, "unit": "g"}, "fat_total": {"value": 14, "unit": "g"}, "calcium": {"value": 120, "unit": "mg"}}},
    
    {"name": "Borscht", "category": "russian", "serving_size": "1.5 cups (350g)", "serving_size_g": 350,
     "nutrients": {"energy": {"value": 180, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 22, "unit": "g"}, "fiber": {"value": 5, "unit": "g"}, "fat_total": {"value": 6, "unit": "g"}, "folate": {"value": 120, "unit": "mcg"}, "vitamin_c": {"value": 18, "unit": "mg"}},
     "compounds": ["betaine", "nitrates"]},
    
    {"name": "Beef Stroganoff", "category": "russian", "serving_size": "1.5 cups (350g)", "serving_size_g": 350,
     "nutrients": {"energy": {"value": 520, "unit": "kcal"}, "protein": {"value": 32, "unit": "g"}, "carbohydrates": {"value": 28, "unit": "g"}, "fat_total": {"value": 32, "unit": "g"}, "iron": {"value": 3.8, "unit": "mg"}, "zinc": {"value": 6.5, "unit": "mg"}}},
    
    {"name": "Schnitzel, pork", "category": "german", "serving_size": "1 schnitzel (200g)", "serving_size_g": 200,
     "nutrients": {"energy": {"value": 480, "unit": "kcal"}, "protein": {"value": 38, "unit": "g"}, "carbohydrates": {"value": 22, "unit": "g"}, "fat_total": {"value": 26, "unit": "g"}, "thiamin": {"value": 0.8, "unit": "mg"}}},
    
    {"name": "Paella, seafood", "category": "spanish", "serving_size": "2 cups (400g)", "serving_size_g": 400,
     "nutrients": {"energy": {"value": 520, "unit": "kcal"}, "protein": {"value": 32, "unit": "g"}, "carbohydrates": {"value": 58, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "selenium": {"value": 65, "unit": "mcg"}, "vitamin_b12": {"value": 8.5, "unit": "mcg"}}},
    
    {"name": "Gazpacho", "category": "spanish", "serving_size": "1.5 cups (350g)", "serving_size_g": 350,
     "nutrients": {"energy": {"value": 85, "unit": "kcal"}, "protein": {"value": 2, "unit": "g"}, "carbohydrates": {"value": 12, "unit": "g"}, "fiber": {"value": 3, "unit": "g"}, "fat_total": {"value": 4, "unit": "g"}, "vitamin_c": {"value": 45, "unit": "mg"}, "lycopene": {"value": 12, "unit": "mg"}},
     "glycemic_index": 15},
    
    {"name": "Croissant, butter", "category": "french", "serving_size": "1 croissant (60g)", "serving_size_g": 60,
     "nutrients": {"energy": {"value": 272, "unit": "kcal"}, "protein": {"value": 5, "unit": "g"}, "carbohydrates": {"value": 26, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "fat_saturated": {"value": 10, "unit": "g"}, "sodium": {"value": 210, "unit": "mg"}},
     "glycemic_index": 67},
    
    {"name": "Quiche Lorraine", "category": "french", "serving_size": "1 slice (150g)", "serving_size_g": 150,
     "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 14, "unit": "g"}, "carbohydrates": {"value": 18, "unit": "g"}, "fat_total": {"value": 28, "unit": "g"}, "calcium": {"value": 150, "unit": "mg"}, "vitamin_a": {"value": 180, "unit": "mcg"}}},
    
    {"name": "Coq au Vin", "category": "french", "serving_size": "1 serving (350g)", "serving_size_g": 350,
     "nutrients": {"energy": {"value": 420, "unit": "kcal"}, "protein": {"value": 38, "unit": "g"}, "carbohydrates": {"value": 12, "unit": "g"}, "fat_total": {"value": 22, "unit": "g"}, "iron": {"value": 2.5, "unit": "mg"}, "vitamin_b6": {"value": 0.6, "unit": "mg"}}},
    
    # ========== BRANDED FAST FOOD ==========
    {"name": "Big Mac (McDonald's)", "category": "fast_food", "serving_size": "1 burger (215g)", "serving_size_g": 215,
     "nutrients": {"energy": {"value": 563, "unit": "kcal"}, "protein": {"value": 26, "unit": "g"}, "carbohydrates": {"value": 44, "unit": "g"}, "fat_total": {"value": 33, "unit": "g"}, "fat_saturated": {"value": 11, "unit": "g"}, "sodium": {"value": 1010, "unit": "mg"}, "cholesterol": {"value": 80, "unit": "mg"}}},
    
    {"name": "Whopper (Burger King)", "category": "fast_food", "serving_size": "1 burger (270g)", "serving_size_g": 270,
     "nutrients": {"energy": {"value": 657, "unit": "kcal"}, "protein": {"value": 28, "unit": "g"}, "carbohydrates": {"value": 49, "unit": "g"}, "fat_total": {"value": 40, "unit": "g"}, "fat_saturated": {"value": 12, "unit": "g"}, "sodium": {"value": 980, "unit": "mg"}}},
    
    {"name": "Chicken McNuggets (10 piece)", "category": "fast_food", "serving_size": "10 pieces (162g)", "serving_size_g": 162,
     "nutrients": {"energy": {"value": 470, "unit": "kcal"}, "protein": {"value": 22, "unit": "g"}, "carbohydrates": {"value": 30, "unit": "g"}, "fat_total": {"value": 30, "unit": "g"}, "sodium": {"value": 900, "unit": "mg"}}},
    
    {"name": "Pepperoni Pizza (Pizza Hut, 2 slices)", "category": "fast_food", "serving_size": "2 slices (200g)", "serving_size_g": 200,
     "nutrients": {"energy": {"value": 540, "unit": "kcal"}, "protein": {"value": 22, "unit": "g"}, "carbohydrates": {"value": 54, "unit": "g"}, "fat_total": {"value": 26, "unit": "g"}, "sodium": {"value": 1200, "unit": "mg"}, "calcium": {"value": 280, "unit": "mg"}}},
    
    {"name": "Subway 6\" Italian BMT", "category": "fast_food", "serving_size": "1 sub (233g)", "serving_size_g": 233,
     "nutrients": {"energy": {"value": 410, "unit": "kcal"}, "protein": {"value": 20, "unit": "g"}, "carbohydrates": {"value": 44, "unit": "g"}, "fat_total": {"value": 18, "unit": "g"}, "sodium": {"value": 1260, "unit": "mg"}}},
    
    {"name": "Chipotle Burrito Bowl, chicken", "category": "fast_food", "serving_size": "1 bowl (510g)", "serving_size_g": 510,
     "nutrients": {"energy": {"value": 665, "unit": "kcal"}, "protein": {"value": 45, "unit": "g"}, "carbohydrates": {"value": 60, "unit": "g"}, "fiber": {"value": 12, "unit": "g"}, "fat_total": {"value": 26, "unit": "g"}, "sodium": {"value": 1650, "unit": "mg"}}},
    
    {"name": "Starbucks Grande Caramel Frappuccino", "category": "beverages", "serving_size": "1 grande (473ml)", "serving_size_g": 473,
     "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 4, "unit": "g"}, "carbohydrates": {"value": 54, "unit": "g"}, "sugars": {"value": 50, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "caffeine": {"value": 90, "unit": "mg"}}},
    
    {"name": "Chick-fil-A Chicken Sandwich", "category": "fast_food", "serving_size": "1 sandwich (170g)", "serving_size_g": 170,
     "nutrients": {"energy": {"value": 440, "unit": "kcal"}, "protein": {"value": 28, "unit": "g"}, "carbohydrates": {"value": 40, "unit": "g"}, "fat_total": {"value": 19, "unit": "g"}, "sodium": {"value": 1350, "unit": "mg"}}},
    
    {"name": "Five Guys Bacon Cheeseburger", "category": "fast_food", "serving_size": "1 burger (303g)", "serving_size_g": 303,
     "nutrients": {"energy": {"value": 920, "unit": "kcal"}, "protein": {"value": 51, "unit": "g"}, "carbohydrates": {"value": 40, "unit": "g"}, "fat_total": {"value": 62, "unit": "g"}, "fat_saturated": {"value": 28, "unit": "g"}, "sodium": {"value": 1310, "unit": "mg"}}},
    
    {"name": "Taco Bell Crunchy Taco", "category": "fast_food", "serving_size": "1 taco (78g)", "serving_size_g": 78,
     "nutrients": {"energy": {"value": 170, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 13, "unit": "g"}, "fat_total": {"value": 10, "unit": "g"}, "sodium": {"value": 310, "unit": "mg"}}},
    
    # ========== HEALTHY/TRENDY FOODS ==========
    {"name": "Acai Bowl", "category": "superfoods", "serving_size": "1 bowl (300g)", "serving_size_g": 300,
     "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 6, "unit": "g"}, "carbohydrates": {"value": 58, "unit": "g"}, "fiber": {"value": 8, "unit": "g"}, "fat_total": {"value": 14, "unit": "g"}, "vitamin_c": {"value": 45, "unit": "mg"}},
     "compounds": ["anthocyanins", "omega3_ALA"]},
    
    {"name": "Smoothie Bowl, green", "category": "superfoods", "serving_size": "1 bowl (350g)", "serving_size_g": 350,
     "nutrients": {"energy": {"value": 320, "unit": "kcal"}, "protein": {"value": 8, "unit": "g"}, "carbohydrates": {"value": 52, "unit": "g"}, "fiber": {"value": 10, "unit": "g"}, "fat_total": {"value": 10, "unit": "g"}, "vitamin_k": {"value": 380, "unit": "mcg"}, "vitamin_c": {"value": 85, "unit": "mg"}}},
    
    {"name": "Poke Bowl, salmon", "category": "japanese", "serving_size": "1 bowl (400g)", "serving_size_g": 400,
     "nutrients": {"energy": {"value": 520, "unit": "kcal"}, "protein": {"value": 32, "unit": "g"}, "carbohydrates": {"value": 58, "unit": "g"}, "fat_total": {"value": 16, "unit": "g"}, "omega3_EPA": {"value": 0.8, "unit": "g"}, "omega3_DHA": {"value": 1.2, "unit": "g"}}},
    
    {"name": "Buddha Bowl", "category": "healthy_meals", "serving_size": "1 bowl (450g)", "serving_size_g": 450,
     "nutrients": {"energy": {"value": 480, "unit": "kcal"}, "protein": {"value": 18, "unit": "g"}, "carbohydrates": {"value": 62, "unit": "g"}, "fiber": {"value": 14, "unit": "g"}, "fat_total": {"value": 18, "unit": "g"}, "vitamin_a": {"value": 520, "unit": "mcg"}}},
    
    {"name": "Cauliflower Rice, seasoned", "category": "healthy_meals", "serving_size": "1 cup (150g)", "serving_size_g": 150,
     "nutrients": {"energy": {"value": 45, "unit": "kcal"}, "protein": {"value": 3, "unit": "g"}, "carbohydrates": {"value": 8, "unit": "g"}, "fiber": {"value": 3, "unit": "g"}, "fat_total": {"value": 0.5, "unit": "g"}, "vitamin_c": {"value": 72, "unit": "mg"}, "vitamin_k": {"value": 24, "unit": "mcg"}},
     "glycemic_index": 15, "compounds": ["sulforaphane"]},
    
    {"name": "Zucchini Noodles (Zoodles)", "category": "healthy_meals", "serving_size": "2 cups (226g)", "serving_size_g": 226,
     "nutrients": {"energy": {"value": 38, "unit": "kcal"}, "protein": {"value": 3, "unit": "g"}, "carbohydrates": {"value": 7, "unit": "g"}, "fiber": {"value": 2, "unit": "g"}, "fat_total": {"value": 0.4, "unit": "g"}, "potassium": {"value": 580, "unit": "mg"}, "vitamin_c": {"value": 40, "unit": "mg"}},
     "glycemic_index": 15},
    
    {"name": "Overnight Oats with Berries", "category": "breakfast", "serving_size": "1 jar (300g)", "serving_size_g": 300,
     "nutrients": {"energy": {"value": 380, "unit": "kcal"}, "protein": {"value": 14, "unit": "g"}, "carbohydrates": {"value": 58, "unit": "g"}, "fiber": {"value": 8, "unit": "g"}, "fat_total": {"value": 10, "unit": "g"}, "calcium": {"value": 200, "unit": "mg"}},
     "glycemic_index": 42, "compounds": ["beta_glucan"]},
    
    {"name": "Avocado Toast with Egg", "category": "breakfast", "serving_size": "2 slices (220g)", "serving_size_g": 220,
     "nutrients": {"energy": {"value": 420, "unit": "kcal"}, "protein": {"value": 16, "unit": "g"}, "carbohydrates": {"value": 32, "unit": "g"}, "fiber": {"value": 10, "unit": "g"}, "fat_total": {"value": 26, "unit": "g"}, "vitamin_e": {"value": 4, "unit": "mg"}, "folate": {"value": 120, "unit": "mcg"}}},
    
    {"name": "Protein Shake, whey chocolate", "category": "supplement", "serving_size": "1 shake (350ml)", "serving_size_g": 350,
     "nutrients": {"energy": {"value": 180, "unit": "kcal"}, "protein": {"value": 30, "unit": "g"}, "carbohydrates": {"value": 8, "unit": "g"}, "fat_total": {"value": 3, "unit": "g"}, "calcium": {"value": 150, "unit": "mg"}, "leucine": {"value": 2.5, "unit": "g"}}},
    
    {"name": "RXBAR, chocolate sea salt", "category": "snacks", "serving_size": "1 bar (52g)", "serving_size_g": 52,
     "nutrients": {"energy": {"value": 210, "unit": "kcal"}, "protein": {"value": 12, "unit": "g"}, "carbohydrates": {"value": 24, "unit": "g"}, "fiber": {"value": 5, "unit": "g"}, "fat_total": {"value": 9, "unit": "g"}, "sugars": {"value": 13, "unit": "g"}}},
    
    {"name": "KIND Bar, nuts & spices", "category": "snacks", "serving_size": "1 bar (40g)", "serving_size_g": 40,
     "nutrients": {"energy": {"value": 200, "unit": "kcal"}, "protein": {"value": 6, "unit": "g"}, "carbohydrates": {"value": 16, "unit": "g"}, "fiber": {"value": 7, "unit": "g"}, "fat_total": {"value": 15, "unit": "g"}, "sugars": {"value": 5, "unit": "g"}}},
]

def calculate_organ_effects(nutrients):
    """Calculate organ system effects based on nutrient composition"""
    effects = {}
    
    # Cardiovascular
    cardio = []
    sodium = nutrients.get("sodium", {}).get("value", 0)
    potassium = nutrients.get("potassium", {}).get("value", 0)
    sat_fat = nutrients.get("fat_saturated", {}).get("value", 0)
    fiber = nutrients.get("fiber", {}).get("value", 0)
    
    if sodium > 400:
        cardio.append({"parameter": "blood_pressure_systolic", "change": f"+{min(sodium/200, 5):.1f} mmHg", "direction": "increase", "mechanism": "Sodium increases blood volume", "source_nutrient": "Sodium"})
    if potassium > 200:
        cardio.append({"parameter": "blood_pressure_systolic", "change": f"-{min(potassium/300, 3):.1f} mmHg", "direction": "decrease", "mechanism": "Potassium promotes vasodilation", "source_nutrient": "Potassium"})
    if sat_fat > 5:
        cardio.append({"parameter": "ldl_cholesterol", "change": f"+{min(sat_fat*2, 15):.0f} mg/dL", "direction": "increase", "mechanism": "Saturated fat increases LDL synthesis", "source_nutrient": "Saturated Fat"})
    if fiber > 4:
        cardio.append({"parameter": "ldl_cholesterol", "change": f"-{min(fiber*1.5, 8):.0f} mg/dL", "direction": "decrease", "mechanism": "Fiber binds bile acids reducing cholesterol", "source_nutrient": "Fiber"})
    if cardio:
        effects["cardiovascular"] = {"parameters": cardio}
    
    # Glycemic
    glycemic = []
    sugars = nutrients.get("sugars", {}).get("value", 0)
    carbs = nutrients.get("carbohydrates", {}).get("value", 0)
    
    if sugars > 10:
        glycemic.append({"parameter": "blood_glucose", "change": f"+{min(sugars*2, 50):.0f} mg/dL", "direction": "increase", "mechanism": "Rapid glucose absorption", "source_nutrient": "Sugars"})
    elif carbs > 30:
        glycemic.append({"parameter": "blood_glucose", "change": f"+{min(carbs*0.5, 25):.0f} mg/dL", "direction": "increase", "mechanism": "Carbohydrate digestion raises glucose", "source_nutrient": "Carbohydrates"})
    if fiber > 5:
        glycemic.append({"parameter": "insulin_sensitivity", "change": "+5-10%", "direction": "increase", "mechanism": "Fiber improves insulin response", "source_nutrient": "Fiber"})
    if glycemic:
        effects["glycemic"] = {"parameters": glycemic}
    
    # Renal
    renal = []
    protein = nutrients.get("protein", {}).get("value", 0)
    if protein > 20:
        renal.append({"parameter": "bun", "change": f"+{min(protein*0.15, 5):.1f} mg/dL", "direction": "increase", "mechanism": "Protein metabolism generates urea", "source_nutrient": "Protein"})
    if sodium > 500:
        renal.append({"parameter": "urine_sodium", "change": "+20-40 mEq/L", "direction": "increase", "mechanism": "Excess sodium filtered by kidneys", "source_nutrient": "Sodium"})
    if renal:
        effects["renal"] = {"parameters": renal}
    
    # Hepatic
    hepatic = []
    fat_total = nutrients.get("fat_total", {}).get("value", 0)
    if fat_total > 20:
        hepatic.append({"parameter": "triglycerides", "change": f"+{min(fat_total*1.5, 30):.0f} mg/dL", "direction": "increase", "mechanism": "Dietary fat increases hepatic lipogenesis", "source_nutrient": "Total Fat"})
    if hepatic:
        effects["hepatic"] = {"parameters": hepatic}
    
    # Gastrointestinal
    gi = []
    if fiber > 3:
        gi.append({"parameter": "transit_time", "change": "-2-4 hours", "direction": "decrease", "mechanism": "Fiber increases stool bulk", "source_nutrient": "Fiber"})
        gi.append({"parameter": "microbiome_diversity", "change": "+5-10%", "direction": "increase", "mechanism": "Fiber feeds beneficial bacteria", "source_nutrient": "Fiber"})
    if gi:
        effects["gastrointestinal"] = {"parameters": gi}
    
    # Musculoskeletal
    musculo = []
    calcium = nutrients.get("calcium", {}).get("value", 0)
    if protein > 15:
        musculo.append({"parameter": "muscle_protein_synthesis", "change": "+15-25%", "direction": "increase", "mechanism": "Amino acids stimulate MPS", "source_nutrient": "Protein"})
    if calcium > 100:
        musculo.append({"parameter": "bone_mineral_density", "change": "+0.5-1%", "direction": "increase", "mechanism": "Calcium supports bone matrix", "source_nutrient": "Calcium"})
    if musculo:
        effects["musculoskeletal"] = {"parameters": musculo}
    
    # Neurological
    neuro = []
    caffeine = nutrients.get("caffeine", {}).get("value", 0)
    omega3 = nutrients.get("omega3_DHA", {}).get("value", 0) + nutrients.get("omega3_EPA", {}).get("value", 0)
    if caffeine > 50:
        neuro.append({"parameter": "alertness", "change": "+20-30%", "direction": "increase", "mechanism": "Caffeine blocks adenosine receptors", "source_nutrient": "Caffeine"})
    if omega3 > 0.5:
        neuro.append({"parameter": "cognitive_function", "change": "+5-10%", "direction": "increase", "mechanism": "Omega-3s support neuronal membrane", "source_nutrient": "Omega-3"})
    if neuro:
        effects["neurological"] = {"parameters": neuro}
    
    return effects

async def expand_regional_cuisines():
    """Add regional cuisine foods to the database"""
    
    # Get existing names
    existing = set()
    cursor = db.foods.find({}, {"_id": 0, "name": 1})
    async for doc in cursor:
        existing.add(doc["name"].lower())
    
    foods_to_insert = []
    
    for food in REGIONAL_FOODS:
        if food["name"].lower() not in existing:
            # Add calculated organ effects
            food["organ_effects"] = calculate_organ_effects(food["nutrients"])
            food["food_id"] = str(uuid.uuid4())
            food["source"] = "phicor_curated"
            foods_to_insert.append(food)
            existing.add(food["name"].lower())
    
    if foods_to_insert:
        await db.foods.insert_many(foods_to_insert)
        print(f"✅ Added {len(foods_to_insert)} regional cuisine foods")
    else:
        print("No new regional foods to add (all already exist)")
    
    return len(foods_to_insert)

async def main():
    print("=" * 60)
    print("PhiCor.ai - Regional Cuisine Expansion")
    print("=" * 60)
    
    before = await db.foods.count_documents({})
    print(f"Foods before: {before}")
    
    added = await expand_regional_cuisines()
    
    after = await db.foods.count_documents({})
    print(f"\nFoods after: {after}")
    print(f"Added: {added} new foods")
    
    # Show categories
    categories = await db.foods.distinct("category")
    print(f"\nTotal categories: {len(categories)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
