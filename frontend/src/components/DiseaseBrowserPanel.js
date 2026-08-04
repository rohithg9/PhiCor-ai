import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, ChevronDown, ChevronUp, Loader2,
  Heart, Brain, Activity, Stethoscope, Pill, Dna,
  FlaskConical, Thermometer, Shield, Zap, Wind, Droplet
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

/**
 * Disease Browser Panel Component
 * 
 * A sidebar panel for browsing and selecting diseases from the database.
 * Features categorized disease listing, search, and quick selection.
 */

// Category icons and colors
const CATEGORY_CONFIG = {
  cardiovascular: { 
    icon: Heart, 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10',
    label: 'Cardiovascular'
  },
  cardiac: { 
    icon: Heart, 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10',
    label: 'Cardiac'
  },
  vascular: { 
    icon: Heart, 
    color: 'text-red-400', 
    bgColor: 'bg-red-400/10',
    label: 'Vascular'
  },
  arrhythmia: { 
    icon: Activity, 
    color: 'text-red-600', 
    bgColor: 'bg-red-600/10',
    label: 'Arrhythmia'
  },
  valvular: { 
    icon: Heart, 
    color: 'text-rose-500', 
    bgColor: 'bg-rose-500/10',
    label: 'Valvular Heart'
  },
  cardiomyopathy: { 
    icon: Heart, 
    color: 'text-rose-600', 
    bgColor: 'bg-rose-600/10',
    label: 'Cardiomyopathy'
  },
  heartfailure: { 
    icon: Heart, 
    color: 'text-red-700', 
    bgColor: 'bg-red-700/10',
    label: 'Heart Failure'
  },
  ischemic: { 
    icon: Heart, 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10',
    label: 'Ischemic'
  },
  pericardial: { 
    icon: Heart, 
    color: 'text-red-400', 
    bgColor: 'bg-red-400/10',
    label: 'Pericardial'
  },
  hypertensive: { 
    icon: Activity, 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10',
    label: 'Hypertensive'
  },
  cerebrovascular: { 
    icon: Brain, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-600/10',
    label: 'Cerebrovascular'
  },
  neurological: { 
    icon: Brain, 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-500/10',
    label: 'Neurological'
  },
  psychiatric: { 
    icon: Brain, 
    color: 'text-violet-500', 
    bgColor: 'bg-violet-500/10',
    label: 'Psychiatric'
  },
  respiratory: { 
    icon: Wind, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10',
    label: 'Respiratory'
  },
  metabolic: { 
    icon: Activity, 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-500/10',
    label: 'Metabolic'
  },
  endocrine: { 
    icon: Zap, 
    color: 'text-yellow-500', 
    bgColor: 'bg-yellow-500/10',
    label: 'Endocrine'
  },
  gastrointestinal: { 
    icon: Activity, 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10',
    label: 'Gastrointestinal'
  },
  hepatic: { 
    icon: Activity, 
    color: 'text-green-600', 
    bgColor: 'bg-green-600/10',
    label: 'Hepatic'
  },
  renal: { 
    icon: Droplet, 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/10',
    label: 'Renal'
  },
  urology: { 
    icon: Droplet, 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-400/10',
    label: 'Urology'
  },
  hematological: { 
    icon: FlaskConical, 
    color: 'text-rose-500', 
    bgColor: 'bg-rose-500/10',
    label: 'Hematological'
  },
  hematological_malignancy: { 
    icon: FlaskConical, 
    color: 'text-rose-600', 
    bgColor: 'bg-rose-600/10',
    label: 'Hematological Malignancy'
  },
  infectious: { 
    icon: Shield, 
    color: 'text-emerald-500', 
    bgColor: 'bg-emerald-500/10',
    label: 'Infectious'
  },
  autoimmune: { 
    icon: Dna, 
    color: 'text-indigo-500', 
    bgColor: 'bg-indigo-500/10',
    label: 'Autoimmune'
  },
  rheumatological: { 
    icon: Activity, 
    color: 'text-indigo-400', 
    bgColor: 'bg-indigo-400/10',
    label: 'Rheumatological'
  },
  rheumatic: { 
    icon: Activity, 
    color: 'text-indigo-400', 
    bgColor: 'bg-indigo-400/10',
    label: 'Rheumatic'
  },
  oncological: { 
    icon: Thermometer, 
    color: 'text-pink-500', 
    bgColor: 'bg-pink-500/10',
    label: 'Oncological'
  },
  oncology: { 
    icon: Thermometer, 
    color: 'text-pink-500', 
    bgColor: 'bg-pink-500/10',
    label: 'Oncology'
  },
  musculoskeletal: { 
    icon: Activity, 
    color: 'text-cyan-500', 
    bgColor: 'bg-cyan-500/10',
    label: 'Musculoskeletal'
  },
  dermatological: { 
    icon: Shield, 
    color: 'text-teal-500', 
    bgColor: 'bg-teal-500/10',
    label: 'Dermatological'
  },
  dermatology: { 
    icon: Shield, 
    color: 'text-teal-500', 
    bgColor: 'bg-teal-500/10',
    label: 'Dermatology'
  },
  pediatric: { 
    icon: Heart, 
    color: 'text-sky-500', 
    bgColor: 'bg-sky-500/10',
    label: 'Pediatric'
  },
  neonatology: { 
    icon: Heart, 
    color: 'text-sky-400', 
    bgColor: 'bg-sky-400/10',
    label: 'Neonatology'
  },
  geriatric: { 
    icon: Stethoscope, 
    color: 'text-slate-500', 
    bgColor: 'bg-slate-500/10',
    label: 'Geriatric'
  },
  obstetric_gynecologic: { 
    icon: Heart, 
    color: 'text-fuchsia-500', 
    bgColor: 'bg-fuchsia-500/10',
    label: 'OB/GYN'
  },
  obstetrics: { 
    icon: Heart, 
    color: 'text-fuchsia-500', 
    bgColor: 'bg-fuchsia-500/10',
    label: 'Obstetrics'
  },
  gynecology: { 
    icon: Heart, 
    color: 'text-fuchsia-400', 
    bgColor: 'bg-fuchsia-400/10',
    label: 'Gynecology'
  },
  obgyn: { 
    icon: Heart, 
    color: 'text-fuchsia-500', 
    bgColor: 'bg-fuchsia-500/10',
    label: 'OB/GYN'
  },
  genetic: { 
    icon: Dna, 
    color: 'text-lime-500', 
    bgColor: 'bg-lime-500/10',
    label: 'Genetic'
  },
  congenital: { 
    icon: Dna, 
    color: 'text-lime-400', 
    bgColor: 'bg-lime-400/10',
    label: 'Congenital'
  },
  emergency: { 
    icon: Zap, 
    color: 'text-red-600', 
    bgColor: 'bg-red-600/10',
    label: 'Emergency'
  },
  acute: { 
    icon: Zap, 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10',
    label: 'Acute'
  },
  ophthalmology: { 
    icon: Activity, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-400/10',
    label: 'Ophthalmology'
  },
  otolaryngology: { 
    icon: Activity, 
    color: 'text-blue-300', 
    bgColor: 'bg-blue-300/10',
    label: 'ENT'
  },
  ent: { 
    icon: Activity, 
    color: 'text-blue-300', 
    bgColor: 'bg-blue-300/10',
    label: 'ENT'
  },
  general: { 
    icon: Stethoscope, 
    color: 'text-gray-500', 
    bgColor: 'bg-gray-500/10',
    label: 'General'
  },
  other: { 
    icon: Stethoscope, 
    color: 'text-gray-500', 
    bgColor: 'bg-gray-500/10',
    label: 'Other'
  },
};

const DiseaseBrowserPanel = ({ 
  isOpen, 
  onClose, 
  onSelectDisease,
  selectedDiseaseId = null,
  className = ''
}) => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [error, setError] = useState(null);

  // Fetch diseases from API
  const fetchDiseases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/diseases-db/list`);
      if (response.ok) {
        const data = await response.json();
        setDiseases(data.diseases || []);
      } else {
        setError('Failed to load diseases');
      }
    } catch (err) {
      console.error('Error fetching diseases:', err);
      setError('Network error loading diseases');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch diseases when panel opens
  useEffect(() => {
    if (isOpen && diseases.length === 0 && !loading) {
      fetchDiseases();
    }
  }, [isOpen, diseases.length, loading, fetchDiseases]);

  // Group diseases by category
  const groupedDiseases = useMemo(() => {
    const groups = {};
    
    diseases.forEach(disease => {
      const rawCategory = disease.category?.toLowerCase() || 'other';
      
      // Normalize unknown categories to 'other' to avoid duplicate "Other" groups
      const categoryKey = CATEGORY_CONFIG[rawCategory] ? rawCategory : 'other';
      
      if (!groups[categoryKey]) {
        groups[categoryKey] = {
          config: CATEGORY_CONFIG[categoryKey],
          originalCategory: rawCategory, // Keep original for display if needed
          diseases: []
        };
      }
      groups[categoryKey].diseases.push(disease);
    });
    
    // Sort diseases within each category by name
    Object.values(groups).forEach(group => {
      group.diseases.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });
    
    return groups;
  }, [diseases]);

  // Filter diseases based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedDiseases;
    
    const query = searchQuery.toLowerCase();
    const filtered = {};
    
    Object.entries(groupedDiseases).forEach(([category, group]) => {
      const matchingDiseases = group.diseases.filter(disease => 
        disease.name?.toLowerCase().includes(query) ||
        disease.icd10_code?.toLowerCase().includes(query) ||
        disease.description?.toLowerCase().includes(query)
      );
      
      if (matchingDiseases.length > 0) {
        filtered[category] = {
          ...group,
          diseases: matchingDiseases
        };
      }
    });
    
    return filtered;
  }, [groupedDiseases, searchQuery]);

  // Calculate total filtered count
  const totalFiltered = useMemo(() => {
    return Object.values(filteredGroups).reduce((sum, g) => sum + g.diseases.length, 0);
  }, [filteredGroups]);

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Handle disease selection
  const handleSelect = (disease) => {
    if (onSelectDisease) {
      onSelectDisease(disease);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`fixed right-0 top-0 h-full w-80 bg-card border-l border-border/50 shadow-2xl z-50 flex flex-col ${className}`}
        data-testid="disease-browser-sidebar"
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Disease Database</h3>
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Loading...' : `${diseases.length.toLocaleString()} diseases`}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              data-testid="disease-browser-close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ICD-10..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-sm"
              data-testid="disease-browser-search"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent/20 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-2">
              Found {totalFiltered.toLocaleString()} matching diseases
            </p>
          )}
        </div>
        
        {/* Categories List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="text-sm text-muted-foreground">Loading diseases...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                <p className="text-sm text-red-500">{error}</p>
                <Button size="sm" variant="outline" onClick={fetchDiseases}>
                  Retry
                </Button>
              </div>
            ) : Object.keys(filteredGroups).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                <Search className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No diseases found</p>
                {searchQuery && (
                  <Button size="sm" variant="ghost" onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              Object.entries(filteredGroups)
                .sort((a, b) => b[1].diseases.length - a[1].diseases.length)
                .map(([category, group]) => {
                  const Icon = group.config.icon;
                  const isExpanded = expandedCategories[category];
                  
                  return (
                    <div key={category} className="mb-2">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/50 transition-colors ${isExpanded ? group.config.bgColor : ''}`}
                        data-testid={`disease-category-${category}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${group.config.color}`} />
                          <span className="text-sm font-medium">{group.config.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {group.diseases.length}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                      
                      {/* Disease List */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-6 pr-2 py-1 space-y-0.5 max-h-72 overflow-y-auto">
                              {group.diseases.map((disease, idx) => {
                                const isSelected = disease.id === selectedDiseaseId;
                                return (
                                  <button
                                    key={`${category}-${disease.id}-${idx}`}
                                    onClick={() => handleSelect(disease)}
                                    className={`w-full text-left p-2 text-xs rounded transition-colors group ${
                                      isSelected 
                                        ? 'bg-emerald-500/20 border border-emerald-500/30' 
                                        : 'hover:bg-emerald-500/10'
                                    }`}
                                    data-testid={`disease-browser-item-${disease.id}`}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <span className={`text-sm truncate ${
                                        isSelected ? 'text-emerald-400 font-medium' : 'group-hover:text-emerald-400'
                                      } transition-colors`}>
                                        {disease.name}
                                      </span>
                                      {disease.icd10_code && (
                                        <Badge 
                                          variant="outline" 
                                          className="text-[9px] shrink-0 font-mono"
                                        >
                                          {disease.icd10_code.split(',')[0]}
                                        </Badge>
                                      )}
                                    </div>
                                    {disease.description && (
                                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                        {disease.description}
                                      </p>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
            )}
          </div>
        </ScrollArea>
        
        {/* Footer Stats */}
        <div className="p-3 border-t border-border/50 bg-accent/5 shrink-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {Object.keys(filteredGroups).length} categories
            </span>
            <span>
              {totalFiltered.toLocaleString()} diseases
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DiseaseBrowserPanel;
