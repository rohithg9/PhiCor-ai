"""
MEDIQ Clinical Interaction Knowledge Base

This module contains validated clinical drug interaction data,
patient risk assessments, and monitoring requirements.

DISCLAIMER: This data is for reference only. It is NOT intended 
for clinical decision-making without professional oversight.
All interactions must be verified against current clinical references.
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class Severity(Enum):
    CONTRAINDICATED = "contraindicated"  # Never use together
    SEVERE = "severe"                     # High risk, avoid if possible
    MAJOR = "major"                       # Significant risk, close monitoring
    MODERATE = "moderate"                 # Monitor, may need adjustment
    MINOR = "minor"                       # Low risk, be aware
    UNKNOWN = "unknown"                   # Insufficient data

class EvidenceLevel(Enum):
    ESTABLISHED = "established"   # Well-documented, multiple sources
    PROBABLE = "probable"         # Strong evidence, widely accepted
    SUSPECTED = "suspected"       # Theoretical or limited evidence
    POSSIBLE = "possible"         # Case reports only
    UNKNOWN = "unknown"

@dataclass
class DrugInteraction:
    drug1: str
    drug2: str
    severity: Severity
    mechanism: str
    clinical_effect: str
    management: str
    monitoring: List[str]
    evidence_level: EvidenceLevel
    evidence_source: str
    patient_factors: List[str]  # Factors that increase risk

# Comprehensive Drug Interaction Database
# Based on BNF, FDA labels, and clinical pharmacology references
DRUG_INTERACTIONS: List[DrugInteraction] = [
    # ============================================
    # WARFARIN INTERACTIONS (Anticoagulant)
    # ============================================
    DrugInteraction(
        drug1="warfarin",
        drug2="aspirin",
        severity=Severity.MAJOR,
        mechanism="Dual antiplatelet/anticoagulant effect; aspirin inhibits platelet aggregation while warfarin inhibits clotting factors",
        clinical_effect="Significantly increased risk of bleeding, including GI and intracranial hemorrhage",
        management="Avoid combination if possible. If essential, use lowest effective aspirin dose (75-81mg). Monitor INR frequently. Consider PPI for GI protection.",
        monitoring=["INR every 1-2 weeks initially", "Signs of bleeding", "Hemoglobin/hematocrit"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="BNF, FDA labeling, multiple RCTs",
        patient_factors=["Previous GI bleed", "Age >65", "Renal impairment", "Concurrent NSAIDs"]
    ),
    DrugInteraction(
        drug1="warfarin",
        drug2="ibuprofen",
        severity=Severity.SEVERE,
        mechanism="NSAIDs inhibit COX-1, reducing protective prostaglandins in GI mucosa; also impair platelet function",
        clinical_effect="3-6 fold increased risk of GI hemorrhage. Also risk of acute kidney injury.",
        management="AVOID COMBINATION. Use paracetamol for pain. If NSAID essential, use shortest duration with PPI cover.",
        monitoring=["Signs of GI bleeding", "INR", "Renal function", "Blood pressure"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="BNF, NICE guidance, FDA black box warning",
        patient_factors=["Previous gastric ulcer", "Age >65", "CKD", "Heart failure", "H. pylori"]
    ),
    DrugInteraction(
        drug1="warfarin",
        drug2="amiodarone",
        severity=Severity.MAJOR,
        mechanism="Amiodarone inhibits CYP2C9 and CYP3A4, reducing warfarin metabolism. Effect persists for weeks after amiodarone stopped.",
        clinical_effect="INR increase of 30-50%. Bleeding risk significantly elevated.",
        management="Reduce warfarin dose by 30-50% when starting amiodarone. Monitor INR at least weekly for first month, then monthly.",
        monitoring=["INR weekly x 4 weeks, then every 2 weeks", "Signs of bleeding", "Monitor for weeks after stopping amiodarone"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="Product labeling, pharmacokinetic studies",
        patient_factors=["Elderly", "Low body weight", "Hepatic impairment"]
    ),
    DrugInteraction(
        drug1="warfarin",
        drug2="clarithromycin",
        severity=Severity.MAJOR,
        mechanism="Clarithromycin inhibits CYP3A4 and possibly CYP2C9, reducing warfarin clearance",
        clinical_effect="INR elevation, increased bleeding risk. Effect can be rapid (2-3 days).",
        management="Consider alternative antibiotic (azithromycin has less interaction). If clarithromycin essential, monitor INR at day 3-5 and adjust warfarin.",
        monitoring=["INR at baseline, day 3-5, and end of course", "Signs of bleeding"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="Multiple case reports, pharmacokinetic studies",
        patient_factors=["Concurrent other CYP inhibitors", "Hepatic impairment"]
    ),
    
    # ============================================
    # POTASSIUM / HYPERKALEMIA INTERACTIONS
    # ============================================
    DrugInteraction(
        drug1="spironolactone",
        drug2="potassium chloride",
        severity=Severity.CONTRAINDICATED,
        mechanism="Spironolactone is a potassium-sparing diuretic that blocks aldosterone, reducing potassium excretion. Adding potassium supplements causes additive hyperkalemia.",
        clinical_effect="Life-threatening hyperkalemia. Risk of cardiac arrhythmias, cardiac arrest.",
        management="CONTRAINDICATED. Do not give potassium supplements with spironolactone unless severe hypokalemia documented and specialist supervision.",
        monitoring=["Serum potassium before starting and 1 week after", "ECG if K+ >5.5", "Renal function"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="BNF contraindication, product labeling",
        patient_factors=["CKD", "Diabetes", "Age >65", "ACE inhibitor/ARB use", "Baseline K+ >5.0"]
    ),
    DrugInteraction(
        drug1="ramipril",
        drug2="potassium chloride",
        severity=Severity.MAJOR,
        mechanism="ACE inhibitors reduce aldosterone, causing potassium retention. Potassium supplements add to this effect.",
        clinical_effect="Hyperkalemia risk, especially in renal impairment",
        management="Avoid potassium supplements unless documented hypokalemia. If essential, start low dose with close monitoring.",
        monitoring=["Serum potassium at baseline, 1 week, then regularly", "Renal function", "ECG if K+ elevated"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="BNF, product labeling",
        patient_factors=["CKD (especially eGFR <45)", "Diabetes", "Heart failure", "Concurrent potassium-sparing diuretic"]
    ),
    DrugInteraction(
        drug1="ramipril",
        drug2="spironolactone",
        severity=Severity.MAJOR,
        mechanism="Both drugs independently cause potassium retention through different mechanisms (ACE inhibition + aldosterone blockade)",
        clinical_effect="Significantly increased hyperkalemia risk. Studies show up to 10% incidence of K+ >6.0 in combination.",
        management="Combination often used in heart failure but requires close monitoring. Start spironolactone at low dose (12.5-25mg). Check K+ at 1 week, 4 weeks, then 3-monthly.",
        monitoring=["Potassium at baseline, 1 week, 4 weeks, then 3-monthly", "Renal function", "Hold if K+ >5.5"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="RALES trial, BNF",
        patient_factors=["CKD", "Diabetes", "Baseline K+ >5.0", "NSAIDs", "Volume depletion"]
    ),
    DrugInteraction(
        drug1="ibuprofen",
        drug2="ramipril",
        severity=Severity.MAJOR,
        mechanism="NSAIDs inhibit prostaglandin synthesis, reducing renal blood flow and counteracting ACE inhibitor's renal protective effects",
        clinical_effect="Reduced antihypertensive effect. Increased risk of acute kidney injury. Increased hyperkalemia risk.",
        management="Avoid combination if possible. If essential, use lowest NSAID dose for shortest duration. Monitor BP and renal function.",
        monitoring=["Blood pressure", "Renal function (Cr, eGFR)", "Serum potassium", "Signs of fluid retention"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="BNF, multiple studies",
        patient_factors=["Pre-existing CKD", "Heart failure", "Volume depletion", "Elderly", "Concurrent diuretic"]
    ),
    
    # ============================================
    # STATIN INTERACTIONS
    # ============================================
    DrugInteraction(
        drug1="simvastatin",
        drug2="amiodarone",
        severity=Severity.CONTRAINDICATED,
        mechanism="Amiodarone inhibits CYP3A4, dramatically increasing simvastatin plasma levels (up to 6-fold)",
        clinical_effect="Severe rhabdomyolysis risk. Myopathy. Acute kidney injury from myoglobin.",
        management="CONTRAINDICATED at simvastatin doses >20mg. If combination essential, max simvastatin 20mg daily. Consider pravastatin or rosuvastatin (less CYP3A4 dependent).",
        monitoring=["CK if muscle symptoms", "Renal function", "Patient education on myalgia symptoms"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="FDA warning, BNF",
        patient_factors=["High statin dose", "Elderly", "Renal impairment", "Hypothyroidism", "Multiple interacting drugs"]
    ),
    DrugInteraction(
        drug1="simvastatin",
        drug2="clarithromycin",
        severity=Severity.CONTRAINDICATED,
        mechanism="Clarithromycin is a potent CYP3A4 inhibitor, causing massive increase in simvastatin exposure",
        clinical_effect="Very high rhabdomyolysis risk. Multiple fatalities reported.",
        management="CONTRAINDICATED. Suspend simvastatin during clarithromycin course. Use azithromycin as alternative (no CYP3A4 inhibition) or switch to pravastatin.",
        monitoring=["Hold simvastatin", "CK if muscle symptoms after restarting", "Patient education"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="FDA contraindication, case reports of fatalities",
        patient_factors=["Any dose of simvastatin with clarithromycin is contraindicated"]
    ),
    
    # ============================================
    # NSAID INTERACTIONS
    # ============================================
    DrugInteraction(
        drug1="ibuprofen",
        drug2="aspirin",
        severity=Severity.MAJOR,
        mechanism="Ibuprofen competes with aspirin for COX-1 binding, potentially blocking aspirin's irreversible antiplatelet effect",
        clinical_effect="Reduced cardioprotective effect of aspirin. Increased CV event risk in patients taking aspirin for secondary prevention.",
        management="If both needed, take aspirin 30 minutes BEFORE ibuprofen, or 8+ hours AFTER. Consider paracetamol alternative.",
        monitoring=["Cardiovascular events", "GI bleeding", "Blood pressure"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="FDA advisory, pharmacodynamic studies",
        patient_factors=["Cardiovascular disease", "Previous MI/stroke", "Coronary stents"]
    ),
    DrugInteraction(
        drug1="ibuprofen",
        drug2="spironolactone",
        severity=Severity.MODERATE,
        mechanism="NSAIDs reduce prostaglandin-mediated renal blood flow and may reduce diuretic efficacy",
        clinical_effect="Reduced diuretic effect. Fluid retention. Worsening heart failure. Hyperkalemia risk increased.",
        management="Avoid combination in heart failure. If essential, use lowest NSAID dose, shortest duration.",
        monitoring=["Weight/fluid status", "Blood pressure", "Serum potassium", "Renal function"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="BNF, clinical studies",
        patient_factors=["Heart failure", "Cirrhosis with ascites", "CKD"]
    ),
    
    # ============================================
    # METFORMIN INTERACTIONS
    # ============================================
    DrugInteraction(
        drug1="metformin",
        drug2="ibuprofen",
        severity=Severity.MODERATE,
        mechanism="NSAIDs can impair renal function, reducing metformin clearance and increasing lactic acidosis risk",
        clinical_effect="Increased metformin accumulation. Elevated lactic acidosis risk, especially in CKD.",
        management="Monitor renal function. Avoid in eGFR <30. Use paracetamol for pain where possible.",
        monitoring=["Renal function", "Lactate if symptoms (nausea, abdominal pain, hyperventilation)"],
        evidence_level=EvidenceLevel.PROBABLE,
        evidence_source="Pharmacokinetic reasoning, case reports",
        patient_factors=["CKD", "Heart failure", "Liver disease", "Alcohol use", "Elderly"]
    ),
    
    # ============================================
    # OMEPRAZOLE INTERACTIONS
    # ============================================
    DrugInteraction(
        drug1="omeprazole",
        drug2="clopidogrel",
        severity=Severity.MAJOR,
        mechanism="Omeprazole inhibits CYP2C19, which converts clopidogrel to its active metabolite",
        clinical_effect="Reduced antiplatelet effect of clopidogrel. Potentially increased cardiovascular events.",
        management="Use pantoprazole instead (minimal CYP2C19 inhibition). If omeprazole essential, monitor for ischemic events.",
        monitoring=["Cardiovascular events", "Consider platelet function testing"],
        evidence_level=EvidenceLevel.ESTABLISHED,
        evidence_source="FDA warning, COGENT trial",
        patient_factors=["Recent stent", "ACS", "High CV risk"]
    ),
    
    # ============================================
    # ALLOPURINOL INTERACTIONS
    # ============================================
    DrugInteraction(
        drug1="allopurinol",
        drug2="warfarin",
        severity=Severity.MODERATE,
        mechanism="Allopurinol may inhibit warfarin metabolism, though mechanism not fully established",
        clinical_effect="Possible INR increase. Usually modest effect.",
        management="Monitor INR when starting/stopping allopurinol. Adjust warfarin if needed.",
        monitoring=["INR at baseline, 1-2 weeks after starting", "Signs of bleeding"],
        evidence_level=EvidenceLevel.SUSPECTED,
        evidence_source="Case reports, theoretical",
        patient_factors=["High warfarin dose", "Unstable INR"]
    ),
    DrugInteraction(
        drug1="allopurinol",
        drug2="ramipril",
        severity=Severity.MODERATE,
        mechanism="Both drugs can cause hypersensitivity reactions; combination may increase risk",
        clinical_effect="Possible increased hypersensitivity reaction risk, including Stevens-Johnson syndrome",
        management="Monitor for hypersensitivity, especially in first 3 months. Increased risk in CKD.",
        monitoring=["Skin reactions", "Fever", "Eosinophilia"],
        evidence_level=EvidenceLevel.SUSPECTED,
        evidence_source="Case reports, pharmacovigilance data",
        patient_factors=["CKD", "Previous drug hypersensitivity", "HLA-B*5801 positive (Asian populations)"]
    ),
]

# Drug name mappings (brand to generic)
BRAND_TO_GENERIC = {
    # Metformin
    "glucophage": "metformin",
    "glucophage xr": "metformin",
    "fortamet": "metformin",
    "glumetza": "metformin",
    "riomet": "metformin",
    # Ramipril
    "triatec": "ramipril",
    "tritace": "ramipril",
    "altace": "ramipril",
    # Spironolactone
    "aldactone": "spironolactone",
    # Potassium
    "slow-k": "potassium chloride",
    "k-dur": "potassium chloride",
    "klor-con": "potassium chloride",
    "k-tab": "potassium chloride",
    # Ibuprofen
    "brufen": "ibuprofen",
    "advil": "ibuprofen",
    "motrin": "ibuprofen",
    "nurofen": "ibuprofen",
    # Warfarin
    "coumadin": "warfarin",
    "jantoven": "warfarin",
    "marevan": "warfarin",
    # Amiodarone
    "cordarone": "amiodarone",
    "pacerone": "amiodarone",
    # Simvastatin
    "zocor": "simvastatin",
    # Clarithromycin
    "klacid": "clarithromycin",
    "biaxin": "clarithromycin",
    "klaricid": "clarithromycin",
    # Omeprazole
    "losec": "omeprazole",
    "prilosec": "omeprazole",
    # Allopurinol
    "zyloric": "allopurinol",
    "zyloprim": "allopurinol",
    "aloprim": "allopurinol",
    # Aspirin
    "ecosprin": "aspirin",
    "disprin": "aspirin",
    "bayer": "aspirin",
    # Lisinopril
    "prinivil": "lisinopril",
    "zestril": "lisinopril",
    # Enalapril
    "vasotec": "enalapril",
    "renitec": "enalapril",
    # Atorvastatin
    "lipitor": "atorvastatin",
    # Rosuvastatin
    "crestor": "rosuvastatin",
    # Pravastatin
    "pravachol": "pravastatin",
    # Amlodipine
    "norvasc": "amlodipine",
    # Losartan
    "cozaar": "losartan",
    # Valsartan
    "diovan": "valsartan",
    # Furosemide
    "lasix": "furosemide",
    # Clopidogrel
    "plavix": "clopidogrel",
    # Digoxin
    "lanoxin": "digoxin",
}

# Patient-specific risk factors
RENAL_DOSE_ADJUSTMENTS = {
    "metformin": {
        "egfr_30_45": "Reduce to maximum 1000mg daily. Monitor renal function every 3 months.",
        "egfr_below_30": "CONTRAINDICATED. Risk of lactic acidosis.",
        "egfr_below_15": "CONTRAINDICATED. High mortality risk."
    },
    "allopurinol": {
        "egfr_30_60": "Start 100mg daily. Titrate slowly.",
        "egfr_below_30": "Start 100mg daily or alternate days. Max 200mg/day.",
        "egfr_below_15": "Start 100mg every 2-3 days."
    },
    "ramipril": {
        "egfr_below_30": "Start at 1.25mg. Titrate cautiously. Monitor potassium.",
        "egfr_below_15": "Use with caution. Consider specialist advice."
    },
    "spironolactone": {
        "egfr_below_30": "Avoid or use with extreme caution. High hyperkalemia risk.",
        "egfr_below_15": "Generally contraindicated."
    },
    "clarithromycin": {
        "egfr_below_30": "Reduce dose by 50% or extend dosing interval."
    }
}

# Gastric ulcer contraindications
GI_ULCER_RISKS = {
    "ibuprofen": {
        "risk_level": "HIGH",
        "recommendation": "AVOID. Use paracetamol instead. If essential, co-prescribe PPI.",
        "alternatives": ["paracetamol", "topical NSAIDs"]
    },
    "aspirin": {
        "risk_level": "MODERATE",  
        "recommendation": "If for CV protection, continue with PPI cover. Discuss risk/benefit.",
        "alternatives": []
    },
    "warfarin": {
        "risk_level": "MODERATE",
        "recommendation": "Monitor closely. Consider PPI prophylaxis.",
        "alternatives": []
    }
}

# Electrolyte concerns
HYPERKALEMIA_RISK_DRUGS = [
    "spironolactone", "eplerenone", "amiloride", "triamterene",  # K-sparing diuretics
    "ramipril", "lisinopril", "enalapril", "perindopril", "captopril",  # ACE inhibitors
    "losartan", "valsartan", "candesartan", "irbesartan", "telmisartan",  # ARBs
    "potassium chloride", "potassium citrate",  # K supplements
    "trimethoprim", "pentamidine",  # Antibiotics
    "heparin", "enoxaparin",  # Anticoagulants
    "ciclosporin", "tacrolimus",  # Immunosuppressants
]


def normalize_drug_name(name: str) -> str:
    """Normalize drug name to generic equivalent"""
    if not name:
        return ""
    
    # Clean input
    cleaned = name.lower().strip()
    
    # Remove common suffixes
    for suffix in ["tablets", "tablet", "capsules", "capsule", "mg", "ml", "g", "mcg"]:
        cleaned = cleaned.replace(suffix, "").strip()
    
    # Remove numbers (dosage)
    import re
    cleaned = re.sub(r'\d+\.?\d*\s*', '', cleaned).strip()
    
    # Check brand mapping
    if cleaned in BRAND_TO_GENERIC:
        return BRAND_TO_GENERIC[cleaned]
    
    # Check if already generic
    generic_names = set(BRAND_TO_GENERIC.values())
    if cleaned in generic_names:
        return cleaned
    
    # Return cleaned name even if not in database
    return cleaned


def find_interactions(drug_list: List[str]) -> List[Dict]:
    """Find all interactions between drugs in the list"""
    interactions = []
    normalized_drugs = [normalize_drug_name(d) for d in drug_list]
    
    # Check each pair
    for i, drug1 in enumerate(normalized_drugs):
        for j, drug2 in enumerate(normalized_drugs):
            if i >= j:
                continue
            
            # Search both directions in interaction database
            for interaction in DRUG_INTERACTIONS:
                d1_norm = normalize_drug_name(interaction.drug1)
                d2_norm = normalize_drug_name(interaction.drug2)
                
                if (drug1 == d1_norm and drug2 == d2_norm) or \
                   (drug1 == d2_norm and drug2 == d1_norm):
                    interactions.append({
                        "drug1": drug_list[i],
                        "drug2": drug_list[j],
                        "drug1_generic": drug1,
                        "drug2_generic": drug2,
                        "severity": interaction.severity.value,
                        "mechanism": interaction.mechanism,
                        "clinical_effect": interaction.clinical_effect,
                        "management": interaction.management,
                        "monitoring": interaction.monitoring,
                        "evidence_level": interaction.evidence_level.value,
                        "evidence_source": interaction.evidence_source,
                        "patient_factors": interaction.patient_factors
                    })
    
    return interactions


def assess_renal_risks(drug_list: List[str], egfr: float) -> List[Dict]:
    """Assess renal-specific risks for medications"""
    risks = []
    
    for drug in drug_list:
        generic = normalize_drug_name(drug)
        
        if generic in RENAL_DOSE_ADJUSTMENTS:
            adjustments = RENAL_DOSE_ADJUSTMENTS[generic]
            
            if egfr < 15 and "egfr_below_15" in adjustments:
                risks.append({
                    "medication": drug,
                    "generic": generic,
                    "severity": "contraindicated" if "CONTRAINDICATED" in adjustments["egfr_below_15"] else "severe",
                    "egfr_range": "< 15 mL/min/1.73m²",
                    "recommendation": adjustments["egfr_below_15"],
                    "type": "renal_dose_adjustment"
                })
            elif egfr < 30 and "egfr_below_30" in adjustments:
                risks.append({
                    "medication": drug,
                    "generic": generic,
                    "severity": "contraindicated" if "CONTRAINDICATED" in adjustments["egfr_below_30"] else "major",
                    "egfr_range": "< 30 mL/min/1.73m²",
                    "recommendation": adjustments["egfr_below_30"],
                    "type": "renal_dose_adjustment"
                })
            elif egfr < 45 and "egfr_30_45" in adjustments:
                risks.append({
                    "medication": drug,
                    "generic": generic,
                    "severity": "major",
                    "egfr_range": "30-45 mL/min/1.73m²",
                    "recommendation": adjustments["egfr_30_45"],
                    "type": "renal_dose_adjustment"
                })
            elif egfr < 60 and "egfr_30_60" in adjustments:
                risks.append({
                    "medication": drug,
                    "generic": generic,
                    "severity": "moderate",
                    "egfr_range": "30-60 mL/min/1.73m²",
                    "recommendation": adjustments["egfr_30_60"],
                    "type": "renal_dose_adjustment"
                })
    
    return risks


def assess_hyperkalemia_risk(drug_list: List[str], potassium: float = None, egfr: float = None) -> Dict:
    """Assess combined hyperkalemia risk from multiple drugs"""
    risky_drugs = []
    
    for drug in drug_list:
        generic = normalize_drug_name(drug)
        if generic in HYPERKALEMIA_RISK_DRUGS:
            risky_drugs.append({"original": drug, "generic": generic})
    
    risk_level = "low"
    if len(risky_drugs) >= 3:
        risk_level = "severe"
    elif len(risky_drugs) >= 2:
        risk_level = "high"
    elif len(risky_drugs) == 1:
        risk_level = "moderate"
    
    # Elevate risk based on patient factors
    if potassium and potassium > 5.0:
        if risk_level == "moderate":
            risk_level = "high"
        elif risk_level == "high":
            risk_level = "severe"
    
    if egfr and egfr < 45:
        if risk_level == "moderate":
            risk_level = "high"
        elif risk_level == "high":
            risk_level = "severe"
    
    return {
        "risk_level": risk_level,
        "contributing_drugs": risky_drugs,
        "patient_factors": {
            "baseline_potassium": potassium,
            "egfr": egfr,
            "potassium_elevated": potassium > 5.0 if potassium else None,
            "renal_impairment": egfr < 60 if egfr else None
        },
        "recommendations": get_hyperkalemia_recommendations(risk_level, len(risky_drugs), potassium, egfr)
    }


def get_hyperkalemia_recommendations(risk_level: str, drug_count: int, potassium: float, egfr: float) -> List[str]:
    """Get hyperkalemia management recommendations"""
    recs = []
    
    if risk_level == "severe":
        recs.append("URGENT: Review all potassium-elevating medications. Consider stopping potassium supplements.")
        recs.append("Check serum potassium within 24-48 hours")
        recs.append("Review diet for high-potassium foods")
        if potassium and potassium > 5.5:
            recs.append("Consider ECG to assess for cardiac effects")
    elif risk_level == "high":
        recs.append("Check serum potassium within 1 week")
        recs.append("Consider reducing or stopping potassium supplements")
        recs.append("Review necessity of all potassium-sparing medications")
    elif risk_level == "moderate":
        recs.append("Monitor serum potassium at next routine blood test")
        recs.append("Educate patient on symptoms of hyperkalemia")
    
    if drug_count >= 2:
        recs.append(f"Patient is on {drug_count} drugs that can elevate potassium - minimise where possible")
    
    return recs


def assess_gi_risks(drug_list: List[str], has_ulcer_history: bool = False) -> List[Dict]:
    """Assess GI bleeding/ulcer risks"""
    risks = []
    
    for drug in drug_list:
        generic = normalize_drug_name(drug)
        
        if generic in GI_ULCER_RISKS:
            risk_data = GI_ULCER_RISKS[generic]
            severity = "severe" if has_ulcer_history and risk_data["risk_level"] == "HIGH" else "moderate"
            
            risks.append({
                "medication": drug,
                "generic": generic,
                "risk_level": risk_data["risk_level"],
                "severity": severity,
                "recommendation": risk_data["recommendation"],
                "alternatives": risk_data["alternatives"],
                "history_relevant": has_ulcer_history,
                "type": "gi_risk"
            })
    
    return risks
