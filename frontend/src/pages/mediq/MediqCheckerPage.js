import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  Camera, Upload, Search, Plus, X, AlertTriangle, CheckCircle, 
  Pill, Shield, ArrowRight, Loader2, AlertCircle, Info,
  ChevronDown, ChevronUp, XCircle, Activity, Beaker, Heart,
  FileText, User, Zap, AlertOctagon, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import FeatureNav from '../../components/FeatureNav';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Analysis status colors and icons
const STATUS_CONFIG = {
  ANALYSIS_COMPLETE: { color: 'green', icon: CheckCircle, label: 'Analysis Complete' },
  ANALYSIS_INCOMPLETE: { color: 'yellow', icon: AlertTriangle, label: 'Analysis Incomplete' },
  EXTRACTION_FAILED: { color: 'red', icon: XCircle, label: 'Extraction Failed' },
  MEDICATION_UNRESOLVED: { color: 'orange', icon: AlertCircle, label: 'Medications Unresolved' },
  KNOWLEDGE_BASE_UNAVAILABLE: { color: 'red', icon: AlertOctagon, label: 'Knowledge Base Error' },
  CLINICIAN_REVIEW_REQUIRED: { color: 'red', icon: AlertOctagon, label: 'Clinician Review Required' },
  NO_MEDICATIONS_PROVIDED: { color: 'gray', icon: Info, label: 'No Medications Provided' }
};

// Severity colors
const SEVERITY_COLORS = {
  contraindicated: 'bg-red-600 text-white',
  severe: 'bg-red-500 text-white',
  major: 'bg-orange-500 text-white',
  moderate: 'bg-yellow-500 text-black',
  minor: 'bg-blue-500 text-white',
  critical: 'bg-red-700 text-white',
  high: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white'
};

/**
 * MEDIQ Medicine Checker - Public Access
 * Upload prescriptions or enter medications for comprehensive safety screening
 */
const MediqCheckerPage = () => {
  const { isDark } = useTheme();
  const [medications, setMedications] = useState([]);
  const [newMedication, setNewMedication] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [activeTab, setActiveTab] = useState('manual');
  const [expandedSections, setExpandedSections] = useState({
    medications: true,
    interactions: true,
    patientRisks: true,
    warnings: true
  });
  
  // Patient context state
  const [patientContext, setPatientContext] = useState({
    age: '',
    egfr: '',
    potassium: '',
    conditions: '',
    allergies: ''
  });

  // Add medication manually
  const addMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  // Remove medication
  const removeMedication = (med) => {
    setMedications(medications.filter(m => m !== med));
  };

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          data: event.target.result,
          status: 'pending'
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Remove uploaded image
  const removeImage = (id) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== id));
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Analyze medications
  const analyzeMedications = async () => {
    if (medications.length === 0 && uploadedImages.length === 0) return;
    
    setIsAnalyzing(true);
    setAnalysisResults(null);

    try {
      // Build patient context object
      const patient_context = {};
      if (patientContext.age) patient_context.age = parseInt(patientContext.age);
      if (patientContext.conditions) {
        patient_context.conditions = patientContext.conditions.split(',').map(c => c.trim()).filter(c => c);
      }
      if (patientContext.allergies) {
        patient_context.allergies = patientContext.allergies.split(',').map(a => a.trim()).filter(a => a);
      }
      if (patientContext.egfr || patientContext.potassium) {
        patient_context.lab_values = {};
        if (patientContext.egfr) patient_context.lab_values.egfr = parseFloat(patientContext.egfr);
        if (patientContext.potassium) patient_context.lab_values.potassium = parseFloat(patientContext.potassium);
      }

      const response = await fetch(`${API_URL}/api/mediq/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medications,
          images: uploadedImages.map(img => ({ data: img.data, name: img.name })),
          patient_context: Object.keys(patient_context).length > 0 ? patient_context : null
        })
      });
      
      const data = await response.json();
      setAnalysisResults(data);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResults({
        success: false,
        analysis_status: 'KNOWLEDGE_BASE_UNAVAILABLE',
        analysis_complete: false,
        error: error.message,
        warnings: [{
          type: 'system_error',
          severity: 'critical',
          message: `Failed to connect to analysis service: ${error.message}`
        }]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get status configuration
  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.ANALYSIS_INCOMPLETE;
  };

  // Render interaction card
  const renderInteractionCard = (interaction, idx) => {
    const severityClass = SEVERITY_COLORS[interaction.severity] || 'bg-gray-500 text-white';
    
    return (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className={`p-4 rounded-lg mb-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-l-4 ${
          interaction.severity === 'contraindicated' ? 'border-red-600' :
          interaction.severity === 'severe' ? 'border-red-500' :
          interaction.severity === 'major' ? 'border-orange-500' :
          'border-yellow-500'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={severityClass}>
              {interaction.severity?.toUpperCase()}
            </Badge>
            <span className="font-semibold">
              {interaction.drug1} + {interaction.drug2}
            </span>
          </div>
          <Badge variant="outline" className={`text-xs ${isDark ? 'border-gray-600' : ''}`}>
            {interaction.evidence_level}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mechanism: </span>
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{interaction.mechanism}</span>
          </div>
          
          <div>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Clinical Effect: </span>
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{interaction.clinical_effect}</span>
          </div>
          
          <div className={`p-2 rounded ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <span className="font-medium text-cyan-500">Management: </span>
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{interaction.management}</span>
          </div>
          
          {interaction.monitoring && interaction.monitoring.length > 0 && (
            <div>
              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Monitoring: </span>
              <ul className={`list-disc list-inside ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {interaction.monitoring.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
          
          <div className="text-xs mt-2">
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
              Source: {interaction.evidence_source}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Medicine Checker | PHICOR MEDIQ</title>
        <meta name="description" content="Comprehensive medication safety screening. Check for drug interactions, renal dosing, and patient-specific risks." />
      </Helmet>
      
      <FeatureNav showTitle={true} />
      
      <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Clinical Safety Screening
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Medicine <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Checker</span>
            </h1>
            <p className={`max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Comprehensive drug interaction and safety screening. Upload a prescription or enter medications manually.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {/* Tab Selector */}
            <div className="flex justify-center mb-6">
              <div className={`inline-flex rounded-lg p-1 ${isDark ? 'bg-gray-900' : 'bg-gray-200'}`}>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'manual' 
                      ? 'bg-cyan-500 text-white' 
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Pill className="w-4 h-4 inline mr-2" />
                  Enter Manually
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'upload' 
                      ? 'bg-cyan-500 text-white' 
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  Upload Prescription
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Input */}
              <div className="lg:col-span-2 space-y-6">
                {/* Manual Entry */}
                {activeTab === 'manual' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`rounded-xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}
                  >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Pill className="w-5 h-5 text-cyan-500" />
                      Enter Your Medications
                    </h3>
                    
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Enter medication name (e.g., Metformin 500mg)"
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                        className={isDark ? 'bg-gray-800 border-gray-700' : ''}
                        data-testid="medication-input"
                      />
                      <Button onClick={addMedication} className="bg-cyan-500 hover:bg-cyan-600" data-testid="add-medication-btn">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Medication List */}
                    {medications.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4" data-testid="medication-list">
                        {medications.map((med, idx) => (
                          <Badge 
                            key={idx} 
                            className={`px-3 py-1.5 ${isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700'}`}
                          >
                            <Pill className="w-3.5 h-3.5 mr-1.5" />
                            {med}
                            <button onClick={() => removeMedication(med)} className="ml-2 hover:text-red-400">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {medications.length === 0 && (
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Add at least one medication to check for interactions
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Image Upload */}
                {activeTab === 'upload' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`rounded-xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}
                  >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-cyan-500" />
                      Upload Prescription Photo
                    </h3>

                    <label className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      isDark 
                        ? 'border-gray-700 hover:border-cyan-500/50 hover:bg-cyan-500/5' 
                        : 'border-gray-300 hover:border-cyan-500 hover:bg-cyan-50'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        data-testid="image-upload-input"
                      />
                      <Upload className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Click to upload or drag and drop
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        PNG, JPG up to 10MB
                      </p>
                    </label>

                    {uploadedImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {uploadedImages.map((img) => (
                          <div 
                            key={img.id} 
                            className={`relative rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                          >
                            <img src={img.data} alt={img.name} className="w-full h-24 object-cover" />
                            <button
                              onClick={() => removeImage(img.id)}
                              className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Analyze Button */}
                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={analyzeMedications}
                    disabled={isAnalyzing || (medications.length === 0 && uploadedImages.length === 0)}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 px-8"
                    data-testid="analyze-btn"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Check for Interactions
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Right Column - Patient Context */}
              <div className="space-y-6">
                <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-500" />
                    Patient Context
                    <Badge variant="outline" className="text-xs ml-auto">Optional</Badge>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Age</label>
                      <Input
                        type="number"
                        placeholder="e.g., 65"
                        value={patientContext.age}
                        onChange={(e) => setPatientContext({...patientContext, age: e.target.value})}
                        className={`mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                      />
                    </div>
                    
                    <div>
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>eGFR (mL/min/1.73m²)</label>
                      <Input
                        type="number"
                        placeholder="e.g., 35"
                        value={patientContext.egfr}
                        onChange={(e) => setPatientContext({...patientContext, egfr: e.target.value})}
                        className={`mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                      />
                    </div>
                    
                    <div>
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Potassium (mmol/L)</label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 5.4"
                        value={patientContext.potassium}
                        onChange={(e) => setPatientContext({...patientContext, potassium: e.target.value})}
                        className={`mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                      />
                    </div>
                    
                    <div>
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Conditions</label>
                      <Input
                        placeholder="e.g., CKD, Diabetes, AF"
                        value={patientContext.conditions}
                        onChange={(e) => setPatientContext({...patientContext, conditions: e.target.value})}
                        className={`mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                      />
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Separate with commas</p>
                    </div>
                    
                    <div>
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Allergies</label>
                      <Input
                        placeholder="e.g., Penicillin"
                        value={patientContext.allergies}
                        onChange={(e) => setPatientContext({...patientContext, allergies: e.target.value})}
                        className={`mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <AnimatePresence>
              {analysisResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 space-y-6"
                  data-testid="analysis-results"
                >
                  {/* Status Banner */}
                  {(() => {
                    const statusConfig = getStatusConfig(analysisResults.analysis_status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div className={`rounded-xl p-4 flex items-center gap-4 ${
                        statusConfig.color === 'green' ? (isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200') :
                        statusConfig.color === 'yellow' ? (isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200') :
                        statusConfig.color === 'orange' ? (isDark ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-orange-50 border border-orange-200') :
                        statusConfig.color === 'red' ? (isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200') :
                        (isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200')
                      }`}>
                        <StatusIcon className={`w-8 h-8 ${
                          statusConfig.color === 'green' ? 'text-green-500' :
                          statusConfig.color === 'yellow' ? 'text-yellow-500' :
                          statusConfig.color === 'orange' ? 'text-orange-500' :
                          statusConfig.color === 'red' ? 'text-red-500' :
                          'text-gray-500'
                        }`} />
                        <div className="flex-1">
                          <h3 className="font-semibold">{statusConfig.label}</h3>
                          {analysisResults.summary && (
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {analysisResults.summary.total_medications} medications analyzed • 
                              {analysisResults.summary.contraindicated_interactions + analysisResults.summary.severe_interactions} critical interactions
                            </p>
                          )}
                        </div>
                        {analysisResults.clinician_review_required && (
                          <Badge className="bg-red-600 text-white animate-pulse">
                            <AlertOctagon className="w-4 h-4 mr-1" />
                            URGENT REVIEW
                          </Badge>
                        )}
                      </div>
                    );
                  })()}

                  {/* Summary Cards */}
                  {analysisResults.summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                        <div className="text-2xl font-bold text-cyan-500">{analysisResults.summary.total_medications}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Medications</div>
                      </div>
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                        <div className={`text-2xl font-bold ${analysisResults.summary.contraindicated_interactions > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {analysisResults.summary.contraindicated_interactions}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Contraindicated</div>
                      </div>
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                        <div className={`text-2xl font-bold ${analysisResults.summary.severe_interactions + analysisResults.summary.major_interactions > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                          {analysisResults.summary.severe_interactions + analysisResults.summary.major_interactions}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Severe/Major</div>
                      </div>
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                        <div className={`text-2xl font-bold ${analysisResults.summary.patient_risks_identified > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {analysisResults.summary.patient_risks_identified}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Patient Risks</div>
                      </div>
                    </div>
                  )}

                  {/* Critical Warnings */}
                  {analysisResults.warnings && analysisResults.warnings.filter(w => w.severity === 'critical').length > 0 && (
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-500">
                        <AlertOctagon className="w-5 h-5" />
                        Critical Warnings
                      </h3>
                      {analysisResults.warnings.filter(w => w.severity === 'critical').map((warning, idx) => (
                        <div key={idx} className={`p-3 rounded-lg mb-2 ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                          <p className="font-medium text-red-500">{warning.message}</p>
                          {warning.action_required && (
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <strong>Action: </strong>{warning.action_required}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Medications Identified */}
                  <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <button
                      onClick={() => toggleSection('medications')}
                      className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                    >
                      <h3 className="font-semibold flex items-center gap-2">
                        <Pill className="w-5 h-5 text-cyan-500" />
                        Medications Identified ({analysisResults.medications_identified?.length || 0})
                      </h3>
                      {expandedSections.medications ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.medications && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 space-y-2">
                            {analysisResults.medications_identified?.map((med, idx) => (
                              <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3">
                                  <Pill className="w-5 h-5 text-cyan-500" />
                                  <div>
                                    <span className="font-medium">{med.name}</span>
                                    {med.generic_name && med.generic_name !== med.name && (
                                      <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        ({med.generic_name})
                                      </span>
                                    )}
                                    {med.strength && (
                                      <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {med.strength}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={med.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                                    {med.status}
                                  </Badge>
                                  <Badge variant="outline" className={`text-xs ${isDark ? 'border-gray-700' : ''}`}>
                                    {med.confidence}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Interactions */}
                  {analysisResults.interactions && analysisResults.interactions.total > 0 && (
                    <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
                      <button
                        onClick={() => toggleSection('interactions')}
                        className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                      >
                        <h3 className="font-semibold flex items-center gap-2">
                          <Zap className="w-5 h-5 text-orange-500" />
                          Drug Interactions ({analysisResults.interactions.total})
                        </h3>
                        {expandedSections.interactions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSections.interactions && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0">
                              {analysisResults.interactions.contraindicated?.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-red-500 mb-2 flex items-center gap-2">
                                    <XCircle className="w-4 h-4" />
                                    Contraindicated ({analysisResults.interactions.contraindicated.length})
                                  </h4>
                                  {analysisResults.interactions.contraindicated.map((i, idx) => renderInteractionCard(i, idx))}
                                </div>
                              )}
                              
                              {analysisResults.interactions.severe?.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                                    <AlertOctagon className="w-4 h-4" />
                                    Severe ({analysisResults.interactions.severe.length})
                                  </h4>
                                  {analysisResults.interactions.severe.map((i, idx) => renderInteractionCard(i, idx))}
                                </div>
                              )}
                              
                              {analysisResults.interactions.major?.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-orange-500 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Major ({analysisResults.interactions.major.length})
                                  </h4>
                                  {analysisResults.interactions.major.map((i, idx) => renderInteractionCard(i, idx))}
                                </div>
                              )}
                              
                              {analysisResults.interactions.moderate?.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-yellow-500 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Moderate ({analysisResults.interactions.moderate.length})
                                  </h4>
                                  {analysisResults.interactions.moderate.map((i, idx) => renderInteractionCard(i, idx))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Patient Risks */}
                  {analysisResults.patient_risks && analysisResults.patient_risks.length > 0 && (
                    <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
                      <button
                        onClick={() => toggleSection('patientRisks')}
                        className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                      >
                        <h3 className="font-semibold flex items-center gap-2">
                          <Heart className="w-5 h-5 text-pink-500" />
                          Patient-Specific Risks ({analysisResults.patient_risks.length})
                        </h3>
                        {expandedSections.patientRisks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSections.patientRisks && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 space-y-3">
                              {analysisResults.patient_risks.map((risk, idx) => (
                                <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-l-4 ${
                                  risk.severity === 'contraindicated' || risk.severity === 'severe' ? 'border-red-500' :
                                  risk.severity === 'major' || risk.severity === 'high' ? 'border-orange-500' :
                                  'border-yellow-500'
                                }`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={SEVERITY_COLORS[risk.severity] || 'bg-gray-500 text-white'}>
                                      {risk.severity?.toUpperCase()}
                                    </Badge>
                                    <span className="font-medium">{risk.type?.replace(/_/g, ' ').toUpperCase()}</span>
                                  </div>
                                  
                                  {risk.medication && (
                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      <strong>Medication:</strong> {risk.medication}
                                    </p>
                                  )}
                                  
                                  {risk.recommendation && (
                                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {risk.recommendation}
                                    </p>
                                  )}
                                  
                                  {risk.recommendations && risk.recommendations.length > 0 && (
                                    <ul className={`text-sm mt-2 list-disc list-inside ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {risk.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Safe Message (only if truly safe) */}
                  {analysisResults.safe_message && (
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                        <div>
                          <h3 className="font-semibold text-green-500">{analysisResults.safe_message.message}</h3>
                          <ul className={`text-sm mt-2 space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {analysisResults.safe_message.caveats?.map((caveat, idx) => (
                              <li key={idx}>• {caveat}</li>
                            ))}
                          </ul>
                          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {analysisResults.safe_message.action_required}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coverage Limitations */}
                  {analysisResults.coverage_limitations && (
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-500 mb-2">Coverage Limitations</h4>
                          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {analysisResults.coverage_limitations.map((limitation, idx) => (
                              <li key={idx}>• {limitation}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <strong className="text-red-500">CRITICAL DISCLAIMER:</strong> {analysisResults.disclaimer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default MediqCheckerPage;
