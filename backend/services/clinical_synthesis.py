"""
Clinical Synthesis Service
AI-powered clinical reasoning that mimics physician thinking
Connects clinical context + parameters + medical knowledge for accurate diagnosis
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


class ClinicalSynthesisEngine:
    """
    Performs holistic clinical reasoning by:
    1. Analyzing the ENTIRE clinical picture together
    2. Connecting patterns across multiple findings
    3. Applying medical knowledge to generate accurate differential
    4. Explaining the reasoning like an experienced physician would
    """
    
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        self.model_provider = "openai"
        self.model_name = "gpt-4o"
        
        self.system_prompt = """You are an expert physician performing clinical reasoning and differential diagnosis. 
You think like an experienced diagnostician - looking at the COMPLETE clinical picture, not just individual findings.

Your approach:
1. SYNTHESIZE all findings together (don't analyze each separately)
2. RECOGNIZE PATTERNS that point to specific diagnoses
3. CALCULATE probability based on how findings FIT together
4. EXPLAIN your reasoning as if teaching a medical student
5. IDENTIFY the "clinical pearl" - the key insight connecting everything

Be specific about:
- Why certain findings TOGETHER point to a diagnosis
- Pathophysiological connections between findings
- What would INCREASE or DECREASE your suspicion
- Key distinguishing features from other diagnoses

Use proper medical terminology. Be evidence-based. Cite sensitivity/specificity when relevant."""

    async def synthesize_clinical_case(
        self,
        clinical_text: str,
        lab_findings: List[Dict],
        imaging_findings: List[Dict],
        symptoms: List[Dict],
        patient_info: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Perform comprehensive clinical synthesis.
        
        Args:
            clinical_text: Free text clinical notes
            lab_findings: List of lab abnormalities with values
            imaging_findings: List of imaging findings
            symptoms: List of symptoms
            patient_info: Optional demographics/history
            
        Returns:
            Comprehensive clinical synthesis with differential
        """
        if not EMERGENT_AVAILABLE or not self.api_key:
            return self._generate_local_synthesis(clinical_text, lab_findings, imaging_findings, symptoms)
        
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"clinical_synthesis_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                system_message=self.system_prompt
            ).with_model(self.model_provider, self.model_name)
            
            # Build comprehensive case summary
            case_summary = self._build_case_summary(
                clinical_text, lab_findings, imaging_findings, symptoms, patient_info
            )
            
            prompt = f"""Analyze this clinical case and provide a comprehensive differential diagnosis:

{case_summary}

Provide your analysis as JSON with this structure:
{{
    "clinical_synthesis": {{
        "summary": "2-3 sentence synthesis of the entire clinical picture",
        "key_pattern": "The dominant clinical pattern you identified",
        "pathophysiological_connection": "How the findings connect pathophysiologically",
        "clinical_pearl": "The key insight that ties everything together"
    }},
    "primary_diagnosis": {{
        "name": "Most likely diagnosis",
        "icd10": "ICD-10 code",
        "probability": 85,
        "confidence": "high/moderate/low",
        "reasoning": "Detailed explanation of why this is most likely, connecting ALL findings",
        "key_supporting_findings": [
            {{"finding": "finding name", "significance": "why this supports the diagnosis", "weight": "high/moderate/low"}}
        ],
        "expected_additional_findings": ["What else we'd expect to see"],
        "red_flags_present": ["Concerning findings"],
        "next_steps": ["Recommended tests/actions"]
    }},
    "differential_diagnoses": [
        {{
            "name": "Alternative diagnosis",
            "icd10": "Code",
            "probability": 45,
            "reasoning": "Why this is considered",
            "what_would_increase_suspicion": ["findings that would make this more likely"],
            "what_argues_against": ["findings that make this less likely"]
        }}
    ],
    "clinical_reasoning_steps": [
        {{
            "step": 1,
            "thought": "Initial impression from chief complaint/presentation",
            "findings_considered": ["list of findings"],
            "hypothesis": "What I'm thinking at this point"
        }}
    ],
    "mathematical_analysis": {{
        "pre_test_probability": "Estimated prevalence in this population",
        "likelihood_ratios": [
            {{"finding": "finding name", "LR_positive": 5.2, "LR_negative": 0.3, "post_test_probability_impact": "+15%"}}
        ],
        "combined_probability_estimate": "How all findings together affect probability"
    }},
    "urgency_assessment": {{
        "level": "emergent/urgent/routine",
        "time_sensitive_actions": ["What needs to be done immediately"],
        "can_miss_diagnosis": "Most dangerous diagnosis to consider"
    }}
}}

Think step-by-step like an experienced physician. Connect the dots. Return ONLY valid JSON."""

            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Parse JSON response
            try:
                json_match = re.search(r'\{[\s\S]*\}', response)
                if json_match:
                    synthesis = json.loads(json_match.group())
                    synthesis['generated_at'] = datetime.now(timezone.utc).isoformat()
                    synthesis['model'] = f"{self.model_provider}/{self.model_name}"
                    synthesis['input_summary'] = {
                        'lab_count': len(lab_findings),
                        'imaging_count': len(imaging_findings),
                        'symptom_count': len(symptoms),
                        'has_clinical_text': bool(clinical_text.strip())
                    }
                    return synthesis
            except json.JSONDecodeError:
                pass
                
            # Fallback to local synthesis
            return self._generate_local_synthesis(clinical_text, lab_findings, imaging_findings, symptoms)
            
        except Exception as e:
            print(f"Error in clinical synthesis: {e}")
            return self._generate_local_synthesis(clinical_text, lab_findings, imaging_findings, symptoms)
    
    def _build_case_summary(
        self,
        clinical_text: str,
        lab_findings: List[Dict],
        imaging_findings: List[Dict],
        symptoms: List[Dict],
        patient_info: Optional[Dict]
    ) -> str:
        """Build a structured case summary for the AI."""
        parts = []
        
        if patient_info:
            age = patient_info.get('age', 'Unknown')
            sex = patient_info.get('sex', 'Unknown')
            parts.append(f"PATIENT: {age} year old {sex}")
            if patient_info.get('pmh'):
                parts.append(f"PMH: {', '.join(patient_info['pmh'])}")
        
        if clinical_text.strip():
            parts.append(f"\nCLINICAL PRESENTATION:\n{clinical_text}")
        
        if symptoms:
            symptom_list = []
            for s in symptoms:
                if isinstance(s, dict):
                    name = s.get('name', s.get('parameterId', 'Unknown'))
                    symptom_list.append(name)
                else:
                    symptom_list.append(str(s))
            parts.append(f"\nSYMPTOMS: {', '.join(symptom_list)}")
        
        if lab_findings:
            parts.append("\nLABORATORY FINDINGS:")
            for lab in lab_findings:
                if isinstance(lab, dict):
                    name = lab.get('name', lab.get('parameterId', 'Unknown'))
                    value = lab.get('value', 'N/A')
                    unit = lab.get('unit', '')
                    direction = lab.get('direction', '')
                    normal = lab.get('normalRange', '')
                    arrow = '↑' if direction == 'increase' else '↓' if direction == 'decrease' else ''
                    parts.append(f"  • {name}: {value} {unit} {arrow} (Normal: {normal})")
        
        if imaging_findings:
            parts.append("\nIMAGING FINDINGS:")
            for img in imaging_findings:
                if isinstance(img, dict):
                    name = img.get('name', img.get('parameterId', 'Unknown'))
                    parts.append(f"  • {name}")
        
        return '\n'.join(parts)
    
    def _generate_local_synthesis(
        self,
        clinical_text: str,
        lab_findings: List[Dict],
        imaging_findings: List[Dict],
        symptoms: List[Dict]
    ) -> Dict[str, Any]:
        """Generate a local synthesis without AI (fallback)."""
        
        # Combine all findings
        all_findings = []
        patterns = []
        
        # Analyze patterns
        cardiac_findings = []
        respiratory_findings = []
        renal_findings = []
        infectious_findings = []
        
        # Categorize findings
        cardiac_keywords = ['heart', 'cardiac', 'cardiomegaly', 'ef', 'ejection', 'bnp', 'troponin', 'edema', 'jvp']
        respiratory_keywords = ['lung', 'pulmonary', 'dyspnea', 'cough', 'pneumonia', 'consolidation', 'effusion']
        renal_keywords = ['kidney', 'renal', 'creatinine', 'gfr', 'urine', 'proteinuria']
        infectious_keywords = ['fever', 'wbc', 'infection', 'sepsis', 'procalcitonin']
        
        text_lower = (clinical_text or '').lower()
        
        for keyword in cardiac_keywords:
            if keyword in text_lower:
                cardiac_findings.append(keyword)
        for keyword in respiratory_keywords:
            if keyword in text_lower:
                respiratory_findings.append(keyword)
        for keyword in renal_keywords:
            if keyword in text_lower:
                renal_findings.append(keyword)
        for keyword in infectious_keywords:
            if keyword in text_lower:
                infectious_findings.append(keyword)
        
        # Add labs/imaging to categories
        for finding in (lab_findings or []) + (imaging_findings or []):
            name = finding.get('name', finding.get('parameterId', '')).lower()
            for keyword in cardiac_keywords:
                if keyword in name:
                    cardiac_findings.append(name)
            for keyword in respiratory_keywords:
                if keyword in name:
                    respiratory_findings.append(name)
            for keyword in renal_keywords:
                if keyword in name:
                    renal_findings.append(name)
            for keyword in infectious_keywords:
                if keyword in name:
                    infectious_findings.append(name)
        
        # Determine dominant pattern
        pattern_scores = {
            'cardiac': len(cardiac_findings),
            'respiratory': len(respiratory_findings),
            'renal': len(renal_findings),
            'infectious': len(infectious_findings)
        }
        dominant_pattern = max(pattern_scores, key=pattern_scores.get)
        
        # Generate synthesis based on pattern
        synthesis = {
            "clinical_synthesis": {
                "summary": f"Clinical picture suggests a {dominant_pattern} process with {sum(pattern_scores.values())} supporting findings.",
                "key_pattern": f"Predominantly {dominant_pattern} presentation",
                "pathophysiological_connection": "Multiple findings point to a unified underlying process.",
                "clinical_pearl": "Consider the combination of findings rather than each in isolation."
            },
            "primary_diagnosis": {
                "name": "Further analysis needed",
                "icd10": "R69",
                "probability": 50,
                "confidence": "low",
                "reasoning": f"Based on pattern analysis: {dominant_pattern} findings predominate. Review with clinical context.",
                "key_supporting_findings": [
                    {"finding": f, "significance": "Supports pattern", "weight": "moderate"}
                    for f in (cardiac_findings + respiratory_findings + renal_findings + infectious_findings)[:5]
                ],
                "expected_additional_findings": ["Additional workup recommended"],
                "red_flags_present": [],
                "next_steps": ["Complete clinical correlation", "Additional testing as indicated"]
            },
            "differential_diagnoses": [],
            "clinical_reasoning_steps": [
                {
                    "step": 1,
                    "thought": "Initial assessment of provided findings",
                    "findings_considered": list(set(cardiac_findings + respiratory_findings + renal_findings + infectious_findings))[:10],
                    "hypothesis": f"Likely {dominant_pattern} etiology"
                }
            ],
            "mathematical_analysis": {
                "pre_test_probability": "Unable to calculate without AI",
                "likelihood_ratios": [],
                "combined_probability_estimate": "Requires AI-powered analysis for accurate calculation"
            },
            "urgency_assessment": {
                "level": "routine",
                "time_sensitive_actions": ["Clinical correlation recommended"],
                "can_miss_diagnosis": "Use AI-powered synthesis for comprehensive analysis"
            },
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "model": "local/pattern-matching",
            "input_summary": {
                'lab_count': len(lab_findings or []),
                'imaging_count': len(imaging_findings or []),
                'symptom_count': len(symptoms or []),
                'has_clinical_text': bool((clinical_text or '').strip())
            },
            "note": "For comprehensive AI-powered clinical synthesis, ensure Emergent LLM Key is configured."
        }
        
        return synthesis


# Singleton instance
_synthesis_engine = None

def get_synthesis_engine() -> ClinicalSynthesisEngine:
    """Get or create the synthesis engine singleton."""
    global _synthesis_engine
    if _synthesis_engine is None:
        _synthesis_engine = ClinicalSynthesisEngine()
    return _synthesis_engine
