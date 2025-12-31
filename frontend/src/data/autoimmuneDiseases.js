// ============================================================
// AUTOIMMUNE DISEASES DATABASE
// Comprehensive autoimmune and inflammatory disorders
// ICD-10: M00-M99 (Musculoskeletal), K50-K51 (IBD), G70 (Myasthenia)
// ============================================================

export const AUTOIMMUNE_DISEASES = {
  // =====================
  // SYSTEMIC LUPUS ERYTHEMATOSUS
  // ICD-10: M32.9
  // =====================

  M32_9: {
    name: "Systemic Lupus Erythematosus (SLE)",
    icd10: "M32.9",
    category: "autoimmune",
    definition: "Chronic multisystem autoimmune disease with autoantibodies against nuclear antigens",
    primaryOrgan: "blood",
    affectedOrgans: ["blood", "kidneys", "heart", "lungs", "brain", "skin"],
    pathophysiology: {
      mechanism: "Loss of self-tolerance → autoantibody production → immune complex deposition → multi-organ inflammation",
      molecularBasis: "ANA, anti-dsDNA, anti-Smith antibodies; Type III hypersensitivity; complement activation"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigue",
        "Joint pain/swelling",
        "Malar (butterfly) rash",
        "Photosensitivity",
        "Oral ulcers",
        "Hair loss",
        "Raynaud's phenomenon",
        "Chest pain (serositis)"
      ],
      signs: [
        "Malar rash",
        "Discoid rash",
        "Arthritis (non-erosive)",
        "Lymphadenopathy",
        "Pericardial/pleural rub",
        "Peripheral edema (nephritis)"
      ]
    },
    laboratoryFindings: [
      { name: "ANA", normalRange: "Negative", abnormalInDisease: "Positive (>98% sensitivity)" },
      { name: "Anti-dsDNA", normalRange: "Negative", abnormalInDisease: "Positive (specific, correlates with nephritis)" },
      { name: "Anti-Smith", normalRange: "Negative", abnormalInDisease: "Positive (highly specific)" },
      { name: "C3/C4 Complement", normalRange: "C3: 90-180, C4: 10-40 mg/dL", abnormalInDisease: "Low (consumption in active disease)" },
      { name: "CBC", normalRange: "Normal", abnormalInDisease: "Cytopenias: anemia, leukopenia, thrombocytopenia" },
      { name: "ESR/CRP", normalRange: "Low", abnormalInDisease: "ESR elevated; CRP may be normal (unless infection)" },
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Proteinuria, hematuria, casts (lupus nephritis)" }
    ],
    imagingFindings: {
      xray: ["Non-erosive arthritis", "Jaccoud's arthropathy (reducible deformities)"],
      echo: ["Pericardial effusion", "Libman-Sacks endocarditis"],
      ct: ["Pleural effusion", "Interstitial lung disease", "Pulmonary embolism"]
    },
    severity: {
      mild: { description: "Skin/joint involvement only, SLEDAI <6" },
      moderate: { description: "Serositis, cytopenias, SLEDAI 6-12" },
      severe: { description: "Nephritis, CNS involvement, SLEDAI >12" }
    },
    modifications: {
      blood: {
        geometry: {
          wbc_count: { factor: 0.6, note: "Leukopenia" },
          platelet_count: { factor: 0.7, note: "Thrombocytopenia" },
          hemoglobin: { factor: 0.8, note: "Anemia of chronic disease or hemolytic" }
        },
        proteins: {
          complement_c3: { factor: 0.5, note: "Complement consumption" },
          complement_c4: { factor: 0.4, note: "Complement consumption" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.6, note: "Lupus nephritis" },
          proteinuria: { factor: 5.0, note: "Glomerular damage" }
        }
      },
      heart: {
        structure: {
          pericardial_effusion: { factor: 3.0, note: "Serositis" }
        }
      }
    },
    diagnosticCriteria: {
      name: "ACR/EULAR 2019 SLE Classification Criteria",
      requirements: {
        entryRequirement: "ANA ≥1:80 on HEp-2 cells",
        threshold: "≥10 points with at least one clinical criterion",
        domains: {
          constitutional: { fever: 2 },
          hematologic: { leukopenia: 3, thrombocytopenia: 4, autoimmune_hemolysis: 4 },
          neuropsychiatric: { delirium: 2, psychosis: 3, seizure: 5 },
          mucocutaneous: { alopecia: 2, oral_ulcers: 2, subacute_cutaneous: 4, acute_cutaneous: 6, discoid: 4 },
          serosal: { pleural_pericardial: 5, acute_pericarditis: 6 },
          musculoskeletal: { joint_involvement: 6 },
          renal: { proteinuria_500: 4, class_II_V_nephritis: 8, class_III_IV_nephritis: 10 },
          immunology: { antiDsDNA_or_antiSm: 6, low_complement: 3, positive_coombs: 4, antiphospholipid: 2 }
        }
      }
    },
    differentialDiagnosis: [
      { condition: "Drug-induced lupus", distinguishing: "Antihistone Ab+, anti-dsDNA negative, resolves with drug cessation" },
      { condition: "Mixed connective tissue disease", distinguishing: "Anti-U1 RNP positive, less renal/CNS involvement" },
      { condition: "Rheumatoid arthritis", distinguishing: "Erosive arthritis, RF/anti-CCP positive, no typical SLE serology" },
      { condition: "Dermatomyositis", distinguishing: "Muscle weakness, elevated CK, heliotrope rash" },
      { condition: "Antiphospholipid syndrome", distinguishing: "Thrombosis/pregnancy loss, can overlap with SLE" }
    ],
    treatment: {
      firstLine: [
        { name: "Hydroxychloroquine", dose: "200-400 mg daily", evidence: "IA", note: "All SLE patients unless contraindicated" },
        { name: "NSAIDs", indication: "Mild arthritis, serositis", note: "Avoid if nephritis" },
        { name: "Low-dose corticosteroids", dose: "≤7.5 mg prednisone", indication: "Flares" }
      ],
      immunosuppressive: [
        { name: "Mycophenolate mofetil", dose: "2-3 g/day", indication: "Lupus nephritis (induction/maintenance)", evidence: "IA" },
        { name: "Azathioprine", dose: "2-3 mg/kg/day", indication: "Maintenance, steroid-sparing", evidence: "IB" },
        { name: "Cyclophosphamide", indication: "Severe nephritis, CNS lupus", evidence: "IA", note: "Euro-Lupus or NIH protocol" }
      ],
      biologics: [
        { name: "Belimumab", mechanism: "Anti-BLyS", indication: "Active disease despite standard therapy", evidence: "IA" },
        { name: "Anifrolumab", mechanism: "Anti-IFNAR1", indication: "Moderate-severe SLE", evidence: "IA", note: "FDA approved 2021" },
        { name: "Rituximab", mechanism: "Anti-CD20", indication: "Refractory disease", evidence: "IIB", note: "Off-label" }
      ]
    },
    riskStratification: {
      mortality: "2-5x general population; leading causes: infection, CVD, nephritis",
      nephritisRisk: "40-60% lifetime risk; worse with anti-dsDNA+, low complement",
      cardiovascularRisk: "Accelerated atherosclerosis; 50x MI risk in young women",
      pregnancyRisk: "Increased flares, preeclampsia; neonatal lupus with anti-SSA",
      lymphomaRisk: "3-4x increased risk"
    }
  },

  // =====================
  // RHEUMATOID ARTHRITIS
  // ICD-10: M05.9
  // =====================

  M05_9: {
    name: "Rheumatoid Arthritis",
    icd10: "M05.9",
    category: "autoimmune",
    definition: "Chronic inflammatory polyarthritis with symmetric joint involvement and systemic manifestations",
    primaryOrgan: "joints",
    affectedOrgans: ["joints", "blood", "lungs", "heart"],
    pathophysiology: {
      mechanism: "Synovial inflammation → pannus formation → cartilage/bone destruction → joint deformity",
      molecularBasis: "RF, anti-CCP antibodies; TNF-α, IL-6, IL-1; Th17 cells; osteoclast activation"
    },
    clinicalPresentation: {
      symptoms: [
        "Morning stiffness >1 hour",
        "Symmetric joint pain",
        "Joint swelling",
        "Fatigue",
        "Low-grade fever",
        "Rheumatoid nodules"
      ],
      signs: [
        "Synovitis (MCP, PIP, wrist)",
        "Boutonniere deformity",
        "Swan neck deformity",
        "Ulnar deviation",
        "Rheumatoid nodules (extensor surfaces)",
        "Atlantoaxial subluxation (advanced)"
      ]
    },
    laboratoryFindings: [
      { name: "RF", normalRange: "Negative (<14 IU/mL)", abnormalInDisease: "Positive (60-80% sensitivity)" },
      { name: "Anti-CCP", normalRange: "Negative", abnormalInDisease: "Positive (highly specific, ~95%)" },
      { name: "ESR", normalRange: "<20 mm/hr", abnormalInDisease: "Elevated (correlates with activity)" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Elevated" },
      { name: "Hemoglobin", normalRange: "Normal", abnormalInDisease: "Anemia of chronic disease" }
    ],
    imagingFindings: {
      xray: ["Periarticular osteopenia", "Joint space narrowing", "Erosions (marginal)", "Subluxation"],
      mri: ["Early synovitis", "Bone marrow edema", "Erosions (sensitive)"],
      ultrasound: ["Synovial hypertrophy", "Power Doppler activity", "Erosions"]
    },
    severity: {
      mild: { description: "Few joints, no erosions, DAS28 <3.2" },
      moderate: { description: "Multiple joints, early erosions, DAS28 3.2-5.1" },
      severe: { description: "Destructive, deforming, systemic, DAS28 >5.1" }
    },
    modifications: {
      blood: {
        geometry: {
          hemoglobin: { factor: 0.85, note: "Anemia of chronic disease" }
        },
        proteins: {
          crp: { factor: 5.0, note: "Elevated inflammatory marker" },
          esr: { factor: 3.0, note: "Elevated" }
        }
      },
      heart: {
        physiology: {
          cardiovascular_risk: { factor: 1.5, note: "Increased CV risk" }
        }
      },
      lungs: {
        structure: {
          interstitial_changes: { factor: 2.0, note: "RA-ILD risk" }
        }
      }
    },
    diagnosticCriteria: {
      name: "ACR/EULAR 2010 RA Classification Criteria",
      requirements: {
        threshold: "≥6 points required",
        jointInvolvement: {
          "1 large joint": 0,
          "2-10 large joints": 1,
          "1-3 small joints": 2,
          "4-10 small joints": 3,
          ">10 joints (≥1 small)": 5
        },
        serology: {
          "RF- and anti-CCP-": 0,
          "Low positive RF or anti-CCP": 2,
          "High positive RF or anti-CCP": 3
        },
        acutePhaseReactants: {
          "Normal CRP and ESR": 0,
          "Abnormal CRP or ESR": 1
        },
        duration: {
          "<6 weeks": 0,
          "≥6 weeks": 1
        }
      }
    },
    differentialDiagnosis: [
      { condition: "Osteoarthritis", distinguishing: "Non-inflammatory, DIP involvement, no morning stiffness, negative serology" },
      { condition: "Psoriatic arthritis", distinguishing: "Skin/nail changes, DIP involvement, dactylitis, asymmetric" },
      { condition: "Gout", distinguishing: "Monoarticular, crystals on aspiration, elevated uric acid" },
      { condition: "SLE", distinguishing: "Non-erosive, multi-system, ANA/anti-dsDNA positive" },
      { condition: "Viral arthritis", distinguishing: "Acute onset, self-limiting, often with rash" }
    ],
    treatment: {
      firstLine: [
        { name: "Methotrexate", dose: "7.5-25 mg weekly", evidence: "IA", note: "Anchor drug, folic acid supplementation" },
        { name: "Sulfasalazine", dose: "2-3 g/day", indication: "MTX intolerance", evidence: "IA" },
        { name: "Leflunomide", dose: "20 mg/day", indication: "MTX alternative", evidence: "IA" }
      ],
      biologics: [
        { name: "TNF inhibitors", examples: "Adalimumab, Etanercept, Infliximab", indication: "Inadequate MTX response", evidence: "IA" },
        { name: "Abatacept", mechanism: "CTLA4-Ig", indication: "Inadequate TNFi response", evidence: "IA" },
        { name: "Tocilizumab", mechanism: "Anti-IL-6R", indication: "Inadequate TNFi response", evidence: "IA" },
        { name: "Rituximab", mechanism: "Anti-CD20", indication: "RF+/anti-CCP+ with TNFi failure", evidence: "IA" }
      ],
      jakInhibitors: [
        { name: "Tofacitinib", dose: "5 mg BID", evidence: "IA" },
        { name: "Baricitinib", dose: "2-4 mg daily", evidence: "IA" },
        { name: "Upadacitinib", dose: "15 mg daily", evidence: "IA" }
      ]
    },
    riskStratification: {
      erosiveDisease: "Anti-CCP+, RF+, early erosions predict aggressive course",
      cardiovascularRisk: "2x increased CV mortality; treat as CV risk equivalent",
      lungDisease: "RA-ILD in 10-30%; anti-CCP strongly associated",
      functionalDecline: "DAS28 and HAQ scores guide therapy escalation"
    }
  },

  // =====================
  // SJOGREN'S SYNDROME
  // ICD-10: M35.0
  // =====================

  M35_0: {
    name: "Sjögren's Syndrome",
    icd10: "M35.0",
    category: "autoimmune",
    definition: "Chronic autoimmune disorder affecting exocrine glands, causing sicca symptoms",
    primaryOrgan: "glands",
    affectedOrgans: ["glands", "lungs", "kidneys", "blood"],
    pathophysiology: {
      mechanism: "Lymphocytic infiltration of exocrine glands → glandular destruction → sicca symptoms",
      molecularBasis: "Anti-SSA (Ro), Anti-SSB (La) antibodies; B-cell hyperactivity; IFN-α signature"
    },
    clinicalPresentation: {
      symptoms: [
        "Dry eyes (keratoconjunctivitis sicca)",
        "Dry mouth (xerostomia)",
        "Difficulty swallowing",
        "Dental caries",
        "Parotid gland swelling",
        "Vaginal dryness",
        "Fatigue",
        "Arthralgias"
      ],
      signs: [
        "Enlarged parotid glands",
        "Dry, fissured tongue",
        "Dental erosions",
        "Corneal staining (Schirmer test positive)"
      ]
    },
    laboratoryFindings: [
      { name: "Anti-SSA (Ro)", normalRange: "Negative", abnormalInDisease: "Positive (~70%)" },
      { name: "Anti-SSB (La)", normalRange: "Negative", abnormalInDisease: "Positive (~40%)" },
      { name: "ANA", normalRange: "Negative", abnormalInDisease: "Positive (80%)" },
      { name: "RF", normalRange: "Negative", abnormalInDisease: "Positive (75%)" },
      { name: "Schirmer test", normalRange: ">10mm/5min", abnormalInDisease: "<5mm/5min (reduced tear production)" },
      { name: "Salivary flow rate", normalRange: ">0.1mL/min", abnormalInDisease: "Reduced" }
    ],
    imagingFindings: {
      ultrasound: ["Parotid heterogeneity", "Hypoechoic areas"],
      mri: ["Glandular atrophy", "Fat replacement"],
      sialography: ["Sialectasis (punctate, globular)"]
    },
    severity: {
      mild: { description: "Sicca symptoms only" },
      moderate: { description: "Systemic features, arthritis, Raynaud's" },
      severe: { description: "Lymphoma risk, nephritis, neuropathy" }
    },
    modifications: {
      blood: {
        geometry: {
          gamma_globulins: { factor: 1.5, note: "Hypergammaglobulinemia" }
        }
      },
      kidneys: {
        physiology: {
          tubular_function: { factor: 0.85, note: "Tubulointerstitial nephritis" }
        }
      }
    }
  },

  // =====================
  // SYSTEMIC SCLEROSIS
  // ICD-10: M34.9
  // =====================

  M34_9: {
    name: "Systemic Sclerosis (Scleroderma)",
    icd10: "M34.9",
    category: "autoimmune",
    definition: "Autoimmune disease with fibrosis of skin and internal organs, vascular abnormalities",
    primaryOrgan: "skin",
    affectedOrgans: ["skin", "lungs", "heart", "kidneys", "gi_tract"],
    pathophysiology: {
      mechanism: "Vascular injury → immune activation → fibroblast activation → excessive collagen deposition",
      molecularBasis: "Anti-Scl-70 (diffuse), anti-centromere (limited); TGF-β, PDGF; endothelial dysfunction"
    },
    clinicalPresentation: {
      symptoms: [
        "Skin thickening (fingers, face)",
        "Raynaud's phenomenon",
        "Digital ulcers",
        "Dysphagia",
        "GERD",
        "Dyspnea",
        "Joint stiffness"
      ],
      signs: [
        "Sclerodactyly",
        "Facial skin tightening",
        "Telangiectasias",
        "Calcinosis (CREST)",
        "Digital pitting scars",
        "Velcro crackles (ILD)"
      ]
    },
    laboratoryFindings: [
      { name: "ANA", normalRange: "Negative", abnormalInDisease: "Positive (>95%)" },
      { name: "Anti-Scl-70", normalRange: "Negative", abnormalInDisease: "Positive (diffuse SSc, ILD risk)" },
      { name: "Anti-centromere", normalRange: "Negative", abnormalInDisease: "Positive (limited SSc/CREST)" },
      { name: "Anti-RNA polymerase III", normalRange: "Negative", abnormalInDisease: "Positive (renal crisis risk)" }
    ],
    imagingFindings: {
      hrct: ["Ground-glass opacities", "Honeycombing (NSIP/UIP pattern)", "Traction bronchiectasis"],
      echo: ["Pulmonary hypertension", "RV dilation"],
      barium_swallow: ["Esophageal dysmotility", "Dilated esophagus"]
    },
    severity: {
      mild: { description: "Limited cutaneous, no organ involvement" },
      moderate: { description: "Skin progression, early ILD, GI symptoms" },
      severe: { description: "Diffuse cutaneous, ILD, PAH, renal crisis" }
    },
    modifications: {
      lungs: {
        physiology: {
          fev1: { factor: 0.7, note: "Restrictive lung disease" },
          dlco: { factor: 0.6, note: "Reduced gas transfer" }
        },
        pressures: {
          pulmonary_artery_pressure: { factor: 1.6, note: "Pulmonary hypertension" }
        }
      },
      heart: {
        geometry: {
          rv_volume: { factor: 1.3, note: "RV dilation from PAH" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.7, note: "Scleroderma renal crisis risk" },
          blood_pressure: { factor: 1.4, note: "Hypertension in renal crisis" }
        }
      }
    }
  },

  // =====================
  // DERMATOMYOSITIS
  // ICD-10: M33.2
  // =====================

  M33_2: {
    name: "Dermatomyositis",
    icd10: "M33.2",
    category: "autoimmune",
    definition: "Inflammatory myopathy with characteristic skin findings and proximal muscle weakness",
    primaryOrgan: "muscles",
    affectedOrgans: ["muscles", "skin", "lungs", "heart"],
    pathophysiology: {
      mechanism: "Complement-mediated microangiopathy → perifascicular muscle damage and skin inflammation",
      molecularBasis: "Anti-Mi-2, anti-MDA5, anti-TIF1-γ antibodies; complement C5b-9 deposition; IFN signature"
    },
    clinicalPresentation: {
      symptoms: [
        "Proximal muscle weakness",
        "Difficulty climbing stairs",
        "Difficulty raising arms",
        "Dysphagia",
        "Skin rash",
        "Photosensitivity"
      ],
      signs: [
        "Heliotrope rash (eyelids)",
        "Gottron's papules (knuckles)",
        "V-sign/Shawl sign",
        "Mechanic's hands",
        "Proximal muscle weakness (neck flexors, deltoids, hip flexors)"
      ]
    },
    laboratoryFindings: [
      { name: "CK", normalRange: "<200 U/L", abnormalInDisease: "Elevated 10-50x (correlates with activity)" },
      { name: "Aldolase", normalRange: "<8 U/L", abnormalInDisease: "Elevated" },
      { name: "LDH", normalRange: "<225 U/L", abnormalInDisease: "Elevated" },
      { name: "Anti-Mi-2", normalRange: "Negative", abnormalInDisease: "Positive (classic DM)" },
      { name: "Anti-MDA5", normalRange: "Negative", abnormalInDisease: "Positive (ILD risk)" },
      { name: "Anti-TIF1-γ", normalRange: "Negative", abnormalInDisease: "Positive (malignancy risk)" }
    ],
    imagingFindings: {
      mri: ["Muscle edema on STIR", "Fascial edema", "Fatty replacement (chronic)"],
      ct: ["ILD screening", "Malignancy workup"],
      emg: ["Myopathic changes", "Insertional irritability", "Fibrillations"]
    },
    severity: {
      mild: { description: "Skin only or mild weakness" },
      moderate: { description: "Moderate weakness, no dysphagia" },
      severe: { description: "Severe weakness, ILD, dysphagia, malignancy" }
    },
    modifications: {
      muscles: {
        physiology: {
          muscle_strength: { factor: 0.5, note: "Proximal weakness" },
          ck_level: { factor: 25.0, note: "Markedly elevated" }
        }
      },
      lungs: {
        physiology: {
          fev1: { factor: 0.75, note: "ILD if present" }
        }
      },
      heart: {
        physiology: {
          cardiac_output: { factor: 0.9, note: "Myocarditis risk" }
        }
      }
    }
  },

  // =====================
  // ANKYLOSING SPONDYLITIS
  // ICD-10: M45.9
  // =====================

  M45_9: {
    name: "Ankylosing Spondylitis",
    icd10: "M45.9",
    category: "autoimmune",
    definition: "Chronic inflammatory disease of axial skeleton causing progressive spinal fusion",
    primaryOrgan: "spine",
    affectedOrgans: ["spine", "heart", "lungs", "eyes"],
    pathophysiology: {
      mechanism: "Enthesitis → bone erosion → new bone formation → ankylosis of axial skeleton",
      molecularBasis: "HLA-B27 association (>90%); IL-17, TNF-α; entheseal inflammation"
    },
    clinicalPresentation: {
      symptoms: [
        "Inflammatory back pain (worse at rest, better with exercise)",
        "Morning stiffness >30 min",
        "Buttock pain (alternating)",
        "Chest wall pain",
        "Fatigue",
        "Acute anterior uveitis"
      ],
      signs: [
        "Limited lumbar flexion (Schober test positive)",
        "Reduced chest expansion",
        "Loss of lumbar lordosis",
        "Thoracic kyphosis",
        "SI joint tenderness"
      ]
    },
    laboratoryFindings: [
      { name: "HLA-B27", normalRange: "8% general population", abnormalInDisease: "Positive (>90%)" },
      { name: "ESR/CRP", normalRange: "Normal", abnormalInDisease: "Elevated (correlates with activity in 50-70%)" }
    ],
    imagingFindings: {
      xray: ["Sacroiliitis (bilateral symmetric)", "Bamboo spine", "Squaring of vertebrae", "Syndesmophytes"],
      mri: ["Bone marrow edema SI joints", "Active sacroiliitis (fat-suppressed)"]
    },
    severity: {
      mild: { description: "Symptoms controlled, BASDAI <4" },
      moderate: { description: "Partial response, BASDAI 4-6" },
      severe: { description: "Refractory, ankylosis, BASDAI >6" }
    },
    modifications: {
      spine: {
        physiology: {
          spinal_mobility: { factor: 0.5, note: "Progressive ankylosis" }
        }
      },
      lungs: {
        physiology: {
          chest_expansion: { factor: 0.6, note: "Reduced from rib fusion" },
          fev1: { factor: 0.85, note: "Restrictive pattern" }
        }
      },
      heart: {
        structure: {
          aortic_root: { factor: 1.2, note: "Aortitis risk" }
        }
      }
    }
  },

  // =====================
  // GIANT CELL ARTERITIS
  // ICD-10: M31.5
  // =====================

  M31_5: {
    name: "Giant Cell Arteritis (Temporal Arteritis)",
    icd10: "M31.5",
    category: "autoimmune",
    definition: "Large vessel vasculitis affecting aorta and its branches, especially cranial arteries",
    primaryOrgan: "arteries",
    affectedOrgans: ["arteries", "eyes", "brain", "heart"],
    pathophysiology: {
      mechanism: "Granulomatous inflammation of vessel wall → intimal hyperplasia → stenosis/occlusion",
      molecularBasis: "T-cell mediated (Th1, Th17); IFN-γ, IL-6; giant cells in media"
    },
    clinicalPresentation: {
      symptoms: [
        "New-onset headache (temporal)",
        "Scalp tenderness",
        "Jaw claudication",
        "Visual disturbances/loss",
        "Fever",
        "Constitutional symptoms",
        "Polymyalgia rheumatica symptoms (40-60%)"
      ],
      signs: [
        "Tender, nodular temporal artery",
        "Reduced/absent temporal artery pulse",
        "Visual field defects",
        "RAPD (if ischemic optic neuropathy)"
      ]
    },
    laboratoryFindings: [
      { name: "ESR", normalRange: "<20 mm/hr", abnormalInDisease: ">50 mm/hr (often >100)" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Markedly elevated" },
      { name: "Platelets", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Thrombocytosis" },
      { name: "Hemoglobin", normalRange: "Normal", abnormalInDisease: "Normocytic anemia" }
    ],
    imagingFindings: {
      temporal_artery_ultrasound: ["Halo sign (wall edema)", "Stenosis/occlusion"],
      mra_cta: ["Aortic involvement", "Large vessel stenosis"],
      pet_ct: ["FDG uptake in vessel walls"]
    },
    severity: {
      mild: { description: "Constitutional symptoms only" },
      moderate: { description: "Headache, jaw claudication" },
      severe: { description: "Visual loss, aortic involvement, stroke" }
    },
    modifications: {
      blood: {
        proteins: {
          esr: { factor: 5.0, note: "Markedly elevated" },
          crp: { factor: 10.0, note: "Markedly elevated" }
        },
        geometry: {
          platelet_count: { factor: 1.4, note: "Reactive thrombocytosis" }
        }
      },
      brain: {
        physiology: {
          cbf: { factor: 0.85, note: "Reduced from vascular stenosis" }
        }
      },
      heart: {
        structure: {
          aortic_wall: { factor: 1.3, note: "Aortitis" }
        }
      }
    }
  },

  // =====================
  // CROHN'S DISEASE
  // ICD-10: K50.9
  // =====================

  K50_9: {
    name: "Crohn's Disease",
    icd10: "K50.9",
    category: "autoimmune",
    definition: "Chronic transmural inflammatory bowel disease affecting any part of GI tract",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "joints", "eyes", "skin"],
    pathophysiology: {
      mechanism: "Dysregulated immune response to gut microbiota → transmural inflammation → strictures/fistulas",
      molecularBasis: "NOD2 mutations; TNF-α, IL-12/23; Th1/Th17 response; granulomatous inflammation"
    },
    clinicalPresentation: {
      symptoms: [
        "Chronic diarrhea",
        "Abdominal pain (RLQ)",
        "Weight loss",
        "Fatigue",
        "Fever",
        "Perianal disease (fistulas, abscesses)"
      ],
      signs: [
        "RLQ mass/tenderness",
        "Perianal fistulas/tags",
        "Oral aphthous ulcers",
        "Erythema nodosum",
        "Pyoderma gangrenosum",
        "Uveitis"
      ]
    },
    laboratoryFindings: [
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Elevated (correlates with activity)" },
      { name: "Fecal calprotectin", normalRange: "<50 μg/g", abnormalInDisease: "Elevated (intestinal inflammation)" },
      { name: "Hemoglobin", normalRange: "Normal", abnormalInDisease: "Anemia (chronic disease, iron/B12 deficiency)" },
      { name: "Albumin", normalRange: "3.5-5 g/dL", abnormalInDisease: "Low (malabsorption, inflammation)" },
      { name: "ASCA", normalRange: "Negative", abnormalInDisease: "Positive (~60%)" }
    ],
    imagingFindings: {
      ct_enterography: ["Wall thickening", "Skip lesions", "Strictures", "Fistulas", "Mesenteric fat stranding"],
      mri_enterography: ["Active inflammation (T2 bright)", "Strictures vs. inflammation"],
      colonoscopy: ["Aphthous ulcers", "Cobblestoning", "Skip lesions", "Strictures"]
    },
    severity: {
      mild: { description: "Outpatient, eating/drinking, <10% weight loss" },
      moderate: { description: "Failed first-line, intermittent symptoms" },
      severe: { description: "Hospitalized, obstruction, abscess, high CRP" }
    },
    modifications: {
      gi_tract: {
        physiology: {
          intestinal_absorption: { factor: 0.6, note: "Malabsorption" },
          transit_time: { factor: 0.7, note: "Diarrhea" }
        },
        structure: {
          wall_thickness: { factor: 2.0, note: "Transmural inflammation" }
        }
      },
      blood: {
        geometry: {
          hemoglobin: { factor: 0.8, note: "Anemia" }
        },
        proteins: {
          albumin: { factor: 0.75, note: "Hypoalbuminemia" }
        }
      }
    }
  },

  // =====================
  // ULCERATIVE COLITIS
  // ICD-10: K51.9
  // =====================

  K51_9: {
    name: "Ulcerative Colitis",
    icd10: "K51.9",
    category: "autoimmune",
    definition: "Chronic inflammatory bowel disease limited to colon with continuous mucosal involvement",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "joints", "skin", "liver"],
    pathophysiology: {
      mechanism: "Mucosal immune dysregulation → continuous inflammation from rectum proximally",
      molecularBasis: "Th2-skewed response; anti-epithelial antibodies; pANCA positive in 60-70%"
    },
    clinicalPresentation: {
      symptoms: [
        "Bloody diarrhea",
        "Urgency/tenesmus",
        "Abdominal cramping (LLQ)",
        "Nocturnal bowel movements",
        "Weight loss",
        "Fatigue"
      ],
      signs: [
        "LLQ tenderness",
        "Tachycardia (severe)",
        "Fever (severe)",
        "Distension (toxic megacolon)",
        "Extraintestinal: uveitis, erythema nodosum, PSC"
      ]
    },
    laboratoryFindings: [
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Elevated" },
      { name: "Fecal calprotectin", normalRange: "<50 μg/g", abnormalInDisease: "Elevated" },
      { name: "Hemoglobin", normalRange: "Normal", abnormalInDisease: "Anemia from chronic blood loss" },
      { name: "pANCA", normalRange: "Negative", abnormalInDisease: "Positive (60-70%)" },
      { name: "Stool studies", normalRange: "Negative", abnormalInDisease: "Rule out C. diff, pathogens" }
    ],
    imagingFindings: {
      colonoscopy: ["Continuous inflammation from rectum", "Loss of haustral markings", "Pseudopolyps", "Ulceration"],
      ct: ["Wall thickening", "Loss of haustration", "Toxic megacolon (emergent)"],
      plain_xray: ["Thumbprinting", "Toxic megacolon (>6cm)"]
    },
    severity: {
      mild: { description: "<4 stools/day, no systemic symptoms" },
      moderate: { description: "4-6 stools/day, minimal systemic symptoms" },
      severe: { description: ">6 bloody stools/day, systemic toxicity, Truelove-Witts criteria" }
    },
    modifications: {
      gi_tract: {
        physiology: {
          colonic_function: { factor: 0.5, note: "Impaired absorption, bloody diarrhea" }
        },
        structure: {
          mucosal_integrity: { factor: 0.4, note: "Ulceration" }
        }
      },
      blood: {
        geometry: {
          hemoglobin: { factor: 0.75, note: "Iron deficiency anemia from blood loss" }
        }
      },
      liver: {
        structure: {
          biliary_changes: { factor: 1.3, note: "PSC association" }
        }
      }
    }
  },

  // =====================
  // MYASTHENIA GRAVIS
  // ICD-10: G70.0
  // =====================

  G70_0: {
    name: "Myasthenia Gravis",
    icd10: "G70.0",
    category: "autoimmune",
    definition: "Autoimmune neuromuscular junction disorder with fatigable muscle weakness",
    primaryOrgan: "muscles",
    affectedOrgans: ["muscles", "thymus", "lungs"],
    pathophysiology: {
      mechanism: "Autoantibodies against AChR or MuSK → impaired neuromuscular transmission → fatigable weakness",
      molecularBasis: "Anti-AChR (85%), anti-MuSK (5%); complement-mediated receptor destruction; thymic abnormalities"
    },
    clinicalPresentation: {
      symptoms: [
        "Fatigable weakness",
        "Ptosis (worse later in day)",
        "Diplopia",
        "Dysphagia",
        "Dysarthria",
        "Limb weakness (proximal)",
        "Respiratory weakness (crisis)"
      ],
      signs: [
        "Ptosis (worsens with sustained upgaze)",
        "Ophthalmoplegia",
        "Fatigable limb weakness",
        "Weak neck flexion",
        "Myasthenic snarl (weak facial muscles)"
      ]
    },
    laboratoryFindings: [
      { name: "Anti-AChR antibodies", normalRange: "Negative", abnormalInDisease: "Positive (85% generalized, 50% ocular)" },
      { name: "Anti-MuSK antibodies", normalRange: "Negative", abnormalInDisease: "Positive (5%, seronegative cases)" },
      { name: "Anti-LRP4 antibodies", normalRange: "Negative", abnormalInDisease: "Positive (rare, double seronegative)" }
    ],
    imagingFindings: {
      ct_chest: ["Thymoma (10-15%)", "Thymic hyperplasia"],
      edrophonium_test: ["Improvement with acetylcholinesterase inhibitor"],
      emg: ["Decremental response on repetitive nerve stimulation", "Increased jitter on single fiber EMG"]
    },
    severity: {
      mild: { description: "Ocular only (Class I)" },
      moderate: { description: "Mild generalized (Class IIa/b)" },
      severe: { description: "Severe generalized, crisis (Class III-V)" }
    },
    modifications: {
      muscles: {
        physiology: {
          muscle_strength: { factor: 0.6, note: "Fatigable weakness" },
          neuromuscular_transmission: { factor: 0.4, note: "Impaired ACh signaling" }
        }
      },
      lungs: {
        physiology: {
          fev1: { factor: 0.7, note: "Respiratory muscle weakness (crisis)" }
        }
      },
      thymus: {
        structure: {
          thymus_size: { factor: 2.0, note: "Hyperplasia or thymoma" }
        }
      }
    }
  },

  // =====================
  // POLYARTERITIS NODOSA
  // ICD-10: M30.0
  // =====================

  M30_0: {
    name: "Polyarteritis Nodosa",
    icd10: "M30.0",
    category: "autoimmune",
    definition: "Necrotizing vasculitis of medium-sized arteries without glomerulonephritis",
    primaryOrgan: "arteries",
    affectedOrgans: ["arteries", "kidneys", "gi_tract", "nerves", "skin"],
    pathophysiology: {
      mechanism: "Necrotizing inflammation of medium arteries → aneurysms, thrombosis, infarction",
      molecularBasis: "Immune complex deposition (some HBV-associated); neutrophilic infiltration; fibrinoid necrosis"
    },
    clinicalPresentation: {
      symptoms: [
        "Fever",
        "Weight loss",
        "Myalgias",
        "Abdominal pain",
        "Testicular pain",
        "Neuropathy (mononeuritis multiplex)",
        "Hypertension"
      ],
      signs: [
        "Livedo reticularis",
        "Subcutaneous nodules",
        "Skin ulcers",
        "Foot/wrist drop",
        "Hypertension",
        "Testicular tenderness"
      ]
    },
    laboratoryFindings: [
      { name: "ESR/CRP", normalRange: "Normal", abnormalInDisease: "Elevated" },
      { name: "Hepatitis B serology", normalRange: "Negative", abnormalInDisease: "Positive (10-30% associated)" },
      { name: "ANCA", normalRange: "Negative", abnormalInDisease: "Negative (differentiates from ANCA vasculitis)" },
      { name: "Creatinine", normalRange: "0.7-1.2 mg/dL", abnormalInDisease: "Elevated (renal artery involvement)" }
    ],
    imagingFindings: {
      angiography: ["Multiple aneurysms", "Beading pattern", "Arterial stenoses"],
      ct_angiography: ["Aneurysms (renal, mesenteric, hepatic)"],
      biopsy: ["Fibrinoid necrosis", "Neutrophilic infiltration of vessel wall"]
    },
    severity: {
      mild: { description: "Constitutional symptoms, skin only" },
      moderate: { description: "Neuropathy, limited organ involvement" },
      severe: { description: "Renal, GI, cardiac involvement; Five-Factor Score" }
    },
    modifications: {
      kidneys: {
        physiology: {
          gfr: { factor: 0.7, note: "Renal artery stenosis/infarction" },
          blood_pressure: { factor: 1.3, note: "Renovascular hypertension" }
        }
      },
      gi_tract: {
        physiology: {
          intestinal_perfusion: { factor: 0.7, note: "Mesenteric ischemia risk" }
        }
      },
      nerves: {
        physiology: {
          nerve_conduction: { factor: 0.6, note: "Mononeuritis multiplex" }
        }
      }
    }
  },

  // =====================
  // GRANULOMATOSIS WITH POLYANGIITIS (GPA/Wegener's)
  // ICD-10: M31.3
  // =====================

  M31_3: {
    name: "Granulomatosis with Polyangiitis (GPA)",
    icd10: "M31.3",
    category: "autoimmune",
    definition: "ANCA-associated vasculitis with granulomatous inflammation of respiratory tract and kidneys",
    primaryOrgan: "lungs",
    affectedOrgans: ["lungs", "kidneys", "sinuses", "skin", "eyes"],
    pathophysiology: {
      mechanism: "Granulomatous inflammation + necrotizing vasculitis of small vessels → multi-organ damage",
      molecularBasis: "PR3-ANCA (c-ANCA); neutrophil activation; granuloma formation"
    },
    clinicalPresentation: {
      symptoms: [
        "Chronic sinusitis",
        "Epistaxis",
        "Nasal crusting/saddle nose",
        "Cough/hemoptysis",
        "Dyspnea",
        "Hematuria",
        "Arthralgias"
      ],
      signs: [
        "Saddle nose deformity",
        "Septal perforation",
        "Scleritis/episcleritis",
        "Pulmonary nodules/infiltrates",
        "Skin lesions (purpura, ulcers)"
      ]
    },
    laboratoryFindings: [
      { name: "PR3-ANCA (c-ANCA)", normalRange: "Negative", abnormalInDisease: "Positive (90%+ generalized)" },
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "Hematuria, RBC casts, proteinuria" },
      { name: "Creatinine", normalRange: "0.7-1.2 mg/dL", abnormalInDisease: "Elevated (RPGN)" },
      { name: "ESR/CRP", normalRange: "Normal", abnormalInDisease: "Elevated" }
    ],
    imagingFindings: {
      ct_chest: ["Nodules (may cavitate)", "Ground-glass opacities", "Alveolar hemorrhage"],
      ct_sinuses: ["Mucosal thickening", "Bone erosion", "Septal perforation"],
      renal_biopsy: ["Pauci-immune crescentic GN"]
    },
    severity: {
      mild: { description: "Limited disease (ENT only)" },
      moderate: { description: "Pulmonary involvement without renal" },
      severe: { description: "Renal involvement, alveolar hemorrhage, BVAS" }
    },
    modifications: {
      lungs: {
        physiology: {
          fev1: { factor: 0.75, note: "Pulmonary involvement" },
          oxygen_saturation: { factor: 0.92, note: "Alveolar hemorrhage" }
        },
        structure: {
          nodules: { factor: 5.0, note: "Cavitating nodules" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.4, note: "Rapidly progressive GN" },
          creatinine: { factor: 3.0, note: "Acute kidney injury" }
        }
      },
      blood: {
        geometry: {
          hemoglobin: { factor: 0.8, note: "Anemia" }
        }
      }
    }
  },

  // =====================
  // PSORIATIC ARTHRITIS
  // ICD-10: M07.3
  // =====================

  M07_3: {
    name: "Psoriatic Arthritis",
    icd10: "M07.3",
    category: "autoimmune",
    definition: "Inflammatory arthritis associated with psoriasis, with diverse patterns of joint involvement",
    primaryOrgan: "joints",
    affectedOrgans: ["joints", "skin", "nails", "spine", "eyes"],
    pathophysiology: {
      mechanism: "IL-23/IL-17 driven inflammation → enthesitis, synovitis, new bone formation",
      molecularBasis: "HLA associations (B27, B38, B39); TNF-α, IL-17, IL-23; entheseal inflammation"
    },
    clinicalPresentation: {
      symptoms: [
        "Joint pain/swelling",
        "Morning stiffness",
        "Psoriasis (may precede arthritis)",
        "Back pain (spondylitis)",
        "Finger/toe swelling (dactylitis)",
        "Heel pain (enthesitis)"
      ],
      signs: [
        "Dactylitis (sausage digit)",
        "Enthesitis (Achilles, plantar fascia)",
        "DIP involvement",
        "Asymmetric oligoarthritis",
        "Nail pitting, onycholysis",
        "Psoriatic plaques"
      ]
    },
    laboratoryFindings: [
      { name: "RF", normalRange: "Negative", abnormalInDisease: "Negative (differentiates from RA)" },
      { name: "HLA-B27", normalRange: "8% population", abnormalInDisease: "Positive (40-50% with axial disease)" },
      { name: "ESR/CRP", normalRange: "Normal", abnormalInDisease: "Elevated (active disease)" },
      { name: "Uric acid", normalRange: "<7 mg/dL", abnormalInDisease: "May be elevated (high cell turnover)" }
    ],
    imagingFindings: {
      xray: ["Pencil-in-cup deformity", "Periostitis", "Enthesophytes", "Sacroiliitis (asymmetric)"],
      mri: ["Enthesitis", "Bone marrow edema", "Dactylitis"],
      ultrasound: ["Enthesitis", "Synovitis", "Power Doppler signal"]
    },
    severity: {
      mild: { description: "Oligoarthritis, minimal skin disease" },
      moderate: { description: "Polyarthritis, moderate psoriasis" },
      severe: { description: "Mutilating arthritis, extensive psoriasis, axial disease" }
    },
    modifications: {
      joints: {
        structure: {
          joint_space: { factor: 0.7, note: "Erosions" },
          bone_formation: { factor: 1.5, note: "Enthesophytes" }
        }
      },
      skin: {
        structure: {
          epidermal_thickness: { factor: 2.0, note: "Psoriatic plaques" }
        }
      },
      spine: {
        physiology: {
          spinal_mobility: { factor: 0.75, note: "Axial involvement" }
        }
      }
    }
  }
};

export default AUTOIMMUNE_DISEASES;
