import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Calculator, 
  Heart, 
  Wind, 
  Droplet, 
  FlaskConical,
  Activity,
  Brain,
  Beaker,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const CATEGORY_ICONS = {
  cardiovascular: Heart,
  respiratory: Wind,
  renal: Droplet,
  acid_base: FlaskConical,
  hepatology: Activity,
  sepsis: AlertTriangle,
  hematology: Beaker,
  phicor_novel: Brain
};

const CATEGORY_COLORS = {
  cardiovascular: 'bg-red-100 text-red-800 border-red-200',
  respiratory: 'bg-blue-100 text-blue-800 border-blue-200',
  renal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  acid_base: 'bg-purple-100 text-purple-800 border-purple-200',
  hepatology: 'bg-green-100 text-green-800 border-green-200',
  sepsis: 'bg-orange-100 text-orange-800 border-orange-200',
  hematology: 'bg-pink-100 text-pink-800 border-pink-200',
  phicor_novel: 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

// Equation Calculator Component
const EquationCalculator = ({ equation }) => {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [interpretation, setInterpretation] = useState(null);

  const variables = equation.variables || {};
  const components = equation.components || [];

  const handleInputChange = (varName, value) => {
    setInputs(prev => ({ ...prev, [varName]: parseFloat(value) || 0 }));
  };

  const calculateResult = () => {
    try {
      // Handle component-based scores (like CHA2DS2-VASc)
      if (components.length > 0) {
        let score = 0;
        components.forEach(comp => {
          const varName = comp.variable || comp.condition;
          if (inputs[varName]) {
            score += typeof comp.points === 'number' ? comp.points : parseInt(comp.points) || 1;
          }
        });
        setResult({ value: score, unit: 'points' });
        
        // Find interpretation
        const thresholds = equation.clinical_thresholds || {};
        let interp = null;
        Object.entries(thresholds).forEach(([threshold, meaning]) => {
          if (threshold.includes('≥') && score >= parseInt(threshold.replace('≥', ''))) {
            interp = meaning;
          } else if (threshold.includes('≤') && score <= parseInt(threshold.replace('≤', ''))) {
            interp = meaning;
          } else if (threshold.includes('-')) {
            const [min, max] = threshold.split('-').map(Number);
            if (score >= min && score <= max) interp = meaning;
          } else if (score === parseInt(threshold)) {
            interp = meaning;
          }
        });
        setInterpretation(interp);
      } else {
        // Handle formula-based equations
        let formula = equation.equation;
        let resultValue = null;
        
        // Simple equation parsing for common patterns
        if (equation.id === 'mean_arterial_pressure') {
          const { DBP, SBP } = inputs;
          resultValue = DBP + (1/3) * (SBP - DBP);
        } else if (equation.id === 'ejection_fraction') {
          const { EDV, ESV } = inputs;
          resultValue = ((EDV - ESV) / EDV) * 100;
        } else if (equation.id === 'cardiac_index') {
          const { CO, BSA } = inputs;
          resultValue = CO / BSA;
        } else if (equation.id === 'anion_gap') {
          const { Na, Cl, HCO3 } = inputs;
          resultValue = Na - (Cl + HCO3);
        } else if (equation.id === 'corrected_calcium') {
          const { Ca, Albumin } = inputs;
          resultValue = Ca + 0.8 * (4.0 - Albumin);
        } else if (equation.id === 'pf_ratio') {
          const { PaO2, FiO2 } = inputs;
          resultValue = PaO2 / FiO2;
        } else if (equation.id === 'fena') {
          const { UNa, PNa, UCr, PCr } = inputs;
          resultValue = ((UNa * PCr) / (PNa * UCr)) * 100;
        }
        
        if (resultValue !== null && !isNaN(resultValue)) {
          const unit = Object.values(variables)[0]?.unit || '';
          setResult({ value: resultValue.toFixed(2), unit });
          
          // Find interpretation
          const thresholds = equation.clinical_thresholds || {};
          let interp = null;
          Object.entries(thresholds).forEach(([threshold, meaning]) => {
            const numThreshold = parseFloat(threshold.replace(/[<>≥≤%]/g, ''));
            if (threshold.includes('≥') && resultValue >= numThreshold) interp = meaning;
            else if (threshold.includes('>') && resultValue > numThreshold) interp = meaning;
            else if (threshold.includes('≤') && resultValue <= numThreshold) interp = meaning;
            else if (threshold.includes('<') && resultValue < numThreshold) interp = meaning;
          });
          setInterpretation(interp);
        }
      }
    } catch (error) {
      console.error('Calculation error:', error);
      setResult({ value: 'Error', unit: '' });
    }
  };

  return (
    <div className="space-y-4 mt-4 p-4 bg-slate-50 rounded-lg">
      <h4 className="font-medium text-sm text-slate-700">Calculate</h4>
      
      {/* Variable inputs */}
      {components.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {components.map((comp, idx) => (
            <label key={idx} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                className="rounded"
                onChange={(e) => handleInputChange(comp.variable || comp.condition, e.target.checked ? 1 : 0)}
              />
              <span>{comp.condition}</span>
              <Badge variant="outline" className="ml-auto">{comp.points} pt{comp.points !== 1 ? 's' : ''}</Badge>
            </label>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(variables).filter(([key]) => !['6.1', '0.03', 'R', 'κ', 'α'].includes(key)).slice(0, 6).map(([varName, varInfo]) => (
            <div key={varName} className="space-y-1">
              <Label className="text-xs">{varInfo.description || varName}</Label>
              <div className="flex items-center space-x-1">
                <Input
                  type="number"
                  placeholder={varInfo.normal_range || varInfo.normal || '0'}
                  className="h-8 text-sm"
                  onChange={(e) => handleInputChange(varName.replace(/[₂⁺⁻]/g, ''), e.target.value)}
                />
                <span className="text-xs text-slate-500 w-16">{varInfo.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Button onClick={calculateResult} className="w-full" size="sm">
        <Calculator className="w-4 h-4 mr-2" />
        Calculate
      </Button>
      
      {result && (
        <div className="p-3 bg-white rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Result:</span>
            <span className="text-xl font-bold text-blue-600">
              {result.value} {result.unit}
            </span>
          </div>
          {interpretation && (
            <div className="mt-2 flex items-start space-x-2 text-sm">
              <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">{interpretation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Equation Card Component
const EquationCard = ({ equation, expanded, onToggle }) => {
  const Icon = CATEGORY_ICONS[equation.equation_category] || Calculator;
  const colorClass = CATEGORY_COLORS[equation.equation_category] || 'bg-gray-100 text-gray-800';

  return (
    <Card className={`transition-all ${expanded ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-2 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base">{equation.name}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {equation.subcategory?.replace(/_/g, ' ')}
              </CardDescription>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0">
          {/* Equation display */}
          <div className="p-3 bg-slate-900 text-white rounded-lg font-mono text-sm overflow-x-auto">
            {equation.equation}
          </div>
          
          {/* Variables */}
          {equation.variables && Object.keys(equation.variables).length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Variables</h4>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {Object.entries(equation.variables).slice(0, 8).map(([name, info]) => (
                  <div key={name} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-medium">{name}</span>
                    <span className="text-slate-600">
                      {typeof info === 'object' ? info.description : info}
                      {info.normal_range && <span className="text-green-600 ml-1">(N: {info.normal_range})</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Clinical Thresholds */}
          {equation.clinical_thresholds && Object.keys(equation.clinical_thresholds).length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Clinical Thresholds</h4>
              <div className="grid grid-cols-1 gap-1">
                {Object.entries(equation.clinical_thresholds).slice(0, 6).map(([threshold, meaning]) => (
                  <div key={threshold} className="flex items-start text-xs py-1">
                    <Badge variant="outline" className="mr-2 font-mono">{threshold}</Badge>
                    <span className="text-slate-600">{meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Interpretation */}
          {equation.interpretation && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
              <strong>Interpretation:</strong> {equation.interpretation}
            </div>
          )}
          
          {/* When to use */}
          {equation.when_to_use && (
            <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
              <strong>When to use:</strong> {equation.when_to_use}
            </div>
          )}
          
          {/* Limitations */}
          {equation.limitations && equation.limitations.length > 0 && (
            <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-800">
              <strong>Limitations:</strong>
              <ul className="list-disc list-inside mt-1">
                {equation.limitations.slice(0, 3).map((lim, i) => <li key={i}>{lim}</li>)}
              </ul>
            </div>
          )}
          
          {/* Calculator */}
          <EquationCalculator equation={equation} />
        </CardContent>
      )}
    </Card>
  );
};

// Main Page Component
const EquationsPage = () => {
  const [equations, setEquations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedEquation, setExpandedEquation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchEquations();
  }, []);

  const fetchEquations = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/equations`);
      const data = await response.json();
      
      // Handle different response formats
      if (data.all_equations) {
        // New format with all_equations array
        setEquations(data.all_equations);
        setCategories(data.categories || []);
      } else if (Array.isArray(data)) {
        // Direct array format
        setEquations(data);
      } else if (typeof data === 'object' && !Array.isArray(data)) {
        // Category-based dict format (legacy)
        const allEquations = [];
        const cats = Object.keys(data);
        
        cats.forEach(category => {
          const categoryEquations = data[category];
          if (typeof categoryEquations === 'object') {
            Object.entries(categoryEquations).forEach(([id, eq]) => {
              allEquations.push({
                id,
                equation_category: category,
                ...eq
              });
            });
          }
        });
        
        setEquations(allEquations);
        setCategories(cats);
      }
    } catch (error) {
      console.error('Error fetching equations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquations = equations.filter(eq => {
    const matchesCategory = selectedCategory === 'all' || eq.equation_category === selectedCategory;
    const matchesSearch = !searchTerm || 
      eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.equation?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryStats = categories.reduce((acc, cat) => {
    acc[cat] = equations.filter(eq => eq.equation_category === cat).length;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                Medical Equations Library
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {equations.length} equations across {categories.length} categories
              </p>
            </div>
            <Input
              placeholder="Search equations..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Categories */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Categories</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                    className="w-full justify-between text-sm h-9"
                    onClick={() => setSelectedCategory('all')}
                  >
                    <span>All Equations</span>
                    <Badge variant="secondary">{equations.length}</Badge>
                  </Button>
                  {categories.map(cat => {
                    const Icon = CATEGORY_ICONS[cat] || Calculator;
                    return (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? 'default' : 'ghost'}
                        className="w-full justify-between text-sm h-9"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        <span className="flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          {cat.replace(/_/g, ' ')}
                        </span>
                        <Badge variant="secondary">{categoryStats[cat] || 0}</Badge>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Reference</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs space-y-2">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Evidence-based formulas
                </div>
                <div className="flex items-center text-blue-700">
                  <Info className="w-3 h-3 mr-1" />
                  Clinical thresholds included
                </div>
                <div className="flex items-center text-amber-700">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Limitations documented
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Equations List */}
          <div className="flex-1">
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pr-4">
                {filteredEquations.map(eq => (
                  <EquationCard
                    key={eq.id}
                    equation={eq}
                    expanded={expandedEquation === eq.id}
                    onToggle={() => setExpandedEquation(expandedEquation === eq.id ? null : eq.id)}
                  />
                ))}
              </div>
              
              {filteredEquations.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No equations found matching your criteria</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquationsPage;
