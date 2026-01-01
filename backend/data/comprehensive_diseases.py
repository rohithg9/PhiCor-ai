"""
Comprehensive Disease Database
Evidence-based disease data with ICD-10 codes, clinical criteria, and treatment guidelines.
Based on WHO ICD-10, clinical guidelines (ESC, AHA, NICE), and UpToDate.
"""

from datetime import datetime, timezone

def get_timestamp():
    return datetime.now(timezone.utc).isoformat()

# ============== CARDIOVASCULAR DISEASES ==============
CARDIOVASCULAR_DISEASES = [
    {
        "id": "heart_failure_hfref",
        "name": "Heart Failure with Reduced Ejection Fraction (HFrEF)",
        "icd10_code": "I50.2",
        "category": "cardiovascular",
        "description": "Heart failure characterized by left ventricular ejection fraction ≤40%. Associated with impaired systolic function and neurohormonal activation.",
        "synonyms": ["Systolic heart failure", "HFrEF", "Congestive heart failure"],
        "epidemiology": {
            "prevalence": "1-2% of adult population in developed countries",
            "incidence": "5-10 per 1000 person-years",
            "mortality": "50% 5-year mortality without treatment",
            "risk_factors": ["Coronary artery disease", "Hypertension", "Diabetes", "Obesity", "Valvular disease", "Cardiomyopathy"]
        },
        "pathophysiology": "Reduced cardiac contractility leads to decreased cardiac output, neurohormonal activation (RAAS, SNS), fluid retention, and progressive ventricular remodeling.",
        "clinical_features": {
            "symptoms": ["Dyspnea on exertion", "Orthopnea", "Paroxysmal nocturnal dyspnea", "Fatigue", "Peripheral edema", "Weight gain"],
            "signs": ["Elevated JVP", "S3 gallop", "Displaced apex beat", "Hepatomegaly", "Bilateral crackles", "Peripheral edema"]
        },
        "diagnostic_criteria": {
            "framingham_criteria": "2 major OR 1 major + 2 minor criteria",
            "required_tests": ["Echocardiography (EF ≤40%)", "BNP/NT-proBNP", "ECG", "Chest X-ray"],
            "bnp_cutoff": "BNP >100 pg/mL or NT-proBNP >300 pg/mL suggests HF"
        },
        "nyha_classification": [
            {"class": "I", "description": "No limitation of physical activity"},
            {"class": "II", "description": "Slight limitation - comfortable at rest, symptoms with ordinary activity"},
            {"class": "III", "description": "Marked limitation - comfortable at rest, symptoms with less than ordinary activity"},
            {"class": "IV", "description": "Unable to carry out any physical activity without symptoms"}
        ],
        "treatment": {
            "first_line": ["ACE inhibitor/ARB", "Beta-blocker (carvedilol, bisoprolol, metoprolol succinate)", "Mineralocorticoid receptor antagonist"],
            "second_line": ["ARNI (sacubitril/valsartan)", "SGLT2 inhibitor", "Ivabradine (if HR >70)"],
            "devices": ["ICD for EF ≤35%", "CRT for QRS ≥150ms with LBBB"],
            "lifestyle": ["Sodium restriction <2g/day", "Fluid restriction if hyponatremic", "Daily weights", "Exercise rehabilitation"]
        },
        "prognosis": "Guideline-directed medical therapy reduces mortality by 30-40%",
        "affected_organs": ["heart", "lungs", "kidneys"],
        "guideline_source": "ESC 2021, AHA/ACC 2022"
    },
    {
        "id": "acute_coronary_syndrome",
        "name": "Acute Coronary Syndrome",
        "icd10_code": "I21 (STEMI), I21.4 (NSTEMI), I20.0 (Unstable Angina)",
        "category": "cardiovascular",
        "description": "Spectrum of conditions from unstable angina to NSTEMI and STEMI, caused by acute reduction in coronary blood flow.",
        "synonyms": ["ACS", "Heart attack", "Myocardial infarction"],
        "epidemiology": {
            "prevalence": "Leading cause of death worldwide",
            "incidence": "3 million STEMI, 4 million NSTEMI annually worldwide",
            "mortality": "STEMI 30-day mortality 5-6% with PCI",
            "risk_factors": ["Smoking", "Hypertension", "Diabetes", "Hyperlipidemia", "Family history", "Obesity"]
        },
        "pathophysiology": "Plaque rupture or erosion with superimposed thrombosis causing partial or complete coronary occlusion.",
        "clinical_features": {
            "symptoms": ["Chest pain/pressure (>20 min)", "Radiation to arm/jaw/back", "Dyspnea", "Diaphoresis", "Nausea", "Syncope"],
            "signs": ["Tachycardia", "Hypotension (cardiogenic shock)", "S4 gallop", "New murmur (papillary muscle rupture)"]
        },
        "diagnostic_criteria": {
            "stemi": "ST elevation ≥1mm in 2 contiguous leads (≥2mm in V1-V3)",
            "nstemi": "Troponin elevation + ischemic symptoms/ECG changes",
            "unstable_angina": "Ischemic symptoms without troponin elevation",
            "required_tests": ["Serial troponins", "12-lead ECG", "Echocardiography"]
        },
        "treatment": {
            "immediate": ["Aspirin 325mg", "P2Y12 inhibitor", "Anticoagulation", "Morphine (if pain)", "Oxygen (if SpO2 <90%)"],
            "stemi": ["Primary PCI within 90 minutes (door-to-balloon)", "Fibrinolysis if PCI not available within 120 min"],
            "nstemi": ["Early invasive strategy (24-72h) for high-risk", "Conservative strategy for low-risk"],
            "secondary_prevention": ["DAPT for 12 months", "High-intensity statin", "ACE inhibitor", "Beta-blocker"]
        },
        "prognosis": "Primary PCI reduces STEMI mortality to <5%",
        "affected_organs": ["heart"],
        "guideline_source": "ESC 2020, AHA/ACC 2021"
    },
    {
        "id": "atrial_fibrillation",
        "name": "Atrial Fibrillation",
        "icd10_code": "I48",
        "category": "cardiovascular",
        "description": "Most common sustained cardiac arrhythmia characterized by irregular atrial activation and uncoordinated atrial contraction.",
        "synonyms": ["AF", "AFib", "Auricular fibrillation"],
        "epidemiology": {
            "prevalence": "2-4% of adults, increasing with age (10% in >80 years)",
            "incidence": "Lifetime risk ~25%",
            "mortality": "2-fold increased mortality, 5-fold stroke risk",
            "risk_factors": ["Age", "Hypertension", "Heart failure", "Valvular disease", "Obesity", "Sleep apnea", "Alcohol"]
        },
        "pathophysiology": "Atrial remodeling with electrical and structural changes leading to multiple re-entrant wavelets and/or focal triggers (often from pulmonary veins).",
        "clinical_features": {
            "symptoms": ["Palpitations", "Dyspnea", "Fatigue", "Dizziness", "Chest discomfort", "May be asymptomatic"],
            "signs": ["Irregularly irregular pulse", "Variable S1 intensity", "Pulse deficit"]
        },
        "diagnostic_criteria": {
            "ecg_findings": "Absence of P waves, irregular R-R intervals, fibrillatory baseline",
            "classification": ["Paroxysmal (<7 days)", "Persistent (>7 days)", "Long-standing persistent (>1 year)", "Permanent"],
            "required_tests": ["12-lead ECG", "Echocardiography", "Thyroid function", "Holter monitor"]
        },
        "stroke_risk_assessment": {
            "cha2ds2_vasc": "C-HF, H-HTN, A-Age≥75(2), D-DM, S-Stroke(2), V-Vascular, A-Age 65-74, S-Sex(female)",
            "anticoagulation_threshold": "Score ≥2 in men, ≥3 in women"
        },
        "treatment": {
            "rate_control": ["Beta-blockers", "Diltiazem/Verapamil", "Digoxin", "Target HR <110 at rest"],
            "rhythm_control": ["Cardioversion", "Antiarrhythmics (amiodarone, flecainide)", "Catheter ablation"],
            "anticoagulation": ["DOACs preferred (apixaban, rivaroxaban, dabigatran, edoxaban)", "Warfarin if mechanical valve"],
            "stroke_prevention": "CHA2DS2-VASc score guides anticoagulation"
        },
        "prognosis": "Anticoagulation reduces stroke risk by 60-70%",
        "affected_organs": ["heart", "brain"],
        "guideline_source": "ESC 2020, AHA/ACC 2023"
    },
    {
        "id": "hypertension",
        "name": "Essential Hypertension",
        "icd10_code": "I10",
        "category": "cardiovascular",
        "description": "Sustained elevation of blood pressure ≥130/80 mmHg (ACC/AHA) or ≥140/90 mmHg (ESC), without identifiable secondary cause.",
        "synonyms": ["High blood pressure", "HTN", "Primary hypertension"],
        "epidemiology": {
            "prevalence": "~45% of adults worldwide",
            "incidence": "Increases with age - 90% lifetime risk",
            "mortality": "Leading modifiable risk factor for CVD mortality",
            "risk_factors": ["Age", "Obesity", "High sodium diet", "Low potassium", "Physical inactivity", "Alcohol", "Family history"]
        },
        "pathophysiology": "Multifactorial: increased peripheral vascular resistance, RAAS activation, sympathetic overactivity, endothelial dysfunction, arterial stiffness.",
        "clinical_features": {
            "symptoms": ["Usually asymptomatic", "Headache (severe HTN)", "Visual changes", "Epistaxis"],
            "signs": ["Elevated BP on multiple occasions", "Hypertensive retinopathy", "S4 gallop", "Renal bruits"]
        },
        "diagnostic_criteria": {
            "staging": [
                {"stage": "Normal", "systolic": "<120", "diastolic": "<80"},
                {"stage": "Elevated", "systolic": "120-129", "diastolic": "<80"},
                {"stage": "Stage 1", "systolic": "130-139", "diastolic": "80-89"},
                {"stage": "Stage 2", "systolic": "≥140", "diastolic": "≥90"}
            ],
            "required_tests": ["Multiple BP readings", "Ambulatory BP monitoring", "Basic metabolic panel", "Urinalysis", "ECG"]
        },
        "target_organ_damage": ["LVH", "CKD", "Retinopathy", "Stroke", "CAD", "PAD"],
        "treatment": {
            "lifestyle": ["DASH diet", "Sodium <2.3g/day", "Weight loss", "Exercise 150 min/week", "Limit alcohol", "Smoking cessation"],
            "first_line": ["ACE inhibitor/ARB", "Calcium channel blocker", "Thiazide diuretic"],
            "special_populations": {
                "diabetes": "ACE inhibitor/ARB preferred",
                "ckd_proteinuria": "ACE inhibitor/ARB required",
                "black_patients": "CCB or thiazide preferred initial therapy",
                "heart_failure": "ACE inhibitor/ARB + beta-blocker + diuretic"
            },
            "bp_targets": "Generally <130/80; <140/90 acceptable in elderly"
        },
        "prognosis": "10 mmHg reduction in SBP reduces CVD events by 20%, stroke by 27%",
        "affected_organs": ["heart", "brain", "kidneys", "eyes"],
        "guideline_source": "ACC/AHA 2017, ESC 2023"
    },
    {
        "id": "ischemic_stroke",
        "name": "Ischemic Stroke",
        "icd10_code": "I63",
        "category": "cardiovascular",
        "description": "Acute neurological deficit due to cerebral infarction from arterial occlusion (thrombotic or embolic).",
        "synonyms": ["Cerebral infarction", "Brain attack", "CVA"],
        "epidemiology": {
            "prevalence": "Second leading cause of death worldwide",
            "incidence": "~15 million strokes annually worldwide",
            "mortality": "~5.5 million deaths annually",
            "risk_factors": ["Hypertension", "Atrial fibrillation", "Diabetes", "Smoking", "Hyperlipidemia", "Carotid stenosis"]
        },
        "pathophysiology": "Arterial occlusion leads to ischemic core (irreversible) and penumbra (salvageable). Time-dependent neuronal death.",
        "clinical_features": {
            "symptoms": ["Sudden weakness/numbness (face/arm/leg)", "Speech difficulty", "Vision loss", "Severe headache", "Confusion"],
            "signs": ["Focal neurological deficits", "NIHSS score for severity", "BE-FAST assessment"]
        },
        "diagnostic_criteria": {
            "imaging": ["CT head (rule out hemorrhage)", "CT angiography", "MRI/DWI (definitive)"],
            "time_windows": ["tPA within 4.5 hours", "Thrombectomy within 24 hours (selected patients)"]
        },
        "treatment": {
            "acute": ["IV alteplase (tPA) within 4.5h", "Mechanical thrombectomy for LVO", "BP management", "Aspirin within 24-48h"],
            "secondary_prevention": ["Antiplatelet therapy", "Statin", "BP control", "Anticoagulation if AF", "Carotid intervention if significant stenosis"],
            "rehabilitation": ["Physical therapy", "Occupational therapy", "Speech therapy"]
        },
        "prognosis": "tPA reduces disability; thrombectomy NNT=2.6 for good outcome",
        "affected_organs": ["brain"],
        "guideline_source": "AHA/ASA 2019"
    }
]

# ============== RESPIRATORY DISEASES ==============
RESPIRATORY_DISEASES = [
    {
        "id": "copd",
        "name": "Chronic Obstructive Pulmonary Disease",
        "icd10_code": "J44",
        "category": "respiratory",
        "description": "Progressive lung disease characterized by persistent airflow limitation due to airway and/or alveolar abnormalities, usually caused by significant exposure to noxious particles or gases.",
        "synonyms": ["COPD", "Chronic bronchitis", "Emphysema"],
        "epidemiology": {
            "prevalence": "~10% of adults >40 years",
            "incidence": "Third leading cause of death worldwide",
            "mortality": "3 million deaths annually",
            "risk_factors": ["Smoking (90%)", "Occupational exposures", "Air pollution", "Alpha-1 antitrypsin deficiency", "Childhood respiratory infections"]
        },
        "pathophysiology": "Chronic inflammation causing small airway disease (obstructive bronchiolitis) and parenchymal destruction (emphysema). Air trapping and hyperinflation.",
        "clinical_features": {
            "symptoms": ["Progressive dyspnea", "Chronic cough", "Sputum production", "Wheezing", "Chest tightness"],
            "signs": ["Barrel chest", "Pursed lip breathing", "Accessory muscle use", "Decreased breath sounds", "Prolonged expiration"]
        },
        "diagnostic_criteria": {
            "spirometry": "Post-bronchodilator FEV1/FVC <0.70 confirms airflow limitation",
            "gold_staging": [
                {"stage": "GOLD 1 (Mild)", "fev1": "≥80% predicted"},
                {"stage": "GOLD 2 (Moderate)", "fev1": "50-79% predicted"},
                {"stage": "GOLD 3 (Severe)", "fev1": "30-49% predicted"},
                {"stage": "GOLD 4 (Very Severe)", "fev1": "<30% predicted"}
            ],
            "required_tests": ["Spirometry", "Chest X-ray", "ABG (if severe)", "Alpha-1 antitrypsin level"]
        },
        "treatment": {
            "smoking_cessation": "Most important intervention - slows FEV1 decline",
            "bronchodilators": ["SABA (albuterol) PRN", "LABA (salmeterol, formoterol)", "LAMA (tiotropium, umeclidinium)"],
            "combination": ["LABA/LAMA", "LABA/ICS", "Triple therapy (LABA/LAMA/ICS)"],
            "exacerbation": ["Systemic corticosteroids", "Antibiotics if purulent sputum", "Oxygen"],
            "advanced": ["Pulmonary rehabilitation", "Long-term oxygen therapy", "Lung volume reduction surgery"]
        },
        "prognosis": "FEV1 decline ~30-60 mL/year; smoking cessation slows to normal rate",
        "affected_organs": ["lungs", "heart"],
        "guideline_source": "GOLD 2024"
    },
    {
        "id": "asthma",
        "name": "Asthma",
        "icd10_code": "J45",
        "category": "respiratory",
        "description": "Chronic inflammatory airway disease with variable airflow limitation, bronchial hyperresponsiveness, and recurrent symptoms.",
        "synonyms": ["Bronchial asthma", "Reactive airway disease"],
        "epidemiology": {
            "prevalence": "~8% of adults, ~10% of children",
            "incidence": "Often begins in childhood",
            "mortality": "~450,000 deaths annually worldwide",
            "risk_factors": ["Atopy", "Family history", "Obesity", "Smoking exposure", "Occupational exposures", "Respiratory infections"]
        },
        "pathophysiology": "Th2-mediated inflammation with eosinophils, mast cells. Airway remodeling with smooth muscle hypertrophy, mucus hypersecretion, and subepithelial fibrosis.",
        "clinical_features": {
            "symptoms": ["Episodic wheeze", "Dyspnea", "Chest tightness", "Cough (especially nocturnal)", "Symptoms vary over time"],
            "signs": ["Expiratory wheeze", "Prolonged expiration", "Accessory muscle use (severe)", "Pulsus paradoxus (severe)"]
        },
        "diagnostic_criteria": {
            "variable_limitation": "FEV1 increase ≥12% and ≥200mL after bronchodilator",
            "pef_variability": ">10% variability in peak flow",
            "required_tests": ["Spirometry with bronchodilator", "Peak flow monitoring", "FeNO", "Allergy testing"]
        },
        "severity_control": {
            "controlled": "Daytime symptoms ≤2/week, no nocturnal symptoms, no limitation",
            "partly_controlled": "Any measure present: symptoms >2/week, nocturnal symptoms, limitation, reliever >2/week",
            "uncontrolled": "≥3 features of partly controlled"
        },
        "treatment": {
            "step1": "SABA PRN (mild intermittent)",
            "step2": "Low-dose ICS + SABA PRN",
            "step3": "Low-dose ICS/LABA",
            "step4": "Medium-dose ICS/LABA",
            "step5": "High-dose ICS/LABA ± add-on (tiotropium, biologics)",
            "biologics": ["Omalizumab (anti-IgE)", "Mepolizumab/Benralizumab (anti-IL5)", "Dupilumab (anti-IL4/13)"],
            "acute_exacerbation": ["High-dose SABA", "Systemic corticosteroids", "Oxygen", "Consider IV magnesium"]
        },
        "prognosis": "Well-controlled asthma has near-normal life expectancy",
        "affected_organs": ["lungs"],
        "guideline_source": "GINA 2024"
    }
]

# ============== ENDOCRINE DISEASES ==============
ENDOCRINE_DISEASES = [
    {
        "id": "type2_diabetes",
        "name": "Type 2 Diabetes Mellitus",
        "icd10_code": "E11",
        "category": "endocrine",
        "description": "Metabolic disorder characterized by insulin resistance and relative insulin deficiency, resulting in chronic hyperglycemia.",
        "synonyms": ["T2DM", "Adult-onset diabetes", "Non-insulin dependent diabetes"],
        "epidemiology": {
            "prevalence": "~10% of adults worldwide, increasing",
            "incidence": "6.3 million new cases annually (USA)",
            "mortality": "1.5 million deaths directly from diabetes annually",
            "risk_factors": ["Obesity", "Physical inactivity", "Family history", "Age >45", "Ethnicity", "Gestational diabetes history", "PCOS"]
        },
        "pathophysiology": "Progressive beta-cell dysfunction with insulin resistance in liver, muscle, and adipose tissue. Contributes to microvascular and macrovascular complications.",
        "clinical_features": {
            "symptoms": ["Polyuria", "Polydipsia", "Polyphagia", "Weight loss", "Fatigue", "Blurred vision", "Often asymptomatic"],
            "signs": ["Acanthosis nigricans", "Diabetic dermopathy", "Foot ulcers", "Retinopathy"]
        },
        "diagnostic_criteria": {
            "fasting_glucose": "≥126 mg/dL (7.0 mmol/L)",
            "ogtt": "2-hour glucose ≥200 mg/dL (11.1 mmol/L)",
            "hba1c": "≥6.5%",
            "random_glucose": "≥200 mg/dL with symptoms",
            "prediabetes": "FPG 100-125, A1c 5.7-6.4%, 2h OGTT 140-199"
        },
        "complications": {
            "microvascular": ["Retinopathy", "Nephropathy", "Neuropathy"],
            "macrovascular": ["CAD", "Stroke", "PAD"],
            "other": ["Diabetic foot", "Infections", "Gastroparesis"]
        },
        "treatment": {
            "lifestyle": ["Weight loss 5-10%", "150 min/week moderate exercise", "Medical nutrition therapy"],
            "first_line": "Metformin (unless contraindicated)",
            "second_line": {
                "ascvd_present": "GLP-1 RA or SGLT2i with proven CV benefit",
                "heart_failure": "SGLT2 inhibitor",
                "ckd": "SGLT2 inhibitor or GLP-1 RA",
                "weight_priority": "GLP-1 RA or SGLT2i",
                "cost_priority": "Sulfonylurea or TZD"
            },
            "insulin": "If A1c >10%, symptoms, or failure of oral agents",
            "targets": "A1c <7% (individualize: <6.5% if young, <8% if elderly/comorbid)"
        },
        "monitoring": ["A1c every 3-6 months", "Annual eye exam", "Annual foot exam", "Annual urine albumin", "Lipid panel"],
        "prognosis": "Good glycemic control reduces microvascular complications by 25-40%",
        "affected_organs": ["pancreas", "kidneys", "eyes", "heart", "nerves"],
        "guideline_source": "ADA 2024, EASD 2022"
    },
    {
        "id": "hypothyroidism",
        "name": "Hypothyroidism",
        "icd10_code": "E03",
        "category": "endocrine",
        "description": "Clinical syndrome resulting from deficiency of thyroid hormones, most commonly due to autoimmune thyroiditis (Hashimoto's).",
        "synonyms": ["Underactive thyroid", "Myxedema"],
        "epidemiology": {
            "prevalence": "4-5% of population (overt + subclinical)",
            "incidence": "More common in women (5-8x)",
            "risk_factors": ["Female sex", "Age >60", "Family history", "Autoimmune disease", "Prior thyroid surgery/radiation", "Iodine deficiency/excess"]
        },
        "pathophysiology": "Hashimoto's thyroiditis: autoimmune destruction of thyroid gland with anti-TPO and anti-thyroglobulin antibodies. Reduced T4/T3 production leads to elevated TSH.",
        "clinical_features": {
            "symptoms": ["Fatigue", "Weight gain", "Cold intolerance", "Constipation", "Dry skin", "Hair loss", "Depression", "Menstrual irregularities"],
            "signs": ["Bradycardia", "Delayed relaxation of reflexes", "Periorbital edema", "Non-pitting edema", "Goiter"]
        },
        "diagnostic_criteria": {
            "primary": "Elevated TSH with low free T4",
            "subclinical": "Elevated TSH with normal free T4",
            "tsh_reference": "0.4-4.0 mIU/L (varies by lab)",
            "antibodies": "Anti-TPO positive in 90% of Hashimoto's"
        },
        "treatment": {
            "medication": "Levothyroxine (T4 replacement)",
            "dosing": "1.6 mcg/kg/day full replacement; start lower in elderly/cardiac",
            "monitoring": "TSH 6-8 weeks after dose change, then annually",
            "target": "TSH in normal range (consider age-specific targets in elderly)"
        },
        "prognosis": "Excellent with appropriate levothyroxine replacement",
        "affected_organs": ["thyroid", "heart", "brain"],
        "guideline_source": "ATA 2014"
    }
]

# ============== RENAL DISEASES ==============
RENAL_DISEASES = [
    {
        "id": "chronic_kidney_disease",
        "name": "Chronic Kidney Disease",
        "icd10_code": "N18",
        "category": "renal",
        "description": "Abnormalities of kidney structure or function present for >3 months, with implications for health. Defined by GFR <60 or markers of kidney damage.",
        "synonyms": ["CKD", "Chronic renal failure", "Chronic renal insufficiency"],
        "epidemiology": {
            "prevalence": "~10% of global population",
            "incidence": "Major cause of ESRD requiring dialysis",
            "mortality": "CKD is a CVD risk equivalent",
            "risk_factors": ["Diabetes", "Hypertension", "Glomerulonephritis", "PCKD", "Nephrotoxins", "Age", "Family history"]
        },
        "pathophysiology": "Progressive nephron loss leads to hyperfiltration of remaining nephrons, proteinuria, fibrosis, and GFR decline. Complications from loss of excretory, endocrine, and metabolic functions.",
        "clinical_features": {
            "symptoms": ["Often asymptomatic until advanced", "Fatigue", "Nausea", "Pruritus", "Edema", "Dyspnea"],
            "signs": ["Hypertension", "Pallor (anemia)", "Asterixis (uremia)", "Pericardial rub", "Peripheral edema"]
        },
        "diagnostic_criteria": {
            "gfr_staging": [
                {"stage": "G1", "gfr": "≥90", "description": "Normal GFR with kidney damage markers"},
                {"stage": "G2", "gfr": "60-89", "description": "Mildly decreased"},
                {"stage": "G3a", "gfr": "45-59", "description": "Mild-moderate decrease"},
                {"stage": "G3b", "gfr": "30-44", "description": "Moderate-severe decrease"},
                {"stage": "G4", "gfr": "15-29", "description": "Severely decreased"},
                {"stage": "G5", "gfr": "<15", "description": "Kidney failure"}
            ],
            "albuminuria": "A1 (<30), A2 (30-300), A3 (>300 mg/g creatinine)",
            "required_tests": ["Serum creatinine/eGFR", "Urinalysis", "Urine albumin-to-creatinine ratio", "Renal ultrasound"]
        },
        "complications": ["Anemia", "Metabolite bone disease", "Hyperkalemia", "Metabolic acidosis", "Volume overload", "CVD"],
        "treatment": {
            "slow_progression": ["ACE inhibitor/ARB (if proteinuria)", "SGLT2 inhibitor", "BP control (<130/80)", "Glycemic control"],
            "complications": ["EPO for anemia", "Phosphate binders", "Vitamin D", "Bicarbonate for acidosis"],
            "renal_replacement": ["Hemodialysis", "Peritoneal dialysis", "Kidney transplant"],
            "avoid_nephrotoxins": ["NSAIDs", "Aminoglycosides", "IV contrast (with precautions)"]
        },
        "prognosis": "SGLT2i and ACEi/ARB slow progression by 30-40%",
        "affected_organs": ["kidneys", "heart", "bones"],
        "guideline_source": "KDIGO 2024"
    }
]

# ============== NEUROLOGICAL DISEASES ==============
NEUROLOGICAL_DISEASES = [
    {
        "id": "multiple_sclerosis",
        "name": "Multiple Sclerosis",
        "icd10_code": "G35",
        "category": "neurological",
        "description": "Chronic autoimmune demyelinating disease of the CNS characterized by inflammation, demyelination, and neurodegeneration.",
        "synonyms": ["MS", "Disseminated sclerosis"],
        "epidemiology": {
            "prevalence": "~1 million in USA, 2.8 million worldwide",
            "incidence": "Peak onset 20-40 years",
            "risk_factors": ["Female sex (3:1)", "Northern latitude", "Low vitamin D", "EBV infection", "Smoking", "Genetics (HLA-DRB1)"]
        },
        "pathophysiology": "Autoreactive T cells cross BBB, triggering inflammatory cascade with demyelination and axonal injury. Progressive neurodegeneration.",
        "clinical_features": {
            "symptoms": ["Visual disturbance (optic neuritis)", "Sensory symptoms", "Motor weakness", "Fatigue", "Cognitive impairment", "Bladder dysfunction"],
            "signs": ["Internuclear ophthalmoplegia", "Lhermitte's sign", "Uhthoff phenomenon", "Spasticity", "Ataxia"]
        },
        "diagnostic_criteria": {
            "mcdonald_criteria": "Dissemination in space (DIS) and time (DIT)",
            "required_tests": ["MRI brain and spine (with gadolinium)", "CSF analysis (oligoclonal bands)", "Visual evoked potentials"],
            "subtypes": ["Relapsing-remitting (85%)", "Secondary progressive", "Primary progressive"]
        },
        "treatment": {
            "acute_relapse": "High-dose IV methylprednisolone (1g daily x 3-5 days)",
            "disease_modifying": {
                "injectable": ["Interferon beta", "Glatiramer acetate"],
                "oral": ["Dimethyl fumarate", "Fingolimod", "Teriflunomide"],
                "infusion": ["Natalizumab", "Ocrelizumab", "Alemtuzumab"]
            },
            "symptomatic": ["Baclofen (spasticity)", "Amantadine (fatigue)", "Bladder management"]
        },
        "prognosis": "High-efficacy DMTs reduce relapse rate by 50-70%",
        "affected_organs": ["brain", "spinal_cord", "eyes"],
        "guideline_source": "AAN 2018"
    },
    {
        "id": "parkinsons_disease",
        "name": "Parkinson's Disease",
        "icd10_code": "G20",
        "category": "neurological",
        "description": "Progressive neurodegenerative disorder characterized by loss of dopaminergic neurons in substantia nigra and presence of Lewy bodies.",
        "synonyms": ["PD", "Parkinsonism", "Paralysis agitans"],
        "epidemiology": {
            "prevalence": "1% of population >60 years",
            "incidence": "Increases with age, more common in men",
            "risk_factors": ["Age", "Male sex", "Family history", "Pesticide exposure", "Head trauma", "Rural living"]
        },
        "pathophysiology": "Loss of dopaminergic neurons in substantia nigra pars compacta with alpha-synuclein aggregation (Lewy bodies). Results in dopamine deficiency in striatum.",
        "clinical_features": {
            "cardinal_motor": ["Bradykinesia (required)", "Resting tremor (pill-rolling)", "Rigidity (cogwheel)", "Postural instability"],
            "non_motor": ["Anosmia", "REM sleep behavior disorder", "Constipation", "Depression", "Cognitive impairment", "Autonomic dysfunction"]
        },
        "diagnostic_criteria": {
            "clinical": "Bradykinesia + tremor or rigidity",
            "supportive": "Unilateral onset, rest tremor, excellent response to levodopa",
            "imaging": "DaTscan (dopamine transporter imaging)"
        },
        "treatment": {
            "dopaminergic": ["Levodopa/carbidopa (most effective)", "Dopamine agonists (pramipexole, ropinirole)", "MAO-B inhibitors (selegiline, rasagiline)"],
            "adjunct": ["COMT inhibitors (entacapone)", "Amantadine (dyskinesia)"],
            "advanced": ["Deep brain stimulation", "Levodopa-carbidopa intestinal gel"],
            "non_motor": ["Antidepressants", "Cholinesterase inhibitors (dementia)", "RBD management"]
        },
        "prognosis": "Progressive over 10-20 years; complications from motor fluctuations and non-motor symptoms",
        "affected_organs": ["brain"],
        "guideline_source": "MDS 2019, AAN 2006"
    }
]

# ============== HEMATOLOGICAL DISEASES ==============
HEMATOLOGICAL_DISEASES = [
    {
        "id": "iron_deficiency_anemia",
        "name": "Iron Deficiency Anemia",
        "icd10_code": "D50",
        "category": "hematological",
        "description": "Anemia due to insufficient iron for hemoglobin synthesis, the most common cause of anemia worldwide.",
        "synonyms": ["IDA", "Microcytic anemia"],
        "epidemiology": {
            "prevalence": "~25% of world population",
            "risk_factors": ["Menstruation", "Pregnancy", "GI blood loss", "Malabsorption", "Poor dietary intake", "Chronic disease"]
        },
        "pathophysiology": "Iron deficiency leads to impaired hemoglobin synthesis, resulting in microcytic, hypochromic red blood cells.",
        "clinical_features": {
            "symptoms": ["Fatigue", "Weakness", "Dyspnea on exertion", "Pica", "Pagophagia", "Restless legs"],
            "signs": ["Pallor", "Koilonychia", "Angular cheilitis", "Glossitis", "Tachycardia"]
        },
        "diagnostic_criteria": {
            "cbc": "Low Hb, low MCV (<80), low MCH",
            "iron_studies": "Low ferritin (<30), low serum iron, high TIBC, low transferrin saturation (<20%)",
            "required_tests": ["CBC with indices", "Ferritin", "Iron studies", "Reticulocyte count"]
        },
        "treatment": {
            "oral_iron": "Ferrous sulfate 325mg TID (65mg elemental iron)",
            "iv_iron": "If oral intolerant, malabsorption, or severe anemia",
            "treat_cause": "Evaluate for GI blood loss (endoscopy), heavy menstruation, etc.",
            "response": "Reticulocyte response in 1 week, Hb rise 1-2 g/dL per month"
        },
        "prognosis": "Excellent with iron replacement and treatment of underlying cause",
        "affected_organs": ["blood", "heart"],
        "guideline_source": "ASH 2020"
    },
    {
        "id": "sickle_cell_disease",
        "name": "Sickle Cell Disease",
        "icd10_code": "D57",
        "category": "hematological",
        "description": "Inherited hemoglobinopathy with abnormal hemoglobin S causing RBC sickling, vaso-occlusion, and hemolysis.",
        "synonyms": ["SCD", "Sickle cell anemia", "HbSS disease"],
        "epidemiology": {
            "prevalence": "~100,000 in USA, millions worldwide (especially Africa)",
            "inheritance": "Autosomal recessive (HBB gene mutation)",
            "risk_factors": ["African, Mediterranean, Middle Eastern, Indian ancestry"]
        },
        "pathophysiology": "Glutamic acid to valine substitution at position 6 of beta-globin. HbS polymerizes when deoxygenated, causing RBC sickling, vaso-occlusion, and chronic hemolysis.",
        "clinical_features": {
            "acute": ["Vaso-occlusive crisis (pain)", "Acute chest syndrome", "Stroke", "Splenic sequestration", "Aplastic crisis"],
            "chronic": ["Chronic pain", "Avascular necrosis", "Leg ulcers", "Pulmonary hypertension", "CKD", "Retinopathy"]
        },
        "diagnostic_criteria": {
            "newborn_screening": "Hemoglobin electrophoresis showing HbS",
            "confirmatory": "Hemoglobin electrophoresis, HPLC, genetic testing",
            "cbc": "Chronic hemolytic anemia (Hb 6-9), reticulocytosis, sickle cells on smear"
        },
        "treatment": {
            "disease_modifying": ["Hydroxyurea (increases HbF)", "L-glutamine", "Voxelotor", "Crizanlizumab"],
            "curative": ["Allogeneic stem cell transplant", "Gene therapy (emerging)"],
            "acute_crisis": ["IV fluids", "Opioid analgesia", "Oxygen (if hypoxic)", "Transfusion (if severe)"],
            "prevention": ["Penicillin prophylaxis (until age 5)", "Vaccines", "Hydroxyurea"]
        },
        "prognosis": "Median survival ~50 years with modern care; hydroxyurea reduces complications",
        "affected_organs": ["blood", "spleen", "lungs", "brain", "kidneys", "bones"],
        "guideline_source": "ASH 2020, NHLBI 2014"
    },
    {
        "id": "hemophilia_a",
        "name": "Hemophilia A",
        "icd10_code": "D66",
        "category": "hematological",
        "description": "X-linked recessive bleeding disorder caused by deficiency of coagulation factor VIII.",
        "synonyms": ["Classic hemophilia", "Factor VIII deficiency"],
        "epidemiology": {
            "prevalence": "1 in 5,000 male births",
            "inheritance": "X-linked recessive (primarily affects males)"
        },
        "pathophysiology": "Factor VIII deficiency impairs intrinsic coagulation pathway, leading to inadequate thrombin generation and poor clot formation.",
        "clinical_features": {
            "symptoms": ["Spontaneous joint bleeds (hemarthrosis)", "Muscle hematomas", "Prolonged bleeding after trauma/surgery", "Intracranial hemorrhage"],
            "severity": {
                "severe": "Factor VIII <1% - spontaneous bleeds",
                "moderate": "Factor VIII 1-5% - bleeds with minor trauma",
                "mild": "Factor VIII 5-40% - bleeds with surgery/major trauma"
            }
        },
        "diagnostic_criteria": {
            "coagulation": "Prolonged aPTT, normal PT",
            "factor_assay": "Low factor VIII activity",
            "genetic": "F8 gene mutation analysis"
        },
        "treatment": {
            "replacement": ["Factor VIII concentrates (recombinant or plasma-derived)", "Emicizumab (factor VIII mimetic)"],
            "prophylaxis": "Regular factor replacement to prevent bleeds",
            "acute_bleed": "Factor VIII replacement to target levels",
            "emerging": "Gene therapy"
        },
        "prognosis": "Near-normal life expectancy with prophylaxis; joint disease major morbidity",
        "affected_organs": ["blood", "joints", "muscles"],
        "guideline_source": "WFH 2020"
    },
    {
        "id": "von_willebrand_disease",
        "name": "von Willebrand Disease",
        "icd10_code": "D68.0",
        "category": "hematological",
        "description": "Most common inherited bleeding disorder caused by deficiency or dysfunction of von Willebrand factor.",
        "synonyms": ["VWD", "von Willebrand's disease"],
        "epidemiology": {
            "prevalence": "~1% of population (mostly mild)",
            "inheritance": "Usually autosomal dominant"
        },
        "pathophysiology": "VWF mediates platelet adhesion and carries factor VIII. Deficiency causes mucocutaneous bleeding and reduced FVIII levels.",
        "clinical_features": {
            "symptoms": ["Mucocutaneous bleeding", "Epistaxis", "Menorrhagia", "Easy bruising", "GI bleeding", "Post-surgical bleeding"],
            "types": {
                "type1": "Partial quantitative deficiency (75%)",
                "type2": "Qualitative defects (20%)",
                "type3": "Complete deficiency (rare, severe)"
            }
        },
        "diagnostic_criteria": {
            "tests": ["VWF antigen", "VWF activity (ristocetin cofactor)", "Factor VIII level", "Multimer analysis"],
            "bleeding_history": "ISTH Bleeding Assessment Tool"
        },
        "treatment": {
            "desmopressin": "DDAVP - releases VWF stores (Type 1, some Type 2)",
            "replacement": "VWF/FVIII concentrate (if DDAVP contraindicated)",
            "antifibrinolytics": "Tranexamic acid, aminocaproic acid",
            "menorrhagia": "Hormonal therapy, IUD"
        },
        "prognosis": "Excellent with appropriate treatment",
        "affected_organs": ["blood"],
        "guideline_source": "ASH/ISTH 2021"
    },
    {
        "id": "thalassemia_major",
        "name": "Beta-Thalassemia Major",
        "icd10_code": "D56.1",
        "category": "hematological",
        "description": "Severe inherited hemoglobinopathy with absent or markedly reduced beta-globin chain synthesis, causing severe anemia requiring regular transfusions.",
        "synonyms": ["Cooley's anemia", "Transfusion-dependent thalassemia"],
        "epidemiology": {
            "prevalence": "Common in Mediterranean, Middle East, Southeast Asia",
            "inheritance": "Autosomal recessive"
        },
        "pathophysiology": "Absent/reduced beta-globin leads to excess alpha-chains, which precipitate and damage RBC precursors (ineffective erythropoiesis) and mature RBCs (hemolysis).",
        "clinical_features": {
            "symptoms": ["Severe anemia (presents at 6-24 months)", "Failure to thrive", "Pallor", "Jaundice"],
            "complications": ["Iron overload (transfusions)", "Hepatosplenomegaly", "Bone deformities", "Growth retardation", "Cardiac disease"]
        },
        "diagnostic_criteria": {
            "cbc": "Severe microcytic anemia (Hb <7), target cells, nucleated RBCs",
            "hemoglobin_electrophoresis": "HbA absent/reduced, HbF elevated, HbA2 variable",
            "genetic": "Beta-globin gene mutation analysis"
        },
        "treatment": {
            "transfusion": "Regular transfusions to maintain Hb >9-10",
            "iron_chelation": ["Deferoxamine (IV/SC)", "Deferasirox (oral)", "Deferiprone (oral)"],
            "curative": "Allogeneic stem cell transplant, gene therapy (emerging)",
            "monitoring": "Ferritin, cardiac MRI T2*, liver iron"
        },
        "prognosis": "With optimal care, survival into 4th-5th decade; cardiac iron overload main cause of death",
        "affected_organs": ["blood", "heart", "liver", "spleen", "bones"],
        "guideline_source": "TIF 2021"
    },
    {
        "id": "aplastic_anemia",
        "name": "Aplastic Anemia",
        "icd10_code": "D61",
        "category": "hematological",
        "description": "Bone marrow failure syndrome with pancytopenia and hypocellular bone marrow.",
        "synonyms": ["AA", "Bone marrow failure"],
        "epidemiology": {
            "incidence": "2 per million/year in Western countries",
            "causes": ["Idiopathic (70%)", "Drugs", "Viruses", "Radiation", "Inherited (Fanconi anemia)"]
        },
        "pathophysiology": "Immune-mediated destruction of hematopoietic stem cells by autoreactive T cells in most cases.",
        "clinical_features": {
            "symptoms": ["Fatigue (anemia)", "Bleeding (thrombocytopenia)", "Infections (neutropenia)"],
            "signs": ["Pallor", "Petechiae", "Bruising", "No hepatosplenomegaly"]
        },
        "diagnostic_criteria": {
            "cbc": "Pancytopenia (low Hb, WBC, platelets)",
            "bone_marrow": "Hypocellular (<25% cellularity) with fat replacement",
            "severity": {
                "severe": "ANC <500, platelets <20K, reticulocytes <20K",
                "very_severe": "ANC <200"
            }
        },
        "treatment": {
            "supportive": ["Transfusions", "Prophylactic antibiotics/antifungals", "Growth factors"],
            "definitive": {
                "young_with_donor": "Allogeneic stem cell transplant",
                "older_or_no_donor": "Immunosuppressive therapy (ATG + cyclosporine)"
            }
        },
        "prognosis": "75% response to IST; transplant cure rate 80-90% in young patients",
        "affected_organs": ["bone_marrow", "blood"],
        "guideline_source": "BSH 2016"
    }
]

# ============== ONCOLOGICAL DISEASES ==============
ONCOLOGICAL_DISEASES = [
    {
        "id": "breast_cancer",
        "name": "Breast Cancer",
        "icd10_code": "C50",
        "category": "oncology",
        "description": "Malignant neoplasm of breast tissue, most commonly arising from ductal or lobular epithelium.",
        "synonyms": ["Breast carcinoma", "Mammary carcinoma"],
        "epidemiology": {
            "prevalence": "Most common cancer in women worldwide",
            "incidence": "~2 million new cases annually",
            "mortality": "~685,000 deaths annually",
            "risk_factors": ["Female sex", "Age", "BRCA1/2 mutations", "Family history", "Early menarche/late menopause", "Nulliparity", "HRT", "Obesity", "Alcohol"]
        },
        "subtypes": {
            "luminal_a": "ER+, PR+, HER2-, low Ki67 (best prognosis)",
            "luminal_b": "ER+, PR+/-, HER2+/-, high Ki67",
            "her2_positive": "HER2 overexpression/amplification",
            "triple_negative": "ER-, PR-, HER2- (worst prognosis)"
        },
        "clinical_features": {
            "symptoms": ["Breast lump", "Nipple discharge", "Skin changes", "Often detected on screening"],
            "signs": ["Palpable mass", "Axillary lymphadenopathy", "Skin dimpling", "Peau d'orange"]
        },
        "diagnostic_criteria": {
            "screening": "Mammography (annual/biennial from age 40-50)",
            "workup": ["Mammography", "Ultrasound", "MRI", "Core biopsy"],
            "pathology": "Histology, grade, ER/PR, HER2, Ki67"
        },
        "treatment": {
            "surgery": ["Lumpectomy + radiation", "Mastectomy", "Sentinel lymph node biopsy"],
            "systemic": {
                "hormone_positive": "Endocrine therapy (tamoxifen, aromatase inhibitors) ± CDK4/6 inhibitors",
                "her2_positive": "Trastuzumab ± pertuzumab + chemotherapy",
                "triple_negative": "Chemotherapy ± immunotherapy (pembrolizumab)"
            },
            "radiation": "After breast-conserving surgery; post-mastectomy if high-risk"
        },
        "prognosis": "5-year survival: Stage I >90%, Stage IV ~30%",
        "affected_organs": ["breast", "lymph_nodes", "liver", "lungs", "bones", "brain"],
        "guideline_source": "NCCN 2024, ESMO 2023"
    },
    {
        "id": "colorectal_cancer",
        "name": "Colorectal Cancer",
        "icd10_code": "C18-C20",
        "category": "oncology",
        "description": "Malignant neoplasm of colon or rectum, typically arising from adenomatous polyps through adenoma-carcinoma sequence.",
        "synonyms": ["CRC", "Colon cancer", "Bowel cancer"],
        "epidemiology": {
            "prevalence": "Third most common cancer worldwide",
            "incidence": "~1.9 million new cases annually",
            "mortality": "~900,000 deaths annually",
            "risk_factors": ["Age >50", "Family history", "Lynch syndrome", "FAP", "IBD", "Red/processed meat", "Obesity", "Smoking", "Alcohol"]
        },
        "clinical_features": {
            "symptoms": ["Change in bowel habits", "Rectal bleeding", "Abdominal pain", "Weight loss", "Iron deficiency anemia"],
            "signs": ["Palpable mass", "Hepatomegaly (metastases)", "Obstruction"]
        },
        "diagnostic_criteria": {
            "screening": ["Colonoscopy every 10 years from age 45", "FIT annually", "CT colonography"],
            "workup": ["Colonoscopy with biopsy", "CT chest/abdomen/pelvis", "CEA level", "MSI/MMR testing"],
            "staging": "TNM staging"
        },
        "treatment": {
            "surgery": "Resection with lymphadenectomy (curative for localized)",
            "chemotherapy": {
                "adjuvant": "FOLFOX/CAPOX for stage III",
                "metastatic": "FOLFOX/FOLFIRI ± targeted therapy"
            },
            "targeted": ["Bevacizumab (anti-VEGF)", "Cetuximab/Panitumumab (anti-EGFR, RAS wild-type)", "Pembrolizumab (MSI-H/dMMR)"],
            "rectal": "Neoadjuvant chemoradiation for locally advanced"
        },
        "prognosis": "5-year survival: Stage I >90%, Stage IV ~15%",
        "affected_organs": ["colon", "rectum", "liver", "lungs", "peritoneum"],
        "guideline_source": "NCCN 2024, ESMO 2023"
    },
    {
        "id": "prostate_cancer",
        "name": "Prostate Cancer",
        "icd10_code": "C61",
        "category": "oncology",
        "description": "Malignant neoplasm of the prostate gland, the most common cancer in men.",
        "synonyms": ["Prostatic carcinoma", "Prostate adenocarcinoma"],
        "epidemiology": {
            "prevalence": "Most common cancer in men (excluding skin)",
            "incidence": "~1.4 million new cases annually",
            "mortality": "~375,000 deaths annually",
            "risk_factors": ["Age >50", "African ancestry", "Family history", "BRCA2 mutation"]
        },
        "clinical_features": {
            "early": "Often asymptomatic, detected on screening",
            "symptoms": ["Urinary frequency/hesitancy", "Nocturia", "Hematuria", "Erectile dysfunction", "Bone pain (metastatic)"],
            "signs": ["Abnormal DRE (nodule, asymmetry)", "Elevated PSA"]
        },
        "diagnostic_criteria": {
            "screening": "PSA ± DRE (shared decision-making age 50-69)",
            "workup": ["PSA", "Multiparametric MRI", "Prostate biopsy"],
            "grading": "Gleason score / Grade Group (1-5)"
        },
        "risk_stratification": {
            "low": "T1-T2a, Gleason ≤6, PSA <10",
            "intermediate": "T2b-T2c, Gleason 7, PSA 10-20",
            "high": "T3a, Gleason 8-10, PSA >20"
        },
        "treatment": {
            "localized_low_risk": "Active surveillance",
            "localized_intermediate_high": ["Radical prostatectomy", "Radiation + ADT"],
            "advanced": {
                "hormone_sensitive": "ADT ± docetaxel ± novel hormonal agents",
                "castration_resistant": "Abiraterone, Enzalutamide, Docetaxel, Cabazitaxel, PARP inhibitors (BRCA+)"
            }
        },
        "prognosis": "5-year survival: Localized >98%, Distant ~30%",
        "affected_organs": ["prostate", "bones", "lymph_nodes", "liver", "lungs"],
        "guideline_source": "NCCN 2024, EAU 2023"
    }
]

# ============== GENETIC/CHROMOSOMAL DISEASES ==============
GENETIC_DISEASES = [
    {
        "id": "down_syndrome",
        "name": "Down Syndrome",
        "icd10_code": "Q90",
        "category": "genetic",
        "description": "Chromosomal disorder caused by trisomy 21, characterized by intellectual disability and distinctive physical features.",
        "synonyms": ["Trisomy 21", "DS"],
        "epidemiology": {
            "prevalence": "~1 in 700 live births",
            "risk_factors": ["Advanced maternal age (exponential increase >35)"]
        },
        "pathophysiology": "Extra copy of chromosome 21 leads to overexpression of genes, affecting multiple organ systems.",
        "clinical_features": {
            "physical": ["Flat facial profile", "Upslanting palpebral fissures", "Epicanthal folds", "Single palmar crease", "Hypotonia", "Short stature"],
            "medical": ["Congenital heart disease (40-50%)", "GI abnormalities", "Hypothyroidism", "Atlantoaxial instability", "Early-onset Alzheimer's", "Leukemia risk"]
        },
        "diagnostic_criteria": {
            "prenatal": ["Cell-free DNA screening", "Maternal serum markers", "Amniocentesis/CVS for karyotype"],
            "postnatal": "Karyotype confirmation"
        },
        "treatment": {
            "multidisciplinary": "Cardiology, endocrinology, developmental pediatrics",
            "early_intervention": "Speech, physical, occupational therapy",
            "screening": "Annual thyroid, cardiac evaluation, vision/hearing"
        },
        "prognosis": "Life expectancy ~60 years with modern care",
        "affected_organs": ["heart", "brain", "thyroid", "gi_tract"],
        "guideline_source": "AAP 2022"
    },
    {
        "id": "turner_syndrome",
        "name": "Turner Syndrome",
        "icd10_code": "Q96",
        "category": "genetic",
        "description": "Chromosomal disorder affecting females caused by complete or partial absence of one X chromosome (45,X).",
        "synonyms": ["Monosomy X", "TS"],
        "epidemiology": {
            "prevalence": "~1 in 2,000-2,500 female births",
            "note": "95% of 45,X conceptions result in spontaneous abortion"
        },
        "clinical_features": {
            "physical": ["Short stature", "Webbed neck", "Shield chest", "Widely spaced nipples", "Lymphedema (hands/feet at birth)", "Low hairline"],
            "medical": ["Gonadal dysgenesis (infertility)", "Congenital heart disease (coarctation, bicuspid aortic valve)", "Renal anomalies", "Hypothyroidism", "Hearing loss"]
        },
        "diagnostic_criteria": {
            "karyotype": "45,X or mosaic (45,X/46,XX)",
            "prenatal": "NIPT, amniocentesis"
        },
        "treatment": {
            "growth": "Growth hormone therapy",
            "puberty": "Estrogen replacement for pubertal induction",
            "cardiovascular": "Regular imaging for aortic dilatation/dissection",
            "fertility": "Egg donation, IVF (if uterus present)"
        },
        "prognosis": "Near-normal life expectancy with cardiac monitoring",
        "affected_organs": ["ovaries", "heart", "kidneys", "thyroid"],
        "guideline_source": "Cincinnati Guidelines 2017"
    },
    {
        "id": "marfan_syndrome",
        "name": "Marfan Syndrome",
        "icd10_code": "Q87.4",
        "category": "genetic",
        "description": "Autosomal dominant connective tissue disorder caused by FBN1 mutations affecting fibrillin-1.",
        "synonyms": ["MFS"],
        "epidemiology": {
            "prevalence": "~1 in 5,000",
            "inheritance": "Autosomal dominant (25% de novo)"
        },
        "pathophysiology": "Defective fibrillin-1 leads to abnormal TGF-β signaling, affecting connective tissue in multiple organs.",
        "clinical_features": {
            "skeletal": ["Tall stature", "Arachnodactyly", "Pectus deformity", "Scoliosis", "Joint hypermobility"],
            "cardiovascular": ["Aortic root dilatation", "Aortic dissection", "Mitral valve prolapse"],
            "ocular": ["Ectopia lentis (lens dislocation)", "Myopia", "Retinal detachment"]
        },
        "diagnostic_criteria": {
            "ghent_criteria": "Based on systemic score, aortic root Z-score, ectopia lentis, FBN1 mutation",
            "workup": ["Echocardiography", "Slit-lamp eye exam", "FBN1 genetic testing"]
        },
        "treatment": {
            "cardiovascular": ["Beta-blockers (reduce aortic stress)", "ARBs (losartan)", "Prophylactic aortic surgery (diameter >50mm)"],
            "activity": "Avoid contact sports, isometric exercise",
            "surveillance": "Annual echo, regular eye exams"
        },
        "prognosis": "Life expectancy ~70 years with modern management; aortic dissection main cause of death",
        "affected_organs": ["heart", "aorta", "eyes", "skeleton"],
        "guideline_source": "ACC/AHA 2022"
    }
]

# ============== LEUKEMIAS ==============
LEUKEMIA_DISEASES = [
    {
        "id": "acute_lymphoblastic_leukemia",
        "name": "Acute Lymphoblastic Leukemia",
        "icd10_code": "C91.0",
        "category": "hematological_malignancy",
        "description": "Aggressive hematologic malignancy characterized by clonal proliferation of lymphoid precursors (blasts) in bone marrow and blood.",
        "synonyms": ["ALL", "Acute lymphocytic leukemia"],
        "epidemiology": {
            "incidence": "Most common childhood cancer (peak 2-5 years); also occurs in adults",
            "prognosis_factor": "Age, WBC count, cytogenetics (Ph chromosome)"
        },
        "clinical_features": {
            "symptoms": ["Fatigue", "Pallor", "Bleeding", "Infections", "Bone pain", "Lymphadenopathy"],
            "signs": ["Hepatosplenomegaly", "Lymphadenopathy", "Petechiae", "CNS involvement (headache, cranial nerve palsies)"]
        },
        "diagnostic_criteria": {
            "bone_marrow": "≥20% lymphoblasts",
            "immunophenotype": "B-ALL vs T-ALL",
            "cytogenetics": "Ph+ (BCR-ABL), MLL rearrangements, hyperdiploidy"
        },
        "treatment": {
            "induction": "Multiagent chemotherapy (vincristine, prednisone, asparaginase, anthracycline)",
            "consolidation": "Intensification cycles",
            "maintenance": "Low-dose chemotherapy for 2-3 years",
            "cns_prophylaxis": "Intrathecal methotrexate",
            "targeted": ["TKIs for Ph+ ALL", "Blinatumomab (BiTE)", "Inotuzumab", "CAR-T cells"],
            "transplant": "Allogeneic SCT for high-risk"
        },
        "prognosis": "Pediatric cure rate >90%; adult 40-50%",
        "affected_organs": ["bone_marrow", "blood", "lymph_nodes", "cns", "liver", "spleen"],
        "guideline_source": "NCCN 2024"
    },
    {
        "id": "acute_myeloid_leukemia",
        "name": "Acute Myeloid Leukemia",
        "icd10_code": "C92.0",
        "category": "hematological_malignancy",
        "description": "Aggressive hematologic malignancy with clonal proliferation of myeloid precursors.",
        "synonyms": ["AML", "Acute myelogenous leukemia"],
        "epidemiology": {
            "incidence": "Most common acute leukemia in adults (median age 68)",
            "risk_factors": ["Prior chemotherapy/radiation", "Myelodysplastic syndrome", "Benzene exposure"]
        },
        "clinical_features": {
            "symptoms": ["Fatigue", "Infections", "Bleeding", "Bone pain"],
            "signs": ["Pallor", "Petechiae", "Gum hypertrophy (M4/M5)", "Leukostasis if WBC very high"]
        },
        "diagnostic_criteria": {
            "bone_marrow": "≥20% myeloblasts",
            "cytogenetics": "Favorable: t(15;17), inv(16), t(8;21); Adverse: complex, -5, -7",
            "molecular": "FLT3, NPM1, IDH1/2, TP53"
        },
        "treatment": {
            "intensive": "7+3 (cytarabine + anthracycline) for fit patients",
            "consolidation": "High-dose cytarabine or transplant",
            "non_intensive": "Venetoclax + azacitidine for unfit",
            "targeted": ["Midostaurin (FLT3+)", "Ivosidenib/Enasidenib (IDH1/2)", "Gemtuzumab ozogamicin (CD33+)"],
            "apl": "ATRA + arsenic trioxide (APL is curable)"
        },
        "prognosis": "5-year survival: 30% overall; APL >90% cure",
        "affected_organs": ["bone_marrow", "blood", "liver", "spleen", "skin", "gums"],
        "guideline_source": "NCCN 2024, ELN 2022"
    },
    {
        "id": "chronic_lymphocytic_leukemia",
        "name": "Chronic Lymphocytic Leukemia",
        "icd10_code": "C91.1",
        "category": "hematological_malignancy",
        "description": "Indolent B-cell malignancy characterized by accumulation of mature-appearing lymphocytes.",
        "synonyms": ["CLL", "Small lymphocytic lymphoma (SLL)"],
        "epidemiology": {
            "incidence": "Most common leukemia in Western adults (median age 70)",
            "risk_factors": ["Age", "Family history", "Male sex"]
        },
        "clinical_features": {
            "symptoms": ["Often asymptomatic", "Fatigue", "Lymphadenopathy", "B symptoms", "Infections"],
            "signs": ["Lymphadenopathy", "Hepatosplenomegaly"]
        },
        "diagnostic_criteria": {
            "blood": "≥5000/μL clonal B lymphocytes",
            "immunophenotype": "CD5+, CD19+, CD23+, weak sIg",
            "prognostic": "IGHV mutation status, del(17p)/TP53, del(11q)"
        },
        "staging": {
            "rai": "0-IV based on lymphocytosis, nodes, organomegaly, cytopenias",
            "binet": "A-C based on involved areas and cytopenias"
        },
        "treatment": {
            "watch_and_wait": "Early stage, asymptomatic",
            "indications": "Symptomatic disease, cytopenias, bulky nodes, rapid doubling",
            "first_line": {
                "fit": "BTK inhibitor (ibrutinib, acalabrutinib) or venetoclax-obinutuzumab",
                "del17p_tp53": "BTK inhibitor or venetoclax-based"
            }
        },
        "prognosis": "Variable; IGHV mutated median survival >20 years; unmutated/del(17p) much shorter",
        "affected_organs": ["blood", "lymph_nodes", "bone_marrow", "spleen"],
        "guideline_source": "NCCN 2024, iwCLL 2018"
    },
    {
        "id": "multiple_myeloma",
        "name": "Multiple Myeloma",
        "icd10_code": "C90.0",
        "category": "hematological_malignancy",
        "description": "Plasma cell neoplasm with bone marrow infiltration, monoclonal protein production, and end-organ damage.",
        "synonyms": ["MM", "Myeloma", "Plasma cell myeloma"],
        "epidemiology": {
            "incidence": "~7 per 100,000; median age 69",
            "risk_factors": ["Age", "Black race", "MGUS progression"]
        },
        "clinical_features": {
            "crab_criteria": ["Calcium elevation (>11)", "Renal insufficiency (Cr >2)", "Anemia (Hb <10)", "Bone lesions (lytic)"],
            "other": ["Recurrent infections", "Hyperviscosity", "Neuropathy", "Amyloidosis"]
        },
        "diagnostic_criteria": {
            "bone_marrow": "≥10% clonal plasma cells or plasmacytoma",
            "plus": "CRAB criteria or myeloma-defining events (60% plasma cells, FLC ratio >100, >1 MRI lesion)",
            "workup": ["SPEP/UPEP", "Serum free light chains", "Bone survey or PET/CT", "Bone marrow biopsy"]
        },
        "treatment": {
            "induction": "VRd (bortezomib, lenalidomide, dexamethasone) or DaraVRd",
            "transplant": "Autologous SCT for eligible patients",
            "maintenance": "Lenalidomide",
            "relapsed": ["Daratumumab", "Carfilzomib", "Pomalidomide", "CAR-T (ide-cel, cilta-cel)", "Bispecifics"]
        },
        "prognosis": "Median survival 5-7 years; improving with novel agents",
        "affected_organs": ["bone_marrow", "bones", "kidneys", "blood"],
        "guideline_source": "NCCN 2024, IMWG"
    }
]


def get_all_comprehensive_diseases():
    """Return all comprehensive disease data with timestamps"""
    all_diseases = []
    all_diseases.extend(CARDIOVASCULAR_DISEASES)
    all_diseases.extend(RESPIRATORY_DISEASES)
    all_diseases.extend(ENDOCRINE_DISEASES)
    all_diseases.extend(RENAL_DISEASES)
    all_diseases.extend(NEUROLOGICAL_DISEASES)
    all_diseases.extend(HEMATOLOGICAL_DISEASES)
    all_diseases.extend(ONCOLOGICAL_DISEASES)
    all_diseases.extend(GENETIC_DISEASES)
    all_diseases.extend(LEUKEMIA_DISEASES)
    
    # Add timestamps
    timestamp = get_timestamp()
    for disease in all_diseases:
        disease["created_at"] = timestamp
        disease["updated_at"] = timestamp
    
    return all_diseases
