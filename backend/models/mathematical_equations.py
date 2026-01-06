"""
PhiCor Mathematical Equations Library
======================================
Comprehensive collection of medical equations, formulas, and scoring systems.
Each equation includes:
- Mathematical formula (text and LaTeX)
- Variable definitions with units
- Normal ranges and clinical thresholds
- Interpretation guidelines
- Clinical applications and limitations
"""

from typing import Dict, List, Optional
from datetime import datetime, timezone

# ============================================================================
# CARDIOVASCULAR EQUATIONS
# ============================================================================

CARDIOVASCULAR_EQUATIONS = [
    {
        "id": "cardiac_output_fick",
        "name": "Cardiac Output (Fick Equation)",
        "category": "physiologic",
        "subcategory": "hemodynamics",
        "equation": "CO = VO₂ / (CaO₂ - CvO₂)",
        "equation_latex": r"CO = \frac{VO_2}{C_aO_2 - C_vO_2}",
        "variables": {
            "CO": {"description": "Cardiac Output", "unit": "L/min", "normal_range": "4-8"},
            "VO₂": {"description": "Oxygen consumption", "unit": "mL/min", "normal_range": "200-250"},
            "CaO₂": {"description": "Arterial oxygen content", "unit": "mL O₂/dL blood", "normal_range": "18-20"},
            "CvO₂": {"description": "Mixed venous oxygen content", "unit": "mL O₂/dL blood", "normal_range": "13-15"}
        },
        "derived_equations": [
            {"name": "Oxygen Content", "equation": "CaO₂ = (Hb × 1.34 × SaO₂) + (0.003 × PaO₂)"}
        ],
        "interpretation": "Measures the volume of blood pumped by the heart per minute. Gold standard for cardiac output measurement.",
        "clinical_thresholds": {
            "<2.5 L/min": "Cardiogenic shock",
            "2.5-4.0 L/min": "Low cardiac output",
            "4-8 L/min": "Normal",
            ">8 L/min": "High output state (sepsis, thyrotoxicosis, anemia)"
        },
        "when_to_use": "Hemodynamic assessment in ICU, cardiac catheterization, evaluation of heart failure",
        "limitations": ["Requires invasive measurements", "Assumes steady-state oxygen consumption", "Affected by shunting"],
        "evidence": "Developed by Adolf Fick in 1870. Remains gold standard for CO measurement.",
        "related_diseases": ["heart_failure", "cardiogenic_shock", "sepsis"]
    },
    {
        "id": "mean_arterial_pressure",
        "name": "Mean Arterial Pressure (MAP)",
        "category": "physiologic",
        "subcategory": "hemodynamics",
        "equation": "MAP = DBP + ⅓(SBP - DBP)",
        "equation_latex": r"MAP = DBP + \frac{1}{3}(SBP - DBP)",
        "alternate_equation": "MAP = (SBP + 2×DBP) / 3",
        "variables": {
            "MAP": {"description": "Mean Arterial Pressure", "unit": "mmHg", "normal_range": "70-105"},
            "SBP": {"description": "Systolic Blood Pressure", "unit": "mmHg", "normal_range": "90-120"},
            "DBP": {"description": "Diastolic Blood Pressure", "unit": "mmHg", "normal_range": "60-80"}
        },
        "interpretation": "Average arterial pressure during a single cardiac cycle. Represents perfusion pressure to organs.",
        "clinical_thresholds": {
            "<60 mmHg": "Severe hypotension - organ damage likely",
            "<65 mmHg": "Inadequate organ perfusion",
            "65-70 mmHg": "Target in septic shock (Surviving Sepsis)",
            "70-105 mmHg": "Normal range",
            ">105 mmHg": "Hypertension",
            ">130 mmHg": "Hypertensive emergency in stroke"
        },
        "when_to_use": "Continuous hemodynamic monitoring, shock assessment, organ perfusion evaluation",
        "limitations": ["Assumes normal arterial waveform", "Less accurate with arrhythmias"],
        "related_diseases": ["hypertension", "shock", "sepsis"]
    },
    {
        "id": "ejection_fraction",
        "name": "Left Ventricular Ejection Fraction",
        "category": "diagnostic",
        "subcategory": "cardiac_function",
        "equation": "EF = (EDV - ESV) / EDV × 100%",
        "equation_latex": r"EF = \frac{EDV - ESV}{EDV} \times 100\%",
        "variables": {
            "EF": {"description": "Ejection Fraction", "unit": "%", "normal_range": "55-70"},
            "EDV": {"description": "End-Diastolic Volume", "unit": "mL", "normal_range": "95-145"},
            "ESV": {"description": "End-Systolic Volume", "unit": "mL", "normal_range": "35-75"}
        },
        "interpretation": "Percentage of blood ejected from the left ventricle with each contraction.",
        "clinical_thresholds": {
            "≥55%": "Normal (HFpEF if symptomatic)",
            "41-54%": "Mildly reduced (HFmrEF)",
            "≤40%": "Reduced (HFrEF)",
            "≤35%": "Severely reduced - ICD consideration",
            "≤20%": "End-stage heart failure"
        },
        "when_to_use": "Heart failure classification, ICD eligibility, post-MI assessment, cardiomyopathy evaluation",
        "measurement_methods": ["Echocardiography (Simpson's biplane)", "Cardiac MRI", "Nuclear ventriculography", "Cardiac CT"],
        "limitations": ["Affected by loading conditions", "May be preserved despite severe diastolic dysfunction"],
        "related_diseases": ["heart_failure_hfref", "heart_failure_hfpef", "cardiomyopathy", "myocardial_infarction"]
    },
    {
        "id": "cardiac_index",
        "name": "Cardiac Index",
        "category": "physiologic",
        "subcategory": "hemodynamics",
        "equation": "CI = CO / BSA",
        "equation_latex": r"CI = \frac{CO}{BSA}",
        "variables": {
            "CI": {"description": "Cardiac Index", "unit": "L/min/m²", "normal_range": "2.5-4.0"},
            "CO": {"description": "Cardiac Output", "unit": "L/min", "normal_range": "4-8"},
            "BSA": {"description": "Body Surface Area", "unit": "m²", "normal_range": "1.7-2.0"}
        },
        "interpretation": "Cardiac output normalized to body size. Better for comparing patients of different sizes.",
        "clinical_thresholds": {
            "<1.8 L/min/m²": "Cardiogenic shock",
            "1.8-2.2 L/min/m²": "Low cardiac index",
            "2.5-4.0 L/min/m²": "Normal",
            ">4.0 L/min/m²": "Hyperdynamic state"
        },
        "when_to_use": "ICU hemodynamic management, comparing cardiac function across patients",
        "related_diseases": ["cardiogenic_shock", "heart_failure", "sepsis"]
    },
    {
        "id": "systemic_vascular_resistance",
        "name": "Systemic Vascular Resistance",
        "category": "physiologic",
        "subcategory": "hemodynamics",
        "equation": "SVR = (MAP - CVP) × 80 / CO",
        "equation_latex": r"SVR = \frac{(MAP - CVP) \times 80}{CO}",
        "variables": {
            "SVR": {"description": "Systemic Vascular Resistance", "unit": "dynes·sec/cm⁵", "normal_range": "800-1200"},
            "MAP": {"description": "Mean Arterial Pressure", "unit": "mmHg"},
            "CVP": {"description": "Central Venous Pressure", "unit": "mmHg", "normal_range": "2-8"},
            "CO": {"description": "Cardiac Output", "unit": "L/min"}
        },
        "interpretation": "Resistance to blood flow in systemic circulation. Reflects arteriolar tone.",
        "clinical_thresholds": {
            "<800": "Low SVR (sepsis, anaphylaxis, liver failure)",
            "800-1200": "Normal",
            ">1200": "High SVR (cardiogenic shock, hypovolemia, hypothermia)"
        },
        "when_to_use": "Differentiating shock types, guiding vasopressor/vasodilator therapy",
        "related_diseases": ["septic_shock", "cardiogenic_shock", "hypovolemic_shock"]
    },
    {
        "id": "chadsvasc",
        "name": "CHA₂DS₂-VASc Score",
        "category": "prognostic",
        "subcategory": "stroke_risk",
        "equation": "Score = C + H + A₂ + D + S₂ + V + A + Sc",
        "components": [
            {"variable": "C", "condition": "Congestive heart failure", "points": 1},
            {"variable": "H", "condition": "Hypertension", "points": 1},
            {"variable": "A₂", "condition": "Age ≥75 years", "points": 2},
            {"variable": "D", "condition": "Diabetes mellitus", "points": 1},
            {"variable": "S₂", "condition": "Stroke/TIA/thromboembolism history", "points": 2},
            {"variable": "V", "condition": "Vascular disease (MI, PAD, aortic plaque)", "points": 1},
            {"variable": "A", "condition": "Age 65-74 years", "points": 1},
            {"variable": "Sc", "condition": "Sex category (female)", "points": 1}
        ],
        "score_range": "0-9",
        "interpretation": "Estimates annual stroke risk in atrial fibrillation patients.",
        "clinical_thresholds": {
            "0 (male)": "0.2% annual stroke risk - no anticoagulation",
            "1 (male) or 0-1 (female)": "0.6-1.3% risk - consider anticoagulation",
            "2": "2.2% risk - anticoagulation recommended",
            "3": "3.2% risk - anticoagulation recommended",
            "4": "4.0% risk - anticoagulation recommended",
            "5": "6.7% risk - anticoagulation strongly recommended",
            "≥6": "≥9.8% risk - anticoagulation strongly recommended"
        },
        "guideline_recommendations": {
            "ESC 2020": "Anticoagulation for score ≥2 (men) or ≥3 (women)",
            "AHA/ACC 2019": "Anticoagulation for score ≥2"
        },
        "when_to_use": "All patients with non-valvular atrial fibrillation",
        "evidence": "Validated in multiple cohorts. C-statistic 0.606",
        "related_diseases": ["atrial_fibrillation", "stroke", "tia"]
    },
    {
        "id": "hasbled",
        "name": "HAS-BLED Score",
        "category": "prognostic",
        "subcategory": "bleeding_risk",
        "equation": "Score = H + A + S + B + L + E + D",
        "components": [
            {"variable": "H", "condition": "Hypertension (SBP >160)", "points": 1},
            {"variable": "A", "condition": "Abnormal renal/liver function (1 each)", "points": "1-2"},
            {"variable": "S", "condition": "Stroke history", "points": 1},
            {"variable": "B", "condition": "Bleeding history or predisposition", "points": 1},
            {"variable": "L", "condition": "Labile INR (TTR <60%)", "points": 1},
            {"variable": "E", "condition": "Elderly (age >65)", "points": 1},
            {"variable": "D", "condition": "Drugs (antiplatelet/NSAIDs) or alcohol (1 each)", "points": "1-2"}
        ],
        "score_range": "0-9",
        "interpretation": "Estimates annual major bleeding risk in anticoagulated patients.",
        "clinical_thresholds": {
            "0-1": "Low risk (1.0-1.9% annual major bleed)",
            "2": "Moderate risk (2.5%)",
            "≥3": "High risk (≥3.7%) - caution with anticoagulation"
        },
        "when_to_use": "Evaluating bleeding risk before starting anticoagulation",
        "note": "High HAS-BLED score is NOT a contraindication to anticoagulation - identifies modifiable risk factors",
        "related_diseases": ["atrial_fibrillation", "venous_thromboembolism"]
    },
    {
        "id": "heart_score",
        "name": "HEART Score",
        "category": "diagnostic",
        "subcategory": "chest_pain",
        "equation": "Score = H + E + A + R + T",
        "components": [
            {"variable": "H", "condition": "History", "0": "Slightly suspicious", "1": "Moderately suspicious", "2": "Highly suspicious"},
            {"variable": "E", "condition": "ECG", "0": "Normal", "1": "Non-specific changes", "2": "Significant ST deviation"},
            {"variable": "A", "condition": "Age", "0": "<45", "1": "45-64", "2": "≥65"},
            {"variable": "R", "condition": "Risk factors", "0": "None", "1": "1-2 factors", "2": "≥3 factors or known CAD"},
            {"variable": "T", "condition": "Troponin", "0": "Normal", "1": "1-3× ULN", "2": ">3× ULN"}
        ],
        "score_range": "0-10",
        "interpretation": "Risk stratification for acute coronary syndrome in chest pain patients.",
        "clinical_thresholds": {
            "0-3": "Low risk (0.9-1.7% MACE) - consider discharge",
            "4-6": "Intermediate risk (12-16.6% MACE) - observation/testing",
            "7-10": "High risk (50-65% MACE) - admit for intervention"
        },
        "evidence": "Validated in multiple studies. Good for rule-out of ACS.",
        "related_diseases": ["acute_coronary_syndrome", "myocardial_infarction", "unstable_angina"]
    },
    {
        "id": "timi_risk_score_nstemi",
        "name": "TIMI Risk Score for NSTEMI/UA",
        "category": "prognostic",
        "subcategory": "acs_risk",
        "components": [
            {"condition": "Age ≥65", "points": 1},
            {"condition": "≥3 CAD risk factors", "points": 1},
            {"condition": "Known CAD (≥50% stenosis)", "points": 1},
            {"condition": "Aspirin use in past 7 days", "points": 1},
            {"condition": "Severe angina (≥2 episodes in 24h)", "points": 1},
            {"condition": "ST changes ≥0.5mm", "points": 1},
            {"condition": "Elevated cardiac markers", "points": 1}
        ],
        "score_range": "0-7",
        "clinical_thresholds": {
            "0-2": "Low risk (4.7-8.3% 14-day events)",
            "3-4": "Intermediate risk (13.2-19.9%)",
            "5-7": "High risk (26.2-40.9%)"
        },
        "when_to_use": "Risk stratification in NSTEMI/unstable angina",
        "related_diseases": ["nstemi", "unstable_angina", "acute_coronary_syndrome"]
    }
]

# ============================================================================
# RESPIRATORY EQUATIONS
# ============================================================================

RESPIRATORY_EQUATIONS = [
    {
        "id": "aa_gradient",
        "name": "Alveolar-arterial (A-a) Gradient",
        "category": "diagnostic",
        "subcategory": "oxygenation",
        "equation": "A-a = PAO₂ - PaO₂",
        "equation_latex": r"A-a = PA_{O_2} - Pa_{O_2}",
        "derived_equations": [
            {
                "name": "Alveolar Oxygen (PAO₂)",
                "equation": "PAO₂ = FiO₂(Patm - PH₂O) - PaCO₂/R",
                "simplified": "PAO₂ = FiO₂(713) - PaCO₂/0.8 (at sea level)"
            }
        ],
        "variables": {
            "A-a": {"description": "A-a gradient", "unit": "mmHg", "normal_range": "Age/4 + 4"},
            "PAO₂": {"description": "Alveolar oxygen tension", "unit": "mmHg"},
            "PaO₂": {"description": "Arterial oxygen tension", "unit": "mmHg", "normal_range": "80-100"},
            "FiO₂": {"description": "Fraction of inspired oxygen", "unit": "decimal", "normal_range": "0.21"},
            "Patm": {"description": "Atmospheric pressure", "unit": "mmHg", "normal_range": "760"},
            "PH₂O": {"description": "Water vapor pressure", "unit": "mmHg", "normal_range": "47"},
            "PaCO₂": {"description": "Arterial CO₂", "unit": "mmHg", "normal_range": "35-45"},
            "R": {"description": "Respiratory quotient", "unit": "ratio", "normal_range": "0.8"}
        },
        "interpretation": "Measures efficiency of oxygen transfer from alveoli to blood.",
        "clinical_application": {
            "Normal A-a gradient + Hypoxemia": "Pure hypoventilation (CNS depression, neuromuscular)",
            "Elevated A-a gradient": "V/Q mismatch, shunt, or diffusion impairment"
        },
        "clinical_thresholds": {
            "Normal": "Age/4 + 4 (example: 35yo = 12.75 mmHg)",
            ">15 (young adult)": "Abnormal",
            ">25": "Significantly abnormal",
            ">40": "Severe gas exchange impairment"
        },
        "when_to_use": "Evaluating hypoxemia etiology, distinguishing hypoventilation from other causes",
        "limitations": ["FiO₂ must be known", "Affected by altitude", "Less useful on high FiO₂"],
        "related_diseases": ["copd", "pulmonary_embolism", "ards", "pneumonia", "pulmonary_fibrosis"]
    },
    {
        "id": "pf_ratio",
        "name": "PaO₂/FiO₂ Ratio (P/F Ratio)",
        "category": "diagnostic",
        "subcategory": "oxygenation",
        "equation": "P/F = PaO₂ / FiO₂",
        "equation_latex": r"P/F = \frac{PaO_2}{FiO_2}",
        "variables": {
            "P/F": {"description": "P/F Ratio", "unit": "mmHg", "normal_range": ">400"},
            "PaO₂": {"description": "Arterial oxygen tension", "unit": "mmHg"},
            "FiO₂": {"description": "Fraction of inspired oxygen", "unit": "decimal"}
        },
        "interpretation": "Simple measure of oxygenation efficiency. Used to define ARDS severity.",
        "clinical_thresholds": {
            ">400": "Normal",
            "300-400": "Mild hypoxemia",
            "200-300": "Moderate ARDS (Berlin criteria)",
            "100-200": "Severe ARDS",
            "<100": "Very severe hypoxemia"
        },
        "berlin_ards_criteria": {
            "Mild": "P/F 200-300 with PEEP ≥5",
            "Moderate": "P/F 100-200 with PEEP ≥5",
            "Severe": "P/F <100 with PEEP ≥5"
        },
        "when_to_use": "ARDS classification, monitoring respiratory failure, ventilator management",
        "limitations": ["Doesn't account for PEEP", "Affected by altitude"],
        "related_diseases": ["ards", "pneumonia", "respiratory_failure"]
    },
    {
        "id": "curb65",
        "name": "CURB-65 Score",
        "category": "prognostic",
        "subcategory": "pneumonia_severity",
        "equation": "Score = C + U + R + B + 65",
        "components": [
            {"variable": "C", "condition": "Confusion (new onset)", "points": 1},
            {"variable": "U", "condition": "Urea >7 mmol/L (BUN >19 mg/dL)", "points": 1},
            {"variable": "R", "condition": "Respiratory rate ≥30/min", "points": 1},
            {"variable": "B", "condition": "Blood pressure (SBP <90 or DBP ≤60)", "points": 1},
            {"variable": "65", "condition": "Age ≥65 years", "points": 1}
        ],
        "score_range": "0-5",
        "interpretation": "Predicts 30-day mortality in community-acquired pneumonia.",
        "clinical_thresholds": {
            "0-1": "Low risk (0.7-2.1% mortality) - outpatient treatment",
            "2": "Moderate risk (6.8-9.2%) - consider hospitalization",
            "3": "High risk (14.5%) - hospitalize",
            "4-5": "Severe (27.8-57.3%) - ICU consideration"
        },
        "evidence": "British Thoracic Society. C-statistic 0.73-0.83",
        "related_diseases": ["community_acquired_pneumonia", "pneumonia"]
    },
    {
        "id": "wells_pe",
        "name": "Wells Score for Pulmonary Embolism",
        "category": "diagnostic",
        "subcategory": "pe_probability",
        "components": [
            {"condition": "Clinical signs/symptoms of DVT", "points": 3.0},
            {"condition": "PE is #1 diagnosis OR equally likely", "points": 3.0},
            {"condition": "Heart rate >100 bpm", "points": 1.5},
            {"condition": "Immobilization ≥3 days OR surgery in past 4 weeks", "points": 1.5},
            {"condition": "Previous PE or DVT", "points": 1.5},
            {"condition": "Hemoptysis", "points": 1.0},
            {"condition": "Malignancy (treatment within 6 months or palliative)", "points": 1.0}
        ],
        "score_range": "0-12.5",
        "interpretation": "Pre-test probability of pulmonary embolism.",
        "clinical_thresholds": {
            "≤4 (Two-tier)": "PE unlikely - D-dimer to rule out",
            ">4 (Two-tier)": "PE likely - CT angiography",
            "0-1 (Three-tier)": "Low probability (1.3%)",
            "2-6 (Three-tier)": "Moderate probability (16.2%)",
            ">6 (Three-tier)": "High probability (37.5%)"
        },
        "diagnostic_algorithm": "Wells ≤4 + negative D-dimer = PE ruled out (NPV >99%)",
        "evidence": "Wells 2000. Validated extensively.",
        "related_diseases": ["pulmonary_embolism", "dvt"]
    }
]

# ============================================================================
# RENAL EQUATIONS
# ============================================================================

RENAL_EQUATIONS = [
    {
        "id": "gfr_ckd_epi_2021",
        "name": "GFR (CKD-EPI 2021)",
        "category": "diagnostic",
        "subcategory": "renal_function",
        "equation": "GFR = 142 × min(Scr/κ,1)^α × max(Scr/κ,1)^-1.200 × 0.9938^Age × (1.012 if female)",
        "equation_latex": r"GFR = 142 \times \min(\frac{Scr}{\kappa},1)^{\alpha} \times \max(\frac{Scr}{\kappa},1)^{-1.200} \times 0.9938^{Age} \times (1.012 \text{ if female})",
        "variables": {
            "GFR": {"description": "Glomerular Filtration Rate", "unit": "mL/min/1.73m²", "normal_range": "≥90"},
            "Scr": {"description": "Serum Creatinine", "unit": "mg/dL"},
            "κ": {"description": "Sex constant", "female": 0.7, "male": 0.9},
            "α": {"description": "Sex exponent", "female": -0.241, "male": -0.302},
            "Age": {"description": "Age in years", "unit": "years"}
        },
        "interpretation": "Estimates glomerular filtration rate without race adjustment (2021 update).",
        "ckd_staging": {
            "G1": {"gfr": "≥90", "description": "Normal or high"},
            "G2": {"gfr": "60-89", "description": "Mildly decreased"},
            "G3a": {"gfr": "45-59", "description": "Mildly to moderately decreased"},
            "G3b": {"gfr": "30-44", "description": "Moderately to severely decreased"},
            "G4": {"gfr": "15-29", "description": "Severely decreased"},
            "G5": {"gfr": "<15", "description": "Kidney failure"}
        },
        "when_to_use": "CKD staging, drug dosing, monitoring kidney function",
        "limitations": ["Less accurate at extremes of muscle mass", "Requires stable creatinine"],
        "note": "2021 equation removes race coefficient - now standard of care",
        "related_diseases": ["chronic_kidney_disease", "acute_kidney_injury", "diabetic_nephropathy"]
    },
    {
        "id": "cockcroft_gault",
        "name": "Creatinine Clearance (Cockcroft-Gault)",
        "category": "pharmacokinetic",
        "subcategory": "drug_dosing",
        "equation": "CrCl = [(140 - Age) × Weight × (0.85 if female)] / (72 × Scr)",
        "equation_latex": r"CrCl = \frac{(140 - Age) \times Weight \times (0.85 \text{ if female})}{72 \times Scr}",
        "variables": {
            "CrCl": {"description": "Creatinine Clearance", "unit": "mL/min"},
            "Age": {"description": "Age in years", "unit": "years"},
            "Weight": {"description": "Actual body weight", "unit": "kg"},
            "Scr": {"description": "Serum Creatinine", "unit": "mg/dL"}
        },
        "interpretation": "Estimates creatinine clearance for drug dosing. Most drug studies used this equation.",
        "weight_considerations": {
            "Actual weight": "Use for normal BMI",
            "Adjusted weight": "For obese patients: IBW + 0.4(ABW - IBW)",
            "Ideal body weight": "Consider for morbidly obese"
        },
        "when_to_use": "Drug dosing adjustments - FDA-approved labeling typically uses Cockcroft-Gault",
        "limitations": ["Overestimates GFR", "Less accurate in obese/cachectic patients", "Developed in 1976"],
        "related_diseases": ["chronic_kidney_disease", "drug_toxicity"]
    },
    {
        "id": "fena",
        "name": "Fractional Excretion of Sodium (FENa)",
        "category": "diagnostic",
        "subcategory": "aki_etiology",
        "equation": "FENa = (UNa × PCr) / (PNa × UCr) × 100%",
        "equation_latex": r"FENa = \frac{U_{Na} \times P_{Cr}}{P_{Na} \times U_{Cr}} \times 100\%",
        "variables": {
            "FENa": {"description": "Fractional Excretion of Sodium", "unit": "%"},
            "UNa": {"description": "Urine Sodium", "unit": "mEq/L"},
            "PNa": {"description": "Plasma Sodium", "unit": "mEq/L"},
            "UCr": {"description": "Urine Creatinine", "unit": "mg/dL"},
            "PCr": {"description": "Plasma Creatinine", "unit": "mg/dL"}
        },
        "interpretation": "Determines if AKI is prerenal (volume responsive) or intrinsic (ATN).",
        "clinical_thresholds": {
            "<1%": "Prerenal azotemia - kidney retaining sodium",
            "1-2%": "Indeterminate",
            ">2%": "Intrinsic renal failure (ATN) - kidney losing sodium"
        },
        "exceptions": {
            "FENa <1% despite ATN": ["Contrast nephropathy", "Myoglobinuria", "Early sepsis", "Acute GN"],
            "FENa >1% despite prerenal": ["Diuretic use", "CKD", "Adrenal insufficiency"]
        },
        "alternative": "Use FEUrea if patient on diuretics: FEUrea <35% suggests prerenal",
        "when_to_use": "Differentiating prerenal from intrinsic AKI",
        "limitations": ["Invalid if on diuretics", "Unreliable in CKD"],
        "related_diseases": ["acute_kidney_injury", "prerenal_azotemia", "acute_tubular_necrosis"]
    }
]

# ============================================================================
# ACID-BASE EQUATIONS
# ============================================================================

ACIDBASE_EQUATIONS = [
    {
        "id": "henderson_hasselbalch",
        "name": "Henderson-Hasselbalch Equation",
        "category": "physiologic",
        "subcategory": "acid_base",
        "equation": "pH = 6.1 + log([HCO₃⁻] / (0.03 × pCO₂))",
        "equation_latex": r"pH = 6.1 + \log\left(\frac{[HCO_3^-]}{0.03 \times pCO_2}\right)",
        "variables": {
            "pH": {"description": "Blood pH", "unit": "units", "normal_range": "7.35-7.45"},
            "HCO₃⁻": {"description": "Bicarbonate", "unit": "mEq/L", "normal_range": "22-26"},
            "pCO₂": {"description": "Partial pressure of CO₂", "unit": "mmHg", "normal_range": "35-45"},
            "6.1": {"description": "pKa of carbonic acid"},
            "0.03": {"description": "Solubility coefficient of CO₂"}
        },
        "interpretation": "Relates pH to the ratio of bicarbonate (metabolic) to CO₂ (respiratory).",
        "clinical_application": "Understanding acid-base disturbances: HCO₃⁻ = metabolic component, pCO₂ = respiratory component",
        "related_diseases": ["metabolic_acidosis", "metabolic_alkalosis", "respiratory_acidosis", "respiratory_alkalosis"]
    },
    {
        "id": "anion_gap",
        "name": "Anion Gap",
        "category": "diagnostic",
        "subcategory": "acid_base",
        "equation": "AG = Na⁺ - (Cl⁻ + HCO₃⁻)",
        "equation_latex": r"AG = Na^+ - (Cl^- + HCO_3^-)",
        "variables": {
            "AG": {"description": "Anion Gap", "unit": "mEq/L", "normal_range": "8-12"},
            "Na⁺": {"description": "Sodium", "unit": "mEq/L", "normal_range": "135-145"},
            "Cl⁻": {"description": "Chloride", "unit": "mEq/L", "normal_range": "98-106"},
            "HCO₃⁻": {"description": "Bicarbonate", "unit": "mEq/L", "normal_range": "22-26"}
        },
        "interpretation": "Identifies unmeasured anions. Elevated in certain metabolic acidoses.",
        "clinical_thresholds": {
            "8-12 mEq/L": "Normal",
            ">12 mEq/L": "High anion gap metabolic acidosis (HAGMA)",
            "<8 mEq/L": "Low anion gap (hypoalbuminemia, myeloma, lithium)"
        },
        "hagma_causes": "MUDPILES: Methanol, Uremia, DKA, Propylene glycol, Isoniazid/Iron, Lactic acidosis, Ethylene glycol, Salicylates",
        "albumin_correction": "Corrected AG = AG + 2.5 × (4 - albumin)",
        "related_diseases": ["diabetic_ketoacidosis", "lactic_acidosis", "toxic_ingestion", "uremia"]
    },
    {
        "id": "delta_delta",
        "name": "Delta-Delta (Δ/Δ) Ratio",
        "category": "diagnostic",
        "subcategory": "acid_base",
        "equation": "Δ/Δ = ΔAG / ΔHCO₃⁻ = (AG - 12) / (24 - HCO₃⁻)",
        "equation_latex": r"\Delta/\Delta = \frac{\Delta AG}{\Delta HCO_3^-} = \frac{AG - 12}{24 - HCO_3^-}",
        "interpretation": "Identifies mixed acid-base disorders in HAGMA.",
        "clinical_thresholds": {
            "<1": "Concurrent non-AG metabolic acidosis",
            "1-2": "Pure HAGMA",
            ">2": "Concurrent metabolic alkalosis"
        },
        "when_to_use": "When HAGMA is present, to detect additional acid-base disorders",
        "related_diseases": ["metabolic_acidosis", "mixed_acid_base_disorders"]
    },
    {
        "id": "winters_formula",
        "name": "Winter's Formula",
        "category": "diagnostic",
        "subcategory": "acid_base",
        "equation": "Expected pCO₂ = 1.5 × [HCO₃⁻] + 8 ± 2",
        "equation_latex": r"Expected\ pCO_2 = 1.5 \times [HCO_3^-] + 8 \pm 2",
        "interpretation": "Predicts appropriate respiratory compensation in metabolic acidosis.",
        "clinical_application": {
            "Measured pCO₂ = Expected": "Appropriate compensation - simple metabolic acidosis",
            "Measured pCO₂ > Expected": "Concurrent respiratory acidosis",
            "Measured pCO₂ < Expected": "Concurrent respiratory alkalosis"
        },
        "when_to_use": "Evaluating respiratory compensation in metabolic acidosis",
        "related_diseases": ["metabolic_acidosis", "respiratory_acidosis", "respiratory_alkalosis"]
    }
]

# ============================================================================
# HEPATOLOGY EQUATIONS
# ============================================================================

HEPATOLOGY_EQUATIONS = [
    {
        "id": "meld_score",
        "name": "MELD Score (Model for End-Stage Liver Disease)",
        "category": "prognostic",
        "subcategory": "liver_disease",
        "equation": "MELD = 10 × [0.957 × ln(Cr) + 0.378 × ln(Bili) + 1.120 × ln(INR) + 0.643]",
        "equation_latex": r"MELD = 10 \times [0.957 \times \ln(Cr) + 0.378 \times \ln(Bili) + 1.120 \times \ln(INR) + 0.643]",
        "variables": {
            "MELD": {"description": "MELD Score", "unit": "points", "range": "6-40"},
            "Cr": {"description": "Creatinine", "unit": "mg/dL", "bounds": "min 1.0, max 4.0"},
            "Bili": {"description": "Total Bilirubin", "unit": "mg/dL", "bounds": "min 1.0"},
            "INR": {"description": "International Normalized Ratio", "bounds": "min 1.0"}
        },
        "interpretation": "Predicts 3-month mortality in cirrhosis. Used for liver transplant allocation.",
        "clinical_thresholds": {
            "<10": "~2% 3-month mortality",
            "10-19": "~6% 3-month mortality",
            "20-29": "~20% 3-month mortality",
            "30-39": "~53% 3-month mortality",
            "≥40": "~71% 3-month mortality"
        },
        "transplant_allocation": "Higher MELD = higher priority for liver transplant",
        "meld_na": "MELD-Na adds sodium correction for better accuracy",
        "evidence": "UNOS standard since 2002. C-statistic ~0.83",
        "related_diseases": ["cirrhosis", "liver_failure", "hepatic_encephalopathy"]
    },
    {
        "id": "child_pugh",
        "name": "Child-Pugh Score",
        "category": "prognostic",
        "subcategory": "liver_disease",
        "components": [
            {"parameter": "Encephalopathy", "1": "None", "2": "Grade 1-2", "3": "Grade 3-4"},
            {"parameter": "Ascites", "1": "None", "2": "Mild/Controlled", "3": "Moderate-Severe"},
            {"parameter": "Bilirubin (mg/dL)", "1": "<2", "2": "2-3", "3": ">3"},
            {"parameter": "Albumin (g/dL)", "1": ">3.5", "2": "2.8-3.5", "3": "<2.8"},
            {"parameter": "INR", "1": "<1.7", "2": "1.7-2.3", "3": ">2.3"}
        ],
        "score_range": "5-15",
        "interpretation": "Assesses prognosis and surgical risk in chronic liver disease.",
        "classification": {
            "Class A (5-6)": "Well-compensated, 100% 1-year survival, minimal operative risk",
            "Class B (7-9)": "Significant functional compromise, 80% 1-year survival",
            "Class C (10-15)": "Decompensated, 45% 1-year survival, high operative mortality"
        },
        "surgical_mortality": {
            "Class A": "10%",
            "Class B": "30%",
            "Class C": "76-82%"
        },
        "related_diseases": ["cirrhosis", "portal_hypertension", "hepatocellular_carcinoma"]
    }
]

# ============================================================================
# SEPSIS/INFECTIOUS EQUATIONS
# ============================================================================

SEPSIS_EQUATIONS = [
    {
        "id": "qsofa",
        "name": "qSOFA (Quick SOFA)",
        "category": "prognostic",
        "subcategory": "sepsis_screening",
        "components": [
            {"parameter": "Respiratory rate ≥22/min", "points": 1},
            {"parameter": "Altered mentation (GCS <15)", "points": 1},
            {"parameter": "Systolic BP ≤100 mmHg", "points": 1}
        ],
        "score_range": "0-3",
        "interpretation": "Bedside screen for sepsis risk outside ICU.",
        "clinical_thresholds": {
            "0-1": "Low risk - continue monitoring",
            "≥2": "High risk of poor outcome - assess for sepsis/organ dysfunction"
        },
        "evidence": "Sepsis-3 criteria (2016). Specificity 98% for in-hospital mortality.",
        "note": "Use for screening, not diagnosis. Full SOFA for ICU patients.",
        "related_diseases": ["sepsis", "septic_shock"]
    },
    {
        "id": "sofa_score",
        "name": "SOFA Score (Sequential Organ Failure Assessment)",
        "category": "prognostic",
        "subcategory": "organ_dysfunction",
        "components": [
            {
                "system": "Respiration (PaO₂/FiO₂)",
                "0": "≥400",
                "1": "300-399",
                "2": "200-299",
                "3": "100-199 + ventilation",
                "4": "<100 + ventilation"
            },
            {
                "system": "Coagulation (Platelets ×10³/µL)",
                "0": "≥150",
                "1": "100-149",
                "2": "50-99",
                "3": "20-49",
                "4": "<20"
            },
            {
                "system": "Liver (Bilirubin mg/dL)",
                "0": "<1.2",
                "1": "1.2-1.9",
                "2": "2.0-5.9",
                "3": "6.0-11.9",
                "4": "≥12"
            },
            {
                "system": "Cardiovascular",
                "0": "MAP ≥70",
                "1": "MAP <70",
                "2": "Dopamine ≤5 or dobutamine",
                "3": "Dopamine >5 or epi/norepi ≤0.1",
                "4": "Dopamine >15 or epi/norepi >0.1"
            },
            {
                "system": "CNS (Glasgow Coma Scale)",
                "0": "15",
                "1": "13-14",
                "2": "10-12",
                "3": "6-9",
                "4": "<6"
            },
            {
                "system": "Renal (Creatinine mg/dL or UOP)",
                "0": "<1.2",
                "1": "1.2-1.9",
                "2": "2.0-3.4",
                "3": "3.5-4.9 or UOP <500mL/d",
                "4": "≥5.0 or UOP <200mL/d"
            }
        ],
        "score_range": "0-24",
        "interpretation": "Quantifies organ dysfunction. Increase ≥2 points defines sepsis.",
        "mortality_by_score": {
            "<6": "~10%",
            "6-9": "~20%",
            "10-12": "~50%",
            ">12": ">80%"
        },
        "sepsis_definition": "Suspected infection + SOFA increase ≥2 points",
        "related_diseases": ["sepsis", "septic_shock", "multi_organ_failure"]
    }
]

# ============================================================================
# HEMATOLOGY EQUATIONS
# ============================================================================

HEMATOLOGY_EQUATIONS = [
    {
        "id": "corrected_calcium",
        "name": "Corrected Calcium",
        "category": "diagnostic",
        "subcategory": "electrolytes",
        "equation": "Corrected Ca = Measured Ca + 0.8 × (4.0 - Albumin)",
        "equation_latex": r"Ca_{corrected} = Ca_{measured} + 0.8 \times (4.0 - Albumin)",
        "variables": {
            "Corrected Ca": {"description": "Albumin-corrected calcium", "unit": "mg/dL", "normal_range": "8.5-10.5"},
            "Measured Ca": {"description": "Total serum calcium", "unit": "mg/dL"},
            "Albumin": {"description": "Serum albumin", "unit": "g/dL", "normal_range": "3.5-5.0"}
        },
        "interpretation": "Adjusts calcium for albumin binding. ~50% of calcium is albumin-bound.",
        "when_to_use": "When albumin is abnormal (hypoalbuminemia, nephrotic syndrome, malnutrition)",
        "alternative": "Ionized calcium (direct measurement) is gold standard",
        "related_diseases": ["hypercalcemia", "hypocalcemia", "hyperparathyroidism"]
    },
    {
        "id": "reticulocyte_index",
        "name": "Reticulocyte Production Index (RPI)",
        "category": "diagnostic",
        "subcategory": "anemia",
        "equation": "RPI = (Retic% × Hct/45) / Maturation Factor",
        "equation_latex": r"RPI = \frac{Retic\% \times \frac{Hct}{45}}{Maturation\ Factor}",
        "variables": {
            "RPI": {"description": "Reticulocyte Production Index", "unit": "index"},
            "Retic%": {"description": "Reticulocyte percentage", "unit": "%"},
            "Hct": {"description": "Hematocrit", "unit": "%"},
            "Maturation Factor": {
                "description": "Days for reticulocyte maturation",
                "values": {"Hct 45%": 1.0, "Hct 35%": 1.5, "Hct 25%": 2.0, "Hct 15%": 2.5}
            }
        },
        "interpretation": "Assesses bone marrow response to anemia.",
        "clinical_thresholds": {
            ">2": "Adequate marrow response - hemolysis or blood loss",
            "<2": "Inadequate marrow response - production problem"
        },
        "related_diseases": ["anemia", "hemolytic_anemia", "aplastic_anemia", "iron_deficiency_anemia"]
    }
]

# ============================================================================
# NOVEL PHICOR MODELS
# ============================================================================

PHICOR_NOVEL_MODELS = [
    {
        "id": "phicor_diagnostic_probability",
        "name": "PhiCor Multi-Parameter Diagnostic Probability",
        "category": "diagnostic",
        "subcategory": "phicor_proprietary",
        "equation": "P(Disease) = P₀ × ∏(LRᵢ) / [P₀ × ∏(LRᵢ) + (1-P₀)]",
        "equation_latex": r"P(Disease) = \frac{P_0 \times \prod_{i=1}^{n} LR_i}{P_0 \times \prod_{i=1}^{n} LR_i + (1-P_0)}",
        "description": "Calculates disease probability by combining multiple findings using Bayesian reasoning.",
        "variables": {
            "P(Disease)": {"description": "Post-test probability of disease", "unit": "probability"},
            "P₀": {"description": "Prior probability (prevalence or clinical estimate)", "unit": "probability"},
            "LRᵢ": {"description": "Likelihood ratio for finding i", "unit": "ratio"}
        },
        "calculation_steps": [
            "1. Determine prior probability based on prevalence and clinical context",
            "2. For each positive finding: multiply by LR+ = Sensitivity / (1 - Specificity)",
            "3. For each negative finding: multiply by LR- = (1 - Sensitivity) / Specificity",
            "4. Convert final odds to probability"
        ],
        "interpretation_guide": {
            "<10%": "Disease unlikely - consider ruling out",
            "10-50%": "Uncertain - further testing needed",
            "50-90%": "Disease probable - consider treatment",
            ">90%": "Disease highly likely - treat empirically"
        },
        "example": {
            "scenario": "Chest pain with prior probability 20%",
            "positive_troponin_lr": 10,
            "positive_ecg_lr": 5,
            "calculation": "Odds = 0.2/0.8 × 10 × 5 = 12.5, Probability = 12.5/13.5 = 92.6%"
        },
        "novel_contribution": "PhiCor automates this calculation across all findings and diseases in the database"
    },
    {
        "id": "phicor_organ_dysfunction_index",
        "name": "PhiCor Organ Dysfunction Index (ODI)",
        "category": "prognostic",
        "subcategory": "phicor_proprietary",
        "equation": "ODI = Σ(wᵢ × Dᵢ) / Σwᵢ × 100",
        "description": "Quantifies overall organ dysfunction by weighting deviations across organ systems.",
        "variables": {
            "ODI": {"description": "Organ Dysfunction Index", "unit": "%", "range": "0-100"},
            "wᵢ": {"description": "Weight for organ system i based on clinical importance"},
            "Dᵢ": {"description": "Deviation score for organ i (0-1 based on parameter abnormalities)"}
        },
        "organ_weights": {
            "Cardiovascular": 1.5,
            "Respiratory": 1.5,
            "Renal": 1.3,
            "Hepatic": 1.0,
            "Neurological": 1.2,
            "Hematological": 0.8,
            "Metabolic": 0.7
        },
        "interpretation": {
            "0-20%": "Minimal dysfunction",
            "20-40%": "Mild dysfunction",
            "40-60%": "Moderate dysfunction",
            "60-80%": "Severe dysfunction",
            ">80%": "Critical multi-organ dysfunction"
        },
        "novel_contribution": "Extends SOFA concept to comprehensive organ assessment using PhiCor parameter database"
    },
    {
        "id": "phicor_disease_match_score",
        "name": "PhiCor Disease Match Score",
        "category": "diagnostic",
        "subcategory": "phicor_proprietary",
        "equation": "Match% = (Matched_Findings / Expected_Findings) × Sensitivity_Weighted_Factor × 100",
        "description": "Calculates how well patient findings match a disease's expected profile.",
        "components": {
            "Matched_Findings": "Count of patient findings that align with disease profile",
            "Expected_Findings": "Total expected findings in disease profile",
            "Sensitivity_Weighted_Factor": "Weights important findings higher (pathognomonic signs weighted more)"
        },
        "interpretation": {
            "0-20%": "Poor match - unlikely diagnosis",
            "20-40%": "Weak match - consider in differential",
            "40-60%": "Moderate match - reasonable diagnosis",
            "60-80%": "Strong match - probable diagnosis",
            ">80%": "Excellent match - highly likely diagnosis"
        },
        "novel_contribution": "Enables automated differential diagnosis ranking in PhiCor dashboard"
    }
]

# ============================================================================
# COMPLETE EQUATIONS DATABASE
# ============================================================================

ALL_EQUATIONS = {
    "cardiovascular": CARDIOVASCULAR_EQUATIONS,
    "respiratory": RESPIRATORY_EQUATIONS,
    "renal": RENAL_EQUATIONS,
    "acid_base": ACIDBASE_EQUATIONS,
    "hepatology": HEPATOLOGY_EQUATIONS,
    "sepsis": SEPSIS_EQUATIONS,
    "hematology": HEMATOLOGY_EQUATIONS,
    "phicor_novel": PHICOR_NOVEL_MODELS
}

def get_all_equations() -> List[Dict]:
    """Get all equations as a flat list"""
    equations = []
    for category, eq_list in ALL_EQUATIONS.items():
        for eq in eq_list:
            eq["equation_category"] = category
            equations.append(eq)
    return equations

def get_equations_by_category(category: str) -> List[Dict]:
    """Get equations for a specific category"""
    return ALL_EQUATIONS.get(category, [])

def get_equations_for_disease(disease_category: str) -> List[Dict]:
    """Get relevant equations for a disease category"""
    category_mapping = {
        "cardiovascular": ["cardiovascular"],
        "respiratory": ["respiratory", "acid_base"],
        "gastrointestinal": ["hepatology", "acid_base"],
        "infectious": ["sepsis", "hematology"],
        "renal": ["renal", "acid_base"],
        "hematological": ["hematology"],
        "endocrine": ["acid_base"],
    }
    
    relevant_categories = category_mapping.get(disease_category, ["phicor_novel"])
    equations = []
    for cat in relevant_categories:
        equations.extend(get_equations_by_category(cat))
    
    # Always include PhiCor novel models
    equations.extend(get_equations_by_category("phicor_novel"))
    
    return equations

# Export for API
def export_equations_to_dict() -> Dict:
    """Export all equations as a dictionary for API response"""
    return {
        "total_equations": sum(len(eq_list) for eq_list in ALL_EQUATIONS.values()),
        "categories": list(ALL_EQUATIONS.keys()),
        "equations": ALL_EQUATIONS,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "version": "1.0"
    }


if __name__ == "__main__":
    # Print summary
    total = sum(len(eq_list) for eq_list in ALL_EQUATIONS.values())
    print(f"PhiCor Mathematical Equations Library")
    print(f"=" * 40)
    print(f"Total equations: {total}")
    print(f"\nBy category:")
    for category, eq_list in ALL_EQUATIONS.items():
        print(f"  {category}: {len(eq_list)}")
    
    print(f"\nSample equations:")
    for eq in get_all_equations()[:3]:
        print(f"  - {eq['name']}: {eq['equation'][:50]}...")
