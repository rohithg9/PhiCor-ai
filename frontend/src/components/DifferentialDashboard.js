import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Heart, Brain, FlaskConical, Activity, Stethoscope, 
  TrendingUp, TrendingDown, Minus, CheckCircle, XCircle,
  AlertTriangle, ChevronDown, ChevronUp, Target, Zap,
  Pill, Gauge, Eye, Ear, Microscope, Dna, FileText,
  Shield, Thermometer, Beaker, Users, Loader2, TestTube,
  ClipboardCheck, HelpCircle
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Organ system icons
const ORGAN_ICONS = {
  heart: Heart,
  blood: Activity,
  kidneys: FlaskConical,
  liver: Beaker,
  lungs: Activity,
  brain: Brain,
  cellular: Dna,
  immune: Shield,
  thyroid: Gauge,
  pancreas: FlaskConical,
  adrenal: Pill,
  bone: Activity,
  muscle: Activity,
  skin: Eye,
  eyes: Eye,
  ears: Ear,
  gi: FlaskConical,
  functional_scores: FileText,
  risk_factors: AlertTriangle,
  affected_organ: Target,
  dna: Dna,
  proteins: Microscope,
  molecular: Microscope,
  default: Target
};

// Parameter name aliases for better matching
const PARAMETER_ALIASES = {
  'wbc': ['wbc_count', 'white_blood_cell', 'white_blood_cells', 'leukocytes', 'leukocyte_count'],
  'wbc_count': ['wbc', 'white_blood_cell', 'white_blood_cells', 'leukocytes'],
  'temperature': ['body_temp', 'temp', 'body_temperature', 'fever'],
  'body_temp': ['temperature', 'temp', 'body_temperature'],
  'heart_rate': ['hr', 'resting_hr', 'pulse', 'pulse_rate'],
  'resting_hr': ['hr', 'heart_rate', 'pulse'],
  'respiratory_rate': ['rr', 'resp_rate', 'breathing_rate'],
  'spo2': ['oxygen_saturation', 'o2sat', 'o2_saturation', 'sat'],
  'oxygen_saturation': ['spo2', 'o2sat', 'o2_saturation'],
  'pco2': ['co2', 'arterial_pco2', 'carbon_dioxide'],
  'crp': ['c_reactive_protein', 'c-reactive_protein'],
  'c_reactive_protein': ['crp', 'c-reactive_protein'],
  'blood_pressure': ['bp', 'systolic_bp', 'diastolic_bp'],
  'systolic_bp': ['blood_pressure', 'bp', 'systolic'],
  'diastolic_bp': ['blood_pressure', 'bp', 'diastolic'],
  'cough': ['coughing', 'productive_cough', 'dry_cough'],
  'fever': ['pyrexia', 'febrile', 'temperature', 'elevated_temperature'],
  'dyspnea': ['shortness_of_breath', 'sob', 'breathlessness', 'difficulty_breathing'],
  'shortness_of_breath': ['dyspnea', 'sob', 'breathlessness'],
};

const DifferentialDashboard = ({ 
  differentials = [], 
  patientFindings = [], 
  symptoms = [],
  onParameterClick = () => {},
  className = ''
}) => {
  const { isDark } = useTheme();
  const [selectedDifferential, setSelectedDifferential] = useState(0);
  const [diseaseProfiles, setDiseaseProfiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedOrgans, setExpandedOrgans] = useState({});
  const [matchStats, setMatchStats] = useState({});

  // Build comprehensive findings map with all aliases
  const buildFindingsMap = useCallback((findings, syms) => {
    const map = {};
    
    // Process lab/vital findings
    findings.forEach(f => {
      const rawKey = (f.parameterId || f.parameterName || '').toLowerCase().replace(/[\s-]+/g, '_');
      if (!rawKey) return;
      
      // Store the finding
      map[rawKey] = {
        ...f,
        direction: f.direction || 
          (f.status === 'elevated' || f.status === 'high' ? 'increase' : 
           f.status === 'decreased' || f.status === 'low' ? 'decrease' : 
           f.status === 'normal' ? 'normal' : '')
      };
      
      // Add all aliases
      const aliases = PARAMETER_ALIASES[rawKey] || [];
      aliases.forEach(alias => {
        if (!map[alias]) map[alias] = map[rawKey];
      });
      
      // Special handling for common variations
      if (rawKey.includes('white_blood') || rawKey.includes('wbc')) {
        map['wbc_count'] = map[rawKey];
        map['wbc'] = map[rawKey];
        map['leukocytes'] = map[rawKey];
      }
      if (rawKey.includes('temp')) {
        map['body_temp'] = map[rawKey];
        map['temperature'] = map[rawKey];
      }
      if (rawKey.includes('heart') || rawKey.includes('hr')) {
        map['resting_hr'] = map[rawKey];
        map['heart_rate'] = map[rawKey];
      }
      if (rawKey.includes('crp') || rawKey.includes('reactive')) {
        map['crp'] = map[rawKey];
        map['c_reactive_protein'] = map[rawKey];
      }
    });
    
    // Process symptoms
    syms.forEach(s => {
      const name = (typeof s === 'object' ? s.parameterName || s.name : s || '').toLowerCase().replace(/[\s-]+/g, '_');
      if (!name) return;
      
      map[name] = { 
        name, 
        type: 'symptom', 
        direction: 'present',
        isSymptom: true
      };
      
      // Add symptom aliases
      const aliases = PARAMETER_ALIASES[name] || [];
      aliases.forEach(alias => {
        if (!map[alias]) map[alias] = map[name];
      });
      
      // Common symptom variations
      if (name.includes('cough')) map['cough'] = map[name];
      if (name.includes('fever')) map['fever'] = map[name];
      if (name.includes('dyspnea') || name.includes('breath')) {
        map['dyspnea'] = map[name];
        map['shortness_of_breath'] = map[name];
      }
    });
    
    return map;
  }, []);

  // Calculate match statistics for a disease
  const calculateMatchStats = useCallback((disease, findingsMap) => {
    if (!disease?.parameter_modifications) {
      return { total: 0, matched: 0, percentage: 0, matchedParams: [], missingParams: [] };
    }
    
    let total = 0;
    let matched = 0;
    const matchedParams = [];
    const missingParams = [];
    
    // Count matches in parameter modifications
    Object.entries(disease.parameter_modifications).forEach(([organ, organData]) => {
      if (typeof organData !== 'object') return;
      Object.entries(organData).forEach(([category, params]) => {
        if (typeof params !== 'object') return;
        Object.entries(params).forEach(([paramName, expected]) => {
          if (!expected.direction || expected.direction === 'no_change') return;
          
          total++;
          const paramKey = paramName.toLowerCase().replace(/[\s-]+/g, '_');
          
          // Try to find the parameter in patient findings
          const actual = findingsMap[paramKey];
          
          if (actual) {
            const actualDir = actual.direction || '';
            if (expected.direction === actualDir || 
                (expected.direction === 'increase' && (actualDir === 'increase' || actualDir === 'high' || actualDir === 'elevated')) ||
                (expected.direction === 'decrease' && (actualDir === 'decrease' || actualDir === 'low' || actualDir === 'decreased'))) {
              matched++;
              matchedParams.push({ param: paramName, organ, category, expected, actual });
            }
          } else {
            missingParams.push({ param: paramName, organ, category, expected });
          }
        });
      });
    });
    
    // Also check symptoms from comprehensive model
    const clinicalPres = disease.comprehensive_model?.clinicalPresentation;
    if (clinicalPres?.symptoms) {
      clinicalPres.symptoms.forEach(s => {
        const symptomName = (typeof s === 'object' ? s.name : s || '').toLowerCase().replace(/[\s-]+/g, '_');
        if (!symptomName) return;
        
        total++;
        const hasSymptom = findingsMap[symptomName] || 
          Object.keys(findingsMap).some(k => k.includes(symptomName) || symptomName.includes(k));
        
        if (hasSymptom) {
          matched++;
          matchedParams.push({ param: symptomName, type: 'symptom' });
        } else {
          missingParams.push({ param: symptomName, type: 'symptom' });
        }
      });
    }
    
    return { 
      total, 
      matched, 
      percentage: total > 0 ? Math.round((matched / total) * 100) : 0,
      matchedParams,
      missingParams
    };
  }, []);

  // Load disease profiles for all differentials
  useEffect(() => {
    const loadDiseaseProfiles = async () => {
      if (differentials.length === 0) return;
      
      setLoading(true);
      const profiles = {};
      const stats = {};
      const findingsMap = buildFindingsMap(patientFindings, symptoms);
      
      console.log('Patient findings map:', Object.keys(findingsMap));
      
      for (const diff of differentials.slice(0, 5)) {
        const diseaseName = diff.diseaseName || diff.name;
        if (!diseaseName) continue;
        
        try {
          const response = await fetch(
            `${BACKEND_URL}/api/diseases/search?q=${encodeURIComponent(diseaseName)}&limit=1`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              profiles[diseaseName] = data[0];
              stats[diseaseName] = calculateMatchStats(data[0], findingsMap);
              console.log(`Match stats for ${diseaseName}:`, stats[diseaseName]);
            }
          }
        } catch (error) {
          console.error('Error loading disease profile:', error);
        }
      }
      
      setDiseaseProfiles(profiles);
      setMatchStats(stats);
      setLoading(false);
      
      // Auto-expand all organs initially
      if (Object.keys(profiles).length > 0) {
        const firstProfile = Object.values(profiles)[0];
        const organs = Object.keys(firstProfile?.parameter_modifications || {});
        const initialExpanded = {};
        organs.forEach(organ => {
          initialExpanded[organ] = true; // Expand all
        });
        setExpandedOrgans(initialExpanded);
      }
    };
    
    loadDiseaseProfiles();
  }, [differentials, patientFindings, symptoms, buildFindingsMap, calculateMatchStats]);

  // Create findings map for current render
  const findingsMap = React.useMemo(() => {
    return buildFindingsMap(patientFindings, symptoms);
  }, [patientFindings, symptoms, buildFindingsMap]);

  const toggleOrgan = (organ) => {
    setExpandedOrgans(prev => ({
      ...prev,
      [organ]: !prev[organ]
    }));
  };

  // Get color for parameter based on direction
  const getParameterColor = (direction, isMatched, isDarkMode) => {
    if (direction === 'increase') {
      return isMatched 
        ? isDarkMode ? 'bg-red-900/40 border-red-700 text-red-300' : 'bg-red-100 border-red-300 text-red-700'
        : isDarkMode ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200';
    }
    if (direction === 'decrease') {
      return isMatched
        ? isDarkMode ? 'bg-blue-900/40 border-blue-700 text-blue-300' : 'bg-blue-100 border-blue-300 text-blue-700'
        : isDarkMode ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50 border-blue-200';
    }
    return isDarkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200';
  };

  if (differentials.length === 0) {
    return (
      <div className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Run a clinical analysis to see differential diagnoses</p>
      </div>
    );
  }

  const topDifferentials = differentials.slice(0, 5);
  const currentDiff = topDifferentials[selectedDifferential];
  const currentDiseaseName = currentDiff?.diseaseName || currentDiff?.name;
  const currentProfile = diseaseProfiles[currentDiseaseName];
  const currentStats = matchStats[currentDiseaseName] || { total: 0, matched: 0, percentage: 0, matchedParams: [], missingParams: [] };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Differential Tabs with Match Counts */}
      <div className="mb-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="w-4 h-4 text-emerald-500" />
          <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Differential Diagnosis
          </h3>
        </div>
        
        <Tabs value={String(selectedDifferential)} onValueChange={(v) => setSelectedDifferential(Number(v))}>
          <TabsList className={`w-full flex flex-wrap gap-1 p-1 h-auto ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            {topDifferentials.map((diff, idx) => {
              const name = diff.diseaseName || diff.name;
              const stats = matchStats[name] || { matched: 0, total: 0, percentage: 0 };
              const isActive = selectedDifferential === idx;
              
              return (
                <TabsTrigger 
                  key={idx} 
                  value={String(idx)}
                  className={`flex-1 min-w-[100px] p-2 rounded-lg transition-all ${
                    isActive 
                      ? isDark ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'
                      : isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex flex-col items-center w-full">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded mb-1 ${
                      idx === 0 
                        ? 'bg-emerald-500 text-white' 
                        : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-medium truncate w-full text-center">
                      {name?.split(' ').slice(0, 2).join(' ')}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <Progress 
                        value={stats.percentage} 
                        className={`h-1 w-12 ${isActive ? 'bg-white/30' : ''}`}
                      />
                      <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-emerald-500'}`}>
                        {stats.matched}/{stats.total}
                      </span>
                    </div>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading disease profiles...
          </span>
        </div>
      )}

      {/* Scrollable Disease Profile Content */}
      {!loading && currentProfile && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden -mx-2 px-2" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          <div className="space-y-3 pb-4">
            {/* Disease Header with Match Summary */}
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentProfile.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {currentProfile.icd10 && (
                      <Badge variant="outline" className="text-[10px]">
                        {currentProfile.icd10}
                      </Badge>
                    )}
                    {currentProfile.category && (
                      <Badge variant="outline" className="text-[10px]">
                        {currentProfile.category}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Match Score Circle */}
                <div className="text-center flex-shrink-0">
                  <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <svg className="absolute inset-0 w-16 h-16 -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke={isDark ? '#374151' : '#e5e7eb'} strokeWidth="5" fill="none" />
                      <circle
                        cx="32" cy="32" r="28"
                        stroke={currentStats.percentage > 50 ? '#10b981' : currentStats.percentage > 25 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="5" fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - currentStats.percentage / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={`text-lg font-bold ${
                      currentStats.percentage > 50 ? 'text-emerald-500' : currentStats.percentage > 25 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {currentStats.percentage}%
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentStats.matched}/{currentStats.total} match
                  </p>
                </div>
              </div>
            </div>

            {/* Matched Findings Summary */}
            {currentStats.matchedParams?.length > 0 && (
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-50 border-emerald-200'}`}>
                <h4 className={`text-xs font-semibold flex items-center gap-2 mb-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  <CheckCircle className="w-4 h-4" />
                  Patient Findings Supporting This Diagnosis ({currentStats.matched})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {currentStats.matchedParams.slice(0, 10).map((m, idx) => (
                    <Badge 
                      key={idx}
                      onClick={() => onParameterClick(m.param, 'matched', m.expected)}
                      className={`text-[10px] cursor-pointer hover:scale-105 transition-transform ${
                        m.expected?.direction === 'increase' 
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : m.expected?.direction === 'decrease'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {m.expected?.direction === 'increase' && <TrendingUp className="w-3 h-3 mr-1" />}
                      {m.expected?.direction === 'decrease' && <TrendingDown className="w-3 h-3 mr-1" />}
                      {m.param.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Tests Needed */}
            {currentStats.missingParams?.length > 0 && (
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
                <h4 className={`text-xs font-semibold flex items-center gap-2 mb-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                  <TestTube className="w-4 h-4" />
                  Tests Needed to Confirm ({currentStats.missingParams.length})
                </h4>
                <p className={`text-[10px] mb-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  If these results are positive, it would support this diagnosis:
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentStats.missingParams.slice(0, 15).map((m, idx) => (
                    <Badge 
                      key={idx}
                      variant="outline"
                      className={`text-[10px] cursor-pointer hover:scale-105 transition-transform ${
                        m.expected?.direction === 'increase' 
                          ? isDark ? 'border-red-800 text-red-400' : 'border-red-300 text-red-600'
                          : m.expected?.direction === 'decrease'
                            ? isDark ? 'border-blue-800 text-blue-400' : 'border-blue-300 text-blue-600'
                            : isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                      }`}
                      onClick={() => onParameterClick(m.param, 'missing', m.expected)}
                    >
                      {m.expected?.direction === 'increase' && <TrendingUp className="w-3 h-3 mr-1" />}
                      {m.expected?.direction === 'decrease' && <TrendingDown className="w-3 h-3 mr-1" />}
                      <HelpCircle className="w-3 h-3 mr-1 opacity-50" />
                      {m.param.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Expected Symptoms */}
            {currentProfile.comprehensive_model?.clinicalPresentation?.symptoms?.length > 0 && (
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
                <h4 className={`text-xs font-semibold flex items-center gap-2 mb-2 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                  <Stethoscope className="w-4 h-4" />
                  Expected Symptoms
                </h4>
                <div className="flex flex-wrap gap-1">
                  {currentProfile.comprehensive_model.clinicalPresentation.symptoms.map((symptom, idx) => {
                    const symptomName = typeof symptom === 'object' ? symptom.name : symptom;
                    const symptomKey = symptomName.toLowerCase().replace(/[\s-]+/g, '_');
                    const hasSymptom = findingsMap[symptomKey] || 
                      Object.keys(findingsMap).some(k => k.includes(symptomKey) || symptomKey.includes(k));
                    
                    return (
                      <Badge 
                        key={idx}
                        variant="outline"
                        className={`text-[10px] ${
                          hasSymptom 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                        onClick={() => onParameterClick(symptomName, 'symptom')}
                      >
                        {hasSymptom && <CheckCircle className="w-3 h-3 mr-1" />}
                        {symptomName}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clinical Signs */}
            {currentProfile.comprehensive_model?.clinicalPresentation?.signs?.length > 0 && (
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                <h4 className={`text-xs font-semibold flex items-center gap-2 mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  <Eye className="w-4 h-4" />
                  Clinical Signs
                </h4>
                <div className="flex flex-wrap gap-1">
                  {currentProfile.comprehensive_model.clinicalPresentation.signs.slice(0, 10).map((sign, idx) => {
                    const signName = typeof sign === 'object' ? sign.name : sign;
                    return (
                      <Badge key={idx} variant="outline" className={`text-[10px] ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        {signName}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Organ Systems with Parameters */}
            <div className="space-y-2">
              <h4 className={`text-xs font-semibold flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Activity className="w-4 h-4" />
                All Parameter Changes ({Object.keys(currentProfile.parameter_modifications || {}).length} organ systems)
              </h4>
              
              {Object.entries(currentProfile.parameter_modifications || {}).map(([organ, organData]) => {
                if (!organData || typeof organData !== 'object') return null;
                
                const OrganIcon = ORGAN_ICONS[organ.toLowerCase()] || ORGAN_ICONS.default;
                const isExpanded = expandedOrgans[organ];
                
                // Count matches for this organ
                let organMatched = 0;
                let organTotal = 0;
                
                Object.values(organData).forEach(category => {
                  if (typeof category !== 'object') return;
                  Object.entries(category).forEach(([paramName, expected]) => {
                    if (expected.direction && expected.direction !== 'no_change') {
                      organTotal++;
                      const paramKey = paramName.toLowerCase().replace(/[\s-]+/g, '_');
                      const actual = findingsMap[paramKey];
                      if (actual && (expected.direction === actual.direction || 
                          (expected.direction === 'increase' && actual.direction === 'increase') ||
                          (expected.direction === 'decrease' && actual.direction === 'decrease'))) {
                        organMatched++;
                      }
                    }
                  });
                });
                
                if (organTotal === 0) return null;

                return (
                  <div 
                    key={organ}
                    className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    {/* Organ Header */}
                    <button
                      onClick={() => toggleOrgan(organ)}
                      className={`w-full p-2 flex items-center justify-between transition-colors ${
                        isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <OrganIcon className={`w-4 h-4 ${
                          organMatched > 0 ? 'text-emerald-500' : isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-xs font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {organ.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-[10px] ${
                          organMatched > 0 ? 'text-emerald-500' : isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {organMatched}/{organTotal}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div 
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${organTotal > 0 ? (organMatched / organTotal) * 100 : 0}%` }}
                          />
                        </div>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </div>
                    </button>

                    {/* Organ Parameters */}
                    {isExpanded && (
                      <div className={`border-t p-2 space-y-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        {Object.entries(organData).map(([category, params]) => {
                          if (typeof params !== 'object') return null;
                          const paramEntries = Object.entries(params).filter(([_, v]) => v.direction && v.direction !== 'no_change');
                          if (paramEntries.length === 0) return null;

                          return (
                            <div key={category}>
                              <h6 className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {category.replace(/_/g, ' ')}
                              </h6>
                              <div className="grid grid-cols-2 gap-1">
                                {paramEntries.map(([paramName, expected]) => {
                                  const paramKey = paramName.toLowerCase().replace(/[\s-]+/g, '_');
                                  const actual = findingsMap[paramKey];
                                  const isMatched = actual && (expected.direction === actual.direction ||
                                    (expected.direction === 'increase' && actual.direction === 'increase') ||
                                    (expected.direction === 'decrease' && actual.direction === 'decrease'));
                                  
                                  return (
                                    <div 
                                      key={paramName}
                                      onClick={() => onParameterClick(paramName, 'parameter', expected)}
                                      className={`p-1.5 rounded cursor-pointer border transition-all text-[10px] ${
                                        getParameterColor(expected.direction, isMatched, isDark)
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium capitalize truncate">
                                          {paramName.replace(/_/g, ' ')}
                                        </span>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          {isMatched ? (
                                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                                          ) : (
                                            expected.direction === 'increase' ? (
                                              <TrendingUp className="w-3 h-3 text-red-500" />
                                            ) : (
                                              <TrendingDown className="w-3 h-3 text-blue-500" />
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Diagnostic Workup */}
            {currentProfile.comprehensive_model?.diagnosticWorkup && (
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
                <h4 className={`text-xs font-semibold flex items-center gap-2 mb-2 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                  <ClipboardCheck className="w-4 h-4" />
                  Recommended Workup
                </h4>
                <div className="space-y-1">
                  {currentProfile.comprehensive_model.diagnosticWorkup.laboratory?.slice(0, 5).map((lab, idx) => (
                    <div key={idx} className={`text-[10px] ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
                      • {typeof lab === 'object' ? lab.name || lab.test : lab}
                    </div>
                  ))}
                  {currentProfile.comprehensive_model.diagnosticWorkup.imaging?.slice(0, 3).map((img, idx) => (
                    <div key={idx} className={`text-[10px] ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
                      • {typeof img === 'object' ? img.modality || img.name : img}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Profile Available */}
      {!loading && !currentProfile && currentDiseaseName && (
        <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-500" />
          <p className="text-sm">Disease profile not found: {currentDiseaseName}</p>
        </div>
      )}
    </div>
  );
};

export default DifferentialDashboard;
