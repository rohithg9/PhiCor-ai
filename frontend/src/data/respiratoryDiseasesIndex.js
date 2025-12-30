// ============================================================
// RESPIRATORY DISEASES INDEX
// Aggregates all respiratory disease modules
// ============================================================

import { RESPIRATORY_DISEASES } from './respiratoryDiseases';
import { RESPIRATORY_DISEASES_PART2 } from './respiratoryDiseasesPart2';

// Merge all respiratory diseases into single object
export const ALL_RESPIRATORY_DISEASES = {
  ...RESPIRATORY_DISEASES,
  ...RESPIRATORY_DISEASES_PART2
};

// Categories for respiratory diseases
export const RESPIRATORY_CATEGORIES = {
  obstructive: {
    label: "Obstructive Lung Disease",
    codes: ["J44", "J45", "J46"],
    description: "COPD, Asthma, Status Asthmaticus"
  },
  interstitial: {
    label: "Interstitial Lung Disease",
    codes: ["J84"],
    description: "Pulmonary fibrosis, ILD"
  },
  infectious: {
    label: "Respiratory Infections",
    codes: ["J13", "J18"],
    description: "Pneumonia, respiratory infections"
  },
  vascular: {
    label: "Pulmonary Vascular",
    codes: ["I26", "J80"],
    description: "Pulmonary embolism, ARDS"
  },
  pleural: {
    label: "Pleural Diseases",
    codes: ["J90"],
    description: "Pleural effusion"
  },
  neoplastic: {
    label: "Lung Cancer",
    codes: ["C34"],
    description: "Primary lung malignancies"
  }
};

// Get disease count by category
export const getRespiratoryDiseaseCount = () => {
  return Object.keys(ALL_RESPIRATORY_DISEASES).length;
};

// Get diseases by category
export const getRespiratoryDiseasesByCategory = (category) => {
  return Object.entries(ALL_RESPIRATORY_DISEASES).filter(([code, disease]) => {
    return RESPIRATORY_CATEGORIES[category]?.codes.some(prefix => code.startsWith(prefix));
  });
};

export default ALL_RESPIRATORY_DISEASES;
