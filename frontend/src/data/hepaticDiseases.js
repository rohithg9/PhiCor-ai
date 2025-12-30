// ============================================================
// HEPATIC/LIVER DISEASES DATABASE
// Comprehensive ICD-10 coverage for liver and biliary diseases
// ICD-10: K70-K77 (Diseases of liver), K80-K87 (Biliary)
// ============================================================

export const HEPATIC_DISEASES = {
  // =====================
  // ALCOHOLIC LIVER DISEASE
  // ICD-10: K70 Series
  // =====================

  K70_0: {
    name: "Alcoholic Fatty Liver Disease",
    icd10: "K70.0",
    category: "hepatic",
    definition: "Hepatic steatosis caused by chronic alcohol consumption",
    primaryOrgan: "liver",
    affectedOrgans: ["liver"],
    pathophysiology: {
      mechanism: "Alcohol metabolism → increased NADH/NAD ratio → impaired fatty acid oxidation → triglyceride accumulation in hepatocytes",
      molecularBasis: "Acetaldehyde toxicity, oxidative stress, mitochondrial dysfunction, lipid peroxidation"
    },
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic",
        "Mild right upper quadrant discomfort",
        "Fatigue",
        "History of heavy alcohol use"
      ],
      signs: [
        "Hepatomegaly (soft, nontender)",
        "May be completely normal exam"
      ]
    },
    laboratoryFindings: [
      { name: "AST", normalRange: "10-40 U/L", abnormalInDisease: "Elevated (AST:ALT ratio >2:1 classic)" },
      { name: "ALT", normalRange: "7-56 U/L", abnormalInDisease: "Elevated but less than AST" },
      { name: "GGT", normalRange: "9-48 U/L", abnormalInDisease: "Elevated (sensitive marker for alcohol)" },
      { name: "MCV", normalRange: "80-100 fL", abnormalInDisease: "Macrocytosis common" }
    ],
    imagingFindings: {
      ultrasound: ["Hyperechoic liver (bright liver)", "Hepatomegaly"],
      ctScan: ["Decreased liver attenuation (fat is dark on CT)"],
      fibroscan: ["Elevated CAP score (controlled attenuation parameter)"]
    },
    modifications: {
      liver: {
        geometry: {
          liver_weight: { factor: 1.15, note: "Hepatomegaly from fat accumulation" },
          liver_volume: { factor: 1.15, note: "Increased due to steatosis" }
        },
        physiology: {
          alt: { factor: 1.8, note: "Mildly elevated" },
          ast: { factor: 2.2, note: "Elevated, AST>ALT typical for alcohol" },
          hepatic_blood_flow: { factor: 0.95, note: "Minimally reduced" }
        },
        structure: {
          hepatocyte_size: { factor: 1.3, note: "Swollen with fat droplets" }
        }
      }
    },
    severity: {
      mild: { description: "Steatosis <33% of hepatocytes" },
      moderate: { description: "Steatosis 33-66% of hepatocytes" },
      severe: { description: "Steatosis >66% of hepatocytes" }
    }
  },

  K70_1: {
    name: "Alcoholic Hepatitis",
    icd10: "K70.1",
    category: "hepatic",
    definition: "Acute inflammatory liver injury due to heavy alcohol use, potentially life-threatening",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "kidneys"],
    pathophysiology: {
      mechanism: "Acute alcohol-induced hepatocyte injury → neutrophilic inflammation → Mallory-Denk bodies → potential necrosis",
      molecularBasis: "Gut-derived LPS, TNF-α activation, oxidative stress, mitochondrial dysfunction"
    },
    clinicalPresentation: {
      symptoms: [
        "Jaundice (rapid onset)",
        "Fever",
        "Right upper quadrant pain",
        "Anorexia",
        "Nausea and vomiting",
        "Recent heavy alcohol binge"
      ],
      signs: [
        "Jaundice",
        "Tender hepatomegaly",
        "Fever",
        "Ascites",
        "Hepatic encephalopathy (severe cases)"
      ]
    },
    laboratoryFindings: [
      { name: "AST", normalRange: "10-40 U/L", abnormalInDisease: "Elevated 2-6x (rarely >300-500, AST:ALT >2)" },
      { name: "Bilirubin", normalRange: "0.1-1.2 mg/dL", abnormalInDisease: "Markedly elevated (often >5 mg/dL)" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Leukocytosis" },
      { name: "INR", normalRange: "0.9-1.1", abnormalInDisease: "Elevated (synthetic dysfunction)" },
      { name: "Maddrey DF", normalRange: "N/A", abnormalInDisease: ">32 indicates severe disease, consider steroids" }
    ],
    imagingFindings: {
      ultrasound: ["Hepatomegaly", "Heterogeneous echotexture", "Ascites"],
      ctScan: ["Hepatomegaly", "Periportal edema"]
    },
    modifications: {
      liver: {
        geometry: {
          liver_weight: { factor: 1.2, note: "Hepatomegaly from inflammation" },
          liver_volume: { factor: 1.2, note: "Swollen liver" }
        },
        physiology: {
          alt: { factor: 3.0, note: "Moderately elevated" },
          ast: { factor: 5.0, note: "Significantly elevated, AST>ALT" },
          bilirubin: { factor: 8.0, note: "Markedly elevated (jaundice)" },
          albumin: { factor: 0.75, note: "Reduced synthesis" },
          inr: { factor: 1.5, note: "Coagulopathy" },
          albumin_synthesis: { factor: 0.6, note: "Impaired synthetic function" },
          bile_production: { factor: 0.7, note: "Cholestasis" }
        },
        pressures: {
          portal_pressure: { factor: 1.3, note: "Elevated from inflammation" }
        },
        structure: {
          kupffer_cells: { factor: 1.5, note: "Activated inflammatory cells" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.85, note: "Hepatorenal risk" }
        }
      }
    },
    severity: {
      mild: { description: "Maddrey DF <32, no encephalopathy" },
      moderate: { description: "Maddrey DF 32-54" },
      severe: { description: "Maddrey DF >54, encephalopathy, renal failure (high mortality)" }
    }
  },

  K70_3: {
    name: "Alcoholic Cirrhosis",
    icd10: "K70.3",
    category: "hepatic",
    definition: "End-stage alcoholic liver disease with irreversible fibrosis and nodular regeneration",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "kidneys", "brain"],
    pathophysiology: {
      mechanism: "Chronic inflammation → stellate cell activation → collagen deposition → architectural distortion → portal hypertension",
      molecularBasis: "TGF-β mediated fibrogenesis, hepatocyte apoptosis, angiogenesis, sinusoidal capillarization"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Jaundice",
        "Abdominal distension (ascites)",
        "Easy bruising/bleeding",
        "Confusion (encephalopathy)",
        "Muscle wasting"
      ],
      signs: [
        "Jaundice",
        "Spider angiomata",
        "Palmar erythema",
        "Gynecomastia",
        "Ascites",
        "Caput medusae",
        "Asterixis",
        "Fetor hepaticus"
      ]
    },
    laboratoryFindings: [
      { name: "Albumin", normalRange: "3.5-5.0 g/dL", abnormalInDisease: "Low (synthetic dysfunction)" },
      { name: "INR", normalRange: "0.9-1.1", abnormalInDisease: "Elevated" },
      { name: "Bilirubin", normalRange: "0.1-1.2 mg/dL", abnormalInDisease: "Elevated" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Low (splenic sequestration)" },
      { name: "MELD score", normalRange: "6-9", abnormalInDisease: "Elevated (predicts mortality)" }
    ],
    imagingFindings: {
      ultrasound: ["Nodular liver surface", "Splenomegaly", "Ascites", "Portal vein dilation"],
      ctScan: ["Nodular liver", "Varices", "Splenomegaly"],
      fibroscan: ["Elevated liver stiffness (>12.5 kPa)"]
    },
    modifications: {
      liver: {
        geometry: {
          liver_weight: { factor: 0.7, note: "Shrunken cirrhotic liver" },
          liver_volume: { factor: 0.7, note: "Reduced volume" },
          hepatocyte_count: { factor: 0.5, note: "Massive hepatocyte loss" }
        },
        physiology: {
          alt: { factor: 1.5, note: "Mildly elevated or normal (burned-out)" },
          ast: { factor: 2.0, note: "Elevated" },
          bilirubin: { factor: 4.0, note: "Elevated" },
          albumin: { factor: 0.6, note: "Severely reduced (2.0-2.5 g/dL)" },
          inr: { factor: 1.8, note: "Coagulopathy" },
          albumin_synthesis: { factor: 0.4, note: "Severely impaired" },
          bile_production: { factor: 0.5, note: "Reduced" },
          hepatic_blood_flow: { factor: 0.6, note: "Reduced due to fibrosis" },
          portal_flow: { factor: 0.5, note: "Reduced with shunting" }
        },
        pressures: {
          portal_pressure: { factor: 2.5, note: "Portal hypertension (>12 mmHg)" },
          hvpg: { factor: 4.0, note: "Clinically significant portal HTN" }
        },
        structure: {
          collagen_content: { factor: 8.0, note: "Extensive fibrosis (20-25%)" },
          stellate_cells: { factor: 3.0, note: "Activated myofibroblasts" },
          sinusoid_fenestration: { factor: 0.3, note: "Capillarization of sinusoids" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.7, note: "Hepatorenal syndrome risk" }
        }
      }
    },
    severity: {
      mild: { description: "Child-Pugh A (5-6 points)" },
      moderate: { description: "Child-Pugh B (7-9 points)" },
      severe: { description: "Child-Pugh C (10-15 points)" }
    }
  },
    laboratoryFindings: [
      { name: "AST", normalRange: "10-40 U/L", abnormalInDisease: "Elevated 2-6x (rarely >300-500, AST:ALT >2)" },
      { name: "Bilirubin", normalRange: "0.1-1.2 mg/dL", abnormalInDisease: "Markedly elevated (often >5 mg/dL)" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Leukocytosis" },
      { name: "INR", normalRange: "0.9-1.1", abnormalInDisease: "Elevated (synthetic dysfunction)" },
      { name: "Maddrey DF", normalRange: "N/A", abnormalInDisease: ">32 indicates severe disease, consider steroids" }
    ],
    imagingFindings: {
      ultrasound: ["Hepatomegaly", "Heterogeneous echotexture", "Ascites"],
      ctScan: ["Hepatomegaly", "Periportal edema"]
    },
    severity: {
      mild: { description: "Maddrey DF <32, no encephalopathy" },
      moderate: { description: "Maddrey DF 32-54" },
      severe: { description: "Maddrey DF >54, encephalopathy, renal failure (high mortality)" }
    }
  },

  K70_3: {
    name: "Alcoholic Cirrhosis",
    icd10: "K70.3",
    category: "hepatic",
    definition: "End-stage alcoholic liver disease with irreversible fibrosis and nodular regeneration",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "kidneys", "brain"],
    pathophysiology: {
      mechanism: "Chronic inflammation → stellate cell activation → collagen deposition → architectural distortion → portal hypertension",
      molecularBasis: "TGF-β mediated fibrogenesis, hepatocyte apoptosis, angiogenesis, sinusoidal capillarization"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Jaundice",
        "Abdominal distension (ascites)",
        "Easy bruising/bleeding",
        "Confusion (encephalopathy)",
        "Muscle wasting"
      ],
      signs: [
        "Jaundice",
        "Spider angiomata",
        "Palmar erythema",
        "Gynecomastia",
        "Ascites",
        "Caput medusae",
        "Asterixis",
        "Fetor hepaticus"
      ]
    },
    laboratoryFindings: [
      { name: "Albumin", normalRange: "3.5-5.0 g/dL", abnormalInDisease: "Low (synthetic dysfunction)" },
      { name: "INR", normalRange: "0.9-1.1", abnormalInDisease: "Elevated" },
      { name: "Bilirubin", normalRange: "0.1-1.2 mg/dL", abnormalInDisease: "Elevated" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Low (splenic sequestration)" },
      { name: "MELD score", normalRange: "6-9", abnormalInDisease: "Elevated (predicts mortality)" }
    ],
    imagingFindings: {
      ultrasound: ["Nodular liver surface", "Splenomegaly", "Ascites", "Portal vein dilation"],
      ctScan: ["Nodular liver", "Varices", "Splenomegaly"],
      fibroscan: ["Elevated liver stiffness (>12.5 kPa)"]
    },
    severity: {
      mild: { description: "Child-Pugh A (5-6 points)" },
      moderate: { description: "Child-Pugh B (7-9 points)" },
      severe: { description: "Child-Pugh C (10-15 points)" }
    }
  },

  // =====================
  // NON-ALCOHOLIC FATTY LIVER DISEASE
  // ICD-10: K76.0, K75.81
  // =====================

  K76_0: {
    name: "Non-Alcoholic Fatty Liver Disease (NAFLD)",
    icd10: "K76.0",
    category: "hepatic",
    definition: "Hepatic steatosis in the absence of significant alcohol consumption, associated with metabolic syndrome",
    primaryOrgan: "liver",
    affectedOrgans: ["liver"],
    pathophysiology: {
      mechanism: "Insulin resistance → increased hepatic lipogenesis → triglyceride accumulation → steatosis",
      molecularBasis: "SREBP-1c activation, impaired VLDL secretion, adipokine dysregulation"
    },
    clinicalPresentation: {
      symptoms: [
        "Usually asymptomatic",
        "Fatigue",
        "Right upper quadrant discomfort",
        "Often discovered incidentally"
      ],
      signs: [
        "Hepatomegaly",
        "Features of metabolic syndrome (obesity, hypertension)"
      ]
    },
    laboratoryFindings: [
      { name: "ALT", normalRange: "7-56 U/L", abnormalInDisease: "Mildly elevated (ALT > AST typically)" },
      { name: "AST", normalRange: "10-40 U/L", abnormalInDisease: "Mildly elevated" },
      { name: "GGT", normalRange: "9-48 U/L", abnormalInDisease: "May be elevated" },
      { name: "Fasting glucose", normalRange: "<100 mg/dL", abnormalInDisease: "Often elevated (metabolic syndrome)" },
      { name: "Lipid panel", normalRange: "Normal", abnormalInDisease: "Dyslipidemia common" }
    ],
    imagingFindings: {
      ultrasound: ["Hyperechoic liver", "Hepatomegaly"],
      fibroscan: ["Elevated CAP (>238 dB/m suggests steatosis)"],
      mri: ["MRI-PDFF for fat quantification"]
    },
    modifications: {
      liver: {
        geometry: {
          liver_weight: { factor: 1.1, note: "Mild hepatomegaly" },
          liver_volume: { factor: 1.1, note: "Increased from fat" }
        },
        physiology: {
          alt: { factor: 1.5, note: "Mildly elevated, ALT>AST" },
          ast: { factor: 1.3, note: "Mildly elevated" },
          hepatic_blood_flow: { factor: 0.95, note: "Slightly reduced" }
        },
        structure: {
          hepatocyte_size: { factor: 1.2, note: "Enlarged with lipid droplets" }
        }
      }
    },
    severity: {
      mild: { description: "Steatosis <33%, no fibrosis (F0)" },
      moderate: { description: "Steatosis with inflammation (NASH), F1-F2 fibrosis" },
      severe: { description: "Advanced fibrosis (F3-F4), cirrhosis" }
    }
  },

  K75_81: {
    name: "Non-Alcoholic Steatohepatitis (NASH)",
    icd10: "K75.81",
    category: "hepatic",
    definition: "Progressive form of NAFLD with hepatocyte injury, inflammation, and fibrosis",
    primaryOrgan: "liver",
    affectedOrgans: ["liver"],
    pathophysiology: {
      mechanism: "Steatosis + oxidative stress → lipotoxicity → hepatocyte injury → inflammation → fibrosis",
      molecularBasis: "Two-hit hypothesis: steatosis sensitizes to second hits (oxidative stress, cytokines, ER stress)"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Malaise",
        "Right upper quadrant discomfort",
        "May be asymptomatic"
      ],
      signs: [
        "Hepatomegaly",
        "Features of metabolic syndrome",
        "Signs of advanced disease if cirrhotic"
      ]
    },
    laboratoryFindings: [
      { name: "ALT", normalRange: "7-56 U/L", abnormalInDisease: "Elevated (often 1.5-3x ULN)" },
      { name: "AST", normalRange: "10-40 U/L", abnormalInDisease: "Elevated (AST:ALT >1 suggests advanced fibrosis)" },
      { name: "FIB-4 score", normalRange: "<1.30", abnormalInDisease: ">2.67 suggests advanced fibrosis" }
    ],
    imagingFindings: {
      fibroscan: ["Elevated liver stiffness", "Elevated CAP"],
      liverBiopsy: ["Gold standard: steatosis + ballooning + lobular inflammation ± fibrosis"]
    },
    modifications: {
      liver: {
        geometry: {
          liver_weight: { factor: 1.15, note: "Hepatomegaly" },
          liver_volume: { factor: 1.15, note: "Enlarged" }
        },
        physiology: {
          alt: { factor: 2.5, note: "Elevated (1.5-3x ULN)" },
          ast: { factor: 2.0, note: "Elevated" },
          albumin_synthesis: { factor: 0.9, note: "Mildly impaired if fibrosis" },
          hepatic_blood_flow: { factor: 0.85, note: "Reduced with fibrosis" }
        },
        structure: {
          hepatocyte_size: { factor: 1.3, note: "Ballooned hepatocytes" },
          collagen_content: { factor: 2.5, note: "Increased with fibrosis" },
          stellate_cells: { factor: 1.8, note: "Activated" }
        }
      }
    },
    severity: {
      mild: { description: "NASH with F0-F1 fibrosis" },
      moderate: { description: "NASH with F2-F3 fibrosis" },
      severe: { description: "NASH cirrhosis (F4)" }
    }
  },

  // =====================
  // VIRAL HEPATITIS
  // ICD-10: B15-B19
  // =====================

  B18_2: {
    name: "Chronic Viral Hepatitis C",
    icd10: "B18.2",
    category: "hepatic",
    definition: "Chronic infection with Hepatitis C virus causing progressive liver disease",
    primaryOrgan: "liver",
    affectedOrgans: ["liver"],
    pathophysiology: {
      mechanism: "HCV RNA replication → chronic immune-mediated hepatocyte injury → fibrosis → cirrhosis over 20-30 years",
      molecularBasis: "HCV evades immune clearance, NS3/4A protease, NS5B polymerase targets for DAAs"
    },
    clinicalPresentation: {
      symptoms: [
        "Often asymptomatic for years",
        "Fatigue",
        "Right upper quadrant discomfort",
        "Symptoms of cirrhosis if advanced"
      ],
      signs: [
        "Often normal",
        "Hepatomegaly",
        "Signs of cirrhosis if advanced"
      ]
    },
    laboratoryFindings: [
      { name: "HCV antibody", normalRange: "Negative", abnormalInDisease: "Positive (screening test)" },
      { name: "HCV RNA", normalRange: "Undetectable", abnormalInDisease: "Detectable (confirms active infection)" },
      { name: "HCV genotype", normalRange: "N/A", abnormalInDisease: "Guides treatment duration" },
      { name: "ALT", normalRange: "7-56 U/L", abnormalInDisease: "May be normal or elevated" }
    ],
    imagingFindings: {
      fibroscan: ["Assess fibrosis stage"],
      ultrasound: ["Screen for HCC if cirrhotic"]
    },
    severity: {
      mild: { description: "F0-F1 fibrosis, normal ALT" },
      moderate: { description: "F2-F3 fibrosis" },
      severe: { description: "F4 (cirrhosis), decompensated disease" }
    }
  },

  B18_1: {
    name: "Chronic Viral Hepatitis B",
    icd10: "B18.1",
    category: "hepatic",
    definition: "Chronic infection with Hepatitis B virus with risk of cirrhosis and HCC",
    primaryOrgan: "liver",
    affectedOrgans: ["liver"],
    pathophysiology: {
      mechanism: "HBV cccDNA persists in hepatocytes → immune-mediated injury → cycles of necrosis/regeneration → fibrosis",
      molecularBasis: "cccDNA in nucleus, HBx protein oncogenesis, immune phases (tolerance, clearance, inactive, reactivation)"
    },
    clinicalPresentation: {
      symptoms: [
        "Usually asymptomatic in chronic phase",
        "Fatigue",
        "Right upper quadrant discomfort",
        "Symptoms of cirrhosis if advanced"
      ],
      signs: [
        "Often normal",
        "Hepatomegaly",
        "Signs of cirrhosis if advanced"
      ]
    },
    laboratoryFindings: [
      { name: "HBsAg", normalRange: "Negative", abnormalInDisease: "Positive (chronic if >6 months)" },
      { name: "HBeAg", normalRange: "Negative", abnormalInDisease: "Positive indicates active replication" },
      { name: "HBV DNA", normalRange: "Undetectable", abnormalInDisease: "Detectable (viral load)" },
      { name: "ALT", normalRange: "7-56 U/L", abnormalInDisease: "Variable depending on phase" }
    ],
    imagingFindings: {
      ultrasound: ["HCC surveillance every 6 months if cirrhotic or high-risk"],
      fibroscan: ["Fibrosis staging"]
    },
    severity: {
      mild: { description: "Immune tolerant or inactive carrier, F0-F1" },
      moderate: { description: "Immune active phase, F2-F3" },
      severe: { description: "Cirrhosis, HCC" }
    }
  },

  // =====================
  // LIVER FAILURE
  // ICD-10: K72 Series
  // =====================

  K72_0: {
    name: "Acute and Subacute Hepatic Failure",
    icd10: "K72.0",
    category: "hepatic",
    definition: "Rapid deterioration of liver function in a patient without preexisting liver disease",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "brain", "kidneys"],
    pathophysiology: {
      mechanism: "Massive hepatocyte death → loss of synthetic/metabolic function → coagulopathy, encephalopathy, multi-organ failure",
      molecularBasis: "Acetaminophen toxicity (NAPQI), viral, autoimmune, ischemic, drug-induced"
    },
    clinicalPresentation: {
      symptoms: [
        "Jaundice",
        "Confusion progressing to coma",
        "Nausea, vomiting",
        "Right upper quadrant pain",
        "Bleeding"
      ],
      signs: [
        "Jaundice",
        "Hepatic encephalopathy (asterixis → coma)",
        "Coagulopathy (bruising, bleeding)",
        "Cerebral edema",
        "Hypoglycemia"
      ]
    },
    laboratoryFindings: [
      { name: "INR", normalRange: "0.9-1.1", abnormalInDisease: ">1.5 (required for diagnosis)" },
      { name: "Bilirubin", normalRange: "0.1-1.2 mg/dL", abnormalInDisease: "Markedly elevated" },
      { name: "AST/ALT", normalRange: "<40 U/L", abnormalInDisease: "Often >1000 U/L (massive necrosis)" },
      { name: "Ammonia", normalRange: "<35 µmol/L", abnormalInDisease: "Elevated (encephalopathy)" },
      { name: "Acetaminophen level", normalRange: "N/A", abnormalInDisease: "Check in all cases" }
    ],
    imagingFindings: {
      ctHead: ["Cerebral edema assessment"],
      ultrasound: ["Rule out vascular causes (Budd-Chiari)"]
    },
    severity: {
      mild: { description: "Hyperacute: encephalopathy within 7 days (better prognosis with treatment)" },
      moderate: { description: "Acute: encephalopathy 8-28 days" },
      severe: { description: "Subacute: encephalopathy >28 days (worst prognosis without transplant)" }
    }
  },

  K72_1: {
    name: "Chronic Hepatic Failure",
    icd10: "K72.1",
    category: "hepatic",
    definition: "Progressive deterioration of liver function in the setting of chronic liver disease",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "brain", "kidneys"],
    pathophysiology: {
      mechanism: "Cirrhosis → portal hypertension → shunting → failure of detoxification → systemic complications",
      molecularBasis: "Accumulated toxins (ammonia, mercaptans), systemic inflammation, hormonal dysregulation"
    },
    clinicalPresentation: {
      symptoms: [
        "Progressive fatigue",
        "Confusion",
        "Abdominal distension",
        "Easy bleeding",
        "Jaundice"
      ],
      signs: [
        "Ascites",
        "Hepatic encephalopathy",
        "Jaundice",
        "Coagulopathy",
        "Hepatorenal syndrome"
      ]
    },
    laboratoryFindings: [
      { name: "MELD score", normalRange: "6-9", abnormalInDisease: "Elevated (>15 = significant mortality)" },
      { name: "Albumin", normalRange: "3.5-5.0 g/dL", abnormalInDisease: "Low" },
      { name: "INR", normalRange: "0.9-1.1", abnormalInDisease: "Elevated" },
      { name: "Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "Elevated (hepatorenal)" }
    ],
    imagingFindings: {
      ultrasound: ["Cirrhotic liver", "Ascites", "Portal vein assessment"],
      ctScan: ["Varices", "HCC screening"]
    },
    severity: {
      mild: { description: "Compensated cirrhosis, MELD <10" },
      moderate: { description: "Decompensated, MELD 10-20" },
      severe: { description: "MELD >20, multi-organ failure" }
    }
  },

  // =====================
  // PORTAL HYPERTENSION
  // ICD-10: K76.6
  // =====================

  K76_6: {
    name: "Portal Hypertension",
    icd10: "K76.6",
    category: "hepatic",
    definition: "Elevated pressure in the portal venous system (>10 mmHg), usually from cirrhosis",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "kidneys"],
    pathophysiology: {
      mechanism: "Increased intrahepatic resistance (cirrhosis) + splanchnic vasodilation → elevated portal pressure → varices, ascites, splenomegaly",
      molecularBasis: "Sinusoidal capillarization, NO imbalance, endothelin, portosystemic shunting"
    },
    clinicalPresentation: {
      symptoms: [
        "Abdominal distension (ascites)",
        "GI bleeding (variceal)",
        "Confusion (encephalopathy)",
        "Easy bruising"
      ],
      signs: [
        "Ascites",
        "Splenomegaly",
        "Caput medusae",
        "Hemorrhoids",
        "Signs of cirrhosis"
      ]
    },
    laboratoryFindings: [
      { name: "Platelet count", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Low (splenic sequestration)" },
      { name: "Albumin", normalRange: "3.5-5.0 g/dL", abnormalInDisease: "Low" },
      { name: "INR", normalRange: "0.9-1.1", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      ultrasound: ["Portal vein dilation (>13mm)", "Splenomegaly", "Ascites", "Reversed portal flow"],
      egd: ["Esophageal/gastric varices"],
      hvpg: ["Hepatic venous pressure gradient >10 mmHg (clinically significant >12)"]
    },
    severity: {
      mild: { description: "HVPG 6-10 mmHg, no varices" },
      moderate: { description: "HVPG 10-12 mmHg, small varices" },
      severe: { description: "HVPG >12 mmHg, large varices, bleeding history" }
    }
  },

  // =====================
  // BILIARY DISEASES
  // ICD-10: K80-K83 Series
  // =====================

  K80_0: {
    name: "Cholelithiasis with Acute Cholecystitis",
    icd10: "K80.0",
    category: "hepatic",
    definition: "Gallstone disease complicated by acute inflammation of the gallbladder",
    primaryOrgan: "liver",
    affectedOrgans: ["liver"],
    pathophysiology: {
      mechanism: "Stone impaction in cystic duct → gallbladder distension → inflammation → potential infection and necrosis",
      molecularBasis: "Phospholipase A2 activation, prostaglandin release, bacterial superinfection"
    },
    clinicalPresentation: {
      symptoms: [
        "Right upper quadrant pain (>6 hours, persistent)",
        "Fever",
        "Nausea and vomiting",
        "Pain after fatty meals"
      ],
      signs: [
        "RUQ tenderness",
        "Murphy's sign positive",
        "Fever",
        "Guarding"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Elevated (leukocytosis)" },
      { name: "AST/ALT", normalRange: "<40 U/L", abnormalInDisease: "Mildly elevated" },
      { name: "Alkaline phosphatase", normalRange: "44-147 U/L", abnormalInDisease: "May be elevated" },
      { name: "Bilirubin", normalRange: "0.1-1.2 mg/dL", abnormalInDisease: "Mildly elevated if CBD stone" }
    ],
    imagingFindings: {
      ultrasound: ["Gallstones", "Gallbladder wall thickening (>3mm)", "Pericholecystic fluid", "Sonographic Murphy's sign"],
      hida: ["Non-visualization of gallbladder (cystic duct obstruction)"]
    },
    severity: {
      mild: { description: "Grade I: No organ dysfunction, no severe local signs" },
      moderate: { description: "Grade II: WBC >18K, palpable mass, symptoms >72h" },
      severe: { description: "Grade III: Organ dysfunction (cardiovascular, renal, hepatic)" }
    }
  },

  K83_0: {
    name: "Cholangitis",
    icd10: "K83.0",
    category: "hepatic",
    definition: "Bacterial infection of the biliary tree, usually from obstruction - medical emergency",
    primaryOrgan: "liver",
    affectedOrgans: ["liver"],
    pathophysiology: {
      mechanism: "Biliary obstruction → bacterial overgrowth → ascending infection → bacteremia → sepsis",
      molecularBasis: "E. coli, Klebsiella, Enterococcus most common; bile stasis promotes bacterial growth"
    },
    clinicalPresentation: {
      symptoms: [
        "Right upper quadrant pain",
        "Fever and chills (rigors)",
        "Jaundice",
        "Charcot's triad present"
      ],
      signs: [
        "Charcot's triad: RUQ pain, fever, jaundice",
        "Reynolds' pentad (+ hypotension, altered mental status = severe)",
        "Sepsis signs"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Markedly elevated" },
      { name: "Bilirubin", normalRange: "0.1-1.2 mg/dL", abnormalInDisease: "Elevated (obstructive pattern)" },
      { name: "Alkaline phosphatase", normalRange: "44-147 U/L", abnormalInDisease: "Elevated" },
      { name: "Blood cultures", normalRange: "Negative", abnormalInDisease: "Often positive" }
    ],
    imagingFindings: {
      ultrasound: ["Dilated bile ducts", "CBD stone (if visible)", "Gallstones"],
      mrcp: ["CBD stone/stricture visualization"],
      ercp: ["Diagnostic and therapeutic (stone removal, stent)"]
    },
    severity: {
      mild: { description: "Grade I: Responds to initial treatment" },
      moderate: { description: "Grade II: Requires biliary drainage" },
      severe: { description: "Grade III: Organ dysfunction, requires urgent drainage + ICU" }
    }
  },

  // =====================
  // HEPATIC ENCEPHALOPATHY
  // ICD-10: K72.9
  // =====================

  K72_91: {
    name: "Hepatic Encephalopathy",
    icd10: "K72.91",
    category: "hepatic",
    definition: "Brain dysfunction caused by liver insufficiency and/or portosystemic shunting",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "brain"],
    pathophysiology: {
      mechanism: "Ammonia and other toxins bypass liver → cross blood-brain barrier → astrocyte swelling → altered neurotransmission",
      molecularBasis: "Glutamine accumulation in astrocytes, GABA-ergic tone increase, neuroinflammation, oxidative stress"
    },
    clinicalPresentation: {
      symptoms: [
        "Confusion",
        "Sleep-wake disturbances",
        "Personality changes",
        "Disorientation",
        "Somnolence to coma"
      ],
      signs: [
        "Asterixis (flapping tremor)",
        "Altered mental status",
        "Fetor hepaticus",
        "Hyperreflexia early, hyporeflexia late"
      ]
    },
    laboratoryFindings: [
      { name: "Ammonia", normalRange: "<35 µmol/L", abnormalInDisease: "Usually elevated (does not correlate with severity)" },
      { name: "Look for precipitants", normalRange: "N/A", abnormalInDisease: "Infection, GI bleed, electrolyte abnormality, constipation" }
    ],
    imagingFindings: {
      ctHead: ["Rule out other causes (stroke, SDH)"],
      mri: ["T1 hyperintensity in globus pallidus (manganese deposition)"]
    },
    severity: {
      mild: { description: "Grade 1: Mild confusion, sleep disturbance, shortened attention" },
      moderate: { description: "Grade 2: Lethargy, disorientation, asterixis" },
      severe: { description: "Grade 3-4: Marked confusion, somnolence to coma" }
    }
  }
};

export default HEPATIC_DISEASES;
