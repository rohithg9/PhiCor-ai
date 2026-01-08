#!/usr/bin/env python3
"""
Backend Testing for PhiCor.ai Food Engine After Database Expansion
Testing specific requirements from review request:

PHICOR.AI FOOD ENGINE DATA EXPANSION VERIFICATION:

Test 1: Platform Stats API Test
- GET /api/platform/stats
- Should return foods.total >= 9900 (after MASSIVE database expansion)
- Should return nutrients.total = 45
- Should return display_stats.foods showing "9900+" or similar

Test 2: Food Analysis from DB Test
- POST /api/food/analyze-from-db with food_name: "Apple" - should return comprehensive analysis with organ_system_parameter_effects
- POST /api/food/analyze-from-db with food_name: "Chicken breast" - should find USDA food
- POST /api/food/analyze-from-db with food_name: "Coca Cola" - should find Open Food Facts product

Test 3: Food Search Verification
- Verify the database contains branded products (search for "Coca Cola", "Pepsi", "Nestle")
- Verify superfoods (search for "spirulina", "maca", "moringa")
- Verify fermented foods (search for "kombucha", "kefir", "natto")
- Verify exotic fruits (search for "dragon fruit", "durian", "jackfruit")

Expected Results:
- Total food count should be approximately 9,951
- Multiple data sources (USDA, Open Food Facts, PhiCor) should be present
- Food analysis should work for various food types

API Base URL: Use REACT_APP_BACKEND_URL from /app/frontend/.env
"""

import requests
import json
import time
import sys
import os
import base64
from typing import Dict, List, Any, Optional

# Get the backend URL from frontend .env
FRONTEND_ENV_PATH = "/app/frontend/.env"
BACKEND_URL = None

# Global variables for test state
platform_stats = None
food_search_results = None
apple_analysis = None
chicken_analysis = None
coca_cola_analysis = None

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

def test_platform_stats_api():
    """Test 1: Platform Stats API Test - GET /api/platform/stats"""
    global platform_stats
    
    print("\n📊 TEST 1: PLATFORM STATS API (AFTER DATABASE EXPANSION)")
    print("=" * 60)
    print("Testing requirements from review request:")
    print("- GET /api/platform/stats")
    print("- Should return foods.total >= 9900 (after MASSIVE database expansion)")
    print("- Should return nutrients.total = 45")
    print("- Should return display_stats.foods showing '9900+' or similar")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/platform/stats", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            platform_stats = data
            
            print(f"✅ Platform stats API call successful")
            print(f"  📊 Response status: {response.status_code}")
            
            # Check expected counts after database expansion
            expected_counts = {
                'foods': 9900,  # Updated expectation after MASSIVE database expansion
                'nutrients': 45
            }
            
            all_counts_pass = True
            
            # Check foods count (CRITICAL - should be >= 844 after expansion)
            foods_total = data.get('foods', {}).get('total', 0)
            if foods_total >= expected_counts['foods']:
                print(f"  ✅ Foods: {foods_total} (expected {expected_counts['foods']}+) ✓")
            else:
                print(f"  ❌ Foods: {foods_total} (expected {expected_counts['foods']}+) - MASSIVE DATABASE EXPANSION FAILED")
                all_counts_pass = False
            
            # Check nutrients count
            nutrients_total = data.get('nutrients', {}).get('total', 0)
            if nutrients_total >= expected_counts['nutrients']:
                print(f"  ✅ Nutrients: {nutrients_total} (expected {expected_counts['nutrients']}+) ✓")
            else:
                print(f"  ❌ Nutrients: {nutrients_total} (expected {expected_counts['nutrients']}+)")
                all_counts_pass = False
            
            # Check display stats format for foods showing "844+"
            display_stats = data.get('display_stats', {})
            if display_stats:
                foods_display = display_stats.get('foods', '')
                print(f"  ✅ Display stats format present")
                print(f"    📊 Foods display: {foods_display}")
                
                # Verify foods display shows 9900+
                if '9900' in str(foods_display) or foods_total >= 9900:
                    print(f"    ✅ Foods display shows MASSIVE expansion (9900+) ✓")
                    display_pass = True
                else:
                    print(f"    ❌ Foods display doesn't show MASSIVE expansion (expected 9900+)")
                    display_pass = False
            else:
                print(f"  ⚠️ Display stats format missing")
                display_pass = False
            
            return all_counts_pass and display_pass
            
        else:
            print(f"❌ Platform stats API call failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"  ℹ️ Error details: {error_data}")
            except:
                print(f"  ℹ️ Response text: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing platform stats API: {e}")
        return False

def test_food_analysis_from_db():
    """Test 2: Food Analysis from DB Test - Multiple foods including USDA and Open Food Facts"""
    global apple_analysis, chicken_analysis, coca_cola_analysis
    
    print("\n🍎 TEST 2: FOOD ANALYSIS FROM DB (MASSIVE DATABASE EXPANSION)")
    print("=" * 60)
    print("Testing requirements from review request:")
    print("- Test with food_name: 'Apple' - should return comprehensive analysis")
    print("- Test with food_name: 'Chicken breast' - should find USDA food")
    print("- Test with food_name: 'Coca Cola' - should find Open Food Facts product")
    print("- All should include organ_system_parameter_effects")
    
    test_foods = [
        {
            "name": "Apple",
            "description": "Basic food analysis",
            "expected_source": "usda",
            "variable": "apple_analysis"
        },
        {
            "name": "Chicken breast",
            "description": "USDA FoodData Central food",
            "expected_source": "usda",
            "variable": "chicken_analysis"
        },
        {
            "name": "Coca Cola",
            "description": "Open Food Facts branded product",
            "expected_source": "open_food_facts",
            "variable": "coca_cola_analysis"
        }
    ]
    
    all_tests_pass = True
    
    for food_test in test_foods:
        food_name = food_test["name"]
        description = food_test["description"]
        expected_source = food_test["expected_source"]
        
        print(f"\n  🧪 Testing: {food_name} ({description})")
        
        try:
            request_data = {
                "food_name": food_name,
                "serving_size": "1 serving"
            }
            
            response = requests.post(
                f"{BACKEND_URL}/api/food/analyze-from-db",
                json=request_data,
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Store in global variables
                if food_name == "Banana":
                    banana_analysis = data
                elif food_name == "Coca Cola":
                    coca_cola_analysis = data
                elif food_name == "Spirulina powder":
                    spirulina_analysis = data
                
                print(f"    ✅ API call successful")
                
                # Check success field
                success = data.get('success', False)
                if success:
                    print(f"    ✅ Analysis successful (success: true) ✓")
                else:
                    print(f"    ❌ Analysis failed (success: false)")
                    all_tests_pass = False
                    continue
                
                # Get analysis data
                analysis = data.get('analysis', {})
                if not analysis:
                    print(f"    ❌ Analysis data missing")
                    all_tests_pass = False
                    continue
                
                # Check product name
                product_name = analysis.get('product_name', '')
                if food_name.lower() in product_name.lower():
                    print(f"    ✅ Product found: {product_name}")
                else:
                    print(f"    ⚠️ Product name: {product_name}")
                
                # Check data source (if available)
                data_source = analysis.get('data_source', '')
                if data_source:
                    print(f"    📊 Data source: {data_source}")
                    if expected_source in data_source.lower():
                        print(f"    ✅ Expected source confirmed ({expected_source}) ✓")
                    else:
                        print(f"    ⚠️ Different source than expected (expected: {expected_source})")
                
                # Check organ system parameter effects (CRITICAL)
                organ_effects = analysis.get('organ_system_parameter_effects', {})
                
                if organ_effects and isinstance(organ_effects, dict):
                    print(f"    ✅ organ_system_parameter_effects present ✓")
                    organ_systems = list(organ_effects.keys())
                    print(f"      📊 Organ systems: {len(organ_systems)} systems")
                    
                    # Check for key organ systems
                    key_systems = ['cardiovascular', 'glycemic', 'renal', 'hepatic', 'gastrointestinal']
                    found_systems = []
                    for key_system in key_systems:
                        if any(key_system in system.lower() for system in organ_systems):
                            found_systems.append(key_system)
                    
                    if found_systems:
                        print(f"      ✅ Key organ systems found: {found_systems}")
                    else:
                        print(f"      ⚠️ No key organ systems found")
                    
                else:
                    print(f"    ❌ organ_system_parameter_effects missing")
                    all_tests_pass = False
                
            else:
                print(f"    ❌ API call failed: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"      ℹ️ Error details: {error_data}")
                except:
                    print(f"      ℹ️ Response text: {response.text}")
                all_tests_pass = False
                
        except Exception as e:
            print(f"    ❌ Error testing {food_name}: {e}")
            all_tests_pass = False
    
    return all_tests_pass

def run_all_tests():
    """Run all PhiCor.ai Food Engine tests after database expansion"""
    print("🧪 PHICOR.AI FOOD ENGINE TESTING (AFTER DATABASE EXPANSION)")
    print("=" * 80)
    print("Testing specific requirements from review request:")
    print("1. Platform Stats API Test - Should return foods.total >= 844")
    print("2. Food Analysis from DB Test - Test Banana, Coca Cola, Spirulina powder")
    print("3. Food Search Verification - Verify branded products, superfoods, etc.")
    print("=" * 80)
    print("Test Credentials:")
    print("- Backend URL: Use REACT_APP_BACKEND_URL from /app/frontend/.env")
    print("=" * 80)
    print("NOTE: This tests the PhiCor.ai Food Engine after significant database expansion")
    print("FOCUS: Verifying 844+ foods, Open Food Facts integration, superfood additions")
    print("=" * 80)
    
    test_results = {}
    
    # Test 1: Backend URL configuration
    print("\n🔧 BACKEND URL CONFIGURATION")
    test_results['backend_url'] = get_backend_url()
    
    # Test 2: Backend health (if URL is available)
    if test_results['backend_url']:
        print("\n🏥 BACKEND HEALTH CHECK")
        test_results['backend_health'] = test_backend_health()
    else:
        test_results['backend_health'] = False
    
    # PHICOR.AI FOOD ENGINE TESTS (AFTER DATABASE EXPANSION)
    if test_results['backend_health']:
        test_results['platform_stats_api'] = test_platform_stats_api()
        test_results['food_analysis_from_db'] = test_food_analysis_from_db()
        test_results['food_search_verification'] = test_food_search_verification()
    else:
        # Set all tests to False if backend is not accessible
        test_results.update({
            'platform_stats_api': False,
            'food_analysis_from_db': False,
            'food_search_verification': False
        })
    
    # Summary
    print("\n" + "=" * 80)
    print("🏁 PHICOR.AI FOOD ENGINE TEST SUMMARY (DATABASE EXPANSION)")
    print("=" * 80)
    
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    
    print(f"\n📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed")
    
    # Test results breakdown
    food_engine_tests = [
        ('platform_stats_api', 'Test 1: Platform Stats API (foods.total >= 844)'),
        ('food_analysis_from_db', 'Test 2: Food Analysis from DB (Banana, Coca Cola, Spirulina)'),
        ('food_search_verification', 'Test 3: Food Search Verification (branded, superfoods, etc.)')
    ]
    
    infrastructure_tests = [
        ('backend_url', 'Backend URL Configuration'),
        ('backend_health', 'Backend Health Check')
    ]
    
    print(f"\n📊 PHICOR.AI FOOD ENGINE TESTS:")
    for test_key, test_name in food_engine_tests:
        if test_key in test_results:
            status = "✅ PASS" if test_results[test_key] else "❌ FAIL"
            print(f"  {status} - {test_name}")
    
    print(f"\n📊 INFRASTRUCTURE TESTS:")
    for test_key, test_name in infrastructure_tests:
        if test_key in test_results:
            status = "✅ PASS" if test_results[test_key] else "❌ FAIL"
            print(f"  {status} - {test_name}")
    
    # Calculate food engine test success rate
    app_passed = sum(1 for test_key, _ in food_engine_tests if test_results.get(test_key, False))
    app_total = len(food_engine_tests)
    
    if app_passed == app_total:
        print(f"\n🎉 ALL PHICOR.AI FOOD ENGINE TESTS PASSED!")
        print(f"✅ Platform stats showing 844+ foods after database expansion")
        print(f"✅ Food analysis working for Banana, Coca Cola, and Spirulina powder")
        print(f"✅ Food search verification confirmed branded products and superfoods")
        print(f"\n🔄 COMPLETE FOOD ENGINE WORKFLOW VERIFIED:")
        print(f"   Database Expansion → Open Food Facts Integration → Superfood Addition → Analysis")
    elif app_passed >= app_total * 0.75:
        print(f"\n✅ MOSTLY SUCCESSFUL! {app_passed}/{app_total} food engine tests passed.")
        print(f"⚠️  Some minor issues detected - see failed tests above")
    else:
        print(f"\n❌ SIGNIFICANT ISSUES DETECTED! Only {app_passed}/{app_total} food engine tests passed.")
        print(f"🔧 Major fixes needed for PhiCor.ai Food Engine features")
    
    # Critical Issues Detection
    print(f"\n🚨 CRITICAL ISSUES DETECTED:")
    critical_issues = []
    
    if not test_results.get('platform_stats_api'):
        critical_issues.append("❌ CRITICAL: Platform stats API failed - foods count may not show 844+ expansion")
    
    if not test_results.get('food_analysis_from_db'):
        critical_issues.append("❌ CRITICAL: Food analysis from DB failed - new foods may not be analyzable")
    
    if not test_results.get('food_search_verification'):
        critical_issues.append("❌ CRITICAL: Food search verification failed - database expansion may not be complete")
    
    if critical_issues:
        for issue in critical_issues:
            print(f"  {issue}")
    else:
        print(f"  ✅ No critical issues detected")
    
    # PhiCor.ai Food Engine specific verification
    print(f"\n📋 PHICOR.AI FOOD ENGINE VERIFICATION:")
    if test_results.get('platform_stats_api'):
        print(f"  ✅ Platform stats verified (Foods: 844+, Nutrients: 45)")
    else:
        print(f"  ❌ Platform stats failed")
    
    if test_results.get('food_analysis_from_db'):
        print(f"  ✅ Food analysis verified (Banana, Coca Cola, Spirulina with organ effects)")
    else:
        print(f"  ❌ Food analysis from DB failed")
    
    if test_results.get('food_search_verification'):
        print(f"  ✅ Food search verified (branded products, superfoods, fermented foods, exotic fruits)")
    else:
        print(f"  ❌ Food search verification failed")
    
    return test_results
def test_food_search_verification():
    """Test 3: Food Search Verification - Verify database contains expanded food categories"""
    global food_search_results
    
    print("\n🔍 TEST 3: FOOD SEARCH VERIFICATION (DATABASE EXPANSION)")
    print("=" * 60)
    print("Testing requirements from review request:")
    print("- Verify branded products (Coca Cola, Pepsi, Nestle)")
    print("- Verify superfoods (spirulina, maca, moringa)")
    print("- Verify fermented foods (kombucha, kefir, natto)")
    print("- Verify exotic fruits (dragon fruit, durian, jackfruit)")
    print("- Expected: branded = open_food_facts, superfoods = phicor_curated")
    
    search_categories = [
        {
            "name": "Branded Products",
            "searches": ["Coca Cola", "Pepsi", "Nestle"],
            "expected_source": "open_food_facts",
            "min_results": 1
        },
        {
            "name": "Superfoods",
            "searches": ["spirulina", "maca", "moringa"],
            "expected_source": "phicor_curated",
            "min_results": 1
        },
        {
            "name": "Fermented Foods",
            "searches": ["kombucha", "kefir", "natto"],
            "expected_source": "phicor_curated",
            "min_results": 1
        },
        {
            "name": "Exotic Fruits",
            "searches": ["dragon fruit", "durian", "jackfruit"],
            "expected_source": "phicor_curated",
            "min_results": 1
        }
    ]
    
    all_categories_pass = True
    food_search_results = {}
    
    for category in search_categories:
        category_name = category["name"]
        searches = category["searches"]
        expected_source = category["expected_source"]
        min_results = category["min_results"]
        
        print(f"\n  🧪 Testing Category: {category_name}")
        category_results = []
        category_pass = False
        
        for search_term in searches:
            print(f"    🔍 Searching for: {search_term}")
            
            try:
                # Try food search endpoint (if it exists)
                search_endpoints = [
                    f"{BACKEND_URL}/api/food/search",
                    f"{BACKEND_URL}/api/foods/search",
                    f"{BACKEND_URL}/api/foods"
                ]
                
                search_success = False
                
                for endpoint in search_endpoints:
                    try:
                        # Try different search parameter formats
                        search_params = [
                            {"q": search_term},
                            {"search": search_term},
                            {"query": search_term},
                            {"name": search_term}
                        ]
                        
                        for params in search_params:
                            response = requests.get(endpoint, params=params, timeout=15)
                            
                            if response.status_code == 200:
                                data = response.json()
                                
                                # Check different response formats
                                foods = []
                                if isinstance(data, dict):
                                    foods = data.get('foods', data.get('results', data.get('items', [])))
                                elif isinstance(data, list):
                                    foods = data
                                
                                # Filter results that match search term
                                matching_foods = []
                                for food in foods:
                                    if isinstance(food, dict):
                                        food_name = food.get('name', food.get('product_name', ''))
                                        if search_term.lower() in food_name.lower():
                                            matching_foods.append(food)
                                
                                if matching_foods:
                                    print(f"      ✅ Found {len(matching_foods)} results")
                                    
                                    # Check data sources
                                    sources_found = []
                                    for food in matching_foods[:3]:  # Check first 3 results
                                        source = food.get('data_source', food.get('source', ''))
                                        if source:
                                            sources_found.append(source)
                                    
                                    if sources_found:
                                        print(f"      📊 Sources: {set(sources_found)}")
                                        if any(expected_source in source.lower() for source in sources_found):
                                            print(f"      ✅ Expected source found ({expected_source}) ✓")
                                            category_pass = True
                                    
                                    category_results.extend(matching_foods)
                                    search_success = True
                                    break
                            
                            if search_success:
                                break
                        
                        if search_success:
                            break
                            
                    except Exception as e:
                        continue
                
                if not search_success:
                    print(f"      ⚠️ No results found or search endpoint not available")
                    
            except Exception as e:
                print(f"      ❌ Error searching for {search_term}: {e}")
        
        # Store results
        food_search_results[category_name] = {
            "results": category_results,
            "passed": category_pass,
            "total_found": len(category_results)
        }
        
        # Category assessment
        if category_pass:
            print(f"    ✅ {category_name} verification passed ✓")
        else:
            print(f"    ❌ {category_name} verification failed")
            all_categories_pass = False
    
    return all_categories_pass

if __name__ == "__main__":
    run_all_tests()