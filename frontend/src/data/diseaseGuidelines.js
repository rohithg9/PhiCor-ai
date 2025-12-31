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

  // ==================== IRON DEFICIENCY ANEMIA ====================
  'iron_deficiency_anemia': {
    icd10: 'D50.9',
    name: 'Iron Deficiency Anemia',
    affectedOrgans: ['blood', 'bonemarrow', 'heart'],
    
    diagnosticCriteria: {
      essential: [
        { criterion: 'Hemoglobin < 12 g/dL (women) or < 13 g/dL (men)', method: 'CBC', source: 'WHO Criteria' },
        { criterion: 'Ferritin < 30 ng/mL (or < 100 if CKD/inflammation)', method: 'Serum ferritin', source: 'BSH Guidelines 2021' },
      ],
      supportive: [
        { criterion: 'MCV < 80 fL (microcytic)', method: 'CBC', source: 'Standard' },
        { criterion: 'Transferrin saturation < 20%', method: 'Iron studies', source: 'Standard' },
        { criterion: 'Elevated TIBC > 400 μg/dL', method: 'Iron studies', source: 'Standard' },
        { criterion: 'Low reticulocyte hemoglobin content (CHr) < 28 pg', method: 'Advanced CBC', source: 'Novel marker' },
      ]
    },

    targets: {
      hemoglobin: { target: '12-14 g/dL', timeline: '4-8 weeks' },
      ferritin: { target: '> 100 ng/mL', timeline: '3-6 months' },
      transferrinSaturation: { target: '> 20%', timeline: '4-8 weeks' },
    },

    treatments: {
      firstLine: [
        {
          name: 'Oral Iron',
          drugs: ['Ferrous sulfate 325mg (65mg elemental)', 'Ferrous gluconate', 'Ferrous fumarate'],
          target: '100-200mg elemental iron/day',
          evidence: 'IA',
          source: 'BSH Guidelines 2021',
          mechanism: 'Replenishes iron stores for hemoglobin synthesis',
          contraindications: ['GI intolerance', 'Malabsorption', 'IBD active'],
          monitoring: ['Hemoglobin (4-8 weeks)', 'Ferritin (3 months)', 'Reticulocyte count (7-10 days)'],
          equation: '\\Delta Hgb = 1-2\\ g/dL\\ per\\ month'
        },
        {
          name: 'IV Iron',
          drugs: ['Ferric carboxymaltose (Ferinject)', 'Iron sucrose (Venofer)', 'Ferric derisomaltose (Monoferric)'],
          target: 'Calculate deficit: Weight × (Target Hgb - Actual Hgb) × 2.4 + 500mg',
          evidence: 'IB',
          source: 'BSH Guidelines, NICE CG114',
          indication: 'Oral iron intolerance, malabsorption, CKD, IBD, rapid replacement needed',
          mechanism: 'Bypasses GI absorption for rapid iron repletion',
          contraindications: ['Iron overload', 'Active infection', 'First trimester pregnancy'],
          monitoring: ['Ferritin/TSAT at 8 weeks', 'Hypersensitivity monitoring during infusion'],
          equation: 'Dose\\ (mg) = Weight \\times (15 - Hgb) \\times 2.4 + 500'
        },
      ],
      lifestyle: [
        { intervention: 'Dietary iron (red meat, leafy greens, fortified cereals)', evidence: 'IIaC', effect: '+1-2 mg/day absorbed', source: 'Dietary guidelines' },
        { intervention: 'Vitamin C with iron (enhances absorption)', evidence: 'IIaB', effect: '+30-50% absorption', source: 'Hallberg 1989' },
        { intervention: 'Avoid tea/coffee with meals (inhibits absorption)', evidence: 'IIaC', effect: '-40-60% absorption if taken together', source: 'Nutrition studies' },
      ],
      investigations: [
        {
          name: 'GI Investigation',
          indication: 'Men, postmenopausal women, or if no obvious source',
          tests: ['Upper GI endoscopy', 'Colonoscopy', 'Celiac serology'],
          evidence: 'IB',
          source: 'BSH Guidelines - malignancy exclusion essential',
        },
      ],
    },

    monitoringProtocol: {
      frequency: 'Hemoglobin at 2-4 weeks, then monthly until normal. Ferritin at 3 months.',
      parameters: ['Hemoglobin', 'MCV', 'Ferritin', 'Transferrin saturation', 'Reticulocyte count'],
      targets: {
        'Hemoglobin': '12-16 g/dL',
        'Ferritin': '> 100 ng/mL (continue iron 3 months after normal Hgb)',
        'TSAT': '> 20%',
      },
      responseAssessment: 'Reticulocyte response by day 7-10, Hgb rise 1g/dL per 2-3 weeks',
    },

    physiologicalChanges: {
      blood: {
        parameters: {
          'hemoglobin': { change: -4, direction: 'decrease', unit: 'g/dL', description: 'Reduced oxygen carrying capacity' },
          'MCV': { change: -15, direction: 'decrease', unit: 'fL', description: 'Microcytosis' },
          'ferritin': { change: -90, direction: 'decrease', unit: '%', description: 'Depleted iron stores' },
        },
        equations: [
          { id: 'iron_deficit', latex: 'Iron\\ deficit\\ (mg) = Weight_{kg} \\times (Target\\ Hgb - Actual\\ Hgb) \\times 2.4 + 500', description: 'Ganzoni formula for IV iron dosing' },
          { id: 'oxygen_delivery', latex: 'DO_2 = CO \\times 1.34 \\times Hgb \\times SaO_2', description: 'Oxygen delivery equation' },
        ]
      },
    },
  },

  // ==================== SICKLE CELL DISEASE ====================
  'sickle_cell_disease': {
    icd10: 'D57.1',
    name: 'Sickle Cell Disease (HbSS)',
    affectedOrgans: ['blood', 'spleen', 'bonemarrow', 'kidneys', 'brain', 'lungs'],
    
    diagnosticCriteria: {
      essential: [
        { criterion: 'Hemoglobin electrophoresis showing HbS > 80%', method: 'Hemoglobin HPLC', source: 'NICE NG143' },
        { criterion: 'Genetic confirmation (βS/βS)', method: 'Molecular genetics', source: 'NICE NG143' },
      ],
      supportive: [
        { criterion: 'Chronic hemolytic anemia (Hgb 6-9 g/dL)', method: 'CBC', source: 'Standard' },
        { criterion: 'Sickle cells on blood smear', method: 'Peripheral smear', source: 'Morphology' },
        { criterion: 'Elevated reticulocyte count (10-20%)', method: 'CBC', source: 'Compensatory' },
        { criterion: 'Low haptoglobin, elevated LDH/bilirubin', method: 'Hemolysis markers', source: 'Standard' },
      ]
    },

    treatments: {
      diseaseModifying: [
        {
          name: 'Hydroxyurea',
          drugs: ['Hydroxyurea (Hydrea, Siklos)'],
          target: 'Maximum tolerated dose (15-35 mg/kg/day)',
          evidence: 'IA',
          source: 'MSH Study, BABY HUG',
          mechanism: 'Increases HbF production, reduces sickling',
          contraindications: ['Pregnancy', 'Severe cytopenias'],
          monitoring: ['CBC every 2-4 weeks during titration', 'HbF levels'],
          equation: '\\Delta crisis\\ rate = -50\\%'
        },
        {
          name: 'L-Glutamine',
          drugs: ['L-Glutamine (Endari)'],
          target: '5-15g BID based on weight',
          evidence: 'IIaB',
          source: 'FDA approved 2017',
          mechanism: 'Reduces oxidative stress in sickle RBCs',
        },
        {
          name: 'Voxelotor',
          drugs: ['Voxelotor (Oxbryta)'],
          target: '1500mg daily',
          evidence: 'IIaB',
          source: 'HOPE trial',
          mechanism: 'Increases Hgb-oxygen affinity, reduces sickling',
        },
        {
          name: 'Crizanlizumab',
          drugs: ['Crizanlizumab (Adakveo)'],
          target: '5mg/kg IV every 4 weeks',
          evidence: 'IIaB',
          source: 'SUSTAIN trial',
          mechanism: 'Anti-P-selectin antibody, prevents vaso-occlusion',
        },
      ],
      acuteManagement: [
        {
          name: 'Vaso-occlusive Crisis',
          treatment: 'IV fluids, opioid analgesia (morphine/hydromorphone), NSAIDs, oxygen if hypoxic',
          evidence: 'IC',
          source: 'NICE NG143',
        },
        {
          name: 'Acute Chest Syndrome',
          treatment: 'Antibiotics (cover atypicals), exchange transfusion if severe, bronchodilators, incentive spirometry',
          evidence: 'IC',
          source: 'NICE NG143',
          indication: 'New infiltrate + respiratory symptoms ± fever',
        },
        {
          name: 'Stroke Prevention',
          treatment: 'Chronic transfusion program (target HbS < 30%)',
          evidence: 'IA',
          source: 'STOP trial',
          indication: 'Abnormal TCD (velocity > 200 cm/s)',
        },
      ],
      curative: [
        {
          name: 'Allogeneic Stem Cell Transplant',
          indication: 'Matched sibling donor available, severe disease',
          evidence: 'IIaB',
          source: 'Expert consensus',
          notes: 'Only curative option currently',
        },
        {
          name: 'Gene Therapy',
          drugs: ['Exagamglogene autotemcel (Casgevy)', 'Lovotibeglogene autotemcel (Lyfgenia)'],
          evidence: 'IIaB',
          source: 'FDA approved 2023',
          mechanism: 'Gene editing/addition to increase HbF or correct mutation',
        },
      ],
    },

    monitoringProtocol: {
      frequency: 'Clinic every 3-6 months, annual comprehensive review',
      parameters: ['CBC', 'Reticulocyte count', 'HbF level', 'LDH', 'Renal function', 'TCD (children)', 'Echocardiogram'],
      screenings: {
        'TCD': 'Annual age 2-16 for stroke risk',
        'Eye exam': 'Annual for retinopathy',
        'Renal': 'Annual for sickle nephropathy',
        'Hip MRI': 'If symptoms for AVN',
      },
    },

    physiologicalChanges: {
      blood: {
        parameters: {
          'hemoglobin': { change: -6, direction: 'decrease', unit: 'g/dL', description: 'Chronic hemolysis' },
          'reticulocytes': { change: 10, direction: 'increase', unit: 'x normal', description: 'Compensatory' },
        },
        equations: [
          { id: 'hbs_polymerization', latex: 't_{delay} \\propto [HbS]^{-30}', description: 'Polymerization delay time depends on HbS concentration' },
        ]
      },
    },
  },

  // ==================== ACUTE LYMPHOBLASTIC LEUKEMIA ====================
  'acute_lymphoblastic_leukemia': {
    icd10: 'C91.0',
    name: 'Acute Lymphoblastic Leukemia (ALL)',
    affectedOrgans: ['bonemarrow', 'blood', 'lymphatic', 'brain', 'spleen', 'liver'],
    
    diagnosticCriteria: {
      essential: [
        { criterion: 'Bone marrow blasts ≥ 20%', method: 'Bone marrow biopsy', source: 'WHO 2022' },
        { criterion: 'Lymphoid lineage confirmed', method: 'Flow cytometry (CD19+, CD10+, TdT+)', source: 'WHO 2022' },
      ],
      riskStratification: [
        { criterion: 'Standard risk: Age 1-9, WBC < 50K, favorable cytogenetics', source: 'NCI criteria' },
        { criterion: 'High risk: Age < 1 or > 10, WBC ≥ 50K, CNS disease, t(9;22), MLL', source: 'NCI criteria' },
      ]
    },

    treatments: {
      induction: [
        {
          name: 'Induction Chemotherapy',
          drugs: ['Vincristine', 'Prednisone/Dexamethasone', 'Asparaginase', 'Daunorubicin (high-risk)'],
          duration: '4-6 weeks',
          evidence: 'IA',
          source: 'COG protocols, UKALL',
          target: 'Complete remission with MRD negativity',
          monitoring: ['CBC daily initially', 'Coagulation (asparaginase)', 'Tumor lysis labs'],
        },
      ],
      consolidation: [
        {
          name: 'Consolidation/Intensification',
          drugs: ['High-dose Methotrexate', 'Cytarabine', '6-Mercaptopurine'],
          duration: '6-9 months',
          evidence: 'IA',
          source: 'COG protocols',
        },
        {
          name: 'CNS Prophylaxis',
          treatment: 'Intrathecal methotrexate ± cytarabine ± hydrocortisone',
          evidence: 'IA',
          source: 'Essential component - prevents CNS relapse',
        },
      ],
      maintenance: [
        {
          name: 'Maintenance Therapy',
          drugs: ['6-Mercaptopurine daily', 'Methotrexate weekly', 'Vincristine/steroid pulses monthly'],
          duration: '2-3 years total therapy',
          evidence: 'IA',
          source: 'Standard of care',
        },
      ],
      targeted: [
        {
          name: 'Ph+ ALL (BCR-ABL1+)',
          drugs: ['Imatinib', 'Dasatinib', 'Ponatinib'],
          evidence: 'IA',
          source: 'Add TKI to chemotherapy - improves outcomes',
        },
        {
          name: 'Relapsed/Refractory',
          drugs: ['Blinatumomab (BiTE antibody)', 'Inotuzumab ozogamicin', 'CAR-T cell therapy (Tisagenlecleucel)'],
          evidence: 'IB',
          source: 'FDA approved for R/R B-ALL',
        },
      ],
    },

    monitoringProtocol: {
      frequency: 'CBC 2-3x weekly during intensive therapy',
      parameters: ['CBC with differential', 'Comprehensive metabolic panel', 'LDH', 'Uric acid', 'Coagulation'],
      mrd: 'Minimal Residual Disease assessment at day 29, end of induction, and consolidation',
    },
  },

  // ==================== MULTIPLE MYELOMA ====================
  'multiple_myeloma': {
    icd10: 'C90.0',
    name: 'Multiple Myeloma',
    affectedOrgans: ['bonemarrow', 'blood', 'kidneys'],
    
    diagnosticCriteria: {
      essential: [
        { criterion: 'Clonal bone marrow plasma cells ≥ 10%', method: 'Bone marrow biopsy', source: 'IMWG 2014' },
        { criterion: 'CRAB criteria (any one):', description: 'Calcium > 11, Renal Cr > 2, Anemia Hgb < 10, Bone lesions ≥ 1', source: 'IMWG' },
      ],
      biomarkers: [
        { criterion: 'Serum M-protein present', method: 'SPEP/IFE', source: 'Standard' },
        { criterion: 'Abnormal free light chain ratio', method: 'Serum FLC', source: 'Standard' },
        { criterion: 'Urine M-protein', method: 'UPEP/IFE', source: 'Standard' },
      ],
      staging: [
        { stage: 'ISS I', criteria: 'β2M < 3.5, Albumin ≥ 3.5', source: 'International Staging System' },
        { stage: 'ISS II', criteria: 'Not I or III', source: 'International Staging System' },
        { stage: 'ISS III', criteria: 'β2M ≥ 5.5', source: 'International Staging System' },
      ]
    },

    treatments: {
      firstLine: [
        {
          name: 'VRd (Transplant eligible)',
          drugs: ['Bortezomib (Velcade)', 'Lenalidomide (Revlimid)', 'Dexamethasone'],
          duration: '3-4 cycles induction → ASCT → consolidation → maintenance',
          evidence: 'IA',
          source: 'SWOG S0777, IFM studies',
        },
        {
          name: 'DaraVRd',
          drugs: ['Daratumumab', 'Bortezomib', 'Lenalidomide', 'Dexamethasone'],
          evidence: 'IA',
          source: 'GRIFFIN, CASSIOPEIA trials',
          notes: 'Increasingly first-line for fit patients',
        },
        {
          name: 'VRd-lite (Transplant ineligible)',
          drugs: ['Bortezomib', 'Lenalidomide', 'Dexamethasone'],
          duration: 'Until progression',
          evidence: 'IA',
          source: 'SWOG S0777',
        },
      ],
      maintenance: [
        {
          name: 'Lenalidomide maintenance',
          target: '10-15mg days 1-21 of 28',
          evidence: 'IA',
          source: 'Meta-analysis shows OS benefit',
        },
      ],
      relapsed: [
        {
          name: 'DPd',
          drugs: ['Daratumumab', 'Pomalidomide', 'Dexamethasone'],
          evidence: 'IA',
          source: 'APOLLO trial',
        },
        {
          name: 'CAR-T',
          drugs: ['Idecabtagene vicleucel (Abecma)', 'Ciltacabtagene autoleucel (Carvykti)'],
          indication: '≥ 4 prior lines including PI, IMiD, anti-CD38',
          evidence: 'IB',
          source: 'FDA approved',
        },
        {
          name: 'Bispecifics',
          drugs: ['Teclistamab', 'Elranatamab', 'Talquetamab'],
          evidence: 'IB',
          source: 'MajesTEC-1, MagnetisMM-3',
        },
      ],
      supportive: [
        {
          name: 'Bone-targeted therapy',
          drugs: ['Zoledronic acid monthly', 'Denosumab'],
          evidence: 'IA',
          source: 'MRC IX',
        },
      ],
    },

    monitoringProtocol: {
      frequency: 'Every 1-3 months during treatment',
      parameters: ['CBC', 'Creatinine', 'Calcium', 'SPEP', 'Serum FLC', 'β2-microglobulin'],
      response: 'IMWG response criteria: sCR, CR, VGPR, PR, SD, PD',
    },
  },

  // ==================== DOWN SYNDROME ====================
  'down_syndrome': {
    icd10: 'Q90.9',
    name: 'Down Syndrome (Trisomy 21)',
    affectedOrgans: ['brain', 'heart', 'thyroid', 'blood', 'gi_tract'],
    
    diagnosticCriteria: {
      essential: [
        { criterion: 'Karyotype confirming trisomy 21', method: 'Chromosomal analysis', source: 'Gold standard' },
        { criterion: '47,XX+21 or 47,XY+21 (95%)', method: 'Standard karyotype', source: 'Most common' },
      ],
      prenatal: [
        { criterion: 'First trimester combined screening (PAPP-A, hCG, NT)', method: 'Blood + Ultrasound', source: 'Detection rate ~90%' },
        { criterion: 'Cell-free DNA screening (NIPT)', method: 'Maternal blood', source: 'Detection rate >99%' },
        { criterion: 'Diagnostic: CVS (10-13 weeks) or Amniocentesis (15-20 weeks)', method: 'Invasive testing', source: 'Definitive' },
      ]
    },

    treatments: {
      cardiacScreening: [
        {
          name: 'Echocardiogram',
          indication: 'All newborns with Down syndrome',
          evidence: 'IA',
          source: 'AAP Guidelines',
          notes: '40-50% have congenital heart defects (AVSD, VSD, ASD)',
        },
        {
          name: 'Surgical repair',
          indication: 'AVSD repair typically at 3-6 months',
          evidence: 'IA',
          source: 'Standard surgical timing',
        },
      ],
      thyroidScreening: [
        {
          name: 'TSH monitoring',
          frequency: 'Newborn, 6 months, 12 months, then annually',
          evidence: 'IA',
          source: 'AAP Guidelines',
          notes: '40% develop hypothyroidism',
        },
        {
          name: 'Levothyroxine',
          indication: 'If TSH elevated',
          target: 'TSH in normal range',
          evidence: 'IA',
        },
      ],
      hematologic: [
        {
          name: 'TMD monitoring',
          description: 'Transient myeloproliferative disorder in 10% of newborns',
          management: 'Usually self-resolves; 20% progress to AMKL by age 3',
          evidence: 'IIaB',
        },
        {
          name: 'Leukemia surveillance',
          description: '10-20x increased risk of ALL and AML',
          evidence: 'IIaB',
        },
      ],
      developmental: [
        {
          name: 'Early Intervention',
          services: ['Physical therapy', 'Occupational therapy', 'Speech therapy'],
          timing: 'Start within first months of life',
          evidence: 'IA',
          source: 'Improves developmental outcomes',
        },
      ],
      otherScreening: [
        { name: 'Vision', frequency: 'By 6 months, then annually', condition: 'Cataracts, refractive errors, strabismus' },
        { name: 'Hearing', frequency: 'Newborn and every 6 months until age 3, then annually', condition: 'Conductive/sensorineural loss' },
        { name: 'Celiac disease', frequency: 'Screen at age 2, repeat if symptomatic', condition: '5-15% prevalence' },
        { name: 'Atlantoaxial instability', frequency: 'X-ray if symptomatic', condition: 'Risk during intubation/sports' },
        { name: 'Sleep study', frequency: 'By age 4', condition: 'Obstructive sleep apnea in 50-75%' },
      ],
    },

    monitoringProtocol: {
      frequency: 'Follow AAP Health Supervision Guidelines for Down Syndrome',
      parameters: ['TSH', 'CBC', 'Hearing', 'Vision', 'Growth (DS-specific charts)', 'Development'],
    },
  },

  // ==================== MARFAN SYNDROME ====================
  'marfan_syndrome': {
    icd10: 'Q87.4',
    name: 'Marfan Syndrome',
    affectedOrgans: ['heart', 'lungs', 'brain'],
    
    diagnosticCriteria: {
      ghentCriteria2010: [
        { criterion: 'Aortic root Z-score ≥ 2 + ectopia lentis = Marfan', method: 'Echo + Slit lamp', source: 'Ghent 2010' },
        { criterion: 'Aortic root Z-score ≥ 2 + FBN1 mutation = Marfan', method: 'Echo + Genetic', source: 'Ghent 2010' },
        { criterion: 'Aortic root Z-score ≥ 2 + systemic score ≥ 7 = Marfan', method: 'Echo + Clinical', source: 'Ghent 2010' },
        { criterion: 'Ectopia lentis + FBN1 with known aortic root dilation = Marfan', method: 'Eye + Genetic', source: 'Ghent 2010' },
      ],
      systemicScore: [
        { feature: 'Wrist AND thumb sign', points: 3 },
        { feature: 'Wrist OR thumb sign', points: 1 },
        { feature: 'Pectus carinatum', points: 2 },
        { feature: 'Pectus excavatum or chest asymmetry', points: 1 },
        { feature: 'Hindfoot deformity', points: 2 },
        { feature: 'Plain pes planus', points: 1 },
        { feature: 'Dural ectasia', points: 2 },
        { feature: 'Pneumothorax', points: 2 },
        { feature: 'Protrusio acetabuli', points: 2 },
        { feature: 'Reduced US/LS AND arm span/height AND no severe scoliosis', points: 1 },
        { feature: 'Scoliosis or thoracolumbar kyphosis', points: 1 },
        { feature: 'Reduced elbow extension', points: 1 },
        { feature: 'Facial features (3 of 5)', points: 1 },
        { feature: 'Skin striae', points: 1 },
        { feature: 'Myopia > 3 diopters', points: 1 },
        { feature: 'Mitral valve prolapse', points: 1 },
      ]
    },

    treatments: {
      aorticManagement: [
        {
          name: 'Beta-blocker therapy',
          drugs: ['Atenolol', 'Metoprolol', 'Propranolol'],
          target: 'HR < 60-70 bpm',
          evidence: 'IB',
          source: 'Shores et al. NEJM 1994',
          mechanism: 'Reduces rate of aortic dilation',
        },
        {
          name: 'ARB therapy',
          drugs: ['Losartan'],
          target: 'Max tolerated dose',
          evidence: 'IIaB',
          source: 'COMPARE trial (added benefit with β-blocker)',
          mechanism: 'TGF-β antagonism may slow dilation',
        },
        {
          name: 'Prophylactic aortic surgery',
          indication: 'Aortic root ≥ 50mm (≥45mm if family history of dissection, rapid growth >3mm/yr, or severe AR)',
          procedure: 'Valve-sparing root replacement (David) preferred',
          evidence: 'IB',
          source: 'ACC/AHA Aortic Guidelines 2022',
        },
      ],
      restrictions: [
        {
          name: 'Activity restrictions',
          avoid: ['Contact sports', 'Competitive athletics', 'Isometric exercise', 'Heavy lifting'],
          allowed: 'Low-moderate intensity aerobic exercise',
          evidence: 'IC',
          source: 'Expert consensus',
        },
      ],
      pregnancy: [
        {
          name: 'Pre-conception counseling',
          recommendation: 'Aortic root < 40mm preferred before pregnancy',
          evidence: 'IIaC',
          monitoring: 'Monthly echo during pregnancy and 6 months postpartum',
        },
      ],
    },

    monitoringProtocol: {
      frequency: 'Annual echo; more frequent if aortic root > 45mm or rapid growth',
      parameters: ['Aortic root diameter (sinus of Valsalva)', 'Ascending aorta', 'MV assessment', 'LV function'],
      imaging: 'Consider CT/MRA for entire aorta at diagnosis and periodically',
    },
  },

  // ==================== HEMOPHILIA A ====================
  'hemophilia_a': {
    icd10: 'D66',
    name: 'Hemophilia A (Factor VIII Deficiency)',
    affectedOrgans: ['blood', 'bonemarrow'],
    
    diagnosticCriteria: {
      essential: [
        { criterion: 'Prolonged PTT with normal PT', method: 'Coagulation studies', source: 'Standard' },
        { criterion: 'Factor VIII activity < 40%', method: 'Factor VIII assay', source: 'Diagnostic' },
      ],
      severity: [
        { severity: 'Severe', criteria: 'Factor VIII < 1%', bleeding: 'Spontaneous bleeds, hemarthrosis' },
        { severity: 'Moderate', criteria: 'Factor VIII 1-5%', bleeding: 'Prolonged bleeding, occasional spontaneous' },
        { severity: 'Mild', criteria: 'Factor VIII 5-40%', bleeding: 'Bleeding with trauma/surgery only' },
      ]
    },

    treatments: {
      factorReplacement: [
        {
          name: 'Factor VIII concentrate',
          products: ['Recombinant: Advate, Eloctate (extended half-life)', 'Plasma-derived: Hemofil-M'],
          dosing: 'Each unit/kg raises FVIII ~2%. Dose = (Target% - Baseline%) × Weight/2',
          evidence: 'IA',
          source: 'WFH Guidelines 2020',
        },
        {
          name: 'Extended half-life FVIII',
          products: ['Efmoroctocog alfa (Eloctate)', 'Rurioctocog alfa pegol (Adynovate)'],
          advantage: 'Less frequent dosing (2-3x/week vs 3-4x)',
          evidence: 'IB',
        },
      ],
      prophylaxis: [
        {
          name: 'Primary prophylaxis',
          indication: 'Severe hemophilia - start before age 3 or after first joint bleed',
          target: 'FVIII trough > 1-3%',
          frequency: '3-4x weekly (standard) or 2x weekly (EHL)',
          evidence: 'IA',
          source: 'Joint Protection Study',
        },
      ],
      novel: [
        {
          name: 'Emicizumab (Hemlibra)',
          mechanism: 'Bispecific antibody mimicking FVIII function',
          dosing: 'Weekly, every 2 weeks, or monthly SC',
          indication: 'Prophylaxis with or without inhibitors',
          evidence: 'IA',
          source: 'HAVEN 1-4 trials',
        },
        {
          name: 'Gene therapy',
          products: ['Valoctocogene roxaparvovec (Roctavian)'],
          evidence: 'IIaB',
          source: 'FDA approved 2023',
          notes: 'Single infusion, durable FVIII expression',
        },
      ],
      bleedManagement: [
        {
          name: 'Acute bleed treatment',
          dosing: 'Minor bleed: 20-30 IU/kg. Major bleed: 40-50 IU/kg. Life-threatening: 50+ IU/kg',
          target: 'FVIII level based on bleed severity',
        },
        {
          name: 'Desmopressin (DDAVP)',
          indication: 'Mild hemophilia only (may raise FVIII 2-5x)',
          dose: '0.3 mcg/kg IV/SC',
          evidence: 'IIaB',
        },
      ],
    },

    monitoringProtocol: {
      frequency: 'Every 3-6 months at Hemophilia Treatment Center',
      parameters: ['Factor VIII levels', 'Inhibitor screen (Bethesda assay)', 'Joint health assessment'],
      imaging: 'MRI for joint assessment in target joints',
    },

    physiologicalChanges: {
      blood: {
        parameters: {
          'PTT': { change: 2.5, direction: 'increase', unit: 'x normal', description: 'Intrinsic pathway prolongation' },
          'Factor VIII': { change: -95, direction: 'decrease', unit: '%', description: 'Factor deficiency' },
        },
        equations: [
          { id: 'fviii_dosing', latex: 'Dose\\ (IU) = \\frac{Target\\% - Baseline\\%}{2} \\times Weight_{kg}', description: 'FVIII dosing calculation' },
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
