import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, UserPlus, Save, Trash2, Check, ChevronDown, ChevronUp,
  Cigarette, Wine, AlertCircle, History, Pill, Heart, Edit2,
  UserX, Users, RefreshCw, Copy, X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

// Default "Null Patient" - baseline patient with no modifiers
const NULL_PATIENT = {
  id: 'null',
  name: 'Baseline (No Patient)',
  isNull: true,
  demographics: {
    age: null,
    sex: null,
    height: null,
    weight: null,
    bmi: null
  },
  riskFactors: {
    smoking: 'never',
    smokingPackYears: 0,
    alcohol: 'none',
    alcoholDrinksPerWeek: 0,
    exercise: 'moderate',
    diet: 'average'
  },
  familyHistory: {
    cad: false,
    diabetes: false,
    stroke: false,
    cancer: false,
    hypertension: false,
    arrhythmia: false,
    suddenDeath: false
  },
  comorbidities: [],
  medications: [],
  allergies: [],
  modifiers: {} // No parameter modifiers
};

// Calculate parameter modifiers based on patient characteristics
const calculatePatientModifiers = (patient) => {
  if (!patient || patient.isNull) return {};
  
  const modifiers = {};
  const { demographics, riskFactors, familyHistory, comorbidities } = patient;
  
  // Age-based modifiers
  if (demographics?.age) {
    const age = parseInt(demographics.age);
    if (age >= 65) {
      modifiers.age_risk = {
        cardiac_risk: 1.2 + (age - 65) * 0.02,
        renal_function: 0.95 - (age - 65) * 0.01,
        metabolic_rate: 0.95 - (age - 65) * 0.005
      };
    }
    if (age >= 75) {
      modifiers.age_risk = {
        ...modifiers.age_risk,
        stroke_risk: 1.5,
        bleeding_risk: 1.3
      };
    }
  }
  
  // Sex-based modifiers
  if (demographics?.sex === 'female') {
    modifiers.sex_factors = {
      hemoglobin_base: 0.9, // Lower baseline hemoglobin
      qrs_duration_base: 0.95,
      cardiac_output_base: 0.92
    };
  }
  
  // BMI-based modifiers
  if (demographics?.bmi) {
    const bmi = parseFloat(demographics.bmi);
    if (bmi >= 30) {
      modifiers.obesity = {
        insulin_resistance: 1.3 + (bmi - 30) * 0.05,
        cardiac_strain: 1.1 + (bmi - 30) * 0.02,
        inflammation: 1.2
      };
    }
    if (bmi >= 35) {
      modifiers.obesity = {
        ...modifiers.obesity,
        sleep_apnea_risk: 2.0,
        hypertension_risk: 1.5
      };
    }
  }
  
  // Smoking modifiers
  if (riskFactors?.smoking === 'current') {
    const packYears = riskFactors.smokingPackYears || 10;
    modifiers.smoking = {
      lung_function: 0.85 - packYears * 0.01,
      vascular_damage: 1.3 + packYears * 0.02,
      cancer_risk: 1.5 + packYears * 0.1,
      copd_risk: 1.4 + packYears * 0.05
    };
  } else if (riskFactors?.smoking === 'former') {
    const packYears = riskFactors.smokingPackYears || 10;
    modifiers.smoking = {
      lung_function: 0.9 - packYears * 0.005,
      vascular_damage: 1.1,
      cancer_risk: 1.2 + packYears * 0.03
    };
  }
  
  // Alcohol modifiers
  if (riskFactors?.alcohol === 'heavy') {
    modifiers.alcohol = {
      liver_function: 0.7,
      bleeding_risk: 1.3,
      cardiomyopathy_risk: 1.5,
      hepatic_enzyme: 1.5
    };
  } else if (riskFactors?.alcohol === 'moderate') {
    modifiers.alcohol = {
      hdl_effect: 1.1, // Slight positive effect on HDL
      liver_function: 0.95
    };
  }
  
  // Family history modifiers
  if (familyHistory?.cad) {
    modifiers.family_cardiac = { cad_risk: 1.5, mi_risk: 1.4 };
  }
  if (familyHistory?.diabetes) {
    modifiers.family_metabolic = { diabetes_risk: 2.0, metabolic_syndrome: 1.3 };
  }
  if (familyHistory?.stroke) {
    modifiers.family_cerebral = { stroke_risk: 1.4 };
  }
  if (familyHistory?.suddenDeath) {
    modifiers.family_arrhythmia = { arrhythmia_risk: 1.8, scd_risk: 2.0 };
  }
  
  // Comorbidity modifiers
  if (comorbidities?.includes('diabetes')) {
    modifiers.diabetes = {
      vascular_disease: 1.5,
      renal_risk: 1.3,
      neuropathy: 1.2,
      wound_healing: 0.8
    };
  }
  if (comorbidities?.includes('hypertension')) {
    modifiers.hypertension = {
      stroke_risk: 1.6,
      heart_failure: 1.4,
      renal_disease: 1.3,
      lvh_risk: 1.5
    };
  }
  if (comorbidities?.includes('ckd')) {
    modifiers.ckd = {
      drug_clearance: 0.6,
      anemia_risk: 1.5,
      bleeding_risk: 1.2,
      cardiovascular_risk: 1.8
    };
  }
  
  return modifiers;
};

// Patient Profile Card Component
const PatientCard = ({ patient, isActive, onSelect, onEdit, onDelete, compact = false }) => {
  const isNull = patient.isNull;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        relative p-2 rounded-lg border cursor-pointer transition-all
        ${isActive 
          ? 'border-primary bg-primary/10 ring-2 ring-primary/50' 
          : 'border-border/50 bg-card/50 hover:border-border hover:bg-card/80'
        }
        ${compact ? 'p-1.5' : 'p-2'}
      `}
      onClick={() => onSelect(patient)}
    >
      <div className="flex items-center gap-2">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
          ${isNull 
            ? 'bg-muted text-muted-foreground' 
            : 'bg-gradient-to-br from-primary/80 to-primary text-primary-foreground'
          }
        `}>
          {isNull ? <UserX className="w-4 h-4" /> : patient.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'}`}>
            {patient.name}
          </div>
          {!isNull && patient.demographics && (
            <div className="text-[10px] text-muted-foreground truncate">
              {patient.demographics.age ? `${patient.demographics.age}y` : ''}
              {patient.demographics.sex ? ` ${patient.demographics.sex === 'male' ? 'M' : 'F'}` : ''}
              {patient.demographics.bmi ? ` BMI ${patient.demographics.bmi}` : ''}
            </div>
          )}
          {isNull && (
            <div className="text-[10px] text-muted-foreground">
              No patient factors applied
            </div>
          )}
        </div>
        
        {isActive && (
          <Badge variant="default" className="text-[9px] h-4 px-1">
            Active
          </Badge>
        )}
      </div>
      
      {/* Risk indicators */}
      {!isNull && !compact && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {patient.riskFactors?.smoking === 'current' && (
            <Badge variant="destructive" className="text-[9px] h-4 px-1">
              <Cigarette className="w-2 h-2 mr-0.5" />Smoker
            </Badge>
          )}
          {patient.familyHistory?.cad && (
            <Badge variant="outline" className="text-[9px] h-4 px-1">
              <Heart className="w-2 h-2 mr-0.5" />FHx CAD
            </Badge>
          )}
          {patient.comorbidities?.length > 0 && (
            <Badge variant="secondary" className="text-[9px] h-4 px-1">
              +{patient.comorbidities.length} conditions
            </Badge>
          )}
        </div>
      )}
      
      {/* Edit/Delete actions */}
      {!isNull && !compact && (
        <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={(e) => { e.stopPropagation(); onEdit?.(patient); }}
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete?.(patient.id); }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};

// Patient Editor Form
const PatientEditor = ({ patient, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    demographics: {
      age: patient?.demographics?.age || '',
      sex: patient?.demographics?.sex || '',
      height: patient?.demographics?.height || '',
      weight: patient?.demographics?.weight || '',
      bmi: patient?.demographics?.bmi || ''
    },
    riskFactors: {
      smoking: patient?.riskFactors?.smoking || 'never',
      smokingPackYears: patient?.riskFactors?.smokingPackYears || 0,
      alcohol: patient?.riskFactors?.alcohol || 'none',
      alcoholDrinksPerWeek: patient?.riskFactors?.alcoholDrinksPerWeek || 0,
      exercise: patient?.riskFactors?.exercise || 'moderate',
      diet: patient?.riskFactors?.diet || 'average'
    },
    familyHistory: {
      cad: patient?.familyHistory?.cad || false,
      diabetes: patient?.familyHistory?.diabetes || false,
      stroke: patient?.familyHistory?.stroke || false,
      cancer: patient?.familyHistory?.cancer || false,
      hypertension: patient?.familyHistory?.hypertension || false,
      arrhythmia: patient?.familyHistory?.arrhythmia || false,
      suddenDeath: patient?.familyHistory?.suddenDeath || false
    },
    comorbidities: patient?.comorbidities || [],
    medications: patient?.medications || [],
    allergies: patient?.allergies || []
  });
  
  const [expanded, setExpanded] = useState({
    demographics: true,
    riskFactors: true,
    familyHistory: false,
    comorbidities: false
  });
  
  // Calculate BMI when height/weight change
  useEffect(() => {
    const { height, weight } = formData.demographics;
    if (height && weight) {
      const heightM = parseFloat(height) / 100;
      const weightKg = parseFloat(weight);
      if (heightM > 0 && weightKg > 0) {
        const bmi = (weightKg / (heightM * heightM)).toFixed(1);
        setFormData(prev => ({
          ...prev,
          demographics: { ...prev.demographics, bmi }
        }));
      }
    }
  }, [formData.demographics.height, formData.demographics.weight]);
  
  const updateField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };
  
  const toggleFamilyHistory = (key) => {
    setFormData(prev => ({
      ...prev,
      familyHistory: { ...prev.familyHistory, [key]: !prev.familyHistory[key] }
    }));
  };
  
  const toggleComorbidity = (condition) => {
    setFormData(prev => ({
      ...prev,
      comorbidities: prev.comorbidities.includes(condition)
        ? prev.comorbidities.filter(c => c !== condition)
        : [...prev.comorbidities, condition]
    }));
  };
  
  const handleSave = () => {
    if (!formData.name.trim()) return;
    
    const newPatient = {
      id: patient?.id || `patient_${Date.now()}`,
      ...formData,
      modifiers: calculatePatientModifiers(formData),
      createdAt: patient?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(newPatient);
  };
  
  const Section = ({ title, icon: Icon, id, children }) => (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-2 bg-muted/30 hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))}
      >
        <div className="flex items-center gap-2 text-xs font-medium">
          <Icon className="w-3 h-3" />
          {title}
        </div>
        {expanded[id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {expanded[id] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-2 space-y-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  
  return (
    <div className="space-y-3">
      {/* Patient Name */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">Patient Name</label>
        <Input
          placeholder="e.g., John Doe, Case #123"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="h-8 text-sm mt-1"
        />
      </div>
      
      {/* Demographics */}
      <Section title="Demographics" icon={User} id="demographics">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">Age</label>
            <Input
              type="number"
              placeholder="Years"
              value={formData.demographics.age}
              onChange={(e) => updateField('demographics', 'age', e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Sex</label>
            <select
              value={formData.demographics.sex}
              onChange={(e) => updateField('demographics', 'sex', e.target.value)}
              className="w-full h-7 text-xs rounded-md border border-border bg-background px-2"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Height (cm)</label>
            <Input
              type="number"
              placeholder="cm"
              value={formData.demographics.height}
              onChange={(e) => updateField('demographics', 'height', e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Weight (kg)</label>
            <Input
              type="number"
              placeholder="kg"
              value={formData.demographics.weight}
              onChange={(e) => updateField('demographics', 'weight', e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        </div>
        {formData.demographics.bmi && (
          <div className="text-xs text-center mt-2">
            <Badge variant={
              parseFloat(formData.demographics.bmi) >= 30 ? 'destructive' :
              parseFloat(formData.demographics.bmi) >= 25 ? 'secondary' : 'outline'
            }>
              BMI: {formData.demographics.bmi}
              {parseFloat(formData.demographics.bmi) >= 30 ? ' (Obese)' :
               parseFloat(formData.demographics.bmi) >= 25 ? ' (Overweight)' : ' (Normal)'}
            </Badge>
          </div>
        )}
      </Section>
      
      {/* Risk Factors */}
      <Section title="Risk Factors" icon={AlertCircle} id="riskFactors">
        {/* Smoking */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Cigarette className="w-3 h-3" /> Smoking Status
          </label>
          <div className="flex gap-1 flex-wrap">
            {['never', 'former', 'current'].map(status => (
              <Button
                key={status}
                variant={formData.riskFactors.smoking === status ? 'default' : 'outline'}
                size="sm"
                className="text-[10px] h-6 px-2 capitalize"
                onClick={() => updateField('riskFactors', 'smoking', status)}
              >
                {status}
              </Button>
            ))}
          </div>
          {formData.riskFactors.smoking !== 'never' && (
            <Input
              type="number"
              placeholder="Pack-years"
              value={formData.riskFactors.smokingPackYears}
              onChange={(e) => updateField('riskFactors', 'smokingPackYears', e.target.value)}
              className="h-6 text-xs w-24 mt-1"
            />
          )}
        </div>
        
        {/* Alcohol */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Wine className="w-3 h-3" /> Alcohol Use
          </label>
          <div className="flex gap-1 flex-wrap">
            {['none', 'social', 'moderate', 'heavy'].map(status => (
              <Button
                key={status}
                variant={formData.riskFactors.alcohol === status ? 'default' : 'outline'}
                size="sm"
                className="text-[10px] h-6 px-2 capitalize"
                onClick={() => updateField('riskFactors', 'alcohol', status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Section>
      
      {/* Family History */}
      <Section title="Family History (1st Degree)" icon={Users} id="familyHistory">
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'cad', label: 'CAD' },
            { key: 'diabetes', label: 'Diabetes' },
            { key: 'stroke', label: 'Stroke' },
            { key: 'hypertension', label: 'HTN' },
            { key: 'cancer', label: 'Cancer' },
            { key: 'arrhythmia', label: 'Arrhythmia' },
            { key: 'suddenDeath', label: 'Sudden Death' }
          ].map(item => (
            <Badge
              key={item.key}
              variant={formData.familyHistory[item.key] ? 'default' : 'outline'}
              className="cursor-pointer text-[10px] h-5"
              onClick={() => toggleFamilyHistory(item.key)}
            >
              {formData.familyHistory[item.key] && <Check className="w-2 h-2 mr-0.5" />}
              {item.label}
            </Badge>
          ))}
        </div>
      </Section>
      
      {/* Comorbidities */}
      <Section title="Comorbidities" icon={History} id="comorbidities">
        <div className="flex flex-wrap gap-1">
          {[
            'diabetes', 'hypertension', 'ckd', 'copd', 'chf',
            'afib', 'cad', 'pah', 'cirrhosis', 'obesity'
          ].map(condition => (
            <Badge
              key={condition}
              variant={formData.comorbidities.includes(condition) ? 'destructive' : 'outline'}
              className="cursor-pointer text-[10px] h-5 uppercase"
              onClick={() => toggleComorbidity(condition)}
            >
              {formData.comorbidities.includes(condition) && <Check className="w-2 h-2 mr-0.5" />}
              {condition}
            </Badge>
          ))}
        </div>
      </Section>
      
      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" className="flex-1" onClick={handleSave} disabled={!formData.name.trim()}>
          <Save className="w-3 h-3 mr-1" />
          Save Patient
        </Button>
      </div>
    </div>
  );
};

// Main Patient Manager Component
const PatientManager = ({ 
  onPatientChange, 
  selectedDisease,
  compact = false 
}) => {
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(NULL_PATIENT);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showPatientList, setShowPatientList] = useState(false);
  
  // Load patients from localStorage on mount
  useEffect(() => {
    const savedPatients = localStorage.getItem('phicore_patients');
    if (savedPatients) {
      try {
        const parsed = JSON.parse(savedPatients);
        setPatients(parsed);
      } catch (e) {
        console.error('Error loading patients:', e);
      }
    }
  }, []);
  
  // Save patients to localStorage when they change
  useEffect(() => {
    if (patients.length > 0) {
      localStorage.setItem('phicore_patients', JSON.stringify(patients));
    }
  }, [patients]);
  
  // Notify parent when active patient changes
  useEffect(() => {
    onPatientChange?.(activePatient);
  }, [activePatient, onPatientChange]);
  
  const handleSelectPatient = useCallback((patient) => {
    setActivePatient(patient);
    setShowPatientList(false);
  }, []);
  
  const handleSavePatient = useCallback((patient) => {
    setPatients(prev => {
      const existing = prev.findIndex(p => p.id === patient.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = patient;
        return updated;
      }
      return [...prev, patient];
    });
    setActivePatient(patient);
    setIsEditing(false);
    setEditingPatient(null);
  }, []);
  
  const handleDeletePatient = useCallback((patientId) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    if (activePatient.id === patientId) {
      setActivePatient(NULL_PATIENT);
    }
  }, [activePatient]);
  
  const handleEditPatient = useCallback((patient) => {
    setEditingPatient(patient);
    setIsEditing(true);
  }, []);
  
  // Apply patient modifiers to disease parameters
  const getModifiedParameterInfo = useCallback(() => {
    if (!activePatient || activePatient.isNull || !selectedDisease) return null;
    
    const modifiers = activePatient.modifiers || calculatePatientModifiers(activePatient);
    const modifierCount = Object.keys(modifiers).reduce((acc, key) => {
      return acc + Object.keys(modifiers[key]).length;
    }, 0);
    
    return {
      count: modifierCount,
      categories: Object.keys(modifiers)
    };
  }, [activePatient, selectedDisease]);
  
  const modifierInfo = getModifiedParameterInfo();
  
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {editingPatient ? 'Edit Patient' : 'New Patient'}
          </div>
        </div>
        <PatientEditor
          patient={editingPatient}
          onSave={handleSavePatient}
          onCancel={() => { setIsEditing(false); setEditingPatient(null); }}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <User className="w-3 h-3" />
          Active Patient
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          onClick={() => setIsEditing(true)}
        >
          <UserPlus className="w-3 h-3 mr-1" />
          New
        </Button>
      </div>
      
      {/* Active Patient Card */}
      <PatientCard
        patient={activePatient}
        isActive={true}
        onSelect={() => setShowPatientList(!showPatientList)}
        onEdit={handleEditPatient}
        onDelete={handleDeletePatient}
      />
      
      {/* Patient modifier summary */}
      {modifierInfo && modifierInfo.count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30"
        >
          <div className="text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            {modifierInfo.count} parameter modifiers active
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Affecting: {modifierInfo.categories.map(c => c.replace(/_/g, ' ')).join(', ')}
          </div>
        </motion.div>
      )}
      
      {/* Saved Patients List */}
      <AnimatePresence>
        {showPatientList && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>Saved Patients ({patients.length + 1})</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => setShowPatientList(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <ScrollArea className="max-h-48">
              <div className="space-y-1.5">
                {/* Null Patient Option */}
                <PatientCard
                  patient={NULL_PATIENT}
                  isActive={activePatient.id === 'null'}
                  onSelect={handleSelectPatient}
                  compact
                />
                
                {/* Saved Patients */}
                {patients.map(patient => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    isActive={activePatient.id === patient.id}
                    onSelect={handleSelectPatient}
                    onEdit={handleEditPatient}
                    onDelete={handleDeletePatient}
                    compact
                  />
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quick info when no disease selected */}
      {!selectedDisease && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="text-xs text-muted-foreground text-center">
            <AlertCircle className="w-4 h-4 mx-auto mb-1 opacity-50" />
            Select a disease to see how patient factors affect parameters
          </div>
        </div>
      )}
      
      {/* Instructions */}
      {!compact && (
        <div className="text-[10px] text-muted-foreground space-y-1 pt-2 border-t border-border/50">
          <div className="font-medium">How it works:</div>
          <div>1. Create a patient profile with demographics & risk factors</div>
          <div>2. Select a disease from the dashboard</div>
          <div>3. See how patient factors modify disease parameters</div>
        </div>
      )}
    </div>
  );
};

export default PatientManager;
export { NULL_PATIENT, calculatePatientModifiers, PatientCard, PatientEditor };
