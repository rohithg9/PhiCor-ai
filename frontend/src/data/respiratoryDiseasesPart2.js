// ============================================================
// RESPIRATORY DISEASES DATABASE - PART 2
// Interstitial Lung Diseases, ARDS, Pulmonary Embolism, Lung Cancers
// ============================================================

export const RESPIRATORY_DISEASES_PART2 = {
  // =====================
  // INTERSTITIAL LUNG DISEASES (J84)
  // =====================
  
  J84_1: {
    name: "Idiopathic Pulmonary Fibrosis",
    icd10: "J84.1",
    category: "respiratory",
    definition: "Chronic, progressive fibrosing interstitial pneumonia of unknown cause with UIP pattern",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart"],
    pathophysiology: {
      mechanism: "Repetitive alveolar epithelial injury → aberrant wound healing → myofibroblast activation → extracellular matrix deposition → fibrosis",
      molecularBasis: "TGF-β, PDGF, connective tissue growth factor; telomere shortening; MUC5B polymorphism",
      equations: {
        gapIndex: {
          name: "GAP Index and Staging System",
          latex: "GAP = G + A + P",
          description: "Gender (G), Age (A), Physiology (P: FVC%, DLCO%). Stages I-III predict mortality",
          derivation: [
            { step: 1, title: "Gender Component", description: "Female = 0 points; Male = 1 point" },
            { step: 2, title: "Age Component", description: "≤60 = 0; 61-65 = 1; >65 = 2 points" },
            { step: 3, title: "Physiology", description: "FVC: >75% = 0, 50-75% = 1, <50% = 2. DLCO: >55% = 0, 36-55% = 1, ≤35% or unable = 3. Stage I (0-3), II (4-5), III (6-8)" }
          ],
          isNovel: false,
          source: "Ley et al., Ann Intern Med 2012"
        },
        fvcDecline: {
          name: "FVC Decline Threshold",
          latex: "\\text{Significant decline: } \\Delta FVC \\geq 5\\text{-}10\\% \\text{ over 6-12 months}",
          description: "≥10% absolute decline in FVC predicts mortality; ≥5% may be clinically meaningful",
          derivation: [
            { step: 1, title: "Serial Spirometry", description: "Perform FVC every 3-6 months" },
            { step: 2, title: "Calculate Change", description: "Absolute change = current FVC% - baseline FVC%" },
            { step: 3, title: "Interpret", description: "≥10% decline = definite progression; 5-10% = possible progression; <5% = stable" }
          ],
          isNovel: false,
          source: "ATS/ERS/JRS/ALAT IPF Guidelines 2022"
        },
        dlcoSeverity: {
          name: "DLCO Severity Classification",
          latex: "\\text{DLCO severity} = \\begin{cases} \\text{Mild} & \\geq 60\\% \\\\ \\text{Moderate} & 40\\text{-}60\\% \\\\ \\text{Severe} & < 40\\% \\end{cases}",
          description: "Diffusing capacity reflects gas exchange impairment",
          derivation: [
            { step: 1, title: "Measure DLCO", description: "Single-breath method, corrected for hemoglobin" },
            { step: 2, title: "Calculate Percent Predicted", description: "Compare to reference equations" },
            { step: 3, title: "Clinical Correlation", description: "DLCO <40% predicts exercise desaturation and poor prognosis" }
          ],
          isNovel: false
        },
        sixMinuteWalk: {
          name: "6-Minute Walk Distance and Desaturation",
          latex: "\\text{Poor prognosis: } 6MWD < 250m \\text{ or } SpO_2 < 88\\%",
          description: "Exercise capacity and desaturation predict outcomes in IPF",
          derivation: [
            { step: 1, title: "Perform 6MWT", description: "Standardized corridor walk for 6 minutes" },
            { step: 2, title: "Record Distance", description: "Total meters walked in 6 minutes" },
            { step: 3, title: "Monitor SpO2", description: "Nadir SpO2 during test; <88% indicates significant impairment" }
          ],
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Progressive dyspnea on exertion",
        "Chronic dry cough",
        "Fatigue",
        "Weight loss",
        "Symptoms present >3 months"
      ],
      signs: [
        "Bibasilar fine inspiratory crackles (Velcro crackles)",
        "Digital clubbing (25-50%)",
        "Cyanosis (late)",
        "Signs of pulmonary hypertension (late)",
        "Right heart failure (late)"
      ]
    },
    laboratoryFindings: [
      { name: "FVC", normalRange: "≥80% predicted", abnormalInDisease: "Reduced, often 50-80%" },
      { name: "DLCO", normalRange: "≥80% predicted", abnormalInDisease: "Reduced disproportionate to FVC" },
      { name: "FVC/DLCO ratio", normalRange: "~1", abnormalInDisease: ">1.5 suggests pulmonary vascular disease" },
      { name: "ABG", normalRange: "PaO2 80-100", abnormalInDisease: "Hypoxemia, especially with exercise" },
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated if pulmonary hypertension" },
      { name: "KL-6", normalRange: "<1000 U/mL", abnormalInDisease: "Elevated (serum biomarker)" }
    ],
    imagingFindings: {
      hrct: [
        "UIP pattern: basal-predominant, peripheral, subpleural",
        "Honeycombing (clustered cystic airspaces)",
        "Traction bronchiectasis",
        "Reticulation",
        "Minimal ground-glass opacity"
      ],
      chestXray: ["Bilateral reticular opacities", "Reduced lung volumes", "Peripheral basal distribution"]
    },
    severity: {
      mild: { description: "GAP Stage I - FVC ≥80%, DLCO ≥55%" },
      moderate: { description: "GAP Stage II - FVC 50-80%, DLCO 36-55%" },
      severe: { description: "GAP Stage III - FVC <50%, DLCO ≤35%" }
    }
  },

  J84_0: {
    name: "Alveolar and Parieto-alveolar Conditions (Pulmonary Alveolar Proteinosis)",
    icd10: "J84.0",
    category: "respiratory",
    definition: "Accumulation of surfactant lipoproteins in alveoli due to impaired macrophage clearance",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "GM-CSF signaling disruption → impaired alveolar macrophage function → surfactant accumulation",
      molecularBasis: "Autoimmune (anti-GM-CSF antibodies), hereditary (CSF2RA/RB mutations), or secondary causes",
      equations: {
        diseaseScore: {
          name: "Disease Severity Score (DSS)",
          latex: "DSS = \\frac{SpO_2 \\text{ at rest}}{100} + \\frac{PaO_2 \\text{ at rest}}{100}",
          description: "Novel composite score; lower values indicate worse disease",
          derivation: [
            { step: 1, title: "Oxygen Assessment", description: "Measure resting SpO2 and PaO2 on room air" },
            { step: 2, title: "Calculate Score", description: "Normalize each to 100 scale and combine" },
            { step: 3, title: "Treatment Decision", description: "Lower scores may prompt earlier whole lung lavage" }
          ],
          isNovel: true
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Progressive dyspnea",
        "Cough (usually nonproductive)",
        "Low-grade fever",
        "Weight loss",
        "Chest pain (uncommon)",
        "May be asymptomatic"
      ],
      signs: [
        "Crackles (sometimes)",
        "Cyanosis (severe cases)",
        "Clubbing (rare)"
      ]
    },
    laboratoryFindings: [
      { name: "LDH", normalRange: "140-280 U/L", abnormalInDisease: "Often elevated" },
      { name: "Anti-GM-CSF antibodies", normalRange: "Negative", abnormalInDisease: "Positive in autoimmune PAP" },
      { name: "CEA in BAL", normalRange: "Low", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      hrct: ["Crazy-paving pattern", "Geographic ground-glass opacity", "Interlobular septal thickening within GGO"],
      chestXray: ["Bilateral alveolar opacities", "Bat-wing distribution"]
    }
  },

  // =====================
  // ACUTE RESPIRATORY DISTRESS SYNDROME (J80)
  // =====================

  J80: {
    name: "Acute Respiratory Distress Syndrome (ARDS)",
    icd10: "J80",
    category: "respiratory",
    definition: "Acute, diffuse, inflammatory lung injury leading to non-cardiogenic pulmonary edema and hypoxemic respiratory failure",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart", "brain", "kidneys"],
    pathophysiology: {
      mechanism: "Alveolar-capillary barrier damage → protein-rich pulmonary edema → surfactant dysfunction → V/Q mismatch → hypoxemia",
      molecularBasis: "Neutrophil-mediated injury, cytokine storm (IL-1, IL-6, TNF-α), reactive oxygen species, complement activation",
      equations: {
        berlinCriteria: {
          name: "Berlin Definition of ARDS",
          latex: "\\text{ARDS} = \\text{Timing} + \\text{Imaging} + \\text{Origin} + \\text{Oxygenation}",
          description: "Timing within 1 week; Bilateral opacities on CXR/CT; Not fully explained by cardiac failure; PaO2/FiO2 ≤300 on PEEP ≥5",
          derivation: [
            { step: 1, title: "Timing", description: "Within 1 week of known clinical insult or new/worsening respiratory symptoms" },
            { step: 2, title: "Chest Imaging", description: "Bilateral opacities not fully explained by effusions, collapse, or nodules" },
            { step: 3, title: "Origin + Hypoxemia", description: "Respiratory failure not fully explained by cardiac failure or fluid overload; PaO2/FiO2 ≤300 with PEEP ≥5 cmH2O" }
          ],
          isNovel: false,
          source: "ARDS Definition Task Force, JAMA 2012"
        },
        pf_ratio: {
          name: "P/F Ratio (Oxygenation Index)",
          latex: "P/F = \\frac{PaO_2}{FiO_2}",
          description: "Mild: 201-300; Moderate: 101-200; Severe: ≤100 (all with PEEP ≥5)",
          derivation: [
            { step: 1, title: "Measure PaO2", description: "Arterial blood gas on current FiO2" },
            { step: 2, title: "Record FiO2", description: "Fraction of inspired oxygen (0.21 to 1.0)" },
            { step: 3, title: "Calculate and Classify", description: "P/F = PaO2/FiO2. Mild ARDS: 201-300; Moderate: 101-200; Severe: ≤100" }
          ],
          isNovel: false
        },
        oxygenationIndex: {
          name: "Oxygenation Index (OI)",
          latex: "OI = \\frac{FiO_2 \\times \\bar{P}_{aw} \\times 100}{PaO_2}",
          description: "Incorporates mean airway pressure; OI >25 indicates severe ARDS; used for ECMO consideration",
          derivation: [
            { step: 1, title: "Collect Variables", description: "FiO2 (decimal), mean airway pressure (cmH2O), PaO2 (mmHg)" },
            { step: 2, title: "Calculate OI", description: "OI = (FiO2 × MAP × 100) / PaO2" },
            { step: 3, title: "ECMO Consideration", description: "OI ≥40 for ≥3 hours or OI ≥30 for ≥6 hours → consider VV-ECMO" }
          ],
          isNovel: false
        },
        lungCompliance: {
          name: "Static Lung Compliance",
          latex: "C_{stat} = \\frac{V_T}{P_{plat} - PEEP}",
          description: "Normal 50-100 mL/cmH2O; ARDS <40 mL/cmH2O indicates stiff lungs",
          derivation: [
            { step: 1, title: "Measure Tidal Volume", description: "Set or measured VT during mechanical ventilation" },
            { step: 2, title: "Inspiratory Hold", description: "Perform end-inspiratory pause to measure plateau pressure" },
            { step: 3, title: "Calculate", description: "Cstat = VT / (Pplat - PEEP). Low compliance = poor lung distensibility" }
          ],
          isNovel: false
        },
        drivingPressure: {
          name: "Driving Pressure",
          latex: "\\Delta P = P_{plat} - PEEP = \\frac{V_T}{C_{RS}}",
          description: "Driving pressure >15 cmH2O associated with increased mortality",
          derivation: [
            { step: 1, title: "Measure Pplat", description: "Plateau pressure after inspiratory hold" },
            { step: 2, title: "Calculate ΔP", description: "ΔP = Pplat - PEEP" },
            { step: 3, title: "Lung-Protective Target", description: "Keep ΔP ≤15 cmH2O; lower ΔP independently predicts survival" }
          ],
          isNovel: false,
          source: "Amato et al., NEJM 2015"
        },
        murrayScore: {
          name: "Murray Lung Injury Score",
          latex: "LIS = \\frac{\\text{CXR} + P/F + \\text{PEEP} + C_{stat}}{4}",
          description: "Each component scored 0-4; LIS >2.5 suggests severe ARDS; useful for ECMO referral",
          derivation: [
            { step: 1, title: "CXR Quadrants", description: "0: clear; 1: 1 quadrant; 2: 2 quadrants; 3: 3 quadrants; 4: 4 quadrants" },
            { step: 2, title: "P/F Score", description: "≥300 = 0; 225-299 = 1; 175-224 = 2; 100-174 = 3; <100 = 4" },
            { step: 3, title: "PEEP + Compliance", description: "PEEP and compliance each scored 0-4; calculate mean of all 4 components" }
          ],
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Acute severe dyspnea",
        "Hypoxemia refractory to oxygen",
        "Symptoms of underlying cause (sepsis, aspiration, trauma)",
        "Anxiety, air hunger"
      ],
      signs: [
        "Tachypnea",
        "Tachycardia",
        "Cyanosis",
        "Use of accessory muscles",
        "Diffuse bilateral crackles",
        "Fever (if sepsis)",
        "Altered mental status (severe hypoxemia)"
      ]
    },
    laboratoryFindings: [
      { name: "P/F Ratio", normalRange: ">400", abnormalInDisease: "≤300 on PEEP ≥5" },
      { name: "ABG - PaO2", normalRange: "80-100 mmHg", abnormalInDisease: "Severely reduced despite high FiO2" },
      { name: "Lactate", normalRange: "<2 mmol/L", abnormalInDisease: "Elevated in shock/tissue hypoxia" },
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "May be normal or mildly elevated (vs cardiogenic)" },
      { name: "Procalcitonin", normalRange: "<0.1 ng/mL", abnormalInDisease: "Elevated if sepsis-related ARDS" }
    ],
    imagingFindings: {
      chestXray: ["Bilateral diffuse alveolar infiltrates", "Air bronchograms", "No cardiomegaly (vs CHF)"],
      chestCT: ["Bilateral ground-glass opacities", "Consolidation in dependent regions", "Heterogeneous distribution"]
    },
    severity: {
      mild: { description: "P/F 201-300 mmHg with PEEP ≥5 cmH2O" },
      moderate: { description: "P/F 101-200 mmHg with PEEP ≥5 cmH2O" },
      severe: { description: "P/F ≤100 mmHg with PEEP ≥5 cmH2O" }
    }
  },

  // =====================
  // PULMONARY EMBOLISM (I26)
  // =====================

  I26_9: {
    name: "Pulmonary Embolism without Acute Cor Pulmonale",
    icd10: "I26.9",
    category: "respiratory",
    definition: "Obstruction of pulmonary arteries by thromboemboli, typically from deep venous thrombosis",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart"],
    pathophysiology: {
      mechanism: "Venous thromboembolism occludes pulmonary arteries → V/Q mismatch → hypoxemia; if large → RV strain",
      molecularBasis: "Virchow's triad: stasis, endothelial injury, hypercoagulability; platelet activation, fibrin formation",
      equations: {
        wellsPE: {
          name: "Wells Score for PE",
          latex: "\\text{Wells} = \\sum \\text{Clinical criteria points}",
          description: "Clinical probability: ≤4 = PE unlikely; >4 = PE likely (simplified two-tier)",
          derivation: [
            { step: 1, title: "Clinical Signs", description: "DVT signs +3; Alternative diagnosis less likely +3; HR>100 +1.5" },
            { step: 2, title: "History", description: "Immobilization/surgery ≤4wks +1.5; Previous VTE +1.5" },
            { step: 3, title: "Other Factors", description: "Hemoptysis +1; Malignancy +1. Total ≤4 = unlikely; >4 = likely" }
          ],
          isNovel: false,
          source: "Wells et al., Ann Intern Med 2001"
        },
        genevaScore: {
          name: "Revised Geneva Score",
          latex: "\\text{Geneva} = \\sum \\text{Criteria}",
          description: "0-3 low probability; 4-10 intermediate; ≥11 high probability for PE",
          derivation: [
            { step: 1, title: "Risk Factors", description: "Age >65 +1; Previous VTE +3; Surgery/fracture ≤1 month +2; Active malignancy +2" },
            { step: 2, title: "Symptoms", description: "Unilateral leg pain +3; Hemoptysis +2" },
            { step: 3, title: "Signs", description: "HR 75-94 +3; HR ≥95 +5; Leg tenderness/edema +4" }
          ],
          isNovel: false
        },
        pesi: {
          name: "Pulmonary Embolism Severity Index (PESI)",
          latex: "PESI = \\sum \\text{Risk factors + Clinical parameters}",
          description: "Risk stratification: Class I-II low risk; III intermediate; IV-V high risk",
          derivation: [
            { step: 1, title: "Demographics", description: "Age (years = points); Male +10; Cancer +30; Heart failure +10; Chronic lung disease +10" },
            { step: 2, title: "Vital Signs", description: "HR ≥110 +20; SBP <100 +30; RR ≥30 +20; Temp <36°C +20; SpO2 <90% +20" },
            { step: 3, title: "Mental Status", description: "Altered mental status +60. Classify: I (≤65), II (66-85), III (86-105), IV (106-125), V (>125)" }
          ],
          isNovel: false,
          source: "Aujesky et al., Am J Respir Crit Care Med 2005"
        },
        sPESI: {
          name: "Simplified PESI (sPESI)",
          latex: "sPESI = \\sum_{i=1}^{6} \\text{Criteria}_i",
          description: "Each criterion = 1 point. Score 0 = low risk (1.0% 30-day mortality); ≥1 = high risk (10.9%)",
          derivation: [
            { step: 1, title: "Six Criteria", description: "Age >80; Cancer; Chronic cardiopulmonary disease; HR ≥110; SBP <100; SpO2 <90%" },
            { step: 2, title: "Score Calculation", description: "1 point for each present criterion" },
            { step: 3, title: "Risk Stratification", description: "sPESI 0 = low risk (outpatient eligible); ≥1 = elevated risk" }
          ],
          isNovel: false
        },
        rvLvRatio: {
          name: "RV/LV Diameter Ratio",
          latex: "\\frac{RV_d}{LV_d} > 0.9 \\rightarrow \\text{RV strain}",
          description: "CT or echo measurement; >0.9-1.0 indicates right ventricular strain",
          derivation: [
            { step: 1, title: "Measure RV Diameter", description: "End-diastolic transverse diameter on 4-chamber view" },
            { step: 2, title: "Measure LV Diameter", description: "Same technique for left ventricle" },
            { step: 3, title: "Calculate Ratio", description: "RV/LV >0.9 suggests RV strain; prognostically significant" }
          ],
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Sudden onset dyspnea",
        "Pleuritic chest pain",
        "Cough (may be dry or with hemoptysis)",
        "Syncope (massive PE)",
        "Anxiety",
        "Leg swelling (concurrent DVT)"
      ],
      signs: [
        "Tachypnea (most common sign)",
        "Tachycardia",
        "Hypoxemia",
        "Fever (low grade)",
        "Elevated JVP (RV strain)",
        "Loud P2",
        "Right-sided S3 or S4",
        "Leg signs of DVT"
      ]
    },
    laboratoryFindings: [
      { name: "D-dimer", normalRange: "<500 ng/mL", abnormalInDisease: "Elevated (sensitive but not specific)" },
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "Elevated = RV strain, worse prognosis" },
      { name: "BNP/NT-proBNP", normalRange: "<100/300 pg/mL", abnormalInDisease: "Elevated = RV strain" },
      { name: "ABG", normalRange: "PaO2 80-100", abnormalInDisease: "Hypoxemia, hypocapnia, increased A-a gradient" }
    ],
    imagingFindings: {
      ctpa: ["Filling defect in pulmonary arteries", "Saddle embolus at bifurcation", "RV enlargement"],
      echocardiography: ["RV dilation", "RV hypokinesis", "D-shaped septum", "McConnell sign", "Tricuspid regurgitation"],
      vqScan: ["Segmental perfusion defects with normal ventilation", "High probability pattern"],
      lowerExtremityDoppler: ["DVT in 50% of PE patients"]
    },
    severity: {
      mild: { description: "Low-risk: sPESI 0, no RV strain, normal biomarkers" },
      moderate: { description: "Intermediate-risk: RV strain on imaging OR elevated biomarkers" },
      severe: { description: "High-risk: Hypotension (SBP <90) or shock = massive PE" }
    }
  },

  // =====================
  // LUNG CANCER (C34)
  // =====================

  C34_1: {
    name: "Malignant Neoplasm of Upper Lobe, Bronchus or Lung",
    icd10: "C34.1",
    category: "respiratory",
    definition: "Primary lung cancer arising in the upper lobe bronchus or lung parenchyma",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "lymphNodes", "brain", "bone", "liver", "adrenal"],
    pathophysiology: {
      mechanism: "Malignant transformation of bronchial epithelium; subtypes include adenocarcinoma, squamous cell, small cell, large cell",
      molecularBasis: "Driver mutations: EGFR, KRAS, ALK, ROS1, BRAF, MET, RET, NTRK; PD-L1 expression; TMB",
      equations: {
        tnmStaging: {
          name: "TNM Staging (8th Edition)",
          latex: "\\text{Stage} = f(T, N, M)",
          description: "T: tumor size/invasion; N: nodal involvement; M: metastasis. Determines treatment and prognosis",
          derivation: [
            { step: 1, title: "T Stage", description: "T1: ≤3cm; T2: >3-5cm or involving main bronchus; T3: >5-7cm or chest wall; T4: >7cm or mediastinal invasion" },
            { step: 2, title: "N Stage", description: "N0: no nodes; N1: ipsilateral peribronchial/hilar; N2: ipsilateral mediastinal; N3: contralateral/supraclavicular" },
            { step: 3, title: "M Stage", description: "M0: no metastasis; M1a: malignant effusion/contralateral nodules; M1b: single extrathoracic met; M1c: multiple extrathoracic mets" }
          ],
          isNovel: false,
          source: "AJCC 8th Edition 2017"
        },
        performanceStatus: {
          name: "ECOG Performance Status",
          latex: "ECOG = \\begin{cases} 0 & \\text{Fully active} \\\\ 1 & \\text{Restricted strenuous activity} \\\\ 2 & \\text{Ambulatory, capable of self-care} \\\\ 3 & \\text{Limited self-care} \\\\ 4 & \\text{Completely disabled} \\end{cases}",
          description: "Functional status scale; PS 0-1 suitable for aggressive therapy; PS 3-4 consider supportive care",
          derivation: [
            { step: 1, title: "Assess Activity", description: "Evaluate patient's daily functional capacity" },
            { step: 2, title: "Assign Score", description: "0: normal activity; 1: symptomatic but ambulatory; 2: in bed <50% of day; 3: in bed >50%; 4: bedridden" },
            { step: 3, title: "Treatment Implications", description: "PS 0-1: standard chemotherapy/immunotherapy; PS 2: modified regimens; PS 3-4: supportive care" }
          ],
          isNovel: false
        },
        pdl1Expression: {
          name: "PD-L1 Tumor Proportion Score",
          latex: "TPS = \\frac{\\text{PD-L1}^+ \\text{ tumor cells}}{\\text{Total viable tumor cells}} \\times 100\\%",
          description: "TPS ≥50%: first-line pembrolizumab monotherapy eligible; TPS ≥1%: pembrolizumab + chemo",
          derivation: [
            { step: 1, title: "IHC Staining", description: "Perform PD-L1 IHC on tumor specimen (22C3 or SP263 assay)" },
            { step: 2, title: "Count Cells", description: "Count PD-L1 positive tumor cells and total viable tumor cells" },
            { step: 3, title: "Calculate TPS", description: "TPS = (PD-L1+ cells / total tumor cells) × 100%. ≥50% = high; 1-49% = low positive" }
          ],
          isNovel: false,
          source: "KEYNOTE-024 Trial"
        },
        egfrMutation: {
          name: "EGFR Mutation Testing",
          latex: "\\text{Actionable: } \\text{Exon 19 del, L858R, T790M, Exon 20 ins}",
          description: "EGFR sensitizing mutations predict response to TKIs (erlotinib, gefitinib, osimertinib)",
          derivation: [
            { step: 1, title: "Molecular Testing", description: "NGS or PCR-based testing on tumor tissue or ctDNA" },
            { step: 2, title: "Identify Mutations", description: "Common sensitizing: exon 19 deletions (~45%), L858R (~40%)" },
            { step: 3, title: "Treatment Selection", description: "EGFR+ → TKI therapy; T790M → osimertinib; exon 20 insertions → amivantamab" }
          ],
          isNovel: false
        },
        survivalEstimate: {
          name: "Lung Cancer Survival Model",
          latex: "S(t) = S_0(t)^{\\exp(\\beta_1 \\cdot Stage + \\beta_2 \\cdot PS + \\beta_3 \\cdot Age + ...)}",
          description: "Cox proportional hazards model for survival prediction based on stage, PS, molecular markers",
          derivation: [
            { step: 1, title: "Baseline Survival", description: "Stage-specific baseline survival function" },
            { step: 2, title: "Covariate Adjustment", description: "Adjust for performance status, age, molecular markers, treatment" },
            { step: 3, title: "Personalized Estimate", description: "Calculate individual survival probability at various time points" }
          ],
          isNovel: true
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Cough (new or changing pattern)",
        "Hemoptysis",
        "Dyspnea",
        "Chest pain",
        "Weight loss",
        "Fatigue",
        "Hoarseness (recurrent laryngeal nerve invasion)",
        "Shoulder pain (Pancoast tumor)",
        "Horner syndrome (Pancoast)",
        "SVC syndrome (facial swelling, dyspnea)"
      ],
      signs: [
        "Clubbing",
        "Lymphadenopathy (supraclavicular, cervical)",
        "Pleural effusion",
        "Hepatomegaly (metastases)",
        "Focal neurologic signs (brain mets)",
        "Bone tenderness (bone mets)"
      ]
    },
    laboratoryFindings: [
      { name: "CBC", normalRange: "WBC 4.5-11", abnormalInDisease: "Anemia of chronic disease; leukocytosis if infection" },
      { name: "LFTs", normalRange: "Normal", abnormalInDisease: "Elevated if liver metastases" },
      { name: "Calcium", normalRange: "8.5-10.5 mg/dL", abnormalInDisease: "Hypercalcemia (PTHrP, bone mets)" },
      { name: "Sodium", normalRange: "136-145 mEq/L", abnormalInDisease: "SIADH → hyponatremia (SCLC)" },
      { name: "CEA", normalRange: "<5 ng/mL", abnormalInDisease: "May be elevated, especially adenocarcinoma" },
      { name: "EGFR mutation", normalRange: "Wild type", abnormalInDisease: "Sensitizing mutation in ~15-20% NSCLC" },
      { name: "ALK rearrangement", normalRange: "Negative", abnormalInDisease: "Positive in ~5% NSCLC" },
      { name: "PD-L1 TPS", normalRange: "Variable", abnormalInDisease: "≥50% = high expression" }
    ],
    imagingFindings: {
      chestCT: [
        "Mass or nodule (often spiculated)",
        "Hilar/mediastinal lymphadenopathy",
        "Pleural effusion",
        "Chest wall invasion",
        "Post-obstructive atelectasis"
      ],
      petCt: [
        "FDG-avid primary tumor",
        "Nodal staging",
        "Distant metastases assessment"
      ],
      brainMri: ["Metastases (10-40% at diagnosis)"],
      boneScan: ["Skeletal metastases"]
    },
    severity: {
      mild: { description: "Stage I - Localized tumor ≤4cm, no nodes, no metastases (resectable)" },
      moderate: { description: "Stage II-IIIA - Larger tumor or limited nodal involvement (potentially resectable)" },
      severe: { description: "Stage IIIB-IV - Extensive nodal disease or metastases (unresectable, systemic therapy)" }
    }
  },

  C34_9: {
    name: "Malignant Neoplasm of Bronchus or Lung, Unspecified",
    icd10: "C34.9",
    category: "respiratory",
    definition: "Primary lung cancer, site within lung not specified",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "lymphNodes", "brain", "bone", "liver"],
    pathophysiology: {
      mechanism: "Same as specific site lung cancers - malignant transformation of respiratory epithelium",
      molecularBasis: "Heterogeneous: adenocarcinoma (EGFR, KRAS, ALK), squamous (p53, FGFR1), SCLC (RB1, TP53)",
      equations: {
        ldctScreening: {
          name: "Lung Cancer Screening Eligibility",
          latex: "\\text{Screen if: Age 50-80} + \\geq 20 \\text{ pack-years} + \\text{Currently smoking or quit} < 15 \\text{y}",
          description: "USPSTF criteria for annual low-dose CT screening",
          derivation: [
            { step: 1, title: "Age Criterion", description: "Age 50-80 years (expanded from previous 55-80)" },
            { step: 2, title: "Smoking History", description: "≥20 pack-years (reduced from 30)" },
            { step: 3, title: "Current/Former Status", description: "Currently smokes OR quit within past 15 years" }
          ],
          isNovel: false,
          source: "USPSTF 2021 Guidelines"
        },
        lungRads: {
          name: "Lung-RADS Classification",
          latex: "\\text{Category} = f(\\text{Nodule size}, \\text{Characteristics}, \\text{Change})",
          description: "Standardized reporting for lung cancer screening CT; guides follow-up intervals",
          derivation: [
            { step: 1, title: "Category 1", description: "Negative - no nodules" },
            { step: 2, title: "Category 2-3", description: "Benign or probably benign - annual CT or 6-month follow-up" },
            { step: 3, title: "Category 4", description: "Suspicious - subclassified 4A, 4B, 4X based on size/features; 3-month CT, PET, or biopsy" }
          ],
          isNovel: false,
          source: "ACR Lung-RADS v1.1"
        },
        sclcLimited: {
          name: "Small Cell Lung Cancer Staging",
          latex: "\\text{Stage} = \\begin{cases} \\text{Limited} & \\text{Confined to ipsilateral hemithorax + nodes in single RT field} \\\\ \\text{Extensive} & \\text{Beyond limited stage} \\end{cases}",
          description: "Simplified staging for SCLC; limited stage = chemoradiation; extensive = chemo ± immunotherapy",
          derivation: [
            { step: 1, title: "Limited Stage", description: "Tumor confined to one hemithorax, mediastinum, and ipsilateral supraclavicular nodes" },
            { step: 2, title: "Extensive Stage", description: "Disease beyond limited stage boundaries; contralateral nodes, malignant effusion, distant mets" },
            { step: 3, title: "Treatment Implications", description: "Limited: concurrent chemoRT + PCI; Extensive: chemo + immunotherapy" }
          ],
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Cough",
        "Hemoptysis",
        "Dyspnea",
        "Weight loss",
        "Bone pain (metastases)",
        "Headache/seizures (brain mets)",
        "Paraneoplastic syndromes (SCLC)"
      ],
      signs: [
        "Decreased breath sounds",
        "Clubbing",
        "Cervical lymphadenopathy",
        "Signs of specific paraneoplastic syndromes"
      ]
    },
    laboratoryFindings: [
      { name: "NSE", normalRange: "<16.3 ng/mL", abnormalInDisease: "Elevated in SCLC" },
      { name: "ProGRP", normalRange: "<46 pg/mL", abnormalInDisease: "Elevated in SCLC" }
    ],
    imagingFindings: {
      chestCT: ["Lung mass", "Mediastinal invasion", "Nodal enlargement"],
      petCt: ["Staging evaluation"]
    }
  },

  // =====================
  // PLEURAL DISEASES (J90-J94)
  // =====================

  J90: {
    name: "Pleural Effusion, Not Elsewhere Classified",
    icd10: "J90",
    category: "respiratory",
    definition: "Accumulation of fluid in the pleural space",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Imbalance between pleural fluid production and absorption; transudative (increased hydrostatic or decreased oncotic pressure) vs exudative (increased capillary permeability)",
      molecularBasis: "Inflammatory mediators in exudates; fluid shifts from Starling forces in transudates",
      equations: {
        lightsCriteria: {
          name: "Light's Criteria",
          latex: "\\text{Exudate if ANY: } \\frac{\\text{Pleural protein}}{\\text{Serum protein}} > 0.5 \\text{ OR } \\frac{\\text{Pleural LDH}}{\\text{Serum LDH}} > 0.6 \\text{ OR } \\text{Pleural LDH} > \\frac{2}{3} \\times \\text{ULN}",
          description: "Distinguishes exudative from transudative effusions",
          derivation: [
            { step: 1, title: "Collect Samples", description: "Simultaneous thoracentesis fluid and serum samples" },
            { step: 2, title: "Calculate Ratios", description: "Protein ratio = pleural/serum protein; LDH ratio = pleural/serum LDH" },
            { step: 3, title: "Apply Criteria", description: "If ANY criterion met = exudate; if none = transudate. Sensitivity 98%, specificity 83%" }
          ],
          isNovel: false,
          source: "Light et al., Ann Intern Med 1972"
        },
        serumEffusionAlbumin: {
          name: "Serum-Effusion Albumin Gradient",
          latex: "SEAG = \\text{Serum albumin} - \\text{Pleural albumin}",
          description: "SEAG >1.2 g/dL suggests transudate (useful when Light's misclassifies CHF on diuretics)",
          derivation: [
            { step: 1, title: "Measure Albumin", description: "Serum albumin and pleural fluid albumin simultaneously" },
            { step: 2, title: "Calculate Gradient", description: "SEAG = Serum albumin - Pleural albumin" },
            { step: 3, title: "Interpret", description: ">1.2 g/dL = transudate; ≤1.2 g/dL = exudate" }
          ],
          isNovel: false
        },
        pleuralFluidAnalysis: {
          name: "Pleural Fluid Analysis Panel",
          latex: "\\text{Analyze: pH, glucose, LDH, protein, cell count, cytology, cultures}",
          description: "Comprehensive analysis guides diagnosis; pH <7.2 suggests complicated parapneumonic/empyema",
          derivation: [
            { step: 1, title: "Chemistry", description: "pH <7.2, glucose <60, LDH >1000 = complicated effusion" },
            { step: 2, title: "Cell Count", description: "Neutrophils suggest acute infection; lymphocytes suggest TB/malignancy" },
            { step: 3, title: "Special Tests", description: "Cytology for malignancy; ADA >40 suggests TB; cultures/gram stain" }
          ],
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Dyspnea (proportional to effusion size)",
        "Pleuritic chest pain (inflammatory causes)",
        "Cough",
        "Symptoms of underlying cause"
      ],
      signs: [
        "Decreased breath sounds",
        "Dullness to percussion",
        "Decreased tactile fremitus",
        "Egophony at superior border",
        "Mediastinal shift (massive effusion)"
      ]
    },
    laboratoryFindings: [
      { name: "Pleural protein", normalRange: "<3 g/dL", abnormalInDisease: ">3 g/dL in exudate" },
      { name: "Pleural LDH", normalRange: "<200 U/L", abnormalInDisease: "Elevated in exudate" },
      { name: "Pleural pH", normalRange: "7.60", abnormalInDisease: "<7.2 suggests complicated effusion" },
      { name: "Pleural glucose", normalRange: "Similar to serum", abnormalInDisease: "<60 mg/dL in complicated effusion, TB, RA, malignancy" }
    ],
    imagingFindings: {
      chestXray: ["Blunting of costophrenic angle", "Meniscus sign", "Opacification with large effusion"],
      ultrasound: ["Anechoic or complex fluid", "Septations suggest exudate/empyema", "Guides thoracentesis"],
      chestCT: ["Characterize effusion", "Identify underlying cause", "Evaluate for loculation"]
    }
  }
};

export default RESPIRATORY_DISEASES_PART2;
