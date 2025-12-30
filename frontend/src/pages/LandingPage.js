import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Brain, 
  FlaskConical, 
  Heart, 
  Microscope, 
  Pill,
  ArrowRight,
  Play,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Equation-Based Modeling",
      description: "Every physiological process represented with research-grade ODEs and PDEs"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Multi-Organ Systems",
      description: "Cardiovascular, respiratory, renal, hepatic, and metabolic models integrated"
    },
    {
      icon: <Pill className="w-6 h-6" />,
      title: "Drug Interactions",
      description: "Multi-factorial PK/PD modeling with mechanism-based attribution"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Insights",
      description: "Intelligent explanations linking results to scientific evidence"
    },
    {
      icon: <Microscope className="w-6 h-6" />,
      title: "Evidence-Linked",
      description: "Every equation and parameter traced to peer-reviewed sources"
    },
    {
      icon: <FlaskConical className="w-6 h-6" />,
      title: "Counterfactual Reasoning",
      description: "Compare scenarios and explore 'what-if' questions mathematically"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay absolute inset-0 pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8">
              <span className="text-2xl font-serif text-primary">Φ</span>
              <span className="text-sm text-muted-foreground">PhiCore.ai — Digital Physiology Platform</span>
            </div>

            {/* Main heading */}
            <h1 className="font-manrope text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-foreground">The </span>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                PhiCore
              </span>
              <br />
              <span className="text-foreground text-4xl sm:text-5xl lg:text-6xl">
                Mathematical Human
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light">
              A mathematical operating system for the human body. Simulate diseases, drugs, and treatments with full equation transparency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                data-testid="get-started-btn"
                onClick={() => navigate('/auth')}
                className="px-8 py-6 text-lg glow-primary hover:scale-105 transition-transform"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                data-testid="watch-demo-btn"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-6 text-lg border-white/20 hover:bg-white/5"
              >
                <Play className="mr-2 w-5 h-5" />
                Explore Demo
              </Button>
            </div>
          </motion.div>

          {/* Equations preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 glass-panel rounded-2xl p-8 max-w-3xl mx-auto"
          >
            <div className="font-mono text-sm sm:text-base text-muted-foreground space-y-3 text-left">
              <div className="flex items-center gap-3">
                <span className="text-primary">▸</span>
                <code>dP/dt = (Q - P/R) / C</code>
                <span className="text-xs text-muted-foreground/60 ml-auto">Windkessel Model</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-secondary">▸</span>
                <code>SV = SV_max × (1 - e^(-k × EDV))</code>
                <span className="text-xs text-muted-foreground/60 ml-auto">Frank-Starling</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-accent">▸</span>
                <code>dG/dt = -p₁(G - Gᵦ) - X·G + Rₐ</code>
                <span className="text-xs text-muted-foreground/60 ml-auto">Bergman Model</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-manrope text-3xl sm:text-4xl font-bold mb-4">
              Built for Precision Medicine
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every physiological process mathematically formalized, every drug interaction mechanistically modeled.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel rounded-xl p-6 hover:border-white/20 transition-colors"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-manrope font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Systems Overview */}
      <section className="relative py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="font-manrope text-3xl sm:text-4xl font-bold mb-6">
                Integrated Physiological Systems
              </h2>
              <div className="space-y-4">
                {[
                  { name: "Cardiovascular", equations: "Frank-Starling, Windkessel, Baroreceptor" },
                  { name: "Respiratory", equations: "Gas Exchange, V/Q Matching" },
                  { name: "Renal", equations: "GFR Autoregulation, Tubular Reabsorption" },
                  { name: "Metabolic", equations: "Bergman Glucose-Insulin, HOMA-IR" },
                  { name: "Hepatic", equations: "First-Pass Metabolism, CYP450 Kinetics" }
                ].map((system, i) => (
                  <div key={system.name} className="flex items-start gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <h4 className="font-semibold">{system.name}</h4>
                      <p className="text-sm text-muted-foreground">{system.equations}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Body outline visualization placeholder */}
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 glass-panel rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 200 400" className="w-full h-full p-8 opacity-60">
                  {/* Simplified human outline */}
                  <ellipse cx="100" cy="40" rx="30" ry="35" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
                  <line x1="100" y1="75" x2="100" y2="200" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
                  <line x1="100" y1="100" x2="50" y2="170" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
                  <line x1="100" y1="100" x2="150" y2="170" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
                  <line x1="100" y1="200" x2="70" y2="350" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
                  <line x1="100" y1="200" x2="130" y2="350" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
                  
                  {/* Organ highlights */}
                  <circle cx="100" cy="130" r="15" fill="hsl(var(--secondary))" opacity="0.4" className="animate-pulse" />
                  <circle cx="85" cy="160" r="12" fill="hsl(var(--primary))" opacity="0.4" />
                  <circle cx="115" cy="160" r="10" fill="hsl(var(--accent))" opacity="0.4" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-manrope text-3xl sm:text-4xl font-bold mb-4">
              Ready to Explore?
            </h2>
            <p className="text-muted-foreground mb-8">
              Start simulating physiological systems with mathematical precision.
            </p>
            <Button
              data-testid="cta-get-started-btn"
              onClick={() => navigate('/auth')}
              className="px-8 py-6 text-lg glow-primary"
            >
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Φ</span>
            <span className="font-manrope font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">PhiCore.ai</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Digital Physiology Platform — The Mathematical Human
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
