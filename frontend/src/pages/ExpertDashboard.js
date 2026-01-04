import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Slider } from '../components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { useExpert } from '../context/ExpertContext';
import { ORGAN_MODELS } from '../data/organModels';
import { DISEASE_MODELS } from '../data/diseaseModels';
import { 
  Search, CheckCircle2, Clock, AlertTriangle, FileEdit, 
  LogOut, User, Stethoscope, ChevronRight, ChevronDown,
  ExternalLink, Beaker, LayoutDashboard, ListChecks,
  Heart, Brain, Activity, Eye, BookOpen, Pill,
  FileText, TrendingUp, Microscope, ClipboardList, Target,
  Shield, Thermometer, Dna, Calculator, Plus, Save,
  MessageSquare, Link, RotateCcw, FileCheck, XCircle, ArrowRight,
  Bell, Zap, RefreshCw, History, Filter, Trash2, Play, HeartPulse, FileJson
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Map specialties to disease categories
const SPECIALTY_MAPPING = {
  "Cardiology": ["cardiovascular", "heart", "cardiac", "vascular"],
  "Pulmonology": ["respiratory", "pulmonary", "lung"],
  "Neurology": ["neurological", "brain", "nervous", "neuro"],
  "Gastroenterology": ["gastrointestinal", "digestive", "gi", "hepatic", "liver"],
  "Nephrology": ["renal", "kidney", "urological"],
  "Endocrinology": ["endocrine", "metabolic", "diabetes", "thyroid", "hormonal"],
  "Hematology": ["hematological", "blood", "coagulation"],
  "Oncology": ["oncological", "cancer", "neoplasm", "tumor", "malignant"],
  "Rheumatology": ["rheumatological", "autoimmune", "arthritis", "connective"],
  "Infectious Disease": ["infectious", "infection", "viral", "bacterial"],
  "Dermatology": ["dermatological", "skin", "cutaneous"],
  "Psychiatry": ["psychiatric", "mental", "psychological"],
  "Pediatrics": ["pediatric", "congenital", "childhood"],
  "Obstetrics & Gynecology": ["obstetric", "gynecological", "pregnancy", "reproductive"],
  "General Medicine": [],
  "Surgery": ["surgical"],
  "Emergency Medicine": [],
  "Critical Care": ["critical", "intensive", "acute"],
  "Radiology": [],
  "Pathology": []
};

// Organ icons
const ORGAN_ICONS = {
  heart: Heart,
  brain: Brain,
  lungs: Activity,
  kidneys: Activity,
  liver: Activity,
  blood: Activity,
  endocrine: Activity,
  default: Activity
};

// Scale levels - same as main dashboard
const SCALE_LEVELS = [
  { id: 'geometry', name: 'Geometry', fullName: 'Geometry & Dimensions', icon: '📐', description: 'Shape, size, volumes' },
  { id: 'pressures', name: 'Pressures', fullName: 'Pressures & Gradients', icon: '📊', description: 'Forces and flows' },
  { id: 'structure', name: 'Structure', fullName: 'Structure & Tissue', icon: '🔬', description: 'Tissue composition' },
  { id: 'physiology', name: 'Physiology', fullName: 'Physiology & Function', icon: '⚡', description: 'Functional measures' },
  { id: 'cellular', name: 'Cellular', fullName: 'Cellular & Molecular', icon: '🧬', description: 'Cell-level processes' },
  { id: 'lab_tests', name: 'Lab Tests', fullName: 'Laboratory Tests', icon: '🧪', description: 'Blood tests, biomarkers' },
  { id: 'urinalysis', name: 'Urinalysis', fullName: 'Urinalysis', icon: '💧', description: 'Urine analysis' },
  { id: 'imaging', name: 'Imaging', fullName: 'Imaging Parameters', icon: '📷', description: 'CT, MRI, Ultrasound' },
  { id: 'ecg', name: 'ECG', fullName: 'ECG / Electrocardiogram', icon: '💓', description: 'Heart electrical activity' },
  { id: 'vital_signs', name: 'Vitals', fullName: 'Vital Signs', icon: '❤️', description: 'BP, HR, Temp, RR' },
  { id: 'physical_exam', name: 'Physical', fullName: 'Physical Examination', icon: '🩺', description: 'Clinical findings' },
];

export default function ExpertDashboard() {
  const navigate = useNavigate();
  const { expert, token, logout, isAdmin, loading: authLoading } = useExpert();
  
  // Main navigation state
  const [activeView, setActiveView] = useState('diseases');
  
  // Diseases state
  const [diseases, setDiseases] = useState([]);
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewed, setShowReviewed] = useState(null);
  const [showMySpecialty, setShowMySpecialty] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, reviewed: 0, pending: 0, mySpecialty: 0 });
  
  // Selected disease
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [diseaseData, setDiseaseData] = useState(null);
  const [loadingDisease, setLoadingDisease] = useState(false);
  const [diseaseSeverity, setDiseaseSeverity] = useState(0.5);
  
  // Selected organ/scale for parameter view
  const [selectedOrgan, setSelectedOrgan] = useState('heart');
  const [selectedScale, setSelectedScale] = useState(null);
  
  // Change request
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [changeTarget, setChangeTarget] = useState(null);
  const [changeRequest, setChangeRequest] = useState({
    proposedValue: '',
    sourceUrl: '',
    reasoning: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // My change requests & all change requests
  const [myChangeRequests, setMyChangeRequests] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [historyChanges, setHistoryChanges] = useState([]);
  
  // Guideline monitoring
  const [guidelineNotifications, setGuidelineNotifications] = useState([]);
  const [checkingGuidelines, setCheckingGuidelines] = useState(false);
  
  // Experiment Lab state
  const [experiments, setExperiments] = useState([]);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [showNewExperiment, setShowNewExperiment] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    patient: { name: 'Test Patient', age: 45, sex: 'Male', weight: 70 },
    test_diseases: [],
    severity_levels: {}
  });
  
  // Expanded sections
  const [expandedSections, setExpandedSections] = useState({});

  // Check specialty match
  const matchesSpecialty = useCallback((disease) => {
    if (!expert?.specialty) return true;
    const specialtyKeywords = SPECIALTY_MAPPING[expert.specialty] || [];
    if (specialtyKeywords.length === 0) return true;
    
    const category = (disease.category || '').toLowerCase();
    const description = (disease.description || '').toLowerCase();
    const name = (disease.name || '').toLowerCase();
    const organs = (disease.affected_organs || disease.affectedOrgans || []).map(o => o.toLowerCase());
    
    return specialtyKeywords.some(keyword => 
      category.includes(keyword) || description.includes(keyword) || 
      name.includes(keyword) || organs.some(o => o.includes(keyword))
    );
  }, [expert?.specialty]);

  // Fetch diseases
  const fetchDiseases = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/experts/diseases-to-review`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const allDiseases = data.diseases || [];
      setDiseases(allDiseases);
      
      const specialtyDiseases = allDiseases.filter(matchesSpecialty);
      const reviewedCount = allDiseases.filter(d => d.is_reviewed).length;
      
      setStats({
        total: allDiseases.length,
        reviewed: reviewedCount,
        pending: allDiseases.length - reviewedCount,
        mySpecialty: specialtyDiseases.length
      });
    } catch (err) {
      console.error('Failed to fetch diseases:', err);
    } finally {
      setLoading(false);
    }
  }, [token, matchesSpecialty]);

  // Fetch change requests
  const fetchMyChangeRequests = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/change-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMyChangeRequests(data.change_requests || []);
    } catch (err) {
      console.error('Failed to fetch change requests:', err);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      navigate('/expert-login');
      return;
    }
    fetchDiseases();
    fetchMyChangeRequests();
  }, [token, authLoading, navigate, fetchDiseases, fetchMyChangeRequests]);

  // Filter diseases
  useEffect(() => {
    let filtered = diseases;
    if (showMySpecialty && expert?.specialty) {
      filtered = filtered.filter(matchesSpecialty);
    }
    if (searchQuery) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.icd10?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (showReviewed !== null) {
      filtered = filtered.filter(d => d.is_reviewed === showReviewed);
    }
    setFilteredDiseases(filtered);
  }, [diseases, searchQuery, showReviewed, showMySpecialty, expert?.specialty, matchesSpecialty]);

  // Fetch disease details
  const handleSelectDisease = async (disease) => {
    setSelectedDisease(disease);
    setLoadingDisease(true);
    setExpandedSections({});
    setDiseaseSeverity(0.5);
    
    // Set default organ based on disease
    const affectedOrgans = disease.affected_organs || disease.affectedOrgans || [];
    if (affectedOrgans.length > 0 && ORGAN_MODELS[affectedOrgans[0]]) {
      setSelectedOrgan(affectedOrgans[0]);
    } else {
      setSelectedOrgan('heart');
    }
    setSelectedScale(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/experts/disease/${disease.id}/parameters`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDiseaseData(data);
    } catch (err) {
      console.error('Failed to fetch disease data:', err);
    } finally {
      setLoadingDisease(false);
    }
  };

  // Get merged modifications (static + API data)
  const getMergedModifications = useMemo(() => {
    if (!selectedDisease) return {};
    
    const diseaseId = selectedDisease.id;
    const staticMods = DISEASE_MODELS[diseaseId]?.modifications || {};
    const apiMods = diseaseData?.disease?.parameter_modifications || 
                   diseaseData?.disease?.modifications || {};
    
    // Deep merge
    const merged = { ...staticMods };
    Object.keys(apiMods).forEach(organ => {
      if (!merged[organ]) merged[organ] = {};
      Object.keys(apiMods[organ] || {}).forEach(scale => {
        if (!merged[organ][scale]) merged[organ][scale] = {};
        Object.assign(merged[organ][scale], apiMods[organ][scale]);
      });
    });
    
    return merged;
  }, [selectedDisease, diseaseData]);

  // Calculate modified value
  const getModifiedValue = (baseValue, mods, paramId) => {
    if (!mods) return { value: baseValue, modified: false };
    
    const multiplier = mods.multiplier !== undefined ? mods.multiplier : mods.factor;
    const absoluteValue = mods.absolute !== undefined ? mods.absolute : mods.value;
    const changePercent = mods.change_percent;
    const direction = mods.direction;
    
    // Check for "absent" parameters
    const isAbsent = (multiplier === 0 || absoluteValue === 0) && 
                     (mods.note?.toLowerCase().includes('absent') || 
                      mods.note?.toLowerCase().includes('not measurable') ||
                      mods.note?.toLowerCase().includes('loss of'));
    
    if (isAbsent) {
      return { value: 'ABSENT', modified: true, note: mods.note, isAbsent: true };
    }
    
    let newValue = baseValue;
    
    if (absoluteValue !== undefined && absoluteValue !== null && typeof absoluteValue === 'number') {
      newValue = absoluteValue;
    } else if (changePercent) {
      const sign = (direction === 'decrease' || changePercent < 0) ? -1 : 1;
      const factor = 1 + (sign * Math.abs(changePercent) / 100) * diseaseSeverity;
      newValue = baseValue * factor;
    } else if (multiplier !== undefined && multiplier !== null) {
      const adjustedMultiplier = 1 + (multiplier - 1) * diseaseSeverity;
      newValue = baseValue * adjustedMultiplier;
    }
    
    const delta = baseValue !== 0 ? ((newValue - baseValue) / baseValue * 100).toFixed(1) : 0;
    
    return {
      value: newValue,
      modified: Math.abs(newValue - baseValue) > 0.01,
      delta,
      note: mods.note
    };
  };

  // Mark as reviewed
  const handleMarkReviewed = async () => {
    if (!selectedDisease) return;
    try {
      await fetch(`${BACKEND_URL}/api/experts/disease/${selectedDisease.id}/mark-reviewed`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDiseases();
      setSelectedDisease(prev => ({ ...prev, is_reviewed: true }));
    } catch (err) {
      console.error('Failed to mark as reviewed:', err);
    }
  };

  // Open change dialog
  const handleEditParameter = (param, organId, scaleId) => {
    setChangeTarget({
      type: 'parameter',
      organId,
      scaleId,
      paramId: param.id,
      paramName: param.name,
      currentValue: param.value,
      currentUnit: param.unit,
      currentMods: getMergedModifications[organId]?.[scaleId]?.[param.id]
    });
    setChangeRequest({
      proposedValue: '',
      sourceUrl: '',
      reasoning: '',
      notes: ''
    });
    setShowChangeDialog(true);
  };

  // Submit change
  const handleSubmitChange = async () => {
    if (!changeTarget || !changeRequest.sourceUrl || !changeRequest.reasoning) {
      alert('Please provide source URL and reasoning');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/change-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          disease_id: selectedDisease.id,
          disease_name: selectedDisease.name,
          organ_id: changeTarget.organId,
          scale_id: changeTarget.scaleId,
          change_type: 'modification',
          parameters: [{
            parameter_id: changeTarget.paramId,
            parameter_name: changeTarget.paramName,
            current_value: changeTarget.currentValue,
            proposed_value: changeRequest.proposedValue,
            current_unit: changeTarget.currentUnit || '',
            source_url: changeRequest.sourceUrl,
            reasoning: changeRequest.reasoning
          }],
          additional_notes: changeRequest.notes
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit');
      
      setShowChangeDialog(false);
      setChangeTarget(null);
      fetchMyChangeRequests();
      alert('Change request submitted for admin review!');
    } catch (err) {
      console.error('Failed to submit:', err);
      alert('Failed to submit change request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/expert-login');
  };

  const progressPercent = stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0;
  
  // Get current organ model
  const currentOrganModel = ORGAN_MODELS[selectedOrgan];
  
  // Get current scale data (scales are direct properties of organ model, not in a "scales" object)
  const currentScale = currentOrganModel?.[selectedScale];

  return (
    <div className="min-h-screen bg-background">
      {/* Simplified Header */}
      <header className="border-b bg-card/50 sticky top-0 z-50 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">PhiCor.ai</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Medical Parameter Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{expert?.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-3 -mb-3 overflow-x-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-b-none border-b-2 ${activeView === 'diseases' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
              onClick={() => setActiveView('diseases')}
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Diseases
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-b-none border-b-2 ${activeView === 'changes' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
              onClick={() => setActiveView('changes')}
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Changes
              {pendingChanges.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1.5">{pendingChanges.length}</Badge>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-b-none border-b-2 ${activeView === 'guidelines' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
              onClick={() => setActiveView('guidelines')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Guidelines
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-b-none border-b-2 ${activeView === 'lab' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
              onClick={() => setActiveView('lab')}
            >
              <Beaker className="w-4 h-4 mr-2" />
              Lab
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Diseases View */}
        {activeView === 'diseases' && (
          <>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">My Specialty</p>
                  <p className="text-2xl font-bold text-primary">{stats.mySpecialty}</p>
                </div>
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <ListChecks className="w-6 h-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Reviewed</p>
                  <p className="text-2xl font-bold text-green-500">{stats.reviewed}</p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
                </div>
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">My Changes</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {myChangeRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <FileEdit className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Review Progress</span>
              <span className="text-sm text-muted-foreground">{progressPercent.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Disease List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Diseases</CardTitle>
              <CardDescription>
                {showMySpecialty ? `${expert?.specialty}` : 'All diseases'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={showMySpecialty ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowMySpecialty(!showMySpecialty)}
                  >
                    <Stethoscope className="w-3 h-3 mr-1" />
                    Specialty
                  </Button>
                  <Button
                    variant={showReviewed === false ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setShowReviewed(showReviewed === false ? null : false)}
                  >
                    Pending
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : (
                  <div className="space-y-1">
                    {filteredDiseases.map(disease => (
                      <Button
                        key={disease.id}
                        variant={selectedDisease?.id === disease.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start h-auto py-2 px-2 text-left"
                        onClick={() => handleSelectDisease(disease)}
                      >
                        <div className="flex items-center w-full min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{disease.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {disease.icd10}
                            </div>
                          </div>
                          {disease.is_reviewed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 ml-1" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Disease Parameters - Like Main Dashboard */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedDisease ? selectedDisease.name : 'Select a Disease'}</CardTitle>
                  <CardDescription>
                    {selectedDisease ? 'Review and modify parameters' : 'Choose a disease to view parameters'}
                  </CardDescription>
                </div>
                {selectedDisease && (
                  <div className="flex gap-2">
                    {!selectedDisease.is_reviewed && (
                      <Button size="sm" onClick={handleMarkReviewed}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Reviewed
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {!selectedDisease ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a disease to view and edit parameters</p>
                </div>
              ) : loadingDisease ? (
                <div className="text-center py-16 text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {/* Severity Slider */}
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Label className="text-sm font-medium whitespace-nowrap">Disease Severity:</Label>
                    <Slider
                      value={[diseaseSeverity]}
                      onValueChange={([v]) => setDiseaseSeverity(v)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-12">{(diseaseSeverity * 100).toFixed(0)}%</span>
                  </div>
                  
                  {/* Organ Tabs */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ORGAN_MODELS).map(([organId, organ]) => {
                      const Icon = ORGAN_ICONS[organId] || ORGAN_ICONS.default;
                      const hasMods = !!getMergedModifications[organId];
                      return (
                        <Button
                          key={organId}
                          variant={selectedOrgan === organId ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => { setSelectedOrgan(organId); setSelectedScale(null); }}
                          className={hasMods ? 'border-destructive/50' : ''}
                        >
                          <Icon className="w-4 h-4 mr-1" />
                          {organ.name}
                          {hasMods && <Badge variant="destructive" className="ml-1 text-[10px] px-1">!</Badge>}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Scale Tabs - iterate through SCALE_LEVELS and check if organ has data for each scale */}
                  {currentOrganModel && (
                    <div className="flex flex-wrap gap-1 border-b pb-2">
                      {SCALE_LEVELS.map((scale) => {
                        const hasData = currentOrganModel?.[scale.id];
                        const hasMods = !!getMergedModifications[selectedOrgan]?.[scale.id];
                        
                        if (!hasData) return null; // Only show scales that have data for this organ
                        
                        return (
                          <Button
                            key={scale.id}
                            variant={selectedScale === scale.id ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedScale(selectedScale === scale.id ? null : scale.id)}
                            className={hasMods ? 'border-destructive/50' : ''}
                          >
                            <span className="mr-1">{scale.icon}</span>
                            {scale.name}
                            {hasMods && <span className="ml-1 text-destructive">●</span>}
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {/* Parameters Grid */}
                  <ScrollArea className="h-[400px]">
                    {selectedScale && currentScale ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {currentScale.parameters?.map(param => {
                          const mods = getMergedModifications[selectedOrgan]?.[selectedScale]?.[param.id];
                          const modResult = getModifiedValue(param.value, mods, param.id);
                          
                          return (
                            <div
                              key={param.id}
                              className={`p-3 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors ${
                                modResult.modified ? 'bg-destructive/5 border-destructive/30' : 'bg-muted/30'
                              }`}
                              onClick={() => handleEditParameter(param, selectedOrgan, selectedScale)}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <span className="text-sm font-medium">{param.name}</span>
                                <FileEdit className="w-3 h-3 text-muted-foreground" />
                              </div>
                              
                              <div className="flex items-baseline gap-2">
                                {modResult.modified && !modResult.isAbsent && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    {param.value}
                                  </span>
                                )}
                                <span className={`text-lg font-mono font-bold ${
                                  modResult.isAbsent ? 'text-purple-500' :
                                  modResult.modified ? 'text-destructive' : ''
                                }`}>
                                  {modResult.isAbsent ? 'ABSENT' :
                                   typeof modResult.value === 'number' 
                                    ? modResult.value.toFixed(param.value % 1 === 0 ? 0 : 1)
                                    : modResult.value}
                                </span>
                                {!modResult.isAbsent && (
                                  <span className="text-xs text-muted-foreground">{param.unit}</span>
                                )}
                              </div>
                              
                              {modResult.modified && modResult.delta && !modResult.isAbsent && (
                                <Badge variant={parseFloat(modResult.delta) > 0 ? 'destructive' : 'default'} className="text-[10px] mt-1">
                                  {parseFloat(modResult.delta) > 0 ? '↑' : '↓'}{Math.abs(parseFloat(modResult.delta))}%
                                </Badge>
                              )}
                              
                              {modResult.note && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{modResult.note}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Select a scale above to view parameters</p>
                        <p className="text-sm mt-2">Click on any parameter to suggest changes</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Change Requests */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">My Change Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {myChangeRequests.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No change requests yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {myChangeRequests.slice(0, 6).map(request => (
                  <div key={request.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{request.disease_name}</p>
                      <Badge variant={
                        request.status === 'approved' ? 'default' :
                        request.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{request.organ_id} / {request.scale_id}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Request Dialog */}
      <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Propose Parameter Change</DialogTitle>
            <DialogDescription>
              Submit a change for admin review
            </DialogDescription>
          </DialogHeader>
          
          {changeTarget && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Parameter</p>
                <p className="font-medium">{changeTarget.paramName}</p>
                <p className="text-sm">
                  Current: <span className="font-mono">{changeTarget.currentValue}</span> {changeTarget.currentUnit}
                </p>
                {changeTarget.currentMods?.note && (
                  <p className="text-xs text-muted-foreground mt-1">Note: {changeTarget.currentMods.note}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Proposed Value</Label>
                <Input
                  value={changeRequest.proposedValue}
                  onChange={(e) => setChangeRequest({...changeRequest, proposedValue: e.target.value})}
                  placeholder="Enter new value or multiplier (e.g., 0.8 for 80%)"
                />
              </div>
              
              <div className="space-y-2">
                <Label>
                  <Link className="w-3 h-3 inline mr-1" />
                  Evidence Source URL *
                </Label>
                <Input
                  value={changeRequest.sourceUrl}
                  onChange={(e) => setChangeRequest({...changeRequest, sourceUrl: e.target.value})}
                  placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Reasoning *</Label>
                <Textarea
                  value={changeRequest.reasoning}
                  onChange={(e) => setChangeRequest({...changeRequest, reasoning: e.target.value})}
                  placeholder="Explain the clinical reasoning..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  Additional Notes
                </Label>
                <Textarea
                  value={changeRequest.notes}
                  onChange={(e) => setChangeRequest({...changeRequest, notes: e.target.value})}
                  placeholder="Any additional context..."
                  rows={2}
                />
              </div>
              
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  Changes require admin approval before updating the database.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitChange} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
