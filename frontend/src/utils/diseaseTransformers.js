/**
 * Disease Transformation Utilities
 * Transforms disease data from various sources into a unified format
 */

import DISEASE_MODELS from '../data/diseaseModels';

/**
 * Generic transform function for diseases
 */
const transformDisease = (code, disease, config = {}) => {
  const { 
    defaultPrimaryOrgan = 'heart',
    defaultCategory = 'general',
    organMapping = {}
  } = config;
  
  const icd10Code = code.replace('_', '.');
  
  // Find matching disease model by ICD-10 code
  const matchingDiseaseKey = Object.keys(DISEASE_MODELS).find(key => {
    const dm = DISEASE_MODELS[key];
    return dm.icd10 === icd10Code || dm.icd10_code === icd10Code;
  });
  const matchingDisease = matchingDiseaseKey ? DISEASE_MODELS[matchingDiseaseKey] : null;
  
  // Determine affected organs from modifications
  const affectedOrgans = disease.modifications 
    ? Object.keys(disease.modifications).map(key => organMapping[key] || key)
    : [defaultPrimaryOrgan];
  
  return {
    id: code.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: disease.name || code.replace(/_/g, ' '),
    icd10: disease.icd10 || icd10Code,
    primaryOrgan: matchingDisease?.primaryOrgan || disease.primaryOrgan || defaultPrimaryOrgan,
    affectedOrgans: [...new Set([...affectedOrgans, ...(matchingDisease?.affectedOrgans || [])])],
    category: disease.category || matchingDisease?.category || defaultCategory,
    definition: disease.definition || disease.description || matchingDisease?.definition || `A condition affecting ${defaultPrimaryOrgan} function`,
    modifications: {
      ...(matchingDisease?.modifications || {}),
      ...(disease.modifications || {})
    },
    clinicalPresentation: {
      ...(matchingDisease?.clinicalPresentation || {}),
      ...(disease.clinicalPresentation || {})
    },
    parameter_modifications: disease.parameter_modifications || matchingDisease?.parameter_modifications || {}
  };
};

/**
 * Transform cardiac disease
 */
export const transformCardiacDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'heart',
    defaultCategory: 'cardiovascular',
    organMapping: {
      cardiac: 'heart',
      cardiovascular: 'heart',
      vascular: 'blood'
    }
  });
};

/**
 * Transform respiratory disease
 */
export const transformRespiratoryDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'lungs',
    defaultCategory: 'respiratory',
    organMapping: {
      pulmonary: 'lungs',
      respiratory: 'lungs',
      airway: 'lungs'
    }
  });
};

/**
 * Transform renal disease
 */
export const transformRenalDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'kidneys',
    defaultCategory: 'renal',
    organMapping: {
      renal: 'kidneys',
      kidney: 'kidneys',
      urinary: 'kidneys'
    }
  });
};

/**
 * Transform neurological disease
 */
export const transformNeurologicalDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'brain',
    defaultCategory: 'neurological',
    organMapping: {
      neuro: 'brain',
      neurological: 'brain',
      cerebral: 'brain',
      cns: 'brain'
    }
  });
};

/**
 * Transform hepatic/liver disease
 */
export const transformHepaticDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'liver',
    defaultCategory: 'gastrointestinal',
    organMapping: {
      hepatic: 'liver',
      liver: 'liver',
      biliary: 'liver'
    }
  });
};

/**
 * Transform metabolic/endocrine disease
 */
export const transformMetabolicDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'pancreas',
    defaultCategory: 'endocrine',
    organMapping: {
      metabolic: 'pancreas',
      endocrine: 'thyroid',
      pancreatic: 'pancreas'
    }
  });
};

/**
 * Transform hematological disease
 */
export const transformHematologicalDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'blood',
    defaultCategory: 'hematological',
    organMapping: {
      hematological: 'blood',
      hematologic: 'blood',
      blood: 'blood',
      marrow: 'bone_marrow'
    }
  });
};

/**
 * Transform oncology disease
 */
export const transformOncologyDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'cellular',
    defaultCategory: 'oncology',
    organMapping: {
      tumor: 'cellular',
      cancer: 'cellular',
      oncology: 'cellular'
    }
  });
};

/**
 * Transform congenital disease
 */
export const transformCongenitalDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'heart',
    defaultCategory: 'congenital',
    organMapping: {}
  });
};

/**
 * Transform autoimmune disease
 */
export const transformAutoimmuneDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'immune_system',
    defaultCategory: 'rheumatological',
    organMapping: {
      autoimmune: 'immune_system',
      immune: 'immune_system',
      rheumatic: 'joints'
    }
  });
};

/**
 * Transform infectious disease
 */
export const transformInfectiousDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'immune_system',
    defaultCategory: 'infectious',
    organMapping: {
      infectious: 'immune_system',
      infection: 'immune_system',
      viral: 'immune_system',
      bacterial: 'immune_system'
    }
  });
};

/**
 * Transform GI disease
 */
export const transformGIDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'gi_tract',
    defaultCategory: 'gastrointestinal',
    organMapping: {
      gi: 'gi_tract',
      gastrointestinal: 'gi_tract',
      digestive: 'gi_tract',
      intestinal: 'gi_tract'
    }
  });
};

/**
 * Transform dermatological disease
 */
export const transformDermatologicalDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'skin',
    defaultCategory: 'dermatological',
    organMapping: {
      dermal: 'skin',
      dermatological: 'skin',
      skin: 'skin',
      cutaneous: 'skin'
    }
  });
};

/**
 * Transform psychiatric disease
 */
export const transformPsychiatricDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'brain',
    defaultCategory: 'psychiatric',
    organMapping: {
      psychiatric: 'brain',
      mental: 'brain',
      psychological: 'brain',
      mood: 'brain'
    }
  });
};

/**
 * Transform pediatric disease
 */
export const transformPediatricDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'general',
    defaultCategory: 'pediatric',
    organMapping: {}
  });
};

/**
 * Transform OB/GYN disease
 */
export const transformOBGYNDisease = (code, disease) => {
  return transformDisease(code, disease, {
    defaultPrimaryOrgan: 'reproductive',
    defaultCategory: 'obstetric_gynecologic',
    organMapping: {
      obstetric: 'reproductive',
      gynecologic: 'reproductive',
      uterine: 'reproductive',
      ovarian: 'reproductive'
    }
  });
};

/**
 * Get disease model keys that have ICD-10 codes covered by specialized transformers
 */
export const getDiseaseModelKeysByIcd10 = () => {
  const icd10Covered = new Set();
  // Add all ICD-10 codes that are covered by the specialized disease files
  // This is used to avoid duplicates when merging disease data
  return Array.from(icd10Covered);
};

export default {
  transformCardiacDisease,
  transformRespiratoryDisease,
  transformRenalDisease,
  transformNeurologicalDisease,
  transformHepaticDisease,
  transformMetabolicDisease,
  transformHematologicalDisease,
  transformOncologyDisease,
  transformCongenitalDisease,
  transformAutoimmuneDisease,
  transformInfectiousDisease,
  transformGIDisease,
  transformDermatologicalDisease,
  transformPsychiatricDisease,
  transformPediatricDisease,
  transformOBGYNDisease,
  getDiseaseModelKeysByIcd10
};
