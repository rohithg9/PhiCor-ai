import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Global Patient Context
 * 
 * Provides patient profile data and modifiers across all analysis engines:
 * - Food Analysis: Adjusts nutrient recommendations based on patient conditions
 * - Drug Analysis: Adjusts dosing and warns of interactions
 * - Differential Diagnosis: Factors patient history into probability calculations
 * - Disease Analysis: Shows patient-specific parameter modifications
 */

// Default patient with no modifiers (baseline)
const DEFAULT_PATIENT = {
  id: 'baseline',
  name: 'Baseline (No Patient)',
  isBaseline: true,
  demographics: {
    age: null,
    sex: null,
    height: null,
    weight: null,
    bmi: null,
    ethnicity: null
  },
  vitalSigns: {
    bloodPressure: { systolic: null, diastolic: null },
    heartRate: null,
    temperature: null,
    respiratoryRate: null,
    oxygenSaturation: null
  },
  riskFactors: {
    smoking: 'never', // never, former, current
    smokingPackYears: 0,
    alcohol: 'none', // none, light, moderate, heavy
    alcoholDrinksPerWeek: 0,
    physicalActivity: 'moderate', // sedentary, light, moderate, active
    diet: 'mixed' // vegetarian, vegan, mixed, keto, etc.
  },
  familyHistory: {
    cad: false,
    diabetes: false,
    stroke: false,
    cancer: false,
    hypertension: false,
    arrhythmia: false,
    suddenDeath: false,
    kidneyDisease: false,
    liverDisease: false
  },
  medicalHistory: {
    conditions: [], // Array of condition IDs
    surgeries: [],
    allergies: []
  },
  currentMedications: [], // Array of { drugId, name, dose, frequency }
  labValues: {}, // Recent lab values: { creatinine: 1.2, hba1c: 6.5, ... }
  modifiers: {} // Calculated modifiers
};

// Calculate modifiers based on patient characteristics
const calculateModifiers = (patient) => {
  if (!patient || patient.isBaseline) return {};
  
  const modifiers = {
    // Base risk multipliers
    cardiovascular: 1.0,
    renal: 1.0,
    hepatic: 1.0,
    metabolic: 1.0,
    respiratory: 1.0,
    neurological: 1.0,
    hematological: 1.0,
    immune: 1.0,
    // Specific parameter adjustments
    parameters: {}
  };
  
  const { demographics, riskFactors, familyHistory, medicalHistory, currentMedications } = patient;
  
  // Age-based modifiers
  if (demographics?.age) {
    const age = parseInt(demographics.age);
    if (age >= 65) {
      modifiers.cardiovascular *= 1.2 + (age - 65) * 0.02;
      modifiers.renal *= 0.95 - (age - 65) * 0.01;
      modifiers.parameters.gfr_reduction = (age - 65) * 0.8; // GFR decreases with age
    }
    if (age >= 75) {
      modifiers.neurological *= 1.3;
      modifiers.hematological *= 1.2; // Bleeding risk increases
    }
    if (age < 18) {
      modifiers.metabolic *= 1.2; // Higher metabolic rate in children
    }
  }
  
  // Sex-based modifiers
  if (demographics?.sex === 'female') {
    modifiers.parameters.hemoglobin_base = 0.9;
    modifiers.cardiovascular *= 0.85; // Generally lower CV risk pre-menopause
  }
  
  // BMI-based modifiers
  if (demographics?.bmi) {
    const bmi = parseFloat(demographics.bmi);
    if (bmi >= 30) {
      modifiers.metabolic *= 1.3 + (bmi - 30) * 0.05;
      modifiers.cardiovascular *= 1.1 + (bmi - 30) * 0.02;
      modifiers.parameters.insulin_resistance = 1 + (bmi - 30) * 0.1;
    }
    if (bmi < 18.5) {
      modifiers.immune *= 0.9;
      modifiers.parameters.malnutrition_risk = 1.3;
    }
  }
  
  // Smoking modifiers
  if (riskFactors?.smoking === 'current') {
    const packYears = riskFactors.smokingPackYears || 10;
    modifiers.respiratory *= 0.85 - packYears * 0.01;
    modifiers.cardiovascular *= 1.3 + packYears * 0.02;
    modifiers.parameters.lung_function_reduction = packYears * 2;
  } else if (riskFactors?.smoking === 'former') {
    modifiers.respiratory *= 0.95;
    modifiers.cardiovascular *= 1.1;
  }
  
  // Alcohol modifiers
  if (riskFactors?.alcohol === 'heavy') {
    modifiers.hepatic *= 0.7;
    modifiers.hematological *= 1.3;
    modifiers.neurological *= 1.2;
  }
  
  // Family history modifiers
  if (familyHistory?.cad) modifiers.cardiovascular *= 1.5;
  if (familyHistory?.diabetes) modifiers.metabolic *= 1.5;
  if (familyHistory?.stroke) modifiers.neurological *= 1.4;
  if (familyHistory?.kidneyDisease) modifiers.renal *= 1.3;
  if (familyHistory?.liverDisease) modifiers.hepatic *= 1.3;
  
  // Condition-based modifiers
  const conditions = medicalHistory?.conditions || [];
  if (conditions.includes('diabetes') || conditions.includes('type_2_diabetes')) {
    modifiers.cardiovascular *= 1.5;
    modifiers.renal *= 1.3;
    modifiers.neurological *= 1.2;
    modifiers.parameters.glucose_sensitivity = 2.0;
  }
  if (conditions.includes('hypertension')) {
    modifiers.cardiovascular *= 1.4;
    modifiers.renal *= 1.2;
  }
  if (conditions.includes('ckd') || conditions.includes('chronic_kidney_disease')) {
    modifiers.renal *= 0.5;
    modifiers.cardiovascular *= 1.3;
    modifiers.parameters.drug_clearance_reduction = 0.6;
  }
  if (conditions.includes('cirrhosis') || conditions.includes('liver_disease')) {
    modifiers.hepatic *= 0.4;
    modifiers.hematological *= 1.4;
    modifiers.parameters.drug_metabolism_reduction = 0.5;
  }
  if (conditions.includes('copd')) {
    modifiers.respiratory *= 0.6;
  }
  if (conditions.includes('heart_failure')) {
    modifiers.cardiovascular *= 1.8;
    modifiers.renal *= 1.3;
  }
  
  // Medication interaction considerations
  const medications = currentMedications || [];
  if (medications.some(m => m.name?.toLowerCase().includes('warfarin') || m.name?.toLowerCase().includes('coumadin'))) {
    modifiers.hematological *= 1.5;
    modifiers.parameters.bleeding_risk = 2.0;
  }
  if (medications.some(m => m.name?.toLowerCase().includes('metformin'))) {
    modifiers.parameters.lactic_acidosis_risk = 1.2;
  }
  
  return modifiers;
};

// Apply modifiers to analysis results
const applyModifiersToAnalysis = (analysisResult, modifiers, analysisType) => {
  if (!modifiers || Object.keys(modifiers).length === 0) return analysisResult;
  
  const modified = { ...analysisResult };
  
  switch (analysisType) {
    case 'food':
      // Adjust nutrient recommendations based on patient conditions
      if (modified.nutrients) {
        modified.nutrientsWithModifiers = { ...modified.nutrients };
        // Example: Reduce sodium recommendation for hypertensive patients
        if (modifiers.cardiovascular > 1.3 && modified.nutrientsWithModifiers.sodium) {
          modified.nutrientsWithModifiers.sodium.recommendation = 'Reduce intake';
          modified.nutrientsWithModifiers.sodium.patientNote = 'Elevated cardiovascular risk - limit sodium';
        }
      }
      break;
      
    case 'drug':
      // Adjust dosing based on renal/hepatic function
      if (modified.dosing && modifiers.parameters) {
        if (modifiers.parameters.drug_clearance_reduction) {
          modified.adjustedDosing = {
            ...modified.dosing,
            recommendation: `Consider ${Math.round(modifiers.parameters.drug_clearance_reduction * 100)}% of standard dose due to renal impairment`
          };
        }
      }
      break;
      
    case 'differential':
      // Adjust diagnosis probabilities based on risk factors
      if (modified.differentials) {
        modified.differentialsWithModifiers = modified.differentials.map(d => {
          let adjustedProbability = d.probability || d.probabilityScore || 0;
          
          // Cardiac conditions more likely with high CV risk
          if (d.category === 'cardiac' && modifiers.cardiovascular > 1) {
            adjustedProbability *= modifiers.cardiovascular;
          }
          
          return {
            ...d,
            originalProbability: d.probability || d.probabilityScore,
            adjustedProbability: Math.min(100, Math.round(adjustedProbability)),
            modifierApplied: modifiers.cardiovascular > 1 ? 'cardiovascular_risk' : null
          };
        });
      }
      break;
      
    default:
      break;
  }
  
  return modified;
};

// Context
const PatientContext = createContext(null);

// Provider component
export const PatientProvider = ({ children }) => {
  const [activePatient, setActivePatient] = useState(DEFAULT_PATIENT);
  const [savedPatients, setSavedPatients] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Load saved patients from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('phicor_patients');
      if (saved) {
        const patients = JSON.parse(saved);
        setSavedPatients(patients);
        // Restore last active patient if exists
        const lastActiveId = localStorage.getItem('phicor_active_patient');
        if (lastActiveId && lastActiveId !== 'baseline') {
          const lastActive = patients.find(p => p.id === lastActiveId);
          if (lastActive) setActivePatient(lastActive);
        }
      }
    } catch (e) {
      console.error('Error loading saved patients:', e);
    }
  }, []);
  
  // Calculate modifiers whenever patient changes
  const modifiers = useMemo(() => calculateModifiers(activePatient), [activePatient]);
  
  // Save patient
  const savePatient = useCallback((patient) => {
    const patientWithId = {
      ...patient,
      id: patient.id || `patient_${Date.now()}`,
      modifiers: calculateModifiers(patient)
    };
    
    setSavedPatients(prev => {
      const existing = prev.findIndex(p => p.id === patientWithId.id);
      let updated;
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = patientWithId;
      } else {
        updated = [...prev, patientWithId];
      }
      localStorage.setItem('phicor_patients', JSON.stringify(updated));
      return updated;
    });
    
    return patientWithId;
  }, []);
  
  // Delete patient
  const deletePatient = useCallback((patientId) => {
    setSavedPatients(prev => {
      const updated = prev.filter(p => p.id !== patientId);
      localStorage.setItem('phicor_patients', JSON.stringify(updated));
      return updated;
    });
    if (activePatient.id === patientId) {
      setActivePatient(DEFAULT_PATIENT);
    }
  }, [activePatient]);
  
  // Select patient
  const selectPatient = useCallback((patient) => {
    setActivePatient(patient || DEFAULT_PATIENT);
    localStorage.setItem('phicor_active_patient', patient?.id || 'baseline');
  }, []);
  
  // Clear to baseline
  const clearPatient = useCallback(() => {
    setActivePatient(DEFAULT_PATIENT);
    localStorage.setItem('phicor_active_patient', 'baseline');
  }, []);
  
  // Update active patient field
  const updatePatientField = useCallback((path, value) => {
    setActivePatient(prev => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      updated.isBaseline = false;
      updated.modifiers = calculateModifiers(updated);
      return updated;
    });
  }, []);
  
  // Apply modifiers to any analysis result
  const applyModifiers = useCallback((analysisResult, analysisType) => {
    return applyModifiersToAnalysis(analysisResult, modifiers, analysisType);
  }, [modifiers]);
  
  const value = {
    activePatient,
    savedPatients,
    modifiers,
    isExpanded,
    setIsExpanded,
    savePatient,
    deletePatient,
    selectPatient,
    clearPatient,
    updatePatientField,
    applyModifiers,
    DEFAULT_PATIENT
  };
  
  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

// Hook
export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

export { DEFAULT_PATIENT, calculateModifiers, applyModifiersToAnalysis };
