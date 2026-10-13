import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  Code, Terminal, Copy, CheckCircle, ChevronRight, ExternalLink,
  Server, Shield, Key, Database, Zap, FileJson, BookOpen
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import FeatureNav from '../../components/FeatureNav';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * MEDIQ API & SDK Documentation - For EMR/HIS Vendors
 * REST and FHIR-compatible APIs with comprehensive documentation
 */
const MediqDevelopersPage = () => {
  const { isDark } = useTheme();
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  // API Endpoints
  const endpoints = [
    {
      id: 'search',
      method: 'GET',
      path: '/v1/drugs/search',
      description: 'Country-specific drug search with autocomplete',
      params: ['country', 'query', 'limit'],
      example: `${API_URL}/api/mediq/v1/drugs/search?country=UK&query=paracetamol`
    },
    {
      id: 'drug-detail',
      method: 'GET',
      path: '/v1/drugs/{id}',
      description: 'Get detailed drug information including ingredients and provenance',
      params: ['id'],
      example: `${API_URL}/api/mediq/v1/drugs/paracetamol-500mg-uk`
    },
    {
      id: 'resolve',
      method: 'POST',
      path: '/v1/drugs/resolve',
      description: 'Resolve multiple medication candidates from typed/OCR input',
      params: ['medications[]', 'country'],
      example: `POST ${API_URL}/api/mediq/v1/drugs/resolve`
    },
    {
      id: 'safety',
      method: 'POST',
      path: '/v1/safety/assess',
      description: 'Patient-specific medication safety assessment',
      params: ['patient_id', 'medications[]', 'conditions[]'],
      example: `POST ${API_URL}/api/mediq/v1/safety/assess`
    },
    {
      id: 'monitoring',
      method: 'POST',
      path: '/v1/monitoring/plan',
      description: 'Generate evidence-backed monitoring plan',
      params: ['medications[]', 'patient_context'],
      example: `POST ${API_URL}/api/mediq/v1/monitoring/plan`
    },
    {
      id: 'coverage',
      method: 'GET',
      path: '/v1/data/coverage',
      description: 'Get data coverage statistics by country and source',
      params: ['country'],
      example: `${API_URL}/api/mediq/v1/data/coverage?country=UK`
    }
  ];

  // SDK Features
  const sdkFeatures = [
    { icon: Server, title: 'REST API', description: 'Full RESTful API with JSON responses' },
    { icon: FileJson, title: 'FHIR R4', description: 'FHIR-compatible resources and operations' },
    { icon: Shield, title: 'OAuth 2.0', description: 'Secure authentication with tenant isolation' },
    { icon: Key, title: 'API Keys', description: 'Environment-specific API key management' },
    { icon: Database, title: 'Webhooks', description: 'Real-time event notifications' },
    { icon: Zap, title: 'Rate Limiting', description: 'Fair usage with configurable limits' }
  ];

  return (
    <>
      <Helmet>
        <title>API & SDK | PHICOR MEDIQ</title>
        <meta name="description" content="MEDIQ API documentation for EMR/HIS integration. REST and FHIR-compatible endpoints with comprehensive SDK." />
      </Helmet>
      
      <FeatureNav showTitle={true} />
      
      <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-slate-500/20 text-slate-400 border-slate-500/30">
              <Code className="w-3.5 h-3.5 mr-1.5" />
              Developer Documentation
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              MEDIQ <span className="bg-gradient-to-r from-slate-400 to-zinc-400 bg-clip-text text-transparent">API & SDK</span>
            </h1>
            <p className={`max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Integrate medication intelligence into your EMR/HIS with our REST and FHIR-compatible APIs.
            </p>
          </motion.div>

          {/* SDK Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
          >
            {sdkFeatures.map((feature, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl text-center ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}
              >
                <feature.icon className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{feature.description}</p>
              </div>
            ))}
          </motion.div>

          {/* API Endpoints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-slate-500" />
              API Endpoints
            </h2>
            
            <div className="space-y-4">
              {endpoints.map((endpoint) => (
                <div 
                  key={endpoint.id}
                  className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className={`font-mono ${
                        endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {endpoint.method}
                      </Badge>
                      <code className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {endpoint.path}
                      </code>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(endpoint.example, endpoint.id)}
                      className="text-xs"
                    >
                      {copiedEndpoint === endpoint.id ? (
                        <><CheckCircle className="w-3.5 h-3.5 mr-1 text-green-500" /> Copied</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>
                      )}
                    </Button>
                  </div>
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {endpoint.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {endpoint.params.map((param) => (
                      <Badge key={param} variant="outline" className={`text-xs font-mono ${isDark ? 'border-gray-700' : ''}`}>
                        {param}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Start */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Start
            </h2>
            
            <div className={`p-4 rounded-lg font-mono text-sm ${isDark ? 'bg-gray-950 text-gray-300' : 'bg-gray-900 text-gray-100'}`}>
              <pre className="overflow-x-auto">
{`# Search for drugs in UK
curl -X GET "${API_URL}/api/mediq/v1/drugs/search?country=UK&query=metformin" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Check medication safety
curl -X POST "${API_URL}/api/mediq/v1/safety/assess" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "medications": ["metformin-500mg", "lisinopril-10mg"],
    "patient": {
      "age": 65,
      "conditions": ["diabetes", "hypertension"],
      "renal_function": { "egfr": 45 }
    }
  }'`}
              </pre>
            </div>
          </motion.div>

          {/* Contact for API Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-xl p-6 text-center ${isDark ? 'bg-gradient-to-r from-slate-900 to-zinc-900 border border-slate-700' : 'bg-gradient-to-r from-slate-100 to-zinc-100 border border-slate-200'}`}
          >
            <h3 className="text-lg font-bold mb-2">Ready to Integrate?</h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Contact us to get API access and discuss your integration requirements.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button className="bg-slate-600 hover:bg-slate-700">
                <Key className="w-4 h-4 mr-2" />
                Request API Key
              </Button>
              <Button variant="outline" className={isDark ? 'border-slate-600' : ''}>
                <BookOpen className="w-4 h-4 mr-2" />
                Full Documentation
                <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default MediqDevelopersPage;
