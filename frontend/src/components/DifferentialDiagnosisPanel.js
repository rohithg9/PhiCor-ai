import React, { useState, useCallback, useMemo } from 'react';
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
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  getDifferentialDiagnosis, 
  parseClinicalText, 
  analyzePatientCase,
  createTestPatient,
  getAllParameters,
  NORMAL_RANGES,
} from '../data/bidirectionalMapping';

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
  const [paramDirection, setParamDirection] = useState('increase');
  const [paramSeverity, setParamSeverity] = useState(1);
  
  // Get all available parameters
  const allParameters = useMemo(() => getAllParameters(), []);
  
  // Add a finding manually
  const addFinding = useCallback(() => {
    if (!selectedParam) return;
    
    const existing = abnormalFindings.find(f => f.parameterId === selectedParam);
    if (existing) return;
    
    const newFinding = {
      id: `finding_${Date.now()}`,
      parameterId: selectedParam,
      organ: selectedOrgan,
      direction: paramDirection,
      severity: paramSeverity,
      normalRange: NORMAL_RANGES[selectedParam] ? 
        `${NORMAL_RANGES[selectedParam].min}-${NORMAL_RANGES[selectedParam].max} ${NORMAL_RANGES[selectedParam].unit}` : 
        'N/A',
    };
    
    setAbnormalFindings(prev => [...prev, newFinding]);
    setSelectedParam('');
  }, [selectedParam, selectedOrgan, paramDirection, paramSeverity, abnormalFindings]);
  
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
            <div className="grid grid-cols-4 gap-2">
              <select
                value={selectedOrgan}
                onChange={(e) => {
                  setSelectedOrgan(e.target.value);
                  setSelectedParam('');
                }}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">Select Organ</option>
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
              
              <select
                value={paramDirection}
                onChange={(e) => setParamDirection(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="increase">↑ Increased</option>
                <option value="decrease">↓ Decreased</option>
              </select>
              
              <Button
                onClick={addFinding}
                disabled={!selectedParam}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            
            {/* Severity Slider */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Severity:</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={paramSeverity}
                onChange={(e) => setParamSeverity(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-white w-16">
                {paramSeverity <= 1 ? 'Mild' : paramSeverity <= 2 ? 'Moderate' : 'Severe'}
              </span>
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
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm"
                >
                  {renderDirectionIcon(finding.direction)}
                  <span className="text-white">{finding.parameterId.replace(/_/g, ' ')}</span>
                  {finding.value && (
                    <span className="text-gray-400">({finding.value})</span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    finding.severity >= 2 ? 'bg-red-900/50 text-red-400' :
                    finding.severity >= 1 ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {finding.severity >= 2 ? 'Severe' : finding.severity >= 1 ? 'Moderate' : 'Mild'}
                  </span>
                  <button
                    onClick={() => removeFinding(finding.id)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
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
                                <DirectionIcon direction={param.direction} />
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
