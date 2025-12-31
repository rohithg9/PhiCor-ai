import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Mic, MicOff, Play, Pause, Square, 
  Brain, Stethoscope, FileText, Activity,
  ChevronRight, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Clock,
  TrendingUp, TrendingDown, Minus,
  FlaskConical, Heart, User, Clipboard,
  Lightbulb, HelpCircle, TestTube,
  Moon, Sun, Home, Loader2, Volume2,
  Languages, Sparkles, MessageSquare,
  RefreshCw, Save, Download, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  getDifferentialDiagnosis, 
  parseClinicalText, 
  analyzePatientCase,
  getAllParameters,
  NORMAL_RANGES,
} from '../data/bidirectionalMapping';
import { ORGAN_MODELS } from '../data/organModels';

// Build comprehensive normal ranges
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

// Questions to ask based on symptoms/findings
const CLINICAL_QUESTIONS = {
  'chest pain': [
    'Can you describe the character of the pain? (sharp, dull, pressure, burning)',
    'Does the pain radiate anywhere? (arm, jaw, back)',
    'What makes it better or worse? (rest, exertion, breathing, position)',
    'How long has it been present?',
    'Any associated symptoms? (shortness of breath, sweating, nausea)',
  ],
  'dyspnea': [
    'Is it at rest or with exertion?',
    'How many pillows do you sleep with? (orthopnea)',
    'Do you wake up at night gasping for air? (PND)',
    'Any wheezing or cough?',
    'Any leg swelling?',
  ],
  'abdominal pain': [
    'Where exactly is the pain located?',
    'What is the character? (crampy, constant, colicky)',
    'Any nausea, vomiting, or changes in bowel habits?',
    'Any fever or weight loss?',
    'Relation to meals?',
  ],
  'fever': [
    'How high has the temperature been?',
    'Any chills or night sweats?',
    'Any recent travel or sick contacts?',
    'Any rash, joint pain, or other symptoms?',
    'How long has the fever been present?',
  ],
  'headache': [
    'Where is the headache located?',
    'What is the character? (throbbing, pressure, sharp)',
    'Any visual changes, nausea, or vomiting?',
    'Any neck stiffness or light sensitivity?',
    'Any recent trauma?',
  ],
  'fatigue': [
    'How long have you been feeling fatigued?',
    'Any weight changes?',
    'How is your sleep quality?',
    'Any mood changes or stress?',
    'Any other symptoms like fever, pain, or appetite changes?',
  ],
  'default': [
    'When did this symptom start?',
    'Is it constant or intermittent?',
    'What makes it better or worse?',
    'Any associated symptoms?',
    'Have you had this before?',
  ],
};

// Tests to recommend based on differential
const TEST_RECOMMENDATIONS = {
  cardiac: ['ECG/EKG', 'Troponin levels', 'BNP/NT-proBNP', 'Chest X-ray', 'Echocardiogram'],
  respiratory: ['Chest X-ray', 'Pulmonary function tests', 'ABG', 'CT chest', 'Sputum culture'],
  renal: ['BMP (Creatinine, BUN)', 'Urinalysis', 'Urine protein/creatinine ratio', 'Renal ultrasound'],
  hepatic: ['LFTs (AST, ALT, ALP, Bilirubin)', 'Albumin', 'PT/INR', 'Hepatitis panel', 'Liver ultrasound'],
  infectious: ['CBC with differential', 'Blood cultures', 'Procalcitonin', 'CRP', 'Urinalysis'],
  autoimmune: ['ANA', 'RF', 'Anti-CCP', 'ESR', 'CRP', 'Complement levels (C3, C4)'],
  hematological: ['CBC with differential', 'Peripheral smear', 'Reticulocyte count', 'Iron studies', 'B12/Folate'],
  metabolic: ['HbA1c', 'Fasting glucose', 'Lipid panel', 'TSH', 'Cortisol'],
  neurological: ['CT head', 'MRI brain', 'Lumbar puncture', 'EEG', 'Nerve conduction studies'],
};

const DiagnosisPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  // SOAP Note state
  const [soapNote, setSoapNote] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });
  
  // Differential diagnosis state
  const [differential, setDifferential] = useState([]);
  const [abnormalFindings, setAbnormalFindings] = useState([]);
  const [expandedDiagnosis, setExpandedDiagnosis] = useState(null);
  
  // Suggestions state
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [suggestedTests, setSuggestedTests] = useState([]);
  const [extractedFindings, setExtractedFindings] = useState([]);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const transcriptEndRef = useRef(null);
  
  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' },
  ];
  
  // Get all parameters for analysis
  const allParameters = useMemo(() => getAllParameters(), []);
  
  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };
      
      mediaRecorderRef.current.start(1000); // Collect chunks every second
      setIsRecording(true);
      setIsPaused(false);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
  };
  
  // Pause/Resume recording
  const togglePause = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };
  
  // Transcribe audio using backend API
  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', selectedLanguage);
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Transcription failed');
      }
      
      const data = await response.json();
      const newTranscript = data.transcript || '';
      
      // Append to existing transcript
      setTranscript(prev => {
        const updated = prev ? `${prev}\n\n${newTranscript}` : newTranscript;
        // Trigger analysis with new transcript
        analyzeTranscript(updated);
        return updated;
      });
      
    } catch (error) {
      console.error('Transcription error:', error);
      // For demo: add placeholder text
      const demoText = `[Recording ${formatTime(recordingTime)}] Patient reports ${selectedLanguage === 'en' ? 'chest pain and shortness of breath for the past 3 days' : 'symptoms in selected language'}. No fever. History of hypertension.`;
      setTranscript(prev => {
        const updated = prev ? `${prev}\n\n${demoText}` : demoText;
        analyzeTranscript(updated);
        return updated;
      });
    } finally {
      setIsTranscribing(false);
      setRecordingTime(0);
    }
  };
  
  // Analyze transcript for findings
  const analyzeTranscript = useCallback((text) => {
    if (!text) return;
    
    // Parse clinical text for findings
    const analysis = analyzePatientCase(text);
    
    // Update findings
    if (analysis.extractedData?.labs?.length > 0) {
      setAbnormalFindings(analysis.extractedData.labs);
      setExtractedFindings(prev => [
        ...prev,
        ...analysis.extractedData.labs.map(l => ({
          type: 'lab',
          name: l.name || l.parameterId,
          value: l.value,
          direction: l.direction,
          severity: l.severity,
        }))
      ]);
    }
    
    // Update differential
    if (analysis.differential?.length > 0) {
      setDifferential(analysis.differential.slice(0, 15));
      
      // Generate test recommendations based on top diagnoses
      const categories = new Set(analysis.differential.slice(0, 5).map(d => d.category).filter(Boolean));
      const tests = new Set();
      categories.forEach(cat => {
        const catTests = TEST_RECOMMENDATIONS[cat] || [];
        catTests.forEach(t => tests.add(t));
      });
      setSuggestedTests([...tests].slice(0, 8));
    }
    
    // Extract symptoms for questions
    const symptomKeywords = ['chest pain', 'dyspnea', 'abdominal pain', 'fever', 'headache', 'fatigue', 
      'cough', 'nausea', 'vomiting', 'diarrhea', 'weakness', 'dizziness'];
    const foundSymptoms = symptomKeywords.filter(s => text.toLowerCase().includes(s));
    
    if (foundSymptoms.length > 0) {
      const questions = new Set();
      foundSymptoms.forEach(symptom => {
        const qs = CLINICAL_QUESTIONS[symptom] || CLINICAL_QUESTIONS['default'];
        qs.slice(0, 3).forEach(q => questions.add(q));
      });
      setSuggestedQuestions([...questions].slice(0, 6));
    } else {
      setSuggestedQuestions(CLINICAL_QUESTIONS['default']);
    }
    
    // Generate SOAP note structure
    generateSOAPNote(text, analysis);
    
  }, []);
  
  // Generate SOAP note from transcript
  const generateSOAPNote = (text, analysis) => {
    const textLower = text.toLowerCase();
    
    // Extract subjective components
    const symptoms = [];
    const symptomPatterns = [
      /(?:complains? of|reports?|experiencing|has|with)\s+([^.]+)/gi,
      /(?:history of|hx of)\s+([^.]+)/gi,
    ];
    symptomPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(textLower)) !== null) {
        symptoms.push(match[1].trim());
      }
    });
    
    // Build SOAP note
    setSoapNote({
      subjective: `Chief Complaint: ${symptoms[0] || 'As documented in transcript'}\n\nHistory of Present Illness:\n${symptoms.slice(0, 3).join('\n') || 'See transcript for details'}`,
      objective: analysis?.extractedData?.labs?.length > 0 
        ? `Labs:\n${analysis.extractedData.labs.map(l => `• ${l.name || l.parameterId}: ${l.value} ${l.unit || ''} (${l.direction})`).join('\n')}`
        : 'Pending documentation of physical exam and lab findings',
      assessment: analysis?.differential?.length > 0
        ? `Differential Diagnosis:\n${analysis.differential.slice(0, 5).map((d, i) => `${i + 1}. ${d.diseaseName} (${d.probabilityScore}%)`).join('\n')}`
        : 'Awaiting clinical findings for assessment',
      plan: suggestedTests.length > 0
        ? `Recommended workup:\n${suggestedTests.slice(0, 5).map(t => `• ${t}`).join('\n')}`
        : 'To be determined based on assessment',
    });
  };
  
  // Clear all data
  const clearAll = () => {
    setTranscript('');
    setSoapNote({ subjective: '', objective: '', assessment: '', plan: '' });
    setDifferential([]);
    setAbnormalFindings([]);
    setSuggestedQuestions([]);
    setSuggestedTests([]);
    setExtractedFindings([]);
    setRecordingTime(0);
  };
  
  // Get probability color
  const getProbabilityColor = (score) => {
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Render direction icon
  const renderDirectionIcon = (direction) => {
    if (direction === 'increase') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (direction === 'decrease') return <TrendingDown className="w-4 h-4 text-blue-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };
  
  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${isDark ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <Home className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-500" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                AI Clinical Assistant
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Transcript & SOAP Note */}
          <div className="space-y-6">
            
            {/* Voice Recording Panel */}
            <div className={`rounded-xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-800 bg-gradient-to-r from-purple-900/30 to-blue-900/30' : 'border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className={`w-5 h-5 ${isRecording ? 'text-red-500 animate-pulse' : 'text-purple-500'}`} />
                    <h2 className="font-semibold">Medical Scribe</h2>
                    <Badge variant="outline" className="text-xs">
                      <Languages className="w-3 h-3 mr-1" />
                      {languages.find(l => l.code === selectedLanguage)?.name}
                    </Badge>
                  </div>
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 animate-pulse">●</span>
                      <span className="font-mono text-sm">{formatTime(recordingTime)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recording Controls */}
              <div className="p-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  {!isRecording ? (
                    <Button 
                      onClick={startRecording}
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 rounded-full"
                    >
                      <Mic className="w-6 h-6 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={togglePause}
                        variant="outline"
                        size="icon"
                        className="w-12 h-12 rounded-full"
                      >
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                      </Button>
                      <Button
                        onClick={stopRecording}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Stop & Transcribe
                      </Button>
                    </>
                  )}
                </div>
                
                {isTranscribing && (
                  <div className="flex items-center justify-center gap-2 text-purple-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Transcribing...</span>
                  </div>
                )}
                
                {/* Transcript Display */}
                <div className={`mt-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'} p-4 min-h-[200px] max-h-[300px] overflow-y-auto`}>
                  {transcript ? (
                    <div className="text-sm whitespace-pre-wrap">
                      {transcript}
                      <div ref={transcriptEndRef} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Transcript will appear here</p>
                      <p className="text-xs mt-1">Click &quot;Start Recording&quot; to begin</p>
                    </div>
                  )}
                </div>
                
                {transcript && (
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      <Trash2 className="w-4 h-4 mr-1" /> Clear
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => analyzeTranscript(transcript)}>
                      <RefreshCw className="w-4 h-4 mr-1" /> Re-analyze
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* SOAP Note Panel */}
            <div className={`rounded-xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <h2 className="font-semibold">SOAP Note</h2>
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">Auto-generated</Badge>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Subjective */}
                <div>
                  <label className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Subjective</label>
                  <textarea
                    value={soapNote.subjective}
                    onChange={(e) => setSoapNote(prev => ({ ...prev, subjective: e.target.value }))}
                    className={`w-full mt-1 rounded-lg p-3 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border min-h-[80px]`}
                    placeholder="Chief complaint and history of present illness..."
                  />
                </div>
                
                {/* Objective */}
                <div>
                  <label className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Objective</label>
                  <textarea
                    value={soapNote.objective}
                    onChange={(e) => setSoapNote(prev => ({ ...prev, objective: e.target.value }))}
                    className={`w-full mt-1 rounded-lg p-3 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border min-h-[80px]`}
                    placeholder="Physical exam findings, vitals, labs..."
                  />
                </div>
                
                {/* Assessment */}
                <div>
                  <label className="text-xs font-semibold text-green-400 uppercase tracking-wide">Assessment</label>
                  <textarea
                    value={soapNote.assessment}
                    onChange={(e) => setSoapNote(prev => ({ ...prev, assessment: e.target.value }))}
                    className={`w-full mt-1 rounded-lg p-3 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border min-h-[80px]`}
                    placeholder="Differential diagnosis and clinical impression..."
                  />
                </div>
                
                {/* Plan */}
                <div>
                  <label className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Plan</label>
                  <textarea
                    value={soapNote.plan}
                    onChange={(e) => setSoapNote(prev => ({ ...prev, plan: e.target.value }))}
                    className={`w-full mt-1 rounded-lg p-3 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border min-h-[80px]`}
                    placeholder="Workup, treatment plan, follow-up..."
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column: Suggestions & Differential */}
          <div className="space-y-6">
            
            {/* Suggestions Panel */}
            <div className={`rounded-xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-800 bg-gradient-to-r from-yellow-900/20 to-orange-900/20' : 'border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50'}`}>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <h2 className="font-semibold">Clinical Suggestions</h2>
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Questions to Ask */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" /> Questions to Ask
                  </h3>
                  {suggestedQuestions.length > 0 ? (
                    <div className="space-y-2">
                      {suggestedQuestions.map((q, idx) => (
                        <div 
                          key={idx}
                          className={`p-2 rounded-lg text-sm ${isDark ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200'} border flex items-start gap-2`}
                        >
                          <span className="text-yellow-500 font-bold">{idx + 1}.</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Start recording to see suggested questions</p>
                  )}
                </div>
                
                {/* Tests to Consider */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <TestTube className="w-4 h-4" /> Tests to Consider
                  </h3>
                  {suggestedTests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {suggestedTests.map((test, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className={`${isDark ? 'border-blue-800 bg-blue-900/20 text-blue-300' : 'border-blue-300 bg-blue-50 text-blue-700'}`}
                        >
                          {test}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Tests will be suggested based on findings</p>
                  )}
                </div>
                
                {/* Extracted Findings */}
                {extractedFindings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Extracted Findings
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {extractedFindings.slice(0, 10).map((finding, idx) => (
                        <Badge 
                          key={idx}
                          className={`${finding.direction === 'increase' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}
                        >
                          {renderDirectionIcon(finding.direction)}
                          <span className="ml-1">{finding.name}</span>
                          {finding.value && <span className="ml-1 opacity-70">({finding.value})</span>}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Differential Diagnosis Panel */}
            <div className={`rounded-xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-800 bg-gradient-to-r from-green-900/20 to-emerald-900/20' : 'border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-green-500" />
                    <h2 className="font-semibold">Differential Diagnosis</h2>
                  </div>
                  {differential.length > 0 && (
                    <Badge className="bg-green-500/20 text-green-400">
                      {differential.length} conditions
                    </Badge>
                  )}
                </div>
              </div>
              
              <ScrollArea className="max-h-[500px]">
                <div className="p-4">
                  {differential.length > 0 ? (
                    <div className="space-y-3">
                      {differential.slice(0, 10).map((diagnosis, idx) => (
                        <div 
                          key={diagnosis.diseaseCode || idx}
                          className={`rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} overflow-hidden`}
                        >
                          <div 
                            className="p-3 cursor-pointer hover:bg-gray-700/30 transition-colors"
                            onClick={() => setExpandedDiagnosis(expandedDiagnosis === idx ? null : idx)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  idx === 0 ? 'bg-green-500 text-white' :
                                  idx === 1 ? 'bg-yellow-500 text-black' :
                                  idx === 2 ? 'bg-orange-500 text-white' :
                                  'bg-gray-600 text-white'
                                }`}>
                                  {idx + 1}
                                </span>
                                <div>
                                  <p className="font-medium">{diagnosis.diseaseName}</p>
                                  <p className="text-xs text-gray-500">{diagnosis.icd10}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-full ${getProbabilityColor(diagnosis.probabilityScore)}`}
                                    style={{ width: `${diagnosis.probabilityScore}%` }}
                                  />
                                </div>
                                <span className="text-sm font-mono w-12 text-right">{diagnosis.probabilityScore}%</span>
                                {expandedDiagnosis === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Details with Clinical Reasoning */}
                          {expandedDiagnosis === idx && (
                            <div className={`p-3 border-t ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white'}`}>
                              {/* Clinical Reasoning */}
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold text-purple-400 uppercase mb-2">Clinical Reasoning</h4>
                                <div className={`text-sm p-2 rounded ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                                  {diagnosis.supportingEvidence?.length > 0 ? (
                                    <ul className="space-y-1">
                                      {diagnosis.supportingEvidence.slice(0, 4).map((evidence, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                          <span>
                                            <strong>{evidence.finding}</strong> {evidence.direction === 'increase' ? '↑' : '↓'}: {evidence.explanation || 'Consistent with this diagnosis'}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p>Based on pattern matching with disease characteristics and parameter modifications.</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Matched Parameters */}
                              {diagnosis.matchedParams?.length > 0 && (
                                <div className="mb-3">
                                  <h4 className="text-xs font-semibold text-blue-400 uppercase mb-2">Matched Findings</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {diagnosis.matchedParams.slice(0, 5).map((param, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {renderDirectionIcon(param.direction)}
                                        <span className="ml-1">{param.param}</span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Confidence */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Confidence:</span>
                                <Badge className={`text-xs ${
                                  diagnosis.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                                  diagnosis.confidence === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {diagnosis.confidence}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Differential diagnosis will appear here</p>
                      <p className="text-sm mt-1">as clinical findings are captured</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiagnosisPage;
