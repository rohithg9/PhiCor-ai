"""
MEDIQ Advanced Clinical Pharmacology Database

This module contains:
- Drug adverse effects (common, serious, rare)
- Maximum dose limits by indication and patient factors
- Active ingredients for duplicate detection
- Allergy cross-reactivity mappings
- Drug class information

DISCLAIMER: For clinical decision support only. 
Must be verified against current BNF/FDA references.
"""

from typing import List, Dict, Optional, Set
from dataclasses import dataclass, field
from enum import Enum

# =============================================================================
# ADVERSE DRUG REACTIONS DATABASE
# =============================================================================

@dataclass
class AdverseDrugReaction:
    """Structured adverse drug reaction information"""
    effect: str
    frequency: str  # very_common (>10%), common (1-10%), uncommon (0.1-1%), rare (<0.1%), very_rare (<0.01%)
    severity: str   # mild, moderate, serious, life_threatening
    onset: str      # immediate, hours, days, weeks, delayed
    reversible: bool
    dose_related: bool
    monitoring: List[str] = field(default_factory=list)
    risk_factors: List[str] = field(default_factory=list)
    management: str = ""

# Comprehensive adverse effects database
ADVERSE_EFFECTS_DATABASE: Dict[str, List[AdverseDrugReaction]] = {
    "warfarin": [
        AdverseDrugReaction("Bleeding (minor - bruising, epistaxis)", "common", "moderate", "days", True, True,
                           ["INR", "Signs of bleeding"], ["High INR", "Elderly", "Falls risk"], "Reduce dose, apply pressure"),
        AdverseDrugReaction("Major bleeding (GI, intracranial)", "uncommon", "life_threatening", "days", False, True,
                           ["INR", "Hb", "Signs of bleeding"], ["High INR", "NSAIDs", "Elderly", "Previous bleed"], "Stop warfarin, vitamin K, FFP/PCC"),
        AdverseDrugReaction("Skin necrosis", "rare", "serious", "days", False, False,
                           ["Skin examination"], ["Protein C/S deficiency"], "Stop warfarin, anticoagulate with heparin"),
        AdverseDrugReaction("Purple toe syndrome", "rare", "moderate", "weeks", True, False,
                           ["Peripheral examination"], ["Atherosclerosis"], "Usually resolves, consider alternative"),
    ],
    "aspirin": [
        AdverseDrugReaction("GI irritation/dyspepsia", "very_common", "mild", "hours", True, True,
                           [], ["Previous GI disease"], "Take with food, consider PPI"),
        AdverseDrugReaction("GI bleeding", "uncommon", "serious", "days", True, True,
                           ["Hb", "Signs of bleeding"], ["Previous ulcer", "NSAIDs", "Anticoagulants", "Elderly"], "Stop if serious, PPI cover"),
        AdverseDrugReaction("Tinnitus", "uncommon", "mild", "hours", True, True,
                           [], ["High dose"], "Reduce dose"),
        AdverseDrugReaction("Bronchospasm (aspirin-sensitive asthma)", "rare", "serious", "immediate", True, False,
                           [], ["Asthma", "Nasal polyps"], "Avoid in sensitive patients"),
        AdverseDrugReaction("Reye syndrome (children)", "very_rare", "life_threatening", "days", False, False,
                           [], ["Children <16 with viral illness"], "Contraindicated in children with fever"),
    ],
    "metformin": [
        AdverseDrugReaction("GI effects (nausea, diarrhea, abdominal pain)", "very_common", "mild", "days", True, True,
                           [], ["High starting dose"], "Start low, titrate slowly, take with food"),
        AdverseDrugReaction("Vitamin B12 deficiency", "common", "moderate", "months", True, True,
                           ["B12 levels annually"], ["Long-term use"], "Monitor and supplement if needed"),
        AdverseDrugReaction("Lactic acidosis", "very_rare", "life_threatening", "hours", False, True,
                           ["Lactate if symptomatic", "Renal function"], ["CKD", "Liver disease", "Hypoxia", "Alcohol", "Contrast"], "Stop metformin, supportive care"),
        AdverseDrugReaction("Metallic taste", "common", "mild", "days", True, False,
                           [], [], "Usually transient"),
    ],
    "ramipril": [
        AdverseDrugReaction("Dry cough", "common", "mild", "weeks", True, False,
                           [], [], "Switch to ARB if intolerable"),
        AdverseDrugReaction("Hyperkalaemia", "common", "serious", "days", True, True,
                           ["Potassium at 1-2 weeks, then periodically"], ["CKD", "Diabetes", "K-sparing diuretics"], "Monitor K+, adjust dose or stop"),
        AdverseDrugReaction("Acute kidney injury", "uncommon", "serious", "days", True, True,
                           ["Creatinine at 1-2 weeks"], ["Bilateral renal artery stenosis", "Volume depletion", "NSAIDs"], "Stop if significant rise"),
        AdverseDrugReaction("Angioedema", "rare", "life_threatening", "hours", True, False,
                           [], ["Previous angioedema", "Black patients"], "Stop permanently, emergency treatment"),
        AdverseDrugReaction("First-dose hypotension", "common", "moderate", "hours", True, True,
                           ["BP after first dose"], ["Volume depletion", "Elderly", "High-dose diuretics"], "Start low dose, consider holding diuretic"),
    ],
    "simvastatin": [
        AdverseDrugReaction("Myalgia", "common", "mild", "weeks", True, True,
                           ["CK if symptomatic"], ["High dose", "Interacting drugs", "Hypothyroidism"], "Reduce dose or switch statin"),
        AdverseDrugReaction("Myopathy", "uncommon", "serious", "weeks", True, True,
                           ["CK"], ["High dose", "CYP3A4 inhibitors", "Renal impairment"], "Stop if CK >10x ULN"),
        AdverseDrugReaction("Rhabdomyolysis", "rare", "life_threatening", "weeks", False, True,
                           ["CK", "Creatinine", "Urine myoglobin"], ["High dose", "Interacting drugs"], "Stop immediately, IV fluids, monitor kidneys"),
        AdverseDrugReaction("Hepatotoxicity", "rare", "serious", "months", True, True,
                           ["LFTs if symptomatic"], ["Liver disease", "Alcohol"], "Stop if ALT >3x ULN persistently"),
        AdverseDrugReaction("Diabetes (new onset)", "uncommon", "moderate", "months", False, False,
                           ["HbA1c"], ["Prediabetes", "Metabolic syndrome"], "Monitor, benefits usually outweigh risks"),
    ],
    "amiodarone": [
        AdverseDrugReaction("Pulmonary toxicity", "uncommon", "life_threatening", "months", False, True,
                           ["CXR baseline and annually", "Pulmonary function"], ["Pre-existing lung disease", "High dose"], "Stop, steroids may help"),
        AdverseDrugReaction("Thyroid dysfunction (hypo or hyper)", "common", "serious", "months", True, True,
                           ["TFTs every 6 months"], [], "Monitor, may need treatment or drug cessation"),
        AdverseDrugReaction("Hepatotoxicity", "common", "serious", "months", True, True,
                           ["LFTs every 6 months"], ["Liver disease"], "Stop if significant elevation"),
        AdverseDrugReaction("Corneal microdeposits", "very_common", "mild", "months", True, True,
                           ["Eye examination annually"], [], "Usually asymptomatic, reversible"),
        AdverseDrugReaction("Photosensitivity", "common", "mild", "weeks", True, False,
                           [], [], "Sun protection, may cause blue-grey discoloration"),
        AdverseDrugReaction("QT prolongation/Torsades", "uncommon", "life_threatening", "days", True, True,
                           ["ECG", "Electrolytes"], ["Hypokalaemia", "Hypomagnesaemia", "Other QT drugs"], "Monitor ECG, correct electrolytes"),
        AdverseDrugReaction("Bradycardia", "common", "moderate", "days", True, True,
                           ["Heart rate", "ECG"], ["Beta-blockers", "Digoxin"], "May need dose reduction or pacing"),
    ],
    "spironolactone": [
        AdverseDrugReaction("Hyperkalaemia", "common", "serious", "days", True, True,
                           ["Potassium at 1 week, 4 weeks, then 3-monthly"], ["CKD", "ACE-I/ARB", "K+ supplements"], "Monitor, reduce dose or stop"),
        AdverseDrugReaction("Gynaecomastia (males)", "common", "mild", "months", True, True,
                           [], ["High dose", "Long-term use"], "Reduce dose or switch to eplerenone"),
        AdverseDrugReaction("Breast tenderness (females)", "common", "mild", "weeks", True, True,
                           [], [], "Usually transient"),
        AdverseDrugReaction("Menstrual irregularities", "common", "mild", "weeks", True, True,
                           [], [], "May need alternative"),
        AdverseDrugReaction("Acute kidney injury", "uncommon", "serious", "days", True, True,
                           ["Creatinine"], ["CKD", "Volume depletion", "NSAIDs"], "Monitor renal function"),
    ],
    "digoxin": [
        AdverseDrugReaction("Nausea, vomiting, anorexia", "common", "moderate", "days", True, True,
                           ["Digoxin level"], ["Renal impairment", "Elderly"], "Check level, reduce dose"),
        AdverseDrugReaction("Visual disturbances (yellow vision)", "uncommon", "moderate", "days", True, True,
                           ["Digoxin level"], [], "Check level, may indicate toxicity"),
        AdverseDrugReaction("Cardiac arrhythmias", "uncommon", "life_threatening", "days", True, True,
                           ["ECG", "Digoxin level", "Potassium"], ["Hypokalaemia", "Renal impairment"], "Stop, correct K+, may need digibind"),
        AdverseDrugReaction("Confusion", "uncommon", "moderate", "days", True, True,
                           ["Digoxin level"], ["Elderly", "Renal impairment"], "Check level, reduce dose"),
    ],
    "ibuprofen": [
        AdverseDrugReaction("GI irritation/dyspepsia", "very_common", "mild", "hours", True, True,
                           [], [], "Take with food, consider PPI"),
        AdverseDrugReaction("GI ulceration/bleeding", "uncommon", "serious", "days", True, True,
                           ["Hb if prolonged use"], ["Previous ulcer", "Elderly", "Anticoagulants", "Steroids"], "PPI cover, shortest duration"),
        AdverseDrugReaction("Acute kidney injury", "uncommon", "serious", "days", True, True,
                           ["Creatinine"], ["CKD", "Volume depletion", "ACE-I/ARB", "Elderly"], "Avoid or use caution"),
        AdverseDrugReaction("Fluid retention/oedema", "common", "mild", "days", True, True,
                           ["Weight", "BP"], ["Heart failure", "Hypertension"], "Avoid in heart failure"),
        AdverseDrugReaction("Cardiovascular events", "uncommon", "serious", "weeks", False, True,
                           [], ["Cardiovascular disease", "High dose", "Long-term use"], "Use lowest dose, shortest duration"),
        AdverseDrugReaction("Bronchospasm", "rare", "serious", "immediate", True, False,
                           [], ["Aspirin-sensitive asthma"], "Avoid if aspirin-sensitive"),
    ],
    "clarithromycin": [
        AdverseDrugReaction("GI effects (nausea, diarrhea, taste disturbance)", "very_common", "mild", "days", True, True,
                           [], [], "Usually transient"),
        AdverseDrugReaction("QT prolongation", "uncommon", "serious", "days", True, True,
                           ["ECG if at risk"], ["Electrolyte abnormalities", "Other QT drugs"], "Avoid in high-risk patients"),
        AdverseDrugReaction("Hepatotoxicity", "rare", "serious", "days", True, False,
                           ["LFTs if symptomatic"], ["Liver disease"], "Stop if significant"),
        AdverseDrugReaction("C. difficile colitis", "uncommon", "serious", "days", True, False,
                           [], ["Recent antibiotics", "Elderly", "PPI use"], "Stop, treat C. diff"),
    ],
    "allopurinol": [
        AdverseDrugReaction("Gout flare (initiation)", "very_common", "moderate", "weeks", True, True,
                           [], ["Starting without prophylaxis"], "Start low, cover with colchicine/NSAID"),
        AdverseDrugReaction("Rash", "common", "mild", "weeks", True, False,
                           [], [], "May resolve, watch for severe reaction"),
        AdverseDrugReaction("Severe hypersensitivity (DRESS, SJS, TEN)", "rare", "life_threatening", "weeks", False, False,
                           [], ["HLA-B*5801", "CKD", "Asian ethnicity"], "Stop immediately, never rechallenge"),
        AdverseDrugReaction("Hepatotoxicity", "rare", "serious", "weeks", True, False,
                           ["LFTs if symptomatic"], [], "Stop if significant"),
    ],
    "omeprazole": [
        AdverseDrugReaction("Headache", "common", "mild", "days", True, False,
                           [], [], "Usually transient"),
        AdverseDrugReaction("GI effects (nausea, diarrhea, constipation)", "common", "mild", "days", True, False,
                           [], [], "Usually transient"),
        AdverseDrugReaction("Hypomagnesaemia (long-term)", "uncommon", "serious", "months", True, True,
                           ["Magnesium if long-term"], ["Long-term use", "Diuretics"], "Check levels, supplement if needed"),
        AdverseDrugReaction("C. difficile infection", "uncommon", "serious", "weeks", True, False,
                           [], ["Elderly", "Hospitalized", "Recent antibiotics"], "Review need for PPI"),
        AdverseDrugReaction("Vitamin B12 deficiency (long-term)", "uncommon", "moderate", "years", True, True,
                           ["B12 if long-term"], ["Long-term use", "Elderly"], "Monitor and supplement"),
        AdverseDrugReaction("Increased fracture risk (long-term)", "uncommon", "serious", "years", False, True,
                           [], ["Elderly", "Osteoporosis risk"], "Use lowest effective dose"),
    ],
    "losartan": [
        AdverseDrugReaction("Hyperkalaemia", "common", "serious", "days", True, True,
                           ["Potassium at 1-2 weeks"], ["CKD", "Diabetes", "K-sparing diuretics"], "Monitor K+"),
        AdverseDrugReaction("Hypotension", "common", "moderate", "hours", True, True,
                           ["BP"], ["Volume depletion", "Elderly"], "Start low, caution with diuretics"),
        AdverseDrugReaction("Acute kidney injury", "uncommon", "serious", "days", True, True,
                           ["Creatinine at 1-2 weeks"], ["Bilateral RAS", "Volume depletion"], "Monitor renal function"),
        AdverseDrugReaction("Dizziness", "common", "mild", "days", True, True,
                           [], [], "Usually transient"),
    ],
    "metoprolol": [
        AdverseDrugReaction("Bradycardia", "common", "moderate", "days", True, True,
                           ["Heart rate"], ["Conduction disease", "Digoxin", "Verapamil"], "Monitor HR, reduce dose if needed"),
        AdverseDrugReaction("Fatigue", "common", "mild", "weeks", True, True,
                           [], [], "May improve with time"),
        AdverseDrugReaction("Cold extremities", "common", "mild", "days", True, True,
                           [], ["Peripheral vascular disease"], "May need alternative"),
        AdverseDrugReaction("Bronchospasm", "uncommon", "serious", "hours", True, False,
                           [], ["Asthma", "COPD"], "Caution in airways disease"),
        AdverseDrugReaction("Heart failure exacerbation", "uncommon", "serious", "days", True, True,
                           [], ["Decompensated heart failure"], "Start low, titrate slowly in stable HF"),
        AdverseDrugReaction("Masking hypoglycaemia symptoms", "uncommon", "moderate", "immediate", True, False,
                           [], ["Diabetes on insulin/SU"], "Warn diabetic patients"),
    ],
    "potassium chloride": [
        AdverseDrugReaction("Hyperkalaemia", "common", "life_threatening", "hours", True, True,
                           ["Potassium levels"], ["CKD", "ACE-I/ARB", "K-sparing diuretics"], "Monitor K+, adjust dose"),
        AdverseDrugReaction("GI irritation/ulceration", "common", "moderate", "hours", True, True,
                           [], ["Slow-release formulations"], "Take with food, adequate fluid"),
        AdverseDrugReaction("Nausea, vomiting", "common", "mild", "hours", True, True,
                           [], [], "Take with food"),
    ],
}

# =============================================================================
# MAXIMUM DOSE LIMITS DATABASE
# =============================================================================

@dataclass
class DoseLimit:
    """Maximum dose information"""
    max_single_dose: Optional[str]
    max_daily_dose: str
    max_daily_dose_mg: float  # For calculations
    indication_specific: Dict[str, str] = field(default_factory=dict)
    renal_adjustments: Dict[str, str] = field(default_factory=dict)
    hepatic_adjustments: Dict[str, str] = field(default_factory=dict)
    age_adjustments: Dict[str, str] = field(default_factory=dict)
    warnings: List[str] = field(default_factory=list)

DOSE_LIMITS: Dict[str, DoseLimit] = {
    "paracetamol": DoseLimit(
        max_single_dose="1000mg",
        max_daily_dose="4000mg (4g)",
        max_daily_dose_mg=4000,
        indication_specific={},
        renal_adjustments={"eGFR<30": "Increase dosing interval to 6-hourly"},
        hepatic_adjustments={"Liver disease": "Max 3g/day, caution with alcohol"},
        age_adjustments={"Elderly (<50kg)": "Max 3g/day", "Children": "Weight-based dosing"},
        warnings=["Risk of hepatotoxicity above 4g/day", "Check for paracetamol in combination products"]
    ),
    "ibuprofen": DoseLimit(
        max_single_dose="400mg (OTC), 800mg (prescription)",
        max_daily_dose="2400mg",
        max_daily_dose_mg=2400,
        indication_specific={"Analgesia/antipyretic": "1200mg/day usually sufficient"},
        renal_adjustments={"eGFR<30": "Avoid if possible", "eGFR 30-60": "Use with caution, lowest dose"},
        hepatic_adjustments={"Liver disease": "Use with caution"},
        age_adjustments={"Elderly": "Max 1200mg/day recommended"},
        warnings=["Cardiovascular risk with high doses/long-term use", "GI bleeding risk"]
    ),
    "metformin": DoseLimit(
        max_single_dose="1000mg",
        max_daily_dose="3000mg (2550mg in US)",
        max_daily_dose_mg=3000,
        indication_specific={},
        renal_adjustments={
            "eGFR 30-45": "Max 1000mg/day",
            "eGFR<30": "Contraindicated"
        },
        hepatic_adjustments={"Liver disease": "Avoid - lactic acidosis risk"},
        age_adjustments={"Elderly": "Start low, titrate based on renal function"},
        warnings=["Hold before contrast procedures", "Lactic acidosis risk in tissue hypoxia"]
    ),
    "ramipril": DoseLimit(
        max_single_dose="10mg",
        max_daily_dose="10mg",
        max_daily_dose_mg=10,
        indication_specific={
            "Hypertension": "10mg once daily",
            "Heart failure": "10mg once daily (may split)",
            "Post-MI": "10mg once daily"
        },
        renal_adjustments={"eGFR<30": "Start 1.25mg, max 5mg/day"},
        hepatic_adjustments={},
        age_adjustments={"Elderly": "Start 1.25mg"},
        warnings=["First-dose hypotension risk", "Monitor K+ and creatinine"]
    ),
    "simvastatin": DoseLimit(
        max_single_dose="80mg",
        max_daily_dose="80mg",
        max_daily_dose_mg=80,
        indication_specific={},
        renal_adjustments={"Severe CKD": "Start 10mg, max 20mg if on dialysis"},
        hepatic_adjustments={"Active liver disease": "Contraindicated"},
        age_adjustments={},
        warnings=[
            "80mg dose only for patients already tolerating it",
            "Max 20mg with amiodarone, amlodipine, diltiazem",
            "Max 10mg with verapamil",
            "Contraindicated with strong CYP3A4 inhibitors"
        ]
    ),
    "amiodarone": DoseLimit(
        max_single_dose="300mg IV, 400mg oral",
        max_daily_dose="200mg maintenance (after loading)",
        max_daily_dose_mg=200,
        indication_specific={
            "Loading": "800-1600mg/day for 1-3 weeks",
            "Maintenance": "100-400mg/day, usually 200mg"
        },
        renal_adjustments={},
        hepatic_adjustments={"Liver disease": "Use with caution, monitor LFTs"},
        age_adjustments={"Elderly": "May need lower maintenance dose"},
        warnings=["Long half-life (weeks-months)", "Multiple organ toxicities require monitoring"]
    ),
    "digoxin": DoseLimit(
        max_single_dose="500mcg",
        max_daily_dose="250mcg (125mcg in elderly/renal impairment)",
        max_daily_dose_mg=0.25,
        indication_specific={
            "AF rate control": "125-250mcg daily",
            "Heart failure": "62.5-250mcg daily"
        },
        renal_adjustments={
            "eGFR 30-60": "125mcg daily or alternate days",
            "eGFR<30": "62.5-125mcg daily or less frequently"
        },
        hepatic_adjustments={},
        age_adjustments={"Elderly": "125mcg daily or less"},
        warnings=["Narrow therapeutic index", "Monitor levels if toxicity suspected", "Hypokalaemia increases toxicity"]
    ),
    "warfarin": DoseLimit(
        max_single_dose="Varies by INR",
        max_daily_dose="Individualised by INR",
        max_daily_dose_mg=15,  # Approximate upper range
        indication_specific={
            "AF": "Target INR 2-3",
            "Mechanical valve": "Target INR 2.5-3.5"
        },
        renal_adjustments={},
        hepatic_adjustments={"Liver disease": "Increased sensitivity, lower doses"},
        age_adjustments={"Elderly": "Often need lower doses"},
        warnings=["Dose determined by INR", "Multiple drug and food interactions"]
    ),
    "spironolactone": DoseLimit(
        max_single_dose="100mg",
        max_daily_dose="400mg (usually 25-50mg for HF)",
        max_daily_dose_mg=400,
        indication_specific={
            "Heart failure": "25-50mg daily",
            "Ascites": "100-400mg daily",
            "Hypertension": "25-100mg daily"
        },
        renal_adjustments={"eGFR<30": "Avoid or use with extreme caution"},
        hepatic_adjustments={},
        age_adjustments={"Elderly": "Start low, monitor K+"},
        warnings=["Hyperkalaemia risk", "Avoid with K+ supplements unless hypokalaemic"]
    ),
    "allopurinol": DoseLimit(
        max_single_dose="300mg",
        max_daily_dose="900mg",
        max_daily_dose_mg=900,
        indication_specific={"Gout": "100-300mg daily usually sufficient"},
        renal_adjustments={
            "eGFR 30-60": "Max 200mg/day",
            "eGFR<30": "Max 100mg/day or alternate days"
        },
        hepatic_adjustments={},
        age_adjustments={},
        warnings=["Start 100mg, titrate slowly", "Severe hypersensitivity reactions possible"]
    ),
    "aspirin": DoseLimit(
        max_single_dose="1000mg (analgesic)",
        max_daily_dose="4000mg (analgesic), 75-325mg (antiplatelet)",
        max_daily_dose_mg=4000,
        indication_specific={
            "Antiplatelet": "75-150mg daily",
            "Acute coronary syndrome": "300mg loading then 75-100mg",
            "Analgesia": "300-900mg every 4-6 hours"
        },
        renal_adjustments={"Severe CKD": "Avoid high analgesic doses"},
        hepatic_adjustments={"Liver disease": "Use with caution"},
        age_adjustments={"Children <16": "Avoid (Reye syndrome risk)"},
        warnings=["GI bleeding risk", "Different doses for different indications"]
    ),
}

# =============================================================================
# ACTIVE INGREDIENTS DATABASE (for duplicate detection)
# =============================================================================

ACTIVE_INGREDIENTS: Dict[str, List[str]] = {
    # Single ingredient products
    "paracetamol": ["paracetamol"],
    "acetaminophen": ["paracetamol"],  # US name
    "ibuprofen": ["ibuprofen"],
    "aspirin": ["aspirin"],
    "warfarin": ["warfarin"],
    "metformin": ["metformin"],
    "ramipril": ["ramipril"],
    "lisinopril": ["lisinopril"],
    "enalapril": ["enalapril"],
    "amlodipine": ["amlodipine"],
    "simvastatin": ["simvastatin"],
    "atorvastatin": ["atorvastatin"],
    "omeprazole": ["omeprazole"],
    "lansoprazole": ["lansoprazole"],
    "pantoprazole": ["pantoprazole"],
    "spironolactone": ["spironolactone"],
    "furosemide": ["furosemide"],
    "digoxin": ["digoxin"],
    "amiodarone": ["amiodarone"],
    "metoprolol": ["metoprolol"],
    "bisoprolol": ["bisoprolol"],
    "carvedilol": ["carvedilol"],
    "losartan": ["losartan"],
    "valsartan": ["valsartan"],
    "allopurinol": ["allopurinol"],
    "potassium chloride": ["potassium"],
    "clarithromycin": ["clarithromycin"],
    
    # Combination products containing paracetamol
    "co-codamol": ["paracetamol", "codeine"],
    "co-dydramol": ["paracetamol", "dihydrocodeine"],
    "co-proxamol": ["paracetamol", "dextropropoxyphene"],  # Withdrawn but may appear in history
    "tramacet": ["paracetamol", "tramadol"],
    "percocet": ["paracetamol", "oxycodone"],
    "vicodin": ["paracetamol", "hydrocodone"],
    "tylenol pm": ["paracetamol", "diphenhydramine"],
    "lemsip": ["paracetamol", "phenylephrine"],
    "beechams": ["paracetamol", "phenylephrine"],
    "night nurse": ["paracetamol", "promethazine", "dextromethorphan"],
    "day nurse": ["paracetamol", "phenylephrine", "pholcodine"],
    "migraleve": ["paracetamol", "codeine", "buclizine"],
    "anadin extra": ["paracetamol", "aspirin", "caffeine"],
    
    # Combination products containing aspirin
    "co-codaprin": ["aspirin", "codeine"],
    "anadin": ["aspirin"],
    "aspirin compound": ["aspirin", "caffeine"],
    
    # Combination products containing ibuprofen
    "nurofen plus": ["ibuprofen", "codeine"],
    "advil pm": ["ibuprofen", "diphenhydramine"],
    
    # ACE inhibitor combinations
    "co-zidocapt": ["captopril", "hydrochlorothiazide"],
    "zestoretic": ["lisinopril", "hydrochlorothiazide"],
    "triapin": ["ramipril", "felodipine"],
    
    # ARB combinations
    "co-diovan": ["valsartan", "hydrochlorothiazide"],
    "cozaar comp": ["losartan", "hydrochlorothiazide"],
    
    # Statin combinations
    "inegy": ["simvastatin", "ezetimibe"],
    "caduet": ["atorvastatin", "amlodipine"],
    
    # Antidiabetic combinations
    "janumet": ["metformin", "sitagliptin"],
    "eucreas": ["metformin", "vildagliptin"],
    "competact": ["metformin", "pioglitazone"],
    "glucovance": ["metformin", "glibenclamide"],
    
    # Antiplatelet combinations
    "clopidogrel-aspirin": ["clopidogrel", "aspirin"],
    
    # Potassium-containing
    "sando-k": ["potassium"],
    "slow-k": ["potassium"],
    "kay-cee-l": ["potassium"],
}

# =============================================================================
# ALLERGY CROSS-REACTIVITY DATABASE
# =============================================================================

ALLERGY_CROSS_REACTIVITY: Dict[str, Dict] = {
    "penicillin": {
        "cross_reactive": ["amoxicillin", "ampicillin", "flucloxacillin", "co-amoxiclav", 
                          "piperacillin", "tazocin", "benzylpenicillin", "phenoxymethylpenicillin"],
        "possible_cross": ["cephalosporins"],  # ~1-2% cross-reactivity with similar side-chain
        "risk_level": "high",
        "notes": "True penicillin allergy has ~1-2% cross-reactivity with cephalosporins. Higher with 1st gen cephalosporins sharing similar R1 side chains."
    },
    "amoxicillin": {
        "cross_reactive": ["ampicillin", "co-amoxiclav", "penicillin"],
        "possible_cross": ["cephalosporins"],
        "risk_level": "high",
        "notes": "Same class as penicillin, high cross-reactivity within penicillins"
    },
    "cephalosporin": {
        "cross_reactive": ["cefaclor", "cefalexin", "cefuroxime", "ceftriaxone", "cefotaxime", "ceftazidime"],
        "possible_cross": ["penicillin"],
        "risk_level": "moderate",
        "notes": "Cross-reactivity with penicillins is low but possible"
    },
    "sulfonamide_antibiotic": {
        "cross_reactive": ["sulfamethoxazole", "co-trimoxazole", "sulfadiazine", "sulfasalazine"],
        "possible_cross": [],
        "risk_level": "high",
        "notes": "Cross-reactivity between sulfonamide antibiotics is common. Cross-reactivity with non-antibiotic sulfonamides (thiazides, furosemide) is controversial and likely very low."
    },
    "nsaid": {
        "cross_reactive": ["ibuprofen", "naproxen", "diclofenac", "indomethacin", "piroxicam", "meloxicam", "celecoxib"],
        "possible_cross": ["aspirin"],
        "risk_level": "moderate",
        "notes": "COX-1 inhibitor cross-reactivity common. COX-2 selective agents may be tolerated in some NSAID-sensitive patients."
    },
    "aspirin": {
        "cross_reactive": [],
        "possible_cross": ["nsaids"],
        "risk_level": "moderate",
        "notes": "Aspirin-exacerbated respiratory disease (AERD) has cross-reactivity with NSAIDs"
    },
    "ace_inhibitor": {
        "cross_reactive": ["ramipril", "lisinopril", "enalapril", "perindopril", "captopril"],
        "possible_cross": [],
        "risk_level": "high",
        "notes": "ACE inhibitor angioedema - do not use any ACE inhibitor. ARBs may be considered with caution."
    },
    "statin": {
        "cross_reactive": [],
        "possible_cross": ["atorvastatin", "simvastatin", "rosuvastatin", "pravastatin"],
        "risk_level": "low",
        "notes": "True statin allergy is rare. Myopathy/rhabdomyolysis is not an allergy. May try different statin."
    },
    "opioid": {
        "cross_reactive": [],
        "possible_cross": ["morphine", "codeine", "tramadol", "oxycodone", "fentanyl"],
        "risk_level": "variable",
        "notes": "True opioid allergy is rare. Most reactions are predictable side effects (nausea, itch). Different opioid classes may be tolerated."
    },
    "contrast_media": {
        "cross_reactive": [],
        "possible_cross": ["iodinated contrast agents"],
        "risk_level": "moderate",
        "notes": "Previous severe reaction - premedicate or use alternative imaging. Not related to iodine/seafood allergy."
    },
}

# =============================================================================
# THERAPEUTIC DRUG CLASSES
# =============================================================================

DRUG_CLASSES: Dict[str, List[str]] = {
    "ace_inhibitors": ["ramipril", "lisinopril", "enalapril", "perindopril", "captopril", "fosinopril", "trandolapril", "quinapril"],
    "arbs": ["losartan", "valsartan", "candesartan", "irbesartan", "telmisartan", "olmesartan", "azilsartan"],
    "beta_blockers": ["metoprolol", "bisoprolol", "carvedilol", "atenolol", "propranolol", "nebivolol", "labetalol", "sotalol"],
    "calcium_channel_blockers": ["amlodipine", "nifedipine", "felodipine", "diltiazem", "verapamil", "lercanidipine"],
    "statins": ["simvastatin", "atorvastatin", "rosuvastatin", "pravastatin", "fluvastatin", "pitavastatin"],
    "ppis": ["omeprazole", "lansoprazole", "pantoprazole", "esomeprazole", "rabeprazole"],
    "h2_blockers": ["ranitidine", "famotidine", "cimetidine", "nizatidine"],
    "thiazide_diuretics": ["bendroflumethiazide", "hydrochlorothiazide", "indapamide", "chlorthalidone", "metolazone"],
    "loop_diuretics": ["furosemide", "bumetanide", "torasemide"],
    "potassium_sparing_diuretics": ["spironolactone", "eplerenone", "amiloride", "triamterene"],
    "anticoagulants_oral": ["warfarin", "apixaban", "rivaroxaban", "dabigatran", "edoxaban"],
    "antiplatelet_agents": ["aspirin", "clopidogrel", "prasugrel", "ticagrelor", "dipyridamole"],
    "nsaids": ["ibuprofen", "naproxen", "diclofenac", "indomethacin", "piroxicam", "meloxicam", "celecoxib", "etoricoxib"],
    "opioids": ["morphine", "codeine", "tramadol", "oxycodone", "fentanyl", "buprenorphine", "dihydrocodeine", "hydromorphone"],
    "benzodiazepines": ["diazepam", "lorazepam", "temazepam", "nitrazepam", "clonazepam", "alprazolam", "midazolam"],
    "ssris": ["sertraline", "fluoxetine", "citalopram", "escitalopram", "paroxetine", "fluvoxamine"],
    "snris": ["venlafaxine", "duloxetine", "desvenlafaxine"],
    "tricyclic_antidepressants": ["amitriptyline", "nortriptyline", "imipramine", "clomipramine", "dosulepin"],
    "antipsychotics_typical": ["haloperidol", "chlorpromazine", "fluphenazine", "prochlorperazine"],
    "antipsychotics_atypical": ["olanzapine", "quetiapine", "risperidone", "aripiprazole", "clozapine"],
    "sulfonylureas": ["gliclazide", "glimepiride", "glipizide", "glibenclamide", "tolbutamide"],
    "biguanides": ["metformin"],
    "sglt2_inhibitors": ["dapagliflozin", "empagliflozin", "canagliflozin"],
    "dpp4_inhibitors": ["sitagliptin", "linagliptin", "saxagliptin", "alogliptin", "vildagliptin"],
    "glp1_agonists": ["semaglutide", "liraglutide", "dulaglutide", "exenatide"],
    "aminoglycosides": ["gentamicin", "amikacin", "tobramycin", "streptomycin"],
    "fluoroquinolones": ["ciprofloxacin", "levofloxacin", "moxifloxacin", "ofloxacin"],
    "macrolides": ["clarithromycin", "azithromycin", "erythromycin"],
    "penicillins": ["amoxicillin", "ampicillin", "flucloxacillin", "co-amoxiclav", "piperacillin", "benzylpenicillin", "phenoxymethylpenicillin"],
    "cephalosporins": ["cefalexin", "cefaclor", "cefuroxime", "ceftriaxone", "cefotaxime", "ceftazidime", "cefixime"],
}

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_adverse_effects(drug_name: str) -> List[Dict]:
    """Get adverse effects for a drug"""
    normalized = drug_name.lower().strip()
    
    # Check direct match
    if normalized in ADVERSE_EFFECTS_DATABASE:
        effects = ADVERSE_EFFECTS_DATABASE[normalized]
        return [
            {
                "effect": e.effect,
                "frequency": e.frequency,
                "severity": e.severity,
                "onset": e.onset,
                "reversible": e.reversible,
                "dose_related": e.dose_related,
                "monitoring": e.monitoring,
                "risk_factors": e.risk_factors,
                "management": e.management
            }
            for e in effects
        ]
    
    return []


def get_dose_limits(drug_name: str) -> Optional[Dict]:
    """Get maximum dose limits for a drug"""
    normalized = drug_name.lower().strip()
    
    if normalized in DOSE_LIMITS:
        dl = DOSE_LIMITS[normalized]
        return {
            "max_single_dose": dl.max_single_dose,
            "max_daily_dose": dl.max_daily_dose,
            "max_daily_dose_mg": dl.max_daily_dose_mg,
            "indication_specific": dl.indication_specific,
            "renal_adjustments": dl.renal_adjustments,
            "hepatic_adjustments": dl.hepatic_adjustments,
            "age_adjustments": dl.age_adjustments,
            "warnings": dl.warnings
        }
    
    return None


def get_active_ingredients(product_name: str) -> List[str]:
    """Get active ingredients for a product"""
    import re
    
    # Normalize the product name
    normalized = product_name.lower().strip()
    
    # Remove dosage numbers first
    normalized = re.sub(r'\d+\.?\d*/?\d*\s*', '', normalized).strip()
    
    # Remove common suffixes
    suffixes_pattern = r'\b(tablets?|capsules?|mg|mcg|ml|g|iu|xr|sr|er|cr|od|bd|tds|qds)\b'
    normalized = re.sub(suffixes_pattern, '', normalized, flags=re.IGNORECASE).strip()
    
    # Remove punctuation except hyphens
    normalized = re.sub(r'[^\w\s-]', '', normalized).strip()
    
    # Collapse multiple spaces
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    
    # Check the normalized name
    if normalized in ACTIVE_INGREDIENTS:
        return ACTIVE_INGREDIENTS[normalized]
    
    # Also check without hyphens (co-codamol vs cocodamol)
    normalized_no_hyphen = normalized.replace('-', '')
    if normalized_no_hyphen in ACTIVE_INGREDIENTS:
        return ACTIVE_INGREDIENTS[normalized_no_hyphen]
    
    # Check if any key matches as a substring
    for key in ACTIVE_INGREDIENTS:
        if key == normalized or key == normalized_no_hyphen:
            return ACTIVE_INGREDIENTS[key]
    
    # Return the normalized name as the ingredient if not a known combination
    return [normalized]


def detect_duplicate_ingredients(medications: List[str]) -> List[Dict]:
    """Detect duplicate active ingredients across medication list"""
    ingredient_sources: Dict[str, List[str]] = {}
    
    for med in medications:
        ingredients = get_active_ingredients(med.lower())
        for ing in ingredients:
            if ing not in ingredient_sources:
                ingredient_sources[ing] = []
            ingredient_sources[ing].append(med)
    
    duplicates = []
    for ingredient, sources in ingredient_sources.items():
        if len(sources) > 1:
            duplicates.append({
                "ingredient": ingredient,
                "found_in": sources,
                "severity": "major" if ingredient in ["paracetamol", "aspirin"] else "moderate",
                "warning": f"Duplicate {ingredient} from multiple sources may lead to overdose",
                "recommendation": "Review total daily intake and consider rationalising"
            })
    
    return duplicates


def check_allergy_cross_reactivity(allergies: List[str], medications: List[str]) -> List[Dict]:
    """Check for potential allergy cross-reactivity"""
    alerts = []
    
    for allergy in allergies:
        allergy_norm = allergy.lower().strip()
        
        # Check if allergy is in our cross-reactivity database
        allergy_info = None
        for key in ALLERGY_CROSS_REACTIVITY:
            if allergy_norm in key or key in allergy_norm:
                allergy_info = ALLERGY_CROSS_REACTIVITY[key]
                break
        
        if not allergy_info:
            # Check if allergy matches a drug that's in a class we track
            for drug_class, drugs in DRUG_CLASSES.items():
                if allergy_norm in drugs:
                    # Found the drug in a class
                    for med in medications:
                        med_norm = med.lower().strip()
                        if med_norm in drugs and med_norm != allergy_norm:
                            alerts.append({
                                "allergy": allergy,
                                "medication": med,
                                "type": "same_class",
                                "severity": "moderate",
                                "message": f"Patient allergic to {allergy} - {med} is in the same drug class ({drug_class})",
                                "recommendation": "Confirm nature of allergy reaction. Consider alternative if true allergy."
                            })
                    break
            continue
        
        # Check cross-reactive drugs
        for med in medications:
            med_norm = med.lower().strip()
            
            # Direct cross-reactivity
            if med_norm in allergy_info["cross_reactive"]:
                alerts.append({
                    "allergy": allergy,
                    "medication": med,
                    "type": "cross_reactive",
                    "severity": "high",
                    "message": f"ALLERGY ALERT: Patient allergic to {allergy}. {med} is cross-reactive.",
                    "recommendation": "Avoid this medication. Use alternative from different class."
                })
            
            # Possible cross-reactivity
            elif med_norm in allergy_info.get("possible_cross", []):
                alerts.append({
                    "allergy": allergy,
                    "medication": med,
                    "type": "possible_cross",
                    "severity": "moderate",
                    "message": f"Possible cross-reactivity: Patient allergic to {allergy}. {med} may have low cross-reactivity.",
                    "recommendation": allergy_info.get("notes", "Use with caution if essential. Have emergency treatment available.")
                })
    
    return alerts


def get_drug_class(drug_name: str) -> Optional[str]:
    """Get the therapeutic class for a drug"""
    drug_norm = drug_name.lower().strip()
    
    for drug_class, drugs in DRUG_CLASSES.items():
        if drug_norm in drugs:
            return drug_class
    
    return None


def detect_therapeutic_duplication(medications: List[str]) -> List[Dict]:
    """Detect drugs from the same therapeutic class"""
    class_drugs: Dict[str, List[str]] = {}
    
    for med in medications:
        drug_class = get_drug_class(med)
        if drug_class:
            if drug_class not in class_drugs:
                class_drugs[drug_class] = []
            class_drugs[drug_class].append(med)
    
    duplications = []
    for drug_class, drugs in class_drugs.items():
        if len(drugs) > 1:
            # Determine severity based on class
            high_risk_classes = ["ace_inhibitors", "anticoagulants_oral", "nsaids", "opioids", "benzodiazepines"]
            severity = "high" if drug_class in high_risk_classes else "moderate"
            
            duplications.append({
                "drug_class": drug_class,
                "medications": drugs,
                "severity": severity,
                "message": f"Multiple {drug_class.replace('_', ' ')}: {', '.join(drugs)}",
                "recommendation": "Review if multiple agents from same class are necessary"
            })
    
    return duplications
