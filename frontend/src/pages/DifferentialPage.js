import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useRegion } from '../context/RegionContext';
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
import DiseaseComparisonDashboard from '../components/DiseaseComparisonDashboard';
import DifferentialDashboard from '../components/DifferentialDashboard';
import ParameterDrillDownModal from '../components/ParameterDrillDownModal';
import { 
  getDifferentialDiagnosis, 
  parseClinicalText, 
  analyzePatientCase,
  getAllParameters,
  NORMAL_RANGES,
} from '../data/bidirectionalMapping';
import { ORGAN_MODELS } from '../data/organModels';
import { CLINICAL_CALCULATORS, searchCalculators, getCalculatorsForDisease, getCalculatorById } from '../data/clinicalCalculators';
import { getNormalRange, checkAbnormality } from '../data/regionalUnits';

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
  const { region, isSI } = useRegion();
  const tutorial = useTutorial('differential');
  const [searchParams] = useSearchParams();
  
  // State management
  const initialTab = searchParams.get('tab') || 'parameters';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedOrgan, setSelectedOrgan] = useState('');
  const [selectedParameter, setSelectedParameter] = useState('');
  const [parameterValue, setParameterValue] = useState(50);
  const [sliderValue, setSliderValue] = useState([50]);
  const [abnormalFindings, setAbnormalFindings] = useState([]);
  const [clinicalText, setClinicalText] = useState('');
  const [differentialResults, setDifferentialResults] = useState([]);
  const [expandedDisease, setExpandedDisease] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usePhiCor, setUsePhiCor] = useState(true); // Toggle for PhiCor Analysis
  const [phicorResults, setPhicorResults] = useState(null); // Store full PhiCor analysis results
  const [analysisStartTime, setAnalysisStartTime] = useState(null); // Track analysis start time
  const [analysisTimeTaken, setAnalysisTimeTaken] = useState(null); // Store time taken for analysis
  const [elapsedTime, setElapsedTime] = useState(0); // Live elapsed time during analysis
  
  // NEW: Disease Comparison Dashboard state
  const [selectedDiseaseForComparison, setSelectedDiseaseForComparison] = useState(null);
  const [showComparisonDashboard, setShowComparisonDashboard] = useState(false);
  
  // NEW: Clinical Synthesis state
  const [clinicalSynthesis, setClinicalSynthesis] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisExpanded, setSynthesisExpanded] = useState(true);
  
  // NEW: Parameter Drill-Down Modal state
  const [drillDownModal, setDrillDownModal] = useState({
    isOpen: false,
    parameterName: null,
    parameterType: null,
    expectedValue: null,
    currentDirection: null
  });
  
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
    
    // Create full parameter ID with organ prefix for disease mapping
    const fullParameterId = `${selectedOrgan}.${selectedParameter}`;
    
    const newFinding = {
      id: `${selectedOrgan}-${selectedParameter}-${Date.now()}`,
      organ: selectedOrgan,
      parameterId: fullParameterId,  // Use full parameter ID for disease mapping
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
    // Skip local diagnosis if PhiCor already provided differentials
    if (phicorResults?.differentials?.length > 0) {
      console.log('runDiagnosis: Skipping - PhiCor differentials already present');
      return;
    }
    
    setIsAnalyzing(true);
    console.log('runDiagnosis: Running LOCAL diagnosis (not PhiCor)');
    
    setTimeout(() => {
      let results = [];
      const findings = overrideFindings || abnormalFindings;
      
      console.log('runDiagnosis: findings count:', findings.length);
      
      if (findings.length > 0) {
        const findingsForAnalysis = findings.map(f => ({
          parameterId: f.parameterId,
          direction: f.direction,
          severity: f.severity,
          value: f.value,
          diseases: f.diseases || [],
        }));
        console.log('runDiagnosis: findingsForAnalysis:', findingsForAnalysis);
        results = getDifferentialDiagnosis(findingsForAnalysis);
        console.log('runDiagnosis: getDifferentialDiagnosis returned:', results.length, 'results');
        
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
  }, [abnormalFindings, clinicalText, phicorResults]);
  
  // Track if PhiCor analysis is active to prevent race conditions
  const [phicorActive, setPhicorActive] = useState(false);
  
  // Auto-run diagnosis when findings change - but only if PhiCor hasn't provided results
  useEffect(() => {
    // Skip if we have PhiCor differentials already
    if (phicorResults?.differentials?.length > 0) {
      console.log('Skipping local diagnosis - PhiCor differentials already present:', phicorResults.differentials.length);
      return;
    }
    
    // Skip if PhiCor analysis is currently running or was just completed
    if (phicorActive) {
      console.log('Skipping local diagnosis - PhiCor is active');
      return;
    }
    
    // Skip if usePhiCor is enabled and we're analyzing - wait for PhiCor results
    if (usePhiCor && isAnalyzing) {
      console.log('Skipping local diagnosis - waiting for PhiCor analysis');
      return;
    }
    
    // Skip if we already have differential results from PhiCor (check the results array directly)
    if (usePhiCor && differentialResults.length > 0 && differentialResults[0]?.id?.startsWith('phicor-diff-')) {
      console.log('Skipping local diagnosis - PhiCor results already displayed');
      return;
    }
    
    // Only run local diagnosis if PhiCor is disabled
    if (!usePhiCor && (abnormalFindings.length > 0 || clinicalText.trim())) {
      console.log('Running local diagnosis - PhiCor disabled');
      runDiagnosis();
    } else if (!usePhiCor && abnormalFindings.length === 0 && !clinicalText.trim()) {
      setDifferentialResults([]);
    }
  }, [abnormalFindings, runDiagnosis, phicorResults, phicorActive, usePhiCor, isAnalyzing, clinicalText, differentialResults]);
  
  // Analyze clinical text - with PhiCor Analysis
  const handleAnalyzeText = async () => {
    if (!clinicalText.trim()) return;
    
    setIsAnalyzing(true);
    setPhicorResults(null);
    if (usePhiCor) {
      setPhicorActive(true); // Mark PhiCor as active to prevent useEffect from running local diagnosis
    }
    
    try {
      let findings = [];
      let symptoms = [];
      let result = null; // Declare result at function scope
      
      if (usePhiCor) {
        // Use PhiCor Analysis - comprehensive physiology-first reasoning
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const unitSystem = isSI ? 'SI' : 'conventional';
        
        console.log(`Using PhiCor Analysis (Region: ${region}, Units: ${unitSystem})`);
        
        // Retry logic for API calls
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            const response = await fetch(`${backendUrl}/api/clinical/interpret`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: clinicalText,
                region: region,
                source_type: 'free_text'
              })
            });
            
            if (response.ok) {
              result = await response.json();
              console.log('PhiCor Analysis result:', result);
              
              if (result.success && (result.findings?.length > 0 || result.differentials?.length > 0)) {
                // Store full PhiCor results for display
                setPhicorResults(result);
                break; // Success, exit retry loop
              } else if (retryCount < maxRetries) {
                console.warn(`PhiCor Analysis returned incomplete data, retrying... (${retryCount + 1}/${maxRetries})`);
                retryCount++;
                continue;
              }
            } else {
              if (retryCount < maxRetries) {
                retryCount++;
                continue;
              }
            }
            break;
          } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            if (retryCount < maxRetries) {
              retryCount++;
              continue;
            }
            break;
          }
        }
        
        // Process successful result
        if (result?.success && result.findings?.length > 0) {
          findings = result.findings.map((f, idx) => ({
            id: `phicor-${Date.now()}-${idx}`,
            organ: f.organ_system || f.organ || 'unknown',
            parameterId: f.parameter_id,
            parameterName: f.name || f.parameter_id,
            value: f.value || '',
            unit: f.unit || '',
            direction: f.direction,
            severity: f.severity || 1,
            deviation: '',
            normalRange: '',
            source: 'phicor-analysis',
            originalText: f.original_text || '',
            type: f.type || 'lab',
            physiologicImplication: f.physiologic_implication || '',
          }));
        }
          
        // Add symptoms as findings too
          if (result.symptoms?.length > 0) {
            symptoms = result.symptoms.map((s, idx) => {
              const symptomName = typeof s === 'object' ? s.name : s;
              return {
                id: `symptom-${Date.now()}-${idx}`,
                organ: 'general',
                parameterId: symptomName.replace(/\s+/g, '_').toLowerCase(),
                parameterName: symptomName,
                value: s.severity || '',
                unit: '',
                direction: 'present',
                severity: s.severity || 'moderate',
                deviation: '',
                normalRange: '',
                source: 'phicor-analysis',
                type: 'symptom',
                clinical_significance: s.clinical_significance || '',
              };
            });
          }
          
          // If PhiCor returned differentials, use those directly instead of local calculation
          if (result.differentials?.length > 0) {
            const phicorDifferentials = result.differentials.map((d, idx) => ({
              id: `phicor-diff-${idx}`,
              diseaseId: d.icd_code || d.name.toLowerCase().replace(/\s+/g, '_'),
              diseaseName: d.name,
              probability: d.probability / 100, // Convert to 0-1 scale
              probabilityScore: d.probability, // Keep original percentage for display
              role: d.role,
              matchingParameters: d.matching_parameters || [],
              missingFeatures: d.missing_features || [],
              icdCode: d.icd_code,
              icd10: d.icd_code, // Alias for compatibility
              // New comprehensive fields
              rank: d.rank,
              clinical_reasoning: d.clinical_reasoning,
              supporting_findings: d.supporting_findings || [],
              key_discriminating_features: d.key_discriminating_features || [],
              against_diagnosis: d.against_diagnosis || [],
              anchor_criteria_met: d.anchor_criteria_met,
            }));
            
            // Set PhiCor differentials directly
            setDifferentialResults(phicorDifferentials);
          }
        
        // Fallback to regex parsing if PhiCor didn't return usable data
        if (!result?.success || (!result?.findings?.length && !result?.differentials?.length)) {
          console.warn('PhiCor Analysis failed or returned no data, falling back to regex parsing');
          const parsed = parseClinicalText(clinicalText);
          findings = parsed.findings || [];
        }
      } else {
        // Use regex-based parsing when PhiCor is disabled
        const parsed = parseClinicalText(clinicalText);
        console.log('Regex parsed clinical text:', parsed);
        findings = parsed.findings || [];
      }
      
      const allFindings = [...findings, ...symptoms];
      
      if (allFindings.length > 0) {
        const newFindings = allFindings.map((f, idx) => ({
          id: f.id || `text-${Date.now()}-${idx}`,
          organ: f.organ || 'unknown',
          parameterId: f.parameterId || f.parameter_id,
          parameterName: f.parameterName || f.name || f.parameterId,
          value: f.value || '',
          unit: f.unit || '',
          direction: f.direction,
          severity: f.severity || 'moderate',
          deviation: '',
          normalRange: f.normalRange || '',
          source: f.source || 'clinical-text',
          diseases: f.diseases || [],
          type: f.type || 'lab',
          physiologicImplication: f.physiologicImplication || '',
        }));
        
        // Check if we should run local diagnosis
        const hasPhicorDifferentials = result?.differentials?.length > 0;
        
        setAbnormalFindings(prev => {
          const updated = [...prev, ...newFindings];
          // Only run local diagnosis if PhiCor is explicitly disabled AND didn't provide differentials
          if (!usePhiCor && !hasPhicorDifferentials) {
            setPhicorActive(false); // Reset PhiCor active flag before running local diagnosis
            setTimeout(() => {
              runDiagnosis(updated);
            }, 100);
          } else if (hasPhicorDifferentials) {
            // PhiCor provided differentials - DO NOT run local diagnosis
            // Keep phicorActive true for a moment to prevent useEffect from triggering
            setTimeout(() => {
              setPhicorActive(false);
            }, 1000); // Longer delay to ensure state updates propagate
          } else {
            setPhicorActive(false);
          }
          return updated;
        });
        setIsAnalyzing(false);
      } else {
        setIsAnalyzing(false);
        setPhicorActive(false); // Reset PhiCor active flag
        alert('No clinical findings detected. Try adding more specific clinical details.');
      }
    } catch (error) {
      console.error('Error analyzing clinical text:', error);
      setIsAnalyzing(false);
      setPhicorActive(false); // Reset PhiCor active flag on error
      
      // Fall back to regex parsing on error
      const parsed = parseClinicalText(clinicalText);
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
          setTimeout(() => {
            runDiagnosis(updated);
          }, 100);
          return updated;
        });
      } else {
        alert('Error analyzing text. Please try again.');
      }
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
    
    // Synthesis is useful if we have findings OR clinical text with differential results
    if (abnormalFindings.length === 0 && !clinicalText.trim() && differentialResults.length === 0) {
      setClinicalSynthesis(null);
      return;
    }
    
    setIsSynthesizing(true);
    console.log('Starting synthesis API call...');
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      console.log('Backend URL:', backendUrl);
      
      // Separate findings by type - treat ALL findings as lab findings if from parameters
      const labFindings = abnormalFindings.filter(f => !f.diseases?.length);
      const imagingFindings = abnormalFindings.filter(f => f.diseases?.length > 0);
      const symptoms = abnormalFindings.filter(f => f.source === 'clinical-text' && f.type === 'symptom');
      
      // Include info from differential results
      const topDifferentials = differentialResults.slice(0, 5).map(d => d.diseaseName).join(', ');
      
      // Generate clinical context from findings if no text provided
      let contextText = clinicalText;
      if (!contextText && abnormalFindings.length > 0) {
        const findingsSummary = abnormalFindings.map(f => 
          `${f.parameterName || f.parameterId}: ${f.value} ${f.unit || ''} (${f.direction}, ${f.severity})`
        ).join('; ');
        contextText = `Patient presents with the following abnormal parameters: ${findingsSummary}. Top differential diagnoses being considered: ${topDifferentials}`;
      } else if (topDifferentials && !contextText.includes('differential')) {
        contextText = `${contextText}. Top differential diagnoses being considered: ${topDifferentials}`;
      }
      
      const requestBody = {
        clinical_text: contextText || `Top differential diagnoses being considered: ${topDifferentials}`,
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
  }, [abnormalFindings, clinicalText, differentialResults]);
  
  // Auto-run synthesis when findings change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Synthesis check:', { findingsCount: abnormalFindings.length, hasText: !!clinicalText.trim(), resultsCount: differentialResults.length });
      // Trigger synthesis if we have 1+ findings with differential results OR clinical text with results
      if ((abnormalFindings.length >= 1 && differentialResults.length > 0) || (clinicalText.trim() && differentialResults.length > 0)) {
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
                    {/* AI interpretation toggle and region indicator */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={usePhiCor}
                            onChange={(e) => setUsePhiCor(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Brain className="w-4 h-4 inline mr-1 text-emerald-500" />
                            PhiCor Analysis
                          </span>
                        </label>
                        {usePhiCor && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                            Physiology-first multifactorial reasoning
                          </span>
                        )}
                      </div>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Units: {isSI ? 'SI (Metric)' : 'Conventional (US)'}
                      </span>
                    </div>
                    
                    <textarea
                      value={clinicalText}
                      onChange={(e) => setClinicalText(e.target.value)}
                      placeholder={`Paste clinical notes, lab results, or patient history here...

Example (any format works with PhiCor):
65 y/o M c/o CP and SOB x2 days
Labs: WBC 12.5k, Cr 1.8${isSI ? ' (159 μmol/L)' : ''}, Trop elevated, BNP 1200
PMH: HTN, T2DM, CKD stage 3
Echo: EF 35%, dilated LV, MR 2+, elevated PASP`}
                      className={`w-full h-48 p-4 rounded-xl border resize-none ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={handleAnalyzeText}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        disabled={!clinicalText.trim() || isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            {usePhiCor ? 'PhiCor Analysis' : 'Basic Analysis'}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className={isDark ? 'border-gray-700' : ''}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                    
                    {/* PhiCor Dominant Syndromes Display */}
                    {phicorResults && (phicorResults.dominant_syndromes?.length > 0 || phicorResults.syndromes?.length > 0) && (
                      <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
                        <h4 className={`text-sm font-semibold flex items-center gap-2 mb-2 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                          <Target className="w-4 h-4" />
                          Dominant Clinical Syndrome(s)
                        </h4>
                        <div className="space-y-3">
                          {(phicorResults.dominant_syndromes || phicorResults.syndromes || []).map((syndrome, idx) => (
                            <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-100/50'}`}>
                              <p className={`text-sm font-medium ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
                                {typeof syndrome === 'object' ? syndrome.syndrome : syndrome}
                              </p>
                              {syndrome.key_features?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {syndrome.key_features.map((feature, i) => (
                                    <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-purple-800 text-purple-200' : 'bg-purple-200 text-purple-800'}`}>
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {syndrome.pathophysiologic_rationale && (
                                <p className={`text-xs mt-2 italic ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                                  {syndrome.pathophysiologic_rationale}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Clinical Findings with Normal Ranges */}
                    {phicorResults && phicorResults.findings?.length > 0 && (
                      <div className={`mt-3 p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          <Activity className="w-4 h-4" />
                          Clinical Findings
                        </h4>
                        <div className="space-y-2">
                          {phicorResults.findings.slice(0, 8).map((finding, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${
                              finding.status === 'elevated' || finding.status === 'high' 
                                ? isDark ? 'bg-red-900/20' : 'bg-red-50'
                                : finding.status === 'low' || finding.status === 'decreased'
                                  ? isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                                  : isDark ? 'bg-gray-700/30' : 'bg-white'
                            }`}>
                              <div className="flex items-center gap-2">
                                {finding.direction === 'increase' ? (
                                  <TrendingUp className="w-4 h-4 text-red-500" />
                                ) : finding.direction === 'decrease' ? (
                                  <TrendingDown className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <Minus className="w-4 h-4 text-gray-400" />
                                )}
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {finding.name}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className={`text-sm font-bold ${
                                  finding.status === 'elevated' || finding.status === 'high' ? 'text-red-500'
                                    : finding.status === 'low' || finding.status === 'decreased' ? 'text-blue-500'
                                      : isDark ? 'text-green-400' : 'text-green-600'
                                }`}>
                                  {finding.value} {finding.unit}
                                </span>
                                {finding.normal_range && (
                                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Normal: {finding.normal_range}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Safety Considerations */}
                    {phicorResults && phicorResults.safety_alerts?.length > 0 && (
                      <div className={`mt-3 p-4 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
                        <h4 className={`text-sm font-semibold flex items-center gap-2 mb-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                          <AlertTriangle className="w-4 h-4" />
                          Safety Considerations
                        </h4>
                        <ul className="space-y-2">
                          {phicorResults.safety_alerts.map((alert, idx) => (
                            <li key={idx} className={`p-2 rounded-lg ${isDark ? 'bg-amber-900/30' : 'bg-amber-100/50'}`}>
                              {typeof alert === 'object' ? (
                                <div>
                                  <span className={`text-sm font-medium ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                                    {alert.alert_type}: {alert.parameter}
                                  </span>
                                  <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                    {alert.message}
                                  </p>
                                  {alert.recommended_action && (
                                    <p className={`text-xs mt-1 italic ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                      → {alert.recommended_action}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
                                  • {alert}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {phicorResults && phicorResults.synthesis && (
                      <div className={`mt-3 p-4 rounded-xl border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                        <h4 className={`text-sm font-semibold flex items-center gap-2 mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                          <Sparkles className="w-4 h-4" />
                          Diagnostic Synthesis
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex gap-4 flex-wrap">
                            {phicorResults.synthesis.primary_diagnosis && (
                              <div className={`flex-1 min-w-[200px] p-3 rounded-lg ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100/50'}`}>
                                <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Most Likely</p>
                                <p className={`font-semibold ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                                  {phicorResults.synthesis.primary_diagnosis}
                                </p>
                              </div>
                            )}
                            {phicorResults.synthesis.key_alternative && (
                              <div className={`flex-1 min-w-[200px] p-3 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100/50'}`}>
                                <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Key Alternative</p>
                                <p className={`font-semibold ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                                  {phicorResults.synthesis.key_alternative}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {phicorResults.synthesis.clinical_decision_pathway && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                              <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Clinical Decision Pathway</p>
                              <p className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                                {phicorResults.synthesis.clinical_decision_pathway}
                              </p>
                            </div>
                          )}
                          
                          {phicorResults.synthesis.discriminating_tests?.length > 0 && (
                            <div className="mt-2">
                              <strong className={isDark ? 'text-blue-200' : 'text-blue-700'}>Discriminating Tests:</strong>
                              <div className="mt-2 space-y-2">
                                {phicorResults.synthesis.discriminating_tests.map((test, idx) => (
                                  <div key={idx} className={`p-2 rounded-lg text-xs ${isDark ? 'bg-blue-900/30' : 'bg-blue-100/30'}`}>
                                    <span className={`font-medium ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                                      {typeof test === 'object' ? test.test : test}
                                    </span>
                                    {test.expected_finding && (
                                      <span className={`block mt-1 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                                        → Expected: {test.expected_finding}
                                      </span>
                                    )}
                                    {test.rationale && (
                                      <span className={`block mt-1 italic ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
                                        {test.rationale}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {phicorResults.synthesis.clinical_uncertainty && (
                            <p className={`text-xs italic mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              ⚠️ {phicorResults.synthesis.clinical_uncertainty}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Management Considerations */}
                    {phicorResults && phicorResults.management?.length > 0 && (
                      <div className={`mt-3 p-4 rounded-xl border ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}`}>
                        <h4 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                          <Stethoscope className="w-4 h-4" />
                          Management Considerations
                        </h4>
                        <div className="space-y-4">
                          {phicorResults.management.map((mgmt, idx) => (
                            <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100/50'}`}>
                              <p className={`font-medium text-sm mb-2 ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                                {mgmt.diagnosis}
                              </p>
                              {mgmt.approaches?.length > 0 && (
                                <ul className="space-y-1 mb-2">
                                  {mgmt.approaches.map((approach, i) => (
                                    <li key={i} className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                      • {approach}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {mgmt.monitoring?.length > 0 && (
                                <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                  <strong>Monitor:</strong> {mgmt.monitoring.join(', ')}
                                </p>
                              )}
                              {mgmt.cautions?.length > 0 && (
                                <p className={`text-xs mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                  <strong>⚠️ Caution:</strong> {mgmt.cautions.join(', ')}
                                </p>
                              )}
                              {mgmt.source && (
                                <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  Source: {mgmt.source}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className={`text-[10px] mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'} italic`}>
                          Management information is for clinical context and education. All treatment decisions require clinician judgment.
                        </p>
                      </div>
                    )}
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
                  <div className="h-[650px] overflow-hidden">
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
                                  ⚠️ Do not miss: {clinicalSynthesis.urgency_assessment.can_miss_diagnosis}
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
                    <span className={`ml-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Analyzing clinical data...</span>
                  </div>
                ) : differentialResults.length > 0 ? (
                  <DifferentialDashboard
                    differentials={differentialResults}
                    patientFindings={abnormalFindings}
                    symptoms={abnormalFindings.filter(f => f.type === 'symptom')}
                    onParameterClick={(paramName, type, expected) => {
                      console.log('Parameter clicked:', paramName, type, expected);
                      // Open Parameter Drill-Down Modal
                      setDrillDownModal({
                        isOpen: true,
                        parameterName: paramName,
                        parameterType: type,
                        expectedValue: expected,
                        currentDirection: expected?.direction || (type === 'symptom' ? 'present' : null)
                      });
                    }}
                  />
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
      
      {/* Parameter Drill-Down Modal */}
      <ParameterDrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={() => setDrillDownModal(prev => ({ ...prev, isOpen: false }))}
        parameterName={drillDownModal.parameterName}
        parameterType={drillDownModal.parameterType}
        expectedValue={drillDownModal.expectedValue}
        currentDirection={drillDownModal.currentDirection}
      />
    </div>
  );
};

export default DifferentialPage;
