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
  Layers, Atom, CircleDot, Gauge, Thermometer, Wind, Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { toast } from 'sonner';
import FeatureNav from '../components/FeatureNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Scale levels for food analysis (like disease dashboard)
const FOOD_SCALES = [
  { id: 'macros', name: 'Macros', fullName: 'Macronutrients', icon: '🍽️', description: 'Proteins, Carbs, Fats' },
  { id: 'micros', name: 'Micros', fullName: 'Micronutrients', icon: '💊', description: 'Vitamins & Minerals' },
  { id: 'compounds', name: 'Bioactives', fullName: 'Bioactive Compounds', icon: '🧬', description: 'Phytochemicals, Antioxidants' },
  { id: 'metabolic', name: 'Metabolic', fullName: 'Metabolic Impact', icon: '⚡', description: 'Glycemic, Insulin Response' },
  { id: 'organs', name: 'Organs', fullName: 'Organ System Effects', icon: '🫀', description: 'Multi-organ impact' },
  { id: 'molecular', name: 'Molecular', fullName: 'Molecular Pathways', icon: '🔬', description: 'Cellular mechanisms' },
];

// Organ system icons mapping
const ORGAN_ICONS = {
  cardiovascular: Heart,
  heart: Heart,
  blood_vessels: Activity,
  blood: Droplets,
  gastrointestinal: Salad,
  stomach: FlaskConical,
  liver: Activity,
  gallbladder: Beaker,
  pancreas: Beaker,
  intestines: Salad,
  renal: Droplets,
  kidneys: Droplets,
  neurological: Brain,
  brain: Brain,
  nervous_system: Zap,
  musculoskeletal: Shield,
  muscles: Zap,
  bones: Shield,
  endocrine: Target,
  thyroid: Target,
  adrenals: Activity,
  immune: Shield,
  immune_system: Shield,
};

// Predefined conditions for health profile
const COMMON_CONDITIONS = [
  'Diabetes Type 2', 'Diabetes Type 1', 'Hypertension', 'Heart Failure', 'CKD (Chronic Kidney Disease)',
  'Liver Cirrhosis', 'Gout', 'Celiac Disease', 'NAFLD', 'Hyperlipidemia', 'Obesity',
  'Anemia', 'Osteoporosis', 'IBS', 'Crohn\'s Disease', 'GERD', 'Hypothyroidism',
  'Hyperthyroidism', 'Atrial Fibrillation', 'COPD', 'Asthma'
];

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Milk/Dairy', 'Eggs', 'Fish', 'Shellfish', 'Wheat/Gluten', 'Soy', 'Sesame'
];

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'halal', label: 'Halal', icon: '☪️' },
  { id: 'kosher', label: 'Kosher', icon: '✡️' },
  { id: 'gluten_free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'dairy_free', label: 'Dairy-Free', icon: '🥛' },
  { id: 'low_sodium', label: 'Low Sodium', icon: '🧂' },
  { id: 'low_carb', label: 'Low Carb', icon: '🍞' },
  { id: 'keto', label: 'Keto', icon: '🥑' },
  { id: 'paleo', label: 'Paleo', icon: '🦴' },
];

// Popular dishes for quick analysis
const POPULAR_DISHES = [
  'Chicken Tikka Masala', 'Pasta Carbonara', 'Sushi Roll', 'Caesar Salad',
  'Pad Thai', 'Burrito Bowl', 'Greek Salad', 'Ramen', 'Pizza Margherita',
  'Grilled Salmon', 'Quinoa Bowl', 'Avocado Toast', 'Biryani', 'Fish and Chips'
];

// Get effect color based on type
const getEffectColor = (effect, isDark) => {
  if (effect === 'beneficial') return isDark ? 'text-emerald-400' : 'text-emerald-600';
  if (effect === 'caution') return isDark ? 'text-orange-400' : 'text-orange-600';
  if (effect === 'neutral') return isDark ? 'text-gray-400' : 'text-gray-500';
  return isDark ? 'text-gray-400' : 'text-gray-500';
};

const getEffectBg = (effect, isDark) => {
  if (effect === 'beneficial') return isDark ? 'bg-emerald-900/30 border-emerald-700/50' : 'bg-emerald-50 border-emerald-200';
  if (effect === 'caution') return isDark ? 'bg-orange-900/30 border-orange-700/50' : 'bg-orange-50 border-orange-200';
  return isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100 border-gray-200';
};

// Nutrient bar component
const NutrientBar = ({ label, value, max, unit, percent, color, isDark }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {value}{unit} {percent && <span className="text-[10px]">({percent}% DV)</span>}
      </span>
    </div>
    <div className={`h-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <div 
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${Math.min((percent || (value/max*100)), 100)}%` }}
      />
    </div>
  </div>
);

// Organ Effect Card
const OrganEffectCard = ({ organ, data, isDark }) => {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = ORGAN_ICONS[organ] || Activity;
  
  return (
    <div className={`rounded-lg border p-3 transition-all ${getEffectBg(data?.effect, isDark)}`}>
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            data?.effect === 'beneficial' ? 'bg-emerald-500/20' :
            data?.effect === 'caution' ? 'bg-orange-500/20' : 'bg-gray-500/20'
          }`}>
            <IconComponent className={`w-4 h-4 ${getEffectColor(data?.effect, isDark)}`} />
          </div>
          <div className="text-left">
            <div className={`text-sm font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {organ.replace(/_/g, ' ')}
            </div>
            <Badge className={`text-[9px] px-1.5 py-0 ${
              data?.effect === 'beneficial' ? 'bg-emerald-500/20 text-emerald-400' :
              data?.effect === 'caution' ? 'bg-orange-500/20 text-orange-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {data?.effect || 'neutral'}
            </Badge>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {expanded && data?.mechanism && (
        <div className={`mt-2 pt-2 border-t text-xs ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
          <p className="leading-relaxed">{data.mechanism}</p>
          {data.parameters_affected && (
            <div className="mt-2 flex flex-wrap gap-1">
              {data.parameters_affected.map((param, i) => (
                <Badge key={i} variant="outline" className="text-[9px]">{param}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Component
const FoodAnalysisPage = () => {
  const { isDark } = useTheme();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Analysis state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeScale, setActiveScale] = useState('macros');
  const [servingSize, setServingSize] = useState('standard portion');
  
  // Health profile panel state
  const [showProfilePanel, setShowProfilePanel] = useState(true);
  const [activeProfileTab, setActiveProfileTab] = useState('conditions');
  const [healthProfile, setHealthProfile] = useState({
    age: '',
    sex: '',
    weight: '',
    height: '',
    activity_level: 'moderate',
    conditions: [],
    medications: [],
    allergies: [],
    dietary_restrictions: [],
    health_goals: [],
  });
  
  // Input states
  const [conditionSearch, setConditionSearch] = useState('');
  const [allergySearch, setAllergySearch] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  // Search foods from database
  const searchFoods = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsSearching(true);
    setShowSuggestions(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/food/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      
      const dbResults = data.success ? data.foods : [];
      const dishSuggestions = POPULAR_DISHES
        .filter(d => d.toLowerCase().includes(query.toLowerCase()))
        .map(d => ({ name: d, category: 'dish', source: 'popular', id: `dish_${d.toLowerCase().replace(/\s+/g, '_')}` }));
      
      const combined = [...dbResults];
      dishSuggestions.forEach(dish => {
        if (!combined.find(r => r.name.toLowerCase() === dish.name.toLowerCase())) {
          combined.push(dish);
        }
      });
      
      // Always add custom search option
      if (!combined.find(r => r.name.toLowerCase() === query.toLowerCase())) {
        combined.push({
          name: query,
          category: 'custom',
          source: 'search',
          id: `custom_${query.toLowerCase().replace(/\s+/g, '_')}`
        });
      }
      
      setSearchResults(combined.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([{
        name: searchQuery,
        category: 'custom',
        source: 'search',
        id: `custom_${searchQuery.toLowerCase().replace(/\s+/g, '_')}`
      }]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchFoods(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, searchFoods]);
  
  // Analyze food/dish
  const analyzeFood = async (food) => {
    setShowSuggestions(false);
    setSearchQuery(food.name);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/food/analyze-dish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dish_name: food.name,
          serving_size: servingSize,
          health_profile: healthProfile.conditions.length > 0 || healthProfile.allergies.length > 0 ? healthProfile : null
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
  
  // Filter suggestions
  const filteredConditions = COMMON_CONDITIONS.filter(c => 
    c.toLowerCase().includes(conditionSearch.toLowerCase()) &&
    !healthProfile.conditions.includes(c)
  );
  
  const filteredAllergies = COMMON_ALLERGIES.filter(a => 
    a.toLowerCase().includes(allergySearch.toLowerCase()) &&
    !healthProfile.allergies.includes(a)
  );

  return (
    <>
      <Helmet>
        <title>Π Food Analysis Engine | PhiCor.ai</title>
        <meta name="description" content="PhiCor's Mathematical Food Analysis Engine - Deep molecular and biochemical analysis of any food or dish with organ system effects." />
      </Helmet>
      
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <FeatureNav />
        
        <div className="flex h-[calc(100vh-64px)]">
          {/* Left Side Panel - Health Profile (like disease dashboard) */}
          <AnimatePresence>
            {showProfilePanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className={`flex-shrink-0 border-r overflow-hidden ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <User className="w-4 h-4 text-purple-500" />
                        Patient Profile
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowProfilePanel(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab}>
                      <TabsList className="w-full grid grid-cols-3 h-8 mb-3">
                        <TabsTrigger value="conditions" className="text-[10px]">Medical</TabsTrigger>
                        <TabsTrigger value="dietary" className="text-[10px]">Dietary</TabsTrigger>
                        <TabsTrigger value="biometrics" className="text-[10px]">Bio</TabsTrigger>
                      </TabsList>
                      
                      {/* Conditions Tab */}
                      <TabsContent value="conditions" className="space-y-3 mt-0">
                        {/* Medical Conditions */}
                        <div>
                          <label className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Medical Conditions
                          </label>
                          <div className="relative mt-1">
                            <Input
                              value={conditionSearch}
                              onChange={(e) => setConditionSearch(e.target.value)}
                              placeholder="Search conditions..."
                              className={`text-xs h-8 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                            />
                            {conditionSearch && filteredConditions.length > 0 && (
                              <div className={`absolute z-40 w-full mt-1 rounded-lg border max-h-32 overflow-y-auto ${
                                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                              }`}>
                                {filteredConditions.slice(0, 6).map(cond => (
                                  <button
                                    key={cond}
                                    onClick={() => {
                                      setHealthProfile(prev => ({
                                        ...prev,
                                        conditions: [...prev.conditions, cond]
                                      }));
                                      setConditionSearch('');
                                    }}
                                    className={`w-full p-2 text-left text-xs ${
                                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    {cond}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {healthProfile.conditions.map((cond, idx) => (
                              <Badge 
                                key={idx} 
                                className="text-[9px] bg-blue-500/20 text-blue-400 cursor-pointer"
                                onClick={() => setHealthProfile(prev => ({
                                  ...prev,
                                  conditions: prev.conditions.filter((_, i) => i !== idx)
                                }))}
                              >
                                {cond} <X className="w-2 h-2 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Allergies */}
                        <div>
                          <label className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Food Allergies
                          </label>
                          <div className="relative mt-1">
                            <Input
                              value={allergySearch}
                              onChange={(e) => setAllergySearch(e.target.value)}
                              placeholder="Search allergies..."
                              className={`text-xs h-8 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                            />
                            {allergySearch && filteredAllergies.length > 0 && (
                              <div className={`absolute z-40 w-full mt-1 rounded-lg border max-h-32 overflow-y-auto ${
                                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                              }`}>
                                {filteredAllergies.map(allergy => (
                                  <button
                                    key={allergy}
                                    onClick={() => {
                                      setHealthProfile(prev => ({
                                        ...prev,
                                        allergies: [...prev.allergies, allergy]
                                      }));
                                      setAllergySearch('');
                                    }}
                                    className={`w-full p-2 text-left text-xs ${
                                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    {allergy}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {healthProfile.allergies.map((allergy, idx) => (
                              <Badge 
                                key={idx} 
                                className="text-[9px] bg-red-500/20 text-red-400 cursor-pointer"
                                onClick={() => setHealthProfile(prev => ({
                                  ...prev,
                                  allergies: prev.allergies.filter((_, i) => i !== idx)
                                }))}
                              >
                                {allergy} <X className="w-2 h-2 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Medications */}
                        <div>
                          <label className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Current Medications
                          </label>
                          <Input
                            value={medicationInput}
                            onChange={(e) => setMedicationInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && medicationInput.trim()) {
                                setHealthProfile(prev => ({
                                  ...prev,
                                  medications: [...prev.medications, medicationInput.trim()]
                                }));
                                setMedicationInput('');
                              }
                            }}
                            placeholder="Press Enter to add..."
                            className={`text-xs h-8 mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                          />
                          <div className="flex flex-wrap gap-1 mt-2">
                            {healthProfile.medications.map((med, idx) => (
                              <Badge 
                                key={idx} 
                                className="text-[9px] bg-purple-500/20 text-purple-400 cursor-pointer"
                                onClick={() => setHealthProfile(prev => ({
                                  ...prev,
                                  medications: prev.medications.filter((_, i) => i !== idx)
                                }))}
                              >
                                {med} <X className="w-2 h-2 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      
                      {/* Dietary Tab */}
                      <TabsContent value="dietary" className="space-y-3 mt-0">
                        <div>
                          <label className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Dietary Restrictions
                          </label>
                          <div className="grid grid-cols-2 gap-1 mt-2">
                            {DIETARY_RESTRICTIONS.map(diet => (
                              <button
                                key={diet.id}
                                onClick={() => {
                                  setHealthProfile(prev => ({
                                    ...prev,
                                    dietary_restrictions: prev.dietary_restrictions.includes(diet.id)
                                      ? prev.dietary_restrictions.filter(d => d !== diet.id)
                                      : [...prev.dietary_restrictions, diet.id]
                                  }));
                                }}
                                className={`p-1.5 rounded text-[10px] flex items-center gap-1 border transition-colors ${
                                  healthProfile.dietary_restrictions.includes(diet.id)
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                    : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                                }`}
                              >
                                <span>{diet.icon}</span>
                                <span>{diet.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      
                      {/* Biometrics Tab */}
                      <TabsContent value="biometrics" className="space-y-3 mt-0">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Age</label>
                            <Input
                              type="number"
                              value={healthProfile.age}
                              onChange={(e) => setHealthProfile(prev => ({ ...prev, age: e.target.value }))}
                              placeholder="Years"
                              className={`text-xs h-8 mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                            />
                          </div>
                          <div>
                            <label className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sex</label>
                            <select
                              value={healthProfile.sex}
                              onChange={(e) => setHealthProfile(prev => ({ ...prev, sex: e.target.value }))}
                              className={`w-full text-xs h-8 mt-1 rounded-md border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                            >
                              <option value="">Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                          <div>
                            <label className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Weight</label>
                            <Input
                              type="number"
                              value={healthProfile.weight}
                              onChange={(e) => setHealthProfile(prev => ({ ...prev, weight: e.target.value }))}
                              placeholder="kg"
                              className={`text-xs h-8 mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                            />
                          </div>
                          <div>
                            <label className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Height</label>
                            <Input
                              type="number"
                              value={healthProfile.height}
                              onChange={(e) => setHealthProfile(prev => ({ ...prev, height: e.target.value }))}
                              placeholder="cm"
                              className={`text-xs h-8 mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Activity Level
                          </label>
                          <div className="grid grid-cols-3 gap-1 mt-1">
                            {['sedentary', 'moderate', 'active'].map(level => (
                              <button
                                key={level}
                                onClick={() => setHealthProfile(prev => ({ ...prev, activity_level: level }))}
                                className={`p-1.5 rounded text-[10px] capitalize border transition-colors ${
                                  healthProfile.activity_level === level
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                    : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header with Search */}
            <div className={`border-b p-4 ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-4">
                {!showProfilePanel && (
                  <Button variant="ghost" size="sm" onClick={() => setShowProfilePanel(true)}>
                    <User className="w-4 h-4 mr-1" /> Profile
                  </Button>
                )}
                
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">Π</span>
                  </div>
                  <div className="flex-1 relative">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                      placeholder="Analyze any food or dish... (e.g., Chicken Tikka Masala, Salmon, Quinoa Bowl)"
                      className={`pr-10 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                    />
                    {isSearching ? (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-emerald-500" />
                    ) : (
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    )}
                    
                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                      {showSuggestions && searchResults.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`absolute z-50 w-full mt-1 rounded-lg border shadow-xl max-h-80 overflow-y-auto ${
                            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                          }`}
                        >
                          {searchResults.map((food, idx) => (
                            <button
                              key={food.id || idx}
                              onClick={() => analyzeFood(food)}
                              className={`w-full p-3 text-left flex items-center gap-3 border-b last:border-0 transition-colors ${
                                isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                              }`}
                            >
                              {food.source === 'popular' || food.source === 'search' ? (
                                <Sparkles className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Apple className="w-5 h-5 text-emerald-500" />
                              )}
                              <div className="flex-1">
                                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {food.name}
                                </div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {food.source === 'popular' || food.source === 'search' 
                                    ? 'Tap for PhiCor analysis' 
                                    : `${food.category} • ${food.serving_size || ''}${food.serving_unit || ''}`}
                                </div>
                              </div>
                              <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400">
                                Π
                              </Badge>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Quick dishes */}
                <div className="hidden lg:flex items-center gap-1">
                  {POPULAR_DISHES.slice(0, 3).map(dish => (
                    <Button
                      key={dish}
                      variant="outline"
                      size="sm"
                      onClick={() => analyzeFood({ name: dish, source: 'popular' })}
                      className="text-xs h-8"
                    >
                      {dish}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Scale Selector (like disease dashboard) */}
            {analysisResult && (
              <div className={`border-b px-4 py-2 ${isDark ? 'bg-gray-900/20 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {FOOD_SCALES.map(scale => (
                    <button
                      key={scale.id}
                      onClick={() => setActiveScale(scale.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        activeScale === scale.id
                          ? 'bg-emerald-500 text-white'
                          : isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                      title={scale.fullName}
                    >
                      <span>{scale.icon}</span>
                      <span>{scale.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Analysis Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {isAnalyzing ? (
                  <div className={`rounded-xl border p-12 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <Loader2 className="w-20 h-20 animate-spin text-emerald-500" />
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-emerald-500">Π</span>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      PhiCor Analysis in Progress
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Deep molecular & biochemical breakdown...
                    </p>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-4">
                    {/* Header Card */}
                    <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <UtensilsCrossed className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {analysisResult.dish_name}
                            </h2>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {analysisResult.description}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge className="bg-emerald-500/20 text-emerald-400">{analysisResult.category}</Badge>
                              {analysisResult.origin && <Badge variant="outline">{analysisResult.origin}</Badge>}
                              {analysisResult.metabolic_impact?.glycemic_category && (
                                <Badge className={`${
                                  analysisResult.metabolic_impact.glycemic_category === 'low' ? 'bg-green-500/20 text-green-400' :
                                  analysisResult.metabolic_impact.glycemic_category === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  GI: {analysisResult.metabolic_impact.glycemic_index} ({analysisResult.metabolic_impact.glycemic_category})
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Scores */}
                        <div className="flex gap-3">
                          <div className="text-center">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                              (analysisResult.clinical_scores?.healthfulness_score || analysisResult.healthfulness_score) >= 70 ? 'bg-emerald-500' :
                              (analysisResult.clinical_scores?.healthfulness_score || analysisResult.healthfulness_score) >= 50 ? 'bg-yellow-500' :
                              'bg-orange-500'
                            }`}>
                              <span className="text-white text-lg font-bold">
                                {analysisResult.clinical_scores?.healthfulness_score || analysisResult.healthfulness_score || '—'}
                              </span>
                            </div>
                            <p className={`text-[10px] mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Health</p>
                          </div>
                          {analysisResult.clinical_scores?.nutrient_density_score && (
                            <div className="text-center">
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto bg-blue-500`}>
                                <span className="text-white text-lg font-bold">
                                  {analysisResult.clinical_scores.nutrient_density_score}
                                </span>
                              </div>
                              <p className={`text-[10px] mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Density</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Warnings */}
                    {(analysisResult.personalized_analysis?.condition_specific_warnings?.length > 0 || analysisResult.personalized_warnings?.length > 0) && (
                      <div className={`rounded-xl border p-4 ${isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200'}`}>
                        <h3 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                          <AlertTriangle className="w-4 h-4" />
                          Clinical Warnings
                        </h3>
                        <div className="space-y-2">
                          {(analysisResult.personalized_analysis?.condition_specific_warnings || analysisResult.personalized_warnings || []).map((warning, idx) => (
                            <div 
                              key={idx}
                              className={`p-3 rounded-lg ${
                                warning.severity === 'critical' || warning.severity === 'high' ? 'bg-red-500/20' : 'bg-orange-500/20'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                  warning.severity === 'critical' ? 'text-red-500' : 'text-orange-500'
                                }`} />
                                <div>
                                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {warning.condition || warning.type}: {warning.warning || warning.message}
                                  </p>
                                  {warning.mechanism && (
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {warning.mechanism}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Scale Content */}
                    {activeScale === 'macros' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Macronutrients Card */}
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                          <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Flame className="w-4 h-4 text-orange-500" />
                            Macronutrients
                          </h3>
                          <div className="space-y-3">
                            <NutrientBar 
                              label="Calories" 
                              value={analysisResult.macronutrients?.calories?.value || analysisResult.nutrients_per_serving?.calories?.value} 
                              unit="kcal"
                              percent={analysisResult.macronutrients?.calories?.percent_daily}
                              max={2000}
                              color="bg-orange-500"
                              isDark={isDark}
                            />
                            <NutrientBar 
                              label="Protein" 
                              value={analysisResult.macronutrients?.protein?.value || analysisResult.nutrients_per_serving?.protein?.value} 
                              unit="g"
                              percent={analysisResult.macronutrients?.protein?.percent_daily}
                              max={50}
                              color="bg-red-500"
                              isDark={isDark}
                            />
                            <NutrientBar 
                              label="Carbohydrates" 
                              value={analysisResult.macronutrients?.carbohydrates?.total?.value || analysisResult.nutrients_per_serving?.carbohydrates?.value} 
                              unit="g"
                              percent={analysisResult.macronutrients?.carbohydrates?.total?.percent_daily}
                              max={300}
                              color="bg-yellow-500"
                              isDark={isDark}
                            />
                            <NutrientBar 
                              label="Fat" 
                              value={analysisResult.macronutrients?.fats?.total?.value || analysisResult.nutrients_per_serving?.fat?.value} 
                              unit="g"
                              percent={analysisResult.macronutrients?.fats?.total?.percent_daily}
                              max={65}
                              color="bg-blue-500"
                              isDark={isDark}
                            />
                            <NutrientBar 
                              label="Fiber" 
                              value={analysisResult.macronutrients?.carbohydrates?.fiber?.value || analysisResult.nutrients_per_serving?.fiber?.value} 
                              unit="g"
                              percent={null}
                              max={30}
                              color="bg-green-500"
                              isDark={isDark}
                            />
                          </div>
                        </div>
                        
                        {/* Fat Breakdown */}
                        {analysisResult.macronutrients?.fats && (
                          <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              <Droplets className="w-4 h-4 text-blue-500" />
                              Fat Profile
                            </h3>
                            <div className="space-y-3">
                              <NutrientBar label="Saturated" value={analysisResult.macronutrients.fats.saturated?.value} unit="g" max={20} color="bg-red-400" isDark={isDark} />
                              <NutrientBar label="Monounsaturated" value={analysisResult.macronutrients.fats.monounsaturated?.value} unit="g" max={30} color="bg-green-400" isDark={isDark} />
                              <NutrientBar label="Polyunsaturated" value={analysisResult.macronutrients.fats.polyunsaturated?.value} unit="g" max={20} color="bg-blue-400" isDark={isDark} />
                              {analysisResult.macronutrients.fats.omega_3 && (
                                <NutrientBar label="Omega-3" value={analysisResult.macronutrients.fats.omega_3.value} unit="mg" max={3000} color="bg-cyan-400" isDark={isDark} />
                              )}
                              {analysisResult.macronutrients.fats.cholesterol && (
                                <NutrientBar label="Cholesterol" value={analysisResult.macronutrients.fats.cholesterol.value} unit="mg" max={300} color="bg-purple-400" isDark={isDark} />
                              )}
                            </div>
                            {analysisResult.macronutrients.fats.omega_ratio && (
                              <div className={`mt-3 p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Omega 6:3 Ratio: <strong>{analysisResult.macronutrients.fats.omega_ratio}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Ingredients */}
                        <div className={`rounded-xl border p-4 lg:col-span-2 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                          <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Leaf className="w-4 h-4 text-green-500" />
                            Ingredients Breakdown ({analysisResult.ingredients?.length || 0})
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {analysisResult.ingredients?.map((ing, idx) => (
                              <div key={idx} className={`p-2 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{ing.name}</div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{ing.estimated_amount}</div>
                                {ing.key_nutrients && (
                                  <div className="flex flex-wrap gap-0.5 mt-1">
                                    {ing.key_nutrients.slice(0, 3).map((n, i) => (
                                      <Badge key={i} variant="outline" className="text-[8px] px-1 py-0">{n}</Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeScale === 'micros' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Vitamins */}
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                          <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Pill className="w-4 h-4 text-yellow-500" />
                            Vitamins
                          </h3>
                          <div className="space-y-2">
                            {(analysisResult.micronutrients?.vitamins || analysisResult.micronutrients || []).map((vit, idx) => (
                              <div key={idx} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                <div className="flex justify-between items-center">
                                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{vit.name}</span>
                                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {vit.value}{vit.unit} <span className="text-emerald-500">({vit.percent_daily || vit.daily_value_percent}% DV)</span>
                                  </span>
                                </div>
                                {vit.function && (
                                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{vit.function}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Minerals */}
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                          <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Atom className="w-4 h-4 text-purple-500" />
                            Minerals & Electrolytes
                          </h3>
                          <div className="space-y-2">
                            {analysisResult.micronutrients?.minerals?.map((min, idx) => (
                              <div key={idx} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                <div className="flex justify-between items-center">
                                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{min.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {min.value}{min.unit}
                                    </span>
                                    {min.bioavailability && (
                                      <Badge variant="outline" className="text-[9px]">{min.bioavailability} bioavail.</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {/* Electrolytes */}
                            {analysisResult.micronutrients?.electrolytes && (
                              <div className={`mt-3 p-3 rounded-lg border ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
                                <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Electrolytes</h4>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                  <div>
                                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                      {analysisResult.micronutrients.electrolytes.sodium?.value}
                                    </div>
                                    <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Sodium (mg)</div>
                                  </div>
                                  <div>
                                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                      {analysisResult.micronutrients.electrolytes.potassium?.value}
                                    </div>
                                    <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Potassium (mg)</div>
                                  </div>
                                  <div>
                                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                      {analysisResult.micronutrients.electrolytes.chloride?.value || '—'}
                                    </div>
                                    <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Chloride (mg)</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeScale === 'compounds' && (
                      <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <Dna className="w-4 h-4 text-purple-500" />
                          Bioactive Compounds
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {analysisResult.bioactive_compounds?.map((compound, idx) => (
                            <Collapsible key={idx}>
                              <CollapsibleTrigger className={`w-full p-3 rounded-lg border text-left ${isDark ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{compound.name}</div>
                                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                      {compound.class} • from {compound.source_ingredient}
                                    </div>
                                  </div>
                                  <ChevronDown className="w-4 h-4" />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className={`mt-2 p-3 rounded-lg ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                                <div className="space-y-2">
                                  {compound.mechanism_of_action && (
                                    <div>
                                      <span className={`text-[10px] font-semibold uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Mechanism</span>
                                      <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{compound.mechanism_of_action}</p>
                                    </div>
                                  )}
                                  {compound.target_pathways && (
                                    <div>
                                      <span className={`text-[10px] font-semibold uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Target Pathways</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {compound.target_pathways.map((p, i) => (
                                          <Badge key={i} variant="outline" className="text-[9px]">{p}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {compound.health_effects && (
                                    <div>
                                      <span className={`text-[10px] font-semibold uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Health Effects</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {compound.health_effects.map((e, i) => (
                                          <Badge key={i} className="text-[9px] bg-emerald-500/20 text-emerald-400">{e}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {activeScale === 'metabolic' && analysisResult.metabolic_impact && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Glycemic Response */}
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                          <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Gauge className="w-4 h-4 text-orange-500" />
                            Glycemic Response
                          </h3>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <div className={`text-2xl font-bold ${
                                analysisResult.metabolic_impact.glycemic_category === 'low' ? 'text-green-500' :
                                analysisResult.metabolic_impact.glycemic_category === 'medium' ? 'text-yellow-500' : 'text-red-500'
                              }`}>
                                {analysisResult.metabolic_impact.glycemic_index}
                              </div>
                              <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Glycemic Index</div>
                            </div>
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {analysisResult.metabolic_impact.glycemic_load}
                              </div>
                              <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Glycemic Load</div>
                            </div>
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {analysisResult.metabolic_impact.insulin_index || '—'}
                              </div>
                              <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Insulin Index</div>
                            </div>
                          </div>
                          {analysisResult.metabolic_impact.postprandial_effects && (
                            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                              <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Postprandial Effects</h4>
                              <div className="space-y-1 text-xs">
                                <p><strong>Glucose Peak:</strong> {analysisResult.metabolic_impact.postprandial_effects.blood_glucose_peak}</p>
                                <p><strong>Insulin Response:</strong> {analysisResult.metabolic_impact.postprandial_effects.insulin_response}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Metabolic Pathways */}
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                          <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Metabolic Pathways
                          </h3>
                          <div className="space-y-2">
                            {analysisResult.metabolic_impact.metabolic_pathways_activated?.map((pathway, idx) => (
                              <div key={idx} className={`p-3 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{pathway.pathway}</span>
                                  <Badge className={pathway.effect === 'stimulated' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}>
                                    {pathway.effect === 'stimulated' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {pathway.effect}
                                  </Badge>
                                </div>
                                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{pathway.mechanism}</p>
                              </div>
                            ))}
                          </div>
                          <div className={`mt-4 grid grid-cols-2 gap-2`}>
                            <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Satiety</div>
                              <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analysisResult.metabolic_impact.satiety_index}</div>
                            </div>
                            <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Thermic Effect</div>
                              <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analysisResult.metabolic_impact.thermic_effect}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeScale === 'organs' && analysisResult.organ_system_effects && (
                      <div className="space-y-4">
                        {Object.entries(analysisResult.organ_system_effects).map(([system, organs]) => (
                          <div key={system} className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {system === 'cardiovascular' && <Heart className="w-4 h-4 text-red-500" />}
                              {system === 'gastrointestinal' && <Salad className="w-4 h-4 text-green-500" />}
                              {system === 'renal' && <Droplets className="w-4 h-4 text-blue-500" />}
                              {system === 'neurological' && <Brain className="w-4 h-4 text-purple-500" />}
                              {system === 'musculoskeletal' && <Shield className="w-4 h-4 text-orange-500" />}
                              {system === 'endocrine' && <Target className="w-4 h-4 text-pink-500" />}
                              {system === 'immune' && <Shield className="w-4 h-4 text-cyan-500" />}
                              {system.replace(/_/g, ' ')} System
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {Object.entries(organs).map(([organ, data]) => (
                                <OrganEffectCard key={organ} organ={organ} data={data} isDark={isDark} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {activeScale === 'molecular' && (
                      <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <Microscope className="w-4 h-4 text-cyan-500" />
                          Molecular Level Analysis
                        </h3>
                        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Molecular pathway analysis is derived from the bioactive compounds and organ system effects above.
                          </p>
                          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Key pathways: {analysisResult.bioactive_compounds?.flatMap(c => c.target_pathways || []).slice(0, 5).join(', ') || 'See Bioactives tab'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Healthier Alternatives */}
                    {(analysisResult.healthier_alternatives?.length > 0 || analysisResult.preparation_modifications?.length > 0) && (
                      <div className={`rounded-xl border p-4 ${isDark ? 'bg-cyan-900/20 border-cyan-800/30' : 'bg-cyan-50 border-cyan-200'}`}>
                        <h3 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                          <Sparkles className="w-4 h-4" />
                          Recommendations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysisResult.healthier_alternatives?.length > 0 && (
                            <div>
                              <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Healthier Alternatives</h4>
                              <div className="space-y-1">
                                {analysisResult.healthier_alternatives.map((alt, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => analyzeFood({ name: typeof alt === 'string' ? alt : alt.name, source: 'popular' })}
                                    className="w-full justify-start text-xs"
                                  >
                                    <Sparkles className="w-3 h-3 mr-2" />
                                    {typeof alt === 'string' ? alt : alt.name}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          {analysisResult.preparation_modifications?.length > 0 && (
                            <div>
                              <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Preparation Tips</h4>
                              <div className="space-y-2">
                                {analysisResult.preparation_modifications.map((mod, idx) => (
                                  <div key={idx} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{mod.modification}</div>
                                    <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{mod.benefit}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty State */
                  <div className={`rounded-xl border p-12 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                      <span className={`text-4xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Π</span>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      PhiCor Food Analysis Engine
                    </h3>
                    <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Deep molecular & biochemical analysis of any food or dish. Get comprehensive nutrient profiles, bioactive compounds, metabolic impact, and organ system effects.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 justify-center">
                      {POPULAR_DISHES.slice(0, 6).map(dish => (
                        <Button
                          key={dish}
                          variant="outline"
                          size="sm"
                          onClick={() => analyzeFood({ name: dish, source: 'popular' })}
                        >
                          {dish}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodAnalysisPage;
