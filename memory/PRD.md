# PhiCor.ai - Product Requirements Document

## Original Problem Statement
PhiCor.ai is a unified, parameter-based health intelligence system that provides deep, quantitative analysis of how foods, drugs, and diseases affect specific body parameters. The core of the application is a "database-driven engine" that uses mathematical models and real medical data (not reliant on AI for every lookup) to deliver personalized health assessments.

## Core Product Requirements
1. **Database-Driven Engine** - Internal database as primary source of truth
2. **Deep Analysis & Quantification** - Analyze foods/drugs to show quantitative effects on body parameters
3. **Personalization** - Integrate with patient profiles for personalized assessments
4. **Multiple Input Methods** - Support text search, logs, and image uploads
5. **UI/UX Parity** - Food/Drug engines must have deep, multi-scale dashboard UI
6. **Comprehensive Knowledge Base** - Extensive data on foods, drugs, and diseases

## User Personas
- **Patients/Consumers** - Want to understand how foods affect their health conditions
- **Healthcare Professionals** - Need precise, evidence-based food-drug-disease interaction data
- **Experts/Researchers** - Review and validate mathematical models and equations

## Tech Stack
- **Backend**: FastAPI (Python) 
- **Frontend**: React
- **Database**: MongoDB
- **AI Integration**: OpenAI GPT-4o via Emergent LLM Key (for foods not in database)

## What's Been Implemented

### January 11, 2025 - P0 Features Complete
- **Ingredient Breakdown for Complex Foods**
  - Created RECIPE_DATABASE with ~25 complex dishes mapped to ingredients
  - Recipes include: Chicken Tikka Masala, Butter Chicken, Pasta Carbonara, Spaghetti Bolognese, Pad Thai, Chicken Biryani, etc.
  - `find_recipe()` function detects complex dishes
  - Recipe analysis fetches each ingredient from DB and aggregates nutrients + parameter effects
  - Frontend displays "Ingredient Breakdown" section with primary/secondary ingredients
  - Shows DB match status, spices/seasonings, and per-ingredient calorie contributions

- **Universal Quantification**
  - Created `DEFAULT_PARAMETER_EFFECTS` data structure with baseline values for ~40 parameters
  - `calculate_universal_quantified_change()` function ensures every parameter gets a numerical value
  - All parameters now show specific +/- numerical values (e.g., -0.5 mmHg, +2.1 mg/dL)
  - Eliminated all generic labels like "minimal"
  - Test suite: 20/20 tests passing

### Previous Session - UI/UX Overhaul
- Resolved all landing page stat counter bugs
- Standardized mobile navigation headers
- Rebranded from "AI" to "Mathematical" modeling
- Added Equations Browser for expert dashboard (7,892+ models)
- Smart serving sizes (e.g., "1 glass (250ml)" instead of "100g")
- Parameter effects scaled by serving size with reference ranges

## Database Collections
- **foods**: ~9,951 foods with nutrient data
- **drugs**: 415 drugs
- **diseases**: 2,568 diseases
- **nutrients**: Nutrient definitions with parameter_effects, disease_interactions, drug_interactions

## Key API Endpoints
- `POST /api/food/analyze-from-db` - Database-driven food analysis (with recipe breakdown)
- `POST /api/food/analyze-product` - AI-powered analysis for foods not in DB
- `POST /api/food/analyze-dish` - AI-powered complex dish analysis
- `GET /api/platform/stats` - Platform statistics

## Prioritized Backlog

### P1 - Medium Priority
- **Food Image Analysis Enhancement** - Improve AI recognition to return specific food items
- **Barcode Scanning Input** - Look up products via barcode scanning

### P2 - Lower Priority  
- **Slow Differential Diagnosis** - Add performance profiling to isolate bottleneck
- **Refactor Large Files** - Break down server.py, FoodAnalysisPage.js, ExpertDashboard.js

### Future/Backlog
- Enhanced Expert Knowledge Bank
- More recipe coverage (currently ~25 dishes)
- Real-time parameter monitoring integration

## Test Credentials
- **Expert Login**: `/expert-login`
- **Email**: admin@phicor.ai
- **Password**: admin123

## Files of Reference
- `/app/backend/server.py` - Main backend with RECIPE_DATABASE, quantification logic
- `/app/frontend/src/pages/FoodAnalysisPage.js` - Food analysis UI with ingredient breakdown
- `/app/frontend/src/pages/ExpertDashboard.js` - Expert dashboard with Equations Browser
- `/app/tests/test_food_analysis_p0.py` - P0 feature test suite (20 tests)
