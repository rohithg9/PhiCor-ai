import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FileText, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import FeatureNav from '../../components/FeatureNav';

/**
 * MEDIQ Discharge Reconciliation - For Care Transitions
 * Compare medications and generate patient instructions
 */
const MediqDischargePage = () => {
  const { isDark } = useTheme();

  // Feature flag - show coming soon overlay
  const FEATURE_ENABLED = false;

  if (!FEATURE_ENABLED) {
    return (
      <>
        <Helmet>
          <title>Discharge Reconciliation | PHICOR MEDIQ</title>
        </Helmet>
        <FeatureNav showTitle={true} />
        
        <div className={`min-h-screen pt-16 flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-4"
          >
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
              isDark ? 'bg-amber-500/20' : 'bg-amber-100'
            }`}>
              <FileText className="w-10 h-10 text-amber-500" />
            </div>
            <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
              Coming Soon
            </Badge>
            <h1 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Discharge Reconciliation
            </h1>
            <p className={`max-w-md mx-auto mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Compare admission, inpatient, and discharge medications. Generate patient-friendly 
              instructions for care transitions.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['Med Comparison', 'Change Reasons', 'Supply Checks', 'Follow-up Plans'].map((feature) => (
                <Badge key={feature} variant="outline" className={isDark ? 'border-gray-700 text-gray-400' : ''}>
                  <CheckCircle className="w-3 h-3 mr-1.5 text-green-500" />
                  {feature}
                </Badge>
              ))}
            </div>
            <Button 
              variant="outline" 
              className={`${isDark ? 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10' : ''}`}
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
        <title>Discharge Reconciliation | PHICOR MEDIQ</title>
      </Helmet>
      <FeatureNav showTitle={true} />
      <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Discharge Reconciliation</h1>
        </div>
      </div>
    </>
  );
};

export default MediqDischargePage;
