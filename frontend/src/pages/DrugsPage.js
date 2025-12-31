import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import FeatureNav from '../components/FeatureNav';
import {
  Pill, Search, Filter, ChevronDown, ChevronUp, ChevronRight,
  Heart, Brain, Activity, AlertTriangle, TrendingUp, TrendingDown,
  Beaker, Syringe, Shield, Zap, Clock, Scale, User, FileText,
  Info, CheckCircle, XCircle, AlertCircle, Microscope, Target
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Slider } from '../components/ui/slider';
import { ORGAN_MODELS } from '../data/organModels';

// Comprehensive Drug Database Structure
const DRUG_CATEGORIES = {
  cardiovascular: {
    name: 'Cardiovascular',
    icon: '🫀',
    color: 'from-red-500 to-rose-500',
    subcategories: ['Beta-Blockers', 'ACE Inhibitors', 'ARBs', 'Calcium Channel Blockers', 'Diuretics', 'Antiarrhythmics', 'Vasodilators', 'Anticoagulants', 'Antiplatelets', 'Statins']
  },
  antibiotics: {
    name: 'Antibiotics',
    icon: '🦠',
    color: 'from-green-500 to-emerald-500',
    subcategories: ['Penicillins', 'Cephalosporins', 'Carbapenems', 'Fluoroquinolones', 'Aminoglycosides', 'Macrolides', 'Glycopeptides', 'Tetracyclines', 'Sulfonamides']
  },
  respiratory: {
    name: 'Respiratory',
    icon: '🫁',
    color: 'from-blue-500 to-cyan-500',
    subcategories: ['Bronchodilators', 'Inhaled Corticosteroids', 'Leukotriene Modifiers', 'Mucolytics', 'Antihistamines', 'Decongestants']
  },
  neurological: {
    name: 'Neurological',
    icon: '🧠',
    color: 'from-purple-500 to-violet-500',
    subcategories: ['Anticonvulsants', 'Antidepressants', 'Anxiolytics', 'Antipsychotics', 'Sedatives', 'Muscle Relaxants', 'Analgesics', 'Antiparkinsonian']
  },
  endocrine: {
    name: 'Endocrine/Metabolic',
    icon: '⚡',
    color: 'from-yellow-500 to-amber-500',
    subcategories: ['Insulin', 'Oral Hypoglycemics', 'Thyroid Hormones', 'Corticosteroids', 'Bisphosphonates']
  },
  gastrointestinal: {
    name: 'Gastrointestinal',
    icon: '🔬',
    color: 'from-orange-500 to-red-500',
    subcategories: ['PPIs', 'H2 Blockers', 'Antiemetics', 'Laxatives', 'Antidiarrheals', 'Hepatoprotectives']
  },
  renal: {
    name: 'Renal',
    icon: '🫘',
    color: 'from-teal-500 to-cyan-500',
    subcategories: ['Diuretics', 'Potassium-Sparing', 'Phosphate Binders', 'EPO Stimulants']
  },
  immunological: {
    name: 'Immunological',
    icon: '🛡️',
    color: 'from-pink-500 to-rose-500',
    subcategories: ['Immunosuppressants', 'DMARDs', 'Biologics', 'Vaccines']
  },
  oncological: {
    name: 'Oncological',
    icon: '🎯',
    color: 'from-indigo-500 to-purple-500',
    subcategories: ['Chemotherapy', 'Targeted Therapy', 'Immunotherapy', 'Hormonal Therapy']
  },
  emergency: {
    name: 'Emergency/Critical Care',
    icon: '🚨',
    color: 'from-red-600 to-orange-500',
    subcategories: ['Vasopressors', 'Antidotes', 'Resuscitation', 'Sedation/Paralysis']
  }
};

// Sample Cardiac Drugs with Full Data
const CARDIAC_DRUGS = [
  {
    id: 'metoprolol',
    name: 'Metoprolol',
    genericName: 'Metoprolol Succinate/Tartrate',
    brandNames: ['Lopressor', 'Toprol-XL', 'Betaloc'],
    class: 'Beta-Blocker',
    category: 'cardiovascular',
    mechanism: {
      primary: 'Selective β1-adrenergic receptor antagonist',
      cellular: 'Blocks catecholamine binding to β1 receptors in cardiac tissue, reducing cAMP production and calcium influx',
      pathways: ['β1-adrenergic signaling', 'cAMP-PKA pathway', 'Calcium channel modulation']
    },
    indications: ['Hypertension', 'Angina Pectoris', 'Heart Failure', 'Atrial Fibrillation', 'Myocardial Infarction', 'Migraine Prophylaxis'],
    dosing: {
      adult: {
        hypertension: { initial: '25-100mg', maintenance: '100-450mg', max: '450mg/day', frequency: 'Once daily (XL) or twice daily (tartrate)' },
        heartFailure: { initial: '12.5-25mg', maintenance: '200mg', max: '200mg/day', frequency: 'Once daily', titration: 'Double dose every 2 weeks' },
        atrialFib: { initial: '2.5-5mg IV', maintenance: '25-100mg PO', max: '200mg/day', frequency: 'Twice daily' }
      },
      pediatric: { note: 'Limited data, weight-based dosing 1-2mg/kg/day' },
      renal: { adjustment: 'No adjustment needed' },
      hepatic: { adjustment: 'Reduce dose in severe impairment' }
    },
    therapeuticEffects: {
      heart: [
        { parameter: 'heartRate', direction: 'decrease', magnitude: '15-25%', note: 'Negative chronotropic effect' },
        { parameter: 'cardiacOutput', direction: 'decrease', magnitude: '10-20%', note: 'Initially, improves with chronic use in HF' },
        { parameter: 'bloodPressure', direction: 'decrease', magnitude: '10-15%', note: 'Systolic > Diastolic' },
        { parameter: 'myocardialOxygenDemand', direction: 'decrease', magnitude: '20-30%', note: 'Reduced workload' },
        { parameter: 'ejectionFraction', direction: 'increase', magnitude: '5-10%', note: 'In heart failure, over months' }
      ],
      vessels: [
        { parameter: 'peripheralResistance', direction: 'decrease', magnitude: '10-15%', note: 'Long-term effect' },
        { parameter: 'reninRelease', direction: 'decrease', magnitude: '30-50%', note: 'Via β1 blockade in kidney' }
      ]
    },
    sideEffects: {
      common: [
        { effect: 'Bradycardia', frequency: '5-10%', severity: 'moderate', organs: ['heart'] },
        { effect: 'Fatigue', frequency: '10-15%', severity: 'mild', organs: ['brain', 'muscles'] },
        { effect: 'Dizziness', frequency: '5-10%', severity: 'mild', organs: ['brain'] },
        { effect: 'Cold extremities', frequency: '5%', severity: 'mild', organs: ['vessels'] },
        { effect: 'GI upset', frequency: '5%', severity: 'mild', organs: ['gi'] }
      ],
      serious: [
        { effect: 'Heart block', frequency: '<1%', severity: 'severe', organs: ['heart'] },
        { effect: 'Bronchospasm', frequency: '1-2%', severity: 'severe', organs: ['lungs'] },
        { effect: 'Hypotension', frequency: '2-5%', severity: 'moderate', organs: ['vessels'] },
        { effect: 'Depression', frequency: '1-2%', severity: 'moderate', organs: ['brain'] }
      ],
      withdrawal: 'Taper over 1-2 weeks; abrupt discontinuation may cause rebound hypertension, angina, or MI'
    },
    overdose: {
      symptoms: ['Severe bradycardia', 'Hypotension', 'Heart block', 'Cardiogenic shock', 'Bronchospasm', 'Hypoglycemia'],
      treatment: ['Atropine for bradycardia', 'Glucagon 2-10mg IV', 'Vasopressors', 'Cardiac pacing', 'Hemodialysis not effective'],
      lethalDose: 'Variable, >5g can be fatal'
    },
    chronicToxicity: {
      longTerm: [
        { effect: 'Metabolic changes', duration: '>6 months', description: 'May mask hypoglycemia, affect lipid profile' },
        { effect: 'Sexual dysfunction', duration: 'Chronic', description: 'Erectile dysfunction in 1-5%' }
      ]
    },
    contraindications: {
      absolute: ['Severe bradycardia (HR <45)', 'AV block (2nd/3rd degree)', 'Cardiogenic shock', 'Decompensated heart failure', 'Sick sinus syndrome'],
      relative: ['Asthma/COPD', 'Peripheral vascular disease', 'Diabetes', 'Depression']
    },
    interactions: {
      major: [
        { drug: 'Verapamil/Diltiazem', effect: 'Additive AV block, severe bradycardia', management: 'Avoid combination or use with extreme caution' },
        { drug: 'Clonidine', effect: 'Rebound hypertension if clonidine stopped', management: 'Stop beta-blocker first' },
        { drug: 'MAO inhibitors', effect: 'Hypertensive crisis', management: 'Avoid combination' }
      ],
      moderate: [
        { drug: 'NSAIDs', effect: 'Reduced antihypertensive effect', management: 'Monitor BP' },
        { drug: 'Digoxin', effect: 'Additive bradycardia', management: 'Monitor HR' },
        { drug: 'Insulin', effect: 'Masks hypoglycemia symptoms', management: 'Monitor glucose closely' }
      ]
    },
    pharmacokinetics: {
      absorption: '95% oral bioavailability',
      distribution: 'Vd: 3.2-5.6 L/kg, protein binding 12%',
      metabolism: 'Hepatic (CYP2D6)',
      elimination: 'Renal (95%), half-life 3-7 hours (tartrate), 12-24h (succinate)',
      peakEffect: '1-2 hours (tartrate), 6-12 hours (succinate)'
    },
    monitoring: {
      parameters: ['Heart rate', 'Blood pressure', 'ECG (PR interval)', 'Symptoms of heart failure'],
      frequency: 'Weekly during titration, then monthly',
      targets: { heartRate: '55-65 bpm', bloodPressure: '<130/80 mmHg' }
    },
    equations: {
      doseResponse: 'Effect = Emax × [Drug] / (EC50 + [Drug])',
      halfLife: 't½ = 0.693 × Vd / CL',
      steadyState: 'Css = (F × Dose) / (CL × τ)'
    }
  },
  {
    id: 'lisinopril',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    brandNames: ['Prinivil', 'Zestril'],
    class: 'ACE Inhibitor',
    category: 'cardiovascular',
    mechanism: {
      primary: 'Angiotensin-Converting Enzyme (ACE) Inhibitor',
      cellular: 'Blocks conversion of Angiotensin I to Angiotensin II, reduces aldosterone secretion, increases bradykinin',
      pathways: ['RAAS system', 'Bradykinin-NO pathway', 'Aldosterone pathway']
    },
    indications: ['Hypertension', 'Heart Failure', 'Post-MI', 'Diabetic Nephropathy'],
    dosing: {
      adult: {
        hypertension: { initial: '10mg', maintenance: '20-40mg', max: '80mg/day', frequency: 'Once daily' },
        heartFailure: { initial: '2.5-5mg', maintenance: '20-40mg', max: '40mg/day', frequency: 'Once daily' }
      },
      renal: { adjustment: 'CrCl <30: start 2.5mg' },
      hepatic: { adjustment: 'No adjustment needed' }
    },
    therapeuticEffects: {
      heart: [
        { parameter: 'bloodPressure', direction: 'decrease', magnitude: '15-25%', note: 'Both systolic and diastolic' },
        { parameter: 'cardiacRemodeling', direction: 'decrease', magnitude: 'Significant', note: 'Prevents LV hypertrophy' },
        { parameter: 'preload', direction: 'decrease', magnitude: '15-20%', note: 'Via vasodilation and natriuresis' }
      ],
      kidneys: [
        { parameter: 'GFR', direction: 'decrease', magnitude: '10-20% initially', note: 'May increase long-term in diabetics' },
        { parameter: 'proteinuria', direction: 'decrease', magnitude: '30-50%', note: 'Renoprotective' }
      ]
    },
    sideEffects: {
      common: [
        { effect: 'Dry cough', frequency: '5-20%', severity: 'mild', organs: ['lungs'] },
        { effect: 'Dizziness', frequency: '5-10%', severity: 'mild', organs: ['brain'] },
        { effect: 'Hyperkalemia', frequency: '2-5%', severity: 'moderate', organs: ['kidneys'] }
      ],
      serious: [
        { effect: 'Angioedema', frequency: '0.1-0.5%', severity: 'severe', organs: ['airway'] },
        { effect: 'Acute kidney injury', frequency: '1-2%', severity: 'severe', organs: ['kidneys'] }
      ]
    },
    contraindications: {
      absolute: ['Pregnancy', 'History of ACE-inhibitor angioedema', 'Bilateral renal artery stenosis'],
      relative: ['Hyperkalemia', 'Severe renal impairment']
    },
    interactions: {
      major: [
        { drug: 'Potassium supplements/K-sparing diuretics', effect: 'Severe hyperkalemia', management: 'Avoid or monitor K closely' },
        { drug: 'NSAIDs', effect: 'Reduced efficacy, AKI risk', management: 'Monitor renal function' }
      ]
    }
  },
  {
    id: 'amlodipine',
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    brandNames: ['Norvasc', 'Amlodin'],
    class: 'Calcium Channel Blocker',
    category: 'cardiovascular',
    mechanism: {
      primary: 'Dihydropyridine Calcium Channel Blocker',
      cellular: 'Blocks L-type calcium channels in vascular smooth muscle, causing vasodilation',
      pathways: ['Calcium channel modulation', 'Vascular smooth muscle relaxation']
    },
    indications: ['Hypertension', 'Angina Pectoris', 'Coronary Artery Disease'],
    dosing: {
      adult: {
        hypertension: { initial: '5mg', maintenance: '5-10mg', max: '10mg/day', frequency: 'Once daily' }
      }
    },
    therapeuticEffects: {
      vessels: [
        { parameter: 'peripheralResistance', direction: 'decrease', magnitude: '20-30%', note: 'Primary mechanism' },
        { parameter: 'bloodPressure', direction: 'decrease', magnitude: '15-20%', note: 'Gradual onset over 24h' }
      ],
      heart: [
        { parameter: 'coronaryBloodFlow', direction: 'increase', magnitude: '15-25%', note: 'Coronary vasodilation' },
        { parameter: 'heartRate', direction: 'increase', magnitude: '5-10%', note: 'Reflex tachycardia (mild)' }
      ]
    },
    sideEffects: {
      common: [
        { effect: 'Peripheral edema', frequency: '10-15%', severity: 'mild', organs: ['vessels'] },
        { effect: 'Headache', frequency: '5-10%', severity: 'mild', organs: ['brain'] },
        { effect: 'Flushing', frequency: '5%', severity: 'mild', organs: ['skin'] }
      ]
    }
  },
  {
    id: 'meropenem',
    name: 'Meropenem',
    genericName: 'Meropenem Trihydrate',
    brandNames: ['Merrem', 'Meronem'],
    class: 'Carbapenem',
    category: 'antibiotics',
    mechanism: {
      primary: 'β-lactam antibiotic - Carbapenem',
      cellular: 'Binds to penicillin-binding proteins (PBPs), inhibiting bacterial cell wall synthesis',
      pathways: ['Peptidoglycan synthesis inhibition', 'Autolysis activation']
    },
    indications: ['Severe infections', 'Sepsis', 'Meningitis', 'Intra-abdominal infections', 'Hospital-acquired pneumonia', 'Febrile neutropenia'],
    dosing: {
      adult: {
        sepsis: { initial: '1g', maintenance: '1-2g', max: '6g/day', frequency: 'Every 8 hours IV' },
        meningitis: { initial: '2g', maintenance: '2g', max: '6g/day', frequency: 'Every 8 hours IV' }
      },
      renal: { 
        adjustment: 'CrCl 26-50: 1g q12h; CrCl 10-25: 500mg q12h; CrCl <10: 500mg q24h' 
      }
    },
    therapeuticEffects: {
      infection: [
        { parameter: 'bacterialLoad', direction: 'decrease', magnitude: '99.9% kill', note: 'Time-dependent killing' },
        { parameter: 'WBC', direction: 'decrease', magnitude: 'Normalizes', note: 'As infection resolves' },
        { parameter: 'CRP', direction: 'decrease', magnitude: '50-80%', note: 'Over 3-5 days' },
        { parameter: 'temperature', direction: 'decrease', magnitude: 'Normalizes', note: 'Within 48-72h if responsive' },
        { parameter: 'procalcitonin', direction: 'decrease', magnitude: '50% per day', note: 'Good response marker' }
      ],
      sepsis: [
        { parameter: 'lactate', direction: 'decrease', magnitude: 'Normalizes', note: 'As perfusion improves' },
        { parameter: 'organFunction', direction: 'increase', magnitude: 'Improves', note: 'SOFA score decreases' }
      ]
    },
    sideEffects: {
      common: [
        { effect: 'Diarrhea', frequency: '5-10%', severity: 'mild', organs: ['gi'] },
        { effect: 'Nausea', frequency: '5%', severity: 'mild', organs: ['gi'] },
        { effect: 'Injection site reaction', frequency: '5%', severity: 'mild', organs: ['skin'] }
      ],
      serious: [
        { effect: 'C. difficile colitis', frequency: '1-2%', severity: 'severe', organs: ['gi'] },
        { effect: 'Seizures', frequency: '<1%', severity: 'severe', organs: ['brain'] },
        { effect: 'Anaphylaxis', frequency: '<0.1%', severity: 'severe', organs: ['immune'] }
      ]
    },
    contraindications: {
      absolute: ['Severe β-lactam allergy', 'Carbapenem hypersensitivity'],
      relative: ['CNS disorders', 'Renal impairment', 'Valproic acid use']
    },
    interactions: {
      major: [
        { drug: 'Valproic acid', effect: 'Dramatically reduces valproate levels (70-90%)', management: 'Avoid combination - choose alternative antibiotic' },
        { drug: 'Probenecid', effect: 'Increases meropenem levels 50%', management: 'Reduce dose if used together' }
      ]
    },
    pharmacokinetics: {
      distribution: 'Vd: 0.25-0.35 L/kg, protein binding 2%',
      metabolism: 'Minimal hepatic metabolism',
      elimination: 'Renal (70% unchanged), half-life 1 hour',
      peakEffect: 'Immediate (IV)'
    },
    monitoring: {
      parameters: ['Renal function', 'WBC', 'Culture results', 'Clinical response'],
      frequency: 'Daily during treatment',
      targets: { WBC: '4-11 × 10⁹/L', temperature: '<38°C' }
    }
  }
];

// All drugs list (simplified for other categories)
const ALL_DRUGS = [
  ...CARDIAC_DRUGS,
  // Placeholder for other drug categories
  { id: 'aspirin', name: 'Aspirin', class: 'Antiplatelet', category: 'cardiovascular' },
  { id: 'clopidogrel', name: 'Clopidogrel', class: 'Antiplatelet', category: 'cardiovascular' },
  { id: 'warfarin', name: 'Warfarin', class: 'Anticoagulant', category: 'cardiovascular' },
  { id: 'heparin', name: 'Heparin', class: 'Anticoagulant', category: 'cardiovascular' },
  { id: 'atorvastatin', name: 'Atorvastatin', class: 'Statin', category: 'cardiovascular' },
  { id: 'furosemide', name: 'Furosemide', class: 'Loop Diuretic', category: 'cardiovascular' },
  { id: 'spironolactone', name: 'Spironolactone', class: 'K-sparing Diuretic', category: 'cardiovascular' },
  { id: 'digoxin', name: 'Digoxin', class: 'Cardiac Glycoside', category: 'cardiovascular' },
  { id: 'amiodarone', name: 'Amiodarone', class: 'Antiarrhythmic', category: 'cardiovascular' },
  // Antibiotics
  { id: 'amoxicillin', name: 'Amoxicillin', class: 'Penicillin', category: 'antibiotics' },
  { id: 'ceftriaxone', name: 'Ceftriaxone', class: 'Cephalosporin', category: 'antibiotics' },
  { id: 'vancomycin', name: 'Vancomycin', class: 'Glycopeptide', category: 'antibiotics' },
  { id: 'ciprofloxacin', name: 'Ciprofloxacin', class: 'Fluoroquinolone', category: 'antibiotics' },
  { id: 'azithromycin', name: 'Azithromycin', class: 'Macrolide', category: 'antibiotics' },
  { id: 'gentamicin', name: 'Gentamicin', class: 'Aminoglycoside', category: 'antibiotics' },
  { id: 'piperacillin_tazobactam', name: 'Piperacillin-Tazobactam', class: 'Penicillin + β-lactamase inhibitor', category: 'antibiotics' },
  // Respiratory
  { id: 'salbutamol', name: 'Salbutamol', class: 'Short-acting β2 agonist', category: 'respiratory' },
  { id: 'ipratropium', name: 'Ipratropium', class: 'Anticholinergic', category: 'respiratory' },
  { id: 'budesonide', name: 'Budesonide', class: 'Inhaled Corticosteroid', category: 'respiratory' },
  { id: 'montelukast', name: 'Montelukast', class: 'Leukotriene Antagonist', category: 'respiratory' },
  // Neurological
  { id: 'morphine', name: 'Morphine', class: 'Opioid Analgesic', category: 'neurological' },
  { id: 'fentanyl', name: 'Fentanyl', class: 'Opioid Analgesic', category: 'neurological' },
  { id: 'midazolam', name: 'Midazolam', class: 'Benzodiazepine', category: 'neurological' },
  { id: 'propofol', name: 'Propofol', class: 'Sedative', category: 'neurological' },
  { id: 'phenytoin', name: 'Phenytoin', class: 'Anticonvulsant', category: 'neurological' },
  { id: 'levetiracetam', name: 'Levetiracetam', class: 'Anticonvulsant', category: 'neurological' },
  // Emergency
  { id: 'epinephrine', name: 'Epinephrine', class: 'Vasopressor', category: 'emergency' },
  { id: 'norepinephrine', name: 'Norepinephrine', class: 'Vasopressor', category: 'emergency' },
  { id: 'dopamine', name: 'Dopamine', class: 'Vasopressor/Inotrope', category: 'emergency' },
  { id: 'dobutamine', name: 'Dobutamine', class: 'Inotrope', category: 'emergency' },
  { id: 'atropine', name: 'Atropine', class: 'Anticholinergic', category: 'emergency' },
  { id: 'naloxone', name: 'Naloxone', class: 'Opioid Antagonist', category: 'emergency' },
  { id: 'flumazenil', name: 'Flumazenil', class: 'Benzodiazepine Antagonist', category: 'emergency' },
  // Endocrine
  { id: 'insulin_regular', name: 'Insulin Regular', class: 'Insulin', category: 'endocrine' },
  { id: 'metformin', name: 'Metformin', class: 'Biguanide', category: 'endocrine' },
  { id: 'levothyroxine', name: 'Levothyroxine', class: 'Thyroid Hormone', category: 'endocrine' },
  { id: 'prednisone', name: 'Prednisone', class: 'Corticosteroid', category: 'endocrine' },
  { id: 'hydrocortisone', name: 'Hydrocortisone', class: 'Corticosteroid', category: 'endocrine' },
  // GI
  { id: 'omeprazole', name: 'Omeprazole', class: 'PPI', category: 'gastrointestinal' },
  { id: 'ondansetron', name: 'Ondansetron', class: 'Antiemetic', category: 'gastrointestinal' },
  { id: 'metoclopramide', name: 'Metoclopramide', class: 'Prokinetic', category: 'gastrointestinal' },
];

const DrugsPage = () => {
  const { isDark } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [patientWeight, setPatientWeight] = useState(70);
  const [patientAge, setPatientAge] = useState(50);
  const [expandedSections, setExpandedSections] = useState({
    mechanism: true,
    effects: true,
    sideEffects: false,
    interactions: false
  });
  
  // Filter drugs
  const filteredDrugs = useMemo(() => {
    let drugs = ALL_DRUGS;
    
    if (selectedCategory) {
      drugs = drugs.filter(d => d.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      drugs = drugs.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.class?.toLowerCase().includes(query) ||
        d.genericName?.toLowerCase().includes(query)
      );
    }
    
    return drugs;
  }, [searchQuery, selectedCategory]);
  
  // Get detailed drug info
  const drugDetail = selectedDrug ? CARDIAC_DRUGS.find(d => d.id === selectedDrug) || ALL_DRUGS.find(d => d.id === selectedDrug) : null;
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <FeatureNav />
      
      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <span className="text-white font-serif text-3xl font-bold">ρ</span>
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Drugs Database
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Pharmacology, drug effects & parameter modifications
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Drug List */}
          <div className="lg:col-span-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <Input
                placeholder="Search drugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-xs"
              >
                All
              </Button>
              {Object.entries(DRUG_CATEGORIES).slice(0, 5).map(([key, cat]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="text-xs"
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>
            
            {/* Drug List */}
            <div className={`rounded-xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
              <div className={`p-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {filteredDrugs.length} drugs found
                </span>
              </div>
              <ScrollArea className="h-[500px]">
                <div className="p-2 space-y-1">
                  {filteredDrugs.map(drug => (
                    <button
                      key={drug.id}
                      onClick={() => {
                        setSelectedDrug(drug.id);
                        setActiveTab('overview');
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedDrug === drug.id
                          ? `bg-gradient-to-r ${DRUG_CATEGORIES[drug.category]?.color || 'from-gray-500 to-gray-600'} text-white`
                          : `${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${selectedDrug === drug.id ? 'text-white' : ''}`}>
                            {drug.name}
                          </div>
                          <div className={`text-xs ${selectedDrug === drug.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {drug.class}
                          </div>
                        </div>
                        <span className="text-lg">{DRUG_CATEGORIES[drug.category]?.icon}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          {/* Right: Drug Details */}
          <div className="lg:col-span-8">
            {drugDetail ? (
              <div className={`rounded-xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
                {/* Drug Header */}
                <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} bg-gradient-to-r ${DRUG_CATEGORIES[drugDetail.category]?.color || 'from-gray-500 to-gray-600'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white">
                      <h2 className="text-xl font-bold">{drugDetail.name}</h2>
                      <p className="text-white/80 text-sm">{drugDetail.genericName || drugDetail.class}</p>
                      {drugDetail.brandNames && (
                        <p className="text-white/60 text-xs mt-1">
                          Brands: {drugDetail.brandNames.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Tabs */}
                <div className={`flex border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} overflow-x-auto`}>
                  {[
                    { id: 'overview', label: 'Overview', icon: Info },
                    { id: 'effects', label: 'Effects', icon: Activity },
                    { id: 'dosing', label: 'Dosing', icon: Scale },
                    { id: 'safety', label: 'Safety', icon: Shield },
                    { id: 'interactions', label: 'Interactions', icon: Zap }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? `text-primary border-b-2 border-primary`
                          : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                {/* Tab Content */}
                <div className="p-4">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Mechanism */}
                      {drugDetail.mechanism && (
                        <div>
                          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Microscope className="w-4 h-4" /> Mechanism of Action
                          </h3>
                          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                            <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {drugDetail.mechanism.primary}
                            </p>
                            {drugDetail.mechanism.cellular && (
                              <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {drugDetail.mechanism.cellular}
                              </p>
                            )}
                            {drugDetail.mechanism.pathways && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {drugDetail.mechanism.pathways.map((p, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {p}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Indications */}
                      {drugDetail.indications && (
                        <div>
                          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Target className="w-4 h-4" /> Indications
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {drugDetail.indications.map((ind, i) => (
                              <Badge key={i} className="bg-primary/20 text-primary">
                                {ind}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Pharmacokinetics */}
                      {drugDetail.pharmacokinetics && (
                        <div>
                          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Clock className="w-4 h-4" /> Pharmacokinetics
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(drugDetail.pharmacokinetics).map(([key, value]) => (
                              <div key={key} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                <div className={`text-xs uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className={`text-sm font-medium mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Effects Tab */}
                  {activeTab === 'effects' && drugDetail.therapeuticEffects && (
                    <div className="space-y-6">
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-500/20`}>
                        <h4 className="text-blue-500 font-medium mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Parameter Modifications
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          How this drug affects physiological parameters
                        </p>
                      </div>
                      
                      {Object.entries(drugDetail.therapeuticEffects).map(([system, effects]) => (
                        <div key={system}>
                          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {system.charAt(0).toUpperCase() + system.slice(1)} Effects
                          </h3>
                          <div className="grid gap-2">
                            {effects.map((effect, i) => (
                              <div key={i} className={`p-3 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3">
                                  {effect.direction === 'decrease' ? (
                                    <TrendingDown className="w-5 h-5 text-blue-500" />
                                  ) : (
                                    <TrendingUp className="w-5 h-5 text-red-500" />
                                  )}
                                  <div>
                                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                      {effect.parameter.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                      {effect.note}
                                    </div>
                                  </div>
                                </div>
                                <Badge className={effect.direction === 'decrease' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}>
                                  {effect.direction === 'decrease' ? '↓' : '↑'} {effect.magnitude}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Dosing Tab */}
                  {activeTab === 'dosing' && drugDetail.dosing && (
                    <div className="space-y-6">
                      {/* Patient Calculator */}
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                        <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <User className="w-4 h-4" /> Patient Parameters
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Weight (kg)</label>
                            <div className="flex items-center gap-2 mt-1">
                              <Slider
                                value={[patientWeight]}
                                onValueChange={([v]) => setPatientWeight(v)}
                                min={30}
                                max={150}
                                step={1}
                              />
                              <span className={`font-mono text-sm w-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>{patientWeight}</span>
                            </div>
                          </div>
                          <div>
                            <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Age (years)</label>
                            <div className="flex items-center gap-2 mt-1">
                              <Slider
                                value={[patientAge]}
                                onValueChange={([v]) => setPatientAge(v)}
                                min={18}
                                max={100}
                                step={1}
                              />
                              <span className={`font-mono text-sm w-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>{patientAge}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Dosing by Indication */}
                      {drugDetail.dosing.adult && Object.entries(drugDetail.dosing.adult).map(([indication, dose]) => (
                        <div key={indication} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                          <h4 className={`font-medium capitalize mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {indication.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Initial</div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{dose.initial}</div>
                            </div>
                            <div>
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Maintenance</div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{dose.maintenance}</div>
                            </div>
                            <div>
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Maximum</div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{dose.max}</div>
                            </div>
                            <div>
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Frequency</div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{dose.frequency}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Safety Tab */}
                  {activeTab === 'safety' && (
                    <div className="space-y-6">
                      {/* Side Effects */}
                      {drugDetail.sideEffects && (
                        <>
                          {drugDetail.sideEffects.common && (
                            <div>
                              <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                <AlertCircle className="w-4 h-4" /> Common Side Effects
                              </h3>
                              <div className="grid gap-2">
                                {drugDetail.sideEffects.common.map((se, i) => (
                                  <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                                    <div className="flex items-center justify-between">
                                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{se.effect}</span>
                                      <Badge variant="outline">{se.frequency}</Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {drugDetail.sideEffects.serious && (
                            <div>
                              <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                <AlertTriangle className="w-4 h-4" /> Serious Side Effects
                              </h3>
                              <div className="grid gap-2">
                                {drugDetail.sideEffects.serious.map((se, i) => (
                                  <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-red-900/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                                    <div className="flex items-center justify-between">
                                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{se.effect}</span>
                                      <Badge variant="destructive">{se.frequency}</Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Contraindications */}
                      {drugDetail.contraindications && (
                        <div>
                          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                            <XCircle className="w-4 h-4" /> Contraindications
                          </h3>
                          <div className="grid gap-2">
                            {drugDetail.contraindications.absolute?.map((c, i) => (
                              <div key={i} className={`p-2 rounded-lg flex items-center gap-2 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Interactions Tab */}
                  {activeTab === 'interactions' && drugDetail.interactions && (
                    <div className="space-y-6">
                      {drugDetail.interactions.major && (
                        <div>
                          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                            <Zap className="w-4 h-4" /> Major Interactions
                          </h3>
                          <div className="space-y-3">
                            {drugDetail.interactions.major.map((int, i) => (
                              <div key={i} className={`p-4 rounded-lg ${isDark ? 'bg-red-900/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{int.drug}</div>
                                <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{int.effect}</div>
                                <div className="text-xs mt-2 text-primary">{int.management}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {drugDetail.interactions.moderate && (
                        <div>
                          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            <AlertCircle className="w-4 h-4" /> Moderate Interactions
                          </h3>
                          <div className="space-y-3">
                            {drugDetail.interactions.moderate.map((int, i) => (
                              <div key={i} className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{int.drug}</div>
                                <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{int.effect}</div>
                                <div className="text-xs mt-2 text-primary">{int.management}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`rounded-xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} p-12 text-center`}>
                <Pill className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Select a Drug
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Choose a drug from the list to view detailed information including mechanism, effects, dosing, and interactions
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DrugsPage;
