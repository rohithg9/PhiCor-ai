// ============================================================
// GASTROINTESTINAL DISEASES DATABASE
// Comprehensive GI tract disorders (esophagus to colon, biliary)
// ICD-10: K00-K95 (Diseases of the digestive system)
// ============================================================

export const GI_DISEASES = {
  // =====================
  // GERD
  // ICD-10: K21.0
  // =====================

  K21_0: {
    name: "Gastroesophageal Reflux Disease (GERD)",
    icd10: "K21.0",
    category: "gastrointestinal",
    definition: "Chronic reflux of gastric contents into esophagus causing symptoms and/or complications",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "lungs"],
    pathophysiology: {
      mechanism: "LES relaxation/hypotension → acid reflux → mucosal injury → symptoms ± Barrett's metaplasia",
      molecularBasis: "Transient LES relaxation; hiatal hernia; delayed gastric emptying; impaired esophageal clearance"
    },
    clinicalPresentation: {
      symptoms: [
        "Heartburn (retrosternal burning)",
        "Regurgitation",
        "Dysphagia",
        "Chronic cough",
        "Hoarseness",
        "Chest pain (non-cardiac)"
      ],
      signs: [
        "Dental erosions",
        "Pharyngeal erythema",
        "Laryngeal inflammation"
      ]
    },
    laboratoryFindings: [
      { name: "pH monitoring", normalRange: "pH >4 in esophagus", abnormalInDisease: "DeMeester score >14.7 (acid exposure)" }
    ],
    imagingFindings: {
      egd: ["Esophagitis (erosions)", "Barrett's esophagus", "Stricture", "Hiatal hernia"],
      barium_swallow: ["Reflux", "Hiatal hernia", "Stricture"]
    },
    severity: {
      mild: { description: "Symptoms without esophagitis" },
      moderate: { description: "Erosive esophagitis (LA Grade A-B)" },
      severe: { description: "Severe esophagitis (LA Grade C-D), Barrett's, stricture" }
    },
    modifications: {
      gi_tract: {
        physiology: {
          les_pressure: { factor: 0.5, note: "Hypotensive LES" },
          esophageal_ph: { factor: 0.6, note: "Acid exposure" }
        },
        structure: {
          esophageal_mucosa: { factor: 0.8, note: "Mucosal damage" }
        }
      }
    },
    diagnosticCriteria: {
      name: "Montreal Definition & Lyon Consensus",
      requirements: {
        clinical: "Troublesome symptoms ≥2x/week",
        endoscopic: "LA Classification for esophagitis severity",
        phMetry: "Acid exposure time >6% (abnormal), 4-6% (borderline)"
      }
    },
    differentialDiagnosis: [
      { condition: "Eosinophilic esophagitis", distinguishing: "Dysphagia predominant, eosinophils on biopsy" },
      { condition: "Cardiac chest pain", distinguishing: "Exertional, ECG changes, troponin" },
      { condition: "Achalasia", distinguishing: "Dysphagia to solids and liquids, bird-beak on barium" },
      { condition: "PUD", distinguishing: "Epigastric pain, H. pylori, ulcer on EGD" }
    ],
    treatment: {
      lifestyle: [
        { name: "Weight loss, elevate HOB, avoid triggers", indication: "All patients", evidence: "IB" }
      ],
      medical: [
        { name: "PPI", examples: "Omeprazole 20-40mg daily", indication: "First-line", evidence: "IA" },
        { name: "H2 blocker", indication: "Alternative or nocturnal add-on", evidence: "IB" }
      ],
      surgical: [
        { name: "Nissen fundoplication", indication: "PPI-refractory, large hiatal hernia", evidence: "IA" },
        { name: "LINX device", indication: "Alternative to fundoplication", evidence: "IB" }
      ]
    },
    riskStratification: {
      barrettsRisk: "10-15% of chronic GERD develop Barrett's",
      adenocarcinomaRisk: "Barrett's: 0.5% per year progression to EAC",
      surveillance: "Barrett's requires surveillance EGD every 3-5 years"
    }
  },

  // =====================
  // ACHALASIA
  // ICD-10: K22.0
  // =====================

  K22_0: {
    name: "Achalasia",
    icd10: "K22.0",
    category: "gastrointestinal",
    definition: "Esophageal motility disorder with failure of LES relaxation and aperistalsis",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract"],
    pathophysiology: {
      mechanism: "Loss of inhibitory neurons in myenteric plexus → failed LES relaxation → functional obstruction",
      molecularBasis: "Destruction of inhibitory (NO, VIP) neurons; ganglion cell loss; inflammatory infiltrate"
    },
    clinicalPresentation: {
      symptoms: [
        "Dysphagia (solids AND liquids)",
        "Regurgitation of undigested food",
        "Chest pain",
        "Weight loss",
        "Nocturnal cough",
        "Aspiration"
      ],
      signs: [
        "Weight loss",
        "Halitosis",
        "Aspiration pneumonia"
      ]
    },
    laboratoryFindings: [
      { name: "Manometry", normalRange: "Normal LES relaxation", abnormalInDisease: "Absent LES relaxation, aperistalsis" }
    ],
    imagingFindings: {
      barium_swallow: ["Bird-beak appearance", "Dilated esophagus", "Air-fluid level"],
      egd: ["Dilated esophagus", "Food retention", "Tight LES (pops open)"]
    },
    severity: {
      mild: { description: "Early, minimal dilation" },
      moderate: { description: "Dilated esophagus, symptoms" },
      severe: { description: "Sigmoid esophagus, aspiration, malnutrition" }
    },
    modifications: {
      gi_tract: {
        physiology: {
          les_pressure: { factor: 2.0, note: "Hypertensive LES" },
          esophageal_peristalsis: { factor: 0.1, note: "Aperistalsis" }
        },
        geometry: {
          esophageal_diameter: { factor: 2.0, note: "Dilated esophagus" }
        }
      }
    },
    diagnosticCriteria: {
      name: "Chicago Classification v4.0",
      requirements: {
        manometry: "Impaired EGJ relaxation (IRP >15 mmHg) + absence of peristalsis",
        types: {
          type1: "No pressurization",
          type2: "Panesophageal pressurization (best prognosis)",
          type3: "Spastic/premature contractions"
        }
      }
    },
    differentialDiagnosis: [
      { condition: "Pseudoachalasia", distinguishing: "Older age, weight loss, malignancy at GEJ" },
      { condition: "Chagas disease", distinguishing: "Endemic area, megaesophagus + megacolon" },
      { condition: "GERD", distinguishing: "Heartburn predominant, responds to PPI" },
      { condition: "Esophageal stricture", distinguishing: "Dysphagia to solids only, dilation history" }
    ],
    treatment: {
      endoscopic: [
        { name: "Pneumatic dilation", indication: "First-line in many centers", evidence: "IA" },
        { name: "POEM (Peroral Endoscopic Myotomy)", indication: "Preferred for type III", evidence: "IA" }
      ],
      surgical: [
        { name: "Heller myotomy + partial fundoplication", indication: "Gold standard surgical", evidence: "IA" }
      ],
      medical: [
        { name: "Botox injection", indication: "Poor surgical candidates", evidence: "IIB", note: "Temporary effect" }
      ]
    },
    riskStratification: {
      cancerRisk: "Squamous cell carcinoma risk 3% over 25 years",
      aspirationRisk: "Chronic aspiration → pneumonia",
      treatmentResponse: "Type II best response; Type III worst"
    }
  },

  // =====================
  // PEPTIC ULCER DISEASE
  // ICD-10: K25.9
  // =====================

  K25_9: {
    name: "Peptic Ulcer Disease (Gastric Ulcer)",
    icd10: "K25.9",
    category: "gastrointestinal",
    definition: "Mucosal defect in stomach extending through muscularis mucosae",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "blood"],
    pathophysiology: {
      mechanism: "Imbalance between aggressive (acid, pepsin) and protective (mucus, bicarbonate) factors",
      molecularBasis: "H. pylori (70%), NSAIDs (20%); prostaglandin depletion; gastric acid secretion"
    },
    clinicalPresentation: {
      symptoms: [
        "Epigastric pain (burning)",
        "Pain worse with eating (gastric)",
        "Nausea/vomiting",
        "Early satiety",
        "Weight loss",
        "GI bleeding (hematemesis, melena)"
      ],
      signs: [
        "Epigastric tenderness",
        "Melena (if bleeding)",
        "Hemodynamic instability (if hemorrhage)"
      ]
    },
    laboratoryFindings: [
      { name: "H. pylori testing", normalRange: "Negative", abnormalInDisease: "Positive (urea breath, stool antigen, biopsy)" },
      { name: "Hemoglobin", normalRange: "Normal", abnormalInDisease: "Low (if chronic bleeding)" },
      { name: "Serum gastrin", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated (if ZES suspected)" }
    ],
    imagingFindings: {
      egd: ["Ulcer crater", "Stigmata of hemorrhage (Forrest classification)", "Biopsy for H. pylori, malignancy"],
      ct: ["Perforation (free air)", "Gastric wall thickening"]
    },
    severity: {
      mild: { description: "Uncomplicated ulcer, symptoms only" },
      moderate: { description: "Anemia, recurrent ulcers" },
      severe: { description: "Hemorrhage, perforation, obstruction, malignancy" }
    },
    modifications: {
      gi_tract: {
        structure: {
          mucosal_integrity: { factor: 0.6, note: "Ulcer crater" },
          gastric_ph: { factor: 0.5, note: "Hyperacidity" }
        }
      },
      blood: {
        geometry: {
          hemoglobin: { factor: 0.75, note: "Chronic blood loss" }
        }
      }
    },
    diagnosticCriteria: {
      name: "Clinical + Endoscopic + H. pylori Testing",
      requirements: {
        clinical: "Epigastric pain, dyspepsia",
        endoscopic: "Ulcer crater, stigmata of bleeding (Forrest classification)",
        hpylori: "Test all patients: urea breath test, stool antigen, or biopsy"
      }
    },
    differentialDiagnosis: [
      { condition: "Gastric cancer", distinguishing: "Biopsy ulcer margins; weight loss, anemia" },
      { condition: "GERD", distinguishing: "Heartburn, regurgitation predominant" },
      { condition: "Functional dyspepsia", distinguishing: "Normal EGD, Rome IV criteria" },
      { condition: "Zollinger-Ellison syndrome", distinguishing: "Multiple/refractory ulcers, elevated gastrin" }
    ],
    treatment: {
      hpyloriPositive: [
        { name: "Triple therapy", components: "PPI + Clarithromycin + Amoxicillin × 14 days", evidence: "IA" },
        { name: "Bismuth quadruple", components: "PPI + Bismuth + Metronidazole + Tetracycline", indication: "First-line alternative", evidence: "IA" }
      ],
      hpyloriNegative: [
        { name: "PPI", duration: "4-8 weeks", evidence: "IA" },
        { name: "Discontinue NSAIDs", indication: "If NSAID-induced", evidence: "IA" }
      ],
      bleeding: [
        { name: "Endoscopic hemostasis", indication: "Active bleeding, visible vessel", evidence: "IA" },
        { name: "High-dose IV PPI", dose: "80mg bolus + 8mg/hr infusion × 72h", evidence: "IA" }
      ]
    },
    riskStratification: {
      bleedingRisk: "Forrest Ia/Ib: high rebleed risk; need endoscopic therapy",
      perforationRisk: "Anterior duodenal ulcers higher risk",
      malignancy: "Gastric ulcers: always biopsy to rule out cancer"
    }
  },

  // =====================
  // GASTRITIS
  // ICD-10: K29.7
  // =====================

  K29_7: {
    name: "Gastritis (Unspecified)",
    icd10: "K29.7",
    category: "gastrointestinal",
    definition: "Inflammation of gastric mucosa with various etiologies",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "blood"],
    pathophysiology: {
      mechanism: "Mucosal injury from H. pylori, autoimmune, NSAIDs, alcohol → inflammation ± atrophy/metaplasia",
      molecularBasis: "H. pylori: antral-predominant; Autoimmune: parietal cell antibodies, intrinsic factor loss"
    },
    clinicalPresentation: {
      symptoms: [
        "Epigastric pain/discomfort",
        "Nausea",
        "Bloating",
        "Early satiety",
        "Anemia symptoms (autoimmune)"
      ],
      signs: [
        "Epigastric tenderness",
        "Pallor (if B12 deficiency)"
      ]
    },
    laboratoryFindings: [
      { name: "H. pylori testing", normalRange: "Negative", abnormalInDisease: "Positive (if H. pylori gastritis)" },
      { name: "Vitamin B12", normalRange: "200-900 pg/mL", abnormalInDisease: "Low (autoimmune gastritis)" },
      { name: "Parietal cell antibodies", normalRange: "Negative", abnormalInDisease: "Positive (autoimmune)" },
      { name: "Intrinsic factor antibodies", normalRange: "Negative", abnormalInDisease: "Positive (pernicious anemia)" },
      { name: "Gastrin", normalRange: "<100 pg/mL", abnormalInDisease: "Elevated (autoimmune gastritis)" }
    ],
    imagingFindings: {
      egd: ["Erythema", "Erosions", "Atrophic mucosa", "Intestinal metaplasia"]
    },
    severity: {
      mild: { description: "Acute, superficial" },
      moderate: { description: "Chronic, active inflammation" },
      severe: { description: "Atrophic, metaplasia, increased cancer risk" }
    },
    modifications: {
      gi_tract: {
        structure: {
          mucosal_thickness: { factor: 0.8, note: "Atrophy" },
          parietal_cells: { factor: 0.5, note: "Cell loss (autoimmune)" }
        }
      },
      blood: {
        geometry: {
          hemoglobin: { factor: 0.85, note: "B12 deficiency anemia" },
          mcv: { factor: 1.2, note: "Macrocytosis" }
        }
      }
    },
    diagnosticCriteria: {
      name: "Sydney Classification + Histology",
      requirements: {
        endoscopic: "Erythema, erosions, atrophy, nodularity",
        histologic: "Inflammation type, H. pylori status, atrophy, metaplasia grading",
        autoimmune: "Corpus-predominant atrophy + anti-parietal cell/IF antibodies"
      }
    },
    differentialDiagnosis: [
      { condition: "Peptic ulcer disease", distinguishing: "Discrete ulcer crater on EGD" },
      { condition: "Functional dyspepsia", distinguishing: "Normal EGD and biopsy, Rome IV criteria" },
      { condition: "Gastric cancer", distinguishing: "Mass lesion, weight loss, biopsy diagnostic" }
    ],
    treatment: {
      hpylori: [
        { name: "Eradication therapy", indication: "All H. pylori positive", evidence: "IA" }
      ],
      autoimmune: [
        { name: "B12 supplementation", indication: "Lifelong if pernicious anemia", evidence: "IA" },
        { name: "Surveillance EGD", indication: "Every 3 years (carcinoid risk)", evidence: "IIB" }
      ],
      symptomatic: [
        { name: "PPI", indication: "Symptom relief", evidence: "IB" }
      ]
    },
    riskStratification: {
      cancerRisk: "Autoimmune gastritis: 3x gastric carcinoid risk; intestinal type adenocarcinoma risk",
      b12Deficiency: "Autoimmune: monitor B12, neurological symptoms",
      surveillance: "Autoimmune and severe atrophic: surveillance for dysplasia"
    }
  },

  // =====================
  // GASTRIC CANCER
  // ICD-10: C16.9
  // =====================

  C16_9: {
    name: "Gastric Cancer",
    icd10: "C16.9",
    category: "gastrointestinal",
    definition: "Malignant neoplasm of stomach, most commonly adenocarcinoma",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "liver", "lymphatic", "blood"],
    pathophysiology: {
      mechanism: "Multistep carcinogenesis: H. pylori → atrophy → metaplasia → dysplasia → adenocarcinoma",
      molecularBasis: "Intestinal type (Correa cascade) vs diffuse (E-cadherin loss); Lauren classification"
    },
    clinicalPresentation: {
      symptoms: [
        "Weight loss",
        "Epigastric pain",
        "Early satiety",
        "Dysphagia (cardia tumors)",
        "Nausea/vomiting",
        "GI bleeding"
      ],
      signs: [
        "Palpable epigastric mass (late)",
        "Virchow's node (left supraclavicular)",
        "Sister Mary Joseph nodule",
        "Krukenberg tumor (ovarian mets)",
        "Acanthosis nigricans (paraneoplastic)"
      ]
    },
    laboratoryFindings: [
      { name: "Hemoglobin", normalRange: "Normal", abnormalInDisease: "Low (chronic blood loss, anemia)" },
      { name: "CEA", normalRange: "<5 ng/mL", abnormalInDisease: "May be elevated" },
      { name: "CA 19-9", normalRange: "<37 U/mL", abnormalInDisease: "May be elevated" },
      { name: "HER2", normalRange: "Negative", abnormalInDisease: "Positive (20%, targetable)" }
    ],
    imagingFindings: {
      egd: ["Mass/ulcer", "Biopsy essential", "EUS for staging"],
      ct: ["Wall thickening", "Mass", "Lymphadenopathy", "Liver metastases", "Ascites"],
      pet: ["Staging", "Metabolic activity"]
    },
    severity: {
      mild: { description: "Early gastric cancer (T1, mucosa/submucosa)" },
      moderate: { description: "Locally advanced (T2-T3)" },
      severe: { description: "Metastatic (Stage IV)" }
    },
    modifications: {
      gi_tract: {
        structure: {
          gastric_wall: { factor: 2.5, note: "Wall thickening/mass" }
        },
        physiology: {
          gastric_emptying: { factor: 0.5, note: "Obstruction" }
        }
      },
      blood: {
        geometry: {
          hemoglobin: { factor: 0.7, note: "Anemia from blood loss" }
        }
      },
      liver: {
        structure: {
          metastases: { factor: 3.0, note: "Hepatic metastases" }
        }
      }
    },
    diagnosticCriteria: {
      name: "TNM Staging (AJCC 8th)",
      requirements: {
        diagnosis: "EGD with biopsy",
        staging: "CT chest/abdomen/pelvis + EUS for local staging",
        molecular: "HER2, PD-L1, MSI testing for treatment selection"
      }
    },
    differentialDiagnosis: [
      { condition: "Peptic ulcer", distinguishing: "Benign ulcer heals; always biopsy gastric ulcers" },
      { condition: "GIST", distinguishing: "Submucosal mass, c-KIT positive" },
      { condition: "Gastric lymphoma", distinguishing: "MALT lymphoma, H. pylori associated, different histology" }
    ],
    treatment: {
      earlyStage: [
        { name: "Endoscopic resection (EMR/ESD)", indication: "T1a, <2cm, well-differentiated", evidence: "IA" },
        { name: "Gastrectomy + D2 lymphadenectomy", indication: "Standard surgical approach", evidence: "IA" }
      ],
      locallyAdvanced: [
        { name: "Perioperative chemotherapy", regimen: "FLOT (5-FU, leucovorin, oxaliplatin, docetaxel)", evidence: "IA" }
      ],
      metastatic: [
        { name: "Systemic chemotherapy", regimen: "5-FU + platinum-based", evidence: "IA" },
        { name: "Trastuzumab", indication: "HER2+ tumors", evidence: "IA" },
        { name: "Pembrolizumab", indication: "PD-L1+ or MSI-H", evidence: "IA" }
      ]
    },
    riskStratification: {
      survival: "5-year: Stage I 70%; Stage IV <5%",
      location: "Proximal/GEJ worse prognosis than distal",
      histology: "Diffuse/signet ring worse than intestinal type"
    }
  },

  // =====================
  // SMALL BOWEL OBSTRUCTION
  // ICD-10: K56.6
  // =====================

  K56_6: {
    name: "Small Bowel Obstruction",
    icd10: "K56.6",
    category: "gastrointestinal",
    definition: "Mechanical or functional obstruction of small intestine preventing passage of contents",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "blood"],
    pathophysiology: {
      mechanism: "Obstruction → proximal dilation → fluid/gas accumulation → vomiting/dehydration → ± strangulation",
      molecularBasis: "Adhesions (most common), hernia, tumor, Crohn's stricture, intussusception"
    },
    clinicalPresentation: {
      symptoms: [
        "Colicky abdominal pain",
        "Nausea/vomiting (bilious)",
        "Obstipation (complete)",
        "Abdominal distension",
        "No flatus (complete)"
      ],
      signs: [
        "Abdominal distension",
        "High-pitched bowel sounds (early)",
        "Absent bowel sounds (late/ileus)",
        "Peritonitis signs (if strangulation)"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Elevated (if strangulation, peritonitis)" },
      { name: "Lactate", normalRange: "<2 mmol/L", abnormalInDisease: "Elevated (ischemia)" },
      { name: "BUN/Creatinine", normalRange: "Normal", abnormalInDisease: "Elevated (dehydration)" },
      { name: "Electrolytes", normalRange: "Normal", abnormalInDisease: "Hypokalemia, hypochloremia (vomiting)" }
    ],
    imagingFindings: {
      xray: ["Dilated small bowel >3cm", "Air-fluid levels", "Absence of colonic gas (complete)"],
      ct: ["Transition point", "Small bowel feces sign", "Closed loop (strangulation)", "Mesenteric haziness"]
    },
    severity: {
      mild: { description: "Partial obstruction, no ischemia" },
      moderate: { description: "Complete obstruction, no ischemia" },
      severe: { description: "Strangulation, bowel necrosis, peritonitis" }
    },
    modifications: {
      gi_tract: {
        geometry: {
          small_bowel_diameter: { factor: 2.5, note: "Dilated proximal bowel" }
        },
        physiology: {
          intestinal_transit: { factor: 0.0, note: "Complete obstruction" }
        }
      },
      blood: {
        pressures: {
          lactate: { factor: 3.0, note: "If ischemia" }
        }
      }
    },
    diagnosticCriteria: {
      name: "Clinical + Radiological",
      requirements: {
        clinical: "Colicky abdominal pain, vomiting, distension, obstipation",
        radiological: "Dilated small bowel >3cm, air-fluid levels, transition point on CT"
      }
    },
    differentialDiagnosis: [
      { condition: "Large bowel obstruction", distinguishing: "Competent ileocecal valve, colonic dilation" },
      { condition: "Ileus", distinguishing: "Diffuse dilation, no transition point, recent surgery" },
      { condition: "Volvulus", distinguishing: "Sigmoid: coffee bean sign; Cecal: comma sign" }
    ],
    treatment: {
      conservative: [
        { name: "NPO + NGT decompression", indication: "Partial SBO, no peritonitis", evidence: "IA" },
        { name: "IV fluids + electrolyte correction", evidence: "IA" },
        { name: "Water-soluble contrast (Gastrografin)", indication: "Diagnostic and therapeutic", evidence: "IA" }
      ],
      surgical: [
        { name: "Exploratory laparotomy", indication: "Complete SBO, peritonitis, strangulation, failure of conservative (3-5 days)", evidence: "IA" },
        { name: "Adhesiolysis", indication: "Adhesive SBO", evidence: "IA" }
      ]
    },
    riskStratification: {
      strangulation: "Signs: fever, tachycardia, localized tenderness, elevated lactate - surgical emergency",
      mortality: "Non-strangulated: <5%; Strangulated: 8-25%",
      recurrence: "Adhesive SBO: 10-30% recurrence"
    }
  },

  // =====================
  // DIVERTICULITIS
  // ICD-10: K57.3
  // =====================

  K57_3: {
    name: "Diverticulitis",
    icd10: "K57.3",
    category: "gastrointestinal",
    definition: "Inflammation/infection of colonic diverticula, typically sigmoid",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "blood"],
    pathophysiology: {
      mechanism: "Diverticular microperforation → pericolic inflammation ± abscess/perforation/fistula",
      molecularBasis: "Fecalith obstruction; altered colonic microbiome; low fiber diet association"
    },
    clinicalPresentation: {
      symptoms: [
        "LLQ pain (sigmoid)",
        "Fever",
        "Change in bowel habits",
        "Nausea",
        "Dysuria (if bladder involvement)"
      ],
      signs: [
        "LLQ tenderness",
        "Guarding (if peritonitis)",
        "Palpable mass (phlegmon/abscess)",
        "Fever"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Leukocytosis" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Elevated" },
      { name: "Urinalysis", normalRange: "Normal", abnormalInDisease: "May show pyuria (colovesical fistula)" }
    ],
    imagingFindings: {
      ct: ["Colonic wall thickening", "Pericolic fat stranding", "Diverticula", "Abscess", "Free air (perforation)"],
      colonoscopy: ["Contraindicated acutely", "6-8 weeks later to rule out cancer"]
    },
    severity: {
      mild: { description: "Uncomplicated, outpatient antibiotics" },
      moderate: { description: "Small abscess, hospitalization" },
      severe: { description: "Perforation, large abscess, peritonitis, Hinchey III-IV" }
    },
    modifications: {
      gi_tract: {
        structure: {
          colon_wall: { factor: 1.8, note: "Wall thickening" }
        }
      },
      blood: {
        geometry: {
          wbc_count: { factor: 1.5, note: "Leukocytosis" }
        }
      }
    },
    diagnosticCriteria: {
      name: "Hinchey Classification + CT Criteria",
      requirements: {
        clinical: "LLQ pain, fever, change in bowel habits",
        ct: "Wall thickening >4mm, pericolic fat stranding, diverticula",
        hinchey: {
          stage1: "Pericolic abscess",
          stage2: "Pelvic abscess",
          stage3: "Purulent peritonitis",
          stage4: "Fecal peritonitis"
        }
      }
    },
    differentialDiagnosis: [
      { condition: "Colorectal cancer", distinguishing: "Colonoscopy 6-8 weeks post-resolution required" },
      { condition: "IBD", distinguishing: "Younger age, chronic symptoms, colonoscopy findings" },
      { condition: "Appendicitis", distinguishing: "RLQ pain (or migrated), different CT findings" },
      { condition: "Ovarian pathology", distinguishing: "Female, pelvic ultrasound, different location" }
    ],
    treatment: {
      uncomplicated: [
        { name: "Oral antibiotics", regimen: "Metronidazole + Ciprofloxacin or Augmentin × 7-10 days", evidence: "IA" },
        { name: "Clear liquid diet", indication: "Advance as tolerated", evidence: "IB" }
      ],
      complicated: [
        { name: "IV antibiotics", indication: "Hinchey II+", evidence: "IA" },
        { name: "Percutaneous drainage", indication: "Abscess >3-4cm", evidence: "IA" },
        { name: "Urgent surgery", indication: "Hinchey III-IV, peritonitis, failure of conservative", evidence: "IA" }
      ],
      elective: [
        { name: "Sigmoid colectomy", indication: "Recurrent episodes, complicated disease", evidence: "IB" }
      ]
    },
    riskStratification: {
      recurrence: "30% recur after first episode",
      complication: "15-20% complicated; immunocompromised at higher risk",
      surgery: "~15-30% require surgery"
    }
  },

  // =====================
  // IBS
  // ICD-10: K58.9
  // =====================

  K58_9: {
    name: "Irritable Bowel Syndrome (IBS)",
    icd10: "K58.9",
    category: "gastrointestinal",
    definition: "Functional GI disorder with recurrent abdominal pain and altered bowel habits without organic cause",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "brain"],
    pathophysiology: {
      mechanism: "Gut-brain axis dysregulation → visceral hypersensitivity → altered motility → symptoms",
      molecularBasis: "Serotonin signaling; altered microbiome; low-grade inflammation; central sensitization"
    },
    clinicalPresentation: {
      symptoms: [
        "Recurrent abdominal pain (>1 day/week)",
        "Related to defecation",
        "Change in stool frequency",
        "Change in stool form",
        "Bloating",
        "Incomplete evacuation"
      ],
      signs: [
        "Abdominal tenderness (mild)",
        "Normal physical exam",
        "No alarm features"
      ]
    },
    laboratoryFindings: [
      { name: "CBC", normalRange: "Normal", abnormalInDisease: "Normal (exclude anemia)" },
      { name: "CRP", normalRange: "Normal", abnormalInDisease: "Normal (exclude IBD)" },
      { name: "Fecal calprotectin", normalRange: "<50 μg/g", abnormalInDisease: "Normal (exclude IBD)" },
      { name: "Celiac serology", normalRange: "Negative", abnormalInDisease: "Negative (exclude celiac)" }
    ],
    imagingFindings: {
      colonoscopy: ["Normal (if indicated by alarm features)", "Exclude organic pathology"]
    },
    severity: {
      mild: { description: "Intermittent symptoms, minimal impact" },
      moderate: { description: "Regular symptoms, some functional impairment" },
      severe: { description: "Daily symptoms, significant quality of life impact" }
    },
    modifications: {
      gi_tract: {
        physiology: {
          visceral_sensitivity: { factor: 2.0, note: "Hypersensitivity" },
          intestinal_motility: { factor: 1.3, note: "Altered (IBS-D) or 0.7 (IBS-C)" }
        }
      },
      brain: {
        physiology: {
          gut_brain_axis: { factor: 0.7, note: "Dysregulation" }
        }
      }
    },
    diagnosticCriteria: {
      name: "Rome IV Criteria",
      requirements: {
        timing: "Recurrent abdominal pain ≥1 day/week for last 3 months, onset ≥6 months prior",
        associated: "≥2 of: related to defecation, change in frequency, change in form",
        subtypes: {
          ibsC: "Constipation predominant (hard stools ≥25%)",
          ibsD: "Diarrhea predominant (loose stools ≥25%)",
          ibsM: "Mixed",
          ibsU: "Unsubtyped"
        }
      }
    },
    differentialDiagnosis: [
      { condition: "IBD", distinguishing: "Elevated calprotectin/CRP, blood in stool, colonoscopy findings" },
      { condition: "Celiac disease", distinguishing: "Positive tTG IgA, villous atrophy" },
      { condition: "Microscopic colitis", distinguishing: "Chronic watery diarrhea, colonoscopy biopsy diagnostic" },
      { condition: "Colorectal cancer", distinguishing: "Alarm features (weight loss, bleeding, anemia)" }
    ],
    treatment: {
      dietary: [
        { name: "Low FODMAP diet", indication: "First-line dietary", evidence: "IA" },
        { name: "Fiber supplementation", indication: "IBS-C", evidence: "IB" }
      ],
      ibsC: [
        { name: "Linaclotide", mechanism: "Guanylate cyclase-C agonist", evidence: "IA" },
        { name: "Lubiprostone", mechanism: "Chloride channel activator", evidence: "IA" }
      ],
      ibsD: [
        { name: "Loperamide", indication: "Symptom relief", evidence: "IB" },
        { name: "Rifaximin", indication: "Non-constipated IBS", evidence: "IA" },
        { name: "Eluxadoline", mechanism: "Mixed opioid agonist/antagonist", evidence: "IA" }
      ],
      central: [
        { name: "TCAs (low-dose)", examples: "Amitriptyline 10-25mg", indication: "Pain-predominant", evidence: "IA" },
        { name: "SSRIs", indication: "Comorbid anxiety/depression", evidence: "IB" }
      ]
    },
    riskStratification: {
      prognosis: "Chronic relapsing course; not progressive or life-shortening",
      qualityOfLife: "Significantly impacts QOL; work productivity",
      redFlags: "Age >50, rectal bleeding, weight loss, anemia → require colonoscopy"
    }
  },

  // =====================
  // ACUTE PANCREATITIS
  // ICD-10: K85.9
  // =====================

  K85_9: {
    name: "Acute Pancreatitis",
    icd10: "K85.9",
    category: "gastrointestinal",
    definition: "Acute inflammation of pancreas with local and/or systemic inflammatory response",
    primaryOrgan: "pancreas",
    affectedOrgans: ["pancreas", "lungs", "kidneys", "blood"],
    pathophysiology: {
      mechanism: "Premature activation of pancreatic enzymes → autodigestion → necrosis → SIRS",
      molecularBasis: "Trypsinogen activation; gallstones (40%), alcohol (40%); cytokine release; MODS risk"
    },
    clinicalPresentation: {
      symptoms: [
        "Severe epigastric pain radiating to back",
        "Nausea/vomiting",
        "Anorexia",
        "Fever",
        "Jaundice (if biliary)"
      ],
      signs: [
        "Epigastric tenderness",
        "Guarding",
        "Cullen sign (periumbilical ecchymosis)",
        "Grey Turner sign (flank ecchymosis)",
        "Fever",
        "Tachycardia"
      ]
    },
    laboratoryFindings: [
      { name: "Lipase", normalRange: "<60 U/L", abnormalInDisease: ">3x ULN (diagnostic)" },
      { name: "Amylase", normalRange: "25-125 U/L", abnormalInDisease: ">3x ULN (less specific)" },
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Leukocytosis" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: ">150 at 48h predicts severity" },
      { name: "BUN", normalRange: "7-20 mg/dL", abnormalInDisease: "Elevated (prognostic)" },
      { name: "Hematocrit", normalRange: "36-48%", abnormalInDisease: ">44% (hemoconcentration, severity)" },
      { name: "LDH", normalRange: "<225 U/L", abnormalInDisease: "Elevated (Ranson criterion)" }
    ],
    imagingFindings: {
      ct: ["Pancreatic edema/enlargement", "Peripancreatic fluid", "Necrosis (non-enhancing)", "Pseudocyst"],
      ultrasound: ["Gallstones (etiology)", "Dilated CBD"],
      mrcp: ["Biliary pathology", "Pancreatic duct abnormalities"]
    },
    severity: {
      mild: { description: "No organ failure, no local complications" },
      moderate: { description: "Transient organ failure <48h, local complications" },
      severe: { description: "Persistent organ failure >48h, APACHE II ≥8" }
    },
    modifications: {
      pancreas: {
        structure: {
          pancreas_volume: { factor: 1.8, note: "Edematous enlargement" },
          pancreatic_necrosis: { factor: 3.0, note: "If necrotizing" }
        },
        physiology: {
          lipase: { factor: 10.0, note: "Markedly elevated" }
        }
      },
      lungs: {
        physiology: {
          oxygen_saturation: { factor: 0.9, note: "ARDS risk" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { factor: 0.7, note: "AKI risk" }
        }
      },
      blood: {
        geometry: {
          hematocrit: { factor: 1.15, note: "Hemoconcentration" }
        }
      }
    },
    diagnosticCriteria: {
      name: "Revised Atlanta Classification",
      requirements: {
        diagnosis: "2 of 3: typical pain, lipase >3x ULN, imaging findings",
        severity: {
          mild: "No organ failure, no local complications",
          moderatelySevere: "Transient organ failure <48h OR local complications",
          severe: "Persistent organ failure >48h"
        }
      }
    },
    differentialDiagnosis: [
      { condition: "Perforated viscus", distinguishing: "Free air on imaging, peritonitis" },
      { condition: "Mesenteric ischemia", distinguishing: "Pain out of proportion, elevated lactate, vascular findings" },
      { condition: "Biliary colic/cholecystitis", distinguishing: "RUQ pain, positive Murphy's, GB wall thickening" },
      { condition: "MI", distinguishing: "ECG changes, troponin elevation" }
    ],
    treatment: {
      supportive: [
        { name: "Aggressive IV fluid resuscitation", indication: "5-10 mL/kg/hr LR initially", evidence: "IA" },
        { name: "Pain control", indication: "Opioids as needed", evidence: "IA" },
        { name: "NPO → early enteral feeding", indication: "Within 24-48h if tolerated", evidence: "IA" }
      ],
      biliary: [
        { name: "ERCP", indication: "Cholangitis, persistent biliary obstruction", evidence: "IA" },
        { name: "Cholecystectomy", indication: "Gallstone pancreatitis, same admission if mild", evidence: "IA" }
      ],
      complications: [
        { name: "Necrosectomy", indication: "Infected necrosis, failure to improve", evidence: "IA", note: "Delay >4 weeks if possible" },
        { name: "Step-up approach", note: "PCD → endoscopic → surgical", evidence: "IA" }
      ]
    },
    riskStratification: {
      mortality: "Mild: <1%; Severe: 30-50%",
      predictors: "BISAP, Ranson criteria, APACHE II",
      necrosis: "Infected necrosis: 30% mortality"
    }
  },

  // =====================
  // CHRONIC PANCREATITIS
  // ICD-10: K86.1
  // =====================

  K86_1: {
    name: "Chronic Pancreatitis",
    icd10: "K86.1",
    category: "gastrointestinal",
    definition: "Progressive inflammatory disease with irreversible morphologic changes and functional loss",
    primaryOrgan: "pancreas",
    affectedOrgans: ["pancreas", "gi_tract"],
    pathophysiology: {
      mechanism: "Recurrent inflammation → fibrosis → exocrine/endocrine insufficiency → calcifications",
      molecularBasis: "Alcohol (70%), genetic (PRSS1, SPINK1, CFTR), autoimmune, idiopathic; stellate cell activation"
    },
    clinicalPresentation: {
      symptoms: [
        "Recurrent epigastric pain",
        "Steatorrhea",
        "Weight loss",
        "Diabetes mellitus",
        "Malabsorption"
      ],
      signs: [
        "Epigastric tenderness",
        "Malnutrition",
        "Signs of diabetes"
      ]
    },
    laboratoryFindings: [
      { name: "Fecal elastase", normalRange: ">200 μg/g", abnormalInDisease: "<100 (severe insufficiency)" },
      { name: "Glucose", normalRange: "70-100 mg/dL", abnormalInDisease: "Elevated (pancreatogenic diabetes)" },
      { name: "HbA1c", normalRange: "<5.7%", abnormalInDisease: "Elevated (if diabetic)" },
      { name: "Lipase/Amylase", normalRange: "Normal or low", abnormalInDisease: "May be normal or low (burned out)" },
      { name: "Fat-soluble vitamins", normalRange: "Normal", abnormalInDisease: "Low A, D, E, K (malabsorption)" }
    ],
    imagingFindings: {
      ct: ["Calcifications", "Pancreatic atrophy", "Dilated pancreatic duct", "Pseudocyst"],
      mrcp: ["Chain of lakes appearance", "Strictures", "Side branch ectasia"],
      eus: ["Parenchymal changes", "Ductal changes"]
    },
    severity: {
      mild: { description: "Pain, no insufficiency" },
      moderate: { description: "Exocrine insufficiency, steatorrhea" },
      severe: { description: "Both exocrine and endocrine insufficiency, diabetes" }
    },
    modifications: {
      pancreas: {
        structure: {
          pancreas_volume: { factor: 0.5, note: "Atrophy" },
          calcifications: { factor: 5.0, note: "Calcifications" }
        },
        physiology: {
          enzyme_secretion: { factor: 0.3, note: "Exocrine insufficiency" },
          insulin_secretion: { factor: 0.5, note: "Endocrine insufficiency" }
        }
      },
      gi_tract: {
        physiology: {
          fat_absorption: { factor: 0.4, note: "Steatorrhea" }
        }
      }
    },
    diagnosticCriteria: {
      name: "M-ANNHEIM or Cambridge Classification",
      requirements: {
        clinical: "Recurrent or persistent abdominal pain, exocrine/endocrine insufficiency",
        imaging: "Calcifications, duct dilation, parenchymal changes on CT/MRCP/EUS",
        functional: "Fecal elastase <200 μg/g (exocrine); diabetes (endocrine)"
      }
    },
    differentialDiagnosis: [
      { condition: "Pancreatic cancer", distinguishing: "Mass on imaging, CA 19-9 elevated, rapid weight loss" },
      { condition: "Autoimmune pancreatitis", distinguishing: "IgG4 elevated, sausage-shaped pancreas, responds to steroids" },
      { condition: "Recurrent acute pancreatitis", distinguishing: "Discrete episodes, no chronic changes" }
    ],
    treatment: {
      pain: [
        { name: "Analgesics", indication: "Step-up approach: NSAIDs → opioids", evidence: "IB" },
        { name: "Celiac plexus block", indication: "Refractory pain", evidence: "IB" },
        { name: "ERCP with stenting", indication: "Dominant stricture, stones", evidence: "IB" }
      ],
      exocrine: [
        { name: "Pancreatic enzyme replacement (PERT)", dose: "40,000-50,000 lipase units/meal", evidence: "IA" }
      ],
      endocrine: [
        { name: "Diabetes management", note: "Brittle diabetes common; avoid hypoglycemia", evidence: "IA" }
      ],
      surgical: [
        { name: "Frey/Beger procedure", indication: "Inflammatory head mass", evidence: "IB" },
        { name: "Total pancreatectomy + islet auto-transplant", indication: "Refractory pain, select patients", evidence: "IIB" }
      ]
    },
    riskStratification: {
      cancerRisk: "4% at 20 years; higher with hereditary pancreatitis",
      mortality: "Reduced life expectancy; diabetes and malnutrition complications",
      abstinence: "Alcohol cessation essential; smoking cessation"
    }
  },

  // =====================
  // PANCREATIC CANCER
  // ICD-10: C25.9
  // =====================

  C25_9: {
    name: "Pancreatic Cancer",
    icd10: "C25.9",
    category: "gastrointestinal",
    definition: "Malignant neoplasm of pancreas, predominantly ductal adenocarcinoma",
    primaryOrgan: "pancreas",
    affectedOrgans: ["pancreas", "liver", "gi_tract", "blood"],
    pathophysiology: {
      mechanism: "KRAS-driven carcinogenesis → ductal adenocarcinoma → early metastasis, desmoplastic stroma",
      molecularBasis: "KRAS (95%), CDKN2A, TP53, SMAD4 mutations; dense stroma; perineural invasion"
    },
    clinicalPresentation: {
      symptoms: [
        "Painless jaundice (head tumors)",
        "Epigastric/back pain",
        "Weight loss",
        "Anorexia",
        "New-onset diabetes",
        "Steatorrhea"
      ],
      signs: [
        "Jaundice",
        "Palpable gallbladder (Courvoisier sign)",
        "Cachexia",
        "Hepatomegaly (if mets)",
        "Trousseau syndrome (migratory thrombophlebitis)"
      ]
    },
    laboratoryFindings: [
      { name: "CA 19-9", normalRange: "<37 U/mL", abnormalInDisease: "Elevated (not screening, follows treatment)" },
      { name: "Bilirubin", normalRange: "<1.2 mg/dL", abnormalInDisease: "Elevated (obstructive jaundice)" },
      { name: "ALP", normalRange: "44-147 U/L", abnormalInDisease: "Elevated (biliary obstruction)" },
      { name: "Glucose", normalRange: "70-100 mg/dL", abnormalInDisease: "New diabetes" }
    ],
    imagingFindings: {
      ct: ["Pancreatic mass (hypodense)", "Vascular encasement", "Liver metastases", "Double duct sign"],
      mri_mrcp: ["Mass characterization", "Biliary/pancreatic duct assessment"],
      eus: ["Staging", "FNA biopsy"]
    },
    severity: {
      mild: { description: "Resectable (no vascular involvement)" },
      moderate: { description: "Borderline resectable, locally advanced" },
      severe: { description: "Metastatic (Stage IV)" }
    },
    modifications: {
      pancreas: {
        structure: {
          pancreas_mass: { factor: 3.0, note: "Tumor" }
        }
      },
      liver: {
        physiology: {
          bilirubin: { factor: 10.0, note: "Obstructive jaundice" }
        },
        structure: {
          metastases: { factor: 3.0, note: "Hepatic metastases" }
        }
      },
      blood: {
        geometry: {
          glucose: { factor: 1.5, note: "New-onset diabetes" }
        },
        pressures: {
          coagulation: { factor: 1.5, note: "Hypercoagulable state" }
        }
      }
    },
    diagnosticCriteria: {
      name: "NCCN Guidelines - TNM Staging",
      requirements: {
        tissue: "Biopsy via EUS-FNA required for nonsurgical candidates",
        staging: "CT chest/abdomen/pelvis + PET for staging",
        resectability: "NCCN criteria: no mets, no SMA/celiac involvement >180°"
      }
    },
    differentialDiagnosis: [
      { condition: "Chronic pancreatitis", distinguishing: "Calcifications, chronic history, different imaging pattern" },
      { condition: "Autoimmune pancreatitis", distinguishing: "IgG4 elevated, responds to steroids, sausage-shaped" },
      { condition: "Cholangiocarcinoma", distinguishing: "Different location, isolated biliary obstruction" }
    ],
    treatment: {
      resectable: [
        { name: "Whipple procedure (pancreaticoduodenectomy)", indication: "Head tumors", evidence: "IA" },
        { name: "Distal pancreatectomy", indication: "Body/tail tumors", evidence: "IA" },
        { name: "Adjuvant mFOLFIRINOX", indication: "After R0/R1 resection", evidence: "IA" }
      ],
      locallyAdvanced: [
        { name: "FOLFIRINOX or Gem/nab-paclitaxel", indication: "Neoadjuvant or definitive", evidence: "IA" }
      ],
      metastatic: [
        { name: "FOLFIRINOX", indication: "Good PS, first-line", evidence: "IA" },
        { name: "Gemcitabine/nab-paclitaxel", indication: "Alternative first-line", evidence: "IA" }
      ],
      palliative: [
        { name: "Biliary stent", indication: "Obstructive jaundice" },
        { name: "Celiac plexus neurolysis", indication: "Pain management" }
      ]
    },
    riskStratification: {
      survival: "Overall 5-year: ~10%; Resected: 20-25%; Metastatic: <1 year",
      recurrence: "80% recur after surgery",
      prognosis: "One of worst cancer outcomes; early detection critical"
    }
  },

  // =====================
  // CHOLELITHIASIS WITH CHOLECYSTITIS
  // ICD-10: K80.2
  // =====================

  K80_2: {
    name: "Cholelithiasis with Acute Cholecystitis",
    icd10: "K80.2",
    category: "gastrointestinal",
    definition: "Gallstone disease with acute inflammation of gallbladder",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "gi_tract"],
    pathophysiology: {
      mechanism: "Stone impaction in cystic duct → gallbladder distension → inflammation → ± secondary infection",
      molecularBasis: "Cholesterol stones (80%) vs pigment stones; bile stasis; mucin hypersecretion"
    },
    clinicalPresentation: {
      symptoms: [
        "RUQ pain (>4-6 hours)",
        "Fever",
        "Nausea/vomiting",
        "Pain radiating to right scapula",
        "Fatty food intolerance"
      ],
      signs: [
        "RUQ tenderness",
        "Murphy sign (inspiratory arrest)",
        "Guarding",
        "Fever",
        "Palpable gallbladder (rare)"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Leukocytosis" },
      { name: "CRP", normalRange: "<10 mg/L", abnormalInDisease: "Elevated" },
      { name: "LFTs", normalRange: "Normal", abnormalInDisease: "May be mildly elevated" },
      { name: "Bilirubin", normalRange: "<1.2 mg/dL", abnormalInDisease: "Elevated if CBD stone" }
    ],
    imagingFindings: {
      ultrasound: ["Gallstones", "Gallbladder wall thickening >4mm", "Pericholecystic fluid", "Sonographic Murphy sign"],
      hida: ["Non-visualization of gallbladder (confirms cystic duct obstruction)"],
      ct: ["Wall thickening", "Pericholecystic inflammation", "Complications (perforation, emphysematous)"]
    },
    severity: {
      mild: { description: "Grade I: uncomplicated, healthy patient" },
      moderate: { description: "Grade II: WBC >18K, duration >72h, palpable mass" },
      severe: { description: "Grade III: organ dysfunction, gangrenous/emphysematous" }
    },
    modifications: {
      liver: {
        structure: {
          gallbladder_wall: { factor: 2.0, note: "Wall thickening" },
          pericholecystic_fluid: { factor: 3.0, note: "Inflammation" }
        }
      },
      blood: {
        geometry: {
          wbc_count: { factor: 1.5, note: "Leukocytosis" }
        }
      }
    }
  },

  // =====================
  // ACUTE CHOLANGITIS
  // ICD-10: K83.0
  // =====================

  K83_0: {
    name: "Acute Cholangitis",
    icd10: "K83.0",
    category: "gastrointestinal",
    definition: "Bacterial infection of biliary tree, usually from biliary obstruction",
    primaryOrgan: "liver",
    affectedOrgans: ["liver", "blood"],
    pathophysiology: {
      mechanism: "Biliary obstruction → bacterial colonization → infection → systemic sepsis",
      molecularBasis: "CBD stones (most common), stricture, malignancy; E. coli, Klebsiella, Enterococcus"
    },
    clinicalPresentation: {
      symptoms: [
        "RUQ pain",
        "Fever",
        "Jaundice",
        "Altered mental status (severe)"
      ],
      signs: [
        "Charcot triad: fever, jaundice, RUQ pain",
        "Reynolds pentad: + hypotension, altered mental status",
        "Septic shock signs"
      ]
    },
    laboratoryFindings: [
      { name: "WBC", normalRange: "4-11 ×10⁹/L", abnormalInDisease: "Leukocytosis or leukopenia (sepsis)" },
      { name: "Bilirubin", normalRange: "<1.2 mg/dL", abnormalInDisease: "Elevated (conjugated)" },
      { name: "ALP", normalRange: "44-147 U/L", abnormalInDisease: "Elevated" },
      { name: "GGT", normalRange: "<60 U/L", abnormalInDisease: "Elevated" },
      { name: "Blood cultures", normalRange: "Negative", abnormalInDisease: "Positive (50%)" }
    ],
    imagingFindings: {
      ultrasound: ["Dilated CBD (>8mm)", "CBD stone", "Intrahepatic ductal dilation"],
      mrcp: ["CBD stone", "Stricture", "Cause of obstruction"],
      ercp: ["Therapeutic: stone extraction, stenting"]
    },
    severity: {
      mild: { description: "Grade I: responds to antibiotics" },
      moderate: { description: "Grade II: no organ dysfunction but refractory" },
      severe: { description: "Grade III: organ dysfunction, shock, Reynolds pentad" }
    },
    modifications: {
      liver: {
        physiology: {
          bilirubin: { factor: 6.0, note: "Obstructive jaundice" },
          alp: { factor: 3.0, note: "Cholestatic pattern" }
        },
        structure: {
          bile_duct: { factor: 1.5, note: "Dilated CBD" }
        }
      },
      blood: {
        geometry: {
          wbc_count: { factor: 1.8, note: "Leukocytosis" }
        },
        physiology: {
          blood_pressure: { factor: 0.7, note: "Septic shock" }
        }
      }
    }
  },

  // =====================
  // ESOPHAGEAL CANCER
  // ICD-10: C15.9
  // =====================

  C15_9: {
    name: "Esophageal Cancer",
    icd10: "C15.9",
    category: "gastrointestinal",
    definition: "Malignant neoplasm of esophagus (squamous cell or adenocarcinoma)",
    primaryOrgan: "gi_tract",
    affectedOrgans: ["gi_tract", "lymphatic", "lungs", "liver"],
    pathophysiology: {
      mechanism: "SCC: smoking/alcohol → dysplasia → cancer; Adeno: GERD → Barrett's → dysplasia → cancer",
      molecularBasis: "SCC: TP53, NOTCH1; Adeno: TP53, CDKN2A, Barrett's metaplasia-dysplasia-carcinoma sequence"
    },
    clinicalPresentation: {
      symptoms: [
        "Progressive dysphagia (solids → liquids)",
        "Weight loss",
        "Odynophagia",
        "Chest pain",
        "Hoarseness (recurrent laryngeal nerve)",
        "Chronic cough (tracheal involvement)"
      ],
      signs: [
        "Cachexia",
        "Lymphadenopathy (supraclavicular)",
        "Hepatomegaly (if mets)"
      ]
    },
    laboratoryFindings: [
      { name: "Hemoglobin", normalRange: "Normal", abnormalInDisease: "Anemia (blood loss, chronic disease)" },
      { name: "Albumin", normalRange: "3.5-5 g/dL", abnormalInDisease: "Low (malnutrition)" }
    ],
    imagingFindings: {
      egd: ["Mass/stricture", "Biopsy essential"],
      eus: ["T staging (depth)", "N staging (nodes)"],
      ct: ["Metastases (lungs, liver)", "Local extent"],
      pet: ["Staging", "Metabolic activity"]
    },
    severity: {
      mild: { description: "Early (T1, no nodes)" },
      moderate: { description: "Locally advanced (T2-T3, regional nodes)" },
      severe: { description: "Metastatic (Stage IV)" }
    },
    modifications: {
      gi_tract: {
        structure: {
          esophageal_lumen: { factor: 0.3, note: "Obstruction" }
        },
        physiology: {
          swallowing: { factor: 0.4, note: "Dysphagia" }
        }
      },
      blood: {
        geometry: {
          hemoglobin: { factor: 0.8, note: "Anemia" }
        },
        proteins: {
          albumin: { factor: 0.7, note: "Malnutrition" }
        }
      }
    }
  }
};

export default GI_DISEASES;
