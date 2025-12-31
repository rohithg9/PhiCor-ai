// ============================================================
// CONGENITAL SYNDROMES DATABASE
// Genetic and chromosomal disorders with multi-system effects
// ICD-10: Q00-Q99 (Congenital malformations)
// ============================================================

export const CONGENITAL_DISEASES = {
  // =====================
  // CHROMOSOMAL DISORDERS
  // ICD-10: Q90-Q99 Series
  // =====================

  Q90_9: {
    name: "Down Syndrome (Trisomy 21)",
    icd10: "Q90.9",
    category: "congenital",
    definition: "Chromosomal disorder caused by presence of extra chromosome 21, causing intellectual disability and characteristic features",
    primaryOrgan: "brain",
    affectedOrgans: ["brain", "heart", "thyroid", "blood", "gi_tract"],
    pathophysiology: {
      mechanism: "Extra chromosome 21 → gene dosage imbalance → developmental abnormalities affecting multiple organ systems",
      molecularBasis: "Trisomy 21 (95%), Robertsonian translocation (4%), or mosaicism (1%); overexpression of genes on chr21"
    },
    clinicalPresentation: {
      symptoms: [
        "Developmental delay",
        "Intellectual disability (mild to moderate)",
        "Hypotonia in infancy",
        "Congenital heart defect symptoms",
        "Feeding difficulties in infancy"
      ],
      signs: [
        "Characteristic facies (flat face, upslanting palpebral fissures)",
        "Epicanthal folds",
        "Small ears",
        "Single palmar crease",
        "Brushfield spots (iris)",
        "Short stature",
        "Hypotonia",
        "Sandal gap (toes)"
      ]
    },
    laboratoryFindings: [
      { name: "Karyotype", normalRange: "46,XX or 46,XY", abnormalInDisease: "47,XX+21 or 47,XY+21" },
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Elevated (40% have hypothyroidism)" },
      { name: "CBC", normalRange: "Normal", abnormalInDisease: "May show transient abnormal myelopoiesis in neonates" }
    ],
    imagingFindings: {
      prenatalUltrasound: ["Increased nuchal translucency", "Short femur/humerus", "Absent nasal bone"],
      echocardiogram: ["Atrioventricular septal defect (AVSD)", "VSD", "ASD", "PDA"],
      other: ["Duodenal atresia (double bubble sign)"]
    },
    severity: {
      mild: { description: "Mild ID, no major cardiac defects" },
      moderate: { description: "Moderate ID, repaired cardiac defects" },
      severe: { description: "Severe ID, complex cardiac disease, leukemia" }
    },
    modifications: {
      brain: {
        geometry: {
          brain_volume: { factor: 0.85, note: "Reduced brain volume" },
          cortical_thickness: { factor: 0.9, note: "Reduced cortical thickness" }
        },
        physiology: {
          glucose_consumption: { factor: 0.85, note: "Reduced metabolism" }
        }
      },
      heart: {
        geometry: {
          ivs_thickness: { factor: 0.8, note: "AVSD/septal defects common (40%)" }
        }
      },
      thyroid: {
        physiology: {
          tsh: { factor: 2.0, note: "Hypothyroidism in 40%" },
          free_t4: { factor: 0.8, note: "May be low" }
        }
      },
      blood: {
        geometry: {
          wbc_count: { factor: 1.2, note: "May have transient leukemoid reaction" }
        }
      },
      gi_tract: {
        physiology: {
          gastric_emptying: { factor: 1.2, note: "GI abnormalities including duodenal atresia" }
        }
      }
    }
  },

  Q96_9: {
    name: "Turner Syndrome (45,X)",
    icd10: "Q96.9",
    category: "congenital",
    definition: "Chromosomal disorder in females with complete or partial absence of one X chromosome",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "kidneys", "thyroid", "blood"],
    pathophysiology: {
      mechanism: "Monosomy X or X chromosome abnormality → haploinsufficiency of genes → characteristic phenotype",
      molecularBasis: "45,X (50%), mosaicism (30%), structural X abnormalities (20%); SHOX gene haploinsufficiency causes short stature"
    },
    clinicalPresentation: {
      symptoms: [
        "Short stature",
        "Primary amenorrhea",
        "Infertility",
        "Learning difficulties (spatial)",
        "Lymphedema in infancy"
      ],
      signs: [
        "Short stature",
        "Webbed neck (pterygium colli)",
        "Low posterior hairline",
        "Shield chest with widely spaced nipples",
        "Cubitus valgus",
        "Lymphedema (hands, feet)",
        "Streak gonads",
        "Coarctation of aorta"
      ]
    },
    laboratoryFindings: [
      { name: "Karyotype", normalRange: "46,XX", abnormalInDisease: "45,X or variants" },
      { name: "FSH", normalRange: "Premenopausal levels", abnormalInDisease: "Elevated (hypergonadotropic hypogonadism)" },
      { name: "LH", normalRange: "Normal", abnormalInDisease: "Elevated" },
      { name: "Estradiol", normalRange: "Normal female levels", abnormalInDisease: "Low (gonadal dysgenesis)" },
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "May be elevated (autoimmune thyroiditis)" }
    ],
    imagingFindings: {
      echocardiogram: ["Bicuspid aortic valve (30%)", "Coarctation of aorta (10%)", "Aortic root dilation"],
      renalUltrasound: ["Horseshoe kidney (10%)", "Duplicated collecting system"],
      mriHeart: ["Aortic coarctation", "Aortic root monitoring"]
    },
    severity: {
      mild: { description: "Short stature only, mosaic forms" },
      moderate: { description: "Typical features, managed hormone replacement" },
      severe: { description: "Complex cardiac disease, aortic dissection risk" }
    },
    modifications: {
      heart: {
        geometry: {
          aortic_root: { factor: 1.3, note: "Aortic root dilation" }
        },
        pressures: {
          aortic_gradient: { factor: 3.0, note: "Coarctation if present" }
        }
      },
      kidneys: {
        geometry: {
          kidney_length: { factor: 0.9, note: "May have horseshoe kidney" }
        }
      },
      thyroid: {
        physiology: {
          tsh: { factor: 1.5, note: "Increased risk of autoimmune thyroiditis" },
          tpo_antibody: { factor: 3.0, note: "Often positive" }
        }
      },
      blood: {
        physiology: {
          hemoglobin: { factor: 0.95, note: "Usually normal but monitor" }
        }
      }
    }
  },

  Q98_4: {
    name: "Klinefelter Syndrome (47,XXY)",
    icd10: "Q98.4",
    category: "congenital",
    definition: "Chromosomal disorder in males with extra X chromosome causing hypogonadism",
    primaryOrgan: "prostate",
    affectedOrgans: ["prostate", "bonemarrow", "brain", "breast"],
    pathophysiology: {
      mechanism: "47,XXY → primary testicular failure → low testosterone → characteristic phenotype",
      molecularBasis: "Extra X chromosome causes testicular dysgenesis; often undiagnosed until infertility workup"
    },
    clinicalPresentation: {
      symptoms: [
        "Often undiagnosed until adulthood",
        "Infertility",
        "Learning difficulties",
        "Low libido",
        "Fatigue",
        "Gynecomastia"
      ],
      signs: [
        "Tall stature with long limbs",
        "Small, firm testes",
        "Gynecomastia",
        "Sparse facial/body hair",
        "Female pattern pubic hair",
        "Decreased muscle mass"
      ]
    },
    laboratoryFindings: [
      { name: "Karyotype", normalRange: "46,XY", abnormalInDisease: "47,XXY" },
      { name: "Testosterone", normalRange: "300-1000 ng/dL", abnormalInDisease: "Low" },
      { name: "FSH", normalRange: "1-12 mIU/mL", abnormalInDisease: "Elevated" },
      { name: "LH", normalRange: "1-9 mIU/mL", abnormalInDisease: "Elevated" },
      { name: "Semen analysis", normalRange: "Normal", abnormalInDisease: "Azoospermia" }
    ],
    imagingFindings: {
      testicular_ultrasound: ["Small testes (usually <6 mL)"],
      dxa: ["Osteoporosis screening (low testosterone)"]
    },
    severity: {
      mild: { description: "Tall stature, mild symptoms, fertile variants" },
      moderate: { description: "Classic phenotype, infertility, on testosterone" },
      severe: { description: "Significant learning disabilities, metabolic syndrome" }
    },
    modifications: {
      prostate: {
        physiology: {
          psa: { factor: 0.7, note: "Low due to low testosterone" }
        }
      },
      breast: {
        geometry: {
          lesion_size: { factor: 0.5, note: "Risk of gynecomastia and breast cancer" }
        }
      },
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 1.0, note: "Usually normal" }
        }
      },
      brain: {
        physiology: {
          glucose_consumption: { factor: 0.95, note: "Mild cognitive effects" }
        }
      }
    }
  },

  // =====================
  // CONNECTIVE TISSUE DISORDERS
  // ICD-10: Q87 Series
  // =====================

  Q87_4: {
    name: "Marfan Syndrome",
    icd10: "Q87.4",
    category: "congenital",
    definition: "Autosomal dominant connective tissue disorder affecting cardiovascular, skeletal, and ocular systems",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "lungs", "brain"],
    pathophysiology: {
      mechanism: "FBN1 mutations → abnormal fibrillin-1 → dysregulated TGF-β → connective tissue weakness",
      molecularBasis: "FBN1 gene mutations (>1000 known); dominant negative or haploinsufficiency mechanism"
    },
    clinicalPresentation: {
      symptoms: [
        "Tall stature",
        "Joint hypermobility",
        "Visual problems",
        "Chest pain (aortic root disease)",
        "Dyspnea (pneumothorax)",
        "Back pain (dural ectasia)"
      ],
      signs: [
        "Tall, thin habitus with arm span > height",
        "Arachnodactyly (long fingers)",
        "Pectus excavatum or carinatum",
        "Scoliosis",
        "High arched palate",
        "Ectopia lentis (lens dislocation)",
        "Aortic root dilation",
        "MVP with regurgitation"
      ]
    },
    laboratoryFindings: [
      { name: "FBN1 genetic testing", normalRange: "Normal", abnormalInDisease: "Pathogenic variant" },
      { name: "Routine labs", normalRange: "Normal", abnormalInDisease: "Usually normal" }
    ],
    imagingFindings: {
      echocardiogram: ["Aortic root dilation (z-score ≥2)", "Mitral valve prolapse", "Mitral/aortic regurgitation"],
      ctMri_Aorta: ["Aortic root aneurysm", "Dissection monitoring"],
      ophthalmologic: ["Ectopia lentis (superior-temporal)", "Myopia", "Retinal detachment risk"],
      spine: ["Dural ectasia on MRI"]
    },
    severity: {
      mild: { description: "Skeletal features only, no aortic dilation" },
      moderate: { description: "Aortic root dilation <50mm, medical management" },
      severe: { description: "Aortic root >50mm or dissection, requiring surgery" }
    },
    modifications: {
      heart: {
        geometry: {
          aortic_root: { factor: 1.6, note: "Aortic root dilation (diagnostic criterion)" },
          la_volume: { factor: 1.2, note: "May have mitral regurgitation" }
        },
        pressures: {
          aortic_gradient: { factor: 1.3, note: "May have aortic regurgitation" }
        }
      },
      lungs: {
        physiology: {
          fev1: { factor: 0.9, note: "Spontaneous pneumothorax risk" }
        }
      },
      brain: {
        pressures: {
          csf_pressure: { factor: 1.1, note: "Dural ectasia may cause headaches" }
        }
      }
    }
  },

  Q79_6: {
    name: "Ehlers-Danlos Syndrome, Hypermobile Type",
    icd10: "Q79.6",
    category: "congenital",
    definition: "Heritable connective tissue disorder characterized by joint hypermobility and skin hyperextensibility",
    primaryOrgan: "lymphatic",
    affectedOrgans: ["lymphatic", "heart", "gi_tract"],
    pathophysiology: {
      mechanism: "Defects in collagen or related proteins → joint laxity + skin fragility + vascular fragility (vascular type)",
      molecularBasis: "Genetically heterogeneous; vascular type: COL3A1 mutations; most hypermobile EDS unknown gene"
    },
    clinicalPresentation: {
      symptoms: [
        "Joint hypermobility with recurrent dislocations",
        "Chronic joint pain",
        "Easy bruising",
        "Fatigue",
        "POTS symptoms (orthostatic intolerance)"
      ],
      signs: [
        "Beighton score ≥5/9",
        "Soft, velvety skin",
        "Skin hyperextensibility",
        "Atrophic scarring",
        "Joint hypermobility",
        "Mitral valve prolapse"
      ]
    },
    laboratoryFindings: [
      { name: "Genetic testing", normalRange: "Normal", abnormalInDisease: "Pathogenic variants in collagen genes (vascular type)" },
      { name: "Routine labs", normalRange: "Normal", abnormalInDisease: "Usually normal" }
    ],
    imagingFindings: {
      echocardiogram: ["Mitral valve prolapse", "Aortic root dilation (vascular type)"],
      other: ["Joint imaging for dislocations"]
    },
    severity: {
      mild: { description: "Joint hypermobility, minimal symptoms" },
      moderate: { description: "Recurrent dislocations, chronic pain" },
      severe: { description: "Vascular type with arterial rupture/dissection risk" }
    },
    modifications: {
      heart: {
        geometry: {
          aortic_root: { factor: 1.2, note: "May have mild dilation" }
        },
        pressures: {
          mitral_gradient: { factor: 0.8, note: "MVP common" }
        }
      },
      gi_tract: {
        physiology: {
          colonic_transit: { factor: 0.7, note: "GI dysmotility" }
        }
      },
      lymphatic: {
        physiology: {
          cd4_cd8_ratio: { factor: 1.0, note: "Normal immune function" }
        }
      }
    }
  },

  // =====================
  // COAGULOPATHIES (HEREDITARY)
  // ICD-10: D66-D68 Series
  // =====================

  D66: {
    name: "Hemophilia A (Factor VIII Deficiency)",
    icd10: "D66",
    category: "hematological",
    definition: "X-linked recessive bleeding disorder due to factor VIII deficiency",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "bonemarrow"],
    pathophysiology: {
      mechanism: "Factor VIII deficiency → impaired intrinsic coagulation pathway → prolonged bleeding",
      molecularBasis: "F8 gene mutations on X chromosome; intron 22 inversion most common severe mutation"
    },
    clinicalPresentation: {
      symptoms: [
        "Easy bruising",
        "Prolonged bleeding after injury/surgery",
        "Hemarthrosis (joint bleeding)",
        "Deep muscle hematomas",
        "Intracranial hemorrhage (rare)"
      ],
      signs: [
        "Joint swelling (target joints)",
        "Muscle hematomas",
        "Hemarthrosis",
        "Chronic arthropathy (if recurrent)"
      ]
    },
    laboratoryFindings: [
      { name: "PTT", normalRange: "25-35 sec", abnormalInDisease: "Prolonged" },
      { name: "PT/INR", normalRange: "11-14 sec / 0.9-1.1", abnormalInDisease: "Normal" },
      { name: "Factor VIII activity", normalRange: "50-150%", abnormalInDisease: "Low (<1% severe, 1-5% moderate, 5-40% mild)" },
      { name: "Platelet count", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Normal" },
      { name: "Bleeding time", normalRange: "2-9 min", abnormalInDisease: "Normal" }
    ],
    imagingFindings: {
      jointImaging: ["Hemarthrosis", "Chronic arthropathy changes"],
      mri: ["Joint damage assessment", "Muscle hematomas"]
    },
    severity: {
      mild: { description: "Factor VIII 5-40%, bleeding with trauma/surgery" },
      moderate: { description: "Factor VIII 1-5%, occasional spontaneous bleeds" },
      severe: { description: "Factor VIII <1%, spontaneous bleeding, joint disease" }
    },
    modifications: {
      blood: {
        pressures: {
          ptt: { factor: 2.5, note: "Prolonged PTT" },
          pt: { factor: 1.0, note: "Normal PT (extrinsic pathway intact)" },
          inr: { factor: 1.0, note: "Normal INR" }
        }
      },
      bonemarrow: {
        geometry: {
          marrow_cellularity: { factor: 1.0, note: "Normal marrow" }
        }
      }
    }
  },

  D68_0: {
    name: "von Willebrand Disease",
    icd10: "D68.0",
    category: "hematological",
    definition: "Most common inherited bleeding disorder due to deficiency or dysfunction of von Willebrand factor",
    primaryOrgan: "blood",
    affectedOrgans: ["blood"],
    pathophysiology: {
      mechanism: "vWF deficiency/dysfunction → impaired platelet adhesion + reduced factor VIII → mucocutaneous bleeding",
      molecularBasis: "VWF gene mutations; Type 1 (quantitative), Type 2 (qualitative), Type 3 (severe quantitative)"
    },
    clinicalPresentation: {
      symptoms: [
        "Mucocutaneous bleeding",
        "Epistaxis",
        "Menorrhagia",
        "Easy bruising",
        "Prolonged bleeding after dental work",
        "GI bleeding (Type 2B with angiodysplasia)"
      ],
      signs: [
        "Petechiae",
        "Ecchymoses",
        "Mucosal bleeding"
      ]
    },
    laboratoryFindings: [
      { name: "vWF antigen", normalRange: "50-150%", abnormalInDisease: "Low (Type 1, 3) or variable (Type 2)" },
      { name: "vWF activity (ristocetin cofactor)", normalRange: "50-150%", abnormalInDisease: "Low" },
      { name: "Factor VIII", normalRange: "50-150%", abnormalInDisease: "Low (vWF stabilizes FVIII)" },
      { name: "PTT", normalRange: "25-35 sec", abnormalInDisease: "May be prolonged" },
      { name: "Bleeding time", normalRange: "2-9 min", abnormalInDisease: "Prolonged" },
      { name: "PFA-100", normalRange: "Normal closure time", abnormalInDisease: "Prolonged" }
    ],
    imagingFindings: {
      not_typically_diagnostic: ["Clinical and laboratory diagnosis"]
    },
    severity: {
      mild: { description: "Type 1 mild, vWF 30-50%, mucocutaneous bleeding" },
      moderate: { description: "Type 1 moderate or Type 2, vWF <30%" },
      severe: { description: "Type 3, vWF <5%, hemophilia-like bleeding" }
    },
    modifications: {
      blood: {
        pressures: {
          ptt: { factor: 1.4, note: "May be prolonged" },
          bleeding_time: { factor: 2.0, note: "Prolonged" }
        }
      }
    }
  },

  // =====================
  // METABOLIC GENETIC DISORDERS
  // ICD-10: E70-E88 Series
  // =====================

  E80_2: {
    name: "Hereditary Hemochromatosis",
    icd10: "E80.2",
    category: "metabolic",
    definition: "Autosomal recessive iron overload disorder causing multi-organ damage",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "heart", "pancreas", "blood"],
    pathophysiology: {
      mechanism: "HFE mutations → low hepcidin → increased intestinal iron absorption → tissue iron deposition",
      molecularBasis: "HFE gene mutations (C282Y, H63D); iron deposits in liver, heart, pancreas, skin, joints"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Joint pain (especially 2nd/3rd MCP)",
        "Abdominal pain",
        "Loss of libido",
        "Symptoms of diabetes",
        "Symptoms of heart failure"
      ],
      signs: [
        "Bronze skin pigmentation",
        "Hepatomegaly → cirrhosis",
        "Arthritis (chondrocalcinosis)",
        "Hypogonadism",
        "Cardiomyopathy signs"
      ]
    },
    laboratoryFindings: [
      { name: "Serum iron", normalRange: "60-170 μg/dL", abnormalInDisease: "Elevated" },
      { name: "Transferrin saturation", normalRange: "20-50%", abnormalInDisease: ">45% (screening), >60% diagnostic" },
      { name: "Ferritin", normalRange: "20-300 ng/mL", abnormalInDisease: "Elevated (>300 men, >200 women)" },
      { name: "HFE genotype", normalRange: "Wild type", abnormalInDisease: "C282Y homozygous or compound heterozygous" },
      { name: "Liver enzymes", normalRange: "Normal", abnormalInDisease: "Elevated (liver involvement)" },
      { name: "Glucose", normalRange: "70-100 mg/dL", abnormalInDisease: "Elevated (bronze diabetes)" }
    ],
    imagingFindings: {
      mriLiver: ["Iron quantification", "Low T2 signal from iron"],
      liverBiopsy: ["Iron staining", "Hepatic iron index"]
    },
    severity: {
      mild: { description: "Elevated ferritin, no organ damage" },
      moderate: { description: "Early organ involvement, reversible with phlebotomy" },
      severe: { description: "Cirrhosis, cardiomyopathy, diabetes" }
    },
    modifications: {
      liver: {
        physiology: {
          alt: { factor: 2.0, note: "Liver inflammation" },
          ast: { factor: 2.0, note: "Liver inflammation" }
        },
        structure: {
          collagen_content: { factor: 2.0, note: "Fibrosis progressing to cirrhosis" }
        }
      },
      blood: {
        structure: {
          serum_iron: { factor: 2.0, note: "Elevated" },
          ferritin: { factor: 5.0, note: "Markedly elevated" },
          transferrin_sat: { factor: 2.0, note: ">60%" }
        }
      },
      pancreas: {
        physiology: {
          fasting_glucose: { factor: 1.4, note: "Bronze diabetes" },
          hba1c: { factor: 1.3, note: "Diabetes from iron deposition" }
        }
      },
      heart: {
        physiology: {
          cardiac_output: { factor: 0.85, note: "Cardiomyopathy if severe" }
        }
      }
    }
  },

  Q85_0: {
    name: "Neurofibromatosis Type 1 (NF1)",
    icd10: "Q85.0",
    category: "congenital",
    definition: "Autosomal dominant neurocutaneous disorder causing café-au-lait spots, neurofibromas, and increased cancer risk",
    primaryOrgan: "brain",
    affectedOrgans: ["brain", "blood"],
    pathophysiology: {
      mechanism: "NF1 tumor suppressor gene mutations → loss of neurofibromin → uncontrolled Ras signaling → tumor formation",
      molecularBasis: "NF1 gene mutations on chromosome 17; neurofibromin is a RAS-GAP tumor suppressor"
    },
    clinicalPresentation: {
      symptoms: [
        "Café-au-lait spots (present from birth)",
        "Skin neurofibromas developing in puberty",
        "Learning disabilities",
        "Bone pain (dysplasia)",
        "Vision problems (optic glioma)"
      ],
      signs: [
        "≥6 café-au-lait macules >5mm (prepubertal) or >15mm (postpubertal)",
        "Axillary/inguinal freckling",
        "Cutaneous neurofibromas",
        "Plexiform neurofibromas",
        "Lisch nodules (iris hamartomas)",
        "Optic glioma",
        "Sphenoid dysplasia",
        "Tibial pseudarthrosis"
      ]
    },
    laboratoryFindings: [
      { name: "NF1 genetic testing", normalRange: "Normal", abnormalInDisease: "Pathogenic NF1 variant" },
      { name: "Routine labs", normalRange: "Normal", abnormalInDisease: "Usually normal" }
    ],
    imagingFindings: {
      mri_Brain: ["Optic pathway gliomas", "T2 bright spots (UBOs)", "Plexiform neurofibromas"],
      ophthalmologic: ["Lisch nodules on slit lamp"],
      skeletal: ["Scoliosis", "Long bone dysplasia"]
    },
    severity: {
      mild: { description: "Skin manifestations only" },
      moderate: { description: "Learning disabilities, benign tumors" },
      severe: { description: "Malignant transformation, optic glioma affecting vision" }
    },
    modifications: {
      brain: {
        structure: {
          neuron_density: { factor: 1.0, note: "Usually normal cognition" }
        },
        physiology: {
          cbf: { factor: 1.0, note: "Normal unless tumor" }
        }
      },
      blood: {
        geometry: {
          wbc_count: { factor: 1.0, note: "Normal unless malignancy" }
        }
      }
    }
  }
};

export default CONGENITAL_DISEASES;
