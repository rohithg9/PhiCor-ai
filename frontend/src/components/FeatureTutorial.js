import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, HelpCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

// Tutorial steps for each feature page
const TUTORIAL_STEPS = {
  dashboard: [
    {
      id: 'welcome',
      title: 'Welcome to PhiCor Engine',
      description: 'This is your physiological modeling dashboard. Here you can explore how diseases affect organ systems mathematically.',
      target: null, // Full screen overlay
      position: 'center'
    },
    {
      id: 'disease-search',
      title: 'Search Diseases',
      description: 'Search from 186+ diseases by name or ICD-10 code. Each disease includes mathematical models showing parameter changes.',
      target: '[data-tutorial="disease-search"]',
      position: 'bottom'
    },
    {
      id: 'organ-nav',
      title: 'Organ Systems',
      description: 'Navigate between 6 organ systems. Each organ has detailed physiological parameters organized by scale.',
      target: '[data-tutorial="organ-nav"]',
      position: 'right'
    },
    {
      id: 'parameter-view',
      title: 'Parameter Scales',
      description: 'View parameters at different scales: Geometry, Pressures, Structure, Physiology, and Cellular levels.',
      target: '[data-tutorial="scale-tabs"]',
      position: 'bottom'
    },
    {
      id: 'equations',
      title: 'Mathematical Equations',
      description: 'See the actual equations governing each parameter. Novel PhiCor equations are highlighted in amber.',
      target: '[data-tutorial="equations"]',
      position: 'left'
    },
    {
      id: 'clinical-insights',
      title: 'Clinical Insights',
      description: 'Get clinical context including symptoms, lab tests, imaging findings, and treatment approaches.',
      target: '[data-tutorial="clinical-panel"]',
      position: 'left'
    }
  ],
  differential: [
    {
      id: 'welcome',
      title: 'Welcome to Differential Diagnosis',
      description: 'This tool synthesizes clinical findings to generate ranked differential diagnoses using PhiCor\'s knowledge base.',
      target: null,
      position: 'center'
    },
    {
      id: 'input-tabs',
      title: 'Input Methods',
      description: 'Three ways to input clinical data: select parameters manually, paste clinical text, or use test patient cases.',
      target: '[data-tutorial="input-tabs"]',
      position: 'bottom'
    },
    {
      id: 'parameter-input',
      title: 'Parameter Selection',
      description: 'Select an organ, choose a parameter, and adjust the value. Add abnormal findings to build your clinical picture.',
      target: '[data-tutorial="parameter-input"]',
      position: 'right'
    },
    {
      id: 'clinical-text',
      title: 'Clinical Text Analysis',
      description: 'Paste clinical notes, lab results, or history. PhiCor extracts findings and identifies patterns automatically.',
      target: '[data-tutorial="clinical-text"]',
      position: 'right'
    },
    {
      id: 'test-patient',
      title: 'Test Patient Cases',
      description: 'Try pre-built demo cases or generate random cases to see PhiCor Synthesis in action.',
      target: '[data-tutorial="test-patient"]',
      position: 'right'
    },
    {
      id: 'synthesis',
      title: 'PhiCor Synthesis',
      description: 'The synthesis engine provides holistic analysis, connecting all findings to generate a primary diagnosis with supporting evidence.',
      target: '[data-tutorial="synthesis"]',
      position: 'left'
    },
    {
      id: 'differential-list',
      title: 'Differential List',
      description: 'Ranked diagnoses with probability scores. Expand each to see clinical reasoning and evidence-based guidelines.',
      target: '[data-tutorial="differential-list"]',
      position: 'left'
    }
  ],
  drugs: [
    {
      id: 'welcome',
      title: 'Welcome to Drug Engine',
      description: 'Explore 115+ drugs with comprehensive profiles and patient-specific PK/PD simulations.',
      target: null,
      position: 'center'
    },
    {
      id: 'drug-search',
      title: 'Search & Filter',
      description: 'Search drugs by name or filter by category. Each drug includes mechanism, indications, and interactions.',
      target: '[data-tutorial="drug-search"]',
      position: 'bottom'
    },
    {
      id: 'category-filter',
      title: 'Drug Categories',
      description: 'Filter by therapeutic category: Cardiovascular, CNS, Antibiotics, Analgesics, and more.',
      target: '[data-tutorial="category-filter"]',
      position: 'bottom'
    },
    {
      id: 'drug-details',
      title: 'Drug Information',
      description: 'View comprehensive drug details: mechanism of action, indications, contraindications, dosing, and interactions.',
      target: '[data-tutorial="drug-details"]',
      position: 'right'
    },
    {
      id: 'patient-simulation',
      title: 'Patient Simulation',
      description: 'Switch to simulation mode to model drug effects on a virtual patient with customizable parameters.',
      target: '[data-tutorial="simulation-tab"]',
      position: 'bottom'
    },
    {
      id: 'dosage-slider',
      title: 'Dosage Adjustment',
      description: 'Adjust dosage and see real-time efficacy/safety scores, interactions, and PK curve visualization.',
      target: '[data-tutorial="dosage-slider"]',
      position: 'left'
    }
  ]
};

// Tooltip component that points to a target element
const TutorialTooltip = ({ step, onNext, onPrev, onClose, currentStep, totalSteps, targetRect }) => {
  const isCenter = step.position === 'center' || !targetRect;
  
  // Calculate position based on target element
  const getPosition = () => {
    if (isCenter) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }
    
    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    
    switch (step.position) {
      case 'bottom':
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case 'top':
        return {
          top: `${targetRect.top - tooltipHeight - padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case 'left':
        return {
          top: `${Math.max(padding, targetRect.top + targetRect.height / 2 - tooltipHeight / 2)}px`,
          left: `${Math.max(padding, targetRect.left - tooltipWidth - padding)}px`,
        };
      case 'right':
        return {
          top: `${Math.max(padding, targetRect.top + targetRect.height / 2 - tooltipHeight / 2)}px`,
          left: `${targetRect.right + padding}px`,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed z-[100] w-80 bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-500/20 overflow-hidden ${isCenter ? '' : ''}`}
      style={getPosition()}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-serif font-bold">Φ</span>
            </div>
            <span className="text-white/80 text-sm">Tutorial</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep ? 'bg-purple-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrev}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <Button
            size="sm"
            onClick={onNext}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {currentStep === totalSteps - 1 ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Done
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Main Tutorial Provider Component
export const FeatureTutorial = ({ feature, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  
  const steps = TUTORIAL_STEPS[feature] || [];
  const step = steps[currentStep];
  
  // Find and highlight target element - use separate effects to avoid cascading renders
  // Reset targetRect when tutorial closes
  const shouldFindTarget = isOpen && step?.target;
  
  useEffect(() => {
    if (!shouldFindTarget) {
      return;
    }
    
    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [shouldFindTarget, step?.target]);
  
  // Reset targetRect when not needed
  useEffect(() => {
    if (!isOpen) {
      const timeoutId = setTimeout(() => setTargetRect(null), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);
  
  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  }, [currentStep, steps.length, onClose]);
  
  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  
  const handleClose = useCallback(() => {
    onClose();
    setCurrentStep(0);
  }, [onClose]);
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleClose]);
  
  if (!isOpen || !step) return null;
  
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Spotlight on target element */}
      {targetRect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed z-[95] pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: '12px',
            border: '2px solid rgba(168, 85, 247, 0.8)',
          }}
        />
      )}
      
      {/* Tooltip */}
      <TutorialTooltip
        step={step}
        onNext={handleNext}
        onPrev={handlePrev}
        onClose={handleClose}
        currentStep={currentStep}
        totalSteps={steps.length}
        targetRect={targetRect}
      />
    </AnimatePresence>
  );
};

// Tutorial Button Component - Add this to page headers
export const TutorialButton = ({ onClick, className = '' }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400 ${className}`}
    >
      <HelpCircle className="w-4 h-4 mr-2" />
      How to Use
    </Button>
  );
};

// Hook for tutorial state
export const useTutorial = (feature) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  
  return { isOpen, open, close };
};

export default FeatureTutorial;
