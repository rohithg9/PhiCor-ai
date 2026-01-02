/**
 * Clinical Panels Components
 * Extracted from DashboardMultiScale.js for better maintainability
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Stethoscope, FlaskConical, FileImage, Pill,
  TrendingUp, TrendingDown, Activity, TestTube, Microscope, ScanLine
} from 'lucide-react';
import { Badge } from '../ui/badge';

/**
 * Clinical Insights Panel - Shows symptoms, lab tests, imaging, and treatments
 */
export const ClinicalInsightsPanel = ({ disease, severity }) => {
  const defaultSymptoms = [
    "Fatigue and weakness",
    "Shortness of breath on exertion",
    "Chest discomfort",
    "Palpitations",
    "Dizziness or lightheadedness"
  ];
  
  const getSymptoms = () => {
    const raw = disease?.clinicalPresentation?.symptoms;
    if (!raw) return defaultSymptoms;
    if (Array.isArray(raw)) {
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

/**
 * Clinical Data Panel - Extracts and displays clinical data from API parameter_modifications
 */
export const ClinicalDataPanel = ({ modifications, disease, severity }) => {
  if (!modifications || !disease) return null;
  
  // Extract clinical data from API parameter_modifications
  const extractClinicalData = () => {
    const vitalSigns = [];
    const labTests = [];
    const physicalExam = [];
    const dnaMarkers = [];
    const ecgFindings = [];
    const riskFactors = [];

    // Iterate through all organs in modifications
    Object.entries(modifications).forEach(([organId, organMods]) => {
      if (!organMods || typeof organMods !== 'object') return;
      
      Object.entries(organMods).forEach(([scaleId, scaleMods]) => {
        if (!scaleMods || typeof scaleMods !== 'object') return;
        
        const formatChange = (param) => {
          const change = param.change_percent || param.change || 0;
          const value = param.value ?? param.absolute;
          const direction = param.direction || (change >= 0 ? 'increase' : 'decrease');
          const unit = param.unit || '';
          const note = param.note || param.evidence || '';
          
          let changeStr = '';
          if (value !== undefined) {
            changeStr = String(value).includes('%') ? value : (change !== 0 ? `${change > 0 ? '+' : ''}${change}%` : value);
          } else if (change !== 0) {
            changeStr = `${change > 0 ? '+' : ''}${change}%`;
          }
          
          return { 
            change: changeStr, 
            direction, 
            unit, 
            note,
            isPresent: direction === 'present' || value === 1
          };
        };
        
        Object.entries(scaleMods).forEach(([paramId, paramData]) => {
          if (!paramData || typeof paramData !== 'object') return;
          
          const formatted = formatChange(paramData);
          const name = paramId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          if (scaleId === 'vital_signs' || scaleId === 'vitals') {
            vitalSigns.push({ name, ...formatted, organ: organId });
          } else if (scaleId === 'lab_tests' || scaleId === 'labs' || scaleId === 'cbc') {
            labTests.push({ name, ...formatted, organ: organId });
          } else if (scaleId === 'physical_exam') {
            physicalExam.push({ name, ...formatted, organ: organId });
          } else if (scaleId === 'dna' || scaleId === 'genetics' || scaleId === 'molecular') {
            dnaMarkers.push({ name, ...formatted, organ: organId });
          } else if (scaleId === 'ecg') {
            ecgFindings.push({ name, ...formatted, organ: organId });
          } else if (scaleId === 'risk_factors') {
            riskFactors.push({ name, ...formatted, organ: organId });
          }
        });
      });
    });
    
    return { vitalSigns, labTests, physicalExam, dnaMarkers, ecgFindings, riskFactors };
  };
  
  const clinicalData = extractClinicalData();
  
  // Check if we have any data to show
  const hasAnyData = Object.values(clinicalData).some(arr => arr.length > 0);
  
  if (!hasAnyData) {
    return (
      <div className="p-4 rounded-lg border border-border/50 bg-card/30 text-center">
        <p className="text-sm text-muted-foreground">No clinical data available for this condition</p>
        <p className="text-xs text-muted-foreground mt-1">Clinical parameters will appear here when available from the knowledge base</p>
      </div>
    );
  }

  const renderSection = (title, icon, data, colorClass = 'text-primary') => {
    if (!data || data.length === 0) return null;
    
    return (
      <div className="rounded-lg border border-border/50 bg-card/50 p-3">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
          {icon}
          {title}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.slice(0, 12).map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`text-xs p-2 rounded-md ${
                item.direction === 'increase' || item.isPresent
                  ? 'bg-destructive/10 border border-destructive/20' 
                  : item.direction === 'decrease'
                  ? 'bg-blue-500/10 border border-blue-500/20'
                  : 'bg-muted/50 border border-border/50'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-medium truncate">{item.name}</span>
                <span className={`shrink-0 flex items-center gap-0.5 ${
                  item.direction === 'increase' || item.isPresent ? 'text-destructive' : 
                  item.direction === 'decrease' ? 'text-blue-500' : 'text-muted-foreground'
                }`}>
                  {item.direction === 'increase' || item.isPresent ? <TrendingUp className="w-3 h-3" /> : 
                   item.direction === 'decrease' ? <TrendingDown className="w-3 h-3" /> : null}
                  {item.change}{item.unit ? ` ${item.unit}` : ''}
                </span>
              </div>
              {item.note && (
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{item.note}</p>
              )}
            </motion.div>
          ))}
        </div>
        {data.length > 12 && (
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            +{data.length - 12} more {title.toLowerCase()}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Clinical Parameters for {disease.name}
        </h3>
        <Badge variant="outline" className="text-xs">
          {severity < 0.33 ? 'Mild' : severity < 0.66 ? 'Moderate' : 'Severe'}
        </Badge>
      </div>
      
      {renderSection('Vital Signs', <Activity className="w-3 h-3" />, clinicalData.vitalSigns)}
      {renderSection('Laboratory Tests', <TestTube className="w-3 h-3" />, clinicalData.labTests)}
      {renderSection('Physical Examination', <Stethoscope className="w-3 h-3" />, clinicalData.physicalExam)}
      {renderSection('ECG Findings', <Activity className="w-3 h-3" />, clinicalData.ecgFindings)}
      {renderSection('DNA & Genetics', <Microscope className="w-3 h-3" />, clinicalData.dnaMarkers)}
      {renderSection('Risk Factors', <AlertTriangle className="w-3 h-3" />, clinicalData.riskFactors)}
    </div>
  );
};

export default { ClinicalInsightsPanel, ClinicalDataPanel };
