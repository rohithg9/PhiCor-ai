"""
Comprehensive drug database with evidence-based medications
Includes international brand names for UK, USA, and India
Based on WHO Essential Medicines List and clinical guidelines
"""

COMPREHENSIVE_DRUGS = [
    # ============== DIURETICS ==============
    {
        "id": "hydrochlorothiazide",
        "name": "Hydrochlorothiazide",
        "brand_names": ["Microzide (USA)", "HydroSaluric (UK)", "Aquazide (India)", "Esidrix"],
        "drug_class": "Thiazide Diuretic",
        "category": "cardiovascular",
        "mechanism_of_action": "Inhibits sodium-chloride cotransporter (NCC) in the distal convoluted tubule, promoting natriuresis and diuresis. Also has direct vasodilatory effects.",
        "mechanism_short": "Thiazide diuretic → ↓ Na/Cl reabsorption → ↓ BP",
        "target_receptors": ["NCC (sodium-chloride cotransporter)"],
        "dosages": [
            {"route": "oral", "form": "tablet", "strength": "12.5mg, 25mg, 50mg", "typical_dose": "12.5-25mg once daily", "max_daily_dose": "50mg", "frequency": "once daily", "special_instructions": "Take in morning to avoid nocturia; higher doses not more effective for BP"}
        ],
        "therapeutic_effects": [
            {
                "effect_type": "therapeutic",
                "description": "First-line antihypertensive; ALLHAT showed equivalent outcomes to ACEi/CCB",
                "onset_hours": 2,
                "duration_hours": 12,
                "organs": [
                    {"organ_id": "heart", "scales": [
                        {"scale_id": "pressures", "parameters": [
                            {"parameter_id": "aortic_systolic", "multiplier": 0.88, "note": "↓12% systolic BP"},
                            {"parameter_id": "aortic_diastolic", "multiplier": 0.92, "note": "↓8% diastolic BP"}
                        ]}
                    ]},
                    {"organ_id": "kidneys", "scales": [
                        {"scale_id": "physiology", "parameters": [
                            {"parameter_id": "urine_output", "multiplier": 1.40, "note": "↑40% urine output (initial)"},
                            {"parameter_id": "sodium_excretion", "multiplier": 1.30, "note": "↑30% Na excretion"}
                        ]}
                    ]}
                ]
            }
        ],
        "side_effects": [
            {
                "effect_type": "side_effect",
                "description": "Electrolyte disturbances, hyperuricemia, glucose intolerance",
                "organs": [
                    {"organ_id": "kidneys", "scales": [
                        {"scale_id": "physiology", "parameters": [
                            {"parameter_id": "potassium", "multiplier": 0.88, "note": "↓12% serum K+ (hypokalemia)"},
                            {"parameter_id": "sodium", "multiplier": 0.95, "note": "↓5% serum Na (hyponatremia risk)"}
                        ]}
                    ]}
                ]
            }
        ],
        "indications": [
            {"disease_id": "hypertension", "disease_name": "Essential Hypertension", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "edema", "disease_name": "Mild Edema", "is_primary": False, "efficacy_level": "moderate", "evidence_grade": "B"},
            {"disease_id": "nephrolithiasis", "disease_name": "Calcium Nephrolithiasis Prevention", "is_primary": False, "efficacy_level": "moderate", "evidence_grade": "B"}
        ],
        "contraindications": ["Anuria", "Severe renal impairment (CrCl < 30)", "Sulfonamide allergy (potential cross-reactivity)", "Severe hypokalemia"],
        "warnings": ["Monitor electrolytes regularly", "May worsen gout", "Photosensitivity"],
        "interactions": [
            {"interacting_drug_id": "lithium", "interacting_drug_name": "Lithium", "severity": "moderate", "effect": "↑ lithium levels (reduced clearance)", "clinical_note": "Monitor lithium closely"},
            {"interacting_drug_id": "digoxin", "interacting_drug_name": "Digoxin", "severity": "moderate", "effect": "Hypokalemia increases digoxin toxicity risk", "clinical_note": "Monitor K+ and digoxin levels"}
        ],
        "half_life": "6-15 hours",
        "pregnancy_category": "B",
        "fda_approval_year": 1959
    },
    {
        "id": "indapamide",
        "name": "Indapamide",
        "brand_names": ["Lozol (USA)", "Natrilix (UK)", "Lorvas (India)"],
        "drug_class": "Thiazide-like Diuretic",
        "category": "cardiovascular",
        "mechanism_of_action": "Thiazide-like diuretic with additional direct vascular smooth muscle relaxation. Better metabolic profile than traditional thiazides.",
        "mechanism_short": "Thiazide-like + vasodilator → ↓ BP with less metabolic effects",
        "target_receptors": ["NCC"],
        "dosages": [
            {"route": "oral", "form": "tablet", "strength": "1.25mg, 2.5mg", "typical_dose": "1.25-2.5mg once daily", "max_daily_dose": "5mg", "frequency": "once daily", "special_instructions": "1.25mg SR formulation has better tolerability"}
        ],
        "therapeutic_effects": [
            {
                "effect_type": "therapeutic",
                "description": "HYVET trial: reduced stroke by 30% and all-cause mortality by 21% in elderly",
                "onset_hours": 1,
                "duration_hours": 24,
                "organs": [
                    {"organ_id": "heart", "scales": [
                        {"scale_id": "pressures", "parameters": [
                            {"parameter_id": "aortic_systolic", "multiplier": 0.85, "note": "↓15% systolic BP"},
                            {"parameter_id": "aortic_diastolic", "multiplier": 0.90, "note": "↓10% diastolic BP"}
                        ]}
                    ]}
                ]
            }
        ],
        "indications": [
            {"disease_id": "hypertension", "disease_name": "Essential Hypertension", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"}
        ],
        "contraindications": ["Severe renal impairment", "Hepatic encephalopathy", "Hypokalemia"],
        "warnings": ["Less metabolic disturbance than HCTZ but still monitor", "QT prolongation with severe hypokalemia"],
        "half_life": "14-18 hours",
        "pregnancy_category": "B",
        "fda_approval_year": 1983
    },
    # ============== CALCIUM CHANNEL BLOCKERS ==============
    {
        "id": "amlodipine",
        "name": "Amlodipine",
        "brand_names": ["Norvasc (USA/UK)", "Amlopress (India)", "Istin", "Amlip"],
        "drug_class": "Calcium Channel Blocker (Dihydropyridine)",
        "category": "cardiovascular",
        "mechanism_of_action": "Inhibits L-type calcium channels in vascular smooth muscle, causing vasodilation. Long half-life provides 24-hour BP control with once-daily dosing.",
        "mechanism_short": "DHP CCB → peripheral vasodilation → ↓ BP",
        "target_receptors": ["L-type calcium channel"],
        "dosages": [
            {"route": "oral", "form": "tablet", "strength": "2.5mg, 5mg, 10mg", "typical_dose": "5-10mg once daily", "max_daily_dose": "10mg", "frequency": "once daily", "special_instructions": "No food restrictions; can be taken any time of day"}
        ],
        "therapeutic_effects": [
            {
                "effect_type": "therapeutic",
                "description": "ALLHAT demonstrated cardiovascular protection equivalent to ACEi/diuretics",
                "onset_hours": 6,
                "duration_hours": 24,
                "organs": [
                    {"organ_id": "heart", "scales": [
                        {"scale_id": "pressures", "parameters": [
                            {"parameter_id": "aortic_systolic", "multiplier": 0.82, "note": "↓18% systolic BP"},
                            {"parameter_id": "aortic_diastolic", "multiplier": 0.85, "note": "↓15% diastolic BP"},
                            {"parameter_id": "svr", "multiplier": 0.75, "note": "↓25% SVR"}
                        ]},
                        {"scale_id": "physiology", "parameters": [
                            {"parameter_id": "coronary_flow", "multiplier": 1.20, "note": "↑20% coronary blood flow"}
                        ]}
                    ]}
                ]
            }
        ],
        "side_effects": [
            {
                "effect_type": "side_effect",
                "description": "Peripheral edema (dose-dependent), headache, flushing",
                "organs": []
            }
        ],
        "indications": [
            {"disease_id": "hypertension", "disease_name": "Essential Hypertension", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "angina", "disease_name": "Stable Angina", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "coronary_spasm", "disease_name": "Vasospastic Angina", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"}
        ],
        "contraindications": ["Severe aortic stenosis", "Cardiogenic shock", "Unstable angina"],
        "warnings": ["Peripheral edema may require dose reduction", "Avoid grapefruit juice"],
        "interactions": [
            {"interacting_drug_id": "simvastatin", "interacting_drug_name": "Simvastatin", "severity": "moderate", "effect": "↑ simvastatin levels", "clinical_note": "Limit simvastatin to 20mg daily"}
        ],
        "half_life": "30-50 hours",
        "pregnancy_category": "C",
        "fda_approval_year": 1987
    },
    {
        "id": "diltiazem",
        "name": "Diltiazem",
        "brand_names": ["Cardizem (USA)", "Tildiem (UK)", "Dilzem (India)", "Adizem"],
        "drug_class": "Calcium Channel Blocker (Benzothiazepine)",
        "category": "cardiovascular",
        "mechanism_of_action": "Non-dihydropyridine CCB affecting both vascular smooth muscle and cardiac conduction. Slows AV node conduction and reduces contractility.",
        "mechanism_short": "Non-DHP CCB → vasodilation + ↓ AV conduction + negative inotropy",
        "target_receptors": ["L-type calcium channel (cardiac and vascular)"],
        "dosages": [
            {"route": "oral", "form": "extended-release tablet", "strength": "120mg, 180mg, 240mg, 300mg, 360mg", "typical_dose": "120-360mg once daily", "max_daily_dose": "480mg", "frequency": "once daily (ER) or 3-4 times daily (IR)", "special_instructions": "Do not crush extended-release formulations"}
        ],
        "therapeutic_effects": [
            {
                "effect_type": "therapeutic",
                "description": "Rate control in atrial fibrillation and antihypertensive/antianginal effects",
                "onset_hours": 2,
                "duration_hours": 24,
                "organs": [
                    {"organ_id": "heart", "scales": [
                        {"scale_id": "physiology", "parameters": [
                            {"parameter_id": "heart_rate", "multiplier": 0.85, "note": "↓15% heart rate (rate control in AFib)"},
                            {"parameter_id": "av_conduction", "multiplier": 0.75, "note": "↓25% AV conduction velocity"}
                        ]},
                        {"scale_id": "pressures", "parameters": [
                            {"parameter_id": "aortic_systolic", "multiplier": 0.85, "note": "↓15% systolic BP"},
                            {"parameter_id": "aortic_diastolic", "multiplier": 0.88, "note": "↓12% diastolic BP"}
                        ]}
                    ]}
                ]
            }
        ],
        "indications": [
            {"disease_id": "atrial_fibrillation", "disease_name": "Atrial Fibrillation (rate control)", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "hypertension", "disease_name": "Hypertension", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "angina", "disease_name": "Stable/Vasospastic Angina", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"}
        ],
        "contraindications": ["Severe bradycardia", "AV block (2nd/3rd degree) without pacemaker", "Sick sinus syndrome", "Acute MI with pulmonary congestion", "WPW with atrial fibrillation"],
        "warnings": ["Negative inotrope - use cautiously in HF", "Avoid with beta blockers (IV)"],
        "interactions": [
            {"interacting_drug_id": "beta_blockers", "interacting_drug_name": "Beta Blockers", "severity": "severe", "effect": "Additive AV block, bradycardia, hypotension", "clinical_note": "Avoid IV combination; oral needs caution"},
            {"interacting_drug_id": "cyclosporine", "interacting_drug_name": "Cyclosporine", "severity": "moderate", "effect": "↑ cyclosporine levels", "clinical_note": "Monitor cyclosporine levels"}
        ],
        "half_life": "3-5 hours (IR), 6-9 hours (ER)",
        "pregnancy_category": "C",
        "fda_approval_year": 1982
    },
    # ============== STATINS ==============
    {
        "id": "atorvastatin",
        "name": "Atorvastatin",
        "brand_names": ["Lipitor (USA/UK)", "Atorva (India)", "Sortis", "Torvast"],
        "drug_class": "HMG-CoA Reductase Inhibitor (Statin)",
        "category": "cardiovascular",
        "mechanism_of_action": "Inhibits HMG-CoA reductase, the rate-limiting enzyme in cholesterol synthesis. Upregulates LDL receptors in liver, reducing circulating LDL-C. Has pleiotropic effects including anti-inflammatory and endothelial stabilization.",
        "mechanism_short": "Statin → ↓ cholesterol synthesis → ↓ LDL-C 40-50%",
        "target_receptors": ["HMG-CoA reductase"],
        "dosages": [
            {"route": "oral", "form": "tablet", "strength": "10mg, 20mg, 40mg, 80mg", "typical_dose": "10-80mg once daily", "max_daily_dose": "80mg", "frequency": "once daily", "special_instructions": "Can be taken any time of day, with or without food"}
        ],
        "therapeutic_effects": [
            {
                "effect_type": "therapeutic",
                "description": "TNT trial: 80mg reduced CV events by 22% vs 10mg in stable CAD",
                "onset_hours": 24,
                "duration_hours": 24,
                "organs": [
                    {"organ_id": "liver", "scales": [
                        {"scale_id": "physiology", "parameters": [
                            {"parameter_id": "ldl_cholesterol", "multiplier": 0.50, "note": "↓50% LDL-C (at 80mg)"},
                            {"parameter_id": "total_cholesterol", "multiplier": 0.65, "note": "↓35% total cholesterol"},
                            {"parameter_id": "triglycerides", "multiplier": 0.80, "note": "↓20% triglycerides"},
                            {"parameter_id": "hdl_cholesterol", "multiplier": 1.08, "note": "↑8% HDL-C"}
                        ]}
                    ]},
                    {"organ_id": "heart", "scales": [
                        {"scale_id": "physiology", "parameters": [
                            {"parameter_id": "plaque_stability", "multiplier": 1.30, "note": "↑30% plaque stabilization"},
                            {"parameter_id": "endothelial_function", "multiplier": 1.15, "note": "↑15% endothelial function"}
                        ]}
                    ]}
                ]
            }
        ],
        "side_effects": [
            {
                "effect_type": "side_effect",
                "description": "Myalgia (5-10%), elevated transaminases, rare rhabdomyolysis",
                "organs": [
                    {"organ_id": "liver", "scales": [
                        {"scale_id": "physiology", "parameters": [
                            {"parameter_id": "alt", "multiplier": 1.10, "note": "↑10% ALT (usually < 3x ULN)"}
                        ]}
                    ]}
                ]
            }
        ],
        "indications": [
            {"disease_id": "hyperlipidemia", "disease_name": "Primary Hypercholesterolemia", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "cv_prevention", "disease_name": "Cardiovascular Prevention (primary/secondary)", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "acs", "disease_name": "Acute Coronary Syndrome", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"}
        ],
        "contraindications": ["Active liver disease", "Pregnancy", "Breastfeeding", "Unexplained persistent LFT elevation"],
        "warnings": ["Check LFTs before and during therapy", "Report unexplained muscle pain", "Diabetes risk slightly increased"],
        "interactions": [
            {"interacting_drug_id": "clarithromycin", "interacting_drug_name": "Clarithromycin", "severity": "moderate", "effect": "↑ atorvastatin levels via CYP3A4", "clinical_note": "Limit atorvastatin dose or use alternative"},
            {"interacting_drug_id": "gemfibrozil", "interacting_drug_name": "Gemfibrozil", "severity": "severe", "effect": "↑ myopathy/rhabdomyolysis risk", "clinical_note": "Avoid combination; use fenofibrate instead"}
        ],
        "half_life": "14 hours",
        "pregnancy_category": "X",
        "fda_approval_year": 1996
    },
    {
        "id": "rosuvastatin",
        "name": "Rosuvastatin",
        "brand_names": ["Crestor (USA/UK)", "Rozavel (India)", "Rosuvas"],
        "drug_class": "HMG-CoA Reductase Inhibitor (Statin)",
        "category": "cardiovascular",
        "mechanism_of_action": "Most potent statin per milligram. Hydrophilic, so less muscle penetration and potentially lower myopathy risk. Not significantly metabolized by CYP3A4.",
        "mechanism_short": "High-potency statin → ↓ LDL-C up to 55%",
        "target_receptors": ["HMG-CoA reductase"],
        "dosages": [
            {"route": "oral", "form": "tablet", "strength": "5mg, 10mg, 20mg, 40mg", "typical_dose": "5-20mg once daily", "max_daily_dose": "40mg", "frequency": "once daily", "special_instructions": "40mg reserved for patients not achieving goal on 20mg"}
        ],
        "therapeutic_effects": [
            {
                "effect_type": "therapeutic",
                "description": "JUPITER trial: 44% reduction in CV events in patients with elevated hsCRP",
                "onset_hours": 24,
                "duration_hours": 24,
                "organs": [
                    {"organ_id": "liver", "scales": [
                        {"scale_id": "physiology", "parameters": [
                            {"parameter_id": "ldl_cholesterol", "multiplier": 0.45, "note": "↓55% LDL-C (at 40mg)"},
                            {"parameter_id": "hdl_cholesterol", "multiplier": 1.12, "note": "↑12% HDL-C"},
                            {"parameter_id": "crp", "multiplier": 0.60, "note": "↓40% hsCRP (anti-inflammatory)"}
                        ]}
                    ]}
                ]
            }
        ],
        "indications": [
            {"disease_id": "hyperlipidemia", "disease_name": "Hypercholesterolemia", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "cv_prevention", "disease_name": "Primary Prevention of CV Disease", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"}
        ],
        "contraindications": ["Active liver disease", "Pregnancy", "Breastfeeding", "Severe renal impairment (for 40mg dose)"],
        "warnings": ["Asian patients may need lower starting dose (5mg)", "Proteinuria possible at high doses"],
        "interactions": [
            {"interacting_drug_id": "cyclosporine", "interacting_drug_name": "Cyclosporine", "severity": "severe", "effect": "↑7x rosuvastatin levels", "clinical_note": "Contraindicated"},
            {"interacting_drug_id": "warfarin", "interacting_drug_name": "Warfarin", "severity": "moderate", "effect": "↑ INR", "clinical_note": "Monitor INR when initiating"}
        ],
        "half_life": "19 hours",
        "pregnancy_category": "X",
        "fda_approval_year": 2003
    },
    # ============== ANTICOAGULANTS ==============
    {
        "id": "apixaban",
        "name": "Apixaban",
        "brand_names": ["Eliquis (USA/UK/India)"],
        "drug_class": "Direct Factor Xa Inhibitor (DOAC)",
        "category": "cardiovascular",
        "mechanism_of_action": "Direct, selective, reversible inhibitor of Factor Xa (free and clot-bound). Does not require antithrombin for activity. Predictable pharmacokinetics without routine monitoring.",
        "mechanism_short": "Factor Xa inhibitor → anticoagulation without monitoring",
        "target_receptors": ["Factor Xa"],
        "dosages": [
            {"route": "oral", "form": "tablet", "strength": "2.5mg, 5mg", "typical_dose": "5mg twice daily (AF); 2.5mg twice daily (reduce if: age ≥80, weight ≤60kg, or Cr ≥1.5)", "max_daily_dose": "10mg", "frequency": "twice daily", "special_instructions": "No food restrictions; can crush tablet"}
        ],
        "therapeutic_effects": [
            {
                "effect_type": "therapeutic",
                "description": "ARISTOTLE trial: superior to warfarin for stroke prevention with 31% less major bleeding",
                "onset_hours": 3,
                "duration_hours": 12,
                "organs": [
                    {"organ_id": "heart", "scales": [
                        {"scale_id": "physiology", "parameters": [
                            {"parameter_id": "stroke_risk", "multiplier": 0.79, "note": "↓21% stroke/systemic embolism vs warfarin"},
                            {"parameter_id": "bleeding_risk", "multiplier": 0.69, "note": "↓31% major bleeding vs warfarin"}
                        ]}
                    ]}
                ]
            }
        ],
        "indications": [
            {"disease_id": "atrial_fibrillation", "disease_name": "Non-valvular Atrial Fibrillation", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "dvt_pe", "disease_name": "DVT/PE Treatment and Prevention", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "vte_prophylaxis", "disease_name": "VTE Prophylaxis (hip/knee replacement)", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"}
        ],
        "contraindications": ["Active pathological bleeding", "Severe hepatic impairment", "Prosthetic heart valve", "Antiphospholipid syndrome"],
        "warnings": ["Discontinue 24-48h before procedures", "Spinal/epidural hematoma risk with neuraxial anesthesia", "Reversal agent: andexanet alfa"],
        "interactions": [
            {"interacting_drug_id": "ketoconazole", "interacting_drug_name": "Strong CYP3A4/P-gp inhibitors", "severity": "severe", "effect": "↑ apixaban levels", "clinical_note": "Reduce dose or avoid"},
            {"interacting_drug_id": "rifampin", "interacting_drug_name": "Strong CYP3A4/P-gp inducers", "severity": "severe", "effect": "↓ apixaban levels by 50%", "clinical_note": "Avoid combination"}
        ],
        "half_life": "12 hours",
        "pregnancy_category": "B",
        "fda_approval_year": 2012
    },
    {
        "id": "rivaroxaban",
        "name": "Rivaroxaban",
        "brand_names": ["Xarelto (USA/UK/India)"],
        "drug_class": "Direct Factor Xa Inhibitor (DOAC)",
        "category": "cardiovascular",
        "mechanism_of_action": "Direct Factor Xa inhibitor with once-daily dosing for most indications. High bioavailability when taken with food.",
        "mechanism_short": "Factor Xa inhibitor → once-daily anticoagulation",
        "target_receptors": ["Factor Xa"],
        "dosages": [
            {"route": "oral", "form": "tablet", "strength": "2.5mg, 10mg, 15mg, 20mg", "typical_dose": "20mg once daily with evening meal (AF); 15mg twice daily x21 days then 20mg daily (DVT/PE)", "max_daily_dose": "20mg", "frequency": "once or twice daily depending on indication", "special_instructions": "Take 15mg and 20mg doses with food for optimal absorption"}
        ],
        "therapeutic_effects": [
            {
                "effect_type": "therapeutic",
                "description": "ROCKET-AF: non-inferior to warfarin; COMPASS: 24% CV event reduction with 2.5mg + aspirin",
                "onset_hours": 2,
                "duration_hours": 24,
                "organs": [
                    {"organ_id": "heart", "scales": [
                        {"scale_id": "physiology", "parameters": [
                            {"parameter_id": "stroke_risk", "multiplier": 0.79, "note": "↓21% stroke vs warfarin"},
                            {"parameter_id": "cv_death", "multiplier": 0.76, "note": "↓24% CV death with low-dose + aspirin (CAD)"}
                        ]}
                    ]}
                ]
            }
        ],
        "indications": [
            {"disease_id": "atrial_fibrillation", "disease_name": "Non-valvular AF", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "dvt_pe", "disease_name": "DVT/PE Treatment", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "cad_pad", "disease_name": "CAD/PAD (low-dose + aspirin)", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"}
        ],
        "contraindications": ["Active bleeding", "Severe hepatic impairment (Child-Pugh B/C with coagulopathy)"],
        "warnings": ["Renal dose adjustment if CrCl < 50", "Take with food for 15/20mg doses"],
        "interactions": [
            {"interacting_drug_id": "ketoconazole", "interacting_drug_name": "CYP3A4/P-gp inhibitors", "severity": "severe", "effect": "↑ rivaroxaban levels", "clinical_note": "Avoid strong inhibitors"},
            {"interacting_drug_id": "aspirin", "interacting_drug_name": "Aspirin", "severity": "moderate", "effect": "↑ bleeding risk", "clinical_note": "Used intentionally in CAD/PAD at low doses"}
        ],
        "half_life": "5-9 hours (healthy), 11-13 hours (elderly)",
        "pregnancy_category": "C",
        "fda_approval_year": 2011
    },
    # ============== ANTIPLATELET AGENTS ==============
    {
        "id": "clopidogrel",
        "name": "Clopidogrel",
        "brand_names": ["Plavix (USA/UK)", "Clopilet (India)", "Ceruvin"],
        "drug_class": "P2Y12 Inhibitor (Thienopyridine)",
        "category": "cardiovascular",
        "mechanism_of_action": "Prodrug requiring hepatic CYP2C19 activation. Active metabolite irreversibly inhibits P2Y12 ADP receptor on platelets, preventing platelet aggregation for platelet lifespan (7-10 days).",
        "mechanism_short": "P2Y12 inhibitor → irreversible antiplatelet effect",
        "target_receptors": ["P2Y12 (ADP receptor)"],
        "dosages": [
            {"route": "oral", "form": "tablet", "strength": "75mg, 300mg", "typical_dose": "75mg once daily; 300-600mg loading dose for ACS/PCI", "max_daily_dose": "75mg maintenance", "frequency": "once daily", "special_instructions": "Can be taken with or without food"}
        ],
        "therapeutic_effects": [
            {
                "effect_type": "therapeutic",
                "description": "CAPRIE: 8.7% relative risk reduction vs aspirin; essential for DAPT post-stent",
                "onset_hours": 2,
                "duration_hours": 24,
                "organs": [
                    {"organ_id": "heart", "scales": [
                        {"scale_id": "physiology", "parameters": [
                            {"parameter_id": "platelet_aggregation", "multiplier": 0.40, "note": "↓60% ADP-induced aggregation"},
                            {"parameter_id": "stent_thrombosis", "multiplier": 0.50, "note": "↓50% stent thrombosis risk"}
                        ]}
                    ]}
                ]
            }
        ],
        "indications": [
            {"disease_id": "acs", "disease_name": "Acute Coronary Syndrome", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "post_pci", "disease_name": "Post-PCI/Stent (DAPT)", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "stroke", "disease_name": "Secondary Stroke Prevention", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "pad", "disease_name": "Peripheral Arterial Disease", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"}
        ],
        "contraindications": ["Active pathological bleeding", "Severe hepatic impairment"],
        "warnings": ["CYP2C19 poor metabolizers have reduced efficacy (consider genetic testing)", "Hold 5-7 days before surgery"],
        "interactions": [
            {"interacting_drug_id": "omeprazole", "interacting_drug_name": "Omeprazole", "severity": "moderate", "effect": "↓ clopidogrel activation via CYP2C19 inhibition", "clinical_note": "Use pantoprazole instead"},
            {"interacting_drug_id": "aspirin", "interacting_drug_name": "Aspirin", "severity": "beneficial", "effect": "Synergistic antiplatelet effect (DAPT)", "clinical_note": "Standard combination post-ACS"}
        ],
        "half_life": "6 hours (parent), but irreversible effect",
        "pregnancy_category": "B",
        "fda_approval_year": 1997
    },
    {
        "id": "ticagrelor",
        "name": "Ticagrelor",
        "brand_names": ["Brilinta (USA)", "Brilique (UK)", "Axcer (India)"],
        "drug_class": "P2Y12 Inhibitor (Cyclopentyltriazolopyrimidine)",
        "category": "cardiovascular",
        "mechanism_of_action": "Direct-acting, reversible P2Y12 inhibitor. Does not require metabolic activation. Faster onset and offset than clopidogrel. Also inhibits adenosine reuptake.",
        "mechanism_short": "Reversible P2Y12 inhibitor → faster, stronger antiplatelet effect",
        "target_receptors": ["P2Y12 (ADP receptor)", "ENT1 (adenosine transporter)"],
        "dosages": [
            {"route": "oral", "form": "tablet", "strength": "60mg, 90mg", "typical_dose": "180mg loading, then 90mg twice daily (ACS); 60mg twice daily (post-MI maintenance)", "max_daily_dose": "180mg", "frequency": "twice daily", "special_instructions": "Can crush tablet and mix with water"}
        ],
        "therapeutic_effects": [
            {
                "effect_type": "therapeutic",
                "description": "PLATO trial: 16% reduction in CV death vs clopidogrel in ACS",
                "onset_hours": 0.5,
                "duration_hours": 12,
                "organs": [
                    {"organ_id": "heart", "scales": [
                        {"scale_id": "physiology", "parameters": [
                            {"parameter_id": "platelet_aggregation", "multiplier": 0.30, "note": "↓70% platelet aggregation"},
                            {"parameter_id": "cv_death", "multiplier": 0.84, "note": "↓16% CV death vs clopidogrel"}
                        ]}
                    ]}
                ]
            }
        ],
        "side_effects": [
            {
                "effect_type": "side_effect",
                "description": "Dyspnea (14%), bradycardia, ventricular pauses (usually asymptomatic)",
                "organs": []
            }
        ],
        "indications": [
            {"disease_id": "acs", "disease_name": "Acute Coronary Syndrome", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
            {"disease_id": "post_mi", "disease_name": "Post-MI (long-term prevention)", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"}
        ],
        "contraindications": ["Active bleeding", "History of intracranial hemorrhage", "Severe hepatic impairment", "Use with strong CYP3A4 inhibitors"],
        "warnings": ["Dyspnea is common but usually transient", "Avoid aspirin doses > 100mg", "Hold 5 days before surgery"],
        "interactions": [
            {"interacting_drug_id": "ketoconazole", "interacting_drug_name": "Strong CYP3A4 inhibitors", "severity": "severe", "effect": "↑ ticagrelor levels", "clinical_note": "Contraindicated"},
            {"interacting_drug_id": "digoxin", "interacting_drug_name": "Digoxin", "severity": "moderate", "effect": "↑ digoxin levels via P-gp inhibition", "clinical_note": "Monitor digoxin"}
        ],
        "half_life": "7 hours (parent), 9 hours (active metabolite)",
        "pregnancy_category": "C",
        "fda_approval_year": 2011
    }
]