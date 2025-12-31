import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import FeatureNav from '../components/FeatureNav';
import {
  Pill, Search, ChevronDown, ChevronUp, ChevronRight,
  Heart, AlertTriangle, TrendingUp, TrendingDown,
  Beaker, Shield, Clock, Info, Loader2, X, ArrowLeft,
  User, Scale, Activity, FileText, Upload, Sliders,
  CheckCircle, XCircle, AlertCircle, Brain, Zap, LineChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Slider } from '../components/ui/slider';
import { ORGAN_MODELS } from '../data/organModels';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Simple PK Curve Visualization Component
const PKCurveVisualization = ({ simulation, dosage }) => {
  const halfLife = simulation?.half_life || 0;
  const tMax = simulation?.time_to_peak || 1.5;
  const cMax = simulation?.peak_concentration || (dosage / 20);
  
  // Generate curve points (simplified one-compartment model)
  const points = useMemo(() => {
    if (!simulation || !simulation.half_life) return [];
    
    const pts = [];
    const totalHours = halfLife * 5; // Show 5 half-lives
    
    for (let t = 0; t <= totalHours; t += 0.5) {
      let concentration;
      if (t <= tMax) {
        // Absorption phase (linear rise for simplicity)
        concentration = (cMax * t) / tMax;
      } else {
        // Elimination phase (exponential decay)
        const ke = 0.693 / halfLife; // elimination constant
        concentration = cMax * Math.exp(-ke * (t - tMax));
      }
      pts.push({ t, c: Math.max(0, concentration) });
    }
    return pts;
  }, [simulation, halfLife, tMax, cMax]);
  
  if (!simulation || !simulation.half_life) return null;
  
  const maxTime = halfLife * 5;
  const maxConc = cMax * 1.2;
  
  // Create SVG path
  const pathD = points.map((p, i) => {
    const x = (p.t / maxTime) * 280 + 30;
    const y = 120 - (p.c / maxConc) * 100;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Therapeutic range (simplified)
  const therapeuticMin = cMax * 0.25;
  const therapeuticMax = cMax * 0.75;
  const yMin = 120 - (therapeuticMin / maxConc) * 100;
  const yMax = 120 - (therapeuticMax / maxConc) * 100;
  
  return (
    <div className="mt-4 p-4 rounded-lg border border-border/50 bg-card/30">
      <div className="flex items-center gap-2 mb-3">
        <LineChart className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Concentration-Time Curve</span>
      </div>
      
      <svg viewBox="0 0 320 140" className="w-full h-32">
        {/* Therapeutic range band */}
        <rect 
          x="30" 
          y={yMax} 
          width="280" 
          height={yMin - yMax} 
          fill="currentColor" 
          className="text-emerald-500/10"
        />
        <line x1="30" y1={yMax} x2="310" y2={yMax} stroke="currentColor" className="text-emerald-500/30" strokeDasharray="4" />
        <line x1="30" y1={yMin} x2="310" y2={yMin} stroke="currentColor" className="text-emerald-500/30" strokeDasharray="4" />
        
        {/* Axes */}
        <line x1="30" y1="120" x2="310" y2="120" stroke="currentColor" className="text-muted-foreground/30" />
        <line x1="30" y1="20" x2="30" y2="120" stroke="currentColor" className="text-muted-foreground/30" />
        
        {/* Concentration curve */}
        <path d={pathD} fill="none" stroke="currentColor" className="text-primary" strokeWidth="2" />
        
        {/* Peak marker */}
        <circle 
          cx={(tMax / maxTime) * 280 + 30} 
          cy={120 - (cMax / maxConc) * 100} 
          r="4" 
          fill="currentColor" 
          className="text-primary"
        />
        
        {/* Labels */}
        <text x="160" y="135" textAnchor="middle" className="fill-muted-foreground text-[10px]">Time (hours)</text>
        <text x="15" y="70" textAnchor="middle" className="fill-muted-foreground text-[10px]" transform="rotate(-90, 15, 70)">Conc.</text>
        
        {/* Time markers */}
        <text x="30" y="132" textAnchor="middle" className="fill-muted-foreground text-[8px]">0</text>
        <text x="100" y="132" textAnchor="middle" className="fill-muted-foreground text-[8px]">{(maxTime * 0.25).toFixed(0)}</text>
        <text x="170" y="132" textAnchor="middle" className="fill-muted-foreground text-[8px]">{(maxTime * 0.5).toFixed(0)}</text>
        <text x="240" y="132" textAnchor="middle" className="fill-muted-foreground text-[8px]">{(maxTime * 0.75).toFixed(0)}</text>
        <text x="305" y="132" textAnchor="middle" className="fill-muted-foreground text-[8px]">{maxTime.toFixed(0)}h</text>
      </svg>
      
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>T<sub>max</sub>: {tMax.toFixed(1)}h</span>
        <span className="text-emerald-500">Therapeutic Range</span>
        <span>t<sub>½</sub>: {halfLife.toFixed(1)}h</span>
      </div>
    </div>
  );
};

// Drug Categories
const DRUG_CATEGORIES = {
  cardiovascular: { name: 'Cardiovascular', icon: '🫀', color: 'from-red-500 to-rose-500' },
  respiratory: { name: 'Respiratory', icon: '🫁', color: 'from-blue-500 to-cyan-500' },
  neurological: { name: 'Neurological', icon: '🧠', color: 'from-purple-500 to-violet-500' },
  renal: { name: 'Renal', icon: '💜', color: 'from-teal-500 to-cyan-500' },
  gastrointestinal: { name: 'GI', icon: '🔬', color: 'from-orange-500 to-red-500' },
  endocrine: { name: 'Endocrine', icon: '⚡', color: 'from-yellow-500 to-amber-500' },
  antibiotics: { name: 'Antibiotics', icon: '🦠', color: 'from-green-500 to-emerald-500' },
  analgesics: { name: 'Analgesics', icon: '💊', color: 'from-pink-500 to-rose-500' },
};

// Default Virtual Patient
const DEFAULT_PATIENT = {
  age: 50,
  sex: 'male',
  weight: 70,
  height: 170,
  serum_creatinine: 1.0,
  liver_function: 'normal',
  conditions: [],
  allergies: [],
  current_medications: [],
  clinical_notes: ''
};

// Common conditions for quick selection
const COMMON_CONDITIONS = [
  'heart_failure', 'hypertension', 'diabetes', 'atrial_fibrillation',
  'coronary_artery_disease', 'chronic_kidney_disease', 'copd', 'asthma',
  'stroke', 'depression', 'anxiety', 'hypothyroidism'
];

// Parameter Effect Card Component
const ParameterEffectCard = ({ effect, isPositive }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-3 rounded-lg border ${
        isPositive 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : 'bg-amber-500/10 border-amber-500/30'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{ORGAN_MODELS[effect.organ_id]?.icon || '💊'}</span>
        <span className="text-xs text-muted-foreground">{effect.organ_name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{effect.parameter_name}</span>
        <div className="flex items-center gap-1">
          {effect.percent_change > 0 ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-amber-500" />
          )}
          <span className={`text-sm font-bold ${effect.percent_change > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {effect.percent_change > 0 ? '+' : ''}{effect.percent_change}%
          </span>
        </div>
      </div>
      {effect.clinical_note && (
        <p className="text-xs text-muted-foreground mt-1">{effect.clinical_note}</p>
      )}
    </motion.div>
  );
};

// Patient Profile Panel Component
const PatientProfilePanel = ({ patient, setPatient, onExtractFromText }) => {
  const [showConditions, setShowConditions] = useState(false);
  const [newMed, setNewMed] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [clinicalText, setClinicalText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const bmi = useMemo(() => {
    if (patient.weight && patient.height) {
      return (patient.weight / ((patient.height / 100) ** 2)).toFixed(1);
    }
    return null;
  }, [patient.weight, patient.height]);

  const handleExtract = async () => {
    if (!clinicalText.trim()) return;
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('text', clinicalText);
      
      const response = await fetch(`${API_URL}/api/drugs-db/extract-from-text`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setPatient(prev => ({
          ...prev,
          age: data.age || prev.age,
          sex: data.sex || prev.sex,
          weight: data.weight || prev.weight,
          height: data.height || prev.height,
          serum_creatinine: data.serum_creatinine || prev.serum_creatinine,
          liver_function: data.liver_function || prev.liver_function,
          conditions: data.conditions?.length ? data.conditions : prev.conditions,
          allergies: data.allergies?.length ? data.allergies : prev.allergies,
          current_medications: data.current_medications?.length ? data.current_medications : prev.current_medications,
          clinical_notes: data.clinical_notes || prev.clinical_notes
        }));
        setClinicalText('');
      }
    } catch (error) {
      console.error('Extraction failed:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleCondition = (condition) => {
    setPatient(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }));
  };

  const addMedication = () => {
    if (newMed.trim()) {
      setPatient(prev => ({
        ...prev,
        current_medications: [...prev.current_medications, newMed.trim()]
      }));
      setNewMed('');
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setPatient(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <User className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Virtual Patient</h3>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Age</label>
          <Input
            type="number"
            value={patient.age}
            onChange={(e) => setPatient(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
            className="h-9"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Sex</label>
          <select
            value={patient.sex}
            onChange={(e) => setPatient(prev => ({ ...prev, sex: e.target.value }))}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Weight (kg)</label>
          <Input
            type="number"
            value={patient.weight}
            onChange={(e) => setPatient(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
            className="h-9"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Height (cm)</label>
          <Input
            type="number"
            value={patient.height}
            onChange={(e) => setPatient(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
            className="h-9"
          />
        </div>
      </div>

      {/* Calculated Values */}
      {bmi && (
        <div className="flex gap-2">
          <Badge variant="outline" className={`${parseFloat(bmi) > 30 ? 'bg-amber-500/10 text-amber-500' : parseFloat(bmi) < 18.5 ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            BMI: {bmi}
          </Badge>
        </div>
      )}

      {/* Clinical Parameters */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Serum Creatinine (mg/dL)</label>
        <div className="flex items-center gap-2">
          <Slider
            value={[patient.serum_creatinine]}
            onValueChange={([val]) => setPatient(prev => ({ ...prev, serum_creatinine: val }))}
            min={0.5}
            max={5}
            step={0.1}
            className="flex-1"
          />
          <span className="text-sm font-mono w-12">{patient.serum_creatinine.toFixed(1)}</span>
        </div>
        
        <label className="text-xs text-muted-foreground">Liver Function</label>
        <select
          value={patient.liver_function}
          onChange={(e) => setPatient(prev => ({ ...prev, liver_function: e.target.value }))}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="normal">Normal</option>
          <option value="mild_impairment">Mild Impairment</option>
          <option value="moderate_impairment">Moderate Impairment</option>
          <option value="severe_impairment">Severe Impairment</option>
        </select>
      </div>

      {/* Medical Conditions */}
      <div>
        <button
          onClick={() => setShowConditions(!showConditions)}
          className="flex items-center justify-between w-full text-sm font-medium py-2"
        >
          <span>Medical Conditions ({patient.conditions.length})</span>
          {showConditions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showConditions && (
          <div className="flex flex-wrap gap-1 mt-2">
            {COMMON_CONDITIONS.map(condition => (
              <button
                key={condition}
                onClick={() => toggleCondition(condition)}
                className={`px-2 py-1 rounded-full text-xs transition-all ${
                  patient.conditions.includes(condition)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {condition.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Medications */}
      <div>
        <label className="text-xs text-muted-foreground">Current Medications</label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="Add medication..."
            value={newMed}
            onChange={(e) => setNewMed(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addMedication()}
            className="h-8 text-sm"
          />
          <Button size="sm" variant="outline" onClick={addMedication}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {patient.current_medications.map((med, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {med}
              <button
                onClick={() => setPatient(prev => ({
                  ...prev,
                  current_medications: prev.current_medications.filter((_, i) => i !== idx)
                }))}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <label className="text-xs text-muted-foreground">Allergies</label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="Add allergy..."
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
            className="h-8 text-sm"
          />
          <Button size="sm" variant="outline" onClick={addAllergy}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {patient.allergies.map((allergy, idx) => (
            <Badge key={idx} variant="destructive" className="text-xs">
              {allergy}
              <button
                onClick={() => setPatient(prev => ({
                  ...prev,
                  allergies: prev.allergies.filter((_, i) => i !== idx)
                }))}
                className="ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Clinical Notes / Text Extraction */}
      <div className="border-t border-border/50 pt-4">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Paste Clinical Notes (AI will extract patient data)
        </label>
        <textarea
          value={clinicalText}
          onChange={(e) => setClinicalText(e.target.value)}
          placeholder="Paste clinical notes, discharge summary, or any patient documentation..."
          className="w-full mt-1 p-2 rounded-md border border-input bg-background text-sm min-h-[80px] resize-none"
        />
        <Button
          size="sm"
          onClick={handleExtract}
          disabled={isExtracting || !clinicalText.trim()}
          className="mt-2 w-full"
        >
          {isExtracting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Extracting...</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" />Extract Patient Data</>
          )}
        </Button>
      </div>
    </div>
  );
};

// Drug Simulation Panel
const DrugSimulationPanel = ({ drug, patient, dosage, setDosage, simulation, isSimulating }) => {
  if (!drug) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <Pill className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">Select a drug to simulate effects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Drug Header */}
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 via-purple-500/5 to-indigo-500/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{drug.name}</h2>
            <p className="text-sm text-muted-foreground">{drug.drug_class}</p>
          </div>
        </div>
        
        {/* Dosage Slider */}
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Dosage
            </span>
            <span className="text-lg font-bold text-primary">{dosage} mg</span>
          </div>
          <Slider
            value={[dosage]}
            onValueChange={([val]) => setDosage(val)}
            min={5}
            max={200}
            step={5}
            className="my-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low (5mg)</span>
            <span>Standard</span>
            <span>High (200mg)</span>
          </div>
        </div>
      </div>

      {/* Simulation Results */}
      <ScrollArea className="flex-1 p-4">
        {isSimulating ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Simulating...</span>
          </div>
        ) : simulation ? (
          <div className="space-y-4">
            {/* Scores & Recommendation */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-lg border ${simulation.efficacy_score >= 70 ? 'bg-emerald-500/10 border-emerald-500/30' : simulation.efficacy_score >= 40 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="text-xs text-muted-foreground mb-1">Efficacy Score</div>
                <div className="text-2xl font-bold">{simulation.efficacy_score}</div>
              </div>
              <div className={`p-4 rounded-lg border ${simulation.safety_score >= 70 ? 'bg-emerald-500/10 border-emerald-500/30' : simulation.safety_score >= 40 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="text-xs text-muted-foreground mb-1">Safety Score</div>
                <div className="text-2xl font-bold">{simulation.safety_score}</div>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`p-4 rounded-lg border ${
              simulation.overall_recommendation.includes('CONTRAINDICATED') ? 'bg-red-500/10 border-red-500/30' :
              simulation.overall_recommendation.includes('HIGH RISK') ? 'bg-red-500/10 border-red-500/30' :
              simulation.overall_recommendation.includes('CAUTION') ? 'bg-amber-500/10 border-amber-500/30' :
              'bg-emerald-500/10 border-emerald-500/30'
            }`}>
              <div className="text-sm font-medium">{simulation.overall_recommendation}</div>
            </div>

            {/* Dose Adjustment */}
            {simulation.dose_adjustment_reason && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>Adjusted dose: <strong>{simulation.actual_dose} mg</strong></span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{simulation.dose_adjustment_reason}</p>
              </div>
            )}

            {/* Contraindications */}
            {simulation.contraindications_found?.length > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <h4 className="font-semibold text-red-500 flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4" />
                  Contraindications Found
                </h4>
                <ul className="space-y-1">
                  {simulation.contraindications_found.map((ci, idx) => (
                    <li key={idx} className="text-sm text-red-400">• {ci}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interactions */}
            {simulation.interactions_found?.length > 0 && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <h4 className="font-semibold text-amber-500 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Drug Interactions
                </h4>
                {simulation.interactions_found.map((interaction, idx) => (
                  <div key={idx} className="mb-2 last:mb-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{interaction.drug}</span>
                      <Badge variant="outline" className={
                        interaction.severity === 'severe' ? 'bg-red-500/20 text-red-500' :
                        interaction.severity === 'moderate' ? 'bg-amber-500/20 text-amber-500' :
                        ''
                      }>{interaction.severity}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{interaction.effect}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Therapeutic Effects */}
            {simulation.therapeutic_effects?.length > 0 && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Therapeutic Effects
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {simulation.therapeutic_effects.map((effect, idx) => (
                    <ParameterEffectCard key={idx} effect={effect} isPositive={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Side Effects */}
            {simulation.side_effects?.length > 0 && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Side Effects
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {simulation.side_effects.map((effect, idx) => (
                    <ParameterEffectCard key={idx} effect={effect} isPositive={false} />
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {simulation.warnings?.length > 0 && (
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4" />
                  Warnings & Precautions
                </h4>
                <ul className="space-y-1">
                  {simulation.warnings.map((warning, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* PK Parameters */}
            {simulation.half_life && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-3 rounded-lg bg-card/50 border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground">Half-life</div>
                    <div className="font-semibold">{simulation.half_life.toFixed(1)}h</div>
                  </div>
                  <div className="p-3 rounded-lg bg-card/50 border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground">Time to Peak</div>
                    <div className="font-semibold">{simulation.time_to_peak}h</div>
                  </div>
                  <div className="p-3 rounded-lg bg-card/50 border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground">Steady State</div>
                    <div className="font-semibold">{simulation.steady_state_time.toFixed(0)}h</div>
                  </div>
                  <div className="p-3 rounded-lg bg-card/50 border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground">Peak Conc.</div>
                    <div className="font-semibold">{simulation.peak_concentration?.toFixed(2)}</div>
                  </div>
                </div>
                
                {/* PK Curve Visualization */}
                <PKCurveVisualization simulation={simulation} dosage={dosage} />
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Adjust dosage to see simulation results</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

// Main Drugs Page Component
const DrugsPage = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('drugs'); // 'drugs' or 'engine'
  
  // Drug list state
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [drugDetail, setDrugDetail] = useState(null);
  
  // Patient & Simulation state
  const [patient, setPatient] = useState({ ...DEFAULT_PATIENT });
  const [dosage, setDosage] = useState(20);
  const [simulation, setSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch drugs
  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);
        params.append('limit', '100');
        
        const response = await fetch(`${API_URL}/api/drugs-db?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setDrugs(data.drugs);
        }
      } catch (err) {
        console.error('Error fetching drugs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrugs();
  }, [selectedCategory, searchQuery]);

  // Fetch drug detail when selected
  useEffect(() => {
    const fetchDrugDetail = async () => {
      if (!selectedDrug) {
        setDrugDetail(null);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/drugs-db/${selectedDrug}`);
        if (response.ok) {
          const data = await response.json();
          setDrugDetail(data);
        }
      } catch (err) {
        console.error('Error fetching drug detail:', err);
      }
    };
    fetchDrugDetail();
  }, [selectedDrug]);

  // Run simulation when drug/patient/dosage changes
  useEffect(() => {
    const runSimulation = async () => {
      if (!drugDetail || activeTab !== 'engine') return;
      
      setIsSimulating(true);
      try {
        const response = await fetch(`${API_URL}/api/drugs-db/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient,
            drug_id: drugDetail.id,
            dosage_mg: dosage,
            frequency: 'once_daily'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setSimulation(data);
        }
      } catch (err) {
        console.error('Simulation error:', err);
      } finally {
        setIsSimulating(false);
      }
    };
    
    const debounce = setTimeout(runSimulation, 500);
    return () => clearTimeout(debounce);
  }, [drugDetail, patient, dosage, activeTab]);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark' : ''} bg-background text-foreground`}>
      <FeatureNav />
      
      {/* Page Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-serif text-3xl font-bold">ρ</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Drug Engine</h1>
              <p className="text-sm text-muted-foreground">
                PK/PD simulation with patient-specific analysis
              </p>
            </div>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex bg-muted/30 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('drugs')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'drugs' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Pill className="w-4 h-4 inline mr-2" />
              Drug Details
            </button>
            <button
              onClick={() => setActiveTab('engine')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'engine' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Patient Simulation
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Drug List */}
        <div className="w-72 lg:w-80 border-r border-border/50 bg-card/20 flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search drugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="p-2 border-b border-border/50 overflow-x-auto">
            <div className="flex flex-wrap gap-1">
              <Button
                variant={selectedCategory === null ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="h-7 text-xs"
              >
                All
              </Button>
              {Object.entries(DRUG_CATEGORIES).map(([key, cat]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="h-7 text-xs"
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Drug List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : drugs.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No drugs found
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {drugs.map((drug) => (
                  <button
                    key={drug.id}
                    onClick={() => setSelectedDrug(drug.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all hover:bg-accent/10 ${
                      selectedDrug === drug.id ? 'bg-primary/10 border border-primary/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{DRUG_CATEGORIES[drug.category]?.icon || '💊'}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{drug.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{drug.drug_class}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {activeTab === 'drugs' ? (
            // Drug Information View
            <div className="flex-1 overflow-auto">
              {drugDetail ? (
                <DrugInfoView drug={drugDetail} />
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <Pill className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Select a drug to view details</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Patient Simulation View
            <>
              {/* Patient Profile Panel */}
              <div className="w-80 border-r border-border/50 overflow-auto bg-card/10">
                <PatientProfilePanel
                  patient={patient}
                  setPatient={setPatient}
                />
              </div>
              
              {/* Simulation Results */}
              <DrugSimulationPanel
                drug={drugDetail}
                patient={patient}
                dosage={dosage}
                setDosage={setDosage}
                simulation={simulation}
                isSimulating={isSimulating}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Drug Information View Component
const DrugInfoView = ({ drug }) => {
  const [activeInfoTab, setActiveInfoTab] = useState('overview');
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 via-purple-500/5 to-indigo-500/5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{drug.name}</h1>
            <p className="text-muted-foreground">{drug.brand_names?.join(', ')}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{drug.drug_class}</Badge>
              <Badge variant="outline">{drug.category}</Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-border/50 bg-card/30">
        {['overview', 'effects', 'dosing', 'interactions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveInfoTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
              activeInfoTab === tab
                ? 'bg-primary/20 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        {activeInfoTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Beaker className="w-5 h-5 text-primary" />
                Mechanism of Action
              </h3>
              <p className="text-muted-foreground">{drug.mechanism_of_action}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Indications
              </h3>
              <div className="grid gap-2">
                {drug.indications?.map((indication, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border ${indication.is_primary ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-card/50 border-border/50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{indication.disease_name}</span>
                      <div className="flex gap-2">
                        {indication.is_primary && <Badge className="bg-emerald-500/20 text-emerald-500">Primary</Badge>}
                        <Badge variant="outline">{indication.efficacy_level}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {drug.contraindications?.length > 0 && (
              <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                <h4 className="font-semibold text-red-500 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Contraindications
                </h4>
                <ul className="space-y-1">
                  {drug.contraindications.map((item, idx) => (
                    <li key={idx} className="text-sm">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {activeInfoTab === 'effects' && (
          <div className="space-y-6">
            {drug.therapeutic_effects?.map((effect, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-emerald-500 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Therapeutic Effects
                </h4>
                <p className="text-sm text-muted-foreground mb-3">{effect.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {effect.organs?.flatMap((organ, oi) =>
                    organ.scales?.flatMap((scale, si) =>
                      scale.parameters?.map((param, pi) => (
                        <div key={`${oi}-${si}-${pi}`} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{ORGAN_MODELS[organ.organ_id]?.icon || '💊'}</span>
                            <span className="text-xs text-muted-foreground">{organ.organ_id}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{param.parameter_id}</span>
                            <span className={`font-bold ${param.multiplier > 1 ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {param.multiplier > 1 ? '+' : ''}{((param.multiplier - 1) * 100).toFixed(0)}%
                            </span>
                          </div>
                          {param.note && <p className="text-xs text-muted-foreground mt-1">{param.note}</p>}
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            ))}
            
            {drug.side_effects?.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-500 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Side Effects
                </h4>
                {drug.side_effects.map((effect, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">{effect.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {effect.organs?.flatMap((organ, oi) =>
                        organ.scales?.flatMap((scale, si) =>
                          scale.parameters?.map((param, pi) => (
                            <div key={`se-${oi}-${si}-${pi}`} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                              <div className="flex items-center gap-2 mb-1">
                                <span>{ORGAN_MODELS[organ.organ_id]?.icon || '💊'}</span>
                                <span className="text-xs text-muted-foreground">{organ.organ_id}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">{param.parameter_id}</span>
                                <span className="font-bold text-amber-500">
                                  {param.multiplier > 1 ? '+' : ''}{((param.multiplier - 1) * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ))
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeInfoTab === 'dosing' && (
          <div className="space-y-4">
            {drug.dosages?.map((dosage, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border/50 bg-card/50">
                <div className="flex gap-2 mb-3">
                  <Badge variant="secondary">{dosage.route}</Badge>
                  <Badge variant="outline">{dosage.form}</Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><span className="text-xs text-muted-foreground">Strength</span><p className="font-medium">{dosage.strength}</p></div>
                  <div><span className="text-xs text-muted-foreground">Typical Dose</span><p className="font-medium">{dosage.typical_dose}</p></div>
                  <div><span className="text-xs text-muted-foreground">Max Daily</span><p className="font-medium">{dosage.max_daily_dose}</p></div>
                  <div><span className="text-xs text-muted-foreground">Frequency</span><p className="font-medium">{dosage.frequency}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeInfoTab === 'interactions' && (
          <div className="space-y-3">
            {drug.interactions?.map((interaction, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${
                interaction.severity === 'severe' ? 'border-red-500/30 bg-red-500/5' :
                interaction.severity === 'moderate' ? 'border-amber-500/30 bg-amber-500/5' :
                'border-border/50 bg-card/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{interaction.interacting_drug_name}</span>
                  <Badge variant="outline" className={
                    interaction.severity === 'severe' ? 'bg-red-500/20 text-red-500' :
                    interaction.severity === 'moderate' ? 'bg-amber-500/20 text-amber-500' : ''
                  }>{interaction.severity}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{interaction.effect}</p>
                {interaction.clinical_note && (
                  <p className="text-xs text-muted-foreground mt-2 italic">💡 {interaction.clinical_note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DrugsPage;
