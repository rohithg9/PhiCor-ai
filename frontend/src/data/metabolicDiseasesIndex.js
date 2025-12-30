// ============================================================
// METABOLIC DISEASES INDEX
// Aggregates all metabolic/endocrine disease modules
// ============================================================

import { METABOLIC_DISEASES } from './metabolicDiseases';

// Merge all metabolic diseases into single object
export const ALL_METABOLIC_DISEASES = {
  ...METABOLIC_DISEASES
};

// Metabolic disease categories
export const METABOLIC_CATEGORIES = [
  { id: 'diabetes', name: 'Diabetes Mellitus', prefix: 'E10,E11,E13' },
  { id: 'thyroid', name: 'Thyroid Disorders', prefix: 'E03,E05,E06' },
  { id: 'adrenal', name: 'Adrenal Disorders', prefix: 'E24,E27,D35' },
  { id: 'lipid', name: 'Lipid Disorders', prefix: 'E78' },
  { id: 'obesity', name: 'Obesity & Metabolic Syndrome', prefix: 'E66,E88' },
  { id: 'bone', name: 'Bone Metabolism', prefix: 'M81' },
  { id: 'other', name: 'Other Metabolic', prefix: 'M10,E79' }
];

export default ALL_METABOLIC_DISEASES;
