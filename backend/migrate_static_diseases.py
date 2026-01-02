#!/usr/bin/env python3
"""
Migration script to consolidate all static frontend diseases into MongoDB.
This ensures ALL diseases are in one database for instant loading.
"""

import asyncio
import os
import json
import re
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'phicore_db')

# Static diseases data - extracted from frontend
STATIC_DISEASES = {
    # Cardiac diseases from diseaseModels.js and cardiacDiseasesIndex.js
    "hypertrophic_cardiomyopathy": {
        "name": "Hypertrophic Cardiomyopathy",
        "icd10_code": "I42.1",
        "category": "cardiovascular",
        "description": "Genetic cardiac condition characterized by left ventricular hypertrophy not explained by loading conditions.",
        "affected_organs": ["heart", "blood"],
        "primary_organ": "heart"
    },
    "dilated_cardiomyopathy": {
        "name": "Dilated Cardiomyopathy", 
        "icd10_code": "I42.0",
        "category": "cardiovascular",
        "description": "Heart muscle disease characterized by ventricular dilation and impaired systolic function.",
        "affected_organs": ["heart", "lungs", "blood"],
        "primary_organ": "heart"
    },
    "restrictive_cardiomyopathy": {
        "name": "Restrictive Cardiomyopathy",
        "icd10_code": "I42.5", 
        "category": "cardiovascular",
        "description": "Rare form of cardiomyopathy with impaired ventricular filling due to abnormal diastolic function.",
        "affected_organs": ["heart", "lungs"],
        "primary_organ": "heart"
    },
    "aortic_stenosis": {
        "name": "Aortic Stenosis",
        "icd10_code": "I35.0",
        "category": "cardiovascular",
        "description": "Narrowing of the aortic valve causing obstruction to left ventricular outflow.",
        "affected_organs": ["heart", "blood"],
        "primary_organ": "heart"
    },
    "aortic_regurgitation": {
        "name": "Aortic Regurgitation",
        "icd10_code": "I35.1",
        "category": "cardiovascular",
        "description": "Incompetent aortic valve causing backflow of blood into the left ventricle during diastole.",
        "affected_organs": ["heart", "blood"],
        "primary_organ": "heart"
    },
    "mitral_stenosis": {
        "name": "Mitral Stenosis",
        "icd10_code": "I34.0",
        "category": "cardiovascular",
        "description": "Narrowing of the mitral valve causing obstruction to left ventricular filling.",
        "affected_organs": ["heart", "lungs"],
        "primary_organ": "heart"
    },
    "mitral_regurgitation": {
        "name": "Mitral Regurgitation",
        "icd10_code": "I34.0",
        "category": "cardiovascular",
        "description": "Incompetent mitral valve causing backflow into left atrium during systole.",
        "affected_organs": ["heart", "lungs"],
        "primary_organ": "heart"
    },
    "atrial_septal_defect": {
        "name": "Atrial Septal Defect",
        "icd10_code": "Q21.1",
        "category": "congenital",
        "description": "Congenital heart defect with abnormal opening in the atrial septum.",
        "affected_organs": ["heart", "lungs"],
        "primary_organ": "heart"
    },
    "ventricular_septal_defect": {
        "name": "Ventricular Septal Defect",
        "icd10_code": "Q21.0",
        "category": "congenital",
        "description": "Congenital heart defect with abnormal opening in the ventricular septum.",
        "affected_organs": ["heart", "lungs"],
        "primary_organ": "heart"
    },
    "patent_ductus_arteriosus": {
        "name": "Patent Ductus Arteriosus",
        "icd10_code": "Q25.0",
        "category": "congenital",
        "description": "Persistent fetal connection between aorta and pulmonary artery.",
        "affected_organs": ["heart", "lungs"],
        "primary_organ": "heart"
    },
    "tetralogy_of_fallot": {
        "name": "Tetralogy of Fallot",
        "icd10_code": "Q21.3",
        "category": "congenital",
        "description": "Complex congenital heart disease with four anatomical abnormalities.",
        "affected_organs": ["heart", "lungs", "blood"],
        "primary_organ": "heart"
    },
    "pulmonary_stenosis": {
        "name": "Pulmonary Stenosis",
        "icd10_code": "I37.0",
        "category": "cardiovascular",
        "description": "Narrowing of the pulmonary valve causing right ventricular outflow obstruction.",
        "affected_organs": ["heart", "lungs"],
        "primary_organ": "heart"
    },
    "tricuspid_regurgitation": {
        "name": "Tricuspid Regurgitation",
        "icd10_code": "I36.1",
        "category": "cardiovascular",
        "description": "Incompetent tricuspid valve causing backflow into right atrium.",
        "affected_organs": ["heart", "liver"],
        "primary_organ": "heart"
    },
    "pericarditis": {
        "name": "Pericarditis",
        "icd10_code": "I30",
        "category": "cardiovascular",
        "description": "Inflammation of the pericardium, often viral in origin.",
        "affected_organs": ["heart"],
        "primary_organ": "heart"
    },
    "cardiac_tamponade": {
        "name": "Cardiac Tamponade",
        "icd10_code": "I31.4",
        "category": "cardiovascular",
        "description": "Life-threatening compression of the heart due to pericardial fluid accumulation.",
        "affected_organs": ["heart"],
        "primary_organ": "heart"
    },
    "constrictive_pericarditis": {
        "name": "Constrictive Pericarditis",
        "icd10_code": "I31.1",
        "category": "cardiovascular",
        "description": "Chronic inflammation leading to pericardial thickening and impaired diastolic filling.",
        "affected_organs": ["heart", "liver"],
        "primary_organ": "heart"
    },
    "myocarditis": {
        "name": "Myocarditis",
        "icd10_code": "I40",
        "category": "cardiovascular",
        "description": "Inflammation of the heart muscle, often viral or autoimmune in origin.",
        "affected_organs": ["heart"],
        "primary_organ": "heart"
    },
    "infective_endocarditis": {
        "name": "Infective Endocarditis",
        "icd10_code": "I33",
        "category": "infectious",
        "description": "Infection of the heart valves, usually bacterial.",
        "affected_organs": ["heart", "blood", "brain", "kidneys"],
        "primary_organ": "heart"
    },
    "aortic_dissection": {
        "name": "Aortic Dissection",
        "icd10_code": "I71.0",
        "category": "cardiovascular",
        "description": "Tear in the aortic wall allowing blood to dissect between layers.",
        "affected_organs": ["heart", "blood"],
        "primary_organ": "heart"
    },
    "pulmonary_hypertension": {
        "name": "Pulmonary Hypertension",
        "icd10_code": "I27.0",
        "category": "cardiovascular",
        "description": "Elevated pulmonary artery pressure leading to right heart failure.",
        "affected_organs": ["heart", "lungs"],
        "primary_organ": "lungs"
    },
    "pulmonary_embolism": {
        "name": "Pulmonary Embolism",
        "icd10_code": "I26",
        "category": "cardiovascular",
        "description": "Obstruction of pulmonary arteries by blood clots, usually from deep vein thrombosis.",
        "affected_organs": ["lungs", "heart"],
        "primary_organ": "lungs"
    },
    
    # Respiratory diseases
    "copd": {
        "name": "Chronic Obstructive Pulmonary Disease",
        "icd10_code": "J44",
        "category": "respiratory",
        "description": "Progressive lung disease with airflow limitation, including emphysema and chronic bronchitis.",
        "affected_organs": ["lungs", "heart"],
        "primary_organ": "lungs"
    },
    "asthma": {
        "name": "Asthma",
        "icd10_code": "J45",
        "category": "respiratory",
        "description": "Chronic inflammatory airway disease with reversible airflow obstruction.",
        "affected_organs": ["lungs"],
        "primary_organ": "lungs"
    },
    "pneumonia": {
        "name": "Pneumonia",
        "icd10_code": "J18",
        "category": "respiratory",
        "description": "Infection of the lung parenchyma causing inflammation and consolidation.",
        "affected_organs": ["lungs"],
        "primary_organ": "lungs"
    },
    "pulmonary_fibrosis": {
        "name": "Pulmonary Fibrosis",
        "icd10_code": "J84.1",
        "category": "respiratory",
        "description": "Progressive scarring of lung tissue leading to respiratory failure.",
        "affected_organs": ["lungs", "heart"],
        "primary_organ": "lungs"
    },
    "acute_respiratory_distress_syndrome": {
        "name": "Acute Respiratory Distress Syndrome",
        "icd10_code": "J80",
        "category": "respiratory",
        "description": "Severe acute inflammatory lung injury with hypoxemic respiratory failure.",
        "affected_organs": ["lungs", "heart", "kidneys"],
        "primary_organ": "lungs"
    },
    "bronchiectasis": {
        "name": "Bronchiectasis",
        "icd10_code": "J47",
        "category": "respiratory",
        "description": "Permanent dilation of bronchi with chronic productive cough.",
        "affected_organs": ["lungs"],
        "primary_organ": "lungs"
    },
    "pleural_effusion": {
        "name": "Pleural Effusion",
        "icd10_code": "J91",
        "category": "respiratory",
        "description": "Abnormal accumulation of fluid in the pleural space.",
        "affected_organs": ["lungs"],
        "primary_organ": "lungs"
    },
    "pneumothorax": {
        "name": "Pneumothorax",
        "icd10_code": "J93",
        "category": "respiratory",
        "description": "Accumulation of air in the pleural space causing lung collapse.",
        "affected_organs": ["lungs"],
        "primary_organ": "lungs"
    },
    "lung_cancer_nsclc": {
        "name": "Non-Small Cell Lung Cancer",
        "icd10_code": "C34",
        "category": "oncology",
        "description": "Most common type of lung cancer including adenocarcinoma and squamous cell carcinoma.",
        "affected_organs": ["lungs", "brain", "liver", "bone_marrow"],
        "primary_organ": "lungs"
    },
    "lung_cancer_sclc": {
        "name": "Small Cell Lung Cancer",
        "icd10_code": "C34",
        "category": "oncology",
        "description": "Aggressive neuroendocrine lung cancer with early metastasis.",
        "affected_organs": ["lungs", "brain", "liver", "bone_marrow"],
        "primary_organ": "lungs"
    },
    
    # Renal diseases
    "chronic_kidney_disease": {
        "name": "Chronic Kidney Disease",
        "icd10_code": "N18",
        "category": "renal",
        "description": "Progressive loss of kidney function over months to years.",
        "affected_organs": ["kidneys", "heart", "blood"],
        "primary_organ": "kidneys"
    },
    "acute_kidney_injury": {
        "name": "Acute Kidney Injury",
        "icd10_code": "N17",
        "category": "renal",
        "description": "Sudden decrease in kidney function over hours to days.",
        "affected_organs": ["kidneys", "heart"],
        "primary_organ": "kidneys"
    },
    "diabetic_nephropathy": {
        "name": "Diabetic Nephropathy",
        "icd10_code": "E11.65",
        "category": "renal",
        "description": "Kidney damage caused by diabetes mellitus.",
        "affected_organs": ["kidneys", "heart", "blood"],
        "primary_organ": "kidneys"
    },
    "glomerulonephritis": {
        "name": "Glomerulonephritis",
        "icd10_code": "N05",
        "category": "renal",
        "description": "Inflammation of the glomeruli, often immune-mediated.",
        "affected_organs": ["kidneys", "blood"],
        "primary_organ": "kidneys"
    },
    "nephrotic_syndrome": {
        "name": "Nephrotic Syndrome",
        "icd10_code": "N04",
        "category": "renal",
        "description": "Kidney disorder with heavy proteinuria, hypoalbuminemia, and edema.",
        "affected_organs": ["kidneys", "blood", "liver"],
        "primary_organ": "kidneys"
    },
    "polycystic_kidney_disease": {
        "name": "Polycystic Kidney Disease",
        "icd10_code": "Q61",
        "category": "renal",
        "description": "Genetic disorder with multiple kidney cysts leading to kidney failure.",
        "affected_organs": ["kidneys", "liver"],
        "primary_organ": "kidneys"
    },
    "renal_cell_carcinoma": {
        "name": "Renal Cell Carcinoma",
        "icd10_code": "C64",
        "category": "oncology",
        "description": "Most common type of kidney cancer arising from renal tubular epithelium.",
        "affected_organs": ["kidneys", "lungs", "bone_marrow"],
        "primary_organ": "kidneys"
    },
    
    # Neurological diseases
    "parkinsons_disease": {
        "name": "Parkinson's Disease",
        "icd10_code": "G20",
        "category": "neurological",
        "description": "Neurodegenerative disorder affecting dopaminergic neurons in substantia nigra.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "alzheimers_disease": {
        "name": "Alzheimer's Disease",
        "icd10_code": "G30",
        "category": "neurological",
        "description": "Progressive neurodegenerative disease causing dementia.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "multiple_sclerosis": {
        "name": "Multiple Sclerosis",
        "icd10_code": "G35",
        "category": "neurological",
        "description": "Autoimmune demyelinating disease of the central nervous system.",
        "affected_organs": ["brain", "spinal_cord"],
        "primary_organ": "brain"
    },
    "epilepsy": {
        "name": "Epilepsy",
        "icd10_code": "G40",
        "category": "neurological",
        "description": "Chronic neurological disorder characterized by recurrent seizures.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "migraine": {
        "name": "Migraine",
        "icd10_code": "G43",
        "category": "neurological",
        "description": "Primary headache disorder with recurrent episodes.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "amyotrophic_lateral_sclerosis": {
        "name": "Amyotrophic Lateral Sclerosis",
        "icd10_code": "G12.21",
        "category": "neurological",
        "description": "Progressive motor neuron disease affecting voluntary muscle control.",
        "affected_organs": ["brain", "spinal_cord"],
        "primary_organ": "brain"
    },
    "myasthenia_gravis": {
        "name": "Myasthenia Gravis",
        "icd10_code": "G70.0",
        "category": "neurological",
        "description": "Autoimmune neuromuscular junction disorder causing weakness.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "guillain_barre_syndrome": {
        "name": "Guillain-Barré Syndrome",
        "icd10_code": "G61.0",
        "category": "neurological",
        "description": "Acute inflammatory demyelinating polyneuropathy.",
        "affected_organs": ["brain", "peripheral_nerves"],
        "primary_organ": "brain"
    },
    "huntingtons_disease": {
        "name": "Huntington's Disease",
        "icd10_code": "G10",
        "category": "neurological",
        "description": "Inherited neurodegenerative disorder causing progressive motor and cognitive decline.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    
    # Hepatic diseases
    "cirrhosis": {
        "name": "Cirrhosis",
        "icd10_code": "K74",
        "category": "hepatic",
        "description": "End-stage liver disease with fibrosis and nodular regeneration.",
        "affected_organs": ["liver", "blood", "kidneys"],
        "primary_organ": "liver"
    },
    "hepatitis_b": {
        "name": "Hepatitis B",
        "icd10_code": "B18.1",
        "category": "infectious",
        "description": "Viral infection of the liver caused by hepatitis B virus.",
        "affected_organs": ["liver"],
        "primary_organ": "liver"
    },
    "hepatitis_c": {
        "name": "Hepatitis C",
        "icd10_code": "B18.2",
        "category": "infectious",
        "description": "Viral infection of the liver caused by hepatitis C virus.",
        "affected_organs": ["liver"],
        "primary_organ": "liver"
    },
    "non_alcoholic_fatty_liver": {
        "name": "Non-Alcoholic Fatty Liver Disease",
        "icd10_code": "K76.0",
        "category": "hepatic",
        "description": "Hepatic steatosis not due to alcohol consumption.",
        "affected_organs": ["liver"],
        "primary_organ": "liver"
    },
    "alcoholic_liver_disease": {
        "name": "Alcoholic Liver Disease",
        "icd10_code": "K70",
        "category": "hepatic",
        "description": "Liver damage due to chronic alcohol consumption.",
        "affected_organs": ["liver", "brain"],
        "primary_organ": "liver"
    },
    "hepatocellular_carcinoma": {
        "name": "Hepatocellular Carcinoma",
        "icd10_code": "C22.0",
        "category": "oncology",
        "description": "Primary liver cancer, often arising in cirrhotic liver.",
        "affected_organs": ["liver", "lungs"],
        "primary_organ": "liver"
    },
    "acute_liver_failure": {
        "name": "Acute Liver Failure",
        "icd10_code": "K72.0",
        "category": "hepatic",
        "description": "Rapid decline in liver function with hepatic encephalopathy.",
        "affected_organs": ["liver", "brain", "kidneys"],
        "primary_organ": "liver"
    },
    "primary_biliary_cholangitis": {
        "name": "Primary Biliary Cholangitis",
        "icd10_code": "K74.3",
        "category": "hepatic",
        "description": "Autoimmune destruction of intrahepatic bile ducts.",
        "affected_organs": ["liver"],
        "primary_organ": "liver"
    },
    
    # Hematological diseases
    "iron_deficiency_anemia": {
        "name": "Iron Deficiency Anemia",
        "icd10_code": "D50",
        "category": "hematological",
        "description": "Most common type of anemia due to insufficient iron stores.",
        "affected_organs": ["blood", "bone_marrow"],
        "primary_organ": "blood"
    },
    "vitamin_b12_deficiency": {
        "name": "Vitamin B12 Deficiency Anemia",
        "icd10_code": "D51",
        "category": "hematological",
        "description": "Megaloblastic anemia due to B12 deficiency.",
        "affected_organs": ["blood", "bone_marrow", "brain"],
        "primary_organ": "blood"
    },
    "hemolytic_anemia": {
        "name": "Hemolytic Anemia",
        "icd10_code": "D59",
        "category": "hematological",
        "description": "Anemia due to increased destruction of red blood cells.",
        "affected_organs": ["blood", "spleen"],
        "primary_organ": "blood"
    },
    "aplastic_anemia": {
        "name": "Aplastic Anemia",
        "icd10_code": "D61",
        "category": "hematological",
        "description": "Bone marrow failure with pancytopenia.",
        "affected_organs": ["blood", "bone_marrow"],
        "primary_organ": "bone_marrow"
    },
    "thrombocytopenia": {
        "name": "Thrombocytopenia",
        "icd10_code": "D69.6",
        "category": "hematological",
        "description": "Low platelet count with increased bleeding risk.",
        "affected_organs": ["blood"],
        "primary_organ": "blood"
    },
    "deep_vein_thrombosis": {
        "name": "Deep Vein Thrombosis",
        "icd10_code": "I82",
        "category": "hematological",
        "description": "Blood clot formation in deep veins, usually legs.",
        "affected_organs": ["blood"],
        "primary_organ": "blood"
    },
    "disseminated_intravascular_coagulation": {
        "name": "Disseminated Intravascular Coagulation",
        "icd10_code": "D65",
        "category": "hematological",
        "description": "Systemic activation of coagulation with consumption of clotting factors.",
        "affected_organs": ["blood", "kidneys", "liver"],
        "primary_organ": "blood"
    },
    "hemophilia_a": {
        "name": "Hemophilia A",
        "icd10_code": "D66",
        "category": "hematological",
        "description": "X-linked bleeding disorder due to factor VIII deficiency.",
        "affected_organs": ["blood"],
        "primary_organ": "blood"
    },
    "von_willebrand_disease": {
        "name": "Von Willebrand Disease",
        "icd10_code": "D68.0",
        "category": "hematological",
        "description": "Most common inherited bleeding disorder.",
        "affected_organs": ["blood"],
        "primary_organ": "blood"
    },
    "polycythemia_vera": {
        "name": "Polycythemia Vera",
        "icd10_code": "D45",
        "category": "hematological",
        "description": "Myeloproliferative neoplasm with increased RBC production.",
        "affected_organs": ["blood", "bone_marrow", "spleen"],
        "primary_organ": "bone_marrow"
    },
    "essential_thrombocythemia": {
        "name": "Essential Thrombocythemia",
        "icd10_code": "D47.3",
        "category": "hematological",
        "description": "Myeloproliferative neoplasm with elevated platelets.",
        "affected_organs": ["blood", "bone_marrow"],
        "primary_organ": "bone_marrow"
    },
    "myelodysplastic_syndrome": {
        "name": "Myelodysplastic Syndrome",
        "icd10_code": "D46",
        "category": "hematological",
        "description": "Clonal bone marrow disorder with ineffective hematopoiesis.",
        "affected_organs": ["blood", "bone_marrow"],
        "primary_organ": "bone_marrow"
    },
    
    # Autoimmune diseases
    "systemic_lupus_erythematosus": {
        "name": "Systemic Lupus Erythematosus",
        "icd10_code": "M32",
        "category": "autoimmune",
        "description": "Multisystem autoimmune disease with variable presentation.",
        "affected_organs": ["kidneys", "heart", "lungs", "blood", "skin", "brain"],
        "primary_organ": "blood"
    },
    "rheumatoid_arthritis": {
        "name": "Rheumatoid Arthritis",
        "icd10_code": "M05",
        "category": "autoimmune",
        "description": "Chronic inflammatory arthritis affecting synovial joints.",
        "affected_organs": ["joints", "lungs", "heart"],
        "primary_organ": "joints"
    },
    "sjogrens_syndrome": {
        "name": "Sjögren's Syndrome",
        "icd10_code": "M35.0",
        "category": "autoimmune",
        "description": "Autoimmune disease affecting exocrine glands.",
        "affected_organs": ["salivary_glands", "lacrimal_glands"],
        "primary_organ": "salivary_glands"
    },
    "scleroderma": {
        "name": "Scleroderma",
        "icd10_code": "M34",
        "category": "autoimmune",
        "description": "Autoimmune disease with skin and organ fibrosis.",
        "affected_organs": ["skin", "lungs", "heart", "kidneys"],
        "primary_organ": "skin"
    },
    "dermatomyositis": {
        "name": "Dermatomyositis",
        "icd10_code": "M33.1",
        "category": "autoimmune",
        "description": "Inflammatory myopathy with characteristic skin findings.",
        "affected_organs": ["skin", "muscles"],
        "primary_organ": "muscles"
    },
    "polymyositis": {
        "name": "Polymyositis",
        "icd10_code": "M33.2",
        "category": "autoimmune",
        "description": "Inflammatory myopathy with proximal muscle weakness.",
        "affected_organs": ["muscles"],
        "primary_organ": "muscles"
    },
    "vasculitis": {
        "name": "Vasculitis",
        "icd10_code": "I77.6",
        "category": "autoimmune",
        "description": "Inflammation of blood vessels.",
        "affected_organs": ["blood", "kidneys", "lungs"],
        "primary_organ": "blood"
    },
    "ankylosing_spondylitis": {
        "name": "Ankylosing Spondylitis",
        "icd10_code": "M45",
        "category": "autoimmune",
        "description": "Chronic inflammatory disease primarily affecting the spine.",
        "affected_organs": ["spine", "joints"],
        "primary_organ": "spine"
    },
    "psoriatic_arthritis": {
        "name": "Psoriatic Arthritis",
        "icd10_code": "M07",
        "category": "autoimmune",
        "description": "Inflammatory arthritis associated with psoriasis.",
        "affected_organs": ["joints", "skin"],
        "primary_organ": "joints"
    },
    "antiphospholipid_syndrome": {
        "name": "Antiphospholipid Syndrome",
        "icd10_code": "D68.61",
        "category": "autoimmune",
        "description": "Autoimmune hypercoagulable state with recurrent thrombosis.",
        "affected_organs": ["blood"],
        "primary_organ": "blood"
    },
    
    # Infectious diseases
    "sepsis": {
        "name": "Sepsis",
        "icd10_code": "A41",
        "category": "infectious",
        "description": "Life-threatening organ dysfunction due to dysregulated host response to infection.",
        "affected_organs": ["blood", "heart", "lungs", "kidneys", "liver", "brain"],
        "primary_organ": "blood"
    },
    "tuberculosis": {
        "name": "Tuberculosis",
        "icd10_code": "A15",
        "category": "infectious",
        "description": "Bacterial infection primarily affecting the lungs.",
        "affected_organs": ["lungs", "lymph_nodes"],
        "primary_organ": "lungs"
    },
    "hiv_aids": {
        "name": "HIV/AIDS",
        "icd10_code": "B20",
        "category": "infectious",
        "description": "Retroviral infection causing progressive immune deficiency.",
        "affected_organs": ["blood", "lymph_nodes"],
        "primary_organ": "blood"
    },
    "meningitis": {
        "name": "Meningitis",
        "icd10_code": "G03",
        "category": "infectious",
        "description": "Infection and inflammation of the meninges.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "encephalitis": {
        "name": "Encephalitis",
        "icd10_code": "A86",
        "category": "infectious",
        "description": "Inflammation of the brain parenchyma.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "cellulitis": {
        "name": "Cellulitis",
        "icd10_code": "L03",
        "category": "infectious",
        "description": "Bacterial skin and soft tissue infection.",
        "affected_organs": ["skin"],
        "primary_organ": "skin"
    },
    "osteomyelitis": {
        "name": "Osteomyelitis",
        "icd10_code": "M86",
        "category": "infectious",
        "description": "Bone infection, often bacterial.",
        "affected_organs": ["bones"],
        "primary_organ": "bones"
    },
    "urinary_tract_infection": {
        "name": "Urinary Tract Infection",
        "icd10_code": "N39.0",
        "category": "infectious",
        "description": "Bacterial infection of the urinary tract.",
        "affected_organs": ["kidneys", "bladder"],
        "primary_organ": "bladder"
    },
    "pyelonephritis": {
        "name": "Pyelonephritis",
        "icd10_code": "N10",
        "category": "infectious",
        "description": "Bacterial infection of the kidney parenchyma.",
        "affected_organs": ["kidneys"],
        "primary_organ": "kidneys"
    },
    
    # Gastrointestinal diseases
    "peptic_ulcer_disease": {
        "name": "Peptic Ulcer Disease",
        "icd10_code": "K27",
        "category": "gastrointestinal",
        "description": "Ulceration of the stomach or duodenum.",
        "affected_organs": ["stomach", "duodenum"],
        "primary_organ": "stomach"
    },
    "gastroesophageal_reflux": {
        "name": "Gastroesophageal Reflux Disease",
        "icd10_code": "K21",
        "category": "gastrointestinal",
        "description": "Chronic acid reflux causing esophageal symptoms.",
        "affected_organs": ["esophagus", "stomach"],
        "primary_organ": "esophagus"
    },
    "inflammatory_bowel_disease": {
        "name": "Inflammatory Bowel Disease",
        "icd10_code": "K50",
        "category": "gastrointestinal",
        "description": "Chronic inflammatory conditions of the GI tract including Crohn's and UC.",
        "affected_organs": ["intestines"],
        "primary_organ": "intestines"
    },
    "crohns_disease": {
        "name": "Crohn's Disease",
        "icd10_code": "K50",
        "category": "gastrointestinal",
        "description": "Transmural inflammatory bowel disease affecting any GI segment.",
        "affected_organs": ["intestines"],
        "primary_organ": "intestines"
    },
    "ulcerative_colitis": {
        "name": "Ulcerative Colitis",
        "icd10_code": "K51",
        "category": "gastrointestinal",
        "description": "Inflammatory bowel disease limited to colon and rectum.",
        "affected_organs": ["colon"],
        "primary_organ": "colon"
    },
    "celiac_disease": {
        "name": "Celiac Disease",
        "icd10_code": "K90.0",
        "category": "gastrointestinal",
        "description": "Autoimmune enteropathy triggered by gluten.",
        "affected_organs": ["intestines"],
        "primary_organ": "intestines"
    },
    "irritable_bowel_syndrome": {
        "name": "Irritable Bowel Syndrome",
        "icd10_code": "K58",
        "category": "gastrointestinal",
        "description": "Functional bowel disorder with altered motility.",
        "affected_organs": ["intestines"],
        "primary_organ": "intestines"
    },
    "pancreatitis_acute": {
        "name": "Acute Pancreatitis",
        "icd10_code": "K85",
        "category": "gastrointestinal",
        "description": "Acute inflammation of the pancreas.",
        "affected_organs": ["pancreas"],
        "primary_organ": "pancreas"
    },
    "pancreatitis_chronic": {
        "name": "Chronic Pancreatitis",
        "icd10_code": "K86",
        "category": "gastrointestinal",
        "description": "Progressive inflammatory disease of the pancreas.",
        "affected_organs": ["pancreas"],
        "primary_organ": "pancreas"
    },
    "pancreatic_cancer": {
        "name": "Pancreatic Cancer",
        "icd10_code": "C25",
        "category": "oncology",
        "description": "Malignancy of the pancreas with poor prognosis.",
        "affected_organs": ["pancreas", "liver"],
        "primary_organ": "pancreas"
    },
    "colorectal_cancer": {
        "name": "Colorectal Cancer",
        "icd10_code": "C18",
        "category": "oncology",
        "description": "Malignancy of the colon or rectum.",
        "affected_organs": ["colon", "liver"],
        "primary_organ": "colon"
    },
    "diverticulitis": {
        "name": "Diverticulitis",
        "icd10_code": "K57",
        "category": "gastrointestinal",
        "description": "Inflammation of colonic diverticula.",
        "affected_organs": ["colon"],
        "primary_organ": "colon"
    },
    "appendicitis": {
        "name": "Appendicitis",
        "icd10_code": "K35",
        "category": "gastrointestinal",
        "description": "Acute inflammation of the appendix.",
        "affected_organs": ["appendix"],
        "primary_organ": "appendix"
    },
    "cholecystitis": {
        "name": "Cholecystitis",
        "icd10_code": "K81",
        "category": "gastrointestinal",
        "description": "Inflammation of the gallbladder.",
        "affected_organs": ["gallbladder"],
        "primary_organ": "gallbladder"
    },
    "cholelithiasis": {
        "name": "Cholelithiasis",
        "icd10_code": "K80",
        "category": "gastrointestinal",
        "description": "Gallstones in the gallbladder.",
        "affected_organs": ["gallbladder"],
        "primary_organ": "gallbladder"
    },
    
    # Psychiatric diseases
    "major_depressive_disorder": {
        "name": "Major Depressive Disorder",
        "icd10_code": "F32",
        "category": "psychiatric",
        "description": "Mood disorder with persistent sadness and loss of interest.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "bipolar_disorder": {
        "name": "Bipolar Disorder",
        "icd10_code": "F31",
        "category": "psychiatric",
        "description": "Mood disorder with episodes of mania and depression.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "schizophrenia": {
        "name": "Schizophrenia",
        "icd10_code": "F20",
        "category": "psychiatric",
        "description": "Chronic psychotic disorder with positive and negative symptoms.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "generalized_anxiety_disorder": {
        "name": "Generalized Anxiety Disorder",
        "icd10_code": "F41.1",
        "category": "psychiatric",
        "description": "Chronic anxiety and worry about various aspects of life.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "panic_disorder": {
        "name": "Panic Disorder",
        "icd10_code": "F41.0",
        "category": "psychiatric",
        "description": "Recurrent unexpected panic attacks.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "obsessive_compulsive_disorder": {
        "name": "Obsessive-Compulsive Disorder",
        "icd10_code": "F42",
        "category": "psychiatric",
        "description": "Anxiety disorder with obsessions and compulsions.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "ptsd": {
        "name": "Post-Traumatic Stress Disorder",
        "icd10_code": "F43.1",
        "category": "psychiatric",
        "description": "Disorder following exposure to traumatic events.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "anorexia_nervosa": {
        "name": "Anorexia Nervosa",
        "icd10_code": "F50.0",
        "category": "psychiatric",
        "description": "Eating disorder with restriction and fear of weight gain.",
        "affected_organs": ["brain", "heart", "bones"],
        "primary_organ": "brain"
    },
    "bulimia_nervosa": {
        "name": "Bulimia Nervosa",
        "icd10_code": "F50.2",
        "category": "psychiatric",
        "description": "Eating disorder with binge eating and compensatory behaviors.",
        "affected_organs": ["brain", "heart", "teeth"],
        "primary_organ": "brain"
    },
    "adhd": {
        "name": "Attention Deficit Hyperactivity Disorder",
        "icd10_code": "F90",
        "category": "psychiatric",
        "description": "Neurodevelopmental disorder with inattention, hyperactivity, impulsivity.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    "autism_spectrum_disorder": {
        "name": "Autism Spectrum Disorder",
        "icd10_code": "F84",
        "category": "psychiatric",
        "description": "Neurodevelopmental disorder affecting social communication.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
    
    # Oncology - Additional
    "breast_cancer": {
        "name": "Breast Cancer",
        "icd10_code": "C50",
        "category": "oncology",
        "description": "Malignancy of breast tissue.",
        "affected_organs": ["breast", "lymph_nodes", "bone_marrow", "liver", "lungs"],
        "primary_organ": "breast"
    },
    "prostate_cancer": {
        "name": "Prostate Cancer",
        "icd10_code": "C61",
        "category": "oncology",
        "description": "Malignancy of the prostate gland.",
        "affected_organs": ["prostate", "bone_marrow"],
        "primary_organ": "prostate"
    },
    "leukemia_aml": {
        "name": "Acute Myeloid Leukemia",
        "icd10_code": "C92.0",
        "category": "oncology",
        "description": "Aggressive blood cancer arising from myeloid precursors.",
        "affected_organs": ["blood", "bone_marrow"],
        "primary_organ": "bone_marrow"
    },
    "leukemia_all": {
        "name": "Acute Lymphoblastic Leukemia",
        "icd10_code": "C91.0",
        "category": "oncology",
        "description": "Blood cancer arising from lymphoid precursors.",
        "affected_organs": ["blood", "bone_marrow"],
        "primary_organ": "bone_marrow"
    },
    "leukemia_cll": {
        "name": "Chronic Lymphocytic Leukemia",
        "icd10_code": "C91.1",
        "category": "oncology",
        "description": "Indolent blood cancer of mature B lymphocytes.",
        "affected_organs": ["blood", "bone_marrow", "lymph_nodes"],
        "primary_organ": "bone_marrow"
    },
    "leukemia_cml": {
        "name": "Chronic Myeloid Leukemia",
        "icd10_code": "C92.1",
        "category": "oncology",
        "description": "Blood cancer characterized by BCR-ABL fusion.",
        "affected_organs": ["blood", "bone_marrow", "spleen"],
        "primary_organ": "bone_marrow"
    },
    "lymphoma_hodgkin": {
        "name": "Hodgkin Lymphoma",
        "icd10_code": "C81",
        "category": "oncology",
        "description": "Lymphoid malignancy with Reed-Sternberg cells.",
        "affected_organs": ["lymph_nodes", "spleen"],
        "primary_organ": "lymph_nodes"
    },
    "lymphoma_non_hodgkin": {
        "name": "Non-Hodgkin Lymphoma",
        "icd10_code": "C85",
        "category": "oncology",
        "description": "Heterogeneous group of lymphoid malignancies.",
        "affected_organs": ["lymph_nodes", "spleen", "bone_marrow"],
        "primary_organ": "lymph_nodes"
    },
    "multiple_myeloma": {
        "name": "Multiple Myeloma",
        "icd10_code": "C90.0",
        "category": "oncology",
        "description": "Plasma cell malignancy with bone lesions.",
        "affected_organs": ["bone_marrow", "bones", "kidneys"],
        "primary_organ": "bone_marrow"
    },
    "melanoma": {
        "name": "Melanoma",
        "icd10_code": "C43",
        "category": "oncology",
        "description": "Malignant skin cancer from melanocytes.",
        "affected_organs": ["skin", "lymph_nodes", "lungs", "brain"],
        "primary_organ": "skin"
    },
    "ovarian_cancer": {
        "name": "Ovarian Cancer",
        "icd10_code": "C56",
        "category": "oncology",
        "description": "Malignancy of the ovary.",
        "affected_organs": ["ovaries", "peritoneum"],
        "primary_organ": "ovaries"
    },
    "cervical_cancer": {
        "name": "Cervical Cancer",
        "icd10_code": "C53",
        "category": "oncology",
        "description": "Malignancy of the cervix, often HPV-related.",
        "affected_organs": ["cervix"],
        "primary_organ": "cervix"
    },
    "esophageal_cancer": {
        "name": "Esophageal Cancer",
        "icd10_code": "C15",
        "category": "oncology",
        "description": "Malignancy of the esophagus.",
        "affected_organs": ["esophagus", "lymph_nodes"],
        "primary_organ": "esophagus"
    },
    "gastric_cancer": {
        "name": "Gastric Cancer",
        "icd10_code": "C16",
        "category": "oncology",
        "description": "Malignancy of the stomach.",
        "affected_organs": ["stomach", "liver"],
        "primary_organ": "stomach"
    },
    "bladder_cancer": {
        "name": "Bladder Cancer",
        "icd10_code": "C67",
        "category": "oncology",
        "description": "Malignancy of the bladder.",
        "affected_organs": ["bladder"],
        "primary_organ": "bladder"
    },
    "thyroid_cancer": {
        "name": "Thyroid Cancer",
        "icd10_code": "C73",
        "category": "oncology",
        "description": "Malignancy of the thyroid gland.",
        "affected_organs": ["thyroid", "lymph_nodes"],
        "primary_organ": "thyroid"
    },
    "brain_tumor_glioblastoma": {
        "name": "Glioblastoma",
        "icd10_code": "C71",
        "category": "oncology",
        "description": "Aggressive primary brain tumor.",
        "affected_organs": ["brain"],
        "primary_organ": "brain"
    },
}


async def migrate_diseases():
    """Migrate all static diseases to MongoDB."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    diseases_collection = db.diseases_db
    
    print(f"Connected to MongoDB: {DB_NAME}")
    
    # Get existing diseases
    existing_diseases = {}
    async for doc in diseases_collection.find({}, {"id": 1, "icd10_code": 1}):
        existing_diseases[doc.get("id", "")] = doc.get("icd10_code", "")
        if doc.get("icd10_code"):
            existing_diseases[doc["icd10_code"]] = doc.get("id", "")
    
    print(f"Found {len(existing_diseases)//2} existing diseases in database")
    
    added = 0
    skipped = 0
    updated = 0
    
    for disease_id, disease_data in STATIC_DISEASES.items():
        icd10 = disease_data.get("icd10_code", "")
        
        # Check if disease exists by ID or ICD-10
        exists_by_id = disease_id in existing_diseases
        exists_by_icd = icd10 and icd10 in existing_diseases
        
        if exists_by_id or exists_by_icd:
            skipped += 1
            continue
        
        # Add new disease
        doc = {
            "id": disease_id,
            "name": disease_data["name"],
            "icd10_code": icd10,
            "category": disease_data.get("category", "general"),
            "description": disease_data.get("description", disease_data["name"]),
            "affected_organs": disease_data.get("affected_organs", []),
            "primary_organ": disease_data.get("primary_organ", ""),
            "parameter_modifications": {},  # Will be generated separately
            "created_at": datetime.utcnow().isoformat(),
            "source": "static_migration"
        }
        
        await diseases_collection.insert_one(doc)
        added += 1
        print(f"  + Added: {disease_data['name']} ({icd10})")
    
    print(f"\n=== Migration Complete ===")
    print(f"Added: {added}")
    print(f"Skipped (already exists): {skipped}")
    
    # Get final count
    final_count = await diseases_collection.count_documents({})
    print(f"Total diseases in database: {final_count}")
    
    client.close()
    return added, skipped, final_count


if __name__ == "__main__":
    asyncio.run(migrate_diseases())
