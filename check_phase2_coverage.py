#!/usr/bin/env python3
"""
Check Phase 2 comprehensive_model structure coverage
"""

import requests
import json

def check_phase2_coverage():
    # Get token
    login_data = {'email': 'admin@phicor.ai', 'password': 'admin123'}
    response = requests.post('https://aimeddiagnosis.preview.emergentagent.com/api/auth/login', json=login_data)
    token = response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # Get diseases list
    response = requests.get('https://aimeddiagnosis.preview.emergentagent.com/api/diseases-db/list', headers=headers)
    diseases = response.json()['diseases']

    print(f'Total diseases: {len(diseases)}')

    # Check structure of a larger sample
    sample_size = 100
    new_structure_count = 0
    old_structure_count = 0
    error_count = 0

    required_sections = ['clinicalPresentation', 'diagnosticWorkup', 'treatment', 'prognosis', 'monitoring']

    for i, disease in enumerate(diseases[:sample_size]):
        disease_id = disease['id']
        try:
            response = requests.get(f'https://aimeddiagnosis.preview.emergentagent.com/api/diseases-db/{disease_id}', headers=headers, timeout=5)
            if response.status_code == 200:
                data = response.json()
                comprehensive_model = data.get('comprehensive_model', {})
                
                # Check if it has the new structure
                has_new_structure = all(key in comprehensive_model for key in required_sections)
                
                if has_new_structure:
                    new_structure_count += 1
                else:
                    old_structure_count += 1
                    # Check what's missing
                    missing = [key for key in required_sections if key not in comprehensive_model]
                    present = [key for key in required_sections if key in comprehensive_model]
                    print(f'{disease_id}: Missing {missing}, Has {present}')
            else:
                error_count += 1
        except Exception as e:
            error_count += 1
            print(f'Error with {disease_id}: {e}')
        
        if (i + 1) % 20 == 0:
            print(f'Progress: {i + 1}/{sample_size}')

    print(f'\nResults from sample of {sample_size}:')
    print(f'New structure (Phase 2 complete): {new_structure_count} ({new_structure_count/sample_size*100:.1f}%)')
    print(f'Old structure (Phase 2 incomplete): {old_structure_count} ({old_structure_count/sample_size*100:.1f}%)')
    print(f'Errors: {error_count}')
    
    # Estimate for full dataset
    estimated_new = int(new_structure_count / sample_size * len(diseases))
    estimated_old = int(old_structure_count / sample_size * len(diseases))
    
    print(f'\nEstimated for full dataset ({len(diseases)} diseases):')
    print(f'Phase 2 complete: ~{estimated_new} diseases')
    print(f'Phase 2 incomplete: ~{estimated_old} diseases')

if __name__ == "__main__":
    check_phase2_coverage()