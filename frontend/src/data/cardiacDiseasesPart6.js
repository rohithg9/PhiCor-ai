// ============================================================
// CARDIAC DISEASES DATABASE - PART 6
// ICD-10 Chapter IX: Diseases of the Circulatory System (I00-I99)
// Covering: Peripheral Vascular (I70-I79), Venous (I80-I89), Other (I95-I99)
// ============================================================

export const CARDIAC_DISEASES_PART6 = {
  // =====================
  // DISEASES OF ARTERIES, ARTERIOLES AND CAPILLARIES (I70-I79)
  // =====================
  
  I70_0: {
    name: "Atherosclerosis of Aorta",
    icd10: "I70.0",
    category: "vascular",
    definition: "Atherosclerotic disease of the aorta",
    primaryOrgan: "aorta",
    affectedOrgans: ["aorta", "heart", "kidneys"],
    pathophysiology: {
      mechanism: "Lipid accumulation → foam cells → plaque formation → calcification",
      equations: {
        agatstonScore: {
          name: "Agatston Calcium Score",
          latex: "\\text{Score} = \\sum_{i} A_i \\times CF_i",
          description: "Area × density coefficient for coronary/aortic calcification",
          isNovel: false
        },
        plaqueBurden: {
          name: "Total Plaque Burden",
          latex: "TPB = \\frac{\\text{Vessel Area} - \\text{Lumen Area}}{\\text{Vessel Area}} \\times 100",
          description: "Percentage plaque area",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Often asymptomatic", "Claudication if aortoiliac", "Renovascular HTN if renal artery involved"],
      signs: ["Diminished pulses", "Bruits", "Blood pressure discrepancy"]
    },
    imagingFindings: {
      ct: ["Calcified plaques", "Wall thickening", "Aneurysmal dilation"],
      ultrasound: ["Intimal-medial thickening", "Plaque morphology"]
    }
  },

  I70_2: {
    name: "Atherosclerosis of Native Arteries of Extremities",
    icd10: "I70.2",
    category: "vascular",
    definition: "Peripheral arterial disease of lower extremities",
    primaryOrgan: "legs",
    affectedOrgans: ["legs", "heart"],
    pathophysiology: {
      mechanism: "Arterial stenosis → reduced limb perfusion → claudication → critical limb ischemia",
      equations: {
        abi: {
          name: "Ankle-Brachial Index",
          latex: "ABI = \\frac{\\text{Ankle SBP}}{\\text{Brachial SBP}}",
          description: "Normal >0.9; <0.4 severe PAD",
          isNovel: false
        },
        walkingImpairment: {
          name: "Walking Impairment Questionnaire",
          latex: "WIQ = \\frac{\\sum \\text{Distance}_i \\times \\text{Difficulty}_i}{\\text{Max Score}} \\times 100",
          description: "Functional assessment of claudication",
          isNovel: false
        },
        criticalLimbIschemia: {
          name: "CLI Risk Score",
          latex: "\\text{GLASS} = \\text{FP} + \\text{IP} + \\text{WIfI}",
          description: "Global Limb Anatomic Staging System",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Intermittent claudication", "Rest pain", "Non-healing wounds"],
      signs: ["Diminished pulses", "Hair loss", "Pallor on elevation", "Dependent rubor"]
    },
    laboratoryFindings: [
      { name: "ABI", normalRange: "0.9-1.3", abnormalInDisease: "<0.9 diagnostic" }
    ],
    severity: {
      mild: { description: "Fontaine I/IIa - Asymptomatic or mild claudication" },
      moderate: { description: "Fontaine IIb - Moderate to severe claudication" },
      severe: { description: "Fontaine III/IV - Rest pain or tissue loss" }
    }
  },

  I71_0: {
    name: "Dissection of Aorta (Thoracic)",
    icd10: "I71.0",
    category: "vascular",
    definition: "Tear in the aortic intima with blood tracking into the media",
    primaryOrgan: "aorta",
    affectedOrgans: ["aorta", "heart", "brain", "kidneys"],
    pathophysiology: {
      mechanism: "Intimal tear → blood enters media → creates false lumen → propagates",
      equations: {
        stanfordClassification: {
          name: "Stanford Classification",
          latex: "\\text{Type} = \\begin{cases} A & \\text{Involves ascending aorta} \\\\ B & \\text{Descending only} \\end{cases}",
          description: "Guides surgical vs medical management",
          isNovel: false
        },
        falseChannelRisk: {
          name: "False Lumen Thrombosis Prediction",
          latex: "\\text{FLT} = f(\\text{FL diameter}, \\text{Entry tear size}, \\text{Branch vessel involvement})",
          description: "Predicts likelihood of false lumen thrombosis",
          isNovel: true
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Tearing chest pain", "Pain radiating to back", "Syncope"],
      signs: ["Blood pressure differential between arms", "Aortic regurgitation murmur", "Pulse deficits"]
    },
    imagingFindings: {
      ctAngiography: ["Intimal flap", "True and false lumen", "Branch vessel involvement"],
      echocardiography: ["Intimal flap in aortic root", "Pericardial effusion", "AR"]
    },
    severity: {
      mild: { description: "Type B, uncomplicated, stable" },
      moderate: { description: "Type B with malperfusion or refractory pain" },
      severe: { description: "Type A or Type B with rupture/malperfusion" }
    }
  },

  I71_3: {
    name: "Abdominal Aortic Aneurysm, Ruptured",
    icd10: "I71.3",
    category: "vascular",
    definition: "Rupture of aneurysmal dilation of the abdominal aorta",
    primaryOrgan: "aorta",
    affectedOrgans: ["aorta"],
    pathophysiology: {
      mechanism: "Wall tension exceeds tensile strength → rupture → hemorrhage",
      equations: {
        ruptureRisk: {
          name: "AAA Rupture Risk (Laplace)",
          latex: "T = \\frac{P \\times D}{2t}",
          description: "Wall tension increases with pressure and diameter",
          isNovel: false
        },
        diameterThreshold: {
          name: "Rupture Risk by Diameter",
          latex: "\\text{Annual Risk} = \\begin{cases} <1\\% & D < 4cm \\\\ 1-11\\% & 4-5cm \\\\ 10-22\\% & 5-6cm \\\\ 30-33\\% & >6cm \\end{cases}",
          description: "Size-based rupture risk stratification",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Sudden severe abdominal/back pain", "Syncope", "Shock"],
      signs: ["Pulsatile abdominal mass", "Hypotension", "Flank ecchymosis (Grey Turner)"]
    }
  },

  I71_4: {
    name: "Abdominal Aortic Aneurysm, Without Rupture",
    icd10: "I71.4",
    category: "vascular",
    definition: "Aneurysmal dilation of abdominal aorta ≥3 cm without rupture",
    primaryOrgan: "aorta",
    affectedOrgans: ["aorta"],
    pathophysiology: {
      mechanism: "Degeneration of elastin and collagen → progressive dilation",
      equations: {
        growthRate: {
          name: "AAA Growth Rate",
          latex: "\\frac{dD}{dt} \\approx 0.2-0.5 \\text{ cm/year}",
          description: "Average growth rate; accelerates with larger diameter",
          isNovel: false
        },
        repairThreshold: {
          name: "Repair Indication",
          latex: "\\text{Repair if } D \\geq 5.5 \\text{ cm (men)} \\text{ or } \\geq 5.0 \\text{ cm (women)}",
          description: "Or growth >0.5 cm/6 months",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Usually asymptomatic", "Vague abdominal discomfort", "Back pain"],
      signs: ["Pulsatile abdominal mass"]
    },
    imagingFindings: {
      ultrasound: ["Maximal AP diameter", "Presence of thrombus"],
      ct: ["Precise measurements", "Branch vessel anatomy", "Rupture signs"]
    }
  },

  I73_0: {
    name: "Raynaud's Syndrome",
    icd10: "I73.0",
    category: "vascular",
    definition: "Episodic vasospasm of digital arteries causing color changes",
    primaryOrgan: "hands",
    affectedOrgans: ["hands", "feet"],
    pathophysiology: {
      mechanism: "Excessive vasoconstriction to cold/stress → digital ischemia",
      equations: {
        digitalPressure: {
          name: "Digital Brachial Pressure Index",
          latex: "DBPI = \\frac{\\text{Digital pressure}}{\\text{Brachial pressure}}",
          description: "Normal >0.7; <0.6 suggests organic disease",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Triphasic color changes (white→blue→red)", "Numbness", "Pain during attacks"],
      signs: ["Cyanosis", "Pallor", "Rubor of digits"]
    }
  },

  I74_3: {
    name: "Embolism and Thrombosis of Lower Extremity Arteries",
    icd10: "I74.3",
    category: "vascular",
    definition: "Acute arterial occlusion of lower limb",
    primaryOrgan: "legs",
    affectedOrgans: ["legs"],
    pathophysiology: {
      mechanism: "Thrombotic or embolic occlusion → acute limb ischemia",
      equations: {
        rutherfordClass: {
          name: "Rutherford Classification",
          latex: "\\text{Class} = \\begin{cases} I & \\text{Viable} \\\\ IIa & \\text{Marginally threatened} \\\\ IIb & \\text{Immediately threatened} \\\\ III & \\text{Irreversible} \\end{cases}",
          description: "Guides urgency of intervention",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["6 P's: Pain, Pallor, Pulselessness, Paresthesia, Paralysis, Poikilothermia"],
      signs: ["Absent pulses", "Cool limb", "Sensory/motor deficit"]
    },
    severity: {
      mild: { description: "Rutherford I - Viable, no immediate threat" },
      moderate: { description: "Rutherford IIa - Marginally threatened" },
      severe: { description: "Rutherford IIb/III - Immediately threatened/irreversible" }
    }
  },

  I77_1: {
    name: "Stricture of Artery",
    icd10: "I77.1",
    category: "vascular",
    definition: "Non-atherosclerotic arterial narrowing",
    primaryOrgan: "arteries",
    affectedOrgans: ["arteries"],
    pathophysiology: {
      mechanism: "Fibromuscular dysplasia, arteritis, or post-procedural stenosis",
      equations: {
        flowVelocity: {
          name: "Stenosis Velocity Ratio",
          latex: "VR = \\frac{V_{stenosis}}{V_{proximal}}",
          description: "VR >2 suggests significant stenosis",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Depends on affected territory", "May cause TIA if carotid", "Claudication if limb"],
      signs: ["Diminished pulse", "Bruit over affected artery"]
    }
  },

  // =====================
  // DISEASES OF VEINS, LYMPHATICS AND NODES (I80-I89)
  // =====================

  I80_1: {
    name: "Phlebitis and Thrombophlebitis of Femoral Vein",
    icd10: "I80.1",
    category: "vascular",
    definition: "Deep vein thrombosis of the femoral vein",
    primaryOrgan: "legs",
    affectedOrgans: ["legs", "lungs"],
    pathophysiology: {
      mechanism: "Virchow's triad: stasis, endothelial injury, hypercoagulability",
      equations: {
        wellsScore: {
          name: "Wells Score for DVT",
          latex: "\\text{Score} = \\sum \\text{Clinical features}",
          description: "≤0 low risk, 1-2 moderate, ≥3 high probability",
          isNovel: false
        },
        dDimer: {
          name: "Age-Adjusted D-dimer",
          latex: "\\text{Threshold} = \\text{Age} \\times 10 \\text{ (if age >50)}",
          description: "Age-adjusted cutoff improves specificity in elderly",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Leg swelling", "Pain", "Warmth"],
      signs: ["Unilateral edema", "Calf tenderness", "Homans sign (unreliable)"]
    },
    laboratoryFindings: [
      { name: "D-dimer", normalRange: "<500 ng/mL", abnormalInDisease: "Elevated (sensitive but not specific)" }
    ],
    imagingFindings: {
      dopplerUltrasound: ["Non-compressible vein", "Absent flow", "Visible thrombus"]
    }
  },

  I82_4: {
    name: "Acute Embolism and Thrombosis of Deep Veins of Lower Extremity",
    icd10: "I82.4",
    category: "vascular",
    definition: "Acute proximal deep vein thrombosis",
    primaryOrgan: "legs",
    affectedOrgans: ["legs", "lungs"],
    pathophysiology: {
      mechanism: "Clot formation → proximal propagation → PE risk",
      equations: {
        peRisk: {
          name: "PE Risk from DVT Location",
          latex: "\\text{PE Risk} = \\begin{cases} \\text{Low} & \\text{Distal DVT} \\\\ \\text{High} & \\text{Proximal DVT} \\end{cases}",
          description: "Proximal DVT (popliteal and above) has ~50% PE risk",
          isNovel: false
        },
        anticoagulationDuration: {
          name: "Treatment Duration",
          latex: "\\text{Duration} = f(\\text{Provoked vs unprovoked}, \\text{VTE risk factors})",
          description: "3 months (provoked) to indefinite (recurrent unprovoked)",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Leg pain", "Swelling", "Dyspnea if PE develops"],
      signs: ["Asymmetric leg swelling >3cm difference", "Pitting edema", "Superficial venous dilation"]
    }
  },

  I83_0: {
    name: "Varicose Veins with Ulcer",
    icd10: "I83.0",
    category: "vascular",
    definition: "Chronic venous insufficiency with venous ulceration",
    primaryOrgan: "legs",
    affectedOrgans: ["legs", "skin"],
    pathophysiology: {
      mechanism: "Venous reflux → ambulatory venous hypertension → tissue damage → ulceration",
      equations: {
        vcss: {
          name: "Venous Clinical Severity Score",
          latex: "VCSS = \\sum_{i=1}^{10} \\text{Attribute}_i \\times \\text{Severity}_i",
          description: "Scores pain, varicose veins, edema, pigmentation, inflammation, induration, ulcer count, duration, size",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Leg heaviness", "Aching", "Itching", "Pain around ulcer"],
      signs: ["Varicose veins", "Ankle edema", "Skin changes", "Ulcer typically at medial malleolus"]
    },
    severity: {
      mild: { description: "CEAP C2-3: Varicose veins, edema" },
      moderate: { description: "CEAP C4: Skin changes without ulcer" },
      severe: { description: "CEAP C5-6: Healed or active ulcer" }
    }
  },

  I85_0: {
    name: "Esophageal Varices with Bleeding",
    icd10: "I85.0",
    category: "vascular",
    definition: "Hemorrhage from dilated esophageal veins due to portal hypertension",
    primaryOrgan: "esophagus",
    affectedOrgans: ["esophagus", "liver"],
    pathophysiology: {
      mechanism: "Portal hypertension → portosystemic shunting → esophageal varices → rupture",
      equations: {
        hepaticGradient: {
          name: "Hepatic Venous Pressure Gradient",
          latex: "HVPG = WHVP - FHVP",
          description: "Wedged minus free hepatic venous pressure; >12 mmHg = variceal bleeding risk",
          isNovel: false
        },
        varicealRisk: {
          name: "Variceal Bleeding Risk",
          latex: "\\text{Risk} = f(\\text{Varix size}, \\text{Red wale marks}, \\text{Child-Pugh class})",
          description: "North Italian Endoscopic Club index",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Hematemesis", "Melena", "Lightheadedness", "Syncope"],
      signs: ["Hypotension", "Tachycardia", "Signs of cirrhosis", "Ascites"]
    }
  },

  // =====================
  // OTHER CIRCULATORY DISEASES (I95-I99)
  // =====================

  I95_1: {
    name: "Orthostatic Hypotension",
    icd10: "I95.1",
    category: "vascular",
    definition: "Drop in BP upon standing causing symptoms",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "brain"],
    pathophysiology: {
      mechanism: "Impaired baroreceptor reflex or volume depletion → inadequate vasoconstriction",
      equations: {
        diagnosticCriteria: {
          name: "Orthostatic Hypotension Definition",
          latex: "\\Delta SBP \\geq 20 \\text{ mmHg OR } \\Delta DBP \\geq 10 \\text{ mmHg within 3 min of standing}",
          description: "CDC/AHA definition",
          isNovel: false
        },
        autonomicFunction: {
          name: "Heart Rate Response Ratio",
          latex: "\\text{30:15 ratio} = \\frac{RR_{30}}{RR_{15}}",
          description: "Normal >1.03; assesses autonomic function",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Lightheadedness on standing", "Syncope", "Visual changes", "Weakness"],
      signs: ["BP drop on standing", "Compensatory tachycardia (or absence in autonomic failure)"]
    }
  },

  I97_0: {
    name: "Postcardiotomy Syndrome",
    icd10: "I97.0",
    category: "pericardial",
    definition: "Inflammatory syndrome following cardiac surgery",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "lungs"],
    pathophysiology: {
      mechanism: "Autoimmune response to damaged myocardial antigens",
      equations: {
        diagnosticCriteria: {
          name: "Post-Pericardiotomy Syndrome Criteria",
          latex: "\\text{PPS} = \\text{Fever} + \\text{Pericardial/Pleural effusion} + \\text{Friction rub}",
          description: "Occurring 1-6 weeks post-surgery",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Fever", "Chest pain (pleuritic)", "Malaise"],
      signs: ["Pericardial friction rub", "Pleural effusion"]
    },
    laboratoryFindings: [
      { name: "CRP", normalRange: "<3 mg/L", abnormalInDisease: "Elevated" },
      { name: "ESR", normalRange: "<20 mm/hr", abnormalInDisease: "Elevated" },
      { name: "WBC", normalRange: "4.5-11 x10^9/L", abnormalInDisease: "Leukocytosis" }
    ]
  },

  I97_1: {
    name: "Cardiac Functional Disturbance Following Cardiac Surgery",
    icd10: "I97.1",
    category: "cardiac",
    definition: "Post-operative cardiac dysfunction (low cardiac output syndrome)",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "kidneys"],
    pathophysiology: {
      mechanism: "Myocardial stunning, reperfusion injury, or inadequate protection during surgery",
      equations: {
        cardiacIndex: {
          name: "Cardiac Index",
          latex: "CI = \\frac{CO}{BSA}",
          description: "Normal 2.5-4.0 L/min/m²; <2.0 = cardiogenic shock",
          isNovel: false
        },
        vasoactiveInotropicScore: {
          name: "Vasoactive-Inotropic Score",
          latex: "VIS = Dopamine + Dobutamine + 100 \\times Epi + 10 \\times Milrinone + 10000 \\times Vasopressin + 100 \\times Norepi",
          description: "Quantifies inotropic/vasopressor support",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Dyspnea", "Fatigue", "Oliguria"],
      signs: ["Hypotension", "Elevated CVP", "Cool extremities", "Delayed capillary refill"]
    }
  },

  I99: {
    name: "Other and Unspecified Disorders of Circulatory System",
    icd10: "I99",
    category: "vascular",
    definition: "Cardiovascular disease not elsewhere classified",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "vessels"],
    pathophysiology: {
      mechanism: "Various mechanisms depending on specific disorder"
    },
    clinicalPresentation: {
      symptoms: ["Variable based on underlying condition"],
      signs: ["Depends on specific pathology"]
    }
  }
};

// Additional novel equations for Part 6
export const NOVEL_EQUATIONS_PART6 = [
  {
    name: "Comprehensive Vascular Risk Score",
    latex: "CVRS = 0.3 \\times ABI_{inv} + 0.2 \\times \\text{Calcium Score} + 0.3 \\times \\text{IMT} + 0.2 \\times \\text{PWV}",
    description: "Novel composite score integrating ABI, calcium scoring, intima-media thickness, and pulse wave velocity for total vascular burden assessment",
    category: "vascular",
    isNovel: true
  },
  {
    name: "Venous Thromboembolism Recurrence Model",
    latex: "P(\\text{recurrence}) = 1 - \\exp\\left(-\\lambda t \\cdot e^{\\beta X}\\right)",
    description: "Cox proportional hazards model for predicting VTE recurrence based on clinical factors",
    category: "vascular",
    isNovel: true
  },
  {
    name: "Post-Operative Cardiac Recovery Index",
    latex: "POCRI = \\frac{CI_{post}}{CI_{pre}} \\times \\frac{100}{VIS + 1}",
    description: "Novel index tracking cardiac recovery relative to pre-operative function and support requirements",
    category: "cardiac",
    isNovel: true
  }
];

export default CARDIAC_DISEASES_PART6;
