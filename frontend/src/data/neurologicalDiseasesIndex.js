// ============================================================
// NEUROLOGICAL DISEASES INDEX
// Aggregates all neurological disease modules
// ============================================================

import { NEUROLOGICAL_DISEASES } from './neurologicalDiseases';

// Merge all neurological diseases into single object
export const ALL_NEUROLOGICAL_DISEASES = {
  ...NEUROLOGICAL_DISEASES
};

// Neurological disease categories
export const NEUROLOGICAL_CATEGORIES = [
  { id: 'stroke', name: 'Cerebrovascular Disease', prefix: 'I60,I61,I63' },
  { id: 'seizure', name: 'Epilepsy & Seizures', prefix: 'G40,G41' },
  { id: 'headache', name: 'Headache Disorders', prefix: 'G43,G44' },
  { id: 'movement', name: 'Movement Disorders', prefix: 'G20,G25' },
  { id: 'demyelinating', name: 'Demyelinating Diseases', prefix: 'G35' },
  { id: 'dementia', name: 'Neurodegenerative', prefix: 'G30' },
  { id: 'neuropathy', name: 'Peripheral Neuropathy', prefix: 'G60,G61,G62' },
  { id: 'meningitis', name: 'Meningitis', prefix: 'G00,G03' }
];

export default ALL_NEUROLOGICAL_DISEASES;
