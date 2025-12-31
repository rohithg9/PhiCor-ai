// ============================================================
// OBSTETRIC/GYNECOLOGICAL DISEASES DATABASE
// Comprehensive OB/GYN conditions
// ICD-10: N00-N99 (Female genital tract), O00-O99 (Pregnancy)
// ============================================================

export const OBGYN_DISEASES = {
  // =====================
  // PREECLAMPSIA
  // ICD-10: O14.9
  // =====================

  O14_9: {
    name: "Preeclampsia",
    icd10: "O14.9",
    snomedCT: "398254007",
    category: "obstetric",
    definition: "Pregnancy-specific hypertensive disorder with new-onset hypertension and proteinuria or end-organ dysfunction after 20 weeks gestation",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "kidneys", "liver", "brain", "placenta"],
    
    pathophysiology: {
      mechanism: "Abnormal placentation → endothelial dysfunction → systemic vasoconstriction → multi-organ damage",
      molecularBasis: "Imbalanced angiogenic factors (↑sFlt-1, ↓PlGF); endothelial dysfunction; oxidative stress",
      placental: "Shallow trophoblast invasion → inadequate spiral artery remodeling → placental ischemia"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Headache", frequency: "40%", description: "Severe, frontal, not responsive to analgesics" },
        { name: "Visual changes", frequency: "20%", description: "Blurred vision, scotomata" },
        { name: "RUQ/epigastric pain", frequency: "15%", description: "Liver capsule distension" },
        { name: "Edema", frequency: "60%", description: "Rapid weight gain, facial edema" },
        { name: "Decreased urine output", frequency: "Variable", description: "Oliguria" }
      ],
      signs: [
        { name: "Hypertension", description: "BP ≥140/90 mmHg on 2 occasions" },
        { name: "Proteinuria", description: "≥300 mg/24h or protein/creatinine ≥0.3" },
        { name: "Edema", description: "Facial, hands, generalized" },
        { name: "Hyperreflexia", description: "Brisk reflexes, clonus (concerning)" }
      ]
    },
    
    diagnosticCriteria: {
      name: "ACOG Criteria",
      requirements: {
        hypertension: "BP ≥140/90 after 20 weeks in previously normotensive",
        plus_proteinuria: "≥300 mg/24h OR protein/creatinine ≥0.3 OR dipstick ≥2+",
        or_end_organ: "Thrombocytopenia <100K, Renal insufficiency Cr >1.1, Liver enzymes 2x, Pulmonary edema, Cerebral/visual symptoms"
      },
      severity: {
        without_severe: "Preeclampsia without severe features",
        with_severe: "BP ≥160/110 OR any end-organ dysfunction"
      }
    },
    
    laboratoryFindings: [
      { name: "Urine protein", normalRange: "<300 mg/24h", abnormalInDisease: "≥300 mg/24h" },
      { name: "Protein/Cr ratio", normalRange: "<0.3", abnormalInDisease: "≥0.3" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "<100 ×10⁹/L (severe)" },
      { name: "Creatinine", normalRange: "<1.0 mg/dL (pregnancy)", abnormalInDisease: ">1.1 mg/dL" },
      { name: "AST/ALT", normalRange: "<40 U/L", abnormalInDisease: ">2x upper limit" },
      { name: "LDH", normalRange: "<600 U/L", abnormalInDisease: "Elevated (hemolysis)" },
      { name: "Uric acid", normalRange: "<6 mg/dL", abnormalInDisease: "Elevated (correlates with severity)" },
      { name: "sFlt-1/PlGF ratio", normalRange: "<38", abnormalInDisease: ">38 suggests preeclampsia" }
    ],
    
    imagingFindings: {
      ultrasound: ["Fetal growth restriction", "Oligohydramnios", "Abnormal Dopplers"],
      ct_mri: ["PRES on brain imaging if eclampsia/neurological symptoms"]
    },
    
    severity: {
      mild: { description: "Preeclampsia without severe features" },
      severe: { description: "BP ≥160/110, thrombocytopenia, elevated LFTs, renal insufficiency, pulmonary edema, neurological symptoms" }
    },
    
    modifications: {
      blood: {
        pressures: {
          systolic_bp: { factor: 1.3, note: "Hypertension" },
          diastolic_bp: { factor: 1.25, note: "Hypertension" }
        },
        geometry: {
          platelet_count: { factor: 0.6, note: "Thrombocytopenia if severe" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.8, note: "Decreased renal function" },
          proteinuria: { factor: 10.0, note: "Significant proteinuria" }
        }
      },
      liver: {
        physiology: {
          ast_alt: { factor: 3.0, note: "Elevated if HELLP" }
        }
      }
    },
    
    complications: ["Eclampsia", "HELLP syndrome", "Placental abruption", "Stroke", "Acute kidney injury", "Fetal growth restriction", "Fetal demise"],
    
    treatment: {
      mild: ["Close monitoring", "Delivery at 37 weeks"],
      severe: ["Magnesium sulfate (seizure prophylaxis)", "Antihypertensives", "Delivery (definitive treatment)"],
      delivery: "Only cure is delivery of placenta"
    }
  },

  // =====================
  // POLYCYSTIC OVARY SYNDROME
  // ICD-10: E28.2
  // =====================

  E28_2: {
    name: "Polycystic Ovary Syndrome (PCOS)",
    icd10: "E28.2",
    snomedCT: "69878008",
    category: "gynecologic",
    definition: "Endocrine disorder with hyperandrogenism, ovulatory dysfunction, and polycystic ovaries",
    primaryOrgan: "ovaries",
    affectedOrgans: ["ovaries", "skin", "endocrine", "metabolism"],
    
    pathophysiology: {
      mechanism: "Hyperandrogenism + insulin resistance → anovulation, metabolic dysfunction",
      molecularBasis: "Increased LH/FSH ratio; theca cell androgen overproduction; insulin resistance → hyperinsulinemia → ↑androgens",
      metabolic: "Associated with obesity, metabolic syndrome, type 2 diabetes"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Irregular periods", frequency: "85%", description: "Oligomenorrhea or amenorrhea" },
        { name: "Hirsutism", frequency: "70%", description: "Excess hair growth in androgen-dependent areas" },
        { name: "Acne", frequency: "30%", description: "Androgen-mediated" },
        { name: "Infertility", frequency: "40%", description: "Anovulation" },
        { name: "Weight gain", frequency: "50%", description: "Often central obesity" }
      ],
      signs: [
        { name: "Hirsutism", description: "Male-pattern hair growth (face, chest, abdomen)" },
        { name: "Acne", description: "Inflammatory lesions" },
        { name: "Acanthosis nigricans", description: "Insulin resistance marker" },
        { name: "Central obesity", description: "Waist circumference increased" },
        { name: "Alopecia", description: "Male-pattern hair loss" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Rotterdam Criteria (2003)",
      requirements: "2 of 3: Oligo/anovulation, Clinical/biochemical hyperandrogenism, Polycystic ovaries on ultrasound",
      exclusions: "Rule out other causes (CAH, Cushing's, thyroid, prolactinoma)"
    },
    
    laboratoryFindings: [
      { name: "Total testosterone", normalRange: "<50 ng/dL", abnormalInDisease: "Elevated (50-150 ng/dL)" },
      { name: "Free testosterone", normalRange: "<8.5 pg/mL", abnormalInDisease: "Elevated" },
      { name: "DHEA-S", normalRange: "<400 μg/dL", abnormalInDisease: "May be mildly elevated" },
      { name: "LH/FSH ratio", normalRange: "1:1", abnormalInDisease: ">2:1 (suggestive)" },
      { name: "Fasting glucose", normalRange: "<100 mg/dL", abnormalInDisease: "May be elevated (insulin resistance)" },
      { name: "Fasting insulin", normalRange: "<25 μIU/mL", abnormalInDisease: "Elevated (hyperinsulinemia)" },
      { name: "17-OHP", normalRange: "<200 ng/dL", abnormalInDisease: "Normal (rules out CAH)" },
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Normal (rules out thyroid)" },
      { name: "Prolactin", normalRange: "<25 ng/mL", abnormalInDisease: "Normal (rules out prolactinoma)" }
    ],
    
    imagingFindings: {
      transvaginal_ultrasound: ["≥12 follicles (2-9mm) in each ovary OR ovarian volume >10mL", "Pearl necklace sign"]
    },
    
    severity: {
      mild: { description: "Oligomenorrhea, mild hirsutism, normal BMI" },
      moderate: { description: "Amenorrhea, moderate symptoms, overweight" },
      severe: { description: "Amenorrhea, severe hirsutism, obesity, metabolic syndrome" }
    },
    
    modifications: {
      ovaries: {
        structure: {
          ovarian_volume: { factor: 1.5, note: "Enlarged" },
          follicle_count: { factor: 2.0, note: "Multiple small follicles" }
        },
        physiology: {
          ovulation: { factor: 0.3, note: "Anovulation" }
        }
      },
      endocrine: {
        physiology: {
          testosterone: { factor: 1.8, note: "Hyperandrogenism" },
          lh_fsh_ratio: { factor: 2.5, note: "Elevated ratio" },
          insulin: { factor: 2.0, note: "Hyperinsulinemia" }
        }
      },
      skin: {
        structure: {
          hair_growth: { factor: 2.0, note: "Hirsutism" }
        }
      }
    },
    
    metabolicRisks: ["Type 2 diabetes (5-10x risk)", "Metabolic syndrome", "Cardiovascular disease", "Endometrial hyperplasia/cancer", "Obstructive sleep apnea"],
    
    treatment: {
      lifestyle: "Weight loss, diet, exercise (first-line)",
      menstrual_regulation: "Combined OCPs",
      hirsutism: "OCPs, spironolactone, metformin",
      fertility: "Letrozole (first-line), clomiphene, gonadotropins, IVF"
    }
  },

  // =====================
  // ENDOMETRIOSIS
  // ICD-10: N80.9
  // =====================

  N80_9: {
    name: "Endometriosis",
    icd10: "N80.9",
    snomedCT: "129103003",
    category: "gynecologic",
    definition: "Presence of endometrial-like tissue outside the uterus causing inflammation and pain",
    primaryOrgan: "uterus",
    affectedOrgans: ["uterus", "ovaries", "gi_tract", "bladder"],
    
    pathophysiology: {
      mechanism: "Ectopic endometrial tissue → cyclical hormone-responsive growth → inflammation, scarring, adhesions",
      theories: ["Retrograde menstruation (Sampson)", "Coelomic metaplasia", "Lymphatic/vascular spread", "Stem cell theory"],
      molecularBasis: "Estrogen-dependent growth; altered immune response; local estrogen production"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Dysmenorrhea", frequency: "80%", description: "Progressive, severe menstrual pain" },
        { name: "Chronic pelvic pain", frequency: "70%", description: "Non-cyclic pain" },
        { name: "Dyspareunia", frequency: "60%", description: "Deep pain with intercourse" },
        { name: "Infertility", frequency: "40%", description: "Up to 50% of infertile women have endometriosis" },
        { name: "Dyschezia", frequency: "30%", description: "Painful bowel movements" },
        { name: "Dysuria", frequency: "20%", description: "If bladder involvement" }
      ],
      signs: [
        { name: "Tender nodules", description: "Uterosacral ligament tenderness" },
        { name: "Fixed retroversion", description: "Immobile uterus" },
        { name: "Adnexal masses", description: "Endometriomas (chocolate cysts)" },
        { name: "Cul-de-sac tenderness", description: "Nodularity" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Clinical + Surgical",
      clinical: "Symptoms + exam findings highly suggestive",
      definitive: "Laparoscopy with histologic confirmation (gold standard)"
    },
    
    laboratoryFindings: [
      { name: "CA-125", normalRange: "<35 U/mL", abnormalInDisease: "May be elevated (not specific or sensitive)" }
    ],
    
    imagingFindings: {
      transvaginal_ultrasound: ["Endometriomas (ground-glass appearance)", "Deep infiltrating endometriosis"],
      mri: ["Mapping deep infiltrating endometriosis", "T1 hyperintense (hemorrhage)", "Shading sign"]
    },
    
    staging: {
      name: "Revised ASRM Classification",
      stage_I: "Minimal: Isolated implants, no adhesions",
      stage_II: "Mild: Superficial implants <5cm",
      stage_III: "Moderate: Deep implants, small endometriomas, mild adhesions",
      stage_IV: "Severe: Large endometriomas, dense adhesions"
    },
    
    severity: {
      mild: { description: "Stage I-II, minimal symptoms" },
      moderate: { description: "Stage II-III, significant symptoms" },
      severe: { description: "Stage III-IV, severe symptoms, infertility" }
    },
    
    modifications: {
      uterus: {
        structure: {
          implant_count: { factor: 5.0, note: "Ectopic tissue" },
          adhesions: { factor: 3.0, note: "Scarring" }
        }
      },
      ovaries: {
        structure: {
          endometrioma: { factor: 3.0, note: "Chocolate cysts" }
        },
        physiology: {
          ovarian_reserve: { factor: 0.7, note: "May be reduced" }
        }
      }
    },
    
    treatment: {
      medical: ["NSAIDs (pain)", "Hormonal (OCPs, progestins, GnRH agonists, GnRH antagonists)"],
      surgical: ["Laparoscopic excision/ablation", "Endometrioma cystectomy"],
      fertility: ["Surgery to restore anatomy", "IVF if severe"]
    }
  },

  // =====================
  // ECTOPIC PREGNANCY
  // ICD-10: O00.9
  // =====================

  O00_9: {
    name: "Ectopic Pregnancy",
    icd10: "O00.9",
    snomedCT: "34801009",
    category: "obstetric",
    definition: "Implantation of fertilized egg outside the uterine cavity, most commonly in fallopian tube",
    primaryOrgan: "uterus",
    affectedOrgans: ["uterus", "blood"],
    
    pathophysiology: {
      mechanism: "Fertilized ovum implants in extrauterine location → growth → rupture risk",
      location: "Tubal (95%): Ampullary (70%), Isthmic (12%), Fimbrial (11%), Interstitial (2%)",
      riskFactors: ["Prior ectopic", "PID/STI history", "Tubal surgery", "IVF", "IUD", "Smoking"]
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Abdominal/pelvic pain", frequency: "95%", description: "Unilateral, may be diffuse if ruptured" },
        { name: "Vaginal bleeding", frequency: "80%", description: "Light, irregular" },
        { name: "Amenorrhea", frequency: "75%", description: "Missed period" },
        { name: "Shoulder pain", frequency: "Variable", description: "If diaphragm irritation (rupture)" },
        { name: "Syncope", frequency: "Variable", description: "If significant bleeding" }
      ],
      signs: [
        { name: "Adnexal tenderness", description: "Unilateral" },
        { name: "Adnexal mass", description: "Palpable (not always)" },
        { name: "Cervical motion tenderness", description: "Chandelier sign" },
        { name: "Peritoneal signs", description: "If ruptured" },
        { name: "Hemodynamic instability", description: "If ruptured with significant bleeding" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Clinical + hCG + Ultrasound",
      algorithm: {
        hcg: "Discriminatory zone: 1500-2000 mIU/mL (TVUS should see IUP)",
        no_iup: "No IUP above discriminatory zone → highly suspicious",
        findings: "Extrauterine gestational sac, tubal ring sign, live embryo outside uterus"
      }
    },
    
    laboratoryFindings: [
      { name: "β-hCG", normalRange: "Negative", abnormalInDisease: "Positive, may not double appropriately" },
      { name: "Progesterone", normalRange: ">25 ng/mL (viable IUP)", abnormalInDisease: "<5 ng/mL suggests nonviable (ectopic or SAB)" },
      { name: "Hemoglobin", normalRange: "12-16 g/dL", abnormalInDisease: "Low if bleeding/ruptured" }
    ],
    
    imagingFindings: {
      transvaginal_ultrasound: ["Empty uterus with positive hCG", "Adnexal mass (tubal ring)", "Free fluid in pelvis", "Live ectopic (rare)"]
    },
    
    severity: {
      mild: { description: "Unruptured, stable, small ectopic" },
      moderate: { description: "Unruptured, larger ectopic, symptoms" },
      severe: { description: "Ruptured, hemodynamic instability" }
    },
    
    modifications: {
      blood: {
        geometry: {
          hemoglobin: { factor: 0.7, note: "If ruptured with bleeding" }
        },
        pressures: {
          blood_pressure: { factor: 0.8, note: "Hypotension if ruptured" }
        }
      },
      uterus: {
        structure: {
          empty_uterus: { factor: 1.0, note: "No IUP despite positive hCG" }
        }
      }
    },
    
    treatment: {
      expectant: "Selected cases: stable, declining hCG, very low initial hCG",
      medical: "Methotrexate: stable, unruptured, hCG <5000, no fetal cardiac activity",
      surgical: ["Laparoscopy: salpingostomy or salpingectomy", "Laparotomy: if ruptured, unstable"]
    },
    
    prognosis: {
      future_fertility: "Depends on treatment and tubal status",
      recurrence_risk: "10-15% after one ectopic"
    }
  },

  // =====================
  // UTERINE FIBROIDS
  // ICD-10: D25.9
  // =====================

  D25_9: {
    name: "Uterine Leiomyoma (Fibroids)",
    icd10: "D25.9",
    snomedCT: "95315005",
    category: "gynecologic",
    definition: "Benign smooth muscle tumors of the uterus, most common pelvic tumor in women",
    primaryOrgan: "uterus",
    affectedOrgans: ["uterus", "blood", "bladder"],
    
    pathophysiology: {
      mechanism: "Clonal expansion of single myocyte → estrogen/progesterone-dependent growth",
      molecularBasis: "MED12 mutations (70%), HMGA2 rearrangements; estrogen/progesterone receptors",
      location: {
        subserosal: "Outer surface, may be pedunculated",
        intramural: "Within myometrium (most common)",
        submucosal: "Into uterine cavity (most symptomatic)"
      }
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Heavy menstrual bleeding", frequency: "60%", description: "Menorrhagia, prolonged periods" },
        { name: "Pelvic pressure/pain", frequency: "40%", description: "Bulk symptoms" },
        { name: "Urinary frequency", frequency: "30%", description: "Bladder compression" },
        { name: "Constipation", frequency: "20%", description: "Rectal compression" },
        { name: "Infertility", frequency: "Variable", description: "Especially submucosal" },
        { name: "Asymptomatic", frequency: "50%", description: "Incidental finding" }
      ],
      signs: [
        { name: "Enlarged, irregular uterus", description: "Palpable on exam" },
        { name: "Anemia signs", description: "Pallor from chronic blood loss" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Imaging Diagnosis",
      clinical: "Enlarged uterus, heavy bleeding",
      imaging: "TVUS or MRI confirms diagnosis"
    },
    
    laboratoryFindings: [
      { name: "Hemoglobin", normalRange: "12-16 g/dL", abnormalInDisease: "Low (iron deficiency anemia from bleeding)" },
      { name: "Ferritin", normalRange: ">20 ng/mL", abnormalInDisease: "Low (iron deficiency)" },
      { name: "MCV", normalRange: "80-100 fL", abnormalInDisease: "Low (microcytic anemia)" }
    ],
    
    imagingFindings: {
      transvaginal_ultrasound: ["Hypoechoic masses", "Well-circumscribed", "Posterior shadowing"],
      mri: ["Gold standard for mapping", "T2 hypointense", "Excellent for surgical planning"],
      saline_infusion_sonography: ["Submucosal fibroids distorting cavity"]
    },
    
    severity: {
      mild: { description: "Small, asymptomatic" },
      moderate: { description: "Symptomatic, manageable with medical therapy" },
      severe: { description: "Large, severely symptomatic, anemia, infertility" }
    },
    
    modifications: {
      uterus: {
        structure: {
          uterine_volume: { factor: 3.0, note: "Enlarged uterus" },
          fibroid_count: { factor: 5.0, note: "Multiple masses" }
        }
      },
      blood: {
        geometry: {
          hemoglobin: { factor: 0.75, note: "Anemia from menorrhagia" },
          mcv: { factor: 0.85, note: "Microcytic" }
        },
        proteins: {
          ferritin: { factor: 0.3, note: "Iron deficiency" }
        }
      }
    },
    
    treatment: {
      medical: ["Hormonal (OCPs, progestins, GnRH agonists/antagonists)", "Tranexamic acid", "NSAIDs"],
      procedural: ["Uterine artery embolization", "MRI-guided focused ultrasound"],
      surgical: ["Myomectomy (preserve uterus)", "Hysterectomy (definitive)"]
    }
  },

  // =====================
  // GESTATIONAL DIABETES
  // ICD-10: O24.4
  // =====================

  O24_4: {
    name: "Gestational Diabetes Mellitus",
    icd10: "O24.4",
    snomedCT: "11687002",
    category: "obstetric",
    definition: "Glucose intolerance with onset or first recognition during pregnancy",
    primaryOrgan: "pancreas",
    affectedOrgans: ["pancreas", "placenta", "blood"],
    
    pathophysiology: {
      mechanism: "Placental hormones → insulin resistance → pancreatic β-cell compensation failure in susceptible women",
      hormones: "Human placental lactogen, cortisol, estrogen, progesterone → diabetogenic effect",
      timing: "Usually develops in 2nd-3rd trimester when insulin resistance peaks"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Often asymptomatic", frequency: "Most", description: "Detected on screening" },
        { name: "Polydipsia", frequency: "20%", description: "Increased thirst" },
        { name: "Polyuria", frequency: "20%", description: "Increased urination" }
      ],
      signs: [
        { name: "Large for gestational age fetus", description: "Macrosomia" },
        { name: "Polyhydramnios", description: "Excess amniotic fluid" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Two-Step or One-Step Approach",
      two_step: {
        screening: "50g GCT at 24-28 weeks, 1-hour ≥130-140 mg/dL → proceed to 3-hour",
        diagnostic: "100g OGTT: Fasting ≥95, 1hr ≥180, 2hr ≥155, 3hr ≥140 (2 abnormal values)"
      },
      one_step: {
        diagnostic: "75g OGTT: Fasting ≥92, 1hr ≥180, 2hr ≥153 (1 abnormal value)"
      }
    },
    
    laboratoryFindings: [
      { name: "Fasting glucose", normalRange: "<95 mg/dL (pregnancy)", abnormalInDisease: "≥95 mg/dL" },
      { name: "1-hr post-glucose", normalRange: "<180 mg/dL", abnormalInDisease: "≥180 mg/dL" },
      { name: "2-hr post-glucose", normalRange: "<155 mg/dL", abnormalInDisease: "≥155 mg/dL" },
      { name: "HbA1c", normalRange: "<5.7%", abnormalInDisease: "May be elevated (not diagnostic)" }
    ],
    
    fetalComplications: ["Macrosomia", "Birth injury", "Neonatal hypoglycemia", "Respiratory distress", "Hyperbilirubinemia", "Stillbirth (if uncontrolled)"],
    
    maternalComplications: ["Preeclampsia", "Cesarean delivery", "Future type 2 diabetes (50% at 5-10 years)"],
    
    severity: {
      mild: { description: "A1GDM: Diet-controlled, fasting <95" },
      moderate: { description: "A2GDM: Requires medication" },
      severe: { description: "Poorly controlled, complications" }
    },
    
    modifications: {
      blood: {
        chemistry: {
          glucose_fasting: { factor: 1.3, note: "Elevated fasting glucose" },
          glucose_postprandial: { factor: 1.5, note: "Elevated post-meal" }
        }
      },
      pancreas: {
        physiology: {
          insulin_secretion: { factor: 0.7, note: "Relative insufficiency" },
          insulin_sensitivity: { factor: 0.5, note: "Resistance" }
        }
      }
    },
    
    treatment: {
      diet: "Medical nutrition therapy, carbohydrate counting",
      exercise: "Moderate exercise",
      medications: ["Insulin (first-line)", "Metformin or glyburide (some use)"],
      monitoring: "Self-monitoring of blood glucose (fasting + post-meals)"
    },
    
    postpartum: {
      testing: "75g OGTT at 4-12 weeks postpartum",
      counseling: "Lifestyle modification, screening for diabetes long-term"
    }
  },

  // =====================
  // CERVICAL CANCER
  // ICD-10: C53.9
  // =====================

  C53_9: {
    name: "Cervical Cancer",
    icd10: "C53.9",
    snomedCT: "363354003",
    category: "gynecologic",
    definition: "Malignant neoplasm of the cervix, strongly associated with persistent HPV infection",
    primaryOrgan: "uterus",
    affectedOrgans: ["uterus", "lymphatic", "bladder", "rectum"],
    
    pathophysiology: {
      mechanism: "Persistent high-risk HPV → cervical dysplasia (CIN) → invasive carcinoma",
      hpv: "HPV 16 and 18 cause 70% of cervical cancers",
      molecularBasis: "E6 → p53 degradation; E7 → Rb inactivation; genomic instability",
      histology: "Squamous cell carcinoma (70-80%), Adenocarcinoma (20-25%)"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Postcoital bleeding", frequency: "40%", description: "Bleeding after intercourse" },
        { name: "Abnormal vaginal bleeding", frequency: "60%", description: "Intermenstrual, postmenopausal" },
        { name: "Vaginal discharge", frequency: "30%", description: "May be blood-tinged or malodorous" },
        { name: "Pelvic pain", frequency: "Variable", description: "Advanced disease" },
        { name: "Asymptomatic", frequency: "Early", description: "Detected on screening" }
      ],
      advancedSymptoms: ["Leg edema (lymphatic obstruction)", "Hydronephrosis", "Sciatica", "Hematuria/rectal bleeding"],
      signs: [
        { name: "Visible cervical lesion", description: "Exophytic, ulcerative, or barrel-shaped" },
        { name: "Friable cervix", description: "Bleeds easily on contact" },
        { name: "Parametrial involvement", description: "On rectovaginal exam (advanced)" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Histologic Diagnosis",
      screening: "Pap smear + HPV co-testing",
      colposcopy: "For abnormal screening",
      biopsy: "Definitive diagnosis"
    },
    
    laboratoryFindings: [
      { name: "HPV testing", normalRange: "Negative", abnormalInDisease: "High-risk HPV positive (16, 18)" },
      { name: "Pap smear", normalRange: "Normal", abnormalInDisease: "HSIL, ASC-H, invasive" },
      { name: "SCC antigen", normalRange: "<1.5 ng/mL", abnormalInDisease: "Elevated (squamous cell type)" }
    ],
    
    imagingFindings: {
      mri: ["Tumor size/extent", "Parametrial invasion", "Nodal involvement", "Best for staging"],
      ct: ["Lymphadenopathy", "Distant metastases"],
      pet_ct: ["Staging", "Metabolic activity", "Recurrence detection"]
    },
    
    staging: {
      name: "FIGO Staging (2018)",
      I: "Confined to cervix",
      II: "Beyond cervix, not to pelvic wall or lower 1/3 vagina",
      III: "To pelvic wall or lower vagina or hydronephrosis or nodes",
      IV: "Bladder/rectum invasion or distant metastases"
    },
    
    severity: {
      mild: { description: "Stage I, early" },
      moderate: { description: "Stage II, locally advanced" },
      severe: { description: "Stage III-IV, advanced/metastatic" }
    },
    
    modifications: {
      uterus: {
        structure: {
          cervical_mass: { factor: 3.0, note: "Tumor" }
        }
      },
      lymphatic: {
        structure: {
          pelvic_nodes: { factor: 2.0, note: "Lymphadenopathy" }
        }
      }
    },
    
    prevention: {
      primary: "HPV vaccination (9-valent: 9vHPV)",
      secondary: "Screening: Pap smear + HPV co-testing"
    },
    
    treatment: {
      early: ["Conization", "Simple hysterectomy", "Radical hysterectomy + lymphadenectomy"],
      advanced: ["Concurrent chemoradiation (cisplatin-based)", "Pelvic exenteration (recurrence)"]
    }
  }
};

export default OBGYN_DISEASES;
