import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useExpert } from '../context/ExpertContext';
import { 
  Users, FileCheck, FileX, Clock, Activity, CheckCircle2, XCircle,
  Shield, LogOut, User, ChevronRight, ExternalLink, Beaker,
  BarChart3, TrendingUp, AlertTriangle, RefreshCw, Eye
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { expert, token, logout, isSuperAdmin } = useExpert();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [selectedChange, setSelectedChange] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          navigate('/expert');
          return;
        }
        throw new Error('Failed to fetch dashboard');
      }
      
      const data = await response.json();
      setDashboardData(data);
      setAuditLogs(data.recent_activity || []);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  // Fetch pending change requests
  const fetchPendingChanges = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/change-requests?status=pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setPendingChanges(data.change_requests || []);
    } catch (err) {
      console.error('Failed to fetch pending changes:', err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/expert-login');
      return;
    }
    fetchDashboard();
    fetchPendingChanges();
  }, [token, navigate, fetchDashboard, fetchPendingChanges]);

  const handleReviewChange = (change) => {
    setSelectedChange(change);
    setReviewNotes('');
    setShowReviewDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedChange) return;
    setProcessing(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/change-requests/${selectedChange.id}/approve?reviewer_notes=${encodeURIComponent(reviewNotes)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to approve');
      
      setShowReviewDialog(false);
      setSelectedChange(null);
      fetchPendingChanges();
      fetchDashboard();
    } catch (err) {
      console.error('Failed to approve:', err);
      alert('Failed to approve change request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedChange || !reviewNotes) {
      alert('Please provide a reason for rejection');
      return;
    }
    setProcessing(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/change-requests/${selectedChange.id}/reject?reviewer_notes=${encodeURIComponent(reviewNotes)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to reject');
      
      setShowReviewDialog(false);
      setSelectedChange(null);
      fetchPendingChanges();
      fetchDashboard();
    } catch (err) {
      console.error('Failed to reject:', err);
      alert('Failed to reject change request');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/expert-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const diseaseProgress = dashboardData?.diseases 
    ? (dashboardData.diseases.reviewed / dashboardData.diseases.total) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 sticky top-0 z-50 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">PhiCore Admin Dashboard</h1>
            <Badge variant={isSuperAdmin ? 'default' : 'secondary'}>
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/expert')}>
              <Eye className="w-4 h-4 mr-2" />
              Expert View
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/expert/experiments')}>
              <Beaker className="w-4 h-4 mr-2" />
              Experiments
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
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Experts</p>
                  <p className="text-2xl font-bold">{dashboardData?.experts?.total || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Diseases Reviewed</p>
                  <p className="text-2xl font-bold text-green-500">
                    {dashboardData?.diseases?.reviewed || 0}/{dashboardData?.diseases?.total || 0}
                  </p>
                </div>
                <FileCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-500/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Changes</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {dashboardData?.change_requests?.pending || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved Changes</p>
                  <p className="text-2xl font-bold text-green-500">
                    {dashboardData?.change_requests?.approved || 0}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Experiments</p>
                  <p className="text-2xl font-bold">{dashboardData?.experiments?.total || 0}</p>
                </div>
                <Beaker className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Disease Curation Progress</span>
              <span className="text-sm text-muted-foreground">{diseaseProgress.toFixed(1)}%</span>
            </div>
            <Progress value={diseaseProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {dashboardData?.diseases?.pending_review || 0} diseases pending expert review
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Change Requests */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Pending Change Requests
                  </CardTitle>
                  <CardDescription>Review and approve expert submissions</CardDescription>
                </div>
                <Badge variant="secondary">{pendingChanges.length} pending</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {pendingChanges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending change requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingChanges.map(change => (
                      <Card key={change.id} className="cursor-pointer hover:border-primary/50" onClick={() => handleReviewChange(change)}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{change.disease_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {change.organ_id} / {change.scale_id}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{change.expert_specialty}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  by {change.expert_name}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                          
                          <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                            {change.parameters.map((p, i) => (
                              <div key={i}>
                                <span className="font-mono">{p.parameter_name}</span>: 
                                <span className="text-muted-foreground"> {p.current_value}</span>
                                <span className="text-primary"> → {p.proposed_value}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Expert Activity & Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {auditLogs.slice(0, 20).map((log, index) => (
                    <div key={log.id || index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        log.action === 'change_approved' ? 'bg-green-500/10 text-green-500' :
                        log.action === 'change_rejected' ? 'bg-red-500/10 text-red-500' :
                        log.action === 'change_requested' ? 'bg-blue-500/10 text-blue-500' :
                        log.action === 'disease_reviewed' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {log.action === 'change_approved' ? <CheckCircle2 className="w-4 h-4" /> :
                         log.action === 'change_rejected' ? <XCircle className="w-4 h-4" /> :
                         log.action === 'change_requested' ? <FileCheck className="w-4 h-4" /> :
                         <Activity className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{log.expert_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.action.replace(/_/g, ' ')} - {log.target_name}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Experts List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Registered Experts
            </CardTitle>
            <CardDescription>All experts in the curation system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData?.experts?.list?.map(exp => (
                <Card key={exp.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{exp.name}</p>
                        <p className="text-sm text-muted-foreground">{exp.specialty}</p>
                        <p className="text-xs text-muted-foreground">{exp.institution}</p>
                      </div>
                      <Badge variant={
                        exp.role === 'super_admin' ? 'default' :
                        exp.role === 'admin' ? 'secondary' : 'outline'
                      }>
                        {exp.role}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Reviewed: </span>
                        <span className="font-medium">{exp.diseases_reviewed || 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Changes: </span>
                        <span className="font-medium">{exp.pending_changes || 0}</span>
                      </div>
                    </div>
                    {exp.last_login && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last active: {new Date(exp.last_login).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Change Request</DialogTitle>
            <DialogDescription>
              Review the proposed changes and approve or reject
            </DialogDescription>
          </DialogHeader>
          
          {selectedChange && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Disease</p>
                  <p className="font-medium">{selectedChange.disease_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted by</p>
                  <p className="font-medium">{selectedChange.expert_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedChange.expert_specialty}</p>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-3">Proposed Changes</p>
                {selectedChange.parameters.map((param, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm">{param.parameter_name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current: </span>
                        <span className="font-medium">{param.current_value}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Proposed: </span>
                        <span className="font-medium text-primary">{param.proposed_value}</span>
                      </div>
                    </div>
                    
                    {param.source_url && (
                      <div className="mt-2">
                        <a 
                          href={param.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Evidence Source
                        </a>
                      </div>
                    )}
                    
                    {param.reasoning && (
                      <div className="mt-2 p-2 bg-background rounded text-sm">
                        <p className="text-muted-foreground text-xs mb-1">Reasoning:</p>
                        <p>{param.reasoning}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="review-notes">Review Notes</Label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision (required for rejection)..."
                  rows={3}
                />
              </div>
              
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Approving will apply these changes to the main database. This action will be logged.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve & Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
