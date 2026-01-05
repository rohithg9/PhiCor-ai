#!/usr/bin/env python3
"""
Debug script for PhiCor Clinical Analysis
"""

import requests
import json

# Get backend URL
BACKEND_URL = "https://phicor-ai.preview.emergentagent.com"

def test_clinical_analysis():
    """Test the clinical analysis endpoint with detailed debugging"""
    
    test_clinical_text = "55 year old male with fever 102F, cough, shortness of breath, SpO2 92%, WBC 15000, CRP elevated. PMH: T2DM, HTN. Echo shows EF 35%."
    
    request_data = {
        "text": test_clinical_text,
        "region": "US"
    }
    
    print(f"🔬 Testing PhiCor Clinical Analysis")
    print(f"📝 Clinical text: {test_clinical_text}")
    print(f"🌍 Region: US")
    print(f"🔗 URL: {BACKEND_URL}/api/clinical/interpret")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/clinical/interpret",
            json=request_data,
            timeout=30
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\n✅ SUCCESS: {data.get('success', False)}")
            
            # Check findings in detail
            findings = data.get('findings', [])
            print(f"\n🔍 FINDINGS ({len(findings)} items):")
            if findings:
                for i, finding in enumerate(findings):
                    print(f"  {i+1}. {finding}")
            else:
                print("  ❌ No findings extracted")
            
            # Check symptoms
            symptoms = data.get('symptoms', [])
            print(f"\n🤒 SYMPTOMS ({len(symptoms)} items):")
            for symptom in symptoms:
                print(f"  - {symptom}")
            
            # Check dominant syndromes
            syndromes = data.get('dominant_syndromes', [])
            print(f"\n🎯 DOMINANT SYNDROMES ({len(syndromes)} items):")
            for syndrome in syndromes:
                print(f"  - {syndrome}")
            
            # Check differentials
            differentials = data.get('differentials', [])
            print(f"\n🏥 DIFFERENTIALS ({len(differentials)} items):")
            for i, diff in enumerate(differentials[:5]):
                name = diff.get('name', 'Unknown')
                prob = diff.get('probability', 0)
                role = diff.get('role', 'Unknown')
                print(f"  {i+1}. {name} ({prob}%, {role})")
            
            # Check synthesis
            synthesis = data.get('synthesis', {})
            print(f"\n🧠 SYNTHESIS:")
            print(f"  Primary: {synthesis.get('primary_diagnosis', 'None')}")
            print(f"  Alternative: {synthesis.get('key_alternative', 'None')}")
            
            disc_tests = synthesis.get('discriminating_tests', [])
            print(f"  Discriminating tests ({len(disc_tests)} items):")
            for test in disc_tests[:3]:
                if isinstance(test, dict):
                    print(f"    - {test.get('test', test)}")
                else:
                    print(f"    - {test}")
            
            # Check management
            management = data.get('management', [])
            print(f"\n💊 MANAGEMENT ({len(management)} items):")
            for mgmt in management[:3]:
                diagnosis = mgmt.get('diagnosis', 'Unknown')
                approaches = mgmt.get('approaches', [])
                print(f"  {diagnosis}: {len(approaches)} approaches")
            
            # Check data source
            data_source = data.get('data_source', 'Unknown')
            print(f"\n📚 DATA SOURCE: {data_source}")
            
            # Check confidence
            confidence = data.get('confidence', 0)
            print(f"📈 CONFIDENCE: {confidence:.2%}")
            
            # Summary
            summary = data.get('summary', '')
            print(f"\n📋 SUMMARY: {summary}")
            
            return True
        else:
            print(f"❌ Request failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {error_data}")
            except:
                print(f"Response text: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_clinical_analysis()