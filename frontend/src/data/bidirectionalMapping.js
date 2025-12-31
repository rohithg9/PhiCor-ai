// ============================================================
// BIDIRECTIONAL PARAMETER-DISEASE MAPPING
// Enables reverse lookup: parameter → conditions that affect it
// For EMR integration and clinical decision support
// Enhanced with probability scoring for differential diagnosis
// ============================================================

import ORGAN_MODELS from './organModels';
import { ALL_CARDIAC_DISEASES } from './cardiacDiseasesIndex';
import { ALL_RESPIRATORY_DISEASES } from './respiratoryDiseasesIndex';
import { ALL_RENAL_DISEASES } from './renalDiseasesIndex';
import { ALL_NEUROLOGICAL_DISEASES } from './neurologicalDiseasesIndex';
import { ALL_HEPATIC_DISEASES } from './hepaticDiseasesIndex';
import { ALL_METABOLIC_DISEASES } from './metabolicDiseasesIndex';
import { ALL_HEMATOLOGICAL_DISEASES } from './hematologicalDiseasesIndex';
import { ALL_ONCOLOGY_DISEASES } from './oncologyDiseasesIndex';
import { ALL_CONGENITAL_DISEASES } from './congenitalDiseasesIndex';
import { ALL_AUTOIMMUNE_DISEASES } from './autoimmuneDiseasesIndex';
import { ALL_INFECTIOUS_DISEASES } from './infectiousDiseasesIndex';
import { ALL_GI_DISEASES } from './giDiseasesIndex';
import { ALL_DERMATOLOGICAL_DISEASES } from './dermatologicalDiseasesIndex';
import { ALL_PSYCHIATRIC_DISEASES } from './psychiatricDiseasesIndex';
import { ALL_PEDIATRIC_DISEASES } from './pediatricDiseasesIndex';
import { ALL_OBGYN_DISEASES } from './obgynDiseasesIndex';

// Combine all disease databases
const ALL_DISEASES = {
  ...ALL_CARDIAC_DISEASES,
  ...ALL_RESPIRATORY_DISEASES,
  ...ALL_RENAL_DISEASES,
  ...ALL_NEUROLOGICAL_DISEASES,
  ...ALL_HEPATIC_DISEASES,
  ...ALL_METABOLIC_DISEASES,
  ...ALL_HEMATOLOGICAL_DISEASES,
  ...ALL_ONCOLOGY_DISEASES,
  ...ALL_CONGENITAL_DISEASES,
  ...ALL_AUTOIMMUNE_DISEASES,
  ...ALL_INFECTIOUS_DISEASES,
  ...ALL_GI_DISEASES,
  ...ALL_DERMATOLOGICAL_DISEASES,
  ...ALL_PSYCHIATRIC_DISEASES,
  ...ALL_PEDIATRIC_DISEASES,
  ...ALL_OBGYN_DISEASES,
};

// Disease prevalence weights (per 100,000 population, approximate)
// Higher prevalence = higher prior probability
const DISEASE_PREVALENCE = {
  // Common conditions
  'E11_9': 10000,  // Type 2 Diabetes
  'I10': 30000,    // Hypertension
  'J45_9': 8000,   // Asthma
  'K21_0': 20000,  // GERD
  'K58_9': 10000,  // IBS
  'M05_9': 1000,   // RA
  // Moderate prevalence
  'I25_1': 5000,   // CAD
  'I50_9': 2000,   // Heart Failure
  'N18_3': 3000,   // CKD Stage 3
  'J44_9': 4000,   // COPD
  'K50_9': 200,    // Crohn's
  'K51_9': 200,    // UC
  // Lower prevalence
  'M32_9': 50,     // SLE
  'G35': 100,      // MS
  'C50_9': 150,    // Breast Cancer
  'C34_9': 50,     // Lung Cancer
  // Default for unlisted
  'default': 100,
};

// Specificity weights for findings (how specific is this finding for any diagnosis)
// Higher = more diagnostically valuable
const FINDING_SPECIFICITY = {
  // Highly specific findings
  'anti_dsDNA': 0.95,
  'anti_CCP': 0.95,
  'HbA1c': 0.85,
  'troponin': 0.90,
  'BNP': 0.80,
  // Moderately specific
  'CRP': 0.40,
  'ESR': 0.30,
  'WBC': 0.35,
  // Non-specific
  'fatigue': 0.10,
  'fever': 0.15,
  'weight_loss': 0.20,
  'default': 0.50,
};

/**
 * Build reverse index: parameter_id → [diseases that modify it]
 * This enables looking up "what conditions cause elevated creatinine?"
 */
export const buildParameterToDiseaseIndex = () => {
  const index = {};
  
  Object.entries(ALL_DISEASES).forEach(([diseaseCode, disease]) => {
    if (!disease.modifications) return;
    
    // Iterate through each organ's modifications
    Object.entries(disease.modifications).forEach(([organKey, organMods]) => {
      // Iterate through each category (geometry, physiology, etc.)
      Object.entries(organMods).forEach(([category, params]) => {
        if (typeof params !== 'object') return;
        
        // Iterate through each parameter
        Object.entries(params).forEach(([paramId, modification]) => {
          const fullParamId = `${organKey}.${paramId}`;
          
          if (!index[fullParamId]) {
            index[fullParamId] = [];
          }
          
          index[fullParamId].push({
            diseaseCode,
            diseaseName: disease.name,
            icd10: disease.icd10,
            category: disease.category,
            primaryOrgan: disease.primaryOrgan,
            factor: modification.factor,
            note: modification.note,
            direction: modification.factor > 1 ? 'increase' : modification.factor < 1 ? 'decrease' : 'unchanged',
            percentChange: ((modification.factor - 1) * 100).toFixed(0),
          });
        });
      });
    });
  });
  
  return index;
};

/**
 * Get all conditions that affect a specific parameter
 * @param {string} parameterId - Full parameter ID (e.g., "blood.hemoglobin" or just "hemoglobin")
 * @param {string} direction - Optional: "increase", "decrease", or null for both
 * @returns {Array} List of conditions affecting this parameter
 */
export const getConditionsAffectingParameter = (parameterId, direction = null) => {
  const index = buildParameterToDiseaseIndex();
  
  // Try exact match first
  let conditions = index[parameterId] || [];
  
  // If no exact match, try searching all organs for this parameter
  if (conditions.length === 0) {
    Object.entries(index).forEach(([key, diseases]) => {
      if (key.endsWith(`.${parameterId}`)) {
        conditions = [...conditions, ...diseases];
      }
    });
  }
  
  // Filter by direction if specified
  if (direction) {
    conditions = conditions.filter(c => c.direction === direction);
  }
  
  // Sort by absolute change magnitude
  conditions.sort((a, b) => Math.abs(b.factor - 1) - Math.abs(a.factor - 1));
  
  return conditions;
};

/**
 * Calculate probability score for a disease based on findings
 * Uses Bayesian-like approach: P(Disease|Findings) ∝ P(Findings|Disease) × P(Disease)
 * @param {Object} disease - Disease object with modifications
 * @param {Array} findings - Array of {parameterId, value, direction, severity} objects
 * @returns {number} Probability score (0-100)
 */
const calculateProbabilityScore = (diseaseCode, disease, findings) => {
  if (!disease || !findings || findings.length === 0) return 0;
  
  // Prior probability based on prevalence
  const prevalence = DISEASE_PREVALENCE[diseaseCode] || DISEASE_PREVALENCE['default'];
  const priorWeight = Math.log10(prevalence + 1) / 5; // Normalize to ~0-1
  
  // Likelihood: How well do findings match disease modifications?
  let likelihoodScore = 0;
  let matchedCount = 0;
  let totalFindings = findings.length;
  
  findings.forEach(finding => {
    const { parameterId, direction, severity = 1, value } = finding;
    
    // Check if disease modifies this parameter
    const diseaseMatch = findDiseaseParameterMatch(disease, parameterId);
    
    if (diseaseMatch) {
      matchedCount++;
      
      // Direction match (increase vs decrease)
      const diseaseDirection = diseaseMatch.factor > 1 ? 'increase' : 'decrease';
      const directionMatch = diseaseDirection === direction ? 1 : 0;
      
      // Magnitude match - how close is the observed change to expected?
      const expectedChange = Math.abs(diseaseMatch.factor - 1);
      const magnitudeScore = expectedChange * severity;
      
      // Finding specificity
      const specificity = FINDING_SPECIFICITY[parameterId] || FINDING_SPECIFICITY['default'];
      
      // Combined score for this finding
      likelihoodScore += (directionMatch * magnitudeScore * specificity * 100);
    }
  });
  
  // Calculate final probability
  const matchRatio = totalFindings > 0 ? matchedCount / totalFindings : 0;
  const avgLikelihood = matchedCount > 0 ? likelihoodScore / matchedCount : 0;
  
  // Combine prior and likelihood
  const rawScore = (priorWeight * 20) + (matchRatio * 30) + (avgLikelihood * 0.5);
  
  // Normalize to 0-100 with sigmoid-like function
  const normalizedScore = Math.min(99, Math.max(1, rawScore));
  
  return Math.round(normalizedScore * 10) / 10;
};

/**
 * Find if a disease modifies a specific parameter
 */
const findDiseaseParameterMatch = (disease, parameterId) => {
  if (!disease.modifications) return null;
  
  for (const [organKey, organMods] of Object.entries(disease.modifications)) {
    for (const [category, params] of Object.entries(organMods)) {
      if (typeof params !== 'object') continue;
      
      for (const [paramId, modification] of Object.entries(params)) {
        if (paramId === parameterId || `${organKey}.${paramId}` === parameterId) {
          return modification;
        }
      }
    }
  }
  return null;
};

/**
 * ENHANCED: Get differential diagnosis with probability scores
 * @param {Array} abnormalFindings - Array of {parameterId, direction, value?, severity?} objects
 * @param {Object} options - {includeSymptoms: bool, ageGroup: string, gender: string}
 * @returns {Array} Ranked list of conditions with probability scores
 */
export const getDifferentialDiagnosis = (abnormalFindings, options = {}) => {
  if (!abnormalFindings || abnormalFindings.length === 0) return [];
  
  const { includeSymptoms = true, ageGroup = 'adult', gender = 'any' } = options;
  
  const conditionScores = {};
  
  // First pass: Match parameters to diseases
  abnormalFindings.forEach(finding => {
    const { parameterId, direction, value, severity = 1 } = finding;
    const matches = getConditionsAffectingParameter(parameterId, direction);
    
    matches.forEach(match => {
      const key = match.diseaseCode;
      const disease = ALL_DISEASES[key];
      
      if (!conditionScores[key]) {
        conditionScores[key] = {
          diseaseCode: key,
          diseaseName: match.diseaseName || disease?.name,
          icd10: match.icd10 || disease?.icd10,
          category: match.category || disease?.category,
          primaryOrgan: match.primaryOrgan || disease?.primaryOrgan,
          matchCount: 0,
          matchedParams: [],
          totalMagnitudeScore: 0,
          probabilityScore: 0,
          confidence: 'low',
          supportingEvidence: [],
          contradictingEvidence: [],
        };
      }
      
      conditionScores[key].matchCount += 1;
      conditionScores[key].matchedParams.push({
        param: parameterId,
        direction,
        factor: match.factor,
        expectedChange: `${match.percentChange}%`,
        note: match.note,
      });
      conditionScores[key].totalMagnitudeScore += Math.abs(match.factor - 1) * severity;
      
      // Add to supporting evidence
      conditionScores[key].supportingEvidence.push({
        finding: parameterId,
        direction,
        explanation: match.note,
      });
    });
  });
  
  // Second pass: Calculate probability scores
  Object.keys(conditionScores).forEach(key => {
    const disease = ALL_DISEASES[key];
    const probScore = calculateProbabilityScore(key, disease, abnormalFindings);
    conditionScores[key].probabilityScore = probScore;
    
    // Determine confidence level
    const matchRatio = conditionScores[key].matchCount / abnormalFindings.length;
    if (probScore >= 70 && matchRatio >= 0.6) {
      conditionScores[key].confidence = 'high';
    } else if (probScore >= 40 && matchRatio >= 0.3) {
      conditionScores[key].confidence = 'moderate';
    } else {
      conditionScores[key].confidence = 'low';
    }
    
    // Add clinical presentation summary
    if (disease) {
      conditionScores[key].clinicalSummary = {
        symptoms: disease.clinicalPresentation?.symptoms?.slice(0, 5) || [],
        keyLabs: disease.laboratoryFindings?.slice(0, 3) || [],
        primaryOrgan: disease.primaryOrgan,
        affectedOrgans: disease.affectedOrgans || [],
      };
    }
  });
  
  // Convert to array and sort by probability score
  const results = Object.values(conditionScores)
    .sort((a, b) => {
      // Primary sort: probability score
      if (Math.abs(b.probabilityScore - a.probabilityScore) > 5) {
        return b.probabilityScore - a.probabilityScore;
      }
      // Secondary sort: match count
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      // Tertiary sort: magnitude score
      return b.totalMagnitudeScore - a.totalMagnitudeScore;
    })
    .map((result, index) => ({
      ...result,
      rank: index + 1,
      probabilityDisplay: `${result.probabilityScore}%`,
    }));
  
  return results;
};

/**
 * Get normal ranges for a parameter
 * @param {string} parameterId - Parameter ID
 * @param {string} organKey - Optional organ key
 * @returns {Object} Parameter info with normal range
 */
export const getParameterNormalRange = (parameterId, organKey = null) => {
  let result = null;
  
  const searchOrgan = (organ) => {
    const organData = ORGAN_MODELS[organ];
    if (!organData) return null;
    
    const categories = ['geometry', 'physiology', 'structure', 'pressures', 'cellular'];
    for (const category of categories) {
      const categoryData = organData[category];
      if (!categoryData?.parameters) continue;
      
      const param = categoryData.parameters.find(p => p.id === parameterId);
      if (param) {
        return {
          ...param,
          organ,
          category,
        };
      }
    }
    return null;
  };
  
  if (organKey) {
    result = searchOrgan(organKey);
  } else {
    // Search all organs
    for (const organ of Object.keys(ORGAN_MODELS)) {
      result = searchOrgan(organ);
      if (result) break;
    }
  }
  
  return result;
};

/**
 * Check if a value is abnormal and in which direction
 * @param {string} parameterId - Parameter ID
 * @param {number} value - The value to check
 * @param {string} organKey - Optional organ key
 * @returns {Object} {isAbnormal, direction, percentFromNormal}
 */
export const checkIfAbnormal = (parameterId, value, organKey = null) => {
  const paramInfo = getParameterNormalRange(parameterId, organKey);
  if (!paramInfo || !paramInfo.range) {
    return { isAbnormal: false, direction: null, percentFromNormal: 0 };
  }
  
  const [min, max] = paramInfo.range;
  const midpoint = (min + max) / 2;
  
  if (value < min) {
    return {
      isAbnormal: true,
      direction: 'decrease',
      percentFromNormal: ((min - value) / midpoint * 100).toFixed(1),
      normalRange: paramInfo.range,
    };
  }
  
  if (value > max) {
    return {
      isAbnormal: true,
      direction: 'increase',
      percentFromNormal: ((value - max) / midpoint * 100).toFixed(1),
      normalRange: paramInfo.range,
    };
  }
  
  return {
    isAbnormal: false,
    direction: null,
    percentFromNormal: 0,
    normalRange: paramInfo.range,
  };
};

/**
 * Get all parameters in the system organized by organ
 * @returns {Object} Parameters grouped by organ and category
 */
export const getAllParameters = () => {
  const result = {};
  
  Object.entries(ORGAN_MODELS).forEach(([organKey, organData]) => {
    result[organKey] = {
      name: organData.name,
      icon: organData.icon,
      parameters: [],
    };
    
    const categories = ['geometry', 'physiology', 'structure', 'pressures', 'cellular'];
    categories.forEach(category => {
      const categoryData = organData[category];
      if (!categoryData?.parameters) return;
      
      categoryData.parameters.forEach(param => {
        result[organKey].parameters.push({
          id: param.id,
          name: param.name,
          value: param.value,
          unit: param.unit,
          range: param.range,
          category,
          fullId: `${organKey}.${param.id}`,
        });
      });
    });
  });
  
  return result;
};

/**
 * Get symptoms/findings associated with a disease
 * @param {string} diseaseCode - Disease code
 * @returns {Object} Clinical presentation data
 */
export const getClinicalPresentation = (diseaseCode) => {
  const disease = ALL_DISEASES[diseaseCode];
  if (!disease) return null;
  
  return {
    name: disease.name,
    icd10: disease.icd10,
    symptoms: disease.clinicalPresentation?.symptoms || [],
    signs: disease.clinicalPresentation?.signs || [],
    labFindings: disease.laboratoryFindings || [],
    imagingFindings: disease.imagingFindings || {},
    pathophysiology: disease.pathophysiology || {},
  };
};

/**
 * Build reverse index: symptom/finding → diseases that present with it
 */
export const buildSymptomToDiseaseIndex = () => {
  const index = {
    symptoms: {},
    signs: {},
    labFindings: {},
  };
  
  Object.entries(ALL_DISEASES).forEach(([diseaseCode, disease]) => {
    const presentation = disease.clinicalPresentation;
    if (!presentation) return;
    
    // Index symptoms
    (presentation.symptoms || []).forEach(symptom => {
      const key = typeof symptom === 'string' ? symptom.toLowerCase() : symptom;
      if (!index.symptoms[key]) index.symptoms[key] = [];
      index.symptoms[key].push({
        diseaseCode,
        diseaseName: disease.name,
        icd10: disease.icd10,
        category: disease.category,
      });
    });
    
    // Index signs
    (presentation.signs || []).forEach(sign => {
      const key = typeof sign === 'string' ? sign.toLowerCase() : sign;
      if (!index.signs[key]) index.signs[key] = [];
      index.signs[key].push({
        diseaseCode,
        diseaseName: disease.name,
        icd10: disease.icd10,
        category: disease.category,
      });
    });
    
    // Index lab findings
    (disease.laboratoryFindings || []).forEach(lab => {
      const key = lab.name?.toLowerCase() || '';
      if (!index.labFindings[key]) index.labFindings[key] = [];
      index.labFindings[key].push({
        diseaseCode,
        diseaseName: disease.name,
        icd10: disease.icd10,
        category: disease.category,
        abnormalValue: lab.abnormalInDisease,
        normalRange: lab.normalRange,
      });
    });
  });
  
  return index;
};

/**
 * Search for conditions by symptom or finding
 * @param {string} query - Search term
 * @param {string} type - "symptoms", "signs", "labFindings", or "all"
 * @returns {Array} Matching conditions
 */
export const searchBySymptomOrFinding = (query, type = 'all') => {
  const index = buildSymptomToDiseaseIndex();
  const queryLower = query.toLowerCase();
  const results = [];
  
  const searchIn = (indexSection) => {
    Object.entries(indexSection).forEach(([key, diseases]) => {
      if (key.includes(queryLower)) {
        diseases.forEach(d => {
          if (!results.find(r => r.diseaseCode === d.diseaseCode)) {
            results.push({ ...d, matchedOn: key });
          }
        });
      }
    });
  };
  
  if (type === 'all' || type === 'symptoms') searchIn(index.symptoms);
  if (type === 'all' || type === 'signs') searchIn(index.signs);
  if (type === 'all' || type === 'labFindings') searchIn(index.labFindings);
  
  return results;
};

// ============================================================
// TEST PATIENT / CLINICAL TEXT PARSING
// Parse clinical notes, lab results, and generate differential
// ============================================================

/**
 * Common lab value patterns for extraction
 */
const LAB_PATTERNS = {
  // Complete Blood Count
  hemoglobin: /(?:hemoglobin|hgb|hb)\s*[:=]?\s*([\d.]+)\s*(g\/dl|g\/l)?/i,
  wbc: /(?:wbc|white\s*blood\s*cells?|leukocytes?)\s*[:=]?\s*([\d.]+)\s*(?:×?\s*10\^?[39]|k)?/i,
  platelets: /(?:platelets?|plt)\s*[:=]?\s*([\d.]+)\s*(?:×?\s*10\^?[39]|k)?/i,
  hematocrit: /(?:hematocrit|hct)\s*[:=]?\s*([\d.]+)\s*%?/i,
  mcv: /(?:mcv)\s*[:=]?\s*([\d.]+)\s*(?:fl)?/i,
  
  // Metabolic Panel
  glucose: /(?:glucose|blood\s*sugar|bs|fbs)\s*[:=]?\s*([\d.]+)\s*(?:mg\/dl|mmol\/l)?/i,
  creatinine: /(?:creatinine|cr)\s*[:=]?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  bun: /(?:bun|blood\s*urea\s*nitrogen)\s*[:=]?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  sodium: /(?:sodium|na\+?)\s*[:=]?\s*([\d.]+)\s*(?:meq\/l|mmol\/l)?/i,
  potassium: /(?:potassium|k\+?)\s*[:=]?\s*([\d.]+)\s*(?:meq\/l|mmol\/l)?/i,
  chloride: /(?:chloride|cl)\s*[:=]?\s*([\d.]+)\s*(?:meq\/l|mmol\/l)?/i,
  bicarbonate: /(?:bicarbonate|hco3|co2)\s*[:=]?\s*([\d.]+)\s*(?:meq\/l|mmol\/l)?/i,
  calcium: /(?:calcium|ca)\s*[:=]?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  
  // Liver Function
  ast: /(?:ast|sgot|aspartate\s*aminotransferase)\s*[:=]?\s*([\d.]+)\s*(?:u\/l|iu\/l)?/i,
  alt: /(?:alt|sgpt|alanine\s*aminotransferase)\s*[:=]?\s*([\d.]+)\s*(?:u\/l|iu\/l)?/i,
  alp: /(?:alp|alkaline\s*phosphatase)\s*[:=]?\s*([\d.]+)\s*(?:u\/l|iu\/l)?/i,
  bilirubin: /(?:total\s*bilirubin|bilirubin|tbili)\s*[:=]?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  albumin: /(?:albumin|alb)\s*[:=]?\s*([\d.]+)\s*(?:g\/dl)?/i,
  
  // Cardiac
  troponin: /(?:troponin|trop\s*[it])\s*[:=]?\s*([\d.]+)\s*(?:ng\/ml)?/i,
  bnp: /(?:bnp|brain\s*natriuretic\s*peptide)\s*[:=]?\s*([\d.]+)\s*(?:pg\/ml)?/i,
  ck: /(?:ck|cpk|creatine\s*kinase)\s*[:=]?\s*([\d.]+)\s*(?:u\/l)?/i,
  
  // Inflammatory
  crp: /(?:crp|c-reactive\s*protein)\s*[:=]?\s*([\d.]+)\s*(?:mg\/l|mg\/dl)?/i,
  esr: /(?:esr|sed\s*rate|erythrocyte\s*sedimentation)\s*[:=]?\s*([\d.]+)\s*(?:mm\/hr)?/i,
  procalcitonin: /(?:procalcitonin|pct)\s*[:=]?\s*([\d.]+)\s*(?:ng\/ml)?/i,
  
  // Coagulation
  pt: /(?:pt|prothrombin\s*time)\s*[:=]?\s*([\d.]+)\s*(?:sec|seconds)?/i,
  inr: /(?:inr)\s*[:=]?\s*([\d.]+)/i,
  ptt: /(?:ptt|aptt|activated\s*partial)\s*[:=]?\s*([\d.]+)\s*(?:sec|seconds)?/i,
  d_dimer: /(?:d-?dimer)\s*[:=]?\s*([\d.]+)\s*(?:μg\/ml|ng\/ml)?/i,
  
  // Thyroid
  tsh: /(?:tsh|thyroid\s*stimulating)\s*[:=]?\s*([\d.]+)\s*(?:miu\/l)?/i,
  t4: /(?:free\s*t4|ft4|thyroxine)\s*[:=]?\s*([\d.]+)\s*(?:ng\/dl)?/i,
  t3: /(?:free\s*t3|ft3|triiodothyronine)\s*[:=]?\s*([\d.]+)\s*(?:pg\/ml)?/i,
  
  // Diabetes
  hba1c: /(?:hba1c|a1c|glycated\s*hemoglobin)\s*[:=]?\s*([\d.]+)\s*%?/i,
  
  // Lipids
  cholesterol: /(?:total\s*cholesterol|cholesterol)\s*[:=]?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  ldl: /(?:ldl|ldl-c)\s*[:=]?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  hdl: /(?:hdl|hdl-c)\s*[:=]?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  triglycerides: /(?:triglycerides?|tg)\s*[:=]?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  
  // Kidney
  gfr: /(?:gfr|egfr|glomerular\s*filtration)\s*[:=]?\s*([\d.]+)\s*(?:ml\/min)?/i,
  urine_protein: /(?:urine\s*protein|proteinuria)\s*[:=]?\s*([\d.]+)\s*(?:mg\/dl|g)?/i,
  
  // ABG
  ph: /(?:ph|arterial\s*ph)\s*[:=]?\s*([\d.]+)/i,
  pco2: /(?:pco2|paco2)\s*[:=]?\s*([\d.]+)\s*(?:mmhg)?/i,
  po2: /(?:po2|pao2)\s*[:=]?\s*([\d.]+)\s*(?:mmhg)?/i,
  o2sat: /(?:o2\s*sat|spo2|oxygen\s*saturation)\s*[:=]?\s*([\d.]+)\s*%?/i,
  lactate: /(?:lactate|lactic\s*acid)\s*[:=]?\s*([\d.]+)\s*(?:mmol\/l)?/i,
};

/**
 * Normal ranges for common labs (for determining direction)
 */
const NORMAL_RANGES = {
  hemoglobin: { min: 12, max: 17, unit: 'g/dL' },
  wbc: { min: 4, max: 11, unit: '×10³/μL' },
  platelets: { min: 150, max: 400, unit: '×10³/μL' },
  hematocrit: { min: 36, max: 48, unit: '%' },
  mcv: { min: 80, max: 100, unit: 'fL' },
  glucose: { min: 70, max: 100, unit: 'mg/dL' },
  creatinine: { min: 0.7, max: 1.3, unit: 'mg/dL' },
  bun: { min: 7, max: 20, unit: 'mg/dL' },
  sodium: { min: 136, max: 145, unit: 'mEq/L' },
  potassium: { min: 3.5, max: 5.0, unit: 'mEq/L' },
  chloride: { min: 98, max: 106, unit: 'mEq/L' },
  bicarbonate: { min: 22, max: 28, unit: 'mEq/L' },
  calcium: { min: 8.5, max: 10.5, unit: 'mg/dL' },
  ast: { min: 10, max: 40, unit: 'U/L' },
  alt: { min: 7, max: 56, unit: 'U/L' },
  alp: { min: 44, max: 147, unit: 'U/L' },
  bilirubin: { min: 0.1, max: 1.2, unit: 'mg/dL' },
  albumin: { min: 3.5, max: 5.0, unit: 'g/dL' },
  troponin: { min: 0, max: 0.04, unit: 'ng/mL' },
  bnp: { min: 0, max: 100, unit: 'pg/mL' },
  crp: { min: 0, max: 10, unit: 'mg/L' },
  esr: { min: 0, max: 20, unit: 'mm/hr' },
  inr: { min: 0.9, max: 1.1, unit: '' },
  d_dimer: { min: 0, max: 0.5, unit: 'μg/mL' },
  tsh: { min: 0.4, max: 4.0, unit: 'mIU/L' },
  hba1c: { min: 4.0, max: 5.6, unit: '%' },
  gfr: { min: 90, max: 120, unit: 'mL/min' },
  ph: { min: 7.35, max: 7.45, unit: '' },
  pco2: { min: 35, max: 45, unit: 'mmHg' },
  po2: { min: 80, max: 100, unit: 'mmHg' },
  o2sat: { min: 95, max: 100, unit: '%' },
  lactate: { min: 0.5, max: 2.0, unit: 'mmol/L' },
};

/**
 * Symptom keywords for extraction
 */
const SYMPTOM_KEYWORDS = [
  'fever', 'chills', 'fatigue', 'weakness', 'malaise', 'weight loss', 'weight gain',
  'headache', 'dizziness', 'syncope', 'confusion', 'altered mental status',
  'chest pain', 'palpitations', 'dyspnea', 'shortness of breath', 'orthopnea',
  'cough', 'sputum', 'hemoptysis', 'wheezing',
  'nausea', 'vomiting', 'diarrhea', 'constipation', 'abdominal pain', 'melena', 'hematochezia',
  'dysuria', 'hematuria', 'polyuria', 'oliguria', 'edema',
  'joint pain', 'arthralgia', 'myalgia', 'back pain', 'neck stiffness',
  'rash', 'pruritus', 'jaundice', 'pallor', 'cyanosis',
  'numbness', 'tingling', 'weakness', 'paralysis', 'tremor', 'seizure',
  'blurred vision', 'diplopia', 'photophobia',
  'anxiety', 'depression', 'insomnia',
];

/**
 * Parse clinical text and extract findings
 * @param {string} clinicalText - Free text clinical notes
 * @returns {Object} Extracted findings {labs, symptoms, vitals}
 */
export const parseClinicalText = (clinicalText) => {
  if (!clinicalText || typeof clinicalText !== 'string') {
    return { labs: [], symptoms: [], vitals: [], rawFindings: [] };
  }
  
  const textLower = clinicalText.toLowerCase();
  const extractedLabs = [];
  const extractedSymptoms = [];
  const rawFindings = [];
  
  // Extract lab values
  Object.entries(LAB_PATTERNS).forEach(([labName, pattern]) => {
    const match = textLower.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      const normalRange = NORMAL_RANGES[labName];
      
      let direction = 'normal';
      let severity = 0;
      
      if (normalRange) {
        if (value < normalRange.min) {
          direction = 'decrease';
          severity = Math.min(3, (normalRange.min - value) / (normalRange.min * 0.3));
        } else if (value > normalRange.max) {
          direction = 'increase';
          severity = Math.min(3, (value - normalRange.max) / (normalRange.max * 0.3));
        }
      }
      
      if (direction !== 'normal') {
        extractedLabs.push({
          parameterId: labName,
          name: labName.replace(/_/g, ' ').toUpperCase(),
          value,
          unit: normalRange?.unit || '',
          direction,
          severity: Math.round(severity * 10) / 10,
          normalRange: normalRange ? `${normalRange.min}-${normalRange.max}` : 'N/A',
          isAbnormal: true,
        });
        
        rawFindings.push({
          type: 'lab',
          name: labName,
          value,
          direction,
        });
      }
    }
  });
  
  // Extract symptoms
  SYMPTOM_KEYWORDS.forEach(symptom => {
    if (textLower.includes(symptom)) {
      extractedSymptoms.push({
        name: symptom,
        present: true,
      });
      
      rawFindings.push({
        type: 'symptom',
        name: symptom,
        direction: 'present',
      });
    }
  });
  
  // Check for negated symptoms (e.g., "no fever", "denies chest pain")
  const negationPatterns = [
    /no\s+(\w+)/gi,
    /denies\s+(\w+)/gi,
    /without\s+(\w+)/gi,
    /negative\s+for\s+(\w+)/gi,
  ];
  
  return {
    labs: extractedLabs,
    symptoms: extractedSymptoms,
    vitals: [], // TODO: Add vital signs extraction
    rawFindings,
    summary: {
      labCount: extractedLabs.length,
      symptomCount: extractedSymptoms.length,
      abnormalLabs: extractedLabs.filter(l => l.isAbnormal).length,
    },
  };
};

/**
 * Generate differential diagnosis from clinical text
 * @param {string} clinicalText - Free text clinical notes
 * @param {Object} options - Analysis options
 * @returns {Object} Differential diagnosis with probability scores
 */
export const analyzePatientCase = (clinicalText, options = {}) => {
  const parsed = parseClinicalText(clinicalText);
  
  // Convert extracted labs to format for differential diagnosis
  const abnormalFindings = parsed.labs.map(lab => ({
    parameterId: lab.parameterId,
    direction: lab.direction,
    value: lab.value,
    severity: lab.severity,
  }));
  
  // Add symptoms as findings (map to relevant parameters)
  // This is a simplified mapping - in production would need more sophisticated NLP
  
  const differential = getDifferentialDiagnosis(abnormalFindings, options);
  
  return {
    extractedData: parsed,
    differential,
    topDiagnoses: differential.slice(0, 10),
    analysisTimestamp: new Date().toISOString(),
    confidence: differential.length > 0 ? 
      (differential[0].probabilityScore > 50 ? 'moderate' : 'low') : 'insufficient_data',
  };
};

/**
 * Create a test patient profile
 * @param {Object} patientData - Patient demographics and clinical info
 * @returns {Object} Structured patient profile
 */
export const createTestPatient = (patientData = {}) => {
  return {
    id: `TP_${Date.now()}`,
    demographics: {
      age: patientData.age || null,
      gender: patientData.gender || null,
      weight: patientData.weight || null,
      height: patientData.height || null,
    },
    chiefComplaint: patientData.chiefComplaint || '',
    historyOfPresentIllness: patientData.hpi || '',
    pastMedicalHistory: patientData.pmh || [],
    medications: patientData.medications || [],
    allergies: patientData.allergies || [],
    familyHistory: patientData.familyHistory || [],
    socialHistory: patientData.socialHistory || {},
    reviewOfSystems: patientData.ros || {},
    physicalExam: patientData.physicalExam || {},
    labResults: patientData.labs || [],
    imagingResults: patientData.imaging || [],
    clinicalNotes: patientData.clinicalNotes || '',
    attachments: patientData.attachments || [],
    createdAt: new Date().toISOString(),
  };
};

// Pre-built index for performance (can be called on app load)
let cachedParameterIndex = null;
let cachedSymptomIndex = null;

export const initializeIndexes = () => {
  cachedParameterIndex = buildParameterToDiseaseIndex();
  cachedSymptomIndex = buildSymptomToDiseaseIndex();
  console.log('Bidirectional indexes initialized:', {
    parameterCount: Object.keys(cachedParameterIndex).length,
    symptomCategories: Object.keys(cachedSymptomIndex).length,
    diseaseCount: Object.keys(ALL_DISEASES).length,
  });
};

export const getCachedParameterIndex = () => cachedParameterIndex || buildParameterToDiseaseIndex();
export const getCachedSymptomIndex = () => cachedSymptomIndex || buildSymptomToDiseaseIndex();
export const getAllDiseases = () => ALL_DISEASES;

export default {
  buildParameterToDiseaseIndex,
  getConditionsAffectingParameter,
  getDifferentialDiagnosis,
  getParameterNormalRange,
  checkIfAbnormal,
  getAllParameters,
  getClinicalPresentation,
  buildSymptomToDiseaseIndex,
  searchBySymptomOrFinding,
  parseClinicalText,
  analyzePatientCase,
  createTestPatient,
  initializeIndexes,
  getAllDiseases,
  DISEASE_PREVALENCE,
  NORMAL_RANGES,
};
