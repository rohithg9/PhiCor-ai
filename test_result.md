# Test Results for PhiCor.ai

## Current Testing Round
Testing both Dashboard interactivity fix and new Drugs Database feature.

## Features to Test

### 1. Dashboard Interactivity (Fixed)
- [x] Disease search and selection
- [ ] "All Affected Parameters" panel filters correctly when clicking organ buttons
- [ ] "Show All / Show Less" toggle works without resetting state
- [ ] Clicking "All" button resets filter to show all parameters

### 2. Drugs Database (New Feature)
- [ ] Drug list loads from MongoDB API
- [ ] Search functionality works
- [ ] Category filter works (Cardiovascular, etc.)
- [ ] Drug detail view shows Overview tab correctly
- [ ] Effects tab shows therapeutic/side effects with parameter modifications
- [ ] Dosing tab shows dosage information
- [ ] Interactions tab shows drug interactions
- [ ] Back button returns to list view

## API Endpoints to Test
- GET /api/drugs-db - List drugs with filters
- GET /api/drugs-db/{drug_id} - Get drug detail
- GET /api/drugs-db/categories - Get categories

## Test Environment
- Frontend: http://localhost:3000
- Backend: Using REACT_APP_BACKEND_URL from .env
