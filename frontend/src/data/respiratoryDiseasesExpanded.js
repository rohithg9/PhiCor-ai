// ============================================================
// RESPIRATORY DISEASES DATABASE - EXPANDED
// Pulmonary and airway disorders with comprehensive parameters
// ICD-10: J00-J99 (Diseases of the respiratory system)
// ============================================================

export const RESPIRATORY_DISEASES_EXPANDED = {
  // =====================
  // ASTHMA
  // ICD-10: J45 Series
  // =====================

  J45_9: {
    name: "Asthma",
    icd10: "J45.9",
    category: "respiratory",
    definition: "Chronic inflammatory airway disease with reversible obstruction and bronchial hyperresponsiveness",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart"],
    pathophysiology: {
      mechanism: "Airway inflammation → bronchospasm + mucus hypersecretion + airway remodeling → variable airflow obstruction",
      molecularBasis: "Th2-mediated inflammation, IgE, eosinophils, mast cell degranulation; IL-4, IL-5, IL-13"
    },
    clinicalPresentation: {
      symptoms: [
        "Episodic wheezing",
        "Shortness of breath",
        "Chest tightness",
        "Cough (especially nocturnal)",
        "Symptoms worse with triggers (allergens, exercise, cold air)"
      ],
      signs: [
        "Expiratory wheezing",
        "Prolonged expiratory phase",
        "Use of accessory muscles (severe)",
        "Tachypnea during exacerbation",
        "Pulsus paradoxus (severe)"
      ]
    },
    laboratoryFindings: [
      { name: "Spirometry FEV1/FVC", normalRange: ">0.70", abnormalInDisease: "<0.70 (obstruction)" },
      { name: "Bronchodilator response", normalRange: "<12%", abnormalInDisease: "≥12% AND ≥200mL increase in FEV1" },
      { name: "Peak flow variability", normalRange: "<10%", abnormalInDisease: ">20% diurnal variation" },
      { name: "FeNO", normalRange: "<25 ppb", abnormalInDisease: ">50 ppb suggests eosinophilic inflammation" },
      { name: "Blood eosinophils", normalRange: "<300/μL", abnormalInDisease: "Often elevated in allergic asthma" },
      { name: "IgE", normalRange: "<100 IU/mL", abnormalInDisease: "Elevated in allergic asthma" }
    ],
    imagingFindings: {
      cxr: ["Usually normal", "Hyperinflation during exacerbation", "Rule out other diagnoses"],
      ct: ["Bronchial wall thickening", "Air trapping on expiratory images"]
    },
    severity: {
      mild: { description: "Intermittent: symptoms ≤2 days/week, FEV1 ≥80%" },
      moderate: { description: "Persistent: daily symptoms, some limitation, FEV1 60-80%" },
      severe: { description: "Continuous symptoms, frequent exacerbations, FEV1 <60%" }
    },
    modifications: {
      lungs: {
        physiology: {
          fev1: { factor: 0.7, note: "Reduced during exacerbation" },
          fev1_fvc_ratio: { factor: 0.85, note: "Obstructive pattern" },
          peak_flow: { factor: 0.6, note: "Reduced and variable" },
          oxygen_saturation: { factor: 0.96, note: "Mildly reduced in exacerbation" }
        },
        structure: {
          airway_resistance: { factor: 2.5, note: "Increased from bronchospasm" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.15, note: "Tachycardia during exacerbation" }
        }
      }
    },
    diagnosticCriteria: {
      name: "GINA Guidelines",
      requirements: {
        symptoms: "Variable respiratory symptoms (wheeze, SOB, chest tightness, cough)",
        variability: "Variable expiratory airflow limitation",
        confirmation: "Bronchodilator reversibility (≥12% AND ≥200mL FEV1 increase) OR positive methacholine challenge OR peak flow variability >10%"
      }
    },
    differentialDiagnosis: [
      { condition: "COPD", distinguishing: "Smoking history, older age, less reversibility, progressive" },
      { condition: "Vocal cord dysfunction", distinguishing: "Inspiratory stridor, flattened inspiratory loop" },
      { condition: "Heart failure", distinguishing: "Orthopnea, edema, elevated BNP, CXR findings" },
      { condition: "GERD", distinguishing: "Heartburn, nocturnal symptoms, response to PPI" }
    ],
    treatment: {
      reliever: [
        { name: "SABA (Short-acting beta-agonist)", examples: "Albuterol", indication: "Quick relief", evidence: "IA" },
        { name: "ICS-formoterol PRN", indication: "Preferred reliever in GINA 2023", evidence: "IA" }
      ],
      controller: [
        { name: "ICS (Inhaled corticosteroids)", examples: "Budesonide, Fluticasone", indication: "First-line controller", evidence: "IA" },
        { name: "ICS-LABA", examples: "Budesonide-formoterol, Fluticasone-salmeterol", indication: "Step 3+", evidence: "IA" },
        { name: "LAMA", examples: "Tiotropium", indication: "Add-on for uncontrolled", evidence: "IA" }
      ],
      severe: [
        { name: "Biologics", examples: "Omalizumab (anti-IgE), Dupilumab (anti-IL4/13), Benralizumab (anti-IL5)", indication: "Severe eosinophilic/allergic", evidence: "IA" }
      ],
      exacerbation: [
        { name: "Systemic corticosteroids", dose: "Prednisone 40-50mg × 5-7 days", evidence: "IA" },
        { name: "Oxygen", indication: "SpO2 target 93-95%", evidence: "IA" }
      ]
    },
    riskStratification: {
      mortality: "Low with proper treatment; severe exacerbations life-threatening",
      exacerbationRisk: "Previous severe exacerbation, poor control, high SABA use",
      control: "ACQ or ACT scores guide treatment adjustment"
    }
  },

  // =====================
  // PNEUMONIA
  // ICD-10: J18 Series
  // =====================

  J18_9: {
    name: "Community-Acquired Pneumonia (CAP)",
    icd10: "J18.9",
    category: "respiratory",
    definition: "Acute infection of lung parenchyma acquired outside hospital setting",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart", "blood"],
    pathophysiology: {
      mechanism: "Pathogen invasion → alveolar inflammation → exudate filling → impaired gas exchange",
      molecularBasis: "Most common: S. pneumoniae, H. influenzae, atypicals (Mycoplasma, Chlamydia), viruses"
    },
    clinicalPresentation: {
      symptoms: [
        "Cough (productive or dry)",
        "Fever and chills",
        "Dyspnea",
        "Pleuritic chest pain",
        "Fatigue",
        "Myalgias"
      ],
      signs: [
        "Fever (may be absent in elderly)",
        "Tachypnea",
        "Tachycardia",
        "Crackles/rales on auscultation",
        "Bronchial breath sounds",
        "Dullness to percussion",
        "Egophony"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Elevated (leukocytosis) or low (poor prognosis)" },
      { name: "Procalcitonin", normalRange: "<0.1 ng/mL", abnormalInDisease: ">0.25 suggests bacterial" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Elevated" },
      { name: "Blood cultures", normalRange: "Negative", abnormalInDisease: "Positive in 10-20% bacteremic cases" },
      { name: "ABG PaO2", normalRange: "80-100 mmHg", abnormalInDisease: "Reduced (hypoxemia)" },
      { name: "BUN", normalRange: "7-20 mg/dL", abnormalInDisease: ">20 mg/dL (CURB-65 criterion)" }
    ],
    imagingFindings: {
      cxr: ["Lobar consolidation", "Bronchopneumonia pattern", "Interstitial infiltrates (atypical)", "Parapneumonic effusion"],
      ct: ["More sensitive for early/subtle disease", "Ground-glass opacities", "Tree-in-bud (bronchiolitis)"]
    },
    severity: {
      mild: { description: "CURB-65 0-1, outpatient treatment" },
      moderate: { description: "CURB-65 2, consider hospitalization" },
      severe: { description: "CURB-65 3-5, ICU consideration, high mortality" }
    },
    modifications: {
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.9, note: "Hypoxemia from V/Q mismatch" },
          fev1: { factor: 0.85, note: "Mildly reduced" }
        },
        structure: {
          alveolar_density: { factor: 1.5, note: "Consolidation" }
        }
      },
      blood: {
        geometry: {
          wbc_count: { factor: 1.8, note: "Leukocytosis" }
        },
        cellular: {
          neutrophils: { factor: 1.3, note: "Left shift" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.25, note: "Tachycardia from fever/hypoxia" }
        }
      }
    },
    diagnosticCriteria: {
      name: "Clinical + Radiographic + Microbiologic",
      requirements: {
        clinical: "Cough, fever, dyspnea, pleuritic pain",
        radiographic: "Infiltrate on CXR or CT",
        severity: "CURB-65 or PSI for mortality risk"
      }
    },
    differentialDiagnosis: [
      { condition: "Heart failure", distinguishing: "BNP elevated, bilateral infiltrates, cardiomegaly" },
      { condition: "PE", distinguishing: "Wedge-shaped infarct, elevated D-dimer, CT angiography" },
      { condition: "Lung cancer", distinguishing: "Mass lesion, risk factors, biopsy" },
      { condition: "TB", distinguishing: "Apical cavitation, AFB smear, endemic exposure" }
    ],
    treatment: {
      cap: [
        { name: "Amoxicillin + macrolide", indication: "Outpatient mild CAP", evidence: "IA" },
        { name: "Respiratory fluoroquinolone", examples: "Levofloxacin, Moxifloxacin", indication: "Alternative or inpatient", evidence: "IA" },
        { name: "Beta-lactam + macrolide", indication: "Inpatient non-ICU", evidence: "IA" }
      ],
      severeCap: [
        { name: "Beta-lactam + macrolide + consider MRSA/Pseudomonas coverage", indication: "ICU", evidence: "IA" }
      ],
      hap_vap: [
        { name: "Antipseudomonal beta-lactam + anti-MRSA agent", indication: "HAP/VAP", evidence: "IA" }
      ],
      supportive: [
        { name: "Oxygen", indication: "SpO2 target ≥92%", evidence: "IA" },
        { name: "IV fluids", indication: "Dehydration/sepsis", evidence: "IA" }
      ]
    },
    riskStratification: {
      curb65: "0-1: outpatient; 2: consider admission; 3+: ICU consideration",
      mortality: "CAP: 5-10% overall; ICU: 30-50%",
      prognosis: "Most improve in 48-72h; failure suggests resistant organism or complication"
    }
  },

  // =====================
  // PULMONARY EMBOLISM
  // ICD-10: I26 Series
  // =====================

  I26_9: {
    name: "Pulmonary Embolism (PE)",
    icd10: "I26.9",
    category: "respiratory",
    definition: "Obstruction of pulmonary arteries by thrombus, usually from deep vein thrombosis",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart", "blood"],
    pathophysiology: {
      mechanism: "Thrombus from DVT → embolizes to pulmonary arteries → V/Q mismatch + increased RV afterload",
      molecularBasis: "Virchow's triad: stasis, endothelial injury, hypercoagulability"
    },
    clinicalPresentation: {
      symptoms: [
        "Sudden dyspnea",
        "Pleuritic chest pain",
        "Cough (may be hemoptysis)",
        "Syncope (massive PE)",
        "Leg swelling/pain (concurrent DVT)"
      ],
      signs: [
        "Tachypnea",
        "Tachycardia",
        "Hypoxia",
        "Hypotension (massive PE)",
        "Elevated JVP",
        "Loud P2",
        "DVT signs (unilateral leg edema)"
      ]
    },
    laboratoryFindings: [
      { name: "D-dimer", normalRange: "<0.5 μg/mL", abnormalInDisease: "Elevated (sensitive but not specific)" },
      { name: "Troponin", normalRange: "Normal", abnormalInDisease: "Elevated indicates RV strain" },
      { name: "BNP/NT-proBNP", normalRange: "Normal", abnormalInDisease: "Elevated indicates RV dysfunction" },
      { name: "ABG", normalRange: "Normal", abnormalInDisease: "Hypoxemia, hypocapnia, respiratory alkalosis" }
    ],
    imagingFindings: {
      ctpa: ["Intraluminal filling defect (gold standard)", "Saddle embolus", "RV dilation"],
      echocardiogram: ["RV dilation", "McConnell sign", "D-shaped septum", "TR"],
      vq_scan: ["High probability: ≥2 segmental mismatches", "Used if CT contraindicated"],
      lowerExtremityDoppler: ["DVT in 50% of PE patients"]
    },
    severity: {
      mild: { description: "Low risk: hemodynamically stable, normal RV, low PESI" },
      moderate: { description: "Intermediate risk: stable but RV dysfunction or elevated biomarkers" },
      severe: { description: "High risk (massive): hypotension, shock, cardiac arrest" }
    },
    modifications: {
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.88, note: "Hypoxemia from V/Q mismatch" }
        },
        pressures: {
          pulmonary_artery_pressure: { factor: 1.8, note: "Pulmonary hypertension" }
        }
      },
      heart: {
        geometry: {
          rv_volume: { factor: 1.4, note: "RV dilation from pressure overload" }
        },
        physiology: {
          heart_rate: { factor: 1.3, note: "Tachycardia" },
          blood_pressure: { factor: 0.85, note: "Hypotension in massive PE" }
        }
      },
      blood: {
        pressures: {
          d_dimer: { factor: 10.0, note: "Markedly elevated" }
        }
      }
    },
    diagnosticCriteria: {
      name: "PERC/Wells + CTPA",
      requirements: {
        perc: "If all PERC criteria negative and low clinical probability, no further testing needed",
        wells: "Low (<2), Moderate (2-6), High (>6) probability",
        diagnosis: "CT pulmonary angiography (gold standard); V/Q scan if CKD"
      }
    },
    differentialDiagnosis: [
      { condition: "Pneumonia", distinguishing: "Productive cough, fever, consolidation on CXR" },
      { condition: "Heart failure", distinguishing: "Elevated BNP, cardiomegaly, peripheral edema" },
      { condition: "Pneumothorax", distinguishing: "Sudden onset, absent breath sounds, CXR diagnostic" },
      { condition: "Aortic dissection", distinguishing: "Tearing pain, blood pressure differential, CT angiography" }
    ],
    treatment: {
      anticoagulation: [
        { name: "LMWH", examples: "Enoxaparin", indication: "Initial anticoagulation", evidence: "IA" },
        { name: "DOACs", examples: "Rivaroxaban, Apixaban", indication: "Preferred for most patients", evidence: "IA" },
        { name: "Warfarin", indication: "Alternative, especially with APS", evidence: "IA" }
      ],
      massive: [
        { name: "Thrombolysis", examples: "tPA 100mg over 2h", indication: "Massive PE with hemodynamic instability", evidence: "IA" },
        { name: "Surgical embolectomy", indication: "Contraindication to lysis", evidence: "IB" },
        { name: "Catheter-directed therapy", indication: "Intermediate-high risk", evidence: "IB" }
      ],
      supportive: [
        { name: "Oxygen", indication: "Hypoxemia", evidence: "IA" },
        { name: "Hemodynamic support", indication: "RV failure", evidence: "IA" }
      ]
    },
    riskStratification: {
      pesi: "sPESI or PESI score stratifies mortality risk",
      mortality: "Low risk: 1%; Intermediate: 3-15%; High/massive: 15-65%",
      duration: "3 months minimum; longer if unprovoked or recurrent"
    }
  },

  // =====================
  // ARDS
  // ICD-10: J80
  // =====================

  J80: {
    name: "Acute Respiratory Distress Syndrome (ARDS)",
    icd10: "J80",
    category: "respiratory",
    definition: "Acute diffuse inflammatory lung injury with severe hypoxemia and bilateral infiltrates",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart", "kidneys", "blood"],
    pathophysiology: {
      mechanism: "Diffuse alveolar damage → pulmonary edema → surfactant dysfunction → atelectasis → refractory hypoxemia",
      molecularBasis: "Inflammatory cytokines (IL-1, IL-6, TNF-α), neutrophil infiltration, capillary leak"
    },
    clinicalPresentation: {
      symptoms: [
        "Acute onset severe dyspnea",
        "Hypoxemia refractory to O2",
        "Usually within 1 week of insult"
      ],
      signs: [
        "Severe respiratory distress",
        "Tachypnea",
        "Cyanosis",
        "Diffuse crackles",
        "Use of accessory muscles"
      ]
    },
    laboratoryFindings: [
      { name: "PaO2/FiO2 ratio", normalRange: ">300", abnormalInDisease: "<300 (mild), <200 (moderate), <100 (severe)" },
      { name: "ABG", normalRange: "Normal", abnormalInDisease: "Severe hypoxemia, may have hypercapnia" },
      { name: "Lactate", normalRange: "<2 mmol/L", abnormalInDisease: "Elevated (tissue hypoxia)" }
    ],
    imagingFindings: {
      cxr: ["Bilateral opacities", "Not fully explained by effusions/atelectasis/nodules"],
      ct: ["Diffuse ground-glass opacities", "Consolidation", "Dependent distribution"]
    },
    severity: {
      mild: { description: "P/F 200-300 with PEEP ≥5" },
      moderate: { description: "P/F 100-200 with PEEP ≥5" },
      severe: { description: "P/F <100 with PEEP ≥5, mortality >40%" }
    },
    modifications: {
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.8, note: "Severe hypoxemia" },
          fev1: { factor: 0.5, note: "Severely reduced compliance" }
        },
        structure: {
          alveolar_density: { factor: 2.0, note: "Diffuse alveolar damage" }
        },
        pressures: {
          pulmonary_artery_pressure: { factor: 1.5, note: "Elevated from hypoxic vasoconstriction" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.3, note: "Tachycardia" },
          cardiac_output: { factor: 0.85, note: "May be reduced" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.7, note: "AKI common in ARDS" }
        }
      }
    },
    diagnosticCriteria: {
      name: "Berlin Definition (2012)",
      requirements: {
        timing: "Within 1 week of known insult or new/worsening symptoms",
        imaging: "Bilateral opacities not explained by effusion/collapse/nodules",
        origin: "Not fully explained by heart failure/fluid overload",
        oxygenation: "P/F ratio <300 with PEEP ≥5 cmH2O"
      }
    },
    differentialDiagnosis: [
      { condition: "Cardiogenic pulmonary edema", distinguishing: "Elevated BNP, cardiomegaly, responds to diuresis" },
      { condition: "Diffuse alveolar hemorrhage", distinguishing: "Hemoptysis, falling Hgb, bronchoscopy diagnostic" },
      { condition: "Acute eosinophilic pneumonia", distinguishing: "BAL eosinophilia >25%, responds to steroids" },
      { condition: "TRALI", distinguishing: "Within 6h of transfusion, resolves quickly" }
    ],
    treatment: {
      ventilation: [
        { name: "Low tidal volume (6 mL/kg IBW)", indication: "Lung-protective ventilation", evidence: "IA" },
        { name: "Plateau pressure <30 cmH2O", indication: "Prevent VILI", evidence: "IA" },
        { name: "PEEP titration", indication: "Optimize oxygenation", evidence: "IA" }
      ],
      adjunctive: [
        { name: "Prone positioning", indication: "P/F <150, 16+ hours/day", evidence: "IA" },
        { name: "Conservative fluid strategy", indication: "After shock resolved", evidence: "IA" },
        { name: "Neuromuscular blockade", indication: "Severe ARDS, early (48h)", evidence: "IB" }
      ],
      rescue: [
        { name: "ECMO", indication: "Refractory hypoxemia despite optimal ventilation", evidence: "IB" },
        { name: "Inhaled nitric oxide", indication: "Refractory hypoxemia", evidence: "IIB" }
      ]
    },
    riskStratification: {
      mortality: "Mild: 27%; Moderate: 32%; Severe: 45%",
      longTerm: "Survivors may have persistent pulmonary dysfunction",
      etiology: "Sepsis, aspiration, pneumonia most common triggers"
    }
  },

  // =====================
  // PULMONARY FIBROSIS
  // ICD-10: J84.1
  // =====================

  J84_1: {
    name: "Idiopathic Pulmonary Fibrosis (IPF)",
    icd10: "J84.1",
    category: "respiratory",
    definition: "Progressive fibrosing interstitial pneumonia of unknown cause with UIP pattern",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart"],
    pathophysiology: {
      mechanism: "Repetitive alveolar injury → aberrant wound healing → fibroblast proliferation → progressive fibrosis",
      molecularBasis: "TGF-β, PDGF, fibroblast foci, honeycomb remodeling; telomere shortening in some"
    },
    clinicalPresentation: {
      symptoms: [
        "Progressive exertional dyspnea",
        "Dry cough",
        "Fatigue",
        "Weight loss (advanced)"
      ],
      signs: [
        "Bibasilar velcro crackles",
        "Clubbing (50%)",
        "Cyanosis (late)",
        "Signs of cor pulmonale (late)"
      ]
    },
    laboratoryFindings: [
      { name: "Spirometry", normalRange: "Normal", abnormalInDisease: "Restrictive pattern (reduced FVC, normal/high FEV1/FVC)" },
      { name: "DLCO", normalRange: ">80% predicted", abnormalInDisease: "Reduced (often earliest abnormality)" },
      { name: "6MWT", normalRange: ">400m", abnormalInDisease: "Reduced distance, desaturation" },
      { name: "KL-6", normalRange: "<1000 U/mL", abnormalInDisease: "Elevated (biomarker)" }
    ],
    imagingFindings: {
      hrct: ["UIP pattern: basal/subpleural predominant", "Honeycombing", "Traction bronchiectasis", "Reticulation", "Minimal ground-glass"],
      cxr: ["Bilateral lower lobe reticular opacities", "Reduced lung volumes"]
    },
    severity: {
      mild: { description: "FVC >75%, DLCO >65%, GAP stage I" },
      moderate: { description: "FVC 50-75%, DLCO 36-65%, GAP stage II" },
      severe: { description: "FVC <50%, DLCO <36%, GAP stage III, consider transplant" }
    },
    modifications: {
      lungs: {
        physiology: {
          fev1: { factor: 0.7, note: "Reduced (restrictive)" },
          oxygen_saturation: { factor: 0.92, note: "Desaturates with exertion" },
          dlco: { factor: 0.5, note: "Reduced gas transfer" }
        },
        geometry: {
          lung_volume: { factor: 0.7, note: "Reduced lung volumes" }
        },
        structure: {
          collagen_content: { factor: 3.0, note: "Extensive fibrosis" }
        }
      },
      heart: {
        geometry: {
          rv_volume: { factor: 1.2, note: "Cor pulmonale in advanced disease" }
        },
        pressures: {
          pulmonary_artery_pressure: { factor: 1.4, note: "Pulmonary hypertension" }
        }
      }
    },
    diagnosticCriteria: {
      name: "ATS/ERS Guidelines",
      requirements: {
        clinical: "Symptoms (dyspnea, cough) + bibasilar crackles + clubbing",
        hrct: "Definite, probable, or possible UIP pattern",
        exclusions: "Rule out CTD, hypersensitivity pneumonitis, drug-induced"
      }
    },
    differentialDiagnosis: [
      { condition: "Hypersensitivity pneumonitis", distinguishing: "Exposure history, upper lobe predominant, air trapping" },
      { condition: "CTD-ILD", distinguishing: "Joint/skin/muscle findings, autoantibodies" },
      { condition: "Asbestosis", distinguishing: "Occupational exposure, pleural plaques" },
      { condition: "NSIP", distinguishing: "Ground-glass predominant, subpleural sparing, better prognosis" }
    ],
    treatment: {
      antifibrotic: [
        { name: "Nintedanib", indication: "Slows FVC decline", evidence: "IA" },
        { name: "Pirfenidone", indication: "Slows FVC decline", evidence: "IA" }
      ],
      supportive: [
        { name: "Pulmonary rehabilitation", indication: "All patients", evidence: "IA" },
        { name: "Supplemental oxygen", indication: "Resting or exertional hypoxemia", evidence: "IA" },
        { name: "Vaccinations", indication: "Influenza, pneumococcal", evidence: "IA" }
      ],
      definitive: [
        { name: "Lung transplant", indication: "Progressive disease, age <70", evidence: "IA" }
      ]
    },
    riskStratification: {
      mortality: "Median survival 3-5 years from diagnosis",
      gap: "GAP index predicts mortality (Gender, Age, Physiology)",
      exacerbation: "Acute exacerbations carry 50% mortality"
    }
  },

  // =====================
  // SLEEP APNEA
  // ICD-10: G47.3
  // =====================

  G47_33: {
    name: "Obstructive Sleep Apnea (OSA)",
    icd10: "G47.33",
    category: "respiratory",
    definition: "Recurrent upper airway obstruction during sleep causing apneas, hypopneas, and oxygen desaturation",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart", "brain"],
    pathophysiology: {
      mechanism: "Pharyngeal collapse during sleep → apnea → hypoxemia + hypercapnia → arousal → sleep fragmentation",
      molecularBasis: "Anatomic narrowing (obesity, craniofacial), reduced muscle tone, ventilatory control instability"
    },
    clinicalPresentation: {
      symptoms: [
        "Loud snoring",
        "Witnessed apneas",
        "Excessive daytime sleepiness",
        "Morning headaches",
        "Nocturia",
        "Cognitive impairment"
      ],
      signs: [
        "Obesity (BMI >30)",
        "Large neck circumference (>17 inches men, >16 women)",
        "Crowded oropharynx (Mallampati III-IV)",
        "Retrognathia",
        "Hypertension (often resistant)"
      ]
    },
    laboratoryFindings: [
      { name: "Polysomnography AHI", normalRange: "<5 events/hour", abnormalInDisease: "≥5 = OSA; ≥15 moderate; ≥30 severe" },
      { name: "Oxygen desaturation index", normalRange: "<5/hour", abnormalInDisease: "Elevated" },
      { name: "Sleep efficiency", normalRange: ">85%", abnormalInDisease: "Reduced" }
    ],
    imagingFindings: {
      not_routine: ["MRI can show pharyngeal narrowing", "Cephalometry for surgical planning"]
    },
    severity: {
      mild: { description: "AHI 5-15, minimal symptoms" },
      moderate: { description: "AHI 15-30, daytime sleepiness" },
      severe: { description: "AHI >30, significant cardiovascular risk" }
    },
    modifications: {
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.85, note: "Nocturnal desaturation" }
        }
      },
      heart: {
        physiology: {
          blood_pressure: { factor: 1.2, note: "Hypertension from sympathetic activation" },
          heart_rate: { factor: 1.1, note: "Variable with apneas" }
        },
        geometry: {
          lv_mass: { factor: 1.15, note: "LVH from chronic hypertension" }
        }
      },
      brain: {
        physiology: {
          glucose_consumption: { factor: 0.9, note: "Cognitive effects from hypoxia" }
        }
      }
    }
  }
};

export default RESPIRATORY_DISEASES_EXPANDED;
