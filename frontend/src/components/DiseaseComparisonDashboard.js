import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Heart, Brain, FlaskConical, Activity, Stethoscope, 
  TrendingUp, TrendingDown, Minus, CheckCircle, XCircle,
  AlertTriangle, ChevronDown, ChevronUp, Target, Zap,
  Pill, Gauge, Eye, Ear
} from 'lucide-react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

// Organ system icons
const ORGAN_ICONS = {
  heart: Heart,
  blood: Activity,
  kidneys: FlaskConical,
  liver: FlaskConical,
  lungs: Activity,
  brain: Brain,
  cellular: Zap,
  immune: Stethoscope,
  thyroid: Gauge,
  pancreas: FlaskConical,
  adrenal: Pill,
  bone: Activity,
  muscle: Activity,
  skin: Eye,
  eyes: Eye,
  ears: Ear,
  gi: FlaskConical,
  default: Target
};

// Get direction icon
const getDirectionIcon = (direction) => {
  if (direction === 'increase') return <TrendingUp className="w-4 h-4 text-red-500" />;
  if (direction === 'decrease') return <TrendingDown className="w-4 h-4 text-blue-500" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
};

// Get match status
const getMatchStatus = (expected, actual) => {
  if (!actual) return 'unknown';
  if (expected.direction === 'increase' && actual.direction === 'increase') return 'match';
  if (expected.direction === 'decrease' && actual.direction === 'decrease') return 'match';
  if (expected.direction === 'no_change' && actual.direction === 'normal') return 'match';
  if (expected.direction === actual.direction) return 'match';
  return 'mismatch';
};

const DiseaseComparisonDashboard = ({ 
  disease, 
  patientFindings = [], 
  onClose,
  className = ''
}) => {
  const { isDark } = useTheme();
  const [diseaseData, setDiseaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrgans, setExpandedOrgans] = useState({});
  const [matchStats, setMatchStats] = useState({ total: 0, matched: 0, mismatched: 0, unknown: 0 });

  // Fetch disease data from API
  useEffect(() => {
    const fetchDiseaseData = async () => {
      if (!disease?.diseaseName && !disease?.name) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const diseaseName = disease.diseaseName || disease.name;
        const apiUrl = process.env.REACT_APP_BACKEND_URL;
        
        // Try to fetch the specific disease data
        const response = await fetch(`${apiUrl}/api/diseases/search?q=${encodeURIComponent(diseaseName)}&limit=1`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setDiseaseData(data[0]);
            
            // Auto-expand organs with matches
            const organs = Object.keys(data[0].parameter_modifications || {});
            const initialExpanded = {};
            organs.forEach((organ, idx) => {
              if (idx < 4) initialExpanded[organ] = true;
            });
            setExpandedOrgans(initialExpanded);
          }
        }
      } catch (error) {
        console.error('Error fetching disease data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiseaseData();
  }, [disease]);

  // Calculate match statistics
  useEffect(() => {
    if (!diseaseData?.parameter_modifications) return;

    let total = 0;
    let matched = 0;
    let mismatched = 0;
    let unknown = 0;

    // Create a map of patient findings for quick lookup
    const patientFindingsMap = {};
    patientFindings.forEach(f => {
      const key = f.parameterId?.toLowerCase() || f.parameterName?.toLowerCase();
      if (key) {
        patientFindingsMap[key] = f;
      }
    });

    // Count matches across all organs
    Object.values(diseaseData.parameter_modifications).forEach(organData => {
      if (typeof organData !== 'object') return;
      Object.values(organData).forEach(category => {
        if (typeof category !== 'object') return;
        Object.entries(category).forEach(([paramName, expected]) => {
          if (expected.direction && expected.direction !== 'no_change') {
            total++;
            const actual = patientFindingsMap[paramName.toLowerCase()];
            const status = getMatchStatus(expected, actual);
            if (status === 'match') matched++;
            else if (status === 'mismatch') mismatched++;
            else unknown++;
          }
        });
      });
    });

    setMatchStats({ total, matched, mismatched, unknown });
  }, [diseaseData, patientFindings]);

  // Create a map of patient findings for quick lookup
  const patientFindingsMap = React.useMemo(() => {
    const map = {};
    patientFindings.forEach(f => {
      const key = f.parameterId?.toLowerCase() || f.parameterName?.toLowerCase();
      if (key) {
        map[key] = f;
        // Also add common aliases
        if (key === 'wbc') map['wbc_count'] = f;
        if (key === 'white_blood_cell') map['wbc_count'] = f;
        if (key === 'temperature') map['temp'] = f;
        if (key === 'heart_rate') map['resting_hr'] = f;
        if (key === 'hr') map['resting_hr'] = f;
        if (key === 'blood_pressure') {
          map['systolic_bp'] = f;
          map['diastolic_bp'] = f;
        }
        if (key === 'spo2') map['oxygen_saturation'] = f;
        if (key === 'o2sat') map['oxygen_saturation'] = f;
      }
    });
    return map;
  }, [patientFindings]);

  const toggleOrgan = (organ) => {
    setExpandedOrgans(prev => ({
      ...prev,
      [organ]: !prev[organ]
    }));
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          <span className={`ml-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading disease profile...</span>
        </div>
      </div>
    );
  }

  if (!diseaseData) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Unable to load disease profile data.
          </p>
        </div>
      </div>
    );
  }

  const paramMods = diseaseData.parameter_modifications || {};
  const organSystems = Object.keys(paramMods);

  return (
    <div className={`${className}`}>
      {/* Header with Match Statistics */}
      <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-emerald-50 border border-emerald-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {diseaseData.name}
            </h3>
            {diseaseData.icd10 && (
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                ICD-10: {diseaseData.icd10}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <span className={`text-2xl font-bold ${matchStats.matched > 0 ? 'text-emerald-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {matchStats.matched}
              </span>
              <span className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/</span>
              <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {matchStats.total}
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Findings Match
            </p>
          </div>
        </div>

        {/* Match Progress Bar */}
        <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${matchStats.total > 0 ? (matchStats.matched / matchStats.total) * 100 : 0}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Match ({matchStats.matched})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mismatch ({matchStats.mismatched})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Unknown ({matchStats.unknown})</span>
          </div>
        </div>
      </div>

      {/* Organ Systems */}
      <ScrollArea className="max-h-[500px]">
        <div className="space-y-3 pr-2">
          {organSystems.map(organ => {
            const organData = paramMods[organ];
            if (!organData || typeof organData !== 'object') return null;

            const OrganIcon = ORGAN_ICONS[organ.toLowerCase()] || ORGAN_ICONS.default;
            const isExpanded = expandedOrgans[organ];

            // Count matches for this organ
            let organMatches = 0;
            let organTotal = 0;
            Object.values(organData).forEach(category => {
              if (typeof category !== 'object') return;
              Object.entries(category).forEach(([paramName, expected]) => {
                if (expected.direction && expected.direction !== 'no_change') {
                  organTotal++;
                  const actual = patientFindingsMap[paramName.toLowerCase()];
                  if (getMatchStatus(expected, actual) === 'match') organMatches++;
                }
              });
            });

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
                      organMatches > 0 
                        ? isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'
                        : isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <OrganIcon className={`w-5 h-5 ${
                        organMatches > 0 ? 'text-emerald-500' : isDark ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="text-left">
                      <span className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {organ.replace('_', ' ')}
                      </span>
                      <span className={`ml-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {organMatches}/{organTotal} match
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Mini match bar */}
                    <div className={`w-16 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${organTotal > 0 ? (organMatches / organTotal) * 100 : 0}%` }}
                      />
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Organ Details */}
                {isExpanded && (
                  <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    {Object.entries(organData).map(([category, params]) => {
                      if (typeof params !== 'object') return null;
                      const paramEntries = Object.entries(params).filter(([_, v]) => v.direction);
                      if (paramEntries.length === 0) return null;

                      return (
                        <div key={category} className="p-3">
                          <h5 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {category.replace('_', ' ')}
                          </h5>
                          <div className="space-y-2">
                            {paramEntries.map(([paramName, expected]) => {
                              const actual = patientFindingsMap[paramName.toLowerCase()];
                              const matchStatus = getMatchStatus(expected, actual);
                              const hasActualValue = actual?.value !== undefined && actual?.value !== '';

                              return (
                                <div 
                                  key={paramName}
                                  className={`flex items-center justify-between p-2 rounded-lg ${
                                    matchStatus === 'match' 
                                      ? isDark ? 'bg-emerald-900/20 border border-emerald-800/50' : 'bg-emerald-50 border border-emerald-200'
                                      : matchStatus === 'mismatch'
                                        ? isDark ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'
                                        : isDark ? 'bg-gray-700/30' : 'bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    {/* Match indicator */}
                                    {matchStatus === 'match' ? (
                                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    ) : matchStatus === 'mismatch' ? (
                                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                    ) : (
                                      <Minus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    )}
                                    
                                    {/* Parameter name and expected direction */}
                                    <div className="flex-1 min-w-0">
                                      <span className={`text-sm font-medium capitalize truncate block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {paramName.replace(/_/g, ' ')}
                                      </span>
                                      {expected.evidence && (
                                        <span className={`text-xs truncate block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                          {expected.evidence}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Values comparison */}
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    {/* Expected */}
                                    <div className="text-center">
                                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Expected</p>
                                      <div className="flex items-center gap-1">
                                        {getDirectionIcon(expected.direction)}
                                        {expected.change_percent > 0 && (
                                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {expected.change_percent}%
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Actual */}
                                    <div className="text-center min-w-[60px]">
                                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Patient</p>
                                      {hasActualValue ? (
                                        <div className="flex items-center gap-1 justify-center">
                                          {getDirectionIcon(actual.direction)}
                                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {actual.value}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>—</span>
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
      </ScrollArea>

      {/* Clinical Presentation from Comprehensive Model */}
      {diseaseData.comprehensive_model?.clinicalPresentation && (
        <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Stethoscope className="w-4 h-4 text-purple-500" />
            Expected Clinical Presentation
          </h4>
          <div className="space-y-3">
            {/* Symptoms */}
            {diseaseData.comprehensive_model.clinicalPresentation.symptoms?.length > 0 && (
              <div>
                <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Symptoms</p>
                <div className="flex flex-wrap gap-1">
                  {diseaseData.comprehensive_model.clinicalPresentation.symptoms.slice(0, 8).map((symptom, idx) => {
                    const symptomName = typeof symptom === 'object' ? symptom.name : symptom;
                    const patientHas = patientFindings.some(f => 
                      f.parameterName?.toLowerCase().includes(symptomName.toLowerCase()) ||
                      f.parameterId?.toLowerCase().includes(symptomName.toLowerCase())
                    );
                    return (
                      <Badge 
                        key={idx} 
                        variant="outline"
                        className={`text-xs ${
                          patientHas 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {patientHas && <CheckCircle className="w-3 h-3 mr-1" />}
                        {symptomName}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Signs */}
            {diseaseData.comprehensive_model.clinicalPresentation.signs?.length > 0 && (
              <div>
                <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Signs</p>
                <div className="flex flex-wrap gap-1">
                  {diseaseData.comprehensive_model.clinicalPresentation.signs.slice(0, 6).map((sign, idx) => {
                    const signName = typeof sign === 'object' ? sign.name : sign;
                    return (
                      <Badge key={idx} variant="outline" className={`text-xs ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                        {signName}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className={`text-xs mt-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        This comparison is based on PhiCor&apos;s comprehensive disease model. Actual clinical presentation may vary.
      </p>
    </div>
  );
};

export default DiseaseComparisonDashboard;
