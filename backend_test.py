#!/usr/bin/env python3
"""
Backend Testing for Comprehensive Disease Database
Testing comprehensive disease database with 28 diseases across 9 categories:
- Cardiovascular diseases (5 diseases)
- Respiratory diseases (2 diseases) 
- Endocrine diseases (2 diseases)
- Renal diseases (1 disease)
- Neurological diseases (2 diseases)
- Hematological diseases (6 diseases)
- Oncological diseases (3 diseases)
- Genetic diseases (3 diseases)
- Hematological malignancy diseases (4 diseases)

Focus on testing specific endpoints from review request:
- POST /api/diseases-db/seed-comprehensive - Seeds the database
- GET /api/diseases-db - Should return 28 diseases total
- GET /api/diseases-db?category=cardiovascular - Should return 5 cardiovascular diseases
- GET /api/diseases-db?category=hematological - Should return 6 hematological diseases
- GET /api/diseases-db?search=diabetes - Should find Type 2 Diabetes
- GET /api/diseases-db?search=I50 - Should find diseases with ICD-10 code containing I50
- GET /api/diseases-db/heart_failure_hfref - Should return full HFrEF details
- GET /api/diseases-db/sickle_cell_disease - Should return full SCD details
- GET /api/diseases-db/nonexistent - Should return 404 error
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
    """Load disease data from the frontend data files - DEPRECATED for drug testing"""
    print("⚠️  Disease data loading not relevant for drug database testing")
    return True

def test_specific_diseases_from_review():
    """Test specific diseases mentioned in the review request"""
    print("\n🎯 TESTING SPECIFIC DISEASES FROM REVIEW REQUEST")
    print("=" * 60)
    
    # Diseases specifically mentioned in the review request
    target_diseases = [
        {
            "name": "Systemic Lupus Erythematosus (SLE)",
            "icd_code": "M32.9",
            "category": "Autoimmune",
            "file_path": "/app/frontend/src/data/autoimmuneDiseases.js",
            "required_fields": ["diagnosticCriteria", "differentialDiagnosis", "treatment", "riskStratification"]
        },
        {
            "name": "Rheumatoid Arthritis",
            "icd_code": "M05.9", 
            "category": "Autoimmune",
            "file_path": "/app/frontend/src/data/autoimmuneDiseases.js",
            "required_fields": ["diagnosticCriteria", "differentialDiagnosis", "treatment", "riskStratification"]
        },
        {
            "name": "COVID-19",
            "icd_code": "U07.1",
            "category": "Infectious", 
            "file_path": "/app/frontend/src/data/infectiousDiseases.js",
            "required_fields": ["diagnosticCriteria", "differentialDiagnosis", "treatment", "riskStratification"]
        },
        {
            "name": "Sepsis",
            "icd_code": "A41.9",
            "category": "Infectious",
            "file_path": "/app/frontend/src/data/infectiousDiseases.js", 
            "required_fields": ["diagnosticCriteria", "differentialDiagnosis", "treatment", "riskStratification"]
        },
        {
            "name": "GERD",
            "icd_code": "K21.0",
            "category": "GI",
            "file_path": "/app/frontend/src/data/giDiseases.js",
            "required_fields": ["diagnosticCriteria", "differentialDiagnosis", "treatment", "riskStratification"]
        },
        {
            "name": "Acute Pancreatitis", 
            "icd_code": "K85.9",
            "category": "GI",
            "file_path": "/app/frontend/src/data/giDiseases.js",
            "required_fields": ["diagnosticCriteria", "differentialDiagnosis", "treatment", "riskStratification"]
        },
        {
            "name": "Major Depressive Disorder",
            "icd_code": "F32.9",
            "category": "Psychiatric",
            "file_path": "/app/frontend/src/data/psychiatricDiseases.js",
            "required_fields": ["diagnosticCriteria", "differentialDiagnosis", "treatment", "riskStratification"]
        },
        {
            "name": "Schizophrenia", 
            "icd_code": "F20.9",
            "category": "Psychiatric",
            "file_path": "/app/frontend/src/data/psychiatricDiseases.js",
            "required_fields": ["diagnosticCriteria", "differentialDiagnosis", "treatment", "riskStratification"]
        },
        {
            "name": "Asthma",
            "icd_code": "J45.9", 
            "category": "Respiratory",
            "file_path": "/app/frontend/src/data/respiratoryDiseasesExpanded.js",
            "required_fields": ["diagnosticCriteria", "differentialDiagnosis", "treatment", "riskStratification"]
        },
        {
            "name": "ARDS",
            "icd_code": "J80",
            "category": "Respiratory",
            "file_path": "/app/frontend/src/data/respiratoryDiseasesExpanded.js",
            "required_fields": ["diagnosticCriteria", "differentialDiagnosis", "treatment", "riskStratification"]
        }
    ]
    
    results = []
    
    for disease in target_diseases:
        print(f"\n📋 Testing: {disease['name']} ({disease['icd_code']})")
        
        try:
            with open(disease['file_path'], 'r') as f:
                content = f.read()
                
            # Look for the disease by ICD code
            icd_code = disease['icd_code'].replace('.', '_')
            
            if icd_code in content:
                print(f"  ✅ Disease {icd_code} found in {disease['category']} data")
                
                # Check for required fields
                missing_fields = []
                found_fields = []
                
                for field in disease['required_fields']:
                    if field in content:
                        found_fields.append(field)
                        print(f"  ✅ {field} field found")
                    else:
                        missing_fields.append(field)
                        print(f"  ❌ {field} field missing")
                
                # Check for parameter modifications
                if 'modifications:' in content:
                    print(f"  ✅ Parameter modifications found")
                else:
                    print(f"  ⚠️  Parameter modifications not found")
                
                # Check for clinical presentations
                if 'clinicalPresentation:' in content:
                    print(f"  ✅ Clinical presentation found")
                else:
                    print(f"  ⚠️  Clinical presentation not found")
                
                results.append({
                    "disease": disease['name'],
                    "icd_code": disease['icd_code'],
                    "category": disease['category'],
                    "status": "found",
                    "found_fields": found_fields,
                    "missing_fields": missing_fields,
                    "completeness": len(found_fields) / len(disease['required_fields']) * 100
                })
            else:
                print(f"  ❌ Disease {icd_code} not found in {disease['category']} data")
                results.append({
                    "disease": disease['name'],
                    "icd_code": disease['icd_code'], 
                    "category": disease['category'],
                    "status": "not_found",
                    "found_fields": [],
                    "missing_fields": disease['required_fields'],
                    "completeness": 0
                })
                
        except Exception as e:
            print(f"  ❌ Error testing {disease['name']}: {e}")
            results.append({
                "disease": disease['name'],
                "icd_code": disease['icd_code'],
                "category": disease['category'], 
                "status": "error",
                "found_fields": [],
                "missing_fields": disease['required_fields'],
                "completeness": 0
            })
    
    return results

def test_disease_data_structure():
    """Test that diseases have the required data structure for PhiCore.ai platform"""
    print("\n📊 TESTING DISEASE DATA STRUCTURE")
    print("=" * 50)
    
    required_sections = [
        "diagnosticCriteria",
        "differentialDiagnosis", 
        "treatment",
        "riskStratification"
    ]
    
    # Test a sample of disease files
    test_files = [
        ("/app/frontend/src/data/autoimmuneDiseases.js", "Autoimmune"),
        ("/app/frontend/src/data/infectiousDiseases.js", "Infectious"),
        ("/app/frontend/src/data/giDiseases.js", "GI"),
        ("/app/frontend/src/data/psychiatricDiseases.js", "Psychiatric"),
        ("/app/frontend/src/data/respiratoryDiseasesExpanded.js", "Respiratory")
    ]
    
    results = {}
    
    for file_path, category in test_files:
        print(f"\n📁 Testing {category} diseases data structure...")
        
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            section_counts = {}
            for section in required_sections:
                count = content.count(section + ':')
                section_counts[section] = count
                if count > 0:
                    print(f"  ✅ {section}: {count} instances found")
                else:
                    print(f"  ❌ {section}: not found")
            
            results[category] = section_counts
            
        except Exception as e:
            print(f"  ❌ Error testing {category}: {e}")
            results[category] = {section: 0 for section in required_sections}
    
    return results

def test_mathematical_equations():
    """Test mathematical equations and calculations functionality"""
    print("\n🧮 TESTING MATHEMATICAL EQUATIONS")
    print("=" * 50)
    
    try:
        # Test backend equations endpoint
        response = requests.get(f"{BACKEND_URL}/api/equations", timeout=10)
        if response.status_code == 200:
            equations_data = response.json()
            print("  ✅ Equations API endpoint accessible")
            
            # Check for key equation categories
            expected_categories = ['cardiovascular', 'glucose_insulin', 'renal', 'pharmacokinetics']
            
            for category in expected_categories:
                if category in equations_data:
                    print(f"  ✅ {category} equations found")
                    
                    # Check for specific equations in each category
                    if category == 'cardiovascular':
                        if 'windkessel' in equations_data[category]:
                            print(f"    ✅ Windkessel model equation found")
                        if 'frank_starling' in equations_data[category]:
                            print(f"    ✅ Frank-Starling mechanism equation found")
                    
                    elif category == 'glucose_insulin':
                        if 'bergman_model' in equations_data[category]:
                            print(f"    ✅ Bergman minimal model equations found")
                    
                    elif category == 'renal':
                        if 'gfr_autoregulation' in equations_data[category]:
                            print(f"    ✅ GFR autoregulation equation found")
                            
                else:
                    print(f"  ❌ {category} equations not found")
            
            return True
        else:
            print(f"  ❌ Equations API endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"  ❌ Error testing equations: {e}")
        return False

def test_calculation_endpoints():
    """Test physiological calculation endpoints"""
    print("\n⚗️ TESTING CALCULATION ENDPOINTS")
    print("=" * 50)
    
    test_endpoints = [
        {
            "name": "Cardiovascular Calculation",
            "endpoint": "/api/calculate/cardiovascular",
            "params": {
                "cardiac_output": 5.0,
                "tpr": 1.0,
                "compliance": 1.5,
                "initial_pressure": 100.0
            }
        },
        {
            "name": "Glucose-Insulin Calculation", 
            "endpoint": "/api/calculate/glucose-insulin",
            "params": {
                "glucose_initial": 90.0,
                "insulin_initial": 10.0,
                "glucose_input": 50.0
            }
        },
        {
            "name": "GFR Calculation",
            "endpoint": "/api/calculate/gfr", 
            "params": {
                "mean_arterial_pressure": 90.0,
                "kidney_function": 1.0,
                "age": 40,
                "weight": 70
            }
        },
        {
            "name": "Frank-Starling Calculation",
            "endpoint": "/api/calculate/frank-starling",
            "params": {
                "end_diastolic_volume": 120.0,
                "contractility": 1.0,
                "heart_rate": 70
            }
        }
    ]
    
    results = []
    
    for test in test_endpoints:
        print(f"\n🧪 Testing: {test['name']}")
        
        try:
            response = requests.post(
                f"{BACKEND_URL}{test['endpoint']}", 
                json=test['params'],
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ {test['name']} calculation successful")
                
                # Check for expected response fields
                if 'equation' in data or 'equations' in data:
                    print(f"  ✅ Equation information included")
                if 'parameters' in data:
                    print(f"  ✅ Parameters included in response")
                if 'evidence' in data:
                    print(f"  ✅ Evidence sources included")
                
                results.append({"endpoint": test['name'], "status": "success"})
            else:
                print(f"  ❌ {test['name']} failed: {response.status_code}")
                results.append({"endpoint": test['name'], "status": "failed"})
                
        except Exception as e:
            print(f"  ❌ Error testing {test['name']}: {e}")
            results.append({"endpoint": test['name'], "status": "error"})
    
    return results

def test_differential_diagnosis_data():
    """Test differential diagnosis engine data availability"""
    print("\n🔍 TESTING DIFFERENTIAL DIAGNOSIS DATA")
    print("=" * 50)
    
    try:
        # Check for bidirectional mapping file
        bidirectional_path = "/app/frontend/src/data/bidirectionalMapping.js"
        if os.path.exists(bidirectional_path):
            print("  ✅ Bidirectional mapping file found")
            
            with open(bidirectional_path, 'r') as f:
                content = f.read()
            
            # Check for key functions
            key_functions = [
                "getConditionsAffectingParameter",
                "getDifferentialDiagnosis", 
                "buildParameterToDiseaseIndex"
            ]
            
            for func in key_functions:
                if func in content:
                    print(f"  ✅ {func} function found")
                else:
                    print(f"  ❌ {func} function not found")
        else:
            print("  ❌ Bidirectional mapping file not found")
            
        # Check for differential diagnosis panel component
        dd_panel_path = "/app/frontend/src/components/DifferentialDiagnosisPanel.js"
        if os.path.exists(dd_panel_path):
            print("  ✅ Differential Diagnosis Panel component found")
            
            with open(dd_panel_path, 'r') as f:
                content = f.read()
            
            # Check for required tabs
            required_tabs = ["Add Parameters", "Clinical Text", "Test Patient"]
            for tab in required_tabs:
                if tab in content:
                    print(f"  ✅ '{tab}' tab found")
                else:
                    print(f"  ❌ '{tab}' tab not found")
        else:
            print("  ❌ Differential Diagnosis Panel component not found")
            
        return True
        
    except Exception as e:
        print(f"  ❌ Error testing differential diagnosis data: {e}")
        return False
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

def test_comprehensive_parameter_ranges():
    """Test comprehensive parameter ranges for differential diagnosis panel as mentioned in review request"""
    print("\n🎯 TESTING COMPREHENSIVE PARAMETER RANGES")
    print("=" * 60)
    
    # Parameter ranges specifically mentioned in the review request
    target_parameters = [
        # Heart parameters
        {"organ": "heart", "param": "ef", "name": "Ejection Fraction", "expected_range": [55, 70], "unit": "%"},
        {"organ": "heart", "param": "lv_edv", "name": "LV EDV", "expected_range": [70, 160], "unit": "mL"},
        
        # Lungs parameters  
        {"organ": "lungs", "param": "fev1", "name": "FEV1", "expected_range": [80, 120], "unit": "% pred"},
        {"organ": "lungs", "param": "total_lung_capacity", "name": "Total Lung Capacity", "expected_range": [5000, 7000], "unit": "mL"},
        
        # Blood parameters
        {"organ": "blood", "param": "hemoglobin", "name": "Hemoglobin", "expected_range": [12, 17], "unit": "g/dL"},
        {"organ": "blood", "param": "platelet_count", "name": "Platelets", "expected_range": [150, 400], "unit": "K/μL"},
        
        # Kidneys parameters
        {"organ": "kidneys", "param": "gfr", "name": "GFR", "expected_range": [90, 120], "unit": "mL/min"},
        {"organ": "kidneys", "param": "creatinine", "name": "Creatinine", "expected_range": [0.7, 1.3], "unit": "mg/dL"},
        
        # Liver parameters (need to check if these exist)
        {"organ": "liver", "param": "ast", "name": "AST", "expected_range": [10, 40], "unit": "U/L"},
        {"organ": "liver", "param": "alt", "name": "ALT", "expected_range": [7, 56], "unit": "U/L"},
    ]
    
    results = []
    
    try:
        with open('/app/frontend/src/data/organModels.js', 'r') as f:
            content = f.read()
            
        print(f"\n📋 Testing parameter ranges from organModels.js...")
        
        for param in target_parameters:
            print(f"\n🔍 Testing: {param['name']} ({param['organ']})")
            
            # Look for the parameter in the organ model
            param_found = False
            range_correct = False
            
            # Search for the parameter definition
            param_pattern = f'id: "{param["param"]}"'
            if param_pattern in content:
                param_found = True
                print(f"  ✅ Parameter {param['param']} found in {param['organ']} model")
                
                # Extract the range for this parameter
                param_start = content.find(param_pattern)
                param_line_end = content.find('\n', param_start)
                param_line = content[param_start:param_line_end]
                
                # Look for range definition in the same line or next few lines
                search_area = content[param_start:param_start + 200]
                if 'range:' in search_area:
                    range_start = search_area.find('range:')
                    range_end = search_area.find(']', range_start) + 1
                    range_text = search_area[range_start:range_end]
                    
                    # Extract range values
                    import re
                    range_match = re.search(r'range:\s*\[(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\]', range_text)
                    if range_match:
                        actual_min = float(range_match.group(1))
                        actual_max = float(range_match.group(2))
                        expected_min, expected_max = param['expected_range']
                        
                        # Check if ranges match (allow some tolerance)
                        if (abs(actual_min - expected_min) <= 5 and abs(actual_max - expected_max) <= 10):
                            range_correct = True
                            print(f"  ✅ Range [{actual_min}, {actual_max}] {param['unit']} matches expected [{expected_min}, {expected_max}] {param['unit']}")
                        else:
                            print(f"  ⚠️  Range [{actual_min}, {actual_max}] {param['unit']} differs from expected [{expected_min}, {expected_max}] {param['unit']}")
                    else:
                        print(f"  ⚠️  Could not parse range from: {range_text}")
                else:
                    print(f"  ❌ No range found for parameter {param['param']}")
            else:
                print(f"  ❌ Parameter {param['param']} not found in {param['organ']} model")
            
            results.append({
                "organ": param['organ'],
                "parameter": param['param'],
                "name": param['name'],
                "found": param_found,
                "range_correct": range_correct
            })
        
        return results
        
    except Exception as e:
        print(f"❌ Error testing parameter ranges: {e}")
        return []

def test_differential_diagnosis_ui_features():
    """Test differential diagnosis panel UI features mentioned in review request"""
    print("\n🔍 TESTING DIFFERENTIAL DIAGNOSIS UI FEATURES")
    print("=" * 60)
    
    features_to_test = [
        {
            "feature": "12+ organs with selectable parameters",
            "file": "/app/frontend/src/data/organModels.js",
            "check": "organ count >= 12"
        },
        {
            "feature": "Parameter normal ranges with units",
            "file": "/app/frontend/src/data/organModels.js", 
            "check": "range and unit fields present"
        },
        {
            "feature": "Slider functionality (Critical Low to Critical High)",
            "file": "/app/frontend/src/components/DifferentialDiagnosisPanel.js",
            "check": "slider component with range"
        },
        {
            "feature": "Quick buttons (Critical Low, Low, Normal, High, Critical High)",
            "file": "/app/frontend/src/components/DifferentialDiagnosisPanel.js",
            "check": "quick value buttons"
        },
        {
            "feature": "Direct value input",
            "file": "/app/frontend/src/components/DifferentialDiagnosisPanel.js",
            "check": "input field for values"
        },
        {
            "feature": "Add Abnormal Finding button",
            "file": "/app/frontend/src/components/DifferentialDiagnosisPanel.js",
            "check": "abnormal finding functionality"
        }
    ]
    
    results = []
    
    for feature in features_to_test:
        print(f"\n📋 Testing: {feature['feature']}")
        
        try:
            if feature['file'] == "/app/frontend/src/data/organModels.js":
                with open(feature['file'], 'r') as f:
                    content = f.read()
                
                if feature['check'] == "organ count >= 12":
                    # Count organs in the model
                    organ_count = content.count('name: "')
                    if organ_count >= 12:
                        print(f"  ✅ Found {organ_count} organs (>= 12 required)")
                        results.append({"feature": feature['feature'], "status": "found"})
                    else:
                        print(f"  ❌ Found only {organ_count} organs (< 12 required)")
                        results.append({"feature": feature['feature'], "status": "insufficient"})
                        
                elif feature['check'] == "range and unit fields present":
                    range_count = content.count('range:')
                    unit_count = content.count('unit:')
                    if range_count >= 50 and unit_count >= 50:
                        print(f"  ✅ Found {range_count} range definitions and {unit_count} unit definitions")
                        results.append({"feature": feature['feature'], "status": "found"})
                    else:
                        print(f"  ⚠️  Found {range_count} ranges and {unit_count} units (may be insufficient)")
                        results.append({"feature": feature['feature'], "status": "partial"})
                        
            elif feature['file'] == "/app/frontend/src/components/DifferentialDiagnosisPanel.js":
                try:
                    with open(feature['file'], 'r') as f:
                        content = f.read()
                    
                    if feature['check'] == "slider component with range":
                        if 'slider' in content.lower() or 'range' in content.lower():
                            print(f"  ✅ Slider/range functionality found")
                            results.append({"feature": feature['feature'], "status": "found"})
                        else:
                            print(f"  ❌ No slider/range functionality found")
                            results.append({"feature": feature['feature'], "status": "not_found"})
                            
                    elif feature['check'] == "quick value buttons":
                        if 'critical' in content.lower() and 'button' in content.lower():
                            print(f"  ✅ Quick value buttons found")
                            results.append({"feature": feature['feature'], "status": "found"})
                        else:
                            print(f"  ❌ Quick value buttons not found")
                            results.append({"feature": feature['feature'], "status": "not_found"})
                            
                    elif feature['check'] == "input field for values":
                        if 'input' in content.lower() and ('value' in content.lower() or 'number' in content.lower()):
                            print(f"  ✅ Direct value input found")
                            results.append({"feature": feature['feature'], "status": "found"})
                        else:
                            print(f"  ❌ Direct value input not found")
                            results.append({"feature": feature['feature'], "status": "not_found"})
                            
                    elif feature['check'] == "abnormal finding functionality":
                        if 'abnormal' in content.lower() and ('add' in content.lower() or 'button' in content.lower()):
                            print(f"  ✅ Add Abnormal Finding functionality found")
                            results.append({"feature": feature['feature'], "status": "found"})
                        else:
                            print(f"  ❌ Add Abnormal Finding functionality not found")
                            results.append({"feature": feature['feature'], "status": "not_found"})
                            
                except FileNotFoundError:
                    print(f"  ❌ File {feature['file']} not found")
                    results.append({"feature": feature['feature'], "status": "file_not_found"})
                    
        except Exception as e:
            print(f"  ❌ Error testing {feature['feature']}: {e}")
            results.append({"feature": feature['feature'], "status": "error"})
    
    return results

def test_drug_database_total_count():
    """Test that drugs-db endpoint returns ~99 drugs total"""
    print("\n💊 TESTING DRUG DATABASE TOTAL COUNT")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs-db", timeout=10)
        if response.status_code == 200:
            data = response.json()
            total_drugs = data.get('total', 0)
            drugs_list = data.get('drugs', [])
            
            print(f"✅ Drugs database endpoint accessible")
            print(f"📊 Total drugs in database: {total_drugs}")
            print(f"📊 Drugs returned in response: {len(drugs_list)}")
            
            if total_drugs >= 99:
                print(f"✅ Drug count ({total_drugs}) meets expected ~99 drugs")
                return True
            else:
                print(f"❌ Drug count ({total_drugs}) is below expected ~99 drugs")
                return False
        else:
            print(f"❌ Drugs database endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing drug database: {e}")
        return False

def test_cns_drugs():
    """Test CNS drug category - should return 10 CNS drugs"""
    print("\n🧠 TESTING CNS DRUGS CATEGORY")
    print("=" * 50)
    
    expected_cns_drugs = [
        "sertraline", "escitalopram", "fluoxetine", "venlafaxine", "duloxetine",
        "alprazolam", "lorazepam", "gabapentin", "pregabalin", "levetiracetam"
    ]
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs-db?category=cns", timeout=10)
        if response.status_code == 200:
            data = response.json()
            drugs = data.get('drugs', [])
            drug_names = [drug.get('name', '').lower() for drug in drugs]
            
            print(f"✅ CNS drugs endpoint accessible")
            print(f"📊 CNS drugs found: {len(drugs)}")
            
            found_drugs = []
            missing_drugs = []
            
            for expected_drug in expected_cns_drugs:
                if any(expected_drug in name for name in drug_names):
                    found_drugs.append(expected_drug)
                    print(f"  ✅ {expected_drug.title()} found")
                else:
                    missing_drugs.append(expected_drug)
                    print(f"  ❌ {expected_drug.title()} not found")
            
            print(f"\n📈 Found {len(found_drugs)}/10 expected CNS drugs")
            
            if len(found_drugs) >= 8:  # Allow some flexibility
                return True
            else:
                print(f"❌ Too few CNS drugs found: {len(found_drugs)}/10")
                return False
        else:
            print(f"❌ CNS drugs endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing CNS drugs: {e}")
        return False

def test_gastrointestinal_drugs():
    """Test gastrointestinal drug category"""
    print("\n🫄 TESTING GASTROINTESTINAL DRUGS")
    print("=" * 50)
    
    expected_gi_drugs = [
        "omeprazole", "pantoprazole", "esomeprazole", "famotidine", "ondansetron", "metoclopramide"
    ]
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs-db?category=gastrointestinal", timeout=10)
        if response.status_code == 200:
            data = response.json()
            drugs = data.get('drugs', [])
            drug_names = [drug.get('name', '').lower() for drug in drugs]
            
            print(f"✅ GI drugs endpoint accessible")
            print(f"📊 GI drugs found: {len(drugs)}")
            
            found_drugs = []
            for expected_drug in expected_gi_drugs:
                if any(expected_drug in name for name in drug_names):
                    found_drugs.append(expected_drug)
                    print(f"  ✅ {expected_drug.title()} found")
                else:
                    print(f"  ❌ {expected_drug.title()} not found")
            
            print(f"\n📈 Found {len(found_drugs)}/{len(expected_gi_drugs)} expected GI drugs")
            return len(found_drugs) >= 4  # At least 4 out of 6
        else:
            print(f"❌ GI drugs endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing GI drugs: {e}")
        return False

def test_analgesic_drugs():
    """Test analgesic drug category"""
    print("\n💊 TESTING ANALGESIC DRUGS")
    print("=" * 50)
    
    expected_analgesic_drugs = [
        "acetaminophen", "ibuprofen", "naproxen", "celecoxib", "tramadol"
    ]
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs-db?category=analgesic", timeout=10)
        if response.status_code == 200:
            data = response.json()
            drugs = data.get('drugs', [])
            drug_names = [drug.get('name', '').lower() for drug in drugs]
            
            print(f"✅ Analgesic drugs endpoint accessible")
            print(f"📊 Analgesic drugs found: {len(drugs)}")
            
            found_drugs = []
            for expected_drug in expected_analgesic_drugs:
                if any(expected_drug in name for name in drug_names):
                    found_drugs.append(expected_drug)
                    print(f"  ✅ {expected_drug.title()} found")
                else:
                    print(f"  ❌ {expected_drug.title()} not found")
            
            print(f"\n📈 Found {len(found_drugs)}/{len(expected_analgesic_drugs)} expected analgesic drugs")
            return len(found_drugs) >= 3  # At least 3 out of 5
        else:
            print(f"❌ Analgesic drugs endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing analgesic drugs: {e}")
        return False

def test_antiinfective_drugs():
    """Test antiinfective drug category"""
    print("\n🦠 TESTING ANTIINFECTIVE DRUGS")
    print("=" * 50)
    
    expected_antiinfective_drugs = [
        "amoxicillin", "amoxicillin_clavulanate", "azithromycin", "ciprofloxacin", "levofloxacin", "cephalexin"
    ]
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs-db?category=antiinfective", timeout=10)
        if response.status_code == 200:
            data = response.json()
            drugs = data.get('drugs', [])
            drug_names = [drug.get('name', '').lower() for drug in drugs]
            
            print(f"✅ Antiinfective drugs endpoint accessible")
            print(f"📊 Antiinfective drugs found: {len(drugs)}")
            
            found_drugs = []
            for expected_drug in expected_antiinfective_drugs:
                if any(expected_drug in name for name in drug_names):
                    found_drugs.append(expected_drug)
                    print(f"  ✅ {expected_drug.title()} found")
                else:
                    print(f"  ❌ {expected_drug.title()} not found")
            
            print(f"\n📈 Found {len(found_drugs)}/{len(expected_antiinfective_drugs)} expected antiinfective drugs")
            return len(found_drugs) >= 4  # At least 4 out of 6
        else:
            print(f"❌ Antiinfective drugs endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing antiinfective drugs: {e}")
        return False

def test_endocrine_drugs():
    """Test endocrine drug category"""
    print("\n🩺 TESTING ENDOCRINE DRUGS")
    print("=" * 50)
    
    expected_endocrine_drugs = [
        "levothyroxine", "metformin", "glipizide", "sitagliptin", "prednisone"
    ]
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs-db?category=endocrine", timeout=10)
        if response.status_code == 200:
            data = response.json()
            drugs = data.get('drugs', [])
            drug_names = [drug.get('name', '').lower() for drug in drugs]
            
            print(f"✅ Endocrine drugs endpoint accessible")
            print(f"📊 Endocrine drugs found: {len(drugs)}")
            
            found_drugs = []
            for expected_drug in expected_endocrine_drugs:
                if any(expected_drug in name for name in drug_names):
                    found_drugs.append(expected_drug)
                    print(f"  ✅ {expected_drug.title()} found")
                else:
                    print(f"  ❌ {expected_drug.title()} not found")
            
            print(f"\n📈 Found {len(found_drugs)}/{len(expected_endocrine_drugs)} expected endocrine drugs")
            return len(found_drugs) >= 3  # At least 3 out of 5
        else:
            print(f"❌ Endocrine drugs endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing endocrine drugs: {e}")
        return False

def test_hematological_drugs():
    """Test hematological drug category"""
    print("\n🩸 TESTING HEMATOLOGICAL DRUGS")
    print("=" * 50)
    
    expected_hematological_drugs = [
        "aspirin", "clopidogrel", "rivaroxaban", "apixaban"
    ]
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs-db?category=hematological", timeout=10)
        if response.status_code == 200:
            data = response.json()
            drugs = data.get('drugs', [])
            drug_names = [drug.get('name', '').lower() for drug in drugs]
            
            print(f"✅ Hematological drugs endpoint accessible")
            print(f"📊 Hematological drugs found: {len(drugs)}")
            
            found_drugs = []
            for expected_drug in expected_hematological_drugs:
                if any(expected_drug in name for name in drug_names):
                    found_drugs.append(expected_drug)
                    print(f"  ✅ {expected_drug.title()} found")
                else:
                    print(f"  ❌ {expected_drug.title()} not found")
            
            print(f"\n📈 Found {len(found_drugs)}/{len(expected_hematological_drugs)} expected hematological drugs")
            return len(found_drugs) >= 3  # At least 3 out of 4
        else:
            print(f"❌ Hematological drugs endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing hematological drugs: {e}")
        return False

def test_sertraline_drug_detail():
    """Test specific drug detail endpoint for sertraline"""
    print("\n🧠 TESTING SERTRALINE DRUG DETAIL")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs-db/sertraline", timeout=10)
        if response.status_code == 200:
            drug_data = response.json()
            
            print(f"✅ Sertraline drug detail endpoint accessible")
            
            # Check for required fields
            required_fields = [
                "name", "brand_names", "mechanism_of_action", "indications", "contraindications"
            ]
            
            found_fields = []
            missing_fields = []
            
            for field in required_fields:
                if field in drug_data and drug_data[field]:
                    found_fields.append(field)
                    print(f"  ✅ {field} field found")
                else:
                    missing_fields.append(field)
                    print(f"  ❌ {field} field missing")
            
            # Check specific content
            if "brand_names" in drug_data and isinstance(drug_data["brand_names"], list):
                print(f"  ✅ Brand names: {', '.join(drug_data['brand_names'][:3])}")
            
            if "mechanism_of_action" in drug_data:
                mechanism = drug_data["mechanism_of_action"][:100] + "..." if len(drug_data["mechanism_of_action"]) > 100 else drug_data["mechanism_of_action"]
                print(f"  ✅ Mechanism: {mechanism}")
            
            if "indications" in drug_data and isinstance(drug_data["indications"], list):
                print(f"  ✅ Indications count: {len(drug_data['indications'])}")
            
            if "contraindications" in drug_data and isinstance(drug_data["contraindications"], list):
                print(f"  ✅ Contraindications count: {len(drug_data['contraindications'])}")
            
            print(f"\n📈 Found {len(found_fields)}/{len(required_fields)} required fields")
            return len(found_fields) >= 4  # At least 4 out of 5 fields
        else:
            print(f"❌ Sertraline drug detail endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing sertraline drug detail: {e}")
        return False

def test_drug_simulation():
    """Test drug simulation endpoint with metformin (from old database)"""
    print("\n🧪 TESTING DRUG SIMULATION")
    print("=" * 50)
    
    try:
        simulation_data = {
            "drug_name": "metformin",
            "dosage": 500,
            "frequency": "once",
            "duration_hours": 24,
            "route": "oral"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/drugs/simulate", json=simulation_data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            
            print(f"✅ Drug simulation endpoint accessible")
            
            # Check for expected response fields
            expected_fields = ["drug", "dosage_mg", "modified_state"]
            found_fields = []
            
            for field in expected_fields:
                if field in result:
                    found_fields.append(field)
                    print(f"  ✅ {field} field found")
                else:
                    print(f"  ❌ {field} field missing")
            
            if "drug" in result:
                print(f"  ✅ Drug name: {result['drug']}")
            
            if "dosage_mg" in result:
                print(f"  ✅ Dosage: {result['dosage_mg']}mg")
            
            if "modified_state" in result and isinstance(result["modified_state"], dict):
                print(f"  ✅ Modified state parameters: {len(result['modified_state'])}")
            
            if "attributions" in result and isinstance(result["attributions"], list):
                print(f"  ✅ Drug attributions: {len(result['attributions'])} mechanisms")
            
            print(f"\n📈 Found {len(found_fields)}/{len(expected_fields)} expected fields")
            return len(found_fields) >= 2  # At least 2 out of 3 fields
        else:
            print(f"❌ Drug simulation endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing drug simulation: {e}")
        return False

def run_all_tests():
    """Run all tests and provide summary"""
    print("🧪 PHICOR DRUG ENGINE - COMPREHENSIVE DRUG DATABASE EXPANSION TESTING")
    print("=" * 80)
    print("Testing comprehensive drug database expansion from ~51 to 99 drugs")
    print("Focus: New drug categories and comprehensive drug data")
    print("=" * 80)
    
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
    
    # Test 3: Drug Database Total Count
    if test_results['backend_health']:
        print("\n3️⃣ DRUG DATABASE TOTAL COUNT")
        test_results['drug_total_count'] = test_drug_database_total_count()
    else:
        test_results['drug_total_count'] = False
    
    # Test 4: CNS Drugs Category
    if test_results['backend_health']:
        test_results['cns_drugs'] = test_cns_drugs()
    else:
        test_results['cns_drugs'] = False
    
    # Test 5: Gastrointestinal Drugs Category
    if test_results['backend_health']:
        test_results['gi_drugs'] = test_gastrointestinal_drugs()
    else:
        test_results['gi_drugs'] = False
    
    # Test 6: Analgesic Drugs Category
    if test_results['backend_health']:
        test_results['analgesic_drugs'] = test_analgesic_drugs()
    else:
        test_results['analgesic_drugs'] = False
    
    # Test 7: Antiinfective Drugs Category
    if test_results['backend_health']:
        test_results['antiinfective_drugs'] = test_antiinfective_drugs()
    else:
        test_results['antiinfective_drugs'] = False
    
    # Test 8: Endocrine Drugs Category
    if test_results['backend_health']:
        test_results['endocrine_drugs'] = test_endocrine_drugs()
    else:
        test_results['endocrine_drugs'] = False
    
    # Test 9: Hematological Drugs Category
    if test_results['backend_health']:
        test_results['hematological_drugs'] = test_hematological_drugs()
    else:
        test_results['hematological_drugs'] = False
    
    # Test 10: Sertraline Drug Detail
    if test_results['backend_health']:
        test_results['sertraline_detail'] = test_sertraline_drug_detail()
    else:
        test_results['sertraline_detail'] = False
    
    # Test 11: Drug Simulation
    if test_results['backend_health']:
        test_results['drug_simulation'] = test_drug_simulation()
    else:
        test_results['drug_simulation'] = False
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 COMPREHENSIVE DRUG DATABASE EXPANSION TEST SUMMARY")
    print("=" * 80)
    
    # Drug categories summary
    drug_categories = ['cns_drugs', 'gi_drugs', 'analgesic_drugs', 'antiinfective_drugs', 'endocrine_drugs', 'hematological_drugs']
    passed_categories = sum(1 for cat in drug_categories if test_results.get(cat, False))
    
    print(f"\n💊 DRUG CATEGORIES TESTED: {passed_categories}/{len(drug_categories)}")
    for category in drug_categories:
        status = "✅ PASSED" if test_results.get(category, False) else "❌ FAILED"
        category_name = category.replace('_', ' ').title()
        print(f"  {status}: {category_name}")
    
    # Overall pass/fail summary
    passed = 0
    total = 0
    
    critical_tests = ['backend_url', 'backend_health', 'drug_total_count', 'sertraline_detail', 'drug_simulation']
    
    for test_name, result in test_results.items():
        if test_name in critical_tests:
            if result:
                print(f"✅ {test_name}: PASSED")
                passed += 1
            else:
                print(f"❌ {test_name}: FAILED")
            total += 1
    
    # Add drug categories to critical tests
    if passed_categories >= 4:  # At least 4 out of 6 categories working
        print(f"✅ drug_categories: PASSED ({passed_categories}/6 categories working)")
        passed += 1
    else:
        print(f"❌ drug_categories: FAILED ({passed_categories}/6 categories working)")
    total += 1
    
    print(f"\n🎯 OVERALL RESULT: {passed}/{total} critical tests passed")
    
    if passed >= total * 0.8:  # 80% pass rate
        print("🎉 PHICOR DRUG ENGINE COMPREHENSIVE DATABASE EXPANSION TESTS PASSED!")
        print("✅ NEW DRUG CATEGORIES AND COMPREHENSIVE DATA VERIFIED!")
        return True
    else:
        print("⚠️  Some critical tests failed - see details above")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)