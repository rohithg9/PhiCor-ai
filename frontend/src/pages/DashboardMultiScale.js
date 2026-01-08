import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  Activity, Moon, Sun, ChevronRight, ChevronDown, ChevronUp, ChevronLeft,
  Layers, Atom, Heart, Zap, RotateCcw, BookOpen, Lightbulb,
  AlertTriangle, Check, Menu, X, Stethoscope, FlaskConical,
  FileImage, Pill, Clock, TrendingUp, TrendingDown, Info, Microscope,
  Brain, Sparkles, Loader2, Search, Thermometer, HeartPulse,
  TestTube, ScanLine, Syringe, ClipboardList, Calculator, Home, User, Users
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Slider } from '../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Input } from '../components/ui/input';
import { FeatureTutorial, TutorialButton, useTutorial } from '../components/FeatureTutorial';
import LeftPanel from '../components/LeftPanel';
import { ORGAN_MODELS } from '../data/organModels';
import { BIOCHEMISTRY } from '../data/biochemistry';
// Re-add static disease imports for comprehensive parameter modifications
import DISEASE_MODELS from '../data/diseaseModels';
import { getCalculatorsForDisease, getCalculatorsForOrgan, CLINICAL_CALCULATORS } from '../data/clinicalCalculators';
import LungCancerModule from '../components/LungCancerModule';
import TreatmentGuidelinesPanel from '../components/TreatmentGuidelinesPanel';
import DiseaseDetailPanel from '../components/DiseaseDetailPanel';
import FeatureNav from '../components/FeatureNav';
import RegionSelector from '../components/RegionSelector';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';


const SCALE_LEVELS = [
  // Core anatomical scales
  { id: 'geometry', name: 'Geometry', fullName: 'Geometry & Dimensions', icon: '📐', description: 'Shape, size, volumes' },
  { id: 'pressures', name: 'Pressures', fullName: 'Pressures & Gradients', icon: '📊', description: 'Forces and flows' },
  { id: 'structure', name: 'Structure', fullName: 'Structure & Tissue', icon: '🔬', description: 'Tissue composition' },
  { id: 'physiology', name: 'Physiology', fullName: 'Physiology & Function', icon: '⚡', description: 'Functional measures' },
  { id: 'cellular', name: 'Cellular', fullName: 'Cellular & Molecular', icon: '🧬', description: 'Cell-level processes' },
  // Lab tests & biomarkers
  { id: 'lab_tests', name: 'Lab Tests', fullName: 'Laboratory Tests', icon: '🧪', description: 'Blood tests, biomarkers' },
  { id: 'urinalysis', name: 'Urinalysis', fullName: 'Urinalysis', icon: '💧', description: 'Urine analysis' },
  // Imaging & Diagnostics
  { id: 'imaging', name: 'Imaging', fullName: 'Imaging Parameters', icon: '📷', description: 'CT, MRI, Ultrasound' },
  { id: 'ecg', name: 'ECG', fullName: 'ECG / Electrocardiogram', icon: '💓', description: 'Heart electrical activity' },
  // Clinical examination
  { id: 'vital_signs', name: 'Vitals', fullName: 'Vital Signs', icon: '❤️', description: 'BP, HR, Temp, RR' },
  { id: 'physical_exam', name: 'Physical', fullName: 'Physical Examination', icon: '🩺', description: 'Clinical findings' },
  // Cellular/Molecular scales
  { id: 'dna', name: 'DNA', fullName: 'DNA & Genetics', icon: '🧬', description: 'Genetic markers' },
  { id: 'gene_expression', name: 'Gene Expr', fullName: 'Gene Expression', icon: '📊', description: 'mRNA & proteins' },
  { id: 'metabolism', name: 'Metabolism', fullName: 'Metabolism', icon: '⚗️', description: 'ATP, redox' },
  { id: 'cell_cycle', name: 'Cell Cycle', fullName: 'Cell Cycle', icon: '🔄', description: 'Proliferation' },
  // Additional clinical scales from API
  { id: 'cbc', name: 'CBC', fullName: 'Complete Blood Count', icon: '🩸', description: 'Blood cell counts' },
  { id: 'renal_function', name: 'Renal', fullName: 'Renal Function', icon: '🫘', description: 'Kidney function tests' },
];

// Mapping between ORGAN_MODELS parameter IDs and API parameter IDs
// This allows API modifications to apply to ORGAN_MODELS parameters
const PARAM_ID_MAPPING = {
  // Heart Physiology mappings
  'ef': ['echo_ef', 'ejection_fraction', 'lvef', 'ef', 'lv_ejection_fraction'],
  'cardiac_output': ['cardiac_output', 'co', 'cardiac_output_l_min'],
  'cardiac_index': ['cardiac_index', 'ci'],
  'heart_rate': ['heart_rate', 'hr', 'resting_hr', 'pulse_rate', 'resting_heart_rate', 'rate'],
  'stroke_volume': ['stroke_volume', 'sv'],
  'e_a_ratio': ['e_a_ratio', 'mitral_e_a_ratio'],
  'e_e_prime': ['e_e_prime', 'e_e_ratio', 'mitral_e_e_prime'],
  'gls': ['gls', 'global_longitudinal_strain', 'lv_gls'],
  'tapse': ['tapse', 'rv_tapse'],
  // Heart Geometry mappings - map to size/dimension params
  'lv_edv': ['lv_edv', 'lv_volume_diastole', 'lv_end_diastolic_volume', 'lvedv', 'lv_size', 'left_ventricular_size'],
  'lv_esv': ['lv_esv', 'lv_volume_systole', 'lv_end_systolic_volume', 'lvesv'],
  'lv_mass': ['lv_mass', 'lv_weight', 'lv_mass_index'],
  'lv_wall_thickness': ['lv_wall_thickness', 'lv_thickness', 'ivs_thickness', 'lv_posterior_wall'],
  'rv_edv': ['rv_edv', 'rv_end_diastolic_volume', 'rv_size'],
  'rv_esv': ['rv_esv', 'rv_end_systolic_volume'],
  'la_diameter': ['la_diameter', 'la_size', 'left_atrium_diameter', 'la_volume'],
  // Pressure mappings
  'systolic_bp': ['systolic_bp', 'sbp', 'systolic_blood_pressure'],
  'diastolic_bp': ['diastolic_bp', 'dbp', 'diastolic_blood_pressure'],
  'map': ['map', 'mean_arterial_pressure'],
  'jvp': ['jvp', 'jvp_height', 'jugular_venous_pressure'],
  'lv_systolic_pressure': ['lv_systolic_pressure', 'lvsp'],
  'lv_end_diastolic_pressure': ['lv_end_diastolic_pressure', 'lvedp', 'pcwp'],
  'pulmonary_artery_pressure': ['pulmonary_artery_pressure', 'pa_pressure', 'mean_pap'],
  // ECG mappings
  'pr_interval': ['pr_interval'],
  'qrs_duration': ['qrs_duration'],
  'qt_interval': ['qt_interval', 'qtc'],
  // Lab test mappings
  'bnp': ['bnp', 'brain_natriuretic_peptide'],
  'nt_probnp': ['nt_probnp', 'ntprobnp', 'nt_pro_bnp'],
  'troponin_i': ['troponin_i', 'troponin', 'tni', 'hs_troponin'],
  'troponin_t': ['troponin_t', 'tnt', 'hs_troponin_t'],
  'creatinine': ['creatinine', 'cr', 'serum_creatinine'],
  'hemoglobin': ['hemoglobin', 'hb', 'hgb'],
  'crp': ['crp', 'c_reactive_protein', 'hs_crp', 'high_sensitivity_crp'],
  'sodium': ['sodium', 'na', 'serum_sodium'],
  'potassium': ['potassium', 'k', 'serum_potassium'],
  // Lung physiology
  'respiratory_rate': ['respiratory_rate', 'rr'],
  'spo2': ['spo2', 'oxygen_saturation', 'o2_sat'],
  'fev1': ['fev1'],
  'fvc': ['fvc', 'forced_vital_capacity'],
  'fev1_fvc': ['fev1_fvc', 'fev1_fvc_ratio'],
  // Kidney function
  'gfr': ['gfr', 'egfr', 'estimated_gfr'],
  'bun': ['bun', 'blood_urea_nitrogen'],
  // Blood
  'wbc': ['wbc', 'white_blood_cells', 'leukocytes'],
  'rbc': ['rbc', 'red_blood_cells', 'erythrocytes'],
  'platelets': ['platelets', 'plt', 'platelet_count'],
  'hematocrit': ['hematocrit', 'hct'],
};

// Reverse mapping: API param ID -> ORGAN_MODELS param ID
const API_TO_ORGAN_PARAM = {};
Object.entries(PARAM_ID_MAPPING).forEach(([organParam, apiParams]) => {
  apiParams.forEach(apiParam => {
    API_TO_ORGAN_PARAM[apiParam] = organParam;
  });
});

// Map API scales to ORGAN_MODELS scales - search in ALL these locations
const SCALE_MAPPING = {
  'vital_signs': 'physiology',
  'physical_exam': 'physiology',
  'imaging': 'geometry', // Imaging often has geometry data like LV size
  'ecg': 'ecg',
  'lab_tests': 'lab_tests',
  'urinalysis': 'urinalysis',
  'cbc': 'lab_tests',
  'renal_function': 'lab_tests',
  // Also map the reverse for API data that uses ORGAN_MODELS scale names
  'physiology': 'physiology',
  'geometry': 'geometry',
  'pressures': 'pressures',
  'structure': 'structure',
  'cellular': 'cellular',
};

// Extended scale search - always search in ALL these scales for any parameter
const ALL_SEARCHABLE_SCALES = [
  'geometry', 'physiology', 'pressures', 'structure', 'cellular',
  'vital_signs', 'physical_exam', 'imaging', 'lab_tests', 'ecg', 'urinalysis', 'cbc', 'renal_function'
];

// Mapping from API disease IDs to DISEASE_MODELS keys
// API IDs often use different naming conventions than static models
const API_TO_DISEASE_MODEL_KEY = {
  'cardiomyopathy_dilated': 'dilated_cardiomyopathy',
  'cardiomyopathy_hypertrophic': 'hypertrophic_cardiomyopathy',
  'heart_failure_hfref': 'heart_failure',
  'heart_failure_hfpef': 'heart_failure',
  'heart_failure': 'heart_failure',
  'chronic_kidney_disease': 'chronic_kidney_disease',
  'ckd': 'chronic_kidney_disease',
  'cirrhosis': 'cirrhosis',
  'liver_cirrhosis': 'cirrhosis',
  'sepsis': 'sepsis',
  'myocardial_infarction': 'acute_mi',
  'acute_mi': 'acute_mi',
  'hypertension': 'hypertension',
  'copd': 'copd',
  'atrial_fibrillation': 'atrial_fibrillation',
  'afib': 'atrial_fibrillation',
  // Add more mappings as needed
};

// Function to find the DISEASE_MODELS key for a given API disease ID
const getDiseaseModelKey = (apiDiseaseId) => {
  // First check direct mapping
  if (API_TO_DISEASE_MODEL_KEY[apiDiseaseId]) {
    return API_TO_DISEASE_MODEL_KEY[apiDiseaseId];
  }
  // Check if the key exists directly in DISEASE_MODELS
  if (DISEASE_MODELS[apiDiseaseId]) {
    return apiDiseaseId;
  }
  // Try some transformations
  // cardiomyopathy_dilated -> dilated_cardiomyopathy
  const parts = apiDiseaseId.split('_');
  if (parts.length === 2) {
    const reversed = `${parts[1]}_${parts[0]}`;
    if (DISEASE_MODELS[reversed]) {
      return reversed;
    }
  }
  // Try removing common prefixes/suffixes
  const cleanId = apiDiseaseId.replace(/_hfref|_hfpef|_type\d/g, '');
  if (DISEASE_MODELS[cleanId]) {
    return cleanId;
  }
  return null;
};

// Clinical Insights Component with AI
const ClinicalInsightsPanel = ({ disease, severity }) => {
  const defaultSymptoms = [
    "Fatigue and weakness",
    "Shortness of breath on exertion",
    "Chest discomfort",
    "Palpitations",
    "Dizziness or lightheadedness"
  ];
  
  // Safely get symptoms - handle both array of strings and array of objects formats
  const getSymptoms = () => {
    const raw = disease?.clinicalPresentation?.symptoms;
    if (!raw) return defaultSymptoms;
    if (Array.isArray(raw)) {
      // Normalize: if array contains objects, extract the name property
      return raw.map(s => typeof s === 'string' ? s : s?.name || 'Unknown symptom');
    }
    if (typeof raw === 'object' && raw !== null) {
      return Object.values(raw).map(s => typeof s === 'string' ? s : s?.name || 'Unknown');
    }
    return defaultSymptoms;
  };

  const clinicalData = disease ? {
    symptoms: getSymptoms(),
    labTests: disease.clinicalPresentation?.labTests || [
      { name: "BNP/NT-proBNP", value: "Elevated", significance: "Heart strain marker" },
      { name: "Troponin", value: "May be elevated", significance: "Myocardial injury" },
      { name: "CBC", value: "Check for anemia", significance: "Contributing factor" },
      { name: "BMP", value: "Electrolytes, kidney function", significance: "Baseline assessment" }
    ],
    imaging: disease.clinicalPresentation?.imaging || [
      { type: "Echocardiogram", findings: "Assess wall thickness, EF, diastolic function" },
      { type: "ECG", findings: "LVH patterns, arrhythmias" },
      { type: "Cardiac MRI", findings: "Detailed tissue characterization" }
    ],
    treatments: disease.clinicalPresentation?.treatments || [
      { category: "Medications", items: ["Beta-blockers", "ACE inhibitors", "Diuretics if needed"] },
      { category: "Lifestyle", items: ["Sodium restriction", "Fluid management", "Activity modification"] },
      { category: "Monitoring", items: ["Regular follow-up", "Serial imaging", "Symptom tracking"] }
    ]
  } : null;

  if (!disease) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-primary" />
          Clinical Detection
        </h3>
        <Badge variant="outline" className="text-xs">
          {severity < 0.33 ? 'Mild' : severity < 0.66 ? 'Moderate' : 'Severe'}
        </Badge>
      </div>

      {/* Symptoms */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Patient Symptoms
        </h4>
        <ul className="space-y-1">
          {clinicalData?.symptoms.slice(0, 4).map((symptom, i) => (
            <li key={i} className="text-xs flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{symptom}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Lab Tests */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <FlaskConical className="w-3 h-3" /> Lab Tests
        </h4>
        <div className="space-y-2">
          {clinicalData?.labTests.slice(0, 3).map((test, i) => (
            <div key={i} className="text-xs">
              <div className="flex justify-between">
                <span className="font-medium">{test.name}</span>
                <span className="text-primary">{test.value}</span>
              </div>
              <span className="text-muted-foreground text-[10px]">{test.significance}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Imaging */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <FileImage className="w-3 h-3" /> Imaging
        </h4>
        <div className="space-y-2">
          {clinicalData?.imaging.slice(0, 2).map((img, i) => (
            <div key={i} className="text-xs">
              <span className="font-medium">{img.type}</span>
              <p className="text-muted-foreground text-[10px]">{img.findings}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Treatment */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <Pill className="w-3 h-3" /> Treatment Approach
        </h4>
        {clinicalData?.treatments.slice(0, 2).map((treatment, i) => (
          <div key={i} className="mb-2 last:mb-0">
            <span className="text-xs font-medium text-primary">{treatment.category}:</span>
            <p className="text-xs text-muted-foreground">{treatment.items.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Clinical Data API Component - Extracts vitals, labs, physical exam, DNA from API data
const ClinicalDataPanel = ({ modifications, disease, severity }) => {
  if (!modifications || !disease) return null;
  
  // Extract clinical data from API parameter_modifications
  const extractClinicalData = () => {
    const vitalSigns = [];
    const labTests = [];
    const physicalExam = [];
    const dnaMarkers = [];
    const ecgFindings = [];
    const riskFactors = [];
    
    // Process each organ's modifications
    Object.entries(modifications).forEach(([organId, organMods]) => {
      if (!organMods || typeof organMods !== 'object') return;
      
      Object.entries(organMods).forEach(([scaleId, scaleMods]) => {
        if (!scaleMods || typeof scaleMods !== 'object') return;
        
        // Helper function to format change value as string
        const formatChange = (param) => {
          if (param.change_percent !== undefined && param.change_percent !== null) {
            return `${param.direction === 'decrease' ? '-' : '+'}${param.change_percent}%`;
          }
          if (param.value !== undefined && param.value !== null) {
            return String(param.value);
          }
          return param.direction || 'N/A';
        };
        
        // Handle different scale types
        if (scaleId === 'vital_signs' || scaleId === 'vitals') {
          Object.entries(scaleMods).forEach(([paramId, param]) => {
            if (!param || typeof param !== 'object') return;
            vitalSigns.push({
              name: paramId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              change: formatChange(param),
              evidence: param.evidence || ''
            });
          });
        } else if (scaleId === 'lab_tests' || scaleId === 'labs') {
          Object.entries(scaleMods).forEach(([paramId, param]) => {
            if (!param || typeof param !== 'object') return;
            labTests.push({
              name: paramId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              change: formatChange(param),
              evidence: param.evidence || ''
            });
          });
        } else if (scaleId === 'physical_exam') {
          Object.entries(scaleMods).forEach(([paramId, param]) => {
            if (!param || typeof param !== 'object') return;
            physicalExam.push({
              name: paramId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              finding: param.value !== undefined ? (param.value === 1 ? 'Present' : param.value === 0 ? 'Absent' : String(param.value)) : `${param.direction || 'N/A'}`,
              evidence: param.evidence || ''
            });
          });
        } else if (scaleId === 'dna' || scaleId === 'genetics' || scaleId === 'gene_expression') {
          Object.entries(scaleMods).forEach(([paramId, param]) => {
            if (!param || typeof param !== 'object') return;
            dnaMarkers.push({
              name: paramId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              change: formatChange(param),
              evidence: param.evidence || ''
            });
          });
        } else if (scaleId === 'ecg') {
          Object.entries(scaleMods).forEach(([paramId, param]) => {
            if (!param || typeof param !== 'object') return;
            ecgFindings.push({
              name: paramId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              change: formatChange(param),
              evidence: param.evidence || ''
            });
          });
        } else if (scaleId === 'risk_factors') {
          Object.entries(scaleMods).forEach(([paramId, param]) => {
            if (!param || typeof param !== 'object') return;
            riskFactors.push({
              name: paramId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              level: String(param.risk_level || param.value || param.direction || 'N/A'),
              evidence: param.evidence || ''
            });
          });
        }
      });
    });
    
    return { vitalSigns, labTests, physicalExam, dnaMarkers, ecgFindings, riskFactors };
  };
  
  const clinicalData = extractClinicalData();
  const hasAnyData = Object.values(clinicalData).some(arr => arr.length > 0);
  
  if (!hasAnyData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" />
            Clinical Parameters
          </h3>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-3 text-center">
          <p className="text-xs text-muted-foreground">No clinical data available for this disease</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-primary" />
          Clinical Parameters
        </h3>
        <Badge variant="outline" className="text-xs">
          {severity < 0.33 ? 'Mild' : severity < 0.66 ? 'Moderate' : 'Severe'}
        </Badge>
      </div>

      {/* Vital Signs */}
      {clinicalData.vitalSigns.length > 0 && (
        <div className="rounded-lg border border-border/50 bg-card/50 p-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Vital Signs
          </h4>
          <div className="space-y-1.5">
            {clinicalData.vitalSigns.slice(0, 5).map((vital, i) => (
              <div key={i} className="text-xs flex items-center justify-between">
                <span className="font-medium">{vital.name}</span>
                <span className={`px-1.5 py-0.5 rounded ${
                  String(vital.change || '').includes('-') ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'
                }`}>{vital.change}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab Tests */}
      {clinicalData.labTests.length > 0 && (
        <div className="rounded-lg border border-border/50 bg-card/50 p-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <FlaskConical className="w-3 h-3" /> Laboratory Tests
          </h4>
          <div className="space-y-1.5">
            {clinicalData.labTests.slice(0, 6).map((lab, i) => (
              <div key={i} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{lab.name}</span>
                  <span className={`px-1.5 py-0.5 rounded ${
                    String(lab.change || '').includes('-') ? 'bg-blue-500/10 text-blue-500' : 'bg-destructive/10 text-destructive'
                  }`}>{lab.change}</span>
                </div>
                {lab.evidence && <p className="text-[10px] text-muted-foreground mt-0.5">{lab.evidence}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Physical Exam */}
      {clinicalData.physicalExam.length > 0 && (
        <div className="rounded-lg border border-border/50 bg-card/50 p-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Stethoscope className="w-3 h-3" /> Physical Examination
          </h4>
          <div className="space-y-1.5">
            {clinicalData.physicalExam.slice(0, 5).map((exam, i) => (
              <div key={i} className="text-xs flex items-center justify-between">
                <span className="font-medium">{exam.name}</span>
                <Badge variant="outline" className="text-[10px]">{exam.finding}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DNA/Genetic Markers */}
      {clinicalData.dnaMarkers.length > 0 && (
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
          <h4 className="text-xs font-medium text-purple-400 mb-2 flex items-center gap-1">
            🧬 DNA & Genetic Markers
          </h4>
          <div className="space-y-1.5">
            {clinicalData.dnaMarkers.slice(0, 5).map((marker, i) => (
              <div key={i} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-purple-300">{marker.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">{marker.change}</span>
                </div>
                {marker.evidence && <p className="text-[10px] text-muted-foreground mt-0.5">{marker.evidence}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ECG Findings */}
      {clinicalData.ecgFindings.length > 0 && (
        <div className="rounded-lg border border-border/50 bg-card/50 p-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Activity className="w-3 h-3" /> ECG Findings
          </h4>
          <div className="space-y-1.5">
            {clinicalData.ecgFindings.slice(0, 4).map((ecg, i) => (
              <div key={i} className="text-xs flex items-center justify-between">
                <span className="font-medium">{ecg.name}</span>
                <span className="text-primary">{ecg.change}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Factors */}
      {clinicalData.riskFactors.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <h4 className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Risk Factors
          </h4>
          <div className="space-y-1.5">
            {clinicalData.riskFactors.slice(0, 4).map((risk, i) => (
              <div key={i} className="text-xs flex items-center justify-between">
                <span className="font-medium">{risk.name}</span>
                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">{risk.level}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Equation Derivation Component with Calculated Results
const EquationDerivation = ({ equation, expanded, onToggle, currentParams = {}, diseaseSeverity = 0.5, isDiseasedState = false }) => {
  const isNovel = equation.evidence === 'novel' || equation.isNovel;
  
  // Calculate values based on equation type
  const getCalculatedValues = () => {
    const params = currentParams || {};
    const severity = diseaseSeverity;
    
    // Common cardiac equations
    if (equation.id === 'stroke_volume' || equation.name?.includes('Stroke Volume')) {
      const edv = params.lv_edv || 120;
      const esv = params.lv_esv || 50;
      const diseasedEdv = isDiseasedState ? edv * (1 - 0.2 * severity) : edv;
      const diseasedEsv = isDiseasedState ? esv * (1 + 0.3 * severity) : esv;
      return {
        normal: { edv: 120, esv: 50, result: 70, unit: 'mL' },
        current: { edv: diseasedEdv.toFixed(0), esv: diseasedEsv.toFixed(0), result: (diseasedEdv - diseasedEsv).toFixed(0), unit: 'mL' },
        formula: 'SV = EDV - ESV',
        calculation: `SV = ${diseasedEdv.toFixed(0)} - ${diseasedEsv.toFixed(0)} = ${(diseasedEdv - diseasedEsv).toFixed(0)} mL`
      };
    }
    
    if (equation.id === 'cardiac_output' || equation.name?.includes('Cardiac Output')) {
      const sv = params.stroke_volume || 70;
      const hr = params.heart_rate || 70;
      const diseasedSv = isDiseasedState ? sv * (1 - 0.25 * severity) : sv;
      const diseasedHr = isDiseasedState ? hr * (1 + 0.15 * severity) : hr;
      return {
        normal: { sv: 70, hr: 70, result: 4.9, unit: 'L/min' },
        current: { sv: diseasedSv.toFixed(0), hr: diseasedHr.toFixed(0), result: ((diseasedSv * diseasedHr) / 1000).toFixed(1), unit: 'L/min' },
        formula: 'CO = SV × HR',
        calculation: `CO = ${diseasedSv.toFixed(0)} × ${diseasedHr.toFixed(0)} / 1000 = ${((diseasedSv * diseasedHr) / 1000).toFixed(1)} L/min`
      };
    }
    
    if (equation.id === 'ef_calc' || equation.name?.includes('Ejection Fraction')) {
      const edv = params.lv_edv || 120;
      const esv = params.lv_esv || 50;
      const diseasedEdv = isDiseasedState ? edv * (1 - 0.15 * severity) : edv;
      const diseasedEsv = isDiseasedState ? esv * (1 + 0.4 * severity) : esv;
      const ef = ((diseasedEdv - diseasedEsv) / diseasedEdv * 100);
      return {
        normal: { edv: 120, esv: 50, result: 58, unit: '%' },
        current: { edv: diseasedEdv.toFixed(0), esv: diseasedEsv.toFixed(0), result: ef.toFixed(0), unit: '%' },
        formula: 'EF = (EDV - ESV) / EDV × 100',
        calculation: `EF = (${diseasedEdv.toFixed(0)} - ${diseasedEsv.toFixed(0)}) / ${diseasedEdv.toFixed(0)} × 100 = ${ef.toFixed(0)}%`
      };
    }
    
    if (equation.id === 'homa_ir_calc' || equation.name?.includes('HOMA-IR')) {
      const glucose = params.fasting_glucose || 90;
      const insulin = params.fasting_insulin || 10;
      const diseasedGlucose = isDiseasedState ? glucose * (1 + 0.4 * severity) : glucose;
      const diseasedInsulin = isDiseasedState ? insulin * (1 + 0.5 * severity) : insulin;
      const homaIr = (diseasedGlucose * diseasedInsulin) / 405;
      return {
        normal: { glucose: 90, insulin: 10, result: 2.2, unit: '' },
        current: { glucose: diseasedGlucose.toFixed(0), insulin: diseasedInsulin.toFixed(0), result: homaIr.toFixed(1), unit: '' },
        formula: 'HOMA-IR = (Glucose × Insulin) / 405',
        calculation: `HOMA-IR = (${diseasedGlucose.toFixed(0)} × ${diseasedInsulin.toFixed(0)}) / 405 = ${homaIr.toFixed(1)}`
      };
    }
    
    if (equation.id === 'homa_beta' || equation.name?.includes('HOMA-β')) {
      const glucose = params.fasting_glucose || 90;
      const insulin = params.fasting_insulin || 10;
      const diseasedGlucose = isDiseasedState ? glucose * (1 + 0.4 * severity) : glucose;
      const diseasedInsulin = isDiseasedState ? insulin * (1 - 0.3 * severity) : insulin;
      const homaBeta = (360 * diseasedInsulin) / (diseasedGlucose - 63);
      return {
        normal: { glucose: 90, insulin: 10, result: 133, unit: '%' },
        current: { glucose: diseasedGlucose.toFixed(0), insulin: diseasedInsulin.toFixed(0), result: homaBeta.toFixed(0), unit: '%' },
        formula: 'HOMA-β = (360 × Insulin) / (Glucose - 63)',
        calculation: `HOMA-β = (360 × ${diseasedInsulin.toFixed(0)}) / (${diseasedGlucose.toFixed(0)} - 63) = ${homaBeta.toFixed(0)}%`
      };
    }
    
    if (equation.id === 'gfr_starling' || equation.name?.includes('GFR')) {
      const kf = 12.5;
      const pGc = params.glomerular_cap_p || 60;
      const pBc = params.bowman_p || 18;
      const piGc = params.oncotic_p || 32;
      const diseasedPgc = isDiseasedState ? pGc * (1 - 0.1 * severity) : pGc;
      const nfp = diseasedPgc - pBc - piGc;
      const gfr = kf * nfp;
      return {
        normal: { kf: 12.5, pgc: 60, pbc: 18, pi: 32, result: 125, unit: 'mL/min' },
        current: { kf: 12.5, pgc: diseasedPgc.toFixed(0), pbc: 18, pi: 32, result: gfr.toFixed(0), unit: 'mL/min' },
        formula: 'GFR = Kf × (PGC - PBC - πGC)',
        calculation: `GFR = 12.5 × (${diseasedPgc.toFixed(0)} - 18 - 32) = ${gfr.toFixed(0)} mL/min`
      };
    }
    
    if (equation.id === 'wall_stress' || equation.name?.includes('Wall Stress')) {
      const p = params.lv_sys_p || 120;
      const r = 25; // radius in mm
      const h = params.lv_wall_thickness || 10;
      const diseasedP = isDiseasedState ? p * (1 + 0.3 * severity) : p;
      const diseasedH = isDiseasedState ? h * (1 - 0.15 * severity) : h;
      const stress = (diseasedP * r) / (2 * diseasedH);
      return {
        normal: { p: 120, r: 25, h: 10, result: 150, unit: 'kPa' },
        current: { p: diseasedP.toFixed(0), r: 25, h: diseasedH.toFixed(1), result: stress.toFixed(0), unit: 'kPa' },
        formula: 'σ = (P × r) / (2h)',
        calculation: `σ = (${diseasedP.toFixed(0)} × 25) / (2 × ${diseasedH.toFixed(1)}) = ${stress.toFixed(0)} kPa`
      };
    }
    
    if (equation.id === 'beta_cell_function' || equation.name?.includes('β-Cell')) {
      const mBeta = params.beta_cell_mass || 1.5;
      const k = 100;
      const fViability = isDiseasedState ? 1 - 0.4 * severity : 1;
      const fExhaustion = isDiseasedState ? 1 - 0.3 * severity : 1;
      const insMax = k * mBeta * fViability * fExhaustion;
      return {
        normal: { k: 100, mBeta: 1.5, fVia: 1, fExh: 1, result: 150, unit: 'µU/mL' },
        current: { k: 100, mBeta: mBeta.toFixed(1), fVia: fViability.toFixed(2), fExh: fExhaustion.toFixed(2), result: insMax.toFixed(0), unit: 'µU/mL' },
        formula: 'Ins_max = k × M_β × f_viability × f_exhaustion',
        calculation: `Ins_max = 100 × ${mBeta.toFixed(1)} × ${fViability.toFixed(2)} × ${fExhaustion.toFixed(2)} = ${insMax.toFixed(0)} µU/mL`
      };
    }
    
    // Default calculation placeholder
    return null;
  };

  const calculatedValues = getCalculatedValues();
  
  // Use equation's derivation if available, otherwise create informative defaults
  const derivationSteps = equation.derivation || [
    {
      step: 1,
      title: "Mathematical Foundation",
      description: equation.latex 
        ? `This equation ${equation.isNovel ? 'is a novel formula' : 'is an established formula'} based on ${equation.source || 'clinical guidelines'}.`
        : "Begin with fundamental conservation principles",
      latex: null
    },
    {
      step: 2,
      title: "Clinical Parameters",
      description: equation.description || "This equation quantifies physiological relationships using measurable clinical parameters.",
    },
    {
      step: 3,
      title: "Clinical Application",
      description: equation.validation || 
        (equation.isNovel 
          ? "This novel equation provides additional insight beyond established measures and requires further validation."
          : "Validated against clinical measurements in peer-reviewed studies and widely used in clinical practice."),
    }
  ];

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      isNovel 
        ? 'border-amber-500/50 bg-amber-500/10' 
        : 'border-border/50 bg-card/30'
    }`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-3 md:p-4 transition-colors ${
          isNovel ? 'hover:bg-amber-500/20' : 'hover:bg-accent/5'
        }`}
      >
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <Badge 
            variant={isNovel ? 'default' : 'outline'} 
            className={`shrink-0 text-[10px] ${isNovel ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : ''}`}
          >
            {isNovel ? (
              <><Lightbulb className="w-2.5 h-2.5 mr-1" />Novel</>
            ) : (
              <><Check className="w-2.5 h-2.5 mr-1" />Established</>
            )}
          </Badge>
          <div className="text-left min-w-0">
            <h4 className="font-medium text-sm truncate">{equation.name}</h4>
            <p className="text-xs text-muted-foreground truncate hidden sm:block">{equation.description}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground shrink-0" />
        )}
      </button>
      
      <AnimatePresence mode="wait">
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`border-t overflow-hidden ${isNovel ? 'border-amber-500/50' : 'border-border/50'}`}
          >
            <div className="p-3 md:p-4 space-y-4">
              {/* Main Equation */}
              <div className="bg-background/50 rounded-lg p-3 md:p-6 overflow-x-auto">
                <BlockMath math={equation.latex} />
              </div>

              {/* Calculated Values Section */}
              {calculatedValues && (
                <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg p-3 md:p-4 border border-primary/20">
                  <h5 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Calculator className="w-3 h-3" /> Live Calculation
                  </h5>
                  
                  {/* Calculation with actual values */}
                  <div className="bg-background/50 rounded-lg p-3 mb-3 font-mono text-sm overflow-x-auto">
                    <div className="text-muted-foreground mb-1">{calculatedValues.formula}</div>
                    <div className="text-foreground font-medium">{calculatedValues.calculation}</div>
                  </div>
                  
                  {/* Results comparison */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                      <div className="text-[10px] text-green-400 uppercase tracking-wider mb-1">Normal</div>
                      <div className="text-xl font-bold text-green-400">
                        {calculatedValues.normal.result}
                        <span className="text-sm ml-1">{calculatedValues.normal.unit}</span>
                      </div>
                    </div>
                    <div className={`rounded-lg p-3 border ${
                      isDiseasedState 
                        ? 'bg-destructive/10 border-destructive/20' 
                        : 'bg-blue-500/10 border-blue-500/20'
                    }`}>
                      <div className={`text-[10px] uppercase tracking-wider mb-1 ${
                        isDiseasedState ? 'text-destructive' : 'text-blue-400'
                      }`}>
                        {isDiseasedState ? 'Current (Diseased)' : 'Current'}
                      </div>
                      <div className={`text-xl font-bold ${
                        isDiseasedState ? 'text-destructive' : 'text-blue-400'
                      }`}>
                        {calculatedValues.current.result}
                        <span className="text-sm ml-1">{calculatedValues.current.unit}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isDiseasedState && (
                    <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      Values adjusted for disease severity ({(diseaseSeverity * 100).toFixed(0)}%)
                    </div>
                  )}
                </div>
              )}

              {/* Derivation Steps */}
              <div className="space-y-3">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-3 h-3" /> Derivation & Explanation
                </h5>
                
                {derivationSteps.map((step, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{step.title}:</span>
                      <p className="text-muted-foreground text-xs mt-0.5">{step.description}</p>
                      {step.latex && step.step > 1 && (
                        <div className="mt-2 p-2 bg-background/30 rounded overflow-x-auto">
                          <InlineMath math={step.latex} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Source */}
              {equation.source && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/30">
                  <BookOpen className="w-3 h-3" />
                  <span>Source: {equation.source}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===========================================
// RELEVANT CALCULATORS PANEL - Disease-linked calculators
// ===========================================
const RelevantCalculatorsPanel = ({ diseaseId, diseaseName, organId, isExpanded, onToggle }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = React.useState(isExpanded || false);
  
  // Get calculators for the disease or organ
  const relevantCalcs = React.useMemo(() => {
    const diseaseCalcs = diseaseId ? getCalculatorsForDisease(diseaseId) : [];
    const organCalcs = organId ? getCalculatorsForOrgan(organId) : [];
    
    // Combine and deduplicate
    const allCalcs = [...diseaseCalcs];
    organCalcs.forEach(calc => {
      if (!allCalcs.find(c => c.id === calc.id)) {
        allCalcs.push(calc);
      }
    });
    
    return allCalcs;
  }, [diseaseId, organId]);
  
  if (relevantCalcs.length === 0) return null;
  
  const handleExpand = () => {
    if (onToggle) onToggle();
    else setExpanded(!expanded);
  };
  
  const isOpen = onToggle ? isExpanded : expanded;
  
  return (
    <div className="border border-border/50 rounded-xl bg-card/30 overflow-hidden">
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Calculator className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm">Clinical Calculators</h3>
            <p className="text-xs text-muted-foreground">
              {relevantCalcs.length} scoring {relevantCalcs.length === 1 ? 'system' : 'systems'} relevant to {diseaseName || 'this condition'}
            </p>
          </div>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/50"
          >
            <div className="p-4 space-y-3">
              {relevantCalcs.map((calc, i) => (
                <div 
                  key={calc.id || i}
                  className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{calc.name}</span>
                        <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30">
                          {calc.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {calc.description}
                      </p>
                      <p className="text-[10px] text-amber-400/70">
                        {calc.usage}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/differential?tab=calculators')}
                      className="ml-3 text-xs border-amber-500/30 hover:bg-amber-500/20 text-amber-400"
                    >
                      <Calculator className="w-3 h-3 mr-1" />
                      Use
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                className="w-full text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                onClick={() => navigate('/differential?tab=calculators')}
              >
                <Calculator className="w-4 h-4 mr-2" />
                View All Calculators
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===========================================
// CLINICAL FINDINGS PANEL - Comprehensive disease data display
// ===========================================
const ClinicalFindingsPanel = ({ disease, isExpanded, onToggle, alwaysExpanded = false }) => {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [knowledgeData, setKnowledgeData] = React.useState(null);
  const [loadingKnowledge, setLoadingKnowledge] = React.useState(false);
  const expanded = alwaysExpanded || isExpanded;
  
  // Fetch knowledge data when Knowledge tab is selected
  React.useEffect(() => {
    if (activeTab === 'knowledge' && disease?.id && !knowledgeData) {
      setLoadingKnowledge(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      fetch(`${backendUrl}/api/knowledge/disease/${disease.id}`)
        .then(res => res.json())
        .then(data => {
          setKnowledgeData(data);
          setLoadingKnowledge(false);
        })
        .catch(() => {
          setLoadingKnowledge(false);
        });
    }
  }, [activeTab, disease?.id, knowledgeData]);
  
  if (!disease) return null;

  // Get clinical data from multiple sources - check ALL possible locations
  const comprehensiveModel = disease.comprehensive_model || {};
  const comprehensiveClinical = comprehensiveModel.clinicalPresentation || {};
  
  // Extract additional comprehensive data
  const geneticFactors = comprehensiveModel.geneticFactors || disease.geneticFactors || null;
  const novelEquations = comprehensiveModel.novelEquations || disease.novelEquations || [];
  const progressionData = comprehensiveModel.progression || disease.progression || [];
  const epidemiologyData = disease.epidemiology || {};
  const pathophysiologyText = typeof disease.pathophysiology === 'string' 
    ? disease.pathophysiology 
    : (disease.pathophysiology?.description || disease.pathophysiology?.mechanism || '');
  const prognosisData = disease.prognosis || comprehensiveModel.prognosis || '';
  const treatmentData = disease.treatment || comprehensiveModel.treatment || {};
  
  // Check both naming conventions: clinicalPresentation and clinical_presentation
  const regularClinical = disease.clinicalPresentation || disease.clinical_presentation || {};
  
  // Merge clinical data: prefer detailed data (from clinical_presentation) over simple strings
  const clinicalData = {
    symptoms: regularClinical.symptoms?.length > 0 
      ? regularClinical.symptoms 
      : comprehensiveClinical.symptoms || [],
    signs: regularClinical.signs?.length > 0 
      ? regularClinical.signs 
      : comprehensiveClinical.signs || [],
    labTests: regularClinical.labTests?.length > 0 
      ? regularClinical.labTests 
      : comprehensiveClinical.labTests || regularClinical.lab_tests || [],
    imaging: regularClinical.imaging?.length > 0 
      ? regularClinical.imaging 
      : comprehensiveClinical.imaging || [],
    treatments: regularClinical.treatments?.length > 0 
      ? regularClinical.treatments 
      : comprehensiveClinical.treatments || []
  };
  
  // Also check disease.physical_examination for signs
  const physicalExam = disease.physical_examination || {};
  if (clinicalData.signs.length === 0 && Object.keys(physicalExam).length > 0) {
    // Convert physical_examination object to signs array
    clinicalData.signs = Object.entries(physicalExam).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return { name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), ...value };
      }
      return { name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), finding: value };
    });
  }
  
  const labFindings = Array.isArray(disease.laboratoryFindings) 
    ? disease.laboratoryFindings 
    : (Array.isArray(disease.laboratory_findings) ? disease.laboratory_findings : clinicalData.labTests || []);
  const rawImagingFindings = disease.imagingFindings || disease.imaging_findings || {};
  const pathophysiology = disease.pathophysiology || {};
  
  // Safely extract text from complex objects
  const extractText = (item) => {
    if (!item) return null;
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      // Extract meaningful text from object properties
      const textParts = [];
      
      // Common properties to extract
      const primaryKeys = ['name', 'description', 'character', 'quality', 'location', 'finding', 'value'];
      const detailKeys = ['severity', 'timing', 'duration', 'progression', 'pattern', 'onset'];
      
      // Get primary description
      for (const key of primaryKeys) {
        if (item[key] && typeof item[key] === 'string') {
          textParts.push(item[key]);
          break;
        }
      }
      
      // Get additional details
      for (const key of detailKeys) {
        if (item[key] && typeof item[key] === 'string') {
          textParts.push(`${key}: ${item[key]}`);
        }
      }
      
      if (textParts.length > 0) {
        return textParts.join(' — ');
      }
      
      // Fallback: extract any string values
      const stringValues = Object.values(item).filter(v => typeof v === 'string' && v.length > 0);
      if (stringValues.length > 0) {
        return stringValues.join(' — ');
      }
    }
    return null;
  };
  
  // Safely extract array of strings from various data formats
  const safeArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.map(extractText).filter(Boolean);
    }
    if (typeof data === 'object' && data !== null) {
      // For nested objects, flatten and extract text
      const results = [];
      Object.values(data).forEach(value => {
        if (Array.isArray(value)) {
          value.forEach(item => {
            const text = extractText(item);
            if (text) results.push(text);
          });
        } else {
          const text = extractText(value);
          if (text) results.push(text);
        }
      });
      return results;
    }
    return [];
  };
  
  const symptoms = safeArray(clinicalData.symptoms);
  const signs = safeArray(clinicalData.signs);
  
  // Get all imaging modalities - handle nested object structures
  const imagingModalities = Object.entries(rawImagingFindings).map(([modality, findings]) => {
    let flatFindings = [];
    if (Array.isArray(findings)) {
      flatFindings = findings.map(extractText).filter(Boolean);
    } else if (typeof findings === 'object' && findings !== null) {
      // Flatten nested object (like {mca: [...], aca: [...], etc.})
      Object.entries(findings).forEach(([key, value]) => {
        const prefix = key.toUpperCase();
        if (Array.isArray(value)) {
          value.forEach(v => {
            const text = extractText(v);
            if (text) flatFindings.push(`${prefix}: ${text}`);
          });
        } else {
          const text = extractText(value);
          if (text) flatFindings.push(`${prefix}: ${text}`);
        }
      });
    } else if (findings) {
      const text = extractText(findings);
      if (text) flatFindings.push(text);
    }
    return [modality, flatFindings];
  }).filter(([_, findings]) => findings.length > 0);
  
  // Get equations from pathophysiology
  const equations = pathophysiology.equations ? Object.values(pathophysiology.equations) : [];

  // Count genetic data
  const geneticCount = geneticFactors ? (
    (geneticFactors.genes?.length || 0) + (geneticFactors.snps?.length || 0)
  ) : 0;

  // Count knowledge sources
  const knowledgeCount = knowledgeData?.stats?.total_sources || 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info, count: 0 },
    { id: 'symptoms', label: 'Symptoms', icon: Thermometer, count: symptoms.length },
    { id: 'signs', label: 'Signs', icon: Stethoscope, count: signs.length },
    { id: 'labs', label: 'Labs', icon: TestTube, count: labFindings.length },
    { id: 'imaging', label: 'Imaging', icon: ScanLine, count: imagingModalities.length },
    { id: 'genetics', label: 'Genetics', icon: Atom, count: geneticCount },
    { id: 'equations', label: 'Math Models', icon: Brain, count: equations.length + novelEquations.length },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen, count: knowledgeCount }
  ];

  return (
    <div className="border border-border/50 rounded-xl bg-card/30 overflow-hidden">
      {/* Header - hide toggle button if always expanded */}
      {!alwaysExpanded && (
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ClipboardList className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-sm">Clinical Findings Database</h3>
              <p className="text-xs text-muted-foreground">
                {symptoms.length + signs.length} clinical features • {labFindings.length} lab tests • {imagingModalities.length} imaging modalities
              </p>
            </div>
          </div>
          {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={alwaysExpanded ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={!alwaysExpanded ? "border-t border-border/50" : ""}
          >
            {/* Tab Navigation */}
            <div className="flex gap-1 p-2 overflow-x-auto border-b border-border/50 bg-accent/5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent/10'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 max-h-[50vh] md:max-h-[400px] overflow-y-auto overscroll-contain touch-pan-y">
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <p className="text-sm text-muted-foreground">{disease.description}</p>
                  </div>

                  {/* Epidemiology Section */}
                  {Object.keys(epidemiologyData).length > 0 && (
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" /> Epidemiology
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {epidemiologyData.prevalence && (
                          <div className="p-2 bg-background/50 rounded">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Prevalence</span>
                            <p className="text-xs font-medium mt-0.5">{epidemiologyData.prevalence}</p>
                          </div>
                        )}
                        {epidemiologyData.incidence && (
                          <div className="p-2 bg-background/50 rounded">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Incidence</span>
                            <p className="text-xs font-medium mt-0.5">{epidemiologyData.incidence}</p>
                          </div>
                        )}
                        {epidemiologyData.mortality && (
                          <div className="p-2 bg-background/50 rounded col-span-2">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Mortality</span>
                            <p className="text-xs font-medium mt-0.5">{epidemiologyData.mortality}</p>
                          </div>
                        )}
                      </div>
                      {epidemiologyData.risk_factors && epidemiologyData.risk_factors.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Factors</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {epidemiologyData.risk_factors.map((rf, i) => (
                              <Badge key={i} variant="outline" className="text-[9px] border-blue-500/30 text-blue-400">
                                {rf}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pathophysiology Section */}
                  {pathophysiologyText && (
                    <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <h4 className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-2">
                        <Microscope className="w-3.5 h-3.5" /> Pathophysiology
                      </h4>
                      <p className="text-sm text-muted-foreground">{pathophysiologyText}</p>
                    </div>
                  )}

                  {/* Prognosis Section */}
                  {prognosisData && (
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" /> Prognosis
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {typeof prognosisData === 'string' ? prognosisData : prognosisData.description || JSON.stringify(prognosisData)}
                      </p>
                    </div>
                  )}

                  {/* Disease Progression Stages */}
                  {progressionData && progressionData.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <h4 className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Disease Progression Stages
                      </h4>
                      <div className="space-y-2">
                        {progressionData.map((stage, i) => (
                          <div key={i} className="flex items-start gap-3 p-2 rounded bg-background/50">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              stage.severity < 0.3 ? 'bg-green-500/20 text-green-400' :
                              stage.severity < 0.6 ? 'bg-yellow-500/20 text-yellow-400' :
                              stage.severity < 0.8 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {stage.stage || i + 1}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-sm">{stage.name}</span>
                              <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                              {stage.yearsFromOnset && (
                                <span className="text-[10px] text-muted-foreground">
                                  Onset: {stage.yearsFromOnset}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SYMPTOMS TAB */}
              {activeTab === 'symptoms' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    Patient-Reported Symptoms
                  </div>
                  {symptoms.length > 0 ? (
                    <div className="space-y-2">
                      {symptoms.map((symptom, i) => {
                        // Handle both string format and object format with severity grades
                        const isObject = typeof symptom === 'object' && symptom !== null;
                        const symptomName = isObject ? symptom.name : symptom;
                        const severityGrades = isObject ? symptom.severity_grades : null;
                        const frequency = isObject ? symptom.frequency : null;
                        const onset = isObject ? symptom.onset : null;
                        const progression = isObject ? symptom.progression_with_disease : null;
                        
                        return (
                          <div key={i} className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                            <div className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[10px] font-bold text-orange-400">{i + 1}</span>
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-medium">{symptomName}</span>
                                {(frequency || onset) && (
                                  <div className="flex gap-3 mt-1 text-[10px]">
                                    {frequency && <Badge variant="outline" className="text-[9px] border-orange-500/30 text-orange-400">{frequency}</Badge>}
                                    {onset && <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-400">Onset: {onset}</Badge>}
                                  </div>
                                )}
                                {severityGrades && severityGrades.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Severity Grades:</span>
                                    <div className="grid grid-cols-2 gap-1">
                                      {severityGrades.map((grade, gi) => (
                                        <div key={gi} className={`text-[9px] px-2 py-1 rounded border ${
                                          gi === 0 ? 'border-green-500/30 bg-green-500/5 text-green-400' :
                                          gi === 1 ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400' :
                                          gi === 2 ? 'border-orange-500/30 bg-orange-500/5 text-orange-400' :
                                          'border-red-500/30 bg-red-500/5 text-red-400'
                                        }`}>
                                          <span className="font-bold">Grade {grade.grade}:</span> {grade.description}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {progression && (
                                  <p className="text-[10px] text-muted-foreground mt-1 italic">
                                    📈 {progression}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No symptoms data available</p>
                  )}
                </div>
              )}

              {/* SIGNS TAB */}
              {activeTab === 'signs' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Stethoscope className="w-4 h-4 text-green-400" />
                    Clinical Examination Signs
                  </div>
                  {signs.length > 0 ? (
                    <div className="space-y-2">
                      {signs.map((sign, i) => {
                        // Handle both string format and object format
                        const isObject = typeof sign === 'object' && sign !== null;
                        const signName = isObject ? sign.name : sign;
                        const howToDetect = isObject ? sign.how_to_detect : null;
                        const severityGrades = isObject ? sign.severity_grades : null;
                        const sensitivity = isObject ? sign.sensitivity : null;
                        const specificity = isObject ? sign.specificity : null;
                        
                        return (
                          <div key={i} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                            <div className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-green-400" />
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-medium">{signName}</span>
                                {howToDetect && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <span className="text-green-400">How to detect:</span> {howToDetect}
                                  </p>
                                )}
                                {severityGrades && severityGrades.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Severity Grades:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {severityGrades.map((grade, gi) => (
                                        <Badge key={gi} variant="outline" className={`text-[9px] ${
                                          gi === 0 ? 'border-green-500/50 text-green-400' :
                                          gi === 1 ? 'border-yellow-500/50 text-yellow-400' :
                                          'border-red-500/50 text-red-400'
                                        }`}>
                                          {grade.grade}: {grade.criteria || grade.description}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {(sensitivity || specificity) && (
                                  <div className="flex gap-3 mt-2 text-[10px]">
                                    {sensitivity && <span className="text-blue-400">Sensitivity: {sensitivity}</span>}
                                    {specificity && <span className="text-purple-400">Specificity: {specificity}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No clinical signs data available</p>
                  )}
                </div>
              )}

              {/* LABS TAB */}
              {activeTab === 'labs' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <TestTube className="w-4 h-4 text-purple-400" />
                    Laboratory Investigations
                  </div>
                  {labFindings.length > 0 ? (
                    <div className="space-y-2">
                      {labFindings.map((lab, i) => (
                        <div key={i} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{lab.name}</span>
                            <Badge variant="outline" className="text-[10px]">Lab Test</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Normal: </span>
                              <span className="text-green-400">{lab.normalRange}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">In Disease: </span>
                              <span className="text-red-400">{lab.abnormalInDisease}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No laboratory findings data available</p>
                  )}
                </div>
              )}

              {/* IMAGING TAB */}
              {activeTab === 'imaging' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <ScanLine className="w-4 h-4 text-cyan-400" />
                    Imaging & Diagnostic Studies
                  </div>
                  {imagingModalities.length > 0 ? (
                    <div className="space-y-3">
                      {imagingModalities.map(([modality, findings], i) => (
                        <div key={i} className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]">
                              {modality.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                          </div>
                          <ul className="space-y-1">
                            {(Array.isArray(findings) ? findings : [findings]).map((finding, j) => (
                              <li key={j} className="text-sm flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No imaging findings data available</p>
                  )}
                </div>
              )}

              {/* EQUATIONS TAB */}
              {activeTab === 'equations' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Brain className="w-4 h-4 text-amber-400" />
                    Mathematical Models & Equations
                  </div>
                  
                  {/* Established Equations */}
                  {equations.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="text-xs text-muted-foreground uppercase tracking-wider">Established Models</h5>
                      {equations.map((eq, i) => (
                        <div 
                          key={i} 
                          className="p-3 rounded-lg border bg-card/50 border-border/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{eq.name}</span>
                            <Badge variant="outline" className="text-[10px]">Established</Badge>
                          </div>
                          {eq.latex && (
                            <div className="bg-black/20 rounded p-2 my-2 overflow-x-auto">
                              <BlockMath math={eq.latex} />
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">{eq.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Novel Equations from comprehensive_model */}
                  {novelEquations.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" /> Novel / PhiCor Equations
                      </h5>
                      {novelEquations.map((eq, i) => (
                        <div 
                          key={i} 
                          className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{eq.name}</span>
                            <Badge className="text-[10px] bg-amber-500/20 text-amber-400">Novel</Badge>
                          </div>
                          {eq.latex && (
                            <div className="bg-black/20 rounded p-2 my-2 overflow-x-auto">
                              <BlockMath math={eq.latex} />
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">{eq.description}</p>
                          {eq.variables && (
                            <div className="mt-2 text-[10px] text-muted-foreground">
                              <span className="font-semibold">Variables: </span>
                              {Object.entries(eq.variables).map(([k, v], vi) => (
                                <span key={k}>{vi > 0 && ', '}{k}: {v}</span>
                              ))}
                            </div>
                          )}
                          {eq.evidence && (
                            <div className="mt-1 text-[10px] text-amber-400/70 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> {eq.evidence}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {equations.length === 0 && novelEquations.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No mathematical models available for this condition</p>
                  )}
                </div>
              )}

              {/* GENETICS TAB */}
              {activeTab === 'genetics' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Atom className="w-4 h-4 text-purple-400" />
                    Genetic & Hereditary Factors
                  </div>
                  
                  {geneticFactors ? (
                    <>
                      {/* Heritability & Penetrance */}
                      {(geneticFactors.heritability || geneticFactors.penetrance) && (
                        <div className="grid grid-cols-2 gap-3">
                          {geneticFactors.heritability && (
                            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                              <span className="text-[10px] text-purple-400 uppercase tracking-wider">Heritability</span>
                              <p className="text-lg font-bold text-purple-300 mt-1">{geneticFactors.heritability}</p>
                            </div>
                          )}
                          {geneticFactors.penetrance && (
                            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                              <span className="text-[10px] text-indigo-400 uppercase tracking-wider">Penetrance</span>
                              <p className="text-lg font-bold text-indigo-300 mt-1">{geneticFactors.penetrance}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Associated Genes */}
                      {geneticFactors.genes && geneticFactors.genes.length > 0 && (
                        <div className="p-3 rounded-lg bg-card/50 border border-border/50">
                          <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                            🧬 Associated Genes
                          </h5>
                          <div className="space-y-2">
                            {geneticFactors.genes.map((gene, i) => (
                              <div key={i} className="p-2 rounded bg-purple-500/5 border border-purple-500/20">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-medium text-sm text-purple-300">
                                    {typeof gene === 'string' ? gene : gene.name || gene.gene}
                                  </span>
                                  {gene.function && (
                                    <Badge variant="outline" className="text-[9px] border-purple-500/30 text-purple-400">
                                      {gene.function}
                                    </Badge>
                                  )}
                                </div>
                                {gene.role && (
                                  <p className="text-xs text-muted-foreground mt-1">{gene.role}</p>
                                )}
                                {gene.mutations && (
                                  <p className="text-[10px] text-orange-400 mt-1">
                                    Mutations: {Array.isArray(gene.mutations) ? gene.mutations.join(', ') : gene.mutations}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SNPs (Single Nucleotide Polymorphisms) */}
                      {geneticFactors.snps && geneticFactors.snps.length > 0 && (
                        <div className="p-3 rounded-lg bg-card/50 border border-border/50">
                          <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                            🔬 Risk SNPs
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {geneticFactors.snps.map((snp, i) => (
                              <Badge 
                                key={i} 
                                variant="outline" 
                                className="text-xs font-mono border-cyan-500/30 text-cyan-400"
                              >
                                {typeof snp === 'string' ? snp : snp.rsid || snp.id || snp.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Inheritance Pattern */}
                      {geneticFactors.inheritance && (
                        <div className="p-2 rounded bg-background/50">
                          <span className="text-[10px] text-muted-foreground">Inheritance Pattern: </span>
                          <span className="text-xs font-medium">{geneticFactors.inheritance}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No genetic data available for this condition</p>
                  )}
                </div>
              )}

              {/* KNOWLEDGE TAB */}
              {activeTab === 'knowledge' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Knowledge Bank Sources
                  </div>
                  
                  {loadingKnowledge ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 mx-auto animate-spin text-amber-400" />
                      <p className="text-sm text-muted-foreground mt-2">Loading knowledge sources...</p>
                    </div>
                  ) : knowledgeData && (knowledgeData.sources?.length > 0 || knowledgeData.approved_updates?.length > 0) ? (
                    <>
                      {/* Knowledge Sources */}
                      {knowledgeData.sources?.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs text-amber-400 uppercase tracking-wider">Reference Sources</h5>
                          {knowledgeData.sources.map((source, i) => (
                            <div 
                              key={i} 
                              className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-sm">{source.title}</span>
                                  <p className="text-xs text-muted-foreground mt-1">{source.description}</p>
                                </div>
                                <Badge variant="outline" className="text-[9px] shrink-0 border-amber-500/30 text-amber-400">
                                  {source.source_type}
                                </Badge>
                              </div>
                              {source.url && (
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:underline mt-2 inline-flex items-center gap-1"
                                >
                                  View Source <ChevronRight className="w-3 h-3" />
                                </a>
                              )}
                              {source.tags && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {source.tags.split(',').map((tag, ti) => (
                                    <Badge key={ti} variant="secondary" className="text-[9px]">
                                      {tag.trim()}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Approved Updates */}
                      {knowledgeData.approved_updates?.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <h5 className="text-xs text-green-400 uppercase tracking-wider flex items-center gap-1">
                            <Check className="w-3 h-3" /> Approved Updates
                          </h5>
                          {knowledgeData.approved_updates.map((update, i) => (
                            <div 
                              key={i} 
                              className="p-3 rounded-lg border bg-green-500/5 border-green-500/20"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{update.target}</span>
                                <Badge className="text-[9px] bg-green-500/20 text-green-400">
                                  {update.change_type}
                                </Badge>
                              </div>
                              {update.proposed_value && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Value: </span>
                                  <span className="text-green-400 font-medium">{update.proposed_value}</span>
                                  {update.unit && <span className="text-muted-foreground"> {update.unit}</span>}
                                </p>
                              )}
                              {update.reasoning && (
                                <p className="text-xs text-muted-foreground mt-1">{update.reasoning}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="text-sm">No knowledge sources available for this condition</p>
                      <p className="text-xs mt-1">Experts can upload guidelines and research via the Expert Dashboard</p>
                    </div>
                  )}
                </div>
              )}

              {/* Pathophysiology Section */}
              {pathophysiology.mechanism && (
                <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-border/50">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <Microscope className="w-3.5 h-3.5" /> Pathophysiology
                  </h4>
                  <p className="text-sm">{pathophysiology.mechanism}</p>
                  {pathophysiology.molecularBasis && (
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Molecular Basis:</strong> {pathophysiology.molecularBasis}
                    </p>
                  )}
                </div>
              )}

              {/* Severity Classification */}
              {disease.severity && (
                <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-border/50">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" /> Severity Classification
                  </h4>
                  <div className="grid gap-2">
                    {Object.entries(disease.severity).map(([level, data]) => (
                      <div key={level} className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${
                            level === 'mild' ? 'border-green-500/50 text-green-400' :
                            level === 'moderate' ? 'border-yellow-500/50 text-yellow-400' :
                            'border-red-500/50 text-red-400'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{data.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Disease Progression Timeline
const DiseaseProgressionTimeline = ({ disease, currentSeverity }) => {
  if (!disease?.progression) return null;

  const stages = disease.progression || [
    { stage: 1, name: "Early", description: "Initial changes", severity: 0.2 },
    { stage: 2, name: "Intermediate", description: "Progressive involvement", severity: 0.5 },
    { stage: 3, name: "Advanced", description: "Multi-organ effects", severity: 0.8 },
    { stage: 4, name: "Severe", description: "End-stage complications", severity: 1.0 }
  ];

  const currentStage = stages.findIndex(s => currentSeverity <= s.severity) + 1 || stages.length;

  return (
    <div className="mt-4 p-3 rounded-lg border border-border/50 bg-card/30">
      <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <Clock className="w-3 h-3" /> Disease Progression
      </h4>
      <div className="relative">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-border" />
        <div 
          className="absolute top-3 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentStage / stages.length) * 100}%` }}
        />
        <div className="relative flex justify-between">
          {stages.map((stage, i) => (
            <div key={i} className="flex flex-col items-center">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < currentStage 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stage.stage}
              </div>
              <span className="text-[10px] mt-1 text-center">{stage.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Organ Sidebar Component - Moved outside main component
const OrganSidebar = ({ 
  organs, 
  selectedOrgan, 
  onSelectOrgan, 
  currentDisease, 
  affectedCounts = {},
  onToggleTheme, 
  isDark, 
  isMobile = false 
}) => (
  <div className={`flex flex-col h-full ${isMobile ? '' : 'w-56 border-r border-border/50'}`}>
    {!isMobile && (
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
            <span className="text-xl font-serif text-indigo-400">Φ</span>
          </div>
          <div>
            <h1 className="font-bold text-sm bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">PhiCor.ai</h1>
            <p className="text-[10px] text-muted-foreground">Digital Physiology</p>
          </div>
        </div>
      </div>
    )}

    <div className="p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Organs</p>
    </div>

    <ScrollArea className="flex-1 px-2">
      {organs.map(([id, organ]) => {
        const isAffected = currentDisease?.affectedOrgans?.includes(id);
        const isPrimary = currentDisease?.primaryOrgan === id;
        const count = affectedCounts[id] || 0;
        
        return (
          <button
            key={id}
            onClick={() => onSelectOrgan(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
              selectedOrgan === id
                ? 'bg-primary/20 text-primary'
                : isAffected
                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
            }`}
            data-testid={`organ-${id}`}
          >
            <span className="text-xl">{organ.icon}</span>
            <span className="flex-1 text-left text-sm">{organ.name}</span>
            {/* Affected count badge */}
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  isPrimary 
                    ? 'bg-destructive text-destructive-foreground' 
                    : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                }`}
              >
                {count}
              </motion.span>
            )}
            {isPrimary && count === 0 && <span className="w-2 h-2 rounded-full bg-destructive" />}
            {isAffected && !isPrimary && count === 0 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
          </button>
        );
      })}
    </ScrollArea>

    <div className="p-3 border-t border-border/50 space-y-2">
      {/* Theme Toggle */}
      <button
        onClick={onToggleTheme}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-foreground transition-colors text-sm"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span>{isDark ? 'Light' : 'Dark'} Mode</span>
      </button>
    </div>
  </div>
);

// Disease Panel Component - Moved outside main component
const DiseasePanel = ({ 
  diseases, 
  selectedDisease, 
  onSelectDisease, 
  currentDisease,
  diseaseSeverity, 
  onChangeSeverity,
  showClinicalPanel,
  onToggleClinicalPanel,
  onReset,
  isMobile = false,
  isLoading = false
}) => {
  const [expandedCategory, setExpandedCategory] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);

  // Search across all diseases - matches name, ICD10, symptoms, signs, labs
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return diseases.filter(([id, disease]) => {
      // Search in disease name
      if (disease.name?.toLowerCase().includes(query)) return true;
      // Search in ICD10 code
      if (disease.icd10?.toLowerCase().includes(query)) return true;
      // Search in symptoms (safely check if array exists, handle object format)
      const symptoms = disease.clinicalPresentation?.symptoms;
      if (Array.isArray(symptoms) && symptoms.some(s => {
        const symptomText = typeof s === 'string' ? s : s?.name;
        return symptomText?.toLowerCase()?.includes(query);
      })) return true;
      // Search in signs (safely check if array exists, handle object format)
      const signs = disease.clinicalPresentation?.signs;
      if (Array.isArray(signs) && signs.some(s => {
        const signText = typeof s === 'string' ? s : s?.name;
        return signText?.toLowerCase()?.includes(query);
      })) return true;
      // Search in lab findings (safely check if array exists)
      const labs = disease.laboratoryFindings;
      if (Array.isArray(labs) && labs.some(l => l?.name?.toLowerCase()?.includes(query))) return true;
      // Search in definition
      if (disease.definition?.toLowerCase().includes(query)) return true;
      return false;
    }).slice(0, 10); // Limit to 10 results
  }, [searchQuery, diseases]);
  
  // Group diseases by category with better organization
  const groupedDiseases = React.useMemo(() => {
    const groups = {
      cardiac: {
        label: "Cardiac",
        icon: "❤️",
        subcategories: {
          ischemic: { label: "Ischemic/CAD", diseases: [] },
          cardiomyopathy: { label: "Cardiomyopathies", diseases: [] },
          valvular: { label: "Valvular", diseases: [] },
          arrhythmia: { label: "Arrhythmias", diseases: [] },
          heartFailure: { label: "Heart Failure", diseases: [] },
          hypertensive: { label: "Hypertensive", diseases: [] },
          rheumatic: { label: "Rheumatic", diseases: [] },
          pericardial: { label: "Pericardial", diseases: [] },
          other_cardiac: { label: "Other Cardiac", diseases: [] }
        }
      },
      metabolic: {
        label: "Metabolic",
        icon: "🔬",
        subcategories: {
          diabetes: { label: "Diabetes", diseases: [] },
          thyroid: { label: "Thyroid", diseases: [] },
          adrenal: { label: "Adrenal", diseases: [] },
          lipid: { label: "Lipid Disorders", diseases: [] },
          obesity: { label: "Obesity & Metabolic Syndrome", diseases: [] },
          bone: { label: "Bone Metabolism", diseases: [] },
          hepatic: { label: "Hepatic", diseases: [] },
          other_metabolic: { label: "Other", diseases: [] }
        }
      },
      other: {
        label: "Other Systems",
        icon: "🫁",
        subcategories: {
          respiratory: { label: "Respiratory", diseases: [] },
          renal: { label: "Renal/Urology", diseases: [] },
          neurological: { label: "Neurological", diseases: [] },
          hepatic: { label: "GI/Hepatic", diseases: [] },
          hematological: { label: "Hematological", diseases: [] },
          infectious: { label: "Infectious", diseases: [] },
          oncology: { label: "Oncology", diseases: [] },
          rheumatological: { label: "Rheumatology", diseases: [] },
          dermatological: { label: "Dermatology", diseases: [] },
          ophthalmology: { label: "Eye/ENT", diseases: [] },
          obstetrics: { label: "OB/GYN", diseases: [] },
          pediatric: { label: "Pediatric", diseases: [] },
          psychiatric: { label: "Psychiatric", diseases: [] },
          emergency: { label: "Emergency/Critical", diseases: [] },
          vascular: { label: "Vascular", diseases: [] },
          misc: { label: "Other", diseases: [] }
        }
      }
    };

    diseases.forEach(([id, disease]) => {
      const cat = (disease.category || 'other').toLowerCase();
      const name = disease.name?.toLowerCase() || '';
      const icd10 = disease.icd10?.toUpperCase() || '';
      
      // Cardiac/Cardiovascular subcategorization
      if (['cardiac', 'cardiovascular', 'ischemic', 'cardiomyopathy', 'valvular', 'arrhythmia', 
           'heartfailure', 'hypertensive', 'rheumatic', 'pericardial', 'pulmonary_vascular'].includes(cat) ||
           icd10.startsWith('I')) {
        let subcat;
        if (name.includes('cardiomyopathy') || cat === 'cardiomyopathy') {
          subcat = groups.cardiac.subcategories.cardiomyopathy;
        } else if (name.includes('arrhythmia') || name.includes('fibrillation') || name.includes('flutter') ||
                   name.includes('block') || name.includes('tachycardia') || name.includes('bradycardia') ||
                   cat === 'arrhythmia') {
          subcat = groups.cardiac.subcategories.arrhythmia;
        } else if (name.includes('hypertens') || cat === 'hypertensive') {
          subcat = groups.cardiac.subcategories.hypertensive;
        } else if (name.includes('heart failure') || name.includes('hfref') || name.includes('hfpef') ||
                   cat === 'heartfailure') {
          subcat = groups.cardiac.subcategories.heartFailure;
        } else if (name.includes('infarct') || name.includes('ischemic') || name.includes('angina') ||
                   name.includes('coronary') || name.includes('stemi') || name.includes('nstemi') ||
                   cat === 'ischemic') {
          subcat = groups.cardiac.subcategories.ischemic;
        } else if (name.includes('valv') || name.includes('stenosis') || name.includes('regurgitation') ||
                   cat === 'valvular') {
          subcat = groups.cardiac.subcategories.valvular;
        } else if (name.includes('pericardi') || cat === 'pericardial') {
          subcat = groups.cardiac.subcategories.pericardial;
        } else {
          subcat = groups.cardiac.subcategories.other_cardiac;
        }
        subcat.diseases.push([id, disease]);
      }
      // Metabolic/Endocrine
      else if (['metabolic', 'endocrine', 'diabetes'].includes(cat) ||
               icd10.startsWith('E')) {
        let subcat;
        if (name.includes('diabetes') || name.includes('dka') || name.includes('ketoacidosis') ||
            name.includes('hyperglyc') || name.includes('hypoglyc') ||
            icd10.startsWith('E10') || icd10.startsWith('E11') || icd10.startsWith('E13')) {
          subcat = groups.metabolic.subcategories.diabetes;
        } else if (name.includes('thyroid') || name.includes('hyperthyroid') || name.includes('hypothyroid') ||
                   name.includes('graves') || name.includes('hashimoto') || name.includes('thyrotoxic') ||
                   icd10.startsWith('E03') || icd10.startsWith('E05') || icd10.startsWith('E06')) {
          subcat = groups.metabolic.subcategories.thyroid;
        } else if (name.includes('adrenal') || name.includes('cushing') || name.includes('addison') ||
                   name.includes('pheochromocytoma') || name.includes('aldosterone') ||
                   icd10.startsWith('E24') || icd10.startsWith('E27')) {
          subcat = groups.metabolic.subcategories.adrenal;
        } else if (name.includes('cholesterol') || name.includes('hyperlipid') || name.includes('triglyceride') ||
                   icd10.startsWith('E78')) {
          subcat = groups.metabolic.subcategories.lipid;
        } else if (name.includes('obesity') || name.includes('metabolic syndrome') ||
                   icd10.startsWith('E66') || icd10.startsWith('E88')) {
          subcat = groups.metabolic.subcategories.obesity;
        } else {
          subcat = groups.metabolic.subcategories.other_metabolic;
        }
        subcat.diseases.push([id, disease]);
      }
      // Respiratory
      else if (cat === 'respiratory' || cat === 'pulmonary' || icd10.startsWith('J')) {
        groups.other.subcategories.respiratory.diseases.push([id, disease]);
      }
      // Renal/Urology
      else if (['renal', 'nephrology', 'urology'].includes(cat) || icd10.startsWith('N')) {
        groups.other.subcategories.renal.diseases.push([id, disease]);
      }
      // Neurological
      else if (cat === 'neurological' || icd10.startsWith('G')) {
        groups.other.subcategories.neurological.diseases.push([id, disease]);
      }
      // Gastrointestinal/Hepatic
      else if (['hepatic', 'gastrointestinal', 'gi'].includes(cat) || icd10.startsWith('K')) {
        groups.other.subcategories.hepatic.diseases.push([id, disease]);
      }
      // Hematological
      else if (['hematological', 'hematological_malignancy'].includes(cat) || icd10.startsWith('D')) {
        groups.other.subcategories.hematological.diseases.push([id, disease]);
      }
      // Infectious
      else if (cat === 'infectious' || icd10.startsWith('A') || icd10.startsWith('B')) {
        groups.other.subcategories.infectious.diseases.push([id, disease]);
      }
      // Oncology
      else if (['oncology', 'oncological'].includes(cat) || icd10.startsWith('C')) {
        groups.other.subcategories.oncology.diseases.push([id, disease]);
      }
      // Rheumatological/Musculoskeletal/Autoimmune
      else if (['rheumatological', 'musculoskeletal', 'autoimmune'].includes(cat) || icd10.startsWith('M')) {
        groups.other.subcategories.rheumatological.diseases.push([id, disease]);
      }
      // Dermatological
      else if (['dermatological', 'dermatology'].includes(cat) || icd10.startsWith('L')) {
        groups.other.subcategories.dermatological.diseases.push([id, disease]);
      }
      // Ophthalmology/ENT
      else if (['ophthalmology', 'otolaryngology', 'ent'].includes(cat) || icd10.startsWith('H')) {
        groups.other.subcategories.ophthalmology.diseases.push([id, disease]);
      }
      // Obstetrics/Gynecology
      else if (['obstetrics', 'gynecology', 'obgyn', 'neonatology'].includes(cat) || 
               icd10.startsWith('O') || icd10.startsWith('P')) {
        groups.other.subcategories.obstetrics.diseases.push([id, disease]);
      }
      // Pediatric/Congenital/Genetic
      else if (['pediatric', 'congenital', 'genetic', 'geriatric'].includes(cat) || icd10.startsWith('Q')) {
        groups.other.subcategories.pediatric.diseases.push([id, disease]);
      }
      // Psychiatric
      else if (cat === 'psychiatric' || icd10.startsWith('F')) {
        groups.other.subcategories.psychiatric.diseases.push([id, disease]);
      }
      // Emergency/Critical
      else if (['emergency', 'acute', 'critical'].includes(cat) || 
               icd10.startsWith('R') || icd10.startsWith('T') || icd10.startsWith('S')) {
        groups.other.subcategories.emergency.diseases.push([id, disease]);
      }
      // Vascular
      else if (['vascular', 'cerebrovascular'].includes(cat)) {
        groups.other.subcategories.vascular.diseases.push([id, disease]);
      }
      // Misc/Other
      else {
        groups.other.subcategories.misc.diseases.push([id, disease]);
      }
    });

    return groups;
  }, [diseases]);

  // Count diseases in each main category
  const getCategoryCount = (group) => {
    return Object.values(group.subcategories).reduce((sum, sub) => sum + sub.diseases.length, 0);
  };

  // Highlight matching text in search results
  const highlightMatch = (text, query) => {
    if (!query.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className={`flex flex-col ${isMobile ? 'h-[calc(100vh-2rem)] pt-10' : 'h-full w-80 border-l border-border/50'}`}>
      {/* Header with Search */}
      <div className="p-3 border-b border-border/50 shrink-0 space-y-2 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Find Condition
          </h3>
          <Badge variant="outline" className="text-[10px]">
            {isLoading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </span>
            ) : (
              `${diseases.length} diseases`
            )}
          </Badge>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, ICD-10, symptom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm bg-accent/10 border-border/50"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent/20 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchQuery && searchResults.length > 0 && (
          <div className="absolute left-3 right-3 top-[calc(100%-4px)] bg-card border border-border rounded-lg shadow-xl z-[100] max-h-64 overflow-y-auto">
            <div className="p-2 text-xs text-muted-foreground border-b border-border/50 sticky top-0 bg-card">
              {searchResults.length} results for &quot;{searchQuery}&quot;
            </div>
            {searchResults.map(([id, disease]) => (
              <button
                key={id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectDisease(id);
                  setSearchQuery('');
                }}
                className="w-full text-left p-3 hover:bg-accent/20 border-b border-border/50 last:border-0 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {highlightMatch(disease.name, searchQuery)}
                  </span>
                  {disease.icd10 && (
                    <Badge variant="outline" className="text-[9px] shrink-0">
                      {disease.icd10}
                    </Badge>
                  )}
                </div>
                {Array.isArray(disease.clinicalPresentation?.symptoms) && 
                 disease.clinicalPresentation.symptoms.slice(0, 2).some(s => {
                   const symptomText = typeof s === 'string' ? s : s?.name;
                   return symptomText?.toLowerCase()?.includes(searchQuery.toLowerCase());
                 }
                ) && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Symptoms: {disease.clinicalPresentation.symptoms.slice(0, 2).map((s, i) => {
                      const symptomText = typeof s === 'string' ? s : s?.name;
                      return (
                        <span key={i}>{i > 0 && ', '}{highlightMatch(symptomText || '', searchQuery)}</span>
                      );
                    })}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-2">
            No conditions found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Category Tabs - Only show when not searching */}
      {!searchQuery && (
        <Tabs defaultValue="cardiac" className="flex-1 flex flex-col min-h-0">
          <div className="mx-3 mt-3 overflow-x-auto scrollbar-hide">
            <TabsList className="bg-accent/10 inline-flex w-auto min-w-full gap-1">
              <TabsTrigger value="cardiac" className="text-[10px] px-2 py-1.5 whitespace-nowrap">
                ❤️ <span className="hidden sm:inline">Cardiac</span>
              </TabsTrigger>
              <TabsTrigger value="respiratory" className="text-[10px] px-2 py-1.5 whitespace-nowrap">
                🫁 <span className="hidden sm:inline">Resp</span>
              </TabsTrigger>
              <TabsTrigger value="metabolic" className="text-[10px] px-2 py-1.5 whitespace-nowrap">
                🔬 <span className="hidden sm:inline">Meta</span>
              </TabsTrigger>
              <TabsTrigger value="neuro" className="text-[10px] px-2 py-1.5 whitespace-nowrap">
                🧠 <span className="hidden sm:inline">Neuro</span>
              </TabsTrigger>
              <TabsTrigger value="other" className="text-[10px] px-2 py-1.5 whitespace-nowrap">
                🔄 <span className="hidden sm:inline">Other</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-3 min-h-0">
            {/* Cardiac Tab Content */}
            <TabsContent value="cardiac" className="mt-0 data-[state=active]:block">
              <div className="space-y-3 pb-4">
                {Object.entries(groupedDiseases.cardiac.subcategories)
                  .filter(([_, subcat]) => subcat.diseases.length > 0)
                  .map(([subcatKey, subcat]) => (
                    <div key={subcatKey} className="space-y-1">
                      <button 
                        onClick={() => setExpandedCategory(expandedCategory === subcatKey ? null : subcatKey)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>{subcat.label}</span>
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {subcat.diseases.length}
                          </Badge>
                          {expandedCategory === subcatKey ? 
                            <ChevronDown className="w-3 h-3" /> : 
                            <ChevronRight className="w-3 h-3" />
                          }
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {(expandedCategory === subcatKey || subcat.diseases.length <= 3) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            {subcat.diseases.map(([id, disease]) => (
                              <button
                                key={id}
                                onClick={() => onSelectDisease(selectedDisease === id ? null : id)}
                                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                                  selectedDisease === id
                                    ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                    : 'bg-accent/5 hover:bg-accent/10 text-muted-foreground'
                                }`}
                                data-testid={`disease-${id}`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm truncate">{disease.name}</span>
                                  {disease.icd10 && (
                                    <Badge variant="outline" className="text-[9px] px-1 shrink-0">
                                      {disease.icd10}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px] opacity-60">
                                  <span>Affects: {disease.affectedOrgans?.length || 1} organ{disease.affectedOrgans?.length !== 1 ? 's' : ''}</span>
                                  {disease.isFromCardiacDB && (
                                    <Badge variant="secondary" className="text-[8px] px-1 bg-purple-500/10 text-purple-400">
                                      ICD-10
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            </TabsContent>

            {/* Respiratory Tab Content with Lung Cancer Feature */}
            <TabsContent value="respiratory" className="mt-0 data-[state=active]:block">
              <div className="space-y-3 pb-4">
                {/* Lung Cancer Special Section */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30">
                  <button 
                    onClick={() => onSelectDisease('lung_cancer_module')}
                    className={`w-full text-left ${selectedDisease === 'lung_cancer_module' ? 'opacity-100' : 'opacity-90'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🎯</span>
                      <span className="font-bold text-red-400">Lung Cancer Module</span>
                      <Badge className="bg-red-500/20 text-red-300 text-[9px]">NEW</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      TNM 8th Edition • NCCN 2024-2025 • MDT Decision Support
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-[9px]">Staging</Badge>
                      <Badge variant="outline" className="text-[9px]">Immunotherapy</Badge>
                      <Badge variant="outline" className="text-[9px]">Biomarkers</Badge>
                      <Badge variant="outline" className="text-[9px]">Surgery</Badge>
                    </div>
                  </button>
                </div>

                {/* Other Respiratory Diseases */}
                {Object.entries(groupedDiseases.other.subcategories)
                  .filter(([key, subcat]) => key === 'respiratory' && subcat.diseases.length > 0)
                  .map(([subcatKey, subcat]) => (
                    <div key={subcatKey} className="space-y-1">
                      <button 
                        onClick={() => setExpandedCategory(expandedCategory === 'resp_other' ? null : 'resp_other')}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>Other Respiratory Conditions</span>
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {subcat.diseases.length}
                          </Badge>
                          {expandedCategory === 'resp_other' ? 
                            <ChevronDown className="w-3 h-3" /> : 
                            <ChevronRight className="w-3 h-3" />
                          }
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {expandedCategory === 'resp_other' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            {subcat.diseases.map(([id, disease]) => (
                              <button
                                key={id}
                                onClick={() => onSelectDisease(selectedDisease === id ? null : id)}
                                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                                  selectedDisease === id
                                    ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                    : 'bg-accent/5 hover:bg-accent/10 text-muted-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm truncate">{disease.name}</span>
                                  {disease.icd10 && (
                                    <Badge variant="outline" className="text-[9px] px-1 shrink-0">
                                      {disease.icd10}
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            </TabsContent>

            {/* Metabolic Tab Content */}
            <TabsContent value="metabolic" className="mt-0 data-[state=active]:block">
              <div className="space-y-3 pb-4">
                {Object.entries(groupedDiseases.metabolic.subcategories)
                  .filter(([_, subcat]) => subcat.diseases.length > 0)
                  .map(([subcatKey, subcat]) => (
                    <div key={subcatKey} className="space-y-1">
                      <button 
                        onClick={() => setExpandedCategory(expandedCategory === subcatKey ? null : subcatKey)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>{subcat.label}</span>
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {subcat.diseases.length}
                          </Badge>
                          {expandedCategory === subcatKey ? 
                            <ChevronDown className="w-3 h-3" /> : 
                            <ChevronRight className="w-3 h-3" />
                          }
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {(expandedCategory === subcatKey || subcat.diseases.length <= 3) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            {subcat.diseases.map(([id, disease]) => (
                              <button
                                key={id}
                                onClick={() => onSelectDisease(selectedDisease === id ? null : id)}
                                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                                  selectedDisease === id
                                    ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                    : 'bg-accent/5 hover:bg-accent/10 text-muted-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm truncate">{disease.name}</span>
                                  {disease.icd10 && (
                                    <Badge variant="outline" className="text-[9px] px-1 shrink-0">
                                      {disease.icd10}
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            </TabsContent>

            {/* Neuro/Brain Tab Content */}
            <TabsContent value="neuro" className="mt-0 data-[state=active]:block">
              <div className="space-y-3 pb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🧠</span>
                    <span className="font-bold text-purple-400">Neurological Conditions</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Brain, nervous system, and cerebrovascular conditions
                  </p>
                </div>
                {Object.entries(groupedDiseases.other.subcategories)
                  .filter(([key, _]) => key === 'cerebrovascular')
                  .map(([subcatKey, subcat]) => (
                    <div key={subcatKey} className="space-y-1">
                      <button 
                        onClick={() => setExpandedCategory(expandedCategory === subcatKey ? null : subcatKey)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>{subcat.label}</span>
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {subcat.diseases.length}
                          </Badge>
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {subcat.diseases.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            {subcat.diseases.map(([id, disease]) => (
                              <button
                                key={id}
                                onClick={() => onSelectDisease(selectedDisease === id ? null : id)}
                                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                                  selectedDisease === id
                                    ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                    : 'bg-accent/5 hover:bg-accent/10 text-muted-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm truncate">{disease.name}</span>
                                  {disease.icd10 && (
                                    <Badge variant="outline" className="text-[9px] px-1 shrink-0">
                                      {disease.icd10}
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            </TabsContent>

            {/* Other Systems Tab Content */}
            <TabsContent value="other" className="mt-0 data-[state=active]:block">
              <div className="space-y-3 pb-4">
                {Object.entries(groupedDiseases.other.subcategories)
                  .filter(([key, subcat]) => !['respiratory', 'cerebrovascular'].includes(key) && subcat.diseases.length > 0)
                  .map(([subcatKey, subcat]) => (
                    <div key={subcatKey} className="space-y-1">
                      <button 
                        onClick={() => setExpandedCategory(expandedCategory === subcatKey ? null : subcatKey)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>{subcat.label}</span>
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {subcat.diseases.length}
                          </Badge>
                          {expandedCategory === subcatKey ? 
                            <ChevronDown className="w-3 h-3" /> : 
                            <ChevronRight className="w-3 h-3" />
                          }
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {(expandedCategory === subcatKey || subcat.diseases.length <= 3) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            {subcat.diseases.map(([id, disease]) => (
                              <button
                                key={id}
                                onClick={() => onSelectDisease(selectedDisease === id ? null : id)}
                                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                                  selectedDisease === id
                                    ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                    : 'bg-accent/5 hover:bg-accent/10 text-muted-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm truncate">{disease.name}</span>
                                  {disease.icd10 && (
                                    <Badge variant="outline" className="text-[9px] px-1 shrink-0">
                                      {disease.icd10}
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      )}

      {/* Severity Slider */}
      {selectedDisease !== null && selectedDisease !== undefined && currentDisease && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Severity</span>
            <span className="text-xs font-mono">
              {currentDisease?.severity?.[
                diseaseSeverity < 0.33 ? 'mild' : diseaseSeverity < 0.66 ? 'moderate' : 'severe'
              ]?.description || `${(diseaseSeverity * 100).toFixed(0)}%`}
            </span>
          </div>
          <Slider
            value={[diseaseSeverity]}
            onValueChange={([v]) => onChangeSeverity(v)}
            min={0.1}
            max={1.0}
            step={0.1}
            className="w-full"
            data-testid="severity-slider"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Severe</span>
          </div>

          <DiseaseProgressionTimeline disease={currentDisease} currentSeverity={diseaseSeverity} />
        </div>
      )}

    {/* Clinical Panel Toggle */}
    {currentDisease && (
      <div className="p-4 border-t border-border/50">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onToggleClinicalPanel}
        >
          <Stethoscope className="w-4 h-4 mr-2" />
          {showClinicalPanel ? 'Hide' : 'Show'} Clinical Panel
        </Button>
      </div>
    )}

    {/* Clinical Insights */}
    {showClinicalPanel && currentDisease && (
      <div className="p-4 border-t border-border/50 max-h-96 overflow-y-auto">
        <ClinicalInsightsPanel 
          disease={currentDisease} 
          severity={diseaseSeverity}
        />
      </div>
    )}

    {/* Disease Summary */}
    {currentDisease && (
      <div className="p-4 border-t border-border/50 bg-destructive/5">
        <h4 className="text-xs font-semibold text-destructive mb-2">Active Condition</h4>
        <p className="text-sm font-medium">{currentDisease.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{currentDisease.description}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {currentDisease.affectedOrgans?.map(org => (
            <Badge key={org} variant="outline" className="text-[10px]">
              {ORGAN_MODELS[org]?.icon} {ORGAN_MODELS[org]?.name}
            </Badge>
          ))}
        </div>
        
        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 border-destructive/50 text-destructive hover:bg-destructive/10"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Healthy Model
        </Button>
      </div>
    )}
  </div>
  );
};

// Main Dashboard Component
const DashboardMultiScale = () => {
  const { toggleTheme, isDark } = useTheme();
  const tutorial = useTutorial('dashboard');
  
  const [selectedOrgan, setSelectedOrgan] = useState('heart');
  const [selectedScale, setSelectedScale] = useState('geometry');
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [diseaseSeverity, setDiseaseSeverity] = useState(0.5);
  const [expandedEquations, setExpandedEquations] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showClinicalPanel, setShowClinicalPanel] = useState(false);
  const [paramFilterOrgan, setParamFilterOrgan] = useState(null); // Filter affected params by organ
  const [showAllParams, setShowAllParams] = useState(true); // Start OPEN by default
  const [apiDiseaseData, setApiDiseaseData] = useState({}); // Store parameter_modifications from API
  const [apiDiseaseByIcd, setApiDiseaseByIcd] = useState({}); // Also map by ICD-10 code
  const [apiDiseases, setApiDiseases] = useState({}); // Full disease data from API
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(true); // Loading state for initial fetch
  
  // Ref for scrolling to parameters section
  const parametersRef = useRef(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false); // Left panel collapsed by default

  // Helper function to determine primary organ from category - defined early for use in useEffect
  const getPrimaryOrganFromCategory = useCallback((category) => {
    const categoryOrganMap = {
      'cardiovascular': 'heart',
      'cardiac': 'heart',
      'respiratory': 'lungs',
      'pulmonary': 'lungs',
      'renal': 'kidneys',
      'nephrology': 'kidneys',
      'hepatic': 'liver',
      'gastrointestinal': 'liver',
      'neurological': 'brain',
      'psychiatric': 'brain',
      'hematological': 'blood',
      'hematological_malignancy': 'blood',
      'oncology': 'blood',
      'endocrine': 'pancreas',
      'metabolic': 'pancreas',
      'infectious': 'blood',
      'rheumatological': 'blood',
      'dermatological': 'blood',
      'ophthalmology': 'brain',
      'otolaryngology': 'brain',
      'obstetrics': 'blood',
      'gynecology': 'blood',
      'neonatology': 'lungs',
      'urology': 'kidneys',
      'musculoskeletal': 'blood',
      'emergency': 'heart',
      'pediatric': 'heart',
      'geriatric': 'heart'
    };
    return categoryOrganMap[category?.toLowerCase()] || 'heart';
  }, []);

  // Fetch disease parameter_modifications from API
  useEffect(() => {
    const fetchDiseaseParams = async () => {
      setIsLoadingDiseases(true);
      
      // Check for pre-loaded cache from landing page first (in-memory via window)
      const cache = window.__PHICOR_DISEASES_CACHE__;
      if (cache && cache.diseases?.length > 0 && Date.now() - cache.timestamp < 10 * 60 * 1000) {
        console.log(`✅ Using pre-loaded cache: ${cache.diseases.length} diseases (instant load)`);
        processDiseaseData(cache.diseases);
        setIsLoadingDiseases(false);
        return;
      }
      
      // OPTIMIZATION: First fetch lightweight list for fast initial display
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        
        // Step 1: Fast load - get just names/IDs for disease selector
        const listResponse = await fetch(`${backendUrl}/api/diseases-db/list`);
        if (listResponse.ok) {
          const listData = await listResponse.json();
          // Create a lightweight map for the disease selector
          const lightweightMap = {};
          (listData.diseases || []).forEach(d => {
            const diseaseKey = d.id || d.icd10_code?.replace('.', '_');
            if (diseaseKey) {
              lightweightMap[diseaseKey] = {
                id: d.id,
                name: d.name,
                icd10: d.icd10_code,
                category: d.category,
                description: d.description,
                affectedOrgans: d.affected_organs || [],
                primaryOrgan: getPrimaryOrganFromCategory(d.category),
                isLightweight: true // Flag to know we need to fetch full data
              };
            }
          });
          setApiDiseases(lightweightMap);
          setIsLoadingDiseases(false);
          console.log(`⚡ Fast loaded ${Object.keys(lightweightMap).length} diseases (lightweight)`);
        }
        
        // Step 2: Background load - fetch full data for caching
        const fullResponse = await fetch(`${backendUrl}/api/diseases-db?include_params=true&limit=2500`);
        if (fullResponse.ok) {
          const data = await fullResponse.json();
          processDiseaseData(data.diseases || []);
          // Store in window cache for future use
          window.__PHICOR_DISEASES_CACHE__ = {
            timestamp: Date.now(),
            diseases: data.diseases || []
          };
          console.log(`✅ Full data loaded in background: ${data.diseases?.length} diseases`);
        }
      } catch (error) {
        console.error('Error fetching diseases:', error);
      }
      
      setIsLoadingDiseases(false);
    };
    
    // Process disease data helper function
    const processDiseaseData = (diseasesArray) => {
      // Map diseases by their ID with their parameter_modifications
      const diseaseMap = {};
      const icdMap = {};
      const fullDiseaseMap = {};
      (diseasesArray || []).forEach(disease => {
        // Store full disease data for dynamic rendering
        const diseaseKey = disease.id || disease.icd10_code?.replace('.', '_');
        if (diseaseKey) {
          fullDiseaseMap[diseaseKey] = {
            // Spread all original disease data first
            ...disease,
            // Then add/override specific fields
            name: disease.name,
            icd10: disease.icd10_code,
            category: disease.category || 'general',
            description: disease.definition || disease.description || disease.name,
            definition: disease.definition,
            primaryOrgan: disease.primaryOrgan || disease.comprehensive_model?.primaryOrgan || getPrimaryOrganFromCategory(disease.category),
            affectedOrgans: disease.affected_organs || disease.affectedOrgans || disease.comprehensive_model?.affectedOrgans || [getPrimaryOrganFromCategory(disease.category)],
            modifications: disease.parameter_modifications || disease.comprehensive_model?.modifications || {},
            hasModifications: disease.parameter_modifications && Object.keys(disease.parameter_modifications).length > 0,
            isFromAPI: true,
            // Clinical presentation - check multiple sources
            clinical_presentation: disease.clinical_presentation || {},
            clinicalPresentation: disease.clinical_presentation || disease.clinicalPresentation || disease.comprehensive_model?.clinicalPresentation || {},
            clinical_features: disease.clinical_features || {},
            // Treatment data
            treatment: disease.treatment || disease.comprehensive_model?.treatment || {},
            // Prognosis
            prognosis: disease.prognosis || disease.comprehensive_model?.prognosis || '',
            pathophysiology: disease.pathophysiology || '',
            // Lab and imaging findings
            laboratory_findings: disease.laboratory_findings || [],
            imaging_findings: disease.imaging_findings || {},
            physical_examination: disease.physical_examination || {},
            diagnostic_criteria: disease.diagnostic_criteria || {},
            // Comprehensive model and its key sub-fields
            comprehensive_model: disease.comprehensive_model || {},
            // Extract key fields from comprehensive_model for easy access
            geneticFactors: disease.comprehensive_model?.geneticFactors || disease.geneticFactors || null,
            novelEquations: disease.comprehensive_model?.novelEquations || disease.novelEquations || [],
            progression: disease.comprehensive_model?.progression || disease.progression || disease.nyha_classification || [],
            // Epidemiology and other metadata
            epidemiology: disease.epidemiology || {},
            synonyms: disease.synonyms || [],
            guideline_source: disease.guideline_source || '',
            // Severity tracking
            severity: disease.severity || disease.comprehensive_model?.severity || {},
            // Mathematical models
            mathematical_models_disease: disease.mathematical_models_disease || [],
            has_equations: disease.has_equations || false,
            has_genetics: disease.has_genetics || false,
            has_progression: disease.has_progression || false
          };
        }
        
        if (disease.parameter_modifications && Object.keys(disease.parameter_modifications).length > 0) {
          diseaseMap[disease.id] = disease.parameter_modifications;
          // Also map by ICD-10 code (convert to UI format: D56.1 -> D56_1)
          if (disease.icd10_code) {
            const icdKey = disease.icd10_code.replace('.', '_');
            icdMap[icdKey] = disease.parameter_modifications;
          }
        }
      });
      
      setApiDiseaseData(diseaseMap);
      setApiDiseaseByIcd(icdMap);
      setApiDiseases(fullDiseaseMap);
      console.log(`Loaded ${Object.keys(fullDiseaseMap).length} diseases, ${Object.keys(diseaseMap).length} with parameter_modifications`);
    };
    
    fetchDiseaseParams();
  }, [getPrimaryOrganFromCategory]);

  const organs = useMemo(() => Object.entries(ORGAN_MODELS), []);
  
  // All diseases now come from the API (single source of truth from MongoDB)
  const diseases = useMemo(() => {
    return Object.entries(apiDiseases);
  }, [apiDiseases]);
  
  const currentOrgan = ORGAN_MODELS[selectedOrgan];
  const currentScale = currentOrgan?.[selectedScale];
  
  // Look up disease from BOTH static DISEASE_MODELS and API data
  // Static DISEASE_MODELS have comprehensive modifications, API has clinical data
  const currentDisease = useMemo(() => {
    if (!selectedDisease) return null;
    
    // First check static DISEASE_MODELS for comprehensive modifications
    const staticDisease = DISEASE_MODELS[selectedDisease];
    const apiDisease = apiDiseases[selectedDisease];
    
    if (staticDisease && apiDisease) {
      // Merge both - static has the modifications, API has updated info
      return {
        ...staticDisease,
        ...apiDisease,
        // Ensure static modifications are preserved!
        modifications: staticDisease.modifications || apiDisease.modifications
      };
    }
    
    return staticDisease || apiDisease || null;
  }, [selectedDisease, apiDiseases]);

  // Auto-select first available scale when organ changes
  useEffect(() => {
    if (currentOrgan) {
      // Find the first scale that has data for this organ
      const availableScale = SCALE_LEVELS.find(scale => currentOrgan[scale.id]);
      if (availableScale && !currentOrgan[selectedScale]) {
        // Use setTimeout to avoid synchronous setState warning
        setTimeout(() => setSelectedScale(availableScale.id), 0);
      }
    }
  }, [selectedOrgan, currentOrgan, selectedScale]);

  // Get merged modifications: combine static DISEASE_MODELS with API parameter_modifications
  // Priority: Static DISEASE_MODELS have comprehensive multipliers, API adds clinical data
  const getMergedModifications = useCallback(() => {
    if (!selectedDisease) return null;
    
    // Find the DISEASE_MODELS key for this disease
    const diseaseModelKey = getDiseaseModelKey(selectedDisease);
    
    // Check for static disease modifications from DISEASE_MODELS first
    // These have comprehensive parameter multipliers for all organs
    const staticDisease = diseaseModelKey ? DISEASE_MODELS[diseaseModelKey] : null;
    const staticMods = staticDisease?.modifications || currentDisease?.modifications;
    
    // Check if we have API data for this disease (try by ID first, then by ICD-10 code)
    const apiMods = apiDiseaseData[selectedDisease] || apiDiseaseByIcd[selectedDisease];
    
    // Start with static mods as base - these have the comprehensive multipliers!
    const merged = staticMods ? JSON.parse(JSON.stringify(staticMods)) : {};
    
    if (apiMods) {
      // Process API mods and ADD to the merged modifications
      // API data adds clinical findings but static mods have the main multipliers
      Object.entries(apiMods).forEach(([organId, organMods]) => {
        if (!merged[organId]) merged[organId] = {};
        
        if (typeof organMods === 'object' && organMods !== null) {
          Object.entries(organMods).forEach(([apiScaleId, scaleMods]) => {
            // Map API scale to ORGAN_MODELS scale
            const targetScaleId = SCALE_MAPPING[apiScaleId] || apiScaleId;
            
            // Initialize scales if not present
            if (!merged[organId][apiScaleId]) merged[organId][apiScaleId] = {};
            if (!merged[organId][targetScaleId]) merged[organId][targetScaleId] = {};
            
            if (typeof scaleMods === 'object' && scaleMods !== null) {
              Object.entries(scaleMods).forEach(([apiParamId, paramMod]) => {
                // Only add if not already present from static mods
                // Static mods take priority for main parameters
                if (!merged[organId][apiScaleId][apiParamId]) {
                  merged[organId][apiScaleId][apiParamId] = paramMod;
                }
                
                // Also map to ORGAN_MODELS param ID if mapping exists
                const organParamId = API_TO_ORGAN_PARAM[apiParamId] || apiParamId;
                if (!merged[organId][targetScaleId][organParamId]) {
                  merged[organId][targetScaleId][organParamId] = paramMod;
                }
              });
            }
          });
        }
      });
    }
    
    return Object.keys(merged).length > 0 ? merged : null;
  }, [selectedDisease, apiDiseaseData, apiDiseaseByIcd, currentDisease]);

  const mergedModifications = useMemo(() => getMergedModifications(), [getMergedModifications]);

  // Calculate affected parameters count for each organ
  // Handles both ORGAN_MODELS structure and API clinical data structure
  const getAffectedCounts = useCallback(() => {
    if (!mergedModifications) return {};
    
    const counts = {};
    const mods = mergedModifications;
    
    Object.entries(mods).forEach(([organId, organMods]) => {
      let count = 0;
      if (typeof organMods === 'object' && organMods !== null) {
        Object.entries(organMods).forEach(([scaleId, scaleMods]) => {
          if (typeof scaleMods === 'object' && scaleMods !== null) {
            // Count all parameters that have meaningful modifications
            Object.entries(scaleMods).forEach(([paramId, mod]) => {
              if (mod && typeof mod === 'object') {
                // Count if it has change_percent, value, direction, factor, or multiplier
                if (mod.change_percent !== undefined || 
                    mod.value !== undefined || 
                    mod.factor !== undefined ||
                    mod.multiplier !== undefined ||
                    (mod.direction && mod.direction !== 'normal')) {
                  count++;
                }
              }
            });
          }
        });
      }
      if (count > 0) {
        counts[organId] = count;
      }
    });
    
    return counts;
  }, [mergedModifications]);

  const affectedCounts = useMemo(() => getAffectedCounts(), [getAffectedCounts]);

  // Calculate total affected count for an organ
  const getOrganAffectedCount = useCallback((organId) => {
    return affectedCounts[organId] || 0;
  }, [affectedCounts]);

  // Get all affected organs with their counts for summary tabs
  const affectedOrgansSummary = useMemo(() => {
    if (!currentDisease) return [];
    
    const summary = [];
    Object.entries(ORGAN_MODELS).forEach(([id, organ]) => {
      const count = affectedCounts[id] || 0;
      const isPrimary = currentDisease?.primaryOrgan === id;
      const isAffected = currentDisease?.affectedOrgans?.includes(id);
      
      if (count > 0 || isAffected) {
        summary.push({
          id,
          name: organ.name,
          icon: organ.icon,
          count,
          isPrimary,
          isAffected
        });
      }
    });
    
    // Sort: primary first, then by count
    return summary.sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return b.count - a.count;
    });
  }, [currentDisease, affectedCounts]);

  // Get ALL modified parameters across ALL organs - for quick summary view
  // Handles both ORGAN_MODELS structure and API clinical data structure
  const allModifiedParameters = useMemo(() => {
    if (!mergedModifications) return [];
    
    const params = [];
    
    // Helper to format parameter name from snake_case
    const formatParamName = (id) => {
      return id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    // Helper to get organ display info
    const getOrganInfo = (organId) => {
      const organ = ORGAN_MODELS[organId];
      if (organ) return { name: organ.name, icon: organ.icon };
      // Fallback for organs not in ORGAN_MODELS
      const fallbackIcons = {
        cellular: '🔬', immune_system: '🛡️', tumor_site: '🎯', gi_tract: '🫃',
        bone_marrow: '🦴', joints: '🦴', pancreas: '🔹', systemic: '⚕️'
      };
      return { 
        name: organId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        icon: fallbackIcons[organId] || '📊'
      };
    };
    
    Object.entries(mergedModifications).forEach(([organId, organMods]) => {
      const organ = ORGAN_MODELS[organId];
      const organInfo = getOrganInfo(organId);
      
      Object.entries(organMods).forEach(([scaleId, scaleMods]) => {
        if (!scaleMods || typeof scaleMods !== 'object') return;
        
        // Try to get scale data from ORGAN_MODELS first
        const scaleData = organ?.[scaleId];
        
        Object.entries(scaleMods).forEach(([paramId, mod]) => {
          if (!mod || typeof mod !== 'object') return;
          
          // Skip if direction is 'normal' and no meaningful modification data
          if (mod.direction === 'normal' && !mod.change_percent && !mod.value && !mod.factor && !mod.multiplier) return;
          
          // Try to find parameter definition in ORGAN_MODELS
          const paramDef = scaleData?.parameters?.find(p => p.id === paramId);
          
          let baseValue = paramDef?.value ?? mod.normal_min ?? 100;
          let newValue = baseValue;
          let unit = paramDef?.unit || mod.unit || '';
          let paramName = paramDef?.name || formatParamName(paramId);
          
          // Handle different modification formats
          const changePercent = mod.change_percent;
          const direction = mod.direction;
          const absoluteValue = mod.value;
          const multiplier = mod.multiplier || mod.factor;
          
          if (absoluteValue !== undefined && absoluteValue !== null) {
            // Direct value from API
            newValue = absoluteValue;
            // If we have both value and normal values, use those for base
            if (mod.normal_min !== undefined || mod.normal_max !== undefined) {
              // Calculate midpoint of normal range as baseline
              const normalMin = mod.normal_min || 0;
              const normalMax = mod.normal_max || (normalMin * 2) || 100;
              baseValue = (normalMin + normalMax) / 2;
            } else {
              // Try to estimate baseline from the change percent if available
              if (changePercent !== undefined && changePercent !== null && changePercent !== 0) {
                const sign = direction === 'decrease' ? -1 : 1;
                // If we have absolute value and change percent, derive baseline
                // newValue = baseValue * (1 + sign * changePercent / 100)
                // so: baseValue = newValue / (1 + sign * changePercent / 100)
                baseValue = absoluteValue / (1 + sign * Math.abs(changePercent) / 100);
              }
            }
          } else if (changePercent !== undefined && changePercent !== null) {
            // Percentage change from API
            const sign = direction === 'decrease' ? -1 : 1;
            const factor = 1 + (sign * Math.abs(changePercent) / 100) * diseaseSeverity;
            newValue = baseValue * factor;
          } else if (multiplier) {
            const factor = 1 + (multiplier - 1) * diseaseSeverity;
            newValue = baseValue * factor;
          } else if (direction === 'increase') {
            newValue = baseValue * 1.2; // Default 20% increase
          } else if (direction === 'decrease') {
            newValue = baseValue * 0.8; // Default 20% decrease
          } else if (direction === 'present' || direction === 'abnormal') {
            newValue = 1;
            baseValue = 0;
          } else if (direction === 'absent') {
            newValue = 0;
            baseValue = 1;
          }
          
          if (mod.absolute) {
            newValue = mod.absolute;
          }
          
          // Calculate delta safely
          let delta = 0;
          if (typeof baseValue === 'number' && typeof newValue === 'number' && baseValue !== 0 && !isNaN(baseValue) && isFinite(baseValue)) {
            delta = ((newValue - baseValue) / Math.abs(baseValue) * 100);
          } else if (changePercent !== undefined) {
            delta = direction === 'decrease' ? -Math.abs(changePercent) : Math.abs(changePercent);
          } else if (direction === 'increase' || direction === 'present') {
            delta = 20;
          } else if (direction === 'decrease' || direction === 'absent') {
            delta = -20;
          }
          if (isNaN(delta) || !isFinite(delta)) delta = changePercent || 0;
          
          params.push({
            id: paramId,
            name: paramName,
            organId,
            organName: organInfo.name,
            organIcon: organInfo.icon,
            scaleId,
            baseValue: typeof baseValue === 'number' ? baseValue : 0,
            newValue: typeof newValue === 'number' ? newValue : (newValue === 'present' ? 1 : 0),
            unit,
            delta,
            direction: direction || (delta >= 0 ? 'increase' : 'decrease'),
            note: mod.note || mod.evidence || '',
            isPrimary: currentDisease?.primaryOrgan === organId,
            abnormal: mod.abnormal || Math.abs(delta) > 10
          });
        });
      });
    });
    
    // Sort: primary organ first, then by absolute delta
    return params.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return Math.abs(b.delta) - Math.abs(a.delta);
    });
  }, [mergedModifications, currentDisease, diseaseSeverity]);

  // Filtered parameters based on organ filter
  const filteredParameters = useMemo(() => {
    if (!paramFilterOrgan) return allModifiedParameters;
    return allModifiedParameters.filter(p => p.organId === paramFilterOrgan);
  }, [allModifiedParameters, paramFilterOrgan]);

  // Extract EXTRA disease-specific molecular findings that don't have predefined UI parameters
  // This enables dynamic display of ANY molecular detail from the API
  const extraMolecularFindings = useMemo(() => {
    if (!mergedModifications) return [];
    
    const findings = [];
    const processedParams = new Set(allModifiedParameters.map(p => `${p.organId}.${p.scaleId}.${p.id}`));
    
    // Normalize parameter names to detect duplicates (e.g., "platelet_count" -> "platelets")
    const normalizeParamId = (id) => {
      const normalizations = {
        'platelet_count': 'platelets',
        'wbc_count': 'wbc',
        'rbc_count': 'rbc',
        'systolic_blood_pressure': 'systolic_bp',
        'diastolic_blood_pressure': 'diastolic_bp',
        'ejection_fraction': 'lvef',
        'ef': 'lvef',
        'left_ventricular_ef': 'lvef',
        'hemoglobin_level': 'hemoglobin',
        'hgb': 'hemoglobin',
        'hematocrit_level': 'hematocrit',
        'hct': 'hematocrit',
        'nt_probnp': 'nt_pro_bnp',
        'ntprobnp': 'nt_pro_bnp',
        'bnp_level': 'bnp',
        'creatinine_level': 'creatinine',
        'urea_level': 'urea',
        'bun_level': 'bun',
        'sodium_level': 'sodium',
        'potassium_level': 'potassium',
        'ast_level': 'ast',
        'alt_level': 'alt',
        'ldh_level': 'ldh',
        'troponin_level': 'troponin',
        'left_atrium': 'la_size',
        'la_diameter': 'la_size',
      };
      return normalizations[id.toLowerCase()] || id.toLowerCase();
    };
    
    // Track normalized param names to prevent duplicates
    const seenNormalizedParams = new Set();
    
    // Recursively extract parameters from nested structures
    const extractParams = (obj, path, organId, scaleId) => {
      if (!obj || typeof obj !== 'object') return;
      
      // Check if this is a leaf parameter (has change_percent or direction or value)
      if (obj.change_percent !== undefined || obj.direction !== undefined || 
          (obj.value !== undefined && typeof obj.value !== 'object')) {
        const paramId = path[path.length - 1] || 'unknown';
        const key = `${organId}.${scaleId}.${paramId}`;
        const normalizedKey = `${organId}.${scaleId}.${normalizeParamId(paramId)}`;
        
        // Skip if we've already processed this parameter (either exact or normalized)
        if (processedParams.has(key) || seenNormalizedParams.has(normalizedKey) || obj.direction === 'normal') {
          return;
        }
        
        seenNormalizedParams.add(normalizedKey);
        
        const name = path.map(w => 
          w.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
        ).join(' - ');
        
        findings.push({
          id: paramId,
          name: name,
          organId,
          scaleId,
          value: obj.value,
          unit: obj.unit,
          changePercent: obj.change_percent,
          direction: obj.direction,
          evidence: obj.evidence || obj.note || obj.description,
          category: scaleId === 'dna' ? 'Genetic' : 
                   scaleId === 'gene_expression' ? 'Expression' :
                   scaleId === 'metabolism' ? 'Metabolic' :
                   scaleId === 'cell_cycle' ? 'Cell Cycle' : 'Molecular'
        });
      } else {
        // Recurse into nested objects
        Object.entries(obj).forEach(([key, val]) => {
          if (val && typeof val === 'object') {
            extractParams(val, [...path, key], organId, scaleId);
          }
        });
      }
    };
    
    Object.entries(mergedModifications).forEach(([organId, organMods]) => {
      if (!organMods || typeof organMods !== 'object') return;
      Object.entries(organMods).forEach(([scaleId, scaleMods]) => {
        if (!scaleMods || typeof scaleMods !== 'object') return;
        Object.entries(scaleMods).forEach(([paramId, mod]) => {
          if (mod && typeof mod === 'object') {
            extractParams(mod, [paramId], organId, scaleId);
          }
        });
      });
    });
    
    return findings;
  }, [mergedModifications, allModifiedParameters]);

  // Calculate modified parameters based on disease
  // Enhanced to search across ALL scales and param ID variations
  const getModifiedValue = useCallback((organId, scaleId, paramId, baseValue) => {
    if (!mergedModifications) return { value: baseValue, modified: false };
    
    // Try to find modifications - search in ALL possible locations
    let mods = null;
    
    // Get all possible API param IDs for this ORGAN_MODELS param
    const possibleParamIds = PARAM_ID_MAPPING[paramId] ? [paramId, ...PARAM_ID_MAPPING[paramId]] : [paramId];
    
    // Search in ALL scales for this organ
    for (const tryScaleId of ALL_SEARCHABLE_SCALES) {
      for (const tryParamId of possibleParamIds) {
        mods = mergedModifications?.[organId]?.[tryScaleId]?.[tryParamId];
        if (mods) break;
      }
      if (mods) break;
    }
    
    // Also try 'cellular' organ for cellular-level parameters
    if (!mods && ['dna', 'gene_expression', 'metabolism', 'cell_cycle'].includes(scaleId)) {
      for (const tryScaleId of ALL_SEARCHABLE_SCALES) {
        for (const tryParamId of possibleParamIds) {
          mods = mergedModifications?.['cellular']?.[tryScaleId]?.[tryParamId];
          if (mods) break;
        }
        if (mods) break;
      }
    }
    
    if (!mods) return { value: baseValue, modified: false };
    
    let newValue = baseValue;
    
    // Handle different modification formats from API and static
    // IMPORTANT: Use hasOwnProperty or explicit checks for 0 values (0 is valid for "absent" params)
    const multiplier = mods.multiplier !== undefined ? mods.multiplier : mods.factor;
    const changePercent = mods.change_percent;
    const direction = mods.direction;
    // Check for absolute value properly - 0 is a valid value meaning "absent"
    const absoluteValue = mods.absolute !== undefined ? mods.absolute : mods.value;
    
    // Skip if marked as 'normal', 'no_change', 'none', or direction indicates no change
    if (direction === 'normal' || direction === 'no_change' || direction === 'none' || direction === 'no change') {
      return { value: baseValue, modified: false };
    }
    
    // SPECIAL CASE: Handle "absent" parameters (multiplier=0 or absolute=0 with a note containing "absent")
    // This is critical for medical accuracy (e.g., P-waves absent in AFib)
    const isAbsent = (multiplier === 0 || absoluteValue === 0) && 
                     (mods.note?.toLowerCase().includes('absent') || 
                      mods.note?.toLowerCase().includes('not measurable') ||
                      mods.note?.toLowerCase().includes('no p wave') ||
                      mods.note?.toLowerCase().includes('loss of'));
    
    if (isAbsent) {
      return {
        value: 'Absent',
        modified: true,
        note: mods.note || 'Not present in this condition',
        delta: '-100',
        isAbsent: true
      };
    }
    
    if (absoluteValue !== undefined && absoluteValue !== null && typeof absoluteValue === 'number') {
      // Direct value from API - use it directly or scale it
      // For geometry params (volumes), we might need to scale from mm to mL
      if (paramId.includes('edv') || paramId.includes('esv') || paramId.includes('volume')) {
        // If API gives a size in mm, convert roughly to volume (mL)
        // This is an approximation: volume ≈ (size)^3 / 1000 for spherical approximation
        if (mods.unit === 'mm') {
          // Use change_percent instead
          if (changePercent) {
            const sign = (direction === 'decrease' || changePercent < 0) ? -1 : 1;
            const factor = 1 + (sign * Math.abs(changePercent) / 100) * diseaseSeverity;
            newValue = baseValue * factor;
          } else {
            newValue = baseValue * (1 + 0.25 * diseaseSeverity); // Default 25% change
          }
        } else {
          newValue = absoluteValue;
        }
      } else {
        newValue = absoluteValue;
      }
    } else if (changePercent !== undefined && changePercent !== null && changePercent !== 0) {
      // Percentage change from API (e.g., change_percent: 50, direction: "decrease")
      // Handle both positive and negative change_percent values
      let percentChange = Math.abs(changePercent);
      const sign = (direction === 'decrease' || changePercent < 0) ? -1 : 1;
      const factor = 1 + (sign * percentChange / 100) * diseaseSeverity;
      newValue = baseValue * factor;
    } else if (multiplier && multiplier !== 1) {
      const factor = 1 + (multiplier - 1) * diseaseSeverity;
      newValue = baseValue * factor;
    } else if (direction === 'increase') {
      newValue = baseValue * (1 + 0.3 * diseaseSeverity); // Default 30% increase
    } else if (direction === 'decrease') {
      newValue = baseValue * (1 - 0.3 * diseaseSeverity); // Default 30% decrease
    } else {
      // No clear modification pattern
      return { value: baseValue, modified: false };
    }
    
    // Calculate delta safely - prefer API-provided change_percent over calculated delta
    let delta = 0;
    if (changePercent !== undefined && changePercent !== null) {
      // Use the API-provided change_percent directly
      const sign = (direction === 'decrease' || changePercent < 0) ? -1 : 1;
      delta = sign * Math.abs(changePercent);
    } else if (baseValue !== 0 && !isNaN(baseValue) && isFinite(baseValue) && newValue !== absoluteValue) {
      // Only calculate delta if we modified baseValue (not using absolute value directly)
      delta = ((newValue - baseValue) / baseValue * 100);
    } else if (newValue !== 0 && absoluteValue !== undefined) {
      // For absolute values, don't show percentage change - show the actual value
      delta = 0; // Will show actual value instead of % change
    }
    
    // Ensure delta is a valid number
    if (isNaN(delta) || !isFinite(delta)) delta = 0;
    
    // Only mark as modified if there's an actual change
    if (Math.abs(delta) < 0.5) return { value: baseValue, modified: false };
    
    return { 
      value: newValue, 
      modified: true, 
      note: mods.note || mods.evidence || mods.clinical_significance,
      delta: delta.toFixed(0)
    };
  }, [mergedModifications, diseaseSeverity]);

  const toggleEquation = useCallback((eqId) => {
    setExpandedEquations(prev => ({ ...prev, [eqId]: !prev[eqId] }));
  }, []);

  const resetDisease = useCallback(() => {
    setSelectedDisease(null);
    setDiseaseSeverity(0.5);
  }, []);

  // Handle scale selection with scroll-to-panel
  const handleScaleSelect = useCallback((scaleId) => {
    setSelectedScale(scaleId);
    // Scroll to parameters section after a short delay to ensure content is rendered
    setTimeout(() => {
      parametersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  // Handle disease selection with auto-navigation to primary organ
  const handleDiseaseSelect = useCallback((diseaseId) => {
    setSelectedDisease(diseaseId);
    setParamFilterOrgan(null); // Reset filter when disease changes
    // Keep showAllParams true so affected parameters section stays OPEN
    
    // Auto-navigate to primary affected organ
    if (diseaseId) {
      const disease = apiDiseases[diseaseId];
      if (disease?.primaryOrgan && ORGAN_MODELS[disease.primaryOrgan]) {
        setSelectedOrgan(disease.primaryOrgan);
      }
    }
  }, [apiDiseases]);

  const handleOrganSelect = useCallback((organId) => {
    setSelectedOrgan(organId);
    setMobileMenuOpen(false);
  }, []);

  const handleToggleClinicalPanel = useCallback(() => {
    setShowClinicalPanel(prev => !prev);
  }, []);

  return (
    <>
      <Helmet>
        <title>PhiCor Engine | Interactive Organ System Dashboard - PhiCor.ai</title>
        <meta name="description" content="Explore the mathematical human body model with real-time organ system simulation, disease modeling, and clinical parameter visualization across 6 organ systems." />
        <link rel="canonical" href="https://phicor.ai/dashboard" />
        <meta property="og:title" content="PhiCor Engine | Interactive Organ System Dashboard" />
        <meta property="og:description" content="Real-time organ system simulation with 2500+ diseases and 4000+ mathematical models." />
        <meta property="og:url" content="https://phicor.ai/dashboard" />
      </Helmet>
      <div className={`min-h-screen flex flex-col bg-background text-foreground`}>
      {/* Global Feature Navigation */}
      <FeatureNav />
      
      {/* Tutorial Overlay */}
      <FeatureTutorial 
        feature="dashboard" 
        isOpen={tutorial.isOpen} 
        onClose={tutorial.close} 
      />
      
      {/* Desktop Page Header */}
      <div className="hidden lg:block border-b border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-serif text-2xl font-bold">Φ</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PhiCor Engine</h1>
                <p className="text-xs text-muted-foreground">Mathematical Human Body Model</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Help/Manual Button */}
              <Button 
                variant="ghost" 
                size="icon"
                className="hidden sm:flex"
                onClick={() => window.open('/user-manual', '_blank')}
                title="User Manual"
              >
                <BookOpen className="w-4 h-4" />
              </Button>
              
              {/* Patient Panel Toggle - Clear button */}
              <Button 
                variant={leftPanelOpen ? "default" : "outline"} 
                className="gap-2"
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              >
                <User className="w-4 h-4" />
                <span>Patient Data</span>
                {leftPanelOpen && <ChevronDown className="w-3 h-3" />}
              </Button>
              
              {/* Disease Search Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant={selectedDisease ? "destructive" : "outline"} className="gap-2">
                    <Search className="w-4 h-4" />
                    <span>Find Condition</span>
                    {selectedDisease && currentDisease && (
                      <Badge variant="secondary" className="ml-1">{currentDisease.name?.split(' ')[0]}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-96 p-0 flex flex-col z-[60]">
                  <DiseasePanel 
                    diseases={diseases}
                    selectedDisease={selectedDisease}
                    onSelectDisease={handleDiseaseSelect}
                    currentDisease={currentDisease}
                    diseaseSeverity={diseaseSeverity}
                    onChangeSeverity={setDiseaseSeverity}
                    showClinicalPanel={showClinicalPanel}
                    onToggleClinicalPanel={handleToggleClinicalPanel}
                    onReset={resetDisease}
                    isLoading={isLoadingDiseases}
                  />
                </SheetContent>
              </Sheet>
              <TutorialButton onClick={tutorial.open} />
            </div>
          </div>
        </div>
      </div>

      {/* Active Disease Banner - When disease selected */}
      <AnimatePresence>
        {currentDisease && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-destructive/10 via-red-500/10 to-orange-500/10 border-b border-destructive/30 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-destructive/30 to-orange-500/20 flex items-center justify-center border border-destructive/30 shadow-lg shadow-destructive/10">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-destructive font-semibold uppercase tracking-wider">Active Condition</span>
                      {currentDisease.icd10 && (
                        <Badge variant="outline" className="text-[9px] border-destructive/40 text-destructive">
                          ICD-10: {currentDisease.icd10}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-xl lg:text-2xl font-bold text-foreground truncate bg-gradient-to-r from-destructive to-orange-600 bg-clip-text text-transparent">{currentDisease.name}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="hidden sm:flex text-sm">
                    {Object.values(affectedCounts).reduce((a, b) => a + b, 0)} affected parameters
                  </Badge>
                  <Button variant="outline" size="sm" onClick={resetDisease} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Horizontal Organ Tabs - Desktop Only */}
      <div className="hidden lg:block border-b border-border/50 bg-card/20 overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            {organs.map(([organId, organ]) => {
              const count = affectedCounts[organId] || 0;
              const isSelected = selectedOrgan === organId;
              return (
                <Button
                  key={organId}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={`gap-1.5 shrink-0 ${isSelected ? '' : 'text-muted-foreground'}`}
                  onClick={() => setSelectedOrgan(organId)}
                >
                  <span className="text-base">{organ.icon}</span>
                  <span className="hidden sm:inline text-xs">{organ.name}</span>
                  {selectedDisease && count > 0 && (
                    <Badge variant={isSelected ? "secondary" : "outline"} className="h-4 px-1 text-[10px]">
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Header - Fixed at top with proper z-index */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/50">
        {/* Mobile FeatureNav - Compact version matching other pages */}
        <div className="flex items-center justify-between px-3 py-2 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div 
            className="cursor-pointer"
            onClick={() => window.location.href = '/'}
          >
            <span className="text-lg font-bold">
              Phi<span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Cor</span>
            </span>
          </div>
          
          {/* Greek Symbol Navigation */}
          <div className="flex items-center gap-1">
            {[
              { symbol: 'Φ', path: '/dashboard', color: 'from-indigo-500 to-purple-500' },
              { symbol: 'Δ', path: '/differential', color: 'from-emerald-500 to-teal-500' },
              { symbol: 'ρ', path: '/drugs', color: 'from-rose-500 to-pink-500' },
              { symbol: 'Π', path: '/food', color: 'from-green-500 to-lime-500' }
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => window.location.href = item.path}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  window.location.pathname === item.path
                    ? `bg-gradient-to-br ${item.color} shadow-lg`
                    : 'bg-muted/50'
                }`}
              >
                <span className={`font-serif font-bold text-lg ${
                  window.location.pathname === item.path ? 'text-white' : 'text-muted-foreground'
                }`}>
                  {item.symbol}
                </span>
              </button>
            ))}
          </div>
          
          {/* Right side controls - Region selector and Theme toggle */}
          <div className="flex items-center gap-1">
            <RegionSelector compact={true} />
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${
                isDark 
                  ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* Main Mobile Header Bar */}
        <div className="h-12 flex items-center justify-between px-3 gap-2 border-b border-border/30">
          {/* Left Panel Slide-in */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9">
                <User className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-4 z-[60]">
              <LeftPanel 
                selectedDisease={currentDisease}
                currentOrgan={currentOrgan}
                diseaseModifications={mergedModifications}
                isMobile={true}
              />
            </SheetContent>
          </Sheet>

          {/* Current Organ/View Info */}
          <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
            <span className="text-base">{currentOrgan?.icon}</span>
            <span className="font-medium text-sm truncate">{currentOrgan?.name}</span>
          </div>
          
          {/* Disease Search */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={`h-9 w-9 ${selectedDisease ? 'text-destructive' : ''}`}>
                <Stethoscope className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 flex flex-col z-[60]">
              <DiseasePanel 
                diseases={diseases}
                selectedDisease={selectedDisease}
                onSelectDisease={handleDiseaseSelect}
                currentDisease={currentDisease}
                diseaseSeverity={diseaseSeverity}
                onChangeSeverity={setDiseaseSeverity}
                showClinicalPanel={showClinicalPanel}
                onToggleClinicalPanel={handleToggleClinicalPanel}
                onReset={resetDisease}
                isMobile
                isLoading={isLoadingDiseases}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Disease Banner */}
        <AnimatePresence>
          {currentDisease && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-destructive/15 to-orange-500/10 border-b border-destructive/20 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                  <span className="text-sm font-semibold truncate">{currentDisease.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={resetDisease} className="h-6 px-2 text-destructive">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Organ Tabs */}
        <div className="overflow-x-auto border-b border-border/30">
          <div className="flex items-center gap-1 px-2 py-1.5">
            {organs.map(([organId, organ]) => {
              const count = affectedCounts[organId] || 0;
              const isSelected = selectedOrgan === organId;
              return (
                <Button
                  key={organId}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={`gap-1 shrink-0 h-8 px-2 ${isSelected ? '' : 'text-muted-foreground'}`}
                  onClick={() => setSelectedOrgan(organId)}
                >
                  <span className="text-sm">{organ.icon}</span>
                  {selectedDisease && count > 0 && (
                    <span className="text-[10px]">{count}</span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Desktop Left Panel - Collapsible */}
        <AnimatePresence>
          {leftPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block border-r border-border/50 overflow-hidden"
            >
              <LeftPanel 
                selectedDisease={currentDisease}
                currentOrgan={currentOrgan}
                diseaseModifications={mergedModifications}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col overflow-hidden pt-44 lg:pt-0`}>
          
        {/* Collapsible ALL AFFECTED PARAMETERS Summary - Shows when disease is selected */}
        {currentDisease && allModifiedParameters.length > 0 && (
          <Collapsible 
            open={showAllParams} 
            onOpenChange={setShowAllParams}
            className="border-b border-border/50"
          >
            <CollapsibleTrigger asChild>
              <button className="w-full px-3 lg:px-6 py-2 bg-gradient-to-r from-destructive/10 via-orange-500/5 to-amber-500/5 flex items-center justify-between hover:bg-destructive/15 transition-colors">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-semibold text-foreground">
                    Disease Impact Summary
                  </span>
                  <Badge variant="destructive" className="text-[10px]">
                    {allModifiedParameters.length} affected parameters
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {showAllParams ? 'Click to collapse' : 'Click to expand'}
                  </span>
                  {showAllParams ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 lg:px-6 py-4 bg-gradient-to-r from-destructive/5 via-orange-500/5 to-amber-500/5">
                {/* Grouped Parameters by Organ - No duplicate filter tabs */}
                <div className="space-y-4">
                  {affectedOrgansSummary.map((organ) => {
                    const organParams = allModifiedParameters.filter(p => p.organId === organ.id);
                    if (organParams.length === 0) return null;
                    
                    return (
                      <div key={organ.id} className="space-y-2">
                        {/* Organ Section Header */}
                        <button
                          onClick={() => {
                            setSelectedOrgan(organ.id);
                            setTimeout(() => {
                              parametersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all hover:bg-opacity-80 ${
                            organ.isPrimary 
                              ? 'bg-destructive/20 border border-destructive/30' 
                              : 'bg-orange-500/10 border border-orange-500/20'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{organ.icon}</span>
                            <span className={`text-sm font-semibold ${organ.isPrimary ? 'text-destructive' : 'text-orange-500'}`}>
                              {organ.name}
                            </span>
                            {organ.isPrimary && (
                              <Badge variant="destructive" className="text-[9px] px-1.5 py-0">PRIMARY</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] ${organ.isPrimary ? 'border-destructive/50 text-destructive' : 'border-orange-500/50 text-orange-500'}`}>
                              {organParams.length} parameters
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </button>
                        
                        {/* Parameter Cards Grid for this Organ */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 pl-2">
                          {organParams.slice(0, 12).map((param, idx) => (
                            <motion.button
                              key={`${param.organId}-${param.id}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                              onClick={() => {
                                setSelectedOrgan(param.organId);
                                setSelectedScale(param.scaleId);
                                setTimeout(() => {
                                  parametersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 100);
                              }}
                              className={`p-2 rounded-lg border text-left transition-all hover:scale-[1.02] hover:shadow-md ${
                                selectedOrgan === param.organId && selectedScale === param.scaleId
                                  ? 'ring-2 ring-primary bg-primary/10 border-primary/50'
                                  : param.isPrimary 
                                  ? 'bg-destructive/5 border-destructive/20 hover:border-destructive/40' 
                                  : 'bg-orange-500/5 border-orange-500/15 hover:border-orange-500/30'
                              }`}
                            >
                              <div className="text-xs font-medium text-foreground truncate" title={param.name}>
                                {param.name}
                              </div>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[10px] text-muted-foreground line-through">
                                  {typeof param.baseValue === 'number' ? param.baseValue.toFixed(1) : param.baseValue}
                                </span>
                                <div className={`flex items-center gap-0.5 text-[10px] font-bold ${
                                  param.direction === 'increase' ? 'text-red-500' : 'text-blue-500'
                                }`}>
                                  {param.direction === 'increase' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  <span>{typeof param.newValue === 'number' ? param.newValue.toFixed(1) : param.newValue}</span>
                                </div>
                              </div>
                              <div className={`text-[9px] mt-0.5 ${param.direction === 'increase' ? 'text-red-400' : 'text-blue-400'}`}>
                                {param.delta != null ? `${param.delta > 0 ? '+' : ''}${typeof param.delta === 'number' ? param.delta.toFixed(0) : param.delta}%` : ''} {param.unit}
                              </div>
                            </motion.button>
                          ))}
                          {organParams.length > 12 && (
                            <button
                              onClick={() => {
                                setSelectedOrgan(organ.id);
                                setTimeout(() => {
                                  parametersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 100);
                              }}
                              className="p-2 rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center"
                            >
                              <span className="text-xs">+{organParams.length - 12} more</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Total Summary */}
                <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total: {allModifiedParameters.length} affected parameters across {affectedOrgansSummary.length} organ{affectedOrgansSummary.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Click organ header or parameter to view full details below
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetDisease}
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  >
                    <RotateCcw className="w-3 h-3 mr-2" />
                    Reset to Healthy Model
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Dynamic Disease-Specific Molecular Findings Panel */}
        {currentDisease && extraMolecularFindings.length > 0 && (
          <div className="px-3 lg:px-6 py-3 bg-gradient-to-r from-purple-500/5 to-violet-500/5 border-b border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Disease-Specific Molecular Profile
              </span>
              <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">
                {extraMolecularFindings.length} findings
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              Molecular changes specific to {currentDisease.name} without predefined baselines
            </p>
            <div className="flex flex-wrap gap-1.5">
              {extraMolecularFindings.slice(0, showAllParams ? 50 : 8).map((finding, idx) => (
                <motion.div
                  key={finding.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="px-2 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1 py-0.5 rounded ${
                      finding.category === 'Genetic' ? 'bg-blue-500/20 text-blue-400' :
                      finding.category === 'Expression' ? 'bg-green-500/20 text-green-400' :
                      finding.category === 'Metabolic' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {finding.category}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {finding.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {finding.value !== undefined && (
                      <span className="text-[10px] font-bold text-purple-400">
                        Value: {finding.value}
                      </span>
                    )}
                    {finding.changePercent !== undefined && (
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                        finding.direction === 'increase' ? 'text-red-400' : 
                        finding.direction === 'decrease' ? 'text-blue-400' : 'text-muted-foreground'
                      }`}>
                        {finding.direction === 'increase' ? <TrendingUp className="w-2.5 h-2.5" /> : 
                         finding.direction === 'decrease' ? <TrendingDown className="w-2.5 h-2.5" /> : null}
                        {finding.direction === 'increase' ? '+' : finding.direction === 'decrease' ? '-' : ''}{finding.changePercent}%
                      </span>
                    )}
                  </div>
                  {finding.evidence && (
                    <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1" title={finding.evidence}>
                      {finding.evidence}
                    </p>
                  )}
                </motion.div>
              ))}
              {extraMolecularFindings.length > 8 && !showAllParams && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllParams(true);
                  }}
                  className="px-2 py-1 text-[10px] text-purple-400 hover:text-purple-300 border border-dashed border-purple-500/30 rounded-md"
                >
                  +{extraMolecularFindings.length - 8} more...
                </button>
              )}
            </div>
          </div>
        )}

        {/* Clinical Data Panel - Displays Vitals, Labs, Physical Exam, DNA from API */}
        {currentDisease && mergedModifications && (
          <div className="px-3 lg:px-6 py-4 border-b border-border/50 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-purple-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Clinical Parameters for {currentDisease.name}</span>
            </div>
            <ClinicalDataPanel 
              modifications={mergedModifications}
              disease={currentDisease}
              severity={diseaseSeverity}
            />
          </div>
        )}

        {/* Scale Tabs - Moved below clinical data when disease selected */}
        <div className="border-b border-border/50 px-3 lg:px-6 bg-card/20">
          <div className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
            {SCALE_LEVELS.map((scale) => {
              const hasData = currentOrgan?.[scale.id];
              const hasChanges = mergedModifications?.[selectedOrgan]?.[scale.id];
              
              return (
                <button
                  key={scale.id}
                  onClick={() => hasData && handleScaleSelect(scale.id)}
                  disabled={!hasData}
                  className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm whitespace-nowrap transition-all ${
                    selectedScale === scale.id
                      ? 'bg-primary/20 text-primary'
                      : hasData
                      ? hasChanges
                        ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                      : 'text-muted-foreground/30 cursor-not-allowed'
                  }`}
                  data-testid={`scale-${scale.id}`}
                >
                  <span>{scale.icon}</span>
                  <span className="hidden sm:inline">{scale.fullName}</span>
                  <span className="sm:hidden">{scale.name}</span>
                  {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-destructive" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Parameters & Equations Panel */}
          <div className="flex-1 p-3 md:p-6 overflow-auto">
            {/* Show Lung Cancer Module if selected */}
            {selectedDisease === 'lung_cancer_module' ? (
              <LungCancerModule />
            ) : currentScale ? (
              <div className="space-y-6 max-w-5xl">
                {/* Mobile Reset Button */}
                {selectedDisease !== null && currentDisease && (
                  <div className="lg:hidden">
                    <Button variant="outline" size="sm" onClick={resetDisease} className="w-full">
                      <RotateCcw className="w-3 h-3 mr-2" />
                      Reset Model
                    </Button>
                  </div>
                )}

                {/* Parameters Section */}
                {currentScale.parameters && currentScale.parameters.length > 0 && (
                  <section ref={parametersRef}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Parameters
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {currentScale.parameters.map((param) => {
                        const mod = getModifiedValue(selectedOrgan, selectedScale, param.id, param.value);
                        
                        return (
                          <motion.div
                            key={param.id}
                            initial={mod.modified ? { scale: 1 } : false}
                            animate={mod.modified ? { 
                              boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0)', '0 0 20px 4px rgba(239, 68, 68, 0.3)', '0 0 0 0 rgba(239, 68, 68, 0)']
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            className={`p-3 md:p-4 rounded-lg border transition-all relative overflow-hidden ${
                              mod.modified
                                ? 'bg-gradient-to-br from-destructive/10 to-orange-500/10 border-destructive/40 ring-1 ring-destructive/20'
                                : 'bg-card/50 border-border/50'
                            }`}
                            data-testid={`param-${param.id}`}
                          >
                            {/* Abnormal indicator stripe */}
                            {mod.modified && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-destructive to-orange-500" />
                            )}
                            
                            <div className="flex items-start justify-between mb-2 gap-2">
                              <span className={`text-xs md:text-sm leading-tight ${mod.modified ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                {param.name}
                              </span>
                              <div className="flex items-center gap-1">
                                {mod.isAbsent && (
                                  <Badge variant="destructive" className="text-[10px] shrink-0 bg-purple-600/80">
                                    <X className="w-2 h-2 mr-1" />
                                    Absent
                                  </Badge>
                                )}
                                {mod.modified && !mod.isAbsent && (
                                  <Badge variant="destructive" className="text-[10px] shrink-0">
                                    <AlertTriangle className="w-2 h-2 mr-1" />
                                    Abnormal
                                  </Badge>
                                )}
                                <Badge variant={param.evidence === 'novel' ? 'secondary' : 'outline'} className="text-[10px] shrink-0">
                                  {param.evidence === 'novel' ? (
                                    <><Lightbulb className="w-2 h-2 mr-1" />Novel</>
                                  ) : (
                                    <><BookOpen className="w-2 h-2 mr-1" />Est.</>
                                  )}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-baseline gap-2 flex-wrap">
                              {mod.modified && !mod.isAbsent && (
                                <span className="text-base md:text-lg font-mono text-muted-foreground/60 line-through">
                                  {param.value}
                                </span>
                              )}
                              {mod.isAbsent ? (
                                <motion.span 
                                  key="absent"
                                  initial={{ scale: 1.2, color: '#a855f7' }}
                                  animate={{ scale: 1 }}
                                  className="text-xl md:text-2xl font-bold text-purple-500"
                                >
                                  ABSENT
                                </motion.span>
                              ) : (
                                <motion.span 
                                  key={mod.value}
                                  initial={mod.modified ? { scale: 1.2, color: '#ef4444' } : false}
                                  animate={{ scale: 1 }}
                                  className={`text-xl md:text-2xl font-mono font-bold ${mod.modified ? 'text-destructive' : ''}`}
                                >
                                  {mod.value != null && typeof mod.value === 'number' 
                                    ? mod.value.toFixed(param.value % 1 === 0 ? 0 : 1)
                                    : mod.value ?? 'N/A'}
                                </motion.span>
                              )}
                              {!mod.isAbsent && (
                                <span className="text-xs md:text-sm text-muted-foreground">{param.unit}</span>
                              )}
                              {mod.modified && mod.delta && !mod.isAbsent && (
                                <motion.span 
                                  initial={{ scale: 1.3 }}
                                  animate={{ scale: 1 }}
                                  className={`text-xs md:text-sm font-bold px-1.5 py-0.5 rounded ${
                                    parseFloat(mod.delta) > 0 
                                      ? 'bg-red-500/20 text-red-400' 
                                      : 'bg-blue-500/20 text-blue-400'
                                  }`}
                                >
                                  {parseFloat(mod.delta) > 0 ? '↑' : '↓'}{Math.abs(parseFloat(mod.delta))}%
                                </motion.span>
                              )}
                            </div>
                            
                            {mod.note && (
                              <p className="text-[10px] md:text-xs text-destructive mt-2 flex items-center gap-1 bg-destructive/10 rounded px-2 py-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>{mod.note}</span>
                              </p>
                            )}
                            
                            <div className="mt-2 text-[10px] text-muted-foreground">
                              Normal: {param.range[0]} - {param.range[1]} {param.unit}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Equations Section */}
                {currentScale.equations && currentScale.equations.length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Mathematical Equations
                    </h3>
                    <div className="space-y-3">
                      {currentScale.equations.map((eq) => (
                        <EquationDerivation
                          key={eq.id}
                          equation={eq}
                          expanded={expandedEquations[eq.id]}
                          onToggle={() => toggleEquation(eq.id)}
                          currentParams={Object.fromEntries(
                            currentScale.parameters.map(p => [p.id, p.value])
                          )}
                          diseaseSeverity={diseaseSeverity}
                          isDiseasedState={!!currentDisease}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Disease-specific novel equations */}
                {currentDisease?.novelEquations && currentDisease.affectedOrgans?.includes(selectedOrgan) && (
                  <section>
                    <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Disease-Specific Equations ({currentDisease.name})
                    </h3>
                    <div className="space-y-3">
                      {currentDisease.novelEquations.map((eq) => (
                        <div
                          key={eq.id}
                          className="rounded-xl border border-destructive/20 bg-destructive/5 overflow-hidden"
                        >
                          <div className="p-3 md:p-4">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 flex-wrap">
                              <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                                <Lightbulb className="w-3 h-3 mr-1" />
                                Disease Model
                              </Badge>
                              <div>
                                <h4 className="font-medium text-sm">{eq.name}</h4>
                                <p className="text-xs text-muted-foreground">{eq.description}</p>
                              </div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3 md:p-6 overflow-x-auto">
                              <BlockMath math={eq.latex} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Biochemistry Section for Cellular Scale */}
                {selectedScale === 'cellular' && (
                  <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Microscope className="w-4 h-4" />
                      Biochemical Pathways
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(BIOCHEMISTRY).slice(0, 4).map(([key, pathway]) => (
                        <div key={key} className="p-4 rounded-lg border border-border/50 bg-card/30">
                          <h4 className="font-medium text-sm mb-1">{pathway.name}</h4>
                          <p className="text-xs text-muted-foreground mb-3">{pathway.description}</p>
                          {pathway.glycolysis && (
                            <div className="text-xs">
                              <span className="text-primary">{pathway.glycolysis.steps?.length || 10} steps</span>
                              <span className="mx-2 text-muted-foreground">•</span>
                              <span className="text-green-500">Net: {pathway.glycolysis.energyYield?.net_atp || 2} ATP</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Clinical Evidence Section - Moved to bottom, expanded by default */}
                {currentDisease && (
                  <section className="mt-6 pt-6 border-t border-border/50">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Clinical Evidence
                    </h3>
                    <ClinicalFindingsPanel
                      disease={currentDisease}
                      isExpanded={true}
                      onToggle={handleToggleClinicalPanel}
                      alwaysExpanded={true}
                    />
                  </section>
                )}

                {/* Relevant Clinical Calculators Panel */}
                {currentDisease && selectedDisease && (
                  <section className="mt-6">
                    <RelevantCalculatorsPanel
                      diseaseId={selectedDisease}
                      diseaseName={currentDisease?.name}
                      organId={selectedOrgan}
                      isExpanded={false}
                    />
                  </section>
                )}

                {/* Evidence-Based Treatment Guidelines Panel */}
                {currentDisease && selectedDisease && (
                  <section className="mt-6">
                    <TreatmentGuidelinesPanel diseaseId={selectedDisease} />
                  </section>
                )}

                {/* Backend Disease Database - Clinical Evidence Panel */}
                {currentDisease && selectedDisease && (
                  <section className="mt-4">
                    <DiseaseDetailPanel 
                      diseaseId={selectedDisease} 
                      diseaseName={currentDisease?.name} 
                    />
                  </section>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Select a scale level to view parameters and equations</p>
              </div>
            )}
          </div>

          {/* Desktop Right Sidebar */}
          <aside className="hidden lg:flex bg-card/20">
            <DiseasePanel 
              diseases={diseases}
              selectedDisease={selectedDisease}
              onSelectDisease={handleDiseaseSelect}
              currentDisease={currentDisease}
              diseaseSeverity={diseaseSeverity}
              onChangeSeverity={setDiseaseSeverity}
              showClinicalPanel={showClinicalPanel}
              onToggleClinicalPanel={handleToggleClinicalPanel}
              onReset={resetDisease}
              isLoading={isLoadingDiseases}
            />
          </aside>
        </div>
      </main>
      </div>
    </div>
    </>
  );
};

export default DashboardMultiScale;
