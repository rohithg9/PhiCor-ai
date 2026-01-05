/**
 * Regional Unit Definitions and Conversion System
 * Supports US (conventional) and SI (metric) units
 * Normal ranges adjust based on selected region
 */

// Unit conversion factors: multiply conventional value to get SI value
export const UNIT_CONVERSIONS = {
  // Glucose: mg/dL to mmol/L (divide by 18)
  glucose: {
    conventional: { unit: 'mg/dL', factor: 1 },
    SI: { unit: 'mmol/L', factor: 0.0555 },
  },
  // Creatinine: mg/dL to μmol/L (multiply by 88.4)
  creatinine: {
    conventional: { unit: 'mg/dL', factor: 1 },
    SI: { unit: 'μmol/L', factor: 88.4 },
  },
  // BUN/Urea: mg/dL to mmol/L (divide by 2.8)
  bun: {
    conventional: { unit: 'mg/dL', factor: 1 },
    SI: { unit: 'mmol/L', factor: 0.357 },
  },
  // Cholesterol: mg/dL to mmol/L (divide by 38.67)
  cholesterol: {
    conventional: { unit: 'mg/dL', factor: 1 },
    SI: { unit: 'mmol/L', factor: 0.0259 },
  },
  ldl: {
    conventional: { unit: 'mg/dL', factor: 1 },
    SI: { unit: 'mmol/L', factor: 0.0259 },
  },
  hdl: {
    conventional: { unit: 'mg/dL', factor: 1 },
    SI: { unit: 'mmol/L', factor: 0.0259 },
  },
  triglycerides: {
    conventional: { unit: 'mg/dL', factor: 1 },
    SI: { unit: 'mmol/L', factor: 0.0113 },
  },
  // Calcium: mg/dL to mmol/L (divide by 4)
  calcium: {
    conventional: { unit: 'mg/dL', factor: 1 },
    SI: { unit: 'mmol/L', factor: 0.25 },
  },
  // Bilirubin: mg/dL to μmol/L (multiply by 17.1)
  bilirubin: {
    conventional: { unit: 'mg/dL', factor: 1 },
    SI: { unit: 'μmol/L', factor: 17.1 },
  },
  // Albumin: g/dL to g/L (multiply by 10)
  albumin: {
    conventional: { unit: 'g/dL', factor: 1 },
    SI: { unit: 'g/L', factor: 10 },
  },
  // Hemoglobin: g/dL to g/L (multiply by 10)
  hemoglobin: {
    conventional: { unit: 'g/dL', factor: 1 },
    SI: { unit: 'g/L', factor: 10 },
  },
  // Temperature: °F to °C
  temperature: {
    conventional: { unit: '°F', factor: 1, offset: 0 },
    SI: { unit: '°C', factor: 0.5556, offset: -32 },
  },
  // Weight: lbs to kg
  weight: {
    conventional: { unit: 'lbs', factor: 1 },
    SI: { unit: 'kg', factor: 0.4536 },
  },
  // Height: inches to cm
  height: {
    conventional: { unit: 'in', factor: 1 },
    SI: { unit: 'cm', factor: 2.54 },
  },
};

// Regional normal ranges - stored in conventional units, converted on display
export const REGIONAL_NORMAL_RANGES = {
  // Common labs - base values in conventional (US) units
  glucose: {
    conventional: { min: 70, max: 100, unit: 'mg/dL', criticalLow: 50, criticalHigh: 400 },
    SI: { min: 3.9, max: 5.6, unit: 'mmol/L', criticalLow: 2.8, criticalHigh: 22.2 },
  },
  creatinine: {
    conventional: { min: 0.7, max: 1.3, unit: 'mg/dL', criticalLow: 0.4, criticalHigh: 10 },
    SI: { min: 62, max: 115, unit: 'μmol/L', criticalLow: 35, criticalHigh: 884 },
  },
  bun: {
    conventional: { min: 7, max: 20, unit: 'mg/dL', criticalLow: 2, criticalHigh: 100 },
    SI: { min: 2.5, max: 7.1, unit: 'mmol/L', criticalLow: 0.7, criticalHigh: 35.7 },
  },
  sodium: {
    conventional: { min: 136, max: 145, unit: 'mEq/L', criticalLow: 120, criticalHigh: 160 },
    SI: { min: 136, max: 145, unit: 'mmol/L', criticalLow: 120, criticalHigh: 160 },
  },
  potassium: {
    conventional: { min: 3.5, max: 5.0, unit: 'mEq/L', criticalLow: 2.5, criticalHigh: 6.5 },
    SI: { min: 3.5, max: 5.0, unit: 'mmol/L', criticalLow: 2.5, criticalHigh: 6.5 },
  },
  chloride: {
    conventional: { min: 98, max: 106, unit: 'mEq/L', criticalLow: 80, criticalHigh: 120 },
    SI: { min: 98, max: 106, unit: 'mmol/L', criticalLow: 80, criticalHigh: 120 },
  },
  bicarbonate: {
    conventional: { min: 22, max: 28, unit: 'mEq/L', criticalLow: 10, criticalHigh: 40 },
    SI: { min: 22, max: 28, unit: 'mmol/L', criticalLow: 10, criticalHigh: 40 },
  },
  calcium: {
    conventional: { min: 8.5, max: 10.5, unit: 'mg/dL', criticalLow: 6, criticalHigh: 14 },
    SI: { min: 2.1, max: 2.6, unit: 'mmol/L', criticalLow: 1.5, criticalHigh: 3.5 },
  },
  cholesterol: {
    conventional: { min: 0, max: 200, unit: 'mg/dL', criticalLow: 0, criticalHigh: 300 },
    SI: { min: 0, max: 5.2, unit: 'mmol/L', criticalLow: 0, criticalHigh: 7.8 },
  },
  ldl: {
    conventional: { min: 0, max: 100, unit: 'mg/dL', criticalLow: 0, criticalHigh: 190 },
    SI: { min: 0, max: 2.6, unit: 'mmol/L', criticalLow: 0, criticalHigh: 4.9 },
  },
  hdl: {
    conventional: { min: 40, max: 60, unit: 'mg/dL', criticalLow: 20, criticalHigh: 100 },
    SI: { min: 1.0, max: 1.5, unit: 'mmol/L', criticalLow: 0.5, criticalHigh: 2.6 },
  },
  triglycerides: {
    conventional: { min: 0, max: 150, unit: 'mg/dL', criticalLow: 0, criticalHigh: 500 },
    SI: { min: 0, max: 1.7, unit: 'mmol/L', criticalLow: 0, criticalHigh: 5.6 },
  },
  hemoglobin: {
    conventional: { min: 12, max: 17, unit: 'g/dL', criticalLow: 7, criticalHigh: 20 },
    SI: { min: 120, max: 170, unit: 'g/L', criticalLow: 70, criticalHigh: 200 },
  },
  hematocrit: {
    conventional: { min: 36, max: 48, unit: '%', criticalLow: 20, criticalHigh: 60 },
    SI: { min: 0.36, max: 0.48, unit: 'L/L', criticalLow: 0.20, criticalHigh: 0.60 },
  },
  wbc: {
    conventional: { min: 4, max: 11, unit: '×10³/μL', criticalLow: 2, criticalHigh: 30 },
    SI: { min: 4, max: 11, unit: '×10⁹/L', criticalLow: 2, criticalHigh: 30 },
  },
  platelets: {
    conventional: { min: 150, max: 400, unit: '×10³/μL', criticalLow: 50, criticalHigh: 1000 },
    SI: { min: 150, max: 400, unit: '×10⁹/L', criticalLow: 50, criticalHigh: 1000 },
  },
  bilirubin: {
    conventional: { min: 0.1, max: 1.2, unit: 'mg/dL', criticalLow: 0, criticalHigh: 15 },
    SI: { min: 1.7, max: 20.5, unit: 'μmol/L', criticalLow: 0, criticalHigh: 257 },
  },
  albumin: {
    conventional: { min: 3.5, max: 5.0, unit: 'g/dL', criticalLow: 2, criticalHigh: 6 },
    SI: { min: 35, max: 50, unit: 'g/L', criticalLow: 20, criticalHigh: 60 },
  },
  ast: {
    conventional: { min: 10, max: 40, unit: 'U/L', criticalLow: 0, criticalHigh: 1000 },
    SI: { min: 10, max: 40, unit: 'U/L', criticalLow: 0, criticalHigh: 1000 },
  },
  alt: {
    conventional: { min: 7, max: 56, unit: 'U/L', criticalLow: 0, criticalHigh: 1000 },
    SI: { min: 7, max: 56, unit: 'U/L', criticalLow: 0, criticalHigh: 1000 },
  },
  alp: {
    conventional: { min: 44, max: 147, unit: 'U/L', criticalLow: 0, criticalHigh: 500 },
    SI: { min: 44, max: 147, unit: 'U/L', criticalLow: 0, criticalHigh: 500 },
  },
  troponin: {
    conventional: { min: 0, max: 0.04, unit: 'ng/mL', criticalLow: 0, criticalHigh: 10 },
    SI: { min: 0, max: 0.04, unit: 'ng/mL', criticalLow: 0, criticalHigh: 10 },
  },
  bnp: {
    conventional: { min: 0, max: 100, unit: 'pg/mL', criticalLow: 0, criticalHigh: 5000 },
    SI: { min: 0, max: 100, unit: 'ng/L', criticalLow: 0, criticalHigh: 5000 },
  },
  ck: {
    conventional: { min: 30, max: 200, unit: 'U/L', criticalLow: 0, criticalHigh: 10000 },
    SI: { min: 30, max: 200, unit: 'U/L', criticalLow: 0, criticalHigh: 10000 },
  },
  crp: {
    conventional: { min: 0, max: 10, unit: 'mg/L', criticalLow: 0, criticalHigh: 200 },
    SI: { min: 0, max: 10, unit: 'mg/L', criticalLow: 0, criticalHigh: 200 },
  },
  esr: {
    conventional: { min: 0, max: 20, unit: 'mm/hr', criticalLow: 0, criticalHigh: 100 },
    SI: { min: 0, max: 20, unit: 'mm/hr', criticalLow: 0, criticalHigh: 100 },
  },
  tsh: {
    conventional: { min: 0.4, max: 4.0, unit: 'mIU/L', criticalLow: 0.1, criticalHigh: 10 },
    SI: { min: 0.4, max: 4.0, unit: 'mU/L', criticalLow: 0.1, criticalHigh: 10 },
  },
  hba1c: {
    conventional: { min: 4.0, max: 5.6, unit: '%', criticalLow: 3, criticalHigh: 15 },
    SI: { min: 20, max: 38, unit: 'mmol/mol', criticalLow: 9, criticalHigh: 140 },
  },
  gfr: {
    conventional: { min: 90, max: 120, unit: 'mL/min', criticalLow: 15, criticalHigh: 150 },
    SI: { min: 90, max: 120, unit: 'mL/min/1.73m²', criticalLow: 15, criticalHigh: 150 },
  },
  // Blood gases
  ph: {
    conventional: { min: 7.35, max: 7.45, unit: '', criticalLow: 7.0, criticalHigh: 7.8 },
    SI: { min: 7.35, max: 7.45, unit: '', criticalLow: 7.0, criticalHigh: 7.8 },
  },
  pco2: {
    conventional: { min: 35, max: 45, unit: 'mmHg', criticalLow: 20, criticalHigh: 80 },
    SI: { min: 4.7, max: 6.0, unit: 'kPa', criticalLow: 2.7, criticalHigh: 10.7 },
  },
  po2: {
    conventional: { min: 80, max: 100, unit: 'mmHg', criticalLow: 40, criticalHigh: 500 },
    SI: { min: 10.7, max: 13.3, unit: 'kPa', criticalLow: 5.3, criticalHigh: 66.7 },
  },
  o2sat: {
    conventional: { min: 95, max: 100, unit: '%', criticalLow: 80, criticalHigh: 100 },
    SI: { min: 95, max: 100, unit: '%', criticalLow: 80, criticalHigh: 100 },
  },
  lactate: {
    conventional: { min: 0.5, max: 2.0, unit: 'mmol/L', criticalLow: 0, criticalHigh: 10 },
    SI: { min: 0.5, max: 2.0, unit: 'mmol/L', criticalLow: 0, criticalHigh: 10 },
  },
  // Vitals
  heart_rate: {
    conventional: { min: 60, max: 100, unit: 'bpm', criticalLow: 35, criticalHigh: 180 },
    SI: { min: 60, max: 100, unit: 'bpm', criticalLow: 35, criticalHigh: 180 },
  },
  systolic_bp: {
    conventional: { min: 90, max: 120, unit: 'mmHg', criticalLow: 70, criticalHigh: 200 },
    SI: { min: 90, max: 120, unit: 'mmHg', criticalLow: 70, criticalHigh: 200 },
  },
  diastolic_bp: {
    conventional: { min: 60, max: 80, unit: 'mmHg', criticalLow: 40, criticalHigh: 120 },
    SI: { min: 60, max: 80, unit: 'mmHg', criticalLow: 40, criticalHigh: 120 },
  },
  temperature: {
    conventional: { min: 97.0, max: 99.0, unit: '°F', criticalLow: 95, criticalHigh: 104 },
    SI: { min: 36.1, max: 37.2, unit: '°C', criticalLow: 35, criticalHigh: 40 },
  },
  respiratory_rate: {
    conventional: { min: 12, max: 20, unit: '/min', criticalLow: 6, criticalHigh: 40 },
    SI: { min: 12, max: 20, unit: '/min', criticalLow: 6, criticalHigh: 40 },
  },
};

/**
 * Get normal range for a parameter in the specified unit system
 * @param {string} parameterId - The parameter ID (e.g., 'glucose', 'creatinine')
 * @param {string} unitSystem - 'conventional' or 'SI'
 * @returns {Object} Normal range with min, max, unit, criticalLow, criticalHigh
 */
export const getNormalRange = (parameterId, unitSystem = 'conventional') => {
  const paramId = parameterId.toLowerCase().replace(/\s+/g, '_');
  const ranges = REGIONAL_NORMAL_RANGES[paramId];
  
  if (!ranges) {
    return null;
  }
  
  return ranges[unitSystem] || ranges.conventional;
};

/**
 * Convert a value from one unit system to another
 * @param {number} value - The value to convert
 * @param {string} parameterId - The parameter ID
 * @param {string} fromSystem - Source unit system ('conventional' or 'SI')
 * @param {string} toSystem - Target unit system ('conventional' or 'SI')
 * @returns {Object} { value, unit }
 */
export const convertValue = (value, parameterId, fromSystem, toSystem) => {
  if (fromSystem === toSystem) {
    const range = getNormalRange(parameterId, fromSystem);
    return { value, unit: range?.unit || '' };
  }
  
  const conversion = UNIT_CONVERSIONS[parameterId.toLowerCase()];
  if (!conversion) {
    const range = getNormalRange(parameterId, toSystem);
    return { value, unit: range?.unit || '' };
  }
  
  let convertedValue = value;
  
  if (fromSystem === 'conventional' && toSystem === 'SI') {
    // Handle temperature special case
    if (conversion.SI.offset !== undefined) {
      convertedValue = (value + conversion.SI.offset) * conversion.SI.factor;
    } else {
      convertedValue = value * conversion.SI.factor;
    }
  } else if (fromSystem === 'SI' && toSystem === 'conventional') {
    if (conversion.SI.offset !== undefined) {
      convertedValue = value / conversion.SI.factor - conversion.SI.offset;
    } else {
      convertedValue = value / conversion.SI.factor;
    }
  }
  
  const targetRange = getNormalRange(parameterId, toSystem);
  return {
    value: Math.round(convertedValue * 100) / 100,
    unit: targetRange?.unit || conversion[toSystem]?.unit || '',
  };
};

/**
 * Format a value with its unit for display
 * @param {number} value - The value
 * @param {string} parameterId - The parameter ID
 * @param {string} unitSystem - 'conventional' or 'SI'
 * @returns {string} Formatted string like "5.5 mmol/L"
 */
export const formatValueWithUnit = (value, parameterId, unitSystem = 'conventional') => {
  const range = getNormalRange(parameterId, unitSystem);
  const unit = range?.unit || '';
  const displayValue = typeof value === 'number' ? value.toFixed(1) : value;
  return `${displayValue} ${unit}`.trim();
};

/**
 * Check if a value is abnormal based on regional normal ranges
 * @param {number} value - The value to check
 * @param {string} parameterId - The parameter ID
 * @param {string} unitSystem - 'conventional' or 'SI'
 * @returns {Object} { isAbnormal, direction, severity }
 */
export const checkAbnormality = (value, parameterId, unitSystem = 'conventional') => {
  const range = getNormalRange(parameterId, unitSystem);
  if (!range) {
    return { isAbnormal: false, direction: 'normal', severity: 0 };
  }
  
  let direction = 'normal';
  let severity = 0;
  
  if (value < range.min) {
    direction = 'decrease';
    if (value <= range.criticalLow) {
      severity = 3; // Critical
    } else {
      severity = Math.min(2, (range.min - value) / (range.min - range.criticalLow) * 2);
    }
  } else if (value > range.max) {
    direction = 'increase';
    if (value >= range.criticalHigh) {
      severity = 3; // Critical
    } else {
      severity = Math.min(2, (value - range.max) / (range.criticalHigh - range.max) * 2);
    }
  }
  
  return {
    isAbnormal: direction !== 'normal',
    direction,
    severity: Math.round(severity * 10) / 10,
  };
};

export default {
  UNIT_CONVERSIONS,
  REGIONAL_NORMAL_RANGES,
  getNormalRange,
  convertValue,
  formatValueWithUnit,
  checkAbnormality,
};
