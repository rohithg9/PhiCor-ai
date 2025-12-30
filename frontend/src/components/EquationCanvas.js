import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Link2, Info } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const EquationCanvas = ({ selectedSystem, equations, physiologicalState }) => {
  const [expandedSections, setExpandedSections] = useState({
    cardiovascular: true,
    glucose_insulin: false,
    renal: false,
    pharmacokinetics: false,
    thermoregulation: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const systemLabels = {
    cardiovascular: 'Cardiovascular System',
    glucose_insulin: 'Glucose-Insulin Dynamics',
    renal: 'Renal System',
    pharmacokinetics: 'Pharmacokinetics',
    thermoregulation: 'Thermoregulation'
  };

  const systemIcons = {
    cardiovascular: '❤️',
    glucose_insulin: '🧬',
    renal: '🫘',
    pharmacokinetics: '💊',
    thermoregulation: '🌡️'
  };

  // Helper to convert equation strings to LaTeX format
  const formatEquation = (eq) => {
    return eq
      .replace(/×/g, ' \\times ')
      .replace(/·/g, ' \\cdot ')
      .replace(/₁/g, '_1')
      .replace(/₂/g, '_2')
      .replace(/₃/g, '_3')
      .replace(/ᵦ/g, '_b')
      .replace(/\^/g, '^')
      .replace(/γ/g, '\\gamma')
      .replace(/≥/g, '\\geq');
  };

  const substituteValues = (equation, variables, state) => {
    // Simple numeric substitution for demonstration
    let result = equation;
    if (state) {
      if (variables['SV'] && state.stroke_volume) {
        result = result.replace('SV', state.stroke_volume.toString());
      }
      if (variables['HR'] && state.heart_rate) {
        result = result.replace('HR', state.heart_rate.toString());
      }
    }
    return result;
  };

  if (!equations) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Loading equations...
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 pr-4">
        {Object.entries(equations).map(([systemKey, systemData]) => (
          <motion.div
            key={systemKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-lg border transition-colors ${
              selectedSystem === systemKey
                ? 'border-primary/50 bg-primary/5'
                : 'border-white/10 bg-white/5'
            }`}
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(systemKey)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              data-testid={`equation-section-${systemKey}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{systemIcons[systemKey] || '📐'}</span>
                <span className="font-manrope font-semibold text-sm">
                  {systemLabels[systemKey] || systemKey}
                </span>
                {selectedSystem === systemKey && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                    Active
                  </span>
                )}
              </div>
              {expandedSections[systemKey] ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* Equations */}
            <AnimatePresence>
              {expandedSections[systemKey] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-4">
                    {Object.entries(systemData).map(([eqKey, eqData]) => (
                      <div
                        key={eqKey}
                        className="p-4 rounded-lg bg-black/20 border border-white/5"
                        data-testid={`equation-${eqKey}`}
                      >
                        {/* Equation Name */}
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            {eqData.name}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-3 h-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-xs">{eqData.evidence?.join(', ')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </h4>
                          <button className="text-muted-foreground hover:text-primary transition-colors">
                            <Link2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Main Equation */}
                        <div className="bg-black/30 rounded-lg p-4 mb-3 overflow-x-auto">
                          <div className="font-mono text-primary">
                            {Array.isArray(eqData.equations) ? (
                              eqData.equations.map((eq, i) => (
                                <div key={i} className="mb-2 last:mb-0">
                                  <BlockMath math={formatEquation(eq)} />
                                </div>
                              ))
                            ) : eqData.equation ? (
                              <BlockMath math={formatEquation(eqData.equation)} />
                            ) : null}
                          </div>
                        </div>

                        {/* Variables */}
                        {eqData.variables && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                              Variables
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(eqData.variables).slice(0, 6).map(([varKey, varDesc]) => (
                                <div key={varKey} className="flex items-start gap-2">
                                  <code className="text-primary font-mono">{varKey}</code>
                                  <span className="text-muted-foreground truncate">{varDesc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Evidence */}
                        {eqData.evidence && (
                          <div className="mt-3 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Link2 className="w-3 h-3" />
                              <span>{eqData.evidence.join(' • ')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default EquationCanvas;
