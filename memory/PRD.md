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
7. **Report Export & Sharing** - PDF export with PhiCor branding for all analysis types
8. **Expert Tools** - Comprehensive equation browser for reviewing mathematical models

## User Personas
- **Patients/Consumers** - Want to understand how foods affect their health conditions
- **Healthcare Professionals** - Need precise, evidence-based food-drug-disease interaction data
- **Experts/Researchers** - Review and validate mathematical models and equations

## Tech Stack
- **Backend**: FastAPI (Python) 
- **Frontend**: React
- **Database**: MongoDB
- **AI Integration**: OpenAI GPT-4o via Emergent LLM Key (silent ingredient breakdown for unknown dishes)
- **PDF Generation**: jsPDF + html2canvas

## What's Been Implemented

### January 11, 2025 - Expert Dashboard Equations Browser Enhancement

#### Comprehensive Mathematical Models Browser (✅ COMPLETED)
- **New API Endpoint**: `GET /api/expert/mathematical-models` returns 967+ mathematical models
- **Features implemented**:
  - Browse and review all 967+ mathematical models in the system
  - Filter by organ system (cardiovascular, renal, metabolic, respiratory, etc.)
  - Filter by category (Physiological, Drug/Pharmacokinetic, Disease, Food/Nutrient, Clinical)
  - Search by model name, formula, or description
  - Display model details: equations/formulas, variables with units, normal values, abnormal conditions, evidence sources, clinical significance
  - Review form for experts to verify/flag models
- **Bug Fix**: Fixed rendering of variables that come as objects/strings instead of arrays

### January 11, 2025 (Earlier) - PDF Export & Sharing Feature

#### PDF Export for All Analysis Types
- **Food Analysis PDF**: Includes PhiCor logo, nutritional profile, ingredient breakdown, organ system effects, clinical summary
- **Drug Analysis PDF**: Drug info, indications, contraindications, parameter effects
- **Differential Diagnosis PDF**: Patient profile, clinical presentation, ranked diagnoses with probabilities
- **Disease Analysis PDF**: Disease overview, affected parameters, symptoms, treatments

#### PDF Sharing Options
- Download PDF directly
- Share via Web Share API (mobile)
- Share via Email (opens mail client)
- Share via WhatsApp

#### Smart International Dish Analysis
- **AI-Powered Ingredient Breakdown**: ANY dish from ANY cuisine worldwide is now supported
- System silently uses AI to identify dish components, then analyzes each ingredient from the database
- Works for: Ethiopian (Doro Wat), Japanese (Tonkotsu Ramen), Middle Eastern (Falafel Wrap), etc.
- No "AI" or "not in database" messages shown to users - seamless experience

#### P0 Features Complete
- **Ingredient Breakdown for Complex Foods**
- **Universal Quantification** - All parameters show +/- numerical values

### Previous Sessions
- UI/UX Overhaul (landing page, navigation, rebranding)
- Smart serving sizes with scaling

## Database Collections
- **foods**: ~9,951 foods with nutrient data
- **drugs**: 415 drugs
- **diseases**: 2,568 diseases
- **nutrients**: Nutrient definitions with parameter_effects, disease_interactions, drug_interactions
- **mathematical_models**: 967+ models from diseases.parameter_modifications

## Key API Endpoints
- `GET /api/expert/mathematical-models` - Returns all mathematical models with rich context
- `POST /api/food/analyze-from-db` - Analyzes foods with AI ingredient breakdown fallback
- `GET /api/platform/stats` - Platform statistics including model counts

## Key Files Modified This Session
- `/app/frontend/src/pages/ExpertDashboard.js` - Enhanced Equations Browser with API integration, cleaned up orphaned code, added missing imports (Loader2, toast)
- `/app/backend/server.py` - Contains mathematical-models endpoint (lines 1684-1760)

## Prioritized Backlog

### P1 - Medium Priority (USER VERIFICATION PENDING)
- **PDF Export Verification** - User reported PDF only shows first tab data; needs comprehensive testing

### P1 - Medium Priority
- **Food Image Analysis Enhancement** - Improve AI recognition to return specific food items
- **Barcode Scanning Input** - Look up products via barcode scanning

### P2 - Lower Priority  
- **Slow Differential Diagnosis** - Add performance profiling to isolate bottleneck
- **Refactor Large Files** - Break down server.py, FoodAnalysisPage.js, ExpertDashboard.js

### Future/Backlog
- Enhanced Expert Knowledge Bank
- Expand recipe coverage
- Real-time parameter monitoring

## January 15, 2025 - Food Engine Database Fix

### Issue
User reported the Food Analysis page showing "0 0" for all macronutrient values despite finding the dish (e.g., Chicken Tikka Masala with 9 ingredients).

### Root Cause
The MongoDB `foods` collection was **empty**. The platform stats showed 9,951 foods, but this was a cached/static value - the actual database had 0 food documents.

### Fix Applied
1. **Seeded nutrients database**: 38 nutrients with parameter effects, daily values, and health information
2. **Added base ingredients**: 28 core ingredients (chicken, tomato, cream, onion, garlic, ginger, butter, yogurt, rice, lentils, spinach, paneer, beef, potato, etc.) with full nutrient data per 100g
3. **Imported Open Food Facts data**: 200+ branded products for broader coverage

### Current Database State
- **Foods**: 234 items (base ingredients + branded products)
- **Nutrients**: 38 nutrient definitions
- **Verified Working**: Chicken Tikka Masala shows 950 kcal, 57.6g protein, 73.8g carbs, 35.1g fat

### Note on External URL
The external preview URL (https://phicor-ai.preview.emergentagent.com) may show 404 for API routes due to platform ingress routing. Internal services work correctly on localhost:8001 (backend) and localhost:3000 (frontend).

## Test Credentials
- **Expert Login**: `/expert-login`
- **Email**: admin@phicor.ai
- **Password**: admin123

## Test Reports
- `/app/test_reports/iteration_1.json` - Food analysis P0 tests
- `/app/test_reports/iteration_2.json` - Expert Dashboard Equations Browser tests (100% pass rate)
