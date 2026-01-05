// ============================================================
// BIDIRECTIONAL PARAMETER-DISEASE MAPPING
// Enables reverse lookup: parameter → conditions that affect it
// For EMR integration and clinical decision support
// Enhanced with probability scoring for differential diagnosis
// ============================================================

import ORGAN_MODELS from './organModels';
import { DISEASE_MODELS } from './diseaseModels';  // Models with 'modifications' for parameter mapping
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

// Combine all disease databases - DISEASE_MODELS has parameter modifications
const ALL_DISEASES = {
  ...DISEASE_MODELS,  // These have 'modifications' for parameter-to-disease mapping
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
          
          // Support both 'factor' and 'multiplier' keys
          const factor = modification.factor || modification.multiplier || 1;
          
          index[fullParamId].push({
            diseaseCode,
            diseaseName: disease.name,
            icd10: disease.icd10,
            category: disease.category,
            primaryOrgan: disease.primaryOrgan,
            factor: factor,
            note: modification.note,
            direction: factor > 1 ? 'increase' : factor < 1 ? 'decrease' : 'unchanged',
            percentChange: ((factor - 1) * 100).toFixed(0),
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
  
  console.log('getConditionsAffectingParameter: parameterId:', parameterId);
  console.log('getConditionsAffectingParameter: index sample keys:', Object.keys(index).slice(0, 10));
  
  // Try exact match first
  let conditions = index[parameterId] || [];
  console.log('getConditionsAffectingParameter: exact match found:', conditions.length);
  
  // If no exact match, try searching all organs for this parameter
  if (conditions.length === 0) {
    // Extract just the parameter name (last part after dot)
    const paramName = parameterId.includes('.') ? parameterId.split('.').pop() : parameterId;
    console.log('getConditionsAffectingParameter: trying partial match with paramName:', paramName);
    
    Object.entries(index).forEach(([key, diseases]) => {
      if (key.endsWith(`.${paramName}`) || key === paramName) {
        conditions = [...conditions, ...diseases];
      }
    });
    console.log('getConditionsAffectingParameter: partial match found:', conditions.length);
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
  if (!findings || findings.length === 0) return 0;
  
  // Prior probability based on prevalence
  const prevalence = DISEASE_PREVALENCE[diseaseCode] || DISEASE_PREVALENCE['default'];
  const priorWeight = Math.log10(prevalence + 1) / 5; // Normalize to ~0-1
  
  // If no disease definition, use a simpler scoring based on match count
  if (!disease) {
    // Count how many findings suggest this disease
    const matchingFindings = findings.filter(f => f.diseases && f.diseases.includes(diseaseCode));
    const baseScore = (matchingFindings.length / findings.length) * 60;
    
    // Add severity bonus
    let severityBonus = 0;
    matchingFindings.forEach(f => {
      if (f.severity === 'severe') severityBonus += 15;
      else if (f.severity === 'moderate') severityBonus += 10;
      else severityBonus += 5;
    });
    
    return Math.min(100, baseScore + severityBonus + (priorWeight * 10));
  }
  
  // Likelihood: How well do findings match disease modifications?
  let likelihoodScore = 0;
  let matchedCount = 0;
  let totalFindings = findings.length;
  
  findings.forEach(finding => {
    const { parameterId, direction, severity = 'moderate', value } = finding;
    
    // Convert severity to numeric multiplier
    const severityMultiplier = severity === 'critical' ? 2 : severity === 'moderate' ? 1.5 : 1;
    
    // Check if disease modifies this parameter
    const diseaseMatch = findDiseaseParameterMatch(disease, parameterId);
    
    if (diseaseMatch) {
      matchedCount++;
      
      // Direction match (increase vs decrease)
      // Support both 'factor' and 'multiplier' keys
      const factor = diseaseMatch.factor || diseaseMatch.multiplier || 1;
      const diseaseDirection = factor > 1 ? 'increase' : 'decrease';
      const directionMatch = diseaseDirection === direction ? 1 : 0;
      
      // Magnitude match - how close is the observed change to expected?
      const expectedChange = Math.abs(factor - 1);
      const magnitudeScore = expectedChange * severityMultiplier;
      
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
          // Normalize factor vs multiplier
          return {
            ...modification,
            factor: modification.factor || modification.multiplier || 1
          };
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
    const { parameterId, direction, value, severity = 1, diseases = [] } = finding;
    
    // Check if finding has pre-defined disease associations (from imaging findings)
    if (diseases && diseases.length > 0) {
      diseases.forEach(diseaseCode => {
        const disease = ALL_DISEASES[diseaseCode];
        // Use disease name from ALL_DISEASES, fallback to ICD_CODE_NAMES, then to formatted code
        const diseaseName = disease?.name || ICD_CODE_NAMES[diseaseCode] || diseaseCode.replace(/_/g, ' ');
        
        if (!conditionScores[diseaseCode]) {
          conditionScores[diseaseCode] = {
            diseaseCode: diseaseCode,
            diseaseName: diseaseName,
            icd10: diseaseCode.replace('_', '.'),
            category: disease?.category || 'cardiovascular',
            primaryOrgan: disease?.primaryOrgan || 'heart',
            matchCount: 0,
            matchedParams: [],
            totalMagnitudeScore: 0,
            probabilityScore: 0,
            confidence: 'low',
            supportingEvidence: [],
            contradictingEvidence: [],
          };
        }
        
        conditionScores[diseaseCode].matchCount += 1;
        conditionScores[diseaseCode].matchedParams.push({
          param: parameterId,
          direction,
          factor: 1.5,
          expectedChange: 'N/A',
          note: `Imaging finding: ${parameterId.replace(/_/g, ' ')}`,
        });
        conditionScores[diseaseCode].totalMagnitudeScore += severity === 'severe' ? 2 : severity === 'moderate' ? 1.5 : 1;
        conditionScores[diseaseCode].supportingEvidence.push({
          finding: parameterId,
          direction,
          explanation: `Imaging finding suggests ${diseaseName}`,
        });
      });
    }
    
    // Also check parameter-to-disease mapping
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
      conditionScores[key].totalMagnitudeScore += Math.abs(match.factor - 1) * (typeof severity === 'number' ? severity : 1);
      
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
      // Safely get symptoms - ensure it's an array before slicing
      const symptoms = disease.clinicalPresentation?.symptoms;
      const symptomsArray = Array.isArray(symptoms) ? symptoms.slice(0, 5) : [];
      
      // Safely get laboratory findings - ensure it's an array before slicing
      const labFindings = disease.laboratoryFindings;
      const labsArray = Array.isArray(labFindings) ? labFindings.slice(0, 3) : [];
      
      conditionScores[key].clinicalSummary = {
        symptoms: symptomsArray,
        keyLabs: labsArray,
        primaryOrgan: disease.primaryOrgan || '',
        affectedOrgans: Array.isArray(disease.affectedOrgans) ? disease.affectedOrgans : [],
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
  hemoglobin: /(?:hemoglobin|hgb|hb)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(g\/dl|g\/l)?/i,
  wbc: /(?:wbc|white\s*blood\s*cells?|leukocytes?)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:×?\s*10\^?[39]|k)?/i,
  platelets: /(?:platelets?|plt)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:×?\s*10\^?[39]|k)?/i,
  hematocrit: /(?:hematocrit|hct)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*%?/i,
  mcv: /(?:mcv)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:fl)?/i,
  
  // Metabolic Panel - enhanced patterns to catch natural language
  glucose: /(?:glucose|blood\s*sugar|bs|fbs)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mg\/dl|mmol\/l)?/i,
  creatinine: /(?:creatinine|cr)(?:\s+(?:raised|elevated|high|low|increased|decreased))?\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mg\/dl|mmol|umol)?/i,
  bun: /(?:bun|blood\s*urea\s*nitrogen|urea)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mg\/dl|mmol)?/i,
  sodium: /(?:sodium|na\+?)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:meq\/l|mmol\/l)?/i,
  potassium: /(?:potassium|k\+?)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:meq\/l|mmol\/l)?/i,
  chloride: /(?:chloride|cl)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:meq\/l|mmol\/l)?/i,
  bicarbonate: /(?:bicarbonate|hco3|co2)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:meq\/l|mmol\/l)?/i,
  calcium: /(?:calcium|ca)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  
  // Liver Function
  ast: /(?:ast|sgot|aspartate\s*aminotransferase)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:u\/l|iu\/l)?/i,
  alt: /(?:alt|sgpt|alanine\s*aminotransferase)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:u\/l|iu\/l)?/i,
  alp: /(?:alp|alkaline\s*phosphatase)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:u\/l|iu\/l)?/i,
  bilirubin: /(?:total\s*bilirubin|bilirubin|tbili)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  albumin: /(?:albumin|alb)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:g\/dl)?/i,
  
  // Cardiac markers - enhanced to catch "creatinine kinase" typo and natural language
  troponin: /(?:troponin|trop\s*[it])\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:ng\/ml)?/i,
  bnp: /(?:bnp|brain\s*natriuretic\s*peptide|nt-?pro\s*bnp)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:pg\/ml)?/i,
  ck: /(?:ck|cpk|creatine?\s*kinase)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:u\/l)?/i,
  
  // Inflammatory
  crp: /(?:crp|c-reactive\s*protein)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mg\/l|mg\/dl)?/i,
  esr: /(?:esr|sed\s*rate|erythrocyte\s*sedimentation)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mm\/hr)?/i,
  procalcitonin: /(?:procalcitonin|pct)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:ng\/ml)?/i,
  
  // Coagulation
  pt: /(?:pt|prothrombin\s*time)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:sec|seconds)?/i,
  inr: /(?:inr)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
  ptt: /(?:ptt|aptt|activated\s*partial)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:sec|seconds)?/i,
  d_dimer: /(?:d-?dimer)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:μg\/ml|ng\/ml)?/i,
  
  // Thyroid
  tsh: /(?:tsh|thyroid\s*stimulating)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:miu\/l)?/i,
  t4: /(?:free\s*t4|ft4|thyroxine)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:ng\/dl)?/i,
  t3: /(?:free\s*t3|ft3|triiodothyronine)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:pg\/ml)?/i,
  
  // Diabetes
  hba1c: /(?:hba1c|a1c|glycated\s*hemoglobin)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*%?/i,
  
  // Lipids
  cholesterol: /(?:total\s*cholesterol|cholesterol)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  ldl: /(?:ldl|ldl-c)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  hdl: /(?:hdl|hdl-c)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  triglycerides: /(?:triglycerides?|tg)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mg\/dl)?/i,
  
  // Kidney
  gfr: /(?:gfr|egfr|glomerular\s*filtration)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:ml\/min)?/i,
  urine_protein: /(?:urine\s*protein|proteinuria)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mg\/dl|g)?/i,
  
  // ABG
  ph: /(?:ph|arterial\s*ph)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
  pco2: /(?:pco2|paco2)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mmhg)?/i,
  po2: /(?:po2|pao2)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mmhg)?/i,
  o2sat: /(?:o2\s*sat|spo2|oxygen\s*saturation)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*%?/i,
  lactate: /(?:lactate|lactic\s*acid)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mmol\/l)?/i,
  
  // Vital Signs - commonly mentioned in clinical text
  heart_rate: /(?:heart\s*rate|hr|pulse|heart\s*beat)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:bpm|beats?\s*per\s*min(?:ute)?)?/i,
  systolic_bp: /(?:systolic|sbp|bp\s*sys)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mmhg)?/i,
  diastolic_bp: /(?:diastolic|dbp|bp\s*dia)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:mmhg)?/i,
  temperature: /(?:temp(?:erature)?|fever)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)\s*(?:°?[cf]|degrees)?/i,
  respiratory_rate: /(?:resp(?:iratory)?\s*rate|rr|breathing\s*rate)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
};

/**
 * Normal ranges for common labs (for determining direction)
 */
export const NORMAL_RANGES = {
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
  // Vital Signs
  heart_rate: { min: 60, max: 100, unit: 'bpm' },
  systolic_bp: { min: 90, max: 120, unit: 'mmHg' },
  diastolic_bp: { min: 60, max: 80, unit: 'mmHg' },
  temperature: { min: 36.1, max: 37.2, unit: '°C' },
  respiratory_rate: { min: 12, max: 20, unit: '/min' },
};

/**
 * Symptom keywords for extraction - expanded list
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
  // Additional symptoms for elderly/trauma
  'fall', 'falls', 'hip pain', 'sore hip', 'sore left hip', 'sore right hip',
  'irregular heartbeat', 'irregular heart beat', 'arrhythmia', 'atrial fibrillation',
  'tachycardia', 'bradycardia', 'palpitation',
  'acute kidney injury', 'aki', 'renal failure', 'kidney failure',
  'rhabdomyolysis', 'muscle breakdown',
  'fracture', 'broken bone', 'hip fracture',
];

// Mapping of common ICD codes to disease names (for imaging findings fallback)
const ICD_CODE_NAMES = {
  'I50': 'Heart Failure',
  'I50_2': 'Heart Failure with Reduced EF (HFrEF)',
  'I27': 'Pulmonary Heart Disease',
  'I26': 'Pulmonary Embolism',
  'I42': 'Cardiomyopathy',
  'I51': 'Complications of Heart Disease',
  'I30': 'Acute Pericarditis',
  'I31': 'Other Pericardial Diseases',
  'I11': 'Hypertensive Heart Disease',
  'I21': 'Acute Myocardial Infarction',
  'I25': 'Chronic Ischemic Heart Disease',
  'I34': 'Mitral Valve Disorders',
  'I35': 'Aortic Valve Disorders',
  'I36': 'Tricuspid Valve Disorders',
  'J81': 'Pulmonary Edema',
  'J90': 'Pleural Effusion',
  'C78': 'Secondary Malignant Neoplasm',
  'J18': 'Pneumonia',
  'J15': 'Bacterial Pneumonia',
  'J13': 'Pneumococcal Pneumonia',
  'J93': 'Pneumothorax',
  'J43': 'Emphysema',
  'J44': 'COPD',
  'K76': 'Other Liver Diseases',
  'K70': 'Alcoholic Liver Disease',
  'K74': 'Liver Fibrosis and Cirrhosis',
  'D73': 'Diseases of Spleen',
  'N13': 'Obstructive Uropathy',
  'Q61': 'Cystic Kidney Disease',
  'N28': 'Other Kidney Disorders',
  'G93': 'Other Brain Disorders',
  'I63': 'Cerebral Infarction',
  'I64': 'Stroke',
  'I61': 'Intracerebral Hemorrhage',
  'I62': 'Other Intracranial Hemorrhage',
};

// Clinical/Imaging findings that map to disease patterns
const CLINICAL_FINDING_PATTERNS = {
  // Cardiac findings
  'dilated_rv': { patterns: ['dilated right ventricle', 'rv dilation', 'rv dilated', 'right ventricle dilated'], organ: 'heart', direction: 'increase', severity: 'moderate', diseases: ['I50', 'I27', 'I26'] },
  'dilated_lv': { patterns: ['dilated left ventricle', 'lv dilation', 'lv dilated', 'left ventricle dilated'], organ: 'heart', direction: 'increase', severity: 'moderate', diseases: ['I50', 'I42'] },
  'reduced_ef': { patterns: ['reduced ejection fraction', 'reduced systolic function', 'ef reduced', 'low ef', 'depressed ef', 'moderately reduced systolic', 'severely reduced systolic'], organ: 'heart', direction: 'decrease', severity: 'severe', diseases: ['I50_2', 'I42'] },
  'cardiomegaly': { patterns: ['cardiomegaly', 'enlarged heart', 'cardiac enlargement'], organ: 'heart', direction: 'increase', severity: 'moderate', diseases: ['I50', 'I42', 'I51'] },
  'pericardial_effusion': { patterns: ['pericardial effusion', 'fluid around heart'], organ: 'heart', direction: 'increase', severity: 'moderate', diseases: ['I30', 'I31'] },
  'lvh': { patterns: ['left ventricular hypertrophy', 'lvh', 'lv hypertrophy', 'thickened lv'], organ: 'heart', direction: 'increase', severity: 'moderate', diseases: ['I11', 'I42'] },
  'wall_motion': { patterns: ['wall motion abnormality', 'hypokinesis', 'akinesis', 'dyskinesis'], organ: 'heart', direction: 'decrease', severity: 'moderate', diseases: ['I21', 'I25'] },
  'valvular': { patterns: ['mitral regurgitation', 'aortic stenosis', 'tricuspid regurgitation', 'valve disease'], organ: 'heart', direction: 'increase', severity: 'moderate', diseases: ['I34', 'I35', 'I36'] },
  
  // Pulmonary findings
  'pulmonary_congestion': { patterns: ['pulmonary congestion', 'pulmonary vascular congestion', 'pulmonary edema', 'vascular congestion'], organ: 'lungs', direction: 'increase', severity: 'moderate', diseases: ['I50', 'J81'] },
  'pleural_effusion': { patterns: ['pleural effusion', 'pleural fluid', 'fluid in pleural'], organ: 'lungs', direction: 'increase', severity: 'moderate', diseases: ['J90', 'I50', 'C78'] },
  'consolidation': { patterns: ['consolidation', 'infiltrate', 'opacity'], organ: 'lungs', direction: 'increase', severity: 'moderate', diseases: ['J18', 'J15', 'J13'] },
  'pneumothorax': { patterns: ['pneumothorax', 'collapsed lung'], organ: 'lungs', direction: 'increase', severity: 'severe', diseases: ['J93'] },
  'emphysema': { patterns: ['emphysema', 'hyperinflation', 'bullae'], organ: 'lungs', direction: 'increase', severity: 'moderate', diseases: ['J43', 'J44'] },
  
  // Abdominal findings
  'hepatomegaly': { patterns: ['hepatomegaly', 'enlarged liver', 'liver enlargement'], organ: 'liver', direction: 'increase', severity: 'moderate', diseases: ['K76', 'K70', 'I50'] },
  'splenomegaly': { patterns: ['splenomegaly', 'enlarged spleen'], organ: 'spleen', direction: 'increase', severity: 'moderate', diseases: ['D73', 'K76'] },
  'ascites': { patterns: ['ascites', 'abdominal fluid', 'peritoneal fluid'], organ: 'liver', direction: 'increase', severity: 'moderate', diseases: ['K70', 'K74', 'C78'] },
  
  // Renal findings
  'hydronephrosis': { patterns: ['hydronephrosis', 'dilated collecting system'], organ: 'kidneys', direction: 'increase', severity: 'moderate', diseases: ['N13'] },
  'renal_cyst': { patterns: ['renal cyst', 'kidney cyst'], organ: 'kidneys', direction: 'increase', severity: 'mild', diseases: ['Q61', 'N28'] },
  
  // Neurological findings
  'cerebral_edema': { patterns: ['cerebral edema', 'brain swelling'], organ: 'brain', direction: 'increase', severity: 'severe', diseases: ['G93'] },
  'infarct': { patterns: ['infarct', 'stroke', 'ischemic changes', 'acute infarction'], organ: 'brain', direction: 'increase', severity: 'severe', diseases: ['I63', 'I64'] },
  'hemorrhage': { patterns: ['hemorrhage', 'bleeding', 'hematoma'], organ: 'brain', direction: 'increase', severity: 'severe', diseases: ['I61', 'I62'] },
};

/**
 * Parse clinical text and extract findings
 * @param {string} clinicalText - Free text clinical notes
 * @returns {Object} Extracted findings {labs, symptoms, vitals, findings}
 */
export const parseClinicalText = (clinicalText) => {
  if (!clinicalText || typeof clinicalText !== 'string') {
    return { labs: [], symptoms: [], vitals: [], rawFindings: [] };
  }
  
  const textLower = clinicalText.toLowerCase();
  const extractedLabs = [];
  const extractedSymptoms = [];
  const rawFindings = [];
  
  // Additional patterns for "raised/elevated/high X to VALUE" constructs
  const qualitativePatterns = {
    creatinine: /(?:raised|elevated|high|increased)\s+creatinine\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
    ck: /(?:raised|elevated|high|increased)\s+(?:creatine?\s*kinase|ck|cpk)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
    troponin: /(?:raised|elevated|high|increased)\s+troponin\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
    bnp: /(?:raised|elevated|high|increased)\s+(?:bnp|nt-?pro\s*bnp)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
    wbc: /(?:raised|elevated|high|increased)\s+(?:wbc|white\s*cells?)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
    bilirubin: /(?:raised|elevated|high|increased)\s+bilirubin\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
    ast: /(?:raised|elevated|high|increased)\s+(?:ast|sgot)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
    alt: /(?:raised|elevated|high|increased)\s+(?:alt|sgpt)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
    lactate: /(?:raised|elevated|high|increased)\s+lactate\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
    glucose: /(?:raised|elevated|high|increased)\s+(?:glucose|blood\s*sugar)\s*(?:[:=]|of|is|at|to|up\s*to)?\s*([\d.]+)/i,
  };
  
  // First check qualitative patterns (they give implied direction)
  Object.entries(qualitativePatterns).forEach(([labName, pattern]) => {
    const match = textLower.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      const normalRange = NORMAL_RANGES[labName];
      
      // "raised/elevated" implies increase
      extractedLabs.push({
        parameterId: labName,
        name: labName.replace(/_/g, ' ').toUpperCase(),
        value,
        unit: normalRange?.unit || '',
        direction: 'increase',
        severity: 2, // Assume moderate severity when explicitly mentioned as raised
        normalRange: normalRange ? `${normalRange.min}-${normalRange.max}` : 'N/A',
        isAbnormal: true,
      });
      
      rawFindings.push({
        type: 'lab',
        name: labName,
        value,
        direction: 'increase',
      });
    }
  });
  
  // Extract lab values using standard patterns
  Object.entries(LAB_PATTERNS).forEach(([labName, pattern]) => {
    // Skip if already extracted via qualitative pattern
    if (extractedLabs.some(l => l.parameterId === labName)) {
      return;
    }
    
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
  
  // Extract imaging/clinical findings
  const extractedFindings = [];
  Object.entries(CLINICAL_FINDING_PATTERNS).forEach(([findingId, finding]) => {
    const found = finding.patterns.some(pattern => textLower.includes(pattern));
    if (found) {
      extractedFindings.push({
        parameterId: findingId,
        name: findingId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        organ: finding.organ,
        direction: finding.direction,
        severity: finding.severity,
        diseases: finding.diseases,
        isAbnormal: true,
        type: 'imaging',
      });
      
      rawFindings.push({
        type: 'imaging',
        name: findingId,
        direction: finding.direction,
        diseases: finding.diseases,
      });
    }
  });
  
  // Combine all findings for the return value
  const allFindings = [
    ...extractedLabs.map(l => ({ ...l, type: 'lab' })),
    ...extractedFindings,
    ...extractedSymptoms.map(s => ({ 
      parameterId: s.name.replace(/\s+/g, '_'),
      name: s.name,
      direction: 'present',
      severity: 'moderate',
      isAbnormal: true,
      type: 'symptom',
    })),
  ];
  
  return {
    labs: extractedLabs,
    symptoms: extractedSymptoms,
    findings: extractedFindings,
    vitals: [],
    rawFindings,
    // Provide findings in the format expected by handleAnalyzeText
    findings: allFindings,
    summary: {
      labCount: extractedLabs.length,
      symptomCount: extractedSymptoms.length,
      findingCount: extractedFindings.length,
      abnormalLabs: extractedLabs.filter(l => l.isAbnormal).length,
      totalFindings: allFindings.length,
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
