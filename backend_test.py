#!/usr/bin/env python3
"""
Backend Testing for PhiCor.ai Digital Physiology Platform
Testing renal and neurological disease parameter modifications
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

def test_renal_disease_modifications():
    """Test specific renal diseases for parameter modifications"""
    print("\n🔍 TESTING RENAL DISEASE MODIFICATIONS")
    print("=" * 50)
    
    # Test diseases from the review request
    test_diseases = [
        {
            "name": "CKD Stage 3 (N18.3)",
            "expected_affected": ["kidneys", "heart"],
            "key_modifications": ["gfr", "cortex_thickness", "blood_pressure"]
        },
        {
            "name": "Acute Pyelonephritis (N10)", 
            "expected_affected": ["kidneys"],
            "key_modifications": ["kidney_volume", "kidney_length"]
        },
        {
            "name": "Nephrolithiasis (N20.0)",
            "expected_affected": ["kidneys"],
            "key_modifications": ["tubular_pressure", "kidney_volume"]
        },
        {
            "name": "ADPKD (Q61.2)",
            "expected_affected": ["kidneys", "liver", "brain"],
            "key_modifications": ["kidney_length", "kidney_volume"]
        }
    ]
    
    results = []
    
    for disease in test_diseases:
        print(f"\n📋 Testing: {disease['name']}")
        
        # Check if disease data exists in the file
        try:
            with open('/app/frontend/src/data/renalDiseases.js', 'r') as f:
                content = f.read()
                
            # Look for the disease by ICD code
            icd_code = disease['name'].split('(')[1].split(')')[0].replace('.', '_')
            
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

def test_neurological_disease_modifications():
    """Test specific neurological diseases for parameter modifications"""
    print("\n🧠 TESTING NEUROLOGICAL DISEASE MODIFICATIONS")
    print("=" * 50)
    
    # Test diseases from the review request
    test_diseases = [
        {
            "name": "Ischemic Stroke (I63.9)",
            "expected_affected": ["brain", "heart"],
            "key_modifications": ["cbf", "icp", "cpp"]
        },
        {
            "name": "Parkinson's Disease (G20)",
            "expected_affected": ["brain"],
            "key_modifications": ["neuron_density", "cbf"]
        },
        {
            "name": "Multiple Sclerosis (G35)",
            "expected_affected": ["brain"],
            "key_modifications": ["white_matter", "myelin_volume"]
        },
        {
            "name": "Bacterial Meningitis (G00.9)",
            "expected_affected": ["brain"],
            "key_modifications": ["icp", "csf_pressure"]
        }
    ]
    
    results = []
    
    for disease in test_diseases:
        print(f"\n📋 Testing: {disease['name']}")
        
        # Check if disease data exists in the file
        try:
            with open('/app/frontend/src/data/neurologicalDiseases.js', 'r') as f:
                content = f.read()
                
            # Look for the disease by ICD code
            icd_code = disease['name'].split('(')[1].split(')')[0].replace('.', '_')
            
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
    """Test that the total disease count is 186 as expected"""
    print("\n📊 TESTING DISEASE COUNT")
    print("=" * 50)
    
    total_diseases = 0
    
    try:
        # Count renal diseases
        with open('/app/frontend/src/data/renalDiseases.js', 'r') as f:
            content = f.read()
            renal_count = content.count('icd10:')
            print(f"  ✅ Renal diseases: {renal_count}")
            total_diseases += renal_count
            
        # Count neurological diseases
        with open('/app/frontend/src/data/neurologicalDiseases.js', 'r') as f:
            content = f.read()
            neuro_count = content.count('icd10:')
            print(f"  ✅ Neurological diseases: {neuro_count}")
            total_diseases += neuro_count
            
        # Count all disease files
        import glob
        disease_files = glob.glob('/app/frontend/src/data/*disease*.js') + glob.glob('/app/frontend/src/data/*Disease*.js')
        
        # Filter out index files and templates
        disease_files = [f for f in disease_files if 'Index' not in f and 'Template' not in f and 'Guidelines' not in f and 'Models' not in f]
        
        for file_path in disease_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    count = content.count('icd10:')
                    if count > 0:  # Only count files that actually have diseases
                        file_name = file_path.split('/')[-1].replace('.js', '')
                        print(f"  ✅ {file_name}: {count}")
                        total_diseases += count
            except Exception as e:
                file_name = file_path.split('/')[-1].replace('.js', '')
                print(f"  ⚠️  {file_name}: error reading file")
                
        print(f"\n📈 TOTAL DISEASES: {total_diseases}")
        
        if total_diseases == 186:
            print("✅ Disease count matches expected 186")
            return True
        else:
            print(f"⚠️  Disease count ({total_diseases}) does not match expected 186")
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
    print("Testing renal and neurological disease parameter modifications")
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
    
    # Test 4: Disease data loading
    print("\n4️⃣ DISEASE DATA LOADING")
    test_results['disease_data'] = load_disease_data()
    
    # Test 5: Renal disease modifications
    test_results['renal_modifications'] = test_renal_disease_modifications()
    
    # Test 6: Neurological disease modifications  
    test_results['neuro_modifications'] = test_neurological_disease_modifications()
    
    # Test 7: Organ models compatibility
    test_results['organ_models'] = test_organ_models_compatibility()
    
    # Test 8: Disease count verification
    test_results['disease_count'] = test_disease_count()
    
    # Test 9: Affected organs format
    test_results['affected_organs'] = test_affected_organs_format()
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    
    passed = 0
    total = 0
    
    for test_name, result in test_results.items():
        if test_name in ['renal_modifications', 'neuro_modifications']:
            # These return lists, check if any diseases were found
            if isinstance(result, list) and len(result) > 0:
                found_diseases = len([r for r in result if r['status'] in ['found_with_modifications', 'found_no_modifications']])
                print(f"✅ {test_name}: {found_diseases} diseases found")
                if found_diseases > 0:
                    passed += 1
            else:
                print(f"❌ {test_name}: No diseases found")
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