// Disease Models - How conditions modify organ parameters and equations
// Each disease affects multiple parameters across multiple organs
// Includes clinical presentation, progression stages, and detection methods

export const DISEASE_MODELS = {
  // CARDIAC DISEASES
  hypertrophic_cardiomyopathy: {
    name: "Hypertrophic Cardiomyopathy",
    icd10: "I42.1",
    category: "cardiac",
    description: "Genetic disorder causing abnormal myocardial thickening",
    
    // Primary organ affected
    primaryOrgan: "heart",
    
    // All organs affected
    affectedOrgans: ["heart", "lungs"],
    
    // Disease progression stages
    progression: [
      { stage: 1, name: "Subclinical", severity: 0.2, description: "Mild hypertrophy, asymptomatic", yearsFromOnset: "0-5" },
      { stage: 2, name: "Symptomatic", severity: 0.4, description: "Dyspnea on exertion, chest pain", yearsFromOnset: "5-15" },
      { stage: 3, name: "Advanced", severity: 0.7, description: "Heart failure symptoms, arrhythmias", yearsFromOnset: "15-25" },
      { stage: 4, name: "End-stage", severity: 1.0, description: "Refractory HF or SCD risk", yearsFromOnset: ">25" }
    ],
    
    // Clinical presentation for AI panel
    clinicalPresentation: {
      symptoms: [
        "Dyspnea on exertion",
        "Chest pain (angina-like)",
        "Palpitations",
        "Syncope or presyncope",
        "Fatigue",
        "Orthopnea in advanced cases"
      ],
      labTests: [
        { name: "BNP/NT-proBNP", value: "Elevated (>100 pg/mL)", significance: "Heart strain/failure marker" },
        { name: "Troponin", value: "May be mildly elevated", significance: "Myocardial stress" },
        { name: "Genetic testing", value: "MYH7, MYBPC3 mutations", significance: "Confirm diagnosis, family screening" },
        { name: "CBC", value: "Usually normal", significance: "Rule out anemia" }
      ],
      imaging: [
        { type: "Echocardiogram", findings: "Wall thickness ≥15mm, SAM, LVOT obstruction, diastolic dysfunction" },
        { type: "Cardiac MRI", findings: "LGE (fibrosis), precise wall measurements, apical variants" },
        { type: "ECG", findings: "LVH voltage criteria, T-wave inversions, Q waves" }
      ],
      treatments: [
        { category: "Medications", items: ["Beta-blockers (first-line)", "Verapamil/Diltiazem", "Disopyramide for obstruction", "Mavacamten (new)"] },
        { category: "Procedures", items: ["Septal myectomy", "Alcohol septal ablation", "ICD for SCD prevention"] },
        { category: "Lifestyle", items: ["Avoid competitive sports", "Avoid dehydration", "Genetic counseling for family"] }
      ]
    },
    
    // Parameter modifications by organ and scale
    modifications: {
      heart: {
        geometry: {
          lv_wall_thickness: { multiplier: 1.8, absolute: null, note: "Asymmetric septal hypertrophy" },
          ivs_thickness: { multiplier: 2.0, absolute: null, note: "Often >15mm" },
          lv_edv: { multiplier: 0.7, absolute: null, note: "Reduced cavity size" },
          lv_mass: { multiplier: 1.5, absolute: null, note: "Increased muscle mass" },
        },
        pressures: {
          lv_edp: { multiplier: 2.0, absolute: null, note: "Diastolic dysfunction" },
          aortic_gradient: { multiplier: 8.0, absolute: null, note: "LVOT obstruction if SAM present" },
          la_pressure: { multiplier: 1.5, absolute: null, note: "Elevated filling pressures" },
          pcwp: { multiplier: 1.5, absolute: null, note: "Elevated from LV dysfunction" },
          pa_sys: { multiplier: 1.3, absolute: null, note: "Secondary pulmonary HTN" },
        },
        structure: {
          myocyte_density: { multiplier: 1.2, absolute: null, note: "Hypertrophied cells" },
          collagen_fraction: { multiplier: 2.5, absolute: null, note: "Interstitial fibrosis" },
          fibrosis_percent: { multiplier: 5.0, absolute: null, note: "Replacement fibrosis" },
          fiber_angle_endo: { multiplier: null, absolute: 45, note: "Disarray" },
        },
        physiology: {
          ef: { multiplier: 1.1, absolute: null, note: "Often preserved or supranormal" },
          e_a_ratio: { multiplier: 0.6, absolute: null, note: "Grade I diastolic dysfunction" },
          e_e_prime: { multiplier: 1.8, absolute: null, note: "Elevated filling pressure" },
          gls: { multiplier: 0.75, absolute: null, note: "Reduced longitudinal strain" },
        },
        cellular: {
          sarcomere_length: { multiplier: 1.1, absolute: null, note: "Altered sarcomere" },
          atp_concentration: { multiplier: 0.85, absolute: null, note: "Energy deficiency" },
          calcium_transient: { multiplier: 1.3, absolute: null, note: "Abnormal Ca handling" },
        }
      },
      lungs: {
        physiology: {
          vq_ratio: { multiplier: 0.9, absolute: null, note: "Mild V/Q mismatch from congestion" },
        }
      }
    },

    // Novel equations created/modified for this disease
    novelEquations: [
      {
        id: "lvot_gradient",
        name: "LVOT Gradient (SAM)",
        latex: "\\Delta P_{LVOT} = \\frac{4v_{LVOT}^2 \\times f_{SAM}(t_{septal})}{1}",
        description: "Dynamic obstruction from SAM of mitral valve",
        evidence: "novel",
        source: "Bernoulli modified for dynamic obstruction"
      },
      {
        id: "hcm_wall_stress",
        name: "HCM Wall Stress",
        latex: "\\sigma_{HCM} = \\frac{P \\times r}{2h_{hypertrophied}} \\times (1 + f_{fibrosis})",
        description: "Wall stress accounting for hypertrophy and fibrosis",
        evidence: "novel",
        source: "Modified Laplace"
      },
      {
        id: "diastolic_dysfunction_hcm",
        name: "Diastolic Function (HCM)",
        latex: "\\tau = \\tau_0 \\times (1 + \\alpha \\cdot h_{wall}) \\times (1 + \\beta \\cdot f_{fibrosis})",
        description: "Relaxation time constant with hypertrophy",
        evidence: "novel",
        source: "Multi-factor tau model"
      }
    ],

    severity: {
      mild: { lv_wall_thickness_multiplier: 1.3, description: "Wall 13-15mm" },
      moderate: { lv_wall_thickness_multiplier: 1.6, description: "Wall 15-20mm" },
      severe: { lv_wall_thickness_multiplier: 2.0, description: "Wall >20mm, obstruction" }
    }
  },

  dilated_cardiomyopathy: {
    name: "Dilated Cardiomyopathy",
    icd10: "I42.0",
    category: "cardiac",
    description: "LV dilation with systolic dysfunction",
    
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "lungs", "kidneys", "liver"],
    
    modifications: {
      heart: {
        geometry: {
          lv_edv: { multiplier: 1.8, absolute: null, note: "Severe dilation" },
          lv_esv: { multiplier: 2.5, absolute: null, note: "More severely increased" },
          lv_wall_thickness: { multiplier: 0.8, absolute: null, note: "Relative wall thinning" },
          lv_mass: { multiplier: 1.4, absolute: null, note: "Eccentric hypertrophy" },
          la_volume: { multiplier: 1.6, absolute: null, note: "LA dilation" },
        },
        pressures: {
          lv_edp: { multiplier: 2.5, absolute: null, note: "Severely elevated" },
          la_pressure: { multiplier: 2.0, absolute: null, note: "Elevated" },
          pcwp: { multiplier: 2.0, absolute: null, note: "Congestion" },
        },
        structure: {
          collagen_fraction: { multiplier: 2.0, absolute: null, note: "Fibrosis" },
          myocyte_density: { multiplier: 0.7, absolute: null, note: "Myocyte loss" },
          capillary_density: { multiplier: 0.8, absolute: null, note: "Reduced" },
        },
        physiology: {
          ef: { multiplier: 0.5, absolute: null, note: "Reduced to ~30%" },
          cardiac_output: { multiplier: 0.6, absolute: null, note: "Low output" },
          gls: { multiplier: 0.5, absolute: null, note: "Severely reduced" },
          e_e_prime: { multiplier: 2.5, absolute: null, note: "High filling pressure" },
        },
        cellular: {
          calcium_transient: { multiplier: 0.6, absolute: null, note: "Impaired" },
          atp_concentration: { multiplier: 0.7, absolute: null, note: "Energy depletion" },
          crossbridge_cycling: { multiplier: 0.7, absolute: null, note: "Slowed" },
        }
      },
      lungs: {
        pressures: {
          pcwp: { multiplier: 2.0, absolute: null, note: "Pulmonary congestion" },
          pa_sys: { multiplier: 1.5, absolute: null, note: "Pulmonary HTN" },
        },
        physiology: {
          vq_ratio: { multiplier: 0.8, absolute: null, note: "V/Q mismatch" },
        }
      },
      kidneys: {
        physiology: {
          gfr: { multiplier: 0.7, absolute: null, note: "Cardiorenal syndrome" },
          rbf: { multiplier: 0.6, absolute: null, note: "Reduced perfusion" },
        },
        pressures: {
          glomerular_cap_p: { multiplier: 0.8, absolute: null, note: "Reduced filtration pressure" },
        }
      },
      liver: {
        physiology: {
          hepatic_blood_flow: { multiplier: 0.7, absolute: null, note: "Congestive hepatopathy" },
          alt: { multiplier: 1.5, absolute: null, note: "Hepatic congestion" },
          bilirubin: { multiplier: 1.8, absolute: null, note: "Elevated" },
        }
      }
    },

    novelEquations: [
      {
        id: "dcm_remodeling",
        name: "DCM Remodeling Index",
        latex: "RI = \\frac{EDV/EDV_{normal}}{EF/EF_{normal}} \\times \\frac{h_{wall}}{h_{normal}}",
        description: "Quantifies adverse remodeling",
        evidence: "novel"
      },
      {
        id: "cardiorenal_coupling",
        name: "Cardiorenal Coupling",
        latex: "GFR = GFR_0 \\times (1 - k \\cdot \\frac{CVP}{CVP_0}) \\times \\frac{CO}{CO_0}",
        description: "GFR depends on both CO and venous congestion",
        evidence: "novel"
      }
    ],

    severity: {
      mild: { ef_multiplier: 0.7, description: "EF 40-50%, mild symptoms" },
      moderate: { ef_multiplier: 0.5, description: "EF 30-40%, moderate symptoms" },
      severe: { ef_multiplier: 0.35, description: "EF <30%, severe HF" }
    }
  },

  // DIABETES
  type2_diabetes: {
    name: "Type 2 Diabetes Mellitus",
    icd10: "E11",
    category: "metabolic",
    description: "Insulin resistance with progressive β-cell failure",
    
    primaryOrgan: "pancreas",
    affectedOrgans: ["pancreas", "kidneys", "heart", "liver", "brain"],
    
    // Multi-organ disease progression
    progression: [
      { stage: 1, name: "Prediabetes", severity: 0.15, description: "Insulin resistance, normal glucose", yearsFromOnset: "-5 to 0", affectedOrgans: ["pancreas"] },
      { stage: 2, name: "Early DM", severity: 0.3, description: "β-cell compensation failing", yearsFromOnset: "0-5", affectedOrgans: ["pancreas", "liver"] },
      { stage: 3, name: "Established", severity: 0.5, description: "Requires medication, early complications", yearsFromOnset: "5-10", affectedOrgans: ["pancreas", "liver", "kidneys", "heart"] },
      { stage: 4, name: "Complications", severity: 0.75, description: "Nephropathy, retinopathy, neuropathy", yearsFromOnset: "10-20", affectedOrgans: ["pancreas", "kidneys", "heart", "brain"] },
      { stage: 5, name: "End-organ failure", severity: 1.0, description: "ESRD, cardiovascular events, blindness", yearsFromOnset: ">20", affectedOrgans: ["pancreas", "kidneys", "heart", "liver", "brain"] }
    ],
    
    clinicalPresentation: {
      symptoms: [
        "Polyuria (frequent urination)",
        "Polydipsia (excessive thirst)",
        "Fatigue and weakness",
        "Blurred vision",
        "Slow wound healing",
        "Numbness/tingling in extremities (late)",
        "Weight loss despite increased appetite"
      ],
      labTests: [
        { name: "Fasting Glucose", value: "≥126 mg/dL", significance: "Diagnostic criterion" },
        { name: "HbA1c", value: "≥6.5%", significance: "3-month glucose average, diagnostic" },
        { name: "OGTT", value: "2hr ≥200 mg/dL", significance: "Alternative diagnosis" },
        { name: "C-peptide", value: "Normal or elevated early", significance: "Distinguishes from Type 1" },
        { name: "Fasting Insulin", value: "Elevated", significance: "Insulin resistance" },
        { name: "Lipid Panel", value: "↑TG, ↓HDL", significance: "Metabolic syndrome" },
        { name: "eGFR/Cr", value: "Monitor annually", significance: "Diabetic nephropathy screening" },
        { name: "Urine Albumin:Cr", value: "<30 mg/g normal", significance: "Early nephropathy detection" }
      ],
      imaging: [
        { type: "Retinal exam", findings: "Microaneurysms, hemorrhages, exudates (retinopathy)" },
        { type: "Ankle-brachial index", findings: "<0.9 indicates PAD" },
        { type: "Echocardiogram", findings: "Diastolic dysfunction, LVH" },
        { type: "Renal ultrasound", findings: "Increased echogenicity, size changes" }
      ],
      treatments: [
        { category: "First-line", items: ["Metformin", "Lifestyle modification (diet, exercise)"] },
        { category: "Second-line", items: ["SGLT2 inhibitors (cardio/renal protection)", "GLP-1 agonists (weight loss)", "DPP-4 inhibitors"] },
        { category: "Advanced", items: ["Insulin therapy", "Combination regimens"] },
        { category: "Complications management", items: ["ACE-I/ARB for nephropathy", "Statins for CVD risk", "Podiatry care", "Regular eye exams"] }
      ]
    },
    
    modifications: {
      pancreas: {
        geometry: {
          beta_cell_mass: { multiplier: 0.5, absolute: null, note: "Progressive loss" },
          islet_count: { multiplier: 0.7, absolute: null, note: "Islet loss" },
        },
        physiology: {
          fasting_glucose: { multiplier: 1.5, absolute: null, note: "Elevated >126 mg/dL" },
          fasting_insulin: { multiplier: 1.5, absolute: null, note: "Initially elevated, then falls" },
          hba1c: { multiplier: 1.4, absolute: null, note: "Elevated >6.5%" },
          homa_ir: { multiplier: 3.0, absolute: null, note: "Insulin resistance" },
          homa_b: { multiplier: 0.5, absolute: null, note: "β-cell dysfunction" },
          insulin_secretion: { multiplier: 0.4, absolute: null, note: "Lost first phase" },
        },
        cellular: {
          atp_adp_ratio: { multiplier: 0.7, absolute: null, note: "Glucotoxicity" },
          glut2_expression: { multiplier: 0.6, absolute: null, note: "Downregulated" },
        }
      },
      kidneys: {
        physiology: {
          gfr: { multiplier: 0.7, absolute: null, note: "Diabetic nephropathy" },
          sodium_excretion: { multiplier: 0.8, absolute: null, note: "Sodium retention" },
        },
        cellular: {
          podocyte_count: { multiplier: 0.6, absolute: null, note: "Podocyte loss" },
        }
      },
      heart: {
        structure: {
          collagen_fraction: { multiplier: 1.5, absolute: null, note: "Diabetic cardiomyopathy" },
        },
        physiology: {
          e_a_ratio: { multiplier: 0.7, absolute: null, note: "Diastolic dysfunction" },
        },
        geometry: {
          lv_mass: { multiplier: 1.2, absolute: null, note: "LVH" },
        }
      },
      liver: {
        physiology: {
          alt: { multiplier: 1.3, absolute: null, note: "NAFLD" },
        },
        cellular: {
          glycogen_stores: { multiplier: 1.3, absolute: null, note: "Increased" },
        }
      },
      brain: {
        physiology: {
          cbf: { multiplier: 0.9, absolute: null, note: "Reduced perfusion" },
          glucose_consumption: { multiplier: 0.85, absolute: null, note: "Impaired uptake" },
        }
      }
    },

    novelEquations: [
      {
        id: "disposition_index_dm",
        name: "Disposition Index in DM",
        latex: "DI = S_I \\times AIR_g \\times f_{\\beta-cell}(t_{disease})",
        description: "DI declines as β-cells fail despite rising SI",
        evidence: "novel"
      },
      {
        id: "glucose_toxicity",
        name: "Glucotoxicity Model",
        latex: "\\frac{dM_{\\beta}}{dt} = -k_{tox} \\times (G - G_{threshold})_{+}^2 \\times M_{\\beta}",
        description: "β-cell mass loss from chronic hyperglycemia",
        evidence: "novel"
      },
      {
        id: "diabetic_nephropathy",
        name: "Diabetic Nephropathy Progression",
        latex: "GFR(t) = GFR_0 \\times e^{-\\lambda \\cdot HbA1c \\cdot t}",
        description: "GFR decline related to glycemic control",
        evidence: "novel"
      }
    ],

    severity: {
      mild: { hba1c_value: 7.0, description: "HbA1c 6.5-7.5%, early disease" },
      moderate: { hba1c_value: 8.5, description: "HbA1c 7.5-9%, complications developing" },
      severe: { hba1c_value: 10.0, description: "HbA1c >9%, end-organ damage" }
    }
  },

  // RENAL DISEASES
  chronic_kidney_disease: {
    name: "Chronic Kidney Disease",
    category: "renal",
    description: "Progressive loss of kidney function",
    
    primaryOrgan: "kidneys",
    affectedOrgans: ["kidneys", "heart", "brain", "pancreas"],
    
    modifications: {
      kidneys: {
        geometry: {
          kidney_length: { multiplier: 0.85, absolute: null, note: "Atrophic" },
          nephron_count: { multiplier: 0.4, absolute: null, note: "Nephron loss" },
          cortex_thickness: { multiplier: 0.7, absolute: null, note: "Cortical thinning" },
          filtration_surface: { multiplier: 0.4, absolute: null, note: "Reduced" },
        },
        pressures: {
          glomerular_cap_p: { multiplier: 1.3, absolute: null, note: "Hyperfiltration in remaining nephrons" },
        },
        physiology: {
          gfr: { multiplier: 0.3, absolute: null, note: "Stage 4: 15-30 mL/min" },
          rbf: { multiplier: 0.4, absolute: null, note: "Reduced" },
          creatinine: { multiplier: 3.0, absolute: null, note: "Elevated" },
          bun: { multiplier: 3.0, absolute: null, note: "Uremia" },
          urine_output: { multiplier: 0.7, absolute: null, note: "Initially preserved" },
        },
        cellular: {
          podocyte_count: { multiplier: 0.4, absolute: null, note: "Severe loss" },
          na_k_atpase: { multiplier: 0.6, absolute: null, note: "Reduced" },
          renin_activity: { multiplier: 2.0, absolute: null, note: "RAAS activation" },
        }
      },
      heart: {
        geometry: {
          lv_mass: { multiplier: 1.4, absolute: null, note: "Uremic cardiomyopathy" },
          lv_wall_thickness: { multiplier: 1.2, absolute: null, note: "LVH" },
        },
        physiology: {
          cardiac_output: { multiplier: 1.1, absolute: null, note: "Initially high output" },
        },
        structure: {
          collagen_fraction: { multiplier: 1.8, absolute: null, note: "Myocardial fibrosis" },
        },
        pressures: {
          lv_sys_p: { multiplier: 1.2, absolute: null, note: "Hypertension" },
        }
      },
      brain: {
        physiology: {
          cbf: { multiplier: 0.85, absolute: null, note: "Reduced" },
        }
      },
      pancreas: {
        physiology: {
          fasting_glucose: { multiplier: 1.1, absolute: null, note: "Uremic glucose intolerance" },
        }
      }
    },

    novelEquations: [
      {
        id: "nephron_hyperfiltration",
        name: "Single Nephron Hyperfiltration",
        latex: "SNGFR = \\frac{GFR_{total}}{N_{nephron}} = \\frac{GFR_0 \\times f_{function}}{N_0 \\times f_{survival}}",
        description: "Remaining nephrons hyperfiltrate",
        evidence: "novel"
      },
      {
        id: "ckd_progression",
        name: "CKD Progression Model",
        latex: "\\frac{dGFR}{dt} = -k_{base} - k_{HTN}(MAP-90)_{+} - k_{prot}(Proteinuria) - k_{DM}(HbA1c-6)",
        description: "Multi-factor GFR decline",
        evidence: "novel"
      },
      {
        id: "uremic_toxin",
        name: "Uremic Toxin Accumulation",
        latex: "[Toxin] = \\frac{Production}{GFR \\times k_{clear}} \\times (1 - f_{dialysis})",
        description: "Toxin levels inversely related to GFR",
        evidence: "novel"
      }
    ],

    severity: {
      mild: { gfr_multiplier: 0.6, description: "Stage 3a: GFR 45-60" },
      moderate: { gfr_multiplier: 0.35, description: "Stage 3b-4: GFR 15-45" },
      severe: { gfr_multiplier: 0.1, description: "Stage 5: GFR <15" }
    }
  },

  // LIVER DISEASES
  cirrhosis: {
    name: "Liver Cirrhosis",
    category: "hepatic",
    description: "End-stage liver fibrosis with nodular regeneration",
    
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "kidneys", "brain", "heart"],
    
    modifications: {
      liver: {
        geometry: {
          liver_volume: { multiplier: 0.8, absolute: null, note: "Atrophic (or enlarged early)" },
          hepatocyte_count: { multiplier: 0.4, absolute: null, note: "Massive loss" },
        },
        physiology: {
          hepatic_blood_flow: { multiplier: 0.5, absolute: null, note: "Intrahepatic shunting" },
          portal_flow: { multiplier: 0.6, absolute: null, note: "Portal HTN" },
          albumin_synthesis: { multiplier: 0.4, absolute: null, note: "Reduced" },
          alt: { multiplier: 2.0, absolute: null, note: "May be elevated or burnt out" },
          albumin: { multiplier: 0.6, absolute: null, note: "Hypoalbuminemia" },
          bilirubin: { multiplier: 4.0, absolute: null, note: "Jaundice" },
          inr: { multiplier: 2.0, absolute: null, note: "Coagulopathy" },
        },
        cellular: {
          cyp3a4: { multiplier: 0.3, absolute: null, note: "Reduced metabolism" },
          glycogen_stores: { multiplier: 0.5, absolute: null, note: "Depleted" },
          kupffer_cells: { multiplier: 0.6, absolute: null, note: "Dysfunction" },
        }
      },
      kidneys: {
        physiology: {
          gfr: { multiplier: 0.5, absolute: null, note: "Hepatorenal syndrome risk" },
          rbf: { multiplier: 0.6, absolute: null, note: "Renal vasoconstriction" },
        },
        pressures: {
          glomerular_cap_p: { multiplier: 0.8, absolute: null, note: "Reduced" },
        }
      },
      brain: {
        physiology: {
          cbf: { multiplier: 0.9, absolute: null, note: "Hepatic encephalopathy" },
        },
        cellular: {
          glutamate: { multiplier: 0.8, absolute: null, note: "Altered neurotransmission" },
        }
      },
      heart: {
        physiology: {
          cardiac_output: { multiplier: 1.3, absolute: null, note: "Hyperdynamic circulation" },
        },
        pressures: {
          lv_sys_p: { multiplier: 0.85, absolute: null, note: "Systemic vasodilation" },
        }
      }
    },

    novelEquations: [
      {
        id: "portal_pressure",
        name: "Portal Pressure Gradient",
        latex: "HVPG = P_{wedged} - P_{free} = Q_{portal} \\times R_{intrahepatic}",
        description: "Hepatic venous pressure gradient",
        evidence: "established"
      },
      {
        id: "child_pugh_continuous",
        name: "Continuous Child-Pugh",
        latex: "CP_{score} = f(Bili) + f(Alb) + f(INR) + f(Ascites) + f(HE)",
        description: "Continuous liver function score",
        evidence: "novel"
      },
      {
        id: "hepatorenal_model",
        name: "Hepatorenal Syndrome Model",
        latex: "GFR_{HRS} = GFR_0 \\times \\frac{[NO]_{systemic}}{[NO]_0} \\times \\frac{[ET-1]_0}{[ET-1]_{renal}}",
        description: "GFR from NO/endothelin imbalance",
        evidence: "novel"
      }
    ],

    severity: {
      mild: { child_pugh: "A", description: "Compensated, Child-Pugh A" },
      moderate: { child_pugh: "B", description: "Decompensating, Child-Pugh B" },
      severe: { child_pugh: "C", description: "Decompensated, Child-Pugh C" }
    }
  },

  // ACUTE CONDITIONS
  sepsis: {
    name: "Sepsis",
    category: "acute",
    description: "Life-threatening organ dysfunction from dysregulated host response",
    
    primaryOrgan: "heart", // Cardiovascular is first affected
    affectedOrgans: ["heart", "lungs", "kidneys", "liver", "brain"],
    
    modifications: {
      heart: {
        physiology: {
          cardiac_output: { multiplier: 1.4, absolute: null, note: "Hyperdynamic early" },
          ef: { multiplier: 0.8, absolute: null, note: "Septic cardiomyopathy" },
        },
        pressures: {
          lv_sys_p: { multiplier: 0.7, absolute: null, note: "Vasodilatory shock" },
        },
        cellular: {
          atp_concentration: { multiplier: 0.7, absolute: null, note: "Mitochondrial dysfunction" },
        }
      },
      lungs: {
        physiology: {
          vq_ratio: { multiplier: 0.5, absolute: null, note: "Severe V/Q mismatch" },
          spo2: { multiplier: 0.88, absolute: null, note: "Hypoxemia" },
        },
        pressures: {
          pao2: { multiplier: 0.6, absolute: null, note: "ARDS" },
        },
        geometry: {
          alveolar_surface: { multiplier: 0.7, absolute: null, note: "Atelectasis, edema" },
        }
      },
      kidneys: {
        physiology: {
          gfr: { multiplier: 0.4, absolute: null, note: "AKI" },
          urine_output: { multiplier: 0.3, absolute: null, note: "Oliguria" },
        }
      },
      liver: {
        physiology: {
          alt: { multiplier: 3.0, absolute: null, note: "Shock liver" },
          bilirubin: { multiplier: 3.0, absolute: null, note: "Cholestasis" },
        },
        cellular: {
          cyp3a4: { multiplier: 0.4, absolute: null, note: "Reduced clearance" },
        }
      },
      brain: {
        physiology: {
          cbf: { multiplier: 0.8, absolute: null, note: "Cerebral hypoperfusion" },
        },
        pressures: {
          cpp: { multiplier: 0.7, absolute: null, note: "Reduced" },
        }
      }
    },

    novelEquations: [
      {
        id: "sofa_continuous",
        name: "Continuous SOFA Model",
        latex: "SOFA = \\sum_{organs} f(dysfunction_i) = f(PaO_2) + f(Plt) + f(Bili) + f(MAP) + f(GCS) + f(Cr)",
        description: "Sequential organ failure assessment",
        evidence: "established"
      },
      {
        id: "sepsis_svr",
        name: "Septic Vasodilation",
        latex: "SVR_{sepsis} = SVR_0 \\times (1 - k_{NO} \\cdot [iNOS]) \\times (1 - k_{cytokine} \\cdot [IL-6])",
        description: "SVR drop from NO and cytokines",
        evidence: "novel"
      },
      {
        id: "microcirculation",
        name: "Microcirculatory Dysfunction",
        latex: "DO_2^{eff} = DO_2 \\times f_{heterogeneity} \\times f_{glycocalyx}",
        description: "Effective O2 delivery with microvascular dysfunction",
        evidence: "novel"
      }
    ],

    severity: {
      mild: { sofa_delta: 2, description: "SOFA increase ≥2, no shock" },
      moderate: { sofa_delta: 4, description: "Septic shock, lactate 2-4" },
      severe: { sofa_delta: 8, description: "Refractory shock, lactate >4" }
    }
  },

  acute_mi: {
    name: "Acute Myocardial Infarction",
    category: "acute",
    description: "Acute coronary occlusion with myocardial necrosis",
    
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "kidneys", "lungs"],
    
    modifications: {
      heart: {
        geometry: {
          lv_wall_thickness: { multiplier: 0.8, absolute: null, note: "Infarct zone thinning" },
        },
        pressures: {
          lv_edp: { multiplier: 2.0, absolute: null, note: "Diastolic dysfunction" },
          dp_dt: { multiplier: 0.6, absolute: null, note: "Reduced contractility" },
        },
        structure: {
          myocyte_density: { multiplier: 0.7, absolute: null, note: "Necrosis in infarct zone" },
          collagen_fraction: { multiplier: 2.0, absolute: null, note: "Scar formation" },
        },
        physiology: {
          ef: { multiplier: 0.65, absolute: null, note: "Reduced" },
          cardiac_output: { multiplier: 0.7, absolute: null, note: "Pump failure" },
          gls: { multiplier: 0.6, absolute: null, note: "Regional wall motion abnormality" },
        },
        cellular: {
          atp_concentration: { multiplier: 0.5, absolute: null, note: "Ischemia" },
          calcium_transient: { multiplier: 0.6, absolute: null, note: "Impaired" },
        }
      },
      kidneys: {
        physiology: {
          gfr: { multiplier: 0.8, absolute: null, note: "Cardiorenal" },
        }
      },
      lungs: {
        pressures: {
          pcwp: { multiplier: 1.8, absolute: null, note: "Pulmonary edema risk" },
        }
      }
    },

    novelEquations: [
      {
        id: "infarct_size",
        name: "Infarct Size Evolution",
        latex: "IS(t) = IS_{max} \\times (1 - e^{-t/\\tau_{necrosis}}) \\times (1 - f_{reperfusion})",
        description: "Infarct size with time and reperfusion effect",
        evidence: "novel"
      },
      {
        id: "regional_wall_motion",
        name: "Regional Wall Motion Score",
        latex: "RWMA = \\sum_{segments} \\frac{\\Delta thickness_i}{thickness_{normal,i}}",
        description: "Wall motion abnormality index",
        evidence: "novel"
      },
      {
        id: "remodeling_index_mi",
        name: "Post-MI Remodeling",
        latex: "\\frac{dEDV}{dt} = k_{infarct} \\times IS - k_{therapy} \\times [ACEi] - k_{healing}",
        description: "LV remodeling post-MI",
        evidence: "novel"
      }
    ],

    severity: {
      mild: { infarct_size: 10, description: "<10% LV, preserved EF" },
      moderate: { infarct_size: 20, description: "10-20% LV, mild dysfunction" },
      severe: { infarct_size: 35, description: ">20% LV, cardiogenic shock risk" }
    }
  },

  // HYPERTENSION - Most common cardiovascular condition
  hypertension: {
    name: "Essential Hypertension",
    icd10: "I10",
    category: "cardiac",
    description: "Persistently elevated blood pressure causing end-organ damage",
    
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "kidneys", "brain"],
    
    progression: [
      { stage: 1, name: "Elevated BP", severity: 0.2, description: "120-129/<80 mmHg", yearsFromOnset: "0-5" },
      { stage: 2, name: "Stage 1 HTN", severity: 0.4, description: "130-139/80-89 mmHg", yearsFromOnset: "5-15" },
      { stage: 3, name: "Stage 2 HTN", severity: 0.7, description: "≥140/90 mmHg", yearsFromOnset: "15-25" },
      { stage: 4, name: "HTN with TOD", severity: 1.0, description: "Target organ damage", yearsFromOnset: ">25" }
    ],
    
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic (silent killer)",
        "Headaches (severe HTN)",
        "Visual changes",
        "Chest pain",
        "Dyspnea",
        "Epistaxis (nosebleeds)"
      ],
      labTests: [
        { name: "Basic Metabolic Panel", value: "Check K+, Cr, eGFR", significance: "Kidney function, electrolytes" },
        { name: "Lipid Panel", value: "Total/LDL/HDL cholesterol", significance: "CV risk assessment" },
        { name: "Urinalysis", value: "Protein, microalbumin", significance: "Nephropathy screening" },
        { name: "Glucose/HbA1c", value: "Screen for DM", significance: "Comorbidity" },
        { name: "Aldosterone/Renin", value: "If refractory", significance: "Secondary HTN workup" }
      ],
      imaging: [
        { type: "ECG", findings: "LVH (voltage criteria, strain pattern)" },
        { type: "Echocardiogram", findings: "LV mass index, diastolic function" },
        { type: "Renal ultrasound", findings: "Size asymmetry (renal artery stenosis)" },
        { type: "Fundoscopy", findings: "AV nicking, hemorrhages, papilledema" }
      ],
      treatments: [
        { category: "First-line", items: ["ACE inhibitors", "ARBs", "Calcium channel blockers", "Thiazide diuretics"] },
        { category: "Combination", items: ["ACEI + CCB", "ACEI + thiazide", "Triple therapy if needed"] },
        { category: "Lifestyle", items: ["DASH diet", "Sodium restriction <2g/day", "Weight loss", "Exercise 150 min/week", "Limit alcohol"] }
      ]
    },
    
    modifications: {
      heart: {
        geometry: {
          lv_mass: { multiplier: 1.4, absolute: null, note: "LV hypertrophy" },
          lv_wall_thickness: { multiplier: 1.3, absolute: null, note: "Concentric remodeling" },
          la_volume: { multiplier: 1.2, absolute: null, note: "LA dilation" },
        },
        pressures: {
          lv_sys_p: { multiplier: 1.3, absolute: null, note: "Increased afterload" },
          aortic_systolic: { multiplier: 1.3, absolute: null, note: "Elevated BP" },
          aortic_diastolic: { multiplier: 1.2, absolute: null, note: "Elevated DBP" },
        },
        physiology: {
          e_a_ratio: { multiplier: 0.7, absolute: null, note: "Diastolic dysfunction" },
          gls: { multiplier: 0.85, absolute: null, note: "Subclinical dysfunction" },
        },
        structure: {
          collagen_fraction: { multiplier: 1.5, absolute: null, note: "Myocardial fibrosis" },
        }
      },
      kidneys: {
        physiology: {
          gfr: { multiplier: 0.85, absolute: null, note: "Hypertensive nephrosclerosis" },
        },
        structure: {
          arteriolar_thickness: { multiplier: 1.5, absolute: null, note: "Arteriolosclerosis" },
        }
      },
      brain: {
        physiology: {
          cbf_autoregulation_upper: { multiplier: 1.2, absolute: null, note: "Shifted autoregulation" },
        }
      }
    },
    
    novelEquations: [
      {
        id: "map_calculation",
        name: "Mean Arterial Pressure",
        latex: "MAP = DBP + \\frac{1}{3}(SBP - DBP) = \\frac{SBP + 2 \\times DBP}{3}",
        description: "Average arterial pressure during cardiac cycle",
        evidence: "established",
        source: "Basic cardiovascular physiology"
      },
      {
        id: "lvh_progression",
        name: "LVH Progression Model",
        latex: "\\frac{dLVM}{dt} = k_{pressure} \\times (MAP - 93) - k_{therapy} \\times [RAAS_{block}]",
        description: "LV mass increase from pressure overload",
        evidence: "novel"
      }
    ],
    
    severity: {
      mild: { sbp: 130, description: "Stage 1: 130-139/80-89" },
      moderate: { sbp: 150, description: "Stage 2: 140-159/90-99" },
      severe: { sbp: 180, description: "Stage 2+: ≥160/≥100 or with TOD" }
    }
  },

  // HEART FAILURE
  heart_failure: {
    name: "Heart Failure (HFrEF)",
    icd10: "I50.2",
    category: "cardiac",
    description: "Inability of heart to meet metabolic demands, reduced ejection fraction",
    
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "lungs", "kidneys", "liver"],
    
    progression: [
      { stage: 1, name: "Stage A", severity: 0.1, description: "At risk, no symptoms", yearsFromOnset: "-" },
      { stage: 2, name: "Stage B", severity: 0.3, description: "Structural disease, no symptoms", yearsFromOnset: "0-5" },
      { stage: 3, name: "Stage C", severity: 0.6, description: "Symptomatic HF", yearsFromOnset: "5-10" },
      { stage: 4, name: "Stage D", severity: 1.0, description: "Refractory, advanced therapies", yearsFromOnset: ">10" }
    ],
    
    clinicalPresentation: {
      symptoms: [
        "Dyspnea on exertion → at rest",
        "Orthopnea (2+ pillows)",
        "Paroxysmal nocturnal dyspnea",
        "Lower extremity edema",
        "Fatigue and weakness",
        "Weight gain (fluid)",
        "Abdominal fullness (ascites)"
      ],
      labTests: [
        { name: "BNP", value: ">100 pg/mL (or NT-proBNP >300)", significance: "Diagnosis and prognosis" },
        { name: "Troponin", value: "May be elevated", significance: "Myocardial injury" },
        { name: "BMP", value: "Na+, K+, Cr, BUN", significance: "Cardiorenal syndrome" },
        { name: "CBC", value: "Check Hgb", significance: "Anemia worsens HF" },
        { name: "TSH", value: "Rule out thyroid", significance: "Reversible cause" },
        { name: "Iron studies", value: "Ferritin, TSAT", significance: "Iron deficiency common" }
      ],
      imaging: [
        { type: "Echocardiogram", findings: "EF <40%, chamber dilation, wall motion abnormalities" },
        { type: "Chest X-ray", findings: "Cardiomegaly, pulmonary edema, pleural effusion" },
        { type: "Cardiac MRI", findings: "Etiology, viability, fibrosis" },
        { type: "Coronary angiography", findings: "Rule out ischemic etiology" }
      ],
      treatments: [
        { category: "GDMT (Quadruple Therapy)", items: ["ARNI (sacubitril/valsartan) or ACEi/ARB", "Beta-blocker (metoprolol, carvedilol, bisoprolol)", "MRA (spironolactone, eplerenone)", "SGLT2i (dapagliflozin, empagliflozin)"] },
        { category: "Diuretics", items: ["Loop diuretics for congestion", "Thiazide for resistance"] },
        { category: "Device therapy", items: ["ICD if EF ≤35%", "CRT if LBBB and EF ≤35%"] },
        { category: "Advanced", items: ["LVAD", "Heart transplant"] }
      ]
    },
    
    modifications: {
      heart: {
        geometry: {
          lv_edv: { multiplier: 1.6, absolute: null, note: "LV dilation" },
          lv_esv: { multiplier: 2.2, absolute: null, note: "Systolic dysfunction" },
          la_volume: { multiplier: 1.5, absolute: null, note: "LA enlargement" },
        },
        physiology: {
          ef: { multiplier: 0.55, absolute: null, note: "Reduced to ~30-35%" },
          cardiac_output: { multiplier: 0.65, absolute: null, note: "Low output" },
          stroke_volume: { multiplier: 0.6, absolute: null, note: "Reduced" },
        },
        pressures: {
          lv_edp: { multiplier: 2.0, absolute: null, note: "Elevated filling pressure" },
          pcwp: { multiplier: 2.0, absolute: null, note: "Congestion" },
        },
        cellular: {
          bnp_release: { multiplier: 5.0, absolute: null, note: "Wall stress marker" },
          calcium_transient: { multiplier: 0.6, absolute: null, note: "Impaired contractility" },
        }
      },
      lungs: {
        pressures: {
          pa_sys: { multiplier: 1.5, absolute: null, note: "Pulmonary HTN" },
        },
        physiology: {
          dlco: { multiplier: 0.8, absolute: null, note: "Reduced from congestion" },
        }
      },
      kidneys: {
        physiology: {
          gfr: { multiplier: 0.7, absolute: null, note: "Type 2 cardiorenal syndrome" },
        }
      },
      liver: {
        physiology: {
          alt: { multiplier: 1.5, absolute: null, note: "Congestive hepatopathy" },
        }
      }
    },
    
    novelEquations: [
      {
        id: "frank_starling_hf",
        name: "Depressed Frank-Starling Curve",
        latex: "SV = SV_{max} \\times f_{contractility} \\times (1 - e^{-k \\cdot EDV})",
        description: "Reduced slope in heart failure",
        evidence: "established"
      }
    ],
    
    severity: {
      mild: { ef: 35, description: "NYHA II, EF 35-40%" },
      moderate: { ef: 25, description: "NYHA III, EF 25-35%" },
      severe: { ef: 15, description: "NYHA IV, EF <25%, advanced HF" }
    }
  },

  // COPD
  copd: {
    name: "Chronic Obstructive Pulmonary Disease",
    icd10: "J44",
    category: "respiratory",
    description: "Chronic airflow limitation, usually progressive",
    
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart"],
    
    progression: [
      { stage: 1, name: "GOLD 1 (Mild)", severity: 0.2, description: "FEV1 ≥80% predicted", yearsFromOnset: "0-10" },
      { stage: 2, name: "GOLD 2 (Moderate)", severity: 0.4, description: "FEV1 50-79%", yearsFromOnset: "10-20" },
      { stage: 3, name: "GOLD 3 (Severe)", severity: 0.7, description: "FEV1 30-49%", yearsFromOnset: "20-30" },
      { stage: 4, name: "GOLD 4 (Very Severe)", severity: 1.0, description: "FEV1 <30%", yearsFromOnset: ">30" }
    ],
    
    clinicalPresentation: {
      symptoms: [
        "Progressive dyspnea",
        "Chronic cough",
        "Sputum production",
        "Wheezing",
        "Chest tightness",
        "Frequent respiratory infections",
        "Weight loss (advanced)"
      ],
      labTests: [
        { name: "Spirometry (PFTs)", value: "FEV1/FVC <0.70", significance: "Diagnostic criterion" },
        { name: "ABG", value: "Hypoxemia, hypercapnia (late)", significance: "Gas exchange" },
        { name: "CBC", value: "Polycythemia from chronic hypoxia", significance: "Secondary effect" },
        { name: "Alpha-1 antitrypsin", value: "Low if deficiency", significance: "Rare cause, screen young" },
        { name: "BNP", value: "Elevated if cor pulmonale", significance: "Right heart failure" }
      ],
      imaging: [
        { type: "Chest X-ray", findings: "Hyperinflation, flattened diaphragms, bullae" },
        { type: "CT chest", findings: "Emphysema pattern, bronchial wall thickening" },
        { type: "Echocardiogram", findings: "RV dilation, elevated RVSP (pulmonary HTN)" }
      ],
      treatments: [
        { category: "Bronchodilators", items: ["LABA (salmeterol, formoterol)", "LAMA (tiotropium)", "Combination LABA/LAMA"] },
        { category: "Anti-inflammatory", items: ["ICS if eosinophilic/frequent exacerbations", "Triple therapy (ICS/LABA/LAMA)"] },
        { category: "Oxygen", items: ["LTOT if PaO2 <55 or SpO2 <88%"] },
        { category: "Other", items: ["Pulmonary rehab", "Smoking cessation (essential)", "Vaccinations (flu, pneumococcal)"] }
      ]
    },
    
    modifications: {
      lungs: {
        geometry: {
          frc: { multiplier: 1.5, absolute: null, note: "Hyperinflation" },
          rv: { multiplier: 1.8, absolute: null, note: "Air trapping" },
          tlc: { multiplier: 1.3, absolute: null, note: "Increased" },
          alveolar_surface: { multiplier: 0.6, absolute: null, note: "Emphysema destruction" },
        },
        physiology: {
          fev1: { multiplier: 0.5, absolute: null, note: "Airflow limitation" },
          fev1_fvc: { multiplier: 0.8, absolute: null, note: "<0.70 diagnostic" },
          dlco: { multiplier: 0.6, absolute: null, note: "Reduced in emphysema" },
          vq_ratio: { multiplier: 0.7, absolute: null, note: "V/Q mismatch" },
        },
        pressures: {
          pao2: { multiplier: 0.75, absolute: null, note: "Hypoxemia" },
          paco2: { multiplier: 1.2, absolute: null, note: "Hypercapnia (late)" },
        },
        structure: {
          airway_resistance: { multiplier: 3.0, absolute: null, note: "Increased" },
          elastic_recoil: { multiplier: 0.5, absolute: null, note: "Lost in emphysema" },
        }
      },
      heart: {
        geometry: {
          rv_size: { multiplier: 1.3, absolute: null, note: "Cor pulmonale" },
        },
        pressures: {
          pa_sys: { multiplier: 1.4, absolute: null, note: "Pulmonary HTN" },
          rvsp: { multiplier: 1.4, absolute: null, note: "Elevated" },
        }
      }
    },
    
    novelEquations: [
      {
        id: "gold_staging",
        name: "GOLD Spirometric Classification",
        latex: "Stage = \\begin{cases} 1 & FEV_1 \\geq 80\\% \\\\ 2 & 50\\% \\leq FEV_1 < 80\\% \\\\ 3 & 30\\% \\leq FEV_1 < 50\\% \\\\ 4 & FEV_1 < 30\\% \\end{cases}",
        description: "GOLD classification by FEV1 % predicted",
        evidence: "established"
      },
      {
        id: "bode_index",
        name: "BODE Index (Mortality Predictor)",
        latex: "BODE = B_{BMI} + O_{obstruction} + D_{dyspnea} + E_{exercise}",
        description: "Multidimensional prognostic score",
        evidence: "established"
      }
    ],
    
    severity: {
      mild: { fev1_percent: 80, description: "GOLD 1: FEV1 ≥80%" },
      moderate: { fev1_percent: 50, description: "GOLD 2-3: FEV1 30-79%" },
      severe: { fev1_percent: 25, description: "GOLD 4: FEV1 <30%" }
    }
  },

  // ATRIAL FIBRILLATION
  atrial_fibrillation: {
    name: "Atrial Fibrillation",
    icd10: "I48",
    category: "cardiac",
    description: "Irregular atrial rhythm with rapid ventricular response",
    
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "brain"],
    
    progression: [
      { stage: 1, name: "Paroxysmal", severity: 0.3, description: "Self-terminating <7 days", yearsFromOnset: "0-5" },
      { stage: 2, name: "Persistent", severity: 0.5, description: "Sustained >7 days", yearsFromOnset: "5-10" },
      { stage: 3, name: "Long-standing Persistent", severity: 0.7, description: ">1 year", yearsFromOnset: ">10" },
      { stage: 4, name: "Permanent", severity: 1.0, description: "Accepted, no cardioversion attempts", yearsFromOnset: "-" }
    ],
    
    clinicalPresentation: {
      symptoms: [
        "Palpitations (irregular heartbeat)",
        "Fatigue",
        "Dyspnea on exertion",
        "Dizziness or lightheadedness",
        "Chest discomfort",
        "Exercise intolerance",
        "Some patients asymptomatic"
      ],
      labTests: [
        { name: "TSH", value: "Rule out hyperthyroidism", significance: "Reversible cause" },
        { name: "BMP", value: "Electrolytes, kidney function", significance: "DOAC dosing" },
        { name: "CBC", value: "Baseline", significance: "Bleeding risk with anticoag" },
        { name: "Coagulation studies", value: "PT/INR if on warfarin", significance: "Monitoring" },
        { name: "BNP", value: "May be elevated", significance: "Assess for HF" }
      ],
      imaging: [
        { type: "ECG", findings: "Irregularly irregular rhythm, absent P waves, fibrillatory waves" },
        { type: "Echocardiogram", findings: "LA size, LV function, valvular disease" },
        { type: "TEE", findings: "LA appendage thrombus before cardioversion" },
        { type: "Holter/Event monitor", findings: "Document paroxysmal episodes" }
      ],
      treatments: [
        { category: "Rate Control", items: ["Beta-blockers", "Calcium channel blockers (diltiazem, verapamil)", "Digoxin"] },
        { category: "Rhythm Control", items: ["Cardioversion (electrical/pharmacological)", "Antiarrhythmics (amiodarone, flecainide, sotalol)", "Catheter ablation"] },
        { category: "Anticoagulation", items: ["DOACs preferred (apixaban, rivaroxaban)", "Warfarin if mechanical valve", "Based on CHA₂DS₂-VASc score"] },
        { category: "LAA Closure", items: ["Watchman device if anticoag contraindicated"] }
      ]
    },
    
    modifications: {
      heart: {
        geometry: {
          la_volume: { multiplier: 1.4, absolute: null, note: "LA dilation" },
        },
        physiology: {
          heart_rate: { multiplier: 1.4, absolute: null, note: "Rapid ventricular response" },
          cardiac_output: { multiplier: 0.85, absolute: null, note: "Loss of atrial kick" },
          stroke_volume: { multiplier: 0.8, absolute: null, note: "Irregular filling" },
        },
        pressures: {
          la_pressure: { multiplier: 1.3, absolute: null, note: "Elevated" },
        },
        structure: {
          atrial_fibrosis: { multiplier: 2.0, absolute: null, note: "Substrate for AF" },
        },
        ecg: {
          p_wave: { multiplier: 0, absolute: 0, note: "ABSENT - replaced by fibrillatory waves" },
          p_waves: { multiplier: 0, absolute: 0, note: "ABSENT in atrial fibrillation" },
          p_wave_axis: { multiplier: 0, absolute: null, note: "Not measurable - no P waves" },
          p_wave_duration: { multiplier: 0, absolute: 0, note: "No P waves present" },
          p_wave_amplitude: { multiplier: 0, absolute: 0, note: "No P waves present" },
          sinus_rhythm: { multiplier: 0, absolute: 0, note: "Loss of sinus rhythm" },
          fibrillatory_waves: { multiplier: 1, absolute: 1, note: "PRESENT - characteristic of AFib" },
          irregular_rhythm: { multiplier: 1, absolute: 1, note: "Irregularly irregular R-R intervals" },
          rr_interval: { multiplier: 1.2, absolute: null, note: "Variable (irregularly irregular)" },
          ventricular_rate: { multiplier: 1.4, absolute: null, note: "Often rapid if uncontrolled" },
          atrial_rate: { multiplier: 5.0, absolute: 450, note: "300-600 bpm (fibrillatory activity)" },
          pr_interval: { multiplier: 0, absolute: null, note: "Not measurable - no P waves" },
        }
      },
      brain: {
        physiology: {
          stroke_risk: { multiplier: 5.0, absolute: null, note: "5x increased stroke risk" },
        }
      }
    },
    
    novelEquations: [
      {
        id: "chadsvasc",
        name: "CHA₂DS₂-VASc Score",
        latex: "Score = CHF + HTN + Age_{75}(2) + DM + Stroke/TIA(2) + Vasc + Age_{65} + Sex_{female}",
        description: "Stroke risk stratification for anticoagulation decision",
        evidence: "established"
      },
      {
        id: "hasbled",
        name: "HAS-BLED Score",
        latex: "Score = HTN + Abnormal(renal/liver) + Stroke + Bleeding + Labile_{INR} + Elderly + Drugs/Alcohol",
        description: "Bleeding risk assessment",
        evidence: "established"
      }
    ],
    
    severity: {
      mild: { description: "Paroxysmal, rate-controlled" },
      moderate: { description: "Persistent, symptomatic" },
      severe: { description: "Permanent with complications (HF, stroke)" }
    }
  }


};

export default DISEASE_MODELS;
