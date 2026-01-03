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
import { Separator } from '../components/ui/separator';
import { useExpert } from '../context/ExpertContext';
import { 
  Search, CheckCircle2, Clock, AlertTriangle, FileEdit, 
  LogOut, User, Stethoscope, Building2, ChevronRight,
  ExternalLink, Save, X, Beaker, LayoutDashboard, ListChecks,
  Heart, Brain, Bone, Activity, Eye, Filter
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ORGAN_ICONS = {
  heart: Heart,
  brain: Brain,
  lungs: Activity,
  bones: Bone,
  default: Activity
};

export default function ExpertDashboard() {
  const navigate = useNavigate();
  const { expert, token, logout, isAdmin } = useExpert();
  
  const [diseases, setDiseases] = useState([]);
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewed, setShowReviewed] = useState(null); // null = all, true = reviewed, false = pending
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, reviewed: 0, pending: 0 });
  
  // Selected disease for review
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [diseaseData, setDiseaseData] = useState(null);
  const [loadingDisease, setLoadingDisease] = useState(false);
  
  // Change request dialog
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [changeRequest, setChangeRequest] = useState({
    proposedValue: '',
    sourceUrl: '',
    reasoning: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // My change requests
  const [myChangeRequests, setMyChangeRequests] = useState([]);

  // Fetch diseases to review
  const fetchDiseases = useCallback(async () => {
    if (!token) return;
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (showReviewed !== null) params.append('reviewed', showReviewed);
      
      const response = await fetch(`${BACKEND_URL}/api/experts/diseases-to-review?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setDiseases(data.diseases || []);
      setFilteredDiseases(data.diseases || []);
      setStats({
        total: data.total || 0,
        reviewed: data.reviewed || 0,
        pending: data.pending || 0
      });
    } catch (err) {
      console.error('Failed to fetch diseases:', err);
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, showReviewed]);

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
    if (!token) {
      navigate('/expert-login');
      return;
    }
    fetchDiseases();
    fetchMyChangeRequests();
  }, [token, navigate, fetchDiseases, fetchMyChangeRequests]);

  // Filter diseases locally
  useEffect(() => {
    let filtered = diseases;
    
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
  }, [diseases, searchQuery, showReviewed]);

  // Fetch disease details for review
  const handleSelectDisease = async (disease) => {
    setSelectedDisease(disease);
    setLoadingDisease(true);
    
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

  // Mark disease as reviewed
  const handleMarkReviewed = async () => {
    if (!selectedDisease) return;
    
    try {
      await fetch(`${BACKEND_URL}/api/experts/disease/${selectedDisease.id}/mark-reviewed`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Refresh diseases list
      fetchDiseases();
      setSelectedDisease(null);
      setDiseaseData(null);
    } catch (err) {
      console.error('Failed to mark as reviewed:', err);
    }
  };

  // Open parameter edit dialog
  const handleEditParameter = (param, organId, scaleId) => {
    setSelectedParameter({
      ...param,
      organId,
      scaleId
    });
    setChangeRequest({
      proposedValue: param.value?.toString() || '',
      sourceUrl: '',
      reasoning: ''
    });
    setShowChangeDialog(true);
  };

  // Submit change request
  const handleSubmitChange = async () => {
    if (!selectedParameter || !changeRequest.sourceUrl || !changeRequest.reasoning) {
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
          organ_id: selectedParameter.organId,
          scale_id: selectedParameter.scaleId,
          change_type: 'modification',
          parameters: [{
            parameter_id: selectedParameter.id,
            parameter_name: selectedParameter.name,
            current_value: selectedParameter.value,
            proposed_value: changeRequest.proposedValue,
            current_unit: selectedParameter.unit || '',
            source_url: changeRequest.sourceUrl,
            reasoning: changeRequest.reasoning
          }],
          additional_notes: ''
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit change');
      }
      
      setShowChangeDialog(false);
      setSelectedParameter(null);
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
                Admin Dashboard
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/expert/experiments')}>
              <Beaker className="w-4 h-4 mr-2" />
              Experiment Lab
            </Button>
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{expert?.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Diseases</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <ListChecks className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reviewed</p>
                  <p className="text-2xl font-bold text-green-500">{stats.reviewed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Change Requests</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {myChangeRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <FileEdit className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Disease List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Diseases to Review</CardTitle>
              <CardDescription>Select a disease to review its parameters</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search & Filter */}
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
                
                <div className="flex gap-2">
                  <Button
                    variant={showReviewed === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowReviewed(null)}
                  >
                    All
                  </Button>
                  <Button
                    variant={showReviewed === false ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowReviewed(false)}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Button>
                  <Button
                    variant={showReviewed === true ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowReviewed(true)}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Reviewed
                  </Button>
                </div>
              </div>
              
              {/* Disease List */}
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredDiseases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No diseases found</div>
                ) : (
                  <div className="space-y-2">
                    {filteredDiseases.map(disease => (
                      <Button
                        key={disease.id}
                        variant={selectedDisease?.id === disease.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start h-auto py-3"
                        onClick={() => handleSelectDisease(disease)}
                      >
                        <div className="flex items-center w-full">
                          <div className="flex-1 text-left">
                            <div className="font-medium">{disease.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {disease.icd10 && <span className="mr-2">{disease.icd10}</span>}
                              {disease.category}
                            </div>
                          </div>
                          {disease.is_reviewed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
                  <CardTitle>
                    {selectedDisease ? selectedDisease.name : 'Select a Disease'}
                  </CardTitle>
                  <CardDescription>
                    {selectedDisease 
                      ? `Review and validate parameters for ${selectedDisease.name}`
                      : 'Choose a disease from the list to review its parameters'
                    }
                  </CardDescription>
                </div>
                {selectedDisease && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleMarkReviewed}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Reviewed
                    </Button>
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
                <Tabs defaultValue="parameters">
                  <TabsList>
                    <TabsTrigger value="parameters">Parameters</TabsTrigger>
                    <TabsTrigger value="changes">Pending Changes ({diseaseData.pending_changes?.length || 0})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="parameters" className="mt-4">
                    <ScrollArea className="h-[450px] pr-4">
                      {diseaseData.disease?.modifications ? (
                        Object.entries(diseaseData.disease.modifications).map(([organId, organData]) => (
                          <div key={organId} className="mb-6">
                            <h4 className="font-semibold capitalize flex items-center gap-2 mb-3">
                              {React.createElement(ORGAN_ICONS[organId] || ORGAN_ICONS.default, { className: "w-4 h-4" })}
                              {organId}
                            </h4>
                            
                            {Object.entries(organData).map(([scaleId, scaleData]) => (
                              <div key={scaleId} className="ml-4 mb-4">
                                <h5 className="text-sm font-medium text-muted-foreground capitalize mb-2">{scaleId}</h5>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {Object.entries(scaleData).map(([paramId, paramData]) => {
                                    const evidence = diseaseData.parameter_evidence?.[paramId];
                                    
                                    return (
                                      <div
                                        key={paramId}
                                        className="p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer group"
                                        onClick={() => handleEditParameter({
                                          id: paramId,
                                          name: paramId.replace(/_/g, ' '),
                                          value: paramData.value || paramData.multiplier || paramData.absolute,
                                          unit: paramData.unit || '',
                                          note: paramData.note || ''
                                        }, organId, scaleId)}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium capitalize">
                                            {paramId.replace(/_/g, ' ')}
                                          </span>
                                          <FileEdit className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        
                                        <div className="mt-1 flex items-center gap-2">
                                          <span className="text-lg font-mono">
                                            {paramData.absolute !== null && paramData.absolute !== undefined
                                              ? paramData.absolute
                                              : paramData.multiplier !== null && paramData.multiplier !== undefined
                                                ? `×${paramData.multiplier}`
                                                : paramData.value || 'N/A'
                                            }
                                          </span>
                                          {paramData.unit && (
                                            <span className="text-xs text-muted-foreground">{paramData.unit}</span>
                                          )}
                                        </div>
                                        
                                        {paramData.note && (
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{paramData.note}</p>
                                        )}
                                        
                                        {evidence && (
                                          <div className="flex items-center gap-1 mt-2">
                                            <ExternalLink className="w-3 h-3 text-blue-500" />
                                            <a 
                                              href={evidence.source_url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-500 hover:underline"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              View Source
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No parameter modifications found for this disease.</p>
                          <p className="text-sm">This disease may need data enhancement.</p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="changes" className="mt-4">
                    <ScrollArea className="h-[450px]">
                      {diseaseData.pending_changes?.length > 0 ? (
                        <div className="space-y-3">
                          {diseaseData.pending_changes.map(change => (
                            <Card key={change.id}>
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline">{change.status}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    by {change.expert_name}
                                  </span>
                                </div>
                                <p className="font-medium">{change.organ_id} / {change.scale_id}</p>
                                <div className="mt-2 space-y-1">
                                  {change.parameters.map((p, i) => (
                                    <div key={i} className="text-sm">
                                      <span className="font-mono">{p.parameter_name}</span>: {p.current_value} → {p.proposed_value}
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
              <div className="space-y-3">
                {myChangeRequests.slice(0, 5).map(request => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{request.disease_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.organ_id} / {request.scale_id} • {request.parameters.length} parameter(s)
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Propose Parameter Change</DialogTitle>
            <DialogDescription>
              Submit a change request for admin review. Please provide evidence source and reasoning.
            </DialogDescription>
          </DialogHeader>
          
          {selectedParameter && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Parameter</p>
                <p className="font-medium capitalize">{selectedParameter.name}</p>
                <p className="text-sm">Current Value: <span className="font-mono">{selectedParameter.value}</span></p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="proposed-value">Proposed Value</Label>
                <Input
                  id="proposed-value"
                  value={changeRequest.proposedValue}
                  onChange={(e) => setChangeRequest({...changeRequest, proposedValue: e.target.value})}
                  placeholder="Enter new value"
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
                  placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reasoning">Reasoning (Required)</Label>
                <Textarea
                  id="reasoning"
                  value={changeRequest.reasoning}
                  onChange={(e) => setChangeRequest({...changeRequest, reasoning: e.target.value})}
                  placeholder="Explain why this change is necessary based on the evidence..."
                  rows={4}
                />
              </div>
              
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Your change will be submitted to an admin for review before being applied to the database.
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
