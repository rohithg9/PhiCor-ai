import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Activity, Heart, Brain, Bone, Users,
  FileText, ChevronRight, ChevronDown, Info, Calculator,
  Stethoscope, Microscope, Pill, Target, TrendingUp,
  AlertCircle, CheckCircle, XCircle, Clock, Zap
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

import {
  TNM_8TH_EDITION,
  STAGE_GROUPINGS,
  LUNG_CANCER_SYMPTOMS,
  PERFORMANCE_STATUS,
  IMAGING_FINDINGS,
  TREATMENT_GUIDELINES,
  BIOMARKER_TESTING,
  SURGICAL_RISK,
  MATHEMATICAL_MODELS,
  MDT_CHECKLIST
} from '../data/lungCancerData';

// TNM Staging Panel Component
const TNMStagingPanel = ({ tStage, nStage, mStage, onTChange, onNChange, onMChange }) => {
  const [expandedSection, setExpandedSection] = useState('T');

  const getStageGroup = () => {
    // TNM 8th Edition Stage Grouping
    if (mStage.startsWith('M1')) {
      return mStage === 'M1c' ? 'IVB' : 'IVA';
    }
    if (nStage === 'N3') return 'IIIC';
    if (nStage === 'N2') return tStage.startsWith('T4') ? 'IIIB' : 'IIIA';
    if (nStage === 'N1') return 'IIB';
    // N0, M0 cases - early stage
    if (tStage === 'T1a') return 'IA1';
    if (tStage === 'T1b') return 'IA2';
    if (tStage === 'T1c') return 'IA3';
    if (tStage === 'T2a') return 'IB';
    if (tStage === 'T2b') return 'IIA';
    if (tStage === 'T3' || tStage === 'T4') return 'IIB';
    return 'IA1'; // Default
  };

  const stageGroup = getStageGroup();
  const stageInfo = STAGE_GROUPINGS[stageGroup] || {};

  const tOptions = ['T1a', 'T1b', 'T1c', 'T2a', 'T2b', 'T3', 'T4'];
  const nOptions = ['N0', 'N1', 'N2', 'N3'];
  const mOptions = ['M0', 'M1a', 'M1b', 'M1c'];

  const getTStageInfo = (stage) => {
    const baseStage = stage.charAt(0) + stage.charAt(1);
    const tData = TNM_8TH_EDITION.T[baseStage];
    if (tData?.subcategories?.[stage]) {
      return tData.subcategories[stage];
    }
    return tData || {};
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Target className="text-indigo-400" size={24} />
        TNM 8th Edition Staging
      </h3>

      {/* Stage Group Display */}
      <div className="mb-6 p-4 bg-indigo-900/50 rounded-lg border border-indigo-500/50">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-sm">Overall Stage:</span>
            <span className="text-3xl font-bold text-indigo-400 ml-2">Stage {stageGroup}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 text-sm">5-Year Survival:</span>
            <span className="text-2xl font-bold text-green-400 ml-2">{stageInfo.fiveYearSurvival || 'N/A'}</span>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-300">
          Current: <span className="text-yellow-400 font-mono">{tStage}</span> | 
          <span className="text-blue-400 font-mono ml-1">{nStage}</span> | 
          <span className="text-red-400 font-mono ml-1">{mStage}</span>
        </div>
      </div>

      {/* T-Stage Selector */}
      <div className="mb-4">
        <button
          onClick={() => setExpandedSection(expandedSection === 'T' ? null : 'T')}
          className="w-full flex items-center justify-between p-3 bg-yellow-900/30 rounded-lg hover:bg-yellow-900/50 transition"
        >
          <span className="text-yellow-400 font-semibold flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">T</span>
            Primary Tumor
          </span>
          {expandedSection === 'T' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        <AnimatePresence>
          {expandedSection === 'T' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-2 p-3">
                {tOptions.map((t) => {
                  const info = getTStageInfo(t);
                  return (
                    <button
                      key={t}
                      onClick={() => onTChange(t)}
                      className={`p-3 rounded-lg text-sm font-medium transition ${
                        tStage === t
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div>{t}</div>
                      <div className="text-xs opacity-75">{info.size || info.name}</div>
                    </button>
                  );
                })}
              </div>
              {getTStageInfo(tStage) && (
                <div className="p-3 bg-gray-800/50 rounded-lg mx-3 mb-3">
                  <p className="text-sm text-gray-300">{getTStageInfo(tStage).description || getTStageInfo(tStage).name}</p>
                  {getTStageInfo(tStage).equation && (
                    <div className="mt-2 p-2 bg-black/30 rounded">
                      <InlineMath math={getTStageInfo(tStage).equation} />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* N-Stage Selector */}
      <div className="mb-4">
        <button
          onClick={() => setExpandedSection(expandedSection === 'N' ? null : 'N')}
          className="w-full flex items-center justify-between p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition"
        >
          <span className="text-blue-400 font-semibold flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">N</span>
            Regional Lymph Nodes
          </span>
          {expandedSection === 'N' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        <AnimatePresence>
          {expandedSection === 'N' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-2 p-3">
                {nOptions.map((n) => {
                  const info = TNM_8TH_EDITION.N[n] || {};
                  return (
                    <button
                      key={n}
                      onClick={() => onNChange(n)}
                      className={`p-3 rounded-lg text-sm font-medium transition ${
                        nStage === n
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div>{n}</div>
                      <div className="text-xs opacity-75">{info.name?.split(' ').slice(0, 2).join(' ')}</div>
                    </button>
                  );
                })}
              </div>
              {TNM_8TH_EDITION.N[nStage] && (
                <div className="p-3 bg-gray-800/50 rounded-lg mx-3 mb-3">
                  <p className="text-sm text-gray-300">{TNM_8TH_EDITION.N[nStage].description}</p>
                  {TNM_8TH_EDITION.N[nStage].stations?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {TNM_8TH_EDITION.N[nStage].stations.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-900/50 rounded text-xs text-blue-300">
                          Station {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* M-Stage Selector */}
      <div className="mb-4">
        <button
          onClick={() => setExpandedSection(expandedSection === 'M' ? null : 'M')}
          className="w-full flex items-center justify-between p-3 bg-red-900/30 rounded-lg hover:bg-red-900/50 transition"
        >
          <span className="text-red-400 font-semibold flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">M</span>
            Distant Metastasis
          </span>
          {expandedSection === 'M' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        <AnimatePresence>
          {expandedSection === 'M' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-2 p-3">
                {mOptions.map((m) => {
                  const mData = m === 'M0' ? TNM_8TH_EDITION.M.M0 : TNM_8TH_EDITION.M.M1?.subcategories?.[m];
                  return (
                    <button
                      key={m}
                      onClick={() => onMChange(m)}
                      className={`p-3 rounded-lg text-sm font-medium transition ${
                        mStage === m
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div>{m}</div>
                      <div className="text-xs opacity-75">{mData?.name?.split(' ').slice(0, 2).join(' ')}</div>
                    </button>
                  );
                })}
              </div>
              {mStage !== 'M0' && TNM_8TH_EDITION.M.M1?.subcategories?.[mStage] && (
                <div className="p-3 bg-gray-800/50 rounded-lg mx-3 mb-3">
                  <p className="text-sm text-gray-300">{TNM_8TH_EDITION.M.M1.subcategories[mStage].description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {TNM_8TH_EDITION.M.M1.subcategories[mStage].sites?.map((site, i) => (
                      <span key={i} className="px-2 py-1 bg-red-900/50 rounded text-xs text-red-300">
                        {site}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Symptoms Assessment Panel
const SymptomsPanel = ({ symptoms, onSymptomsChange }) => {
  const [activeCategory, setActiveCategory] = useState('respiratory');

  const categories = [
    { id: 'respiratory', name: 'Respiratory', icon: Activity },
    { id: 'constitutional', name: 'Constitutional', icon: TrendingUp },
    { id: 'localInvasion', name: 'Local Invasion', icon: AlertTriangle },
    { id: 'metastatic', name: 'Metastatic', icon: Bone },
    { id: 'paraneoplastic', name: 'Paraneoplastic', icon: Zap }
  ];

  const currentSymptoms = LUNG_CANCER_SYMPTOMS[activeCategory] || {};

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Stethoscope className="text-green-400" size={24} />
        Symptoms Assessment
      </h3>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition ${
              activeCategory === cat.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <cat.icon size={16} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Symptoms List */}
      <div className="space-y-3">
        {Object.entries(currentSymptoms).map(([key, symptom]) => (
          <div key={key} className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">{symptom.name}</span>
              {symptom.redFlag && (
                <span className="text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded flex items-center gap-1">
                  <AlertCircle size={12} /> {symptom.redFlag}
                </span>
              )}
            </div>
            
            {symptom.grades && (
              <div className="grid grid-cols-4 gap-1">
                {symptom.grades.map((grade) => (
                  <button
                    key={grade.value}
                    onClick={() => onSymptomsChange(key, grade.value)}
                    className={`p-2 text-xs rounded transition ${
                      symptoms[key] === grade.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                    title={grade.description}
                  >
                    {grade.label}
                  </button>
                ))}
              </div>
            )}

            {symptom.scales && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400">MRC Dyspnoea Scale:</div>
                <div className="grid grid-cols-5 gap-1">
                  {symptom.scales.MRC.map((grade) => (
                    <button
                      key={grade.grade}
                      onClick={() => onSymptomsChange(key, grade.grade)}
                      className={`p-2 text-xs rounded transition ${
                        symptoms[key] === grade.grade
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                      title={grade.description}
                    >
                      Grade {grade.grade}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {symptom.symptoms && (
              <div className="flex flex-wrap gap-1 mt-2">
                {symptom.symptoms.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const current = symptoms[key] || [];
                      const updated = current.includes(s)
                        ? current.filter(x => x !== s)
                        : [...current, s];
                      onSymptomsChange(key, updated);
                    }}
                    className={`px-2 py-1 text-xs rounded transition ${
                      (symptoms[key] || []).includes(s)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {symptom.investigation && (
              <div className="mt-2 text-xs text-blue-400">
                → Investigation: {symptom.investigation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Performance Status Panel
const PerformanceStatusPanel = ({ ps, exerciseTolerance, onPsChange, onEtChange }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="text-purple-400" size={24} />
        Performance Status
      </h3>

      {/* ECOG PS */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">ECOG Performance Status</div>
        <div className="space-y-2">
          {PERFORMANCE_STATUS.ECOG.map((status) => (
            <button
              key={status.score}
              onClick={() => onPsChange(status.score)}
              className={`w-full p-3 rounded-lg text-left transition ${
                ps === status.score
                  ? status.fitForSurgery === true ? 'bg-green-600 text-white' :
                    status.fitForSurgery === 'Consider' ? 'bg-yellow-600 text-white' :
                    'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">PS {status.score}</span>
                <span className="text-xs px-2 py-1 rounded bg-black/20">
                  {status.fitForSurgery === true ? '✓ Fit' : 
                   status.fitForSurgery === 'Consider' ? '? Consider' : '✗ Unfit'}
                </span>
              </div>
              <p className="text-sm mt-1 opacity-80">{status.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Tolerance */}
      <div>
        <div className="text-sm text-gray-400 mb-2">Exercise Tolerance (Walking distance on flat)</div>
        <div className="grid grid-cols-3 gap-2">
          {['< 100 yards', '100-500 yards', '> 500 yards'].map((et, i) => (
            <button
              key={et}
              onClick={() => onEtChange(et)}
              className={`p-3 rounded-lg text-sm transition ${
                exerciseTolerance === et
                  ? i === 0 ? 'bg-red-600 text-white' :
                    i === 1 ? 'bg-yellow-600 text-white' :
                    'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {et}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Treatment Recommendations Panel
const TreatmentPanel = ({ stage, biomarkers, onBiomarkerChange }) => {
  const [showBiomarkers, setShowBiomarkers] = useState(false);

  const getRecommendation = () => {
    // Stage IV - Metastatic
    if (stage.startsWith('IV')) {
      if (biomarkers.EGFR) return TREATMENT_GUIDELINES.metastatic.withDriverMutations.EGFR;
      if (biomarkers.ALK) return TREATMENT_GUIDELINES.metastatic.withDriverMutations.ALK;
      if (biomarkers.PDL1 >= 50) return TREATMENT_GUIDELINES.metastatic.withoutDriverMutations.pdl1High;
      if (biomarkers.PDL1 >= 1) return TREATMENT_GUIDELINES.metastatic.withoutDriverMutations.pdl1Low;
      return TREATMENT_GUIDELINES.metastatic.withoutDriverMutations.pdl1Negative;
    }
    // Stage III - Locally Advanced
    if (stage.startsWith('III')) {
      if (stage === 'IIIC' || stage === 'IIIB') {
        return TREATMENT_GUIDELINES.locallyAdvanced.stageIIIB_unresectable.treatment;
      }
      return TREATMENT_GUIDELINES.locallyAdvanced.stageIIIA_resectable.option1;
    }
    // Stage II
    if (stage.startsWith('II')) {
      return TREATMENT_GUIDELINES.earlyStage.stageII.treatment;
    }
    // Stage IB
    if (stage === 'IB') {
      return TREATMENT_GUIDELINES.earlyStage.stageIB.surgery;
    }
    // Stage IA (IA1, IA2, IA3)
    return TREATMENT_GUIDELINES.earlyStage.stageIA.surgery;
  };

  const recommendation = getRecommendation();

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Pill className="text-pink-400" size={24} />
        Treatment Recommendations (NCCN 2024)
      </h3>

      {/* Biomarker Testing */}
      <button
        onClick={() => setShowBiomarkers(!showBiomarkers)}
        className="w-full mb-4 p-3 bg-indigo-900/30 rounded-lg hover:bg-indigo-900/50 transition flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <Microscope size={18} className="text-indigo-400" />
          <span className="text-indigo-400 font-medium">Biomarker Testing</span>
        </span>
        {showBiomarkers ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>

      <AnimatePresence>
        {showBiomarkers && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-800/50 rounded-lg">
              {BIOMARKER_TESTING.required.map((marker) => (
                <button
                  key={marker.marker}
                  onClick={() => onBiomarkerChange(marker.marker, !biomarkers[marker.marker])}
                  className={`p-2 rounded-lg text-sm flex items-center justify-between transition ${
                    biomarkers[marker.marker]
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <span>{marker.marker}</span>
                  {biomarkers[marker.marker] ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </button>
              ))}
              <div className="col-span-2 mt-2">
                <label className="text-sm text-gray-400">PD-L1 Expression (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={biomarkers.PDL1 || 0}
                  onChange={(e) => onBiomarkerChange('PDL1', parseInt(e.target.value))}
                  className="w-full mt-1"
                />
                <div className="text-center text-pink-400 font-bold">{biomarkers.PDL1 || 0}%</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendation Display */}
      <div className="p-4 bg-gradient-to-r from-pink-900/30 to-purple-900/30 rounded-lg border border-pink-500/30">
        <div className="text-sm text-gray-400 mb-2">Recommended Treatment:</div>
        <div className="text-lg font-bold text-white mb-2">
          {recommendation.name || recommendation.preferred || 'See MDT discussion'}
        </div>
        {recommendation.protocol && (
          <p className="text-sm text-gray-300 mb-2">{recommendation.protocol}</p>
        )}
        {recommendation.evidence && (
          <p className="text-xs text-blue-400">Evidence: {recommendation.evidence}</p>
        )}
        {recommendation.firstLine && (
          <p className="text-sm text-green-400">First-line: {recommendation.firstLine}</p>
        )}
        {recommendation.adjuvant && (
          <p className="text-sm text-yellow-400">Adjuvant: {recommendation.adjuvant}</p>
        )}
      </div>

      {/* Immunotherapy Panel */}
      {stage.startsWith('III') || stage.startsWith('IV') ? (
        <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-blue-400" size={18} />
            <span className="font-medium text-blue-400">Immunotherapy Options</span>
          </div>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Pembrolizumab (KEYTRUDA) - PD-L1 ≥ 1%</li>
            <li>• Nivolumab (OPDIVO) - Second-line or combination</li>
            <li>• Durvalumab (IMFINZI) - Post-chemoRT consolidation</li>
            <li>• Atezolizumab (TECENTRIQ) - Combination regimens</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
};

// Mathematical Models Panel
const MathematicalModelsPanel = ({ tStage, tumorSize }) => {
  const calculateTumorVolume = (diameter) => {
    const radius = diameter / 2;
    return (4 / 3) * Math.PI * Math.pow(radius, 3);
  };

  const volume = calculateTumorVolume(tumorSize);
  const doublingTime = 150; // Average for NSCLC
  const growthRate = Math.log(2) / doublingTime;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Calculator className="text-cyan-400" size={24} />
        Mathematical Models
      </h3>

      {/* Tumor Volume */}
      <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">Tumor Volume Estimation</div>
        <div className="p-3 bg-black/30 rounded mb-2">
          <BlockMath math="V = \frac{4}{3}\pi r^3" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Diameter: {tumorSize} cm</span>
          <span className="text-cyan-400 font-bold">Volume: {volume.toFixed(2)} cm³</span>
        </div>
      </div>

      {/* Growth Model */}
      <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">Exponential Growth Model</div>
        <div className="p-3 bg-black/30 rounded mb-2">
          <BlockMath math="V(t) = V_0 \cdot e^{\lambda t}" />
        </div>
        <div className="text-sm text-gray-300">
          <p>Growth rate (λ): {growthRate.toFixed(4)} /day</p>
          <p>Doubling time: ~{doublingTime} days</p>
        </div>
      </div>

      {/* Survival Model */}
      <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">Cox Proportional Hazards</div>
        <div className="p-3 bg-black/30 rounded mb-2">
          <BlockMath math="h(t) = h_0(t) \cdot e^{\beta_1 \cdot Stage + \beta_2 \cdot PS}" />
        </div>
        <p className="text-xs text-gray-400">
          Hazard function modified by staging and performance status
        </p>
      </div>

      {/* Warburg Effect */}
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">Warburg Effect (Tumor Metabolism)</div>
        <div className="p-3 bg-black/30 rounded mb-2">
          <BlockMath math="SUV = \frac{\text{Tissue Activity}}{\text{Injected Dose / BW}}" />
        </div>
        <p className="text-xs text-gray-400">
          PET-CT SUV correlates with tumor aggressiveness
        </p>
      </div>
    </div>
  );
};

// MDT Decision Support Panel
const MDTPanel = ({ staging, symptoms, ps }) => {
  const getSurgeryRecommendation = () => {
    if (ps >= 3) return { fit: false, reason: 'Poor performance status' };
    if (staging.m !== 'M0' && staging.m !== 'M1a' && staging.m !== 'M1b') {
      return { fit: false, reason: 'Multiple distant metastases' };
    }
    if (staging.n === 'N3') {
      return { fit: false, reason: 'N3 disease - consider definitive chemoRT' };
    }
    if (staging.t === 'T4' && staging.n === 'N2') {
      return { fit: false, reason: 'Locally advanced - neoadjuvant therapy first' };
    }
    return { fit: true, reason: 'Potentially resectable - proceed with evaluation' };
  };

  const surgeryRec = getSurgeryRecommendation();

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Users className="text-orange-400" size={24} />
        MDT Decision Support
      </h3>

      {/* Pre-Discussion Checklist */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Pre-MDT Checklist</div>
        <div className="grid grid-cols-2 gap-2">
          {MDT_CHECKLIST.preDiscussion.map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-sm">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendation */}
      <div className={`p-4 rounded-lg border ${
        surgeryRec.fit 
          ? 'bg-green-900/30 border-green-500/30' 
          : 'bg-red-900/30 border-red-500/30'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {surgeryRec.fit ? (
            <CheckCircle className="text-green-400" size={20} />
          ) : (
            <XCircle className="text-red-400" size={20} />
          )}
          <span className={`font-bold ${surgeryRec.fit ? 'text-green-400' : 'text-red-400'}`}>
            {surgeryRec.fit ? 'Potentially Fit for Surgery' : 'Not for Primary Surgery'}
          </span>
        </div>
        <p className="text-sm text-gray-300">{surgeryRec.reason}</p>
      </div>

      {/* Decision Outcomes */}
      <div className="mt-4">
        <div className="text-sm text-gray-400 mb-2">Possible MDT Outcomes</div>
        <div className="flex flex-wrap gap-2">
          {MDT_CHECKLIST.decisionOutcomes.map((outcome, i) => (
            <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
              {outcome}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Lung Cancer Module Component
const LungCancerModule = () => {
  const [tStage, setTStage] = useState('T1b');
  const [nStage, setNStage] = useState('N0');
  const [mStage, setMStage] = useState('M0');
  const [symptoms, setSymptoms] = useState({});
  const [ps, setPs] = useState(0);
  const [exerciseTolerance, setExerciseTolerance] = useState('> 500 yards');
  const [biomarkers, setBiomarkers] = useState({ PDL1: 0 });
  const [activeTab, setActiveTab] = useState('staging');

  const tumorSizeMap = {
    'T1a': 0.8, 'T1b': 1.5, 'T1c': 2.5,
    'T2a': 3.5, 'T2b': 4.5, 'T3': 6, 'T4': 8
  };

  const handleSymptomsChange = (key, value) => {
    setSymptoms(prev => ({ ...prev, [key]: value }));
  };

  const handleBiomarkerChange = (marker, value) => {
    setBiomarkers(prev => ({ ...prev, [marker]: value }));
  };

  const getStageGroup = () => {
    // TNM 8th Edition Stage Grouping
    if (mStage.startsWith('M1')) return mStage === 'M1c' ? 'IVB' : 'IVA';
    if (nStage === 'N3') return 'IIIC';
    if (nStage === 'N2') return tStage.startsWith('T4') ? 'IIIB' : 'IIIA';
    if (nStage === 'N1') return 'IIB';
    // N0, M0 cases - early stage
    if (tStage === 'T1a') return 'IA1';
    if (tStage === 'T1b') return 'IA2';
    if (tStage === 'T1c') return 'IA3';
    if (tStage === 'T2a') return 'IB';
    if (tStage === 'T2b') return 'IIA';
    if (tStage === 'T3' || tStage === 'T4') return 'IIB';
    return 'IA1'; // Default
  };

  const tabs = [
    { id: 'staging', name: 'TNM Staging', icon: Target },
    { id: 'symptoms', name: 'Symptoms', icon: Stethoscope },
    { id: 'fitness', name: 'Fitness', icon: Activity },
    { id: 'treatment', name: 'Treatment', icon: Pill },
    { id: 'models', name: 'Math Models', icon: Calculator },
    { id: 'mdt', name: 'MDT', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-xl p-6 border border-red-500/30">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl font-serif bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Φ</span>
          <h2 className="text-2xl font-bold text-white">
            Lung Cancer Management System
          </h2>
        </div>
        <p className="text-gray-300">
          TNM 8th Edition Staging | NCCN 2024-2025 Guidelines | MDT Decision Support
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'staging' && (
            <TNMStagingPanel
              tStage={tStage}
              nStage={nStage}
              mStage={mStage}
              onTChange={setTStage}
              onNChange={setNStage}
              onMChange={setMStage}
            />
          )}
          {activeTab === 'symptoms' && (
            <SymptomsPanel
              symptoms={symptoms}
              onSymptomsChange={handleSymptomsChange}
            />
          )}
          {activeTab === 'fitness' && (
            <PerformanceStatusPanel
              ps={ps}
              exerciseTolerance={exerciseTolerance}
              onPsChange={setPs}
              onEtChange={setExerciseTolerance}
            />
          )}
          {activeTab === 'treatment' && (
            <TreatmentPanel
              stage={getStageGroup()}
              biomarkers={biomarkers}
              onBiomarkerChange={handleBiomarkerChange}
            />
          )}
          {activeTab === 'models' && (
            <MathematicalModelsPanel
              tStage={tStage}
              tumorSize={tumorSizeMap[tStage] || 2}
            />
          )}
          {activeTab === 'mdt' && (
            <MDTPanel
              staging={{ t: tStage, n: nStage, m: mStage }}
              symptoms={symptoms}
              ps={ps}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LungCancerModule;
