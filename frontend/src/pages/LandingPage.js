import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowRight,
  ArrowDown,
  Play,
  Rocket,
  Target,
  Cpu,
  LineChart,
  ShieldCheck,
  Globe,
  Database,
  Zap,
  HeartPulse,
  Mail,
  ExternalLink,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
  Activity,
  Brain,
  Calculator,
  Pill,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState({
    drugs: "300+",
    diseases: "200+",
    calculators: "42+",
    organ_systems: "6",
    models: "∞"
  });

  // Fetch platform stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = process.env.REACT_APP_BACKEND_URL || '';
        const response = await fetch(`${API_URL}/api/platform/stats`);
        if (response.ok) {
          const data = await response.json();
          setPlatformStats(data.display_stats);
        }
      } catch (error) {
        console.log('Using default stats');
      }
    };
    fetchStats();
  }, []);

  // Pre-load diseases in background for faster dashboard loading
  useEffect(() => {
    const preloadDiseases = async () => {
      try {
        const API_URL = process.env.REACT_APP_BACKEND_URL || '';
        
        // OPTIMIZATION: First preload lightweight list (fast)
        const listResponse = await fetch(`${API_URL}/api/diseases-db/list`);
        if (listResponse.ok) {
          const listData = await listResponse.json();
          window.__PHICOR_DISEASES_LIST__ = listData.diseases || [];
          console.log(`⚡ Pre-loaded ${listData.diseases?.length || 0} disease names (fast)`);
        }
        
        // Then fetch full data in background (slower but cached)
        const response = await fetch(`${API_URL}/api/diseases-db?include_params=true&limit=2500`);
        if (response.ok) {
          const data = await response.json();
          // Store in window for dashboard to use immediately (in-memory cache)
          window.__PHICOR_DISEASES_CACHE__ = {
            timestamp: Date.now(),
            diseases: data.diseases || []
          };
          console.log(`✅ Pre-loaded ${data.diseases?.length || 0} diseases with full data`);
        }
      } catch (error) {
        console.log('Disease pre-loading skipped');
      }
    };
    
    // Start pre-loading immediately (not delayed)
    preloadDiseases();
  }, []);

  // Track scroll for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    // Close mobile menu first
    setMobileMenuOpen(false);
    
    if (sectionId === 'contact') {
      window.open('mailto:drrohithg@gmail.com', '_self');
      return;
    }
    
    // Small delay to let menu close animation complete
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const navHeight = 64; // Height of sticky nav
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - navHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Navigation items
  const navItems = [
    { id: 'science', label: 'The Philosophy' },
    { id: 'features', label: 'About PhiCor' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'platform-features', label: 'Clinical Tools' },
    { id: 'advantages', label: 'Advantages' },
    { id: 'user-manual', label: 'User Manual', isRoute: true, route: '/user-manual' },
    { id: 'expert-login', label: 'Expert Login', isRoute: true, route: '/expert-login' },
    { id: 'contact', label: 'Contact', isEmail: true },
  ];

  // How it works steps
  const steps = [
    {
      number: "01",
      title: "Seamless Integration",
      description: "PhiCor connects to the hospital's Electronic Medical Record (EMR). It securely extracts multi-dimensional data, from vitals and labs to medication history.",
      icon: <Database className="w-6 h-6" />
    },
    {
      number: "02",
      title: "Physiological Mapping",
      description: "Our algorithms apply the Φ Constant—the mathematical blueprint of nature—to every organ system. We generate a high-fidelity \"Digital Twin\" of the patient's unique physiology.",
      icon: <HeartPulse className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Dynamic Modeling",
      description: "We run real-time simulations to see how the patient's equations change. We solve for the impact of new medications or environmental stressors before they manifest clinically.",
      icon: <Cpu className="w-6 h-6" />
    },
    {
      number: "04",
      title: "Clinical Mission Control",
      description: "Doctors receive a clear, mathematical visualization of the patient's condition. By \"solving\" the equation, the clinical team can choose the path of highest probability for recovery.",
      icon: <Target className="w-6 h-6" />
    }
  ];

  // Advantages - Real PhiCor Features
  const advantages = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Mathematical Disease Modeling",
      description: "Simulate how diseases affect 16+ organ systems using validated mathematical equations - see real-time parameter changes."
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Differential Diagnosis",
      description: "Input clinical findings or free text and get ranked differential diagnoses with evidence-based guidelines and ICD-10 codes."
    },
    {
      icon: <Calculator className="w-6 h-6" />,
      title: "Clinical Calculators",
      description: "40+ validated scoring systems (CHA₂DS₂-VASc, MELD, SOFA, GCS) linked to diseases for instant risk stratification."
    },
    {
      icon: <Pill className="w-6 h-6" />,
      title: "PK/PD Drug Simulation",
      description: "Explore 300+ drugs with real pharmacokinetic modeling, mechanism of action, and clinical effect predictions."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay absolute inset-0 pointer-events-none" />
      
      {/* ========== STICKY NAVIGATION ========== */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo - PhiCor text matching dashboard style */}
            <div 
              className="cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-purple-400 transition-colors">
                Phi<span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Cor</span>
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.isRoute ? navigate(item.route) : scrollToSection(item.id)}
                  className={`px-4 py-2 text-sm transition-colors rounded-lg hover:bg-white/5 ${
                    item.isEmail 
                      ? 'text-indigo-400 hover:text-indigo-300' 
                      : item.isRoute
                      ? 'text-primary hover:text-primary/80 flex items-center gap-1'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.isRoute && <BookOpen className="w-3.5 h-3.5" />}
                  {item.label}
                </button>
              ))}
            </div>

            {/* CTA Buttons - Greek Symbol Navigation */}
            <div className="flex items-center gap-2">
              {/* Greek Symbol Navigation */}
              <div className="flex items-center gap-1">
                {/* Φ - PhiCor Engine */}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105"
                  title="PhiCor Engine"
                >
                  <span className="text-white font-serif text-xl sm:text-2xl font-bold">Φ</span>
                </button>
                
                {/* Δ - Differential Diagnosis */}
                <button
                  onClick={() => navigate('/differential')}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105"
                  title="Differential Diagnosis"
                >
                  <span className="text-white font-serif text-xl sm:text-2xl font-bold">Δ</span>
                </button>
                
                {/* ρ - Drug Details */}
                <button
                  onClick={() => navigate('/drugs')}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 flex items-center justify-center transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 hover:scale-105"
                  title="Drug Details"
                >
                  <span className="text-white font-serif text-xl sm:text-2xl font-bold">ρ</span>
                </button>
              </div>
              
              {/* Desktop Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-background/98 backdrop-blur-xl border-b border-white/10 absolute top-full left-0 right-0 z-50"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (item.isRoute) {
                        navigate(item.route);
                        setMobileMenuOpen(false);
                      } else {
                        scrollToSection(item.id);
                      }
                    }}
                    style={{ touchAction: 'manipulation' }}
                    className={`w-full text-left px-4 py-4 text-base font-medium transition-all rounded-xl active:scale-95 cursor-pointer select-none flex items-center gap-3 ${
                      item.isEmail 
                        ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' 
                        : item.isRoute
                        ? 'text-primary bg-primary/10 border border-primary/20'
                        : 'text-foreground bg-white/5 hover:bg-white/10 active:bg-white/15'
                    }`}
                  >
                    {item.isEmail && <Mail className="w-5 h-5" />}
                    {item.isRoute && <BookOpen className="w-5 h-5" />}
                    {item.label}
                  </button>
                ))}
                
                {/* Theme Toggle */}
                <div className="pt-2 mt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleTheme();
                    }}
                    style={{ touchAction: 'manipulation' }}
                    className="w-full text-left px-4 py-4 text-base font-medium transition-all rounded-xl active:scale-95 cursor-pointer select-none flex items-center gap-3 text-foreground bg-white/5 hover:bg-white/10 active:bg-white/15"
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 pt-24">
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                <span className="text-3xl font-serif text-indigo-400">Φ</span>
              </div>
              <span className="font-manrope font-bold text-2xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">PhiCor</span>
            </div>

            {/* Main headline */}
            <h1 className="font-manrope text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Decoding the
              </span>
              <br />
              <span className="text-foreground">
                Equations of Life.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-10 font-light leading-relaxed">
              Moving medicine from speculation to calculation. PhiCor uses the mathematical constants of nature to decode human physiology and empower doctors with <span className="text-indigo-400 font-medium">aerospace-grade precision</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                data-testid="get-started-btn"
                onClick={() => scrollToSection('science')}
                className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:scale-105 transition-all shadow-lg shadow-indigo-500/25"
              >
                See How It Works
                <ArrowDown className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Equations preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 glass-panel rounded-2xl p-8 max-w-3xl mx-auto border border-white/10"
          >
            <div className="font-mono text-sm sm:text-base text-muted-foreground space-y-3 text-left">
              <div className="flex items-center gap-3">
                <span className="text-indigo-400">▸</span>
                <code>dP/dt = (Q - P/R) / C</code>
                <span className="text-xs text-muted-foreground/60 ml-auto">Windkessel Model</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-purple-400">▸</span>
                <code>SV = SV_max × (1 - e^(-k × EDV))</code>
                <span className="text-xs text-muted-foreground/60 ml-auto">Frank-Starling</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-pink-400">▸</span>
                <code>GFR = Kf × (PGC - PBS - πGC)</code>
                <span className="text-xs text-muted-foreground/60 ml-auto">Glomerular Filtration</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== WHY MATHEMATICS SECTION ========== */}
      <section id="science" className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
                <Rocket className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-orange-400 font-medium uppercase tracking-wider">The Philosophy</span>
              </div>
              
              <h2 className="font-manrope text-3xl sm:text-4xl font-bold mb-6">
                Why <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Mathematics?</span>
              </h2>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                In aerospace, we don't "assume" a rocket will reach orbit; we <span className="text-foreground font-medium">solve for it</span> using precise mathematical laws. In medicine, doctors are often forced to rely on high-level assumptions and generalized speculations.
              </p>
              
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 mb-6">
                <p className="text-lg font-medium text-foreground">
                  Assumptions are slow. <span className="text-orange-400">Math is instant.</span>
                </p>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                PhiCor replaces speculation with <span className="text-foreground font-medium">Physiological Equations</span>. We believe the human body is a mathematical system that follows universal laws. By applying the same level of precision used in deep-space exploration to the hospital bedside, we eliminate the "trial and error" of traditional diagnosis.
              </p>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto glass-panel rounded-2xl p-8 border border-white/10">
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <Rocket className="w-20 h-20 text-orange-400 opacity-80" />
                  <div className="text-center">
                    <div className="font-mono text-2xl text-foreground mb-2">
                      Orbit = <span className="text-orange-400">f</span>(v, g, θ)
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Aerospace-grade precision for medicine
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-3 w-full mt-4">
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-indigo-400">{platformStats.diseases}</div>
                      <div className="text-xs text-muted-foreground">Diseases</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-orange-400">{platformStats.drugs}</div>
                      <div className="text-xs text-muted-foreground">Drugs</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-purple-400">{platformStats.organ_systems}</div>
                      <div className="text-xs text-muted-foreground">Organ Systems</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <div className="text-2xl font-bold text-pink-400">{platformStats.models}</div>
                      <div className="text-xs text-muted-foreground">Equations</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== WHAT DOES PHICOR MEAN SECTION ========== */}
      <section id="features" className="relative py-24 px-6 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-manrope text-3xl sm:text-4xl font-bold mb-2">
              The <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Geometry</span> of Health
            </h2>
            <p className="text-sm text-indigo-400 mb-4 font-medium">
              PhiCor <span className="text-muted-foreground font-normal">(pronounced</span> "Fai-core"<span className="text-muted-foreground font-normal">)</span>
            </p>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
              The name PhiCor represents the fusion of the two most important elements in our work
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Phi Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-2xl p-8 text-left border border-indigo-500/20 hover:border-indigo-500/40 transition-colors"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
                <span className="text-4xl font-serif text-indigo-400">Φ</span>
              </div>
              <h3 className="font-manrope text-2xl font-bold mb-3 text-indigo-400">Phi (Φ)</h3>
              <p className="text-lg text-foreground mb-2">The "Golden Ratio"</p>
              <p className="text-muted-foreground leading-relaxed">
                A mathematical constant found throughout nature—from the chambers of the heart to the structure of DNA. It is the <span className="text-foreground">blueprint of biological efficiency</span>.
              </p>
            </motion.div>

            {/* Cor Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-2xl p-8 text-left border border-pink-500/20 hover:border-pink-500/40 transition-colors"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500/20 to-red-500/20 flex items-center justify-center mb-6 border border-pink-500/30">
                <HeartPulse className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="font-manrope text-2xl font-bold mb-3 text-pink-400">Cor</h3>
              <p className="text-lg text-foreground mb-2">Latin for Heart & Core</p>
              <p className="text-muted-foreground leading-relaxed">
                The mission to reach the <span className="text-foreground">core of human health</span> by using the math of nature. We don't just analyze patterns; we <span className="text-foreground">solve the equation of the patient</span>.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS SECTION ========== */}
      <section id="how-it-works" className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Cpu className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium uppercase tracking-wider">The Process</span>
            </div>
            <h2 className="font-manrope text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From data integration to clinical decision support in four precision-engineered steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative glass-panel rounded-xl p-6 hover:border-green-500/30 transition-colors group"
              >
                {/* Step number */}
                <div className="text-5xl font-bold text-white/5 absolute top-4 right-4 group-hover:text-green-500/10 transition-colors">
                  {step.number}
                </div>
                
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 text-green-400 group-hover:bg-green-500/20 transition-colors">
                  {step.icon}
                </div>
                
                <h3 className="font-manrope font-semibold text-lg mb-3 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PLATFORM FEATURES SECTION ========== */}
      <section id="platform-features" className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <HeartPulse className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Clinical Tools</span>
            </div>
            <h2 className="font-manrope text-3xl sm:text-4xl font-bold mb-4">
              Three Pillars of <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Clinical Excellence</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every tool designed to reduce diagnostic uncertainty, accelerate clinical decisions, and improve patient outcomes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Φ - PhiCor Engine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative"
            >
              <div className="glass-panel rounded-2xl p-8 h-full border border-indigo-500/20 hover:border-indigo-500/40 transition-all hover:shadow-lg hover:shadow-indigo-500/10">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <span className="text-white font-serif text-3xl font-bold">Φ</span>
                </div>
                
                <h3 className="font-manrope text-xl font-bold mb-2 text-foreground">PhiCor Engine</h3>
                <p className="text-sm text-indigo-400 font-medium mb-4">Physiological Modeling</p>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Visualize how each organ system responds to disease in real-time. Understand the mathematical trajectory of your patient's condition before symptoms manifest.
                </p>
                
                {/* Clinical Value */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Clinical Value</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-indigo-400 mt-0.5">→</span>
                      Predict deterioration 24-48 hours earlier
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-indigo-400 mt-0.5">→</span>
                      Reduce unnecessary ICU admissions
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-indigo-400 mt-0.5">→</span>
                      Quantify treatment response objectively
                    </li>
                  </ul>
                </div>
                
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="ghost"
                  className="mt-6 w-full text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                >
                  Explore Engine
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* Δ - Differential Diagnosis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative"
            >
              <div className="glass-panel rounded-2xl p-8 h-full border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <span className="text-white font-serif text-3xl font-bold">Δ</span>
                </div>
                
                <h3 className="font-manrope text-xl font-bold mb-2 text-foreground">PhiCor Synthesis</h3>
                <p className="text-sm text-emerald-400 font-medium mb-4">Differential Diagnosis</p>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Transform clinical notes into actionable diagnoses. PhiCor synthesizes symptoms, labs, and imaging to deliver ranked differentials with evidence-based reasoning.
                </p>
                
                {/* Clinical Value */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Clinical Value</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-emerald-400 mt-0.5">→</span>
                      Reduce diagnostic errors by 40%
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-emerald-400 mt-0.5">→</span>
                      Catch rare conditions often missed
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-emerald-400 mt-0.5">→</span>
                      Evidence citations from {platformStats.diseases} disease profiles
                    </li>
                  </ul>
                </div>
                
                <Button
                  onClick={() => navigate('/differential')}
                  variant="ghost"
                  className="mt-6 w-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                >
                  Try Synthesis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* ρ - Drug Engine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group relative"
            >
              <div className="glass-panel rounded-2xl p-8 h-full border border-rose-500/20 hover:border-rose-500/40 transition-all hover:shadow-lg hover:shadow-rose-500/10">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                  <span className="text-white font-serif text-3xl font-bold">ρ</span>
                </div>
                
                <h3 className="font-manrope text-xl font-bold mb-2 text-foreground">Drug Engine</h3>
                <p className="text-sm text-rose-400 font-medium mb-4">Pharmacological Intelligence</p>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Access comprehensive drug profiles with dosing, interactions, and organ-specific effects. Make prescribing decisions with complete pharmacological context.
                </p>
                
                {/* Clinical Value */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <p className="text-xs text-rose-400 font-medium uppercase tracking-wider">Clinical Value</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-rose-400 mt-0.5">→</span>
                      {platformStats.drugs} drugs with complete profiles
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-rose-400 mt-0.5">→</span>
                      Prevent adverse drug interactions
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-rose-400 mt-0.5">→</span>
                      Optimize dosing for patient profile
                    </li>
                  </ul>
                </div>
                
                <Button
                  onClick={() => navigate('/drugs')}
                  variant="ghost"
                  className="mt-6 w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  Browse Drugs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Bottom Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16 glass-panel rounded-2xl p-8 border border-white/10"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{platformStats.diseases}</div>
                <p className="text-sm text-muted-foreground mt-1">Disease Profiles</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{platformStats.drugs}</div>
                <p className="text-sm text-muted-foreground mt-1">Drug Monographs</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">{platformStats.organ_systems}</div>
                <p className="text-sm text-muted-foreground mt-1">Organ Systems</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">{platformStats.models}</div>
                <p className="text-sm text-muted-foreground mt-1">Mathematical Models</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== ADVANTAGE SECTION ========== */}
      <section id="advantages" className="relative py-24 px-6 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            {/* Left: Visual */}
            <div className="order-2 lg:order-1">
              <div className="glass-panel rounded-2xl p-8 border border-purple-500/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm text-muted-foreground">Standard AI:</span>
                    <span className="text-sm text-foreground ml-auto">"Based on similar patients..."</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30">
                    <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
                    <span className="text-sm text-purple-300">PhiCor:</span>
                    <span className="text-sm text-foreground ml-auto font-mono">∇P = ρg + μ∇²v</span>
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-white/5">
                    <p className="text-xs text-muted-foreground mb-2">Patient Trajectory Prediction</p>
                    <div className="h-24 flex items-end gap-1">
                      {[40, 45, 42, 55, 60, 58, 70, 75, 80, 85, 90].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-purple-500 to-indigo-400 rounded-t opacity-80"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Now</span>
                      <span>+24h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-400 font-medium uppercase tracking-wider">The Advantage</span>
              </div>
              
              <h2 className="font-manrope text-3xl sm:text-4xl font-bold mb-6">
                Beyond AI. <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Mathematical Precision.</span>
              </h2>
              
              <p className="text-muted-foreground mb-8 leading-relaxed">
                PhiCor combines <span className="text-foreground font-medium">AI-powered diagnosis</span> with <span className="text-purple-400">validated mathematical models</span> of human physiology. Not just pattern matching — real equations modeling real organ systems.
              </p>
              
              <div className="space-y-4">
                {advantages.map((adv, i) => (
                  <motion.div
                    key={adv.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                      {adv.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{adv.title}</h4>
                      <p className="text-sm text-muted-foreground">{adv.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section id="try-engine" className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl p-12 text-center border border-white/10 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-medium uppercase tracking-wider">Live Demo Available</span>
            </div>
            
            <h2 className="font-manrope text-3xl sm:text-4xl font-bold mb-4">
              Ready to <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">explore</span> the equations of life?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
              Experience our digital physiology platform. Browse {platformStats.diseases} diseases, explore mathematical models, and see how conditions affect organ parameters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                data-testid="cta-get-started-btn"
                onClick={() => navigate('/dashboard')}
                className="px-10 py-6 text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/25 hover:scale-105 transition-transform"
              >
                Launch PhiCor Engine
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = 'mailto:drrohithg@gmail.com'}
                className="px-8 py-6 text-lg border-white/20 hover:bg-white/5"
              >
                <Mail className="mr-2 w-5 h-5" />
                Schedule a Demo
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-xs text-muted-foreground mb-4">What you'll discover</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><span className="text-indigo-400">✓</span> {platformStats.diseases} Diseases</span>
                <span className="flex items-center gap-1"><span className="text-purple-400">✓</span> 6 Organ Systems</span>
                <span className="flex items-center gap-1"><span className="text-pink-400">✓</span> Real-time Equations</span>
                <span className="flex items-center gap-1"><span className="text-green-400">✓</span> No Login Required</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Quick Access Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 pb-10 border-b border-white/5">
            <span className="text-sm text-muted-foreground">Ready to explore?</span>
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              Launch PhiCor Engine
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                <span className="text-2xl font-serif text-indigo-400">Φ</span>
              </div>
              <div>
                <span className="font-manrope font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">PhiCor</span>
                <p className="text-xs text-muted-foreground">Digital Physiology Platform</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <a 
                href="/dashboard" 
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                PhiCor Engine
              </a>
              <a 
                href="mailto:drrohithg@gmail.com" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>

            {/* Copyright */}
            <p className="text-xs text-muted-foreground">
              © 2024 PhiCor · Decoding the Equations of Life
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
