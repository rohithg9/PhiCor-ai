import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Apple, Droplets, Heart, Brain, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Activity, Zap, Shield, Target, Pill, User,
  TrendingUp, TrendingDown, Minus, Loader2, X, UtensilsCrossed, Leaf,
  Sparkles, Flame, Microscope, Atom, Gauge, Menu, Scale, Ruler,
  Calendar, Weight, HeartPulse, Beaker, TestTube, FileText, Plus,
  Camera, Image, Upload, Trash2, ArrowLeft
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

// Custom hook for swipe detection - with vertical tolerance to prevent scroll interference
const useSwipe = (onSwipeLeft, onSwipeRight, threshold = 80) => {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchEndX = useRef(null);
  const touchEndY = useRef(null);
  
  const onTouchStart = (e) => {
    touchEndX.current = null;
    touchEndY.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };
  
  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };
  
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distanceX = touchStartX.current - touchEndX.current;
    const distanceY = touchStartY.current - touchEndY.current;
    
    // Only trigger swipe if horizontal movement is greater than vertical
    // This prevents swipe from triggering during vertical scroll
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY) * 1.5;
    
    if (!isHorizontalSwipe) return;
    
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    
    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
  };
  
  return { onTouchStart, onTouchMove, onTouchEnd };
};

// Multi-scale analysis levels (mirrors disease dashboard depth)
const ANALYSIS_SCALES = [
  { id: 'overview', name: 'Overview', icon: '📊', description: 'Summary & health score' },
  { id: 'items', name: 'Food Items', icon: '🍽️', description: 'Individual food breakdown' },
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

// Parameter Card Component - Shows key info at a glance, expandable for details
const ParameterCard = ({ param, isDark, compact = false }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!param) return null;
  
  const directionColor = param.direction === 'increase' ? 'text-red-500' :
                        param.direction === 'decrease' ? 'text-blue-500' : 'text-gray-400';
  const bgColor = param.direction === 'increase' ? (isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200') :
                  param.direction === 'decrease' ? (isDark ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-200') :
                  (isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200');
  
  // Format quantified change with sign and unit
  const formatQuantifiedChange = () => {
    if (param.quantified_change === null || param.quantified_change === undefined) return null;
    const sign = param.quantified_change > 0 ? '+' : '';
    return `${sign}${param.quantified_change} ${param.change_unit || ''}`.trim();
  };
  
  const quantifiedDisplay = formatQuantifiedChange();
  
  return (
    <div className={`rounded-lg border p-2 sm:p-3 ${bgColor}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {param.direction === 'increase' && <TrendingUp className={`w-3.5 h-3.5 flex-shrink-0 ${directionColor}`} />}
            {param.direction === 'decrease' && <TrendingDown className={`w-3.5 h-3.5 flex-shrink-0 ${directionColor}`} />}
            {param.direction === 'neutral' && <Minus className={`w-3.5 h-3.5 flex-shrink-0 ${directionColor}`} />}
            <span className={`text-xs sm:text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {param.parameter?.replace(/_/g, ' ')}
            </span>
          </div>
          {/* Quantified Change - Always visible and prominent */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {quantifiedDisplay ? (
              <span className={`text-sm sm:text-base font-bold ${
                param.quantified_change > 0 ? 'text-red-500' : 
                param.quantified_change < 0 ? 'text-blue-500' : 'text-gray-400'
              }`}>
                {quantifiedDisplay}
              </span>
            ) : (
              <Badge variant="outline" className="text-[8px] sm:text-[9px]">{param.magnitude || param.direction}</Badge>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''} ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        </div>
        {/* Show nutrient source inline for quick reference */}
        {param.from_nutrient && !expanded && (
          <div className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            via {param.from_nutrient}
          </div>
        )}
      </button>
      
      {expanded && (
        <div className={`mt-2 pt-2 border-t text-xs space-y-1 ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
          {param.mechanism && <p><strong>Mechanism:</strong> {param.mechanism}</p>}
          {param.from_nutrient && <p><strong>From:</strong> {param.from_nutrient} ({param.amount})</p>}
          {param.percent_dv && <p><strong>% Daily Value:</strong> {param.percent_dv}%</p>}
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

// Individual Food Item Card Component
const FoodItemCard = ({ item, isDark }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!item) return null;
  
  // Determine overall effect color
  const getEffectColor = (effect) => {
    if (effect === 'beneficial') return 'text-green-500';
    if (effect === 'caution') return 'text-orange-500';
    if (effect === 'harmful') return 'text-red-500';
    return 'text-gray-400';
  };
  
  const getBgColor = (effect) => {
    if (effect === 'beneficial') return isDark ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200';
    if (effect === 'caution') return isDark ? 'bg-orange-900/20 border-orange-800/30' : 'bg-orange-50 border-orange-200';
    if (effect === 'harmful') return isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200';
    return isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200';
  };
  
  // Count effects by type
  const effects = item.parameter_effects || {};
  const beneficialCount = Object.values(effects).filter(e => e?.effect === 'beneficial').length;
  const cautionCount = Object.values(effects).filter(e => e?.effect === 'caution').length;
  
  return (
    <div className={`rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="w-full p-3 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.item_name?.toLowerCase().includes('chicken') ? '🍗' : 
                                          item.item_name?.toLowerCase().includes('rice') ? '🍚' :
                                          item.item_name?.toLowerCase().includes('salad') ? '🥗' :
                                          item.item_name?.toLowerCase().includes('egg') ? '🥚' :
                                          item.item_name?.toLowerCase().includes('fish') ? '🐟' :
                                          item.item_name?.toLowerCase().includes('bread') ? '🍞' :
                                          item.item_name?.toLowerCase().includes('fruit') ? '🍎' :
                                          item.item_name?.toLowerCase().includes('vegetable') ? '🥦' : '🍽️'}</span>
              <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.item_name}</span>
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {item.estimated_portion} • {item.calories} kcal
            </div>
          </div>
          <div className="flex items-center gap-2">
            {beneficialCount > 0 && (
              <span className="text-xs text-green-500">✓{beneficialCount}</span>
            )}
            {cautionCount > 0 && (
              <span className="text-xs text-orange-500">⚠{cautionCount}</span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''} ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        </div>
        
        {/* Macros mini display */}
        <div className="flex gap-3 mt-2">
          <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            P: <span className="text-red-400">{item.macros?.protein_g}g</span>
          </span>
          <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            C: <span className="text-yellow-400">{item.macros?.carbs_g}g</span>
          </span>
          <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            F: <span className="text-blue-400">{item.macros?.fat_g}g</span>
          </span>
        </div>
      </button>
      
      {expanded && (
        <div className={`px-3 pb-3 space-y-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Key Nutrients */}
          {item.key_nutrients?.length > 0 && (
            <div className="pt-3">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Key Nutrients</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.key_nutrients.map((n, i) => (
                  <Badge key={i} variant="outline" className="text-[9px]">{n}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Parameter Effects */}
          {Object.keys(effects).length > 0 && (
            <div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Body System Effects</span>
              <div className="grid gap-1.5 mt-1">
                {Object.entries(effects).map(([system, data]) => (
                  <div key={system} className={`p-2 rounded text-xs ${getBgColor(data.effect)}`}>
                    <div className="flex items-center justify-between">
                      <span className={`capitalize font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{system}</span>
                      <span className={`font-bold ${getEffectColor(data.effect)}`}>
                        {data.effect === 'beneficial' ? '✓ Good' : data.effect === 'caution' ? '⚠ Caution' : data.effect}
                      </span>
                    </div>
                    <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{data.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recommendation */}
          {item.recommendation && (
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'}`}>
              <span className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>💡 {item.recommendation}</span>
            </div>
          )}
          
          {/* What to Modify */}
          {item.what_to_modify && (
            <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-900/20 border border-orange-800/30' : 'bg-orange-50 border border-orange-200'}`}>
              <span className={`text-xs ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>🔄 {item.what_to_modify}</span>
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
  const fileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  // Analysis state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeScale, setActiveScale] = useState('overview');
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const abortControllerRef = useRef(null);
  
  // "Did You Know?" facts about food and body parameters
  const foodFacts = useMemo(() => [
    { fact: "Potassium in bananas can lower blood pressure by 2-4 mmHg", organ: "🫀 Cardiovascular", nutrient: "Potassium" },
    { fact: "Spinach contains nitrates that dilate blood vessels, improving oxygen delivery by 5%", organ: "💪 Muscular", nutrient: "Nitrates" },
    { fact: "Omega-3 fatty acids in salmon reduce inflammation markers (CRP) by up to 30%", organ: "🛡️ Immune", nutrient: "Omega-3" },
    { fact: "Fiber in oats can lower LDL cholesterol by 5-10% over 6 weeks", organ: "🫀 Cardiovascular", nutrient: "Fiber" },
    { fact: "Vitamin D from eggs supports calcium absorption, improving bone density", organ: "🦴 Skeletal", nutrient: "Vitamin D" },
    { fact: "Lycopene in tomatoes crosses the blood-brain barrier, protecting neurons", organ: "🧠 Neurological", nutrient: "Lycopene" },
    { fact: "Turmeric's curcumin is 10x more bioavailable when combined with black pepper", organ: "🛡️ Immune", nutrient: "Curcumin" },
    { fact: "Blueberry anthocyanins can improve memory recall by 20% in clinical trials", organ: "🧠 Neurological", nutrient: "Anthocyanins" },
    { fact: "Garlic's allicin can reduce systolic blood pressure by 5-8 mmHg", organ: "🫀 Cardiovascular", nutrient: "Allicin" },
    { fact: "Green tea catechins increase metabolic rate by 4% over 24 hours", organ: "⚡ Metabolic", nutrient: "Catechins" },
    { fact: "Magnesium in dark chocolate improves insulin sensitivity by 15%", organ: "🔬 Endocrine", nutrient: "Magnesium" },
    { fact: "Sulforaphane in broccoli activates 200+ protective genes in cells", organ: "🔬 Cellular", nutrient: "Sulforaphane" },
    { fact: "Probiotics in yogurt increase serotonin production in the gut", organ: "🧠 Neurological", nutrient: "Probiotics" },
    { fact: "Beetroot nitrates improve exercise endurance by 16% in athletes", organ: "💪 Muscular", nutrient: "Nitrates" },
    { fact: "Vitamin C from oranges increases iron absorption by 67%", organ: "🩸 Hematological", nutrient: "Vitamin C" },
    { fact: "Walnuts contain ALA omega-3 that reduces triglycerides by 10%", organ: "🫀 Cardiovascular", nutrient: "ALA" },
    { fact: "Ginger compounds can reduce nausea intensity by 40% within 24 hours", organ: "🫃 Gastrointestinal", nutrient: "Gingerols" },
    { fact: "Quercetin in apples can reduce allergy symptoms by blocking histamine", organ: "🛡️ Immune", nutrient: "Quercetin" },
    { fact: "Vitamin K in kale activates proteins essential for blood clotting", organ: "🩸 Hematological", nutrient: "Vitamin K" },
    { fact: "Selenium in Brazil nuts supports thyroid hormone conversion (T4→T3)", organ: "🔬 Endocrine", nutrient: "Selenium" },
    { fact: "Choline in eggs is essential for liver fat metabolism", organ: "🔶 Hepatic", nutrient: "Choline" },
    { fact: "Capsaicin in peppers can increase calorie burning by 50 kcal/day", organ: "⚡ Metabolic", nutrient: "Capsaicin" },
    { fact: "Zinc in pumpkin seeds supports over 300 enzymatic reactions", organ: "🔬 Cellular", nutrient: "Zinc" },
    { fact: "Resveratrol in grapes activates longevity genes (sirtuins)", organ: "🔬 Cellular", nutrient: "Resveratrol" },
    { fact: "Potassium:Sodium ratio is more important than absolute sodium intake", organ: "🫘 Renal", nutrient: "Electrolytes" },
    { fact: "Tryptophan in turkey is a precursor to melatonin (sleep hormone)", organ: "🧠 Neurological", nutrient: "Tryptophan" },
    { fact: "Beta-glucans in mushrooms enhance immune cell activity by 40%", organ: "🛡️ Immune", nutrient: "Beta-glucans" },
    { fact: "Folate in leafy greens reduces homocysteine (cardiovascular risk marker)", organ: "🫀 Cardiovascular", nutrient: "Folate" },
    { fact: "Chromium in whole grains improves insulin receptor sensitivity", organ: "🔬 Endocrine", nutrient: "Chromium" },
    { fact: "CoQ10 in organ meats is essential for mitochondrial ATP production", organ: "⚡ Metabolic", nutrient: "CoQ10" },
  ], []);
  
  // Panel state
  const [showPanel, setShowPanel] = useState(false);
  const [panelTab, setPanelTab] = useState('demographics');
  
  // Diseases from database
  const [allDiseases, setAllDiseases] = useState([]);
  const [diseasesLoading, setDiseasesLoading] = useState(true);
  
  // Food images for multi-image analysis
  const [foodImages, setFoodImages] = useState([]);
  const [isAnalyzingImages, setIsAnalyzingImages] = useState(false);
  
  // Swipe navigation for organ systems
  const handleSwipeNavigation = useCallback((direction) => {
    if (!analysisResult?.organ_system_parameter_effects) return;
    
    const allSystems = Object.keys(analysisResult.organ_system_parameter_effects);
    const isOrganView = allSystems.includes(activeScale);
    
    if (!isOrganView) return;
    
    const currentIndex = allSystems.indexOf(activeScale);
    
    if (direction === 'left' && currentIndex < allSystems.length - 1) {
      setActiveScale(allSystems[currentIndex + 1]);
    } else if (direction === 'right') {
      if (currentIndex > 0) {
        setActiveScale(allSystems[currentIndex - 1]);
      } else {
        // Swipe right from first organ goes back to overview
        setActiveScale('overview');
      }
    }
  }, [analysisResult, activeScale]);
  
  // Set up swipe handlers
  const swipeHandlers = useSwipe(
    () => handleSwipeNavigation('left'),
    () => handleSwipeNavigation('right'),
    50
  );
  
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
  
  // Cycle through facts while analyzing - slower for readability
  useEffect(() => {
    if (isAnalyzing || isAnalyzingImages) {
      const interval = setInterval(() => {
        setCurrentFactIndex(prev => (prev + 1) % foodFacts.length);
      }, 8000); // Change fact every 8 seconds for better readability
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, isAnalyzingImages, foodFacts.length]);
  
  // Cancel analysis function
  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAnalyzing(false);
    setIsAnalyzingImages(false);
    toast.info('Analysis cancelled');
  }, []);
  
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
        toast.error('Image analysis timed out. Please try with fewer or smaller images.');
      } else if (error.message?.includes('502') || error.message?.includes('503') || error.message?.includes('Gateway')) {
        toast.error('AI service temporarily unavailable. Please try again in a moment.');
      } else {
        toast.error(`Analysis failed: ${error.message || 'Unknown error'}. Please try again.`);
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
  
  // Analyze food - DATABASE FIRST, then AI fallback
  const analyzeFood = async (foodName) => {
    setShowResults(false);
    setSearchQuery(foodName);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setActiveScale('overview');
    setCurrentFactIndex(Math.floor(Math.random() * foodFacts.length)); // Start with random fact
    
    // Cancel any existing analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    const healthProfile = profile.conditions.length > 0 || profile.medications.length > 0 || profile.allergies.length > 0 ? {
      age: profile.age,
      sex: profile.sex,
      weight: profile.weight,
      height: profile.height,
      conditions: profile.conditions,
      medications: profile.medications,
      allergies: profile.allergies,
      dietary_restrictions: profile.dietaryPrefs
    } : null;
    
    try {
      // STEP 1: Try database-driven analysis first (fast, no AI)
      const dbResponse = await fetch(`${BACKEND_URL}/api/food/analyze-from-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: foodName,
          serving_size: '1 standard serving',
          health_profile: healthProfile
        }),
        signal: abortControllerRef.current.signal
      });
      
      const dbData = await dbResponse.json();
      
      if (dbData.success && dbData.in_database) {
        // Found in database - instant results!
        setAnalysisResult(dbData.analysis);
        setIsAnalyzing(false);
        // Silently complete - no toast needed for database results
        return;
      }
      
      // STEP 2: Not in database - fall back to AI analysis
      console.log('Food not in database, using AI analysis...');
      toast.info('Analyzing with AI (food not in database)...');
      
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 120000);
      
      const aiResponse = await fetch(`${BACKEND_URL}/api/food/analyze-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: foodName,
          serving_size: '1 standard serving',
          health_profile: healthProfile
        }),
        signal: abortControllerRef.current.signal
      });
      
      clearTimeout(timeoutId);
      
      const aiData = await aiResponse.json();
      if (aiData.success) {
        setAnalysisResult(aiData.analysis);
        toast.success('PhiCor AI analysis complete');
      } else {
        throw new Error(aiData.detail || 'Analysis failed');
      }
    } catch (error) {
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
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  
                  {/* Search Dropdown - only show when no analysis result */}
                  {showResults && searchResults.length > 0 && !analysisResult && !isAnalyzing && (
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
            
            {/* Multi-Scale Analysis Tabs */}
            {analysisResult && (
              <div className={`px-3 sm:px-4 py-2 border-b overflow-x-auto ${isDark ? 'bg-gray-900/20 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex gap-1">
                  {ANALYSIS_SCALES.map(scale => (
                    <button
                      key={scale.id}
                      onClick={() => setActiveScale(scale.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
                        activeScale === scale.id
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
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
                  <div className={`rounded-xl border p-6 sm:p-8 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    {/* Spinner and Title */}
                    <div className="text-center mb-6">
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
                    </div>
                    
                    {/* Did You Know? Fact Card */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentFactIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className={`rounded-lg p-4 mb-4 ${isDark ? 'bg-green-900/20 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{foodFacts[currentFactIndex]?.organ.split(' ')[0]}</div>
                          <div className="flex-1">
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                              💡 Did you know?
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {foodFacts[currentFactIndex]?.fact}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className={`text-[10px] ${isDark ? 'border-green-500/30 text-green-400' : 'border-green-300 text-green-600'}`}>
                                {foodFacts[currentFactIndex]?.organ}
                              </Badge>
                              <Badge variant="outline" className={`text-[10px] ${isDark ? 'border-purple-500/30 text-purple-400' : 'border-purple-300 text-purple-600'}`}>
                                {foodFacts[currentFactIndex]?.nutrient}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    
                    {/* Progress dots */}
                    <div className="flex justify-center gap-1 mb-4">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            (currentFactIndex % 5) === i 
                              ? 'bg-green-500 w-4' 
                              : isDark ? 'bg-gray-700' : 'bg-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    
                    {/* Cancel Button */}
                    <div className="text-center">
                      <p className={`text-[10px] mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        ⏱️ Analysis typically takes 5-30 seconds
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={cancelAnalysis}
                        className={`text-xs ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel Analysis
                      </Button>
                    </div>
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
                          {/* Serving Size - Prominently Displayed */}
                          <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                            <Scale className="w-3 h-3" />
                            <span className="font-medium">
                              {analysisResult.serving_display || 
                               (analysisResult.serving_size && analysisResult.serving_size_g 
                                 ? `${analysisResult.serving_size} (${analysisResult.serving_size_g}g)` 
                                 : analysisResult.serving_size || '100g')}
                            </span>
                          </div>
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
                        
                        {/* System Overview - Clickable cards with visual affordance */}
                        {analysisResult.organ_system_parameter_effects && (
                          <div className={`rounded-xl border p-4 lg:col-span-2 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Organ System Effects
                              </h3>
                              <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                👆 Tap for details
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {Object.entries(analysisResult.organ_system_parameter_effects).map(([system, data]) => {
                                // Get a sample quantified change for preview
                                const sampleChange = data.parameters_affected?.find(p => p.quantified_change !== null && p.quantified_change !== undefined);
                                const paramCount = data.parameters_affected?.length || 0;
                                
                                return (
                                  <button
                                    key={system}
                                    onClick={() => setActiveScale(system)}
                                    className={`p-3 rounded-lg border text-center transition-all group relative ${
                                      data.overall_effect === 'beneficial' ? (isDark ? 'bg-green-900/20 border-green-800/30 hover:bg-green-900/40 hover:border-green-600' : 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-400') :
                                      data.overall_effect === 'caution' || data.overall_effect === 'harmful' ? (isDark ? 'bg-orange-900/20 border-orange-800/30 hover:bg-orange-900/40 hover:border-orange-600' : 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-400') :
                                      (isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-500' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 hover:border-gray-400')
                                    }`}
                                  >
                                    {/* Click indicator */}
                                    <div className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      <ChevronRight className="w-3 h-3" />
                                    </div>
                                    
                                    <span className="text-xl">
                                      {system === 'cardiovascular' ? '❤️' :
                                       system === 'renal' ? '🫘' :
                                       system === 'hepatic' ? '🫀' :
                                       system === 'glycemic' ? '🍬' :
                                       system === 'gastrointestinal' ? '🥗' :
                                       system === 'neurological' ? '🧠' :
                                       system === 'musculoskeletal' ? '💪' :
                                       system === 'immune' ? '🛡️' : 
                                       system === 'metabolic' ? '🔥' :
                                       system === 'endocrine' ? '⚖️' :
                                       system === 'hematologic' ? '🩸' : '🔬'}
                                    </span>
                                    <div className={`text-[10px] font-medium mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                      {system === 'cardiovascular' ? 'Cardio' :
                                       system === 'gastrointestinal' ? 'GI' :
                                       system === 'musculoskeletal' ? 'MSK' :
                                       system === 'neurological' ? 'Neuro' :
                                       system.charAt(0).toUpperCase() + system.slice(1)}
                                    </div>
                                    
                                    {/* Show sample quantified change if available */}
                                    {sampleChange?.quantified_change !== null && sampleChange?.quantified_change !== undefined ? (
                                      <div className={`text-[10px] font-bold mt-1 ${
                                        sampleChange.quantified_change > 0 ? 'text-red-400' : 'text-blue-400'
                                      }`}>
                                        {sampleChange.quantified_change > 0 ? '+' : ''}{sampleChange.quantified_change} {sampleChange.change_unit}
                                      </div>
                                    ) : (
                                      <Badge className={`mt-1 text-[8px] ${
                                        data.overall_effect === 'beneficial' ? 'bg-green-500/30 text-green-400' :
                                        data.overall_effect === 'caution' ? 'bg-orange-500/30 text-orange-400' :
                                        'bg-gray-500/30 text-gray-400'
                                      }`}>
                                        {data.overall_effect}
                                      </Badge>
                                    )}
                                    
                                    {/* Parameter count hint */}
                                    <div className={`text-[9px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                      {paramCount} effect{paramCount !== 1 ? 's' : ''}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Individual Food Items Scale - NEW */}
                    {activeScale === 'items' && (
                      <div className="space-y-4">
                        {analysisResult.individual_food_items?.length > 0 ? (
                          <>
                            {/* Actionable Insights Summary */}
                            {analysisResult.actionable_insights && (
                              <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                                <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  <span>💡</span> Quick Actions
                                </h3>
                                <div className="grid gap-3">
                                  {analysisResult.actionable_insights.keep_eating?.length > 0 && (
                                    <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20 border border-green-800/30' : 'bg-green-50 border border-green-200'}`}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className={`text-xs font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>Keep Eating</span>
                                      </div>
                                      <ul className="space-y-1">
                                        {analysisResult.actionable_insights.keep_eating.map((item, i) => (
                                          <li key={i} className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>• {item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {analysisResult.actionable_insights.reduce_or_eliminate?.length > 0 && (
                                    <div className={`p-3 rounded-lg ${isDark ? 'bg-orange-900/20 border border-orange-800/30' : 'bg-orange-50 border border-orange-200'}`}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                                        <span className={`text-xs font-semibold ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>Reduce or Eliminate</span>
                                      </div>
                                      <ul className="space-y-1">
                                        {analysisResult.actionable_insights.reduce_or_eliminate.map((item, i) => (
                                          <li key={i} className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>• {item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {analysisResult.actionable_insights.add_next_time?.length > 0 && (
                                    <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'}`}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Plus className="w-4 h-4 text-blue-500" />
                                        <span className={`text-xs font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Add Next Time</span>
                                      </div>
                                      <ul className="space-y-1">
                                        {analysisResult.actionable_insights.add_next_time.map((item, i) => (
                                          <li key={i} className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>• {item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Individual Food Items List */}
                            <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                              <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <span>🍽️</span> Individual Food Items ({analysisResult.individual_food_items.length})
                              </h3>
                              <div className="space-y-3">
                                {analysisResult.individual_food_items.map((item, idx) => (
                                  <FoodItemCard key={idx} item={item} isDark={isDark} />
                                ))}
                              </div>
                            </div>
                            
                            {/* Combined Meal Effect */}
                            {analysisResult.combined_meal_analysis && (
                              <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                                <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  <span>🍱</span> Combined Meal Effect
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                                  <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analysisResult.combined_meal_analysis.total_calories}</div>
                                    <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Total kcal</div>
                                  </div>
                                  <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <div className={`text-lg font-bold text-red-400`}>{analysisResult.combined_meal_analysis.total_macros?.protein_g}g</div>
                                    <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Protein</div>
                                  </div>
                                  <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <div className={`text-lg font-bold text-yellow-400`}>{analysisResult.combined_meal_analysis.total_macros?.carbs_g}g</div>
                                    <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Carbs</div>
                                  </div>
                                  <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <div className={`text-lg font-bold text-blue-400`}>{analysisResult.combined_meal_analysis.total_macros?.fat_g}g</div>
                                    <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Fat</div>
                                  </div>
                                </div>
                                
                                {/* Organ System Scores */}
                                {analysisResult.combined_meal_analysis.overall_effect && (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {Object.entries(analysisResult.combined_meal_analysis.overall_effect).map(([system, data]) => (
                                      <div key={system} className={`p-2 rounded-lg text-center ${
                                        data.effect === 'beneficial' ? (isDark ? 'bg-green-900/20' : 'bg-green-50') :
                                        data.effect === 'caution' ? (isDark ? 'bg-orange-900/20' : 'bg-orange-50') :
                                        (isDark ? 'bg-gray-800' : 'bg-gray-100')
                                      }`}>
                                        <div className={`text-sm font-bold ${
                                          data.effect === 'beneficial' ? 'text-green-500' :
                                          data.effect === 'caution' ? 'text-orange-500' : 'text-gray-400'
                                        }`}>{data.score || '—'}</div>
                                        <div className={`text-[9px] capitalize ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{system.slice(0, 6)}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Synergies & Conflicts */}
                                {(analysisResult.combined_meal_analysis.synergies?.length > 0 || analysisResult.combined_meal_analysis.conflicts?.length > 0) && (
                                  <div className="mt-3 space-y-2">
                                    {analysisResult.combined_meal_analysis.synergies?.map((s, i) => (
                                      <div key={i} className={`text-xs flex items-start gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                        <span>✓</span> {s}
                                      </div>
                                    ))}
                                    {analysisResult.combined_meal_analysis.conflicts?.map((c, i) => (
                                      <div key={i} className={`text-xs flex items-start gap-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                                        <span>⚠</span> {c}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className={`rounded-xl border p-8 text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                            <div className="text-4xl mb-3">📷</div>
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              No Individual Items Data
                            </h3>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              Upload food photos to get individual item breakdown with per-food analysis
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Nutrients Scale - Detailed breakdown */}
                    {activeScale === 'nutrients' && (
                      <div className="space-y-4">
                        {/* Macronutrients */}
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                          <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <span>🍽️</span> Macronutrients
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { name: 'Energy', value: analysisResult.complete_nutritional_profile?.macronutrients?.energy_kcal, unit: 'kcal', icon: '⚡' },
                              { name: 'Protein', value: analysisResult.complete_nutritional_profile?.macronutrients?.protein_g, unit: 'g', icon: '💪' },
                              { name: 'Carbs', value: analysisResult.complete_nutritional_profile?.macronutrients?.carbohydrates_g, unit: 'g', icon: '🌾' },
                              { name: 'Fat', value: analysisResult.complete_nutritional_profile?.macronutrients?.fat_total_g, unit: 'g', icon: '🥑' },
                              { name: 'Fiber', value: analysisResult.complete_nutritional_profile?.macronutrients?.fiber_g, unit: 'g', icon: '🥬' },
                              { name: 'Sugars', value: analysisResult.complete_nutritional_profile?.macronutrients?.sugars_g, unit: 'g', icon: '🍬' },
                              { name: 'Sat Fat', value: analysisResult.complete_nutritional_profile?.macronutrients?.fat_saturated_g, unit: 'g', icon: '🧈' },
                              { name: 'Cholesterol', value: analysisResult.complete_nutritional_profile?.macronutrients?.cholesterol_mg, unit: 'mg', icon: '❤️' },
                            ].map((n, i) => (
                              <div key={i} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-sm">{n.icon}</span>
                                  <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{n.name}</span>
                                </div>
                                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {n.value ?? '—'} {n.value && n.unit}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Electrolytes */}
                        {analysisResult.complete_nutritional_profile?.electrolytes && (
                          <div className={`rounded-xl border p-4 ${isDark ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-200'}`}>
                            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                              <span>⚡</span> Electrolytes
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {Object.entries(analysisResult.complete_nutritional_profile.electrolytes).map(([key, data]) => (
                                <div key={key} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                  <div className={`text-[10px] capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {key.replace(/_/g, ' ')}
                                  </div>
                                  <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {typeof data === 'object' ? data.value : data} mg
                                  </div>
                                  {typeof data === 'object' && data.percent_daily && (
                                    <div className="text-[9px] text-blue-500">{data.percent_daily}% DV</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Vitamins */}
                        {analysisResult.complete_nutritional_profile?.vitamins && (
                          <div className={`rounded-xl border p-4 ${isDark ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200'}`}>
                            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                              <span>💊</span> Vitamins
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {Object.entries(analysisResult.complete_nutritional_profile.vitamins).map(([key, data]) => (
                                <div key={key} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                  <div className={`text-[9px] uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {key.replace(/_/g, ' ').replace('vitamin ', 'Vit ')}
                                  </div>
                                  <div className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {typeof data === 'object' ? data.value : data}
                                  </div>
                                  {typeof data === 'object' && data.percent_daily && (
                                    <div className="text-[9px] text-yellow-500">{data.percent_daily}%</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Trace Elements */}
                        {analysisResult.complete_nutritional_profile?.trace_elements && (
                          <div className={`rounded-xl border p-4 ${isDark ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-200'}`}>
                            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                              <span>🔬</span> Trace Elements
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {Object.entries(analysisResult.complete_nutritional_profile.trace_elements).map(([key, data]) => (
                                <div key={key} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                  <div className={`text-[9px] capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {key.replace(/_/g, ' ')}
                                  </div>
                                  <div className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {typeof data === 'object' ? data.value : data}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Molecular Scale - Bioactive compounds */}
                    {activeScale === 'molecular' && (
                      <div className="space-y-4">
                        {/* For image analysis - show food composition breakdown */}
                        {analysisResult.individual_food_items?.length > 0 && (
                          <div className={`rounded-xl border p-4 ${isDark ? 'bg-indigo-900/20 border-indigo-800/30' : 'bg-indigo-50 border-indigo-200'}`}>
                            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
                              <span>🧬</span> Molecular Composition of Meal
                            </h3>
                            <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Key molecular components identified in this meal
                            </p>
                            <div className="grid gap-2">
                              {analysisResult.individual_food_items.map((item, idx) => (
                                <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{getFoodIcon(item.name)}</span>
                                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                                  </div>
                                  {/* Key nutrients/molecules */}
                                  <div className="flex flex-wrap gap-1">
                                    {item.key_nutrients?.slice(0, 5).map((n, i) => (
                                      <Badge key={i} variant="outline" className="text-[9px]">{n}</Badge>
                                    ))}
                                    {!item.key_nutrients && item.macros && (
                                      <>
                                        <Badge variant="outline" className="text-[9px]">Protein: {item.macros.protein}g</Badge>
                                        <Badge variant="outline" className="text-[9px]">Carbs: {item.macros.carbs}g</Badge>
                                        <Badge variant="outline" className="text-[9px]">Fat: {item.macros.fat}g</Badge>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Bioactive Compounds from ingredients */}
                        {analysisResult.ingredients_breakdown?.primary_ingredients?.some(i => i.bioactive_compounds?.length > 0) && (
                          <div className={`rounded-xl border p-4 ${isDark ? 'bg-cyan-900/20 border-cyan-800/30' : 'bg-cyan-50 border-cyan-200'}`}>
                            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                              <span>⚗️</span> Bioactive Compounds
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.ingredients_breakdown.primary_ingredients.flatMap(i => i.bioactive_compounds || []).map((c, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Other Compounds */}
                        {analysisResult.complete_nutritional_profile?.other_compounds && (
                          <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              <span>🧪</span> Other Compounds
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {Object.entries(analysisResult.complete_nutritional_profile.other_compounds).filter(([k, v]) => v && v > 0).map(([key, value]) => (
                                <div key={key} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                  <div className={`text-[10px] capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {key.replace(/_/g, ' ')}
                                  </div>
                                  <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {value} mg
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Additives */}
                        {analysisResult.ingredients_breakdown?.additives_and_preservatives?.length > 0 && (
                          <div className={`rounded-xl border p-4 ${isDark ? 'bg-orange-900/20 border-orange-800/30' : 'bg-orange-50 border-orange-200'}`}>
                            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                              <span>⚠️</span> Additives & Preservatives
                            </h3>
                            <div className="space-y-2">
                              {analysisResult.ingredients_breakdown.additives_and_preservatives.map((a, i) => (
                                <div key={i} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{a.name}</span>
                                    {a.e_number && <Badge variant="outline" className="text-[9px]">{a.e_number}</Badge>}
                                  </div>
                                  <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{a.function}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Fallback: if no molecular data available */}
                        {!analysisResult.individual_food_items?.length && 
                         !analysisResult.ingredients_breakdown?.primary_ingredients?.length && 
                         !analysisResult.complete_nutritional_profile?.other_compounds && (
                          <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Molecular composition data not available for this analysis. Try searching for a specific food or uploading a meal image.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Cellular Scale */}
                    {activeScale === 'cellular' && (
                      <div className="space-y-4">
                        {/* For image analysis with identified food items - show per-item cellular effects */}
                        {analysisResult.individual_food_items?.length > 0 && (
                          <div className={`rounded-xl border p-4 ${isDark ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-200'}`}>
                            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                              <span>🍽️</span> Food Items in This Meal ({analysisResult.individual_food_items.length})
                            </h3>
                            <div className="grid gap-2">
                              {analysisResult.individual_food_items.map((item, idx) => (
                                <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">{getFoodIcon(item.name)}</span>
                                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                                    {item.estimated_weight && (
                                      <Badge variant="outline" className="ml-auto text-[10px]">{item.estimated_weight}</Badge>
                                    )}
                                  </div>
                                  <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {item.calories && `${item.calories} kcal`}
                                    {item.macros && ` • P: ${item.macros.protein || '?'}g • C: ${item.macros.carbs || '?'}g • F: ${item.macros.fat || '?'}g`}
                                  </div>
                                  {/* Show per-item cellular effects */}
                                  {item.health_effects && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {item.health_effects.benefits?.slice(0, 2).map((b, i) => (
                                        <Badge key={`b-${i}`} className="text-[8px] bg-green-500/20 text-green-400">{b}</Badge>
                                      ))}
                                      {item.health_effects.concerns?.slice(0, 2).map((c, i) => (
                                        <Badge key={`c-${i}`} className="text-[8px] bg-orange-500/20 text-orange-400">{c}</Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Combined Cellular Effects across organ systems */}
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200'}`}>
                          <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                            <span>🔬</span> {analysisResult.individual_food_items?.length > 0 ? 'Combined Cellular Effects' : 'Cellular Effects'}
                          </h3>
                          <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {analysisResult.individual_food_items?.length > 0 
                              ? 'How this meal affects cellular processes across organ systems'
                              : 'How nutrients affect cellular processes'}
                          </p>
                          <div className="grid gap-2">
                            {ORGAN_SYSTEMS.map(sys => {
                              const sysData = analysisResult.organ_system_parameter_effects?.[sys.id];
                              if (!sysData) return null;
                              return (
                                <div key={sys.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span>{sys.icon}</span>
                                    <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{sys.name}</span>
                                    <Badge className={`ml-auto text-[8px] ${
                                      sysData.overall_effect === 'beneficial' ? 'bg-green-500/30 text-green-400' :
                                      sysData.overall_effect === 'caution' ? 'bg-orange-500/30 text-orange-400' :
                                      'bg-gray-500/30 text-gray-400'
                                    }`}>
                                      {sysData.overall_effect}
                                    </Badge>
                                  </div>
                                  {sysData.parameters_affected?.slice(0, 2).map((p, i) => (
                                    <div key={i} className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      • {p.parameter}: {p.quantified_change || p.direction || ''} {p.mechanism && `(${p.mechanism})`}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Physiology Scale - Organ System Detail */}
                    {activeScale === 'physiology' && (
                      <div className="space-y-4">
                        {ORGAN_SYSTEMS.map(sys => {
                          const sysData = analysisResult.organ_system_parameter_effects?.[sys.id];
                          if (!sysData?.parameters_affected?.length) return null;
                          return (
                            <div key={sys.id} className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                              <div className="flex items-center gap-2 mb-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${sys.color} flex items-center justify-center`}>
                                  <span className="text-lg">{sys.icon}</span>
                                </div>
                                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {sys.name} System
                                </h3>
                                <Badge className={`ml-auto ${
                                  sysData.overall_effect === 'beneficial' ? 'bg-green-500/20 text-green-400' :
                                  sysData.overall_effect === 'caution' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {sysData.overall_effect}
                                </Badge>
                              </div>
                              <div className="grid gap-2">
                                {sysData.parameters_affected.map((param, i) => (
                                  <ParameterCard key={i} param={param} isDark={isDark} />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Individual Organ System View - when clicked from overview */}
                    {analysisResult.organ_system_parameter_effects?.[activeScale] && !['overview', 'nutrients', 'molecular', 'cellular', 'physiology', 'clinical'].includes(activeScale) && (
                      <div 
                        className="space-y-4"
                        {...swipeHandlers}
                      >
                        {(() => {
                          const sysData = analysisResult.organ_system_parameter_effects[activeScale];
                          const sysInfo = ORGAN_SYSTEMS.find(s => s.id === activeScale) || { name: activeScale, icon: '🔬', color: 'from-gray-500 to-gray-600' };
                          
                          // Get list of all organ systems for navigation
                          const allSystems = Object.keys(analysisResult.organ_system_parameter_effects);
                          const currentIndex = allSystems.indexOf(activeScale);
                          const prevSystem = currentIndex > 0 ? allSystems[currentIndex - 1] : null;
                          const nextSystem = currentIndex < allSystems.length - 1 ? allSystems[currentIndex + 1] : null;
                          
                          return (
                            <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                              {/* Prominent Back Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveScale('overview')}
                                className={`mb-4 ${isDark ? 'border-gray-700 hover:bg-gray-800' : ''}`}
                              >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Overview
                              </Button>
                              
                              <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sysInfo.color} flex items-center justify-center`}>
                                  <span className="text-2xl">{sysInfo.icon}</span>
                                </div>
                                <div className="flex-1">
                                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {sysInfo.name} System Effects
                                  </h3>
                                  <Badge className={`mt-1 ${
                                    sysData.overall_effect === 'beneficial' ? 'bg-green-500/20 text-green-400' :
                                    sysData.overall_effect === 'caution' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {sysData.overall_effect}
                                  </Badge>
                                </div>
                              </div>
                              
                              {/* Swipe Navigation Hint + Buttons */}
                              <div className={`flex items-center justify-between mb-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'} rounded-lg p-2`}>
                                {prevSystem ? (
                                  <button 
                                    onClick={() => setActiveScale(prevSystem)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">{prevSystem.charAt(0).toUpperCase() + prevSystem.slice(1)}</span>
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => setActiveScale('overview')}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Overview</span>
                                  </button>
                                )}
                                <div className="flex flex-col items-center">
                                  <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                                    {currentIndex + 1} of {allSystems.length}
                                  </span>
                                  <span className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    👆 Swipe to navigate
                                  </span>
                                </div>
                                {nextSystem ? (
                                  <button 
                                    onClick={() => setActiveScale(nextSystem)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                                  >
                                    <span className="hidden sm:inline">{nextSystem.charAt(0).toUpperCase() + nextSystem.slice(1)}</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                ) : <span className="w-16" />}
                              </div>
                              
                              {sysData.contributing_nutrients?.length > 0 && (
                                <div className="mb-4">
                                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Contributing Nutrients
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {sysData.contributing_nutrients.map((n, i) => (
                                      <Badge key={i} variant="outline" className="text-[9px]">{n}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="grid gap-2">
                                {sysData.parameters_affected?.map((param, i) => (
                                  <ParameterCard key={i} param={param} isDark={isDark} />
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    
                    {/* Clinical Scale - Lab parameters */}
                    {activeScale === 'clinical' && (
                      <div className="space-y-4">
                        <div className={`rounded-xl border p-4 ${isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200'}`}>
                          <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                            <span>🩺</span> Clinical Parameters Affected
                          </h3>
                          <div className="grid gap-2">
                            {Object.entries(analysisResult.organ_system_parameter_effects || {}).flatMap(([sys, data]) => 
                              (data.parameters_affected || []).filter(p => 
                                ['GFR', 'creatinine', 'ALT', 'AST', 'cholesterol', 'glucose', 'hemoglobin', 'potassium', 'sodium'].some(k => 
                                  p.parameter?.toLowerCase().includes(k.toLowerCase())
                                )
                              ).map((p, i) => (
                                <div key={`${sys}-${i}`} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                      {p.parameter?.replace(/_/g, ' ')}
                                    </span>
                                    <Badge className={`text-[9px] ${
                                      p.direction === 'increase' ? 'bg-red-500/20 text-red-400' :
                                      p.direction === 'decrease' ? 'bg-blue-500/20 text-blue-400' :
                                      'bg-gray-500/20 text-gray-400'
                                    }`}>
                                      {p.direction === 'increase' ? '↑' : p.direction === 'decrease' ? '↓' : '—'} {p.magnitude || ''}
                                    </Badge>
                                  </div>
                                  <div className={`text-[10px] mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {p.mechanism}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        
                        {/* Drug Interactions */}
                        {analysisResult.personalized_risk_assessment?.medication_interactions?.length > 0 && (
                          <div className={`rounded-xl border p-4 ${isDark ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-200'}`}>
                            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                              <span>💊</span> Drug Interactions
                            </h3>
                            <div className="space-y-2">
                              {analysisResult.personalized_risk_assessment.medication_interactions.map((int, i) => (
                                <div key={i} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{int.medication}</span>
                                    <Badge className={`text-[9px] ${
                                      int.severity === 'major' ? 'bg-red-500/20 text-red-400' :
                                      int.severity === 'moderate' ? 'bg-orange-500/20 text-orange-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                      {int.severity}
                                    </Badge>
                                  </div>
                                  <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {int.interacting_component}: {int.interaction_type}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
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
                      
                      {/* Hidden file input for mobile - using label for better compatibility */}
                      <input
                        type="file"
                        ref={mobileFileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="mobile-food-upload"
                      />
                      
                      <label
                        htmlFor="mobile-food-upload"
                        className={`w-full h-16 border-dashed border-2 rounded-md flex flex-col gap-1 items-center justify-center cursor-pointer transition-colors ${
                          isDark 
                            ? 'border-gray-700 hover:bg-gray-800 hover:border-gray-600' 
                            : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        } ${foodImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Camera className="w-5 h-5 text-purple-500" />
                        <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Upload Photos ({foodImages.length}/10)
                        </span>
                      </label>
                      
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
