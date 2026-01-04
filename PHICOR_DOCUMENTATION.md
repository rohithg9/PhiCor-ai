# PhiCor.ai - The Mathematical Human Body
## Comprehensive Feature Documentation & User Guide

---

## Table of Contents
1. [Overview](#overview)
2. [Main Clinical Dashboard](#main-clinical-dashboard)
3. [Multi-Scale Parameter System](#multi-scale-parameter-system)
4. [Disease Models](#disease-models)
5. [Drug Engine](#drug-engine)
6. [Differential Diagnosis](#differential-diagnosis)
7. [Expert Curation Portal](#expert-curation-portal)
8. [Knowledge Bank](#knowledge-bank)
9. [User Management](#user-management)
10. [API Reference](#api-reference)

---

## Overview

**PhiCor.ai** is a comprehensive digital twin platform that mathematically models the human body across multiple biological scales. It provides:

- **1,977 Disease Models** with AI-enhanced parameter modifications
- **336+ Drug Profiles** with physiological effects modeling
- **18 Organ Systems** with detailed parameters
- **10 Biological Scales** (Geometry, Pressures, ECG, Cellular, etc.)
- **Expert Curation System** for medical accuracy validation
- **Knowledge Bank** for continuous AI-powered updates

### Technology Stack
- **Frontend**: React.js with Tailwind CSS & shadcn/ui
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: OpenAI GPT-4o via Emergent LLM Key

---

## Main Clinical Dashboard

### Accessing the Dashboard
URL: `https://[your-domain]/dashboard`

### Features

#### 1. Body Map Navigation
The left panel displays an interactive human body map with 18 organ systems:
- Heart, Lungs, Brain, Liver, Kidneys
- GI Tract, Pancreas, Spleen, Bone Marrow
- Thyroid, Adrenals, Skin, Eyes
- Reproductive System, Musculoskeletal
- Vascular System, Lymphatic System

**Example**: Click on "Heart" to view cardiac parameters.

#### 2. Parameter Display Grid
The main area shows parameters organized by scale:
- **Geometry**: Wall thickness, chamber dimensions
- **Pressures**: Systolic/Diastolic, PCWP, CVP
- **ECG**: PR interval, QRS duration, QTc
- **Physiology**: Ejection fraction, Cardiac output
- **Cellular**: Ion channels, Receptor density
- **Lab Tests**: Troponin, BNP, D-dimer
- **Imaging**: Echo findings, CT measurements
- **Vitals**: HR, BP, SpO2, Temperature
- **Physical**: Murmurs, JVP, Edema

#### 3. Disease Search & Application
- Search bar at top: Type disease name (e.g., "Atrial Fibrillation")
- Click to apply disease modifications
- Parameters change colors to show:
  - 🟢 Green: Normal baseline
  - 🔴 Red: Increased value
  - 🔵 Blue: Decreased value
  - ⚫ Gray: Absent/Not measurable

**Example - Atrial Fibrillation Applied**:
- PR Interval: ABSENT (no P waves)
- Heart Rate: 60-100 → 100-180 bpm (irregular)
- QTc: 420 → 480 ms (+14.3%)
- Cardiac Output: -15% from baseline

---

## Multi-Scale Parameter System

### Scale Definitions

| Scale | Description | Example Parameters |
|-------|-------------|--------------------|
| **Geometry** | Physical dimensions | LV wall thickness, LA diameter |
| **Pressures** | Hemodynamic values | LVEDP, PAP, PCWP |
| **Structure** | Tissue composition | Fibrosis %, Calcification |
| **Physiology** | Functional measures | EF, CO, GFR |
| **Cellular** | Molecular level | Ion concentrations, Receptors |
| **Lab Tests** | Blood/urine values | Troponin, BNP, Creatinine |
| **Imaging** | Radiological findings | CT/MRI/Echo measurements |
| **ECG** | Electrical activity | Intervals, Axis, Rhythms |
| **Vitals** | Clinical observations | HR, BP, RR, Temp, SpO2 |
| **Physical** | Exam findings | Murmurs, Edema, JVP |

### Parameter Cards Display
Each parameter shows:
- **Name**: e.g., "Ejection Fraction"
- **Value**: e.g., "55%"
- **Unit**: e.g., "%"
- **Normal Range**: e.g., "50-70%"
- **Source**: "Established guidelines" or "PhiCor AI Model"
- **Evidence Level**: Established / Novel / Emerging

---

## Disease Models

### Complete Disease Database
- **Total Diseases**: 1,977
- **Phase 1 Enhanced**: ~94% (AI-generated parameter modifications)
- **Phase 2 Enhanced**: ~21% (Comprehensive clinical presentations)

### Disease Categories
- Cardiovascular (283 diseases)
- Respiratory (156 diseases)
- Neurological (198 diseases)
- Gastrointestinal (167 diseases)
- Renal (89 diseases)
- Endocrine (134 diseases)
- Hematological (145 diseases)
- Oncological (287 diseases)
- Infectious (203 diseases)
- Autoimmune (156 diseases)
- And more...

### Example: Heart Failure (HFrEF)

**Parameter Modifications:**
```
Heart → Geometry:
  - LV Wall Thickness: 12mm → 14mm (+17%)
  - LA Diameter: 40mm → 52mm (+30%)

Heart → Physiology:
  - Ejection Fraction: 55% → 30% (-45%)
  - Cardiac Output: 5 L/min → 3.5 L/min (-30%)

Heart → ECG:
  - QRS Duration: 90ms → 140ms (+56%)
  - QTc: 420ms → 480ms (+14%)

Heart → Lab Tests:
  - BNP: <100 pg/mL → 850 pg/mL
  - Troponin: Normal → Mildly elevated
```

**Clinical Presentation:**
- Symptoms: Dyspnea, orthopnea, fatigue, edema
- Signs: S3 gallop, JVD, hepatomegaly, crackles
- ICD-10: I50.20

---

## Drug Engine

### Accessing Drug Panel
Click the **ρ** (rho) button in the feature navigation bar.

### Drug Database
- **Total Drugs**: 336+
- **Categories**: 12 major drug classes

### Drug Categories
1. **Cardiovascular** - ACE inhibitors, Beta-blockers, Antiarrhythmics
2. **Respiratory** - Bronchodilators, Corticosteroids
3. **CNS** - Antidepressants, Antipsychotics, Anxiolytics
4. **Endocrine** - Insulin, Thyroid medications
5. **GI** - PPIs, H2 blockers, Antiemetics
6. **Antimicrobial** - Antibiotics, Antivirals, Antifungals
7. **Immunological** - Immunosuppressants, DMARDs
8. **Oncology** - Chemotherapeutics, Targeted therapies
9. **Hematological** - Anticoagulants, Antiplatelets
10. **Analgesics** - NSAIDs, Opioids
11. **Psychiatric** - Mood stabilizers, Stimulants
12. **Supplements** - Vitamins, Electrolytes

### Example: Metoprolol

**Drug Profile:**
```
Name: Metoprolol Succinate
Class: Beta-1 Selective Blocker
Category: Cardiovascular

Parameter Effects:
- Heart Rate: -20 to -30%
- Blood Pressure: -10 to -15%
- Cardiac Output: -5 to -10%
- AV Conduction: Slowed (PR prolongation)

Indications:
- Heart Failure (HFrEF)
- Atrial Fibrillation (rate control)
- Hypertension
- Post-MI prophylaxis

Contraindications:
- Severe bradycardia (<50 bpm)
- 2nd/3rd degree AV block
- Cardiogenic shock
- Decompensated heart failure
```

---

## Differential Diagnosis

### Accessing Differential Diagnosis
Click the **Δ** (delta) button in the feature navigation bar.

### How It Works
1. Select an organ and observe abnormal parameters
2. The AI generates a ranked differential diagnosis
3. Each differential shows:
   - Disease name
   - Probability score (0-100%)
   - Key supporting findings
   - Key differentiating features

### Example: Elevated Troponin + ST Changes

**Differential Diagnosis Generated:**
```
1. Acute Coronary Syndrome (85%)
   - Supports: Troponin↑, ST changes, chest pain
   - Differentiates: Time course, risk factors

2. Myocarditis (12%)
   - Supports: Troponin↑, young patient
   - Differentiates: Viral prodrome, diffuse ST changes

3. Takotsubo Cardiomyopathy (3%)
   - Supports: ST changes, wall motion abnormality
   - Differentiates: Emotional trigger, apical ballooning
```

---

## Expert Curation Portal

### Accessing the Portal
URL: `https://[your-domain]/expert-login`

**Default Admin Credentials:**
- Email: `admin@phicor.ai`
- Password: `admin123`

### Tab Navigation

| Tab | Description |
|-----|-------------|
| **Baselines** | Review normal/standard parameters by organ |
| **Diseases** | Review disease-specific parameter modifications |
| **References** | Lab tests, guidelines, protocols (396 items) |
| **Changes** | Pending change requests for approval |
| **Guidelines** | AI-detected guideline updates |
| **Lab** | Experiment sandbox |
| **Knowledge** | Upload documents, AI analysis (Admin only) |
| **Users** | User management (Admin only) |

### Baselines Tab

**Purpose**: Review and verify standard physiological values.

**Navigation**: Organ → Scale → Parameters

**Example - Heart → ECG:**
- PR Interval: 160 ms (Range: 120-200 ms)
- QRS Duration: 90 ms (Range: 60-100 ms)
- QTc Interval: 420 ms (Range: 350-450 ms)
- Heart Rate: 72 bpm (Range: 60-100 bpm)

**Actions:**
- Click any parameter to suggest a change
- Provide: New value, source URL, reasoning
- Changes go to review queue

### Diseases Tab

**Purpose**: Review AI-generated disease modifications.

**Features:**
- 1,581 actual diseases (filtered from references)
- Search by name or ICD-10 code
- Filter by specialty, review status
- View both baseline and modified parameters

**Parameter Display:**
- 🟢 Green border: Normal baseline value
- 🟣 Purple border: Disease-modified value
- Strikethrough shows original → new value

### Changes Tab

**Purpose**: Review and approve/reject change requests.

**Workflow:**
1. Expert submits change with source
2. Admin reviews in Changes tab
3. View: current value, proposed value, reasoning, source
4. Actions: Approve (applies change) or Reject (with notes)
5. Full audit trail maintained

---

## Knowledge Bank

### Accessing Knowledge Bank
Admin only - visible in the "Knowledge" tab.

### Features

#### 1. Upload Sources
- **URL**: Paste link to medical guidelines, research papers
- **Document**: Upload PDF, DOCX, TXT files
- **Text**: Paste clinical content directly

#### 2. AI Analysis
After upload, GPT-4o analyzes content and extracts:
- Parameter changes
- Guideline updates
- Clinical modifications
- Evidence levels (Established/Novel/Emerging)
- Confidence scores (0-100%)

#### 3. Pending Suggestions
Each AI-generated suggestion shows:
- Disease name
- Target parameter
- Proposed value
- Evidence level
- Confidence %
- Actions: Approve / Reject

#### 4. Auto-Search
- **Schedule**: Configurable (7-90 days)
- **Function**: AI searches for new medical guidelines
- **Output**: Creates suggestions for admin review
- **Trigger**: Manual "AI Search" button or automatic

### Example Upload Workflow

1. Click "Add Knowledge"
2. Select type: URL / Document / Text
3. Enter title: "ESC 2024 Atrial Fibrillation Guidelines"
4. Paste URL or content
5. Optionally link to disease: "Atrial Fibrillation"
6. Click "Upload & Analyze"
7. AI extracts suggestions automatically
8. Review and approve/reject each suggestion

---

## User Management

### Accessing User Management
Admin/Super Admin only - visible in the "Users" tab.

### User Roles

| Role | Permissions |
|------|-------------|
| **Expert** | View parameters, suggest changes, run experiments |
| **Admin** | All Expert + approve changes, view audit logs |
| **Super Admin** | All Admin + manage users, delete accounts |

### Features

#### 1. User Statistics
- Total Users count
- Super Admins count
- Admins count
- Experts count

#### 2. User List
Each user shows:
- Name and email
- Role badge (color-coded)
- Specialty
- Institution
- Activity stats (changes, experiments)
- Action buttons

#### 3. User Actions
- **Edit**: Change name, email, role, specialty
- **Reset Password**: Set new password for user
- **Deactivate**: Soft-delete (can be reactivated)

### Creating a New Expert

1. Click "Add Expert"
2. Fill form:
   - Name: Dr. John Smith
   - Email: john@hospital.com
   - Password: ********
   - Role: Expert / Admin / Super Admin
   - Specialty: Cardiology
   - Institution: City Hospital
3. Click "Create Expert"

---

## API Reference

### Base URL
`https://[your-domain]/api`

### Authentication
All protected endpoints require:
```
Authorization: Bearer {token}
```

### Core Endpoints

#### Authentication
```
POST /api/experts/login
Body: {"email": "...", "password": "..."}
Returns: {"access_token": "...", "expert": {...}}
```

#### Diseases
```
GET /api/experts/diseases-to-review
Returns: List of all diseases with modifications

GET /api/disease/{disease_id}/parameters
Returns: All parameters for specific disease
```

#### Change Requests
```
POST /api/change-requests
Body: {"disease_id": "...", "field_path": "...", "old_value": "...", "new_value": "...", "reasoning": "...", "source": "..."}

POST /api/admin/change-requests/{id}/approve
POST /api/admin/change-requests/{id}/reject
```

#### Knowledge Bank
```
POST /api/admin/knowledge/upload
(Form data with source_type, title, url/content/file)

GET /api/admin/knowledge/sources
GET /api/admin/knowledge/suggestions
POST /api/admin/knowledge/suggestions/{id}/approve
POST /api/admin/knowledge/suggestions/{id}/reject
```

#### User Management
```
GET /api/admin/experts
POST /api/admin/experts
PUT /api/admin/experts/{id}
DELETE /api/admin/experts/{id}
POST /api/admin/experts/{id}/reset-password
```

---

## Data Enhancement Progress

### Phase 1: Basic AI Enhancement
- **Status**: ~94% complete (1,856/1,977)
- **Content**: Parameter modifications, clinical presentations
- **Source**: GPT-4o analysis

### Phase 2: Comprehensive Model Generation
- **Status**: ~21% complete (419/1,977)
- **Content**: Mathematical equations, detailed pathophysiology
- **Source**: GPT-4o with medical reasoning

### Background Scripts
Scripts run continuously to enhance remaining diseases:
- `enhance_all_data.py` - Phase 1
- `generate_comprehensive_models.py` - Phase 2

---

## Support & Contact

For technical support or feature requests:
- Check `/api/enhancement/status` for data progress
- Review audit logs in Admin panel
- Contact system administrator

---

**Document Version**: 1.0  
**Last Updated**: January 4, 2026  
**Platform**: PhiCor.ai - The Mathematical Human Body
