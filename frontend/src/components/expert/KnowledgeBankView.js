import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  Dna, Plus, Zap, RefreshCw, FileText, Clock, History, Target,
  CheckCircle2, XCircle, ExternalLink, MessageSquare
} from 'lucide-react';

const KnowledgeBankView = ({
  knowledgeSources,
  knowledgeSuggestions,
  knowledgeTimeline,
  systemSettings,
  setSystemSettings,
  showUploadDialog,
  setShowUploadDialog,
  uploadForm,
  setUploadForm,
  uploadFile,
  setUploadFile,
  uploading,
  triggeringSearch,
  onUpload,
  onTriggerAutoSearch,
  onApproveSuggestion,
  onRejectSuggestion,
  onUpdateSettings
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-amber-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Dna className="w-5 h-5 text-amber-500" />
                Knowledge Bank
              </CardTitle>
              <CardDescription>Upload documents, URLs, and manage AI-suggested updates</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowUploadDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Knowledge
              </Button>
              <Button 
                variant="outline" 
                onClick={onTriggerAutoSearch}
                disabled={triggeringSearch}
              >
                {triggeringSearch ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                AI Search
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Sources</p>
                <p className="text-2xl font-bold text-amber-500">{knowledgeSources.length}</p>
              </div>
              <FileText className="w-6 h-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-orange-500">{knowledgeSuggestions.length}</p>
              </div>
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Auto-Search</p>
                <p className="text-2xl font-bold text-blue-500">{systemSettings.auto_search_interval_days}d</p>
              </div>
              <RefreshCw className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Last Search</p>
                <p className="text-sm font-medium text-muted-foreground">
                  {systemSettings.last_auto_search 
                    ? new Date(systemSettings.last_auto_search).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
              <History className="w-6 h-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Sources List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sources</CardTitle>
            <CardDescription>Uploaded documents & URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {knowledgeSources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sources uploaded yet</p>
                  <Button size="sm" className="mt-4" onClick={() => setShowUploadDialog(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add First Source
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {knowledgeSources.map(source => (
                    <div key={source.id} className="p-3 rounded-lg border hover:bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{source.title}</p>
                          <p className="text-xs text-muted-foreground">{source.source_type}</p>
                          {source.disease_name && (
                            <Badge variant="outline" className="text-xs mt-1">{source.disease_name}</Badge>
                          )}
                        </div>
                        <Badge 
                          variant={source.status === 'analyzed' ? 'default' : 'secondary'}
                          className="text-xs shrink-0"
                        >
                          {source.status}
                        </Badge>
                      </div>
                      {source.suggestions_count > 0 && (
                        <p className="text-xs text-amber-500 mt-1">
                          {source.suggestions_count} suggestions generated
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pending Suggestions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Pending Suggestions</CardTitle>
                <CardDescription>AI-analyzed changes awaiting your review</CardDescription>
              </div>
              <Badge variant="destructive" className="text-xs">
                {knowledgeSuggestions.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {knowledgeSuggestions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending suggestions</p>
                  <p className="text-sm">Upload documents or trigger AI search to get suggestions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {knowledgeSuggestions.map(suggestion => (
                    <Card key={suggestion.id} className="border-l-4 border-l-amber-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{suggestion.disease_name || 'General'}</p>
                            <p className="text-sm text-muted-foreground">{suggestion.target}</p>
                          </div>
                          <Badge variant={suggestion.is_auto_search ? 'secondary' : 'outline'} className="text-xs">
                            {suggestion.is_auto_search ? 'AI Search' : suggestion.change_type}
                          </Badge>
                        </div>
                        
                        {suggestion.proposed_value && (
                          <div className="p-2 bg-muted rounded text-sm mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Proposed:</span>
                              <span className="text-green-500 font-medium">{suggestion.proposed_value}</span>
                              {suggestion.unit && <span className="text-muted-foreground">{suggestion.unit}</span>}
                            </div>
                          </div>
                        )}
                        
                        {suggestion.reasoning && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {suggestion.reasoning}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            Evidence: {suggestion.evidence_level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Confidence: {suggestion.confidence}%
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => onApproveSuggestion(suggestion.id)}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => onRejectSuggestion(suggestion.id)}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
          <CardDescription>History of all knowledge bank activities</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            {knowledgeTimeline.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activity yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {knowledgeTimeline.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      entry.action.includes('approved') ? 'bg-green-500' :
                      entry.action.includes('rejected') ? 'bg-red-500' :
                      entry.action.includes('uploaded') ? 'bg-blue-500' :
                      'bg-amber-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">{entry.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.actor_name} • {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      {entry.details?.summary && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {entry.details.summary}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Auto-Search Settings
          </CardTitle>
          <CardDescription>Configure automated guideline monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search Interval (days)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={systemSettings.auto_search_interval_days || 30}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    auto_search_interval_days: parseInt(e.target.value) || 30
                  })}
                  className="w-24"
                  min={7}
                  max={90}
                />
                <Button 
                  size="sm"
                  onClick={() => onUpdateSettings({ 
                    auto_search_interval_days: systemSettings.auto_search_interval_days 
                  })}
                >
                  Save
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Auto-Search Status</Label>
              <Badge variant={systemSettings.auto_search_enabled ? 'default' : 'secondary'}>
                {systemSettings.auto_search_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label>AI Model</Label>
              <p className="text-sm text-muted-foreground">GPT-4o (via Emergent)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Knowledge Source</DialogTitle>
            <DialogDescription>
              Upload a document, URL, or text for AI analysis
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Source Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={uploadForm.source_type === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadForm({...uploadForm, source_type: 'url'})}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  URL
                </Button>
                <Button
                  variant={uploadForm.source_type === 'document' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadForm({...uploadForm, source_type: 'document'})}
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Document
                </Button>
                <Button
                  variant={uploadForm.source_type === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadForm({...uploadForm, source_type: 'text'})}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Text
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                placeholder="e.g., ESC 2024 Heart Failure Guidelines"
              />
            </div>
            
            {uploadForm.source_type === 'url' && (
              <div className="space-y-2">
                <Label>URL *</Label>
                <Input
                  value={uploadForm.url}
                  onChange={(e) => setUploadForm({...uploadForm, url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            )}
            
            {uploadForm.source_type === 'document' && (
              <div className="space-y-2">
                <Label>Document (PDF, TXT, DOCX)</Label>
                <Input
                  type="file"
                  accept=".pdf,.txt,.docx,.doc"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>
            )}
            
            {uploadForm.source_type === 'text' && (
              <div className="space-y-2">
                <Label>Content *</Label>
                <Textarea
                  value={uploadForm.content}
                  onChange={(e) => setUploadForm({...uploadForm, content: e.target.value})}
                  placeholder="Paste clinical text, guidelines, or findings..."
                  rows={6}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Related Disease (Optional)</Label>
              <Input
                value={uploadForm.disease_name}
                onChange={(e) => setUploadForm({...uploadForm, disease_name: e.target.value})}
                placeholder="e.g., Atrial Fibrillation"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                placeholder="Brief description of the content..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                placeholder="guidelines, cardiology, staging"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button onClick={onUpload} disabled={uploading || !uploadForm.title}>
              {uploading ? 'Uploading...' : 'Upload & Analyze'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBankView;
