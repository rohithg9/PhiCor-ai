// ============================================================
// DISEASE DATA TEMPLATE SYSTEM
// Auto-generates baseline clinical data for all conditions
// Based on disease category, affected organs, and ICD-10 classification
// ============================================================

// Standard parameter modifications by organ system
export const ORGAN_MODIFICATION_TEMPLATES = {
  heart: {
    // Heart Failure / Cardiomyopathy pattern
    heart_failure: {
      lv_ef: { multiplier: 0.6, note: "Reduced ejection fraction" },
      lv_edv: { multiplier: 1.4, note: "LV dilation" },
      lv_esv: { multiplier: 1.75, note: "Increased end-systolic volume" },
      lv_mass: { multiplier: 1.3, note: "LV hypertrophy" },
      cardiac_output: { multiplier: 0.7, note: "Reduced cardiac output" },
      stroke_volume: { multiplier: 0.65, note: "Reduced stroke volume" },
    },
    // Hypertrophic pattern
    hypertrophic: {
      lv_ef: { multiplier: 1.1, note: "Hyperdynamic function" },
      lv_mass: { multiplier: 1.5, note: "Significant hypertrophy" },
      ivs_thickness: { multiplier: 1.8, note: "Septal hypertrophy" },
      lv_wall_thickness: { multiplier: 1.4, note: "Wall thickening" },
      e_a_ratio: { multiplier: 0.6, note: "Diastolic dysfunction" },
    },
    // Ischemic pattern
    ischemic: {
      lv_ef: { multiplier: 0.75, note: "Regional wall motion abnormality" },
      wall_motion_score: { multiplier: 1.5, note: "Abnormal segments" },
      troponin: { multiplier: 100, note: "Myocardial injury" },
    },
    // Arrhythmia pattern
    arrhythmia: {
      heart_rate: { multiplier: 1.4, note: "Tachyarrhythmia" },
      cardiac_output: { multiplier: 0.85, note: "Reduced due to irregular rhythm" },
      la_volume: { multiplier: 1.3, note: "LA enlargement" },
    },
    // Valvular pattern
    valvular: {
      valve_area: { multiplier: 0.5, note: "Stenotic valve" },
      gradient: { multiplier: 3, note: "Increased pressure gradient" },
      regurgitant_volume: { multiplier: 2, note: "Regurgitation" },
    },
    // Pericardial pattern
    pericardial: {
      pericardial_effusion: { absolute: 300, note: "Effusion volume mL" },
      ra_pressure: { multiplier: 2, note: "Elevated filling pressures" },
    },
    // Congenital pattern
    congenital: {
      shunt_ratio: { absolute: 1.5, note: "Qp:Qs ratio" },
      oxygen_saturation: { multiplier: 0.9, note: "Reduced if R-L shunt" },
    },
  },
  
  lungs: {
    // Obstructive pattern (COPD, Asthma)
    obstructive: {
      fev1: { multiplier: 0.5, note: "Airflow obstruction" },
      fev1_fvc: { multiplier: 0.7, note: "Reduced ratio" },
      residual_volume: { multiplier: 1.5, note: "Air trapping" },
      dlco: { multiplier: 0.7, note: "Reduced gas transfer" },
    },
    // Restrictive pattern (ILD, Fibrosis)
    restrictive: {
      fvc: { multiplier: 0.6, note: "Reduced lung volumes" },
      tlc: { multiplier: 0.65, note: "Reduced total capacity" },
      dlco: { multiplier: 0.5, note: "Severely reduced diffusion" },
      compliance: { multiplier: 0.5, note: "Stiff lungs" },
    },
    // Vascular pattern (PE, PAH)
    vascular: {
      pa_pressure: { multiplier: 2, note: "Pulmonary hypertension" },
      pvr: { multiplier: 3, note: "Increased vascular resistance" },
      v_q_mismatch: { multiplier: 2, note: "Ventilation-perfusion mismatch" },
      d_dimer: { multiplier: 10, note: "Elevated if acute PE" },
    },
    // Infectious pattern
    infectious: {
      wbc: { multiplier: 1.5, note: "Leukocytosis" },
      crp: { multiplier: 10, note: "Inflammation" },
      oxygen_saturation: { multiplier: 0.92, note: "Hypoxemia" },
    },
  },
  
  kidneys: {
    // CKD pattern
    ckd: {
      gfr: { multiplier: 0.4, note: "Reduced filtration" },
      creatinine: { multiplier: 2.5, note: "Elevated creatinine" },
      bun: { multiplier: 2, note: "Elevated BUN" },
      urine_protein: { multiplier: 5, note: "Proteinuria" },
      hemoglobin: { multiplier: 0.85, note: "Anemia of CKD" },
    },
    // Acute kidney injury
    aki: {
      gfr: { multiplier: 0.3, note: "Acute decline" },
      creatinine: { multiplier: 3, note: "Rapid rise" },
      urine_output: { multiplier: 0.3, note: "Oliguria" },
      potassium: { multiplier: 1.3, note: "Hyperkalemia" },
    },
    // Nephrotic pattern
    nephrotic: {
      urine_protein: { multiplier: 10, note: "Massive proteinuria >3.5g/day" },
      albumin: { multiplier: 0.5, note: "Hypoalbuminemia" },
      cholesterol: { multiplier: 1.5, note: "Hyperlipidemia" },
    },
  },
  
  liver: {
    // Cirrhosis pattern
    cirrhosis: {
      albumin: { multiplier: 0.6, note: "Reduced synthesis" },
      inr: { multiplier: 1.5, note: "Coagulopathy" },
      bilirubin: { multiplier: 3, note: "Hyperbilirubinemia" },
      portal_pressure: { multiplier: 2, note: "Portal hypertension" },
      platelet_count: { multiplier: 0.5, note: "Thrombocytopenia" },
    },
    // Hepatitis pattern
    hepatitis: {
      alt: { multiplier: 20, note: "Elevated transaminases" },
      ast: { multiplier: 15, note: "Hepatocellular injury" },
      bilirubin: { multiplier: 2, note: "Jaundice" },
    },
  },
  
  brain: {
    // Stroke pattern
    stroke: {
      cbf: { multiplier: 0.3, note: "Ischemic penumbra" },
      icp: { multiplier: 1.5, note: "Elevated if edema" },
      nihss: { absolute: 8, note: "Moderate stroke severity" },
    },
    // Neurodegenerative
    neurodegenerative: {
      brain_volume: { multiplier: 0.85, note: "Atrophy" },
      neuron_count: { multiplier: 0.7, note: "Neuronal loss" },
      csf_protein: { multiplier: 1.5, note: "Abnormal biomarkers" },
    },
  },
  
  pancreas: {
    // Diabetes pattern
    diabetes: {
      fasting_glucose: { multiplier: 1.5, note: "Hyperglycemia" },
      hba1c: { multiplier: 1.3, note: "Poor glycemic control" },
      beta_cell_mass: { multiplier: 0.5, note: "β-cell loss" },
      insulin_sensitivity: { multiplier: 0.4, note: "Insulin resistance" },
    },
    // Pancreatitis pattern
    pancreatitis: {
      amylase: { multiplier: 5, note: "Elevated enzymes" },
      lipase: { multiplier: 8, note: "More specific marker" },
      crp: { multiplier: 15, note: "Inflammation" },
    },
  },
};

// Standard laboratory findings by category
export const LAB_TEMPLATES = {
  cardiac: [
    { name: "Troponin I/T", unit: "ng/mL", normalRange: "<0.04", significance: "Myocardial injury marker" },
    { name: "BNP", unit: "pg/mL", normalRange: "<100", significance: "Heart failure marker" },
    { name: "NT-proBNP", unit: "pg/mL", normalRange: "<125", significance: "Heart failure marker" },
    { name: "CK-MB", unit: "U/L", normalRange: "<25", significance: "Myocardial necrosis" },
    { name: "D-dimer", unit: "ng/mL", normalRange: "<500", significance: "Thrombosis marker" },
    { name: "Lipid panel", unit: "mg/dL", normalRange: "LDL<100", significance: "Cardiovascular risk" },
  ],
  respiratory: [
    { name: "ABG - PaO2", unit: "mmHg", normalRange: "80-100", significance: "Oxygenation" },
    { name: "ABG - PaCO2", unit: "mmHg", normalRange: "35-45", significance: "Ventilation" },
    { name: "ABG - pH", unit: "", normalRange: "7.35-7.45", significance: "Acid-base status" },
    { name: "Procalcitonin", unit: "ng/mL", normalRange: "<0.5", significance: "Bacterial infection" },
    { name: "D-dimer", unit: "ng/mL", normalRange: "<500", significance: "PE screening" },
    { name: "Alpha-1 antitrypsin", unit: "mg/dL", normalRange: "100-300", significance: "COPD risk" },
  ],
  renal: [
    { name: "Creatinine", unit: "mg/dL", normalRange: "0.7-1.3", significance: "Kidney function" },
    { name: "BUN", unit: "mg/dL", normalRange: "7-20", significance: "Kidney function" },
    { name: "eGFR", unit: "mL/min/1.73m²", normalRange: ">90", significance: "Filtration rate" },
    { name: "Urine protein/creatinine", unit: "mg/g", normalRange: "<150", significance: "Proteinuria" },
    { name: "Potassium", unit: "mEq/L", normalRange: "3.5-5.0", significance: "Electrolyte balance" },
    { name: "Phosphorus", unit: "mg/dL", normalRange: "2.5-4.5", significance: "CKD-MBD marker" },
  ],
  hepatic: [
    { name: "ALT", unit: "U/L", normalRange: "7-56", significance: "Hepatocellular injury" },
    { name: "AST", unit: "U/L", normalRange: "10-40", significance: "Hepatocellular injury" },
    { name: "Bilirubin (total)", unit: "mg/dL", normalRange: "0.1-1.2", significance: "Liver excretory function" },
    { name: "Albumin", unit: "g/dL", normalRange: "3.5-5.0", significance: "Synthetic function" },
    { name: "INR", unit: "", normalRange: "0.9-1.1", significance: "Coagulation" },
    { name: "Alkaline phosphatase", unit: "U/L", normalRange: "44-147", significance: "Cholestasis marker" },
  ],
  metabolic: [
    { name: "Fasting glucose", unit: "mg/dL", normalRange: "70-100", significance: "Glycemic status" },
    { name: "HbA1c", unit: "%", normalRange: "<5.7", significance: "Long-term glucose control" },
    { name: "Fasting insulin", unit: "μU/mL", normalRange: "2-20", significance: "Insulin secretion" },
    { name: "C-peptide", unit: "ng/mL", normalRange: "0.5-2.0", significance: "Endogenous insulin" },
    { name: "Lipid panel", unit: "mg/dL", normalRange: "TG<150", significance: "Metabolic risk" },
    { name: "Uric acid", unit: "mg/dL", normalRange: "3.5-7.2", significance: "Metabolic syndrome" },
  ],
  inflammatory: [
    { name: "CRP", unit: "mg/L", normalRange: "<3", significance: "Inflammation" },
    { name: "ESR", unit: "mm/hr", normalRange: "0-20", significance: "Inflammation" },
    { name: "WBC count", unit: "×10⁹/L", normalRange: "4-11", significance: "Infection/inflammation" },
    { name: "Procalcitonin", unit: "ng/mL", normalRange: "<0.5", significance: "Bacterial infection" },
    { name: "Ferritin", unit: "ng/mL", normalRange: "20-200", significance: "Iron/inflammation" },
    { name: "IL-6", unit: "pg/mL", normalRange: "<7", significance: "Cytokine storm" },
  ],
};

// Standard imaging findings by organ
export const IMAGING_TEMPLATES = {
  heart: {
    echocardiography: [
      "LV systolic function assessment",
      "Wall motion abnormalities",
      "Valvular assessment",
      "Chamber dimensions",
      "Diastolic function (E/A ratio, E/e')",
      "Pericardial assessment",
    ],
    cardiac_mri: [
      "Late gadolinium enhancement",
      "T1/T2 mapping",
      "Perfusion imaging",
      "Accurate volumetrics",
      "Tissue characterization",
    ],
    coronary_ct: [
      "Coronary artery calcium score",
      "Coronary stenosis assessment",
      "Plaque characterization",
    ],
    chest_xray: [
      "Cardiomegaly assessment",
      "Pulmonary congestion",
      "Pleural effusions",
    ],
  },
  lungs: {
    chest_xray: [
      "Infiltrates/consolidation",
      "Hyperinflation",
      "Pleural abnormalities",
      "Nodules/masses",
    ],
    ct_chest: [
      "Ground-glass opacities",
      "Honeycombing pattern",
      "Emphysematous changes",
      "Pulmonary nodules",
      "Lymphadenopathy",
      "Bronchiectasis",
    ],
    ct_angiography: [
      "Pulmonary embolism",
      "Pulmonary artery enlargement",
      "Vascular abnormalities",
    ],
    v_q_scan: [
      "Ventilation-perfusion mismatch",
      "PE probability assessment",
    ],
  },
  kidneys: {
    renal_ultrasound: [
      "Kidney size and echogenicity",
      "Hydronephrosis",
      "Renal masses/cysts",
      "Cortical thickness",
      "Resistive index",
    ],
    ct_abdomen: [
      "Renal calculi",
      "Renal masses",
      "Perinephric abnormalities",
    ],
  },
  liver: {
    liver_ultrasound: [
      "Liver size and echogenicity",
      "Portal vein patency",
      "Ascites",
      "Hepatic masses",
      "Biliary dilation",
    ],
    fibroscan: [
      "Liver stiffness measurement",
      "Fibrosis staging",
    ],
    ct_abdomen: [
      "Hepatic lesion characterization",
      "Portal hypertension signs",
      "Varices",
    ],
    mri_liver: [
      "Iron/fat quantification",
      "Lesion characterization",
      "MRCP for biliary system",
    ],
  },
  brain: {
    ct_head: [
      "Acute hemorrhage",
      "Ischemic changes",
      "Mass effect",
      "Hydrocephalus",
    ],
    mri_brain: [
      "Diffusion restriction (acute stroke)",
      "White matter lesions",
      "Atrophy patterns",
      "Enhancement patterns",
    ],
    ct_angiography: [
      "Vascular occlusion",
      "Aneurysms",
      "Stenosis",
    ],
  },
};

// Treatment guideline templates by disease category
export const TREATMENT_TEMPLATES = {
  cardiac_failure: {
    firstLine: [
      { name: "ACEi/ARB", evidence: "IA", source: "ESC/AHA Guidelines" },
      { name: "Beta-blocker", evidence: "IA", source: "ESC/AHA Guidelines" },
      { name: "MRA", evidence: "IA", source: "ESC/AHA Guidelines" },
      { name: "SGLT2 inhibitor", evidence: "IA", source: "ESC 2021, DAPA-HF" },
    ],
    lifestyle: ["Sodium restriction", "Fluid restriction", "Daily weights", "Exercise training"],
  },
  cardiac_ischemic: {
    firstLine: [
      { name: "Dual antiplatelet therapy", evidence: "IA", source: "ESC ACS Guidelines" },
      { name: "High-intensity statin", evidence: "IA", source: "ESC Dyslipidemia Guidelines" },
      { name: "Beta-blocker", evidence: "IA", source: "Post-MI guidelines" },
      { name: "ACEi/ARB", evidence: "IA", source: "Secondary prevention" },
    ],
    interventions: ["PCI/CABG as indicated", "Cardiac rehabilitation"],
  },
  cardiac_arrhythmia: {
    firstLine: [
      { name: "Anticoagulation (CHA₂DS₂-VASc based)", evidence: "IA", source: "ESC AF Guidelines" },
      { name: "Rate control", evidence: "IA", source: "RACE II" },
      { name: "Rhythm control consideration", evidence: "IIa", source: "EAST-AFNET 4" },
    ],
    interventions: ["Catheter ablation", "Device therapy as indicated"],
  },
  respiratory_obstructive: {
    firstLine: [
      { name: "Bronchodilators (LAMA/LABA)", evidence: "IA", source: "GOLD Guidelines" },
      { name: "ICS if indicated", evidence: "IB", source: "GOLD Guidelines" },
      { name: "Smoking cessation", evidence: "IA", source: "All guidelines" },
    ],
    lifestyle: ["Pulmonary rehabilitation", "Vaccination", "Oxygen if hypoxemic"],
  },
  respiratory_infectious: {
    firstLine: [
      { name: "Antibiotics (pathogen-directed)", evidence: "IA", source: "IDSA/ATS Guidelines" },
      { name: "Supportive care", evidence: "IA", source: "Standard of care" },
    ],
    severity: ["CURB-65 assessment", "PSI scoring"],
  },
  renal_ckd: {
    firstLine: [
      { name: "ACEi/ARB", evidence: "IA", source: "KDIGO Guidelines" },
      { name: "SGLT2 inhibitor", evidence: "IA", source: "DAPA-CKD, EMPA-KIDNEY" },
      { name: "BP control <130/80", evidence: "IA", source: "KDIGO 2021" },
    ],
    complications: ["Anemia management", "CKD-MBD treatment", "Metabolic acidosis correction"],
  },
  metabolic_diabetes: {
    firstLine: [
      { name: "Metformin", evidence: "IA", source: "ADA Standards" },
      { name: "SGLT2 inhibitor (if CVD/CKD)", evidence: "IA", source: "ADA 2024" },
      { name: "GLP-1 RA (if CVD/CKD)", evidence: "IA", source: "ADA 2024" },
    ],
    targets: ["HbA1c <7% (individualized)", "BP <130/80", "LDL <70 if high risk"],
  },
  hypertension: {
    firstLine: [
      { name: "Lifestyle modification", evidence: "IA", source: "ACC/AHA Guidelines" },
      { name: "ACEi/ARB or CCB or Thiazide", evidence: "IA", source: "ACC/AHA 2017" },
    ],
    targets: ["BP <130/80 for most", "Individualize for elderly"],
  },
};

// Function to generate modifications based on disease characteristics
export const generateModifications = (disease) => {
  const modifications = {};
  const category = disease.category || 'cardiac';
  const affectedOrgans = disease.affectedOrgans || ['heart'];
  const name = (disease.name || '').toLowerCase();
  const icd10 = disease.icd10 || '';
  
  // Determine pattern based on disease characteristics
  let pattern = null;
  
  // Heart conditions
  if (affectedOrgans.includes('heart')) {
    if (name.includes('failure') || name.includes('cardiomyopathy') || icd10.startsWith('I50') || icd10.startsWith('I42')) {
      pattern = name.includes('hypertrophic') ? 'hypertrophic' : 'heart_failure';
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.heart[pattern] || {});
    } else if (name.includes('infarct') || name.includes('ischemi') || name.includes('angina') || icd10.startsWith('I21') || icd10.startsWith('I20')) {
      pattern = 'ischemic';
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.heart.ischemic || {});
    } else if (name.includes('fibrillation') || name.includes('flutter') || name.includes('arrhythm') || icd10.startsWith('I48') || icd10.startsWith('I47')) {
      pattern = 'arrhythmia';
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.heart.arrhythmia || {});
    } else if (name.includes('valve') || name.includes('stenosis') || name.includes('regurgitation') || icd10.match(/I3[456]/)) {
      pattern = 'valvular';
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.heart.valvular || {});
    } else if (name.includes('pericard') || icd10.startsWith('I30') || icd10.startsWith('I31')) {
      pattern = 'pericardial';
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.heart.pericardial || {});
    } else if (name.includes('congenital') || icd10.startsWith('Q2')) {
      pattern = 'congenital';
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.heart.congenital || {});
    }
  }
  
  // Lung conditions
  if (affectedOrgans.includes('lungs')) {
    if (name.includes('copd') || name.includes('asthma') || name.includes('obstructive') || icd10.startsWith('J44') || icd10.startsWith('J45')) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.lungs.obstructive || {});
    } else if (name.includes('fibrosis') || name.includes('interstitial') || icd10.startsWith('J84')) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.lungs.restrictive || {});
    } else if (name.includes('embolism') || name.includes('hypertension') || icd10.startsWith('I26') || icd10.startsWith('I27')) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.lungs.vascular || {});
    } else if (name.includes('pneumonia') || name.includes('infection') || icd10.match(/J1[0-8]/)) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.lungs.infectious || {});
    }
  }
  
  // Kidney conditions
  if (affectedOrgans.includes('kidneys')) {
    if (name.includes('chronic') || icd10.startsWith('N18')) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.kidneys.ckd || {});
    } else if (name.includes('acute') || name.includes('injury') || icd10.startsWith('N17')) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.kidneys.aki || {});
    } else if (name.includes('nephrotic') || name.includes('glomerul')) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.kidneys.nephrotic || {});
    }
  }
  
  // Liver conditions
  if (affectedOrgans.includes('liver')) {
    if (name.includes('cirrhosis') || name.includes('fibrosis')) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.liver.cirrhosis || {});
    } else if (name.includes('hepatitis')) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.liver.hepatitis || {});
    }
  }
  
  // Brain conditions
  if (affectedOrgans.includes('brain')) {
    if (name.includes('stroke') || name.includes('infarct') || name.includes('hemorrhage') || icd10.match(/I6[0-3]/)) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.brain.stroke || {});
    } else if (name.includes('dementia') || name.includes('alzheimer') || name.includes('parkinson')) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.brain.neurodegenerative || {});
    }
  }
  
  // Pancreas/metabolic conditions
  if (affectedOrgans.includes('pancreas') || category === 'metabolic') {
    if (name.includes('diabetes') || icd10.startsWith('E11') || icd10.startsWith('E10')) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.pancreas.diabetes || {});
    } else if (name.includes('pancreatitis')) {
      Object.assign(modifications, ORGAN_MODIFICATION_TEMPLATES.pancreas.pancreatitis || {});
    }
  }
  
  return modifications;
};

// Function to generate lab findings based on category
export const generateLabFindings = (disease) => {
  const category = disease.category || 'cardiac';
  const labs = [];
  
  // Primary category labs
  if (LAB_TEMPLATES[category]) {
    labs.push(...LAB_TEMPLATES[category]);
  }
  
  // Add inflammatory markers for most conditions
  if (category !== 'inflammatory') {
    labs.push(LAB_TEMPLATES.inflammatory[0]); // CRP
    labs.push(LAB_TEMPLATES.inflammatory[2]); // WBC
  }
  
  return labs;
};

// Function to generate imaging findings based on affected organs
export const generateImagingFindings = (disease) => {
  const imaging = {};
  const affectedOrgans = disease.affectedOrgans || ['heart'];
  
  affectedOrgans.forEach(organ => {
    if (IMAGING_TEMPLATES[organ]) {
      Object.entries(IMAGING_TEMPLATES[organ]).forEach(([modality, findings]) => {
        imaging[modality] = findings;
      });
    }
  });
  
  return imaging;
};

// Function to generate treatment template based on disease
export const generateTreatmentGuidelines = (disease) => {
  const category = disease.category || 'cardiac';
  const name = (disease.name || '').toLowerCase();
  const icd10 = disease.icd10 || '';
  
  // Match to appropriate template
  if (name.includes('failure') || name.includes('cardiomyopathy') || icd10.startsWith('I50') || icd10.startsWith('I42')) {
    return TREATMENT_TEMPLATES.cardiac_failure;
  }
  if (name.includes('infarct') || name.includes('ischemi') || name.includes('angina') || icd10.startsWith('I21') || icd10.startsWith('I20')) {
    return TREATMENT_TEMPLATES.cardiac_ischemic;
  }
  if (name.includes('fibrillation') || name.includes('flutter') || icd10.startsWith('I48')) {
    return TREATMENT_TEMPLATES.cardiac_arrhythmia;
  }
  if (name.includes('copd') || name.includes('asthma') || icd10.startsWith('J44') || icd10.startsWith('J45')) {
    return TREATMENT_TEMPLATES.respiratory_obstructive;
  }
  if (name.includes('pneumonia') || icd10.match(/J1[0-8]/)) {
    return TREATMENT_TEMPLATES.respiratory_infectious;
  }
  if (name.includes('kidney') || name.includes('renal') || icd10.startsWith('N18')) {
    return TREATMENT_TEMPLATES.renal_ckd;
  }
  if (name.includes('diabetes') || icd10.startsWith('E11')) {
    return TREATMENT_TEMPLATES.metabolic_diabetes;
  }
  if (name.includes('hypertension') || icd10.startsWith('I10')) {
    return TREATMENT_TEMPLATES.hypertension;
  }
  
  // Default cardiac template
  return TREATMENT_TEMPLATES.cardiac_failure;
};

// Main function to enhance disease data with templates
export const enhanceDiseaseWithTemplates = (disease) => {
  const enhanced = { ...disease };
  
  // Generate modifications if missing
  if (!enhanced.modifications || Object.keys(enhanced.modifications).length === 0) {
    enhanced.modifications = generateModifications(disease);
    enhanced.hasGeneratedModifications = true;
  }
  
  // Generate lab findings if missing
  if (!enhanced.laboratoryFindings || enhanced.laboratoryFindings.length === 0) {
    enhanced.laboratoryFindings = generateLabFindings(disease);
    enhanced.hasGeneratedLabs = true;
  }
  
  // Generate imaging findings if missing
  if (!enhanced.imagingFindings || Object.keys(enhanced.imagingFindings).length === 0) {
    enhanced.imagingFindings = generateImagingFindings(disease);
    enhanced.hasGeneratedImaging = true;
  }
  
  // Generate treatment guidelines if missing
  if (!enhanced.treatmentGuidelines) {
    enhanced.treatmentGuidelines = generateTreatmentGuidelines(disease);
    enhanced.hasGeneratedTreatment = true;
  }
  
  return enhanced;
};

export default {
  ORGAN_MODIFICATION_TEMPLATES,
  LAB_TEMPLATES,
  IMAGING_TEMPLATES,
  TREATMENT_TEMPLATES,
  generateModifications,
  generateLabFindings,
  generateImagingFindings,
  generateTreatmentGuidelines,
  enhanceDiseaseWithTemplates,
};
