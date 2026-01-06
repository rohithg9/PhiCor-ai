"""
PhiCor Complete Disease Schema
================================
This schema defines the complete structure for a disease in the PhiCor engine.
All diseases should be enhanced to meet this schema for full diagnostic capability.
"""

from typing import List, Dict, Optional, Union
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

# ============================================================================
# ENUMS
# ============================================================================

class Direction(str, Enum):
    INCREASE = "increase"
    DECREASE = "decrease"
    VARIABLE = "variable"
    NORMAL = "normal"

class Magnitude(str, Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    CRITICAL = "critical"

class Frequency(str, Enum):
    ALWAYS = "always"  # >90%
    COMMON = "common"  # 50-90%
    OCCASIONAL = "occasional"  # 10-50%
    RARE = "rare"  # <10%

class Onset(str, Enum):
    ACUTE = "acute"  # seconds to hours
    SUBACUTE = "subacute"  # days to weeks
    CHRONIC = "chronic"  # weeks to months
    INSIDIOUS = "insidious"  # gradual over months

class TestType(str, Enum):
    LABORATORY = "laboratory"
    IMAGING = "imaging"
    PATHOLOGY = "pathology"
    GENETIC = "genetic"
    FUNCTIONAL = "functional"
    CLINICAL_SCORE = "clinical_score"

class TreatmentType(str, Enum):
    PHARMACOLOGICAL = "pharmacological"
    SURGICAL = "surgical"
    INTERVENTIONAL = "interventional"
    SUPPORTIVE = "supportive"
    LIFESTYLE = "lifestyle"
    MONITORING = "monitoring"

# ============================================================================
# PARAMETER MODELS
# ============================================================================

class ParameterValue(BaseModel):
    """Individual parameter with deviation from normal"""
    name: str
    direction: Direction
    magnitude: Magnitude
    typical_value: str  # e.g., "150-200" or "elevated"
    normal_range: str  # e.g., "70-100"
    unit: str
    # Statistical properties
    sensitivity: Optional[float] = None  # 0-100%
    specificity: Optional[float] = None  # 0-100%
    likelihood_ratio_positive: Optional[float] = None
    likelihood_ratio_negative: Optional[float] = None
    # Context
    timing: Optional[str] = None  # When in disease course
    modifiers: Optional[List[str]] = None  # Age, sex, comorbidities

class OrganSystemParameters(BaseModel):
    """Parameters for a specific organ system"""
    organ_name: str
    parameters: Dict[str, ParameterValue]
    # Clinical manifestations
    symptoms: List[str] = []
    clinical_signs: List[str] = []
    # Lab and imaging
    lab_tests: List[str] = []
    imaging_findings: List[str] = []

# ============================================================================
# SYMPTOM & SIGN MODELS
# ============================================================================

class Symptom(BaseModel):
    """Patient-reported symptom"""
    name: str
    description: str
    frequency: Frequency
    onset: Onset
    duration: Optional[str] = None
    severity_range: Optional[str] = None  # e.g., "mild to severe"
    # Diagnostic value
    sensitivity: Optional[float] = None
    specificity: Optional[float] = None
    # Associations
    associated_symptoms: List[str] = []
    relieving_factors: List[str] = []
    aggravating_factors: List[str] = []
    red_flags: List[str] = []

class ClinicalSign(BaseModel):
    """Physical examination finding"""
    name: str
    description: str
    examination_technique: str
    frequency: Frequency
    # Diagnostic value
    sensitivity: Optional[float] = None
    specificity: Optional[float] = None
    likelihood_ratio_positive: Optional[float] = None
    # Interpretation
    interpretation: str
    grading_scale: Optional[str] = None

# ============================================================================
# DIAGNOSTIC MODELS
# ============================================================================

class DiagnosticTest(BaseModel):
    """Laboratory, imaging, or other diagnostic test"""
    name: str
    type: TestType
    description: str
    # Performance characteristics
    sensitivity: float
    specificity: float
    positive_predictive_value: Optional[float] = None
    negative_predictive_value: Optional[float] = None
    likelihood_ratio_positive: Optional[float] = None
    likelihood_ratio_negative: Optional[float] = None
    # Results interpretation
    expected_result: str
    normal_range: Optional[str] = None
    critical_values: Optional[str] = None
    interpretation_guide: str
    # Practical
    cost_category: Optional[str] = None  # low/medium/high
    turnaround_time: Optional[str] = None
    contraindications: List[str] = []

class DiagnosticCriteria(BaseModel):
    """Formal diagnostic criteria (e.g., DSM-5, ACR criteria)"""
    name: str
    source: str  # e.g., "ACR/EULAR 2010"
    year: int
    major_criteria: List[str]
    minor_criteria: List[str]
    diagnosis_requires: str  # e.g., "4 of 11 criteria"
    sensitivity: Optional[float] = None
    specificity: Optional[float] = None

# ============================================================================
# TREATMENT MODELS
# ============================================================================

class Medication(BaseModel):
    """Pharmacological treatment"""
    generic_name: str
    brand_names: List[str] = []
    drug_class: str
    mechanism_of_action: str
    # Dosing
    standard_dose: str
    dose_range: str
    route: str  # oral, IV, IM, SC, topical
    frequency: str
    duration: Optional[str] = None
    # Adjustments
    renal_adjustment: Optional[str] = None
    hepatic_adjustment: Optional[str] = None
    pediatric_dose: Optional[str] = None
    geriatric_considerations: Optional[str] = None
    # Safety
    contraindications: List[str] = []
    warnings: List[str] = []
    common_side_effects: List[str] = []
    serious_adverse_effects: List[str] = []
    drug_interactions: List[str] = []
    # Monitoring
    monitoring_parameters: List[str] = []
    therapeutic_range: Optional[str] = None
    # Evidence
    efficacy_evidence: Optional[str] = None
    nnt: Optional[float] = None  # Number needed to treat
    nnh: Optional[float] = None  # Number needed to harm

class Treatment(BaseModel):
    """Treatment protocol"""
    name: str
    type: TreatmentType
    description: str
    indication: str
    # Details based on type
    medications: List[Medication] = []
    procedure_details: Optional[str] = None
    lifestyle_modifications: List[str] = []
    # Outcomes
    expected_outcome: str
    time_to_effect: Optional[str] = None
    success_rate: Optional[float] = None
    # Guidelines
    guideline_recommendation: Optional[str] = None
    evidence_level: Optional[str] = None  # e.g., "Class I, Level A"

# ============================================================================
# MATHEMATICAL MODELS
# ============================================================================

class MathematicalEquation(BaseModel):
    """Mathematical equation or formula"""
    name: str
    category: str  # diagnostic, prognostic, pharmacokinetic, physiologic
    equation: str  # LaTeX or plain text formula
    variables: Dict[str, str]  # variable name -> description
    units: Dict[str, str]  # variable name -> unit
    # Interpretation
    interpretation: str
    normal_range: Optional[str] = None
    clinical_thresholds: Dict[str, str] = {}  # threshold -> interpretation
    # Validation
    derivation_population: Optional[str] = None
    validation_studies: List[str] = []
    c_statistic: Optional[float] = None  # AUC for prediction
    # Usage
    when_to_use: str
    limitations: List[str] = []
    # Example
    example_calculation: Optional[str] = None

class PhysiologicalModel(BaseModel):
    """Model describing physiological processes"""
    name: str
    system: str  # cardiovascular, respiratory, renal, etc.
    description: str
    # Components
    equations: List[MathematicalEquation]
    parameters: Dict[str, str]
    # Disease modification
    how_disease_affects: str
    expected_changes: Dict[str, str]

class DiagnosticModel(BaseModel):
    """Probability-based diagnostic model"""
    name: str
    description: str
    # Bayesian components
    prior_probability: Optional[float] = None
    sensitivity: float
    specificity: float
    # Formulas
    positive_likelihood_ratio: float
    negative_likelihood_ratio: float
    post_test_probability_formula: str
    # Clinical decision thresholds
    test_threshold: Optional[float] = None  # Below this, don't test
    treatment_threshold: Optional[float] = None  # Above this, treat

class PrognosticModel(BaseModel):
    """Prognostic scoring system"""
    name: str
    description: str
    components: List[Dict[str, Union[str, int, float]]]
    score_calculation: str
    # Risk stratification
    risk_categories: Dict[str, str]  # score range -> risk level
    outcomes_predicted: List[str]
    # Validation
    c_statistic: Optional[float] = None
    calibration: Optional[str] = None

# ============================================================================
# COMPLETE DISEASE MODEL
# ============================================================================

class CompleteDiseaseModel(BaseModel):
    """Complete disease model for PhiCor engine"""
    # Identifiers
    id: str
    name: str
    icd10_code: str
    icd11_code: Optional[str] = None
    snomed_ct: Optional[str] = None
    
    # Classification
    category: str
    subcategory: Optional[str] = None
    synonyms: List[str] = []
    
    # Description
    description: str
    pathophysiology: Dict[str, str]
    
    # Epidemiology
    epidemiology: Dict[str, Union[str, List[str]]]
    
    # Clinical manifestations
    symptoms: List[Symptom] = []
    clinical_signs: List[ClinicalSign] = []
    typical_presentation: str
    atypical_presentations: List[str] = []
    red_flags: List[str] = []
    
    # Parameters by organ system
    parameter_modifications: Dict[str, OrganSystemParameters]
    
    # Diagnostics
    diagnostic_tests: List[DiagnosticTest] = []
    diagnostic_criteria: Optional[DiagnosticCriteria] = None
    differential_diagnosis: List[str] = []
    
    # Treatment
    treatments: List[Treatment] = []
    first_line_treatment: Optional[str] = None
    treatment_algorithm: Optional[str] = None
    
    # Mathematical models
    mathematical_models: List[MathematicalEquation] = []
    physiological_models: List[PhysiologicalModel] = []
    diagnostic_models: List[DiagnosticModel] = []
    prognostic_models: List[PrognosticModel] = []
    
    # Prognosis
    prognosis: Dict[str, str] = {}
    complications: List[str] = []
    
    # Monitoring
    monitoring_parameters: List[str] = []
    follow_up_schedule: Optional[str] = None
    
    # Metadata
    clinical_data_filled: bool = False
    ai_enhanced: bool = False
    mathematical_models_added: bool = False
    last_updated: datetime
    model_version: str
    data_sources: List[str] = []
    
    # Quality metrics
    completeness_score: Optional[float] = None  # 0-100
    validation_status: Optional[str] = None


# ============================================================================
# STANDARD MATHEMATICAL EQUATIONS LIBRARY
# ============================================================================

STANDARD_EQUATIONS = {
    # Cardiovascular
    "cardiac_output": {
        "name": "Cardiac Output (Fick Equation)",
        "category": "physiologic",
        "equation": "CO = VO2 / (CaO2 - CvO2)",
        "variables": {
            "CO": "Cardiac Output (L/min)",
            "VO2": "Oxygen consumption (mL/min)",
            "CaO2": "Arterial oxygen content (mL/dL)",
            "CvO2": "Venous oxygen content (mL/dL)"
        },
        "normal_range": "4-8 L/min",
        "interpretation": "Measures the volume of blood pumped by the heart per minute"
    },
    "map": {
        "name": "Mean Arterial Pressure",
        "category": "physiologic",
        "equation": "MAP = DBP + (1/3)(SBP - DBP)",
        "variables": {
            "MAP": "Mean Arterial Pressure (mmHg)",
            "SBP": "Systolic Blood Pressure (mmHg)",
            "DBP": "Diastolic Blood Pressure (mmHg)"
        },
        "normal_range": "70-105 mmHg",
        "clinical_thresholds": {
            "<65": "Inadequate organ perfusion",
            "65-70": "Target in septic shock",
            ">105": "Hypertension"
        }
    },
    "ejection_fraction": {
        "name": "Ejection Fraction",
        "category": "diagnostic",
        "equation": "EF = (EDV - ESV) / EDV × 100",
        "variables": {
            "EF": "Ejection Fraction (%)",
            "EDV": "End-Diastolic Volume (mL)",
            "ESV": "End-Systolic Volume (mL)"
        },
        "normal_range": "55-70%",
        "clinical_thresholds": {
            "≥55": "Normal (HFpEF if symptomatic)",
            "40-54": "Mildly reduced (HFmrEF)",
            "<40": "Reduced (HFrEF)"
        }
    },
    
    # Renal
    "gfr_ckd_epi": {
        "name": "GFR (CKD-EPI 2021)",
        "category": "diagnostic",
        "equation": "GFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^-1.200 × 0.9938^Age × (1.012 if female)",
        "variables": {
            "GFR": "Glomerular Filtration Rate (mL/min/1.73m²)",
            "Scr": "Serum Creatinine (mg/dL)",
            "κ": "0.7 (female) or 0.9 (male)",
            "α": "-0.241 (female) or -0.302 (male)",
            "Age": "Age in years"
        },
        "clinical_thresholds": {
            "≥90": "G1 - Normal or high",
            "60-89": "G2 - Mildly decreased",
            "45-59": "G3a - Mildly to moderately decreased",
            "30-44": "G3b - Moderately to severely decreased",
            "15-29": "G4 - Severely decreased",
            "<15": "G5 - Kidney failure"
        }
    },
    "creatinine_clearance": {
        "name": "Creatinine Clearance (Cockcroft-Gault)",
        "category": "pharmacokinetic",
        "equation": "CrCl = [(140 - Age) × Weight × (0.85 if female)] / (72 × Scr)",
        "variables": {
            "CrCl": "Creatinine Clearance (mL/min)",
            "Age": "Age in years",
            "Weight": "Actual body weight (kg)",
            "Scr": "Serum Creatinine (mg/dL)"
        },
        "when_to_use": "Drug dosing adjustments in renal impairment"
    },
    
    # Acid-Base
    "henderson_hasselbalch": {
        "name": "Henderson-Hasselbalch Equation",
        "category": "physiologic",
        "equation": "pH = 6.1 + log([HCO3-] / (0.03 × pCO2))",
        "variables": {
            "pH": "Blood pH",
            "HCO3-": "Bicarbonate (mEq/L)",
            "pCO2": "Partial pressure of CO2 (mmHg)"
        },
        "normal_range": "pH 7.35-7.45",
        "interpretation": "Determines acid-base status based on metabolic (HCO3) and respiratory (pCO2) components"
    },
    "anion_gap": {
        "name": "Anion Gap",
        "category": "diagnostic",
        "equation": "AG = Na+ - (Cl- + HCO3-)",
        "variables": {
            "AG": "Anion Gap (mEq/L)",
            "Na+": "Sodium (mEq/L)",
            "Cl-": "Chloride (mEq/L)",
            "HCO3-": "Bicarbonate (mEq/L)"
        },
        "normal_range": "8-12 mEq/L",
        "clinical_thresholds": {
            ">12": "High anion gap metabolic acidosis (HAGMA)",
            "8-12": "Normal",
            "<8": "Low anion gap (hypoalbuminemia, myeloma)"
        }
    },
    
    # Respiratory
    "aa_gradient": {
        "name": "A-a Gradient",
        "category": "diagnostic",
        "equation": "A-a = [(FiO2 × (Patm - PH2O)) - (PaCO2/0.8)] - PaO2",
        "variables": {
            "A-a": "Alveolar-arterial gradient (mmHg)",
            "FiO2": "Fraction of inspired oxygen",
            "Patm": "Atmospheric pressure (760 mmHg at sea level)",
            "PH2O": "Water vapor pressure (47 mmHg)",
            "PaCO2": "Arterial CO2 (mmHg)",
            "PaO2": "Arterial O2 (mmHg)"
        },
        "normal_range": "Age/4 + 4 (increases with age)",
        "interpretation": "Elevated A-a gradient suggests V/Q mismatch, shunt, or diffusion impairment"
    },
    
    # Hematology
    "corrected_calcium": {
        "name": "Corrected Calcium",
        "category": "diagnostic",
        "equation": "Corrected Ca = Measured Ca + 0.8 × (4.0 - Albumin)",
        "variables": {
            "Corrected Ca": "Corrected Calcium (mg/dL)",
            "Measured Ca": "Measured Calcium (mg/dL)",
            "Albumin": "Serum Albumin (g/dL)"
        },
        "normal_range": "8.5-10.5 mg/dL",
        "when_to_use": "When albumin is abnormal, to estimate true calcium status"
    },
    "reticulocyte_index": {
        "name": "Reticulocyte Production Index",
        "category": "diagnostic",
        "equation": "RPI = (Retic% × Hct/45) / Maturation Factor",
        "variables": {
            "RPI": "Reticulocyte Production Index",
            "Retic%": "Reticulocyte percentage",
            "Hct": "Hematocrit (%)",
            "Maturation Factor": "1.0 (Hct 45), 1.5 (Hct 35), 2.0 (Hct 25), 2.5 (Hct 15)"
        },
        "clinical_thresholds": {
            ">2": "Adequate marrow response (hemolysis, blood loss)",
            "<2": "Inadequate response (production problem)"
        }
    },
    
    # Diagnostic Probability
    "bayes_theorem": {
        "name": "Bayes' Theorem for Diagnostic Testing",
        "category": "diagnostic",
        "equation": "Post-test Odds = Pre-test Odds × Likelihood Ratio",
        "variables": {
            "Pre-test Odds": "Prior Probability / (1 - Prior Probability)",
            "LR+": "Sensitivity / (1 - Specificity)",
            "LR-": "(1 - Sensitivity) / Specificity",
            "Post-test Probability": "Post-test Odds / (1 + Post-test Odds)"
        },
        "interpretation": "Calculates post-test probability given pre-test probability and test characteristics"
    },
    
    # Pharmacokinetics
    "half_life": {
        "name": "Drug Half-Life",
        "category": "pharmacokinetic",
        "equation": "t1/2 = (0.693 × Vd) / CL",
        "variables": {
            "t1/2": "Half-life (hours)",
            "Vd": "Volume of distribution (L)",
            "CL": "Clearance (L/hr)"
        },
        "interpretation": "Time for drug concentration to decrease by 50%"
    },
    "steady_state": {
        "name": "Time to Steady State",
        "category": "pharmacokinetic",
        "equation": "Tss = 4-5 × t1/2",
        "variables": {
            "Tss": "Time to steady state",
            "t1/2": "Half-life"
        },
        "interpretation": "Drug reaches ~97% of steady state after 5 half-lives"
    },
    
    # Clinical Scores
    "wells_pe": {
        "name": "Wells Score for Pulmonary Embolism",
        "category": "prognostic",
        "equation": "Score = Σ(Clinical signs of DVT: 3) + (PE most likely: 3) + (HR>100: 1.5) + (Immobilization/Surgery: 1.5) + (Previous DVT/PE: 1.5) + (Hemoptysis: 1) + (Malignancy: 1)",
        "clinical_thresholds": {
            "≤4": "PE unlikely (<15%)",
            ">4": "PE likely (>15%)"
        },
        "when_to_use": "Risk stratification for suspected pulmonary embolism"
    },
    "chadsvasc": {
        "name": "CHA₂DS₂-VASc Score",
        "category": "prognostic",
        "equation": "Score = CHF(1) + HTN(1) + Age≥75(2) + DM(1) + Stroke/TIA(2) + Vascular disease(1) + Age 65-74(1) + Female(1)",
        "clinical_thresholds": {
            "0 (male)": "No anticoagulation",
            "1 (male)": "Consider anticoagulation",
            "≥2": "Anticoagulation recommended"
        },
        "when_to_use": "Stroke risk stratification in atrial fibrillation"
    },
    "hasbled": {
        "name": "HAS-BLED Score",
        "category": "prognostic",
        "equation": "Score = HTN(1) + Abnormal renal/liver(1 each) + Stroke(1) + Bleeding(1) + Labile INR(1) + Elderly>65(1) + Drugs/alcohol(1 each)",
        "clinical_thresholds": {
            "0-2": "Low bleeding risk",
            "≥3": "High bleeding risk - caution with anticoagulation"
        }
    },
    "meld": {
        "name": "MELD Score",
        "category": "prognostic",
        "equation": "MELD = 10 × (0.957 × ln(Cr) + 0.378 × ln(Bilirubin) + 1.120 × ln(INR) + 0.643)",
        "variables": {
            "Cr": "Creatinine (mg/dL, min 1, max 4)",
            "Bilirubin": "Total Bilirubin (mg/dL, min 1)",
            "INR": "International Normalized Ratio (min 1)"
        },
        "when_to_use": "Liver transplant prioritization, 3-month mortality prediction"
    },
    "apache_ii": {
        "name": "APACHE II Score",
        "category": "prognostic",
        "equation": "Score = Acute Physiology Score (0-60) + Age Points (0-6) + Chronic Health Points (0-5)",
        "interpretation": "ICU mortality prediction; higher scores indicate worse prognosis"
    },
    "sofa": {
        "name": "SOFA Score",
        "category": "prognostic",
        "equation": "Score = Respiration(0-4) + Coagulation(0-4) + Liver(0-4) + Cardiovascular(0-4) + CNS(0-4) + Renal(0-4)",
        "clinical_thresholds": {
            "≥2 increase": "Sepsis (with suspected infection)",
            "<2": "Low mortality risk",
            "≥11": "High mortality risk (>80%)"
        }
    }
}

# Categories of diseases for systematic enhancement
DISEASE_CATEGORIES = [
    "cardiovascular",
    "respiratory", 
    "gastrointestinal",
    "neurological",
    "endocrine",
    "rheumatological",
    "infectious",
    "hematological",
    "renal",
    "hepatic",
    "oncology",
    "psychiatric",
    "dermatological",
    "ophthalmology",
    "otolaryngology",
    "gynecology",
    "obstetrics",
    "pediatric",
    "genetic",
    "emergency",
    "musculoskeletal"
]
