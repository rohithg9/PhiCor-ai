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
    generator = MedicalKnowledgeGenerator()
    return generator.disease_categories
