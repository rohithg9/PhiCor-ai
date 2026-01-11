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
- **AI Integration**: OpenAI GPT-4o via Emergent LLM Key (silent ingredient breakdown for unknown dishes)

## What's Been Implemented

### January 11, 2025 - Major Feature Update

#### Smart International Dish Analysis
- **AI-Powered Ingredient Breakdown**: ANY dish from ANY cuisine worldwide is now supported
- System silently uses AI to identify dish components, then analyzes each ingredient from the database
- Works for: Ethiopian (Doro Wat), Japanese (Tonkotsu Ramen), Middle Eastern (Falafel Wrap), etc.
- No "AI" or "not in database" messages shown to users - seamless experience

#### P0 Features Complete
- **Ingredient Breakdown for Complex Foods** ✅
  - Predefined RECIPE_DATABASE with ~25 common dishes
  - AI fallback for any dish not in predefined recipes
  - Shows primary/secondary ingredients with DB match status
  - Aggregated nutrients and parameter effects from all ingredients

- **Universal Quantification** ✅
  - `DEFAULT_PARAMETER_EFFECTS` with baseline values for ~40 parameters
  - ALL parameters show +/- numerical values (e.g., -0.5 mmHg, +2.1 mg/dL)
  - No more generic labels like "minimal"

- **Removed AI Mentions from UI** ✅
  - No toast messages about "AI analysis" or "not in database"
  - Clean, seamless user experience

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
- `POST /api/food/analyze-from-db` - Database-driven food analysis with smart ingredient breakdown
- `POST /api/food/analyze-product` - AI-powered analysis fallback
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
- Expand predefined recipe coverage
- Real-time parameter monitoring integration

## Test Credentials
- **Expert Login**: `/expert-login`
- **Email**: admin@phicor.ai
- **Password**: admin123

## Files of Reference
- `/app/backend/server.py` - Main backend with RECIPE_DATABASE, AI ingredient breakdown, quantification logic
- `/app/frontend/src/pages/FoodAnalysisPage.js` - Food analysis UI with ingredient breakdown
- `/app/frontend/src/pages/ExpertDashboard.js` - Expert dashboard with Equations Browser
- `/app/tests/test_food_analysis_p0.py` - P0 feature test suite (20 tests)
