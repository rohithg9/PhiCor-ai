// ============================================================
// RESPIRATORY DISEASES DATABASE - PART 3: Extended Coverage
// Additional ICD-10 codes for comprehensive respiratory disease coverage
// Focus: Pneumonia, Bronchitis, Pleural diseases, Additional lung conditions
// ============================================================

export const RESPIRATORY_DISEASES_PART3 = {
  // =====================
  // PNEUMONIA - COMMON TYPES
  // ICD-10: J10-J18 Series
  // =====================

  J13: {
    name: "Pneumonia due to Streptococcus pneumoniae",
    icd10: "J13",
    category: "respiratory",
    definition: "Community-acquired pneumonia caused by S. pneumoniae, the most common bacterial cause",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Bacterial invasion of alveoli → inflammatory response → alveolar consolidation → impaired gas exchange",
      molecularBasis: "Pneumolysin toxin, capsular polysaccharide virulence factors, neutrophil recruitment"
    },
    clinicalPresentation: {
      symptoms: [
        "Acute onset fever and chills",
        "Productive cough with rust-colored sputum",
        "Pleuritic chest pain",
        "Dyspnea",
        "Malaise",
        "May have rapid progression"
      ],
      signs: [
        "Fever (often high)",
        "Tachypnea",
        "Tachycardia",
        "Crackles/bronchial breath sounds",
        "Dullness to percussion",
        "Increased tactile fremitus",
        "Egophony"
      ]
    },
    laboratoryFindings: [
      { name: "WBC count", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Elevated (leukocytosis), may be low in severe sepsis" },
      { name: "Procalcitonin", normalRange: "<0.5 ng/mL", abnormalInDisease: "Elevated (supports bacterial etiology)" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Significantly elevated" },
      { name: "ABG", normalRange: "PaO2 80-100 mmHg", abnormalInDisease: "Hypoxemia" },
      { name: "Blood cultures", normalRange: "No growth", abnormalInDisease: "S. pneumoniae may grow" },
      { name: "Urinary antigen", normalRange: "Negative", abnormalInDisease: "Positive for pneumococcal antigen" }
    ],
    imagingFindings: {
      chestXray: ["Lobar consolidation (classic)", "Air bronchograms", "Parapneumonic effusion possible"],
      ctChest: ["Dense consolidation", "Ground-glass opacity surrounding", "Effusion"]
    },
    severity: {
      mild: { description: "CURB-65 0-1, outpatient treatment" },
      moderate: { description: "CURB-65 2, consider hospitalization" },
      severe: { description: "CURB-65 3-5, ICU admission, high mortality risk" }
    }
  },

  J14: {
    name: "Pneumonia due to Haemophilus influenzae",
    icd10: "J14",
    category: "respiratory",
    definition: "Bacterial pneumonia caused by H. influenzae, common in COPD patients",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Bacterial colonization and invasion of lower respiratory tract, particularly in compromised hosts",
      molecularBasis: "Biofilm formation, IgA protease, adherence factors"
    },
    clinicalPresentation: {
      symptoms: [
        "Gradual onset cough",
        "Purulent sputum",
        "Fever",
        "Dyspnea",
        "Often in setting of COPD exacerbation"
      ],
      signs: [
        "Fever",
        "Tachypnea",
        "Crackles",
        "Signs of underlying lung disease"
      ]
    },
    laboratoryFindings: [
      { name: "WBC count", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Elevated" },
      { name: "Sputum culture", normalRange: "Normal flora", abnormalInDisease: "H. influenzae isolated" },
      { name: "Procalcitonin", normalRange: "<0.5 ng/mL", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      chestXray: ["Patchy infiltrates", "Bronchopneumonia pattern", "May see underlying COPD changes"],
      ctChest: ["Bronchocentric consolidation", "Tree-in-bud pattern"]
    },
    severity: {
      mild: { description: "Stable vital signs, able to take oral medications" },
      moderate: { description: "Requiring hospitalization" },
      severe: { description: "Respiratory failure, sepsis" }
    }
  },

  J15_0: {
    name: "Pneumonia due to Klebsiella pneumoniae",
    icd10: "J15.0",
    category: "respiratory",
    definition: "Severe bacterial pneumonia often in alcoholics and debilitated patients",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Necrotizing infection with abscess formation, classically in upper lobes",
      molecularBasis: "Polysaccharide capsule, siderophores, antibiotic resistance mechanisms"
    },
    clinicalPresentation: {
      symptoms: [
        "Acute onset high fever",
        "Rigors",
        "Productive cough with currant jelly sputum",
        "Severe dyspnea",
        "Pleuritic chest pain"
      ],
      signs: [
        "Toxic appearance",
        "High fever",
        "Tachypnea",
        "Consolidation signs",
        "May have bulging fissure sign"
      ]
    },
    laboratoryFindings: [
      { name: "WBC count", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Often very high or low (sepsis)" },
      { name: "Lactate", normalRange: "<2 mmol/L", abnormalInDisease: "Elevated in sepsis" },
      { name: "Sputum culture", normalRange: "Normal flora", abnormalInDisease: "Klebsiella species" }
    ],
    imagingFindings: {
      chestXray: ["Dense lobar consolidation", "Bulging fissure (swollen lobe)", "Cavitation", "Upper lobe predilection"],
      ctChest: ["Necrotizing pneumonia", "Abscess formation", "Empyema"]
    },
    severity: {
      mild: { description: "Rare - usually presents as moderate-severe" },
      moderate: { description: "Lobar pneumonia without complications" },
      severe: { description: "Necrotizing, abscess, empyema, septic shock" }
    }
  },

  J15_1: {
    name: "Pneumonia due to Pseudomonas",
    icd10: "J15.1",
    category: "respiratory",
    definition: "Hospital-acquired or ventilator-associated pneumonia due to Pseudomonas aeruginosa",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Opportunistic infection in immunocompromised or mechanically ventilated patients",
      molecularBasis: "Biofilm formation, multiple drug resistance mechanisms, elastase, exotoxins"
    },
    clinicalPresentation: {
      symptoms: [
        "Fever",
        "Increased ventilator requirements",
        "Purulent secretions",
        "Worsening oxygenation",
        "Often in ICU setting"
      ],
      signs: [
        "Fever or hypothermia",
        "Increased purulent secretions",
        "New infiltrate on imaging",
        "Leukocytosis or leukopenia"
      ]
    },
    laboratoryFindings: [
      { name: "WBC count", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Elevated or depressed" },
      { name: "Procalcitonin", normalRange: "<0.5 ng/mL", abnormalInDisease: "Elevated" },
      { name: "BAL culture", normalRange: "No pathogen", abnormalInDisease: "Pseudomonas aeruginosa" }
    ],
    imagingFindings: {
      chestXray: ["New or progressive infiltrates", "Multilobar involvement common"],
      ctChest: ["Consolidation", "Nodular opacities", "Cavitation possible"]
    },
    severity: {
      mild: { description: "Rare in Pseudomonas pneumonia" },
      moderate: { description: "Localized disease" },
      severe: { description: "Usually severe - high mortality, bacteremia, sepsis" }
    }
  },

  J15_9: {
    name: "Unspecified Bacterial Pneumonia",
    icd10: "J15.9",
    category: "respiratory",
    definition: "Bacterial pneumonia where the specific organism is not identified",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Bacterial infection of lung parenchyma",
      molecularBasis: "Variable depending on causative organism"
    },
    clinicalPresentation: {
      symptoms: [
        "Cough (often productive)",
        "Fever",
        "Dyspnea",
        "Pleuritic chest pain",
        "Malaise"
      ],
      signs: [
        "Fever",
        "Tachypnea",
        "Crackles",
        "Consolidation signs"
      ]
    },
    laboratoryFindings: [
      { name: "WBC count", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Usually elevated" },
      { name: "Procalcitonin", normalRange: "<0.5 ng/mL", abnormalInDisease: "Elevated (supports bacterial)" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      chestXray: ["Infiltrates", "Consolidation", "Variable pattern"],
      ctChest: ["Better characterization of infiltrates"]
    },
    severity: {
      mild: { description: "CURB-65 0-1" },
      moderate: { description: "CURB-65 2" },
      severe: { description: "CURB-65 3+" }
    }
  },

  J12_9: {
    name: "Viral Pneumonia, Unspecified",
    icd10: "J12.9",
    category: "respiratory",
    definition: "Pneumonia caused by viral pathogens (influenza, RSV, adenovirus, etc.)",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Viral invasion of respiratory epithelium → inflammatory response → interstitial and alveolar damage",
      molecularBasis: "Viral cytopathic effect, immune-mediated injury"
    },
    clinicalPresentation: {
      symptoms: [
        "Gradual onset",
        "Dry or minimally productive cough",
        "Fever (may be lower than bacterial)",
        "Myalgias",
        "Headache",
        "Rhinorrhea (upper respiratory symptoms)"
      ],
      signs: [
        "Low-grade fever",
        "Diffuse crackles",
        "Wheezing",
        "Less focal findings than bacterial"
      ]
    },
    laboratoryFindings: [
      { name: "WBC count", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Normal or low (lymphopenia)" },
      { name: "Procalcitonin", normalRange: "<0.5 ng/mL", abnormalInDisease: "Usually <0.25 (helps rule out bacterial)" },
      { name: "Respiratory viral panel", normalRange: "Negative", abnormalInDisease: "Positive for specific virus" }
    ],
    imagingFindings: {
      chestXray: ["Interstitial pattern", "Bilateral diffuse infiltrates", "Less focal than bacterial"],
      ctChest: ["Ground-glass opacities", "Interstitial thickening", "Crazy-paving pattern"]
    },
    severity: {
      mild: { description: "Minimal hypoxia, supportive care only" },
      moderate: { description: "Hypoxia requiring supplemental O2" },
      severe: { description: "ARDS, respiratory failure, ICU" }
    }
  },

  // =====================
  // BRONCHITIS
  // ICD-10: J20, J40-J42 Series
  // =====================

  J20_9: {
    name: "Acute Bronchitis, Unspecified",
    icd10: "J20.9",
    category: "respiratory",
    definition: "Acute inflammation of the bronchial tree, usually viral, self-limiting",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Viral infection of bronchial epithelium → inflammation → increased mucus production → cough",
      molecularBasis: "Usually viral (rhinovirus, coronavirus, RSV), occasionally bacterial"
    },
    clinicalPresentation: {
      symptoms: [
        "Cough (may persist 2-3 weeks)",
        "Sputum production (clear to purulent)",
        "Low-grade fever",
        "Chest discomfort",
        "Upper respiratory symptoms"
      ],
      signs: [
        "Low-grade or no fever",
        "Rhonchi",
        "Wheezing",
        "No signs of consolidation"
      ]
    },
    laboratoryFindings: [
      { name: "WBC count", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Usually normal" },
      { name: "Procalcitonin", normalRange: "<0.5 ng/mL", abnormalInDisease: "Low (argues against bacterial)" }
    ],
    imagingFindings: {
      chestXray: ["Usually normal", "May show bronchial wall thickening", "No infiltrate (distinguishes from pneumonia)"]
    },
    severity: {
      mild: { description: "Self-limiting, supportive care" },
      moderate: { description: "Prolonged symptoms, bronchospasm" },
      severe: { description: "Respiratory distress (rare, consider other diagnosis)" }
    }
  },

  J41_0: {
    name: "Simple Chronic Bronchitis",
    icd10: "J41.0",
    category: "respiratory",
    definition: "Chronic productive cough for ≥3 months/year for ≥2 consecutive years without airflow obstruction",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Chronic airway inflammation → mucus gland hyperplasia → increased mucus production",
      molecularBasis: "Tobacco smoke/pollutant exposure, goblet cell metaplasia, impaired mucociliary clearance"
    },
    clinicalPresentation: {
      symptoms: [
        "Chronic productive cough",
        "Mucoid sputum (becomes purulent with exacerbation)",
        "May have mild dyspnea",
        "Smoking history"
      ],
      signs: [
        "Rhonchi",
        "May be normal between exacerbations"
      ]
    },
    laboratoryFindings: [
      { name: "Spirometry", normalRange: "FEV1/FVC >0.70", abnormalInDisease: "Normal (distinguishes from COPD)" },
      { name: "Sputum culture", normalRange: "Normal flora", abnormalInDisease: "May grow pathogens during exacerbation" }
    ],
    imagingFindings: {
      chestXray: ["May be normal", "Bronchial wall thickening"],
      ctChest: ["Bronchial wall thickening", "No emphysema"]
    },
    severity: {
      mild: { description: "Minimal symptoms, rare exacerbations" },
      moderate: { description: "Frequent symptoms, occasional exacerbations" },
      severe: { description: "Daily symptoms, frequent exacerbations (consider progression to COPD)" }
    }
  },

  J42: {
    name: "Unspecified Chronic Bronchitis",
    icd10: "J42",
    category: "respiratory",
    definition: "Chronic bronchitis not otherwise specified",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Chronic airway inflammation with mucus hypersecretion",
      molecularBasis: "Similar to simple chronic bronchitis"
    },
    clinicalPresentation: {
      symptoms: [
        "Chronic cough",
        "Sputum production",
        "Dyspnea (variable)"
      ],
      signs: [
        "Rhonchi",
        "Variable findings"
      ]
    },
    laboratoryFindings: [
      { name: "Spirometry", normalRange: "Normal", abnormalInDisease: "May or may not show obstruction" }
    ],
    imagingFindings: {
      chestXray: ["Bronchial wall thickening", "Variable findings"]
    },
    severity: {
      mild: { description: "Minimal impact on daily life" },
      moderate: { description: "Symptomatic, limiting activities" },
      severe: { description: "Significant limitation" }
    }
  },

  // =====================
  // PLEURAL DISEASES
  // ICD-10: J90-J94 Series
  // =====================

  J90: {
    name: "Pleural Effusion, Not Elsewhere Classified",
    icd10: "J90",
    category: "respiratory",
    definition: "Accumulation of fluid in the pleural space",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Imbalance of fluid production/absorption: increased hydrostatic pressure, decreased oncotic pressure, increased permeability, or lymphatic obstruction",
      molecularBasis: "Transudative: CHF, cirrhosis. Exudative: infection, malignancy, inflammation"
    },
    clinicalPresentation: {
      symptoms: [
        "Dyspnea",
        "Pleuritic chest pain (if inflammation)",
        "Cough",
        "May be asymptomatic if small"
      ],
      signs: [
        "Decreased breath sounds",
        "Dullness to percussion",
        "Decreased tactile fremitus",
        "Tracheal deviation (if large)"
      ]
    },
    laboratoryFindings: [
      { name: "Thoracentesis - Light's criteria", normalRange: "N/A", abnormalInDisease: "Determines transudative vs exudative" },
      { name: "Pleural fluid protein", normalRange: "<3 g/dL (transudative)", abnormalInDisease: ">3 g/dL suggests exudative" },
      { name: "Pleural fluid LDH", normalRange: "Low", abnormalInDisease: "Elevated in exudate" },
      { name: "Pleural fluid pH", normalRange: ">7.20", abnormalInDisease: "<7.20 suggests complicated effusion" }
    ],
    imagingFindings: {
      chestXray: ["Blunting of costophrenic angle", "Meniscus sign", "Layering on lateral decubitus"],
      ctChest: ["Better characterization", "Loculations", "Underlying cause"],
      ultrasound: ["Quantification", "Guide thoracentesis", "Assess for loculations"]
    },
    severity: {
      mild: { description: "Small (<1/3 hemithorax), asymptomatic" },
      moderate: { description: "Moderate (1/3-2/3 hemithorax), symptomatic" },
      severe: { description: "Large (>2/3 hemithorax), respiratory compromise" }
    }
  },

  J91_0: {
    name: "Malignant Pleural Effusion",
    icd10: "J91.0",
    category: "respiratory",
    definition: "Pleural effusion due to malignancy, either primary pleural or metastatic",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Tumor implants on pleural surface → inflammation and increased permeability → fluid accumulation and impaired lymphatic drainage",
      molecularBasis: "VEGF production, lymphatic obstruction, direct pleural invasion"
    },
    clinicalPresentation: {
      symptoms: [
        "Progressive dyspnea",
        "Dull chest pain or heaviness",
        "Cough",
        "Weight loss",
        "Known malignancy history often present"
      ],
      signs: [
        "Decreased breath sounds",
        "Dullness to percussion",
        "Signs of underlying malignancy"
      ]
    },
    laboratoryFindings: [
      { name: "Pleural fluid cytology", normalRange: "No malignant cells", abnormalInDisease: "Malignant cells present (50-60% sensitivity)" },
      { name: "Pleural fluid LDH", normalRange: "Low", abnormalInDisease: "Elevated (exudative)" },
      { name: "Pleural fluid glucose", normalRange: ">60 mg/dL", abnormalInDisease: "May be low in advanced disease" }
    ],
    imagingFindings: {
      chestXray: ["Effusion", "May see mass or nodules"],
      ctChest: ["Pleural thickening/nodularity", "Mass", "Lymphadenopathy"],
      petCt: ["FDG-avid pleural disease"]
    },
    severity: {
      mild: { description: "Small, asymptomatic" },
      moderate: { description: "Moderate, symptomatic, requires intervention" },
      severe: { description: "Large, recurrent, significantly impacts quality of life" }
    }
  },

  J93_0: {
    name: "Spontaneous Tension Pneumothorax",
    icd10: "J93.0",
    category: "respiratory",
    definition: "Accumulation of air in pleural space with one-way valve mechanism causing hemodynamic compromise",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart"],
    pathophysiology: {
      mechanism: "Air enters pleural space but cannot escape → progressive accumulation → mediastinal shift → decreased venous return → hemodynamic collapse",
      molecularBasis: "Ruptured bleb/bulla or trauma creating one-way valve"
    },
    clinicalPresentation: {
      symptoms: [
        "Severe sudden dyspnea",
        "Chest pain",
        "Rapid deterioration",
        "Anxiety"
      ],
      signs: [
        "Hypotension (shock)",
        "Tachycardia",
        "Absent breath sounds on affected side",
        "Tracheal deviation away from affected side",
        "Distended neck veins",
        "Cyanosis"
      ]
    },
    laboratoryFindings: [
      { name: "ABG", normalRange: "Normal", abnormalInDisease: "Hypoxemia, respiratory acidosis" },
      { name: "Lactate", normalRange: "<2 mmol/L", abnormalInDisease: "Elevated from shock" }
    ],
    imagingFindings: {
      chestXray: ["DO NOT DELAY TREATMENT FOR IMAGING", "Large pneumothorax", "Mediastinal shift", "Depressed hemidiaphragm"],
      clinical: ["This is a clinical diagnosis - treat immediately"]
    },
    severity: {
      mild: { description: "N/A - tension pneumothorax is always an emergency" },
      moderate: { description: "N/A" },
      severe: { description: "Life-threatening emergency - immediate decompression required" }
    }
  },

  J93_1: {
    name: "Other Spontaneous Pneumothorax",
    icd10: "J93.1",
    category: "respiratory",
    definition: "Spontaneous accumulation of air in pleural space without tension physiology",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Primary: rupture of apical bleb in young patient. Secondary: underlying lung disease (COPD, cystic fibrosis)",
      molecularBasis: "Elastin degradation, subpleural bleb formation"
    },
    clinicalPresentation: {
      symptoms: [
        "Sudden pleuritic chest pain",
        "Dyspnea (proportional to size)",
        "Dry cough",
        "May be minimal in primary spontaneous"
      ],
      signs: [
        "Decreased breath sounds",
        "Hyperresonance to percussion",
        "Decreased chest expansion",
        "Hemodynamically stable (distinguishes from tension)"
      ]
    },
    laboratoryFindings: [
      { name: "ABG", normalRange: "Normal", abnormalInDisease: "May show mild hypoxemia" },
      { name: "SpO2", normalRange: ">95%", abnormalInDisease: "May be reduced" }
    ],
    imagingFindings: {
      chestXray: ["Visceral pleural line visible", "Absence of lung markings peripherally", "Measure size"],
      ctChest: ["Better sensitivity for small pneumothorax", "Identifies blebs", "Underlying lung disease"]
    },
    severity: {
      mild: { description: "Small (<2cm rim), asymptomatic - may observe" },
      moderate: { description: "Moderate (2-3cm), symptomatic - aspiration or chest tube" },
      severe: { description: "Large (>3cm), significant dyspnea - chest tube" }
    }
  },

  // =====================
  // ADDITIONAL RESPIRATORY CONDITIONS
  // =====================

  J96_0: {
    name: "Acute Respiratory Failure",
    icd10: "J96.0",
    category: "respiratory",
    definition: "Acute failure of the respiratory system to maintain adequate gas exchange",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "brain", "heart"],
    pathophysiology: {
      mechanism: "Type 1 (hypoxemic): V/Q mismatch, shunt, diffusion impairment. Type 2 (hypercapnic): alveolar hypoventilation",
      molecularBasis: "Variable depending on underlying cause"
    },
    clinicalPresentation: {
      symptoms: [
        "Severe dyspnea",
        "Altered mental status",
        "Inability to speak full sentences",
        "Cyanosis"
      ],
      signs: [
        "Tachypnea",
        "Accessory muscle use",
        "Paradoxical breathing",
        "Cyanosis",
        "Altered consciousness",
        "Tachycardia"
      ]
    },
    laboratoryFindings: [
      { name: "ABG - PaO2", normalRange: "80-100 mmHg", abnormalInDisease: "<60 mmHg on room air (Type 1)" },
      { name: "ABG - PaCO2", normalRange: "35-45 mmHg", abnormalInDisease: ">50 mmHg with acidosis (Type 2)" },
      { name: "ABG - pH", normalRange: "7.35-7.45", abnormalInDisease: "<7.35 (respiratory acidosis)" },
      { name: "Lactate", normalRange: "<2 mmol/L", abnormalInDisease: "Elevated with tissue hypoxia" }
    ],
    imagingFindings: {
      chestXray: ["Depends on cause: infiltrates, edema, clear (PE)"],
      ctChest: ["Better characterization of underlying pathology"]
    },
    severity: {
      mild: { description: "Mild hypoxemia, corrects with low-flow O2" },
      moderate: { description: "Requires high-flow O2 or NIPPV" },
      severe: { description: "Requires intubation and mechanical ventilation" }
    }
  },

  J80: {
    name: "Acute Respiratory Distress Syndrome (ARDS)",
    icd10: "J80",
    category: "respiratory",
    definition: "Acute, diffuse, inflammatory lung injury leading to severe hypoxemia",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Direct (pneumonia, aspiration) or indirect (sepsis, pancreatitis) lung injury → diffuse alveolar damage → non-cardiogenic pulmonary edema → severe hypoxemia",
      molecularBasis: "Neutrophil activation, cytokine storm, surfactant dysfunction, alveolar-capillary barrier disruption"
    },
    clinicalPresentation: {
      symptoms: [
        "Acute onset dyspnea (within 1 week of insult)",
        "Progressive hypoxemia despite oxygen",
        "Symptoms of underlying cause"
      ],
      signs: [
        "Severe hypoxemia (refractory)",
        "Bilateral crackles",
        "Tachypnea",
        "Accessory muscle use",
        "Cyanosis"
      ]
    },
    laboratoryFindings: [
      { name: "ABG", normalRange: "Normal", abnormalInDisease: "PaO2/FiO2 <300 (mild), <200 (moderate), <100 (severe)" },
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Low-normal (distinguishes from cardiogenic edema)" }
    ],
    imagingFindings: {
      chestXray: ["Bilateral opacities", "Not fully explained by effusions/collapse/nodules"],
      ctChest: ["Dependent ground-glass opacities", "Consolidation", "Normal heart size"]
    },
    severity: {
      mild: { description: "PaO2/FiO2 200-300 with PEEP ≥5" },
      moderate: { description: "PaO2/FiO2 100-200 with PEEP ≥5" },
      severe: { description: "PaO2/FiO2 <100 with PEEP ≥5" }
    }
  },

  J69_0: {
    name: "Aspiration Pneumonitis",
    icd10: "J69.0",
    category: "respiratory",
    definition: "Chemical lung injury from aspiration of gastric contents",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Acidic gastric contents cause chemical burn to airways and alveoli → acute inflammatory response",
      molecularBasis: "Direct acid injury, neutrophil influx, surfactant inactivation"
    },
    clinicalPresentation: {
      symptoms: [
        "Acute respiratory distress after witnessed or suspected aspiration",
        "Cough",
        "Dyspnea",
        "Wheezing",
        "Fever (may develop)"
      ],
      signs: [
        "Hypoxemia",
        "Tachypnea",
        "Crackles/wheezes",
        "Fever"
      ]
    },
    laboratoryFindings: [
      { name: "ABG", normalRange: "Normal", abnormalInDisease: "Hypoxemia" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "May be elevated" }
    ],
    imagingFindings: {
      chestXray: ["Infiltrates in dependent segments", "Right lower lobe common", "May progress to ARDS"],
      ctChest: ["Tree-in-bud pattern", "Ground-glass in dependent areas"]
    },
    severity: {
      mild: { description: "Self-limiting, supportive care" },
      moderate: { description: "Requires hospitalization, O2" },
      severe: { description: "ARDS, mechanical ventilation" }
    }
  },

  J43_9: {
    name: "Emphysema, Unspecified",
    icd10: "J43.9",
    category: "respiratory",
    definition: "Permanent enlargement of airspaces distal to terminal bronchioles with destruction of alveolar walls",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart"],
    pathophysiology: {
      mechanism: "Protease-antiprotease imbalance → alveolar wall destruction → loss of elastic recoil → air trapping",
      molecularBasis: "Neutrophil elastase, MMPs, oxidative stress from smoking, alpha-1 antitrypsin deficiency"
    },
    clinicalPresentation: {
      symptoms: [
        "Progressive dyspnea",
        "Minimal cough (less than chronic bronchitis)",
        "Weight loss",
        "Exercise intolerance"
      ],
      signs: [
        "Barrel chest",
        "Pursed-lip breathing",
        "Use of accessory muscles",
        "Decreased breath sounds",
        "Prolonged expiration",
        "Pink puffer phenotype"
      ]
    },
    laboratoryFindings: [
      { name: "Spirometry", normalRange: "FEV1/FVC >0.70", abnormalInDisease: "FEV1/FVC <0.70, reduced FEV1" },
      { name: "DLCO", normalRange: ">80% predicted", abnormalInDisease: "Reduced (distinguishes from pure chronic bronchitis)" },
      { name: "ABG", normalRange: "Normal", abnormalInDisease: "Hypoxemia, hypercapnia late" },
      { name: "Alpha-1 antitrypsin", normalRange: "100-300 mg/dL", abnormalInDisease: "Low if deficient" }
    ],
    imagingFindings: {
      chestXray: ["Hyperinflation", "Flattened diaphragms", "Increased AP diameter", "Hyperlucent lung fields"],
      ctChest: ["Emphysematous destruction (centrilobular, panlobular, paraseptal)", "Bullae", "Air trapping on expiratory images"]
    },
    severity: {
      mild: { description: "FEV1 ≥80% predicted" },
      moderate: { description: "FEV1 50-79% predicted" },
      severe: { description: "FEV1 <50% predicted" }
    }
  },

  J47_9: {
    name: "Bronchiectasis, Uncomplicated",
    icd10: "J47.9",
    category: "respiratory",
    definition: "Abnormal, permanent dilation of bronchi with chronic productive cough",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Cycle of infection, inflammation, and airway damage → permanent bronchial dilation → impaired mucociliary clearance → recurrent infections",
      molecularBasis: "Neutrophilic inflammation, protease release, bronchial wall destruction"
    },
    clinicalPresentation: {
      symptoms: [
        "Chronic productive cough",
        "Daily purulent sputum",
        "Recurrent respiratory infections",
        "Hemoptysis",
        "Dyspnea"
      ],
      signs: [
        "Crackles",
        "Wheezes",
        "Digital clubbing (advanced)",
        "Coarse breath sounds"
      ]
    },
    laboratoryFindings: [
      { name: "Sputum culture", normalRange: "Normal flora", abnormalInDisease: "H. influenzae, Pseudomonas, NTM" },
      { name: "Immunoglobulins", normalRange: "Normal", abnormalInDisease: "Check for immunodeficiency" },
      { name: "Spirometry", normalRange: "Normal", abnormalInDisease: "Often obstructive pattern" }
    ],
    imagingFindings: {
      chestXray: ["Tram-track sign", "Ring shadows", "May be normal"],
      ctChest: ["Dilated bronchi (signet ring sign)", "Bronchial wall thickening", "Tree-in-bud pattern", "Varicose/cystic bronchiectasis"]
    },
    severity: {
      mild: { description: "Minimal symptoms, infrequent exacerbations" },
      moderate: { description: "Daily symptoms, 2-3 exacerbations/year" },
      severe: { description: "Continuous symptoms, frequent exacerbations, colonization with Pseudomonas" }
    }
  }
};

export default RESPIRATORY_DISEASES_PART3;
