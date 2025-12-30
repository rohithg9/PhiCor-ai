// ============================================================
// RESPIRATORY DISEASES DATABASE - PART 1
// ICD-10 Chapter X: Diseases of the Respiratory System (J00-J99)
// Plus Lung Cancers from Chapter C
// ============================================================

export const RESPIRATORY_DISEASES = {
  // =====================
  // CHRONIC LOWER RESPIRATORY DISEASES (J40-J47)
  // =====================
  
  J44_0: {
    name: "Chronic Obstructive Pulmonary Disease with Acute Lower Respiratory Infection",
    icd10: "J44.0",
    category: "respiratory",
    definition: "COPD exacerbation triggered by lower respiratory tract infection",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart"],
    pathophysiology: {
      mechanism: "Chronic airflow limitation with superimposed infection → increased inflammation → worsened gas exchange → respiratory failure",
      molecularBasis: "Neutrophilic inflammation, protease-antiprotease imbalance, oxidative stress amplified by infection",
      equations: {
        goldStage: {
          name: "GOLD Spirometric Classification",
          latex: "\\text{GOLD Stage} = \\begin{cases} 1 & FEV_1 \\geq 80\\% \\\\ 2 & 50\\% \\leq FEV_1 < 80\\% \\\\ 3 & 30\\% \\leq FEV_1 < 50\\% \\\\ 4 & FEV_1 < 30\\% \\end{cases}",
          description: "Post-bronchodilator FEV1 percent predicted determines GOLD stage severity",
          derivation: [
            { step: 1, title: "Spirometry Measurement", description: "Perform post-bronchodilator spirometry (400μg salbutamol)" },
            { step: 2, title: "FEV1/FVC Ratio", description: "Confirm obstruction: FEV1/FVC < 0.70 post-bronchodilator" },
            { step: 3, title: "Severity Classification", description: "Use FEV1 % predicted: GOLD 1 (mild) ≥80%, GOLD 2 (moderate) 50-79%, GOLD 3 (severe) 30-49%, GOLD 4 (very severe) <30%" }
          ],
          isNovel: false,
          source: "GOLD Guidelines 2024"
        },
        bode: {
          name: "BODE Index",
          latex: "BODE = B + O + D + E",
          description: "Multidimensional index: BMI (B), Obstruction FEV1 (O), Dyspnea mMRC (D), Exercise 6MWD (E). Score 0-10, higher = worse prognosis",
          derivation: [
            { step: 1, title: "BMI Component", description: "BMI >21 = 0 points; BMI ≤21 = 1 point" },
            { step: 2, title: "FEV1 Component", description: "≥65% = 0; 50-64% = 1; 36-49% = 2; ≤35% = 3 points" },
            { step: 3, title: "Dyspnea + Exercise", description: "mMRC 0-1 = 0, 2 = 1, 3 = 2, 4 = 3 points. 6MWD ≥350m = 0; 250-349 = 1; 150-249 = 2; ≤149 = 3 points" }
          ],
          isNovel: false,
          source: "Celli et al., NEJM 2004"
        },
        decaf: {
          name: "DECAF Score for AECOPD",
          latex: "DECAF = D + E + C + A + F",
          description: "Predicts in-hospital mortality in AECOPD: Dyspnea (D), Eosinopenia (E), Consolidation (C), Acidemia (A), Atrial Fibrillation (F)",
          derivation: [
            { step: 1, title: "Dyspnea Assessment", description: "eMRCD 5a = 1 point; eMRCD 5b = 2 points" },
            { step: 2, title: "Laboratory Values", description: "Eosinophils <0.05×10⁹/L = 1 point; Acidemia pH <7.30 = 1 point" },
            { step: 3, title: "Imaging + ECG", description: "CXR consolidation = 1 point; Atrial fibrillation = 1 point. Total 0-6." }
          ],
          isNovel: false,
          source: "Steer et al., Thorax 2012"
        },
        aalveolarGas: {
          name: "Alveolar Gas Equation",
          latex: "P_AO_2 = F_IO_2(P_{atm} - P_{H_2O}) - \\frac{P_aCO_2}{RQ}",
          description: "Calculates alveolar oxygen partial pressure. Normal A-a gradient <10-15 mmHg in young adults",
          derivation: [
            { step: 1, title: "Inspired O2", description: "Calculate inspired PO2: FiO2 × (760 - 47) at sea level" },
            { step: 2, title: "CO2 Correction", description: "Subtract PaCO2/RQ (respiratory quotient ~0.8)" },
            { step: 3, title: "A-a Gradient", description: "A-a = PAO2 - PaO2. Elevated in V/Q mismatch, shunt, diffusion impairment" }
          ],
          isNovel: false,
          source: "West's Respiratory Physiology"
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Increased dyspnea from baseline",
        "Increased sputum volume",
        "Increased sputum purulence",
        "Cough worsening",
        "Wheezing",
        "Chest tightness",
        "Fever (if infectious)",
        "Fatigue",
        "Confusion (if hypercapnic)"
      ],
      signs: [
        "Tachypnea",
        "Use of accessory muscles",
        "Pursed lip breathing",
        "Barrel chest",
        "Decreased breath sounds",
        "Prolonged expiratory phase",
        "Wheezes and/or rhonchi",
        "Cyanosis",
        "Peripheral edema (cor pulmonale)",
        "Asterixis (CO2 retention)"
      ]
    },
    laboratoryFindings: [
      { name: "ABG - pH", normalRange: "7.35-7.45", abnormalInDisease: "May be <7.35 (respiratory acidosis)" },
      { name: "ABG - PaCO2", normalRange: "35-45 mmHg", abnormalInDisease: "Often elevated >45 mmHg" },
      { name: "ABG - PaO2", normalRange: "80-100 mmHg", abnormalInDisease: "Often <60 mmHg (hypoxemia)" },
      { name: "WBC", normalRange: "4.5-11 ×10⁹/L", abnormalInDisease: "Elevated if bacterial infection" },
      { name: "Procalcitonin", normalRange: "<0.1 ng/mL", abnormalInDisease: ">0.25 suggests bacterial cause" },
      { name: "BNP", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated if RV strain/cor pulmonale" },
      { name: "Eosinophils", normalRange: "0.1-0.5 ×10⁹/L", abnormalInDisease: "<0.05 associated with worse prognosis" }
    ],
    imagingFindings: {
      chestXray: ["Hyperinflation", "Flattened diaphragm", "Increased AP diameter", "Bullae", "New infiltrate suggests pneumonia"],
      chestCT: ["Emphysema (centrilobular, panlobular, paraseptal)", "Bronchial wall thickening", "Air trapping on expiratory images", "Bronchiectasis"],
      echocardiography: ["RV dilation/dysfunction", "Tricuspid regurgitation", "Elevated RVSP (pulmonary hypertension)"]
    },
    severity: {
      mild: { description: "Increased symptoms manageable with increased bronchodilators" },
      moderate: { description: "Requires systemic corticosteroids and/or antibiotics" },
      severe: { description: "Requires hospitalization, may need NIV or intubation" }
    }
  },

  J44_1: {
    name: "Chronic Obstructive Pulmonary Disease with Acute Exacerbation",
    icd10: "J44.1",
    category: "respiratory",
    definition: "Acute worsening of respiratory symptoms beyond day-to-day variation requiring change in therapy",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart"],
    pathophysiology: {
      mechanism: "Increased airway inflammation, mucus hypersecretion, bronchospasm, dynamic hyperinflation",
      molecularBasis: "IL-8, TNF-α, neutrophil elastase surge; bacterial colonization/infection; viral triggers",
      equations: {
        anthonisen: {
          name: "Anthonisen Criteria for AECOPD",
          latex: "\\text{Type} = \\begin{cases} I & \\text{All 3 cardinal symptoms} \\\\ II & \\text{2 of 3 symptoms} \\\\ III & \\text{1 symptom + URI/fever} \\end{cases}",
          description: "Cardinal symptoms: increased dyspnea, sputum volume, sputum purulence",
          derivation: [
            { step: 1, title: "Symptom Assessment", description: "Evaluate three cardinal symptoms: dyspnea, sputum volume, sputum purulence" },
            { step: 2, title: "Classification", description: "Type I (severe) = all 3; Type II (moderate) = 2 of 3; Type III (mild) = 1 + minor criteria" },
            { step: 3, title: "Antibiotic Decision", description: "Antibiotics benefit Type I and II exacerbations but not Type III" }
          ],
          isNovel: false,
          source: "Anthonisen et al., Ann Intern Med 1987"
        },
        dynamicHyperinflation: {
          name: "Dynamic Hyperinflation Index",
          latex: "\\Delta IC = IC_{rest} - IC_{exercise}",
          description: "Decrease in inspiratory capacity during exercise reflects dynamic hyperinflation",
          derivation: [
            { step: 1, title: "Baseline IC", description: "Measure inspiratory capacity at rest" },
            { step: 2, title: "Exercise IC", description: "Measure IC during/after exercise when dyspneic" },
            { step: 3, title: "Interpretation", description: "Decrease >200mL indicates significant dynamic hyperinflation limiting exercise" }
          ],
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Worsening breathlessness",
        "Increased cough frequency/severity",
        "Change in sputum color (yellow/green)",
        "Increased sputum volume",
        "Chest congestion",
        "Decreased exercise tolerance",
        "Ankle swelling",
        "Morning headache (CO2 retention)"
      ],
      signs: [
        "Respiratory rate >24/min",
        "Oxygen saturation <90% on room air",
        "Accessory muscle use",
        "Inability to complete sentences",
        "Paradoxical breathing",
        "Cyanosis",
        "Hemodynamic instability"
      ]
    },
    laboratoryFindings: [
      { name: "ABG", normalRange: "pH 7.35-7.45", abnormalInDisease: "Respiratory acidosis common" },
      { name: "Sputum culture", normalRange: "Normal flora", abnormalInDisease: "H. influenzae, S. pneumoniae, M. catarrhalis, P. aeruginosa" }
    ],
    imagingFindings: {
      chestXray: ["Rule out pneumonia", "Pneumothorax", "Pleural effusion", "Cardiomegaly"]
    }
  },

  J45_2: {
    name: "Mild Intermittent Asthma",
    icd10: "J45.2",
    category: "respiratory",
    definition: "Asthma with symptoms ≤2 days/week, nighttime awakenings ≤2×/month, normal FEV1 between exacerbations",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Type 2 inflammation with eosinophilic airway inflammation, bronchial hyperreactivity, reversible obstruction",
      molecularBasis: "IL-4, IL-5, IL-13 driven; IgE-mediated; mast cell and eosinophil activation",
      equations: {
        fev1Reversibility: {
          name: "Bronchodilator Reversibility",
          latex: "\\text{Reversibility} = \\frac{FEV_{1,post} - FEV_{1,pre}}{FEV_{1,pre}} \\times 100\\%",
          description: "≥12% AND ≥200mL improvement post-bronchodilator confirms reversibility",
          derivation: [
            { step: 1, title: "Pre-bronchodilator", description: "Perform baseline spirometry" },
            { step: 2, title: "Bronchodilator Administration", description: "Give 400μg salbutamol, wait 15-20 minutes" },
            { step: 3, title: "Calculate Change", description: "Positive if both ≥12% increase AND ≥200mL absolute increase in FEV1" }
          ],
          isNovel: false,
          source: "ATS/ERS Spirometry Guidelines"
        },
        peakFlowVariability: {
          name: "Peak Flow Variability",
          latex: "\\text{Variability} = \\frac{PEF_{max} - PEF_{min}}{\\frac{1}{2}(PEF_{max} + PEF_{min})} \\times 100\\%",
          description: "Diurnal PEF variability >10% suggests asthma; >20% indicates poor control",
          derivation: [
            { step: 1, title: "PEF Monitoring", description: "Measure PEF morning and evening for 2 weeks" },
            { step: 2, title: "Calculate Daily Amplitude", description: "Daily amplitude = (highest - lowest) / mean × 100%" },
            { step: 3, title: "Average Variability", description: "Mean of daily amplitudes >10% suggests asthma diagnosis" }
          ],
          isNovel: false
        },
        fenoLevel: {
          name: "Fractional Exhaled Nitric Oxide",
          latex: "FeNO > 50 \\text{ ppb} \\rightarrow \\text{High Type 2 inflammation}",
          description: "FeNO reflects eosinophilic airway inflammation; guides ICS therapy",
          derivation: [
            { step: 1, title: "Measurement", description: "Exhale at 50mL/s for 10 seconds into analyzer" },
            { step: 2, title: "Interpretation - Adults", description: "<25 ppb = low, 25-50 = intermediate, >50 = high eosinophilic inflammation" },
            { step: 3, title: "Clinical Use", description: "High FeNO predicts good response to ICS; low FeNO suggests alternative diagnosis" }
          ],
          isNovel: false,
          source: "ATS Clinical Practice Guideline"
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Episodic wheezing",
        "Shortness of breath with triggers",
        "Chest tightness",
        "Cough (especially nocturnal)",
        "Exercise-induced symptoms",
        "Symptom-free periods between episodes"
      ],
      signs: [
        "May be normal between attacks",
        "Expiratory wheezes during exacerbation",
        "Prolonged expiratory phase",
        "Tachypnea during attack"
      ]
    },
    laboratoryFindings: [
      { name: "Eosinophils (blood)", normalRange: "0.1-0.5 ×10⁹/L", abnormalInDisease: "Often elevated >0.3" },
      { name: "Total IgE", normalRange: "<100 IU/mL", abnormalInDisease: "May be elevated in allergic asthma" },
      { name: "FeNO", normalRange: "<25 ppb", abnormalInDisease: ">50 ppb indicates Type 2 inflammation" }
    ],
    imagingFindings: {
      chestXray: ["Usually normal", "Hyperinflation during exacerbation"],
      spirometry: ["FEV1/FVC <0.70 or LLN", "Positive bronchodilator response", "May be normal between episodes"]
    },
    severity: {
      mild: { description: "Intermittent - symptoms ≤2 days/week, nighttime ≤2×/month, FEV1 ≥80%" },
      moderate: { description: "Mild persistent - symptoms >2 days/week but not daily" },
      severe: { description: "Moderate/Severe persistent - daily symptoms, frequent exacerbations" }
    }
  },

  J45_4: {
    name: "Moderate Persistent Asthma",
    icd10: "J45.4",
    category: "respiratory",
    definition: "Asthma with daily symptoms, nighttime awakenings >1×/week, FEV1 60-80% predicted",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Persistent airway inflammation with structural remodeling beginning",
      molecularBasis: "Sustained Type 2 cytokine release, subepithelial fibrosis, smooth muscle hypertrophy",
      equations: {
        asthmaControl: {
          name: "Asthma Control Test (ACT)",
          latex: "ACT = \\sum_{i=1}^{5} Q_i",
          description: "5 questions scored 1-5 each. Total ≤19 = not well controlled; 20-24 = well controlled; 25 = complete control",
          derivation: [
            { step: 1, title: "Questions", description: "Activity limitation, daytime symptoms, nighttime symptoms, rescue inhaler use, self-rating of control" },
            { step: 2, title: "Scoring", description: "Each question 1 (worst) to 5 (best), total 5-25" },
            { step: 3, title: "Clinical Action", description: "<20 suggests need to step up therapy; consider triggers, adherence, technique" }
          ],
          isNovel: false,
          source: "Nathan et al., J Allergy Clin Immunol 2004"
        },
        aqlq: {
          name: "Asthma Quality of Life Questionnaire",
          latex: "AQLQ = \\frac{\\sum \\text{Domain scores}}{4}",
          description: "32 items across 4 domains: symptoms, activity, emotion, environment. Score 1-7, higher = better",
          derivation: [
            { step: 1, title: "Domain Assessment", description: "Score each of 32 items from 1 (maximal impairment) to 7 (no impairment)" },
            { step: 2, title: "Calculate Domains", description: "Average scores for symptoms (12 items), activity (11), emotional (5), environmental (4)" },
            { step: 3, title: "Overall Score", description: "Mean of 4 domain scores. Change ≥0.5 is clinically meaningful" }
          ],
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Daily symptoms",
        "Frequent nighttime awakenings (>1/week)",
        "Daily need for rescue inhaler",
        "Some limitation of normal activity",
        "Exacerbations affecting activity"
      ],
      signs: [
        "Wheezing on auscultation",
        "Prolonged expiration",
        "May have chronic cough"
      ]
    },
    laboratoryFindings: [
      { name: "FEV1", normalRange: "≥80% predicted", abnormalInDisease: "60-80% predicted" },
      { name: "FEV1/FVC", normalRange: ">0.70", abnormalInDisease: "Often <0.70" }
    ],
    imagingFindings: {
      spirometry: ["FEV1 60-80% predicted", "FEV1/FVC reduced", "Bronchodilator response present"]
    }
  },

  J45_5: {
    name: "Severe Persistent Asthma",
    icd10: "J45.5",
    category: "respiratory",
    definition: "Asthma with continuous symptoms, frequent nighttime awakenings, extremely limited activity, FEV1 <60%",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart"],
    pathophysiology: {
      mechanism: "Severe persistent inflammation with fixed airway obstruction, significant remodeling",
      molecularBasis: "Type 2-high or Type 2-low phenotypes; neutrophilic inflammation in some; steroid resistance mechanisms",
      equations: {
        severityIndex: {
          name: "Asthma Severity Index",
          latex: "ASI = \\frac{\\text{Symptoms} + \\text{Night waking} + \\text{FEV1} + \\text{Exacerbations}}{4}",
          description: "Composite score incorporating multiple domains of severity",
          derivation: [
            { step: 1, title: "Symptom Frequency", description: "Score based on days/week with symptoms" },
            { step: 2, title: "Nocturnal Symptoms", description: "Score based on nights/week awakened" },
            { step: 3, title: "Lung Function + Exacerbations", description: "FEV1 % predicted category plus annual exacerbation rate" }
          ],
          isNovel: true
        },
        biologic: {
          name: "Biologic Eligibility Criteria",
          latex: "\\text{Eligible if: } \\text{Blood Eos} \\geq 150 \\text{ OR } FeNO \\geq 25 \\text{ OR } \\text{IgE } 30\\text{-}700",
          description: "Type 2 biomarkers guide biologic selection: anti-IgE, anti-IL5/5R, anti-IL4Rα",
          derivation: [
            { step: 1, title: "Eosinophils", description: "Blood eos ≥150/μL for anti-IL5; ≥300 for stronger response" },
            { step: 2, title: "FeNO", description: "FeNO ≥25 ppb predicts response to dupilumab" },
            { step: 3, title: "IgE Level", description: "Total IgE 30-700 IU/mL + positive allergen for omalizumab" }
          ],
          isNovel: false,
          source: "GINA 2024 Severe Asthma Guidelines"
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Continuous daily symptoms",
        "Frequent nighttime symptoms",
        "Extremely limited physical activity",
        "Frequent severe exacerbations",
        "Oral corticosteroid dependent"
      ],
      signs: [
        "Persistent wheezing",
        "Barrel chest",
        "Use of accessory muscles at baseline",
        "May have clubbing if chronic"
      ]
    },
    laboratoryFindings: [
      { name: "FEV1", normalRange: "≥80% predicted", abnormalInDisease: "<60% predicted" },
      { name: "Blood eosinophils", normalRange: "<300/μL", abnormalInDisease: "Often >300/μL in Type 2" },
      { name: "FeNO", normalRange: "<25 ppb", abnormalInDisease: "Often >50 ppb" },
      { name: "Sputum eosinophils", normalRange: "<2%", abnormalInDisease: ">3% indicates eosinophilic asthma" }
    ],
    imagingFindings: {
      chestCT: ["Air trapping", "Bronchial wall thickening", "Mucus plugging", "Possible bronchiectasis"],
      spirometry: ["FEV1 <60%", "Significant reversibility may persist", "Fixed obstruction in some"]
    }
  },

  J46: {
    name: "Status Asthmaticus",
    icd10: "J46",
    category: "respiratory",
    definition: "Severe acute asthma exacerbation refractory to standard bronchodilator therapy, life-threatening",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "heart", "brain"],
    pathophysiology: {
      mechanism: "Severe bronchospasm, mucus plugging, air trapping → respiratory failure, hypoxemia, hypercarbia",
      molecularBasis: "Massive mediator release, airway edema, refractory smooth muscle contraction",
      equations: {
        pulsusParadoxus: {
          name: "Pulsus Paradoxus",
          latex: "PP = SBP_{expiration} - SBP_{inspiration}",
          description: "Difference >12 mmHg suggests severe asthma; >25 mmHg = critical",
          derivation: [
            { step: 1, title: "Measurement", description: "Measure SBP at end-expiration and end-inspiration during quiet breathing" },
            { step: 2, title: "Calculation", description: "PP = expiratory SBP - inspiratory SBP" },
            { step: 3, title: "Interpretation", description: "Normal <10 mmHg; 10-25 = moderate severity; >25 = severe, impending failure" }
          ],
          isNovel: false
        },
        rasScore: {
          name: "Respiratory Arrest Score",
          latex: "\\text{Imminent arrest if: Silent chest + Confusion + Bradycardia + Cyanosis}",
          description: "Clinical signs of impending respiratory arrest requiring immediate intervention",
          derivation: [
            { step: 1, title: "Assess Breath Sounds", description: "Silent chest = severe air trapping, minimal air movement" },
            { step: 2, title: "Mental Status", description: "Confusion, drowsiness indicate hypercapnia, hypoxemia" },
            { step: 3, title: "Cardiovascular Signs", description: "Bradycardia and cyanosis are pre-arrest signs" }
          ],
          isNovel: false
        },
        peakFlow: {
          name: "Peak Flow Severity Classification",
          latex: "\\text{Severity} = \\begin{cases} \\text{Mild} & PEF > 70\\% \\\\ \\text{Moderate} & PEF\\: 40\\text{-}70\\% \\\\ \\text{Severe} & PEF < 40\\% \\end{cases}",
          description: "Peak flow as percentage of predicted or personal best indicates exacerbation severity",
          derivation: [
            { step: 1, title: "Measure PEF", description: "Best of 3 attempts if patient able to perform" },
            { step: 2, title: "Calculate Percent", description: "Compare to predicted or patient's personal best" },
            { step: 3, title: "Classify Severity", description: "<40% = severe, life-threatening; 40-70% = moderate" }
          ],
          isNovel: false
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Severe breathlessness at rest",
        "Unable to speak in sentences",
        "Unable to lie flat",
        "Agitation or confusion",
        "Chest tightness/pain"
      ],
      signs: [
        "Respiratory rate >30/min",
        "Heart rate >120/min",
        "Pulsus paradoxus >25 mmHg",
        "Accessory muscle use",
        "Silent chest (ominous)",
        "Cyanosis",
        "Inability to complete sentences",
        "Altered consciousness"
      ]
    },
    laboratoryFindings: [
      { name: "ABG - pH", normalRange: "7.35-7.45", abnormalInDisease: "Initially respiratory alkalosis, then acidosis" },
      { name: "ABG - PaCO2", normalRange: "35-45 mmHg", abnormalInDisease: "Rising PaCO2 = tiring, impending failure" },
      { name: "ABG - PaO2", normalRange: "80-100 mmHg", abnormalInDisease: "<60 mmHg = severe hypoxemia" },
      { name: "Lactate", normalRange: "<2 mmol/L", abnormalInDisease: "Elevated in severe respiratory distress" }
    ],
    imagingFindings: {
      chestXray: ["Hyperinflation", "Rule out pneumothorax", "Rule out pneumomediastinum", "Pneumonia"]
    },
    severity: {
      mild: { description: "Not applicable - status asthmaticus is by definition severe" },
      moderate: { description: "Responding to treatment but still requires ICU monitoring" },
      severe: { description: "Requiring intubation/mechanical ventilation" }
    }
  },

  // =====================
  // PNEUMONIA (J12-J18)
  // =====================

  J13: {
    name: "Pneumonia due to Streptococcus pneumoniae",
    icd10: "J13",
    category: "respiratory",
    definition: "Community-acquired pneumonia caused by Streptococcus pneumoniae",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Bacterial invasion of lower respiratory tract → alveolar filling with inflammatory exudate → consolidation",
      molecularBasis: "Pneumococcal capsule evades phagocytosis; pneumolysin causes cell lysis; inflammatory cytokine release",
      equations: {
        psi: {
          name: "Pneumonia Severity Index (PSI/PORT)",
          latex: "PSI = \\sum \\text{Points}(\\text{Age, comorbid, PE, labs, imaging})",
          description: "Risk stratification: Class I-III = low risk (outpatient); IV-V = higher risk (inpatient)",
          derivation: [
            { step: 1, title: "Demographics", description: "Age (years = points for men, years-10 for women); Nursing home +10" },
            { step: 2, title: "Comorbidities", description: "Neoplasm +30; Liver disease +20; CHF +10; CVD +10; Renal disease +10" },
            { step: 3, title: "PE + Labs + CXR", description: "Altered mental status +20; RR≥30 +20; SBP<90 +20; Temp<35 or ≥40 +15; HR≥125 +10; pH<7.35 +30; BUN≥30 +20; Na<130 +20; Glucose≥250 +10; Hct<30 +10; PaO2<60 +10; Pleural effusion +10" }
          ],
          isNovel: false,
          source: "Fine et al., NEJM 1997"
        },
        curb65: {
          name: "CURB-65 Score",
          latex: "CURB65 = C + U + R + B + 65",
          description: "Confusion, Urea>7, RR≥30, BP<90/60, Age≥65. Score 0-1 = outpatient; 2 = short stay; 3-5 = ICU",
          derivation: [
            { step: 1, title: "C - Confusion", description: "New mental confusion = 1 point" },
            { step: 2, title: "U - Urea/R - Respiratory", description: "BUN >19 mg/dL (7 mmol/L) = 1; RR ≥30 = 1" },
            { step: 3, title: "B - Blood pressure/65", description: "SBP <90 or DBP ≤60 = 1; Age ≥65 = 1" }
          ],
          isNovel: false,
          source: "Lim et al., Thorax 2003"
        },
        smartCop: {
          name: "SMART-COP Score",
          latex: "\\text{SMART-COP} = S + M + A + R + T + C + O + P",
          description: "Predicts need for intensive respiratory or vasopressor support",
          derivation: [
            { step: 1, title: "S-M-A-R-T", description: "SBP<90 (2pt); Multilobar (1pt); Albumin<3.5 (1pt); RR≥25 (1pt); Tachycardia≥125 (1pt)" },
            { step: 2, title: "C-O-P", description: "Confusion (1pt); O2 low: PaO2<70 or SpO2<93% (2pt); pH<7.35 (2pt)" },
            { step: 3, title: "Interpretation", description: "0-2 = low risk; 3-4 = moderate; 5-6 = high; ≥7 = very high risk for IRVS" }
          ],
          isNovel: false,
          source: "Charles et al., Clin Infect Dis 2008"
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Fever with rigors",
        "Productive cough (rusty sputum)",
        "Pleuritic chest pain",
        "Dyspnea",
        "Fatigue",
        "Malaise"
      ],
      signs: [
        "Tachypnea",
        "Tachycardia",
        "Fever (may be absent in elderly)",
        "Decreased breath sounds over consolidation",
        "Bronchial breath sounds",
        "Egophony (E-to-A changes)",
        "Dullness to percussion",
        "Increased tactile fremitus",
        "Crackles/rales"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4.5-11 ×10⁹/L", abnormalInDisease: "Leukocytosis with left shift (or leukopenia = poor prognosis)" },
      { name: "Procalcitonin", normalRange: "<0.1 ng/mL", abnormalInDisease: ">0.25 ng/mL supports bacterial cause" },
      { name: "CRP", normalRange: "<3 mg/L", abnormalInDisease: "Markedly elevated" },
      { name: "Blood cultures", normalRange: "No growth", abnormalInDisease: "S. pneumoniae in ~25% with bacteremia" },
      { name: "Urinary antigen", normalRange: "Negative", abnormalInDisease: "Positive pneumococcal antigen" },
      { name: "Sputum culture", normalRange: "Normal flora", abnormalInDisease: "Gram-positive diplococci, S. pneumoniae" }
    ],
    imagingFindings: {
      chestXray: ["Lobar consolidation", "Air bronchograms", "Parapneumonic effusion in some"],
      chestCT: ["Dense consolidation", "Tree-in-bud nodules uncommon (unlike atypicals)"]
    },
    severity: {
      mild: { description: "PSI Class I-II or CURB-65 0-1, suitable for outpatient treatment" },
      moderate: { description: "PSI Class III-IV or CURB-65 2, consider brief hospitalization" },
      severe: { description: "PSI Class V or CURB-65 ≥3, requires ICU admission" }
    }
  },

  J18_9: {
    name: "Pneumonia, Unspecified Organism",
    icd10: "J18.9",
    category: "respiratory",
    definition: "Community-acquired pneumonia when pathogen is not identified",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    pathophysiology: {
      mechanism: "Infection of lower respiratory tract causing alveolar inflammation and consolidation",
      equations: {
        majorMinorCriteria: {
          name: "Severe CAP Criteria (ATS/IDSA)",
          latex: "\\text{Severe CAP} = 1 \\text{ Major OR } \\geq 3 \\text{ Minor criteria}",
          description: "Major: mechanical ventilation, septic shock. Minor: RR≥30, PaO2/FiO2≤250, multilobar, confusion, BUN≥20, WBC<4000, Plt<100k, Temp<36°C, Hypotension",
          derivation: [
            { step: 1, title: "Major Criteria", description: "Septic shock needing vasopressors OR requiring invasive mechanical ventilation" },
            { step: 2, title: "Minor Criteria", description: "RR≥30, PaO2/FiO2≤250, multilobar infiltrates, confusion, BUN≥20, WBC<4k, platelets<100k, hypothermia, hypotension needing fluids" },
            { step: 3, title: "ICU Decision", description: "1 major or ≥3 minor criteria = direct ICU admission" }
          ],
          isNovel: false,
          source: "ATS/IDSA CAP Guidelines 2019"
        }
      }
    },
    clinicalPresentation: {
      symptoms: [
        "Cough (productive or dry)",
        "Fever",
        "Dyspnea",
        "Pleuritic chest pain",
        "Fatigue",
        "Myalgias (especially atypical pathogens)"
      ],
      signs: [
        "Fever or hypothermia",
        "Tachypnea",
        "Tachycardia",
        "Hypoxemia",
        "Focal lung findings"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4.5-11 ×10⁹/L", abnormalInDisease: "Variable: elevated, normal, or low" },
      { name: "Procalcitonin", normalRange: "<0.1 ng/mL", abnormalInDisease: "Helps distinguish bacterial vs viral" }
    ],
    imagingFindings: {
      chestXray: ["Infiltrate/consolidation required for diagnosis", "Lobar or patchy pattern"]
    }
  }
};

export default RESPIRATORY_DISEASES;
