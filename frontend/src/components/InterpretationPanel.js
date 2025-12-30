import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Progress } from './ui/progress';

const InterpretationPanel = ({ simulationResults, physiologicalState, selectedSystem }) => {
  const getSystemInterpretation = () => {
    if (!physiologicalState) return null;

    const interpretations = {
      cardiovascular: {
        summary: "Cardiovascular system functioning within normal parameters.",
        keyDrivers: [
          { name: "Preload (EDV)", value: 75, unit: "%" },
          { name: "Afterload (SVR)", value: 60, unit: "%" },
          { name: "Contractility", value: 85, unit: "%" }
        ],
        status: physiologicalState.heart_rate > 100 ? 'warning' : 'normal',
        metrics: [
          { label: "Cardiac Output", value: physiologicalState.cardiac_output, unit: "L/min", normal: "4-8" },
          { label: "Heart Rate", value: physiologicalState.heart_rate, unit: "bpm", normal: "60-100" },
          { label: "Blood Pressure", value: `${physiologicalState.systolic_bp}/${physiologicalState.diastolic_bp}`, unit: "mmHg", normal: "120/80" }
        ]
      },
      respiratory: {
        summary: "Respiratory function optimal. Gas exchange efficient.",
        keyDrivers: [
          { name: "Ventilation", value: 90, unit: "%" },
          { name: "Perfusion", value: 88, unit: "%" },
          { name: "Diffusion", value: 95, unit: "%" }
        ],
        status: 'normal',
        metrics: [
          { label: "SpO2", value: physiologicalState.oxygen_saturation, unit: "%", normal: "95-100" },
          { label: "RR", value: physiologicalState.respiratory_rate, unit: "/min", normal: "12-20" },
          { label: "PaO2", value: physiologicalState.pao2, unit: "mmHg", normal: "80-100" }
        ]
      },
      renal: {
        summary: "Renal filtration within expected range.",
        keyDrivers: [
          { name: "Glomerular pressure", value: 70, unit: "%" },
          { name: "Tubular function", value: 85, unit: "%" },
          { name: "Autoregulation", value: 90, unit: "%" }
        ],
        status: physiologicalState.gfr < 60 ? 'warning' : 'normal',
        metrics: [
          { label: "GFR", value: physiologicalState.gfr, unit: "mL/min", normal: "90-120" },
          { label: "Creatinine", value: physiologicalState.creatinine, unit: "mg/dL", normal: "0.7-1.3" },
          { label: "BUN", value: physiologicalState.bun, unit: "mg/dL", normal: "7-20" }
        ]
      },
      glucose_insulin: {
        summary: "Glucose-insulin dynamics balanced.",
        keyDrivers: [
          { name: "Insulin sensitivity", value: 80, unit: "%" },
          { name: "Beta cell function", value: 90, unit: "%" },
          { name: "Hepatic output", value: 75, unit: "%" }
        ],
        status: physiologicalState.glucose > 126 ? 'warning' : 'normal',
        metrics: [
          { label: "Glucose", value: physiologicalState.glucose, unit: "mg/dL", normal: "70-100" },
          { label: "Insulin", value: physiologicalState.insulin, unit: "μU/mL", normal: "2-25" },
          { label: "HbA1c", value: physiologicalState.hba1c, unit: "%", normal: "<5.7" }
        ]
      }
    };

    return interpretations[selectedSystem] || interpretations.cardiovascular;
  };

  const interpretation = getSystemInterpretation();

  // Drug simulation results interpretation
  const getDrugInterpretation = () => {
    if (!simulationResults) return null;

    return {
      drug: simulationResults.drug,
      concentration: simulationResults.estimated_concentration?.toFixed(2),
      changes: simulationResults.attributions?.map(attr => ({
        mechanism: attr.mechanism,
        target: attr.target,
        change: attr.change?.toFixed(2),
        contribution: attr.percent_contribution?.toFixed(1)
      })) || [],
      warnings: simulationResults.warnings || []
    };
  };

  const drugResults = getDrugInterpretation();

  if (!interpretation) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Select a system to view interpretation
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Status Banner */}
      <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
        interpretation.status === 'warning' 
          ? 'bg-yellow-500/10 text-yellow-500' 
          : 'bg-green-500/10 text-green-500'
      }`}>
        {interpretation.status === 'warning' ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {interpretation.status === 'warning' ? 'Attention Required' : 'Normal Function'}
        </span>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Summary</h4>
        <p className="text-sm">{interpretation.summary}</p>
      </div>

      {/* Key Metrics */}
      <div className="mb-4">
        <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Key Metrics</h4>
        <div className="space-y-2">
          {interpretation.metrics.map((metric, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">
                  {metric.value} {metric.unit}
                </span>
                <span className="text-xs text-muted-foreground">({metric.normal})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Drivers */}
      <div className="mb-4">
        <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Contributing Factors</h4>
        <div className="space-y-3">
          {interpretation.keyDrivers.map((driver, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">{driver.name}</span>
                <span className="font-mono">{driver.value}{driver.unit}</span>
              </div>
              <Progress value={driver.value} className="h-1.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Drug Simulation Results */}
      {drugResults && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-auto pt-4 border-t border-white/10"
        >
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Drug Effect: {drugResults.drug}
          </h4>
          
          {drugResults.changes.length > 0 && (
            <div className="space-y-2">
              {drugResults.changes.slice(0, 3).map((change, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{change.mechanism}</span>
                  <span className={`font-mono ${parseFloat(change.change) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {parseFloat(change.change) > 0 ? '+' : ''}{change.change}
                  </span>
                </div>
              ))}
            </div>
          )}

          {drugResults.warnings.length > 0 && (
            <div className="mt-2 p-2 rounded bg-yellow-500/10 text-yellow-500 text-xs">
              {drugResults.warnings.join(', ')}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default InterpretationPanel;
