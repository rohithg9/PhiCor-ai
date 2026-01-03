import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { useExpert } from '../context/ExpertContext';
import { 
  Search, CheckCircle2, Clock, AlertTriangle, FileEdit, 
  LogOut, User, Stethoscope, ChevronRight, ChevronDown,
  ExternalLink, Beaker, LayoutDashboard, ListChecks,
  Heart, Brain, Activity, Eye, BookOpen, Pill, TestTube,
  FileText, TrendingUp, Microscope, ClipboardList, Target,
  Shield, Users, Thermometer, Dna, Calculator
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Map specialties to disease categories/organs
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
  "General Medicine": [], // Can see all
  "Surgery": ["surgical"],
  "Emergency Medicine": [], // Can see all
  "Critical Care": ["critical", "intensive", "acute"],
  "Radiology": [],
  "Pathology": []
};

// Clinical data sections for display
const CLINICAL_SECTIONS = [
  { key: 'description', label: 'Description', icon: FileText },
  { key: 'clinical_features', label: 'Clinical Features', icon: Stethoscope },
  { key: 'diagnostic_criteria', label: 'Diagnostic Criteria', icon: Target },
  { key: 'epidemiology', label: 'Epidemiology', icon: Users },
  { key: 'pathophysiology', label: 'Pathophysiology', icon: Microscope },
  { key: 'treatment', label: 'Treatment Guidelines', icon: Pill },
  { key: 'prognosis', label: 'Prognosis', icon: TrendingUp },
  { key: 'severity_factors', label: 'Severity Factors', icon: Thermometer },
  { key: 'guideline_source', label: 'Guideline Sources', icon: BookOpen },
];

export default function ExpertDashboard() {
  const navigate = useNavigate();
  const { expert, token, logout, isAdmin, loading: authLoading } = useExpert();
  
  const [diseases, setDiseases] = useState([]);
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewed, setShowReviewed] = useState(null);
  const [showMySpecialty, setShowMySpecialty] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, reviewed: 0, pending: 0, mySpecialty: 0 });
  
  // Selected disease for review
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [diseaseData, setDiseaseData] = useState(null);
  const [loadingDisease, setLoadingDisease] = useState(false);
  
  // Change request dialog
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [changeTarget, setChangeTarget] = useState(null); // { section, field, currentValue }
  const [changeRequest, setChangeRequest] = useState({
    proposedValue: '',
    sourceUrl: '',
    reasoning: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // My change requests
  const [myChangeRequests, setMyChangeRequests] = useState([]);
  
  // Expanded sections
  const [expandedSections, setExpandedSections] = useState({});

  // Check if disease matches expert's specialty
  const matchesSpecialty = useCallback((disease) => {
    if (!expert?.specialty) return true;
    
    const specialtyKeywords = SPECIALTY_MAPPING[expert.specialty] || [];
    if (specialtyKeywords.length === 0) return true; // General specialties see all
    
    const category = (disease.category || '').toLowerCase();
    const description = (disease.description || '').toLowerCase();
    const name = (disease.name || '').toLowerCase();
    const organs = (disease.affected_organs || disease.affectedOrgans || []).map(o => o.toLowerCase());
    
    return specialtyKeywords.some(keyword => 
      category.includes(keyword) || 
      description.includes(keyword) || 
      name.includes(keyword) ||
      organs.some(o => o.includes(keyword))
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
      
      // Calculate stats
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

  // Fetch my change requests
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
    // Wait for auth to load before checking
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
    
    // Filter by specialty if enabled
    if (showMySpecialty && expert?.specialty) {
      filtered = filtered.filter(matchesSpecialty);
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.icd10?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by reviewed status
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

  // Open change dialog for any field
  const handleRequestChange = (section, field, currentValue) => {
    setChangeTarget({ section, field, currentValue });
    setChangeRequest({
      proposedValue: typeof currentValue === 'object' ? JSON.stringify(currentValue, null, 2) : String(currentValue || ''),
      sourceUrl: '',
      reasoning: ''
    });
    setShowChangeDialog(true);
  };

  // Submit change request
  const handleSubmitChange = async () => {
    if (!changeTarget || !changeRequest.sourceUrl || !changeRequest.reasoning) {
      alert('Please provide source URL and reasoning for the change');
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
          organ_id: 'clinical_data',
          scale_id: changeTarget.section,
          change_type: 'modification',
          parameters: [{
            parameter_id: changeTarget.field || changeTarget.section,
            parameter_name: changeTarget.section,
            current_value: changeTarget.currentValue,
            proposed_value: changeRequest.proposedValue,
            current_unit: '',
            source_url: changeRequest.sourceUrl,
            reasoning: changeRequest.reasoning
          }],
          additional_notes: `Expert change request for ${changeTarget.section}`
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit change');
      
      setShowChangeDialog(false);
      setChangeTarget(null);
      fetchMyChangeRequests();
      alert('Change request submitted for admin review');
    } catch (err) {
      console.error('Failed to submit change:', err);
      alert('Failed to submit change request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/expert-login');
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderValue = (value) => {
    if (value === null || value === undefined) return <span className="text-muted-foreground italic">Not available</span>;
    if (typeof value === 'object') {
      return <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>;
    }
    return <span className="whitespace-pre-wrap">{String(value)}</span>;
  };

  const progressPercent = stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 sticky top-0 z-50 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">PhiCore Expert Portal</h1>
            <Badge variant="outline" className="hidden md:flex">
              <Stethoscope className="w-3 h-3 mr-1" />
              {expert?.specialty}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/expert/experiments')}>
              <Beaker className="w-4 h-4 mr-2" />
              Lab
            </Button>
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{expert?.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
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
              <span className="text-sm font-medium">Overall Review Progress</span>
              <span className="text-sm text-muted-foreground">{progressPercent.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Disease List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Diseases to Review</CardTitle>
              <CardDescription>
                {showMySpecialty ? `Filtered by ${expert?.specialty}` : 'All diseases'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search diseases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={showMySpecialty ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowMySpecialty(!showMySpecialty)}
                  >
                    <Stethoscope className="w-3 h-3 mr-1" />
                    My Specialty
                  </Button>
                  <Button
                    variant={showReviewed === null ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setShowReviewed(null)}
                  >
                    All
                  </Button>
                  <Button
                    variant={showReviewed === false ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setShowReviewed(false)}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[450px]">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredDiseases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No diseases found</div>
                ) : (
                  <div className="space-y-1">
                    {filteredDiseases.map(disease => (
                      <Button
                        key={disease.id}
                        variant={selectedDisease?.id === disease.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start h-auto py-2 px-3"
                        onClick={() => handleSelectDisease(disease)}
                      >
                        <div className="flex items-center w-full">
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{disease.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {disease.icd10} • {disease.category}
                            </div>
                          </div>
                          {disease.is_reviewed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Disease Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedDisease ? selectedDisease.name : 'Select a Disease'}</CardTitle>
                  <CardDescription>
                    {selectedDisease 
                      ? 'Review clinical information and suggest changes'
                      : 'Choose a disease to review its clinical data'
                    }
                  </CardDescription>
                </div>
                {selectedDisease && (
                  <div className="flex gap-2">
                    {selectedDisease.is_reviewed ? (
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Reviewed
                      </Badge>
                    ) : (
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
                  <p>Select a disease from the list to begin review</p>
                </div>
              ) : loadingDisease ? (
                <div className="text-center py-16 text-muted-foreground">Loading disease data...</div>
              ) : diseaseData ? (
                <Tabs defaultValue="clinical">
                  <TabsList className="mb-4">
                    <TabsTrigger value="clinical">
                      <ClipboardList className="w-4 h-4 mr-1" />
                      Clinical Info
                    </TabsTrigger>
                    <TabsTrigger value="parameters">
                      <Calculator className="w-4 h-4 mr-1" />
                      Parameters
                    </TabsTrigger>
                    <TabsTrigger value="models">
                      <Dna className="w-4 h-4 mr-1" />
                      Models
                    </TabsTrigger>
                    <TabsTrigger value="changes">
                      <FileEdit className="w-4 h-4 mr-1" />
                      Changes ({diseaseData.pending_changes?.length || 0})
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Clinical Information Tab */}
                  <TabsContent value="clinical">
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {CLINICAL_SECTIONS.map(section => {
                          const value = diseaseData.disease?.[section.key];
                          const Icon = section.icon;
                          const isExpanded = expandedSections[section.key];
                          
                          return (
                            <Collapsible key={section.key} open={isExpanded} onOpenChange={() => toggleSection(section.key)}>
                              <div className="border rounded-lg">
                                <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-muted/50">
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{section.label}</span>
                                    {value && <Badge variant="outline" className="text-xs">Has Data</Badge>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRequestChange(section.key, section.key, value);
                                      }}
                                    >
                                      <FileEdit className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </div>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                  <div className="p-3 pt-0 border-t">
                                    <div className="text-sm">
                                      {renderValue(value)}
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  {/* Parameters Tab */}
                  <TabsContent value="parameters">
                    <ScrollArea className="h-[400px] pr-4">
                      {diseaseData.disease?.parameter_modifications ? (
                        <div className="space-y-4">
                          {Object.entries(diseaseData.disease.parameter_modifications).map(([organId, organData]) => (
                            <Collapsible key={organId}>
                              <CollapsibleTrigger className="w-full p-3 bg-muted/50 rounded-lg flex items-center justify-between hover:bg-muted">
                                <div className="flex items-center gap-2">
                                  <Heart className="w-4 h-4 text-primary" />
                                  <span className="font-medium capitalize">{organId}</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent className="mt-2 ml-4">
                                {typeof organData === 'object' && Object.entries(organData).map(([scaleId, scaleData]) => (
                                  <div key={scaleId} className="mb-3">
                                    <h5 className="text-sm font-medium text-muted-foreground capitalize mb-2">{scaleId}</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                      {typeof scaleData === 'object' && Object.entries(scaleData).map(([paramId, paramData]) => (
                                        <div
                                          key={paramId}
                                          className="p-2 bg-muted/30 rounded text-sm cursor-pointer hover:bg-muted/50"
                                          onClick={() => handleRequestChange(`${organId}.${scaleId}`, paramId, paramData)}
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="capitalize">{paramId.replace(/_/g, ' ')}</span>
                                            <FileEdit className="w-3 h-3 text-muted-foreground" />
                                          </div>
                                          <div className="font-mono text-xs mt-1">
                                            {typeof paramData === 'object' 
                                              ? `×${paramData.multiplier || 1}` 
                                              : paramData
                                            }
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No parameter modifications found</p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  
                  {/* Mathematical Models Tab */}
                  <TabsContent value="models">
                    <ScrollArea className="h-[400px] pr-4">
                      {diseaseData.disease?.comprehensive_model || diseaseData.disease?.mathematical_models_disease ? (
                        <div className="space-y-4">
                          {diseaseData.disease.mathematical_models_disease && (
                            <Collapsible defaultOpen>
                              <CollapsibleTrigger className="w-full p-3 bg-muted/50 rounded-lg flex items-center justify-between hover:bg-muted">
                                <div className="flex items-center gap-2">
                                  <Calculator className="w-4 h-4 text-primary" />
                                  <span className="font-medium">Mathematical Models</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRequestChange('mathematical_models_disease', 'models', diseaseData.disease.mathematical_models_disease);
                                  }}
                                >
                                  <FileEdit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2 p-3 bg-muted/30 rounded-lg">
                                {renderValue(diseaseData.disease.mathematical_models_disease)}
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                          
                          {diseaseData.disease.comprehensive_model && (
                            <Collapsible>
                              <CollapsibleTrigger className="w-full p-3 bg-muted/50 rounded-lg flex items-center justify-between hover:bg-muted">
                                <div className="flex items-center gap-2">
                                  <Dna className="w-4 h-4 text-primary" />
                                  <span className="font-medium">Comprehensive Model</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRequestChange('comprehensive_model', 'model', diseaseData.disease.comprehensive_model);
                                  }}
                                >
                                  <FileEdit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2 p-3 bg-muted/30 rounded-lg">
                                {renderValue(diseaseData.disease.comprehensive_model)}
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No mathematical models found</p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  
                  {/* Pending Changes Tab */}
                  <TabsContent value="changes">
                    <ScrollArea className="h-[400px]">
                      {diseaseData.pending_changes?.length > 0 ? (
                        <div className="space-y-3">
                          {diseaseData.pending_changes.map(change => (
                            <Card key={change.id}>
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline">{change.status}</Badge>
                                  <span className="text-xs text-muted-foreground">by {change.expert_name}</span>
                                </div>
                                <p className="font-medium">{change.scale_id}</p>
                                <div className="mt-2 space-y-1">
                                  {change.parameters.map((p, i) => (
                                    <div key={i} className="text-sm">
                                      <span className="font-mono">{p.parameter_name}</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No pending changes for this disease
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* My Change Requests */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">My Change Requests</CardTitle>
            <CardDescription>Track the status of your submitted changes</CardDescription>
          </CardHeader>
          <CardContent>
            {myChangeRequests.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No change requests submitted yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {myChangeRequests.slice(0, 6).map(request => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{request.disease_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {request.scale_id}
                      </p>
                    </div>
                    <Badge variant={
                      request.status === 'approved' ? 'default' :
                      request.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Request Dialog */}
      <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Propose Change</DialogTitle>
            <DialogDescription>
              Suggest a change to {changeTarget?.section}. Please provide evidence and reasoning.
            </DialogDescription>
          </DialogHeader>
          
          {changeTarget && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Section</p>
                <p className="font-medium capitalize">{changeTarget.section.replace(/_/g, ' ')}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Current Value</Label>
                <div className="p-3 bg-muted/50 rounded-lg text-sm max-h-32 overflow-y-auto">
                  {renderValue(changeTarget.currentValue)}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="proposed-value">Proposed Value / Changes</Label>
                <Textarea
                  id="proposed-value"
                  value={changeRequest.proposedValue}
                  onChange={(e) => setChangeRequest({...changeRequest, proposedValue: e.target.value})}
                  placeholder="Enter the new value or describe the changes..."
                  rows={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source-url">
                  <ExternalLink className="w-3 h-3 inline mr-1" />
                  Evidence Source URL (Required)
                </Label>
                <Input
                  id="source-url"
                  value={changeRequest.sourceUrl}
                  onChange={(e) => setChangeRequest({...changeRequest, sourceUrl: e.target.value})}
                  placeholder="https://pubmed.ncbi.nlm.nih.gov/... or guideline URL"
                />
                <p className="text-xs text-muted-foreground">
                  Link to PubMed, clinical guidelines, or other authoritative source
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reasoning">Reasoning / Notes (Required)</Label>
                <Textarea
                  id="reasoning"
                  value={changeRequest.reasoning}
                  onChange={(e) => setChangeRequest({...changeRequest, reasoning: e.target.value})}
                  placeholder="Explain why this change is necessary based on the evidence..."
                  rows={4}
                />
              </div>
              
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  Your change will be submitted for admin review. Include clear evidence and reasoning to support approval.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitChange} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Change Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
