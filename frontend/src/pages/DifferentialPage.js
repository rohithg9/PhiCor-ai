import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import FeatureNav from '../components/FeatureNav';
import TestPatientPanel from '../components/TestPatientPanel';
import ClinicalCalculatorPanel from '../components/ClinicalCalculatorPanel';
import { FeatureTutorial, TutorialButton, useTutorial } from '../components/FeatureTutorial';
import { 
  Search, Plus, Trash2, FileText, Upload, AlertTriangle,
  CheckCircle, ChevronDown, ChevronUp, Activity, User, Clipboard,
  TrendingUp, TrendingDown, Minus, Brain, FlaskConical, Heart,
  Stethoscope, Gauge, Info, Sparkles, Target, Zap, Shield, Pill, Calculator
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
import { CLINICAL_CALCULATORS, searchCalculators, getCalculatorsForDisease, getCalculatorById } from '../data/clinicalCalculators';

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
  const tutorial = useTutorial('differential');
  
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
  
  // NEW: Clinical Synthesis state
  const [clinicalSynthesis, setClinicalSynthesis] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisExpanded, setSynthesisExpanded] = useState(true);
  
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
  
  // NEW: Run AI-powered clinical synthesis
  const runClinicalSynthesis = useCallback(async () => {
    // Need either findings or substantial clinical text to synthesize
    console.log('runClinicalSynthesis called:', { 
      findingsCount: abnormalFindings.length, 
      hasText: !!clinicalText.trim(),
      resultsCount: differentialResults.length
    });
    
    // Synthesis is useful if we have clinical text (even without extracted findings)
    // OR if we have 2+ findings
    if (abnormalFindings.length === 0 && !clinicalText.trim()) {
      setClinicalSynthesis(null);
      return;
    }
    
    setIsSynthesizing(true);
    console.log('Starting synthesis API call...');
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      console.log('Backend URL:', backendUrl);
      
      // Separate findings by type
      const labFindings = abnormalFindings.filter(f => f.source !== 'clinical-text' || !f.diseases?.length);
      const imagingFindings = abnormalFindings.filter(f => f.diseases?.length > 0);
      const symptoms = abnormalFindings.filter(f => f.source === 'clinical-text' && f.type === 'symptom');
      
      // Include info from differential results if no explicit findings
      const topDifferentials = differentialResults.slice(0, 5).map(d => d.diseaseName).join(', ');
      
      const requestBody = {
        clinical_text: clinicalText || `Top differential diagnoses being considered: ${topDifferentials}`,
        lab_findings: labFindings.map(f => ({
          parameterId: f.parameterId || '',
          name: f.parameterName || f.parameterId || '',
          value: typeof f.value === 'number' ? f.value : null,
          unit: f.unit || '',
          direction: f.direction || '',
          normalRange: f.normalRange || '',
          severity: f.severity || 'moderate'
        })),
        imaging_findings: imagingFindings.map(f => ({
          parameterId: f.parameterId || '',
          name: f.parameterName || f.parameterId || '',
          value: null,
          unit: '',
          direction: f.direction || '',
          normalRange: '',
          severity: f.severity || 'moderate'
        })),
        symptoms: symptoms.map(f => ({
          parameterId: f.parameterId || '',
          name: f.parameterName || f.parameterId || '',
          value: null,
          unit: '',
          direction: 'present',
          normalRange: '',
          severity: 'moderate'
        })),
        patient_info: null
      };
      
      console.log('Synthesis request:', requestBody);
      
      const response = await fetch(`${backendUrl}/api/diagnosis/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Synthesis response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Synthesis response:', data);
        if (data.success && data.synthesis) {
          setClinicalSynthesis(data.synthesis);
          console.log('Clinical synthesis set!');
        }
      } else {
        try {
          const errorData = await response.json();
          console.error('Synthesis API error (JSON):', errorData);
        } catch (e) {
          const errorText = await response.text();
          console.error('Synthesis API error (text):', errorText);
        }
      }
    } catch (error) {
      console.error('Clinical synthesis error:', error);
    } finally {
      setIsSynthesizing(false);
    }
  }, [abnormalFindings, clinicalText]);
  
  // Auto-run synthesis when findings change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Synthesis check:', { findingsCount: abnormalFindings.length, hasText: !!clinicalText.trim() });
      // Trigger synthesis if we have 2+ findings OR if we have clinical text with 1+ findings OR just clinical text
      if (abnormalFindings.length >= 2 || (clinicalText.trim() && abnormalFindings.length > 0) || (clinicalText.trim().length > 50 && differentialResults.length > 0)) {
        console.log('Triggering clinical synthesis...');
        runClinicalSynthesis();
      } else {
        setClinicalSynthesis(null);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [abnormalFindings, clinicalText, differentialResults, runClinicalSynthesis]);
  
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
            <TutorialButton onClick={tutorial.open} />
          </div>
        </div>
        
        {/* Tutorial Overlay */}
        <FeatureTutorial 
          feature="differential" 
          isOpen={tutorial.isOpen} 
          onClose={tutorial.close} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Panel */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className={`rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
              <div className="flex border-b border-gray-800" data-tutorial="input-tabs">
                {[
                  { id: 'parameters', icon: FlaskConical, label: 'Parameters' },
                  { id: 'clinical', icon: FileText, label: 'Clinical Text' },
                  { id: 'patient', icon: User, label: 'Test Patient' },
                  { id: 'calculators', icon: Calculator, label: 'Calculators' },
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
                  <TestPatientPanel 
                    isDark={isDark}
                    onLoadCase={(caseData) => {
                      setClinicalText(caseData.clinicalText);
                      setActiveTab('clinical');
                      // Auto-trigger analysis after a short delay
                      setTimeout(() => {
                        handleAnalyzeText();
                      }, 500);
                    }}
                  />
                )}
                
                {/* Calculators Tab */}
                {activeTab === 'calculators' && (
                  <div className="h-[500px]">
                    <ClinicalCalculatorPanel isDark={isDark} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Current Findings */}
            {abnormalFindings.length > 0 && (
              <div className={`rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Current Findings ({abnormalFindings.length})
                  </h3>
                  {abnormalFindings.length >= 2 && (
                    <Button
                      onClick={runClinicalSynthesis}
                      disabled={isSynthesizing}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs py-1 px-3 h-auto"
                    >
                      {isSynthesizing ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                          Synthesizing...
                        </>
                      ) : (
                        <>
                          <span className="font-serif font-bold mr-1">Φ</span>
                          Synthesis
                        </>
                      )}
                    </Button>
                  )}
                </div>
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
                {/* PhiCor Synthesis Button in header */}
                {(clinicalText.trim() || differentialResults.length > 0) && !clinicalSynthesis && (
                  <Button
                    onClick={runClinicalSynthesis}
                    disabled={isSynthesizing}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs py-1 px-3 h-auto"
                  >
                    {isSynthesizing ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <span className="font-serif font-bold mr-1">Φ</span>
                        Run Synthesis
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            <ScrollArea className="h-[600px]">
              <div className="p-4">
                {/* PhiCor Synthesis Section - FIRST */}
                {(isSynthesizing || clinicalSynthesis) && (
                  <div className={`mb-6 rounded-xl border-2 ${isDark ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/50' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300'} overflow-hidden`}>
                    <div 
                      className={`p-4 cursor-pointer flex items-center justify-between ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`}
                      onClick={() => setSynthesisExpanded(!synthesisExpanded)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                          <span className="text-white font-serif text-xl font-bold">Φ</span>
                        </div>
                        <div>
                          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            PhiCor Synthesis
                          </h3>
                          <p className={`text-xs ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                            Holistic analysis connecting all findings
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSynthesizing && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
                        )}
                        {synthesisExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                    
                    {synthesisExpanded && clinicalSynthesis && (
                      <div className="p-4 space-y-4">
                        {/* Clinical Synthesis Summary */}
                        {clinicalSynthesis.clinical_synthesis && (
                          <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                              <Target className="w-4 h-4" /> Clinical Pattern Recognition
                            </h4>
                            <p className={`text-sm mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                              {clinicalSynthesis.clinical_synthesis.summary}
                            </p>
                            {clinicalSynthesis.clinical_synthesis.key_pattern && (
                              <div className={`text-xs p-2 rounded ${isDark ? 'bg-purple-800/50' : 'bg-purple-200'}`}>
                                <strong>Key Pattern:</strong> {clinicalSynthesis.clinical_synthesis.key_pattern}
                              </div>
                            )}
                            {clinicalSynthesis.clinical_synthesis.clinical_pearl && (
                              <div className={`mt-2 text-xs p-2 rounded ${isDark ? 'bg-indigo-800/50' : 'bg-indigo-200'}`}>
                                <strong>💡 Clinical Pearl:</strong> {clinicalSynthesis.clinical_synthesis.clinical_pearl}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Primary Diagnosis from AI */}
                        {clinicalSynthesis.primary_diagnosis && (
                          <div className={`p-4 rounded-lg border ${isDark ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                <Target className="w-4 h-4" /> Primary Diagnosis
                              </h4>
                              <Badge className="bg-emerald-500 text-white">
                                {clinicalSynthesis.primary_diagnosis.probability}% likely
                              </Badge>
                            </div>
                            <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {clinicalSynthesis.primary_diagnosis.name}
                            </p>
                            <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {clinicalSynthesis.primary_diagnosis.icd10}
                            </p>
                            <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                              {clinicalSynthesis.primary_diagnosis.reasoning}
                            </div>
                            
                            {/* Key Supporting Findings */}
                            {clinicalSynthesis.primary_diagnosis.key_supporting_findings?.length > 0 && (
                              <div className="mt-3">
                                <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Supporting Evidence:
                                </p>
                                <div className="space-y-1">
                                  {clinicalSynthesis.primary_diagnosis.key_supporting_findings.map((f, i) => (
                                    <div key={i} className={`text-xs flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                      <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                      <span><strong>{f.finding}:</strong> {f.significance}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Next Steps */}
                            {clinicalSynthesis.primary_diagnosis.next_steps?.length > 0 && (
                              <div className="mt-3">
                                <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Recommended Next Steps:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {clinicalSynthesis.primary_diagnosis.next_steps.map((step, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {step}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Guideline Source */}
                            {(clinicalSynthesis.primary_diagnosis.guideline_source || clinicalSynthesis.primary_diagnosis.database_match) && (
                              <div className={`mt-3 text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                {clinicalSynthesis.primary_diagnosis.database_match && (
                                  <span className="mr-3">📚 PhiCor DB: {clinicalSynthesis.primary_diagnosis.database_match}</span>
                                )}
                                {clinicalSynthesis.primary_diagnosis.guideline_source && (
                                  <span>📋 {clinicalSynthesis.primary_diagnosis.guideline_source}</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Recommended Treatment from Drug Database */}
                        {clinicalSynthesis.recommended_treatment?.pharmacological?.length > 0 && (
                          <div className={`p-4 rounded-lg border ${isDark ? 'bg-cyan-900/20 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'}`}>
                            <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                              <Pill className="w-4 h-4" /> Treatment Recommendations
                            </h4>
                            <div className="space-y-2">
                              {clinicalSynthesis.recommended_treatment.pharmacological.map((drug, i) => (
                                <div key={i} className={`p-2 rounded ${isDark ? 'bg-cyan-900/30' : 'bg-cyan-100'}`}>
                                  <div className="flex items-center justify-between">
                                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                      {drug.drug}
                                    </span>
                                    {drug.evidence_level && (
                                      <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                                        Level {drug.evidence_level}
                                      </Badge>
                                    )}
                                  </div>
                                  {drug.dose && (
                                    <p className={`text-xs ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>
                                      Dose: {drug.dose}
                                    </p>
                                  )}
                                  {drug.rationale && (
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {drug.rationale}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                            {clinicalSynthesis.recommended_treatment.guideline_source && (
                              <p className={`text-xs mt-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                Source: {clinicalSynthesis.recommended_treatment.guideline_source}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Knowledge Base References */}
                        {clinicalSynthesis.knowledge_base && (
                          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'} flex items-center justify-between`}>
                            <div className="flex items-center gap-4 text-xs">
                              <span className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                📊 {clinicalSynthesis.knowledge_base.diseases_referenced} diseases referenced
                              </span>
                              <span className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                💊 {clinicalSynthesis.knowledge_base.drugs_referenced} drugs matched
                              </span>
                            </div>
                            <Badge className={`text-xs ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                              PhiCor Integrated
                            </Badge>
                          </div>
                        )}
                        
                        {/* Clinical Reasoning Steps */}
                        {clinicalSynthesis.clinical_reasoning_steps?.length > 0 && (
                          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                            <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <Brain className="w-4 h-4" /> Diagnostic Reasoning Process
                            </h4>
                            <div className="space-y-3">
                              {clinicalSynthesis.clinical_reasoning_steps.map((step, i) => (
                                <div key={i} className="flex gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700'}`}>
                                    {step.step}
                                  </div>
                                  <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                      {step.thought}
                                    </p>
                                    {step.hypothesis && (
                                      <p className={`text-xs mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                        → {step.hypothesis}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Mathematical Analysis */}
                        {clinicalSynthesis.mathematical_analysis && (
                          <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                              <Gauge className="w-4 h-4" /> Bayesian Probability Analysis
                            </h4>
                            {clinicalSynthesis.mathematical_analysis.pre_test_probability && (
                              <p className={`text-xs mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                <strong>Pre-test probability:</strong> {clinicalSynthesis.mathematical_analysis.pre_test_probability}
                              </p>
                            )}
                            {clinicalSynthesis.mathematical_analysis.combined_probability_estimate && (
                              <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                <strong>Combined analysis:</strong> {clinicalSynthesis.mathematical_analysis.combined_probability_estimate}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Urgency Assessment */}
                        {clinicalSynthesis.urgency_assessment && (
                          <div className={`p-3 rounded-lg flex items-center gap-3 ${
                            clinicalSynthesis.urgency_assessment.level === 'emergent' 
                              ? (isDark ? 'bg-red-900/30 border border-red-500/50' : 'bg-red-50 border border-red-200')
                              : clinicalSynthesis.urgency_assessment.level === 'urgent'
                              ? (isDark ? 'bg-orange-900/30 border border-orange-500/50' : 'bg-orange-50 border border-orange-200')
                              : (isDark ? 'bg-gray-800/50' : 'bg-gray-100')
                          }`}>
                            <Shield className={`w-5 h-5 ${
                              clinicalSynthesis.urgency_assessment.level === 'emergent' ? 'text-red-500' :
                              clinicalSynthesis.urgency_assessment.level === 'urgent' ? 'text-orange-500' : 'text-gray-500'
                            }`} />
                            <div>
                              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                PhiCor Alert: {clinicalSynthesis.urgency_assessment.level?.toUpperCase()}
                              </p>
                              {clinicalSynthesis.urgency_assessment.can_miss_diagnosis && (
                                <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                  ⚠️ Don't miss: {clinicalSynthesis.urgency_assessment.can_miss_diagnosis}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Divider */}
                {clinicalSynthesis && differentialResults.length > 0 && (
                  <div className={`mb-4 py-2 flex items-center gap-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div className="flex-1 h-px bg-current opacity-30" />
                    <span className="text-xs uppercase tracking-wider">Individual Parameter Analysis</span>
                    <div className="flex-1 h-px bg-current opacity-30" />
                  </div>
                )}
                
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
