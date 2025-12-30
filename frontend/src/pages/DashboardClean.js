import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Heart, Brain, Zap, Moon, Sun, LogOut, Settings,
  ChevronRight, ChevronDown, Play, Pause, RotateCcw, Info
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import BodyMapClean from '../components/BodyMapClean';
import EquationView from '../components/EquationView';
import SystemSummary from '../components/SystemSummary';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Physiological systems with their governing equations
const BODY_SYSTEMS = {
  cardiovascular: {
    name: 'Cardiovascular',
    icon: '❤️',
    color: 'text-red-400',
    baseEquations: [
      { id: 'co', name: 'Cardiac Output', latex: 'CO = SV \\times HR', description: 'Blood pumped per minute' },
      { id: 'map', name: 'Mean Arterial Pressure', latex: 'MAP = DBP + \\frac{1}{3}(SBP - DBP)', description: 'Average blood pressure' },
      { id: 'svr', name: 'Systemic Vascular Resistance', latex: 'SVR = \\frac{MAP - CVP}{CO}', description: 'Resistance to blood flow' },
      { id: 'fs', name: 'Frank-Starling', latex: 'SV = SV_{max}(1 - e^{-k \\cdot EDV})', description: 'Preload-stroke volume relationship' },
    ],
    baseValues: { hr: 70, sv: 70, sbp: 120, dbp: 80, co: 5.0 }
  },
  respiratory: {
    name: 'Respiratory',
    icon: '🫁',
    color: 'text-blue-400',
    baseEquations: [
      { id: 'mv', name: 'Minute Ventilation', latex: 'V_E = V_T \\times RR', description: 'Total air breathed per minute' },
      { id: 'av', name: 'Alveolar Ventilation', latex: 'V_A = (V_T - V_D) \\times RR', description: 'Effective gas exchange' },
      { id: 'fick', name: 'Fick Equation', latex: 'VO_2 = CO \\times (CaO_2 - CvO_2)', description: 'Oxygen consumption' },
      { id: 'pao2', name: 'Alveolar Gas', latex: 'P_AO_2 = FiO_2(P_B - P_{H2O}) - \\frac{P_ACO_2}{R}', description: 'Alveolar oxygen' },
    ],
    baseValues: { rr: 14, vt: 500, spo2: 98, pao2: 95 }
  },
  renal: {
    name: 'Renal',
    icon: '🫘',
    color: 'text-amber-400',
    baseEquations: [
      { id: 'gfr', name: 'GFR', latex: 'GFR = K_f \\times (P_{GC} - P_{BC} - \\pi_{GC})', description: 'Glomerular filtration rate' },
      { id: 'crcl', name: 'Creatinine Clearance', latex: 'CrCl = \\frac{(140-age) \\times weight}{72 \\times Cr}', description: 'Kidney function estimate' },
      { id: 'ff', name: 'Filtration Fraction', latex: 'FF = \\frac{GFR}{RPF}', description: 'Filtered plasma fraction' },
      { id: 'urine', name: 'Urine Output', latex: 'UO = GFR - Reabsorption + Secretion', description: 'Net urine production' },
    ],
    baseValues: { gfr: 100, creatinine: 1.0, bun: 15, uo: 1500 }
  },
  metabolic: {
    name: 'Metabolic',
    icon: '🔥',
    color: 'text-orange-400',
    baseEquations: [
      { id: 'glucose', name: 'Glucose Dynamics', latex: '\\frac{dG}{dt} = -p_1(G-G_b) - X \\cdot G + R_a', description: 'Blood glucose regulation' },
      { id: 'insulin', name: 'Insulin Action', latex: '\\frac{dX}{dt} = -p_2 X + p_3(I - I_b)', description: 'Insulin effect over time' },
      { id: 'homa', name: 'HOMA-IR', latex: 'HOMA = \\frac{Glucose \\times Insulin}{405}', description: 'Insulin resistance index' },
      { id: 'bmr', name: 'Basal Metabolic Rate', latex: 'BMR = 10W + 6.25H - 5A + S', description: 'Energy at rest' },
    ],
    baseValues: { glucose: 90, insulin: 10, hba1c: 5.5 }
  },
  hepatic: {
    name: 'Hepatic',
    icon: '🟤',
    color: 'text-yellow-600',
    baseEquations: [
      { id: 'clearance', name: 'Hepatic Clearance', latex: 'Cl_H = Q_H \\times E', description: 'Drug removal by liver' },
      { id: 'extraction', name: 'Extraction Ratio', latex: 'E = \\frac{f_u \\times Cl_{int}}{Q_H + f_u \\times Cl_{int}}', description: 'Drug extraction efficiency' },
      { id: 'cyp', name: 'Michaelis-Menten', latex: 'v = \\frac{V_{max}[S]}{K_m + [S]}', description: 'Enzyme kinetics' },
      { id: 'bilirubin', name: 'Bilirubin Metabolism', latex: 'B_{total} = B_{direct} + B_{indirect}', description: 'Bilirubin breakdown' },
    ],
    baseValues: { alt: 25, ast: 22, albumin: 4.0, bilirubin: 0.8 }
  },
  neural: {
    name: 'Neurological',
    icon: '🧠',
    color: 'text-purple-400',
    baseEquations: [
      { id: 'cpp', name: 'Cerebral Perfusion', latex: 'CPP = MAP - ICP', description: 'Brain blood flow pressure' },
      { id: 'cbf', name: 'Cerebral Blood Flow', latex: 'CBF = \\frac{CPP}{CVR}', description: 'Brain blood flow rate' },
      { id: 'icp', name: 'Intracranial Pressure', latex: 'V_{brain} + V_{CSF} + V_{blood} = V_{skull}', description: 'Monro-Kellie doctrine' },
      { id: 'temp', name: 'Thermoregulation', latex: '\\frac{dT}{dt} = \\frac{M - E - R - C}{m \\cdot c}', description: 'Body temperature control' },
    ],
    baseValues: { map: 90, icp: 10, cpp: 80, temp: 37.0 }
  }
};

// Influences (diseases, conditions, interventions)
const INFLUENCES = {
  diseases: [
    { id: 'heart_failure', name: 'Heart Failure', affects: ['cardiovascular', 'renal', 'respiratory'], severity: [0.1, 1.0] },
    { id: 'diabetes', name: 'Diabetes Mellitus', affects: ['metabolic', 'cardiovascular', 'renal'], severity: [0.1, 1.0] },
    { id: 'ckd', name: 'Chronic Kidney Disease', affects: ['renal', 'cardiovascular', 'metabolic'], severity: [0.1, 1.0] },
    { id: 'copd', name: 'COPD', affects: ['respiratory', 'cardiovascular'], severity: [0.1, 1.0] },
    { id: 'cirrhosis', name: 'Liver Cirrhosis', affects: ['hepatic', 'cardiovascular', 'renal'], severity: [0.1, 1.0] },
    { id: 'hypertension', name: 'Hypertension', affects: ['cardiovascular', 'renal', 'neural'], severity: [0.1, 1.0] },
    { id: 'sepsis', name: 'Sepsis', affects: ['cardiovascular', 'respiratory', 'renal', 'hepatic', 'metabolic'], severity: [0.1, 1.0] },
  ],
  acute: [
    { id: 'hemorrhage', name: 'Acute Hemorrhage', affects: ['cardiovascular', 'renal', 'neural'], severity: [0.1, 1.0] },
    { id: 'mi', name: 'Myocardial Infarction', affects: ['cardiovascular', 'metabolic'], severity: [0.1, 1.0] },
    { id: 'pe', name: 'Pulmonary Embolism', affects: ['respiratory', 'cardiovascular'], severity: [0.1, 1.0] },
    { id: 'stroke', name: 'Stroke', affects: ['neural', 'cardiovascular'], severity: [0.1, 1.0] },
    { id: 'aki', name: 'Acute Kidney Injury', affects: ['renal', 'metabolic'], severity: [0.1, 1.0] },
  ],
  environmental: [
    { id: 'hypoxia', name: 'High Altitude / Hypoxia', affects: ['respiratory', 'cardiovascular', 'neural'], severity: [0.1, 1.0] },
    { id: 'hypothermia', name: 'Hypothermia', affects: ['neural', 'cardiovascular', 'metabolic'], severity: [0.1, 1.0] },
    { id: 'hyperthermia', name: 'Hyperthermia / Fever', affects: ['neural', 'cardiovascular', 'metabolic'], severity: [0.1, 1.0] },
    { id: 'dehydration', name: 'Dehydration', affects: ['renal', 'cardiovascular'], severity: [0.1, 1.0] },
  ]
};

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [selectedSystem, setSelectedSystem] = useState(null);
  const [activeInfluence, setActiveInfluence] = useState(null);
  const [influenceSeverity, setInfluenceSeverity] = useState(0.5);
  const [timeMode, setTimeMode] = useState('steady'); // 'steady', 'acute', 'chronic'
  const [simulationTime, setSimulationTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [equationChanges, setEquationChanges] = useState({});

  // Calculate equation changes based on influence
  useEffect(() => {
    if (activeInfluence) {
      const changes = {};
      const influence = [...INFLUENCES.diseases, ...INFLUENCES.acute, ...INFLUENCES.environmental]
        .find(i => i.id === activeInfluence);
      
      if (influence) {
        influence.affects.forEach(systemId => {
          changes[systemId] = {
            affected: true,
            severity: influenceSeverity,
            modifications: getEquationModifications(systemId, activeInfluence, influenceSeverity)
          };
        });
      }
      setEquationChanges(changes);
    } else {
      setEquationChanges({});
    }
  }, [activeInfluence, influenceSeverity]);

  const getEquationModifications = (systemId, influenceId, severity) => {
    // Return modified equations based on influence
    // Structure: { equationId: { latex: '...', delta: '...' } }
    const mods = {
      heart_failure: {
        cardiovascular: { 
          co: { latex: `CO = SV \\times HR \\times ${(1 - severity * 0.4).toFixed(2)}`, delta: `-${(severity * 40).toFixed(0)}%` },
          fs: { latex: `SV = SV_{max}(1 - e^{-k \\cdot EDV}) \\times ${(1 - severity * 0.3).toFixed(2)}`, delta: `Contractility ↓` }
        },
        renal: { 
          gfr: { latex: `GFR_{eff} = GFR \\times ${(1 - severity * 0.3).toFixed(2)}`, delta: `-${(severity * 30).toFixed(0)}%` }
        },
        respiratory: {
          fick: { latex: `VO_2 = (CO \\times ${(1 - severity * 0.4).toFixed(2)}) \\times (CaO_2 - CvO_2)`, delta: `↓ O₂ delivery` }
        }
      },
      diabetes: {
        metabolic: { 
          glucose: { latex: `G_{fasting} = ${(90 + severity * 80).toFixed(0)} \\text{ mg/dL}`, delta: `+${(severity * 80).toFixed(0)} mg/dL` },
          homa: { latex: `HOMA = \\frac{${(90 + severity * 80).toFixed(0)} \\times ${(10 + severity * 15).toFixed(0)}}{405}`, delta: `Insulin resistance` }
        },
        cardiovascular: {
          map: { latex: `MAP_{risk} \\uparrow ${(severity * 15).toFixed(0)}\\%`, delta: `Vascular damage` }
        },
        renal: { 
          gfr: { latex: `GFR \\downarrow ${(severity * 2).toFixed(1)}\\text{ mL/min/year}`, delta: 'Progressive decline' }
        }
      },
      ckd: {
        renal: {
          gfr: { latex: `GFR = ${(100 - severity * 70).toFixed(0)} \\text{ mL/min}`, delta: `Stage ${Math.ceil(severity * 5)}` },
          crcl: { latex: `CrCl \\approx ${(100 - severity * 70).toFixed(0)} \\text{ mL/min}`, delta: `↓ Clearance` }
        },
        cardiovascular: {
          map: { latex: `MAP = ${(90 + severity * 20).toFixed(0)} \\text{ mmHg}`, delta: `Volume overload` }
        },
        metabolic: {
          glucose: { latex: `G \\uparrow ${(severity * 20).toFixed(0)}\\text{ mg/dL (uremia)}`, delta: `Glucose intolerance` }
        }
      },
      copd: {
        respiratory: {
          mv: { latex: `V_E = V_T \\times RR \\times ${(1 + severity * 0.3).toFixed(2)}`, delta: `Compensatory ↑` },
          pao2: { latex: `P_AO_2 = ${(95 - severity * 25).toFixed(0)} \\text{ mmHg}`, delta: `-${(severity * 25).toFixed(0)} mmHg` }
        },
        cardiovascular: {
          svr: { latex: `SVR_{pulm} \\uparrow ${(severity * 40).toFixed(0)}\\%`, delta: `Pulmonary HTN` }
        }
      },
      cirrhosis: {
        hepatic: {
          clearance: { latex: `Cl_H = Q_H \\times E \\times ${(1 - severity * 0.6).toFixed(2)}`, delta: `-${(severity * 60).toFixed(0)}%` },
          cyp: { latex: `V_{max} \\times ${(1 - severity * 0.5).toFixed(2)}`, delta: `↓ Metabolism` }
        },
        cardiovascular: {
          svr: { latex: `SVR \\downarrow ${(severity * 40).toFixed(0)}\\%`, delta: `Vasodilation` }
        },
        renal: {
          gfr: { latex: `GFR_{HRS} = ${(100 - severity * 50).toFixed(0)}`, delta: `Hepatorenal` }
        }
      },
      hypertension: {
        cardiovascular: { 
          map: { latex: `MAP = ${(90 + severity * 30).toFixed(0)} \\text{ mmHg}`, delta: `+${(severity * 30).toFixed(0)} mmHg` },
          svr: { latex: `SVR \\uparrow ${(severity * 30).toFixed(0)}\\%`, delta: `↑ Resistance` }
        },
        renal: { 
          gfr: { latex: `GFR \\times ${(1 - severity * 0.2).toFixed(2)}`, delta: `-${(severity * 20).toFixed(0)}%` }
        },
        neural: {
          cpp: { latex: `CPP = ${(90 + severity * 30).toFixed(0)} - ICP`, delta: `↑ Risk` }
        }
      },
      sepsis: {
        cardiovascular: { 
          svr: { latex: `SVR \\downarrow ${(severity * 50).toFixed(0)}\\%`, delta: `Vasodilation` },
          co: { latex: `CO \\uparrow ${(severity * 30).toFixed(0)}\\%`, delta: `Hyperdynamic` }
        },
        respiratory: { 
          pao2: { latex: `P_AO_2 = ${(95 - severity * 35).toFixed(0)} \\text{ mmHg}`, delta: `ARDS risk` }
        },
        metabolic: { 
          glucose: { latex: `G \\uparrow ${(severity * 80).toFixed(0)}\\text{ mg/dL}`, delta: `Stress response` }
        },
        hepatic: {
          clearance: { latex: `Cl_H \\downarrow ${(severity * 40).toFixed(0)}\\%`, delta: `Shock liver` }
        },
        renal: {
          gfr: { latex: `GFR \\rightarrow ${(100 - severity * 60).toFixed(0)}`, delta: `ATN risk` }
        }
      },
      hemorrhage: {
        cardiovascular: { 
          co: { latex: `CO = ${(5 - severity * 2.5).toFixed(1)} \\text{ L/min}`, delta: `-${(severity * 50).toFixed(0)}%` },
          map: { latex: `MAP = ${(90 - severity * 40).toFixed(0)} \\text{ mmHg}`, delta: `Shock` }
        },
        renal: { 
          gfr: { latex: `GFR \\rightarrow ${(100 - severity * 70).toFixed(0)}`, delta: `Prerenal AKI` }
        },
        neural: {
          cpp: { latex: `CPP = ${(90 - severity * 40).toFixed(0)} - ICP`, delta: `↓ Perfusion` }
        }
      },
      mi: {
        cardiovascular: {
          co: { latex: `CO \\downarrow ${(severity * 40).toFixed(0)}\\%`, delta: `Pump failure` },
          fs: { latex: `SV_{max} \\times ${(1 - severity * 0.4).toFixed(2)}`, delta: `Wall motion ↓` }
        },
        metabolic: {
          glucose: { latex: `G \\uparrow ${(severity * 50).toFixed(0)}\\text{ mg/dL}`, delta: `Stress response` }
        }
      },
      pe: {
        respiratory: {
          pao2: { latex: `P_AO_2 = ${(95 - severity * 40).toFixed(0)} \\text{ mmHg}`, delta: `V/Q mismatch` },
          fick: { latex: `VO_2 \\downarrow ${(severity * 30).toFixed(0)}\\%`, delta: `↓ Gas exchange` }
        },
        cardiovascular: {
          co: { latex: `CO \\downarrow ${(severity * 30).toFixed(0)}\\%`, delta: `RV failure` }
        }
      },
      stroke: {
        neural: {
          cbf: { latex: `CBF_{affected} = ${(50 - severity * 40).toFixed(0)} \\text{ mL/100g/min}`, delta: `Ischemia` },
          icp: { latex: `ICP \\uparrow ${(severity * 20).toFixed(0)} \\text{ mmHg}`, delta: `Edema` }
        },
        cardiovascular: {
          map: { latex: `MAP_{target} = ${(90 + severity * 20).toFixed(0)}`, delta: `Permissive HTN` }
        }
      },
      aki: {
        renal: {
          gfr: { latex: `GFR = ${(100 - severity * 80).toFixed(0)} \\text{ mL/min}`, delta: `Acute ↓` },
          urine: { latex: `UO = ${(1500 - severity * 1200).toFixed(0)} \\text{ mL/day}`, delta: `Oliguria` }
        },
        metabolic: {
          glucose: { latex: `K^+ \\uparrow, pH \\downarrow`, delta: `Electrolyte imbalance` }
        }
      },
      hypoxia: {
        respiratory: {
          pao2: { latex: `P_AO_2 = ${(95 - severity * 40).toFixed(0)} \\text{ mmHg}`, delta: `Altitude effect` },
          mv: { latex: `V_E \\uparrow ${(severity * 50).toFixed(0)}\\%`, delta: `Hyperventilation` }
        },
        cardiovascular: {
          co: { latex: `CO \\uparrow ${(severity * 30).toFixed(0)}\\%`, delta: `Compensation` }
        },
        neural: {
          cbf: { latex: `CBF \\uparrow ${(severity * 20).toFixed(0)}\\%`, delta: `↑ O₂ delivery` }
        }
      },
      hypothermia: {
        neural: {
          temp: { latex: `T = ${(37 - severity * 8).toFixed(1)}°C`, delta: `-${(severity * 8).toFixed(1)}°C` }
        },
        cardiovascular: {
          co: { latex: `CO \\downarrow ${(severity * 40).toFixed(0)}\\%`, delta: `↓ Metabolism` }
        },
        metabolic: {
          bmr: { latex: `BMR \\downarrow ${(severity * 50).toFixed(0)}\\%`, delta: `↓ O₂ demand` }
        }
      },
      hyperthermia: {
        neural: {
          temp: { latex: `T = ${(37 + severity * 5).toFixed(1)}°C`, delta: `+${(severity * 5).toFixed(1)}°C` }
        },
        cardiovascular: {
          co: { latex: `CO \\uparrow ${(severity * 50).toFixed(0)}\\%`, delta: `↑ Heat dissipation` }
        },
        metabolic: {
          bmr: { latex: `BMR \\uparrow ${(severity * 13 * severity).toFixed(0)}\\%/°C`, delta: `↑ O₂ demand` }
        }
      },
      dehydration: {
        renal: {
          gfr: { latex: `GFR \\downarrow ${(severity * 30).toFixed(0)}\\%`, delta: `Prerenal` },
          urine: { latex: `UO = ${(1500 - severity * 1000).toFixed(0)} \\text{ mL/day}`, delta: `↓ Output` }
        },
        cardiovascular: {
          co: { latex: `CO \\downarrow ${(severity * 20).toFixed(0)}\\%`, delta: `↓ Preload` }
        }
      }
    };
    return mods[influenceId]?.[systemId] || null;
  };

  const handleSystemSelect = (systemId) => {
    setSelectedSystem(selectedSystem === systemId ? null : systemId);
  };

  const handleInfluenceSelect = (influenceId) => {
    setActiveInfluence(activeInfluence === influenceId ? null : influenceId);
    setInfluenceSeverity(0.5);
  };

  const resetSimulation = () => {
    setActiveInfluence(null);
    setInfluenceSeverity(0.5);
    setSimulationTime(0);
    setIsPlaying(false);
    setEquationChanges({});
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex">
      {/* Minimal Sidebar */}
      <aside className="w-16 border-r border-white/5 flex flex-col items-center py-6 bg-black/20">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-8">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        
        <nav className="flex-1 flex flex-col items-center gap-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
            data-testid="theme-toggle"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </nav>

        {isAuthenticated && (
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-white/5 px-6 flex items-center justify-between">
          <div>
            <h1 className="font-manrope font-bold text-lg">The Mathematical Human</h1>
            <p className="text-xs text-muted-foreground">Interactive Physiological Modeling System</p>
          </div>
          <div className="flex items-center gap-4">
            {activeInfluence && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetSimulation}
                className="border-white/10 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </header>

        {/* Three Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Body Map */}
          <div className="w-64 border-r border-white/5 p-4 flex flex-col">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Body Systems
            </h2>
            <BodyMapClean
              systems={BODY_SYSTEMS}
              selectedSystem={selectedSystem}
              onSystemSelect={handleSystemSelect}
              equationChanges={equationChanges}
            />
          </div>

          {/* Center: Equation Canvas */}
          <div className="flex-1 p-6 overflow-auto">
            <EquationView
              systems={BODY_SYSTEMS}
              selectedSystem={selectedSystem}
              equationChanges={equationChanges}
              activeInfluence={activeInfluence}
            />
          </div>

          {/* Right: Influence Panel & Summary */}
          <div className="w-80 border-l border-white/5 flex flex-col">
            {/* Influence Selection */}
            <div className="p-4 border-b border-white/5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Apply Influence
              </h2>
              
              <Tabs defaultValue="diseases" className="w-full">
                <TabsList className="w-full mb-4 bg-white/5">
                  <TabsTrigger value="diseases" className="flex-1 text-xs">Diseases</TabsTrigger>
                  <TabsTrigger value="acute" className="flex-1 text-xs">Acute</TabsTrigger>
                  <TabsTrigger value="env" className="flex-1 text-xs">Environment</TabsTrigger>
                </TabsList>

                <TabsContent value="diseases" className="mt-0">
                  <div className="space-y-2">
                    {INFLUENCES.diseases.map(inf => (
                      <button
                        key={inf.id}
                        onClick={() => handleInfluenceSelect(inf.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeInfluence === inf.id
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-white/5 hover:bg-white/10 text-muted-foreground'
                        }`}
                        data-testid={`influence-${inf.id}`}
                      >
                        {inf.name}
                        <span className="text-xs ml-2 opacity-60">
                          ({inf.affects.length} systems)
                        </span>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="acute" className="mt-0">
                  <div className="space-y-2">
                    {INFLUENCES.acute.map(inf => (
                      <button
                        key={inf.id}
                        onClick={() => handleInfluenceSelect(inf.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeInfluence === inf.id
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-white/5 hover:bg-white/10 text-muted-foreground'
                        }`}
                        data-testid={`influence-${inf.id}`}
                      >
                        {inf.name}
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="env" className="mt-0">
                  <div className="space-y-2">
                    {INFLUENCES.environmental.map(inf => (
                      <button
                        key={inf.id}
                        onClick={() => handleInfluenceSelect(inf.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeInfluence === inf.id
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/5 hover:bg-white/10 text-muted-foreground'
                        }`}
                        data-testid={`influence-${inf.id}`}
                      >
                        {inf.name}
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Severity Slider */}
              {activeInfluence && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Severity</span>
                    <span className="text-xs font-mono">{(influenceSeverity * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[influenceSeverity]}
                    onValueChange={([v]) => setInfluenceSeverity(v)}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    className="w-full"
                    data-testid="severity-slider"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* System Summary */}
            <ScrollArea className="flex-1 p-4">
              <SystemSummary
                systems={BODY_SYSTEMS}
                selectedSystem={selectedSystem}
                equationChanges={equationChanges}
                activeInfluence={activeInfluence}
              />
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
