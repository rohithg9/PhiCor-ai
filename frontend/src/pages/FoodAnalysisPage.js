import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Apple, Salad, Fish, Wheat, Droplets, Heart, Brain,
  AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp,
  Activity, Zap, Shield, Target, Pill, User, Upload, Scan,
  TrendingUp, TrendingDown, Minus, Loader2, Plus, X, FileText,
  Beaker, Dna, Scale, Clock
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
  adrenal: Zap,
  parathyroid: Beaker,
  fetus: User,
  nerves: Brain,
  gallbladder: Droplets,
  joints: Activity
};

// Food category icons
const CATEGORY_ICONS = {
  fruit: Apple,
  vegetable: Salad,
  protein: Fish,
  grain: Wheat,
  dairy: Droplets,
  nuts: Target,
  legumes: Salad,
  beverages: Droplets
};

const FoodAnalysisPage = () => {
  const { isDark } = useTheme();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Selected food state
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodAnalysis, setFoodAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [servingSize, setServingSize] = useState(100);
  
  // User health profile state
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [healthProfile, setHealthProfile] = useState({
    age: '',
    sex: '',
    weight: '',
    height: '',
    conditions: [],
    medications: [],
    allergies: [],
    lab_values: {},
    dietary_restrictions: []
  });
  const [conditionInput, setConditionInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  
  // Expanded sections
  const [expandedSections, setExpandedSections] = useState({
    nutrients: true,
    organs: true,
    warnings: true,
    molecular: false
  });
  
  // Search foods
  const searchFoods = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/food/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.foods);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchFoods(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchFoods]);
  
  // Select and analyze food
  const selectFood = async (food) => {
    setSelectedFood(food);
    setSearchQuery('');
    setSearchResults([]);
    await analyzeFood(food);
  };
  
  // Analyze food with health profile
  const analyzeFood = async (food) => {
    setIsAnalyzing(true);
    try {
      const requestBody = {
        food_id: food.id,
        serving_size: servingSize,
        health_profile: healthProfile.conditions.length > 0 || healthProfile.allergies.length > 0 
          ? healthProfile 
          : null
      };
      
      const response = await fetch(`${BACKEND_URL}/api/food/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      if (data.success) {
        setFoodAnalysis(data.analysis);
      } else {
        toast.error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze food');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Re-analyze when serving size changes
  useEffect(() => {
    if (selectedFood) {
      const timer = setTimeout(() => {
        analyzeFood(selectedFood);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [servingSize]);
  
  // Add condition
  const addCondition = () => {
    if (conditionInput.trim() && !healthProfile.conditions.includes(conditionInput.trim())) {
      setHealthProfile(prev => ({
        ...prev,
        conditions: [...prev.conditions, conditionInput.trim()]
      }));
      setConditionInput('');
    }
  };
  
  // Add allergy
  const addAllergy = () => {
    if (allergyInput.trim() && !healthProfile.allergies.includes(allergyInput.trim())) {
      setHealthProfile(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };
  
  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Get recommendation color
  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'recommended': return 'bg-emerald-500';
      case 'moderate': return 'bg-yellow-500';
      case 'limit': return 'bg-orange-500';
      case 'avoid': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Get organ effect color
  const getEffectColor = (effect) => {
    if (effect === 'beneficial') return isDark ? 'text-emerald-400' : 'text-emerald-600';
    if (effect === 'caution' || effect === 'caution_warfarin') return isDark ? 'text-orange-400' : 'text-orange-600';
    if (effect === 'high_demand' || effect === 'load') return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-gray-400' : 'text-gray-600';
  };

  return (
    <>
      <Helmet>
        <title>Π Food Analysis | PhiCor.ai - Mathematical Nutrition Engine</title>
        <meta name="description" content="Analyze food at molecular and biochemical level. Get personalized nutritional insights based on your health profile and medical conditions." />
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
                  Deep molecular & biochemical analysis of food effects on your body
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
                  Search Food
                </h3>
                
                <div className="relative">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search foods, ingredients, brands..."
                    className={`${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-emerald-500" />
                  )}
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className={`mt-2 rounded-lg border max-h-60 overflow-y-auto ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    {searchResults.map(food => {
                      const CategoryIcon = CATEGORY_ICONS[food.category] || Apple;
                      return (
                        <button
                          key={food.id}
                          onClick={() => selectFood(food)}
                          className={`w-full p-3 text-left flex items-center gap-3 border-b last:border-0 transition-colors ${
                            isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <CategoryIcon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          <div>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {food.name}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {food.category} • {food.serving_size}{food.serving_unit}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {/* Quick Actions */}
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Scan className="w-3 h-3 mr-1" />
                    Scan Barcode
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Upload className="w-3 h-3 mr-1" />
                    Upload Image
                  </Button>
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
                        Active
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
                      <div className="pt-4 space-y-3">
                        {/* Conditions */}
                        <div>
                          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Medical Conditions
                          </label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              value={conditionInput}
                              onChange={(e) => setConditionInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                              placeholder="e.g., Diabetes, CKD, Hypertension"
                              className={`flex-1 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                            />
                            <Button onClick={addCondition} size="sm">
                              <Plus className="w-4 h-4" />
                            </Button>
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
                            Allergies
                          </label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              value={allergyInput}
                              onChange={(e) => setAllergyInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                              placeholder="e.g., Fish, Eggs, Nuts"
                              className={`flex-1 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                            />
                            <Button onClick={addAllergy} size="sm" variant="destructive">
                              <Plus className="w-4 h-4" />
                            </Button>
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
                        
                        {/* Lab Values Upload */}
                        <div>
                          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Recent Lab Values (Optional)
                          </label>
                          <Button variant="outline" size="sm" className="w-full mt-1 text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            Paste or Upload Lab Results
                          </Button>
                        </div>
                        
                        {/* Re-analyze button */}
                        {selectedFood && (
                          <Button 
                            onClick={() => analyzeFood(selectedFood)}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Activity className="w-4 h-4 mr-2" />
                            )}
                            Re-analyze with Profile
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Right Panel - Analysis Results */}
            <div className="lg:col-span-2">
              {!selectedFood ? (
                // Empty state
                <div className={`rounded-xl border p-12 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                    <Apple className={`w-10 h-10 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Search for a food to analyze
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Get deep molecular and biochemical insights on how food affects every organ system
                  </p>
                  
                  {/* Quick picks */}
                  <div className="mt-6">
                    <p className={`text-xs font-medium mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Quick picks:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Banana', 'Salmon', 'Spinach', 'Egg', 'White Rice'].map(food => (
                        <Button
                          key={food}
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery(food)}
                        >
                          {food}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Analysis Results
                <div className="space-y-4">
                  {/* Food Header */}
                  <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          {(() => {
                            const Icon = CATEGORY_ICONS[selectedFood.category] || Apple;
                            return <Icon className="w-8 h-8 text-white" />;
                          })()}
                        </div>
                        <div>
                          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedFood.name}
                          </h2>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedFood.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-emerald-500/20 text-emerald-400">
                              {selectedFood.category}
                            </Badge>
                            {selectedFood.glycemic_index > 0 && (
                              <Badge className={`${
                                selectedFood.glycemic_category === 'low' ? 'bg-green-500/20 text-green-400' :
                                selectedFood.glycemic_category === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                GI: {selectedFood.glycemic_index} ({selectedFood.glycemic_category})
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Recommendation Badge */}
                      {foodAnalysis && (
                        <div className="text-center">
                          <div className={`w-16 h-16 rounded-full ${getRecommendationColor(foodAnalysis.recommendation)} flex items-center justify-center mx-auto`}>
                            <span className="text-white text-xl font-bold">{foodAnalysis.nutritional_score}</span>
                          </div>
                          <p className={`text-xs mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {foodAnalysis.recommendation.toUpperCase()}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Serving Size Slider */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Serving Size
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {servingSize}g
                        </span>
                      </div>
                      <Slider
                        value={[servingSize]}
                        onValueChange={([val]) => setServingSize(val)}
                        min={10}
                        max={500}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  {isAnalyzing ? (
                    <div className={`rounded-xl border p-12 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                      <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Analyzing molecular composition and organ effects...
                      </p>
                    </div>
                  ) : foodAnalysis && (
                    <>
                      {/* Warnings & Alerts */}
                      {foodAnalysis.warnings.length > 0 && (
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200'}`}>
                          <button
                            onClick={() => toggleSection('warnings')}
                            className="w-full flex items-center justify-between"
                          >
                            <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                              <AlertTriangle className="w-4 h-4" />
                              Warnings & Alerts ({foodAnalysis.warnings.length})
                            </h3>
                            {expandedSections.warnings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          
                          {expandedSections.warnings && (
                            <div className="mt-3 space-y-2">
                              {foodAnalysis.warnings.map((warning, idx) => (
                                <div 
                                  key={idx}
                                  className={`p-3 rounded-lg ${
                                    warning.severity === 'critical' ? 'bg-red-500/20' :
                                    warning.severity === 'high' ? 'bg-orange-500/20' : 'bg-yellow-500/20'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                                      warning.severity === 'critical' ? 'text-red-400' :
                                      warning.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                                    }`} />
                                    <div>
                                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {warning.message}
                                      </p>
                                      {warning.condition && (
                                        <Badge className="text-[10px] mt-1">
                                          Related to: {warning.condition}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Benefits */}
                      {foodAnalysis.benefits.length > 0 && (
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-emerald-50 border-emerald-200'}`}>
                          <h3 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            <CheckCircle className="w-4 h-4" />
                            Potential Benefits
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {foodAnalysis.benefits.map((benefit, idx) => (
                              <Badge key={idx} className="bg-emerald-500/20 text-emerald-400">
                                {benefit.message}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Nutrients Grid */}
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
                            {Object.entries(selectedFood.nutrients || {}).map(([nutrient, data]) => {
                              const value = (data.value * (servingSize / selectedFood.serving_size)).toFixed(1);
                              return (
                                <div
                                  key={nutrient}
                                  className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                                >
                                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {nutrient.replace(/_/g, ' ')}
                                  </div>
                                  <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {value}
                                    <span className="text-xs font-normal ml-1">{data.unit}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      {/* Organ Effects */}
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
                            {Object.entries(foodAnalysis.organ_impact_summary || selectedFood.organ_effects || {}).map(([organ, data]) => {
                              const OrganIcon = ORGAN_ICONS[organ] || Activity;
                              const effect = data.effect || data;
                              return (
                                <div
                                  key={organ}
                                  className={`p-4 rounded-lg border ${
                                    data.relevance === 'high' 
                                      ? isDark ? 'border-purple-500/50 bg-purple-900/20' : 'border-purple-300 bg-purple-50'
                                      : isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      effect === 'beneficial' ? 'bg-emerald-500/20' :
                                      effect === 'caution' || effect === 'caution_warfarin' ? 'bg-orange-500/20' :
                                      'bg-gray-500/20'
                                    }`}>
                                      <OrganIcon className={`w-5 h-5 ${getEffectColor(effect)}`} />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                          {organ.replace(/_/g, ' ')}
                                        </span>
                                        {data.relevance === 'high' && (
                                          <Badge className="text-[10px] bg-purple-500/20 text-purple-400">
                                            Relevant to you
                                          </Badge>
                                        )}
                                      </div>
                                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {data.mechanism || '—'}
                                      </p>
                                    </div>
                                    <Badge className={`${
                                      effect === 'beneficial' ? 'bg-emerald-500/20 text-emerald-400' :
                                      effect === 'caution' || effect === 'caution_warfarin' ? 'bg-orange-500/20 text-orange-400' :
                                      effect === 'favorable' ? 'bg-green-500/20 text-green-400' :
                                      'bg-gray-500/20 text-gray-400'
                                    }`}>
                                      {effect}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      {/* Molecular Compounds */}
                      {selectedFood.compounds && selectedFood.compounds.length > 0 && (
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                          <button
                            onClick={() => toggleSection('molecular')}
                            className="w-full flex items-center justify-between"
                          >
                            <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              <Dna className="w-4 h-4 text-cyan-500" />
                              Bioactive Compounds
                            </h3>
                            {expandedSections.molecular ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          
                          {expandedSections.molecular && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {selectedFood.compounds.map((compound, idx) => (
                                <Badge 
                                  key={idx}
                                  className="bg-cyan-500/20 text-cyan-400"
                                >
                                  🧬 {compound.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
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
