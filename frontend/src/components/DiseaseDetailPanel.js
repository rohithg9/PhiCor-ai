import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Loader2, AlertTriangle, Pill, Stethoscope, Activity, 
  FileText, Users, TrendingUp, BookOpen, Heart
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Map frontend ICD codes to backend disease IDs
const ICD_TO_BACKEND_MAP = {
  'I50_2': 'heart_failure_hfref',
  'I50.2': 'heart_failure_hfref',
  'I21': 'acute_coronary_syndrome',
  'I21_0': 'acute_coronary_syndrome',
  'I21_4': 'acute_coronary_syndrome',
  'I48': 'atrial_fibrillation',
  'I48_0': 'atrial_fibrillation',
  'I48_1': 'atrial_fibrillation',
  'I10': 'hypertension',
  'I63': 'ischemic_stroke',
  'J44': 'copd',
  'J44_0': 'copd',
  'J44_1': 'copd',
  'J45': 'asthma',
  'E11': 'type2_diabetes',
  'E03': 'hypothyroidism',
  'N18': 'chronic_kidney_disease',
  'G35': 'multiple_sclerosis',
  'G20': 'parkinsons_disease',
  'D50': 'iron_deficiency_anemia',
  'D57': 'sickle_cell_disease',
  'D66': 'hemophilia_a',
  'D68_0': 'von_willebrand_disease',
  'D56_1': 'thalassemia_major',
  'D61': 'aplastic_anemia',
  'C50': 'breast_cancer',
  'C18': 'colorectal_cancer',
  'C61': 'prostate_cancer',
  'Q90': 'down_syndrome',
  'Q96': 'turner_syndrome',
  'Q87_4': 'marfan_syndrome',
  'C91_0': 'acute_lymphoblastic_leukemia',
  'C92_0': 'acute_myeloid_leukemia',
  'C91_1': 'chronic_lymphocytic_leukemia',
  'C90_0': 'multiple_myeloma',
};

// Also map by name patterns
const NAME_TO_BACKEND_MAP = {
  'heart failure': 'heart_failure_hfref',
  'hfref': 'heart_failure_hfref',
  'systolic heart failure': 'heart_failure_hfref',
  'congestive heart failure': 'heart_failure_hfref',
  'acute coronary': 'acute_coronary_syndrome',
  'myocardial infarction': 'acute_coronary_syndrome',
  'atrial fibrillation': 'atrial_fibrillation',
  'afib': 'atrial_fibrillation',
  'hypertension': 'hypertension',
  'stroke': 'ischemic_stroke',
  'copd': 'copd',
  'asthma': 'asthma',
  'diabetes': 'type2_diabetes',
  'hypothyroid': 'hypothyroidism',
  'chronic kidney': 'chronic_kidney_disease',
  'ckd': 'chronic_kidney_disease',
  'multiple sclerosis': 'multiple_sclerosis',
  'parkinson': 'parkinsons_disease',
  'iron deficiency': 'iron_deficiency_anemia',
  'sickle cell': 'sickle_cell_disease',
  'hemophilia': 'hemophilia_a',
  'von willebrand': 'von_willebrand_disease',
  'thalassemia': 'thalassemia_major',
  'aplastic': 'aplastic_anemia',
  'breast cancer': 'breast_cancer',
  'colorectal': 'colorectal_cancer',
  'colon cancer': 'colorectal_cancer',
  'prostate cancer': 'prostate_cancer',
  'down syndrome': 'down_syndrome',
  'turner syndrome': 'turner_syndrome',
  'marfan': 'marfan_syndrome',
  'all': 'acute_lymphoblastic_leukemia',
  'aml': 'acute_myeloid_leukemia',
  'cll': 'chronic_lymphocytic_leukemia',
  'myeloma': 'multiple_myeloma',
};

const getBackendDiseaseId = (diseaseId, diseaseName) => {
  // First try direct ICD code mapping
  if (diseaseId && ICD_TO_BACKEND_MAP[diseaseId]) {
    return ICD_TO_BACKEND_MAP[diseaseId];
  }
  
  // Try with underscore replaced by dot
  const dotVersion = diseaseId?.replace('_', '.');
  if (dotVersion && ICD_TO_BACKEND_MAP[dotVersion]) {
    return ICD_TO_BACKEND_MAP[dotVersion];
  }
  
  // Try name-based matching
  const lowerName = (diseaseName || '').toLowerCase();
  for (const [pattern, backendId] of Object.entries(NAME_TO_BACKEND_MAP)) {
    if (lowerName.includes(pattern)) {
      return backendId;
    }
  }
  
  // Fallback to disease ID as-is
  return diseaseId;
};

const DiseaseDetailPanel = ({ diseaseId, diseaseName }) => {
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiseaseDetail = async () => {
      if (!diseaseId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get the backend disease ID using mapping
        const backendId = getBackendDiseaseId(diseaseId, diseaseName);
        console.log('Fetching disease:', diseaseId, '-> backend:', backendId);
        
        // Try to fetch by mapped ID first
        let response = await fetch(`${API_URL}/api/diseases-db/${backendId}`);
        
        if (!response.ok) {
          // Try searching by name
          const searchName = diseaseName || diseaseId.replace(/_/g, ' ');
          response = await fetch(`${API_URL}/api/diseases-db?search=${encodeURIComponent(searchName)}&limit=1`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.diseases && data.diseases.length > 0) {
              // Fetch full details
              const detailResponse = await fetch(`${API_URL}/api/diseases-db/${data.diseases[0].id}`);
              if (detailResponse.ok) {
                setDisease(await detailResponse.json());
                return;
              }
            }
          }
          setDisease(null);
          return;
        }
        
        const data = await response.json();
        setDisease(data);
      } catch (err) {
        console.error('Error fetching disease:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiseaseDetail();
  }, [diseaseId, diseaseName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!disease) {
    return null; // No backend data available for this disease
  }

  return (
    <Card className="mt-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Evidence-Based Guidelines
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            ICD-10: {disease.icd10_code}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="clinical" className="text-xs">Clinical</TabsTrigger>
            <TabsTrigger value="treatment" className="text-xs">Treatment</TabsTrigger>
            <TabsTrigger value="prognosis" className="text-xs">Prognosis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-3">
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{disease.description}</p>
                
                {disease.synonyms && disease.synonyms.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">Also Known As</h4>
                    <div className="flex flex-wrap gap-1">
                      {disease.synonyms.map((syn, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{syn}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {disease.epidemiology && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Epidemiology
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {disease.epidemiology.prevalence && (
                        <div className="p-2 bg-background/50 rounded">
                          <span className="text-muted-foreground">Prevalence:</span>
                          <p className="font-medium">{disease.epidemiology.prevalence}</p>
                        </div>
                      )}
                      {disease.epidemiology.mortality && (
                        <div className="p-2 bg-background/50 rounded">
                          <span className="text-muted-foreground">Mortality:</span>
                          <p className="font-medium">{disease.epidemiology.mortality}</p>
                        </div>
                      )}
                    </div>
                    {disease.epidemiology.risk_factors && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">Risk Factors: </span>
                        <span className="text-xs">{disease.epidemiology.risk_factors.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="clinical" className="mt-3">
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {disease.clinical_features?.symptoms && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3" /> Symptoms
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {disease.clinical_features.symptoms.map((sym, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{sym}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {disease.clinical_features?.signs && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Signs
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {disease.clinical_features.signs.map((sign, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{sign}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {disease.diagnostic_criteria && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Diagnostic Criteria
                    </h4>
                    <div className="text-xs space-y-2 p-2 bg-background/50 rounded">
                      {Object.entries(disease.diagnostic_criteria).map(([key, value]) => {
                        // Helper to render a single item (could be string or object)
                        const renderItem = (item, idx) => {
                          if (item === null || item === undefined) return null;
                          if (typeof item === 'string') {
                            return <li key={idx} className="text-muted-foreground">{item}</li>;
                          }
                          if (typeof item === 'object') {
                            // Handle objects like {stage, description, criteria}
                            const displayText = item.description || item.name || item.stage || 
                              Object.entries(item)
                                .filter(([k, v]) => v && v !== 'N/A')
                                .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
                                .join(', ');
                            return (
                              <li key={idx} className="text-muted-foreground">
                                {item.stage && <span className="font-medium text-primary/70">Stage {item.stage}: </span>}
                                {item.description || displayText}
                                {item.criteria && item.criteria !== item.description && (
                                  <span className="ml-1 text-muted-foreground/70">({item.criteria})</span>
                                )}
                              </li>
                            );
                          }
                          return <li key={idx} className="text-muted-foreground">{String(item)}</li>;
                        };
                        
                        // Handle different value types appropriately
                        const renderValue = (val) => {
                          if (val === null || val === undefined || val === 'N/A') {
                            return null;
                          }
                          if (Array.isArray(val)) {
                            if (val.length === 0) return null;
                            return (
                              <ul className="list-disc list-inside ml-2 space-y-0.5">
                                {val.map((item, idx) => renderItem(item, idx))}
                              </ul>
                            );
                          }
                          if (typeof val === 'object') {
                            // Handle nested objects like clinical_criteria
                            const entries = Object.entries(val).filter(([k, v]) => 
                              v && v !== 'N/A' && !(Array.isArray(v) && v.length === 0)
                            );
                            if (entries.length === 0) return null;
                            return (
                              <div className="ml-2 space-y-1">
                                {entries.map(([subKey, subVal]) => (
                                  <div key={subKey}>
                                    <span className="font-medium text-primary/80 capitalize">
                                      {subKey.replace(/_/g, ' ')}:
                                    </span>
                                    {Array.isArray(subVal) ? (
                                      <ul className="list-disc list-inside ml-2">
                                        {subVal.map((item, idx) => renderItem(item, idx))}
                                      </ul>
                                    ) : typeof subVal === 'object' ? (
                                      <span className="text-muted-foreground ml-1">
                                        {subVal.description || subVal.name || JSON.stringify(subVal)}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground ml-1">{String(subVal)}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return <span className="text-muted-foreground">{String(val)}</span>;
                        };
                        
                        const renderedValue = renderValue(value);
                        if (!renderedValue) return null;
                        
                        return (
                          <div key={key} className="border-b border-border/30 pb-1.5 last:border-0">
                            <span className="font-medium capitalize text-primary">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            {renderedValue}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="treatment" className="mt-3">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {/* Use newer treatments array if available */}
                {disease.treatments && disease.treatments.length > 0 ? (
                  <div className="space-y-3">
                    {/* Group by type */}
                    {(() => {
                      const grouped = disease.treatments.reduce((acc, t) => {
                        const type = t.type || 'other';
                        if (!acc[type]) acc[type] = [];
                        acc[type].push(t);
                        return acc;
                      }, {});
                      
                      const typeConfig = {
                        medication: { label: 'Pharmacological Therapy', icon: '💊', color: 'green' },
                        pharmacological: { label: 'Pharmacological Therapy', icon: '💊', color: 'green' },
                        surgical: { label: 'Surgical/Procedural', icon: '🔧', color: 'purple' },
                        device: { label: 'Device Therapy', icon: '⚡', color: 'blue' },
                        lifestyle: { label: 'Lifestyle Modifications', icon: '🏃', color: 'amber' },
                        other: { label: 'Other Treatments', icon: '📋', color: 'gray' }
                      };
                      
                      return Object.entries(grouped).map(([type, treatments]) => {
                        const config = typeConfig[type] || typeConfig.other;
                        return (
                          <div key={type} className="space-y-2">
                            <h4 className={`text-xs font-bold text-${config.color}-500 uppercase tracking-wider flex items-center gap-1`}>
                              <span>{config.icon}</span> {config.label}
                            </h4>
                            <div className="space-y-2">
                              {treatments.map((tx, i) => (
                                <div 
                                  key={i} 
                                  className={`p-2 rounded bg-${config.color}-500/5 border border-${config.color}-500/20`}
                                >
                                  <div className="flex items-start justify-between">
                                    <span className={`text-xs font-medium text-${config.color}-400`}>
                                      {tx.name}
                                    </span>
                                    {tx.first_line && (
                                      <Badge variant="outline" className="text-[8px] bg-green-500/20 text-green-400">1st Line</Badge>
                                    )}
                                  </div>
                                  {tx.description && (
                                    <p className="text-[10px] text-muted-foreground mt-1">{tx.description}</p>
                                  )}
                                  {tx.indication && (
                                    <p className="text-[10px] text-primary/70 mt-0.5">
                                      <span className="font-medium">Indication:</span> {tx.indication}
                                    </p>
                                  )}
                                  {tx.medications && tx.medications.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {tx.medications.map((med, j) => (
                                        <Badge key={j} variant="outline" className="text-[9px]">
                                          {typeof med === 'string' ? med : med.generic_name || med.name}
                                          {typeof med === 'object' && med.dose && ` (${med.dose})`}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : disease.treatment ? (
                  <>
                    {/* Fallback to old treatment structure */}
                    {/* Check for pharmacological with actual data */}
                    {(() => {
                      const firstLine = disease.treatment.pharmacological?.first_line || disease.treatment.first_line || [];
                      const secondLine = disease.treatment.pharmacological?.second_line || disease.treatment.second_line || [];
                      const hasPharmData = (Array.isArray(firstLine) ? firstLine.length > 0 : firstLine) || 
                                          (Array.isArray(secondLine) ? secondLine.length > 0 : secondLine);
                      
                      if (!hasPharmData) return null;
                      
                      return (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider flex items-center gap-1">
                            <Pill className="w-3 h-3" /> Pharmacological Therapy
                          </h4>
                          
                          {/* First Line */}
                          {firstLine && (Array.isArray(firstLine) ? firstLine.length > 0 : true) && (
                            <div className="p-2 rounded bg-green-500/5 border border-green-500/20">
                              <span className="text-[10px] text-green-400 font-semibold">First-Line:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(Array.isArray(firstLine) ? firstLine : [firstLine]).map((tx, i) => {
                                  let displayName = '';
                                  let details = '';
                                  
                                  if (typeof tx === 'string') {
                                    displayName = tx;
                                  } else if (typeof tx === 'object' && tx !== null) {
                                    displayName = tx.drug_class || tx.drug || tx.name || tx.class || 'Treatment';
                                    if (tx.examples && Array.isArray(tx.examples)) {
                                      details = tx.examples.join(', ');
                                    } else if (tx.dose) {
                                      details = tx.dose;
                                    }
                                  }
                                  
                                  if (!displayName) return null;
                                  
                                  return (
                                    <div key={i} className="text-xs p-1.5 bg-green-500/10 rounded border border-green-500/30">
                                      <span className="font-medium text-green-400">{displayName}</span>
                                      {details && <span className="text-green-300 ml-1">({details})</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Second Line */}
                          {secondLine && (Array.isArray(secondLine) ? secondLine.length > 0 : true) && (
                            <div className="p-2 rounded bg-yellow-500/5 border border-yellow-500/20">
                              <span className="text-[10px] text-yellow-400 font-semibold">Second-Line:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(Array.isArray(secondLine) ? secondLine : [secondLine]).map((tx, i) => {
                                  let displayName = typeof tx === 'string' ? tx : tx?.drug_class || tx?.drug || tx?.name || '';
                                  if (!displayName) return null;
                                  return (
                                    <div key={i} className="text-xs p-1.5 bg-yellow-500/10 rounded border border-yellow-500/30">
                                      <span className="font-medium text-yellow-400">{displayName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Surgical/Procedural */}
                    {(disease.treatment.surgical || disease.treatment.procedural) && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1">
                          🔧 Surgical/Procedural
                        </h4>
                        <div className="grid gap-2">
                          {[...(disease.treatment.surgical || []), ...(disease.treatment.procedural || [])].map((proc, i) => (
                            <div key={i} className="text-xs p-2 bg-purple-500/10 rounded border border-purple-500/30">
                              <span className="font-medium text-purple-400">{typeof proc === 'string' ? proc : proc.name}</span>
                              {typeof proc === 'object' && proc.description && (
                                <p className="text-purple-300/70 text-[10px] mt-0.5">{proc.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lifestyle */}
                    {(disease.treatment.lifestyle || disease.treatment.non_pharmacological) && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                          🏃 Lifestyle/Non-Pharmacological
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {[...(disease.treatment.lifestyle || []), ...(disease.treatment.non_pharmacological || [])].map((item, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                              {typeof item === 'string' ? item : item.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Goals */}
                    {disease.treatment.goals && disease.treatment.goals.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
                          🎯 Treatment Goals
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {disease.treatment.goals.map((goal, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/30">
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No treatment information available</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="prognosis" className="mt-3">
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {disease.prognosis && (
                  <div className="p-3 bg-background/50 rounded">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Prognosis
                    </h4>
                    {typeof disease.prognosis === 'string' ? (
                      <p className="text-sm">{disease.prognosis}</p>
                    ) : typeof disease.prognosis === 'object' ? (
                      <div className="space-y-2 text-sm">
                        {disease.prognosis.natural_history && (
                          <div><span className="font-medium text-muted-foreground">Natural History: </span>
                            {typeof disease.prognosis.natural_history === 'object' 
                              ? JSON.stringify(disease.prognosis.natural_history)
                              : disease.prognosis.natural_history}
                          </div>
                        )}
                        {disease.prognosis.with_treatment && (
                          <div><span className="font-medium text-green-600">With Treatment: </span>
                            {typeof disease.prognosis.with_treatment === 'object'
                              ? JSON.stringify(disease.prognosis.with_treatment)
                              : disease.prognosis.with_treatment}
                          </div>
                        )}
                        {disease.prognosis.survival_rates && (
                          <div><span className="font-medium text-blue-600">Survival Rates: </span>
                            {typeof disease.prognosis.survival_rates === 'object' 
                              ? Object.entries(disease.prognosis.survival_rates).map(([k,v]) => 
                                  `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`
                                ).join(', ')
                              : disease.prognosis.survival_rates}
                          </div>
                        )}
                        {disease.prognosis.prognostic_factors && (
                          <div><span className="font-medium text-orange-600">Prognostic Factors: </span>
                            {Array.isArray(disease.prognosis.prognostic_factors) 
                              ? disease.prognosis.prognostic_factors.map(f => 
                                  typeof f === 'object' ? (f.name || JSON.stringify(f)) : f
                                ).join(', ')
                              : typeof disease.prognosis.prognostic_factors === 'object'
                              ? JSON.stringify(disease.prognosis.prognostic_factors)
                              : disease.prognosis.prognostic_factors}
                          </div>
                        )}
                        {disease.prognosis.favorable && (
                          <div><span className="font-medium text-green-600">Favorable Factors: </span>
                            {Array.isArray(disease.prognosis.favorable) 
                              ? disease.prognosis.favorable.join(', ')
                              : typeof disease.prognosis.favorable === 'object'
                              ? JSON.stringify(disease.prognosis.favorable)
                              : disease.prognosis.favorable}
                          </div>
                        )}
                        {disease.prognosis.unfavorable && (
                          <div><span className="font-medium text-red-600">Unfavorable Factors: </span>
                            {Array.isArray(disease.prognosis.unfavorable) 
                              ? disease.prognosis.unfavorable.join(', ')
                              : typeof disease.prognosis.unfavorable === 'object'
                              ? JSON.stringify(disease.prognosis.unfavorable)
                              : disease.prognosis.unfavorable}
                          </div>
                        )}
                        {disease.prognosis.complications && (
                          <div><span className="font-medium text-red-600">Complications: </span>
                            {Array.isArray(disease.prognosis.complications) 
                              ? disease.prognosis.complications.map(c => 
                                  typeof c === 'object' ? (c.name || JSON.stringify(c)) : c
                                ).join(', ')
                              : typeof disease.prognosis.complications === 'object'
                              ? JSON.stringify(disease.prognosis.complications)
                              : disease.prognosis.complications}
                          </div>
                        )}
                        {disease.prognosis.recurrence_rate && (
                          <div><span className="font-medium text-purple-600">Recurrence Rate: </span>
                            {typeof disease.prognosis.recurrence_rate === 'object'
                              ? JSON.stringify(disease.prognosis.recurrence_rate)
                              : disease.prognosis.recurrence_rate}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {disease.affected_organs && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">Affected Organs</h4>
                    <div className="flex flex-wrap gap-1">
                      {disease.affected_organs.map((organ, i) => (
                        <Badge key={i} variant="secondary" className="text-xs capitalize">{organ}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {disease.complications && (
                  <div>
                    <h4 className="text-xs font-semibold text-red-600 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Complications
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(disease.complications).map(([category, items]) => (
                        Array.isArray(items) && items.map((item, i) => (
                          <Badge key={`${category}-${i}`} variant="outline" className="text-xs text-red-600">{item}</Badge>
                        ))
                      ))}
                    </div>
                  </div>
                )}

                {disease.guideline_source && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Guidelines: </span>{disease.guideline_source}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DiseaseDetailPanel;
