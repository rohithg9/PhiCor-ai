import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Apple, Salad, Fish, Wheat, Droplets, Heart, Brain,
  AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp,
  Activity, Zap, Shield, Target, Pill, User, Scan,
  TrendingUp, TrendingDown, Minus, Loader2, Plus, X, FileText,
  Beaker, Dna, Scale, Clock, UtensilsCrossed, Leaf, Globe,
  Settings, Sparkles, Flame, FlaskConical, Microscope, TestTube,
  Layers, Atom, CircleDot, Gauge, Thermometer, Wind, Eye,
  Coffee, GlassWater, Utensils, Cookie, Carrot, Milk, Grape,
  Send, ClipboardList, Calculator, Edit3, RefreshCw, Menu
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import FeatureNav from '../components/FeatureNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Scale levels for food analysis
const FOOD_SCALES = [
  { id: 'overview', name: 'Overview', icon: '📊' },
  { id: 'macros', name: 'Macros', icon: '🍽️' },
  { id: 'micros', name: 'Micros', icon: '💊' },
  { id: 'params', name: 'Parameters', icon: '📈' },
  { id: 'organs', name: 'Organs', icon: '🫀' },
  { id: 'risks', name: 'Risks', icon: '⚠️' },
];

// Food category icons (auto-detected, not manually selected)
const FOOD_ICONS = {
  dishes: '🍽️', fruits: '🍎', vegetables: '🥬', proteins: '🥩',
  grains: '🌾', dairy: '🥛', beverages: '🥤', supplements: '💊',
  nutrients: '🧪', custom: '🔍', default: '🍴'
};

// Quick suggestions for empty state
const QUICK_FOODS = [
  'Banana', 'Salmon', 'Spinach', 'Chicken Tikka', 'Green Tea',
  'Vitamin D', 'Avocado', 'Oatmeal', 'Eggs', 'Almonds'
];

// Common conditions
const COMMON_CONDITIONS = [
  'Diabetes Type 2', 'Diabetes Type 1', 'Hypertension', 'Heart Failure',
  'CKD', 'Liver Disease', 'Gout', 'Obesity', 'Anemia', 'Hypothyroidism'
];

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Wheat/Gluten', 'Soy'
];

// Organ icons
const ORGAN_ICONS = {
  cardiovascular: Heart, heart: Heart, renal: Droplets, kidneys: Droplets,
  hepatic: Activity, liver: Activity, glycemic: Gauge, pancreas: Beaker,
  gastrointestinal: Salad, neurological: Brain, brain: Brain,
  musculoskeletal: Shield, immune: Shield
};

// Get food icon based on name
const getFoodIcon = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('vitamin') || n.includes('supplement') || n.includes('omega')) return '💊';
  if (n.includes('juice') || n.includes('water') || n.includes('tea') || n.includes('coffee') || n.includes('cola')) return '🥤';
  if (n.includes('chicken') || n.includes('beef') || n.includes('fish') || n.includes('salmon') || n.includes('egg')) return '🥩';
  if (n.includes('rice') || n.includes('bread') || n.includes('pasta') || n.includes('oat')) return '🌾';
  if (n.includes('milk') || n.includes('cheese') || n.includes('yogurt')) return '🥛';
  if (n.includes('apple') || n.includes('banana') || n.includes('orange') || n.includes('mango') || n.includes('berry')) return '🍎';
  if (n.includes('spinach') || n.includes('broccoli') || n.includes('carrot') || n.includes('salad')) return '🥬';
  if (n.includes('pizza') || n.includes('burger') || n.includes('curry') || n.includes('tikka') || n.includes('biryani')) return '🍽️';
  return '🍴';
};

// Nutrient bar component
const NutrientBar = ({ label, value, unit, percent, color = 'bg-green-500', isDark }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {value}{unit} {percent && <span className="text-[10px]">({percent}%)</span>}
        </span>
      </div>
      <div className={`h-1.5 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(percent || value/10, 100)}%` }} />
      </div>
    </div>
  );
};

// Parameter Effect Card
const ParameterCard = ({ param, isDark }) => {
  if (!param) return null;
  return (
    <div className={`p-2 rounded-lg border ${
      param.direction === 'increase' ? (isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200') :
      param.direction === 'decrease' ? (isDark ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-200') :
      (isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200')
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {param.parameter?.replace(/_/g, ' ')}
        </span>
        <div className="flex items-center gap-1">
          {param.direction === 'increase' && <TrendingUp className="w-3 h-3 text-red-500" />}
          {param.direction === 'decrease' && <TrendingDown className="w-3 h-3 text-blue-500" />}
          {param.direction === 'neutral' && <Minus className="w-3 h-3 text-gray-400" />}
        </div>
      </div>
      {param.mechanism && (
        <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{param.mechanism}</p>
      )}
    </div>
  );
};

// Main Component
const FoodAnalysisPage = () => {
  const { isDark } = useTheme();
  
  // Core state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Analysis state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeScale, setActiveScale] = useState('overview');
  
  // Mobile panel state
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [activeTab, setActiveTab] = useState('intake');
  
  // Health profile
  const [healthProfile, setHealthProfile] = useState({
    conditions: [],
    medications: [],
    allergies: [],
  });
  
  // Food intake text (for multi-food analysis)
  const [foodIntake, setFoodIntake] = useState('');
  const [isAnalyzingIntake, setIsAnalyzingIntake] = useState(false);

  // Smart search - auto-categorizes and finds matches
  const smartSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setIsSearching(true);
    setShowResults(true);
    
    // Generate smart suggestions based on query
    const results = [];
    const q = query.toLowerCase();
    
    // Add main search result
    results.push({
      id: `search_${q}`,
      name: query,
      type: 'search',
      description: 'Analyze with PhiCor'
    });
    
    // Add related suggestions
    const suggestions = [
      { name: 'Banana', keywords: ['banana', 'fruit', 'potassium'] },
      { name: 'Salmon', keywords: ['salmon', 'fish', 'omega', 'protein'] },
      { name: 'Spinach', keywords: ['spinach', 'vegetable', 'iron', 'green'] },
      { name: 'Chicken Tikka Masala', keywords: ['chicken', 'tikka', 'curry', 'indian'] },
      { name: 'Green Tea', keywords: ['tea', 'green', 'antioxidant'] },
      { name: 'Vitamin D', keywords: ['vitamin', 'd', 'supplement'] },
      { name: 'Avocado', keywords: ['avocado', 'healthy', 'fat'] },
      { name: 'Oatmeal', keywords: ['oat', 'fiber', 'breakfast'] },
      { name: 'Eggs', keywords: ['egg', 'protein', 'breakfast'] },
      { name: 'Almonds', keywords: ['almond', 'nut', 'snack'] },
      { name: 'Pizza', keywords: ['pizza', 'cheese', 'italian'] },
      { name: 'Coca-Cola', keywords: ['cola', 'soda', 'sugar'] },
      { name: 'Coffee', keywords: ['coffee', 'caffeine'] },
      { name: 'Rice', keywords: ['rice', 'carb', 'grain'] },
      { name: 'Yogurt', keywords: ['yogurt', 'dairy', 'probiotic'] },
      { name: 'Apple', keywords: ['apple', 'fruit'] },
      { name: 'Broccoli', keywords: ['broccoli', 'vegetable'] },
      { name: 'Pasta Carbonara', keywords: ['pasta', 'carbonara', 'italian'] },
      { name: 'Potassium', keywords: ['potassium', 'mineral', 'electrolyte'] },
      { name: 'Sodium', keywords: ['sodium', 'salt', 'mineral'] },
      { name: 'Iron Supplement', keywords: ['iron', 'supplement', 'mineral'] },
      { name: 'Omega-3 Fish Oil', keywords: ['omega', 'fish', 'oil', 'supplement'] },
    ];
    
    suggestions.forEach(s => {
      if (s.keywords.some(k => k.includes(q) || q.includes(k)) && 
          s.name.toLowerCase() !== q) {
        results.push({
          id: `suggest_${s.name.toLowerCase().replace(/\s+/g, '_')}`,
          name: s.name,
          type: 'suggestion',
          description: 'Quick analysis'
        });
      }
    });
    
    setSearchResults(results.slice(0, 8));
    setIsSearching(false);
  }, []);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => smartSearch(searchQuery), 150);
    return () => clearTimeout(timer);
  }, [searchQuery, smartSearch]);
  
  // Analyze single food
  const analyzeFood = async (foodName) => {
    setShowResults(false);
    setSearchQuery(foodName);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setActiveScale('overview');
    
    try {
      // Use deep analysis endpoint for comprehensive results
      const response = await fetch(`${BACKEND_URL}/api/food/analyze-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: foodName,
          serving_size: '1 standard serving',
          health_profile: healthProfile.conditions.length > 0 || healthProfile.medications.length > 0 ? healthProfile : null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
        toast.success('PhiCor analysis complete');
      } else {
        throw new Error(data.detail || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Analyze multi-food intake (lunch, dinner, etc.)
  const analyzeMultiFoodIntake = async () => {
    if (!foodIntake.trim()) {
      toast.error('Please enter what you ate');
      return;
    }
    
    setIsAnalyzingIntake(true);
    setAnalysisResult(null);
    setActiveScale('overview');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/food/analyze-daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daily_intake_text: foodIntake,
          health_profile: healthProfile.conditions.length > 0 || healthProfile.medications.length > 0 ? healthProfile : null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
        setShowMobilePanel(false);
        toast.success('Multi-food analysis complete');
      } else {
        throw new Error(data.detail || 'Analysis failed');
      }
    } catch (error) {
      console.error('Multi-food analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzingIntake(false);
    }
  };
  
  // Add condition
  const addCondition = (cond) => {
    if (!healthProfile.conditions.includes(cond)) {
      setHealthProfile(prev => ({ ...prev, conditions: [...prev.conditions, cond] }));
    }
  };
  
  // Add allergy
  const addAllergy = (allergy) => {
    if (!healthProfile.allergies.includes(allergy)) {
      setHealthProfile(prev => ({ ...prev, allergies: [...prev.allergies, allergy] }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Π Food Analysis | PhiCor.ai</title>
      </Helmet>
      
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <FeatureNav />
        
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
          {/* Header with Search */}
          <div className={`rounded-xl border p-3 sm:p-4 mb-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Pi Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-white text-xl sm:text-2xl font-bold">Π</span>
              </div>
              
              {/* Search Input */}
              <div className="flex-1 relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  onKeyPress={(e) => e.key === 'Enter' && searchQuery.trim() && analyzeFood(searchQuery)}
                  placeholder="Search any food, dish, vitamin..."
                  className={`text-sm sm:text-base h-10 sm:h-11 pr-10 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                />
                {isSearching || isAnalyzing ? (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-green-500" />
                ) : (
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                )}
                
                {/* Search Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className={`absolute z-50 left-0 right-0 mt-2 rounded-xl border shadow-xl overflow-hidden ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => analyzeFood(item.name)}
                        className={`w-full p-3 text-left flex items-center gap-3 border-b last:border-0 ${
                          isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{getFoodIcon(item.name)}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {item.description}
                          </div>
                        </div>
                        <Badge className="text-[9px] bg-green-500/20 text-green-500 flex-shrink-0">Π</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Profile/Panel Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowMobilePanel(true)}
                className="flex-shrink-0 h-10 sm:h-11 px-2 sm:px-3"
              >
                <Menu className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline text-xs">Profile</span>
              </Button>
            </div>
            
            {/* Health Profile Tags (if any) */}
            {(healthProfile.conditions.length > 0 || healthProfile.allergies.length > 0) && (
              <div className="flex flex-wrap gap-1 mt-3">
                {healthProfile.conditions.map((c, i) => (
                  <Badge key={i} className="text-[10px] bg-blue-500/20 text-blue-400 cursor-pointer"
                    onClick={() => setHealthProfile(prev => ({ ...prev, conditions: prev.conditions.filter((_, idx) => idx !== i) }))}>
                    {c} <X className="w-2 h-2 ml-1" />
                  </Badge>
                ))}
                {healthProfile.allergies.map((a, i) => (
                  <Badge key={i} className="text-[10px] bg-red-500/20 text-red-400 cursor-pointer"
                    onClick={() => setHealthProfile(prev => ({ ...prev, allergies: prev.allergies.filter((_, idx) => idx !== i) }))}>
                    {a} <X className="w-2 h-2 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Mobile Side Panel */}
          <AnimatePresence>
            {showMobilePanel && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setShowMobilePanel(false)}
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25 }}
                  className={`fixed right-0 top-0 h-full w-[85%] max-w-sm z-50 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
                >
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Food Analysis
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowMobilePanel(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                      <TabsList className="w-full grid grid-cols-2 mb-4">
                        <TabsTrigger value="intake" className="text-xs">Food Intake</TabsTrigger>
                        <TabsTrigger value="profile" className="text-xs">Health Profile</TabsTrigger>
                      </TabsList>
                      
                      {/* Food Intake Tab */}
                      <TabsContent value="intake" className="flex-1 flex flex-col mt-0">
                        <div className={`p-3 rounded-lg mb-3 ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                          <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                            💡 Type what you had for a meal (breakfast, lunch, dinner) and get combined analysis with individual breakdowns.
                          </p>
                        </div>
                        
                        <Textarea
                          value={foodIntake}
                          onChange={(e) => setFoodIntake(e.target.value)}
                          placeholder="Example:
For lunch I had:
- Chicken tikka masala with rice
- 1 roti
- Glass of mango lassi
- Some salad

Or paste your full day's intake..."
                          className={`flex-1 min-h-[200px] text-sm ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                        />
                        
                        <Button 
                          onClick={analyzeMultiFoodIntake}
                          disabled={isAnalyzingIntake || !foodIntake.trim()}
                          className="mt-3 w-full bg-gradient-to-r from-green-500 to-emerald-500"
                        >
                          {isAnalyzingIntake ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                          ) : (
                            <><Calculator className="w-4 h-4 mr-2" /> Analyze Intake</>
                          )}
                        </Button>
                      </TabsContent>
                      
                      {/* Health Profile Tab */}
                      <TabsContent value="profile" className="flex-1 overflow-y-auto mt-0">
                        {/* Conditions */}
                        <div className="mb-4">
                          <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Medical Conditions
                          </label>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {COMMON_CONDITIONS.map(c => (
                              <button
                                key={c}
                                onClick={() => addCondition(c)}
                                className={`px-2 py-1 rounded text-[10px] border ${
                                  healthProfile.conditions.includes(c)
                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                    : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Allergies */}
                        <div className="mb-4">
                          <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Food Allergies
                          </label>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {COMMON_ALLERGIES.map(a => (
                              <button
                                key={a}
                                onClick={() => addAllergy(a)}
                                className={`px-2 py-1 rounded text-[10px] border ${
                                  healthProfile.allergies.includes(a)
                                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                    : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                                }`}
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Clear */}
                        {(healthProfile.conditions.length > 0 || healthProfile.allergies.length > 0) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setHealthProfile({ conditions: [], medications: [], allergies: [] })}
                            className="w-full text-xs"
                          >
                            Clear Profile
                          </Button>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          {/* Main Content */}
          {isAnalyzing ? (
            <div className={`rounded-xl border p-8 sm:p-12 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 relative">
                <Loader2 className="w-16 h-16 sm:w-20 sm:h-20 animate-spin text-green-500" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl sm:text-2xl font-bold text-green-500">Π</span>
              </div>
              <h3 className={`text-base sm:text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                PhiCor Analysis
              </h3>
              <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Deep analysis in progress...
              </p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-3 sm:space-y-4">
              {/* Result Header */}
              <div className={`rounded-xl border p-3 sm:p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <span className="text-2xl">{getFoodIcon(analysisResult.product_name || analysisResult.dish_name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-lg sm:text-xl font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {analysisResult.product_name || analysisResult.dish_name}
                    </h2>
                    <p className={`text-xs sm:text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {analysisResult.description}
                    </p>
                  </div>
                  {/* Health Score */}
                  <div className="flex-shrink-0 text-center">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${
                      (analysisResult.clinical_summary?.healthfulness_score || 50) >= 70 ? 'bg-green-500' :
                      (analysisResult.clinical_summary?.healthfulness_score || 50) >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}>
                      <span className="text-white text-lg sm:text-xl font-bold">
                        {analysisResult.clinical_summary?.healthfulness_score || analysisResult.healthfulness_score || '—'}
                      </span>
                    </div>
                    <p className={`text-[9px] sm:text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Score</p>
                  </div>
                </div>
              </div>
              
              {/* Scale Tabs */}
              <div className={`rounded-xl border p-2 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {FOOD_SCALES.map(scale => (
                    <button
                      key={scale.id}
                      onClick={() => setActiveScale(scale.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
                        activeScale === scale.id
                          ? 'bg-green-500 text-white'
                          : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span>{scale.icon}</span>
                      <span>{scale.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tab Content */}
              {activeScale === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Quick Stats */}
                  <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Quick Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {analysisResult.complete_nutritional_profile?.macronutrients?.energy_kcal || 
                           analysisResult.macronutrients?.calories?.value || '—'}
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Calories</div>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {analysisResult.complete_nutritional_profile?.macronutrients?.protein_g || 
                           analysisResult.macronutrients?.protein?.value || '—'}g
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Protein</div>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {analysisResult.complete_nutritional_profile?.macronutrients?.carbohydrates_g || 
                           analysisResult.macronutrients?.carbohydrates?.total?.value || '—'}g
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Carbs</div>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {analysisResult.complete_nutritional_profile?.macronutrients?.fat_total_g || 
                           analysisResult.macronutrients?.fats?.total?.value || '—'}g
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Fat</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Key Insights */}
                  <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Key Insights
                    </h3>
                    {analysisResult.clinical_summary?.key_benefits?.length > 0 && (
                      <div className="mb-2">
                        {analysisResult.clinical_summary.key_benefits.slice(0, 3).map((b, i) => (
                          <div key={i} className="flex items-start gap-2 mb-1">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {analysisResult.clinical_summary?.key_concerns?.length > 0 && (
                      <div>
                        {analysisResult.clinical_summary.key_concerns.slice(0, 3).map((c, i) => (
                          <div key={i} className="flex items-start gap-2 mb-1">
                            <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{c}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {analysisResult.clinical_summary?.patient_friendly_summary && (
                      <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {analysisResult.clinical_summary.patient_friendly_summary}
                      </p>
                    )}
                  </div>
                  
                  {/* Ingredients (if available) */}
                  {analysisResult.ingredients_breakdown?.primary_ingredients?.length > 0 && (
                    <div className={`rounded-xl border p-4 sm:col-span-2 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                      <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Ingredients ({analysisResult.ingredients_breakdown.total_ingredient_count || analysisResult.ingredients_breakdown.primary_ingredients.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.ingredients_breakdown.primary_ingredients.map((ing, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {ing.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeScale === 'macros' && (
                <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Macronutrients
                  </h3>
                  <div className="space-y-3">
                    <NutrientBar 
                      label="Calories" 
                      value={analysisResult.complete_nutritional_profile?.macronutrients?.energy_kcal || analysisResult.macronutrients?.calories?.value} 
                      unit=" kcal" 
                      percent={(analysisResult.complete_nutritional_profile?.macronutrients?.energy_kcal || analysisResult.macronutrients?.calories?.value || 0)/20}
                      color="bg-orange-500"
                      isDark={isDark}
                    />
                    <NutrientBar 
                      label="Protein" 
                      value={analysisResult.complete_nutritional_profile?.macronutrients?.protein_g || analysisResult.macronutrients?.protein?.value} 
                      unit="g" 
                      percent={(analysisResult.complete_nutritional_profile?.macronutrients?.protein_g || 0)*2}
                      color="bg-red-500"
                      isDark={isDark}
                    />
                    <NutrientBar 
                      label="Carbohydrates" 
                      value={analysisResult.complete_nutritional_profile?.macronutrients?.carbohydrates_g || analysisResult.macronutrients?.carbohydrates?.total?.value} 
                      unit="g" 
                      percent={(analysisResult.complete_nutritional_profile?.macronutrients?.carbohydrates_g || 0)/3}
                      color="bg-yellow-500"
                      isDark={isDark}
                    />
                    <NutrientBar 
                      label="Fat" 
                      value={analysisResult.complete_nutritional_profile?.macronutrients?.fat_total_g || analysisResult.macronutrients?.fats?.total?.value} 
                      unit="g" 
                      percent={(analysisResult.complete_nutritional_profile?.macronutrients?.fat_total_g || 0)*1.5}
                      color="bg-blue-500"
                      isDark={isDark}
                    />
                    <NutrientBar 
                      label="Sugar" 
                      value={analysisResult.complete_nutritional_profile?.macronutrients?.sugars_g || analysisResult.macronutrients?.carbohydrates?.sugar?.value} 
                      unit="g" 
                      percent={(analysisResult.complete_nutritional_profile?.macronutrients?.sugars_g || 0)*4}
                      color="bg-pink-500"
                      isDark={isDark}
                    />
                    <NutrientBar 
                      label="Fiber" 
                      value={analysisResult.complete_nutritional_profile?.macronutrients?.fiber_g || analysisResult.macronutrients?.carbohydrates?.fiber?.value} 
                      unit="g" 
                      percent={(analysisResult.complete_nutritional_profile?.macronutrients?.fiber_g || 0)*4}
                      color="bg-green-500"
                      isDark={isDark}
                    />
                  </div>
                </div>
              )}
              
              {activeScale === 'micros' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Electrolytes */}
                  <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Electrolytes
                    </h3>
                    <div className="space-y-2">
                      {analysisResult.complete_nutritional_profile?.electrolytes ? 
                        Object.entries(analysisResult.complete_nutritional_profile.electrolytes).map(([key, val], i) => (
                          <div key={i} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <div className="flex justify-between">
                              <span className={`text-xs capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {key.replace(/_mg|_mcg/g, '')}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {val.value}mg {val.percent_daily && <span className="text-green-500">({val.percent_daily}%)</span>}
                              </span>
                            </div>
                          </div>
                        )) : (
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          No electrolyte data available
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Vitamins */}
                  <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Vitamins
                    </h3>
                    <div className="space-y-2">
                      {analysisResult.complete_nutritional_profile?.vitamins ? 
                        Object.entries(analysisResult.complete_nutritional_profile.vitamins).slice(0, 6).map(([key, val], i) => (
                          <div key={i} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <div className="flex justify-between">
                              <span className={`text-xs capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {key.replace(/_/g, ' ').replace(/mcg|mg|rae|dfe/gi, '').trim()}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {val.value}{key.includes('mcg') ? 'mcg' : 'mg'}
                              </span>
                            </div>
                          </div>
                        )) : (
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          No vitamin data available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeScale === 'params' && (
                <div className="space-y-3">
                  {analysisResult.organ_system_parameter_effects ? (
                    Object.entries(analysisResult.organ_system_parameter_effects).map(([system, data]) => (
                      <div key={system} className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          {system === 'cardiovascular' && <Heart className="w-4 h-4 text-red-500" />}
                          {system === 'renal' && <Droplets className="w-4 h-4 text-blue-500" />}
                          {system === 'hepatic' && <Activity className="w-4 h-4 text-amber-500" />}
                          {system === 'glycemic' && <Gauge className="w-4 h-4 text-purple-500" />}
                          {system === 'gastrointestinal' && <Salad className="w-4 h-4 text-green-500" />}
                          {system === 'neurological' && <Brain className="w-4 h-4 text-pink-500" />}
                          <span className={`text-sm font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {system}
                          </span>
                          <Badge className={`text-[9px] ${
                            data.overall_effect === 'beneficial' ? 'bg-green-500/20 text-green-400' :
                            data.overall_effect === 'caution' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {data.overall_effect}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {data.parameters_affected?.slice(0, 6).map((param, i) => (
                            <ParameterCard key={i} param={param} isDark={isDark} />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`rounded-xl border p-8 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Parameter-level effects not available for this analysis.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {activeScale === 'organs' && (
                <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Organ System Effects
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {analysisResult.organ_system_parameter_effects ? 
                      Object.entries(analysisResult.organ_system_parameter_effects).map(([system, data]) => {
                        const Icon = ORGAN_ICONS[system] || Activity;
                        return (
                          <div key={system} className={`p-3 rounded-lg border text-center ${
                            data.overall_effect === 'beneficial' ? (isDark ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200') :
                            data.overall_effect === 'caution' ? (isDark ? 'bg-orange-900/20 border-orange-800/30' : 'bg-orange-50 border-orange-200') :
                            (isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200')
                          }`}>
                            <Icon className={`w-6 h-6 mx-auto mb-2 ${
                              data.overall_effect === 'beneficial' ? 'text-green-500' :
                              data.overall_effect === 'caution' ? 'text-orange-500' : 'text-gray-400'
                            }`} />
                            <div className={`text-xs font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {system}
                            </div>
                            <Badge className={`mt-1 text-[9px] ${
                              data.overall_effect === 'beneficial' ? 'bg-green-500/20 text-green-400' :
                              data.overall_effect === 'caution' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {data.overall_effect}
                            </Badge>
                          </div>
                        );
                      }) : (
                      <p className={`col-span-full text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Organ effects not available
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {activeScale === 'risks' && (
                <div className="space-y-3">
                  {analysisResult.personalized_risk_assessment ? (
                    <>
                      {/* Suitability */}
                      <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Suitability for Your Profile
                          </span>
                          <Badge className={`${
                            analysisResult.personalized_risk_assessment.overall_suitability === 'highly_suitable' ? 'bg-green-500' :
                            analysisResult.personalized_risk_assessment.overall_suitability === 'suitable' ? 'bg-emerald-500' :
                            analysisResult.personalized_risk_assessment.overall_suitability === 'caution' ? 'bg-yellow-500' :
                            'bg-red-500'
                          } text-white`}>
                            {analysisResult.personalized_risk_assessment.overall_suitability?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Condition Risks */}
                      {analysisResult.personalized_risk_assessment.condition_specific_analysis?.length > 0 && (
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-orange-900/20 border-orange-800/30' : 'bg-orange-50 border-orange-200'}`}>
                          <h3 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                            <AlertTriangle className="w-4 h-4" />
                            Condition-Specific Risks
                          </h3>
                          {analysisResult.personalized_risk_assessment.condition_specific_analysis.map((ca, i) => (
                            <div key={i} className={`p-3 rounded-lg mb-2 ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {ca.condition}
                                </span>
                                <Badge className={`text-[9px] ${
                                  ca.risk_level === 'high' || ca.risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                                  ca.risk_level === 'moderate' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {ca.risk_level} risk
                                </Badge>
                              </div>
                              {ca.specific_concerns?.slice(0, 2).map((concern, j) => (
                                <p key={j} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  • {concern.nutrient_or_ingredient}: {concern.reason}
                                </p>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={`rounded-xl border p-8 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                      <Shield className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Add your health profile for personalized risk assessment
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => { setShowMobilePanel(true); setActiveTab('profile'); }}
                      >
                        Setup Profile
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className={`rounded-xl border p-6 sm:p-12 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-green-500">Π</span>
              </div>
              <h3 className={`text-base sm:text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                PhiCor Food Analysis
              </h3>
              <p className={`text-xs sm:text-sm mb-4 sm:mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Search any food, dish, supplement, or nutrient for deep analysis
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                {QUICK_FOODS.map(food => (
                  <Button
                    key={food}
                    variant="outline"
                    size="sm"
                    onClick={() => analyzeFood(food)}
                    className="text-xs"
                  >
                    {getFoodIcon(food)} {food}
                  </Button>
                ))}
              </div>
              
              <div className="mt-6">
                <Button 
                  variant="outline"
                  onClick={() => { setShowMobilePanel(true); setActiveTab('intake'); }}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Analyze Your Meal
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FoodAnalysisPage;
