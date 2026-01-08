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
import UserManagementView from '../components/expert/UserManagementView';
import KnowledgeBankView from '../components/expert/KnowledgeBankView';
import { 
  Search, CheckCircle2, Clock, AlertTriangle, FileEdit, 
  LogOut, User, Stethoscope, ChevronRight, ChevronDown,
  ExternalLink, Beaker, LayoutDashboard, ListChecks,
  Heart, Brain, Activity, Eye, BookOpen, Pill,
  FileText, TrendingUp, Microscope, ClipboardList, Target,
  Shield, Thermometer, Dna, Calculator, Plus, Save,
  MessageSquare, Link, RotateCcw, FileCheck, XCircle, ArrowRight,
  Bell, Zap, RefreshCw, History, Filter, Trash2, Play, HeartPulse, FileJson, Users, Pencil
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

// Keywords to identify NON-DISEASE items (lab tests, parameters, guidelines, treatments)
const NON_DISEASE_PATTERNS = [
  // Lab tests and parameters
  /^[A-Z]{2,5}$/,  // ABG, ALP, ALT, ANA, etc.
  /^[A-Z]{2,5}\s?[-–]\s?/,  // ABG - PaCO2, etc.
  /^[0-9]+-?(hr|min|MWT|OH|ASA)/i,  // 6MWT, 24h, 2-hr, 5-ASA
  /antibodies?$/i,
  /^(anti-|Anti-)/,
  /test$/i,
  /ratio$/i,
  /level$/i,
  /index$/i,
  /score$/i,
  /criteria$/i,
  /classification$/i,
  /guidelines?$/i,
  /duration$/i,
  /protocol$/i,
  /induction$/i,
  /regimen$/i,
  /therapy$/i,
  /inhibitors?$/i,
  /blockers?$/i,
  /stimulation$/i,
  /measurement$/i,
  /assessment$/i,
  /evaluation$/i,
  /calculation$/i,
  /formula$/i,
  /algorithm$/i,
  /staging$/i,
  /grading$/i,
  /Rule$/,
  /^ACR\//,
  /^EULAR/,
  /^AASM/,
  /^ACOG/,
  /^WHO /,
  /^TNM /,
  /^Wells /,
  /^CHADS/,
  /^HAS-BLED/,
  /^CHA2DS2/,
  /^PaCO2$/i,
  /^PaO2$/i,
  /^pH$/i,
  /\(t\(/,  // Translocations like APL (t(15;17))
  /^ARNI\s/i,  // ARNI (Sacubitril/Valsartan)
  /Valsartan/i,
  /Sacubitril/i,
];

// Specific non-disease item names
const NON_DISEASE_NAMES = new Set([
  'ABG', 'ALP', 'ALT', 'ANA', 'ANCA', 'ACTH', 'ABI',
  'ABG - PaCO2', 'ABG - PaO2', 'ABG - pH', 'ABG PaO2',
  'ANA, anti-dsDNA',
  '6MWT', '6-Minute Walk Distance and Desaturation',
  '1-hr post-glucose', '2-hr post-glucose',
  '17-OHP', '1mg overnight DST',
  '21-hydroxylase antibodies',
  '24h urinary free cortisol', '24h urine catecholamines',
  '24h urine metanephrines', '24h urine uric acid',
  '25-OH Vitamin D', '3HP (INH/Rifapentine)',
  '5-ASA', '5-ASA (Mesalamine)', '7+3 Induction',
  'AAA Growth Rate', 'AAA Rupture Risk (Laplace)',
  'ACE inhibitors', 'ACEi/ARB', 'ACEi/ARB or CCB or Thiazide',
  'ACTH stimulation test', 'ADT backbone', 'ADT duration with radiation',
  'ADT intensification (mCSPC)', 'ALK rearrangement',
  'APL (t(15;17))', 'ARNI (Sacubitril/Valsartan)',
]);

// Function to check if an item is a disease vs reference/parameter
const isDiseaseItem = (item) => {
  const name = item.name || '';
  
  // Check against explicit non-disease names
  if (NON_DISEASE_NAMES.has(name)) return false;
  
  // Check against patterns
  for (const pattern of NON_DISEASE_PATTERNS) {
    if (pattern.test(name)) return false;
  }
  
  // Items containing certain keywords are likely not diseases
  const lowerName = name.toLowerCase();
  const nonDiseaseKeywords = [
    'criteria', 'guidelines', 'classification', 'scoring',
    'test', 'assay', 'measurement', 'formula', 'equation',
    'therapy', 'treatment', 'regimen', 'protocol', 'induction',
    'inhibitor', 'blocker', 'agonist', 'antagonist',
    'antibody', 'antibodies', 'antigen',
    'ratio', 'index', 'score', 'scale', 'staging',
    'duration', 'interval', 'rate', 'velocity',
  ];
  
  if (nonDiseaseKeywords.some(kw => lowerName.includes(kw))) {
    // Exception: actual disease names that contain these words
    const diseaseExceptions = ['disease', 'syndrome', 'disorder', 'cancer', 'carcinoma', 
      'lymphoma', 'leukemia', 'infection', 'infarction', 'failure', 'deficiency',
      'fibrillation', 'hypertension', 'hypotension', 'stenosis', 'insufficiency',
      'thrombosis', 'embolism', 'anemia', 'itis', 'osis', 'pathy'];
    if (diseaseExceptions.some(exc => lowerName.includes(exc))) {
      return true;
    }
    return false;
  }
  
  return true;
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
  const [activeView, setActiveView] = useState('baselines');
  
  // Baselines view state (for reviewing normal parameters)
  const [baselinesOrgan, setBaselinesOrgan] = useState('heart');
  const [baselinesScale, setBaselinesScale] = useState(null);
  const [baselinesSearch, setBaselinesSearch] = useState('');
  
  // References view state (for non-disease items like tests, guidelines)
  const [referencesSearch, setReferencesSearch] = useState('');
  const [selectedReference, setSelectedReference] = useState(null);
  
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
  
  // Edit change request state
  const [editingChange, setEditingChange] = useState(null);
  const [editFormData, setEditFormData] = useState({ parameters: [], additional_notes: '' });
  
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
  
  // Knowledge Bank state
  const [knowledgeSources, setKnowledgeSources] = useState([]);
  const [knowledgeSuggestions, setKnowledgeSuggestions] = useState([]);
  const [knowledgeTimeline, setKnowledgeTimeline] = useState([]);
  const [knowledgeStats, setKnowledgeStats] = useState({ sources: 0, pending: 0, approved: 0 });
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    source_type: 'url',
    title: '',
    url: '',
    content: '',
    description: '',
    tags: '',
    disease_id: '',
    disease_name: ''
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [systemSettings, setSystemSettings] = useState({ auto_search_interval_days: 30, auto_search_enabled: true });
  const [triggeringSearch, setTriggeringSearch] = useState(false);
  
  // User Management state
  const [allExperts, setAllExperts] = useState([]);
  
  // Platform stats for real-time counts
  const [platformStats, setPlatformStats] = useState({
    drugs: 0, diseases: 0, foods: 0, nutrients: 0, models: 0, organ_systems: 0
  });
  
  // Equations browser state
  const [equationsSearch, setEquationsSearch] = useState('');
  const [equationsOrgan, setEquationsOrgan] = useState('all');
  const [equationsCategory, setEquationsCategory] = useState('all');
  const [selectedEquation, setSelectedEquation] = useState(null);
  const [equationReview, setEquationReview] = useState({ status: '', notes: '', source_verification: '' });

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
    
    // Try to load from cache first for instant display
    const cachedDiseases = localStorage.getItem('phicor_diseases_cache');
    const cacheTimestamp = localStorage.getItem('phicor_diseases_cache_time');
    const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
    
    // Use cache if less than 5 minutes old
    if (cachedDiseases && cacheAge < 5 * 60 * 1000) {
      try {
        const cached = JSON.parse(cachedDiseases);
        setDiseases(cached);
        const specialtyDiseases = cached.filter(matchesSpecialty);
        const reviewedCount = cached.filter(d => d.is_reviewed).length;
        setStats({
          total: cached.length,
          reviewed: reviewedCount,
          pending: cached.length - reviewedCount,
          mySpecialty: specialtyDiseases.length
        });
        setLoading(false);
        console.log('Loaded diseases from cache:', cached.length);
      } catch (e) {
        console.error('Cache parse error:', e);
      }
    }
    
    // Fetch fresh data in background
    try {
      const response = await fetch(`${BACKEND_URL}/api/experts/diseases-to-review`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.error('Diseases API error:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      const allDiseases = data.diseases || [];
      
      // Update state
      setDiseases(allDiseases);
      
      // Cache the results
      localStorage.setItem('phicor_diseases_cache', JSON.stringify(allDiseases));
      localStorage.setItem('phicor_diseases_cache_time', Date.now().toString());
      
      const specialtyDiseases = allDiseases.filter(matchesSpecialty);
      const reviewedCount = allDiseases.filter(d => d.is_reviewed).length;
      
      setStats({
        total: allDiseases.length,
        reviewed: reviewedCount,
        pending: allDiseases.length - reviewedCount,
        mySpecialty: specialtyDiseases.length
      });
      console.log('Fetched fresh diseases:', allDiseases.length);
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

  // Fetch all pending changes (for admin view)
  const fetchAllChanges = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/change-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const all = data.change_requests || [];
      setPendingChanges(all.filter(c => c.status === 'pending'));
      setHistoryChanges(all.filter(c => c.status !== 'pending'));
    } catch (err) {
      console.error('Failed to fetch changes:', err);
    }
  }, [token]);

  // Fetch guideline notifications
  const fetchGuidelines = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/guideline-notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setGuidelineNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch guidelines:', err);
    }
  }, [token]);

  // Fetch experiments
  const fetchExperiments = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/experiments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setExperiments(data.experiments || []);
    } catch (err) {
      console.error('Failed to fetch experiments:', err);
    }
  }, [token]);

  // Fetch platform stats for real-time counts
  const fetchPlatformStats = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/platform/stats`);
      const data = await response.json();
      setPlatformStats({
        drugs: data.drugs?.total || 0,
        diseases: data.diseases?.total || 0,
        foods: data.foods?.total || 0,
        nutrients: data.nutrients?.total || 0,
        models: parseInt(data.display_stats?.models) || 0,
        organ_systems: parseInt(data.display_stats?.organ_systems) || 0
      });
    } catch (err) {
      console.error('Failed to fetch platform stats:', err);
    }
  }, []);

  // Fetch knowledge bank data
  const fetchKnowledgeData = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      // Fetch sources
      const sourcesRes = await fetch(`${BACKEND_URL}/api/admin/knowledge/sources`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sourcesData = await sourcesRes.json();
      setKnowledgeSources(sourcesData.sources || []);

      // Fetch pending suggestions
      const suggestionsRes = await fetch(`${BACKEND_URL}/api/admin/knowledge/suggestions?status=pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const suggestionsData = await suggestionsRes.json();
      setKnowledgeSuggestions(suggestionsData.suggestions || []);

      // Fetch timeline
      const timelineRes = await fetch(`${BACKEND_URL}/api/admin/knowledge/timeline?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const timelineData = await timelineRes.json();
      setKnowledgeTimeline(timelineData.timeline || []);

      // Fetch settings
      const settingsRes = await fetch(`${BACKEND_URL}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const settingsData = await settingsRes.json();
      setSystemSettings(settingsData.settings || { auto_search_interval_days: 30 });

      // Calculate stats
      setKnowledgeStats({
        sources: sourcesData.sources?.length || 0,
        pending: suggestionsData.suggestions?.length || 0,
        approved: 0 // Would need another API call
      });
    } catch (err) {
      console.error('Failed to fetch knowledge data:', err);
    }
  }, [token, isAdmin]);

  // Upload knowledge source
  const handleUploadKnowledge = async () => {
    if (!uploadForm.title) return;
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('source_type', uploadForm.source_type);
      formData.append('title', uploadForm.title);
      formData.append('url', uploadForm.url || '');
      formData.append('content', uploadForm.content || '');
      formData.append('description', uploadForm.description || '');
      formData.append('tags', uploadForm.tags || '');
      formData.append('disease_id', uploadForm.disease_id || '');
      formData.append('disease_name', uploadForm.disease_name || '');
      
      if (uploadFile) {
        formData.append('file', uploadFile);
      }

      const response = await fetch(`${BACKEND_URL}/api/admin/knowledge/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setShowUploadDialog(false);
        setUploadForm({
          source_type: 'url',
          title: '',
          url: '',
          content: '',
          description: '',
          tags: '',
          disease_id: '',
          disease_name: ''
        });
        setUploadFile(null);
        fetchKnowledgeData();
      }
    } catch (err) {
      console.error('Failed to upload:', err);
    } finally {
      setUploading(false);
    }
  };

  // Approve/Reject knowledge suggestion
  const handleApproveKnowledgeSuggestion = async (suggestionId) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/knowledge/suggestions/${suggestionId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      fetchKnowledgeData();
    } catch (err) {
      console.error('Failed to approve suggestion:', err);
    }
  };

  const handleRejectKnowledgeSuggestion = async (suggestionId) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/knowledge/suggestions/${suggestionId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      fetchKnowledgeData();
    } catch (err) {
      console.error('Failed to reject suggestion:', err);
    }
  };

  // Trigger AI auto-search
  const handleTriggerAutoSearch = async () => {
    setTriggeringSearch(true);
    try {
      await fetch(`${BACKEND_URL}/api/admin/knowledge/trigger-auto-search`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchKnowledgeData();
    } catch (err) {
      console.error('Failed to trigger auto-search:', err);
    } finally {
      setTriggeringSearch(false);
    }
  };

  // Update system settings
  const handleUpdateSettings = async (updates) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchKnowledgeData();
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  // Fetch all experts for user management
  const fetchAllExperts = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/experts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAllExperts(data.experts || []);
    } catch (err) {
      console.error('Failed to fetch experts:', err);
    }
  }, [token, isAdmin]);

  // Create new expert
  const handleCreateExpert = async (formData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/experts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        fetchAllExperts();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to create expert');
      }
    } catch (err) {
      console.error('Failed to create expert:', err);
    }
  };

  // Update expert
  const handleUpdateExpert = async (expertId, updates) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/experts/${expertId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        fetchAllExperts();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to update expert');
      }
    } catch (err) {
      console.error('Failed to update expert:', err);
    }
  };

  // Delete/Deactivate expert
  const handleDeleteExpert = async (expertId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/experts/${expertId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAllExperts();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to deactivate expert');
      }
    } catch (err) {
      console.error('Failed to delete expert:', err);
    }
  };

  // Reset expert password
  const handleResetPassword = async (expertId, newPassword) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/experts/${expertId}/reset-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword })
      });
      if (response.ok) {
        alert('Password reset successfully');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Failed to reset password:', err);
    }
  };

  // Check for new guidelines
  const handleCheckGuidelines = async () => {
    setCheckingGuidelines(true);
    try {
      await fetch(`${BACKEND_URL}/api/admin/check-guidelines`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchGuidelines();
    } catch (err) {
      console.error('Failed to check guidelines:', err);
    } finally {
      setCheckingGuidelines(false);
    }
  };

  // Approve/Reject change request
  const handleApproveChange = async (changeId) => {
    try {
      await fetch(`${BACKEND_URL}/api/change-requests/${changeId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAllChanges();
      fetchMyChangeRequests();
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleRejectChange = async (changeId) => {
    try {
      await fetch(`${BACKEND_URL}/api/change-requests/${changeId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAllChanges();
      fetchMyChangeRequests();
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  // Edit a pending change request
  const handleEditChange = (change) => {
    setEditingChange(change);
    setEditFormData({
      disease_id: change.disease_id,
      disease_name: change.disease_name,
      organ_id: change.organ_id,
      scale_id: change.scale_id,
      change_type: change.change_type,
      parameters: change.parameters || [],
      additional_notes: change.additional_notes || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingChange) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/change-requests/${editingChange.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });
      if (response.ok) {
        setEditingChange(null);
        setEditFormData({ parameters: [], additional_notes: '' });
        fetchAllChanges();
        fetchMyChangeRequests();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Failed to save edit:', err);
      alert('Failed to save changes');
    }
  };

  const handleWithdrawChange = async (changeId) => {
    if (!window.confirm('Are you sure you want to withdraw this change request?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/change-requests/${changeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAllChanges();
        fetchMyChangeRequests();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to withdraw');
      }
    } catch (err) {
      console.error('Failed to withdraw:', err);
    }
  };

  const updateEditParameter = (index, field, value) => {
    const newParams = [...editFormData.parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    setEditFormData({ ...editFormData, parameters: newParams });
  };

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      navigate('/expert-login');
      return;
    }
    fetchDiseases();
    fetchMyChangeRequests();
    fetchAllChanges();
    fetchGuidelines();
    fetchExperiments();
    fetchKnowledgeData();
    fetchAllExperts();
    fetchPlatformStats();
  }, [token, authLoading, navigate, fetchDiseases, fetchMyChangeRequests, fetchAllChanges, fetchGuidelines, fetchExperiments, fetchKnowledgeData, fetchAllExperts, fetchPlatformStats]);

  // Filter diseases - now separating actual diseases from references
  useEffect(() => {
    // First, separate diseases from references
    const actualDiseases = diseases.filter(isDiseaseItem);
    const referenceItems = diseases.filter(d => !isDiseaseItem(d));
    
    let filtered = actualDiseases;
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
    
    // Update stats to reflect only actual diseases
    const specialtyDiseases = actualDiseases.filter(matchesSpecialty);
    const reviewedCount = actualDiseases.filter(d => d.is_reviewed).length;
    setStats({
      total: actualDiseases.length,
      reviewed: reviewedCount,
      pending: actualDiseases.length - reviewedCount,
      mySpecialty: specialtyDiseases.length,
      references: referenceItems.length
    });
  }, [diseases, searchQuery, showReviewed, showMySpecialty, expert?.specialty, matchesSpecialty]);
  
  // Get filtered reference items
  const filteredReferences = useMemo(() => {
    const referenceItems = diseases.filter(d => !isDiseaseItem(d));
    if (!referencesSearch) return referenceItems;
    return referenceItems.filter(d => 
      d.name.toLowerCase().includes(referencesSearch.toLowerCase())
    );
  }, [diseases, referencesSearch]);
  
  // Get filtered baseline parameters
  const filteredBaselinesParams = useMemo(() => {
    if (!baselinesScale || !ORGAN_MODELS[baselinesOrgan]?.[baselinesScale]) return [];
    const params = ORGAN_MODELS[baselinesOrgan][baselinesScale].parameters || [];
    if (!baselinesSearch) return params;
    return params.filter(p => 
      p.name.toLowerCase().includes(baselinesSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(baselinesSearch.toLowerCase())
    );
  }, [baselinesOrgan, baselinesScale, baselinesSearch]);

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
              {/* PhiCor Logo - matching website style */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-serif text-xl font-bold">Φ</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  Phi<span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Cor</span>
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Expert Curation System</p>
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
              className={`rounded-b-none border-b-2 ${activeView === 'baselines' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
              onClick={() => setActiveView('baselines')}
            >
              <HeartPulse className="w-4 h-4 mr-2" />
              Baselines
            </Button>
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
              className={`rounded-b-none border-b-2 ${activeView === 'references' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
              onClick={() => setActiveView('references')}
            >
              <FileJson className="w-4 h-4 mr-2" />
              References
              {stats.references > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5">{stats.references}</Badge>
              )}
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
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-b-none border-b-2 ${activeView === 'equations' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
              onClick={() => setActiveView('equations')}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Equations
              <Badge variant="secondary" className="ml-1 text-xs px-1.5">{platformStats.models}+</Badge>
            </Button>
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`rounded-b-none border-b-2 ${activeView === 'knowledge' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                onClick={() => setActiveView('knowledge')}
              >
                <Dna className="w-4 h-4 mr-2" />
                Knowledge
                {knowledgeStats.pending > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs px-1.5">{knowledgeStats.pending}</Badge>
                )}
              </Button>
            )}
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`rounded-b-none border-b-2 ${activeView === 'users' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                onClick={() => setActiveView('users')}
              >
                <Users className="w-4 h-4 mr-2" />
                Users
                <Badge variant="secondary" className="ml-1 text-xs px-1.5">{allExperts.length}</Badge>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Baselines View - Review Normal/Standard Parameters */}
        {activeView === 'baselines' && (
          <div className="space-y-6">
            {/* Header */}
            <Card className="border-green-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <HeartPulse className="w-5 h-5 text-green-500" />
                      Normal Baseline Parameters
                    </CardTitle>
                    <CardDescription>Review and verify standard parameter values for healthy individuals</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-500">
                      {Object.keys(ORGAN_MODELS).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Organ Systems</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Organ Selection */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Organs</CardTitle>
                  <CardDescription>Select an organ system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search parameters..."
                      value={baselinesSearch}
                      onChange={(e) => setBaselinesSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-1">
                      {Object.entries(ORGAN_MODELS).map(([organId, organ]) => {
                        const Icon = ORGAN_ICONS[organId] || ORGAN_ICONS.default;
                        const paramCount = SCALE_LEVELS.reduce((total, scale) => {
                          return total + (organ[scale.id]?.parameters?.length || 0);
                        }, 0);
                        
                        return (
                          <Button
                            key={organId}
                            variant={baselinesOrgan === organId ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-auto py-2 px-2"
                            onClick={() => { setBaselinesOrgan(organId); setBaselinesScale(null); }}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            <div className="flex-1 text-left">
                              <div className="font-medium">{organ.name}</div>
                              <div className="text-xs text-muted-foreground">{paramCount} parameters</div>
                            </div>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Parameters View */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {ORGAN_MODELS[baselinesOrgan]?.name || 'Select Organ'}
                        <Badge variant="outline" className="text-xs">{baselinesOrgan}</Badge>
                      </CardTitle>
                      <CardDescription>Standard physiological values</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Scale Tabs */}
                  <div className="flex flex-wrap gap-1 mb-4 border-b pb-2">
                    {SCALE_LEVELS.map((scale) => {
                      const hasData = ORGAN_MODELS[baselinesOrgan]?.[scale.id];
                      if (!hasData) return null;
                      
                      const paramCount = hasData.parameters?.length || 0;
                      
                      return (
                        <Button
                          key={scale.id}
                          variant={baselinesScale === scale.id ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => setBaselinesScale(baselinesScale === scale.id ? null : scale.id)}
                        >
                          <span className="mr-1">{scale.icon}</span>
                          {scale.name}
                          <Badge variant="outline" className="ml-1 text-[10px]">{paramCount}</Badge>
                        </Button>
                      );
                    })}
                  </div>

                  {/* Parameters Grid */}
                  <ScrollArea className="h-[500px]">
                    {!baselinesScale ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select a scale to view parameters</p>
                        <p className="text-sm mt-2">Choose from Geometry, Pressures, ECG, etc.</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <span>{SCALE_LEVELS.find(s => s.id === baselinesScale)?.icon}</span>
                            {SCALE_LEVELS.find(s => s.id === baselinesScale)?.fullName}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {filteredBaselinesParams.length} parameters
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {filteredBaselinesParams.map(param => (
                            <div
                              key={param.id}
                              className="p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary/50 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 relative group"
                              onClick={() => {
                                setChangeTarget({
                                  type: 'baseline',
                                  organId: baselinesOrgan,
                                  scaleId: baselinesScale,
                                  paramId: param.id,
                                  paramName: param.name,
                                  currentValue: param.value,
                                  currentUnit: param.unit,
                                  isBaseline: true
                                });
                                setChangeRequest({
                                  proposedValue: '',
                                  sourceUrl: '',
                                  reasoning: '',
                                  notes: ''
                                });
                                setShowChangeDialog(true);
                              }}
                            >
                              {/* Click hint */}
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Click to suggest change
                              </div>
                              
                              {/* Status indicator */}
                              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-500" />
                              
                              <span className="text-sm font-medium text-foreground mb-2 block">{param.name}</span>
                              
                              <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-2xl font-bold text-green-500">
                                  {typeof param.value === 'number' ? param.value.toFixed(param.value % 1 === 0 ? 0 : 1) : param.value}
                                </span>
                                <span className="text-sm text-muted-foreground">{param.unit}</span>
                              </div>
                              
                              <p className="text-xs text-muted-foreground mt-1">
                                Range: {param.range?.[0]} - {param.range?.[1]} {param.unit}
                              </p>
                              
                              <div className="flex items-center gap-1 mt-2">
                                <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-600">
                                  {param.evidence || 'Established'}
                                </Badge>
                                {param.source && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {param.source}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Equations section */}
                        {ORGAN_MODELS[baselinesOrgan]?.[baselinesScale]?.equations?.length > 0 && (
                          <div className="mt-6 pt-4 border-t">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Calculator className="w-4 h-4" />
                              Mathematical Equations
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {ORGAN_MODELS[baselinesOrgan][baselinesScale].equations.map(eq => (
                                <div key={eq.id} className="p-3 bg-muted/30 rounded-lg border">
                                  <p className="font-medium text-sm">{eq.name}</p>
                                  <div className="font-mono text-xs bg-background p-2 rounded mt-2 overflow-x-auto">
                                    {eq.latex}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">{eq.description}</p>
                                  <Badge variant={eq.evidence === 'established' ? 'default' : 'secondary'} className="text-[10px] mt-2">
                                    {eq.evidence} • {eq.source}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Diseases View */}
        {activeView === 'diseases' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  <div className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" />
                    Loading diseases...
                  </div>
                ) : filteredDiseases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="mb-2">{diseases.length === 0 ? 'No diseases loaded' : 'No matching diseases'}</p>
                    {diseases.length === 0 && (
                      <Button size="sm" variant="outline" onClick={fetchDiseases}>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
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
                
                {/* Mobile scroll hint */}
                {selectedDisease && (
                  <div className="lg:hidden mt-3 p-2 bg-primary/10 rounded-lg text-center animate-pulse">
                    <p className="text-xs text-primary font-medium">
                      ↓ Scroll down to view {selectedDisease.name} parameters
                    </p>
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
                  {/* Disease Info & Clinical Summary */}
                  {diseaseData?.comprehensive_model?.clinicalPresentation && (
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-primary" />
                        Clinical Presentation
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {/* Symptoms */}
                        {diseaseData.comprehensive_model.clinicalPresentation.symptoms?.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Symptoms</p>
                            <div className="flex flex-wrap gap-1">
                              {diseaseData.comprehensive_model.clinicalPresentation.symptoms.slice(0, 6).map((s, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {typeof s === 'object' ? s.name : s}
                                </Badge>
                              ))}
                              {diseaseData.comprehensive_model.clinicalPresentation.symptoms.length > 6 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{diseaseData.comprehensive_model.clinicalPresentation.symptoms.length - 6} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        {/* Signs */}
                        {diseaseData.comprehensive_model.clinicalPresentation.signs?.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Signs</p>
                            <div className="flex flex-wrap gap-1">
                              {diseaseData.comprehensive_model.clinicalPresentation.signs.slice(0, 6).map((s, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-blue-500/10">
                                  {typeof s === 'object' ? s.name : s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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
                          onClick={() => { 
                            setSelectedOrgan(organId); 
                            // Auto-select first scale with modifications, or first available scale
                            const organModel = ORGAN_MODELS[organId];
                            const organMods = getMergedModifications[organId] || {};
                            const firstModifiedScale = SCALE_LEVELS.find(s => organModel?.[s.id] && organMods[s.id]);
                            const firstAvailableScale = SCALE_LEVELS.find(s => organModel?.[s.id]);
                            setSelectedScale(firstModifiedScale?.id || firstAvailableScale?.id || null);
                          }}
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
                  <ScrollArea className="h-[500px]">
                    {selectedScale && currentScale ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <span>{SCALE_LEVELS.find(s => s.id === selectedScale)?.icon}</span>
                            {SCALE_LEVELS.find(s => s.id === selectedScale)?.fullName || selectedScale}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {currentScale.parameters?.length || 0} parameters
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Click any to review
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 mb-4 p-2 bg-muted/30 rounded-lg text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50"></div>
                            <span>Normal baseline</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive/50"></div>
                            <span>Disease modified</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[9px] px-1 py-0">AI</Badge>
                            <span>AI-generated source</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {currentScale.parameters?.map(param => {
                          const mods = getMergedModifications[selectedOrgan]?.[selectedScale]?.[param.id];
                          const modResult = getModifiedValue(param.value, mods, param.id);
                          const isModified = modResult.modified;
                          
                          return (
                            <div
                              key={param.id}
                              className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary/50 relative overflow-hidden group ${
                                isModified 
                                  ? 'bg-gradient-to-br from-destructive/10 to-orange-500/10 border-destructive/30' 
                                  : 'bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20'
                              }`}
                              onClick={() => handleEditParameter(param, selectedOrgan, selectedScale)}
                            >
                              {/* Click hint overlay */}
                              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100">
                                  Click to review/suggest change
                                </div>
                              </div>
                              
                              {/* Status indicator stripe */}
                              <div className={`absolute top-0 left-0 w-1 h-full ${
                                isModified 
                                  ? 'bg-gradient-to-b from-destructive to-orange-500' 
                                  : 'bg-gradient-to-b from-green-500 to-emerald-500'
                              }`} />
                              
                              <div className="flex items-start justify-between mb-2">
                                <span className={`text-sm leading-tight font-medium ${isModified ? 'text-destructive' : 'text-foreground'}`}>
                                  {param.name}
                                </span>
                                <div className="flex items-center gap-1">
                                  {modResult.isAbsent && (
                                    <Badge variant="destructive" className="text-[10px] shrink-0 bg-purple-600/80">
                                      Absent
                                    </Badge>
                                  )}
                                  {isModified && !modResult.isAbsent && (
                                    <Badge variant="destructive" className="text-[10px] shrink-0">
                                      <AlertTriangle className="w-2 h-2 mr-1" />
                                      Modified
                                    </Badge>
                                  )}
                                  {!isModified && (
                                    <Badge variant="outline" className="text-[10px] shrink-0 border-green-500/50 text-green-600">
                                      Baseline
                                    </Badge>
                                  )}
                                  <FileEdit className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                              </div>
                              
                              {/* Values */}
                              <div className="flex items-baseline gap-2 flex-wrap mb-2">
                                {isModified && !modResult.isAbsent && (
                                  <span className="text-base font-mono text-muted-foreground/60 line-through">
                                    {param.value}
                                  </span>
                                )}
                                <span className={`text-2xl font-mono font-bold ${
                                  modResult.isAbsent ? 'text-purple-500' :
                                  isModified ? 'text-destructive' : 'text-green-600'
                                }`}>
                                  {modResult.isAbsent ? 'ABSENT' :
                                   typeof modResult.value === 'number' 
                                    ? modResult.value.toFixed(param.value % 1 === 0 ? 0 : 1)
                                    : modResult.value}
                                </span>
                                {!modResult.isAbsent && (
                                  <span className="text-sm text-muted-foreground">{param.unit}</span>
                                )}
                              </div>
                              
                              {/* Normal Range */}
                              {param.range && (
                                <div className="text-[10px] text-muted-foreground mb-1">
                                  Normal range: {param.range[0]} - {param.range[1]} {param.unit}
                                </div>
                              )}
                              
                              {/* Change indicator */}
                              {isModified && modResult.delta && !modResult.isAbsent && (
                                <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                                  parseFloat(modResult.delta) > 0 
                                    ? 'bg-destructive/20 text-destructive' 
                                    : 'bg-blue-500/20 text-blue-500'
                                }`}>
                                  {parseFloat(modResult.delta) > 0 ? '↑' : '↓'}{Math.abs(parseFloat(modResult.delta))}% from baseline
                                </div>
                              )}
                              
                              {/* Source/Evidence */}
                              <div className="mt-2 pt-2 border-t border-border/30">
                                <div className="flex items-center gap-1 text-[10px]">
                                  {param.evidence === 'established' ? (
                                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-green-500/50 text-green-600">
                                      Established
                                    </Badge>
                                  ) : param.evidence === 'novel' ? (
                                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-blue-500/50 text-blue-600">
                                      Novel
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                                      AI
                                    </Badge>
                                  )}
                                  <span className="text-muted-foreground truncate">
                                    {param.source || (selectedDisease && diseaseData?.guideline_source) || 'PhiCor AI Model'}
                                  </span>
                                </div>
                                {mods?.note && (
                                  <p className="text-[10px] text-muted-foreground mt-1 italic line-clamp-1">
                                    Note: {mods.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Mathematical Equations Section */}
                      {currentScale.equations && currentScale.equations.length > 0 && (
                        <div className="mt-6 pt-4 border-t">
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-primary" />
                            Mathematical Equations
                          </h4>
                          <div className="space-y-3">
                            {currentScale.equations.map(eq => (
                              <div 
                                key={eq.id} 
                                className="p-3 bg-muted/30 rounded-lg border cursor-pointer hover:border-primary/50"
                                onClick={() => handleEditParameter({...eq, isEquation: true, value: eq.latex}, selectedOrgan, selectedScale)}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <span className="font-medium text-sm">{eq.name}</span>
                                  <div className="flex items-center gap-1">
                                    {eq.evidence === 'established' ? (
                                      <Badge variant="outline" className="text-[9px] px-1 border-green-500/50 text-green-600">
                                        Established
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[9px] px-1 border-blue-500/50 text-blue-600">
                                        Novel
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="font-mono text-xs bg-background/50 p-2 rounded overflow-x-auto">
                                  {eq.latex}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">{eq.description}</p>
                                {eq.source && (
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    Source: {eq.source}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-base font-medium mb-2">Select a Scale Above</p>
                        <p className="text-sm mb-4">Tap any scale tab (Lab Tests, ECG, Vitals, etc.) to view parameters</p>
                        
                        {/* Quick access buttons for scales with modifications */}
                        {selectedOrgan && getMergedModifications[selectedOrgan] && (
                          <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                            <p className="text-xs font-medium text-destructive mb-2">⚡ Quick Access - Modified Scales:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {SCALE_LEVELS.filter(s => 
                                currentOrganModel?.[s.id] && getMergedModifications[selectedOrgan]?.[s.id]
                              ).map(scale => (
                                <Button
                                  key={scale.id}
                                  size="sm"
                                  variant="outline"
                                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                                  onClick={() => setSelectedScale(scale.id)}
                                >
                                  {scale.icon} {scale.name}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg text-left max-w-sm mx-auto">
                          <p className="text-xs font-medium mb-2">As an expert, you can review:</p>
                          <ul className="text-xs space-y-1">
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Normal baseline parameters
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-destructive"></div>
                              Disease-modified values
                            </li>
                          </ul>
                        </div>
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
        )}

        {/* Changes View */}
        {activeView === 'changes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Changes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Pending Review
                  </CardTitle>
                  <CardDescription>Changes awaiting approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {pendingChanges.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No pending changes</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingChanges.map(change => (
                          <Card key={change.id} className={`border-l-4 ${change.expert_id === expert?.id ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-medium">{change.disease_name}</p>
                                  <p className="text-sm text-muted-foreground">{change.organ_id} / {change.scale_id}</p>
                                  <p className="text-xs text-muted-foreground">
                                    by {change.expert_name}
                                    {change.expert_id === expert?.id && <Badge variant="outline" className="ml-2 text-xs">You</Badge>}
                                  </p>
                                </div>
                              </div>
                              <div className="p-2 bg-muted rounded text-sm mb-3">
                                {change.parameters?.map((p, i) => (
                                  <div key={i} className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs">{p.parameter_name}:</span>
                                    <span className="text-red-500 line-through">{p.current_value}</span>
                                    <ArrowRight className="w-3 h-3" />
                                    <span className="text-green-500 font-medium">{p.proposed_value}</span>
                                  </div>
                                ))}
                                {change.additional_notes && (
                                  <p className="text-xs text-muted-foreground mt-2 italic">Note: {change.additional_notes}</p>
                                )}
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {/* Admin actions */}
                                {isAdmin && (
                                  <>
                                    <Button size="sm" onClick={() => handleApproveChange(change.id)}>
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleRejectChange(change.id)}>
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {/* Owner actions - Edit & Withdraw */}
                                {change.expert_id === expert?.id && (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => handleEditChange(change)}>
                                      <Pencil className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleWithdrawChange(change.id)}>
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Withdraw
                                    </Button>
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    History
                  </CardTitle>
                  <CardDescription>Past change requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {historyChanges.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No history yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {historyChanges.map(change => (
                          <div 
                            key={change.id} 
                            className={`p-3 rounded-lg border-l-4 ${
                              change.status === 'approved' ? 'border-l-green-500 bg-green-500/5' : 'border-l-red-500 bg-red-500/5'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {change.status === 'approved' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className="font-medium text-sm">{change.disease_name}</span>
                              <Badge variant={change.status === 'approved' ? 'default' : 'destructive'} className="text-xs">
                                {change.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {change.expert_name} • {new Date(change.reviewed_at || change.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* References View - Tests, Guidelines, Protocols, etc. */}
        {activeView === 'references' && (
          <div className="space-y-6">
            {/* Header */}
            <Card className="border-purple-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileJson className="w-5 h-5 text-purple-500" />
                      Reference Items
                    </CardTitle>
                    <CardDescription>Lab tests, scoring systems, guidelines, and treatment protocols</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-500">
                      {filteredReferences.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Reference Items</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reference List */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Items</CardTitle>
                  <CardDescription>Tests, scores, and protocols</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search references..."
                      value={referencesSearch}
                      onChange={(e) => setReferencesSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-1">
                      {filteredReferences.map(ref => (
                        <Button
                          key={ref.id}
                          variant={selectedReference?.id === ref.id ? 'secondary' : 'ghost'}
                          className="w-full justify-start h-auto py-2 px-2 text-left"
                          onClick={() => setSelectedReference(ref)}
                        >
                          <div className="flex items-center w-full min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{ref.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {ref.category || 'General'}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Reference Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{selectedReference ? selectedReference.name : 'Select a Reference'}</CardTitle>
                  <CardDescription>
                    {selectedReference ? `Category: ${selectedReference.category || 'General'}` : 'Choose an item to view details'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedReference ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <FileJson className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a reference item to view details</p>
                      <p className="text-sm mt-2">Browse lab tests, scoring systems, and protocols</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {/* Basic Info */}
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="text-sm font-semibold mb-2">Information</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Category</p>
                              <p className="font-medium">{selectedReference.category || 'General'}</p>
                            </div>
                            {selectedReference.icd10 && (
                              <div>
                                <p className="text-xs text-muted-foreground">ICD-10</p>
                                <p className="font-medium">{selectedReference.icd10}</p>
                              </div>
                            )}
                          </div>
                          {selectedReference.description && (
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground">Description</p>
                              <p className="text-sm mt-1">{selectedReference.description}</p>
                            </div>
                          )}
                        </div>

                        {/* Clinical Presentation if available */}
                        {selectedReference.clinical_presentation && (
                          <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-purple-500" />
                              Clinical Details
                            </h4>
                            <div className="text-sm space-y-2">
                              {selectedReference.clinical_presentation.interpretation && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Interpretation</p>
                                  <p>{selectedReference.clinical_presentation.interpretation}</p>
                                </div>
                              )}
                              {selectedReference.clinical_presentation.clinical_significance && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Clinical Significance</p>
                                  <p>{selectedReference.clinical_presentation.clinical_significance}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Source Info */}
                        {selectedReference.guideline_source && (
                          <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-blue-500" />
                              Source
                            </h4>
                            <p className="text-sm">{selectedReference.guideline_source}</p>
                          </div>
                        )}

                        {/* Suggest Edit Button */}
                        <Button 
                          className="w-full"
                          variant="outline"
                          onClick={() => {
                            setChangeTarget({
                              type: 'reference',
                              referenceId: selectedReference.id,
                              referenceName: selectedReference.name,
                            });
                            setChangeRequest({
                              proposedValue: '',
                              sourceUrl: '',
                              reasoning: '',
                              notes: ''
                            });
                            setShowChangeDialog(true);
                          }}
                        >
                          <FileEdit className="w-4 h-4 mr-2" />
                          Suggest Changes to This Reference
                        </Button>
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Guidelines View */}
        {activeView === 'guidelines' && (
          <div className="space-y-6">
            <Card className="border-blue-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      AI Guideline Monitoring
                    </CardTitle>
                    <CardDescription>Automatic detection of medical guideline updates</CardDescription>
                  </div>
                  <Button onClick={handleCheckGuidelines} disabled={checkingGuidelines}>
                    {checkingGuidelines ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Check for Updates
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {guidelineNotifications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No Guideline Updates</p>
                      <p className="text-sm">Click &quot;Check for Updates&quot; to scan for new medical guidelines</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {guidelineNotifications.map(notification => (
                        <Card key={notification.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{notification.guideline_source}</Badge>
                              <Badge variant={notification.status === 'pending' ? 'secondary' : 'default'}>
                                {notification.status}
                              </Badge>
                            </div>
                            <p className="font-medium">{notification.disease_name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{notification.summary}</p>
                            {notification.url && (
                              <a href={notification.url} target="_blank" rel="noopener noreferrer" 
                                 className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-2">
                                <ExternalLink className="w-3 h-3" />
                                View Source
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lab View */}
        {activeView === 'lab' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Experiments List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">My Experiments</CardTitle>
                  <Button size="sm" onClick={() => setShowNewExperiment(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {experiments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Beaker className="w-8 h-8 text-purple-500" />
                      </div>
                      <p className="font-medium mb-1">No experiments yet</p>
                      <p className="text-sm mb-4">Create your first virtual patient test</p>
                      <Button size="sm" onClick={() => setShowNewExperiment(true)} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-1" />
                        Create Experiment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {experiments.map(exp => (
                        <div
                          key={exp.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedExperiment?.id === exp.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedExperiment(exp)}
                        >
                          <p className="font-medium">{exp.name}</p>
                          <p className="text-sm text-muted-foreground">{exp.test_diseases?.length || 0} diseases</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Experiment Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{selectedExperiment ? selectedExperiment.name : 'Select an Experiment'}</CardTitle>
                <CardDescription>
                  {selectedExperiment ? selectedExperiment.description || 'No description' : 'Choose an experiment to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedExperiment ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Beaker className="w-10 h-10 text-purple-500" />
                    </div>
                    <p className="text-lg font-medium mb-2">No Experiment Selected</p>
                    <p className="text-sm mb-6">Select an experiment or create a new one</p>
                    <Button onClick={() => setShowNewExperiment(true)} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Experiment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Patient</p>
                        <p className="font-medium">{selectedExperiment.patient?.name || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-medium">{selectedExperiment.patient?.age || 'N/A'} years</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Sex</p>
                        <p className="font-medium">{selectedExperiment.patient?.sex || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Diseases</p>
                        <p className="font-medium">{selectedExperiment.test_diseases?.length || 0}</p>
                      </div>
                    </div>
                    {selectedExperiment.results && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Results</p>
                        <pre className="text-xs overflow-auto">{JSON.stringify(selectedExperiment.results, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Equations Browser View - Mathematical Models */}
        {activeView === 'equations' && (
          <div className="space-y-6">
            {/* Header with Stats */}
            <Card className="border-orange-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-orange-500" />
                      Mathematical Models & Equations
                    </CardTitle>
                    <CardDescription>
                      Browse, review, and validate all mathematical equations used in PhiCor's physiological modeling
                    </CardDescription>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div className="px-4 py-2 bg-orange-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-orange-500">{platformStats.models}+</p>
                      <p className="text-xs text-muted-foreground">Equations</p>
                    </div>
                    <div className="px-4 py-2 bg-purple-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-purple-500">{platformStats.organ_systems}</p>
                      <p className="text-xs text-muted-foreground">Organ Systems</p>
                    </div>
                    <div className="px-4 py-2 bg-blue-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-blue-500">{platformStats.diseases}</p>
                      <p className="text-xs text-muted-foreground">Diseases</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search equations by name, formula, or description..."
                  value={equationsSearch}
                  onChange={(e) => setEquationsSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={equationsOrgan}
                onChange={(e) => setEquationsOrgan(e.target.value)}
                className="px-3 py-2 rounded-md border bg-background text-sm"
              >
                <option value="all">All Organ Systems</option>
                {Object.keys(ORGAN_MODELS).map(organ => (
                  <option key={organ} value={organ}>{ORGAN_MODELS[organ].name}</option>
                ))}
              </select>
              <select
                value={equationsCategory}
                onChange={(e) => setEquationsCategory(e.target.value)}
                className="px-3 py-2 rounded-md border bg-background text-sm"
              >
                <option value="all">All Categories</option>
                {SCALE_LEVELS.map(scale => (
                  <option key={scale.id} value={scale.id}>{scale.fullName}</option>
                ))}
              </select>
            </div>

            {/* Equations by Organ System */}
            <div className="grid gap-6">
              {Object.entries(ORGAN_MODELS)
                .filter(([key]) => equationsOrgan === 'all' || key === equationsOrgan)
                .map(([organKey, organ]) => {
                  // Collect all equations from all scales in this organ
                  const allEquations = [];
                  SCALE_LEVELS.forEach(scale => {
                    const scaleData = organ[scale.id];
                    if (scaleData?.equations) {
                      scaleData.equations.forEach(eq => {
                        if (equationsCategory === 'all' || equationsCategory === scale.id) {
                          if (!equationsSearch || 
                              eq.name?.toLowerCase().includes(equationsSearch.toLowerCase()) ||
                              eq.latex?.toLowerCase().includes(equationsSearch.toLowerCase()) ||
                              eq.description?.toLowerCase().includes(equationsSearch.toLowerCase())) {
                            allEquations.push({ ...eq, scale: scale.id, scaleName: scale.fullName });
                          }
                        }
                      });
                    }
                  });

                  if (allEquations.length === 0) return null;

                  return (
                    <Card key={organKey} className="overflow-hidden">
                      <Collapsible key={`${organKey}-${equationsOrgan}`} defaultOpen={equationsOrgan !== 'all' || allEquations.length <= 10}>
                        <CollapsibleTrigger className="w-full">
                          <CardHeader className="flex flex-row items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{organ.icon}</span>
                              <div className="text-left">
                                <CardTitle className="text-lg">{organ.name}</CardTitle>
                                <CardDescription>{organ.category}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-orange-500 border-orange-500/50">
                                {allEquations.length} equations
                              </Badge>
                              <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform" />
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-4">
                            <div className="space-y-4">
                              {allEquations.map((eq, idx) => (
                                <div 
                                  key={`${eq.id}-${idx}`}
                                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                                    selectedEquation?.id === eq.id 
                                      ? 'border-orange-500 bg-orange-500/5' 
                                      : 'border-border hover:border-orange-500/50 hover:bg-muted/30'
                                  }`}
                                  onClick={() => setSelectedEquation(selectedEquation?.id === eq.id ? null : eq)}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold">{eq.name}</h4>
                                        <Badge variant="secondary" className="text-xs">{eq.scaleName}</Badge>
                                        {eq.evidence && (
                                          <Badge 
                                            variant={eq.evidence === 'established' ? 'default' : eq.evidence === 'novel' ? 'secondary' : 'outline'}
                                            className={`text-xs ${
                                              eq.evidence === 'established' ? 'bg-green-500/20 text-green-500' :
                                              eq.evidence === 'novel' ? 'bg-purple-500/20 text-purple-500' :
                                              'bg-yellow-500/20 text-yellow-500'
                                            }`}
                                          >
                                            {eq.evidence}
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      {/* LaTeX Formula */}
                                      <div className="font-mono text-sm bg-muted/50 p-3 rounded-lg mb-2 overflow-x-auto">
                                        <code className="text-orange-400">{eq.latex}</code>
                                      </div>
                                      
                                      <p className="text-sm text-muted-foreground">{eq.description}</p>
                                      
                                      {eq.source && (
                                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                          <ExternalLink className="w-3 h-3" />
                                          Source: {eq.source}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedEquation(eq);
                                          setEquationReview({ status: 'approved', notes: '', source_verification: '' });
                                        }}
                                      >
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        Review
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Expanded view with review options */}
                                  {selectedEquation?.id === eq.id && (
                                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm">Review Status</Label>
                                          <select
                                            value={equationReview.status}
                                            onChange={(e) => setEquationReview({...equationReview, status: e.target.value})}
                                            className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm"
                                          >
                                            <option value="approved">✓ Approved - Verified correct</option>
                                            <option value="needs_revision">⚠ Needs Revision</option>
                                            <option value="suggest_change">📝 Suggest Change</option>
                                            <option value="flag_for_review">🚩 Flag for Expert Review</option>
                                          </select>
                                        </div>
                                        <div>
                                          <Label className="text-sm">Source Verification</Label>
                                          <Input
                                            placeholder="Link to source or reference..."
                                            value={equationReview.source_verification}
                                            onChange={(e) => setEquationReview({...equationReview, source_verification: e.target.value})}
                                            className="mt-1"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm">Notes / Suggested Changes</Label>
                                        <Textarea
                                          placeholder="Add your review notes, corrections, or suggestions..."
                                          value={equationReview.notes}
                                          onChange={(e) => setEquationReview({...equationReview, notes: e.target.value})}
                                          className="mt-1"
                                          rows={3}
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => {
                                            setSelectedEquation(null);
                                            setEquationReview({ status: '', notes: '', source_verification: '' });
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button 
                                          size="sm"
                                          onClick={() => {
                                            alert(`Review submitted for: ${eq.name}\nStatus: ${equationReview.status}\nNotes: ${equationReview.notes}`);
                                            setSelectedEquation(null);
                                            setEquationReview({ status: '', notes: '', source_verification: '' });
                                          }}
                                        >
                                          <Save className="w-4 h-4 mr-1" />
                                          Submit Review
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  );
                })}
            </div>

            {/* Summary Stats */}
            <Card className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border-orange-500/20">
              <CardContent className="py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-orange-500">{platformStats.models}+</p>
                    <p className="text-sm text-muted-foreground">Total Equations</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-500">{Object.keys(ORGAN_MODELS).length}</p>
                    <p className="text-sm text-muted-foreground">Organ Systems</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-500">{SCALE_LEVELS.length}</p>
                    <p className="text-sm text-muted-foreground">Scale Categories</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-500">{platformStats.diseases}</p>
                    <p className="text-sm text-muted-foreground">Disease Profiles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Knowledge Bank View - Admin Only */}
        {activeView === 'knowledge' && isAdmin && (
          <KnowledgeBankView
            knowledgeSources={knowledgeSources}
            knowledgeSuggestions={knowledgeSuggestions}
            knowledgeTimeline={knowledgeTimeline}
            systemSettings={systemSettings}
            setSystemSettings={setSystemSettings}
            showUploadDialog={showUploadDialog}
            setShowUploadDialog={setShowUploadDialog}
            uploadForm={uploadForm}
            setUploadForm={setUploadForm}
            uploadFile={uploadFile}
            setUploadFile={setUploadFile}
            uploading={uploading}
            triggeringSearch={triggeringSearch}
            onUpload={handleUploadKnowledge}
            onTriggerAutoSearch={handleTriggerAutoSearch}
            onApproveSuggestion={handleApproveKnowledgeSuggestion}
            onRejectSuggestion={handleRejectKnowledgeSuggestion}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {/* Users Management View - Admin Only */}
        {activeView === 'users' && isAdmin && (
          <UserManagementView
            experts={allExperts}
            currentUserId={expert?.id}
            onCreateExpert={handleCreateExpert}
            onUpdateExpert={handleUpdateExpert}
            onDeleteExpert={handleDeleteExpert}
            onResetPassword={handleResetPassword}
          />
        )}
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

      {/* Edit Change Request Dialog */}
      <Dialog open={!!editingChange} onOpenChange={(open) => !open && setEditingChange(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Edit Change Request
            </DialogTitle>
            <DialogDescription>
              Update your pending change request before it's reviewed
            </DialogDescription>
          </DialogHeader>
          
          {editingChange && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{editingChange.disease_name}</p>
                <p className="text-sm text-muted-foreground">{editingChange.organ_id} / {editingChange.scale_id}</p>
              </div>
              
              {/* Edit each parameter */}
              {editFormData.parameters?.map((param, index) => (
                <Card key={index} className="p-3">
                  <p className="font-medium text-sm mb-2">{param.parameter_name}</p>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Current Value</Label>
                      <p className="text-sm font-mono text-muted-foreground">{param.current_value}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Proposed Value</Label>
                      <Input
                        value={param.proposed_value || ''}
                        onChange={(e) => updateEditParameter(index, 'proposed_value', e.target.value)}
                        placeholder="Enter new value"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Source URL</Label>
                      <Input
                        value={param.source_url || ''}
                        onChange={(e) => updateEditParameter(index, 'source_url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Reasoning</Label>
                      <Textarea
                        value={param.reasoning || ''}
                        onChange={(e) => updateEditParameter(index, 'reasoning', e.target.value)}
                        placeholder="Clinical reasoning..."
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
              
              <div className="space-y-2">
                <Label>
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  Additional Notes
                </Label>
                <Textarea
                  value={editFormData.additional_notes || ''}
                  onChange={(e) => setEditFormData({...editFormData, additional_notes: e.target.value})}
                  placeholder="Any additional context..."
                  rows={2}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingChange(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
