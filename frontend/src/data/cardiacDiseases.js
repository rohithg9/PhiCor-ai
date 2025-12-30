// ============================================================================
// COMPREHENSIVE CARDIAC DISEASE DATABASE
// ICD-10-CM Chapter 9: Diseases of the Circulatory System (I00-I99)
// ============================================================================
// 
// DESIGN PRINCIPLES:
// - FHIR R4 Compatible Structure (for EMR integration)
// - HIPAA Compliant (no PHI, only clinical reference data)
// - HL7 CDA Compatible terminology
// - SNOMED CT / LOINC coded where applicable
// - Evidence-based clinical criteria
//
// STRUCTURE PER DISEASE:
// - ICD-10 Code & SNOMED CT mapping
// - Pathophysiology (mathematical models)
// - Clinical Presentation (symptoms, signs)
// - Diagnostic Criteria (official guidelines)
// - Laboratory Findings (with reference ranges)
// - Imaging Findings (modality-specific)
// - ECG Findings (when applicable)
// - Hemodynamic Parameters
// - Risk Stratification
// - Differential Diagnosis
// - Treatment Guidelines
// ============================================================================

export const CARDIAC_DISEASES = {
  // ============================================================================
  // I00-I02: ACUTE RHEUMATIC FEVER
  // ============================================================================
  
  I00: {
    icd10: "I00",
    name: "Rheumatic Fever without Heart Involvement",
    snomedCT: "195528001",
    category: "rheumatic",
    
    definition: "Inflammatory disease following Group A Streptococcal pharyngitis, without cardiac manifestations",
    
    pathophysiology: {
      mechanism: "Molecular mimicry - antibodies against streptococcal M protein cross-react with cardiac, joint, and neural tissue",
      timeline: "Occurs 2-4 weeks after untreated strep pharyngitis",
      equations: {
        antibodyResponse: {
          name: "ASO Titer Kinetics",
          latex: "ASO(t) = ASO_{peak} \\times e^{-k_{decay}(t-t_{peak})}",
          description: "ASO rises 1 week post-infection, peaks at 3-5 weeks"
        }
      }
    },
    
    clinicalPresentation: {
      symptoms: {
        major: [
          { name: "Migratory polyarthritis", frequency: "75%", description: "Large joints, fleeting, very painful" },
          { name: "Chorea (Sydenham)", frequency: "10-15%", description: "Involuntary movements, emotional lability" },
          { name: "Erythema marginatum", frequency: "< 5%", description: "Pink rings on trunk/limbs, evanescent" },
          { name: "Subcutaneous nodules", frequency: "< 5%", description: "Painless, over bony prominences" }
        ],
        minor: [
          { name: "Fever", frequency: "Common", description: "Usually > 38.5°C" },
          { name: "Arthralgia", frequency: "Common", description: "Without objective arthritis" },
          { name: "Elevated acute phase reactants", frequency: "Very common" }
        ]
      },
      signs: {
        general: ["Fever", "Tachycardia out of proportion to fever"],
        joints: ["Swelling", "Erythema", "Warmth", "Tenderness", "Limited ROM"],
        skin: ["Erythema marginatum - serpiginous border, central clearing"],
        neurological: ["Chorea - purposeless movements, hypotonia, emotional lability"]
      }
    },
    
    diagnosticCriteria: {
      name: "Jones Criteria (2015 AHA Revision)",
      requirements: {
        evidence_of_strep: "Required - ASO, anti-DNase B, or positive throat culture/rapid test",
        lowRisk: {
          major: ["Carditis (clinical or subclinical)", "Polyarthritis", "Chorea", "Erythema marginatum", "Subcutaneous nodules"],
          minor: ["Polyarthralgia", "Fever ≥38.5°C", "ESR ≥60 or CRP ≥3.0", "Prolonged PR interval"],
          diagnosis: "2 major OR 1 major + 2 minor"
        },
        highRisk: {
          major: ["Carditis", "Monoarthritis or polyarthritis or polyarthralgia", "Chorea", "Erythema marginatum", "Subcutaneous nodules"],
          minor: ["Monoarthralgia", "Fever ≥38°C", "ESR ≥30 or CRP ≥3.0", "Prolonged PR interval"],
          diagnosis: "2 major OR 1 major + 2 minor"
        }
      }
    },
    
    laboratoryFindings: {
      required: [
        { test: "ASO Titer", loinc: "5370-3", normalRange: "<200 IU/mL", abnormalInDisease: ">200 IU/mL, rising titer", sensitivity: "80%", specificity: "90%" },
        { test: "Anti-DNase B", loinc: "5131-8", normalRange: "<340 U", abnormalInDisease: "Elevated", sensitivity: "90%", note: "More sensitive than ASO" },
        { test: "Throat Culture", loinc: "626-2", abnormalInDisease: "Group A Streptococcus", note: "May be negative by time of RF" }
      ],
      inflammatory: [
        { test: "ESR", loinc: "30341-2", normalRange: "<20 mm/hr", abnormalInDisease: "Often >60 mm/hr", note: "Part of minor criteria" },
        { test: "CRP", loinc: "1988-5", normalRange: "<3.0 mg/L", abnormalInDisease: "Markedly elevated", note: "More sensitive than ESR" },
        { test: "WBC", loinc: "6690-2", normalRange: "4.5-11 x10^9/L", abnormalInDisease: "Leukocytosis common" }
      ],
      cardiac: [
        { test: "Troponin", loinc: "10839-9", normalRange: "<0.04 ng/mL", abnormalInDisease: "May be mildly elevated in carditis" },
        { test: "BNP", loinc: "42637-9", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated if heart failure" }
      ]
    },
    
    imagingFindings: {
      echocardiogram: {
        indication: "All patients with suspected RF",
        findings: {
          normal: "No valvular involvement in I00",
          note: "Used to exclude subclinical carditis"
        }
      },
      chestXray: {
        indication: "If carditis suspected",
        findings: {
          normal: "Normal heart size",
          abnormal: "Cardiomegaly if carditis present (→ reclassify to I01)"
        }
      }
    },
    
    ecgFindings: {
      common: [
        { finding: "Prolonged PR interval", frequency: "Common", description: "First-degree AV block, part of minor criteria" },
        { finding: "Sinus tachycardia", frequency: "Common", description: "Due to fever/inflammation" }
      ],
      ifCarditis: [
        { finding: "ST-T changes", description: "Nonspecific" },
        { finding: "Low voltage", description: "If pericardial effusion" }
      ]
    },
    
    differentialDiagnosis: [
      { condition: "Juvenile idiopathic arthritis", distinguishing: "Chronic course, no strep evidence, different joint pattern" },
      { condition: "Reactive arthritis", distinguishing: "Usually follows GI/GU infection, asymmetric" },
      { condition: "Septic arthritis", distinguishing: "Monoarticular, more toxic, joint aspiration diagnostic" },
      { condition: "Viral arthritis", distinguishing: "Often symmetric, less migratory" },
      { condition: "Infective endocarditis", distinguishing: "Blood cultures positive, vegetations on echo" }
    ],
    
    riskStratification: {
      recurrence: "High risk if inadequate secondary prophylaxis",
      carditis: "Risk increases with each episode",
      rheumaticHeartDisease: "Develops in 30-50% with carditis"
    },
    
    treatment: {
      acute: [
        { category: "Antibiotics", agents: ["Penicillin V", "Amoxicillin", "IM Benzathine penicillin"], purpose: "Eradicate streptococcus" },
        { category: "Anti-inflammatory", agents: ["Aspirin 80-100 mg/kg/day", "Naproxen"], purpose: "Arthritis, fever" },
        { category: "Corticosteroids", agents: ["Prednisone"], indication: "Severe carditis" }
      ],
      prophylaxis: {
        secondary: {
          agent: "IM Benzathine penicillin G 1.2 million units q3-4 weeks",
          alternatives: ["Penicillin V 250mg BID", "Sulfadiazine if penicillin allergic"],
          duration: {
            noCarditis: "5 years or until age 21 (whichever longer)",
            withCarditis_noRHD: "10 years or until age 21",
            withRHD: "10 years or until age 40, sometimes lifelong"
          }
        }
      }
    }
  },

  I01_0: {
    icd10: "I01.0",
    name: "Acute Rheumatic Pericarditis",
    snomedCT: "233844000",
    category: "rheumatic",
    
    definition: "Pericardial inflammation as part of rheumatic carditis (pancarditis)",
    
    pathophysiology: {
      mechanism: "Autoimmune inflammation of pericardium secondary to molecular mimicry",
      histology: "Fibrinous pericarditis, may progress to effusion",
      equations: {
        pericardialPressure: {
          name: "Pericardial Pressure-Volume",
          latex: "P_{peric} = P_0 \\times e^{k(V - V_0)}",
          description: "Exponential rise in pressure with rapid fluid accumulation"
        }
      }
    },
    
    clinicalPresentation: {
      symptoms: {
        primary: [
          { name: "Chest pain", frequency: "90%", character: "Sharp, pleuritic, worse supine, better leaning forward" },
          { name: "Dyspnea", frequency: "50%", description: "Worse if effusion present" },
          { name: "Fever", frequency: "Common" }
        ],
        associated: ["Symptoms of RF (arthritis, chorea, rash)"]
      },
      signs: {
        auscultation: [
          { finding: "Pericardial friction rub", description: "Scratchy, 3-component (atrial, ventricular systole, early diastole)", timing: "May be transient" }
        ],
        ifEffusion: [
          { finding: "Distant heart sounds", description: "Muffled" },
          { finding: "Ewart's sign", description: "Dullness at left base posteriorly" }
        ],
        ifTamponade: [
          { finding: "Beck's triad", description: "Hypotension, JVD, muffled heart sounds" },
          { finding: "Pulsus paradoxus", description: ">10 mmHg drop in SBP with inspiration" }
        ]
      }
    },
    
    diagnosticCriteria: {
      name: "ESC 2015 Pericarditis Criteria (adapted for RF)",
      requirements: "2 of 4: (1) Chest pain, (2) Friction rub, (3) ECG changes, (4) New/worsening effusion",
      plusEvidence: "Evidence of recent streptococcal infection + other Jones criteria"
    },
    
    laboratoryFindings: {
      inflammatory: [
        { test: "ESR", abnormalInDisease: "Markedly elevated" },
        { test: "CRP", abnormalInDisease: "Elevated, correlates with disease activity" },
        { test: "WBC", abnormalInDisease: "Leukocytosis" }
      ],
      cardiac: [
        { test: "Troponin", abnormalInDisease: "May be elevated (myopericarditis)" },
        { test: "BNP", abnormalInDisease: "Elevated if HF or tamponade" }
      ],
      strepEvidence: [
        { test: "ASO", abnormalInDisease: "Elevated" },
        { test: "Anti-DNase B", abnormalInDisease: "Elevated" }
      ]
    },
    
    imagingFindings: {
      echocardiogram: {
        indication: "All patients",
        findings: {
          effusion: "Anechoic space, measure size (small <10mm, moderate 10-20mm, large >20mm)",
          tamponade: "RA/RV diastolic collapse, respiratory variation >25% mitral inflow",
          carditis: "May see mitral/aortic regurgitation if concurrent valvulitis"
        }
      },
      chestXray: {
        findings: {
          normal: "May be normal with small effusion",
          enlarged: "Water-bottle silhouette with large effusion (>200mL)"
        }
      },
      ctMri: {
        indication: "If diagnosis unclear or constrictive suspected",
        findings: "Pericardial thickening, enhancement with gadolinium"
      }
    },
    
    ecgFindings: {
      stages: [
        { stage: 1, timing: "Days 1-7", findings: "Diffuse ST elevation (concave up), PR depression" },
        { stage: 2, timing: "Week 1-2", findings: "ST normalizes, T wave flattening" },
        { stage: 3, timing: "Week 2-3", findings: "T wave inversions" },
        { stage: 4, timing: "Weeks-months", findings: "Normalization" }
      ],
      distinguishing: "Diffuse changes, no reciprocal changes (vs MI), PR depression in most leads"
    },
    
    hemodynamics: {
      normal: { rap: "0-8 mmHg", pcwp: "6-12 mmHg" },
      withEffusion: { rap: "May be elevated", pcwp: "May be elevated" },
      tamponade: {
        rap: "Elevated, equalization with PCWP and PADP",
        pattern: "Prominent x descent, blunted y descent"
      }
    },
    
    treatment: {
      medical: [
        { category: "Anti-inflammatory", agents: ["Aspirin", "NSAIDs", "Colchicine"], duration: "Until CRP normalizes" },
        { category: "Corticosteroids", indication: "Refractory or contraindication to NSAIDs" },
        { category: "Antibiotics", agents: ["Penicillin"], purpose: "Eradicate streptococcus" }
      ],
      interventional: {
        pericardiocentesis: {
          indication: "Tamponade, large symptomatic effusion, diagnostic uncertainty",
          approach: "Echo-guided, subxiphoid or apical"
        }
      }
    }
  },

  // I01.1 - Acute Rheumatic Endocarditis
  I01_1: {
    icd10: "I01.1",
    name: "Acute Rheumatic Endocarditis",
    snomedCT: "233843006",
    category: "rheumatic",
    
    definition: "Valvular inflammation in acute rheumatic fever, precursor to chronic rheumatic heart disease",
    
    pathophysiology: {
      mechanism: "Antibodies cross-react with valve endothelium, causing verrucae formation",
      valveInvolvement: {
        mitral: { frequency: "65-70%", lesion: "Regurgitation > stenosis acutely" },
        aortic: { frequency: "25%", lesion: "Regurgitation" },
        tricuspid: { frequency: "10%", lesion: "Usually with mitral involvement" },
        pulmonary: { frequency: "Rare" }
      },
      histology: "Aschoff bodies (pathognomonic), verrucae on valve closure line",
      equations: {
        regurgitantVolume: {
          name: "Regurgitant Volume",
          latex: "RV = ROA \\times VTI_{reg} = SV_{total} - SV_{forward}",
          description: "Determines severity of valve leak"
        },
        regurgitantFraction: {
          name: "Regurgitant Fraction",
          latex: "RF = \\frac{RV}{SV_{total}} \\times 100\\%",
          description: "<30% mild, 30-50% moderate, >50% severe"
        }
      }
    },
    
    clinicalPresentation: {
      symptoms: {
        acute: [
          { name: "Dyspnea", frequency: "Common", mechanism: "MR → LA pressure → pulmonary congestion" },
          { name: "Fatigue", frequency: "Common" },
          { name: "Palpitations", frequency: "30%" }
        ],
        associated: ["Arthritis", "Fever", "Chorea", "Skin manifestations"]
      },
      signs: {
        auscultation: {
          mitralRegurgitation: [
            { finding: "Pansystolic murmur", location: "Apex", radiation: "Axilla", quality: "Blowing" },
            { finding: "S3", description: "Volume overload" },
            { finding: "Carey-Coombs murmur", description: "Mid-diastolic, due to increased flow across inflamed valve" }
          ],
          aorticRegurgitation: [
            { finding: "Early diastolic murmur", location: "Left sternal border", quality: "Decrescendo, blowing" },
            { finding: "Austin Flint murmur", description: "Mid-diastolic rumble at apex from AR jet hitting MV" }
          ]
        },
        peripheral: {
          ifSevereAR: ["Wide pulse pressure", "Bounding pulses", "De Musset sign", "Quincke pulses"]
        }
      }
    },
    
    diagnosticCriteria: {
      echoCarditis: {
        pathological_MR: ["Jet length ≥2cm", "Jet in ≥2 views", "Mosaic color jet", "Peak velocity ≥3m/s"],
        pathological_AR: ["Jet length ≥1cm", "Jet in ≥2 views", "Pandiastolic"],
        morphological: ["Annular dilation", "Chordal elongation", "Coaptation defect", "Leaflet thickening"]
      }
    },
    
    laboratoryFindings: {
      inflammatory: [
        { test: "ESR", abnormalInDisease: ">60 mm/hr typical" },
        { test: "CRP", abnormalInDisease: "Significantly elevated" }
      ],
      cardiac: [
        { test: "BNP/NT-proBNP", abnormalInDisease: "Elevated in heart failure" },
        { test: "Troponin", abnormalInDisease: "May be elevated in myocarditis" }
      ]
    },
    
    imagingFindings: {
      echocardiogram: {
        twoDimensional: [
          "Valve leaflet thickening",
          "Restricted leaflet motion",
          "Annular dilation",
          "Beaded appearance (verrucae)"
        ],
        doppler: [
          "Mitral regurgitation jet assessment",
          "Aortic regurgitation jet assessment",
          "Pressure half-time",
          "Vena contracta width"
        ],
        severityGrading: {
          MR: {
            mild: "Jet area <4 cm², VC <0.3cm, RV <30mL",
            moderate: "Jet area 4-8 cm², VC 0.3-0.69cm, RV 30-59mL",
            severe: "Jet area >8 cm², VC ≥0.7cm, RV ≥60mL"
          }
        }
      },
      chestXray: {
        findings: ["Cardiomegaly", "LA enlargement (double density, elevated left bronchus)", "Pulmonary venous congestion"]
      }
    },
    
    ecgFindings: {
      common: [
        { finding: "LA enlargement", description: "P mitrale - broad, notched P wave in lead II" },
        { finding: "LV hypertrophy", description: "If chronic MR" },
        { finding: "Atrial fibrillation", description: "With severe LA dilation" }
      ]
    },
    
    treatment: {
      acute: [
        { category: "Anti-inflammatory", agents: ["Aspirin 80-100 mg/kg/day"], duration: "4-8 weeks" },
        { category: "Corticosteroids", agents: ["Prednisone 2 mg/kg/day"], indication: "Severe carditis, heart failure" },
        { category: "Diuretics", agents: ["Furosemide"], indication: "Heart failure" },
        { category: "Antibiotics", agents: ["Penicillin"], purpose: "Eradicate streptococcus" }
      ],
      surgical: {
        indication: "Severe refractory heart failure, severe regurgitation",
        timing: "Delay if possible until acute inflammation resolves",
        procedures: ["Valve repair preferred", "Valve replacement if repair not feasible"]
      },
      prophylaxis: {
        secondary: "Lifelong or until age 40 with RHD",
        endocarditis: "Required for dental procedures"
      }
    }
  },

  // ============================================================================
  // I05-I09: CHRONIC RHEUMATIC HEART DISEASE
  // ============================================================================
  
  I05_0: {
    icd10: "I05.0",
    name: "Rheumatic Mitral Stenosis",
    snomedCT: "79619009",
    category: "valvular",
    
    definition: "Chronic progressive narrowing of mitral valve orifice due to rheumatic inflammation",
    
    epidemiology: {
      prevalence: "Rare in developed countries, common in endemic areas",
      demographics: "F:M 2:1, typically presents 20-30 years after acute RF",
      progression: "Normal MVA 4-6 cm², symptoms when <2 cm²"
    },
    
    pathophysiology: {
      mechanism: "Recurrent inflammation → commissural fusion, chordal thickening, calcification",
      hemodynamics: {
        gradient: {
          name: "Mitral Valve Gradient",
          latex: "\\Delta P = \\frac{diastolicFillingTime \\times MVG}{CO}",
          gorlin: "MVA = \\frac{CO/(DFP \\times HR)}{37.7 \\times \\sqrt{\\Delta P}}"
        },
        laPressure: {
          name: "LA Pressure Elevation",
          latex: "LAP = LVEDP + MVG",
          description: "Elevated LAP → pulmonary venous HTN → pulmonary arterial HTN"
        },
        pulmonaryPressure: {
          name: "Pulmonary Artery Pressure",
          latex: "PAP_{sys} = LAP + PVR \\times CO/80",
          progression: "Passive → reactive → fixed (Eisenmenger)"
        }
      },
      naturalHistory: "Latent period 20-40 years, then progressive, 10-year survival 50-60% once symptomatic"
    },
    
    clinicalPresentation: {
      symptoms: {
        exertional: [
          { name: "Dyspnea", frequency: "Most common", mechanism: "Pulmonary congestion" },
          { name: "Fatigue", frequency: "Common", mechanism: "Fixed cardiac output" },
          { name: "Palpitations", frequency: "30-40%", mechanism: "AF onset" }
        ],
        advanced: [
          { name: "Hemoptysis", mechanism: "Bronchial vein rupture from high LA pressure" },
          { name: "Hoarseness", mechanism: "Ortner syndrome - recurrent laryngeal nerve compression by enlarged LA/PA" },
          { name: "Chest pain", mechanism: "RV ischemia from pulmonary HTN" }
        ],
        precipitants: ["Pregnancy", "Infection", "Atrial fibrillation", "Exercise"]
      },
      signs: {
        general: [
          { finding: "Mitral facies", description: "Pinkish-purple discoloration of cheeks due to low CO" }
        ],
        jvp: [
          { finding: "Elevated JVP", description: "If RV failure or TR" },
          { finding: "Prominent a wave", description: "If in sinus rhythm with pulmonary HTN" }
        ],
        palpation: [
          { finding: "Tapping apex beat", description: "Palpable S1" },
          { finding: "Diastolic thrill", location: "Apex, left lateral decubitus" },
          { finding: "RV heave", description: "If pulmonary HTN" }
        ],
        auscultation: [
          { finding: "Loud S1", mechanism: "Wide-open leaflets at end-diastole snap shut" },
          { finding: "Opening snap", timing: "Early diastole", description: "Closer to S2 = more severe (shorter A2-OS interval)" },
          { finding: "Low-pitched diastolic rumble", location: "Apex", position: "Left lateral decubitus", description: "Crescendo presystolic accentuation if sinus rhythm" },
          { finding: "Loud P2", description: "If pulmonary HTN" },
          { finding: "Graham Steell murmur", description: "High-pitched early diastolic PR murmur from pulmonary HTN" }
        ]
      },
      nyhaClass: {
        I: "Asymptomatic",
        II: "Symptoms with ordinary activity",
        III: "Symptoms with less than ordinary activity",
        IV: "Symptoms at rest"
      }
    },
    
    diagnosticCriteria: {
      severityByMVA: {
        mild: ">1.5 cm²",
        moderate: "1.0-1.5 cm²",
        severe: "<1.0 cm²"
      },
      severityByGradient: {
        mild: "<5 mmHg",
        moderate: "5-10 mmHg",
        severe: ">10 mmHg"
      },
      severityByPASP: {
        mild: "<30 mmHg",
        moderate: "30-50 mmHg",
        severe: ">50 mmHg"
      }
    },
    
    laboratoryFindings: {
      routine: [
        { test: "BNP/NT-proBNP", abnormalInDisease: "Elevated, correlates with severity and prognosis" },
        { test: "CBC", abnormalInDisease: "Normal or polycythemia if chronic hypoxemia" }
      ],
      anticoagulation: [
        { test: "INR", target: "2.0-3.0 if AF or prior embolism" }
      ]
    },
    
    imagingFindings: {
      echocardiogram: {
        twoDimensional: [
          { finding: "Hockey-stick deformity", description: "Restricted posterior leaflet, doming anterior leaflet" },
          { finding: "Thickened leaflets", description: "Fibrosis and calcification" },
          { finding: "Commissural fusion", description: "Hallmark" },
          { finding: "LA enlargement", description: "May be massive" },
          { finding: "Spontaneous echo contrast", description: "Smoke - stasis, thrombosis risk" },
          { finding: "LA thrombus", location: "Usually LA appendage" }
        ],
        doppler: [
          { finding: "Mean gradient", method: "Trace mitral inflow" },
          { finding: "MVA by PHT", formula: "MVA = 220/PHT", units: "cm²" },
          { finding: "MVA by planimetry", method: "Direct tracing in short axis" },
          { finding: "PASP estimate", method: "TR jet velocity + RAP" }
        ],
        wilkinsScore: {
          description: "Predicts success of balloon valvuloplasty",
          components: {
            leafletMobility: "1-4",
            leafletThickening: "1-4",
            subvalvularThickening: "1-4",
            calcification: "1-4"
          },
          interpretation: "Score ≤8 favorable for PBMV"
        },
        tee: {
          indications: ["Assess LA appendage thrombus before intervention", "Better visualization of commissures"]
        }
      },
      chestXray: {
        findings: [
          { finding: "LA enlargement", signs: ["Double density", "Elevated left mainstem bronchus", "Posterior displacement on lateral"] },
          { finding: "Straightening of left heart border", description: "Prominent LA appendage" },
          { finding: "Pulmonary venous hypertension", signs: ["Upper lobe diversion", "Kerley B lines", "Interstitial edema"] },
          { finding: "Mitral valve calcification", description: "On lateral view" }
        ]
      },
      cardiacCath: {
        indications: ["Discrepancy between echo and symptoms", "Before intervention"],
        measurements: ["Transmitral gradient", "PCWP", "PA pressures", "Cardiac output", "Calculate MVA by Gorlin"]
      }
    },
    
    ecgFindings: {
      laEnlargement: {
        pMitrale: "Broad notched P wave in II (>0.12s)",
        pTerminalForce: "Negative component in V1 >0.04 mm·s"
      },
      atrialFibrillation: "Common, may be first presentation",
      rvHypertrophy: {
        criteria: ["R>S in V1", "Right axis deviation", "RV strain pattern"],
        indicates: "Pulmonary hypertension"
      }
    },
    
    complications: [
      { complication: "Atrial fibrillation", frequency: "30-40%", management: "Rate control, anticoagulation" },
      { complication: "Thromboembolism", frequency: "10-20%", riskFactors: ["AF", "LA size", "Spontaneous echo contrast"], prevention: "Anticoagulation" },
      { complication: "Pulmonary hypertension", management: "Treat underlying MS" },
      { complication: "Infective endocarditis", risk: "Lower than MR" },
      { complication: "Pulmonary edema", precipitants: ["Pregnancy", "AF with RVR", "Infection"] }
    ],
    
    treatment: {
      medical: {
        rateControl: {
          agents: ["Beta-blockers", "Non-DHP CCBs (diltiazem, verapamil)", "Digoxin"],
          goal: "Prolong diastolic filling time"
        },
        anticoagulation: {
          indication: ["AF", "Prior embolism", "LA thrombus", "Severe LA enlargement"],
          agent: "Warfarin (INR 2-3)",
          note: "DOACs not well-studied in MS"
        },
        diuretics: "For pulmonary congestion",
        endocarditisProphylaxis: "For dental procedures"
      },
      interventional: {
        pbmv: {
          name: "Percutaneous Balloon Mitral Valvuloplasty",
          indications: ["Symptomatic moderate-severe MS", "MVA ≤1.5 cm²", "Favorable anatomy (Wilkins ≤8)"],
          contraindications: ["LA thrombus", "More than mild MR", "Severe calcification", "Severe subvalvular disease"],
          outcomes: "Success rate >90% in favorable anatomy, restenosis 30-40% at 10 years"
        }
      },
      surgical: {
        indications: ["Symptoms despite medical therapy", "Unfavorable anatomy for PBMV", "Need for other cardiac surgery"],
        options: {
          commissurotomy: "Open or closed, if pliable valve",
          mvr: {
            mechanical: "Durable but requires anticoagulation",
            bioprosthetic: "Limited durability (10-15 years), less anticoagulation need"
          }
        }
      }
    },
    
    specialPopulations: {
      pregnancy: {
        risk: "High risk, especially if MVA <1.5 cm²",
        management: ["Optimize before conception", "Beta-blockers safe", "PBMV can be done if needed"],
        delivery: "Vaginal preferred, careful fluid management"
      }
    }
  },

  // ============================================================================
  // I10-I16: HYPERTENSIVE DISEASES
  // ============================================================================
  
  I10: {
    icd10: "I10",
    name: "Essential (Primary) Hypertension",
    snomedCT: "59621000",
    category: "hypertensive",
    
    definition: "Persistently elevated blood pressure without identifiable secondary cause",
    
    epidemiology: {
      prevalence: "~30% of adults worldwide, increases with age",
      demographics: "Higher in African Americans, increases after menopause in women",
      riskFactors: ["Age", "Family history", "Obesity", "High sodium diet", "Sedentary lifestyle", "Alcohol excess"]
    },
    
    pathophysiology: {
      mechanisms: {
        raas: {
          name: "RAAS Activation",
          latex: "Angiotensinogen \\xrightarrow{Renin} AngI \\xrightarrow{ACE} AngII \\rightarrow Vasoconstriction + Aldosterone",
          effect: "Increased SVR and volume retention"
        },
        sympathetic: {
          name: "Sympathetic Overactivity",
          effect: "Increased HR, contractility, vasoconstriction"
        },
        endothelial: {
          name: "Endothelial Dysfunction",
          latex: "\\downarrow NO + \\uparrow Endothelin \\rightarrow Vasoconstriction",
          effect: "Impaired vasodilation"
        },
        renal: {
          name: "Pressure-Natriuresis Shift",
          description: "Higher pressure required to excrete sodium load"
        }
      },
      equations: {
        bloodPressure: {
          name: "Blood Pressure Equation",
          latex: "BP = CO \\times SVR",
          components: "CO = HR × SV"
        },
        meanArterialPressure: {
          name: "Mean Arterial Pressure",
          latex: "MAP = DBP + \\frac{1}{3}(SBP - DBP) \\approx \\frac{SBP + 2 \\times DBP}{3}",
          normal: "70-105 mmHg"
        },
        pulseWaveVelocity: {
          name: "Arterial Stiffness",
          latex: "PWV = \\sqrt{\\frac{E \\times h}{\\rho \\times d}}",
          description: "Increases with age and HTN"
        }
      },
      targetOrganDamage: {
        heart: ["LVH", "Diastolic dysfunction", "Heart failure", "CAD"],
        brain: ["Stroke", "Vascular dementia", "Hypertensive encephalopathy"],
        kidney: ["Nephrosclerosis", "CKD", "Proteinuria"],
        eye: ["Hypertensive retinopathy", "Papilledema"],
        vessels: ["Atherosclerosis", "Aortic aneurysm", "PAD"]
      }
    },
    
    clinicalPresentation: {
      symptoms: {
        usuallyAsymptomatic: "Majority have no symptoms - 'silent killer'",
        nonspecific: [
          { name: "Headache", description: "More common in severe HTN, often occipital, morning" },
          { name: "Dizziness", frequency: "Occasional" },
          { name: "Visual changes", description: "If retinopathy" },
          { name: "Dyspnea", description: "If heart failure" },
          { name: "Chest pain", description: "If CAD" },
          { name: "Epistaxis", description: "Not clearly causally related" }
        ],
        emergency: [
          { name: "Severe headache", description: "Hypertensive emergency" },
          { name: "Altered mental status", description: "Encephalopathy" },
          { name: "Chest pain", description: "Aortic dissection, MI" },
          { name: "Back pain", description: "Aortic dissection" },
          { name: "Dyspnea", description: "Pulmonary edema" }
        ]
      },
      signs: {
        bloodPressure: {
          technique: ["Seated, back supported, arm at heart level", "Appropriate cuff size", "Two readings 1-2 min apart"],
          classification_ACC_AHA_2017: {
            normal: "<120/<80",
            elevated: "120-129/<80",
            stage1: "130-139/80-89",
            stage2: "≥140/≥90",
            crisis: ">180/>120"
          }
        },
        cardiovascular: [
          { finding: "S4 gallop", description: "LV stiffness from hypertrophy" },
          { finding: "Loud A2", description: "Hypertension" },
          { finding: "Sustained apical impulse", description: "LVH" },
          { finding: "Bruits", location: "Carotid, renal, femoral - atherosclerosis" }
        ],
        fundoscopy: {
          keithWagenerClassification: {
            grade1: "Arteriolar narrowing/silver wiring",
            grade2: "AV nicking",
            grade3: "Hemorrhages and exudates",
            grade4: "Papilledema"
          }
        }
      }
    },
    
    diagnosticCriteria: {
      diagnosis: "Average of ≥2 readings on ≥2 occasions",
      abpm: {
        indication: "White coat HTN, masked HTN, resistant HTN",
        diagnostic: "Daytime average ≥135/85 or 24h average ≥130/80"
      },
      homeMonitoring: "Average ≥135/85"
    },
    
    laboratoryFindings: {
      initial: [
        { test: "Basic Metabolic Panel", loinc: "24323-8", purpose: "K+, Cr, glucose - baseline and for drug selection" },
        { test: "Urinalysis", loinc: "24356-8", purpose: "Proteinuria, hematuria - renal involvement" },
        { test: "Lipid Panel", loinc: "24331-1", purpose: "CV risk assessment" },
        { test: "Fasting Glucose/HbA1c", purpose: "Diabetes screening" },
        { test: "TSH", loinc: "3016-3", purpose: "Thyroid dysfunction" },
        { test: "CBC", purpose: "Baseline" }
      ],
      targetOrganDamage: [
        { test: "Urine Albumin:Creatinine", loinc: "14959-1", purpose: "Nephropathy", abnormal: "≥30 mg/g" },
        { test: "eGFR", loinc: "33914-3", purpose: "Renal function", abnormal: "<60 mL/min/1.73m²" },
        { test: "BNP/NT-proBNP", purpose: "Heart failure screening" }
      ],
      secondaryHTN: [
        { test: "Plasma Aldosterone/Renin", purpose: "Primary aldosteronism", note: "ARR >30 suggestive" },
        { test: "24h urine catecholamines/metanephrines", purpose: "Pheochromocytoma" },
        { test: "Plasma metanephrines", purpose: "Pheochromocytoma screening" },
        { test: "Cortisol (24h urine or dexamethasone suppression)", purpose: "Cushing syndrome" }
      ]
    },
    
    imagingFindings: {
      echocardiogram: {
        indication: "Assess LVH, diastolic function, baseline before treatment",
        findings: {
          lvh: {
            criteria: "LV mass index >115 g/m² (men), >95 g/m² (women)",
            patterns: {
              concentric: "RWT >0.42, ↑ LVMI - pressure overload",
              eccentric: "RWT ≤0.42, ↑ LVMI - volume overload",
              concentricRemodeling: "RWT >0.42, normal LVMI"
            }
          },
          diastolicFunction: ["E/A ratio", "e' velocity", "E/e' ratio", "LA volume index"],
          systolicFunction: "Usually preserved, may be reduced in HFrEF"
        }
      },
      renalArterydoppler: {
        indication: "Suspected renovascular HTN",
        findings: "RI >0.8, tardus-parvus waveform suggests stenosis"
      },
      ctaRenal: {
        indication: "Refractory HTN, renal artery stenosis suspected",
        findings: "Stenosis, fibromuscular dysplasia"
      },
      ecg: {
        lvhCriteria: {
          sokolowLyon: "S V1 + R V5/V6 >35mm",
          cornell: "(R aVL + S V3) >28mm (men), >20mm (women)",
          strain: "ST depression, T inversion in lateral leads"
        }
      }
    },
    
    riskAssessment: {
      ascvd: {
        tool: "Pooled Cohort Equations",
        variables: ["Age", "Sex", "Race", "Total cholesterol", "HDL", "SBP", "Treated HTN", "DM", "Smoking"],
        threshold: "≥10% = high risk"
      },
      targetOrganDamage: "Presence increases risk and may influence treatment threshold"
    },
    
    treatment: {
      lifestyle: {
        dash: { description: "DASH diet", bpReduction: "8-14 mmHg" },
        sodiumRestriction: { target: "<2.3g/day, ideally <1.5g", bpReduction: "5-6 mmHg" },
        weightLoss: { target: "BMI 18.5-24.9", bpReduction: "1 mmHg per kg lost" },
        exercise: { target: "150 min/week moderate aerobic", bpReduction: "4-9 mmHg" },
        alcohol: { limit: "≤2 drinks/day men, ≤1 women", bpReduction: "2-4 mmHg" },
        smoking: "Cessation essential for CV risk"
      },
      pharmacological: {
        firstLine: [
          { class: "ACE Inhibitors", examples: ["Lisinopril", "Enalapril", "Ramipril"], indication: "DM, CKD, HF, post-MI", contraindication: "Pregnancy, angioedema, bilateral RAS" },
          { class: "ARBs", examples: ["Losartan", "Valsartan", "Olmesartan"], indication: "ACEi intolerant, same as ACEi", contraindication: "Pregnancy, bilateral RAS" },
          { class: "CCBs (DHP)", examples: ["Amlodipine", "Nifedipine XL"], indication: "Elderly, African American, angina", contraindication: "HFrEF (short-acting)" },
          { class: "Thiazide Diuretics", examples: ["Chlorthalidone", "Hydrochlorothiazide", "Indapamide"], indication: "Elderly, osteoporosis, volume overload", contraindication: "Gout, severe hypoK" }
        ],
        secondLine: [
          { class: "Beta-blockers", examples: ["Metoprolol", "Carvedilol", "Bisoprolol"], indication: "Post-MI, HF, AF, migraine", note: "Not first-line unless compelling indication" },
          { class: "MRAs", examples: ["Spironolactone", "Eplerenone"], indication: "Resistant HTN, primary aldosteronism, HF" },
          { class: "Alpha-blockers", examples: ["Doxazosin"], indication: "BPH, resistant HTN" },
          { class: "Hydralazine", indication: "Pregnancy, HF" }
        ],
        combination: {
          preferred: ["ACEi/ARB + CCB", "ACEi/ARB + Thiazide", "CCB + Thiazide"],
          avoid: ["ACEi + ARB (hyperkalemia, no benefit)"]
        },
        goals: {
          general: "<130/80 (ACC/AHA 2017)",
          elderly: "Consider <140 if tolerated",
          diabetes: "<130/80",
          ckd: "<130/80"
        }
      },
      resistant: {
        definition: "BP above goal on 3 drugs including diuretic",
        evaluation: ["Adherence", "Secondary causes", "White coat effect"],
        management: ["Add spironolactone", "Device therapy (renal denervation) - investigational"]
      },
      emergencies: {
        hypertensiveEmergency: {
          definition: "SBP>180 or DBP>120 with target organ damage",
          management: "IV antihypertensives, reduce MAP by 20-25% in first hour",
          agents: ["Nitroprusside", "Nicardipine", "Labetalol", "Esmolol", "Fenoldopam"]
        },
        hypertensiveUrgency: {
          definition: "Severe HTN without TOD",
          management: "Oral medications, gradual reduction over 24-48h"
        }
      }
    },
    
    followUp: {
      initial: "Every 4 weeks until controlled",
      stable: "Every 3-6 months",
      monitoring: ["BP", "Electrolytes", "Creatinine", "Side effects"]
    }
  },

  // ============================================================================
  // I20-I25: ISCHEMIC HEART DISEASES
  // ============================================================================
  
  I20_0: {
    icd10: "I20.0",
    name: "Unstable Angina",
    snomedCT: "4557003",
    category: "ischemic",
    
    definition: "Acute coronary syndrome without biomarker elevation, representing plaque rupture with subtotal occlusion",
    
    pathophysiology: {
      mechanism: "Atherosclerotic plaque rupture/erosion → thrombus formation → critical stenosis",
      spectrum: "Part of ACS spectrum with NSTEMI and STEMI",
      equations: {
        oxygenSupplyDemand: {
          name: "Myocardial Oxygen Balance",
          latex: "MVO_2 = HR \\times SBP \\times \\frac{contractility}{coronary\\ supply}",
          description: "Imbalance leads to ischemia"
        },
        flowReserve: {
          name: "Coronary Flow Reserve",
          latex: "CFR = \\frac{CBF_{hyperemic}}{CBF_{rest}}",
          normal: ">2.0",
          abnormal: "<2.0 suggests significant stenosis"
        }
      }
    },
    
    clinicalPresentation: {
      symptoms: {
        chestPain: {
          character: "Pressure, squeezing, heaviness, tightness",
          location: "Substernal, left chest",
          radiation: "Left arm, jaw, back, epigastrium",
          duration: ">20 minutes (vs stable angina)",
          timing: "Rest or minimal exertion (vs stable)"
        },
        associated: [
          { symptom: "Dyspnea", frequency: "Common" },
          { symptom: "Diaphoresis", frequency: "50%" },
          { symptom: "Nausea/vomiting", frequency: "30%" },
          { symptom: "Lightheadedness", frequency: "Common" }
        ],
        atypical: {
          populations: ["Women", "Elderly", "Diabetics"],
          presentations: ["Epigastric pain", "Fatigue", "Dyspnea without chest pain"]
        }
      },
      braunwaldClassification: {
        severity: {
          I: "New onset severe or accelerated angina",
          II: "Subacute angina at rest (within 1 month, not within 48h)",
          III: "Acute angina at rest (within 48h)"
        },
        clinicalCircumstance: {
          A: "Secondary (anemia, fever, hypotension)",
          B: "Primary",
          C: "Post-MI (within 2 weeks)"
        }
      },
      signs: {
        vital: ["Tachycardia or bradycardia", "Hypertension or hypotension", "Diaphoresis"],
        cardiac: ["S4 (LV stiffness)", "S3 (if LV dysfunction)", "New MR murmur (papillary muscle dysfunction)"],
        pulmonary: ["Crackles if pulmonary edema"]
      }
    },
    
    diagnosticCriteria: {
      definition: "ACS with typical symptoms but NEGATIVE cardiac biomarkers (troponin)",
      vsNSTEMI: "Troponin negative in UA, positive in NSTEMI",
      vsStableAngina: "UA occurs at rest or with minimal exertion, crescendo pattern"
    },
    
    laboratoryFindings: {
      cardiac: [
        { test: "Troponin I/T (high-sensitivity)", loinc: "10839-9", normal: "<99th percentile", inUA: "Negative (defines UA vs NSTEMI)", timing: "Check at presentation, 3-6h, optionally 12h" },
        { test: "CK-MB", loinc: "13969-1", role: "Less sensitive, may miss small MI" },
        { test: "BNP/NT-proBNP", role: "Prognostic, elevated = worse outcome" }
      ],
      risk: [
        { test: "CBC", purpose: "Anemia (exacerbating factor)" },
        { test: "BMP", purpose: "Renal function (contrast, drug dosing)" },
        { test: "Glucose", purpose: "Hyperglycemia = worse prognosis" },
        { test: "Lipid panel", purpose: "Risk factor assessment" }
      ],
      coagulation: [
        { test: "PT/INR, PTT", purpose: "Baseline before anticoagulation" }
      ]
    },
    
    imagingFindings: {
      ecg: {
        timing: "Within 10 minutes of arrival",
        findings: {
          stDepression: { description: "≥0.5mm in ≥2 contiguous leads", significance: "High risk" },
          tWaveInversion: { description: "≥1mm in leads with dominant R wave", significance: "Intermediate risk" },
          normal: "Does not exclude ACS",
          dynamic: "Changes with symptoms highly suggestive"
        },
        location: {
          anteriorLeads: "V1-V4 - LAD territory",
          inferiorLeads: "II, III, aVF - RCA (usually) or LCx",
          lateralLeads: "I, aVL, V5-V6 - LCx territory"
        }
      },
      echocardiogram: {
        indication: "All patients with ACS",
        findings: {
          rwma: "Regional wall motion abnormality suggests ischemia/infarction",
          lvFunction: "EF assessment for prognosis and management",
          complications: "MR, VSD, pericardial effusion"
        }
      },
      coronaryAngiography: {
        indication: "Urgent if high-risk features, within 24-72h for intermediate risk",
        findings: {
          culpritLesion: "Typically eccentric, irregular, with thrombus",
          severity: "Visual or FFR/iFR assessment"
        }
      },
      ctAngiography: {
        indication: "Low-intermediate risk, rule out CAD",
        role: "High negative predictive value"
      }
    },
    
    riskStratification: {
      timiScore: {
        variables: ["Age ≥65", "≥3 CAD risk factors", "Known CAD (≥50% stenosis)", "ASA use in past 7 days", "≥2 anginal episodes in 24h", "ST deviation", "Elevated cardiac markers"],
        interpretation: {
          lowRisk: "0-2 points (5% event rate)",
          intermediateRisk: "3-4 points (13% event rate)",
          highRisk: "5-7 points (26% event rate)"
        }
      },
      graceScore: {
        variables: ["Age", "HR", "SBP", "Creatinine", "Killip class", "ST deviation", "Elevated markers", "Cardiac arrest"],
        output: "6-month mortality risk"
      },
      highRiskFeatures: [
        "Ongoing chest pain",
        "Hemodynamic instability",
        "Arrhythmias (VT/VF)",
        "Dynamic ST changes",
        "Elevated troponin (→ NSTEMI)",
        "GRACE score >140"
      ]
    },
    
    treatment: {
      immediate: {
        antiPlatelet: [
          { agent: "Aspirin", dose: "325mg loading, then 81mg daily", timing: "Immediately" },
          { agent: "P2Y12 inhibitor", options: ["Ticagrelor 180mg then 90mg BID", "Clopidogrel 600mg then 75mg daily", "Prasugrel 60mg then 10mg daily (PCI)"] }
        ],
        antiCoagulant: [
          { agent: "Heparin (UFH)", dose: "60 U/kg bolus, 12 U/kg/hr infusion", target: "aPTT 50-70s" },
          { agent: "Enoxaparin", dose: "1mg/kg q12h", note: "Adjust for CKD" },
          { agent: "Fondaparinux", dose: "2.5mg daily", note: "If high bleeding risk" }
        ],
        antiIschemic: [
          { agent: "Nitroglycerin", route: "SL then IV if ongoing pain", contraindication: "Hypotension, RV infarct, PDE5 inhibitor use" },
          { agent: "Beta-blocker", examples: ["Metoprolol"], goal: "HR 50-60", contraindication: "Acute HF, hypotension, bradycardia" },
          { agent: "Morphine", indication: "Refractory pain", caution: "May increase mortality - use sparingly" }
        ],
        other: [
          { agent: "High-intensity statin", examples: ["Atorvastatin 80mg", "Rosuvastatin 40mg"] },
          { agent: "ACE inhibitor", indication: "LV dysfunction, HTN, DM" }
        ]
      },
      invasive: {
        timing: {
          immediate: "Hemodynamic instability, refractory symptoms",
          early: "<24h for high-risk (GRACE >140, dynamic changes)",
          delayed: "24-72h for intermediate risk"
        },
        pci: {
          indication: "Culprit lesion amenable to intervention",
          technique: "DES preferred",
          adjunct: "GP IIb/IIIa inhibitor if needed"
        },
        cabg: {
          indication: "Left main disease, 3-vessel disease (especially with DM), failed PCI"
        }
      },
      secondary: {
        dapt: {
          duration: "12 months (may extend if high ischemic, low bleeding risk)",
          deEscalation: "May consider after 1-3 months if high bleeding risk"
        },
        longTerm: [
          "Aspirin indefinitely",
          "Statin (high-intensity)",
          "Beta-blocker (especially if LVEF reduced)",
          "ACE inhibitor (especially if LVEF reduced, HTN, DM)",
          "Cardiac rehab"
        ]
      }
    }
  },

  I21_0: {
    icd10: "I21.0",
    name: "ST Elevation Myocardial Infarction, Anterior Wall",
    snomedCT: "54329005",
    category: "ischemic",
    
    definition: "Acute myocardial necrosis due to complete coronary occlusion (usually LAD), with ST elevation on ECG",
    
    epidemiology: {
      incidence: "~250,000/year in US",
      mortality: "~10% in-hospital with modern treatment",
      anteriorStemi: "Typically larger infarct, higher mortality than inferior"
    },
    
    pathophysiology: {
      mechanism: "Plaque rupture → occlusive thrombus → transmural ischemia → necrosis",
      coronaryAnatomy: {
        lad: "Supplies anterior wall, septum, apex",
        lcx: "Supplies lateral wall",
        rca: "Supplies inferior wall, RV, conduction system"
      },
      waveOfNecrosis: {
        description: "Necrosis progresses from endocardium to epicardium",
        timeline: "Irreversible damage begins at 20-40 min, complete by 6-12h without reperfusion",
        equation: {
          name: "Infarct Size Evolution",
          latex: "IS(t) = IS_{max} \\times (1 - e^{-t/\\tau}) \\times (1 - f_{reperfusion})",
          description: "Salvage is time-dependent: 'Time is muscle'"
        }
      },
      stunningVsHibernation: {
        stunning: "Reversible dysfunction after brief ischemia",
        hibernation: "Chronic adaptive downregulation in chronic ischemia"
      }
    },
    
    clinicalPresentation: {
      symptoms: {
        chestPain: {
          character: "Severe, crushing, pressure, heaviness",
          location: "Substernal, may radiate",
          duration: ">20 minutes, not relieved by rest/NTG",
          onset: "Often at rest, may be exertional"
        },
        associated: [
          { symptom: "Diaphoresis", frequency: "Very common" },
          { symptom: "Dyspnea", frequency: "Common" },
          { symptom: "Nausea/vomiting", frequency: "50%" },
          { symptom: "Feeling of impending doom", frequency: "Common" },
          { symptom: "Syncope", frequency: "5-10%" }
        ],
        anteriorSpecific: {
          largeInfarct: "More dyspnea, higher risk of cardiogenic shock",
          apicalInvolvement: "Higher risk of LV thrombus, apical aneurysm"
        }
      },
      signs: {
        general: ["Anxious", "Diaphoretic", "Pale", "Cool extremities"],
        vitals: {
          hr: "Tachycardia usually, bradycardia if inferior/RV",
          bp: "Hypertension initially, hypotension if cardiogenic shock"
        },
        cardiac: [
          { finding: "S4", significance: "LV stiffness" },
          { finding: "S3", significance: "LV dysfunction, poor prognosis" },
          { finding: "New murmur", significance: "MR (papillary muscle), VSD" },
          { finding: "Pericardial friction rub", significance: "Pericarditis (day 2-3)" }
        ],
        killipClass: {
          I: { description: "No HF", mortality: "6%" },
          II: { description: "Crackles, S3, elevated JVP", mortality: "17%" },
          III: { description: "Pulmonary edema", mortality: "38%" },
          IV: { description: "Cardiogenic shock", mortality: "81%" }
        }
      }
    },
    
    diagnosticCriteria: {
      ecgCriteria: {
        stElevation: "≥1mm in ≥2 contiguous leads (≥2mm in V2-V3 men ≥40, ≥2.5mm men <40, ≥1.5mm women)",
        newLBBB: "Considered STEMI equivalent in appropriate clinical context",
        anteriorLeads: "V1-V6, I, aVL"
      },
      biomarkers: {
        troponin: "Rise and fall pattern, peak at 12-24h",
        ckMb: "Rise at 4-6h, peak 24h, normalize 48-72h"
      },
      fourthUniversalDefinition: {
        type1: "Atherosclerotic plaque rupture",
        type2: "Supply-demand mismatch",
        type3: "MI resulting in death before biomarkers obtained",
        type4a: "PCI-related MI",
        type4b: "Stent thrombosis",
        type5: "CABG-related MI"
      }
    },
    
    laboratoryFindings: {
      cardiac: [
        { test: "Troponin I/T (hs)", peak: "12-24h", normalization: "5-14 days", significance: "Diagnostic, prognostic" },
        { test: "CK-MB", peak: "24h", normalization: "48-72h", significance: "Re-infarction detection" },
        { test: "BNP/NT-proBNP", significance: "Prognostic, correlates with infarct size" }
      ],
      routine: [
        { test: "CBC", purpose: "Anemia, leukocytosis (stress response)" },
        { test: "BMP", purpose: "Renal function, electrolytes" },
        { test: "Glucose", significance: "Hyperglycemia = worse prognosis" },
        { test: "Lipid panel", purpose: "Risk assessment" },
        { test: "PT/INR, PTT", purpose: "Before anticoagulation" }
      ]
    },
    
    imagingFindings: {
      ecg: {
        anteriorSTEMI: {
          stElevation: "V1-V6, I, aVL",
          reciprocal: "ST depression in inferior leads (II, III, aVF)",
          qWaves: "Develop over hours-days, indicate necrosis",
          evolution: "Hyperacute T waves → ST elevation → Q waves → T inversion → normalization (months)"
        },
        wellensPattern: {
          type1: "Biphasic T in V2-V3 (LAD)",
          type2: "Deep symmetric T inversions V2-V6",
          significance: "High-grade LAD stenosis, impending anterior MI"
        },
        deWinterPattern: {
          description: "ST depression V1-V6 + tall symmetric T waves + ST elevation aVR",
          significance: "LAD occlusion STEMI equivalent"
        }
      },
      echocardiogram: {
        acute: [
          { finding: "Anterior/septal hypokinesis or akinesis", significance: "Confirms location" },
          { finding: "LVEF reduction", significance: "Prognostic" },
          { finding: "MR", mechanism: "Papillary muscle dysfunction" }
        ],
        complications: [
          { finding: "LV thrombus", timing: "Days to weeks post-MI, especially anterior/apical" },
          { finding: "Pericardial effusion", timing: "Early (hemorrhagic) or late (Dressler)" },
          { finding: "VSD", timing: "Day 3-5", location: "Septal rupture" },
          { finding: "Free wall rupture", timing: "Day 3-5", significance: "Usually fatal" },
          { finding: "LV aneurysm", timing: "Weeks-months", location: "Usually anterior/apical" }
        ]
      },
      coronaryAngiography: {
        timing: "Immediate (primary PCI)",
        findings: {
          culpritLesion: "Total occlusion with thrombus",
          timiFlow: {
            grade0: "No perfusion",
            grade1: "Minimal perfusion",
            grade2: "Partial perfusion",
            grade3: "Complete perfusion (goal of PCI)"
          }
        }
      }
    },
    
    riskScores: {
      timiSTEMI: {
        variables: ["Age 65-74 (2pts), ≥75 (3pts)", "DM/HTN/Angina (1pt)", "SBP<100 (3pts)", "HR>100 (2pts)", "Killip II-IV (2pts)", "Weight<67kg (1pt)", "Anterior or LBBB (1pt)", "Time >4h (1pt)"],
        mortality30day: {
          score0: "0.8%",
          score5: "12%",
          score10plus: ">25%"
        }
      }
    },
    
    treatment: {
      prehospital: {
        recognition: "ECG in field if available",
        activation: "Cath lab activation from field",
        medications: ["Aspirin 325mg", "Sublingual NTG if no contraindication", "Oxygen if SpO2<90%"]
      },
      reperfusion: {
        primaryPCI: {
          preference: "First choice if available within 120 min of first medical contact",
          doorToBalloon: "Goal <90 min",
          procedure: "Aspiration thrombectomy, DES to culprit"
        },
        fibrinolysis: {
          indication: "If PCI not available within 120 min",
          doorToNeedle: "Goal <30 min",
          agents: ["tPA (alteplase)", "Tenecteplase", "Reteplase"],
          contraindications: {
            absolute: ["Prior ICH", "Ischemic stroke <3mo", "Active bleeding", "Aortic dissection", "Brain tumor"],
            relative: ["SBP>180", "Recent surgery", "Prolonged CPR", "Pregnancy"]
          },
          rescuePCI: "If fibrinolysis fails (persistent ST elevation >90 min)"
        }
      },
      adjunctTherapy: {
        antiplatelet: [
          { agent: "Aspirin", dose: "325mg then 81mg daily" },
          { agent: "P2Y12 inhibitor", preferred: "Ticagrelor or prasugrel for PCI" }
        ],
        anticoagulant: [
          { agent: "UFH", context: "PCI" },
          { agent: "Bivalirudin", context: "Alternative for PCI" }
        ],
        other: [
          { agent: "High-intensity statin", timing: "Immediately" },
          { agent: "Beta-blocker", timing: "Within 24h if stable" },
          { agent: "ACE inhibitor", timing: "Within 24h, especially if anterior/EF reduced" }
        ]
      },
      complications: {
        cardiogenicShock: {
          management: ["Revascularization ASAP", "Inotropes", "IABP/Impella/ECMO"]
        },
        arrhythmias: {
          vf: "Defibrillation",
          vt: "Amiodarone, cardioversion",
          bradycardia: "Atropine, temporary pacing if needed"
        },
        mechanicalComplications: {
          freeWallRupture: "Emergent surgery",
          vsd: "Surgery (often delayed if stable)",
          papillaryMuscleRupture: "Surgery for acute severe MR"
        }
      },
      secondaryPrevention: {
        medications: [
          { agent: "Aspirin", duration: "Lifelong" },
          { agent: "P2Y12 inhibitor", duration: "12 months (may extend)" },
          { agent: "High-intensity statin", duration: "Lifelong" },
          { agent: "Beta-blocker", duration: "≥3 years, longer if EF reduced" },
          { agent: "ACE inhibitor/ARB", indication: "EF ≤40%, HTN, DM" },
          { agent: "Eplerenone", indication: "EF ≤40% with HF or DM" }
        ],
        lifestyle: ["Smoking cessation", "Cardiac rehabilitation", "Diet modification", "Exercise"],
        icd: {
          indication: "EF ≤35% at ≥40 days post-MI (wait for recovery)",
          exception: "May implant earlier if VT/VF >48h post-MI"
        }
      }
    }
  }
  
  // Continue with more diseases...
  // I21.1 - STEMI Inferior
  // I21.2 - STEMI Other sites
  // I21.3 - STEMI Unspecified
  // I21.4 - NSTEMI
  // I22 - Subsequent STEMI
  // I23 - Complications following STEMI
  // I24 - Other acute ischemic heart disease
  // I25 - Chronic ischemic heart disease
  // ... and hundreds more
};

// Helper functions for EMR integration
export const getDiseaseByCriteria = (criteria) => {
  // Match diseases based on clinical findings
  // This would be the basis for diagnostic decision support
  return Object.entries(CARDIAC_DISEASES).filter(([code, disease]) => {
    // Implement matching logic
    return true;
  });
};

export const getFHIRCondition = (icd10Code) => {
  // Convert to FHIR R4 Condition resource
  const disease = CARDIAC_DISEASES[icd10Code.replace('.', '_')];
  if (!disease) return null;
  
  return {
    resourceType: "Condition",
    code: {
      coding: [
        {
          system: "http://hl7.org/fhir/sid/icd-10-cm",
          code: disease.icd10,
          display: disease.name
        },
        {
          system: "http://snomed.info/sct",
          code: disease.snomedCT,
          display: disease.name
        }
      ]
    },
    // Additional FHIR fields would be populated from patient data
  };
};

export default CARDIAC_DISEASES;
