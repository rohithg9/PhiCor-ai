import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, ExternalLink, ChevronRight, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

const EvidencePanel = ({ selectedSystem, equations, simulationResults }) => {
  const getSystemEvidence = () => {
    const evidenceMap = {
      cardiovascular: [
        {
          title: 'Guyton & Hall Textbook of Medical Physiology',
          type: 'Textbook',
          chapter: 'Chapter 9: Cardiac Muscle',
          relevance: 'Frank-Starling mechanism, cardiac output regulation'
        },
        {
          title: 'Westerhof N et al. (2005)',
          type: 'Journal Article',
          source: 'Arterial Hemodynamics and Wave Mechanics',
          relevance: 'Windkessel model derivation and validation'
        },
        {
          title: 'ACC/AHA Heart Failure Guidelines',
          type: 'Clinical Guideline',
          year: '2022',
          relevance: 'Clinical interpretation of cardiac parameters'
        }
      ],
      glucose_insulin: [
        {
          title: 'Bergman RN (1981)',
          type: 'Journal Article',
          source: 'American Journal of Physiology',
          relevance: 'Minimal model of glucose-insulin dynamics'
        },
        {
          title: 'ADA Standards of Medical Care',
          type: 'Clinical Guideline',
          year: '2024',
          relevance: 'Diabetes diagnosis and management thresholds'
        },
        {
          title: 'MINMOD Software Documentation',
          type: 'Technical Reference',
          relevance: 'Model implementation and parameter estimation'
        }
      ],
      renal: [
        {
          title: 'KDOQI Clinical Practice Guidelines',
          type: 'Clinical Guideline',
          year: '2012',
          relevance: 'GFR estimation, CKD staging'
        },
        {
          title: 'Cockcroft DW, Gault MH (1976)',
          type: 'Journal Article',
          source: 'Nephron',
          relevance: 'Creatinine clearance estimation formula'
        },
        {
          title: "Brenner & Rector's The Kidney",
          type: 'Textbook',
          relevance: 'Renal autoregulation mechanisms'
        }
      ],
      pharmacokinetics: [
        {
          title: 'Rowland & Tozer: Clinical Pharmacokinetics',
          type: 'Textbook',
          relevance: 'One-compartment model, hepatic clearance'
        },
        {
          title: "Goodman & Gilman's Pharmacological Basis",
          type: 'Textbook',
          relevance: 'Drug mechanisms and therapeutic indices'
        },
        {
          title: 'FDA Drug Labels',
          type: 'Regulatory Document',
          relevance: 'Approved indications, dosing, and PK parameters'
        }
      ]
    };

    return evidenceMap[selectedSystem] || evidenceMap.cardiovascular;
  };

  const getSuggestions = () => {
    const baseSuggestions = [
      {
        title: 'Compare baseline vs intervention',
        description: 'Run a side-by-side comparison of current state against a drug intervention',
        action: 'compare_scenarios'
      },
      {
        title: 'Export simulation data',
        description: 'Download current physiological state and simulation results',
        action: 'export_data'
      }
    ];

    const systemSuggestions = {
      cardiovascular: [
        {
          title: 'Simulate volume loading',
          description: 'Increase preload to observe Frank-Starling response',
          action: 'simulate_volume'
        },
        {
          title: 'Model heart failure',
          description: 'Reduce contractility to simulate systolic dysfunction',
          action: 'simulate_hf'
        }
      ],
      glucose_insulin: [
        {
          title: 'Simulate meal response',
          description: 'Model glucose dynamics after carbohydrate intake',
          action: 'simulate_meal'
        },
        {
          title: 'Test insulin sensitivity',
          description: 'Modify p3 parameter to explore insulin resistance',
          action: 'test_sensitivity'
        }
      ],
      renal: [
        {
          title: 'Model AKI progression',
          description: 'Simulate acute kidney injury with declining GFR',
          action: 'simulate_aki'
        },
        {
          title: 'Test drug clearance',
          description: 'Evaluate renal-dependent drug elimination',
          action: 'test_clearance'
        }
      ]
    };

    return [...(systemSuggestions[selectedSystem] || []), ...baseSuggestions];
  };

  const evidence = getSystemEvidence();
  const suggestions = getSuggestions();

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="evidence" className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="evidence" className="flex items-center gap-2" data-testid="evidence-tab">
            <BookOpen className="w-4 h-4" />
            Evidence
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2" data-testid="suggestions-tab">
            <Lightbulb className="w-4 h-4" />
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evidence" className="flex-1 mt-0">
          <ScrollArea className="h-[200px]">
            <div className="space-y-3 pr-4">
              {evidence.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                  data-testid={`evidence-item-${i}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded bg-white/5">{item.type}</span>
                        {item.year && <span>{item.year}</span>}
                        {item.source && <span>{item.source}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{item.relevance}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="suggestions" className="flex-1 mt-0">
          <ScrollArea className="h-[200px]">
            <div className="space-y-3 pr-4">
              {suggestions.map((suggestion, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-lg border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group"
                  data-testid={`suggestion-item-${i}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                          {suggestion.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Drug-specific evidence */}
      {simulationResults?.attributions && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Simulation Evidence
          </h4>
          <div className="space-y-2">
            {simulationResults.attributions.slice(0, 2).map((attr, i) => (
              <div key={i} className="text-xs">
                <span className="text-muted-foreground">{attr.mechanism}: </span>
                <span className="text-primary">{attr.evidence?.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidencePanel;
