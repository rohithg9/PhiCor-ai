"""
PhiCor Disease Enhancement Engine
==================================
This script systematically enhances all diseases in the database with:
1. Complete parameter modifications for all affected organ systems
2. Symptoms and clinical signs with sensitivity/specificity
3. Diagnostic tests and criteria
4. Treatment protocols with medications
5. Mathematical models and equations
6. Prognostic models and scores

Usage:
    python disease_enhancement_engine.py --category cardiovascular --batch-size 10
    python disease_enhancement_engine.py --all --batch-size 5
"""

import asyncio
import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from motor.motor_asyncio import AsyncIOMotorClient

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import LLM client
try:
    from emergentintegrations.llm.chat import chat, LlmModel
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    logger.warning("emergentintegrations not available, using mock mode")

# Standard mathematical equations to add based on disease category
CATEGORY_EQUATIONS = {
    "cardiovascular": [
        {
            "name": "Cardiac Output (Fick Equation)",
            "category": "physiologic",
            "equation": "CO = VO₂ / (CaO₂ - CvO₂)",
            "equation_latex": r"CO = \frac{VO_2}{C_aO_2 - C_vO_2}",
            "variables": {
                "CO": {"description": "Cardiac Output", "unit": "L/min", "normal": "4-8"},
                "VO₂": {"description": "Oxygen consumption", "unit": "mL/min", "normal": "200-250"},
                "CaO₂": {"description": "Arterial oxygen content", "unit": "mL/dL", "normal": "18-20"},
                "CvO₂": {"description": "Venous oxygen content", "unit": "mL/dL", "normal": "13-15"}
            },
            "interpretation": "Measures the volume of blood pumped by the heart per minute. Decreased in heart failure, shock states.",
            "clinical_application": "Assessment of cardiac function, hemodynamic monitoring in ICU",
            "limitations": ["Requires invasive measurements", "Assumes steady-state conditions"]
        },
        {
            "name": "Mean Arterial Pressure (MAP)",
            "category": "physiologic",
            "equation": "MAP = DBP + ⅓(SBP - DBP)",
            "equation_latex": r"MAP = DBP + \frac{1}{3}(SBP - DBP)",
            "variables": {
                "MAP": {"description": "Mean Arterial Pressure", "unit": "mmHg", "normal": "70-105"},
                "SBP": {"description": "Systolic Blood Pressure", "unit": "mmHg", "normal": "90-120"},
                "DBP": {"description": "Diastolic Blood Pressure", "unit": "mmHg", "normal": "60-80"}
            },
            "interpretation": "Average arterial pressure during a cardiac cycle. Target >65 mmHg for organ perfusion.",
            "clinical_thresholds": {
                "<65": "Inadequate organ perfusion - vasopressor support needed",
                "65-70": "Target in septic shock (initial)",
                "80-85": "Target in acute stroke",
                ">105": "Hypertensive - consider antihypertensive therapy"
            }
        },
        {
            "name": "Ejection Fraction",
            "category": "diagnostic",
            "equation": "EF = (EDV - ESV) / EDV × 100%",
            "equation_latex": r"EF = \frac{EDV - ESV}{EDV} \times 100\%",
            "variables": {
                "EF": {"description": "Ejection Fraction", "unit": "%", "normal": "55-70"},
                "EDV": {"description": "End-Diastolic Volume", "unit": "mL", "normal": "95-145"},
                "ESV": {"description": "End-Systolic Volume", "unit": "mL", "normal": "35-75"}
            },
            "interpretation": "Percentage of blood ejected from the ventricle with each contraction.",
            "clinical_thresholds": {
                "≥55%": "Normal (HFpEF if symptomatic)",
                "40-54%": "Mildly reduced (HFmrEF)",
                "<40%": "Reduced (HFrEF)",
                "<20%": "Severely reduced - high mortality risk"
            }
        },
        {
            "name": "CHA₂DS₂-VASc Score",
            "category": "prognostic",
            "equation": "Score = C(1) + H(1) + A₂(2) + D(1) + S₂(2) + V(1) + A(1) + Sc(1)",
            "variables": {
                "C": {"description": "Congestive heart failure", "points": 1},
                "H": {"description": "Hypertension", "points": 1},
                "A₂": {"description": "Age ≥75 years", "points": 2},
                "D": {"description": "Diabetes mellitus", "points": 1},
                "S₂": {"description": "Stroke/TIA/thromboembolism", "points": 2},
                "V": {"description": "Vascular disease", "points": 1},
                "A": {"description": "Age 65-74 years", "points": 1},
                "Sc": {"description": "Sex category (female)", "points": 1}
            },
            "interpretation": "Estimates annual stroke risk in atrial fibrillation",
            "clinical_thresholds": {
                "0 (male)": "1.3% annual stroke risk - no anticoagulation",
                "1": "2.2% annual stroke risk - consider anticoagulation",
                "2": "3.2% annual stroke risk - anticoagulation recommended",
                "≥3": ">4.8% annual stroke risk - anticoagulation strongly recommended"
            }
        }
    ],
    "respiratory": [
        {
            "name": "A-a Gradient",
            "category": "diagnostic",
            "equation": "A-a = PAO₂ - PaO₂ = [FiO₂(Patm - PH₂O) - PaCO₂/R] - PaO₂",
            "equation_latex": r"A-a = [FiO_2(P_{atm} - P_{H_2O}) - \frac{PaCO_2}{R}] - PaO_2",
            "variables": {
                "A-a": {"description": "Alveolar-arterial gradient", "unit": "mmHg", "normal": "Age/4 + 4"},
                "FiO₂": {"description": "Fraction of inspired oxygen", "unit": "decimal", "normal": "0.21"},
                "Patm": {"description": "Atmospheric pressure", "unit": "mmHg", "normal": "760"},
                "PH₂O": {"description": "Water vapor pressure", "unit": "mmHg", "normal": "47"},
                "PaCO₂": {"description": "Arterial CO₂", "unit": "mmHg", "normal": "35-45"},
                "R": {"description": "Respiratory quotient", "unit": "ratio", "normal": "0.8"},
                "PaO₂": {"description": "Arterial O₂", "unit": "mmHg", "normal": "80-100"}
            },
            "interpretation": "Measures efficiency of oxygen transfer across alveolar-capillary membrane",
            "clinical_application": "Differentiates causes of hypoxemia. Normal A-a = hypoventilation; Elevated A-a = V/Q mismatch, shunt, or diffusion impairment"
        },
        {
            "name": "PaO₂/FiO₂ Ratio (P/F Ratio)",
            "category": "diagnostic",
            "equation": "P/F = PaO₂ / FiO₂",
            "equation_latex": r"P/F = \frac{PaO_2}{FiO_2}",
            "variables": {
                "P/F": {"description": "P/F Ratio", "unit": "mmHg", "normal": ">400"},
                "PaO₂": {"description": "Arterial oxygen tension", "unit": "mmHg"},
                "FiO₂": {"description": "Fraction of inspired oxygen", "unit": "decimal"}
            },
            "interpretation": "Assesses severity of hypoxemic respiratory failure",
            "clinical_thresholds": {
                ">400": "Normal oxygenation",
                "300-400": "Mild impairment",
                "200-300": "Moderate ARDS",
                "100-200": "Severe ARDS",
                "<100": "Very severe hypoxemia"
            }
        }
    ],
    "renal": [
        {
            "name": "GFR (CKD-EPI 2021)",
            "category": "diagnostic",
            "equation": "GFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^-1.200 × 0.9938^Age × (1.012 if female)",
            "variables": {
                "GFR": {"description": "Glomerular Filtration Rate", "unit": "mL/min/1.73m²", "normal": "≥90"},
                "Scr": {"description": "Serum Creatinine", "unit": "mg/dL"},
                "κ": {"description": "Sex-specific constant", "value": "0.7 (female), 0.9 (male)"},
                "α": {"description": "Sex-specific exponent", "value": "-0.241 (female), -0.302 (male)"},
                "Age": {"description": "Age in years", "unit": "years"}
            },
            "interpretation": "Estimates kidney filtration function",
            "clinical_thresholds": {
                "≥90": "G1 - Normal or high",
                "60-89": "G2 - Mildly decreased",
                "45-59": "G3a - Mildly to moderately decreased",
                "30-44": "G3b - Moderately to severely decreased",
                "15-29": "G4 - Severely decreased",
                "<15": "G5 - Kidney failure"
            }
        },
        {
            "name": "Fractional Excretion of Sodium (FENa)",
            "category": "diagnostic",
            "equation": "FENa = (UNa × PCr) / (PNa × UCr) × 100%",
            "equation_latex": r"FENa = \frac{U_{Na} \times P_{Cr}}{P_{Na} \times U_{Cr}} \times 100\%",
            "variables": {
                "UNa": {"description": "Urine Sodium", "unit": "mEq/L"},
                "PNa": {"description": "Plasma Sodium", "unit": "mEq/L"},
                "UCr": {"description": "Urine Creatinine", "unit": "mg/dL"},
                "PCr": {"description": "Plasma Creatinine", "unit": "mg/dL"}
            },
            "interpretation": "Differentiates prerenal from intrinsic renal AKI",
            "clinical_thresholds": {
                "<1%": "Prerenal azotemia (volume responsive)",
                ">2%": "Intrinsic renal failure (ATN)",
                "1-2%": "Indeterminate"
            },
            "limitations": ["Not valid if on diuretics", "Use FEUrea instead in diuretic use"]
        }
    ],
    "endocrine": [
        {
            "name": "Corrected Calcium",
            "category": "diagnostic",
            "equation": "Ca_corrected = Ca_measured + 0.8 × (4.0 - Albumin)",
            "equation_latex": r"Ca_{corrected} = Ca_{measured} + 0.8 \times (4.0 - Albumin)",
            "variables": {
                "Ca_corrected": {"description": "Corrected Calcium", "unit": "mg/dL", "normal": "8.5-10.5"},
                "Ca_measured": {"description": "Measured Calcium", "unit": "mg/dL"},
                "Albumin": {"description": "Serum Albumin", "unit": "g/dL", "normal": "3.5-5.0"}
            },
            "interpretation": "Adjusts calcium for protein binding when albumin is abnormal",
            "clinical_application": "Essential when albumin is low (e.g., nephrotic syndrome, cirrhosis, malnutrition)"
        },
        {
            "name": "HOMA-IR",
            "category": "diagnostic",
            "equation": "HOMA-IR = (Fasting Glucose × Fasting Insulin) / 405",
            "variables": {
                "HOMA-IR": {"description": "Homeostatic Model Assessment of Insulin Resistance", "unit": "index"},
                "Fasting Glucose": {"description": "Fasting plasma glucose", "unit": "mg/dL"},
                "Fasting Insulin": {"description": "Fasting insulin", "unit": "μU/mL"}
            },
            "interpretation": "Estimates insulin resistance",
            "clinical_thresholds": {
                "<1.0": "Normal insulin sensitivity",
                "1.0-2.0": "Possible early insulin resistance",
                ">2.0": "Significant insulin resistance",
                ">2.5": "Insulin resistance consistent with metabolic syndrome"
            }
        }
    ],
    "hematological": [
        {
            "name": "Reticulocyte Production Index (RPI)",
            "category": "diagnostic",
            "equation": "RPI = (Retic% × Hct/45) / Maturation Factor",
            "variables": {
                "RPI": {"description": "Reticulocyte Production Index", "unit": "index"},
                "Retic%": {"description": "Reticulocyte percentage", "unit": "%"},
                "Hct": {"description": "Hematocrit", "unit": "%"},
                "Maturation Factor": {"description": "Correction for marrow stress", "values": "1.0 (Hct 45), 1.5 (Hct 35), 2.0 (Hct 25), 2.5 (Hct 15)"}
            },
            "interpretation": "Assesses adequacy of bone marrow response to anemia",
            "clinical_thresholds": {
                ">2": "Adequate marrow response - suggests hemolysis or blood loss",
                "<2": "Inadequate response - suggests production problem"
            }
        }
    ],
    "gastrointestinal": [
        {
            "name": "MELD Score",
            "category": "prognostic",
            "equation": "MELD = 10 × [0.957 × ln(Cr) + 0.378 × ln(Bili) + 1.120 × ln(INR) + 0.643]",
            "variables": {
                "Cr": {"description": "Creatinine", "unit": "mg/dL", "bounds": "min 1, max 4"},
                "Bili": {"description": "Total Bilirubin", "unit": "mg/dL", "bounds": "min 1"},
                "INR": {"description": "International Normalized Ratio", "bounds": "min 1"}
            },
            "interpretation": "Predicts 3-month mortality in cirrhosis; used for liver transplant prioritization",
            "clinical_thresholds": {
                "<10": "~2% 3-month mortality",
                "10-19": "~6% 3-month mortality",
                "20-29": "~20% 3-month mortality",
                "30-39": "~53% 3-month mortality",
                "≥40": "~71% 3-month mortality"
            }
        },
        {
            "name": "Child-Pugh Score",
            "category": "prognostic",
            "equation": "Score = Σ(Encephalopathy + Ascites + Bilirubin + Albumin + INR)",
            "components": [
                {"parameter": "Encephalopathy", "1_point": "None", "2_points": "Grade 1-2", "3_points": "Grade 3-4"},
                {"parameter": "Ascites", "1_point": "None", "2_points": "Mild", "3_points": "Moderate-Severe"},
                {"parameter": "Bilirubin (mg/dL)", "1_point": "<2", "2_points": "2-3", "3_points": ">3"},
                {"parameter": "Albumin (g/dL)", "1_point": ">3.5", "2_points": "2.8-3.5", "3_points": "<2.8"},
                {"parameter": "INR", "1_point": "<1.7", "2_points": "1.7-2.3", "3_points": ">2.3"}
            ],
            "interpretation": "Assesses severity of cirrhosis",
            "clinical_thresholds": {
                "5-6 (Class A)": "Well-compensated, 100% 1-year survival",
                "7-9 (Class B)": "Significant functional compromise, 80% 1-year survival",
                "10-15 (Class C)": "Decompensated, 45% 1-year survival"
            }
        }
    ],
    "infectious": [
        {
            "name": "qSOFA Score",
            "category": "prognostic",
            "equation": "Score = (RR ≥22: 1) + (Altered mentation: 1) + (SBP ≤100: 1)",
            "variables": {
                "RR": {"description": "Respiratory Rate", "threshold": "≥22/min", "points": 1},
                "Mental status": {"description": "Altered mentation", "threshold": "GCS <15", "points": 1},
                "SBP": {"description": "Systolic Blood Pressure", "threshold": "≤100 mmHg", "points": 1}
            },
            "interpretation": "Quick bedside screen for sepsis outside the ICU",
            "clinical_thresholds": {
                "0-1": "Low risk - continue monitoring",
                "≥2": "High risk of poor outcome - assess for organ dysfunction"
            }
        },
        {
            "name": "SOFA Score",
            "category": "prognostic",
            "equation": "Score = Respiration + Coagulation + Liver + Cardiovascular + CNS + Renal (each 0-4)",
            "components": [
                {"system": "Respiration (PaO2/FiO2)", "0": "≥400", "1": "300-399", "2": "200-299", "3": "100-199 with ventilation", "4": "<100 with ventilation"},
                {"system": "Coagulation (Platelets ×10³)", "0": "≥150", "1": "100-149", "2": "50-99", "3": "20-49", "4": "<20"},
                {"system": "Liver (Bilirubin mg/dL)", "0": "<1.2", "1": "1.2-1.9", "2": "2.0-5.9", "3": "6.0-11.9", "4": "≥12"},
                {"system": "Cardiovascular (MAP/Pressors)", "0": "MAP ≥70", "1": "MAP <70", "2": "Low dose dopamine", "3": "Mod dose dopamine/epi", "4": "High dose pressors"},
                {"system": "CNS (GCS)", "0": "15", "1": "13-14", "2": "10-12", "3": "6-9", "4": "<6"},
                {"system": "Renal (Creatinine/UOP)", "0": "<1.2", "1": "1.2-1.9", "2": "2.0-3.4", "3": "3.5-4.9 or UOP<500", "4": "≥5 or UOP<200"}
            ],
            "interpretation": "Assesses organ dysfunction; increase of ≥2 points defines sepsis",
            "clinical_thresholds": {
                "<6": "~10% mortality",
                "6-9": "~20% mortality",
                "10-12": "~50% mortality",
                ">12": ">80% mortality"
            }
        }
    ]
}

# Enhancement prompts
ENHANCEMENT_PROMPT = """You are a medical expert AI assistant helping to build a comprehensive clinical knowledge base.

For the disease "{disease_name}" (ICD-10: {icd_code}, Category: {category}), provide COMPLETE and ACCURATE medical information.

Current data available:
{current_data}

Please enhance this disease entry with the following sections. Be thorough, evidence-based, and clinically accurate:

1. SYMPTOMS (provide 5-10 key symptoms):
For each symptom provide:
- name: symptom name
- description: detailed description
- frequency: "always" (>90%), "common" (50-90%), "occasional" (10-50%), "rare" (<10%)
- onset: "acute", "subacute", "chronic", "insidious"
- sensitivity: percentage (0-100)
- specificity: percentage (0-100)
- associated_symptoms: list of related symptoms
- red_flags: warning signs

2. CLINICAL_SIGNS (provide 5-10 physical exam findings):
For each sign provide:
- name: sign name
- description: what is observed
- examination_technique: how to elicit the sign
- frequency: frequency in this disease
- sensitivity: percentage
- specificity: percentage
- interpretation: clinical meaning

3. DIAGNOSTIC_TESTS (provide 5-10 key tests):
For each test provide:
- name: test name
- type: "laboratory", "imaging", "pathology", "genetic", "functional", "clinical_score"
- description: what the test measures
- sensitivity: percentage
- specificity: percentage
- expected_result: what to expect in this disease
- normal_range: normal reference range
- interpretation_guide: how to interpret results

4. TREATMENTS (provide 3-5 treatment approaches):
For each treatment provide:
- name: treatment name
- type: "pharmacological", "surgical", "interventional", "supportive", "lifestyle"
- description: how it works
- indication: when to use
- first_line: true/false
- medications (if pharmacological): list with generic_name, dose, route, frequency, duration
- monitoring: what to monitor
- efficacy_evidence: strength of evidence

5. PARAMETER_ENHANCEMENTS:
For each organ system already listed, add any missing parameters with:
- direction: "increase", "decrease", "variable"
- magnitude: "mild", "moderate", "severe"
- typical_value: expected value in this disease
- normal_range: reference range
- unit: measurement unit
- sensitivity/specificity: if known

Return the response as valid JSON with these exact keys:
{
  "symptoms": [...],
  "clinical_signs": [...],
  "diagnostic_tests": [...],
  "treatments": [...],
  "parameter_enhancements": {...},
  "differential_diagnosis": [...],
  "complications": [...],
  "prognosis": {...}
}

Be comprehensive but accurate. Include sensitivity/specificity values based on medical literature where known."""


class DiseaseEnhancementEngine:
    def __init__(self, mongo_url: str, db_name: str, llm_key: str = None):
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        self.llm_key = llm_key
        self.stats = {
            "total_processed": 0,
            "successfully_enhanced": 0,
            "failed": 0,
            "skipped": 0
        }
    
    async def get_diseases_by_category(self, category: str = None, limit: int = 100) -> List[Dict]:
        """Get diseases to enhance, optionally filtered by category"""
        query = {}
        if category:
            query["category"] = category
        
        # Prioritize diseases that haven't been fully enhanced
        diseases = await self.db.diseases.find(
            query,
            {"_id": 0}
        ).limit(limit).to_list(limit)
        
        return diseases
    
    async def calculate_completeness_score(self, disease: Dict) -> float:
        """Calculate how complete a disease entry is (0-100)"""
        score = 0
        max_score = 100
        
        # Basic info (10 points)
        if disease.get("description"): score += 2
        if disease.get("pathophysiology"): score += 3
        if disease.get("epidemiology"): score += 3
        if disease.get("synonyms"): score += 2
        
        # Clinical presentation (25 points)
        symptoms = disease.get("symptoms") or disease.get("clinical_presentation", {}).get("symptoms", [])
        if len(symptoms) >= 5: score += 10
        elif len(symptoms) >= 3: score += 5
        
        signs = disease.get("clinical_signs") or disease.get("clinical_presentation", {}).get("signs", [])
        if len(signs) >= 5: score += 10
        elif len(signs) >= 3: score += 5
        
        if disease.get("typical_presentation"): score += 5
        
        # Parameters (25 points)
        pm = disease.get("parameter_modifications", {})
        organ_count = len(pm)
        if organ_count >= 7: score += 15
        elif organ_count >= 5: score += 10
        elif organ_count >= 3: score += 5
        
        # Check parameter completeness
        param_completeness = 0
        for organ, data in pm.items():
            params = data.get("parameters", {})
            for param_name, param_data in params.items():
                if param_data.get("sensitivity"): param_completeness += 1
                if param_data.get("normal_range"): param_completeness += 1
        score += min(10, param_completeness)
        
        # Diagnostics (20 points)
        tests = disease.get("diagnostic_tests", [])
        if len(tests) >= 5: score += 10
        elif len(tests) >= 3: score += 5
        
        if disease.get("diagnostic_criteria"): score += 5
        if disease.get("differential_diagnosis") and len(disease["differential_diagnosis"]) >= 3: score += 5
        
        # Treatment (15 points)
        treatments = disease.get("treatments", [])
        if len(treatments) >= 3: score += 10
        elif len(treatments) >= 1: score += 5
        
        if disease.get("first_line_treatment"): score += 5
        
        # Mathematical models (5 points)
        models = disease.get("mathematical_models", [])
        if len(models) >= 2: score += 5
        elif len(models) >= 1: score += 3
        
        return min(100, score)
    
    async def enhance_disease_with_ai(self, disease: Dict) -> Dict:
        """Use AI to enhance disease data"""
        if not LLM_AVAILABLE or not self.llm_key:
            logger.warning(f"LLM not available, skipping AI enhancement for {disease.get('name')}")
            return disease
        
        try:
            prompt = ENHANCEMENT_PROMPT.format(
                disease_name=disease.get("name", "Unknown"),
                icd_code=disease.get("icd10_code", "Unknown"),
                category=disease.get("category", "Unknown"),
                current_data=json.dumps({
                    "description": disease.get("description", ""),
                    "pathophysiology": disease.get("pathophysiology", {}),
                    "parameter_modifications": list(disease.get("parameter_modifications", {}).keys()),
                    "current_symptoms_count": len(disease.get("symptoms", [])),
                    "current_tests_count": len(disease.get("diagnostic_tests", []))
                }, indent=2)
            )
            
            response = await asyncio.to_thread(
                chat,
                api_key=self.llm_key,
                prompt=prompt,
                model=LlmModel.GPT4O,
                response_format={"type": "json_object"}
            )
            
            enhancement_data = json.loads(response.message)
            
            # Merge enhancement data with existing disease
            enhanced_disease = disease.copy()
            
            # Add/update symptoms
            if enhancement_data.get("symptoms"):
                enhanced_disease["symptoms"] = enhancement_data["symptoms"]
            
            # Add/update clinical signs
            if enhancement_data.get("clinical_signs"):
                enhanced_disease["clinical_signs"] = enhancement_data["clinical_signs"]
            
            # Add/update diagnostic tests
            if enhancement_data.get("diagnostic_tests"):
                enhanced_disease["diagnostic_tests"] = enhancement_data["diagnostic_tests"]
            
            # Add/update treatments
            if enhancement_data.get("treatments"):
                enhanced_disease["treatments"] = enhancement_data["treatments"]
            
            # Enhance parameters
            if enhancement_data.get("parameter_enhancements"):
                for organ, params in enhancement_data["parameter_enhancements"].items():
                    if organ in enhanced_disease.get("parameter_modifications", {}):
                        # Merge with existing
                        for param_name, param_data in params.items():
                            if "parameters" not in enhanced_disease["parameter_modifications"][organ]:
                                enhanced_disease["parameter_modifications"][organ]["parameters"] = {}
                            enhanced_disease["parameter_modifications"][organ]["parameters"][param_name] = param_data
            
            # Add differential diagnosis
            if enhancement_data.get("differential_diagnosis"):
                enhanced_disease["differential_diagnosis"] = enhancement_data["differential_diagnosis"]
            
            # Add complications
            if enhancement_data.get("complications"):
                enhanced_disease["complications"] = enhancement_data["complications"]
            
            # Add prognosis
            if enhancement_data.get("prognosis"):
                enhanced_disease["prognosis"] = enhancement_data["prognosis"]
            
            return enhanced_disease
            
        except Exception as e:
            logger.error(f"AI enhancement failed for {disease.get('name')}: {e}")
            return disease
    
    def add_mathematical_models(self, disease: Dict) -> Dict:
        """Add relevant mathematical models based on disease category"""
        category = disease.get("category", "").lower()
        
        # Get category-specific equations
        equations = CATEGORY_EQUATIONS.get(category, [])
        
        # Add general equations that apply to many diseases
        general_equations = [
            {
                "name": "Bayes' Theorem for Diagnostic Testing",
                "category": "diagnostic",
                "equation": "Post-test Probability = (Sensitivity × Prior) / [(Sensitivity × Prior) + (1-Specificity) × (1-Prior)]",
                "variables": {
                    "Prior": {"description": "Pre-test probability", "range": "0-1"},
                    "Sensitivity": {"description": "True positive rate", "range": "0-1"},
                    "Specificity": {"description": "True negative rate", "range": "0-1"}
                },
                "interpretation": "Calculates probability of disease after a positive test result",
                "clinical_application": "Essential for interpreting any diagnostic test in context of clinical suspicion"
            }
        ]
        
        # Combine and add to disease
        all_models = equations + general_equations
        
        if "mathematical_models" not in disease:
            disease["mathematical_models"] = []
        
        # Add models that aren't already present
        existing_names = {m.get("name") for m in disease.get("mathematical_models", [])}
        for model in all_models:
            if model["name"] not in existing_names:
                disease["mathematical_models"].append(model)
        
        return disease
    
    async def enhance_single_disease(self, disease: Dict, use_ai: bool = True) -> Dict:
        """Enhance a single disease with all available methods"""
        logger.info(f"Enhancing: {disease.get('name')}")
        
        # Calculate initial completeness
        initial_score = await self.calculate_completeness_score(disease)
        
        # Add mathematical models
        disease = self.add_mathematical_models(disease)
        
        # Use AI enhancement if available and needed
        if use_ai and initial_score < 80:
            disease = await self.enhance_disease_with_ai(disease)
        
        # Calculate final completeness
        final_score = await self.calculate_completeness_score(disease)
        disease["completeness_score"] = final_score
        
        # Update metadata
        disease["ai_enhanced"] = True
        disease["mathematical_models_added"] = True
        disease["last_updated"] = datetime.now(timezone.utc).isoformat()
        disease["model_version"] = "3.0-enhanced"
        
        logger.info(f"Enhanced {disease.get('name')}: {initial_score:.1f}% -> {final_score:.1f}%")
        
        return disease
    
    async def save_disease(self, disease: Dict):
        """Save enhanced disease to database"""
        await self.db.diseases.update_one(
            {"id": disease["id"]},
            {"$set": disease},
            upsert=True
        )
    
    async def run_enhancement(self, category: str = None, limit: int = 10, use_ai: bool = True):
        """Run enhancement on diseases"""
        logger.info(f"Starting enhancement - Category: {category or 'all'}, Limit: {limit}")
        
        diseases = await self.get_diseases_by_category(category, limit)
        logger.info(f"Found {len(diseases)} diseases to process")
        
        for disease in diseases:
            try:
                enhanced = await self.enhance_single_disease(disease, use_ai)
                await self.save_disease(enhanced)
                self.stats["successfully_enhanced"] += 1
            except Exception as e:
                logger.error(f"Failed to enhance {disease.get('name')}: {e}")
                self.stats["failed"] += 1
            
            self.stats["total_processed"] += 1
        
        logger.info(f"Enhancement complete: {self.stats}")
        return self.stats
    
    async def get_completeness_report(self) -> Dict:
        """Generate a completeness report for all diseases"""
        diseases = await self.db.diseases.find({}, {"_id": 0}).to_list(3000)
        
        report = {
            "total_diseases": len(diseases),
            "by_category": {},
            "by_completeness": {
                "excellent (90-100%)": 0,
                "good (70-89%)": 0,
                "moderate (50-69%)": 0,
                "poor (30-49%)": 0,
                "minimal (<30%)": 0
            },
            "average_completeness": 0,
            "diseases_needing_enhancement": []
        }
        
        total_score = 0
        
        for disease in diseases:
            score = await self.calculate_completeness_score(disease)
            total_score += score
            
            category = disease.get("category", "unknown")
            if category not in report["by_category"]:
                report["by_category"][category] = {"count": 0, "avg_score": 0, "total_score": 0}
            report["by_category"][category]["count"] += 1
            report["by_category"][category]["total_score"] += score
            
            if score >= 90:
                report["by_completeness"]["excellent (90-100%)"] += 1
            elif score >= 70:
                report["by_completeness"]["good (70-89%)"] += 1
            elif score >= 50:
                report["by_completeness"]["moderate (50-69%)"] += 1
            elif score >= 30:
                report["by_completeness"]["poor (30-49%)"] += 1
            else:
                report["by_completeness"]["minimal (<30%)"] += 1
                report["diseases_needing_enhancement"].append({
                    "name": disease.get("name"),
                    "category": category,
                    "score": score
                })
        
        report["average_completeness"] = total_score / len(diseases) if diseases else 0
        
        # Calculate category averages
        for cat, data in report["by_category"].items():
            data["avg_score"] = data["total_score"] / data["count"] if data["count"] > 0 else 0
            del data["total_score"]
        
        return report


async def main():
    """Main entry point for the enhancement engine"""
    import argparse
    
    parser = argparse.ArgumentParser(description="PhiCor Disease Enhancement Engine")
    parser.add_argument("--category", type=str, help="Disease category to enhance")
    parser.add_argument("--limit", type=int, default=10, help="Number of diseases to process")
    parser.add_argument("--all", action="store_true", help="Process all categories")
    parser.add_argument("--report", action="store_true", help="Generate completeness report")
    parser.add_argument("--no-ai", action="store_true", help="Skip AI enhancement")
    
    args = parser.parse_args()
    
    # Get configuration
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "test_database")
    llm_key = os.environ.get("EMERGENT_LLM_KEY")
    
    engine = DiseaseEnhancementEngine(mongo_url, db_name, llm_key)
    
    if args.report:
        report = await engine.get_completeness_report()
        print(json.dumps(report, indent=2))
    else:
        await engine.run_enhancement(
            category=args.category if not args.all else None,
            limit=args.limit,
            use_ai=not args.no_ai
        )


if __name__ == "__main__":
    asyncio.run(main())
