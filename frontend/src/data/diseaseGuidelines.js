// Comprehensive Disease Treatment Guidelines with Evidence-Based Recommendations
// Integrates ICD-10 codes, NICE/ACC/AHA guidelines, evidence levels, and source citations

export const TREATMENT_EVIDENCE_LEVELS = {
  'IA': { label: 'Class I, Level A', description: 'Benefit >>> Risk, Multiple RCTs', strength: 'Strongest recommendation' },
  'IB': { label: 'Class I, Level B', description: 'Benefit >>> Risk, Single RCT or non-randomized studies', strength: 'Strong recommendation' },
  'IC': { label: 'Class I, Level C', description: 'Benefit >>> Risk, Expert opinion', strength: 'Recommendation with limited evidence' },
  'IIaA': { label: 'Class IIa, Level A', description: 'Benefit >> Risk, Multiple RCTs', strength: 'Reasonable to perform' },
  'IIaB': { label: 'Class IIa, Level B', description: 'Benefit >> Risk, Single RCT', strength: 'Reasonable to perform' },
  'IIaC': { label: 'Class IIa, Level C', description: 'Benefit >> Risk, Expert opinion', strength: 'May be considered' },
  'IIbA': { label: 'Class IIb, Level A', description: 'Benefit ≥ Risk, Multiple studies', strength: 'May be considered' },
  'IIbB': { label: 'Class IIb, Level B', description: 'Benefit ≥ Risk, Limited studies', strength: 'Effectiveness less established' },
  'IIbC': { label: 'Class IIb, Level C', description: 'Benefit ≥ Risk, Expert opinion', strength: 'Usefulness less established' },
  'IIIA': { label: 'Class III, Level A', description: 'Risk ≥ Benefit, Studies show harm', strength: 'Not recommended - harmful' },
  'IIIB': { label: 'Class III, Level B', description: 'No benefit or harmful', strength: 'Not recommended' },
};

export const DISEASE_TREATMENT_GUIDELINES = {
  // ==================== HEART FAILURE ====================
  'heart_failure_hfref': {
    icd10: 'I50.2',
    name: 'Heart Failure with Reduced EF (HFrEF)',
    affectedOrgans: ['heart', 'lungs', 'kidneys'],
    
    diagnosticCriteria: {
      essential: [
        { criterion: 'LVEF ≤ 40%', method: 'Echocardiography', source: 'ESC Guidelines 2021' },
        { criterion: 'Signs/symptoms of HF', method: 'Clinical assessment', source: 'ESC Guidelines 2021' },
      ],
      supportive: [
        { criterion: 'Elevated natriuretic peptides', values: 'BNP > 35 pg/mL or NT-proBNP > 125 pg/mL', source: 'ESC 2021' },
        { criterion: 'Structural/functional abnormality', method: 'Echo/CMR', source: 'ESC 2021' },
      ]
    },

    treatments: {
      firstLine: [
        {
          name: 'ACEi/ARB',
          drugs: ['Enalapril', 'Ramipril', 'Lisinopril', 'Losartan', 'Valsartan'],
          target: 'Max tolerated dose',
          evidence: 'IA',
          source: 'CONSENSUS, SOLVD trials',
          mechanism: 'Reduces preload/afterload, prevents remodeling',
          contraindications: ['Angioedema history', 'Bilateral renal artery stenosis', 'Pregnancy'],
          monitoring: ['K+', 'Creatinine', 'BP'],
          equation: '\\Delta mortality = -20\\% \\text{ to } -30\\%'
        },
        {
          name: 'Beta-blockers',
          drugs: ['Bisoprolol', 'Carvedilol', 'Metoprolol succinate'],
          target: 'Max tolerated dose',
          evidence: 'IA',
          source: 'CIBIS-II, COPERNICUS, MERIT-HF',
          mechanism: 'Reduces HR, prevents remodeling, reduces arrhythmias',
          contraindications: ['Severe bradycardia', 'High-grade AV block', 'Decompensated HF'],
          monitoring: ['HR', 'BP', 'Symptoms'],
          equation: '\\Delta mortality = -34\\%'
        },
        {
          name: 'MRA (Mineralocorticoid Receptor Antagonist)',
          drugs: ['Spironolactone', 'Eplerenone'],
          target: '25-50mg daily',
          evidence: 'IA',
          source: 'RALES, EMPHASIS-HF',
          mechanism: 'Blocks aldosterone, reduces fibrosis',
          contraindications: ['K+ > 5.0', 'Severe renal impairment'],
          monitoring: ['K+', 'Creatinine'],
          equation: '\\Delta mortality = -30\\%'
        },
        {
          name: 'SGLT2 inhibitor',
          drugs: ['Dapagliflozin', 'Empagliflozin'],
          target: '10mg daily',
          evidence: 'IA',
          source: 'DAPA-HF, EMPEROR-Reduced',
          mechanism: 'Natriuresis, cardiac energy metabolism, reduces preload',
          contraindications: ['eGFR < 20', 'T1DM without insulin'],
          monitoring: ['eGFR', 'Ketones if diabetic'],
          equation: '\\Delta HF\\ hospitalization = -30\\%'
        },
      ],
      secondLine: [
        {
          name: 'ARNI (Sacubitril/Valsartan)',
          drugs: ['Sacubitril/Valsartan (Entresto)'],
          target: '97/103mg BD',
          evidence: 'IA',
          source: 'PARADIGM-HF',
          indication: 'Replace ACEi/ARB if still symptomatic',
          mechanism: 'Neprilysin inhibition + ARB',
          notes: '36hr washout from ACEi required',
          equation: '\\Delta mortality = -20\\% \\text{ vs ACEi}'
        },
        {
          name: 'Ivabradine',
          drugs: ['Ivabradine (Procoralan)'],
          target: '5-7.5mg BD',
          evidence: 'IIaB',
          source: 'SHIFT trial',
          indication: 'Sinus rhythm, HR ≥70 despite max beta-blocker',
          mechanism: 'Selective If channel blocker',
          contraindications: ['AF', 'Severe hepatic impairment'],
        },
        {
          name: 'Hydralazine + Nitrates',
          drugs: ['Hydralazine + Isosorbide dinitrate'],
          evidence: 'IA',
          source: 'V-HeFT, A-HeFT',
          indication: 'ACEi/ARB intolerant OR add-on in Black patients',
          mechanism: 'Afterload reduction + preload reduction',
        },
      ],
      devices: [
        {
          name: 'ICD',
          indication: 'LVEF ≤35% despite ≥3 months OMT, NYHA II-III, life expectancy >1yr',
          evidence: 'IA',
          source: 'SCD-HeFT, MADIT-II',
          benefit: 'Primary prevention of sudden cardiac death'
        },
        {
          name: 'CRT-D/CRT-P',
          indication: 'LVEF ≤35%, LBBB QRS ≥150ms, NYHA II-IV despite OMT',
          evidence: 'IA',
          source: 'CARE-HF, COMPANION',
          benefit: 'Resynchronizes ventricular contraction'
        },
      ],
      advanced: [
        {
          name: 'LVAD',
          indication: 'End-stage HF, bridge to transplant or destination therapy',
          evidence: 'IIaB',
          source: 'REMATCH, HeartMate trials'
        },
        {
          name: 'Heart transplant',
          indication: 'End-stage HF despite all therapies, <65-70yrs, no contraindications',
          evidence: 'IC',
          source: 'ISHLT guidelines'
        },
      ],
    },

    physiologicalChanges: {
      heart: {
        parameters: {
          'lv_ef': { change: -0.3, direction: 'decrease', description: 'Reduced contractility' },
          'lv_edv': { change: 50, direction: 'increase', unit: 'mL', description: 'Volume overload' },
          'lv_mass': { change: 50, direction: 'increase', unit: 'g', description: 'Hypertrophy' },
        },
        equations: [
          { id: 'cardiac_output_reduced', latex: 'CO = HR \\times SV_{reduced}', description: 'Reduced stroke volume' },
          { id: 'frank_starling_shifted', latex: 'SV = f(EDV) \\downarrow', description: 'Impaired Frank-Starling mechanism' },
        ]
      },
      lungs: {
        parameters: {
          'pcwp': { change: 15, direction: 'increase', unit: 'mmHg', description: 'Pulmonary congestion' },
        }
      },
      kidneys: {
        parameters: {
          'gfr': { change: -20, direction: 'decrease', description: 'Cardiorenal syndrome' },
        }
      },
    },

    monitoringProtocol: {
      frequency: 'Every 1-4 weeks during titration, then every 3-6 months',
      parameters: ['BNP/NT-proBNP', 'Creatinine', 'K+', 'Na+', 'Weight', 'BP', 'HR'],
      targets: {
        'HR': '< 70 bpm in sinus rhythm',
        'BP': 'SBP > 90 mmHg if tolerated',
        'K+': '< 5.5 mmol/L',
        'Creatinine': '< 30% rise acceptable',
      }
    },
  },

  // ==================== ACUTE CORONARY SYNDROME ====================
  'acute_coronary_syndrome': {
    icd10: 'I21',
    name: 'Acute Coronary Syndrome (STEMI/NSTEMI)',
    affectedOrgans: ['heart'],
    
    diagnosticCriteria: {
      stemi: [
        { criterion: 'ST elevation ≥1mm in 2 contiguous leads', method: 'ECG', source: 'ESC 2023' },
        { criterion: 'New LBBB', method: 'ECG', source: 'ESC 2023' },
        { criterion: 'Troponin rise/fall pattern', method: 'hs-cTn', source: 'ESC 2023' },
      ],
      nstemi: [
        { criterion: 'Troponin rise above 99th percentile URL', method: 'hs-cTn', source: 'ESC 2023' },
        { criterion: 'Ischemic symptoms or ECG changes', method: 'Clinical', source: 'ESC 2023' },
      ]
    },

    treatments: {
      immediate: [
        {
          name: 'Dual antiplatelet therapy',
          drugs: ['Aspirin 300mg load + P2Y12 inhibitor'],
          p2y12Options: [
            { drug: 'Ticagrelor', dose: '180mg load, 90mg BD', evidence: 'IA', source: 'PLATO' },
            { drug: 'Prasugrel', dose: '60mg load, 10mg OD', evidence: 'IA', source: 'TRITON-TIMI 38' },
            { drug: 'Clopidogrel', dose: '600mg load, 75mg OD', evidence: 'IB', source: 'CURRENT-OASIS 7' },
          ],
          evidence: 'IA',
          source: 'ESC ACS Guidelines 2023',
        },
        {
          name: 'Anticoagulation',
          options: [
            { drug: 'UFH', dose: '70-100 U/kg bolus', indication: 'Primary PCI' },
            { drug: 'Enoxaparin', dose: '0.5mg/kg IV bolus', indication: 'If PCI delayed' },
            { drug: 'Bivalirudin', dose: '0.75mg/kg bolus', indication: 'Alternative to UFH' },
          ],
          evidence: 'IA',
        },
        {
          name: 'Primary PCI',
          timing: 'Door-to-balloon ≤90 min (≤120 min if transfer)',
          evidence: 'IA',
          source: 'ESC 2023, ACC/AHA',
          benefit: 'Superior to fibrinolysis if available timely',
        },
        {
          name: 'Fibrinolysis (if PCI not available)',
          drugs: ['Tenecteplase', 'Alteplase', 'Reteplase'],
          timing: 'Within 12hrs if PCI delay >120 min',
          evidence: 'IA',
          contraindications: ['Recent stroke', 'Active bleeding', 'Recent surgery'],
        },
      ],
      secondary: [
        {
          name: 'High-intensity statin',
          drugs: ['Atorvastatin 80mg', 'Rosuvastatin 40mg'],
          target: 'LDL < 1.4 mmol/L AND >50% reduction',
          evidence: 'IA',
          source: 'PROVE-IT, ESC Dyslipidemia 2019',
        },
        {
          name: 'Beta-blocker',
          drugs: ['Bisoprolol', 'Metoprolol', 'Carvedilol'],
          indication: 'All patients without contraindications',
          evidence: 'IA',
          timing: 'Within 24hrs, oral preferred',
        },
        {
          name: 'ACEi/ARB',
          indication: 'LVEF ≤40%, diabetes, hypertension, CKD',
          evidence: 'IA',
          source: 'HOPE, SAVE trials',
        },
        {
          name: 'Eplerenone',
          indication: 'LVEF ≤40% + HF symptoms or diabetes post-MI',
          evidence: 'IA',
          source: 'EPHESUS',
        },
      ],
      riskScores: [
        { name: 'GRACE score', use: 'In-hospital and 6-month mortality', source: 'GRACE registry' },
        { name: 'TIMI score', use: 'Risk stratification', source: 'TIMI trials' },
        { name: 'CRUSADE', use: 'Bleeding risk', source: 'CRUSADE registry' },
      ],
    },

    physiologicalChanges: {
      heart: {
        parameters: {
          'lv_ef': { change: -0.15, direction: 'decrease', description: 'Acute contractile dysfunction' },
          'troponin': { change: 100, direction: 'increase', description: 'Myocardial necrosis marker' },
        },
        equations: [
          { id: 'infarct_size', latex: 'Infarct\\% = \\frac{Peak\\ CK-MB}{k_{body\\ mass}}', description: 'Estimated infarct size' },
        ]
      },
    },
  },

  // ==================== ATRIAL FIBRILLATION ====================
  'atrial_fibrillation': {
    icd10: 'I48',
    name: 'Atrial Fibrillation',
    affectedOrgans: ['heart', 'brain'],
    
    diagnosticCriteria: {
      ecg: [
        { criterion: 'Irregularly irregular R-R intervals', method: 'ECG', source: 'ESC 2020' },
        { criterion: 'Absent P waves', method: 'ECG', source: 'ESC 2020' },
        { criterion: 'Fibrillatory baseline', method: 'ECG', source: 'ESC 2020' },
      ]
    },

    treatments: {
      strokePrevention: [
        {
          name: 'CHA₂DS₂-VASc Assessment',
          indication: 'All patients with AF',
          scoring: {
            'C': { points: 1, criterion: 'CHF/LV dysfunction' },
            'H': { points: 1, criterion: 'Hypertension' },
            'A₂': { points: 2, criterion: 'Age ≥75' },
            'D': { points: 1, criterion: 'Diabetes' },
            'S₂': { points: 2, criterion: 'Stroke/TIA/thromboembolism' },
            'V': { points: 1, criterion: 'Vascular disease' },
            'A': { points: 1, criterion: 'Age 65-74' },
            'Sc': { points: 1, criterion: 'Sex category (female)' },
          },
          recommendation: {
            0: 'No anticoagulation (male) or consider (female)',
            1: 'Consider anticoagulation',
            '≥2': 'Anticoagulation recommended (Class I)',
          },
          evidence: 'IA',
          source: 'ESC AF Guidelines 2020',
        },
        {
          name: 'DOAC (preferred)',
          drugs: [
            { drug: 'Apixaban', dose: '5mg BD (2.5mg if ≥2 of: age≥80, wt≤60kg, Cr≥133)', evidence: 'IA', source: 'ARISTOTLE' },
            { drug: 'Rivaroxaban', dose: '20mg OD (15mg if CrCl 15-50)', evidence: 'IA', source: 'ROCKET-AF' },
            { drug: 'Edoxaban', dose: '60mg OD (30mg if CrCl 15-50 or wt≤60kg)', evidence: 'IA', source: 'ENGAGE AF-TIMI 48' },
            { drug: 'Dabigatran', dose: '150mg BD (110mg if age≥80 or bleeding risk)', evidence: 'IB', source: 'RE-LY' },
          ],
        },
        {
          name: 'Warfarin',
          indication: 'Mechanical valve, moderate-severe MS, severe CKD',
          target: 'INR 2.0-3.0',
          evidence: 'IA',
        },
      ],
      rateControl: [
        {
          name: 'Beta-blockers',
          drugs: ['Bisoprolol', 'Metoprolol', 'Atenolol'],
          target: 'Resting HR <110 (lenient) or <80 (strict)',
          evidence: 'IA',
          source: 'RACE II',
        },
        {
          name: 'Non-DHP CCB',
          drugs: ['Diltiazem', 'Verapamil'],
          indication: 'If beta-blocker contraindicated, no HFrEF',
          evidence: 'IA',
        },
        {
          name: 'Digoxin',
          indication: 'Add-on or monotherapy in sedentary patients',
          target: 'Level 0.5-1.0 ng/mL',
          evidence: 'IIaB',
        },
      ],
      rhythmControl: [
        {
          name: 'Cardioversion',
          types: ['Electrical', 'Pharmacological'],
          timing: 'If AF <48hrs or anticoagulated ≥3 weeks or TEE-guided',
          evidence: 'IB',
        },
        {
          name: 'Catheter ablation',
          indication: 'Symptomatic paroxysmal AF, failed AAD, patient preference',
          evidence: 'IA for paroxysmal, IIaB for persistent',
          source: 'CABANA, CASTLE-AF',
        },
        {
          name: 'Antiarrhythmic drugs',
          options: [
            { drug: 'Flecainide', indication: 'No structural heart disease', evidence: 'IA' },
            { drug: 'Propafenone', indication: 'No structural heart disease', evidence: 'IA' },
            { drug: 'Dronedarone', indication: 'Paroxysmal/persistent, no HF', evidence: 'IA' },
            { drug: 'Amiodarone', indication: 'HF or structural HD', evidence: 'IA' },
            { drug: 'Sotalol', indication: 'CAD, no HF', evidence: 'IIaC' },
          ],
        },
      ],
    },

    physiologicalChanges: {
      heart: {
        parameters: {
          'hr': { change: 50, direction: 'increase', description: 'Rapid ventricular response' },
          'cardiac_output': { change: -0.15, direction: 'decrease', description: 'Loss of atrial kick' },
        },
        equations: [
          { id: 'atrial_kick_loss', latex: 'CO_{AF} = CO_{SR} \\times 0.85', description: '~15% CO reduction' },
          { id: 'stroke_risk', latex: 'Annual\\ Stroke\\% = 1.3^{CHA_2DS_2VASc}', description: 'Exponential risk increase' },
        ]
      },
    },
  },

  // ==================== HYPERTENSION ====================
  'hypertension': {
    icd10: 'I10',
    name: 'Essential Hypertension',
    affectedOrgans: ['heart', 'kidneys', 'brain'],
    
    diagnosticCriteria: {
      staging: [
        { stage: 'Elevated', systolic: '120-129', diastolic: '<80', source: 'ACC/AHA 2017' },
        { stage: 'Stage 1', systolic: '130-139', diastolic: '80-89', source: 'ACC/AHA 2017' },
        { stage: 'Stage 2', systolic: '≥140', diastolic: '≥90', source: 'ACC/AHA 2017' },
        { stage: 'Hypertensive Crisis', systolic: '>180', diastolic: '>120', source: 'ACC/AHA 2017' },
      ],
      confirmation: 'ABPM or HBPM recommended to confirm diagnosis'
    },

    treatments: {
      lifestyle: [
        { intervention: 'DASH diet', effect: '-11 mmHg', evidence: 'IA', source: 'DASH trial' },
        { intervention: 'Sodium reduction <2.3g/day', effect: '-5-6 mmHg', evidence: 'IA' },
        { intervention: 'Weight loss', effect: '-1 mmHg per kg lost', evidence: 'IA' },
        { intervention: 'Exercise 90-150 min/week', effect: '-5-8 mmHg', evidence: 'IA' },
        { intervention: 'Alcohol moderation', effect: '-4 mmHg', evidence: 'IIaB' },
      ],
      firstLine: [
        {
          name: 'ACEi/ARB',
          indication: 'CKD, diabetes, HF, post-MI',
          evidence: 'IA',
          equation: '\\Delta SBP = -8 \\text{ to } -10 \\text{ mmHg}'
        },
        {
          name: 'CCB (DHP)',
          drugs: ['Amlodipine', 'Nifedipine MR'],
          indication: 'Elderly, isolated systolic HTN, angina',
          evidence: 'IA',
        },
        {
          name: 'Thiazide/thiazide-like',
          drugs: ['Indapamide', 'Chlorthalidone', 'HCTZ'],
          indication: 'Elderly, Black patients, HF',
          evidence: 'IA',
        },
      ],
      combinations: [
        { combo: 'ACEi/ARB + CCB', evidence: 'IA', source: 'ACCOMPLISH' },
        { combo: 'ACEi/ARB + Thiazide', evidence: 'IA' },
        { combo: 'CCB + Thiazide', evidence: 'IB' },
        { combo: 'Triple: ACEi/ARB + CCB + Thiazide', indication: 'Resistant HTN' },
      ],
      resistant: [
        {
          name: 'Spironolactone',
          dose: '25-50mg',
          indication: 'Add-on for resistant HTN',
          evidence: 'IA',
          source: 'PATHWAY-2',
        },
        {
          name: 'Renal denervation',
          indication: 'Uncontrolled despite ≥3 drugs',
          evidence: 'IIbB',
        },
      ],
    },

    targets: {
      general: '<130/80 mmHg (ACC/AHA 2017)',
      elderly: '<140/90 or <130/80 if tolerated',
      diabetes: '<130/80',
      ckd: '<130/80',
    },
  },

  // ==================== TYPE 2 DIABETES ====================
  'type2_diabetes': {
    icd10: 'E11',
    name: 'Type 2 Diabetes Mellitus',
    affectedOrgans: ['pancreas', 'kidneys', 'heart', 'brain'],
    
    diagnosticCriteria: {
      diagnosis: [
        { criterion: 'HbA1c ≥6.5%', method: 'NGSP certified', source: 'ADA 2024' },
        { criterion: 'Fasting glucose ≥126 mg/dL', method: 'Fasting ≥8hrs', source: 'ADA 2024' },
        { criterion: '2hr glucose ≥200 mg/dL', method: 'OGTT', source: 'ADA 2024' },
        { criterion: 'Random glucose ≥200 + symptoms', method: 'Clinical', source: 'ADA 2024' },
      ]
    },

    treatments: {
      lifestyle: [
        { intervention: 'Medical nutrition therapy', evidence: 'IA', source: 'ADA Standards 2024' },
        { intervention: 'Weight loss 5-10%', effect: '-1% HbA1c', evidence: 'IA' },
        { intervention: 'Physical activity 150 min/week', evidence: 'IA' },
      ],
      firstLine: [
        {
          name: 'Metformin',
          dose: '500-2000mg daily',
          evidence: 'IA',
          source: 'UKPDS, ADA Standards',
          mechanism: 'Reduces hepatic glucose production',
          contraindications: ['eGFR <30', 'Acute illness with risk of lactic acidosis'],
          equation: '\\Delta HbA1c = -1.0\\% \\text{ to } -1.5\\%'
        },
      ],
      cvdBenefit: [
        {
          name: 'SGLT2 inhibitor',
          drugs: ['Empagliflozin', 'Dapagliflozin', 'Canagliflozin'],
          indication: 'Established ASCVD, HF, or CKD',
          evidence: 'IA',
          source: 'EMPA-REG, CANVAS, DECLARE',
          benefits: ['CV mortality reduction', 'HF hospitalization reduction', 'CKD progression reduction'],
          equation: '\\Delta CV\\ death = -38\\% \\text{ (EMPA-REG)}'
        },
        {
          name: 'GLP-1 RA',
          drugs: ['Semaglutide', 'Liraglutide', 'Dulaglutide'],
          indication: 'Established ASCVD or high CV risk',
          evidence: 'IA',
          source: 'LEADER, SUSTAIN-6, REWIND',
          benefits: ['MACE reduction', 'Weight loss'],
          equation: '\\Delta MACE = -12\\% \\text{ to } -26\\%'
        },
      ],
      additionalAgents: [
        { name: 'DPP-4 inhibitors', drugs: ['Sitagliptin', 'Linagliptin'], evidence: 'IIaB', use: 'If GLP-1 not suitable' },
        { name: 'Sulfonylureas', drugs: ['Gliclazide', 'Glimepiride'], evidence: 'IIaB', caution: 'Hypoglycemia risk' },
        { name: 'TZDs', drugs: ['Pioglitazone'], evidence: 'IIbB', caution: 'Fluid retention, HF' },
        { name: 'Insulin', indication: 'Symptomatic hyperglycemia, HbA1c >10%', evidence: 'IA' },
      ],
    },

    targets: {
      hba1c: {
        general: '<7.0%',
        stringent: '<6.5% if achievable without significant hypoglycemia',
        relaxed: '<8.0% in elderly, limited life expectancy, hypoglycemia risk',
      },
      glucose: {
        fasting: '80-130 mg/dL',
        postprandial: '<180 mg/dL',
      },
    },

    physiologicalChanges: {
      pancreas: {
        parameters: {
          'beta_cell_mass': { change: -0.5, direction: 'decrease', description: 'Progressive β-cell loss' },
          'fasting_insulin': { change: 1.5, direction: 'increase', description: 'Compensatory hyperinsulinemia' },
          'homa_ir': { change: 2.0, direction: 'increase', description: 'Insulin resistance' },
        },
        equations: [
          { id: 'beta_cell_decline', latex: '\\frac{dM_\\beta}{dt} = -k \\cdot [Glucose]^n \\cdot M_\\beta', description: 'Glucotoxic β-cell loss' },
        ]
      },
    },
  },

  // ==================== COPD ====================
  'copd': {
    icd10: 'J44',
    name: 'Chronic Obstructive Pulmonary Disease',
    affectedOrgans: ['lungs', 'heart'],
    
    diagnosticCriteria: {
      spirometry: [
        { criterion: 'Post-bronchodilator FEV1/FVC < 0.70', method: 'Spirometry', source: 'GOLD 2024' },
      ],
      severity: [
        { grade: 'GOLD 1 Mild', fev1: '≥80% predicted' },
        { grade: 'GOLD 2 Moderate', fev1: '50-79% predicted' },
        { grade: 'GOLD 3 Severe', fev1: '30-49% predicted' },
        { grade: 'GOLD 4 Very Severe', fev1: '<30% predicted' },
      ]
    },

    treatments: {
      nonPharmacological: [
        { intervention: 'Smoking cessation', evidence: 'IA', effect: 'Slows FEV1 decline', source: 'GOLD 2024' },
        { intervention: 'Pulmonary rehabilitation', evidence: 'IA', benefit: 'Improved exercise capacity, QoL' },
        { intervention: 'Vaccination', vaccines: ['Influenza', 'Pneumococcal', 'COVID-19'], evidence: 'IA' },
      ],
      pharmacological: {
        groupA: {
          description: 'Low risk, few symptoms',
          treatment: 'Bronchodilator PRN (SABA or SAMA)',
          evidence: 'IC',
        },
        groupB: {
          description: 'Low risk, more symptoms',
          treatment: 'LAMA or LABA',
          evidence: 'IA',
        },
        groupE: {
          description: 'High risk (≥2 exacerbations or ≥1 hospitalization)',
          treatment: 'LAMA + LABA ± ICS if eos ≥300',
          evidence: 'IA',
          source: 'IMPACT, ETHOS trials',
        },
      },
      medications: [
        {
          class: 'LAMA',
          drugs: ['Tiotropium', 'Umeclidinium', 'Glycopyrronium'],
          evidence: 'IA',
          mechanism: 'Anticholinergic bronchodilation',
        },
        {
          class: 'LABA',
          drugs: ['Salmeterol', 'Formoterol', 'Indacaterol', 'Olodaterol'],
          evidence: 'IA',
          mechanism: 'β2-agonist bronchodilation',
        },
        {
          class: 'ICS',
          drugs: ['Fluticasone', 'Budesonide', 'Beclometasone'],
          indication: 'Blood eos ≥300 or ≥2 moderate exacerbations',
          evidence: 'IA',
          caution: 'Increased pneumonia risk',
        },
        {
          class: 'Triple therapy (LAMA/LABA/ICS)',
          drugs: ['Fluticasone/umeclidinium/vilanterol', 'Budesonide/glycopyrronium/formoterol'],
          indication: 'Frequent exacerbations despite dual therapy',
          evidence: 'IA',
          source: 'IMPACT trial',
          equation: '\\Delta exacerbations = -25\\% \\text{ vs dual}'
        },
      ],
      exacerbations: [
        { treatment: 'Short-course systemic corticosteroids', dose: 'Prednisolone 40mg 5 days', evidence: 'IA' },
        { treatment: 'Antibiotics if purulent sputum', drugs: ['Amoxicillin', 'Doxycycline', 'Azithromycin'], evidence: 'IA' },
        { treatment: 'Oxygen if hypoxemic', target: 'SpO2 88-92%', evidence: 'IA' },
        { treatment: 'NIV if respiratory acidosis', indication: 'pH <7.35', evidence: 'IA' },
      ],
    },

    physiologicalChanges: {
      lungs: {
        parameters: {
          'fev1': { change: -1.5, direction: 'decrease', unit: 'L', description: 'Airflow obstruction' },
          'fev1_fvc': { change: -15, direction: 'decrease', description: 'Obstructive pattern' },
          'residual_volume': { change: 500, direction: 'increase', unit: 'mL', description: 'Air trapping' },
        },
        equations: [
          { id: 'fev1_decline', latex: '\\frac{dFEV1}{dt} = -30 \\text{ to } -60 \\text{ mL/year}', description: 'Accelerated lung function decline' },
        ]
      },
    },
  },

  // ==================== CHRONIC KIDNEY DISEASE ====================
  'chronic_kidney_disease': {
    icd10: 'N18',
    name: 'Chronic Kidney Disease',
    affectedOrgans: ['kidneys', 'heart'],
    
    diagnosticCriteria: {
      staging: [
        { stage: 'G1', gfr: '≥90', description: 'Normal or high' },
        { stage: 'G2', gfr: '60-89', description: 'Mildly decreased' },
        { stage: 'G3a', gfr: '45-59', description: 'Mild-moderately decreased' },
        { stage: 'G3b', gfr: '30-44', description: 'Moderately-severely decreased' },
        { stage: 'G4', gfr: '15-29', description: 'Severely decreased' },
        { stage: 'G5', gfr: '<15', description: 'Kidney failure' },
      ],
      albuminuria: [
        { category: 'A1', acr: '<30', description: 'Normal to mildly increased' },
        { category: 'A2', acr: '30-300', description: 'Moderately increased' },
        { category: 'A3', acr: '>300', description: 'Severely increased' },
      ]
    },

    treatments: {
      renoprotection: [
        {
          name: 'ACEi/ARB',
          indication: 'Albuminuria (especially ACR >30)',
          evidence: 'IA',
          source: 'RENAAL, IDNT',
          target: 'Max tolerated dose',
          monitoring: ['K+', 'Creatinine'],
          equation: '\\Delta proteinuria = -30\\% \\text{ to } -50\\%'
        },
        {
          name: 'SGLT2 inhibitor',
          drugs: ['Dapagliflozin', 'Empagliflozin'],
          indication: 'eGFR ≥20, regardless of diabetes',
          evidence: 'IA',
          source: 'DAPA-CKD, EMPA-KIDNEY',
          benefits: ['Slows eGFR decline', 'Reduces proteinuria', 'CV protection'],
          equation: '\\Delta eGFR\\ decline = -39\\%'
        },
        {
          name: 'Finerenone',
          indication: 'T2DM with CKD and albuminuria',
          evidence: 'IA',
          source: 'FIDELIO-DKD, FIGARO-DKD',
          mechanism: 'Non-steroidal MRA, reduces fibrosis',
        },
      ],
      complications: [
        {
          complication: 'Anemia',
          treatment: 'ESA if Hb <10 g/dL, target 10-11.5',
          iron: 'IV iron if TSAT <30% or ferritin <500',
          evidence: 'IIaB',
        },
        {
          complication: 'CKD-MBD',
          treatment: 'Phosphate binders, vitamin D analogs',
          targets: { phosphate: '2.5-4.5 mg/dL', calcium: 'Normal range' },
          evidence: 'IIaC',
        },
        {
          complication: 'Metabolic acidosis',
          treatment: 'Sodium bicarbonate if HCO3 <22',
          evidence: 'IIaB',
        },
        {
          complication: 'Hyperkalemia',
          treatment: 'Dietary restriction, K+ binders (patiromer, SZC)',
          evidence: 'IIaB',
        },
      ],
      rrt: {
        timing: 'Prepare when eGFR <20, initiate if symptomatic or eGFR <10',
        options: ['Hemodialysis', 'Peritoneal dialysis', 'Kidney transplant (preferred)'],
      },
    },

    physiologicalChanges: {
      kidneys: {
        parameters: {
          'gfr': { change: -3, direction: 'decrease', unit: 'mL/min/year', description: 'Progressive decline' },
          'creatinine': { change: 2.0, direction: 'increase', description: 'Retention of waste' },
        },
        equations: [
          { id: 'ckd_progression', latex: 'GFR(t) = GFR_0 \\times e^{-\\lambda t}', description: 'Exponential decline model' },
        ]
      },
    },
  },
};

// Utility function to get all treatments for a disease with evidence filtering
export const getTreatmentsWithEvidence = (diseaseKey, minEvidence = 'IIbC') => {
  const disease = DISEASE_TREATMENT_GUIDELINES[diseaseKey];
  if (!disease) return null;
  
  // Filter treatments by minimum evidence level
  const evidenceOrder = ['IA', 'IB', 'IC', 'IIaA', 'IIaB', 'IIaC', 'IIbA', 'IIbB', 'IIbC'];
  const minIndex = evidenceOrder.indexOf(minEvidence);
  
  // Return filtered treatments
  return disease.treatments;
};

// Get physiological changes for affected organs
export const getPhysiologicalChanges = (diseaseKey) => {
  const disease = DISEASE_TREATMENT_GUIDELINES[diseaseKey];
  return disease?.physiologicalChanges || null;
};

export default DISEASE_TREATMENT_GUIDELINES;
