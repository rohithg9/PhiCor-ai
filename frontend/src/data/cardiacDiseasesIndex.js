// ============================================================================
// COMPLETE CARDIAC DISEASE DATABASE INDEX
// ICD-10-CM Chapter 9: I00-I99 - Diseases of the Circulatory System
// ============================================================================
// 
// This module aggregates all cardiac disease data for:
// 1. Frontend visualization in the Mathematical Human dashboard
// 2. Future backend API for EMR/FHIR integration
// 3. Clinical decision support matching
//
// FHIR R4 Compatible | HIPAA Compliant | HL7 CDA Compatible
// ============================================================================

import { CARDIAC_DISEASES } from './cardiacDiseases';
import { CARDIAC_DISEASES_PART2, NOVEL_EQUATIONS as NOVEL_EQ_P2 } from './cardiacDiseasesPart2';
import { CARDIAC_DISEASES_PART3, NOVEL_EQUATIONS_PART3 as NOVEL_EQ_P3 } from './cardiacDiseasesPart3';
import { CARDIAC_DISEASES_PART4 } from './cardiacDiseasesPart4';
import { CARDIAC_DISEASES_PART5 } from './cardiacDiseasesPart5';
import { CARDIAC_DISEASES_PART6, NOVEL_EQUATIONS_PART6 as NOVEL_EQ_P6 } from './cardiacDiseasesPart6';
import { CARDIAC_DISEASES_PART7 } from './cardiacDiseasesPart7';
import { CARDIAC_DISEASES_PART8 } from './cardiacDiseasesPart8';

// Merge all cardiac diseases into single object
export const ALL_CARDIAC_DISEASES = {
  ...CARDIAC_DISEASES,
  ...CARDIAC_DISEASES_PART2,
  ...CARDIAC_DISEASES_PART3,
  ...CARDIAC_DISEASES_PART4,
  ...CARDIAC_DISEASES_PART5,
  ...CARDIAC_DISEASES_PART6,
  ...CARDIAC_DISEASES_PART7,
  ...CARDIAC_DISEASES_PART8
};

// Aggregate all novel equations
export const ALL_NOVEL_EQUATIONS = [
  ...NOVEL_EQ_P2,
  ...NOVEL_EQ_P3,
  ...(NOVEL_EQ_P6 || [])
];

// Helper: Get disease by ICD-10 code
export const getDiseaseByCode = (icd10Code) => {
  const normalizedCode = icd10Code.replace('.', '_');
  return ALL_CARDIAC_DISEASES[normalizedCode] || null;
};

// Helper: Get all diseases in a category
export const getDiseasesByCategory = (category) => {
  return Object.entries(ALL_CARDIAC_DISEASES)
    .filter(([_, disease]) => disease.category === category)
    .map(([code, disease]) => ({ code, ...disease }));
};

// Helper: Get diseases affecting a specific organ
export const getDiseasesByAffectedOrgan = (organ) => {
  return Object.entries(ALL_CARDIAC_DISEASES)
    .filter(([_, disease]) => {
      // Check if disease affects the organ
      const affectedOrgans = disease.affectedOrgans || [];
      const primaryOrgan = disease.primaryOrgan || '';
      return affectedOrgans.includes(organ) || primaryOrgan === organ;
    })
    .map(([code, disease]) => ({ code, ...disease }));
};

// Helper: Get all novel equations
export const getNovelEquations = () => {
  const equations = [];
  
  Object.entries(ALL_CARDIAC_DISEASES).forEach(([code, disease]) => {
    // Check pathophysiology.novelEquations
    if (disease.pathophysiology?.novelEquations) {
      disease.pathophysiology.novelEquations.forEach(eq => {
        if (eq.isNovel) {
          equations.push({
            ...eq,
            diseaseCode: code,
            diseaseName: disease.name
          });
        }
      });
    }
    
    // Check pathophysiology.equations (some may be marked novel)
    if (disease.pathophysiology?.equations) {
      Object.entries(disease.pathophysiology.equations).forEach(([eqId, eq]) => {
        if (eq.isNovel) {
          equations.push({
            id: eqId,
            ...eq,
            diseaseCode: code,
            diseaseName: disease.name
          });
        }
      });
    }
  });
  
  return equations;
};

// Helper: Search diseases by symptoms
export const searchBySymptoms = (symptoms) => {
  const results = [];
  const symptomLower = symptoms.map(s => s.toLowerCase());
  
  Object.entries(ALL_CARDIAC_DISEASES).forEach(([code, disease]) => {
    let matchScore = 0;
    const matchedSymptoms = [];
    
    // Search in clinical presentation
    const presentation = disease.clinicalPresentation?.symptoms || {};
    
    Object.values(presentation).forEach(symptomGroup => {
      if (Array.isArray(symptomGroup)) {
        symptomGroup.forEach(symptom => {
          const symptomName = (symptom.name || symptom).toLowerCase();
          symptomLower.forEach(search => {
            if (symptomName.includes(search)) {
              matchScore++;
              matchedSymptoms.push(symptom.name || symptom);
            }
          });
        });
      }
    });
    
    if (matchScore > 0) {
      results.push({
        code,
        disease,
        matchScore,
        matchedSymptoms
      });
    }
  });
  
  // Sort by match score descending
  return results.sort((a, b) => b.matchScore - a.matchScore);
};

// Helper: Search diseases by lab findings
export const searchByLabFindings = (labTests) => {
  const results = [];
  
  Object.entries(ALL_CARDIAC_DISEASES).forEach(([code, disease]) => {
    let matchScore = 0;
    const matchedTests = [];
    
    const labFindings = disease.laboratoryFindings || {};
    
    Object.values(labFindings).forEach(testGroup => {
      if (Array.isArray(testGroup)) {
        testGroup.forEach(test => {
          const testName = (test.test || test.name || '').toLowerCase();
          labTests.forEach(search => {
            if (testName.includes(search.toLowerCase())) {
              matchScore++;
              matchedTests.push({
                test: test.test || test.name,
                expected: test.abnormalInDisease || test.expected
              });
            }
          });
        });
      }
    });
    
    if (matchScore > 0) {
      results.push({
        code,
        disease,
        matchScore,
        matchedTests
      });
    }
  });
  
  return results.sort((a, b) => b.matchScore - a.matchScore);
};

// Categories of cardiac diseases
export const CARDIAC_CATEGORIES = {
  rheumatic: { name: "Rheumatic Heart Disease", icdRange: "I00-I09", icon: "🦠" },
  hypertensive: { name: "Hypertensive Heart Disease", icdRange: "I10-I16", icon: "📈" },
  ischemic: { name: "Ischemic Heart Disease", icdRange: "I20-I25", icon: "❤️‍🔥" },
  pulmonary_vascular: { name: "Pulmonary Heart Disease", icdRange: "I26-I28", icon: "🫁" },
  pericardial: { name: "Pericardial Diseases", icdRange: "I30-I32", icon: "💜" },
  valvular: { name: "Valvular Heart Disease", icdRange: "I33-I39", icon: "🚪" },
  cardiomyopathy: { name: "Cardiomyopathies", icdRange: "I42-I43", icon: "💔" },
  arrhythmia: { name: "Arrhythmias", icdRange: "I44-I49", icon: "⚡" },
  heartFailure: { name: "Heart Failure", icdRange: "I50", icon: "💓" },
  cerebrovascular: { name: "Cerebrovascular Disease", icdRange: "I60-I69", icon: "🧠" },
  vascular: { name: "Vascular Diseases", icdRange: "I70-I89", icon: "🩸" }
};

// Statistics
export const getStatistics = () => {
  const totalDiseases = Object.keys(ALL_CARDIAC_DISEASES).length;
  const novelEquations = getNovelEquations().length;
  const categoryCounts = {};
  
  Object.values(ALL_CARDIAC_DISEASES).forEach(disease => {
    const cat = disease.category || 'uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  
  return {
    totalDiseases,
    novelEquations,
    categoryCounts,
    categories: Object.keys(CARDIAC_CATEGORIES).length
  };
};

// FHIR R4 Condition resource generator
export const toFHIRCondition = (diseaseCode, patientRef = null) => {
  const disease = getDiseaseByCode(diseaseCode);
  if (!disease) return null;
  
  return {
    resourceType: "Condition",
    clinicalStatus: {
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
        code: "active"
      }]
    },
    verificationStatus: {
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
        code: "confirmed"
      }]
    },
    category: [{
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/condition-category",
        code: "problem-list-item",
        display: "Problem List Item"
      }]
    }],
    code: {
      coding: [
        {
          system: "http://hl7.org/fhir/sid/icd-10-cm",
          code: disease.icd10,
          display: disease.name
        },
        ...(disease.snomedCT ? [{
          system: "http://snomed.info/sct",
          code: disease.snomedCT,
          display: disease.name
        }] : [])
      ],
      text: disease.name
    },
    ...(patientRef && { subject: { reference: patientRef } })
  };
};

export default {
  ALL_CARDIAC_DISEASES,
  ALL_NOVEL_EQUATIONS,
  getDiseaseByCode,
  getDiseasesByCategory,
  getDiseasesByAffectedOrgan,
  getNovelEquations,
  searchBySymptoms,
  searchByLabFindings,
  CARDIAC_CATEGORIES,
  getStatistics,
  toFHIRCondition
};
