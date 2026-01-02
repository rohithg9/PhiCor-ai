#!/usr/bin/env python3
"""
Comprehensive Disease and Drug Data Enhancement Script
Adds AI-generated parameter_modifications to ALL diseases and effect_profiles to ALL drugs
"""

import asyncio
import os
import json
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import time

# Configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Import LLM
try:
    from emergentintegrations.llm.chat import LlmChat
    HAS_LLM = True
except ImportError:
    HAS_LLM = False
    print("Warning: LLM not available")

# Standard organ systems for parameter_modifications
ORGAN_SYSTEMS = [
    'heart', 'lungs', 'kidneys', 'liver', 'brain', 'blood', 
    'pancreas', 'thyroid', 'skin', 'gi_tract', 'bone_marrow',
    'spleen', 'immune_system', 'joints', 'muscles', 'cellular'
]

# Standard parameter categories per organ
PARAM_CATEGORIES = {
    'heart': ['vital_signs', 'physical_exam', 'lab_tests', 'ecg', 'imaging', 'hemodynamics'],
    'lungs': ['vital_signs', 'physical_exam', 'lab_tests', 'imaging', 'pulmonary_function'],
    'kidneys': ['vital_signs', 'lab_tests', 'urinalysis', 'imaging'],
    'liver': ['vital_signs', 'physical_exam', 'lab_tests', 'imaging'],
    'brain': ['vital_signs', 'physical_exam', 'lab_tests', 'imaging', 'neurological'],
    'blood': ['lab_tests', 'cbc', 'coagulation', 'chemistry'],
    'pancreas': ['lab_tests', 'imaging', 'function_tests'],
    'thyroid': ['lab_tests', 'imaging', 'physical_exam'],
    'skin': ['physical_exam', 'structure', 'physiology'],
    'gi_tract': ['physical_exam', 'lab_tests', 'imaging', 'endoscopy'],
    'bone_marrow': ['lab_tests', 'biopsy'],
    'spleen': ['physical_exam', 'imaging', 'lab_tests'],
    'immune_system': ['lab_tests', 'immunology'],
    'joints': ['physical_exam', 'imaging', 'lab_tests'],
    'muscles': ['physical_exam', 'lab_tests', 'imaging'],
    'cellular': ['dna', 'genetics', 'molecular', 'biomarkers']
}


async def generate_disease_params_ai(disease_name, icd10, category, current_params=None):
    """Generate comprehensive parameter modifications using AI"""
    if not HAS_LLM or not EMERGENT_LLM_KEY:
        return None
    
    current_param_count = 0
    if current_params:
        for organ, scales in current_params.items():
            if isinstance(scales, dict):
                for scale, params in scales.items():
                    if isinstance(params, dict):
                        current_param_count += len(params)
    
    # Skip if already has 50+ parameters
    if current_param_count >= 50:
        return None
    
    prompt = f"""Generate comprehensive clinical parameter modifications for this disease:

Disease: {disease_name}
ICD-10: {icd10 or 'Unknown'}
Category: {category}

Create a JSON object with parameter_modifications for ALL relevant organ systems.
For each affected organ, include multiple parameter categories with specific clinical parameters.

Structure:
{{
  "heart": {{
    "vital_signs": {{
      "systolic_bp": {{"change_percent": 15, "direction": "increase", "evidence": "Hypertensive response", "value": 145, "unit": "mmHg", "normal_min": 90, "normal_max": 120}},
      "heart_rate": {{"change_percent": 20, "direction": "increase", "evidence": "Tachycardia", "value": 96, "unit": "bpm"}}
    }},
    "lab_tests": {{
      "troponin_i": {{"change_percent": 100, "direction": "increase", "evidence": "Myocardial injury", "value": 0.08, "unit": "ng/mL", "normal_max": 0.04}},
      "bnp": {{"change_percent": 300, "direction": "increase", "evidence": "Cardiac strain", "value": 400, "unit": "pg/mL"}}
    }},
    "ecg": {{
      "qtc_interval": {{"change_percent": 10, "direction": "increase", "evidence": "Repolarization delay", "value": 480, "unit": "ms"}}
    }},
    "imaging": {{
      "lvef": {{"change_percent": 30, "direction": "decrease", "evidence": "Systolic dysfunction", "value": 40, "unit": "%"}}
    }}
  }},
  "blood": {{
    "lab_tests": {{
      "hemoglobin": {{"change_percent": 15, "direction": "decrease", "evidence": "Anemia", "value": 10.5, "unit": "g/dL"}},
      "wbc": {{"change_percent": 50, "direction": "increase", "evidence": "Inflammation", "value": 15000, "unit": "/uL"}}
    }}
  }},
  "cellular": {{
    "dna": {{
      "inflammatory_markers": {{"change_percent": 200, "direction": "increase", "evidence": "Systemic inflammation"}},
      "genetic_risk": {{"value": "present", "direction": "present", "evidence": "Genetic predisposition"}}
    }}
  }}
}}

IMPORTANT:
- Include at least 5-8 affected organ systems
- Include 3-5 parameters per organ category
- Use medically accurate values and ranges
- Include change_percent, direction (increase/decrease/present), evidence, value, and unit where applicable
- Return ONLY valid JSON, no markdown or explanations

Generate comprehensive parameters for {disease_name}:"""

    try:
        llm = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            system_message="You are a medical expert. Return only valid JSON with comprehensive clinical parameter modifications. No markdown, no explanations."
        )
        response = await llm.send_message_async(prompt, model="gpt-4o-mini")
        
        content = response.strip()
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]
        content = content.strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"  AI generation failed for {disease_name}: {str(e)[:50]}")
        return None


async def generate_drug_effects_ai(drug_name, drug_class, mechanism):
    """Generate comprehensive effect profile for a drug using AI"""
    if not HAS_LLM or not EMERGENT_LLM_KEY:
        return None
    
    prompt = f"""Generate comprehensive pharmacological effect profile for this drug:

Drug: {drug_name}
Class: {drug_class or 'Unknown'}
Mechanism: {mechanism or 'Unknown'}

Create a JSON object with effect_profile covering all relevant organ systems.

Structure:
{{
  "heart": {{
    "cardiovascular": {{
      "heart_rate": {{"change_percent": -15, "direction": "decrease", "mechanism": "Beta-blockade", "onset": "30min", "duration": "6-8h"}},
      "blood_pressure": {{"change_percent": -20, "direction": "decrease", "mechanism": "Vasodilation"}},
      "cardiac_output": {{"change_percent": -10, "direction": "decrease"}}
    }}
  }},
  "kidneys": {{
    "renal": {{
      "gfr": {{"change_percent": 5, "direction": "variable", "mechanism": "Renal blood flow changes"}},
      "potassium": {{"change_percent": 10, "direction": "increase", "mechanism": "Reduced excretion"}}
    }}
  }},
  "liver": {{
    "hepatic": {{
      "metabolism": {{"change_percent": -20, "direction": "decrease", "mechanism": "CYP450 inhibition"}}
    }}
  }},
  "pharmacokinetics": {{
    "absorption": "Rapid oral absorption",
    "bioavailability": "40-60%",
    "half_life": "6-8 hours",
    "protein_binding": "30%",
    "metabolism": "Hepatic CYP2D6",
    "excretion": "Renal 40%, Fecal 60%"
  }},
  "adverse_effects": {{
    "common": ["Dizziness", "Fatigue", "Bradycardia"],
    "serious": ["Heart block", "Bronchospasm"],
    "rare": ["Hepatotoxicity"]
  }},
  "interactions": {{
    "major": ["Verapamil", "Diltiazem"],
    "moderate": ["NSAIDs", "Digoxin"],
    "minor": ["Antacids"]
  }}
}}

Return ONLY valid JSON with comprehensive drug effects for {drug_name}:"""

    try:
        response = await chat(
            api_key=EMERGENT_LLM_KEY,
            model=LlmModel.GPT4O_MINI,
            user_message=prompt,
            system_prompt="You are a pharmacology expert. Return only valid JSON with comprehensive drug effect profiles. No markdown."
        )
        
        content = response.strip()
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]
        content = content.strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"  AI generation failed for {drug_name}: {str(e)[:50]}")
        return None


async def enhance_all_diseases(batch_size=20, max_diseases=None, min_params=50):
    """Enhance all diseases with comprehensive AI-generated parameters"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=" * 60)
    print("DISEASE PARAMETER ENHANCEMENT")
    print("=" * 60)
    
    # Find diseases that need enhancement (less than min_params parameters)
    all_diseases = await db.diseases.find({}, {'_id': 0, 'id': 1, 'name': 1, 'icd10_code': 1, 'icd10': 1, 'category': 1, 'parameter_modifications': 1}).to_list(None)
    
    diseases_to_enhance = []
    for d in all_diseases:
        params = d.get('parameter_modifications', {})
        param_count = 0
        for organ, scales in params.items():
            if isinstance(scales, dict):
                for scale, ps in scales.items():
                    if isinstance(ps, dict):
                        param_count += len(ps)
        
        if param_count < min_params:
            diseases_to_enhance.append({
                **d,
                'current_param_count': param_count
            })
    
    print(f"Total diseases: {len(all_diseases)}")
    print(f"Diseases needing enhancement (<{min_params} params): {len(diseases_to_enhance)}")
    
    if max_diseases:
        diseases_to_enhance = diseases_to_enhance[:max_diseases]
        print(f"Processing first {max_diseases} diseases")
    
    enhanced = 0
    failed = 0
    skipped = 0
    
    for i in range(0, len(diseases_to_enhance), batch_size):
        batch = diseases_to_enhance[i:i+batch_size]
        print(f"\nBatch {i//batch_size + 1}/{(len(diseases_to_enhance) + batch_size - 1)//batch_size}")
        
        for disease in batch:
            disease_name = disease.get('name', 'Unknown')
            icd10 = disease.get('icd10_code') or disease.get('icd10', '')
            category = disease.get('category', 'general')
            current_params = disease.get('parameter_modifications', {})
            
            print(f"  Processing: {disease_name} (current: {disease.get('current_param_count', 0)} params)")
            
            # Generate AI parameters
            new_params = await generate_disease_params_ai(disease_name, icd10, category, current_params)
            
            if new_params:
                # Merge with existing params (new AI params take precedence)
                merged = {**current_params}
                for organ, scales in new_params.items():
                    if organ not in merged:
                        merged[organ] = scales
                    else:
                        for scale, params in scales.items():
                            if scale not in merged[organ]:
                                merged[organ][scale] = params
                            else:
                                merged[organ][scale].update(params)
                
                # Update database
                await db.diseases.update_one(
                    {'id': disease.get('id')},
                    {'$set': {
                        'parameter_modifications': merged,
                        'ai_enhanced': True,
                        'enhanced_at': datetime.now(timezone.utc).isoformat()
                    }}
                )
                enhanced += 1
                print(f"    ✓ Enhanced with AI parameters")
            else:
                skipped += 1
                print(f"    - Skipped (AI unavailable or already sufficient)")
            
            # Rate limiting
            await asyncio.sleep(0.3)
        
        print(f"  Batch complete: {enhanced} enhanced, {skipped} skipped, {failed} failed")
    
    print(f"\n{'=' * 60}")
    print(f"DISEASE ENHANCEMENT COMPLETE")
    print(f"Enhanced: {enhanced}")
    print(f"Skipped: {skipped}")
    print(f"Failed: {failed}")
    print(f"{'=' * 60}")
    
    client.close()
    return enhanced, skipped, failed


async def enhance_all_drugs(batch_size=10, max_drugs=None):
    """Enhance all drugs with comprehensive AI-generated effect profiles"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("\n" + "=" * 60)
    print("DRUG EFFECT PROFILE ENHANCEMENT")
    print("=" * 60)
    
    # Find drugs without effect_profile
    drugs_to_enhance = await db.drugs.find(
        {'$or': [{'effect_profile': {'$exists': False}}, {'effect_profile': None}, {'effect_profile': {}}]},
        {'_id': 0}
    ).to_list(None)
    
    total_drugs = await db.drugs.count_documents({})
    print(f"Total drugs: {total_drugs}")
    print(f"Drugs needing effect_profile: {len(drugs_to_enhance)}")
    
    if max_drugs:
        drugs_to_enhance = drugs_to_enhance[:max_drugs]
        print(f"Processing first {max_drugs} drugs")
    
    enhanced = 0
    failed = 0
    
    for i in range(0, len(drugs_to_enhance), batch_size):
        batch = drugs_to_enhance[i:i+batch_size]
        print(f"\nBatch {i//batch_size + 1}/{(len(drugs_to_enhance) + batch_size - 1)//batch_size}")
        
        for drug in batch:
            drug_name = drug.get('name', 'Unknown')
            drug_class = drug.get('class') or drug.get('drug_class', '')
            mechanism = drug.get('mechanism') or drug.get('mechanism_of_action', '')
            
            print(f"  Processing: {drug_name}")
            
            # Generate AI effect profile
            effect_profile = await generate_drug_effects_ai(drug_name, drug_class, mechanism)
            
            if effect_profile:
                # Update database
                await db.drugs.update_one(
                    {'name': drug_name},
                    {'$set': {
                        'effect_profile': effect_profile,
                        'ai_enhanced': True,
                        'enhanced_at': datetime.now(timezone.utc).isoformat()
                    }}
                )
                enhanced += 1
                print(f"    ✓ Enhanced with effect profile")
            else:
                failed += 1
                print(f"    ✗ Failed to generate effect profile")
            
            # Rate limiting
            await asyncio.sleep(0.3)
    
    print(f"\n{'=' * 60}")
    print(f"DRUG ENHANCEMENT COMPLETE")
    print(f"Enhanced: {enhanced}")
    print(f"Failed: {failed}")
    print(f"{'=' * 60}")
    
    client.close()
    return enhanced, failed


async def main():
    """Main function to run all enhancements"""
    print("\n" + "=" * 60)
    print("PHICORE.AI COMPREHENSIVE DATA ENHANCEMENT")
    print("=" * 60)
    print(f"Start time: {datetime.now().isoformat()}")
    print(f"LLM Available: {HAS_LLM}")
    print(f"API Key Present: {bool(EMERGENT_LLM_KEY)}")
    
    # Enhance diseases (process in batches, can be resumed)
    disease_enhanced, disease_skipped, disease_failed = await enhance_all_diseases(
        batch_size=10,
        max_diseases=100,  # Start with 100, can increase
        min_params=50
    )
    
    # Enhance drugs
    drug_enhanced, drug_failed = await enhance_all_drugs(
        batch_size=10,
        max_drugs=50  # Start with 50
    )
    
    print("\n" + "=" * 60)
    print("FINAL SUMMARY")
    print("=" * 60)
    print(f"Diseases enhanced: {disease_enhanced}")
    print(f"Diseases skipped: {disease_skipped}")
    print(f"Diseases failed: {disease_failed}")
    print(f"Drugs enhanced: {drug_enhanced}")
    print(f"Drugs failed: {drug_failed}")
    print(f"End time: {datetime.now().isoformat()}")


if __name__ == "__main__":
    asyncio.run(main())
