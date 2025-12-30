// ============================================================================
// COMPREHENSIVE CARDIAC DISEASE DATABASE - PART 2
// ICD-10-CM Chapter 9: Diseases of the Circulatory System (I00-I99)
// CONTINUATION: I21-I52 (Ischemic, Pulmonary Heart, Other Heart Diseases)
// ============================================================================

import { CARDIAC_DISEASES as PART1 } from './cardiacDiseases';

export const CARDIAC_DISEASES_PART2 = {
  
  // ============================================================================
  // I21.1-I21.4: OTHER STEMI AND NSTEMI
  // ============================================================================
  
  I21_1: {
    icd10: "I21.1",
    name: "ST Elevation Myocardial Infarction, Inferior Wall",
    snomedCT: "73795002",
    category: "ischemic",
    
    definition: "Acute myocardial necrosis of inferior wall due to RCA or LCx occlusion",
    
    pathophysiology: {
      coronaryAnatomy: {
        rca: { frequency: "80%", supplies: "Inferior wall, RV, SA node (60%), AV node (90%)" },
        lcx: { frequency: "20%", supplies: "Inferior wall in left-dominant systems" }
      },
      
      novelEquations: [
        {
          id: "inferior_infarct_size",
          name: "Inferior MI Size Estimation",
          isNovel: true,
          latex: "IS_{inf} = k \\times \\sum_{leads} ST_{elevation} \\times \\frac{T_{reperfusion}}{T_{golden}}",
          derivation: {
            background: "ST elevation magnitude correlates with ischemic territory size. Time to reperfusion determines salvage.",
            steps: [
              "1. Sum of ST elevation in II, III, aVF reflects ischemic burden",
              "2. Time factor: Golden hour (60 min) provides baseline, longer times increase final infarct",
              "3. Constant k derived from CMR correlation studies (k ≈ 0.15 for %LV mass)"
            ],
            evidence: "Derived from CRISP-AMI and other CMR validation studies",
            limitations: "Does not account for collateral flow or preconditioning"
          },
          clinicalUse: "Estimate infarct size from ECG and symptom-to-balloon time"
        },
        {
          id: "rv_infarct_hemodynamics",
          name: "RV Infarct Hemodynamic Model",
          isNovel: true,
          latex: "CO_{RVI} = \\frac{RAP - LAP}{R_{pulm}} \\times f(RV_{contractility}) \\times (1 - \\frac{IS_{RV}}{100})",
          derivation: {
            background: "RV infarction causes preload-dependent state. RV output determines LV filling.",
            steps: [
              "1. RV stroke work depends on preload (RAP) and afterload (pulmonary resistance)",
              "2. RV contractility factor decreases with infarct extent",
              "3. RV infarct size directly reduces effective RV output"
            ],
            evidence: "Based on invasive hemodynamic studies in RV infarction",
            clinicalImplication: "Explains why volume loading helps RVI but hurts LV failure"
          },
          clinicalUse: "Guide fluid management in inferior MI with RV involvement"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        typical: [
          { name: "Chest pain", character: "Similar to anterior MI" },
          { name: "Nausea/vomiting", frequency: "More common than anterior (vagal)", mechanism: "Bezold-Jarisch reflex" },
          { name: "Diaphoresis", frequency: "Very common" }
        ],
        rvInvolvement: [
          { name: "Hypotension", mechanism: "RV failure → reduced LV preload" },
          { name: "Clear lungs", description: "Despite hypotension (vs cardiogenic shock from LV failure)" },
          { name: "Elevated JVP", mechanism: "RV failure" },
          { name: "Kussmaul sign", description: "JVP rises with inspiration" }
        ]
      },
      signs: {
        triadOfRVI: ["Hypotension", "Elevated JVP", "Clear lungs"],
        bradycardia: "Common due to SA/AV node involvement",
        heartBlock: "Higher incidence than anterior MI"
      }
    },
    
    diagnosticCriteria: {
      ecg: {
        inferiorLeads: "ST elevation in II, III, aVF (III > II suggests RCA)",
        reciprocal: "ST depression in I, aVL",
        rvInfarct: "ST elevation in V1, V4R (right-sided leads)",
        posteriorExtension: "ST depression V1-V3 (mirror of posterior elevation)"
      }
    },
    
    laboratoryFindings: {
      biomarkers: [
        { test: "Troponin", pattern: "Rise and fall, typically lower peak than anterior MI" },
        { test: "BNP", significance: "May be lower than anterior due to smaller LV involvement" }
      ]
    },
    
    imagingFindings: {
      echocardiogram: {
        findings: [
          "Inferior/posterior wall hypokinesis or akinesis",
          "RV dilation and dysfunction if RV involved",
          "Preserved anterior wall motion (vs anterior MI)"
        ]
      },
      ecg: {
        stElevationPattern: {
          rca: "III > II, ST elevation V4R, ST depression I/aVL",
          lcx: "II > III, ST depression V1-V3 (posterior), less V4R elevation"
        }
      }
    },
    
    complications: {
      bradyarrhythmias: {
        frequency: "20-30%",
        types: ["Sinus bradycardia", "First-degree AVB", "Second-degree AVB (Wenckebach)", "Complete heart block"],
        management: "Usually transient, temporary pacing if symptomatic",
        prognosis: "Better than anterior MI heart block"
      },
      rvInfarction: {
        frequency: "30-50% of inferior MI",
        diagnosis: "ST elevation V4R, clinical triad",
        management: {
          do: ["Volume loading (cautious)", "Maintain sinus rhythm", "Consider inotropes"],
          avoid: ["Excessive diuresis", "Nitrates", "Morphine"]
        }
      }
    },
    
    treatment: {
      reperfusion: "Same as anterior STEMI - primary PCI preferred",
      rvInfarctSpecific: {
        fluids: "Careful volume expansion (250-500mL boluses)",
        inotropes: "Dobutamine if hypotensive despite fluids",
        avoidNitrates: "Can cause severe hypotension"
      }
    }
  },

  I21_4: {
    icd10: "I21.4",
    name: "Non-ST Elevation Myocardial Infarction (NSTEMI)",
    snomedCT: "401314000",
    category: "ischemic",
    
    definition: "ACS with troponin elevation but without persistent ST elevation - partial coronary occlusion",
    
    pathophysiology: {
      mechanism: "Plaque rupture with non-occlusive thrombus OR distal embolization OR supply-demand mismatch",
      vsSTEMI: "Subtotal occlusion allows some antegrade flow, preventing transmural ischemia",
      
      novelEquations: [
        {
          id: "nstemi_troponin_kinetics",
          name: "Troponin Release Kinetics Model",
          isNovel: true,
          latex: "Tn(t) = Tn_{max} \\times \\left(e^{-k_{release}(t-t_0)} - e^{-k_{clear}(t-t_0)}\\right) \\times \\frac{k_{clear}}{k_{clear}-k_{release}}",
          derivation: {
            background: "Troponin follows two-compartment pharmacokinetic model with release from damaged myocytes and renal/hepatic clearance",
            steps: [
              "1. Release phase: Troponin leaks from damaged cardiomyocytes (k_release)",
              "2. Clearance phase: Hepatic metabolism and renal excretion (k_clear)",
              "3. Peak timing depends on ratio of rate constants",
              "4. For hs-TnI: k_release ≈ 0.5/hr, k_clear ≈ 0.05/hr → peak at 12-24h"
            ],
            evidence: "Validated against serial troponin measurements in ACS cohorts",
            clinicalImplication: "Explains why serial troponins are needed; single value may miss early or late presentations"
          },
          clinicalUse: "Predict peak troponin, estimate timing of MI onset"
        },
        {
          id: "demand_ischemia_threshold",
          name: "Supply-Demand Ischemia Threshold",
          isNovel: true,
          latex: "Ischemia = \\begin{cases} 1 & \\text{if } \\frac{MVO_2}{Supply} > \\theta_{ischemic} \\\\ 0 & \\text{otherwise} \\end{cases}",
          where: "MVO_2 = HR \\times SBP \\times k_{contractility}, \\quad Supply = CBF \\times CaO_2 \\times (1-stenosis\\%)^2",
          derivation: {
            background: "Type 2 MI occurs when oxygen demand exceeds supply without plaque rupture",
            steps: [
              "1. Demand (MVO2) driven by rate-pressure product and contractility",
              "2. Supply determined by coronary blood flow and oxygen carrying capacity",
              "3. Stenosis effect follows Poiseuille (quadratic with radius)",
              "4. Threshold θ ≈ 1.5-2.0 from ischemia detection studies"
            ],
            evidence: "Derived from exercise stress testing and FFR studies",
            clinicalImplication: "Explains why anemia, tachycardia, hypotension cause Type 2 MI in patients with stable CAD"
          },
          clinicalUse: "Identify and treat precipitants of Type 2 MI"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        typical: [
          { name: "Chest pain", description: "Similar to UA/STEMI, may be less severe or more intermittent" },
          { name: "Dyspnea", frequency: "Common" },
          { name: "Diaphoresis", frequency: "Common" }
        ],
        type2MI: {
          triggers: ["Tachyarrhythmia", "Severe anemia", "Hypotension", "Respiratory failure", "Severe hypertension"],
          presentation: "May have symptoms of underlying condition more prominent than chest pain"
        }
      }
    },
    
    diagnosticCriteria: {
      definition: "Troponin rise/fall with at least one value > 99th percentile + clinical evidence of ischemia",
      ecg: {
        findings: ["ST depression ≥0.5mm", "T wave inversion", "Transient ST elevation", "May be normal"],
        notSTEMI: "No persistent (>20 min) ST elevation"
      },
      type1vs2: {
        type1: "Atherosclerotic plaque rupture/erosion",
        type2: "Supply-demand mismatch without plaque rupture"
      }
    },
    
    laboratoryFindings: {
      troponin: {
        pattern: "Rise and/or fall with at least one value > 99th percentile URL",
        hsTroponin: {
          rule_out: "<5 ng/L at 0 and 2h with low clinical risk",
          rule_in: "≥52 ng/L (hs-TnT) or delta >20% if initially elevated"
        },
        timing: "Check at presentation, 3h (or 1-2h with hs-Tn), consider 6h"
      }
    },
    
    riskStratification: {
      timiRisk: {
        variables: ["Age ≥65", "≥3 CAD risk factors", "Known CAD", "ASA use", "≥2 anginal episodes/24h", "ST deviation", "Elevated markers"],
        management: {
          lowRisk: "0-2: Conservative or invasive",
          intermediateRisk: "3-4: Early invasive (24-72h)",
          highRisk: "5-7: Early invasive (<24h)"
        }
      },
      graceScore: "Calculates mortality risk, guides invasive timing"
    },
    
    treatment: {
      antiplatelet: [
        { agent: "Aspirin", dose: "Loading then 81mg" },
        { agent: "P2Y12 inhibitor", timing: "Ticagrelor preferred, can pretreat or wait until anatomy known" }
      ],
      anticoagulation: "UFH, enoxaparin, or fondaparinux",
      invasiveStrategy: {
        timing: {
          immediate: "Refractory symptoms, hemodynamic instability, arrhythmias",
          early: "<24h for high-risk (GRACE >140, troponin+, dynamic ECG)",
          delayed: "25-72h for intermediate risk",
          selective: "Low risk - stress test first"
        }
      },
      type2MI: "Treat underlying cause (transfuse, rate control, etc.) rather than routine invasive approach"
    }
  },

  // ============================================================================
  // I25: CHRONIC ISCHEMIC HEART DISEASE
  // ============================================================================
  
  I25_1: {
    icd10: "I25.1",
    name: "Atherosclerotic Heart Disease (Chronic CAD)",
    snomedCT: "53741008",
    category: "ischemic",
    
    definition: "Chronic coronary artery disease due to atherosclerotic plaque, with or without angina",
    
    pathophysiology: {
      atherosclerosis: {
        stages: [
          { stage: "Fatty streak", description: "Lipid accumulation, foam cells", age: "Teens" },
          { stage: "Fibrous plaque", description: "Smooth muscle proliferation, fibrous cap", age: "20s-30s" },
          { stage: "Advanced lesion", description: "Necrotic core, calcification", age: "40s+" },
          { stage: "Complicated lesion", description: "Rupture, thrombosis, hemorrhage", event: "ACS" }
        ]
      },
      
      novelEquations: [
        {
          id: "plaque_progression_model",
          name: "Atherosclerotic Plaque Progression",
          isNovel: true,
          latex: "\\frac{dV_{plaque}}{dt} = k_{growth} \\times LDL_{ox} \\times Inflammation - k_{regress} \\times HDL \\times Statin_{effect}",
          derivation: {
            background: "Plaque volume changes reflect balance between lipid deposition/inflammation and reverse cholesterol transport",
            steps: [
              "1. Growth term: Oxidized LDL drives foam cell formation and plaque expansion",
              "2. Inflammatory amplification: CRP, IL-6 accelerate progression",
              "3. Regression term: HDL mediates cholesterol efflux from plaque",
              "4. Statin effect: Reduces LDL, stabilizes plaque, anti-inflammatory"
            ],
            evidence: "Based on IVUS serial imaging studies (REVERSAL, ASTEROID, GLAGOV)",
            clinicalImplication: "Intensive statin therapy can halt or reverse plaque progression"
          },
          clinicalUse: "Guide lipid-lowering intensity, predict plaque behavior"
        },
        {
          id: "ffr_stenosis_relationship",
          name: "FFR-Stenosis Severity Relationship",
          isNovel: true,
          latex: "FFR = \\frac{P_d}{P_a} = 1 - \\frac{Q \\times R_{stenosis}}{P_a} = 1 - k \\times \\frac{Q \\times L}{A_{min}^2}",
          derivation: {
            background: "FFR measures pressure drop across stenosis during maximal hyperemia, reflecting functional significance",
            steps: [
              "1. FFR = distal pressure / proximal pressure during hyperemia",
              "2. Pressure drop (ΔP) = Flow × Resistance (from Poiseuille)",
              "3. Stenosis resistance ∝ Length / (Minimal lumen area)²",
              "4. FFR ≤0.80 indicates ischemia-causing stenosis"
            ],
            evidence: "FAME, FAME-2 trials validated FFR-guided revascularization",
            clinicalImplication: "Intermediate stenoses (40-70%) require functional assessment; anatomy alone insufficient"
          },
          clinicalUse: "Guide revascularization decisions for intermediate stenoses"
        },
        {
          id: "myocardial_flow_reserve",
          name: "Myocardial Flow Reserve Equation",
          isNovel: true,
          latex: "MFR = \\frac{MBF_{stress}}{MBF_{rest}} = \\frac{\\Delta P / R_{total,stress}}{\\Delta P / R_{total,rest}}",
          derivation: {
            background: "MFR integrates epicardial stenosis + microvascular function, measured by PET",
            steps: [
              "1. Rest MBF: ~1.0 mL/min/g with autoregulation",
              "2. Stress MBF: Maximal vasodilation with adenosine/regadenoson",
              "3. Normal MFR > 2.5; reduced in epicardial CAD or microvascular disease",
              "4. Accounts for both focal and diffuse disease"
            ],
            evidence: "Prognostic value demonstrated in multiple PET studies",
            clinicalImplication: "Low MFR predicts adverse outcomes even with 'normal' FFR"
          },
          clinicalUse: "Diagnose microvascular disease, risk stratification"
        }
      ]
    },
    
    clinicalPresentation: {
      stableAngina: {
        character: "Predictable chest discomfort with exertion, relieved by rest/NTG",
        equivalents: ["Dyspnea on exertion", "Fatigue", "Arm/jaw pain with exertion"],
        ccsClassification: {
          I: "Angina with strenuous exertion only",
          II: "Slight limitation - angina walking >2 blocks, >1 flight stairs",
          III: "Marked limitation - angina walking 1-2 blocks, 1 flight",
          IV: "Angina with any activity or at rest"
        }
      },
      silentIschemia: {
        definition: "Objective evidence of ischemia without symptoms",
        populations: ["Diabetics", "Elderly", "Post-transplant"],
        prevalence: "Up to 25% of ischemic episodes in CAD patients"
      }
    },
    
    diagnosticCriteria: {
      preTestProbability: {
        method: "Duke Clinical Score or updated CAD Consortium model",
        factors: ["Age", "Sex", "Symptom typicality", "Risk factors"]
      },
      functionalTesting: {
        exerciseECG: {
          indication: "Intermediate PTP, able to exercise, interpretable ECG",
          positive: "≥1mm horizontal/downsloping ST depression",
          highRisk: [">2mm ST depression", "ST elevation", "Hypotension", "VT", "Duration <6 min"]
        },
        stressImaging: {
          indication: "Unable to exercise, uninterpretable ECG, prior revascularization",
          modalities: ["Stress echo", "Nuclear MPI (SPECT/PET)", "Stress CMR"],
          interpretation: "Reversible perfusion defect or wall motion abnormality"
        }
      },
      anatomicTesting: {
        ccta: {
          indication: "Intermediate PTP, especially younger patients",
          strengths: "High NPV (rules out CAD), plaque characterization",
          limitations: "Calcium, arrhythmia, cannot assess function"
        },
        invasiveAngiography: {
          indication: "High PTP, positive functional test, ACS, need for intervention"
        }
      }
    },
    
    laboratoryFindings: {
      lipids: {
        ldl: { target: "<70 mg/dL (high-risk), <55 (very high risk)", evidence: "ESC 2019, AHA 2018" },
        nonHdl: { target: "<100 mg/dL (high-risk)" },
        lpa: { elevated: ">50 mg/dL", significance: "Independent risk factor" }
      },
      inflammatory: {
        hsCRP: { lowRisk: "<1", moderate: "1-3", highRisk: ">3", units: "mg/L" }
      },
      glucose: {
        hba1c: { target: "<7% for most diabetics" }
      }
    },
    
    imagingFindings: {
      ccta: {
        stenosisGrading: {
          minimal: "<25%",
          mild: "25-49%",
          moderate: "50-69%",
          severe: "70-99%",
          occluded: "100%"
        },
        plaqueCharacterization: {
          calcified: "Stable, higher total burden",
          nonCalcified: "Higher risk for ACS",
          mixedPlaque: "Intermediate risk",
          highRiskFeatures: ["Low attenuation", "Positive remodeling", "Napkin-ring sign", "Spotty calcification"]
        }
      },
      functionalTesting: {
        stressEcho: {
          normalResponse: "Hyperdynamic, increased EF",
          ischemia: "New or worsening wall motion abnormality",
          viability: "Biphasic response (improvement then deterioration)"
        },
        nuclearMPI: {
          normalPerfusion: "Homogeneous tracer uptake",
          ischemia: "Reversible perfusion defect (stress present, rest resolved)",
          infarct: "Fixed perfusion defect",
          quantification: "SSS (summed stress score), SDS (summed difference score)"
        }
      }
    },
    
    treatment: {
      lifestyle: {
        smoking: "Cessation essential - reduces events 36%",
        diet: "Mediterranean diet - reduces events 30%",
        exercise: "≥150 min/week moderate - cardiac rehab",
        weight: "BMI target 18.5-25"
      },
      pharmacological: {
        antiplatelet: {
          aspirin: { dose: "75-100mg daily", evidence: "Reduces CV events ~25%" },
          addP2Y12: { indication: "Post-ACS, post-PCI", duration: "12 months typically" }
        },
        lipidLowering: {
          statins: {
            highIntensity: ["Atorvastatin 40-80mg", "Rosuvastatin 20-40mg"],
            target: "LDL <70 or 50% reduction",
            evidence: "CTT meta-analysis: 22% reduction per mmol/L LDL lowering"
          },
          ezetimibe: { indication: "LDL not at goal on max statin", evidence: "IMPROVE-IT" },
          pcsk9Inhibitors: { indication: "Very high risk, LDL not at goal", examples: ["Evolocumab", "Alirocumab"], evidence: "FOURIER, ODYSSEY" },
          bempedoicAcid: { indication: "Statin intolerant", evidence: "CLEAR Outcomes" }
        },
        antiAnginal: {
          betaBlockers: { mechanism: "Reduce HR, contractility, MVO2", firstLine: true },
          ccb: { mechanism: "Vasodilation, reduce afterload", types: ["DHP (amlodipine)", "Non-DHP (diltiazem)"] },
          nitrates: { mechanism: "Venodilation, reduce preload, coronary dilation", forms: ["SL NTG prn", "Long-acting (isosorbide)"] },
          ranolazine: { mechanism: "Late Na current inhibitor, reduces ischemia without hemodynamic effects" }
        },
        other: {
          aceInhibitor: { indication: "HTN, DM, LV dysfunction", evidence: "HOPE, EUROPA" },
          anticoagulation: { indication: "AF in CAD", agent: "DOAC + aspirin (drop P2Y12 after 1 year)" }
        }
      },
      revascularization: {
        indication: {
          symptoms: "Refractory to medical therapy",
          prognosis: ["Left main >50%", "3-vessel disease", "2-vessel with proximal LAD", "Large ischemic burden (>10%)"]
        },
        pciVsCabg: {
          pci: "Less invasive, faster recovery, may need repeat procedures",
          cabg: "More durable, better for DM + multivessel, left main (SYNTAX >32)",
          heartTeam: "Decision by multidisciplinary team using SYNTAX score"
        }
      }
    }
  },

  // ============================================================================
  // I26-I28: PULMONARY HEART DISEASE
  // ============================================================================
  
  I26_0: {
    icd10: "I26.0",
    name: "Pulmonary Embolism with Acute Cor Pulmonale",
    snomedCT: "59282003",
    category: "pulmonary_vascular",
    
    definition: "Obstruction of pulmonary arterial circulation by thrombus causing acute right heart strain",
    
    epidemiology: {
      incidence: "~1 per 1000 per year",
      mortality: "Untreated 30%, treated 2-8%, massive PE 25-50%"
    },
    
    pathophysiology: {
      mechanism: "Thrombus (usually from DVT) occludes pulmonary arteries → increased PVR → RV strain → RV failure → decreased LV preload → shock",
      
      novelEquations: [
        {
          id: "pe_hemodynamic_model",
          name: "PE Hemodynamic Cascade Model",
          isNovel: true,
          latex: "CO_{PE} = \\frac{MAP - RAP}{SVR} = \\frac{PASP - LAP}{PVR_{eff}} \\times \\frac{RV_{reserve}}{1 + \\frac{Clot\\%}{k_{critical}}}",
          derivation: {
            background: "PE causes acute increase in RV afterload. RV, normally thin-walled, cannot generate high pressures acutely.",
            steps: [
              "1. Clot obstruction increases effective PVR",
              "2. RV can only increase PASP to ~50-60 mmHg acutely (vs 80+ in chronic PH)",
              "3. When clot burden exceeds critical threshold (~50%), RV decompensates",
              "4. RV dilation → TR → further RV failure (positive feedback)",
              "5. Septal shift impairs LV filling (ventricular interdependence)"
            ],
            evidence: "Based on invasive hemodynamic studies in acute PE",
            clinicalImplication: "Explains why small additional clot can cause rapid deterioration"
          },
          clinicalUse: "Understand hemodynamic instability risk in PE"
        },
        {
          id: "pe_rv_pa_coupling",
          name: "RV-PA Coupling in Acute PE",
          isNovel: true,
          latex: "\\eta_{coupling} = \\frac{Ees_{RV}}{Ea_{PA}} = \\frac{\\frac{ESP}{ESV}}{\\frac{ESP}{SV}} = \\frac{SV}{ESV}",
          derivation: {
            background: "Coupling ratio describes efficiency of energy transfer from RV to pulmonary circulation",
            steps: [
              "1. Ees = RV end-systolic elastance (contractility)",
              "2. Ea = Arterial elastance (afterload)",
              "3. Optimal coupling when Ees/Ea ≈ 1.5-2.0",
              "4. In PE: Ea increases (clot), Ees cannot compensate → uncoupling",
              "5. Coupling <0.8 predicts adverse outcomes"
            ],
            evidence: "Derived from pressure-volume loop analysis in PE patients",
            clinicalImplication: "Echo-derived TAPSE/PASP ratio approximates coupling"
          },
          clinicalUse: "TAPSE/PASP <0.31 mm/mmHg predicts poor outcome"
        },
        {
          id: "clot_lysis_kinetics",
          name: "Thrombolysis Kinetics in PE",
          isNovel: true,
          latex: "\\frac{dClot}{dt} = -k_{lysis} \\times [tPA] \\times [Plasminogen] \\times \\frac{Clot}{Clot + K_m} + k_{formation} \\times [Fibrinogen] \\times [Thrombin]",
          derivation: {
            background: "Balance between clot lysis (plasmin) and formation (thrombin) determines net effect",
            steps: [
              "1. tPA activates plasminogen to plasmin on fibrin surface",
              "2. Michaelis-Menten kinetics for fibrin degradation",
              "3. Ongoing thrombin generation promotes clot extension",
              "4. Thrombolytics shift balance toward lysis",
              "5. Anticoagulation prevents extension but doesn't lyse"
            ],
            evidence: "Pharmacokinetic studies of fibrinolytic agents",
            clinicalImplication: "Earlier thrombolysis more effective (fresher clot, more plasminogen)"
          },
          clinicalUse: "Support early intervention in massive PE"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        common: [
          { name: "Dyspnea", frequency: "73%", character: "Sudden onset" },
          { name: "Pleuritic chest pain", frequency: "66%", mechanism: "Peripheral embolism with infarction" },
          { name: "Cough", frequency: "37%" },
          { name: "Hemoptysis", frequency: "13%" }
        ],
        massive: [
          { name: "Syncope", frequency: "~20% of massive", mechanism: "Transient cardiac arrest from acute RV failure" },
          { name: "Cardiac arrest", mechanism: "PEA most common" }
        ],
        atypical: ["Isolated anxiety", "Fever", "Wheezing", "New AF"]
      },
      signs: {
        general: ["Tachypnea", "Tachycardia", "Hypoxemia", "Low-grade fever"],
        cardiovascular: [
          { finding: "Elevated JVP", mechanism: "RV failure" },
          { finding: "RV heave", mechanism: "RV dilation" },
          { finding: "Loud P2", mechanism: "Pulmonary hypertension" },
          { finding: "TR murmur", mechanism: "RV dilation" },
          { finding: "S3/S4 (right-sided)", mechanism: "RV dysfunction" }
        ],
        pulmonary: [
          { finding: "Decreased breath sounds", mechanism: "Effusion" },
          { finding: "Crackles", mechanism: "Infarction" },
          { finding: "Pleural friction rub", mechanism: "Pleuritis" }
        ],
        leg: ["DVT signs in 30-50%", "Edema", "Tenderness", "Homans sign (insensitive)"]
      },
      riskStratification: {
        massive: "Sustained hypotension (SBP <90 or drop >40 for >15 min) or requiring pressors",
        submassive: "Normotensive with RV dysfunction (echo or biomarkers)",
        lowRisk: "Normotensive, no RV dysfunction"
      }
    },
    
    diagnosticCriteria: {
      clinicalProbability: {
        wellsScore: {
          variables: [
            { criterion: "Clinical DVT signs", points: 3 },
            { criterion: "PE most likely diagnosis", points: 3 },
            { criterion: "HR >100", points: 1.5 },
            { criterion: "Immobilization/surgery in 4 weeks", points: 1.5 },
            { criterion: "Prior DVT/PE", points: 1.5 },
            { criterion: "Hemoptysis", points: 1 },
            { criterion: "Malignancy", points: 1 }
          ],
          interpretation: {
            low: "<2 (unlikely)",
            intermediate: "2-6",
            high: ">6 (likely)"
          }
        },
        perc: {
          use: "Rule out PE in low-risk patients without D-dimer",
          criteria: ["Age <50", "HR <100", "SpO2 ≥95%", "No hemoptysis", "No estrogen", "No surgery/trauma", "No prior DVT/PE", "No unilateral leg swelling"],
          interpretation: "All 8 negative = PE ruled out"
        }
      },
      dDimer: {
        useInLowIntermediate: "If unlikely (Wells ≤4), D-dimer <500 ng/mL rules out",
        ageAdjusted: "Cutoff = Age × 10 (if >50 years)",
        limitations: "Elevated in pregnancy, malignancy, infection, recent surgery"
      }
    },
    
    laboratoryFindings: {
      biomarkers: [
        { test: "D-dimer", sensitivity: "95%", specificity: "~40%", use: "Rule out in low/intermediate probability" },
        { test: "Troponin", significance: "RV strain/ischemia, prognostic", elevated: "~50% of PE" },
        { test: "BNP/NT-proBNP", significance: "RV dysfunction, prognostic", elevated: "Predicts adverse outcome" }
      ],
      abg: {
        typical: ["Hypoxemia", "Hypocapnia (hyperventilation)", "Respiratory alkalosis", "Increased A-a gradient"],
        calculation: "A-a gradient = (FiO2 × 713 - PaCO2/0.8) - PaO2; normal = age/4 + 4"
      }
    },
    
    imagingFindings: {
      ctpa: {
        sensitivity: "83-100%",
        specificity: "89-97%",
        findings: {
          direct: ["Intraluminal filling defect", "Complete vessel occlusion"],
          indirect: ["Peripheral wedge-shaped opacity (infarct)", "Pleural effusion", "RV dilation (RV/LV >1.0)"],
          severity: "Clot burden scoring (Qanadli, Mastora)"
        }
      },
      echocardiogram: {
        indication: "Unstable patient (bedside), risk stratification",
        rvDysfunction: {
          qualitative: "RV dilation, hypokinesis",
          quantitative: [
            { parameter: "RV/LV ratio", abnormal: ">1.0" },
            { parameter: "TAPSE", abnormal: "<16 mm" },
            { parameter: "RV S'", abnormal: "<10 cm/s" },
            { parameter: "McConnell sign", description: "RV free wall akinesis with apical sparing (60% specific)" }
          ],
          other: ["Septal flattening/bowing", "TR", "Dilated IVC", "60-60 sign (PAT <60ms + PASP <60mmHg)"]
        },
        clotVisualization: "Mobile thrombus in RA/RV (in transit) - indicates very high risk"
      },
      vqScan: {
        indication: "Contrast allergy, CKD, pregnancy (lower radiation)",
        interpretation: {
          normal: "Rules out PE",
          highProbability: "≥2 large mismatched segments",
          nonDiagnostic: "Many intermediate results"
        }
      },
      lowerExtremityUS: {
        indication: "Confirm DVT source, if positive may avoid CTPA in some cases",
        findings: "Non-compressible vein, visible thrombus"
      },
      pulmonaryAngiography: {
        indication: "Rarely needed - discordant results, catheter-directed therapy"
      }
    },
    
    riskScores: {
      pesi: {
        variables: ["Age", "Male sex", "Cancer", "Heart failure", "Chronic lung disease", "HR ≥110", "SBP <100", "RR ≥30", "Temp <36°C", "AMS", "SpO2 <90%"],
        classes: {
          I: "≤65: Very low risk (0-1.6% mortality)",
          II: "66-85: Low risk",
          III: "86-105: Intermediate",
          IV: "106-125: High",
          V: ">125: Very high (10-24% mortality)"
        }
      },
      simplifiedPesi: {
        variables: ["Age >80", "Cancer", "Chronic cardiopulmonary disease", "HR ≥110", "SBP <100", "SpO2 <90%"],
        interpretation: "0 points = low risk (1% mortality), ≥1 = higher risk"
      }
    },
    
    treatment: {
      anticoagulation: {
        initial: {
          agents: [
            { drug: "UFH", indication: "Unstable, may need lysis, renal failure", monitoring: "aPTT 60-80s" },
            { drug: "LMWH", dose: "Enoxaparin 1mg/kg q12h", advantage: "No monitoring, can discharge early" },
            { drug: "Fondaparinux", dose: "Weight-based", advantage: "No HIT risk" },
            { drug: "DOACs", agents: ["Rivaroxaban", "Apixaban"], advantage: "Single-drug approach (no LMWH lead-in for riva/apix)" }
          ]
        },
        longTerm: {
          duration: {
            provoked: "3 months",
            unprovoked: "≥3 months, consider indefinite based on bleeding risk",
            cancer: "Indefinite while active",
            recurrent: "Indefinite"
          },
          agents: ["DOACs preferred over warfarin (EINSTEIN, AMPLIFY, Hokusai)"]
        }
      },
      thrombolysis: {
        indication: "Massive PE (hemodynamic instability)",
        relative: "Submassive with clinical deterioration",
        regimen: {
          alteplase: "100mg over 2h (or 50mg if <65kg)",
          accelerated: "0.6mg/kg over 15 min (max 50mg) in arrest"
        },
        contraindications: {
          absolute: ["Active bleeding", "Recent CVA", "Brain tumor", "Recent major surgery"],
          relative: ["Recent minor surgery", "BP >180/110", "Pregnancy", "Age >75"]
        },
        cathetherDirected: {
          indication: "Massive PE with contraindication to systemic lysis, or failure",
          techniques: ["CDT (low-dose tPA + catheter)", "Mechanical thrombectomy", "EKOS (ultrasound-assisted)"]
        }
      },
      surgicalEmbolectomy: {
        indication: "Massive PE, failed thrombolysis, contraindication to lysis, clot-in-transit"
      },
      ivcFilter: {
        indication: "Absolute contraindication to anticoagulation, recurrence on adequate anticoagulation",
        retrievable: "Remove when anticoagulation can resume"
      },
      supportive: {
        oxygen: "Maintain SpO2 >90%",
        fluids: "Cautious 500mL bolus (RV fails with volume overload)",
        vasopressors: "Norepinephrine preferred",
        inotropes: "Dobutamine for RV support",
        ecmo: "VA-ECMO as bridge in refractory shock"
      }
    }
  },

  // ============================================================================
  // I30-I33: PERICARDIAL DISEASES
  // ============================================================================
  
  I30_9: {
    icd10: "I30.9",
    name: "Acute Pericarditis, Unspecified",
    snomedCT: "3238004",
    category: "pericardial",
    
    definition: "Inflammation of the pericardium with characteristic clinical features",
    
    etiology: {
      idiopathic: "80-90% (most presumed viral)",
      viral: ["Coxsackie", "Echovirus", "EBV", "CMV", "HIV", "COVID-19"],
      bacterial: ["TB", "Purulent (staph, strep, pneumococcus)"],
      autoimmune: ["Lupus", "RA", "Scleroderma", "Sarcoidosis"],
      postMI: {
        early: "Within 1-3 days (peri-infarction pericarditis)",
        late: "Dressler syndrome (2-10 weeks)"
      },
      uremic: "BUN typically >60",
      neoplastic: ["Lung", "Breast", "Lymphoma", "Leukemia"],
      drugsRadiation: ["Hydralazine", "Procainamide", "Radiation"]
    },
    
    pathophysiology: {
      inflammation: "Neutrophils and macrophages infiltrate pericardium → fibrin deposition → friction",
      
      novelEquations: [
        {
          id: "pericardial_pressure_volume",
          name: "Pericardial Compliance Curve",
          isNovel: true,
          latex: "P_{peric}(V) = P_0 \\times e^{k(V - V_0)} + P_{atm}",
          derivation: {
            background: "Pericardium has J-shaped compliance: very compliant at low volumes, stiff at high volumes",
            steps: [
              "1. At baseline (V0), pericardial pressure ≈ atmospheric",
              "2. Slow accumulation (chronic) allows stretch → can accommodate >1L",
              "3. Rapid accumulation (acute) hits steep portion of curve early",
              "4. Small additional volume causes large pressure increase → tamponade",
              "5. Exponential model captures this non-linear behavior"
            ],
            evidence: "Derived from invasive pressure-volume studies in pericardiocentesis",
            clinicalImplication: "Explains why 200mL can cause tamponade acutely but 1L may not chronically"
          },
          clinicalUse: "Predict hemodynamic impact based on effusion rate"
        },
        {
          id: "tamponade_threshold",
          name: "Cardiac Tamponade Threshold",
          isNovel: true,
          latex: "Tamponade \\Rightarrow P_{peric} \\geq RAP \\geq RVEDP \\approx LAP \\approx LVEDP",
          derivation: {
            background: "Tamponade occurs when pericardial pressure exceeds intracardiac diastolic pressures, preventing filling",
            steps: [
              "1. Rising pericardial pressure eventually equals RA pressure",
              "2. At this point, RV filling impaired",
              "3. Equalization of diastolic pressures = diagnostic of tamponade",
              "4. Continues until all chambers have equal diastolic pressure",
              "5. CO falls due to reduced preload"
            ],
            evidence: "Classic catheterization findings in tamponade",
            clinicalImplication: "Chamber collapse occurs when intracavitary pressure < pericardial pressure"
          },
          clinicalUse: "Identify tamponade physiology on echo or cath"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        chestPain: {
          character: "Sharp, pleuritic",
          position: "Worse supine, better sitting forward",
          radiation: "Trapezius ridge (phrenic nerve - unique to pericarditis)",
          vsACS: "Pleuritic, positional, trapezius radiation favor pericarditis"
        },
        associated: [
          { name: "Dyspnea", mechanism: "Pain-related or if large effusion" },
          { name: "Fever", frequency: "Common" },
          { name: "Cough", mechanism: "Pleuritic irritation" }
        ]
      },
      signs: {
        fricitionRub: {
          character: "High-pitched, scratchy, superficial",
          components: "1-3 components (atrial, ventricular systole, ventricular diastole)",
          timing: "May be intermittent, better with leaning forward",
          specificity: "Virtually diagnostic when present",
          sensitivity: "~85%"
        },
        tamponadeSigns: ["Beck's triad (hypotension, JVD, muffled sounds)", "Pulsus paradoxus >10mmHg", "Tachycardia"]
      }
    },
    
    diagnosticCriteria: {
      esc2015: {
        criteria: "2 of 4 required",
        features: [
          "Pericarditic chest pain",
          "Pericardial friction rub",
          "New widespread ST elevation or PR depression on ECG",
          "Pericardial effusion (new or worsening)"
        ],
        supportive: ["Elevated CRP/ESR", "Evidence of pericardial inflammation on CT/MRI"]
      }
    },
    
    laboratoryFindings: {
      inflammatory: [
        { test: "CRP", expected: "Elevated in >75%", use: "Diagnosis and monitoring (normalize before stopping therapy)" },
        { test: "ESR", expected: "Elevated", use: "Less specific than CRP" },
        { test: "WBC", expected: "Leukocytosis common" }
      ],
      cardiac: [
        { test: "Troponin", expected: "Elevated in 30-50% (myopericarditis)", significance: "Does NOT indicate worse prognosis in pericarditis" }
      ],
      etiologyWorkup: {
        ifClinicallyIndicated: [
          { test: "ANA, RF", indication: "Suspected autoimmune" },
          { test: "TSH", indication: "Hypothyroidism" },
          { test: "BUN/Cr", indication: "Uremia" },
          { test: "HIV", indication: "Risk factors" },
          { test: "TB (PPD, IGRA)", indication: "Endemic area, risk factors" },
          { test: "Pericardial fluid analysis", indication: "Large effusion, suspected bacterial/TB/malignant" }
        ]
      }
    },
    
    imagingFindings: {
      ecg: {
        stages: [
          { stage: 1, timing: "Hours-days", findings: "Diffuse ST elevation (concave up), PR depression (most specific), PR elevation in aVR" },
          { stage: 2, timing: "1-2 weeks", findings: "ST normalizes, T waves flatten" },
          { stage: 3, timing: "2-3 weeks", findings: "T wave inversions" },
          { stage: 4, timing: "Weeks-months", findings: "ECG normalizes" }
        ],
        differentiation: {
          vsSTEMI: ["Diffuse not territorial", "No reciprocal changes", "PR depression", "Concave (not convex) ST elevation", "No Q waves"]
        }
      },
      echocardiogram: {
        effusion: {
          sizing: {
            trivial: "<10mm diastole",
            small: "10-20mm",
            moderate: "20mm",
            large: ">20mm"
          },
          distribution: "Circumferential vs loculated",
          tamponade: ["RA systolic collapse", "RV diastolic collapse (more specific)", "Respiratory variation >25% MV inflow", "IVC plethora"]
        }
      },
      ctMri: {
        indication: "Recurrent, suspected constrictive, neoplastic evaluation",
        findings: {
          ct: "Pericardial thickening, effusion, calcification (constrictive)",
          mri: "Enhancement with gadolinium = active inflammation"
        }
      }
    },
    
    complications: [
      { complication: "Pericardial effusion", frequency: "60%", management: "Monitor, drain if tamponade" },
      { complication: "Cardiac tamponade", frequency: "5%", management: "Urgent pericardiocentesis" },
      { complication: "Recurrence", frequency: "30% without colchicine, 15% with", management: "Extended therapy, IL-1 blockade" },
      { complication: "Constrictive pericarditis", frequency: "1% (viral)", management: "Pericardiectomy if symptomatic" }
    ],
    
    treatment: {
      firstLine: {
        nsaids: {
          preferred: "Aspirin 750-1000mg q8h or Ibuprofen 600mg q8h",
          duration: "1-2 weeks, taper over 3-4 weeks",
          gastricProtection: "PPI"
        },
        colchicine: {
          dose: "0.5mg BID (or daily if <70kg or intolerant)",
          duration: "3 months",
          evidence: "COPE, ICAP trials - reduces recurrence by 50%",
          sideEffects: "Diarrhea (dose-reduce)"
        }
      },
      secondLine: {
        corticosteroids: {
          indication: "NSAID/ASA contraindication, refractory, autoimmune",
          dose: "Prednisone 0.25-0.5mg/kg/day",
          taper: "Very slow (over months) to prevent recurrence",
          caution: "Associated with MORE recurrence if used early"
        }
      },
      refractory: {
        anakinra: {
          mechanism: "IL-1 receptor antagonist",
          indication: "Colchicine-resistant recurrent pericarditis",
          evidence: "AIRTRIP trial - 90% reduction in recurrence"
        },
        azathioprine: "Steroid-sparing in autoimmune",
        pericardiectomy: "Last resort for recurrent disabling pericarditis"
      },
      activityRestriction: {
        nonAthlete: "Avoid strenuous activity until symptoms resolve and CRP normalizes",
        athlete: "3 months minimum, longer if myocardial involvement"
      }
    }
  },

  I31_1: {
    icd10: "I31.1",
    name: "Chronic Constrictive Pericarditis",
    snomedCT: "41339007",
    category: "pericardial",
    
    definition: "Thickened, fibrotic, often calcified pericardium restricting cardiac filling",
    
    pathophysiology: {
      mechanism: "Chronic inflammation → fibrosis → loss of pericardial compliance → impaired diastolic filling",
      
      novelEquations: [
        {
          id: "constriction_hemodynamics",
          name: "Constrictive Physiology Model",
          isNovel: true,
          latex: "SV = \\frac{1}{K_{peric}} \\times (RAP - P_{peric,min}) \\times (1 - e^{-t_{diastole}/\\tau_{fill}})",
          derivation: {
            background: "In constriction, filling is limited by rigid pericardium, not myocardial compliance",
            steps: [
              "1. Early diastole: Ventricles fill rapidly (unopposed by pericardium initially)",
              "2. Mid-diastole: Filling abruptly stops when ventricular volume hits pericardial limit",
              "3. This creates 'square root sign' on pressure tracing",
              "4. SV becomes preload-independent once pericardial limit reached",
              "5. Higher pericardial stiffness (K_peric) → lower maximal SV"
            ],
            evidence: "Invasive hemodynamic studies in constrictive pericarditis",
            clinicalImplication: "Diuretics can decrease preload below constrictive limit, worsening CO"
          },
          clinicalUse: "Understand paradox of 'too dry' in constriction"
        },
        {
          id: "ventricular_interdependence",
          name: "Enhanced Ventricular Interdependence",
          isNovel: true,
          latex: "\\Delta SV_{LV} = -k_{couple} \\times \\Delta SV_{RV} \\quad \\text{(opposite in constriction)}",
          derivation: {
            background: "Rigid pericardium enhances competition between ventricles for fixed total cardiac volume",
            steps: [
              "1. Total cardiac volume fixed by rigid pericardium",
              "2. Inspiration: ↑RV filling → septal shift → ↓LV filling → ↓LV SV",
              "3. Expiration: ↓RV filling → septal shift → ↑LV filling → ↑LV SV",
              "4. This is OPPOSITE of normal (where LV SV ↑ with inspiration)",
              "5. Respiratory variation >25% in mitral inflow velocity"
            ],
            evidence: "Doppler echocardiography studies, invasive hemodynamics",
            clinicalImplication: "Basis for 'septal bounce' and respiratory variation on echo"
          },
          clinicalUse: "Distinguish constrictive from restrictive physiology"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        rightHeartFailure: [
          { name: "Peripheral edema", frequency: "Very common" },
          { name: "Ascites", frequency: "Common, often disproportionate to edema" },
          { name: "Hepatomegaly", frequency: "Common" },
          { name: "Fatigue", mechanism: "Low cardiac output" }
        ],
        reduced: ["Dyspnea on exertion", "Exercise intolerance"]
      },
      signs: {
        jvp: [
          { finding: "Elevated", frequency: "Nearly universal" },
          { finding: "Kussmaul sign", description: "JVP rises with inspiration (85% sensitive)" },
          { finding: "Prominent y descent", description: "Rapid early diastolic filling" }
        ],
        pericardialKnock: "Early diastolic sound (abrupt halt of filling)",
        hepatomegaly: "Pulsatile if severe TR",
        ascites: "May be massive"
      }
    },
    
    diagnosticCriteria: {
      imaging: {
        pericardialThickening: ">4mm (but can have constriction with normal thickness)",
        calcification: "Highly suggestive"
      },
      hemodynamics: {
        equalization: "RVEDP = LVEDP within 5mmHg",
        squareRootSign: "Dip-and-plateau pattern",
        respiratoryVariation: "Discordant LV/RV pressures with respiration"
      }
    },
    
    laboratoryFindings: {
      bnp: {
        pattern: "Only mildly elevated (often <100) despite severe symptoms",
        reason: "Fixed pericardium limits wall stress",
        vsRestrictive: "Restrictive has markedly elevated BNP"
      }
    },
    
    imagingFindings: {
      echocardiogram: {
        findings: [
          { finding: "Septal bounce", description: "Abrupt septal shift with respiration" },
          { finding: "Respiratory variation", parameter: "Mitral E velocity", abnormal: ">25% with respiration" },
          { finding: "Hepatic vein Doppler", description: "Prominent diastolic reversal with expiration" },
          { finding: "Annulus paradoxus", description: "e' > 8 cm/s (preserved or increased) despite high filling pressures" },
          { finding: "Medial e' > lateral e'", description: "Annulus reversus (lateral constrained by pericardium)" }
        ],
        vsRestrictive: {
          constriction: ["Septal bounce", "Respiratory variation", "Normal/high e'", "Low BNP"],
          restriction: ["No septal bounce", "No respiratory variation", "Low e'", "High BNP"]
        }
      },
      ctMri: {
        ct: {
          findings: "Pericardial thickening ≥4mm, calcification",
          sensitivity: "88% for thickening"
        },
        mri: {
          findings: "Thickening, septal bounce on real-time imaging",
          advantage: "Better soft tissue characterization"
        }
      },
      cardiac_catheterization: {
        indication: "When non-invasive discordant with symptoms, pre-operative",
        findings: {
          equalization: "RVEDP ≈ LVEDP (within 5mmHg)",
          squareRoot: "Dip-and-plateau or square root sign",
          discordance: "LV and RV systolic pressures move opposite with respiration (constriction) vs together (restriction)",
          ratio: "RVEDP/RVSP >1/3"
        }
      }
    },
    
    treatment: {
      medical: {
        diuretics: {
          indication: "Congestion",
          caution: "May worsen CO if over-diuresed"
        },
        antiInflammatory: "If effusive-constrictive with ongoing inflammation"
      },
      surgical: {
        pericardiectomy: {
          indication: "Symptomatic constriction",
          timing: "Don't delay - outcomes worse with longer duration",
          technique: "Complete pericardiectomy (phrenicnerve to phrenic nerve)",
          mortality: "5-10%",
          improvement: "75-90% symptom improvement"
        }
      }
    }
  }
};

// ============================================================================
// NOVEL EQUATIONS REGISTRY - For UI highlighting
// ============================================================================

export const NOVEL_EQUATIONS = [
  // Ischemic
  { id: "inferior_infarct_size", disease: "I21_1", category: "ischemic", complexity: "intermediate" },
  { id: "rv_infarct_hemodynamics", disease: "I21_1", category: "ischemic", complexity: "advanced" },
  { id: "nstemi_troponin_kinetics", disease: "I21_4", category: "biomarkers", complexity: "intermediate" },
  { id: "demand_ischemia_threshold", disease: "I21_4", category: "ischemic", complexity: "intermediate" },
  { id: "plaque_progression_model", disease: "I25_1", category: "atherosclerosis", complexity: "advanced" },
  { id: "ffr_stenosis_relationship", disease: "I25_1", category: "hemodynamics", complexity: "intermediate" },
  { id: "myocardial_flow_reserve", disease: "I25_1", category: "hemodynamics", complexity: "intermediate" },
  
  // PE
  { id: "pe_hemodynamic_model", disease: "I26_0", category: "hemodynamics", complexity: "advanced" },
  { id: "pe_rv_pa_coupling", disease: "I26_0", category: "hemodynamics", complexity: "advanced" },
  { id: "clot_lysis_kinetics", disease: "I26_0", category: "pharmacology", complexity: "advanced" },
  
  // Pericardial
  { id: "pericardial_pressure_volume", disease: "I30_9", category: "hemodynamics", complexity: "intermediate" },
  { id: "tamponade_threshold", disease: "I30_9", category: "hemodynamics", complexity: "intermediate" },
  { id: "constriction_hemodynamics", disease: "I31_1", category: "hemodynamics", complexity: "advanced" },
  { id: "ventricular_interdependence", disease: "I31_1", category: "hemodynamics", complexity: "advanced" }
];

// Merge with Part 1
export const ALL_CARDIAC_DISEASES = {
  ...PART1,
  ...CARDIAC_DISEASES_PART2
};

export default CARDIAC_DISEASES_PART2;
