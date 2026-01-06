# PhiCor.ai Testing Protocol

## Active Testing Tasks

### Task 1: Differential Diagnosis with PhiCor Analysis
- **Feature**: PhiCor Clinical Analysis
- **URL**: /differential
- **Test Steps**:
  1. Navigate to /differential
  2. Click on "Clinical Text" tab
  3. Enter clinical text: "55 y/o male with chest pain and shortness of breath x 3 days. Labs: WBC 15000, Troponin 2.5, CRP elevated, BNP 1500. Vitals: BP 140/90, HR 110, RR 22, SpO2 92% on RA, Temp 101.5F. PMH: HTN, T2DM, CAD with prior PCI. Echo: EF 35%, dilated LV, mild MR"
  4. Click "PhiCor Analysis" button
  5. Wait for analysis to complete (may take 30-60 seconds)
  6. Verify differential diagnosis results appear with probabilities
  7. Check that clinical findings are displayed

### Task 2: Parameter Drill-Down Modal
- **Feature**: Parameter Drill-Down
- **URL**: /differential
- **Test Steps** (only test if Task 1 shows parameter badges):
  1. After running PhiCor Analysis, look for clickable parameter badges in findings
  2. Click on a parameter badge (e.g., heart_rate, WBC)
  3. Verify modal opens showing diseases that affect that parameter
  4. Check for "Causes of Increase" and "Causes of Decrease" tabs

## Test Credentials
- Email: admin@phicor.ai
- Password: admin123

## Backend API Verification (already verified working)
- POST /api/clinical/interpret - ✅ Working
- GET /api/diseases-db/parameter-causes/{param} - ✅ Working (556 diseases for heart_rate)

## Incorporate User Feedback
- The PhiCor Analysis may take 30+ seconds to complete
- Differential results should show ranked diagnoses with probabilities
- Parameter badges should be clickable to open drill-down modal

## agent_communication
- agent: main
  message: "Testing differential diagnosis and parameter drill-down features"
