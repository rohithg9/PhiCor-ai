import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  Stethoscope, Shield, Lock, AlertTriangle, CheckCircle,
  User, FileText, Pill, Activity, Clock, Search, Filter,
  ChevronRight, Plus, AlertCircle, TestTube
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import FeatureNav from '../../components/FeatureNav';

/**
 * MEDIQ Clinical Workspace - For Pharmacists & Physicians
 * Full medication reconciliation with comprehensive safety screening
 */
const MediqClinicalPage = () => {
  const { isDark } = useTheme();
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Feature flag - show coming soon overlay
  const FEATURE_ENABLED = false;

  if (!FEATURE_ENABLED) {
    return (
      <>
        <Helmet>
          <title>Clinical Workspace | PHICOR MEDIQ</title>
        </Helmet>
        <FeatureNav showTitle={true} />
        
        <div className={`min-h-screen pt-16 flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-4"
          >
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
              isDark ? 'bg-purple-500/20' : 'bg-purple-100'
            }`}>
              <Stethoscope className="w-10 h-10 text-purple-500" />
            </div>
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
              Coming Soon
            </Badge>
            <h1 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Clinical Workspace
            </h1>
            <p className={`max-w-md mx-auto mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Complete medication reconciliation with drug-drug, drug-disease, and allergy screening 
              across the full patient context. Designed for pharmacists and physicians.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['Full Safety Screening', 'Renal/Hepatic Dosing', 'Lab Monitoring', 'Evidence-Linked Alerts'].map((feature) => (
                <Badge key={feature} variant="outline" className={isDark ? 'border-gray-700 text-gray-400' : ''}>
                  <CheckCircle className="w-3 h-3 mr-1.5 text-green-500" />
                  {feature}
                </Badge>
              ))}
            </div>
            <Button 
              variant="outline" 
              className={`${isDark ? 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10' : ''}`}
              onClick={() => window.history.back()}
            >
              <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
              Back to MEDIQ
            </Button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Clinical Workspace | PHICOR MEDIQ</title>
      </Helmet>
      <FeatureNav showTitle={true} />
      <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Content will be built out in future iterations */}
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Clinical Workspace</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Full implementation coming soon.
          </p>
        </div>
      </div>
    </>
  );
};

export default MediqClinicalPage;
