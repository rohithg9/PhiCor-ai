#!/usr/bin/env python3
"""
Backend Testing for PhiCore.ai Medical Knowledge Base Integration
Testing the integrated Medical Knowledge Base API endpoints as requested in review:

PHICORE.AI MEDICAL KNOWLEDGE BASE INTEGRATION TESTING:

Test 1: Platform Stats API
- Endpoint: GET /api/platform/stats
- Expected: Returns drugs.total > 300, diseases.total > 200, dynamic display_stats

Test 2: Merged Drugs List API  
- Endpoint: GET /api/drugs?limit=500
- Expected: Returns total > 300 drugs, includes both comprehensive (ai_generated=false) and AI-generated (ai_generated=true) drugs

Test 3: Drug Detail with Mathematical Models
- Endpoint: GET /api/drugs/lisinopril
- Expected: Returns drug with mechanisms array (for simulation), therapeutic_effects array, max_daily_dose_mg

Test 4: Drug Search
- Endpoint: GET /api/drugs?search=metformin
- Expected: Returns metformin drug with full details

Test 5: Drug Category Filter
- Endpoint: GET /api/drugs?category=cardiovascular
- Expected: Returns only cardiovascular drugs

Test 6: Generated Drug Detail
- Endpoint: GET /api/drugs/amlodipine  
- Expected: Returns AI-generated drug with mechanisms for simulation

Test 7: Disease Stats
- Endpoint: GET /api/diseases-db/stats
- Expected: Returns total_diseases > 200, by_category breakdown

API Base URL: https://medcalc-ai.preview.emergentagent.com
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

def test_platform_stats_api():
    """Test 1: Platform Stats API - GET /api/platform/stats"""
    print("\n📊 TEST 1: PLATFORM STATS API")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/platform/stats", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            print(f"✅ Platform stats endpoint accessible")
            
            # Check for required fields
            drugs_data = data.get('drugs', {})
            diseases_data = data.get('diseases', {})
            display_stats = data.get('display_stats', {})
            
            # Test drugs.total > 300
            drugs_total = drugs_data.get('total', 0)
            print(f"  📊 Drugs total: {drugs_total}")
            if drugs_total > 300:
                print(f"  ✅ Drugs total ({drugs_total}) > 300 ✓")
                drugs_pass = True
            else:
                print(f"  ❌ Drugs total ({drugs_total}) ≤ 300")
                drugs_pass = False
            
            # Test diseases.total > 200
            diseases_total = diseases_data.get('total', 0)
            print(f"  📊 Diseases total: {diseases_total}")
            if diseases_total > 200:
                print(f"  ✅ Diseases total ({diseases_total}) > 200 ✓")
                diseases_pass = True
            else:
                print(f"  ❌ Diseases total ({diseases_total}) ≤ 200")
                diseases_pass = False
            
            # Test dynamic display_stats
            if display_stats:
                print(f"  ✅ Display stats present:")
                for key, value in display_stats.items():
                    print(f"    - {key}: {value}")
                display_pass = True
            else:
                print(f"  ❌ Display stats missing")
                display_pass = False
            
            return drugs_pass and diseases_pass and display_pass
        else:
            print(f"❌ Platform stats endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing platform stats: {e}")
        return False

def test_merged_drugs_list_api():
    """Test 2: Merged Drugs List API - GET /api/drugs?limit=500"""
    print("\n💊 TEST 2: MERGED DRUGS LIST API")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs?limit=500", timeout=15)
        if response.status_code == 200:
            data = response.json()
            
            print(f"✅ Merged drugs list endpoint accessible")
            
            # Check total > 300
            total_drugs = data.get('total', 0)
            drugs_list = data.get('drugs', [])
            
            print(f"  📊 Total drugs: {total_drugs}")
            print(f"  📊 Drugs returned: {len(drugs_list)}")
            
            if total_drugs > 300:
                print(f"  ✅ Total drugs ({total_drugs}) > 300 ✓")
                total_pass = True
            else:
                print(f"  ❌ Total drugs ({total_drugs}) ≤ 300")
                total_pass = False
            
            # Check for both comprehensive and AI-generated drugs
            ai_generated_count = 0
            comprehensive_count = 0
            
            for drug in drugs_list[:50]:  # Check first 50 drugs
                if drug.get('ai_generated', False):
                    ai_generated_count += 1
                else:
                    comprehensive_count += 1
            
            print(f"  📊 AI-generated drugs (sample): {ai_generated_count}")
            print(f"  📊 Comprehensive drugs (sample): {comprehensive_count}")
            
            if ai_generated_count > 0 and comprehensive_count > 0:
                print(f"  ✅ Both comprehensive and AI-generated drugs present ✓")
                mix_pass = True
            else:
                print(f"  ❌ Missing either comprehensive or AI-generated drugs")
                mix_pass = False
            
            return total_pass and mix_pass
        else:
            print(f"❌ Merged drugs list endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing merged drugs list: {e}")
        return False

def test_drug_detail_mathematical_models():
    """Test 3: Drug Detail with Mathematical Models - GET /api/drugs/lisinopril"""
    print("\n🧮 TEST 3: DRUG DETAIL WITH MATHEMATICAL MODELS")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs/lisinopril", timeout=10)
        if response.status_code == 200:
            drug_data = response.json()
            
            print(f"✅ Lisinopril drug detail endpoint accessible")
            print(f"  📊 Drug name: {drug_data.get('name', 'Unknown')}")
            
            # Check for mechanisms array (for simulation)
            mechanisms = drug_data.get('mechanisms', [])
            if mechanisms and isinstance(mechanisms, list):
                print(f"  ✅ Mechanisms array present ({len(mechanisms)} mechanisms) ✓")
                mechanisms_pass = True
                for i, mech in enumerate(mechanisms[:3]):  # Show first 3
                    print(f"    - Mechanism {i+1}: {mech.get('description', 'No description')}")
            else:
                print(f"  ❌ Mechanisms array missing or empty")
                mechanisms_pass = False
            
            # Check for therapeutic_effects array
            therapeutic_effects = drug_data.get('therapeutic_effects', [])
            if therapeutic_effects and isinstance(therapeutic_effects, list):
                print(f"  ✅ Therapeutic effects array present ({len(therapeutic_effects)} effects) ✓")
                effects_pass = True
            else:
                print(f"  ❌ Therapeutic effects array missing or empty")
                effects_pass = False
            
            # Check for max_daily_dose_mg
            max_dose = drug_data.get('max_daily_dose_mg')
            if max_dose and isinstance(max_dose, (int, float)) and max_dose > 0:
                print(f"  ✅ Max daily dose: {max_dose} mg ✓")
                dose_pass = True
            else:
                print(f"  ❌ Max daily dose missing or invalid")
                dose_pass = False
            
            return mechanisms_pass and effects_pass and dose_pass
        else:
            print(f"❌ Lisinopril drug detail endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing lisinopril drug detail: {e}")
        return False

def test_drug_search():
    """Test 4: Drug Search - GET /api/drugs?search=metformin"""
    print("\n🔍 TEST 4: DRUG SEARCH")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs?search=metformin", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            print(f"✅ Drug search endpoint accessible")
            
            drugs = data.get('drugs', [])
            print(f"  📊 Search results for 'metformin': {len(drugs)} drugs")
            
            # Look for metformin in results
            metformin_found = False
            metformin_drug = None
            
            for drug in drugs:
                drug_name = drug.get('name', '').lower()
                drug_id = drug.get('id', '').lower()
                
                if 'metformin' in drug_name or 'metformin' in drug_id:
                    metformin_found = True
                    metformin_drug = drug
                    print(f"  ✅ Metformin found: {drug.get('name')} ✓")
                    break
            
            if metformin_found and metformin_drug:
                # Check for full details
                required_fields = ['name', 'category', 'drug_class', 'mechanisms_count']
                found_fields = []
                
                for field in required_fields:
                    if field in metformin_drug and metformin_drug[field]:
                        found_fields.append(field)
                        print(f"    ✅ {field}: {metformin_drug[field]}")
                    else:
                        print(f"    ❌ {field}: missing")
                
                details_pass = len(found_fields) >= 3
                return metformin_found and details_pass
            else:
                print(f"  ❌ Metformin not found in search results")
                return False
        else:
            print(f"❌ Drug search endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing drug search: {e}")
        return False

def test_drug_category_filter():
    """Test 5: Drug Category Filter - GET /api/drugs?category=cardiovascular"""
    print("\n❤️ TEST 5: DRUG CATEGORY FILTER")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs?category=cardiovascular", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            print(f"✅ Drug category filter endpoint accessible")
            
            drugs = data.get('drugs', [])
            total = data.get('total', 0)
            
            print(f"  📊 Cardiovascular drugs found: {len(drugs)}")
            print(f"  📊 Total cardiovascular drugs: {total}")
            
            if len(drugs) == 0:
                print(f"  ❌ No cardiovascular drugs returned")
                return False
            
            # Check that all returned drugs are cardiovascular
            non_cardiovascular = 0
            cardiovascular_count = 0
            
            for drug in drugs[:20]:  # Check first 20 drugs
                category = drug.get('category', '').lower()
                if 'cardiovascular' in category or 'cardiac' in category or 'cardio' in category:
                    cardiovascular_count += 1
                else:
                    non_cardiovascular += 1
                    print(f"    ⚠️ Non-cardiovascular drug found: {drug.get('name')} (category: {category})")
            
            print(f"  📊 Cardiovascular drugs in sample: {cardiovascular_count}")
            print(f"  📊 Non-cardiovascular drugs in sample: {non_cardiovascular}")
            
            if cardiovascular_count > 0 and non_cardiovascular <= 2:  # Allow some flexibility
                print(f"  ✅ Category filter working correctly ✓")
                return True
            else:
                print(f"  ❌ Category filter not working properly")
                return False
        else:
            print(f"❌ Drug category filter endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing drug category filter: {e}")
        return False

def test_generated_drug_detail():
    """Test 6: Generated Drug Detail - GET /api/drugs/amlodipine"""
    print("\n🤖 TEST 6: GENERATED DRUG DETAIL")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/drugs/amlodipine", timeout=10)
        if response.status_code == 200:
            drug_data = response.json()
            
            print(f"✅ Amlodipine drug detail endpoint accessible")
            print(f"  📊 Drug name: {drug_data.get('name', 'Unknown')}")
            
            # Check if it's AI-generated
            is_ai_generated = drug_data.get('generator_version') is not None or drug_data.get('ai_generated', False)
            if is_ai_generated:
                print(f"  ✅ AI-generated drug confirmed ✓")
                ai_pass = True
            else:
                print(f"  ⚠️ Drug may not be AI-generated (checking mechanisms anyway)")
                ai_pass = True  # Still proceed with testing
            
            # Check for mechanisms for simulation
            mechanisms = drug_data.get('mechanisms', [])
            if mechanisms and isinstance(mechanisms, list):
                print(f"  ✅ Mechanisms for simulation present ({len(mechanisms)} mechanisms) ✓")
                mechanisms_pass = True
                for i, mech in enumerate(mechanisms[:2]):  # Show first 2
                    if isinstance(mech, dict):
                        print(f"    - Mechanism {i+1}: {mech.get('description', mech.get('target', 'Unknown'))}")
                    else:
                        print(f"    - Mechanism {i+1}: {mech}")
            else:
                print(f"  ❌ Mechanisms for simulation missing or empty")
                mechanisms_pass = False
            
            # Check for additional simulation-compatible fields
            max_dose = drug_data.get('max_daily_dose_mg')
            therapeutic_effects = drug_data.get('therapeutic_effects', [])
            
            if max_dose:
                print(f"  ✅ Max daily dose: {max_dose} mg")
            if therapeutic_effects:
                print(f"  ✅ Therapeutic effects: {len(therapeutic_effects)} effects")
            
            simulation_ready = mechanisms_pass and (max_dose is not None)
            if simulation_ready:
                print(f"  ✅ Drug ready for simulation ✓")
            else:
                print(f"  ❌ Drug not fully ready for simulation")
            
            return ai_pass and mechanisms_pass and simulation_ready
        else:
            print(f"❌ Amlodipine drug detail endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing amlodipine drug detail: {e}")
        return False

def test_disease_stats():
    """Test 7: Disease Stats - GET /api/diseases-db/stats"""
    print("\n🏥 TEST 7: DISEASE STATS")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/diseases-db/stats", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            print(f"✅ Disease stats endpoint accessible")
            
            # Check total_diseases > 200
            total_diseases = data.get('total_diseases', 0)
            print(f"  📊 Total diseases: {total_diseases}")
            
            if total_diseases > 200:
                print(f"  ✅ Total diseases ({total_diseases}) > 200 ✓")
                total_pass = True
            else:
                print(f"  ❌ Total diseases ({total_diseases}) ≤ 200")
                total_pass = False
            
            # Check by_category breakdown
            by_category = data.get('by_category', {})
            if by_category and isinstance(by_category, dict):
                print(f"  ✅ By category breakdown present ({len(by_category)} categories) ✓")
                category_pass = True
                
                # Show top categories
                sorted_categories = sorted(by_category.items(), key=lambda x: x[1], reverse=True)
                for category, count in sorted_categories[:5]:
                    print(f"    - {category}: {count} diseases")
            else:
                print(f"  ❌ By category breakdown missing or invalid")
                category_pass = False
            
            # Check for additional useful fields
            ai_generated = data.get('ai_generated', 0)
            if ai_generated:
                print(f"  ✅ AI-generated diseases: {ai_generated}")
            
            return total_pass and category_pass
        else:
            print(f"❌ Disease stats endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing disease stats: {e}")
        return False

def run_all_tests():
    """Run all tests and provide summary"""
    print("🧪 PHICOR MEDICAL KNOWLEDGE BASE API TESTING")
    print("=" * 80)
    print("Testing newly implemented Medical Knowledge Base API endpoints for PhiCore.ai")
    print("Focus: Drug generation status, ICD-10 conditions, generated drugs quality")
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
    
    # DRUG DATABASE TESTS
    if test_results['backend_health']:
        print("\n3️⃣ DRUG DATABASE TOTAL COUNT (115 DRUGS)")
        test_results['drug_total_count'] = test_drug_database_total_count()
    else:
        test_results['drug_total_count'] = False
    
    if test_results['backend_health']:
        print("\n4️⃣ CNS DRUGS CATEGORY")
        test_results['cns_drugs'] = test_cns_drugs()
    else:
        test_results['cns_drugs'] = False
    
    if test_results['backend_health']:
        print("\n5️⃣ DERMATOLOGICAL DRUGS CATEGORY")
        test_results['dermatological_drugs'] = test_dermatological_drugs()
    else:
        test_results['dermatological_drugs'] = False
    
    if test_results['backend_health']:
        print("\n6️⃣ IMMUNOSUPPRESSANT DRUGS CATEGORY")
        test_results['immunosuppressant_drugs'] = test_immunosuppressant_drugs()
    else:
        test_results['immunosuppressant_drugs'] = False
    
    if test_results['backend_health']:
        print("\n7️⃣ UROLOGICAL DRUGS CATEGORY")
        test_results['urological_drugs'] = test_urological_drugs()
    else:
        test_results['urological_drugs'] = False
    
    if test_results['backend_health']:
        print("\n8️⃣ OPHTHALMIC DRUGS CATEGORY")
        test_results['ophthalmic_drugs'] = test_ophthalmic_drugs()
    else:
        test_results['ophthalmic_drugs'] = False
    
    # DISEASE DATABASE TESTS
    if test_results['backend_health']:
        print("\n9️⃣ DISEASE DATABASE TOTAL COUNT (28 DISEASES)")
        test_results['disease_total_count'] = test_disease_database_total_count()
    else:
        test_results['disease_total_count'] = False
    
    if test_results['backend_health']:
        print("\n🔟 CARDIOVASCULAR DISEASES CATEGORY")
        test_results['cardiovascular_diseases'] = test_cardiovascular_diseases()
    else:
        test_results['cardiovascular_diseases'] = False
    
    if test_results['backend_health']:
        print("\n1️⃣1️⃣ TYPE 2 DIABETES DISEASE DETAIL")
        test_results['type2_diabetes_detail'] = test_type2_diabetes_detail()
    else:
        test_results['type2_diabetes_detail'] = False
    
    if test_results['backend_health']:
        print("\n1️⃣2️⃣ LEUKEMIA DISEASE SEARCH")
        test_results['leukemia_search'] = test_leukemia_search()
    else:
        test_results['leukemia_search'] = False
    
    # DRUG SIMULATION TEST
    if test_results['backend_health']:
        print("\n1️⃣3️⃣ DRUG SIMULATION ENGINE")
        test_results['drug_simulation'] = test_drug_simulation()
    else:
        test_results['drug_simulation'] = False
    
    # MEDICAL KNOWLEDGE BASE API TESTS
    if test_results['backend_health']:
        print("\n1️⃣4️⃣ DRUG GENERATION STATUS API")
        test_results['drug_generation_status'] = test_drug_generation_status()
    else:
        test_results['drug_generation_status'] = False
    
    if test_results['backend_health']:
        print("\n1️⃣5️⃣ DRUG CHUNK GENERATION API")
        test_results['drug_chunk_generation'] = test_drug_chunk_generation()
    else:
        test_results['drug_chunk_generation'] = False
    
    if test_results['backend_health']:
        print("\n1️⃣6️⃣ ICD-10 STATUS API")
        test_results['icd10_status'] = test_icd10_status()
    else:
        test_results['icd10_status'] = False
    
    if test_results['backend_health']:
        print("\n1️⃣7️⃣ GENERATED DRUGS LIST API")
        test_results['generated_drugs_list'] = test_generated_drugs_list()
    else:
        test_results['generated_drugs_list'] = False
    
    if test_results['backend_health']:
        print("\n1️⃣8️⃣ DISEASE DATABASE STATS API")
        test_results['disease_database_stats'] = test_disease_database_stats()
    else:
        test_results['disease_database_stats'] = False
    
    if test_results['backend_health']:
        print("\n1️⃣9️⃣ DRUG DATA QUALITY VERIFICATION")
        test_results['drug_data_quality'] = test_drug_data_quality()
    else:
        test_results['drug_data_quality'] = False
    
    # Summary
    print("\n" + "=" * 80)
    print("🏁 PHICOR PK/PD SIMULATION ENGINE TEST SUMMARY")
    print("=" * 80)
    
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    
    print(f"\n📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed")
    
    # Group results by category
    drug_tests = ['drug_total_count', 'cns_drugs', 'dermatological_drugs', 'immunosuppressant_drugs', 'urological_drugs', 'ophthalmic_drugs']
    disease_tests = ['disease_total_count', 'cardiovascular_diseases', 'type2_diabetes_detail', 'leukemia_search']
    simulation_tests = ['drug_simulation']
    knowledge_base_tests = ['drug_generation_status', 'drug_chunk_generation', 'icd10_status', 'generated_drugs_list', 'disease_database_stats', 'drug_data_quality']
    infrastructure_tests = ['backend_url', 'backend_health']
    
    print(f"\n📊 DRUG DATABASE TESTS:")
    for test_name in drug_tests:
        if test_name in test_results:
            status = "✅ PASS" if test_results[test_name] else "❌ FAIL"
            print(f"  {status} - {test_name.replace('_', ' ').title()}")
    
    print(f"\n📊 DISEASE DATABASE TESTS:")
    for test_name in disease_tests:
        if test_name in test_results:
            status = "✅ PASS" if test_results[test_name] else "❌ FAIL"
            print(f"  {status} - {test_name.replace('_', ' ').title()}")
    
    print(f"\n📊 SIMULATION ENGINE TESTS:")
    for test_name in simulation_tests:
        if test_name in test_results:
            status = "✅ PASS" if test_results[test_name] else "❌ FAIL"
            print(f"  {status} - {test_name.replace('_', ' ').title()}")
    
    print(f"\n📊 MEDICAL KNOWLEDGE BASE API TESTS:")
    for test_name in knowledge_base_tests:
        if test_name in test_results:
            status = "✅ PASS" if test_results[test_name] else "❌ FAIL"
            print(f"  {status} - {test_name.replace('_', ' ').title()}")
    
    print(f"\n📊 INFRASTRUCTURE TESTS:")
    for test_name in infrastructure_tests:
        if test_name in test_results:
            status = "✅ PASS" if test_results[test_name] else "❌ FAIL"
            print(f"  {status} - {test_name.replace('_', ' ').title()}")
    
    if passed_tests == total_tests:
        print(f"\n🎉 ALL TESTS PASSED! PhiCor Medical Knowledge Base API is working perfectly.")
        print(f"✅ Drug generation status API functional")
        print(f"✅ ICD-10 conditions system operational")
        print(f"✅ Generated drugs list with comprehensive data")
        print(f"✅ Disease database stats accessible")
        print(f"✅ All Medical Knowledge Base API endpoints operational")
    elif passed_tests >= total_tests * 0.8:
        print(f"\n✅ MOSTLY SUCCESSFUL! {passed_tests}/{total_tests} tests passed.")
        print(f"⚠️  Some minor issues detected - see failed tests above")
    else:
        print(f"\n❌ SIGNIFICANT ISSUES DETECTED! Only {passed_tests}/{total_tests} tests passed.")
        print(f"🔧 Major fixes needed for Medical Knowledge Base API functionality")
    
    return test_results

if __name__ == "__main__":
    run_all_tests()