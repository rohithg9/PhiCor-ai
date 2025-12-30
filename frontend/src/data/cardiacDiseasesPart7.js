// ============================================================
// CARDIAC DISEASES DATABASE - PART 7: Common Diseases
// Additional common cardiovascular conditions frequently encountered
// ============================================================

export const CARDIAC_DISEASES_PART7 = {
  // =====================
  // ISCHEMIC HEART DISEASE - ANGINA VARIANTS
  // =====================
  
  I20_0: {
    name: "Unstable Angina",
    icd10: "I20.0",
    category: "ischemic",
    definition: "Acute coronary syndrome without biomarker elevation, characterized by new-onset, crescendo, or rest angina",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Coronary plaque rupture or erosion → platelet aggregation → partial or intermittent occlusion → supply-demand mismatch",
      molecularBasis: "Inflammatory activation of vulnerable plaque, matrix metalloproteinase release, tissue factor exposure",
      equations: {
        timiRisk: {
          name: "TIMI Risk Score for UA/NSTEMI",
          latex: "\\text{TIMI} = \\sum_{i=1}^{7} \\text{Factor}_i",
          description: "Age ≥65 (+1), ≥3 CAD risk factors (+1), Known CAD ≥50% (+1), ASA use in past 7 days (+1), ≥2 anginal episodes in 24h (+1), ST changes ≥0.5mm (+1), Elevated cardiac markers (+1). Score 0-7.",
          derivation: [
            { step: 1, title: "Risk Factor Identification", description: "Each of 7 clinical factors contributes 1 point based on validated cohort studies" },
            { step: 2, title: "Score Calculation", description: "Sum all present factors: Age≥65, ≥3 RF, known CAD, recent ASA, ≥2 episodes/24h, ST changes, + markers" },
            { step: 3, title: "Risk Stratification", description: "0-2 points = low risk (4.7% events); 3-4 = intermediate (13.2%); 5-7 = high (40.9%)" }
          ],
          isNovel: false,
          source: "Antman et al., JAMA 2000"
        },
        graceScore: {
          name: "GRACE Risk Score",
          latex: "\\text{GRACE} = f(\\text{Age}, \\text{HR}, \\text{SBP}, \\text{Cr}, \\text{Killip}, \\text{Arrest}, \\text{ST}, \\text{Troponin})",
          description: "Global Registry of Acute Coronary Events score for in-hospital and 6-month mortality",
          derivation: [
            { step: 1, title: "Variable Collection", description: "Gather: Age, Heart rate, Systolic BP, Creatinine, Killip class, Cardiac arrest at admission, ST-segment deviation, Elevated cardiac enzymes" },
            { step: 2, title: "Weighted Scoring", description: "Each variable contributes weighted points based on Cox regression coefficients from the GRACE registry" },
            { step: 3, title: "Mortality Estimation", description: "Total score maps to predicted in-hospital death: <108 = low (<1%), 109-140 = intermediate (1-3%), >140 = high (>3%)" }
          ],
          isNovel: false,
          source: "GRACE Investigators, JAMA 2004"
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Chest pain or pressure at rest",
        "New-onset exertional angina (Class III-IV)",
        "Crescendo pattern of previously stable angina",
        "Dyspnea",
        "Diaphoresis",
        "Nausea",
        "Jaw or arm pain"
      ],
      signs: [
        "May appear distressed",
        "Diaphoretic",
        "Tachycardia or bradycardia",
        "Hypotension or hypertension",
        "S4 gallop",
        "New mitral regurgitation murmur (papillary muscle ischemia)"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin I/T", normalRange: "<0.04 ng/mL", abnormalInDisease: "Normal or mildly elevated (if elevated → NSTEMI)" },
      { name: "CK-MB", normalRange: "<5 ng/mL", abnormalInDisease: "Normal or slightly elevated" },
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "May be elevated with LV dysfunction" },
      { name: "D-dimer", normalRange: "<500 ng/mL", abnormalInDisease: "Normal (helps exclude PE)" }
    ],
    imagingFindings: {
      ecg: ["ST-segment depression", "T-wave inversion", "Dynamic changes with pain", "May be normal"],
      echocardiography: ["Regional wall motion abnormalities during ischemia", "May be normal at rest"],
      coronaryAngiography: ["Culprit lesion identification", "Plaque rupture/erosion", "Thrombus"]
    },
    severity: {
      mild: { description: "Braunwald Class I - New onset, severe or accelerated" },
      moderate: { description: "Braunwald Class II - Subacute (>48h, <1 month)" },
      severe: { description: "Braunwald Class III - Acute (<48h)" }
    }
  },

  I20_1: {
    name: "Angina Pectoris with Documented Spasm (Prinzmetal)",
    icd10: "I20.1",
    category: "ischemic",
    definition: "Variant angina caused by coronary artery spasm, typically occurring at rest, often in early morning",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Focal coronary artery smooth muscle hyperreactivity → transient severe vasoconstriction → transmural ischemia",
      molecularBasis: "Endothelial dysfunction, reduced NO bioavailability, increased endothelin-1, Rho-kinase activation",
      equations: {
        spasmIndex: {
          name: "Coronary Spasm Severity Index",
          latex: "\\text{CSI} = \\frac{\\Delta D_{max}}{D_{baseline}} \\times \\text{Duration} \\times \\text{Territory}",
          description: "Novel index incorporating degree of vasoconstriction, duration, and affected territory",
          derivation: [
            { step: 1, title: "Diameter Measurement", description: "Measure baseline coronary diameter and maximum constriction during provocative testing" },
            { step: 2, title: "Quantify Spasm", description: "Calculate percent diameter reduction: (D_baseline - D_spasm) / D_baseline × 100" },
            { step: 3, title: "Clinical Correlation", description: "Weight by duration of spasm and size of affected myocardial territory" }
          ],
          isNovel: true
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Chest pain at rest (often 12 AM - 8 AM)",
        "Pain lasting 5-30 minutes",
        "Relief with nitrates",
        "May be triggered by hyperventilation, cold, smoking, cocaine",
        "Episodes often cyclic"
      ],
      signs: [
        "Usually normal between episodes",
        "During attack: diaphoresis, pallor",
        "Arrhythmias during spasm (VT/VF in severe cases)"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "Usually normal unless prolonged spasm" },
      { name: "Lipid panel", normalRange: "LDL <100 mg/dL", abnormalInDisease: "Often normal or mildly abnormal" }
    ],
    imagingFindings: {
      ecg: ["Transient ST-elevation during pain", "Normalizes with resolution", "May see reciprocal depression"],
      coronaryAngiography: ["Often normal or minimal disease", "Provocative testing (acetylcholine/ergonovine) induces focal spasm >70%"]
    }
  },

  I20_8: {
    name: "Stable Angina Pectoris",
    icd10: "I20.8",
    category: "ischemic",
    definition: "Chronic stable angina - predictable chest discomfort with exertion, relieved by rest or nitrates, unchanged in pattern for ≥2 months",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Fixed coronary stenosis → inadequate blood supply during increased demand → reversible myocardial ischemia",
      molecularBasis: "Atherosclerotic plaque with stable fibrous cap, supply-demand mismatch without plaque rupture",
      equations: {
        ccsClass: {
          name: "CCS Angina Classification",
          latex: "\\text{Class} = \\begin{cases} I & \\text{Strenuous activity} \\\\ II & \\text{Slight limitation} \\\\ III & \\text{Marked limitation} \\\\ IV & \\text{Any activity/rest} \\end{cases}",
          description: "Canadian Cardiovascular Society functional classification",
          derivation: [
            { step: 1, title: "Activity Assessment", description: "Evaluate what level of physical activity provokes angina symptoms" },
            { step: 2, title: "Classification", description: "Class I: Only strenuous exertion; Class II: Walking >2 blocks or >1 flight stairs; Class III: Walking <2 blocks or <1 flight; Class IV: Any activity or rest" },
            { step: 3, title: "Clinical Application", description: "Higher class indicates more severe functional limitation and worse prognosis" }
          ],
          isNovel: false,
          source: "Campeau L, Circulation 1976"
        },
        dukeScore: {
          name: "Duke Treadmill Score",
          latex: "DTS = \\text{Exercise time} - (5 \\times \\text{ST deviation}) - (4 \\times \\text{Angina index})",
          description: "Prognostic score from exercise testing: ≥5 low risk, -10 to 4 moderate, <-10 high risk",
          derivation: [
            { step: 1, title: "Exercise Time", description: "Record total exercise time in minutes using Bruce protocol" },
            { step: 2, title: "ST Deviation", description: "Maximum ST-segment depression in mm (subtract 5× this value)" },
            { step: 3, title: "Angina Index", description: "0 = no angina, 1 = non-limiting angina, 2 = exercise-limiting angina (subtract 4× this value)" }
          ],
          isNovel: false,
          source: "Mark et al., NEJM 1991"
        },
        stenosis: {
          name: "Fractional Flow Reserve",
          latex: "FFR = \\frac{P_d}{P_a}",
          description: "Ratio of distal to proximal coronary pressure at maximal hyperemia. FFR ≤0.80 indicates hemodynamically significant stenosis",
          derivation: [
            { step: 1, title: "Hyperemia Induction", description: "Administer adenosine to achieve maximal coronary vasodilation (eliminates microvascular resistance)" },
            { step: 2, title: "Pressure Measurement", description: "Measure pressure distal to stenosis (Pd) and proximal aortic pressure (Pa) simultaneously" },
            { step: 3, title: "Ratio Calculation", description: "FFR = Pd/Pa represents fraction of normal maximal flow; FFR ≤0.80 → revascularization benefit" }
          ],
          isNovel: false,
          source: "FAME Trial, NEJM 2009"
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Substernal chest pressure/heaviness with exertion",
        "Predictable threshold for symptoms",
        "Duration 2-10 minutes",
        "Relief with rest within 5 minutes",
        "Relief with sublingual nitroglycerin",
        "Radiation to arm, jaw, neck, back",
        "Associated dyspnea, diaphoresis"
      ],
      signs: [
        "Often normal at rest",
        "S4 gallop during ischemia",
        "Transient mitral regurgitation during ischemia",
        "Signs of risk factors: xanthelasma, arcus senilis"
      ]
    },
    laboratoryFindings: [
      { name: "Lipid panel", normalRange: "LDL <100 mg/dL", abnormalInDisease: "Often elevated LDL, low HDL" },
      { name: "HbA1c", normalRange: "<5.7%", abnormalInDisease: "May be elevated (diabetes is RF)" },
      { name: "hsCRP", normalRange: "<1 mg/L", abnormalInDisease: "May be elevated (inflammation marker)" },
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "Normal (by definition)" }
    ],
    imagingFindings: {
      ecg: ["May be normal at rest", "ST depression with exertion", "T-wave inversion"],
      stressTest: ["Positive: ≥1mm ST depression", "Duke treadmill score stratification", "Stress echo: induced wall motion abnormality"],
      coronaryAngiography: ["Stenosis ≥70% in major epicardial vessel", "Or ≥50% in left main"],
      coronaryCT: ["Calcium scoring", "CTA for anatomic stenosis assessment"]
    },
    severity: {
      mild: { description: "CCS Class I - Angina only with strenuous activity" },
      moderate: { description: "CCS Class II-III - Angina with moderate to minimal exertion" },
      severe: { description: "CCS Class IV - Angina at rest or minimal activity" }
    }
  },

  I20_9: {
    name: "Angina Pectoris, Unspecified",
    icd10: "I20.9",
    category: "ischemic",
    definition: "Angina pectoris without further specification - use when specific type is not documented",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Myocardial oxygen supply-demand mismatch causing reversible ischemia",
      equations: {
        mvo2: {
          name: "Myocardial Oxygen Demand Determinants",
          latex: "MVO_2 \\propto \\text{HR} \\times \\text{SBP} \\times \\text{Contractility} \\times \\text{Wall Tension}",
          description: "Heart rate × systolic blood pressure (rate-pressure product) approximates oxygen demand",
          derivation: [
            { step: 1, title: "Rate-Pressure Product", description: "RPP = HR × SBP is a simple clinical surrogate for MVO2" },
            { step: 2, title: "Wall Tension", description: "From Laplace: σ = (P × r)/(2h) - larger chambers at higher pressure require more oxygen" },
            { step: 3, title: "Clinical Threshold", description: "Angina typically occurs at reproducible RPP threshold in stable CAD" }
          ],
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Chest discomfort (pressure, tightness, squeezing)",
        "May radiate to arm, jaw, neck, back, epigastrium",
        "Associated dyspnea",
        "Diaphoresis",
        "Nausea"
      ],
      signs: [
        "May be unremarkable",
        "Tachycardia during pain",
        "Hypertension during pain",
        "S4 gallop"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "Should be normal in uncomplicated angina" },
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "May be elevated if LV dysfunction present" }
    ],
    imagingFindings: {
      ecg: ["May be normal", "ST-T changes during pain", "Q waves if prior MI"],
      stressTest: ["Exercise or pharmacologic stress testing to assess for ischemia"]
    }
  },

  // =====================
  // ADDITIONAL ACUTE CORONARY SYNDROMES
  // =====================

  I21_0: {
    name: "ST-Elevation Myocardial Infarction (STEMI) - Anterior",
    icd10: "I21.0",
    category: "ischemic",
    definition: "Acute transmural myocardial infarction of the anterior wall with ST-elevation on ECG",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Complete occlusion of LAD coronary artery → transmural anterior wall infarction → LV dysfunction",
      molecularBasis: "Plaque rupture → platelet aggregation → thrombus formation → complete occlusion → cardiomyocyte death",
      equations: {
        doorToBalloon: {
          name: "Door-to-Balloon Time Target",
          latex: "D2B \\leq 90 \\text{ minutes}",
          description: "Time from hospital arrival to PCI balloon inflation - shorter times = better outcomes",
          derivation: [
            { step: 1, title: "Time = Muscle", description: "Myocardial salvage decreases exponentially with occlusion time" },
            { step: 2, title: "Quality Metric", description: "90 minutes is the benchmark; every 10-minute delay increases mortality by 1.5%" },
            { step: 3, title: "Clinical Goal", description: "Ideal D2B <60 minutes; first medical contact to wire crossing <120 minutes" }
          ],
          isNovel: false,
          source: "ACC/AHA STEMI Guidelines"
        },
        infarctSize: {
          name: "Peak Troponin Infarct Size Estimation",
          latex: "\\text{Infarct Size (g)} \\approx \\frac{\\text{Peak TnI} \\times 1.3}{0.026}",
          description: "Estimated infarct mass from peak troponin level",
          derivation: [
            { step: 1, title: "Biomarker Release", description: "Troponin release is proportional to myocyte necrosis" },
            { step: 2, title: "Kinetic Modeling", description: "Account for release kinetics and clearance to estimate total released" },
            { step: 3, title: "Mass Calculation", description: "Convert to grams of infarcted tissue using validation studies" }
          ],
          isNovel: true
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Severe, prolonged chest pain (>20 minutes)",
        "Unrelieved by rest or nitroglycerin",
        "Diaphoresis",
        "Dyspnea",
        "Nausea/vomiting",
        "Sense of impending doom"
      ],
      signs: [
        "Distressed appearance",
        "Diaphoresis",
        "Tachycardia or bradycardia",
        "Hypotension (cardiogenic shock)",
        "S4, S3 if heart failure",
        "New mitral regurgitation murmur",
        "Elevated JVP if RV involvement"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin I/T", normalRange: "<0.04 ng/mL", abnormalInDisease: "Markedly elevated (>10× URL)" },
      { name: "CK-MB", normalRange: "<5 ng/mL", abnormalInDisease: "Elevated, peaks at 24h" },
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated proportional to LV dysfunction" },
      { name: "Glucose", normalRange: "70-100 mg/dL", abnormalInDisease: "Stress hyperglycemia common" }
    ],
    imagingFindings: {
      ecg: ["ST-elevation ≥2mm in V1-V4", "Reciprocal ST-depression in inferior leads", "Q wave development over hours-days", "Loss of R wave progression"],
      echocardiography: ["Anterior/septal wall motion abnormality", "Reduced LVEF", "May see thrombus, aneurysm, MR"],
      coronaryAngiography: ["LAD occlusion (usually proximal)", "TIMI flow grade 0-1"]
    },
    severity: {
      mild: { description: "Killip Class I - No heart failure signs" },
      moderate: { description: "Killip Class II-III - Rales, S3, pulmonary edema" },
      severe: { description: "Killip Class IV - Cardiogenic shock" }
    }
  },

  I21_1: {
    name: "ST-Elevation Myocardial Infarction (STEMI) - Inferior",
    icd10: "I21.1",
    category: "ischemic",
    definition: "Acute transmural myocardial infarction of the inferior wall, typically from RCA occlusion",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "RCA or LCx occlusion → inferior and/or posterior wall infarction → potential RV involvement",
      equations: {
        rvmiCriteria: {
          name: "Right Ventricular MI Criteria",
          latex: "\\text{RVMI} = \\text{ST} \\uparrow \\text{ in V4R} \\geq 1\\text{mm}",
          description: "ST-elevation in right-sided V4R with inferior STEMI indicates RV involvement",
          derivation: [
            { step: 1, title: "Right-Sided Leads", description: "Place V4R at 5th intercostal space, right mid-clavicular line" },
            { step: 2, title: "ST-Elevation Criteria", description: "≥1mm ST-elevation in V4R has 88% sensitivity for RV involvement" },
            { step: 3, title: "Clinical Significance", description: "RVMI requires volume loading (avoid nitrates/diuretics), has higher mortality" }
          ],
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Chest pain (may be atypical - epigastric)",
        "Nausea/vomiting (more common than anterior MI)",
        "Diaphoresis",
        "Dyspnea (especially if RV involved)"
      ],
      signs: [
        "Bradycardia (vagal response common)",
        "Hypotension",
        "Clear lungs despite hypotension (RV involvement)",
        "Elevated JVP (RV involvement)",
        "Kussmaul sign"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin I/T", normalRange: "<0.04 ng/mL", abnormalInDisease: "Elevated" },
      { name: "CK-MB", normalRange: "<5 ng/mL", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      ecg: ["ST-elevation in II, III, aVF", "ST-elevation III > II suggests RCA", "Reciprocal ST-depression in I, aVL, V1-V3", "V4R elevation if RV involved"],
      echocardiography: ["Inferior wall motion abnormality", "RV dilation/dysfunction if involved"]
    }
  },

  I21_4: {
    name: "Non-ST-Elevation Myocardial Infarction (NSTEMI)",
    icd10: "I21.4",
    category: "ischemic",
    definition: "Acute myocardial infarction with elevated troponin but without persistent ST-elevation",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Non-occlusive thrombus or microembolization → subendocardial infarction → biomarker elevation",
      equations: {
        heartScore: {
          name: "HEART Score for Chest Pain",
          latex: "\\text{HEART} = H + E + A + R + T",
          description: "History, ECG, Age, Risk factors, Troponin - each 0-2 points. Score 0-3: low risk, 4-6: intermediate, 7-10: high",
          derivation: [
            { step: 1, title: "History (H)", description: "0: slightly suspicious, 1: moderately suspicious, 2: highly suspicious" },
            { step: 2, title: "ECG (E)", description: "0: normal, 1: non-specific changes, 2: significant ST depression" },
            { step: 3, title: "Age + Risk factors + Troponin", description: "Each scored 0-2 based on age thresholds, RF count, and troponin level" }
          ],
          isNovel: false,
          source: "Six et al., Netherlands Heart Journal 2008"
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Chest pain (may be prolonged or crescendo pattern)",
        "Dyspnea",
        "Diaphoresis",
        "Atypical presentations more common in elderly, diabetics, women"
      ],
      signs: [
        "May appear well or distressed",
        "Tachycardia",
        "Signs of heart failure if significant"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin I/T", normalRange: "<0.04 ng/mL", abnormalInDisease: "Elevated >99th percentile with rise/fall pattern" },
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated predicts worse outcomes" }
    ],
    imagingFindings: {
      ecg: ["ST-depression", "T-wave inversion", "Dynamic changes", "May be normal"],
      echocardiography: ["May show wall motion abnormality", "Assess LV function"]
    }
  },

  // =====================
  // ADDITIONAL ARRHYTHMIAS
  // =====================

  I47_1: {
    name: "Supraventricular Tachycardia (SVT)",
    icd10: "I47.1",
    category: "arrhythmia",
    definition: "Rapid heart rhythm originating above the ventricles, typically 150-250 bpm with narrow QRS",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Reentry circuit or enhanced automaticity involving atrial or AV nodal tissue",
      equations: {
        rpInterval: {
          name: "RP Interval Classification",
          latex: "\\text{SVT Type} = f(\\text{RP interval}, \\text{P wave morphology})",
          description: "Short RP (<70ms): AVNRT typical; Long RP: AVNRT atypical, AVRT, AT",
          derivation: [
            { step: 1, title: "Measure RP Interval", description: "Time from QRS onset to next P wave" },
            { step: 2, title: "Classify", description: "Short RP (RP<PR): typical AVNRT, orthodromic AVRT. Long RP (RP>PR): atypical AVNRT, PJRT, AT" },
            { step: 3, title: "P Wave Analysis", description: "Negative P in inferior leads suggests AVNRT/AVRT; positive suggests AT" }
          ],
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Sudden onset palpitations",
        "Rapid regular heartbeat",
        "Lightheadedness",
        "Chest discomfort",
        "Dyspnea",
        "Polyuria after episode (ANP release)"
      ],
      signs: [
        "Regular tachycardia 150-250 bpm",
        "Hypotension if hemodynamically unstable",
        "Cannon A waves in JVP (AV dissociation)"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "Usually normal unless prolonged tachycardia" },
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Check to exclude hyperthyroidism" },
      { name: "Electrolytes", normalRange: "K 3.5-5.0 mEq/L", abnormalInDisease: "Exclude hypokalemia/hypomagnesemia" }
    ],
    imagingFindings: {
      ecg: ["Narrow QRS tachycardia", "Regular R-R intervals", "P waves may be hidden in QRS/T", "Pseudo R' in V1 or pseudo S in inferior leads (AVNRT)"]
    }
  },

  I47_2: {
    name: "Ventricular Tachycardia (VT)",
    icd10: "I47.2",
    category: "arrhythmia",
    definition: "Rapid heart rhythm originating from the ventricles, typically with wide QRS complexes",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Reentry, triggered activity, or enhanced automaticity in ventricular myocardium",
      equations: {
        brugadaCriteria: {
          name: "Brugada Criteria for VT vs SVT with Aberrancy",
          latex: "\\text{VT if any}: RS > 100\\text{ms}, \\text{AV dissociation}, \\text{Morphology criteria}",
          description: "Stepwise algorithm: absence of RS in precordial leads, RS interval >100ms, AV dissociation, or morphology criteria",
          derivation: [
            { step: 1, title: "RS Complex Check", description: "If NO RS complex in any precordial lead → VT (sensitivity 21%)" },
            { step: 2, title: "RS Interval", description: "If RS interval >100ms in any precordial lead → VT (sensitivity 66%)" },
            { step: 3, title: "AV Dissociation", description: "If AV dissociation present → VT (specificity 100%)" },
            { step: 4, title: "Morphology", description: "Apply RBBB or LBBB morphology criteria for VT" }
          ],
          isNovel: false,
          source: "Brugada et al., Circulation 1991"
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Palpitations",
        "Syncope or near-syncope",
        "Chest pain",
        "Dyspnea",
        "Cardiac arrest (sustained VT)"
      ],
      signs: [
        "Wide complex tachycardia on monitor",
        "Hypotension",
        "Cannon A waves",
        "Variable S1 intensity",
        "Signs of underlying heart disease"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "May be elevated if underlying ischemia" },
      { name: "Potassium", normalRange: "3.5-5.0 mEq/L", abnormalInDisease: "Exclude hypokalemia" },
      { name: "Magnesium", normalRange: "1.5-2.5 mEq/L", abnormalInDisease: "Exclude hypomagnesemia" }
    ],
    imagingFindings: {
      ecg: ["Wide QRS (>120ms)", "Rate typically 150-250 bpm", "AV dissociation", "Capture/fusion beats", "Concordance in precordial leads"],
      echocardiography: ["Assess underlying structural heart disease", "LV function"]
    },
    severity: {
      mild: { description: "Non-sustained VT (<30 seconds)" },
      moderate: { description: "Sustained monomorphic VT, hemodynamically stable" },
      severe: { description: "Sustained VT with hemodynamic instability or polymorphic VT" }
    }
  },

  I49_5: {
    name: "Sick Sinus Syndrome",
    icd10: "I49.5",
    category: "arrhythmia",
    definition: "Dysfunction of the sinoatrial node causing inappropriate bradycardia, pauses, or tachy-brady syndrome",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "brain"],
    pathophysiology: {
      mechanism: "Degenerative fibrosis of SA node and atrial tissue → impaired impulse generation and conduction",
      equations: {
        pauseThreshold: {
          name: "Symptomatic Pause Threshold",
          latex: "\\text{Pause} > 3\\text{s during wake hours} \\rightarrow \\text{Pacing indication}",
          description: "Sinus pauses >3 seconds while awake with symptoms warrant pacing",
          derivation: [
            { step: 1, title: "Holter Monitoring", description: "24-48 hour ECG monitoring to detect pauses and correlate with symptoms" },
            { step: 2, title: "Symptom Correlation", description: "Document relationship between bradycardia/pauses and symptoms" },
            { step: 3, title: "Pacing Indication", description: "Pauses >3s awake or >5s asleep with symptoms = Class I pacing indication" }
          ],
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Syncope or presyncope",
        "Fatigue",
        "Dizziness",
        "Exercise intolerance",
        "Palpitations (tachy-brady syndrome)",
        "Cognitive impairment"
      ],
      signs: [
        "Bradycardia",
        "Irregular pulse",
        "Signs of low cardiac output"
      ]
    },
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Exclude hypothyroidism" },
      { name: "Electrolytes", normalRange: "K 3.5-5.0 mEq/L", abnormalInDisease: "Exclude electrolyte abnormalities" }
    ],
    imagingFindings: {
      ecg: ["Sinus bradycardia <40 bpm", "Sinus pauses >3 seconds", "SA exit block", "Tachy-brady: AF alternating with bradycardia"],
      holter: ["Document pauses and correlation with symptoms"]
    }
  }
};

export default CARDIAC_DISEASES_PART7;
