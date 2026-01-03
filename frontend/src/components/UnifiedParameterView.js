import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { 
  ChevronDown, ChevronRight, AlertTriangle, TrendingUp, TrendingDown,
  Heart, Activity, Droplets, Brain, Bone, Microscope, Dna,
  TestTube, FileHeart, Zap, Layers, Target
} from 'lucide-react';
import { ORGAN_MODELS } from '../data/organModels';

// Icon mapping for organs
const ORGAN_ICONS = {
  heart: <Heart className="w-4 h-4" />,
  lungs: <Activity className="w-4 h-4" />,
  kidneys: <Droplets className="w-4 h-4" />,
  liver: <Target className="w-4 h-4" />,
  brain: <Brain className="w-4 h-4" />,
  blood: <Droplets className="w-4 h-4 text-red-500" />,
  cellular: <Dna className="w-4 h-4" />,
  pancreas: <Layers className="w-4 h-4" />,
  bonemarrow: <Bone className="w-4 h-4" />,
  default: <Microscope className="w-4 h-4" />
};

// Scale icons
const SCALE_ICONS = {
  geometry: '📐',
  pressures: '📊',
  structure: '🔬',
  physiology: '⚡',
  cellular: '🧬',
  lab_tests: '🧪',
  ecg: '💓',
  imaging: '📷',
  dna: '🧬',
  gene_expression: '📊',
  metabolism: '⚗️',
  cell_cycle: '🔄'
};

// Unified Parameter View - Shows ALL parameters for ALL organs
const UnifiedParameterView = ({ 
  selectedDisease, 
  currentDisease, 
  mergedModifications, 
  diseaseSeverity = 1,
  getModifiedValue,
  onOrganSelect,
  onScaleSelect 
}) => {
  const [expandedOrgans, setExpandedOrgans] = useState({ heart: true });
  const [expandedScales, setExpandedScales] = useState({});
  const [showOnlyAffected, setShowOnlyAffected] = useState(false);

  // Toggle organ expansion
  const toggleOrgan = (organId) => {
    setExpandedOrgans(prev => ({ ...prev, [organId]: !prev[organId] }));
  };

  // Toggle scale expansion
  const toggleScale = (organId, scaleId) => {
    const key = `${organId}-${scaleId}`;
    setExpandedScales(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate statistics for display
  const statistics = useMemo(() => {
    let totalParams = 0;
    let affectedParams = 0;
    const organStats = {};

    Object.entries(ORGAN_MODELS).forEach(([organId, organ]) => {
      let organTotal = 0;
      let organAffected = 0;
      const scaleStats = {};

      // Iterate through all scales for this organ
      Object.entries(organ).forEach(([scaleId, scaleData]) => {
        if (scaleData?.parameters && Array.isArray(scaleData.parameters)) {
          scaleStats[scaleId] = { total: scaleData.parameters.length, affected: 0 };
          organTotal += scaleData.parameters.length;
          
          // Check for modifications
          scaleData.parameters.forEach(param => {
            if (mergedModifications && getModifiedValue) {
              const mod = getModifiedValue(organId, scaleId, param.id, param.value);
              if (mod.modified) {
                scaleStats[scaleId].affected++;
                organAffected++;
                affectedParams++;
              }
            }
          });
        }
      });

      organStats[organId] = { total: organTotal, affected: organAffected, scales: scaleStats };
      totalParams += organTotal;
    });

    return { totalParams, affectedParams, organStats };
  }, [mergedModifications, getModifiedValue]);

  // Render a single parameter
  const renderParameter = (organId, scaleId, param) => {
    const mod = getModifiedValue ? getModifiedValue(organId, scaleId, param.id, param.value) : { value: param.value, modified: false };
    
    if (showOnlyAffected && !mod.modified) return null;

    return (
      <motion.div
        key={`${organId}-${scaleId}-${param.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-2 rounded-lg border transition-all ${
          mod.modified 
            ? 'bg-destructive/10 border-destructive/30' 
            : 'bg-card/50 border-border/50'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-medium truncate ${mod.modified ? 'text-destructive' : ''}`}>
                {param.name}
              </span>
              {mod.modified && (
                <Badge variant="destructive" className="text-[8px] px-1 py-0">
                  <AlertTriangle className="w-2 h-2 mr-0.5" />
                  Abnormal
                </Badge>
              )}
              {param.evidence === 'novel' && (
                <Badge variant="secondary" className="text-[8px] px-1 py-0">Novel</Badge>
              )}
            </div>
            
            <div className="flex items-baseline gap-1.5 mt-1">
              {mod.modified && (
                <span className="text-xs text-muted-foreground line-through">
                  {param.value}
                </span>
              )}
              <span className={`text-sm font-mono font-bold ${mod.modified ? 'text-destructive' : ''}`}>
                {typeof mod.value === 'number' ? mod.value.toFixed(1) : mod.value}
              </span>
              <span className="text-[10px] text-muted-foreground">{param.unit}</span>
              {mod.modified && mod.delta && (
                <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                  parseFloat(mod.delta) > 0 
                    ? 'bg-red-500/20 text-red-500' 
                    : 'bg-blue-500/20 text-blue-500'
                }`}>
                  {parseFloat(mod.delta) > 0 ? '↑' : '↓'}{Math.abs(parseFloat(mod.delta))}%
                </span>
              )}
            </div>
            
            <div className="text-[9px] text-muted-foreground mt-0.5">
              Normal: {param.range?.[0]} - {param.range?.[1]} {param.unit}
            </div>
          </div>
        </div>
        
        {mod.note && (
          <p className="text-[9px] text-destructive mt-1 bg-destructive/5 px-1.5 py-0.5 rounded">
            {mod.note}
          </p>
        )}
      </motion.div>
    );
  };

  // Render a scale section
  const renderScale = (organId, scaleId, scaleData) => {
    if (!scaleData?.parameters || !Array.isArray(scaleData.parameters)) return null;
    
    const stats = statistics.organStats[organId]?.scales[scaleId] || { total: 0, affected: 0 };
    const key = `${organId}-${scaleId}`;
    const isExpanded = expandedScales[key] !== false; // Default to expanded

    // Skip if showing only affected and none are affected
    if (showOnlyAffected && stats.affected === 0) return null;

    return (
      <div key={key} className="border-l-2 border-border/50 ml-4 pl-3 mb-2">
        <button
          onClick={() => toggleScale(organId, scaleId)}
          className="flex items-center gap-2 w-full text-left py-1 hover:bg-accent/50 rounded px-2 -ml-2"
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span className="text-sm">{SCALE_ICONS[scaleId] || '📋'}</span>
          <span className="text-xs font-medium flex-1">{scaleData.title || scaleId}</span>
          <Badge variant={stats.affected > 0 ? "destructive" : "outline"} className="text-[9px]">
            {stats.affected > 0 ? `${stats.affected}/${stats.total}` : stats.total}
          </Badge>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2 pl-2"
            >
              {scaleData.parameters.map(param => renderParameter(organId, scaleId, param))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render an organ section
  const renderOrgan = (organId, organ) => {
    const stats = statistics.organStats[organId] || { total: 0, affected: 0 };
    const isExpanded = expandedOrgans[organId];

    // Skip if showing only affected and none are affected
    if (showOnlyAffected && stats.affected === 0) return null;

    // Get all scales for this organ
    const scales = Object.entries(organ).filter(([key, value]) => 
      value?.parameters && Array.isArray(value.parameters)
    );

    if (scales.length === 0) return null;

    return (
      <div key={organId} className="border rounded-lg overflow-hidden mb-3">
        <button
          onClick={() => toggleOrgan(organId)}
          className={`flex items-center gap-3 w-full text-left p-3 transition-colors ${
            stats.affected > 0 
              ? 'bg-destructive/10 hover:bg-destructive/15' 
              : 'bg-card hover:bg-accent/50'
          }`}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="text-lg">{organ.icon || '🫀'}</span>
          <div className="flex-1">
            <span className="font-semibold text-sm">{organ.name}</span>
            <span className="text-xs text-muted-foreground ml-2">({scales.length} scales)</span>
          </div>
          <div className="flex items-center gap-2">
            {stats.affected > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {stats.affected} affected
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {stats.total} params
            </Badge>
          </div>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-background/50">
                {scales.map(([scaleId, scaleData]) => renderScale(organId, scaleId, scaleData))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with stats */}
      <div className="p-3 border-b bg-card/50 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm">
            {selectedDisease && currentDisease ? (
              <span className="text-destructive">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                {currentDisease.name}
              </span>
            ) : (
              'All Organ Parameters'
            )}
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {statistics.totalParams} total
            </Badge>
            {statistics.affectedParams > 0 && (
              <Badge variant="destructive" className="text-xs">
                {statistics.affectedParams} affected
              </Badge>
            )}
          </div>
        </div>
        
        {/* Filter toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={showOnlyAffected ? "destructive" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setShowOnlyAffected(!showOnlyAffected)}
            disabled={statistics.affectedParams === 0}
          >
            {showOnlyAffected ? 'Show All Parameters' : `Show Only Affected (${statistics.affectedParams})`}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => setExpandedOrgans(
              Object.keys(ORGAN_MODELS).reduce((acc, key) => ({ ...acc, [key]: true }), {})
            )}
          >
            Expand All
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => setExpandedOrgans({})}
          >
            Collapse All
          </Button>
        </div>
      </div>
      
      {/* Organ list */}
      <ScrollArea className="flex-1 p-3">
        {Object.entries(ORGAN_MODELS).map(([organId, organ]) => renderOrgan(organId, organ))}
      </ScrollArea>
    </div>
  );
};

export default UnifiedParameterView;
