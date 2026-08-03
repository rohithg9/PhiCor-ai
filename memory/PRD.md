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

### August 3, 2026 - Phase 2: Visualization Integration (✅ COMPLETED & TESTED)

#### Neural Network Visualization - Differential Diagnosis (✅ INTEGRATED)
- **Location**: `/app/frontend/src/pages/DifferentialPage.js`
- **Features**:
  - Toggle between List view and Network view using buttons in the header
  - "Diagnostic Reasoning Map" showing patient factors connecting to diagnoses
  - Nodes: Patient (central), Lab values, Symptoms, Diagnoses
  - Connections with probability percentages (e.g., 85%, 60%, 55%)
  - 4 layout modes: Radial, Hierarchical, Tree, Force-directed
  - Click nodes to see details and related connections
- **Test Report**: `/app/test_reports/iteration_6.json` - 100% pass rate

#### Enhanced Body Map - Food Analysis (✅ INTEGRATED)
- **Location**: `/app/frontend/src/pages/FoodAnalysisPage.js`
- **Features**:
  - "Body Map" tab in the analysis scale buttons
  - Shows "[Food Name] Impact Map" with human body silhouette
  - Organs light up based on food's organ_effects data
  - Color-coded: Green (beneficial), Red (caution), Yellow (mixed)
  - Click organs to navigate to detailed parameter view
- **Test Report**: `/app/test_reports/iteration_6.json` - 100% pass rate

#### Enhanced Body Map - Drug Analysis (✅ INTEGRATED)
- **Location**: `/app/frontend/src/pages/DrugsPage.js`
- **Features**:
  - "body map" tab in Drug Info View tabs
  - Shows therapeutic effects (green) and adverse effects (red) on organs
  - Connection strength based on number of parameters affected
- **Test Report**: `/app/test_reports/iteration_6.json` - 100% pass rate

### August 3, 2026 - Drug Browser Panel & Visualization Components (Phase 1)

#### Drug Browser Sidebar (✅ COMPLETED & TESTED)
- **New API Endpoint**: `GET /api/drugs-db/browse-all` - Returns all 292 drugs categorized
- **Features**:
  - 13 drug categories with icons and counts: Other (121), Cardiovascular (50), Gastrointestinal (25), Respiratory (23), Endocrine/Metabolic (22), Psychiatric (22), Hematological (9), Antibiotics (8), Renal/Nephrology (4), Urological (3), Dermatological (2), Ophthalmic (2)
  - Category expansion to view drugs with name, class, brand names, and effect count
  - Search functionality to filter drugs by name, class, or brand
  - Click-to-select: clicking any drug loads it in the main view
  - Smooth animations with Framer Motion
- **Test Report**: `/app/test_reports/iteration_5.json` - 100% pass rate

#### Neural Network Visualization Component (✅ COMPLETED & INTEGRATED)
- **New Component**: `/app/frontend/src/components/NeuralNetworkVisualization.js`
- **Features**:
  - Mind map / neural network visualization showing connections between factors and outcomes
  - Multiple layout modes: Radial, Hierarchical, Tree, Force-directed
  - Connection strength visualization with color and thickness
  - Zoom/pan controls and fullscreen mode
  - Node type color coding (patient, symptom, lab, diagnosis, organ, drug, food, etc.)
  - Hover/click to see node details and connections
- **Status**: Integrated into Differential Diagnosis page

#### Enhanced Body Map Component (✅ COMPLETED & INTEGRATED)
- **New Component**: `/app/frontend/src/components/EnhancedBodyMap.js`
- **Features**:
  - Human body silhouette with 13 organs: Brain, Heart, Lungs, Liver, Kidneys, Pancreas, Stomach, Intestines, Thyroid, Spleen, Bone Marrow, Muscles, Eyes
  - Connection lines from source items to affected organs
  - Organ status indicators (beneficial/caution/mixed)
  - Impact percentage display on organs
  - Organ detail panel with effects and connections
  - Animated transitions with Framer Motion
- **Status**: Integrated into Food Analysis and Drug Analysis pages

### August 3, 2026 - Differential Diagnosis Probability Bug Fix

#### Probability Display Fix (✅ COMPLETED & TESTED)
- **Issue**: Differential diagnosis probability percentages showed as "NaN%" or didn't display at all on screen and in PDFs
- **Root Cause**: Internal differential results used `probabilityScore` field, but save/display functions looked for `probability` (undefined) → NaN
- **Solution Implemented**:
  - Updated `/app/frontend/src/pages/DifferentialPage.js` line 787: Added fallback chain `probabilityScore || probability || matchScore || 0`
  - Updated `/app/frontend/src/pages/CasesPage.js` lines 349, 546: Added `d.probability || d.probabilityScore || 0` fallbacks
  - Updated `/app/frontend/src/components/DifferentialDashboard.js` line 356: Cards now show `diagProb%` instead of matched/total
  - Updated `/app/frontend/src/utils/pdfExport.js` line 811: Added `probabilityScore` to fallback chain
- **Test Report**: `/app/test_reports/iteration_4.json` - 100% frontend pass rate

### January 24, 2025 - Food Engine Bug Fix & Food Browser Feature

#### Smart Ingredient Matching Fix (✅ COMPLETED)
- **Issue**: Food analysis returned "0" values for recipes like "Lasagne" because ingredients weren't being matched correctly in the database
- **Root Cause**: Simple regex search was matching complex dish names (e.g., "pasta" matched "Tomato Pasta Sauce" instead of actual pasta)
- **Solution Implemented**:
  - Created `INGREDIENT_ALIASES` map (80+ ingredient synonyms) for accurate matching
  - Implemented `smart_ingredient_search()` function with prioritized matching:
    1. Exact match on alias terms
    2. Starts-with match (filtering out complex dishes)
    3. Contains match with COMPLEX_DISH_INDICATORS filter
    4. Fallback for unmatched ingredients
  - Added `RECIPE_ALIASES` for common spelling variations (lasagne→lasagna, etc.)

#### Food Browser Sidebar (✅ COMPLETED)
- **New API Endpoint**: `GET /api/food/browse-all` - Returns all 17,709 foods categorized
- **Features**:
  - 13 food categories with icons: Meats (3637), Fruits (2677), Other (2082), Dairy (2073), Vegetables (1674), Grains (1579), Beverages (939), Seafood (921), Legumes (867), Condiments (537), Snacks (497), Dishes (205), Supplements (21)
  - Category expansion to view food items
  - Search functionality to filter foods
  - Click-to-analyze: clicking any food triggers full analysis
  - Desktop-only display (lg:flex) to maintain mobile usability
- **Verified Working**: All 6 Lasagne ingredients now correctly matched (pasta→noodles, beef→beef, tomato→tomato, ricotta→Cheese ricotta, mozzarella→Mozzarella cheese, parmesan→Parmesan cheese grated)

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
- **foods**: 17,709 foods with nutrient data (~9,749 enriched with organ_effects)
- **drugs**: 292 drugs (98.3% have 5+ parameter effects)
- **diseases**: 2,568 diseases (all enriched with parameter_modifications)
- **nutrients**: Nutrient definitions with parameter_effects, disease_interactions, drug_interactions
- **mathematical_models**: 967+ models from diseases.parameter_modifications

## Key API Endpoints
- `GET /api/food/browse-all` - Returns all foods categorized for Food Browser
- `GET /api/drugs-db/browse-all` - Returns all drugs categorized for Drug Browser
- `POST /api/food/analyze-from-db` - Analyzes foods with smart ingredient matching
- `GET /api/expert/mathematical-models` - Returns all mathematical models with rich context
- `GET /api/platform/stats` - Platform statistics including model counts

## Key Files Modified This Session
- `/app/backend/server.py` - Added /api/drugs-db/browse-all endpoint
- `/app/frontend/src/pages/DrugsPage.js` - Added Drug Browser sidebar
- `/app/frontend/src/components/NeuralNetworkVisualization.js` - NEW: Mind map component
- `/app/frontend/src/components/EnhancedBodyMap.js` - NEW: Body map with organ connections

## Prioritized Backlog

### P0 - High Priority (COMPLETED)
- ✅ **Neural Network Visualization Integration** - Integrated into Differential Diagnosis page
- ✅ **Enhanced Body Map Integration** - Integrated into Food and Drug Analysis pages

### P1 - Medium Priority
- **Patient Profile System** - Global patient context that applies modifiers to all analysis
- **Quantity Calculator** - Add serving size sliders to Food Analysis with real-time impact changes
- **Disease Analysis Body Map** - Add EnhancedBodyMap to Disease Dashboard
- **PDF Export Verification** - User reported PDF only shows first tab data
- **Food Image Analysis Enhancement** - Improve AI recognition

### P2 - Lower Priority  
- **Barcode Scanning Input** - Look up products via barcode scanning
- **Slow Differential Diagnosis** - Add performance profiling to isolate bottleneck
- **Refactor Large Files** - Break down server.py (~12,000 lines)

### Future/Backlog
- Enhanced Expert Knowledge Bank
- Real-time parameter monitoring
- Continue background food enrichment (currently at 50.4%)

## Test Credentials
- **Expert Login**: `/expert-login`
- **Email**: admin@phicor.ai
- **Password**: admin123

## Test Reports
- `/app/test_reports/iteration_1.json` - Food analysis P0 tests
- `/app/test_reports/iteration_2.json` - Expert Dashboard Equations Browser tests (100% pass rate)
- `/app/test_reports/iteration_3.json` - Food Analysis bug fix & Food Browser tests (100% pass rate)
- `/app/test_reports/iteration_4.json` - Differential diagnosis probability bug fix (100% pass rate)
- `/app/test_reports/iteration_5.json` - Drug Browser Panel tests (100% pass rate)
- `/app/test_reports/iteration_6.json` - Visualization Integration tests (100% pass rate)

## User Vision: Neural Network / Mind Map Visualization (August 3, 2026)

The user wants to visualize the **diagnostic reasoning process** like a doctor's mental model:

### Visualization Requirements
- **Multifactorial Connections**: Age, PMH, current conditions, lab values → all assessed against core engine
- **One-to-Many / Many-to-One Relationships**: Not simple comparisons but complex interconnections
- **Connection Strength**: Visual representation of how strongly each factor contributes
- **Probability Flow**: How the system arrived at the diagnosis
- **Human Body Mapping**: Show neural network connections mapped to actual organs
- **Multiple View Modes**: Radial, hierarchical, tree, flow chart - user toggleable

### Implementation Status (Phase 1 Complete)
- ✅ NeuralNetworkVisualization.js - Mind map component with 4 layout modes
- ✅ EnhancedBodyMap.js - Human body with 13 organs and connection visualization
- ⏳ Integration into analysis pages (Phase 2)
- ⏳ Backend multifactorial assessment engine (Phase 2)

## User Vision: Super Strong Engines (August 3, 2026)

The user wants to build a comprehensive, customizable health intelligence system:

### Food Engine Vision
- Display entire food database (17,709 foods) with browse/search
- Individual nutrients with impact on every organ, system, and microscopic level
- Quantity-based calculations for precise diet analysis
- Patient-specific customization based on medical factors and modifiers

### Core Engine Requirements
- All engines (Food, Drug, Differential, Disease) must be equally comprehensive
- Parameter-based analysis at organ system and microscopic levels
- Patient profile integration for personalized assessments
- All data must be visible and browsable to users

### Drug Engine Requirements  
- Complete drug database visibility (292 drugs)
- Drug-drug interactions with parameter effects
- Drug-disease interactions
- Drug-food interactions

### Differential Diagnosis Engine (✅ Probability Fix Complete)
- Input: clinical text/lab values → Output: ranked diagnoses with % probability
- Patient-specific modifiers for diagnosis probability
- Comprehensive parameter matching against disease profiles
