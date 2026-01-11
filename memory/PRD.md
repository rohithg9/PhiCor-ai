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

### January 11, 2025 - PDF Export & Sharing Feature

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
- Equations Browser for expert dashboard
- Smart serving sizes with scaling

## Database Collections
- **foods**: ~9,951 foods with nutrient data
- **drugs**: 415 drugs
- **diseases**: 2,568 diseases
- **nutrients**: Nutrient definitions with parameter_effects, disease_interactions, drug_interactions

## Key Files Added/Modified
- `/app/frontend/src/utils/pdfExport.js` - PDF generation utilities for all report types
- `/app/frontend/src/components/PDFExportButton.jsx` - Reusable export button component
- `/app/frontend/src/pages/FoodAnalysisPage.js` - Added PDF export button
- `/app/frontend/src/pages/DrugsPage.js` - Added PDF export to drug details
- `/app/frontend/src/pages/DifferentialPage.js` - Added PDF export to diagnosis results
- `/app/frontend/src/pages/DashboardMultiScale.js` - Added PDF export to disease view

## Prioritized Backlog

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

## Test Credentials
- **Expert Login**: `/expert-login`
- **Email**: admin@phicor.ai
- **Password**: admin123
