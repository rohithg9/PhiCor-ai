import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Heart, Brain, FlaskConical, Activity, Stethoscope, 
  TrendingUp, TrendingDown, Minus, CheckCircle, XCircle,
  AlertTriangle, ChevronDown, ChevronUp, Target, Zap,
  Pill, Gauge, Eye, Ear, Microscope, Dna, FileText,
  Shield, Thermometer, Beaker, Users, Loader2
} from 'lucide-react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  default: Target
};

// Category labels for display
const CATEGORY_LABELS = {
  dna: 'DNA & Gene Expression',
  gene_expression: 'Gene Expression',
  cellular_changes: 'Cellular Changes',
  molecular: 'Molecular Markers',
  biomarkers: 'Biomarkers',
  proteins: 'Protein Markers',
  enzymes: 'Enzymes',
  hormones: 'Hormones',
  electrolytes: 'Electrolytes',
  blood_gases: 'Blood Gases',
  hemodynamics: 'Hemodynamics',
  vitals: 'Vital Signs',
  functional: 'Functional Parameters',
  imaging: 'Imaging Findings',
  physical_exam: 'Physical Examination',
  symptoms: 'Symptoms',
  signs: 'Clinical Signs'
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

  // Load disease profiles for all differentials
  useEffect(() => {
    const loadDiseaseProfiles = async () => {
      if (differentials.length === 0) return;
      
      setLoading(true);
      const profiles = {};
      const stats = {};
      
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
              // Calculate match stats
              stats[diseaseName] = calculateMatchStats(data[0], patientFindings, symptoms);
            }
          }
        } catch (error) {
          console.error('Error loading disease profile:', error);
        }
      }
      
      setDiseaseProfiles(profiles);
      setMatchStats(stats);
      setLoading(false);
      
      // Auto-expand first few organs
      if (Object.keys(profiles).length > 0) {
        const firstProfile = Object.values(profiles)[0];
        const organs = Object.keys(firstProfile?.parameter_modifications || {});
        const initialExpanded = {};
        organs.slice(0, 3).forEach(organ => {
          initialExpanded[organ] = true;
        });
        setExpandedOrgans(initialExpanded);
      }
    };
    
    loadDiseaseProfiles();
  }, [differentials, patientFindings, symptoms]);

  // Calculate match statistics for a disease
  const calculateMatchStats = (disease, findings, syms) => {
    if (!disease?.parameter_modifications) {
      return { total: 0, matched: 0, percentage: 0 };
    }
    
    // Create lookup map for patient findings
    const findingsMap = {};
    findings.forEach(f => {
      const key = (f.parameterId || f.parameterName || '').toLowerCase().replace(/\s+/g, '_');
      if (key) {
        findingsMap[key] = f;
        // Add common aliases
        if (key.includes('wbc') || key.includes('white_blood')) findingsMap['wbc_count'] = f;
        if (key.includes('temperature') || key.includes('temp')) findingsMap['body_temp'] = f;
        if (key.includes('heart_rate') || key.includes('hr')) findingsMap['resting_hr'] = f;
        if (key.includes('respiratory') || key.includes('rr')) findingsMap['respiratory_rate'] = f;
        if (key.includes('o2') || key.includes('spo2') || key.includes('saturation')) findingsMap['oxygen_saturation'] = f;
        if (key.includes('bp') || key.includes('blood_pressure')) {
          findingsMap['systolic_bp'] = f;
          findingsMap['diastolic_bp'] = f;
        }
        if (key.includes('pco2') || key.includes('co2')) findingsMap['pco2'] = f;
      }
    });
    
    // Create lookup for symptoms
    const symptomsMap = {};
    syms.forEach(s => {
      const name = (typeof s === 'object' ? s.parameterName || s.name : s || '').toLowerCase();
      if (name) symptomsMap[name] = true;
    });
    
    let total = 0;
    let matched = 0;
    
    // Count matches in parameter modifications
    Object.values(disease.parameter_modifications).forEach(organData => {
      if (typeof organData !== 'object') return;
      Object.values(organData).forEach(category => {
        if (typeof category !== 'object') return;
        Object.entries(category).forEach(([paramName, expected]) => {
          if (expected.direction && expected.direction !== 'no_change') {
            total++;
            const paramKey = paramName.toLowerCase();
            const actual = findingsMap[paramKey];
            if (actual) {
              // Check if direction matches
              const actualDirection = actual.direction || (actual.status === 'elevated' ? 'increase' : actual.status === 'decreased' ? 'decrease' : '');
              if (expected.direction === actualDirection) {
                matched++;
              }
            }
          }
        });
      });
    });
    
    // Count symptom matches from comprehensive model
    const clinicalPres = disease.comprehensive_model?.clinicalPresentation;
    if (clinicalPres?.symptoms) {
      clinicalPres.symptoms.forEach(s => {
        const symptomName = (typeof s === 'object' ? s.name : s || '').toLowerCase();
        if (symptomName) {
          total++;
          // Check if patient has this symptom
          const hasSymptom = Object.keys(symptomsMap).some(ps => 
            ps.includes(symptomName) || symptomName.includes(ps)
          );
          if (hasSymptom) matched++;
        }
      });
    }
    
    return { 
      total, 
      matched, 
      percentage: total > 0 ? Math.round((matched / total) * 100) : 0 
    };
  };

  const toggleOrgan = (organ) => {
    setExpandedOrgans(prev => ({
      ...prev,
      [organ]: !prev[organ]
    }));
  };

  // Get match status for a specific parameter
  const getParamMatchStatus = (paramName, expected, findingsMap) => {
    const paramKey = paramName.toLowerCase();
    const actual = findingsMap[paramKey];
    
    if (!actual) return { status: 'unknown', actual: null };
    
    const actualDirection = actual.direction || 
      (actual.status === 'elevated' || actual.status === 'high' ? 'increase' : 
       actual.status === 'decreased' || actual.status === 'low' ? 'decrease' : 'normal');
    
    if (expected.direction === actualDirection) {
      return { status: 'match', actual };
    }
    return { status: 'mismatch', actual };
  };

  // Create findings map for quick lookup
  const findingsMap = React.useMemo(() => {
    const map = {};
    patientFindings.forEach(f => {
      const key = (f.parameterId || f.parameterName || '').toLowerCase().replace(/\s+/g, '_');
      if (key) {
        map[key] = f;
        // Add aliases
        if (key.includes('wbc')) map['wbc_count'] = f;
        if (key.includes('temperature')) map['body_temp'] = f;
        if (key.includes('heart_rate')) map['resting_hr'] = f;
        if (key.includes('o2') || key.includes('spo2')) map['oxygen_saturation'] = f;
        if (key.includes('pco2')) map['pco2'] = f;
        if (key.includes('respiratory')) map['respiratory_rate'] = f;
      }
    });
    return map;
  }, [patientFindings]);

  // Create symptoms set for quick lookup
  const symptomsSet = React.useMemo(() => {
    const set = new Set();
    symptoms.forEach(s => {
      const name = (typeof s === 'object' ? s.parameterName || s.name : s || '').toLowerCase();
      if (name) set.add(name);
    });
    return set;
  }, [symptoms]);

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
  const currentStats = matchStats[currentDiseaseName] || { total: 0, matched: 0, percentage: 0 };

  return (
    <div className={`${className}`}>
      {/* Differential Tabs with Match Counts */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="w-5 h-5 text-emerald-500" />
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Differential Diagnosis Dashboard
          </h3>
        </div>
        
        <Tabs value={String(selectedDifferential)} onValueChange={(v) => setSelectedDifferential(Number(v))}>
          <TabsList className={`w-full flex-wrap h-auto gap-1 p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            {topDifferentials.map((diff, idx) => {
              const name = diff.diseaseName || diff.name;
              const stats = matchStats[name] || { matched: 0, total: 0, percentage: 0 };
              const isActive = selectedDifferential === idx;
              
              return (
                <TabsTrigger 
                  key={idx} 
                  value={String(idx)}
                  className={`flex-1 min-w-[150px] flex flex-col items-start p-2 rounded-lg transition-all ${
                    isActive 
                      ? isDark ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'
                      : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      idx === 0 
                        ? 'bg-emerald-500 text-white' 
                        : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-medium truncate flex-1 text-left">
                      {name?.split(' ').slice(0, 3).join(' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 w-full">
                    <Progress 
                      value={stats.percentage} 
                      className={`h-1.5 flex-1 ${isActive ? 'bg-white/30' : ''}`}
                    />
                    <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-emerald-500'}`}>
                      {stats.matched}/{stats.total}
                    </span>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className={`ml-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading disease profiles...
          </span>
        </div>
      )}

      {/* Disease Profile Content */}
      {!loading && currentProfile && (
        <div className="space-y-4">
          {/* Disease Header with Match Summary */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentProfile.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  {currentProfile.icd10 && (
                    <Badge variant="outline" className="text-xs">
                      ICD-10: {currentProfile.icd10}
                    </Badge>
                  )}
                  {currentProfile.category && (
                    <Badge variant="outline" className="text-xs">
                      {currentProfile.category}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Match Score Circle */}
              <div className="text-center">
                <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <svg className="absolute inset-0 w-20 h-20 -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke={isDark ? '#374151' : '#e5e7eb'}
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="#10b981"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - currentStats.percentage / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-xl font-bold text-emerald-500">{currentStats.percentage}%</span>
                  </div>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentStats.matched}/{currentStats.total} match
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Presentation - Symptoms */}
          {currentProfile.comprehensive_model?.clinicalPresentation?.symptoms?.length > 0 && (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
              <h4 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                <Stethoscope className="w-4 h-4" />
                Expected Symptoms
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentProfile.comprehensive_model.clinicalPresentation.symptoms.map((symptom, idx) => {
                  const symptomName = typeof symptom === 'object' ? symptom.name : symptom;
                  const hasSymptom = Array.from(symptomsSet).some(ps => 
                    ps.includes(symptomName.toLowerCase()) || symptomName.toLowerCase().includes(ps)
                  );
                  
                  return (
                    <Badge 
                      key={idx}
                      variant="outline"
                      className={`text-xs cursor-pointer transition-all ${
                        hasSymptom 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                          : isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                      onClick={() => onParameterClick(symptomName, 'symptom')}
                    >
                      {hasSymptom && <CheckCircle className="w-3 h-3 mr-1" />}
                      {symptomName}
                      {typeof symptom === 'object' && symptom.frequency && (
                        <span className="ml-1 opacity-60">({symptom.frequency})</span>
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clinical Signs */}
          {currentProfile.comprehensive_model?.clinicalPresentation?.signs?.length > 0 && (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                <Eye className="w-4 h-4" />
                Clinical Signs
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentProfile.comprehensive_model.clinicalPresentation.signs.slice(0, 10).map((sign, idx) => {
                  const signName = typeof sign === 'object' ? sign.name : sign;
                  return (
                    <Badge 
                      key={idx}
                      variant="outline"
                      className={`text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {signName}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Parameter Modifications by Organ System */}
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-3 pr-2">
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
                      const { status } = getParamMatchStatus(paramName, expected, findingsMap);
                      if (status === 'match') organMatched++;
                    }
                  });
                });
                
                if (organTotal === 0) return null;

                return (
                  <div 
                    key={organ}
                    className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    {/* Organ Header */}
                    <button
                      onClick={() => toggleOrgan(organ)}
                      className={`w-full p-3 flex items-center justify-between transition-colors ${
                        isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          organMatched > 0 
                            ? isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'
                            : isDark ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <OrganIcon className={`w-5 h-5 ${
                            organMatched > 0 ? 'text-emerald-500' : isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        </div>
                        <div className="text-left">
                          <span className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {organ.replace(/_/g, ' ')}
                          </span>
                          <span className={`ml-2 text-sm ${
                            organMatched > 0 ? 'text-emerald-500' : isDark ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {organMatched}/{organTotal} match
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-20 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div 
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${organTotal > 0 ? (organMatched / organTotal) * 100 : 0}%` }}
                          />
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Organ Parameters */}
                    {isExpanded && (
                      <div className={`border-t p-3 space-y-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        {Object.entries(organData).map(([category, params]) => {
                          if (typeof params !== 'object') return null;
                          const paramEntries = Object.entries(params).filter(([_, v]) => v.direction);
                          if (paramEntries.length === 0) return null;

                          return (
                            <div key={category}>
                              <h5 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {CATEGORY_LABELS[category] || category.replace(/_/g, ' ')}
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {paramEntries.map(([paramName, expected]) => {
                                  const { status, actual } = getParamMatchStatus(paramName, expected, findingsMap);
                                  
                                  return (
                                    <div 
                                      key={paramName}
                                      onClick={() => onParameterClick(paramName, 'parameter', expected)}
                                      className={`p-2 rounded-lg cursor-pointer transition-all ${
                                        status === 'match' 
                                          ? isDark ? 'bg-emerald-900/30 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'
                                          : status === 'mismatch'
                                            ? isDark ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'
                                            : isDark ? 'bg-gray-700/30 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          {status === 'match' ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                          ) : status === 'mismatch' ? (
                                            <XCircle className="w-4 h-4 text-red-500" />
                                          ) : (
                                            <Minus className="w-4 h-4 text-gray-400" />
                                          )}
                                          <span className={`text-sm font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {paramName.replace(/_/g, ' ')}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {/* Expected */}
                                          <div className="flex items-center gap-1">
                                            {expected.direction === 'increase' ? (
                                              <TrendingUp className="w-3 h-3 text-red-500" />
                                            ) : expected.direction === 'decrease' ? (
                                              <TrendingDown className="w-3 h-3 text-blue-500" />
                                            ) : (
                                              <Minus className="w-3 h-3 text-gray-400" />
                                            )}
                                            {expected.change_percent > 0 && (
                                              <span className="text-xs text-gray-500">
                                                {expected.change_percent}%
                                              </span>
                                            )}
                                          </div>
                                          {/* Actual */}
                                          {actual && (
                                            <span className={`text-xs font-medium ${
                                              status === 'match' ? 'text-emerald-500' : 'text-red-500'
                                            }`}>
                                              {actual.value} {actual.unit}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {expected.evidence && (
                                        <p className={`text-xs mt-1 truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                          {expected.evidence}
                                        </p>
                                      )}
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
          </ScrollArea>

          {/* Diagnostic Workup */}
          {currentProfile.comprehensive_model?.diagnosticWorkup && (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
              <h4 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                <Beaker className="w-4 h-4" />
                Recommended Diagnostic Workup
              </h4>
              <div className="space-y-2">
                {currentProfile.comprehensive_model.diagnosticWorkup.laboratory?.slice(0, 5).map((lab, idx) => (
                  <div key={idx} className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
                    • {typeof lab === 'object' ? lab.name || lab.test : lab}
                  </div>
                ))}
                {currentProfile.comprehensive_model.diagnosticWorkup.imaging?.slice(0, 3).map((img, idx) => (
                  <div key={idx} className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
                    • {typeof img === 'object' ? img.modality || img.name : img}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Profile Available */}
      {!loading && !currentProfile && currentDiseaseName && (
        <div className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <p>Disease profile not found in database: {currentDiseaseName}</p>
        </div>
      )}
    </div>
  );
};

export default DifferentialDashboard;
