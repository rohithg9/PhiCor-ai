import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { Progress } from './ui/progress';

const SystemSummary = ({ systems, selectedSystem, equationChanges, activeInfluence }) => {
  const getSystemStatus = (systemId) => {
    const change = equationChanges[systemId];
    if (!change?.affected) return 'normal';
    if (change.severity > 0.7) return 'critical';
    if (change.severity > 0.4) return 'warning';
    return 'mild';
  };

  const statusConfig = {
    normal: { label: 'Normal Function', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle },
    mild: { label: 'Mild Impact', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: TrendingDown },
    warning: { label: 'Moderate Impact', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: AlertTriangle },
    critical: { label: 'Severe Impact', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle }
  };

  // If a system is selected, show detailed view
  if (selectedSystem) {
    const system = systems[selectedSystem];
    const status = getSystemStatus(selectedSystem);
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className="space-y-4">
        {/* Status Header */}
        <div className={`p-4 rounded-xl ${config.bg}`}>
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`w-5 h-5 ${config.color}`} />
            <span className={`font-semibold ${config.color}`}>{config.label}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {status === 'normal'
              ? `${system.name} system functioning within normal parameters.`
              : `${system.name} system showing changes due to ${activeInfluence || 'applied influence'}.`
            }
          </p>
        </div>

        {/* Base Values */}
        <div>
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Key Parameters</h4>
          <div className="space-y-3">
            {Object.entries(system.baseValues).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Linked Systems */}
        {equationChanges[selectedSystem]?.affected && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Propagation to Other Systems</h4>
            <div className="space-y-2">
              {Object.entries(equationChanges)
                .filter(([id]) => id !== selectedSystem)
                .map(([id, change]) => (
                  <div key={id} className="flex items-center justify-between text-sm p-2 rounded bg-white/5">
                    <div className="flex items-center gap-2">
                      <span>{systems[id].icon}</span>
                      <span>{systems[id].name}</span>
                    </div>
                    <span className="text-xs text-red-400">
                      {(change.severity * 100).toFixed(0)}% affected
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    );
  }

  // Overview of all systems
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        System Status Overview
      </h3>

      {Object.entries(systems).map(([id, system]) => {
        const status = getSystemStatus(id);
        const config = statusConfig[status];
        const change = equationChanges[id];

        return (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg border transition-colors ${
              status === 'normal'
                ? 'border-white/10 bg-white/5'
                : `border-${status === 'critical' ? 'red' : status === 'warning' ? 'orange' : 'yellow'}-500/20 ${config.bg}`
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>{system.icon}</span>
                <span className="text-sm font-medium">{system.name}</span>
              </div>
              <span className={`text-xs ${config.color}`}>{config.label}</span>
            </div>
            
            {change?.affected && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Impact severity</span>
                  <span>{(change.severity * 100).toFixed(0)}%</span>
                </div>
                <Progress 
                  value={change.severity * 100} 
                  className="h-1.5" 
                />
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <h4 className="text-xs text-muted-foreground mb-3">Status Legend</h4>
        <div className="space-y-2">
          {Object.entries(statusConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
              <span className="text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      {!activeInfluence && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
          <p className="text-muted-foreground">
            Select an influence from the panel above to see how it affects the mathematical equations across all body systems.
          </p>
        </div>
      )}
    </div>
  );
};

export default SystemSummary;
