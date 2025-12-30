// ============================================================
// CARDIAC DISEASES DATABASE - PART 5
// ICD-10 Chapter IX: Diseases of the Circulatory System (I00-I99)
// Covering: Rheumatic (I00-I09), Hypertensive (I10-I16), Cerebrovascular (I60-I69)
// ============================================================

export const CARDIAC_DISEASES_PART5 = {
  // =====================
  // RHEUMATIC HEART DISEASES (I00-I09)
  // =====================
  
  I00: {
    name: "Rheumatic Fever without Heart Involvement",
    icd10: "I00",
    category: "rheumatic",
    definition: "Acute rheumatic fever without mention of heart involvement",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "joints"],
    pathophysiology: {
      mechanism: "Post-streptococcal autoimmune inflammatory response",
      molecularBasis: "Molecular mimicry between streptococcal M protein and cardiac myosin",
      equations: {
        jonesScore: {
          name: "Modified Jones Criteria Score",
          latex: "\\text{Diagnosis} = (\\geq 2 \\text{ Major}) \\vee (1 \\text{ Major} + 2 \\text{ Minor})",
          description: "Diagnostic criteria for acute rheumatic fever",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Migratory polyarthritis", "Fever", "Erythema marginatum", "Subcutaneous nodules", "Sydenham chorea"],
      signs: ["Elevated ESR", "Elevated CRP", "Prolonged PR interval"]
    },
    laboratoryFindings: [
      { name: "ASO Titer", normalRange: "<200 IU/mL", abnormalInDisease: "Elevated >200 IU/mL" },
      { name: "Anti-DNase B", normalRange: "<340 U/mL", abnormalInDisease: "Elevated" },
      { name: "ESR", normalRange: "<20 mm/hr", abnormalInDisease: "Elevated >60 mm/hr" }
    ]
  },

  I01: {
    name: "Rheumatic Fever with Heart Involvement",
    icd10: "I01",
    category: "rheumatic",
    definition: "Acute rheumatic fever with cardiac involvement (pancarditis)",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "joints", "skin"],
    pathophysiology: {
      mechanism: "Autoimmune carditis affecting all layers of the heart",
      equations: {
        cardiacInflammation: {
          name: "Carditis Severity Index",
          latex: "CSI = \\frac{\\Delta PR + \\text{Murmur Grade} + \\text{CHF Signs}}{3}",
          description: "Novel index for assessing rheumatic carditis severity",
          isNovel: true
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Chest pain", "Dyspnea", "Palpitations", "Fatigue"],
      signs: ["New murmur", "Cardiomegaly", "Pericardial friction rub", "Tachycardia"]
    },
    severity: {
      mild: { description: "Carditis without cardiomegaly" },
      moderate: { description: "Carditis with cardiomegaly" },
      severe: { description: "Carditis with heart failure" }
    }
  },

  I02: {
    name: "Rheumatic Chorea",
    icd10: "I02",
    category: "rheumatic",
    definition: "Sydenham's chorea as manifestation of rheumatic fever",
    primaryOrgan: "brain",
    affectedOrgans: ["brain", "heart"],
    pathophysiology: {
      mechanism: "Autoimmune antibodies cross-react with basal ganglia neurons",
      equations: {
        choreaSeverity: {
          name: "UFMRS (Unified Huntington's Disease Rating Scale Modified)",
          latex: "\\text{Score} = \\sum_{i=1}^{n} \\text{Movement}_{i} \\times \\text{Frequency}_{i}",
          description: "Quantifies involuntary movement severity",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Involuntary movements", "Emotional lability", "Muscle weakness", "Speech difficulties"],
      signs: ["Choreiform movements", "Hypotonia", "Milkmaid grip"]
    }
  },

  I05_1: {
    name: "Rheumatic Mitral Insufficiency",
    icd10: "I05.1",
    category: "valvular",
    definition: "Chronic rheumatic mitral regurgitation",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "lungs"],
    pathophysiology: {
      mechanism: "Leaflet thickening, retraction, and chordal shortening from chronic inflammation",
      equations: {
        regurgitantVolume: {
          name: "Regurgitant Volume",
          latex: "V_{reg} = \\text{EROA} \\times \\text{VTI}_{MR}",
          description: "Effective regurgitant orifice area method",
          isNovel: false
        },
        regurgitantFraction: {
          name: "Regurgitant Fraction",
          latex: "RF = \\frac{V_{reg}}{SV_{total}} \\times 100\\%",
          description: "Percentage of stroke volume that regurgitates",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Dyspnea on exertion", "Fatigue", "Palpitations"],
      signs: ["Holosystolic murmur at apex", "S3 gallop", "Displaced PMI"]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated in severe MR" }
    ],
    imagingFindings: {
      echocardiography: ["Flail leaflet", "Coaptation defect", "LA dilation", "EROA ≥0.4 cm²"],
      chestXray: ["Cardiomegaly", "LA enlargement", "Pulmonary congestion"]
    }
  },

  I05_2: {
    name: "Rheumatic Mitral Stenosis with Insufficiency",
    icd10: "I05.2",
    category: "valvular",
    definition: "Mixed rheumatic mitral valve disease with both stenosis and regurgitation",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "lungs"],
    pathophysiology: {
      mechanism: "Combined leaflet fusion and retraction causing stenosis and regurgitation",
      equations: {
        mixedSeverity: {
          name: "Combined Severity Index",
          latex: "\\text{CSI} = \\frac{\\text{MVA}_{norm} - \\text{MVA}}{\\text{MVA}_{norm}} + \\frac{\\text{EROA}}{\\text{EROA}_{severe}}",
          description: "Novel index combining stenosis and regurgitation severity",
          isNovel: true
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Dyspnea", "Hemoptysis", "Fatigue", "Palpitations"],
      signs: ["Opening snap + systolic murmur", "Diastolic rumble", "Loud S1"]
    }
  },

  // =====================
  // HYPERTENSIVE DISEASES (I10-I16)
  // =====================

  I10: {
    name: "Essential (Primary) Hypertension",
    icd10: "I10",
    category: "hypertensive",
    definition: "Persistently elevated systemic arterial blood pressure without identifiable cause",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "brain", "kidneys", "eyes"],
    pathophysiology: {
      mechanism: "Multifactorial: increased SVR, RAAS activation, sympathetic overdrive, endothelial dysfunction",
      equations: {
        map: {
          name: "Mean Arterial Pressure",
          latex: "MAP = DBP + \\frac{1}{3}(SBP - DBP)",
          description: "Average arterial pressure during cardiac cycle",
          isNovel: false
        },
        cardiacOutput: {
          name: "Blood Pressure Equation",
          latex: "BP = CO \\times SVR",
          description: "Fundamental relationship: cardiac output × systemic vascular resistance",
          isNovel: false
        },
        targetOrganDamage: {
          name: "Hypertensive Target Organ Damage Score",
          latex: "TOD = \\sum_{i} w_i \\cdot \\text{Organ}_{i}^{\\text{damage}}",
          description: "Novel weighted score for assessing cumulative end-organ damage",
          isNovel: true
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Often asymptomatic", "Headache (severe HTN)", "Visual changes", "Chest pain"],
      signs: ["Elevated BP readings", "S4 gallop", "Retinal changes", "Carotid bruits"]
    },
    laboratoryFindings: [
      { name: "Serum Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "May be elevated" },
      { name: "Urinalysis", normalRange: "No proteinuria", abnormalInDisease: "Proteinuria possible" },
      { name: "Lipid Panel", normalRange: "LDL <100", abnormalInDisease: "Often dyslipidemia" }
    ],
    severity: {
      mild: { description: "Stage 1: SBP 130-139 or DBP 80-89" },
      moderate: { description: "Stage 2: SBP ≥140 or DBP ≥90" },
      severe: { description: "Hypertensive crisis: SBP >180 or DBP >120" }
    }
  },

  I11_0: {
    name: "Hypertensive Heart Disease with Heart Failure",
    icd10: "I11.0",
    category: "hypertensive",
    definition: "Heart failure due to chronic hypertension",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "kidneys", "lungs"],
    pathophysiology: {
      mechanism: "Chronic pressure overload → LVH → diastolic dysfunction → systolic dysfunction → HF",
      equations: {
        wallStress: {
          name: "Laplace Wall Stress",
          latex: "\\sigma = \\frac{P \\times r}{2h}",
          description: "Pressure × radius / (2 × wall thickness)",
          isNovel: false
        },
        lvMassIndex: {
          name: "LV Mass Index",
          latex: "LVMI = \\frac{LV Mass}{BSA}",
          description: "LVH threshold: >115 g/m² (men), >95 g/m² (women)",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Dyspnea on exertion", "Orthopnea", "PND", "Fatigue", "Edema"],
      signs: ["Elevated JVP", "S3/S4 gallop", "Displaced PMI", "Rales"]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: ">400 pg/mL in HF" },
      { name: "NT-proBNP", normalRange: "<300 pg/mL", abnormalInDisease: ">900 pg/mL" }
    ]
  },

  I11_9: {
    name: "Hypertensive Heart Disease without Heart Failure",
    icd10: "I11.9",
    category: "hypertensive",
    definition: "Hypertensive heart disease without heart failure (LVH without decompensation)",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Compensatory LVH in response to chronic pressure overload",
      equations: {
        relativeWallThickness: {
          name: "Relative Wall Thickness",
          latex: "RWT = \\frac{2 \\times PWTd}{LVIDd}",
          description: "Concentric vs eccentric remodeling: RWT >0.42 = concentric",
          isNovel: false
        },
        geometricPattern: {
          name: "LV Geometric Classification",
          latex: "\\text{Pattern} = f(LVMI, RWT)",
          description: "Normal, concentric remodeling, eccentric LVH, concentric LVH",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Often asymptomatic", "Exertional dyspnea", "Chest discomfort"],
      signs: ["Sustained apical impulse", "S4 gallop", "Elevated BP"]
    }
  },

  I12_0: {
    name: "Hypertensive Chronic Kidney Disease with Stage 5 CKD",
    icd10: "I12.0",
    category: "hypertensive",
    definition: "Hypertensive nephrosclerosis with end-stage renal disease",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys", "heart", "brain"],
    pathophysiology: {
      mechanism: "Chronic HTN → arteriolar nephrosclerosis → glomerulosclerosis → ESRD",
      equations: {
        gfr: {
          name: "eGFR (CKD-EPI)",
          latex: "eGFR = 141 \\times \\min(Scr/\\kappa, 1)^{\\alpha} \\times \\max(Scr/\\kappa, 1)^{-1.209} \\times 0.993^{age}",
          description: "Estimated glomerular filtration rate",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Fatigue", "Nausea", "Anorexia", "Pruritus", "Edema"],
      signs: ["Uremic frost", "Pericardial rub", "Volume overload"]
    },
    laboratoryFindings: [
      { name: "GFR", normalRange: ">90 mL/min/1.73m²", abnormalInDisease: "<15 mL/min (Stage 5)" },
      { name: "BUN", normalRange: "7-20 mg/dL", abnormalInDisease: "Markedly elevated" },
      { name: "Potassium", normalRange: "3.5-5.0 mEq/L", abnormalInDisease: "Often elevated" }
    ]
  },

  I13_0: {
    name: "Hypertensive Heart and Kidney Disease with HF",
    icd10: "I13.0",
    category: "hypertensive",
    definition: "Combined hypertensive heart disease with heart failure and chronic kidney disease",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "kidneys"],
    pathophysiology: {
      mechanism: "Cardiorenal syndrome Type 2: chronic heart disease causing progressive CKD",
      equations: {
        cardiorenalIndex: {
          name: "Cardiorenal Syndrome Severity",
          latex: "CRS = \\frac{\\text{BNP}}{100} + \\frac{90 - eGFR}{30} + \\frac{\\text{NYHA Class}}{4}",
          description: "Novel composite score for cardiorenal syndrome severity",
          isNovel: true
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Dyspnea", "Edema", "Fatigue", "Decreased urine output"],
      signs: ["JVD", "Rales", "S3 gallop", "Peripheral edema"]
    }
  },

  I15_0: {
    name: "Renovascular Hypertension",
    icd10: "I15.0",
    category: "hypertensive",
    definition: "Secondary hypertension due to renal artery stenosis",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys", "heart"],
    pathophysiology: {
      mechanism: "Renal hypoperfusion → RAAS activation → sodium retention → hypertension",
      equations: {
        renalArteryStenosisIndex: {
          name: "Renal Artery Stenosis Severity",
          latex: "\\text{Stenosis}\\% = \\left(1 - \\frac{D_{stenosis}}{D_{reference}}\\right) \\times 100",
          description: "Diameter reduction percentage",
          isNovel: false
        },
        resistiveIndex: {
          name: "Renal Resistive Index",
          latex: "RI = \\frac{V_{peak systolic} - V_{end diastolic}}{V_{peak systolic}}",
          description: "Normal <0.70; >0.80 suggests significant disease",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Severe/resistant hypertension", "Flash pulmonary edema", "Renal dysfunction with ACE-I"],
      signs: ["Abdominal bruit", "Asymmetric kidney size"]
    },
    imagingFindings: {
      renalDoppler: ["Elevated RI", "Dampened waveform", "Velocity gradient >200 cm/s"],
      ctAngiography: ["Renal artery stenosis >70%", "Post-stenotic dilation"]
    }
  },

  I16_0: {
    name: "Hypertensive Urgency",
    icd10: "I16.0",
    category: "hypertensive",
    definition: "Severely elevated BP (>180/120) without acute end-organ damage",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "brain", "kidneys"],
    pathophysiology: {
      mechanism: "Acute severe vasoconstriction without loss of autoregulation",
      equations: {
        bpReduction: {
          name: "Safe BP Reduction Rate",
          latex: "\\Delta BP_{max} = 25\\% \\text{ of initial MAP in first 2 hours}",
          description: "Avoid rapid reduction to prevent ischemia",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Headache", "Anxiety", "Epistaxis", "Often asymptomatic"],
      signs: ["BP >180/120", "No papilledema", "No acute neurologic deficits"]
    }
  },

  I16_1: {
    name: "Hypertensive Emergency",
    icd10: "I16.1",
    category: "hypertensive",
    definition: "Severely elevated BP with acute end-organ damage",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "brain", "kidneys", "eyes"],
    pathophysiology: {
      mechanism: "Loss of vascular autoregulation → endothelial damage → fibrinoid necrosis",
      equations: {
        autoregulation: {
          name: "Cerebral Autoregulation Limits",
          latex: "CBF = \\text{constant for } MAP \\in [60, 150] \\text{ mmHg}",
          description: "Beyond limits, CBF becomes pressure-dependent",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Severe headache", "Visual changes", "Chest pain", "Dyspnea", "Altered consciousness"],
      signs: ["Papilledema", "Retinal hemorrhages", "Focal neurologic deficits", "Pulmonary edema"]
    },
    severity: {
      mild: { description: "Single organ involvement" },
      moderate: { description: "Two organ systems affected" },
      severe: { description: "Multi-organ dysfunction" }
    }
  },

  // =====================
  // CEREBROVASCULAR DISEASES (I60-I69)
  // =====================

  I60: {
    name: "Nontraumatic Subarachnoid Hemorrhage",
    icd10: "I60",
    category: "cerebrovascular",
    definition: "Bleeding into the subarachnoid space, usually from ruptured aneurysm",
    primaryOrgan: "brain",
    affectedOrgans: ["brain", "heart"],
    pathophysiology: {
      mechanism: "Aneurysm rupture → subarachnoid bleeding → ICP elevation → vasospasm",
      equations: {
        huntHessGrade: {
          name: "Hunt-Hess Classification",
          latex: "\\text{Grade} = \\begin{cases} 1 & \\text{Mild headache} \\\\ 2 & \\text{Moderate headache, CN palsy} \\\\ 3 & \\text{Drowsy, focal deficit} \\\\ 4 & \\text{Stuporous} \\\\ 5 & \\text{Coma} \\end{cases}",
          description: "Clinical grading of SAH severity",
          isNovel: false
        },
        fisherGrade: {
          name: "Modified Fisher Scale",
          latex: "\\text{Grade} = f(\\text{Blood thickness}, \\text{IVH presence})",
          description: "CT-based prediction of vasospasm risk",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Thunderclap headache", "Neck stiffness", "Photophobia", "Vomiting", "LOC"],
      signs: ["Meningismus", "Focal deficits", "Papilledema", "Subhyaloid hemorrhages"]
    },
    laboratoryFindings: [
      { name: "LP (if CT negative)", normalRange: "Clear CSF", abnormalInDisease: "Xanthochromia, RBCs" }
    ],
    imagingFindings: {
      ctHead: ["Hyperdense blood in subarachnoid space", "Hydrocephalus"],
      ctAngiography: ["Aneurysm identification", "Vasospasm assessment"]
    }
  },

  I61: {
    name: "Nontraumatic Intracerebral Hemorrhage",
    icd10: "I61",
    category: "cerebrovascular",
    definition: "Spontaneous bleeding into the brain parenchyma",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Hypertensive arteriolopathy or amyloid angiopathy → vessel rupture → hematoma",
      equations: {
        ichVolume: {
          name: "ICH Volume (ABC/2 Method)",
          latex: "V = \\frac{A \\times B \\times C}{2}",
          description: "A=largest diameter, B=perpendicular, C=slices × slice thickness",
          isNovel: false
        },
        ichScore: {
          name: "ICH Score",
          latex: "\\text{Score} = \\text{GCS} + \\text{ICH Vol} + \\text{IVH} + \\text{Location} + \\text{Age}",
          description: "Mortality prediction: 0=0%, 5=100%",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Sudden headache", "Focal weakness", "Speech difficulty", "Vision changes"],
      signs: ["Focal deficits", "Decreased consciousness", "Hypertension"]
    },
    severity: {
      mild: { description: "ICH Score 0-1, Volume <30mL" },
      moderate: { description: "ICH Score 2-3, Volume 30-60mL" },
      severe: { description: "ICH Score 4-5, Volume >60mL" }
    }
  },

  I63: {
    name: "Cerebral Infarction",
    icd10: "I63",
    category: "cerebrovascular",
    definition: "Ischemic stroke due to arterial occlusion causing brain tissue death",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Arterial occlusion (thrombotic/embolic) → ischemia → infarction",
      equations: {
        nihssScore: {
          name: "NIH Stroke Scale",
          latex: "NIHSS = \\sum_{i=1}^{15} \\text{Item}_i",
          description: "0-42 scale; 0=no deficit, >25=severe stroke",
          isNovel: false
        },
        penumbraRatio: {
          name: "Perfusion-Diffusion Mismatch",
          latex: "\\text{Mismatch Ratio} = \\frac{T_{max} > 6s \\text{ volume}}{\\text{DWI lesion volume}}",
          description: "Ratio >1.8 suggests salvageable tissue",
          isNovel: false
        },
        collateralScore: {
          name: "Collateral Flow Score",
          latex: "\\text{CFS} = \\frac{\\text{Affected territory perfusion}}{\\text{Contralateral perfusion}} \\times 100",
          description: "Novel quantification of collateral blood flow",
          isNovel: true
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Sudden weakness", "Facial droop", "Arm drift", "Speech abnormality", "Time to call 911"],
      signs: ["Focal neurologic deficits", "NIHSS abnormalities"]
    },
    laboratoryFindings: [
      { name: "Glucose", normalRange: "70-100 mg/dL", abnormalInDisease: "Exclude hypoglycemia" },
      { name: "PT/INR", normalRange: "INR 1.0", abnormalInDisease: "Check before tPA" }
    ],
    imagingFindings: {
      ctHead: ["Hyperdense vessel sign", "Loss of gray-white differentiation", "Insular ribbon sign"],
      mri: ["DWI restriction", "FLAIR hyperintensity", "Perfusion deficit"]
    }
  },

  I65: {
    name: "Occlusion and Stenosis of Precerebral Arteries",
    icd10: "I65",
    category: "cerebrovascular",
    definition: "Stenosis or occlusion of carotid or vertebral arteries not resulting in infarction",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Atherosclerotic plaque → luminal narrowing → reduced cerebral perfusion",
      equations: {
        nacstetCriteria: {
          name: "NASCET Stenosis Calculation",
          latex: "\\text{Stenosis}\\% = \\left(1 - \\frac{D_{stenosis}}{D_{distal ICA}}\\right) \\times 100",
          description: "North American Symptomatic Carotid Endarterectomy Trial method",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["TIA symptoms", "Amaurosis fugax", "Often asymptomatic"],
      signs: ["Carotid bruit", "Retinal emboli"]
    },
    imagingFindings: {
      carotidDoppler: ["Peak systolic velocity >230 cm/s (≥70% stenosis)", "End-diastolic velocity >100 cm/s"],
      ctAngiography: ["Plaque morphology", "Stenosis quantification"]
    }
  },

  I67_1: {
    name: "Cerebral Aneurysm, Nonruptured",
    icd10: "I67.1",
    category: "cerebrovascular",
    definition: "Unruptured intracranial aneurysm",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Vessel wall weakness → outpouching at arterial bifurcations",
      equations: {
        phasesScore: {
          name: "PHASES Rupture Risk Score",
          latex: "\\text{Risk} = f(\\text{Population, HTN, Age, Size, Earlier SAH, Site})",
          description: "5-year rupture risk prediction",
          isNovel: false
        },
        wallShearStress: {
          name: "Aneurysm Wall Shear Stress",
          latex: "WSS = \\mu \\frac{\\partial u}{\\partial n}|_{wall}",
          description: "Low WSS associated with aneurysm growth",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Usually asymptomatic", "Headache if enlarging", "Cranial nerve palsy (CN III)"],
      signs: ["Pupil abnormality", "Ptosis"]
    }
  },

  I69: {
    name: "Sequelae of Cerebrovascular Disease",
    icd10: "I69",
    category: "cerebrovascular",
    definition: "Long-term effects and residual deficits from prior stroke",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Permanent neuronal loss with compensatory neuroplasticity",
      equations: {
        functionalRecovery: {
          name: "Modified Rankin Scale",
          latex: "mRS = \\begin{cases} 0 & \\text{No symptoms} \\\\ 1-2 & \\text{Minor disability} \\\\ 3 & \\text{Moderate disability} \\\\ 4-5 & \\text{Severe disability} \\\\ 6 & \\text{Death} \\end{cases}",
          description: "Functional outcome assessment post-stroke",
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: ["Persistent weakness", "Aphasia", "Cognitive impairment", "Depression"],
      signs: ["Spasticity", "Gait abnormality", "Hemisensory loss"]
    }
  }
};

export default CARDIAC_DISEASES_PART5;
