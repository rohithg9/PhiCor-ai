// ============================================================
// RENAL DISEASES DATABASE
// Comprehensive ICD-10 coverage for kidney and urinary diseases
// ICD-10: N00-N39 (Diseases of the urinary system)
// ============================================================

export const RENAL_DISEASES = {
  // =====================
  // ACUTE KIDNEY INJURY
  // ICD-10: N17 Series
  // =====================

  N17_0: {
    name: "Acute Kidney Injury with Tubular Necrosis",
    icd10: "N17.0",
    category: "renal",
    definition: "Acute decline in kidney function due to ischemic or toxic injury to renal tubular epithelium",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys", "heart"],
    pathophysiology: {
      mechanism: "Tubular epithelial cell death → loss of concentrating ability → decreased GFR → oliguria/anuria",
      molecularBasis: "ATP depletion, oxidative stress, calcium influx, apoptosis and necrosis of tubular cells"
    },
    clinicalPresentation: {
      symptoms: [
        "Decreased urine output (oliguria/anuria)",
        "Fatigue",
        "Nausea and vomiting",
        "Confusion (uremia)",
        "Edema",
        "Shortness of breath"
      ],
      signs: [
        "Elevated blood pressure or hypotension",
        "Peripheral edema",
        "Pulmonary edema (fluid overload)",
        "Asterixis (uremic encephalopathy)",
        "Pericardial friction rub (uremic pericarditis)"
      ]
    },
    laboratoryFindings: [
      { name: "Serum Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "Rapidly rising (>0.3 mg/dL in 48h or >1.5x baseline)" },
      { name: "BUN", normalRange: "7-20 mg/dL", abnormalInDisease: "Elevated" },
      { name: "Potassium", normalRange: "3.5-5.0 mEq/L", abnormalInDisease: "Elevated (hyperkalemia)" },
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Muddy brown granular casts (pathognomonic)" },
      { name: "FENa", normalRange: "<1%", abnormalInDisease: ">2% (intrinsic renal failure)" },
      { name: "Urine osmolality", normalRange: "Variable", abnormalInDisease: "<350 mOsm/kg (loss of concentrating ability)" }
    ],
    imagingFindings: {
      ultrasound: ["Normal-sized kidneys", "Increased echogenicity", "Rule out obstruction"],
      ctScan: ["Non-contrast to rule out obstruction", "Normal kidney size"]
    },
    severity: {
      mild: { description: "KDIGO Stage 1: Cr 1.5-1.9x baseline or ≥0.3 mg/dL increase" },
      moderate: { description: "KDIGO Stage 2: Cr 2.0-2.9x baseline" },
      severe: { description: "KDIGO Stage 3: Cr ≥3x baseline or ≥4.0 mg/dL or RRT initiation" }
    },
    modifications: {
      kidneys: {
        geometry: {
          kidney_length: { factor: 1.1, note: "Mild swelling in acute phase" },
          kidney_volume: { factor: 1.15, note: "Edematous kidneys" }
        },
        physiology: {
          gfr: { factor: 0.3, note: "Severely reduced (<30 mL/min)" },
          creatinine_clearance: { factor: 0.25, note: "Markedly decreased" },
          urine_output: { factor: 0.3, note: "Oliguria/anuria" },
          bun: { factor: 3.0, note: "Elevated due to decreased excretion" }
        }
      },
      heart: {
        physiology: {
          blood_pressure: { factor: 1.15, note: "Fluid overload hypertension" }
        }
      }
    }
  },

  N17_1: {
    name: "Acute Kidney Injury with Acute Cortical Necrosis",
    icd10: "N17.1",
    category: "renal",
    definition: "Severe AKI due to ischemic necrosis of the renal cortex, often irreversible",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys"],
    pathophysiology: {
      mechanism: "Severe ischemia → complete cortical infarction → permanent loss of nephrons",
      molecularBasis: "DIC, placental abruption, septic shock causing microvascular thrombosis"
    },
    clinicalPresentation: {
      symptoms: [
        "Anuria (complete)",
        "Flank pain",
        "Gross hematuria",
        "Symptoms of underlying cause (obstetric emergency, sepsis)"
      ],
      signs: [
        "Anuria",
        "Signs of shock",
        "Bleeding (if DIC)"
      ]
    },
    laboratoryFindings: [
      { name: "Serum Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "Severely elevated, often >10 mg/dL" },
      { name: "LDH", normalRange: "140-280 U/L", abnormalInDisease: "Markedly elevated (tissue necrosis)" },
      { name: "Coagulation studies", normalRange: "Normal", abnormalInDisease: "DIC pattern if present" }
    ],
    imagingFindings: {
      ctScan: ["Cortical rim sign (non-enhancing cortex)", "Preserved medulla"],
      ultrasound: ["Hypoechoic cortex", "Loss of corticomedullary differentiation"]
    },
    severity: {
      mild: { description: "Partial cortical necrosis" },
      moderate: { description: "Significant but incomplete necrosis" },
      severe: { description: "Complete bilateral cortical necrosis - requires permanent dialysis" }
    },
    modifications: {
      kidneys: {
        geometry: {
          kidney_length: { factor: 0.85, note: "Cortical loss and atrophy" },
          cortex_thickness: { factor: 0.3, note: "Severe cortical destruction" }
        },
        physiology: {
          gfr: { factor: 0.1, note: "Near-complete loss of function" },
          creatinine_clearance: { factor: 0.1, note: "Severely impaired" },
          urine_output: { factor: 0.05, note: "Anuria" }
        }
      }
    }
  },

  N17_9: {
    name: "Acute Kidney Injury, Unspecified",
    icd10: "N17.9",
    category: "renal",
    definition: "Acute decline in kidney function not otherwise specified",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys"],
    pathophysiology: {
      mechanism: "Prerenal, intrinsic, or postrenal causes leading to decreased GFR",
      molecularBasis: "Variable depending on etiology"
    },
    clinicalPresentation: {
      symptoms: [
        "Decreased urine output",
        "Fatigue",
        "Nausea",
        "Confusion"
      ],
      signs: [
        "Edema",
        "Hypertension or hypotension",
        "Uremic signs"
      ]
    },
    laboratoryFindings: [
      { name: "Serum Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "Rising" },
      { name: "BUN", normalRange: "7-20 mg/dL", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      ultrasound: ["Rule out obstruction", "Assess kidney size"]
    },
    severity: {
      mild: { description: "KDIGO Stage 1" },
      moderate: { description: "KDIGO Stage 2" },
      severe: { description: "KDIGO Stage 3" }
    },
    modifications: {
      kidneys: {
        physiology: {
          gfr: { factor: 0.5, note: "Reduced depending on stage" },
          creatinine_clearance: { factor: 0.5, note: "Decreased" },
          urine_output: { factor: 0.6, note: "May be reduced" }
        }
      }
    }
  },

  // =====================
  // CHRONIC KIDNEY DISEASE
  // ICD-10: N18 Series
  // =====================

  N18_1: {
    name: "Chronic Kidney Disease, Stage 1",
    icd10: "N18.1",
    category: "renal",
    definition: "Kidney damage with normal or increased GFR (≥90 mL/min/1.73m²)",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys"],
    pathophysiology: {
      mechanism: "Early nephron damage with compensatory hyperfiltration maintaining GFR",
      molecularBasis: "Underlying cause (diabetes, hypertension) causing glomerular or tubulointerstitial injury"
    },
    clinicalPresentation: {
      symptoms: [
        "Usually asymptomatic",
        "May have symptoms of underlying disease (diabetes, hypertension)"
      ],
      signs: [
        "Often normal examination",
        "May have hypertension"
      ]
    },
    laboratoryFindings: [
      { name: "eGFR", normalRange: "≥90 mL/min", abnormalInDisease: "≥90 mL/min (normal) BUT with evidence of kidney damage" },
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Albuminuria (>30 mg/g), hematuria, or abnormal sediment" },
      { name: "Urine albumin-to-creatinine ratio", normalRange: "<30 mg/g", abnormalInDisease: "≥30 mg/g (marker of damage)" }
    ],
    imagingFindings: {
      ultrasound: ["Usually normal", "May show underlying structural abnormality"]
    },
    severity: {
      mild: { description: "A1 albuminuria (<30 mg/g)" },
      moderate: { description: "A2 albuminuria (30-300 mg/g)" },
      severe: { description: "A3 albuminuria (>300 mg/g)" }
    },
    modifications: {
      kidneys: {
        physiology: {
          gfr: { factor: 1.0, note: "GFR preserved ≥90 mL/min" },
          albumin_excretion: { factor: 2.0, note: "Increased albuminuria" }
        }
      }
    }
  },

  N18_2: {
    name: "Chronic Kidney Disease, Stage 2 (Mild)",
    icd10: "N18.2",
    category: "renal",
    definition: "Kidney damage with mildly decreased GFR (60-89 mL/min/1.73m²)",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys"],
    pathophysiology: {
      mechanism: "Progressive nephron loss with early decline in filtration capacity",
      molecularBasis: "Ongoing glomerulosclerosis, tubulointerstitial fibrosis"
    },
    clinicalPresentation: {
      symptoms: [
        "Usually asymptomatic",
        "Mild fatigue (occasional)"
      ],
      signs: [
        "Often normal",
        "Hypertension common"
      ]
    },
    laboratoryFindings: [
      { name: "eGFR", normalRange: "≥90 mL/min", abnormalInDisease: "60-89 mL/min" },
      { name: "Serum Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "Mildly elevated" },
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Albuminuria" }
    ],
    imagingFindings: {
      ultrasound: ["May show early cortical thinning", "Usually normal"]
    },
    severity: {
      mild: { description: "eGFR 75-89, low albuminuria" },
      moderate: { description: "eGFR 60-74, moderate albuminuria" },
      severe: { description: "eGFR 60-89 with high albuminuria" }
    },
    modifications: {
      kidneys: {
        physiology: {
          gfr: { factor: 0.8, note: "Mildly reduced (60-89 mL/min)" },
          creatinine_clearance: { factor: 0.8, note: "Mildly decreased" }
        }
      }
    }
  },

  N18_3: {
    name: "Chronic Kidney Disease, Stage 3 (Moderate)",
    icd10: "N18.3",
    category: "renal",
    definition: "Moderately decreased GFR (30-59 mL/min/1.73m²)",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys", "heart"],
    pathophysiology: {
      mechanism: "Significant nephron loss → impaired filtration, early metabolic complications",
      molecularBasis: "Progressive fibrosis, early phosphate retention, secondary hyperparathyroidism begins"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Mild edema",
        "Nocturia",
        "Early anemia symptoms"
      ],
      signs: [
        "Hypertension",
        "Mild peripheral edema",
        "Pallor (anemia)"
      ]
    },
    laboratoryFindings: [
      { name: "eGFR", normalRange: "≥90 mL/min", abnormalInDisease: "30-59 mL/min (3a: 45-59, 3b: 30-44)" },
      { name: "Hemoglobin", normalRange: "12-16 g/dL", abnormalInDisease: "May be decreased (renal anemia)" },
      { name: "Phosphorus", normalRange: "2.5-4.5 mg/dL", abnormalInDisease: "May be elevated" },
      { name: "PTH", normalRange: "10-65 pg/mL", abnormalInDisease: "Elevated (secondary hyperparathyroidism)" },
      { name: "Calcium", normalRange: "8.5-10.5 mg/dL", abnormalInDisease: "May be low" }
    ],
    imagingFindings: {
      ultrasound: ["Decreased kidney size", "Increased echogenicity", "Cortical thinning"]
    },
    severity: {
      mild: { description: "Stage 3a: eGFR 45-59" },
      moderate: { description: "Stage 3b: eGFR 30-44" },
      severe: { description: "Stage 3b with heavy proteinuria" }
    }
  },

  N18_4: {
    name: "Chronic Kidney Disease, Stage 4 (Severe)",
    icd10: "N18.4",
    category: "renal",
    definition: "Severely decreased GFR (15-29 mL/min/1.73m²)",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys", "heart", "brain"],
    pathophysiology: {
      mechanism: "Advanced nephron loss → significant uremia, metabolic acidosis, mineral bone disease",
      molecularBasis: "Accumulated uremic toxins, severe secondary hyperparathyroidism, erythropoietin deficiency"
    },
    clinicalPresentation: {
      symptoms: [
        "Significant fatigue",
        "Anorexia and nausea",
        "Pruritus",
        "Sleep disturbances",
        "Restless legs",
        "Cognitive changes"
      ],
      signs: [
        "Hypertension (often refractory)",
        "Peripheral edema",
        "Pallor",
        "Uremic frost (rare, severe)",
        "Asterixis"
      ]
    },
    laboratoryFindings: [
      { name: "eGFR", normalRange: "≥90 mL/min", abnormalInDisease: "15-29 mL/min" },
      { name: "BUN", normalRange: "7-20 mg/dL", abnormalInDisease: "Significantly elevated" },
      { name: "Bicarbonate", normalRange: "22-28 mEq/L", abnormalInDisease: "Low (metabolic acidosis)" },
      { name: "Hemoglobin", normalRange: "12-16 g/dL", abnormalInDisease: "Low (anemia)" },
      { name: "Potassium", normalRange: "3.5-5.0 mEq/L", abnormalInDisease: "May be elevated" }
    ],
    imagingFindings: {
      ultrasound: ["Small, echogenic kidneys", "Loss of corticomedullary differentiation"]
    },
    severity: {
      mild: { description: "eGFR 25-29, stable" },
      moderate: { description: "eGFR 20-24, symptomatic" },
      severe: { description: "eGFR 15-19, preparing for RRT" }
    }
  },

  N18_5: {
    name: "Chronic Kidney Disease, Stage 5 (End-Stage)",
    icd10: "N18.5",
    category: "renal",
    definition: "End-stage renal disease with GFR <15 mL/min/1.73m² or requiring dialysis",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys", "heart", "brain", "lungs"],
    pathophysiology: {
      mechanism: "Near-complete loss of kidney function → uremia, requiring renal replacement therapy",
      molecularBasis: "Severe uremic toxin accumulation, complete loss of homeostatic functions"
    },
    clinicalPresentation: {
      symptoms: [
        "Severe fatigue",
        "Anorexia, nausea, vomiting",
        "Dyspnea (fluid overload, anemia)",
        "Severe pruritus",
        "Cognitive impairment",
        "Bleeding tendency"
      ],
      signs: [
        "Volume overload",
        "Pericardial friction rub",
        "Uremic encephalopathy",
        "Uremic frost",
        "Peripheral neuropathy"
      ]
    },
    laboratoryFindings: [
      { name: "eGFR", normalRange: "≥90 mL/min", abnormalInDisease: "<15 mL/min" },
      { name: "BUN", normalRange: "7-20 mg/dL", abnormalInDisease: "Often >100 mg/dL" },
      { name: "Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "Often >10 mg/dL" },
      { name: "Potassium", normalRange: "3.5-5.0 mEq/L", abnormalInDisease: "Often elevated (dangerous)" }
    ],
    imagingFindings: {
      ultrasound: ["Small, scarred kidneys", "Bilateral cortical atrophy"],
      echocardiography: ["Uremic cardiomyopathy", "Pericardial effusion"]
    },
    severity: {
      mild: { description: "N/A - Stage 5 is always severe" },
      moderate: { description: "N/A" },
      severe: { description: "Requires dialysis or transplant for survival" }
    }
  },

  N18_6: {
    name: "End-Stage Renal Disease (ESRD)",
    icd10: "N18.6",
    category: "renal",
    definition: "Chronic kidney failure requiring dialysis or transplantation",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys", "heart", "brain", "lungs", "liver"],
    pathophysiology: {
      mechanism: "Complete renal failure requiring external renal replacement",
      molecularBasis: "Total loss of excretory, metabolic, and endocrine kidney functions"
    },
    clinicalPresentation: {
      symptoms: [
        "All uremic symptoms",
        "Dialysis-related symptoms (if on dialysis)",
        "Medication burden symptoms"
      ],
      signs: [
        "Arteriovenous fistula/graft (if on hemodialysis)",
        "Peritoneal catheter (if on PD)",
        "Volume management challenges"
      ]
    },
    laboratoryFindings: [
      { name: "eGFR", normalRange: "≥90 mL/min", abnormalInDisease: "<15 mL/min or on dialysis" },
      { name: "Kt/V", normalRange: "N/A", abnormalInDisease: "Target ≥1.2 on hemodialysis" }
    ],
    imagingFindings: {
      ultrasound: ["Atrophic kidneys"],
      vascularAccess: ["Fistula/graft assessment if applicable"]
    },
    severity: {
      mild: { description: "Well-controlled on dialysis" },
      moderate: { description: "Complications present" },
      severe: { description: "Multiple complications, transplant candidate evaluation" }
    }
  },

  // =====================
  // GLOMERULAR DISEASES
  // ICD-10: N00-N08 Series
  // =====================

  N00_9: {
    name: "Acute Nephritic Syndrome",
    icd10: "N00.9",
    category: "renal",
    definition: "Acute glomerulonephritis presenting with hematuria, proteinuria, hypertension, and decreased GFR",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys"],
    pathophysiology: {
      mechanism: "Immune complex deposition in glomeruli → inflammation → decreased GFR, hematuria, proteinuria",
      molecularBasis: "Post-infectious (streptococcal), IgA nephropathy, lupus nephritis, anti-GBM disease"
    },
    clinicalPresentation: {
      symptoms: [
        "Dark/cola-colored urine (gross hematuria)",
        "Decreased urine output",
        "Facial/periorbital edema",
        "Recent infection history (often strep throat)"
      ],
      signs: [
        "Hypertension",
        "Edema (periorbital, pedal)",
        "Signs of volume overload"
      ]
    },
    laboratoryFindings: [
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "RBC casts (hallmark), dysmorphic RBCs, proteinuria" },
      { name: "Serum Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "Elevated" },
      { name: "C3/C4", normalRange: "Normal", abnormalInDisease: "Low C3 (post-infectious, MPGN), low C4 (lupus)" },
      { name: "ASO titer", normalRange: "<200 IU/mL", abnormalInDisease: "Elevated if post-streptococcal" },
      { name: "ANA, anti-dsDNA", normalRange: "Negative", abnormalInDisease: "Positive in lupus nephritis" }
    ],
    imagingFindings: {
      ultrasound: ["Normal to slightly enlarged kidneys", "Increased echogenicity"]
    },
    severity: {
      mild: { description: "Mild hematuria, normal GFR" },
      moderate: { description: "Moderate proteinuria, decreased GFR" },
      severe: { description: "Rapidly progressive GN, requires urgent treatment" }
    }
  },

  N04_9: {
    name: "Nephrotic Syndrome",
    icd10: "N04.9",
    category: "renal",
    definition: "Kidney disorder causing massive proteinuria (>3.5g/day), hypoalbuminemia, edema, and hyperlipidemia",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys", "heart"],
    pathophysiology: {
      mechanism: "Glomerular permeability defect → massive protein loss → hypoalbuminemia → edema, hyperlipidemia",
      molecularBasis: "Minimal change disease, FSGS, membranous nephropathy, diabetic nephropathy"
    },
    clinicalPresentation: {
      symptoms: [
        "Severe edema (periorbital, pedal, anasarca)",
        "Foamy urine",
        "Weight gain (fluid)",
        "Fatigue"
      ],
      signs: [
        "Periorbital edema (worse in morning)",
        "Pitting peripheral edema",
        "Ascites",
        "Pleural effusions"
      ]
    },
    laboratoryFindings: [
      { name: "Urine protein", normalRange: "<150 mg/day", abnormalInDisease: ">3.5 g/day (nephrotic range)" },
      { name: "Serum Albumin", normalRange: "3.5-5.0 g/dL", abnormalInDisease: "<3.0 g/dL" },
      { name: "Cholesterol", normalRange: "<200 mg/dL", abnormalInDisease: "Elevated (often >300)" },
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Heavy proteinuria, lipiduria (oval fat bodies)" }
    ],
    imagingFindings: {
      ultrasound: ["Normal to enlarged kidneys initially", "May be small in chronic disease"],
      renalBiopsy: ["Definitive diagnosis - shows underlying pathology"]
    },
    severity: {
      mild: { description: "Protein 3.5-5 g/day, albumin >2.5" },
      moderate: { description: "Protein 5-10 g/day, albumin 2.0-2.5" },
      severe: { description: "Protein >10 g/day, albumin <2.0, complications (thrombosis)" }
    }
  },

  N03_9: {
    name: "Chronic Nephritic Syndrome",
    icd10: "N03.9",
    category: "renal",
    definition: "Chronic glomerulonephritis with persistent hematuria, proteinuria, and progressive renal decline",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys"],
    pathophysiology: {
      mechanism: "Persistent glomerular inflammation → progressive scarring → nephron loss → CKD",
      molecularBasis: "IgA nephropathy, membranoproliferative GN, chronic post-infectious GN"
    },
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic initially",
        "Intermittent gross hematuria",
        "Progressive fatigue",
        "Edema"
      ],
      signs: [
        "Hypertension",
        "Signs of CKD progression"
      ]
    },
    laboratoryFindings: [
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Persistent hematuria, proteinuria, RBC casts" },
      { name: "eGFR", normalRange: "≥90 mL/min", abnormalInDisease: "Progressively declining" }
    ],
    imagingFindings: {
      ultrasound: ["Chronically small kidneys", "Increased echogenicity"]
    },
    severity: {
      mild: { description: "eGFR >60, mild proteinuria" },
      moderate: { description: "eGFR 30-59" },
      severe: { description: "eGFR <30, heavy proteinuria" }
    }
  },

  // =====================
  // DIABETIC NEPHROPATHY
  // ICD-10: N08.3 (manifestation code)
  // =====================

  E11_65: {
    name: "Diabetic Nephropathy (Type 2 Diabetes)",
    icd10: "E11.65",
    category: "renal",
    definition: "Progressive kidney disease caused by diabetes mellitus affecting glomerular microvasculature",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys", "heart"],
    pathophysiology: {
      mechanism: "Hyperglycemia → AGE formation → mesangial expansion → nodular glomerulosclerosis → proteinuria → CKD",
      molecularBasis: "Kimmelstiel-Wilson nodules, GBM thickening, podocyte injury, TGF-β activation"
    },
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic early",
        "Foamy urine (proteinuria)",
        "Edema",
        "Progressive fatigue"
      ],
      signs: [
        "Hypertension",
        "Diabetic retinopathy (often concurrent)",
        "Peripheral edema"
      ]
    },
    laboratoryFindings: [
      { name: "Urine albumin-to-creatinine ratio", normalRange: "<30 mg/g", abnormalInDisease: "≥30 mg/g (microalbuminuria to macroalbuminuria)" },
      { name: "eGFR", normalRange: "≥90 mL/min", abnormalInDisease: "Progressively declining" },
      { name: "HbA1c", normalRange: "<5.7%", abnormalInDisease: "Elevated (poor glucose control)" }
    ],
    imagingFindings: {
      ultrasound: ["Initially enlarged kidneys", "Later small and scarred"]
    },
    severity: {
      mild: { description: "Microalbuminuria (30-300 mg/g), normal GFR" },
      moderate: { description: "Macroalbuminuria (>300 mg/g), GFR declining" },
      severe: { description: "Nephrotic-range proteinuria, GFR <30" }
    }
  },

  // =====================
  // HYPERTENSIVE NEPHROPATHY
  // =====================

  I12_9: {
    name: "Hypertensive Chronic Kidney Disease",
    icd10: "I12.9",
    category: "renal",
    definition: "Chronic kidney disease caused by long-standing hypertension affecting renal vasculature",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys", "heart"],
    pathophysiology: {
      mechanism: "Chronic hypertension → arteriolar nephrosclerosis → ischemic nephron loss → CKD",
      molecularBasis: "Afferent arteriolar hyalinosis, intimal thickening, glomerulosclerosis"
    },
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic until advanced",
        "Fatigue",
        "Nocturia"
      ],
      signs: [
        "Hypertension (long-standing)",
        "Signs of hypertensive end-organ damage (retinopathy, LVH)"
      ]
    },
    laboratoryFindings: [
      { name: "eGFR", normalRange: "≥90 mL/min", abnormalInDisease: "Gradually declining" },
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Mild proteinuria (usually <1g/day)" },
      { name: "Serum Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      ultrasound: ["Bilaterally small kidneys", "Increased echogenicity"]
    },
    severity: {
      mild: { description: "CKD Stage 1-2" },
      moderate: { description: "CKD Stage 3" },
      severe: { description: "CKD Stage 4-5" }
    }
  },

  // =====================
  // URINARY TRACT INFECTIONS
  // ICD-10: N10, N30, N39 Series
  // =====================

  N10: {
    name: "Acute Pyelonephritis",
    icd10: "N10",
    category: "renal",
    definition: "Bacterial infection of the kidney parenchyma and renal pelvis",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys"],
    pathophysiology: {
      mechanism: "Ascending bacterial infection from bladder → renal pelvis and parenchyma → inflammation and suppuration",
      molecularBasis: "E. coli (most common), Klebsiella, Proteus; P-fimbriae adherence to uroepithelium"
    },
    clinicalPresentation: {
      symptoms: [
        "Fever and chills",
        "Flank pain (unilateral typically)",
        "Nausea and vomiting",
        "Dysuria, frequency, urgency",
        "Malaise"
      ],
      signs: [
        "Fever (often high)",
        "Costovertebral angle tenderness (classic)",
        "Tachycardia",
        "May have sepsis signs"
      ]
    },
    laboratoryFindings: [
      { name: "WBC count", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Elevated (leukocytosis with left shift)" },
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Pyuria, bacteriuria, WBC casts (specific for pyelonephritis)" },
      { name: "Urine culture", normalRange: "No growth", abnormalInDisease: ">100,000 CFU/mL" },
      { name: "Blood cultures", normalRange: "No growth", abnormalInDisease: "May be positive (urosepsis)" },
      { name: "Procalcitonin", normalRange: "<0.5 ng/mL", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      ctScan: ["Striated nephrogram", "Perinephric fat stranding", "Focal hypodense areas", "Abscess if complicated"],
      ultrasound: ["Focal hypoechoic areas", "Hydronephrosis if obstructed"]
    },
    severity: {
      mild: { description: "Uncomplicated, outpatient treatment possible" },
      moderate: { description: "Requires IV antibiotics, hospitalization" },
      severe: { description: "Sepsis, abscess, emphysematous pyelonephritis" }
    }
  },

  N30_0: {
    name: "Acute Cystitis",
    icd10: "N30.0",
    category: "renal",
    definition: "Acute bacterial infection of the bladder",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys"],
    pathophysiology: {
      mechanism: "Bacterial ascent into bladder → mucosal inflammation → irritative symptoms",
      molecularBasis: "E. coli (80%), S. saprophyticus (young women); bacterial adherence factors"
    },
    clinicalPresentation: {
      symptoms: [
        "Dysuria (burning with urination)",
        "Urinary frequency",
        "Urinary urgency",
        "Suprapubic discomfort",
        "Hematuria (gross or microscopic)"
      ],
      signs: [
        "Suprapubic tenderness",
        "No fever (distinguishes from pyelonephritis)",
        "No CVA tenderness"
      ]
    },
    laboratoryFindings: [
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Pyuria, bacteriuria, hematuria, positive leukocyte esterase/nitrites" },
      { name: "Urine culture", normalRange: "No growth", abnormalInDisease: ">1000 CFU/mL (symptomatic)" },
      { name: "WBC count", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Usually normal in uncomplicated UTI" }
    ],
    imagingFindings: {
      imaging: ["Usually not indicated for uncomplicated cystitis"],
      ultrasound: ["Consider if recurrent or complicated"]
    },
    severity: {
      mild: { description: "Uncomplicated, responds to short-course antibiotics" },
      moderate: { description: "Recurrent or complicated (diabetes, pregnancy)" },
      severe: { description: "Catheter-associated, multidrug-resistant organism" }
    }
  },

  N39_0: {
    name: "Urinary Tract Infection, Site Not Specified",
    icd10: "N39.0",
    category: "renal",
    definition: "Urinary tract infection without specification of upper vs lower tract",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys"],
    pathophysiology: {
      mechanism: "Bacterial infection of urinary tract",
      molecularBasis: "Variable pathogens, most commonly E. coli"
    },
    clinicalPresentation: {
      symptoms: [
        "Dysuria",
        "Frequency",
        "Urgency",
        "Variable systemic symptoms"
      ],
      signs: [
        "Variable depending on location and severity"
      ]
    },
    laboratoryFindings: [
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Pyuria, bacteriuria" },
      { name: "Urine culture", normalRange: "No growth", abnormalInDisease: "Positive" }
    ],
    imagingFindings: {
      imaging: ["As clinically indicated"]
    },
    severity: {
      mild: { description: "Uncomplicated" },
      moderate: { description: "Complicated" },
      severe: { description: "Septic" }
    }
  },

  // =====================
  // NEPHROLITHIASIS
  // ICD-10: N20 Series
  // =====================

  N20_0: {
    name: "Calculus of Kidney (Nephrolithiasis)",
    icd10: "N20.0",
    category: "renal",
    definition: "Stone formation within the kidney (renal pelvis or calyces)",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys"],
    pathophysiology: {
      mechanism: "Supersaturation of urine with stone-forming substances → crystal nucleation → stone growth",
      molecularBasis: "Calcium oxalate (80%), calcium phosphate, uric acid, struvite, cystine"
    },
    clinicalPresentation: {
      symptoms: [
        "Severe colicky flank pain (renal colic)",
        "Pain radiating to groin/testicle/labia",
        "Nausea and vomiting",
        "Hematuria",
        "Restlessness (cannot find comfortable position)"
      ],
      signs: [
        "CVA tenderness",
        "Restlessness, writhing in pain",
        "Tachycardia",
        "Fever if infected (pyonephrosis)"
      ]
    },
    laboratoryFindings: [
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Hematuria (90%), crystals, pyuria if infected" },
      { name: "Serum Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "Elevated if obstructed" },
      { name: "Calcium", normalRange: "8.5-10.5 mg/dL", abnormalInDisease: "May be elevated (hypite stone formers)" },
      { name: "Uric acid", normalRange: "3.5-7.5 mg/dL", abnormalInDisease: "Elevated in uric acid stones" }
    ],
    imagingFindings: {
      ctScan: ["Non-contrast CT is gold standard", "Stone location, size, density", "Hydronephrosis"],
      ultrasound: ["Hydronephrosis", "Stone visualization (less sensitive)"],
      xray: ["Calcium stones visible", "Uric acid stones radiolucent"]
    },
    severity: {
      mild: { description: "Small stone (<5mm), likely to pass spontaneously" },
      moderate: { description: "Medium stone (5-10mm), may need intervention" },
      severe: { description: "Large stone (>10mm), infected, or causing AKI" }
    }
  },

  N20_1: {
    name: "Calculus of Ureter (Ureteral Stone)",
    icd10: "N20.1",
    category: "renal",
    definition: "Stone lodged in the ureter causing obstruction",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys"],
    pathophysiology: {
      mechanism: "Stone migration from kidney → lodges at ureteral narrowings → obstruction → proximal dilation",
      molecularBasis: "Common impaction sites: UPJ, crossing iliac vessels, UVJ"
    },
    clinicalPresentation: {
      symptoms: [
        "Severe colicky pain",
        "Pain location indicates stone level",
        "Hematuria",
        "Nausea, vomiting",
        "Urinary urgency/frequency (low stones)"
      ],
      signs: [
        "Flank tenderness",
        "Restlessness",
        "May have ileus"
      ]
    },
    laboratoryFindings: [
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Hematuria" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Elevated if infected" }
    ],
    imagingFindings: {
      ctScan: ["Stone location in ureter", "Proximal hydroureter/hydronephrosis", "Perinephric stranding"]
    },
    severity: {
      mild: { description: "Distal small stone, likely to pass" },
      moderate: { description: "Proximal or medium stone" },
      severe: { description: "Complete obstruction, infected (urologic emergency)" }
    }
  },

  // =====================
  // POLYCYSTIC KIDNEY DISEASE
  // ICD-10: Q61 Series
  // =====================

  Q61_2: {
    name: "Autosomal Dominant Polycystic Kidney Disease (ADPKD)",
    icd10: "Q61.2",
    category: "renal",
    definition: "Inherited disorder with progressive bilateral renal cyst formation leading to ESRD",
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys", "liver", "brain"],
    pathophysiology: {
      mechanism: "PKD1/PKD2 mutations → abnormal polycystin proteins → tubular cell proliferation and fluid secretion → cyst formation",
      molecularBasis: "Two-hit hypothesis: germline + somatic mutation → cyst development"
    },
    clinicalPresentation: {
      symptoms: [
        "Flank/abdominal pain",
        "Hematuria (cyst rupture)",
        "Early satiety (enlarged kidneys)",
        "Hypertension",
        "Family history of ADPKD or stroke"
      ],
      signs: [
        "Hypertension (early)",
        "Palpable, enlarged kidneys",
        "Hepatomegaly (liver cysts)"
      ]
    },
    laboratoryFindings: [
      { name: "eGFR", normalRange: "≥90 mL/min", abnormalInDisease: "Progressively declining over decades" },
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Hematuria (cyst rupture), mild proteinuria" },
      { name: "Genetic testing", normalRange: "N/A", abnormalInDisease: "PKD1 or PKD2 mutations" }
    ],
    imagingFindings: {
      ultrasound: ["Multiple bilateral renal cysts", "Enlarged kidneys", "Liver cysts"],
      mri: ["Total kidney volume (TKV) for prognosis", "Cyst number and size"]
    },
    severity: {
      mild: { description: "Cysts present, normal GFR" },
      moderate: { description: "GFR declining, TKV >1500 mL" },
      severe: { description: "ESRD, requires RRT" }
    }
  }
};

export default RENAL_DISEASES;
