import React from 'react';
import { Heart, Activity, Droplets, Thermometer, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Progress } from './ui/progress';

const OrganPanel = ({ selectedOrgan, physiologicalState }) => {
  const organData = {
    heart: {
      name: 'Cardiovascular System',
      icon: <Heart className="w-5 h-5 text-secondary" />,
      metrics: [
        { label: 'Heart Rate', value: physiologicalState?.heart_rate, unit: 'bpm', min: 60, max: 100, normal: 70 },
        { label: 'Cardiac Output', value: physiologicalState?.cardiac_output, unit: 'L/min', min: 4, max: 8, normal: 5 },
        { label: 'Stroke Volume', value: physiologicalState?.stroke_volume, unit: 'mL', min: 60, max: 100, normal: 70 },
        { label: 'Systolic BP', value: physiologicalState?.systolic_bp, unit: 'mmHg', min: 90, max: 140, normal: 120 },
        { label: 'Diastolic BP', value: physiologicalState?.diastolic_bp, unit: 'mmHg', min: 60, max: 90, normal: 80 }
      ],
      linkedEquations: ['frank_starling', 'windkessel', 'cardiac_output']
    },
    lungs: {
      name: 'Respiratory System',
      icon: <Activity className="w-5 h-5 text-primary" />,
      metrics: [
        { label: 'SpO2', value: physiologicalState?.oxygen_saturation, unit: '%', min: 95, max: 100, normal: 98 },
        { label: 'Respiratory Rate', value: physiologicalState?.respiratory_rate, unit: '/min', min: 12, max: 20, normal: 14 },
        { label: 'Tidal Volume', value: physiologicalState?.tidal_volume, unit: 'mL', min: 400, max: 600, normal: 500 },
        { label: 'PaO2', value: physiologicalState?.pao2, unit: 'mmHg', min: 80, max: 100, normal: 95 },
        { label: 'PaCO2', value: physiologicalState?.paco2, unit: 'mmHg', min: 35, max: 45, normal: 40 }
      ],
      linkedEquations: ['gas_exchange', 'vq_matching']
    },
    kidney: {
      name: 'Renal System',
      icon: <Droplets className="w-5 h-5 text-chart-4" />,
      metrics: [
        { label: 'GFR', value: physiologicalState?.gfr, unit: 'mL/min', min: 60, max: 120, normal: 100 },
        { label: 'Creatinine', value: physiologicalState?.creatinine, unit: 'mg/dL', min: 0.7, max: 1.3, normal: 1.0 },
        { label: 'BUN', value: physiologicalState?.bun, unit: 'mg/dL', min: 7, max: 20, normal: 15 },
        { label: 'Urine Output', value: physiologicalState?.urine_output, unit: 'mL/day', min: 800, max: 2000, normal: 1500 }
      ],
      linkedEquations: ['gfr_autoregulation', 'creatinine_clearance']
    },
    liver: {
      name: 'Hepatic System',
      icon: <Zap className="w-5 h-5 text-chart-3" />,
      metrics: [
        { label: 'ALT', value: physiologicalState?.alt, unit: 'U/L', min: 7, max: 56, normal: 30 },
        { label: 'AST', value: physiologicalState?.ast, unit: 'U/L', min: 8, max: 48, normal: 25 },
        { label: 'Albumin', value: physiologicalState?.albumin, unit: 'g/dL', min: 3.5, max: 5.0, normal: 4.0 },
        { label: 'Bilirubin', value: physiologicalState?.bilirubin, unit: 'mg/dL', min: 0.1, max: 1.2, normal: 0.8 }
      ],
      linkedEquations: ['hepatic_clearance', 'one_compartment']
    },
    pancreas: {
      name: 'Glucose-Insulin System',
      icon: <Activity className="w-5 h-5 text-chart-5" />,
      metrics: [
        { label: 'Glucose', value: physiologicalState?.glucose, unit: 'mg/dL', min: 70, max: 100, normal: 90 },
        { label: 'Insulin', value: physiologicalState?.insulin, unit: 'μU/mL', min: 2, max: 25, normal: 10 },
        { label: 'HbA1c', value: physiologicalState?.hba1c, unit: '%', min: 4.0, max: 5.7, normal: 5.5 }
      ],
      linkedEquations: ['bergman_model']
    },
    brain: {
      name: 'Neurological System',
      icon: <Activity className="w-5 h-5 text-accent" />,
      metrics: [
        { label: 'Temperature', value: physiologicalState?.temperature, unit: '°C', min: 36.5, max: 37.5, normal: 37.0 },
        { label: 'Heart Rate', value: physiologicalState?.heart_rate, unit: 'bpm', min: 60, max: 100, normal: 70 }
      ],
      linkedEquations: ['heat_balance']
    }
  };

  const currentOrgan = organData[selectedOrgan] || organData.heart;

  const getValueStatus = (value, min, max) => {
    if (value < min) return 'low';
    if (value > max) return 'high';
    return 'normal';
  };

  const getProgressValue = (value, min, max) => {
    const range = max - min;
    return Math.min(100, Math.max(0, ((value - min) / range) * 100));
  };

  const StatusIcon = ({ status }) => {
    if (status === 'low') return <TrendingDown className="w-4 h-4 text-blue-400" />;
    if (status === 'high') return <TrendingUp className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-green-400" />;
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          {currentOrgan.icon}
        </div>
        <div>
          <h3 className="font-manrope font-semibold">{currentOrgan.name}</h3>
          <p className="text-xs text-muted-foreground">
            {currentOrgan.metrics.length} parameters monitored
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {currentOrgan.metrics.map((metric, i) => {
          const status = getValueStatus(metric.value, metric.min, metric.max);
          const progress = getProgressValue(metric.value, metric.min, metric.max);
          
          return (
            <div
              key={i}
              className={`p-4 rounded-lg border transition-colors ${
                status === 'normal'
                  ? 'bg-white/5 border-white/10'
                  : status === 'high'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}
              data-testid={`metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{metric.label}</span>
                <StatusIcon status={status} />
              </div>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-mono font-bold">
                  {metric.value?.toFixed(1) || '--'}
                </span>
                <span className="text-xs text-muted-foreground">{metric.unit}</span>
              </div>
              
              <Progress
                value={progress}
                className={`h-1.5 ${
                  status === 'high' ? 'bg-red-900' : status === 'low' ? 'bg-blue-900' : ''
                }`}
              />
              
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{metric.min}</span>
                <span className="text-foreground/50">{metric.normal}</span>
                <span>{metric.max}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Linked Equations */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-muted-foreground mb-2">Linked Equations</p>
        <div className="flex flex-wrap gap-2">
          {currentOrgan.linkedEquations.map((eq, i) => (
            <span
              key={i}
              className="px-2 py-1 rounded bg-white/5 text-xs font-mono text-primary cursor-pointer hover:bg-primary/20 transition-colors"
            >
              {eq}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganPanel;
