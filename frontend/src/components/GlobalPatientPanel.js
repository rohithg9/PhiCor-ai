import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ChevronDown, ChevronUp, ChevronRight, X, Save, Plus,
  Heart, Activity, Pill, AlertTriangle, Scale, Calendar,
  Cigarette, Wine, Dumbbell, Apple, Users, FileText, Edit2, Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { usePatient } from '../context/PatientContext';
import { useTheme } from '../context/ThemeContext';

/**
 * Global Patient Panel
 * 
 * A collapsible panel that appears on analysis pages showing:
 * - Active patient profile summary
 * - Quick patient switcher
 * - Active modifiers affecting the current analysis
 * - Option to create/edit patient profiles
 */

// Common conditions for quick selection
const COMMON_CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes', icon: '🩸' },
  { id: 'hypertension', label: 'Hypertension', icon: '💓' },
  { id: 'ckd', label: 'CKD', icon: '🫘' },
  { id: 'heart_failure', label: 'Heart Failure', icon: '❤️' },
  { id: 'copd', label: 'COPD', icon: '🫁' },
  { id: 'liver_disease', label: 'Liver Disease', icon: '🔬' },
  { id: 'obesity', label: 'Obesity', icon: '⚖️' },
  { id: 'anemia', label: 'Anemia', icon: '🩸' },
];

// Common medications for quick selection
const COMMON_MEDICATIONS = [
  { id: 'metformin', name: 'Metformin', category: 'Antidiabetic' },
  { id: 'lisinopril', name: 'Lisinopril', category: 'ACE Inhibitor' },
  { id: 'amlodipine', name: 'Amlodipine', category: 'CCB' },
  { id: 'atorvastatin', name: 'Atorvastatin', category: 'Statin' },
  { id: 'aspirin', name: 'Aspirin', category: 'Antiplatelet' },
  { id: 'warfarin', name: 'Warfarin', category: 'Anticoagulant' },
  { id: 'omeprazole', name: 'Omeprazole', category: 'PPI' },
  { id: 'levothyroxine', name: 'Levothyroxine', category: 'Thyroid' },
];

const GlobalPatientPanel = ({ 
  compact = false,
  showModifiers = true,
  analysisType = 'general' // 'food', 'drug', 'differential', 'disease'
}) => {
  const { isDark } = useTheme();
  const {
    activePatient,
    savedPatients,
    modifiers,
    isExpanded,
    setIsExpanded,
    savePatient,
    deletePatient,
    selectPatient,
    clearPatient,
    updatePatientField
  } = usePatient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  
  // Get relevant modifiers for current analysis type
  const relevantModifiers = React.useMemo(() => {
    if (!modifiers || activePatient.isBaseline) return [];
    
    const mods = [];
    
    if (modifiers.cardiovascular > 1.1) {
      mods.push({ label: 'CV Risk', value: `${Math.round((modifiers.cardiovascular - 1) * 100)}%↑`, color: 'red' });
    }
    if (modifiers.renal < 0.9) {
      mods.push({ label: 'Renal', value: `${Math.round((1 - modifiers.renal) * 100)}%↓`, color: 'orange' });
    }
    if (modifiers.hepatic < 0.9) {
      mods.push({ label: 'Hepatic', value: `${Math.round((1 - modifiers.hepatic) * 100)}%↓`, color: 'yellow' });
    }
    if (modifiers.metabolic > 1.1) {
      mods.push({ label: 'Metabolic', value: `${Math.round((modifiers.metabolic - 1) * 100)}%↑`, color: 'purple' });
    }
    if (modifiers.respiratory < 0.9) {
      mods.push({ label: 'Pulmonary', value: `${Math.round((1 - modifiers.respiratory) * 100)}%↓`, color: 'blue' });
    }
    
    return mods;
  }, [modifiers, activePatient]);
  
  const handleStartEdit = () => {
    setEditingPatient({
      ...activePatient,
      id: activePatient.isBaseline ? `patient_${Date.now()}` : activePatient.id,
      isBaseline: false
    });
    setIsEditing(true);
  };
  
  const handleSavePatient = () => {
    if (editingPatient) {
      const saved = savePatient(editingPatient);
      selectPatient(saved);
      setIsEditing(false);
      setEditingPatient(null);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPatient(null);
  };
  
  const updateEditingField = (path, value) => {
    setEditingPatient(prev => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };
  
  const toggleCondition = (conditionId) => {
    setEditingPatient(prev => {
      const conditions = prev.medicalHistory?.conditions || [];
      const updated = conditions.includes(conditionId)
        ? conditions.filter(c => c !== conditionId)
        : [...conditions, conditionId];
      return {
        ...prev,
        medicalHistory: { ...prev.medicalHistory, conditions: updated }
      };
    });
  };
  
  const toggleMedication = (med) => {
    setEditingPatient(prev => {
      const medications = prev.currentMedications || [];
      const exists = medications.some(m => m.id === med.id);
      const updated = exists
        ? medications.filter(m => m.id !== med.id)
        : [...medications, med];
      return { ...prev, currentMedications: updated };
    });
  };
  
  // Compact view for inline display
  if (compact) {
    return (
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
          activePatient.isBaseline 
            ? isDark ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'
            : isDark ? 'bg-emerald-900/30 hover:bg-emerald-800/30 border border-emerald-500/30' : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="patient-panel-compact"
      >
        <User className={`w-4 h-4 ${activePatient.isBaseline ? 'text-muted-foreground' : 'text-emerald-500'}`} />
        <span className="text-sm font-medium truncate max-w-[120px]">
          {activePatient.name || 'No Patient'}
        </span>
        {!activePatient.isBaseline && relevantModifiers.length > 0 && (
          <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-500 border-orange-500/30">
            {relevantModifiers.length} modifiers
          </Badge>
        )}
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>
    );
  }
  
  return (
    <div 
      className={`rounded-xl border overflow-hidden transition-all ${
        isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'
      }`}
      data-testid="global-patient-panel"
    >
      {/* Header */}
      <div 
        className={`flex items-center justify-between p-3 cursor-pointer ${
          isDark ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            activePatient.isBaseline 
              ? isDark ? 'bg-gray-700' : 'bg-gray-200'
              : 'bg-gradient-to-br from-emerald-500 to-teal-500'
          }`}>
            <User className={`w-4 h-4 ${activePatient.isBaseline ? 'text-muted-foreground' : 'text-white'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{activePatient.name || 'No Patient Selected'}</span>
              {!activePatient.isBaseline && (
                <Badge variant="outline" className="text-[10px]">Active</Badge>
              )}
            </div>
            {!activePatient.isBaseline && activePatient.demographics?.age && (
              <p className="text-xs text-muted-foreground">
                {activePatient.demographics.age}y {activePatient.demographics.sex || ''}
                {activePatient.demographics.bmi ? ` • BMI ${activePatient.demographics.bmi}` : ''}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {!activePatient.isBaseline && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
              className="h-7 w-7 p-0"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); setShowPatientList(!showPatientList); }}
            className="h-7 w-7 p-0"
          >
            <Users className="w-3.5 h-3.5" />
          </Button>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Active Modifiers */}
            {showModifiers && !activePatient.isBaseline && relevantModifiers.length > 0 && (
              <div className={`px-3 py-2 border-t ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-100 bg-gray-50/50'}`}>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Active Modifiers</div>
                <div className="flex flex-wrap gap-1.5">
                  {relevantModifiers.map((mod, i) => (
                    <Badge 
                      key={i}
                      variant="outline"
                      className={`text-[10px] ${
                        mod.color === 'red' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                        mod.color === 'orange' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' :
                        mod.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                        mod.color === 'purple' ? 'bg-purple-500/10 text-purple-500 border-purple-500/30' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/30'
                      }`}
                    >
                      {mod.label}: {mod.value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Patient Details or Edit Form */}
            <div className="p-3 border-t border-border/50">
              {isEditing && editingPatient ? (
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-xs text-muted-foreground">Patient Name</label>
                    <Input
                      value={editingPatient.name || ''}
                      onChange={(e) => updateEditingField('name', e.target.value)}
                      placeholder="Enter patient name"
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  
                  {/* Demographics */}
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Age</label>
                      <Input
                        type="number"
                        value={editingPatient.demographics?.age || ''}
                        onChange={(e) => updateEditingField('demographics.age', e.target.value)}
                        placeholder="Age"
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Sex</label>
                      <select
                        value={editingPatient.demographics?.sex || ''}
                        onChange={(e) => updateEditingField('demographics.sex', e.target.value)}
                        className={`w-full h-8 text-sm mt-1 rounded-md border px-2 ${
                          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}
                      >
                        <option value="">-</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Weight (kg)</label>
                      <Input
                        type="number"
                        value={editingPatient.demographics?.weight || ''}
                        onChange={(e) => {
                          updateEditingField('demographics.weight', e.target.value);
                          // Auto-calculate BMI
                          const height = editingPatient.demographics?.height;
                          if (height && e.target.value) {
                            const bmi = (parseFloat(e.target.value) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1);
                            updateEditingField('demographics.bmi', bmi);
                          }
                        }}
                        placeholder="kg"
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Height (cm)</label>
                      <Input
                        type="number"
                        value={editingPatient.demographics?.height || ''}
                        onChange={(e) => {
                          updateEditingField('demographics.height', e.target.value);
                          // Auto-calculate BMI
                          const weight = editingPatient.demographics?.weight;
                          if (weight && e.target.value) {
                            const bmi = (parseFloat(weight) / Math.pow(parseFloat(e.target.value) / 100, 2)).toFixed(1);
                            updateEditingField('demographics.bmi', bmi);
                          }
                        }}
                        placeholder="cm"
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                  </div>
                  
                  {/* BMI Display */}
                  {editingPatient.demographics?.bmi && (
                    <div className="text-xs text-muted-foreground">
                      Calculated BMI: <span className="font-medium text-foreground">{editingPatient.demographics.bmi}</span>
                    </div>
                  )}
                  
                  {/* Risk Factors */}
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <AlertTriangle className="w-3 h-3" /> Risk Factors
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <Cigarette className="w-3.5 h-3.5 text-muted-foreground" />
                        <select
                          value={editingPatient.riskFactors?.smoking || 'never'}
                          onChange={(e) => updateEditingField('riskFactors.smoking', e.target.value)}
                          className={`flex-1 h-7 text-xs rounded border px-1 ${
                            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                          }`}
                        >
                          <option value="never">Never smoked</option>
                          <option value="former">Former smoker</option>
                          <option value="current">Current smoker</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wine className="w-3.5 h-3.5 text-muted-foreground" />
                        <select
                          value={editingPatient.riskFactors?.alcohol || 'none'}
                          onChange={(e) => updateEditingField('riskFactors.alcohol', e.target.value)}
                          className={`flex-1 h-7 text-xs rounded border px-1 ${
                            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                          }`}
                        >
                          <option value="none">No alcohol</option>
                          <option value="light">Light (&lt;7/wk)</option>
                          <option value="moderate">Moderate (7-14/wk)</option>
                          <option value="heavy">Heavy (&gt;14/wk)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Conditions */}
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <Heart className="w-3 h-3" /> Medical Conditions
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_CONDITIONS.map(cond => {
                        const isSelected = editingPatient.medicalHistory?.conditions?.includes(cond.id);
                        return (
                          <button
                            key={cond.id}
                            onClick={() => toggleCondition(cond.id)}
                            className={`px-2 py-1 rounded text-xs transition-all ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50'
                                : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {cond.icon} {cond.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Current Medications */}
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <Pill className="w-3 h-3" /> Current Medications
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_MEDICATIONS.map(med => {
                        const isSelected = editingPatient.currentMedications?.some(m => m.id === med.id);
                        return (
                          <button
                            key={med.id}
                            onClick={() => toggleMedication(med)}
                            className={`px-2 py-1 rounded text-xs transition-all ${
                              isSelected
                                ? 'bg-purple-500/20 text-purple-500 border border-purple-500/50'
                                : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            💊 {med.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSavePatient} size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <Save className="w-3.5 h-3.5 mr-1" /> Save Patient
                    </Button>
                    <Button onClick={handleCancelEdit} size="sm" variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Quick Summary */}
                  {!activePatient.isBaseline ? (
                    <>
                      {/* Conditions */}
                      {activePatient.medicalHistory?.conditions?.length > 0 && (
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Conditions</div>
                          <div className="flex flex-wrap gap-1">
                            {activePatient.medicalHistory.conditions.map(cond => {
                              const condInfo = COMMON_CONDITIONS.find(c => c.id === cond);
                              return (
                                <Badge key={cond} variant="outline" className="text-[10px]">
                                  {condInfo?.icon} {condInfo?.label || cond}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Medications */}
                      {activePatient.currentMedications?.length > 0 && (
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Medications</div>
                          <div className="flex flex-wrap gap-1">
                            {activePatient.currentMedications.map(med => (
                              <Badge key={med.id} variant="outline" className="text-[10px] bg-purple-500/10 border-purple-500/30">
                                💊 {med.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Risk Factors */}
                      {(activePatient.riskFactors?.smoking !== 'never' || activePatient.riskFactors?.alcohol !== 'none') && (
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Risk Factors</div>
                          <div className="flex flex-wrap gap-1">
                            {activePatient.riskFactors?.smoking !== 'never' && (
                              <Badge variant="outline" className="text-[10px] bg-orange-500/10 border-orange-500/30">
                                🚬 {activePatient.riskFactors.smoking}
                              </Badge>
                            )}
                            {activePatient.riskFactors?.alcohol !== 'none' && (
                              <Badge variant="outline" className="text-[10px] bg-yellow-500/10 border-yellow-500/30">
                                🍷 {activePatient.riskFactors.alcohol}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <User className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">No patient selected</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Add a patient profile to see personalized analysis with modifiers
                      </p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button onClick={handleStartEdit} size="sm" variant="outline" className="flex-1">
                      <Plus className="w-3.5 h-3.5 mr-1" /> 
                      {activePatient.isBaseline ? 'Add Patient' : 'Edit'}
                    </Button>
                    {!activePatient.isBaseline && (
                      <Button onClick={clearPatient} size="sm" variant="ghost" className="text-muted-foreground">
                        <X className="w-3.5 h-3.5 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Saved Patients List */}
            <AnimatePresence>
              {showPatientList && savedPatients.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
                >
                  <div className="p-2">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 px-1">
                      Saved Patients ({savedPatients.length})
                    </div>
                    <ScrollArea className="max-h-40">
                      <div className="space-y-1">
                        {savedPatients.map(patient => (
                          <div
                            key={patient.id}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                              activePatient.id === patient.id
                                ? isDark ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'
                                : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => { selectPatient(patient); setShowPatientList(false); }}
                          >
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <span className="text-sm font-medium">{patient.name}</span>
                                {patient.demographics?.age && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {patient.demographics.age}y {patient.demographics.sex || ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); deletePatient(patient.id); }}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalPatientPanel;
