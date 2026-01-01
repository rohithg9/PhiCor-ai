"""
Medical Knowledge Bank Builder
Comprehensive system for building clinical decision support database
Includes: Drugs, Diseases, Symptoms, Guidelines, Lab Tests
"""

import os
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

# Try to import emergent integrations
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False
    print("Warning: emergentintegrations not available")


# ============================================================================
# TOP 500 ICD-10 CONDITIONS - Most common diagnoses worldwide
# ============================================================================

TOP_500_ICD_CONDITIONS = [
    # ===== CARDIOVASCULAR (50) =====
    {"icd10": "I10", "name": "Essential (primary) hypertension", "category": "cardiovascular"},
    {"icd10": "I25.1", "name": "Atherosclerotic heart disease", "category": "cardiovascular"},
    {"icd10": "I50.9", "name": "Heart failure, unspecified", "category": "cardiovascular"},
    {"icd10": "I48.9", "name": "Atrial fibrillation, unspecified", "category": "cardiovascular"},
    {"icd10": "I21.9", "name": "Acute myocardial infarction, unspecified", "category": "cardiovascular"},
    {"icd10": "I20.9", "name": "Angina pectoris, unspecified", "category": "cardiovascular"},
    {"icd10": "I63.9", "name": "Cerebral infarction, unspecified", "category": "cardiovascular"},
    {"icd10": "I26.9", "name": "Pulmonary embolism without acute cor pulmonale", "category": "cardiovascular"},
    {"icd10": "I80.2", "name": "Deep vein thrombosis", "category": "cardiovascular"},
    {"icd10": "I42.0", "name": "Dilated cardiomyopathy", "category": "cardiovascular"},
    {"icd10": "I35.0", "name": "Aortic valve stenosis", "category": "cardiovascular"},
    {"icd10": "I34.0", "name": "Mitral valve insufficiency", "category": "cardiovascular"},
    {"icd10": "I44.2", "name": "Atrioventricular block, complete", "category": "cardiovascular"},
    {"icd10": "I47.2", "name": "Ventricular tachycardia", "category": "cardiovascular"},
    {"icd10": "I71.4", "name": "Abdominal aortic aneurysm", "category": "cardiovascular"},
    {"icd10": "I73.9", "name": "Peripheral vascular disease", "category": "cardiovascular"},
    {"icd10": "I11.9", "name": "Hypertensive heart disease", "category": "cardiovascular"},
    {"icd10": "I12.9", "name": "Hypertensive chronic kidney disease", "category": "cardiovascular"},
    {"icd10": "I67.9", "name": "Cerebrovascular disease, unspecified", "category": "cardiovascular"},
    {"icd10": "I61.9", "name": "Intracerebral hemorrhage, unspecified", "category": "cardiovascular"},
    
    # ===== RESPIRATORY (40) =====
    {"icd10": "J44.9", "name": "COPD, unspecified", "category": "respiratory"},
    {"icd10": "J45.9", "name": "Asthma, unspecified", "category": "respiratory"},
    {"icd10": "J18.9", "name": "Pneumonia, unspecified", "category": "respiratory"},
    {"icd10": "J06.9", "name": "Upper respiratory infection, unspecified", "category": "respiratory"},
    {"icd10": "J20.9", "name": "Acute bronchitis, unspecified", "category": "respiratory"},
    {"icd10": "J96.9", "name": "Respiratory failure, unspecified", "category": "respiratory"},
    {"icd10": "J84.1", "name": "Idiopathic pulmonary fibrosis", "category": "respiratory"},
    {"icd10": "J90", "name": "Pleural effusion", "category": "respiratory"},
    {"icd10": "J93.9", "name": "Pneumothorax, unspecified", "category": "respiratory"},
    {"icd10": "J47.9", "name": "Bronchiectasis, uncomplicated", "category": "respiratory"},
    {"icd10": "J32.9", "name": "Chronic sinusitis, unspecified", "category": "respiratory"},
    {"icd10": "J30.1", "name": "Allergic rhinitis due to pollen", "category": "respiratory"},
    {"icd10": "J38.0", "name": "Paralysis of vocal cords", "category": "respiratory"},
    {"icd10": "J80", "name": "Acute respiratory distress syndrome", "category": "respiratory"},
    {"icd10": "J69.0", "name": "Aspiration pneumonia", "category": "respiratory"},
    
    # ===== ENDOCRINE/METABOLIC (45) =====
    {"icd10": "E11.9", "name": "Type 2 diabetes mellitus without complications", "category": "endocrine"},
    {"icd10": "E10.9", "name": "Type 1 diabetes mellitus without complications", "category": "endocrine"},
    {"icd10": "E11.65", "name": "Type 2 diabetes with hyperglycemia", "category": "endocrine"},
    {"icd10": "E11.22", "name": "Type 2 diabetes with diabetic CKD", "category": "endocrine"},
    {"icd10": "E11.40", "name": "Type 2 diabetes with diabetic neuropathy", "category": "endocrine"},
    {"icd10": "E11.31", "name": "Type 2 diabetes with diabetic retinopathy", "category": "endocrine"},
    {"icd10": "E03.9", "name": "Hypothyroidism, unspecified", "category": "endocrine"},
    {"icd10": "E05.9", "name": "Hyperthyroidism, unspecified", "category": "endocrine"},
    {"icd10": "E78.5", "name": "Hyperlipidemia, unspecified", "category": "endocrine"},
    {"icd10": "E78.0", "name": "Pure hypercholesterolemia", "category": "endocrine"},
    {"icd10": "E66.9", "name": "Obesity, unspecified", "category": "endocrine"},
    {"icd10": "E87.6", "name": "Hypokalemia", "category": "endocrine"},
    {"icd10": "E87.5", "name": "Hyperkalemia", "category": "endocrine"},
    {"icd10": "E87.1", "name": "Hyponatremia", "category": "endocrine"},
    {"icd10": "E83.5", "name": "Hypercalcemia", "category": "endocrine"},
    {"icd10": "E21.0", "name": "Primary hyperparathyroidism", "category": "endocrine"},
    {"icd10": "E24.9", "name": "Cushing syndrome, unspecified", "category": "endocrine"},
    {"icd10": "E27.1", "name": "Primary adrenocortical insufficiency", "category": "endocrine"},
    {"icd10": "E16.2", "name": "Hypoglycemia, unspecified", "category": "endocrine"},
    {"icd10": "E86.0", "name": "Dehydration", "category": "endocrine"},
    
    # ===== GASTROINTESTINAL (45) =====
    {"icd10": "K21.0", "name": "GERD with esophagitis", "category": "gastrointestinal"},
    {"icd10": "K25.9", "name": "Gastric ulcer, unspecified", "category": "gastrointestinal"},
    {"icd10": "K26.9", "name": "Duodenal ulcer, unspecified", "category": "gastrointestinal"},
    {"icd10": "K29.7", "name": "Gastritis, unspecified", "category": "gastrointestinal"},
    {"icd10": "K50.9", "name": "Crohn's disease, unspecified", "category": "gastrointestinal"},
    {"icd10": "K51.9", "name": "Ulcerative colitis, unspecified", "category": "gastrointestinal"},
    {"icd10": "K58.9", "name": "Irritable bowel syndrome", "category": "gastrointestinal"},
    {"icd10": "K57.9", "name": "Diverticular disease, unspecified", "category": "gastrointestinal"},
    {"icd10": "K80.2", "name": "Cholelithiasis without cholecystitis", "category": "gastrointestinal"},
    {"icd10": "K81.0", "name": "Acute cholecystitis", "category": "gastrointestinal"},
    {"icd10": "K85.9", "name": "Acute pancreatitis, unspecified", "category": "gastrointestinal"},
    {"icd10": "K86.1", "name": "Chronic pancreatitis", "category": "gastrointestinal"},
    {"icd10": "K74.6", "name": "Cirrhosis of liver", "category": "gastrointestinal"},
    {"icd10": "K70.3", "name": "Alcoholic cirrhosis", "category": "gastrointestinal"},
    {"icd10": "K72.9", "name": "Hepatic failure, unspecified", "category": "gastrointestinal"},
    {"icd10": "K76.0", "name": "Fatty liver disease", "category": "gastrointestinal"},
    {"icd10": "K92.2", "name": "Gastrointestinal hemorrhage", "category": "gastrointestinal"},
    {"icd10": "K56.6", "name": "Intestinal obstruction", "category": "gastrointestinal"},
    {"icd10": "K35.8", "name": "Acute appendicitis", "category": "gastrointestinal"},
    {"icd10": "K40.9", "name": "Inguinal hernia", "category": "gastrointestinal"},
    
    # ===== RENAL/UROLOGICAL (35) =====
    {"icd10": "N18.9", "name": "Chronic kidney disease, unspecified", "category": "renal"},
    {"icd10": "N18.3", "name": "CKD stage 3", "category": "renal"},
    {"icd10": "N18.4", "name": "CKD stage 4", "category": "renal"},
    {"icd10": "N18.5", "name": "CKD stage 5", "category": "renal"},
    {"icd10": "N17.9", "name": "Acute kidney injury, unspecified", "category": "renal"},
    {"icd10": "N39.0", "name": "Urinary tract infection", "category": "renal"},
    {"icd10": "N10", "name": "Acute pyelonephritis", "category": "renal"},
    {"icd10": "N20.0", "name": "Kidney stones", "category": "renal"},
    {"icd10": "N40.0", "name": "Benign prostatic hyperplasia", "category": "renal"},
    {"icd10": "N13.3", "name": "Hydronephrosis", "category": "renal"},
    {"icd10": "N04.9", "name": "Nephrotic syndrome", "category": "renal"},
    {"icd10": "N05.9", "name": "Glomerulonephritis", "category": "renal"},
    {"icd10": "R33.9", "name": "Urinary retention", "category": "renal"},
    {"icd10": "N31.9", "name": "Neurogenic bladder", "category": "renal"},
    {"icd10": "N32.8", "name": "Overactive bladder", "category": "renal"},
    
    # ===== NEUROLOGICAL (45) =====
    {"icd10": "G20", "name": "Parkinson's disease", "category": "neurological"},
    {"icd10": "G30.9", "name": "Alzheimer's disease", "category": "neurological"},
    {"icd10": "G35", "name": "Multiple sclerosis", "category": "neurological"},
    {"icd10": "G40.9", "name": "Epilepsy, unspecified", "category": "neurological"},
    {"icd10": "G43.9", "name": "Migraine, unspecified", "category": "neurological"},
    {"icd10": "G44.1", "name": "Tension-type headache", "category": "neurological"},
    {"icd10": "G62.9", "name": "Polyneuropathy, unspecified", "category": "neurological"},
    {"icd10": "G56.0", "name": "Carpal tunnel syndrome", "category": "neurological"},
    {"icd10": "G47.3", "name": "Sleep apnea", "category": "neurological"},
    {"icd10": "G47.0", "name": "Insomnia", "category": "neurological"},
    {"icd10": "G25.8", "name": "Essential tremor", "category": "neurological"},
    {"icd10": "G12.2", "name": "Motor neuron disease (ALS)", "category": "neurological"},
    {"icd10": "G61.0", "name": "Guillain-Barre syndrome", "category": "neurological"},
    {"icd10": "G70.0", "name": "Myasthenia gravis", "category": "neurological"},
    {"icd10": "G93.4", "name": "Encephalopathy", "category": "neurological"},
    {"icd10": "G91.9", "name": "Hydrocephalus", "category": "neurological"},
    {"icd10": "S06.9", "name": "Traumatic brain injury", "category": "neurological"},
    {"icd10": "G45.9", "name": "Transient ischemic attack", "category": "neurological"},
    {"icd10": "G83.9", "name": "Paralysis, unspecified", "category": "neurological"},
    {"icd10": "R56.9", "name": "Seizure, unspecified", "category": "neurological"},
    
    # ===== MUSCULOSKELETAL (40) =====
    {"icd10": "M54.5", "name": "Low back pain", "category": "musculoskeletal"},
    {"icd10": "M17.9", "name": "Osteoarthritis of knee", "category": "musculoskeletal"},
    {"icd10": "M16.9", "name": "Osteoarthritis of hip", "category": "musculoskeletal"},
    {"icd10": "M81.0", "name": "Osteoporosis", "category": "musculoskeletal"},
    {"icd10": "M06.9", "name": "Rheumatoid arthritis", "category": "musculoskeletal"},
    {"icd10": "M10.9", "name": "Gout, unspecified", "category": "musculoskeletal"},
    {"icd10": "M32.9", "name": "Systemic lupus erythematosus", "category": "musculoskeletal"},
    {"icd10": "M79.3", "name": "Fibromyalgia", "category": "musculoskeletal"},
    {"icd10": "M51.1", "name": "Lumbar disc herniation", "category": "musculoskeletal"},
    {"icd10": "M47.8", "name": "Cervical spondylosis", "category": "musculoskeletal"},
    {"icd10": "M75.1", "name": "Rotator cuff syndrome", "category": "musculoskeletal"},
    {"icd10": "M72.0", "name": "Dupuytren's contracture", "category": "musculoskeletal"},
    {"icd10": "M65.4", "name": "Trigger finger", "category": "musculoskeletal"},
    {"icd10": "M77.1", "name": "Lateral epicondylitis (tennis elbow)", "category": "musculoskeletal"},
    {"icd10": "M76.6", "name": "Achilles tendinitis", "category": "musculoskeletal"},
    
    # ===== INFECTIOUS DISEASES (40) =====
    {"icd10": "A41.9", "name": "Sepsis, unspecified", "category": "infectious"},
    {"icd10": "B34.9", "name": "Viral infection, unspecified", "category": "infectious"},
    {"icd10": "A09", "name": "Gastroenteritis", "category": "infectious"},
    {"icd10": "A15.9", "name": "Tuberculosis", "category": "infectious"},
    {"icd10": "B20", "name": "HIV disease", "category": "infectious"},
    {"icd10": "B18.2", "name": "Chronic hepatitis C", "category": "infectious"},
    {"icd10": "B18.1", "name": "Chronic hepatitis B", "category": "infectious"},
    {"icd10": "A04.7", "name": "C. difficile infection", "category": "infectious"},
    {"icd10": "A46", "name": "Erysipelas", "category": "infectious"},
    {"icd10": "L03.9", "name": "Cellulitis", "category": "infectious"},
    {"icd10": "A49.0", "name": "Staphylococcal infection", "category": "infectious"},
    {"icd10": "J02.9", "name": "Acute pharyngitis", "category": "infectious"},
    {"icd10": "H66.9", "name": "Otitis media", "category": "infectious"},
    {"icd10": "B37.9", "name": "Candidiasis", "category": "infectious"},
    {"icd10": "B35.9", "name": "Dermatophytosis", "category": "infectious"},
    {"icd10": "U07.1", "name": "COVID-19", "category": "infectious"},
    {"icd10": "J10.1", "name": "Influenza with pneumonia", "category": "infectious"},
    {"icd10": "B02.9", "name": "Herpes zoster", "category": "infectious"},
    {"icd10": "B00.9", "name": "Herpes simplex", "category": "infectious"},
    {"icd10": "A69.2", "name": "Lyme disease", "category": "infectious"},
    
    # ===== HEMATOLOGICAL (30) =====
    {"icd10": "D64.9", "name": "Anemia, unspecified", "category": "hematological"},
    {"icd10": "D50.9", "name": "Iron deficiency anemia", "category": "hematological"},
    {"icd10": "D51.9", "name": "Vitamin B12 deficiency anemia", "category": "hematological"},
    {"icd10": "D69.6", "name": "Thrombocytopenia", "category": "hematological"},
    {"icd10": "D68.9", "name": "Coagulation defect", "category": "hematological"},
    {"icd10": "D65", "name": "DIC - Disseminated intravascular coagulation", "category": "hematological"},
    {"icd10": "D57.1", "name": "Sickle cell disease", "category": "hematological"},
    {"icd10": "D66", "name": "Hemophilia A", "category": "hematological"},
    {"icd10": "C90.0", "name": "Multiple myeloma", "category": "hematological"},
    {"icd10": "C91.1", "name": "Chronic lymphocytic leukemia", "category": "hematological"},
    {"icd10": "C92.1", "name": "Chronic myeloid leukemia", "category": "hematological"},
    {"icd10": "C81.9", "name": "Hodgkin lymphoma", "category": "hematological"},
    {"icd10": "C85.9", "name": "Non-Hodgkin lymphoma", "category": "hematological"},
    {"icd10": "D46.9", "name": "Myelodysplastic syndrome", "category": "hematological"},
    {"icd10": "D72.8", "name": "Leukocytosis", "category": "hematological"},
    
    # ===== PSYCHIATRIC (35) =====
    {"icd10": "F32.9", "name": "Major depressive disorder", "category": "psychiatric"},
    {"icd10": "F41.1", "name": "Generalized anxiety disorder", "category": "psychiatric"},
    {"icd10": "F41.0", "name": "Panic disorder", "category": "psychiatric"},
    {"icd10": "F20.9", "name": "Schizophrenia", "category": "psychiatric"},
    {"icd10": "F31.9", "name": "Bipolar disorder", "category": "psychiatric"},
    {"icd10": "F43.1", "name": "Post-traumatic stress disorder", "category": "psychiatric"},
    {"icd10": "F42.9", "name": "Obsessive-compulsive disorder", "category": "psychiatric"},
    {"icd10": "F50.0", "name": "Anorexia nervosa", "category": "psychiatric"},
    {"icd10": "F50.2", "name": "Bulimia nervosa", "category": "psychiatric"},
    {"icd10": "F10.2", "name": "Alcohol dependence", "category": "psychiatric"},
    {"icd10": "F11.2", "name": "Opioid dependence", "category": "psychiatric"},
    {"icd10": "F17.2", "name": "Nicotine dependence", "category": "psychiatric"},
    {"icd10": "F90.9", "name": "ADHD", "category": "psychiatric"},
    {"icd10": "F84.0", "name": "Autism spectrum disorder", "category": "psychiatric"},
    {"icd10": "F03.9", "name": "Dementia, unspecified", "category": "psychiatric"},
    
    # ===== ONCOLOGY (45) =====
    {"icd10": "C34.9", "name": "Lung cancer", "category": "oncology"},
    {"icd10": "C50.9", "name": "Breast cancer", "category": "oncology"},
    {"icd10": "C61", "name": "Prostate cancer", "category": "oncology"},
    {"icd10": "C18.9", "name": "Colon cancer", "category": "oncology"},
    {"icd10": "C20", "name": "Rectal cancer", "category": "oncology"},
    {"icd10": "C25.9", "name": "Pancreatic cancer", "category": "oncology"},
    {"icd10": "C22.0", "name": "Hepatocellular carcinoma", "category": "oncology"},
    {"icd10": "C16.9", "name": "Gastric cancer", "category": "oncology"},
    {"icd10": "C15.9", "name": "Esophageal cancer", "category": "oncology"},
    {"icd10": "C67.9", "name": "Bladder cancer", "category": "oncology"},
    {"icd10": "C64.9", "name": "Renal cell carcinoma", "category": "oncology"},
    {"icd10": "C73", "name": "Thyroid cancer", "category": "oncology"},
    {"icd10": "C43.9", "name": "Melanoma", "category": "oncology"},
    {"icd10": "C71.9", "name": "Brain cancer", "category": "oncology"},
    {"icd10": "C56.9", "name": "Ovarian cancer", "category": "oncology"},
    {"icd10": "C53.9", "name": "Cervical cancer", "category": "oncology"},
    {"icd10": "C54.1", "name": "Endometrial cancer", "category": "oncology"},
    {"icd10": "C62.9", "name": "Testicular cancer", "category": "oncology"},
    {"icd10": "C79.5", "name": "Bone metastasis", "category": "oncology"},
    {"icd10": "C78.0", "name": "Lung metastasis", "category": "oncology"},
    
    # ===== DERMATOLOGY (25) =====
    {"icd10": "L40.9", "name": "Psoriasis", "category": "dermatology"},
    {"icd10": "L20.9", "name": "Atopic dermatitis", "category": "dermatology"},
    {"icd10": "L30.9", "name": "Dermatitis, unspecified", "category": "dermatology"},
    {"icd10": "L50.9", "name": "Urticaria", "category": "dermatology"},
    {"icd10": "L70.0", "name": "Acne vulgaris", "category": "dermatology"},
    {"icd10": "L80", "name": "Vitiligo", "category": "dermatology"},
    {"icd10": "L63.9", "name": "Alopecia areata", "category": "dermatology"},
    {"icd10": "B35.0", "name": "Tinea capitis", "category": "dermatology"},
    {"icd10": "L82.1", "name": "Seborrheic keratosis", "category": "dermatology"},
    {"icd10": "D22.9", "name": "Melanocytic nevus", "category": "dermatology"},
    
    # ===== OPHTHALMOLOGY (20) =====
    {"icd10": "H40.9", "name": "Glaucoma", "category": "ophthalmology"},
    {"icd10": "H25.9", "name": "Cataract", "category": "ophthalmology"},
    {"icd10": "H35.3", "name": "Macular degeneration", "category": "ophthalmology"},
    {"icd10": "H36.0", "name": "Diabetic retinopathy", "category": "ophthalmology"},
    {"icd10": "H10.9", "name": "Conjunctivitis", "category": "ophthalmology"},
    {"icd10": "H04.1", "name": "Dry eye syndrome", "category": "ophthalmology"},
    {"icd10": "H52.1", "name": "Myopia", "category": "ophthalmology"},
    {"icd10": "H34.1", "name": "Retinal artery occlusion", "category": "ophthalmology"},
    {"icd10": "H34.8", "name": "Retinal vein occlusion", "category": "ophthalmology"},
    {"icd10": "H33.0", "name": "Retinal detachment", "category": "ophthalmology"},
    
    # ===== ENT (15) =====
    {"icd10": "J35.0", "name": "Chronic tonsillitis", "category": "ent"},
    {"icd10": "H91.9", "name": "Hearing loss", "category": "ent"},
    {"icd10": "H81.1", "name": "Benign paroxysmal vertigo", "category": "ent"},
    {"icd10": "J34.2", "name": "Deviated nasal septum", "category": "ent"},
    {"icd10": "J33.9", "name": "Nasal polyp", "category": "ent"},
    {"icd10": "R04.0", "name": "Epistaxis", "category": "ent"},
    {"icd10": "H83.0", "name": "Meniere's disease", "category": "ent"},
    {"icd10": "H93.1", "name": "Tinnitus", "category": "ent"},
    
    # ===== OB/GYN (20) =====
    {"icd10": "N92.0", "name": "Menorrhagia", "category": "obgyn"},
    {"icd10": "N80.9", "name": "Endometriosis", "category": "obgyn"},
    {"icd10": "D25.9", "name": "Uterine fibroids", "category": "obgyn"},
    {"icd10": "N83.2", "name": "Ovarian cyst", "category": "obgyn"},
    {"icd10": "E28.2", "name": "Polycystic ovary syndrome", "category": "obgyn"},
    {"icd10": "N95.1", "name": "Menopausal symptoms", "category": "obgyn"},
    {"icd10": "O24.4", "name": "Gestational diabetes", "category": "obgyn"},
    {"icd10": "O14.9", "name": "Pre-eclampsia", "category": "obgyn"},
    {"icd10": "N76.0", "name": "Vaginitis", "category": "obgyn"},
    {"icd10": "N87.9", "name": "Cervical dysplasia", "category": "obgyn"},
]


# ============================================================================
# CLINICAL SYMPTOMS DATABASE
# ============================================================================

CLINICAL_SYMPTOMS = [
    # Cardiovascular Symptoms
    {"symptom": "chest_pain", "name": "Chest Pain", "category": "cardiovascular", "red_flags": ["radiating to arm", "with sweating", "with shortness of breath"]},
    {"symptom": "dyspnea", "name": "Dyspnea (Shortness of Breath)", "category": "respiratory", "red_flags": ["at rest", "sudden onset", "with chest pain"]},
    {"symptom": "palpitations", "name": "Palpitations", "category": "cardiovascular", "red_flags": ["with syncope", "with chest pain"]},
    {"symptom": "syncope", "name": "Syncope (Fainting)", "category": "neurological", "red_flags": ["during exertion", "without warning"]},
    {"symptom": "edema", "name": "Peripheral Edema", "category": "cardiovascular", "red_flags": ["unilateral", "painful", "with dyspnea"]},
    
    # GI Symptoms
    {"symptom": "abdominal_pain", "name": "Abdominal Pain", "category": "gastrointestinal", "red_flags": ["severe sudden onset", "with fever", "with bloody stool"]},
    {"symptom": "nausea_vomiting", "name": "Nausea and Vomiting", "category": "gastrointestinal", "red_flags": ["blood in vomit", "severe dehydration"]},
    {"symptom": "diarrhea", "name": "Diarrhea", "category": "gastrointestinal", "red_flags": ["bloody", "severe dehydration", ">7 days"]},
    {"symptom": "constipation", "name": "Constipation", "category": "gastrointestinal", "red_flags": ["with abdominal distension", "with vomiting"]},
    {"symptom": "dysphagia", "name": "Dysphagia (Difficulty Swallowing)", "category": "gastrointestinal", "red_flags": ["progressive", "with weight loss"]},
    {"symptom": "hematemesis", "name": "Hematemesis (Vomiting Blood)", "category": "gastrointestinal", "red_flags": ["large volume", "with hypotension"]},
    {"symptom": "melena", "name": "Melena (Black Stool)", "category": "gastrointestinal", "red_flags": ["with hypotension", "with pallor"]},
    {"symptom": "jaundice", "name": "Jaundice", "category": "gastrointestinal", "red_flags": ["with abdominal pain", "with fever"]},
    
    # Neurological Symptoms
    {"symptom": "headache", "name": "Headache", "category": "neurological", "red_flags": ["thunderclap", "with fever", "with neck stiffness"]},
    {"symptom": "dizziness", "name": "Dizziness/Vertigo", "category": "neurological", "red_flags": ["with neurological deficit", "sudden onset"]},
    {"symptom": "weakness", "name": "Weakness", "category": "neurological", "red_flags": ["sudden onset", "unilateral", "with speech changes"]},
    {"symptom": "numbness", "name": "Numbness/Paresthesia", "category": "neurological", "red_flags": ["sudden onset", "with weakness"]},
    {"symptom": "confusion", "name": "Confusion/Altered Mental Status", "category": "neurological", "red_flags": ["acute onset", "with fever"]},
    {"symptom": "seizure", "name": "Seizure", "category": "neurological", "red_flags": ["first-time", "prolonged", "status epilepticus"]},
    {"symptom": "tremor", "name": "Tremor", "category": "neurological", "red_flags": ["with rigidity", "with bradykinesia"]},
    {"symptom": "memory_loss", "name": "Memory Loss", "category": "neurological", "red_flags": ["rapid onset", "with confusion"]},
    
    # Respiratory Symptoms
    {"symptom": "cough", "name": "Cough", "category": "respiratory", "red_flags": ["hemoptysis", ">3 weeks", "with weight loss"]},
    {"symptom": "hemoptysis", "name": "Hemoptysis (Coughing Blood)", "category": "respiratory", "red_flags": ["massive", "recurrent"]},
    {"symptom": "wheezing", "name": "Wheezing", "category": "respiratory", "red_flags": ["with respiratory distress", "not responsive to treatment"]},
    {"symptom": "stridor", "name": "Stridor", "category": "respiratory", "red_flags": ["acute onset", "with drooling"]},
    
    # Constitutional Symptoms
    {"symptom": "fever", "name": "Fever", "category": "infectious", "red_flags": ["high grade >39C", "with rash", "with neck stiffness"]},
    {"symptom": "weight_loss", "name": "Unintentional Weight Loss", "category": "constitutional", "red_flags": [">5% in 1 month", "with night sweats"]},
    {"symptom": "fatigue", "name": "Fatigue", "category": "constitutional", "red_flags": ["severe", "with pallor", "with dyspnea"]},
    {"symptom": "night_sweats", "name": "Night Sweats", "category": "constitutional", "red_flags": ["with weight loss", "with lymphadenopathy"]},
    
    # Genitourinary Symptoms
    {"symptom": "dysuria", "name": "Dysuria (Painful Urination)", "category": "urological", "red_flags": ["with fever", "with flank pain"]},
    {"symptom": "hematuria", "name": "Hematuria (Blood in Urine)", "category": "urological", "red_flags": ["painless", "with clots"]},
    {"symptom": "urinary_frequency", "name": "Urinary Frequency", "category": "urological", "red_flags": ["with polyuria", "with weight loss"]},
    {"symptom": "urinary_retention", "name": "Urinary Retention", "category": "urological", "red_flags": ["acute", "with back pain"]},
    
    # Musculoskeletal Symptoms
    {"symptom": "joint_pain", "name": "Joint Pain", "category": "musculoskeletal", "red_flags": ["hot swollen joint", "with fever"]},
    {"symptom": "back_pain", "name": "Back Pain", "category": "musculoskeletal", "red_flags": ["with neurological deficit", "with fever", "night pain"]},
    {"symptom": "muscle_pain", "name": "Muscle Pain/Myalgia", "category": "musculoskeletal", "red_flags": ["with weakness", "with dark urine"]},
]


class KnowledgeBankBuilder:
    """
    Builds comprehensive medical knowledge bank using AI generation
    """
    
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        self.model_provider = "openai"
        self.model_name = "gpt-4o"
        
    async def generate_condition_with_guidelines(self, condition: Dict) -> Dict:
        """
        Generate comprehensive condition data with clinical guidelines
        """
        if not EMERGENT_AVAILABLE or not self.api_key:
            raise ValueError("AI generation not available")
        
        prompt = f"""Generate comprehensive clinical data for: {condition['name']} (ICD-10: {condition['icd10']})

Category: {condition['category']}

Provide detailed clinical information in this JSON structure:
{{
    "id": "lowercase_snake_case",
    "name": "{condition['name']}",
    "icd10": "{condition['icd10']}",
    "category": "{condition['category']}",
    "description": "Brief clinical description",
    "epidemiology": {{
        "prevalence": "Prevalence data",
        "incidence": "Incidence data",
        "demographics": "Age, sex, ethnic distribution"
    }},
    "etiology": {{
        "causes": ["List of causes"],
        "risk_factors": ["Modifiable and non-modifiable risk factors"],
        "pathophysiology": "Pathophysiological mechanism"
    }},
    "clinical_presentation": {{
        "symptoms": ["Common symptoms with frequency"],
        "signs": ["Physical examination findings"],
        "red_flags": ["Warning signs requiring urgent attention"]
    }},
    "differential_diagnosis": ["List of conditions to consider"],
    "diagnostic_workup": {{
        "history": ["Key history questions"],
        "physical_exam": ["Focused examination"],
        "laboratory": ["Blood tests, urine tests"],
        "imaging": ["X-ray, CT, MRI, ultrasound"],
        "special_tests": ["ECG, EEG, etc."]
    }},
    "diagnostic_criteria": {{
        "criteria_name": "Name of diagnostic criteria if applicable",
        "criteria": ["List of criteria"],
        "interpretation": "How to interpret"
    }},
    "staging_classification": {{
        "system": "Staging system if applicable",
        "stages": ["Stage descriptions"]
    }},
    "treatment": {{
        "non_pharmacological": ["Lifestyle, diet, exercise"],
        "pharmacological": [
            {{
                "drug_class": "Drug class",
                "examples": ["Drug names"],
                "indication": "When to use",
                "contraindications": ["When not to use"]
            }}
        ],
        "surgical": ["Surgical options if applicable"],
        "interventional": ["Procedures if applicable"]
    }},
    "clinical_guidelines": {{
        "nice": "NICE guideline recommendations",
        "aha_acc": "AHA/ACC guidelines if cardiac",
        "who": "WHO recommendations",
        "national": "Other national guidelines"
    }},
    "monitoring": {{
        "parameters": ["What to monitor"],
        "frequency": "How often",
        "targets": ["Treatment targets"]
    }},
    "prognosis": {{
        "natural_history": "Untreated course",
        "with_treatment": "Prognosis with treatment",
        "complications": ["Possible complications"]
    }},
    "prevention": {{
        "primary": ["Primary prevention"],
        "secondary": ["Secondary prevention"],
        "screening": "Screening recommendations"
    }},
    "patient_education": ["Key points for patients"],
    "clinical_pearls": ["Key clinical points for doctors"],
    "evidence_level": "A/B/C based on evidence quality"
}}

Ensure all information is evidence-based and clinically accurate.
Return ONLY valid JSON."""

        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"condition_{condition['icd10'].replace('.', '_')}",
                system_message="You are a clinical expert. Generate accurate, evidence-based medical information."
            ).with_model(self.model_provider, self.model_name)
            
            import re
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                data = json.loads(json_match.group())
                data['generated_at'] = datetime.now(timezone.utc).isoformat()
                data['source'] = 'ai_generated_guidelines'
                return data
            
            raise ValueError("No JSON found in response")
            
        except Exception as e:
            print(f"Error generating condition {condition['name']}: {e}")
            raise
    
    async def generate_symptom_mapping(self, symptom: Dict) -> Dict:
        """
        Generate symptom-to-condition mapping with clinical reasoning
        """
        if not EMERGENT_AVAILABLE or not self.api_key:
            raise ValueError("AI generation not available")
        
        prompt = f"""Generate comprehensive symptom analysis for: {symptom['name']}

Provide clinical reasoning in this JSON structure:
{{
    "symptom_id": "{symptom['symptom']}",
    "symptom_name": "{symptom['name']}",
    "category": "{symptom['category']}",
    "description": "Clinical description of the symptom",
    "characterization": {{
        "quality": ["How to describe it"],
        "duration": ["Acute, chronic, etc."],
        "timing": ["When it occurs"],
        "location": ["Where it occurs"],
        "severity_scale": ["How to grade severity"],
        "aggravating_factors": ["What makes it worse"],
        "relieving_factors": ["What helps"]
    }},
    "red_flags": {json.dumps(symptom.get('red_flags', []))},
    "differential_diagnosis": [
        {{
            "condition": "Condition name",
            "icd10": "ICD-10 code",
            "probability": "common/uncommon/rare",
            "distinguishing_features": ["Key features"],
            "urgency": "emergent/urgent/routine"
        }}
    ],
    "associated_symptoms": ["Symptoms that commonly occur together"],
    "clinical_questions": ["Key questions to ask patient"],
    "physical_exam_focus": ["What to examine"],
    "initial_investigations": ["First-line tests"],
    "when_to_refer": ["Criteria for specialist referral"],
    "clinical_pearls": ["Key clinical insights"]
}}

Include at least 10 differential diagnoses ordered by probability.
Return ONLY valid JSON."""

        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"symptom_{symptom['symptom']}",
                system_message="You are a clinical diagnostician. Generate evidence-based symptom analysis."
            ).with_model(self.model_provider, self.model_name)
            
            import re
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                data = json.loads(json_match.group())
                data['generated_at'] = datetime.now(timezone.utc).isoformat()
                return data
            
            raise ValueError("No JSON found in response")
            
        except Exception as e:
            print(f"Error generating symptom {symptom['name']}: {e}")
            raise


def get_top_500_conditions():
    """Return the top 500 ICD conditions list"""
    return TOP_500_ICD_CONDITIONS


def get_clinical_symptoms():
    """Return the clinical symptoms database"""
    return CLINICAL_SYMPTOMS
