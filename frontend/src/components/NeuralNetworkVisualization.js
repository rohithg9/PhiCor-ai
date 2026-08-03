import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, Maximize2, Minimize2, ZoomIn, ZoomOut, 
  RefreshCw, GitBranch, Layers, Circle, Move,
  ChevronDown, Info, X
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

/**
 * Neural Network Visualization Component
 * 
 * Displays a mind map / neural network showing how different factors connect
 * to outcomes (diagnoses, effects, etc.) with connection strengths.
 * 
 * Props:
 * - nodes: Array of { id, label, type, category, value, color }
 * - connections: Array of { source, target, strength, label }
 * - centralNode: The main node ID to center the visualization on
 * - mode: 'radial' | 'force' | 'hierarchical' | 'tree'
 * - onNodeClick: Callback when a node is clicked
 * - title: Title for the visualization
 */

// Node type colors
const NODE_COLORS = {
  patient: { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' },
  symptom: { bg: '#f97316', border: '#ea580c', text: '#ffffff' },
  lab: { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' },
  finding: { bg: '#06b6d4', border: '#0891b2', text: '#ffffff' },
  diagnosis: { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
  organ: { bg: '#10b981', border: '#059669', text: '#ffffff' },
  drug: { bg: '#ec4899', border: '#db2777', text: '#ffffff' },
  food: { bg: '#84cc16', border: '#65a30d', text: '#ffffff' },
  parameter: { bg: '#f59e0b', border: '#d97706', text: '#ffffff' },
  modifier: { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' },
  condition: { bg: '#14b8a6', border: '#0d9488', text: '#ffffff' },
};

// Calculate positions for different layout modes
const calculateNodePositions = (nodes, connections, centralNodeId, mode, width, height) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const positions = {};
  
  // Find central node
  const centralNode = nodes.find(n => n.id === centralNodeId) || nodes[0];
  
  if (mode === 'radial') {
    // Radial layout - central node in middle, others arranged in circles
    positions[centralNode?.id] = { x: centerX, y: centerY };
    
    // Group nodes by their connection to central
    const directConnections = connections.filter(
      c => c.source === centralNodeId || c.target === centralNodeId
    );
    const directNodeIds = new Set(directConnections.map(c => 
      c.source === centralNodeId ? c.target : c.source
    ));
    
    // First ring - directly connected nodes
    const ring1Nodes = nodes.filter(n => n.id !== centralNodeId && directNodeIds.has(n.id));
    const ring1Radius = Math.min(width, height) * 0.3;
    ring1Nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / ring1Nodes.length - Math.PI / 2;
      positions[node.id] = {
        x: centerX + ring1Radius * Math.cos(angle),
        y: centerY + ring1Radius * Math.sin(angle)
      };
    });
    
    // Second ring - indirectly connected nodes
    const ring2Nodes = nodes.filter(n => n.id !== centralNodeId && !directNodeIds.has(n.id));
    const ring2Radius = Math.min(width, height) * 0.45;
    ring2Nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / ring2Nodes.length - Math.PI / 4;
      positions[node.id] = {
        x: centerX + ring2Radius * Math.cos(angle),
        y: centerY + ring2Radius * Math.sin(angle)
      };
    });
  } else if (mode === 'hierarchical') {
    // Hierarchical layout - patient/input at top, outcomes at bottom
    const levels = {};
    const nodeTypes = ['patient', 'modifier', 'condition', 'symptom', 'lab', 'finding', 'parameter', 'organ', 'diagnosis', 'drug', 'food'];
    
    nodes.forEach(node => {
      const typeIndex = nodeTypes.indexOf(node.type) || 0;
      const level = Math.floor(typeIndex / 3);
      if (!levels[level]) levels[level] = [];
      levels[level].push(node);
    });
    
    Object.keys(levels).forEach(level => {
      const levelNodes = levels[level];
      const y = 80 + (parseInt(level) * (height - 160) / (Object.keys(levels).length || 1));
      levelNodes.forEach((node, i) => {
        const x = (width / (levelNodes.length + 1)) * (i + 1);
        positions[node.id] = { x, y };
      });
    });
  } else if (mode === 'tree') {
    // Tree layout - branching from top
    positions[centralNode?.id] = { x: centerX, y: 60 };
    
    const processedNodes = new Set([centralNode?.id]);
    let currentLevel = [centralNode];
    let levelY = 140;
    
    while (currentLevel.length > 0 && levelY < height - 60) {
      const nextLevel = [];
      
      currentLevel.forEach(parentNode => {
        const children = connections
          .filter(c => c.source === parentNode?.id || c.target === parentNode?.id)
          .map(c => c.source === parentNode?.id ? c.target : c.source)
          .filter(id => !processedNodes.has(id));
        
        children.forEach((childId, i) => {
          const parentPos = positions[parentNode?.id] || { x: centerX, y: levelY - 80 };
          const spread = Math.min(200, width / (children.length + 1));
          positions[childId] = {
            x: parentPos.x + (i - (children.length - 1) / 2) * spread,
            y: levelY
          };
          processedNodes.add(childId);
          nextLevel.push(nodes.find(n => n.id === childId));
        });
      });
      
      currentLevel = nextLevel.filter(Boolean);
      levelY += 100;
    }
    
    // Position any remaining unconnected nodes
    nodes.forEach((node, i) => {
      if (!positions[node.id]) {
        positions[node.id] = {
          x: 60 + (i % 5) * 100,
          y: height - 80
        };
      }
    });
  } else {
    // Force-directed (simplified)
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length;
      const radius = Math.min(width, height) * 0.35;
      positions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    positions[centralNode?.id] = { x: centerX, y: centerY };
  }
  
  return positions;
};

// Connection strength to visual properties
const getConnectionStyle = (strength) => {
  const normalizedStrength = Math.min(100, Math.max(0, strength || 0));
  const opacity = 0.3 + (normalizedStrength / 100) * 0.7;
  const strokeWidth = 1 + (normalizedStrength / 100) * 4;
  
  // Color based on strength
  let color;
  if (normalizedStrength >= 80) color = '#ef4444'; // Red - very strong
  else if (normalizedStrength >= 60) color = '#f97316'; // Orange - strong
  else if (normalizedStrength >= 40) color = '#eab308'; // Yellow - moderate
  else if (normalizedStrength >= 20) color = '#22c55e'; // Green - weak
  else color = '#6b7280'; // Gray - very weak
  
  return { opacity, strokeWidth, color };
};

const NeuralNetworkVisualization = ({
  nodes = [],
  connections = [],
  centralNode = null,
  mode = 'radial',
  onNodeClick,
  title = 'Neural Network Map',
  showLegend = true,
  height = 500,
  isDark = true
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const [activeMode, setActiveMode] = useState(mode);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height: isFullscreen ? window.innerHeight - 100 : height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height, isFullscreen]);
  
  // Calculate node positions
  const positions = useMemo(() => {
    return calculateNodePositions(
      nodes, 
      connections, 
      centralNode || nodes[0]?.id, 
      activeMode, 
      dimensions.width, 
      dimensions.height
    );
  }, [nodes, connections, centralNode, activeMode, dimensions]);
  
  // Get connections for selected/hovered node
  const highlightedConnections = useMemo(() => {
    const activeNodeId = hoveredNode || selectedNode;
    if (!activeNodeId) return new Set();
    
    return new Set(
      connections
        .filter(c => c.source === activeNodeId || c.target === activeNodeId)
        .flatMap(c => [c.source, c.target])
    );
  }, [hoveredNode, selectedNode, connections]);
  
  const handleNodeClick = (node) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
    if (onNodeClick) onNodeClick(node);
  };
  
  const modeOptions = [
    { id: 'radial', label: 'Radial', icon: Circle },
    { id: 'hierarchical', label: 'Hierarchical', icon: Layers },
    { id: 'tree', label: 'Tree', icon: GitBranch },
    { id: 'force', label: 'Force', icon: Network },
  ];
  
  // Get unique node types for legend
  const nodeTypes = useMemo(() => {
    return [...new Set(nodes.map(n => n.type))];
  }, [nodes]);
  
  const bgColor = isDark ? '#1a1a2e' : '#f8fafc';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const borderColor = isDark ? '#374151' : '#e2e8f0';
  
  return (
    <div 
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
      style={{ 
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        height: isFullscreen ? 'calc(100vh - 2rem)' : height
      }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-white text-sm">{title}</span>
          <Badge variant="outline" className="text-xs bg-black/30 border-white/20 text-white">
            {nodes.length} nodes • {connections.length} connections
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Mode selector */}
          {modeOptions.map(opt => (
            <Button
              key={opt.id}
              size="sm"
              variant={activeMode === opt.id ? "default" : "ghost"}
              onClick={() => setActiveMode(opt.id)}
              className={`h-7 px-2 ${activeMode === opt.id ? 'bg-emerald-600' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              title={opt.label}
            >
              <opt.icon className="w-3.5 h-3.5" />
            </Button>
          ))}
          
          <div className="w-px h-5 bg-white/20 mx-1" />
          
          {/* Zoom controls */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
            className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs text-white/50 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setZoom(z => Math.min(2, z + 0.1))}
            className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
            title="Reset view"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
      
      {/* SVG Visualization */}
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`${-pan.x} ${-pan.y} ${dimensions.width / zoom} ${dimensions.height / zoom}`}
        className="cursor-grab active:cursor-grabbing"
        data-testid="neural-network-svg"
      >
        <defs>
          {/* Arrow marker for directed connections */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
          
          {/* Glow filter for nodes */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Connections */}
        <g className="connections">
          {connections.map((conn, i) => {
            const sourcePos = positions[conn.source];
            const targetPos = positions[conn.target];
            
            if (!sourcePos || !targetPos) return null;
            
            const style = getConnectionStyle(conn.strength);
            const isHighlighted = highlightedConnections.has(conn.source) && highlightedConnections.has(conn.target);
            const isActive = hoveredNode === conn.source || hoveredNode === conn.target || 
                           selectedNode === conn.source || selectedNode === conn.target;
            
            // Calculate midpoint for label
            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2;
            
            return (
              <g key={`conn-${i}`}>
                <motion.line
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={isActive ? style.color : (isDark ? '#4b5563' : '#9ca3af')}
                  strokeWidth={isActive ? style.strokeWidth : 1}
                  strokeOpacity={isActive ? style.opacity : 0.3}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                />
                
                {/* Strength label */}
                {isActive && conn.strength && (
                  <g>
                    <rect
                      x={midX - 18}
                      y={midY - 10}
                      width={36}
                      height={20}
                      rx={4}
                      fill={style.color}
                      fillOpacity={0.9}
                    />
                    <text
                      x={midX}
                      y={midY + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {conn.strength}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
        
        {/* Nodes */}
        <g className="nodes">
          {nodes.map((node, i) => {
            const pos = positions[node.id];
            if (!pos) return null;
            
            const colors = NODE_COLORS[node.type] || NODE_COLORS.parameter;
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;
            const isHighlighted = highlightedConnections.has(node.id);
            const isCentral = node.id === centralNode;
            
            const nodeRadius = isCentral ? 35 : (node.value ? 20 + Math.min(node.value / 5, 15) : 25);
            const showFull = isSelected || isHovered || isCentral;
            
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isSelected ? 1.2 : 1, 
                  opacity: (highlightedConnections.size === 0 || isHighlighted) ? 1 : 0.3 
                }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                filter={isSelected ? 'url(#glow)' : undefined}
              >
                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={colors.bg}
                  stroke={isSelected ? '#ffffff' : colors.border}
                  strokeWidth={isSelected ? 3 : 2}
                />
                
                {/* Inner ring for value indication */}
                {node.value && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius - 5}
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={2}
                    strokeDasharray={`${(node.value / 100) * (2 * Math.PI * (nodeRadius - 5))} ${2 * Math.PI * (nodeRadius - 5)}`}
                    transform={`rotate(-90 ${pos.x} ${pos.y})`}
                  />
                )}
                
                {/* Node label */}
                <text
                  x={pos.x}
                  y={pos.y + (showFull ? -5 : 0)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={colors.text}
                  fontSize={isCentral ? 12 : 10}
                  fontWeight="600"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.label?.length > 12 ? `${node.label.substring(0, 10)}...` : node.label}
                </text>
                
                {/* Value display */}
                {showFull && node.value !== undefined && (
                  <text
                    x={pos.x}
                    y={pos.y + 12}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.8)"
                    fontSize="10"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.value}%
                  </text>
                )}
                
                {/* Category badge */}
                {showFull && node.category && (
                  <g>
                    <rect
                      x={pos.x - 25}
                      y={pos.y + nodeRadius + 5}
                      width={50}
                      height={16}
                      rx={8}
                      fill="rgba(0,0,0,0.6)"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + nodeRadius + 15}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.8)"
                      fontSize="8"
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.category}
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
        <div className="absolute bottom-3 left-3 p-2 rounded-lg bg-black/50 backdrop-blur-sm">
          <div className="text-[10px] text-white/50 mb-1.5 uppercase tracking-wider">Node Types</div>
          <div className="flex flex-wrap gap-1.5">
            {nodeTypes.map(type => {
              const colors = NODE_COLORS[type] || NODE_COLORS.parameter;
              return (
                <div key={type} className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors.bg }}
                  />
                  <span className="text-[10px] text-white/70 capitalize">{type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Connection strength legend */}
      <div className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/50 backdrop-blur-sm">
        <div className="text-[10px] text-white/50 mb-1.5 uppercase tracking-wider">Connection Strength</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <div className="w-8 h-0.5 bg-gray-500" />
            <span className="text-[9px] text-white/50">Weak</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-8 h-1 bg-yellow-500" />
            <span className="text-[9px] text-white/50">Med</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-8 h-1.5 bg-red-500" />
            <span className="text-[9px] text-white/50">Strong</span>
          </div>
        </div>
      </div>
      
      {/* Selected node details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-16 right-3 w-64 p-3 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">
                {nodes.find(n => n.id === selectedNode)?.label}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedNode(null)}
                className="h-6 w-6 p-0 text-white/50 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            
            {(() => {
              const node = nodes.find(n => n.id === selectedNode);
              if (!node) return null;
              
              const nodeConnections = connections.filter(
                c => c.source === selectedNode || c.target === selectedNode
              );
              
              return (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Type:</span>
                    <Badge 
                      className="text-[10px]"
                      style={{ backgroundColor: NODE_COLORS[node.type]?.bg }}
                    >
                      {node.type}
                    </Badge>
                  </div>
                  
                  {node.value !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Value:</span>
                      <span className="text-white font-medium">{node.value}%</span>
                    </div>
                  )}
                  
                  {node.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Category:</span>
                      <span className="text-white">{node.category}</span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-white/50">Connections ({nodeConnections.length}):</span>
                    <ScrollArea className="h-24 mt-1">
                      {nodeConnections.map((conn, i) => {
                        const otherId = conn.source === selectedNode ? conn.target : conn.source;
                        const otherNode = nodes.find(n => n.id === otherId);
                        return (
                          <div 
                            key={i}
                            className="flex items-center justify-between py-1 text-[10px]"
                          >
                            <span className="text-white/70 truncate max-w-[120px]">
                              {otherNode?.label}
                            </span>
                            <Badge 
                              variant="outline" 
                              className="text-[9px] border-white/20"
                              style={{ color: getConnectionStyle(conn.strength).color }}
                            >
                              {conn.strength}%
                            </Badge>
                          </div>
                        );
                      })}
                    </ScrollArea>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NeuralNetworkVisualization;
