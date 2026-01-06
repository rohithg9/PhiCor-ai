import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  X, TrendingUp, TrendingDown, Minus, Activity, Search,
  AlertTriangle, Info, ChevronRight, Loader2, Target,
  Heart, Brain, FlaskConical, Beaker, Shield, Dna
} from 'lucide-react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Category icons
const CATEGORY_ICONS = {
  cardiovascular: Heart,
  neurological: Brain,
  respiratory: Activity,
  renal: FlaskConical,
  endocrine: Beaker,
  gastrointestinal: FlaskConical,
  hematological: Activity,
  infectious: Shield,
  oncology: Dna,
  default: Target
};

const ParameterDrillDownModal = ({ 
  isOpen, 
  onClose, 
  parameterName, 
  parameterType,
  expectedValue,
  currentDirection 
}) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (isOpen && parameterName) {
      fetchParameterCauses();
    }
  }, [isOpen, parameterName]);

  const fetchParameterCauses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/diseases-db/parameter-causes/${encodeURIComponent(parameterName)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch parameter causes');
      }
      
      const result = await response.json();
      setData(result);
      
      // Auto-select tab based on current direction
      if (currentDirection === 'increase' && result.causes_of_increase?.length > 0) {
        setActiveTab('increase');
      } else if (currentDirection === 'decrease' && result.causes_of_decrease?.length > 0) {
        setActiveTab('decrease');
      }
    } catch (err) {
      console.error('Error fetching parameter causes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayName = parameterName?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const renderDiseaseList = (diseases, direction) => {
    if (!diseases || diseases.length === 0) {
      return (
        <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <Info className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No diseases found that cause {direction} in this parameter</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {diseases.map((disease, idx) => {
          const CategoryIcon = CATEGORY_ICONS[disease.category] || CATEGORY_ICONS.default;
          
          return (
            <div 
              key={`${disease.disease_id}-${idx}`}
              className={`p-3 rounded-lg border transition-all hover:scale-[1.01] cursor-pointer ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  direction === 'increase' 
                    ? isDark ? 'bg-red-900/30' : 'bg-red-50'
                    : direction === 'decrease'
                      ? isDark ? 'bg-blue-900/30' : 'bg-blue-50'
                      : isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <CategoryIcon className={`w-4 h-4 ${
                    direction === 'increase'
                      ? isDark ? 'text-red-400' : 'text-red-600'
                      : direction === 'decrease'
                        ? isDark ? 'text-blue-400' : 'text-blue-600'
                        : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {disease.disease_name}
                    </h4>
                    {disease.icd10_code && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {disease.icd10_code}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {disease.category}
                    </Badge>
                    
                    {disease.organ_system && (
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${
                          isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {disease.organ_system}
                      </Badge>
                    )}
                    
                    {disease.magnitude && (
                      <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {typeof disease.magnitude === 'number' 
                          ? `${disease.magnitude > 0 ? '+' : ''}${disease.magnitude}%` 
                          : disease.magnitude}
                      </span>
                    )}
                  </div>
                  
                  {disease.evidence && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {disease.evidence}
                    </p>
                  )}
                </div>
                
                <ChevronRight className={`w-4 h-4 shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                currentDirection === 'increase'
                  ? isDark ? 'bg-red-900/30' : 'bg-red-100'
                  : currentDirection === 'decrease'
                    ? isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                    : isDark ? 'bg-purple-900/30' : 'bg-purple-100'
              }`}>
                {currentDirection === 'increase' ? (
                  <TrendingUp className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                ) : currentDirection === 'decrease' ? (
                  <TrendingDown className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                ) : (
                  <Activity className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                )}
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {displayName}
                </h2>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Parameter Drill-Down • {parameterType === 'symptom' ? 'Symptom' : 'Lab/Vital'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tabs */}
          {data && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'all'
                    ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                    : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All ({data.total_matches})
              </button>
              <button
                onClick={() => setActiveTab('increase')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  activeTab === 'increase'
                    ? 'bg-red-500/20 text-red-400'
                    : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                Causes of ↑ ({data.summary?.increase_count || 0})
              </button>
              <button
                onClick={() => setActiveTab('decrease')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  activeTab === 'decrease'
                    ? 'bg-blue-500/20 text-blue-400'
                    : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingDown className="w-3 h-3" />
                Causes of ↓ ({data.summary?.decrease_count || 0})
              </button>
            </div>
          )}
        </div>
        
        {/* Content */}
        <ScrollArea className="h-[calc(85vh-140px)]">
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className={`w-8 h-8 animate-spin mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Searching knowledge base...
                </p>
              </div>
            ) : error ? (
              <div className={`text-center py-12 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-70" />
                <p className="font-medium mb-1">Error loading data</p>
                <p className="text-sm opacity-70">{error}</p>
              </div>
            ) : data ? (
              <div className="space-y-4">
                {/* Info Banner */}
                <div className={`p-3 rounded-lg border ${
                  isDark ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-xs">
                      Found <strong>{data.total_matches}</strong> diseases in the PhiCor knowledge base that can affect <strong>{displayName}</strong>.
                      {data.summary?.increase_count > 0 && ` ${data.summary.increase_count} diseases can cause elevation.`}
                      {data.summary?.decrease_count > 0 && ` ${data.summary.decrease_count} diseases can cause reduction.`}
                    </p>
                  </div>
                </div>
                
                {/* Disease Lists */}
                {activeTab === 'all' ? (
                  <div className="space-y-6">
                    {data.causes_of_increase?.length > 0 && (
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                          isDark ? 'text-red-400' : 'text-red-700'
                        }`}>
                          <TrendingUp className="w-4 h-4" />
                          Causes of Elevated {displayName} ({data.causes_of_increase.length})
                        </h3>
                        {renderDiseaseList(data.causes_of_increase, 'increase')}
                      </div>
                    )}
                    
                    {data.causes_of_decrease?.length > 0 && (
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                          isDark ? 'text-blue-400' : 'text-blue-700'
                        }`}>
                          <TrendingDown className="w-4 h-4" />
                          Causes of Decreased {displayName} ({data.causes_of_decrease.length})
                        </h3>
                        {renderDiseaseList(data.causes_of_decrease, 'decrease')}
                      </div>
                    )}
                    
                    {data.other_associations?.length > 0 && (
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                          isDark ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                          <Minus className="w-4 h-4" />
                          Other Associations ({data.other_associations.length})
                        </h3>
                        {renderDiseaseList(data.other_associations, 'other')}
                      </div>
                    )}
                  </div>
                ) : activeTab === 'increase' ? (
                  renderDiseaseList(data.causes_of_increase, 'increase')
                ) : (
                  renderDiseaseList(data.causes_of_decrease, 'decrease')
                )}
              </div>
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ParameterDrillDownModal;
