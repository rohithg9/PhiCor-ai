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
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {disease.treatment && (
                  <>
                    {disease.treatment.first_line && (
                      <div>
                        <h4 className="text-xs font-semibold text-green-600 mb-1 flex items-center gap-1">
                          <Pill className="w-3 h-3" /> First-Line Treatment
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {disease.treatment.first_line.map((tx, i) => (
                            <Badge key={i} className="text-xs bg-green-500/10 text-green-600 border-green-500/30">{tx}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {disease.treatment.second_line && (
                      <div>
                        <h4 className="text-xs font-semibold text-yellow-600 mb-1 flex items-center gap-1">
                          <Pill className="w-3 h-3" /> Second-Line Treatment
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {disease.treatment.second_line.map((tx, i) => (
                            <Badge key={i} className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30">{tx}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {disease.treatment.lifestyle && (
                      <div>
                        <h4 className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1">
                          <Heart className="w-3 h-3" /> Lifestyle Modifications
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {disease.treatment.lifestyle.map((mod, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{mod}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {disease.treatment.devices && (
                      <div>
                        <h4 className="text-xs font-semibold text-purple-600 mb-1">Device Therapy</h4>
                        <div className="flex flex-wrap gap-1">
                          {disease.treatment.devices.map((dev, i) => (
                            <Badge key={i} className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">{dev}</Badge>
                          ))}
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
                    <p className="text-sm">{disease.prognosis}</p>
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
