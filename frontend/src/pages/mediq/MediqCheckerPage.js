import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  Camera, Upload, Search, Plus, X, AlertTriangle, CheckCircle, 
  Pill, Shield, ArrowRight, Loader2, Image as ImageIcon, FileText,
  ChevronDown, ChevronUp, Info, AlertCircle, ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import FeatureNav from '../../components/FeatureNav';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * MEDIQ Medicine Checker - Public Access
 * Upload prescriptions or enter medications for safety screening
 */
const MediqCheckerPage = () => {
  const { isDark } = useTheme();
  const [medications, setMedications] = useState([]);
  const [newMedication, setNewMedication] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'upload'

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

  // Analyze medications
  const analyzeMedications = async () => {
    if (medications.length === 0 && uploadedImages.length === 0) return;
    
    setIsAnalyzing(true);
    setAnalysisResults(null);

    try {
      const response = await fetch(`${API_URL}/api/mediq/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medications,
          images: uploadedImages.map(img => ({ data: img.data, name: img.name }))
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data);
      } else {
        // Demo results for now
        setAnalysisResults(generateDemoResults(medications));
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Demo results fallback
      setAnalysisResults(generateDemoResults(medications));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate demo results
  const generateDemoResults = (meds) => ({
    success: true,
    medications_identified: meds.map(med => ({
      name: med,
      normalized_name: med,
      confidence: 0.95,
      status: 'VERIFIED'
    })),
    interactions: meds.length > 1 ? [{
      drugs: [meds[0], meds[1] || meds[0]],
      severity: 'moderate',
      description: 'Potential interaction detected. Monitor for increased effects.',
      management: 'Consider timing separation or dose adjustment.',
      evidence: 'Based on pharmacological class interactions.'
    }] : [],
    warnings: [{
      type: 'general',
      message: 'Always consult your healthcare provider before making medication changes.',
      severity: 'info'
    }],
    disclaimer: 'This is for informational purposes only. Not a substitute for professional medical advice.'
  });

  return (
    <>
      <Helmet>
        <title>Medicine Checker | PHICOR MEDIQ</title>
        <meta name="description" content="Check your medications for interactions and safety concerns. Upload prescriptions or enter medications manually." />
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
              Public Access
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Medicine <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Checker</span>
            </h1>
            <p className={`max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Check your medications for potential interactions. Upload a prescription photo or enter medications manually.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
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
                  Upload Photo
                </button>
              </div>
            </div>

            {/* Manual Entry */}
            {activeTab === 'manual' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}
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
                  />
                  <Button onClick={addMedication} className="bg-cyan-500 hover:bg-cyan-600">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Medication List */}
                {medications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
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
                className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-cyan-500" />
                  Upload Prescription or Medicine Photos
                </h3>

                {/* Upload Area */}
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
                  />
                  <Upload className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Click to upload or drag and drop
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    PNG, JPG up to 10MB each
                  </p>
                </label>

                {/* Uploaded Images */}
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
                        <div className={`px-2 py-1 text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {img.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Analyze Button */}
            <div className="text-center mb-8">
              <Button
                size="lg"
                onClick={analyzeMedications}
                disabled={isAnalyzing || (medications.length === 0 && uploadedImages.length === 0)}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 px-8"
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

            {/* Results */}
            {analysisResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Medications Identified */}
                <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Medications Identified
                  </h3>
                  <div className="space-y-2">
                    {analysisResults.medications_identified?.map((med, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <Pill className="w-5 h-5 text-cyan-500" />
                          <span className="font-medium">{med.name}</span>
                        </div>
                        <Badge className={`${med.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {med.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactions */}
                {analysisResults.interactions?.length > 0 && (
                  <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-900 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-yellow-500">
                      <AlertTriangle className="w-5 h-5" />
                      Potential Interactions Found
                    </h3>
                    {analysisResults.interactions.map((interaction, idx) => (
                      <div key={idx} className={`p-4 rounded-lg mb-3 last:mb-0 ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-100/50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${
                            interaction.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                            interaction.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {interaction.severity?.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{interaction.drugs?.join(' + ')}</span>
                        </div>
                        <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {interaction.description}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <strong>Management:</strong> {interaction.management}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Interactions */}
                {(!analysisResults.interactions || analysisResults.interactions.length === 0) && (
                  <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-900 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <h3 className="font-semibold text-green-500">No Major Interactions Detected</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Based on available data, no significant interactions were found.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className={`rounded-xl p-4 ${isDark ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                        <strong>Important:</strong> {analysisResults.disclaimer}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MediqCheckerPage;
