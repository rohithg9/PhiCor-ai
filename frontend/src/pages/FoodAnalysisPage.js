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
  Send, ClipboardList, Calculator, Edit3, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import FeatureNav from '../components/FeatureNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Scale levels for food analysis (like disease dashboard)
const FOOD_SCALES = [
  { id: 'macros', name: 'Macros', fullName: 'Macronutrients', icon: '🍽️', description: 'Proteins, Carbs, Fats' },
  { id: 'micros', name: 'Micros', fullName: 'Micronutrients', icon: '💊', description: 'Vitamins & Minerals' },
  { id: 'elements', name: 'Elements', fullName: 'Electrolytes & Trace Elements', icon: '⚛️', description: 'Every mineral & element' },
  { id: 'compounds', name: 'Bioactives', fullName: 'Bioactive Compounds', icon: '🧬', description: 'Phytochemicals, Antioxidants' },
  { id: 'metabolic', name: 'Metabolic', fullName: 'Metabolic Impact', icon: '⚡', description: 'Glycemic, Insulin Response' },
  { id: 'params', name: 'Parameters', fullName: 'Parameter Effects', icon: '📊', description: 'Specific physiological parameters' },
  { id: 'organs', name: 'Organs', fullName: 'Organ System Effects', icon: '🫀', description: 'Multi-organ impact' },
  { id: 'risks', name: 'Risks', fullName: 'Personalized Risks', icon: '⚠️', description: 'Condition-specific warnings' },
];

// Food categories for smart search
const FOOD_CATEGORIES = {
  dishes: { icon: '🍽️', label: 'Prepared Dishes', color: 'text-orange-500' },
  fruits: { icon: '🍎', label: 'Fruits', color: 'text-red-500' },
  vegetables: { icon: '🥬', label: 'Vegetables', color: 'text-green-500' },
  proteins: { icon: '🥩', label: 'Proteins & Meats', color: 'text-rose-500' },
  grains: { icon: '🌾', label: 'Grains & Cereals', color: 'text-amber-500' },
  dairy: { icon: '🥛', label: 'Dairy', color: 'text-blue-400' },
  beverages: { icon: '🥤', label: 'Beverages', color: 'text-cyan-500' },
  supplements: { icon: '💊', label: 'Supplements', color: 'text-purple-500' },
  nutrients: { icon: '🧪', label: 'Individual Nutrients', color: 'text-teal-500' },
};

// Quick suggestions by category
const QUICK_SUGGESTIONS = {
  dishes: ['Chicken Tikka Masala', 'Pasta Carbonara', 'Sushi Roll', 'Caesar Salad', 'Pizza Margherita', 'Biryani', 'Ramen', 'Pad Thai'],
  fruits: ['Apple', 'Banana', 'Orange', 'Mango', 'Blueberries', 'Strawberries', 'Grapes', 'Watermelon', 'Avocado', 'Pomegranate'],
  vegetables: ['Spinach', 'Broccoli', 'Carrots', 'Kale', 'Sweet Potato', 'Tomatoes', 'Bell Peppers', 'Cucumber', 'Onions', 'Garlic'],
  proteins: ['Grilled Chicken', 'Salmon', 'Eggs', 'Tofu', 'Beef Steak', 'Shrimp', 'Lentils', 'Chickpeas', 'Greek Yogurt', 'Almonds'],
  grains: ['Brown Rice', 'Quinoa', 'Oatmeal', 'Whole Wheat Bread', 'White Rice', 'Pasta', 'Barley', 'Couscous'],
  dairy: ['Milk', 'Cheese', 'Yogurt', 'Cottage Cheese', 'Butter', 'Cream', 'Paneer', 'Kefir'],
  beverages: ['Water', 'Green Tea', 'Coffee', 'Orange Juice', 'Coconut Water', 'Protein Shake', 'Smoothie', 'Red Wine', 'Beer'],
  supplements: ['Vitamin D', 'Vitamin C', 'Omega-3 Fish Oil', 'Multivitamin', 'Iron Supplement', 'Calcium', 'Vitamin B12', 'Zinc', 'Magnesium', 'Probiotics'],
  nutrients: ['Sodium', 'Potassium', 'Magnesium', 'Calcium', 'Iron', 'Zinc', 'Vitamin A', 'Vitamin K', 'Folate', 'Fiber'],
};

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

// Daily intake guidance examples
const DAILY_INTAKE_EXAMPLES = [
  "Breakfast: 2 scrambled eggs, 2 slices whole wheat toast with butter, 1 cup orange juice",
  "Morning snack: 1 apple, handful of almonds (about 15)",
  "Lunch: Chicken tikka masala with 1 cup basmati rice, 1 roti",
  "Afternoon: 1 cup green tea, 2 digestive biscuits",
  "Dinner: Grilled salmon fillet (150g), steamed broccoli, quinoa",
  "Evening: 1 glass milk, 1 banana"
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

// Portion Selector Component
const PortionSelector = ({ foodType, quantity, setQuantity, unit, setUnit, isDark }) => {
  const portionOptions = {
    fruit: { units: ['pieces', 'cups', 'grams'], default: 1 },
    vegetable: { units: ['cups', 'grams', 'pieces'], default: 1 },
    beverage: { units: ['ml', 'cups', 'glasses', 'oz'], default: 250 },
    supplement: { units: ['tablets', 'capsules', 'mg', 'IU'], default: 1 },
    dish: { units: ['portion', 'cups', 'grams', 'plates'], default: 1 },
    pizza: { units: ['slices', 'whole pizza'], default: 2 },
    bread: { units: ['slices', 'pieces', 'grams'], default: 2 },
    default: { units: ['portion', 'grams', 'cups'], default: 1 },
  };
  
  const options = portionOptions[foodType] || portionOptions.default;
  
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
        className={`w-16 h-8 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
        min="0.1"
        step="0.5"
      />
      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        className={`h-8 text-xs rounded-md border px-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        {options.units.map(u => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
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
  const [activeCategory, setActiveCategory] = useState(null);
  
  // Analysis state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeScale, setActiveScale] = useState('macros');
  
  // Portion state
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('portion');
  const [foodType, setFoodType] = useState('default');
  
  // Health profile panel state
  const [showProfilePanel, setShowProfilePanel] = useState(true);
  const [activeProfileTab, setActiveProfileTab] = useState('profile');
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
  
  // Daily intake state
  const [dailyIntake, setDailyIntake] = useState('');
  const [isAnalyzingDaily, setIsAnalyzingDaily] = useState(false);
  const [dailyAnalysisResult, setDailyAnalysisResult] = useState(null);
  
  // Input states
  const [conditionSearch, setConditionSearch] = useState('');
  const [allergySearch, setAllergySearch] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  // Detect food type from name
  const detectFoodType = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('pizza')) return 'pizza';
    if (nameLower.includes('juice') || nameLower.includes('water') || nameLower.includes('tea') || 
        nameLower.includes('coffee') || nameLower.includes('milk') || nameLower.includes('smoothie')) return 'beverage';
    if (nameLower.includes('vitamin') || nameLower.includes('supplement') || nameLower.includes('omega') ||
        nameLower.includes('probiotic') || nameLower.includes('mineral')) return 'supplement';
    if (nameLower.includes('bread') || nameLower.includes('toast')) return 'bread';
    if (['apple', 'banana', 'orange', 'mango', 'grape', 'berry', 'strawberry', 'blueberry'].some(f => nameLower.includes(f))) return 'fruit';
    if (['spinach', 'broccoli', 'carrot', 'kale', 'lettuce', 'tomato', 'cucumber'].some(v => nameLower.includes(v))) return 'vegetable';
    return 'dish';
  };

  // Generate smart search results with categories
  const generateSmartResults = useCallback((query) => {
    const queryLower = query.toLowerCase();
    const results = [];
    
    // Search through all categories
    Object.entries(QUICK_SUGGESTIONS).forEach(([category, items]) => {
      items.forEach(item => {
        if (item.toLowerCase().includes(queryLower)) {
          results.push({
            name: item,
            category: category,
            source: 'suggestion',
            id: `${category}_${item.toLowerCase().replace(/\s+/g, '_')}`
          });
        }
      });
    });
    
    // Always add custom search option
    if (!results.find(r => r.name.toLowerCase() === queryLower)) {
      results.push({
        name: query,
        category: 'custom',
        source: 'search',
        id: `custom_${queryLower.replace(/\s+/g, '_')}`
      });
    }
    
    return results.slice(0, 12);
  }, []);

  // Search foods from database + smart suggestions
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
      
      const dbResults = data.success ? data.foods.map(f => ({ ...f, source: 'database' })) : [];
      const smartResults = generateSmartResults(query);
      
      // Combine and deduplicate
      const combined = [...dbResults];
      smartResults.forEach(item => {
        if (!combined.find(r => r.name.toLowerCase() === item.name.toLowerCase())) {
          combined.push(item);
        }
      });
      
      setSearchResults(combined.slice(0, 12));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(generateSmartResults(query));
    } finally {
      setIsSearching(false);
    }
  }, [generateSmartResults]);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchFoods(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, searchFoods]);
  
  // Analyze single food/dish
  const analyzeFood = async (food, customQuantity = null, customUnit = null, deepMode = false) => {
    setShowSuggestions(false);
    setSearchQuery(food.name);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    // Detect food type and set portion defaults
    const detectedType = detectFoodType(food.name);
    setFoodType(detectedType);
    
    const portionInfo = customQuantity && customUnit 
      ? `${customQuantity} ${customUnit}`
      : `${quantity} ${unit}`;
    
    try {
      // Use deep analysis endpoint for comprehensive parameter-level analysis
      const endpoint = deepMode ? '/api/food/analyze-product' : '/api/food/analyze-dish';
      const requestBody = deepMode ? {
        product_name: food.name,
        ingredient_list: food.ingredients || null,
        serving_size: portionInfo,
        health_profile: healthProfile.conditions.length > 0 || healthProfile.allergies.length > 0 || healthProfile.medications.length > 0 ? healthProfile : null
      } : {
        dish_name: food.name,
        serving_size: portionInfo,
        health_profile: healthProfile.conditions.length > 0 || healthProfile.allergies.length > 0 ? healthProfile : null
      };
      
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
        toast.success(deepMode ? 'PhiCor deep analysis complete' : 'PhiCor analysis complete');
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
  
  // Deep product analysis with ingredient list
  const analyzeProductDeep = async (productName, ingredientList = null) => {
    setShowSuggestions(false);
    setSearchQuery(productName);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/food/analyze-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          ingredient_list: ingredientList,
          serving_size: `${quantity} ${unit}`,
          health_profile: healthProfile.conditions.length > 0 || healthProfile.allergies.length > 0 || healthProfile.medications.length > 0 ? healthProfile : null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
        toast.success('PhiCor deep product analysis complete');
      } else {
        throw new Error(data.detail || 'Analysis failed');
      }
    } catch (error) {
      console.error('Deep analysis error:', error);
      toast.error('Deep analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Analyze daily intake (natural language)
  const analyzeDailyIntake = async () => {
    if (!dailyIntake.trim()) {
      toast.error('Please enter your daily food intake');
      return;
    }
    
    setIsAnalyzingDaily(true);
    setDailyAnalysisResult(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/food/analyze-daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daily_intake_text: dailyIntake,
          health_profile: healthProfile.conditions.length > 0 || healthProfile.allergies.length > 0 ? healthProfile : null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setDailyAnalysisResult(data.analysis);
        setAnalysisResult(data.analysis); // Show in main view
        setActiveProfileTab('profile'); // Switch back to profile
        toast.success('Daily intake analysis complete');
      } else {
        throw new Error(data.detail || 'Analysis failed');
      }
    } catch (error) {
      console.error('Daily analysis error:', error);
      toast.error('Daily intake analysis failed. Please try again.');
    } finally {
      setIsAnalyzingDaily(false);
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

  // Get category icon
  const getCategoryIcon = (category) => {
    const cat = FOOD_CATEGORIES[category];
    return cat ? cat.icon : '🍽️';
  };

  return (
    <>
      <Helmet>
        <title>Π Food Analysis Engine | PhiCor.ai</title>
        <meta name="description" content="PhiCor's Mathematical Food Analysis Engine - Deep molecular and biochemical analysis of any food, dish, supplement, or nutrient with organ system effects." />
      </Helmet>
      
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <FeatureNav />
        
        <div className="flex h-[calc(100vh-64px)]">
          {/* Left Side Panel - Profile & Daily Intake */}
          <AnimatePresence>
            {showProfilePanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className={`flex-shrink-0 border-r overflow-hidden ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <User className="w-4 h-4 text-green-500" />
                        Subject Profile
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowProfilePanel(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab}>
                      <TabsList className="w-full grid grid-cols-4 h-8 mb-3">
                        <TabsTrigger value="profile" className="text-[9px] px-1">Profile</TabsTrigger>
                        <TabsTrigger value="medical" className="text-[9px] px-1">Medical</TabsTrigger>
                        <TabsTrigger value="dietary" className="text-[9px] px-1">Diet</TabsTrigger>
                        <TabsTrigger value="daily" className="text-[9px] px-1">Daily Log</TabsTrigger>
                      </TabsList>
                      
                      {/* Profile/Biometrics Tab */}
                      <TabsContent value="profile" className="space-y-3 mt-0">
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
                            <label className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Weight (kg)</label>
                            <Input
                              type="number"
                              value={healthProfile.weight}
                              onChange={(e) => setHealthProfile(prev => ({ ...prev, weight: e.target.value }))}
                              placeholder="kg"
                              className={`text-xs h-8 mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                            />
                          </div>
                          <div>
                            <label className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Height (cm)</label>
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
                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                    : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* BMI Calculator */}
                        {healthProfile.weight && healthProfile.height && (
                          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-green-50'}`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>BMI</span>
                              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {(healthProfile.weight / Math.pow(healthProfile.height / 100, 2)).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      
                      {/* Medical Conditions Tab */}
                      <TabsContent value="medical" className="space-y-3 mt-0">
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
                            Dietary Preferences
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
                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
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
                      
                      {/* Daily Food Log Tab */}
                      <TabsContent value="daily" className="space-y-3 mt-0">
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20 border border-green-800/30' : 'bg-green-50 border border-green-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <ClipboardList className="w-4 h-4 text-green-500" />
                            <span className={`text-xs font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                              Daily Food Intake Log
                            </span>
                          </div>
                          <p className={`text-[10px] leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Describe everything you ate today in natural language. Include meals, snacks, beverages, and supplements with approximate quantities.
                          </p>
                        </div>
                        
                        <div>
                          <Textarea
                            value={dailyIntake}
                            onChange={(e) => setDailyIntake(e.target.value)}
                            placeholder="Example:
Breakfast: 2 scrambled eggs, 2 toast slices with butter, 1 cup orange juice

Morning snack: 1 apple, handful of almonds

Lunch: Chicken tikka masala with rice, 1 roti

Afternoon: green tea, 2 biscuits

Dinner: grilled salmon (150g), steamed vegetables, quinoa

Evening: glass of milk, 1 banana

Supplements: Vitamin D 1000IU, Omega-3 capsule"
                            className={`text-xs min-h-[200px] ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                          />
                        </div>
                        
                        <Button 
                          onClick={analyzeDailyIntake}
                          disabled={isAnalyzingDaily || !dailyIntake.trim()}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          {isAnalyzingDaily ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing Daily Intake...
                            </>
                          ) : (
                            <>
                              <Calculator className="w-4 h-4 mr-2" />
                              Analyze Full Day
                            </>
                          )}
                        </Button>
                        
                        {/* Quick Examples */}
                        <Collapsible>
                          <CollapsibleTrigger className={`w-full flex items-center justify-between p-2 rounded-lg text-xs ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            <span className="flex items-center gap-2">
                              <Info className="w-3 h-3" />
                              How to write your intake
                            </span>
                            <ChevronDown className="w-3 h-3" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className={`mt-2 p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                            <ul className="space-y-1.5">
                              {DAILY_INTAKE_EXAMPLES.map((example, idx) => (
                                <li key={idx} className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  • {example}
                                </li>
                              ))}
                            </ul>
                          </CollapsibleContent>
                        </Collapsible>
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
                      placeholder="Search any food, dish, supplement, or nutrient... (e.g., Pizza, Apple, Vitamin D, Potassium)"
                      className={`pr-10 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                    />
                    {isSearching ? (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-green-500" />
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
                          className={`absolute z-50 w-full mt-1 rounded-lg border shadow-xl max-h-96 overflow-y-auto ${
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
                              <span className="text-xl">{getCategoryIcon(food.category)}</span>
                              <div className="flex-1">
                                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {food.name}
                                </div>
                                <div className={`text-xs ${FOOD_CATEGORIES[food.category]?.color || 'text-gray-400'}`}>
                                  {FOOD_CATEGORIES[food.category]?.label || 'PhiCor Analysis'}
                                </div>
                              </div>
                              <Badge className="text-[10px] bg-green-500/20 text-green-400">
                                Π
                              </Badge>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Portion Selector */}
                {searchQuery && (
                  <PortionSelector
                    foodType={foodType}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    unit={unit}
                    setUnit={setUnit}
                    isDark={isDark}
                  />
                )}
              </div>
              
              {/* Category Quick Filters */}
              <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
                <span className={`text-xs mr-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Browse:</span>
                {Object.entries(FOOD_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveCategory(activeCategory === key ? null : key);
                      if (activeCategory !== key) {
                        setSearchQuery('');
                        setSearchResults(QUICK_SUGGESTIONS[key]?.map(item => ({
                          name: item,
                          category: key,
                          source: 'suggestion',
                          id: `${key}_${item.toLowerCase().replace(/\s+/g, '_')}`
                        })) || []);
                        setShowSuggestions(true);
                      }
                    }}
                    className={`px-2 py-1 rounded-full text-[10px] whitespace-nowrap flex items-center gap-1 transition-all ${
                      activeCategory === key
                        ? 'bg-green-500 text-white'
                        : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
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
                          ? 'bg-green-500 text-white'
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
                      <Loader2 className="w-20 h-20 animate-spin text-green-500" />
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-green-500">Π</span>
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
                              <Badge className="bg-green-500/20 text-green-400">{analysisResult.category}</Badge>
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
                              (analysisResult.clinical_scores?.healthfulness_score || analysisResult.healthfulness_score) >= 70 ? 'bg-green-500' :
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
                    
                    {/* Scale Content - Macros */}
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
                    
                    {/* Micros Tab */}
                    {activeScale === 'micros' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                                    {vit.value}{vit.unit} <span className="text-green-500">({vit.percent_daily || vit.daily_value_percent}% DV)</span>
                                  </span>
                                </div>
                                {vit.function && (
                                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{vit.function}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
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
                                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {min.value}{min.unit}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Bioactives Tab */}
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
                                  {compound.health_effects && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {compound.health_effects.map((e, i) => (
                                        <Badge key={i} className="text-[9px] bg-green-500/20 text-green-400">{e}</Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Metabolic Tab */}
                    {activeScale === 'metabolic' && analysisResult.metabolic_impact && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        </div>
                        
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                          <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Metabolic Pathways
                          </h3>
                          <div className="space-y-2">
                            {analysisResult.metabolic_impact.metabolic_pathways_activated?.slice(0, 4).map((pathway, idx) => (
                              <div key={idx} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{pathway.pathway}</span>
                                  <Badge className={pathway.effect === 'stimulated' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}>
                                    {pathway.effect}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Organs Tab */}
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
                    
                    {/* Molecular Tab */}
                    {activeScale === 'molecular' && (
                      <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <Microscope className="w-4 h-4 text-cyan-500" />
                          Molecular Level Analysis
                        </h3>
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Molecular pathway analysis is derived from the bioactive compounds and organ system effects.
                          </p>
                          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Key pathways: {analysisResult.bioactive_compounds?.flatMap(c => c.target_pathways || []).slice(0, 5).join(', ') || 'See Bioactives tab'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Recommendations */}
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
                                {analysisResult.healthier_alternatives.slice(0, 3).map((alt, idx) => (
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
                              <div className="space-y-1">
                                {analysisResult.preparation_modifications.slice(0, 3).map((mod, idx) => (
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
                      <span className={`text-4xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>Π</span>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      PhiCor Food Analysis Engine
                    </h3>
                    <p className={`text-sm mb-6 max-w-lg mx-auto ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Deep molecular & biochemical analysis of any food, dish, supplement, or nutrient. Get comprehensive profiles with organ system effects and personalized health insights.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-6">
                      {Object.entries(FOOD_CATEGORIES).slice(0, 4).map(([key, cat]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setActiveCategory(key);
                            setSearchResults(QUICK_SUGGESTIONS[key]?.map(item => ({
                              name: item,
                              category: key,
                              source: 'suggestion',
                              id: `${key}_${item.toLowerCase().replace(/\s+/g, '_')}`
                            })) || []);
                            setShowSuggestions(true);
                          }}
                          className={`p-4 rounded-xl border text-center transition-all ${
                            isDark ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-2xl block mb-1">{cat.icon}</span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Banana', 'Vitamin D', 'Green Tea', 'Salmon', 'Spinach', 'Almonds'].map(item => (
                        <Button
                          key={item}
                          variant="outline"
                          size="sm"
                          onClick={() => analyzeFood({ name: item, source: 'popular' })}
                        >
                          {item}
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
