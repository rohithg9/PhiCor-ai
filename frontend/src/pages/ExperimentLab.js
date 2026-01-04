import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { useExpert } from '../context/ExpertContext';
import { 
  Beaker, Plus, Play, Trash2, User, LogOut, ArrowLeft,
  HeartPulse, Activity, Brain, Save, FileJson, ChevronRight,
  AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ExperimentLab() {
  const navigate = useNavigate();
  const { expert, token, logout, loading: authLoading } = useExpert();
  
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diseases, setDiseases] = useState([]);
  
  // New experiment dialog
  const [showNewExperiment, setShowNewExperiment] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    patient: {
      name: 'Test Patient',
      age: 45,
      sex: 'Male',
      weight: 70,
      height: 170,
      medical_history: [],
      current_conditions: [],
      medications: []
    },
    test_diseases: [],
    severity_levels: {}
  });
  const [creating, setCreating] = useState(false);
  
  // Selected experiment
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [experimentResults, setExperimentResults] = useState(null);
  const [runningExperiment, setRunningExperiment] = useState(false);

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
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch diseases for selection
  const fetchDiseases = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/diseases-db`);
      const data = await response.json();
      setDiseases(data.diseases || []);
    } catch (err) {
      console.error('Failed to fetch diseases:', err);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) return;
    
    if (!token) {
      navigate('/expert-login');
      return;
    }
    fetchExperiments();
    fetchDiseases();
  }, [token, authLoading, navigate, fetchExperiments, fetchDiseases]);

  // Create new experiment
  const handleCreateExperiment = async () => {
    if (!newExperiment.name) {
      alert('Please enter an experiment name');
      return;
    }
    
    setCreating(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/experiments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newExperiment)
      });
      
      if (!response.ok) throw new Error('Failed to create experiment');
      
      const data = await response.json();
      setShowNewExperiment(false);
      setNewExperiment({
        name: '',
        description: '',
        patient: {
          name: 'Test Patient',
          age: 45,
          sex: 'Male',
          weight: 70,
          height: 170,
          medical_history: [],
          current_conditions: [],
          medications: []
        },
        test_diseases: [],
        severity_levels: {}
      });
      fetchExperiments();
      setSelectedExperiment(data);
    } catch (err) {
      console.error('Failed to create experiment:', err);
      alert('Failed to create experiment');
    } finally {
      setCreating(false);
    }
  };

  // Run experiment
  const handleRunExperiment = async (exp) => {
    setRunningExperiment(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/experiments/${exp.id}/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to run experiment');
      
      const data = await response.json();
      setExperimentResults(data.results);
      
      // Refresh experiment data
      const expResponse = await fetch(`${BACKEND_URL}/api/experiments/${exp.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const expData = await expResponse.json();
      setSelectedExperiment(expData);
    } catch (err) {
      console.error('Failed to run experiment:', err);
      alert('Failed to run experiment');
    } finally {
      setRunningExperiment(false);
    }
  };

  // Delete experiment
  const handleDeleteExperiment = async (expId) => {
    if (!window.confirm('Are you sure you want to delete this experiment?')) return;
    
    try {
      await fetch(`${BACKEND_URL}/api/experiments/${expId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (selectedExperiment?.id === expId) {
        setSelectedExperiment(null);
        setExperimentResults(null);
      }
      fetchExperiments();
    } catch (err) {
      console.error('Failed to delete experiment:', err);
    }
  };

  // Add disease to experiment
  const handleAddDisease = (diseaseId) => {
    if (newExperiment.test_diseases.includes(diseaseId)) return;
    
    setNewExperiment({
      ...newExperiment,
      test_diseases: [...newExperiment.test_diseases, diseaseId],
      severity_levels: {
        ...newExperiment.severity_levels,
        [diseaseId]: 0.5
      }
    });
  };

  // Remove disease from experiment
  const handleRemoveDisease = (diseaseId) => {
    const { [diseaseId]: _, ...restSeverity } = newExperiment.severity_levels;
    setNewExperiment({
      ...newExperiment,
      test_diseases: newExperiment.test_diseases.filter(id => id !== diseaseId),
      severity_levels: restSeverity
    });
  };

  // Update severity
  const handleSeverityChange = (diseaseId, value) => {
    setNewExperiment({
      ...newExperiment,
      severity_levels: {
        ...newExperiment.severity_levels,
        [diseaseId]: value[0]
      }
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/expert-login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 sticky top-0 z-50 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/expert')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Beaker className="w-6 h-6 text-purple-500" />
            <h1 className="text-xl font-bold">Experiment Lab</h1>
          </div>
          
          <div className="flex items-center gap-3">
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
              <CardDescription>Virtual patient test cases</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : experiments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Beaker className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No experiments yet</p>
                    <p className="text-sm">Create your first virtual patient test case</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {experiments.map(exp => (
                      <div
                        key={exp.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedExperiment?.id === exp.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          setSelectedExperiment(exp);
                          setExperimentResults(exp.results || null);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{exp.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {exp.test_diseases?.length || 0} diseases
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(exp.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExperiment(exp.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedExperiment ? selectedExperiment.name : 'Select an Experiment'}
                  </CardTitle>
                  <CardDescription>
                    {selectedExperiment 
                      ? selectedExperiment.description || 'No description'
                      : 'Select an experiment from the list or create a new one to get started'
                    }
                  </CardDescription>
                </div>
                {selectedExperiment && (
                  <Button onClick={() => handleRunExperiment(selectedExperiment)} disabled={runningExperiment}>
                    <Play className="w-4 h-4 mr-2" />
                    {runningExperiment ? 'Running...' : 'Run Experiment'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedExperiment ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Beaker className="w-10 h-10 text-purple-500" />
                  </div>
                  <p className="text-lg font-medium mb-2">No Experiment Selected</p>
                  <p className="text-sm mb-6">Select an experiment from the list or create a new one to get started</p>
                  <Button onClick={() => setShowNewExperiment(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Experiment
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue="patient">
                  <TabsList>
                    <TabsTrigger value="patient">
                      <HeartPulse className="w-4 h-4 mr-1" />
                      Patient
                    </TabsTrigger>
                    <TabsTrigger value="diseases">
                      <Activity className="w-4 h-4 mr-1" />
                      Diseases ({selectedExperiment.test_diseases?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="results">
                      <FileJson className="w-4 h-4 mr-1" />
                      Results
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="patient" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Name</p>
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
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="font-medium">{selectedExperiment.patient?.weight || 'N/A'} kg</p>
                      </div>
                    </div>
                    
                    {selectedExperiment.patient?.medical_history?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Medical History</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedExperiment.patient.medical_history.map((item, i) => (
                            <Badge key={i} variant="outline">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="diseases" className="mt-4">
                    <ScrollArea className="h-[350px]">
                      {selectedExperiment.test_diseases?.length > 0 ? (
                        <div className="space-y-3">
                          {selectedExperiment.test_diseases.map(diseaseId => {
                            const disease = diseases.find(d => d.id === diseaseId);
                            const severity = selectedExperiment.severity_levels?.[diseaseId] || 0.5;
                            
                            return (
                              <div key={diseaseId} className="p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium">{disease?.name || diseaseId}</p>
                                  <Badge variant={severity > 0.7 ? 'destructive' : severity > 0.4 ? 'secondary' : 'outline'}>
                                    Severity: {(severity * 100).toFixed(0)}%
                                  </Badge>
                                </div>
                                {disease?.icd10 && (
                                  <p className="text-sm text-muted-foreground">ICD-10: {disease.icd10}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No diseases added to this experiment
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="results" className="mt-4">
                    <ScrollArea className="h-[350px]">
                      {experimentResults || selectedExperiment.results ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                              <p className="font-medium">Experiment Completed</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Calculated at: {new Date((experimentResults || selectedExperiment.results)?.calculated_at).toLocaleString()}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-2">Disease Effects</p>
                            {Object.entries((experimentResults || selectedExperiment.results)?.disease_effects || {}).map(([diseaseId, effect]) => (
                              <div key={diseaseId} className="p-3 bg-muted/50 rounded-lg mb-2">
                                <p className="font-medium">{effect.name}</p>
                                <p className="text-sm text-muted-foreground">Severity: {(effect.severity * 100).toFixed(0)}%</p>
                                {effect.modifications && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {Object.keys(effect.modifications).length} organ systems affected
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No results yet</p>
                          <p className="text-sm">Run the experiment to see calculated effects</p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Experiment Dialog */}
      <Dialog open={showNewExperiment} onOpenChange={setShowNewExperiment}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Experiment</DialogTitle>
            <DialogDescription>
              Set up a virtual patient and test against diseases
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exp-name">Experiment Name</Label>
                <Input
                  id="exp-name"
                  value={newExperiment.name}
                  onChange={(e) => setNewExperiment({...newExperiment, name: e.target.value})}
                  placeholder="e.g., Multi-morbidity case study"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exp-desc">Description</Label>
                <Textarea
                  id="exp-desc"
                  value={newExperiment.description}
                  onChange={(e) => setNewExperiment({...newExperiment, description: e.target.value})}
                  placeholder="Describe the purpose of this experiment..."
                  rows={2}
                />
              </div>
            </div>
            
            {/* Patient Info */}
            <div className="space-y-4">
              <p className="text-sm font-medium">Patient Profile</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newExperiment.patient.name}
                    onChange={(e) => setNewExperiment({
                      ...newExperiment,
                      patient: {...newExperiment.patient, name: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={newExperiment.patient.age}
                    onChange={(e) => setNewExperiment({
                      ...newExperiment,
                      patient: {...newExperiment.patient, age: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sex</Label>
                  <Select
                    value={newExperiment.patient.sex}
                    onValueChange={(value) => setNewExperiment({
                      ...newExperiment,
                      patient: {...newExperiment.patient, sex: value}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    value={newExperiment.patient.weight}
                    onChange={(e) => setNewExperiment({
                      ...newExperiment,
                      patient: {...newExperiment.patient, weight: parseFloat(e.target.value) || 0}
                    })}
                  />
                </div>
              </div>
            </div>
            
            {/* Disease Selection */}
            <div className="space-y-4">
              <p className="text-sm font-medium">Test Diseases</p>
              
              <div className="flex gap-2">
                <Select onValueChange={handleAddDisease}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Add a disease to test..." />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {diseases.slice(0, 100).map(disease => (
                        <SelectItem 
                          key={disease.id} 
                          value={disease.id}
                          disabled={newExperiment.test_diseases.includes(disease.id)}
                        >
                          {disease.name}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              
              {newExperiment.test_diseases.length > 0 && (
                <div className="space-y-3">
                  {newExperiment.test_diseases.map(diseaseId => {
                    const disease = diseases.find(d => d.id === diseaseId);
                    return (
                      <div key={diseaseId} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{disease?.name || diseaseId}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDisease(diseaseId)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Severity</Label>
                            <span className="text-sm text-muted-foreground">
                              {((newExperiment.severity_levels[diseaseId] || 0.5) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Slider
                            value={[newExperiment.severity_levels[diseaseId] || 0.5]}
                            onValueChange={(value) => handleSeverityChange(diseaseId, value)}
                            min={0}
                            max={1}
                            step={0.1}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewExperiment(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateExperiment} disabled={creating}>
              {creating ? 'Creating...' : 'Create Experiment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
