// ============================================================
// INFECTIOUS DISEASES DATABASE
// Comprehensive infectious disease entities
// ICD-10: A00-B99 (Infectious and Parasitic Diseases)
// ============================================================

export const INFECTIOUS_DISEASES = {
  // =====================
  // INFLUENZA
  // ICD-10: J10.1
  // =====================

  J10_1: {
    name: "Influenza with Respiratory Manifestations",
    icd10: "J10.1",
    category: "infectious",
    definition: "Acute viral respiratory infection caused by influenza A or B virus",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart", "muscles"],
    pathophysiology: {
      mechanism: "Viral attachment to respiratory epithelium → cytopathic effect → inflammation → systemic symptoms",
      molecularBasis: "Hemagglutinin/neuraminidase binding; interferon response; cytokine storm (severe)"
    },
    clinicalPresentation: {
      symptoms: [
        "Sudden onset fever",
        "Myalgias (severe)",
        "Headache",
        "Dry cough",
        "Sore throat",
        "Rhinorrhea",
        "Fatigue"
      ],
      signs: [
        "Fever (38-40°C)",
        "Tachycardia",
        "Pharyngeal erythema",
        "Clear rhinorrhea",
        "Respiratory distress (if pneumonia)"
      ]
    },
    laboratoryFindings: [
      { name: "Rapid influenza test", normalRange: "Negative", abnormalInDisease: "Positive (variable sensitivity)" },
      { name: "RT-PCR", normalRange: "Negative", abnormalInDisease: "Positive (gold standard)" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Normal or leukopenia" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      cxr: ["Usually normal", "Bilateral infiltrates (if viral pneumonia)", "Secondary bacterial pneumonia pattern"]
    },
    severity: {
      mild: { description: "Uncomplicated, self-limited" },
      moderate: { description: "High-risk patient, prolonged symptoms" },
      severe: { description: "Pneumonia, ARDS, myocarditis, hospitalization" }
    },
    modifications: {
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.95, note: "Mild hypoxemia in uncomplicated" },
          fev1: { factor: 0.9, note: "Transient reduction" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.2, note: "Fever-related tachycardia" }
        }
      },
      muscles: {
        physiology: {
          muscle_enzymes: { factor: 1.3, note: "Myalgias" }
        }
      }
    },
    diagnosticCriteria: {
      name: "CDC Clinical Case Definition",
      requirements: {
        clinicalCriteria: "Fever + cough/sore throat during influenza season",
        labConfirmation: "Positive RT-PCR, viral culture, or rapid antigen",
        timing: "Symptom onset within 7 days of exposure"
      }
    },
    differentialDiagnosis: [
      { condition: "COVID-19", distinguishing: "Anosmia, longer incubation, SARS-CoV-2 PCR positive" },
      { condition: "RSV", distinguishing: "More bronchiolitis in children, RSV PCR positive" },
      { condition: "Bacterial pneumonia", distinguishing: "Productive cough, lobar infiltrate, elevated procalcitonin" },
      { condition: "Mycoplasma", distinguishing: "Walking pneumonia, gradual onset, younger patients" }
    ],
    treatment: {
      antivirals: [
        { name: "Oseltamivir", dose: "75 mg BID × 5 days", indication: "Within 48h of symptoms", evidence: "IA" },
        { name: "Baloxavir", dose: "40-80 mg single dose", indication: "Alternative, within 48h", evidence: "IA" },
        { name: "Peramivir", dose: "600 mg IV single dose", indication: "Hospitalized patients", evidence: "IB" }
      ],
      supportive: [
        { name: "Acetaminophen/NSAIDs", indication: "Fever, myalgias" },
        { name: "Hydration", indication: "All patients" }
      ],
      prevention: [
        { name: "Annual influenza vaccination", indication: "All ≥6 months", evidence: "IA" }
      ]
    },
    riskStratification: {
      highRisk: "Age >65, pregnancy, immunocompromised, chronic disease",
      complications: "Secondary bacterial pneumonia, ARDS, myocarditis",
      mortality: "0.1% overall; higher in elderly and high-risk groups"
    }
  },

  // =====================
  // COVID-19
  // ICD-10: U07.1
  // =====================

  U07_1: {
    name: "COVID-19",
    icd10: "U07.1",
    category: "infectious",
    definition: "Respiratory illness caused by SARS-CoV-2 coronavirus",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart", "blood", "kidneys", "brain"],
    pathophysiology: {
      mechanism: "ACE2 receptor binding → viral replication → inflammatory cascade → endothelial dysfunction → multi-organ damage",
      molecularBasis: "Spike protein-ACE2 interaction; cytokine storm (IL-6, TNF-α); coagulopathy; endotheliitis"
    },
    clinicalPresentation: {
      symptoms: [
        "Fever",
        "Dry cough",
        "Dyspnea",
        "Fatigue",
        "Myalgias",
        "Anosmia/ageusia",
        "Headache",
        "GI symptoms (diarrhea)"
      ],
      signs: [
        "Fever",
        "Tachypnea",
        "Hypoxia (silent hypoxia)",
        "Bilateral crackles",
        "Cyanosis (severe)"
      ]
    },
    laboratoryFindings: [
      { name: "SARS-CoV-2 PCR", normalRange: "Negative", abnormalInDisease: "Positive" },
      { name: "D-dimer", normalRange: "<0.5 μg/mL", abnormalInDisease: "Elevated (thrombotic risk)" },
      { name: "Ferritin", normalRange: "<300 ng/mL", abnormalInDisease: "Elevated (inflammatory marker)" },
      { name: "LDH", normalRange: "<225 U/L", abnormalInDisease: "Elevated (tissue damage)" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Elevated" },
      { name: "Lymphocytes", normalRange: "1.0-4.0 ×10⁹/L", abnormalInDisease: "Lymphopenia" },
      { name: "IL-6", normalRange: "<7 pg/mL", abnormalInDisease: "Elevated (cytokine storm)" }
    ],
    imagingFindings: {
      cxr: ["Bilateral peripheral opacities", "Ground-glass pattern"],
      ct: ["Ground-glass opacities (bilateral, peripheral)", "Consolidation", "Crazy-paving pattern"]
    },
    severity: {
      mild: { description: "Mild symptoms, no pneumonia, SpO2 >94%" },
      moderate: { description: "Pneumonia, SpO2 90-94%" },
      severe: { description: "SpO2 <90%, respiratory failure, ARDS, shock" }
    },
    modifications: {
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.85, note: "Hypoxemia" },
          fev1: { factor: 0.7, note: "Reduced lung function" }
        },
        structure: {
          alveolar_density: { factor: 1.8, note: "Ground-glass opacities" }
        }
      },
      blood: {
        geometry: {
          lymphocyte_count: { factor: 0.5, note: "Lymphopenia" }
        },
        pressures: {
          d_dimer: { factor: 5.0, note: "Coagulopathy" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.15, note: "Tachycardia" },
          troponin: { factor: 3.0, note: "Myocardial injury" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.75, note: "AKI risk" }
        }
      }
    },
    diagnosticCriteria: {
      name: "WHO/CDC Surveillance Definition",
      requirements: {
        confirmed: "Positive SARS-CoV-2 RT-PCR or rapid antigen test",
        clinicalCriteria: "Fever, cough, dyspnea, anosmia/ageusia",
        severity: "WHO classification: Mild, Moderate, Severe, Critical"
      }
    },
    differentialDiagnosis: [
      { condition: "Influenza", distinguishing: "More myalgias, shorter incubation, influenza PCR positive" },
      { condition: "Bacterial pneumonia", distinguishing: "Lobar consolidation, productive cough, elevated procalcitonin" },
      { condition: "PJP pneumonia", distinguishing: "Immunocompromised, bilateral ground-glass, elevated LDH" },
      { condition: "Heart failure", distinguishing: "Elevated BNP, cardiomegaly, response to diuretics" }
    ],
    treatment: {
      antiviral: [
        { name: "Paxlovid (Nirmatrelvir/ritonavir)", dose: "300/100 mg BID × 5 days", indication: "High-risk within 5 days", evidence: "IA" },
        { name: "Remdesivir", dose: "200 mg IV day 1, then 100 mg × 4 days", indication: "Hospitalized, on O2", evidence: "IA" }
      ],
      antiInflammatory: [
        { name: "Dexamethasone", dose: "6 mg daily × 10 days", indication: "Hospitalized on O2/ventilator", evidence: "IA" },
        { name: "Baricitinib", dose: "4 mg daily", indication: "Severe COVID with dexamethasone", evidence: "IA" },
        { name: "Tocilizumab", dose: "8 mg/kg IV × 1", indication: "Rapid respiratory deterioration", evidence: "IA" }
      ],
      anticoagulation: [
        { name: "Prophylactic anticoagulation", indication: "All hospitalized patients", evidence: "IA" }
      ],
      prevention: [
        { name: "COVID-19 vaccination", indication: "All eligible individuals", evidence: "IA" }
      ]
    },
    riskStratification: {
      severeDisease: "Age >65, obesity, diabetes, CVD, immunocompromised",
      longCovid: "10-30% develop persistent symptoms",
      mortality: "~1% overall; higher in unvaccinated and elderly"
    }
  },

  // =====================
  // TUBERCULOSIS
  // ICD-10: A15.0
  // =====================

  A15_0: {
    name: "Pulmonary Tuberculosis",
    icd10: "A15.0",
    category: "infectious",
    definition: "Chronic granulomatous infection of lungs caused by Mycobacterium tuberculosis",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "lymphatic"],
    pathophysiology: {
      mechanism: "Inhalation of bacilli → alveolar macrophage ingestion → granuloma formation → caseating necrosis",
      molecularBasis: "Cell-mediated immunity (CD4+ T cells, IFN-γ); TNF-α critical; granuloma containment"
    },
    clinicalPresentation: {
      symptoms: [
        "Chronic cough >2-3 weeks",
        "Hemoptysis",
        "Night sweats",
        "Weight loss",
        "Fever (low-grade)",
        "Fatigue",
        "Chest pain"
      ],
      signs: [
        "Cachexia",
        "Fever",
        "Lymphadenopathy",
        "Crackles (upper lobes)",
        "Dullness to percussion (cavitary lesion)"
      ]
    },
    laboratoryFindings: [
      { name: "Sputum AFB smear", normalRange: "Negative", abnormalInDisease: "Positive (acid-fast bacilli)" },
      { name: "Sputum culture", normalRange: "Negative", abnormalInDisease: "M. tuberculosis (gold standard, 2-8 weeks)" },
      { name: "GeneXpert MTB/RIF", normalRange: "Negative", abnormalInDisease: "Positive (rapid molecular test)" },
      { name: "TST/PPD", normalRange: "<5mm (most)", abnormalInDisease: "≥10mm (positive, indicates infection)" },
      { name: "IGRA (QuantiFERON)", normalRange: "Negative", abnormalInDisease: "Positive" },
      { name: "ESR", normalRange: "<20 mm/hr", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      cxr: ["Upper lobe infiltrates", "Cavitation", "Hilar lymphadenopathy", "Ghon complex (primary)"],
      ct: ["Cavitary lesions", "Tree-in-bud pattern", "Centrilobular nodules", "Lymphadenopathy"]
    },
    severity: {
      mild: { description: "Smear-negative, limited disease" },
      moderate: { description: "Smear-positive, bilateral disease" },
      severe: { description: "Extensive cavitary, miliary, MDR-TB" }
    },
    modifications: {
      lungs: {
        physiology: {
          fev1: { factor: 0.75, note: "Reduced from fibrosis/cavitation" },
          oxygen_saturation: { factor: 0.94, note: "Mildly reduced" }
        },
        structure: {
          cavities: { factor: 5.0, note: "Cavitary lesions" },
          fibrosis: { factor: 2.0, note: "Post-TB fibrosis" }
        }
      },
      blood: {
        geometry: {
          hemoglobin: { factor: 0.85, note: "Anemia of chronic infection" }
        }
      },
      lymphatic: {
        structure: {
          lymph_node_size: { factor: 2.0, note: "Lymphadenopathy" }
        }
      }
    },
    diagnosticCriteria: {
      name: "WHO/CDC TB Diagnostic Criteria",
      requirements: {
        confirmed: "Positive culture or molecular test (GeneXpert/MTB RIF)",
        presumptive: "AFB smear positive, or clinical/radiographic consistent with TB",
        latent: "Positive TST (≥10mm) or IGRA without active disease"
      }
    },
    differentialDiagnosis: [
      { condition: "Lung cancer", distinguishing: "Mass lesion, no calcification, biopsy needed" },
      { condition: "Sarcoidosis", distinguishing: "Bilateral hilar adenopathy, non-caseating granulomas" },
      { condition: "NTM infection", distinguishing: "Similar presentation, culture identifies species" },
      { condition: "Fungal infection", distinguishing: "Endemic area exposure, fungal markers positive" },
      { condition: "Bacterial pneumonia", distinguishing: "Acute onset, responds to antibiotics" }
    ],
    treatment: {
      drugSensitive: [
        { name: "RIPE regimen", components: "Rifampin, Isoniazid, Pyrazinamide, Ethambutol", duration: "2 months intensive + 4 months continuation", evidence: "IA" },
        { name: "Vitamin B6 (Pyridoxine)", dose: "25-50 mg daily", indication: "Prevent INH neuropathy" }
      ],
      mdrTB: [
        { name: "Bedaquiline-based regimen", duration: "18-24 months or shorter course", evidence: "IA" },
        { name: "Pretomanid/Bedaquiline/Linezolid", indication: "XDR-TB, BPaL regimen", evidence: "IA" }
      ],
      latent: [
        { name: "3HP (INH/Rifapentine)", duration: "3 months weekly", indication: "Preferred for LTBI", evidence: "IA" },
        { name: "Isoniazid", duration: "6-9 months daily", indication: "Alternative", evidence: "IA" }
      ]
    },
    riskStratification: {
      reactivationRisk: "HIV, immunosuppression, diabetes, recent infection",
      mdrRisk: "Previous treatment, known MDR contact, endemic region",
      mortality: "Low if drug-sensitive and treated; high if MDR/XDR"
    }
  },

  // =====================
  // SEPSIS
  // ICD-10: A41.9
  // =====================

  A41_9: {
    name: "Sepsis (Unspecified)",
    icd10: "A41.9",
    category: "infectious",
    definition: "Life-threatening organ dysfunction due to dysregulated host response to infection",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "heart", "lungs", "kidneys", "liver", "brain"],
    pathophysiology: {
      mechanism: "Infection → SIRS → organ dysfunction from inflammatory mediators and microcirculatory failure",
      molecularBasis: "PAMPs → PRR activation → cytokine storm → endothelial dysfunction → DIC → multi-organ failure"
    },
    clinicalPresentation: {
      symptoms: [
        "Fever or hypothermia",
        "Chills/rigors",
        "Altered mental status",
        "Weakness",
        "Decreased urine output",
        "Dyspnea"
      ],
      signs: [
        "Fever >38°C or <36°C",
        "Tachycardia >90 bpm",
        "Tachypnea >20/min",
        "Hypotension (septic shock)",
        "Altered consciousness",
        "Skin mottling",
        "Delayed capillary refill"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: ">12 or <4 ×10⁹/L, or >10% bands" },
      { name: "Lactate", normalRange: "<2 mmol/L", abnormalInDisease: ">2 mmol/L (>4 = septic shock)" },
      { name: "Procalcitonin", normalRange: "<0.1 ng/mL", abnormalInDisease: ">0.5 ng/mL (bacterial)" },
      { name: "Creatinine", normalRange: "0.7-1.2 mg/dL", abnormalInDisease: "Elevated (AKI)" },
      { name: "Bilirubin", normalRange: "<1.2 mg/dL", abnormalInDisease: "Elevated (hepatic dysfunction)" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Low (DIC)" },
      { name: "INR", normalRange: "<1.1", abnormalInDisease: "Elevated (coagulopathy)" }
    ],
    imagingFindings: {
      cxr: ["Source identification (pneumonia)"],
      ct: ["Abscess identification", "Source control planning"],
      ultrasound: ["Fluid collections", "Cardiac function"]
    },
    severity: {
      mild: { description: "SOFA <2, no vasopressors" },
      moderate: { description: "SOFA 2-6, some organ dysfunction" },
      severe: { description: "Septic shock: vasopressors needed, lactate >2" }
    },
    modifications: {
      blood: {
        geometry: {
          wbc_count: { factor: 2.0, note: "Leukocytosis or leukopenia" },
          platelet_count: { factor: 0.5, note: "Thrombocytopenia (DIC)" }
        },
        pressures: {
          lactate: { factor: 4.0, note: "Elevated lactate" }
        }
      },
      heart: {
        physiology: {
          blood_pressure: { factor: 0.7, note: "Hypotension" },
          heart_rate: { factor: 1.4, note: "Tachycardia" },
          cardiac_output: { factor: 0.8, note: "Septic cardiomyopathy" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.4, note: "AKI" },
          urine_output: { factor: 0.3, note: "Oliguria" }
        }
      },
      liver: {
        physiology: {
          bilirubin: { factor: 3.0, note: "Hyperbilirubinemia" }
        }
      },
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.88, note: "Respiratory failure" }
        }
      }
    }
  },

  // =====================
  // HIV/AIDS
  // ICD-10: B20
  // =====================

  B20: {
    name: "HIV Disease Resulting in Infectious Disease",
    icd10: "B20",
    category: "infectious",
    definition: "HIV infection with opportunistic infection indicating AIDS",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "lymphatic", "lungs", "brain", "gi_tract"],
    pathophysiology: {
      mechanism: "CD4+ T-cell depletion → immunodeficiency → opportunistic infections and malignancies",
      molecularBasis: "HIV gp120-CD4 binding → viral integration → T-cell destruction; CD4 <200 = AIDS"
    },
    clinicalPresentation: {
      symptoms: [
        "Weight loss",
        "Chronic diarrhea",
        "Fever",
        "Night sweats",
        "Lymphadenopathy",
        "Recurrent infections",
        "Oral thrush"
      ],
      signs: [
        "Generalized lymphadenopathy",
        "Oral candidiasis",
        "Hairy leukoplakia",
        "Kaposi sarcoma lesions",
        "Wasting",
        "Neurological deficits (toxo, PML)"
      ]
    },
    laboratoryFindings: [
      { name: "HIV antibody/p24", normalRange: "Negative", abnormalInDisease: "Positive (4th gen test)" },
      { name: "HIV viral load", normalRange: "Undetectable", abnormalInDisease: "Detectable (copies/mL)" },
      { name: "CD4 count", normalRange: "500-1500 cells/μL", abnormalInDisease: "<200 = AIDS, opportunistic infections" },
      { name: "CD4%", normalRange: ">29%", abnormalInDisease: "<14% (AIDS)" }
    ],
    imagingFindings: {
      cxr: ["PCP (bilateral interstitial infiltrates)", "TB", "Kaposi pulmonary"],
      ct_brain: ["Toxoplasmosis (ring-enhancing)", "PML (white matter)", "Lymphoma"],
      ct_chest: ["MAC, fungal infections, lymphoma"]
    },
    severity: {
      mild: { description: "CD4 >500, asymptomatic" },
      moderate: { description: "CD4 200-500, symptomatic" },
      severe: { description: "CD4 <200, AIDS-defining illness" }
    },
    modifications: {
      blood: {
        geometry: {
          cd4_count: { factor: 0.2, note: "Severely depleted CD4" },
          hemoglobin: { factor: 0.8, note: "Anemia" }
        }
      },
      lymphatic: {
        structure: {
          lymph_node_size: { factor: 1.5, note: "Generalized lymphadenopathy" }
        }
      },
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.9, note: "If PCP or other OI" }
        }
      },
      brain: {
        physiology: {
          cognitive_function: { factor: 0.7, note: "HIV-associated neurocognitive disorder" }
        }
      }
    }
  },

  // =====================
  // MALARIA
  // ICD-10: B50.9
  // =====================

  B50_9: {
    name: "Plasmodium Falciparum Malaria",
    icd10: "B50.9",
    category: "infectious",
    definition: "Severe malaria caused by P. falciparum with potential for cerebral and severe complications",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "brain", "kidneys", "liver", "spleen"],
    pathophysiology: {
      mechanism: "Infected RBC sequestration in capillaries → microvascular obstruction → organ ischemia",
      molecularBasis: "PfEMP1 cytoadherence; rosetting; endothelial activation; hemolysis"
    },
    clinicalPresentation: {
      symptoms: [
        "Cyclic fever with chills/rigors",
        "Headache",
        "Myalgias",
        "Nausea/vomiting",
        "Jaundice",
        "Dark urine (blackwater fever)"
      ],
      signs: [
        "High fever",
        "Splenomegaly",
        "Hepatomegaly",
        "Jaundice",
        "Altered consciousness (cerebral malaria)",
        "Respiratory distress"
      ]
    },
    laboratoryFindings: [
      { name: "Blood smear", normalRange: "No parasites", abnormalInDisease: "Ring forms, trophozoites, gametocytes" },
      { name: "Rapid diagnostic test", normalRange: "Negative", abnormalInDisease: "Positive (HRP2 antigen)" },
      { name: "Hemoglobin", normalRange: "Normal", abnormalInDisease: "<7 g/dL (severe malaria)" },
      { name: "Parasitemia", normalRange: "0%", abnormalInDisease: ">5% = severe" },
      { name: "Glucose", normalRange: "70-100 mg/dL", abnormalInDisease: "<40 mg/dL (hypoglycemia)" },
      { name: "Creatinine", normalRange: "0.7-1.2 mg/dL", abnormalInDisease: "Elevated (AKI)" },
      { name: "Lactate", normalRange: "<2 mmol/L", abnormalInDisease: ">5 mmol/L (severe)" }
    ],
    imagingFindings: {
      ct_brain: ["Cerebral edema (cerebral malaria)"],
      ultrasound: ["Splenomegaly", "Hepatomegaly"]
    },
    severity: {
      mild: { description: "Uncomplicated, parasitemia <5%, no organ dysfunction" },
      moderate: { description: "Parasitemia 5-10%, anemia" },
      severe: { description: "Cerebral malaria, severe anemia, ARDS, AKI, acidosis" }
    },
    modifications: {
      blood: {
        geometry: {
          hemoglobin: { factor: 0.5, note: "Severe anemia from hemolysis" },
          platelet_count: { factor: 0.6, note: "Thrombocytopenia" }
        },
        pressures: {
          lactate: { factor: 3.0, note: "Lactic acidosis" }
        }
      },
      brain: {
        physiology: {
          consciousness: { factor: 0.4, note: "Cerebral malaria" },
          icp: { factor: 1.5, note: "Cerebral edema" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.4, note: "AKI" }
        }
      },
      spleen: {
        geometry: {
          spleen_volume: { factor: 2.5, note: "Splenomegaly" }
        }
      },
      liver: {
        physiology: {
          bilirubin: { factor: 4.0, note: "Jaundice from hemolysis" }
        }
      }
    }
  },

  // =====================
  // DENGUE
  // ICD-10: A90
  // =====================

  A90: {
    name: "Dengue Fever",
    icd10: "A90",
    category: "infectious",
    definition: "Mosquito-borne viral infection with potential for hemorrhagic complications",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "liver", "heart"],
    pathophysiology: {
      mechanism: "Viral infection of monocytes → cytokine release → increased vascular permeability → plasma leakage",
      molecularBasis: "Antibody-dependent enhancement (secondary infection); T-cell cross-reactivity; NS1 antigen"
    },
    clinicalPresentation: {
      symptoms: [
        "High fever (breakbone fever)",
        "Severe headache (retro-orbital)",
        "Myalgias/arthralgias",
        "Rash",
        "Nausea/vomiting",
        "Abdominal pain"
      ],
      signs: [
        "High fever",
        "Petechiae/ecchymoses",
        "Maculopapular rash",
        "Hepatomegaly",
        "Hypotension (severe)",
        "Ascites/pleural effusion (warning signs)"
      ]
    },
    laboratoryFindings: [
      { name: "NS1 antigen", normalRange: "Negative", abnormalInDisease: "Positive (early, days 1-5)" },
      { name: "Dengue IgM/IgG", normalRange: "Negative", abnormalInDisease: "Positive (after day 5)" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "<100 ×10⁹/L (thrombocytopenia)" },
      { name: "Hematocrit", normalRange: "36-48%", abnormalInDisease: "↑20% above baseline (hemoconcentration)" },
      { name: "AST/ALT", normalRange: "<40 U/L", abnormalInDisease: "Elevated (hepatitis)" }
    ],
    imagingFindings: {
      ultrasound: ["Gallbladder wall thickening", "Ascites", "Pleural effusion"],
      cxr: ["Pleural effusion"]
    },
    severity: {
      mild: { description: "Classic dengue fever, no warning signs" },
      moderate: { description: "Warning signs: abdominal pain, vomiting, hepatomegaly" },
      severe: { description: "Severe plasma leakage, severe bleeding, organ failure" }
    },
    modifications: {
      blood: {
        geometry: {
          platelet_count: { factor: 0.4, note: "Severe thrombocytopenia" },
          hematocrit: { factor: 1.2, note: "Hemoconcentration" }
        }
      },
      liver: {
        physiology: {
          ast_alt: { factor: 5.0, note: "Dengue hepatitis" }
        }
      },
      heart: {
        physiology: {
          blood_pressure: { factor: 0.8, note: "Hypotension from plasma leakage" }
        }
      }
    }
  },

  // =====================
  // VIRAL MENINGITIS
  // ICD-10: A87.9
  // =====================

  A87_9: {
    name: "Viral Meningitis",
    icd10: "A87.9",
    category: "infectious",
    definition: "Aseptic meningitis caused by viral infection, typically self-limited",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Viral invasion of meninges → inflammatory response → meningeal irritation without abscess",
      molecularBasis: "Most common: enteroviruses (coxsackie, echo); HSV, VZV, mumps, HIV"
    },
    clinicalPresentation: {
      symptoms: [
        "Headache (severe)",
        "Fever",
        "Photophobia",
        "Neck stiffness",
        "Nausea/vomiting",
        "Malaise"
      ],
      signs: [
        "Fever",
        "Neck stiffness",
        "Positive Kernig sign",
        "Positive Brudzinski sign",
        "Normal mental status (usually)"
      ]
    },
    laboratoryFindings: [
      { name: "CSF WBC", normalRange: "<5 cells/μL", abnormalInDisease: "Elevated (lymphocytic predominance)" },
      { name: "CSF Protein", normalRange: "15-45 mg/dL", abnormalInDisease: "Normal or mildly elevated" },
      { name: "CSF Glucose", normalRange: "45-80 mg/dL", abnormalInDisease: "Normal (unlike bacterial)" },
      { name: "CSF Gram stain", normalRange: "No organisms", abnormalInDisease: "Negative" },
      { name: "Enterovirus PCR", normalRange: "Negative", abnormalInDisease: "Positive (if enteroviral)" }
    ],
    imagingFindings: {
      ct_brain: ["Usually normal", "Rule out mass/hydrocephalus before LP"],
      mri: ["Meningeal enhancement (if severe)"]
    },
    severity: {
      mild: { description: "Self-limited, supportive care" },
      moderate: { description: "Prolonged symptoms, hospitalization" },
      severe: { description: "Encephalitis features, HSV (requires acyclovir)" }
    },
    modifications: {
      brain: {
        physiology: {
          icp: { factor: 1.2, note: "Mildly elevated" },
          csf_pressure: { factor: 1.3, note: "Elevated opening pressure" }
        }
      }
    }
  },

  // =====================
  // HERPES SIMPLEX ENCEPHALITIS
  // ICD-10: B00.4
  // =====================

  B00_4: {
    name: "Herpes Simplex Encephalitis",
    icd10: "B00.4",
    category: "infectious",
    definition: "Severe viral encephalitis caused by HSV-1, with predilection for temporal lobes",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "HSV-1 reactivation → spread to CNS via trigeminal nerve → hemorrhagic necrosis of temporal lobes",
      molecularBasis: "HSV-1 neurotropism; temporal lobe predilection; necrotizing encephalitis"
    },
    clinicalPresentation: {
      symptoms: [
        "Fever",
        "Headache",
        "Altered mental status",
        "Personality changes",
        "Memory impairment",
        "Seizures",
        "Aphasia"
      ],
      signs: [
        "Fever",
        "Focal neurological deficits",
        "Seizures (temporal lobe)",
        "Decreased consciousness",
        "Behavioral changes"
      ]
    },
    laboratoryFindings: [
      { name: "CSF HSV PCR", normalRange: "Negative", abnormalInDisease: "Positive (gold standard)" },
      { name: "CSF WBC", normalRange: "<5 cells/μL", abnormalInDisease: "Elevated (lymphocytic, may have RBCs)" },
      { name: "CSF Protein", normalRange: "15-45 mg/dL", abnormalInDisease: "Elevated" },
      { name: "CSF Glucose", normalRange: "45-80 mg/dL", abnormalInDisease: "Normal or low" }
    ],
    imagingFindings: {
      mri: ["Temporal lobe hyperintensity (T2/FLAIR)", "Hemorrhage", "Edema", "Bilateral involvement"],
      ct: ["Hypodensity in temporal lobes (late)", "Less sensitive than MRI"]
    },
    severity: {
      mild: { description: "Early presentation, prompt treatment" },
      moderate: { description: "Established encephalitis" },
      severe: { description: "Coma, extensive necrosis, high mortality without treatment" }
    },
    modifications: {
      brain: {
        physiology: {
          consciousness: { factor: 0.4, note: "Altered mental status" },
          icp: { factor: 1.5, note: "Cerebral edema" },
          cbf: { factor: 0.7, note: "Temporal lobe necrosis" }
        },
        structure: {
          temporal_lobe_volume: { factor: 1.3, note: "Edema" },
          hemorrhage: { factor: 3.0, note: "Hemorrhagic necrosis" }
        }
      }
    }
  },

  // =====================
  // HEPATITIS A
  // ICD-10: B15.9
  // =====================

  B15_9: {
    name: "Hepatitis A",
    icd10: "B15.9",
    category: "infectious",
    definition: "Acute viral hepatitis from hepatitis A virus, typically self-limited",
    primaryOrgan: "liver",
    affectedOrgans: ["liver"],
    pathophysiology: {
      mechanism: "Fecal-oral transmission → hepatocyte infection → immune-mediated liver damage → self-limited",
      molecularBasis: "HAV (picornavirus); T-cell mediated hepatocyte injury; no chronicity"
    },
    clinicalPresentation: {
      symptoms: [
        "Prodrome: fatigue, malaise, anorexia",
        "Nausea/vomiting",
        "RUQ pain",
        "Jaundice",
        "Dark urine",
        "Pale stools"
      ],
      signs: [
        "Jaundice",
        "Hepatomegaly (tender)",
        "Fever (early)",
        "Pruritus"
      ]
    },
    laboratoryFindings: [
      { name: "HAV IgM", normalRange: "Negative", abnormalInDisease: "Positive (acute infection)" },
      { name: "HAV IgG", normalRange: "Negative", abnormalInDisease: "Positive (past infection/immunity)" },
      { name: "ALT", normalRange: "<40 U/L", abnormalInDisease: "Elevated (1000-5000 U/L)" },
      { name: "AST", normalRange: "<40 U/L", abnormalInDisease: "Elevated (less than ALT)" },
      { name: "Bilirubin", normalRange: "<1.2 mg/dL", abnormalInDisease: "Elevated (conjugated)" }
    ],
    imagingFindings: {
      ultrasound: ["Hepatomegaly", "Normal or gallbladder wall thickening"]
    },
    severity: {
      mild: { description: "Subclinical or mild symptoms" },
      moderate: { description: "Jaundice, hospitalization" },
      severe: { description: "Fulminant hepatitis (rare, <1%)" }
    },
    modifications: {
      liver: {
        physiology: {
          alt: { factor: 50.0, note: "Markedly elevated" },
          ast: { factor: 30.0, note: "Elevated" },
          bilirubin: { factor: 8.0, note: "Hyperbilirubinemia" }
        },
        geometry: {
          liver_volume: { factor: 1.2, note: "Hepatomegaly" }
        }
      }
    }
  },

  // =====================
  // HEPATITIS B (ACUTE)
  // ICD-10: B16.9
  // =====================

  B16_9: {
    name: "Acute Hepatitis B",
    icd10: "B16.9",
    category: "infectious",
    definition: "Acute viral hepatitis from hepatitis B virus, may progress to chronic infection",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "kidneys"],
    pathophysiology: {
      mechanism: "Bloodborne/sexual transmission → hepatocyte infection → immune-mediated injury → may clear or chronify",
      molecularBasis: "HBV (hepadnavirus); cccDNA persistence; immune response determines outcome"
    },
    clinicalPresentation: {
      symptoms: [
        "Prodrome: fatigue, anorexia",
        "Nausea/vomiting",
        "RUQ pain",
        "Jaundice",
        "Arthralgias",
        "Rash (serum sickness-like)"
      ],
      signs: [
        "Jaundice",
        "Hepatomegaly",
        "Fever",
        "Splenomegaly (some)"
      ]
    },
    laboratoryFindings: [
      { name: "HBsAg", normalRange: "Negative", abnormalInDisease: "Positive (active infection)" },
      { name: "HBV DNA", normalRange: "Undetectable", abnormalInDisease: "Detectable" },
      { name: "HBeAg", normalRange: "Negative", abnormalInDisease: "Positive (high replication)" },
      { name: "Anti-HBc IgM", normalRange: "Negative", abnormalInDisease: "Positive (acute infection)" },
      { name: "ALT", normalRange: "<40 U/L", abnormalInDisease: "Elevated (1000+ U/L)" },
      { name: "Bilirubin", normalRange: "<1.2 mg/dL", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      ultrasound: ["Hepatomegaly", "May show cirrhosis if chronic"]
    },
    severity: {
      mild: { description: "Subclinical (common in children)" },
      moderate: { description: "Symptomatic hepatitis" },
      severe: { description: "Fulminant hepatitis (<1%), chronic progression risk" }
    },
    modifications: {
      liver: {
        physiology: {
          alt: { factor: 40.0, note: "Markedly elevated" },
          ast: { factor: 25.0, note: "Elevated" },
          bilirubin: { factor: 6.0, note: "Hyperbilirubinemia" }
        },
        geometry: {
          liver_volume: { factor: 1.15, note: "Hepatomegaly" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.9, note: "HBV-associated nephropathy possible" }
        }
      }
    }
  },

  // =====================
  // SALMONELLA BACTEREMIA
  // ICD-10: A02.1
  // =====================

  A02_1: {
    name: "Salmonella Bacteremia",
    icd10: "A02.1",
    category: "infectious",
    definition: "Systemic salmonella infection with bacteremia, beyond GI tract involvement",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "gi_tract", "liver", "spleen"],
    pathophysiology: {
      mechanism: "Intestinal invasion → lymphatic spread → bacteremia → seeding of organs",
      molecularBasis: "Non-typhoidal Salmonella; common in immunocompromised; endovascular infection risk"
    },
    clinicalPresentation: {
      symptoms: [
        "Fever (sustained)",
        "Chills/rigors",
        "Diarrhea (may be absent)",
        "Abdominal pain",
        "Myalgias",
        "Headache"
      ],
      signs: [
        "High fever",
        "Tachycardia",
        "Hepatosplenomegaly",
        "Rose spots (typhoid)"
      ]
    },
    laboratoryFindings: [
      { name: "Blood culture", normalRange: "Negative", abnormalInDisease: "Positive for Salmonella spp." },
      { name: "Stool culture", normalRange: "Normal flora", abnormalInDisease: "Salmonella spp. (if GI involvement)" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Normal or low (leukopenia)" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      ct: ["Splenomegaly", "Hepatomegaly", "Mycotic aneurysm (if endovascular)"],
      echo: ["Endocarditis (if endovascular infection)"]
    },
    severity: {
      mild: { description: "Transient bacteremia, cleared" },
      moderate: { description: "Sustained bacteremia, hospitalization" },
      severe: { description: "Endovascular infection, sepsis, metastatic foci" }
    },
    modifications: {
      blood: {
        geometry: {
          wbc_count: { factor: 0.8, note: "Relative leukopenia" }
        },
        proteins: {
          crp: { factor: 5.0, note: "Elevated" }
        }
      },
      spleen: {
        geometry: {
          spleen_volume: { factor: 1.5, note: "Splenomegaly" }
        }
      },
      liver: {
        geometry: {
          liver_volume: { factor: 1.2, note: "Hepatomegaly" }
        }
      }
    }
  }
};

export default INFECTIOUS_DISEASES;
