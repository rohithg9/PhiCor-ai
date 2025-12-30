import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Heart, Brain, Pill, FileText, Settings, LogOut, Moon, Sun,
  ChevronRight, User, MessageSquare, FlaskConical, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import BodyMap from '../components/BodyMap';
import EquationCanvas from '../components/EquationCanvas';
import InterpretationPanel from '../components/InterpretationPanel';
import DrugBuilder from '../components/DrugBuilder';
import OrganPanel from '../components/OrganPanel';
import EvidencePanel from '../components/EvidencePanel';
import AIAssistant from '../components/AIAssistant';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [selectedOrgan, setSelectedOrgan] = useState('heart');
  const [selectedSystem, setSelectedSystem] = useState('cardiovascular');
  const [physiologicalState, setPhysiologicalState] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [equations, setEquations] = useState(null);
  const [drugs, setDrugs] = useState([]);
  const [aiDockExpanded, setAiDockExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load equations reference
      const eqResponse = await axios.get(`${API}/equations`);
      setEquations(eqResponse.data);

      // Load available drugs
      const drugsResponse = await axios.get(`${API}/drugs`);
      setDrugs(drugsResponse.data.drugs);

      // Initialize default physiological state
      setPhysiologicalState({
        heart_rate: 70,
        systolic_bp: 120,
        diastolic_bp: 80,
        cardiac_output: 5.0,
        stroke_volume: 70,
        respiratory_rate: 14,
        oxygen_saturation: 98,
        gfr: 100,
        creatinine: 1.0,
        glucose: 90,
        insulin: 10,
        temperature: 37.0
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setLoading(false);
    }
  };

  const handleOrganSelect = (organ) => {
    setSelectedOrgan(organ);
    // Map organs to systems
    const organSystemMap = {
      heart: 'cardiovascular',
      lungs: 'respiratory',
      kidney: 'renal',
      liver: 'hepatic',
      pancreas: 'glucose_insulin',
      brain: 'neurological'
    };
    setSelectedSystem(organSystemMap[organ] || 'cardiovascular');
  };

  const handleDrugSimulation = async (drugData) => {
    try {
      const response = await axios.post(`${API}/drugs/simulate`, drugData);
      setSimulationResults(response.data);
      
      // Update physiological state with modified values
      if (response.data.modified_state) {
        setPhysiologicalState(prev => ({
          ...prev,
          ...response.data.modified_state
        }));
      }
      
      toast.success('Simulation complete');
    } catch (error) {
      toast.error('Simulation failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { icon: <Activity className="w-5 h-5" />, label: 'Dashboard', active: true },
    { icon: <Heart className="w-5 h-5" />, label: 'Simulations' },
    { icon: <Pill className="w-5 h-5" />, label: 'Drug Library' },
    { icon: <User className="w-5 h-5" />, label: 'Patients' },
    { icon: <FileText className="w-5 h-5" />, label: 'Reports' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Mathematical Human...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/10 flex flex-col" data-testid="sidebar">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-manrope font-bold text-sm">Mathematical Human</h1>
              <p className="text-xs text-muted-foreground">v1.0</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item, i) => (
              <li key={i}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
              data-testid="theme-toggle"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              data-testid="settings-btn"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => navigate('/auth')}
              className="w-full"
              data-testid="login-prompt-btn"
            >
              Sign In
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6">
          <div>
            <h2 className="font-manrope font-bold text-lg">Simulation Dashboard</h2>
            <p className="text-xs text-muted-foreground">Interactive Physiological Modeling</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">System Ready</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-12 gap-6 h-full min-h-[600px]">
            {/* Body Map - Left Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-3 glass-panel rounded-xl p-4"
              data-testid="body-map-panel"
            >
              <h3 className="font-manrope font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Body Map
              </h3>
              <BodyMap
                selectedOrgan={selectedOrgan}
                onOrganSelect={handleOrganSelect}
                physiologicalState={physiologicalState}
              />
            </motion.div>

            {/* Equation Canvas - Center Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="col-span-5 glass-panel rounded-xl p-4"
              data-testid="equation-canvas-panel"
            >
              <h3 className="font-manrope font-semibold mb-4 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-secondary" />
                Equation Canvas
              </h3>
              <EquationCanvas
                selectedSystem={selectedSystem}
                equations={equations}
                physiologicalState={physiologicalState}
              />
            </motion.div>

            {/* Right Panels */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-4 flex flex-col gap-6"
            >
              {/* Interpretation Panel */}
              <div className="glass-panel rounded-xl p-4 flex-1" data-testid="interpretation-panel">
                <h3 className="font-manrope font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-accent" />
                  Interpretation
                </h3>
                <InterpretationPanel
                  simulationResults={simulationResults}
                  physiologicalState={physiologicalState}
                  selectedSystem={selectedSystem}
                />
              </div>

              {/* Drug Builder */}
              <div className="glass-panel rounded-xl p-4" data-testid="drug-builder-panel">
                <DrugBuilder
                  drugs={drugs}
                  onSimulate={handleDrugSimulation}
                />
              </div>
            </motion.div>

            {/* Bottom Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="col-span-6 glass-panel rounded-xl p-4"
              data-testid="organ-panel"
            >
              <OrganPanel
                selectedOrgan={selectedOrgan}
                physiologicalState={physiologicalState}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="col-span-6 glass-panel rounded-xl p-4"
              data-testid="evidence-panel"
            >
              <EvidencePanel
                selectedSystem={selectedSystem}
                equations={equations}
                simulationResults={simulationResults}
              />
            </motion.div>
          </div>
        </div>

        {/* AI Assistant Dock */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className={`border-t border-white/10 transition-all duration-300 ${
            aiDockExpanded ? 'h-96' : 'h-16'
          }`}
          data-testid="ai-dock"
        >
          <div
            className="h-16 px-6 flex items-center justify-between cursor-pointer hover:bg-white/5"
            onClick={() => setAiDockExpanded(!aiDockExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">AI Assistant</p>
                <p className="text-xs text-muted-foreground">Ask about equations, drugs, or physiology</p>
              </div>
            </div>
            {aiDockExpanded ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          
          {aiDockExpanded && (
            <div className="h-80 px-6 pb-4">
              <AIAssistant
                physiologicalState={physiologicalState}
                selectedSystem={selectedSystem}
                simulationResults={simulationResults}
              />
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
