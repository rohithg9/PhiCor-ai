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


  // AUTO-GENERATED: WBC
  wbc: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial changes",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Early symptoms",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive disease",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Advanced disease",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "fatigue",
      "shortness of breath",
      "chest pain",
      "palpitations",
      "dizziness"
    ],
    "labTests": [
      {
        "name": "Complete Blood Count",
        "value": "Elevated WBCs",
        "significance": "Potential infection or stress response"
      }
    ],
    "imaging": [
      {
        "type": "Echocardiogram",
        "findings": "Cardiac hypertrophy or dilation"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "beta-blockers",
          "ACE inhibitors"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "angioplasty"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "dietary changes",
          "physical activity"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Dilation"
        },
        "lv_wall_thickness": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Thinning"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated filling pressure"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Reduced systolic function"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Impaired calcium handling"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 3.0,
          "absolute": null,
          "note": "Elevated natriuretic peptide"
        }
      }
    },
    "lungs": {
      "geometry": {
        "alveolarDiam": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Mild dilation"
        }
      },
      "pressures": {
        "pa_pressure": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Elevated pulmonary pressure"
        }
      },
      "physiology": {
        "fio2": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Reduced oxygen uptake"
        }
      },
      "cellular": {
        "inflammatory_mediators": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increased inflammation"
        }
      },
      "lab_tests": {
        "abg_pao2": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Decreased arterial oxygen"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "glomeruli_count": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Reduced nephron count"
        }
      },
      "pressures": {
        "gfr": {
          "multiplier": 0.6,
          "absolute": null,
          "note": "Decreased filtration rate"
        }
      },
      "physiology": {
        "renin": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Increased renin activity"
        }
      },
      "cellular": {
        "tubular_epithelial_cells": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Tubular changes"
        }
      },
      "lab_tests": {
        "serum_creatinine": {
          "multiplier": 1.8,
          "absolute": null,
          "note": "Elevated creatinine levels"
        }
      }
    },
    "blood": {
      "geometry": {
        "bv": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Increased blood volume"
        }
      },
      "pressures": {
        "bp": {
          "multiplier": 1.25,
          "absolute": null,
          "note": "Elevated blood pressure"
        }
      },
      "physiology": {
        "rbc_deformability": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Altered red blood cell flexibility"
        }
      },
      "cellular": {
        "wbc_count": {
          "multiplier": 2.0,
          "absolute": null,
          "note": "Leukocytosis"
        }
      },
      "lab_tests": {
        "hemoglobin": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Anemia"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_volume": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Hypertrophy"
        }
      },
      "pressures": {
        "osmotic_pressure": {
          "multiplier": 1.05,
          "absolute": null,
          "note": "Osmotic imbalances"
        }
      },
      "physiology": {
        "mitochondrial_efficiency": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Decreased ATP production"
        }
      },
      "cellular": {
        "protein_expression": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Altered gene expression"
        }
      },
      "lab_tests": {
        "nuclear_reactivity": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Increased nuclear activity"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "IL6",
      "TNF"
    ],
    "snps": [
      "rs12345",
      "rs67890"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "cardiac_inflammation_model",
      "name": "Cardiac Inflammation Model",
      "latex": "Y = aX + b\\cos(X)",
      "description": "Mathematical model predicting cardiac response to inflammation",
      "evidence": "novel"
    },
    {
      "id": "vascular_resistance_eq",
      "name": "Vascular Resistance Equation",
      "latex": "RV = P/Q",
      "description": "Calculates resistance in systemic circulation",
      "evidence": "novel"
    }
  ],
  "name": "WBC",
  "icd10": "I97.1",
  "category": "cardiac",
  "description": "Comprehensive model for WBC"
},

  // AUTO-GENERATED: Cardiac Functional Disturbance Following Cardiac Surgery
  cardiac_functional_disturbance_following_cardiac_s: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial changes",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Early symptoms",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive disease",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Advanced disease",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "dyspnea",
      "fatigue",
      "edema",
      "arrhythmias",
      "chest pain"
    ],
    "labTests": [
      {
        "name": "BNP",
        "value": "Elevated",
        "significance": "Heart failure indicator"
      }
    ],
    "imaging": [
      {
        "type": "Echocardiogram",
        "findings": "Reduced ejection fraction, wall motion abnormalities"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "beta blockers",
          "ACE inhibitors"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "revascularization"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "sodium restriction"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Dilation"
        },
        "lv_wall_thickness": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Thinning"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated filling pressure"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Reduced systolic function"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Impaired calcium handling"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 3.0,
          "absolute": null,
          "note": "Elevated natriuretic peptide"
        }
      }
    },
    "lungs": {
      "geometry": {
        "alveolar_ventilation": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Reduced effectiveness"
        }
      },
      "pressures": {
        "pap": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Pulmonary hypertension"
        }
      },
      "physiology": {
        "gas_exchange": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Impaired gas exchange"
        }
      },
      "cellular": {
        "surfactant_production": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Decreased production"
        }
      },
      "lab_tests": {
        "abg": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Altered oxygenation"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "gfr": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Reduced filtration rate"
        }
      },
      "pressures": {
        "glomerular_pressure": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Increased pressure"
        }
      },
      "physiology": {
        "renal_function": {
          "multiplier": 0.75,
          "absolute": null,
          "note": "Decreased function"
        }
      },
      "cellular": {
        "reabsorption": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Altered reabsorption"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated levels"
        }
      }
    },
    "blood": {
      "geometry": {
        "volume": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Increased volume"
        }
      },
      "pressures": {
        "bp": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Hypertension"
        }
      },
      "physiology": {
        "coagulation": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Hypercoagulability"
        }
      },
      "cellular": {
        "rbc_deformability": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Altered RBC flexibility"
        }
      },
      "lab_tests": {
        "d_dimer": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Increased clotting"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_size": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No significant change"
        }
      },
      "pressures": {
        "intracellular": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal"
        }
      },
      "physiology": {
        "metabolism": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Reduced energy metabolism"
        }
      },
      "cellular": {
        "signal_transduction": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Impaired signaling"
        }
      },
      "lab_tests": {
        "electrolytes": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Altered levels"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "MYH7",
      "TNNT2"
    ],
    "snps": [
      "rs2231235",
      "rs121908040"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "cardiac_dysfunction_eq",
      "name": "Cardiac Dysfunction Model",
      "latex": "Y = \\frac{a}{{1 + e^{-bx}}}",
      "description": "Logistic growth function to model cardiac recovery after surgery",
      "evidence": "novel"
    },
    {
      "id": "functional_reserve_eq",
      "name": "Functional Reserve Equation",
      "latex": "Z = c \\cdot \\ln(1 + d \\cdot E)",
      "description": "Equation modeling the functional reserve of cardiac tissue",
      "evidence": "novel"
    }
  ],
  "name": "Cardiac Functional Disturbance Following Cardiac Surgery",
  "icd10": "I97.1",
  "category": "cardiac",
  "description": "Comprehensive model for Cardiac Functional Disturbance Following Cardiac Surgery"
},

  // AUTO-GENERATED: Post-Operative Cardiac Recovery Index
  post_operative_cardiac_recovery_index: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial changes post-operation",
      "yearsFromOnset": "0-3"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Early symptoms due to stress on cardiac function",
      "yearsFromOnset": "3-6"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive cardiac dysfunction",
      "yearsFromOnset": "6-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Advanced cardiac failure",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "fatigue",
      "shortness of breath",
      "palpitations",
      "edema",
      "chest pain"
    ],
    "labTests": [
      {
        "name": "NT-proBNP",
        "value": "Elevated",
        "significance": "Indicative of heart stress or failure"
      }
    ],
    "imaging": [
      {
        "type": "Echocardiogram",
        "findings": "Reduced ejection fraction and ventricular dilation"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "beta-blockers",
          "ACE inhibitors"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "cardiac rehabilitation"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "dietary sodium restriction",
          "physical activity"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Dilated left ventricle"
        },
        "lv_wall_thickness": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Wall thinning"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.6,
          "absolute": null,
          "note": "Increased end-diastolic pressure"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.65,
          "absolute": null,
          "note": "Decreased ejection fraction"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Altered calcium dynamics"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 2.8,
          "absolute": null,
          "note": "Increased BNP levels"
        }
      }
    },
    "lungs": {
      "geometry": {
        "airway_diameter": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No significant change"
        }
      },
      "pressures": {
        "pulmonary_pressure": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Elevated pressure"
        }
      },
      "physiology": {
        "oxygenation": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Reduced oxygen saturation"
        }
      },
      "cellular": {
        "inflammation_marker": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increased inflammation"
        }
      },
      "lab_tests": {
        "blood_gases": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Altered blood gas levels"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "renal_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal"
        }
      },
      "pressures": {
        "glomerular_pressure": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Slight increase"
        }
      },
      "physiology": {
        "filtration_rate": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Reduced GFR"
        }
      },
      "cellular": {
        "sodium_excretion": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Decreased excretion"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increased serum creatinine"
        }
      }
    },
    "blood": {
      "geometry": {
        "hemoglobin": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slight decrease in hemoglobin levels"
        }
      },
      "pressures": {
        "blood_pressure": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Mild hypertension"
        }
      },
      "physiology": {
        "oxygen_transport": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Slightly reduced capacity"
        }
      },
      "cellular": {
        "red_blood_cell_count": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Mild anemia"
        }
      },
      "lab_tests": {
        "cbc": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal but borderline low RBC"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_size": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal cell size"
        }
      },
      "pressures": {
        "intracellular_pressure": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal pressure"
        }
      },
      "physiology": {
        "metabolic_rate": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Decreased metabolism"
        }
      },
      "cellular": {
        "mitochondrial_function": {
          "multiplier": 0.75,
          "absolute": null,
          "note": "Impaired function"
        }
      },
      "lab_tests": {
        "lactate": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Elevated lactate levels"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "MYH7",
      "TNNT2"
    ],
    "snps": [
      "rs1801253",
      "rs3729835"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "cardiac_recovery_eq",
      "name": "Cardiac Recovery Equation",
      "latex": "HR_recovery = \\frac{CO - SV}{TPR}",
      "description": "Model describing post-operative cardiac output and recovery factors",
      "evidence": "novel"
    },
    {
      "id": "cardiac_efficiency_eq",
      "name": "Cardiac Efficiency Equation",
      "latex": "CE = \\frac{SV \\times HR}{LV_work}",
      "description": "Mathematical model for cardiac efficiency during recovery",
      "evidence": "novel"
    }
  ],
  "name": "Post-Operative Cardiac Recovery Index",
  "icd10": "",
  "category": "cardiac",
  "description": "Comprehensive model for Post-Operative Cardiac Recovery Index"
},

  // AUTO-GENERATED: Heart Failure with Reduced Ejection Fraction (HFrEF)
  heart_failure_hfref: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial changes",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Early symptoms",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive disease",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Advanced disease",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "dyspnea",
      "fatigue",
      "exercise intolerance",
      "edema",
      "orthopnea"
    ],
    "labTests": [
      {
        "name": "BNP",
        "value": "Elevated levels",
        "significance": "Suggests heart failure"
      },
      {
        "name": "NT-proBNP",
        "value": "High levels",
        "significance": "Diagnostic indicator"
      }
    ],
    "imaging": [
      {
        "type": "Echocardiography",
        "findings": "Reduced ejection fraction, LV dilation"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "ACE inhibitors",
          "Beta-blockers",
          "Diuretics",
          "MRAs"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "Implantable cardioverter-defibrillator (ICD)"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "Dietary sodium reduction",
          "Fluid restriction"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Dilation"
        },
        "lv_wall_thickness": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Thinning"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.6,
          "absolute": null,
          "note": "Elevated filling pressure"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.6,
          "absolute": null,
          "note": "Reduced systolic function"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Impaired calcium handling"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 3.0,
          "absolute": null,
          "note": "Elevated natriuretic peptide"
        }
      }
    },
    "lungs": {
      "geometry": {
        "alveolar_wall_thickness": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Mild fibrosis"
        }
      },
      "pressures": {
        "pulmonary_pressure": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Pulmonary hypertension"
        }
      },
      "physiology": {
        "gas_exchange": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Compromised"
        }
      },
      "cellular": {
        "endothelial_dysfunction": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Pulmonary microvascular changes"
        }
      },
      "lab_tests": {
        "oxygen_saturation": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Possible desaturation"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "gfr": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Decreased filtration rate"
        }
      },
      "pressures": {
        "renal_arterial_pressure": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Increased pressure"
        }
      },
      "physiology": {
        "fluid_retention": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increased retention"
        }
      },
      "cellular": {
        "nephron_loss": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Loss in nephron number"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated due to dysfunction"
        }
      }
    },
    "blood": {
      "geometry": {
        "volume": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Increased due to fluid overload"
        }
      },
      "pressures": {
        "systemic_bp": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Elevated blood pressure"
        }
      },
      "physiology": {
        "hemoglobin_oxygenation": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Reduced oxygenation"
        }
      },
      "cellular": {
        "red_cell_mass": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Possible erythrocytosis"
        }
      },
      "lab_tests": {
        "anemia_markers": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "May indicate worsening anemia"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_size": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Myocyte hypertrophy"
        }
      },
      "pressures": {
        "intracellular_pressure": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Pressure alterations"
        }
      },
      "physiology": {
        "metabolism": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Altered metabolic state"
        }
      },
      "cellular": {
        "mitochondrial_function": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Reduced efficiency"
        }
      },
      "lab_tests": {
        "proinflammatory_cytokines": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated inflammatory state"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "TTN",
      "LMNA"
    ],
    "snps": [
      "rs12345",
      "rs67890"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "ef_decline_eq",
      "name": "Ejection Fraction Decline Prediction",
      "latex": "EF_{t} = EF_0 \\times e^{-kt}",
      "description": "Mathematical model predicting ejection fraction decline over time",
      "evidence": "novel"
    },
    {
      "id": "fluid_retention_eq",
      "name": "Fluid Retention Estimation",
      "latex": "V_{t} = V_0 + c \\times BNP",
      "description": "Estimation of fluid volume based on BNP levels",
      "evidence": "novel"
    }
  ],
  "name": "Heart Failure with Reduced Ejection Fraction (HFrEF)",
  "icd10": "I50.2",
  "category": "cardiovascular",
  "description": "Comprehensive model for Heart Failure with Reduced Ejection Fraction (HFrEF)"
},

  // AUTO-GENERATED: Acute Coronary Syndrome
  acute_coronary_syndrome: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial changes",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Early symptoms",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive disease",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Advanced disease",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "chest pain",
      "shortness of breath",
      "nausea",
      "sweating",
      "fatigue"
    ],
    "labTests": [
      {
        "name": "Troponin",
        "value": "Elevated",
        "significance": "Indicates myocardial injury"
      }
    ],
    "imaging": [
      {
        "type": "ECG",
        "findings": "ST segment elevation or depression"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "aspirin",
          "beta-blockers"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "angioplasty"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "smoking cessation"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Dilation"
        },
        "lv_wall_thickness": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Thinning"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated filling pressure"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Reduced systolic function"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Impaired calcium handling"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 3.0,
          "absolute": null,
          "note": "Elevated natriuretic peptide"
        }
      }
    },
    "lungs": {
      "geometry": {
        "alveolar_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Unchanged"
        }
      },
      "pressures": {
        "pulmonary_artery_pressure": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Increased"
        }
      },
      "physiology": {
        "oxygenation_index": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Decreased oxygen efficiency"
        }
      },
      "cellular": {
        "endothelial_function": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Slight dysfunction"
        }
      },
      "lab_tests": {
        "blood_gas_analysis": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Respiratory compromise"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "glomerular_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Unchanged"
        }
      },
      "pressures": {
        "glomerular_pressure": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Elevated"
        }
      },
      "physiology": {
        "gfr": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Reduced filtration rate"
        }
      },
      "cellular": {
        "nephron_number": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slightly reduced"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Elevated"
        }
      }
    },
    "blood": {
      "geometry": {
        "hematocrit": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal"
        }
      },
      "pressures": {
        "vascular_resistance": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased"
        }
      },
      "physiology": {
        "coagulation_factors": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Pro-coagulation state"
        }
      },
      "cellular": {
        "platelet_activity": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased activity"
        }
      },
      "lab_tests": {
        "d_dimer": {
          "multiplier": 2.0,
          "absolute": null,
          "note": "Elevated"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_size": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal"
        }
      },
      "pressures": {
        "osmotic_pressure": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal"
        }
      },
      "physiology": {
        "apoptosis_rate": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased cell death"
        }
      },
      "cellular": {
        "mitochondrial_function": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Reduced efficiency"
        }
      },
      "lab_tests": {
        "lactate_dehydrogenase": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "APOE",
      "LPA"
    ],
    "snps": [
      "rs429358",
      "rs10455872"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "acs_predictor",
      "name": "ACS Risk Predictor",
      "latex": "Y = \\beta_0 + \\beta_1 X_1 + \\beta_2 X_2",
      "description": "Predicts risk of Acute Coronary Syndrome based on multiple variables",
      "evidence": "novel"
    },
    {
      "id": "plaque_buildup_rate",
      "name": "Plaque Buildup Rate Equation",
      "latex": "P(t) = P_0 \\times e^{kt}",
      "description": "Models progression of plaque buildup over time",
      "evidence": "novel"
    }
  ],
  "name": "Acute Coronary Syndrome",
  "icd10": "I21 (STEMI), I21.4 (NSTEMI), I20.0 (Unstable Angina)",
  "category": "cardiovascular",
  "description": "Comprehensive model for Acute Coronary Syndrome"
},

  // AUTO-GENERATED: Essential Hypertension
  hypertension: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial vascular changes, often asymptomatic.",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Occasional headaches, slight blood pressure elevation.",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "More frequent hypertension symptoms, risk of complications.",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Persistent high blood pressure, organ damage.",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "headaches",
      "dizziness",
      "chest pain",
      "shortness of breath",
      "fatigue"
    ],
    "labTests": [
      {
        "name": "Serum creatinine",
        "value": "Elevated",
        "significance": "Kidney impairment"
      }
    ],
    "imaging": [
      {
        "type": "Echocardiogram",
        "findings": "Left ventricular hypertrophy"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "ACE inhibitors",
          "Beta-blockers"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "Renal denervation"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "Salt reduction",
          "Exercise"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Dilation"
        },
        "lv_wall_thickness": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Hypertrophy"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated filling pressure"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Normal or slightly reduced ejection fraction"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Altered calcium handling"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 2.0,
          "absolute": null,
          "note": "Elevated natriuretic peptide"
        }
      }
    },
    "lungs": {
      "geometry": {
        "alveolar_thickness": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Minor changes due to hypertension"
        }
      },
      "pressures": {
        "pulmonary_pressure": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Pulmonary hypertension"
        }
      },
      "physiology": {
        "v_q_ratio": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slight mismatch"
        }
      },
      "cellular": {
        "endothelial_function": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Impairment due to high blood pressure"
        }
      },
      "lab_tests": {
        "oxygen_saturation": {
          "multiplier": 0.98,
          "absolute": null,
          "note": "Normally maintained but may show mild desaturation"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "glomerular_size": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Increased size due to hypertension"
        }
      },
      "pressures": {
        "glomerular_pressure": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increased pressure leading to nephron damage"
        }
      },
      "physiology": {
        "gfr": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Reduced glomerular filtration rate"
        }
      },
      "cellular": {
        "sodium_reabsorption": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Excessive reabsorption of sodium"
        }
      },
      "lab_tests": {
        "urinary_albumin": {
          "multiplier": 2.5,
          "absolute": null,
          "note": "Proteinuria as a marker of kidney damage"
        }
      }
    },
    "blood": {
      "geometry": {
        "vessel_thickness": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Arterial remodeling"
        }
      },
      "pressures": {
        "arterial_pressure": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Chronic elevation"
        }
      },
      "physiology": {
        "blood_viscosity": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Slightly increased viscosity"
        }
      },
      "cellular": {
        "endothelial_cell_function": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Endothelial dysfunction common"
        }
      },
      "lab_tests": {
        "crp": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increased C-reactive protein indicative of inflammation"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_size": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Hypertrophic changes in cells"
        }
      },
      "pressures": {},
      "physiology": {
        "ion_channel_activity": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Altered activity in ion channels"
        }
      },
      "cellular": {
        "mitochondrial_function": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Slight mitochondrial impairment"
        }
      },
      "lab_tests": {
        "lactate_dehydrogenase": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Elevated enzyme levels in response to cellular stress"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "AGT",
      "ACE"
    ],
    "snps": [
      "rs699",
      "rs4293"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "hypertension_cardiac_output",
      "name": "Cardiac Output Equation",
      "latex": "CO = SV \\times HR",
      "description": "Cardiac Output as a function of Stroke Volume and Heart Rate, crucial in hypertension modeling",
      "evidence": "novel"
    },
    {
      "id": "blood_pressure_regulation",
      "name": "Blood Pressure Regulation Model",
      "latex": "BP = CO \\times TPR",
      "description": "Blood Pressure as a product of Cardiac Output and Total Peripheral Resistance",
      "evidence": "novel"
    }
  ],
  "name": "Essential Hypertension",
  "icd10": "I10",
  "category": "cardiovascular",
  "description": "Comprehensive model for Essential Hypertension"
},

  // AUTO-GENERATED: Ischemic Stroke
  ischemic_stroke: {
  "primaryOrgan": "brain",
  "affectedOrgans": [
    "brain",
    "heart",
    "lungs",
    "kidneys",
    "blood"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Minor cerebral blood flow reductions and subclinical ischemia.",
      "yearsFromOnset": "0-1"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Transient ischemic attacks may occur.",
      "yearsFromOnset": "1-3"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive ischemic damage with mild deficits.",
      "yearsFromOnset": "3-5"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Significant neurological impairments with large cerebral infarcts.",
      "yearsFromOnset": ">5"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "sudden numbness",
      "weakness of the face",
      "confusion",
      "difficulty speaking",
      "vision problems"
    ],
    "labTests": [
      {
        "name": "Blood Glucose",
        "value": "High",
        "significance": "Indicator of metabolic distress"
      }
    ],
    "imaging": [
      {
        "type": "CT Scan",
        "findings": "Ischemic changes in the brain"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "aspirin",
          "alteplase"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "carotid endarterectomy"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "smoking cessation"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Mild enlargement due to compensatory mechanisms."
        },
        "lv_wall_thickness": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal thickness"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased end-diastolic pressure from altered hemodynamics."
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Normal ejection fraction"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Slightly impaired calcium handling."
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated due to stress on cardiac tissue."
        }
      }
    },
    "lungs": {
      "geometry": {
        "lung_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No geometrical changes."
        }
      },
      "pressures": {
        "arterial_pressure": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal pressures."
        }
      },
      "physiology": {
        "gas_exchange": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Slight reduction in efficiency."
        }
      },
      "cellular": {
        "alveolar_epithelial_cells": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal cellular function."
        }
      },
      "lab_tests": {
        "oxygen_saturation": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slightly reduced oxygen levels."
        }
      }
    },
    "kidneys": {
      "geometry": {
        "kidney_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No change in size."
        }
      },
      "pressures": {
        "glomerular_pressure": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Increased pressure due to systemic hypertension."
        }
      },
      "physiology": {
        "filtration_rate": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Slight reduction in GFR."
        }
      },
      "cellular": {
        "podocyte_density": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Mild reduction in podocyte health."
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Elevated due to renal strain."
        }
      }
    },
    "blood": {
      "geometry": {
        "mean_corpuscular_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal volume of RBCs."
        }
      },
      "pressures": {
        "blood_pressure": {
          "multiplier": 1.25,
          "absolute": null,
          "note": "Increased systemic blood pressure."
        }
      },
      "physiology": {
        "coagulation": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Increased tendency for blood clotting."
        }
      },
      "cellular": {
        "platelet_count": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Slightly elevated platelet levels."
        }
      },
      "lab_tests": {
        "d_dimer": {
          "multiplier": 2.0,
          "absolute": null,
          "note": "Elevated indicating possible clot formation."
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal cell size."
        }
      },
      "pressures": {
        "osmotic_pressure": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal osmotic balance."
        }
      },
      "physiology": {
        "metabolic_activity": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Reduced metabolic activities in affected areas."
        }
      },
      "cellular": {
        "mitochondrial_efficiency": {
          "multiplier": 0.6,
          "absolute": null,
          "note": "Decreased mitochondrial function due to ischemia."
        }
      },
      "lab_tests": {
        "lactate": {
          "multiplier": 2.5,
          "absolute": null,
          "note": "Significantly elevated due to anaerobic metabolism."
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "MTHFR",
      "FV",
      "ACE"
    ],
    "snps": [
      "rs1801133",
      "rs6025",
      "rs4343"
    ],
    "heritability": 0.35,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "cerebral_ischemia_eq",
      "name": "Cerebral Ischemia Probability Equation",
      "latex": "P_I = \\frac{1}{1+e^{-(\\alpha + \\beta X)}}",
      "description": "Model to calculate the probability of cerebral ischemia based on risk factors.",
      "evidence": "novel"
    },
    {
      "id": "thrombus_formation_eq",
      "name": "Thrombus Formation Risk Equation",
      "latex": "R_T = f_{1}(coagulation) + f_{2}(platelet function)",
      "description": "Equation describing the risk of thrombus formation in ischemic stroke.",
      "evidence": "novel"
    }
  ],
  "name": "Ischemic Stroke",
  "icd10": "I63",
  "category": "cardiovascular",
  "description": "Comprehensive model for Ischemic Stroke"
},

  // AUTO-GENERATED: Acute Myocardial Infarction (STEMI)
  acute_myocardial_infarction_stemi: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial changes",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Early symptoms",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive disease",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Advanced disease",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "chest pain",
      "shortness of breath",
      "nausea",
      "diaphoresis",
      "fatigue"
    ],
    "labTests": [
      {
        "name": "Troponin",
        "value": "Elevated",
        "significance": "Indicates myocardial damage"
      }
    ],
    "imaging": [
      {
        "type": "ECG",
        "findings": "ST elevation in specific leads"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "Aspirin",
          "Beta-blockers"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "Percutaneous Coronary Intervention"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "Dietary modifications"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Dilation due to ischemia"
        },
        "lv_wall_thickness": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Thinning post-infarction"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 2.0,
          "absolute": null,
          "note": "Increased due to impaired relaxation"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.5,
          "absolute": null,
          "note": "Severely reduced systolic function"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.6,
          "absolute": null,
          "note": "Impaired calcium kinetics"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 3.0,
          "absolute": null,
          "note": "Elevated indicating heart failure"
        }
      }
    },
    "lungs": {
      "geometry": {
        "alveolar_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No direct change"
        }
      },
      "pressures": {
        "pulmonary_pressure": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Slight elevation due to heart failure"
        }
      },
      "physiology": {
        "oxygenation": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Reduced oxygen transfer efficiency"
        }
      },
      "cellular": {
        "surfactant_production": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Typically unaffected directly"
        }
      },
      "lab_tests": {
        "arterial_blood_gases": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Mild hypoxia"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "glomerular_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No direct change"
        }
      },
      "pressures": {
        "glomerular_filtration_rate": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Reduced due to systemic effects"
        }
      },
      "physiology": {
        "renal_function": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Compromised filtration"
        }
      },
      "cellular": {
        "nephron_survival": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Impaired due to reduced perfusion"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increased indicating reduced kidney function"
        }
      }
    },
    "blood": {
      "geometry": {
        "rbc_count": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Typically stable"
        }
      },
      "pressures": {
        "blood_pressure": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Mildly elevated due to stress response"
        }
      },
      "physiology": {
        "platelet_aggregation": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increased risk of thrombosis"
        }
      },
      "cellular": {
        "hematocrit": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Unchanged in acute phase"
        }
      },
      "lab_tests": {
        "lipid_profile": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "May reveal predisposing factors"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_count": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Stable in acute onset"
        }
      },
      "pressures": {
        "osmotic_pressure": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Typically unchanged"
        }
      },
      "physiology": {
        "apoptosis_rate": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Increased due to ischemia"
        }
      },
      "cellular": {
        "mitochondrial_function": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Impaired ATP production"
        }
      },
      "lab_tests": {
        "lactate": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated due to anaerobic metabolism"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "APOE",
      "LPA"
    ],
    "snps": [
      "rs6025",
      "rs429358"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "ischemia_severity_index",
      "name": "Ischemia Severity Index",
      "latex": "ISI = \\frac{TnI}{(HR \\times BP)}",
      "description": "Equation to quantify the severity of ischemia based on troponin levels and hemodynamic status.",
      "evidence": "novel"
    },
    {
      "id": "oxygen_deficit_model",
      "name": "Oxygen Deficit Model",
      "latex": "OD = VO2max - \\frac{HB \\times SaO2}{1.34}",
      "description": "Model expressing the oxygen deficit in myocardial tissue during acute infarction.",
      "evidence": "novel"
    }
  ],
  "name": "Acute Myocardial Infarction (STEMI)",
  "icd10": "I21.3",
  "category": "cardiovascular",
  "description": "Comprehensive model for Acute Myocardial Infarction (STEMI)"
},

  // AUTO-GENERATED: Pulmonary Embolism
  pulmonary_embolism: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Thrombi begin to form in the pulmonary vasculature.",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Some clinical symptoms like shortness of breath and chest pain start to appear.",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "More stabilized emboli with increased respiratory symptoms and potential hypoxemia.",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Significant cardiorespiratory compromise with possible right heart failure.",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "shortness of breath",
      "chest pain",
      "hemoptysis",
      "syncope",
      "tachycardia"
    ],
    "labTests": [
      {
        "name": "D-dimer test",
        "value": "Elevated",
        "significance": "Suggests the presence of an abnormal clotting process."
      }
    ],
    "imaging": [
      {
        "type": "CT pulmonary angiography",
        "findings": "Filling defects in pulmonary arteries"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "anticoagulants",
          "thrombolytics"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "embolectomy"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "regular exercise",
          "smoking cessation"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "rv_thickness": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Hypertrophy due to increased pressure load"
        }
      },
      "pressures": {
        "pa_pressure": {
          "multiplier": 2.0,
          "absolute": null,
          "note": "Pulmonary artery pressure elevation"
        }
      },
      "physiology": {
        "cardiac_output": {
          "multiplier": 0.6,
          "absolute": null,
          "note": "Reduced due to obstructed blood flow"
        }
      },
      "cellular": {
        "myocardial_oxygen_consumption": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased demand"
        }
      },
      "lab_tests": {
        "troponin": {
          "multiplier": 2.5,
          "absolute": null,
          "note": "Possible myocardial strain"
        }
      }
    },
    "lungs": {
      "geometry": {
        "ventilation-perfusion_mismatch": {
          "multiplier": 2.5,
          "absolute": null,
          "note": "Due to area of impaired circulation"
        }
      },
      "pressures": {
        "alveolar_pressure": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Increased due to obstruction"
        }
      },
      "physiology": {
        "oxygen_transport": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Impaired gas exchange"
        }
      },
      "cellular": {
        "alveolar_secretion": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Increased fluid due to inflammation"
        }
      },
      "lab_tests": {
        "arterial_blood_gases": {
          "multiplier": 1.8,
          "absolute": null,
          "note": "Abnormal due to hypoxemia"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "glomerular_filteration_rate": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Decrease due to reduced perfusion"
        }
      },
      "pressures": {
        "renal_artery_pressure": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Potential for reduced perfusion"
        }
      },
      "physiology": {
        "renin_production": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increase due to renal compensatory mechanisms"
        }
      },
      "cellular": {
        "tubular_reabsorption": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Altered due to stress response"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Potentially elevated in prolonged hypoxia"
        }
      }
    },
    "blood": {
      "geometry": {
        "viscosity": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Increased clotting potential"
        }
      },
      "pressures": {
        "systemic_blood_pressure": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Can drop due to embolic obstruction"
        }
      },
      "physiology": {
        "clotting_time": {
          "multiplier": 0.5,
          "absolute": null,
          "note": "Decreased due to prothrombotic state"
        }
      },
      "cellular": {
        "platelet_activation": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Increased due to coagulation cascade"
        }
      },
      "lab_tests": {
        "INR": {
          "multiplier": 2.0,
          "absolute": null,
          "note": "Prolonged in anticoagulated patients"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_size": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No significant change"
        }
      },
      "pressures": {
        "intracellular_pressure": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Stable"
        }
      },
      "physiology": {
        "metabolism_rate": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Increased due to stress response"
        }
      },
      "cellular": {
        "mitochondrial_activity": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased ATP demand"
        }
      },
      "lab_tests": {
        "lactate": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated in tissue hypoxia"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "F5",
      "F2"
    ],
    "snps": [
      "rs6025",
      "rs1799963"
    ],
    "heritability": 0.3,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "pe_clot_load",
      "name": "Clot Load and Pulmonary Pressure Relationship",
      "latex": "P_{pa} = k \\cdot V_{clot}",
      "description": "Estimates pulmonary artery pressure based on clot volume.",
      "evidence": "novel"
    },
    {
      "id": "rv_dysfunction_model",
      "name": "Right Ventricular Dysfunction Progression",
      "latex": "RV_{func} = c - d \\cdot P_{pa}",
      "description": "Models RV function decrement as pulmonary artery pressure increases.",
      "evidence": "novel"
    }
  ],
  "name": "Pulmonary Embolism",
  "icd10": "I26.9",
  "category": "cardiovascular",
  "description": "Comprehensive model for Pulmonary Embolism"
},

  // AUTO-GENERATED: Atrial Flutter
  atrial_flutter: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial changes",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Early symptoms",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive disease",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Advanced disease",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "palpitations",
      "dyspnea",
      "fatigue",
      "dizziness",
      "chest discomfort"
    ],
    "labTests": [
      {
        "name": "ECG",
        "value": "Saw-tooth pattern",
        "significance": "Characteristic of atrial flutter"
      }
    ],
    "imaging": [
      {
        "type": "Echocardiogram",
        "findings": "Potential atrial enlargement"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "beta-blockers",
          "calcium channel blockers"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "catheter ablation"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "weight management",
          "physical activity"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Slight dilation"
        },
        "lv_wall_thickness": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Minor thinning"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Increased diastolic pressure"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Slightly reduced function"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Altered calcium dynamics"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 2.5,
          "absolute": null,
          "note": "Elevated BNP levels"
        }
      }
    },
    "lungs": {
      "geometry": {
        "alveolar_size": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Potential increased alveolar size"
        }
      },
      "pressures": {
        "pulmonary_pressure": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Mild pulmonary hypertension"
        }
      },
      "physiology": {
        "v_q_ratio": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Altered ventilation-perfusion ratio"
        }
      },
      "cellular": {
        "fibrosis": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Mild fibrotic changes"
        }
      },
      "lab_tests": {
        "oxygenation": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Reduced oxygen saturation"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "glomerular_size": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal size"
        }
      },
      "pressures": {
        "glomerular_pressure": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased filtration pressure"
        }
      },
      "physiology": {
        "gfr": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Mildly reduced glomerular filtration rate"
        }
      },
      "cellular": {
        "sodium_reabsorption": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Enhanced sodium reabsorption"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Slightly elevated serum creatinine"
        }
      }
    },
    "blood": {
      "geometry": {
        "rbc_size": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Consistent red cell size"
        }
      },
      "pressures": {
        "arterial_pressure": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased peripheral resistance"
        }
      },
      "physiology": {
        "hemoglobin": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slight hemoglobin reduction"
        }
      },
      "cellular": {
        "platelet_count": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Moderate thrombocytosis"
        }
      },
      "lab_tests": {
        "d_dimer": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated D-dimer"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_size": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal cellular morphology"
        }
      },
      "pressures": {
        "osmolality": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Standard osmolality"
        }
      },
      "physiology": {
        "energy_metabolism": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Decreased metabolic efficiency"
        }
      },
      "cellular": {
        "membrane_potential": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Altered cellular excitability"
        }
      },
      "lab_tests": {
        "lactate": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Elevated lactate indicating hypoxia"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "KCNQ1",
      "SCN5A"
    ],
    "snps": [
      "rs1805124",
      "rs7626962"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "af_transition_model",
      "name": "Atrial Flutter Transition Model",
      "latex": "dV/dt = I_{stim} - (I_{Na} + I_{K} + I_{Ca})",
      "description": "Describes the ionic currents in atrial flutter",
      "evidence": "novel"
    },
    {
      "id": "af_propagation_eq",
      "name": "Atrial Flutter Propagation Equation",
      "latex": "\\frac{d^2V}{dx^2} = \\beta (V_{rest} - V)",
      "description": "Models electrical activity propagation in atrial tissue",
      "evidence": "novel"
    }
  ],
  "name": "Atrial Flutter",
  "icd10": "I48.3",
  "category": "cardiovascular",
  "description": "Comprehensive model for Atrial Flutter"
},

  // AUTO-GENERATED: Ventricular Tachycardia
  ventricular_tachycardia: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial changes",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Early symptoms",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive disease",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Advanced disease",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "palpitations",
      "dizziness",
      "syncope",
      "chest pain",
      "shortness of breath"
    ],
    "labTests": [
      {
        "name": "Electrolyte panel",
        "value": "Abnormal potassium levels",
        "significance": "May trigger arrhythmias"
      },
      {
        "name": "Electrocardiogram",
        "value": "Wide complex tachycardia",
        "significance": "Diagnostic for VT"
      }
    ],
    "imaging": [
      {
        "type": "Echocardiogram",
        "findings": "Reduced ejection fraction"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "amiodarone",
          "beta-blockers"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "catheter ablation"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "reduce caffeine"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Ventricular dilation"
        },
        "lv_wall_thickness": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Mild hypertrophy"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.6,
          "absolute": null,
          "note": "Increased end-diastolic pressure"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Decreased ejection fraction"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Altered calcium dynamics"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 2.5,
          "absolute": null,
          "note": "Raised due to ventricular stress"
        }
      }
    },
    "lungs": {
      "geometry": {
        "alveolar_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No significant change"
        }
      },
      "pressures": {
        "pulmonary_artery_pressure": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Elevated pressure"
        }
      },
      "physiology": {
        "respiratory_rate": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased due to compensatory mechanisms"
        }
      },
      "cellular": {
        "oxygen_transport": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slightly reduced efficiency"
        }
      },
      "lab_tests": {
        "blood_gasses": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Possible mild metabolic acidosis"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "renal_size": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal size"
        }
      },
      "pressures": {
        "glomerular_pressure": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Compensatory increase"
        }
      },
      "physiology": {
        "filtration_rate": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Reduced filtration due to heart failure"
        }
      },
      "cellular": {
        "reabsorption": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Altered renal handling"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Elevated indicating renal impairment"
        }
      }
    },
    "blood": {
      "geometry": {
        "hematocrit": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Slight increase due to dehydration"
        }
      },
      "pressures": {
        "systemic_vascular_resistance": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased due to high sympathetic tone"
        }
      },
      "physiology": {
        "oxygen_transport": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slightly compromised"
        }
      },
      "cellular": {
        "red_blood_cell_lifespan": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slight reduction"
        }
      },
      "lab_tests": {
        "hemoglobin": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Typically normal"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No significant change"
        }
      },
      "pressures": {
        "osmotic_pressure": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Stable"
        }
      },
      "physiology": {
        "ion_channel_activity": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Altered ion channel function"
        }
      },
      "cellular": {
        "apoptosis_rate": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Slightly increased"
        }
      },
      "lab_tests": {
        "calcium_level": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Slightly elevated"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "KCNH2",
      "SCN5A"
    ],
    "snps": [
      "rs1805123",
      "rs6599230"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "vt_arrhythmia_risk",
      "name": "Arrhythmia Risk Model",
      "latex": "R = \\alpha \\times HR + \\beta \\times QRS_d + \\gamma \\times EF",
      "description": "Estimates risk of ventricular tachycardia based on heart rate, QRS duration, and ejection fraction.",
      "evidence": "novel"
    },
    {
      "id": "vt_hemodynamic_model",
      "name": "Hemodynamic Impact Model",
      "latex": "H = \\delta \\times SVR - \\epsilon \\times CO",
      "description": "Simulates the hemodynamic effects of tachycardia considering systemic vascular resistance and cardiac output.",
      "evidence": "novel"
    }
  ],
  "name": "Ventricular Tachycardia",
  "icd10": "I47.2",
  "category": "cardiovascular",
  "description": "Comprehensive model for Ventricular Tachycardia"
},

  // AUTO-GENERATED: Aortic Stenosis
  aortic_stenosis: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial changes",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Early symptoms",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive disease",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Advanced disease",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "chest pain",
      "shortness of breath",
      "fatigue",
      "dizziness",
      "syncope"
    ],
    "labTests": [
      {
        "name": "BNP",
        "value": "Elevated levels",
        "significance": "Indicates heart failure"
      }
    ],
    "imaging": [
      {
        "type": "Echocardiogram",
        "findings": "Calcification and narrowing of the aortic valve"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "beta-blockers",
          "diuretics"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "aortic valve replacement"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "salt reduction"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Increased volume due to compensation"
        },
        "lv_wall_thickness": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Hypertrophy"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.8,
          "absolute": null,
          "note": "Elevated filling pressure"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Reduced due to stenosis"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Altered calcium signaling"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 3.5,
          "absolute": null,
          "note": "Significantly elevated due to heart stress"
        }
      }
    },
    "lungs": {
      "geometry": {
        "pulmonary_edema": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Fluid accumulation due to heart failure"
        }
      },
      "pressures": {
        "pulmonary_artery_pressure": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Increased"
        }
      },
      "physiology": {
        "oxygen_exchange": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Reduced efficiency"
        }
      },
      "cellular": {
        "alveolar_epithelium": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Epithelial damage"
        }
      },
      "lab_tests": {
        "abg_oxygen": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Decreased blood oxygen levels"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "glomerular_volume": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Mild increase due to hypertension"
        }
      },
      "pressures": {
        "renal_artery_pressure": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Elevated due to systemic hypertension"
        }
      },
      "physiology": {
        "gfr": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Reduced filtration rate"
        }
      },
      "cellular": {
        "tubular_reabsorption": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Impaired"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Elevated indicating reduced kidney function"
        }
      }
    },
    "blood": {
      "geometry": {
        "blood_viscosity": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Slight increase"
        }
      },
      "pressures": {
        "blood_pressure": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased systemic pressure"
        }
      },
      "physiology": {
        "oxygen_transport": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slightly reduced"
        }
      },
      "cellular": {
        "red_blood_cells": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal"
        }
      },
      "lab_tests": {
        "hemoglobin": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal except in chronic states"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_size": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Unchanged"
        }
      },
      "pressures": {
        "cell_membrane_pressure": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal"
        }
      },
      "physiology": {
        "metabolic_activity": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slightly decreased"
        }
      },
      "cellular": {
        "mitochondrial_function": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Reduced due to increased demand"
        }
      },
      "lab_tests": {
        "lactate": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Elevated in advanced stages"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "NOTCH1",
      "LMNA"
    ],
    "snps": [
      "rs1299982",
      "rs1801133"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "aortic_stenosis_eq1",
      "name": "Valve Area Function",
      "latex": "A_v = P / (G \\times R)",
      "description": "Relates valve area (A_v) to pressure (P), gradient (G), and resistance (R)",
      "evidence": "novel"
    },
    {
      "id": "aortic_stenosis_eq2",
      "name": "Pressure-Gradient Relationship",
      "latex": "\\Delta P = Q^2 / E",
      "description": "Models pressure gradient (\\Delta P) as a function of flow (Q) and elasticity (E)",
      "evidence": "novel"
    }
  ],
  "name": "Aortic Stenosis",
  "icd10": "I35.0",
  "category": "cardiovascular",
  "description": "Comprehensive model for Aortic Stenosis"
},

  // AUTO-GENERATED: Mitral Regurgitation
  mitral_regurgitation: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial valve prolapse with no symptoms",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Presence of early symptoms like palpitations and fatigue",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progression to symptoms at rest, such as shortness of breath",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Advanced symptoms leading to heart failure",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "dyspnea",
      "fatigue",
      "palpitations",
      "orthopnea",
      "peripheral edema"
    ],
    "labTests": [
      {
        "name": "BNP",
        "value": "elevated",
        "significance": "Indicates heart failure"
      }
    ],
    "imaging": [
      {
        "type": "Echocardiogram",
        "findings": "Mitral valve prolapse with regurgitant jet"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "ACE inhibitors",
          "Beta-blockers"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "Mitral valve repair or replacement"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "Diet modification",
          "Exercise prescription"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Left ventricular volume increase"
        },
        "lv_wall_thickness": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Possible thinning due to dilation"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.6,
          "absolute": null,
          "note": "Increased ventricular filling pressure"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.75,
          "absolute": null,
          "note": "Reduced ejection fraction over time"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Impaired calcium handling due to overloaded state"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 3.5,
          "absolute": null,
          "note": "Elevated in response to cardiac stress"
        }
      }
    },
    "lungs": {
      "geometry": {
        "alveolar_space": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Potential fluid accumulation affecting spaces"
        }
      },
      "pressures": {
        "pulmonary_artery_pressure": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increased due to backflow pressure"
        }
      },
      "physiology": {
        "gas_exchange": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Compromised due to congestion"
        }
      },
      "cellular": {
        "surfactant_production": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slight reduction due to surface tension changes"
        }
      },
      "lab_tests": {
        "blood_gas": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Altered CO2 and O2 levels due to reduced exchange"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "glomerular_filtration_surface": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Potentially reduced due to perfusion changes"
        }
      },
      "pressures": {
        "renal_artery_pressure": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "May decrease due to systemic effects"
        }
      },
      "physiology": {
        "filtration_rate": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Reduced GFR indicative of impaired kidney function"
        }
      },
      "cellular": {
        "sodium_reabsorption": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Compensatory mechanism for fluid retention"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated due to impaired filtration"
        }
      }
    },
    "blood": {
      "geometry": {
        "hemoglobin": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Possible increase due to chronic hypoxia"
        }
      },
      "pressures": {
        "systemic_vascular_resistance": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased as compensatory mechanism"
        }
      },
      "physiology": {
        "oxygen_carrying_capacity": {
          "multiplier": 1.05,
          "absolute": null,
          "note": "Enhanced due to hemoconcentration"
        }
      },
      "cellular": {
        "red_cell_mass": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Increase in response to hypoxia"
        }
      },
      "lab_tests": {
        "hematocrit": {
          "multiplier": 1.15,
          "absolute": null,
          "note": "Elevation indicating increased cell mass"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_size": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Hypertrophy in response to stress"
        }
      },
      "pressures": {
        "osmotic_pressure": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Slight increase"
        }
      },
      "physiology": {
        "metabolic_rate": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Overall increase due to heightened energy demand"
        }
      },
      "cellular": {
        "signal_transduction": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Altered due to pathological stress"
        }
      },
      "lab_tests": {
        "enzyme_activity": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased activity in response to cellular stress"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "MYH6",
      "LMNA"
    ],
    "snps": [
      "rs46522",
      "rs9349379"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "mitral_regurgitation_eq1",
      "name": "Mitral Regurgitation Volume Equation",
      "latex": "R = f\\times(1-V_r/V_{ed})",
      "description": "Equation modeling regurgitant volume as a function of ventricular changes",
      "evidence": "novel"
    },
    {
      "id": "ventricle_stress_eq",
      "name": "Left Ventricle Wall Stress",
      "latex": "\\sigma = (P\\times r)/(2t)",
      "description": "Calculated wall stress incorporating pressure, radius, and wall thickness",
      "evidence": "novel"
    }
  ],
  "name": "Mitral Regurgitation",
  "icd10": "I34.0",
  "category": "cardiovascular",
  "description": "Comprehensive model for Mitral Regurgitation"
},

  // AUTO-GENERATED: Infective Endocarditis
  infective_endocarditis: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial endothelial damage and bacterial entry",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Formation of vegetations on valves",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive valve destruction and systemic embolization",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Severe heart failure and systemic infection",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "fever",
      "murmur",
      "petechiae",
      "Osler nodes",
      "Janeway lesions"
    ],
    "labTests": [
      {
        "name": "Blood cultures",
        "value": "Positive for pathogens",
        "significance": "Confirms infectious cause"
      },
      {
        "name": "ESR/CRP",
        "value": "Elevated",
        "significance": "Indicates inflammation"
      }
    ],
    "imaging": [
      {
        "type": "Echocardiography",
        "findings": "Vegetations on valves"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "antibiotics"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "valve replacement surgery"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "risk factor management (e.g., dental hygiene, intravenous drug use intervention)"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Possible dilation due to valvular dysfunction"
        },
        "lv_wall_thickness": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No significant change"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.8,
          "absolute": null,
          "note": "Increased filling pressures due to volume overload"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Reduced due to compromised valvular function"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Impaired contraction efficiency"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 2.5,
          "absolute": null,
          "note": "Indicates heart failure"
        }
      }
    },
    "lungs": {
      "geometry": {
        "lung_volume": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Minor changes due to fluid overload"
        }
      },
      "pressures": {
        "pulmonary_artery_pressure": {
          "multiplier": 1.6,
          "absolute": null,
          "note": "Increased due to left-sided heart failure"
        }
      },
      "physiology": {
        "oxygen_exchange": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Reduced efficiency due to congestion"
        }
      },
      "cellular": {
        "alveolar_capillary_permeability": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased due to inflammation"
        }
      },
      "lab_tests": {
        "blood_gas_analysis": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Potential hypoxia signs"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "renal_cortex_thickness": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No significant anatomical changes"
        }
      },
      "pressures": {
        "glomerular_filtration_pressure": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Potential decline due to decreased perfusion"
        }
      },
      "physiology": {
        "glomerular_filtration_rate": {
          "multiplier": 0.6,
          "absolute": null,
          "note": "Reduced efficiency"
        }
      },
      "cellular": {
        "renal_tubular_handling": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Compromised due to systemic effects"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Slightly elevated due to impaired renal perfusion"
        }
      }
    },
    "blood": {
      "geometry": {
        "red_blood_cell_count": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Possible anemia"
        }
      },
      "pressures": {
        "systemic_vascular_resistance": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased due to compensatory mechanisms"
        }
      },
      "physiology": {
        "coagulation_activity": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Potential hypercoagulability"
        }
      },
      "cellular": {
        "immune_response": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Heightened due to infection"
        }
      },
      "lab_tests": {
        "white_blood_cell_count": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated indicative of infection"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No significant change"
        }
      },
      "pressures": {
        "osmotic_pressure": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Minor alterations due to systemic changes"
        }
      },
      "physiology": {
        "metabolic_activity": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased due to systemic inflammation"
        }
      },
      "cellular": {
        "inflammatory_mediators": {
          "multiplier": 1.7,
          "absolute": null,
          "note": "Elevated due to infection"
        }
      },
      "lab_tests": {
        "procalcitonin": {
          "multiplier": 3.0,
          "absolute": null,
          "note": "Significantly elevated due to severe infection"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "SERPINA1",
      "IL6"
    ],
    "snps": [
      "rs2228145",
      "rs1800795"
    ],
    "heritability": 0.3,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "vegetation_growth_rate",
      "name": "Vegetation Growth Rate Equation",
      "latex": "V(t) = V_0 e^{kt}",
      "description": "Models the exponential growth of bacterial vegetations on heart valves over time",
      "evidence": "novel"
    },
    {
      "id": "systemic_inflammation_index",
      "name": "Systemic Inflammation Index",
      "latex": "SII = \\frac{N_e}{L_e}",
      "description": "Calculates the ratio of neutrophil to lymphocyte count as an index of inflammation",
      "evidence": "novel"
    }
  ],
  "name": "Infective Endocarditis",
  "icd10": "I33.0",
  "category": "cardiovascular",
  "description": "Comprehensive model for Infective Endocarditis"
},

  // AUTO-GENERATED: Aortic Dissection
  aortic_dissection: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "vascular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial minor tears in the aortic wall with no symptoms.",
      "yearsFromOnset": "0-1"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Intermittent chest pain and mild blood pressure discrepancies.",
      "yearsFromOnset": "1-3"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "More pronounced chest pain, back pain, and possible fainting.",
      "yearsFromOnset": "3-5"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Severe chest pain, propagation to arterial branches leading to organ ischemia.",
      "yearsFromOnset": ">5"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "sudden severe chest or back pain",
      "syncope",
      "shortness of breath",
      "weakness",
      "signs of new heart murmur"
    ],
    "labTests": [
      {
        "name": "D-dimer",
        "value": "Elevated",
        "significance": "Indicates high likelihood of aortic dissection"
      }
    ],
    "imaging": [
      {
        "type": "CT Angiography",
        "findings": "Intimal flap and double lumen characteristic of dissection"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "Beta blockers",
          "ACE inhibitors"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "Aortic repair surgery"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "Blood pressure management"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Possible compensatory dilation due to altered hemodynamics"
        }
      },
      "pressures": {
        "aortic_pressure": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated due to turbulence and resistance"
        },
        "lv_edp": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Increased filling pressures"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Often preserved unless severe"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Possible impairment in calcium handling"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 2.0,
          "absolute": null,
          "note": "Indicative of cardiac stress"
        }
      }
    },
    "lungs": {
      "geometry": {
        "alveolar_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Typically unchanged"
        }
      },
      "pressures": {
        "pulmonary_pressure": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "May increase secondary to heart strain"
        }
      },
      "physiology": {
        "gas_exchange_efficiency": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slightly affected if cardiac output falls"
        }
      },
      "cellular": {
        "oxygenation": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Potential minor decrease"
        }
      },
      "lab_tests": {
        "arterial_blood_gas": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Possible slight acidosis"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "gfr": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Reduced filtration rate due to decreased perfusion"
        }
      },
      "pressures": {
        "renal_artery_pressure": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased due to systemic hypertension"
        }
      },
      "physiology": {
        "filtration_rate": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Compromised due to lowered blood flow"
        }
      },
      "cellular": {
        "na_k_pump": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Potentially reduced efficiency"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated indicating renal impairment"
        }
      }
    },
    "blood": {
      "geometry": {
        "viscosity": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Potential increase in response to systemic changes"
        }
      },
      "pressures": {
        "systemic_vascular_resistance": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Elevated due to compensatory mechanisms"
        }
      },
      "physiology": {
        "oxygen_carrying_capacity": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Potential minor reduction"
        }
      },
      "cellular": {
        "hematocrit": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Mild increase as compensatory response"
        }
      },
      "lab_tests": {
        "hemoglobin": {
          "multiplier": 1.05,
          "absolute": null,
          "note": "Generally stable, slight increase possible"
        }
      }
    },
    "vascular": {
      "geometry": {
        "aortic_diameter": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Dilation in response to dissection"
        }
      },
      "pressures": {
        "intraluminal_pressure": {
          "multiplier": 1.8,
          "absolute": null,
          "note": "Significantly elevated within dissection"
        }
      },
      "physiology": {
        "vascular_stiffness": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increased stiffness due to pathological changes"
        }
      },
      "cellular": {
        "smooth_muscle_cells": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Altered function due to dissection area"
        }
      },
      "lab_tests": {
        "inflammation_markers": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated due to vascular injury"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "FBN1",
      "ACTA2"
    ],
    "snps": [
      "rs117907580",
      "rs3737728"
    ],
    "heritability": 0.6,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "aortic_dissection_hemodynamics",
      "name": "Aortic Dissection Hemodynamics Equation",
      "latex": "P = \\frac{T}{r}",
      "description": "Relates circumferential wall tension (T), pressure (P), and radius (r) to describe stress on aortic wall during dissection.",
      "evidence": "novel"
    },
    {
      "id": "dissection_progression_model",
      "name": "Dissection Progression Model",
      "latex": "dL/dt = k(L_{max} - L)",
      "description": "Models the growth rate (dL/dt) of dissection length (L) related to a maximal potential length (L_max) and growth constant (k).",
      "evidence": "novel"
    }
  ],
  "name": "Aortic Dissection",
  "icd10": "I71.0",
  "category": "cardiovascular",
  "description": "Comprehensive model for Aortic Dissection"
},

  // AUTO-GENERATED: Cardiac Tamponade
  cardiac_tamponade: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial accumulation of pericardial fluid causing minor hemodynamic changes.",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Increase in pericardial effusion, leading to early symptoms like tachycardia and mild dyspnea.",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Significant fluid accumulation, causing increased pressure and cardiac compromise.",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Critical compression of cardiac chambers, resulting in severe reduced cardiac output and life-threatening condition.",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "dyspnea",
      "tachycardia",
      "distended neck veins",
      "hypotension",
      "pulsus paradoxus"
    ],
    "labTests": [
      {
        "name": "Echocardiogram",
        "value": "Pericardial effusion",
        "significance": "Assessment of fluid accumulation and hemodynamic impact"
      }
    ],
    "imaging": [
      {
        "type": "Chest X-ray",
        "findings": "Enlarged cardiac silhouette"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "diuretics",
          "pain management"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "pericardiocentesis"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "activity modification"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No direct change"
        },
        "lv_wall_thickness": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No direct change"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 2.0,
          "absolute": null,
          "note": "Significantly increased filling pressures due to external compression"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Slightly reduced ejection fraction due to impaired filling"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Minor impairments due to decreased perfusion"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 2.5,
          "absolute": null,
          "note": "Moderately elevated due to heart stress"
        }
      }
    },
    "lungs": {
      "geometry": {
        "lung_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal geometry"
        }
      },
      "pressures": {
        "pulmonary_pressure": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated pulmonary pressures"
        }
      },
      "physiology": {
        "oxygenation": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Reduced oxygen saturation due to impaired cardiac output"
        }
      },
      "cellular": {
        "alveolar_capillary_diffusion": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Slight reduction"
        }
      },
      "lab_tests": {
        "arterial_blood_gases": {
          "multiplier": null,
          "absolute": "Reduced PaO2",
          "note": "Decreased PaO2"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "renal_size": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal size"
        }
      },
      "pressures": {
        "renal_perfusion_pressure": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Reduced perfusion pressure"
        }
      },
      "physiology": {
        "filtration_rate": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Reduced GFR"
        }
      },
      "cellular": {
        "tubular_secretion": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Slight reduction"
        }
      },
      "lab_tests": {
        "serum_creatinine": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated due to impaired kidney function"
        }
      }
    },
    "blood": {
      "geometry": {
        "volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal overall volume"
        }
      },
      "pressures": {
        "central_venous_pressure": {
          "multiplier": 3.0,
          "absolute": null,
          "note": "Elevated due to impaired return"
        }
      },
      "physiology": {
        "circulation_efficiency": {
          "multiplier": 0.7,
          "absolute": null,
          "note": "Reduced efficiency due to obstruction"
        }
      },
      "cellular": {
        "red_blood_cell_production": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No direct effect"
        }
      },
      "lab_tests": {
        "hemoglobin": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Typically normal unless other factors apply"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No direct change"
        }
      },
      "pressures": {
        "osmotic_pressure": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Typically unaffected"
        }
      },
      "physiology": {
        "metabolic_rate": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Slight reduction due to decreased perfusion"
        }
      },
      "cellular": {
        "gene_expression": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Mostly unchanged"
        }
      },
      "lab_tests": {
        "metabolic_panel": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Generally normal if isolated to cardiac issue"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "TPM1",
      "MYH7"
    ],
    "snps": [
      "rs121434569",
      "rs3729985"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "tamponade_pressure_eq",
      "name": "Tamponade Pressure Equation",
      "latex": "P_e = (f_c \\cdot D) / (A_m - V_p)",
      "description": "Equation to predict pericardial pressure from fluid compression and atrial motion",
      "evidence": "novel"
    },
    {
      "id": "flow_reduction_eq",
      "name": "Flow Reduction Equation",
      "latex": "F_r = \\max(0, B_f - C_s \\cdot D_t)",
      "description": "Predicts reduction in flow based on compression dynamics",
      "evidence": "novel"
    }
  ],
  "name": "Cardiac Tamponade",
  "icd10": "I31.4",
  "category": "cardiovascular",
  "description": "Comprehensive model for Cardiac Tamponade"
},

  // AUTO-GENERATED: Constrictive Pericarditis
  constrictive_pericarditis: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial fibrotic changes in the pericardium without overt symptoms",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Early symptoms such as fatigue and mild dyspnea",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive symptoms with chest discomfort and reduced exercise tolerance",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Advanced heart failure with significant functional decline",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "chest pain",
      "shortness of breath",
      "fatigue",
      "swelling of legs",
      "ascites"
    ],
    "labTests": [
      {
        "name": "BNP",
        "value": "Elevated",
        "significance": "Indicates heart failure"
      }
    ],
    "imaging": [
      {
        "type": "Echocardiogram",
        "findings": "Pericardial thickening or calcification"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "diuretics",
          "anti-inflammatory drugs"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "pericardiectomy"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "sodium restriction",
          "regular monitoring"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Restricted ventricular volume due to pericardial constraint"
        },
        "lv_wall_thickness": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No change in wall thickness"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated filling pressure due to impaired diastolic filling"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Preserved ejection fraction despite symptoms"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Slightly impaired calcium handling due to restricted filling"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 2.5,
          "absolute": null,
          "note": "Moderately elevated natriuretic peptide indicating cardiac stress"
        }
      }
    },
    "lungs": {
      "geometry": {
        "lung_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal lung volume"
        }
      },
      "pressures": {
        "pulmonary_pressure": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Slight pulmonary hypertension due to venous congestion"
        }
      },
      "physiology": {
        "oxygen_exchange": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Mildly impaired gas exchange due to fluid overload"
        }
      },
      "cellular": {
        "alveolar_membrane": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal cellular function"
        }
      },
      "lab_tests": {
        "abg": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal arterial blood gas unless acute episode"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "renal_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal renal size"
        }
      },
      "pressures": {
        "glomerular_filtration": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Reduced due to low cardiac output and congestion"
        }
      },
      "physiology": {
        "electrolyte_balance": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Disturbed electrolyte homeostasis"
        }
      },
      "cellular": {
        "renal_tubules": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Unchanged cellular function"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Slightly elevated indicating renal impairment"
        }
      }
    },
    "blood": {
      "geometry": {
        "volume": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Increased due to fluid retention"
        }
      },
      "pressures": {
        "systemic_circulation": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased resistance due to congestion"
        }
      },
      "physiology": {
        "red_blood_cell_count": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal unless hypoxia is severe"
        }
      },
      "cellular": {
        "hematocrit": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Typically normal"
        }
      },
      "lab_tests": {
        "hemoglobin": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal levels maintained"
        }
      }
    },
    "cellular": {
      "calcium_handling": {
        "multiplier": 0.9,
        "absolute": null,
        "note": "Slight global reduction in efficiency"
      },
      "energy_metabolism": {
        "multiplier": 0.85,
        "absolute": null,
        "note": "Reduced ATP production due to impaired perfusion"
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "NLRP3",
      "IL1B"
    ],
    "snps": [
      "rs35829419",
      "rs16944"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "constrictive_pressure_equation",
      "name": "Constrictive Pressure Equation",
      "latex": "P_{eff} = P_{intra} + \\Delta P_{pericardial}",
      "description": "Modeling effective cardiac filling pressures in constrictive pericarditis",
      "evidence": "novel"
    },
    {
      "id": "ventricular_filling_impedance",
      "name": "Ventricular Filling Impedance Model",
      "latex": "Z_vf = R_t + j\\omega L_t + 1/j\\omega C_t",
      "description": "Impedance to ventricular filling as a function of time-variable constraints",
      "evidence": "novel"
    }
  ],
  "name": "Constrictive Pericarditis",
  "icd10": "I31.0",
  "category": "cardiovascular",
  "description": "Comprehensive model for Constrictive Pericarditis"
},

  // AUTO-GENERATED: Wolff-Parkinson-White Syndrome
  wolff_parkinson_white_syndrome: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial changes in conduction pathways, asymptomatic",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Palpitations, mild arrhythmias, and variable ECG findings",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Increased risk of atrial fibrillation and symptomatic arrhythmias",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Frequent tachyarrhythmias, risk of sudden cardiac death",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "palpitations",
      "dizziness",
      "shortness of breath",
      "chest pain",
      "syncope"
    ],
    "labTests": [
      {
        "name": "Electrocardiogram (ECG)",
        "value": "Delta wave presence",
        "significance": "Indicators of accessory pathway"
      }
    ],
    "imaging": [
      {
        "type": "Echocardiogram",
        "findings": "May show normal heart structure, sometimes LVH due to chronic arrhythmias"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "procainamide",
          "beta-blockers"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "radiofrequency catheter ablation"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "avoid excessive caffeine"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Slight ventricular dilation due to increased cardiac workload"
        },
        "lv_wall_thickness": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal or mildly increased due to hypertrophy"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased filling pressure with chronic arrhythmias"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Preserved or slightly decreased ejection fraction"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Altered calcium handling during arrhythmias"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Moderately elevated in chronic cases"
        }
      }
    },
    "lungs": {
      "geometry": {},
      "pressures": {
        "pa_pressure": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Potential mild increase due to left atrial hypertrophy"
        }
      },
      "physiology": {
        "v_q_ratio": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slightly altered ventilation-perfusion ratio"
        }
      },
      "cellular": {},
      "lab_tests": {
        "blood_gas_analysis": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Usually normal"
        }
      }
    },
    "kidneys": {
      "geometry": {},
      "pressures": {
        "glomerular_pressure": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Typically unaltered"
        }
      },
      "physiology": {
        "gfr": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slight reduction in extreme cases"
        }
      },
      "cellular": {},
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Marginally elevated in chronic tachyarrhythmia"
        }
      }
    },
    "blood": {
      "geometry": {},
      "pressures": {},
      "physiology": {
        "coagulation_profile": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased risk of thrombosis"
        }
      },
      "cellular": {},
      "lab_tests": {
        "d_dimer": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Elevated in certain cases of atrial fibrillation"
        }
      }
    },
    "cellular": {
      "geometry": {},
      "pressures": {},
      "physiology": {},
      "cellular": {
        "action_potential": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Modified action potential due to accessory pathways"
        }
      },
      "lab_tests": {}
    }
  },
  "geneticFactors": {
    "genes": [
      "PRKAG2",
      "SCN5A"
    ],
    "snps": [
      "rs1805124",
      "rs7626962"
    ],
    "heritability": 0.5,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "wpw_pathway_activation",
      "name": "Accessory Pathway Activation",
      "latex": "P_{AP} = \\frac{1}{1 + e^{-k(x - x_0)}}",
      "description": "Sigmoid function describing activation probability of the accessory pathway",
      "evidence": "novel"
    },
    {
      "id": "tachyarrhythmia_risk",
      "name": "Tachyarrhythmia Risk Assessment",
      "latex": "R_{TA} = a \\cdot \\frac{ECG_{delta}}{HR_{rest}}",
      "description": "A formula assessing risk of tachyarrhythmia based on ECG and resting heart rate",
      "evidence": "novel"
    }
  ],
  "name": "Wolff-Parkinson-White Syndrome",
  "icd10": "I45.6",
  "category": "cardiovascular",
  "description": "Comprehensive model for Wolff-Parkinson-White Syndrome"
},

  // AUTO-GENERATED: Peripheral Arterial Disease
  peripheral_arterial_disease: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial endothelial dysfunction.",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Intermittent claudication.",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Persistent ischemic symptoms.",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Critical limb ischemia.",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "claudication",
      "rest pain",
      "ulcers",
      "gangrene",
      "weak pulses"
    ],
    "labTests": [
      {
        "name": "Ankle-Brachial Index",
        "value": "<0.9",
        "significance": "Indicates occlusion"
      }
    ],
    "imaging": [
      {
        "type": "Doppler Ultrasound",
        "findings": "Reduced blood flow"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "cilostazol",
          "statins"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "angioplasty"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "smoking cessation",
          "exercise"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Mild dilation"
        },
        "lv_wall_thickness": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No change in thickness"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Slightly elevated"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Preserved ejection fraction"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Slightly impaired"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Mildly elevated"
        }
      }
    },
    "lungs": {
      "geometry": {
        "lung_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No change"
        }
      },
      "pressures": {
        "pulmonary_artery_pressure": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased pressure"
        }
      },
      "physiology": {
        "gas_exchange": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Minor impairment"
        }
      },
      "cellular": {
        "oxidative_stress": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Increased oxidative stress"
        }
      },
      "lab_tests": {
        "oxygen_saturation": {
          "multiplier": 0.98,
          "absolute": null,
          "note": "Slight reduction"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "gfr": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Reduced glomerular filtration rate"
        }
      },
      "pressures": {
        "renal_artery_pressure": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Mildly elevated"
        }
      },
      "physiology": {
        "electrolyte_balance": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Altered balance"
        }
      },
      "cellular": {
        "nephron_damage": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increased nephron damage"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.6,
          "absolute": null,
          "note": "Elevated serum creatinine"
        }
      }
    },
    "blood": {
      "geometry": {
        "blood_volume": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "No change"
        }
      },
      "pressures": {
        "systolic_pressure": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased systolic pressure"
        }
      },
      "physiology": {
        "coagulation": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Increased coagulability"
        }
      },
      "cellular": {
        "inflammatory_markers": {
          "multiplier": 2.0,
          "absolute": null,
          "note": "Elevated inflammatory status"
        }
      },
      "lab_tests": {
        "d_dimer": {
          "multiplier": 2.5,
          "absolute": null,
          "note": "Increased d-dimer levels"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_size": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal cell size"
        }
      },
      "pressures": {
        "intracellular_pressure": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Normal pressure"
        }
      },
      "physiology": {
        "metabolic_activity": {
          "multiplier": 0.85,
          "absolute": null,
          "note": "Decreased metabolism"
        }
      },
      "cellular": {
        "apoptosis_rate": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Increased apoptosis"
        }
      },
      "lab_tests": {
        "cytokines": {
          "multiplier": 3.0,
          "absolute": null,
          "note": "Elevated pro-inflammatory cytokines"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "VEGFA",
      "NOS3"
    ],
    "snps": [
      "rs61748181",
      "rs1799983"
    ],
    "heritability": 0.4,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "pad_blood_flow",
      "name": "PAD Blood Flow Deterioration",
      "latex": "Q = \\frac{\\Delta P}{R}",
      "description": "Models the decrease in blood flow due to increased vascular resistance.",
      "evidence": "novel"
    },
    {
      "id": "vascular_resistance_equation",
      "name": "Vascular Resistance and Claudication",
      "latex": "R = \\frac{8 \\eta L}{\\pi r^4}",
      "description": "Describes how vascular resistance affects claudication in PAD.",
      "evidence": "novel"
    }
  ],
  "name": "Peripheral Arterial Disease",
  "icd10": "I73.9",
  "category": "cardiovascular",
  "description": "Comprehensive model for Peripheral Arterial Disease"
},

  // AUTO-GENERATED: Deep Vein Thrombosis
  deep_vein_thrombosis: {
  "primaryOrgan": "heart",
  "affectedOrgans": [
    "heart",
    "lungs",
    "kidneys",
    "blood",
    "cellular"
  ],
  "progression": [
    {
      "stage": 1,
      "name": "Early/Subclinical",
      "severity": 0.2,
      "description": "Initial changes",
      "yearsFromOnset": "0-2"
    },
    {
      "stage": 2,
      "name": "Mild",
      "severity": 0.4,
      "description": "Early symptoms",
      "yearsFromOnset": "2-5"
    },
    {
      "stage": 3,
      "name": "Moderate",
      "severity": 0.6,
      "description": "Progressive disease",
      "yearsFromOnset": "5-10"
    },
    {
      "stage": 4,
      "name": "Severe/End-stage",
      "severity": 0.9,
      "description": "Advanced disease",
      "yearsFromOnset": ">10"
    }
  ],
  "clinicalPresentation": {
    "symptoms": [
      "leg pain",
      "leg swelling",
      "skin discoloration",
      "warmth over affected area",
      "shortness of breath"
    ],
    "labTests": [
      {
        "name": "D-dimer",
        "value": "Elevated",
        "significance": "Indicates presence of thrombosis"
      }
    ],
    "imaging": [
      {
        "type": "Ultrasound",
        "findings": "Venous thrombosis in deep veins"
      }
    ],
    "treatments": [
      {
        "category": "Medications",
        "items": [
          "anticoagulants",
          "thrombolytics"
        ]
      },
      {
        "category": "Procedures",
        "items": [
          "compression stockings"
        ]
      },
      {
        "category": "Lifestyle",
        "items": [
          "smoking cessation",
          "regular exercise"
        ]
      }
    ]
  },
  "modifications": {
    "heart": {
      "geometry": {
        "lv_edv": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Potential dilation due to pulmonary embolism complications"
        }
      },
      "pressures": {
        "lv_edp": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Elevated due to right heart strain"
        }
      },
      "physiology": {
        "ef": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slightly reduced due to increased workload"
        }
      },
      "cellular": {
        "calcium_transient": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Minor alterations"
        }
      },
      "lab_tests": {
        "bnp": {
          "multiplier": 2.5,
          "absolute": null,
          "note": "Elevated due to heart strain"
        }
      }
    },
    "lungs": {
      "geometry": {
        "rv": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Right heart dilation due to pulmonary hypertension"
        }
      },
      "pressures": {
        "pap": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated pulmonary arterial pressure"
        }
      },
      "physiology": {
        "oxygenation": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Impaired oxygen exchange"
        }
      },
      "cellular": {
        "sodium_transport": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Reduced efficiency"
        }
      },
      "lab_tests": {
        "arterial_blood_gas": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Altered gas levels"
        }
      }
    },
    "kidneys": {
      "geometry": {
        "gfr": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Mild reduction in filtration rate"
        }
      },
      "pressures": {
        "renal_arterial_pressure": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Increased due to circulation changes"
        }
      },
      "physiology": {
        "water_reabsorption": {
          "multiplier": 0.9,
          "absolute": null,
          "note": "Altered due to venous congestion"
        }
      },
      "cellular": {
        "aquaporin_expression": {
          "multiplier": 0.95,
          "absolute": null,
          "note": "Slight reduction"
        }
      },
      "lab_tests": {
        "creatinine": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Slightly elevated"
        }
      }
    },
    "blood": {
      "geometry": {
        "platelet_count": {
          "multiplier": 1.0,
          "absolute": null,
          "note": "Varies with treatment"
        }
      },
      "pressures": {
        "blood_pressure": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Can increase due to stress response"
        }
      },
      "physiology": {
        "clotting_factor_activity": {
          "multiplier": 1.4,
          "absolute": null,
          "note": "Increased pro-thrombotic activity"
        }
      },
      "cellular": {
        "fibrinogen_levels": {
          "multiplier": 1.3,
          "absolute": null,
          "note": "Elevated, contributing to clot formation"
        }
      },
      "lab_tests": {
        "ptt": {
          "multiplier": 0.8,
          "absolute": null,
          "note": "Potentially reduced if initiating treatment"
        }
      }
    },
    "cellular": {
      "geometry": {
        "cell_adhesion_molecules": {
          "multiplier": 1.2,
          "absolute": null,
          "note": "Increased expression"
        }
      },
      "pressures": {},
      "physiology": {
        "metabolic_activity": {
          "multiplier": 1.1,
          "absolute": null,
          "note": "Increased activity"
        }
      },
      "cellular": {
        "cytokine_levels": {
          "multiplier": 1.5,
          "absolute": null,
          "note": "Elevated in response to thrombosis"
        }
      },
      "lab_tests": {
        "crp": {
          "multiplier": 2.0,
          "absolute": null,
          "note": "Elevated indicating inflammation"
        }
      }
    }
  },
  "geneticFactors": {
    "genes": [
      "F5",
      "F2"
    ],
    "snps": [
      "rs6025",
      "rs1799963"
    ],
    "heritability": 0.5,
    "penetrance": "Variable"
  },
  "novelEquations": [
    {
      "id": "dvt_clotting_equation",
      "name": "DVT Clotting Equation",
      "latex": "C = k \\times F \\times (1 + \\log(P))",
      "description": "Models increased clot formation due to factor interaction",
      "evidence": "novel"
    },
    {
      "id": "embolic_risk_model",
      "name": "Embolic Risk Model",
      "latex": "R = \\, \\beta_0 + \\beta_1 \\times S + \\beta_2 \\times D",
      "description": "Predicts embolic risk based on symptomatology and demographics",
      "evidence": "novel"
    }
  ],
  "name": "Deep Vein Thrombosis",
  "icd10": "I82.4",
  "category": "cardiovascular",
  "description": "Comprehensive model for Deep Vein Thrombosis"
},};

export default DISEASE_MODELS;
