// ============================================================
// GASTROINTESTINAL DISEASES DATABASE
// GI tract, liver, and pancreatic disorders
// ICD-10: K00-K95 (Diseases of the digestive system)
// ============================================================

export const GASTROINTESTINAL_DISEASES = {
  // =====================
  // INFLAMMATORY BOWEL DISEASE - CROHN'S
  // ICD-10: K50 Series
  // =====================

  K50_9: {
    name: "Crohn's Disease",
    icd10: "K50.9",
    category: "gastrointestinal",
    definition: "Chronic transmural inflammatory disease affecting any part of GI tract, skip lesions, granulomas",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "blood", "liver"],
    pathophysiology: {
      mechanism: "Dysregulated immune response to gut microbiome → transmural inflammation → strictures, fistulas, abscesses",
      molecularBasis: "Th1/Th17 cytokines (TNF-α, IL-12, IL-23); NOD2/CARD15 mutations; barrier dysfunction"
    },
    clinicalPresentation: {
      symptoms: [
        "Chronic diarrhea",
        "Abdominal pain (often RLQ)",
        "Weight loss",
        "Fatigue",
        "Perianal disease (fistulas, abscesses)",
        "Nausea/vomiting (if obstruction)"
      ],
      signs: [
        "RLQ tenderness or mass",
        "Perianal fistulas/tags",
        "Aphthous ulcers",
        "Extraintestinal: arthritis, uveitis, erythema nodosum, pyoderma gangrenosum"
      ]
    },
    laboratoryFindings: [
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Elevated (active inflammation)" },
      { name: "ESR", normalRange: "<20 mm/hr", abnormalInDisease: "Elevated" },
      { name: "Fecal calprotectin", normalRange: "<50 μg/g", abnormalInDisease: ">250 suggests active disease" },
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low (anemia of chronic disease, iron deficiency)" },
      { name: "Albumin", normalRange: "3.5-5 g/dL", abnormalInDisease: "Low (malnutrition, protein-losing)" },
      { name: "B12", normalRange: "200-900 pg/mL", abnormalInDisease: "Low if terminal ileum involved" }
    ],
    imagingFindings: {
      colonoscopy: ["Skip lesions", "Cobblestone mucosa", "Deep linear ulcers", "Strictures", "Granulomas on biopsy (30%)"],
      mre: ["Wall thickening", "Enhancement", "Strictures", "Fistulas", "Abscesses", "Creeping fat"],
      ct: ["Bowel wall thickening", "Mesenteric fat stranding", "Abscess"]
    },
    severity: {
      mild: { description: "CDAI <220, ambulatory, tolerating oral intake" },
      moderate: { description: "CDAI 220-450, no obstruction/abscess" },
      severe: { description: "CDAI >450, or obstruction, abscess, fistula" }
    },
    modifications: {
      gi_tract: {
        physiology: {
          small_bowel_transit: { factor: 0.6, note: "Altered transit" },
          colonic_transit: { factor: 0.7, note: "Diarrhea" }
        },
        structure: {
          calprotectin: { factor: 10.0, note: "Markedly elevated" },
          cea: { factor: 1.0, note: "Usually normal" }
        }
      },
      blood: {
        physiology: {
          hemoglobin: { factor: 0.8, note: "Anemia" },
          esr: { factor: 3.0, note: "Elevated" }
        },
        structure: {
          vitamin_b12: { factor: 0.6, note: "Malabsorption if ileal disease" }
        }
      },
      liver: {
        physiology: {
          albumin: { factor: 0.8, note: "Reduced from malnutrition" }
        }
      }
    }
  },

  // =====================
  // ULCERATIVE COLITIS
  // ICD-10: K51 Series
  // =====================

  K51_9: {
    name: "Ulcerative Colitis",
    icd10: "K51.9",
    category: "gastrointestinal",
    definition: "Chronic mucosal inflammation limited to colon, continuous from rectum proximally",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "blood", "liver"],
    pathophysiology: {
      mechanism: "Mucosal/submucosal inflammation → crypt abscesses → ulceration → bloody diarrhea",
      molecularBasis: "Th2/NKT cell response; IL-13, IL-5; epithelial barrier defect"
    },
    clinicalPresentation: {
      symptoms: [
        "Bloody diarrhea",
        "Urgency and tenesmus",
        "Mucus in stool",
        "Abdominal cramping (LLQ)",
        "Fecal incontinence"
      ],
      signs: [
        "LLQ tenderness",
        "Rectal bleeding on exam",
        "Extraintestinal manifestations similar to Crohn's",
        "Primary sclerosing cholangitis (3-5%)"
      ]
    },
    laboratoryFindings: [
      { name: "Fecal calprotectin", normalRange: "<50 μg/g", abnormalInDisease: "Elevated" },
      { name: "CRP/ESR", normalRange: "Normal", abnormalInDisease: "Elevated in active disease" },
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low (blood loss)" },
      { name: "p-ANCA", normalRange: "Negative", abnormalInDisease: "Positive in 60-70% (vs ASCA in Crohn's)" },
      { name: "Stool studies", normalRange: "Negative", abnormalInDisease: "Rule out C. diff and infection" }
    ],
    imagingFindings: {
      colonoscopy: ["Continuous inflammation from rectum", "Loss of vascular pattern", "Friability", "Pseudopolyps", "Lead-pipe colon (chronic)"],
      ct: ["Wall thickening", "Loss of haustration", "Toxic megacolon if severe"]
    },
    severity: {
      mild: { description: "Truelove-Witts: <4 stools/day, minimal blood" },
      moderate: { description: "4-6 stools/day, some systemic symptoms" },
      severe: { description: ">6 bloody stools/day, fever, tachycardia, anemia" }
    },
    modifications: {
      gi_tract: {
        physiology: {
          colonic_transit: { factor: 0.4, note: "Rapid transit, diarrhea" },
          stool_frequency: { factor: 6.0, note: ">6 stools/day in severe" }
        },
        structure: {
          calprotectin: { factor: 8.0, note: "Elevated" }
        }
      },
      blood: {
        physiology: {
          hemoglobin: { factor: 0.75, note: "Anemia from blood loss" },
          esr: { factor: 2.5, note: "Elevated" }
        }
      }
    }
  },

  // =====================
  // ACUTE PANCREATITIS
  // ICD-10: K85 Series
  // =====================

  K85_9: {
    name: "Acute Pancreatitis",
    icd10: "K85.9",
    category: "gastrointestinal",
    definition: "Acute inflammatory process of pancreas with variable involvement of peripancreatic tissues",
    primaryOrgan: "pancreas",
    affectedOrgans: ["pancreas", "kidneys", "lungs", "blood"],
    pathophysiology: {
      mechanism: "Premature trypsinogen activation → autodigestion → local inflammation → SIRS → organ failure",
      molecularBasis: "Causes: Gallstones (40%), Alcohol (40%), other (hypertriglyceridemia, drugs, ERCP, idiopathic)"
    },
    clinicalPresentation: {
      symptoms: [
        "Severe epigastric pain radiating to back",
        "Nausea and vomiting",
        "Pain worse with eating",
        "Anorexia"
      ],
      signs: [
        "Epigastric tenderness",
        "Guarding",
        "Decreased bowel sounds (ileus)",
        "Fever",
        "Tachycardia",
        "Cullen sign (periumbilical ecchymosis) - severe",
        "Grey Turner sign (flank ecchymosis) - severe"
      ]
    },
    laboratoryFindings: [
      { name: "Lipase", normalRange: "<60 U/L", abnormalInDisease: ">3x ULN (diagnostic)" },
      { name: "Amylase", normalRange: "<100 U/L", abnormalInDisease: ">3x ULN (less specific)" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Elevated" },
      { name: "Hematocrit", normalRange: "36-48%", abnormalInDisease: "Elevated (hemoconcentration) or low if hemorrhagic" },
      { name: "BUN", normalRange: "7-20 mg/dL", abnormalInDisease: "Elevated (dehydration/AKI)" },
      { name: "Calcium", normalRange: "8.5-10.5 mg/dL", abnormalInDisease: "Low (saponification, poor prognosis)" },
      { name: "Triglycerides", normalRange: "<150 mg/dL", abnormalInDisease: ">1000 if hypertriglyceridemic pancreatitis" },
      { name: "LFTs", normalRange: "Normal", abnormalInDisease: "Elevated ALT suggests gallstone etiology" }
    ],
    imagingFindings: {
      ct: ["Pancreatic enlargement", "Peripancreatic fat stranding", "Necrosis (non-enhancement)", "Fluid collections", "Pseudocyst"],
      ultrasound: ["Gallstones (if biliary)", "Dilated CBD"],
      mrcp: ["Choledocholithiasis", "Pancreatic duct abnormalities"]
    },
    severity: {
      mild: { description: "No organ failure, no local complications" },
      moderate: { description: "Transient organ failure (<48h) or local complications" },
      severe: { description: "Persistent organ failure (>48h), mortality 30-50%" }
    },
    modifications: {
      pancreas: {
        physiology: {
          amylase_secretion: { factor: 5.0, note: "Markedly elevated" },
          lipase_secretion: { factor: 5.0, note: "Markedly elevated" }
        },
        geometry: {
          pancreas_volume: { factor: 1.5, note: "Edematous enlargement" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.7, note: "AKI from hypovolemia/SIRS" },
          bun: { factor: 1.8, note: "Elevated" }
        }
      },
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.92, note: "ARDS risk" }
        }
      },
      blood: {
        geometry: {
          wbc_count: { factor: 1.6, note: "Leukocytosis" },
          hematocrit: { factor: 1.15, note: "Hemoconcentration" }
        }
      }
    }
  },

  // =====================
  // CIRRHOSIS
  // ICD-10: K74 Series
  // =====================

  K74_6: {
    name: "Cirrhosis",
    icd10: "K74.6",
    category: "gastrointestinal",
    definition: "End-stage liver disease with diffuse fibrosis, regenerative nodules, and portal hypertension",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "spleen", "kidneys", "brain", "blood"],
    pathophysiology: {
      mechanism: "Chronic liver injury → stellate cell activation → collagen deposition → fibrosis → nodular regeneration → portal hypertension",
      molecularBasis: "Causes: Alcohol, NAFLD/NASH, Viral hepatitis (HCV, HBV), autoimmune, genetic (hemochromatosis, Wilson's)"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Anorexia",
        "Weight loss",
        "Abdominal distension (ascites)",
        "Easy bruising/bleeding",
        "Confusion (hepatic encephalopathy)",
        "Pruritus"
      ],
      signs: [
        "Jaundice",
        "Ascites",
        "Spider angiomata",
        "Palmar erythema",
        "Gynecomastia",
        "Caput medusae",
        "Splenomegaly",
        "Asterixis (hepatic encephalopathy)",
        "Muscle wasting"
      ]
    },
    laboratoryFindings: [
      { name: "Albumin", normalRange: "3.5-5 g/dL", abnormalInDisease: "Low (<3.5, often <2.5 in advanced)" },
      { name: "Bilirubin", normalRange: "<1.2 mg/dL", abnormalInDisease: "Elevated" },
      { name: "INR", normalRange: "0.9-1.1", abnormalInDisease: "Elevated (synthetic dysfunction)" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Low (splenic sequestration)" },
      { name: "AST/ALT", normalRange: "<40 U/L", abnormalInDisease: "Variable, often AST>ALT in alcohol" },
      { name: "Sodium", normalRange: "136-145 mEq/L", abnormalInDisease: "Low (dilutional hyponatremia)" },
      { name: "Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "Elevated if hepatorenal syndrome" }
    ],
    imagingFindings: {
      ultrasound: ["Nodular liver surface", "Coarse echotexture", "Ascites", "Splenomegaly", "Patent portal vein (exclude thrombosis)"],
      ct: ["Nodular liver", "Varices", "Ascites", "Splenomegaly", "Screen for HCC"],
      fibroscan: ["Liver stiffness >12.5 kPa suggests cirrhosis"]
    },
    severity: {
      mild: { description: "Child-Pugh A (5-6 points), compensated" },
      moderate: { description: "Child-Pugh B (7-9 points), some decompensation" },
      severe: { description: "Child-Pugh C (10-15 points), decompensated, MELD >20" }
    },
    modifications: {
      liver: {
        geometry: {
          liver_volume: { factor: 0.8, note: "Shrunken liver" }
        },
        physiology: {
          albumin: { factor: 0.6, note: "Reduced synthesis" },
          alt: { factor: 1.5, note: "Variable elevation" },
          ast: { factor: 2.0, note: "Often AST > ALT" },
          bilirubin: { factor: 3.0, note: "Elevated" }
        },
        structure: {
          collagen_content: { factor: 4.0, note: "Extensive fibrosis" }
        }
      },
      spleen: {
        geometry: {
          spleen_volume: { factor: 2.0, note: "Splenomegaly from portal hypertension" }
        },
        physiology: {
          platelet_sequestration: { factor: 2.5, note: "Increased sequestration" }
        }
      },
      blood: {
        geometry: {
          platelet_count: { factor: 0.5, note: "Thrombocytopenia" }
        },
        pressures: {
          inr: { factor: 1.8, note: "Prolonged from reduced clotting factors" },
          pt: { factor: 1.5, note: "Prolonged" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.7, note: "Hepatorenal syndrome risk" }
        }
      },
      brain: {
        physiology: {
          glucose_consumption: { factor: 0.9, note: "Hepatic encephalopathy" }
        }
      }
    }
  },

  // =====================
  // GERD
  // ICD-10: K21 Series
  // =====================

  K21_0: {
    name: "Gastroesophageal Reflux Disease (GERD)",
    icd10: "K21.0",
    category: "gastrointestinal",
    definition: "Symptoms or mucosal damage from retrograde flow of gastric contents into esophagus",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "lungs"],
    pathophysiology: {
      mechanism: "Transient LES relaxations + impaired esophageal clearance → acid injury to esophageal mucosa",
      molecularBasis: "LES dysfunction, hiatal hernia, delayed gastric emptying, obesity"
    },
    clinicalPresentation: {
      symptoms: [
        "Heartburn (pyrosis)",
        "Regurgitation",
        "Dysphagia",
        "Chest pain",
        "Chronic cough",
        "Hoarseness",
        "Globus sensation"
      ],
      signs: [
        "Usually no physical findings",
        "Dental erosions (chronic)",
        "Laryngeal erythema (LPR)"
      ]
    },
    laboratoryFindings: [
      { name: "No specific labs", normalRange: "N/A", abnormalInDisease: "Diagnosis is clinical + endoscopic" }
    ],
    imagingFindings: {
      egd: ["Esophagitis (LA Classification A-D)", "Barrett's esophagus", "Stricture", "Normal in NERD"],
      phImpedance: ["Acid exposure time >4% abnormal", "Symptom correlation"],
      barium: ["Hiatal hernia", "Reflux"]
    },
    severity: {
      mild: { description: "Occasional symptoms, LA Grade A or NERD" },
      moderate: { description: "Frequent symptoms, LA Grade B-C" },
      severe: { description: "Daily symptoms, LA Grade D, Barrett's, stricture" }
    },
    modifications: {
      gi_tract: {
        physiology: {
          gastric_ph: { factor: 0.7, note: "Not directly abnormal, but refluxes" }
        }
      },
      lungs: {
        physiology: {
          fev1: { factor: 0.95, note: "Microaspiration may worsen asthma" }
        }
      }
    }
  },

  // =====================
  // PEPTIC ULCER DISEASE
  // ICD-10: K27 Series
  // =====================

  K27_9: {
    name: "Peptic Ulcer Disease",
    icd10: "K27.9",
    category: "gastrointestinal",
    definition: "Mucosal defect extending through muscularis mucosae in stomach or duodenum",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "blood"],
    pathophysiology: {
      mechanism: "Imbalance between aggressive factors (acid, pepsin, H. pylori, NSAIDs) and protective factors (mucus, bicarbonate, blood flow)",
      molecularBasis: "H. pylori (60-70% DU, 30-40% GU), NSAIDs, hypersecretory states (Zollinger-Ellison)"
    },
    clinicalPresentation: {
      symptoms: [
        "Epigastric pain/burning",
        "DU: pain 2-3h after meals, relieved by food",
        "GU: pain with eating",
        "Nausea",
        "Early satiety",
        "Hematemesis/melena (if bleeding)"
      ],
      signs: [
        "Epigastric tenderness",
        "Succussion splash (gastric outlet obstruction)",
        "Pallor (if anemia/bleeding)",
        "Peritonitis signs (if perforation)"
      ]
    },
    laboratoryFindings: [
      { name: "H. pylori testing", normalRange: "Negative", abnormalInDisease: "Positive (stool antigen, urea breath test, serology, biopsy)" },
      { name: "Hemoglobin", normalRange: "12-17 g/dL", abnormalInDisease: "Low if chronic blood loss" },
      { name: "Gastrin", normalRange: "<100 pg/mL", abnormalInDisease: ">1000 suggests Zollinger-Ellison" },
      { name: "Lipase", normalRange: "<60 U/L", abnormalInDisease: "Check if perforation suspected" }
    ],
    imagingFindings: {
      egd: ["Ulcer crater", "Clean base vs active bleeding", "Biopsy for H. pylori and malignancy (gastric ulcers)"],
      ct: ["Free air if perforated", "Not first-line"]
    },
    severity: {
      mild: { description: "Small ulcer, no bleeding, H. pylori positive" },
      moderate: { description: "Larger ulcer, chronic symptoms" },
      severe: { description: "Bleeding, perforation, obstruction" }
    },
    modifications: {
      gi_tract: {
        physiology: {
          gastric_acid_output: { factor: 1.3, note: "May be elevated in DU" }
        }
      },
      blood: {
        physiology: {
          hemoglobin: { factor: 0.8, note: "Chronic blood loss" }
        }
      }
    }
  },

  // =====================
  // HEPATITIS B
  // ICD-10: B18.1
  // =====================

  B18_1: {
    name: "Chronic Hepatitis B",
    icd10: "B18.1",
    category: "gastrointestinal",
    definition: "Persistent HBV infection >6 months with ongoing liver inflammation",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "blood"],
    pathophysiology: {
      mechanism: "Immune-mediated hepatocyte injury → chronic inflammation → fibrosis → cirrhosis → HCC risk",
      molecularBasis: "HBV DNA integrates; cccDNA persists; immune phases vary (tolerant, active, inactive, reactivation)"
    },
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic",
        "Fatigue",
        "RUQ discomfort",
        "Symptoms of cirrhosis if advanced"
      ],
      signs: [
        "May be normal",
        "Hepatomegaly",
        "Signs of cirrhosis if advanced"
      ]
    },
    laboratoryFindings: [
      { name: "HBsAg", normalRange: "Negative", abnormalInDisease: "Positive (defines chronic infection)" },
      { name: "HBeAg", normalRange: "Negative", abnormalInDisease: "Positive = high replication (or HBeAg-negative mutant)" },
      { name: "HBV DNA", normalRange: "Undetectable", abnormalInDisease: "Detectable; >2000 IU/mL = active" },
      { name: "ALT", normalRange: "<40 U/L", abnormalInDisease: "Elevated in immune-active phase" },
      { name: "Anti-HBs", normalRange: "Positive if immune", abnormalInDisease: "Negative in chronic infection" }
    ],
    imagingFindings: {
      ultrasound: ["Screen for HCC every 6 months", "Assess for cirrhosis"],
      fibroscan: ["Liver stiffness assessment"]
    },
    severity: {
      mild: { description: "Immune tolerant or inactive carrier, normal ALT, low DNA" },
      moderate: { description: "Immune active, elevated ALT, high DNA, no cirrhosis" },
      severe: { description: "Cirrhosis, decompensation, HCC" }
    },
    modifications: {
      liver: {
        physiology: {
          alt: { factor: 2.0, note: "Elevated in active disease" },
          ast: { factor: 1.8, note: "Elevated" }
        },
        structure: {
          collagen_content: { factor: 1.5, note: "Fibrosis progression" }
        }
      },
      blood: {
        physiology: {
          hemoglobin: { factor: 0.95, note: "Usually normal" }
        }
      }
    }
  },

  // =====================
  // HEPATITIS C
  // ICD-10: B18.2
  // =====================

  B18_2: {
    name: "Chronic Hepatitis C",
    icd10: "B18.2",
    category: "gastrointestinal",
    definition: "Persistent HCV infection causing chronic liver inflammation, now curable with DAAs",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "blood", "kidneys"],
    pathophysiology: {
      mechanism: "HCV replication → immune-mediated hepatocyte injury → fibrosis → cirrhosis → HCC",
      molecularBasis: "RNA virus, multiple genotypes; extrahepatic manifestations: cryoglobulinemia, glomerulonephritis"
    },
    clinicalPresentation: {
      symptoms: [
        "Usually asymptomatic until advanced",
        "Fatigue",
        "Arthralgias",
        "Symptoms of cirrhosis if advanced"
      ],
      signs: [
        "May be normal",
        "Signs of cirrhosis if advanced",
        "Extrahepatic: palpable purpura (cryoglobulinemia)"
      ]
    },
    laboratoryFindings: [
      { name: "HCV antibody", normalRange: "Negative", abnormalInDisease: "Positive (screening)" },
      { name: "HCV RNA", normalRange: "Undetectable", abnormalInDisease: "Detectable (confirms active infection)" },
      { name: "HCV genotype", normalRange: "N/A", abnormalInDisease: "1-6 (affects treatment duration)" },
      { name: "ALT", normalRange: "<40 U/L", abnormalInDisease: "Often elevated but can be normal" },
      { name: "Platelet count", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Low if cirrhosis" }
    ],
    imagingFindings: {
      ultrasound: ["Screen for HCC if cirrhotic"],
      fibroscan: ["Assess fibrosis stage"]
    },
    severity: {
      mild: { description: "F0-F1 fibrosis, normal ALT" },
      moderate: { description: "F2-F3 fibrosis" },
      severe: { description: "F4 (cirrhosis), HCC risk" }
    },
    modifications: {
      liver: {
        physiology: {
          alt: { factor: 1.5, note: "Variable elevation" },
          ast: { factor: 1.5, note: "Variable" }
        },
        structure: {
          collagen_content: { factor: 2.0, note: "Fibrosis" }
        }
      },
      blood: {
        geometry: {
          platelet_count: { factor: 0.7, note: "If cirrhotic" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.9, note: "Cryoglobulinemic GN risk" }
        }
      }
    }
  },

  // =====================
  // NAFLD/NASH
  // ICD-10: K76.0
  // =====================

  K76_0: {
    name: "Non-Alcoholic Fatty Liver Disease (NAFLD/NASH)",
    icd10: "K76.0",
    category: "gastrointestinal",
    definition: "Hepatic steatosis without significant alcohol use; NASH = steatosis + inflammation ± fibrosis",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "pancreas", "heart"],
    pathophysiology: {
      mechanism: "Insulin resistance → hepatic triglyceride accumulation → lipotoxicity → inflammation → fibrosis",
      molecularBasis: "Multiple hit hypothesis: steatosis + oxidative stress + ER stress + cytokines"
    },
    clinicalPresentation: {
      symptoms: [
        "Usually asymptomatic",
        "Fatigue",
        "RUQ discomfort",
        "Symptoms of metabolic syndrome"
      ],
      signs: [
        "Hepatomegaly",
        "Obesity (80%)",
        "Features of metabolic syndrome",
        "Acanthosis nigricans"
      ]
    },
    laboratoryFindings: [
      { name: "ALT", normalRange: "<40 U/L", abnormalInDisease: "Mildly elevated (often 1-4x ULN)" },
      { name: "AST", normalRange: "<40 U/L", abnormalInDisease: "Elevated (AST/ALT <1 unless cirrhosis)" },
      { name: "GGT", normalRange: "<60 U/L", abnormalInDisease: "Often elevated" },
      { name: "Fasting glucose", normalRange: "<100 mg/dL", abnormalInDisease: "Elevated (insulin resistance)" },
      { name: "Triglycerides", normalRange: "<150 mg/dL", abnormalInDisease: "Elevated" },
      { name: "HDL", normalRange: ">40 mg/dL", abnormalInDisease: "Low" },
      { name: "Ferritin", normalRange: "20-300 ng/mL", abnormalInDisease: "Mildly elevated (dysmetabolic iron)" }
    ],
    imagingFindings: {
      ultrasound: ["Increased echogenicity (bright liver)", "Hepatomegaly"],
      fibroscan: ["CAP >238 dB/m suggests steatosis", "Stiffness for fibrosis staging"],
      mri: ["MRI-PDFF for fat quantification"]
    },
    severity: {
      mild: { description: "Simple steatosis, no fibrosis (NAFL)" },
      moderate: { description: "NASH with F1-F2 fibrosis" },
      severe: { description: "NASH with F3-F4 fibrosis, cirrhosis" }
    },
    modifications: {
      liver: {
        physiology: {
          alt: { factor: 1.8, note: "Mildly elevated" },
          ast: { factor: 1.5, note: "Elevated" }
        },
        structure: {
          fat_content: { factor: 3.0, note: "Hepatic steatosis" },
          collagen_content: { factor: 1.5, note: "Fibrosis in NASH" }
        }
      },
      pancreas: {
        physiology: {
          fasting_glucose: { factor: 1.2, note: "Insulin resistance" },
          hba1c: { factor: 1.1, note: "Prediabetes common" }
        }
      },
      heart: {
        physiology: {
          blood_pressure: { factor: 1.1, note: "Often hypertensive" }
        }
      }
    }
  }
};

export default GASTROINTESTINAL_DISEASES;
