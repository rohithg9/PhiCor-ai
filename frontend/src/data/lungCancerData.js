// Comprehensive Lung Cancer Data Module
// Based on TNM 8th Edition, NCCN 2024-2025, NICE NG122 Guidelines

export const TNM_8TH_EDITION = {
  // T-STAGE: Primary Tumor
  T: {
    TX: {
      code: 'TX',
      name: 'Primary tumor cannot be assessed',
      description: 'Primary tumor cannot be assessed, or tumor proven by presence of malignant cells in sputum or bronchial washings but not visualized by imaging or bronchoscopy',
      size: null,
      surgicalOption: 'Not for surgery',
      equation: 'V_{tumor} = \\text{unknown}'
    },
    Tis: {
      code: 'Tis',
      name: 'Carcinoma in situ',
      description: 'Carcinoma in situ - Squamous cell carcinoma in situ (SCIS), Adenocarcinoma in situ (AIS)',
      size: 'Any size, purely lepidic pattern',
      surgicalOption: 'Consider limited resection',
      equation: 'V_{tumor} = \\frac{4}{3}\\pi r^3 \\approx 0'
    },
    T0: {
      code: 'T0',
      name: 'No evidence of primary tumor',
      description: 'No evidence of primary tumor on imaging',
      size: null,
      surgicalOption: 'Not applicable',
      equation: 'V_{tumor} = 0'
    },
    T1: {
      code: 'T1',
      name: 'Tumor ≤ 3 cm',
      description: 'Tumor ≤ 3 cm in greatest dimension, surrounded by lung or visceral pleura, without bronchoscopic evidence of invasion more proximal than the lobar bronchus',
      subcategories: {
        T1mi: {
          code: 'T1a(mi)',
          name: 'Minimally invasive adenocarcinoma',
          size: '≤ 3 cm, ≤ 0.5 cm invasion',
          surgicalOption: 'VATS lobectomy or wedge resection',
          fiveYearSurvival: '100%',
          equation: 'V = \\frac{4}{3}\\pi(0.25)^3 \\approx 0.065 \\text{ cm}^3'
        },
        T1a: {
          code: 'T1a',
          name: 'Tumor ≤ 1 cm',
          size: '≤ 1 cm',
          surgicalOption: 'VATS lobectomy',
          fiveYearSurvival: '92%',
          equation: 'V = \\frac{4}{3}\\pi(0.5)^3 \\approx 0.52 \\text{ cm}^3'
        },
        T1b: {
          code: 'T1b',
          name: 'Tumor > 1 cm to ≤ 2 cm',
          size: '> 1 cm to ≤ 2 cm',
          surgicalOption: 'VATS lobectomy',
          fiveYearSurvival: '83%',
          equation: 'V = \\frac{4}{3}\\pi(1)^3 \\approx 4.19 \\text{ cm}^3'
        },
        T1c: {
          code: 'T1c',
          name: 'Tumor > 2 cm to ≤ 3 cm',
          size: '> 2 cm to ≤ 3 cm',
          surgicalOption: 'VATS lobectomy',
          fiveYearSurvival: '77%',
          equation: 'V = \\frac{4}{3}\\pi(1.5)^3 \\approx 14.14 \\text{ cm}^3'
        }
      }
    },
    T2: {
      code: 'T2',
      name: 'Tumor > 3 cm to ≤ 5 cm',
      description: 'Tumor > 3 cm but ≤ 5 cm OR involves main bronchus regardless of distance to carina OR invades visceral pleura OR associated with atelectasis/obstructive pneumonitis extending to hilar region',
      subcategories: {
        T2a: {
          code: 'T2a',
          name: 'Tumor > 3 cm to ≤ 4 cm',
          size: '> 3 cm to ≤ 4 cm',
          surgicalOption: 'VATS or open lobectomy',
          fiveYearSurvival: '68%',
          equation: 'V = \\frac{4}{3}\\pi(2)^3 \\approx 33.51 \\text{ cm}^3'
        },
        T2b: {
          code: 'T2b',
          name: 'Tumor > 4 cm to ≤ 5 cm',
          size: '> 4 cm to ≤ 5 cm',
          surgicalOption: 'VATS or open lobectomy',
          fiveYearSurvival: '60%',
          equation: 'V = \\frac{4}{3}\\pi(2.5)^3 \\approx 65.45 \\text{ cm}^3'
        }
      },
      invasionCriteria: [
        'Main bronchus involvement (regardless of distance from carina)',
        'Visceral pleura invasion',
        'Atelectasis/obstructive pneumonitis to hilum'
      ]
    },
    T3: {
      code: 'T3',
      name: 'Tumor > 5 cm to ≤ 7 cm',
      description: 'Tumor > 5 cm but ≤ 7 cm OR directly invades chest wall, phrenic nerve, parietal pericardium OR separate tumor nodule(s) in same lobe',
      size: '> 5 cm to ≤ 7 cm',
      surgicalOption: 'Thoracotomy with en bloc resection',
      fiveYearSurvival: '53%',
      equation: 'V = \\frac{4}{3}\\pi(3)^3 \\approx 113.1 \\text{ cm}^3',
      invasionCriteria: [
        'Chest wall invasion (including superior sulcus/Pancoast tumors)',
        'Phrenic nerve involvement',
        'Parietal pericardium invasion',
        'Separate tumor nodule(s) in same lobe as primary'
      ]
    },
    T4: {
      code: 'T4',
      name: 'Tumor > 7 cm or extensive invasion',
      description: 'Tumor > 7 cm OR invades mediastinum, diaphragm, heart, great vessels, trachea, recurrent laryngeal nerve, esophagus, vertebral body, carina OR separate tumor nodule(s) in different ipsilateral lobe',
      size: '> 7 cm or any size with invasion',
      surgicalOption: 'Usually not resectable; consider in select cases',
      fiveYearSurvival: '36%',
      equation: 'V = \\frac{4}{3}\\pi(3.5)^3 \\approx 179.6 \\text{ cm}^3',
      invasionCriteria: [
        'Mediastinal fat/structures invasion',
        'Diaphragm involvement',
        'Heart or great vessels invasion',
        'Trachea involvement',
        'Recurrent laryngeal nerve',
        'Esophagus invasion',
        'Vertebral body invasion',
        'Carina involvement',
        'Separate nodule(s) in different ipsilateral lobe'
      ]
    }
  },

  // N-STAGE: Regional Lymph Nodes
  N: {
    NX: {
      code: 'NX',
      name: 'Regional nodes cannot be assessed',
      description: 'Regional lymph nodes cannot be assessed',
      stations: [],
      surgicalOption: 'Requires further investigation'
    },
    N0: {
      code: 'N0',
      name: 'No regional node metastasis',
      description: 'No regional lymph node metastasis',
      stations: [],
      surgicalOption: 'Proceed with surgery if T-stage permits',
      fiveYearSurvival: 'See T-stage'
    },
    N1: {
      code: 'N1',
      name: 'Ipsilateral peribronchial/hilar nodes',
      description: 'Metastasis in ipsilateral peribronchial and/or ipsilateral hilar lymph nodes and intrapulmonary nodes, including involvement by direct extension',
      stations: ['10', '11', '12', '13', '14'],
      stationNames: {
        '10': 'Hilar',
        '11': 'Interlobar',
        '12': 'Lobar',
        '13': 'Segmental',
        '14': 'Subsegmental'
      },
      surgicalOption: 'Surgery with lymphadenectomy',
      fiveYearSurvival: '49%',
      equation: 'N_{burden} = \\sum_{i=1}^{n} V_i \\cdot \\lambda_i'
    },
    N2: {
      code: 'N2',
      name: 'Ipsilateral mediastinal/subcarinal nodes',
      description: 'Metastasis in ipsilateral mediastinal and/or subcarinal lymph node(s)',
      stations: ['2', '3', '4', '7', '8', '9'],
      stationNames: {
        '2': 'Upper paratracheal',
        '3': 'Pre/retrotracheal',
        '4': 'Lower paratracheal',
        '7': 'Subcarinal',
        '8': 'Paraesophageal',
        '9': 'Pulmonary ligament'
      },
      surgicalOption: 'Neoadjuvant therapy then surgery in select cases; requires EBUS/mediastinoscopy',
      fiveYearSurvival: '36%',
      subcategories: {
        N2a1: { name: 'Single station skip', description: 'Single N2 station without N1' },
        N2a2: { name: 'Single station with N1', description: 'Single N2 station with N1' },
        N2b: { name: 'Multiple stations', description: 'Multiple N2 stations' }
      }
    },
    N3: {
      code: 'N3',
      name: 'Contralateral/supraclavicular nodes',
      description: 'Metastasis in contralateral mediastinal, contralateral hilar, ipsilateral or contralateral scalene, or supraclavicular lymph node(s)',
      stations: ['1', 'Contralateral 2-9', 'Contralateral 10-14'],
      stationNames: {
        '1': 'Supraclavicular/scalene'
      },
      surgicalOption: 'Not resectable - Definitive chemoradiation',
      fiveYearSurvival: '9%'
    }
  },

  // M-STAGE: Distant Metastasis
  M: {
    M0: {
      code: 'M0',
      name: 'No distant metastasis',
      description: 'No distant metastasis',
      sites: [],
      surgicalOption: 'See T and N staging'
    },
    M1: {
      code: 'M1',
      name: 'Distant metastasis',
      description: 'Distant metastasis present',
      subcategories: {
        M1a: {
          code: 'M1a',
          name: 'Intrathoracic metastasis',
          description: 'Separate tumor nodule(s) in contralateral lobe; pleural or pericardial nodules; malignant pleural/pericardial effusion',
          sites: ['Contralateral lung nodule', 'Pleural nodules', 'Pericardial nodules', 'Malignant pleural effusion', 'Malignant pericardial effusion'],
          surgicalOption: 'Consider surgery for contralateral nodule if fit; pleurodesis for effusions',
          fiveYearSurvival: '10%'
        },
        M1b: {
          code: 'M1b',
          name: 'Single extrathoracic metastasis',
          description: 'Single extrathoracic metastasis in a single organ',
          sites: ['Brain (single)', 'Adrenal (single)', 'Bone (single)', 'Liver (single)', 'Distant lymph node (single)'],
          surgicalOption: 'Consider oligometastatic approach: resect primary + metastasectomy/SBRT',
          fiveYearSurvival: '5%'
        },
        M1c: {
          code: 'M1c',
          name: 'Multiple extrathoracic metastases',
          description: 'Multiple extrathoracic metastases in one or several organs',
          sites: ['Multiple brain', 'Multiple bone', 'Multiple liver', 'Multiple organs'],
          surgicalOption: 'Not for surgery - Systemic therapy',
          fiveYearSurvival: '1%'
        }
      }
    }
  }
};

// Stage Groupings based on TNM 8th Edition
export const STAGE_GROUPINGS = {
  'IA1': { T: ['T1a(mi)', 'T1a'], N: 'N0', M: 'M0', fiveYearSurvival: '92%' },
  'IA2': { T: ['T1b'], N: 'N0', M: 'M0', fiveYearSurvival: '83%' },
  'IA3': { T: ['T1c'], N: 'N0', M: 'M0', fiveYearSurvival: '77%' },
  'IB': { T: ['T2a'], N: 'N0', M: 'M0', fiveYearSurvival: '68%' },
  'IIA': { T: ['T2b'], N: 'N0', M: 'M0', fiveYearSurvival: '60%' },
  'IIB': { T: ['T1a-c', 'T2a', 'T2b', 'T3'], N: 'N0-N1', M: 'M0', fiveYearSurvival: '53%' },
  'IIIA': { T: ['T1-2', 'T3', 'T4'], N: 'N1-N2', M: 'M0', fiveYearSurvival: '36%' },
  'IIIB': { T: ['T1-2', 'T3-4'], N: 'N2-N3', M: 'M0', fiveYearSurvival: '26%' },
  'IIIC': { T: ['T3-4'], N: 'N3', M: 'M0', fiveYearSurvival: '13%' },
  'IVA': { T: 'Any', N: 'Any', M: 'M1a-M1b', fiveYearSurvival: '10%' },
  'IVB': { T: 'Any', N: 'Any', M: 'M1c', fiveYearSurvival: '1%' }
};

// Symptoms Assessment
export const LUNG_CANCER_SYMPTOMS = {
  respiratory: {
    cough: {
      name: 'Cough',
      redFlag: '> 3 weeks persistent',
      grades: [
        { value: 0, label: 'None', description: 'No cough' },
        { value: 1, label: 'Occasional', description: 'Occasional cough, not bothersome' },
        { value: 2, label: 'Persistent', description: 'Daily cough for > 3 weeks' },
        { value: 3, label: 'Severe', description: 'Constant, disrupting sleep/activity' }
      ],
      investigation: 'Chest X-ray'
    },
    haemoptysis: {
      name: 'Haemoptysis',
      redFlag: 'Any amount',
      grades: [
        { value: 0, label: 'None', description: 'No blood' },
        { value: 1, label: 'Streaks', description: '< 5ml blood-streaked sputum' },
        { value: 2, label: 'Moderate', description: '5-10ml per episode' },
        { value: 3, label: 'Severe', description: '> 10ml or frank haemoptysis' }
      ],
      investigation: 'Urgent CT Chest, consider CT angiogram if severe'
    },
    dyspnoea: {
      name: 'Shortness of Breath',
      redFlag: 'New onset or progressive',
      scales: {
        MRC: [
          { grade: 1, description: 'Breathless only with strenuous exercise' },
          { grade: 2, description: 'Short of breath when hurrying on level ground or walking up slight hill' },
          { grade: 3, description: 'Walks slower than contemporaries on level ground or stops for breath' },
          { grade: 4, description: 'Stops for breath after walking ~100 yards' },
          { grade: 5, description: 'Too breathless to leave the house or breathless dressing' }
        ],
        NYHA: [
          { class: 'I', description: 'No limitation of physical activity' },
          { class: 'II', description: 'Slight limitation - comfortable at rest' },
          { class: 'III', description: 'Marked limitation - comfortable only at rest' },
          { class: 'IV', description: 'Unable to carry on any activity without discomfort' }
        ]
      }
    },
    chestPain: {
      name: 'Chest Pain',
      redFlag: 'Persistent or pleuritic',
      characteristics: ['Sharp', 'Dull ache', 'Crushing', 'Pleuritic'],
      locations: ['Central', 'Left sided', 'Right sided', 'Posterior', 'Radiating to arm/neck'],
      investigation: 'CXR, ECG, consider CT if persistent'
    },
    wheeze: {
      name: 'Wheeze/Stridor',
      redFlag: 'New onset unilateral wheeze or stridor',
      investigation: 'CXR, Spirometry, CT if abnormal'
    }
  },
  constitutional: {
    weightLoss: {
      name: 'Weight Loss',
      redFlag: '> 5% body weight in 3 months',
      grades: [
        { value: 0, label: 'None', percentage: '0%' },
        { value: 1, label: 'Mild', percentage: '< 5%' },
        { value: 2, label: 'Moderate', percentage: '5-10%' },
        { value: 3, label: 'Severe', percentage: '> 10%' }
      ]
    },
    fatigue: {
      name: 'Fatigue/Weakness',
      grades: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Mild - able to perform daily activities' },
        { value: 2, label: 'Moderate - limits some activities' },
        { value: 3, label: 'Severe - confined to bed > 50% of day' }
      ]
    },
    appetiteLoss: {
      name: 'Loss of Appetite',
      redFlag: 'Persistent > 2 weeks'
    }
  },
  localInvasion: {
    hoarseness: {
      name: 'Hoarseness',
      redFlag: '> 3 weeks - suggests recurrent laryngeal nerve involvement',
      investigation: 'CXR, CT Chest, ENT referral'
    },
    dysphagia: {
      name: 'Difficulty Swallowing',
      redFlag: 'Suggests esophageal compression/invasion',
      investigation: 'CT, consider endoscopy'
    },
    hornerSyndrome: {
      name: 'Horner Syndrome',
      description: 'Ptosis, miosis, anhidrosis - suggests Pancoast tumor',
      investigation: 'MRI apex of chest'
    },
    svcSyndrome: {
      name: 'SVC Syndrome',
      description: 'Facial swelling, neck vein distension, headache',
      investigation: 'Urgent CT with contrast'
    }
  },
  metastatic: {
    bonePain: {
      name: 'Bone Pain',
      redFlag: 'New persistent bone pain',
      investigation: 'Bone scan, PET-CT'
    },
    neurological: {
      name: 'Neurological Symptoms',
      symptoms: ['Headache', 'Seizures', 'Focal weakness', 'Confusion', 'Balance problems'],
      investigation: 'CT/MRI Brain'
    },
    jaundice: {
      name: 'Jaundice',
      redFlag: 'Suggests liver metastases',
      investigation: 'LFTs, CT Abdomen'
    }
  },
  paraneoplastic: {
    siadh: { name: 'SIADH', description: 'Hyponatremia, confusion - often SCLC' },
    cushings: { name: 'Cushing Syndrome', description: 'Ectopic ACTH' },
    hypercalcemia: { name: 'Hypercalcemia', description: 'PTHrP - often squamous cell' },
    limbicEncephalitis: { name: 'Limbic Encephalitis', description: 'Memory loss, personality change' }
  }
};

// Performance Status Scales
export const PERFORMANCE_STATUS = {
  ECOG: [
    { score: 0, description: 'Fully active, able to carry on all pre-disease activities without restriction', fitForSurgery: true },
    { score: 1, description: 'Restricted in strenuous activity but ambulatory and able to carry out light work', fitForSurgery: true },
    { score: 2, description: 'Ambulatory and capable of all self-care but unable to work; up and about > 50% of waking hours', fitForSurgery: 'Consider' },
    { score: 3, description: 'Capable of only limited self-care; confined to bed or chair > 50% of waking hours', fitForSurgery: false },
    { score: 4, description: 'Completely disabled; cannot carry on any self-care; totally confined to bed or chair', fitForSurgery: false },
    { score: 5, description: 'Dead', fitForSurgery: false }
  ]
};

// Imaging Findings
export const IMAGING_FINDINGS = {
  cxr: {
    suspicious: [
      'Lung nodule/mass',
      'Hilar enlargement',
      'Mediastinal widening',
      'Pleural effusion',
      'Lobar collapse/consolidation',
      'Rib destruction'
    ],
    reportTerms: {
      mass: 'Soft tissue opacity > 3cm',
      nodule: 'Soft tissue opacity ≤ 3cm',
      spiculated: 'Irregular margins - high suspicion malignancy',
      groundGlass: 'Hazy opacity - may represent adenocarcinoma',
      cavitating: 'Central lucency - consider squamous cell or infection'
    }
  },
  ct: {
    tumorCharacteristics: [
      { finding: 'Spiculated margins', significance: 'High malignancy risk (90%)' },
      { finding: 'Lobulated margins', significance: 'Intermediate risk' },
      { finding: 'Smooth margins', significance: 'Lower risk but not benign' },
      { finding: 'Ground glass opacity', significance: 'May represent early adenocarcinoma' },
      { finding: 'Part-solid nodule', significance: 'Higher risk than pure GGO' },
      { finding: 'Calcification pattern', significance: 'Central/popcorn suggests benign' },
      { finding: 'Fat density', significance: 'Suggests hamartoma (benign)' }
    ],
    staging: {
      T: 'Measure maximum dimension, assess invasion',
      N: 'Nodes > 1cm short axis suspicious; PET superior',
      M: 'Assess liver, adrenals, bones visible on scan'
    }
  },
  pet: {
    interpretation: [
      { suv: '< 2.5', interpretation: 'Low FDG uptake - less likely malignant' },
      { suv: '2.5-5', interpretation: 'Moderate uptake - indeterminate' },
      { suv: '> 5', interpretation: 'High uptake - likely malignant' },
      { suv: '> 10', interpretation: 'Very high - aggressive malignancy likely' }
    ],
    falsePositives: ['Infection', 'Inflammation', 'Granulomatous disease'],
    falseNegatives: ['Carcinoid', 'Bronchoalveolar carcinoma', 'Small nodules < 8mm']
  }
};

// Treatment Guidelines 2024-2025
export const TREATMENT_GUIDELINES = {
  earlyStage: {
    stageIA: {
      stages: ['IA1', 'IA2', 'IA3'],
      surgery: {
        preferred: 'Anatomic lobectomy (VATS preferred)',
        alternative: 'Segmentectomy for high-risk patients',
        adjuvant: 'None required for stage IA (NCCN 2024)'
      }
    },
    stageIB: {
      stages: ['IB'],
      surgery: {
        preferred: 'Anatomic lobectomy',
        adjuvant: 'Consider adjuvant chemotherapy for high-risk features (tumor > 4cm, poorly differentiated, vascular invasion)'
      }
    },
    stageII: {
      stages: ['IIA', 'IIB'],
      treatment: {
        primary: 'Surgical resection',
        adjuvant: 'Adjuvant chemotherapy (cisplatin-based doublet)',
        targetedTherapy: 'Osimertinib adjuvant for EGFR+ (3 years)'
      }
    }
  },
  locallyAdvanced: {
    stageIIIA_resectable: {
      option1: {
        name: 'Neoadjuvant Immunotherapy (NCCN 2024)',
        protocol: 'Nivolumab + platinum doublet x 3 cycles → Surgery → Adjuvant nivolumab',
        evidence: 'CheckMate 816 - improved pCR and EFS'
      },
      option2: {
        name: 'Surgery First',
        protocol: 'Surgery → Adjuvant chemotherapy ± radiation',
        adjuvantImmuno: 'Pembrolizumab adjuvant for PD-L1 ≥ 50% (NCCN 2024)'
      }
    },
    stageIIIB_unresectable: {
      treatment: {
        standard: 'Concurrent chemoradiation (60 Gy)',
        consolidation: 'Durvalumab x 12 months (PACIFIC regimen)',
        evidence: 'PACIFIC trial - improved OS and PFS'
      }
    }
  },
  metastatic: {
    withDriverMutations: {
      EGFR: {
        firstLine: 'Osimertinib (preferred for exon 19 del/L858R)',
        secondLine: 'Based on resistance mechanism',
        evidence: 'FLAURA trial'
      },
      ALK: {
        firstLine: 'Alectinib or Lorlatinib (preferred)',
        secondLine: 'Based on ALK resistance mutations'
      },
      ROS1: {
        firstLine: 'Crizotinib or Entrectinib'
      },
      BRAF_V600E: {
        firstLine: 'Dabrafenib + Trametinib'
      },
      KRAS_G12C: {
        firstLine: 'Sotorasib or Adagrasib'
      },
      MET_exon14: {
        firstLine: 'Capmatinib or Tepotinib'
      },
      RET: {
        firstLine: 'Selpercatinib or Pralsetinib'
      },
      NTRK: {
        firstLine: 'Larotrectinib or Entrectinib'
      }
    },
    withoutDriverMutations: {
      pdl1High: {
        threshold: 'PD-L1 ≥ 50%',
        firstLine: 'Pembrolizumab monotherapy OR Pembrolizumab + platinum + pemetrexed',
        evidence: 'KEYNOTE-024, KEYNOTE-189'
      },
      pdl1Low: {
        threshold: 'PD-L1 1-49%',
        firstLine: 'Pembrolizumab + platinum + pemetrexed (non-squamous) OR Pembrolizumab + carboplatin + paclitaxel (squamous)'
      },
      pdl1Negative: {
        threshold: 'PD-L1 < 1%',
        firstLine: 'Nivolumab + Ipilimumab + chemotherapy OR Chemotherapy + bevacizumab (non-squamous)'
      }
    }
  }
};

// Biomarker Testing Requirements (NCCN 2024)
export const BIOMARKER_TESTING = {
  required: [
    { marker: 'EGFR', method: 'NGS/PCR', required: true },
    { marker: 'ALK', method: 'FISH/IHC/NGS', required: true },
    { marker: 'ROS1', method: 'FISH/IHC/NGS', required: true },
    { marker: 'BRAF', method: 'NGS', required: true },
    { marker: 'KRAS', method: 'NGS', required: true },
    { marker: 'MET exon 14', method: 'NGS', required: true },
    { marker: 'RET', method: 'NGS/FISH', required: true },
    { marker: 'NTRK', method: 'NGS/FISH', required: true },
    { marker: 'PD-L1', method: 'IHC', required: true },
    { marker: 'HER2', method: 'NGS', recommended: true }
  ],
  turnaroundTime: {
    standard: '10-14 days',
    rapidPCR: '24-48 hours for EGFR/ALK'
  }
};

// Surgical Risk Assessment
export const SURGICAL_RISK = {
  lungFunction: {
    fev1: {
      name: 'FEV1 (% predicted)',
      thresholds: [
        { value: '> 80%', risk: 'Low', action: 'Proceed with surgery' },
        { value: '60-80%', risk: 'Moderate', action: 'Calculate PPO FEV1' },
        { value: '< 60%', risk: 'High', action: 'CPET required' }
      ]
    },
    dlco: {
      name: 'DLCO (% predicted)',
      thresholds: [
        { value: '> 80%', risk: 'Low', action: 'Proceed with surgery' },
        { value: '60-80%', risk: 'Moderate', action: 'Calculate PPO DLCO' },
        { value: '< 60%', risk: 'High', action: 'CPET required' }
      ]
    },
    ppoCalculation: {
      lobectomy: 'PPO = Preop × (1 - segments removed/19)',
      pneumonectomy: 'PPO = Preop × (1 - perfusion to affected lung)'
    },
    ppoThresholds: {
      acceptable: '> 40% for both PPO FEV1 and PPO DLCO',
      borderline: '30-40% - requires VO2max testing',
      prohibitive: '< 30%'
    }
  },
  exerciseTesting: {
    vo2max: [
      { value: '> 20 ml/kg/min', risk: 'Low', action: 'Proceed' },
      { value: '15-20 ml/kg/min', risk: 'Moderate', action: 'Consider lobectomy only' },
      { value: '10-15 ml/kg/min', risk: 'High', action: 'Limited resection only' },
      { value: '< 10 ml/kg/min', risk: 'Prohibitive', action: 'Non-surgical treatment' }
    ]
  }
};

// Mathematical Models
export const MATHEMATICAL_MODELS = {
  tumorGrowth: {
    name: 'Tumor Volume Doubling Time',
    equation: 'V(t) = V_0 \\cdot e^{\\lambda t}',
    explanation: 'Where V₀ is initial volume, λ is growth rate constant',
    doublingTime: 'DT = \\frac{\\ln(2)}{\\lambda}',
    clinicalUse: 'Average DT for NSCLC: 100-400 days; < 30 days suggests high grade'
  },
  survivalModel: {
    name: 'Cox Proportional Hazards',
    equation: 'h(t) = h_0(t) \\cdot e^{\\beta_1 \\cdot Stage + \\beta_2 \\cdot PS + \\beta_3 \\cdot Age}',
    explanation: 'Baseline hazard modified by prognostic factors'
  },
  ppoFev1: {
    name: 'Predicted Post-operative FEV1',
    equation: 'PPO\\ FEV1 = Preop\\ FEV1 \\times (1 - \\frac{n}{19})',
    explanation: 'n = number of functional segments to be resected (19 total segments)'
  },
  thoracoscore: {
    name: 'Thoracoscore',
    description: 'In-hospital mortality prediction for thoracic surgery',
    variables: ['Age', 'Sex', 'ASA score', 'Performance status', 'Dyspnea score', 'Priority', 'Procedure class', 'Diagnosis group', 'Comorbidity']
  },
  tumorMetabolism: {
    name: 'Warburg Effect Equation',
    equation: 'ATP_{glycolysis} = 2 \\cdot [glucose] \\cdot k_{glyc}',
    explanation: 'Tumor cells preferentially use glycolysis even in aerobic conditions',
    pet_suv: 'SUV = \\frac{Tissue\\ Activity}{Injected\\ Dose / Body\\ Weight}'
  }
};

// MDT Decision Support
export const MDT_CHECKLIST = {
  preDiscussion: [
    'Complete staging CT chest/abdomen',
    'PET-CT if potentially curative',
    'Brain imaging (MRI preferred) for stage II+',
    'Tissue diagnosis with adequate material for biomarkers',
    'Lung function tests',
    'Performance status assessment',
    'Comorbidity assessment'
  ],
  discussionPoints: [
    'Histological diagnosis and grade',
    'TNM staging',
    'Biomarker results',
    'Patient fitness for treatment',
    'Treatment intent: curative vs palliative',
    'Treatment recommendations',
    'Clinical trial eligibility'
  ],
  decisionOutcomes: [
    'Surgery +/- adjuvant',
    'Neoadjuvant therapy then surgery',
    'Definitive chemoradiation',
    'Systemic therapy - targeted',
    'Systemic therapy - immunotherapy',
    'Systemic therapy - chemotherapy',
    'Best supportive care',
    'Further investigations required'
  ]
};

export default {
  TNM_8TH_EDITION,
  STAGE_GROUPINGS,
  LUNG_CANCER_SYMPTOMS,
  PERFORMANCE_STATUS,
  IMAGING_FINDINGS,
  TREATMENT_GUIDELINES,
  BIOMARKER_TESTING,
  SURGICAL_RISK,
  MATHEMATICAL_MODELS,
  MDT_CHECKLIST
};
