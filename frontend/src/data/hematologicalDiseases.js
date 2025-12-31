// ============================================================
// HEMATOLOGICAL DISEASES DATABASE
// Blood disorders including anemias, coagulopathies, and cytopenias
// ICD-10: D50-D89 (Diseases of the blood)
// ============================================================

export const HEMATOLOGICAL_DISEASES = {
  // =====================
  // IRON DEFICIENCY ANEMIA
  // ICD-10: D50 Series
  // =====================

  D50_9: {
    name: "Iron Deficiency Anemia",
    icd10: "D50.9",
    category: "hematological",
    definition: "Microcytic, hypochromic anemia due to inadequate iron for hemoglobin synthesis",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "bonemarrow", "heart"],
    pathophysiology: {
      mechanism: "Insufficient iron stores → decreased heme synthesis → microcytic RBCs → tissue hypoxia",
      molecularBasis: "Iron is essential for heme in hemoglobin; deficiency leads to small, pale RBCs"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue and weakness",
        "Pallor",
        "Dyspnea on exertion",
        "Pica (craving non-food items)",
        "Restless leg syndrome",
        "Brittle nails (koilonychia)",
        "Angular cheilitis"
      ],
      signs: [
        "Pallor (conjunctival, palmar)",
        "Tachycardia",
        "Systolic flow murmur",
        "Koilonychia (spoon nails)",
        "Glossitis"
      ]
    },
    laboratoryFindings: [
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low (<12 g/dL)" },
      { name: "MCV", normalRange: "80-100 fL", abnormalInDisease: "Low (<80 fL) - Microcytic" },
      { name: "MCH", normalRange: "27-33 pg", abnormalInDisease: "Low (<27 pg)" },
      { name: "Serum Iron", normalRange: "60-170 μg/dL", abnormalInDisease: "Low" },
      { name: "Ferritin", normalRange: "20-300 ng/mL", abnormalInDisease: "Very low (<12 ng/mL) - Most specific" },
      { name: "TIBC", normalRange: "250-400 μg/dL", abnormalInDisease: "High (>400)" },
      { name: "Transferrin Saturation", normalRange: "20-50%", abnormalInDisease: "Low (<20%)" },
      { name: "RDW", normalRange: "11.5-14.5%", abnormalInDisease: "High (>14.5%) - Anisocytosis" }
    ],
    imagingFindings: {
      bloodSmear: ["Microcytic hypochromic RBCs", "Target cells", "Pencil cells", "Anisocytosis"],
      other: ["Upper/lower GI endoscopy to find source of blood loss"]
    },
    severity: {
      mild: { description: "Hgb 10-12 g/dL, minimal symptoms" },
      moderate: { description: "Hgb 7-10 g/dL, fatigue on exertion" },
      severe: { description: "Hgb <7 g/dL, symptomatic at rest, may need transfusion" }
    },
    modifications: {
      blood: {
        physiology: {
          hemoglobin: { factor: 0.6, note: "Decreased hemoglobin synthesis" },
          mcv: { factor: 0.75, note: "Microcytic - small RBCs (<80 fL)" },
          mch: { factor: 0.7, note: "Hypochromic - pale RBCs" },
          mchc: { factor: 0.9, note: "Reduced concentration" },
          rdw: { factor: 1.3, note: "Increased anisocytosis" },
          reticulocyte_count: { factor: 0.8, note: "Inappropriately low for anemia" }
        },
        structure: {
          serum_iron: { factor: 0.3, note: "Markedly decreased" },
          ferritin: { factor: 0.1, note: "Depleted stores (<12 ng/mL)" },
          tibc: { factor: 1.4, note: "Elevated - body trying to capture iron" },
          transferrin_sat: { factor: 0.3, note: "Low saturation (<20%)" }
        },
        geometry: {
          hematocrit: { factor: 0.7, note: "Reduced" }
        }
      },
      bonemarrow: {
        geometry: {
          iron_stores: { factor: 0.1, note: "Absent iron on staining" }
        },
        physiology: {
          erythroid_precursors: { factor: 1.2, note: "Increased but ineffective" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.2, note: "Compensatory tachycardia" },
          cardiac_output: { factor: 1.15, note: "Increased to maintain O2 delivery" }
        }
      }
    }
  },

  // =====================
  // VITAMIN B12 DEFICIENCY
  // ICD-10: D51 Series
  // =====================

  D51_0: {
    name: "Pernicious Anemia (B12 Deficiency)",
    icd10: "D51.0",
    category: "hematological",
    definition: "Macrocytic anemia due to B12 deficiency from lack of intrinsic factor",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "bonemarrow", "brain"],
    pathophysiology: {
      mechanism: "Autoimmune destruction of gastric parietal cells → no intrinsic factor → no B12 absorption → impaired DNA synthesis",
      molecularBasis: "B12 is cofactor for methionine synthase and methylmalonyl-CoA mutase; deficiency causes megaloblastic changes"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue and weakness",
        "Glossitis (beefy red tongue)",
        "Paresthesias (numbness/tingling)",
        "Difficulty walking (ataxia)",
        "Memory problems",
        "Depression"
      ],
      signs: [
        "Pallor with lemon-yellow tinge",
        "Glossitis",
        "Peripheral neuropathy",
        "Subacute combined degeneration",
        "Positive Romberg sign",
        "Decreased vibration/position sense"
      ]
    },
    laboratoryFindings: [
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low" },
      { name: "MCV", normalRange: "80-100 fL", abnormalInDisease: "High (>100 fL) - Macrocytic" },
      { name: "Vitamin B12", normalRange: "200-900 pg/mL", abnormalInDisease: "Low (<200 pg/mL)" },
      { name: "Methylmalonic acid", normalRange: "<0.4 μmol/L", abnormalInDisease: "Elevated (specific for B12)" },
      { name: "Homocysteine", normalRange: "<15 μmol/L", abnormalInDisease: "Elevated" },
      { name: "LDH", normalRange: "140-280 U/L", abnormalInDisease: "Elevated (ineffective erythropoiesis)" },
      { name: "Intrinsic factor antibodies", normalRange: "Negative", abnormalInDisease: "Positive (60% sensitive, highly specific)" },
      { name: "Reticulocyte count", normalRange: "0.5-2%", abnormalInDisease: "Low (inappropriately)" }
    ],
    imagingFindings: {
      bloodSmear: ["Macro-ovalocytes", "Hypersegmented neutrophils (>5 lobes)", "Anisocytosis", "Poikilocytosis"],
      mri: ["Subacute combined degeneration of spinal cord (posterior columns)"]
    },
    severity: {
      mild: { description: "Hgb 10-12 g/dL, no neurological symptoms" },
      moderate: { description: "Hgb 7-10 g/dL, paresthesias" },
      severe: { description: "Hgb <7 g/dL, neurological deficits, may be irreversible" }
    },
    modifications: {
      blood: {
        physiology: {
          hemoglobin: { factor: 0.6, note: "Decreased" },
          mcv: { factor: 1.3, note: "Macrocytic (>100 fL)" },
          reticulocyte_count: { factor: 0.5, note: "Inappropriately low" }
        },
        structure: {
          vitamin_b12: { factor: 0.2, note: "Severely depleted" }
        },
        geometry: {
          rbc_count: { factor: 0.6, note: "Pancytopenia possible" },
          hematocrit: { factor: 0.65, note: "Reduced" }
        }
      },
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 1.3, note: "Hypercellular but ineffective" }
        },
        physiology: {
          erythroid_precursors: { factor: 1.5, note: "Megaloblastic changes" }
        }
      },
      brain: {
        cellular: {
          conduction_velocity_axon: { factor: 0.7, note: "Demyelination" }
        },
        structure: {
          myelin_volume: { factor: 0.85, note: "Subacute combined degeneration" }
        }
      }
    }
  },

  // =====================
  // FOLATE DEFICIENCY
  // ICD-10: D52 Series
  // =====================

  D52_9: {
    name: "Folate Deficiency Anemia",
    icd10: "D52.9",
    category: "hematological",
    definition: "Macrocytic anemia due to folic acid deficiency",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "bonemarrow"],
    pathophysiology: {
      mechanism: "Inadequate folate → impaired DNA synthesis → megaloblastic erythropoiesis",
      molecularBasis: "Folate is essential for thymidine synthesis; deficiency causes nuclear-cytoplasmic asynchrony"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Glossitis",
        "Diarrhea",
        "NO neurological symptoms (unlike B12)"
      ],
      signs: [
        "Pallor",
        "Glossitis",
        "No neurological findings"
      ]
    },
    laboratoryFindings: [
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low" },
      { name: "MCV", normalRange: "80-100 fL", abnormalInDisease: "High (>100 fL)" },
      { name: "Folate", normalRange: "3-17 ng/mL", abnormalInDisease: "Low (<3 ng/mL)" },
      { name: "Homocysteine", normalRange: "<15 μmol/L", abnormalInDisease: "Elevated" },
      { name: "Methylmalonic acid", normalRange: "<0.4 μmol/L", abnormalInDisease: "NORMAL (distinguishes from B12)" }
    ],
    imagingFindings: {
      bloodSmear: ["Macro-ovalocytes", "Hypersegmented neutrophils"]
    },
    severity: {
      mild: { description: "Hgb 10-12 g/dL" },
      moderate: { description: "Hgb 7-10 g/dL" },
      severe: { description: "Hgb <7 g/dL" }
    },
    modifications: {
      blood: {
        physiology: {
          hemoglobin: { factor: 0.65, note: "Decreased" },
          mcv: { factor: 1.25, note: "Macrocytic" }
        },
        structure: {
          folate: { factor: 0.2, note: "Depleted" }
        }
      },
      bonemarrow: {
        physiology: {
          erythroid_precursors: { factor: 1.4, note: "Megaloblastic" }
        }
      }
    }
  },

  // =====================
  // SICKLE CELL DISEASE
  // ICD-10: D57 Series
  // =====================

  D57_1: {
    name: "Sickle Cell Disease (HbSS)",
    icd10: "D57.1",
    category: "hematological",
    definition: "Hereditary hemoglobinopathy with abnormal HbS causing RBC sickling and vaso-occlusion",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "spleen", "bonemarrow", "kidneys", "brain", "lungs"],
    pathophysiology: {
      mechanism: "HbS polymerization under hypoxia → RBC sickling → hemolysis + vaso-occlusion → organ damage",
      molecularBasis: "Point mutation (Glu→Val at position 6) in β-globin gene; HbS polymerizes when deoxygenated"
    },
    clinicalPresentation: {
      symptoms: [
        "Painful vaso-occlusive crises",
        "Bone pain",
        "Fatigue",
        "Jaundice",
        "Acute chest syndrome symptoms",
        "Priapism",
        "Stroke symptoms"
      ],
      signs: [
        "Pallor and jaundice",
        "Splenomegaly (early) then autosplenectomy",
        "Cardiomegaly",
        "Leg ulcers",
        "Dactylitis (hand-foot syndrome in children)"
      ]
    },
    laboratoryFindings: [
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low (6-9 g/dL baseline)" },
      { name: "Reticulocyte count", normalRange: "0.5-2%", abnormalInDisease: "High (10-20%) - compensatory" },
      { name: "Hemoglobin electrophoresis", normalRange: "HbA >95%", abnormalInDisease: "HbS >80%, HbF variable" },
      { name: "LDH", normalRange: "140-280 U/L", abnormalInDisease: "Elevated (hemolysis)" },
      { name: "Indirect bilirubin", normalRange: "0.1-0.5 mg/dL", abnormalInDisease: "Elevated (hemolysis)" },
      { name: "Haptoglobin", normalRange: "30-200 mg/dL", abnormalInDisease: "Low or absent" }
    ],
    imagingFindings: {
      bloodSmear: ["Sickle cells", "Target cells", "Howell-Jolly bodies (functional asplenia)", "Nucleated RBCs"],
      xray: ["H-shaped vertebrae", "Hair-on-end skull appearance"],
      mri: ["Silent infarcts in brain", "Avascular necrosis of femoral head"]
    },
    severity: {
      mild: { description: "Rare crises, Hgb >9, minimal organ damage" },
      moderate: { description: "Periodic crises, some organ involvement" },
      severe: { description: "Frequent crises, stroke, ACS, significant organ damage" }
    },
    modifications: {
      blood: {
        physiology: {
          hemoglobin: { factor: 0.55, note: "Chronic hemolytic anemia (6-9 g/dL)" },
          reticulocyte_count: { factor: 10.0, note: "Markedly elevated (10-20%)" },
          mcv: { factor: 1.0, note: "Usually normocytic" }
        },
        geometry: {
          rbc_count: { factor: 0.6, note: "Decreased due to hemolysis" },
          hematocrit: { factor: 0.55, note: "Low (18-28%)" }
        }
      },
      spleen: {
        geometry: {
          spleen_volume: { factor: 0.3, note: "Autosplenectomy by adulthood" },
          spleen_weight: { factor: 0.3, note: "Fibrotic, non-functional" }
        },
        physiology: {
          filtration_rate: { factor: 0.1, note: "Lost splenic function" }
        }
      },
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 1.5, note: "Hyperplastic (compensatory)" }
        },
        physiology: {
          erythroid_precursors: { factor: 2.0, note: "Markedly increased" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.8, note: "Sickle nephropathy" },
          urine_output: { factor: 1.2, note: "Hyposthenuria (unable to concentrate)" }
        }
      },
      brain: {
        physiology: {
          cbf: { factor: 0.85, note: "Risk of stroke from vaso-occlusion" }
        }
      }
    }
  },

  // =====================
  // THALASSEMIA
  // ICD-10: D56 Series
  // =====================

  D56_1: {
    name: "Beta Thalassemia Major",
    icd10: "D56.1",
    category: "hematological",
    definition: "Severe hereditary anemia from absent or severely reduced β-globin chain synthesis",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "bonemarrow", "spleen", "liver", "heart"],
    pathophysiology: {
      mechanism: "Absent/reduced β-globin → excess α-chains precipitate → ineffective erythropoiesis + hemolysis",
      molecularBasis: "Mutations in β-globin gene; unpaired α-chains cause oxidative damage to RBC precursors"
    },
    clinicalPresentation: {
      symptoms: [
        "Severe anemia from infancy",
        "Failure to thrive",
        "Fatigue",
        "Jaundice"
      ],
      signs: [
        "Severe pallor",
        "Hepatosplenomegaly",
        "Skeletal deformities (frontal bossing, maxillary hyperplasia)",
        "Growth retardation",
        "Iron overload signs (if transfusion-dependent)"
      ]
    },
    laboratoryFindings: [
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Very low (<7 g/dL without transfusion)" },
      { name: "MCV", normalRange: "80-100 fL", abnormalInDisease: "Very low (<70 fL) - Severe microcytosis" },
      { name: "Hemoglobin electrophoresis", normalRange: "HbA >95%", abnormalInDisease: "HbF elevated (>90%), HbA2 variable, HbA absent/minimal" },
      { name: "Reticulocyte count", normalRange: "0.5-2%", abnormalInDisease: "Variable, often inappropriately low" },
      { name: "Ferritin", normalRange: "20-300 ng/mL", abnormalInDisease: "Elevated (iron overload from transfusions)" }
    ],
    imagingFindings: {
      bloodSmear: ["Severe microcytosis", "Target cells", "Nucleated RBCs", "Basophilic stippling", "Teardrop cells"],
      xray: ["Hair-on-end appearance of skull", "Expanded marrow spaces"]
    },
    severity: {
      mild: { description: "N/A - Thalassemia major is always severe" },
      moderate: { description: "N/A" },
      severe: { description: "Transfusion-dependent from infancy, iron overload complications" }
    },
    modifications: {
      blood: {
        physiology: {
          hemoglobin: { factor: 0.4, note: "Severely decreased (<7 g/dL)" },
          mcv: { factor: 0.65, note: "Marked microcytosis (<70 fL)" },
          mch: { factor: 0.6, note: "Hypochromic" }
        },
        structure: {
          ferritin: { factor: 10.0, note: "Iron overload from transfusions" }
        },
        geometry: {
          rbc_count: { factor: 0.5, note: "Severely reduced" }
        }
      },
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 1.8, note: "Marked erythroid hyperplasia" }
        },
        physiology: {
          erythroid_precursors: { factor: 3.0, note: "Ineffective erythropoiesis" },
          me_ratio: { factor: 0.3, note: "Inverted (erythroid predominance)" }
        }
      },
      spleen: {
        geometry: {
          spleen_volume: { factor: 3.0, note: "Massive splenomegaly" },
          spleen_length: { factor: 2.0, note: "Enlarged" }
        }
      },
      liver: {
        geometry: {
          liver_volume: { factor: 1.5, note: "Hepatomegaly from extramedullary hematopoiesis" }
        }
      },
      heart: {
        physiology: {
          cardiac_output: { factor: 1.3, note: "High-output state" }
        }
      }
    }
  },

  // =====================
  // APLASTIC ANEMIA
  // ICD-10: D61 Series
  // =====================

  D61_9: {
    name: "Aplastic Anemia",
    icd10: "D61.9",
    category: "hematological",
    definition: "Bone marrow failure resulting in pancytopenia from hypocellular marrow",
    primaryOrgan: "bonemarrow",
    affectedOrgans: ["bonemarrow", "blood"],
    pathophysiology: {
      mechanism: "Immune-mediated destruction of hematopoietic stem cells → empty marrow → pancytopenia",
      molecularBasis: "T-cell mediated attack on HSCs; may be triggered by drugs, viruses, or idiopathic"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue (anemia)",
        "Easy bruising/bleeding (thrombocytopenia)",
        "Recurrent infections (neutropenia)",
        "Petechiae"
      ],
      signs: [
        "Pallor",
        "Petechiae, ecchymoses",
        "Mucosal bleeding",
        "No hepatosplenomegaly (distinguishes from leukemia)",
        "No lymphadenopathy"
      ]
    },
    laboratoryFindings: [
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Low (neutropenia)" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Low (<20,000 severe)" },
      { name: "Reticulocyte count", normalRange: "0.5-2%", abnormalInDisease: "Very low (<1%) - key finding" },
      { name: "MCV", normalRange: "80-100 fL", abnormalInDisease: "Usually normal or slightly high" }
    ],
    imagingFindings: {
      boneMarrowBiopsy: ["Hypocellular marrow (<25%)", "Fat replacement", "No abnormal cells", "Residual lymphocytes and plasma cells"]
    },
    severity: {
      mild: { description: "ANC >1000, platelets >50,000" },
      moderate: { description: "ANC 500-1000" },
      severe: { description: "ANC <500, platelets <20,000, reticulocytes <1% (2 of 3 criteria)" }
    },
    modifications: {
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 0.2, note: "Severely hypocellular (<25%)" }
        },
        physiology: {
          erythroid_precursors: { factor: 0.1, note: "Markedly decreased" },
          myeloid_precursors: { factor: 0.1, note: "Markedly decreased" },
          stem_cell_frequency: { factor: 0.1, note: "HSC depletion" }
        },
        cellular: {
          megakaryocytes: { factor: 0.1, note: "Absent or rare" }
        }
      },
      blood: {
        geometry: {
          rbc_count: { factor: 0.5, note: "Anemia" },
          wbc_count: { factor: 0.3, note: "Leukopenia" },
          platelet_count: { factor: 0.15, note: "Severe thrombocytopenia" }
        },
        physiology: {
          hemoglobin: { factor: 0.6, note: "Anemia" },
          reticulocyte_count: { factor: 0.3, note: "Inappropriately low" }
        },
        cellular: {
          absolute_neutrophil: { factor: 0.2, note: "Severe neutropenia" }
        }
      }
    }
  },

  // =====================
  // HEMOLYTIC ANEMIAS
  // ICD-10: D59 Series
  // =====================

  D59_1: {
    name: "Autoimmune Hemolytic Anemia (Warm)",
    icd10: "D59.1",
    category: "hematological",
    definition: "Antibody-mediated destruction of RBCs by warm-reactive IgG autoantibodies",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "spleen"],
    pathophysiology: {
      mechanism: "IgG autoantibodies coat RBCs → extravascular hemolysis in spleen → anemia",
      molecularBasis: "Fc receptor-mediated phagocytosis by splenic macrophages; may be primary or secondary to lymphoma, SLE"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Jaundice",
        "Dark urine",
        "Dyspnea"
      ],
      signs: [
        "Pallor",
        "Jaundice (unconjugated hyperbilirubinemia)",
        "Splenomegaly",
        "Tachycardia"
      ]
    },
    laboratoryFindings: [
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low (can drop rapidly)" },
      { name: "Reticulocyte count", normalRange: "0.5-2%", abnormalInDisease: "High (>3%) - appropriate response" },
      { name: "Direct Coombs (DAT)", normalRange: "Negative", abnormalInDisease: "Positive (IgG ± C3)" },
      { name: "LDH", normalRange: "140-280 U/L", abnormalInDisease: "Elevated" },
      { name: "Indirect bilirubin", normalRange: "0.1-0.5 mg/dL", abnormalInDisease: "Elevated" },
      { name: "Haptoglobin", normalRange: "30-200 mg/dL", abnormalInDisease: "Low or absent" }
    ],
    imagingFindings: {
      bloodSmear: ["Spherocytes", "Polychromasia (reticulocytosis)", "Nucleated RBCs"]
    },
    severity: {
      mild: { description: "Hgb 10-12, compensated hemolysis" },
      moderate: { description: "Hgb 7-10, symptomatic" },
      severe: { description: "Hgb <7, life-threatening" }
    },
    modifications: {
      blood: {
        physiology: {
          hemoglobin: { factor: 0.55, note: "Rapid decline possible" },
          reticulocyte_count: { factor: 5.0, note: "Appropriate reticulocytosis" }
        },
        geometry: {
          hematocrit: { factor: 0.6, note: "Reduced" }
        }
      },
      spleen: {
        geometry: {
          spleen_volume: { factor: 1.5, note: "Splenomegaly (site of RBC destruction)" }
        },
        physiology: {
          rbc_sequestration: { factor: 2.0, note: "Increased RBC trapping" }
        }
      }
    }
  },

  // =====================
  // THROMBOCYTOPENIA
  // ICD-10: D69 Series
  // =====================

  D69_3: {
    name: "Immune Thrombocytopenic Purpura (ITP)",
    icd10: "D69.3",
    category: "hematological",
    definition: "Autoimmune destruction of platelets leading to isolated thrombocytopenia",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "spleen"],
    pathophysiology: {
      mechanism: "Anti-platelet antibodies → platelet destruction in spleen → thrombocytopenia",
      molecularBasis: "IgG autoantibodies against GPIIb/IIIa or GPIb/IX on platelets"
    },
    clinicalPresentation: {
      symptoms: [
        "Easy bruising",
        "Petechiae",
        "Mucosal bleeding (epistaxis, gingival)",
        "Menorrhagia",
        "Rarely: intracranial hemorrhage"
      ],
      signs: [
        "Petechiae",
        "Purpura",
        "Ecchymoses",
        "No splenomegaly (important!)",
        "Otherwise healthy appearance"
      ]
    },
    laboratoryFindings: [
      { name: "Platelet count", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Low (<100, often <30)" },
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Usually normal unless bleeding" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Normal" },
      { name: "PT/PTT", normalRange: "Normal", abnormalInDisease: "Normal (platelet problem, not coagulation)" },
      { name: "Blood smear", normalRange: "Normal", abnormalInDisease: "Large platelets (young), no schistocytes" }
    ],
    imagingFindings: {
      bloodSmear: ["Large/giant platelets", "Decreased platelet number", "Normal RBC and WBC morphology"],
      boneMarrowBiopsy: ["Increased megakaryocytes (only if diagnosis unclear)"]
    },
    severity: {
      mild: { description: "Platelets 30-100, no bleeding" },
      moderate: { description: "Platelets 10-30, minor bleeding" },
      severe: { description: "Platelets <10, major/life-threatening bleeding risk" }
    },
    modifications: {
      blood: {
        geometry: {
          platelet_count: { factor: 0.15, note: "Severely reduced (<30 ×10⁹/L)" }
        },
        pressures: {
          bleeding_time: { factor: 2.0, note: "Prolonged" }
        }
      },
      bonemarrow: {
        cellular: {
          megakaryocytes: { factor: 2.0, note: "Increased (compensatory)" }
        }
      }
    }
  },

  // =====================
  // DIC
  // ICD-10: D65
  // =====================

  D65: {
    name: "Disseminated Intravascular Coagulation (DIC)",
    icd10: "D65",
    category: "hematological",
    definition: "Systemic activation of coagulation causing widespread microvascular thrombosis AND bleeding",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "kidneys", "brain", "lungs", "liver"],
    pathophysiology: {
      mechanism: "Massive tissue factor release → systemic coagulation activation → consumption of clotting factors + platelets → bleeding",
      molecularBasis: "Triggered by sepsis, trauma, malignancy, obstetric emergencies; fibrin deposition causes organ damage"
    },
    clinicalPresentation: {
      symptoms: [
        "Bleeding from multiple sites",
        "Oozing from IV sites",
        "Petechiae",
        "Organ dysfunction symptoms"
      ],
      signs: [
        "Diffuse bleeding",
        "Petechiae and purpura",
        "Acral cyanosis",
        "Signs of underlying cause (sepsis, etc.)",
        "Multi-organ failure"
      ]
    },
    laboratoryFindings: [
      { name: "Platelet count", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Low (consumption)" },
      { name: "PT/INR", normalRange: "11-14 sec / 0.9-1.1", abnormalInDisease: "Prolonged" },
      { name: "PTT", normalRange: "25-35 sec", abnormalInDisease: "Prolonged" },
      { name: "Fibrinogen", normalRange: "200-400 mg/dL", abnormalInDisease: "Low (<100 mg/dL)" },
      { name: "D-dimer", normalRange: "<0.5 μg/mL", abnormalInDisease: "Markedly elevated" },
      { name: "Blood smear", normalRange: "Normal", abnormalInDisease: "Schistocytes (microangiopathic hemolysis)" }
    ],
    imagingFindings: {
      bloodSmear: ["Schistocytes (fragmented RBCs)", "Decreased platelets"]
    },
    severity: {
      mild: { description: "Lab abnormalities only" },
      moderate: { description: "Minor bleeding, single organ dysfunction" },
      severe: { description: "Major hemorrhage, multi-organ failure, high mortality" }
    },
    modifications: {
      blood: {
        geometry: {
          platelet_count: { factor: 0.3, note: "Consumption" }
        },
        pressures: {
          pt: { factor: 1.8, note: "Prolonged" },
          ptt: { factor: 1.8, note: "Prolonged" },
          inr: { factor: 2.5, note: "Elevated" },
          fibrinogen: { factor: 0.3, note: "Consumed" },
          d_dimer: { factor: 20.0, note: "Markedly elevated" }
        },
        physiology: {
          hemoglobin: { factor: 0.75, note: "Microangiopathic hemolysis" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.5, note: "Acute kidney injury from microthrombosis" },
          creatinine: { factor: 2.0, note: "Elevated" }
        }
      },
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.9, note: "ARDS risk" }
        }
      }
    }
  }
};

export default HEMATOLOGICAL_DISEASES;
