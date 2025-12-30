import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, Stethoscope } from 'lucide-react';

const BodyMap = ({ selectedOrgan, onOrganSelect, physiologicalState }) => {
  const organs = [
    { id: 'brain', name: 'Brain', cx: 100, cy: 35, r: 18, color: 'accent' },
    { id: 'heart', name: 'Heart', cx: 100, cy: 115, r: 14, color: 'secondary' },
    { id: 'lungs', name: 'Lungs', cx: 75, cy: 110, r: 12, color: 'primary', cx2: 125 },
    { id: 'liver', name: 'Liver', cx: 115, cy: 150, r: 16, color: 'chart-3' },
    { id: 'kidney', name: 'Kidneys', cx: 85, cy: 165, r: 10, color: 'chart-4', cx2: 115 },
    { id: 'pancreas', name: 'Pancreas', cx: 100, cy: 175, r: 8, color: 'chart-5' }
  ];

  const getOrganStatus = (organId) => {
    if (!physiologicalState) return 'normal';
    
    const thresholds = {
      heart: { field: 'heart_rate', min: 60, max: 100 },
      kidney: { field: 'gfr', min: 60, max: 120 },
      liver: { field: 'alt', min: 7, max: 56 },
      pancreas: { field: 'glucose', min: 70, max: 100 }
    };
    
    const threshold = thresholds[organId];
    if (!threshold) return 'normal';
    
    const value = physiologicalState[threshold.field];
    if (value < threshold.min || value > threshold.max) return 'warning';
    return 'normal';
  };

  return (
    <div className="h-full flex flex-col">
      {/* SVG Body Outline */}
      <div className="flex-1 relative">
        <svg viewBox="0 0 200 350" className="w-full h-full max-h-[400px]">
          {/* Body outline */}
          <g stroke="currentColor" strokeWidth="1" fill="none" className="text-muted-foreground/30">
            {/* Head */}
            <ellipse cx="100" cy="35" rx="25" ry="30" />
            {/* Neck */}
            <line x1="90" y1="65" x2="90" y2="80" />
            <line x1="110" y1="65" x2="110" y2="80" />
            {/* Torso */}
            <path d="M 70 80 Q 60 90 55 140 L 60 200 Q 70 210 100 210 Q 130 210 140 200 L 145 140 Q 140 90 130 80 Z" />
            {/* Arms */}
            <path d="M 55 90 Q 40 100 30 150 Q 28 160 35 165" />
            <path d="M 145 90 Q 160 100 170 150 Q 172 160 165 165" />
            {/* Legs */}
            <path d="M 75 210 L 65 300 Q 63 310 70 315" />
            <path d="M 125 210 L 135 300 Q 137 310 130 315" />
          </g>

          {/* Organ highlights */}
          {organs.map((organ) => (
            <g key={organ.id}>
              <motion.circle
                cx={organ.cx}
                cy={organ.cy}
                r={organ.r}
                className={`cursor-pointer transition-colors ${
                  selectedOrgan === organ.id
                    ? 'fill-primary stroke-primary'
                    : getOrganStatus(organ.id) === 'warning'
                    ? 'fill-yellow-500/40 stroke-yellow-500'
                    : 'fill-white/10 stroke-white/30 hover:fill-primary/30 hover:stroke-primary'
                }`}
                strokeWidth="2"
                onClick={() => onOrganSelect(organ.id)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                data-testid={`organ-${organ.id}`}
              />
              {/* Second organ for paired organs */}
              {organ.cx2 && (
                <motion.circle
                  cx={organ.cx2}
                  cy={organ.cy}
                  r={organ.r}
                  className={`cursor-pointer transition-colors ${
                    selectedOrgan === organ.id
                      ? 'fill-primary stroke-primary'
                      : 'fill-white/10 stroke-white/30 hover:fill-primary/30 hover:stroke-primary'
                  }`}
                  strokeWidth="2"
                  onClick={() => onOrganSelect(organ.id)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                />
              )}
            </g>
          ))}

          {/* Labels */}
          {organs.map((organ) => (
            selectedOrgan === organ.id && (
              <text
                key={`label-${organ.id}`}
                x={organ.cx}
                y={organ.cy + organ.r + 15}
                textAnchor="middle"
                className="fill-foreground text-xs font-medium"
              >
                {organ.name}
              </text>
            )
          ))}
        </svg>
      </div>

      {/* Organ Legend */}
      <div className="mt-4 space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
          Select System
        </p>
        <div className="grid grid-cols-2 gap-2">
          {organs.slice(0, 4).map((organ) => (
            <button
              key={organ.id}
              onClick={() => onOrganSelect(organ.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                selectedOrgan === organ.id
                  ? 'bg-primary/20 text-primary'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
              data-testid={`organ-btn-${organ.id}`}
            >
              <span className={`w-2 h-2 rounded-full bg-${organ.color}`} />
              {organ.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      {physiologicalState && (
        <div className="mt-4 p-3 rounded-lg bg-white/5">
          <p className="text-xs text-muted-foreground mb-2">Active Vitals</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-secondary" />
              <span>{physiologicalState.heart_rate} bpm</span>
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-3 h-3 text-primary" />
              <span>{physiologicalState.systolic_bp}/{physiologicalState.diastolic_bp}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyMap;
