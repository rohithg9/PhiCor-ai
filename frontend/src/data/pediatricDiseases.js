// ============================================================
// PEDIATRIC DISEASES DATABASE
// Comprehensive pediatric-specific conditions
// ICD-10: Various chapters with pediatric focus
// ============================================================

export const PEDIATRIC_DISEASES = {
  // =====================
  // KAWASAKI DISEASE
  // ICD-10: M30.3
  // =====================

  M30_3: {
    name: "Kawasaki Disease",
    icd10: "M30.3",
    snomedCT: "75053002",
    category: "pediatric",
    definition: "Acute self-limited vasculitis of childhood with coronary artery involvement risk",
    primaryOrgan: "heart",
    affectedOrgans: ["heart", "blood", "lymphatic", "skin", "eyes"],
    ageGroup: "Pediatric (6 months - 5 years peak)",
    
    pathophysiology: {
      mechanism: "Systemic vasculitis of medium-sized arteries → coronary artery aneurysms",
      molecularBasis: "Unknown trigger (infectious?); TNF-α, IL-1, IL-6; immune activation; endothelial dysfunction",
      timeline: "Acute (1-2 weeks) → Subacute (2-4 weeks) → Convalescent (4-8 weeks)"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "High fever", frequency: "100%", description: "≥5 days, remitting, >39°C" },
        { name: "Rash", frequency: "90%", description: "Polymorphous, truncal, perineal" },
        { name: "Conjunctivitis", frequency: "85%", description: "Bilateral, non-purulent" },
        { name: "Oral changes", frequency: "90%", description: "Red lips, strawberry tongue" },
        { name: "Extremity changes", frequency: "70%", description: "Edema, erythema, desquamation" },
        { name: "Cervical lymphadenopathy", frequency: "50%", description: "≥1.5 cm, usually unilateral" },
        { name: "Irritability", frequency: "80%", description: "Extreme irritability" }
      ],
      signs: [
        { name: "Bilateral conjunctival injection", description: "Limbic sparing, no exudate" },
        { name: "Erythema of lips/oral mucosa", description: "Cracked red lips, strawberry tongue" },
        { name: "Polymorphous rash", description: "Maculopapular, not vesicular" },
        { name: "Extremity changes", description: "Erythema of palms/soles → desquamation (convalescent)" },
        { name: "Cervical lymphadenopathy", description: "≥1.5 cm diameter" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Classic Kawasaki Disease",
      requirements: {
        fever: "Fever ≥5 days PLUS",
        criteria: "≥4 of 5 clinical criteria: Bilateral conjunctival injection, Oral mucous membrane changes, Extremity changes, Polymorphous rash, Cervical lymphadenopathy",
        incomplete: "Fever ≥5 days + 2-3 criteria + supporting labs/echo → Incomplete Kawasaki"
      }
    },
    
    laboratoryFindings: [
      { name: "WBC", normalRange: "Age-dependent", abnormalInDisease: "Leukocytosis with left shift" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Markedly elevated (>30 mg/L)" },
      { name: "ESR", normalRange: "<20 mm/hr", abnormalInDisease: "Markedly elevated (>40 mm/hr)" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Thrombocytosis (subacute, week 2-3)" },
      { name: "ALT", normalRange: "<40 U/L", abnormalInDisease: "Mildly elevated" },
      { name: "Albumin", normalRange: "3.5-5 g/dL", abnormalInDisease: "Hypoalbuminemia" },
      { name: "Urine WBC", normalRange: "<5/hpf", abnormalInDisease: "Sterile pyuria" },
      { name: "BNP", normalRange: "Age-dependent", abnormalInDisease: "Elevated (myocardial involvement)" }
    ],
    
    imagingFindings: {
      echocardiogram: {
        timing: "At diagnosis, 2 weeks, 6-8 weeks",
        findings: ["Coronary artery dilation/aneurysms", "Decreased LV function", "Pericardial effusion", "Mitral regurgitation"],
        z_scores: "Z-score ≥2.5 indicates coronary involvement"
      }
    },
    
    severity: {
      mild: { description: "No coronary involvement" },
      moderate: { description: "Transient coronary dilation (Z 2-2.5)" },
      severe: { description: "Coronary aneurysms (Z >2.5), giant aneurysms (>8mm)" }
    },
    
    modifications: {
      heart: {
        structure: {
          coronary_diameter: { factor: 2.0, note: "Coronary dilation/aneurysm" },
          lv_function: { factor: 0.85, note: "May be reduced acutely" }
        }
      },
      blood: {
        geometry: {
          wbc_count: { factor: 1.6, note: "Leukocytosis" },
          platelet_count: { factor: 2.0, note: "Thrombocytosis in subacute phase" }
        },
        proteins: {
          crp: { factor: 10.0, note: "Markedly elevated" },
          albumin: { factor: 0.7, note: "Hypoalbuminemia" }
        }
      }
    },
    
    treatment: {
      standard: "IVIG 2g/kg + aspirin (high dose acute, low dose after afebrile)",
      refractory: "Second IVIG, corticosteroids, infliximab"
    },
    
    prognosis: {
      without_treatment: "15-25% develop coronary abnormalities",
      with_treatment: "<5% develop coronary abnormalities"
    }
  },

  // =====================
  // BRONCHIOLITIS
  // ICD-10: J21.9
  // =====================

  J21_9: {
    name: "Acute Bronchiolitis",
    icd10: "J21.9",
    snomedCT: "4120002",
    category: "pediatric",
    definition: "Viral lower respiratory tract infection of infants with small airway inflammation and obstruction",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    ageGroup: "Infants (<2 years, peak 2-6 months)",
    
    pathophysiology: {
      mechanism: "Viral infection → bronchiolar inflammation → epithelial necrosis → mucus plugging → air trapping",
      organisms: "RSV (most common), rhinovirus, metapneumovirus, parainfluenza, adenovirus",
      timeline: "2-3 day prodrome → 3-7 days peak symptoms → gradual resolution over 2-3 weeks"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Rhinorrhea", frequency: "95%", description: "Nasal congestion, clear discharge" },
        { name: "Cough", frequency: "90%", description: "Initially dry, may become wet" },
        { name: "Low-grade fever", frequency: "50%", description: "Usually <38.5°C" },
        { name: "Poor feeding", frequency: "60%", description: "Due to respiratory distress" },
        { name: "Irritability", frequency: "50%", description: "Discomfort" }
      ],
      signs: [
        { name: "Tachypnea", description: "RR >60/min concerning" },
        { name: "Nasal flaring", description: "Increased work of breathing" },
        { name: "Subcostal/intercostal retractions", description: "Accessory muscle use" },
        { name: "Expiratory wheezing", description: "Small airway obstruction" },
        { name: "Fine crackles", description: "Airway secretions" },
        { name: "Hypoxia", description: "SpO2 <92% concerning" },
        { name: "Apnea", description: "Especially in young infants" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Clinical Diagnosis",
      clinical: "First episode of wheeze/respiratory distress in infant with viral URI prodrome",
      testing: "RSV testing if affects management or cohorting"
    },
    
    laboratoryFindings: [
      { name: "RSV PCR/antigen", normalRange: "Negative", abnormalInDisease: "Positive (confirms etiology)" },
      { name: "SpO2", normalRange: "≥95%", abnormalInDisease: "<92% indicates hypoxemia" },
      { name: "Blood gas", normalRange: "Normal", abnormalInDisease: "Respiratory acidosis if severe" }
    ],
    
    imagingFindings: {
      cxr: {
        indication: "Not routinely recommended",
        findings: ["Hyperinflation", "Peribronchial cuffing", "Atelectasis", "Usually normal"]
      }
    },
    
    severity: {
      mild: { description: "RR <60, SpO2 ≥92%, feeding well, no/mild retractions" },
      moderate: { description: "RR 60-70, SpO2 90-92%, decreased feeding, moderate retractions" },
      severe: { description: "RR >70, SpO2 <90%, poor feeding, severe retractions, apnea" }
    },
    
    modifications: {
      lungs: {
        physiology: {
          respiratory_rate: { factor: 1.5, note: "Tachypnea" },
          oxygen_saturation: { factor: 0.94, note: "Mild hypoxia" },
          airway_resistance: { factor: 2.0, note: "Bronchiolar obstruction" }
        },
        structure: {
          air_trapping: { factor: 1.5, note: "Hyperinflation" }
        }
      }
    },
    
    treatment: {
      supportive: ["Supplemental O2 for SpO2 <90-92%", "Hydration", "Nasal suctioning"],
      notRecommended: ["Bronchodilators (no routine benefit)", "Corticosteroids", "Antibiotics (unless secondary infection)"],
      highRisk: "Palivizumab prophylaxis for high-risk infants"
    }
  },

  // =====================
  // CROUP
  // ICD-10: J05.0
  // =====================

  J05_0: {
    name: "Acute Laryngotracheobronchitis (Croup)",
    icd10: "J05.0",
    snomedCT: "6142004",
    category: "pediatric",
    definition: "Viral upper airway infection causing subglottic inflammation and airway obstruction",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    ageGroup: "6 months to 3 years (peak)",
    
    pathophysiology: {
      mechanism: "Viral infection → subglottic mucosal inflammation/edema → airway narrowing → stridor",
      organisms: "Parainfluenza (75%), RSV, influenza, adenovirus",
      anatomy: "Subglottis is narrowest part of pediatric airway; 1mm edema reduces diameter by 50%"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Barking cough", frequency: "100%", description: "Seal-like, brassy" },
        { name: "Inspiratory stridor", frequency: "80%", description: "Worse at night" },
        { name: "Hoarseness", frequency: "85%", description: "Voice changes" },
        { name: "Low-grade fever", frequency: "50%", description: "Mild fever" },
        { name: "URI prodrome", frequency: "95%", description: "1-2 days before croup symptoms" }
      ],
      signs: [
        { name: "Inspiratory stridor", description: "High-pitched sound on inspiration" },
        { name: "Barking cough", description: "Characteristic seal-like cough" },
        { name: "Hoarseness", description: "Inflamed vocal cords" },
        { name: "Retractions", description: "Suprasternal, intercostal" },
        { name: "Tachypnea", description: "If moderate-severe" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Clinical Diagnosis",
      clinical: "Barking cough + inspiratory stridor + hoarseness, usually with URI prodrome",
      westleyScore: "Severity scoring: Level of consciousness, Cyanosis, Stridor, Air entry, Retractions"
    },
    
    imagingFindings: {
      xray: {
        indication: "Not routinely needed",
        findings: ["Steeple sign (subglottic narrowing)", "Typically normal"]
      }
    },
    
    severity: {
      mild: { description: "Barking cough, no stridor at rest, no retractions" },
      moderate: { description: "Stridor at rest, mild retractions, no distress" },
      severe: { description: "Significant stridor, marked retractions, distress, decreased air entry" }
    },
    
    modifications: {
      lungs: {
        structure: {
          subglottic_diameter: { factor: 0.5, note: "Narrowing from edema" }
        },
        physiology: {
          airway_resistance: { factor: 2.0, note: "Increased resistance" }
        }
      }
    },
    
    treatment: {
      mild: ["Cool mist (traditional, evidence limited)", "Comfort measures"],
      moderate_severe: ["Dexamethasone 0.6 mg/kg (single dose)", "Nebulized epinephrine (severe)"],
      observation: "3-4 hours after epinephrine for rebound"
    }
  },

  // =====================
  // FEBRILE SEIZURES
  // ICD-10: R56.0
  // =====================

  R56_0: {
    name: "Febrile Seizures",
    icd10: "R56.0",
    snomedCT: "41497008",
    category: "pediatric",
    definition: "Seizures associated with fever without CNS infection in developmentally normal children",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    ageGroup: "6 months to 5 years (peak 12-18 months)",
    
    pathophysiology: {
      mechanism: "Fever → lowered seizure threshold in immature brain → seizure",
      riskFactors: ["Family history", "Rapid temperature rise", "Viral infections (HHV-6, influenza)"],
      genetics: "Polygenic inheritance, increased risk with family history"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Fever", frequency: "100%", description: "Usually >38°C, often on rise" },
        { name: "Generalized tonic-clonic movements", frequency: "80%", description: "Simple FS" },
        { name: "Loss of consciousness", frequency: "90%", description: "During seizure" },
        { name: "Post-ictal drowsiness", frequency: "70%", description: "Brief in simple FS" }
      ],
      classification: {
        simple: ["Generalized", "Duration <15 min", "No recurrence in 24h", "Normal child"],
        complex: ["Focal features", "Duration >15 min", "Recurrence in 24h", "Pre-existing neurological abnormality"]
      }
    },
    
    diagnosticCriteria: {
      name: "Clinical Diagnosis",
      requirements: {
        age: "6 months to 5 years",
        fever: "Temperature ≥38°C",
        seizure: "Seizure without CNS infection",
        normal: "No history of afebrile seizures"
      },
      workup: {
        simple_fs: "No routine workup needed in well-appearing child",
        complex_fs: "Consider LP, EEG, neuroimaging based on clinical features",
        lp_indications: ["Meningeal signs", "Complex features", "<12 months (consider)", "Pretreated with antibiotics"]
      }
    },
    
    laboratoryFindings: [
      { name: "CBC", normalRange: "Normal", abnormalInDisease: "May show leukocytosis (infection)" },
      { name: "Glucose", normalRange: "70-100 mg/dL", abnormalInDisease: "Check if prolonged seizure" },
      { name: "CSF", normalRange: "Normal", abnormalInDisease: "Normal in febrile seizures (rule out meningitis if indicated)" }
    ],
    
    severity: {
      mild: { description: "Simple febrile seizure" },
      moderate: { description: "Complex febrile seizure" },
      severe: { description: "Febrile status epilepticus (>30 min)" }
    },
    
    modifications: {
      brain: {
        physiology: {
          seizure_threshold: { factor: 0.6, note: "Lowered by fever" },
          neuronal_excitability: { factor: 1.5, note: "Increased excitability" }
        }
      }
    },
    
    prognosis: {
      recurrence_risk: "30-35% will have another febrile seizure",
      epilepsy_risk: "2-4% (simple FS) vs 4-6% (complex FS) - slightly above general population 1%",
      development: "Normal cognitive outcome"
    }
  },

  // =====================
  // INTUSSUSCEPTION
  // ICD-10: K56.1
  // =====================

  K56_1: {
    name: "Intussusception",
    icd10: "K56.1",
    snomedCT: "20756009",
    category: "pediatric",
    definition: "Telescoping of proximal bowel into distal bowel causing obstruction and ischemia",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "blood"],
    ageGroup: "3-36 months (peak 5-9 months)",
    
    pathophysiology: {
      mechanism: "Lead point (lymphoid hyperplasia, Meckel's, polyp) → invagination of proximal into distal bowel → obstruction → vascular compromise → necrosis",
      location: "Ileocolic (most common, 90%)",
      triggers: ["Viral illness (lymphoid hyperplasia)", "Rotavirus vaccine (rare)", "Lead points (Meckel's, lymphoma, polyp) - more common >2 years"]
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Colicky abdominal pain", frequency: "85%", description: "Episodic, severe, drawing legs up" },
        { name: "Vomiting", frequency: "85%", description: "Initially non-bilious, then bilious" },
        { name: "Bloody stool", frequency: "50%", description: "Currant jelly stool (late sign)" },
        { name: "Lethargy", frequency: "40%", description: "May be only presenting sign" }
      ],
      classicTriad: {
        components: ["Colicky abdominal pain", "Vomiting", "Currant jelly stool"],
        frequency: "Present in <50%"
      },
      signs: [
        { name: "Sausage-shaped mass", description: "RUQ palpable mass" },
        { name: "Dance sign", description: "Empty RLQ" },
        { name: "Lethargy between episodes", description: "Altered consciousness" },
        { name: "Abdominal distension", description: "If obstruction established" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Ultrasound Diagnosis",
      clinical: "Suspect in infant with episodic abdominal pain, vomiting, lethargy",
      imaging: "Ultrasound: target/donut sign (transverse), pseudokidney sign (longitudinal)"
    },
    
    laboratoryFindings: [
      { name: "CBC", normalRange: "Normal", abnormalInDisease: "Leukocytosis (may indicate necrosis)" },
      { name: "Electrolytes", normalRange: "Normal", abnormalInDisease: "Dehydration, metabolic derangements" }
    ],
    
    imagingFindings: {
      ultrasound: {
        findings: ["Target/donut sign", "Pseudokidney sign", "Free fluid"],
        sensitivity: ">95%"
      },
      xray: {
        findings: ["May be normal early", "Soft tissue mass", "Bowel obstruction signs", "Absence of gas in RLQ"]
      },
      enema: {
        diagnostic_therapeutic: "Air or contrast enema for reduction"
      }
    },
    
    severity: {
      mild: { description: "Early presentation, stable" },
      moderate: { description: "Established intussusception, no signs of perforation" },
      severe: { description: "Peritonitis, perforation, shock" }
    },
    
    modifications: {
      gi_tract: {
        structure: {
          bowel_wall: { factor: 2.0, note: "Telescoped, edematous" }
        },
        physiology: {
          intestinal_transit: { factor: 0.0, note: "Obstruction" },
          bowel_perfusion: { factor: 0.5, note: "Vascular compromise" }
        }
      },
      blood: {
        geometry: {
          hemoglobin: { factor: 0.9, note: "If mucosal bleeding" }
        }
      }
    },
    
    treatment: {
      initial: ["NPO", "IV fluids", "NGT decompression"],
      reduction: "Air or hydrostatic enema (success rate 80-95%)",
      surgery: "If reduction fails, peritonitis, perforation, shock, or pathologic lead point"
    }
  },

  // =====================
  // PYLORIC STENOSIS
  // ICD-10: Q40.0
  // =====================

  Q40_0: {
    name: "Infantile Hypertrophic Pyloric Stenosis",
    icd10: "Q40.0",
    snomedCT: "76405001",
    category: "pediatric",
    definition: "Hypertrophy of pyloric muscle causing gastric outlet obstruction",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract"],
    ageGroup: "2-8 weeks (peak 3-5 weeks)",
    
    pathophysiology: {
      mechanism: "Progressive pyloric muscle hypertrophy → gastric outlet obstruction → non-bilious vomiting",
      etiology: "Multifactorial: genetic, environmental (erythromycin exposure)",
      epidemiology: "4:1 male predominance, firstborn males"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Projectile vomiting", frequency: "100%", description: "Non-bilious, immediately after feeding" },
        { name: "Hungry after vomiting", frequency: "95%", description: "Eager to feed again" },
        { name: "Weight loss/failure to thrive", frequency: "70%", description: "Despite adequate intake attempts" },
        { name: "Dehydration", frequency: "60%", description: "Decreased wet diapers" },
        { name: "Constipation", frequency: "50%", description: "Decreased stool output" }
      ],
      signs: [
        { name: "Olive-shaped mass", description: "Palpable in RUQ/epigastrium, best after vomiting" },
        { name: "Visible peristalsis", description: "Gastric waves across upper abdomen" },
        { name: "Dehydration signs", description: "Decreased skin turgor, sunken fontanelle" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Clinical + Ultrasound",
      clinical: "Progressive, non-bilious, projectile vomiting in 2-8 week infant",
      ultrasound: "Pyloric muscle thickness >3mm, pyloric length >15mm, target sign"
    },
    
    laboratoryFindings: [
      { name: "Electrolytes", normalRange: "Normal", abnormalInDisease: "Hypochloremic, hypokalemic metabolic alkalosis" },
      { name: "CO2", normalRange: "22-28 mEq/L", abnormalInDisease: "Elevated (metabolic alkalosis)" },
      { name: "Chloride", normalRange: "98-106 mEq/L", abnormalInDisease: "Low (gastric losses)" },
      { name: "Potassium", normalRange: "3.5-5.0 mEq/L", abnormalInDisease: "Low" }
    ],
    
    imagingFindings: {
      ultrasound: {
        findings: ["Muscle thickness >3mm", "Pyloric length >15mm", "Target/donut sign", "Failure of channel opening"],
        sensitivity: ">95%"
      },
      ugi: {
        findings: ["String sign", "Shoulder sign", "Caterpillar sign (rarely needed)"]
      }
    },
    
    severity: {
      mild: { description: "Early, minimal electrolyte disturbance" },
      moderate: { description: "Established vomiting, dehydration" },
      severe: { description: "Severe dehydration, significant metabolic alkalosis" }
    },
    
    modifications: {
      gi_tract: {
        structure: {
          pyloric_muscle: { factor: 3.0, note: "Hypertrophy" },
          gastric_volume: { factor: 1.5, note: "Distension" }
        },
        physiology: {
          gastric_emptying: { factor: 0.1, note: "Near-complete obstruction" }
        }
      },
      blood: {
        chemistry: {
          chloride: { factor: 0.85, note: "Hypochloremia" },
          potassium: { factor: 0.85, note: "Hypokalemia" },
          bicarbonate: { factor: 1.3, note: "Metabolic alkalosis" }
        }
      }
    },
    
    treatment: {
      preoperative: "Correct dehydration and electrolyte abnormalities (Cl >100, K >3.5)",
      surgical: "Ramstedt pyloromyotomy (laparoscopic or open)"
    }
  },

  // =====================
  // SCARLET FEVER
  // ICD-10: A38
  // =====================

  A38: {
    name: "Scarlet Fever",
    icd10: "A38",
    snomedCT: "30242009",
    category: "pediatric",
    definition: "Exotoxin-mediated illness associated with Group A Streptococcal pharyngitis",
    primaryOrgan: "skin",
    affectedOrgans: ["skin", "gi_tract", "lymphatic"],
    ageGroup: "School-age children (5-15 years)",
    
    pathophysiology: {
      mechanism: "GAS pharyngitis + pyrogenic exotoxin production → characteristic rash and enanthem",
      organisms: "Streptococcus pyogenes (Group A Strep)",
      exotoxins: "Streptococcal pyrogenic exotoxins (SPE) A, B, C"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Fever", frequency: "100%", description: "High fever, acute onset" },
        { name: "Sore throat", frequency: "95%", description: "Severe pharyngitis" },
        { name: "Headache", frequency: "70%", description: "Common" },
        { name: "Nausea/vomiting", frequency: "50%", description: "Especially in children" },
        { name: "Abdominal pain", frequency: "40%", description: "Common in children" }
      ],
      signs: [
        { name: "Sandpaper rash", description: "Fine papular, rough texture, blanching, trunk → extremities" },
        { name: "Pastia lines", description: "Petechiae in skin folds (antecubital, axillary)" },
        { name: "Circumoral pallor", description: "Pale area around mouth" },
        { name: "Strawberry tongue", description: "White coating then red papillae" },
        { name: "Exudative pharyngitis", description: "Red throat with exudate" },
        { name: "Anterior cervical lymphadenopathy", description: "Tender nodes" },
        { name: "Desquamation", description: "1-2 weeks after illness, especially hands/feet" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Clinical + GAS Confirmation",
      clinical: "Characteristic rash + pharyngitis",
      confirmation: "Rapid strep test or throat culture positive for GAS"
    },
    
    laboratoryFindings: [
      { name: "Rapid strep test", normalRange: "Negative", abnormalInDisease: "Positive" },
      { name: "Throat culture", normalRange: "Normal flora", abnormalInDisease: "GAS positive" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Leukocytosis" },
      { name: "ASO titer", normalRange: "<200 IU/mL", abnormalInDisease: "Rising titer (confirms recent infection)" }
    ],
    
    severity: {
      mild: { description: "Uncomplicated, responds to treatment" },
      moderate: { description: "Significant systemic symptoms" },
      severe: { description: "Complications (abscess, rheumatic fever)" }
    },
    
    modifications: {
      skin: {
        structure: {
          rash: { factor: 1.0, note: "Sandpaper-like eruption" }
        }
      },
      blood: {
        geometry: {
          wbc_count: { factor: 1.4, note: "Leukocytosis" }
        }
      },
      lymphatic: {
        structure: {
          lymph_node_size: { factor: 1.5, note: "Cervical lymphadenopathy" }
        }
      }
    },
    
    treatment: {
      antibiotic: "Penicillin or amoxicillin x 10 days (or azithromycin if allergic)",
      purpose: "Symptom relief, prevent complications (rheumatic fever, PSGN), reduce transmission"
    },
    
    complications: ["Peritonsillar abscess", "Acute rheumatic fever", "Post-strep glomerulonephritis", "PANDAS"]
  },

  // =====================
  // HENOCH-SCHONLEIN PURPURA
  // ICD-10: D69.0
  // =====================

  D69_0: {
    name: "Henoch-Schönlein Purpura (IgA Vasculitis)",
    icd10: "D69.0",
    snomedCT: "399960005",
    category: "pediatric",
    definition: "Small vessel IgA-mediated vasculitis with palpable purpura, arthritis, abdominal pain, and nephritis",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "skin", "gi_tract", "kidneys", "joints"],
    ageGroup: "2-11 years (peak 4-7 years)",
    
    pathophysiology: {
      mechanism: "IgA immune complex deposition in small vessels → vasculitis",
      trigger: "Often follows URI (GAS, viral)",
      pathology: "Leukocytoclastic vasculitis with IgA deposition"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Palpable purpura", frequency: "100%", description: "Required for diagnosis, buttocks/legs" },
        { name: "Arthritis/arthralgia", frequency: "75%", description: "Large joints, non-deforming" },
        { name: "Abdominal pain", frequency: "65%", description: "Colicky, may be severe" },
        { name: "Hematuria", frequency: "40%", description: "Renal involvement" }
      ],
      signs: [
        { name: "Palpable purpura", description: "Non-thrombocytopenic, gravity-dependent (buttocks, legs)" },
        { name: "Joint swelling", description: "Knees, ankles, tender, without deformity" },
        { name: "Abdominal tenderness", description: "May mimic acute abdomen" },
        { name: "Scrotal swelling", description: "In boys, may mimic torsion" }
      ]
    },
    
    diagnosticCriteria: {
      name: "EULAR/PRINTO/PRES Criteria",
      required: "Palpable purpura (mandatory criterion)",
      plus: "≥1 of: Abdominal pain, Arthritis/arthralgia, Renal involvement, IgA on biopsy"
    },
    
    laboratoryFindings: [
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Normal or elevated (not thrombocytopenic)" },
      { name: "IgA", normalRange: "Variable", abnormalInDisease: "Elevated in 50%" },
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Hematuria, proteinuria" },
      { name: "Creatinine", normalRange: "Age-dependent", abnormalInDisease: "May be elevated if nephritis severe" },
      { name: "Stool guaiac", normalRange: "Negative", abnormalInDisease: "Positive (GI bleeding)" }
    ],
    
    imagingFindings: {
      ultrasound: {
        abdominal: ["Bowel wall thickening", "Intussusception", "Free fluid"],
        scrotal: ["Rule out torsion if scrotal involvement"]
      }
    },
    
    severity: {
      mild: { description: "Skin only, minimal joint involvement" },
      moderate: { description: "GI involvement, mild nephritis" },
      severe: { description: "Severe nephritis, intussusception, GI hemorrhage" }
    },
    
    modifications: {
      blood: {
        geometry: {
          platelet_count: { factor: 1.0, note: "Normal (key diagnostic point)" }
        },
        proteins: {
          iga: { factor: 1.5, note: "Elevated" }
        }
      },
      skin: {
        structure: {
          purpura: { factor: 5.0, note: "Palpable purpura" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.85, note: "If nephritis" },
          proteinuria: { factor: 3.0, note: "Glomerular involvement" }
        }
      },
      gi_tract: {
        physiology: {
          intestinal_bleeding: { factor: 2.0, note: "GI involvement" }
        }
      }
    },
    
    treatment: {
      supportive: ["NSAIDs for arthritis", "Hydration", "Rest"],
      severe: ["Corticosteroids for severe GI or renal involvement"]
    },
    
    prognosis: {
      overall: "Self-limited in most, resolves in 4-6 weeks",
      recurrence: "30-40% recurrence, usually milder",
      renal: "Long-term outcome depends on renal involvement severity"
    }
  },

  // =====================
  // CROUP (Laryngotracheobronchitis)
  // ICD-10: J05.0
  // =====================

  J05_0: {
    name: "Croup (Laryngotracheobronchitis)",
    icd10: "J05.0",
    category: "pediatric",
    definition: "Viral upper airway infection causing subglottic edema and barking cough",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    ageGroup: "6 months - 3 years (peak 1-2 years)",
    
    pathophysiology: {
      mechanism: "Parainfluenza virus (75%) → subglottic inflammation and edema → airway narrowing",
      molecularBasis: "Viral-induced mucosal inflammation; subglottic region vulnerable due to narrow diameter"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Barking cough", frequency: "100%", description: "Seal-like or brassy" },
        { name: "Inspiratory stridor", frequency: "85%", description: "Worse at night" },
        { name: "Hoarseness", frequency: "80%", description: "Voice change" },
        { name: "URI prodrome", frequency: "70%", description: "1-2 days of rhinorrhea, cough" },
        { name: "Low-grade fever", frequency: "50%", description: "Usually <39°C" }
      ],
      signs: [
        "Inspiratory stridor",
        "Barking cough",
        "Suprasternal retractions",
        "Increased work of breathing"
      ]
    },
    
    diagnosticCriteria: {
      name: "Clinical Diagnosis",
      requirements: {
        clinical: "Barking cough + stridor + URI prodrome in typical age group",
        xray: "Steeple sign on AP neck X-ray (not routinely needed)",
        westleyScore: "Mild (0-2), Moderate (3-5), Severe (6-11), Impending failure (≥12)"
      }
    },
    
    differentialDiagnosis: [
      { condition: "Epiglottitis", distinguishing: "Toxic appearance, drooling, tripod position, no barking cough" },
      { condition: "Bacterial tracheitis", distinguishing: "High fever, toxic, poor response to croup treatment" },
      { condition: "Foreign body aspiration", distinguishing: "Sudden onset, choking history, focal findings" },
      { condition: "Peritonsillar abscess", distinguishing: "Severe throat pain, trismus, uvular deviation" }
    ],
    
    treatment: {
      mild: [
        { name: "Cool mist", indication: "Humidification", evidence: "IIB" },
        { name: "Oral dexamethasone", dose: "0.15-0.6 mg/kg single dose", indication: "All patients", evidence: "IA" }
      ],
      moderate_severe: [
        { name: "Nebulized epinephrine", dose: "0.5 mL/kg (max 5 mL) of 1:1000", indication: "Stridor at rest", evidence: "IA" },
        { name: "Dexamethasone", dose: "0.6 mg/kg PO/IM", indication: "All patients", evidence: "IA" }
      ],
      observation: [
        { name: "Monitor 2-4 hours", indication: "After nebulized epinephrine (rebound)" }
      ]
    },
    
    severity: {
      mild: { description: "Occasional barking cough, no stridor at rest" },
      moderate: { description: "Frequent cough, stridor at rest, mild retractions" },
      severe: { description: "Significant stridor, marked retractions, decreased air entry" }
    },
    
    modifications: {
      lungs: {
        geometry: {
          subglottic_diameter: { factor: 0.5, note: "Narrowing from edema" }
        },
        physiology: {
          airway_resistance: { factor: 2.5, note: "Increased due to narrowing" }
        }
      }
    }
  },

  // =====================
  // BRONCHIOLITIS
  // ICD-10: J21.9
  // =====================

  J21_9: {
    name: "Bronchiolitis",
    icd10: "J21.9",
    category: "pediatric",
    definition: "Viral lower respiratory infection causing small airway inflammation in infants",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs"],
    ageGroup: "< 2 years (peak 2-6 months)",
    
    pathophysiology: {
      mechanism: "RSV (60-80%) → bronchiolar epithelial necrosis → mucus plugging and air trapping",
      molecularBasis: "Viral-induced inflammation; ciliated cell destruction; edema and mucus production"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Cough", frequency: "100%", description: "Initially dry, may become productive" },
        { name: "Rhinorrhea", frequency: "90%", description: "Clear nasal discharge prodrome" },
        { name: "Tachypnea", frequency: "85%", description: "Increased respiratory rate" },
        { name: "Feeding difficulty", frequency: "70%", description: "Poor feeding due to respiratory distress" },
        { name: "Fever", frequency: "50%", description: "Low-grade, may be absent" }
      ],
      signs: [
        "Wheezing and crackles",
        "Tachypnea",
        "Nasal flaring",
        "Subcostal/intercostal retractions",
        "Hypoxemia"
      ]
    },
    
    diagnosticCriteria: {
      name: "Clinical Diagnosis",
      requirements: {
        clinical: "First episode of wheeze in infant <2 years + URI prodrome",
        testing: "RSV testing if cohorting needed; not routinely required",
        severity: "Based on feeding, hydration, respiratory effort, oxygen saturation"
      }
    },
    
    differentialDiagnosis: [
      { condition: "Asthma", distinguishing: "Recurrent episodes, family history, response to bronchodilators" },
      { condition: "Pertussis", distinguishing: "Paroxysmal cough, post-tussive vomiting, apnea" },
      { condition: "Heart failure", distinguishing: "Cardiomegaly, hepatomegaly, murmur" },
      { condition: "Aspiration", distinguishing: "Recurrent, associated with feeds, GERD history" }
    ],
    
    treatment: {
      supportive: [
        { name: "Nasal suctioning", indication: "Clear secretions", evidence: "IA" },
        { name: "Supplemental oxygen", indication: "SpO2 <90-92%", evidence: "IA" },
        { name: "Hydration", indication: "NG/IV if poor oral intake", evidence: "IA" }
      ],
      notRecommended: [
        { name: "Bronchodilators", note: "Not routinely effective" },
        { name: "Corticosteroids", note: "Not beneficial" },
        { name: "Antibiotics", note: "Unless secondary infection" }
      ],
      severe: [
        { name: "High-flow nasal cannula", indication: "Moderate-severe respiratory distress" },
        { name: "CPAP", indication: "Impending respiratory failure" }
      ]
    },
    
    riskFactors: {
      severe: ["Prematurity <37 weeks", "Age <3 months", "Congenital heart disease", "Immunodeficiency", "Chronic lung disease"],
      mortality: "1-3% in hospitalized patients; higher in high-risk groups"
    },
    
    modifications: {
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.92, note: "Hypoxemia" },
          airway_resistance: { factor: 3.0, note: "Small airway obstruction" }
        }
      }
    }
  },

  // =====================
  // FEBRILE SEIZURES
  // ICD-10: R56.00
  // =====================

  R56_00: {
    name: "Febrile Seizures",
    icd10: "R56.00",
    category: "pediatric",
    definition: "Seizure occurring with fever (≥38°C) in children 6 months to 5 years without CNS infection",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    ageGroup: "6 months - 5 years (peak 12-18 months)",
    
    pathophysiology: {
      mechanism: "Rapid rise in temperature → lowered seizure threshold in developing brain",
      molecularBasis: "Temperature-sensitive ion channels; immature GABAergic inhibition; genetic predisposition"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Generalized tonic-clonic seizure", frequency: "80%", description: "During febrile illness" },
        { name: "Brief duration", frequency: "90%", description: "Most <5 minutes (simple)" },
        { name: "Post-ictal drowsiness", frequency: "70%", description: "Brief in simple FS" }
      ],
      signs: [
        "Fever ≥38°C",
        "Tonic-clonic movements",
        "Brief post-ictal state",
        "Source of infection on exam"
      ]
    },
    
    diagnosticCriteria: {
      name: "AAP Guidelines",
      requirements: {
        simple: "Generalized, <15 min, once in 24h, no postictal focal findings",
        complex: "Focal, >15 min, recurs in 24h, or postictal focal findings",
        evaluation: "LP if signs of meningitis, immunocompromised, or pretreated with antibiotics"
      }
    },
    
    differentialDiagnosis: [
      { condition: "Meningitis/Encephalitis", distinguishing: "Stiff neck, altered consciousness, focal signs, abnormal LP" },
      { condition: "Epilepsy", distinguishing: "Recurrent unprovoked seizures, abnormal EEG" },
      { condition: "Electrolyte abnormality", distinguishing: "Hyponatremia, hypoglycemia on labs" },
      { condition: "Toxic ingestion", distinguishing: "History, toxidrome, toxicology screen" }
    ],
    
    treatment: {
      acute: [
        { name: "Supportive care", indication: "Position, airway, oxygen", evidence: "IA" },
        { name: "Benzodiazepine", indication: "If seizure >5 minutes", evidence: "IA", dose: "Midazolam 0.2 mg/kg IN or Diazepam 0.3 mg/kg PR" }
      ],
      prevention: [
        { name: "Antipyretics", note: "Do NOT prevent recurrence but treat comfort", evidence: "IA" }
      ],
      notRecommended: [
        { name: "Routine anticonvulsants", note: "Not recommended for simple FS" },
        { name: "Routine EEG", note: "Not indicated for simple FS" },
        { name: "Routine neuroimaging", note: "Not indicated for simple FS" }
      ]
    },
    
    prognosis: {
      recurrence: "30-35% recurrence risk; higher if age <15 months, lower fever, shorter duration before seizure",
      epilepsy: "2-4% develop epilepsy (vs 1% general population); higher risk with complex FS",
      development: "No adverse effects on development or behavior"
    },
    
    modifications: {
      brain: {
        physiology: {
          seizure_threshold: { factor: 0.5, note: "Lowered with fever" }
        }
      }
    }
  },

  // =====================
  // NEONATAL JAUNDICE
  // ICD-10: P59.9
  // =====================

  P59_9: {
    name: "Neonatal Jaundice (Hyperbilirubinemia)",
    icd10: "P59.9",
    category: "pediatric",
    definition: "Elevated unconjugated bilirubin in newborns, visible jaundice when >5 mg/dL",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "blood", "brain"],
    ageGroup: "Neonates (0-28 days)",
    
    pathophysiology: {
      mechanism: "Increased bilirubin production + immature conjugation + enhanced enterohepatic circulation",
      molecularBasis: "Shortened RBC lifespan; reduced UGT1A1 activity; β-glucuronidase in gut"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Yellow skin discoloration", frequency: "60%", description: "Cephalocaudal progression" },
        { name: "Poor feeding", frequency: "30%", description: "If severe or underlying cause" },
        { name: "Lethargy", frequency: "15%", description: "Concerning for severe hyperbilirubinemia" }
      ],
      signs: [
        "Jaundice (scleral → face → trunk → extremities)",
        "Cephalocaudal progression",
        "High-pitched cry (if kernicterus)"
      ]
    },
    
    diagnosticCriteria: {
      name: "AAP Phototherapy Guidelines",
      requirements: {
        measurement: "Transcutaneous or serum total bilirubin",
        nomogram: "Bhutani hour-specific nomogram for risk stratification",
        phototherapy: "Based on age in hours, risk factors, and bilirubin level"
      }
    },
    
    differentialDiagnosis: [
      { condition: "Breast milk jaundice", distinguishing: "Well-appearing, late onset, resolves with continued feeding" },
      { condition: "Breastfeeding failure jaundice", distinguishing: "Early onset, weight loss, dehydration" },
      { condition: "Hemolysis (ABO, Rh)", distinguishing: "Early onset <24h, positive DAT, anemia" },
      { condition: "G6PD deficiency", distinguishing: "Family history, ethnic background, no identifiable cause" },
      { condition: "Biliary atresia", distinguishing: "Conjugated hyperbilirubinemia, acholic stools, dark urine" }
    ],
    
    treatment: {
      phototherapy: [
        { name: "Intensive phototherapy", indication: "Based on AAP nomogram", evidence: "IA" },
        { name: "Hydration", indication: "Enteral preferred", evidence: "IA" }
      ],
      exchangeTransfusion: [
        { name: "Double volume exchange", indication: "Bilirubin exceeds exchange threshold or signs of BIND", evidence: "IA" }
      ],
      supportive: [
        { name: "Frequent feeding", indication: "Enhance elimination", evidence: "IA" }
      ]
    },
    
    riskFactors: {
      highRisk: ["Jaundice <24h", "Blood group incompatibility", "Prematurity", "Previous sibling with jaundice", "Cephalohematoma", "Exclusive breastfeeding"],
      kernicterus: "Bilirubin crossing blood-brain barrier → acute bilirubin encephalopathy"
    },
    
    modifications: {
      liver: {
        physiology: {
          bilirubin: { factor: 5.0, note: "Elevated indirect bilirubin" },
          ugt_activity: { factor: 0.3, note: "Reduced conjugation" }
        }
      },
      blood: {
        geometry: {
          rbc_lifespan: { factor: 0.7, note: "Shortened in neonates" }
        }
      }
    }
  },

  // =====================
  // PYLORIC STENOSIS
  // ICD-10: K31.1
  // =====================

  K31_1: {
    name: "Infantile Hypertrophic Pyloric Stenosis",
    icd10: "K31.1",
    category: "pediatric",
    definition: "Hypertrophy of pyloric muscle causing gastric outlet obstruction in infants",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract"],
    ageGroup: "3-6 weeks (range 2-12 weeks)",
    
    pathophysiology: {
      mechanism: "Progressive pyloric muscle hypertrophy → gastric outlet obstruction → non-bilious vomiting",
      molecularBasis: "Multifactorial; reduced nitric oxide synthase; abnormal innervation"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Projectile vomiting", frequency: "100%", description: "Non-bilious, immediately after feeds" },
        { name: "Hunger after vomiting", frequency: "90%", description: "Hungry vomiter" },
        { name: "Weight loss/FTT", frequency: "70%", description: "Poor weight gain" },
        { name: "Constipation", frequency: "60%", description: "Decreased stool output" }
      ],
      signs: [
        "Olive-shaped mass in RUQ (palpable in 60-80%)",
        "Visible gastric peristalsis",
        "Dehydration",
        "Hypochloremic, hypokalemic metabolic alkalosis"
      ]
    },
    
    diagnosticCriteria: {
      name: "Ultrasound Criteria",
      requirements: {
        ultrasound: "Pyloric muscle thickness >3 mm AND pyloric channel length >15 mm",
        clinical: "Non-bilious projectile vomiting in 3-6 week infant",
        labs: "Hypochloremic, hypokalemic metabolic alkalosis"
      }
    },
    
    differentialDiagnosis: [
      { condition: "GERD", distinguishing: "Non-projectile, may have bilious vomiting, normal ultrasound" },
      { condition: "Malrotation with volvulus", distinguishing: "Bilious vomiting, acute abdomen, emergency" },
      { condition: "Milk protein allergy", distinguishing: "Blood in stool, eczema, family history" },
      { condition: "Overfeeding", distinguishing: "Normal ultrasound, history of large volume feeds" }
    ],
    
    treatment: {
      preoperative: [
        { name: "IV fluid resuscitation", indication: "Correct dehydration and alkalosis", evidence: "IA" },
        { name: "Electrolyte correction", indication: "Chloride and potassium replacement", evidence: "IA" }
      ],
      surgical: [
        { name: "Pyloromyotomy (Ramstedt)", indication: "Definitive treatment", evidence: "IA", note: "Open or laparoscopic" }
      ],
      postoperative: [
        { name: "Advance feeds", indication: "Usually within 6-12 hours post-op", evidence: "IA" }
      ]
    },
    
    prognosis: {
      surgical: "Excellent outcomes with pyloromyotomy; cure rate >99%",
      complications: "Incomplete myotomy, mucosal perforation (rare)"
    },
    
    modifications: {
      gi_tract: {
        structure: {
          pyloric_thickness: { factor: 3.0, note: "Muscle hypertrophy" },
          pyloric_length: { factor: 2.0, note: "Elongated channel" }
        },
        physiology: {
          gastric_emptying: { factor: 0.1, note: "Severely delayed" }
        }
      },
      blood: {
        physiology: {
          chloride: { factor: 0.75, note: "Hypochloremia from vomiting" },
          potassium: { factor: 0.8, note: "Hypokalemia" },
          ph: { factor: 1.05, note: "Metabolic alkalosis" }
        }
      }
    }
  },

  // =====================
  // INTUSSUSCEPTION
  // ICD-10: K56.1
  // =====================

  K56_1: {
    name: "Intussusception",
    icd10: "K56.1",
    category: "pediatric",
    definition: "Telescoping of proximal bowel into distal segment, most commonly ileocolic",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract"],
    ageGroup: "3 months - 3 years (peak 5-9 months)",
    
    pathophysiology: {
      mechanism: "Lead point (lymphoid tissue, Meckel's) → invagination → bowel obstruction → venous congestion → ischemia",
      molecularBasis: "Idiopathic 90%; lead points: lymphoid hyperplasia (post-viral), polyps, Meckel's"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Intermittent colicky pain", frequency: "85%", description: "Episodes every 15-20 minutes, child draws legs up" },
        { name: "Vomiting", frequency: "70%", description: "Initially non-bilious, later bilious" },
        { name: "Currant jelly stool", frequency: "60%", description: "Blood and mucus (late finding)" },
        { name: "Lethargy", frequency: "50%", description: "Between pain episodes" }
      ],
      signs: [
        "Sausage-shaped mass in RUQ",
        "Dance's sign (empty RLQ)",
        "Abdominal distension",
        "Hemoccult positive stool"
      ]
    },
    
    diagnosticCriteria: {
      name: "Imaging Diagnosis",
      requirements: {
        ultrasound: "Target sign (short axis) or pseudokidney sign (long axis)",
        enema: "Coiled spring appearance (diagnostic and therapeutic)",
        clinical: "Classic triad: colicky pain, vomiting, currant jelly stool (only 20%)"
      }
    },
    
    differentialDiagnosis: [
      { condition: "Gastroenteritis", distinguishing: "Diarrhea, no mass, no obstruction" },
      { condition: "Appendicitis", distinguishing: "Older children, RLQ pain, fever" },
      { condition: "Meckel's diverticulum", distinguishing: "Painless rectal bleeding" },
      { condition: "Henoch-Schönlein purpura", distinguishing: "Purpuric rash, arthritis, may cause intussusception" }
    ],
    
    treatment: {
      nonoperative: [
        { name: "Air or contrast enema reduction", indication: "First-line if no peritonitis or perforation", evidence: "IA", success: "80-90%" }
      ],
      operative: [
        { name: "Surgical reduction or resection", indication: "Failed enema, perforation, peritonitis, pathologic lead point", evidence: "IA" }
      ],
      supportive: [
        { name: "NPO, IV fluids", indication: "All patients", evidence: "IA" },
        { name: "NGT decompression", indication: "If obstructed", evidence: "IA" }
      ]
    },
    
    prognosis: {
      overall: "Excellent with early treatment",
      recurrence: "5-10% recurrence, usually within 72 hours",
      mortality: "Low if treated early; higher if perforation/gangrene"
    },
    
    modifications: {
      gi_tract: {
        structure: {
          bowel_wall: { factor: 3.0, note: "Telescoped segment" }
        },
        physiology: {
          intestinal_blood_flow: { factor: 0.3, note: "Venous congestion → ischemia" }
        }
      }
    }
  }
};

export default PEDIATRIC_DISEASES;
