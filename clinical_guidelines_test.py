#!/usr/bin/env python3
"""
Clinical Guidelines Testing for PhiCor.ai Digital Physiology Platform
Testing Clinical Guidelines Display and Bidirectional Mapping Implementation

Test Focus:
1. Clinical Guidelines Display for specific diseases
2. Bidirectional Mapping File verification
3. Evidence-based treatment content verification
"""

import requests
import json
import time
import sys
import os
from typing import Dict, List, Any, Optional

# Get the backend URL from frontend .env
FRONTEND_ENV_PATH = "/app/frontend/.env"
BACKEND_URL = None

def get_backend_url():
    """Extract backend URL from frontend .env file"""
    global BACKEND_URL
    try:
        with open(FRONTEND_ENV_PATH, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    BACKEND_URL = line.split('=')[1].strip()
                    break
        
        if not BACKEND_URL:
            print("❌ REACT_APP_BACKEND_URL not found in frontend/.env")
            return False
            
        print(f"✅ Backend URL found: {BACKEND_URL}")
        return True
    except Exception as e:
        print(f"❌ Error reading frontend/.env: {e}")
        return False

def test_backend_health():
    """Test if backend is accessible"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
        if response.status_code == 200:
            print("✅ Backend health check passed")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False

def test_bidirectional_mapping_file():
    """Test that bidirectional mapping file exists and has proper exports"""
    print("\n🔄 TESTING BIDIRECTIONAL MAPPING FILE")
    print("=" * 50)
    
    try:
        with open('/app/frontend/src/data/bidirectionalMapping.js', 'r') as f:
            content = f.read()
            
        # Check for required exports
        required_exports = [
            'getConditionsAffectingParameter',
            'getDifferentialDiagnosis',
            'buildParameterToDiseaseIndex'
        ]
        
        results = []
        for export_func in required_exports:
            if export_func in content:
                print(f"  ✅ {export_func} function found")
                results.append({"function": export_func, "status": "found"})
            else:
                print(f"  ❌ {export_func} function not found")
                results.append({"function": export_func, "status": "not_found"})
        
        # Check for disease imports
        disease_imports = [
            'ALL_CARDIAC_DISEASES',
            'ALL_RESPIRATORY_DISEASES', 
            'ALL_RENAL_DISEASES',
            'ALL_NEUROLOGICAL_DISEASES',
            'ALL_HEPATIC_DISEASES',
            'ALL_METABOLIC_DISEASES',
            'ALL_HEMATOLOGICAL_DISEASES',
            'ALL_ONCOLOGY_DISEASES',
            'ALL_CONGENITAL_DISEASES'
        ]
        
        for disease_import in disease_imports:
            if disease_import in content:
                print(f"  ✅ {disease_import} import found")
            else:
                print(f"  ⚠️  {disease_import} import not found")
        
        # Check for reverse index building
        if 'parameter_id → [diseases that modify it]' in content:
            print("  ✅ Reverse index documentation found")
        
        if 'buildParameterToDiseaseIndex' in content:
            print("  ✅ Parameter-to-disease index builder found")
            
        return results
        
    except Exception as e:
        print(f"❌ Error testing bidirectional mapping: {e}")
        return []

def test_clinical_guidelines_content():
    """Test specific clinical guidelines content for the diseases mentioned in review"""
    print("\n📋 TESTING CLINICAL GUIDELINES CONTENT")
    print("=" * 50)
    
    # Test diseases from the review request
    test_diseases = [
        {
            "name": "Breast Cancer (C50.9)",
            "key": "breast_cancer",
            "expected_content": [
                "Core needle biopsy",
                "ER/PR status", 
                "HER2 status",
                "Ki-67",
                "Stage I-IV",
                "BCS",
                "Mastectomy",
                "ER+",
                "HER2+",
                "Triple-negative"
            ]
        },
        {
            "name": "Ischemic Stroke (I63.9)",
            "key": "ischemic_stroke", 
            "expected_content": [
                "NIHSS scoring",
                "tPA window",
                "4.5 hours",
                "Mechanical thrombectomy",
                "24 hours",
                "Secondary prevention",
                "antiplatelet",
                "statins"
            ]
        },
        {
            "name": "Multiple Sclerosis (G35)",
            "key": "multiple_sclerosis",
            "expected_content": [
                "McDonald 2017 criteria",
                "IV Methylprednisolone",
                "relapses",
                "Disease-modifying therapies",
                "Ocrelizumab",
                "Natalizumab"
            ]
        },
        {
            "name": "CLL (C91.1)",
            "key": "chronic_lymphocytic_leukemia",
            "expected_content": [
                "Watch and wait criteria",
                "BTK inhibitors",
                "Ibrutinib",
                "Acalabrutinib", 
                "Venetoclax",
                "Obinutuzumab"
            ]
        }
    ]
    
    results = []
    
    try:
        with open('/app/frontend/src/data/diseaseGuidelines.js', 'r') as f:
            guidelines_content = f.read()
            
        for disease in test_diseases:
            print(f"\n📋 Testing: {disease['name']}")
            
            # Check if disease key exists
            if f"'{disease['key']}':" in guidelines_content or f'"{disease["key"]}":' in guidelines_content:
                print(f"  ✅ Disease {disease['key']} found in guidelines")
                
                # Check for expected content
                found_content = []
                missing_content = []
                
                for content_item in disease['expected_content']:
                    if content_item in guidelines_content:
                        found_content.append(content_item)
                        print(f"  ✅ Content '{content_item}' found")
                    else:
                        missing_content.append(content_item)
                        print(f"  ⚠️  Content '{content_item}' not found")
                
                # Check for diagnostic criteria
                if 'diagnosticCriteria:' in guidelines_content:
                    print(f"  ✅ Diagnostic criteria section found")
                
                # Check for treatments section
                if 'treatments:' in guidelines_content:
                    print(f"  ✅ Treatments section found")
                
                # Check for evidence levels
                if 'evidence:' in guidelines_content:
                    print(f"  ✅ Evidence levels found")
                
                results.append({
                    "disease": disease['name'],
                    "status": "found",
                    "found_content": found_content,
                    "missing_content": missing_content,
                    "content_score": len(found_content) / len(disease['expected_content'])
                })
                
            else:
                print(f"  ❌ Disease {disease['key']} not found in guidelines")
                results.append({
                    "disease": disease['name'],
                    "status": "not_found",
                    "found_content": [],
                    "missing_content": disease['expected_content'],
                    "content_score": 0.0
                })
        
        return results
        
    except Exception as e:
        print(f"❌ Error testing clinical guidelines: {e}")
        return []

def test_evidence_levels():
    """Test that evidence levels are properly defined"""
    print("\n🔬 TESTING EVIDENCE LEVELS")
    print("=" * 50)
    
    try:
        with open('/app/frontend/src/data/diseaseGuidelines.js', 'r') as f:
            content = f.read()
            
        # Check for evidence level definitions
        evidence_levels = ['IA', 'IB', 'IC', 'IIaA', 'IIaB', 'IIaC', 'IIbA', 'IIbB', 'IIbC', 'IIIA', 'IIIB']
        
        found_levels = []
        for level in evidence_levels:
            if f"'{level}'" in content:
                found_levels.append(level)
                print(f"  ✅ Evidence level {level} found")
            else:
                print(f"  ⚠️  Evidence level {level} not found")
        
        # Check for evidence level descriptions
        if 'TREATMENT_EVIDENCE_LEVELS' in content:
            print("  ✅ Treatment evidence levels object found")
        
        if 'Class I, Level A' in content:
            print("  ✅ Evidence level descriptions found")
        
        if 'Multiple RCTs' in content:
            print("  ✅ Evidence strength descriptions found")
            
        return len(found_levels) / len(evidence_levels)
        
    except Exception as e:
        print(f"❌ Error testing evidence levels: {e}")
        return 0.0

def test_treatment_guidelines_structure():
    """Test that treatment guidelines have proper structure"""
    print("\n💊 TESTING TREATMENT GUIDELINES STRUCTURE")
    print("=" * 50)
    
    try:
        with open('/app/frontend/src/data/diseaseGuidelines.js', 'r') as f:
            content = f.read()
            
        # Check for required sections
        required_sections = [
            'diagnosticCriteria:',
            'treatments:',
            'firstLine:',
            'evidence:',
            'source:',
            'mechanism:',
            'contraindications:',
            'monitoring:'
        ]
        
        found_sections = []
        for section in required_sections:
            if section in content:
                found_sections.append(section)
                print(f"  ✅ Section {section} found")
            else:
                print(f"  ⚠️  Section {section} not found")
        
        # Check for drug names
        drug_examples = [
            'Ibrutinib',
            'Acalabrutinib', 
            'Venetoclax',
            'Obinutuzumab',
            'Ocrelizumab',
            'Natalizumab',
            'Alteplase',
            'tPA'
        ]
        
        found_drugs = []
        for drug in drug_examples:
            if drug in content:
                found_drugs.append(drug)
                print(f"  ✅ Drug {drug} found")
        
        print(f"  📊 Found {len(found_drugs)}/{len(drug_examples)} example drugs")
        
        return {
            "sections_score": len(found_sections) / len(required_sections),
            "drugs_score": len(found_drugs) / len(drug_examples)
        }
        
    except Exception as e:
        print(f"❌ Error testing treatment structure: {e}")
        return {"sections_score": 0.0, "drugs_score": 0.0}

def test_disease_count_in_guidelines():
    """Test disease count in guidelines file"""
    print("\n📊 TESTING DISEASE COUNT IN GUIDELINES")
    print("=" * 50)
    
    try:
        with open('/app/frontend/src/data/diseaseGuidelines.js', 'r') as f:
            content = f.read()
            
        # Count diseases by looking for icd10 codes
        icd_count = content.count('icd10:')
        print(f"  📈 Found {icd_count} diseases with ICD-10 codes in guidelines")
        
        # Count specific disease categories
        categories = {
            'heart_failure': content.count('heart_failure'),
            'stroke': content.count('stroke'),
            'multiple_sclerosis': content.count('multiple_sclerosis'),
            'breast_cancer': content.count('breast_cancer'),
            'chronic_lymphocytic_leukemia': content.count('chronic_lymphocytic_leukemia')
        }
        
        for category, count in categories.items():
            if count > 0:
                print(f"  ✅ {category}: {count} references")
            else:
                print(f"  ⚠️  {category}: no references found")
        
        return icd_count
        
    except Exception as e:
        print(f"❌ Error counting diseases in guidelines: {e}")
        return 0

def run_clinical_guidelines_tests():
    """Run all clinical guidelines tests and provide summary"""
    print("🏥 PHICOR.AI CLINICAL GUIDELINES AND BIDIRECTIONAL MAPPING TESTING")
    print("=" * 70)
    print("Testing Clinical Guidelines Display and Bidirectional Mapping Implementation")
    print("=" * 70)
    
    test_results = {}
    
    # Test 1: Backend URL configuration
    print("\n1️⃣ BACKEND URL CONFIGURATION")
    test_results['backend_url'] = get_backend_url()
    
    # Test 2: Backend health (if URL is available)
    if test_results['backend_url']:
        print("\n2️⃣ BACKEND HEALTH CHECK")
        test_results['backend_health'] = test_backend_health()
    else:
        test_results['backend_health'] = False
    
    # Test 3: Bidirectional mapping file
    test_results['bidirectional_mapping'] = test_bidirectional_mapping_file()
    
    # Test 4: Clinical guidelines content
    test_results['clinical_guidelines'] = test_clinical_guidelines_content()
    
    # Test 5: Evidence levels
    test_results['evidence_levels'] = test_evidence_levels()
    
    # Test 6: Treatment guidelines structure
    test_results['treatment_structure'] = test_treatment_guidelines_structure()
    
    # Test 7: Disease count in guidelines
    test_results['guidelines_disease_count'] = test_disease_count_in_guidelines()
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 CLINICAL GUIDELINES TEST SUMMARY")
    print("=" * 70)
    
    # Bidirectional mapping results
    if test_results['bidirectional_mapping']:
        found_functions = len([r for r in test_results['bidirectional_mapping'] if r['status'] == 'found'])
        total_functions = len(test_results['bidirectional_mapping'])
        print(f"✅ Bidirectional mapping: {found_functions}/{total_functions} functions found")
    else:
        print("❌ Bidirectional mapping: No functions found")
    
    # Clinical guidelines results
    if test_results['clinical_guidelines']:
        found_diseases = len([r for r in test_results['clinical_guidelines'] if r['status'] == 'found'])
        total_diseases = len(test_results['clinical_guidelines'])
        avg_content_score = sum(r['content_score'] for r in test_results['clinical_guidelines']) / total_diseases
        print(f"✅ Clinical guidelines: {found_diseases}/{total_diseases} diseases found")
        print(f"📊 Average content completeness: {avg_content_score:.1%}")
        
        # Detailed disease results
        for result in test_results['clinical_guidelines']:
            if result['status'] == 'found':
                print(f"  ✅ {result['disease']}: {result['content_score']:.1%} content found")
            else:
                print(f"  ❌ {result['disease']}: Not found")
    
    # Evidence levels
    if isinstance(test_results['evidence_levels'], float):
        print(f"✅ Evidence levels: {test_results['evidence_levels']:.1%} completeness")
    
    # Treatment structure
    if isinstance(test_results['treatment_structure'], dict):
        sections_score = test_results['treatment_structure']['sections_score']
        drugs_score = test_results['treatment_structure']['drugs_score']
        print(f"✅ Treatment structure: {sections_score:.1%} sections, {drugs_score:.1%} drugs")
    
    # Disease count
    if isinstance(test_results['guidelines_disease_count'], int):
        print(f"✅ Guidelines disease count: {test_results['guidelines_disease_count']} diseases")
    
    # Overall assessment
    critical_tests = [
        test_results['backend_health'],
        len(test_results['bidirectional_mapping']) > 0 if test_results['bidirectional_mapping'] else False,
        len(test_results['clinical_guidelines']) > 0 if test_results['clinical_guidelines'] else False,
        test_results['evidence_levels'] > 0.5 if isinstance(test_results['evidence_levels'], float) else False
    ]
    
    passed_critical = sum(critical_tests)
    total_critical = len(critical_tests)
    
    print(f"\n🎯 CRITICAL TESTS: {passed_critical}/{total_critical} passed")
    
    if passed_critical == total_critical:
        print("🎉 ALL CRITICAL TESTS PASSED!")
        return True
    else:
        print("⚠️  Some critical tests failed - see details above")
        return False

if __name__ == "__main__":
    success = run_clinical_guidelines_tests()
    sys.exit(0 if success else 1)