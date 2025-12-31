// ============================================================
// ONCOLOGY DISEASES DATABASE
// Malignant neoplasms - Blood cancers and Solid tumors
// ICD-10: C00-C97 (Malignant neoplasms), D45-D47 (Myeloid neoplasms)
// ============================================================

export const ONCOLOGY_DISEASES = {
  // =====================
  // ACUTE LEUKEMIAS
  // ICD-10: C91-C95 Series
  // =====================

  C91_0: {
    name: "Acute Lymphoblastic Leukemia (ALL)",
    icd10: "C91.0",
    category: "hematological",
    definition: "Malignant proliferation of lymphoid precursor cells (lymphoblasts) in bone marrow",
    primaryOrgan: "bonemarrow",
    affectedOrgans: ["bonemarrow", "blood", "lymphatic", "brain", "spleen", "liver"],
    pathophysiology: {
      mechanism: "Clonal expansion of lymphoblasts → marrow failure → cytopenias + blast infiltration of organs",
      molecularBasis: "Chromosomal translocations (t(12;21), t(9;22) Ph+), gene mutations affecting lymphoid development"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue and pallor (anemia)",
        "Easy bruising/bleeding (thrombocytopenia)",
        "Recurrent infections (neutropenia)",
        "Bone pain (marrow expansion)",
        "Fever",
        "Weight loss"
      ],
      signs: [
        "Pallor",
        "Petechiae, ecchymoses",
        "Lymphadenopathy",
        "Hepatosplenomegaly",
        "CNS involvement (headache, cranial nerve palsies)",
        "Testicular enlargement (males)"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Variable (low, normal, or markedly elevated >100)" },
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low (anemia)" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Low (thrombocytopenia)" },
      { name: "Peripheral blasts", normalRange: "0%", abnormalInDisease: "Present (may be >90%)" },
      { name: "Bone marrow blasts", normalRange: "<5%", abnormalInDisease: ">20% (usually >90%)" },
      { name: "LDH", normalRange: "140-280 U/L", abnormalInDisease: "Elevated (high cell turnover)" },
      { name: "Uric acid", normalRange: "3.5-7.5 mg/dL", abnormalInDisease: "Elevated (cell lysis)" }
    ],
    imagingFindings: {
      bloodSmear: ["Lymphoblasts (high N:C ratio, scant cytoplasm)", "Nucleoli", "Hand-mirror cells (sometimes)"],
      flowCytometry: ["CD19+, CD10+, TdT+ (B-ALL)", "CD3+, CD7+, TdT+ (T-ALL)"],
      boneMarrowBiopsy: ["Hypercellular with >90% blasts", "Normal elements replaced"],
      csfAnalysis: ["Blasts if CNS involvement"]
    },
    severity: {
      mild: { description: "N/A - ALL is always a serious malignancy" },
      moderate: { description: "Standard risk features" },
      severe: { description: "High-risk features: Ph+, MLL rearrangement, high WBC, CNS disease" }
    },
    modifications: {
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 1.8, note: "Hypercellular, packed with blasts" },
          blast_percentage: { factor: 20.0, note: ">90% blasts" }
        },
        physiology: {
          erythroid_precursors: { factor: 0.1, note: "Replaced by blasts" },
          myeloid_precursors: { factor: 0.1, note: "Replaced by blasts" },
          lymphoid_precursors: { factor: 50.0, note: "Malignant lymphoblasts predominate" }
        },
        cellular: {
          megakaryocytes: { factor: 0.2, note: "Markedly decreased" }
        }
      },
      blood: {
        geometry: {
          wbc_count: { factor: 5.0, note: "Often markedly elevated" },
          platelet_count: { factor: 0.3, note: "Thrombocytopenia" },
          rbc_count: { factor: 0.6, note: "Anemia" }
        },
        physiology: {
          hemoglobin: { factor: 0.6, note: "Anemia from marrow replacement" }
        },
        cellular: {
          absolute_neutrophil: { factor: 0.2, note: "Neutropenia despite high WBC" },
          lymphocytes: { factor: 3.0, note: "Blasts counted as lymphocytes" }
        }
      },
      lymphatic: {
        geometry: {
          lymph_node_size: { factor: 2.0, note: "Lymphadenopathy" }
        }
      },
      spleen: {
        geometry: {
          spleen_volume: { factor: 2.0, note: "Splenomegaly from infiltration" }
        }
      },
      liver: {
        geometry: {
          liver_volume: { factor: 1.3, note: "Hepatomegaly" }
        }
      },
      brain: {
        pressures: {
          csf_pressure: { factor: 1.3, note: "CNS involvement risk" }
        }
      }
    }
  },

  C92_0: {
    name: "Acute Myeloid Leukemia (AML)",
    icd10: "C92.0",
    category: "hematological",
    definition: "Malignant proliferation of myeloid precursor cells (myeloblasts) in bone marrow",
    primaryOrgan: "bonemarrow",
    affectedOrgans: ["bonemarrow", "blood", "spleen", "liver"],
    pathophysiology: {
      mechanism: "Clonal expansion of myeloblasts with maturation arrest → marrow failure → cytopenias",
      molecularBasis: "Chromosomal translocations (t(8;21), t(15;17) APL, inv(16)), FLT3, NPM1, IDH mutations"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue (anemia)",
        "Easy bruising/bleeding",
        "Infections (neutropenia)",
        "Gum hypertrophy (monocytic subtypes)",
        "Bone pain"
      ],
      signs: [
        "Pallor",
        "Petechiae, ecchymoses",
        "Gingival hyperplasia (M4, M5)",
        "Skin nodules (leukemia cutis)",
        "DIC signs (especially APL)",
        "Hepatosplenomegaly (less than ALL)"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Variable (can be >100)" },
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Low" },
      { name: "Peripheral blasts", normalRange: "0%", abnormalInDisease: "Present with Auer rods" },
      { name: "Bone marrow blasts", normalRange: "<5%", abnormalInDisease: ">20%" },
      { name: "PT/PTT", normalRange: "Normal", abnormalInDisease: "Prolonged in APL (DIC)" }
    ],
    imagingFindings: {
      bloodSmear: ["Myeloblasts with Auer rods (pathognomonic)", "Faggot cells in APL", "Monocytoid in M4/M5"],
      flowCytometry: ["CD13+, CD33+, CD117+, MPO+"],
      boneMarrowBiopsy: ["Hypercellular with blast infiltration", "Auer rods"]
    },
    severity: {
      mild: { description: "N/A" },
      moderate: { description: "Favorable cytogenetics: t(8;21), inv(16), t(15;17)" },
      severe: { description: "Poor risk: complex karyotype, FLT3-ITD, TP53 mutation" }
    },
    modifications: {
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 1.7, note: "Hypercellular" },
          blast_percentage: { factor: 15.0, note: ">20% myeloblasts" }
        },
        physiology: {
          erythroid_precursors: { factor: 0.15, note: "Suppressed" },
          myeloid_precursors: { factor: 0.2, note: "Replaced by blasts" }
        },
        cellular: {
          megakaryocytes: { factor: 0.3, note: "Decreased" }
        }
      },
      blood: {
        geometry: {
          wbc_count: { factor: 4.0, note: "Often elevated" },
          platelet_count: { factor: 0.25, note: "Thrombocytopenia" },
          rbc_count: { factor: 0.55, note: "Anemia" }
        },
        physiology: {
          hemoglobin: { factor: 0.55, note: "Anemia" }
        },
        pressures: {
          fibrinogen: { factor: 0.5, note: "DIC in APL" },
          d_dimer: { factor: 5.0, note: "Elevated in APL" }
        }
      },
      spleen: {
        geometry: {
          spleen_volume: { factor: 1.5, note: "Mild splenomegaly" }
        }
      }
    }
  },

  // =====================
  // CHRONIC LEUKEMIAS
  // ICD-10: C91-C92 Series
  // =====================

  C91_1: {
    name: "Chronic Lymphocytic Leukemia (CLL)",
    icd10: "C91.1",
    category: "hematological",
    definition: "Indolent B-cell malignancy with accumulation of mature-appearing lymphocytes",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "bonemarrow", "lymphatic", "spleen"],
    pathophysiology: {
      mechanism: "Clonal B-cell proliferation with defective apoptosis → lymphocytosis + lymphadenopathy",
      molecularBasis: "del(13q), trisomy 12, del(11q), del(17p); BCL2 overexpression; immunoglobulin gene mutations"
    },
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic (incidental finding)",
        "Fatigue",
        "Recurrent infections",
        "B symptoms (fever, night sweats, weight loss) - advanced",
        "Early satiety (splenomegaly)"
      ],
      signs: [
        "Lymphadenopathy (generalized)",
        "Splenomegaly",
        "Hepatomegaly",
        "Pallor (if anemia)",
        "No skin findings usually"
      ]
    },
    laboratoryFindings: [
      { name: "Absolute lymphocyte count", normalRange: "<4000/μL", abnormalInDisease: ">5000/μL sustained" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Elevated (20-200)" },
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low if advanced or AIHA" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Low if advanced or ITP" },
      { name: "Direct Coombs", normalRange: "Negative", abnormalInDisease: "May be positive (AIHA)" },
      { name: "LDH", normalRange: "140-280 U/L", abnormalInDisease: "Elevated if transforming" }
    ],
    imagingFindings: {
      bloodSmear: ["Mature-appearing small lymphocytes", "Smudge cells (fragile CLL cells)", "Rare larger prolymphocytes"],
      flowCytometry: ["CD5+, CD19+, CD23+, weak surface Ig", "CD20 dim"],
      ctScan: ["Lymphadenopathy", "Splenomegaly"]
    },
    severity: {
      mild: { description: "Rai 0 (lymphocytosis only), Binet A" },
      moderate: { description: "Rai I-II (adenopathy ± splenomegaly), Binet B" },
      severe: { description: "Rai III-IV (anemia/thrombocytopenia), Binet C" }
    },
    modifications: {
      blood: {
        geometry: {
          wbc_count: { factor: 10.0, note: "Marked lymphocytosis" }
        },
        cellular: {
          lymphocytes: { factor: 3.0, note: ">90% lymphocytes" },
          absolute_lymphocyte: { factor: 10.0, note: ">5000/μL (diagnostic)" }
        },
        physiology: {
          hemoglobin: { factor: 0.8, note: "May develop anemia" }
        }
      },
      lymphatic: {
        geometry: {
          lymph_node_size: { factor: 3.0, note: "Generalized lymphadenopathy" }
        },
        physiology: {
          cd4_cd8_ratio: { factor: 0.5, note: "Altered T cell populations" }
        }
      },
      spleen: {
        geometry: {
          spleen_volume: { factor: 2.0, note: "Splenomegaly" }
        }
      },
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 1.3, note: "Lymphocyte infiltration" }
        }
      }
    }
  },

  C92_1: {
    name: "Chronic Myeloid Leukemia (CML)",
    icd10: "C92.1",
    category: "hematological",
    definition: "Myeloproliferative neoplasm driven by BCR-ABL1 fusion (Philadelphia chromosome)",
    primaryOrgan: "bonemarrow",
    affectedOrgans: ["bonemarrow", "blood", "spleen"],
    pathophysiology: {
      mechanism: "BCR-ABL1 tyrosine kinase → uncontrolled myeloid proliferation → leukocytosis + splenomegaly",
      molecularBasis: "t(9;22) Philadelphia chromosome creates BCR-ABL1 fusion oncogene with constitutive kinase activity"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Weight loss",
        "Night sweats",
        "Abdominal fullness (massive spleen)",
        "Often incidental finding"
      ],
      signs: [
        "Massive splenomegaly (classic)",
        "Hepatomegaly",
        "Pallor",
        "Sternal tenderness"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Markedly elevated (50-500)" },
      { name: "Differential", normalRange: "Normal", abnormalInDisease: "Left shift: myelocytes, metamyelocytes, bands, blasts <10%" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Often elevated" },
      { name: "Basophils", normalRange: "0-2%", abnormalInDisease: "Elevated (basophilia is characteristic)" },
      { name: "LAP score", normalRange: "Positive", abnormalInDisease: "Low (distinguishes from leukemoid reaction)" },
      { name: "BCR-ABL1", normalRange: "Negative", abnormalInDisease: "Positive (diagnostic)" }
    ],
    imagingFindings: {
      bloodSmear: ["Entire spectrum of myeloid maturation", "Basophilia", "No dysplasia"],
      cytogenetics: ["t(9;22) Philadelphia chromosome"],
      fish: ["BCR-ABL1 fusion"]
    },
    severity: {
      mild: { description: "Chronic phase: <10% blasts, controlled on TKI" },
      moderate: { description: "Accelerated phase: 10-19% blasts, basophilia, new cytogenetic abnormalities" },
      severe: { description: "Blast crisis: ≥20% blasts, transforms to acute leukemia" }
    },
    modifications: {
      blood: {
        geometry: {
          wbc_count: { factor: 20.0, note: "Massive leukocytosis (50-500 ×10⁹/L)" },
          platelet_count: { factor: 1.5, note: "Often elevated" }
        },
        cellular: {
          basophils: { factor: 5.0, note: "Basophilia characteristic" },
          neutrophils: { factor: 1.5, note: "Left shift with all stages" }
        }
      },
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 1.5, note: "Hypercellular" },
          me_ratio: { factor: 5.0, note: "Myeloid hyperplasia" }
        },
        physiology: {
          myeloid_precursors: { factor: 2.0, note: "Granulocytic hyperplasia" }
        }
      },
      spleen: {
        geometry: {
          spleen_volume: { factor: 5.0, note: "Massive splenomegaly" },
          spleen_length: { factor: 2.5, note: "Can extend to pelvis" }
        }
      }
    }
  },

  // =====================
  // LYMPHOMAS
  // ICD-10: C81-C86 Series
  // =====================

  C81_9: {
    name: "Hodgkin Lymphoma",
    icd10: "C81.9",
    category: "hematological",
    definition: "B-cell lymphoid malignancy characterized by Reed-Sternberg cells",
    primaryOrgan: "lymphatic",
    affectedOrgans: ["lymphatic", "spleen", "bonemarrow"],
    pathophysiology: {
      mechanism: "Malignant Reed-Sternberg cells with extensive inflammatory background → lymphadenopathy",
      molecularBasis: "RS cells are clonal B-cells; EBV associated in 40%; NF-κB and JAK-STAT activation"
    },
    clinicalPresentation: {
      symptoms: [
        "Painless lymphadenopathy (cervical most common)",
        "B symptoms (fever, night sweats, >10% weight loss)",
        "Pruritus",
        "Alcohol-induced lymph node pain (rare but classic)",
        "Fatigue"
      ],
      signs: [
        "Rubbery, non-tender lymphadenopathy",
        "Mediastinal mass (young adults)",
        "Splenomegaly",
        "Hepatomegaly (advanced)"
      ]
    },
    laboratoryFindings: [
      { name: "CBC", normalRange: "Normal", abnormalInDisease: "May show anemia, lymphopenia" },
      { name: "ESR", normalRange: "<20 mm/hr", abnormalInDisease: "Elevated (prognostic)" },
      { name: "LDH", normalRange: "140-280 U/L", abnormalInDisease: "Elevated" },
      { name: "Albumin", normalRange: "3.5-5 g/dL", abnormalInDisease: "Low (poor prognosis)" }
    ],
    imagingFindings: {
      lymphNodeBiopsy: ["Reed-Sternberg cells (owl's eye)", "CD15+, CD30+, CD45-", "Inflammatory background"],
      petCt: ["Staging", "FDG-avid nodes", "Deauville score for response"],
      ctScan: ["Lymphadenopathy (contiguous spread pattern)", "Mediastinal mass"]
    },
    severity: {
      mild: { description: "Stage I-II: localized disease" },
      moderate: { description: "Stage III: both sides of diaphragm" },
      severe: { description: "Stage IV: disseminated (liver, marrow, lung)" }
    },
    modifications: {
      lymphatic: {
        geometry: {
          lymph_node_size: { factor: 4.0, note: "Enlarged lymph nodes" }
        },
        physiology: {
          cd4_cd8_ratio: { factor: 0.7, note: "Altered T cell populations" }
        }
      },
      spleen: {
        geometry: {
          spleen_volume: { factor: 1.5, note: "May have splenomegaly" }
        }
      },
      blood: {
        physiology: {
          esr: { factor: 3.0, note: "Elevated ESR" },
          hemoglobin: { factor: 0.85, note: "Anemia of chronic disease" }
        },
        cellular: {
          lymphocytes: { factor: 0.7, note: "Lymphopenia" }
        }
      }
    }
  },

  C85_9: {
    name: "Non-Hodgkin Lymphoma (NHL)",
    icd10: "C85.9",
    category: "hematological",
    definition: "Heterogeneous group of lymphoid malignancies (B-cell or T-cell origin)",
    primaryOrgan: "lymphatic",
    affectedOrgans: ["lymphatic", "bonemarrow", "spleen", "liver", "gi_tract"],
    pathophysiology: {
      mechanism: "Clonal lymphocyte proliferation → nodal and extranodal disease",
      molecularBasis: "Variable: t(14;18) BCL2 in follicular, t(8;14) MYC in Burkitt, t(11;14) cyclin D1 in mantle cell"
    },
    clinicalPresentation: {
      symptoms: [
        "Painless lymphadenopathy",
        "B symptoms (30%)",
        "Extranodal symptoms (GI, skin, CNS)",
        "Fatigue"
      ],
      signs: [
        "Lymphadenopathy (may be peripheral or deep)",
        "Splenomegaly",
        "Hepatomegaly",
        "Extranodal masses",
        "Skin lesions (cutaneous lymphoma)"
      ]
    },
    laboratoryFindings: [
      { name: "CBC", normalRange: "Normal", abnormalInDisease: "Variable, cytopenias if marrow involved" },
      { name: "LDH", normalRange: "140-280 U/L", abnormalInDisease: "Elevated (tumor burden marker)" },
      { name: "β2-microglobulin", normalRange: "<2.5 mg/L", abnormalInDisease: "Elevated (prognostic)" },
      { name: "Uric acid", normalRange: "3.5-7.5 mg/dL", abnormalInDisease: "Elevated (high-grade)" }
    ],
    imagingFindings: {
      lymphNodeBiopsy: ["Variable morphology by subtype", "Flow cytometry for immunophenotype"],
      petCt: ["Staging for aggressive subtypes"],
      ctScan: ["Nodal and extranodal disease"]
    },
    severity: {
      mild: { description: "Indolent: follicular, marginal zone - watch and wait possible" },
      moderate: { description: "Aggressive: DLBCL - curable with chemo-immunotherapy" },
      severe: { description: "Highly aggressive: Burkitt, lymphoblastic - intensive therapy needed" }
    },
    modifications: {
      lymphatic: {
        geometry: {
          lymph_node_size: { factor: 4.0, note: "Lymphadenopathy" }
        }
      },
      spleen: {
        geometry: {
          spleen_volume: { factor: 2.0, note: "Splenomegaly" }
        }
      },
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 1.2, note: "May have marrow involvement" }
        }
      },
      blood: {
        physiology: {
          hemoglobin: { factor: 0.8, note: "Anemia if marrow involved" }
        }
      }
    }
  },

  // =====================
  // MULTIPLE MYELOMA
  // ICD-10: C90 Series
  // =====================

  C90_0: {
    name: "Multiple Myeloma",
    icd10: "C90.0",
    category: "hematological",
    definition: "Malignant plasma cell neoplasm producing monoclonal immunoglobulin",
    primaryOrgan: "bonemarrow",
    affectedOrgans: ["bonemarrow", "blood", "kidneys"],
    pathophysiology: {
      mechanism: "Clonal plasma cell expansion → M-protein production + bone destruction + marrow failure",
      molecularBasis: "IgH translocations, hyperdiploidy, MYC dysregulation, del(17p); osteoclast activation via RANKL"
    },
    clinicalPresentation: {
      symptoms: [
        "Bone pain (especially back, ribs)",
        "Fatigue",
        "Recurrent infections",
        "Symptoms of hypercalcemia (confusion, constipation, thirst)",
        "Symptoms of renal failure"
      ],
      signs: [
        "Pallor",
        "Bone tenderness",
        "Pathological fractures",
        "No lymphadenopathy (important!)",
        "Hyperviscosity syndrome signs (rare)"
      ]
    },
    laboratoryFindings: [
      { name: "M-protein (SPEP)", normalRange: "None", abnormalInDisease: "Present (IgG most common)" },
      { name: "Free light chains", normalRange: "Normal ratio", abnormalInDisease: "Abnormal κ/λ ratio" },
      { name: "Bone marrow plasma cells", normalRange: "<5%", abnormalInDisease: "≥10% (often >30%)" },
      { name: "Calcium", normalRange: "8.5-10.5 mg/dL", abnormalInDisease: "Elevated (hypercalcemia)" },
      { name: "Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "Elevated (renal failure)" },
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low (<10 g/dL)" },
      { name: "β2-microglobulin", normalRange: "<2.5 mg/L", abnormalInDisease: "Elevated (staging)" }
    ],
    imagingFindings: {
      skeletalSurvey: ["Lytic lesions (punched-out)", "Pathological fractures", "Osteoporosis"],
      mri: ["More sensitive than x-ray for lesions"],
      petCt: ["Staging, active disease"]
    },
    severity: {
      mild: { description: "Stage I (ISS): β2M <3.5, albumin ≥3.5" },
      moderate: { description: "Stage II (ISS): intermediate" },
      severe: { description: "Stage III (ISS): β2M ≥5.5, high-risk cytogenetics" }
    },
    modifications: {
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 1.4, note: "Plasma cell infiltration" }
        },
        physiology: {
          plasma_cells: { factor: 10.0, note: "≥10% clonal plasma cells" },
          erythroid_precursors: { factor: 0.5, note: "Suppressed" }
        }
      },
      blood: {
        physiology: {
          hemoglobin: { factor: 0.6, note: "Anemia (CRAB criteria)" },
          esr: { factor: 5.0, note: "Very elevated (rouleaux)" }
        },
        geometry: {
          rbc_count: { factor: 0.65, note: "Anemia" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.5, note: "Renal failure (CRAB criteria)" },
          creatinine: { factor: 2.5, note: "Elevated >2 mg/dL" }
        }
      }
    }
  },

  // =====================
  // SOLID TUMORS
  // ICD-10: C34, C50, C18, C61
  // =====================

  C34_9: {
    name: "Lung Cancer (Non-Small Cell)",
    icd10: "C34.9",
    category: "oncology",
    definition: "Malignant neoplasm of bronchus or lung (adenocarcinoma, squamous, large cell)",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "lymphatic", "brain", "liver", "bonemarrow"],
    pathophysiology: {
      mechanism: "Malignant transformation of bronchial epithelium → local invasion + distant metastasis",
      molecularBasis: "EGFR mutations, ALK/ROS1 fusions, KRAS mutations, PD-L1 expression; smoking-related DNA damage"
    },
    clinicalPresentation: {
      symptoms: [
        "Cough (new or changed)",
        "Hemoptysis",
        "Dyspnea",
        "Chest pain",
        "Weight loss",
        "Bone pain (metastases)",
        "Paraneoplastic syndromes"
      ],
      signs: [
        "Decreased breath sounds",
        "Clubbing",
        "Supraclavicular lymphadenopathy",
        "Horner syndrome (Pancoast tumor)",
        "SVC syndrome"
      ]
    },
    laboratoryFindings: [
      { name: "CBC", normalRange: "Normal", abnormalInDisease: "Anemia, thrombocytosis" },
      { name: "Calcium", normalRange: "8.5-10.5 mg/dL", abnormalInDisease: "Elevated (PTHrP, squamous)" },
      { name: "LDH", normalRange: "140-280 U/L", abnormalInDisease: "Elevated" },
      { name: "CEA", normalRange: "<5 ng/mL", abnormalInDisease: "Elevated (adenocarcinoma)" }
    ],
    imagingFindings: {
      ctChest: ["Mass or nodule", "Hilar/mediastinal adenopathy", "Pleural effusion"],
      petCt: ["Staging, FDG uptake"],
      mri_Brain: ["Metastases screening"]
    },
    severity: {
      mild: { description: "Stage I: localized, surgically resectable" },
      moderate: { description: "Stage II-III: locally advanced" },
      severe: { description: "Stage IV: metastatic disease" }
    },
    modifications: {
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.92, note: "Hypoxemia" },
          fev1: { factor: 0.7, note: "Reduced lung function" }
        }
      },
      blood: {
        geometry: {
          platelet_count: { factor: 1.3, note: "Paraneoplastic thrombocytosis" }
        },
        physiology: {
          hemoglobin: { factor: 0.8, note: "Anemia of malignancy" }
        }
      },
      gi_tract: {
        structure: {
          cea: { factor: 3.0, note: "Elevated tumor marker" }
        }
      }
    }
  },

  C50_9: {
    name: "Breast Cancer",
    icd10: "C50.9",
    category: "oncology",
    definition: "Malignant neoplasm of breast tissue",
    primaryOrgan: "breast",
    affectedOrgans: ["breast", "lymphatic", "bonemarrow", "liver", "lungs", "brain"],
    pathophysiology: {
      mechanism: "Malignant transformation of ductal or lobular epithelium → local invasion + metastasis",
      molecularBasis: "ER/PR expression, HER2 amplification, BRCA1/2 mutations; subtypes: Luminal A/B, HER2+, Triple-negative"
    },
    clinicalPresentation: {
      symptoms: [
        "Painless breast mass",
        "Nipple discharge",
        "Skin changes (peau d'orange)",
        "Breast pain (rare)",
        "Symptoms from metastases"
      ],
      signs: [
        "Palpable breast mass",
        "Skin dimpling or retraction",
        "Nipple inversion",
        "Axillary lymphadenopathy",
        "Paget disease of nipple"
      ]
    },
    laboratoryFindings: [
      { name: "CA 15-3", normalRange: "<30 U/mL", abnormalInDisease: "Elevated (metastatic)" },
      { name: "CA 27.29", normalRange: "<38 U/mL", abnormalInDisease: "Elevated" },
      { name: "Alkaline phosphatase", normalRange: "44-147 U/L", abnormalInDisease: "Elevated (bone mets)" }
    ],
    imagingFindings: {
      mammography: ["Mass", "Calcifications", "Architectural distortion"],
      ultrasound: ["Mass characterization"],
      mri: ["Extent of disease", "Contralateral screening"],
      petCt: ["Staging for metastatic workup"]
    },
    severity: {
      mild: { description: "Stage I: <2cm, node-negative" },
      moderate: { description: "Stage II-III: larger tumors or node-positive" },
      severe: { description: "Stage IV: metastatic (bone, liver, lung, brain)" }
    },
    modifications: {
      breast: {
        geometry: {
          lesion_size: { factor: 5.0, note: "Tumor present" },
          tumor_volume: { factor: 5.0, note: "Variable size" }
        },
        physiology: {
          ca_15_3: { factor: 3.0, note: "Elevated in metastatic disease" },
          ki67: { factor: 2.0, note: "Elevated proliferation index" }
        }
      },
      lymphatic: {
        geometry: {
          lymph_node_size: { factor: 2.0, note: "Axillary adenopathy" }
        }
      }
    }
  },

  C18_9: {
    name: "Colorectal Cancer",
    icd10: "C18.9",
    category: "oncology",
    definition: "Malignant neoplasm of colon or rectum",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "liver", "lungs", "lymphatic"],
    pathophysiology: {
      mechanism: "Adenoma-carcinoma sequence → invasive adenocarcinoma → metastasis (liver via portal circulation)",
      molecularBasis: "APC, KRAS, TP53 mutations; microsatellite instability (MSI-H); CpG island methylation"
    },
    clinicalPresentation: {
      symptoms: [
        "Change in bowel habits",
        "Blood in stool (hematochezia, melena)",
        "Abdominal pain",
        "Weight loss",
        "Iron deficiency anemia symptoms",
        "Tenesmus (rectal)"
      ],
      signs: [
        "Palpable abdominal mass (right colon)",
        "Rectal mass on DRE",
        "Hepatomegaly (metastases)",
        "Signs of bowel obstruction"
      ]
    },
    laboratoryFindings: [
      { name: "CEA", normalRange: "<5 ng/mL", abnormalInDisease: "Elevated (prognostic, monitoring)" },
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low (iron deficiency anemia)" },
      { name: "Iron studies", normalRange: "Normal", abnormalInDisease: "Iron deficiency pattern" },
      { name: "Liver enzymes", normalRange: "Normal", abnormalInDisease: "Elevated if liver mets" }
    ],
    imagingFindings: {
      colonoscopy: ["Mass, biopsy for diagnosis"],
      ctAbdomenPelvis: ["Primary tumor, liver metastases"],
      petCt: ["Staging, recurrence detection"]
    },
    severity: {
      mild: { description: "Stage I: T1-2, N0" },
      moderate: { description: "Stage II-III: T3-4 or N+" },
      severe: { description: "Stage IV: metastatic (liver, lung)" }
    },
    modifications: {
      gi_tract: {
        structure: {
          cea: { factor: 10.0, note: "Elevated tumor marker" }
        },
        physiology: {
          colonic_transit: { factor: 0.5, note: "Altered if obstructing" }
        }
      },
      blood: {
        physiology: {
          hemoglobin: { factor: 0.7, note: "Iron deficiency anemia from blood loss" },
          mcv: { factor: 0.8, note: "Microcytic anemia" }
        },
        structure: {
          ferritin: { factor: 0.3, note: "Depleted iron stores" }
        }
      },
      liver: {
        physiology: {
          alt: { factor: 2.0, note: "Elevated if liver metastases" }
        }
      }
    }
  },

  C61: {
    name: "Prostate Cancer",
    icd10: "C61",
    category: "oncology",
    definition: "Adenocarcinoma of prostate gland",
    primaryOrgan: "prostate",
    affectedOrgans: ["prostate", "bonemarrow", "lymphatic"],
    pathophysiology: {
      mechanism: "Androgen-driven malignant transformation of prostatic epithelium → local invasion → bony metastases",
      molecularBasis: "Androgen receptor signaling, TMPRSS2-ERG fusion, PTEN loss, DNA repair gene mutations (BRCA2)"
    },
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic (PSA screening)",
        "Urinary symptoms (obstruction)",
        "Bone pain (metastases)",
        "Hematuria (rare)"
      ],
      signs: [
        "Nodule on digital rectal exam",
        "Hard, fixed prostate (advanced)",
        "Lower extremity edema (lymphatic obstruction)"
      ]
    },
    laboratoryFindings: [
      { name: "PSA", normalRange: "<4 ng/mL", abnormalInDisease: "Elevated" },
      { name: "Free PSA ratio", normalRange: ">25%", abnormalInDisease: "Low (<15% more concerning)" },
      { name: "Alkaline phosphatase", normalRange: "44-147 U/L", abnormalInDisease: "Elevated (bone mets)" }
    ],
    imagingFindings: {
      mriProstate: ["Multiparametric MRI for localization"],
      boneScan: ["Osteoblastic metastases"],
      psmaPet: ["More sensitive for metastases"]
    },
    severity: {
      mild: { description: "Low risk: Gleason ≤6, PSA <10, T1-2a" },
      moderate: { description: "Intermediate risk: Gleason 7, PSA 10-20, T2b-c" },
      severe: { description: "High risk: Gleason 8-10, PSA >20, or metastatic" }
    },
    modifications: {
      prostate: {
        geometry: {
          prostate_volume: { factor: 1.5, note: "Enlarged gland" }
        },
        physiology: {
          psa: { factor: 5.0, note: "Elevated PSA" },
          psa_density: { factor: 2.0, note: "Elevated density" },
          gleason_score: { factor: 1.3, note: "Gleason 6-10" }
        }
      },
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 1.1, note: "May have metastases" }
        }
      }
    }
  }
};

export default ONCOLOGY_DISEASES;
