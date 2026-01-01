import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, Search, ChevronDown, ChevronRight, Info,
  Heart, Wind, Brain, Activity, Droplets, FlaskConical,
  Thermometer, Pill, AlertTriangle, Check, X, BookOpen
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { CLINICAL_CALCULATORS, calculateScore, getInterpretation, searchCalculators } from '../data/clinicalCalculators';

// Icon mapping for categories
const CATEGORY_ICONS = {
  cardiovascular: Heart,
  respiratory: Wind,
  neurological: Brain,
  renal: Droplets,
  hepatology: FlaskConical,
  emergency: AlertTriangle,
  hematology: Activity,
  endocrine: Thermometer,
  rheumatology: Pill,
  general: Calculator
};

// Calculator Input Component
const CalculatorInput = ({ input, value, onChange, isDark }) => {
  if (input.type === 'boolean') {
    return (
      <label className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
        value 
          ? isDark ? 'bg-emerald-900/30 border border-emerald-500/50' : 'bg-emerald-50 border border-emerald-300'
          : isDark ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-gray-50 hover:bg-gray-100'
      }`}>
        <div className="flex-1">
          <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {input.name}
          </span>
          {input.points !== undefined && (
            <span className={`ml-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              ({input.points > 0 ? '+' : ''}{input.points} pt{Math.abs(input.points) !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
          value 
            ? 'bg-emerald-500 text-white' 
            : isDark ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-300'
        }`}>
          {value && <Check className="w-4 h-4" />}
        </div>
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(input.id, e.target.checked)}
          className="hidden"
        />
      </label>
    );
  }
  
  if (input.type === 'select') {
    return (
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {input.name}
        </label>
        <select
          value={value ?? ''}
          onChange={(e) => onChange(input.id, e.target.value === '' ? null : parseFloat(e.target.value))}
          className={`w-full p-3 rounded-lg border text-sm ${
            isDark 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">Select...</option>
          {input.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }
  
  if (input.type === 'number') {
    return (
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {input.name}
        </label>
        <Input
          type="number"
          value={value ?? input.default ?? ''}
          onChange={(e) => onChange(input.id, e.target.value === '' ? null : parseFloat(e.target.value))}
          min={input.min}
          max={input.max}
          step="any"
          placeholder={input.default ? `Default: ${input.default}` : 'Enter value...'}
          className={isDark ? 'bg-gray-800 border-gray-700' : ''}
        />
      </div>
    );
  }
  
  return null;
};

// Main Calculator Component
const ClinicalCalculatorPanel = ({ isDark = true, initialCalculator = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCalculator, setSelectedCalculator] = useState(initialCalculator);
  const [inputs, setInputs] = useState({});
  const [showResult, setShowResult] = useState(false);
  
  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchCalculators(searchQuery);
  }, [searchQuery]);
  
  // Handle input change
  const handleInputChange = (inputId, value) => {
    setInputs(prev => ({ ...prev, [inputId]: value }));
    setShowResult(false);
  };
  
  // Calculate result
  const result = useMemo(() => {
    if (!selectedCalculator) return null;
    const score = calculateScore(selectedCalculator, inputs);
    const interpretation = getInterpretation(selectedCalculator, score);
    return { score, interpretation };
  }, [selectedCalculator, inputs]);
  
  // Select a calculator
  const selectCalculator = (calc) => {
    setSelectedCalculator(calc);
    setInputs({});
    setShowResult(false);
    setSearchQuery('');
  };
  
  // Reset calculator
  const resetCalculator = () => {
    setInputs({});
    setShowResult(false);
  };
  
  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Clinical Calculators
            </h2>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Scoring systems & diagnostic tools
            </p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <Input
            placeholder="Search calculators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
          />
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className={`mt-2 p-2 rounded-lg max-h-48 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {searchResults.map(calc => (
              <button
                key={calc.id}
                onClick={() => selectCalculator(calc)}
                className={`w-full text-left p-2 rounded flex items-center gap-2 ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <Badge className="text-[10px]">{calc.categoryName}</Badge>
                <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {calc.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Category Sidebar */}
        <div className={`w-48 border-r overflow-y-auto ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="p-2 space-y-1">
            {Object.entries(CLINICAL_CALCULATORS).map(([key, category]) => {
              const Icon = CATEGORY_ICONS[key] || Calculator;
              const isSelected = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(isSelected ? null : key)}
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition-all ${
                    isSelected
                      ? isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                      : isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{category.name}</span>
                  <Badge className="ml-auto text-[10px]">{category.calculators.length}</Badge>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Calculator List */}
          {!selectedCalculator && (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {selectedCategory ? (
                  CLINICAL_CALCULATORS[selectedCategory].calculators.map(calc => (
                    <button
                      key={calc.id}
                      onClick={() => selectCalculator(calc)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isDark 
                          ? 'bg-gray-800/50 border-gray-700 hover:border-amber-500/50' 
                          : 'bg-white border-gray-200 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {calc.name}
                        </span>
                        <Badge className="text-[10px]">{calc.category}</Badge>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {calc.description}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Select a category to browse calculators</p>
                    <p className="text-xs mt-1">or search above</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          
          {/* Calculator Form */}
          {selectedCalculator && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Calculator Header */}
              <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCalculator(null)}
                    className="text-xs"
                  >
                    <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetCalculator}
                    className="text-xs"
                  >
                    Reset
                  </Button>
                </div>
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedCalculator.name}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedCalculator.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge>{selectedCalculator.category}</Badge>
                  {selectedCalculator.evidence && (
                    <Badge variant="outline" className="text-[10px]">
                      {selectedCalculator.evidence}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Inputs */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {selectedCalculator.inputs.map(input => (
                    <CalculatorInput
                      key={input.id}
                      input={input}
                      value={inputs[input.id]}
                      onChange={handleInputChange}
                      isDark={isDark}
                    />
                  ))}
                </div>
                
                {/* Formula */}
                {selectedCalculator.formula && (
                  <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Formula
                      </span>
                    </div>
                    <p className={`text-xs font-mono ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedCalculator.formula}
                    </p>
                  </div>
                )}
              </ScrollArea>
              
              {/* Result */}
              <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <Button
                  onClick={() => setShowResult(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Score
                </Button>
                
                <AnimatePresence>
                  {showResult && result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-4 p-4 rounded-lg ${
                        result.interpretation 
                          ? isDark ? 'bg-emerald-900/30 border border-emerald-500/50' : 'bg-emerald-50 border border-emerald-200'
                          : isDark ? 'bg-gray-800' : 'bg-gray-50'
                      }`}
                    >
                      <div className="text-center mb-3">
                        <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {typeof result.score === 'number' ? result.score.toFixed(1) : result.score}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Score
                        </div>
                      </div>
                      
                      {result.interpretation && (
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                          <div className={`font-medium text-sm mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            {result.interpretation.risk}
                          </div>
                          <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {result.interpretation.recommendation}
                          </p>
                        </div>
                      )}
                      
                      {selectedCalculator.reference && (
                        <p className={`text-[10px] mt-3 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Reference: {selectedCalculator.reference}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalCalculatorPanel;
