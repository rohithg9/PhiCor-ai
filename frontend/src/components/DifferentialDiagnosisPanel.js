import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  FileText, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  User,
  Clipboard,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  FlaskConical,
  Heart,
  Stethoscope,
  Gauge,
  Info,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { 
  getDifferentialDiagnosis, 
  parseClinicalText, 
  analyzePatientCase,
  createTestPatient,
  getAllParameters,
  NORMAL_RANGES,
} from '../data/bidirectionalMapping';
import { ORGAN_MODELS } from '../data/organModels';

// Build comprehensive normal ranges from organ models + manual additions
const buildAllNormalRanges = () => {
  const ranges = { ...NORMAL_RANGES };
  
  // Extract ranges from all organ models
  Object.values(ORGAN_MODELS).forEach(organ => {
    const categories = ['geometry', 'physiology', 'structure', 'pressures', 'cellular'];
    categories.forEach(cat => {
      const categoryData = organ[cat];
      if (!categoryData?.parameters) return;
      
      categoryData.parameters.forEach(param => {
        if (param.range && Array.isArray(param.range) && param.range.length === 2) {
          const [min, max] = param.range;
          // Calculate critical values (typically 50% below min, 100% above max)
          const criticalLow = min - (min * 0.5);
          const criticalHigh = max + (max * 0.5);
          
          ranges[param.id] = {
            min,
            max,
            unit: param.unit || '',
            criticalLow: Math.max(0, criticalLow),
            criticalHigh,
          };
        }
      });
    });
  });
  
  // Add/override with clinical lab values and vital signs
  const clinicalRanges = {
    // Cardiac - Geometry
    lv_edv: { min: 70, max: 160, unit: 'mL', criticalLow: 40, criticalHigh: 300 },
    lv_esv: { min: 20, max: 70, unit: 'mL', criticalLow: 10, criticalHigh: 200 },
    rv_edv: { min: 60, max: 150, unit: 'mL', criticalLow: 30, criticalHigh: 250 },
    rv_esv: { min: 15, max: 60, unit: 'mL', criticalLow: 8, criticalHigh: 150 },
    la_volume: { min: 18, max: 40, unit: 'mL', criticalLow: 10, criticalHigh: 80 },
    lv_wall_thickness: { min: 6, max: 12, unit: 'mm', criticalLow: 4, criticalHigh: 20 },
    lv_mass: { min: 100, max: 200, unit: 'g', criticalLow: 60, criticalHigh: 400 },
    aortic_root: { min: 26, max: 38, unit: 'mm', criticalLow: 20, criticalHigh: 60 },
    
    // Cardiac - Function
    ejection_fraction: { min: 55, max: 70, unit: '%', criticalLow: 25, criticalHigh: 85 },
    stroke_volume: { min: 55, max: 100, unit: 'mL', criticalLow: 30, criticalHigh: 150 },
    cardiac_output: { min: 4, max: 8, unit: 'L/min', criticalLow: 2, criticalHigh: 15 },
    cardiac_index: { min: 2.5, max: 4.2, unit: 'L/min/m²', criticalLow: 1.5, criticalHigh: 6 },
    heart_rate: { min: 60, max: 100, unit: 'bpm', criticalLow: 35, criticalHigh: 180 },
    e_a_ratio: { min: 1, max: 2, unit: '', criticalLow: 0.5, criticalHigh: 4 },
    
    // Cardiac - Pressures
    lv_sys_p: { min: 90, max: 140, unit: 'mmHg', criticalLow: 60, criticalHigh: 200 },
    lv_edp: { min: 5, max: 16, unit: 'mmHg', criticalLow: 0, criticalHigh: 40 },
    rv_sys_p: { min: 15, max: 30, unit: 'mmHg', criticalLow: 10, criticalHigh: 80 },
    pa_sys: { min: 15, max: 30, unit: 'mmHg', criticalLow: 10, criticalHigh: 80 },
    pcwp: { min: 6, max: 15, unit: 'mmHg', criticalLow: 2, criticalHigh: 35 },
    
    // Vital Signs
    systolic_bp: { min: 90, max: 120, unit: 'mmHg', criticalLow: 70, criticalHigh: 200 },
    diastolic_bp: { min: 60, max: 80, unit: 'mmHg', criticalLow: 40, criticalHigh: 120 },
    map: { min: 70, max: 100, unit: 'mmHg', criticalLow: 55, criticalHigh: 130 },
    respiratory_rate: { min: 12, max: 20, unit: '/min', criticalLow: 6, criticalHigh: 40 },
    temperature: { min: 36.1, max: 37.2, unit: '°C', criticalLow: 34, criticalHigh: 41 },
    oxygen_saturation: { min: 95, max: 100, unit: '%', criticalLow: 80, criticalHigh: 100 },
    
    // Respiratory - Volumes
    total_lung_capacity: { min: 5000, max: 7000, unit: 'mL', criticalLow: 3000, criticalHigh: 9000 },
    vital_capacity: { min: 4000, max: 5500, unit: 'mL', criticalLow: 2500, criticalHigh: 7000 },
    frc: { min: 2000, max: 3000, unit: 'mL', criticalLow: 1200, criticalHigh: 4500 },
    residual_volume: { min: 1000, max: 1500, unit: 'mL', criticalLow: 600, criticalHigh: 2500 },
    tidal_volume: { min: 400, max: 600, unit: 'mL', criticalLow: 200, criticalHigh: 1000 },
    
    // Respiratory - Function
    fev1: { min: 80, max: 120, unit: '% pred', criticalLow: 30, criticalHigh: 140 },
    fvc: { min: 80, max: 120, unit: '% pred', criticalLow: 40, criticalHigh: 140 },
    fev1_fvc: { min: 70, max: 85, unit: '%', criticalLow: 40, criticalHigh: 95 },
    dlco: { min: 80, max: 120, unit: '% pred', criticalLow: 40, criticalHigh: 140 },
    
    // Blood Gases
    pao2: { min: 80, max: 100, unit: 'mmHg', criticalLow: 50, criticalHigh: 150 },
    paco2: { min: 35, max: 45, unit: 'mmHg', criticalLow: 15, criticalHigh: 80 },
    ph: { min: 7.35, max: 7.45, unit: '', criticalLow: 7.1, criticalHigh: 7.6 },
    hco3: { min: 22, max: 28, unit: 'mEq/L', criticalLow: 10, criticalHigh: 45 },
    base_excess: { min: -2, max: 2, unit: 'mEq/L', criticalLow: -15, criticalHigh: 15 },
    
    // Renal
    gfr: { min: 90, max: 120, unit: 'mL/min/1.73m²', criticalLow: 15, criticalHigh: 150 },
    creatinine: { min: 0.7, max: 1.3, unit: 'mg/dL', criticalLow: 0.3, criticalHigh: 10 },
    bun: { min: 7, max: 20, unit: 'mg/dL', criticalLow: 3, criticalHigh: 100 },
    urine_output: { min: 0.5, max: 2, unit: 'mL/kg/hr', criticalLow: 0.1, criticalHigh: 5 },
    urine_sodium: { min: 40, max: 220, unit: 'mEq/day', criticalLow: 10, criticalHigh: 400 },
    urine_specific_gravity: { min: 1.005, max: 1.030, unit: '', criticalLow: 1.001, criticalHigh: 1.040 },
    protein_creatinine_ratio: { min: 0, max: 0.2, unit: 'mg/mg', criticalLow: 0, criticalHigh: 5 },
    
    // Hematology - CBC
    hemoglobin: { min: 12, max: 17, unit: 'g/dL', criticalLow: 6, criticalHigh: 22 },
    hematocrit: { min: 36, max: 50, unit: '%', criticalLow: 20, criticalHigh: 65 },
    wbc: { min: 4, max: 11, unit: 'K/μL', criticalLow: 1, criticalHigh: 50 },
    platelets: { min: 150, max: 400, unit: 'K/μL', criticalLow: 20, criticalHigh: 1000 },
    mcv: { min: 80, max: 100, unit: 'fL', criticalLow: 60, criticalHigh: 130 },
    mch: { min: 27, max: 33, unit: 'pg', criticalLow: 20, criticalHigh: 40 },
    mchc: { min: 32, max: 36, unit: 'g/dL', criticalLow: 28, criticalHigh: 40 },
    rdw: { min: 11, max: 14, unit: '%', criticalLow: 10, criticalHigh: 25 },
    reticulocytes: { min: 0.5, max: 2.5, unit: '%', criticalLow: 0.1, criticalHigh: 15 },
    
    // Coagulation
    pt: { min: 11, max: 14, unit: 'sec', criticalLow: 8, criticalHigh: 50 },
    inr: { min: 0.9, max: 1.1, unit: '', criticalLow: 0.5, criticalHigh: 10 },
    ptt: { min: 25, max: 35, unit: 'sec', criticalLow: 15, criticalHigh: 100 },
    fibrinogen: { min: 200, max: 400, unit: 'mg/dL', criticalLow: 100, criticalHigh: 700 },
    d_dimer: { min: 0, max: 0.5, unit: 'μg/mL', criticalLow: 0, criticalHigh: 20 },
    
    // Metabolic - Basic
    glucose: { min: 70, max: 100, unit: 'mg/dL', criticalLow: 40, criticalHigh: 500 },
    hba1c: { min: 4, max: 5.6, unit: '%', criticalLow: 3.5, criticalHigh: 14 },
    sodium: { min: 136, max: 145, unit: 'mEq/L', criticalLow: 120, criticalHigh: 160 },
    potassium: { min: 3.5, max: 5, unit: 'mEq/L', criticalLow: 2.5, criticalHigh: 7 },
    chloride: { min: 98, max: 106, unit: 'mEq/L', criticalLow: 85, criticalHigh: 120 },
    calcium: { min: 8.5, max: 10.5, unit: 'mg/dL', criticalLow: 6, criticalHigh: 14 },
    magnesium: { min: 1.7, max: 2.2, unit: 'mg/dL', criticalLow: 1, criticalHigh: 4 },
    phosphorus: { min: 2.5, max: 4.5, unit: 'mg/dL', criticalLow: 1, criticalHigh: 8 },
    
    // Liver
    ast: { min: 10, max: 40, unit: 'U/L', criticalLow: 5, criticalHigh: 1000 },
    alt: { min: 7, max: 56, unit: 'U/L', criticalLow: 3, criticalHigh: 1000 },
    alp: { min: 44, max: 147, unit: 'U/L', criticalLow: 20, criticalHigh: 500 },
    ggt: { min: 9, max: 48, unit: 'U/L', criticalLow: 5, criticalHigh: 500 },
    bilirubin: { min: 0.1, max: 1.2, unit: 'mg/dL', criticalLow: 0, criticalHigh: 30 },
    bilirubin_direct: { min: 0, max: 0.3, unit: 'mg/dL', criticalLow: 0, criticalHigh: 20 },
    albumin: { min: 3.5, max: 5, unit: 'g/dL', criticalLow: 1.5, criticalHigh: 6 },
    total_protein: { min: 6, max: 8, unit: 'g/dL', criticalLow: 4, criticalHigh: 10 },
    ammonia: { min: 15, max: 45, unit: 'μmol/L', criticalLow: 5, criticalHigh: 150 },
    
    // Cardiac Markers
    troponin: { min: 0, max: 0.04, unit: 'ng/mL', criticalLow: 0, criticalHigh: 50 },
    bnp: { min: 0, max: 100, unit: 'pg/mL', criticalLow: 0, criticalHigh: 5000 },
    nt_probnp: { min: 0, max: 125, unit: 'pg/mL', criticalLow: 0, criticalHigh: 10000 },
    ck: { min: 30, max: 200, unit: 'U/L', criticalLow: 10, criticalHigh: 5000 },
    ck_mb: { min: 0, max: 5, unit: 'ng/mL', criticalLow: 0, criticalHigh: 100 },
    
    // Inflammatory
    crp: { min: 0, max: 1, unit: 'mg/dL', criticalLow: 0, criticalHigh: 30 },
    esr: { min: 0, max: 20, unit: 'mm/hr', criticalLow: 0, criticalHigh: 120 },
    procalcitonin: { min: 0, max: 0.05, unit: 'ng/mL', criticalLow: 0, criticalHigh: 100 },
    ferritin: { min: 12, max: 300, unit: 'ng/mL', criticalLow: 5, criticalHigh: 2000 },
    lactate: { min: 0.5, max: 2, unit: 'mmol/L', criticalLow: 0.2, criticalHigh: 20 },
    ldh: { min: 140, max: 280, unit: 'U/L', criticalLow: 100, criticalHigh: 1000 },
    
    // Thyroid
    tsh: { min: 0.4, max: 4, unit: 'mIU/L', criticalLow: 0.01, criticalHigh: 100 },
    free_t4: { min: 0.8, max: 1.8, unit: 'ng/dL', criticalLow: 0.3, criticalHigh: 5 },
    free_t3: { min: 2.3, max: 4.2, unit: 'pg/mL', criticalLow: 1, criticalHigh: 8 },
    
    // Pancreatic
    amylase: { min: 30, max: 110, unit: 'U/L', criticalLow: 10, criticalHigh: 1000 },
    lipase: { min: 0, max: 160, unit: 'U/L', criticalLow: 0, criticalHigh: 1000 },
    
    // Lipids
    total_cholesterol: { min: 0, max: 200, unit: 'mg/dL', criticalLow: 0, criticalHigh: 400 },
    ldl: { min: 0, max: 100, unit: 'mg/dL', criticalLow: 0, criticalHigh: 250 },
    hdl: { min: 40, max: 100, unit: 'mg/dL', criticalLow: 20, criticalHigh: 150 },
    triglycerides: { min: 0, max: 150, unit: 'mg/dL', criticalLow: 0, criticalHigh: 1000 },
    
    // Neurological
    icp: { min: 5, max: 15, unit: 'mmHg', criticalLow: 0, criticalHigh: 40 },
    cpp: { min: 60, max: 100, unit: 'mmHg', criticalLow: 40, criticalHigh: 120 },
    csf_glucose: { min: 50, max: 80, unit: 'mg/dL', criticalLow: 20, criticalHigh: 100 },
    csf_protein: { min: 15, max: 45, unit: 'mg/dL', criticalLow: 5, criticalHigh: 200 },
    csf_wbc: { min: 0, max: 5, unit: 'cells/μL', criticalLow: 0, criticalHigh: 500 },
  };
  
  return { ...ranges, ...clinicalRanges };
};

const EXTENDED_NORMAL_RANGES = buildAllNormalRanges();

const DifferentialDiagnosisPanel = ({ onSelectDisease }) => {
  const [activeTab, setActiveTab] = useState('parameters'); // 'parameters', 'clinical', 'patient'
  const [abnormalFindings, setAbnormalFindings] = useState([]);
  const [clinicalText, setClinicalText] = useState('');
  const [differential, setDifferential] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [expandedDiagnosis, setExpandedDiagnosis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Parameter selection state
  const [selectedOrgan, setSelectedOrgan] = useState('');
  const [selectedParam, setSelectedParam] = useState('');
  const [paramValue, setParamValue] = useState(null);
  const [showValueInput, setShowValueInput] = useState(false);
  
  // Get all available parameters
  const allParameters = useMemo(() => getAllParameters(), []);
  
  // Get normal range for selected parameter - check multiple sources
  const selectedParamRange = useMemo(() => {
    if (!selectedParam) return null;
    
    // First check extended ranges
    if (EXTENDED_NORMAL_RANGES[selectedParam]) {
      return EXTENDED_NORMAL_RANGES[selectedParam];
    }
    
    // Check NORMAL_RANGES
    if (NORMAL_RANGES[selectedParam]) {
      const range = NORMAL_RANGES[selectedParam];
      return {
        ...range,
        criticalLow: range.criticalLow || range.min * 0.5,
        criticalHigh: range.criticalHigh || range.max * 1.5,
      };
    }
    
    // Try to get from organ model
    if (selectedOrgan && allParameters[selectedOrgan]) {
      const param = allParameters[selectedOrgan].parameters.find(p => p.id === selectedParam);
      if (param?.range && Array.isArray(param.range)) {
        const [min, max] = param.range;
        return {
          min,
          max,
          unit: param.unit || '',
          criticalLow: min * 0.5,
          criticalHigh: max * 1.5,
        };
      }
    }
    
    return null;
  }, [selectedParam, selectedOrgan, allParameters]);
  
  // Initialize value when parameter changes
  const initialParamValue = useMemo(() => {
    if (!selectedParamRange) return null;
    return (selectedParamRange.min + selectedParamRange.max) / 2;
  }, [selectedParamRange]);
  
  // Track if we've initialized for this param
  const [initializedParam, setInitializedParam] = useState('');
  
  // Set initial value when parameter changes (avoiding direct setState in effect)
  if (selectedParam && selectedParam !== initializedParam && initialParamValue !== null) {
    setParamValue(initialParamValue);
    setShowValueInput(true);
    setInitializedParam(selectedParam);
  } else if (!selectedParam && showValueInput) {
    setShowValueInput(false);
    setInitializedParam('');
  }
  
  // Determine if value is abnormal and direction
  const valueAnalysis = useMemo(() => {
    if (!selectedParamRange || paramValue === null) return null;
    
    const { min, max, criticalLow, criticalHigh } = selectedParamRange;
    const isLow = paramValue < min;
    const isHigh = paramValue > max;
    const isCriticalLow = criticalLow !== undefined && paramValue < criticalLow;
    const isCriticalHigh = criticalHigh !== undefined && paramValue > criticalHigh;
    const isNormal = !isLow && !isHigh;
    
    let severity = 0;
    if (isLow) {
      severity = Math.min(((min - paramValue) / (min - (criticalLow || min * 0.5))) * 3, 3);
    } else if (isHigh) {
      severity = Math.min(((paramValue - max) / ((criticalHigh || max * 2) - max)) * 3, 3);
    }
    
    return {
      isNormal,
      isLow,
      isHigh,
      isCritical: isCriticalLow || isCriticalHigh,
      direction: isLow ? 'decrease' : isHigh ? 'increase' : 'normal',
      severity: Math.max(0.5, severity),
      percentFromNormal: isLow 
        ? ((min - paramValue) / min * 100).toFixed(1) 
        : isHigh 
          ? ((paramValue - max) / max * 100).toFixed(1)
          : 0
    };
  }, [selectedParamRange, paramValue]);
  
  // Add a finding manually
  const addFinding = useCallback(() => {
    if (!selectedParam || !valueAnalysis || valueAnalysis.isNormal) return;
    
    const existing = abnormalFindings.find(f => f.parameterId === selectedParam);
    if (existing) return;
    
    const paramInfo = selectedOrgan && allParameters[selectedOrgan]?.parameters.find(p => p.id === selectedParam);
    
    const newFinding = {
      id: `finding_${Date.now()}`,
      parameterId: selectedParam,
      parameterName: paramInfo?.name || selectedParam,
      organ: selectedOrgan,
      direction: valueAnalysis.direction,
      severity: valueAnalysis.severity,
      actualValue: paramValue,
      normalRange: selectedParamRange ? 
        `${selectedParamRange.min}-${selectedParamRange.max} ${selectedParamRange.unit}` : 
        'N/A',
      unit: selectedParamRange?.unit || '',
      isCritical: valueAnalysis.isCritical,
    };
    
    setAbnormalFindings(prev => [...prev, newFinding]);
    setSelectedParam('');
    setShowValueInput(false);
  }, [selectedParam, selectedOrgan, valueAnalysis, paramValue, selectedParamRange, abnormalFindings, allParameters]);
  
  // Remove a finding
  const removeFinding = useCallback((id) => {
    setAbnormalFindings(prev => prev.filter(f => f.id !== id));
  }, []);
  
  // Analyze findings and generate differential
  const runDifferentialAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const results = getDifferentialDiagnosis(abnormalFindings);
      setDifferential(results);
      setIsAnalyzing(false);
    }, 500);
  }, [abnormalFindings]);
  
  // Analyze clinical text
  const analyzeClinicalText = useCallback(() => {
    if (!clinicalText.trim()) return;
    
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const analysis = analyzePatientCase(clinicalText);
      setExtractedData(analysis.extractedData);
      setDifferential(analysis.differential);
      
      // Also populate findings from extracted labs
      const extractedFindings = analysis.extractedData.labs.map((lab, idx) => ({
        id: `extracted_${idx}`,
        parameterId: lab.parameterId,
        direction: lab.direction,
        severity: lab.severity,
        value: lab.value,
        normalRange: lab.normalRange,
        source: 'extracted',
      }));
      
      setAbnormalFindings(extractedFindings);
      setIsAnalyzing(false);
    }, 800);
  }, [clinicalText]);
  
  // Get confidence color
  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };
  
  // Get probability bar color
  const getProbabilityColor = (score) => {
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Direction icon helper function
  const renderDirectionIcon = (direction) => {
    if (direction === 'increase') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (direction === 'decrease') return <TrendingDown className="w-4 h-4 text-blue-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* AI Clinical Assistant Banner */}
      <a 
        href="/diagnosis"
        className="block p-3 bg-gradient-to-r from-red-900/40 via-purple-900/40 to-blue-900/40 border-b border-purple-500/30 hover:from-red-900/60 hover:via-purple-900/60 hover:to-blue-900/60 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-purple-500 flex items-center justify-center animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-semibold flex items-center gap-2">
                🎙️ AI Medical Scribe
                <span className="px-2 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold">NEW</span>
              </div>
              <div className="text-xs text-gray-300">Voice-to-text transcription with real-time diagnosis</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </a>
      
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Differential Diagnosis Engine</h3>
          </div>
          <div className="text-xs text-gray-400">
            Powered by Bidirectional Mapping
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('parameters')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'parameters' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <FlaskConical className="w-4 h-4 inline mr-2" />
            Add Parameters
          </button>
          <button
            onClick={() => setActiveTab('clinical')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'clinical' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Clinical Text
          </button>
          <button
            onClick={() => setActiveTab('patient')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'patient' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Test Patient
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Parameters Tab */}
        {activeTab === 'parameters' && (
          <div className="space-y-4">
            {/* Parameter Selection */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedOrgan}
                  onChange={(e) => {
                    setSelectedOrgan(e.target.value);
                    setSelectedParam('');
                    setShowValueInput(false);
                  }}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="">Select Organ/System</option>
                  {Object.entries(allParameters).map(([key, organ]) => (
                    <option key={key} value={key}>{organ.icon} {organ.name}</option>
                  ))}
                </select>
                
                <select
                  value={selectedParam}
                  onChange={(e) => setSelectedParam(e.target.value)}
                  disabled={!selectedOrgan}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  <option value="">Select Parameter</option>
                  {selectedOrgan && allParameters[selectedOrgan]?.parameters.map(param => (
                    <option key={param.id} value={param.id}>{param.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Value Input Section - Shows when parameter is selected */}
              {showValueInput && selectedParamRange && (
                <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-600 space-y-3">
                  {/* Normal Range Display */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">
                        Normal Range: <span className="text-green-400 font-medium">
                          {selectedParamRange.min} - {selectedParamRange.max} {selectedParamRange.unit}
                        </span>
                      </span>
                    </div>
                    {valueAnalysis && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        valueAnalysis.isNormal 
                          ? 'bg-green-900/50 text-green-400' 
                          : valueAnalysis.isCritical
                            ? 'bg-red-900/50 text-red-400'
                            : 'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {valueAnalysis.isNormal 
                          ? '✓ Normal' 
                          : valueAnalysis.isCritical
                            ? '⚠ Critical'
                            : valueAnalysis.isLow ? '↓ Low' : '↑ High'}
                      </span>
                    )}
                  </div>
                  
                  {/* Current Value Display */}
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      valueAnalysis?.isNormal 
                        ? 'text-green-400' 
                        : valueAnalysis?.isCritical
                          ? 'text-red-400'
                          : valueAnalysis?.isLow 
                            ? 'text-blue-400' 
                            : 'text-orange-400'
                    }`}>
                      {paramValue?.toFixed(selectedParamRange.unit === '%' || paramValue >= 10 ? 0 : 1)} 
                      <span className="text-lg text-gray-400 ml-1">{selectedParamRange.unit}</span>
                    </div>
                    {valueAnalysis && !valueAnalysis.isNormal && (
                      <div className="text-xs text-gray-400 mt-1">
                        {valueAnalysis.percentFromNormal}% {valueAnalysis.isLow ? 'below' : 'above'} normal
                      </div>
                    )}
                  </div>
                  
                  {/* Value Slider */}
                  <div className="px-2">
                    <input
                      type="range"
                      min={selectedParamRange.criticalLow || selectedParamRange.min * 0.3}
                      max={selectedParamRange.criticalHigh || selectedParamRange.max * 2}
                      step={(selectedParamRange.max - selectedParamRange.min) / 100}
                      value={paramValue || selectedParamRange.min}
                      onChange={(e) => setParamValue(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, 
                          #ef4444 0%, 
                          #ef4444 ${((selectedParamRange.criticalLow || selectedParamRange.min * 0.3) / (selectedParamRange.criticalHigh || selectedParamRange.max * 2)) * 100}%,
                          #3b82f6 ${((selectedParamRange.criticalLow || selectedParamRange.min * 0.3) / (selectedParamRange.criticalHigh || selectedParamRange.max * 2)) * 100}%,
                          #3b82f6 ${(selectedParamRange.min / (selectedParamRange.criticalHigh || selectedParamRange.max * 2)) * 100}%,
                          #22c55e ${(selectedParamRange.min / (selectedParamRange.criticalHigh || selectedParamRange.max * 2)) * 100}%,
                          #22c55e ${(selectedParamRange.max / (selectedParamRange.criticalHigh || selectedParamRange.max * 2)) * 100}%,
                          #f97316 ${(selectedParamRange.max / (selectedParamRange.criticalHigh || selectedParamRange.max * 2)) * 100}%,
                          #ef4444 100%
                        )`
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      <span>↓ Critical Low</span>
                      <span className="text-green-500">Normal Range</span>
                      <span>↑ Critical High</span>
                    </div>
                  </div>
                  
                  {/* Quick Value Buttons */}
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setParamValue(selectedParamRange.criticalLow || selectedParamRange.min * 0.5)}
                      className="px-3 py-1 text-xs bg-red-900/50 text-red-400 rounded hover:bg-red-900/70"
                    >
                      Critical Low
                    </button>
                    <button
                      onClick={() => setParamValue(selectedParamRange.min * 0.9)}
                      className="px-3 py-1 text-xs bg-blue-900/50 text-blue-400 rounded hover:bg-blue-900/70"
                    >
                      Low
                    </button>
                    <button
                      onClick={() => setParamValue((selectedParamRange.min + selectedParamRange.max) / 2)}
                      className="px-3 py-1 text-xs bg-green-900/50 text-green-400 rounded hover:bg-green-900/70"
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => setParamValue(selectedParamRange.max * 1.2)}
                      className="px-3 py-1 text-xs bg-orange-900/50 text-orange-400 rounded hover:bg-orange-900/70"
                    >
                      High
                    </button>
                    <button
                      onClick={() => setParamValue(selectedParamRange.criticalHigh || selectedParamRange.max * 2)}
                      className="px-3 py-1 text-xs bg-red-900/50 text-red-400 rounded hover:bg-red-900/70"
                    >
                      Critical High
                    </button>
                  </div>
                  
                  {/* Direct Input */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Or enter value:</span>
                    <Input
                      type="number"
                      value={paramValue || ''}
                      onChange={(e) => setParamValue(parseFloat(e.target.value) || 0)}
                      className="w-24 bg-gray-900 border-gray-600 text-center text-sm"
                      step={selectedParamRange.unit === '%' ? 1 : 0.1}
                    />
                    <span className="text-xs text-gray-400">{selectedParamRange.unit}</span>
                  </div>
                </div>
              )}
              
              {/* Add Button */}
              <Button
                onClick={addFinding}
                disabled={!selectedParam || !valueAnalysis || valueAnalysis.isNormal}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" /> 
                {valueAnalysis?.isNormal 
                  ? 'Value is Normal (Select Abnormal Value)' 
                  : 'Add Abnormal Finding'}
              </Button>
            </div>
          </div>
        )}
        
        {/* Clinical Text Tab */}
        {activeTab === 'clinical' && (
          <div className="space-y-4">
            <textarea
              value={clinicalText}
              onChange={(e) => setClinicalText(e.target.value)}
              placeholder="Paste clinical notes, lab results, or patient history here...

Example:
65yo male presenting with chest pain. 
Labs: Hemoglobin 10.2 g/dL, Creatinine 2.1 mg/dL, BNP 450 pg/mL, Troponin 0.15 ng/mL
Symptoms: dyspnea, fatigue, edema
PMH: HTN, DM2"
              className="w-full h-40 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white resize-none"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={analyzeClinicalText}
                disabled={!clinicalText.trim() || isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <>Analyzing...</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" /> Analyze Text</>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Document
              </Button>
            </div>
            
            {/* Extracted Data Summary */}
            {extractedData && (
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-2">Extracted Findings</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-blue-900/30 rounded p-2">
                    <div className="text-blue-400">Labs Found</div>
                    <div className="text-white text-lg">{extractedData.summary.labCount}</div>
                  </div>
                  <div className="bg-orange-900/30 rounded p-2">
                    <div className="text-orange-400">Abnormal</div>
                    <div className="text-white text-lg">{extractedData.summary.abnormalLabs}</div>
                  </div>
                  <div className="bg-purple-900/30 rounded p-2">
                    <div className="text-purple-400">Symptoms</div>
                    <div className="text-white text-lg">{extractedData.summary.symptomCount}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Test Patient Tab */}
        {activeTab === 'patient' && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Create Test Patient
              </h4>
              
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Age</label>
                  <Input type="number" placeholder="Age" className="bg-gray-900 border-gray-600" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Gender</label>
                  <select className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Weight (kg)</label>
                  <Input type="number" placeholder="Weight" className="bg-gray-900 border-gray-600" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Height (cm)</label>
                  <Input type="number" placeholder="Height" className="bg-gray-900 border-gray-600" />
                </div>
              </div>
              
              <div className="mt-3">
                <label className="text-xs text-gray-400 block mb-1">Chief Complaint</label>
                <Input placeholder="e.g., Chest pain for 2 days" className="bg-gray-900 border-gray-600" />
              </div>
              
              <div className="mt-3">
                <label className="text-xs text-gray-400 block mb-1">Upload Documents</label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">
                    Drag & drop PDF, Word docs, or images
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lab reports, imaging, clinical notes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Active Findings List */}
        {abnormalFindings.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Active Findings ({abnormalFindings.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {abnormalFindings.map(finding => (
                <div
                  key={finding.id}
                  className={`bg-gray-800 border rounded-lg px-3 py-2 text-sm ${
                    finding.isCritical ? 'border-red-500/50' : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {renderDirectionIcon(finding.direction)}
                    <span className="text-white font-medium">
                      {finding.parameterName || finding.parameterId.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => removeFinding(finding.id)}
                      className="text-gray-500 hover:text-red-400 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Show actual value vs normal range */}
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className={`font-bold ${
                      finding.isCritical ? 'text-red-400' :
                      finding.direction === 'decrease' ? 'text-blue-400' : 'text-orange-400'
                    }`}>
                      {finding.actualValue?.toFixed(1)} {finding.unit}
                    </span>
                    <span className="text-gray-500">
                      (Normal: <span className="text-green-400">{finding.normalRange}</span>)
                    </span>
                    {finding.isCritical && (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Critical
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              onClick={runDifferentialAnalysis}
              disabled={isAnalyzing}
              className="mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isAnalyzing ? (
                <>Analyzing...</>
              ) : (
                <><Brain className="w-4 h-4 mr-2" /> Generate Differential</>
              )}
            </Button>
          </div>
        )}
        
        {/* Differential Results */}
        {differential.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-green-400" />
              Differential Diagnosis (Ranked by Probability)
            </h4>
            
            <div className="space-y-2">
              {differential.slice(0, 10).map((dx, index) => (
                <div
                  key={dx.diseaseCode}
                  className={`bg-gray-800/70 border rounded-lg overflow-hidden transition-all ${
                    expandedDiagnosis === dx.diseaseCode 
                      ? 'border-purple-500' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div
                    className="p-3 cursor-pointer"
                    onClick={() => setExpandedDiagnosis(
                      expandedDiagnosis === dx.diseaseCode ? null : dx.diseaseCode
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-green-900/50 text-green-400' :
                          index < 3 ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{dx.diseaseName}</div>
                          <div className="text-xs text-gray-400">
                            {dx.icd10} • {dx.category} • {dx.matchCount} parameters matched
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Probability Score */}
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            dx.probabilityScore >= 60 ? 'text-green-400' :
                            dx.probabilityScore >= 40 ? 'text-yellow-400' :
                            'text-gray-400'
                          }`}>
                            {dx.probabilityScore}%
                          </div>
                          <div className={`text-xs ${getConfidenceColor(dx.confidence)}`}>
                            {dx.confidence} confidence
                          </div>
                        </div>
                        
                        {/* Probability Bar */}
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProbabilityColor(dx.probabilityScore)} transition-all`}
                            style={{ width: `${Math.min(100, dx.probabilityScore)}%` }}
                          />
                        </div>
                        
                        {expandedDiagnosis === dx.diseaseCode ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedDiagnosis === dx.diseaseCode && (
                    <div className="px-3 pb-3 pt-0 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        {/* Matched Parameters */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-400 mb-2">Supporting Evidence</h5>
                          <div className="space-y-1">
                            {dx.matchedParams.map((param, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                {renderDirectionIcon(param.direction)}
                                <span className="text-white">{param.param.replace(/_/g, ' ')}</span>
                                <span className="text-gray-500">({param.expectedChange})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Clinical Summary */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-400 mb-2">Typical Presentation</h5>
                          {dx.clinicalSummary && (
                            <div className="space-y-1 text-xs">
                              {dx.clinicalSummary.symptoms.slice(0, 4).map((symptom, idx) => (
                                <div key={idx} className="text-gray-300">• {symptom}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => onSelectDisease && onSelectDisease(dx.diseaseCode)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Heart className="w-3 h-3 mr-1" /> View Disease Model
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300"
                        >
                          <Clipboard className="w-3 h-3 mr-1" /> Clinical Guidelines
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {differential.length > 10 && (
              <div className="text-center mt-3">
                <Button variant="ghost" className="text-gray-400 hover:text-white">
                  Show {differential.length - 10} more diagnoses
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Empty State */}
        {abnormalFindings.length === 0 && differential.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Add abnormal findings or paste clinical text</p>
            <p className="text-sm">to generate differential diagnosis</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DifferentialDiagnosisPanel;
