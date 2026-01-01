"""
Medical Knowledge Generator Service
AI-powered comprehensive medical knowledge base generation using GPT-4o
Generates evidence-based disease data for clinical decision support
"""

import asyncio
import json
import os
import re
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# Import emergent integrations for LLM
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False
    print("Warning: emergentintegrations not available")


class MedicalKnowledgeGenerator:
    """
    Generates comprehensive medical knowledge for diseases using AI.
    Creates evidence-based, clinically accurate disease profiles.
    """
    
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        self.model_provider = "openai"
        self.model_name = "gpt-4o"
        
        # Disease categories for comprehensive coverage
        self.disease_categories = {
            "cardiovascular": {
                "name": "Cardiovascular Diseases",
                "icon": "❤️",
                "subcategories": ["ischemic_heart", "heart_failure", "arrhythmias", "valvular", "congenital", "vascular", "hypertensive"]
            },
            "respiratory": {
                "name": "Respiratory Diseases", 
                "icon": "🫁",
                "subcategories": ["obstructive", "restrictive", "infectious", "neoplastic", "vascular", "pleural"]
            },
            "gastrointestinal": {
                "name": "Gastrointestinal Diseases",
                "icon": "🍽️",
                "subcategories": ["esophageal", "gastric", "intestinal", "hepatic", "biliary", "pancreatic"]
            },
            "neurological": {
                "name": "Neurological Diseases",
                "icon": "🧠",
                "subcategories": ["cerebrovascular", "dementia", "movement", "demyelinating", "neuromuscular", "epilepsy", "headache"]
            },
            "endocrine": {
                "name": "Endocrine Diseases",
                "icon": "⚗️",
                "subcategories": ["diabetes", "thyroid", "adrenal", "pituitary", "parathyroid", "metabolic"]
            },
            "renal": {
                "name": "Renal Diseases",
                "icon": "🫘",
                "subcategories": ["glomerular", "tubular", "vascular", "obstructive", "cystic", "electrolyte"]
            },
            "hematological": {
                "name": "Hematological Diseases",
                "icon": "🩸",
                "subcategories": ["anemia", "bleeding", "thrombotic", "leukemia", "lymphoma", "myeloma"]
            },
            "infectious": {
                "name": "Infectious Diseases",
                "icon": "🦠",
                "subcategories": ["bacterial", "viral", "fungal", "parasitic", "tropical", "nosocomial"]
            },
            "rheumatological": {
                "name": "Rheumatological Diseases",
                "icon": "🦴",
                "subcategories": ["inflammatory_arthritis", "connective_tissue", "vasculitis", "crystal", "degenerative"]
            },
            "dermatological": {
                "name": "Dermatological Diseases",
                "icon": "🧬",
                "subcategories": ["inflammatory", "infectious", "autoimmune", "neoplastic", "pigmentary"]
            },
            "psychiatric": {
                "name": "Psychiatric Diseases",
                "icon": "🧘",
                "subcategories": ["mood", "anxiety", "psychotic", "personality", "eating", "substance"]
            },
            "oncological": {
                "name": "Oncological Diseases",
                "icon": "🎗️",
                "subcategories": ["solid_tumors", "hematologic_malignancies", "cns_tumors", "pediatric"]
            },
            "emergency": {
                "name": "Emergency Medicine",
                "icon": "🚨",
                "subcategories": ["trauma", "toxicology", "environmental", "resuscitation"]
            },
            "pediatric": {
                "name": "Pediatric Diseases",
                "icon": "👶",
                "subcategories": ["neonatal", "developmental", "infectious", "genetic"]
            },
            "obstetric_gynecologic": {
                "name": "Obstetric & Gynecologic Diseases",
                "icon": "🤰",
                "subcategories": ["pregnancy", "gynecologic", "reproductive"]
            }
        }
        
        # System prompt for medical knowledge generation
        self.system_prompt = """You are a medical knowledge expert creating a comprehensive clinical decision support database. 
Generate ACCURATE, EVIDENCE-BASED medical information that would be used by physicians.

For each disease, provide:
1. Precise diagnostic criteria from established guidelines (WHO, ESC, AHA, NICE, etc.)
2. Symptoms with their SENSITIVITY and SPECIFICITY percentages when available
3. Clinical signs with examination findings
4. Laboratory values with SPECIFIC RANGES and units
5. Imaging findings by modality (X-ray, CT, MRI, Echo, etc.)
6. Differential diagnosis with distinguishing features
7. Treatment protocols with dosages from current guidelines
8. Prognosis with mortality rates and survival statistics

Always cite guideline sources (e.g., "ESC 2023", "NCCN 2024", "ADA 2024").
Use proper medical terminology and ICD-10 codes.
Include both common and rare but important ("can't miss") presentations.

Format output as valid JSON matching the provided schema EXACTLY."""

    async def generate_disease_data(self, disease_name: str, category: str, additional_context: str = "") -> Optional[Dict[str, Any]]:
        """
        Generate comprehensive disease data using AI.
        
        Args:
            disease_name: Name of the disease to generate data for
            category: Medical category
            additional_context: Optional additional context
            
        Returns:
            Dictionary with comprehensive disease data
        """
        if not EMERGENT_AVAILABLE or not self.api_key:
            return None
            
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"med_gen_{disease_name.replace(' ', '_')}",
                system_message=self.system_prompt
            ).with_model(self.model_provider, self.model_name)
            
            prompt = f"""Generate comprehensive medical data for: {disease_name}
Category: {category}
{f'Additional context: {additional_context}' if additional_context else ''}

Return a JSON object with this EXACT structure:
{{
    "id": "lowercase_snake_case_id",
    "name": "Full Disease Name",
    "icd10_code": "X00.0",
    "icd11_code": "XX00.0 (if known)",
    "snomed_ct": "SNOMED CT code if known",
    "category": "{category}",
    "subcategory": "relevant subcategory",
    "description": "Comprehensive 2-3 sentence description",
    "synonyms": ["alias1", "alias2"],
    "epidemiology": {{
        "prevalence": "X per 100,000 or percentage",
        "incidence": "X per 100,000/year",
        "mortality": "X% 5-year mortality or case fatality",
        "age_distribution": "Peak age groups affected",
        "sex_ratio": "M:F ratio",
        "geographic_variation": "High-prevalence regions",
        "risk_factors": ["factor1", "factor2"],
        "protective_factors": ["factor1", "factor2"]
    }},
    "pathophysiology": {{
        "mechanism": "Detailed pathophysiological mechanism",
        "molecular_basis": "Key molecular/genetic factors",
        "progression": "Natural history of disease"
    }},
    "clinical_presentation": {{
        "symptoms": [
            {{
                "name": "symptom name",
                "description": "how it presents",
                "sensitivity": 85,
                "specificity": 60,
                "frequency": "common/uncommon/rare",
                "onset": "acute/subacute/chronic",
                "associated_conditions": ["condition1"]
            }}
        ],
        "signs": [
            {{
                "name": "sign name",
                "description": "examination finding",
                "sensitivity": 70,
                "specificity": 80,
                "technique": "how to elicit",
                "interpretation": "what it indicates"
            }}
        ],
        "typical_presentation": "Classic presentation description",
        "atypical_presentations": ["presentation1", "presentation2"],
        "red_flags": ["urgent finding requiring immediate attention"]
    }},
    "diagnostic_criteria": {{
        "gold_standard": "Definitive diagnostic test/criteria",
        "clinical_criteria": {{
            "name": "Criteria name (e.g., Duke, Jones, etc.)",
            "major_criteria": ["criterion1", "criterion2"],
            "minor_criteria": ["criterion1", "criterion2"],
            "diagnosis_requires": "X major + Y minor"
        }},
        "classification": [
            {{"stage": "I", "description": "Early", "criteria": "Specific criteria"}}
        ]
    }},
    "laboratory_findings": [
        {{
            "test": "Test name",
            "normal_range": "X-Y units",
            "expected_value": "Typical value in disease",
            "sensitivity": 80,
            "specificity": 75,
            "interpretation": "What abnormality indicates",
            "timing": "When to order"
        }}
    ],
    "imaging_findings": {{
        "first_line": {{
            "modality": "X-ray/CT/MRI/US",
            "findings": ["finding1", "finding2"],
            "sensitivity": 85,
            "specificity": 90
        }},
        "additional": [
            {{
                "modality": "modality name",
                "indication": "when to use",
                "findings": ["finding1"],
                "advantages": "why choose this",
                "limitations": "drawbacks"
            }}
        ]
    }},
    "differential_diagnosis": [
        {{
            "condition": "Alternative diagnosis",
            "icd10": "Code",
            "probability": "common/less common/rare",
            "distinguishing_features": ["feature1", "feature2"],
            "key_differentiator": "Most important distinguishing factor"
        }}
    ],
    "treatment": {{
        "goals": ["goal1", "goal2"],
        "non_pharmacological": ["intervention1", "intervention2"],
        "pharmacological": {{
            "first_line": [
                {{
                    "drug": "Drug name",
                    "class": "Drug class",
                    "dose": "X mg PO/IV daily",
                    "duration": "X weeks/months",
                    "monitoring": "What to monitor",
                    "contraindications": ["contraindication1"],
                    "evidence_level": "A/B/C"
                }}
            ],
            "second_line": [],
            "adjunctive": []
        }},
        "procedural": ["procedure1 if applicable"],
        "surgical": ["surgery1 if applicable"],
        "special_populations": {{
            "pregnancy": "Modifications",
            "elderly": "Modifications",
            "renal_impairment": "Modifications",
            "hepatic_impairment": "Modifications"
        }},
        "monitoring": ["parameter1", "parameter2"]
    }},
    "prognosis": {{
        "natural_history": "Untreated course",
        "with_treatment": "Expected outcomes with therapy",
        "survival_rates": {{
            "1_year": "X%",
            "5_year": "X%",
            "10_year": "X%"
        }},
        "prognostic_factors": {{
            "favorable": ["factor1"],
            "unfavorable": ["factor1"]
        }},
        "complications": ["complication1", "complication2"],
        "recurrence_rate": "X% at Y years"
    }},
    "prevention": {{
        "primary": ["measure1", "measure2"],
        "secondary": ["screening recommendations"],
        "tertiary": ["rehabilitation", "monitoring"]
    }},
    "patient_education": {{
        "key_points": ["point1", "point2"],
        "lifestyle_modifications": ["modification1"],
        "warning_signs": ["sign requiring immediate attention"]
    }},
    "guideline_sources": ["ESC 2023", "AHA 2024", "NICE 2023"],
    "last_updated": "{datetime.now(timezone.utc).strftime('%Y-%m-%d')}",
    "evidence_quality": "high/moderate/low",
    "affected_organs": ["organ1", "organ2"]
}}

Ensure ALL fields are populated with medically accurate information.
Return ONLY the JSON object, no additional text."""

            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Parse JSON from response
            try:
                # Try to extract JSON from the response
                json_match = re.search(r'\{[\s\S]*\}', response)
                if json_match:
                    disease_data = json.loads(json_match.group())
                    # Add metadata
                    disease_data['generated_at'] = datetime.now(timezone.utc).isoformat()
                    disease_data['generation_model'] = f"{self.model_provider}/{self.model_name}"
                    return disease_data
            except json.JSONDecodeError as e:
                print(f"JSON parse error for {disease_name}: {e}")
                return None
                
        except Exception as e:
            print(f"Error generating data for {disease_name}: {e}")
            return None
    
    async def generate_diseases_batch(self, diseases: List[Dict[str, str]], batch_size: int = 3) -> List[Dict[str, Any]]:
        """
        Generate data for multiple diseases in batches.
        
        Args:
            diseases: List of dicts with 'name' and 'category' keys
            batch_size: Number of concurrent generations
            
        Returns:
            List of generated disease data
        """
        results = []
        
        for i in range(0, len(diseases), batch_size):
            batch = diseases[i:i + batch_size]
            tasks = [
                self.generate_disease_data(d['name'], d['category'], d.get('context', ''))
                for d in batch
            ]
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for j, result in enumerate(batch_results):
                if isinstance(result, Exception):
                    print(f"Error for {batch[j]['name']}: {result}")
                elif result:
                    results.append(result)
                    
            # Small delay between batches to avoid rate limiting
            if i + batch_size < len(diseases):
                await asyncio.sleep(1)
                
        return results


# Priority disease list for initial generation (200+ diseases)
PRIORITY_DISEASES = [
    # ============ CARDIOLOGY (25 diseases) ============
    {"name": "Acute Myocardial Infarction (STEMI)", "category": "cardiovascular"},
    {"name": "Non-ST Elevation Myocardial Infarction (NSTEMI)", "category": "cardiovascular"},
    {"name": "Unstable Angina", "category": "cardiovascular"},
    {"name": "Stable Angina Pectoris", "category": "cardiovascular"},
    {"name": "Heart Failure with Preserved Ejection Fraction (HFpEF)", "category": "cardiovascular"},
    {"name": "Dilated Cardiomyopathy", "category": "cardiovascular"},
    {"name": "Hypertrophic Cardiomyopathy", "category": "cardiovascular"},
    {"name": "Restrictive Cardiomyopathy", "category": "cardiovascular"},
    {"name": "Atrial Flutter", "category": "cardiovascular"},
    {"name": "Ventricular Tachycardia", "category": "cardiovascular"},
    {"name": "Ventricular Fibrillation", "category": "cardiovascular"},
    {"name": "Atrioventricular Block", "category": "cardiovascular"},
    {"name": "Sick Sinus Syndrome", "category": "cardiovascular"},
    {"name": "Wolff-Parkinson-White Syndrome", "category": "cardiovascular"},
    {"name": "Aortic Stenosis", "category": "cardiovascular"},
    {"name": "Aortic Regurgitation", "category": "cardiovascular"},
    {"name": "Mitral Stenosis", "category": "cardiovascular"},
    {"name": "Mitral Regurgitation", "category": "cardiovascular"},
    {"name": "Mitral Valve Prolapse", "category": "cardiovascular"},
    {"name": "Infective Endocarditis", "category": "cardiovascular"},
    {"name": "Acute Pericarditis", "category": "cardiovascular"},
    {"name": "Cardiac Tamponade", "category": "cardiovascular"},
    {"name": "Constrictive Pericarditis", "category": "cardiovascular"},
    {"name": "Pulmonary Embolism", "category": "cardiovascular"},
    {"name": "Deep Vein Thrombosis", "category": "cardiovascular"},
    {"name": "Aortic Dissection", "category": "cardiovascular"},
    {"name": "Peripheral Arterial Disease", "category": "cardiovascular"},
    
    # ============ PULMONOLOGY (20 diseases) ============
    {"name": "Community-Acquired Pneumonia", "category": "respiratory"},
    {"name": "Hospital-Acquired Pneumonia", "category": "respiratory"},
    {"name": "Aspiration Pneumonia", "category": "respiratory"},
    {"name": "Tuberculosis", "category": "respiratory"},
    {"name": "Acute Respiratory Distress Syndrome (ARDS)", "category": "respiratory"},
    {"name": "Pulmonary Fibrosis", "category": "respiratory"},
    {"name": "Sarcoidosis", "category": "respiratory"},
    {"name": "Bronchiectasis", "category": "respiratory"},
    {"name": "Lung Cancer (Non-Small Cell)", "category": "respiratory"},
    {"name": "Small Cell Lung Cancer", "category": "respiratory"},
    {"name": "Pleural Effusion", "category": "respiratory"},
    {"name": "Pneumothorax", "category": "respiratory"},
    {"name": "Sleep Apnea (Obstructive)", "category": "respiratory"},
    {"name": "Pulmonary Hypertension", "category": "respiratory"},
    {"name": "Acute Bronchitis", "category": "respiratory"},
    {"name": "Allergic Rhinitis", "category": "respiratory"},
    {"name": "Chronic Cough", "category": "respiratory"},
    {"name": "Hemoptysis", "category": "respiratory"},
    {"name": "Respiratory Failure (Type 1 and 2)", "category": "respiratory"},
    {"name": "COVID-19 Pneumonia", "category": "respiratory"},
    
    # ============ GASTROENTEROLOGY (25 diseases) ============
    {"name": "Gastroesophageal Reflux Disease (GERD)", "category": "gastrointestinal"},
    {"name": "Peptic Ulcer Disease", "category": "gastrointestinal"},
    {"name": "Helicobacter pylori Infection", "category": "gastrointestinal"},
    {"name": "Acute Gastritis", "category": "gastrointestinal"},
    {"name": "Gastroparesis", "category": "gastrointestinal"},
    {"name": "Celiac Disease", "category": "gastrointestinal"},
    {"name": "Crohn's Disease", "category": "gastrointestinal"},
    {"name": "Ulcerative Colitis", "category": "gastrointestinal"},
    {"name": "Irritable Bowel Syndrome", "category": "gastrointestinal"},
    {"name": "Acute Appendicitis", "category": "gastrointestinal"},
    {"name": "Diverticulitis", "category": "gastrointestinal"},
    {"name": "Small Bowel Obstruction", "category": "gastrointestinal"},
    {"name": "Acute Pancreatitis", "category": "gastrointestinal"},
    {"name": "Chronic Pancreatitis", "category": "gastrointestinal"},
    {"name": "Hepatitis B (Acute and Chronic)", "category": "gastrointestinal"},
    {"name": "Hepatitis C", "category": "gastrointestinal"},
    {"name": "Alcoholic Liver Disease", "category": "gastrointestinal"},
    {"name": "Non-Alcoholic Fatty Liver Disease (NAFLD)", "category": "gastrointestinal"},
    {"name": "Cirrhosis", "category": "gastrointestinal"},
    {"name": "Hepatocellular Carcinoma", "category": "gastrointestinal"},
    {"name": "Cholelithiasis (Gallstones)", "category": "gastrointestinal"},
    {"name": "Acute Cholecystitis", "category": "gastrointestinal"},
    {"name": "Cholangitis", "category": "gastrointestinal"},
    {"name": "Gastrointestinal Bleeding (Upper)", "category": "gastrointestinal"},
    {"name": "Gastrointestinal Bleeding (Lower)", "category": "gastrointestinal"},
    
    # ============ NEPHROLOGY (15 diseases) ============
    {"name": "Acute Kidney Injury", "category": "renal"},
    {"name": "Nephrotic Syndrome", "category": "renal"},
    {"name": "Nephritic Syndrome (Glomerulonephritis)", "category": "renal"},
    {"name": "IgA Nephropathy", "category": "renal"},
    {"name": "Diabetic Nephropathy", "category": "renal"},
    {"name": "Hypertensive Nephrosclerosis", "category": "renal"},
    {"name": "Polycystic Kidney Disease", "category": "renal"},
    {"name": "Renal Cell Carcinoma", "category": "renal"},
    {"name": "Urinary Tract Infection (Cystitis)", "category": "renal"},
    {"name": "Pyelonephritis", "category": "renal"},
    {"name": "Nephrolithiasis (Kidney Stones)", "category": "renal"},
    {"name": "Hyperkalemia", "category": "renal"},
    {"name": "Hyponatremia", "category": "renal"},
    {"name": "Metabolic Acidosis", "category": "renal"},
    {"name": "Metabolic Alkalosis", "category": "renal"},
    
    # ============ NEUROLOGY (20 diseases) ============
    {"name": "Hemorrhagic Stroke (Intracerebral)", "category": "neurological"},
    {"name": "Subarachnoid Hemorrhage", "category": "neurological"},
    {"name": "Transient Ischemic Attack", "category": "neurological"},
    {"name": "Alzheimer's Disease", "category": "neurological"},
    {"name": "Vascular Dementia", "category": "neurological"},
    {"name": "Lewy Body Dementia", "category": "neurological"},
    {"name": "Frontotemporal Dementia", "category": "neurological"},
    {"name": "Epilepsy (Generalized)", "category": "neurological"},
    {"name": "Status Epilepticus", "category": "neurological"},
    {"name": "Migraine", "category": "neurological"},
    {"name": "Tension-Type Headache", "category": "neurological"},
    {"name": "Cluster Headache", "category": "neurological"},
    {"name": "Guillain-Barré Syndrome", "category": "neurological"},
    {"name": "Myasthenia Gravis", "category": "neurological"},
    {"name": "Amyotrophic Lateral Sclerosis (ALS)", "category": "neurological"},
    {"name": "Meningitis (Bacterial)", "category": "neurological"},
    {"name": "Viral Encephalitis", "category": "neurological"},
    {"name": "Bell's Palsy", "category": "neurological"},
    {"name": "Trigeminal Neuralgia", "category": "neurological"},
    {"name": "Normal Pressure Hydrocephalus", "category": "neurological"},
    
    # ============ ENDOCRINOLOGY (15 diseases) ============
    {"name": "Type 1 Diabetes Mellitus", "category": "endocrine"},
    {"name": "Diabetic Ketoacidosis", "category": "endocrine"},
    {"name": "Hyperosmolar Hyperglycemic State", "category": "endocrine"},
    {"name": "Hypoglycemia", "category": "endocrine"},
    {"name": "Hyperthyroidism (Graves' Disease)", "category": "endocrine"},
    {"name": "Thyroid Storm", "category": "endocrine"},
    {"name": "Thyroid Nodules and Cancer", "category": "endocrine"},
    {"name": "Cushing's Syndrome", "category": "endocrine"},
    {"name": "Addison's Disease (Primary Adrenal Insufficiency)", "category": "endocrine"},
    {"name": "Adrenal Crisis", "category": "endocrine"},
    {"name": "Pheochromocytoma", "category": "endocrine"},
    {"name": "Primary Hyperaldosteronism", "category": "endocrine"},
    {"name": "Hyperparathyroidism", "category": "endocrine"},
    {"name": "Hypoparathyroidism", "category": "endocrine"},
    {"name": "Hypopituitarism", "category": "endocrine"},
    
    # ============ RHEUMATOLOGY (15 diseases) ============
    {"name": "Rheumatoid Arthritis", "category": "rheumatological"},
    {"name": "Systemic Lupus Erythematosus", "category": "rheumatological"},
    {"name": "Gout", "category": "rheumatological"},
    {"name": "Pseudogout (CPPD Disease)", "category": "rheumatological"},
    {"name": "Ankylosing Spondylitis", "category": "rheumatological"},
    {"name": "Psoriatic Arthritis", "category": "rheumatological"},
    {"name": "Reactive Arthritis", "category": "rheumatological"},
    {"name": "Sjögren's Syndrome", "category": "rheumatological"},
    {"name": "Systemic Sclerosis (Scleroderma)", "category": "rheumatological"},
    {"name": "Polymyositis/Dermatomyositis", "category": "rheumatological"},
    {"name": "Giant Cell Arteritis", "category": "rheumatological"},
    {"name": "Polymyalgia Rheumatica", "category": "rheumatological"},
    {"name": "Granulomatosis with Polyangiitis (GPA)", "category": "rheumatological"},
    {"name": "Antiphospholipid Syndrome", "category": "rheumatological"},
    {"name": "Fibromyalgia", "category": "rheumatological"},
    
    # ============ INFECTIOUS DISEASES (20 diseases) ============
    {"name": "Sepsis and Septic Shock", "category": "infectious"},
    {"name": "Cellulitis", "category": "infectious"},
    {"name": "Necrotizing Fasciitis", "category": "infectious"},
    {"name": "Osteomyelitis", "category": "infectious"},
    {"name": "HIV/AIDS", "category": "infectious"},
    {"name": "Influenza", "category": "infectious"},
    {"name": "Infectious Mononucleosis (EBV)", "category": "infectious"},
    {"name": "Herpes Zoster (Shingles)", "category": "infectious"},
    {"name": "Malaria", "category": "infectious"},
    {"name": "Dengue Fever", "category": "infectious"},
    {"name": "Typhoid Fever", "category": "infectious"},
    {"name": "Leptospirosis", "category": "infectious"},
    {"name": "Clostridium difficile Infection", "category": "infectious"},
    {"name": "Candidiasis (Systemic)", "category": "infectious"},
    {"name": "Aspergillosis", "category": "infectious"},
    {"name": "Cryptococcal Meningitis", "category": "infectious"},
    {"name": "Lyme Disease", "category": "infectious"},
    {"name": "Tetanus", "category": "infectious"},
    {"name": "Rabies", "category": "infectious"},
    {"name": "Infective Diarrhea (Acute Gastroenteritis)", "category": "infectious"},
    
    # ============ HEMATOLOGY/ONCOLOGY (20 diseases) ============
    {"name": "Anemia of Chronic Disease", "category": "hematological"},
    {"name": "Vitamin B12 Deficiency Anemia", "category": "hematological"},
    {"name": "Folate Deficiency Anemia", "category": "hematological"},
    {"name": "Autoimmune Hemolytic Anemia", "category": "hematological"},
    {"name": "Thrombotic Thrombocytopenic Purpura (TTP)", "category": "hematological"},
    {"name": "Immune Thrombocytopenic Purpura (ITP)", "category": "hematological"},
    {"name": "Disseminated Intravascular Coagulation (DIC)", "category": "hematological"},
    {"name": "Heparin-Induced Thrombocytopenia", "category": "hematological"},
    {"name": "Polycythemia Vera", "category": "hematological"},
    {"name": "Essential Thrombocythemia", "category": "hematological"},
    {"name": "Myelofibrosis", "category": "hematological"},
    {"name": "Chronic Myeloid Leukemia", "category": "hematological"},
    {"name": "Hodgkin Lymphoma", "category": "hematological"},
    {"name": "Non-Hodgkin Lymphoma (Diffuse Large B-Cell)", "category": "hematological"},
    {"name": "Follicular Lymphoma", "category": "hematological"},
    {"name": "Pancreatic Cancer", "category": "oncological"},
    {"name": "Gastric Cancer", "category": "oncological"},
    {"name": "Esophageal Cancer", "category": "oncological"},
    {"name": "Ovarian Cancer", "category": "oncological"},
    {"name": "Cervical Cancer", "category": "oncological"},
    
    # ============ EMERGENCY MEDICINE (15 diseases) ============
    {"name": "Anaphylaxis", "category": "emergency"},
    {"name": "Acute Asthma Exacerbation (Status Asthmaticus)", "category": "emergency"},
    {"name": "Hypertensive Emergency", "category": "emergency"},
    {"name": "Acute Coronary Syndrome (ED approach)", "category": "emergency"},
    {"name": "Cardiogenic Shock", "category": "emergency"},
    {"name": "Tension Pneumothorax", "category": "emergency"},
    {"name": "Massive Hemoptysis", "category": "emergency"},
    {"name": "Upper GI Bleeding (Variceal)", "category": "emergency"},
    {"name": "Acute Liver Failure", "category": "emergency"},
    {"name": "Rhabdomyolysis", "category": "emergency"},
    {"name": "Drug Overdose (Opioid)", "category": "emergency"},
    {"name": "Drug Overdose (Acetaminophen)", "category": "emergency"},
    {"name": "Alcohol Withdrawal", "category": "emergency"},
    {"name": "Heat Stroke", "category": "emergency"},
    {"name": "Hypothermia", "category": "emergency"},
    
    # ============ PSYCHIATRY (10 diseases) ============
    {"name": "Major Depressive Disorder", "category": "psychiatric"},
    {"name": "Bipolar Disorder", "category": "psychiatric"},
    {"name": "Generalized Anxiety Disorder", "category": "psychiatric"},
    {"name": "Panic Disorder", "category": "psychiatric"},
    {"name": "Schizophrenia", "category": "psychiatric"},
    {"name": "Post-Traumatic Stress Disorder", "category": "psychiatric"},
    {"name": "Obsessive-Compulsive Disorder", "category": "psychiatric"},
    {"name": "Anorexia Nervosa", "category": "psychiatric"},
    {"name": "Delirium", "category": "psychiatric"},
    {"name": "Substance Use Disorder", "category": "psychiatric"},
]


def get_priority_diseases() -> List[Dict[str, str]]:
    """Return the list of priority diseases for generation"""
    return PRIORITY_DISEASES


def get_disease_categories() -> Dict[str, Any]:
    """Return disease categories"""


# ============================================================================
# DRUG KNOWLEDGE GENERATOR
# Generates comprehensive drug data based on BNF, FDA, and pharmacological sources
# ============================================================================

class DrugKnowledgeGenerator:
    """
    Generates comprehensive drug knowledge using AI.
    Creates evidence-based drug profiles with pharmacological data.
    """
    
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        self.model_provider = "openai"
        self.model_name = "gpt-4o"
        
        # Drug categories for comprehensive coverage
        self.drug_categories = {
            "cardiovascular": ["antihypertensives", "antiarrhythmics", "anticoagulants", "antiplatelets", "lipid_lowering", "heart_failure", "vasodilators"],
            "antibiotics": ["penicillins", "cephalosporins", "fluoroquinolones", "macrolides", "aminoglycosides", "tetracyclines", "sulfonamides", "carbapenems", "glycopeptides"],
            "cns_neurological": ["antidepressants", "anxiolytics", "antipsychotics", "anticonvulsants", "parkinsons", "migraine", "sedatives", "stimulants"],
            "respiratory": ["bronchodilators", "corticosteroids_inhaled", "antihistamines", "decongestants", "antitussives", "mucolytics"],
            "gastrointestinal": ["ppis", "h2_blockers", "antiemetics", "laxatives", "antidiarrheals", "antispasmodics", "ibd_drugs"],
            "endocrine": ["insulin", "oral_antidiabetics", "thyroid", "corticosteroids", "bisphosphonates", "hormone_replacement"],
            "analgesics": ["nsaids", "opioids", "acetaminophen", "neuropathic_pain", "muscle_relaxants"],
            "antivirals": ["hiv", "hepatitis", "influenza", "herpes", "covid"],
            "antifungals": ["azoles", "echinocandins", "polyenes", "allylamines"],
            "immunosuppressants": ["calcineurin_inhibitors", "antimetabolites", "biologics", "dmards"],
            "oncology": ["cytotoxics", "targeted_therapy", "immunotherapy", "supportive_care"],
            "renal_urology": ["diuretics", "potassium_sparing", "bph", "overactive_bladder"],
            "hematology": ["anticoagulants", "antiplatelets", "thrombolytics", "hematopoietics", "iron_supplements"],
            "dermatology": ["topical_steroids", "antifungals_topical", "retinoids", "emollients"],
            "ophthalmology": ["glaucoma", "anti_vegf", "antibiotics_ophthalmic", "lubricants"],
            "psychiatry": ["antidepressants", "antipsychotics", "mood_stabilizers", "adhd", "anxiolytics"]
        }
    
    async def generate_drug(self, drug_name: str, category: str = None, region: str = "international") -> Dict[str, Any]:
        """
        Generate comprehensive drug data using AI.
        
        Args:
            drug_name: Name of the drug (generic or brand)
            category: Drug category (e.g., "cardiovascular", "antibiotics")
            region: Region for regulatory info ("uk", "us", "india", "international")
        
        Returns:
            Comprehensive drug profile
        """
        if not EMERGENT_AVAILABLE or not self.api_key:
            raise ValueError("AI generation not available - EMERGENT_LLM_KEY required")
        
        prompt = f"""Generate comprehensive pharmaceutical data for: {drug_name}
        
Category: {category or "to be determined"}
Region focus: {region}

Provide a complete drug profile in the following JSON structure:
{{
    "id": "lowercase_no_spaces",
    "name": "Generic Name",
    "brand_names": ["Brand1", "Brand2"],
    "drug_class": "Pharmacological class",
    "category": "therapeutic_category",
    "atc_code": "ATC classification code",
    "mechanism_of_action": "Detailed mechanism",
    "mechanism_short": "Brief mechanism for UI display",
    "pharmacokinetics": {{
        "absorption": "Absorption details",
        "distribution": "Distribution and protein binding",
        "metabolism": "Hepatic metabolism details",
        "elimination": "Elimination route and half-life",
        "half_life": "hours",
        "bioavailability": "percentage",
        "protein_binding": "percentage",
        "volume_of_distribution": "L/kg"
    }},
    "dosages": [
        {{
            "indication": "Primary indication",
            "route": "oral/IV/IM/SC/topical",
            "form": "tablet/capsule/injection/solution",
            "strength": "Available strengths",
            "typical_dose": "Standard adult dose",
            "max_daily_dose": "Maximum dose",
            "frequency": "Dosing frequency",
            "renal_adjustment": "Dose adjustment for renal impairment",
            "hepatic_adjustment": "Dose adjustment for hepatic impairment",
            "pediatric_dose": "Pediatric dosing if applicable",
            "geriatric_dose": "Geriatric considerations"
        }}
    ],
    "indications": ["List of approved indications"],
    "contraindications": ["List of contraindications"],
    "warnings": ["Important warnings and precautions"],
    "drug_interactions": [
        {{
            "drug": "Interacting drug",
            "severity": "severe/moderate/minor",
            "effect": "Description of interaction"
        }}
    ],
    "side_effects": {{
        "common": ["Common side effects (>1%)"],
        "uncommon": ["Uncommon (0.1-1%)"],
        "rare": ["Rare (<0.1%)"],
        "serious": ["Serious/life-threatening"]
    }},
    "pregnancy_category": "Category or specific guidance",
    "lactation": "Breastfeeding guidance",
    "monitoring": ["Required monitoring parameters"],
    "storage": "Storage requirements",
    "cost_category": "low/medium/high/very_high",
    "regulatory_status": {{
        "uk_bnf": "BNF status and chapter",
        "us_fda": "FDA approval status",
        "india": "Indian regulatory status"
    }},
    "clinical_pearls": ["Key clinical points for prescribers"],
    "therapeutic_effects": [
        {{
            "organ_system": "Affected organ",
            "effect": "Description of therapeutic effect",
            "parameters_affected": ["List of physiological parameters affected"]
        }}
    ]
}}

Ensure all data is evidence-based and clinically accurate. Include BNF/FDA standard information.
Return ONLY valid JSON, no additional text."""

        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"drug_gen_{drug_name.replace(' ', '_')}",
                system_message="You are a pharmaceutical expert. Generate accurate drug information based on BNF, FDA, and international pharmacological sources. Return only valid JSON."
            ).with_model(self.model_provider, self.model_name)
            
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Parse the response - extract JSON
            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                drug_data = json.loads(json_match.group())
            
            # Add metadata
            drug_data["generated_at"] = datetime.now(timezone.utc).isoformat()
            drug_data["generator_version"] = "2.0"
            drug_data["source"] = "ai_generated_bnf_fda"
            
            return drug_data
            
        except Exception as e:
            print(f"Error generating drug {drug_name}: {e}")
            raise
    
    async def generate_drugs_batch(self, drugs: List[Dict[str, str]], batch_size: int = 5) -> List[Dict[str, Any]]:
        """
        Generate multiple drugs in batches.
        
        Args:
            drugs: List of {"name": "drug_name", "category": "category"}
            batch_size: Number of drugs to generate in parallel
        
        Returns:
            List of generated drug profiles
        """
        results = []
        
        for i in range(0, len(drugs), batch_size):
            batch = drugs[i:i + batch_size]
            tasks = [
                self.generate_drug(
                    d["name"],
                    d.get("category"),
                    d.get("region", "international")
                )
                for d in batch
            ]
            
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for drug, result in zip(batch, batch_results):
                if isinstance(result, Exception):
                    print(f"Failed to generate {drug['name']}: {result}")
                else:
                    results.append(result)
            
            # Small delay between batches to avoid rate limiting
            if i + batch_size < len(drugs):
                await asyncio.sleep(1)
        
        return results


# Priority drugs list - BNF essential drugs + US common drugs + India essential drugs
PRIORITY_DRUGS = [
    # ============ CARDIOVASCULAR (50 drugs) ============
    {"name": "Lisinopril", "category": "cardiovascular"},
    {"name": "Ramipril", "category": "cardiovascular"},
    {"name": "Enalapril", "category": "cardiovascular"},
    {"name": "Perindopril", "category": "cardiovascular"},
    {"name": "Captopril", "category": "cardiovascular"},
    {"name": "Losartan", "category": "cardiovascular"},
    {"name": "Valsartan", "category": "cardiovascular"},
    {"name": "Candesartan", "category": "cardiovascular"},
    {"name": "Irbesartan", "category": "cardiovascular"},
    {"name": "Telmisartan", "category": "cardiovascular"},
    {"name": "Amlodipine", "category": "cardiovascular"},
    {"name": "Nifedipine", "category": "cardiovascular"},
    {"name": "Diltiazem", "category": "cardiovascular"},
    {"name": "Verapamil", "category": "cardiovascular"},
    {"name": "Felodipine", "category": "cardiovascular"},
    {"name": "Metoprolol", "category": "cardiovascular"},
    {"name": "Bisoprolol", "category": "cardiovascular"},
    {"name": "Carvedilol", "category": "cardiovascular"},
    {"name": "Atenolol", "category": "cardiovascular"},
    {"name": "Propranolol", "category": "cardiovascular"},
    {"name": "Nebivolol", "category": "cardiovascular"},
    {"name": "Furosemide", "category": "cardiovascular"},
    {"name": "Bumetanide", "category": "cardiovascular"},
    {"name": "Hydrochlorothiazide", "category": "cardiovascular"},
    {"name": "Indapamide", "category": "cardiovascular"},
    {"name": "Spironolactone", "category": "cardiovascular"},
    {"name": "Eplerenone", "category": "cardiovascular"},
    {"name": "Atorvastatin", "category": "cardiovascular"},
    {"name": "Rosuvastatin", "category": "cardiovascular"},
    {"name": "Simvastatin", "category": "cardiovascular"},
    {"name": "Pravastatin", "category": "cardiovascular"},
    {"name": "Warfarin", "category": "cardiovascular"},
    {"name": "Apixaban", "category": "cardiovascular"},
    {"name": "Rivaroxaban", "category": "cardiovascular"},
    {"name": "Dabigatran", "category": "cardiovascular"},
    {"name": "Edoxaban", "category": "cardiovascular"},
    {"name": "Enoxaparin", "category": "cardiovascular"},
    {"name": "Heparin", "category": "cardiovascular"},
    {"name": "Aspirin", "category": "cardiovascular"},
    {"name": "Clopidogrel", "category": "cardiovascular"},
    {"name": "Ticagrelor", "category": "cardiovascular"},
    {"name": "Prasugrel", "category": "cardiovascular"},
    {"name": "Digoxin", "category": "cardiovascular"},
    {"name": "Amiodarone", "category": "cardiovascular"},
    {"name": "Flecainide", "category": "cardiovascular"},
    {"name": "Sotalol", "category": "cardiovascular"},
    {"name": "Isosorbide Mononitrate", "category": "cardiovascular"},
    {"name": "Glyceryl Trinitrate (GTN)", "category": "cardiovascular"},
    {"name": "Ivabradine", "category": "cardiovascular"},
    {"name": "Sacubitril/Valsartan", "category": "cardiovascular"},
    
    # ============ ANTIBIOTICS (60 drugs) ============
    {"name": "Amoxicillin", "category": "antibiotics"},
    {"name": "Ampicillin", "category": "antibiotics"},
    {"name": "Co-amoxiclav (Augmentin)", "category": "antibiotics"},
    {"name": "Flucloxacillin", "category": "antibiotics"},
    {"name": "Phenoxymethylpenicillin", "category": "antibiotics"},
    {"name": "Benzylpenicillin", "category": "antibiotics"},
    {"name": "Piperacillin/Tazobactam", "category": "antibiotics"},
    {"name": "Cefalexin", "category": "antibiotics"},
    {"name": "Cefuroxime", "category": "antibiotics"},
    {"name": "Ceftriaxone", "category": "antibiotics"},
    {"name": "Ceftazidime", "category": "antibiotics"},
    {"name": "Cefotaxime", "category": "antibiotics"},
    {"name": "Cefixime", "category": "antibiotics"},
    {"name": "Cefpodoxime", "category": "antibiotics"},
    {"name": "Meropenem", "category": "antibiotics"},
    {"name": "Imipenem/Cilastatin", "category": "antibiotics"},
    {"name": "Ertapenem", "category": "antibiotics"},
    {"name": "Azithromycin", "category": "antibiotics"},
    {"name": "Clarithromycin", "category": "antibiotics"},
    {"name": "Erythromycin", "category": "antibiotics"},
    {"name": "Ciprofloxacin", "category": "antibiotics"},
    {"name": "Levofloxacin", "category": "antibiotics"},
    {"name": "Moxifloxacin", "category": "antibiotics"},
    {"name": "Norfloxacin", "category": "antibiotics"},
    {"name": "Ofloxacin", "category": "antibiotics"},
    {"name": "Doxycycline", "category": "antibiotics"},
    {"name": "Tetracycline", "category": "antibiotics"},
    {"name": "Minocycline", "category": "antibiotics"},
    {"name": "Tigecycline", "category": "antibiotics"},
    {"name": "Gentamicin", "category": "antibiotics"},
    {"name": "Amikacin", "category": "antibiotics"},
    {"name": "Tobramycin", "category": "antibiotics"},
    {"name": "Vancomycin", "category": "antibiotics"},
    {"name": "Teicoplanin", "category": "antibiotics"},
    {"name": "Linezolid", "category": "antibiotics"},
    {"name": "Daptomycin", "category": "antibiotics"},
    {"name": "Trimethoprim", "category": "antibiotics"},
    {"name": "Co-trimoxazole", "category": "antibiotics"},
    {"name": "Nitrofurantoin", "category": "antibiotics"},
    {"name": "Metronidazole", "category": "antibiotics"},
    {"name": "Clindamycin", "category": "antibiotics"},
    {"name": "Rifampicin", "category": "antibiotics"},
    {"name": "Isoniazid", "category": "antibiotics"},
    {"name": "Pyrazinamide", "category": "antibiotics"},
    {"name": "Ethambutol", "category": "antibiotics"},
    {"name": "Colistin", "category": "antibiotics"},
    {"name": "Fosfomycin", "category": "antibiotics"},
    {"name": "Chloramphenicol", "category": "antibiotics"},
    
    # ============ CNS/NEUROLOGICAL (40 drugs) ============
    {"name": "Sertraline", "category": "cns_neurological"},
    {"name": "Fluoxetine", "category": "cns_neurological"},
    {"name": "Citalopram", "category": "cns_neurological"},
    {"name": "Escitalopram", "category": "cns_neurological"},
    {"name": "Paroxetine", "category": "cns_neurological"},
    {"name": "Venlafaxine", "category": "cns_neurological"},
    {"name": "Duloxetine", "category": "cns_neurological"},
    {"name": "Mirtazapine", "category": "cns_neurological"},
    {"name": "Amitriptyline", "category": "cns_neurological"},
    {"name": "Nortriptyline", "category": "cns_neurological"},
    {"name": "Bupropion", "category": "cns_neurological"},
    {"name": "Trazodone", "category": "cns_neurological"},
    {"name": "Diazepam", "category": "cns_neurological"},
    {"name": "Lorazepam", "category": "cns_neurological"},
    {"name": "Alprazolam", "category": "cns_neurological"},
    {"name": "Clonazepam", "category": "cns_neurological"},
    {"name": "Midazolam", "category": "cns_neurological"},
    {"name": "Zopiclone", "category": "cns_neurological"},
    {"name": "Zolpidem", "category": "cns_neurological"},
    {"name": "Risperidone", "category": "cns_neurological"},
    {"name": "Olanzapine", "category": "cns_neurological"},
    {"name": "Quetiapine", "category": "cns_neurological"},
    {"name": "Aripiprazole", "category": "cns_neurological"},
    {"name": "Haloperidol", "category": "cns_neurological"},
    {"name": "Lithium", "category": "cns_neurological"},
    {"name": "Valproate", "category": "cns_neurological"},
    {"name": "Carbamazepine", "category": "cns_neurological"},
    {"name": "Lamotrigine", "category": "cns_neurological"},
    {"name": "Levetiracetam", "category": "cns_neurological"},
    {"name": "Phenytoin", "category": "cns_neurological"},
    {"name": "Gabapentin", "category": "cns_neurological"},
    {"name": "Pregabalin", "category": "cns_neurological"},
    {"name": "Topiramate", "category": "cns_neurological"},
    {"name": "Levodopa/Carbidopa", "category": "cns_neurological"},
    {"name": "Pramipexole", "category": "cns_neurological"},
    {"name": "Ropinirole", "category": "cns_neurological"},
    {"name": "Donepezil", "category": "cns_neurological"},
    {"name": "Memantine", "category": "cns_neurological"},
    {"name": "Sumatriptan", "category": "cns_neurological"},
    {"name": "Methylphenidate", "category": "cns_neurological"},
    
    # ============ RESPIRATORY (25 drugs) ============
    {"name": "Salbutamol", "category": "respiratory"},
    {"name": "Ipratropium", "category": "respiratory"},
    {"name": "Tiotropium", "category": "respiratory"},
    {"name": "Salmeterol", "category": "respiratory"},
    {"name": "Formoterol", "category": "respiratory"},
    {"name": "Beclometasone", "category": "respiratory"},
    {"name": "Budesonide", "category": "respiratory"},
    {"name": "Fluticasone", "category": "respiratory"},
    {"name": "Mometasone", "category": "respiratory"},
    {"name": "Ciclesonide", "category": "respiratory"},
    {"name": "Montelukast", "category": "respiratory"},
    {"name": "Theophylline", "category": "respiratory"},
    {"name": "Aminophylline", "category": "respiratory"},
    {"name": "Prednisolone", "category": "respiratory"},
    {"name": "Dexamethasone", "category": "respiratory"},
    {"name": "Hydrocortisone", "category": "respiratory"},
    {"name": "Cetirizine", "category": "respiratory"},
    {"name": "Loratadine", "category": "respiratory"},
    {"name": "Fexofenadine", "category": "respiratory"},
    {"name": "Chlorphenamine", "category": "respiratory"},
    {"name": "Pseudoephedrine", "category": "respiratory"},
    {"name": "Codeine (antitussive)", "category": "respiratory"},
    {"name": "Dextromethorphan", "category": "respiratory"},
    {"name": "Carbocisteine", "category": "respiratory"},
    {"name": "N-Acetylcysteine", "category": "respiratory"},
    
    # ============ GASTROINTESTINAL (30 drugs) ============
    {"name": "Omeprazole", "category": "gastrointestinal"},
    {"name": "Lansoprazole", "category": "gastrointestinal"},
    {"name": "Pantoprazole", "category": "gastrointestinal"},
    {"name": "Esomeprazole", "category": "gastrointestinal"},
    {"name": "Rabeprazole", "category": "gastrointestinal"},
    {"name": "Ranitidine", "category": "gastrointestinal"},
    {"name": "Famotidine", "category": "gastrointestinal"},
    {"name": "Metoclopramide", "category": "gastrointestinal"},
    {"name": "Domperidone", "category": "gastrointestinal"},
    {"name": "Ondansetron", "category": "gastrointestinal"},
    {"name": "Cyclizine", "category": "gastrointestinal"},
    {"name": "Prochlorperazine", "category": "gastrointestinal"},
    {"name": "Lactulose", "category": "gastrointestinal"},
    {"name": "Senna", "category": "gastrointestinal"},
    {"name": "Bisacodyl", "category": "gastrointestinal"},
    {"name": "Macrogol", "category": "gastrointestinal"},
    {"name": "Loperamide", "category": "gastrointestinal"},
    {"name": "Hyoscine Butylbromide", "category": "gastrointestinal"},
    {"name": "Mebeverine", "category": "gastrointestinal"},
    {"name": "Sulfasalazine", "category": "gastrointestinal"},
    {"name": "Mesalazine", "category": "gastrointestinal"},
    {"name": "Azathioprine", "category": "gastrointestinal"},
    {"name": "Infliximab", "category": "gastrointestinal"},
    {"name": "Adalimumab", "category": "gastrointestinal"},
    {"name": "Pancreatin", "category": "gastrointestinal"},
    {"name": "Ursodeoxycholic Acid", "category": "gastrointestinal"},
    {"name": "Cholestyramine", "category": "gastrointestinal"},
    {"name": "Sucralfate", "category": "gastrointestinal"},
    {"name": "Misoprostol", "category": "gastrointestinal"},
    {"name": "Octreotide", "category": "gastrointestinal"},
    
    # ============ ENDOCRINE/DIABETES (35 drugs) ============
    {"name": "Metformin", "category": "endocrine"},
    {"name": "Gliclazide", "category": "endocrine"},
    {"name": "Glimepiride", "category": "endocrine"},
    {"name": "Glipizide", "category": "endocrine"},
    {"name": "Pioglitazone", "category": "endocrine"},
    {"name": "Sitagliptin", "category": "endocrine"},
    {"name": "Linagliptin", "category": "endocrine"},
    {"name": "Empagliflozin", "category": "endocrine"},
    {"name": "Dapagliflozin", "category": "endocrine"},
    {"name": "Canagliflozin", "category": "endocrine"},
    {"name": "Liraglutide", "category": "endocrine"},
    {"name": "Semaglutide", "category": "endocrine"},
    {"name": "Dulaglutide", "category": "endocrine"},
    {"name": "Insulin Aspart", "category": "endocrine"},
    {"name": "Insulin Lispro", "category": "endocrine"},
    {"name": "Insulin Glargine", "category": "endocrine"},
    {"name": "Insulin Degludec", "category": "endocrine"},
    {"name": "Insulin NPH", "category": "endocrine"},
    {"name": "Levothyroxine", "category": "endocrine"},
    {"name": "Carbimazole", "category": "endocrine"},
    {"name": "Propylthiouracil", "category": "endocrine"},
    {"name": "Prednisolone", "category": "endocrine"},
    {"name": "Hydrocortisone", "category": "endocrine"},
    {"name": "Fludrocortisone", "category": "endocrine"},
    {"name": "Alendronate", "category": "endocrine"},
    {"name": "Risedronate", "category": "endocrine"},
    {"name": "Zoledronic Acid", "category": "endocrine"},
    {"name": "Denosumab", "category": "endocrine"},
    {"name": "Teriparatide", "category": "endocrine"},
    {"name": "Raloxifene", "category": "endocrine"},
    {"name": "HRT (Estradiol)", "category": "endocrine"},
    {"name": "Testosterone", "category": "endocrine"},
    {"name": "Finasteride", "category": "endocrine"},
    {"name": "Tamsulosin", "category": "endocrine"},
    {"name": "Desmopressin", "category": "endocrine"},
    
    # ============ ANALGESICS (25 drugs) ============
    {"name": "Paracetamol (Acetaminophen)", "category": "analgesics"},
    {"name": "Ibuprofen", "category": "analgesics"},
    {"name": "Naproxen", "category": "analgesics"},
    {"name": "Diclofenac", "category": "analgesics"},
    {"name": "Celecoxib", "category": "analgesics"},
    {"name": "Etoricoxib", "category": "analgesics"},
    {"name": "Meloxicam", "category": "analgesics"},
    {"name": "Indomethacin", "category": "analgesics"},
    {"name": "Codeine", "category": "analgesics"},
    {"name": "Tramadol", "category": "analgesics"},
    {"name": "Morphine", "category": "analgesics"},
    {"name": "Oxycodone", "category": "analgesics"},
    {"name": "Fentanyl", "category": "analgesics"},
    {"name": "Buprenorphine", "category": "analgesics"},
    {"name": "Hydromorphone", "category": "analgesics"},
    {"name": "Tapentadol", "category": "analgesics"},
    {"name": "Co-codamol", "category": "analgesics"},
    {"name": "Co-dydramol", "category": "analgesics"},
    {"name": "Methocarbamol", "category": "analgesics"},
    {"name": "Baclofen", "category": "analgesics"},
    {"name": "Tizanidine", "category": "analgesics"},
    {"name": "Lidocaine (topical)", "category": "analgesics"},
    {"name": "Capsaicin", "category": "analgesics"},
    {"name": "Naloxone", "category": "analgesics"},
    {"name": "Naltrexone", "category": "analgesics"},
    
    # ============ ANTIVIRALS (20 drugs) ============
    {"name": "Aciclovir", "category": "antivirals"},
    {"name": "Valaciclovir", "category": "antivirals"},
    {"name": "Famciclovir", "category": "antivirals"},
    {"name": "Oseltamivir", "category": "antivirals"},
    {"name": "Zanamivir", "category": "antivirals"},
    {"name": "Remdesivir", "category": "antivirals"},
    {"name": "Nirmatrelvir/Ritonavir", "category": "antivirals"},
    {"name": "Molnupiravir", "category": "antivirals"},
    {"name": "Tenofovir", "category": "antivirals"},
    {"name": "Entecavir", "category": "antivirals"},
    {"name": "Sofosbuvir", "category": "antivirals"},
    {"name": "Ledipasvir", "category": "antivirals"},
    {"name": "Ribavirin", "category": "antivirals"},
    {"name": "Dolutegravir", "category": "antivirals"},
    {"name": "Bictegravir", "category": "antivirals"},
    {"name": "Efavirenz", "category": "antivirals"},
    {"name": "Lamivudine", "category": "antivirals"},
    {"name": "Abacavir", "category": "antivirals"},
    {"name": "Darunavir", "category": "antivirals"},
    {"name": "Atazanavir", "category": "antivirals"},
    
    # ============ ANTIFUNGALS (15 drugs) ============
    {"name": "Fluconazole", "category": "antifungals"},
    {"name": "Itraconazole", "category": "antifungals"},
    {"name": "Voriconazole", "category": "antifungals"},
    {"name": "Posaconazole", "category": "antifungals"},
    {"name": "Amphotericin B", "category": "antifungals"},
    {"name": "Caspofungin", "category": "antifungals"},
    {"name": "Anidulafungin", "category": "antifungals"},
    {"name": "Micafungin", "category": "antifungals"},
    {"name": "Flucytosine", "category": "antifungals"},
    {"name": "Terbinafine", "category": "antifungals"},
    {"name": "Griseofulvin", "category": "antifungals"},
    {"name": "Nystatin", "category": "antifungals"},
    {"name": "Clotrimazole", "category": "antifungals"},
    {"name": "Miconazole", "category": "antifungals"},
    {"name": "Ketoconazole", "category": "antifungals"},
    
    # ============ IMMUNOSUPPRESSANTS/BIOLOGICS (20 drugs) ============
    {"name": "Ciclosporin", "category": "immunosuppressants"},
    {"name": "Tacrolimus", "category": "immunosuppressants"},
    {"name": "Mycophenolate", "category": "immunosuppressants"},
    {"name": "Sirolimus", "category": "immunosuppressants"},
    {"name": "Everolimus", "category": "immunosuppressants"},
    {"name": "Methotrexate", "category": "immunosuppressants"},
    {"name": "Leflunomide", "category": "immunosuppressants"},
    {"name": "Hydroxychloroquine", "category": "immunosuppressants"},
    {"name": "Sulfasalazine", "category": "immunosuppressants"},
    {"name": "Etanercept", "category": "immunosuppressants"},
    {"name": "Rituximab", "category": "immunosuppressants"},
    {"name": "Tocilizumab", "category": "immunosuppressants"},
    {"name": "Secukinumab", "category": "immunosuppressants"},
    {"name": "Ustekinumab", "category": "immunosuppressants"},
    {"name": "Vedolizumab", "category": "immunosuppressants"},
    {"name": "Baricitinib", "category": "immunosuppressants"},
    {"name": "Tofacitinib", "category": "immunosuppressants"},
    {"name": "Anakinra", "category": "immunosuppressants"},
    {"name": "Belimumab", "category": "immunosuppressants"},
    {"name": "Dupilumab", "category": "immunosuppressants"},
]


def get_priority_drugs() -> List[Dict[str, str]]:
    """Return the list of priority drugs for generation"""
    return PRIORITY_DRUGS


def get_drug_categories() -> Dict[str, Any]:
    """Return drug categories"""
    generator = DrugKnowledgeGenerator()
    return generator.drug_categories

    generator = MedicalKnowledgeGenerator()
    return generator.disease_categories
