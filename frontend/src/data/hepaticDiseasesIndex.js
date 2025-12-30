// ============================================================
// HEPATIC DISEASES INDEX
// Aggregates all hepatic/liver disease modules
// ============================================================

import { HEPATIC_DISEASES } from './hepaticDiseases';

// Merge all hepatic diseases into single object
export const ALL_HEPATIC_DISEASES = {
  ...HEPATIC_DISEASES
};

// Hepatic disease categories
export const HEPATIC_CATEGORIES = [
  { id: 'alcoholic', name: 'Alcoholic Liver Disease', prefix: 'K70' },
  { id: 'nafld', name: 'Non-Alcoholic Fatty Liver Disease', prefix: 'K76.0,K75.81' },
  { id: 'viral', name: 'Viral Hepatitis', prefix: 'B18' },
  { id: 'failure', name: 'Liver Failure', prefix: 'K72' },
  { id: 'portal', name: 'Portal Hypertension', prefix: 'K76.6' },
  { id: 'biliary', name: 'Biliary Diseases', prefix: 'K80,K83' }
];

export default ALL_HEPATIC_DISEASES;
