import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import FeatureNav from '../components/FeatureNav';
import {
  Pill, Search, ChevronDown, ChevronUp, ChevronRight,
  Heart, AlertTriangle, TrendingUp, TrendingDown,
  Beaker, Shield, Clock, Info, Loader2, X, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { ORGAN_MODELS } from '../data/organModels';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Drug Categories for filtering
const DRUG_CATEGORIES = {
  cardiovascular: { name: 'Cardiovascular', icon: '🫀', color: 'from-red-500 to-rose-500' },
  respiratory: { name: 'Respiratory', icon: '🫁', color: 'from-blue-500 to-cyan-500' },
  neurological: { name: 'Neurological', icon: '🧠', color: 'from-purple-500 to-violet-500' },
  renal: { name: 'Renal', icon: '💜', color: 'from-teal-500 to-cyan-500' },
  gastrointestinal: { name: 'Gastrointestinal', icon: '🔬', color: 'from-orange-500 to-red-500' },
  endocrine: { name: 'Endocrine', icon: '⚡', color: 'from-yellow-500 to-amber-500' },
};

// Parameter Effect Card Component
const ParameterEffectCard = ({ param, organName, organIcon }) => {
  const isIncrease = param.multiplier > 1;
  const percentChange = param.multiplier ? Math.round((param.multiplier - 1) * 100) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg border ${
        isIncrease 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : 'bg-amber-500/10 border-amber-500/30'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{organIcon}</span>
        <span className="text-xs text-muted-foreground">{organName}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{param.parameter_id}</span>
        <div className="flex items-center gap-1">
          {isIncrease ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-amber-500" />
          )}
          <span className={`text-sm font-bold ${isIncrease ? 'text-emerald-500' : 'text-amber-500'}`}>
            {isIncrease ? '+' : ''}{percentChange}%
          </span>
        </div>
      </div>
      {param.note && (
        <p className="text-xs text-muted-foreground mt-1">{param.note}</p>
      )}
    </motion.div>
  );
};

// Drug Effect Section Component
const DrugEffectSection = ({ title, effects, icon: Icon, colorClass }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (!effects || effects.length === 0) return null;
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r ${colorClass} text-white`}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="font-medium">{title}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {effects.map((effect, effectIdx) => (
              <div key={effectIdx} className="mt-3 p-3 border border-border/50 rounded-lg bg-card/50">
                <p className="text-sm text-muted-foreground mb-3">{effect.description}</p>
                
                {effect.onset_hours && (
                  <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Onset: {effect.onset_hours}h</span>
                    </div>
                    {effect.duration_hours && (
                      <span>Duration: {effect.duration_hours}h</span>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {effect.organs?.map((organ, organIdx) => {
                    const organModel = ORGAN_MODELS[organ.organ_id];
                    return organ.scales?.map((scale, scaleIdx) => 
                      scale.parameters?.map((param, paramIdx) => (
                        <ParameterEffectCard
                          key={`${organIdx}-${scaleIdx}-${paramIdx}`}
                          param={param}
                          organName={organModel?.name || organ.organ_id}
                          organIcon={organModel?.icon || '💊'}
                        />
                      ))
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Drug Detail View Component
const DrugDetailView = ({ drug, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'effects', label: 'Effects' },
    { id: 'dosing', label: 'Dosing' },
    { id: 'interactions', label: 'Interactions' },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 via-purple-500/5 to-indigo-500/5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
        
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{drug.name}</h1>
            <p className="text-muted-foreground">{drug.brand_names?.join(', ')}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{drug.drug_class}</Badge>
              <Badge variant="outline">{drug.category}</Badge>
              {drug.pregnancy_category && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                  Pregnancy: {drug.pregnancy_category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-border/50 bg-card/30 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary/20 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1 p-4 lg:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Mechanism */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Beaker className="w-5 h-5 text-primary" />
                Mechanism of Action
              </h3>
              <p className="text-muted-foreground">{drug.mechanism_of_action}</p>
              
              {drug.target_receptors?.length > 0 && (
                <div className="mt-3">
                  <span className="text-sm font-medium">Target Receptors: </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {drug.target_receptors.map((receptor, idx) => (
                      <Badge key={idx} variant="outline">{receptor}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Indications */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Indications
              </h3>
              <div className="grid gap-2">
                {drug.indications?.map((indication, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      indication.is_primary 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-card/50 border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{indication.disease_name}</span>
                        {indication.is_primary && (
                          <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{indication.efficacy_level}</Badge>
                        <Badge variant="secondary">Grade {indication.evidence_grade}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contraindications & Warnings */}
            <div className="grid md:grid-cols-2 gap-4">
              {drug.contraindications?.length > 0 && (
                <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                  <h4 className="font-semibold text-red-500 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Contraindications
                  </h4>
                  <ul className="space-y-1">
                    {drug.contraindications.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {drug.warnings?.length > 0 && (
                <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <h4 className="font-semibold text-amber-500 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Warnings
                  </h4>
                  <ul className="space-y-1">
                    {drug.warnings.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Pharmacokinetics */}
            {(drug.absorption || drug.half_life) && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Pharmacokinetics
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {drug.absorption && (
                    <div className="p-3 rounded-lg bg-card/50 border border-border/50">
                      <span className="text-xs text-muted-foreground">Absorption</span>
                      <p className="text-sm mt-1">{drug.absorption}</p>
                    </div>
                  )}
                  {drug.distribution && (
                    <div className="p-3 rounded-lg bg-card/50 border border-border/50">
                      <span className="text-xs text-muted-foreground">Distribution</span>
                      <p className="text-sm mt-1">{drug.distribution}</p>
                    </div>
                  )}
                  {drug.metabolism && (
                    <div className="p-3 rounded-lg bg-card/50 border border-border/50">
                      <span className="text-xs text-muted-foreground">Metabolism</span>
                      <p className="text-sm mt-1">{drug.metabolism}</p>
                    </div>
                  )}
                  {drug.half_life && (
                    <div className="p-3 rounded-lg bg-card/50 border border-border/50">
                      <span className="text-xs text-muted-foreground">Half-life</span>
                      <p className="text-sm mt-1">{drug.half_life}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'effects' && (
          <div className="space-y-4">
            <DrugEffectSection
              title="Therapeutic Effects"
              effects={drug.therapeutic_effects}
              icon={TrendingUp}
              colorClass="from-emerald-500 to-green-500"
            />
            
            <DrugEffectSection
              title="Side Effects"
              effects={drug.side_effects}
              icon={AlertTriangle}
              colorClass="from-amber-500 to-orange-500"
            />
            
            <DrugEffectSection
              title="Overdose Effects"
              effects={drug.overdose_effects}
              icon={AlertTriangle}
              colorClass="from-red-500 to-rose-500"
            />
          </div>
        )}
        
        {activeTab === 'dosing' && (
          <div className="space-y-4">
            {drug.dosages?.map((dosage, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{dosage.route}</Badge>
                  <Badge variant="outline">{dosage.form}</Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Strength</span>
                    <p className="font-medium">{dosage.strength}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Typical Dose</span>
                    <p className="font-medium">{dosage.typical_dose}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Max Daily</span>
                    <p className="font-medium">{dosage.max_daily_dose}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Frequency</span>
                    <p className="font-medium">{dosage.frequency}</p>
                  </div>
                </div>
                {dosage.special_instructions && (
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    {dosage.special_instructions}
                  </p>
                )}
              </div>
            ))}
            
            {(!drug.dosages || drug.dosages.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No dosing information available</p>
            )}
          </div>
        )}
        
        {activeTab === 'interactions' && (
          <div className="space-y-3">
            {drug.interactions?.map((interaction, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-lg border ${
                  interaction.severity === 'severe' || interaction.severity === 'contraindicated'
                    ? 'border-red-500/30 bg-red-500/5'
                    : interaction.severity === 'moderate'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-border/50 bg-card/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{interaction.interacting_drug_name}</span>
                  <Badge 
                    variant="outline"
                    className={
                      interaction.severity === 'severe' || interaction.severity === 'contraindicated'
                        ? 'bg-red-500/20 text-red-500 border-red-500/30'
                        : interaction.severity === 'moderate'
                        ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                        : ''
                    }
                  >
                    {interaction.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{interaction.effect}</p>
                {interaction.clinical_note && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    💡 {interaction.clinical_note}
                  </p>
                )}
              </div>
            ))}
            
            {(!drug.interactions || drug.interactions.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No interactions documented</p>
            )}
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
};

// Main Drugs Page Component
const DrugsPage = () => {
  const { isDark } = useTheme();
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [drugDetail, setDrugDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Fetch drugs from API
  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);
        
        const response = await fetch(`${API_URL}/api/drugs-db?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch drugs');
        
        const data = await response.json();
        setDrugs(data.drugs);
        setError(null);
      } catch (err) {
        console.error('Error fetching drugs:', err);
        setError('Failed to load drugs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrugs();
  }, [selectedCategory, searchQuery]);
  
  // Fetch drug detail
  const fetchDrugDetail = async (drugId) => {
    try {
      setLoadingDetail(true);
      const response = await fetch(`${API_URL}/api/drugs-db/${drugId}`);
      if (!response.ok) throw new Error('Failed to fetch drug detail');
      
      const data = await response.json();
      setDrugDetail(data);
      setSelectedDrug(drugId);
    } catch (err) {
      console.error('Error fetching drug detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };
  
  const handleBackToList = () => {
    setSelectedDrug(null);
    setDrugDetail(null);
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark' : ''} bg-background text-foreground`}>
      <FeatureNav />
      
      {/* Page Header */}
      <div className="hidden lg:block container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-serif text-3xl font-bold">ρ</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Drugs Database</h1>
            <p className="text-sm text-muted-foreground">
              Explore drug effects on physiological parameters
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar - Drug List */}
        <div className={`${selectedDrug ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 border-r border-border/50 bg-card/20`}>
          {/* Search */}
          <div className="p-4 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search drugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="p-2 border-b border-border/50 overflow-x-auto">
            <div className="flex gap-1">
              <Button
                variant={selectedCategory === null ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="shrink-0"
              >
                All
              </Button>
              {Object.entries(DRUG_CATEGORIES).map(([key, cat]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="shrink-0"
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Drug List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : drugs.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No drugs found. Try a different search.
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {drugs.map((drug) => (
                  <motion.button
                    key={drug.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => fetchDrugDetail(drug.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all hover:bg-accent/10 ${
                      selectedDrug === drug.id ? 'bg-primary/10 border border-primary/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0">
                        <Pill className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{drug.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {drug.drug_class}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {drug.indication_count} indications
                          </Badge>
                          {drug.interaction_count > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
                              {drug.interaction_count} interactions
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Main Content - Drug Detail */}
        <div className={`flex-1 ${selectedDrug ? 'flex' : 'hidden lg:flex'} flex-col`}>
          <AnimatePresence mode="wait">
            {loadingDetail ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : drugDetail ? (
              <DrugDetailView drug={drugDetail} onBack={handleBackToList} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4">
                  <Pill className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Drugs Database</h2>
                <p className="text-muted-foreground max-w-md">
                  Select a drug from the list to view detailed information about its mechanism,
                  effects on physiological parameters, dosing, and interactions.
                </p>
                <div className="flex gap-2 mt-6">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Therapeutic Effects
                  </Badge>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Side Effects
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                    <Shield className="w-3 h-3 mr-1" />
                    Interactions
                  </Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DrugsPage;
