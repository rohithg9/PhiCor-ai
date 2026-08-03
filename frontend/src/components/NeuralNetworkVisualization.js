import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, Maximize2, Minimize2, ZoomIn, ZoomOut, 
  RefreshCw, GitBranch, Layers, Circle, Move,
  ChevronDown, Info, X, Eye, EyeOff, Play, Pause
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

/**
 * Advanced 3D Neural Network Visualization Component
 * 
 * Displays a complex mind map showing diagnostic reasoning with:
 * - 3D depth effects and shadows
 * - Probability percentages on all connections
 * - One-to-many and many-to-many relationships
 * - Animated flow paths showing reasoning chains
 * - Correlation coefficients between nodes
 */

// Enhanced node type colors with gradients
const NODE_COLORS = {
  patient: { 
    primary: '#06b6d4', 
    secondary: '#0891b2', 
    glow: 'rgba(6, 182, 212, 0.5)',
    text: '#ffffff',
    shadowColor: 'rgba(6, 182, 212, 0.3)'
  },
  symptom: { 
    primary: '#f97316', 
    secondary: '#ea580c', 
    glow: 'rgba(249, 115, 22, 0.5)',
    text: '#ffffff',
    shadowColor: 'rgba(249, 115, 22, 0.3)'
  },
  lab: { 
    primary: '#8b5cf6', 
    secondary: '#7c3aed', 
    glow: 'rgba(139, 92, 246, 0.5)',
    text: '#ffffff',
    shadowColor: 'rgba(139, 92, 246, 0.3)'
  },
  finding: { 
    primary: '#3b82f6', 
    secondary: '#2563eb', 
    glow: 'rgba(59, 130, 246, 0.5)',
    text: '#ffffff',
    shadowColor: 'rgba(59, 130, 246, 0.3)'
  },
  syndrome: { 
    primary: '#ec4899', 
    secondary: '#db2777', 
    glow: 'rgba(236, 72, 153, 0.5)',
    text: '#ffffff',
    shadowColor: 'rgba(236, 72, 153, 0.3)'
  },
  diagnosis: { 
    primary: '#ef4444', 
    secondary: '#dc2626', 
    glow: 'rgba(239, 68, 68, 0.6)',
    text: '#ffffff',
    shadowColor: 'rgba(239, 68, 68, 0.4)'
  },
  organ: { 
    primary: '#10b981', 
    secondary: '#059669', 
    glow: 'rgba(16, 185, 129, 0.5)',
    text: '#ffffff',
    shadowColor: 'rgba(16, 185, 129, 0.3)'
  },
  parameter: { 
    primary: '#f59e0b', 
    secondary: '#d97706', 
    glow: 'rgba(245, 158, 11, 0.5)',
    text: '#ffffff',
    shadowColor: 'rgba(245, 158, 11, 0.3)'
  },
  modifier: { 
    primary: '#6366f1', 
    secondary: '#4f46e5', 
    glow: 'rgba(99, 102, 241, 0.5)',
    text: '#ffffff',
    shadowColor: 'rgba(99, 102, 241, 0.3)'
  },
  condition: { 
    primary: '#14b8a6', 
    secondary: '#0d9488', 
    glow: 'rgba(20, 184, 166, 0.5)',
    text: '#ffffff',
    shadowColor: 'rgba(20, 184, 166, 0.3)'
  },
  drug: { 
    primary: '#a855f7', 
    secondary: '#9333ea', 
    glow: 'rgba(168, 85, 247, 0.5)',
    text: '#ffffff',
    shadowColor: 'rgba(168, 85, 247, 0.3)'
  },
  food: { 
    primary: '#84cc16', 
    secondary: '#65a30d', 
    glow: 'rgba(132, 204, 22, 0.5)',
    text: '#ffffff',
    shadowColor: 'rgba(132, 204, 22, 0.3)'
  },
  correlation: { 
    primary: '#64748b', 
    secondary: '#475569', 
    glow: 'rgba(100, 116, 139, 0.4)',
    text: '#ffffff',
    shadowColor: 'rgba(100, 116, 139, 0.2)'
  },
};

// Connection type styles
const CONNECTION_TYPES = {
  direct: { dashArray: 'none', animationSpeed: 2 },
  indirect: { dashArray: '8,4', animationSpeed: 3 },
  correlation: { dashArray: '4,4', animationSpeed: 4 },
  causal: { dashArray: 'none', animationSpeed: 1.5 },
};

// Calculate 3D-style layered positions
const calculate3DPositions = (nodes, connections, centralNodeId, mode, width, height) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const positions = {};
  
  // Group nodes by type for layered positioning
  const layers = {
    patient: [],
    modifier: [],
    condition: [],
    symptom: [],
    finding: [],
    lab: [],
    parameter: [],
    syndrome: [],
    organ: [],
    diagnosis: [],
    correlation: [],
    drug: [],
    food: [],
  };
  
  nodes.forEach(node => {
    const type = node.type || 'parameter';
    if (layers[type]) {
      layers[type].push(node);
    } else {
      layers.parameter.push(node);
    }
  });

  if (mode === 'hierarchical-3d') {
    // 3D Hierarchical - top to bottom with depth
    const layerOrder = ['patient', 'modifier', 'condition', 'symptom', 'lab', 'finding', 'parameter', 'syndrome', 'organ', 'diagnosis'];
    let currentY = 60;
    const layerSpacing = Math.min(80, (height - 120) / layerOrder.filter(l => layers[l]?.length > 0).length);
    
    layerOrder.forEach((layerType, layerIdx) => {
      const layerNodes = layers[layerType] || [];
      if (layerNodes.length === 0) return;
      
      const depth = layerIdx * 0.15; // Z-depth simulation
      const horizontalSpacing = Math.min(120, (width - 80) / (layerNodes.length + 1));
      
      layerNodes.forEach((node, nodeIdx) => {
        const x = horizontalSpacing * (nodeIdx + 1) + 40;
        // Add slight curve/wave for 3D effect
        const waveOffset = Math.sin(nodeIdx * 0.5) * 15;
        positions[node.id] = {
          x: x,
          y: currentY + waveOffset,
          z: depth,
          scale: 1 - depth * 0.3
        };
      });
      
      currentY += layerSpacing;
    });
    
  } else if (mode === 'radial-3d') {
    // 3D Radial - concentric circles with depth
    const centralNode = nodes.find(n => n.id === centralNodeId) || nodes[0];
    positions[centralNode?.id] = { x: centerX, y: centerY, z: 0, scale: 1.2 };
    
    // Calculate connection distances for ring assignment
    const connectionCounts = {};
    nodes.forEach(n => { connectionCounts[n.id] = 0; });
    connections.forEach(c => {
      if (c.source === centralNodeId) connectionCounts[c.target] = (connectionCounts[c.target] || 0) + 1;
      if (c.target === centralNodeId) connectionCounts[c.source] = (connectionCounts[c.source] || 0) + 1;
    });
    
    // Ring 1: Direct connections (symptoms, labs)
    const ring1Nodes = nodes.filter(n => 
      n.id !== centralNodeId && 
      (n.type === 'symptom' || n.type === 'lab' || n.type === 'finding')
    );
    const ring1Radius = Math.min(width, height) * 0.22;
    ring1Nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / ring1Nodes.length - Math.PI / 2;
      positions[node.id] = {
        x: centerX + ring1Radius * Math.cos(angle),
        y: centerY + ring1Radius * Math.sin(angle),
        z: 0.2,
        scale: 0.9
      };
    });
    
    // Ring 2: Intermediate nodes (syndromes, conditions)
    const ring2Nodes = nodes.filter(n => 
      n.id !== centralNodeId && 
      !ring1Nodes.includes(n) &&
      (n.type === 'syndrome' || n.type === 'condition' || n.type === 'correlation')
    );
    const ring2Radius = Math.min(width, height) * 0.35;
    ring2Nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / ring2Nodes.length - Math.PI / 4;
      positions[node.id] = {
        x: centerX + ring2Radius * Math.cos(angle),
        y: centerY + ring2Radius * Math.sin(angle),
        z: 0.35,
        scale: 0.85
      };
    });
    
    // Ring 3: Outcomes (diagnoses)
    const ring3Nodes = nodes.filter(n => 
      n.id !== centralNodeId && 
      !ring1Nodes.includes(n) && 
      !ring2Nodes.includes(n)
    );
    const ring3Radius = Math.min(width, height) * 0.45;
    ring3Nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / ring3Nodes.length;
      positions[node.id] = {
        x: centerX + ring3Radius * Math.cos(angle),
        y: centerY + ring3Radius * Math.sin(angle),
        z: 0.5,
        scale: 0.8
      };
    });
    
  } else if (mode === 'force-3d') {
    // Force-directed with 3D depth based on node importance
    const nodeImportance = {};
    nodes.forEach(n => {
      const connCount = connections.filter(c => c.source === n.id || c.target === n.id).length;
      nodeImportance[n.id] = connCount;
    });
    
    const maxImportance = Math.max(...Object.values(nodeImportance), 1);
    
    // Position by importance - more important nodes closer to center
    const sortedNodes = [...nodes].sort((a, b) => 
      (nodeImportance[b.id] || 0) - (nodeImportance[a.id] || 0)
    );
    
    sortedNodes.forEach((node, i) => {
      const importance = nodeImportance[node.id] || 0;
      const radius = (1 - importance / maxImportance) * Math.min(width, height) * 0.4 + 50;
      const angle = (2 * Math.PI * i) / sortedNodes.length + (i % 2) * 0.3;
      
      positions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        z: (1 - importance / maxImportance) * 0.5,
        scale: 0.7 + (importance / maxImportance) * 0.5
      };
    });
    
    // Override central node
    const centralNode = nodes.find(n => n.id === centralNodeId);
    if (centralNode) {
      positions[centralNodeId] = { x: centerX, y: centerY, z: 0, scale: 1.2 };
    }
    
  } else {
    // Default tree layout with 3D
    const centralNode = nodes.find(n => n.id === centralNodeId) || nodes[0];
    positions[centralNode?.id] = { x: centerX, y: 50, z: 0, scale: 1.1 };
    
    const processedNodes = new Set([centralNode?.id]);
    let currentLevel = [centralNode];
    let levelY = 130;
    let levelZ = 0.15;
    
    while (currentLevel.length > 0 && levelY < height - 60) {
      const nextLevel = [];
      const levelScale = Math.max(0.6, 1 - levelZ);
      
      currentLevel.forEach(parentNode => {
        const children = connections
          .filter(c => c.source === parentNode?.id || c.target === parentNode?.id)
          .map(c => c.source === parentNode?.id ? c.target : c.source)
          .filter(id => !processedNodes.has(id));
        
        const uniqueChildren = [...new Set(children)];
        const spread = Math.min(150, (width - 100) / (uniqueChildren.length + 1));
        
        uniqueChildren.forEach((childId, i) => {
          const parentPos = positions[parentNode?.id] || { x: centerX, y: levelY - 80 };
          positions[childId] = {
            x: parentPos.x + (i - (uniqueChildren.length - 1) / 2) * spread,
            y: levelY + Math.random() * 20 - 10,
            z: levelZ,
            scale: levelScale
          };
          processedNodes.add(childId);
          nextLevel.push(nodes.find(n => n.id === childId));
        });
      });
      
      currentLevel = nextLevel.filter(Boolean);
      levelY += 90;
      levelZ += 0.12;
    }
    
    // Position remaining nodes
    nodes.forEach((node, i) => {
      if (!positions[node.id]) {
        positions[node.id] = {
          x: 60 + (i % 6) * 100,
          y: height - 80,
          z: 0.6,
          scale: 0.7
        };
      }
    });
  }
  
  return positions;
};

// Get connection visual properties based on strength and type
const getConnectionStyle = (strength, connectionType = 'direct') => {
  const normalizedStrength = Math.min(100, Math.max(0, strength || 0));
  const baseOpacity = 0.4 + (normalizedStrength / 100) * 0.6;
  const strokeWidth = 1.5 + (normalizedStrength / 100) * 3.5;
  
  // Color gradient based on strength
  let color, glowColor;
  if (normalizedStrength >= 80) {
    color = '#ef4444'; // Red - very strong
    glowColor = 'rgba(239, 68, 68, 0.6)';
  } else if (normalizedStrength >= 60) {
    color = '#f97316'; // Orange - strong
    glowColor = 'rgba(249, 115, 22, 0.5)';
  } else if (normalizedStrength >= 40) {
    color = '#eab308'; // Yellow - moderate
    glowColor = 'rgba(234, 179, 8, 0.4)';
  } else if (normalizedStrength >= 20) {
    color = '#22c55e'; // Green - weak
    glowColor = 'rgba(34, 197, 94, 0.3)';
  } else {
    color = '#6b7280'; // Gray - very weak
    glowColor = 'rgba(107, 114, 128, 0.2)';
  }
  
  const typeStyle = CONNECTION_TYPES[connectionType] || CONNECTION_TYPES.direct;
  
  return { 
    opacity: baseOpacity, 
    strokeWidth, 
    color, 
    glowColor,
    dashArray: typeStyle.dashArray,
    animationSpeed: typeStyle.animationSpeed
  };
};

// Calculate curved path between two points
const calculateCurvedPath = (x1, y1, x2, y2, curveStrength = 0.2) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Perpendicular offset for curve
  const offsetX = -dy * curveStrength;
  const offsetY = dx * curveStrength;
  
  const controlX = midX + offsetX;
  const controlY = midY + offsetY;
  
  return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
};

const NeuralNetworkVisualization = ({
  nodes = [],
  connections = [],
  centralNode = null,
  mode = 'radial-3d',
  onNodeClick,
  title = 'Diagnostic Reasoning Network',
  showLegend = true,
  height = 550,
  isDark = true
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 900, height });
  const [activeMode, setActiveMode] = useState(mode);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAllLabels, setShowAllLabels] = useState(true);
  const [animateFlow, setAnimateFlow] = useState(true);
  const [showCorrelations, setShowCorrelations] = useState(true);

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
  
  // Enhance connections with cross-correlations
  const enhancedConnections = useMemo(() => {
    const enhanced = [...connections];
    
    if (showCorrelations && nodes.length > 2) {
      // Add correlation connections between related symptoms/findings
      const symptoms = nodes.filter(n => n.type === 'symptom' || n.type === 'lab' || n.type === 'finding');
      const diagnoses = nodes.filter(n => n.type === 'diagnosis');
      
      // Find symptoms that share diagnoses
      symptoms.forEach((sym1, i) => {
        symptoms.slice(i + 1).forEach(sym2 => {
          // Check if both connect to same diagnosis
          const sym1Diagnoses = connections
            .filter(c => c.source === sym1.id || c.target === sym1.id)
            .filter(c => diagnoses.some(d => d.id === c.source || d.id === c.target));
          const sym2Diagnoses = connections
            .filter(c => c.source === sym2.id || c.target === sym2.id)
            .filter(c => diagnoses.some(d => d.id === c.source || d.id === c.target));
          
          const sharedDiagnoses = sym1Diagnoses.filter(c1 => 
            sym2Diagnoses.some(c2 => 
              c1.source === c2.source || c1.target === c2.target ||
              c1.source === c2.target || c1.target === c2.source
            )
          );
          
          if (sharedDiagnoses.length > 0) {
            // Add correlation connection
            const existingConn = enhanced.find(c => 
              (c.source === sym1.id && c.target === sym2.id) ||
              (c.source === sym2.id && c.target === sym1.id)
            );
            
            if (!existingConn) {
              const correlationStrength = Math.min(70, sharedDiagnoses.length * 25);
              enhanced.push({
                source: sym1.id,
                target: sym2.id,
                strength: correlationStrength,
                label: `r=${(correlationStrength/100).toFixed(2)}`,
                type: 'correlation',
                isCorrelation: true
              });
            }
          }
        });
      });
    }
    
    return enhanced;
  }, [connections, nodes, showCorrelations]);

  // Calculate node positions with 3D
  const positions = useMemo(() => {
    return calculate3DPositions(
      nodes, 
      enhancedConnections, 
      centralNode || nodes[0]?.id, 
      activeMode, 
      dimensions.width, 
      dimensions.height
    );
  }, [nodes, enhancedConnections, centralNode, activeMode, dimensions]);
  
  // Get highlighted connections and nodes
  const highlightedElements = useMemo(() => {
    const activeNodeId = hoveredNode || selectedNode;
    if (!activeNodeId) return { nodes: new Set(), connections: new Set() };
    
    const connectedNodes = new Set([activeNodeId]);
    const connectedConns = new Set();
    
    enhancedConnections.forEach((c, i) => {
      if (c.source === activeNodeId || c.target === activeNodeId) {
        connectedNodes.add(c.source);
        connectedNodes.add(c.target);
        connectedConns.add(i);
      }
    });
    
    return { nodes: connectedNodes, connections: connectedConns };
  }, [hoveredNode, selectedNode, enhancedConnections]);
  
  const handleNodeClick = (node) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
    if (onNodeClick) onNodeClick(node);
  };
  
  const modeOptions = [
    { id: 'radial-3d', label: 'Radial 3D', icon: Circle },
    { id: 'hierarchical-3d', label: 'Hierarchical', icon: Layers },
    { id: 'tree', label: 'Tree', icon: GitBranch },
    { id: 'force-3d', label: 'Force', icon: Network },
  ];
  
  // Get unique node types for legend
  const nodeTypes = useMemo(() => {
    return [...new Set(nodes.map(n => n.type))].filter(t => NODE_COLORS[t]);
  }, [nodes]);
  
  const bgColor = isDark ? '#0a0a14' : '#f8fafc';
  const gridColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  
  return (
    <div 
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
      style={{ 
        backgroundColor: bgColor,
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        height: isFullscreen ? 'calc(100vh - 2rem)' : height,
        boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
      }}
    >
      {/* Header with controls */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Network className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-sm">{title}</span>
          <Badge variant="outline" className="text-xs bg-black/40 border-white/20 text-white/90">
            {nodes.length} nodes • {enhancedConnections.length} connections
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
              className={`h-7 px-2 ${activeMode === opt.id ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              title={opt.label}
            >
              <opt.icon className="w-3.5 h-3.5" />
            </Button>
          ))}
          
          <div className="w-px h-5 bg-white/20 mx-1" />
          
          {/* Toggle controls */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAllLabels(!showAllLabels)}
            className={`h-7 px-2 ${showAllLabels ? 'text-emerald-400' : 'text-white/50'} hover:bg-white/10`}
            title={showAllLabels ? "Hide labels" : "Show labels"}
          >
            {showAllLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAnimateFlow(!animateFlow)}
            className={`h-7 px-2 ${animateFlow ? 'text-blue-400' : 'text-white/50'} hover:bg-white/10`}
            title={animateFlow ? "Pause animation" : "Animate flow"}
          >
            {animateFlow ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </Button>
          
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
          <span className="text-xs text-white/60 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
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
        style={{ background: `radial-gradient(circle at 50% 50%, ${isDark ? '#0f172a' : '#f1f5f9'} 0%, ${bgColor} 100%)` }}
      >
        <defs>
          {/* Gradient definitions for connections */}
          <linearGradient id="connGradientStrong" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="connGradientMedium" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="connGradientWeak" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6b7280" stopOpacity="0.4" />
          </linearGradient>
          
          {/* Arrow markers */}
          <marker id="arrowStrong" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
          </marker>
          <marker id="arrowMedium" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#f97316" />
          </marker>
          <marker id="arrowWeak" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
          </marker>
          
          {/* Glow filters for 3D effect */}
          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.4"/>
          </filter>
          
          <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          
          {/* Animated dash pattern */}
          <pattern id="flowPattern" patternUnits="userSpaceOnUse" width="20" height="4" patternTransform="rotate(0)">
            <rect width="10" height="4" fill="currentColor">
              {animateFlow && (
                <animate attributeName="x" from="0" to="20" dur="1s" repeatCount="indefinite" />
              )}
            </rect>
          </pattern>
        </defs>
        
        {/* Background grid for depth perception */}
        <g className="grid" opacity={0.3}>
          {Array.from({ length: 20 }, (_, i) => (
            <line 
              key={`v-${i}`}
              x1={i * (dimensions.width / 20)} 
              y1={0} 
              x2={i * (dimensions.width / 20)} 
              y2={dimensions.height}
              stroke={gridColor}
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 15 }, (_, i) => (
            <line 
              key={`h-${i}`}
              x1={0} 
              y1={i * (dimensions.height / 15)} 
              x2={dimensions.width} 
              y2={i * (dimensions.height / 15)}
              stroke={gridColor}
              strokeWidth={0.5}
            />
          ))}
        </g>
        
        {/* Connection layer - render first for z-order */}
        <g className="connections">
          {enhancedConnections.map((conn, i) => {
            const sourcePos = positions[conn.source];
            const targetPos = positions[conn.target];
            
            if (!sourcePos || !targetPos) return null;
            
            const style = getConnectionStyle(conn.strength, conn.type);
            const isHighlighted = highlightedElements.connections.has(i);
            const isHovered = hoveredConnection === i;
            const isActive = isHighlighted || isHovered || highlightedElements.nodes.size === 0;
            const isCorrelation = conn.isCorrelation;
            
            // Calculate curved path
            const curveStrength = isCorrelation ? 0.3 : 0.15;
            const path = calculateCurvedPath(
              sourcePos.x, sourcePos.y, 
              targetPos.x, targetPos.y,
              curveStrength * (i % 2 === 0 ? 1 : -1)
            );
            
            // Midpoint for label
            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2;
            
            // Determine arrow marker
            const arrowId = conn.strength >= 60 ? 'arrowStrong' : conn.strength >= 30 ? 'arrowMedium' : 'arrowWeak';
            
            return (
              <g 
                key={`conn-${i}`}
                onMouseEnter={() => setHoveredConnection(i)}
                onMouseLeave={() => setHoveredConnection(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Connection glow for 3D effect */}
                {isActive && !isCorrelation && (
                  <path
                    d={path}
                    fill="none"
                    stroke={style.glowColor}
                    strokeWidth={style.strokeWidth + 6}
                    strokeOpacity={0.3}
                    strokeLinecap="round"
                  />
                )}
                
                {/* Main connection line */}
                <motion.path
                  d={path}
                  fill="none"
                  stroke={isCorrelation ? '#64748b' : style.color}
                  strokeWidth={isActive ? style.strokeWidth : 1}
                  strokeOpacity={isActive ? style.opacity : 0.15}
                  strokeDasharray={isCorrelation ? '6,4' : style.dashArray}
                  strokeLinecap="round"
                  markerEnd={!isCorrelation ? `url(#${arrowId})` : undefined}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: i * 0.02 }}
                />
                
                {/* Animated flow particles */}
                {animateFlow && isActive && !isCorrelation && conn.strength >= 40 && (
                  <circle r="3" fill={style.color}>
                    <animateMotion
                      dur={`${3 - (conn.strength / 50)}s`}
                      repeatCount="indefinite"
                      path={path}
                    />
                  </circle>
                )}
                
                {/* Probability/Correlation label - ALWAYS VISIBLE when showAllLabels is true */}
                {(showAllLabels || isActive) && conn.strength !== undefined && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    {/* Label background with 3D effect */}
                    <rect
                      x={-22}
                      y={-11}
                      width={44}
                      height={22}
                      rx={11}
                      fill={isCorrelation ? '#1e293b' : (isDark ? '#0f172a' : '#ffffff')}
                      stroke={isCorrelation ? '#475569' : style.color}
                      strokeWidth={isActive ? 2 : 1}
                      filter="url(#shadow)"
                    />
                    
                    {/* Probability text */}
                    <text
                      x={0}
                      y={1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isCorrelation ? '#94a3b8' : style.color}
                      fontSize={isActive ? 11 : 9}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {isCorrelation ? conn.label : `${conn.strength}%`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
        
        {/* Nodes layer */}
        <g className="nodes">
          {nodes.map((node, i) => {
            const pos = positions[node.id];
            if (!pos) return null;
            
            const colors = NODE_COLORS[node.type] || NODE_COLORS.parameter;
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;
            const isHighlighted = highlightedElements.nodes.has(node.id) || highlightedElements.nodes.size === 0;
            const isCentral = node.id === centralNode;
            
            // 3D scaling based on z-position
            const zScale = pos.scale || 1;
            const baseRadius = isCentral ? 38 : (node.value ? 22 + Math.min(node.value / 6, 12) : 26);
            const nodeRadius = baseRadius * zScale;
            const showDetails = isSelected || isHovered || isCentral;
            
            // Calculate shadow offset based on z-depth
            const shadowOffset = (pos.z || 0) * 8 + 3;
            
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isSelected ? 1.15 : 1, 
                  opacity: isHighlighted ? 1 : 0.25 
                }}
                transition={{ duration: 0.3, delay: i * 0.025 }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Shadow for 3D depth */}
                <ellipse
                  cx={pos.x + shadowOffset}
                  cy={pos.y + shadowOffset}
                  rx={nodeRadius}
                  ry={nodeRadius * 0.85}
                  fill="rgba(0,0,0,0.3)"
                  opacity={isHighlighted ? 0.5 : 0.2}
                />
                
                {/* Outer glow ring */}
                {(showDetails || isCentral) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 8}
                    fill="none"
                    stroke={colors.glow}
                    strokeWidth={3}
                    opacity={0.6}
                  >
                    {animateFlow && (
                      <animate 
                        attributeName="r" 
                        values={`${nodeRadius + 6};${nodeRadius + 12};${nodeRadius + 6}`}
                        dur="2s" 
                        repeatCount="indefinite" 
                      />
                    )}
                  </circle>
                )}
                
                {/* Main node circle with gradient */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={colors.primary}
                  stroke={isSelected ? '#ffffff' : colors.secondary}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={showDetails ? 'url(#glow)' : undefined}
                />
                
                {/* Inner highlight for 3D ball effect */}
                <ellipse
                  cx={pos.x - nodeRadius * 0.25}
                  cy={pos.y - nodeRadius * 0.25}
                  rx={nodeRadius * 0.4}
                  ry={nodeRadius * 0.3}
                  fill="rgba(255,255,255,0.25)"
                />
                
                {/* Value ring indicator */}
                {node.value !== undefined && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius - 4}
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth={3}
                    strokeDasharray={`${(node.value / 100) * (2 * Math.PI * (nodeRadius - 4))} ${2 * Math.PI * (nodeRadius - 4)}`}
                    transform={`rotate(-90 ${pos.x} ${pos.y})`}
                    strokeLinecap="round"
                  />
                )}
                
                {/* Node label */}
                <text
                  x={pos.x}
                  y={pos.y + (showDetails ? -6 : 0)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={colors.text}
                  fontSize={isCentral ? 11 : Math.max(8, 10 * zScale)}
                  fontWeight="600"
                  style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {node.label?.length > 14 ? `${node.label.substring(0, 12)}...` : node.label}
                </text>
                
                {/* Value percentage display */}
                {(showDetails || (showAllLabels && node.value !== undefined)) && (
                  <text
                    x={pos.x}
                    y={pos.y + (showDetails ? 10 : 14)}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.9)"
                    fontSize={showDetails ? 12 : 9}
                    fontWeight="bold"
                    fontFamily="monospace"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.value !== undefined ? `${node.value}%` : ''}
                  </text>
                )}
                
                {/* Type badge below node */}
                {showDetails && (
                  <g>
                    <rect
                      x={pos.x - 28}
                      y={pos.y + nodeRadius + 6}
                      width={56}
                      height={18}
                      rx={9}
                      fill={colors.secondary}
                      opacity={0.9}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + nodeRadius + 17}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.9)"
                      fontSize="9"
                      fontWeight="500"
                      style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
                    >
                      {node.type}
                    </text>
                  </g>
                )}
                
                {/* Connection count indicator */}
                {!isCentral && (
                  <g>
                    <circle
                      cx={pos.x + nodeRadius - 2}
                      cy={pos.y - nodeRadius + 2}
                      r={10}
                      fill={isDark ? '#1e293b' : '#ffffff'}
                      stroke={colors.primary}
                      strokeWidth={1.5}
                    />
                    <text
                      x={pos.x + nodeRadius - 2}
                      y={pos.y - nodeRadius + 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={colors.primary}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {enhancedConnections.filter(c => c.source === node.id || c.target === node.id).length}
                    </text>
                  </g>
                )}
              </motion.g>
            );
          })}
        </g>
      </svg>
      
      {/* Legend panel */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
          <div className="text-[10px] text-white/50 mb-2 uppercase tracking-wider font-medium">Node Types</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {nodeTypes.map(type => {
              const colors = NODE_COLORS[type];
              if (!colors) return null;
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <div 
                    className="w-3.5 h-3.5 rounded-full shadow-lg" 
                    style={{ 
                      backgroundColor: colors.primary,
                      boxShadow: `0 0 6px ${colors.glow}`
                    }}
                  />
                  <span className="text-[10px] text-white/80 capitalize">{type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Connection strength legend */}
      <div className="absolute bottom-3 right-3 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
        <div className="text-[10px] text-white/50 mb-2 uppercase tracking-wider font-medium">Connection Strength</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-12 h-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
            <span className="text-[10px] text-white/70">Strong (60-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-green-500" />
            <span className="text-[10px] text-white/70">Medium (30-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 rounded-full bg-gray-500 opacity-50" style={{ borderStyle: 'dashed' }} />
            <span className="text-[10px] text-white/70">Weak (&lt;30%)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-white/10 mt-1">
            <div className="w-12 h-0.5 rounded-full bg-slate-500" style={{ borderStyle: 'dotted' }} />
            <span className="text-[10px] text-white/70">Correlation</span>
          </div>
        </div>
      </div>
      
      {/* Selected node detail panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="absolute top-16 right-3 w-72 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 overflow-hidden"
          >
            {(() => {
              const node = nodes.find(n => n.id === selectedNode);
              if (!node) return null;
              
              const nodeConnections = enhancedConnections.filter(
                c => c.source === selectedNode || c.target === selectedNode
              ).sort((a, b) => (b.strength || 0) - (a.strength || 0));
              
              const colors = NODE_COLORS[node.type] || NODE_COLORS.parameter;
              
              return (
                <>
                  {/* Header */}
                  <div 
                    className="p-3 flex items-center justify-between"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}20)` }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <span className="text-white text-sm font-bold">
                          {node.value !== undefined ? `${node.value}` : node.label?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{node.label}</div>
                        <Badge 
                          className="text-[9px] mt-0.5"
                          style={{ backgroundColor: colors.secondary }}
                        >
                          {node.type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedNode(null)}
                      className="h-6 w-6 p-0 text-white/50 hover:text-white hover:bg-white/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Connection details */}
                  <div className="p-3">
                    <div className="text-xs text-white/50 mb-2 flex items-center justify-between">
                      <span>Connections ({nodeConnections.length})</span>
                      <span className="text-[10px]">Strength</span>
                    </div>
                    <ScrollArea className="h-48">
                      <div className="space-y-1.5">
                        {nodeConnections.map((conn, i) => {
                          const otherId = conn.source === selectedNode ? conn.target : conn.source;
                          const otherNode = nodes.find(n => n.id === otherId);
                          const otherColors = NODE_COLORS[otherNode?.type] || NODE_COLORS.parameter;
                          const style = getConnectionStyle(conn.strength);
                          const direction = conn.source === selectedNode ? '→' : '←';
                          
                          return (
                            <div 
                              key={i}
                              className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: otherColors.primary }}
                                />
                                <span className="text-white/60 text-[10px]">{direction}</span>
                                <span className="text-white/90 text-xs truncate max-w-[120px]">
                                  {otherNode?.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div 
                                  className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden"
                                >
                                  <div 
                                    className="h-full rounded-full"
                                    style={{ 
                                      width: `${conn.strength || 0}%`,
                                      backgroundColor: style.color
                                    }}
                                  />
                                </div>
                                <span 
                                  className="text-xs font-mono font-bold w-10 text-right"
                                  style={{ color: style.color }}
                                >
                                  {conn.isCorrelation ? conn.label : `${conn.strength}%`}
                                </span>
                              </div>
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
      
      {/* Instructions tooltip */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-[10px] text-white/50">
        <Info className="w-3 h-3 inline mr-1.5" />
        Click nodes to see details • Hover connections for probability • Numbers show diagnostic confidence
      </div>
    </div>
  );
};

export default NeuralNetworkVisualization;
