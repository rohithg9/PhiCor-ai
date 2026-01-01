import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import FeatureNav from '../components/FeatureNav';
import { 
  Search, Plus, Trash2, FileText, Upload, AlertTriangle,
  CheckCircle, ChevronDown, ChevronUp, Activity, User, Clipboard,
  TrendingUp, TrendingDown, Minus, Brain, FlaskConical, Heart,
  Stethoscope, Gauge, Info, Sparkles, Target, Zap, Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import DiseaseDetailPanel from '../components/DiseaseDetailPanel';
import { 
  getDifferentialDiagnosis, 
  parseClinicalText, 
  analyzePatientCase,
  getAllParameters,
  NORMAL_RANGES,
} from '../data/bidirectionalMapping';
import { ORGAN_MODELS } from '../data/organModels';

// Build comprehensive normal ranges from organ models
const buildAllNormalRanges = () => {
  const ranges = { ...NORMAL_RANGES };
  Object.values(ORGAN_MODELS).forEach(organ => {
    const categories = ['geometry', 'physiology', 'structure', 'pressures', 'cellular'];
    categories.forEach(cat => {
      const categoryData = organ[cat];
      if (!categoryData?.parameters) return;
      categoryData.parameters.forEach(param => {
        if (param.range && Array.isArray(param.range) && param.range.length === 2) {
          const [min, max] = param.range;
          ranges[param.id] = {
            min, max,
            unit: param.unit || '',
            criticalLow: Math.max(0, min - (min * 0.5)),
            criticalHigh: max + (max * 0.5),
          };
        }
      });
    });
  });
  return ranges;
};

const EXTENDED_NORMAL_RANGES = buildAllNormalRanges();

const DifferentialPage = () => {
  const { isDark } = useTheme();
  
  // State management
  const [activeTab, setActiveTab] = useState('parameters');
  const [selectedOrgan, setSelectedOrgan] = useState('');
  const [selectedParameter, setSelectedParameter] = useState('');
  const [parameterValue, setParameterValue] = useState(50);
  const [sliderValue, setSliderValue] = useState([50]);
  const [abnormalFindings, setAbnormalFindings] = useState([]);
  const [clinicalText, setClinicalText] = useState('');
  const [differentialResults, setDifferentialResults] = useState([]);
  const [expandedDisease, setExpandedDisease] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Get all parameters organized by organ
  const allParameters = useMemo(() => getAllParameters(), []);
  
  // Get organs list
  const organs = useMemo(() => {
    return Object.entries(ORGAN_MODELS).map(([id, data]) => ({
      id,
      name: data.name || id.charAt(0).toUpperCase() + id.slice(1),
      icon: data.icon || '🫀',
    }));
  }, []);
  
  // Get parameters for selected organ
  const organParameters = useMemo(() => {
    if (!selectedOrgan) return [];
    const organ = ORGAN_MODELS[selectedOrgan];
    if (!organ) return [];
    
    const params = [];
    const categories = ['geometry', 'physiology', 'structure', 'pressures', 'cellular'];
    categories.forEach(cat => {
      const categoryData = organ[cat];
      if (categoryData?.parameters) {
        categoryData.parameters.forEach(param => {
          if (param.range && Array.isArray(param.range) && param.range.length === 2) {
            params.push({
              ...param,
              category: cat,
              organId: selectedOrgan,
            });
          }
        });
      }
    });
    return params;
  }, [selectedOrgan]);
  
  // Get normal range for selected parameter
  const currentNormalRange = useMemo(() => {
    if (!selectedParameter) return null;
    const param = organParameters.find(p => p.id === selectedParameter);
    if (!param) return EXTENDED_NORMAL_RANGES[selectedParameter] || null;
    
    const [min, max] = param.range;
    return {
      min, max,
      unit: param.unit || '',
      criticalLow: Math.max(0, min - (min * 0.5)),
      criticalHigh: max + (max * 0.5),
      name: param.name,
    };
  }, [selectedParameter, organParameters]);
  
  // Update slider when parameter changes
  useEffect(() => {
    if (currentNormalRange) {
      const midpoint = (currentNormalRange.min + currentNormalRange.max) / 2;
      setParameterValue(midpoint);
      setSliderValue([midpoint]);
    }
  }, [selectedParameter, currentNormalRange]);
  
  // Determine value status
  const getValueStatus = useCallback((value, range) => {
    if (!range) return 'unknown';
    if (value < range.criticalLow) return 'critical-low';
    if (value < range.min) return 'low';
    if (value > range.criticalHigh) return 'critical-high';
    if (value > range.max) return 'high';
    return 'normal';
  }, []);
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical-low': return 'bg-red-500';
      case 'low': return 'bg-blue-500';
      case 'normal': return 'bg-green-500';
      case 'high': return 'bg-orange-500';
      case 'critical-high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Add abnormal finding
  const addFinding = useCallback(() => {
    if (!selectedParameter || !currentNormalRange) return;
    
    const status = getValueStatus(parameterValue, currentNormalRange);
    if (status === 'normal') {
      alert('Value is within normal range. Adjust to add an abnormal finding.');
      return;
    }
    
    const direction = parameterValue > currentNormalRange.max ? 'increase' : 'decrease';
    const deviation = direction === 'increase' 
      ? ((parameterValue - currentNormalRange.max) / currentNormalRange.max * 100).toFixed(0)
      : ((currentNormalRange.min - parameterValue) / currentNormalRange.min * 100).toFixed(0);
    
    const newFinding = {
      id: `${selectedOrgan}-${selectedParameter}-${Date.now()}`,
      organ: selectedOrgan,
      parameterId: selectedParameter,
      parameterName: currentNormalRange.name || selectedParameter,
      value: parameterValue,
      unit: currentNormalRange.unit,
      direction,
      severity: status.includes('critical') ? 'critical' : 'moderate',
      deviation: `${deviation}%`,
      normalRange: `${currentNormalRange.min}-${currentNormalRange.max}`,
    };
    
    setAbnormalFindings(prev => [...prev, newFinding]);
    setSelectedParameter('');
  }, [selectedParameter, parameterValue, currentNormalRange, selectedOrgan, getValueStatus]);
  
  // Remove finding
  const removeFinding = (id) => {
    setAbnormalFindings(prev => prev.filter(f => f.id !== id));
  };
  
  // Run differential diagnosis
  const runDiagnosis = useCallback((overrideFindings = null) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      let results = [];
      const findings = overrideFindings || abnormalFindings;
      
      if (findings.length > 0) {
        const findingsForAnalysis = findings.map(f => ({
          parameterId: f.parameterId,
          direction: f.direction,
          severity: f.severity,
          value: f.value,
          diseases: f.diseases || [],
        }));
        results = getDifferentialDiagnosis(findingsForAnalysis);
        
        // Also add disease suggestions from imaging findings
        const imagingDiseases = new Set();
        findings.forEach(f => {
          if (f.diseases && f.diseases.length > 0) {
            f.diseases.forEach(d => imagingDiseases.add(d));
          }
        });
        
        // Boost scores for diseases found in imaging findings
        results = results.map(r => {
          const icdBase = r.icd10?.split('_')[0] || r.icd10?.split('.')[0];
          if (imagingDiseases.has(r.icd10) || imagingDiseases.has(icdBase)) {
            return { ...r, probabilityScore: Math.min(100, Math.round(((r.probabilityScore || 0) + 20) * 10) / 10) };
          }
          return r;
        });
      }
      
      if (clinicalText.trim()) {
        const textAnalysis = analyzePatientCase(clinicalText);
        if (textAnalysis.differential?.length > 0) {
          // Merge with existing results
          const existingCodes = new Set(results.map(r => r.icd10));
          textAnalysis.differential.forEach(d => {
            if (!existingCodes.has(d.icd10)) {
              results.push(d);
            }
          });
        }
      }
      
      // Sort by probability
      results.sort((a, b) => (b.probabilityScore || 0) - (a.probabilityScore || 0));
      
      setDifferentialResults(results.slice(0, 20));
      setIsAnalyzing(false);
    }, 500);
  }, [abnormalFindings, clinicalText]);
  
  // Auto-run diagnosis when findings change
  useEffect(() => {
    if (abnormalFindings.length > 0 || clinicalText.trim()) {
      runDiagnosis();
    } else {
      setDifferentialResults([]);
    }
  }, [abnormalFindings, runDiagnosis]);
  
  // Analyze clinical text
  const handleAnalyzeText = () => {
    if (!clinicalText.trim()) return;
    
    setIsAnalyzing(true);
    const parsed = parseClinicalText(clinicalText);
    
    console.log('Parsed clinical text:', parsed);
    
    if (parsed.findings?.length > 0) {
      const newFindings = parsed.findings.map((f, idx) => ({
        id: `text-${Date.now()}-${idx}`,
        organ: f.organ || 'unknown',
        parameterId: f.parameterId,
        parameterName: f.name || f.parameterId,
        value: f.value || '',
        unit: f.unit || '',
        direction: f.direction,
        severity: f.severity || 'moderate',
        deviation: '',
        normalRange: f.normalRange || '',
        source: 'clinical-text',
        diseases: f.diseases || [],
      }));
      
      setAbnormalFindings(prev => {
        const updated = [...prev, ...newFindings];
        // Trigger diagnosis after state update
        setTimeout(() => {
          runDiagnosis(updated);
        }, 100);
        return updated;
      });
    } else {
      setIsAnalyzing(false);
      alert('No clinical findings detected. Try adding specific findings like "dilated ventricle", "pulmonary congestion", "pleural effusion", or lab values like "BNP 500".');
    }
  };
  
  // Get probability color
  const getProbabilityColor = (score) => {
    if (score >= 70) return 'from-green-500 to-emerald-500';
    if (score >= 50) return 'from-yellow-500 to-amber-500';
    if (score >= 30) return 'from-orange-500 to-red-500';
    return 'from-gray-500 to-gray-600';
  };
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <FeatureNav />
      
      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-serif text-3xl font-bold">Δ</span>
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Differential Diagnosis
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                AI-powered diagnostic reasoning engine
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Panel */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className={`rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
              <div className="flex border-b border-gray-800">
                {[
                  { id: 'parameters', icon: FlaskConical, label: 'Parameters' },
                  { id: 'clinical', icon: FileText, label: 'Clinical Text' },
                  { id: 'patient', icon: User, label: 'Test Patient' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? `${isDark ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500' : 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500'}`
                        : `${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="p-4">
                {/* Parameters Tab */}
                {activeTab === 'parameters' && (
                  <div className="space-y-4">
                    {/* Organ Selection */}
                    <div>
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Select Organ System
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                        {organs.slice(0, 12).map(organ => (
                          <button
                            key={organ.id}
                            onClick={() => {
                              setSelectedOrgan(organ.id);
                              setSelectedParameter('');
                            }}
                            className={`p-2 rounded-xl text-center transition-all ${
                              selectedOrgan === organ.id
                                ? 'bg-emerald-500 text-white shadow-lg'
                                : `${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`
                            }`}
                          >
                            <div className="text-xl mb-1">{organ.icon}</div>
                            <div className="text-xs truncate">{organ.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Parameter Selection */}
                    {selectedOrgan && organParameters.length > 0 && (
                      <div>
                        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Select Parameter
                        </label>
                        <select
                          value={selectedParameter}
                          onChange={(e) => setSelectedParameter(e.target.value)}
                          className={`w-full mt-2 p-3 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        >
                          <option value="">Choose a parameter...</option>
                          {organParameters.map(param => (
                            <option key={param.id} value={param.id}>
                              {param.name} ({param.range[0]}-{param.range[1]} {param.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {/* Value Slider */}
                    {selectedParameter && currentNormalRange && (
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {currentNormalRange.name}
                          </span>
                          <Badge className={getStatusColor(getValueStatus(parameterValue, currentNormalRange))}>
                            {getValueStatus(parameterValue, currentNormalRange).replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        {/* Normal Range Display */}
                        <div className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Normal: {currentNormalRange.min} - {currentNormalRange.max} {currentNormalRange.unit}
                        </div>
                        
                        {/* Slider */}
                        <div className="mb-4">
                          <Slider
                            value={sliderValue}
                            onValueChange={(val) => {
                              setSliderValue(val);
                              setParameterValue(val[0]);
                            }}
                            min={currentNormalRange.criticalLow}
                            max={currentNormalRange.criticalHigh}
                            step={(currentNormalRange.max - currentNormalRange.min) / 100}
                            className="w-full"
                          />
                        </div>
                        
                        {/* Value Input */}
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            value={parameterValue}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setParameterValue(val);
                              setSliderValue([val]);
                            }}
                            className={`w-24 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                          />
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {currentNormalRange.unit}
                          </span>
                          <Button
                            onClick={addFinding}
                            className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Finding
                          </Button>
                        </div>
                        
                        {/* Quick buttons */}
                        <div className="flex gap-2 mt-3">
                          {[
                            { label: 'Critical Low', value: currentNormalRange.criticalLow },
                            { label: 'Low', value: currentNormalRange.min * 0.8 },
                            { label: 'Normal', value: (currentNormalRange.min + currentNormalRange.max) / 2 },
                            { label: 'High', value: currentNormalRange.max * 1.2 },
                            { label: 'Critical High', value: currentNormalRange.criticalHigh },
                          ].map(btn => (
                            <button
                              key={btn.label}
                              onClick={() => {
                                setParameterValue(btn.value);
                                setSliderValue([btn.value]);
                              }}
                              className={`px-2 py-1 text-xs rounded-lg transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
65-year-old male presenting with chest pain and shortness of breath.
Labs: WBC 12.5, Creatinine 1.8, Troponin elevated.
PMH: Hypertension, Type 2 Diabetes"
                      className={`w-full h-48 p-4 rounded-xl border resize-none ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={handleAnalyzeText}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        disabled={!clinicalText.trim() || isAnalyzing}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Analyze Text
                      </Button>
                      <Button
                        variant="outline"
                        className={isDark ? 'border-gray-700' : ''}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Test Patient Tab */}
                {activeTab === 'patient' && (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Test Patient feature coming soon</p>
                    <p className="text-sm mt-1">Create virtual patient cases for testing</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Current Findings */}
            {abnormalFindings.length > 0 && (
              <div className={`rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} p-4`}>
                <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Current Findings ({abnormalFindings.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {abnormalFindings.map(finding => (
                    <Badge
                      key={finding.id}
                      className={`flex items-center gap-2 py-1.5 px-3 ${
                        finding.direction === 'increase' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      } border`}
                    >
                      {finding.direction === 'increase' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{finding.parameterName}</span>
                      {finding.value && <span className="opacity-70">({finding.value} {finding.unit})</span>}
                      <button onClick={() => removeFinding(finding.id)} className="ml-1 hover:text-white">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right: Results Panel */}
          <div className={`rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-800 bg-gradient-to-r from-emerald-900/30 to-teal-900/30' : 'border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Differential Diagnosis
                  </h3>
                </div>
                {differentialResults.length > 0 && (
                  <Badge className="bg-emerald-500/20 text-emerald-400">
                    {differentialResults.length} conditions
                  </Badge>
                )}
              </div>
            </div>
            
            <ScrollArea className="h-[600px]">
              <div className="p-4">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                    <span className={`ml-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Analyzing...</span>
                  </div>
                ) : differentialResults.length > 0 ? (
                  <div className="space-y-3">
                    {differentialResults.map((diagnosis, idx) => (
                      <div
                        key={diagnosis.icd10 || idx}
                        className={`rounded-xl border overflow-hidden transition-all ${isDark ? 'bg-gray-800/50 border-gray-700 hover:border-emerald-500/50' : 'bg-white border-gray-200 hover:border-emerald-500'}`}
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => setExpandedDisease(expandedDisease === idx ? null : idx)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getProbabilityColor(diagnosis.probabilityScore)} flex items-center justify-center text-white font-bold text-sm`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {diagnosis.diseaseName}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {diagnosis.icd10}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {Math.round(diagnosis.probabilityScore * 10) / 10}%
                                </div>
                              </div>
                              {expandedDisease === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                          
                          {/* Probability bar */}
                          <div className={`mt-3 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                            <div 
                              className={`h-full bg-gradient-to-r ${getProbabilityColor(diagnosis.probabilityScore)} transition-all`}
                              style={{ width: `${Math.min(100, Math.round(diagnosis.probabilityScore))}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Expanded details */}
                        {expandedDisease === idx && (
                          <div className={`p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
                            {/* Clinical Reasoning */}
                            <div className="mb-4">
                              <h4 className="text-xs font-semibold text-emerald-400 uppercase mb-2 flex items-center gap-1">
                                <Brain className="w-3 h-3" /> Clinical Reasoning
                              </h4>
                              <div className={`text-sm p-3 rounded-lg ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
                                {diagnosis.supportingEvidence?.length > 0 ? (
                                  <ul className="space-y-2">
                                    {diagnosis.supportingEvidence.slice(0, 4).map((ev, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>
                                          <strong>{ev.finding}</strong> {ev.direction === 'increase' ? '↑' : '↓'}: {ev.explanation || 'Consistent with diagnosis'}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : diagnosis.matchedParams?.length > 0 ? (
                                  <p>Based on: {diagnosis.matchedParams.map(m => m.param).join(', ')}</p>
                                ) : (
                                  <p>Clinical pattern matching suggests this diagnosis based on the provided findings.</p>
                                )}
                              </div>
                            </div>
                            
                            {/* Matched findings */}
                            {diagnosis.matchedParams?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {diagnosis.matchedParams.slice(0, 6).map((param, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {param.direction === 'increase' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {param.param}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {/* Evidence-Based Guidelines from Backend */}
                            <DiseaseDetailPanel 
                              diseaseId={diagnosis.icd10?.replace('.', '_')} 
                              diseaseName={diagnosis.diseaseName} 
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">No findings yet</p>
                    <p className="text-sm">Add abnormal parameters or paste clinical text to generate differential diagnosis</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DifferentialPage;
