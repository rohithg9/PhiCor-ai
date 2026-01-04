import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Users, Plus, UserPlus, Shield, Pencil, Trash2, Key, CheckCircle2, XCircle, Mail
} from 'lucide-react';

const SPECIALTIES = [
  'Cardiology', 'Pulmonology', 'Neurology', 'Gastroenterology', 'Nephrology',
  'Endocrinology', 'Hematology', 'Oncology', 'Rheumatology', 'Infectious Disease',
  'Dermatology', 'Psychiatry', 'Pediatrics', 'Obstetrics & Gynecology',
  'General Medicine', 'Surgery', 'Emergency Medicine', 'Critical Care', 'Radiology', 'Pathology'
];

const UserManagementView = ({
  experts,
  currentUserId,
  onCreateExpert,
  onUpdateExpert,
  onDeleteExpert,
  onResetPassword
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'expert',
    specialty: '',
    institution: ''
  });
  const [editForm, setEditForm] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await onCreateExpert(createForm);
      setShowCreateDialog(false);
      setCreateForm({ name: '', email: '', password: '', role: 'expert', specialty: '', institution: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    setLoading(true);
    try {
      await onUpdateExpert(selectedExpert.id, editForm);
      setShowEditDialog(false);
      setSelectedExpert(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await onResetPassword(selectedExpert.id, newPassword);
      setShowResetPasswordDialog(false);
      setSelectedExpert(null);
      setNewPassword('');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (expert) => {
    setSelectedExpert(expert);
    setEditForm({
      name: expert.name,
      email: expert.email,
      role: expert.role,
      specialty: expert.specialty || '',
      institution: expert.institution || '',
      is_active: expert.is_active !== false
    });
    setShowEditDialog(true);
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-indigo-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                User Management
              </CardTitle>
              <CardDescription>Manage expert accounts, roles, and permissions</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Expert
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-indigo-500">{experts.length}</p>
              </div>
              <Users className="w-6 h-6 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Super Admins</p>
                <p className="text-2xl font-bold text-red-500">
                  {experts.filter(e => e.role === 'super_admin').length}
                </p>
              </div>
              <Shield className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-blue-500">
                  {experts.filter(e => e.role === 'admin').length}
                </p>
              </div>
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Experts</p>
                <p className="text-2xl font-bold text-green-500">
                  {experts.filter(e => e.role === 'expert').length}
                </p>
              </div>
              <Users className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Click on a user to edit their details</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {experts.map(expert => (
                <div 
                  key={expert.id} 
                  className={`p-4 rounded-lg border hover:bg-muted/50 transition-colors ${
                    expert.is_active === false ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        expert.role === 'super_admin' ? 'bg-red-500' :
                        expert.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {expert.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{expert.name}</p>
                          {expert.id === currentUserId && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                          {expert.is_active === false && (
                            <Badge variant="destructive" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {expert.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(expert.role)} className="capitalize">
                        {expert.role?.replace('_', ' ')}
                      </Badge>
                      {expert.specialty && (
                        <Badge variant="outline" className="text-xs">{expert.specialty}</Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(expert)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedExpert(expert);
                          setShowResetPasswordDialog(true);
                        }}
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      {expert.id !== currentUserId && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDeleteExpert(expert.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {expert.institution && (
                    <p className="text-xs text-muted-foreground mt-2 ml-13">
                      Institution: {expert.institution}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 ml-13 text-xs text-muted-foreground">
                    <span>Changes: {expert.total_changes || 0}</span>
                    <span>Pending: {expert.pending_changes || 0}</span>
                    <span>Experiments: {expert.experiments_count || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create Expert Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Expert</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                placeholder="Dr. John Smith"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                placeholder="john@hospital.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <Select 
                value={createForm.role} 
                onValueChange={(v) => setCreateForm({...createForm, role: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Specialty</Label>
              <Select 
                value={createForm.specialty} 
                onValueChange={(v) => setCreateForm({...createForm, specialty: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input
                value={createForm.institution}
                onChange={(e) => setCreateForm({...createForm, institution: e.target.value})}
                placeholder="Hospital or Organization"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleCreate} 
              disabled={loading || !createForm.name || !createForm.email || !createForm.password}
            >
              {loading ? 'Creating...' : 'Create Expert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Expert Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expert</DialogTitle>
            <DialogDescription>Update user details</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <Select 
                value={editForm.role || 'expert'} 
                onValueChange={(v) => setEditForm({...editForm, role: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Specialty</Label>
              <Select 
                value={editForm.specialty || ''} 
                onValueChange={(v) => setEditForm({...editForm, specialty: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input
                value={editForm.institution || ''}
                onChange={(e) => setEditForm({...editForm, institution: e.target.value})}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editForm.is_active !== false}
                onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="is_active">Active Account</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedExpert?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <Alert>
              <AlertDescription>
                The user will need to use this new password on their next login.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={loading || !newPassword}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementView;
