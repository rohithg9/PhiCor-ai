// ============================================================
// RENAL DISEASES INDEX
// Aggregates all renal disease modules
// ============================================================

import { RENAL_DISEASES } from './renalDiseases';

// Merge all renal diseases into single object
export const ALL_RENAL_DISEASES = {
  ...RENAL_DISEASES
};

// Renal disease categories
export const RENAL_CATEGORIES = [
  { id: 'aki', name: 'Acute Kidney Injury', prefix: 'N17' },
  { id: 'ckd', name: 'Chronic Kidney Disease', prefix: 'N18' },
  { id: 'glomerular', name: 'Glomerular Diseases', prefix: 'N00,N03,N04' },
  { id: 'diabeticNephropathy', name: 'Diabetic Nephropathy', prefix: 'E11' },
  { id: 'hypertensiveNephropathy', name: 'Hypertensive Nephropathy', prefix: 'I12' },
  { id: 'uti', name: 'Urinary Tract Infections', prefix: 'N10,N30,N39' },
  { id: 'nephrolithiasis', name: 'Nephrolithiasis', prefix: 'N20' },
  { id: 'pkd', name: 'Polycystic Kidney Disease', prefix: 'Q61' }
];

export default ALL_RENAL_DISEASES;
