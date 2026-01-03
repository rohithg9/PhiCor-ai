import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, Heart, Activity, Users, Beaker, Brain, Pill,
  ChevronRight, ChevronDown, CheckCircle, ArrowRight, Home,
  Microscope, FlaskConical, Stethoscope, FileText, Calculator,
  MousePointer, Eye, Layers, Target, Zap, Info, HelpCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const UserManual = () => {
  const [expandedSection, setExpandedSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Home,
      content: [
        {
          title: 'Welcome to PhiCore.ai',
          description: 'PhiCore.ai is a Mathematical Human Body platform that quantifies disease states through comprehensive clinical parameters. The platform allows you to explore how diseases affect different organ systems with measurable, evidence-based data.',
          steps: [
            'Navigate to the Dashboard from the home page',
            'Use the "Find Condition" panel to search for diseases',
            'Click on a disease to see its complete parameter profile',
            'Explore different organ systems using the top navigation tabs'
          ]
        }
      ]
    },
    {
      id: 'dashboard',
      title: 'Using the Dashboard',
      icon: Activity,
      content: [
        {
          title: 'Dashboard Layout',
          description: 'The dashboard is divided into several key areas:',
          steps: [
            '**Top Bar**: Organ system tabs (Heart, Lungs, Kidneys, etc.) for quick navigation',
            '**Left Panel**: Patient & Tools section with Patient Manager, PhiCor Assistant, Calculators, and EMR Connect',
            '**Right Panel**: "Find Condition" panel to search and select diseases',
            '**Main Area**: Parameter display showing affected values, clinical data, and molecular profiles'
          ]
        },
        {
          title: 'Organ System Tabs',
          description: 'The top navigation shows all organ systems. Numbers next to icons indicate how many parameters are affected by the selected disease.',
          steps: [
            'Click any organ icon to view parameters specific to that organ',
            'Red/orange highlighting indicates organs affected by the current disease',
            'Use the scale tabs (Geometry, Pressures, etc.) to explore different parameter categories'
          ]
        }
      ]
    },
    {
      id: 'finding-diseases',
      title: 'Finding & Selecting Diseases',
      icon: Search,
      content: [
        {
          title: 'Search for Diseases',
          description: 'Use the "Find Condition" panel on the right side of the dashboard:',
          steps: [
            'Type the disease name in the search box (e.g., "Diabetes", "Heart Failure")',
            'Results show matching diseases with ICD-10 codes',
            'Click on a disease to select it and view its parameters'
          ]
        },
        {
          title: 'Browse by Category',
          description: 'Diseases are organized into categories:',
          steps: [
            'Click on category headers (Ischemic/CAD, Heart Failure, Arrhythmias, etc.) to expand',
            'Browse diseases within each category',
            'The number next to each category shows how many diseases it contains'
          ]
        },
        {
          title: 'Active Condition Banner',
          description: 'When a disease is selected, you\'ll see:',
          steps: [
            'Disease name prominently displayed with gradient highlighting',
            'ICD-10 code badge for reference',
            '"Affected parameters" count showing total changes',
            '"Clear" button to reset the selection'
          ]
        }
      ]
    },
    {
      id: 'understanding-parameters',
      title: 'Understanding Parameters',
      icon: Layers,
      content: [
        {
          title: 'Parameter Display',
          description: 'Each disease shows how it affects various clinical parameters:',
          steps: [
            '**Change Percentage**: Shows how much the parameter changes (e.g., +150%, -30%)',
            '**Direction**: ↑ increase (red), ↓ decrease (blue), or present/absent',
            '**Value**: The actual clinical value with units (e.g., 145 mmHg)',
            '**Evidence**: Brief note explaining why this change occurs'
          ]
        },
        {
          title: 'Parameter Categories',
          description: 'Parameters are organized into clinical categories:',
          steps: [
            '**Vital Signs**: Blood pressure, heart rate, respiratory rate, temperature',
            '**Laboratory Tests**: Blood chemistry, CBC, cardiac enzymes, lipid panel',
            '**Physical Exam**: Heart sounds, lung sounds, edema, reflexes',
            '**ECG Findings**: Rhythm, intervals, ST changes, waves',
            '**Imaging**: Echo findings, X-ray, CT/MRI results',
            '**DNA & Genetics**: Molecular markers, genetic variants, biomarkers'
          ]
        },
        {
          title: 'Affected Organs Summary',
          description: 'The "AFFECTED" tabs show which organs are impacted:',
          steps: [
            'Click "All" to see all parameters across all organs',
            'Click specific organ tabs (Heart, Blood, Kidneys) to filter',
            'Numbers indicate parameter count for each organ',
            'Expand the list to see "+X more parameters"'
          ]
        }
      ]
    },
    {
      id: 'patient-management',
      title: 'Patient Management',
      icon: Users,
      content: [
        {
          title: 'Creating Patient Profiles',
          description: 'The Patient Management system lets you create patient profiles to see how individual characteristics affect disease parameters:',
          steps: [
            'Click "Patient Data" in the header to open the left panel',
            'Click "New" to create a new patient profile',
            'Enter demographics: Age, Sex, Height, Weight (BMI auto-calculates)',
            'Set risk factors: Smoking status, Alcohol use',
            'Add family history: CAD, Diabetes, Stroke, etc.',
            'Select comorbidities: Diabetes, Hypertension, CKD, etc.',
            'Click "Save Patient" to store the profile'
          ]
        },
        {
          title: 'Applying Patient Factors',
          description: 'Patient characteristics modify disease parameters:',
          steps: [
            'Select a saved patient from the list',
            'Select a disease from the dashboard',
            'See "parameter modifiers active" message showing how patient factors affect the disease',
            'Use "Baseline (No Patient)" to see default disease parameters without patient modifiers'
          ]
        }
      ]
    },
    {
      id: 'phicor-assistant',
      title: 'PhiCor Assistant',
      icon: Brain,
      content: [
        {
          title: 'AI-Powered Medical Assistant',
          description: 'The PhiCor Assistant provides intelligent answers about the selected disease:',
          steps: [
            'Click the chat icon in the left panel tabs',
            'Select a disease first for context-aware responses',
            'Ask questions about symptoms, treatments, prognosis',
            'The assistant uses the actual disease data to provide accurate information'
          ]
        },
        {
          title: 'Example Questions',
          description: 'Try asking:',
          steps: [
            '"What are the main symptoms of this condition?"',
            '"What lab tests should I order?"',
            '"What is the typical treatment approach?"',
            '"How does this affect the heart?"',
            '"What are the risk factors?"'
          ]
        }
      ]
    },
    {
      id: 'clinical-calculators',
      title: 'Clinical Calculators',
      icon: Calculator,
      content: [
        {
          title: 'Available Calculators',
          description: 'Access clinical calculators from the left panel:',
          steps: [
            '**CHA₂DS₂-VASc**: Stroke risk in atrial fibrillation',
            '**MELD Score**: Liver disease severity',
            '**Wells Score**: DVT/PE probability',
            '**CURB-65**: Pneumonia severity',
            '**More coming soon...**'
          ]
        }
      ]
    },
    {
      id: 'tips-tricks',
      title: 'Tips & Tricks',
      icon: Zap,
      content: [
        {
          title: 'Quick Navigation',
          description: 'Efficient ways to use the platform:',
          steps: [
            'Use keyboard shortcut Ctrl/Cmd + K to open search',
            'Click scale tabs to auto-scroll to that parameter section',
            'Hover over parameter badges to see detailed evidence',
            'Use the severity slider to see how parameters change with disease progression'
          ]
        },
        {
          title: 'Understanding the Data',
          description: 'The platform provides evidence-based parameters:',
          steps: [
            'All parameters are sourced from medical literature',
            'AI-enhanced data provides comprehensive coverage',
            'ICD-10 codes link to standard classifications',
            'Color coding helps identify increases (red) vs decreases (blue)'
          ]
        }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-semibold">PhiCore.ai</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-semibold">User Manual</span>
              </div>
            </div>
            <Link to="/dashboard">
              <Button variant="default" size="sm">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Complete User Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              PhiCore.ai User Manual
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn how to use the Mathematical Human Body platform to explore diseases, 
              understand clinical parameters, and manage patient profiles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={expandedSection === section.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSection(section.id)}
                className="gap-2"
              >
                <section.icon className="w-4 h-4" />
                {section.title}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-xl overflow-hidden bg-card"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {section.content.length} topic{section.content.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedSection === section.id ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Section Content */}
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-6 space-y-8">
                      {section.content.map((item, itemIndex) => (
                        <div key={itemIndex} className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-primary" />
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground">{item.description}</p>
                          <ul className="space-y-3">
                            {item.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start gap-3">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-medium">
                                  {stepIndex + 1}
                                </span>
                                <span 
                                  className="text-sm"
                                  dangerouslySetInnerHTML={{ 
                                    __html: step.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') 
                                  }}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Visual Guide Section */}
          <section className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Eye className="w-7 h-7 text-primary" />
              Visual Reference Guide
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Dashboard Overview */}
              <div className="p-4 rounded-xl bg-background border border-border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Dashboard Overview
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-red-500">1</Badge>
                    <span>Organ System Tabs - Navigate between organs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-blue-500">2</Badge>
                    <span>Scale Tabs - View different parameter categories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500">3</Badge>
                    <span>Active Condition Banner - Shows selected disease</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-purple-500">4</Badge>
                    <span>Affected Parameters - All changes summarized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-orange-500">5</Badge>
                    <span>Clinical Parameters - Detailed breakdowns</span>
                  </div>
                </div>
              </div>

              {/* Parameter Card */}
              <div className="p-4 rounded-xl bg-background border border-border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Reading Parameter Cards
                </h3>
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">BNP</span>
                    <span className="text-destructive flex items-center gap-1">
                      ↑ +300% <span className="text-xs">pg/mL</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Cardiac strain marker</p>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• <strong>Name</strong>: Parameter being measured</p>
                  <p>• <strong>Arrow</strong>: ↑ increase, ↓ decrease</p>
                  <p>• <strong>Percentage</strong>: Change from normal</p>
                  <p>• <strong>Unit</strong>: Clinical measurement unit</p>
                  <p>• <strong>Note</strong>: Medical explanation</p>
                </div>
              </div>
            </div>
          </section>

          {/* Need Help Section */}
          <section className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Need more help? Use the PhiCor Assistant in the dashboard for real-time guidance.
              </span>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            PhiCore.ai - Mathematical Human Body Platform
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/user-manual" className="text-sm text-primary font-medium">
              User Manual
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserManual;
