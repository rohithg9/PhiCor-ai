import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, ArrowRight, AlertTriangle } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const EquationView = ({ systems, selectedSystem, equationChanges, activeInfluence }) => {
  const [expandedSystems, setExpandedSystems] = React.useState(
    Object.keys(systems).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  const toggleSystem = (systemId) => {
    setExpandedSystems(prev => ({
      ...prev,
      [systemId]: !prev[systemId]
    }));
  };

  // Show all systems or just selected one
  const displaySystems = selectedSystem 
    ? { [selectedSystem]: systems[selectedSystem] }
    : systems;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-manrope text-2xl font-bold mb-2">
          {selectedSystem ? systems[selectedSystem].name + ' System' : 'All Body Systems'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {selectedSystem 
            ? `Governing equations for ${systems[selectedSystem].name.toLowerCase()} function`
            : 'Mathematical model of human physiology - select a system to focus'
          }
        </p>
        {activeInfluence && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Showing equation changes due to active influence</span>
          </div>
        )}
      </div>

      {/* Equations Grid */}
      <div className="space-y-6">
        {Object.entries(displaySystems).map(([systemId, system]) => {
          const isExpanded = expandedSystems[systemId];
          const changes = equationChanges[systemId];
          const isAffected = changes?.affected;

          return (
            <motion.div
              key={systemId}
              layout
              className={`rounded-xl border transition-colors ${
                isAffected
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {/* System Header */}
              <button
                onClick={() => toggleSystem(systemId)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors rounded-t-xl"
                data-testid={`equation-system-${systemId}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{system.icon}</span>
                  <div className="text-left">
                    <h3 className="font-semibold">{system.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {system.baseEquations.length} governing equations
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAffected && (
                    <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                      Modified
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Equations */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 grid gap-4">
                      {system.baseEquations.map((eq) => {
                        const modification = changes?.modifications?.[eq.id];
                        
                        return (
                          <div
                            key={eq.id}
                            className={`p-4 rounded-lg ${
                              modification
                                ? 'bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20'
                                : 'bg-black/20'
                            }`}
                            data-testid={`equation-${eq.id}`}
                          >
                            {/* Equation name */}
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium">{eq.name}</h4>
                              <span className="text-xs text-muted-foreground">{eq.description}</span>
                            </div>

                            {/* Base equation */}
                            <div className={`py-3 px-4 rounded bg-black/30 ${modification ? 'opacity-50' : ''}`}>
                              <BlockMath math={eq.latex} />
                            </div>

                            {/* Modified equation if influence applied */}
                            {modification && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3"
                              >
                                <div className="flex items-center gap-2 text-xs text-red-400 mb-2">
                                  <ArrowRight className="w-3 h-3" />
                                  <span>With influence applied ({modification.delta})</span>
                                </div>
                                <div className="py-3 px-4 rounded bg-red-500/10 border border-red-500/20">
                                  <BlockMath math={modification.latex} />
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Reference */}
      {!selectedSystem && (
        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Quick Reference</h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground mb-1">Total Equations</p>
              <p className="font-mono text-lg">{Object.values(systems).reduce((acc, s) => acc + s.baseEquations.length, 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Body Systems</p>
              <p className="font-mono text-lg">{Object.keys(systems).length}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Affected Systems</p>
              <p className="font-mono text-lg text-red-400">{Object.keys(equationChanges).length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquationView;
