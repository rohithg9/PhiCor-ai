/**
 * PhiCor Clinical Calculators & Scoring Systems
 * Comprehensive medical calculations, grading systems, diagnostic criteria
 * 
 * Categories:
 * - Cardiovascular
 * - Pulmonary/Respiratory
 * - Neurological
 * - Renal/Nephrology
 * - Hepatology/GI
 * - Infectious Disease
 * - Hematology
 * - Endocrine
 * - Rheumatology
 * - Emergency/Critical Care
 * - Oncology
 * - General/Utility
 */

export const CLINICAL_CALCULATORS = {
  
  // ============== CARDIOVASCULAR ==============
  cardiovascular: {
    name: "Cardiovascular",
    icon: "🫀",
    calculators: [
      {
        id: "cha2ds2_vasc",
        name: "CHA₂DS₂-VASc Score",
        category: "Risk Stratification",
        description: "Stroke risk in atrial fibrillation",
        usage: "Annual stroke risk estimation in non-valvular AF",
        inputs: [
          { id: "chf", name: "Congestive Heart Failure", type: "boolean", points: 1 },
          { id: "hypertension", name: "Hypertension", type: "boolean", points: 1 },
          { id: "age_75", name: "Age ≥75", type: "boolean", points: 2 },
          { id: "diabetes", name: "Diabetes Mellitus", type: "boolean", points: 1 },
          { id: "stroke_tia", name: "Stroke/TIA/Thromboembolism", type: "boolean", points: 2 },
          { id: "vascular", name: "Vascular Disease (MI, PAD, aortic plaque)", type: "boolean", points: 1 },
          { id: "age_65_74", name: "Age 65-74", type: "boolean", points: 1 },
          { id: "female", name: "Sex Category (Female)", type: "boolean", points: 1 }
        ],
        formula: "Sum of all points",
        interpretation: [
          { range: [0, 0], risk: "0%", recommendation: "No anticoagulation (or aspirin)" },
          { range: [1, 1], risk: "1.3%", recommendation: "Oral anticoagulation preferred" },
          { range: [2, 2], risk: "2.2%", recommendation: "Oral anticoagulation recommended" },
          { range: [3, 3], risk: "3.2%", recommendation: "Oral anticoagulation recommended" },
          { range: [4, 4], risk: "4.0%", recommendation: "Oral anticoagulation recommended" },
          { range: [5, 5], risk: "6.7%", recommendation: "Oral anticoagulation recommended" },
          { range: [6, 9], risk: "9.8-15.2%", recommendation: "Oral anticoagulation strongly recommended" }
        ],
        evidence: "ESC Guidelines 2020",
        reference: "Lip GY et al. Chest 2010"
      },
      {
        id: "has_bled",
        name: "HAS-BLED Score",
        category: "Risk Stratification",
        description: "Bleeding risk on anticoagulation",
        usage: "Assess major bleeding risk in AF patients on anticoagulation",
        inputs: [
          { id: "hypertension", name: "Hypertension (uncontrolled, >160 mmHg systolic)", type: "boolean", points: 1 },
          { id: "renal", name: "Abnormal Renal Function (dialysis, transplant, Cr >2.26)", type: "boolean", points: 1 },
          { id: "liver", name: "Abnormal Liver Function (cirrhosis, bilirubin >2x, AST/ALT >3x)", type: "boolean", points: 1 },
          { id: "stroke", name: "Stroke History", type: "boolean", points: 1 },
          { id: "bleeding", name: "Bleeding History or Predisposition", type: "boolean", points: 1 },
          { id: "inr", name: "Labile INR (TTR <60%)", type: "boolean", points: 1 },
          { id: "elderly", name: "Elderly (>65 years)", type: "boolean", points: 1 },
          { id: "drugs", name: "Drugs (antiplatelet, NSAIDs)", type: "boolean", points: 1 },
          { id: "alcohol", name: "Alcohol (≥8 drinks/week)", type: "boolean", points: 1 }
        ],
        formula: "Sum of all points (max 9)",
        interpretation: [
          { range: [0, 0], risk: "0.9%/year", recommendation: "Low risk" },
          { range: [1, 1], risk: "3.4%/year", recommendation: "Low-intermediate risk" },
          { range: [2, 2], risk: "4.1%/year", recommendation: "Intermediate risk - caution advised" },
          { range: [3, 9], risk: "5.8-12.5%/year", recommendation: "High risk - consider alternatives, close monitoring" }
        ],
        evidence: "ESC Guidelines",
        reference: "Pisters R et al. Chest 2010"
      },
      {
        id: "heart_score",
        name: "HEART Score",
        category: "Risk Stratification",
        description: "Major adverse cardiac events risk in chest pain",
        usage: "Risk stratify ED chest pain patients for MACE at 6 weeks",
        inputs: [
          { id: "history", name: "History", type: "select", options: [
            { value: 0, label: "Slightly suspicious" },
            { value: 1, label: "Moderately suspicious" },
            { value: 2, label: "Highly suspicious" }
          ]},
          { id: "ecg", name: "ECG", type: "select", options: [
            { value: 0, label: "Normal" },
            { value: 1, label: "Non-specific repolarization disturbance" },
            { value: 2, label: "Significant ST depression" }
          ]},
          { id: "age", name: "Age", type: "select", options: [
            { value: 0, label: "<45 years" },
            { value: 1, label: "45-64 years" },
            { value: 2, label: "≥65 years" }
          ]},
          { id: "risk_factors", name: "Risk Factors", type: "select", options: [
            { value: 0, label: "No known risk factors" },
            { value: 1, label: "1-2 risk factors" },
            { value: 2, label: "≥3 risk factors or known atherosclerotic disease" }
          ]},
          { id: "troponin", name: "Initial Troponin", type: "select", options: [
            { value: 0, label: "≤ normal limit" },
            { value: 1, label: "1-3× normal limit" },
            { value: 2, label: ">3× normal limit" }
          ]}
        ],
        formula: "Sum of all components (0-10)",
        interpretation: [
          { range: [0, 3], risk: "0.9-1.7%", recommendation: "Low risk - consider early discharge" },
          { range: [4, 6], risk: "12-16.6%", recommendation: "Intermediate - observation, serial troponins" },
          { range: [7, 10], risk: "50-65%", recommendation: "High risk - admit, early invasive strategy" }
        ],
        evidence: "Validated in multiple studies",
        reference: "Six AJ et al. Int J Cardiol 2008"
      },
      {
        id: "timi_stemi",
        name: "TIMI Risk Score (STEMI)",
        category: "Risk Stratification",
        description: "30-day mortality in STEMI",
        usage: "Predict 30-day mortality after STEMI",
        inputs: [
          { id: "age", name: "Age", type: "select", options: [
            { value: 0, label: "<65 years" },
            { value: 2, label: "65-74 years" },
            { value: 3, label: "≥75 years" }
          ]},
          { id: "diabetes_htn_angina", name: "DM, HTN, or Angina", type: "boolean", points: 1 },
          { id: "systolic_bp", name: "Systolic BP <100 mmHg", type: "boolean", points: 3 },
          { id: "heart_rate", name: "Heart Rate >100 bpm", type: "boolean", points: 2 },
          { id: "killip", name: "Killip Class II-IV", type: "boolean", points: 2 },
          { id: "weight", name: "Weight <67 kg", type: "boolean", points: 1 },
          { id: "anterior_lbbb", name: "Anterior STE or LBBB", type: "boolean", points: 1 },
          { id: "time_to_treatment", name: "Time to treatment >4 hours", type: "boolean", points: 1 }
        ],
        formula: "Sum of points (0-14)",
        interpretation: [
          { range: [0, 0], risk: "0.8%", recommendation: "Very low risk" },
          { range: [1, 1], risk: "1.6%", recommendation: "Low risk" },
          { range: [2, 2], risk: "2.2%", recommendation: "Low risk" },
          { range: [3, 3], risk: "4.4%", recommendation: "Moderate risk" },
          { range: [4, 4], risk: "7.3%", recommendation: "Moderate risk" },
          { range: [5, 5], risk: "12.4%", recommendation: "High risk" },
          { range: [6, 6], risk: "16.1%", recommendation: "High risk" },
          { range: [7, 7], risk: "23.4%", recommendation: "Very high risk" },
          { range: [8, 14], risk: "26.8-35.9%", recommendation: "Very high risk" }
        ],
        evidence: "InTIME II trial",
        reference: "Morrow DA et al. Circulation 2000"
      },
      {
        id: "wells_dvt",
        name: "Wells Score for DVT",
        category: "Diagnostic",
        description: "Probability of deep vein thrombosis",
        usage: "Clinical probability assessment before D-dimer/imaging",
        inputs: [
          { id: "active_cancer", name: "Active cancer (treatment within 6 months)", type: "boolean", points: 1 },
          { id: "paralysis", name: "Paralysis, paresis, or recent cast of lower extremity", type: "boolean", points: 1 },
          { id: "bedridden", name: "Bedridden >3 days or major surgery within 12 weeks", type: "boolean", points: 1 },
          { id: "tenderness", name: "Localized tenderness along deep venous system", type: "boolean", points: 1 },
          { id: "leg_swelling", name: "Entire leg swollen", type: "boolean", points: 1 },
          { id: "calf_swelling", name: "Calf swelling >3 cm compared to other leg", type: "boolean", points: 1 },
          { id: "pitting_edema", name: "Pitting edema (greater in symptomatic leg)", type: "boolean", points: 1 },
          { id: "collateral_veins", name: "Collateral superficial veins (non-varicose)", type: "boolean", points: 1 },
          { id: "previous_dvt", name: "Previously documented DVT", type: "boolean", points: 1 },
          { id: "alternative_diagnosis", name: "Alternative diagnosis as likely or more likely", type: "boolean", points: -2 }
        ],
        formula: "Sum of points",
        interpretation: [
          { range: [-2, 0], risk: "5%", recommendation: "Low probability - D-dimer, if negative DVT excluded" },
          { range: [1, 2], risk: "17%", recommendation: "Moderate probability - D-dimer or ultrasound" },
          { range: [3, 9], risk: "53%", recommendation: "High probability - ultrasound recommended" }
        ],
        evidence: "Extensively validated",
        reference: "Wells PS et al. Lancet 1997"
      },
      {
        id: "wells_pe",
        name: "Wells Score for PE",
        category: "Diagnostic",
        description: "Probability of pulmonary embolism",
        usage: "Pre-test probability before CTPA/V-Q scan",
        inputs: [
          { id: "dvt_symptoms", name: "Clinical signs/symptoms of DVT", type: "boolean", points: 3 },
          { id: "pe_most_likely", name: "PE is #1 diagnosis or equally likely", type: "boolean", points: 3 },
          { id: "heart_rate", name: "Heart rate >100 bpm", type: "boolean", points: 1.5 },
          { id: "immobilization", name: "Immobilization ≥3 days or surgery in past 4 weeks", type: "boolean", points: 1.5 },
          { id: "previous_pe_dvt", name: "Previous PE or DVT", type: "boolean", points: 1.5 },
          { id: "hemoptysis", name: "Hemoptysis", type: "boolean", points: 1 },
          { id: "malignancy", name: "Malignancy (treatment within 6 months or palliative)", type: "boolean", points: 1 }
        ],
        formula: "Sum of points",
        interpretation: [
          { range: [0, 1], risk: "1.3%", recommendation: "Low probability - D-dimer can rule out" },
          { range: [2, 6], risk: "16.2%", recommendation: "Moderate probability - D-dimer or imaging" },
          { range: [6.5, 12.5], risk: "37.5%", recommendation: "High probability - imaging indicated" }
        ],
        evidence: "Christopher Study",
        reference: "Wells PS et al. Ann Intern Med 2001"
      },
      {
        id: "framingham_risk",
        name: "Framingham Risk Score",
        category: "Risk Stratification",
        description: "10-year cardiovascular disease risk",
        usage: "Primary prevention risk assessment",
        inputs: [
          { id: "age", name: "Age (years)", type: "number", min: 30, max: 79 },
          { id: "sex", name: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }] },
          { id: "total_cholesterol", name: "Total Cholesterol (mg/dL)", type: "number", min: 100, max: 400 },
          { id: "hdl", name: "HDL Cholesterol (mg/dL)", type: "number", min: 20, max: 100 },
          { id: "systolic_bp", name: "Systolic BP (mmHg)", type: "number", min: 90, max: 200 },
          { id: "bp_treatment", name: "On BP Treatment", type: "boolean" },
          { id: "smoking", name: "Current Smoker", type: "boolean" },
          { id: "diabetes", name: "Diabetes", type: "boolean" }
        ],
        formula: "Complex age/sex-specific calculation",
        interpretation: [
          { range: [0, 5], risk: "<5%", recommendation: "Low risk - lifestyle modification" },
          { range: [5, 7.5], risk: "5-7.5%", recommendation: "Borderline - consider risk enhancers" },
          { range: [7.5, 20], risk: "7.5-20%", recommendation: "Intermediate - statin consideration" },
          { range: [20, 100], risk: ">20%", recommendation: "High risk - statin recommended" }
        ],
        evidence: "Framingham Heart Study",
        reference: "D'Agostino RB et al. Circulation 2008"
      },
      {
        id: "nyha_class",
        name: "NYHA Functional Classification",
        category: "Disease Staging",
        description: "Heart failure symptom severity",
        usage: "Classify HF severity, guide therapy",
        inputs: [
          { id: "class", name: "Functional Class", type: "select", options: [
            { value: 1, label: "Class I: No limitation of physical activity" },
            { value: 2, label: "Class II: Slight limitation - comfortable at rest, ordinary activity causes symptoms" },
            { value: 3, label: "Class III: Marked limitation - comfortable at rest, less than ordinary activity causes symptoms" },
            { value: 4, label: "Class IV: Unable to carry out any activity without symptoms, symptoms at rest" }
          ]}
        ],
        formula: "Direct classification",
        interpretation: [
          { range: [1, 1], risk: "NYHA I", recommendation: "Lifestyle modification, ACEi/ARB, beta-blocker if EF reduced" },
          { range: [2, 2], risk: "NYHA II", recommendation: "Add diuretics prn, consider MRA if EF ≤35%" },
          { range: [3, 3], risk: "NYHA III", recommendation: "Optimize medications, consider CRT/ICD if indicated" },
          { range: [4, 4], risk: "NYHA IV", recommendation: "IV diuretics, inotropes consideration, advanced therapies" }
        ],
        evidence: "AHA/ACC Guidelines",
        reference: "NYHA Criteria Committee 1994"
      }
    ]
  },

  // ============== PULMONARY/RESPIRATORY ==============
  respiratory: {
    name: "Pulmonary",
    icon: "🫁",
    calculators: [
      {
        id: "curb65",
        name: "CURB-65 Score",
        category: "Risk Stratification",
        description: "Pneumonia severity and mortality risk",
        usage: "Determine site of care for community-acquired pneumonia",
        inputs: [
          { id: "confusion", name: "Confusion (new onset)", type: "boolean", points: 1 },
          { id: "urea", name: "Urea >7 mmol/L (BUN >19 mg/dL)", type: "boolean", points: 1 },
          { id: "respiratory_rate", name: "Respiratory Rate ≥30/min", type: "boolean", points: 1 },
          { id: "blood_pressure", name: "BP: Systolic <90 or Diastolic ≤60 mmHg", type: "boolean", points: 1 },
          { id: "age", name: "Age ≥65 years", type: "boolean", points: 1 }
        ],
        formula: "Sum of points (0-5)",
        interpretation: [
          { range: [0, 1], risk: "0.7-2.1%", recommendation: "Low risk - outpatient treatment" },
          { range: [2, 2], risk: "9.2%", recommendation: "Moderate risk - consider short inpatient or supervised outpatient" },
          { range: [3, 5], risk: "14.5-57%", recommendation: "High risk - hospitalize, consider ICU if score 4-5" }
        ],
        evidence: "BTS Guidelines",
        reference: "Lim WS et al. Thorax 2003"
      },
      {
        id: "psi_port",
        name: "PSI/PORT Score",
        category: "Risk Stratification",
        description: "Pneumonia Severity Index",
        usage: "Predict 30-day mortality in CAP",
        inputs: [
          { id: "age", name: "Age (years)", type: "number" },
          { id: "female", name: "Female Sex", type: "boolean", points: -10 },
          { id: "nursing_home", name: "Nursing Home Resident", type: "boolean", points: 10 },
          { id: "neoplastic", name: "Neoplastic Disease", type: "boolean", points: 30 },
          { id: "liver", name: "Liver Disease", type: "boolean", points: 20 },
          { id: "chf", name: "Congestive Heart Failure", type: "boolean", points: 10 },
          { id: "cvd", name: "Cerebrovascular Disease", type: "boolean", points: 10 },
          { id: "renal", name: "Renal Disease", type: "boolean", points: 10 },
          { id: "altered_mental", name: "Altered Mental Status", type: "boolean", points: 20 },
          { id: "rr_30", name: "Respiratory Rate ≥30", type: "boolean", points: 20 },
          { id: "sbp_90", name: "Systolic BP <90", type: "boolean", points: 20 },
          { id: "temp", name: "Temperature <35°C or ≥40°C", type: "boolean", points: 15 },
          { id: "pulse_125", name: "Pulse ≥125/min", type: "boolean", points: 10 },
          { id: "ph_735", name: "Arterial pH <7.35", type: "boolean", points: 30 },
          { id: "bun", name: "BUN ≥30 mg/dL", type: "boolean", points: 20 },
          { id: "sodium", name: "Sodium <130 mEq/L", type: "boolean", points: 20 },
          { id: "glucose", name: "Glucose ≥250 mg/dL", type: "boolean", points: 10 },
          { id: "hematocrit", name: "Hematocrit <30%", type: "boolean", points: 10 },
          { id: "pao2", name: "PaO2 <60 mmHg or SpO2 <90%", type: "boolean", points: 10 },
          { id: "effusion", name: "Pleural Effusion", type: "boolean", points: 10 }
        ],
        formula: "Age + sum of points (female = age - 10)",
        interpretation: [
          { range: [0, 50], risk: "0.1%", recommendation: "Class I: Outpatient" },
          { range: [51, 70], risk: "0.6%", recommendation: "Class II: Outpatient" },
          { range: [71, 90], risk: "0.9-2.8%", recommendation: "Class III: Brief observation" },
          { range: [91, 130], risk: "8.2-9.3%", recommendation: "Class IV: Inpatient" },
          { range: [131, 500], risk: "27-31%", recommendation: "Class V: Inpatient/ICU" }
        ],
        evidence: "PORT validation study",
        reference: "Fine MJ et al. NEJM 1997"
      },
      {
        id: "aa_gradient",
        name: "A-a Gradient",
        category: "Diagnostic",
        description: "Alveolar-arterial oxygen gradient",
        usage: "Assess oxygenation efficiency, V/Q matching",
        inputs: [
          { id: "age", name: "Age (years)", type: "number" },
          { id: "fio2", name: "FiO2 (fraction, e.g., 0.21 for room air)", type: "number", min: 0.21, max: 1.0 },
          { id: "paco2", name: "PaCO2 (mmHg)", type: "number" },
          { id: "pao2", name: "PaO2 (mmHg)", type: "number" },
          { id: "patm", name: "Atmospheric Pressure (mmHg)", type: "number", default: 760 }
        ],
        formula: "A-a = PAO2 - PaO2; PAO2 = FiO2 × (Patm - 47) - (PaCO2/0.8)",
        latex: "A\\text{-}a = [FiO_2 \\times (P_{atm} - 47) - \\frac{PaCO_2}{0.8}] - PaO_2",
        interpretation: [
          { range: [0, 10], risk: "Normal for young adults", recommendation: "Expected gradient = (Age/4) + 4" },
          { range: [10, 20], risk: "Mildly elevated", recommendation: "May indicate early V/Q mismatch" },
          { range: [20, 100], risk: "Significantly elevated", recommendation: "V/Q mismatch, shunt, or diffusion defect" }
        ],
        evidence: "Physiological calculation",
        reference: "West JB. Respiratory Physiology"
      },
      {
        id: "gold_copd",
        name: "GOLD COPD Classification",
        category: "Disease Staging",
        description: "COPD severity staging",
        usage: "Guide COPD treatment strategy",
        inputs: [
          { id: "fev1", name: "FEV1 % Predicted (post-bronchodilator)", type: "number" },
          { id: "exacerbations", name: "Exacerbations in past year", type: "number" },
          { id: "hospitalization", name: "Hospitalization for exacerbation", type: "boolean" },
          { id: "cat_score", name: "CAT Score", type: "number", min: 0, max: 40 },
          { id: "mmrc", name: "mMRC Dyspnea Grade", type: "select", options: [
            { value: 0, label: "0: Dyspnea only with strenuous exercise" },
            { value: 1, label: "1: Dyspnea when hurrying or walking up slight hill" },
            { value: 2, label: "2: Walks slower than people of same age or stops for breath" },
            { value: 3, label: "3: Stops after walking 100m or few minutes on level ground" },
            { value: 4, label: "4: Too breathless to leave house or breathless when dressing" }
          ]}
        ],
        formula: "FEV1 for airflow limitation + symptoms/exacerbations for ABCD grouping",
        interpretation: [
          { range: [80, 100], risk: "GOLD 1 (Mild)", recommendation: "FEV1 ≥80% predicted" },
          { range: [50, 79], risk: "GOLD 2 (Moderate)", recommendation: "50% ≤ FEV1 < 80% predicted" },
          { range: [30, 49], risk: "GOLD 3 (Severe)", recommendation: "30% ≤ FEV1 < 50% predicted" },
          { range: [0, 29], risk: "GOLD 4 (Very Severe)", recommendation: "FEV1 < 30% predicted" }
        ],
        evidence: "GOLD 2023 Report",
        reference: "Global Initiative for COPD"
      },
      {
        id: "bode_index",
        name: "BODE Index",
        category: "Prognosis",
        description: "COPD mortality predictor",
        usage: "Predict 4-year mortality in COPD",
        inputs: [
          { id: "bmi", name: "BMI (kg/m²)", type: "select", options: [
            { value: 0, label: ">21" },
            { value: 1, label: "≤21" }
          ]},
          { id: "fev1", name: "FEV1 % Predicted", type: "select", options: [
            { value: 0, label: "≥65%" },
            { value: 1, label: "50-64%" },
            { value: 2, label: "36-49%" },
            { value: 3, label: "≤35%" }
          ]},
          { id: "mmrc", name: "mMRC Dyspnea Scale", type: "select", options: [
            { value: 0, label: "0-1" },
            { value: 1, label: "2" },
            { value: 2, label: "3" },
            { value: 3, label: "4" }
          ]},
          { id: "six_min_walk", name: "6-Minute Walk Distance", type: "select", options: [
            { value: 0, label: "≥350 m" },
            { value: 1, label: "250-349 m" },
            { value: 2, label: "150-249 m" },
            { value: 3, label: "≤149 m" }
          ]}
        ],
        formula: "Sum of points (0-10)",
        interpretation: [
          { range: [0, 2], risk: "20% 4-year mortality", recommendation: "Quartile 1" },
          { range: [3, 4], risk: "30% 4-year mortality", recommendation: "Quartile 2" },
          { range: [5, 6], risk: "40% 4-year mortality", recommendation: "Quartile 3" },
          { range: [7, 10], risk: "80% 4-year mortality", recommendation: "Quartile 4 - consider transplant evaluation" }
        ],
        evidence: "BODE Cohort Study",
        reference: "Celli BR et al. NEJM 2004"
      }
    ]
  },

  // ============== NEUROLOGICAL ==============
  neurological: {
    name: "Neurological",
    icon: "🧠",
    calculators: [
      {
        id: "gcs",
        name: "Glasgow Coma Scale",
        category: "Assessment",
        description: "Level of consciousness assessment",
        usage: "Standardized assessment of consciousness, TBI severity",
        inputs: [
          { id: "eye", name: "Eye Opening", type: "select", options: [
            { value: 4, label: "4: Spontaneous" },
            { value: 3, label: "3: To voice" },
            { value: 2, label: "2: To pain" },
            { value: 1, label: "1: None" }
          ]},
          { id: "verbal", name: "Verbal Response", type: "select", options: [
            { value: 5, label: "5: Oriented" },
            { value: 4, label: "4: Confused" },
            { value: 3, label: "3: Inappropriate words" },
            { value: 2, label: "2: Incomprehensible sounds" },
            { value: 1, label: "1: None" }
          ]},
          { id: "motor", name: "Motor Response", type: "select", options: [
            { value: 6, label: "6: Obeys commands" },
            { value: 5, label: "5: Localizes pain" },
            { value: 4, label: "4: Withdraws from pain" },
            { value: 3, label: "3: Abnormal flexion (decorticate)" },
            { value: 2, label: "2: Extension (decerebrate)" },
            { value: 1, label: "1: None" }
          ]}
        ],
        formula: "E + V + M (range 3-15)",
        interpretation: [
          { range: [13, 15], risk: "Mild TBI", recommendation: "GCS 13-15" },
          { range: [9, 12], risk: "Moderate TBI", recommendation: "GCS 9-12" },
          { range: [3, 8], risk: "Severe TBI", recommendation: "GCS ≤8 - intubation indicated" }
        ],
        evidence: "Universal standard",
        reference: "Teasdale G, Jennett B. Lancet 1974"
      },
      {
        id: "nihss",
        name: "NIH Stroke Scale",
        category: "Assessment",
        description: "Stroke severity assessment",
        usage: "Quantify stroke severity, guide thrombolysis, predict outcome",
        inputs: [
          { id: "loc", name: "1a. Level of Consciousness", type: "select", options: [
            { value: 0, label: "0: Alert" },
            { value: 1, label: "1: Not alert, arousable by minor stimulation" },
            { value: 2, label: "2: Not alert, requires repeated stimulation" },
            { value: 3, label: "3: Unresponsive" }
          ]},
          { id: "loc_questions", name: "1b. LOC Questions (month, age)", type: "select", options: [
            { value: 0, label: "0: Answers both correctly" },
            { value: 1, label: "1: Answers one correctly" },
            { value: 2, label: "2: Answers neither correctly" }
          ]},
          { id: "loc_commands", name: "1c. LOC Commands (open/close eyes, grip/release)", type: "select", options: [
            { value: 0, label: "0: Performs both correctly" },
            { value: 1, label: "1: Performs one correctly" },
            { value: 2, label: "2: Performs neither correctly" }
          ]},
          { id: "gaze", name: "2. Best Gaze", type: "select", options: [
            { value: 0, label: "0: Normal" },
            { value: 1, label: "1: Partial gaze palsy" },
            { value: 2, label: "2: Forced deviation or total gaze paresis" }
          ]},
          { id: "visual", name: "3. Visual Fields", type: "select", options: [
            { value: 0, label: "0: No visual loss" },
            { value: 1, label: "1: Partial hemianopia" },
            { value: 2, label: "2: Complete hemianopia" },
            { value: 3, label: "3: Bilateral hemianopia (blind)" }
          ]},
          { id: "facial", name: "4. Facial Palsy", type: "select", options: [
            { value: 0, label: "0: Normal" },
            { value: 1, label: "1: Minor paralysis (flattened nasolabial fold)" },
            { value: 2, label: "2: Partial paralysis (lower face)" },
            { value: 3, label: "3: Complete paralysis (upper and lower face)" }
          ]},
          { id: "motor_arm_left", name: "5a. Motor Arm (Left)", type: "select", options: [
            { value: 0, label: "0: No drift (holds for 10 sec)" },
            { value: 1, label: "1: Drift" },
            { value: 2, label: "2: Some effort against gravity" },
            { value: 3, label: "3: No effort against gravity" },
            { value: 4, label: "4: No movement" }
          ]},
          { id: "motor_arm_right", name: "5b. Motor Arm (Right)", type: "select", options: [
            { value: 0, label: "0: No drift" },
            { value: 1, label: "1: Drift" },
            { value: 2, label: "2: Some effort against gravity" },
            { value: 3, label: "3: No effort against gravity" },
            { value: 4, label: "4: No movement" }
          ]},
          { id: "motor_leg_left", name: "6a. Motor Leg (Left)", type: "select", options: [
            { value: 0, label: "0: No drift (holds for 5 sec)" },
            { value: 1, label: "1: Drift" },
            { value: 2, label: "2: Some effort against gravity" },
            { value: 3, label: "3: No effort against gravity" },
            { value: 4, label: "4: No movement" }
          ]},
          { id: "motor_leg_right", name: "6b. Motor Leg (Right)", type: "select", options: [
            { value: 0, label: "0: No drift" },
            { value: 1, label: "1: Drift" },
            { value: 2, label: "2: Some effort against gravity" },
            { value: 3, label: "3: No effort against gravity" },
            { value: 4, label: "4: No movement" }
          ]},
          { id: "ataxia", name: "7. Limb Ataxia", type: "select", options: [
            { value: 0, label: "0: Absent" },
            { value: 1, label: "1: Present in one limb" },
            { value: 2, label: "2: Present in two limbs" }
          ]},
          { id: "sensory", name: "8. Sensory", type: "select", options: [
            { value: 0, label: "0: Normal" },
            { value: 1, label: "1: Mild-moderate sensory loss" },
            { value: 2, label: "2: Severe or total sensory loss" }
          ]},
          { id: "language", name: "9. Best Language", type: "select", options: [
            { value: 0, label: "0: No aphasia" },
            { value: 1, label: "1: Mild-moderate aphasia" },
            { value: 2, label: "2: Severe aphasia" },
            { value: 3, label: "3: Mute or global aphasia" }
          ]},
          { id: "dysarthria", name: "10. Dysarthria", type: "select", options: [
            { value: 0, label: "0: Normal" },
            { value: 1, label: "1: Mild-moderate dysarthria" },
            { value: 2, label: "2: Severe dysarthria" }
          ]},
          { id: "neglect", name: "11. Extinction/Inattention", type: "select", options: [
            { value: 0, label: "0: No abnormality" },
            { value: 1, label: "1: Partial neglect" },
            { value: 2, label: "2: Complete neglect" }
          ]}
        ],
        formula: "Sum of all items (0-42)",
        interpretation: [
          { range: [0, 0], risk: "No stroke symptoms", recommendation: "Consider stroke mimic" },
          { range: [1, 4], risk: "Minor stroke", recommendation: "Consider tPA if within window" },
          { range: [5, 15], risk: "Moderate stroke", recommendation: "tPA if eligible, consider thrombectomy if LVO" },
          { range: [16, 20], risk: "Moderate-severe stroke", recommendation: "tPA + thrombectomy evaluation" },
          { range: [21, 42], risk: "Severe stroke", recommendation: "Poor prognosis, thrombectomy if LVO" }
        ],
        evidence: "Multiple stroke trials",
        reference: "Brott T et al. Stroke 1989"
      },
      {
        id: "hunt_hess",
        name: "Hunt & Hess Grade",
        category: "Disease Staging",
        description: "Subarachnoid hemorrhage severity",
        usage: "Predict outcome, guide surgical timing in SAH",
        inputs: [
          { id: "grade", name: "Clinical Grade", type: "select", options: [
            { value: 1, label: "Grade 1: Asymptomatic or mild headache, slight nuchal rigidity" },
            { value: 2, label: "Grade 2: Moderate-severe headache, nuchal rigidity, no neurological deficit except cranial nerve palsy" },
            { value: 3, label: "Grade 3: Drowsy, confused, or mild focal deficit" },
            { value: 4, label: "Grade 4: Stupor, moderate-severe hemiparesis, early decerebrate rigidity" },
            { value: 5, label: "Grade 5: Deep coma, decerebrate rigidity, moribund appearance" }
          ]}
        ],
        formula: "Direct grading",
        interpretation: [
          { range: [1, 1], risk: "~1% mortality", recommendation: "Good prognosis - early surgery" },
          { range: [2, 2], risk: "~5% mortality", recommendation: "Good prognosis - early surgery" },
          { range: [3, 3], risk: "~19% mortality", recommendation: "Intermediate - optimize before surgery" },
          { range: [4, 4], risk: "~42% mortality", recommendation: "Poor grade - supportive care, consider delayed surgery" },
          { range: [5, 5], risk: "~77% mortality", recommendation: "Very poor prognosis" }
        ],
        evidence: "Neurosurgical standard",
        reference: "Hunt WE, Hess RM. J Neurosurg 1968"
      },
      {
        id: "fisher_grade",
        name: "Fisher Grade (Modified)",
        category: "Risk Stratification",
        description: "SAH vasospasm risk based on CT findings",
        usage: "Predict delayed cerebral ischemia risk",
        inputs: [
          { id: "grade", name: "CT Findings", type: "select", options: [
            { value: 1, label: "Grade 1: Focal or diffuse thin SAH, no IVH" },
            { value: 2, label: "Grade 2: Focal or diffuse thin SAH, with IVH" },
            { value: 3, label: "Grade 3: Focal or diffuse thick SAH, no IVH" },
            { value: 4, label: "Grade 4: Focal or diffuse thick SAH, with IVH" }
          ]}
        ],
        formula: "Direct grading based on CT",
        interpretation: [
          { range: [1, 1], risk: "24% vasospasm", recommendation: "Low risk for DCI" },
          { range: [2, 2], risk: "33% vasospasm", recommendation: "Moderate risk for DCI" },
          { range: [3, 3], risk: "33% vasospasm", recommendation: "Moderate risk for DCI" },
          { range: [4, 4], risk: "40% vasospasm", recommendation: "High risk for DCI - close monitoring" }
        ],
        evidence: "SAH outcome studies",
        reference: "Claassen J et al. Stroke 2001"
      }
    ]
  },

  // ============== RENAL ==============
  renal: {
    name: "Renal",
    icon: "🫘",
    calculators: [
      {
        id: "ckd_epi",
        name: "CKD-EPI eGFR",
        category: "Diagnostic",
        description: "Estimated glomerular filtration rate",
        usage: "CKD staging, drug dosing, kidney function assessment",
        inputs: [
          { id: "creatinine", name: "Serum Creatinine (mg/dL)", type: "number", min: 0.1, max: 20 },
          { id: "age", name: "Age (years)", type: "number", min: 18, max: 100 },
          { id: "sex", name: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }] },
          { id: "race", name: "Race", type: "select", options: [{ value: "black", label: "Black" }, { value: "other", label: "Other" }] }
        ],
        formula: "141 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^-1.209 × 0.993^Age × [1.018 if female] × [1.159 if black]",
        latex: "eGFR = 141 \\times \\min(\\frac{Scr}{\\kappa}, 1)^{\\alpha} \\times \\max(\\frac{Scr}{\\kappa}, 1)^{-1.209} \\times 0.993^{Age}",
        interpretation: [
          { range: [90, 200], risk: "G1: Normal or high", recommendation: "≥90 mL/min/1.73m²" },
          { range: [60, 89], risk: "G2: Mildly decreased", recommendation: "60-89 mL/min/1.73m²" },
          { range: [45, 59], risk: "G3a: Mild-moderate decrease", recommendation: "45-59 mL/min/1.73m²" },
          { range: [30, 44], risk: "G3b: Moderate-severe decrease", recommendation: "30-44 mL/min/1.73m²" },
          { range: [15, 29], risk: "G4: Severely decreased", recommendation: "15-29 mL/min/1.73m²" },
          { range: [0, 14], risk: "G5: Kidney failure", recommendation: "<15 mL/min/1.73m² - consider RRT" }
        ],
        evidence: "KDIGO 2021",
        reference: "Levey AS et al. Ann Intern Med 2009"
      },
      {
        id: "fena",
        name: "Fractional Excretion of Sodium (FENa)",
        category: "Diagnostic",
        description: "Differentiate prerenal from intrinsic AKI",
        usage: "Determine cause of acute kidney injury",
        inputs: [
          { id: "urine_na", name: "Urine Sodium (mEq/L)", type: "number" },
          { id: "serum_na", name: "Serum Sodium (mEq/L)", type: "number" },
          { id: "urine_cr", name: "Urine Creatinine (mg/dL)", type: "number" },
          { id: "serum_cr", name: "Serum Creatinine (mg/dL)", type: "number" }
        ],
        formula: "FENa = (UNa × SCr) / (SNa × UCr) × 100",
        latex: "FENa = \\frac{U_{Na} \\times S_{Cr}}{S_{Na} \\times U_{Cr}} \\times 100",
        interpretation: [
          { range: [0, 1], risk: "<1%: Prerenal", recommendation: "Volume responsive AKI" },
          { range: [1, 2], risk: "1-2%: Indeterminate", recommendation: "Consider context (diuretics, contrast)" },
          { range: [2, 100], risk: ">2%: Intrinsic", recommendation: "ATN or intrinsic renal disease" }
        ],
        evidence: "Classic nephrology calculation",
        reference: "Espinel CH. JAMA 1976"
      },
      {
        id: "urine_anion_gap",
        name: "Urine Anion Gap",
        category: "Diagnostic",
        description: "Differentiate causes of non-AG metabolic acidosis",
        usage: "RTA vs GI bicarbonate loss",
        inputs: [
          { id: "urine_na", name: "Urine Sodium (mEq/L)", type: "number" },
          { id: "urine_k", name: "Urine Potassium (mEq/L)", type: "number" },
          { id: "urine_cl", name: "Urine Chloride (mEq/L)", type: "number" }
        ],
        formula: "UAG = UNa + UK - UCl",
        latex: "UAG = U_{Na} + U_{K} - U_{Cl}",
        interpretation: [
          { range: [-100, -20], risk: "Negative (GI loss)", recommendation: "Appropriate renal NH4 excretion - diarrhea likely" },
          { range: [-20, 20], risk: "Near zero", recommendation: "Indeterminate" },
          { range: [20, 100], risk: "Positive (RTA)", recommendation: "Impaired NH4 excretion - suspect RTA" }
        ],
        evidence: "Classic nephrology",
        reference: "Batlle DC et al. NEJM 1988"
      },
      {
        id: "creatinine_clearance",
        name: "Cockcroft-Gault CrCl",
        category: "Drug Dosing",
        description: "Creatinine clearance for drug dosing",
        usage: "Drug dose adjustments (still used for many drugs)",
        inputs: [
          { id: "age", name: "Age (years)", type: "number" },
          { id: "weight", name: "Weight (kg)", type: "number" },
          { id: "creatinine", name: "Serum Creatinine (mg/dL)", type: "number" },
          { id: "sex", name: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }] }
        ],
        formula: "CrCl = [(140 - Age) × Weight] / (72 × SCr) × 0.85 if female",
        latex: "CrCl = \\frac{(140 - Age) \\times Weight}{72 \\times S_{Cr}} \\times 0.85_{(female)}",
        interpretation: [
          { range: [90, 200], risk: "Normal", recommendation: "No dose adjustment" },
          { range: [60, 89], risk: "Mild impairment", recommendation: "May need adjustment for some drugs" },
          { range: [30, 59], risk: "Moderate impairment", recommendation: "Dose adjustment likely needed" },
          { range: [15, 29], risk: "Severe impairment", recommendation: "Significant dose reduction needed" },
          { range: [0, 14], risk: "End-stage", recommendation: "Major adjustment or avoid nephrotoxic drugs" }
        ],
        evidence: "Drug dosing standard",
        reference: "Cockcroft DW, Gault MH. Nephron 1976"
      }
    ]
  },

  // ============== HEPATOLOGY ==============
  hepatology: {
    name: "Hepatology",
    icon: "🫁",
    calculators: [
      {
        id: "meld",
        name: "MELD Score",
        category: "Prognosis",
        description: "Model for End-Stage Liver Disease",
        usage: "Liver transplant prioritization, 90-day mortality",
        inputs: [
          { id: "creatinine", name: "Creatinine (mg/dL)", type: "number", min: 0.1, max: 10 },
          { id: "bilirubin", name: "Bilirubin (mg/dL)", type: "number", min: 0.1, max: 50 },
          { id: "inr", name: "INR", type: "number", min: 0.8, max: 10 },
          { id: "sodium", name: "Sodium (mEq/L, for MELD-Na)", type: "number", min: 120, max: 145 },
          { id: "dialysis", name: "Dialysis twice in past week", type: "boolean" }
        ],
        formula: "MELD = 3.78×ln(bilirubin) + 11.2×ln(INR) + 9.57×ln(creatinine) + 6.43",
        latex: "MELD = 3.78\\ln(Bili) + 11.2\\ln(INR) + 9.57\\ln(Cr) + 6.43",
        interpretation: [
          { range: [6, 9], risk: "1.9% 90-day mortality", recommendation: "Low priority" },
          { range: [10, 19], risk: "6% 90-day mortality", recommendation: "Moderate priority" },
          { range: [20, 29], risk: "19.6% 90-day mortality", recommendation: "High priority" },
          { range: [30, 39], risk: "52.6% 90-day mortality", recommendation: "Very high priority" },
          { range: [40, 50], risk: "71.3% 90-day mortality", recommendation: "Urgent - highest priority" }
        ],
        evidence: "UNOS transplant allocation",
        reference: "Kamath PS et al. Hepatology 2001"
      },
      {
        id: "child_pugh",
        name: "Child-Pugh Score",
        category: "Prognosis",
        description: "Cirrhosis prognosis and severity",
        usage: "Cirrhosis staging, surgical risk, drug dosing",
        inputs: [
          { id: "encephalopathy", name: "Encephalopathy", type: "select", options: [
            { value: 1, label: "None (1 point)" },
            { value: 2, label: "Grade 1-2 (2 points)" },
            { value: 3, label: "Grade 3-4 (3 points)" }
          ]},
          { id: "ascites", name: "Ascites", type: "select", options: [
            { value: 1, label: "None (1 point)" },
            { value: 2, label: "Mild/controlled with diuretics (2 points)" },
            { value: 3, label: "Moderate-severe despite diuretics (3 points)" }
          ]},
          { id: "bilirubin", name: "Bilirubin (mg/dL)", type: "select", options: [
            { value: 1, label: "<2 (1 point)" },
            { value: 2, label: "2-3 (2 points)" },
            { value: 3, label: ">3 (3 points)" }
          ]},
          { id: "albumin", name: "Albumin (g/dL)", type: "select", options: [
            { value: 1, label: ">3.5 (1 point)" },
            { value: 2, label: "2.8-3.5 (2 points)" },
            { value: 3, label: "<2.8 (3 points)" }
          ]},
          { id: "inr", name: "INR / PT prolongation", type: "select", options: [
            { value: 1, label: "<1.7 / <4 sec (1 point)" },
            { value: 2, label: "1.7-2.3 / 4-6 sec (2 points)" },
            { value: 3, label: ">2.3 / >6 sec (3 points)" }
          ]}
        ],
        formula: "Sum of points (5-15)",
        interpretation: [
          { range: [5, 6], risk: "Class A: 100% 1-year survival", recommendation: "Well-compensated cirrhosis" },
          { range: [7, 9], risk: "Class B: 80% 1-year survival", recommendation: "Significant functional compromise" },
          { range: [10, 15], risk: "Class C: 45% 1-year survival", recommendation: "Decompensated cirrhosis" }
        ],
        evidence: "Classic hepatology score",
        reference: "Pugh RN et al. Br J Surg 1973"
      },
      {
        id: "maddrey",
        name: "Maddrey Discriminant Function",
        category: "Prognosis",
        description: "Alcoholic hepatitis severity",
        usage: "Identify patients who benefit from steroids",
        inputs: [
          { id: "pt", name: "Patient PT (seconds)", type: "number" },
          { id: "control_pt", name: "Control PT (seconds)", type: "number", default: 12 },
          { id: "bilirubin", name: "Bilirubin (mg/dL)", type: "number" }
        ],
        formula: "DF = 4.6 × (PT - control PT) + Bilirubin",
        latex: "MDF = 4.6 \\times (PT_{patient} - PT_{control}) + Bilirubin",
        interpretation: [
          { range: [0, 32], risk: "<32: Mild disease", recommendation: "Supportive care, no steroids" },
          { range: [32, 100], risk: "≥32: Severe disease", recommendation: "Consider prednisolone 40mg/day × 28 days" }
        ],
        evidence: "Alcoholic hepatitis trials",
        reference: "Maddrey WC et al. Gastroenterology 1978"
      },
      {
        id: "lille_model",
        name: "Lille Model",
        category: "Treatment Response",
        description: "Response to steroids in alcoholic hepatitis",
        usage: "Assess steroid response at day 7",
        inputs: [
          { id: "age", name: "Age (years)", type: "number" },
          { id: "albumin", name: "Albumin (g/L)", type: "number" },
          { id: "bilirubin_day0", name: "Bilirubin Day 0 (μmol/L)", type: "number" },
          { id: "bilirubin_day7", name: "Bilirubin Day 7 (μmol/L)", type: "number" },
          { id: "creatinine", name: "Creatinine (mg/dL)", type: "number" },
          { id: "pt", name: "Prothrombin Time (seconds)", type: "number" }
        ],
        formula: "Complex logistic regression model",
        interpretation: [
          { range: [0, 0.45], risk: "<0.45: Responder", recommendation: "75% 6-month survival - continue steroids" },
          { range: [0.45, 1], risk: "≥0.45: Non-responder", recommendation: "25% 6-month survival - stop steroids" }
        ],
        evidence: "Lille cohort study",
        reference: "Louvet A et al. Hepatology 2007"
      }
    ]
  },

  // ============== EMERGENCY/CRITICAL CARE ==============
  emergency: {
    name: "Emergency/ICU",
    icon: "🚨",
    calculators: [
      {
        id: "sofa",
        name: "SOFA Score",
        category: "Severity",
        description: "Sequential Organ Failure Assessment",
        usage: "ICU mortality prediction, sepsis diagnosis (qSOFA for screening)",
        inputs: [
          { id: "pf_ratio", name: "PaO2/FiO2 Ratio", type: "select", options: [
            { value: 0, label: "≥400 (0 points)" },
            { value: 1, label: "300-399 (1 point)" },
            { value: 2, label: "200-299 (2 points)" },
            { value: 3, label: "100-199 with respiratory support (3 points)" },
            { value: 4, label: "<100 with respiratory support (4 points)" }
          ]},
          { id: "platelets", name: "Platelets (×10³/μL)", type: "select", options: [
            { value: 0, label: "≥150 (0 points)" },
            { value: 1, label: "100-149 (1 point)" },
            { value: 2, label: "50-99 (2 points)" },
            { value: 3, label: "20-49 (3 points)" },
            { value: 4, label: "<20 (4 points)" }
          ]},
          { id: "bilirubin", name: "Bilirubin (mg/dL)", type: "select", options: [
            { value: 0, label: "<1.2 (0 points)" },
            { value: 1, label: "1.2-1.9 (1 point)" },
            { value: 2, label: "2.0-5.9 (2 points)" },
            { value: 3, label: "6.0-11.9 (3 points)" },
            { value: 4, label: "≥12 (4 points)" }
          ]},
          { id: "cardiovascular", name: "Cardiovascular (MAP or vasopressors)", type: "select", options: [
            { value: 0, label: "MAP ≥70 mmHg (0 points)" },
            { value: 1, label: "MAP <70 mmHg (1 point)" },
            { value: 2, label: "Dopamine <5 or dobutamine any dose (2 points)" },
            { value: 3, label: "Dopamine 5-15 or epi/norepi ≤0.1 (3 points)" },
            { value: 4, label: "Dopamine >15 or epi/norepi >0.1 (4 points)" }
          ]},
          { id: "gcs", name: "Glasgow Coma Scale", type: "select", options: [
            { value: 0, label: "15 (0 points)" },
            { value: 1, label: "13-14 (1 point)" },
            { value: 2, label: "10-12 (2 points)" },
            { value: 3, label: "6-9 (3 points)" },
            { value: 4, label: "<6 (4 points)" }
          ]},
          { id: "creatinine", name: "Creatinine (mg/dL) or urine output", type: "select", options: [
            { value: 0, label: "<1.2 (0 points)" },
            { value: 1, label: "1.2-1.9 (1 point)" },
            { value: 2, label: "2.0-3.4 (2 points)" },
            { value: 3, label: "3.5-4.9 or UO <500mL/day (3 points)" },
            { value: 4, label: "≥5.0 or UO <200mL/day (4 points)" }
          ]}
        ],
        formula: "Sum of all organ scores (0-24)",
        interpretation: [
          { range: [0, 1], risk: "<1% mortality", recommendation: "Minimal organ dysfunction" },
          { range: [2, 3], risk: "3-5% mortality", recommendation: "Low organ dysfunction" },
          { range: [4, 6], risk: "8-15% mortality", recommendation: "Moderate organ dysfunction" },
          { range: [7, 9], risk: "15-20% mortality", recommendation: "High organ dysfunction" },
          { range: [10, 12], risk: "40-50% mortality", recommendation: "Very high organ dysfunction" },
          { range: [13, 24], risk: ">80% mortality", recommendation: "Severe multi-organ failure" }
        ],
        evidence: "Sepsis-3 definition",
        reference: "Vincent JL et al. Intensive Care Med 1996"
      },
      {
        id: "qsofa",
        name: "qSOFA Score",
        category: "Screening",
        description: "Quick Sepsis-related Organ Failure Assessment",
        usage: "Bedside sepsis screening outside ICU",
        inputs: [
          { id: "altered_mental", name: "Altered mental status (GCS <15)", type: "boolean", points: 1 },
          { id: "respiratory_rate", name: "Respiratory rate ≥22/min", type: "boolean", points: 1 },
          { id: "systolic_bp", name: "Systolic BP ≤100 mmHg", type: "boolean", points: 1 }
        ],
        formula: "Sum of points (0-3)",
        interpretation: [
          { range: [0, 1], risk: "Low risk", recommendation: "Continue monitoring" },
          { range: [2, 3], risk: "High risk", recommendation: "≥2: High risk of poor outcome, assess for organ dysfunction" }
        ],
        evidence: "Sepsis-3 criteria",
        reference: "Singer M et al. JAMA 2016"
      },
      {
        id: "apache_ii",
        name: "APACHE II Score",
        category: "Severity",
        description: "Acute Physiology and Chronic Health Evaluation",
        usage: "ICU mortality prediction",
        inputs: [
          { id: "age", name: "Age Points", type: "select", options: [
            { value: 0, label: "<45 (0 points)" },
            { value: 2, label: "45-54 (2 points)" },
            { value: 3, label: "55-64 (3 points)" },
            { value: 5, label: "65-74 (5 points)" },
            { value: 6, label: "≥75 (6 points)" }
          ]},
          { id: "chronic_health", name: "Chronic Health Points", type: "select", options: [
            { value: 0, label: "None (0 points)" },
            { value: 2, label: "Non-operative/emergency post-op with chronic condition (2 points)" },
            { value: 5, label: "Immunocompromised or chronic organ failure (5 points)" }
          ]},
          { id: "aps", name: "Acute Physiology Score (sum of 12 variables)", type: "number", min: 0, max: 60 }
        ],
        formula: "APS + Age points + Chronic Health points (0-71)",
        interpretation: [
          { range: [0, 4], risk: "~4% mortality", recommendation: "Low risk" },
          { range: [5, 9], risk: "~8% mortality", recommendation: "Low-moderate risk" },
          { range: [10, 14], risk: "~15% mortality", recommendation: "Moderate risk" },
          { range: [15, 19], risk: "~25% mortality", recommendation: "Moderate-high risk" },
          { range: [20, 24], risk: "~40% mortality", recommendation: "High risk" },
          { range: [25, 29], risk: "~55% mortality", recommendation: "Very high risk" },
          { range: [30, 71], risk: "~75%+ mortality", recommendation: "Extremely high risk" }
        ],
        evidence: "ICU standard",
        reference: "Knaus WA et al. Crit Care Med 1985"
      },
      {
        id: "sirs",
        name: "SIRS Criteria",
        category: "Diagnostic",
        description: "Systemic Inflammatory Response Syndrome",
        usage: "Identify systemic inflammation (not specific for sepsis)",
        inputs: [
          { id: "temperature", name: "Temperature >38°C or <36°C", type: "boolean", points: 1 },
          { id: "heart_rate", name: "Heart rate >90 bpm", type: "boolean", points: 1 },
          { id: "respiratory", name: "RR >20/min or PaCO2 <32 mmHg", type: "boolean", points: 1 },
          { id: "wbc", name: "WBC >12,000 or <4,000 or >10% bands", type: "boolean", points: 1 }
        ],
        formula: "Number of criteria met (0-4)",
        interpretation: [
          { range: [0, 1], risk: "SIRS negative", recommendation: "Does not meet SIRS criteria" },
          { range: [2, 4], risk: "SIRS positive", recommendation: "≥2 criteria = SIRS; if infection suspected = sepsis" }
        ],
        evidence: "1991 Consensus definition (replaced by Sepsis-3)",
        reference: "Bone RC et al. Chest 1992"
      },
      {
        id: "anion_gap",
        name: "Anion Gap",
        category: "Diagnostic",
        description: "Metabolic acidosis workup",
        usage: "Differentiate causes of metabolic acidosis",
        inputs: [
          { id: "sodium", name: "Sodium (mEq/L)", type: "number" },
          { id: "chloride", name: "Chloride (mEq/L)", type: "number" },
          { id: "bicarbonate", name: "Bicarbonate (mEq/L)", type: "number" },
          { id: "albumin", name: "Albumin (g/dL) for correction", type: "number", default: 4 }
        ],
        formula: "AG = Na - (Cl + HCO3); Corrected AG = AG + 2.5 × (4 - Albumin)",
        latex: "AG = Na^+ - (Cl^- + HCO_3^-)",
        interpretation: [
          { range: [3, 11], risk: "Normal AG (3-11)", recommendation: "Normal or non-AG acidosis (RTA, diarrhea)" },
          { range: [12, 20], risk: "Elevated AG (12-20)", recommendation: "MUDPILES: Methanol, Uremia, DKA, Propylene glycol, INH/Iron, Lactic acidosis, Ethylene glycol, Salicylates" },
          { range: [20, 50], risk: "Severely elevated AG", recommendation: "Severe AG acidosis - urgent workup" }
        ],
        evidence: "Classic acid-base",
        reference: "Emmett M, Narins RG. Medicine 1977"
      },
      {
        id: "delta_delta",
        name: "Delta-Delta (Δ/Δ)",
        category: "Diagnostic",
        description: "Assess for mixed acid-base disorder",
        usage: "Detect concurrent non-AG acidosis or metabolic alkalosis",
        inputs: [
          { id: "anion_gap", name: "Anion Gap (mEq/L)", type: "number" },
          { id: "normal_ag", name: "Normal AG (usually 12)", type: "number", default: 12 },
          { id: "bicarbonate", name: "Bicarbonate (mEq/L)", type: "number" },
          { id: "normal_bicarb", name: "Normal HCO3 (usually 24)", type: "number", default: 24 }
        ],
        formula: "Δ/Δ = (AG - Normal AG) / (Normal HCO3 - HCO3)",
        latex: "\\frac{\\Delta AG}{\\Delta HCO_3} = \\frac{AG - 12}{24 - HCO_3}",
        interpretation: [
          { range: [0, 0.9], risk: "Δ/Δ <1", recommendation: "Concurrent non-AG metabolic acidosis" },
          { range: [1, 2], risk: "Δ/Δ 1-2", recommendation: "Pure AG metabolic acidosis" },
          { range: [2.1, 10], risk: "Δ/Δ >2", recommendation: "Concurrent metabolic alkalosis or pre-existing high HCO3" }
        ],
        evidence: "Acid-base physiology",
        reference: "Narins RG, Emmett M. Medicine 1980"
      }
    ]
  },

  // ============== HEMATOLOGY ==============
  hematology: {
    name: "Hematology",
    icon: "🩸",
    calculators: [
      {
        id: "dic_score",
        name: "DIC Score (ISTH)",
        category: "Diagnostic",
        description: "Disseminated Intravascular Coagulation",
        usage: "Diagnose overt DIC",
        inputs: [
          { id: "platelets", name: "Platelet Count", type: "select", options: [
            { value: 0, label: "≥100,000 (0 points)" },
            { value: 1, label: "50,000-99,999 (1 point)" },
            { value: 2, label: "<50,000 (2 points)" }
          ]},
          { id: "d_dimer", name: "D-dimer/FDP", type: "select", options: [
            { value: 0, label: "No increase (0 points)" },
            { value: 2, label: "Moderate increase (2 points)" },
            { value: 3, label: "Strong increase (3 points)" }
          ]},
          { id: "pt", name: "PT prolongation", type: "select", options: [
            { value: 0, label: "<3 sec (0 points)" },
            { value: 1, label: "3-6 sec (1 point)" },
            { value: 2, label: ">6 sec (2 points)" }
          ]},
          { id: "fibrinogen", name: "Fibrinogen", type: "select", options: [
            { value: 0, label: "≥100 mg/dL (0 points)" },
            { value: 1, label: "<100 mg/dL (1 point)" }
          ]}
        ],
        formula: "Sum of points (0-8)",
        interpretation: [
          { range: [0, 4], risk: "Score <5", recommendation: "Not compatible with overt DIC - repeat in 1-2 days" },
          { range: [5, 8], risk: "Score ≥5", recommendation: "Compatible with overt DIC - treat underlying cause" }
        ],
        evidence: "ISTH DIC guidelines",
        reference: "Taylor FB et al. Thromb Haemost 2001"
      },
      {
        id: "hit_4t",
        name: "4Ts Score for HIT",
        category: "Diagnostic",
        description: "Heparin-Induced Thrombocytopenia probability",
        usage: "Pre-test probability before HIT antibody testing",
        inputs: [
          { id: "thrombocytopenia", name: "Thrombocytopenia", type: "select", options: [
            { value: 0, label: "Fall <30% or nadir <10,000 (0 points)" },
            { value: 1, label: "Fall 30-50% or nadir 10,000-19,000 (1 point)" },
            { value: 2, label: "Fall >50% and nadir ≥20,000 (2 points)" }
          ]},
          { id: "timing", name: "Timing of platelet fall", type: "select", options: [
            { value: 0, label: "Fall <4 days without recent heparin (0 points)" },
            { value: 1, label: "Consistent with day 5-10, but not clear; or fall <1 day with heparin in past 30-100 days (1 point)" },
            { value: 2, label: "Clear onset day 5-10; or <1 day if heparin in past 30 days (2 points)" }
          ]},
          { id: "thrombosis", name: "Thrombosis or other sequelae", type: "select", options: [
            { value: 0, label: "None (0 points)" },
            { value: 1, label: "Progressive or recurrent thrombosis; non-necrotizing skin lesions; suspected thrombosis (1 point)" },
            { value: 2, label: "New thrombosis; skin necrosis; acute systemic reaction after IV heparin bolus (2 points)" }
          ]},
          { id: "other_causes", name: "Other causes for thrombocytopenia", type: "select", options: [
            { value: 0, label: "Definite other cause present (0 points)" },
            { value: 1, label: "Possible other cause (1 point)" },
            { value: 2, label: "No other apparent cause (2 points)" }
          ]}
        ],
        formula: "Sum of points (0-8)",
        interpretation: [
          { range: [0, 3], risk: "<5% probability", recommendation: "Low probability - HIT unlikely, consider other causes" },
          { range: [4, 5], risk: "~14% probability", recommendation: "Intermediate - send HIT antibody, consider alternative anticoagulation" },
          { range: [6, 8], risk: "~64% probability", recommendation: "High probability - stop heparin, start alternative anticoagulation" }
        ],
        evidence: "HIT diagnostic algorithm",
        reference: "Lo GK et al. J Thromb Haemost 2006"
      },
      {
        id: "padua",
        name: "Padua VTE Risk Score",
        category: "Risk Stratification",
        description: "VTE risk in hospitalized medical patients",
        usage: "Identify patients needing VTE prophylaxis",
        inputs: [
          { id: "active_cancer", name: "Active cancer", type: "boolean", points: 3 },
          { id: "previous_vte", name: "Previous VTE (excluding superficial)", type: "boolean", points: 3 },
          { id: "reduced_mobility", name: "Reduced mobility (bed rest with bathroom privileges ≥3 days)", type: "boolean", points: 3 },
          { id: "thrombophilia", name: "Already known thrombophilic condition", type: "boolean", points: 3 },
          { id: "recent_trauma_surgery", name: "Recent (≤1 month) trauma and/or surgery", type: "boolean", points: 2 },
          { id: "age_70", name: "Age ≥70 years", type: "boolean", points: 1 },
          { id: "heart_failure", name: "Heart and/or respiratory failure", type: "boolean", points: 1 },
          { id: "ami_stroke", name: "Acute MI or ischemic stroke", type: "boolean", points: 1 },
          { id: "infection", name: "Acute infection and/or rheumatological disorder", type: "boolean", points: 1 },
          { id: "obesity", name: "Obesity (BMI ≥30)", type: "boolean", points: 1 },
          { id: "hormonal", name: "Ongoing hormonal treatment", type: "boolean", points: 1 }
        ],
        formula: "Sum of points",
        interpretation: [
          { range: [0, 3], risk: "0.3% VTE risk", recommendation: "Low risk - prophylaxis may not be needed" },
          { range: [4, 20], risk: "11% VTE risk", recommendation: "High risk - pharmacological prophylaxis recommended" }
        ],
        evidence: "Padua cohort study",
        reference: "Barbar S et al. J Thromb Haemost 2010"
      }
    ]
  },

  // ============== ENDOCRINE ==============
  endocrine: {
    name: "Endocrine",
    icon: "⚡",
    calculators: [
      {
        id: "homa_ir",
        name: "HOMA-IR",
        category: "Diagnostic",
        description: "Homeostatic Model Assessment of Insulin Resistance",
        usage: "Assess insulin resistance",
        inputs: [
          { id: "fasting_insulin", name: "Fasting Insulin (μU/mL)", type: "number" },
          { id: "fasting_glucose", name: "Fasting Glucose (mg/dL)", type: "number" }
        ],
        formula: "HOMA-IR = (Fasting Insulin × Fasting Glucose) / 405",
        latex: "HOMA\\text{-}IR = \\frac{Insulin \\times Glucose}{405}",
        interpretation: [
          { range: [0, 1], risk: "Normal", recommendation: "HOMA-IR <1 = optimal insulin sensitivity" },
          { range: [1, 2.5], risk: "Low-normal", recommendation: "HOMA-IR 1-2 = normal" },
          { range: [2.5, 5], risk: "Elevated", recommendation: "HOMA-IR >2.5 = insulin resistance" },
          { range: [5, 20], risk: "Significant IR", recommendation: "HOMA-IR >5 = significant insulin resistance" }
        ],
        evidence: "Metabolic research standard",
        reference: "Matthews DR et al. Diabetologia 1985"
      },
      {
        id: "corrected_calcium",
        name: "Corrected Calcium",
        category: "Utility",
        description: "Albumin-corrected calcium",
        usage: "Adjust calcium for low albumin states",
        inputs: [
          { id: "calcium", name: "Measured Calcium (mg/dL)", type: "number" },
          { id: "albumin", name: "Albumin (g/dL)", type: "number" }
        ],
        formula: "Corrected Ca = Measured Ca + 0.8 × (4 - Albumin)",
        latex: "Ca_{corr} = Ca_{measured} + 0.8 \\times (4 - Albumin)",
        interpretation: [
          { range: [8.5, 10.5], risk: "Normal", recommendation: "8.5-10.5 mg/dL" },
          { range: [10.6, 12], risk: "Mild hypercalcemia", recommendation: "Investigate cause" },
          { range: [12.1, 14], risk: "Moderate hypercalcemia", recommendation: "Urgent evaluation, hydration" },
          { range: [14, 20], risk: "Severe hypercalcemia", recommendation: "Emergency treatment required" }
        ],
        evidence: "Clinical chemistry standard",
        reference: "Payne RB et al. BMJ 1973"
      },
      {
        id: "thyroid_index",
        name: "Free Thyroxine Index (FTI)",
        category: "Diagnostic",
        description: "Estimate free T4 when binding proteins are abnormal",
        usage: "Assess thyroid function when TBG is abnormal",
        inputs: [
          { id: "t4", name: "Total T4 (μg/dL)", type: "number" },
          { id: "t3ru", name: "T3 Resin Uptake (%)", type: "number" }
        ],
        formula: "FTI = T4 × T3RU / 100",
        interpretation: [
          { range: [0, 4.5], risk: "Low", recommendation: "Suggests hypothyroidism" },
          { range: [4.5, 12], risk: "Normal", recommendation: "Normal thyroid function" },
          { range: [12, 30], risk: "High", recommendation: "Suggests hyperthyroidism" }
        ],
        evidence: "Endocrinology standard",
        reference: "Clinical chemistry textbooks"
      }
    ]
  },

  // ============== RHEUMATOLOGY ==============
  rheumatology: {
    name: "Rheumatology",
    icon: "🦴",
    calculators: [
      {
        id: "das28",
        name: "DAS28-CRP",
        category: "Disease Activity",
        description: "Disease Activity Score 28 joints",
        usage: "Monitor RA disease activity, guide treatment",
        inputs: [
          { id: "tjc28", name: "Tender Joint Count (0-28)", type: "number", min: 0, max: 28 },
          { id: "sjc28", name: "Swollen Joint Count (0-28)", type: "number", min: 0, max: 28 },
          { id: "crp", name: "CRP (mg/L)", type: "number" },
          { id: "vas", name: "Patient Global Assessment VAS (0-100 mm)", type: "number", min: 0, max: 100 }
        ],
        formula: "DAS28-CRP = 0.56×√TJC28 + 0.28×√SJC28 + 0.36×ln(CRP+1) + 0.014×VAS + 0.96",
        latex: "DAS28 = 0.56\\sqrt{TJC28} + 0.28\\sqrt{SJC28} + 0.36\\ln(CRP+1) + 0.014 \\times VAS + 0.96",
        interpretation: [
          { range: [0, 2.6], risk: "Remission", recommendation: "DAS28 <2.6 - maintain therapy" },
          { range: [2.6, 3.2], risk: "Low activity", recommendation: "DAS28 2.6-3.2 - consider maintenance" },
          { range: [3.2, 5.1], risk: "Moderate activity", recommendation: "DAS28 3.2-5.1 - optimize DMARD" },
          { range: [5.1, 10], risk: "High activity", recommendation: "DAS28 >5.1 - escalate therapy" }
        ],
        evidence: "EULAR response criteria",
        reference: "Prevoo ML et al. Arthritis Rheum 1995"
      },
      {
        id: "sledai",
        name: "SLEDAI-2K",
        category: "Disease Activity",
        description: "SLE Disease Activity Index",
        usage: "Monitor lupus disease activity",
        inputs: [
          { id: "seizure", name: "Seizure (new onset)", type: "boolean", points: 8 },
          { id: "psychosis", name: "Psychosis", type: "boolean", points: 8 },
          { id: "organic_brain", name: "Organic brain syndrome", type: "boolean", points: 8 },
          { id: "visual", name: "Visual disturbance", type: "boolean", points: 8 },
          { id: "cranial_nerve", name: "Cranial nerve disorder", type: "boolean", points: 8 },
          { id: "headache", name: "Lupus headache", type: "boolean", points: 8 },
          { id: "cva", name: "CVA", type: "boolean", points: 8 },
          { id: "vasculitis", name: "Vasculitis", type: "boolean", points: 8 },
          { id: "arthritis", name: "Arthritis", type: "boolean", points: 4 },
          { id: "myositis", name: "Myositis", type: "boolean", points: 4 },
          { id: "casts", name: "Urinary casts", type: "boolean", points: 4 },
          { id: "hematuria", name: "Hematuria", type: "boolean", points: 4 },
          { id: "proteinuria", name: "Proteinuria", type: "boolean", points: 4 },
          { id: "pyuria", name: "Pyuria", type: "boolean", points: 4 },
          { id: "rash", name: "New rash", type: "boolean", points: 2 },
          { id: "alopecia", name: "Alopecia", type: "boolean", points: 2 },
          { id: "mucosal_ulcers", name: "Mucosal ulcers", type: "boolean", points: 2 },
          { id: "pleurisy", name: "Pleurisy", type: "boolean", points: 2 },
          { id: "pericarditis", name: "Pericarditis", type: "boolean", points: 2 },
          { id: "low_complement", name: "Low complement", type: "boolean", points: 2 },
          { id: "high_dna", name: "Increased DNA binding", type: "boolean", points: 2 },
          { id: "fever", name: "Fever", type: "boolean", points: 1 },
          { id: "thrombocytopenia", name: "Thrombocytopenia", type: "boolean", points: 1 },
          { id: "leukopenia", name: "Leukopenia", type: "boolean", points: 1 }
        ],
        formula: "Sum of applicable items",
        interpretation: [
          { range: [0, 0], risk: "No activity", recommendation: "SLEDAI = 0 - no measurable activity" },
          { range: [1, 5], risk: "Mild activity", recommendation: "SLEDAI 1-5 - mild flare" },
          { range: [6, 10], risk: "Moderate activity", recommendation: "SLEDAI 6-10 - moderate flare" },
          { range: [11, 19], risk: "High activity", recommendation: "SLEDAI 11-19 - high activity" },
          { range: [20, 105], risk: "Very high activity", recommendation: "SLEDAI ≥20 - severe flare" }
        ],
        evidence: "SLE clinical trials standard",
        reference: "Bombardier C et al. Arthritis Rheum 1992"
      },
      {
        id: "frax",
        name: "FRAX Score",
        category: "Risk Stratification",
        description: "10-year fracture risk",
        usage: "Assess osteoporotic fracture risk, guide treatment",
        inputs: [
          { id: "age", name: "Age (years)", type: "number", min: 40, max: 90 },
          { id: "sex", name: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }] },
          { id: "weight", name: "Weight (kg)", type: "number" },
          { id: "height", name: "Height (cm)", type: "number" },
          { id: "previous_fracture", name: "Previous fracture", type: "boolean" },
          { id: "parent_hip_fracture", name: "Parent hip fracture", type: "boolean" },
          { id: "smoking", name: "Current smoking", type: "boolean" },
          { id: "glucocorticoids", name: "Glucocorticoids", type: "boolean" },
          { id: "ra", name: "Rheumatoid arthritis", type: "boolean" },
          { id: "secondary_osteoporosis", name: "Secondary osteoporosis", type: "boolean" },
          { id: "alcohol", name: "Alcohol ≥3 units/day", type: "boolean" },
          { id: "bmd", name: "Femoral neck BMD (g/cm²) - optional", type: "number" }
        ],
        formula: "Complex country-specific algorithm",
        interpretation: [
          { range: [0, 10], risk: "<10% major, <3% hip", recommendation: "Low risk - reassess in 5 years" },
          { range: [10, 20], risk: "10-20% major", recommendation: "Intermediate - consider BMD if not done" },
          { range: [20, 100], risk: ">20% major or >3% hip", recommendation: "High risk - pharmacological therapy recommended" }
        ],
        evidence: "WHO FRAX tool",
        reference: "Kanis JA et al. Osteoporos Int 2008"
      }
    ]
  },

  // ============== GENERAL/UTILITY ==============
  general: {
    name: "General/Utility",
    icon: "🧮",
    calculators: [
      {
        id: "bmi",
        name: "Body Mass Index",
        category: "Assessment",
        description: "Weight classification",
        usage: "Assess weight status, cardiovascular risk factor",
        inputs: [
          { id: "weight", name: "Weight (kg)", type: "number" },
          { id: "height", name: "Height (m)", type: "number" }
        ],
        formula: "BMI = Weight / Height²",
        latex: "BMI = \\frac{Weight\\ (kg)}{Height^2\\ (m^2)}",
        interpretation: [
          { range: [0, 18.5], risk: "Underweight", recommendation: "BMI <18.5" },
          { range: [18.5, 24.9], risk: "Normal", recommendation: "BMI 18.5-24.9" },
          { range: [25, 29.9], risk: "Overweight", recommendation: "BMI 25-29.9" },
          { range: [30, 34.9], risk: "Obesity Class I", recommendation: "BMI 30-34.9" },
          { range: [35, 39.9], risk: "Obesity Class II", recommendation: "BMI 35-39.9" },
          { range: [40, 100], risk: "Obesity Class III", recommendation: "BMI ≥40" }
        ],
        evidence: "WHO classification",
        reference: "WHO Expert Committee 1995"
      },
      {
        id: "bsa",
        name: "Body Surface Area",
        category: "Drug Dosing",
        description: "BSA calculation for drug dosing",
        usage: "Chemotherapy dosing, burns assessment, cardiac index",
        inputs: [
          { id: "weight", name: "Weight (kg)", type: "number" },
          { id: "height", name: "Height (cm)", type: "number" }
        ],
        formula: "BSA = √(Height × Weight / 3600) [Mosteller]",
        latex: "BSA = \\sqrt{\\frac{Height\\ (cm) \\times Weight\\ (kg)}{3600}}",
        interpretation: [
          { range: [1.5, 2.0], risk: "Normal adult range", recommendation: "Average adult BSA ~1.7-2.0 m²" }
        ],
        evidence: "Standard calculation",
        reference: "Mosteller RD. NEJM 1987"
      },
      {
        id: "ideal_body_weight",
        name: "Ideal Body Weight",
        category: "Drug Dosing",
        description: "IBW for drug dosing",
        usage: "Ventilator tidal volumes, aminoglycoside dosing",
        inputs: [
          { id: "height", name: "Height (inches)", type: "number" },
          { id: "sex", name: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }] }
        ],
        formula: "Male: 50 + 2.3 × (height - 60); Female: 45.5 + 2.3 × (height - 60)",
        latex: "IBW_{male} = 50 + 2.3 \\times (Height_{in} - 60)",
        interpretation: [
          { range: [40, 100], risk: "Calculated IBW", recommendation: "Use for tidal volume (6-8 mL/kg IBW) and certain drug dosing" }
        ],
        evidence: "Devine formula",
        reference: "Devine BJ. Drug Intell Clin Pharm 1974"
      },
      {
        id: "winter_formula",
        name: "Winter's Formula",
        category: "Diagnostic",
        description: "Expected PaCO2 in metabolic acidosis",
        usage: "Assess respiratory compensation in metabolic acidosis",
        inputs: [
          { id: "bicarbonate", name: "Bicarbonate (mEq/L)", type: "number" }
        ],
        formula: "Expected PaCO2 = 1.5 × HCO3 + 8 (±2)",
        latex: "Expected\\ PaCO_2 = 1.5 \\times HCO_3^- + 8\\ (\\pm 2)",
        interpretation: [
          { range: [0, 100], risk: "Expected compensation", recommendation: "If actual PaCO2 higher: concurrent respiratory acidosis; if lower: concurrent respiratory alkalosis" }
        ],
        evidence: "Acid-base physiology",
        reference: "Winter RW. Ann Intern Med 1967"
      },
      {
        id: "osmolality",
        name: "Calculated Serum Osmolality",
        category: "Diagnostic",
        description: "Estimate serum osmolality",
        usage: "Assess osmolar gap, toxic ingestions",
        inputs: [
          { id: "sodium", name: "Sodium (mEq/L)", type: "number" },
          { id: "glucose", name: "Glucose (mg/dL)", type: "number" },
          { id: "bun", name: "BUN (mg/dL)", type: "number" }
        ],
        formula: "Osm = 2×Na + Glucose/18 + BUN/2.8",
        latex: "Osm = 2 \\times Na + \\frac{Glucose}{18} + \\frac{BUN}{2.8}",
        interpretation: [
          { range: [275, 295], risk: "Normal", recommendation: "275-295 mOsm/kg" },
          { range: [295, 320], risk: "Elevated", recommendation: "Dehydration, hyperglycemia" },
          { range: [320, 400], risk: "Severely elevated", recommendation: "HHS, severe hypernatremia" }
        ],
        evidence: "Clinical chemistry",
        reference: "Standard formula"
      },
      {
        id: "osmolar_gap",
        name: "Osmolar Gap",
        category: "Diagnostic",
        description: "Difference between measured and calculated osmolality",
        usage: "Detect unmeasured osmoles (toxic alcohols)",
        inputs: [
          { id: "measured_osm", name: "Measured Osmolality (mOsm/kg)", type: "number" },
          { id: "calculated_osm", name: "Calculated Osmolality (mOsm/kg)", type: "number" }
        ],
        formula: "Gap = Measured - Calculated",
        interpretation: [
          { range: [-10, 10], risk: "Normal (<10)", recommendation: "Normal osmolar gap" },
          { range: [10, 50], risk: "Elevated (≥10)", recommendation: "Consider toxic alcohol ingestion (methanol, ethylene glycol, isopropanol)" }
        ],
        evidence: "Toxicology standard",
        reference: "Smithline N, Gardner KD. JAMA 1976"
      }
    ]
  }
};

// Helper function to calculate score based on inputs
export const calculateScore = (calculator, inputs) => {
  let score = 0;
  
  calculator.inputs.forEach(input => {
    const value = inputs[input.id];
    if (value !== undefined && value !== null) {
      if (input.type === 'boolean' && value === true) {
        score += input.points || 0;
      } else if (input.type === 'select' && typeof value === 'number') {
        score += value;
      } else if (input.type === 'number' && input.points) {
        score += input.points;
      }
    }
  });
  
  return score;
};

// Get interpretation based on score
export const getInterpretation = (calculator, score) => {
  for (const interp of calculator.interpretation) {
    if (score >= interp.range[0] && score <= interp.range[1]) {
      return interp;
    }
  }
  return null;
};

// Get all calculator IDs
export const getAllCalculatorIds = () => {
  const ids = [];
  Object.values(CLINICAL_CALCULATORS).forEach(category => {
    category.calculators.forEach(calc => {
      ids.push(calc.id);
    });
  });
  return ids;
};

// Search calculators
export const searchCalculators = (query) => {
  const results = [];
  const lowerQuery = query.toLowerCase();
  
  Object.entries(CLINICAL_CALCULATORS).forEach(([categoryKey, category]) => {
    category.calculators.forEach(calc => {
      if (
        calc.name.toLowerCase().includes(lowerQuery) ||
        calc.description.toLowerCase().includes(lowerQuery) ||
        calc.usage.toLowerCase().includes(lowerQuery) ||
        calc.category.toLowerCase().includes(lowerQuery)
      ) {
        results.push({ ...calc, categoryKey, categoryName: category.name });
      }
    });
  });
  
  return results;
};

// Disease to Calculator Mapping - Maps diseases/conditions to relevant calculators
export const DISEASE_CALCULATOR_MAP = {
  // Cardiovascular
  'atrial_fibrillation': ['cha2ds2_vasc', 'has_bled'],
  'I48': ['cha2ds2_vasc', 'has_bled'],
  'I48.0': ['cha2ds2_vasc', 'has_bled'],
  'I48.1': ['cha2ds2_vasc', 'has_bled'],
  'I48.2': ['cha2ds2_vasc', 'has_bled'],
  'heart_failure': ['nyha_class', 'framingham_risk'],
  'I50': ['nyha_class', 'framingham_risk'],
  'I50.2': ['nyha_class', 'framingham_risk'],
  'I50.9': ['nyha_class', 'framingham_risk'],
  'chest_pain': ['heart_score', 'timi_stemi', 'wells_pe'],
  'acute_coronary_syndrome': ['heart_score', 'timi_stemi'],
  'I21': ['heart_score', 'timi_stemi'],
  'I20': ['heart_score'],
  'myocardial_infarction': ['timi_stemi', 'heart_score'],
  'dvt': ['wells_dvt', 'padua'],
  'I80': ['wells_dvt', 'padua'],
  'pulmonary_embolism': ['wells_pe', 'perc'],
  'I26': ['wells_pe'],
  
  // Pulmonary
  'pneumonia': ['curb65', 'psi_port'],
  'J18': ['curb65', 'psi_port'],
  'J13': ['curb65', 'psi_port'],
  'J15': ['curb65', 'psi_port'],
  'copd': ['gold_copd', 'bode_index'],
  'J44': ['gold_copd', 'bode_index'],
  'respiratory_failure': ['aa_gradient'],
  'J96': ['aa_gradient'],
  
  // Neurological
  'stroke': ['nihss', 'hunt_hess', 'fisher_grade'],
  'I63': ['nihss'],
  'I64': ['nihss'],
  'I60': ['hunt_hess', 'fisher_grade'],
  'I61': ['gcs'],
  'traumatic_brain_injury': ['gcs'],
  'S06': ['gcs'],
  'subarachnoid_hemorrhage': ['hunt_hess', 'fisher_grade'],
  
  // Renal
  'chronic_kidney_disease': ['ckd_epi', 'creatinine_clearance'],
  'N18': ['ckd_epi', 'creatinine_clearance'],
  'acute_kidney_injury': ['fena', 'urine_anion_gap'],
  'N17': ['fena', 'urine_anion_gap'],
  
  // Hepatology
  'cirrhosis': ['child_pugh', 'meld'],
  'K74': ['child_pugh', 'meld'],
  'K70': ['child_pugh', 'meld', 'maddrey'],
  'alcoholic_hepatitis': ['maddrey', 'lille_model'],
  'K70.1': ['maddrey', 'lille_model'],
  'liver_failure': ['meld', 'child_pugh'],
  'K72': ['meld', 'child_pugh'],
  
  // Critical Care / Emergency
  'sepsis': ['sofa', 'qsofa', 'sirs'],
  'A41': ['sofa', 'qsofa', 'sirs'],
  'R65': ['sofa', 'qsofa'],
  'metabolic_acidosis': ['anion_gap', 'delta_delta'],
  'E87': ['anion_gap', 'delta_delta'],
  
  // Hematology
  'dic': ['dic_score'],
  'D65': ['dic_score'],
  'hit': ['hit_4t'],
  'D75.8': ['hit_4t'],
  'vte_prophylaxis': ['padua'],
  
  // Endocrine
  'diabetes': ['homa_ir'],
  'E11': ['homa_ir'],
  'E10': ['homa_ir'],
  'hypercalcemia': ['corrected_calcium'],
  'E83.5': ['corrected_calcium'],
  'thyroid': ['thyroid_index'],
  'E03': ['thyroid_index'],
  'E05': ['thyroid_index'],
  
  // Rheumatology
  'rheumatoid_arthritis': ['das28'],
  'M05': ['das28'],
  'M06': ['das28'],
  'sle': ['sledai'],
  'M32': ['sledai'],
  'lupus': ['sledai'],
};

// Get calculator by ID
export const getCalculatorById = (calculatorId) => {
  for (const category of Object.values(CLINICAL_CALCULATORS)) {
    const calc = category.calculators.find(c => c.id === calculatorId);
    if (calc) return { ...calc, categoryName: category.name };
  }
  return null;
};

// Get relevant calculators for a disease
export const getCalculatorsForDisease = (diseaseId) => {
  // Normalize the disease ID
  const normalizedId = diseaseId?.toLowerCase().replace(/[._]/g, '');
  
  // Direct match
  if (DISEASE_CALCULATOR_MAP[diseaseId]) {
    return DISEASE_CALCULATOR_MAP[diseaseId].map(id => getCalculatorById(id)).filter(Boolean);
  }
  
  // Try with ICD code variations
  const icdBase = diseaseId?.split('.')[0] || diseaseId?.split('_')[0];
  if (DISEASE_CALCULATOR_MAP[icdBase]) {
    return DISEASE_CALCULATOR_MAP[icdBase].map(id => getCalculatorById(id)).filter(Boolean);
  }
  
  // Search for partial matches in the map
  for (const [key, calcIds] of Object.entries(DISEASE_CALCULATOR_MAP)) {
    if (normalizedId?.includes(key.replace(/[._]/g, '')) || 
        key.replace(/[._]/g, '').includes(normalizedId)) {
      return calcIds.map(id => getCalculatorById(id)).filter(Boolean);
    }
  }
  
  return [];
};

// Get calculators for an organ system
export const getCalculatorsForOrgan = (organId) => {
  const organCategoryMap = {
    'heart': 'cardiovascular',
    'lungs': 'respiratory',
    'brain': 'neurological',
    'kidneys': 'renal',
    'liver': 'hepatology',
    'blood': 'hematology',
    'pancreas': 'endocrine',
  };
  
  const categoryKey = organCategoryMap[organId?.toLowerCase()];
  if (categoryKey && CLINICAL_CALCULATORS[categoryKey]) {
    return CLINICAL_CALCULATORS[categoryKey].calculators;
  }
  
  return [];
};

export default CLINICAL_CALCULATORS;
