import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useTheme } from '../context/ThemeContext';
import { useExpert } from '../context/ExpertContext';
import { 
  Calculator, Activity, Heart, Brain, Beaker, FlaskConical, Dna,
  CheckCircle2, XCircle, Clock, Search, Filter, Eye, Edit3, 
  MessageSquare, ExternalLink, ChevronRight, ArrowLeft, RefreshCw,
  Plus, FileText, Link2, AlertTriangle, Sparkles, Shield, Send,
  BookOpen, Target, Zap, Database, GitBranch
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Organ system icons
const ORGAN_ICONS = {
  cardiovascular: Heart,
  heart: Heart,
  respiratory: Activity,
  lungs: Activity,
  renal: FlaskConical,
  kidneys: FlaskConical,
  hepatic: Beaker,
  liver: Beaker,
  neurological: Brain,
  brain: Brain,
  metabolic: Dna,
  endocrine: Dna,
  hematological: Activity,
  blood: Activity,
  default: Calculator
};

export default function MathModelsAdmin() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { expert, token, isSuperAdmin } = useExpert();
  
  const [activeTab, setActiveTab] = useState('all-models');
  const [models, setModels] = useState([]);
  const [novelModels, setNovelModels] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [organFilter, setOrganFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog states
  const [selectedModel, setSelectedModel] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  
  // Review form state
  const [reviewData, setReviewData] = useState({
    status: 'validated',
    notes: '',
    source: '',
    modifications: ''
  });
  
  // Suggestion form state
  const [suggestionData, setSuggestionData] = useState({
    suggestion_type: 'modification',
    description: '',
    rationale: '',
    source_url: '',
    additional_notes: ''
  });
  
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    total_models: 0,
    validated: 0,
    pending_review: 0,
    novel_models: 0,
    by_organ: {}
  });

  // Fetch all mathematical models
  const fetchModels = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/mathematical-models?limit=500`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error('Error fetching models:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch novel/experimental models
  const fetchNovelModels = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/mathematical-models/novel`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNovelModels(data.models || []);
      }
    } catch (err) {
      console.error('Error fetching novel models:', err);
    }
  }, [token]);

  // Fetch pending reviews
  const fetchPendingReviews = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/mathematical-models/pending-reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching pending reviews:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchModels();
      fetchNovelModels();
      fetchPendingReviews();
    }
  }, [token, fetchModels, fetchNovelModels, fetchPendingReviews]);

  // Submit review/validation
  const handleSubmitReview = async () => {
    if (!selectedModel) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/mathematical-models/${selectedModel.id}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });
      
      if (response.ok) {
        setShowReviewDialog(false);
        setSelectedModel(null);
        fetchModels();
        fetchPendingReviews();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Submit suggestion
  const handleSubmitSuggestion = async () => {
    if (!selectedModel) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/mathematical-models/${selectedModel.id}/suggest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(suggestionData)
      });
      
      if (response.ok) {
        setShowSuggestionDialog(false);
        setSelectedModel(null);
        setSuggestionData({
          suggestion_type: 'modification',
          description: '',
          rationale: '',
          source_url: '',
          additional_notes: ''
        });
        fetchPendingReviews();
      }
    } catch (err) {
      console.error('Error submitting suggestion:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Filter models
  const filteredModels = models.filter(model => {
    const matchesSearch = 
      model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.disease_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.equation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrgan = organFilter === 'all' || model.organ_system === organFilter;
    const matchesStatus = statusFilter === 'all' || model.validation_status === statusFilter;
    
    return matchesSearch && matchesOrgan && matchesStatus;
  });

  // Get unique organ systems for filter
  const organSystems = [...new Set(models.map(m => m.organ_system).filter(Boolean))];

  const getOrganIcon = (organ) => {
    const Icon = ORGAN_ICONS[organ?.toLowerCase()] || ORGAN_ICONS.default;
    return <Icon className="w-4 h-4" />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle2 className="w-3 h-3 mr-1" />Validated</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unreviewed</Badge>;
    }
  };

  if (!token) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <p className={isDark ? 'text-white' : ''}>Please log in to access this page</p>
            <Button onClick={() => navigate('/expert-login')} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 border-b ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Mathematical Models
                  </h1>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Review, validate & manage clinical equations
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => { fetchModels(); fetchNovelModels(); fetchPendingReviews(); }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              {isSuperAdmin && (
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-indigo-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Novel Model
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.total_models?.toLocaleString() || 0}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Models</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.validated || 0}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Validated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.pending_review || 0}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {novelModels.length || 0}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Novel/Experimental</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <TabsTrigger value="all-models">
              <Calculator className="w-4 h-4 mr-2" />
              All Models ({models.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="w-4 h-4 mr-2" />
              Pending Reviews ({pendingReviews.length})
            </TabsTrigger>
            <TabsTrigger value="novel">
              <Sparkles className="w-4 h-4 mr-2" />
              Novel/Experimental ({novelModels.length})
            </TabsTrigger>
          </TabsList>

          {/* All Models Tab */}
          <TabsContent value="all-models">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <Input 
                    placeholder="Search models, diseases, equations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                  />
                </div>
              </div>
              
              <Select value={organFilter} onValueChange={setOrganFilter}>
                <SelectTrigger className={`w-[180px] ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
                  <SelectValue placeholder="Organ System" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organs</SelectItem>
                  {organSystems.map(organ => (
                    <SelectItem key={organ} value={organ}>{organ}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={`w-[150px] ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unreviewed">Unreviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Models List */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-3">
                  {loading ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-500" />
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading models...</p>
                    </div>
                  ) : filteredModels.length === 0 ? (
                    <div className="text-center py-12">
                      <Calculator className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No models found</p>
                    </div>
                  ) : (
                    filteredModels.map((model, idx) => (
                      <div 
                        key={model.id || idx}
                        className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                          isDark ? 'bg-gray-700/50 border-gray-600 hover:border-purple-500/50' : 'bg-white border-gray-200 hover:border-purple-300'
                        }`}
                        onClick={() => { setSelectedModel(model); setShowDetailDialog(true); }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isDark ? 'bg-purple-900/30' : 'bg-purple-100'
                            }`}>
                              {getOrganIcon(model.organ_system)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {model.name}
                              </h4>
                              <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {model.disease_name}
                              </p>
                              {model.equation && (
                                <code className={`text-xs block mt-1 truncate ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                  {model.equation}
                                </code>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(model.validation_status)}
                            <div className="flex items-center gap-1">
                              {model.organ_system && (
                                <Badge variant="outline" className="text-xs">
                                  {model.organ_system}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-gray-600/30">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedModel(model); setShowDetailDialog(true); }}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedModel(model); setShowSuggestionDialog(true); }}>
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Suggest
                          </Button>
                          {(isSuperAdmin || expert?.role === 'admin') && (
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedModel(model); setShowReviewDialog(true); }}>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Pending Reviews Tab */}
          <TabsContent value="pending">
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={isDark ? 'text-white' : ''}>Pending Review Suggestions</CardTitle>
                <CardDescription>Suggestions from experts awaiting super admin approval</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {pendingReviews.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-50" />
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No pending reviews</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingReviews.map((review, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {review.model_name}
                              </h4>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {review.suggestion_type}: {review.description}
                              </p>
                              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                By {review.submitted_by} • {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            {isSuperAdmin && (
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-500 border-red-500">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Novel/Experimental Models Tab */}
          <TabsContent value="novel">
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Novel & Experimental Models
                    </CardTitle>
                    <CardDescription>IP-creating mathematical models for review and validation</CardDescription>
                  </div>
                  {isSuperAdmin && (
                    <Button className="bg-gradient-to-r from-purple-500 to-indigo-500">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Novel Model
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Alert className={`mb-4 ${isDark ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <AlertDescription className={isDark ? 'text-purple-300' : 'text-purple-700'}>
                    Novel models are experimental equations developed for potential IP. They are isolated from the core clinical engine until validated.
                  </AlertDescription>
                </Alert>
                
                <ScrollArea className="h-[400px]">
                  {novelModels.length === 0 ? (
                    <div className="text-center py-12">
                      <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No novel models yet</p>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Novel models will be created in a future phase
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {novelModels.map((model, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border-2 border-dashed ${isDark ? 'border-purple-500/30 bg-purple-900/10' : 'border-purple-200 bg-purple-50/50'}`}>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {model.name}
                              </h4>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {model.description}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge className="bg-purple-500/20 text-purple-400">Experimental</Badge>
                                <Badge variant="outline">v{model.version || '1.0'}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Model Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className={`max-w-2xl ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : ''}>
              {selectedModel?.name}
            </DialogTitle>
            <DialogDescription>
              Mathematical model details and linked information
            </DialogDescription>
          </DialogHeader>
          
          {selectedModel && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Basic Info */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Type:</span>
                    <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedModel.type || 'Clinical Score'}</span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Organ System:</span>
                    <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedModel.organ_system || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Linked Disease:</span>
                    <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedModel.disease_name || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Equation */}
              {selectedModel.equation && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'}`}>
                  <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                    <Calculator className="w-4 h-4" />
                    Equation
                  </h4>
                  <code className={`text-sm block ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {selectedModel.equation}
                  </code>
                </div>
              )}
              
              {/* Variables */}
              {selectedModel.variables && Object.keys(selectedModel.variables).length > 0 && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Variables
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedModel.variables).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{key}</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Clinical Interpretation */}
              {selectedModel.clinical_interpretation && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Clinical Interpretation
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedModel.clinical_interpretation}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
            <Button onClick={() => { setShowDetailDialog(false); setShowSuggestionDialog(true); }}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Suggest Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog (Super Admin) */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : ''}>Review Model</DialogTitle>
            <DialogDescription>Validate or flag this mathematical model</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Validation Status</Label>
              <Select value={reviewData.status} onValueChange={(v) => setReviewData({...reviewData, status: v})}>
                <SelectTrigger className={isDark ? 'bg-gray-700 border-gray-600' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="validated">✓ Validated</SelectItem>
                  <SelectItem value="pending">⏳ Needs More Review</SelectItem>
                  <SelectItem value="rejected">✗ Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Review Notes</Label>
              <Textarea 
                placeholder="Add notes about this model..."
                value={reviewData.notes}
                onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                className={isDark ? 'bg-gray-700 border-gray-600' : ''}
              />
            </div>
            
            <div>
              <Label>Source/Reference</Label>
              <Input 
                placeholder="Link to validation source..."
                value={reviewData.source}
                onChange={(e) => setReviewData({...reviewData, source: e.target.value})}
                className={isDark ? 'bg-gray-700 border-gray-600' : ''}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitReview} disabled={processing}>
              {processing ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suggestion Dialog */}
      <Dialog open={showSuggestionDialog} onOpenChange={setShowSuggestionDialog}>
        <DialogContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : ''}>Suggest Change</DialogTitle>
            <DialogDescription>Submit a suggestion for this model to super admin</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Suggestion Type</Label>
              <Select value={suggestionData.suggestion_type} onValueChange={(v) => setSuggestionData({...suggestionData, suggestion_type: v})}>
                <SelectTrigger className={isDark ? 'bg-gray-700 border-gray-600' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modification">Modification</SelectItem>
                  <SelectItem value="correction">Correction</SelectItem>
                  <SelectItem value="addition">Add Information</SelectItem>
                  <SelectItem value="removal">Remove/Flag Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe your suggestion..."
                value={suggestionData.description}
                onChange={(e) => setSuggestionData({...suggestionData, description: e.target.value})}
                className={isDark ? 'bg-gray-700 border-gray-600' : ''}
              />
            </div>
            
            <div>
              <Label>Rationale</Label>
              <Textarea 
                placeholder="Why is this change needed?"
                value={suggestionData.rationale}
                onChange={(e) => setSuggestionData({...suggestionData, rationale: e.target.value})}
                className={isDark ? 'bg-gray-700 border-gray-600' : ''}
              />
            </div>
            
            <div>
              <Label>Source URL (optional)</Label>
              <Input 
                placeholder="Link to supporting evidence..."
                value={suggestionData.source_url}
                onChange={(e) => setSuggestionData({...suggestionData, source_url: e.target.value})}
                className={isDark ? 'bg-gray-700 border-gray-600' : ''}
              />
            </div>
            
            <div>
              <Label>Additional Notes</Label>
              <Textarea 
                placeholder="Any other relevant information..."
                value={suggestionData.additional_notes}
                onChange={(e) => setSuggestionData({...suggestionData, additional_notes: e.target.value})}
                className={isDark ? 'bg-gray-700 border-gray-600' : ''}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuggestionDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitSuggestion} disabled={processing || !suggestionData.description}>
              <Send className="w-4 h-4 mr-2" />
              {processing ? 'Submitting...' : 'Submit to Super Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
