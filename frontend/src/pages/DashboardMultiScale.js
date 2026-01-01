import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  Activity, Moon, Sun, ChevronRight, ChevronDown, ChevronUp, ChevronLeft,
  Layers, Atom, Heart, Zap, RotateCcw, BookOpen, Lightbulb,
  AlertTriangle, Check, Menu, X, Stethoscope, FlaskConical,
  FileImage, Pill, Clock, TrendingUp, TrendingDown, Info, Microscope,
  Brain, Sparkles, Loader2, Search, Thermometer, HeartPulse,
  TestTube, ScanLine, Syringe, ClipboardList, Calculator, Home
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Slider } from '../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { Input } from '../components/ui/input';
import { FeatureTutorial, TutorialButton, useTutorial } from '../components/FeatureTutorial';
import { ORGAN_MODELS } from '../data/organModels';
import { DISEASE_MODELS } from '../data/diseaseModels';
import { BIOCHEMISTRY } from '../data/biochemistry';
import { ALL_CARDIAC_DISEASES, CARDIAC_CATEGORIES, getNovelEquations } from '../data/cardiacDiseasesIndex';
import { ALL_RESPIRATORY_DISEASES } from '../data/respiratoryDiseasesIndex';
import { ALL_RENAL_DISEASES, RENAL_CATEGORIES } from '../data/renalDiseasesIndex';
import { ALL_NEUROLOGICAL_DISEASES, NEUROLOGICAL_CATEGORIES } from '../data/neurologicalDiseasesIndex';
import { ALL_HEPATIC_DISEASES, HEPATIC_CATEGORIES } from '../data/hepaticDiseasesIndex';
import { ALL_METABOLIC_DISEASES, METABOLIC_CATEGORIES } from '../data/metabolicDiseasesIndex';
import { ALL_HEMATOLOGICAL_DISEASES, HEMATOLOGICAL_CATEGORIES } from '../data/hematologicalDiseasesIndex';
import { ALL_ONCOLOGY_DISEASES, ONCOLOGY_CATEGORIES } from '../data/oncologyDiseasesIndex';
import { ALL_CONGENITAL_DISEASES, CONGENITAL_CATEGORIES } from '../data/congenitalDiseasesIndex';
import { ALL_AUTOIMMUNE_DISEASES, AUTOIMMUNE_CATEGORIES } from '../data/autoimmuneDiseasesIndex';
import { ALL_INFECTIOUS_DISEASES, INFECTIOUS_CATEGORIES } from '../data/infectiousDiseasesIndex';
import { ALL_GI_DISEASES, GI_CATEGORIES } from '../data/giDiseasesIndex';
import { ALL_DERMATOLOGICAL_DISEASES, DERMATOLOGICAL_CATEGORIES } from '../data/dermatologicalDiseasesIndex';
import { ALL_PSYCHIATRIC_DISEASES, PSYCHIATRIC_CATEGORIES } from '../data/psychiatricDiseasesIndex';
import { ALL_PEDIATRIC_DISEASES, PEDIATRIC_CATEGORIES } from '../data/pediatricDiseasesIndex';
import { ALL_OBGYN_DISEASES, OBGYN_CATEGORIES } from '../data/obgynDiseasesIndex';
import { enhanceDiseaseWithTemplates, generateModifications } from '../data/diseaseTemplates';
import LungCancerModule from '../components/LungCancerModule';
import TreatmentGuidelinesPanel from '../components/TreatmentGuidelinesPanel';
import DiseaseDetailPanel from '../components/DiseaseDetailPanel';
import FeatureNav from '../components/FeatureNav';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

// Transform cardiac diseases to match existing DISEASE_MODELS format
const transformCardiacDisease = (code, disease) => {
  // Convert ICD10 code from I35_0 format to icd10 property format
  const icd10Code = code.replace('_', '.');
  
  // Find matching disease in DISEASE_MODELS to get modifications
  const matchingDiseaseKey = Object.keys(DISEASE_MODELS).find(key => {
    const dm = DISEASE_MODELS[key];
    return (dm.icd10 === icd10Code || dm.icd10 === disease.icd10 || 
            dm.name?.toLowerCase() === disease.name?.toLowerCase());
  });
  const matchingDisease = matchingDiseaseKey ? DISEASE_MODELS[matchingDiseaseKey] : null;
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'cardiac',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || matchingDisease?.primaryOrgan || 'heart',
    affectedOrgans: disease.affectedOrgans || matchingDisease?.affectedOrgans || ['heart'],
    progression: matchingDisease?.progression || (disease.pathophysiology?.natural_history ? [
      { stage: 1, name: "Early", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Advanced", severity: 0.75 },
      { stage: 4, name: "Severe", severity: 1.0 }
    ] : disease.progression),
    clinicalPresentation: disease.clinicalPresentation || matchingDisease?.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings || matchingDisease?.laboratoryFindings,
    imagingFindings: disease.imagingFindings || matchingDisease?.imagingFindings,
    pathophysiology: disease.pathophysiology,
    // IMPORTANT: Use modifications from DISEASE_MODELS, or generate from templates
    modifications: matchingDisease?.modifications || disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code }),
    novelEquations: matchingDisease?.novelEquations || disease.pathophysiology?.novelEquations || 
                   (disease.pathophysiology?.equations ? 
                     Object.values(disease.pathophysiology.equations).filter(eq => eq.isNovel) : []),
    severity: matchingDisease?.severity || disease.severity || {
      mild: { description: "Early stage" },
      moderate: { description: "Moderate progression" },
      severe: { description: "Advanced disease" }
    },
    isFromCardiacDB: true,
    hasModifications: true // Now always true with template fallback
  };
};

// Transform respiratory diseases to match existing DISEASE_MODELS format
const transformRespiratoryDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  // Find matching disease in DISEASE_MODELS to get modifications
  const matchingDiseaseKey = Object.keys(DISEASE_MODELS).find(key => {
    const dm = DISEASE_MODELS[key];
    return (dm.icd10 === icd10Code || dm.icd10 === disease.icd10 || 
            dm.name?.toLowerCase() === disease.name?.toLowerCase());
  });
  const matchingDisease = matchingDiseaseKey ? DISEASE_MODELS[matchingDiseaseKey] : null;
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'respiratory',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || matchingDisease?.primaryOrgan || 'lungs',
    affectedOrgans: disease.affectedOrgans || matchingDisease?.affectedOrgans || ['lungs'],
    progression: matchingDisease?.progression || (disease.pathophysiology?.natural_history ? [
      { stage: 1, name: "Early", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Advanced", severity: 0.75 },
      { stage: 4, name: "Severe", severity: 1.0 }
    ] : disease.progression),
    clinicalPresentation: disease.clinicalPresentation || matchingDisease?.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings || matchingDisease?.laboratoryFindings,
    imagingFindings: disease.imagingFindings || matchingDisease?.imagingFindings,
    pathophysiology: disease.pathophysiology,
    // Use modifications from DISEASE_MODELS, or generate from templates
    modifications: matchingDisease?.modifications || disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'respiratory' }),
    novelEquations: matchingDisease?.novelEquations || disease.pathophysiology?.novelEquations || 
                   (disease.pathophysiology?.equations ? 
                     Object.values(disease.pathophysiology.equations).filter(eq => eq.isNovel) : []),
    severity: matchingDisease?.severity || disease.severity || {
      mild: { description: "Early stage" },
      moderate: { description: "Moderate progression" },
      severe: { description: "Advanced disease" }
    },
    isFromRespiratoryDB: true,
    hasModifications: true // Now always true with template fallback
  };
};

// Transform renal diseases to match existing format
const transformRenalDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'renal',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'kidneys',
    affectedOrgans: disease.affectedOrgans || ['kidneys'],
    progression: disease.progression || [
      { stage: 1, name: "Early", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Advanced", severity: 0.75 },
      { stage: 4, name: "Severe", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'renal' }),
    severity: disease.severity || {
      mild: { description: "Early stage" },
      moderate: { description: "Moderate progression" },
      severe: { description: "Advanced disease" }
    },
    isFromRenalDB: true,
    hasModifications: true
  };
};

// Transform neurological diseases to match existing format
const transformNeurologicalDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'neurological',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'brain',
    affectedOrgans: disease.affectedOrgans || ['brain'],
    progression: disease.progression || [
      { stage: 1, name: "Early", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Advanced", severity: 0.75 },
      { stage: 4, name: "Severe", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'neurological' }),
    severity: disease.severity || {
      mild: { description: "Early stage" },
      moderate: { description: "Moderate progression" },
      severe: { description: "Advanced disease" }
    },
    isFromNeurologicalDB: true,
    hasModifications: true
  };
};

// Transform hepatic diseases to match existing format
const transformHepaticDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'hepatic',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'liver',
    affectedOrgans: disease.affectedOrgans || ['liver'],
    progression: disease.progression || [
      { stage: 1, name: "Early", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Advanced", severity: 0.75 },
      { stage: 4, name: "Severe", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'hepatic' }),
    severity: disease.severity || {
      mild: { description: "Early stage" },
      moderate: { description: "Moderate progression" },
      severe: { description: "Advanced disease" }
    },
    isFromHepaticDB: true,
    hasModifications: true
  };
};

// Transform metabolic diseases to match existing format
const transformMetabolicDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'metabolic',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'pancreas',
    affectedOrgans: disease.affectedOrgans || ['pancreas'],
    progression: disease.progression || [
      { stage: 1, name: "Early", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Advanced", severity: 0.75 },
      { stage: 4, name: "Severe", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'metabolic' }),
    severity: disease.severity || {
      mild: { description: "Early stage" },
      moderate: { description: "Moderate progression" },
      severe: { description: "Advanced disease" }
    },
    isFromMetabolicDB: true,
    hasModifications: true
  };
};

// Transform hematological diseases to match existing format
const transformHematologicalDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'hematological',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'blood',
    affectedOrgans: disease.affectedOrgans || ['blood', 'bonemarrow'],
    progression: disease.progression || [
      { stage: 1, name: "Mild", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Severe", severity: 0.75 },
      { stage: 4, name: "Critical", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'hematological' }),
    severity: disease.severity || {
      mild: { description: "Mild anemia/disorder" },
      moderate: { description: "Moderate severity" },
      severe: { description: "Severe/life-threatening" }
    },
    isFromHematologicalDB: true,
    hasModifications: true
  };
};

// Transform oncology diseases to match existing format
const transformOncologyDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'oncology',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'blood',
    affectedOrgans: disease.affectedOrgans || ['blood', 'bonemarrow', 'lymphatic'],
    progression: disease.progression || [
      { stage: 1, name: "Stage I", severity: 0.25 },
      { stage: 2, name: "Stage II", severity: 0.5 },
      { stage: 3, name: "Stage III", severity: 0.75 },
      { stage: 4, name: "Stage IV", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'oncology' }),
    severity: disease.severity || {
      mild: { description: "Early/localized" },
      moderate: { description: "Locally advanced" },
      severe: { description: "Metastatic/advanced" }
    },
    isFromOncologyDB: true,
    hasModifications: true
  };
};

// Transform congenital diseases to match existing format
const transformCongenitalDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'congenital',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'brain',
    affectedOrgans: disease.affectedOrgans || ['brain', 'heart'],
    progression: disease.progression || [
      { stage: 1, name: "Mild", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Severe", severity: 0.75 },
      { stage: 4, name: "Critical", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'congenital' }),
    severity: disease.severity || {
      mild: { description: "Mild phenotype" },
      moderate: { description: "Moderate manifestations" },
      severe: { description: "Severe/complex" }
    },
    isFromCongenitalDB: true,
    hasModifications: true
  };
};

// Transform autoimmune diseases to match existing format
const transformAutoimmuneDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'autoimmune',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'blood',
    affectedOrgans: disease.affectedOrgans || ['blood', 'joints'],
    progression: disease.progression || [
      { stage: 1, name: "Mild", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Severe", severity: 0.75 },
      { stage: 4, name: "Critical", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'autoimmune' }),
    severity: disease.severity || {
      mild: { description: "Mild disease activity" },
      moderate: { description: "Moderate flare" },
      severe: { description: "Severe/organ-threatening" }
    },
    isFromAutoimmuneDB: true,
    hasModifications: true
  };
};

// Transform infectious diseases to match existing format
const transformInfectiousDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'infectious',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'blood',
    affectedOrgans: disease.affectedOrgans || ['blood', 'lungs'],
    progression: disease.progression || [
      { stage: 1, name: "Mild", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Severe", severity: 0.75 },
      { stage: 4, name: "Critical", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'infectious' }),
    severity: disease.severity || {
      mild: { description: "Mild infection" },
      moderate: { description: "Moderate illness" },
      severe: { description: "Severe/sepsis" }
    },
    isFromInfectiousDB: true,
    hasModifications: true
  };
};

// Transform GI diseases to match existing format
const transformGIDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'gastrointestinal',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'gi_tract',
    affectedOrgans: disease.affectedOrgans || ['gi_tract'],
    progression: disease.progression || [
      { stage: 1, name: "Mild", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Severe", severity: 0.75 },
      { stage: 4, name: "Critical", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'gastrointestinal' }),
    severity: disease.severity || {
      mild: { description: "Mild symptoms" },
      moderate: { description: "Moderate disease" },
      severe: { description: "Severe/complicated" }
    },
    isFromGIDB: true,
    hasModifications: true
  };
};

// Transform dermatological diseases to match existing format
const transformDermatologicalDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'dermatological',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'skin',
    affectedOrgans: disease.affectedOrgans || ['skin'],
    progression: disease.progression || [
      { stage: 1, name: "Mild", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Severe", severity: 0.75 },
      { stage: 4, name: "Critical", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    histopathology: disease.histopathology,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'dermatological' }),
    severity: disease.severity,
    isFromDermatologicalDB: true,
    hasModifications: true
  };
};

// Transform psychiatric diseases to match existing format
const transformPsychiatricDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'psychiatric',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'brain',
    affectedOrgans: disease.affectedOrgans || ['brain'],
    progression: disease.progression || [
      { stage: 1, name: "Mild", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Severe", severity: 0.75 },
      { stage: 4, name: "Critical", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    diagnosticCriteria: disease.diagnosticCriteria,
    screeningTools: disease.screeningTools,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'psychiatric' }),
    severity: disease.severity,
    isFromPsychiatricDB: true,
    hasModifications: true
  };
};

// Transform pediatric diseases to match existing format
const transformPediatricDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'pediatric',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'blood',
    affectedOrgans: disease.affectedOrgans || ['blood'],
    ageGroup: disease.ageGroup,
    progression: disease.progression || [
      { stage: 1, name: "Mild", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Severe", severity: 0.75 },
      { stage: 4, name: "Critical", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    diagnosticCriteria: disease.diagnosticCriteria,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'pediatric' }),
    severity: disease.severity,
    isFromPediatricDB: true,
    hasModifications: true
  };
};

// Transform OB/GYN diseases to match existing format
const transformOBGYNDisease = (code, disease) => {
  const icd10Code = code.replace('_', '.');
  
  return {
    name: disease.name,
    icd10: disease.icd10 || icd10Code,
    category: disease.category || 'obgyn',
    description: disease.definition || disease.name,
    definition: disease.definition,
    primaryOrgan: disease.primaryOrgan || 'uterus',
    affectedOrgans: disease.affectedOrgans || ['uterus'],
    progression: disease.progression || [
      { stage: 1, name: "Mild", severity: 0.25 },
      { stage: 2, name: "Moderate", severity: 0.5 },
      { stage: 3, name: "Severe", severity: 0.75 },
      { stage: 4, name: "Critical", severity: 1.0 }
    ],
    clinicalPresentation: disease.clinicalPresentation,
    laboratoryFindings: disease.laboratoryFindings,
    imagingFindings: disease.imagingFindings,
    pathophysiology: disease.pathophysiology,
    diagnosticCriteria: disease.diagnosticCriteria,
    modifications: disease.modifications || 
                   generateModifications({ ...disease, icd10: disease.icd10 || icd10Code, category: 'obgyn' }),
    severity: disease.severity,
    isFromOBGYNDB: true,
    hasModifications: true
  };
};

// Get keys to exclude from DISEASE_MODELS (already covered by ICD-10 diseases)
const getDiseaseModelKeysByIcd10 = () => {
  const icd10Covered = new Set();
  
  Object.values(ALL_CARDIAC_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_RESPIRATORY_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_RENAL_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_NEUROLOGICAL_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_HEPATIC_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_METABOLIC_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_HEMATOLOGICAL_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_ONCOLOGY_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_CONGENITAL_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_AUTOIMMUNE_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_INFECTIOUS_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_GI_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_DERMATOLOGICAL_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_PSYCHIATRIC_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_PEDIATRIC_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  Object.values(ALL_OBGYN_DISEASES).forEach(d => {
    if (d.icd10) icd10Covered.add(d.icd10);
  });
  
  const excludeKeys = [];
  Object.entries(DISEASE_MODELS).forEach(([key, disease]) => {
    if (disease.icd10 && icd10Covered.has(disease.icd10)) {
      excludeKeys.push(key);
    }
  });
  return excludeKeys;
};

const excludedDiseaseKeys = getDiseaseModelKeysByIcd10();

// Filter DISEASE_MODELS to remove duplicates
const filteredDiseaseModels = Object.fromEntries(
  Object.entries(DISEASE_MODELS).filter(([key]) => !excludedDiseaseKeys.includes(key))
);

// Merge all disease databases with existing disease models (deduplicated)
const MERGED_DISEASE_MODELS = {
  ...filteredDiseaseModels,
  ...Object.fromEntries(
    Object.entries(ALL_CARDIAC_DISEASES).map(([code, disease]) => [
      code, transformCardiacDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_RESPIRATORY_DISEASES).map(([code, disease]) => [
      code, transformRespiratoryDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_RENAL_DISEASES).map(([code, disease]) => [
      code, transformRenalDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_NEUROLOGICAL_DISEASES).map(([code, disease]) => [
      code, transformNeurologicalDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_HEPATIC_DISEASES).map(([code, disease]) => [
      code, transformHepaticDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_METABOLIC_DISEASES).map(([code, disease]) => [
      code, transformMetabolicDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_HEMATOLOGICAL_DISEASES).map(([code, disease]) => [
      code, transformHematologicalDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_ONCOLOGY_DISEASES).map(([code, disease]) => [
      code, transformOncologyDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_CONGENITAL_DISEASES).map(([code, disease]) => [
      code, transformCongenitalDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_AUTOIMMUNE_DISEASES).map(([code, disease]) => [
      code, transformAutoimmuneDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_INFECTIOUS_DISEASES).map(([code, disease]) => [
      code, transformInfectiousDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_GI_DISEASES).map(([code, disease]) => [
      code, transformGIDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_DERMATOLOGICAL_DISEASES).map(([code, disease]) => [
      code, transformDermatologicalDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_PSYCHIATRIC_DISEASES).map(([code, disease]) => [
      code, transformPsychiatricDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_PEDIATRIC_DISEASES).map(([code, disease]) => [
      code, transformPediatricDisease(code, disease)
    ])
  ),
  ...Object.fromEntries(
    Object.entries(ALL_OBGYN_DISEASES).map(([code, disease]) => [
      code, transformOBGYNDisease(code, disease)
    ])
  )
};

const SCALE_LEVELS = [
  { id: 'geometry', name: 'Geometry', fullName: 'Geometry & Dimensions', icon: '📐', description: 'Shape, size, volumes' },
  { id: 'pressures', name: 'Pressures', fullName: 'Pressures & Gradients', icon: '📊', description: 'Forces and flows' },
  { id: 'structure', name: 'Structure', fullName: 'Structure & Tissue', icon: '🔬', description: 'Tissue composition' },
  { id: 'physiology', name: 'Physiology', fullName: 'Physiology & Function', icon: '⚡', description: 'Functional measures' },
  { id: 'cellular', name: 'Cellular', fullName: 'Cellular & Molecular', icon: '🧬', description: 'Cell-level processes' },
];

// Clinical Insights Component with AI
const ClinicalInsightsPanel = ({ disease, severity }) => {
  const defaultSymptoms = [
    "Fatigue and weakness",
    "Shortness of breath on exertion",
    "Chest discomfort",
    "Palpitations",
    "Dizziness or lightheadedness"
  ];
  
  // Safely get symptoms - handle both array of strings and array of objects formats
  const getSymptoms = () => {
    const raw = disease?.clinicalPresentation?.symptoms;
    if (!raw) return defaultSymptoms;
    if (Array.isArray(raw)) {
      // Normalize: if array contains objects, extract the name property
      return raw.map(s => typeof s === 'string' ? s : s?.name || 'Unknown symptom');
    }
    if (typeof raw === 'object' && raw !== null) {
      return Object.values(raw).map(s => typeof s === 'string' ? s : s?.name || 'Unknown');
    }
    return defaultSymptoms;
  };

  const clinicalData = disease ? {
    symptoms: getSymptoms(),
    labTests: disease.clinicalPresentation?.labTests || [
      { name: "BNP/NT-proBNP", value: "Elevated", significance: "Heart strain marker" },
      { name: "Troponin", value: "May be elevated", significance: "Myocardial injury" },
      { name: "CBC", value: "Check for anemia", significance: "Contributing factor" },
      { name: "BMP", value: "Electrolytes, kidney function", significance: "Baseline assessment" }
    ],
    imaging: disease.clinicalPresentation?.imaging || [
      { type: "Echocardiogram", findings: "Assess wall thickness, EF, diastolic function" },
      { type: "ECG", findings: "LVH patterns, arrhythmias" },
      { type: "Cardiac MRI", findings: "Detailed tissue characterization" }
    ],
    treatments: disease.clinicalPresentation?.treatments || [
      { category: "Medications", items: ["Beta-blockers", "ACE inhibitors", "Diuretics if needed"] },
      { category: "Lifestyle", items: ["Sodium restriction", "Fluid management", "Activity modification"] },
      { category: "Monitoring", items: ["Regular follow-up", "Serial imaging", "Symptom tracking"] }
    ]
  } : null;

  if (!disease) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-primary" />
          Clinical Detection
        </h3>
        <Badge variant="outline" className="text-xs">
          {severity < 0.33 ? 'Mild' : severity < 0.66 ? 'Moderate' : 'Severe'}
        </Badge>
      </div>

      {/* Symptoms */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Patient Symptoms
        </h4>
        <ul className="space-y-1">
          {clinicalData?.symptoms.slice(0, 4).map((symptom, i) => (
            <li key={i} className="text-xs flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{symptom}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Lab Tests */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <FlaskConical className="w-3 h-3" /> Lab Tests
        </h4>
        <div className="space-y-2">
          {clinicalData?.labTests.slice(0, 3).map((test, i) => (
            <div key={i} className="text-xs">
              <div className="flex justify-between">
                <span className="font-medium">{test.name}</span>
                <span className="text-primary">{test.value}</span>
              </div>
              <span className="text-muted-foreground text-[10px]">{test.significance}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Imaging */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <FileImage className="w-3 h-3" /> Imaging
        </h4>
        <div className="space-y-2">
          {clinicalData?.imaging.slice(0, 2).map((img, i) => (
            <div key={i} className="text-xs">
              <span className="font-medium">{img.type}</span>
              <p className="text-muted-foreground text-[10px]">{img.findings}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Treatment */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <Pill className="w-3 h-3" /> Treatment Approach
        </h4>
        {clinicalData?.treatments.slice(0, 2).map((treatment, i) => (
          <div key={i} className="mb-2 last:mb-0">
            <span className="text-xs font-medium text-primary">{treatment.category}:</span>
            <p className="text-xs text-muted-foreground">{treatment.items.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Equation Derivation Component with Calculated Results
const EquationDerivation = ({ equation, expanded, onToggle, currentParams = {}, diseaseSeverity = 0.5, isDiseasedState = false }) => {
  const isNovel = equation.evidence === 'novel' || equation.isNovel;
  
  // Calculate values based on equation type
  const getCalculatedValues = () => {
    const params = currentParams || {};
    const severity = diseaseSeverity;
    
    // Common cardiac equations
    if (equation.id === 'stroke_volume' || equation.name?.includes('Stroke Volume')) {
      const edv = params.lv_edv || 120;
      const esv = params.lv_esv || 50;
      const diseasedEdv = isDiseasedState ? edv * (1 - 0.2 * severity) : edv;
      const diseasedEsv = isDiseasedState ? esv * (1 + 0.3 * severity) : esv;
      return {
        normal: { edv: 120, esv: 50, result: 70, unit: 'mL' },
        current: { edv: diseasedEdv.toFixed(0), esv: diseasedEsv.toFixed(0), result: (diseasedEdv - diseasedEsv).toFixed(0), unit: 'mL' },
        formula: 'SV = EDV - ESV',
        calculation: `SV = ${diseasedEdv.toFixed(0)} - ${diseasedEsv.toFixed(0)} = ${(diseasedEdv - diseasedEsv).toFixed(0)} mL`
      };
    }
    
    if (equation.id === 'cardiac_output' || equation.name?.includes('Cardiac Output')) {
      const sv = params.stroke_volume || 70;
      const hr = params.heart_rate || 70;
      const diseasedSv = isDiseasedState ? sv * (1 - 0.25 * severity) : sv;
      const diseasedHr = isDiseasedState ? hr * (1 + 0.15 * severity) : hr;
      return {
        normal: { sv: 70, hr: 70, result: 4.9, unit: 'L/min' },
        current: { sv: diseasedSv.toFixed(0), hr: diseasedHr.toFixed(0), result: ((diseasedSv * diseasedHr) / 1000).toFixed(1), unit: 'L/min' },
        formula: 'CO = SV × HR',
        calculation: `CO = ${diseasedSv.toFixed(0)} × ${diseasedHr.toFixed(0)} / 1000 = ${((diseasedSv * diseasedHr) / 1000).toFixed(1)} L/min`
      };
    }
    
    if (equation.id === 'ef_calc' || equation.name?.includes('Ejection Fraction')) {
      const edv = params.lv_edv || 120;
      const esv = params.lv_esv || 50;
      const diseasedEdv = isDiseasedState ? edv * (1 - 0.15 * severity) : edv;
      const diseasedEsv = isDiseasedState ? esv * (1 + 0.4 * severity) : esv;
      const ef = ((diseasedEdv - diseasedEsv) / diseasedEdv * 100);
      return {
        normal: { edv: 120, esv: 50, result: 58, unit: '%' },
        current: { edv: diseasedEdv.toFixed(0), esv: diseasedEsv.toFixed(0), result: ef.toFixed(0), unit: '%' },
        formula: 'EF = (EDV - ESV) / EDV × 100',
        calculation: `EF = (${diseasedEdv.toFixed(0)} - ${diseasedEsv.toFixed(0)}) / ${diseasedEdv.toFixed(0)} × 100 = ${ef.toFixed(0)}%`
      };
    }
    
    if (equation.id === 'homa_ir_calc' || equation.name?.includes('HOMA-IR')) {
      const glucose = params.fasting_glucose || 90;
      const insulin = params.fasting_insulin || 10;
      const diseasedGlucose = isDiseasedState ? glucose * (1 + 0.4 * severity) : glucose;
      const diseasedInsulin = isDiseasedState ? insulin * (1 + 0.5 * severity) : insulin;
      const homaIr = (diseasedGlucose * diseasedInsulin) / 405;
      return {
        normal: { glucose: 90, insulin: 10, result: 2.2, unit: '' },
        current: { glucose: diseasedGlucose.toFixed(0), insulin: diseasedInsulin.toFixed(0), result: homaIr.toFixed(1), unit: '' },
        formula: 'HOMA-IR = (Glucose × Insulin) / 405',
        calculation: `HOMA-IR = (${diseasedGlucose.toFixed(0)} × ${diseasedInsulin.toFixed(0)}) / 405 = ${homaIr.toFixed(1)}`
      };
    }
    
    if (equation.id === 'homa_beta' || equation.name?.includes('HOMA-β')) {
      const glucose = params.fasting_glucose || 90;
      const insulin = params.fasting_insulin || 10;
      const diseasedGlucose = isDiseasedState ? glucose * (1 + 0.4 * severity) : glucose;
      const diseasedInsulin = isDiseasedState ? insulin * (1 - 0.3 * severity) : insulin;
      const homaBeta = (360 * diseasedInsulin) / (diseasedGlucose - 63);
      return {
        normal: { glucose: 90, insulin: 10, result: 133, unit: '%' },
        current: { glucose: diseasedGlucose.toFixed(0), insulin: diseasedInsulin.toFixed(0), result: homaBeta.toFixed(0), unit: '%' },
        formula: 'HOMA-β = (360 × Insulin) / (Glucose - 63)',
        calculation: `HOMA-β = (360 × ${diseasedInsulin.toFixed(0)}) / (${diseasedGlucose.toFixed(0)} - 63) = ${homaBeta.toFixed(0)}%`
      };
    }
    
    if (equation.id === 'gfr_starling' || equation.name?.includes('GFR')) {
      const kf = 12.5;
      const pGc = params.glomerular_cap_p || 60;
      const pBc = params.bowman_p || 18;
      const piGc = params.oncotic_p || 32;
      const diseasedPgc = isDiseasedState ? pGc * (1 - 0.1 * severity) : pGc;
      const nfp = diseasedPgc - pBc - piGc;
      const gfr = kf * nfp;
      return {
        normal: { kf: 12.5, pgc: 60, pbc: 18, pi: 32, result: 125, unit: 'mL/min' },
        current: { kf: 12.5, pgc: diseasedPgc.toFixed(0), pbc: 18, pi: 32, result: gfr.toFixed(0), unit: 'mL/min' },
        formula: 'GFR = Kf × (PGC - PBC - πGC)',
        calculation: `GFR = 12.5 × (${diseasedPgc.toFixed(0)} - 18 - 32) = ${gfr.toFixed(0)} mL/min`
      };
    }
    
    if (equation.id === 'wall_stress' || equation.name?.includes('Wall Stress')) {
      const p = params.lv_sys_p || 120;
      const r = 25; // radius in mm
      const h = params.lv_wall_thickness || 10;
      const diseasedP = isDiseasedState ? p * (1 + 0.3 * severity) : p;
      const diseasedH = isDiseasedState ? h * (1 - 0.15 * severity) : h;
      const stress = (diseasedP * r) / (2 * diseasedH);
      return {
        normal: { p: 120, r: 25, h: 10, result: 150, unit: 'kPa' },
        current: { p: diseasedP.toFixed(0), r: 25, h: diseasedH.toFixed(1), result: stress.toFixed(0), unit: 'kPa' },
        formula: 'σ = (P × r) / (2h)',
        calculation: `σ = (${diseasedP.toFixed(0)} × 25) / (2 × ${diseasedH.toFixed(1)}) = ${stress.toFixed(0)} kPa`
      };
    }
    
    if (equation.id === 'beta_cell_function' || equation.name?.includes('β-Cell')) {
      const mBeta = params.beta_cell_mass || 1.5;
      const k = 100;
      const fViability = isDiseasedState ? 1 - 0.4 * severity : 1;
      const fExhaustion = isDiseasedState ? 1 - 0.3 * severity : 1;
      const insMax = k * mBeta * fViability * fExhaustion;
      return {
        normal: { k: 100, mBeta: 1.5, fVia: 1, fExh: 1, result: 150, unit: 'µU/mL' },
        current: { k: 100, mBeta: mBeta.toFixed(1), fVia: fViability.toFixed(2), fExh: fExhaustion.toFixed(2), result: insMax.toFixed(0), unit: 'µU/mL' },
        formula: 'Ins_max = k × M_β × f_viability × f_exhaustion',
        calculation: `Ins_max = 100 × ${mBeta.toFixed(1)} × ${fViability.toFixed(2)} × ${fExhaustion.toFixed(2)} = ${insMax.toFixed(0)} µU/mL`
      };
    }
    
    // Default calculation placeholder
    return null;
  };

  const calculatedValues = getCalculatedValues();
  
  // Use equation's derivation if available, otherwise create informative defaults
  const derivationSteps = equation.derivation || [
    {
      step: 1,
      title: "Mathematical Foundation",
      description: equation.latex 
        ? `This equation ${equation.isNovel ? 'is a novel formula' : 'is an established formula'} based on ${equation.source || 'clinical guidelines'}.`
        : "Begin with fundamental conservation principles",
      latex: null
    },
    {
      step: 2,
      title: "Clinical Parameters",
      description: equation.description || "This equation quantifies physiological relationships using measurable clinical parameters.",
    },
    {
      step: 3,
      title: "Clinical Application",
      description: equation.validation || 
        (equation.isNovel 
          ? "This novel equation provides additional insight beyond established measures and requires further validation."
          : "Validated against clinical measurements in peer-reviewed studies and widely used in clinical practice."),
    }
  ];

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      isNovel 
        ? 'border-amber-500/50 bg-amber-500/10' 
        : 'border-border/50 bg-card/30'
    }`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-3 md:p-4 transition-colors ${
          isNovel ? 'hover:bg-amber-500/20' : 'hover:bg-accent/5'
        }`}
      >
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <Badge 
            variant={isNovel ? 'default' : 'outline'} 
            className={`shrink-0 text-[10px] ${isNovel ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : ''}`}
          >
            {isNovel ? (
              <><Lightbulb className="w-2.5 h-2.5 mr-1" />Novel</>
            ) : (
              <><Check className="w-2.5 h-2.5 mr-1" />Established</>
            )}
          </Badge>
          <div className="text-left min-w-0">
            <h4 className="font-medium text-sm truncate">{equation.name}</h4>
            <p className="text-xs text-muted-foreground truncate hidden sm:block">{equation.description}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground shrink-0" />
        )}
      </button>
      
      <AnimatePresence mode="wait">
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`border-t overflow-hidden ${isNovel ? 'border-amber-500/50' : 'border-border/50'}`}
          >
            <div className="p-3 md:p-4 space-y-4">
              {/* Main Equation */}
              <div className="bg-background/50 rounded-lg p-3 md:p-6 overflow-x-auto">
                <BlockMath math={equation.latex} />
              </div>

              {/* Calculated Values Section */}
              {calculatedValues && (
                <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg p-3 md:p-4 border border-primary/20">
                  <h5 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Calculator className="w-3 h-3" /> Live Calculation
                  </h5>
                  
                  {/* Calculation with actual values */}
                  <div className="bg-background/50 rounded-lg p-3 mb-3 font-mono text-sm overflow-x-auto">
                    <div className="text-muted-foreground mb-1">{calculatedValues.formula}</div>
                    <div className="text-foreground font-medium">{calculatedValues.calculation}</div>
                  </div>
                  
                  {/* Results comparison */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                      <div className="text-[10px] text-green-400 uppercase tracking-wider mb-1">Normal</div>
                      <div className="text-xl font-bold text-green-400">
                        {calculatedValues.normal.result}
                        <span className="text-sm ml-1">{calculatedValues.normal.unit}</span>
                      </div>
                    </div>
                    <div className={`rounded-lg p-3 border ${
                      isDiseasedState 
                        ? 'bg-destructive/10 border-destructive/20' 
                        : 'bg-blue-500/10 border-blue-500/20'
                    }`}>
                      <div className={`text-[10px] uppercase tracking-wider mb-1 ${
                        isDiseasedState ? 'text-destructive' : 'text-blue-400'
                      }`}>
                        {isDiseasedState ? 'Current (Diseased)' : 'Current'}
                      </div>
                      <div className={`text-xl font-bold ${
                        isDiseasedState ? 'text-destructive' : 'text-blue-400'
                      }`}>
                        {calculatedValues.current.result}
                        <span className="text-sm ml-1">{calculatedValues.current.unit}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isDiseasedState && (
                    <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      Values adjusted for disease severity ({(diseaseSeverity * 100).toFixed(0)}%)
                    </div>
                  )}
                </div>
              )}

              {/* Derivation Steps */}
              <div className="space-y-3">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-3 h-3" /> Derivation & Explanation
                </h5>
                
                {derivationSteps.map((step, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{step.title}:</span>
                      <p className="text-muted-foreground text-xs mt-0.5">{step.description}</p>
                      {step.latex && step.step > 1 && (
                        <div className="mt-2 p-2 bg-background/30 rounded overflow-x-auto">
                          <InlineMath math={step.latex} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Source */}
              {equation.source && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/30">
                  <BookOpen className="w-3 h-3" />
                  <span>Source: {equation.source}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===========================================
// CLINICAL FINDINGS PANEL - Comprehensive disease data display
// ===========================================
const ClinicalFindingsPanel = ({ disease, isExpanded, onToggle, alwaysExpanded = false }) => {
  const [activeTab, setActiveTab] = React.useState('symptoms');
  const expanded = alwaysExpanded || isExpanded;
  
  if (!disease) return null;

  const clinicalData = disease.clinicalPresentation || {};
  const labFindings = Array.isArray(disease.laboratoryFindings) ? disease.laboratoryFindings : [];
  const rawImagingFindings = disease.imagingFindings || {};
  const pathophysiology = disease.pathophysiology || {};
  
  // Safely extract text from complex objects
  const extractText = (item) => {
    if (!item) return null;
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      // Extract meaningful text from object properties
      const textParts = [];
      
      // Common properties to extract
      const primaryKeys = ['name', 'description', 'character', 'quality', 'location', 'finding', 'value'];
      const detailKeys = ['severity', 'timing', 'duration', 'progression', 'pattern', 'onset'];
      
      // Get primary description
      for (const key of primaryKeys) {
        if (item[key] && typeof item[key] === 'string') {
          textParts.push(item[key]);
          break;
        }
      }
      
      // Get additional details
      for (const key of detailKeys) {
        if (item[key] && typeof item[key] === 'string') {
          textParts.push(`${key}: ${item[key]}`);
        }
      }
      
      if (textParts.length > 0) {
        return textParts.join(' — ');
      }
      
      // Fallback: extract any string values
      const stringValues = Object.values(item).filter(v => typeof v === 'string' && v.length > 0);
      if (stringValues.length > 0) {
        return stringValues.join(' — ');
      }
    }
    return null;
  };
  
  // Safely extract array of strings from various data formats
  const safeArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.map(extractText).filter(Boolean);
    }
    if (typeof data === 'object' && data !== null) {
      // For nested objects, flatten and extract text
      const results = [];
      Object.values(data).forEach(value => {
        if (Array.isArray(value)) {
          value.forEach(item => {
            const text = extractText(item);
            if (text) results.push(text);
          });
        } else {
          const text = extractText(value);
          if (text) results.push(text);
        }
      });
      return results;
    }
    return [];
  };
  
  const symptoms = safeArray(clinicalData.symptoms);
  const signs = safeArray(clinicalData.signs);
  
  // Get all imaging modalities - handle nested object structures
  const imagingModalities = Object.entries(rawImagingFindings).map(([modality, findings]) => {
    let flatFindings = [];
    if (Array.isArray(findings)) {
      flatFindings = findings.map(extractText).filter(Boolean);
    } else if (typeof findings === 'object' && findings !== null) {
      // Flatten nested object (like {mca: [...], aca: [...], etc.})
      Object.entries(findings).forEach(([key, value]) => {
        const prefix = key.toUpperCase();
        if (Array.isArray(value)) {
          value.forEach(v => {
            const text = extractText(v);
            if (text) flatFindings.push(`${prefix}: ${text}`);
          });
        } else {
          const text = extractText(value);
          if (text) flatFindings.push(`${prefix}: ${text}`);
        }
      });
    } else if (findings) {
      const text = extractText(findings);
      if (text) flatFindings.push(text);
    }
    return [modality, flatFindings];
  }).filter(([_, findings]) => findings.length > 0);
  
  // Get equations from pathophysiology
  const equations = pathophysiology.equations ? Object.values(pathophysiology.equations) : [];

  const tabs = [
    { id: 'symptoms', label: 'Symptoms', icon: Thermometer, count: symptoms.length },
    { id: 'signs', label: 'Signs', icon: Stethoscope, count: signs.length },
    { id: 'labs', label: 'Labs', icon: TestTube, count: labFindings.length },
    { id: 'imaging', label: 'Imaging', icon: ScanLine, count: imagingModalities.length },
    { id: 'equations', label: 'Math Models', icon: Brain, count: equations.length }
  ];

  return (
    <div className="border border-border/50 rounded-xl bg-card/30 overflow-hidden">
      {/* Header - hide toggle button if always expanded */}
      {!alwaysExpanded && (
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ClipboardList className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-sm">Clinical Findings Database</h3>
              <p className="text-xs text-muted-foreground">
                {symptoms.length + signs.length} clinical features • {labFindings.length} lab tests • {imagingModalities.length} imaging modalities
              </p>
            </div>
          </div>
          {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={alwaysExpanded ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={!alwaysExpanded ? "border-t border-border/50" : ""}
          >
            {/* Tab Navigation */}
            <div className="flex gap-1 p-2 overflow-x-auto border-b border-border/50 bg-accent/5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent/10'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 max-h-[50vh] md:max-h-[400px] overflow-y-auto overscroll-contain touch-pan-y">
              {/* SYMPTOMS TAB */}
              {activeTab === 'symptoms' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    Patient-Reported Symptoms
                  </div>
                  {symptoms.length > 0 ? (
                    <div className="grid gap-2">
                      {symptoms.map((symptom, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-orange-500/5 border border-orange-500/20">
                          <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-orange-400">{i + 1}</span>
                          </div>
                          <span className="text-sm">{symptom}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No symptoms data available</p>
                  )}
                </div>
              )}

              {/* SIGNS TAB */}
              {activeTab === 'signs' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Stethoscope className="w-4 h-4 text-green-400" />
                    Clinical Examination Signs
                  </div>
                  {signs.length > 0 ? (
                    <div className="grid gap-2">
                      {signs.map((sign, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/20">
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-sm">{sign}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No clinical signs data available</p>
                  )}
                </div>
              )}

              {/* LABS TAB */}
              {activeTab === 'labs' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <TestTube className="w-4 h-4 text-purple-400" />
                    Laboratory Investigations
                  </div>
                  {labFindings.length > 0 ? (
                    <div className="space-y-2">
                      {labFindings.map((lab, i) => (
                        <div key={i} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{lab.name}</span>
                            <Badge variant="outline" className="text-[10px]">Lab Test</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Normal: </span>
                              <span className="text-green-400">{lab.normalRange}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">In Disease: </span>
                              <span className="text-red-400">{lab.abnormalInDisease}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No laboratory findings data available</p>
                  )}
                </div>
              )}

              {/* IMAGING TAB */}
              {activeTab === 'imaging' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <ScanLine className="w-4 h-4 text-cyan-400" />
                    Imaging & Diagnostic Studies
                  </div>
                  {imagingModalities.length > 0 ? (
                    <div className="space-y-3">
                      {imagingModalities.map(([modality, findings], i) => (
                        <div key={i} className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]">
                              {modality.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                          </div>
                          <ul className="space-y-1">
                            {(Array.isArray(findings) ? findings : [findings]).map((finding, j) => (
                              <li key={j} className="text-sm flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No imaging findings data available</p>
                  )}
                </div>
              )}

              {/* EQUATIONS TAB */}
              {activeTab === 'equations' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Brain className="w-4 h-4 text-amber-400" />
                    Mathematical Models & Equations
                  </div>
                  {equations.length > 0 ? (
                    <div className="space-y-3">
                      {equations.map((eq, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-lg border ${
                            eq.isNovel 
                              ? 'bg-amber-500/10 border-amber-500/30' 
                              : 'bg-card/50 border-border/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{eq.name}</span>
                            <Badge 
                              variant={eq.isNovel ? 'default' : 'outline'} 
                              className={`text-[10px] ${eq.isNovel ? 'bg-amber-500/20 text-amber-400' : ''}`}
                            >
                              {eq.isNovel ? 'Novel' : 'Established'}
                            </Badge>
                          </div>
                          {eq.latex && (
                            <div className="bg-black/20 rounded p-2 my-2 overflow-x-auto">
                              <BlockMath math={eq.latex} />
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">{eq.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No mathematical models available for this condition</p>
                  )}
                </div>
              )}

              {/* Pathophysiology Section */}
              {pathophysiology.mechanism && (
                <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-border/50">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <Microscope className="w-3.5 h-3.5" /> Pathophysiology
                  </h4>
                  <p className="text-sm">{pathophysiology.mechanism}</p>
                  {pathophysiology.molecularBasis && (
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Molecular Basis:</strong> {pathophysiology.molecularBasis}
                    </p>
                  )}
                </div>
              )}

              {/* Severity Classification */}
              {disease.severity && (
                <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-border/50">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" /> Severity Classification
                  </h4>
                  <div className="grid gap-2">
                    {Object.entries(disease.severity).map(([level, data]) => (
                      <div key={level} className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${
                            level === 'mild' ? 'border-green-500/50 text-green-400' :
                            level === 'moderate' ? 'border-yellow-500/50 text-yellow-400' :
                            'border-red-500/50 text-red-400'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{data.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Disease Progression Timeline
const DiseaseProgressionTimeline = ({ disease, currentSeverity }) => {
  if (!disease?.progression) return null;

  const stages = disease.progression || [
    { stage: 1, name: "Early", description: "Initial changes", severity: 0.2 },
    { stage: 2, name: "Intermediate", description: "Progressive involvement", severity: 0.5 },
    { stage: 3, name: "Advanced", description: "Multi-organ effects", severity: 0.8 },
    { stage: 4, name: "Severe", description: "End-stage complications", severity: 1.0 }
  ];

  const currentStage = stages.findIndex(s => currentSeverity <= s.severity) + 1 || stages.length;

  return (
    <div className="mt-4 p-3 rounded-lg border border-border/50 bg-card/30">
      <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <Clock className="w-3 h-3" /> Disease Progression
      </h4>
      <div className="relative">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-border" />
        <div 
          className="absolute top-3 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentStage / stages.length) * 100}%` }}
        />
        <div className="relative flex justify-between">
          {stages.map((stage, i) => (
            <div key={i} className="flex flex-col items-center">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < currentStage 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stage.stage}
              </div>
              <span className="text-[10px] mt-1 text-center">{stage.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Organ Sidebar Component - Moved outside main component
const OrganSidebar = ({ 
  organs, 
  selectedOrgan, 
  onSelectOrgan, 
  currentDisease, 
  affectedCounts = {},
  onToggleTheme, 
  isDark, 
  isMobile = false 
}) => (
  <div className={`flex flex-col h-full ${isMobile ? '' : 'w-56 border-r border-border/50'}`}>
    {!isMobile && (
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
            <span className="text-xl font-serif text-indigo-400">Φ</span>
          </div>
          <div>
            <h1 className="font-bold text-sm bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">PhiCore.ai</h1>
            <p className="text-[10px] text-muted-foreground">Digital Physiology</p>
          </div>
        </div>
      </div>
    )}

    <div className="p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Organs</p>
    </div>

    <ScrollArea className="flex-1 px-2">
      {organs.map(([id, organ]) => {
        const isAffected = currentDisease?.affectedOrgans?.includes(id);
        const isPrimary = currentDisease?.primaryOrgan === id;
        const count = affectedCounts[id] || 0;
        
        return (
          <button
            key={id}
            onClick={() => onSelectOrgan(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
              selectedOrgan === id
                ? 'bg-primary/20 text-primary'
                : isAffected
                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
            }`}
            data-testid={`organ-${id}`}
          >
            <span className="text-xl">{organ.icon}</span>
            <span className="flex-1 text-left text-sm">{organ.name}</span>
            {/* Affected count badge */}
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  isPrimary 
                    ? 'bg-destructive text-destructive-foreground' 
                    : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                }`}
              >
                {count}
              </motion.span>
            )}
            {isPrimary && count === 0 && <span className="w-2 h-2 rounded-full bg-destructive" />}
            {isAffected && !isPrimary && count === 0 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
          </button>
        );
      })}
    </ScrollArea>

    <div className="p-3 border-t border-border/50 space-y-2">
      {/* Theme Toggle */}
      <button
        onClick={onToggleTheme}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-foreground transition-colors text-sm"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span>{isDark ? 'Light' : 'Dark'} Mode</span>
      </button>
    </div>
  </div>
);

// Disease Panel Component - Moved outside main component
const DiseasePanel = ({ 
  diseases, 
  selectedDisease, 
  onSelectDisease, 
  currentDisease,
  diseaseSeverity, 
  onChangeSeverity,
  showClinicalPanel,
  onToggleClinicalPanel,
  isMobile = false 
}) => {
  const [expandedCategory, setExpandedCategory] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);

  // Search across all diseases - matches name, ICD10, symptoms, signs, labs
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return diseases.filter(([id, disease]) => {
      // Search in disease name
      if (disease.name?.toLowerCase().includes(query)) return true;
      // Search in ICD10 code
      if (disease.icd10?.toLowerCase().includes(query)) return true;
      // Search in symptoms (safely check if array exists, handle object format)
      const symptoms = disease.clinicalPresentation?.symptoms;
      if (Array.isArray(symptoms) && symptoms.some(s => {
        const symptomText = typeof s === 'string' ? s : s?.name;
        return symptomText?.toLowerCase()?.includes(query);
      })) return true;
      // Search in signs (safely check if array exists, handle object format)
      const signs = disease.clinicalPresentation?.signs;
      if (Array.isArray(signs) && signs.some(s => {
        const signText = typeof s === 'string' ? s : s?.name;
        return signText?.toLowerCase()?.includes(query);
      })) return true;
      // Search in lab findings (safely check if array exists)
      const labs = disease.laboratoryFindings;
      if (Array.isArray(labs) && labs.some(l => l?.name?.toLowerCase()?.includes(query))) return true;
      // Search in definition
      if (disease.definition?.toLowerCase().includes(query)) return true;
      return false;
    }).slice(0, 10); // Limit to 10 results
  }, [searchQuery, diseases]);
  
  // Group diseases by category with better organization
  const groupedDiseases = React.useMemo(() => {
    const groups = {
      cardiac: {
        label: "Cardiac",
        icon: "❤️",
        subcategories: {
          ischemic: { label: "Ischemic/CAD", diseases: [] },
          cardiomyopathy: { label: "Cardiomyopathies", diseases: [] },
          valvular: { label: "Valvular", diseases: [] },
          arrhythmia: { label: "Arrhythmias", diseases: [] },
          heartFailure: { label: "Heart Failure", diseases: [] },
          hypertensive: { label: "Hypertensive", diseases: [] },
          rheumatic: { label: "Rheumatic", diseases: [] },
          pericardial: { label: "Pericardial", diseases: [] },
          other_cardiac: { label: "Other Cardiac", diseases: [] }
        }
      },
      metabolic: {
        label: "Metabolic",
        icon: "🔬",
        subcategories: {
          diabetes: { label: "Diabetes", diseases: [] },
          thyroid: { label: "Thyroid", diseases: [] },
          adrenal: { label: "Adrenal", diseases: [] },
          lipid: { label: "Lipid Disorders", diseases: [] },
          obesity: { label: "Obesity & Metabolic Syndrome", diseases: [] },
          bone: { label: "Bone Metabolism", diseases: [] },
          hepatic: { label: "Hepatic", diseases: [] },
          other_metabolic: { label: "Other", diseases: [] }
        }
      },
      other: {
        label: "Other Systems",
        icon: "🫁",
        subcategories: {
          respiratory: { label: "Respiratory", diseases: [] },
          renal: { label: "Renal", diseases: [] },
          neurological: { label: "Neurological", diseases: [] },
          hepatic: { label: "Hepatic/Liver", diseases: [] },
          vascular: { label: "Vascular", diseases: [] },
          cerebrovascular: { label: "Cerebrovascular", diseases: [] },
          acute: { label: "Acute/Critical", diseases: [] },
          misc: { label: "Other", diseases: [] }
        }
      }
    };

    diseases.forEach(([id, disease]) => {
      const cat = disease.category || 'other';
      
      // Cardiac subcategorization
      if (['cardiac', 'ischemic', 'cardiomyopathy', 'valvular', 'arrhythmia', 
           'heartFailure', 'hypertensive', 'rheumatic', 'pericardial',
           'pulmonary_vascular'].includes(cat)) {
        // Map 'cardiac' category to appropriate subcategory based on name
        let subcat;
        if (cat === 'cardiac') {
          // Try to infer subcategory from disease name
          const name = disease.name?.toLowerCase() || '';
          if (name.includes('cardiomyopathy')) {
            subcat = groups.cardiac.subcategories.cardiomyopathy;
          } else if (name.includes('arrhythmia') || name.includes('fibrillation')) {
            subcat = groups.cardiac.subcategories.arrhythmia;
          } else if (name.includes('hypertens')) {
            subcat = groups.cardiac.subcategories.hypertensive;
          } else if (name.includes('heart failure') || name.includes('hf')) {
            subcat = groups.cardiac.subcategories.heartFailure;
          } else if (name.includes('infarct') || name.includes('ischemic') || name.includes('angina')) {
            subcat = groups.cardiac.subcategories.ischemic;
          } else {
            subcat = groups.cardiac.subcategories.other_cardiac;
          }
        } else {
          subcat = groups.cardiac.subcategories[cat] || groups.cardiac.subcategories.other_cardiac;
        }
        subcat.diseases.push([id, disease]);
      }
      // Metabolic
      else if (['metabolic', 'diabetes', 'hepatic'].includes(cat)) {
        // Smarter subcategorization for metabolic diseases
        const name = disease.name?.toLowerCase() || '';
        const icd10 = disease.icd10?.toUpperCase() || '';
        let subcat;
        
        if (name.includes('diabetes') || name.includes('dka') || name.includes('ketoacidosis') ||
            icd10.startsWith('E10') || icd10.startsWith('E11') || icd10.startsWith('E13')) {
          subcat = groups.metabolic.subcategories.diabetes;
        } else if (name.includes('thyroid') || name.includes('hyperthyroid') || name.includes('hypothyroid') ||
                   name.includes('graves') || name.includes('hashimoto') ||
                   icd10.startsWith('E03') || icd10.startsWith('E05') || icd10.startsWith('E06')) {
          subcat = groups.metabolic.subcategories.thyroid;
        } else if (name.includes('adrenal') || name.includes('cushing') || name.includes('addison') ||
                   name.includes('pheochromocytoma') ||
                   icd10.startsWith('E24') || icd10.startsWith('E27') || icd10.startsWith('D35')) {
          subcat = groups.metabolic.subcategories.adrenal;
        } else if (name.includes('cholesterol') || name.includes('hyperlipid') || name.includes('triglyceride') ||
                   icd10.startsWith('E78')) {
          subcat = groups.metabolic.subcategories.lipid;
        } else if (name.includes('obesity') || name.includes('metabolic syndrome') ||
                   icd10.startsWith('E66') || icd10.startsWith('E88')) {
          subcat = groups.metabolic.subcategories.obesity;
        } else if (name.includes('osteoporosis') || name.includes('gout') ||
                   icd10.startsWith('M81') || icd10.startsWith('M10')) {
          subcat = groups.metabolic.subcategories.bone;
        } else if (cat === 'hepatic') {
          subcat = groups.metabolic.subcategories.hepatic;
        } else {
          subcat = groups.metabolic.subcategories.other_metabolic;
        }
        subcat.diseases.push([id, disease]);
      }
      // Other systems
      else if (cat === 'respiratory') {
        groups.other.subcategories.respiratory.diseases.push([id, disease]);
      }
      else if (cat === 'renal') {
        groups.other.subcategories.renal.diseases.push([id, disease]);
      }
      else if (cat === 'neurological') {
        groups.other.subcategories.neurological.diseases.push([id, disease]);
      }
      else if (cat === 'hepatic') {
        groups.other.subcategories.hepatic.diseases.push([id, disease]);
      }
      else if (cat === 'vascular') {
        groups.other.subcategories.vascular.diseases.push([id, disease]);
      }
      else if (cat === 'cerebrovascular') {
        groups.other.subcategories.cerebrovascular.diseases.push([id, disease]);
      }
      else if (cat === 'acute') {
        groups.other.subcategories.acute.diseases.push([id, disease]);
      }
      else {
        groups.other.subcategories.misc.diseases.push([id, disease]);
      }
    });

    return groups;
  }, [diseases]);

  // Count diseases in each main category
  const getCategoryCount = (group) => {
    return Object.values(group.subcategories).reduce((sum, sub) => sum + sub.diseases.length, 0);
  };

  // Highlight matching text in search results
  const highlightMatch = (text, query) => {
    if (!query.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className={`flex flex-col ${isMobile ? 'h-[calc(100vh-2rem)] pt-10' : 'h-full w-80 border-l border-border/50'}`}>
      {/* Header with Search */}
      <div className="p-3 border-b border-border/50 shrink-0 space-y-2 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Find Condition
          </h3>
          <Badge variant="outline" className="text-[10px]">{diseases.length} diseases</Badge>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, ICD-10, symptom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm bg-accent/10 border-border/50"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent/20 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchQuery && searchResults.length > 0 && (
          <div className="absolute left-3 right-3 top-[calc(100%-4px)] bg-card border border-border rounded-lg shadow-xl z-[100] max-h-64 overflow-y-auto">
            <div className="p-2 text-xs text-muted-foreground border-b border-border/50 sticky top-0 bg-card">
              {searchResults.length} results for &quot;{searchQuery}&quot;
            </div>
            {searchResults.map(([id, disease]) => (
              <button
                key={id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectDisease(id);
                  setSearchQuery('');
                }}
                className="w-full text-left p-3 hover:bg-accent/20 border-b border-border/50 last:border-0 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {highlightMatch(disease.name, searchQuery)}
                  </span>
                  {disease.icd10 && (
                    <Badge variant="outline" className="text-[9px] shrink-0">
                      {disease.icd10}
                    </Badge>
                  )}
                </div>
                {Array.isArray(disease.clinicalPresentation?.symptoms) && 
                 disease.clinicalPresentation.symptoms.slice(0, 2).some(s => {
                   const symptomText = typeof s === 'string' ? s : s?.name;
                   return symptomText?.toLowerCase()?.includes(searchQuery.toLowerCase());
                 }
                ) && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Symptoms: {disease.clinicalPresentation.symptoms.slice(0, 2).map((s, i) => {
                      const symptomText = typeof s === 'string' ? s : s?.name;
                      return (
                        <span key={i}>{i > 0 && ', '}{highlightMatch(symptomText || '', searchQuery)}</span>
                      );
                    })}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-2">
            No conditions found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Category Tabs - Only show when not searching */}
      {!searchQuery && (
        <Tabs defaultValue="cardiac" className="flex-1 flex flex-col min-h-0">
          <div className="mx-3 mt-3 overflow-x-auto scrollbar-hide">
            <TabsList className="bg-accent/10 inline-flex w-auto min-w-full gap-1">
              <TabsTrigger value="cardiac" className="text-[10px] px-2 py-1.5 whitespace-nowrap">
                ❤️ <span className="hidden sm:inline">Cardiac</span>
              </TabsTrigger>
              <TabsTrigger value="respiratory" className="text-[10px] px-2 py-1.5 whitespace-nowrap">
                🫁 <span className="hidden sm:inline">Resp</span>
              </TabsTrigger>
              <TabsTrigger value="metabolic" className="text-[10px] px-2 py-1.5 whitespace-nowrap">
                🔬 <span className="hidden sm:inline">Meta</span>
              </TabsTrigger>
              <TabsTrigger value="neuro" className="text-[10px] px-2 py-1.5 whitespace-nowrap">
                🧠 <span className="hidden sm:inline">Neuro</span>
              </TabsTrigger>
              <TabsTrigger value="other" className="text-[10px] px-2 py-1.5 whitespace-nowrap">
                🔄 <span className="hidden sm:inline">Other</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-3 min-h-0">
            {/* Cardiac Tab Content */}
            <TabsContent value="cardiac" className="mt-0 data-[state=active]:block">
              <div className="space-y-3 pb-4">
                {Object.entries(groupedDiseases.cardiac.subcategories)
                  .filter(([_, subcat]) => subcat.diseases.length > 0)
                  .map(([subcatKey, subcat]) => (
                    <div key={subcatKey} className="space-y-1">
                      <button 
                        onClick={() => setExpandedCategory(expandedCategory === subcatKey ? null : subcatKey)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>{subcat.label}</span>
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {subcat.diseases.length}
                          </Badge>
                          {expandedCategory === subcatKey ? 
                            <ChevronDown className="w-3 h-3" /> : 
                            <ChevronRight className="w-3 h-3" />
                          }
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {(expandedCategory === subcatKey || subcat.diseases.length <= 3) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            {subcat.diseases.map(([id, disease]) => (
                              <button
                                key={id}
                                onClick={() => onSelectDisease(selectedDisease === id ? null : id)}
                                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                                  selectedDisease === id
                                    ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                    : 'bg-accent/5 hover:bg-accent/10 text-muted-foreground'
                                }`}
                                data-testid={`disease-${id}`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm truncate">{disease.name}</span>
                                  {disease.icd10 && (
                                    <Badge variant="outline" className="text-[9px] px-1 shrink-0">
                                      {disease.icd10}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px] opacity-60">
                                  <span>Affects: {disease.affectedOrgans?.length || 1} organ{disease.affectedOrgans?.length !== 1 ? 's' : ''}</span>
                                  {disease.isFromCardiacDB && (
                                    <Badge variant="secondary" className="text-[8px] px-1 bg-purple-500/10 text-purple-400">
                                      ICD-10
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            </TabsContent>

            {/* Respiratory Tab Content with Lung Cancer Feature */}
            <TabsContent value="respiratory" className="mt-0 data-[state=active]:block">
              <div className="space-y-3 pb-4">
                {/* Lung Cancer Special Section */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30">
                  <button 
                    onClick={() => onSelectDisease('lung_cancer_module')}
                    className={`w-full text-left ${selectedDisease === 'lung_cancer_module' ? 'opacity-100' : 'opacity-90'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🎯</span>
                      <span className="font-bold text-red-400">Lung Cancer Module</span>
                      <Badge className="bg-red-500/20 text-red-300 text-[9px]">NEW</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      TNM 8th Edition • NCCN 2024-2025 • MDT Decision Support
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-[9px]">Staging</Badge>
                      <Badge variant="outline" className="text-[9px]">Immunotherapy</Badge>
                      <Badge variant="outline" className="text-[9px]">Biomarkers</Badge>
                      <Badge variant="outline" className="text-[9px]">Surgery</Badge>
                    </div>
                  </button>
                </div>

                {/* Other Respiratory Diseases */}
                {Object.entries(groupedDiseases.other.subcategories)
                  .filter(([key, subcat]) => key === 'respiratory' && subcat.diseases.length > 0)
                  .map(([subcatKey, subcat]) => (
                    <div key={subcatKey} className="space-y-1">
                      <button 
                        onClick={() => setExpandedCategory(expandedCategory === 'resp_other' ? null : 'resp_other')}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>Other Respiratory Conditions</span>
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {subcat.diseases.length}
                          </Badge>
                          {expandedCategory === 'resp_other' ? 
                            <ChevronDown className="w-3 h-3" /> : 
                            <ChevronRight className="w-3 h-3" />
                          }
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {expandedCategory === 'resp_other' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            {subcat.diseases.map(([id, disease]) => (
                              <button
                                key={id}
                                onClick={() => onSelectDisease(selectedDisease === id ? null : id)}
                                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                                  selectedDisease === id
                                    ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                    : 'bg-accent/5 hover:bg-accent/10 text-muted-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm truncate">{disease.name}</span>
                                  {disease.icd10 && (
                                    <Badge variant="outline" className="text-[9px] px-1 shrink-0">
                                      {disease.icd10}
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            </TabsContent>

            {/* Metabolic Tab Content */}
            <TabsContent value="metabolic" className="mt-0 data-[state=active]:block">
              <div className="space-y-3 pb-4">
                {Object.entries(groupedDiseases.metabolic.subcategories)
                  .filter(([_, subcat]) => subcat.diseases.length > 0)
                  .map(([subcatKey, subcat]) => (
                    <div key={subcatKey} className="space-y-1">
                      <button 
                        onClick={() => setExpandedCategory(expandedCategory === subcatKey ? null : subcatKey)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>{subcat.label}</span>
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {subcat.diseases.length}
                          </Badge>
                          {expandedCategory === subcatKey ? 
                            <ChevronDown className="w-3 h-3" /> : 
                            <ChevronRight className="w-3 h-3" />
                          }
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {(expandedCategory === subcatKey || subcat.diseases.length <= 3) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            {subcat.diseases.map(([id, disease]) => (
                              <button
                                key={id}
                                onClick={() => onSelectDisease(selectedDisease === id ? null : id)}
                                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                                  selectedDisease === id
                                    ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                    : 'bg-accent/5 hover:bg-accent/10 text-muted-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm truncate">{disease.name}</span>
                                  {disease.icd10 && (
                                    <Badge variant="outline" className="text-[9px] px-1 shrink-0">
                                      {disease.icd10}
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            </TabsContent>

            {/* Neuro/Brain Tab Content */}
            <TabsContent value="neuro" className="mt-0 data-[state=active]:block">
              <div className="space-y-3 pb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🧠</span>
                    <span className="font-bold text-purple-400">Neurological Conditions</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Brain, nervous system, and cerebrovascular conditions
                  </p>
                </div>
                {Object.entries(groupedDiseases.other.subcategories)
                  .filter(([key, _]) => key === 'cerebrovascular')
                  .map(([subcatKey, subcat]) => (
                    <div key={subcatKey} className="space-y-1">
                      <button 
                        onClick={() => setExpandedCategory(expandedCategory === subcatKey ? null : subcatKey)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>{subcat.label}</span>
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {subcat.diseases.length}
                          </Badge>
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {subcat.diseases.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            {subcat.diseases.map(([id, disease]) => (
                              <button
                                key={id}
                                onClick={() => onSelectDisease(selectedDisease === id ? null : id)}
                                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                                  selectedDisease === id
                                    ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                    : 'bg-accent/5 hover:bg-accent/10 text-muted-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm truncate">{disease.name}</span>
                                  {disease.icd10 && (
                                    <Badge variant="outline" className="text-[9px] px-1 shrink-0">
                                      {disease.icd10}
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            </TabsContent>

            {/* Other Systems Tab Content */}
            <TabsContent value="other" className="mt-0 data-[state=active]:block">
              <div className="space-y-3 pb-4">
                {Object.entries(groupedDiseases.other.subcategories)
                  .filter(([key, subcat]) => !['respiratory', 'cerebrovascular'].includes(key) && subcat.diseases.length > 0)
                  .map(([subcatKey, subcat]) => (
                    <div key={subcatKey} className="space-y-1">
                      <button 
                        onClick={() => setExpandedCategory(expandedCategory === subcatKey ? null : subcatKey)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>{subcat.label}</span>
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {subcat.diseases.length}
                          </Badge>
                          {expandedCategory === subcatKey ? 
                            <ChevronDown className="w-3 h-3" /> : 
                            <ChevronRight className="w-3 h-3" />
                          }
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {(expandedCategory === subcatKey || subcat.diseases.length <= 3) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            {subcat.diseases.map(([id, disease]) => (
                              <button
                                key={id}
                                onClick={() => onSelectDisease(selectedDisease === id ? null : id)}
                                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                                  selectedDisease === id
                                    ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                    : 'bg-accent/5 hover:bg-accent/10 text-muted-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm truncate">{disease.name}</span>
                                  {disease.icd10 && (
                                    <Badge variant="outline" className="text-[9px] px-1 shrink-0">
                                      {disease.icd10}
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      )}

      {/* Severity Slider */}
      {selectedDisease !== null && selectedDisease !== undefined && currentDisease && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Severity</span>
            <span className="text-xs font-mono">
              {currentDisease?.severity?.[
                diseaseSeverity < 0.33 ? 'mild' : diseaseSeverity < 0.66 ? 'moderate' : 'severe'
              ]?.description || `${(diseaseSeverity * 100).toFixed(0)}%`}
            </span>
          </div>
          <Slider
            value={[diseaseSeverity]}
            onValueChange={([v]) => onChangeSeverity(v)}
            min={0.1}
            max={1.0}
            step={0.1}
            className="w-full"
            data-testid="severity-slider"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Severe</span>
          </div>

          <DiseaseProgressionTimeline disease={currentDisease} currentSeverity={diseaseSeverity} />
        </div>
      )}

    {/* Clinical Panel Toggle */}
    {currentDisease && (
      <div className="p-4 border-t border-border/50">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onToggleClinicalPanel}
        >
          <Stethoscope className="w-4 h-4 mr-2" />
          {showClinicalPanel ? 'Hide' : 'Show'} Clinical Panel
        </Button>
      </div>
    )}

    {/* Clinical Insights */}
    {showClinicalPanel && currentDisease && (
      <div className="p-4 border-t border-border/50 max-h-96 overflow-y-auto">
        <ClinicalInsightsPanel 
          disease={currentDisease} 
          severity={diseaseSeverity}
        />
      </div>
    )}

    {/* Disease Summary */}
    {currentDisease && (
      <div className="p-4 border-t border-border/50 bg-destructive/5">
        <h4 className="text-xs font-semibold text-destructive mb-2">Active Condition</h4>
        <p className="text-sm font-medium">{currentDisease.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{currentDisease.description}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {currentDisease.affectedOrgans?.map(org => (
            <Badge key={org} variant="outline" className="text-[10px]">
              {ORGAN_MODELS[org]?.icon} {ORGAN_MODELS[org]?.name}
            </Badge>
          ))}
        </div>
      </div>
    )}
  </div>
  );
};

// Main Dashboard Component
const DashboardMultiScale = () => {
  const { toggleTheme, isDark } = useTheme();
  const tutorial = useTutorial('dashboard');
  
  const [selectedOrgan, setSelectedOrgan] = useState('heart');
  const [selectedScale, setSelectedScale] = useState('geometry');
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [diseaseSeverity, setDiseaseSeverity] = useState(0.5);
  const [expandedEquations, setExpandedEquations] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showClinicalPanel, setShowClinicalPanel] = useState(false);
  const [paramFilterOrgan, setParamFilterOrgan] = useState(null); // Filter affected params by organ
  const [showAllParams, setShowAllParams] = useState(false); // Expand to show all params

  const organs = useMemo(() => Object.entries(ORGAN_MODELS), []);
  const diseases = useMemo(() => Object.entries(MERGED_DISEASE_MODELS), []);
  
  const currentOrgan = ORGAN_MODELS[selectedOrgan];
  const currentScale = currentOrgan?.[selectedScale];
  const currentDisease = selectedDisease ? MERGED_DISEASE_MODELS[selectedDisease] : null;

  // Calculate affected parameters count for each organ
  const getAffectedCounts = useCallback(() => {
    if (!currentDisease?.modifications) return {};
    
    const counts = {};
    const mods = currentDisease.modifications;
    
    Object.entries(mods).forEach(([organId, organMods]) => {
      let count = 0;
      Object.entries(organMods).forEach(([scaleId, scaleMods]) => {
        count += Object.keys(scaleMods).length;
      });
      counts[organId] = count;
    });
    
    return counts;
  }, [currentDisease]);

  const affectedCounts = useMemo(() => getAffectedCounts(), [getAffectedCounts]);

  // Calculate total affected count for an organ
  const getOrganAffectedCount = useCallback((organId) => {
    return affectedCounts[organId] || 0;
  }, [affectedCounts]);

  // Get all affected organs with their counts for summary tabs
  const affectedOrgansSummary = useMemo(() => {
    if (!currentDisease) return [];
    
    const summary = [];
    Object.entries(ORGAN_MODELS).forEach(([id, organ]) => {
      const count = affectedCounts[id] || 0;
      const isPrimary = currentDisease?.primaryOrgan === id;
      const isAffected = currentDisease?.affectedOrgans?.includes(id);
      
      if (count > 0 || isAffected) {
        summary.push({
          id,
          name: organ.name,
          icon: organ.icon,
          count,
          isPrimary,
          isAffected
        });
      }
    });
    
    // Sort: primary first, then by count
    return summary.sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return b.count - a.count;
    });
  }, [currentDisease, affectedCounts]);

  // Get ALL modified parameters across ALL organs - for quick summary view
  const allModifiedParameters = useMemo(() => {
    if (!currentDisease?.modifications) return [];
    
    const params = [];
    Object.entries(currentDisease.modifications).forEach(([organId, organMods]) => {
      const organ = ORGAN_MODELS[organId];
      if (!organ) return;
      
      Object.entries(organMods).forEach(([scaleId, scaleMods]) => {
        const scaleData = organ[scaleId];
        if (!scaleData?.parameters) return;
        
        Object.entries(scaleMods).forEach(([paramId, mod]) => {
          const paramDef = scaleData.parameters.find(p => p.id === paramId);
          if (!paramDef) return;
          
          const baseValue = paramDef.value;
          let newValue = baseValue;
          const multiplier = mod.multiplier || mod.factor;
          if (multiplier) {
            const factor = 1 + (multiplier - 1) * diseaseSeverity;
            newValue = baseValue * factor;
          }
          if (mod.absolute) {
            newValue = mod.absolute;
          }
          
          const delta = ((newValue - baseValue) / baseValue * 100);
          
          params.push({
            id: paramId,
            name: paramDef.name,
            organId,
            organName: organ.name,
            organIcon: organ.icon,
            scaleId,
            baseValue,
            newValue,
            unit: paramDef.unit || '',
            delta,
            direction: delta > 0 ? 'increase' : 'decrease',
            note: mod.note,
            isPrimary: currentDisease.primaryOrgan === organId
          });
        });
      });
    });
    
    // Sort: primary organ first, then by absolute delta
    return params.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return Math.abs(b.delta) - Math.abs(a.delta);
    });
  }, [currentDisease, diseaseSeverity]);

  // Filtered parameters based on organ filter
  const filteredParameters = useMemo(() => {
    if (!paramFilterOrgan) return allModifiedParameters;
    return allModifiedParameters.filter(p => p.organId === paramFilterOrgan);
  }, [allModifiedParameters, paramFilterOrgan]);

  // Calculate modified parameters based on disease
  const getModifiedValue = useCallback((organId, scaleId, paramId, baseValue) => {
    if (!currentDisease) return { value: baseValue, modified: false };
    
    const mods = currentDisease.modifications?.[organId]?.[scaleId]?.[paramId];
    if (!mods) return { value: baseValue, modified: false };
    
    let newValue = baseValue;
    // Support both 'multiplier' and 'factor' for compatibility
    const multiplier = mods.multiplier || mods.factor;
    if (multiplier) {
      const factor = 1 + (multiplier - 1) * diseaseSeverity;
      newValue = baseValue * factor;
    }
    if (mods.absolute) {
      newValue = mods.absolute;
    }
    
    return { 
      value: newValue, 
      modified: true, 
      note: mods.note,
      delta: ((newValue - baseValue) / baseValue * 100).toFixed(0)
    };
  }, [currentDisease, diseaseSeverity]);

  const toggleEquation = useCallback((eqId) => {
    setExpandedEquations(prev => ({ ...prev, [eqId]: !prev[eqId] }));
  }, []);

  const resetDisease = useCallback(() => {
    setSelectedDisease(null);
    setDiseaseSeverity(0.5);
  }, []);

  // Handle disease selection with auto-navigation to primary organ
  const handleDiseaseSelect = useCallback((diseaseId) => {
    setSelectedDisease(diseaseId);
    setParamFilterOrgan(null); // Reset filter when disease changes
    setShowAllParams(false); // Collapse params when disease changes
    
    // Auto-navigate to primary affected organ
    if (diseaseId) {
      const disease = MERGED_DISEASE_MODELS[diseaseId];
      if (disease?.primaryOrgan && ORGAN_MODELS[disease.primaryOrgan]) {
        setSelectedOrgan(disease.primaryOrgan);
      }
    }
  }, []);

  const handleOrganSelect = useCallback((organId) => {
    setSelectedOrgan(organId);
    setMobileMenuOpen(false);
  }, []);

  const handleToggleClinicalPanel = useCallback(() => {
    setShowClinicalPanel(prev => !prev);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col bg-background text-foreground`}>
      {/* Global Feature Navigation */}
      <FeatureNav />
      
      {/* Page Title Header - Like other pages */}
      <div className="hidden lg:block container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-serif text-3xl font-bold">Φ</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              PhiCor Engine
            </h1>
            <p className="text-sm text-muted-foreground">
              Multi-scale organ models & physiology database
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-40 h-14 bg-background/95 backdrop-blur border-b border-border/50 flex items-center justify-between px-4">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <OrganSidebar 
              organs={organs}
              selectedOrgan={selectedOrgan}
              onSelectOrgan={handleOrganSelect}
              currentDisease={currentDisease}
              affectedCounts={affectedCounts}
              onToggleTheme={toggleTheme}
              isDark={isDark}
              isMobile
            />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <span className="text-xl">{currentOrgan?.icon}</span>
          <span className="font-semibold text-sm">{currentOrgan?.name}</span>
          {selectedDisease && currentDisease && (
            <Badge variant="destructive" className="text-[10px]">
              {currentDisease.name.split(' ')[0]}...
            </Badge>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Stethoscope className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0 flex flex-col">
            <DiseasePanel 
              diseases={diseases}
              selectedDisease={selectedDisease}
              onSelectDisease={handleDiseaseSelect}
              currentDisease={currentDisease}
              diseaseSeverity={diseaseSeverity}
              onChangeSeverity={setDiseaseSeverity}
              showClinicalPanel={showClinicalPanel}
              onToggleClinicalPanel={handleToggleClinicalPanel}
              isMobile
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex bg-card/30">
        <OrganSidebar 
          organs={organs}
          selectedOrgan={selectedOrgan}
          onSelectOrgan={handleOrganSelect}
          currentDisease={currentDisease}
          affectedCounts={affectedCounts}
          onToggleTheme={toggleTheme}
          isDark={isDark}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pt-28 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-14 border-b border-border/50 px-6 items-center justify-between bg-card/30">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="text-2xl">{currentOrgan?.icon}</span>
              {currentOrgan?.name}
              {selectedDisease !== null && selectedDisease !== undefined && currentDisease && (
                <Badge variant="destructive" className="ml-2" data-testid="disease-badge">
                  {currentDisease.name}
                </Badge>
              )}
            </h2>
            <p className="text-xs text-muted-foreground">
              Complete mathematical model at multiple scales
            </p>
          </div>
          {selectedDisease !== null && selectedDisease !== undefined && currentDisease && (
            <Button variant="outline" size="sm" onClick={resetDisease} className="border-border/50">
              <RotateCcw className="w-3 h-3 mr-2" />
              Reset Model
            </Button>
          )}
        </header>

        {/* Affected Organs Summary Bar - Shows when disease is selected */}
        {currentDisease && affectedOrgansSummary.length > 0 && (
          <div className="border-b border-border/50 px-3 lg:px-6 py-2 bg-gradient-to-r from-destructive/5 to-orange-500/5">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider shrink-0">Affected:</span>
              {/* "All" button to show all organs */}
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setParamFilterOrgan(null);
                  setShowAllParams(false);
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                  paramFilterOrgan === null
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-muted/30 text-muted-foreground border border-muted/30 hover:bg-muted/50'
                }`}
              >
                <span>All</span>
                <span className="min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-primary/20">
                  {allModifiedParameters.length}
                </span>
              </motion.button>
              {affectedOrgansSummary.map((organ) => (
                <motion.button
                  key={organ.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setParamFilterOrgan(organ.id);
                    setShowAllParams(false);
                    // Don't change selectedOrgan - let filter work independently
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                    paramFilterOrgan === organ.id
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : organ.isPrimary
                      ? 'bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30'
                      : 'bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20'
                  }`}
                >
                  <span>{organ.icon}</span>
                  <span className="hidden sm:inline">{organ.name}</span>
                  {organ.count > 0 && (
                    <motion.span
                      key={organ.count}
                      initial={{ scale: 1.5 }}
                      animate={{ scale: 1 }}
                      className={`min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        paramFilterOrgan === organ.id
                          ? 'bg-primary text-primary-foreground'
                          : organ.isPrimary 
                          ? 'bg-destructive text-destructive-foreground' 
                          : 'bg-orange-500 text-white'
                      }`}
                    >
                      {organ.count}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ALL AFFECTED PARAMETERS - Quick Summary Panel */}
        {currentDisease && allModifiedParameters.length > 0 && (
          <div className="border-b border-border/50 px-3 lg:px-6 py-3 bg-gradient-to-r from-destructive/5 via-orange-500/5 to-amber-500/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-semibold text-foreground">
                  {paramFilterOrgan 
                    ? `${ORGAN_MODELS[paramFilterOrgan]?.name || paramFilterOrgan} Parameters` 
                    : 'All Affected Parameters'}
                </span>
                <Badge variant="destructive" className="text-[10px]">
                  {filteredParameters.length} changes
                </Badge>
              </div>
              {/* Expand/Collapse button */}
              {filteredParameters.length > 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllParams(!showAllParams);
                  }}
                  className="text-xs h-7"
                >
                  {showAllParams ? (
                    <>Show Less <ChevronUp className="w-3 h-3 ml-1" /></>
                  ) : (
                    <>Show All <ChevronDown className="w-3 h-3 ml-1" /></>
                  )}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {filteredParameters.slice(0, showAllParams ? 100 : 12).map((param, idx) => (
                <motion.button
                  key={`${param.organId}-${param.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                  onClick={() => {
                    setSelectedOrgan(param.organId);
                    setSelectedScale(param.scaleId);
                  }}
                  className={`p-2 rounded-lg border text-left transition-all hover:scale-[1.02] hover:shadow-md ${
                    selectedOrgan === param.organId && selectedScale === param.scaleId
                      ? 'ring-2 ring-primary bg-primary/10 border-primary/50'
                      : param.isPrimary 
                      ? 'bg-destructive/10 border-destructive/30 hover:border-destructive/50' 
                      : 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">{param.organIcon}</span>
                    <span className={`text-[10px] truncate ${param.isPrimary ? 'text-destructive' : 'text-orange-500'}`}>
                      {param.organName}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-foreground truncate" title={param.name}>
                    {param.name}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground line-through">
                      {typeof param.baseValue === 'number' ? param.baseValue.toFixed(1) : param.baseValue}
                    </span>
                    <div className={`flex items-center gap-0.5 text-[10px] font-bold ${
                      param.direction === 'increase' ? 'text-red-500' : 'text-blue-500'
                    }`}>
                      {param.direction === 'increase' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{typeof param.newValue === 'number' ? param.newValue.toFixed(1) : param.newValue}</span>
                    </div>
                  </div>
                  <div className={`text-[9px] mt-0.5 ${param.direction === 'increase' ? 'text-red-400' : 'text-blue-400'}`}>
                    {param.delta > 0 ? '+' : ''}{param.delta.toFixed(0)}% {param.unit}
                  </div>
                </motion.button>
              ))}
            </div>
            {!showAllParams && filteredParameters.length > 12 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllParams(true);
                }}
                className="w-full text-center mt-2 py-1 text-xs text-primary hover:text-primary/80 hover:underline cursor-pointer"
              >
                +{filteredParameters.length - 12} more parameters — Click to expand
              </button>
            )}
          </div>
        )}

        {/* Scale Tabs */}
        <div className="border-b border-border/50 px-3 lg:px-6 bg-card/20">
          <div className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
            {SCALE_LEVELS.map((scale) => {
              const hasData = currentOrgan?.[scale.id];
              const hasChanges = currentDisease?.modifications?.[selectedOrgan]?.[scale.id];
              
              return (
                <button
                  key={scale.id}
                  onClick={() => hasData && setSelectedScale(scale.id)}
                  disabled={!hasData}
                  className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm whitespace-nowrap transition-all ${
                    selectedScale === scale.id
                      ? 'bg-primary/20 text-primary'
                      : hasData
                      ? hasChanges
                        ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                      : 'text-muted-foreground/30 cursor-not-allowed'
                  }`}
                  data-testid={`scale-${scale.id}`}
                >
                  <span>{scale.icon}</span>
                  <span className="hidden sm:inline">{scale.fullName}</span>
                  <span className="sm:hidden">{scale.name}</span>
                  {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-destructive" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Parameters & Equations Panel */}
          <div className="flex-1 p-3 md:p-6 overflow-auto">
            {/* Show Lung Cancer Module if selected */}
            {selectedDisease === 'lung_cancer_module' ? (
              <LungCancerModule />
            ) : currentScale ? (
              <div className="space-y-6 max-w-5xl">
                {/* Mobile Reset Button */}
                {selectedDisease !== null && currentDisease && (
                  <div className="lg:hidden">
                    <Button variant="outline" size="sm" onClick={resetDisease} className="w-full">
                      <RotateCcw className="w-3 h-3 mr-2" />
                      Reset Model
                    </Button>
                  </div>
                )}

                {/* Parameters Section */}
                {currentScale.parameters && currentScale.parameters.length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Parameters
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {currentScale.parameters.map((param) => {
                        const mod = getModifiedValue(selectedOrgan, selectedScale, param.id, param.value);
                        
                        return (
                          <motion.div
                            key={param.id}
                            initial={mod.modified ? { scale: 1 } : false}
                            animate={mod.modified ? { 
                              boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0)', '0 0 20px 4px rgba(239, 68, 68, 0.3)', '0 0 0 0 rgba(239, 68, 68, 0)']
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            className={`p-3 md:p-4 rounded-lg border transition-all relative overflow-hidden ${
                              mod.modified
                                ? 'bg-gradient-to-br from-destructive/10 to-orange-500/10 border-destructive/40 ring-1 ring-destructive/20'
                                : 'bg-card/50 border-border/50'
                            }`}
                            data-testid={`param-${param.id}`}
                          >
                            {/* Abnormal indicator stripe */}
                            {mod.modified && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-destructive to-orange-500" />
                            )}
                            
                            <div className="flex items-start justify-between mb-2 gap-2">
                              <span className={`text-xs md:text-sm leading-tight ${mod.modified ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                {param.name}
                              </span>
                              <div className="flex items-center gap-1">
                                {mod.modified && (
                                  <Badge variant="destructive" className="text-[10px] shrink-0">
                                    <AlertTriangle className="w-2 h-2 mr-1" />
                                    Abnormal
                                  </Badge>
                                )}
                                <Badge variant={param.evidence === 'novel' ? 'secondary' : 'outline'} className="text-[10px] shrink-0">
                                  {param.evidence === 'novel' ? (
                                    <><Lightbulb className="w-2 h-2 mr-1" />Novel</>
                                  ) : (
                                    <><BookOpen className="w-2 h-2 mr-1" />Est.</>
                                  )}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-baseline gap-2 flex-wrap">
                              {mod.modified && (
                                <span className="text-base md:text-lg font-mono text-muted-foreground/60 line-through">
                                  {param.value}
                                </span>
                              )}
                              <motion.span 
                                key={mod.value}
                                initial={mod.modified ? { scale: 1.2, color: '#ef4444' } : false}
                                animate={{ scale: 1 }}
                                className={`text-xl md:text-2xl font-mono font-bold ${mod.modified ? 'text-destructive' : ''}`}
                              >
                                {mod.value.toFixed(param.value % 1 === 0 ? 0 : 1)}
                              </motion.span>
                              <span className="text-xs md:text-sm text-muted-foreground">{param.unit}</span>
                              {mod.modified && (
                                <motion.span 
                                  initial={{ scale: 1.3 }}
                                  animate={{ scale: 1 }}
                                  className={`text-xs md:text-sm font-bold px-1.5 py-0.5 rounded ${
                                    parseFloat(mod.delta) > 0 
                                      ? 'bg-destructive/20 text-destructive' 
                                      : 'bg-green-500/20 text-green-500'
                                  }`}
                                >
                                  {parseFloat(mod.delta) > 0 ? '↑' : '↓'}{Math.abs(parseFloat(mod.delta))}%
                                </motion.span>
                              )}
                            </div>
                            
                            {mod.note && (
                              <p className="text-[10px] md:text-xs text-destructive mt-2 flex items-center gap-1 bg-destructive/10 rounded px-2 py-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>{mod.note}</span>
                              </p>
                            )}
                            
                            <div className="mt-2 text-[10px] text-muted-foreground">
                              Normal: {param.range[0]} - {param.range[1]} {param.unit}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Equations Section */}
                {currentScale.equations && currentScale.equations.length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Mathematical Equations
                    </h3>
                    <div className="space-y-3">
                      {currentScale.equations.map((eq) => (
                        <EquationDerivation
                          key={eq.id}
                          equation={eq}
                          expanded={expandedEquations[eq.id]}
                          onToggle={() => toggleEquation(eq.id)}
                          currentParams={Object.fromEntries(
                            currentScale.parameters.map(p => [p.id, p.value])
                          )}
                          diseaseSeverity={diseaseSeverity}
                          isDiseasedState={!!currentDisease}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Disease-specific novel equations */}
                {currentDisease?.novelEquations && currentDisease.affectedOrgans?.includes(selectedOrgan) && (
                  <section>
                    <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Disease-Specific Equations ({currentDisease.name})
                    </h3>
                    <div className="space-y-3">
                      {currentDisease.novelEquations.map((eq) => (
                        <div
                          key={eq.id}
                          className="rounded-xl border border-destructive/20 bg-destructive/5 overflow-hidden"
                        >
                          <div className="p-3 md:p-4">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 flex-wrap">
                              <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                                <Lightbulb className="w-3 h-3 mr-1" />
                                Disease Model
                              </Badge>
                              <div>
                                <h4 className="font-medium text-sm">{eq.name}</h4>
                                <p className="text-xs text-muted-foreground">{eq.description}</p>
                              </div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3 md:p-6 overflow-x-auto">
                              <BlockMath math={eq.latex} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Biochemistry Section for Cellular Scale */}
                {selectedScale === 'cellular' && (
                  <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Microscope className="w-4 h-4" />
                      Biochemical Pathways
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(BIOCHEMISTRY).slice(0, 4).map(([key, pathway]) => (
                        <div key={key} className="p-4 rounded-lg border border-border/50 bg-card/30">
                          <h4 className="font-medium text-sm mb-1">{pathway.name}</h4>
                          <p className="text-xs text-muted-foreground mb-3">{pathway.description}</p>
                          {pathway.glycolysis && (
                            <div className="text-xs">
                              <span className="text-primary">{pathway.glycolysis.steps?.length || 10} steps</span>
                              <span className="mx-2 text-muted-foreground">•</span>
                              <span className="text-green-500">Net: {pathway.glycolysis.energyYield?.net_atp || 2} ATP</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Clinical Evidence Section - Moved to bottom, expanded by default */}
                {currentDisease && (
                  <section className="mt-6 pt-6 border-t border-border/50">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Clinical Evidence
                    </h3>
                    <ClinicalFindingsPanel
                      disease={currentDisease}
                      isExpanded={true}
                      onToggle={handleToggleClinicalPanel}
                      alwaysExpanded={true}
                    />
                  </section>
                )}

                {/* Evidence-Based Treatment Guidelines Panel */}
                {currentDisease && selectedDisease && (
                  <section className="mt-6">
                    <TreatmentGuidelinesPanel diseaseId={selectedDisease} />
                  </section>
                )}

                {/* Backend Disease Database - Clinical Evidence Panel */}
                {currentDisease && selectedDisease && (
                  <section className="mt-4">
                    <DiseaseDetailPanel 
                      diseaseId={selectedDisease} 
                      diseaseName={currentDisease?.name} 
                    />
                  </section>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Select a scale level to view parameters and equations</p>
              </div>
            )}
          </div>

          {/* Desktop Right Sidebar */}
          <aside className="hidden lg:flex bg-card/20">
            <DiseasePanel 
              diseases={diseases}
              selectedDisease={selectedDisease}
              onSelectDisease={handleDiseaseSelect}
              currentDisease={currentDisease}
              diseaseSeverity={diseaseSeverity}
              onChangeSeverity={setDiseaseSeverity}
              showClinicalPanel={showClinicalPanel}
              onToggleClinicalPanel={handleToggleClinicalPanel}
            />
          </aside>
        </div>
      </main>
      </div>
    </div>
  );
};

export default DashboardMultiScale;
