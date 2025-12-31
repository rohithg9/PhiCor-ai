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

};

export default PEDIATRIC_DISEASES;
