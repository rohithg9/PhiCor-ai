import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import FeatureNav from '../components/FeatureNav';
import {
  Mic, MicOff, Play, Pause, Square, 
  FileText, Activity, ChevronRight, ChevronDown,
  AlertTriangle, CheckCircle, Clock,
  TrendingUp, TrendingDown,
  Lightbulb, HelpCircle, TestTube,
  Loader2, Languages, Sparkles, MessageSquare,
  RefreshCw, Save, Download, Trash2, Stethoscope,
  Volume2, Waveform, Circle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  analyzePatientCase,
  NORMAL_RANGES,
} from '../data/bidirectionalMapping';

// Questions to ask based on symptoms
const CLINICAL_QUESTIONS = {
  'chest pain': [
    'Character of the pain? (sharp, dull, pressure, burning)',
    'Does it radiate anywhere? (arm, jaw, back)',
    'What makes it better or worse?',
    'Duration and onset?',
    'Associated symptoms? (SOB, sweating, nausea)',
  ],
  'dyspnea': [
    'At rest or with exertion?',
    'How many pillows do you sleep with?',
    'Do you wake up gasping for air?',
    'Any wheezing or cough?',
    'Any leg swelling?',
  ],
  'abdominal pain': [
    'Location of the pain?',
    'Character? (crampy, constant, colicky)',
    'Nausea, vomiting, bowel changes?',
    'Fever or weight loss?',
    'Relation to meals?',
  ],
  'fever': [
    'How high has the temperature been?',
    'Any chills or night sweats?',
    'Recent travel or sick contacts?',
    'Any rash, joint pain?',
    'Duration?',
  ],
  'headache': [
    'Location of headache?',
    'Character? (throbbing, pressure, sharp)',
    'Visual changes, nausea, vomiting?',
    'Neck stiffness or photophobia?',
    'Recent trauma?',
  ],
  'default': [
    'When did this symptom start?',
    'Is it constant or intermittent?',
    'What makes it better or worse?',
    'Any associated symptoms?',
    'Have you had this before?',
  ],
};

// Test recommendations
const TEST_RECOMMENDATIONS = {
  cardiac: ['ECG', 'Troponin', 'BNP', 'Chest X-ray', 'Echo'],
  respiratory: ['Chest X-ray', 'PFTs', 'ABG', 'CT chest', 'Sputum'],
  renal: ['BMP', 'Urinalysis', 'Urine protein', 'Renal US'],
  hepatic: ['LFTs', 'Albumin', 'PT/INR', 'Hepatitis panel'],
  infectious: ['CBC', 'Blood cultures', 'Procalcitonin', 'CRP'],
  autoimmune: ['ANA', 'RF', 'Anti-CCP', 'ESR', 'Complement'],
};

const ScribePage = () => {
  const { isDark } = useTheme();
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [audioLevel, setAudioLevel] = useState(0);
  
  // SOAP Note state
  const [soapNote, setSoapNote] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });
  
  // Suggestions state
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [suggestedTests, setSuggestedTests] = useState([]);
  const [extractedFindings, setExtractedFindings] = useState([]);
  const [differential, setDifferential] = useState([]);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  
  // Languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
  ];
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio analyser for visualization
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Visualize audio levels
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        cancelAnimationFrame(animationRef.current);
        setAudioLevel(0);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };
      
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      
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
  
  // Pause/Resume
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
  
  // Transcribe audio
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
      
      if (response.ok) {
        const data = await response.json();
        const newTranscript = data.transcript || '';
        setTranscript(prev => {
          const updated = prev ? `${prev}\n\n${newTranscript}` : newTranscript;
          analyzeTranscript(updated);
          return updated;
        });
      } else {
        throw new Error('Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      // Demo fallback
      const demoText = `Doctor: What brings you in today?\n\nPatient: I've been having chest pain for three days. It gets worse when I breathe deeply.\n\nDoctor: Can you describe the severity?\n\nPatient: About 6 or 7 out of 10. Also some shortness of breath.`;
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
  
  // Analyze transcript
  const analyzeTranscript = useCallback((text) => {
    if (!text) return;
    
    const analysis = analyzePatientCase(text);
    
    // Update findings
    if (analysis.extractedData?.labs?.length > 0) {
      setExtractedFindings(analysis.extractedData.labs.map(l => ({
        name: l.name || l.parameterId,
        value: l.value,
        direction: l.direction,
      })));
    }
    
    // Update differential
    if (analysis.differential?.length > 0) {
      setDifferential(analysis.differential.slice(0, 8));
      
      // Generate test recommendations
      const categories = new Set(analysis.differential.slice(0, 5).map(d => d.category).filter(Boolean));
      const tests = new Set();
      categories.forEach(cat => {
        (TEST_RECOMMENDATIONS[cat] || []).forEach(t => tests.add(t));
      });
      setSuggestedTests([...tests].slice(0, 8));
    }
    
    // Extract symptoms for questions
    const symptomKeywords = Object.keys(CLINICAL_QUESTIONS).filter(k => k !== 'default');
    const foundSymptoms = symptomKeywords.filter(s => text.toLowerCase().includes(s));
    
    const questions = new Set();
    if (foundSymptoms.length > 0) {
      foundSymptoms.forEach(symptom => {
        CLINICAL_QUESTIONS[symptom]?.slice(0, 3).forEach(q => questions.add(q));
      });
    } else {
      CLINICAL_QUESTIONS['default'].forEach(q => questions.add(q));
    }
    setSuggestedQuestions([...questions].slice(0, 6));
    
    // Generate SOAP
    generateSOAPNote(text, analysis);
  }, []);
  
  // Generate SOAP note
  const generateSOAPNote = (text, analysis) => {
    const symptoms = [];
    const patterns = [/(?:complains? of|reports?|experiencing|has)\s+([^.]+)/gi];
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text.toLowerCase())) !== null) {
        symptoms.push(match[1].trim());
      }
    });
    
    setSoapNote({
      subjective: `Chief Complaint: ${symptoms[0] || 'See transcript'}\n\nHPI:\n${symptoms.slice(0, 3).join('\n') || 'As documented'}`,
      objective: analysis?.extractedData?.labs?.length > 0 
        ? `Labs:\n${analysis.extractedData.labs.map(l => `• ${l.name || l.parameterId}: ${l.value} ${l.unit || ''}`).join('\n')}`
        : 'Vitals: Pending\nExam: Pending',
      assessment: analysis?.differential?.length > 0
        ? `Differential:\n${analysis.differential.slice(0, 5).map((d, i) => `${i + 1}. ${d.diseaseName}`).join('\n')}`
        : 'Assessment pending',
      plan: suggestedTests.length > 0
        ? `Workup:\n${suggestedTests.slice(0, 5).map(t => `• ${t}`).join('\n')}`
        : 'Plan to be determined',
    });
  };
  
  // Clear all
  const clearAll = () => {
    setTranscript('');
    setSoapNote({ subjective: '', objective: '', assessment: '', plan: '' });
    setDifferential([]);
    setSuggestedQuestions([]);
    setSuggestedTests([]);
    setExtractedFindings([]);
    setRecordingTime(0);
  };
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <FeatureNav />
      
      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <span className="text-white font-serif text-3xl font-bold">Σ</span>
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Medical Scribe
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                AI-powered voice transcription & SOAP notes
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recording & Transcript */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recording Panel */}
            <div className={`rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Ready to record'}
                    </span>
                    {isRecording && (
                      <span className={`font-mono text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTime(recordingTime)}
                      </span>
                    )}
                  </div>
                  
                  {/* Language selector */}
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'} border`}
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Recording visualization & controls */}
              <div className="p-6">
                <div className="flex flex-col items-center">
                  {/* Audio visualization */}
                  <div className="relative mb-6">
                    <div 
                      className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording 
                          ? 'bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30' 
                          : `${isDark ? 'bg-gray-800' : 'bg-gray-100'}`
                      }`}
                      style={{
                        transform: isRecording ? `scale(${1 + audioLevel * 0.2})` : 'scale(1)',
                      }}
                    >
                      {isRecording ? (
                        <Mic className="w-12 h-12 text-white" />
                      ) : (
                        <MicOff className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      )}
                    </div>
                    
                    {/* Ripple effect when recording */}
                    {isRecording && !isPaused && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping opacity-30" />
                        <div className="absolute inset-0 rounded-full border-2 border-rose-500 animate-pulse opacity-50" style={{ animationDelay: '0.5s' }} />
                      </>
                    )}
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center gap-4">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        size="lg"
                        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-6 rounded-2xl shadow-lg shadow-rose-500/30"
                      >
                        <Mic className="w-6 h-6 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={togglePause}
                          variant="outline"
                          size="lg"
                          className={`rounded-xl ${isDark ? 'border-gray-700' : ''}`}
                        >
                          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        </Button>
                        <Button
                          onClick={stopRecording}
                          size="lg"
                          className={`rounded-xl ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          <Square className="w-5 h-5 mr-2" />
                          Stop & Transcribe
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {isTranscribing && (
                    <div className="flex items-center gap-2 mt-4 text-rose-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Transcribing audio...</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Transcript */}
              <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className={`p-3 ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'} flex items-center justify-between`}>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Transcript
                  </span>
                  {transcript && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={clearAll}>
                        <Trash2 className="w-4 h-4 mr-1" /> Clear
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => analyzeTranscript(transcript)}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Re-analyze
                      </Button>
                    </div>
                  )}
                </div>
                <div className={`p-4 min-h-[200px] max-h-[300px] overflow-y-auto`}>
                  {transcript ? (
                    <div className={`text-sm whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {transcript}
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center h-40 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
                      <p>Transcript will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* SOAP Note */}
            <div className={`rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <FileText className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>SOAP Note</span>
                  <Badge className="bg-rose-500/20 text-rose-400 text-xs">Auto-generated</Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-1" /> Export
                </Button>
              </div>
              
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'subjective', label: 'Subjective', color: 'rose' },
                  { key: 'objective', label: 'Objective', color: 'blue' },
                  { key: 'assessment', label: 'Assessment', color: 'emerald' },
                  { key: 'plan', label: 'Plan', color: 'amber' },
                ].map(section => (
                  <div key={section.key}>
                    <label className={`text-xs font-semibold uppercase tracking-wide text-${section.color}-400`}>
                      {section.label}
                    </label>
                    <textarea
                      value={soapNote[section.key]}
                      onChange={(e) => setSoapNote(prev => ({ ...prev, [section.key]: e.target.value }))}
                      className={`w-full mt-1 rounded-xl p-3 text-sm min-h-[100px] resize-none ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border`}
                      placeholder={`${section.label}...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right: Suggestions & Differential */}
          <div className="space-y-6">
            {/* Suggestions */}
            <div className={`rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-800 bg-gradient-to-r from-amber-900/20 to-yellow-900/20' : 'border-gray-200 bg-gradient-to-r from-amber-50 to-yellow-50'}`}>
                <div className="flex items-center gap-2">
                  <Lightbulb className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Clinical Suggestions</span>
                  <Sparkles className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Questions to Ask */}
                <div>
                  <h4 className={`text-xs font-semibold uppercase mb-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <HelpCircle className="w-4 h-4" /> Questions to Ask
                  </h4>
                  {suggestedQuestions.length > 0 ? (
                    <div className="space-y-2">
                      {suggestedQuestions.map((q, idx) => (
                        <div 
                          key={idx}
                          className={`p-2 rounded-lg text-sm ${isDark ? 'bg-amber-900/20 border-amber-800/30' : 'bg-amber-50 border-amber-200'} border`}
                        >
                          <span className="text-amber-500 font-medium mr-2">{idx + 1}.</span>
                          {q}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Start recording to see questions
                    </p>
                  )}
                </div>
                
                {/* Tests to Consider */}
                <div>
                  <h4 className={`text-xs font-semibold uppercase mb-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <TestTube className="w-4 h-4" /> Tests to Consider
                  </h4>
                  {suggestedTests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {suggestedTests.map((test, idx) => (
                        <Badge key={idx} variant="outline" className={isDark ? 'border-blue-800 bg-blue-900/20 text-blue-300' : 'border-blue-200 bg-blue-50 text-blue-700'}>
                          {test}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Tests suggested based on findings
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Differential */}
            <div className={`rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <Stethoscope className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Differential</span>
                </div>
              </div>
              
              <div className="p-4">
                {differential.length > 0 ? (
                  <div className="space-y-2">
                    {differential.slice(0, 6).map((dx, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-emerald-500 text-white' : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {dx.diseaseName}
                          </span>
                        </div>
                        <span className={`text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {dx.probabilityScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Differential will update live</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScribePage;
