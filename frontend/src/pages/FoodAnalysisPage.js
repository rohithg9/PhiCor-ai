import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Apple, Salad, Fish, Wheat, Droplets, Heart, Brain,
  AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp,
  Activity, Zap, Shield, Target, Pill, User, Upload, Scan,
  TrendingUp, TrendingDown, Minus, Loader2, Plus, X, FileText,
  Beaker, Dna, Scale, Clock, UtensilsCrossed, Leaf, Globe,
  Settings, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import FeatureNav from '../components/FeatureNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Organ icons mapping
const ORGAN_ICONS = {
  heart: Heart,
  brain: Brain,
  kidneys: Droplets,
  liver: Activity,
  pancreas: Beaker,
  intestines: Salad,
  blood: Droplets,
  bones: Shield,
  muscles: Zap,
  eyes: Target,
  skin: User,
  blood_vessels: Heart,
  immune_system: Shield,
};

// Predefined conditions for search
const COMMON_CONDITIONS = [
  'Diabetes Type 2', 'Diabetes Type 1', 'Hypertension', 'Heart Failure', 'CKD (Chronic Kidney Disease)',
  'Liver Cirrhosis', 'Gout', 'Celiac Disease', 'NAFLD', 'Hyperlipidemia', 'Obesity',
  'Anemia', 'Osteoporosis', 'IBS', 'Crohn\'s Disease', 'GERD', 'Hypothyroidism'
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

const REGIONAL_CUISINES = [
  { id: 'indian', label: 'Indian', flag: '🇮🇳' },
  { id: 'chinese', label: 'Chinese', flag: '🇨🇳' },
  { id: 'japanese', label: 'Japanese', flag: '🇯🇵' },
  { id: 'italian', label: 'Italian', flag: '🇮🇹' },
  { id: 'mexican', label: 'Mexican', flag: '🇲🇽' },
  { id: 'thai', label: 'Thai', flag: '🇹🇭' },
  { id: 'mediterranean', label: 'Mediterranean', flag: '🫒' },
  { id: 'american', label: 'American', flag: '🇺🇸' },
  { id: 'middle_eastern', label: 'Middle Eastern', flag: '🧆' },
  { id: 'korean', label: 'Korean', flag: '🇰🇷' },
];

// Popular dishes for suggestions
const POPULAR_DISHES = [
  'Chicken Tikka Masala', 'Pasta Carbonara', 'Chicken Katsu Curry', 'Caesar Salad',
  'Sushi Roll', 'Pad Thai', 'Burrito Bowl', 'Greek Salad', 'Ramen', 'Pizza Margherita',
  'Grilled Salmon', 'Quinoa Bowl', 'Avocado Toast', 'Smoothie Bowl', 'Oatmeal'
];

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
  const [servingSize, setServingSize] = useState('standard portion');
  
  // Health profile state
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('medical');
  const [healthProfile, setHealthProfile] = useState({
    // Basic info
    age: '',
    sex: '',
    weight: '',
    height: '',
    activity_level: 'moderate',
    // Medical
    conditions: [],
    medications: [],
    allergies: [],
    // Dietary
    dietary_restrictions: [],
    regional_preferences: [],
    // Diet history
    typical_meals_per_day: 3,
    snacking_frequency: 'moderate',
    water_intake: 'adequate',
    alcohol_consumption: 'none',
    caffeine_intake: 'moderate',
    // Goals
    health_goals: [],
  });
  
  // Input states for adding items
  const [conditionSearch, setConditionSearch] = useState('');
  const [allergySearch, setAllergySearch] = useState('');
  const [medicationInput, setMedicationInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  
  // Expanded sections
  const [expandedSections, setExpandedSections] = useState({
    ingredients: true,
    nutrients: true,
    micronutrients: false,
    organs: true,
    compounds: false,
    warnings: true,
    alternatives: false,
  });

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
      
      // Combine DB results with popular dish suggestions
      const dbResults = data.success ? data.foods : [];
      const dishSuggestions = POPULAR_DISHES
        .filter(d => d.toLowerCase().includes(query.toLowerCase()))
        .map(d => ({ name: d, category: 'dish', source: 'popular', id: `dish_${d.toLowerCase().replace(/\s+/g, '_')}` }));
      
      // Merge results, DB first, then suggestions
      const combined = [...dbResults];
      dishSuggestions.forEach(dish => {
        if (!combined.find(r => r.name.toLowerCase() === dish.name.toLowerCase())) {
          combined.push(dish);
        }
      });
      
      // If query doesn't match any, show as custom search option
      if (combined.length === 0 || !combined.find(r => r.name.toLowerCase() === query.toLowerCase())) {
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
      // Still show custom option
      setSearchResults([{
        name: searchQuery,
        category: 'custom',
        source: 'search',
        id: `custom_${searchQuery.toLowerCase().replace(/\s+/g, '_')}`
      }]);
    } finally {
      setIsSearching(false);
    }
  }, []);
  
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
      let response;
      
      // If it's a simple food from DB, use regular analysis
      if (food.source !== 'popular' && food.source !== 'search' && food.id?.startsWith('food_')) {
        response = await fetch(`${BACKEND_URL}/api/food/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            food_id: food.id,
            serving_size: 100,
            health_profile: healthProfile.conditions.length > 0 ? healthProfile : null
          })
        });
        
        const data = await response.json();
        if (data.success) {
          // Convert to unified format
          setAnalysisResult({
            type: 'simple',
            ...data.analysis
          });
        }
      } else {
        // Use AI-powered dish analysis for complex foods
        response = await fetch(`${BACKEND_URL}/api/food/analyze-dish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dish_name: food.name,
            serving_size: servingSize,
            health_profile: healthProfile.conditions.length > 0 ? healthProfile : null
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setAnalysisResult({
            type: 'dish',
            ...data.analysis
          });
          toast.success('AI analysis complete!');
        } else {
          throw new Error(data.detail || 'Analysis failed');
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Filter suggestions for conditions/allergies
  const filteredConditions = COMMON_CONDITIONS.filter(c => 
    c.toLowerCase().includes(conditionSearch.toLowerCase()) &&
    !healthProfile.conditions.includes(c)
  );
  
  const filteredAllergies = COMMON_ALLERGIES.filter(a => 
    a.toLowerCase().includes(allergySearch.toLowerCase()) &&
    !healthProfile.allergies.includes(a)
  );
  
  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Get effect color
  const getEffectColor = (effect) => {
    if (effect === 'beneficial') return 'text-emerald-500';
    if (effect === 'caution') return 'text-orange-500';
    if (effect === 'neutral') return 'text-gray-400';
    return 'text-gray-400';
  };
  
  const getEffectBg = (effect) => {
    if (effect === 'beneficial') return isDark ? 'bg-emerald-900/30' : 'bg-emerald-50';
    if (effect === 'caution') return isDark ? 'bg-orange-900/30' : 'bg-orange-50';
    return isDark ? 'bg-gray-800' : 'bg-gray-100';
  };

  return (
    <>
      <Helmet>
        <title>Π Food Analysis | PhiCor.ai - Mathematical Nutrition Engine</title>
        <meta name="description" content="Analyze any food or dish at molecular and biochemical level. Get personalized nutritional insights based on your health profile." />
      </Helmet>
      
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <FeatureNav />
        
        <div className="max-w-7xl mx-auto p-4 pt-20">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">Π</span>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Food Mathematical Model Engine
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Deep molecular & biochemical analysis of any food or dish
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Search & Profile */}
            <div className="space-y-4">
              {/* Search */}
              <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Search className="w-4 h-4 text-emerald-500" />
                  Search Any Food or Dish
                </h3>
                
                <div className="relative">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                    placeholder="e.g., Chicken Tikka Masala, Salmon, Pasta..."
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
                        className={`absolute z-50 w-full mt-1 rounded-lg border shadow-lg max-h-80 overflow-y-auto ${
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
                              <Sparkles className="w-5 h-5 text-purple-500" />
                            ) : (
                              <Apple className="w-5 h-5 text-emerald-500" />
                            )}
                            <div className="flex-1">
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {food.name}
                              </div>
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {food.source === 'popular' ? 'Popular dish - AI analysis' : 
                                 food.source === 'search' ? 'Tap to analyze with AI' :
                                 `${food.category} • ${food.serving_size || ''}${food.serving_unit || ''}`}
                              </div>
                            </div>
                            {(food.source === 'popular' || food.source === 'search') && (
                              <Badge className="text-[10px] bg-purple-500/20 text-purple-400">
                                AI
                              </Badge>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Popular Dishes */}
                <div className="mt-4">
                  <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Popular dishes:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_DISHES.slice(0, 8).map(dish => (
                      <Button
                        key={dish}
                        variant="outline"
                        size="sm"
                        onClick={() => analyzeFood({ name: dish, source: 'popular', id: `dish_${dish}` })}
                        className="text-[10px] h-6 px-2"
                      >
                        {dish}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Health Profile */}
              <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => setShowProfileForm(!showProfileForm)}
                  className={`w-full flex items-center justify-between ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" />
                    Your Health Profile
                    {(healthProfile.conditions.length > 0 || healthProfile.allergies.length > 0) && (
                      <Badge className="bg-purple-500/20 text-purple-400 text-[10px]">
                        {healthProfile.conditions.length + healthProfile.allergies.length} items
                      </Badge>
                    )}
                  </span>
                  {showProfileForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                <AnimatePresence>
                  {showProfileForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4">
                        <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab}>
                          <TabsList className="w-full grid grid-cols-3 h-8">
                            <TabsTrigger value="medical" className="text-xs">Medical</TabsTrigger>
                            <TabsTrigger value="dietary" className="text-xs">Dietary</TabsTrigger>
                            <TabsTrigger value="lifestyle" className="text-xs">Lifestyle</TabsTrigger>
                          </TabsList>
                          
                          {/* Medical Tab */}
                          <TabsContent value="medical" className="space-y-3 mt-3">
                            {/* Conditions */}
                            <div>
                              <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Medical Conditions
                              </label>
                              <div className="relative mt-1">
                                <Input
                                  value={conditionSearch}
                                  onChange={(e) => setConditionSearch(e.target.value)}
                                  placeholder="Search conditions..."
                                  className={`text-sm ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                                />
                                {conditionSearch && filteredConditions.length > 0 && (
                                  <div className={`absolute z-40 w-full mt-1 rounded-lg border max-h-40 overflow-y-auto ${
                                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                  }`}>
                                    {filteredConditions.map(cond => (
                                      <button
                                        key={cond}
                                        onClick={() => {
                                          setHealthProfile(prev => ({
                                            ...prev,
                                            conditions: [...prev.conditions, cond]
                                          }));
                                          setConditionSearch('');
                                        }}
                                        className={`w-full p-2 text-left text-sm ${
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
                                    className="text-[10px] bg-blue-500/20 text-blue-400 cursor-pointer"
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
                              <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Food Allergies
                              </label>
                              <div className="relative mt-1">
                                <Input
                                  value={allergySearch}
                                  onChange={(e) => setAllergySearch(e.target.value)}
                                  placeholder="Search allergies..."
                                  className={`text-sm ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                                />
                                {allergySearch && filteredAllergies.length > 0 && (
                                  <div className={`absolute z-40 w-full mt-1 rounded-lg border max-h-40 overflow-y-auto ${
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
                                        className={`w-full p-2 text-left text-sm ${
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
                                    className="text-[10px] bg-red-500/20 text-red-400 cursor-pointer"
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
                              <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Current Medications
                              </label>
                              <div className="flex gap-2 mt-1">
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
                                  placeholder="e.g., Metformin, Warfarin..."
                                  className={`flex-1 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                                />
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {healthProfile.medications.map((med, idx) => (
                                  <Badge 
                                    key={idx} 
                                    className="text-[10px] bg-purple-500/20 text-purple-400 cursor-pointer"
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
                          <TabsContent value="dietary" className="space-y-3 mt-3">
                            {/* Dietary Restrictions */}
                            <div>
                              <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
                                    className={`p-2 rounded-lg text-xs flex items-center gap-2 border transition-colors ${
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
                            
                            {/* Regional Preferences */}
                            <div>
                              <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Regional/Cuisine Preferences
                              </label>
                              <div className="grid grid-cols-2 gap-1 mt-2">
                                {REGIONAL_CUISINES.map(cuisine => (
                                  <button
                                    key={cuisine.id}
                                    onClick={() => {
                                      setHealthProfile(prev => ({
                                        ...prev,
                                        regional_preferences: prev.regional_preferences.includes(cuisine.id)
                                          ? prev.regional_preferences.filter(c => c !== cuisine.id)
                                          : [...prev.regional_preferences, cuisine.id]
                                      }));
                                    }}
                                    className={`p-2 rounded-lg text-xs flex items-center gap-2 border transition-colors ${
                                      healthProfile.regional_preferences.includes(cuisine.id)
                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                        : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                                    }`}
                                  >
                                    <span>{cuisine.flag}</span>
                                    <span>{cuisine.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                          
                          {/* Lifestyle Tab */}
                          <TabsContent value="lifestyle" className="space-y-3 mt-3">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Age
                                </label>
                                <Input
                                  type="number"
                                  value={healthProfile.age}
                                  onChange={(e) => setHealthProfile(prev => ({ ...prev, age: e.target.value }))}
                                  placeholder="Years"
                                  className={`text-sm mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                                />
                              </div>
                              <div>
                                <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Weight (kg)
                                </label>
                                <Input
                                  type="number"
                                  value={healthProfile.weight}
                                  onChange={(e) => setHealthProfile(prev => ({ ...prev, weight: e.target.value }))}
                                  placeholder="kg"
                                  className={`text-sm mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                                />
                              </div>
                            </div>
                            
                            {/* Meals per day */}
                            <div>
                              <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Meals per day: {healthProfile.typical_meals_per_day}
                              </label>
                              <Slider
                                value={[healthProfile.typical_meals_per_day]}
                                onValueChange={([val]) => setHealthProfile(prev => ({ ...prev, typical_meals_per_day: val }))}
                                min={1}
                                max={6}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                            
                            {/* Activity Level */}
                            <div>
                              <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Activity Level
                              </label>
                              <div className="grid grid-cols-3 gap-1 mt-2">
                                {['sedentary', 'moderate', 'active'].map(level => (
                                  <button
                                    key={level}
                                    onClick={() => setHealthProfile(prev => ({ ...prev, activity_level: level }))}
                                    className={`p-2 rounded-lg text-xs capitalize border transition-colors ${
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
                            
                            {/* Health Goals */}
                            <div>
                              <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Health Goals
                              </label>
                              <Input
                                value={goalInput}
                                onChange={(e) => setGoalInput(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && goalInput.trim()) {
                                    setHealthProfile(prev => ({
                                      ...prev,
                                      health_goals: [...prev.health_goals, goalInput.trim()]
                                    }));
                                    setGoalInput('');
                                  }
                                }}
                                placeholder="e.g., Weight loss, Blood sugar control..."
                                className={`text-sm mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                              />
                              <div className="flex flex-wrap gap-1 mt-2">
                                {healthProfile.health_goals.map((goal, idx) => (
                                  <Badge 
                                    key={idx} 
                                    className="text-[10px] bg-green-500/20 text-green-400 cursor-pointer"
                                    onClick={() => setHealthProfile(prev => ({
                                      ...prev,
                                      health_goals: prev.health_goals.filter((_, i) => i !== idx)
                                    }))}
                                  >
                                    {goal} <X className="w-2 h-2 ml-1" />
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Right Panel - Analysis Results */}
            <div className="lg:col-span-2">
              {isAnalyzing ? (
                // Loading state
                <div className={`rounded-xl border p-12 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <Loader2 className="w-20 h-20 animate-spin text-emerald-500" />
                    <Sparkles className="w-8 h-8 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Analyzing with AI...
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Breaking down ingredients, nutrients, and organ effects
                  </p>
                </div>
              ) : analysisResult ? (
                // Analysis Results
                <div className="space-y-4">
                  {/* Header Card */}
                  <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <UtensilsCrossed className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {analysisResult.dish_name || analysisResult.food?.name}
                          </h2>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {analysisResult.description || analysisResult.food?.description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge className="bg-emerald-500/20 text-emerald-400">
                              {analysisResult.category || analysisResult.food?.category}
                            </Badge>
                            {analysisResult.glycemic_category && (
                              <Badge className={`${
                                analysisResult.glycemic_category === 'low' ? 'bg-green-500/20 text-green-400' :
                                analysisResult.glycemic_category === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                GI: {analysisResult.glycemic_index_estimate} ({analysisResult.glycemic_category})
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Score */}
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                          analysisResult.healthfulness_score >= 70 ? 'bg-emerald-500' :
                          analysisResult.healthfulness_score >= 50 ? 'bg-yellow-500' :
                          analysisResult.healthfulness_score >= 30 ? 'bg-orange-500' : 'bg-red-500'
                        }`}>
                          <span className="text-white text-xl font-bold">
                            {analysisResult.healthfulness_score || analysisResult.nutritional_score || '—'}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {analysisResult.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Warnings */}
                  {(analysisResult.personalized_warnings?.length > 0 || analysisResult.warnings?.length > 0) && (
                    <div className={`rounded-xl border p-4 ${isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200'}`}>
                      <h3 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                        <AlertTriangle className="w-4 h-4" />
                        Warnings & Alerts
                      </h3>
                      <div className="space-y-2">
                        {(analysisResult.personalized_warnings || analysisResult.warnings || []).map((warning, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg ${
                              warning.severity === 'critical' ? 'bg-red-500/20' :
                              warning.severity === 'high' ? 'bg-orange-500/20' : 'bg-yellow-500/20'
                            }`}
                          >
                            <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {warning.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Benefits */}
                  {analysisResult.benefits?.length > 0 && (
                    <div className={`rounded-xl border p-4 ${isDark ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-emerald-50 border-emerald-200'}`}>
                      <h3 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        <CheckCircle className="w-4 h-4" />
                        Health Benefits
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.benefits.map((benefit, idx) => (
                          <Badge key={idx} className="bg-emerald-500/20 text-emerald-400">
                            {typeof benefit === 'string' ? benefit : benefit.message}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Ingredients (for dishes) */}
                  {analysisResult.ingredients?.length > 0 && (
                    <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                      <button
                        onClick={() => toggleSection('ingredients')}
                        className="w-full flex items-center justify-between"
                      >
                        <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <Leaf className="w-4 h-4 text-green-500" />
                          Ingredients ({analysisResult.ingredients.length})
                        </h3>
                        {expandedSections.ingredients ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      {expandedSections.ingredients && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {analysisResult.ingredients.map((ing, idx) => (
                            <div key={idx} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {ing.name}
                              </div>
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {ing.estimated_amount}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Nutrients */}
                  <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <button
                      onClick={() => toggleSection('nutrients')}
                      className="w-full flex items-center justify-between"
                    >
                      <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Beaker className="w-4 h-4 text-blue-500" />
                        Nutritional Composition
                      </h3>
                      {expandedSections.nutrients ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {expandedSections.nutrients && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.entries(analysisResult.nutrients_per_serving || analysisResult.food?.nutrients || {}).map(([nutrient, data]) => (
                          <div
                            key={nutrient}
                            className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                          >
                            <div className={`text-xs capitalize ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {nutrient.replace(/_/g, ' ')}
                            </div>
                            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {data.value}
                              <span className="text-xs font-normal ml-1">{data.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Organ Effects */}
                  {analysisResult.organ_effects && (
                    <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                      <button
                        onClick={() => toggleSection('organs')}
                        className="w-full flex items-center justify-between"
                      >
                        <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <Activity className="w-4 h-4 text-purple-500" />
                          Organ System Effects
                        </h3>
                        {expandedSections.organs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      {expandedSections.organs && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(analysisResult.organ_effects).map(([organ, data]) => {
                            const OrganIcon = ORGAN_ICONS[organ] || Activity;
                            return (
                              <div
                                key={organ}
                                className={`p-4 rounded-lg border ${getEffectBg(data.effect)} ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    data.effect === 'beneficial' ? 'bg-emerald-500/20' :
                                    data.effect === 'caution' ? 'bg-orange-500/20' : 'bg-gray-500/20'
                                  }`}>
                                    <OrganIcon className={`w-5 h-5 ${getEffectColor(data.effect)}`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                      {organ.replace(/_/g, ' ')}
                                    </div>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {data.mechanism}
                                    </p>
                                  </div>
                                  <Badge className={`${
                                    data.effect === 'beneficial' ? 'bg-emerald-500/20 text-emerald-400' :
                                    data.effect === 'caution' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {data.effect}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Healthier Alternatives */}
                  {analysisResult.healthier_alternatives?.length > 0 && (
                    <div className={`rounded-xl border p-4 ${isDark ? 'bg-cyan-900/20 border-cyan-800/30' : 'bg-cyan-50 border-cyan-200'}`}>
                      <h3 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                        <Sparkles className="w-4 h-4" />
                        Healthier Alternatives
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.healthier_alternatives.map((alt, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => analyzeFood({ name: alt, source: 'popular' })}
                            className="text-xs"
                          >
                            {alt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Empty state
                <div className={`rounded-xl border p-12 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                    <UtensilsCrossed className={`w-10 h-10 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Search for any food or dish
                  </h3>
                  <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Get AI-powered analysis of ingredients, nutrients, and health effects
                  </p>
                  
                  {/* Quick Examples */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Chicken Tikka Masala', 'Pasta Carbonara', 'Grilled Salmon', 'Caesar Salad'].map(dish => (
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
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodAnalysisPage;
