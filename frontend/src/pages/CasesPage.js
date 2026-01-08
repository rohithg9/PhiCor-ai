import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  FileText, Calendar, Eye, Tag, Trash2, Share2, Download,
  ChevronRight, Search, Filter, ArrowLeft, Stethoscope,
  Activity, Brain, AlertTriangle, CheckCircle, Clock,
  Copy, ExternalLink, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import FeatureNav from '../components/FeatureNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Case List Component
const CasesList = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    loadCases();
  }, [selectedTag]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const url = selectedTag 
        ? `${BACKEND_URL}/api/cases?tag=${encodeURIComponent(selectedTag)}`
        : `${BACKEND_URL}/api/cases`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setCases(data.cases);
      }
    } catch (error) {
      console.error('Error loading cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const deleteCase = async (caseId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this case?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/cases/${caseId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Case deleted');
        loadCases();
      }
    } catch (error) {
      toast.error('Failed to delete case');
    }
  };

  const copyShareLink = (caseId, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/cases/${caseId}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard');
  };

  const filteredCases = cases.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.primary_diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clinical_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get all unique tags
  const allTags = [...new Set(cases.flatMap(c => c.tags || []))];

  return (
    <>
      <Helmet>
        <title>Saved Cases | PhiCor.ai</title>
        <meta name="description" content="View and manage saved clinical cases with evidence-based differential diagnosis." />
      </Helmet>
      
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <FeatureNav />
        
        <div className="max-w-6xl mx-auto p-4 pt-20">
          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-7 h-7 text-emerald-500" />
              Saved Clinical Cases
            </h1>
            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              View, share, and export your clinical case analyses
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cases..."
                className={`pl-10 ${isDark ? 'bg-gray-900 border-gray-800' : ''}`}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge 
                onClick={() => setSelectedTag(null)}
                className={`cursor-pointer ${!selectedTag ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
              >
                All
              </Badge>
              {allTags.slice(0, 5).map(tag => (
                <Badge 
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`cursor-pointer ${tag === selectedTag ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Cases Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : filteredCases.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>No cases found</p>
              <Button 
                onClick={() => navigate('/differential')}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
              >
                Create Your First Case
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCases.map(caseItem => (
                <div 
                  key={caseItem.id}
                  onClick={() => navigate(`/cases/${caseItem.id}`)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                    isDark 
                      ? 'bg-gray-900/50 border-gray-800 hover:border-emerald-500/50' 
                      : 'bg-white border-gray-200 hover:border-emerald-500'
                  }`}
                >
                  {/* Title */}
                  <h3 className={`font-semibold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {caseItem.title}
                  </h3>
                  
                  {/* Primary Diagnosis */}
                  {caseItem.primary_diagnosis && (
                    <div className="flex items-center gap-2 mb-3">
                      <Stethoscope className="w-4 h-4 text-emerald-500" />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {caseItem.primary_diagnosis}
                      </span>
                    </div>
                  )}
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(caseItem.tags || []).slice(0, 3).map(tag => (
                      <Badge key={tag} className="text-[10px] bg-gray-500/20">
                        {tag}
                      </Badge>
                    ))}
                    {caseItem.is_demo && (
                      <Badge className="text-[10px] bg-purple-500/20 text-purple-400">
                        Demo
                      </Badge>
                    )}
                  </div>
                  
                  {/* Meta */}
                  <div className={`flex items-center justify-between text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(caseItem.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {caseItem.views || 0}
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => copyShareLink(caseItem.id, e)}
                        className={`p-1 rounded hover:bg-gray-700/50`}
                        title="Copy share link"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                      {!caseItem.is_demo && (
                        <button 
                          onClick={(e) => deleteCase(caseItem.id, e)}
                          className="p-1 rounded hover:bg-red-500/20 text-red-400"
                          title="Delete case"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Case Detail Component
const CaseDetail = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const loadCase = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cases/${caseId}`);
      const data = await response.json();
      if (data.success) {
        setCaseData(data.case);
      } else {
        toast.error('Case not found');
        navigate('/cases');
      }
    } catch (error) {
      toast.error('Failed to load case');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied!');
  };

  const exportToPDF = () => {
    // Create printable content
    const printContent = document.getElementById('case-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${caseData?.title || 'Clinical Case'} - PhiCor.ai</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 24px; }
          h3 { color: #6B7280; margin-top: 16px; }
          .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
          .badge { display: inline-block; padding: 2px 8px; background: #e5e7eb; border-radius: 4px; margin: 2px; font-size: 12px; }
          .diagnosis { padding: 10px; margin: 8px 0; background: #ecfdf5; border-left: 3px solid #059669; }
          .finding { padding: 8px; margin: 4px 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 4px; }
          .alert { padding: 10px; background: #fef2f2; border-left: 3px solid #ef4444; margin: 8px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>🏥 ${caseData?.title || 'Clinical Case Report'}</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Case ID:</strong> ${caseData?.id}</p>
        
        <div class="section">
          <h2>📋 Clinical Presentation</h2>
          <p>${caseData?.clinical_text || 'No clinical text provided'}</p>
        </div>
        
        ${caseData?.patient_summary ? `
        <div class="section">
          <h2>👤 Patient Summary</h2>
          <p><strong>Age:</strong> ${caseData.patient_summary.age || 'N/A'}</p>
          <p><strong>Sex:</strong> ${caseData.patient_summary.sex || 'N/A'}</p>
          <p><strong>Chief Complaint:</strong> ${caseData.patient_summary.chief_complaint || 'N/A'}</p>
        </div>
        ` : ''}
        
        ${caseData?.dominant_syndrome ? `
        <div class="section">
          <h2>🎯 Dominant Clinical Syndrome</h2>
          <p><strong>${caseData.dominant_syndrome.syndrome_name || caseData.dominant_syndrome.syndrome}</strong></p>
          <p>Confidence: ${caseData.dominant_syndrome.confidence || 'N/A'}</p>
        </div>
        ` : ''}
        
        ${caseData?.findings?.length > 0 ? `
        <div class="section">
          <h2>🔬 Clinical Findings</h2>
          ${caseData.findings.map(f => `
            <div class="finding">
              <strong>${f.parameterName || f.name}</strong>: ${f.value || 'Present'} ${f.unit || ''} 
              <span class="badge">${f.direction === 'increase' ? '↑ Elevated' : f.direction === 'decrease' ? '↓ Low' : 'Present'}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${caseData?.symptoms?.length > 0 ? `
        <div class="section">
          <h2>📝 Symptoms</h2>
          ${caseData.symptoms.map(s => `
            <span class="badge">${s.name} (${s.severity || 'present'})</span>
          `).join('')}
        </div>
        ` : ''}
        
        ${caseData?.differentials?.length > 0 ? `
        <div class="section">
          <h2>🩺 Differential Diagnosis</h2>
          ${caseData.differentials.map((d, i) => `
            <div class="diagnosis">
              <strong>#${d.rank || i+1}: ${d.name || d.diagnosis}</strong> - ${d.probability}% probability
              <br><small>${d.clinical_reasoning || d.role || ''}</small>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${caseData?.synthesis ? `
        <div class="section">
          <h2>💡 Clinical Synthesis</h2>
          <p><strong>Most Likely:</strong> ${caseData.synthesis.most_likely_diagnosis || caseData.synthesis.primary_diagnosis || 'N/A'}</p>
          <p><strong>Key Alternative:</strong> ${caseData.synthesis.key_alternative || 'N/A'}</p>
          <p><strong>Clinical Uncertainty:</strong> ${caseData.synthesis.clinical_uncertainty || 'N/A'}</p>
        </div>
        ` : ''}
        
        ${caseData?.safety_alerts?.length > 0 ? `
        <div class="section">
          <h2>⚠️ Safety Alerts</h2>
          ${caseData.safety_alerts.map(a => `
            <div class="alert">
              <strong>${a.parameter || 'Alert'}:</strong> ${a.message}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Generated by PhiCor.ai - Mathematical Clinical Decision Support</p>
          <p>This report is for educational purposes only. Always consult with qualified healthcare professionals.</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <>
      <Helmet>
        <title>{caseData.title} | PhiCor.ai</title>
        <meta name="description" content={`Clinical case: ${caseData.primary_diagnosis || caseData.title}`} />
      </Helmet>
      
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <FeatureNav />
        
        <div className="max-w-4xl mx-auto p-4 pt-20" id="case-content">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/cases')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cases
          </Button>
          
          {/* Header */}
          <div className={`rounded-xl border p-6 mb-6 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {caseData.title}
                </h1>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {new Date(caseData.created_at).toLocaleDateString()}
                  </span>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                    <Eye className="w-4 h-4 inline mr-1" />
                    {caseData.views || 0} views
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {(caseData.tags || []).map(tag => (
                    <Badge key={tag} className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyShareLink}>
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button onClick={exportToPDF} className="bg-emerald-600 hover:bg-emerald-700">
                  <Download className="w-4 h-4 mr-2" /> Export PDF
                </Button>
              </div>
            </div>
          </div>
          
          {/* Clinical Text */}
          <div className={`rounded-xl border p-6 mb-6 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-5 h-5 text-emerald-500" />
              Clinical Presentation
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              {caseData.clinical_text}
            </p>
          </div>
          
          {/* Dominant Syndrome */}
          {caseData.dominant_syndrome && (
            <div className={`rounded-xl border p-6 mb-6 ${isDark ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-200'}`}>
              <h2 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                <Brain className="w-5 h-5" />
                Dominant Clinical Syndrome
              </h2>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {caseData.dominant_syndrome.syndrome_name || caseData.dominant_syndrome.syndrome}
              </p>
              {caseData.dominant_syndrome.confidence && (
                <Badge className="mt-2 bg-purple-500/20">
                  Confidence: {caseData.dominant_syndrome.confidence}
                </Badge>
              )}
            </div>
          )}
          
          {/* Findings */}
          {caseData.findings?.length > 0 && (
            <div className={`rounded-xl border p-6 mb-6 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Activity className="w-5 h-5 text-emerald-500" />
                Clinical Findings ({caseData.findings.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {caseData.findings.map((f, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg ${
                      f.direction === 'increase' 
                        ? isDark ? 'bg-red-900/30 border border-red-800/50' : 'bg-red-50 border border-red-200'
                        : f.direction === 'decrease'
                          ? isDark ? 'bg-blue-900/30 border border-blue-800/50' : 'bg-blue-50 border border-blue-200'
                          : isDark ? 'bg-emerald-900/30 border border-emerald-800/50' : 'bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {f.parameterName || f.name}
                    </div>
                    <div className={`text-lg font-bold ${
                      f.direction === 'increase' ? 'text-red-500' : f.direction === 'decrease' ? 'text-blue-500' : 'text-emerald-500'
                    }`}>
                      {f.value || '—'} {f.unit || ''}
                    </div>
                    <Badge className="text-[10px] mt-1">
                      {f.direction === 'increase' ? '↑ Elevated' : f.direction === 'decrease' ? '↓ Low' : '✓ Present'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Differential Diagnosis */}
          {caseData.differentials?.length > 0 && (
            <div className={`rounded-xl border p-6 mb-6 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Stethoscope className="w-5 h-5 text-emerald-500" />
                Differential Diagnosis
              </h2>
              <div className="space-y-3">
                {caseData.differentials.map((d, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg ${
                      idx === 0 
                        ? isDark ? 'bg-emerald-900/30 border border-emerald-800/50' : 'bg-emerald-50 border border-emerald-200'
                        : isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${idx === 0 ? 'text-emerald-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          #{d.rank || idx + 1}
                        </span>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {d.name || d.diagnosis}
                        </span>
                      </div>
                      <Badge className={idx === 0 ? 'bg-emerald-500' : ''}>
                        {d.probability}%
                      </Badge>
                    </div>
                    {d.clinical_reasoning && (
                      <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {d.clinical_reasoning}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Safety Alerts */}
          {caseData.safety_alerts?.length > 0 && (
            <div className={`rounded-xl border p-6 mb-6 ${isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200'}`}>
              <h2 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                <AlertTriangle className="w-5 h-5" />
                Safety Alerts
              </h2>
              {caseData.safety_alerts.map((alert, idx) => (
                <div key={idx} className={`p-3 rounded-lg mb-2 ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
                  <strong>{alert.parameter || 'Alert'}:</strong> {alert.message}
                </div>
              ))}
            </div>
          )}
          
          {/* Synthesis */}
          {caseData.synthesis && (
            <div className={`rounded-xl border p-6 mb-6 ${isDark ? 'bg-cyan-900/20 border-cyan-800/30' : 'bg-cyan-50 border-cyan-200'}`}>
              <h2 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                <CheckCircle className="w-5 h-5" />
                Clinical Synthesis
              </h2>
              <div className="space-y-2">
                <p><strong>Most Likely:</strong> {caseData.synthesis.most_likely_diagnosis || caseData.synthesis.primary_diagnosis}</p>
                {caseData.synthesis.key_alternative && (
                  <p><strong>Key Alternative:</strong> {caseData.synthesis.key_alternative}</p>
                )}
                {caseData.synthesis.clinical_uncertainty && (
                  <p><strong>Clinical Uncertainty:</strong> {caseData.synthesis.clinical_uncertainty}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className={`text-center text-sm py-6 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            <p>Generated by PhiCor.ai - Mathematical Clinical Decision Support</p>
            <p className="mt-1">This report is for educational purposes only.</p>
          </div>
        </div>
      </div>
    </>
  );
};

// Main Export - Route handler
const CasesPage = () => {
  const { caseId } = useParams();
  
  if (caseId) {
    return <CaseDetail />;
  }
  
  return <CasesList />;
};

export default CasesPage;
