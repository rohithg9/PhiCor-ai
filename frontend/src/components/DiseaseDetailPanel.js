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
                    <div className="text-xs space-y-1 p-2 bg-background/50 rounded">
                      {Object.entries(disease.diagnostic_criteria).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium capitalize">{key.replace(/_/g, ' ')}: </span>
                          <span className="text-muted-foreground">
                            {Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="treatment" className="mt-3">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {disease.treatment && (
                  <>
                    {/* Pharmacological Section */}
                    {(disease.treatment.pharmacological || disease.treatment.first_line) && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider flex items-center gap-1">
                          <Pill className="w-3 h-3" /> Pharmacological Therapy
                        </h4>
                        
                        {/* First Line */}
                        {(disease.treatment.pharmacological?.first_line || disease.treatment.first_line) && (
                          <div className="p-2 rounded bg-green-500/5 border border-green-500/20">
                            <span className="text-[10px] text-green-400 font-semibold">First-Line:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(Array.isArray(disease.treatment.pharmacological?.first_line || disease.treatment.first_line) 
                                ? (disease.treatment.pharmacological?.first_line || disease.treatment.first_line)
                                : [disease.treatment.pharmacological?.first_line || disease.treatment.first_line]
                              ).map((tx, i) => {
                                // Extract display name from various formats
                                let displayName = '';
                                let details = '';
                                let evidence = '';
                                
                                if (typeof tx === 'string') {
                                  displayName = tx;
                                } else if (typeof tx === 'object' && tx !== null) {
                                  displayName = tx.drug_class || tx.drug || tx.name || tx.class || 'Unknown';
                                  if (tx.examples && Array.isArray(tx.examples)) {
                                    details = tx.examples.join(', ');
                                  } else if (tx.dose) {
                                    details = tx.dose;
                                  }
                                  evidence = tx.evidence_level || '';
                                }
                                
                                return (
                                  <div key={i} className="text-xs p-1.5 bg-green-500/10 rounded border border-green-500/30">
                                    <span className="font-medium text-green-400">{displayName}</span>
                                    {details && <span className="text-green-300 ml-1">({details})</span>}
                                    {evidence && <Badge variant="outline" className="ml-1 text-[8px]">{evidence}</Badge>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Second Line */}
                        {(disease.treatment.pharmacological?.second_line || disease.treatment.second_line) && (
                          <div className="p-2 rounded bg-yellow-500/5 border border-yellow-500/20">
                            <span className="text-[10px] text-yellow-400 font-semibold">Second-Line:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(Array.isArray(disease.treatment.pharmacological?.second_line || disease.treatment.second_line)
                                ? (disease.treatment.pharmacological?.second_line || disease.treatment.second_line)
                                : [disease.treatment.pharmacological?.second_line || disease.treatment.second_line]
                              ).map((tx, i) => {
                                let displayName = '';
                                if (typeof tx === 'string') {
                                  displayName = tx;
                                } else if (typeof tx === 'object' && tx !== null) {
                                  displayName = tx.drug_class || tx.drug || tx.name || tx.class || 'Unknown';
                                }
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
                    )}

                    {/* Device Therapy */}
                    {(disease.treatment.device_therapy || disease.treatment.devices) && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1">
                          ⚡ Device Therapy
                        </h4>
                        <div className="grid gap-2">
                          {(Array.isArray(disease.treatment.device_therapy || disease.treatment.devices)
                            ? (disease.treatment.device_therapy || disease.treatment.devices)
                            : [disease.treatment.device_therapy || disease.treatment.devices]
                          ).filter(Boolean).map((dev, i) => {
                            let deviceName = '';
                            let description = '';
                            let indications = '';
                            let evidence = '';
                            
                            if (typeof dev === 'string') {
                              deviceName = dev;
                            } else if (typeof dev === 'object' && dev !== null) {
                              deviceName = dev.device || dev.name || 'Unknown Device';
                              description = dev.description || '';
                              indications = Array.isArray(dev.indications) ? dev.indications.join('; ') : (dev.indications || '');
                              evidence = dev.evidence_level || '';
                            }
                            
                            return (
                              <div key={i} className="p-2 rounded bg-purple-500/5 border border-purple-500/20">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-purple-400 text-sm">{deviceName}</span>
                                  {evidence && <Badge variant="outline" className="text-[8px]">{evidence}</Badge>}
                                </div>
                                {indications && (
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    <span className="text-purple-300">Indications:</span> {indications}
                                  </p>
                                )}
                                {description && <p className="text-[10px] text-muted-foreground mt-1">{description}</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Surgical / Interventional */}
                    {disease.treatment.interventional && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                          🔪 Surgical & Interventional
                        </h4>
                        {disease.treatment.interventional.surgical && (
                          <div className="grid gap-2">
                            {(Array.isArray(disease.treatment.interventional.surgical) 
                              ? disease.treatment.interventional.surgical 
                              : [disease.treatment.interventional.surgical]
                            ).filter(Boolean).map((surg, i) => {
                              let surgName = '';
                              let surgIndications = '';
                              let surgEvidence = '';
                              let surgSuccess = '';
                              
                              if (typeof surg === 'string') {
                                surgName = surg;
                              } else if (typeof surg === 'object' && surg !== null) {
                                surgName = surg.name || 'Unknown Procedure';
                                surgIndications = Array.isArray(surg.indications) ? surg.indications.join('; ') : (surg.indications || '');
                                surgEvidence = surg.evidence_level || '';
                                surgSuccess = surg.success_rate || '';
                              }
                              
                              return (
                                <div key={i} className="p-2 rounded bg-red-500/5 border border-red-500/20">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-red-400 text-sm">{surgName}</span>
                                    {surgEvidence && <Badge variant="outline" className="text-[8px]">{surgEvidence}</Badge>}
                                  </div>
                                  {surgIndications && (
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                      <span className="text-red-300">Indications:</span> {surgIndications}
                                    </p>
                                  )}
                                  {surgSuccess && <span className="text-[10px] text-green-400">Success: {surgSuccess}</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Transplant */}
                    {disease.treatment.transplant && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-pink-500 uppercase tracking-wider flex items-center gap-1">
                          🫀 Transplant Criteria
                        </h4>
                        <div className="p-2 rounded bg-pink-500/5 border border-pink-500/20 space-y-2">
                          {disease.treatment.transplant.indications && (
                            <div>
                              <span className="text-[10px] text-pink-400 font-semibold">Indications:</span>
                              <ul className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                {(Array.isArray(disease.treatment.transplant.indications) 
                                  ? disease.treatment.transplant.indications 
                                  : [disease.treatment.transplant.indications]
                                ).map((ind, i) => <li key={i}>• {ind}</li>)}
                              </ul>
                            </div>
                          )}
                          {disease.treatment.transplant.contraindications && (
                            <div>
                              <span className="text-[10px] text-red-400 font-semibold">Contraindications:</span>
                              <ul className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                {disease.treatment.transplant.contraindications.absolute && 
                                  disease.treatment.transplant.contraindications.absolute.map((c, i) => 
                                    <li key={i} className="text-red-300">• (Absolute) {c}</li>
                                  )}
                                {disease.treatment.transplant.contraindications.relative && 
                                  disease.treatment.transplant.contraindications.relative.map((c, i) => 
                                    <li key={i} className="text-yellow-300">• (Relative) {c}</li>
                                  )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Lifestyle */}
                    {disease.treatment.lifestyle && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
                          <Heart className="w-3 h-3" /> Lifestyle Modifications
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(disease.treatment.lifestyle) ? disease.treatment.lifestyle : [disease.treatment.lifestyle]).map((mod, i) => {
                            const item = typeof mod === 'object' ? mod : { modification: mod };
                            return (
                              <div key={i} className="text-xs p-1.5 bg-blue-500/10 rounded border border-blue-500/30">
                                <span className="font-medium text-blue-400">{item.modification || item.name || item}</span>
                                {item.specific_recommendations && <span className="text-blue-300 ml-1">- {item.specific_recommendations}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
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
