# PhiCor.ai Data Enhancement Documentation

## Overview

PhiCor.ai uses a two-phase AI-powered data enhancement process to transform basic disease information into a comprehensive mathematical model of each disease's impact on the human body.

---

## Phase 1: Parameter Modifications
**Script:** `enhance_all_data.py`  
**Status:** ✅ 100% COMPLETE (1,977/1,977 diseases)

### Purpose
Generate **quantitative parameter changes** for each disease across multiple organ systems. This phase creates the mathematical relationships between diseases and body parameters.

### Data Collected

| Field | Description | Example |
|-------|-------------|---------|
| `parameter_modifications` | Root object containing all organ modifications | `{ heart: {...}, blood: {...} }` |
| `change_percent` | Percentage change from normal baseline | `16.7` (for 16.7% change) |
| `direction` | Direction of change | `"increase"`, `"decrease"`, `"no_change"` |
| `value` | Actual parameter value in disease state | `140` (mmHg for blood pressure) |
| `normal_min` / `normal_max` | Normal reference range | `120` / `180` |
| `unit` | Unit of measurement | `"mmHg"`, `"bpm"`, `"/uL"` |
| `evidence` | Clinical reasoning for the change | `"Reduced cardiac output"` |

### Organs/Systems Covered
- **Heart** - vital signs, ECG, chamber dimensions, valves
- **Blood** - CBC, coagulation, inflammation markers
- **Kidneys** - renal function, electrolytes, urinalysis
- **Liver** - LFTs, synthetic function
- **Lungs** - spirometry, gas exchange
- **Cellular** - DNA, metabolism, cell cycle
- **Risk Factors** - lifestyle, comorbidities
- **Functional Scores** - NYHA, Barthel, etc.

### Example: Heart Failure (HFrEF)

```json
{
  "parameter_modifications": {
    "heart": {
      "vital_signs": {
        "systolic_bp": {
          "change_percent": 16.7,
          "direction": "decrease",
          "value": 140,
          "unit": "mmHg",
          "evidence": "Reduced cardiac output"
        },
        "resting_hr": {
          "change_percent": 20,
          "direction": "increase",
          "evidence": "Compensatory tachycardia"
        }
      },
      "ecg": {
        "lvef": {
          "change_percent": 50,
          "direction": "decrease",
          "value": 30,
          "unit": "%",
          "evidence": "Defining feature of HFrEF"
        }
      }
    },
    "blood": {
      "lab_tests": {
        "nt_pro_bnp": {
          "change_percent": 700,
          "direction": "increase",
          "value": 2000,
          "unit": "pg/mL",
          "evidence": "Cardiac wall stress marker"
        }
      }
    }
  }
}
```

---

## Phase 2: Comprehensive Model
**Script:** `fast_phase2.py`  
**Status:** 🔄 99.8% COMPLETE (1,973/1,977 diseases)

### Purpose
Generate **clinical context and advanced features** including symptoms, signs, genetics, mathematical models, treatment guidelines, and disease progression.

### Data Collected

| Field | Description | Example |
|-------|-------------|---------|
| `comprehensive_model` | Root object containing all Phase 2 data | `{ clinicalPresentation: {...} }` |
| `clinicalPresentation` | Symptoms and physical signs | `{ symptoms: [...], signs: [...] }` |
| `geneticFactors` | Genetic and hereditary information | `{ genes: [...], heritability: 0.4 }` |
| `novelEquations` | Mathematical models unique to PhiCor | LaTeX equations with variables |
| `progression` | Disease stages over time | `[{ stage: 1, name: "Early" }]` |
| `diagnosticWorkup` | Recommended tests and studies | Labs, imaging, procedures |
| `treatment` | Treatment guidelines | First-line, second-line, interventional |
| `prognosis` | Outcome predictions | Survival rates, complications |

### Example: Heart Failure (HFrEF)

```json
{
  "comprehensive_model": {
    "primaryOrgan": "heart",
    "affectedOrgans": ["heart", "lungs", "kidneys", "liver"],
    
    "clinicalPresentation": {
      "symptoms": ["dyspnea", "fatigue", "exercise intolerance", "orthopnea"],
      "signs": ["elevated JVP", "S3 gallop", "peripheral edema", "cardiomegaly"]
    },
    
    "geneticFactors": {
      "genes": ["TTN", "LMNA", "MYH7"],
      "heritability": 0.4,
      "penetrance": "variable"
    },
    
    "novelEquations": [
      {
        "name": "Ejection Fraction Decline Prediction",
        "latex": "EF_{t} = EF_0 \\times e^{-kt}",
        "description": "Predicts EF decline over time",
        "variables": {"EF_0": "Initial EF", "k": "decline constant", "t": "time"}
      },
      {
        "name": "Fluid Retention Estimation",
        "latex": "V_{t} = V_0 + c \\times BNP",
        "description": "Estimates fluid volume from BNP"
      }
    ],
    
    "progression": [
      { "stage": 1, "name": "Early/Subclinical", "severity": 0.2 },
      { "stage": 2, "name": "Mild", "severity": 0.4 },
      { "stage": 3, "name": "Moderate", "severity": 0.6 },
      { "stage": 4, "name": "Severe/End-stage", "severity": 0.9 }
    ]
  }
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISEASE DATABASE                              │
│  1,977 diseases with ICD-10 codes across 46 categories          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1: Parameter Modifications              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Heart     │  │   Blood     │  │   Kidneys   │  ...         │
│  │ Parameters  │  │ Parameters  │  │ Parameters  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  Output: change_percent, direction, value, unit, evidence        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 2: Comprehensive Model                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Clinical   │  │  Genetics   │  │  Equations  │              │
│  │Presentation │  │   Factors   │  │ & Models    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Progression │  │  Treatment  │  │  Prognosis  │              │
│  │   Stages    │  │  Guidelines │  │   Outcomes  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND DISPLAY                              │
│  • Parameter cards with % changes (↑ red, ↓ blue)               │
│  • Disease Impact Summary showing affected organs               │
│  • Clinical Evidence tabs (Symptoms, Labs, Genetics, etc.)      │
│  • Mathematical equations with LaTeX rendering                   │
│  • Disease progression timeline                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Disease Categories Summary

| Category | Count | Examples |
|----------|-------|----------|
| Gastrointestinal | 277 | Crohn's Disease, GERD, Cirrhosis |
| General | 221 | Anemia, Fever, Dehydration |
| Cardiovascular | 209 | Heart Failure, MI, AFib |
| Respiratory | 180 | COPD, Asthma, Pneumonia |
| Psychiatric | 172 | Depression, Schizophrenia, Anxiety |
| Infectious | 137 | COVID-19, Tuberculosis, HIV |
| Rheumatological | 121 | RA, Lupus, Gout |
| Pediatric | 80 | RSV, Kawasaki, JIA |
| Endocrine | 71 | Diabetes, Thyroid disorders |
| Obstetric/Gynecologic | 71 | Preeclampsia, Endometriosis |

---

## Technical Implementation

### Phase 1 Script: `enhance_all_data.py`
- Uses GPT-4o via Emergent LLM Key
- Processes diseases sequentially
- Generates structured JSON for parameter modifications
- Validates output against schema

### Phase 2 Script: `fast_phase2.py`
- Uses GPT-4o via Emergent LLM Key
- **5 parallel workers** for faster processing
- Generates comprehensive clinical model
- Includes retry logic and fallback prompts
- ~5 diseases per minute throughput

### Database Schema
```javascript
{
  id: String,              // Unique identifier
  name: String,            // Disease name
  icd10_code: String,      // ICD-10 code
  category: String,        // Medical category
  description: String,     // Brief description
  affected_organs: Array,  // List of affected organs
  
  // Phase 1 Data
  parameter_modifications: {
    [organ]: {
      [scale]: {
        [parameter]: {
          change_percent: Number,
          direction: String,
          value: Number,
          unit: String,
          evidence: String
        }
      }
    }
  },
  
  // Phase 2 Data
  comprehensive_model: {
    primaryOrgan: String,
    affectedOrgans: Array,
    clinicalPresentation: Object,
    geneticFactors: Object,
    novelEquations: Array,
    progression: Array,
    diagnosticWorkup: Object,
    treatment: Object,
    prognosis: Object
  },
  
  // Additional metadata
  epidemiology: Object,
  pathophysiology: String,
  ai_enhanced: Boolean,
  enhanced_at: DateTime
}
```

---

## Color Coding in UI

| Change Direction | Color | Meaning |
|-----------------|-------|---------|
| ↑ Increase | Red (`text-red-400`) | Parameter elevated above normal |
| ↓ Decrease | Blue (`text-blue-400`) | Parameter reduced below normal |

Both directions indicate **abnormal values** - the color distinguishes the direction of deviation from normal.

---

*Last Updated: January 2026*
*Total Diseases: 1,977 | Phase 1: 100% | Phase 2: 99.8%*
