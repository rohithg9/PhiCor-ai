#!/usr/bin/env python3
"""
Quick test for PhiCor.ai clinical analysis and synthesis endpoints
"""

import requests
import json

# Get the backend URL from frontend .env
BACKEND_URL = "https://aimeddiagnosis.preview.emergentagent.com"

def test_clinical_interpret():
    """Test POST /api/clinical/interpret"""
    print("🔬 Testing PhiCor Clinical Interpret Endpoint")
    print("=" * 50)
    
    request_data = {
        "text": "55 year old male with chest pain, shortness of breath. BP 140/90, HR 110, SpO2 92%. Troponin elevated. BNP 1500.",
        "region": "US"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/clinical/interpret",
            json=request_data,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            success = data.get('success', False)
            findings = data.get('findings', [])
            differentials = data.get('differentials', [])
            
            print(f"✅ Status: {response.status_code}")
            print(f"✅ Success: {success}")
            print(f"✅ Findings: {len(findings)} items")
            print(f"✅ Differentials: {len(differentials)} items")
            
            if differentials:
                print("Top 3 differentials:")
                for i, diff in enumerate(differentials[:3]):
                    name = diff.get('name', 'Unknown')
                    prob = diff.get('probability', 0)
                    print(f"  {i+1}. {name} ({prob}%)")
            
            return success and len(findings) > 0 and len(differentials) > 0
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_synthesis():
    """Test POST /api/diagnosis/synthesize"""
    print("\n🧬 Testing PhiCor Synthesis Endpoint")
    print("=" * 50)
    
    request_data = {
        "clinical_text": "55 year old male with chest pain and dyspnea",
        "lab_findings": [{"name": "Troponin", "value": "elevated", "direction": "increase"}],
        "imaging_findings": [],
        "symptoms": [
            {"name": "chest pain", "severity": "moderate"}, 
            {"name": "shortness of breath", "severity": "moderate"}
        ],
        "patient_info": None
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/diagnosis/synthesize",
            json=request_data,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            synthesis = data.get('synthesis', {})
            knowledge_base = synthesis.get('knowledge_base', {})
            diseases_referenced = knowledge_base.get('diseases_referenced', 0)
            drugs_referenced = knowledge_base.get('drugs_referenced', 0)
            database_diseases = knowledge_base.get('database_diseases', [])
            
            print(f"✅ Status: {response.status_code}")
            print(f"✅ Diseases referenced: {diseases_referenced}")
            print(f"✅ Drugs referenced: {drugs_referenced}")
            print(f"✅ Database diseases: {len(database_diseases)} items")
            
            if database_diseases:
                print("Sample diseases:")
                for i, disease in enumerate(database_diseases[:3]):
                    name = disease.get('name', 'Unknown')
                    print(f"  - {name}")
            
            # Test with numeric value
            print("\nTesting with numeric value...")
            request_data_numeric = request_data.copy()
            request_data_numeric["lab_findings"] = [{"name": "Troponin", "value": 2.5, "direction": "increase"}]
            
            response_numeric = requests.post(
                f"{BACKEND_URL}/api/diagnosis/synthesize",
                json=request_data_numeric,
                timeout=30
            )
            
            numeric_success = response_numeric.status_code == 200
            print(f"✅ Numeric value test: {'PASS' if numeric_success else 'FAIL'}")
            
            return (diseases_referenced > 0 and 
                   drugs_referenced > 0 and 
                   len(database_diseases) > 0 and 
                   numeric_success)
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 PHICOR.AI ENDPOINT TESTING")
    print("=" * 60)
    
    interpret_pass = test_clinical_interpret()
    synthesis_pass = test_synthesis()
    
    print("\n" + "=" * 60)
    print("📊 RESULTS:")
    print(f"Clinical Interpret: {'✅ PASS' if interpret_pass else '❌ FAIL'}")
    print(f"Synthesis: {'✅ PASS' if synthesis_pass else '❌ FAIL'}")
    
    if interpret_pass and synthesis_pass:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Clinical interpret endpoint working correctly")
        print("✅ Synthesis endpoint working correctly")
        print("✅ '0 diseases referenced / 0 drugs matched' bug FIXED")
    else:
        print("\n❌ SOME TESTS FAILED")
        if not interpret_pass:
            print("❌ Clinical interpret endpoint has issues")
        if not synthesis_pass:
            print("❌ Synthesis endpoint has issues")