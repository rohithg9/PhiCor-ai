// ============================================================
// DERMATOLOGICAL DISEASES DATABASE
// Comprehensive skin and subcutaneous tissue disorders
// ICD-10: L00-L99 (Diseases of the skin and subcutaneous tissue)
// ============================================================

export const DERMATOLOGICAL_DISEASES = {
  // =====================
  // PSORIASIS
  // ICD-10: L40.0
  // =====================

  L40_0: {
    name: "Psoriasis Vulgaris",
    icd10: "L40.0",
    snomedCT: "9014002",
    category: "dermatological",
    definition: "Chronic immune-mediated inflammatory skin disease with hyperproliferative keratinocytes",
    primaryOrgan: "skin",
    affectedOrgans: ["skin", "joints", "nails"],
    
    pathophysiology: {
      mechanism: "T-cell mediated autoimmune response → keratinocyte hyperproliferation → epidermal turnover 3-5 days (vs 28-30 normal)",
      molecularBasis: "IL-17/IL-23 axis; TNF-α; Th17 cells; genetic predisposition (HLA-Cw6)",
      timeline: "Chronic relapsing-remitting course",
      equations: {
        epidermalTurnover: {
          name: "Keratinocyte Proliferation Rate",
          latex: "T_{turnover} = \\frac{28-30 \\text{ days (normal)}}{3-5 \\text{ days (psoriasis)}} \\approx 6-10x",
          description: "Accelerated epidermal turnover in psoriatic plaques"
        },
        pasiScore: {
          name: "PASI Score Calculation",
          latex: "PASI = 0.1(E_h + I_h + D_h)A_h + 0.2(E_u + I_u + D_u)A_u + 0.3(E_t + I_t + D_t)A_t + 0.4(E_l + I_l + D_l)A_l",
          description: "Psoriasis Area and Severity Index (0-72)",
          normalRange: "0",
          mildDisease: "<10",
          moderateDisease: "10-20",
          severeDisease: ">20"
        }
      }
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Pruritus", frequency: "80%", description: "Itching, often severe" },
        { name: "Burning sensation", frequency: "40%", description: "Especially in inverse psoriasis" },
        { name: "Skin pain", frequency: "30%", description: "Cracked plaques" },
        { name: "Joint pain", frequency: "30%", description: "May indicate psoriatic arthritis" },
        { name: "Nail changes", frequency: "50%", description: "Pitting, onycholysis" }
      ],
      signs: [
        { name: "Well-demarcated erythematous plaques", location: "Extensor surfaces, scalp, trunk" },
        { name: "Silvery-white scales", description: "Micaceous scale" },
        { name: "Auspitz sign", description: "Pinpoint bleeding when scale removed" },
        { name: "Koebner phenomenon", description: "Lesions at sites of trauma" },
        { name: "Nail pitting", description: "Ice-pick depressions" },
        { name: "Onycholysis", description: "Nail plate separation" },
        { name: "Oil drop sign", description: "Salmon-colored nail bed discoloration" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Clinical Diagnosis",
      clinical: "Characteristic plaques with silvery scale on extensor surfaces",
      supportive: ["Family history", "Koebner phenomenon", "Nail changes"],
      biopsy: "Reserved for atypical presentations"
    },
    
    laboratoryFindings: [
      { name: "HLA-Cw6", normalRange: "Negative", abnormalInDisease: "Positive (60-65% of patients)", note: "Associated with early onset" },
      { name: "ESR/CRP", normalRange: "Normal", abnormalInDisease: "May be elevated in severe disease" },
      { name: "Uric acid", normalRange: "<7 mg/dL", abnormalInDisease: "May be elevated (increased cell turnover)" },
      { name: "RF", normalRange: "Negative", abnormalInDisease: "Negative (differentiates from RA)" }
    ],
    
    imagingFindings: {
      dermoscopy: ["Dotted vessels", "White scales", "Red background"],
      xray: ["Pencil-in-cup deformity (if PsA)", "Enthesophytes"],
      mri: ["Enthesitis", "Synovitis (if PsA)"]
    },
    
    histopathology: {
      epidermis: ["Acanthosis (epidermal thickening)", "Parakeratosis (nuclei in stratum corneum)", "Munro microabscesses (neutrophils in stratum corneum)", "Loss of granular layer"],
      dermis: ["Dilated, tortuous capillaries in dermal papillae", "Perivascular lymphocytic infiltrate", "Suprapapillary thinning"]
    },
    
    severity: {
      mild: { description: "BSA <3%, PASI <10, DLQI <10" },
      moderate: { description: "BSA 3-10%, PASI 10-20, DLQI 10-20" },
      severe: { description: "BSA >10%, PASI >20, DLQI >20, or involvement of special sites" }
    },
    
    modifications: {
      skin: {
        structure: {
          epidermal_thickness: { factor: 3.0, note: "Acanthosis" },
          keratinocyte_turnover: { factor: 8.0, note: "Hyperproliferation" },
          scale_formation: { factor: 5.0, note: "Parakeratosis" }
        },
        physiology: {
          barrier_function: { factor: 0.6, note: "Impaired skin barrier" }
        }
      },
      blood: {
        proteins: {
          crp: { factor: 1.5, note: "Systemic inflammation" },
          uric_acid: { factor: 1.3, note: "Cell turnover" }
        }
      },
      joints: {
        structure: {
          enthesitis: { factor: 2.0, note: "If psoriatic arthritis" }
        }
      }
    },
    
    differentialDiagnosis: ["Seborrheic dermatitis", "Eczema", "Pityriasis rosea", "Tinea corporis", "Lichen planus", "Secondary syphilis"],
    
    treatment: {
      topical: [
        { name: "Corticosteroids", examples: "Betamethasone, Triamcinolone", indication: "First-line for localized", evidence: "IA" },
        { name: "Vitamin D analogues", examples: "Calcipotriol", indication: "Steroid-sparing", evidence: "IA" },
        { name: "Calcineurin inhibitors", examples: "Tacrolimus", indication: "Face, intertriginous", evidence: "IB" }
      ],
      phototherapy: [
        { name: "NB-UVB", indication: "Moderate-severe, widespread", evidence: "IA" }
      ],
      systemic: [
        { name: "Methotrexate", dose: "7.5-25 mg weekly", indication: "Moderate-severe", evidence: "IA" },
        { name: "Cyclosporine", indication: "Rapid control", evidence: "IA" },
        { name: "Acitretin", indication: "Pustular, palmoplantar", evidence: "IA" }
      ],
      biologics: [
        { name: "IL-17 inhibitors", examples: "Secukinumab, Ixekizumab", indication: "Moderate-severe", evidence: "IA" },
        { name: "IL-23 inhibitors", examples: "Guselkumab, Risankizumab", indication: "Moderate-severe", evidence: "IA" },
        { name: "TNF inhibitors", examples: "Adalimumab", indication: "Alternative", evidence: "IA" }
      ]
    },
    riskStratification: {
      psaRisk: "30% develop psoriatic arthritis; screen regularly",
      cardiovascularRisk: "2-3x increased CV events; treat as CV risk equivalent",
      metabolicRisk: "Increased metabolic syndrome, diabetes"
    },
    complications: ["Psoriatic arthritis (30%)", "Cardiovascular disease", "Metabolic syndrome", "Depression", "Erythrodermic psoriasis", "Pustular psoriasis"]
  },

  // =====================
  // ATOPIC DERMATITIS
  // ICD-10: L20.9
  // =====================

  L20_9: {
    name: "Atopic Dermatitis (Eczema)",
    icd10: "L20.9",
    snomedCT: "24079001",
    category: "dermatological",
    definition: "Chronic relapsing inflammatory skin disease with impaired skin barrier and immune dysregulation",
    primaryOrgan: "skin",
    affectedOrgans: ["skin", "immune_system"],
    
    pathophysiology: {
      mechanism: "Filaggrin mutation → skin barrier defect → allergen penetration → Th2 immune response → inflammation",
      molecularBasis: "IL-4, IL-13, IL-31; filaggrin (FLG) mutations; IgE elevation; Th2 skewing",
      timeline: "Usually begins in infancy, may persist or resolve",
      equations: {
        scoradIndex: {
          name: "SCORAD Index",
          latex: "SCORAD = \\frac{A}{5} + \\frac{7B}{2} + C",
          description: "A = extent (0-100%), B = intensity (0-18), C = subjective symptoms (0-20)",
          normalRange: "0",
          mildDisease: "<25",
          moderateDisease: "25-50",
          severeDisease: ">50"
        }
      }
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Intense pruritus", frequency: "100%", description: "Hallmark symptom, worse at night" },
        { name: "Sleep disturbance", frequency: "60%", description: "Due to pruritus" },
        { name: "Dry skin", frequency: "95%", description: "Xerosis" }
      ],
      signs: [
        { name: "Erythematous papules/patches", location: "Age-dependent distribution" },
        { name: "Lichenification", description: "Thickened skin from chronic scratching" },
        { name: "Excoriations", description: "Scratch marks" },
        { name: "Xerosis", description: "Dry, rough skin" },
        { name: "Dennie-Morgan lines", description: "Infraorbital folds" },
        { name: "Allergic shiners", description: "Periorbital darkening" },
        { name: "Keratosis pilaris", description: "Follicular hyperkeratosis on arms" }
      ],
      ageDistribution: {
        infantile: "Face, scalp, extensor surfaces (0-2 years)",
        childhood: "Flexural surfaces - antecubital, popliteal fossae (2-12 years)",
        adult: "Hands, face, flexures, may be generalized"
      }
    },
    
    diagnosticCriteria: {
      name: "Hanifin & Rajka Criteria (Modified)",
      major: ["Pruritus", "Typical morphology and distribution", "Chronic or relapsing course", "Personal or family history of atopy"],
      minor: ["Xerosis", "Ichthyosis", "Type I skin test reactivity", "Elevated IgE", "Early age of onset", "Dennie-Morgan folds", "Keratosis pilaris", "Hand/foot dermatitis"],
      requirement: "3 major + 3 minor criteria"
    },
    
    laboratoryFindings: [
      { name: "Total IgE", normalRange: "<100 IU/mL", abnormalInDisease: "Elevated (80% of patients)" },
      { name: "Peripheral eosinophils", normalRange: "<500/μL", abnormalInDisease: "Eosinophilia common" },
      { name: "Specific IgE", normalRange: "Negative", abnormalInDisease: "Positive to environmental/food allergens" },
      { name: "Filaggrin mutation", normalRange: "Wild type", abnormalInDisease: "FLG mutations (30-50%)" }
    ],
    
    imagingFindings: {
      dermoscopy: ["Yellow scales", "Dotted vessels", "White structureless areas"]
    },
    
    histopathology: {
      acute: ["Spongiosis (intercellular edema)", "Perivascular lymphocytic infiltrate", "Eosinophils"],
      chronic: ["Acanthosis", "Hyperkeratosis", "Minimal spongiosis", "Fibrosis"]
    },
    
    severity: {
      mild: { description: "SCORAD <25, limited area, intermittent" },
      moderate: { description: "SCORAD 25-50, more extensive" },
      severe: { description: "SCORAD >50, widespread, refractory" }
    },
    
    modifications: {
      skin: {
        structure: {
          barrier_function: { factor: 0.4, note: "Filaggrin deficiency" },
          transepidermal_water_loss: { factor: 2.5, note: "Impaired barrier" },
          epidermal_thickness: { factor: 1.5, note: "Lichenification" }
        }
      },
      blood: {
        geometry: {
          eosinophil_count: { factor: 2.0, note: "Eosinophilia" }
        },
        proteins: {
          ige_level: { factor: 5.0, note: "Elevated IgE" }
        }
      }
    },
    
    differentialDiagnosis: ["Seborrheic dermatitis", "Contact dermatitis", "Scabies", "Psoriasis", "Tinea", "Cutaneous T-cell lymphoma"],
    
    treatment: {
      topical: [
        { name: "Emollients", indication: "First-line, restore barrier", evidence: "IA" },
        { name: "Topical corticosteroids", indication: "Flares, short-term", evidence: "IA" },
        { name: "Calcineurin inhibitors", examples: "Tacrolimus, Pimecrolimus", indication: "Face, maintenance", evidence: "IA" }
      ],
      systemic: [
        { name: "Dupilumab", mechanism: "Anti-IL-4/IL-13", indication: "Moderate-severe", evidence: "IA" },
        { name: "JAK inhibitors", examples: "Abrocitinib, Upadacitinib", indication: "Moderate-severe", evidence: "IA" },
        { name: "Cyclosporine", indication: "Short-term severe flares", evidence: "IA" }
      ],
      triggers: [
        { name: "Avoid triggers", note: "Irritants, allergens, stress, temperature extremes" }
      ]
    },
    riskStratification: {
      atopicMarch: "50-70% develop allergic rhinitis/asthma",
      infection: "S. aureus colonization 90%; eczema herpeticum risk with HSV exposure",
      prognosis: "Many improve/resolve by adulthood; some lifelong"
    },
    complications: ["Bacterial superinfection (S. aureus)", "Eczema herpeticum", "Allergic rhinitis", "Asthma", "Food allergies", "Psychosocial impact"]
  },

  // =====================
  // ACNE VULGARIS
  // ICD-10: L70.0
  // =====================

  L70_0: {
    name: "Acne Vulgaris",
    icd10: "L70.0",
    snomedCT: "11381005",
    category: "dermatological",
    definition: "Chronic inflammatory disease of pilosebaceous units with comedones, papules, pustules, and nodules",
    primaryOrgan: "skin",
    affectedOrgans: ["skin"],
    
    pathophysiology: {
      mechanism: "Follicular hyperkeratinization + sebum overproduction + C. acnes proliferation + inflammation",
      molecularBasis: "Androgens (DHT) → sebaceous gland hyperplasia; IL-1α, TNF-α; TLR2 activation",
      fourFactors: ["Follicular hyperkeratinization", "Excess sebum", "Cutibacterium acnes", "Inflammation"]
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Skin lesions", frequency: "100%", description: "Face, chest, back" },
        { name: "Pain", frequency: "Variable", description: "Inflammatory lesions, nodules" },
        { name: "Scarring concerns", frequency: "Common", description: "Psychological impact" }
      ],
      signs: [
        { name: "Open comedones (blackheads)", description: "Dilated follicle with dark keratin plug" },
        { name: "Closed comedones (whiteheads)", description: "Small flesh-colored papules" },
        { name: "Papules", description: "Red, tender, <5mm" },
        { name: "Pustules", description: "Papules with visible pus" },
        { name: "Nodules", description: "Large, painful, deep lesions >5mm" },
        { name: "Cysts", description: "Fluctuant, pus-filled nodules" },
        { name: "Scars", description: "Atrophic (ice-pick, boxcar, rolling) or hypertrophic" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Clinical Diagnosis",
      clinical: "Presence of comedones, papules, pustules on face/trunk",
      grading: {
        mild: "Comedones with few papules/pustules",
        moderate: "Multiple papules/pustules, few nodules",
        severe: "Numerous nodules/cysts, scarring"
      }
    },
    
    laboratoryFindings: [
      { name: "Free testosterone", normalRange: "Variable by gender", abnormalInDisease: "May be elevated in hormonal acne" },
      { name: "DHEA-S", normalRange: "<400 μg/dL", abnormalInDisease: "Elevated in adrenal causes" },
      { name: "LH/FSH ratio", normalRange: "<2", abnormalInDisease: ">2 suggests PCOS" }
    ],
    
    histopathology: {
      comedone: ["Dilated follicle", "Keratinous material", "Sebum"],
      inflammatory: ["Perifollicular lymphocytic infiltrate", "Neutrophils", "Giant cells (ruptured comedone)"]
    },
    
    severity: {
      mild: { description: "<20 comedones, <15 inflammatory lesions" },
      moderate: { description: "20-100 comedones, 15-50 inflammatory lesions" },
      severe: { description: ">100 comedones, >50 inflammatory lesions, nodules/cysts" }
    },
    
    modifications: {
      skin: {
        structure: {
          sebaceous_gland_size: { factor: 1.8, note: "Sebaceous hyperplasia" },
          sebum_production: { factor: 2.5, note: "Increased sebum" },
          follicular_keratinization: { factor: 2.0, note: "Hyperkeratosis" }
        }
      }
    },
    
    differentialDiagnosis: ["Rosacea", "Folliculitis", "Perioral dermatitis", "Keratosis pilaris", "Drug-induced acneiform eruption"],
    
    complications: ["Scarring (atrophic, hypertrophic, keloid)", "Post-inflammatory hyperpigmentation", "Psychological impact", "Depression"]
  },

  // =====================
  // MELANOMA
  // ICD-10: C43.9
  // =====================

  C43_9: {
    name: "Malignant Melanoma",
    icd10: "C43.9",
    snomedCT: "372244006",
    category: "dermatological",
    definition: "Malignant neoplasm arising from melanocytes, highest mortality of skin cancers",
    primaryOrgan: "skin",
    affectedOrgans: ["skin", "lymphatic", "liver", "lungs", "brain"],
    
    pathophysiology: {
      mechanism: "Melanocyte malignant transformation → radial then vertical growth → metastasis",
      molecularBasis: "BRAF V600E (50%), NRAS, KIT mutations; CDKN2A loss; UV-induced DNA damage",
      progression: "Benign nevus → dysplastic nevus → melanoma in situ → invasive melanoma → metastatic"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Changing mole", frequency: "Common", description: "Size, shape, color change" },
        { name: "New pigmented lesion", frequency: "Common", description: "After age 40 concerning" },
        { name: "Bleeding/ulceration", frequency: "Advanced", description: "Suggests invasion" }
      ],
      signs: [
        { name: "Asymmetry", description: "ABCDE criterion A" },
        { name: "Border irregularity", description: "ABCDE criterion B" },
        { name: "Color variation", description: "ABCDE criterion C - multiple colors" },
        { name: "Diameter >6mm", description: "ABCDE criterion D" },
        { name: "Evolution", description: "ABCDE criterion E - changing" },
        { name: "Ugly duckling sign", description: "Different from other moles" }
      ]
    },
    
    diagnosticCriteria: {
      name: "ABCDE Criteria + Histopathology",
      clinical: "ABCDE criteria for screening",
      dermoscopy: "Atypical pigment network, blue-white veil, irregular dots/globules",
      definitive: "Excisional biopsy with histopathology"
    },
    
    laboratoryFindings: [
      { name: "LDH", normalRange: "<225 U/L", abnormalInDisease: "Elevated in metastatic disease (prognostic)" },
      { name: "S100B", normalRange: "<0.1 μg/L", abnormalInDisease: "Elevated in advanced disease" },
      { name: "BRAF mutation", normalRange: "Wild type", abnormalInDisease: "V600E mutation (50%, targetable)" }
    ],
    
    imagingFindings: {
      dermoscopy: ["Atypical pigment network", "Blue-white veil", "Irregular streaks", "Regression structures"],
      ct: ["Lymph node staging", "Visceral metastases"],
      pet_ct: ["Metabolic staging", "Distant metastases"],
      mri_brain: ["Brain metastases (common site)"]
    },
    
    histopathology: {
      features: ["Atypical melanocytes", "Pagetoid spread", "Lack of maturation", "Mitoses", "Ulceration"],
      breslow_depth: "Most important prognostic factor (mm thickness)",
      clark_level: "Anatomic level of invasion (I-V)"
    },
    
    staging: {
      I: "≤2mm, no ulceration or ≤1mm with ulceration",
      II: ">2mm or 1-2mm with ulceration",
      III: "Regional lymph node involvement",
      IV: "Distant metastases"
    },
    
    severity: {
      mild: { description: "In situ or Breslow <1mm, no ulceration" },
      moderate: { description: "Breslow 1-4mm" },
      severe: { description: "Breslow >4mm, nodal involvement, or metastatic" }
    },
    
    modifications: {
      skin: {
        structure: {
          lesion_size: { factor: 3.0, note: "Tumor growth" },
          melanocyte_density: { factor: 10.0, note: "Malignant proliferation" }
        }
      },
      lymphatic: {
        structure: {
          lymph_node_size: { factor: 2.5, note: "Nodal metastases" }
        }
      },
      blood: {
        proteins: {
          ldh: { factor: 2.0, note: "Elevated in metastatic disease" },
          s100b: { factor: 5.0, note: "Tumor marker" }
        }
      }
    },
    
    differentialDiagnosis: ["Seborrheic keratosis", "Blue nevus", "Atypical nevus", "Pigmented BCC", "Dermatofibroma"],
    
    prognosis: {
      breslow_less_1mm: "95-100% 5-year survival",
      breslow_1_2mm: "80-90% 5-year survival",
      breslow_2_4mm: "60-75% 5-year survival",
      breslow_greater_4mm: "50% 5-year survival",
      nodal_involvement: "30-70% 5-year survival",
      distant_metastases: "10-15% 5-year survival"
    }
  },

  // =====================
  // URTICARIA
  // ICD-10: L50.9
  // =====================

  L50_9: {
    name: "Urticaria",
    icd10: "L50.9",
    snomedCT: "126485001",
    category: "dermatological",
    definition: "Transient edematous wheals due to mast cell degranulation and histamine release",
    primaryOrgan: "skin",
    affectedOrgans: ["skin", "gi_tract"],
    
    pathophysiology: {
      mechanism: "Mast cell degranulation → histamine release → vasodilation and increased permeability → wheals",
      molecularBasis: "IgE-mediated (Type I) or direct mast cell activation; histamine, leukotrienes, prostaglandins",
      triggers: ["Foods", "Medications", "Infections", "Physical stimuli", "Autoimmune"]
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Pruritus", frequency: "100%", description: "Intense itching" },
        { name: "Burning", frequency: "30%", description: "Some patients" },
        { name: "Swelling", frequency: "50%", description: "Angioedema" }
      ],
      signs: [
        { name: "Wheals", description: "Raised, erythematous, edematous papules/plaques" },
        { name: "Central pallor", description: "White center with red flare" },
        { name: "Dermographism", description: "Linear wheals from scratching" },
        { name: "Angioedema", description: "Deeper swelling, often lips/eyes" }
      ]
    },
    
    classification: {
      acute: "Duration <6 weeks, often identifiable trigger",
      chronic: "Duration ≥6 weeks, often no identifiable trigger",
      physical: ["Dermographism", "Cold urticaria", "Cholinergic urticaria", "Pressure urticaria"]
    },
    
    diagnosticCriteria: {
      name: "Clinical Diagnosis",
      clinical: "Transient wheals lasting <24 hours, migratory",
      chronic_workup: ["CBC", "ESR/CRP", "Thyroid function", "H. pylori", "ANA"]
    },
    
    laboratoryFindings: [
      { name: "CBC with differential", normalRange: "Normal", abnormalInDisease: "Eosinophilia in allergic causes" },
      { name: "IgE", normalRange: "<100 IU/mL", abnormalInDisease: "Elevated in allergic urticaria" },
      { name: "Tryptase", normalRange: "<11.4 ng/mL", abnormalInDisease: "Elevated during anaphylaxis" },
      { name: "Anti-FcεRI antibodies", normalRange: "Negative", abnormalInDisease: "Positive in chronic autoimmune urticaria" }
    ],
    
    severity: {
      mild: { description: "Few wheals, responds to antihistamines" },
      moderate: { description: "Multiple wheals, partial antihistamine response" },
      severe: { description: "Refractory, with angioedema, anaphylaxis risk" }
    },
    
    modifications: {
      skin: {
        physiology: {
          mast_cell_degranulation: { factor: 5.0, note: "Histamine release" },
          vascular_permeability: { factor: 3.0, note: "Edema formation" }
        }
      },
      blood: {
        proteins: {
          histamine: { factor: 10.0, note: "Elevated during attacks" }
        }
      }
    },
    
    differentialDiagnosis: ["Urticarial vasculitis", "Erythema multiforme", "Mastocytosis", "Drug eruption"],
    
    redFlags: ["Angioedema of airway", "Anaphylaxis", "Fixed lesions >24 hours (vasculitis)", "Systemic symptoms"]
  },

  // =====================
  // VITILIGO
  // ICD-10: L80
  // =====================

  L80: {
    name: "Vitiligo",
    icd10: "L80",
    snomedCT: "56727007",
    category: "dermatological",
    definition: "Acquired depigmentation disorder from autoimmune melanocyte destruction",
    primaryOrgan: "skin",
    affectedOrgans: ["skin", "eyes", "hair"],
    
    pathophysiology: {
      mechanism: "Autoimmune destruction of melanocytes → depigmented macules/patches",
      molecularBasis: "CD8+ T-cell mediated; autoantibodies to melanocyte antigens; oxidative stress",
      associations: "Associated with other autoimmune diseases (thyroid, T1DM, Addison's)"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Depigmented patches", frequency: "100%", description: "White macules/patches" },
        { name: "Premature hair graying", frequency: "40%", description: "Poliosis" },
        { name: "Sunburn susceptibility", frequency: "Common", description: "Affected areas" }
      ],
      signs: [
        { name: "Well-demarcated white macules", description: "Chalk-white, often symmetric" },
        { name: "Koebner phenomenon", description: "Lesions at trauma sites" },
        { name: "Poliosis", description: "White patches of hair" },
        { name: "Leukotrichia", description: "White scalp hair" }
      ]
    },
    
    classification: {
      segmental: "Unilateral, dermatomal distribution",
      nonsegmental: ["Generalized", "Acrofacial", "Universal"],
      mixed: "Both patterns present"
    },
    
    diagnosticCriteria: {
      name: "Clinical Diagnosis",
      clinical: "Depigmented macules, enhanced with Wood's lamp",
      woods_lamp: "Bright white-blue fluorescence",
      biopsy: "Absence of melanocytes (rarely needed)"
    },
    
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Screen for thyroid disease" },
      { name: "Anti-TPO", normalRange: "Negative", abnormalInDisease: "Associated thyroiditis" },
      { name: "Fasting glucose", normalRange: "<100 mg/dL", abnormalInDisease: "Screen for diabetes" },
      { name: "ANA", normalRange: "Negative", abnormalInDisease: "Associated autoimmunity" },
      { name: "Vitamin B12", normalRange: "200-900 pg/mL", abnormalInDisease: "May be low (pernicious anemia association)" }
    ],
    
    severity: {
      mild: { description: "BSA <10%" },
      moderate: { description: "BSA 10-30%" },
      severe: { description: "BSA >30% or rapidly progressive" }
    },
    
    modifications: {
      skin: {
        structure: {
          melanocyte_count: { factor: 0.0, note: "Absent in lesions" },
          melanin_content: { factor: 0.0, note: "Depigmentation" }
        }
      }
    },
    
    differentialDiagnosis: ["Pityriasis alba", "Tinea versicolor", "Post-inflammatory hypopigmentation", "Idiopathic guttate hypomelanosis", "Leprosy"],
    
    prognosis: {
      spontaneousRepigmentation: "10-20% (especially face, younger patients)",
      treatment_response: "50-75% respond to phototherapy or topicals"
    }
  },

  // =====================
  // CELLULITIS
  // ICD-10: L03.9
  // =====================

  L03_9: {
    name: "Cellulitis",
    icd10: "L03.9",
    snomedCT: "128045006",
    category: "dermatological",
    definition: "Acute bacterial infection of dermis and subcutaneous tissue",
    primaryOrgan: "skin",
    affectedOrgans: ["skin", "lymphatic", "blood"],
    
    pathophysiology: {
      mechanism: "Bacterial entry through skin break → dermal/subcutaneous spread → inflammation",
      organisms: "Streptococcus pyogenes (most common), Staphylococcus aureus (including MRSA)",
      riskFactors: ["Skin breach", "Lymphedema", "Obesity", "Diabetes", "Immunosuppression"]
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Pain", frequency: "95%", description: "Tender affected area" },
        { name: "Swelling", frequency: "90%", description: "Localized edema" },
        { name: "Fever", frequency: "50%", description: "Systemic response" },
        { name: "Chills", frequency: "40%", description: "Bacteremia concern" }
      ],
      signs: [
        { name: "Erythema", description: "Spreading redness, poorly demarcated" },
        { name: "Warmth", description: "Increased local temperature" },
        { name: "Edema", description: "Swelling of affected area" },
        { name: "Tenderness", description: "Pain on palpation" },
        { name: "Lymphangitis", description: "Red streaking toward lymph nodes" },
        { name: "Lymphadenopathy", description: "Regional node enlargement" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Clinical Diagnosis",
      clinical: "Expanding area of erythema, warmth, swelling, tenderness",
      supportive: ["Fever", "Leukocytosis", "Entry point"]
    },
    
    laboratoryFindings: [
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Leukocytosis" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Elevated" },
      { name: "Blood cultures", normalRange: "Negative", abnormalInDisease: "Positive in bacteremia (rare)" },
      { name: "Creatinine", normalRange: "0.7-1.3 mg/dL", abnormalInDisease: "Monitor for AKI in severe cases" }
    ],
    
    imagingFindings: {
      ultrasound: ["Subcutaneous edema", "Abscess (if present)", "Fascial integrity"],
      ct_mri: ["Reserved for suspected necrotizing fasciitis", "Deep abscess"]
    },
    
    severity: {
      mild: { description: "Localized, no systemic symptoms, oral antibiotics" },
      moderate: { description: "Larger area, low-grade fever, may need IV antibiotics" },
      severe: { description: "Systemic toxicity, rapid spread, necrotizing fasciitis concern" }
    },
    
    modifications: {
      skin: {
        structure: {
          dermal_edema: { factor: 3.0, note: "Inflammation" },
          subcutaneous_infiltrate: { factor: 2.5, note: "Bacterial spread" }
        }
      },
      blood: {
        geometry: {
          wbc_count: { factor: 1.6, note: "Leukocytosis" }
        },
        proteins: {
          crp: { factor: 8.0, note: "Acute phase response" }
        }
      },
      lymphatic: {
        structure: {
          lymph_node_size: { factor: 1.8, note: "Regional lymphadenopathy" }
        }
      }
    },
    
    differentialDiagnosis: ["DVT", "Erysipelas", "Necrotizing fasciitis", "Contact dermatitis", "Stasis dermatitis", "Gout"],
    
    redFlags: ["Crepitus (necrotizing)", "Pain out of proportion", "Rapid progression", "Bullae", "Sepsis"]
  },

  // =====================
  // HERPES ZOSTER
  // ICD-10: B02.9
  // =====================

  B02_9: {
    name: "Herpes Zoster (Shingles)",
    icd10: "B02.9",
    snomedCT: "4740000",
    category: "dermatological",
    definition: "Reactivation of latent varicella-zoster virus in dorsal root ganglion causing dermatomal vesicular eruption",
    primaryOrgan: "skin",
    affectedOrgans: ["skin", "nerves", "eyes"],
    
    pathophysiology: {
      mechanism: "VZV reactivation from latency in dorsal root ganglion → spreads along sensory nerve → dermatomal eruption",
      triggers: "Declining cell-mediated immunity, age, immunosuppression, stress"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Prodromal pain", frequency: "75%", description: "Burning, tingling 2-3 days before rash" },
        { name: "Acute pain", frequency: "90%", description: "Severe dermatomal pain" },
        { name: "Pruritus", frequency: "60%", description: "Itching" },
        { name: "Postherpetic neuralgia", frequency: "10-20%", description: "Pain persisting >90 days" }
      ],
      signs: [
        { name: "Unilateral dermatomal distribution", description: "Does not cross midline" },
        { name: "Grouped vesicles on erythematous base", description: "Dew drops on rose petal" },
        { name: "Pustules", description: "Vesicles become cloudy" },
        { name: "Crusting", description: "Lesions crust by 7-10 days" },
        { name: "Lymphadenopathy", description: "Regional nodes" }
      ]
    },
    
    diagnosticCriteria: {
      name: "Clinical Diagnosis",
      clinical: "Unilateral dermatomal vesicular rash with pain",
      confirmatory: "VZV PCR of vesicle fluid (if needed)"
    },
    
    laboratoryFindings: [
      { name: "VZV PCR", normalRange: "Negative", abnormalInDisease: "Positive from vesicle fluid" },
      { name: "Tzanck smear", normalRange: "No multinucleated giant cells", abnormalInDisease: "Multinucleated giant cells (not specific)" },
      { name: "DFA", normalRange: "Negative", abnormalInDisease: "Positive for VZV antigen" }
    ],
    
    complications: {
      postherpetic_neuralgia: "Most common, risk increases with age",
      herpes_zoster_ophthalmicus: "V1 involvement, vision-threatening",
      ramsay_hunt_syndrome: "Facial nerve involvement, hearing loss",
      disseminated: "Immunocompromised, multiple dermatomes",
      bacterial_superinfection: "S. aureus, S. pyogenes"
    },
    
    severity: {
      mild: { description: "Limited lesions, mild pain" },
      moderate: { description: "Multiple lesions, significant pain" },
      severe: { description: "Disseminated, ophthalmic involvement, immunocompromised" }
    },
    
    modifications: {
      skin: {
        structure: {
          vesicle_formation: { factor: 5.0, note: "Epidermal vesicles" }
        }
      },
      nerves: {
        physiology: {
          pain_signaling: { factor: 5.0, note: "Neuropathic pain" },
          nerve_damage: { factor: 2.0, note: "Ganglion inflammation" }
        }
      }
    },
    
    differentialDiagnosis: ["HSV", "Contact dermatitis", "Bullous pemphigoid", "Dermatitis herpetiformis"],
    
    prevention: "Shingrix vaccine (recombinant zoster vaccine) - 90% efficacy"
  }
};

export default DERMATOLOGICAL_DISEASES;
