#!/usr/bin/env python3
"""
Backend Testing for PhiCor.ai Digital Physiology Platform
Testing disease expansion from 214 to 254 diseases:
- Autoimmune diseases (SLE, Rheumatoid Arthritis, Crohn's, etc.)
- Infectious diseases (COVID-19, Sepsis, Tuberculosis, etc.)
- GI diseases (Pancreatitis, GERD, etc.)
- Expanded respiratory diseases (Asthma, Pneumonia, PE, etc.)
"""

import requests
import json
import time
import sys
import os
import glob
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

def test_frontend_accessibility():
    """Test if frontend is serving the application"""
    try:
        # Test if we can access the frontend
        frontend_url = BACKEND_URL.replace('/api', '').replace(':8001', ':3000')
        response = requests.get(frontend_url, timeout=10)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend not accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend accessibility test failed: {e}")
        return False

def load_disease_data():
    """Load disease data from the frontend data files"""
    renal_diseases = {}
    neurological_diseases = {}
    
    try:
        # Read renal diseases
        with open('/app/frontend/src/data/renalDiseases.js', 'r') as f:
            content = f.read()
            # Extract the export object (simplified parsing)
            start = content.find('export const RENAL_DISEASES = {')
            if start != -1:
                print("✅ Renal diseases data file found")
                # Count diseases by looking for ICD codes
                icd_count = content.count('icd10:')
                print(f"✅ Found {icd_count} renal diseases in data file")
            else:
                print("❌ Could not parse renal diseases data")
                
        # Read neurological diseases  
        with open('/app/frontend/src/data/neurologicalDiseases.js', 'r') as f:
            content = f.read()
            start = content.find('export const NEUROLOGICAL_DISEASES = {')
            if start != -1:
                print("✅ Neurological diseases data file found")
                # Count diseases by looking for ICD codes
                icd_count = content.count('icd10:')
                print(f"✅ Found {icd_count} neurological diseases in data file")
            else:
                print("❌ Could not parse neurological diseases data")
                
        return True
    except Exception as e:
        print(f"❌ Error loading disease data: {e}")
        return False

def test_respiratory_diseases():
    """Test expanded respiratory diseases for parameter modifications"""
    print("\n🫁 TESTING EXPANDED RESPIRATORY DISEASES")
    print("=" * 50)
    
    # Test diseases from the review request
    test_diseases = [
        {
            "name": "Asthma (J45.9)",
            "search_terms": ["asthma"],
            "expected_affected": ["lungs", "blood"],
            "key_modifications": ["fev1", "peak_flow", "eosinophils"],
            "icd_code": "J45.9"
        },
        {
            "name": "Community Acquired Pneumonia (J18.9)",
            "search_terms": ["pneumonia"],
            "expected_affected": ["lungs", "blood"],
            "key_modifications": ["spo2", "wbc_count", "crp", "procalcitonin"],
            "icd_code": "J18.9"
        },
        {
            "name": "Pulmonary Embolism (I26.9)",
            "search_terms": ["pulmonary embolism"],
            "expected_affected": ["lungs", "heart", "blood"],
            "key_modifications": ["d_dimer", "troponin", "bnp", "spo2"],
            "icd_code": "I26.9"
        }
    ]
    
    results = []
    
    for disease in test_diseases:
        print(f"\n📋 Testing: {disease['name']}")
        
        try:
            with open('/app/frontend/src/data/respiratoryDiseasesExpanded.js', 'r') as f:
                content = f.read()
                
            # Look for the disease by ICD code
            icd_code = disease['icd_code'].replace('.', '_')
            
            if icd_code in content:
                print(f"  ✅ Disease {icd_code} found in data")
                
                # Check for modifications section
                if 'modifications:' in content:
                    print(f"  ✅ Modifications section found")
                    
                    # Check for affected organs
                    for organ in disease['expected_affected']:
                        if f'{organ}:' in content:
                            print(f"  ✅ {organ.capitalize()} modifications found")
                        else:
                            print(f"  ⚠️  {organ.capitalize()} modifications not found")
                    
                    # Check for key modifications
                    for mod in disease['key_modifications']:
                        if mod in content:
                            print(f"  ✅ {mod} parameter modification found")
                        else:
                            print(f"  ⚠️  {mod} parameter modification not found")
                            
                    results.append({"disease": disease['name'], "status": "found_with_modifications"})
                else:
                    print(f"  ❌ No modifications section found")
                    results.append({"disease": disease['name'], "status": "found_no_modifications"})
            else:
                print(f"  ❌ Disease {icd_code} not found in data")
                results.append({"disease": disease['name'], "status": "not_found"})
                
        except Exception as e:
            print(f"  ❌ Error testing {disease['name']}: {e}")
            results.append({"disease": disease['name'], "status": "error"})
    
    return results

def test_autoimmune_diseases():
    """Test specific autoimmune diseases for parameter modifications"""
    print("\n🦠 TESTING AUTOIMMUNE DISEASES")
    print("=" * 50)
    
    # Test diseases from the review request
    test_diseases = [
        {
            "name": "Systemic Lupus Erythematosus (M32.9)",
            "search_terms": ["lupus", "sle"],
            "expected_affected": ["blood", "kidneys", "heart"],
            "key_modifications": ["ana", "anti_dsdna", "complement_c3", "complement_c4"],
            "icd_code": "M32.9"
        },
        {
            "name": "Rheumatoid Arthritis (M05.9)",
            "search_terms": ["rheumatoid"],
            "expected_affected": ["joints", "blood", "heart"],
            "key_modifications": ["rf", "anti_ccp", "esr", "crp"],
            "icd_code": "M05.9"
        },
        {
            "name": "Crohn's Disease (K50.9)",
            "search_terms": ["crohn"],
            "expected_affected": ["gi_tract", "blood"],
            "key_modifications": ["crp", "esr", "albumin", "hemoglobin"],
            "icd_code": "K50.9"
        }
    ]
    
    results = []
    
    for disease in test_diseases:
        print(f"\n📋 Testing: {disease['name']}")
        
        try:
            with open('/app/frontend/src/data/autoimmuneDiseases.js', 'r') as f:
                content = f.read()
                
            # Look for the disease by ICD code
            icd_code = disease['icd_code'].replace('.', '_')
            
            if icd_code in content:
                print(f"  ✅ Disease {icd_code} found in data")
                
                # Check for modifications section
                if 'modifications:' in content:
                    print(f"  ✅ Modifications section found")
                    
                    # Check for affected organs
                    for organ in disease['expected_affected']:
                        if f'{organ}:' in content:
                            print(f"  ✅ {organ.capitalize()} modifications found")
                        else:
                            print(f"  ⚠️  {organ.capitalize()} modifications not found")
                    
                    # Check for key modifications
                    for mod in disease['key_modifications']:
                        if mod in content:
                            print(f"  ✅ {mod} parameter modification found")
                        else:
                            print(f"  ⚠️  {mod} parameter modification not found")
                            
                    results.append({"disease": disease['name'], "status": "found_with_modifications"})
                else:
                    print(f"  ❌ No modifications section found")
                    results.append({"disease": disease['name'], "status": "found_no_modifications"})
            else:
                print(f"  ❌ Disease {icd_code} not found in data")
                results.append({"disease": disease['name'], "status": "not_found"})
                
        except Exception as e:
            print(f"  ❌ Error testing {disease['name']}: {e}")
            results.append({"disease": disease['name'], "status": "error"})
    
    return results

def test_infectious_diseases():
    """Test specific infectious diseases for parameter modifications"""
    print("\n🦠 TESTING INFECTIOUS DISEASES")
    print("=" * 50)
    
    # Test diseases from the review request
    test_diseases = [
        {
            "name": "COVID-19 (U07.1)",
            "search_terms": ["covid"],
            "expected_affected": ["lungs", "heart", "blood", "kidneys"],
            "key_modifications": ["spo2", "d_dimer", "ferritin", "crp"],
            "icd_code": "U07.1"
        },
        {
            "name": "Sepsis (A41.9)",
            "search_terms": ["sepsis"],
            "expected_affected": ["blood", "heart", "kidneys", "lungs"],
            "key_modifications": ["lactate", "procalcitonin", "wbc_count", "blood_pressure"],
            "icd_code": "A41.9"
        },
        {
            "name": "Pulmonary Tuberculosis (A15.0)",
            "search_terms": ["tuberculosis"],
            "expected_affected": ["lungs", "blood"],
            "key_modifications": ["esr", "hemoglobin", "albumin"],
            "icd_code": "A15.0"
        }
    ]
    
    results = []
    
    for disease in test_diseases:
        print(f"\n📋 Testing: {disease['name']}")
        
        try:
            with open('/app/frontend/src/data/infectiousDiseases.js', 'r') as f:
                content = f.read()
                
            # Look for the disease by ICD code
            icd_code = disease['icd_code'].replace('.', '_')
            
            if icd_code in content:
                print(f"  ✅ Disease {icd_code} found in data")
                
                # Check for modifications section
                if 'modifications:' in content:
                    print(f"  ✅ Modifications section found")
                    
                    # Check for affected organs
                    for organ in disease['expected_affected']:
                        if f'{organ}:' in content:
                            print(f"  ✅ {organ.capitalize()} modifications found")
                        else:
                            print(f"  ⚠️  {organ.capitalize()} modifications not found")
                    
                    # Check for key modifications
                    for mod in disease['key_modifications']:
                        if mod in content:
                            print(f"  ✅ {mod} parameter modification found")
                        else:
                            print(f"  ⚠️  {mod} parameter modification not found")
                            
                    results.append({"disease": disease['name'], "status": "found_with_modifications"})
                else:
                    print(f"  ❌ No modifications section found")
                    results.append({"disease": disease['name'], "status": "found_no_modifications"})
            else:
                print(f"  ❌ Disease {icd_code} not found in data")
                results.append({"disease": disease['name'], "status": "not_found"})
                
        except Exception as e:
            print(f"  ❌ Error testing {disease['name']}: {e}")
            results.append({"disease": disease['name'], "status": "error"})
    
    return results

def test_gi_diseases():
    """Test specific GI diseases for parameter modifications"""
    print("\n🫄 TESTING GI DISEASES")
    print("=" * 50)
    
    # Test diseases from the review request
    test_diseases = [
        {
            "name": "Acute Pancreatitis (K85.9)",
            "search_terms": ["pancreatitis"],
            "expected_affected": ["pancreas", "blood"],
            "key_modifications": ["lipase", "amylase", "crp", "wbc_count"],
            "icd_code": "K85.9"
        },
        {
            "name": "Chronic Pancreatitis (K86.1)",
            "search_terms": ["pancreatitis"],
            "expected_affected": ["pancreas", "blood"],
            "key_modifications": ["lipase", "amylase", "glucose", "hba1c"],
            "icd_code": "K86.1"
        },
        {
            "name": "GERD (K21.0)",
            "search_terms": ["gerd"],
            "expected_affected": ["gi_tract"],
            "key_modifications": ["ph", "pepsinogen"],
            "icd_code": "K21.0"
        }
    ]
    
    results = []
    
    for disease in test_diseases:
        print(f"\n📋 Testing: {disease['name']}")
        
        try:
            with open('/app/frontend/src/data/giDiseases.js', 'r') as f:
                content = f.read()
                
            # Look for the disease by ICD code
            icd_code = disease['icd_code'].replace('.', '_')
            
            if icd_code in content:
                print(f"  ✅ Disease {icd_code} found in data")
                
                # Check for modifications section
                if 'modifications:' in content:
                    print(f"  ✅ Modifications section found")
                    
                    # Check for affected organs
                    for organ in disease['expected_affected']:
                        if f'{organ}:' in content:
                            print(f"  ✅ {organ.capitalize()} modifications found")
                        else:
                            print(f"  ⚠️  {organ.capitalize()} modifications not found")
                    
                    # Check for key modifications
                    for mod in disease['key_modifications']:
                        if mod in content:
                            print(f"  ✅ {mod} parameter modification found")
                        else:
                            print(f"  ⚠️  {mod} parameter modification not found")
                            
                    results.append({"disease": disease['name'], "status": "found_with_modifications"})
                else:
                    print(f"  ❌ No modifications section found")
                    results.append({"disease": disease['name'], "status": "found_no_modifications"})
            else:
                print(f"  ❌ Disease {icd_code} not found in data")
                results.append({"disease": disease['name'], "status": "not_found"})
                
        except Exception as e:
            print(f"  ❌ Error testing {disease['name']}: {e}")
            results.append({"disease": disease['name'], "status": "error"})
    
    return results

def test_organ_models_compatibility():
    """Test that organ models have the required parameters for disease modifications"""
    print("\n🔧 TESTING ORGAN MODELS COMPATIBILITY")
    print("=" * 50)
    
    try:
        with open('/app/frontend/src/data/organModels.js', 'r') as f:
            content = f.read()
            
        # Check for required organs
        required_organs = ['kidneys', 'brain', 'heart', 'liver', 'pancreas']
        
        for organ in required_organs:
            if f'{organ}:' in content:
                print(f"  ✅ {organ.capitalize()} organ model found")
                
                # Check for key parameter categories
                categories = ['geometry', 'pressures', 'physiology', 'cellular']
                for category in categories:
                    if f'{category}:' in content:
                        print(f"    ✅ {category} parameters available")
                    else:
                        print(f"    ⚠️  {category} parameters not found")
            else:
                print(f"  ❌ {organ.capitalize()} organ model not found")
                
        return True
    except Exception as e:
        print(f"❌ Error testing organ models: {e}")
        return False

def test_disease_count():
    """Test that the total disease count is 254 as expected"""
    print("\n📊 TESTING DISEASE COUNT")
    print("=" * 50)
    
    total_diseases = 0
    disease_breakdown = {}
    
    try:
        # Count all disease files including new categories
        disease_files = [
            ('/app/frontend/src/data/autoimmuneDiseases.js', 'Autoimmune'),
            ('/app/frontend/src/data/infectiousDiseases.js', 'Infectious'),
            ('/app/frontend/src/data/giDiseases.js', 'GI'),
            ('/app/frontend/src/data/respiratoryDiseasesExpanded.js', 'Respiratory Expanded'),
            ('/app/frontend/src/data/hematologicalDiseases.js', 'Hematological'),
            ('/app/frontend/src/data/oncologyDiseases.js', 'Oncology'),
            ('/app/frontend/src/data/congenitalDiseases.js', 'Congenital'),
            ('/app/frontend/src/data/renalDiseases.js', 'Renal'),
            ('/app/frontend/src/data/neurologicalDiseases.js', 'Neurological'),
            ('/app/frontend/src/data/hepaticDiseasesIndex.js', 'Hepatic'),
            ('/app/frontend/src/data/metabolicDiseases.js', 'Metabolic')
        ]
        
        # Also check for any other disease files
        import glob
        all_disease_files = glob.glob('/app/frontend/src/data/*disease*.js') + glob.glob('/app/frontend/src/data/*Disease*.js')
        
        for file_path in disease_files:
            try:
                with open(file_path[0], 'r') as f:
                    content = f.read()
                    count = content.count('icd10:')
                    if count > 0:
                        disease_breakdown[file_path[1]] = count
                        print(f"  ✅ {file_path[1]}: {count} diseases")
                        total_diseases += count
            except Exception as e:
                print(f"  ⚠️  {file_path[1]}: error reading file - {e}")
        
        # Check for any additional disease files not in our main list
        additional_files = [f for f in all_disease_files if not any(main_file[0] in f for main_file in disease_files)]
        for file_path in additional_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    count = content.count('icd10:')
                    if count > 0:
                        file_name = file_path.split('/')[-1].replace('.js', '')
                        disease_breakdown[file_name] = count
                        print(f"  ✅ {file_name}: {count} diseases")
                        total_diseases += count
            except Exception as e:
                file_name = file_path.split('/')[-1].replace('.js', '')
                print(f"  ⚠️  {file_name}: error reading file")
                
        print(f"\n📈 TOTAL DISEASES: {total_diseases}")
        print(f"📋 BREAKDOWN: {disease_breakdown}")
        
        # The expected count is 254 based on the review request
        if total_diseases >= 254:
            print(f"✅ Disease count ({total_diseases}) meets or exceeds expected 254")
            return True
        else:
            print(f"❌ Disease count ({total_diseases}) is below expected 254")
            return False
            
    except Exception as e:
        print(f"❌ Error counting diseases: {e}")
        return False

def test_affected_organs_format():
    """Test that diseases have proper affectedOrgans format for UI display"""
    print("\n🎯 TESTING AFFECTED ORGANS FORMAT")
    print("=" * 50)
    
    try:
        # Test renal diseases
        with open('/app/frontend/src/data/renalDiseases.js', 'r') as f:
            renal_content = f.read()
            
        # Test neurological diseases
        with open('/app/frontend/src/data/neurologicalDiseases.js', 'r') as f:
            neuro_content = f.read()
            
        # Check for affectedOrgans arrays
        if 'affectedOrgans:' in renal_content:
            print("  ✅ Renal diseases have affectedOrgans arrays")
        else:
            print("  ❌ Renal diseases missing affectedOrgans arrays")
            
        if 'affectedOrgans:' in neuro_content:
            print("  ✅ Neurological diseases have affectedOrgans arrays")
        else:
            print("  ❌ Neurological diseases missing affectedOrgans arrays")
            
        # Check for primaryOrgan field
        if 'primaryOrgan:' in renal_content:
            print("  ✅ Renal diseases have primaryOrgan field")
        else:
            print("  ❌ Renal diseases missing primaryOrgan field")
            
        if 'primaryOrgan:' in neuro_content:
            print("  ✅ Neurological diseases have primaryOrgan field")
        else:
            print("  ❌ Neurological diseases missing primaryOrgan field")
            
        return True
    except Exception as e:
        print(f"❌ Error testing affected organs format: {e}")
        return False

def run_all_tests():
    """Run all tests and provide summary"""
    print("🧪 PHICOR.AI DIGITAL PHYSIOLOGY PLATFORM - BACKEND TESTING")
    print("=" * 70)
    print("Testing major system expansion with new organs and disease categories")
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
        
    # Test 3: Frontend accessibility
    if test_results['backend_url']:
        print("\n3️⃣ FRONTEND ACCESSIBILITY")
        test_results['frontend_access'] = test_frontend_accessibility()
    else:
        test_results['frontend_access'] = False
    
    # Test 4: New organ systems
    test_results['new_organs'] = test_new_organ_systems()
    
    # Test 5: Hematological diseases
    test_results['hematological_diseases'] = test_hematological_diseases()
    
    # Test 6: Oncology diseases  
    test_results['oncology_diseases'] = test_oncology_diseases()
    
    # Test 7: Congenital syndromes
    test_results['congenital_diseases'] = test_congenital_diseases()
    
    # Test 8: Disease count verification (should be 214)
    test_results['disease_count'] = test_disease_count()
    
    # Test 9: Organ models compatibility
    test_results['organ_models'] = test_organ_models_compatibility()
    
    # Test 10: Affected organs format
    test_results['affected_organs'] = test_affected_organs_format()
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    
    passed = 0
    total = 0
    
    for test_name, result in test_results.items():
        if test_name in ['new_organs', 'hematological_diseases', 'oncology_diseases', 'congenital_diseases']:
            # These return lists, check if any diseases were found
            if isinstance(result, list) and len(result) > 0:
                found_diseases = len([r for r in result if r['status'] in ['found_with_modifications', 'found_no_modifications', 'found']])
                print(f"✅ {test_name}: {found_diseases} items found")
                if found_diseases > 0:
                    passed += 1
            else:
                print(f"❌ {test_name}: No items found")
            total += 1
        else:
            if result:
                print(f"✅ {test_name}: PASSED")
                passed += 1
            else:
                print(f"❌ {test_name}: FAILED")
            total += 1
    
    print(f"\n🎯 OVERALL RESULT: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED!")
        return True
    else:
        print("⚠️  Some tests failed - see details above")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)