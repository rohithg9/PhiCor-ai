import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Brain, Activity, Droplet, Flame, Shield, 
  Zap, Wind, Eye, Ear, ChevronRight, Info, X
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

/**
 * Enhanced Human Body Map with Neural Network Connections
 * 
 * Shows a human body silhouette with organs that can display:
 * - Parameter effects on each organ
 * - Connections between items (drugs, foods, conditions) and organs
 * - Animated flow showing impact paths
 * 
 * Props:
 * - effects: Array of { organ, parameter, change, value, unit }
 * - connections: Array of { source, organ, strength, effect }
 * - sourceLabel: Label for the source item (e.g., "Aspirin", "Apple")
 * - onOrganClick: Callback when organ is clicked
 * - showConnections: Whether to show connection lines
 * - mode: 'effects' | 'connections' | 'both'
 */

// Comprehensive organ definitions with anatomically correct positions
// Note: When viewing a body from the front, viewer's LEFT = patient's RIGHT
// cx values: < 100 = viewer's left (patient's right), > 100 = viewer's right (patient's left)
const ORGANS = {
  brain: {
    id: 'brain',
    name: 'Brain',
    icon: Brain,
    position: { cx: 100, cy: 35, r: 18 },
    color: '#8b5cf6',
    gradient: ['#a78bfa', '#7c3aed'],
    parameters: ['cognition', 'mood', 'memory', 'neurotransmitters', 'cerebral_blood_flow'],
    description: 'Central nervous system control center'
  },
  heart: {
    id: 'heart',
    name: 'Heart',
    icon: Heart,
    position: { cx: 105, cy: 100, r: 16 }, // Slightly left of center (patient's left)
    color: '#ef4444',
    gradient: ['#f87171', '#dc2626'],
    parameters: ['heart_rate', 'cardiac_output', 'blood_pressure', 'ejection_fraction', 'stroke_volume'],
    description: 'Cardiovascular pump and circulation'
  },
  lungs: {
    id: 'lungs',
    name: 'Lungs',
    icon: Wind,
    position: { cx: 70, cy: 95, r: 14, paired: true, cx2: 130 }, // Both sides
    color: '#3b82f6',
    gradient: ['#60a5fa', '#2563eb'],
    parameters: ['oxygen_saturation', 'respiratory_rate', 'fev1', 'lung_capacity', 'gas_exchange'],
    description: 'Respiratory gas exchange'
  },
  liver: {
    id: 'liver',
    name: 'Liver',
    icon: Activity,
    position: { cx: 75, cy: 135, r: 18 }, // Patient's RIGHT side (viewer's left)
    color: '#a855f7',
    gradient: ['#c084fc', '#9333ea'],
    parameters: ['alt', 'ast', 'bilirubin', 'albumin', 'inr', 'drug_metabolism'],
    description: 'Metabolism and detoxification'
  },
  kidneys: {
    id: 'kidneys',
    name: 'Kidneys',
    icon: Droplet,
    position: { cx: 75, cy: 155, r: 12, paired: true, cx2: 125 }, // Both sides
    color: '#f59e0b',
    gradient: ['#fbbf24', '#d97706'],
    parameters: ['gfr', 'creatinine', 'bun', 'electrolytes', 'urine_output'],
    description: 'Filtration and fluid balance'
  },
  pancreas: {
    id: 'pancreas',
    name: 'Pancreas',
    icon: Flame,
    position: { cx: 100, cy: 145, r: 10 }, // Behind stomach, center
    color: '#ec4899',
    gradient: ['#f472b6', '#db2777'],
    parameters: ['glucose', 'insulin', 'glucagon', 'amylase', 'lipase'],
    description: 'Blood sugar regulation'
  },
  stomach: {
    id: 'stomach',
    name: 'Stomach',
    icon: Activity,
    position: { cx: 115, cy: 130, r: 14 }, // Patient's LEFT side (viewer's right)
    color: '#22c55e',
    gradient: ['#4ade80', '#16a34a'],
    parameters: ['gastric_acid', 'motility', 'absorption', 'digestion_rate'],
    description: 'Digestion and absorption'
  },
  intestines: {
    id: 'intestines',
    name: 'Intestines',
    icon: Activity,
    position: { cx: 100, cy: 180, r: 16 }, // Center, lower abdomen
    color: '#14b8a6',
    gradient: ['#2dd4bf', '#0d9488'],
    parameters: ['absorption', 'motility', 'microbiome', 'inflammation'],
    description: 'Nutrient absorption and gut health'
  },
  thyroid: {
    id: 'thyroid',
    name: 'Thyroid',
    icon: Zap,
    position: { cx: 100, cy: 65, r: 8 }, // Neck, center
    color: '#06b6d4',
    gradient: ['#22d3ee', '#0891b2'],
    parameters: ['tsh', 't3', 't4', 'metabolism_rate', 'energy'],
    description: 'Metabolic rate regulation'
  },
  spleen: {
    id: 'spleen',
    name: 'Spleen',
    icon: Shield,
    position: { cx: 130, cy: 140, r: 10 }, // Patient's LEFT side (viewer's right)
    color: '#6366f1',
    gradient: ['#818cf8', '#4f46e5'],
    parameters: ['wbc', 'platelets', 'immune_function', 'blood_filtering'],
    description: 'Immune function and blood filtering'
  },
  bone_marrow: {
    id: 'bone_marrow',
    name: 'Bone Marrow',
    icon: Activity,
    position: { cx: 100, cy: 220, r: 12 },
    color: '#dc2626',
    gradient: ['#f87171', '#b91c1c'],
    parameters: ['rbc', 'wbc', 'platelets', 'hemoglobin', 'hematocrit'],
    description: 'Blood cell production'
  },
  muscles: {
    id: 'muscles',
    name: 'Muscles',
    icon: Activity,
    position: { cx: 55, cy: 180, r: 12, paired: true, cx2: 145 },
    color: '#ea580c',
    gradient: ['#fb923c', '#c2410c'],
    parameters: ['creatine_kinase', 'lactate', 'strength', 'endurance'],
    description: 'Movement and metabolism'
  },
  eyes: {
    id: 'eyes',
    name: 'Eyes',
    icon: Eye,
    position: { cx: 90, cy: 28, r: 6, paired: true, cx2: 110 },
    color: '#0ea5e9',
    gradient: ['#38bdf8', '#0284c7'],
    parameters: ['intraocular_pressure', 'visual_acuity', 'pupil_response'],
    description: 'Vision and eye health'
  }
};

// Get effect color based on change direction and magnitude
const getEffectColor = (change, magnitude) => {
  const normalizedMag = Math.min(100, Math.abs(magnitude || 0));
  const intensity = 0.5 + (normalizedMag / 200);
  
  if (change === 'increase' || change > 0) {
    return `rgba(239, 68, 68, ${intensity})`; // Red for increase
  } else if (change === 'decrease' || change < 0) {
    return `rgba(34, 197, 94, ${intensity})`; // Green for decrease
  }
  return `rgba(156, 163, 175, ${intensity})`; // Gray for neutral
};

// Get arrow direction indicator
const getChangeIndicator = (change) => {
  if (change === 'increase' || change > 0) return '↑';
  if (change === 'decrease' || change < 0) return '↓';
  return '→';
};

const EnhancedBodyMap = ({
  effects = [],
  connections = [],
  sourceLabel = '',
  onOrganClick,
  showConnections = true,
  mode = 'both',
  height = 450,
  isDark = true
}) => {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [hoveredOrgan, setHoveredOrgan] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Process effects by organ
  const effectsByOrgan = useMemo(() => {
    const byOrgan = {};
    effects.forEach(effect => {
      const organId = effect.organ?.toLowerCase().replace(/\s+/g, '_');
      if (!byOrgan[organId]) byOrgan[organId] = [];
      byOrgan[organId].push(effect);
    });
    return byOrgan;
  }, [effects]);
  
  // Process connections by organ
  const connectionsByOrgan = useMemo(() => {
    const byOrgan = {};
    connections.forEach(conn => {
      const organId = conn.organ?.toLowerCase().replace(/\s+/g, '_');
      if (!byOrgan[organId]) byOrgan[organId] = [];
      byOrgan[organId].push(conn);
    });
    return byOrgan;
  }, [connections]);
  
  // Get organ status based on effects
  const getOrganStatus = (organId) => {
    const organEffects = effectsByOrgan[organId] || [];
    const organConnections = connectionsByOrgan[organId] || [];
    
    if (organEffects.length === 0 && organConnections.length === 0) return 'neutral';
    
    const hasPositive = organEffects.some(e => e.effect === 'beneficial' || e.change === 'decrease');
    const hasNegative = organEffects.some(e => e.effect === 'harmful' || e.change === 'increase');
    
    if (hasNegative && !hasPositive) return 'warning';
    if (hasPositive && !hasNegative) return 'positive';
    return 'mixed';
  };
  
  // Calculate total impact on organ
  const getOrganImpact = (organId) => {
    const organEffects = effectsByOrgan[organId] || [];
    const organConnections = connectionsByOrgan[organId] || [];
    
    let totalStrength = 0;
    organEffects.forEach(e => totalStrength += Math.abs(e.magnitude || e.value || 10));
    organConnections.forEach(c => totalStrength += c.strength || 10);
    
    return Math.min(100, totalStrength);
  };
  
  const handleOrganClick = (organId) => {
    setSelectedOrgan(selectedOrgan === organId ? null : organId);
    if (onOrganClick) onOrganClick(ORGANS[organId]);
  };
  
  // Source position (center top - where connections originate)
  const sourcePos = { x: 100, y: -15 };
  
  const bgColor = isDark ? '#0f172a' : '#f8fafc';
  const lineColor = isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.2)';
  
  return (
    <div 
      className="relative rounded-xl overflow-hidden"
      style={{ backgroundColor: bgColor, height }}
    >
      {/* Header */}
      {sourceLabel && (
        <div className="absolute top-2 left-0 right-0 z-10 flex justify-center">
          <Badge 
            className="bg-emerald-600 text-white text-xs px-3 py-1"
            data-testid="body-map-source"
          >
            {sourceLabel} Impact Map
          </Badge>
        </div>
      )}
      
      <svg 
        viewBox="0 0 200 280" 
        className="w-full h-full"
        data-testid="enhanced-body-map-svg"
      >
        <defs>
          {/* Gradients for each organ */}
          {Object.values(ORGANS).map(organ => (
            <linearGradient 
              key={`grad-${organ.id}`} 
              id={`organ-gradient-${organ.id}`}
              x1="0%" y1="0%" x2="100%" y2="100%"
            >
              <stop offset="0%" stopColor={organ.gradient[0]} />
              <stop offset="100%" stopColor={organ.gradient[1]} />
            </linearGradient>
          ))}
          
          {/* Glow filter */}
          <filter id="organ-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Pulse animation */}
          <filter id="pulse-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Body outline */}
        <g stroke={lineColor} strokeWidth="1.5" fill="none">
          {/* Head */}
          <ellipse cx="100" cy="30" rx="22" ry="26" />
          {/* Neck */}
          <line x1="92" y1="56" x2="92" y2="68" />
          <line x1="108" y1="56" x2="108" y2="68" />
          {/* Torso */}
          <path d="M 70 68 Q 55 80 50 140 L 55 210 Q 70 225 100 225 Q 130 225 145 210 L 150 140 Q 145 80 130 68 Z" />
          {/* Arms */}
          <path d="M 50 75 Q 35 85 25 140 Q 22 155 28 165 L 35 165" strokeLinecap="round" />
          <path d="M 150 75 Q 165 85 175 140 Q 178 155 172 165 L 165 165" strokeLinecap="round" />
          {/* Legs */}
          <path d="M 75 225 L 65 270" strokeLinecap="round" />
          <path d="M 125 225 L 135 270" strokeLinecap="round" />
        </g>
        
        {/* Connection lines from source to affected organs */}
        {showConnections && sourceLabel && (
          <g className="connections">
            {Object.entries(ORGANS).map(([organId, organ]) => {
              const impact = getOrganImpact(organId);
              if (impact === 0) return null;
              
              const pos = organ.position;
              const status = getOrganStatus(organId);
              
              // Calculate connection color based on effect
              let strokeColor = '#6b7280';
              if (status === 'positive') strokeColor = '#22c55e';
              else if (status === 'warning') strokeColor = '#ef4444';
              else if (status === 'mixed') strokeColor = '#f59e0b';
              
              const strokeWidth = 1 + (impact / 50);
              const strokeOpacity = 0.3 + (impact / 200);
              
              return (
                <motion.path
                  key={`conn-${organId}`}
                  d={`M ${sourcePos.x} ${sourcePos.y} Q ${(sourcePos.x + pos.cx) / 2} ${(sourcePos.y + pos.cy) / 2 - 20} ${pos.cx} ${pos.cy}`}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  fill="none"
                  strokeDasharray={status === 'mixed' ? '4,4' : 'none'}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                />
              );
            })}
          </g>
        )}
        
        {/* Organs */}
        {Object.entries(ORGANS).map(([organId, organ]) => {
          const pos = organ.position;
          const impact = getOrganImpact(organId);
          const status = getOrganStatus(organId);
          const isSelected = selectedOrgan === organId;
          const isHovered = hoveredOrgan === organId;
          const isActive = isSelected || isHovered;
          const hasEffects = impact > 0;
          
          // Dynamic radius based on impact
          const baseRadius = pos.r;
          const dynamicRadius = hasEffects ? baseRadius + (impact / 20) : baseRadius;
          
          // Status ring color
          let ringColor = 'transparent';
          if (status === 'positive') ringColor = '#22c55e';
          else if (status === 'warning') ringColor = '#ef4444';
          else if (status === 'mixed') ringColor = '#f59e0b';
          
          return (
            <g key={organId}>
              {/* Main organ circle */}
              <motion.circle
                cx={pos.cx}
                cy={pos.cy}
                r={dynamicRadius}
                fill={`url(#organ-gradient-${organId})`}
                stroke={isActive ? '#ffffff' : organ.color}
                strokeWidth={isActive ? 2.5 : 1.5}
                className="cursor-pointer"
                onClick={() => handleOrganClick(organId)}
                onMouseEnter={() => setHoveredOrgan(organId)}
                onMouseLeave={() => setHoveredOrgan(null)}
                filter={isActive ? 'url(#organ-glow)' : undefined}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                data-testid={`organ-${organId}`}
              />
              
              {/* Status ring */}
              {hasEffects && (
                <motion.circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={dynamicRadius + 4}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth={2}
                  strokeDasharray={`${(impact / 100) * (2 * Math.PI * (dynamicRadius + 4))} ${2 * Math.PI * (dynamicRadius + 4)}`}
                  transform={`rotate(-90 ${pos.cx} ${pos.cy})`}
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1 }}
                />
              )}
              
              {/* Paired organ (lungs, kidneys, etc.) */}
              {pos.paired && pos.cx2 && (
                <>
                  <motion.circle
                    cx={pos.cx2}
                    cy={pos.cy}
                    r={dynamicRadius}
                    fill={`url(#organ-gradient-${organId})`}
                    stroke={isActive ? '#ffffff' : organ.color}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className="cursor-pointer"
                    onClick={() => handleOrganClick(organId)}
                    onMouseEnter={() => setHoveredOrgan(organId)}
                    onMouseLeave={() => setHoveredOrgan(null)}
                    filter={isActive ? 'url(#organ-glow)' : undefined}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                  />
                  {hasEffects && (
                    <motion.circle
                      cx={pos.cx2}
                      cy={pos.cy}
                      r={dynamicRadius + 4}
                      fill="none"
                      stroke={ringColor}
                      strokeWidth={2}
                      strokeDasharray={`${(impact / 100) * (2 * Math.PI * (dynamicRadius + 4))} ${2 * Math.PI * (dynamicRadius + 4)}`}
                      transform={`rotate(-90 ${pos.cx2} ${pos.cy})`}
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 1 }}
                    />
                  )}
                </>
              )}
              
              {/* Impact percentage label */}
              {isActive && hasEffects && (
                <g>
                  <rect
                    x={pos.cx - 14}
                    y={pos.cy + dynamicRadius + 3}
                    width={28}
                    height={14}
                    rx={7}
                    fill="rgba(0,0,0,0.8)"
                  />
                  <text
                    x={pos.cx}
                    y={pos.cy + dynamicRadius + 13}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {impact}%
                  </text>
                </g>
              )}
            </g>
          );
        })}
        
        {/* Organ labels on hover */}
        {hoveredOrgan && ORGANS[hoveredOrgan] && (
          <g>
            <rect
              x={ORGANS[hoveredOrgan].position.cx - 30}
              y={ORGANS[hoveredOrgan].position.cy - ORGANS[hoveredOrgan].position.r - 18}
              width={60}
              height={14}
              rx={7}
              fill="rgba(0,0,0,0.8)"
            />
            <text
              x={ORGANS[hoveredOrgan].position.cx}
              y={ORGANS[hoveredOrgan].position.cy - ORGANS[hoveredOrgan].position.r - 8}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="600"
            >
              {ORGANS[hoveredOrgan].name}
            </text>
          </g>
        )}
      </svg>
      
      {/* Organ details panel */}
      <AnimatePresence>
        {selectedOrgan && ORGANS[selectedOrgan] && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-10 right-2 w-56 p-3 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 z-20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ORGANS[selectedOrgan].color }}
                />
                <span className="text-sm font-semibold text-white">
                  {ORGANS[selectedOrgan].name}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedOrgan(null)}
                className="h-5 w-5 p-0 text-white/50 hover:text-white"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <p className="text-[10px] text-white/60 mb-2">
              {ORGANS[selectedOrgan].description}
            </p>
            
            {/* Effects list */}
            {effectsByOrgan[selectedOrgan]?.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Effects</div>
                <ScrollArea className="h-24">
                  {effectsByOrgan[selectedOrgan].map((effect, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between py-1 text-[10px] border-b border-white/5"
                    >
                      <span className="text-white/80">{effect.parameter}</span>
                      <div className="flex items-center gap-1">
                        <span 
                          className="font-bold"
                          style={{ color: getEffectColor(effect.change, effect.magnitude) }}
                        >
                          {getChangeIndicator(effect.change)}
                        </span>
                        {effect.value && (
                          <span className="text-white/60">
                            {effect.value}{effect.unit || ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
            
            {/* Connections list */}
            {connectionsByOrgan[selectedOrgan]?.length > 0 && (
              <div className="space-y-1 mt-2">
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Connections</div>
                <ScrollArea className="h-20">
                  {connectionsByOrgan[selectedOrgan].map((conn, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between py-1 text-[10px]"
                    >
                      <span className="text-white/80 truncate max-w-[100px]">{conn.source}</span>
                      <Badge 
                        variant="outline" 
                        className="text-[9px] border-white/20"
                        style={{ 
                          color: conn.effect === 'beneficial' ? '#22c55e' : 
                                 conn.effect === 'harmful' ? '#ef4444' : '#f59e0b'
                        }}
                      >
                        {conn.strength}%
                      </Badge>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
            
            {/* Parameters */}
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Key Parameters</div>
              <div className="flex flex-wrap gap-1">
                {ORGANS[selectedOrgan].parameters.slice(0, 5).map(param => (
                  <Badge 
                    key={param}
                    variant="outline"
                    className="text-[8px] bg-white/5 border-white/10 text-white/70"
                  >
                    {param.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 p-2 rounded-lg bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-[9px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-white/60">Beneficial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-white/60">Caution</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-white/60">Mixed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBodyMap;
