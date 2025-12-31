import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, CheckCircle, ChevronRight, ChevronDown,
  Pill, Stethoscope, Activity, FileText, Target,
  Heart, AlertTriangle, Info, BookOpen, Beaker,
  Zap, Shield, Clock, TrendingUp, Lightbulb
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

import { DISEASE_TREATMENT_GUIDELINES, TREATMENT_EVIDENCE_LEVELS } from '../data/diseaseGuidelines';

// Evidence Badge Component
const EvidenceBadge = ({ level }) => {
  const evidence = TREATMENT_EVIDENCE_LEVELS[level];
  if (!evidence) return null;

  const getColor = () => {
    if (level.startsWith('I') && !level.startsWith('II') && !level.startsWith('III')) {
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
    if (level.startsWith('IIa')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (level.startsWith('IIb')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (level.startsWith('III')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <span 
      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getColor()}`}
      title={`${evidence.description}\n${evidence.strength}`}
    >
      {evidence.label}
    </span>
  );
};

// Treatment Card Component
const TreatmentCard = ({ treatment, expanded, onToggle }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-700/30 transition"
      >
        <div className="flex items-center gap-3">
          <Pill className="text-pink-400" size={18} />
          <div>
            <span className="font-medium text-white">{treatment.name}</span>
            {treatment.drugs && (
              <div className="text-xs text-gray-400 mt-0.5">
                {treatment.drugs.slice(0, 3).join(', ')}
                {treatment.drugs.length > 3 && '...'}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EvidenceBadge level={treatment.evidence} />
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-3 border-t border-gray-700/50">
              {/* Drugs */}
              {treatment.drugs && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Medications</div>
                  <div className="flex flex-wrap gap-1">
                    {treatment.drugs.map((drug, i) => (
                      <span key={i} className="px-2 py-1 bg-pink-900/30 rounded text-xs text-pink-300">
                        {drug}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Target/Dose */}
              {treatment.target && (
                <div className="flex items-start gap-2">
                  <Target size={14} className="text-blue-400 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <span className="text-gray-500">Target: </span>{treatment.target}
                  </div>
                </div>
              )}

              {treatment.dose && (
                <div className="flex items-start gap-2">
                  <Beaker size={14} className="text-purple-400 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <span className="text-gray-500">Dose: </span>{treatment.dose}
                  </div>
                </div>
              )}

              {/* Mechanism */}
              {treatment.mechanism && (
                <div className="flex items-start gap-2">
                  <Zap size={14} className="text-yellow-400 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <span className="text-gray-500">Mechanism: </span>{treatment.mechanism}
                  </div>
                </div>
              )}

              {/* Source/Evidence */}
              {treatment.source && (
                <div className="flex items-start gap-2">
                  <BookOpen size={14} className="text-green-400 mt-0.5" />
                  <div className="text-sm text-green-300">
                    <span className="text-gray-500">Source: </span>{treatment.source}
                  </div>
                </div>
              )}

              {/* Contraindications */}
              {treatment.contraindications && treatment.contraindications.length > 0 && (
                <div className="p-2 bg-red-900/20 rounded border border-red-500/30">
                  <div className="flex items-center gap-1 text-xs text-red-400 mb-1">
                    <AlertTriangle size={12} />
                    Contraindications
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {treatment.contraindications.map((ci, i) => (
                      <span key={i} className="text-xs text-red-300">
                        {i > 0 && '• '}{ci}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Monitoring */}
              {treatment.monitoring && treatment.monitoring.length > 0 && (
                <div className="flex items-start gap-2">
                  <Activity size={14} className="text-cyan-400 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <span className="text-gray-500">Monitor: </span>
                    {treatment.monitoring.join(', ')}
                  </div>
                </div>
              )}

              {/* Mathematical Equation */}
              {treatment.equation && (
                <div className="p-2 bg-indigo-900/20 rounded border border-indigo-500/30">
                  <div className="text-xs text-indigo-400 mb-1">Effect Size</div>
                  <InlineMath math={treatment.equation} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Diagnostic Criteria Panel
const DiagnosticCriteriaPanel = ({ criteria }) => {
  if (!criteria) return null;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
        <Stethoscope className="text-green-400" size={16} />
        Diagnostic Criteria
      </h4>
      
      {Object.entries(criteria).map(([key, items]) => (
        <div key={key} className="mb-3 last:mb-0">
          <div className="text-xs text-gray-500 uppercase mb-1">{key}</div>
          <div className="space-y-1">
            {Array.isArray(items) ? items.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-gray-300">{item.criterion || item.stage}</span>
                  {item.method && <span className="text-gray-500"> ({item.method})</span>}
                  {item.source && <span className="text-xs text-blue-400 ml-1">[{item.source}]</span>}
                  {item.fev1 && <span className="text-gray-500"> - FEV1: {item.fev1}</span>}
                  {item.systolic && <span className="text-gray-500"> - SBP: {item.systolic}, DBP: {item.diastolic}</span>}
                  {item.gfr && <span className="text-gray-500"> - eGFR: {item.gfr}</span>}
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-400">{items}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Treatment Category Section
const TreatmentCategory = ({ title, icon: Icon, treatments, color }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!treatments || treatments.length === 0) return null;

  return (
    <div className="mb-4">
      <div className={`flex items-center gap-2 mb-2 text-sm font-medium ${color}`}>
        <Icon size={16} />
        {title}
      </div>
      <div className="space-y-2">
        {treatments.map((treatment, i) => (
          <TreatmentCard
            key={i}
            treatment={treatment}
            expanded={expandedIndex === i}
            onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
};

// Main Treatment Guidelines Panel
const TreatmentGuidelinesPanel = ({ diseaseId }) => {
  const [activeTab, setActiveTab] = useState('diagnosis');
  
  // Map disease IDs to our guidelines keys (comprehensive mapping)
  const guidelineKeyMap = {
    // Heart Failure variants
    'heart_failure': 'heart_failure_hfref',
    'hfref': 'heart_failure_hfref',
    'I50_2': 'heart_failure_hfref',
    'I50.2': 'heart_failure_hfref',
    'I50_1': 'heart_failure_hfref',
    'I50_0': 'heart_failure_hfref',
    'I50_9': 'heart_failure_hfref',
    // ACS variants
    'acute_coronary_syndrome': 'acute_coronary_syndrome',
    'I21': 'acute_coronary_syndrome',
    'I21_0': 'acute_coronary_syndrome',
    'I21_1': 'acute_coronary_syndrome',
    'I21_2': 'acute_coronary_syndrome',
    'I21_3': 'acute_coronary_syndrome',
    'I21_4': 'acute_coronary_syndrome',
    'I21_9': 'acute_coronary_syndrome',
    // Atrial Fibrillation
    'atrial_fibrillation': 'atrial_fibrillation',
    'I48': 'atrial_fibrillation',
    'I48_0': 'atrial_fibrillation',
    'I48_1': 'atrial_fibrillation',
    'I48_2': 'atrial_fibrillation',
    'I48_9': 'atrial_fibrillation',
    // Hypertension
    'hypertension': 'hypertension',
    'I10': 'hypertension',
    'I11': 'hypertension',
    'I12': 'hypertension',
    'I13': 'hypertension',
    // Diabetes
    'type2_diabetes': 'type2_diabetes',
    'diabetes': 'type2_diabetes',
    'E11': 'type2_diabetes',
    'E11_9': 'type2_diabetes',
    // COPD
    'copd': 'copd',
    'J44': 'copd',
    'J44_0': 'copd',
    'J44_1': 'copd',
    'J44_9': 'copd',
    // CKD
    'chronic_kidney_disease': 'chronic_kidney_disease',
    'N18': 'chronic_kidney_disease',
    'N18_1': 'chronic_kidney_disease',
    'N18_2': 'chronic_kidney_disease',
    'N18_3': 'chronic_kidney_disease',
    'N18_4': 'chronic_kidney_disease',
    'N18_5': 'chronic_kidney_disease',
    'N18_9': 'chronic_kidney_disease',
    // Cardiomyopathies - map to heart failure
    'dilated_cardiomyopathy': 'heart_failure_hfref',
    'I42_0': 'heart_failure_hfref',
    'hypertrophic_cardiomyopathy': 'hypertension', // Often treated similarly
    'I42_1': 'hypertension',
    'I42_2': 'hypertension',
    // Hematological - Iron Deficiency Anemia
    'iron_deficiency_anemia': 'iron_deficiency_anemia',
    'D50': 'iron_deficiency_anemia',
    'D50_9': 'iron_deficiency_anemia',
    'D50.9': 'iron_deficiency_anemia',
    // Sickle Cell Disease
    'sickle_cell_disease': 'sickle_cell_disease',
    'D57': 'sickle_cell_disease',
    'D57_1': 'sickle_cell_disease',
    'D57.1': 'sickle_cell_disease',
    // Acute Lymphoblastic Leukemia
    'acute_lymphoblastic_leukemia': 'acute_lymphoblastic_leukemia',
    'C91_0': 'acute_lymphoblastic_leukemia',
    'C91.0': 'acute_lymphoblastic_leukemia',
    // Multiple Myeloma
    'multiple_myeloma': 'multiple_myeloma',
    'C90_0': 'multiple_myeloma',
    'C90.0': 'multiple_myeloma',
    // Down Syndrome
    'down_syndrome': 'down_syndrome',
    'Q90_9': 'down_syndrome',
    'Q90.9': 'down_syndrome',
    // Marfan Syndrome
    'marfan_syndrome': 'marfan_syndrome',
    'Q87_4': 'marfan_syndrome',
    'Q87.4': 'marfan_syndrome',
    // Hemophilia A
    'hemophilia_a': 'hemophilia_a',
    'D66': 'hemophilia_a',
  };

  const guidelineKey = guidelineKeyMap[diseaseId] || diseaseId;
  const guidelines = DISEASE_TREATMENT_GUIDELINES[guidelineKey];

  if (!guidelines) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700/50 overflow-hidden p-6">
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 mx-auto text-indigo-400 mb-3" />
          <h3 className="font-bold text-white mb-2">Clinical Guidelines</h3>
          <p className="text-sm text-gray-400">
            Detailed evidence-based guidelines for this condition are available in the comprehensive database.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center">
            <Stethoscope className="w-6 h-6 mx-auto text-blue-400 mb-2" />
            <div className="text-xs text-gray-400">Diagnosis</div>
            <div className="text-sm text-white">Clinical Criteria</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center">
            <Pill className="w-6 h-6 mx-auto text-pink-400 mb-2" />
            <div className="text-xs text-gray-400">Treatment</div>
            <div className="text-sm text-white">Evidence-Based</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center">
            <Activity className="w-6 h-6 mx-auto text-green-400 mb-2" />
            <div className="text-xs text-gray-400">Monitoring</div>
            <div className="text-sm text-white">Follow-up Protocol</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center">
            <FileText className="w-6 h-6 mx-auto text-amber-400 mb-2" />
            <div className="text-xs text-gray-400">Equations</div>
            <div className="text-sm text-white">Mathematical Models</div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>View detailed parameters and equations in the main dashboard</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'diagnosis', name: 'Diagnosis', icon: Stethoscope },
    { id: 'treatment', name: 'Treatment', icon: Pill },
    { id: 'monitoring', name: 'Monitoring', icon: Activity },
    { id: 'equations', name: 'Equations', icon: FileText },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-serif text-indigo-400">Φ</span>
              <h3 className="font-bold text-white">{guidelines.name}</h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                ICD-10: {guidelines.icd10}
              </span>
              {guidelines.affectedOrgans && (
                <span className="text-xs text-gray-500">
                  Affects: {guidelines.affectedOrgans.join(', ')}
                </span>
              )}
            </div>
          </div>
          <Shield className="text-indigo-400" size={24} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-2 border-b border-gray-700/50 bg-gray-900/50 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <tab.icon size={14} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'diagnosis' && (
              <div className="space-y-4">
                <DiagnosticCriteriaPanel criteria={guidelines.diagnosticCriteria} />
                
                {/* Targets */}
                {guidelines.targets && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Target className="text-cyan-400" size={16} />
                      Treatment Targets
                    </h4>
                    <div className="space-y-2">
                      {typeof guidelines.targets === 'object' && Object.entries(guidelines.targets).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2">
                          <span className="text-xs text-gray-500 uppercase w-20">{key}:</span>
                          <span className="text-sm text-gray-300">
                            {typeof value === 'object' 
                              ? Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ')
                              : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'treatment' && (
              <div className="space-y-4">
                {guidelines.treatments?.lifestyle && (
                  <TreatmentCategory
                    title="Lifestyle Modifications"
                    icon={Heart}
                    treatments={guidelines.treatments.lifestyle.map(l => ({
                      name: l.intervention,
                      evidence: l.evidence,
                      source: l.source,
                      equation: l.effect ? `\\Delta = ${l.effect}` : null,
                    }))}
                    color="text-green-400"
                  />
                )}

                {guidelines.treatments?.firstLine && (
                  <TreatmentCategory
                    title="First-Line Treatment"
                    icon={Pill}
                    treatments={guidelines.treatments.firstLine}
                    color="text-pink-400"
                  />
                )}

                {guidelines.treatments?.immediate && (
                  <TreatmentCategory
                    title="Immediate Management"
                    icon={Zap}
                    treatments={guidelines.treatments.immediate}
                    color="text-red-400"
                  />
                )}

                {guidelines.treatments?.secondLine && (
                  <TreatmentCategory
                    title="Second-Line Treatment"
                    icon={Pill}
                    treatments={guidelines.treatments.secondLine}
                    color="text-blue-400"
                  />
                )}

                {guidelines.treatments?.secondary && (
                  <TreatmentCategory
                    title="Secondary Prevention"
                    icon={Shield}
                    treatments={guidelines.treatments.secondary}
                    color="text-purple-400"
                  />
                )}

                {guidelines.treatments?.cvdBenefit && (
                  <TreatmentCategory
                    title="CV Risk Reduction"
                    icon={Heart}
                    treatments={guidelines.treatments.cvdBenefit}
                    color="text-red-400"
                  />
                )}

                {guidelines.treatments?.devices && (
                  <TreatmentCategory
                    title="Device Therapy"
                    icon={Activity}
                    treatments={guidelines.treatments.devices}
                    color="text-cyan-400"
                  />
                )}

                {guidelines.treatments?.advanced && (
                  <TreatmentCategory
                    title="Advanced Therapies"
                    icon={Beaker}
                    treatments={guidelines.treatments.advanced}
                    color="text-orange-400"
                  />
                )}
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="space-y-4">
                {guidelines.monitoringProtocol && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Clock className="text-yellow-400" size={16} />
                      Monitoring Protocol
                    </h4>
                    
                    {guidelines.monitoringProtocol.frequency && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-500">Frequency: </span>
                        <span className="text-sm text-gray-300">{guidelines.monitoringProtocol.frequency}</span>
                      </div>
                    )}

                    {guidelines.monitoringProtocol.parameters && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">Parameters to Monitor:</div>
                        <div className="flex flex-wrap gap-1">
                          {guidelines.monitoringProtocol.parameters.map((param, i) => (
                            <span key={i} className="px-2 py-1 bg-yellow-900/30 rounded text-xs text-yellow-300">
                              {param}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {guidelines.monitoringProtocol.targets && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Targets:</div>
                        <div className="space-y-1">
                          {Object.entries(guidelines.monitoringProtocol.targets).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500">{key}:</span>
                              <span className="text-green-400">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!guidelines.monitoringProtocol && (
                  <div className="space-y-4">
                    {/* Default monitoring protocol when not available */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                        <Clock className="text-blue-400" size={16} />
                        Follow-up Schedule
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-2 bg-gray-900/50 rounded text-xs">
                          <span className="text-gray-400">Initial:</span>
                          <span className="text-white ml-2">2-4 weeks</span>
                        </div>
                        <div className="p-2 bg-gray-900/50 rounded text-xs">
                          <span className="text-gray-400">Stable:</span>
                          <span className="text-white ml-2">3-6 months</span>
                        </div>
                        <div className="p-2 bg-gray-900/50 rounded text-xs">
                          <span className="text-gray-400">Labs:</span>
                          <span className="text-white ml-2">Every 3-12 months</span>
                        </div>
                        <div className="p-2 bg-gray-900/50 rounded text-xs">
                          <span className="text-gray-400">Imaging:</span>
                          <span className="text-white ml-2">As clinically indicated</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                        <TrendingUp className="text-green-400" size={16} />
                        Key Parameters to Monitor
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs p-2 bg-gray-900/50 rounded">
                          <span className="text-gray-400">Vital Signs</span>
                          <span className="text-green-400">BP, HR, SpO2</span>
                        </div>
                        <div className="flex items-center justify-between text-xs p-2 bg-gray-900/50 rounded">
                          <span className="text-gray-400">Symptom Assessment</span>
                          <span className="text-green-400">Functional capacity, QoL</span>
                        </div>
                        <div className="flex items-center justify-between text-xs p-2 bg-gray-900/50 rounded">
                          <span className="text-gray-400">Laboratory</span>
                          <span className="text-green-400">Per clinical guideline</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-900/20 rounded-lg p-3 border border-amber-500/30">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-amber-400">Warning Signs</div>
                          <p className="text-xs text-gray-400 mt-1">
                            Contact healthcare provider for: worsening symptoms, new symptoms, 
                            medication side effects, or significant vital sign changes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'equations' && (
              <div className="space-y-4">
                {guidelines.physiologicalChanges && Object.entries(guidelines.physiologicalChanges).map(([organ, data]) => (
                  <div key={organ} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-sm font-medium text-white mb-3 capitalize flex items-center gap-2">
                      <TrendingUp className="text-indigo-400" size={16} />
                      {organ} Changes
                    </h4>

                    {/* Parameter Changes */}
                    {data.parameters && (
                      <div className="mb-3 space-y-2">
                        {Object.entries(data.parameters).map(([key, param]) => (
                          <div key={key} className="flex items-center justify-between text-sm p-2 bg-gray-900/50 rounded">
                            <span className="text-gray-400">{key}</span>
                            <span className={param.direction === 'increase' ? 'text-red-400' : 'text-blue-400'}>
                              {param.direction === 'increase' ? '↑' : '↓'} {param.change}{param.unit || ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Equations */}
                    {data.equations && data.equations.map((eq, i) => (
                      <div key={i} className="p-3 bg-indigo-900/20 rounded border border-indigo-500/30 mb-2 last:mb-0">
                        <div className="text-xs text-indigo-400 mb-1">{eq.id}</div>
                        <div className="overflow-x-auto">
                          <BlockMath math={eq.latex} />
                        </div>
                        {eq.description && (
                          <div className="text-xs text-gray-500 mt-1">{eq.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {!guidelines.physiologicalChanges && (
                  <div className="space-y-4">
                    {/* Default equations when not available */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                        <FileText className="text-indigo-400" size={16} />
                        Core Mathematical Models
                      </h4>
                      <p className="text-xs text-gray-400 mb-3">
                        Mathematical models for this condition are available in the main dashboard view.
                        Select the affected organ and explore the Equations section for detailed formulas.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-2 bg-indigo-900/20 rounded text-xs border border-indigo-500/30">
                          <span className="text-indigo-400">Hemodynamic Models</span>
                        </div>
                        <div className="p-2 bg-indigo-900/20 rounded text-xs border border-indigo-500/30">
                          <span className="text-indigo-400">Metabolic Equations</span>
                        </div>
                        <div className="p-2 bg-indigo-900/20 rounded text-xs border border-indigo-500/30">
                          <span className="text-indigo-400">Structural Changes</span>
                        </div>
                        <div className="p-2 bg-indigo-900/20 rounded text-xs border border-indigo-500/30">
                          <span className="text-indigo-400">Novel Derived Formulas</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-900/20 rounded-lg p-3 border border-amber-500/30">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-amber-400">Novel Equations</div>
                          <p className="text-xs text-gray-400 mt-1">
                            PhiCore.ai includes novel mathematical models derived from first principles
                            that extend beyond traditional clinical formulas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TreatmentGuidelinesPanel;
