import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowRight, Shield, Pill, Activity, Users, FileCheck, 
  Stethoscope, ClipboardList, AlertTriangle, CheckCircle,
  Camera, Upload, Search, Database, Globe, Code,
  Heart, Brain, Zap, Phone, Mail, Building, ChevronRight,
  Sparkles, Lock, Clock, TrendingUp, FileText, UserCheck,
  Syringe, TestTube, BadgeCheck, CircleAlert, Layers
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import FeatureNav from '../components/FeatureNav';

/**
 * PHICOR MEDIQ - Clinical Pharmacology Intelligence
 * Landing Page
 * 
 * "Every Medicine. Every Patient. One Intelligence."
 */

// Feature modules for MEDIQ
const modules = [
  {
    id: 'check',
    icon: Camera,
    title: 'Medicine Checker',
    subtitle: 'For Patients & Public',
    description: 'Upload prescriptions, medicine photos, or enter medications manually. Get instant interaction checks and safety insights.',
    path: '/mediq/check',
    color: 'from-cyan-500 to-teal-500',
    badge: 'Public Access',
    features: ['Multi-image upload', 'OCR extraction', 'Interaction alerts', 'Plain language explanations']
  },
  {
    id: 'clinical',
    icon: Stethoscope,
    title: 'Clinical Workspace',
    subtitle: 'For Pharmacists & Physicians',
    description: 'Complete medication reconciliation with drug-drug, drug-disease, and allergy screening across the full patient context.',
    path: '/mediq/clinical',
    color: 'from-purple-500 to-indigo-500',
    badge: 'Professional',
    features: ['Full safety screening', 'Renal/hepatic dosing', 'Lab monitoring', 'Evidence-linked alerts']
  },
  {
    id: 'prescribe',
    icon: FileCheck,
    title: 'Electronic Prescribing',
    subtitle: 'For Prescribers',
    description: 'Create verified prescriptions with real-time safety checks, dose calculations, and formulary guidance.',
    path: '/mediq/prescribe',
    color: 'from-blue-500 to-cyan-500',
    badge: 'Professional',
    features: ['Order composer', 'Dose optimization', 'Formulary checks', 'Clinical review']
  },
  {
    id: 'nursing',
    icon: ClipboardList,
    title: 'Medication Administration',
    subtitle: 'For Nurses',
    description: 'eMAR with scheduled/PRN administration, barcode verification, and clinical escalation pathways.',
    path: '/mediq/nursing',
    color: 'from-pink-500 to-rose-500',
    badge: 'Professional',
    features: ['Scheduled tasks', 'Barcode verify', 'Vital checks', 'Documentation']
  },
  {
    id: 'discharge',
    icon: FileText,
    title: 'Discharge Reconciliation',
    subtitle: 'For Care Transitions',
    description: 'Compare admission, inpatient, and discharge medications. Generate patient-friendly instructions.',
    path: '/mediq/discharge',
    color: 'from-amber-500 to-orange-500',
    badge: 'Professional',
    features: ['Med comparison', 'Change reasons', 'Supply checks', 'Follow-up plans']
  },
  {
    id: 'developers',
    icon: Code,
    title: 'API & SDK',
    subtitle: 'For EMR/HIS Vendors',
    description: 'REST and FHIR-compatible APIs with tenant isolation, RBAC, audit logs, and comprehensive documentation.',
    path: '/mediq/developers',
    color: 'from-slate-500 to-zinc-600',
    badge: 'Integration',
    features: ['REST API', 'FHIR R4', 'Webhooks', 'SDK libraries']
  }
];

// Intelligence layers
const intelligenceLayers = [
  {
    icon: Pill,
    title: 'Clinical Pharmacist Intelligence',
    items: ['Drug-drug interactions', 'Drug-disease contraindications', 'Allergy cross-reactivity', 'Therapeutic duplication', 'Dose range checks', 'Renal/hepatic adjustments']
  },
  {
    icon: Stethoscope,
    title: 'Physician Intelligence',
    items: ['Diagnosis-medication mapping', 'Comorbidity assessment', 'Frailty & age considerations', 'Pregnancy/lactation safety', 'Treatment response tracking', 'Specialist referral triggers']
  },
  {
    icon: Brain,
    title: 'AI Orchestration',
    items: ['Prescription OCR extraction', 'Brand name normalization', 'Multi-language support', 'Confidence scoring', 'Finding summarization', 'Evidence citation']
  }
];

// Safety features
const safetyFeatures = [
  { icon: AlertTriangle, label: 'Severity-graded alerts', description: 'Critical, high, moderate classification' },
  { icon: Lock, label: 'Hard-stop governance', description: 'Contraindications require override justification' },
  { icon: CheckCircle, label: 'Evidence-linked', description: 'Every alert cites clinical sources' },
  { icon: Clock, label: 'Real-time screening', description: 'Instant safety assessment' },
  { icon: FileCheck, label: 'Audit trail', description: 'Immutable decision logging' },
  { icon: UserCheck, label: 'Clinician approval', description: 'All changes require authorization' }
];

// Coverage regions
const regions = [
  { 
    flag: '🇬🇧', 
    name: 'United Kingdom', 
    databases: ['NHS dm+d', 'BNF', 'MHRA', 'NICE guidelines'],
    description: 'Full UK formulary with NHS integration ready'
  },
  { 
    flag: '🇮🇳', 
    name: 'India', 
    databases: ['CDSCO', 'NPPA', 'Indian Pharmacopoeia', 'Regional brands'],
    description: 'Comprehensive coverage including FDCs and regional variations'
  }
];

const MediqLandingPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', organization: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const intelligenceRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const intelligenceInView = useInView(intelligenceRef, { once: true, margin: "-100px" });

  const handleEnquiry = async (e) => {
    e.preventDefault();
    // TODO: Submit to backend
    console.log('Enquiry submitted:', enquiryForm);
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  return (
    <>
      <Helmet>
        <title>PHICOR MEDIQ - Clinical Pharmacology Intelligence</title>
        <meta name="description" content="Every Medicine. Every Patient. One Intelligence. Advanced medication safety, interaction checking, and clinical decision support." />
      </Helmet>
      
      <FeatureNav showTitle={true} />
      
      <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
        
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className="relative overflow-hidden pt-8 pb-20 lg:pt-16 lg:pb-32"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-cyan-500/20 to-transparent blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              {/* Product badge */}
              <Badge className="mb-6 px-4 py-1.5 text-sm bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Introducing PHICOR MEDIQ
              </Badge>
              
              {/* Main headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Every Medicine.{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  Every Patient.
                </span>
                <br />
                One Intelligence.
              </h1>
              
              {/* Subtitle */}
              <p className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Clinical Pharmacology Intelligence that combines the expertise of pharmacists, 
                physicians, and AI to deliver safer prescribing across every healthcare setting.
              </p>
              
              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button 
                  size="lg"
                  onClick={() => navigate('/mediq/check')}
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-6 text-lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Try Medicine Checker
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/mediq/clinical')}
                  className="w-full sm:w-auto px-8 py-6 text-lg border-cyan-500/50 hover:bg-cyan-500/10"
                >
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Professional Demo
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-500" />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Evidence-based rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-500" />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>UK & India coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-500" />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>GDPR compliant</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Demo Banner - Patient Checker Highlight */}
        <section className={`py-8 ${isDark ? 'bg-cyan-950/30' : 'bg-cyan-50'} border-y ${isDark ? 'border-cyan-900/50' : 'border-cyan-200'}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Free Medicine Checker for Patients</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload your prescription or medicine photos. Get instant interaction checks.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/mediq/check')}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
              >
                Check Your Medicines
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </section>

        {/* Modules Grid */}
        <section ref={featuresRef} className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Complete Medication Intelligence Platform
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                From patient self-checks to hospital prescribing workflows, MEDIQ covers every step of the medication journey.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module, idx) => {
                const Icon = module.icon;
                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    onClick={() => navigate(module.path)}
                    className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                      isDark 
                        ? 'bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-cyan-500/50' 
                        : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-cyan-500/50 shadow-sm hover:shadow-lg'
                    }`}
                  >
                    {/* Badge */}
                    <Badge 
                      className={`absolute top-4 right-4 text-xs ${
                        module.badge === 'Public Access' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : module.badge === 'Integration'
                          ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      {module.badge}
                    </Badge>

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold mb-1">{module.title}</h3>
                    <p className={`text-sm mb-3 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{module.subtitle}</p>
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{module.description}</p>

                    {/* Features list */}
                    <div className="flex flex-wrap gap-2">
                      {module.features.map((feature, i) => (
                        <span 
                          key={i}
                          className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Arrow indicator */}
                    <div className={`absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <ArrowRight className="w-5 h-5 text-cyan-500" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Intelligence Layers */}
        <section 
          ref={intelligenceRef}
          className={`py-20 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={intelligenceInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Three Layers of Intelligence
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                MEDIQ combines clinical pharmacist expertise, physician reasoning, and AI orchestration — 
                augmenting human decision-making, never replacing it.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {intelligenceLayers.map((layer, idx) => {
                const Icon = layer.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={intelligenceInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className={`p-6 rounded-2xl ${
                      isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold">{layer.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {layer.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Safety First Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-red-500/20 text-red-400 border-red-500/30">
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                Safety First
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Clinical Safety by Design
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Every feature is built around patient safety, evidence-based rules, and clinician oversight.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {safetyFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl text-center ${
                      isDark ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-3 ${idx === 0 ? 'text-red-500' : 'text-cyan-500'}`} />
                    <h4 className="font-semibold text-sm mb-1">{feature.label}</h4>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Regional Coverage */}
        <section className={`py-20 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <Globe className="w-8 h-8 inline mr-3 text-cyan-500" />
                UK & India Coverage
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Comprehensive medication databases tailored for each region's formularies, brands, and regulations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {regions.map((region, idx) => (
                <div 
                  key={idx}
                  className={`p-6 rounded-2xl ${
                    isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">{region.flag}</span>
                    <div>
                      <h3 className="text-xl font-bold">{region.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{region.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {region.databases.map((db, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        <Database className="w-3 h-3 mr-1" />
                        {db}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer Banner */}
        <section className={`py-6 ${isDark ? 'bg-amber-950/30 border-y border-amber-900/50' : 'bg-amber-50 border-y border-amber-200'}`}>
          <div className="container mx-auto px-4">
            <div className="flex items-start gap-4 max-w-4xl mx-auto">
              <CircleAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  <strong>Important:</strong> MEDIQ is provided for educational and demonstration purposes. 
                  Clinical decision support features are not validated for live patient care until required 
                  content licences, clinical validation, security controls, and regulatory assessments are completed. 
                  Always consult a qualified healthcare professional for medical decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact/Enquiry Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Get in Touch
                </h2>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Interested in MEDIQ for your organization? Request a demo or partnership enquiry.
                </p>
              </div>

              <form 
                onSubmit={handleEnquiry}
                className={`p-8 rounded-2xl ${
                  isDark ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Name</label>
                    <Input 
                      placeholder="Your name"
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm({...enquiryForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <Input 
                      type="email"
                      placeholder="your@email.com"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({...enquiryForm, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1.5 block">Organization</label>
                  <Input 
                    placeholder="Hospital, pharmacy, or company name"
                    value={enquiryForm.organization}
                    onChange={(e) => setEnquiryForm({...enquiryForm, organization: e.target.value})}
                  />
                </div>
                <div className="mb-6">
                  <label className="text-sm font-medium mb-1.5 block">Message</label>
                  <Textarea 
                    placeholder="Tell us about your needs..."
                    rows={4}
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({...enquiryForm, message: e.target.value})}
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                  disabled={formSubmitted}
                >
                  {formSubmitted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Enquiry Sent!
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Enquiry
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className={`py-16 ${isDark ? 'bg-gradient-to-r from-cyan-950 to-teal-950' : 'bg-gradient-to-r from-cyan-500 to-teal-500'}`}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Experience Smarter Medication Intelligence?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Start with our free patient medicine checker or explore the full professional platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => navigate('/mediq/check')}
                className="bg-white text-cyan-600 hover:bg-gray-100"
              >
                <Camera className="w-5 h-5 mr-2" />
                Try Free Checker
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/mediq/developers')}
                className="border-white/50 text-white hover:bg-white/10"
              >
                <Code className="w-5 h-5 mr-2" />
                View API Docs
              </Button>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default MediqLandingPage;
