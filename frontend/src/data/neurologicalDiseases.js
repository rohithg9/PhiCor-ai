// ============================================================
// NEUROLOGICAL DISEASES DATABASE
// Comprehensive ICD-10 coverage for nervous system diseases
// ICD-10: G00-G99 (Diseases of the nervous system)
// ============================================================

export const NEUROLOGICAL_DISEASES = {
  // =====================
  // CEREBROVASCULAR DISEASES
  // ICD-10: I60-I69 (Also coded under circulatory)
  // =====================

  I63_9: {
    name: "Cerebral Infarction (Ischemic Stroke)",
    icd10: "I63.9",
    category: "neurological",
    definition: "Acute neurological deficit due to cerebral ischemia from arterial occlusion",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Arterial occlusion (thrombotic, embolic) → ischemic penumbra → neuronal death if not reperfused",
      molecularBasis: "Excitotoxicity (glutamate), calcium influx, free radical damage, apoptosis cascade"
    },
    clinicalPresentation: {
      symptoms: [
        "Sudden onset weakness (hemiparesis)",
        "Speech difficulty (aphasia, dysarthria)",
        "Vision changes (hemianopia, diplopia)",
        "Sudden severe headache",
        "Confusion, altered consciousness",
        "Facial droop"
      ],
      signs: [
        "Unilateral weakness or paralysis",
        "Facial asymmetry",
        "Abnormal speech",
        "Visual field deficits",
        "Ataxia",
        "NIHSS score assessment"
      ]
    },
    laboratoryFindings: [
      { name: "Glucose", normalRange: "70-100 mg/dL", abnormalInDisease: "Check immediately (rule out hypoglycemia mimic)" },
      { name: "Coagulation studies", normalRange: "Normal", abnormalInDisease: "Needed before thrombolysis" },
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "May indicate cardiac source" },
      { name: "Lipid panel", normalRange: "Variable", abnormalInDisease: "Risk factor assessment" }
    ],
    imagingFindings: {
      ctHead: ["Rule out hemorrhage (first-line)", "Early ischemic changes (loss of gray-white differentiation)", "Hyperdense MCA sign"],
      mri: ["DWI shows acute infarct within minutes", "ADC map confirmation", "PWI for penumbra"],
      ctAngiography: ["Large vessel occlusion for thrombectomy"]
    },
    severity: {
      mild: { description: "NIHSS 1-4, minor deficits" },
      moderate: { description: "NIHSS 5-15, significant but not severe" },
      severe: { description: "NIHSS 16-42, major stroke, high morbidity" }
    },
    modifications: {
      brain: {
        geometry: {
          brain_volume: { factor: 0.97, note: "Cytotoxic edema then infarct volume loss" },
          gray_matter: { factor: 0.95, note: "Gray matter loss in affected territory" }
        },
        pressures: {
          icp: { factor: 1.3, note: "Elevated from cerebral edema" },
          cpp: { factor: 0.85, note: "Reduced perfusion pressure" }
        },
        physiology: {
          cbf: { factor: 0.4, note: "Severely reduced in ischemic core (<10 mL/100g/min)" },
          cmro2: { factor: 0.5, note: "Reduced oxygen consumption" },
          glucose_consumption: { factor: 0.4, note: "Reduced glucose metabolism" }
        },
        structure: {
          neuron_density: { factor: 0.7, note: "Neuronal loss in infarct zone" }
        }
      },
      heart: {
        physiology: {
          blood_pressure: { factor: 1.2, note: "Permissive hypertension initially" },
          heart_rate: { factor: 1.1, note: "May have arrhythmias" }
        }
      }
    }
  },

  I61_9: {
    name: "Intracerebral Hemorrhage",
    icd10: "I61.9",
    category: "neurological",
    definition: "Spontaneous bleeding into brain parenchyma",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Vessel rupture (hypertensive, amyloid, AVM) → hematoma expansion → mass effect → elevated ICP",
      molecularBasis: "Lipohyalinosis of small vessels (hypertension), amyloid angiopathy (elderly), secondary injury cascade"
    },
    clinicalPresentation: {
      symptoms: [
        "Sudden severe headache",
        "Rapid onset focal deficits",
        "Nausea and vomiting",
        "Decreased consciousness",
        "Seizures (10-15%)"
      ],
      signs: [
        "Hypertension (often severe)",
        "Focal neurological deficits",
        "Signs of elevated ICP (Cushing's triad)",
        "Pupillary abnormalities"
      ]
    },
    laboratoryFindings: [
      { name: "Coagulation studies", normalRange: "Normal", abnormalInDisease: "Prolonged if on anticoagulation" },
      { name: "Platelet count", normalRange: "150-400 ×10⁹/L", abnormalInDisease: "Check for thrombocytopenia" },
      { name: "INR", normalRange: "0.9-1.1", abnormalInDisease: "Elevated if on warfarin (reverse urgently)" }
    ],
    imagingFindings: {
      ctHead: ["Hyperdense lesion (acute blood)", "Location (basal ganglia = HTN, lobar = amyloid)", "Hematoma volume", "Midline shift, hydrocephalus"],
      ctAngiography: ["Spot sign (active bleeding)", "Underlying lesion (AVM, tumor)"],
      mri: ["Gradient echo for microbleeds (amyloid pattern)"]
    },
    severity: {
      mild: { description: "Small hematoma, alert, minimal deficits" },
      moderate: { description: "Moderate volume, significant deficits" },
      severe: { description: "Large volume (>30cc), decreased consciousness, high ICH score" }
    },
    modifications: {
      brain: {
        geometry: {
          brain_volume: { factor: 1.02, note: "Hematoma adds volume, mass effect" },
          ventricle_volume: { factor: 0.8, note: "Compressed ventricles" }
        },
        pressures: {
          icp: { factor: 2.0, note: "Severely elevated from hematoma" },
          cpp: { factor: 0.7, note: "Critically reduced" }
        },
        physiology: {
          cbf: { factor: 0.6, note: "Reduced globally from elevated ICP" },
          cmro2: { factor: 0.7, note: "Reduced metabolism" }
        },
        structure: {
          neuron_density: { factor: 0.6, note: "Neuronal destruction in hematoma zone" }
        }
      },
      heart: {
        physiology: {
          blood_pressure: { factor: 1.4, note: "Severe hypertension often causative" },
          heart_rate: { factor: 0.9, note: "Bradycardia (Cushing response)" }
        }
      }
    }
  },

  I60_9: {
    name: "Subarachnoid Hemorrhage",
    icd10: "I60.9",
    category: "neurological",
    definition: "Bleeding into the subarachnoid space, most commonly from ruptured aneurysm",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Aneurysm rupture → blood in subarachnoid space → meningeal irritation, vasospasm, hydrocephalus",
      molecularBasis: "Berry aneurysm formation (hemodynamic stress), vasospasm mediated by oxyhemoglobin breakdown products"
    },
    clinicalPresentation: {
      symptoms: [
        "Thunderclap headache ('worst headache of life')",
        "Sudden onset, maximal at onset",
        "Neck stiffness",
        "Photophobia",
        "Nausea and vomiting",
        "Loss of consciousness (30%)"
      ],
      signs: [
        "Meningismus",
        "Decreased level of consciousness",
        "Focal neurological deficits",
        "Subhyaloid hemorrhages (fundoscopy)",
        "CN III palsy (posterior communicating aneurysm)"
      ]
    },
    laboratoryFindings: [
      { name: "Lumbar puncture", normalRange: "Clear CSF", abnormalInDisease: "Xanthochromia, elevated RBCs (if CT negative)" },
      { name: "Troponin", normalRange: "<0.04 ng/mL", abnormalInDisease: "May be elevated (neurogenic stunned myocardium)" }
    ],
    imagingFindings: {
      ctHead: ["Hyperdense blood in sulci/cisterns (sensitivity >95% in first 6h)", "Fisher grade"],
      ctAngiography: ["Aneurysm identification (location, size, morphology)"],
      digitalSubtractionAngiography: ["Gold standard for aneurysm characterization"]
    },
    severity: {
      mild: { description: "Hunt-Hess Grade 1-2, alert, minimal symptoms" },
      moderate: { description: "Hunt-Hess Grade 3, confused, mild deficits" },
      severe: { description: "Hunt-Hess Grade 4-5, stuporous/comatose" }
    },
    modifications: {
      brain: {
        geometry: {
          csf_volume: { factor: 1.3, note: "Blood in CSF spaces" },
          ventricle_volume: { factor: 1.2, note: "May develop hydrocephalus" }
        },
        pressures: {
          icp: { factor: 1.8, note: "Elevated from blood in subarachnoid space" },
          cpp: { factor: 0.75, note: "Reduced perfusion" },
          csf_pressure: { factor: 2.0, note: "Markedly elevated" }
        },
        physiology: {
          cbf: { factor: 0.6, note: "Reduced from vasospasm (day 4-14)" },
          cmro2: { factor: 0.75, note: "Reduced metabolism" }
        },
        structure: {
          capillary_density: { factor: 0.8, note: "Vasospasm reduces effective perfusion" }
        }
      },
      heart: {
        physiology: {
          blood_pressure: { factor: 1.15, note: "May be elevated" },
          heart_rate: { factor: 1.1, note: "Tachycardia, may have arrhythmias" }
        }
      }
    }
  },

  // =====================
  // SEIZURE DISORDERS
  // ICD-10: G40 Series
  // =====================

  G40_9: {
    name: "Epilepsy, Unspecified",
    icd10: "G40.9",
    category: "neurological",
    definition: "Chronic neurological disorder characterized by recurrent unprovoked seizures",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Abnormal excessive synchronous neuronal activity → seizure manifestation depending on affected brain region",
      molecularBasis: "Ion channel dysfunction, neurotransmitter imbalance (GABA/glutamate), synaptic reorganization"
    },
    clinicalPresentation: {
      symptoms: [
        "Recurrent seizures",
        "Post-ictal confusion",
        "Aura (focal onset)",
        "Memory gaps",
        "Incontinence during seizure",
        "Tongue biting"
      ],
      signs: [
        "Witnessed seizure activity",
        "Post-ictal state",
        "Automatisms (focal seizures)",
        "Todd's paralysis (transient)"
      ]
    },
    laboratoryFindings: [
      { name: "Prolactin", normalRange: "2-18 ng/mL", abnormalInDisease: "Elevated 10-20 min post-seizure (generalized > partial)" },
      { name: "Electrolytes", normalRange: "Normal", abnormalInDisease: "Rule out metabolic cause" },
      { name: "Glucose", normalRange: "70-100 mg/dL", abnormalInDisease: "Rule out hypoglycemia" },
      { name: "Antiepileptic drug levels", normalRange: "Therapeutic range", abnormalInDisease: "Subtherapeutic = breakthrough seizure" }
    ],
    imagingFindings: {
      mri: ["Gold standard for structural lesions", "Mesial temporal sclerosis (TLE)", "Cortical dysplasia", "Tumors, vascular malformations"],
      eeg: ["Interictal epileptiform discharges", "Ictal recordings", "Localization for surgery"],
      petScan: ["Hypometabolism in epileptogenic zone (interictal)"]
    },
    severity: {
      mild: { description: "Well-controlled on single medication" },
      moderate: { description: "Requires multiple medications, occasional breakthrough" },
      severe: { description: "Drug-resistant epilepsy (failed 2+ medications)" }
    },
    modifications: {
      brain: {
        physiology: {
          cbf: { factor: 1.3, note: "Increased during ictal activity" },
          cmro2: { factor: 1.4, note: "Increased O2 consumption during seizure" },
          glucose_consumption: { factor: 1.5, note: "Markedly increased glucose demand" }
        },
        cellular: {
          glutamate: { factor: 1.5, note: "Excessive glutamate release" },
          gaba: { factor: 0.7, note: "Reduced inhibitory tone" },
          resting_potential: { factor: 1.1, note: "Depolarized membrane potential" }
        },
        structure: {
          neuron_density: { factor: 0.95, note: "May have hippocampal sclerosis" }
        }
      }
    }
  },

  G41_0: {
    name: "Status Epilepticus",
    icd10: "G41.0",
    category: "neurological",
    definition: "Continuous seizure activity >5 minutes or recurrent seizures without return to baseline",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Failure of seizure termination mechanisms → sustained neuronal firing → excitotoxicity → neuronal death",
      molecularBasis: "GABA receptor internalization, NMDA receptor upregulation, systemic complications"
    },
    clinicalPresentation: {
      symptoms: [
        "Prolonged seizure activity",
        "No return to baseline between seizures",
        "May be convulsive or non-convulsive"
      ],
      signs: [
        "Continuous or repetitive convulsions",
        "Altered consciousness",
        "Hyperthermia",
        "Autonomic instability",
        "May evolve to subtle motor activity"
      ]
    },
    laboratoryFindings: [
      { name: "ABG", normalRange: "Normal", abnormalInDisease: "Respiratory/metabolic acidosis" },
      { name: "Lactate", normalRange: "<2 mmol/L", abnormalInDisease: "Elevated" },
      { name: "CK", normalRange: "30-200 U/L", abnormalInDisease: "Elevated (rhabdomyolysis)" },
      { name: "Glucose", normalRange: "70-100 mg/dL", abnormalInDisease: "May be low or high" }
    ],
    imagingFindings: {
      ctHead: ["Rule out structural cause"],
      eeg: ["Continuous monitoring essential", "Electrographic seizures", "Burst suppression (treatment goal)"]
    },
    severity: {
      mild: { description: "Early status (5-30 min), responds to first-line treatment" },
      moderate: { description: "Established status (30-60 min)" },
      severe: { description: "Refractory status (>60 min, fails 2+ medications) - ICU" }
    },
    modifications: {
      brain: {
        pressures: {
          icp: { factor: 1.4, note: "Elevated from cerebral edema" }
        },
        physiology: {
          cbf: { factor: 1.5, note: "Markedly increased during seizure" },
          cmro2: { factor: 1.8, note: "Extremely high O2 demand" },
          glucose_consumption: { factor: 2.0, note: "Can deplete glucose stores" },
          body_temp: { factor: 1.03, note: "Hyperthermia from muscle activity" }
        },
        cellular: {
          glutamate: { factor: 2.0, note: "Excitotoxic levels" },
          gaba: { factor: 0.5, note: "GABA receptor internalization" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.3, note: "Tachycardia" },
          blood_pressure: { factor: 1.2, note: "Hypertension from autonomic surge" }
        }
      },
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.92, note: "Hypoxia risk" }
        }
      }
    }
  },

  // =====================
  // HEADACHE DISORDERS
  // ICD-10: G43-G44 Series
  // =====================

  G43_9: {
    name: "Migraine, Unspecified",
    icd10: "G43.9",
    category: "neurological",
    definition: "Recurrent moderate-to-severe headache with associated symptoms (nausea, photophobia, phonophobia)",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Cortical spreading depression → trigeminovascular activation → neurogenic inflammation → pain",
      molecularBasis: "CGRP release, serotonin fluctuations, cortical hyperexcitability"
    },
    clinicalPresentation: {
      symptoms: [
        "Unilateral pulsating headache (classic)",
        "Moderate-to-severe intensity",
        "Nausea and/or vomiting",
        "Photophobia",
        "Phonophobia",
        "Aura (visual, sensory, motor) in some",
        "Worsened by physical activity"
      ],
      signs: [
        "Pallor",
        "Scalp tenderness",
        "Otherwise normal neurological exam",
        "Signs of autonomic activation"
      ]
    },
    laboratoryFindings: [
      { name: "Lab tests", normalRange: "N/A", abnormalInDisease: "Not routinely indicated; rule out secondary causes if atypical" }
    ],
    imagingFindings: {
      imaging: ["Not needed for typical migraine", "MRI if: first/worst headache, focal deficits, papilledema, age >50 new onset"]
    },
    severity: {
      mild: { description: "<4 headache days/month, responds to acute treatment" },
      moderate: { description: "4-14 headache days/month" },
      severe: { description: ">15 headache days/month (chronic migraine)" }
    },
    modifications: {
      brain: {
        physiology: {
          cbf: { factor: 1.2, note: "Increased during migraine attack" }
        },
        cellular: {
          glutamate: { factor: 1.2, note: "Cortical spreading depression" }
        },
        structure: {
          capillary_density: { factor: 1.1, note: "Neurogenic inflammation and vasodilation" }
        }
      }
    }
  },

  G44_2: {
    name: "Tension-Type Headache",
    icd10: "G44.2",
    category: "neurological",
    definition: "Most common primary headache with bilateral, pressing/tightening quality",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Peripheral (myofascial) and central sensitization → referred pain",
      molecularBasis: "Pericranial muscle tenderness, altered pain modulation"
    },
    clinicalPresentation: {
      symptoms: [
        "Bilateral headache",
        "Pressing/tightening (non-pulsating)",
        "Mild-to-moderate intensity",
        "Not worsened by physical activity",
        "No nausea or vomiting (mild photophobia OR phonophobia allowed)"
      ],
      signs: [
        "Pericranial muscle tenderness",
        "Normal neurological exam"
      ]
    },
    laboratoryFindings: [
      { name: "Lab tests", normalRange: "N/A", abnormalInDisease: "Not indicated for typical presentation" }
    ],
    imagingFindings: {
      imaging: ["Not needed for typical presentation"]
    },
    severity: {
      mild: { description: "Episodic infrequent (<1 day/month)" },
      moderate: { description: "Episodic frequent (1-14 days/month)" },
      severe: { description: "Chronic (≥15 days/month for >3 months)" }
    },
    modifications: {
      brain: {
        physiology: {
          cbf: { factor: 1.0, note: "Usually normal" }
        }
      }
    }
  },

  // =====================
  // MOVEMENT DISORDERS
  // ICD-10: G20-G26 Series
  // =====================

  G20: {
    name: "Parkinson's Disease",
    icd10: "G20",
    category: "neurological",
    definition: "Progressive neurodegenerative disorder characterized by motor and non-motor symptoms due to dopamine deficiency",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Loss of dopaminergic neurons in substantia nigra pars compacta → striatal dopamine deficiency → motor circuit dysfunction",
      molecularBasis: "Alpha-synuclein aggregation (Lewy bodies), mitochondrial dysfunction, oxidative stress"
    },
    clinicalPresentation: {
      symptoms: [
        "Bradykinesia (slowness)",
        "Resting tremor ('pill-rolling')",
        "Rigidity",
        "Postural instability (later)",
        "Non-motor: anosmia, REM sleep disorder, constipation, depression"
      ],
      signs: [
        "Resting tremor (4-6 Hz)",
        "Cogwheel rigidity",
        "Bradykinesia",
        "Masked facies",
        "Shuffling gait",
        "Reduced arm swing",
        "Micrographia"
      ]
    },
    laboratoryFindings: [
      { name: "Lab tests", normalRange: "N/A", abnormalInDisease: "No diagnostic blood tests; rule out secondary causes" }
    ],
    imagingFindings: {
      mri: ["Usually normal in early disease", "Rule out vascular parkinsonism, NPH"],
      datScan: ["Reduced dopamine transporter uptake in striatum (supports diagnosis)"],
      petScan: ["Reduced dopamine metabolism in putamen"]
    },
    severity: {
      mild: { description: "Hoehn & Yahr Stage 1-2, unilateral or bilateral, no balance impairment" },
      moderate: { description: "Hoehn & Yahr Stage 3, postural instability, physically independent" },
      severe: { description: "Hoehn & Yahr Stage 4-5, requires assistance, wheelchair/bed-bound" }
    },
    modifications: {
      brain: {
        geometry: {
          brain_volume: { factor: 0.97, note: "Mild atrophy" }
        },
        physiology: {
          cbf: { factor: 0.9, note: "Reduced in basal ganglia" },
          glucose_consumption: { factor: 0.85, note: "Reduced in striatum" }
        },
        structure: {
          neuron_density: { factor: 0.7, note: "Substantia nigra neuronal loss (>60%)" }
        },
        cellular: {
          resting_potential: { factor: 0.95, note: "Altered neuronal excitability" }
        }
      }
    }
  },

  G25_5: {
    name: "Essential Tremor",
    icd10: "G25.5",
    category: "neurological",
    definition: "Most common movement disorder, characterized by action/postural tremor of hands",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Cerebellar-thalamo-cortical circuit oscillations → tremor generation",
      molecularBasis: "GABAergic dysfunction, Purkinje cell loss (autopsy studies)"
    },
    clinicalPresentation: {
      symptoms: [
        "Bilateral hand tremor (action/postural)",
        "Worsens with movement/intention",
        "Improves with alcohol (classic)",
        "May affect head, voice",
        "Family history common"
      ],
      signs: [
        "Bilateral postural tremor (8-12 Hz)",
        "Kinetic tremor",
        "Head tremor (yes-yes or no-no)",
        "Voice tremor",
        "No bradykinesia or rigidity"
      ]
    },
    laboratoryFindings: [
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Rule out hyperthyroidism" },
      { name: "Lab tests", normalRange: "N/A", abnormalInDisease: "Rule out metabolic/toxic causes" }
    ],
    imagingFindings: {
      mri: ["Usually normal", "Rule out structural cause"],
      datScan: ["Normal (distinguishes from Parkinson's)"]
    },
    severity: {
      mild: { description: "Minimal functional impairment" },
      moderate: { description: "Interferes with daily activities" },
      severe: { description: "Disabling, requires treatment" }
    },
    modifications: {
      brain: {
        physiology: {
          cbf: { factor: 1.05, note: "May be slightly increased in cerebellum" }
        },
        cellular: {
          gaba: { factor: 0.8, note: "GABAergic dysfunction in cerebellum" }
        }
      }
    }
  },

  // =====================
  // DEMYELINATING DISEASES
  // ICD-10: G35-G37 Series
  // =====================

  G35: {
    name: "Multiple Sclerosis",
    icd10: "G35",
    category: "neurological",
    definition: "Chronic autoimmune demyelinating disease of the central nervous system",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Autoimmune attack on CNS myelin → demyelination → conduction block → neurodegeneration over time",
      molecularBasis: "T-cell and B-cell mediated inflammation, oligodendrocyte damage, axonal loss"
    },
    clinicalPresentation: {
      symptoms: [
        "Optic neuritis (vision loss, pain with eye movement)",
        "Sensory symptoms (numbness, tingling, Lhermitte's sign)",
        "Motor weakness",
        "Ataxia and balance problems",
        "Bladder dysfunction",
        "Fatigue (very common)",
        "Cognitive changes"
      ],
      signs: [
        "Optic disc pallor (after optic neuritis)",
        "INO (internuclear ophthalmoplegia)",
        "Hyperreflexia, spasticity",
        "Positive Babinski",
        "Cerebellar signs",
        "Sensory level"
      ]
    },
    laboratoryFindings: [
      { name: "CSF analysis", normalRange: "Normal", abnormalInDisease: "Oligoclonal bands (>90%), elevated IgG index, mild pleocytosis" },
      { name: "Evoked potentials", normalRange: "Normal", abnormalInDisease: "Delayed VEP, SSEP, BAEP" }
    ],
    imagingFindings: {
      mri: ["T2/FLAIR hyperintense lesions (periventricular, juxtacortical, infratentorial, spinal)", "Dawson's fingers", "Gadolinium enhancement (active lesions)", "Black holes (chronic)"],
      mcDonaldCriteria: ["Dissemination in space and time"]
    },
    severity: {
      mild: { description: "EDSS 0-3.5, fully ambulatory, minimal disability" },
      moderate: { description: "EDSS 4-6, ambulatory with assistance, significant disability" },
      severe: { description: "EDSS 6.5-10, wheelchair-bound or bed-bound" }
    },
    modifications: {
      brain: {
        geometry: {
          brain_volume: { factor: 0.95, note: "Brain atrophy over time" },
          white_matter: { factor: 0.85, note: "White matter lesion burden" },
          ventricle_volume: { factor: 1.2, note: "Ventricular enlargement" }
        },
        physiology: {
          cbf: { factor: 0.9, note: "Reduced in lesional areas" }
        },
        structure: {
          myelin_volume: { factor: 0.7, note: "Demyelination" },
          neuron_density: { factor: 0.9, note: "Axonal loss in chronic disease" }
        },
        cellular: {
          conduction_velocity_axon: { factor: 0.5, note: "Slowed conduction from demyelination" }
        }
      }
    }
  },

  // =====================
  // NEURODEGENERATIVE DISEASES
  // ICD-10: G30 Series
  // =====================

  G30_9: {
    name: "Alzheimer's Disease",
    icd10: "G30.9",
    category: "neurological",
    definition: "Progressive neurodegenerative disease causing dementia, characterized by memory loss and cognitive decline",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Amyloid-β plaque deposition and neurofibrillary tau tangles → synaptic dysfunction → neuronal death",
      molecularBasis: "APP processing, presenilin mutations (familial), ApoE4 risk factor, neuroinflammation"
    },
    clinicalPresentation: {
      symptoms: [
        "Progressive memory loss (especially recent memory)",
        "Word-finding difficulties",
        "Getting lost in familiar places",
        "Difficulty with complex tasks",
        "Personality changes",
        "Behavioral symptoms (later: agitation, wandering)"
      ],
      signs: [
        "Impaired recall on cognitive testing",
        "Disorientation (time > place > person)",
        "Apraxia, agnosia, aphasia (later)",
        "Motor signs minimal until late"
      ]
    },
    laboratoryFindings: [
      { name: "CSF biomarkers", normalRange: "N/A", abnormalInDisease: "Low Aβ42, elevated tau and phospho-tau" },
      { name: "B12, TSH, RPR", normalRange: "Normal", abnormalInDisease: "Rule out reversible causes" }
    ],
    imagingFindings: {
      mri: ["Hippocampal and medial temporal atrophy", "Global cortical atrophy (later)", "Parietal atrophy"],
      petScan: ["Amyloid PET positive", "Tau PET positive", "FDG-PET: temporoparietal hypometabolism"]
    },
    severity: {
      mild: { description: "MCI or mild dementia, independent in daily activities" },
      moderate: { description: "Moderate dementia, needs assistance with IADLs and some ADLs" },
      severe: { description: "Severe dementia, dependent for all ADLs" }
    },
    modifications: {
      brain: {
        geometry: {
          brain_volume: { factor: 0.85, note: "Significant global atrophy" },
          gray_matter: { factor: 0.75, note: "Cortical gray matter loss" },
          white_matter: { factor: 0.9, note: "White matter changes" },
          ventricle_volume: { factor: 1.5, note: "Ventricular enlargement" },
          cortical_thickness: { factor: 0.75, note: "Cortical thinning" }
        },
        physiology: {
          cbf: { factor: 0.8, note: "Reduced cerebral perfusion" },
          cmro2: { factor: 0.8, note: "Reduced oxygen metabolism" },
          glucose_consumption: { factor: 0.7, note: "Temporoparietal hypometabolism" }
        },
        structure: {
          neuron_density: { factor: 0.6, note: "Severe neuronal loss" },
          synapse_count: { factor: 0.5, note: "Synaptic loss" }
        }
      }
    }
  },

  // =====================
  // PERIPHERAL NEUROPATHY
  // ICD-10: G60-G65 Series
  // =====================

  G62_9: {
    name: "Polyneuropathy, Unspecified",
    icd10: "G62.9",
    category: "neurological",
    definition: "Symmetric peripheral nerve dysfunction affecting multiple nerves",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Axonal or demyelinating injury to peripheral nerves in length-dependent pattern",
      molecularBasis: "Metabolic (diabetes), toxic (alcohol), nutritional (B12), immune-mediated"
    },
    clinicalPresentation: {
      symptoms: [
        "Numbness and tingling (stocking-glove)",
        "Burning pain",
        "Weakness (distal > proximal)",
        "Balance problems",
        "Autonomic symptoms (postural hypotension, GI, urinary)"
      ],
      signs: [
        "Decreased sensation distally",
        "Reduced or absent ankle reflexes",
        "Distal weakness (foot drop)",
        "Trophic changes",
        "High-stepping gait"
      ]
    },
    laboratoryFindings: [
      { name: "HbA1c/Glucose", normalRange: "<5.7%/<100 mg/dL", abnormalInDisease: "Elevated (diabetic neuropathy)" },
      { name: "Vitamin B12", normalRange: "200-900 pg/mL", abnormalInDisease: "Low" },
      { name: "TSH", normalRange: "0.4-4.0 mIU/L", abnormalInDisease: "Abnormal (thyroid)" },
      { name: "Serum protein electrophoresis", normalRange: "Normal", abnormalInDisease: "Monoclonal protein (MGUS)" }
    ],
    imagingFindings: {
      emgNcv: ["Reduced conduction velocities (demyelinating)", "Reduced amplitudes (axonal)", "Denervation potentials"],
      mri: ["Nerve root enhancement (inflammatory)", "Usually not needed"]
    },
    severity: {
      mild: { description: "Sensory symptoms only, no weakness" },
      moderate: { description: "Mild weakness, functional impairment" },
      severe: { description: "Significant weakness, disability" }
    },
    modifications: {
      brain: {
        cellular: {
          conduction_velocity_axon: { factor: 0.6, note: "Slowed nerve conduction" },
          resting_potential: { factor: 0.9, note: "Altered membrane function" }
        }
      }
    }
  },

  G61_0: {
    name: "Guillain-Barré Syndrome",
    icd10: "G61.0",
    category: "neurological",
    definition: "Acute inflammatory demyelinating polyneuropathy causing ascending weakness",
    primaryOrgan: "brain",
    affectedOrgans: ["brain", "lungs"],
    pathophysiology: {
      mechanism: "Post-infectious autoimmune attack on peripheral nerve myelin → conduction block → weakness",
      molecularBasis: "Molecular mimicry (Campylobacter, CMV), antibodies against gangliosides (GM1, GQ1b)"
    },
    clinicalPresentation: {
      symptoms: [
        "Ascending weakness (legs → arms → face/respiratory)",
        "Paresthesias",
        "Back pain",
        "Autonomic symptoms",
        "Recent infection (1-4 weeks prior)"
      ],
      signs: [
        "Symmetric weakness (ascending)",
        "Areflexia or hyporeflexia",
        "Facial weakness (bilateral)",
        "Respiratory weakness (monitor closely)",
        "Autonomic instability"
      ]
    },
    laboratoryFindings: [
      { name: "CSF analysis", normalRange: "Normal", abnormalInDisease: "Albuminocytologic dissociation (high protein, normal cells)" },
      { name: "Anti-ganglioside antibodies", normalRange: "Negative", abnormalInDisease: "Anti-GM1, anti-GQ1b (Miller Fisher)" }
    ],
    imagingFindings: {
      emgNcv: ["Demyelinating pattern: prolonged F-waves, conduction block, prolonged distal latencies", "May be normal early"],
      mri: ["Nerve root enhancement (gadolinium)"]
    },
    severity: {
      mild: { description: "Ambulatory, no respiratory involvement" },
      moderate: { description: "Unable to walk, may need ICU monitoring" },
      severe: { description: "Respiratory failure requiring ventilation, autonomic crisis" }
    },
    modifications: {
      brain: {
        cellular: {
          conduction_velocity_axon: { factor: 0.3, note: "Severely slowed - demyelinating pattern" }
        }
      },
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.9, note: "Respiratory compromise risk" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.2, note: "Autonomic instability - tachycardia" },
          blood_pressure: { factor: 1.15, note: "Labile BP from autonomic dysfunction" }
        }
      }
    }
  },

  // =====================
  // MENINGITIS
  // ICD-10: G00-G03 Series
  // =====================

  G00_9: {
    name: "Bacterial Meningitis",
    icd10: "G00.9",
    category: "neurological",
    definition: "Acute bacterial infection of the meninges - medical emergency",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Bacterial invasion of subarachnoid space → intense inflammatory response → cerebral edema, increased ICP",
      molecularBasis: "S. pneumoniae (adults), N. meningitidis (young adults), L. monocytogenes (elderly, immunocompromised)"
    },
    clinicalPresentation: {
      symptoms: [
        "Severe headache",
        "Fever",
        "Neck stiffness",
        "Photophobia",
        "Altered mental status",
        "Nausea and vomiting"
      ],
      signs: [
        "Fever",
        "Nuchal rigidity",
        "Kernig's sign",
        "Brudzinski's sign",
        "Altered consciousness",
        "Petechial rash (meningococcal)"
      ]
    },
    laboratoryFindings: [
      { name: "CSF analysis", normalRange: "WBC <5, protein <45, glucose >60% serum", abnormalInDisease: "High WBC (neutrophils), high protein, low glucose" },
      { name: "CSF Gram stain/culture", normalRange: "Negative", abnormalInDisease: "Organisms seen/grown" },
      { name: "Blood cultures", normalRange: "Negative", abnormalInDisease: "Often positive" },
      { name: "Procalcitonin", normalRange: "<0.5 ng/mL", abnormalInDisease: "Elevated (bacterial)" }
    ],
    imagingFindings: {
      ctHead: ["Before LP if: focal deficits, papilledema, decreased consciousness, immunocompromised", "Rule out mass effect"],
      mri: ["Meningeal enhancement", "Complications (abscess, infarct)"]
    },
    severity: {
      mild: { description: "Alert, no focal deficits" },
      moderate: { description: "Altered consciousness, stable" },
      severe: { description: "Comatose, septic shock, focal deficits, high mortality" }
    },
    modifications: {
      brain: {
        geometry: {
          csf_volume: { factor: 1.2, note: "Purulent CSF" },
          ventricle_volume: { factor: 1.1, note: "May develop hydrocephalus" }
        },
        pressures: {
          icp: { factor: 1.8, note: "Elevated from inflammation and edema" },
          cpp: { factor: 0.8, note: "Reduced perfusion" },
          csf_pressure: { factor: 2.5, note: "Markedly elevated" }
        },
        physiology: {
          cbf: { factor: 0.85, note: "May be reduced" },
          body_temp: { factor: 1.04, note: "Fever (39-40°C)" }
        },
        structure: {
          bbb_thickness: { factor: 0.8, note: "BBB disruption" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.3, note: "Tachycardia from fever/sepsis" },
          blood_pressure: { factor: 0.85, note: "May be hypotensive if septic" }
        }
      }
    }
  },

  G03_9: {
    name: "Meningitis, Unspecified",
    icd10: "G03.9",
    category: "neurological",
    definition: "Inflammation of the meninges not otherwise specified",
    primaryOrgan: "brain",
    affectedOrgans: ["brain"],
    pathophysiology: {
      mechanism: "Infectious or non-infectious inflammation of meninges",
      molecularBasis: "Viral (enterovirus, HSV), bacterial, fungal, or aseptic causes"
    },
    clinicalPresentation: {
      symptoms: [
        "Headache",
        "Fever",
        "Neck stiffness",
        "Photophobia"
      ],
      signs: [
        "Meningeal signs",
        "Variable depending on etiology"
      ]
    },
    laboratoryFindings: [
      { name: "CSF analysis", normalRange: "Normal", abnormalInDisease: "Variable depending on cause" }
    ],
    imagingFindings: {
      ctHead: ["Rule out mass effect before LP"],
      mri: ["Meningeal enhancement if present"]
    },
    severity: {
      mild: { description: "Viral, self-limited" },
      moderate: { description: "Requires treatment" },
      severe: { description: "Complications, altered consciousness" }
    },
    modifications: {
      brain: {
        pressures: {
          icp: { factor: 1.3, note: "May be elevated" },
          csf_pressure: { factor: 1.5, note: "Elevated" }
        },
        physiology: {
          body_temp: { factor: 1.02, note: "Fever" }
        }
      },
      heart: {
        physiology: {
          heart_rate: { factor: 1.15, note: "Tachycardia from fever" }
        }
      }
    }
  }
};

export default NEUROLOGICAL_DISEASES;
