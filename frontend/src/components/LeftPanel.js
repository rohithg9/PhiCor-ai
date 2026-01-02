import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Calculator, FileText, Mail, User, History,
  Cigarette, Wine, HeartPulse, Pill, AlertCircle, ChevronRight,
  Send, Sparkles, X, Phone, ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Slider } from './ui/slider';

// Clinical Calculators Component
const ClinicalCalculators = ({ selectedDisease }) => {
  const [selectedCalc, setSelectedCalc] = useState('chads');
  const [calcInputs, setCalcInputs] = useState({});
  const [calcResult, setCalcResult] = useState(null);

  const calculators = {
    chads: {
      name: 'CHA₂DS₂-VASc',
      description: 'Stroke Risk in Atrial Fibrillation',
      fields: [
        { id: 'chf', label: 'CHF History', points: 1 },
        { id: 'hypertension', label: 'Hypertension', points: 1 },
        { id: 'age75', label: 'Age ≥75', points: 2 },
        { id: 'diabetes', label: 'Diabetes', points: 1 },
        { id: 'stroke', label: 'Prior Stroke/TIA', points: 2 },
        { id: 'vascular', label: 'Vascular Disease', points: 1 },
        { id: 'age65', label: 'Age 65-74', points: 1 },
        { id: 'female', label: 'Female Sex', points: 1 }
      ],
      interpret: (score) => {
        if (score === 0) return { risk: 'Low', action: 'No anticoagulation', color: 'green' };
        if (score === 1) return { risk: 'Low-Moderate', action: 'Consider anticoagulation', color: 'yellow' };
        return { risk: 'Moderate-High', action: 'Anticoagulation recommended', color: 'red' };
      }
    },
    hasbled: {
      name: 'HAS-BLED',
      description: 'Bleeding Risk on Anticoagulation',
      fields: [
        { id: 'hypertension', label: 'Hypertension (>160 systolic)', points: 1 },
        { id: 'renal', label: 'Renal Disease', points: 1 },
        { id: 'liver', label: 'Liver Disease', points: 1 },
        { id: 'stroke', label: 'Stroke History', points: 1 },
        { id: 'bleeding', label: 'Prior Bleeding', points: 1 },
        { id: 'labile', label: 'Labile INR', points: 1 },
        { id: 'elderly', label: 'Age >65', points: 1 },
        { id: 'drugs', label: 'Drugs/Alcohol', points: 1 }
      ],
      interpret: (score) => {
        if (score <= 2) return { risk: 'Low', action: 'Acceptable bleeding risk', color: 'green' };
        return { risk: 'High', action: 'Caution with anticoagulation', color: 'red' };
      }
    },
    wells_dvt: {
      name: 'Wells DVT',
      description: 'DVT Probability',
      fields: [
        { id: 'cancer', label: 'Active Cancer', points: 1 },
        { id: 'paralysis', label: 'Paralysis/Immobilization', points: 1 },
        { id: 'bedridden', label: 'Bedridden >3 days / Surgery', points: 1 },
        { id: 'tenderness', label: 'Localized tenderness', points: 1 },
        { id: 'swelling', label: 'Entire leg swollen', points: 1 },
        { id: 'calf', label: 'Calf >3cm larger', points: 1 },
        { id: 'edema', label: 'Pitting edema', points: 1 },
        { id: 'collateral', label: 'Collateral veins', points: 1 },
        { id: 'alternative', label: 'Alternative diagnosis likely', points: -2 }
      ],
      interpret: (score) => {
        if (score <= 0) return { risk: 'Low', action: 'D-dimer to rule out', color: 'green' };
        if (score <= 2) return { risk: 'Moderate', action: 'Ultrasound recommended', color: 'yellow' };
        return { risk: 'High', action: 'Ultrasound + consider anticoagulation', color: 'red' };
      }
    },
    curb65: {
      name: 'CURB-65',
      description: 'Pneumonia Severity',
      fields: [
        { id: 'confusion', label: 'Confusion', points: 1 },
        { id: 'urea', label: 'BUN >19 mg/dL', points: 1 },
        { id: 'respiratory', label: 'RR ≥30', points: 1 },
        { id: 'bp', label: 'BP <90/60', points: 1 },
        { id: 'age', label: 'Age ≥65', points: 1 }
      ],
      interpret: (score) => {
        if (score <= 1) return { risk: 'Low', action: 'Outpatient treatment', color: 'green' };
        if (score === 2) return { risk: 'Moderate', action: 'Consider admission', color: 'yellow' };
        return { risk: 'Severe', action: 'ICU admission', color: 'red' };
      }
    }
  };

  const calculateScore = () => {
    const calc = calculators[selectedCalc];
    let score = 0;
    calc.fields.forEach(field => {
      if (calcInputs[field.id]) {
        score += field.points;
      }
    });
    setCalcResult({ score, ...calc.interpret(score) });
  };

  const calc = calculators[selectedCalc];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {Object.entries(calculators).map(([key, c]) => (
          <Button
            key={key}
            variant={selectedCalc === key ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-7"
            onClick={() => { setSelectedCalc(key); setCalcResult(null); setCalcInputs({}); }}
          >
            {c.name}
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground">{calc.description}</div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {calc.fields.map(field => (
          <label key={field.id} className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={calcInputs[field.id] || false}
              onChange={(e) => setCalcInputs(prev => ({ ...prev, [field.id]: e.target.checked }))}
              className="rounded border-border"
            />
            <span>{field.label}</span>
            <span className="text-muted-foreground ml-auto">
              {field.points > 0 ? `+${field.points}` : field.points}
            </span>
          </label>
        ))}
      </div>
      
      <Button size="sm" className="w-full" onClick={calculateScore}>
        <Calculator className="w-3 h-3 mr-1" />
        Calculate
      </Button>
      
      {calcResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg border ${
            calcResult.color === 'green' ? 'bg-green-500/10 border-green-500/30' :
            calcResult.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="text-lg font-bold">Score: {calcResult.score}</div>
          <div className="text-sm font-medium">{calcResult.risk} Risk</div>
          <div className="text-xs text-muted-foreground">{calcResult.action}</div>
        </motion.div>
      )}
    </div>
  );
};

// Patient Input Panel Component
const PatientInputPanel = ({ onPatientDataChange }) => {
  const [patientData, setPatientData] = useState({
    age: '',
    sex: '',
    chiefComplaint: '',
    smokingStatus: 'never',
    smokingPackYears: 0,
    alcoholStatus: 'none',
    alcoholDrinksPerWeek: 0,
    familyHistory: {
      cad: false,
      diabetes: false,
      stroke: false,
      cancer: false,
      hypertension: false
    },
    pastMedicalHistory: '',
    currentMedications: '',
    allergies: ''
  });

  const handleChange = (field, value) => {
    const newData = { ...patientData, [field]: value };
    setPatientData(newData);
    onPatientDataChange?.(newData);
  };

  return (
    <div className="space-y-4">
      {/* Demographics */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Demographics</div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Age"
            type="number"
            value={patientData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            className="h-8 text-xs"
          />
          <select
            value={patientData.sex}
            onChange={(e) => handleChange('sex', e.target.value)}
            className="h-8 text-xs rounded-md border border-border bg-background px-2"
          >
            <option value="">Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chief Complaint</div>
        <Textarea
          placeholder="Enter presenting symptoms..."
          value={patientData.chiefComplaint}
          onChange={(e) => handleChange('chiefComplaint', e.target.value)}
          className="min-h-[60px] text-xs resize-none"
        />
      </div>

      {/* Risk Factors */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Risk Factors
        </div>
        
        {/* Smoking */}
        <div className="flex items-center gap-2">
          <Cigarette className="w-3 h-3 text-muted-foreground" />
          <select
            value={patientData.smokingStatus}
            onChange={(e) => handleChange('smokingStatus', e.target.value)}
            className="flex-1 h-7 text-xs rounded-md border border-border bg-background px-2"
          >
            <option value="never">Never Smoked</option>
            <option value="former">Former Smoker</option>
            <option value="current">Current Smoker</option>
          </select>
          {patientData.smokingStatus !== 'never' && (
            <Input
              type="number"
              placeholder="Pack-yrs"
              value={patientData.smokingPackYears}
              onChange={(e) => handleChange('smokingPackYears', e.target.value)}
              className="w-20 h-7 text-xs"
            />
          )}
        </div>

        {/* Alcohol */}
        <div className="flex items-center gap-2">
          <Wine className="w-3 h-3 text-muted-foreground" />
          <select
            value={patientData.alcoholStatus}
            onChange={(e) => handleChange('alcoholStatus', e.target.value)}
            className="flex-1 h-7 text-xs rounded-md border border-border bg-background px-2"
          >
            <option value="none">Non-drinker</option>
            <option value="social">Social</option>
            <option value="moderate">Moderate</option>
            <option value="heavy">Heavy</option>
          </select>
          {patientData.alcoholStatus !== 'none' && (
            <Input
              type="number"
              placeholder="drinks/wk"
              value={patientData.alcoholDrinksPerWeek}
              onChange={(e) => handleChange('alcoholDrinksPerWeek', e.target.value)}
              className="w-20 h-7 text-xs"
            />
          )}
        </div>

        {/* Family History */}
        <div className="space-y-1">
          <div className="text-[10px] text-muted-foreground">Family History (1st degree)</div>
          <div className="flex flex-wrap gap-1">
            {[
              { key: 'cad', label: 'CAD' },
              { key: 'diabetes', label: 'DM' },
              { key: 'stroke', label: 'Stroke' },
              { key: 'hypertension', label: 'HTN' },
              { key: 'cancer', label: 'Cancer' }
            ].map(item => (
              <Badge
                key={item.key}
                variant={patientData.familyHistory[item.key] ? 'default' : 'outline'}
                className="cursor-pointer text-[10px] h-5"
                onClick={() => handleChange('familyHistory', {
                  ...patientData.familyHistory,
                  [item.key]: !patientData.familyHistory[item.key]
                })}
              >
                {item.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* PMH */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <History className="w-3 h-3" /> Past Medical History
        </div>
        <Textarea
          placeholder="HTN, DM2, Hyperlipidemia..."
          value={patientData.pastMedicalHistory}
          onChange={(e) => handleChange('pastMedicalHistory', e.target.value)}
          className="min-h-[40px] text-xs resize-none"
        />
      </div>

      {/* Medications */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Pill className="w-3 h-3" /> Current Medications
        </div>
        <Textarea
          placeholder="Lisinopril 10mg, Metformin 500mg..."
          value={patientData.currentMedications}
          onChange={(e) => handleChange('currentMedications', e.target.value)}
          className="min-h-[40px] text-xs resize-none"
        />
      </div>

      {/* Allergies */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Allergies</div>
        <Input
          placeholder="Penicillin, Sulfa..."
          value={patientData.allergies}
          onChange={(e) => handleChange('allergies', e.target.value)}
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
};

// PhiCor AI Assistant Component
const PhiCorAssistant = ({ selectedDisease, currentOrgan }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'I\'m PhiCor Assistant. Ask me about disease parameters, treatment effects, or clinical decisions. I\'ll show how choices affect the mathematical model.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    'How does beta-blocker affect heart rate in this condition?',
    'What parameters indicate worsening?',
    'Suggest next diagnostic tests',
    'Compare treatment options'
  ];

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in production, this would call the backend)
    setTimeout(() => {
      const response = {
        role: 'assistant',
        content: `Based on ${selectedDisease?.name || 'the selected condition'}, here's my analysis:\n\n` +
          `**Parameter Impact:**\n` +
          `• Heart Rate: Expected to ${Math.random() > 0.5 ? 'increase' : 'decrease'} by ~15%\n` +
          `• Blood Pressure: Systolic may ${Math.random() > 0.5 ? 'rise' : 'fall'}\n\n` +
          `**Recommended Actions:**\n` +
          `1. Monitor troponin levels\n` +
          `2. Consider echo if EF <40%\n` +
          `3. Review medication interactions`,
        parameterChanges: [
          { name: 'Heart Rate', change: '+15%', icon: '❤️' },
          { name: 'Systolic BP', change: '-10mmHg', icon: '📊' }
        ]
      };
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-2">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg text-xs ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-4'
                  : 'bg-muted mr-4'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.parameterChanges && (
                <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                  {msg.parameterChanges.map((p, j) => (
                    <div key={j} className="flex items-center gap-2 text-[10px]">
                      <span>{p.icon}</span>
                      <span>{p.name}:</span>
                      <Badge variant="outline" className="h-4 text-[10px]">{p.change}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="bg-muted p-2 rounded-lg mr-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3 animate-pulse" />
                Analyzing...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {messages.length < 3 && (
        <div className="py-2 space-y-1">
          <div className="text-[10px] text-muted-foreground">Suggestions:</div>
          <div className="flex flex-wrap gap-1">
            {suggestedQuestions.slice(0, 2).map((q, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-[10px] h-6 px-2"
                onClick={() => setInput(q)}
              >
                {q.substring(0, 25)}...
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t border-border/50">
        <Input
          placeholder="Ask about parameters, treatments..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 h-8 text-xs"
        />
        <Button size="sm" className="h-8 w-8 p-0" onClick={handleSend}>
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

// EMR Connect Placeholder Component
const EMRConnectPanel = () => {
  return (
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
        <FileText className="w-8 h-8 text-primary" />
      </div>
      
      <div>
        <div className="font-semibold">EMR Integration</div>
        <div className="text-xs text-muted-foreground mt-1">
          Connect your Electronic Medical Records system to import patient data directly into PhiCor
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Supported Systems:</div>
        <div className="flex flex-wrap gap-1 justify-center">
          {['Epic', 'Cerner', 'Meditech', 'Allscripts', 'HL7 FHIR'].map(emr => (
            <Badge key={emr} variant="outline" className="text-[10px]">{emr}</Badge>
          ))}
        </div>
      </div>

      <div className="pt-4 space-y-2">
        <Button className="w-full" variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Contact for Integration
        </Button>
        <div className="text-[10px] text-muted-foreground">
          or email: emr@phicore.ai
        </div>
      </div>
    </div>
  );
};

// Main Left Panel Component
const LeftPanel = ({ 
  selectedDisease, 
  currentOrgan,
  onPatientDataChange,
  isMobile = false 
}) => {
  const [activeTab, setActiveTab] = useState('patient');

  const content = (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 h-9">
          <TabsTrigger value="patient" className="text-xs px-1">
            <User className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="assistant" className="text-xs px-1">
            <MessageSquare className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="calc" className="text-xs px-1">
            <Calculator className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="emr" className="text-xs px-1">
            <FileText className="w-3 h-3" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 mt-3">
          <TabsContent value="patient" className="mt-0 h-full">
            <PatientInputPanel onPatientDataChange={onPatientDataChange} />
          </TabsContent>
          
          <TabsContent value="assistant" className="mt-0 h-full">
            <PhiCorAssistant selectedDisease={selectedDisease} currentOrgan={currentOrgan} />
          </TabsContent>
          
          <TabsContent value="calc" className="mt-0">
            <ClinicalCalculators selectedDisease={selectedDisease} />
          </TabsContent>
          
          <TabsContent value="emr" className="mt-0">
            <EMRConnectPanel />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return content;
  }

  return (
    <aside className="w-72 border-r border-border/50 bg-card/30 p-4 flex flex-col">
      <div className="text-sm font-semibold mb-3 flex items-center gap-2">
        <User className="w-4 h-4" />
        Patient & Tools
      </div>
      {content}
    </aside>
  );
};

export default LeftPanel;
export { PatientInputPanel, PhiCorAssistant, ClinicalCalculators, EMRConnectPanel };
