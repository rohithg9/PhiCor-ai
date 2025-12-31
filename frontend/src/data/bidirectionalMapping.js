// ============================================================
// BIDIRECTIONAL PARAMETER-DISEASE MAPPING
// Enables reverse lookup: parameter → conditions that affect it
// For EMR integration and clinical decision support
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
 * Get differential diagnosis based on multiple abnormal parameters
 * @param {Array} abnormalParams - Array of {parameterId, direction} objects
 * @returns {Array} Ranked list of conditions that match the pattern
 */
export const getDifferentialDiagnosis = (abnormalParams) => {
  if (!abnormalParams || abnormalParams.length === 0) return [];
  
  const conditionScores = {};
  
  abnormalParams.forEach(({ parameterId, direction }) => {
    const matches = getConditionsAffectingParameter(parameterId, direction);
    
    matches.forEach(match => {
      const key = match.diseaseCode;
      if (!conditionScores[key]) {
        conditionScores[key] = {
          ...match,
          matchCount: 0,
          matchedParams: [],
          totalScore: 0,
        };
      }
      
      conditionScores[key].matchCount += 1;
      conditionScores[key].matchedParams.push({
        param: parameterId,
        direction,
        factor: match.factor,
      });
      // Score based on magnitude of change
      conditionScores[key].totalScore += Math.abs(match.factor - 1);
    });
  });
  
  // Convert to array and sort by number of matches, then by total score
  const results = Object.values(conditionScores)
    .sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return b.totalScore - a.totalScore;
    });
  
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

// Pre-built index for performance (can be called on app load)
let cachedParameterIndex = null;
let cachedSymptomIndex = null;

export const initializeIndexes = () => {
  cachedParameterIndex = buildParameterToDiseaseIndex();
  cachedSymptomIndex = buildSymptomToDiseaseIndex();
  console.log('Bidirectional indexes initialized:', {
    parameterCount: Object.keys(cachedParameterIndex).length,
    symptomCategories: Object.keys(cachedSymptomIndex).length,
  });
};

export const getCachedParameterIndex = () => cachedParameterIndex || buildParameterToDiseaseIndex();
export const getCachedSymptomIndex = () => cachedSymptomIndex || buildSymptomToDiseaseIndex();

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
  initializeIndexes,
};
