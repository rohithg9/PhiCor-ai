import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, Maximize2, Minimize2, ZoomIn, ZoomOut, 
  RefreshCw, Layers, RotateCcw, Move, Grid3X3,
  Info, X, Eye, EyeOff, Orbit, Box
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Slider } from './ui/slider';

/**
 * Clean 3D Neural Network Visualization
 * - Organized hierarchical layers
 * - Smooth zoom/pan/rotate
 * - Clean connection routing
 * - Interactive node selection
 */

const NODE_COLORS = {
  patient: { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
  symptom: { primary: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },
  lab: { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
  finding: { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
  syndrome: { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },
  diagnosis: { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
  organ: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
  parameter: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  condition: { primary: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)' },
  correlation: { primary: '#64748b', glow: 'rgba(100, 116, 139, 0.3)' },
};

const LAYER_ORDER = ['patient', 'condition', 'symptom', 'lab', 'finding', 'syndrome', 'organ', 'diagnosis'];

// Clean hierarchical layout with proper spacing
const calculateCleanLayout = (nodes, connections, width, height, rotation3D = 0) => {
  const positions = {};
  const padding = { top: 80, bottom: 60, left: 60, right: 60 };
  const usableWidth = width - padding.left - padding.right;
  const usableHeight = height - padding.top - padding.bottom;
  
  // Group nodes by type/layer
  const layers = {};
  LAYER_ORDER.forEach(type => { layers[type] = []; });
  
  nodes.forEach(node => {
    const type = node.type || 'parameter';
    if (layers[type]) {
      layers[type].push(node);
    } else if (layers.finding) {
      layers.finding.push(node);
    }
  });
  
  // Calculate layer positions (top to bottom)
  const activeTypes = LAYER_ORDER.filter(type => layers[type]?.length > 0);
  const layerHeight = usableHeight / Math.max(activeTypes.length, 1);
  
  activeTypes.forEach((type, layerIndex) => {
    const layerNodes = layers[type];
    const y = padding.top + layerIndex * layerHeight + layerHeight / 2;
    const nodeSpacing = usableWidth / (layerNodes.length + 1);
    
    layerNodes.forEach((node, nodeIndex) => {
      const baseX = padding.left + (nodeIndex + 1) * nodeSpacing;
      
      // Apply 3D rotation effect
      const rotationRad = (rotation3D * Math.PI) / 180;
      const centerX = width / 2;
      const depth = (layerIndex / activeTypes.length) * 100;
      
      // Simple 3D perspective transform
      const offsetX = Math.sin(rotationRad) * depth * 0.5;
      const scale = 1 - Math.abs(Math.sin(rotationRad)) * 0.15 * (layerIndex / activeTypes.length);
      
      positions[node.id] = {
        x: baseX + offsetX,
        y: y,
        z: depth,
        scale: Math.max(0.6, scale),
        layer: layerIndex
      };
    });
  });
  
  return positions;
};

// Calculate clean curved paths that don't overlap
const calculateCleanPath = (x1, y1, x2, y2, index, total) => {
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  
  // Offset curves to prevent overlap
  const curveOffset = total > 1 ? ((index - (total - 1) / 2) * 15) : 0;
  const controlX = (x1 + x2) / 2 + curveOffset;
  
  // Use quadratic bezier for smoother curves
  if (Math.abs(y2 - y1) < 20) {
    // Horizontal connection - add arc
    const arcHeight = 30 + Math.abs(curveOffset);
    return `M ${x1} ${y1} Q ${controlX} ${y1 - arcHeight} ${x2} ${y2}`;
  }
  
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
};

const NeuralNetworkVisualization = ({
  nodes = [],
  connections = [],
  centralNode = null,
  onNodeClick,
  title = 'Diagnostic Reasoning Map',
  showLegend = true,
  height = 550,
  isDark = true
}) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  
  // State for interactions
  const [dimensions, setDimensions] = useState({ width: 900, height });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation3D, setRotation3D] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isRotating, setIsRotating] = useState(false);
  
  // Update dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: rect.width, 
          height: isFullscreen ? window.innerHeight - 100 : height 
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height, isFullscreen]);
  
  // Calculate positions with current rotation
  const positions = useMemo(() => {
    return calculateCleanLayout(nodes, connections, dimensions.width, dimensions.height, rotation3D);
  }, [nodes, connections, dimensions, rotation3D]);
  
  // Group connections by source-target pairs for curve offsetting
  const processedConnections = useMemo(() => {
    const connectionGroups = {};
    
    connections.forEach((conn, idx) => {
      const key = [conn.source, conn.target].sort().join('-');
      if (!connectionGroups[key]) {
        connectionGroups[key] = [];
      }
      connectionGroups[key].push({ ...conn, originalIndex: idx });
    });
    
    const result = [];
    Object.values(connectionGroups).forEach(group => {
      group.forEach((conn, idx) => {
        result.push({
          ...conn,
          curveIndex: idx,
          curveTotal: group.length
        });
      });
    });
    
    return result;
  }, [connections]);
  
  // Highlighted elements
  const highlightedNodes = useMemo(() => {
    const active = hoveredNode || selectedNode;
    if (!active) return new Set();
    
    const connected = new Set([active]);
    connections.forEach(c => {
      if (c.source === active || c.target === active) {
        connected.add(c.source);
        connected.add(c.target);
      }
    });
    return connected;
  }, [hoveredNode, selectedNode, connections]);
  
  // Mouse handlers for pan
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(3, Math.max(0.3, z * delta)));
  }, []);
  
  // Reset view
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation3D(0);
  }, []);
  
  // Node types for legend
  const nodeTypes = useMemo(() => {
    return [...new Set(nodes.map(n => n.type))].filter(t => NODE_COLORS[t]);
  }, [nodes]);
  
  const getConnectionColor = (strength) => {
    if (strength >= 70) return '#ef4444';
    if (strength >= 50) return '#f97316';
    if (strength >= 30) return '#eab308';
    return '#6b7280';
  };
  
  return (
    <div 
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden select-none ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
      style={{ 
        backgroundColor: isDark ? '#0c0c18' : '#f8fafc',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        height: isFullscreen ? 'calc(100vh - 2rem)' : height,
      }}
    >
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <Network className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-sm">{title}</span>
          <Badge variant="outline" className="text-xs bg-black/40 border-white/20 text-white/90">
            {nodes.length} nodes • {connections.length} links
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Labels toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowLabels(!showLabels)}
            className={`h-7 px-2 ${showLabels ? 'text-cyan-400' : 'text-white/50'} hover:bg-white/10`}
            title="Toggle labels"
          >
            {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </Button>
          
          <div className="w-px h-5 bg-white/20 mx-1" />
          
          {/* Zoom controls */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}
            className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs text-white/60 w-12 text-center font-mono">{Math.round(zoom * 100)}%</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setZoom(z => Math.min(3, z + 0.2))}
            className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          
          <div className="w-px h-5 bg-white/20 mx-1" />
          
          {/* Reset */}
          <Button
            size="sm"
            variant="ghost"
            onClick={resetView}
            className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
            title="Reset view"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          
          {/* Fullscreen */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
      
      {/* 3D Rotation Slider */}
      <div className="absolute top-14 right-3 z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm">
        <Orbit className="w-3.5 h-3.5 text-white/50" />
        <div className="w-24">
          <Slider
            value={[rotation3D]}
            onValueChange={([val]) => setRotation3D(val)}
            min={-45}
            max={45}
            step={1}
            className="w-full"
          />
        </div>
        <span className="text-[10px] text-white/50 w-8">{rotation3D}°</span>
      </div>
      
      {/* SVG Canvas */}
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%"
        viewBox={`${-pan.x / zoom} ${-pan.y / zoom} ${dimensions.width / zoom} ${dimensions.height / zoom}`}
        className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ 
          background: isDark 
            ? 'radial-gradient(ellipse at 50% 30%, #1a1a2e 0%, #0c0c18 100%)'
            : 'radial-gradient(ellipse at 50% 30%, #ffffff 0%, #f1f5f9 100%)'
        }}
      >
        <defs>
          {/* Gradients for connections */}
          <linearGradient id="linkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Shadow filter */}
          <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
          </filter>
          
          {/* Arrow marker */}
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
          </marker>
        </defs>
        
        {/* Layer labels */}
        {LAYER_ORDER.filter(type => nodes.some(n => n.type === type)).map((type, idx) => {
          const layerNodes = nodes.filter(n => n.type === type);
          if (layerNodes.length === 0) return null;
          const firstNode = layerNodes[0];
          const pos = positions[firstNode?.id];
          if (!pos) return null;
          
          return (
            <g key={`layer-${type}`}>
              {/* Layer background line */}
              <line
                x1={30}
                y1={pos.y}
                x2={dimensions.width - 30}
                y2={pos.y}
                stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
                strokeWidth={40}
                strokeLinecap="round"
              />
              {/* Layer label */}
              <text
                x={20}
                y={pos.y}
                textAnchor="start"
                dominantBaseline="middle"
                fill={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                fontSize="10"
                fontWeight="500"
                style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {type}
              </text>
            </g>
          );
        })}
        
        {/* Connections */}
        <g className="connections">
          {processedConnections.map((conn, idx) => {
            const sourcePos = positions[conn.source];
            const targetPos = positions[conn.target];
            if (!sourcePos || !targetPos) return null;
            
            const isHighlighted = highlightedNodes.has(conn.source) && highlightedNodes.has(conn.target);
            const isActive = highlightedNodes.size === 0 || isHighlighted;
            const strength = conn.strength || 50;
            const color = getConnectionColor(strength);
            
            const path = calculateCleanPath(
              sourcePos.x, sourcePos.y,
              targetPos.x, targetPos.y,
              conn.curveIndex, conn.curveTotal
            );
            
            // Midpoint for label
            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2;
            
            return (
              <g key={`conn-${idx}`} opacity={isActive ? 1 : 0.15}>
                {/* Connection line */}
                <motion.path
                  d={path}
                  fill="none"
                  stroke={conn.isCorrelation ? '#475569' : color}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={conn.isCorrelation ? '4,4' : 'none'}
                  strokeOpacity={isActive ? 0.7 : 0.2}
                  markerEnd="url(#arrow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.01 }}
                />
                
                {/* Probability label */}
                {showLabels && isActive && strength !== undefined && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x={-16}
                      y={-9}
                      width={32}
                      height={18}
                      rx={9}
                      fill={isDark ? '#1e293b' : '#ffffff'}
                      stroke={color}
                      strokeWidth={1.5}
                    />
                    <text
                      x={0}
                      y={1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={color}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {conn.isCorrelation ? conn.label : `${strength}%`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
        
        {/* Nodes */}
        <g className="nodes">
          {nodes.map((node, idx) => {
            const pos = positions[node.id];
            if (!pos) return null;
            
            const colors = NODE_COLORS[node.type] || NODE_COLORS.parameter;
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;
            const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(node.id);
            const isCentral = node.id === centralNode || node.type === 'patient';
            
            const baseRadius = isCentral ? 32 : 22;
            const radius = baseRadius * (pos.scale || 1);
            const showDetail = isSelected || isHovered;
            
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isSelected ? 1.1 : 1,
                  opacity: isHighlighted ? 1 : 0.25
                }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(selectedNode === node.id ? null : node.id);
                  if (onNodeClick) onNodeClick(node);
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Shadow */}
                <ellipse
                  cx={pos.x + 3}
                  cy={pos.y + 4}
                  rx={radius}
                  ry={radius * 0.8}
                  fill="rgba(0,0,0,0.25)"
                />
                
                {/* Glow ring for selected/hovered */}
                {showDetail && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 6}
                    fill="none"
                    stroke={colors.glow}
                    strokeWidth={3}
                  />
                )}
                
                {/* Main circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={colors.primary}
                  stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={isSelected ? 2.5 : 1}
                  filter={showDetail ? 'url(#nodeGlow)' : 'url(#nodeShadow)'}
                />
                
                {/* Inner highlight */}
                <ellipse
                  cx={pos.x - radius * 0.25}
                  cy={pos.y - radius * 0.25}
                  rx={radius * 0.35}
                  ry={radius * 0.25}
                  fill="rgba(255,255,255,0.2)"
                />
                
                {/* Value arc */}
                {node.value !== undefined && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius - 3}
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth={2.5}
                    strokeDasharray={`${(node.value / 100) * (2 * Math.PI * (radius - 3))} ${2 * Math.PI * (radius - 3)}`}
                    transform={`rotate(-90 ${pos.x} ${pos.y})`}
                    strokeLinecap="round"
                  />
                )}
                
                {/* Label */}
                {showLabels && (
                  <text
                    x={pos.x}
                    y={pos.y - (node.value !== undefined ? 4 : 0)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize={isCentral ? 10 : 8}
                    fontWeight="600"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.label?.length > 12 ? `${node.label.substring(0, 10)}..` : node.label}
                  </text>
                )}
                
                {/* Value */}
                {showLabels && node.value !== undefined && (
                  <text
                    x={pos.x}
                    y={pos.y + 8}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.9)"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.value}%
                  </text>
                )}
                
                {/* Connection count badge */}
                {!isCentral && (
                  <g>
                    <circle
                      cx={pos.x + radius - 4}
                      cy={pos.y - radius + 4}
                      r={8}
                      fill={isDark ? '#1e293b' : '#fff'}
                      stroke={colors.primary}
                      strokeWidth={1.5}
                    />
                    <text
                      x={pos.x + radius - 4}
                      y={pos.y - radius + 4}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={colors.primary}
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {connections.filter(c => c.source === node.id || c.target === node.id).length}
                    </text>
                  </g>
                )}
              </motion.g>
            );
          })}
        </g>
      </svg>
      
      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
          <div className="text-[9px] text-white/50 mb-2 uppercase tracking-wider font-semibold">Node Types</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {nodeTypes.map(type => {
              const colors = NODE_COLORS[type];
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span className="text-[10px] text-white/70 capitalize">{type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Connection Legend */}
      <div className="absolute bottom-3 right-3 p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
        <div className="text-[9px] text-white/50 mb-2 uppercase tracking-wider font-semibold">Probability</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded bg-red-500" />
            <span className="text-[10px] text-white/60">70-100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 rounded bg-orange-500" />
            <span className="text-[10px] text-white/60">50-70%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 rounded bg-yellow-500" />
            <span className="text-[10px] text-white/60">30-50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 rounded bg-gray-500 opacity-50" />
            <span className="text-[10px] text-white/60">&lt;30%</span>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/50 text-[10px] text-white/40">
        <Move className="w-3 h-3 inline mr-1" />
        Drag to pan • Scroll to zoom • Slider to rotate 3D
      </div>
      
      {/* Selected Node Details Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-3 w-64 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 overflow-hidden"
          >
            {(() => {
              const node = nodes.find(n => n.id === selectedNode);
              if (!node) return null;
              
              const nodeConns = connections
                .filter(c => c.source === selectedNode || c.target === selectedNode)
                .sort((a, b) => (b.strength || 0) - (a.strength || 0));
              
              const colors = NODE_COLORS[node.type] || NODE_COLORS.parameter;
              
              return (
                <>
                  <div 
                    className="p-3 flex items-center justify-between"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}50, transparent)` }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: colors.primary }}
                      >
                        {node.value ?? '?'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white truncate max-w-[140px]">{node.label}</div>
                        <Badge className="text-[9px] mt-0.5" style={{ backgroundColor: colors.primary }}>
                          {node.type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedNode(null)}
                      className="h-6 w-6 p-0 text-white/50 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="p-3">
                    <div className="text-xs text-white/50 mb-2">
                      Connections ({nodeConns.length})
                    </div>
                    <ScrollArea className="h-40">
                      <div className="space-y-1.5">
                        {nodeConns.slice(0, 15).map((conn, i) => {
                          const otherId = conn.source === selectedNode ? conn.target : conn.source;
                          const other = nodes.find(n => n.id === otherId);
                          const otherColors = NODE_COLORS[other?.type] || NODE_COLORS.parameter;
                          const direction = conn.source === selectedNode ? '→' : '←';
                          
                          return (
                            <div 
                              key={i}
                              className="flex items-center justify-between p-1.5 rounded bg-white/5 hover:bg-white/10"
                              onClick={() => setSelectedNode(otherId)}
                            >
                              <div className="flex items-center gap-1.5">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: otherColors.primary }}
                                />
                                <span className="text-white/50 text-[10px]">{direction}</span>
                                <span className="text-white/80 text-xs truncate max-w-[100px]">
                                  {other?.label}
                                </span>
                              </div>
                              <span 
                                className="text-xs font-mono font-bold"
                                style={{ color: getConnectionColor(conn.strength) }}
                              >
                                {conn.strength || 0}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NeuralNetworkVisualization;
