import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Apple, Droplets, Heart, Brain, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, Activity, Zap, Shield, Target, Pill, User,
  TrendingUp, TrendingDown, Minus, Loader2, X, UtensilsCrossed, Leaf,
  Sparkles, Flame, Microscope, Atom, Gauge, Menu, Scale, Ruler,
  Calendar, Weight, HeartPulse, Beaker, TestTube, FileText, Plus,
  Camera, Image, Upload, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Slider } from '../components/ui/slider';
import { Textarea } from '../components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { toast } from 'sonner';
import FeatureNav from '../components/FeatureNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Multi-scale analysis levels (mirrors disease dashboard depth)
const ANALYSIS_SCALES = [
  { id: 'overview', name: 'Overview', icon: '📊', description: 'Summary & health score' },
  { id: 'nutrients', name: 'Nutrients', icon: '🧬', description: 'All nutrients breakdown' },
  { id: 'molecular', name: 'Molecular', icon: '⚗️', description: 'Molecular compounds' },
  { id: 'cellular', name: 'Cellular', icon: '🔬', description: 'Cell-level effects' },
  { id: 'physiology', name: 'Physiology', icon: '⚡', description: 'Organ functions' },
  { id: 'clinical', name: 'Clinical', icon: '🩺', description: 'Lab parameters' },
];

// Organ systems for parameter effects
const ORGAN_SYSTEMS = [
  { id: 'cardiovascular', name: 'Cardio', icon: '❤️', color: 'from-red-500 to-rose-600' },
  { id: 'renal', name: 'Renal', icon: '🫘', color: 'from-amber-500 to-orange-600' },
  { id: 'hepatic', name: 'Hepatic', icon: '🫀', color: 'from-purple-500 to-violet-600' },
  { id: 'glycemic', name: 'Glycemic', icon: '🍬', color: 'from-pink-500 to-rose-600' },
  { id: 'gastrointestinal', name: 'GI', icon: '🥗', color: 'from-green-500 to-emerald-600' },
  { id: 'neurological', name: 'Neuro', icon: '🧠', color: 'from-blue-500 to-cyan-600' },
  { id: 'musculoskeletal', name: 'MSK', icon: '💪', color: 'from-orange-500 to-yellow-600' },
  { id: 'immune', name: 'Immune', icon: '🛡️', color: 'from-teal-500 to-cyan-600' },
  { id: 'endocrine', name: 'Endocrine', icon: '⚖️', color: 'from-indigo-500 to-purple-600' },
  { id: 'hematologic', name: 'Blood', icon: '🩸', color: 'from-red-600 to-rose-700' },
];

// Health score explanation
const HEALTH_SCORE_EXPLANATION = {
  '90-100': { label: 'Excellent', color: 'text-green-500', desc: 'Highly nutritious, minimal concerns' },
  '70-89': { label: 'Good', color: 'text-lime-500', desc: 'Generally healthy with minor considerations' },
  '50-69': { label: 'Moderate', color: 'text-yellow-500', desc: 'Balance of benefits and concerns' },
  '30-49': { label: 'Caution', color: 'text-orange-500', desc: 'Significant concerns, consume mindfully' },
  '0-29': { label: 'Low', color: 'text-red-500', desc: 'Multiple health concerns, limit intake' },
};

const getScoreInfo = (score) => {
  if (score >= 90) return HEALTH_SCORE_EXPLANATION['90-100'];
  if (score >= 70) return HEALTH_SCORE_EXPLANATION['70-89'];
  if (score >= 50) return HEALTH_SCORE_EXPLANATION['50-69'];
  if (score >= 30) return HEALTH_SCORE_EXPLANATION['30-49'];
  return HEALTH_SCORE_EXPLANATION['0-29'];
};

// Food icons based on type
const getFoodIcon = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('vitamin') || n.includes('supplement') || n.includes('omega')) return '💊';
  if (n.includes('juice') || n.includes('water') || n.includes('tea') || n.includes('coffee') || n.includes('cola') || n.includes('milk')) return '🥤';
  if (n.includes('chicken') || n.includes('beef') || n.includes('fish') || n.includes('salmon') || n.includes('egg') || n.includes('meat')) return '🥩';
  if (n.includes('rice') || n.includes('bread') || n.includes('pasta') || n.includes('oat') || n.includes('wheat')) return '🌾';
  if (n.includes('apple') || n.includes('banana') || n.includes('orange') || n.includes('mango') || n.includes('berry') || n.includes('fruit')) return '🍎';
  if (n.includes('spinach') || n.includes('broccoli') || n.includes('carrot') || n.includes('salad') || n.includes('vegetable')) return '🥬';
  if (n.includes('pizza') || n.includes('burger') || n.includes('curry') || n.includes('tikka') || n.includes('biryani')) return '🍽️';
  if (n.includes('cheese') || n.includes('yogurt') || n.includes('dairy')) return '🧀';
  return '🍴';
};

// Quick suggestions
const QUICK_FOODS = [
  'Banana', 'Salmon', 'Spinach', 'Chicken Tikka Masala', 'Green Tea',
  'Vitamin D', 'Avocado', 'Oatmeal', 'Eggs', 'Almonds', 'Coffee', 'Rice'
];

// Fallback diseases list (used if API fails)
const FALLBACK_DISEASES = [
  'Diabetes Type 2', 'Diabetes Type 1', 'Hypertension', 'Heart Failure',
  'Coronary Artery Disease', 'Atrial Fibrillation', 'Chronic Kidney Disease',
  'Acute Kidney Injury', 'Liver Cirrhosis', 'NAFLD', 'Hepatitis B', 'Hepatitis C',
  'Gout', 'Hyperuricemia', 'Hyperlipidemia', 'Hypercholesterolemia',
  'Obesity', 'Metabolic Syndrome', 'Hypothyroidism', 'Hyperthyroidism',
  'Anemia', 'Iron Deficiency Anemia', 'B12 Deficiency', 'Folate Deficiency',
  'Osteoporosis', 'Osteoarthritis', 'Rheumatoid Arthritis',
  'COPD', 'Asthma', 'Pneumonia', 'Sleep Apnea',
  'Depression', 'Anxiety', 'Migraine', 'Epilepsy', 'Parkinson\'s Disease',
  'Celiac Disease', 'IBS', 'Crohn\'s Disease', 'Ulcerative Colitis', 'GERD',
  'Hypokalemia', 'Hyperkalemia', 'Hyponatremia', 'Hypernatremia',
  'Hypocalcemia', 'Hypercalcemia', 'Hypomagnesemia',
  'Stroke', 'TIA', 'DVT', 'Pulmonary Embolism',
  'Breast Cancer', 'Lung Cancer', 'Colon Cancer', 'Prostate Cancer',
  'HIV/AIDS', 'Tuberculosis', 'COVID-19', 'Influenza'
];

// Common allergies
const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Milk/Dairy', 'Eggs', 'Fish', 'Shellfish',
  'Wheat/Gluten', 'Soy', 'Sesame', 'Mustard', 'Sulfites'
];

// Common medications
const COMMON_MEDICATIONS = [
  'Metformin', 'Lisinopril', 'Amlodipine', 'Atorvastatin', 'Omeprazole',
  'Metoprolol', 'Losartan', 'Gabapentin', 'Levothyroxine', 'Warfarin',
  'Aspirin', 'Furosemide', 'Spironolactone', 'Prednisone', 'Insulin'
];

// Dietary preferences
const DIETARY_PREFS = [
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

// Parameter Card Component (like disease dashboard)
const ParameterCard = ({ param, isDark }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!param) return null;
  
  const directionColor = param.direction === 'increase' ? 'text-red-500' :
                        param.direction === 'decrease' ? 'text-blue-500' : 'text-gray-400';
  const bgColor = param.direction === 'increase' ? (isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200') :
                  param.direction === 'decrease' ? (isDark ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-200') :
                  (isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200');
  
  return (
    <div className={`rounded-lg border p-3 ${bgColor}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {param.direction === 'increase' && <TrendingUp className={`w-4 h-4 ${directionColor}`} />}
            {param.direction === 'decrease' && <TrendingDown className={`w-4 h-4 ${directionColor}`} />}
            {param.direction === 'neutral' && <Minus className={`w-4 h-4 ${directionColor}`} />}
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {param.parameter?.replace(/_/g, ' ')}
            </span>
          </div>
          {param.magnitude && (
            <Badge variant="outline" className="text-[9px]">{param.magnitude}</Badge>
          )}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      
      {expanded && (
        <div className={`mt-2 pt-2 border-t text-xs space-y-1 ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
          {param.mechanism && <p><strong>Mechanism:</strong> {param.mechanism}</p>}
          {param.clinical_significance && <p className="text-yellow-500"><strong>Clinical Note:</strong> {param.clinical_significance}</p>}
        </div>
      )}
    </div>
  );
};

// Nutrient Bar
const NutrientBar = ({ label, value, unit, percent, color = 'bg-green-500', isDark }) => {
  if (value === undefined || value === null) return null;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
        <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {value}{unit} {percent !== undefined && <span className="text-[10px] text-gray-500">({percent}% DV)</span>}
        </span>
      </div>
      <div className={`h-1.5 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(percent || value/20, 100)}%` }} />
      </div>
    </div>
  );
};

// Main Component
const FoodAnalysisPage = () => {
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  // Analysis state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeScale, setActiveScale] = useState('overview');
  
  // Panel state
  const [showPanel, setShowPanel] = useState(false);
  const [panelTab, setPanelTab] = useState('demographics');
  
  // Diseases from database
  const [allDiseases, setAllDiseases] = useState([]);
  const [diseasesLoading, setDiseasesLoading] = useState(true);
  
  // Food images for multi-image analysis
  const [foodImages, setFoodImages] = useState([]);
  const [isAnalyzingImages, setIsAnalyzingImages] = useState(false);
  
  // Patient profile - comprehensive
  const [profile, setProfile] = useState({
    // Demographics
    age: '',
    sex: '',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    // Medical
    conditions: [],
    medications: [],
    allergies: [],
    // Dietary
    dietaryPrefs: [],
    // Food intake
    foodIntake: '',
  });
  
  // Disease search
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [medSearch, setMedSearch] = useState('');
  
  // Fetch diseases from database on mount
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/diseases-db/list`);
        if (response.ok) {
          const data = await response.json();
          // Extract disease names from the response
          const diseaseNames = (data.diseases || []).map(d => d.name);
          setAllDiseases(diseaseNames);
        } else {
          console.warn('Failed to fetch diseases, using fallback list');
          setAllDiseases(FALLBACK_DISEASES);
        }
      } catch (error) {
        console.error('Error fetching diseases:', error);
        setAllDiseases(FALLBACK_DISEASES);
      } finally {
        setDiseasesLoading(false);
      }
    };
    fetchDiseases();
  }, []);
  
  // Filtered diseases from database
  const filteredDiseases = useMemo(() => {
    const diseases = allDiseases.length > 0 ? allDiseases : FALLBACK_DISEASES;
    if (!diseaseSearch) return diseases.slice(0, 10);
    return diseases.filter(d => 
      d.toLowerCase().includes(diseaseSearch.toLowerCase()) &&
      !profile.conditions.includes(d)
    ).slice(0, 10);
  }, [diseaseSearch, profile.conditions, allDiseases]);
  
  // Filtered medications
  const filteredMeds = useMemo(() => {
    if (!medSearch) return COMMON_MEDICATIONS.slice(0, 8);
    return COMMON_MEDICATIONS.filter(m => 
      m.toLowerCase().includes(medSearch.toLowerCase()) &&
      !profile.medications.includes(m)
    ).slice(0, 8);
  }, [medSearch, profile.medications]);
  
  // BMI calculation
  const bmi = useMemo(() => {
    if (profile.weight && profile.height) {
      const h = parseFloat(profile.height) / 100;
      return (parseFloat(profile.weight) / (h * h)).toFixed(1);
    }
    return null;
  }, [profile.weight, profile.height]);
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Limit to 10 images at a time
    const filesToProcess = files.slice(0, 10 - foodImages.length);
    
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFoodImages(prev => [...prev, {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove image
  const removeImage = (imageId) => {
    setFoodImages(prev => prev.filter(img => img.id !== imageId));
  };
  
  // Analyze images with AI (with timeout handling)
  const analyzeImages = async () => {
    if (foodImages.length === 0) {
      toast.error('Please add at least one food image');
      return;
    }
    
    setIsAnalyzingImages(true);
    setAnalysisResult(null);
    setActiveScale('overview');
    setShowPanel(false);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
    
    try {
      // Convert images to base64 for API
      const imageData = foodImages.map(img => ({
        name: img.name,
        data: img.preview.split(',')[1] // Remove data:image/xxx;base64, prefix
      }));
      
      const response = await fetch(`${BACKEND_URL}/api/food/analyze-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imageData,
          health_profile: profile.conditions.length > 0 || profile.medications.length > 0 ? {
            age: profile.age,
            sex: profile.sex,
            weight: profile.weight,
            height: profile.height,
            conditions: profile.conditions,
            medications: profile.medications,
            allergies: profile.allergies
          } : null
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
        toast.success(`Analyzed ${foodImages.length} food image${foodImages.length > 1 ? 's' : ''}`);
      } else {
        throw new Error(data.detail || 'Image analysis failed');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Image analysis error:', error);
      if (error.name === 'AbortError') {
        toast.error('Image analysis timed out. Please try again.');
      } else {
        toast.error('Image analysis failed. Please try again.');
      }
    } finally {
      setIsAnalyzingImages(false);
    }
  };

  // Smart search
  const smartSearch = useCallback((query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setShowResults(true);
    const q = query.toLowerCase();
    
    const results = [
      { id: `search_${q}`, name: query, type: 'search' }
    ];
    
    // Add matching suggestions
    const allFoods = [
      ...QUICK_FOODS,
      'Pizza', 'Burger', 'Pasta', 'Bread', 'Milk', 'Cheese', 'Yogurt',
      'Potassium', 'Sodium', 'Magnesium', 'Calcium', 'Iron', 'Zinc',
      'Vitamin C', 'Vitamin B12', 'Omega-3', 'Fiber', 'Protein Shake',
      'Coca-Cola', 'Orange Juice', 'Apple', 'Grapes', 'Watermelon'
    ];
    
    allFoods.forEach(food => {
      if (food.toLowerCase().includes(q) && food.toLowerCase() !== q) {
        results.push({ id: `suggest_${food}`, name: food, type: 'suggestion' });
      }
    });
    
    setSearchResults(results.slice(0, 8));
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => smartSearch(searchQuery), 150);
    return () => clearTimeout(timer);
  }, [searchQuery, smartSearch]);
  
  // Analyze food with timeout handling
  const analyzeFood = async (foodName) => {
    setShowResults(false);
    setSearchQuery(foodName);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setActiveScale('overview');
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/food/analyze-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: foodName,
          serving_size: '1 standard serving',
          health_profile: profile.conditions.length > 0 || profile.medications.length > 0 || profile.allergies.length > 0 ? {
            age: profile.age,
            sex: profile.sex,
            weight: profile.weight,
            height: profile.height,
            conditions: profile.conditions,
            medications: profile.medications,
            allergies: profile.allergies,
            dietary_restrictions: profile.dietaryPrefs
          } : null
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
        toast.success('PhiCor analysis complete');
      } else {
        throw new Error(data.detail || 'Analysis failed');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Analysis error:', error);
      if (error.name === 'AbortError') {
        toast.error('Analysis timed out. Please try again.');
      } else {
        toast.error('Analysis failed. Please check your connection and try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Analyze multi-food intake with timeout handling
  const analyzeIntake = async () => {
    if (!profile.foodIntake.trim()) {
      toast.error('Please enter your food intake');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setActiveScale('overview');
    setShowPanel(false);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/food/analyze-daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daily_intake_text: profile.foodIntake,
          health_profile: profile.conditions.length > 0 || profile.medications.length > 0 ? {
            age: profile.age,
            sex: profile.sex,
            weight: profile.weight,
            height: profile.height,
            conditions: profile.conditions,
            medications: profile.medications,
            allergies: profile.allergies
          } : null
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
        toast.success('Food intake analysis complete');
      } else {
        throw new Error(data.detail || 'Analysis failed');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Analysis error:', error);
      if (error.name === 'AbortError') {
        toast.error('Analysis timed out. Please try again.');
      } else {
        toast.error('Analysis failed. Please check your connection and try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get parameter effects for a specific system
  const getSystemParams = (systemId) => {
    if (!analysisResult?.organ_system_parameter_effects) return null;
    return analysisResult.organ_system_parameter_effects[systemId];
  };

  return (
    <>
      <Helmet>
        <title>Π Food Analysis | PhiCor.ai</title>
      </Helmet>
      
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <FeatureNav />
        
        <div className="flex h-[calc(100vh-64px)]">
          {/* Left Panel - Patient Profile (Desktop) */}
          <div className={`hidden lg:flex flex-col w-80 flex-shrink-0 border-r overflow-hidden ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <User className="w-4 h-4 text-green-500" />
                Subject Profile
              </h3>
              
              <Tabs defaultValue="demographics" className="w-full">
                <TabsList className="w-full grid grid-cols-4 h-8 mb-3">
                  <TabsTrigger value="demographics" className="text-[9px] px-1">Bio</TabsTrigger>
                  <TabsTrigger value="medical" className="text-[9px] px-1">Medical</TabsTrigger>
                  <TabsTrigger value="dietary" className="text-[9px] px-1">Diet</TabsTrigger>
                  <TabsTrigger value="intake" className="text-[9px] px-1">Intake</TabsTrigger>
                </TabsList>
                
                {/* Demographics Tab */}
                <TabsContent value="demographics" className="space-y-3 mt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Age</label>
                      <Input
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile(p => ({ ...p, age: e.target.value }))}
                        placeholder="Years"
                        className={`h-8 text-xs mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sex</label>
                      <select
                        value={profile.sex}
                        onChange={(e) => setProfile(p => ({ ...p, sex: e.target.value }))}
                        className={`w-full h-8 text-xs mt-1 rounded-md border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
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
                        value={profile.weight}
                        onChange={(e) => setProfile(p => ({ ...p, weight: e.target.value }))}
                        placeholder="kg"
                        className={`h-8 text-xs mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Height (cm)</label>
                      <Input
                        type="number"
                        value={profile.height}
                        onChange={(e) => setProfile(p => ({ ...p, height: e.target.value }))}
                        placeholder="cm"
                        className={`h-8 text-xs mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                      />
                    </div>
                  </div>
                  
                  {/* BMI Display */}
                  {bmi && (
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-green-50'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>BMI</span>
                        <span className={`text-lg font-bold ${
                          parseFloat(bmi) < 18.5 ? 'text-blue-500' :
                          parseFloat(bmi) < 25 ? 'text-green-500' :
                          parseFloat(bmi) < 30 ? 'text-yellow-500' : 'text-red-500'
                        }`}>{bmi}</span>
                      </div>
                      <div className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {parseFloat(bmi) < 18.5 ? 'Underweight' :
                         parseFloat(bmi) < 25 ? 'Normal' :
                         parseFloat(bmi) < 30 ? 'Overweight' : 'Obese'}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Activity Level</label>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      {['sedentary', 'moderate', 'active'].map(level => (
                        <button
                          key={level}
                          onClick={() => setProfile(p => ({ ...p, activityLevel: level }))}
                          className={`p-2 rounded text-[10px] capitalize border ${
                            profile.activityLevel === level
                              ? 'bg-green-500/20 border-green-500/50 text-green-400'
                              : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Medical Tab */}
                <TabsContent value="medical" className="space-y-3 mt-0">
                  {/* Conditions Search */}
                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Medical Conditions
                    </label>
                    <Input
                      value={diseaseSearch}
                      onChange={(e) => setDiseaseSearch(e.target.value)}
                      placeholder="Search diseases..."
                      className={`h-8 text-xs mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                    />
                    <div className="flex flex-wrap gap-1 mt-2 max-h-24 overflow-y-auto">
                      {filteredDiseases.map(d => (
                        <button
                          key={d}
                          onClick={() => {
                            if (!profile.conditions.includes(d)) {
                              setProfile(p => ({ ...p, conditions: [...p.conditions, d] }));
                            }
                            setDiseaseSearch('');
                          }}
                          className={`px-2 py-1 rounded text-[9px] border ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
                        >
                          + {d}
                        </button>
                      ))}
                    </div>
                    {/* Selected conditions */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.conditions.map((c, i) => (
                        <Badge key={i} className="text-[9px] bg-blue-500/20 text-blue-400 cursor-pointer"
                          onClick={() => setProfile(p => ({ ...p, conditions: p.conditions.filter((_, idx) => idx !== i) }))}>
                          {c} <X className="w-2 h-2 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Medications Search */}
                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Current Medications
                    </label>
                    <Input
                      value={medSearch}
                      onChange={(e) => setMedSearch(e.target.value)}
                      placeholder="Search or type medication..."
                      className={`h-8 text-xs mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && medSearch.trim() && !profile.medications.includes(medSearch.trim())) {
                          setProfile(p => ({ ...p, medications: [...p.medications, medSearch.trim()] }));
                          setMedSearch('');
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filteredMeds.map(m => (
                        <button
                          key={m}
                          onClick={() => {
                            if (!profile.medications.includes(m)) {
                              setProfile(p => ({ ...p, medications: [...p.medications, m] }));
                            }
                            setMedSearch('');
                          }}
                          className={`px-2 py-1 rounded text-[9px] border ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
                        >
                          + {m}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.medications.map((m, i) => (
                        <Badge key={i} className="text-[9px] bg-purple-500/20 text-purple-400 cursor-pointer"
                          onClick={() => setProfile(p => ({ ...p, medications: p.medications.filter((_, idx) => idx !== i) }))}>
                          {m} <X className="w-2 h-2 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Allergies */}
                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Food Allergies
                    </label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {COMMON_ALLERGIES.map(a => (
                        <button
                          key={a}
                          onClick={() => {
                            setProfile(p => ({
                              ...p,
                              allergies: p.allergies.includes(a) 
                                ? p.allergies.filter(x => x !== a)
                                : [...p.allergies, a]
                            }));
                          }}
                          className={`px-2 py-1 rounded text-[9px] border ${
                            profile.allergies.includes(a)
                              ? 'bg-red-500/20 border-red-500/50 text-red-400'
                              : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                          }`}
                        >
                          {a}
                        </button>
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
                      {DIETARY_PREFS.map(pref => (
                        <button
                          key={pref.id}
                          onClick={() => {
                            setProfile(p => ({
                              ...p,
                              dietaryPrefs: p.dietaryPrefs.includes(pref.id)
                                ? p.dietaryPrefs.filter(x => x !== pref.id)
                                : [...p.dietaryPrefs, pref.id]
                            }));
                          }}
                          className={`p-2 rounded text-[10px] flex items-center gap-1 border ${
                            profile.dietaryPrefs.includes(pref.id)
                              ? 'bg-green-500/20 border-green-500/50 text-green-400'
                              : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                          }`}
                        >
                          <span>{pref.icon}</span>
                          <span>{pref.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Food Intake Tab */}
                <TabsContent value="intake" className="space-y-3 mt-0">
                  <div className={`p-2 rounded-lg text-[10px] ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700'}`}>
                    💡 Enter what you ate or upload food photos for AI analysis
                  </div>
                  
                  {/* Text Intake */}
                  <Textarea
                    value={profile.foodIntake}
                    onChange={(e) => setProfile(p => ({ ...p, foodIntake: e.target.value }))}
                    placeholder="Example:
Breakfast: 2 eggs, toast, orange juice
Lunch: Chicken salad, bread roll
Dinner: Salmon with rice and vegetables
Snacks: Apple, almonds, green tea"
                    className={`min-h-[120px] text-xs ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                  />
                  <Button 
                    onClick={analyzeIntake}
                    disabled={isAnalyzing || !profile.foodIntake.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Analyze Text Intake
                  </Button>
                  
                  {/* Divider */}
                  <div className="flex items-center gap-2 py-1">
                    <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>OR</span>
                    <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  </div>
                  
                  {/* Image Upload Section */}
                  <div>
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      📸 Upload Food Photos
                    </label>
                    <p className={`text-[9px] mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                      Upload photos of your meals for AI analysis (up to 10 images)
                    </p>
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    
                    {/* Upload button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={foodImages.length >= 10}
                      className={`w-full mt-2 h-20 border-dashed flex flex-col gap-1 ${isDark ? 'border-gray-700 hover:bg-gray-800' : ''}`}
                    >
                      <Camera className="w-5 h-5 text-green-500" />
                      <span className="text-xs">Add Photos</span>
                      <span className="text-[9px] text-gray-500">{foodImages.length}/10 images</span>
                    </Button>
                    
                    {/* Image Previews */}
                    {foodImages.length > 0 && (
                      <div className="mt-2 grid grid-cols-4 gap-1">
                        {foodImages.map((img) => (
                          <div key={img.id} className="relative group aspect-square">
                            <img
                              src={img.preview}
                              alt={img.name}
                              className="w-full h-full object-cover rounded"
                            />
                            <button
                              onClick={() => removeImage(img.id)}
                              className="absolute top-0 right-0 p-0.5 bg-red-500 rounded-bl text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Analyze Images Button */}
                    {foodImages.length > 0 && (
                      <Button 
                        onClick={analyzeImages}
                        disabled={isAnalyzingImages}
                        className="w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        {isAnalyzingImages ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Image className="w-4 h-4 mr-2" />
                        )}
                        Analyze {foodImages.length} Photo{foodImages.length > 1 ? 's' : ''}
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className={`p-3 sm:p-4 border-b ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Mobile menu button */}
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowPanel(true)}>
                  <Menu className="w-5 h-5" />
                </Button>
                
                {/* Pi Icon */}
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">Π</span>
                </div>
                
                {/* Search */}
                <div className="flex-1 relative">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                    onKeyPress={(e) => e.key === 'Enter' && searchQuery.trim() && analyzeFood(searchQuery)}
                    placeholder="Search food, dish, vitamin, nutrient..."
                    className={`pr-10 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                  />
                  {isAnalyzing ? (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-green-500" />
                  ) : (
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  )}
                  
                  {/* Search Dropdown */}
                  {showResults && searchResults.length > 0 && (
                    <div className={`absolute z-50 left-0 right-0 mt-2 rounded-xl border shadow-xl overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => analyzeFood(item.name)}
                          className={`w-full p-3 text-left flex items-center gap-3 border-b last:border-0 ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
                        >
                          <span className="text-lg">{getFoodIcon(item.name)}</span>
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {item.type === 'search' ? 'Analyze with PhiCor' : 'Quick suggestion'}
                            </div>
                          </div>
                          <Badge className="text-[9px] bg-green-500/20 text-green-500">Π</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profile badges */}
              {(profile.conditions.length > 0 || profile.medications.length > 0 || profile.allergies.length > 0) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.conditions.slice(0, 3).map((c, i) => (
                    <Badge key={i} className="text-[9px] bg-blue-500/20 text-blue-400">{c}</Badge>
                  ))}
                  {profile.medications.slice(0, 2).map((m, i) => (
                    <Badge key={i} className="text-[9px] bg-purple-500/20 text-purple-400">{m}</Badge>
                  ))}
                  {profile.allergies.slice(0, 2).map((a, i) => (
                    <Badge key={i} className="text-[9px] bg-red-500/20 text-red-400">{a}</Badge>
                  ))}
                  {(profile.conditions.length + profile.medications.length + profile.allergies.length > 7) && (
                    <Badge variant="outline" className="text-[9px]">+{profile.conditions.length + profile.medications.length + profile.allergies.length - 7} more</Badge>
                  )}
                </div>
              )}
            </div>
            
            {/* Parameter Scale Tabs */}
            {analysisResult && (
              <div className={`px-3 sm:px-4 py-2 border-b overflow-x-auto ${isDark ? 'bg-gray-900/20 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex gap-1">
                  {PARAM_SCALES.map(scale => (
                    <button
                      key={scale.id}
                      onClick={() => setActiveScale(scale.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
                        activeScale === scale.id
                          ? 'bg-green-500 text-white'
                          : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span>{scale.icon}</span>
                      <span className="hidden sm:inline">{scale.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-3 sm:p-4">
                {(isAnalyzing || isAnalyzingImages) ? (
                  <div className={`rounded-xl border p-8 sm:p-12 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="w-16 h-16 mx-auto mb-4 relative">
                      <div className="w-16 h-16 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin" style={{ animationDuration: '1s', animationTimingFunction: 'linear' }} />
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-green-500">Π</span>
                    </div>
                    <h3 className={`text-base sm:text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      PhiCor Deep Analysis
                    </h3>
                    <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {isAnalyzingImages ? 'Analyzing food images with AI vision...' : 'Analyzing nutrients at molecular, cellular & organ levels...'}
                    </p>
                    <p className={`text-[10px] mt-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                      ⏱️ This may take 30-60 seconds for comprehensive analysis
                    </p>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-4">
                    {/* Header Card with Score Explanation */}
                    <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <span className="text-2xl">{getFoodIcon(analysisResult.product_name || analysisResult.dish_name)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {analysisResult.product_name || analysisResult.dish_name}
                          </h2>
                          <p className={`text-xs line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {analysisResult.description}
                          </p>
                        </div>
                        {/* Enhanced Score Display */}
                        <div className="text-center flex-shrink-0">
                          {(() => {
                            const score = analysisResult.clinical_summary?.healthfulness_score || analysisResult.healthfulness_score || 50;
                            const scoreInfo = getScoreInfo(score);
                            return (
                              <>
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${
                                  score >= 70 ? 'bg-green-500/20 border-green-500' :
                                  score >= 50 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-orange-500/20 border-orange-500'
                                }`}>
                                  <span className={`text-xl font-bold ${
                                    score >= 70 ? 'text-green-500' :
                                    score >= 50 ? 'text-yellow-500' : 'text-orange-500'
                                  }`}>
                                    {score}
                                  </span>
                                </div>
                                <p className={`text-[10px] mt-1 font-medium ${scoreInfo.color}`}>{scoreInfo.label}</p>
                                <p className={`text-[8px] max-w-[80px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{scoreInfo.desc}</p>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Overview Tab */}
                    {activeScale === 'overview' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Macros */}
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                          <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Macronutrients
                          </h3>
                          <div className="space-y-2">
                            <NutrientBar label="Calories" value={analysisResult.complete_nutritional_profile?.macronutrients?.energy_kcal || analysisResult.macronutrients?.calories?.value} unit=" kcal" percent={0} color="bg-orange-500" isDark={isDark} />
                            <NutrientBar label="Protein" value={analysisResult.complete_nutritional_profile?.macronutrients?.protein_g || analysisResult.macronutrients?.protein?.value} unit="g" percent={0} color="bg-red-500" isDark={isDark} />
                            <NutrientBar label="Carbs" value={analysisResult.complete_nutritional_profile?.macronutrients?.carbohydrates_g || analysisResult.macronutrients?.carbohydrates?.total?.value} unit="g" percent={0} color="bg-yellow-500" isDark={isDark} />
                            <NutrientBar label="Fat" value={analysisResult.complete_nutritional_profile?.macronutrients?.fat_total_g || analysisResult.macronutrients?.fats?.total?.value} unit="g" percent={0} color="bg-blue-500" isDark={isDark} />
                          </div>
                        </div>
                        
                        {/* Key Insights */}
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                          <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Clinical Summary
                          </h3>
                          {analysisResult.clinical_summary?.key_benefits?.length > 0 && (
                            <div className="mb-3">
                              <span className={`text-[10px] font-semibold text-green-500`}>Benefits</span>
                              {analysisResult.clinical_summary.key_benefits.slice(0, 3).map((b, i) => (
                                <div key={i} className="flex items-start gap-2 mt-1">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{b}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {analysisResult.clinical_summary?.key_concerns?.length > 0 && (
                            <div>
                              <span className={`text-[10px] font-semibold text-orange-500`}>Concerns</span>
                              {analysisResult.clinical_summary.key_concerns.slice(0, 3).map((c, i) => (
                                <div key={i} className="flex items-start gap-2 mt-1">
                                  <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5" />
                                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{c}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* System Overview */}
                        {analysisResult.organ_system_parameter_effects && (
                          <div className={`rounded-xl border p-4 lg:col-span-2 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              Organ System Effects
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {Object.entries(analysisResult.organ_system_parameter_effects).map(([system, data]) => (
                                <button
                                  key={system}
                                  onClick={() => setActiveScale(system)}
                                  className={`p-3 rounded-lg border text-center transition-all ${
                                    data.overall_effect === 'beneficial' ? (isDark ? 'bg-green-900/20 border-green-800/30 hover:bg-green-900/30' : 'bg-green-50 border-green-200 hover:bg-green-100') :
                                    data.overall_effect === 'caution' || data.overall_effect === 'harmful' ? (isDark ? 'bg-orange-900/20 border-orange-800/30 hover:bg-orange-900/30' : 'bg-orange-50 border-orange-200 hover:bg-orange-100') :
                                    (isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gray-100 border-gray-200 hover:bg-gray-200')
                                  }`}
                                >
                                  <span className="text-xl">
                                    {system === 'cardiovascular' ? '❤️' :
                                     system === 'renal' ? '🫘' :
                                     system === 'hepatic' ? '🫀' :
                                     system === 'glycemic' ? '🍬' :
                                     system === 'gastrointestinal' ? '🥗' :
                                     system === 'neurological' ? '🧠' :
                                     system === 'musculoskeletal' ? '💪' :
                                     system === 'immune' ? '🛡️' : '🔬'}
                                  </span>
                                  <div className={`text-xs font-medium capitalize mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {system.slice(0, 6)}
                                  </div>
                                  <Badge className={`mt-1 text-[8px] ${
                                    data.overall_effect === 'beneficial' ? 'bg-green-500/30 text-green-400' :
                                    data.overall_effect === 'caution' ? 'bg-orange-500/30 text-orange-400' :
                                    'bg-gray-500/30 text-gray-400'
                                  }`}>
                                    {data.overall_effect}
                                  </Badge>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* System-specific parameter views */}
                    {activeScale !== 'overview' && (
                      <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl">
                            {activeScale === 'cardiovascular' ? '❤️' :
                             activeScale === 'renal' ? '🫘' :
                             activeScale === 'hepatic' ? '🫀' :
                             activeScale === 'glycemic' ? '🍬' :
                             activeScale === 'gastrointestinal' ? '🥗' :
                             activeScale === 'neurological' ? '🧠' :
                             activeScale === 'musculoskeletal' ? '💪' :
                             activeScale === 'immune' ? '🛡️' : '📊'}
                          </span>
                          <h3 className={`text-sm font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {activeScale} Parameters
                          </h3>
                          {getSystemParams(activeScale)?.overall_effect && (
                            <Badge className={`ml-auto ${
                              getSystemParams(activeScale).overall_effect === 'beneficial' ? 'bg-green-500/20 text-green-400' :
                              getSystemParams(activeScale).overall_effect === 'caution' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {getSystemParams(activeScale).overall_effect}
                            </Badge>
                          )}
                        </div>
                        
                        {getSystemParams(activeScale)?.parameters_affected ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {getSystemParams(activeScale).parameters_affected.map((param, i) => (
                              <ParameterCard key={i} param={param} isDark={isDark} />
                            ))}
                          </div>
                        ) : (
                          <p className={`text-sm text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            No parameter data available for this system
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Personalized Risk Assessment */}
                    {analysisResult.personalized_risk_assessment && (
                      <div className={`rounded-xl border p-4 ${isDark ? 'bg-orange-900/20 border-orange-800/30' : 'bg-orange-50 border-orange-200'}`}>
                        <h3 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                          <AlertTriangle className="w-4 h-4" />
                          Personalized Risk Assessment
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Suitability:</span>
                          <Badge className={`${
                            analysisResult.personalized_risk_assessment.overall_suitability === 'highly_suitable' ? 'bg-green-500' :
                            analysisResult.personalized_risk_assessment.overall_suitability === 'suitable' ? 'bg-emerald-500' :
                            analysisResult.personalized_risk_assessment.overall_suitability === 'caution' ? 'bg-yellow-500' : 'bg-red-500'
                          } text-white`}>
                            {analysisResult.personalized_risk_assessment.overall_suitability?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        {analysisResult.personalized_risk_assessment.condition_specific_analysis?.length > 0 && (
                          <div className="space-y-2">
                            {analysisResult.personalized_risk_assessment.condition_specific_analysis.map((ca, i) => (
                              <div key={i} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{ca.condition}</span>
                                  <Badge className={`text-[9px] ${ca.risk_level === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {ca.risk_level} risk
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty State */
                  <div className={`rounded-xl border p-8 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                      <span className="text-3xl font-bold text-green-500">Π</span>
                    </div>
                    <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      PhiCor Food Analysis
                    </h3>
                    <p className={`text-xs mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Search any food, dish, supplement, or nutrient to see how it affects your body parameters
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                      {QUICK_FOODS.slice(0, 8).map(food => (
                        <Button key={food} variant="outline" size="sm" onClick={() => analyzeFood(food)} className="text-xs">
                          {getFoodIcon(food)} {food}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* Mobile Panel */}
        <AnimatePresence>
          {showPanel && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowPanel(false)} />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className={`fixed left-0 top-0 h-full w-[85%] max-w-sm z-50 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-white'}`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Subject Profile</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowPanel(false)}><X className="w-4 h-4" /></Button>
                  </div>
                  
                  {/* Same tabs as desktop */}
                  <Tabs value={panelTab} onValueChange={setPanelTab}>
                    <TabsList className="w-full grid grid-cols-4 h-8 mb-3">
                      <TabsTrigger value="demographics" className="text-[9px]">Bio</TabsTrigger>
                      <TabsTrigger value="medical" className="text-[9px]">Medical</TabsTrigger>
                      <TabsTrigger value="dietary" className="text-[9px]">Diet</TabsTrigger>
                      <TabsTrigger value="intake" className="text-[9px]">Intake</TabsTrigger>
                    </TabsList>
                    
                    {/* Demographics */}
                    <TabsContent value="demographics" className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Age</label>
                          <Input type="number" value={profile.age} onChange={(e) => setProfile(p => ({ ...p, age: e.target.value }))} placeholder="Years" className={`h-8 text-xs ${isDark ? 'bg-gray-800 border-gray-700' : ''}`} />
                        </div>
                        <div>
                          <label className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sex</label>
                          <select value={profile.sex} onChange={(e) => setProfile(p => ({ ...p, sex: e.target.value }))} className={`w-full h-8 text-xs rounded-md border ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Weight (kg)</label>
                          <Input type="number" value={profile.weight} onChange={(e) => setProfile(p => ({ ...p, weight: e.target.value }))} placeholder="kg" className={`h-8 text-xs ${isDark ? 'bg-gray-800 border-gray-700' : ''}`} />
                        </div>
                        <div>
                          <label className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Height (cm)</label>
                          <Input type="number" value={profile.height} onChange={(e) => setProfile(p => ({ ...p, height: e.target.value }))} placeholder="cm" className={`h-8 text-xs ${isDark ? 'bg-gray-800 border-gray-700' : ''}`} />
                        </div>
                      </div>
                      {bmi && (
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-green-50'}`}>
                          <div className="flex justify-between"><span className="text-xs">BMI</span><span className="text-lg font-bold">{bmi}</span></div>
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* Medical */}
                    <TabsContent value="medical" className="space-y-3">
                      <div>
                        <label className={`text-[10px] font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Medical Conditions</label>
                        <Input value={diseaseSearch} onChange={(e) => setDiseaseSearch(e.target.value)} placeholder="Search diseases..." className={`h-8 text-xs mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`} />
                        <div className="flex flex-wrap gap-1 mt-2 max-h-32 overflow-y-auto">
                          {filteredDiseases.map(d => (
                            <button key={d} onClick={() => { setProfile(p => ({ ...p, conditions: [...p.conditions, d] })); setDiseaseSearch(''); }}
                              className={`px-2 py-1 rounded text-[9px] border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                              + {d}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {profile.conditions.map((c, i) => (
                            <Badge key={i} className="text-[9px] bg-blue-500/20 text-blue-400 cursor-pointer"
                              onClick={() => setProfile(p => ({ ...p, conditions: p.conditions.filter((_, idx) => idx !== i) }))}>
                              {c} <X className="w-2 h-2 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={`text-[10px] font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Allergies</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {COMMON_ALLERGIES.map(a => (
                            <button key={a} onClick={() => setProfile(p => ({ ...p, allergies: p.allergies.includes(a) ? p.allergies.filter(x => x !== a) : [...p.allergies, a] }))}
                              className={`px-2 py-1 rounded text-[9px] border ${profile.allergies.includes(a) ? 'bg-red-500/20 border-red-500/50 text-red-400' : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                              {a}
                            </button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Dietary */}
                    <TabsContent value="dietary" className="space-y-3">
                      <div className="grid grid-cols-2 gap-1">
                        {DIETARY_PREFS.map(pref => (
                          <button key={pref.id} onClick={() => setProfile(p => ({ ...p, dietaryPrefs: p.dietaryPrefs.includes(pref.id) ? p.dietaryPrefs.filter(x => x !== pref.id) : [...p.dietaryPrefs, pref.id] }))}
                            className={`p-2 rounded text-[10px] flex items-center gap-1 border ${profile.dietaryPrefs.includes(pref.id) ? 'bg-green-500/20 border-green-500/50 text-green-400' : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                            <span>{pref.icon}</span><span>{pref.label}</span>
                          </button>
                        ))}
                      </div>
                    </TabsContent>
                    
                    {/* Intake */}
                    <TabsContent value="intake" className="space-y-3">
                      <Textarea value={profile.foodIntake} onChange={(e) => setProfile(p => ({ ...p, foodIntake: e.target.value }))}
                        placeholder="What did you eat today?&#10;Breakfast: ...&#10;Lunch: ...&#10;Dinner: ..."
                        className={`min-h-[100px] text-xs ${isDark ? 'bg-gray-800 border-gray-700' : ''}`} />
                      <Button onClick={analyzeIntake} disabled={isAnalyzing || !profile.foodIntake.trim()} className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                        {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Analyze Text
                      </Button>
                      
                      {/* Mobile Image Upload */}
                      <div className="flex items-center gap-2 py-1">
                        <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>OR</span>
                        <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={foodImages.length >= 10}
                        className={`w-full h-16 border-dashed flex flex-col gap-1 ${isDark ? 'border-gray-700' : ''}`}
                      >
                        <Camera className="w-5 h-5 text-purple-500" />
                        <span className="text-xs">Upload Photos ({foodImages.length}/10)</span>
                      </Button>
                      
                      {foodImages.length > 0 && (
                        <>
                          <div className="grid grid-cols-5 gap-1">
                            {foodImages.map((img) => (
                              <div key={img.id} className="relative group aspect-square">
                                <img src={img.preview} alt={img.name} className="w-full h-full object-cover rounded" />
                                <button onClick={() => removeImage(img.id)} className="absolute top-0 right-0 p-0.5 bg-red-500 rounded-bl text-white">
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <Button onClick={analyzeImages} disabled={isAnalyzingImages} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                            {isAnalyzingImages ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Image className="w-4 h-4 mr-2" />}
                            Analyze Photos
                          </Button>
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default FoodAnalysisPage;
