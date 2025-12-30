import React from 'react';
import { motion } from 'framer-motion';

const BodyMapClean = ({ systems, selectedSystem, onSystemSelect, equationChanges }) => {
  const systemPositions = {
    neural: { cx: 50, cy: 25 },
    respiratory: { cx: 50, cy: 55 },
    cardiovascular: { cx: 50, cy: 70 },
    hepatic: { cx: 60, cy: 85 },
    metabolic: { cx: 40, cy: 88 },
    renal: { cx: 50, cy: 100 }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* SVG Body */}
      <div className="flex-1 relative">
        <svg viewBox="0 0 100 150" className="w-full h-full max-h-[280px]">
          {/* Simple body outline */}
          <g stroke="currentColor" strokeWidth="0.5" fill="none" className="text-white/10">
            {/* Head */}
            <circle cx="50" cy="20" r="12" />
            {/* Neck */}
            <line x1="50" y1="32" x2="50" y2="40" />
            {/* Torso */}
            <path d="M 35 40 Q 30 50 30 80 L 35 115 Q 40 120 50 120 Q 60 120 65 115 L 70 80 Q 70 50 65 40 Z" />
            {/* Arms */}
            <path d="M 30 45 Q 20 55 15 75" />
            <path d="M 70 45 Q 80 55 85 75" />
            {/* Legs */}
            <path d="M 38 120 L 35 145" />
            <path d="M 62 120 L 65 145" />
          </g>

          {/* System indicators */}
          {Object.entries(systems).map(([id, system]) => {
            const pos = systemPositions[id];
            const isSelected = selectedSystem === id;
            const isAffected = equationChanges[id]?.affected;

            return (
              <g key={id}>
                {/* Glow effect for affected systems */}
                {isAffected && (
                  <circle
                    cx={pos.cx}
                    cy={pos.cy}
                    r="8"
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.5)"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                )}
                
                <motion.circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r="6"
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'fill-primary stroke-primary'
                      : isAffected
                      ? 'fill-red-500/50 stroke-red-500'
                      : 'fill-white/20 stroke-white/40 hover:fill-white/40'
                  }`}
                  strokeWidth="1"
                  onClick={() => onSystemSelect(id)}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  data-testid={`system-${id}`}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* System List */}
      <div className="space-y-1 mt-4">
        {Object.entries(systems).map(([id, system]) => {
          const isSelected = selectedSystem === id;
          const isAffected = equationChanges[id]?.affected;
          
          return (
            <button
              key={id}
              onClick={() => onSystemSelect(id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isSelected
                  ? 'bg-primary/20 text-primary'
                  : isAffected
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-white'
              }`}
              data-testid={`system-btn-${id}`}
            >
              <span className="text-lg">{system.icon}</span>
              <span className="flex-1 text-left">{system.name}</span>
              {isAffected && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BodyMapClean;
