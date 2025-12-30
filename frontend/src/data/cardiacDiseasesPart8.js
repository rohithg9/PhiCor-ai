// ============================================================
// CARDIAC DISEASES DATABASE - PART 8: Extended Coverage
// Additional ICD-10 codes for comprehensive cardiac disease coverage
// Focus: Heart Failure variants, Arrhythmias, Cardiomyopathies
// ============================================================

export const CARDIAC_DISEASES_PART8 = {
  // =====================
  // HEART FAILURE - ADDITIONAL VARIANTS
  // ICD-10: I50 Series
  // =====================
  
  I50_1: {
    name: "Left Ventricular Failure (Acute Pulmonary Edema)",
    icd10: "I50.1",
    category: "heartFailure",
    definition: "Acute decompensation of left ventricular function leading to pulmonary congestion and edema",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "lungs", "kidneys"],
    pathophysiology: {
      mechanism: "Acute LV dysfunction → elevated LVEDP → increased LA pressure → pulmonary venous congestion → alveolar flooding",
      molecularBasis: "BNP/NT-proBNP release from myocyte stretch, neurohormonal activation (RAAS, SNS), endothelial dysfunction"
    },
    clinicalPresentation: {
      symptoms: [
        "Severe dyspnea at rest",
        "Orthopnea",
        "Paroxysmal nocturnal dyspnea",
        "Pink frothy sputum",
        "Profound anxiety ('air hunger')",
        "Diaphoresis",
        "Cough"
      ],
      signs: [
        "Tachypnea (>30/min)",
        "Tachycardia",
        "Hypoxia (SpO2 <90%)",
        "Bilateral crackles/rales",
        "S3 gallop",
        "Elevated JVP",
        "Peripheral cyanosis"
      ]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: ">400 pg/mL (often >1000)" },
      { name: "NT-proBNP", normalRange: "<300 pg/mL", abnormalInDisease: ">900 pg/mL (often >5000)" },
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "May be elevated (demand ischemia)" },
      { name: "Lactate", normalRange: "<2 mmol/L", abnormalInDisease: "Elevated in cardiogenic shock" },
      { name: "Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "May be elevated (cardiorenal)" }
    ],
    imagingFindings: {
      chestXray: ["Pulmonary edema (bat-wing pattern)", "Kerley B lines", "Cardiomegaly", "Pleural effusions"],
      echocardiography: ["Reduced LVEF", "Elevated E/e'", "Dilated LV", "Mitral regurgitation"],
      lungUltrasound: ["B-lines (≥3 per field)", "Pleural effusion"]
    },
    severity: {
      mild: { description: "Mild pulmonary congestion, SpO2 >90% on room air" },
      moderate: { description: "Moderate edema, requires supplemental O2" },
      severe: { description: "Severe edema, respiratory failure, may require NIV/intubation" }
    }
  },

  I50_4: {
    name: "Combined Systolic and Diastolic Heart Failure",
    icd10: "I50.4",
    category: "heartFailure",
    definition: "Heart failure with both impaired systolic contraction and diastolic relaxation",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "lungs", "kidneys", "liver"],
    pathophysiology: {
      mechanism: "Combined systolic dysfunction (reduced contractility) and diastolic dysfunction (impaired relaxation/filling)",
      molecularBasis: "Myocardial fibrosis, altered calcium handling, neurohormonal activation, adverse remodeling"
    },
    clinicalPresentation: {
      symptoms: [
        "Dyspnea on exertion progressing to rest",
        "Orthopnea",
        "Paroxysmal nocturnal dyspnea",
        "Fatigue",
        "Lower extremity edema",
        "Abdominal distension",
        "Exercise intolerance"
      ],
      signs: [
        "Elevated JVP",
        "S3 and S4 gallops",
        "Displaced PMI",
        "Hepatomegaly",
        "Ascites",
        "Peripheral edema",
        "Cool extremities"
      ]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Significantly elevated" },
      { name: "Sodium", normalRange: "136-145 mEq/L", abnormalInDisease: "May be low (dilutional hyponatremia)" },
      { name: "eGFR", normalRange: ">60 mL/min", abnormalInDisease: "Often reduced (cardiorenal syndrome)" }
    ],
    imagingFindings: {
      echocardiography: ["Reduced EF (<40%)", "Elevated E/e' (>14)", "LA enlargement", "LV dilation"],
      cardiacMRI: ["Diffuse fibrosis", "Edema", "Reduced strain"]
    },
    severity: {
      mild: { description: "EF 30-40%, NYHA II" },
      moderate: { description: "EF 20-30%, NYHA III" },
      severe: { description: "EF <20%, NYHA IV, requires advanced therapies" }
    }
  },

  I50_9: {
    name: "Heart Failure, Unspecified",
    icd10: "I50.9",
    category: "heartFailure",
    definition: "Cardiac dysfunction leading to inadequate tissue perfusion, type not further specified",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "lungs", "kidneys"],
    pathophysiology: {
      mechanism: "Inability of the heart to maintain adequate cardiac output to meet metabolic demands",
      molecularBasis: "Variable depending on underlying etiology"
    },
    clinicalPresentation: {
      symptoms: [
        "Dyspnea",
        "Fatigue",
        "Fluid retention",
        "Exercise intolerance",
        "Orthopnea"
      ],
      signs: [
        "Elevated JVP",
        "Pulmonary congestion",
        "Peripheral edema",
        "Cardiomegaly"
      ]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated" },
      { name: "CBC", normalRange: "Normal", abnormalInDisease: "Anemia may be present" }
    ],
    imagingFindings: {
      chestXray: ["Cardiomegaly", "Pulmonary congestion"],
      echocardiography: ["Variable findings depending on type"]
    },
    severity: {
      mild: { description: "NYHA I-II" },
      moderate: { description: "NYHA III" },
      severe: { description: "NYHA IV" }
    }
  },

  // =====================
  // ARRHYTHMIAS - ADDITIONAL CODES
  // ICD-10: I44-I49 Series
  // =====================

  I44_0: {
    name: "Atrioventricular Block, First Degree",
    icd10: "I44.0",
    category: "arrhythmia",
    definition: "Prolonged conduction through AV node with PR interval >200ms, all impulses conducted",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Delayed conduction through AV node without blocked impulses",
      molecularBasis: "Fibrosis, ischemia, or drug effect on AV nodal tissue"
    },
    clinicalPresentation: {
      symptoms: [
        "Usually asymptomatic",
        "Rarely fatigue or exercise intolerance"
      ],
      signs: [
        "Soft S1 (due to prolonged PR)",
        "Otherwise normal examination"
      ]
    },
    laboratoryFindings: [
      { name: "Electrolytes", normalRange: "Normal", abnormalInDisease: "Check K+, Mg2+" },
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Rule out thyroid disease" }
    ],
    imagingFindings: {
      ecg: ["PR interval >200ms", "All P waves followed by QRS", "1:1 AV conduction"],
      echocardiography: ["Usually normal", "Rule out structural heart disease"]
    },
    severity: {
      mild: { description: "PR 200-300ms, asymptomatic" },
      moderate: { description: "PR >300ms" },
      severe: { description: "Progression to higher degree block" }
    }
  },

  I44_1: {
    name: "Atrioventricular Block, Second Degree",
    icd10: "I44.1",
    category: "arrhythmia",
    definition: "Intermittent failure of AV conduction with some P waves not followed by QRS complexes",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Intermittent conduction failure at AV node (Mobitz I) or His-Purkinje (Mobitz II)",
      molecularBasis: "Progressive AV nodal fatigue (Type I) or fixed infranodal conduction disease (Type II)"
    },
    clinicalPresentation: {
      symptoms: [
        "Palpitations (irregular heartbeat)",
        "Lightheadedness",
        "Near-syncope or syncope (Mobitz II)",
        "Fatigue",
        "Exercise intolerance"
      ],
      signs: [
        "Irregular pulse",
        "Variable intensity of S1",
        "Cannon A waves in JVP (with blocked beats)"
      ]
    },
    laboratoryFindings: [
      { name: "Electrolytes", normalRange: "Normal", abnormalInDisease: "Hyperkalemia can cause" },
      { name: "Digoxin level", normalRange: "<2.0 ng/mL", abnormalInDisease: "Toxicity can cause AV block" }
    ],
    imagingFindings: {
      ecg: ["Mobitz I: Progressive PR prolongation then dropped beat", "Mobitz II: Fixed PR with sudden dropped beat", "Grouped beating"],
      holterMonitor: ["Intermittent AV block", "Correlation with symptoms"]
    },
    severity: {
      mild: { description: "Mobitz I, asymptomatic, stable ratio" },
      moderate: { description: "Mobitz II, any symptoms" },
      severe: { description: "High-grade 2nd degree (2:1 or higher), symptomatic" }
    }
  },

  I45_0: {
    name: "Right Fascicular Block",
    icd10: "I45.0",
    category: "arrhythmia",
    definition: "Delayed or blocked conduction through the right bundle branch",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Block in right bundle branch → RV depolarization via LV myocardium → delayed RV activation",
      molecularBasis: "Fibrosis, ischemia, or degeneration of conduction tissue"
    },
    clinicalPresentation: {
      symptoms: [
        "Usually asymptomatic",
        "May have symptoms of underlying disease"
      ],
      signs: [
        "Wide split S2",
        "Otherwise normal unless underlying pathology"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "Check for acute coronary syndrome" }
    ],
    imagingFindings: {
      ecg: ["QRS >120ms", "rsR' in V1-V2 (rabbit ears)", "Wide S wave in I, V5-V6", "Normal axis"],
      echocardiography: ["Rule out RV dysfunction", "Pulmonary hypertension assessment"]
    },
    severity: {
      mild: { description: "Isolated RBBB, no underlying disease" },
      moderate: { description: "RBBB with bifascicular pattern" },
      severe: { description: "RBBB with symptoms, ischemia, or progression" }
    }
  },

  I45_1: {
    name: "Other and Unspecified Right Bundle Branch Block",
    icd10: "I45.1",
    category: "arrhythmia",
    definition: "Complete or incomplete right bundle branch block",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Complete interruption of right bundle branch conduction",
      molecularBasis: "Conduction system fibrosis, ischemia, cardiomyopathy"
    },
    clinicalPresentation: {
      symptoms: [
        "Often incidental finding",
        "Symptoms related to underlying condition"
      ],
      signs: [
        "Wide split S2"
      ]
    },
    laboratoryFindings: [
      { name: "Basic metabolic panel", normalRange: "Normal", abnormalInDisease: "Rule out electrolyte abnormalities" }
    ],
    imagingFindings: {
      ecg: ["QRS ≥120ms for complete, 100-119ms for incomplete", "RSR' pattern in V1"]
    },
    severity: {
      mild: { description: "Incomplete RBBB" },
      moderate: { description: "Complete RBBB, isolated" },
      severe: { description: "Complete RBBB with other conduction disease" }
    }
  },

  I45_2: {
    name: "Bifascicular Block",
    icd10: "I45.2",
    category: "arrhythmia",
    definition: "Block involving two of three fascicles: RBBB + LAFB or RBBB + LPFB",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Combined block of right bundle and one left fascicle",
      molecularBasis: "Extensive conduction system disease, fibrosis, ischemia"
    },
    clinicalPresentation: {
      symptoms: [
        "May be asymptomatic",
        "Syncope if progresses to complete heart block",
        "Symptoms of underlying heart disease"
      ],
      signs: [
        "Wide split S2",
        "Signs of underlying disease"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "If acute, rule out MI" }
    ],
    imagingFindings: {
      ecg: ["RBBB pattern + Left axis deviation (LAFB) or Right axis deviation (LPFB)", "QRS >120ms"],
      echocardiography: ["Assess LV function", "Rule out structural disease"]
    },
    severity: {
      mild: { description: "Asymptomatic, stable" },
      moderate: { description: "With underlying structural heart disease" },
      severe: { description: "Symptomatic or progression to complete block" }
    }
  },

  I46_9: {
    name: "Cardiac Arrest, Cause Unspecified",
    icd10: "I46.9",
    category: "arrhythmia",
    definition: "Sudden cessation of effective cardiac mechanical activity with hemodynamic collapse",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "brain", "kidneys", "liver"],
    pathophysiology: {
      mechanism: "Loss of organized electrical activity → no cardiac output → tissue hypoxia → multiorgan failure",
      molecularBasis: "Variable: ischemia, ion channel dysfunction, structural abnormalities"
    },
    clinicalPresentation: {
      symptoms: [
        "Sudden collapse",
        "Loss of consciousness",
        "No breathing or gasping"
      ],
      signs: [
        "Unresponsive",
        "No pulse",
        "No breathing",
        "Cyanosis"
      ]
    },
    laboratoryFindings: [
      { name: "ABG", normalRange: "pH 7.35-7.45", abnormalInDisease: "Severe acidosis" },
      { name: "Lactate", normalRange: "<2 mmol/L", abnormalInDisease: "Severely elevated" },
      { name: "Potassium", normalRange: "3.5-5.0 mEq/L", abnormalInDisease: "May be abnormal (cause or result)" }
    ],
    imagingFindings: {
      ecg: ["VF", "VT", "Asystole", "PEA"],
      echocardiography: ["Post-arrest: assess for cause", "Wall motion abnormalities", "Tamponade"]
    },
    severity: {
      mild: { description: "N/A - always critical" },
      moderate: { description: "N/A" },
      severe: { description: "Life-threatening emergency" }
    }
  },

  I47_0: {
    name: "Re-entry Ventricular Arrhythmia",
    icd10: "I47.0",
    category: "arrhythmia",
    definition: "Ventricular tachycardia due to re-entrant circuit mechanism",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Scar-related or anatomic re-entry circuit in ventricular myocardium",
      molecularBasis: "Heterogeneous conduction around scar tissue, areas of slow conduction"
    },
    clinicalPresentation: {
      symptoms: [
        "Palpitations",
        "Lightheadedness",
        "Syncope",
        "Chest pain",
        "Dyspnea",
        "Cardiac arrest"
      ],
      signs: [
        "Tachycardia",
        "Hypotension if hemodynamically unstable",
        "Signs of heart failure"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "May be elevated" },
      { name: "Electrolytes", normalRange: "Normal", abnormalInDisease: "Check K+, Mg2+" }
    ],
    imagingFindings: {
      ecg: ["Wide QRS tachycardia", "AV dissociation", "Capture/fusion beats"],
      electrophysiologyStudy: ["Inducible VT", "Mapping of re-entry circuit"],
      cardiacMRI: ["Scar identification", "Late gadolinium enhancement"]
    },
    severity: {
      mild: { description: "Hemodynamically stable, infrequent" },
      moderate: { description: "Recurrent, requires antiarrhythmics" },
      severe: { description: "Hemodynamically unstable, frequent, requires ICD/ablation" }
    }
  },

  I48_1: {
    name: "Persistent Atrial Fibrillation",
    icd10: "I48.1",
    category: "arrhythmia",
    definition: "Atrial fibrillation lasting >7 days or requiring cardioversion",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "brain"],
    pathophysiology: {
      mechanism: "Multiple wavelet re-entry and/or focal triggers in atria → chaotic atrial activation",
      molecularBasis: "Atrial remodeling, fibrosis, ion channel alterations"
    },
    clinicalPresentation: {
      symptoms: [
        "Palpitations",
        "Dyspnea",
        "Fatigue",
        "Reduced exercise tolerance",
        "May be asymptomatic"
      ],
      signs: [
        "Irregularly irregular pulse",
        "Variable S1 intensity",
        "Signs of underlying heart disease"
      ]
    },
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Rule out hyperthyroidism" },
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Often elevated" },
      { name: "Renal function", normalRange: "Normal", abnormalInDisease: "Important for DOAC dosing" }
    ],
    imagingFindings: {
      ecg: ["Absent P waves", "Irregularly irregular R-R intervals", "Fibrillatory baseline"],
      echocardiography: ["LA size", "LV function", "Valvular disease"],
      tee: ["LA appendage thrombus assessment before cardioversion"]
    },
    severity: {
      mild: { description: "Rate controlled, low stroke risk" },
      moderate: { description: "Symptomatic despite rate control" },
      severe: { description: "Poorly controlled, tachycardia-induced cardiomyopathy, high stroke risk" }
    }
  },

  I48_2: {
    name: "Chronic Atrial Fibrillation (Permanent)",
    icd10: "I48.2",
    category: "arrhythmia",
    definition: "Long-standing atrial fibrillation where rhythm control is no longer pursued",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "brain"],
    pathophysiology: {
      mechanism: "Established atrial electrical and structural remodeling preventing sinus rhythm maintenance",
      molecularBasis: "Extensive atrial fibrosis, irreversible electrical remodeling"
    },
    clinicalPresentation: {
      symptoms: [
        "Variable - may be well-tolerated",
        "Dyspnea",
        "Fatigue",
        "Palpitations (often reduced awareness)"
      ],
      signs: [
        "Irregularly irregular pulse",
        "Often rate-controlled"
      ]
    },
    laboratoryFindings: [
      { name: "INR", normalRange: "N/A", abnormalInDisease: "Monitor if on warfarin (target 2-3)" },
      { name: "Renal function", normalRange: "Normal", abnormalInDisease: "DOAC dose adjustment" }
    ],
    imagingFindings: {
      ecg: ["Chronic AF pattern"],
      echocardiography: ["Dilated LA", "Assess LV function", "Valvular status"]
    },
    severity: {
      mild: { description: "Well rate-controlled, anticoagulated" },
      moderate: { description: "Rate control challenges" },
      severe: { description: "Complications (stroke, heart failure)" }
    }
  },

  I49_0: {
    name: "Ventricular Fibrillation and Flutter",
    icd10: "I49.0",
    category: "arrhythmia",
    definition: "Chaotic ventricular electrical activity (VF) or rapid organized ventricular activity (VFL)",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "brain"],
    pathophysiology: {
      mechanism: "VF: Multiple wavelet re-entry → no organized contraction. VFL: Rapid ventricular circuit",
      molecularBasis: "Ischemia, ion channel dysfunction, structural substrate"
    },
    clinicalPresentation: {
      symptoms: [
        "Sudden collapse",
        "Loss of consciousness",
        "Cardiac arrest"
      ],
      signs: [
        "Pulseless",
        "Unresponsive",
        "No effective circulation"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "Elevated post-resuscitation" },
      { name: "ABG", normalRange: "Normal", abnormalInDisease: "Acidosis" },
      { name: "Electrolytes", normalRange: "Normal", abnormalInDisease: "Check K+, Mg2+" }
    ],
    imagingFindings: {
      ecg: ["VF: Chaotic, no QRS", "VFL: Very rapid wide QRS"],
      postArrest: ["Coronary angiography", "Echocardiography", "Cardiac MRI"]
    },
    severity: {
      mild: { description: "N/A - always critical" },
      moderate: { description: "N/A" },
      severe: { description: "Life-threatening, requires immediate defibrillation" }
    }
  },

  I49_1: {
    name: "Atrial Premature Depolarization (PACs)",
    icd10: "I49.1",
    category: "arrhythmia",
    definition: "Premature atrial contractions arising from ectopic atrial focus",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Ectopic atrial focus fires before sinus node, may or may not conduct to ventricles",
      molecularBasis: "Triggered activity, automaticity, or micro-reentry in atrial tissue"
    },
    clinicalPresentation: {
      symptoms: [
        "Palpitations (skipped beats)",
        "Fluttering sensation",
        "Often asymptomatic",
        "Anxiety about heart"
      ],
      signs: [
        "Irregular pulse",
        "Compensatory pause may be felt"
      ]
    },
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Rule out thyroid disease" },
      { name: "Electrolytes", normalRange: "Normal", abnormalInDisease: "Check if frequent" }
    ],
    imagingFindings: {
      ecg: ["Premature P wave (different morphology)", "May be followed by QRS or blocked", "Compensatory pause"],
      holterMonitor: ["Quantify PAC burden", "Correlation with symptoms"]
    },
    severity: {
      mild: { description: "<1% burden, asymptomatic" },
      moderate: { description: "Symptomatic, <10% burden" },
      severe: { description: ">10-15% burden (risk of AF), tachycardia-induced cardiomyopathy" }
    }
  },

  I49_3: {
    name: "Ventricular Premature Depolarization (PVCs)",
    icd10: "I49.3",
    category: "arrhythmia",
    definition: "Premature ventricular contractions arising from ventricular ectopic focus",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Ectopic ventricular focus depolarizes before normal conduction, bypasses conduction system",
      molecularBasis: "Abnormal automaticity, triggered activity (afterdepolarizations), re-entry"
    },
    clinicalPresentation: {
      symptoms: [
        "Palpitations (skipped or strong beats)",
        "Chest fluttering",
        "Lightheadedness (if frequent)",
        "Often asymptomatic"
      ],
      signs: [
        "Irregular pulse",
        "Cannon A waves with AV dissociation"
      ]
    },
    laboratoryFindings: [
      { name: "Electrolytes", normalRange: "Normal", abnormalInDisease: "Hypokalemia, hypomagnesemia can increase PVCs" },
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Rule out thyroid disease" },
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "If symptomatic, rule out cardiomyopathy" }
    ],
    imagingFindings: {
      ecg: ["Wide QRS (>120ms)", "No preceding P wave", "Compensatory pause", "Morphology indicates origin"],
      holterMonitor: ["PVC burden quantification", "Patterns (bigeminy, trigeminy, couplets)"],
      echocardiography: ["LV function (especially if high burden)", "Rule out structural disease"]
    },
    severity: {
      mild: { description: "<5% burden, no symptoms, normal heart" },
      moderate: { description: "5-15% burden, symptomatic" },
      severe: { description: ">15-20% burden (risk of PVC-induced cardiomyopathy), polymorphic PVCs" }
    }
  },

  I49_4: {
    name: "Other and Unspecified Premature Depolarization",
    icd10: "I49.4",
    category: "arrhythmia",
    definition: "Ectopic beats not otherwise specified, including junctional premature beats",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Premature impulse from AV junction or other location",
      molecularBasis: "Abnormal automaticity in non-sinus tissue"
    },
    clinicalPresentation: {
      symptoms: [
        "Palpitations",
        "Usually benign",
        "May be asymptomatic"
      ],
      signs: [
        "Irregular pulse"
      ]
    },
    laboratoryFindings: [
      { name: "Electrolytes", normalRange: "Normal", abnormalInDisease: "Check K+, Mg2+" }
    ],
    imagingFindings: {
      ecg: ["Premature complex with narrow QRS", "Retrograde P wave (inverted in II, III, aVF)", "Short PR if preceding P wave"]
    },
    severity: {
      mild: { description: "Infrequent, asymptomatic" },
      moderate: { description: "Frequent, symptomatic" },
      severe: { description: "Very frequent, underlying pathology" }
    }
  },

  // =====================
  // CARDIOMYOPATHIES - ADDITIONAL CODES
  // ICD-10: I42 Series
  // =====================

  I42_2: {
    name: "Other Hypertrophic Cardiomyopathy",
    icd10: "I42.2",
    category: "cardiomyopathy",
    definition: "Non-obstructive hypertrophic cardiomyopathy and other HCM variants",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Myocyte hypertrophy and disarray without significant LVOT obstruction",
      molecularBasis: "Sarcomeric protein mutations (MYH7, MYBPC3), similar to HOCM"
    },
    clinicalPresentation: {
      symptoms: [
        "Dyspnea on exertion",
        "Chest pain",
        "Palpitations",
        "Syncope (less common than HOCM)",
        "May be asymptomatic"
      ],
      signs: [
        "S4 gallop",
        "May lack systolic murmur (no obstruction)",
        "Forceful apical impulse"
      ]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "May be elevated" },
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "May be mildly elevated" },
      { name: "Genetic testing", normalRange: "N/A", abnormalInDisease: "Sarcomeric gene mutations" }
    ],
    imagingFindings: {
      ecg: ["LVH voltage criteria", "T-wave inversions", "Q waves"],
      echocardiography: ["Wall thickness ≥15mm", "No significant LVOT gradient (<30mmHg)", "Diastolic dysfunction"],
      cardiacMRI: ["Wall thickness", "Late gadolinium enhancement (fibrosis)", "Apical variant"]
    },
    severity: {
      mild: { description: "Wall 13-15mm, asymptomatic" },
      moderate: { description: "Wall 15-20mm, symptoms" },
      severe: { description: "Wall >20mm, significant diastolic dysfunction, arrhythmias" }
    }
  },

  I42_5: {
    name: "Other Restrictive Cardiomyopathy",
    icd10: "I42.5",
    category: "cardiomyopathy",
    definition: "Cardiomyopathy with impaired ventricular filling due to increased stiffness",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "lungs", "liver"],
    pathophysiology: {
      mechanism: "Stiff, non-compliant ventricles → impaired diastolic filling → elevated filling pressures",
      molecularBasis: "Infiltrative (amyloid), storage (hemochromatosis), fibrotic, or idiopathic"
    },
    clinicalPresentation: {
      symptoms: [
        "Dyspnea on exertion",
        "Fatigue",
        "Exercise intolerance",
        "Peripheral edema",
        "Ascites"
      ],
      signs: [
        "Elevated JVP (Kussmaul sign)",
        "S3 and S4",
        "Hepatomegaly",
        "Peripheral edema",
        "Normal or near-normal heart size"
      ]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated" },
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "May be chronically elevated in amyloid" },
      { name: "Serum/urine protein electrophoresis", normalRange: "N/A", abnormalInDisease: "For amyloid workup" },
      { name: "Iron studies", normalRange: "Normal", abnormalInDisease: "Elevated ferritin in hemochromatosis" }
    ],
    imagingFindings: {
      echocardiography: ["Biatrial enlargement", "Normal/small LV", "Preserved EF initially", "Severely abnormal diastolic function", "Pericardial effusion"],
      cardiacMRI: ["Late gadolinium enhancement pattern", "Infiltration patterns", "Myocardial T1 mapping"],
      ecg: ["Low voltage (especially in amyloid)", "Conduction abnormalities"]
    },
    severity: {
      mild: { description: "Mild diastolic dysfunction, minimal symptoms" },
      moderate: { description: "Moderate restriction, symptomatic" },
      severe: { description: "Severe restriction, refractory heart failure" }
    }
  },

  I42_6: {
    name: "Alcoholic Cardiomyopathy",
    icd10: "I42.6",
    category: "cardiomyopathy",
    definition: "Dilated cardiomyopathy secondary to chronic heavy alcohol consumption",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "liver", "lungs"],
    pathophysiology: {
      mechanism: "Direct toxic effect of alcohol and acetaldehyde on myocardium → myocyte damage → dilation",
      molecularBasis: "Oxidative stress, mitochondrial dysfunction, impaired protein synthesis, apoptosis"
    },
    clinicalPresentation: {
      symptoms: [
        "Dyspnea",
        "Fatigue",
        "Palpitations",
        "Peripheral edema",
        "Symptoms of alcohol use disorder",
        "May improve with abstinence"
      ],
      signs: [
        "Cardiomegaly",
        "Signs of heart failure",
        "Stigmata of chronic liver disease",
        "Atrial fibrillation common"
      ]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated" },
      { name: "Liver function tests", normalRange: "Normal", abnormalInDisease: "Often abnormal (AST>ALT)" },
      { name: "GGT", normalRange: "<50 U/L", abnormalInDisease: "Elevated with alcohol use" },
      { name: "MCV", normalRange: "80-100 fL", abnormalInDisease: "Macrocytosis common" },
      { name: "Thiamine", normalRange: "Normal", abnormalInDisease: "Often deficient" }
    ],
    imagingFindings: {
      echocardiography: ["Dilated LV", "Reduced EF", "Global hypokinesis", "May improve with abstinence"],
      cardiacMRI: ["Dilation", "Limited fibrosis (good prognostic sign)"]
    },
    severity: {
      mild: { description: "Early changes, EF mildly reduced" },
      moderate: { description: "EF 30-40%, symptomatic" },
      severe: { description: "EF <30%, refractory heart failure" }
    }
  },

  I42_7: {
    name: "Cardiomyopathy due to Drug and External Agent",
    icd10: "I42.7",
    category: "cardiomyopathy",
    definition: "Cardiomyopathy caused by medications, toxins, or external agents",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Direct cardiotoxicity from chemotherapy, radiation, or other agents",
      molecularBasis: "Varies: anthracycline - topoisomerase/oxidative stress; trastuzumab - HER2 inhibition; radiation - fibrosis"
    },
    clinicalPresentation: {
      symptoms: [
        "Dyspnea",
        "Fatigue",
        "Peripheral edema",
        "History of cardiotoxic exposure",
        "May be delayed (months to years after chemo/radiation)"
      ],
      signs: [
        "Signs of heart failure",
        "May have history of cancer treatment"
      ]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated" },
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "May be elevated during active cardiotoxicity" }
    ],
    imagingFindings: {
      echocardiography: ["Reduced EF", "GLS reduction (early marker)", "Dilation"],
      cardiacMRI: ["Radiation: fibrosis pattern", "Chemo: edema, dysfunction"]
    },
    severity: {
      mild: { description: "GLS reduction, normal EF" },
      moderate: { description: "EF drop >10% from baseline or EF <53%" },
      severe: { description: "EF <40%, symptomatic heart failure" }
    }
  },

  I42_8: {
    name: "Other Cardiomyopathies",
    icd10: "I42.8",
    category: "cardiomyopathy",
    definition: "Cardiomyopathies not elsewhere classified including Takotsubo, LVNC, ARVC",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Variable depending on type: Takotsubo (catecholamine surge), LVNC (developmental), ARVC (desmosomal mutation)",
      molecularBasis: "Type-specific pathophysiology"
    },
    clinicalPresentation: {
      symptoms: [
        "Chest pain (Takotsubo)",
        "Dyspnea",
        "Palpitations (ARVC)",
        "Syncope",
        "Heart failure symptoms"
      ],
      signs: [
        "Variable depending on type",
        "Signs of heart failure",
        "Arrhythmias (especially ARVC)"
      ]
    },
    laboratoryFindings: [
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "Elevated (especially Takotsubo)" },
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      echocardiography: ["Takotsubo: apical ballooning", "LVNC: trabeculations", "ARVC: RV dilation/dysfunction"],
      cardiacMRI: ["Definitive diagnosis for LVNC and ARVC", "Takotsubo: edema without scarring"]
    },
    severity: {
      mild: { description: "Preserved function, minimal symptoms" },
      moderate: { description: "Moderate dysfunction" },
      severe: { description: "Severe dysfunction, arrhythmias, heart failure" }
    }
  },

  I42_9: {
    name: "Cardiomyopathy, Unspecified",
    icd10: "I42.9",
    category: "cardiomyopathy",
    definition: "Cardiomyopathy not further specified or of unknown etiology",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Myocardial dysfunction of undetermined type",
      molecularBasis: "Variable or unknown"
    },
    clinicalPresentation: {
      symptoms: [
        "Dyspnea",
        "Fatigue",
        "Palpitations",
        "Edema"
      ],
      signs: [
        "Signs of heart failure",
        "Cardiomegaly"
      ]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Usually elevated" },
      { name: "Comprehensive workup", normalRange: "N/A", abnormalInDisease: "To determine etiology" }
    ],
    imagingFindings: {
      echocardiography: ["Assess type and severity"],
      cardiacMRI: ["Tissue characterization", "Determine etiology"]
    },
    severity: {
      mild: { description: "Mild dysfunction" },
      moderate: { description: "Moderate dysfunction" },
      severe: { description: "Severe dysfunction" }
    }
  },

  // =====================
  // RHEUMATIC HEART DISEASE - ADDITIONAL
  // ICD-10: I00-I09 Series
  // =====================

  I06_0: {
    name: "Rheumatic Aortic Stenosis",
    icd10: "I06.0",
    category: "rheumatic",
    definition: "Stenosis of aortic valve secondary to rheumatic heart disease",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Post-inflammatory scarring and calcification of aortic valve leaflets",
      molecularBasis: "Molecular mimicry between streptococcal antigens and cardiac tissue"
    },
    clinicalPresentation: {
      symptoms: [
        "Angina",
        "Syncope",
        "Heart failure (dyspnea)",
        "Symptoms typically with exertion initially"
      ],
      signs: [
        "Harsh systolic ejection murmur",
        "Radiates to carotids",
        "Parvus et tardus pulse",
        "Soft or absent A2"
      ]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated in symptomatic disease" },
      { name: "ASO titer", normalRange: "<200 IU/mL", abnormalInDisease: "May be elevated if recent strep" }
    ],
    imagingFindings: {
      echocardiography: ["Valve area <1.0 cm² (severe)", "Mean gradient >40 mmHg", "Peak velocity >4 m/s", "Commissural fusion"],
      ecg: ["LVH pattern", "Strain"]
    },
    severity: {
      mild: { description: "AVA >1.5 cm², gradient <25 mmHg" },
      moderate: { description: "AVA 1.0-1.5 cm², gradient 25-40 mmHg" },
      severe: { description: "AVA <1.0 cm², gradient >40 mmHg" }
    }
  },

  I06_1: {
    name: "Rheumatic Aortic Insufficiency",
    icd10: "I06.1",
    category: "rheumatic",
    definition: "Regurgitation of aortic valve secondary to rheumatic heart disease",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Leaflet retraction and scarring preventing proper valve closure",
      molecularBasis: "Chronic inflammatory damage to valve leaflets"
    },
    clinicalPresentation: {
      symptoms: [
        "Dyspnea on exertion",
        "Palpitations (bounding pulse)",
        "Angina",
        "Heart failure symptoms late"
      ],
      signs: [
        "Early diastolic murmur (high-pitched, blowing)",
        "Wide pulse pressure",
        "Water-hammer pulse",
        "De Musset sign (head bobbing)",
        "Quincke sign (nail bed pulsation)"
      ]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated when symptomatic" }
    ],
    imagingFindings: {
      echocardiography: ["Regurgitant jet", "LV dilation", "Holodiastolic flow reversal in aorta"],
      ecg: ["LVH", "Volume overload pattern"]
    },
    severity: {
      mild: { description: "Jet width <25% LVOT, vena contracta <0.3 cm" },
      moderate: { description: "Jet 25-64% LVOT, vena contracta 0.3-0.6 cm" },
      severe: { description: "Jet >65% LVOT, vena contracta >0.6 cm" }
    }
  },

  I06_2: {
    name: "Rheumatic Aortic Stenosis with Insufficiency",
    icd10: "I06.2",
    category: "rheumatic",
    definition: "Combined stenosis and regurgitation of aortic valve from rheumatic disease",
    primaryOrgan: "heart",
    affectedOrgans: ["heart"],
    pathophysiology: {
      mechanism: "Combined leaflet scarring causing both obstruction and incomplete closure",
      molecularBasis: "Extensive rheumatic valve damage"
    },
    clinicalPresentation: {
      symptoms: [
        "Combined symptoms of AS and AR",
        "Dyspnea",
        "Angina",
        "Syncope"
      ],
      signs: [
        "Systolic and diastolic murmurs",
        "LV enlargement signs"
      ]
    },
    laboratoryFindings: [
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      echocardiography: ["Features of both AS and AR", "LV dilation and hypertrophy"],
      ecg: ["Combined LVH features"]
    },
    severity: {
      mild: { description: "Mild AS and AR" },
      moderate: { description: "Moderate AS or AR" },
      severe: { description: "Severe AS and/or AR" }
    }
  },

  I07_0: {
    name: "Rheumatic Tricuspid Stenosis",
    icd10: "I07.0",
    category: "rheumatic",
    definition: "Stenosis of tricuspid valve secondary to rheumatic heart disease",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "liver"],
    pathophysiology: {
      mechanism: "Commissural fusion and leaflet thickening of tricuspid valve",
      molecularBasis: "Rheumatic inflammatory damage, almost always with mitral involvement"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Abdominal discomfort (hepatic congestion)",
        "Peripheral edema",
        "Ascites"
      ],
      signs: [
        "Elevated JVP with prominent A wave",
        "Low-pitched diastolic murmur at LLSB",
        "Increases with inspiration",
        "Hepatomegaly"
      ]
    },
    laboratoryFindings: [
      { name: "Liver function tests", normalRange: "Normal", abnormalInDisease: "May be elevated from congestion" }
    ],
    imagingFindings: {
      echocardiography: ["Thickened leaflets", "Restricted motion", "Mean gradient >5 mmHg significant", "Valve area <1.0 cm² severe"],
      ecg: ["Tall P waves (RA enlargement)", "Often AF"]
    },
    severity: {
      mild: { description: "Valve area >1.5 cm²" },
      moderate: { description: "Valve area 1.0-1.5 cm²" },
      severe: { description: "Valve area <1.0 cm², gradient >5 mmHg" }
    }
  },

  I07_1: {
    name: "Rheumatic Tricuspid Insufficiency",
    icd10: "I07.1",
    category: "rheumatic",
    definition: "Regurgitation of tricuspid valve secondary to rheumatic heart disease",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "liver"],
    pathophysiology: {
      mechanism: "Leaflet scarring and retraction preventing complete closure",
      molecularBasis: "Chronic rheumatic valve damage"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Abdominal distension",
        "Peripheral edema",
        "Often overshadowed by left-sided lesions"
      ],
      signs: [
        "Pansystolic murmur at LLSB",
        "Increases with inspiration",
        "Elevated JVP with prominent V wave",
        "Pulsatile liver",
        "Peripheral edema"
      ]
    },
    laboratoryFindings: [
      { name: "Liver function tests", normalRange: "Normal", abnormalInDisease: "Elevated from congestion" }
    ],
    imagingFindings: {
      echocardiography: ["Regurgitant jet", "RA and RV dilation", "Tricuspid annular dilation"],
      ecg: ["RA enlargement", "RVH if severe"]
    },
    severity: {
      mild: { description: "Small central jet" },
      moderate: { description: "Moderate jet, some RV dilation" },
      severe: { description: "Large jet, significant RV/RA dilation, systolic flow reversal in hepatic veins" }
    }
  }
};

export default CARDIAC_DISEASES_PART8;
