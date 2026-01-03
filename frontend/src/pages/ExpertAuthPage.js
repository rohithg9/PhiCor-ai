import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Shield, UserPlus, LogIn, Stethoscope, Building2, GraduationCap } from 'lucide-react';
import { useExpert } from '../context/ExpertContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SPECIALTIES = [
  "Cardiology", "Pulmonology", "Neurology", "Gastroenterology", "Nephrology",
  "Endocrinology", "Hematology", "Oncology", "Rheumatology", "Infectious Disease",
  "Dermatology", "Psychiatry", "Pediatrics", "Obstetrics & Gynecology", "General Medicine",
  "Surgery", "Emergency Medicine", "Critical Care", "Radiology", "Pathology"
];

export default function ExpertAuthPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useExpert();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/expert');
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    specialty: '',
    credentials: '',
    institution: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/experts/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      
      // Store token and expert data
      localStorage.setItem('expert_token', data.access_token);
      localStorage.setItem('expert_data', JSON.stringify(data.expert));
      
      // Redirect based on role
      if (data.expert.role === 'super_admin' || data.expert.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/expert');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (!registerData.specialty) {
      setError('Please select a specialty');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/experts/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          name: registerData.name,
          specialty: registerData.specialty,
          credentials: registerData.credentials,
          institution: registerData.institution,
          role: 'expert'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }
      
      // Store token and expert data
      localStorage.setItem('expert_token', data.access_token);
      localStorage.setItem('expert_data', JSON.stringify(data.expert));
      
      navigate('/expert');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">PhiCore Expert Portal</CardTitle>
          <CardDescription>
            Access the Expert Curation System to review and validate medical data
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register">
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="expert@hospital.org"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      placeholder="Dr. John Smith"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-credentials">
                      <GraduationCap className="w-3 h-3 inline mr-1" />
                      Credentials
                    </Label>
                    <Input
                      id="reg-credentials"
                      placeholder="MD, PhD"
                      value={registerData.credentials}
                      onChange={(e) => setRegisterData({...registerData, credentials: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="expert@hospital.org"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>
                    <Stethoscope className="w-3 h-3 inline mr-1" />
                    Medical Specialty
                  </Label>
                  <Select
                    value={registerData.specialty}
                    onValueChange={(value) => setRegisterData({...registerData, specialty: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-institution">
                    <Building2 className="w-3 h-3 inline mr-1" />
                    Institution
                  </Label>
                  <Input
                    id="reg-institution"
                    placeholder="Mayo Clinic, Johns Hopkins, etc."
                    value={registerData.institution}
                    onChange={(e) => setRegisterData({...registerData, institution: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirm Password</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Expert Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>By registering, you agree to participate in the</p>
            <p className="font-medium text-primary">PhiCore Medical Data Curation Program</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
