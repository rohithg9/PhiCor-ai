#!/usr/bin/env python3
"""
Script to generate comprehensive DNA/genetic data for oncology diseases.
Uses OpenAI to generate medically accurate genetic mutation profiles.
"""

import asyncio
import os
import json
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from openai import OpenAI

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Lung cancer specific genetic data
LUNG_CANCER_GENETICS = {
    "nsclc_adenocarcinoma": {
        "dna": {
            "egfr_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 10-35% of NSCLC adenocarcinoma, especially Asian patients. Exon 19 deletions and L858R most common."},
            "kras_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 25-30% of adenocarcinomas. G12C most common variant. Associated with smoking."},
            "alk_rearrangement": {"change_percent": 100, "direction": "present", "evidence": "Found in 3-7% of NSCLC. EML4-ALK fusion most common. More frequent in never/light smokers."},
            "ros1_rearrangement": {"change_percent": 100, "direction": "present", "evidence": "Found in 1-2% of NSCLC. Similar to ALK+ tumors. Targetable with crizotinib."},
            "braf_v600e": {"change_percent": 100, "direction": "present", "evidence": "Found in 1-3% of NSCLC. Targetable with dabrafenib/trametinib."},
            "met_amplification": {"change_percent": 100, "direction": "present", "evidence": "Primary in 2-4%, secondary resistance in EGFR-mutant tumors."},
            "ret_rearrangement": {"change_percent": 100, "direction": "present", "evidence": "Found in 1-2% of NSCLC. Targetable with selpercatinib/pralsetinib."},
            "ntrk_fusion": {"change_percent": 100, "direction": "present", "evidence": "Rare (<1%). Targetable with larotrectinib/entrectinib."},
            "her2_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 2-4% of NSCLC. Targetable with trastuzumab deruxtecan."},
            "tp53_mutation": {"change_percent": 100, "direction": "present", "evidence": "Most common mutation in NSCLC (50%+). Associated with worse prognosis."},
            "stk11_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 15-20% of KRAS-mutant tumors. Associated with poor response to immunotherapy."},
            "keap1_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 15-20%. Associated with resistance to chemotherapy and poor outcomes."},
            "tumor_mutation_burden": {"value": "high", "direction": "variable", "evidence": "High TMB (>10 mut/Mb) associated with better immunotherapy response."},
            "pdl1_expression": {"value": "variable", "direction": "biomarker", "evidence": "PD-L1 TPS ≥50% indicates first-line pembrolizumab benefit. TPS 1-49% intermediate."},
            "microsatellite_status": {"value": "MSS", "direction": "stable", "evidence": "Most NSCLC are microsatellite stable. MSI-H rare but indicates immunotherapy benefit."}
        },
        "gene_expression": {
            "egfr_overexpression": {"change_percent": 50, "direction": "increase", "evidence": "EGFR protein overexpression in 40-80% of NSCLC"},
            "vegf_expression": {"change_percent": 80, "direction": "increase", "evidence": "Drives tumor angiogenesis. Target for bevacizumab/ramucirumab."},
            "ttf1_expression": {"change_percent": 85, "direction": "increase", "evidence": "TTF-1 positive in 75-85% of adenocarcinoma. Diagnostic marker."},
            "napsin_a_expression": {"change_percent": 80, "direction": "increase", "evidence": "Positive in 80% of adenocarcinoma. Diagnostic marker."}
        }
    },
    "nsclc_squamous": {
        "dna": {
            "tp53_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in >80% of squamous cell carcinoma. Most common mutation."},
            "pik3ca_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 15-20% of squamous NSCLC."},
            "fgfr1_amplification": {"change_percent": 100, "direction": "present", "evidence": "Found in 15-25% of squamous NSCLC. Potential therapeutic target."},
            "sox2_amplification": {"change_percent": 100, "direction": "present", "evidence": "Found in 20% of squamous NSCLC. Lineage marker."},
            "pten_loss": {"change_percent": 100, "direction": "present", "evidence": "Found in 10-15%. Associated with PI3K pathway activation."},
            "cdkn2a_loss": {"change_percent": 100, "direction": "present", "evidence": "Found in 15-25%. Cell cycle dysregulation."},
            "pdl1_amplification": {"change_percent": 100, "direction": "present", "evidence": "9p24.1 amplification in 5-10%. Strong immunotherapy predictor."},
            "tumor_mutation_burden": {"value": "high", "direction": "increase", "evidence": "Generally higher TMB than adenocarcinoma. Better immunotherapy response."}
        },
        "gene_expression": {
            "p40_expression": {"change_percent": 95, "direction": "increase", "evidence": "P40 (ΔNp63) positive in >95% of squamous carcinoma. Key diagnostic marker."},
            "ck5_6_expression": {"change_percent": 90, "direction": "increase", "evidence": "CK5/6 positive in 90%+ of squamous carcinoma."},
            "ttf1_expression": {"change_percent": 10, "direction": "decrease", "evidence": "TTF-1 usually negative in squamous (helps differentiate from adeno)."}
        }
    },
    "small_cell_lung_cancer": {
        "dna": {
            "tp53_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in >90% of SCLC. Universal hallmark."},
            "rb1_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in >90% of SCLC. Loss of cell cycle control."},
            "notch_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 25% of SCLC. Neuroendocrine differentiation."},
            "myc_amplification": {"change_percent": 100, "direction": "present", "evidence": "MYC family amplification in 20-30%. Aggressive biology."},
            "pten_loss": {"change_percent": 100, "direction": "present", "evidence": "Found in 10-15%. PI3K pathway activation."},
            "tumor_mutation_burden": {"value": "high", "direction": "increase", "evidence": "SCLC has high TMB due to smoking etiology. Limited immunotherapy benefit."},
            "dll3_expression": {"value": "high", "direction": "increase", "evidence": "DLL3 expressed in 80%+ of SCLC. Target for rovalpituzumab."}
        },
        "gene_expression": {
            "synaptophysin": {"change_percent": 95, "direction": "increase", "evidence": "Neuroendocrine marker. Diagnostic."},
            "chromogranin_a": {"change_percent": 90, "direction": "increase", "evidence": "Neuroendocrine marker."},
            "cd56_expression": {"change_percent": 95, "direction": "increase", "evidence": "NCAM. Key diagnostic marker for SCLC."},
            "ttf1_expression": {"change_percent": 85, "direction": "increase", "evidence": "TTF-1 positive in 85% of SCLC."}
        }
    }
}

# Colorectal cancer genetics
COLORECTAL_CANCER_GENETICS = {
    "colorectal_cancer": {
        "dna": {
            "apc_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 70-80% of sporadic CRC. Initiating event in adenoma-carcinoma sequence."},
            "kras_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 40-50% of CRC. G12D, G12V, G13D most common. Predicts anti-EGFR resistance."},
            "braf_v600e": {"change_percent": 100, "direction": "present", "evidence": "Found in 8-10% of CRC. Associated with MSI-H, right-sided tumors, poor prognosis."},
            "tp53_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 50-60% of CRC. Late event in tumorigenesis."},
            "pik3ca_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 15-20% of CRC. May predict aspirin benefit."},
            "nras_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 3-5% of CRC. Predicts anti-EGFR resistance."},
            "her2_amplification": {"change_percent": 100, "direction": "present", "evidence": "Found in 2-3% of CRC. Targetable with trastuzumab combinations."},
            "microsatellite_instability": {"value": "variable", "direction": "biomarker", "evidence": "MSI-H in 15% of CRC. Lynch syndrome or sporadic. Excellent immunotherapy response."},
            "mlh1_methylation": {"change_percent": 100, "direction": "present", "evidence": "Causes sporadic MSI-H. Associated with BRAF V600E."},
            "smad4_loss": {"change_percent": 100, "direction": "present", "evidence": "Found in 10-15%. Associated with metastatic disease."},
            "tumor_mutation_burden": {"value": "variable", "direction": "biomarker", "evidence": "MSI-H tumors have high TMB. MSS tumors have low TMB."}
        },
        "gene_expression": {
            "egfr_overexpression": {"change_percent": 60, "direction": "increase", "evidence": "EGFR overexpressed in 60-80% of CRC."},
            "vegf_expression": {"change_percent": 70, "direction": "increase", "evidence": "Drives angiogenesis. Target for bevacizumab."},
            "cdx2_expression": {"change_percent": 90, "direction": "increase", "evidence": "CDX2 positive in 90%+ of CRC. Diagnostic marker. Loss = poor prognosis."},
            "ck20_expression": {"change_percent": 85, "direction": "increase", "evidence": "CK20 positive in colorectal origin. Diagnostic."},
            "ck7_expression": {"change_percent": 20, "direction": "decrease", "evidence": "CK7 usually negative (CK20+/CK7- pattern)."}
        }
    }
}

# Breast cancer genetics  
BREAST_CANCER_GENETICS = {
    "breast_cancer": {
        "dna": {
            "brca1_mutation": {"change_percent": 100, "direction": "present", "evidence": "Germline in 5-10% of breast cancer. High-grade, triple-negative phenotype. PARP inhibitor sensitive."},
            "brca2_mutation": {"change_percent": 100, "direction": "present", "evidence": "Germline in 5-10%. ER+ more common than BRCA1. PARP inhibitor sensitive."},
            "pik3ca_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 30-40% of ER+ breast cancer. Targetable with alpelisib."},
            "tp53_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 20-30% overall, 80% in triple-negative. Poor prognosis."},
            "her2_amplification": {"change_percent": 100, "direction": "present", "evidence": "Found in 15-20% of breast cancer. Targetable with trastuzumab, pertuzumab, T-DXd."},
            "esr1_mutation": {"change_percent": 100, "direction": "present", "evidence": "Acquired in 20-40% of metastatic ER+ after AI therapy. Endocrine resistance."},
            "cdk4_amplification": {"change_percent": 100, "direction": "present", "evidence": "Supports CDK4/6 inhibitor sensitivity."},
            "fgfr1_amplification": {"change_percent": 100, "direction": "present", "evidence": "Found in 10-15% of ER+ breast cancer. Endocrine resistance mechanism."},
            "akt1_mutation": {"change_percent": 100, "direction": "present", "evidence": "Found in 5-7% of ER+ breast cancer. PI3K pathway activation."},
            "palb2_mutation": {"change_percent": 100, "direction": "present", "evidence": "Germline in 1-2%. Moderate-high breast cancer risk. PARP inhibitor sensitive."}
        },
        "gene_expression": {
            "er_expression": {"change_percent": 70, "direction": "variable", "evidence": "ER positive in 70-75% of breast cancer. Determines endocrine therapy eligibility."},
            "pr_expression": {"change_percent": 65, "direction": "variable", "evidence": "PR positive in 65% of ER+ tumors. Loss may indicate worse prognosis."},
            "her2_overexpression": {"change_percent": 20, "direction": "variable", "evidence": "HER2 3+ or FISH+ in 15-20%. Key therapeutic target."},
            "ki67_expression": {"change_percent": 30, "direction": "variable", "evidence": "Ki-67 index. <20% low, ≥20% high proliferation. Prognostic."},
            "oncotype_dx": {"value": "recurrence_score", "direction": "biomarker", "evidence": "21-gene assay. RS <26 low risk, benefits from endocrine alone."},
            "mammaprint": {"value": "70_gene_signature", "direction": "biomarker", "evidence": "70-gene assay for recurrence risk stratification."}
        }
    }
}

async def update_oncology_genetics():
    """Update oncology diseases with comprehensive genetic data."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    diseases_collection = db.diseases
    
    print(f"Connected to MongoDB: {DB_NAME}")
    
    # Update lung cancer diseases
    lung_keywords = ['lung cancer', 'nsclc', 'adenocarcinoma', 'squamous cell lung', 'small cell']
    
    updated = 0
    
    # Find and update lung cancer diseases
    async for disease in diseases_collection.find({
        '$or': [
            {'name': {'$regex': 'lung.*cancer', '$options': 'i'}},
            {'name': {'$regex': 'nsclc', '$options': 'i'}},
            {'name': {'$regex': 'small cell', '$options': 'i'}},
            {'icd10_code': {'$regex': '^C34', '$options': 'i'}}
        ]
    }):
        name = disease.get('name', '').lower()
        mods = disease.get('parameter_modifications', {}) or {}
        
        # Determine which genetic template to use
        if 'small cell' in name or 'sclc' in name:
            genetics = LUNG_CANCER_GENETICS['small_cell_lung_cancer']
        elif 'squamous' in name:
            genetics = LUNG_CANCER_GENETICS['nsclc_squamous']
        else:
            genetics = LUNG_CANCER_GENETICS['nsclc_adenocarcinoma']
        
        # Add genetic data to cellular organ
        if 'cellular' not in mods:
            mods['cellular'] = {}
        
        mods['cellular']['dna'] = genetics['dna']
        mods['cellular']['gene_expression'] = genetics['gene_expression']
        
        await diseases_collection.update_one(
            {'_id': disease['_id']},
            {'$set': {
                'parameter_modifications': mods,
                'genetic_data_enhanced': True,
                'genetic_data_enhanced_at': datetime.utcnow().isoformat()
            }}
        )
        updated += 1
        print(f"  Updated: {disease.get('name')}")
    
    # Update colorectal cancer
    async for disease in diseases_collection.find({
        '$or': [
            {'name': {'$regex': 'colorectal', '$options': 'i'}},
            {'name': {'$regex': 'colon cancer', '$options': 'i'}},
            {'name': {'$regex': 'rectal cancer', '$options': 'i'}},
            {'icd10_code': {'$regex': '^C18|^C19|^C20', '$options': 'i'}}
        ]
    }):
        mods = disease.get('parameter_modifications', {}) or {}
        genetics = COLORECTAL_CANCER_GENETICS['colorectal_cancer']
        
        if 'cellular' not in mods:
            mods['cellular'] = {}
        
        mods['cellular']['dna'] = genetics['dna']
        mods['cellular']['gene_expression'] = genetics['gene_expression']
        
        await diseases_collection.update_one(
            {'_id': disease['_id']},
            {'$set': {
                'parameter_modifications': mods,
                'genetic_data_enhanced': True,
                'genetic_data_enhanced_at': datetime.utcnow().isoformat()
            }}
        )
        updated += 1
        print(f"  Updated: {disease.get('name')}")
    
    # Update breast cancer
    async for disease in diseases_collection.find({
        '$or': [
            {'name': {'$regex': 'breast.*cancer', '$options': 'i'}},
            {'icd10_code': {'$regex': '^C50', '$options': 'i'}}
        ]
    }):
        mods = disease.get('parameter_modifications', {}) or {}
        genetics = BREAST_CANCER_GENETICS['breast_cancer']
        
        if 'cellular' not in mods:
            mods['cellular'] = {}
        
        mods['cellular']['dna'] = genetics['dna']
        mods['cellular']['gene_expression'] = genetics['gene_expression']
        
        await diseases_collection.update_one(
            {'_id': disease['_id']},
            {'$set': {
                'parameter_modifications': mods,
                'genetic_data_enhanced': True,
                'genetic_data_enhanced_at': datetime.utcnow().isoformat()
            }}
        )
        updated += 1
        print(f"  Updated: {disease.get('name')}")
    
    print(f"\n=== Oncology Genetics Enhancement Complete ===")
    print(f"Updated: {updated} diseases")
    
    client.close()
    return updated


if __name__ == "__main__":
    asyncio.run(update_oncology_genetics())
