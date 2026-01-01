"""
Integrated Clinical Engine
Unified clinical decision support that connects ALL PhiCor data sources:
- Disease Database (132 comprehensive diseases)
- Drug Database (115 drugs)
- AI Synthesis (GPT-4o)

This creates a single source of truth for accurate, reliable medical recommendations.
"""

import asyncio
import json
import os
import re
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False


class IntegratedClinicalEngine:
    """
    Unified clinical decision support engine that:
    1. Queries our disease database for evidence-based information
    2. Cross-references symptoms/labs/imaging with curated data
    3. Links diagnoses to our drug database for treatment recommendations
    4. Uses AI to synthesize and explain clinical reasoning
    """
    
    def __init__(self, db):
        """
        Initialize with database connection.
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        self.model_provider = "openai"
        self.model_name = "gpt-4o"
        
        self.system_prompt = """You are PhiCor, an expert clinical decision support system. 
You have access to a curated medical knowledge base with comprehensive disease and drug information.

Your role:
1. ANALYZE the clinical presentation using evidence-based medicine
2. MATCH findings to diseases in our database (provided to you)
3. RECOMMEND treatments from our drug database (provided to you)
4. EXPLAIN reasoning like an experienced physician teaching a student

Key principles:
- Use sensitivity/specificity data when available
- Cite guideline sources (ESC, AHA, NICE, etc.)
- Consider differential diagnosis - what fits, what doesn't
- Highlight "can't miss" diagnoses
- Recommend evidence-based treatments with dosages

Always base your response on the CURATED DATA provided, supplemented by your medical knowledge."""

    async def get_matching_diseases(self, findings: Dict[str, Any]) -> List[Dict]:
        """
        Query disease database for diseases matching the clinical findings.
        
        Args:
            findings: Dict with symptoms, labs, imaging findings
            
        Returns:
            List of matching diseases from our database
        """
        matching_diseases = []
        
        # Extract keywords from findings
        keywords = set()
        
        # From symptoms
        for symptom in findings.get('symptoms', []):
            name = symptom.get('name', '').lower()
            keywords.add(name)
            # Add related terms
            if 'dyspnea' in name or 'breath' in name:
                keywords.update(['dyspnea', 'shortness of breath', 'respiratory'])
            if 'chest' in name or 'pain' in name:
                keywords.update(['chest pain', 'angina', 'cardiac'])
            if 'edema' in name or 'swelling' in name:
                keywords.update(['edema', 'swelling', 'fluid'])
            if 'fatigue' in name or 'tired' in name:
                keywords.update(['fatigue', 'weakness'])
        
        # From labs
        for lab in findings.get('lab_findings', []):
            name = lab.get('name', '').lower()
            keywords.add(name)
            if 'bnp' in name or 'natriuretic' in name:
                keywords.update(['heart failure', 'cardiac'])
            if 'troponin' in name:
                keywords.update(['myocardial infarction', 'acs', 'cardiac'])
            if 'creatinine' in name or 'gfr' in name:
                keywords.update(['kidney', 'renal'])
            if 'glucose' in name or 'hba1c' in name:
                keywords.update(['diabetes', 'metabolic'])
        
        # From imaging
        for img in findings.get('imaging_findings', []):
            name = img.get('name', '').lower()
            keywords.add(name)
            if 'cardiomegaly' in name or 'dilated' in name or 'ef' in name:
                keywords.update(['cardiomyopathy', 'heart failure'])
            if 'consolidation' in name or 'infiltrate' in name:
                keywords.update(['pneumonia', 'infection'])
            if 'effusion' in name:
                keywords.update(['effusion', 'fluid'])
        
        # Query diseases that match these keywords
        # Search in name, description, symptoms, and clinical presentation
        search_queries = []
        for keyword in list(keywords)[:20]:  # Limit to prevent huge queries
            if len(keyword) > 2:
                search_queries.append({
                    "$or": [
                        {"name": {"$regex": keyword, "$options": "i"}},
                        {"description": {"$regex": keyword, "$options": "i"}},
                        {"synonyms": {"$regex": keyword, "$options": "i"}},
                        {"clinical_presentation.symptoms.name": {"$regex": keyword, "$options": "i"}},
                        {"clinical_presentation.typical_presentation": {"$regex": keyword, "$options": "i"}}
                    ]
                })
        
        if search_queries:
            # Find diseases matching any of the keywords
            cursor = self.db.diseases.find(
                {"$or": search_queries},
                {"_id": 0}
            ).limit(20)
            matching_diseases = await cursor.to_list(20)
        
        # If no matches, get diseases by category based on primary organ affected
        if not matching_diseases:
            categories = []
            if any(k in str(keywords) for k in ['heart', 'cardiac', 'chest', 'bnp', 'troponin']):
                categories.append('cardiovascular')
            if any(k in str(keywords) for k in ['lung', 'breath', 'respiratory', 'pneumonia']):
                categories.append('respiratory')
            if any(k in str(keywords) for k in ['kidney', 'renal', 'creatinine']):
                categories.append('renal')
            
            if categories:
                cursor = self.db.diseases.find(
                    {"category": {"$in": categories}},
                    {"_id": 0}
                ).limit(15)
                matching_diseases = await cursor.to_list(15)
        
        return matching_diseases

    async def get_relevant_drugs(self, disease_names: List[str], categories: List[str] = None) -> List[Dict]:
        """
        Query drug database for drugs relevant to the diagnoses.
        
        Args:
            disease_names: List of disease names
            categories: Optional list of drug categories
            
        Returns:
            List of relevant drugs from our database
        """
        relevant_drugs = []
        
        # Map diseases to drug categories
        drug_categories = set()
        
        for disease in disease_names:
            disease_lower = disease.lower()
            
            # Cardiovascular diseases
            if any(term in disease_lower for term in ['heart failure', 'cardiomyopathy', 'cardiac']):
                drug_categories.update(['cardiovascular', 'diuretic', 'ace_inhibitor', 'beta_blocker'])
            if any(term in disease_lower for term in ['myocardial infarction', 'acs', 'angina']):
                drug_categories.update(['cardiovascular', 'antiplatelet', 'anticoagulant', 'statin'])
            if any(term in disease_lower for term in ['arrhythmia', 'fibrillation', 'flutter']):
                drug_categories.update(['cardiovascular', 'antiarrhythmic', 'anticoagulant'])
            if 'hypertension' in disease_lower:
                drug_categories.update(['cardiovascular', 'antihypertensive'])
            
            # Respiratory diseases
            if any(term in disease_lower for term in ['pneumonia', 'infection']):
                drug_categories.update(['antibiotic', 'antimicrobial'])
            if any(term in disease_lower for term in ['asthma', 'copd', 'bronch']):
                drug_categories.update(['respiratory', 'bronchodilator', 'corticosteroid'])
            
            # Diabetes/Endocrine
            if 'diabetes' in disease_lower or 'ketoacidosis' in disease_lower:
                drug_categories.update(['antidiabetic', 'insulin', 'endocrine'])
            
            # Pain/Inflammation
            if any(term in disease_lower for term in ['arthritis', 'gout', 'inflammatory']):
                drug_categories.update(['nsaid', 'analgesic', 'immunosuppressant'])
            
            # Infections
            if any(term in disease_lower for term in ['sepsis', 'infection', 'bacterial']):
                drug_categories.update(['antibiotic', 'antimicrobial'])
            
            # Psychiatric
            if any(term in disease_lower for term in ['depression', 'anxiety', 'bipolar', 'schizophrenia']):
                drug_categories.update(['psychiatric', 'cns', 'antidepressant', 'antipsychotic'])
            
            # Anticoagulation
            if any(term in disease_lower for term in ['embolism', 'thrombosis', 'dvt', 'pe']):
                drug_categories.update(['anticoagulant', 'thrombolytic'])
        
        # Add user-specified categories
        if categories:
            drug_categories.update(categories)
        
        # Query drugs
        if drug_categories:
            cursor = self.db.drugs.find(
                {"category": {"$in": list(drug_categories)}},
                {"_id": 0}
            ).limit(25)
            relevant_drugs = await cursor.to_list(25)
        
        return relevant_drugs

    async def synthesize_with_knowledge_base(
        self,
        clinical_text: str,
        lab_findings: List[Dict],
        imaging_findings: List[Dict],
        symptoms: List[Dict],
        patient_info: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Perform clinical synthesis using our integrated knowledge base.
        
        This method:
        1. Queries our disease database for matching conditions
        2. Queries our drug database for relevant treatments
        3. Uses AI to synthesize findings with our curated data
        4. Returns evidence-based recommendations
        
        Args:
            clinical_text: Free text clinical notes
            lab_findings: List of lab abnormalities
            imaging_findings: List of imaging findings
            symptoms: List of symptoms
            patient_info: Optional patient demographics
            
        Returns:
            Comprehensive clinical synthesis with database-backed recommendations
        """
        findings = {
            'symptoms': symptoms,
            'lab_findings': lab_findings,
            'imaging_findings': imaging_findings
        }
        
        # Step 1: Query our disease database
        matching_diseases = await self.get_matching_diseases(findings)
        
        # Step 2: Get disease names for drug lookup
        disease_names = [d.get('name', '') for d in matching_diseases[:10]]
        
        # Step 3: Query our drug database
        relevant_drugs = await self.get_relevant_drugs(disease_names)
        
        # Step 4: Build context from our databases
        disease_context = self._format_disease_context(matching_diseases[:8])
        drug_context = self._format_drug_context(relevant_drugs[:15])
        case_summary = self._build_case_summary(clinical_text, lab_findings, imaging_findings, symptoms, patient_info)
        
        # Step 5: Use AI to synthesize with our curated data
        if EMERGENT_AVAILABLE and self.api_key:
            synthesis = await self._ai_synthesis_with_context(
                case_summary, disease_context, drug_context
            )
        else:
            synthesis = self._local_synthesis(matching_diseases, relevant_drugs, findings)
        
        # Step 6: Enhance synthesis with database references
        synthesis['knowledge_base'] = {
            'diseases_referenced': len(matching_diseases),
            'drugs_referenced': len(relevant_drugs),
            'database_diseases': [{'id': d.get('id'), 'name': d.get('name'), 'icd10': d.get('icd10_code')} for d in matching_diseases[:5]],
            'recommended_drugs': [{'name': dr.get('name'), 'category': dr.get('category')} for dr in relevant_drugs[:10]]
        }
        
        return synthesis

    def _format_disease_context(self, diseases: List[Dict]) -> str:
        """Format disease data for AI context."""
        if not diseases:
            return "No specific diseases found in database matching these findings."
        
        context_parts = ["=== PHICOR DISEASE DATABASE (Curated Medical Knowledge) ===\n"]
        
        for i, disease in enumerate(diseases[:8], 1):
            parts = [f"\n--- Disease {i}: {disease.get('name', 'Unknown')} ---"]
            parts.append(f"ICD-10: {disease.get('icd10_code', 'N/A')}")
            parts.append(f"Category: {disease.get('category', 'N/A')}")
            
            if disease.get('description'):
                parts.append(f"Description: {disease['description'][:300]}")
            
            # Clinical presentation
            cp = disease.get('clinical_presentation', {})
            if cp.get('symptoms'):
                symptom_list = []
                for s in cp['symptoms'][:5]:
                    if isinstance(s, dict):
                        sens = s.get('sensitivity', '')
                        spec = s.get('specificity', '')
                        sens_spec = f" (Sens: {sens}%, Spec: {spec}%)" if sens and spec else ""
                        symptom_list.append(f"{s.get('name', '')}{sens_spec}")
                    else:
                        symptom_list.append(str(s))
                if symptom_list:
                    parts.append(f"Key Symptoms: {', '.join(symptom_list)}")
            
            if cp.get('typical_presentation'):
                parts.append(f"Typical Presentation: {cp['typical_presentation'][:200]}")
            
            # Lab findings
            if disease.get('laboratory_findings'):
                lab_list = []
                for lab in disease['laboratory_findings'][:4]:
                    if isinstance(lab, dict):
                        lab_list.append(f"{lab.get('test', '')}: {lab.get('expected_value', 'abnormal')}")
                    else:
                        lab_list.append(str(lab))
                if lab_list:
                    parts.append(f"Expected Labs: {', '.join(lab_list)}")
            
            # Treatment
            tx = disease.get('treatment', {})
            if tx.get('pharmacological', {}).get('first_line'):
                first_line = tx['pharmacological']['first_line']
                drug_list = []
                for drug in first_line[:3]:
                    if isinstance(drug, dict):
                        drug_list.append(f"{drug.get('drug', '')} ({drug.get('dose', '')})")
                    else:
                        drug_list.append(str(drug))
                if drug_list:
                    parts.append(f"First-Line Treatment: {', '.join(drug_list)}")
            
            # Guideline sources
            if disease.get('guideline_sources'):
                sources = disease['guideline_sources'][:3]
                source_strings = []
                for src in sources:
                    if isinstance(src, dict):
                        source_strings.append(src.get('name', str(src)))
                    else:
                        source_strings.append(str(src))
                if source_strings:
                    parts.append(f"Guidelines: {', '.join(source_strings)}")
            
            context_parts.append('\n'.join(parts))
        
        return '\n'.join(context_parts)

    def _format_drug_context(self, drugs: List[Dict]) -> str:
        """Format drug data for AI context."""
        if not drugs:
            return "No specific drugs found in database for these conditions."
        
        context_parts = ["\n=== PHICOR DRUG DATABASE (Evidence-Based Treatments) ===\n"]
        
        # Group by category
        by_category = {}
        for drug in drugs:
            cat = drug.get('category', 'other')
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(drug)
        
        for category, cat_drugs in by_category.items():
            context_parts.append(f"\n[{category.upper()}]")
            for drug in cat_drugs[:4]:
                name = drug.get('name', 'Unknown')
                mechanism = drug.get('mechanism', '')[:100] if drug.get('mechanism') else ''
                dose = drug.get('dose', '') or drug.get('typical_dose', '')
                indications = ', '.join(drug.get('indications', [])[:3]) if drug.get('indications') else ''
                
                drug_info = f"  • {name}"
                if dose:
                    drug_info += f" - {dose}"
                if mechanism:
                    drug_info += f" ({mechanism})"
                if indications:
                    drug_info += f" [For: {indications}]"
                
                context_parts.append(drug_info)
        
        return '\n'.join(context_parts)

    def _build_case_summary(
        self,
        clinical_text: str,
        lab_findings: List[Dict],
        imaging_findings: List[Dict],
        symptoms: List[Dict],
        patient_info: Optional[Dict]
    ) -> str:
        """Build structured case summary."""
        parts = ["=== CLINICAL CASE ===\n"]
        
        if patient_info:
            age = patient_info.get('age', 'Unknown')
            sex = patient_info.get('sex', 'Unknown')
            parts.append(f"Patient: {age} year old {sex}")
            if patient_info.get('pmh'):
                parts.append(f"PMH: {', '.join(patient_info['pmh'])}")
        
        if clinical_text.strip():
            parts.append(f"\nClinical Presentation:\n{clinical_text}")
        
        if symptoms:
            symptom_names = [s.get('name', s.get('parameterId', 'Unknown')) for s in symptoms if isinstance(s, dict)]
            if symptom_names:
                parts.append(f"\nSymptoms: {', '.join(symptom_names)}")
        
        if lab_findings:
            parts.append("\nLaboratory Findings:")
            for lab in lab_findings:
                if isinstance(lab, dict):
                    name = lab.get('name', lab.get('parameterId', 'Unknown'))
                    value = lab.get('value', 'N/A')
                    unit = lab.get('unit', '')
                    direction = lab.get('direction', '')
                    arrow = '↑' if direction == 'increase' else '↓' if direction == 'decrease' else ''
                    parts.append(f"  • {name}: {value} {unit} {arrow}")
        
        if imaging_findings:
            parts.append("\nImaging Findings:")
            for img in imaging_findings:
                if isinstance(img, dict):
                    name = img.get('name', img.get('parameterId', 'Unknown'))
                    parts.append(f"  • {name}")
        
        return '\n'.join(parts)

    async def _ai_synthesis_with_context(
        self,
        case_summary: str,
        disease_context: str,
        drug_context: str
    ) -> Dict[str, Any]:
        """Generate AI synthesis using our curated database context."""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"phicor_synthesis_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                system_message=self.system_prompt
            ).with_model(self.model_provider, self.model_name)
            
            prompt = f"""{case_summary}

{disease_context}

{drug_context}

Based on the clinical case above and the PhiCor curated medical knowledge base, provide your clinical synthesis.

IMPORTANT: Use the disease and drug information from our database when making recommendations.
Cross-reference the patient's findings with the database entries to ensure accuracy.

Return your analysis as JSON:
{{
    "clinical_synthesis": {{
        "summary": "2-3 sentence synthesis connecting all findings",
        "key_pattern": "The dominant clinical pattern identified",
        "pathophysiological_connection": "How findings connect pathophysiologically",
        "clinical_pearl": "Key insight that ties everything together"
    }},
    "primary_diagnosis": {{
        "name": "Most likely diagnosis (from database if available)",
        "icd10": "ICD-10 code",
        "probability": 85,
        "confidence": "high/moderate/low",
        "reasoning": "Detailed explanation connecting patient findings to database disease profile",
        "database_match": "Name of matching disease from PhiCor database",
        "key_supporting_findings": [
            {{"finding": "finding name", "significance": "why this supports diagnosis", "database_reference": "from which database entry"}}
        ],
        "guideline_source": "Which clinical guideline supports this (if in database)"
    }},
    "differential_diagnoses": [
        {{
            "name": "Alternative diagnosis",
            "icd10": "Code",
            "probability": 45,
            "reasoning": "Why considered, referencing database",
            "what_argues_against": ["findings that make this less likely"]
        }}
    ],
    "recommended_treatment": {{
        "immediate_actions": ["urgent interventions"],
        "pharmacological": [
            {{
                "drug": "Drug name from PhiCor database",
                "dose": "Recommended dose",
                "rationale": "Why this drug for this condition",
                "evidence_level": "A/B/C"
            }}
        ],
        "monitoring": ["parameters to monitor"],
        "guideline_source": "Treatment guideline reference"
    }},
    "clinical_reasoning_steps": [
        {{"step": 1, "thought": "reasoning step", "database_reference": "which database entry informed this"}}
    ],
    "urgency_assessment": {{
        "level": "emergent/urgent/routine",
        "time_sensitive_actions": ["immediate steps"],
        "can_miss_diagnosis": "Most dangerous alternative to rule out"
    }}
}}

Return ONLY valid JSON."""

            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Parse JSON
            try:
                json_match = re.search(r'\{[\s\S]*\}', response)
                if json_match:
                    synthesis = json.loads(json_match.group())
                    synthesis['generated_at'] = datetime.now(timezone.utc).isoformat()
                    synthesis['model'] = f"{self.model_provider}/{self.model_name}"
                    synthesis['integrated'] = True
                    return synthesis
            except json.JSONDecodeError:
                pass
            
            return self._fallback_synthesis()
            
        except Exception as e:
            print(f"AI synthesis error: {e}")
            return self._fallback_synthesis()

    def _local_synthesis(
        self,
        diseases: List[Dict],
        drugs: List[Dict],
        findings: Dict
    ) -> Dict[str, Any]:
        """Generate synthesis without AI, using database data directly."""
        primary = diseases[0] if diseases else {}
        
        return {
            "clinical_synthesis": {
                "summary": f"Based on PhiCor database, findings suggest {primary.get('name', 'further evaluation needed')}.",
                "key_pattern": primary.get('category', 'Undetermined'),
                "pathophysiological_connection": primary.get('description', '')[:200] if primary.get('description') else "See database for details.",
                "clinical_pearl": "Cross-reference with PhiCor disease database for comprehensive information."
            },
            "primary_diagnosis": {
                "name": primary.get('name', 'Requires further evaluation'),
                "icd10": primary.get('icd10_code', 'R69'),
                "probability": 60,
                "confidence": "moderate",
                "reasoning": f"Matched from PhiCor database based on clinical findings. {(primary.get('description', '') or '')[:200]}",
                "database_match": primary.get('name', ''),
                "key_supporting_findings": [],
                "guideline_source": self._format_guideline_sources(primary.get('guideline_sources', []))
            },
            "differential_diagnoses": [
                {
                    "name": d.get('name', ''),
                    "icd10": d.get('icd10_code', ''),
                    "probability": max(20, 60 - i*10),
                    "reasoning": f"Consider based on symptom overlap. {d.get('description', '')[:100]}",
                    "what_argues_against": []
                }
                for i, d in enumerate(diseases[1:4], 1)
            ],
            "recommended_treatment": {
                "immediate_actions": ["Clinical correlation recommended"],
                "pharmacological": [
                    {
                        "drug": dr.get('name', ''),
                        "dose": dr.get('dose', dr.get('typical_dose', 'See prescribing info')),
                        "rationale": f"From PhiCor drug database - {dr.get('mechanism', '')[:100]}",
                        "evidence_level": "B"
                    }
                    for dr in drugs[:3]
                ],
                "monitoring": ["Per clinical guidelines"],
                "guideline_source": "PhiCor curated database"
            },
            "clinical_reasoning_steps": [
                {"step": 1, "thought": "Analyzed clinical presentation", "database_reference": "PhiCor disease database"}
            ],
            "urgency_assessment": {
                "level": "routine",
                "time_sensitive_actions": ["Clinical correlation"],
                "can_miss_diagnosis": "Review differential diagnoses"
            },
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "model": "local/database-matching",
            "integrated": True
        }

    def _fallback_synthesis(self) -> Dict[str, Any]:
        """Fallback synthesis when AI fails."""
        return {
            "clinical_synthesis": {
                "summary": "Analysis requires additional clinical correlation.",
                "key_pattern": "Undetermined",
                "pathophysiological_connection": "Review PhiCor database",
                "clinical_pearl": "Use integrated database for comprehensive information."
            },
            "primary_diagnosis": {
                "name": "Further evaluation needed",
                "icd10": "R69",
                "probability": 50,
                "confidence": "low",
                "reasoning": "Insufficient data for confident diagnosis. Recommend clinical correlation.",
                "database_match": "",
                "key_supporting_findings": []
            },
            "differential_diagnoses": [],
            "recommended_treatment": {
                "immediate_actions": ["Clinical assessment"],
                "pharmacological": [],
                "monitoring": [],
                "guideline_source": ""
            },
            "urgency_assessment": {
                "level": "routine",
                "time_sensitive_actions": [],
                "can_miss_diagnosis": ""
            },
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "model": "fallback",
            "integrated": True
        }


# Factory function to create engine with database
def create_integrated_engine(db):
    """Create an integrated clinical engine with database connection."""
    return IntegratedClinicalEngine(db)
