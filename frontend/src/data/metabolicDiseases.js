// ============================================================
// METABOLIC/ENDOCRINE DISEASES DATABASE
// Comprehensive ICD-10 coverage for metabolic and endocrine disorders
// ICD-10: E00-E89 (Endocrine, nutritional and metabolic diseases)
// ============================================================

export const METABOLIC_DISEASES = {
  // =====================
  // DIABETES MELLITUS
  // ICD-10: E10-E14 Series
  // =====================

  E11_9: {
    name: "Type 2 Diabetes Mellitus",
    icd10: "E11.9",
    category: "metabolic",
    definition: "Chronic metabolic disorder characterized by insulin resistance and relative insulin deficiency",
    primaryOrgan: "pancreas",
    affectedOrgans: ["pancreas", "kidneys", "heart", "brain"],
    pathophysiology: {
      mechanism: "Insulin resistance → pancreatic β-cell compensation → eventual β-cell failure → hyperglycemia",
      molecularBasis: "Defects in insulin signaling (IRS-1/PI3K/Akt pathway), glucotoxicity, lipotoxicity, adipokine dysregulation"
    },
    clinicalPresentation: {
      symptoms: [
        "Polyuria",
        "Polydipsia",
        "Polyphagia",
        "Fatigue",
        "Blurred vision",
        "Slow wound healing",
        "Recurrent infections"
      ],
      signs: [
        "Obesity (central adiposity)",
        "Acanthosis nigricans",
        "Skin tags",
        "Hypertension",
        "Diabetic dermopathy"
      ]
    },
    laboratoryFindings: [
      { name: "Fasting Glucose", normalRange: "70-99 mg/dL", abnormalInDisease: "≥126 mg/dL (diabetes)" },
      { name: "HbA1c", normalRange: "<5.7%", abnormalInDisease: "≥6.5% (diabetes)" },
      { name: "Random Glucose", normalRange: "<140 mg/dL", abnormalInDisease: "≥200 mg/dL with symptoms" },
      { name: "C-peptide", normalRange: "0.5-2.0 ng/mL", abnormalInDisease: "Normal or elevated (insulin resistance)" },
      { name: "Fasting Insulin", normalRange: "2-25 µIU/mL", abnormalInDisease: "Elevated (hyperinsulinemia)" }
    ],
    imagingFindings: {
      ultrasound: ["Fatty liver (NAFLD common)", "Pancreatic fat infiltration"],
      echo: ["LV hypertrophy", "Diastolic dysfunction"]
    },
    modifications: {
      pancreas: {
        geometry: {
          pancreas_weight: { factor: 0.85, note: "Reduced β-cell mass" },
          islet_count: { factor: 0.85, note: "Islet loss" },
          beta_cell_mass: { factor: 0.6, note: "β-cell apoptosis and dedifferentiation" }
        },
        physiology: {
          fasting_glucose: { factor: 1.25, note: "Elevated >126 mg/dL" },
          fasting_insulin: { factor: 1.25, note: "Initially elevated, then falls" },
          hba1c: { factor: 1.2, note: "Elevated >6.5%" },
          homa_ir: { factor: 2.0, note: "Insulin resistance" },
          homa_b: { factor: 0.75, note: "β-cell dysfunction" },
          insulin_secretion: { factor: 0.7, note: "Lost first phase" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.85, note: "Early hyperfiltration, later decline" }
        }
      },
      heart: {
        physiology: {
          cardiac_output: { factor: 1.1, note: "Hyperdynamic state" }
        }
      },
      liver: {
        physiology: {
          alt: { factor: 1.3, note: "NAFLD common" }
        }
      },
      brain: {
        physiology: {
          cbf: { factor: 0.95, note: "Microvascular changes" }
        }
      }
    },
    severity: {
      mild: { description: "HbA1c 6.5-7.0%, no complications" },
      moderate: { description: "HbA1c 7.0-9.0%, microvascular complications" },
      severe: { description: "HbA1c >9.0%, multiple complications, insulin-requiring" }
    }
  },

  E10_9: {
    name: "Type 1 Diabetes Mellitus",
    icd10: "E10.9",
    category: "metabolic",
    definition: "Autoimmune destruction of pancreatic β-cells leading to absolute insulin deficiency",
    primaryOrgan: "pancreas",
    affectedOrgans: ["pancreas", "kidneys", "heart"],
    pathophysiology: {
      mechanism: "T-cell mediated autoimmune destruction of β-cells → absolute insulin deficiency → ketosis-prone hyperglycemia",
      molecularBasis: "HLA-DR3/DR4 association, islet autoantibodies (GAD65, IA-2, ZnT8), molecular mimicry"
    },
    clinicalPresentation: {
      symptoms: [
        "Rapid onset polyuria",
        "Polydipsia",
        "Weight loss (despite polyphagia)",
        "Fatigue",
        "Ketoacidosis symptoms (nausea, vomiting, abdominal pain)"
      ],
      signs: [
        "Usually lean body habitus",
        "Kussmaul breathing (DKA)",
        "Fruity breath odor (DKA)",
        "Dehydration"
      ]
    },
    laboratoryFindings: [
      { name: "Fasting Glucose", normalRange: "70-99 mg/dL", abnormalInDisease: "Markedly elevated" },
      { name: "C-peptide", normalRange: "0.5-2.0 ng/mL", abnormalInDisease: "Low or undetectable" },
      { name: "GAD65 antibodies", normalRange: "Negative", abnormalInDisease: "Positive (>80% of cases)" },
      { name: "IA-2 antibodies", normalRange: "Negative", abnormalInDisease: "Positive (~60%)" },
      { name: "Ketones", normalRange: "Negative", abnormalInDisease: "Positive (prone to DKA)" }
    ],
    imagingFindings: {
      mri: ["Pancreatic volume often reduced"],
      ultrasound: ["Normal or slightly atrophic pancreas"]
    },
    modifications: {
      pancreas: {
        geometry: {
          pancreas_weight: { factor: 0.75, note: "Atrophic from β-cell loss" },
          islet_volume: { factor: 0.1, note: "Near-complete β-cell destruction" }
        },
        physiology: {
          insulin_secretion: { factor: 0.05, note: "Absent endogenous insulin" },
          c_peptide: { factor: 0.05, note: "Undetectable" },
          glucagon_secretion: { factor: 1.3, note: "Dysregulated (impaired counter-regulation)" }
        }
      }
    },
    severity: {
      mild: { description: "Stable on insulin, rare hypoglycemia" },
      moderate: { description: "Labile glucose, frequent hypoglycemia" },
      severe: { description: "Hypoglycemia unawareness, recurrent DKA" }
    }
  },

  E13_9: {
    name: "Diabetic Ketoacidosis (DKA)",
    icd10: "E13.10",
    category: "metabolic",
    definition: "Life-threatening metabolic emergency with hyperglycemia, ketosis, and metabolic acidosis",
    primaryOrgan: "pancreas",
    affectedOrgans: ["pancreas", "kidneys", "brain"],
    pathophysiology: {
      mechanism: "Absolute/relative insulin deficiency + counter-regulatory hormones → lipolysis → ketogenesis → metabolic acidosis",
      molecularBasis: "Unopposed glucagon action, hormone-sensitive lipase activation, hepatic ketone body synthesis"
    },
    clinicalPresentation: {
      symptoms: [
        "Nausea and vomiting",
        "Abdominal pain",
        "Polyuria/polydipsia",
        "Weakness",
        "Altered mental status"
      ],
      signs: [
        "Kussmaul breathing (deep, rapid)",
        "Fruity (acetone) breath",
        "Tachycardia",
        "Hypotension (dehydration)",
        "Altered consciousness"
      ]
    },
    laboratoryFindings: [
      { name: "Blood glucose", normalRange: "70-140 mg/dL", abnormalInDisease: ">250 mg/dL (usually 400-800)" },
      { name: "Serum ketones", normalRange: "Negative", abnormalInDisease: "Strongly positive" },
      { name: "pH", normalRange: "7.35-7.45", abnormalInDisease: "<7.30 (acidosis)" },
      { name: "Bicarbonate", normalRange: "22-28 mEq/L", abnormalInDisease: "<18 mEq/L" },
      { name: "Anion gap", normalRange: "8-12 mEq/L", abnormalInDisease: ">12 mEq/L (high anion gap)" },
      { name: "Potassium", normalRange: "3.5-5.0 mEq/L", abnormalInDisease: "Variable (initially high, total body depleted)" }
    ],
    imagingFindings: {
      ctHead: ["Rule out cerebral edema (especially pediatric)"],
      cxr: ["Rule out precipitating infection"]
    },
    modifications: {
      pancreas: {
        physiology: {
          insulin_secretion: { factor: 0.1, note: "Severely deficient" },
          glucagon_secretion: { factor: 2.5, note: "Markedly elevated" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.6, note: "Reduced from dehydration" },
          urine_output: { factor: 2.0, note: "Initially high (osmotic diuresis)" }
        }
      }
    },
    severity: {
      mild: { description: "pH 7.25-7.30, HCO3 15-18, alert" },
      moderate: { description: "pH 7.00-7.24, HCO3 10-15, drowsy" },
      severe: { description: "pH <7.00, HCO3 <10, stupor/coma" }
    }
  },

  // =====================
  // THYROID DISORDERS
  // ICD-10: E00-E07 Series
  // =====================

  E05_0: {
    name: "Hyperthyroidism (Graves' Disease)",
    icd10: "E05.0",
    category: "metabolic",
    definition: "Autoimmune hyperthyroidism caused by thyroid-stimulating antibodies (TSI)",
    primaryOrgan: "thyroid",
    affectedOrgans: ["thyroid", "heart", "brain"],
    pathophysiology: {
      mechanism: "TSI binds TSH receptor → constitutive activation → excess T3/T4 production",
      molecularBasis: "TSH receptor antibodies (TSI/TRAB), Gs protein activation, increased cAMP"
    },
    clinicalPresentation: {
      symptoms: [
        "Heat intolerance",
        "Weight loss despite increased appetite",
        "Palpitations",
        "Tremor",
        "Anxiety/irritability",
        "Increased bowel frequency",
        "Menstrual irregularities"
      ],
      signs: [
        "Tachycardia (often AF)",
        "Warm, moist skin",
        "Fine tremor",
        "Lid lag/lid retraction",
        "Exophthalmos (Graves')",
        "Thyroid bruit",
        "Pretibial myxedema (Graves')"
      ]
    },
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Suppressed (<0.1 mIU/L)" },
      { name: "Free T4", normalRange: "0.8-1.8 ng/dL", abnormalInDisease: "Elevated" },
      { name: "Free T3", normalRange: "2.3-4.2 pg/mL", abnormalInDisease: "Elevated" },
      { name: "TSI/TRAB", normalRange: "Negative", abnormalInDisease: "Positive (Graves')" },
      { name: "TPO antibodies", normalRange: "Negative", abnormalInDisease: "Often positive" }
    ],
    imagingFindings: {
      ultrasound: ["Enlarged thyroid", "Increased vascularity (thyroid inferno)"],
      uptakeScan: ["Diffusely increased uptake (Graves')"]
    },
    modifications: {
      thyroid: {
        geometry: {
          thyroid_volume: { factor: 2.0, note: "Diffuse goiter" }
        },
        physiology: {
          t4_production: { factor: 3.0, note: "Markedly increased" },
          t3_production: { factor: 3.5, note: "Markedly increased" },
          tsh_level: { factor: 0.01, note: "Suppressed" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.4, note: "Tachycardia" },
          cardiac_output: { factor: 1.5, note: "Hyperdynamic circulation" }
        }
      }
    },
    severity: {
      mild: { description: "Subclinical: low TSH, normal T4/T3" },
      moderate: { description: "Overt: suppressed TSH, elevated T4/T3, symptoms" },
      severe: { description: "Thyroid storm: fever, delirium, CV collapse" }
    }
  },

  E03_9: {
    name: "Hypothyroidism",
    icd10: "E03.9",
    category: "metabolic",
    definition: "Thyroid hormone deficiency, most commonly due to autoimmune thyroiditis (Hashimoto's)",
    primaryOrgan: "thyroid",
    affectedOrgans: ["thyroid", "heart", "brain"],
    pathophysiology: {
      mechanism: "Autoimmune destruction of thyroid follicles → decreased T3/T4 → elevated TSH",
      molecularBasis: "TPO and thyroglobulin antibodies, lymphocytic infiltration, follicular cell apoptosis"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Cold intolerance",
        "Weight gain",
        "Constipation",
        "Depression",
        "Dry skin",
        "Hair loss",
        "Menorrhagia"
      ],
      signs: [
        "Bradycardia",
        "Coarse, dry skin",
        "Periorbital edema",
        "Non-pitting edema (myxedema)",
        "Delayed relaxation of reflexes",
        "Goiter (Hashimoto's) or atrophic thyroid"
      ]
    },
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Elevated (>10 mIU/L in overt)" },
      { name: "Free T4", normalRange: "0.8-1.8 ng/dL", abnormalInDisease: "Low" },
      { name: "TPO antibodies", normalRange: "Negative", abnormalInDisease: "Positive (Hashimoto's)" },
      { name: "Lipid panel", normalRange: "Variable", abnormalInDisease: "Elevated LDL cholesterol" },
      { name: "CK", normalRange: "22-198 U/L", abnormalInDisease: "May be elevated (myopathy)" }
    ],
    imagingFindings: {
      ultrasound: ["Heterogeneous echotexture", "Hypoechoic thyroid", "Goiter or atrophy"],
      echo: ["Pericardial effusion (severe cases)"]
    },
    modifications: {
      thyroid: {
        physiology: {
          t4_production: { factor: 0.3, note: "Severely reduced" },
          t3_production: { factor: 0.3, note: "Severely reduced" },
          tsh_level: { factor: 10.0, note: "Markedly elevated" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 0.8, note: "Bradycardia" },
          cardiac_output: { factor: 0.75, note: "Reduced" }
        }
      }
    },
    severity: {
      mild: { description: "Subclinical: elevated TSH, normal T4" },
      moderate: { description: "Overt: high TSH, low T4, symptomatic" },
      severe: { description: "Myxedema coma: hypothermia, altered mental status, CV collapse" }
    }
  },

  E06_3: {
    name: "Hashimoto's Thyroiditis",
    icd10: "E06.3",
    category: "metabolic",
    definition: "Chronic autoimmune lymphocytic thyroiditis, the most common cause of hypothyroidism in iodine-sufficient areas",
    primaryOrgan: "thyroid",
    affectedOrgans: ["thyroid"],
    pathophysiology: {
      mechanism: "CD4+ T-cell mediated destruction → lymphocytic infiltration → fibrosis → gradual thyroid failure",
      molecularBasis: "TPO and thyroglobulin antibodies, Th1 cytokines (IFN-γ, TNF-α), apoptosis of thyrocytes"
    },
    clinicalPresentation: {
      symptoms: [
        "Initially may be euthyroid",
        "Gradual onset hypothyroid symptoms",
        "Neck fullness or pressure (goiter)",
        "Fatigue",
        "Possible hashitoxicosis phase"
      ],
      signs: [
        "Firm, rubbery goiter",
        "Non-tender thyroid",
        "Hypothyroid signs (late stage)"
      ]
    },
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Variable (normal → elevated)" },
      { name: "TPO antibodies", normalRange: "<35 IU/mL", abnormalInDisease: "Elevated (>90% of cases)" },
      { name: "Thyroglobulin antibodies", normalRange: "<20 IU/mL", abnormalInDisease: "Often elevated" },
      { name: "Free T4", normalRange: "0.8-1.8 ng/dL", abnormalInDisease: "Low (in overt hypothyroidism)" }
    ],
    imagingFindings: {
      ultrasound: ["Diffusely hypoechoic thyroid", "Heterogeneous echotexture", "Micronodules", "Fibrous septa"],
      uptakeScan: ["Variable uptake"]
    },
    modifications: {
      thyroid: {
        geometry: {
          thyroid_volume: { factor: 1.5, note: "Goiter phase" }
        },
        physiology: {
          t4_production: { factor: 0.6, note: "Progressively reduced" },
          tpo_antibodies: { factor: 50.0, note: "Markedly elevated" }
        },
        structure: {
          lymphocyte_infiltration: { factor: 10.0, note: "Dense lymphocytic infiltrate" },
          fibrosis: { factor: 3.0, note: "Progressive fibrosis" }
        }
      }
    },
    severity: {
      mild: { description: "Euthyroid with positive antibodies" },
      moderate: { description: "Subclinical hypothyroidism" },
      severe: { description: "Overt hypothyroidism requiring replacement" }
    }
  },

  // =====================
  // ADRENAL DISORDERS
  // ICD-10: E24-E27 Series
  // =====================

  E24_0: {
    name: "Cushing's Syndrome (Pituitary)",
    icd10: "E24.0",
    category: "metabolic",
    definition: "Hypercortisolism due to ACTH-secreting pituitary adenoma (Cushing's disease)",
    primaryOrgan: "adrenal",
    affectedOrgans: ["adrenal", "brain", "pancreas"],
    pathophysiology: {
      mechanism: "ACTH-secreting pituitary adenoma → bilateral adrenal hyperplasia → excess cortisol",
      molecularBasis: "Loss of normal HPA feedback, USP8 mutations in some cases, corticotroph adenoma"
    },
    clinicalPresentation: {
      symptoms: [
        "Weight gain (central)",
        "Fatigue",
        "Muscle weakness",
        "Easy bruising",
        "Mood changes",
        "Menstrual irregularities",
        "Decreased libido"
      ],
      signs: [
        "Moon facies",
        "Buffalo hump",
        "Central obesity",
        "Purple striae",
        "Proximal myopathy",
        "Hypertension",
        "Thin skin",
        "Hirsutism"
      ]
    },
    laboratoryFindings: [
      { name: "24h urinary free cortisol", normalRange: "3.5-45 µg/24h", abnormalInDisease: "Elevated (>3x ULN)" },
      { name: "Late-night salivary cortisol", normalRange: "<0.1 µg/dL", abnormalInDisease: "Elevated" },
      { name: "1mg overnight DST", normalRange: "<1.8 µg/dL", abnormalInDisease: "Fails to suppress" },
      { name: "ACTH", normalRange: "10-60 pg/mL", abnormalInDisease: "Normal-high (ACTH-dependent)" },
      { name: "Glucose", normalRange: "70-99 mg/dL", abnormalInDisease: "Elevated (diabetes common)" }
    ],
    imagingFindings: {
      mri: ["Pituitary microadenoma (often <6mm)", "May require IPSS for localization"],
      ctAbdomen: ["Bilateral adrenal hyperplasia"]
    },
    modifications: {
      adrenal: {
        geometry: {
          adrenal_size: { factor: 1.8, note: "Bilateral hyperplasia" }
        },
        physiology: {
          cortisol_production: { factor: 4.0, note: "Markedly elevated" },
          dhea_production: { factor: 1.5, note: "Often elevated" }
        }
      },
      pancreas: {
        physiology: {
          insulin_resistance: { factor: 2.0, note: "Cortisol-induced" }
        }
      }
    },
    severity: {
      mild: { description: "Subtle features, mildly elevated cortisol" },
      moderate: { description: "Classic features, complications developing" },
      severe: { description: "Severe complications (DM, osteoporosis, infections)" }
    }
  },

  E27_1: {
    name: "Primary Adrenal Insufficiency (Addison's Disease)",
    icd10: "E27.1",
    category: "metabolic",
    definition: "Primary adrenocortical failure with deficiency of cortisol, aldosterone, and androgens",
    primaryOrgan: "adrenal",
    affectedOrgans: ["adrenal", "kidneys"],
    pathophysiology: {
      mechanism: "Autoimmune adrenalitis → progressive destruction of adrenal cortex → hormone deficiency",
      molecularBasis: "21-hydroxylase antibodies, T-cell mediated destruction, associated with APS type 1 or 2"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue (profound)",
        "Weight loss",
        "Anorexia",
        "Nausea",
        "Abdominal pain",
        "Salt craving",
        "Postural dizziness",
        "Myalgias/arthralgias"
      ],
      signs: [
        "Hyperpigmentation (skin folds, gums, scars)",
        "Hypotension (orthostatic)",
        "Vitiligo (autoimmune)",
        "Weight loss"
      ]
    },
    laboratoryFindings: [
      { name: "Morning cortisol", normalRange: "5-25 µg/dL", abnormalInDisease: "<3 µg/dL (suggestive)" },
      { name: "ACTH", normalRange: "10-60 pg/mL", abnormalInDisease: "Elevated (>2x ULN)" },
      { name: "ACTH stimulation test", normalRange: ">18 µg/dL post-stim", abnormalInDisease: "Fails to rise" },
      { name: "Sodium", normalRange: "136-145 mEq/L", abnormalInDisease: "Low (hyponatremia)" },
      { name: "Potassium", normalRange: "3.5-5.0 mEq/L", abnormalInDisease: "Elevated (hyperkalemia)" },
      { name: "21-hydroxylase antibodies", normalRange: "Negative", abnormalInDisease: "Positive (autoimmune)" }
    ],
    imagingFindings: {
      ctAbdomen: ["Small, atrophic adrenals (autoimmune)", "Calcification (TB, fungal)"],
      mri: ["Atrophic adrenals"]
    },
    modifications: {
      adrenal: {
        geometry: {
          adrenal_size: { factor: 0.3, note: "Atrophic (autoimmune)" }
        },
        physiology: {
          cortisol_production: { factor: 0.1, note: "Severely deficient" },
          aldosterone_production: { factor: 0.1, note: "Severely deficient" },
          acth_level: { factor: 5.0, note: "Elevated (feedback)" }
        }
      },
      kidneys: {
        physiology: {
          sodium_retention: { factor: 0.4, note: "Impaired (aldosterone deficient)" },
          potassium_excretion: { factor: 0.5, note: "Impaired" }
        }
      }
    },
    severity: {
      mild: { description: "Compensated, requiring low-dose replacement" },
      moderate: { description: "Symptomatic, requiring standard replacement" },
      severe: { description: "Adrenal crisis: shock, severe hyponatremia, emergency" }
    }
  },

  // =====================
  // LIPID DISORDERS
  // ICD-10: E78 Series
  // =====================

  E78_0: {
    name: "Familial Hypercholesterolemia",
    icd10: "E78.0",
    category: "metabolic",
    definition: "Genetic disorder of LDL metabolism causing severely elevated LDL-cholesterol and premature atherosclerosis",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "heart"],
    pathophysiology: {
      mechanism: "Defective LDL receptors → impaired LDL clearance → elevated plasma LDL → premature ASCVD",
      molecularBasis: "LDLR mutations (most common), APOB, PCSK9 gain-of-function mutations"
    },
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic until ASCVD event",
        "Angina (premature CAD)",
        "Claudication",
        "Family history of early CVD"
      ],
      signs: [
        "Tendon xanthomas (Achilles, hands)",
        "Xanthelasma",
        "Corneal arcus (before age 45)",
        "Aortic stenosis (homozygotes)"
      ]
    },
    laboratoryFindings: [
      { name: "LDL-C", normalRange: "<100 mg/dL", abnormalInDisease: ">190 mg/dL (het), >400 mg/dL (homo)" },
      { name: "Total cholesterol", normalRange: "<200 mg/dL", abnormalInDisease: ">300 mg/dL" },
      { name: "HDL-C", normalRange: ">40 mg/dL (M), >50 (F)", abnormalInDisease: "Usually normal" },
      { name: "Triglycerides", normalRange: "<150 mg/dL", abnormalInDisease: "Usually normal" },
      { name: "Lp(a)", normalRange: "<30 mg/dL", abnormalInDisease: "Often elevated" }
    ],
    imagingFindings: {
      ctCalciumScore: ["Elevated coronary calcium"],
      carotidUS: ["Increased IMT", "Premature plaque"],
      echo: ["Aortic valve disease (homozygotes)"]
    },
    modifications: {
      liver: {
        physiology: {
          ldl_receptor_activity: { factor: 0.3, note: "Severely impaired" },
          ldl_clearance: { factor: 0.25, note: "Markedly reduced" }
        }
      },
      heart: {
        structure: {
          coronary_plaque: { factor: 3.0, note: "Premature atherosclerosis" }
        }
      }
    },
    severity: {
      mild: { description: "LDL 190-250, no CVD" },
      moderate: { description: "LDL 250-400, developing CVD" },
      severe: { description: "Homozygous FH: LDL >400, childhood CVD" }
    }
  },

  E78_1: {
    name: "Hypertriglyceridemia",
    icd10: "E78.1",
    category: "metabolic",
    definition: "Elevated serum triglycerides with risk of pancreatitis at very high levels",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "pancreas"],
    pathophysiology: {
      mechanism: "Overproduction of VLDL and/or impaired clearance of triglyceride-rich lipoproteins",
      molecularBasis: "LPL deficiency, ApoC-II deficiency, familial hypertriglyceridemia, secondary causes"
    },
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic",
        "Abdominal pain (pancreatitis risk if TG >500)",
        "Memory/cognitive issues (severe)"
      ],
      signs: [
        "Eruptive xanthomas (TG >1000)",
        "Lipemia retinalis",
        "Hepatosplenomegaly",
        "Lipemic serum (milky)"
      ]
    },
    laboratoryFindings: [
      { name: "Triglycerides", normalRange: "<150 mg/dL", abnormalInDisease: ">150 mg/dL; severe >500 mg/dL" },
      { name: "LDL-C", normalRange: "<100 mg/dL", abnormalInDisease: "May be falsely low (Friedewald)" },
      { name: "Non-HDL-C", normalRange: "<130 mg/dL", abnormalInDisease: "Elevated" },
      { name: "Lipase", normalRange: "13-60 U/L", abnormalInDisease: "Elevated if pancreatitis" },
      { name: "Fasting glucose", normalRange: "70-99 mg/dL", abnormalInDisease: "Often elevated (metabolic syndrome)" }
    ],
    imagingFindings: {
      ultrasound: ["Fatty liver", "Hepatomegaly"],
      ctAbdomen: ["Pancreatitis if severe"]
    },
    modifications: {
      liver: {
        physiology: {
          vldl_production: { factor: 2.5, note: "Overproduction" },
          triglyceride_clearance: { factor: 0.5, note: "Impaired" }
        }
      },
      pancreas: {
        physiology: {
          pancreatitis_risk: { factor: 5.0, note: "Increased if TG >500" }
        }
      }
    },
    severity: {
      mild: { description: "TG 150-499 mg/dL" },
      moderate: { description: "TG 500-999 mg/dL" },
      severe: { description: "TG ≥1000 mg/dL (high pancreatitis risk)" }
    }
  },

  // =====================
  // OBESITY
  // ICD-10: E66 Series
  // =====================

  E66_9: {
    name: "Obesity",
    icd10: "E66.9",
    category: "metabolic",
    definition: "Chronic multifactorial disease with excess adiposity causing metabolic and mechanical complications",
    primaryOrgan: "adipose",
    affectedOrgans: ["liver", "heart", "kidneys", "pancreas"],
    pathophysiology: {
      mechanism: "Chronic positive energy balance → adipocyte hypertrophy/hyperplasia → inflammation → insulin resistance",
      molecularBasis: "Leptin resistance, adipokine dysregulation (↑TNF-α, ↓adiponectin), ectopic fat deposition"
    },
    clinicalPresentation: {
      symptoms: [
        "Weight gain",
        "Dyspnea on exertion",
        "Joint pain",
        "Fatigue",
        "Sleep apnea symptoms",
        "GERD"
      ],
      signs: [
        "BMI ≥30 kg/m²",
        "Increased waist circumference",
        "Acanthosis nigricans",
        "Skin tags",
        "Intertrigo"
      ]
    },
    laboratoryFindings: [
      { name: "Fasting glucose", normalRange: "70-99 mg/dL", abnormalInDisease: "Often elevated (prediabetes/diabetes)" },
      { name: "HbA1c", normalRange: "<5.7%", abnormalInDisease: "Often elevated" },
      { name: "Lipid panel", normalRange: "Variable", abnormalInDisease: "Dyslipidemia common" },
      { name: "ALT", normalRange: "7-56 U/L", abnormalInDisease: "May be elevated (NAFLD)" },
      { name: "Uric acid", normalRange: "3.5-7.2 mg/dL", abnormalInDisease: "Often elevated" }
    ],
    imagingFindings: {
      ultrasound: ["Fatty liver", "Increased visceral fat"],
      dexa: ["Increased body fat percentage"],
      echo: ["LV hypertrophy", "Diastolic dysfunction"]
    },
    modifications: {
      liver: {
        physiology: {
          insulin_sensitivity: { factor: 0.5, note: "Hepatic insulin resistance" },
          alt: { factor: 1.5, note: "NAFLD common" }
        }
      },
      heart: {
        geometry: {
          lv_mass: { factor: 1.3, note: "LV hypertrophy" }
        },
        physiology: {
          cardiac_output: { factor: 1.2, note: "Increased to perfuse extra mass" }
        }
      },
      pancreas: {
        physiology: {
          insulin_secretion: { factor: 1.8, note: "Compensatory hyperinsulinemia" }
        }
      }
    },
    severity: {
      mild: { description: "Class I: BMI 30-34.9" },
      moderate: { description: "Class II: BMI 35-39.9" },
      severe: { description: "Class III: BMI ≥40" }
    }
  },

  // =====================
  // METABOLIC SYNDROME
  // ICD-10: E88.81
  // =====================

  E88_81: {
    name: "Metabolic Syndrome",
    icd10: "E88.81",
    category: "metabolic",
    definition: "Cluster of interconnected metabolic abnormalities increasing cardiovascular and diabetes risk",
    primaryOrgan: "adipose",
    affectedOrgans: ["liver", "heart", "pancreas", "kidneys"],
    pathophysiology: {
      mechanism: "Central obesity → insulin resistance → compensatory hyperinsulinemia → dyslipidemia + hypertension + hyperglycemia",
      molecularBasis: "Adipose tissue inflammation, FFA flux, ectopic fat, endothelial dysfunction"
    },
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic initially",
        "Fatigue",
        "Sleep apnea",
        "Symptoms of individual components"
      ],
      signs: [
        "Central obesity (waist >40in M, >35in F)",
        "Hypertension",
        "Acanthosis nigricans"
      ]
    },
    laboratoryFindings: [
      { name: "Fasting glucose", normalRange: "70-99 mg/dL", abnormalInDisease: "≥100 mg/dL (criterion)" },
      { name: "Triglycerides", normalRange: "<150 mg/dL", abnormalInDisease: "≥150 mg/dL (criterion)" },
      { name: "HDL-C", normalRange: ">40 M, >50 F mg/dL", abnormalInDisease: "<40 M, <50 F (criterion)" },
      { name: "Blood pressure", normalRange: "<130/85 mmHg", abnormalInDisease: "≥130/85 or on treatment" },
      { name: "Fasting insulin", normalRange: "2-25 µIU/mL", abnormalInDisease: "Elevated (hyperinsulinemia)" }
    ],
    imagingFindings: {
      ultrasound: ["Fatty liver common"],
      ctAbdomen: ["Visceral adiposity"],
      echo: ["LV hypertrophy", "Diastolic dysfunction"]
    },
    modifications: {
      liver: {
        physiology: {
          insulin_sensitivity: { factor: 0.5, note: "Hepatic insulin resistance" },
          vldl_production: { factor: 1.8, note: "Increased TG production" }
        }
      },
      pancreas: {
        physiology: {
          insulin_secretion: { factor: 2.0, note: "Compensatory hyperinsulinemia" },
          beta_cell_stress: { factor: 2.0, note: "Glucolipotoxicity" }
        }
      },
      heart: {
        physiology: {
          blood_pressure: { factor: 1.2, note: "Hypertension" }
        }
      }
    },
    severity: {
      mild: { description: "3 criteria met, no end-organ damage" },
      moderate: { description: "4-5 criteria, early complications" },
      severe: { description: "Established T2DM, CVD, or NAFLD" }
    }
  },

  // =====================
  // GOUT AND URIC ACID
  // ICD-10: E79, M10
  // =====================

  M10_9: {
    name: "Gout",
    icd10: "M10.9",
    category: "metabolic",
    definition: "Inflammatory arthritis caused by monosodium urate crystal deposition due to hyperuricemia",
    primaryOrgan: "joints",
    affectedOrgans: ["kidneys"],
    pathophysiology: {
      mechanism: "Uric acid supersaturation → MSU crystal formation → NLRP3 inflammasome activation → IL-1β release → acute inflammation",
      molecularBasis: "Urate transporter dysfunction (URAT1, GLUT9), purine metabolism abnormalities, reduced renal excretion"
    },
    clinicalPresentation: {
      symptoms: [
        "Sudden severe joint pain (often nocturnal)",
        "Swelling",
        "Redness",
        "Warmth",
        "Limited range of motion",
        "First MTP most common (podagra)"
      ],
      signs: [
        "Red, hot, swollen joint",
        "Exquisite tenderness",
        "Tophi (chronic gout)",
        "Overlying erythema"
      ]
    },
    laboratoryFindings: [
      { name: "Serum uric acid", normalRange: "3.5-7.2 mg/dL", abnormalInDisease: ">6.8 mg/dL (may be normal in acute flare)" },
      { name: "Synovial fluid", normalRange: "Clear, acellular", abnormalInDisease: "Negatively birefringent needle crystals" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Elevated during flare" },
      { name: "CRP/ESR", normalRange: "Normal", abnormalInDisease: "Elevated during flare" },
      { name: "24h urine uric acid", normalRange: "250-750 mg/24h", abnormalInDisease: "High (overproducer) or low (underexcretor)" }
    ],
    imagingFindings: {
      xray: ["Soft tissue swelling (acute)", "Punched-out erosions with overhanging edge (chronic)", "Tophi"],
      ultrasound: ["Double contour sign", "Tophaceous deposits"],
      dect: ["MSU crystal deposition (green color coding)"]
    },
    modifications: {
      kidneys: {
        physiology: {
          uric_acid_excretion: { factor: 0.6, note: "Often reduced (underexcretor)" },
          gfr: { factor: 0.9, note: "CKD risk with chronic hyperuricemia" }
        }
      }
    },
    severity: {
      mild: { description: "Infrequent flares (<2/year), no tophi" },
      moderate: { description: "Frequent flares, early tophi" },
      severe: { description: "Chronic tophaceous gout, joint destruction, CKD" }
    }
  },

  // =====================
  // OSTEOPOROSIS
  // ICD-10: M81
  // =====================

  M81_0: {
    name: "Osteoporosis",
    icd10: "M81.0",
    category: "metabolic",
    definition: "Systemic skeletal disease with low bone mass and microarchitectural deterioration, increasing fracture risk",
    primaryOrgan: "bone",
    affectedOrgans: ["bone"],
    pathophysiology: {
      mechanism: "Imbalanced bone remodeling: osteoclast resorption > osteoblast formation → net bone loss",
      molecularBasis: "RANKL/OPG dysregulation, estrogen deficiency, secondary causes (glucocorticoids, hyperparathyroidism)"
    },
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic until fracture",
        "Back pain (vertebral fractures)",
        "Height loss",
        "Kyphosis"
      ],
      signs: [
        "Height loss >4 cm",
        "Kyphosis (dowager's hump)",
        "Fractures with minimal trauma"
      ]
    },
    laboratoryFindings: [
      { name: "Calcium", normalRange: "8.5-10.5 mg/dL", abnormalInDisease: "Usually normal (rule out secondary causes)" },
      { name: "25-OH Vitamin D", normalRange: "30-100 ng/mL", abnormalInDisease: "Often low (contributor)" },
      { name: "PTH", normalRange: "15-65 pg/mL", abnormalInDisease: "Should be normal (rule out hyperparathyroidism)" },
      { name: "Bone turnover markers", normalRange: "Variable", abnormalInDisease: "CTX, P1NP may be elevated" },
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Rule out hyperthyroidism" }
    ],
    imagingFindings: {
      dexa: ["T-score ≤-2.5 (osteoporosis)", "T-score -1.0 to -2.5 (osteopenia)"],
      xray: ["Vertebral compression fractures", "Decreased bone density"],
      vfa: ["Vertebral fracture assessment on DEXA"]
    },
    modifications: {
      bone: {
        geometry: {
          bone_mineral_density: { factor: 0.7, note: "Reduced BMD" },
          trabecular_number: { factor: 0.6, note: "Loss of trabeculae" }
        },
        physiology: {
          bone_formation: { factor: 0.7, note: "Reduced osteoblast activity" },
          bone_resorption: { factor: 1.5, note: "Increased osteoclast activity" }
        }
      }
    },
    severity: {
      mild: { description: "Osteopenia: T-score -1.0 to -2.5" },
      moderate: { description: "Osteoporosis: T-score ≤-2.5" },
      severe: { description: "Severe osteoporosis: T-score ≤-2.5 + fragility fracture" }
    }
  },

  // =====================
  // PHEOCHROMOCYTOMA
  // ICD-10: D35.0, E27.5
  // =====================

  D35_0: {
    name: "Pheochromocytoma",
    icd10: "D35.0",
    category: "metabolic",
    definition: "Catecholamine-secreting tumor arising from chromaffin cells of the adrenal medulla",
    primaryOrgan: "adrenal",
    affectedOrgans: ["adrenal", "heart"],
    pathophysiology: {
      mechanism: "Unregulated catecholamine synthesis and release → episodic or sustained hypertension + hypermetabolic symptoms",
      molecularBasis: "Germline mutations (RET, VHL, SDHB/C/D, NF1) in ~40%, tyrosine hydroxylase overexpression"
    },
    clinicalPresentation: {
      symptoms: [
        "Paroxysmal hypertension",
        "Headache (severe, pounding)",
        "Sweating (profuse)",
        "Palpitations",
        "Anxiety/panic",
        "Pallor during episodes"
      ],
      signs: [
        "Hypertension (sustained or paroxysmal)",
        "Tachycardia",
        "Diaphoresis",
        "Tremor",
        "Pallor (vasoconstriction)"
      ]
    },
    laboratoryFindings: [
      { name: "Plasma metanephrines", normalRange: "<0.5 nmol/L", abnormalInDisease: "Elevated (best screening test)" },
      { name: "24h urine catecholamines", normalRange: "Variable", abnormalInDisease: "Elevated epinephrine, norepinephrine" },
      { name: "24h urine metanephrines", normalRange: "<400 µg/24h", abnormalInDisease: "Elevated" },
      { name: "Chromogranin A", normalRange: "<100 ng/mL", abnormalInDisease: "Often elevated" },
      { name: "Glucose", normalRange: "70-99 mg/dL", abnormalInDisease: "May be elevated (catecholamine effect)" }
    ],
    imagingFindings: {
      ctAbdomen: ["Adrenal mass (usually >3 cm)", "Heterogeneous enhancement"],
      mri: ["T2 hyperintense ('light bulb' sign)", "High signal on T2"],
      mibgScan: ["Avid uptake in functional tumor"]
    },
    modifications: {
      adrenal: {
        physiology: {
          epinephrine_production: { factor: 20.0, note: "Markedly elevated" },
          norepinephrine_production: { factor: 15.0, note: "Markedly elevated" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.5, note: "Tachycardia" },
          blood_pressure: { factor: 1.5, note: "Severe hypertension" },
          cardiac_output: { factor: 1.4, note: "Increased" }
        }
      }
    },
    severity: {
      mild: { description: "Small tumor, mild episodic symptoms" },
      moderate: { description: "Sustained hypertension, clear symptoms" },
      severe: { description: "Hypertensive crisis, cardiomyopathy, metastatic" }
    }
  }
};

export default METABOLIC_DISEASES;
