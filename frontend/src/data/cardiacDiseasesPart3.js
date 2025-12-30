// ============================================================================
// COMPREHENSIVE CARDIAC DISEASE DATABASE - PART 3
// ICD-10-CM Chapter 9: I40-I52 (Cardiomyopathies, Arrhythmias, Heart Failure)
// ============================================================================

export const CARDIAC_DISEASES_PART3 = {

  // ============================================================================
  // I42: CARDIOMYOPATHIES
  // ============================================================================
  
  I42_0: {
    icd10: "I42.0",
    name: "Dilated Cardiomyopathy",
    snomedCT: "195021004",
    category: "cardiomyopathy",
    
    definition: "LV or biventricular dilation with systolic dysfunction not explained by coronary disease or abnormal loading",
    
    etiology: {
      genetic: { frequency: "30-50%", genes: ["TTN (titin)", "LMNA", "MYH7", "SCN5A"] },
      toxic: ["Alcohol", "Cocaine", "Chemotherapy (doxorubicin, trastuzumab)"],
      metabolic: ["Thyroid dysfunction", "Thiamine deficiency (beriberi)", "Selenium deficiency"],
      inflammatory: ["Myocarditis (post-viral)", "Sarcoidosis", "Autoimmune"],
      peripartum: "Last month pregnancy to 5 months postpartum",
      tachycardiaMediated: "Chronic tachycardia (often reversible)",
      idiopathic: "~50% after evaluation"
    },
    
    pathophysiology: {
      mechanism: "Myocyte injury/loss → eccentric remodeling → chamber dilation → decreased contractility → neurohormonal activation → progressive failure",
      
      novelEquations: [
        {
          id: "lv_remodeling_dynamics",
          name: "LV Remodeling Progression Model",
          isNovel: true,
          latex: "\\frac{dV_{LV}}{dt} = k_{stretch} \\times WallStress + k_{neuro} \\times [NE,AngII] - k_{reverse} \\times [GDMT]",
          derivation: {
            background: "LV dilation is driven by wall stress (LaPlace), neurohormonal activation, and can be reversed by medical therapy",
            steps: [
              "1. Wall stress = (P × r) / (2 × h) - increases with dilation",
              "2. Elevated wall stress triggers maladaptive hypertrophy and further dilation",
              "3. Neurohormones (NE, Ang II) promote fibrosis and myocyte death",
              "4. GDMT (ACEi, BB, MRA, SGLT2i) blocks neurohormonal axis",
              "5. Reverse remodeling occurs in ~40% with optimal therapy"
            ],
            evidence: "Echo studies showing reverse remodeling with GDMT (SOLVD, COPERNICUS)",
            clinicalImplication: "Early aggressive GDMT can prevent progressive remodeling"
          },
          clinicalUse: "Predict response to medical therapy, timing of advanced therapies"
        },
        {
          id: "dcm_recovery_probability",
          name: "DCM Recovery Prediction Model",
          isNovel: true,
          latex: "P_{recovery} = \\frac{1}{1 + e^{-(\\beta_0 + \\beta_1 \\times Duration + \\beta_2 \\times EF + \\beta_3 \\times LGE + \\beta_4 \\times Genetics)}}",
          derivation: {
            background: "Some DCM patients recover EF with treatment; predicting this guides device decisions",
            steps: [
              "1. Shorter symptom duration → higher recovery chance",
              "2. Higher baseline EF → better prognosis",
              "3. Absence of LGE (scar) on MRI → favorable",
              "4. TTN mutations → often recover; LMNA → rarely recover",
              "5. Logistic model from registry data (TRED-HF, others)"
            ],
            evidence: "TRED-HF trial, genetic cardiomyopathy registries",
            clinicalImplication: "May delay ICD in likely recoverers; identifies those needing closer monitoring"
          },
          clinicalUse: "Shared decision-making for ICD implantation"
        },
        {
          id: "wall_stress_laplace",
          name: "LV Wall Stress (Law of LaPlace)",
          isNovel: false,
          latex: "\\sigma = \\frac{P \\times r}{2h} \\propto \\frac{Afterload \\times Radius}{Wall\\ Thickness}",
          derivation: {
            background: "Fundamental relationship explaining why dilated hearts fail",
            steps: [
              "1. P = LV pressure (afterload)",
              "2. r = LV radius (dilation increases this)",
              "3. h = wall thickness (often thin in DCM)",
              "4. As heart dilates, wall stress increases exponentially",
              "5. Higher wall stress = more MVO2, more remodeling signal"
            ],
            evidence: "Basic physics applied to cardiac mechanics",
            clinicalImplication: "Explains benefit of reducing afterload (ACEi) and reverse remodeling"
          },
          clinicalUse: "Target for therapy - reduce wall stress"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        heartFailure: [
          { name: "Dyspnea", progression: "Exertional → orthopnea → PND → rest" },
          { name: "Fatigue", mechanism: "Low cardiac output" },
          { name: "Edema", pattern: "Lower extremity, ascites in advanced" },
          { name: "Weight gain", mechanism: "Fluid retention" }
        ],
        arrhythmia: [
          { name: "Palpitations", mechanism: "AF, VT" },
          { name: "Syncope/presyncope", mechanism: "Arrhythmia or low CO" },
          { name: "Sudden death", risk: "Annual SCD 2-3%" }
        ],
        familyHistory: "Important to elicit - genetic forms"
      },
      signs: {
        general: ["Cachexia in advanced HF", "Cool extremities (low output)"],
        cardiovascular: [
          { finding: "Displaced PMI", description: "Laterally and inferiorly (dilated LV)" },
          { finding: "S3 gallop", description: "Volume overload, poor prognosis" },
          { finding: "S4", description: "If in sinus rhythm, stiff ventricle" },
          { finding: "MR murmur", description: "Functional from annular dilation" },
          { finding: "TR murmur", description: "If RV involved" },
          { finding: "Elevated JVP", description: "Right heart failure" }
        ],
        pulmonary: ["Crackles (pulmonary edema)", "Dullness at bases (effusion)"],
        abdomen: ["Hepatomegaly", "Ascites", "Hepatojugular reflux"]
      }
    },
    
    diagnosticCriteria: {
      definition: {
        lved: "LVEDD >2 SD above normal (typically >55mm in men, >50mm in women)",
        ef: "LVEF <45% (or fractional shortening <25%)",
        exclusion: "Not explained by CAD, hypertension, valvular disease"
        }
    },
    
    laboratoryFindings: {
      biomarkers: [
        { test: "BNP", expected: "Elevated, correlates with filling pressures and prognosis" },
        { test: "NT-proBNP", expected: "Elevated, >300 suggests HF, >1000 severe" },
        { test: "Troponin", expected: "May be chronically mildly elevated (myocyte stress)" }
      ],
      etiologyWorkup: [
        { test: "TSH", purpose: "Thyroid dysfunction" },
        { test: "Iron studies", purpose: "Hemochromatosis" },
        { test: "Thiamine level", purpose: "Deficiency (wet beriberi)" },
        { test: "HIV", purpose: "HIV cardiomyopathy" },
        { test: "ANA, anti-dsDNA", purpose: "Lupus myocarditis" },
        { test: "Genetic testing", indication: "Family history, young onset, conduction disease" }
      ]
    },
    
    imagingFindings: {
      echocardiogram: {
        dimensions: {
          lvedd: { abnormal: ">55mm men, >50mm women", indexed: ">32 mm/m²" },
          lvesd: { abnormal: ">40mm" },
          lvef: { abnormal: "<50%", severe: "<30%" }
        },
        morphology: [
          "Globular LV shape (sphericity index approaches 1)",
          "Diffuse (not regional) hypokinesis",
          "Functional MR (central jet, tethering)",
          "LA dilation (chronic elevated LVEDP)",
          "RV dilation and dysfunction (biventricular)"
        ],
        diastolicFunction: "Usually impaired (restrictive pattern in severe)",
        gls: "Reduced (<-18%), diffusely impaired"
      },
      cardiacMRI: {
        indication: "Etiology, viability, fibrosis assessment",
        findings: {
          function: "Quantifies EF, volumes accurately",
          lge: {
            midwall: "Typical of idiopathic/genetic DCM (non-ischemic pattern)",
            subendocardial: "Suggests prior MI (ischemic)",
            absence: "Better prognosis, more likely to recover"
          },
          edema: "T2 mapping - active myocarditis",
          t1Mapping: "Diffuse fibrosis (elevated native T1, ECV)"
        },
        prognostic: "LGE >5% LV mass associated with arrhythmia risk"
      },
      coronaryEvaluation: {
        purpose: "Exclude ischemic etiology",
        modality: ["Coronary angiography", "CCTA (if low pretest probability)"]
      }
    },
    
    geneticTesting: {
      indication: ["Family history of DCM/SCD", "Young onset (<50)", "Conduction disease + DCM"],
      highYieldGenes: {
        ttn: { frequency: "20-25%", phenotype: "DCM, may recover with therapy" },
        lmna: { frequency: "5-10%", phenotype: "DCM + conduction disease, high arrhythmia risk, rarely recovers" },
        myh7: { frequency: "3-5%", phenotype: "Also causes HCM" },
        scn5a: { frequency: "2-3%", phenotype: "DCM + arrhythmia" }
      },
      cascadeScreening: "First-degree relatives should have echo, consider genetic testing"
    },
    
    treatment: {
      gdmt: {
        pillars: [
          {
            class: "ARNI or ACEi/ARB",
            agents: ["Sacubitril/valsartan (preferred)", "Lisinopril", "Losartan"],
            target: "Maximum tolerated dose",
            benefit: "Reduces mortality 20%, reverse remodeling"
          },
          {
            class: "Beta-blocker",
            agents: ["Carvedilol", "Metoprolol succinate", "Bisoprolol"],
            target: "Maximum tolerated dose",
            benefit: "Reduces mortality 35%, reverse remodeling"
          },
          {
            class: "MRA",
            agents: ["Spironolactone 25-50mg", "Eplerenone"],
            target: "25-50mg daily",
            benefit: "Reduces mortality 30%"
          },
          {
            class: "SGLT2 inhibitor",
            agents: ["Dapagliflozin", "Empagliflozin"],
            target: "10mg daily",
            benefit: "Reduces HF hospitalization and CV death (even without DM)"
          }
        ],
        initiation: "Start all 4 within 2-4 weeks, uptitrate aggressively"
      },
      diuretics: {
        indication: "Congestion (symptom relief, not mortality)",
        agents: ["Furosemide", "Bumetanide", "Torsemide"],
        goal: "Euvolemia (JVP normal, no edema)"
      },
      deviceTherapy: {
        icd: {
          primaryPrevention: "LVEF ≤35% on GDMT ≥3 months",
          delay: "Wait for potential recovery (especially TTN, myocarditis, new diagnosis)",
          lifevest: "Wearable defibrillator while optimizing GDMT"
        },
        crt: {
          indication: "LVEF ≤35%, LBBB ≥150ms, NYHA II-IV on GDMT",
          benefit: "Reverse remodeling, symptom improvement, mortality reduction"
        }
      },
      advanced: {
        indication: "Refractory despite optimal therapy",
        options: [
          { therapy: "LVAD", indication: "Bridge to transplant or destination" },
          { therapy: "Heart transplant", indication: "Selected patients <70, no contraindications" },
          { therapy: "Palliative care", indication: "Not candidate for advanced therapies" }
        ]
      }
    }
  },

  I42_1: {
    icd10: "I42.1",
    name: "Obstructive Hypertrophic Cardiomyopathy",
    snomedCT: "45227007",
    category: "cardiomyopathy",
    
    definition: "Genetic cardiomyopathy with LV wall thickness ≥15mm (or ≥13mm with family history) not explained by loading conditions",
    
    genetics: {
      inheritance: "Autosomal dominant (50% of offspring)",
      genes: {
        mybpc3: { frequency: "40%", phenotype: "Later onset, often milder" },
        myh7: { frequency: "35%", phenotype: "Earlier onset, more hypertrophy" },
        tnnt2: { frequency: "5%", phenotype: "Less hypertrophy but high arrhythmia risk" },
        tnni3: { frequency: "5%", phenotype: "Variable" }
      },
      penetrance: "Age-dependent, variable expressivity"
    },
    
    pathophysiology: {
      mechanism: "Sarcomere protein mutation → myocyte disarray → hypertrophy → fibrosis",
      obstruction: {
        mechanism: "Septal hypertrophy + SAM of mitral valve → LVOT obstruction",
        sam: "Systolic anterior motion of mitral leaflet drawn into LVOT by Venturi effect",
        gradient: "Dynamic - worsens with decreased preload, increased contractility"
      },
      
      novelEquations: [
        {
          id: "lvot_gradient_dynamics",
          name: "Dynamic LVOT Gradient Model",
          isNovel: true,
          latex: "LVOT_{gradient} = 4 \\times V_{LVOT}^2 = k \\times \\frac{CO^2}{A_{LVOT}^2} \\propto \\frac{Contractility}{Preload \\times Afterload}",
          derivation: {
            background: "LVOT gradient in HCM is dynamic, changing with hemodynamic conditions",
            steps: [
              "1. Simplified Bernoulli: ΔP = 4V²",
              "2. LVOT velocity increases when effective orifice decreases (SAM)",
              "3. Decreased preload → smaller LV cavity → more SAM → higher gradient",
              "4. Decreased afterload → faster ejection → more SAM → higher gradient",
              "5. Increased contractility → same mechanism",
              "6. Valsalva, standing, vasodilators INCREASE gradient"
            ],
            evidence: "Hemodynamic studies, provocation testing",
            clinicalImplication: "Avoid dehydration, vasodilators; use beta-blockers"
          },
          clinicalUse: "Understand provocation maneuvers, medication effects"
        },
        {
          id: "hcm_scd_risk",
          name: "HCM Risk-SCD Calculator",
          isNovel: true,
          latex: "P_{SCD,5yr} = 1 - 0.998^{e^{(\\beta X)}}",
          where: "X = Age, LVmax, LAsize, gradient, FH, NSVT, syncope",
          derivation: {
            background: "ESC HCM Risk-SCD model predicts 5-year sudden death risk",
            steps: [
              "1. Age: Younger = higher risk",
              "2. Maximal wall thickness: >30mm = high risk",
              "3. LA size: Correlates with atrial arrhythmia",
              "4. LVOT gradient: Obstruction increases risk",
              "5. Family history of SCD: Strong predictor",
              "6. NSVT on Holter: Arrhythmia substrate",
              "7. Unexplained syncope: May be arrhythmic"
            ],
            evidence: "ESC HCM Risk-SCD validation studies",
            clinicalImplication: ">6% = high risk, consider ICD; 4-6% = discuss; <4% = low"
          },
          clinicalUse: "ICD decision-making"
        },
        {
          id: "mavacamten_mechanism",
          name: "Mavacamten Cardiac Myosin Inhibition",
          isNovel: true,
          latex: "Force_{contract} = k \\times [Myosin_{active}] \\times [Actin_{bound}] \\times (1 - \\frac{[Mavacamten]}{IC_{50}})",
          derivation: {
            background: "Mavacamten reduces myosin ATPase activity, decreasing hypercontractility",
            steps: [
              "1. HCM sarcomere mutations cause hypercontractility",
              "2. Mavacamten stabilizes myosin in super-relaxed state",
              "3. Reduces number of active cross-bridges",
              "4. Decreases LVOT gradient by reducing contractility",
              "5. Also reduces MVO2 and may reduce fibrosis"
            ],
            evidence: "EXPLORER-HCM, VALOR-HCM trials",
            clinicalImplication: "First disease-modifying therapy for HCM"
          },
          clinicalUse: "Novel mechanism addressing underlying pathophysiology"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        exertional: [
          { name: "Dyspnea", mechanism: "Diastolic dysfunction, elevated LVEDP, MR" },
          { name: "Chest pain", mechanism: "Ischemia (supply-demand mismatch), microvascular disease" },
          { name: "Fatigue", mechanism: "Low CO (obstruction), arrhythmia" }
        ],
        syncope: {
          mechanism: ["LVOT obstruction with exertion", "Arrhythmia (VT/VF)", "Reflex-mediated"],
          redFlag: "Exertional syncope = high risk"
        },
        palpitations: ["AF (25%)", "NSVT", "PVCs"],
        suddenDeath: "May be first manifestation (especially young athletes)"
      },
      signs: {
        pulse: [
          { finding: "Bifid (bisferiens) pulse", mechanism: "Rapid early ejection then obstruction" },
          { finding: "Brisk upstroke", mechanism: "Hyperdynamic" }
        ],
        jvp: [
          { finding: "Prominent a wave", mechanism: "RV compliance reduced (septal bulge)" }
        ],
        palpation: [
          { finding: "Sustained apical impulse", mechanism: "LVH" },
          { finding: "Double or triple apical impulse", mechanism: "Palpable S4, then systolic impulse" },
          { finding: "Systolic thrill at LSB", mechanism: "LVOT obstruction" }
        ],
        auscultation: {
          murmur: {
            character: "Harsh, crescendo-decrescendo systolic",
            location: "Left sternal border to apex",
            radiation: "Does NOT radiate to carotids (vs AS)",
            dynamicManeuvers: {
              increaseGradient: ["Valsalva (strain phase)", "Standing", "Post-PVC"],
              decreaseGradient: ["Squatting", "Handgrip", "Passive leg raise"]
            }
          },
          mrMurmur: "Often coexistent from SAM-related MR",
          s4: "Common (stiff LV)"
        }
      }
    },
    
    diagnosticCriteria: {
      wallThickness: "≥15mm (any segment) not explained by loading",
      withFamilyHistory: "≥13mm with affected first-degree relative",
      genetics: "Pathogenic sarcomere mutation (even if subclinical)"
    },
    
    laboratoryFindings: {
      biomarkers: [
        { test: "BNP/NT-proBNP", significance: "Elevated, correlates with diastolic dysfunction and symptoms" },
        { test: "Troponin", significance: "May be mildly elevated (microvascular ischemia, myocyte death)" }
      ],
      genetic: {
        indication: "All patients with clinical HCM, cascade screening of relatives",
        yield: "~60% have identifiable sarcomere mutation"
      }
    },
    
    imagingFindings: {
      echocardiogram: {
        morphology: [
          { finding: "Asymmetric septal hypertrophy", description: "Septum/posterior wall ratio >1.3" },
          { finding: "Maximal wall thickness", measure: "Any segment", risk: ">30mm = high SCD risk" },
          { finding: "SAM", description: "Systolic anterior motion of mitral valve" },
          { finding: "Mid-cavity obstruction", description: "May occur instead of LVOT obstruction" }
        ],
        obstruction: {
          lvotGradient: {
            atRest: { significant: "≥30 mmHg" },
            provoked: { significant: "≥50 mmHg with Valsalva or exercise" },
            indication: "Gradient ≥50 mmHg with symptoms = consider septal reduction"
          }
        },
        mitralRegurgitation: "Common (SAM-related), posteriorly directed jet",
        diastolicFunction: "Impaired (often grade II or III)",
        laSize: "Often dilated (chronic elevated LA pressure)"
      },
      cardiacMRI: {
        indication: "All HCM patients at diagnosis, risk stratification",
        findings: {
          lge: {
            pattern: "RV insertion points, mid-wall septal",
            extent: ">15% LV mass = higher SCD risk",
            absence: "Favorable prognosis"
          },
          apicalHCM: "Better visualized on MRI than echo",
          wallThickness: "May show more extensive disease than echo"
        }
      }
    },
    
    riskStratification: {
      escModel: {
        variables: ["Age", "Max wall thickness", "LA size", "Max LVOT gradient", "Family history SCD", "NSVT", "Unexplained syncope"],
        highrisk: ">6% 5-year risk",
        intermediate: "4-6%",
        lowRisk: "<4%"
      },
      additionalFactors: {
        highRisk: ["LGE ≥15%", "LVEF <50%", "Apical aneurysm", "Sustained VT"]
      }
    },
    
    treatment: {
      lifestyle: {
        exercise: "Avoid competitive sports (AHA/ACC recommendation)",
        hydration: "Maintain adequate preload",
        avoid: ["Dehydration", "Extreme heat", "Stimulants"]
      },
      medical: {
        betaBlockers: {
          indication: "First-line for symptoms",
          agents: ["Metoprolol", "Propranolol", "Nadolol"],
          mechanism: "Decrease HR, contractility, gradient"
        },
        nonDhpCcb: {
          indication: "If beta-blocker intolerant",
          agents: ["Verapamil", "Diltiazem"],
          caution: "Avoid in severe obstruction (vasodilation → worse)"
        },
        disopyramide: {
          indication: "Add to beta-blocker if refractory obstruction",
          mechanism: "Negative inotrope",
          monitoring: "QT prolongation, anticholinergic effects"
        },
        mavacamten: {
          indication: "NYHA II-III with obstruction ≥50mmHg, symptomatic despite BB",
          mechanism: "Cardiac myosin inhibitor",
          efficacy: "Reduces gradient ~50%, improves symptoms",
          monitoring: "LVEF (hold if <50%)"
        }
      },
      septalReduction: {
        indication: "Gradient ≥50 mmHg + NYHA III-IV despite optimal medical therapy",
        options: {
          myectomy: {
            description: "Surgical resection of septal muscle",
            success: ">90% gradient reduction",
            mortality: "<1% at experienced centers",
            preferred: "Younger patients, concomitant MV disease"
          },
          alcoholAblation: {
            description: "Ethanol injection into septal perforator → localized infarction",
            success: "70-80% gradient reduction",
            complications: ["Complete heart block (10-20%)", "VSD (rare)"],
            preferred: "Older, high surgical risk, isolated septal hypertrophy"
          }
        }
      },
      icdImplantation: {
        primaryPrevention: "ESC Risk-SCD ≥6%, or individual risk factors with shared decision",
        secondaryPrevention: "Prior cardiac arrest, sustained VT",
        controversy: "Extensive LGE, apical aneurysm, LVEF <50% - may warrant ICD despite lower calculated risk"
      },
      afManagement: {
        anticoagulation: "All HCM + AF should be anticoagulated (regardless of CHA2DS2-VASc)",
        rhythmControl: "Consider early - AF poorly tolerated"
      }
    }
  },

  // ============================================================================
  // I47-I49: ARRHYTHMIAS
  // ============================================================================
  
  I48_0: {
    icd10: "I48.0",
    name: "Paroxysmal Atrial Fibrillation",
    snomedCT: "282825002",
    category: "arrhythmia",
    
    definition: "AF episodes that terminate spontaneously or with intervention within 7 days",
    
    epidemiology: {
      prevalence: "1-2% overall, 10% >75 years",
      lifetime_risk: "25% after age 40",
      progression: "5-15% per year from paroxysmal to persistent"
    },
    
    pathophysiology: {
      triggers: {
        pulmonaryVeins: "80-90% of triggers arise from PV ostia",
        others: ["SVC", "Coronary sinus", "LA posterior wall"]
      },
      substrate: "Atrial fibrosis, electrical remodeling, autonomic influences",
      
      novelEquations: [
        {
          id: "af_wavelength_model",
          name: "AF Wavelength and Sustainability",
          isNovel: true,
          latex: "\\lambda = CV \\times ERP \\quad ; \\quad AF_{sustained} \\Leftrightarrow \\lambda < LA_{dimension}",
          derivation: {
            background: "AF requires multiple re-entrant wavelets; smaller wavelength allows more wavelets",
            steps: [
              "1. Wavelength (λ) = conduction velocity × refractory period",
              "2. More wavelets can fit if LA is large and/or wavelength is short",
              "3. In AF: ERP shortens (electrical remodeling) → λ decreases",
              "4. LA dilation provides more substrate",
              "5. Critical mass hypothesis: need minimum number of wavelets to sustain"
            ],
            evidence: "Mapping studies, computational models of AF",
            clinicalImplication: "Explains why AF begets AF (remodeling) and why LA size predicts recurrence"
          },
          clinicalUse: "Predict likelihood of maintaining sinus rhythm"
        },
        {
          id: "rate_control_target",
          name: "AF Rate Control Physiology",
          isNovel: true,
          latex: "CO_{AF} = SV_{AF} \\times HR = k \\times EDV \\times (1 - e^{-t_{diastole}/\\tau_{fill}}) \\times HR",
          derivation: {
            background: "Irregular R-R intervals in AF reduce cardiac output efficiency",
            steps: [
              "1. Variable diastolic filling time → variable SV",
              "2. Very short R-R: Inadequate filling → low SV for that beat",
              "3. Post-extrasystolic potentiation partially compensates",
              "4. Overall CO reduced 15-25% in AF vs sinus",
              "5. Optimal rate allows adequate filling without excessive total HR"
            ],
            evidence: "Hemodynamic studies comparing AF vs sinus rhythm",
            clinicalImplication: "Explains symptom improvement with rate/rhythm control"
          },
          clinicalUse: "Understanding heart rate control importance"
        },
        {
          id: "stroke_risk_af",
          name: "Stroke Risk in AF Mechanistic Model",
          isNovel: true,
          latex: "Risk_{stroke} \\propto Stasis_{LA} \\times Endothelial_{dysfunction} \\times Hypercoagulability",
          virchowTriad: "All three elements of Virchow's triad present in AF",
          derivation: {
            background: "AF causes LA stasis → thrombus (usually LAA) → embolization",
            steps: [
              "1. Loss of atrial contraction → blood stasis in LA/LAA",
              "2. Flow velocity in LAA correlates with thrombus risk",
              "3. AF causes endothelial dysfunction and inflammation",
              "4. Hypercoagulable state (elevated vWF, fibrinogen)",
              "5. Thrombus typically forms in LAA → embolizes to brain"
            ],
            evidence: "TEE studies, stroke biomarker research",
            clinicalImplication: "Anticoagulation addresses coagulability; LAA closure addresses stasis"
          },
          clinicalUse: "Rationale for anticoagulation and LAA closure"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        common: [
          { name: "Palpitations", frequency: "Most common", character: "Irregular, rapid" },
          { name: "Dyspnea", mechanism: "Reduced CO, increased filling pressure" },
          { name: "Fatigue", mechanism: "Chronically reduced CO" },
          { name: "Exercise intolerance", mechanism: "Cannot increase CO appropriately" }
        ],
        less_common: [
          { name: "Chest discomfort", mechanism: "Rapid rate, demand ischemia" },
          { name: "Dizziness/lightheadedness", mechanism: "Reduced CO" },
          { name: "Syncope", mechanism: "Pause upon AF termination, rapid ventricular response" }
        ],
        asymptomatic: "30% detected incidentally or via device"
      },
      signs: {
        pulse: ["Irregularly irregular", "Pulse deficit (radial < apical)"],
        jvp: ["Absent a wave", "Irregular cannon waves if AV dissociation"]
      }
    },
    
    diagnosticCriteria: {
      ecg: {
        findings: [
          "Absence of P waves",
          "Fibrillatory (f) waves - variable morphology and rate",
          "Irregularly irregular R-R intervals",
          "Variable ventricular rate (usually 100-180 if untreated)"
        ]
      },
      duration: {
        paroxysmal: "<7 days, self-terminating",
        persistent: ">7 days or requires cardioversion",
        longStandingPersistent: ">1 year",
        permanent: "Accepted, no further rhythm control attempts"
      }
    },
    
    laboratoryFindings: {
      initial: [
        { test: "TSH", purpose: "Rule out hyperthyroidism" },
        { test: "BMP", purpose: "Electrolytes, renal function (drug dosing)" },
        { test: "CBC", purpose: "Baseline, anemia evaluation" },
        { test: "BNP", significance: "Elevated in AF (atrial stretch), prognostic" }
      ],
      coagulation: [
        { test: "PT/INR", indication: "If on warfarin" },
        { test: "CrCl", purpose: "DOAC dosing" }
      ]
    },
    
    imagingFindings: {
      echocardiogram: {
        purpose: "Structural heart disease, LA size, LV function",
        findings: [
          { parameter: "LA size", significance: "LA diameter >45mm or LAVi >34 mL/m² predicts recurrence" },
          { parameter: "LV function", significance: "May have tachycardia-mediated CMP" },
          { parameter: "Valvular disease", significance: "MS, MR contribute to AF" }
        ]
      },
      tee: {
        indication: "Before cardioversion if AF >48h without anticoagulation",
        findings: {
          laThrombus: "Usually in LAA",
          laaVelocity: "<20 cm/s = high thrombus risk",
          sec: "Spontaneous echo contrast = stasis"
        }
      }
    },
    
    riskStratification: {
      strokeRisk: {
        cha2ds2vasc: {
          variables: [
            { factor: "CHF/LV dysfunction", points: 1 },
            { factor: "Hypertension", points: 1 },
            { factor: "Age ≥75", points: 2 },
            { factor: "Diabetes", points: 1 },
            { factor: "Stroke/TIA/thromboembolism", points: 2 },
            { factor: "Vascular disease (MI, PAD, aortic plaque)", points: 1 },
            { factor: "Age 65-74", points: 1 },
            { factor: "Sex category (female)", points: 1 }
          ],
          interpretation: {
            score0_male: "Low risk, may not need anticoagulation",
            score1_male: "Consider anticoagulation",
            score2plus: "Anticoagulation recommended"
          }
        }
      },
      bleedingRisk: {
        hasbled: {
          variables: ["Hypertension", "Abnormal renal/liver", "Stroke", "Bleeding", "Labile INR", "Elderly", "Drugs/alcohol"],
          use: "Identifies modifiable risk factors, does NOT contraindicate anticoagulation"
        }
      }
    },
    
    treatment: {
      anticoagulation: {
        indication: "CHA2DS2-VASc ≥2 (men) or ≥3 (women); consider if ≥1 (men) or ≥2 (women)",
        agents: {
          doacs: {
            preferred: "Over warfarin for most (ARISTOTLE, RE-LY, ROCKET-AF)",
            agents: [
              { drug: "Apixaban", dose: "5mg BID (2.5mg if ≥2 of: age≥80, weight≤60kg, Cr≥1.5)" },
              { drug: "Rivaroxaban", dose: "20mg daily with dinner (15mg if CrCl 15-50)" },
              { drug: "Dabigatran", dose: "150mg BID (110mg if >80 or high bleeding risk)" },
              { drug: "Edoxaban", dose: "60mg daily (30mg if CrCl 15-50 or weight ≤60kg)" }
            ]
          },
          warfarin: {
            indication: "Mechanical valve, moderate-severe MS, severe CKD",
            target: "INR 2.0-3.0"
          }
        },
        laaOcclusion: {
          indication: "High stroke risk + contraindication to long-term anticoagulation",
          devices: ["WATCHMAN", "Amulet"],
          evidence: "Non-inferior to warfarin (PROTECT-AF, PREVAIL)"
        }
      },
      rateControl: {
        target: "Resting HR <110 (lenient) or <80 (strict) - RACE II showed lenient non-inferior",
        agents: [
          { drug: "Beta-blockers", examples: ["Metoprolol", "Carvedilol"], firstLine: true },
          { drug: "Non-DHP CCBs", examples: ["Diltiazem", "Verapamil"], note: "Avoid in HFrEF" },
          { drug: "Digoxin", indication: "Adjunct in HF, sedentary patients" },
          { drug: "Amiodarone", indication: "Refractory, also provides rhythm control" }
        ]
      },
      rhythmControl: {
        indication: "Symptomatic despite rate control, patient preference, HFrEF",
        cardioversion: {
          electrical: "Synchronized DC cardioversion (200J biphasic)",
          pharmacological: {
            agents: ["Flecainide", "Propafenone", "Ibutilide", "Amiodarone"],
            pillInPocket: "Flecainide/propafenone for infrequent episodes in selected patients"
          },
          anticoagulation: "3 weeks before and 4 weeks after (minimum) if AF >48h"
        },
        antiarrhythmics: {
          noStructuralHD: ["Flecainide", "Propafenone", "Sotalol", "Dronedarone"],
          withHD: ["Amiodarone (most effective but toxic)", "Dofetilide", "Sotalol (if no HFrEF)"]
        },
        ablation: {
          indication: "Symptomatic, failed or intolerant of ≥1 AAD, or first-line in selected",
          technique: "Pulmonary vein isolation (PVI) ± additional lesions",
          success: "70-80% single procedure, 85-90% with repeat",
          earlyAF: "EAST-AFNET 4 showed early rhythm control (including ablation) improves outcomes"
        }
      }
    }
  },

  // ============================================================================
  // I50: HEART FAILURE
  // ============================================================================
  
  I50_2: {
    icd10: "I50.2",
    name: "Systolic (Congestive) Heart Failure (HFrEF)",
    snomedCT: "84114007",
    category: "heartFailure",
    
    definition: "Clinical syndrome with symptoms/signs of HF + LVEF ≤40%",
    
    classification: {
      byEF: {
        hfref: "EF ≤40%",
        hfmref: "EF 41-49%",
        hfpef: "EF ≥50%",
        hfimpef: "EF improved from ≤40% to >40%"
      },
      byStage: {
        a: "At risk (HTN, DM, CAD) - no symptoms or structural disease",
        b: "Structural disease (prior MI, LVH, valve disease) - no symptoms",
        c: "Structural disease + current or prior symptoms",
        d: "Advanced HF requiring specialized interventions"
      },
      bySymptoms: {
        nyha: {
          I: "No limitation",
          II: "Slight limitation - symptoms with ordinary activity",
          III: "Marked limitation - symptoms with less than ordinary activity",
          IV: "Unable to carry on any activity without symptoms; symptoms at rest"
        }
      }
    },
    
    pathophysiology: {
      mechanisms: "Myocyte loss/dysfunction → decreased contractility → neurohormonal activation → remodeling → progressive failure",
      
      novelEquations: [
        {
          id: "hf_neurohormonal_cascade",
          name: "Neurohormonal Cascade in HF",
          isNovel: true,
          latex: "\\frac{d[AngII]}{dt} = k_{renin} \\times \\frac{K_{renal}}{MAP} - k_{ACE} \\times [ACEi]",
          fullCascade: "CO↓ → Renal perfusion↓ → Renin↑ → AngI → ACE → AngII → Vasoconstriction + Aldosterone + ADH → Na/H2O retention + Remodeling",
          derivation: {
            background: "Decreased CO triggers compensatory neurohormonal response that becomes maladaptive",
            steps: [
              "1. Low CO → decreased renal perfusion → JG apparatus releases renin",
              "2. Renin converts angiotensinogen to Ang I",
              "3. ACE converts Ang I to Ang II",
              "4. Ang II: Vasoconstriction (↑afterload), aldosterone release (Na retention)",
              "5. Aldosterone: Na/H2O retention (↑preload), fibrosis",
              "6. Sympathetic activation: ↑HR, ↑contractility (short-term), but myocyte toxicity (long-term)",
              "7. ACE inhibitors interrupt this cycle"
            ],
            evidence: "CONSENSUS, SOLVD, RALES, EMPHASIS-HF trials",
            clinicalImplication: "GDMT targets these pathways at multiple points"
          },
          clinicalUse: "Rationale for ACEi/ARB, MRA, beta-blockers"
        },
        {
          id: "frank_starling_hf",
          name: "Frank-Starling Curve in Heart Failure",
          isNovel: false,
          latex: "SV = SV_{max} \\times (1 - e^{-k \\times (EDV - EDV_0)}) \\times f_{contractility}",
          derivation: {
            background: "Relationship between preload and stroke volume is depressed and flattened in HF",
            steps: [
              "1. Normal heart: Increasing preload increases SV up to a plateau",
              "2. In HF: Curve is shifted down (lower SV for any preload) and right (operates at higher volumes)",
              "3. Contractility factor (f) <1 in HF",
              "4. At extreme preload: Curve may become descending (decompensation)",
              "5. Diuretics move along curve (reduce congestion); inotropes shift curve up"
            ],
            evidence: "Foundational cardiac physiology",
            clinicalImplication: "Explains benefit of preload reduction and danger of over-diuresis"
          },
          clinicalUse: "Guide diuretic and inotrope therapy"
        },
        {
          id: "cardiac_output_determinants",
          name: "Cardiac Output Determinants",
          isNovel: false,
          latex: "CO = HR \\times SV = HR \\times (EDV - ESV) = HR \\times EDV \\times EF",
          derivation: {
            background: "CO is the product of rate and volume ejected per beat",
            steps: [
              "1. SV = End-diastolic volume - End-systolic volume",
              "2. EF = SV/EDV (fraction ejected)",
              "3. In HFrEF: EF reduced, so EDV must increase to maintain SV (remodeling)",
              "4. HR increases to compensate (sympathetic activation)",
              "5. These compensations have limits and adverse effects"
            ],
            evidence: "Basic cardiac physiology",
            clinicalImplication: "Why HF causes tachycardia and chamber dilation"
          },
          clinicalUse: "Understand compensatory mechanisms"
        },
        {
          id: "cardiorenal_syndrome",
          name: "Cardiorenal Syndrome Hemodynamics",
          isNovel: true,
          latex: "GFR = k_{f} \\times (P_{glom} - P_{bow} - \\pi_{plasma}) \\approx k \\times (MAP - CVP - IAP)",
          derivation: {
            background: "HF reduces GFR through multiple mechanisms beyond just forward flow",
            steps: [
              "1. Traditional view: Low CO → low renal perfusion → low GFR",
              "2. Venous congestion (high CVP) also impairs GFR by increasing renal venous pressure",
              "3. Starling forces in glomerulus: Filtration = k × (Pgc - Pbc - π)",
              "4. High CVP → high renal venous pressure → high Pbc → reduced filtration",
              "5. This explains why decongestion can IMPROVE renal function"
            ],
            evidence: "Venous congestion studies, CardioMEMS data",
            clinicalImplication: "Decongestion may improve GFR despite diuresis"
          },
          clinicalUse: "Guide diuretic strategy in cardiorenal syndrome"
        },
        {
          id: "sglt2_mechanism_hf",
          name: "SGLT2 Inhibitor Mechanism in HF",
          isNovel: true,
          latex: "Benefit = f(Preload_{reduction}) + f(Ketone_{fuel}) + f(Na/H_{exchange}) + f(Inflammation_{reduction})",
          derivation: {
            background: "SGLT2i benefit in HF extends beyond glycemic control through multiple mechanisms",
            steps: [
              "1. Osmotic diuresis + natriuresis → preload reduction (like diuretic)",
              "2. Shifts myocardial fuel from glucose to ketones (more efficient)",
              "3. Inhibits Na/H exchanger → reduces intracellular Na and Ca → improved relaxation",
              "4. Anti-inflammatory effects (reduces IL-6, TNF-α)",
              "5. Reduces epicardial fat",
              "6. Improves endothelial function"
            ],
            evidence: "DAPA-HF, EMPEROR-Reduced (benefits regardless of diabetes)",
            clinicalImplication: "Now pillar of GDMT for all HFrEF (and HFpEF)"
          },
          clinicalUse: "Understanding multi-mechanism benefit"
        }
      ]
    },
    
    clinicalPresentation: {
      symptoms: {
        congestion: [
          { name: "Dyspnea", progression: "Exertional → orthopnea → PND → rest", mechanism: "Elevated PCWP" },
          { name: "Orthopnea", definition: "Dyspnea lying flat", mechanism: "Redistribution of fluid to lungs" },
          { name: "PND", definition: "Awakening 1-2h after sleep with dyspnea", mechanism: "Reabsorption of peripheral edema" },
          { name: "Bendopnea", definition: "Dyspnea bending forward", mechanism: "Very elevated filling pressures" },
          { name: "Edema", pattern: "Lower extremity, sacral if bedbound", mechanism: "Elevated venous pressure, Na retention" },
          { name: "Weight gain", timeframe: "Days to weeks", mechanism: "Fluid retention" }
        ],
        lowOutput: [
          { name: "Fatigue", frequency: "Very common", mechanism: "Reduced perfusion to skeletal muscle" },
          { name: "Exercise intolerance", mechanism: "Cannot augment CO" },
          { name: "Cachexia", definition: "Unintentional weight loss >5%", mechanism: "Advanced HF, inflammatory" }
        ]
      },
      signs: {
        congestion: {
          rightSided: ["Elevated JVP", "Hepatojugular reflux", "Hepatomegaly", "Ascites", "Peripheral edema"],
          leftSided: ["Pulmonary crackles", "S3 gallop", "Displaced PMI"]
        },
        lowOutput: ["Cool extremities", "Narrow pulse pressure", "Altered mental status", "Oliguria"],
        physicalExamProfile: {
          warmAndDry: "Compensated",
          warmAndWet: "Congestion, adequate perfusion - diuretics",
          coldAndWet: "Congestion + low output - inotropes + diuretics",
          coldAndDry: "Low output, may be over-diuresed - fluids and/or inotropes"
        }
      }
    },
    
    diagnosticCriteria: {
      framinghamCriteria: {
        major: ["PND", "JVD", "Crackles", "Cardiomegaly", "Pulmonary edema", "S3", "Hepatojugular reflux"],
        minor: ["Edema", "Night cough", "DOE", "Hepatomegaly", "Pleural effusion", "Tachycardia >120", "Weight loss >4.5kg with treatment"],
        diagnosis: "2 major OR 1 major + 2 minor"
      },
      bnpCutoffs: {
        bnp: { ruleOut: "<100 pg/mL", grayZone: "100-400", ruleIn: ">400" },
        ntProbnp: { ageAdjusted: "<300 rules out, >450 (<50y), >900 (50-75y), >1800 (>75y) rules in" }
      }
    },
    
    laboratoryFindings: {
      biomarkers: [
        { test: "BNP", significance: "Diagnosis (>100), prognosis, response to therapy" },
        { test: "NT-proBNP", significance: "Same as BNP, longer half-life" },
        { test: "Troponin", significance: "May be chronically mildly elevated, prognostic" }
      ],
      renal: [
        { test: "Creatinine/eGFR", significance: "Cardiorenal syndrome, drug dosing" },
        { test: "BUN", significance: "BUN:Cr ratio elevated in prerenal (dehydration)" },
        { test: "Electrolytes", significance: "Na, K (diuretic effects, ACEi/ARB/MRA monitoring)" }
      ],
      iron: [
        { test: "Ferritin", significance: "Iron deficiency common (even without anemia)" },
        { test: "TSAT", significance: "<20% = iron deficiency; treat with IV iron" }
      ],
      additional: [
        { test: "TSH", purpose: "Thyroid dysfunction causes/exacerbates HF" },
        { test: "LFTs", significance: "Congestive hepatopathy" },
        { test: "Uric acid", significance: "Elevated in HF, prognostic" }
      ]
    },
    
    imagingFindings: {
      echocardiogram: {
        mandatoryCriteria: [
          { parameter: "LVEF", hfref: "≤40%", hfmref: "41-49%", hfpef: "≥50%" }
        ],
        structure: [
          { parameter: "LV dimensions", significance: "Dilation in HFrEF" },
          { parameter: "LV mass index", significance: "LVH" },
          { parameter: "LA volume index", significance: ">34 mL/m² abnormal, prognostic" },
          { parameter: "RV size/function", significance: "TAPSE <17mm abnormal" }
        ],
        diastolicFunction: [
          { parameter: "E/e' ratio", significance: ">14 elevated PCWP" },
          { parameter: "TR velocity", significance: ">2.8 m/s suggests elevated PASP" }
        ],
        valvular: "Functional MR common"
      },
      chestXray: {
        findings: {
          cardiomegaly: "CTR >0.5",
          congestion: ["Cephalization (upper lobe vessel dilation)", "Kerley B lines", "Pleural effusion", "Alveolar edema (bat-wing pattern)"]
        }
      },
      cardiacMri: {
        indication: "Etiology unclear, viability assessment, infiltrative disease",
        findings: {
          lge: {
            subendocardial: "Ischemic",
            midwall: "Non-ischemic (DCM, myocarditis)",
            diffuse: "Infiltrative"
          }
        }
      }
    },
    
    treatment: {
      gdmt: {
        fourPillars: [
          {
            pillar: "ARNI or ACEi/ARB",
            details: {
              arni: { drug: "Sacubitril/valsartan", dose: "Target 97/103mg BID", evidence: "PARADIGM-HF: 20% mortality reduction vs enalapril" },
              acei: { examples: ["Lisinopril 40mg", "Enalapril 20mg BID"], evidence: "CONSENSUS, SOLVD" },
              arb: { indication: "ACEi intolerant (cough)", examples: ["Losartan", "Valsartan"] }
            }
          },
          {
            pillar: "Beta-blocker",
            drugs: [
              { drug: "Carvedilol", dose: "Target 25mg BID (50mg BID if >85kg)", evidence: "COPERNICUS" },
              { drug: "Metoprolol succinate", dose: "Target 200mg daily", evidence: "MERIT-HF" },
              { drug: "Bisoprolol", dose: "Target 10mg daily", evidence: "CIBIS-II" }
            ],
            benefit: "35% mortality reduction"
          },
          {
            pillar: "MRA",
            drugs: [
              { drug: "Spironolactone", dose: "25-50mg daily", evidence: "RALES: 30% mortality reduction" },
              { drug: "Eplerenone", dose: "25-50mg daily", evidence: "EMPHASIS-HF" }
            ],
            monitoring: "K+, creatinine"
          },
          {
            pillar: "SGLT2 inhibitor",
            drugs: [
              { drug: "Dapagliflozin", dose: "10mg daily", evidence: "DAPA-HF" },
              { drug: "Empagliflozin", dose: "10mg daily", evidence: "EMPEROR-Reduced" }
            ],
            benefit: "26% reduction in CV death/HF hospitalization (regardless of DM)"
          }
        ],
        initiation: "Start all 4 within weeks of diagnosis, uptitrate to target doses"
      },
      diuretics: {
        indication: "Congestion (symptom relief)",
        loopDiuretics: {
          agents: ["Furosemide", "Bumetanide", "Torsemide"],
          dosing: "Titrate to euvolemia",
          resistance: "Double dose, add thiazide, continuous infusion"
        }
      },
      additional: {
        hydralazineNitrate: { indication: "African Americans (A-HeFT), or ACEi/ARB intolerant" },
        ivabradine: { indication: "Sinus rhythm, HR ≥70 despite max BB, EF ≤35%", evidence: "SHIFT" },
        vericiguat: { indication: "Recent HF hospitalization or IV diuretic, on GDMT", evidence: "VICTORIA" },
        digoxin: { indication: "Persistent symptoms, rate control in AF", note: "Symptom improvement, no mortality benefit" }
      },
      deviceTherapy: {
        icd: {
          primaryPrevention: "EF ≤35% on ≥3 months GDMT (NYHA II-III) OR EF ≤30% (NYHA I)",
          secondaryPrevention: "Cardiac arrest survivor, sustained VT"
        },
        crt: {
          crtD: "EF ≤35%, LBBB ≥150ms, NYHA II-IV (Class I)",
          crtP: "Consider if pacing needed anyway",
          benefit: "Reverse remodeling, symptom improvement, mortality reduction"
        }
      },
      advanced: {
        indication: "Stage D despite optimal therapy",
        options: {
          lvad: {
            btd: "Bridge to transplant",
            dt: "Destination therapy if not transplant candidate"
          },
          transplant: {
            indication: "Refractory HF, no contraindications, age typically <70",
            survival: "1-year 90%, 5-year 70%"
          },
          palliative: "Focus on symptom management, quality of life"
        }
      }
    }
  }
};

// Export all novel equations for UI styling
export const NOVEL_EQUATIONS_PART3 = [
  // DCM
  { id: "lv_remodeling_dynamics", disease: "I42_0", category: "remodeling", complexity: "advanced" },
  { id: "dcm_recovery_probability", disease: "I42_0", category: "prognosis", complexity: "advanced" },
  { id: "wall_stress_laplace", disease: "I42_0", category: "hemodynamics", complexity: "basic" },
  
  // HCM
  { id: "lvot_gradient_dynamics", disease: "I42_1", category: "hemodynamics", complexity: "intermediate" },
  { id: "hcm_scd_risk", disease: "I42_1", category: "risk", complexity: "advanced" },
  { id: "mavacamten_mechanism", disease: "I42_1", category: "pharmacology", complexity: "advanced" },
  
  // AF
  { id: "af_wavelength_model", disease: "I48_0", category: "electrophysiology", complexity: "intermediate" },
  { id: "rate_control_target", disease: "I48_0", category: "hemodynamics", complexity: "intermediate" },
  { id: "stroke_risk_af", disease: "I48_0", category: "pathophysiology", complexity: "intermediate" },
  
  // HF
  { id: "hf_neurohormonal_cascade", disease: "I50_2", category: "pathophysiology", complexity: "advanced" },
  { id: "frank_starling_hf", disease: "I50_2", category: "hemodynamics", complexity: "basic" },
  { id: "cardiac_output_determinants", disease: "I50_2", category: "hemodynamics", complexity: "basic" },
  { id: "cardiorenal_syndrome", disease: "I50_2", category: "pathophysiology", complexity: "advanced" },
  { id: "sglt2_mechanism_hf", disease: "I50_2", category: "pharmacology", complexity: "advanced" }
];

export default CARDIAC_DISEASES_PART3;
