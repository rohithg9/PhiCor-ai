// ============================================================================
// COMPREHENSIVE CARDIAC DISEASE DATABASE - PART 4
// ICD-10-CM: I33-I39 (Valvular), I44-I46 (Conduction), I60-I69 (Cerebrovascular)
// ============================================================================

export const CARDIAC_DISEASES_PART4 = {

  // ============================================================================
  // I34-I37: VALVULAR HEART DISEASE
  // ============================================================================
  
  I35_0: {
    icd10: "I35.0",
    name: "Aortic Valve Stenosis",
    snomedCT: "60234000",
    category: "valvular",
    
    definition: "Obstruction to LV outflow due to calcific degeneration or congenital bicuspid valve",
    
    epidemiology: {
      prevalence: "2-7% of adults >65, most common valvular disease in developed countries",
      etiology: {
        degenerative: "Most common in elderly (>70)",
        bicuspid: "Most common in younger patients (50-70)",
        rheumatic: "Commissural fusion, usually with MV involvement"
      }
    },
    
    pathophysiology: {
      mechanism: "Progressive calcification → reduced valve orifice → pressure overload → concentric LVH",
      natural_history: "Latent period 10-20 years, then symptoms herald rapid decline",
      
      novelEquations: [
        {
          id: "as_gradient_continuity",
          name: "Aortic Valve Area (Continuity Equation)",
          isNovel: false,
          latex: "AVA = \\frac{LVOT_{area} \\times VTI_{LVOT}}{VTI_{AV}} = \\frac{\\pi (D_{LVOT}/2)^2 \\times VTI_{LVOT}}{VTI_{AV}}",
          derivation: {
            background: "Conservation of mass - flow through LVOT equals flow through AV",
            steps: [
              "1. Flow = Area × Velocity (or Area × VTI for pulsatile flow)",
              "2. LVOT flow = AV flow (no shunt)",
              "3. LVOT_area × VTI_LVOT = AVA × VTI_AV",
              "4. Solve for AVA",
              "5. LVOT diameter measured in PLAX, VTIs from PW (LVOT) and CW (AV) Doppler"
            ],
            evidence: "Standard echocardiographic method, validated against catheterization",
            clinicalImplication: "AVA <1.0 cm² = severe AS; gradient alone can be misleading in low-flow states"
          },
          clinicalUse: "Gold standard for AS severity assessment"
        },
        {
          id: "as_pressure_gradient",
          name: "Pressure Gradient (Simplified Bernoulli)",
          isNovel: false,
          latex: "\\Delta P = 4V^2 \\quad \\text{(mean gradient from VTI)}",
          derivation: {
            background: "Simplified from full Bernoulli equation assuming V1 << V2",
            steps: [
              "1. Full Bernoulli: ΔP = 4(V2² - V1²) + acceleration + viscous terms",
              "2. If V1 (LVOT) << V2 (jet), then ΔP ≈ 4V2²",
              "3. Peak gradient = 4 × (peak velocity)²",
              "4. Mean gradient = traced from Doppler envelope",
              "5. Note: May underestimate if V1 is high (small LVOT)"
            ],
            evidence: "Validated against catheter gradients",
            clinicalImplication: "Mean gradient >40 mmHg = severe (with normal flow)"
          },
          clinicalUse: "Severity assessment, BUT requires normal flow state"
        },
        {
          id: "as_lvh_wall_stress",
          name: "AS Compensatory LVH Model",
          isNovel: true,
          latex: "\\frac{dh}{dt} = k_{hypertrophy} \\times (\\sigma_{wall} - \\sigma_{target}) \\quad \\text{where} \\quad \\sigma = \\frac{P \\times r}{2h}",
          derivation: {
            background: "LV hypertrophies to normalize wall stress in response to pressure overload",
            steps: [
              "1. Increased afterload (AS) raises systolic pressure",
              "2. LaPlace: Wall stress = (P × r) / (2 × h)",
              "3. LV senses elevated wall stress → triggers hypertrophy",
              "4. Increased wall thickness (h) normalizes wall stress",
              "5. Compensation succeeds until 'afterload mismatch' occurs",
              "6. When hypertrophy can't keep up → LV dilates → failure"
            ],
            evidence: "Pressure-volume loop studies, echo remodeling data",
            clinicalImplication: "Explains asymptomatic phase (compensated) vs decompensation"
          },
          clinicalUse: "Understand transition from compensated to symptomatic AS"
        },
        {
          id: "as_symptom_onset_survival",
          name: "AS Natural History Post-Symptoms",
          isNovel: true,
          latex: "Survival_{years} = \\begin{cases} 5 & \\text{Angina} \\\\ 3 & \\text{Syncope} \\\\ 2 & \\text{Heart Failure} \\end{cases}",
          derivation: {
            background: "Classic natural history data showing poor prognosis once symptoms develop",
            steps: [
              "1. Angina: Supply-demand mismatch, LVH increases demand, coronary reserve decreased",
              "2. Syncope: Fixed cardiac output cannot meet exercise demand; or arrhythmia",
              "3. Heart failure: LV decompensation, afterload mismatch",
              "4. Average survival without intervention is 2-5 years depending on presenting symptom",
              "5. 50% mortality at 2 years with HF symptoms"
            ],
            evidence: "Ross & Braunwald 1968, subsequent observational studies",
            clinicalImplication: "Symptoms = indication for intervention (TAVR or SAVR)"
          },
          clinicalUse: "Counsel patients on urgency of intervention"
        },
        {
          id: "low_flow_low_gradient_as",
          name: "Low-Flow Low-Gradient AS Differentiation",
          isNovel: true,
          latex: "True\\ AS: AVA_{stress} < 1.0\\ cm^2 \\quad ; \\quad Pseudo-AS: AVA_{stress} > 1.0\\ cm^2",
          derivation: {
            background: "Low EF can cause low gradients despite severe AS; dobutamine stress differentiates",
            steps: [
              "1. Classical severe AS: AVA <1.0, mean gradient >40, Vmax >4 m/s",
              "2. Low-flow low-gradient: AVA <1.0, mean gradient <40 (due to low SV)",
              "3. Can be true severe AS (valve is severely stenotic) or pseudo-severe (appears stenotic because valve doesn't open fully with low flow)",
              "4. Dobutamine stress echo: increase flow → true AS stays severe, pseudo-AS opens",
              "5. Also assess stroke volume index (<35 mL/m² = low flow)"
            ],
            evidence: "TOPAS study, multiple observational cohorts",
            clinicalImplication: "True severe AS benefits from intervention; pseudo-AS does not"
          },
          clinicalUse: "Guide intervention in paradoxical low-gradient AS"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        classicTriad: [
          { name: "Angina", mechanism: "Supply-demand mismatch, LVH, subendocardial ischemia", survivalWithout: "5 years" },
          { name: "Syncope", mechanism: "Fixed CO + vasodilation, arrhythmia", survivalWithout: "3 years" },
          { name: "Heart failure (dyspnea)", mechanism: "LV decompensation", survivalWithout: "2 years" }
        ],
        exertional: "Symptoms typically with exertion initially, then progress to rest"
      },
      signs: {
        pulse: [
          { finding: "Pulsus parvus et tardus", description: "Weak and delayed carotid upstroke" },
          { finding: "Narrow pulse pressure", description: "Low stroke volume" }
        ],
        palpation: [
          { finding: "Sustained apical impulse", description: "LVH" },
          { finding: "Systolic thrill", location: "Right 2nd intercostal space, carotids" }
        ],
        auscultation: {
          murmur: {
            character: "Crescendo-decrescendo systolic ejection murmur",
            location: "Right upper sternal border",
            radiation: "Carotids (vs HOCM which does not)",
            timing: "Later peak = more severe",
            gallavardin: "High-frequency component at apex mimicking MR"
          },
          s2: {
            soft_a2: "Immobile calcified valve",
            single_s2: "Delayed A2 merges with P2 in severe AS",
            paradoxical_split: "A2 after P2 (severe AS)"
          },
          s4: "Common (stiff LV)",
          ejection_click: "In bicuspid (flexible valve), disappears with calcification"
        }
      }
    },
    
    diagnosticCriteria: {
      severity: {
        mild: { ava: ">1.5 cm²", meanGrad: "<20 mmHg", vmax: "<3.0 m/s" },
        moderate: { ava: "1.0-1.5 cm²", meanGrad: "20-40 mmHg", vmax: "3.0-4.0 m/s" },
        severe: { ava: "<1.0 cm²", meanGrad: ">40 mmHg", vmax: ">4.0 m/s" },
        critical: { ava: "<0.6 cm²", meanGrad: ">60 mmHg", vmax: ">5.0 m/s" }
      },
      indexedAVA: "AVAi <0.6 cm²/m² = severe (accounts for body size)",
      lowFlow: {
        definition: "SVi <35 mL/m²",
        classical: "Low EF (<50%) + low flow + low gradient",
        paradoxical: "Normal EF + low flow (small LV) + low gradient"
      }
    },
    
    laboratoryFindings: {
      biomarkers: [
        { test: "BNP/NT-proBNP", significance: "Elevated = worse prognosis, may help timing of intervention in asymptomatic" }
      ],
      preoperative: [
        { test: "CBC", purpose: "Anemia worsens symptoms" },
        { test: "BMP", purpose: "Renal function for contrast, drug dosing" },
        { test: "Coagulation", purpose: "Pre-procedural" }
      ]
    },
    
    imagingFindings: {
      echocardiogram: {
        morphology: [
          "Thickened, calcified aortic valve",
          "Reduced leaflet excursion",
          "Bicuspid (raphe, eccentric closure, doming)"
        ],
        measurements: [
          { parameter: "Peak velocity", method: "CW Doppler across AV" },
          { parameter: "Mean gradient", method: "Trace CW envelope" },
          { parameter: "AVA", method: "Continuity equation" },
          { parameter: "Dimensionless index", formula: "VTI_LVOT / VTI_AV", severe: "<0.25" }
        ],
        lvAssessment: [
          "LV wall thickness (LVH)",
          "LVEF (usually preserved until late)",
          "GLS (may be reduced before EF drops)"
        ],
        dobutamineStress: {
          indication: "Low-flow low-gradient AS",
          trueAS: "AVA stays <1.0 cm² with increased flow, gradient increases",
          pseudoAS: "AVA increases >1.0 cm², valve was not truly severely stenotic",
          noReserve: "No increase in SV = poor surgical prognosis"
        }
      },
      ctCalciumScoring: {
        indication: "Discordant echo findings, low-flow low-gradient",
        severe: {
          men: "AV calcium >2000 AU (or >300 AU/cm²)",
          women: "AV calcium >1200 AU (or >200 AU/cm²)"
        }
      },
      cardiacCath: {
        indication: "Discrepancy between clinical and echo findings",
        gorlinFormula: "AVA = CO / (44.3 × SEP × HR × √ΔP)",
        note: "Rarely needed with modern echo"
      }
    },
    
    treatment: {
      medical: {
        symptomatic: {
          diuretics: "Cautious - may drop preload and worsen symptoms",
          avoidVasodilators: "Can cause hypotension with fixed CO",
          afRateControl: "Maintain sinus if possible"
        },
        noMedicalTherapyAltersProgression: "No proven medical therapy to slow AS progression"
      },
      intervention: {
        indications: {
          classI: [
            "Symptomatic severe AS (angina, syncope, HF)",
            "Severe AS + LVEF <50%",
            "Severe AS undergoing other cardiac surgery"
          ],
          classIIa: [
            "Asymptomatic very severe AS (Vmax >5 m/s)",
            "Asymptomatic severe AS with rapid progression",
            "Asymptomatic severe AS with abnormal exercise test"
          ]
        },
        options: {
          savr: {
            description: "Surgical aortic valve replacement",
            valveTypes: {
              mechanical: "Durable, requires lifelong anticoagulation",
              bioprosthetic: "Limited durability (10-20 years), minimal anticoag"
            },
            mortality: "2-3% in low-risk",
            preferred: "Younger patients, low surgical risk"
          },
          tavr: {
            description: "Transcatheter aortic valve replacement",
            access: ["Transfemoral (preferred)", "Transapical", "Transaortic", "Subclavian"],
            evidence: ["PARTNER trials", "CoreValve", "SAPIEN"],
            indications: {
              prohibitive: "TAVR only option",
              highRisk: "TAVR non-inferior/superior",
              intermediateRisk: "TAVR non-inferior",
              lowRisk: "TAVR non-inferior (PARTNER 3, Evolut Low Risk)"
            },
            complications: ["Paravalvular leak", "Conduction abnormalities (LBBB, need for PPM)", "Stroke", "Vascular complications"]
          },
          balloon_valvuloplasty: {
            indication: "Bridge to definitive therapy, palliation, cardiogenic shock",
            limitation: "High restenosis rate, not definitive"
          }
        }
      },
      followUp: {
        asymptomatic: {
          mild: "Echo every 3-5 years",
          moderate: "Echo every 1-2 years",
          severe: "Echo every 6-12 months, close symptom monitoring"
        }
      }
    }
  },

  I34_0: {
    icd10: "I34.0",
    name: "Mitral Valve Regurgitation (Non-rheumatic)",
    snomedCT: "48724000",
    category: "valvular",
    
    definition: "Incompetent mitral valve allowing systolic backflow from LV to LA",
    
    etiology: {
      primary: {
        description: "Intrinsic valve pathology",
        causes: ["Myxomatous degeneration (MVP)", "Flail leaflet/chordae", "Endocarditis", "Rheumatic", "Congenital"]
      },
      secondary: {
        description: "Functional MR from LV/LA pathology with normal valve",
        causes: ["LV dilation (DCM)", "Ischemic (papillary muscle dysfunction, wall motion abnormality)", "LA dilation (AF)"]
      }
    },
    
    pathophysiology: {
      hemodynamics: "LV ejects into both aorta AND LA (lower resistance) → LA/LV volume overload",
      acute: "Sudden severe MR → acute pulmonary edema (non-compliant LA)",
      chronic: "LA dilates to accommodate, LV eccentric remodeling, eventual LV failure",
      
      novelEquations: [
        {
          id: "mr_regurgitant_volume",
          name: "Regurgitant Volume Calculation",
          isNovel: false,
          latex: "RV = SV_{total} - SV_{forward} = (LVOT_{area} \\times VTI_{LVOT}) - (AV_{area} \\times VTI_{AV})",
          alternativeMethod: "RV = EROA \\times VTI_{MR} \\quad ; \\quad EROA = \\frac{2\\pi r^2 \\times V_{alias}}{V_{max}}",
          derivation: {
            background: "Quantify MR severity by measuring regurgitant volume",
            steps: [
              "1. Total SV = LVEDV - LVESV (from biplane Simpson)",
              "2. Forward SV = LVOT area × VTI_LVOT (what goes to aorta)",
              "3. Regurgitant volume = Total SV - Forward SV",
              "4. Alternative: PISA method calculates EROA from flow convergence",
              "5. RV = EROA × VTI of MR jet"
            ],
            evidence: "ASE/EACVI guidelines for valvular quantification",
            clinicalImplication: "RV ≥60 mL or EROA ≥0.4 cm² = severe primary MR"
          },
          clinicalUse: "Quantify MR severity for intervention decisions"
        },
        {
          id: "mr_lv_remodeling",
          name: "MR Volume Overload Remodeling",
          isNovel: true,
          latex: "\\frac{dLVEDV}{dt} = k_{volume} \\times RV - k_{contractile} \\times Afterload_{reduction}",
          derivation: {
            background: "Chronic MR causes eccentric LV remodeling (dilation)",
            steps: [
              "1. MR creates volume overload on LV",
              "2. LV dilates to handle increased volume (Frank-Starling)",
              "3. Initially: EF preserved/increased (low afterload via LA 'pop-off')",
              "4. Eccentric hypertrophy: sarcomeres added in series",
              "5. Eventually: Contractile dysfunction, EF drops, irreversible",
              "6. Early surgery prevents irreversible remodeling"
            ],
            evidence: "Natural history studies, surgical timing literature",
            clinicalImplication: "Operate before EF drops <60% or LVESD >40mm"
          },
          clinicalUse: "Timing of MV intervention"
        },
        {
          id: "secondary_mr_tethering",
          name: "Secondary MR Tethering Model",
          isNovel: true,
          latex: "MR_{severity} \\propto \\frac{Tethering\\ distance}{Closing\\ force} = \\frac{d_{PM-annulus}}{\\Delta P_{transmitral} \\times A_{leaflet}}",
          derivation: {
            background: "Functional MR occurs from papillary muscle displacement and leaflet tethering",
            steps: [
              "1. LV dilation moves papillary muscles laterally and apically",
              "2. This tethers chordae, restricting leaflet closure",
              "3. Annular dilation further prevents coaptation",
              "4. Closing force = transmitral pressure gradient × leaflet area",
              "5. When tethering > closing force → MR",
              "6. Unlike primary MR, fixing the valve alone doesn't fix the LV"
            ],
            evidence: "3D echo tethering studies, COAPT vs MITRA-FR analysis",
            clinicalImplication: "GDMT for secondary MR; MitraClip for 'disproportionate' MR (COAPT criteria)"
          },
          clinicalUse: "Distinguish primary vs secondary MR management"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        chronic: [
          { name: "Dyspnea", mechanism: "Pulmonary congestion from elevated LA pressure" },
          { name: "Fatigue", mechanism: "Reduced forward cardiac output" },
          { name: "Palpitations", mechanism: "AF from LA dilation" }
        ],
        acute: [
          { name: "Severe dyspnea", mechanism: "Flash pulmonary edema" },
          { name: "Cardiogenic shock", mechanism: "Acute severe MR (chordal rupture, endocarditis)" }
        ]
      },
      signs: {
        pulse: ["May be normal or low volume if severe"],
        palpation: [
          { finding: "Hyperdynamic apex", description: "Volume-overloaded LV" },
          { finding: "Displaced PMI", description: "LV dilation" },
          { finding: "Systolic thrill at apex", description: "Severe MR" }
        ],
        auscultation: {
          murmur: {
            character: "Holosystolic (pansystolic) blowing murmur",
            location: "Apex",
            radiation: "Axilla (posterior leaflet pathology) or base (anterior leaflet)",
            pitfalls: "Acute severe MR may have soft/short murmur (pressure equilibration)"
          },
          s1: "Usually soft (incomplete closure)",
          s3: "Common in significant MR (volume overload)",
          widely_split_s2: "Early A2 due to shortened LV ejection"
        }
      }
    },
    
    diagnosticCriteria: {
      primary_severe: {
        qualitative: ["Large central jet >40% LA or wall-hugging jet", "Flail leaflet", "Ruptured papillary muscle"],
        semiquantitative: {
          venaContracta: "≥0.7 cm",
          regurgitantJetArea: ">40% of LA"
        },
        quantitative: {
          eroa: "≥0.4 cm²",
          regurgitantVolume: "≥60 mL",
          regurgitantFraction: "≥50%"
        }
      },
      secondary_severe: {
        differentCriteria: "Lower thresholds: EROA ≥0.2 cm², RV ≥30 mL (prognostically significant at lower values)"
      }
    },
    
    imagingFindings: {
      echocardiogram: {
        morphology: [
          "Leaflet prolapse/flail",
          "Leaflet thickening",
          "Annular dilation",
          "Restricted motion (tethering in secondary)"
        ],
        doppler: [
          { method: "Color flow", finding: "Jet area, vena contracta, PISA" },
          { method: "CW Doppler", finding: "Dense, full envelope MR jet" },
          { method: "PW in pulmonary veins", finding: "Systolic flow reversal = severe" }
        ],
        lvAssessment: "LVEDV, LVESV, LVEF (operate before EF <60%)",
        laSize: "LA dilation indicates chronicity"
      },
      tee: {
        indication: "Surgical planning, mechanism unclear",
        findings: "Precise localization of pathology (Carpentier classification)"
      }
    },
    
    treatment: {
      medical: {
        acuteSevere: ["Afterload reduction (nitroprusside)", "IABP", "Urgent surgery"],
        chronic: {
          primary: "No medical therapy alters natural history; watch for surgical triggers",
          secondary: "GDMT for underlying cardiomyopathy is primary treatment"
        }
      },
      surgical: {
        indications_primary: {
          classI: [
            "Symptomatic severe primary MR",
            "Asymptomatic severe MR + LV dysfunction (EF 30-60% or LVESD ≥40mm)"
          ],
          classIIa: [
            "Asymptomatic severe MR with preserved LV + high repair likelihood (>95%)",
            "Asymptomatic severe MR + new-onset AF or PASP >50mmHg"
          ]
        },
        options_primary: {
          repair: {
            preferred: "Over replacement when feasible",
            techniques: ["Annuloplasty ring", "Leaflet resection", "Neochordae", "Edge-to-edge repair"],
            durability: ">90% freedom from reoperation at 10 years for degenerative MR"
          },
          replacement: {
            indication: "Repair not feasible (severe calcification, rheumatic)",
            valves: ["Bioprosthetic", "Mechanical"]
          }
        },
        secondary_mr: {
          gdmt_first: "Optimize HF therapy",
          mitraClip: {
            indication: "COAPT criteria: Symptomatic HF, EF 20-50%, LVESD ≤70mm, EROA ≥0.3cm², on GDMT",
            contraindication: "MITRA-FR criteria (very dilated LV, less MR) - no benefit",
            evidence: "COAPT: 47% reduction in HF hospitalization"
          }
        }
      }
    }
  },

  // ============================================================================
  // I44-I45: CONDUCTION DISORDERS
  // ============================================================================
  
  I44_2: {
    icd10: "I44.2",
    name: "Complete Atrioventricular Block (Third-degree)",
    snomedCT: "27885002",
    category: "conduction",
    
    definition: "Complete dissociation between atrial and ventricular activity; no AV conduction",
    
    etiology: {
      acquired: {
        degenerative: "Fibrosis of conduction system (Lev's disease, Lenègre's disease)",
        ischemic: "Inferior MI (AV node), Anterior MI (His-Purkinje)",
        infectious: "Lyme disease, Chagas, Endocarditis with abscess",
        inflammatory: "Sarcoidosis, SLE",
        iatrogenic: "Post-TAVR, Post-surgical, Catheter ablation"
      },
      congenital: "Maternal anti-Ro/La antibodies, structural heart defects"
    },
    
    pathophysiology: {
      mechanism: "Block at AV node, His bundle, or bilateral bundle branches",
      escapeRhythm: {
        junctional: { rate: "40-60 bpm", qrs: "Narrow (usually)", reliability: "More reliable" },
        ventricular: { rate: "20-40 bpm", qrs: "Wide", reliability: "Less reliable, higher risk" }
      },
      
      novelEquations: [
        {
          id: "av_conduction_time",
          name: "AV Conduction Intervals",
          isNovel: false,
          latex: "PR = PA + AH + HV \\quad (Normal:\\ 25-55 + 55-125 + 35-55\\ ms)",
          derivation: {
            background: "PR interval comprises three conduction segments",
            steps: [
              "1. PA interval: Intra-atrial conduction (25-55 ms)",
              "2. AH interval: AV node conduction (55-125 ms) - vagal modulation",
              "3. HV interval: His-Purkinje conduction (35-55 ms) - fixed",
              "4. Block above His → narrow QRS escape, better prognosis",
              "5. Block below His → wide QRS escape, worse prognosis"
            ],
            evidence: "EP studies with His bundle recordings",
            clinicalImplication: "HV >100ms or infra-Hisian block = high-risk, consider pacing"
          },
          clinicalUse: "Localize block level in EP study"
        },
        {
          id: "escape_rhythm_cardiac_output",
          name: "Cardiac Output in Complete Heart Block",
          isNovel: true,
          latex: "CO_{CHB} = HR_{escape} \\times SV \\times (1 - f_{AV dyssynchrony})",
          derivation: {
            background: "Low escape rate and loss of AV synchrony reduce cardiac output",
            steps: [
              "1. Escape rate 20-60 bpm limits CO",
              "2. Loss of atrial kick reduces SV by 15-25%",
              "3. Variable AV relationship causes 'pacemaker syndrome' symptoms",
              "4. Cannon A waves occur when atria contract against closed TV",
              "5. DDD pacing restores AV synchrony and higher rate"
            ],
            evidence: "Pacemaker studies comparing VVI vs DDD modes",
            clinicalImplication: "DDD pacing preferred over VVI when AV node function preserved"
          },
          clinicalUse: "Explain symptoms, justify dual-chamber pacing"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        low_output: ["Fatigue", "Exercise intolerance", "Dyspnea"],
        cerebral: ["Syncope (Stokes-Adams attacks)", "Presyncope", "Confusion"],
        heart_failure: "If prolonged bradycardia leads to remodeling"
      },
      signs: {
        bradycardia: "Regular slow pulse (escape rhythm)",
        cannon_a_waves: "Intermittent jugular pulsations when atria contract against closed TV",
        variable_s1: "Beat-to-beat variation based on AV relationship",
        hypotension: "May be present"
      }
    },
    
    diagnosticCriteria: {
      ecg: {
        findings: [
          "P waves and QRS complexes independent (no relationship)",
          "Atrial rate > Ventricular rate",
          "Constant PP interval, constant RR interval, but no PR relationship",
          "QRS may be narrow (junctional) or wide (ventricular escape)"
        ]
      },
      vs2ndDegree: "In 3rd degree: NO conducted beats; in Mobitz II: some conducted, some dropped"
    },
    
    imagingFindings: {
      echocardiogram: {
        purpose: "Assess LV function, look for structural heart disease",
        findings: {
          lvef: "May be reduced from chronic bradycardia",
          dyssynchrony: "Can develop with chronic RV pacing"
        }
      }
    },
    
    treatment: {
      acute: {
        symptomatic: [
          { intervention: "Atropine", dose: "0.5-1mg IV", efficacy: "May work if block at AV node, not below" },
          { intervention: "Isoproterenol", indication: "Temporizing" },
          { intervention: "Transcutaneous pacing", indication: "Unstable, bridge to transvenous" },
          { intervention: "Transvenous pacing", indication: "Hemodynamically unstable" }
        ]
      },
      permanent: {
        pacemaker: {
          indication: "Symptomatic CHB, or asymptomatic if pause >3sec or escape <40bpm",
          modes: {
            ddd: "Dual-chamber pacing - preferred if AV node disease but intact sinus",
            vvi: "If chronic AF with CHB",
            crt: "If LVEF <35-50%, anticipate high RV pacing burden"
          }
        },
        considerCRT: "If expected RV pacing >40%, LVEF borderline"
      },
      reversible: "Treat underlying cause (Lyme → antibiotics, drug-induced → stop drug)"
    }
  },

  // ============================================================================
  // I63: CEREBRAL INFARCTION (STROKE)
  // ============================================================================
  
  I63_9: {
    icd10: "I63.9",
    name: "Cerebral Infarction, Unspecified",
    snomedCT: "432504007",
    category: "cerebrovascular",
    
    definition: "Acute focal neurological deficit from cerebral ischemia with infarction",
    
    etiology: {
      largeVessel: "Atherosclerotic stenosis/occlusion of carotid or vertebrobasilar system",
      cardioembolic: ["AF", "LV thrombus", "Valvular disease", "PFO with DVT"],
      smallVessel: "Lacunar infarcts from lipohyalinosis (HTN, DM)",
      other: ["Dissection", "Hypercoagulable state", "Vasculitis"],
      cryptogenic: "~25% after workup"
    },
    
    pathophysiology: {
      mechanism: "Arterial occlusion → ischemia → if prolonged → infarction",
      penumbra: "Tissue at risk surrounding core infarct - target of reperfusion",
      
      novelEquations: [
        {
          id: "cbf_autoregulation",
          name: "Cerebral Blood Flow Autoregulation",
          isNovel: true,
          latex: "CBF = \\frac{CPP}{CVR} = \\frac{MAP - ICP}{CVR} \\approx 50\\ mL/100g/min",
          autoregulationRange: "MAP 60-150 mmHg normally; shifted rightward in chronic HTN",
          derivation: {
            background: "Brain maintains constant CBF over wide MAP range through arteriolar vasoregulation",
            steps: [
              "1. CPP = Cerebral perfusion pressure = MAP - ICP (or CVP if higher)",
              "2. CVR = Cerebral vascular resistance (autoregulated)",
              "3. When MAP drops: Arterioles dilate to maintain CBF",
              "4. When MAP rises: Arterioles constrict to prevent hyperperfusion",
              "5. Below autoregulatory threshold: CBF falls linearly with MAP",
              "6. In acute stroke: Autoregulation often impaired in penumbra"
            ],
            evidence: "Transcranial Doppler and PET studies",
            clinicalImplication: "Avoid hypotension in acute stroke; permissive hypertension up to 220/120"
          },
          clinicalUse: "BP management in acute stroke"
        },
        {
          id: "infarct_growth_model",
          name: "Ischemic Penumbra and Time",
          isNovel: true,
          latex: "V_{infarct}(t) = V_{core} + V_{penumbra} \\times (1 - e^{-t/\\tau_{progression}})",
          derivation: {
            background: "Core infarct expands into penumbra over time without reperfusion",
            steps: [
              "1. Core: Irreversibly damaged tissue (CBF <10 mL/100g/min)",
              "2. Penumbra: Ischemic but viable (CBF 10-20 mL/100g/min)",
              "3. Without reperfusion: Penumbra progresses to infarct over hours",
              "4. 'Time is brain': ~1.9 million neurons lost per minute in large stroke",
              "5. Reperfusion within window can salvage penumbra",
              "6. Imaging (CTP, MRI DWI/PWI) identifies mismatch (penumbra)"
            ],
            evidence: "MR CLEAN, DAWN, DEFUSE-3 imaging studies",
            clinicalImplication: "Mismatch = target for thrombectomy even in extended window"
          },
          clinicalUse: "Select patients for reperfusion therapy"
        },
        {
          id: "hemorrhagic_transformation_risk",
          name: "Hemorrhagic Transformation Risk Model",
          isNovel: true,
          latex: "Risk_{HT} \\propto Infarct\\ Size \\times Reperfusion\\ Delay \\times BP \\times Anticoagulation",
          derivation: {
            background: "Reperfusion into infarcted tissue can cause hemorrhagic transformation",
            steps: [
              "1. Ischemia damages blood-brain barrier",
              "2. Larger infarct = more damaged vessels = higher risk",
              "3. Longer ischemia = more BBB damage = higher risk",
              "4. Reperfusion (especially late) can cause bleeding",
              "5. Hypertension and anticoagulation further increase risk",
              "6. Symptomatic ICH occurs in ~6% of tPA-treated patients"
            ],
            evidence: "NINDS, ECASS trials, thrombolysis registries",
            clinicalImplication: "Weigh benefit of reperfusion vs bleeding risk; control BP"
          },
          clinicalUse: "Risk-benefit discussion for tPA"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        byTerritory: {
          mca: ["Contralateral hemiparesis (face/arm > leg)", "Hemisensory loss", "Homonymous hemianopia", "Aphasia (dominant)", "Neglect (non-dominant)"],
          aca: ["Contralateral leg weakness > arm", "Abulia", "Incontinence"],
          pca: ["Homonymous hemianopia", "Visual agnosia", "Memory impairment"],
          basilar: ["Vertigo", "Diplopia", "Dysphagia", "Ataxia", "Crossed deficits", "Locked-in syndrome (severe)"],
          lacunar: ["Pure motor hemiparesis", "Pure sensory stroke", "Ataxic hemiparesis", "Dysarthria-clumsy hand"]
        }
      },
      signs: {
        nihss: {
          description: "NIH Stroke Scale - quantifies deficit severity",
          items: ["LOC", "Gaze", "Visual fields", "Facial palsy", "Motor arm/leg", "Ataxia", "Sensory", "Language", "Dysarthria", "Neglect"],
          interpretation: {
            minor: "1-4",
            moderate: "5-15",
            severe: "16-20",
            verySevere: ">20"
          }
        }
      },
      befast: ["Balance", "Eyes", "Face drooping", "Arm weakness", "Speech difficulty", "Time to call 911"]
    },
    
    diagnosticCriteria: {
      clinical: "Acute focal neurological deficit consistent with vascular territory",
      imaging: {
        ctHead: {
          role: "Rule out hemorrhage (before tPA)",
          findings: ["Hypodense area (may be subtle early)", "Dense MCA sign (thrombus)", "Loss of gray-white differentiation"],
          aspects: "Alberta Stroke Program Early CT Score - quantifies early ischemic changes"
        },
        ctAngiography: {
          role: "Identify large vessel occlusion for thrombectomy",
          findings: ["Vessel cutoff", "Clot location (ICA, M1, M2, basilar)"]
        },
        ctPerfusion: {
          role: "Identify penumbra (mismatch)",
          maps: {
            cbf: "Cerebral blood flow - core if severely reduced",
            cbv: "Cerebral blood volume - maintained in penumbra (autoregulation)",
            tmax: ">6 sec delay = penumbra",
            mismatch: "Tmax >6s volume >> CBF <30% volume = large penumbra"
          }
        },
        mri: {
          dwi: "Diffusion-weighted imaging - bright within minutes (cytotoxic edema)",
          pwi: "Perfusion - identifies hypoperfused tissue",
          dwiPwiMismatch: "Penumbra; target for intervention"
        }
      }
    },
    
    laboratoryFindings: {
      emergent: [
        { test: "Glucose", purpose: "Hypoglycemia can mimic stroke" },
        { test: "PT/INR", purpose: "Anticoagulation status for tPA eligibility" },
        { test: "Platelet count", purpose: "tPA contraindicated if <100k" }
      ],
      etiologyWorkup: [
        { test: "Lipid panel", purpose: "Atherosclerotic risk" },
        { test: "HbA1c", purpose: "Diabetes" },
        { test: "ECG", purpose: "AF detection" },
        { test: "Echo (TTE/TEE)", purpose: "Cardioembolic source" },
        { test: "Holter/event monitor", purpose: "Paroxysmal AF" },
        { test: "Hypercoagulable panel", indication: "Young, no clear etiology" }
      ]
    },
    
    treatment: {
      acute: {
        abcs: "Airway, breathing, circulation; oxygen if hypoxic",
        ivtpa: {
          window: "Within 4.5 hours of symptom onset (or last known well)",
          dose: "Alteplase 0.9 mg/kg (max 90mg); 10% bolus, 90% infusion over 60 min",
          indications: "Ischemic stroke, measurable deficit, no contraindications",
          contraindications: ["Recent surgery/trauma", "History of ICH", "Uncontrolled HTN >185/110", "INR >1.7", "Platelets <100k", "Glucose <50"]
        },
        tenecteplase: {
          alternative: "0.25 mg/kg single bolus",
          evidence: "Non-inferior to alteplase (EXTEND-IA TNK)"
        },
        mechanicalThrombectomy: {
          indication: "Large vessel occlusion (ICA, M1, sometimes M2, basilar)",
          window: {
            standard: "Within 6 hours",
            extended: "6-24 hours if significant mismatch (DAWN, DEFUSE-3 criteria)"
          },
          technique: "Stent retriever or aspiration",
          nnt: "~3-4 to achieve functional independence (one of most effective interventions in medicine)"
        },
        bloodPressure: {
          iftPA: "Maintain <180/105 for 24 hours",
          noReperfusion: "Permissive hypertension up to 220/120 (maintain penumbral perfusion)"
        }
      },
      secondaryPrevention: {
        antiplatelets: {
          monotherapy: "Aspirin 81mg or Clopidogrel 75mg",
          dapt: "Short-term (21-90 days) aspirin + clopidogrel for minor stroke/TIA (CHANCE, POINT)"
        },
        anticoagulation: {
          indication: "Cardioembolic (AF, LV thrombus)",
          timing: "Start 4-14 days post-stroke depending on size",
          agents: "DOACs preferred for AF"
        },
        statins: "High-intensity statin regardless of LDL",
        bloodPressure: "Target <130/80 after acute phase",
        lifestyle: ["Smoking cessation", "Exercise", "Diet"],
        carotidRevascularization: {
          indication: "Symptomatic carotid stenosis ≥50-70%",
          timing: "Within 2 weeks of stroke (max benefit)",
          options: ["Carotid endarterectomy (preferred)", "Carotid artery stenting"]
        }
      }
    }
  }
};

// Novel equations from Part 4
export const NOVEL_EQUATIONS_PART4 = [
  // Aortic Stenosis
  { id: "as_gradient_continuity", disease: "I35_0", category: "hemodynamics", complexity: "basic" },
  { id: "as_pressure_gradient", disease: "I35_0", category: "hemodynamics", complexity: "basic" },
  { id: "as_lvh_wall_stress", disease: "I35_0", category: "remodeling", complexity: "intermediate" },
  { id: "as_symptom_onset_survival", disease: "I35_0", category: "prognosis", complexity: "basic" },
  { id: "low_flow_low_gradient_as", disease: "I35_0", category: "diagnosis", complexity: "advanced" },
  
  // Mitral Regurgitation
  { id: "mr_regurgitant_volume", disease: "I34_0", category: "hemodynamics", complexity: "intermediate" },
  { id: "mr_lv_remodeling", disease: "I34_0", category: "remodeling", complexity: "intermediate" },
  { id: "secondary_mr_tethering", disease: "I34_0", category: "pathophysiology", complexity: "advanced" },
  
  // Complete Heart Block
  { id: "av_conduction_time", disease: "I44_2", category: "electrophysiology", complexity: "intermediate" },
  { id: "escape_rhythm_cardiac_output", disease: "I44_2", category: "hemodynamics", complexity: "intermediate" },
  
  // Stroke
  { id: "cbf_autoregulation", disease: "I63_9", category: "hemodynamics", complexity: "intermediate" },
  { id: "infarct_growth_model", disease: "I63_9", category: "pathophysiology", complexity: "advanced" },
  { id: "hemorrhagic_transformation_risk", disease: "I63_9", category: "risk", complexity: "intermediate" }
];

export default CARDIAC_DISEASES_PART4;
