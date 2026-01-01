import React, { useState, useRef } from 'react';
import { 
  User, BookOpen, Sparkles, Shuffle, Play, Heart, 
  Stethoscope, Brain, FlaskConical, AlertTriangle,
  ChevronRight, Clock, Target, Zap, GraduationCap,
  Activity, Wind, Droplets, Thermometer, Upload,
  FileText, Loader2, CheckCircle, X, ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

// ============== QUICK DEMO CASES (5 Examples) ==============
const DEMO_CASES = [
  {
    id: 'heart-failure',
    title: 'Heart Failure',
    icon: Heart,
    color: 'red',
    difficulty: 'Beginner',
    specialty: 'Cardiology',
    description: 'Classic presentation of decompensated heart failure',
    clinicalText: `72-year-old female with progressive dyspnea on exertion over 2 weeks, now dyspneic at rest.
Associated symptoms: Orthopnea (3 pillows), paroxysmal nocturnal dyspnea, bilateral leg swelling.
Physical exam: JVP elevated, bibasilar crackles, S3 gallop, pitting edema to mid-shin bilaterally.
Echo: Dilated LV (LVEDD 6.5cm), severely reduced EF (20%), global hypokinesis, moderate MR.
Labs: BNP 1850 pg/mL, Creatinine 1.6 mg/dL, Na 131 mEq/L, Hgb 10.8 g/dL
CXR: Cardiomegaly, pulmonary vascular congestion, bilateral pleural effusions.
PMH: Hypertension, Type 2 DM, prior MI 8 years ago, CKD stage 3.`,
    expectedDiagnosis: 'Heart Failure with Reduced Ejection Fraction (HFrEF)',
    learningPoints: ['Recognize classic HF symptoms', 'Interpret BNP in context', 'Identify cardiorenal syndrome']
  },
  {
    id: 'stemi',
    title: 'Acute MI (STEMI)',
    icon: Zap,
    color: 'orange',
    difficulty: 'Beginner',
    specialty: 'Cardiology',
    description: 'Acute coronary syndrome with ST elevation',
    clinicalText: `58-year-old male with sudden onset severe crushing substernal chest pain radiating to left arm, started 45 minutes ago.
Associated: Diaphoresis, nausea, shortness of breath, feeling of impending doom.
Risk factors: Smoker 30 pack-years, hypertension, hyperlipidemia, family history of MI.
Vitals: BP 95/60, HR 110, RR 24, SpO2 94% on room air.
Physical: Diaphoretic, anxious, S4 gallop, no murmurs, lungs clear.
ECG: ST elevation V1-V4 (2-4mm), reciprocal ST depression in inferior leads.
Labs: Troponin I 8.5 ng/mL (reference <0.04), CK-MB 85 U/L.
CXR: No acute cardiopulmonary process.`,
    expectedDiagnosis: 'Acute Anterior ST-Elevation Myocardial Infarction (STEMI)',
    learningPoints: ['Time is muscle - recognize STEMI quickly', 'ECG pattern recognition', 'Understand reperfusion therapy urgency']
  },
  {
    id: 'pneumonia',
    title: 'Community Pneumonia',
    icon: Wind,
    color: 'blue',
    difficulty: 'Beginner',
    specialty: 'Pulmonology',
    description: 'Typical bacterial community-acquired pneumonia',
    clinicalText: `67-year-old male with 4-day history of productive cough with rust-colored sputum.
Associated: Fever up to 39.2°C, rigors, pleuritic right-sided chest pain, dyspnea.
Social: Lives independently, no recent travel, no sick contacts.
Vitals: Temp 38.8°C, BP 110/70, HR 105, RR 26, SpO2 91% on room air.
Physical: Appears ill, bronchial breath sounds RLL, dullness to percussion RLL, egophony present.
Labs: WBC 18,500 with 85% neutrophils, left shift (15% bands), Procalcitonin 2.5 ng/mL.
CXR: Right lower lobe consolidation with air bronchograms.
ABG: pH 7.48, pCO2 32, pO2 62, HCO3 24 on room air.`,
    expectedDiagnosis: 'Community-Acquired Pneumonia (CAP)',
    learningPoints: ['Recognize lobar pneumonia findings', 'Severity assessment (CURB-65)', 'Appropriate antibiotic selection']
  },
  {
    id: 'dka',
    title: 'Diabetic Ketoacidosis',
    icon: Droplets,
    color: 'purple',
    difficulty: 'Intermediate',
    specialty: 'Endocrinology',
    description: 'Classic DKA presentation in Type 1 Diabetes',
    clinicalText: `24-year-old female with Type 1 DM presenting with 2 days of nausea, vomiting, abdominal pain, and confusion.
History: Ran out of insulin 3 days ago, recent URI symptoms.
Associated: Polyuria, polydipsia, weight loss, generalized weakness.
Vitals: Temp 37.8°C, BP 95/55, HR 125, RR 28 (deep, rapid - Kussmaul), SpO2 99%.
Physical: Dry mucous membranes, poor skin turgor, fruity breath odor, diffuse abdominal tenderness.
Labs: Glucose 485 mg/dL, Na 128 mEq/L, K 5.8 mEq/L, Cl 95 mEq/L, HCO3 8 mEq/L.
ABG: pH 7.18, pCO2 18, pO2 98, calculated AG = 25.
Serum ketones: Large positive. Urine ketones: 3+.
Cr 1.4 mg/dL, BUN 32 mg/dL.`,
    expectedDiagnosis: 'Diabetic Ketoacidosis (DKA)',
    learningPoints: ['Calculate anion gap', 'Understand DKA pathophysiology', 'Initial management priorities (fluids, insulin, K+)']
  },
  {
    id: 'pe',
    title: 'Pulmonary Embolism',
    icon: AlertTriangle,
    color: 'amber',
    difficulty: 'Intermediate',
    specialty: 'Pulmonology',
    description: 'Acute pulmonary embolism with right heart strain',
    clinicalText: `45-year-old female with sudden onset dyspnea and right-sided pleuritic chest pain, started 6 hours ago.
Risk factors: 12-hour flight 5 days ago, oral contraceptive use, BMI 32.
Associated: Lightheadedness, one episode of hemoptysis, right calf swelling.
Vitals: BP 100/65, HR 118, RR 28, SpO2 88% on room air.
Physical: Tachypneic, tachycardic, loud P2, right leg swelling with tenderness.
Labs: D-dimer 4,500 ng/mL (ref <500), Troponin I 0.15 ng/mL, BNP 450 pg/mL.
ABG: pH 7.48, pCO2 28, pO2 58 on room air.
ECG: Sinus tachycardia, S1Q3T3 pattern, T wave inversions V1-V4.
CT-PA: Large saddle embolus with bilateral pulmonary artery involvement, RV dilation (RV:LV ratio 1.3).`,
    expectedDiagnosis: 'Acute Pulmonary Embolism (Submassive/Intermediate-Risk)',
    learningPoints: ['Risk stratification (Wells criteria)', 'Recognize RV strain markers', 'Anticoagulation vs thrombolysis decision']
  }
];

// ============== CLINICAL CASE LIBRARY ==============
const CASE_LIBRARY = {
  cardiology: {
    name: 'Cardiology',
    icon: Heart,
    color: 'red',
    cases: [
      { id: 'afib', title: 'Atrial Fibrillation', difficulty: 'Beginner' },
      { id: 'endocarditis', title: 'Infective Endocarditis', difficulty: 'Advanced' },
      { id: 'tamponade', title: 'Cardiac Tamponade', difficulty: 'Intermediate' },
      { id: 'aortic-dissection', title: 'Aortic Dissection', difficulty: 'Advanced' },
    ]
  },
  pulmonology: {
    name: 'Pulmonology',
    icon: Wind,
    color: 'blue',
    cases: [
      { id: 'copd-exac', title: 'COPD Exacerbation', difficulty: 'Beginner' },
      { id: 'ards', title: 'ARDS', difficulty: 'Advanced' },
      { id: 'pneumothorax', title: 'Tension Pneumothorax', difficulty: 'Intermediate' },
    ]
  },
  neurology: {
    name: 'Neurology',
    icon: Brain,
    color: 'purple',
    cases: [
      { id: 'stroke', title: 'Ischemic Stroke', difficulty: 'Beginner' },
      { id: 'meningitis', title: 'Bacterial Meningitis', difficulty: 'Intermediate' },
      { id: 'sah', title: 'Subarachnoid Hemorrhage', difficulty: 'Advanced' },
    ]
  },
  emergency: {
    name: 'Emergency Medicine',
    icon: AlertTriangle,
    color: 'amber',
    cases: [
      { id: 'sepsis', title: 'Septic Shock', difficulty: 'Intermediate' },
      { id: 'anaphylaxis', title: 'Anaphylaxis', difficulty: 'Beginner' },
      { id: 'overdose', title: 'Drug Overdose', difficulty: 'Intermediate' },
    ]
  }
};

// ============== COMPONENT ==============
const TestPatientPanel = ({ isDark, onLoadCase }) => {
  const [activeSection, setActiveSection] = useState('demo'); // demo, library, simulator, generator
  const [selectedCase, setSelectedCase] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCase, setGeneratedCase] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('cardiology');
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');

  // Generate a random case using AI
  const generateRandomCase = async () => {
    setIsGenerating(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/diagnosis/generate-case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty: selectedSpecialty,
          difficulty: selectedDifficulty
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGeneratedCase(data.case);
        }
      }
    } catch (error) {
      console.error('Error generating case:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-500/20 text-emerald-400';
      case 'intermediate': return 'bg-amber-500/20 text-amber-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
      amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'demo', icon: Play, label: 'Quick Demo', desc: '5 Examples' },
          { id: 'library', icon: BookOpen, label: 'Case Library', desc: 'By Specialty' },
          { id: 'simulator', icon: Stethoscope, label: 'Simulator', desc: 'Interactive' },
          { id: 'generator', icon: Sparkles, label: 'AI Generator', desc: 'Random Case' },
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 min-w-[80px] p-2 rounded-lg border transition-all text-center ${
              activeSection === section.id
                ? `${isDark ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-600'}`
                : `${isDark ? 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`
            }`}
          >
            <section.icon className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs font-medium">{section.label}</div>
            <div className="text-[10px] opacity-70">{section.desc}</div>
          </button>
        ))}
      </div>

      {/* Quick Demo Section */}
      {activeSection === 'demo' && (
        <div className="space-y-3">
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Click any case to load it into the analyzer
          </div>
          <ScrollArea className="h-[280px]">
            <div className="space-y-2 pr-2">
              {DEMO_CASES.map(demoCase => {
                const colors = getColorClasses(demoCase.color);
                const Icon = demoCase.icon;
                return (
                  <div
                    key={demoCase.id}
                    onClick={() => setSelectedCase(demoCase)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedCase?.id === demoCase.id
                        ? `${colors.bg} ${colors.border} border-2`
                        : `${isDark ? 'bg-gray-800/30 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {demoCase.title}
                          </span>
                          <Badge className={`text-[10px] ${getDifficultyColor(demoCase.difficulty)}`}>
                            {demoCase.difficulty}
                          </Badge>
                        </div>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {demoCase.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {demoCase.specialty}
                          </span>
                          <span className={`text-[10px] ${colors.text}`}>
                            → {demoCase.expectedDiagnosis}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          {selectedCase && (
            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-900/20 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {selectedCase.title} Selected
                </span>
                <Button 
                  onClick={() => onLoadCase(selectedCase)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-1 px-3 h-auto"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Load & Analyze
                </Button>
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Learning Points:</strong>
                <ul className="mt-1 space-y-0.5">
                  {selectedCase.learningPoints?.map((point, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <GraduationCap className="w-3 h-3 mt-0.5 text-emerald-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Case Library Section */}
      {activeSection === 'library' && (
        <div className="space-y-3">
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Organized clinical cases by specialty
          </div>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4 pr-2">
              {Object.entries(CASE_LIBRARY).map(([key, category]) => {
                const colors = getColorClasses(category.color);
                const Icon = category.icon;
                return (
                  <div key={key} className={`rounded-lg border ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-2`}>
                      <div className={`p-1.5 rounded ${colors.bg}`}>
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {category.name}
                      </span>
                      <Badge className="text-[10px] ml-auto">{category.cases.length} cases</Badge>
                    </div>
                    <div className="p-2 space-y-1">
                      {category.cases.map(caseItem => (
                        <button
                          key={caseItem.id}
                          className={`w-full text-left p-2 rounded flex items-center justify-between transition-all ${
                            isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                          }`}
                        >
                          <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {caseItem.title}
                          </span>
                          <Badge className={`text-[10px] ${getDifficultyColor(caseItem.difficulty)}`}>
                            {caseItem.difficulty}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Full case details available in Quick Demo section
          </p>
        </div>
      )}

      {/* Virtual Patient Simulator */}
      {activeSection === 'simulator' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Stethoscope className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Interactive Patient Encounter
                </h4>
                <p className={`text-xs ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                  Step-by-step diagnostic reasoning practice
                </p>
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'} space-y-3`}>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  How it works:
                </span>
              </div>
              <ol className={`text-xs space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-start gap-2">
                  <span className="bg-purple-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                  AI presents a patient with chief complaint
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-purple-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                  You ask questions & order tests
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-purple-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                  Form your differential diagnosis
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-purple-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">4</span>
                  Compare with PhiCor's analysis
                </li>
              </ol>
            </div>
            
            <Button 
              className="w-full mt-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
              disabled
            >
              <Target className="w-4 h-4 mr-2" />
              Start Simulation (Coming Soon)
            </Button>
          </div>
        </div>
      )}

      {/* AI Case Generator */}
      {activeSection === 'generator' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  AI Case Generator
                </h4>
                <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
                  Generate realistic clinical scenarios
                </p>
              </div>
            </div>
            
            {/* Specialty Selection */}
            <div className="space-y-2 mb-4">
              <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Specialty
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['cardiology', 'pulmonology', 'neurology', 'emergency'].map(spec => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`p-2 rounded-lg text-xs capitalize transition-all ${
                      selectedSpecialty === spec
                        ? `${isDark ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-amber-100 border-amber-300 text-amber-700'} border`
                        : `${isDark ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600'} border hover:border-gray-500`
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Difficulty Selection */}
            <div className="space-y-2 mb-4">
              <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Difficulty
              </label>
              <div className="flex gap-2">
                {['beginner', 'intermediate', 'advanced'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`flex-1 p-2 rounded-lg text-xs capitalize transition-all ${
                      selectedDifficulty === diff
                        ? `${getDifficultyColor(diff)} border border-current`
                        : `${isDark ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600'} border`
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={generateRandomCase}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Shuffle className="w-4 h-4 mr-2" />
                  Generate Random Case
                </>
              )}
            </Button>
            
            {generatedCase && (
              <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {generatedCase.title || 'Generated Case'}
                  </span>
                  <Button 
                    onClick={() => onLoadCase({ clinicalText: generatedCase.clinicalText })}
                    className="bg-emerald-500 text-white text-xs py-1 px-2 h-auto"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Load
                  </Button>
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {generatedCase.description || 'Click Load to analyze this case'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPatientPanel;
