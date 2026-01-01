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
      { 
        id: 'afib', 
        title: 'Atrial Fibrillation', 
        difficulty: 'Beginner',
        clinicalText: `68-year-old male presents with palpitations and shortness of breath for 3 days.
Associated: Fatigue, lightheadedness, exercise intolerance.
Vitals: BP 130/85, HR 142 irregular, RR 20, SpO2 96%.
Physical: Irregularly irregular pulse, no murmurs, mild bilateral ankle edema.
ECG: Atrial fibrillation with rapid ventricular response, no ST changes.
Labs: TSH 0.8, BNP 380 pg/mL, Troponin negative.
PMH: Hypertension, Type 2 DM, Obesity (BMI 34).
CHA2DS2-VASc Score: 3 (HTN, DM, age 65-74).`,
        expectedDiagnosis: 'Atrial Fibrillation with Rapid Ventricular Response',
        learningPoints: ['Calculate CHA2DS2-VASc score', 'Rate vs rhythm control', 'Anticoagulation decision making']
      },
      { 
        id: 'endocarditis', 
        title: 'Infective Endocarditis', 
        difficulty: 'Advanced',
        clinicalText: `42-year-old male with history of IV drug use presents with fever, chills, and malaise for 2 weeks.
Associated: Night sweats, weight loss 5kg, fatigue, new murmur.
Vitals: Temp 38.9°C, BP 110/50, HR 105, SpO2 94%.
Physical: New diastolic murmur at left sternal border, splinter hemorrhages, Janeway lesions on palms.
Echo (TTE): Vegetation on aortic valve (12mm), moderate aortic regurgitation.
Labs: WBC 18,000 with left shift, CRP 180, ESR 65, Procalcitonin 4.2.
Blood cultures: 3/3 positive for Staphylococcus aureus (MSSA).
PMH: IVDU, Hepatitis C.`,
        expectedDiagnosis: 'Infective Endocarditis (Native Valve)',
        learningPoints: ['Modified Duke criteria', 'Indications for surgery', 'Antibiotic duration and choice']
      },
      { 
        id: 'tamponade', 
        title: 'Cardiac Tamponade', 
        difficulty: 'Intermediate',
        clinicalText: `55-year-old female with breast cancer presents with progressive dyspnea and chest discomfort over 1 week.
Associated: Orthopnea, dizziness when standing, decreased appetite.
Vitals: BP 85/70, HR 120, Pulsus paradoxus 18mmHg, RR 28, SpO2 90%.
Physical: Muffled heart sounds, JVP elevated with prominent x descent, clear lungs.
ECG: Low voltage, electrical alternans.
Echo: Large circumferential pericardial effusion with diastolic collapse of RA and RV.
CXR: Enlarged cardiac silhouette "water bottle" heart.
PMH: Metastatic breast cancer, on chemotherapy.`,
        expectedDiagnosis: 'Cardiac Tamponade (Malignant Pericardial Effusion)',
        learningPoints: ['Beck\'s triad recognition', 'Echo findings in tamponade', 'Pericardiocentesis indications']
      },
      { 
        id: 'aortic-dissection', 
        title: 'Aortic Dissection', 
        difficulty: 'Advanced',
        clinicalText: `62-year-old male with sudden onset severe tearing chest pain radiating to back, started 2 hours ago.
Associated: Diaphoresis, syncope briefly, now awake but anxious.
Risk factors: Long-standing uncontrolled hypertension, Marfan habitus.
Vitals: Right arm BP 180/95, Left arm BP 140/80 (40mmHg difference), HR 95, RR 22.
Physical: Tall thin habitus, early diastolic murmur (new AR), diminished left femoral pulse.
CXR: Widened mediastinum (>8cm), pleural effusion left.
CT Angiogram: Stanford Type A dissection with intimal flap from aortic root extending to descending aorta.
Labs: D-dimer 8500, Troponin mildly elevated, Cr 1.2.`,
        expectedDiagnosis: 'Stanford Type A Aortic Dissection',
        learningPoints: ['Stanford vs DeBakey classification', 'Blood pressure differential', 'Surgical emergency recognition']
      },
    ]
  },
  pulmonology: {
    name: 'Pulmonology',
    icon: Wind,
    color: 'blue',
    cases: [
      { 
        id: 'copd-exac', 
        title: 'COPD Exacerbation', 
        difficulty: 'Beginner',
        clinicalText: `71-year-old male with known COPD presents with worsening dyspnea and increased sputum production for 4 days.
Associated: Sputum changed from white to yellow-green, increased cough frequency, decreased exercise tolerance.
Social: 50 pack-year smoking history, quit 2 years ago, on home O2 2L.
Vitals: Temp 37.6°C, BP 145/85, HR 98, RR 26, SpO2 85% on 2L.
Physical: Pursed lip breathing, accessory muscle use, bilateral wheezes and rhonchi, prolonged expiration.
Labs: WBC 12,500, ABG: pH 7.32, pCO2 55, pO2 52, HCO3 28.
CXR: Hyperinflation, no infiltrate, flattened diaphragms.
PFT (baseline): FEV1 35% predicted, FEV1/FVC 0.55.`,
        expectedDiagnosis: 'Acute Exacerbation of COPD (AECOPD)',
        learningPoints: ['GOLD classification', 'NIV indications', 'Steroid and antibiotic guidelines']
      },
      { 
        id: 'ards', 
        title: 'ARDS', 
        difficulty: 'Advanced',
        clinicalText: `45-year-old female admitted 3 days ago for severe pancreatitis, now with acute respiratory failure.
Course: Progressive hypoxemia despite supplemental O2, now requiring mechanical ventilation.
Vitals on vent: BP 95/60 (on vasopressors), HR 115, Temp 38.5°C.
Ventilator: AC/VC, TV 350mL (6mL/kg IBW), RR 24, PEEP 14, FiO2 80%.
ABG: pH 7.28, pCO2 48, pO2 65, P/F ratio 81.
CXR: Bilateral diffuse airspace opacities, no cardiomegaly.
Echo: Normal LV function, no elevated filling pressures.
Labs: WBC 22,000, Lipase 2500, Procalcitonin 8.5, Cr 2.1.`,
        expectedDiagnosis: 'Acute Respiratory Distress Syndrome (ARDS) - Severe',
        learningPoints: ['Berlin criteria for ARDS', 'Lung protective ventilation', 'Prone positioning indications']
      },
      { 
        id: 'pneumothorax', 
        title: 'Tension Pneumothorax', 
        difficulty: 'Intermediate',
        clinicalText: `28-year-old male brought in after motorcycle accident, GCS 14, complaining of severe right chest pain and dyspnea.
Mechanism: High-speed impact with guardrail, helmet worn.
Vitals: BP 85/50, HR 135, RR 32, SpO2 82% on 15L NRB.
Physical: Tracheal deviation to left, absent breath sounds right hemithorax, hyperresonance to percussion right, distended neck veins.
Other injuries: Right rib fractures 4-7 palpable, abrasions.
Pre-hospital: Progressively worsening despite 2L crystalloid.
CXR (portable): Large right pneumothorax with mediastinal shift to left.`,
        expectedDiagnosis: 'Tension Pneumothorax (Traumatic)',
        learningPoints: ['Clinical diagnosis - don\'t wait for CXR', 'Needle decompression technique', 'Chest tube placement']
      },
    ]
  },
  neurology: {
    name: 'Neurology',
    icon: Brain,
    color: 'purple',
    cases: [
      { 
        id: 'stroke', 
        title: 'Ischemic Stroke', 
        difficulty: 'Beginner',
        clinicalText: `72-year-old female found by family with right-sided weakness and slurred speech, last known well 2 hours ago.
Associated: Facial droop right side, unable to lift right arm, confused.
Vitals: BP 185/105, HR 88 irregular, RR 18, SpO2 97%.
Physical: NIHSS 14, Right facial droop, Right arm 0/5, Right leg 2/5, Expressive aphasia, Left gaze preference.
PMH: Atrial fibrillation (not on anticoagulation), Hypertension, Type 2 DM.
CT Head (non-con): No hemorrhage, Early hypodensity left MCA territory with hyperdense MCA sign.
CT Angiogram: Left M1 occlusion.
Labs: Glucose 145, INR 1.0, Platelets 220,000.`,
        expectedDiagnosis: 'Acute Ischemic Stroke (Left MCA Territory)',
        learningPoints: ['NIHSS scoring', 'tPA eligibility criteria', 'Mechanical thrombectomy indications']
      },
      { 
        id: 'meningitis', 
        title: 'Bacterial Meningitis', 
        difficulty: 'Intermediate',
        clinicalText: `22-year-old college student presents with severe headache, fever, and neck stiffness for 12 hours.
Associated: Photophobia, nausea, vomiting, confusion developing.
Vitals: Temp 39.5°C, BP 90/60, HR 125, RR 22.
Physical: GCS 13, Positive Kernig and Brudzinski signs, petechial rash on trunk and extremities, no focal deficits.
Labs: WBC 24,000 with 92% neutrophils.
LP: Opening pressure 32 cmH2O, WBC 2500 (95% PMN), Protein 250, Glucose 25 (serum 120).
Gram stain: Gram-positive diplococci.
CT Head: No mass effect, safe for LP.`,
        expectedDiagnosis: 'Bacterial Meningitis (Streptococcus pneumoniae)',
        learningPoints: ['Don\'t delay antibiotics for LP', 'Dexamethasone timing', 'Chemoprophylaxis for contacts']
      },
      { 
        id: 'sah', 
        title: 'Subarachnoid Hemorrhage', 
        difficulty: 'Advanced',
        clinicalText: `48-year-old female with sudden onset "worst headache of my life" that started during exercise.
Associated: Brief LOC, nausea, vomiting, photophobia, neck stiffness.
Vitals: BP 175/95, HR 65, RR 16, SpO2 98%.
Physical: GCS 14 (E4V4M6), nuchal rigidity, no focal deficits, Hunt-Hess Grade 2.
PMH: Hypertension (untreated), smoker, family history of aneurysm (mother).
CT Head: Diffuse subarachnoid blood in basal cisterns, Fisher Grade 3.
CT Angiogram: 7mm saccular aneurysm at anterior communicating artery.
Labs: Troponin mildly elevated, Na 132.`,
        expectedDiagnosis: 'Aneurysmal Subarachnoid Hemorrhage',
        learningPoints: ['Hunt-Hess and Fisher grading', 'Vasospasm monitoring', 'Blood pressure management']
      },
    ]
  },
  emergency: {
    name: 'Emergency Medicine',
    icon: AlertTriangle,
    color: 'amber',
    cases: [
      { 
        id: 'sepsis', 
        title: 'Septic Shock', 
        difficulty: 'Intermediate',
        clinicalText: `78-year-old female from nursing home presents with altered mental status, fever, and hypotension.
History: Foley catheter in place for 2 months, recent UTI treated 1 week ago.
Vitals: Temp 39.2°C, BP 75/45, HR 125, RR 28, SpO2 92%.
Physical: Lethargic, warm extremities, suprapubic tenderness, cloudy urine in catheter bag.
Labs: WBC 22,000, Lactate 5.2 mmol/L, Cr 2.8 (baseline 1.2), BUN 45.
UA: Large leukocytes, positive nitrites, bacteria >100,000 CFU/mL E. coli.
CXR: No infiltrate.
Procalcitonin: 15 ng/mL.
After 2L NS: MAP still 55mmHg.`,
        expectedDiagnosis: 'Septic Shock (Urosepsis)',
        learningPoints: ['Surviving Sepsis Guidelines', 'Early goal-directed therapy', 'Vasopressor selection']
      },
      { 
        id: 'anaphylaxis', 
        title: 'Anaphylaxis', 
        difficulty: 'Beginner',
        clinicalText: `32-year-old male presents 15 minutes after eating shrimp at restaurant with progressive symptoms.
Symptoms: Diffuse urticaria, lip/tongue swelling, throat tightness, wheezing, lightheadedness.
Vitals: BP 80/50, HR 130, RR 30, SpO2 88%.
Physical: Widespread hives, angioedema of lips and tongue, inspiratory stridor, diffuse wheezes.
PMH: Known shellfish allergy (milder reaction previously), asthma.
Medications: Carries EpiPen but did not use.
Pre-hospital: No treatment given.`,
        expectedDiagnosis: 'Anaphylaxis (Food Allergy)',
        learningPoints: ['Epinephrine is first-line', 'Biphasic reaction monitoring', 'Discharge planning and education']
      },
      { 
        id: 'overdose', 
        title: 'Drug Overdose', 
        difficulty: 'Intermediate',
        clinicalText: `24-year-old male found unresponsive in bathroom by roommate, unknown down time.
Scene: Empty pill bottles nearby (acetaminophen, oxycodone), alcohol bottles.
Vitals: BP 90/55, HR 55, RR 6, SpO2 78%, Temp 35.8°C.
Physical: Unresponsive, pinpoint pupils, decreased respiratory effort, no trauma.
Fingerstick glucose: 95 mg/dL.
Response to Naloxone 2mg IN: Partial improvement in RR to 12, remains somnolent.
Labs: AST 85, ALT 72, Acetaminophen level 180 mcg/mL (at 6 hours post-ingestion).
UDS: Positive opioids, negative other substances.`,
        expectedDiagnosis: 'Mixed Overdose (Opioid + Acetaminophen)',
        learningPoints: ['Naloxone dosing and duration', 'Rumack-Matthew nomogram', 'NAC protocol for acetaminophen']
      },
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
  const [expandedCategory, setExpandedCategory] = useState('cardiology');
  const [selectedLibraryCase, setSelectedLibraryCase] = useState(null);
  
  // Upload states
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  
  // Simulator states
  const [simulatorStep, setSimulatorStep] = useState(0);
  const [simulatorCase, setSimulatorCase] = useState(null);
  const [isLoadingSimulator, setIsLoadingSimulator] = useState(false);

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

  // Handle file upload for document extraction
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/diagnosis/extract-document`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.extractedText) {
          setUploadSuccess(`Extracted text from ${file.name}`);
          // Auto-load the extracted text into the analyzer
          onLoadCase({ clinicalText: data.extractedText });
        } else {
          setUploadError(data.error || 'Failed to extract text from document');
        }
      } else {
        setUploadError('Failed to process document. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadError('Error uploading document. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Start simulator with a random case
  const startSimulator = async () => {
    setIsLoadingSimulator(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/diagnosis/generate-case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty: 'emergency',
          difficulty: 'intermediate'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.case) {
          setSimulatorCase(data.case);
          setSimulatorStep(1);
        }
      }
    } catch (error) {
      console.error('Error starting simulator:', error);
    } finally {
      setIsLoadingSimulator(false);
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
            Click any case to load it into the analyzer
          </div>
          <ScrollArea className="h-[320px]">
            <div className="space-y-3 pr-2">
              {Object.entries(CASE_LIBRARY).map(([key, category]) => {
                const colors = getColorClasses(category.color);
                const Icon = category.icon;
                const isExpanded = expandedCategory === key;
                return (
                  <div key={key} className={`rounded-lg border ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <button 
                      onClick={() => setExpandedCategory(isExpanded ? null : key)}
                      className={`w-full p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-2`}
                    >
                      <div className={`p-1.5 rounded ${colors.bg}`}>
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {category.name}
                      </span>
                      <Badge className="text-[10px] ml-auto mr-2">{category.cases.length} cases</Badge>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''} ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    </button>
                    {isExpanded && (
                      <div className="p-2 space-y-1">
                        {category.cases.map(caseItem => (
                          <button
                            key={caseItem.id}
                            onClick={() => setSelectedLibraryCase(caseItem)}
                            className={`w-full text-left p-2 rounded flex items-center justify-between transition-all ${
                              selectedLibraryCase?.id === caseItem.id
                                ? `${colors.bg} ${colors.border} border`
                                : isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
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
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          {selectedLibraryCase && (
            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-900/20 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {selectedLibraryCase.title} Selected
                </span>
                <Button 
                  onClick={() => onLoadCase(selectedLibraryCase)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-1 px-3 h-auto"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Load & Analyze
                </Button>
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Learning Points:</strong>
                <ul className="mt-1 space-y-0.5">
                  {selectedLibraryCase.learningPoints?.map((point, i) => (
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

      {/* Virtual Patient Simulator */}
      {activeSection === 'simulator' && (
        <div className="space-y-4">
          {simulatorStep === 0 ? (
            // Welcome screen
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
                    PhiCor presents a patient with chief complaint
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                    Review the clinical presentation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                    Load the case for full analysis
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">4</span>
                    Compare your differential with PhiCor's synthesis
                  </li>
                </ol>
              </div>
              
              <Button 
                onClick={startSimulator}
                disabled={isLoadingSimulator}
                className="w-full mt-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
              >
                {isLoadingSimulator ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Patient...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Start Simulation
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Active simulation
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800/50 border-purple-500/30' : 'bg-white border-purple-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/20">
                    <User className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {simulatorCase?.title || 'Virtual Patient'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSimulatorStep(0); setSimulatorCase(null); }}
                  className="h-7 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>
              
              {/* Chief Complaint */}
              <div className={`p-3 rounded-lg mb-3 ${isDark ? 'bg-amber-900/20 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    Chief Complaint
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {simulatorCase?.description || 'Patient presenting with clinical symptoms...'}
                </p>
              </div>
              
              {/* Clinical Details Preview */}
              <div className={`p-3 rounded-lg mb-3 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    Clinical Presentation
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-4`}>
                  {simulatorCase?.clinicalText?.substring(0, 200)}...
                </p>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => onLoadCase(simulatorCase)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Load Full Case
                </Button>
                <Button
                  variant="outline"
                  onClick={startSimulator}
                  disabled={isLoadingSimulator}
                  className="text-xs"
                >
                  <Shuffle className="w-3 h-3 mr-1" />
                  New Patient
                </Button>
              </div>
            </div>
          )}
          
          {/* Document Upload Section */}
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Upload className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Upload Document
                </h4>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Extract clinical data from lab reports, case files
                </p>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting Text...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Select PDF, Word, or Text File
                </>
              )}
            </Button>
            
            {uploadError && (
              <div className={`mt-2 p-2 rounded text-xs flex items-center gap-2 ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                <X className="w-3 h-3" />
                {uploadError}
              </div>
            )}
            
            {uploadSuccess && (
              <div className={`mt-2 p-2 rounded text-xs flex items-center gap-2 ${isDark ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                <CheckCircle className="w-3 h-3" />
                {uploadSuccess}
              </div>
            )}
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
