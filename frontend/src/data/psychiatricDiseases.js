// ============================================================
// PSYCHIATRIC/MENTAL HEALTH DISEASES DATABASE
// Comprehensive mental and behavioral disorders
// ICD-10: F00-F99 (Mental and behavioral disorders)
// ============================================================

export const PSYCHIATRIC_DISEASES = {
  // =====================
  // MAJOR DEPRESSIVE DISORDER
  // ICD-10: F32.9
  // =====================

  F32_9: {
    name: "Major Depressive Disorder",
    icd10: "F32.9",
    snomedCT: "370143000",
    category: "psychiatric",
    definition: "Mood disorder characterized by persistent depressed mood and/or anhedonia with functional impairment",
    primaryOrgan: "brain",
    affectedOrgans: ["brain", "heart", "endocrine"],
    
    pathophysiology: {
      mechanism: "Monoamine deficiency (serotonin, norepinephrine, dopamine) + neuroplasticity changes + HPA axis dysregulation",
      molecularBasis: "Reduced 5-HT/NE signaling; elevated cortisol; decreased BDNF; prefrontal-limbic dysfunction",
      neuroanatomy: "Hippocampal volume reduction; PFC hypoactivity; amygdala hyperactivity",
      equations: {
        hamiltonScore: {
          name: "HAM-D Score Interpretation",
          latex: "HAM-D: \\text{Normal: } 0-7, \\text{ Mild: } 8-13, \\text{ Moderate: } 14-18, \\text{ Severe: } 19-22, \\text{ Very Severe: } \\geq 23",
          description: "Hamilton Depression Rating Scale (17-item)"
        },
        phq9: {
          name: "PHQ-9 Severity",
          latex: "PHQ-9: \\text{Minimal: } 0-4, \\text{ Mild: } 5-9, \\text{ Moderate: } 10-14, \\text{ Mod-Severe: } 15-19, \\text{ Severe: } 20-27",
          description: "Patient Health Questionnaire-9"
        }
      }
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Depressed mood", frequency: "90%", description: "Most of day, nearly every day" },
        { name: "Anhedonia", frequency: "85%", description: "Loss of interest/pleasure" },
        { name: "Sleep disturbance", frequency: "80%", description: "Insomnia or hypersomnia" },
        { name: "Fatigue", frequency: "75%", description: "Loss of energy" },
        { name: "Appetite changes", frequency: "70%", description: "Decreased or increased" },
        { name: "Psychomotor changes", frequency: "50%", description: "Agitation or retardation" },
        { name: "Guilt/worthlessness", frequency: "60%", description: "Excessive, inappropriate" },
        { name: "Concentration difficulty", frequency: "70%", description: "Indecisiveness" },
        { name: "Suicidal ideation", frequency: "40-60%", description: "Thoughts of death, suicide" }
      ],
      signs: [
        { name: "Psychomotor retardation", description: "Slowed movements, speech" },
        { name: "Flat affect", description: "Reduced emotional expression" },
        { name: "Poor eye contact", description: "Avoidance" },
        { name: "Tearfulness", description: "Spontaneous crying" },
        { name: "Disheveled appearance", description: "Self-neglect" }
      ]
    },
    
    diagnosticCriteria: {
      name: "DSM-5 Criteria",
      requirements: {
        core: "≥5 symptoms for ≥2 weeks, including depressed mood OR anhedonia",
        symptoms: ["Depressed mood", "Anhedonia", "Weight/appetite change", "Sleep disturbance", "Psychomotor change", "Fatigue", "Worthlessness/guilt", "Concentration difficulty", "Suicidal ideation"],
        functional: "Clinically significant distress or impairment",
        exclusions: "Not due to substance or medical condition"
      }
    },
    
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Rule out hypothyroidism" },
      { name: "CBC", normalRange: "Normal", abnormalInDisease: "Rule out anemia" },
      { name: "Vitamin B12", normalRange: "200-900 pg/mL", abnormalInDisease: "Rule out deficiency" },
      { name: "Cortisol", normalRange: "5-25 μg/dL (AM)", abnormalInDisease: "May be elevated (HPA axis dysregulation)" },
      { name: "BDNF", normalRange: "Variable", abnormalInDisease: "Reduced in some studies" }
    ],
    
    imagingFindings: {
      mri: ["Hippocampal volume reduction", "White matter hyperintensities (late-life depression)"],
      fmri: ["Prefrontal hypoactivity", "Amygdala hyperactivity", "Altered default mode network"],
      pet: ["Reduced 5-HT1A binding", "Decreased prefrontal metabolism"]
    },
    
    severity: {
      mild: { description: "PHQ-9 5-9, minimal functional impairment" },
      moderate: { description: "PHQ-9 10-14, some difficulty in functioning" },
      severe: { description: "PHQ-9 ≥15, marked functional impairment, psychotic features possible" }
    },
    
    modifications: {
      brain: {
        structure: {
          hippocampal_volume: { factor: 0.85, note: "Volume reduction" },
          prefrontal_activity: { factor: 0.7, note: "Hypoactivity" },
          amygdala_activity: { factor: 1.4, note: "Hyperactivity" }
        },
        physiology: {
          serotonin: { factor: 0.6, note: "5-HT deficiency" },
          norepinephrine: { factor: 0.7, note: "NE deficiency" },
          bdnf: { factor: 0.7, note: "Reduced neurotrophin" }
        }
      },
      endocrine: {
        physiology: {
          cortisol: { factor: 1.5, note: "HPA axis dysregulation" },
          crh: { factor: 1.4, note: "Elevated CRH" }
        }
      },
      heart: {
        physiology: {
          hrv: { factor: 0.7, note: "Reduced heart rate variability" }
        }
      }
    },
    
    differentialDiagnosis: ["Bipolar disorder", "Adjustment disorder", "Persistent depressive disorder", "Hypothyroidism", "Substance-induced", "Grief"],
    
    treatment: {
      firstLine: [
        { name: "SSRIs", examples: "Sertraline, Escitalopram, Fluoxetine", indication: "First-line pharmacotherapy", evidence: "IA" },
        { name: "SNRIs", examples: "Venlafaxine, Duloxetine", indication: "Alternative first-line", evidence: "IA" }
      ],
      psychotherapy: [
        { name: "CBT", indication: "First-line, alone or with medication", evidence: "IA" },
        { name: "IPT (Interpersonal Therapy)", indication: "Alternative", evidence: "IA" },
        { name: "Behavioral Activation", indication: "Component of treatment", evidence: "IA" }
      ],
      augmentation: [
        { name: "Atypical antipsychotics", examples: "Aripiprazole, Quetiapine", indication: "Partial response", evidence: "IA" },
        { name: "Lithium", indication: "Augmentation", evidence: "IB" },
        { name: "Thyroid hormone (T3)", indication: "Augmentation strategy", evidence: "IB" }
      ],
      severe: [
        { name: "ECT", indication: "Treatment-resistant, severe, catatonia, psychotic features", evidence: "IA" },
        { name: "TMS", indication: "Treatment-resistant", evidence: "IA" },
        { name: "Ketamine/Esketamine", indication: "Treatment-resistant, acute suicidality", evidence: "IA" }
      ]
    },
    riskStratification: {
      suicide: "15% lifetime suicide attempt; 60% have suicidal ideation",
      recurrence: "50% recurrence after first episode; 80% after third",
      chronicity: "20% become chronic; early treatment improves outcomes"
    },
    
    complications: ["Suicide", "Substance abuse", "Cardiovascular disease", "Diabetes", "Functional impairment"],
    
    screeningTools: ["PHQ-9", "HAM-D", "BDI-II", "MADRS"]
  },

  // =====================
  // GENERALIZED ANXIETY DISORDER
  // ICD-10: F41.1
  // =====================

  F41_1: {
    name: "Generalized Anxiety Disorder",
    icd10: "F41.1",
    snomedCT: "21897009",
    category: "psychiatric",
    definition: "Excessive, persistent worry about various domains with associated physical symptoms",
    primaryOrgan: "brain",
    affectedOrgans: ["brain", "heart", "gi_tract", "muscles"],
    
    pathophysiology: {
      mechanism: "Amygdala hyperactivation + prefrontal regulation deficits + dysregulated worry circuitry",
      molecularBasis: "GABA deficiency; excessive NE; 5-HT dysregulation; HPA axis activation",
      neuroanatomy: "Amygdala hyperresponsivity; reduced ventromedial PFC-amygdala connectivity"
    },
    
    clinicalPresentation: {
      symptoms: [
        { name: "Excessive worry", frequency: "100%", description: "Multiple domains, difficult to control" },
        { name: "Restlessness", frequency: "75%", description: "Feeling keyed up or on edge" },
        { name: "Fatigue", frequency: "70%", description: "Easily fatigued" },
        { name: "Concentration difficulty", frequency: "80%", description: "Mind going blank" },
        { name: "Irritability", frequency: "65%", description: "Increased irritability" },
        { name: "Muscle tension", frequency: "85%", description: "Chronic tension" },
        { name: "Sleep disturbance", frequency: "75%", description: "Difficulty falling/staying asleep" }
      ],
      signs: [
        { name: "Autonomic arousal", description: "Tachycardia, sweating, tremor" },
        { name: "Muscle tension", description: "Especially neck, shoulders" },
        { name: "Hypervigilance", description: "Easily startled" },
        { name: "Restless behavior", description: "Fidgeting, pacing" }
      ]
    },
    
    diagnosticCriteria: {
      name: "DSM-5 Criteria",
      requirements: {
        core: "Excessive anxiety and worry occurring more days than not for ≥6 months",
        control: "Difficulty controlling the worry",
        symptoms: "≥3 of: restlessness, fatigue, concentration difficulty, irritability, muscle tension, sleep disturbance",
        functional: "Clinically significant distress or impairment"
      }
    },
    
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Rule out hyperthyroidism" },
      { name: "Cortisol", normalRange: "5-25 μg/dL (AM)", abnormalInDisease: "May be elevated" },
      { name: "Urine drug screen", normalRange: "Negative", abnormalInDisease: "Rule out substances" }
    ],
    
    screeningTools: {
      gad7: {
        name: "GAD-7",
        scoring: "Minimal: 0-4, Mild: 5-9, Moderate: 10-14, Severe: ≥15",
        cutoff: "≥10 for clinical anxiety"
      }
    },
    
    severity: {
      mild: { description: "GAD-7 5-9, minimal impairment" },
      moderate: { description: "GAD-7 10-14, some functional difficulty" },
      severe: { description: "GAD-7 ≥15, significant impairment, panic features" }
    },
    
    modifications: {
      brain: {
        structure: {
          amygdala_activity: { factor: 1.6, note: "Hyperactivation" },
          prefrontal_connectivity: { factor: 0.7, note: "Reduced regulation" }
        },
        physiology: {
          gaba: { factor: 0.7, note: "GABA deficiency" },
          norepinephrine: { factor: 1.3, note: "Elevated NE" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.15, note: "Resting tachycardia" },
          hrv: { factor: 0.8, note: "Reduced variability" }
        }
      },
      gi_tract: {
        physiology: {
          motility: { factor: 1.3, note: "IBS-like symptoms" }
        }
      },
      muscles: {
        physiology: {
          muscle_tension: { factor: 1.5, note: "Chronic tension" }
        }
      }
    },
    
    differentialDiagnosis: ["Panic disorder", "Social anxiety", "OCD", "PTSD", "Hyperthyroidism", "Caffeine/stimulant use"],
    
    treatment: {
      firstLine: [
        { name: "SSRIs", examples: "Sertraline, Escitalopram, Paroxetine", indication: "First-line", evidence: "IA" },
        { name: "SNRIs", examples: "Venlafaxine, Duloxetine", indication: "Alternative first-line", evidence: "IA" },
        { name: "Buspirone", indication: "Alternative, no dependence risk", evidence: "IA" }
      ],
      psychotherapy: [
        { name: "CBT", indication: "First-line, alone or combined", evidence: "IA" },
        { name: "Applied Relaxation", indication: "Alternative", evidence: "IA" }
      ],
      adjunctive: [
        { name: "Pregabalin", indication: "Alternative or adjunct", evidence: "IA" },
        { name: "Benzodiazepines", indication: "Short-term only (2-4 weeks)", evidence: "IB", note: "Dependence risk" }
      ]
    },
    riskStratification: {
      chronicity: "Chronic course common; 50% achieve remission",
      comorbidity: "Depression comorbid in 60%; substance use common",
      functional: "Significant occupational/social impairment"
    },
    
    comorbidities: ["Depression (60%)", "Other anxiety disorders", "Substance use", "Chronic pain"]
  },

  // =====================
  // BIPOLAR I DISORDER
  // ICD-10: F31.9
  // =====================

  F31_9: {
    name: "Bipolar I Disorder",
    icd10: "F31.9",
    snomedCT: "371596008",
    category: "psychiatric",
    definition: "Mood disorder with at least one manic episode, often with depressive episodes",
    primaryOrgan: "brain",
    affectedOrgans: ["brain", "endocrine"],
    
    pathophysiology: {
      mechanism: "Circadian rhythm dysregulation + mitochondrial dysfunction + intracellular signaling abnormalities",
      molecularBasis: "Na/K-ATPase abnormalities; calcium signaling; BDNF changes; dopamine/glutamate dysregulation",
      genetics: "Highly heritable (80-90%), polygenic"
    },
    
    clinicalPresentation: {
      maniaSymptoms: [
        { name: "Elevated/expansive/irritable mood", frequency: "100%", description: "Core feature, ≥1 week" },
        { name: "Decreased need for sleep", frequency: "90%", description: "Feels rested after 3 hours" },
        { name: "Grandiosity", frequency: "75%", description: "Inflated self-esteem" },
        { name: "Pressured speech", frequency: "85%", description: "Rapid, loud, difficult to interrupt" },
        { name: "Racing thoughts", frequency: "80%", description: "Flight of ideas" },
        { name: "Distractibility", frequency: "70%", description: "Attention easily diverted" },
        { name: "Increased goal-directed activity", frequency: "85%", description: "Or psychomotor agitation" },
        { name: "Risky behavior", frequency: "60%", description: "Spending, sexual indiscretion, investments" }
      ],
      signs: [
        { name: "Psychomotor activation", description: "Increased energy, activity" },
        { name: "Decreased sleep without fatigue", description: "Hallmark sign" },
        { name: "Pressured speech", description: "Rapid, difficult to interrupt" },
        { name: "Disinhibition", description: "Inappropriate behavior" }
      ]
    },
    
    diagnosticCriteria: {
      name: "DSM-5 Criteria - Manic Episode",
      requirements: {
        mood: "Abnormally elevated, expansive, or irritable mood AND increased energy/activity for ≥1 week",
        symptoms: "≥3 symptoms (4 if irritable): decreased sleep, grandiosity, pressured speech, racing thoughts, distractibility, increased activity, risky behavior",
        severity: "Marked impairment, hospitalization, or psychotic features",
        exclusions: "Not due to substance or medical condition"
      }
    },
    
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Rule out thyroid disorder" },
      { name: "Urine drug screen", normalRange: "Negative", abnormalInDisease: "Rule out substances" },
      { name: "Lithium level", normalRange: "0.6-1.2 mEq/L (therapeutic)", abnormalInDisease: "Monitor if on lithium" },
      { name: "Valproate level", normalRange: "50-100 μg/mL", abnormalInDisease: "Monitor if on valproate" }
    ],
    
    imagingFindings: {
      mri: ["Enlarged lateral ventricles", "White matter hyperintensities", "Reduced prefrontal gray matter"],
      fmri: ["Limbic overactivity in mania", "Prefrontal underactivity"]
    },
    
    severity: {
      mild: { description: "Meets criteria, minimal functional impairment" },
      moderate: { description: "Moderate increase in activity/impairment in judgment" },
      severe: { description: "Continuous supervision required, psychotic features" }
    },
    
    modifications: {
      brain: {
        structure: {
          ventricular_volume: { factor: 1.2, note: "Enlarged ventricles" },
          prefrontal_volume: { factor: 0.9, note: "Reduced gray matter" }
        },
        physiology: {
          dopamine: { factor: 1.5, note: "Elevated in mania" },
          circadian_rhythm: { factor: 0.5, note: "Disrupted" }
        }
      },
      endocrine: {
        physiology: {
          cortisol: { factor: 1.3, note: "HPA dysregulation" }
        }
      }
    },
    
    differentialDiagnosis: ["Schizoaffective disorder", "Substance-induced", "Hyperthyroidism", "ADHD", "Personality disorders"],
    
    treatment: {
      acuteMania: [
        { name: "Lithium", indication: "First-line mood stabilizer", evidence: "IA", note: "Narrow therapeutic index" },
        { name: "Valproate", indication: "First-line alternative", evidence: "IA" },
        { name: "Atypical antipsychotics", examples: "Quetiapine, Olanzapine, Risperidone, Aripiprazole", indication: "First-line", evidence: "IA" }
      ],
      acuteDepression: [
        { name: "Quetiapine", indication: "First-line for bipolar depression", evidence: "IA" },
        { name: "Lurasidone", indication: "First-line", evidence: "IA" },
        { name: "Lamotrigine", indication: "Maintenance and mild depression", evidence: "IA" },
        { name: "Antidepressant + mood stabilizer", indication: "If monotherapy fails", evidence: "IB", note: "Switch risk" }
      ],
      maintenance: [
        { name: "Lithium", indication: "Best evidence for suicide prevention", evidence: "IA" },
        { name: "Valproate", indication: "Alternative", evidence: "IA" },
        { name: "Lamotrigine", indication: "Depression predominant", evidence: "IA" },
        { name: "Atypical antipsychotics", indication: "Adjunct or monotherapy", evidence: "IA" }
      ],
      psychotherapy: [
        { name: "Psychoeducation", indication: "All patients", evidence: "IA" },
        { name: "CBT for Bipolar", indication: "Adjunct", evidence: "IA" }
      ]
    },
    riskStratification: {
      suicide: "15-20% attempt; 10% complete suicide",
      recurrence: ">90% have recurrent episodes",
      rapidCycling: "≥4 episodes/year; harder to treat"
    },
    
    complications: ["Suicide (15-20% attempt)", "Substance abuse", "Relationship/occupational impairment", "Cardiovascular risk"]
  },

  // =====================
  // SCHIZOPHRENIA
  // ICD-10: F20.9
  // =====================

  F20_9: {
    name: "Schizophrenia",
    icd10: "F20.9",
    snomedCT: "58214004",
    category: "psychiatric",
    definition: "Chronic psychotic disorder with delusions, hallucinations, disorganized thinking, and negative symptoms",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    
    pathophysiology: {
      mechanism: "Dopamine hyperactivity (mesolimbic) + hypoactivity (mesocortical) + glutamate dysfunction + neurodevelopmental abnormalities",
      molecularBasis: "D2 receptor overactivity; NMDA hypofunction; GABA interneuron deficits",
      neuroanatomy: "Enlarged ventricles; reduced hippocampal and prefrontal volume; disrupted connectivity",
      genetics: "Polygenic (DISC1, NRG1, COMT), environmental factors"
    },
    
    clinicalPresentation: {
      positiveSymptoms: [
        { name: "Delusions", frequency: "80%", description: "Persecutory, referential, grandiose" },
        { name: "Hallucinations", frequency: "70%", description: "Auditory most common (voices)" },
        { name: "Disorganized speech", frequency: "50%", description: "Loose associations, tangentiality" },
        { name: "Disorganized behavior", frequency: "40%", description: "Unpredictable, catatonia" }
      ],
      negativeSymptoms: [
        { name: "Alogia", frequency: "50%", description: "Poverty of speech" },
        { name: "Avolition", frequency: "60%", description: "Lack of motivation" },
        { name: "Anhedonia", frequency: "55%", description: "Inability to experience pleasure" },
        { name: "Flat affect", frequency: "65%", description: "Diminished emotional expression" },
        { name: "Asociality", frequency: "50%", description: "Social withdrawal" }
      ],
      cognitiveSymptoms: [
        { name: "Attention deficits", frequency: "70%", description: "Difficulty concentrating" },
        { name: "Working memory impairment", frequency: "75%", description: "Poor short-term memory" },
        { name: "Executive dysfunction", frequency: "70%", description: "Planning, problem-solving" }
      ]
    },
    
    diagnosticCriteria: {
      name: "DSM-5 Criteria",
      requirements: {
        symptoms: "≥2 of: delusions, hallucinations, disorganized speech, disorganized/catatonic behavior, negative symptoms (at least one must be delusions, hallucinations, or disorganized speech)",
        duration: "≥6 months with ≥1 month of active symptoms",
        functional: "Marked decline in functioning",
        exclusions: "Rule out schizoaffective, mood disorders, substances, medical conditions"
      }
    },
    
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Rule out thyroid disorder" },
      { name: "Urine drug screen", normalRange: "Negative", abnormalInDisease: "Rule out substance-induced" },
      { name: "HIV", normalRange: "Negative", abnormalInDisease: "Rule out HIV encephalopathy" },
      { name: "Syphilis serology", normalRange: "Negative", abnormalInDisease: "Rule out neurosyphilis" },
      { name: "Prolactin", normalRange: "<20 ng/mL", abnormalInDisease: "Elevated with antipsychotics" }
    ],
    
    imagingFindings: {
      mri: ["Enlarged lateral and third ventricles", "Reduced hippocampal volume", "Reduced prefrontal gray matter", "Reduced total brain volume"],
      fmri: ["Reduced prefrontal activation", "Abnormal default mode network"],
      pet: ["Increased striatal D2 receptor availability"]
    },
    
    severity: {
      mild: { description: "Symptoms present but not severe, reasonable functioning" },
      moderate: { description: "Moderate symptoms, impaired functioning" },
      severe: { description: "Severe symptoms, marked functional impairment, may require hospitalization" }
    },
    
    modifications: {
      brain: {
        structure: {
          ventricular_volume: { factor: 1.4, note: "Enlarged ventricles" },
          hippocampal_volume: { factor: 0.85, note: "Reduced volume" },
          prefrontal_volume: { factor: 0.9, note: "Gray matter reduction" },
          total_brain_volume: { factor: 0.97, note: "Global reduction" }
        },
        physiology: {
          dopamine_mesolimbic: { factor: 1.5, note: "Hyperactivity (positive symptoms)" },
          dopamine_mesocortical: { factor: 0.7, note: "Hypoactivity (negative/cognitive)" },
          glutamate: { factor: 0.8, note: "NMDA hypofunction" }
        }
      }
    },
    
    differentialDiagnosis: ["Brief psychotic disorder", "Schizoaffective", "Delusional disorder", "Substance-induced psychosis", "Bipolar with psychosis", "Medical conditions"],
    
    treatment: {
      acutePhase: [
        { name: "Second-generation antipsychotics", examples: "Risperidone, Olanzapine, Quetiapine, Aripiprazole", indication: "First-line", evidence: "IA" },
        { name: "First-generation antipsychotics", examples: "Haloperidol", indication: "Alternative, acute agitation", evidence: "IA" },
        { name: "Hospitalization", indication: "Danger to self/others, severe impairment", evidence: "IA" }
      ],
      maintenance: [
        { name: "Antipsychotic continuation", indication: "At least 1-2 years after first episode", evidence: "IA" },
        { name: "Long-acting injectables", examples: "Paliperidone palmitate, Aripiprazole LAI", indication: "Adherence issues", evidence: "IA" }
      ],
      treatmentResistant: [
        { name: "Clozapine", indication: "Failed 2+ antipsychotics (treatment-resistant)", evidence: "IA", note: "REMS program, monitor ANC" }
      ],
      psychosocial: [
        { name: "Cognitive Remediation", indication: "Cognitive symptoms", evidence: "IA" },
        { name: "Social Skills Training", indication: "All patients", evidence: "IA" },
        { name: "Supported Employment", indication: "Functional recovery", evidence: "IA" },
        { name: "Family Psychoeducation", indication: "All patients with family", evidence: "IA" }
      ]
    },
    riskStratification: {
      suicide: "5-10% complete suicide; 20-40% attempt",
      mortality: "20 years reduced life expectancy",
      metabolicRisk: "High with antipsychotics; monitor weight, glucose, lipids"
    },
    
    prognosis: {
      rule_of_thirds: "1/3 good outcome, 1/3 intermediate, 1/3 chronic severe course",
      poor_prognostic_factors: ["Early onset", "Poor premorbid functioning", "Prominent negative symptoms", "No precipitant", "Family history"]
    }
  },

  // =====================
  // PTSD
  // ICD-10: F43.1
  // =====================

  F43_1: {
    name: "Post-Traumatic Stress Disorder",
    icd10: "F43.1",
    snomedCT: "47505003",
    category: "psychiatric",
    definition: "Trauma-related disorder with intrusions, avoidance, negative alterations in cognition/mood, and hyperarousal",
    primaryOrgan: "brain",
    affectedOrgans: ["brain", "heart", "endocrine"],
    
    pathophysiology: {
      mechanism: "Fear conditioning + failure of extinction + HPA axis dysregulation + amygdala hyperactivation",
      molecularBasis: "Elevated NE; low cortisol paradox; reduced hippocampal volume; amygdala sensitization",
      neuroanatomy: "Amygdala hyperactivation; vmPFC hypoactivation; hippocampal atrophy"
    },
    
    clinicalPresentation: {
      intrusions: [
        { name: "Intrusive memories", frequency: "80%", description: "Recurrent, involuntary, distressing" },
        { name: "Nightmares", frequency: "50-70%", description: "Trauma-related dreams" },
        { name: "Flashbacks", frequency: "40%", description: "Dissociative reactions" },
        { name: "Psychological distress to cues", frequency: "85%", description: "Triggers cause distress" },
        { name: "Physiological reactions to cues", frequency: "75%", description: "Physical stress response" }
      ],
      avoidance: [
        { name: "Avoidance of memories/thoughts", frequency: "80%", description: "Internal avoidance" },
        { name: "Avoidance of external reminders", frequency: "85%", description: "Places, people, activities" }
      ],
      negativeAlterations: [
        { name: "Inability to remember trauma aspects", frequency: "30%", description: "Dissociative amnesia" },
        { name: "Negative beliefs", frequency: "70%", description: "Self, others, world" },
        { name: "Distorted blame", frequency: "50%", description: "Self or others" },
        { name: "Persistent negative emotions", frequency: "75%", description: "Fear, guilt, shame, anger" },
        { name: "Diminished interest", frequency: "60%", description: "Activities" },
        { name: "Detachment", frequency: "55%", description: "From others" },
        { name: "Inability to experience positive emotions", frequency: "50%", description: "Emotional numbing" }
      ],
      hyperarousal: [
        { name: "Irritability/anger", frequency: "70%", description: "Outbursts" },
        { name: "Reckless behavior", frequency: "30%", description: "Self-destructive" },
        { name: "Hypervigilance", frequency: "80%", description: "Scanning for threat" },
        { name: "Exaggerated startle", frequency: "75%", description: "Startle response" },
        { name: "Concentration problems", frequency: "65%", description: "Difficulty focusing" },
        { name: "Sleep disturbance", frequency: "70%", description: "Insomnia" }
      ]
    },
    
    diagnosticCriteria: {
      name: "DSM-5 Criteria",
      requirements: {
        traumaExposure: "Exposure to actual or threatened death, serious injury, or sexual violence",
        intrusions: "≥1 intrusion symptom",
        avoidance: "≥1 avoidance symptom",
        negativeAlterations: "≥2 negative cognition/mood alterations",
        hyperarousal: "≥2 arousal/reactivity alterations",
        duration: ">1 month",
        functional: "Clinically significant distress or impairment"
      }
    },
    
    laboratoryFindings: [
      { name: "Cortisol", normalRange: "5-25 μg/dL (AM)", abnormalInDisease: "May be low (unlike other stress disorders)" },
      { name: "Norepinephrine", normalRange: "Variable", abnormalInDisease: "Elevated" },
      { name: "ACTH", normalRange: "10-60 pg/mL", abnormalInDisease: "May be altered" }
    ],
    
    imagingFindings: {
      mri: ["Reduced hippocampal volume", "Reduced prefrontal volume"],
      fmri: ["Amygdala hyperactivation to threat", "vmPFC hypoactivation", "Altered connectivity"]
    },
    
    screeningTools: {
      pcl5: {
        name: "PCL-5",
        cutoff: "≥31-33 suggests PTSD",
        range: "0-80"
      }
    },
    
    severity: {
      mild: { description: "Meets criteria, manageable symptoms" },
      moderate: { description: "Significant symptoms, functional impairment" },
      severe: { description: "Severe symptoms, marked impairment, dissociation" }
    },
    
    modifications: {
      brain: {
        structure: {
          hippocampal_volume: { factor: 0.85, note: "Atrophy" },
          amygdala_activity: { factor: 1.8, note: "Hyperactivation" },
          prefrontal_activity: { factor: 0.7, note: "Hypoactivation" }
        },
        physiology: {
          norepinephrine: { factor: 1.5, note: "Elevated NE" },
          cortisol: { factor: 0.8, note: "Low cortisol paradox" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.1, note: "Elevated resting HR" },
          hrv: { factor: 0.7, note: "Reduced variability" }
        }
      },
      endocrine: {
        physiology: {
          hpa_axis: { factor: 0.8, note: "Suppressed response" }
        }
      }
    },
    
    differentialDiagnosis: ["Acute stress disorder", "Adjustment disorder", "Depression", "Anxiety disorders", "TBI", "Substance use"],
    
    comorbidities: ["Depression (50%)", "Substance use (40%)", "Anxiety disorders", "Chronic pain", "Suicidality"]
  },

  // =====================
  // ADHD
  // ICD-10: F90.9
  // =====================

  F90_9: {
    name: "Attention-Deficit/Hyperactivity Disorder",
    icd10: "F90.9",
    snomedCT: "406506008",
    category: "psychiatric",
    definition: "Neurodevelopmental disorder with persistent inattention, hyperactivity, and/or impulsivity",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    
    pathophysiology: {
      mechanism: "Prefrontal-striatal dysfunction + dopamine/norepinephrine deficiency + delayed cortical maturation",
      molecularBasis: "DAT1, DRD4 gene variants; reduced DA/NE signaling in PFC; executive function deficits",
      neuroanatomy: "Reduced prefrontal, striatal, cerebellar volumes; delayed cortical maturation"
    },
    
    clinicalPresentation: {
      inattention: [
        { name: "Careless mistakes", description: "Fails to give close attention to details" },
        { name: "Difficulty sustaining attention", description: "Tasks, play, lectures" },
        { name: "Not listening", description: "Mind seems elsewhere" },
        { name: "Fails to finish tasks", description: "Starts but doesn't complete" },
        { name: "Difficulty organizing", description: "Tasks, activities, belongings" },
        { name: "Avoids sustained mental effort", description: "Homework, reports" },
        { name: "Loses things", description: "Keys, paperwork, glasses" },
        { name: "Easily distracted", description: "By extraneous stimuli" },
        { name: "Forgetful", description: "In daily activities" }
      ],
      hyperactivityImpulsivity: [
        { name: "Fidgets", description: "Squirms, taps hands/feet" },
        { name: "Leaves seat", description: "When expected to remain seated" },
        { name: "Runs/climbs inappropriately", description: "Restlessness in adults" },
        { name: "Unable to play quietly", description: "Loud, boisterous" },
        { name: "On the go", description: "Driven by a motor" },
        { name: "Talks excessively", description: "Nonstop talking" },
        { name: "Blurts out answers", description: "Before question completed" },
        { name: "Difficulty waiting turn", description: "Impatient" },
        { name: "Interrupts/intrudes", description: "On conversations, activities" }
      ]
    },
    
    diagnosticCriteria: {
      name: "DSM-5 Criteria",
      requirements: {
        symptoms: "≥6 inattention AND/OR ≥6 hyperactivity-impulsivity symptoms (≥5 for adults)",
        duration: "Present for ≥6 months",
        onset: "Several symptoms present before age 12",
        pervasiveness: "Present in ≥2 settings",
        functional: "Interferes with functioning",
        presentations: ["Combined", "Predominantly Inattentive", "Predominantly Hyperactive-Impulsive"]
      }
    },
    
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Rule out thyroid disorder" },
      { name: "Lead level", normalRange: "<5 μg/dL", abnormalInDisease: "Rule out lead toxicity" },
      { name: "Ferritin", normalRange: ">20 ng/mL", abnormalInDisease: "Low iron may worsen ADHD" }
    ],
    
    imagingFindings: {
      mri: ["Reduced total brain volume (3-5%)", "Reduced prefrontal volume", "Reduced basal ganglia volume", "Reduced cerebellar volume"],
      fmri: ["Reduced prefrontal activation", "Altered striatal activation"]
    },
    
    severity: {
      mild: { description: "Few symptoms beyond diagnosis, minor impairment" },
      moderate: { description: "Symptoms between mild and severe" },
      severe: { description: "Many symptoms, marked impairment in multiple settings" }
    },
    
    modifications: {
      brain: {
        structure: {
          prefrontal_volume: { factor: 0.92, note: "Reduced volume" },
          basal_ganglia_volume: { factor: 0.95, note: "Reduced volume" },
          total_brain_volume: { factor: 0.97, note: "Slightly reduced" }
        },
        physiology: {
          dopamine: { factor: 0.75, note: "Hypodopaminergia in PFC" },
          norepinephrine: { factor: 0.8, note: "NE deficiency" },
          prefrontal_activity: { factor: 0.7, note: "Hypoactivation" }
        }
      }
    },
    
    differentialDiagnosis: ["Anxiety", "Depression", "Learning disorders", "Autism spectrum", "Oppositional defiant disorder", "Sleep disorders"],
    
    comorbidities: ["Learning disorders (30-50%)", "Oppositional defiant disorder (50%)", "Conduct disorder", "Anxiety (25%)", "Depression", "Substance use"]
  },

  // =====================
  // OCD
  // ICD-10: F42.9
  // =====================

  F42_9: {
    name: "Obsessive-Compulsive Disorder",
    icd10: "F42.9",
    snomedCT: "191736004",
    category: "psychiatric",
    definition: "Disorder characterized by recurrent obsessions and/or compulsions that are time-consuming and cause distress",
    primaryOrgan: "brain",
    affectedOrgans: ["brain", "skin"],
    
    pathophysiology: {
      mechanism: "Cortico-striato-thalamo-cortical (CSTC) circuit hyperactivity + serotonin dysregulation",
      molecularBasis: "5-HT hypofunction; glutamate hyperactivity; orbitofrontal-striatal hyperconnectivity",
      neuroanatomy: "OFC hyperactivity; caudate hyperactivity; ACC abnormalities"
    },
    
    clinicalPresentation: {
      obsessions: [
        { name: "Contamination fears", frequency: "50%", description: "Fear of germs, dirt, bodily fluids" },
        { name: "Harm obsessions", frequency: "30%", description: "Fear of harming self/others" },
        { name: "Symmetry/exactness", frequency: "30%", description: "Need for order" },
        { name: "Forbidden thoughts", frequency: "25%", description: "Sexual, religious, aggressive" },
        { name: "Doubt", frequency: "40%", description: "Did I lock the door?" }
      ],
      compulsions: [
        { name: "Washing/cleaning", frequency: "50%", description: "Hand washing, showering" },
        { name: "Checking", frequency: "60%", description: "Locks, stove, appliances" },
        { name: "Ordering/arranging", frequency: "30%", description: "Symmetry, alignment" },
        { name: "Counting", frequency: "20%", description: "Mental counting rituals" },
        { name: "Repeating", frequency: "35%", description: "Actions, words, prayers" },
        { name: "Mental rituals", frequency: "30%", description: "Mental reviewing, praying" }
      ]
    },
    
    diagnosticCriteria: {
      name: "DSM-5 Criteria",
      requirements: {
        obsessions: "Recurrent, persistent thoughts causing anxiety; attempts to suppress/neutralize",
        compulsions: "Repetitive behaviors or mental acts performed to reduce anxiety",
        timeConsuming: ">1 hour/day OR significant distress/impairment",
        insight: "Specify: good/fair, poor, or absent insight"
      }
    },
    
    screeningTools: {
      ybocs: {
        name: "Yale-Brown Obsessive-Compulsive Scale",
        scoring: "Subclinical: 0-7, Mild: 8-15, Moderate: 16-23, Severe: 24-31, Extreme: 32-40"
      }
    },
    
    severity: {
      mild: { description: "Y-BOCS 8-15, 1-3 hours/day" },
      moderate: { description: "Y-BOCS 16-23, 3-8 hours/day" },
      severe: { description: "Y-BOCS ≥24, >8 hours/day or near-constant" }
    },
    
    modifications: {
      brain: {
        structure: {
          ofc_activity: { factor: 1.6, note: "Hyperactivation" },
          caudate_activity: { factor: 1.5, note: "Hyperactivation" },
          acc_activity: { factor: 1.4, note: "Hyperactivation" }
        },
        physiology: {
          serotonin: { factor: 0.7, note: "5-HT dysfunction" },
          glutamate: { factor: 1.3, note: "Hyperactivity" }
        }
      },
      skin: {
        structure: {
          damage: { factor: 2.0, note: "From excessive washing (dermatitis)" }
        }
      }
    },
    
    differentialDiagnosis: ["OC-related disorders (BDD, hoarding)", "Anxiety disorders", "Tic disorders", "Autism spectrum", "Psychotic disorders"],
    
    comorbidities: ["Depression (67%)", "Anxiety disorders (76%)", "Tic disorders", "ADHD", "Eating disorders"]
  }
};

export default PSYCHIATRIC_DISEASES;
