// FOUNDATIONAL BIOCHEMISTRY - Normal Human Cellular & Tissue Metabolism
// The mathematical basis for ALL organ function

export const BIOCHEMISTRY = {
  // =========================================================================
  // ENERGY METABOLISM
  // =========================================================================
  energyMetabolism: {
    name: "Energy Metabolism",
    description: "ATP production pathways - the currency of cellular life",
    
    // GLYCOLYSIS - Cytosolic glucose breakdown
    glycolysis: {
      name: "Glycolysis",
      location: "Cytosol",
      description: "10-step breakdown of glucose to pyruvate",
      
      netEquation: {
        latex: "C_6H_{12}O_6 + 2NAD^+ + 2ADP + 2P_i \\rightarrow 2C_3H_4O_3 + 2NADH + 2H^+ + 2ATP + 2H_2O",
        simplified: "Glucose + 2NAD⁺ + 2ADP + 2Pi → 2 Pyruvate + 2NADH + 2ATP",
        evidence: "established"
      },
      
      steps: [
        {
          number: 1,
          name: "Hexokinase",
          reaction: "Glucose + ATP → Glucose-6-P + ADP",
          latex: "Glucose + ATP \\xrightarrow{HK} G6P + ADP",
          enzyme: "Hexokinase (HK)",
          kinetics: {
            km_glucose: 0.1, // mM
            km_atp: 0.4, // mM
            vmax: "tissue-dependent",
            inhibitors: ["G6P (product inhibition)"],
          },
          deltaG: -16.7, // kJ/mol
          regulation: "Inhibited by G6P (product)",
          evidence: "established"
        },
        {
          number: 2,
          name: "Phosphoglucose Isomerase",
          reaction: "G6P ⇌ F6P",
          latex: "G6P \\rightleftharpoons F6P",
          enzyme: "PGI",
          deltaG: 1.7,
          evidence: "established"
        },
        {
          number: 3,
          name: "Phosphofructokinase-1 (Rate-Limiting)",
          reaction: "F6P + ATP → F1,6BP + ADP",
          latex: "F6P + ATP \\xrightarrow{PFK-1} F1,6BP + ADP",
          enzyme: "PFK-1",
          kinetics: {
            km_f6p: 0.1,
            km_atp: 0.05,
            allosteric_activators: ["AMP", "ADP", "F2,6BP", "Pi"],
            allosteric_inhibitors: ["ATP", "Citrate", "H+"],
          },
          deltaG: -14.2,
          regulation: "COMMITTED STEP - Key regulatory point",
          rateEquation: {
            latex: "v = \\frac{V_{max}[F6P][ATP]}{K_m(1 + \\frac{[ATP]}{K_i} + \\frac{[Citrate]}{K_{i,cit}})(K_m + [F6P])(1 + \\frac{K_a}{[AMP]})}",
            description: "Sigmoidal kinetics with multiple effectors"
          },
          evidence: "established"
        },
        {
          number: 4,
          name: "Aldolase",
          reaction: "F1,6BP ⇌ DHAP + G3P",
          latex: "F1,6BP \\rightleftharpoons DHAP + G3P",
          enzyme: "Aldolase",
          deltaG: 23.8,
          evidence: "established"
        },
        {
          number: 5,
          name: "Triose Phosphate Isomerase",
          reaction: "DHAP ⇌ G3P",
          latex: "DHAP \\rightleftharpoons G3P",
          enzyme: "TPI",
          deltaG: 7.5,
          evidence: "established"
        },
        {
          number: 6,
          name: "G3P Dehydrogenase",
          reaction: "G3P + NAD⁺ + Pi ⇌ 1,3BPG + NADH + H⁺",
          latex: "G3P + NAD^+ + P_i \\rightleftharpoons 1,3BPG + NADH + H^+",
          enzyme: "GAPDH",
          deltaG: 6.3,
          evidence: "established"
        },
        {
          number: 7,
          name: "Phosphoglycerate Kinase",
          reaction: "1,3BPG + ADP ⇌ 3PG + ATP",
          latex: "1,3BPG + ADP \\rightleftharpoons 3PG + ATP",
          enzyme: "PGK",
          deltaG: -18.5,
          note: "First ATP-generating step (substrate-level phosphorylation)",
          evidence: "established"
        },
        {
          number: 8,
          name: "Phosphoglycerate Mutase",
          reaction: "3PG ⇌ 2PG",
          latex: "3PG \\rightleftharpoons 2PG",
          enzyme: "PGM",
          deltaG: 4.4,
          evidence: "established"
        },
        {
          number: 9,
          name: "Enolase",
          reaction: "2PG ⇌ PEP + H₂O",
          latex: "2PG \\rightleftharpoons PEP + H_2O",
          enzyme: "Enolase",
          deltaG: 7.5,
          evidence: "established"
        },
        {
          number: 10,
          name: "Pyruvate Kinase",
          reaction: "PEP + ADP → Pyruvate + ATP",
          latex: "PEP + ADP \\xrightarrow{PK} Pyruvate + ATP",
          enzyme: "Pyruvate Kinase (PK)",
          kinetics: {
            km_pep: 0.2,
            km_adp: 0.3,
            activators: ["F1,6BP"],
            inhibitors: ["ATP", "Alanine", "Acetyl-CoA"],
          },
          deltaG: -31.4,
          regulation: "Second ATP-generating step",
          evidence: "established"
        }
      ],

      energyYield: {
        atp_produced: 4,
        atp_consumed: 2,
        net_atp: 2,
        nadh_produced: 2,
        latex: "\\text{Net: } 2 ATP + 2 NADH \\text{ per glucose}"
      },

      tissueVariations: {
        muscle: { rate: "high during exercise", regulation: "Ca²⁺, AMP activate" },
        liver: { rate: "bidirectional (gluconeogenesis)", regulation: "hormonal" },
        brain: { rate: "constant high", regulation: "obligate glucose user" },
        rbc: { rate: "only pathway (no mitochondria)", regulation: "2,3-BPG shunt" },
        adipose: { rate: "provides G3P for TAG synthesis", regulation: "insulin" }
      }
    },

    // PYRUVATE DEHYDROGENASE COMPLEX - Link to TCA
    pyruvateDH: {
      name: "Pyruvate Dehydrogenase Complex",
      location: "Mitochondrial Matrix",
      description: "Irreversible link between glycolysis and TCA cycle",
      
      netEquation: {
        latex: "Pyruvate + CoA + NAD^+ \\rightarrow Acetyl\\text{-}CoA + CO_2 + NADH",
        evidence: "established"
      },
      
      components: [
        { name: "E1 (Pyruvate dehydrogenase)", cofactor: "TPP" },
        { name: "E2 (Dihydrolipoyl transacetylase)", cofactor: "Lipoic acid, CoA" },
        { name: "E3 (Dihydrolipoyl dehydrogenase)", cofactor: "FAD, NAD⁺" }
      ],
      
      regulation: {
        inhibitors: ["Acetyl-CoA", "NADH", "ATP"],
        activators: ["CoA", "NAD⁺", "ADP", "Ca²⁺"],
        covalentMod: "Phosphorylation (inactive) / Dephosphorylation (active)",
        hormonalControl: "Insulin activates, glucagon inhibits"
      },

      rateEquation: {
        latex: "v = \\frac{V_{max}[Pyr][CoA][NAD^+]}{K_m(1 + \\frac{[Acetyl\\text{-}CoA]}{K_i} + \\frac{[NADH]}{K_{i,NADH}})}",
        evidence: "established"
      }
    },

    // TCA CYCLE (KREBS CYCLE)
    tcaCycle: {
      name: "Tricarboxylic Acid Cycle (Krebs Cycle)",
      location: "Mitochondrial Matrix",
      description: "Central hub of metabolism - oxidizes acetyl-CoA",
      
      netEquation: {
        latex: "Acetyl\\text{-}CoA + 3NAD^+ + FAD + GDP + P_i + 2H_2O \\rightarrow 2CO_2 + 3NADH + FADH_2 + GTP + CoA",
        evidence: "established"
      },

      steps: [
        {
          number: 1,
          name: "Citrate Synthase",
          reaction: "Acetyl-CoA + OAA + H₂O → Citrate + CoA",
          latex: "Acetyl\\text{-}CoA + OAA \\xrightarrow{CS} Citrate + CoA",
          deltaG: -31.4,
          regulation: "Inhibited by ATP, NADH, Citrate",
          evidence: "established"
        },
        {
          number: 2,
          name: "Aconitase",
          reaction: "Citrate ⇌ Isocitrate (via cis-Aconitate)",
          latex: "Citrate \\rightleftharpoons Isocitrate",
          deltaG: 6.3,
          evidence: "established"
        },
        {
          number: 3,
          name: "Isocitrate Dehydrogenase (Rate-Limiting)",
          reaction: "Isocitrate + NAD⁺ → α-KG + CO₂ + NADH",
          latex: "Isocitrate + NAD^+ \\xrightarrow{IDH} \\alpha\\text{-}KG + CO_2 + NADH",
          deltaG: -8.4,
          regulation: "COMMITTED STEP - Activated by ADP, Ca²⁺; Inhibited by ATP, NADH",
          rateEquation: {
            latex: "v = \\frac{V_{max}[Isocitrate][NAD^+]}{K_m(1 + \\frac{[NADH]}{K_i})(1 + \\frac{K_a}{[ADP]})}",
            evidence: "established"
          },
          evidence: "established"
        },
        {
          number: 4,
          name: "α-Ketoglutarate Dehydrogenase",
          reaction: "α-KG + NAD⁺ + CoA → Succinyl-CoA + CO₂ + NADH",
          latex: "\\alpha\\text{-}KG + NAD^+ + CoA \\rightarrow Succinyl\\text{-}CoA + CO_2 + NADH",
          deltaG: -33.5,
          regulation: "Inhibited by Succinyl-CoA, NADH; Activated by Ca²⁺",
          evidence: "established"
        },
        {
          number: 5,
          name: "Succinyl-CoA Synthetase",
          reaction: "Succinyl-CoA + GDP + Pi ⇌ Succinate + GTP + CoA",
          latex: "Succinyl\\text{-}CoA + GDP + P_i \\rightleftharpoons Succinate + GTP + CoA",
          deltaG: -2.9,
          note: "Substrate-level phosphorylation",
          evidence: "established"
        },
        {
          number: 6,
          name: "Succinate Dehydrogenase",
          reaction: "Succinate + FAD → Fumarate + FADH₂",
          latex: "Succinate + FAD \\rightarrow Fumarate + FADH_2",
          deltaG: 0,
          note: "Also Complex II of ETC",
          evidence: "established"
        },
        {
          number: 7,
          name: "Fumarase",
          reaction: "Fumarate + H₂O ⇌ Malate",
          latex: "Fumarate + H_2O \\rightleftharpoons Malate",
          deltaG: -3.8,
          evidence: "established"
        },
        {
          number: 8,
          name: "Malate Dehydrogenase",
          reaction: "Malate + NAD⁺ ⇌ OAA + NADH + H⁺",
          latex: "Malate + NAD^+ \\rightleftharpoons OAA + NADH + H^+",
          deltaG: 29.7,
          note: "Pulled forward by citrate synthase",
          evidence: "established"
        }
      ],

      energyYield: {
        nadh: 3,
        fadh2: 1,
        gtp: 1,
        co2: 2,
        per_glucose: "×2 (2 acetyl-CoA per glucose)",
        latex: "\\text{Per glucose: } 6 NADH + 2 FADH_2 + 2 GTP"
      },

      amphibolicRole: {
        description: "TCA provides precursors for biosynthesis",
        outputs: {
          citrate: "Fatty acid synthesis",
          alpha_kg: "Amino acid synthesis (glutamate family)",
          succinyl_coa: "Heme synthesis",
          oaa: "Gluconeogenesis, amino acids (aspartate)"
        }
      }
    },

    // OXIDATIVE PHOSPHORYLATION
    oxidativePhosphorylation: {
      name: "Oxidative Phosphorylation",
      location: "Inner Mitochondrial Membrane",
      description: "Electron transport chain + ATP synthase - major ATP production",
      
      netEquations: {
        nadh: {
          latex: "NADH + \\frac{1}{2}O_2 + H^+ + \\sim2.5ADP + \\sim2.5P_i \\rightarrow NAD^+ + H_2O + \\sim2.5ATP",
          atp_yield: 2.5,
          evidence: "established"
        },
        fadh2: {
          latex: "FADH_2 + \\frac{1}{2}O_2 + \\sim1.5ADP + \\sim1.5P_i \\rightarrow FAD + H_2O + \\sim1.5ATP",
          atp_yield: 1.5,
          evidence: "established"
        },
        overall_glucose: {
          latex: "C_6H_{12}O_6 + 6O_2 + \\sim30ADP + \\sim30P_i \\rightarrow 6CO_2 + 6H_2O + \\sim30ATP",
          evidence: "established"
        }
      },

      complexes: [
        {
          name: "Complex I (NADH Dehydrogenase)",
          reaction: "NADH + Q + 5H⁺matrix → NAD⁺ + QH₂ + 4H⁺IMS",
          latex: "NADH + Q + 5H^+_{matrix} \\rightarrow NAD^+ + QH_2 + 4H^+_{IMS}",
          protons_pumped: 4,
          inhibitors: ["Rotenone", "Amytal"],
          evidence: "established"
        },
        {
          name: "Complex II (Succinate Dehydrogenase)",
          reaction: "Succinate + Q → Fumarate + QH₂",
          latex: "Succinate + Q \\rightarrow Fumarate + QH_2",
          protons_pumped: 0,
          note: "No proton pumping - FADH₂ enters here",
          inhibitors: ["Malonate"],
          evidence: "established"
        },
        {
          name: "Complex III (Cytochrome bc₁)",
          reaction: "QH₂ + 2Cytc(ox) + 2H⁺matrix → Q + 2Cytc(red) + 4H⁺IMS",
          latex: "QH_2 + 2Cyt c_{ox} \\rightarrow Q + 2Cyt c_{red} + 4H^+_{IMS}",
          protons_pumped: 4,
          inhibitors: ["Antimycin A"],
          evidence: "established"
        },
        {
          name: "Complex IV (Cytochrome c Oxidase)",
          reaction: "4Cytc(red) + O₂ + 8H⁺matrix → 4Cytc(ox) + 2H₂O + 4H⁺IMS",
          latex: "4Cyt c_{red} + O_2 + 8H^+_{matrix} \\rightarrow 4Cyt c_{ox} + 2H_2O + 4H^+_{IMS}",
          protons_pumped: 4,
          inhibitors: ["Cyanide", "CO", "Azide"],
          evidence: "established"
        },
        {
          name: "ATP Synthase (Complex V)",
          reaction: "ADP + Pi + ~3H⁺IMS → ATP + H₂O + ~3H⁺matrix",
          latex: "ADP + P_i + \\sim3H^+_{IMS} \\xrightarrow{F_0F_1} ATP + H_2O + \\sim3H^+_{matrix}",
          protons_required: 3,
          mechanism: "Rotary catalysis",
          inhibitors: ["Oligomycin"],
          evidence: "established"
        }
      ],

      chemiosmoticTheory: {
        latex: "\\Delta G = -nF\\Delta\\Psi + RT\\ln\\frac{[H^+]_{IMS}}{[H^+]_{matrix}}",
        description: "Proton motive force drives ATP synthesis",
        components: {
          membrane_potential: "ΔΨ ≈ -140 mV",
          pH_gradient: "ΔpH ≈ 0.5-1.0 units",
          pmf: "~200 mV equivalent"
        },
        evidence: "established (Peter Mitchell, Nobel 1978)"
      },

      atpYieldSummary: {
        glycolysis_nadh: "2 NADH × 2.5 = 5 ATP (via malate-aspartate shuttle)",
        pdh_nadh: "2 NADH × 2.5 = 5 ATP",
        tca_nadh: "6 NADH × 2.5 = 15 ATP",
        tca_fadh2: "2 FADH₂ × 1.5 = 3 ATP",
        substrate_level: "2 ATP (glycolysis) + 2 GTP (TCA) = 4 ATP",
        total: "~30-32 ATP per glucose",
        efficiency: "~40% (vs theoretical max)",
        latex: "\\text{Efficiency} = \\frac{30 \\times 30.5 kJ/mol}{2870 kJ/mol} \\approx 32\\%"
      }
    },

    // GLUCONEOGENESIS
    gluconeogenesis: {
      name: "Gluconeogenesis",
      location: "Liver, Kidney (cytosol + mitochondria)",
      description: "Synthesis of glucose from non-carbohydrate precursors",
      
      netEquation: {
        latex: "2Pyruvate + 4ATP + 2GTP + 2NADH + 6H_2O \\rightarrow Glucose + 4ADP + 2GDP + 6P_i + 2NAD^+",
        evidence: "established"
      },

      bypassReactions: [
        {
          glycolytic_step: "Pyruvate Kinase",
          bypass: "Pyruvate Carboxylase + PEPCK",
          latex: "Pyruvate \\xrightarrow{PC} OAA \\xrightarrow{PEPCK} PEP",
          cost: "1 ATP + 1 GTP",
          evidence: "established"
        },
        {
          glycolytic_step: "PFK-1",
          bypass: "Fructose-1,6-bisphosphatase",
          latex: "F1,6BP \\xrightarrow{FBPase} F6P + P_i",
          regulation: "Inhibited by AMP, F2,6BP; Activated by citrate",
          evidence: "established"
        },
        {
          glycolytic_step: "Hexokinase",
          bypass: "Glucose-6-phosphatase",
          latex: "G6P \\xrightarrow{G6Pase} Glucose + P_i",
          location: "ER membrane (liver, kidney only)",
          evidence: "established"
        }
      ],

      substrates: {
        lactate: "Cori cycle - muscle lactate → liver glucose",
        alanine: "Glucose-alanine cycle - muscle alanine → liver glucose",
        glycerol: "From fat breakdown (adipose)",
        amino_acids: "Glucogenic amino acids (except Leu, Lys)"
      }
    },

    // GLYCOGEN METABOLISM
    glycogenMetabolism: {
      name: "Glycogen Metabolism",
      location: "Liver, Muscle (cytosol)",
      description: "Storage and mobilization of glucose",

      glycogenesis: {
        netEquation: {
          latex: "Glucose + 2ATP + UTP \\rightarrow (Glucose)_n + 2ADP + UDP + 2P_i",
          evidence: "established"
        },
        steps: [
          { enzyme: "Glycogen Synthase", reaction: "UDP-glucose + (glucose)n → (glucose)n+1" },
          { enzyme: "Branching Enzyme", reaction: "Creates α(1→6) branches" }
        ],
        regulation: "Activated by insulin, G6P; Inhibited by glucagon, epinephrine"
      },

      glycogenolysis: {
        netEquation: {
          latex: "(Glucose)_n + P_i \\rightarrow G1P + (Glucose)_{n-1}",
          evidence: "established"
        },
        steps: [
          { enzyme: "Glycogen Phosphorylase", reaction: "(glucose)n + Pi → G1P + (glucose)n-1" },
          { enzyme: "Debranching Enzyme", reaction: "Transfers branches, releases glucose" }
        ],
        regulation: "Activated by glucagon, epinephrine, AMP (muscle); Inhibited by insulin"
      },

      tissueSpecificity: {
        liver: "Maintains blood glucose (G6Pase present)",
        muscle: "Local fuel use only (no G6Pase)"
      }
    }
  },

  // =========================================================================
  // LIPID METABOLISM
  // =========================================================================
  lipidMetabolism: {
    name: "Lipid Metabolism",
    description: "Fatty acid synthesis, oxidation, and storage",

    betaOxidation: {
      name: "β-Oxidation",
      location: "Mitochondrial Matrix",
      description: "Fatty acid breakdown to acetyl-CoA",
      
      netEquation: {
        latex: "Palmitoyl\\text{-}CoA + 7FAD + 7NAD^+ + 7CoA + 7H_2O \\rightarrow 8Acetyl\\text{-}CoA + 7FADH_2 + 7NADH + 7H^+",
        for: "Palmitate (C16:0)",
        evidence: "established"
      },

      energyYield: {
        acetyl_coa: 8,
        nadh: 7,
        fadh2: 7,
        activation_cost: -2,
        total_atp: "8×10 + 7×2.5 + 7×1.5 = 106 ATP (net 104)",
        per_carbon: "~6.5 ATP per carbon (vs glucose ~5 ATP/C)",
        latex: "ATP_{palmitate} = 8 \\times 10 + 7 \\times 2.5 + 7 \\times 1.5 - 2 = 106 - 2 = 104"
      },

      steps: [
        { name: "Oxidation (FAD)", enzyme: "Acyl-CoA Dehydrogenase" },
        { name: "Hydration", enzyme: "Enoyl-CoA Hydratase" },
        { name: "Oxidation (NAD⁺)", enzyme: "β-Hydroxyacyl-CoA Dehydrogenase" },
        { name: "Thiolysis", enzyme: "β-Ketothiolase" }
      ],

      carnitineShuttle: {
        description: "Long-chain fatty acids require carnitine for mitochondrial entry",
        steps: [
          "Acyl-CoA + Carnitine → Acylcarnitine (CPT-I, outer membrane)",
          "Acylcarnitine crosses inner membrane (translocase)",
          "Acylcarnitine → Acyl-CoA + Carnitine (CPT-II, inner membrane)"
        ],
        regulation: "CPT-I inhibited by Malonyl-CoA (prevents oxidation during synthesis)"
      }
    },

    fattyAcidSynthesis: {
      name: "Fatty Acid Synthesis",
      location: "Cytosol",
      description: "De novo synthesis from acetyl-CoA",
      
      netEquation: {
        latex: "8Acetyl\\text{-}CoA + 14NADPH + 7ATP \\rightarrow Palmitate + 8CoA + 14NADP^+ + 7ADP + 7P_i + 6H_2O",
        evidence: "established"
      },

      keyEnzymes: [
        {
          name: "Acetyl-CoA Carboxylase (ACC)",
          reaction: "Acetyl-CoA + CO₂ + ATP → Malonyl-CoA",
          regulation: "COMMITTED STEP - Activated by citrate, insulin; Inhibited by palmitoyl-CoA, glucagon, AMPK"
        },
        {
          name: "Fatty Acid Synthase (FAS)",
          description: "Multi-enzyme complex performing 7 cycles of elongation"
        }
      ]
    },

    ketogenesis: {
      name: "Ketogenesis",
      location: "Liver Mitochondria",
      description: "Production of ketone bodies during fasting/diabetes",
      
      netEquation: {
        latex: "2Acetyl\\text{-}CoA \\rightarrow Acetoacetate \\rightarrow \\beta\\text{-}hydroxybutyrate + Acetone",
        evidence: "established"
      },

      ketoneBodies: ["Acetoacetate", "β-hydroxybutyrate", "Acetone"],
      
      conditions: {
        fasting: "Low insulin → high glucagon → increased β-oxidation",
        diabetes: "Insulin deficiency/resistance → same pathway",
        ketoacidosis: "Excess production → metabolic acidosis"
      }
    },

    cholesterolMetabolism: {
      name: "Cholesterol Metabolism",
      location: "Cytosol, ER",
      
      synthesis: {
        rateLimit: "HMG-CoA Reductase",
        latex: "HMG\\text{-}CoA \\xrightarrow{HMG\\text{-}CoA Reductase} Mevalonate",
        regulation: "Inhibited by statins, cholesterol; Activated by insulin",
        evidence: "established"
      },

      lipoproteins: {
        chylomicrons: "Dietary fat transport (intestine → tissues)",
        vldl: "Liver → peripheral tissues",
        ldl: "Cholesterol delivery",
        hdl: "Reverse cholesterol transport"
      }
    }
  },

  // =========================================================================
  // AMINO ACID METABOLISM
  // =========================================================================
  aminoAcidMetabolism: {
    name: "Amino Acid Metabolism",
    description: "Protein breakdown, nitrogen disposal, amino acid interconversion",

    transamination: {
      name: "Transamination",
      description: "Transfer of amino groups between amino acids and keto acids",
      
      generalEquation: {
        latex: "\\alpha\\text{-amino acid}_1 + \\alpha\\text{-keto acid}_2 \\rightleftharpoons \\alpha\\text{-keto acid}_1 + \\alpha\\text{-amino acid}_2",
        cofactor: "Pyridoxal Phosphate (PLP, B6)",
        evidence: "established"
      },

      keyReactions: [
        {
          name: "ALT (Alanine Aminotransferase)",
          latex: "Alanine + \\alpha\\text{-KG} \\rightleftharpoons Pyruvate + Glutamate",
          clinicalUse: "Liver function marker"
        },
        {
          name: "AST (Aspartate Aminotransferase)",
          latex: "Aspartate + \\alpha\\text{-KG} \\rightleftharpoons OAA + Glutamate",
          clinicalUse: "Liver/heart damage marker"
        }
      ]
    },

    ureaCycle: {
      name: "Urea Cycle",
      location: "Liver (mitochondria + cytosol)",
      description: "Disposal of nitrogen from amino acid catabolism",
      
      netEquation: {
        latex: "NH_4^+ + CO_2 + Aspartate + 3ATP \\rightarrow Urea + Fumarate + 2ADP + 2P_i + AMP + PP_i",
        evidence: "established"
      },

      steps: [
        {
          number: 1,
          name: "Carbamoyl Phosphate Synthetase I",
          location: "Mitochondria",
          latex: "NH_4^+ + CO_2 + 2ATP \\rightarrow Carbamoyl\\text{-}P + 2ADP + P_i",
          regulation: "COMMITTED STEP - Activated by N-acetylglutamate"
        },
        {
          number: 2,
          name: "Ornithine Transcarbamoylase",
          location: "Mitochondria",
          latex: "Carbamoyl\\text{-}P + Ornithine \\rightarrow Citrulline + P_i"
        },
        {
          number: 3,
          name: "Argininosuccinate Synthetase",
          location: "Cytosol",
          latex: "Citrulline + Aspartate + ATP \\rightarrow Argininosuccinate + AMP + PP_i"
        },
        {
          number: 4,
          name: "Argininosuccinate Lyase",
          location: "Cytosol",
          latex: "Argininosuccinate \\rightarrow Arginine + Fumarate"
        },
        {
          number: 5,
          name: "Arginase",
          location: "Cytosol",
          latex: "Arginine + H_2O \\rightarrow Ornithine + Urea"
        }
      ],

      disorders: {
        hyperammonemia: "Elevated NH₄⁺ from cycle defects",
        treatment: "Low protein diet, nitrogen scavengers"
      }
    },

    aminoAcidCategories: {
      glucogenic: ["Ala", "Arg", "Asn", "Asp", "Cys", "Gln", "Glu", "Gly", "His", "Met", "Pro", "Ser", "Val"],
      ketogenic: ["Leu", "Lys"],
      both: ["Ile", "Phe", "Thr", "Trp", "Tyr"],
      essential: ["His", "Ile", "Leu", "Lys", "Met", "Phe", "Thr", "Trp", "Val"],
      nonessential: ["Ala", "Arg", "Asn", "Asp", "Cys", "Gln", "Glu", "Gly", "Pro", "Ser", "Tyr"]
    }
  },

  // =========================================================================
  // NUCLEOTIDE METABOLISM
  // =========================================================================
  nucleotideMetabolism: {
    name: "Nucleotide Metabolism",
    description: "Synthesis and degradation of purines and pyrimidines",

    purineSynthesis: {
      name: "De Novo Purine Synthesis",
      precursors: ["Glutamine", "Glycine", "Aspartate", "CO₂", "N¹⁰-formyl-THF"],
      rateLimit: "PRPP synthetase, Glutamine-PRPP amidotransferase",
      product: "IMP → AMP or GMP"
    },

    pyrimidineSynthesis: {
      name: "De Novo Pyrimidine Synthesis",
      precursors: ["Glutamine", "Aspartate", "CO₂"],
      rateLimit: "Carbamoyl phosphate synthetase II",
      product: "UMP → CTP or TMP"
    },

    degradation: {
      purines: {
        pathway: "AMP/GMP → Xanthine → Uric acid",
        enzyme: "Xanthine oxidase",
        disorder: "Gout (uric acid accumulation)"
      },
      pyrimidines: {
        pathway: "Degraded to CO₂, NH₃, β-alanine/β-aminoisobutyrate"
      }
    }
  },

  // =========================================================================
  // SIGNAL TRANSDUCTION
  // =========================================================================
  signalTransduction: {
    name: "Signal Transduction Pathways",
    description: "How cells respond to external signals",

    gProteinCoupled: {
      name: "G-Protein Coupled Receptors (GPCR)",
      mechanism: "Receptor → G-protein → Effector → Second messenger",
      
      cAMPPathway: {
        stimulus: "Hormone binding (e.g., glucagon, epinephrine)",
        steps: [
          "Hormone → GPCR → Gαs activation",
          "Gαs activates adenylyl cyclase",
          "ATP → cAMP",
          "cAMP activates PKA",
          "PKA phosphorylates target proteins"
        ],
        equation: {
          latex: "ATP \\xrightarrow{Adenylyl Cyclase} cAMP + PP_i",
          evidence: "established"
        },
        termination: "Phosphodiesterase: cAMP → AMP"
      },

      ip3_dag_pathway: {
        stimulus: "Hormone binding (e.g., vasopressin, angiotensin II)",
        steps: [
          "Hormone → GPCR → Gαq activation",
          "Gαq activates phospholipase C",
          "PIP₂ → IP₃ + DAG",
          "IP₃ releases Ca²⁺ from ER",
          "DAG activates PKC"
        ]
      }
    },

    receptorTyrosineKinase: {
      name: "Receptor Tyrosine Kinases (RTK)",
      examples: ["Insulin receptor", "EGF receptor", "PDGF receptor"],
      mechanism: "Ligand → Dimerization → Autophosphorylation → Downstream signaling",
      
      pathways: {
        ras_mapk: {
          name: "Ras-MAPK Pathway",
          steps: ["RTK → Grb2 → SOS → Ras → Raf → MEK → ERK"],
          function: "Cell proliferation, differentiation"
        },
        pi3k_akt: {
          name: "PI3K-Akt Pathway",
          steps: ["RTK → PI3K → PIP₃ → Akt activation"],
          function: "Cell survival, metabolism, growth"
        }
      }
    },

    insulinSignaling: {
      name: "Insulin Signaling Pathway",
      description: "Key metabolic regulation",
      
      steps: [
        "Insulin binds insulin receptor (IR)",
        "IR autophosphorylation",
        "IRS-1/2 phosphorylation",
        "PI3K activation → PIP₃ generation",
        "Akt/PKB activation",
        "GLUT4 translocation (muscle, adipose)",
        "Glycogen synthase activation",
        "FOXO inhibition (gluconeogenesis ↓)"
      ],

      metabolicEffects: {
        glucose_uptake: "↑ GLUT4 translocation",
        glycogen_synthesis: "↑ Glycogen synthase",
        lipogenesis: "↑ ACC, FAS",
        gluconeogenesis: "↓ PEPCK, G6Pase",
        protein_synthesis: "↑ mTOR pathway"
      }
    }
  },

  // =========================================================================
  // OXYGEN TRANSPORT & UTILIZATION
  // =========================================================================
  oxygenPhysiology: {
    name: "Oxygen Transport & Utilization",
    
    hemoglobinOxygenBinding: {
      name: "Hemoglobin-Oxygen Binding",
      
      hillEquation: {
        latex: "Y = \\frac{P_{O_2}^n}{P_{50}^n + P_{O_2}^n}",
        variables: {
          Y: "Fractional saturation",
          P_O2: "Partial pressure of oxygen",
          P_50: "P_O2 at 50% saturation (~27 mmHg)",
          n: "Hill coefficient (~2.8)"
        },
        evidence: "established"
      },

      oxygenContent: {
        latex: "C_{O_2} = (1.34 \\times Hb \\times S_{O_2}) + (0.003 \\times P_{O_2})",
        units: "mL O₂/dL blood",
        evidence: "established"
      },

      bohrEffect: {
        description: "↓pH or ↑CO₂ decreases O₂ affinity (right shift)",
        latex: "P_{50,adj} = P_{50} \\times 10^{0.48(pH_0 - pH)}",
        evidence: "established"
      },

      modifiers: {
        right_shift: ["↑H⁺", "↑CO₂", "↑2,3-BPG", "↑Temperature"],
        left_shift: ["↓H⁺", "↓CO₂", "↓2,3-BPG", "↓Temperature", "CO", "Met-Hb", "Fetal Hb"]
      }
    },

    tissueOxygenExtraction: {
      latex: "O_2ER = \\frac{C_aO_2 - C_vO_2}{C_aO_2} \\times 100\\%",
      normal: "25%",
      maximum: "~70-75% (during maximal exercise)"
    },

    oxygenDelivery: {
      latex: "DO_2 = CO \\times C_aO_2 \\times 10",
      normal: "~1000 mL O₂/min",
      consumption: "VO₂ ~250 mL O₂/min at rest"
    }
  },

  // =========================================================================
  // ACID-BASE PHYSIOLOGY
  // =========================================================================
  acidBasePhysiology: {
    name: "Acid-Base Physiology",
    
    hendersonHasselbalch: {
      latex: "pH = pK_a + \\log\\frac{[HCO_3^-]}{[CO_2]}",
      normal: {
        pH: 7.4,
        HCO3: "24 mEq/L",
        pCO2: "40 mmHg"
      },
      evidence: "established"
    },

    bufferSystems: {
      bicarbonate: {
        latex: "CO_2 + H_2O \\rightleftharpoons H_2CO_3 \\rightleftharpoons H^+ + HCO_3^-",
        importance: "Primary ECF buffer"
      },
      hemoglobin: "Major intracellular buffer",
      phosphate: "Important in urine",
      proteins: "Intracellular buffering"
    },

    compensation: {
      metabolic_acidosis: "Respiratory compensation: ↓pCO₂ (hyperventilation)",
      metabolic_alkalosis: "Respiratory compensation: ↑pCO₂ (hypoventilation)",
      respiratory_acidosis: "Renal compensation: ↑HCO₃⁻ retention",
      respiratory_alkalosis: "Renal compensation: ↓HCO₃⁻ retention"
    },

    winterFormula: {
      latex: "Expected\\ pCO_2 = 1.5 \\times [HCO_3^-] + 8 \\pm 2",
      use: "Check respiratory compensation in metabolic acidosis",
      evidence: "established"
    },

    anionGap: {
      latex: "AG = [Na^+] - [Cl^-] - [HCO_3^-]",
      normal: "8-12 mEq/L",
      elevated: "MUDPILES: Methanol, Uremia, DKA, Propylene glycol, INH/Iron, Lactic acidosis, Ethylene glycol, Salicylates"
    }
  },

  // =========================================================================
  // ELECTROLYTE HOMEOSTASIS  
  // =========================================================================
  electrolyteHomeostasis: {
    name: "Electrolyte Homeostasis",

    sodium: {
      normal: "135-145 mEq/L",
      regulation: ["ADH", "Aldosterone", "ANP"],
      osmolality: {
        latex: "Osm = 2[Na^+] + \\frac{Glucose}{18} + \\frac{BUN}{2.8}",
        normal: "285-295 mOsm/kg"
      }
    },

    potassium: {
      normal: "3.5-5.0 mEq/L",
      regulation: ["Aldosterone", "Insulin", "Catecholamines", "pH"],
      nernstEquation: {
        latex: "E_K = \\frac{RT}{zF}\\ln\\frac{[K^+]_o}{[K^+]_i} \\approx -90\\ mV",
        evidence: "established"
      }
    },

    calcium: {
      total: "8.5-10.5 mg/dL",
      ionized: "4.5-5.5 mg/dL",
      regulation: ["PTH", "Vitamin D", "Calcitonin"],
      corrected: {
        latex: "Ca_{corrected} = Ca_{measured} + 0.8 \\times (4 - Albumin)",
        evidence: "established"
      }
    }
  },

  // =========================================================================
  // INFLAMMATORY SIGNALING CASCADES
  // =========================================================================
  inflammatoryPathways: {
    name: "Inflammatory Signaling",
    description: "Immune response and inflammatory cascades - critical in disease pathophysiology",
    
    nfkbPathway: {
      name: "NF-κB Signaling Pathway",
      description: "Master regulator of inflammation and immune response",
      
      components: {
        receptors: ["TLR4", "TNFR1", "IL-1R"],
        adaptors: ["MyD88", "TRAF6", "TRADD"],
        kinases: ["IKKα", "IKKβ", "IKKγ (NEMO)"],
        inhibitors: ["IκBα", "IκBβ"],
        transcriptionFactor: "NF-κB (p65/p50)"
      },
      
      activationSequence: [
        { step: 1, event: "Ligand binding (LPS, TNF-α, IL-1β)", latex: "L + R \\rightarrow LR^*" },
        { step: 2, event: "Adaptor recruitment", latex: "LR^* + MyD88 \\rightarrow Complex" },
        { step: 3, event: "IKK complex activation", latex: "IKK_{inactive} \\xrightarrow{phosphorylation} IKK_{active}" },
        { step: 4, event: "IκB phosphorylation", latex: "I\\kappa B + IKK \\rightarrow pI\\kappa B" },
        { step: 5, event: "IκB ubiquitination and degradation", latex: "pI\\kappa B \\xrightarrow{26S\\ proteasome} degraded" },
        { step: 6, event: "NF-κB nuclear translocation", latex: "NF\\kappa B_{cytoplasm} \\rightarrow NF\\kappa B_{nucleus}" },
        { step: 7, event: "Gene transcription", latex: "NF\\kappa B + DNA \\rightarrow mRNA_{inflammatory}" }
      ],
      
      targetGenes: {
        cytokines: ["IL-1β", "IL-6", "IL-8", "TNF-α"],
        chemokines: ["MCP-1", "RANTES"],
        adhesionMolecules: ["ICAM-1", "VCAM-1", "E-selectin"],
        enzymes: ["iNOS", "COX-2", "MMP-9"],
        antiApoptotic: ["Bcl-2", "Bcl-xL", "c-IAP1/2"]
      },
      
      mathematicalModel: {
        latex: "\\frac{d[NF\\kappa B_n]}{dt} = k_{trans}[NF\\kappa B_c] \\cdot f(IKK) - k_{exp}[NF\\kappa B_n] - k_{bind}[NF\\kappa B_n][I\\kappa B_n]",
        description: "Nuclear NF-κB dynamics",
        evidence: "established"
      },
      
      clinicalRelevance: {
        diseases: ["Sepsis", "Rheumatoid arthritis", "IBD", "Atherosclerosis", "Cancer"],
        therapeuticTargets: ["IKK inhibitors", "Proteasome inhibitors", "Glucocorticoids"]
      }
    },
    
    jak_statPathway: {
      name: "JAK-STAT Signaling",
      description: "Cytokine signaling pathway for immune regulation",
      
      components: {
        receptors: ["IL-6R", "IFN-γR", "IL-4R", "EPO-R"],
        kinases: ["JAK1", "JAK2", "JAK3", "TYK2"],
        transcriptionFactors: ["STAT1", "STAT3", "STAT5", "STAT6"]
      },
      
      mechanism: [
        { step: 1, event: "Cytokine binding", latex: "Cytokine + Receptor \\rightarrow Complex" },
        { step: 2, event: "JAK activation", latex: "JAK_{inactive} \\xrightarrow{trans-phosphorylation} JAK_{active}" },
        { step: 3, event: "Receptor phosphorylation", latex: "Receptor + JAK^* \\rightarrow pReceptor" },
        { step: 4, event: "STAT recruitment", latex: "STAT + pReceptor \\rightarrow STAT_{bound}" },
        { step: 5, event: "STAT phosphorylation", latex: "STAT + JAK^* \\rightarrow pSTAT" },
        { step: 6, event: "STAT dimerization", latex: "2 pSTAT \\rightarrow (pSTAT)_2" },
        { step: 7, event: "Nuclear translocation", latex: "(pSTAT)_2 \\rightarrow Nucleus" }
      ],
      
      clinicalRelevance: {
        diseases: ["Myeloproliferative neoplasms (JAK2 V617F)", "Autoimmune diseases", "Cancer"],
        therapeuticTargets: ["JAK inhibitors (ruxolitinib, tofacitinib)"]
      }
    },
    
    inflammasome: {
      name: "NLRP3 Inflammasome",
      description: "Cytosolic multiprotein complex activating inflammatory caspases",
      
      components: {
        sensor: "NLRP3",
        adaptor: "ASC (PYCARD)",
        effector: "Caspase-1"
      },
      
      triggers: ["ATP", "Uric acid crystals", "Cholesterol crystals", "Mitochondrial ROS", "K+ efflux"],
      
      products: {
        cytokines: ["IL-1β (pro → active)", "IL-18 (pro → active)"],
        cellDeath: "Pyroptosis (GSDMD pore formation)"
      },
      
      equation: {
        latex: "NLRP3 + ASC + Caspase1 \\rightarrow Inflammasome \\xrightarrow{activation} IL1\\beta_{active} + IL18_{active}",
        evidence: "established"
      },
      
      clinicalRelevance: {
        diseases: ["Gout", "Atherosclerosis", "Type 2 DM", "Alzheimer's", "CAPS syndromes"],
        therapeuticTargets: ["IL-1 blockers (anakinra, canakinumab)", "Colchicine"]
      }
    },
    
    cytokineStorm: {
      name: "Cytokine Storm/CRS",
      description: "Hyperinflammatory state with massive cytokine release",
      
      keyCytokines: {
        proInflammatory: {
          tnfa: { name: "TNF-α", sources: ["Macrophages", "T cells"], effects: ["Fever", "Shock", "Apoptosis"] },
          il1b: { name: "IL-1β", sources: ["Monocytes", "Macrophages"], effects: ["Fever", "Inflammation"] },
          il6: { name: "IL-6", sources: ["Many cells"], effects: ["Acute phase response", "CRP induction"] },
          ifng: { name: "IFN-γ", sources: ["T cells", "NK cells"], effects: ["Macrophage activation"] }
        },
        antiInflammatory: {
          il10: { name: "IL-10", effects: ["Suppresses inflammation", "Regulatory"] },
          tgfb: { name: "TGF-β", effects: ["Immunosuppression", "Fibrosis"] }
        }
      },
      
      mathematicalModel: {
        latex: "\\frac{d[IL6]}{dt} = k_{prod} \\cdot f(TNF\\alpha, IL1\\beta) - k_{clear}[IL6]",
        cascadeAmplification: "\\frac{d[Response]}{dt} = k_{amplify}[Cytokines]^n - k_{regulate}",
        evidence: "novel"
      }
    }
  },

  // =========================================================================
  // APOPTOSIS (PROGRAMMED CELL DEATH)
  // =========================================================================
  apoptosisPathways: {
    name: "Apoptosis Signaling",
    description: "Programmed cell death pathways - balance between survival and death",
    
    intrinsicPathway: {
      name: "Intrinsic (Mitochondrial) Pathway",
      description: "Activated by internal cellular stress",
      
      triggers: ["DNA damage", "Oxidative stress", "ER stress", "Growth factor withdrawal"],
      
      regulators: {
        proApoptotic: {
          effectors: ["Bax", "Bak"],
          bhOnly: ["Bid", "Bim", "Bad", "PUMA", "NOXA"],
          function: "Promote MOMP (mitochondrial outer membrane permeabilization)"
        },
        antiApoptotic: {
          members: ["Bcl-2", "Bcl-xL", "Mcl-1"],
          function: "Inhibit Bax/Bak oligomerization"
        }
      },
      
      sequence: [
        { step: 1, event: "Stress signal activates BH3-only proteins", latex: "Stress \\rightarrow BH3_{only}" },
        { step: 2, event: "BH3 proteins neutralize anti-apoptotic Bcl-2", latex: "BH3 + Bcl2 \\rightarrow BH3:Bcl2" },
        { step: 3, event: "Bax/Bak activation and oligomerization", latex: "Bax/Bak \\rightarrow (Bax/Bak)_n" },
        { step: 4, event: "MOMP - Cytochrome c release", latex: "CytC_{mito} \\rightarrow CytC_{cytosol}" },
        { step: 5, event: "Apoptosome formation", latex: "CytC + Apaf1 + Caspase9 \\rightarrow Apoptosome" },
        { step: 6, event: "Caspase-9 activation", latex: "Caspase9_{pro} \\rightarrow Caspase9_{active}" },
        { step: 7, event: "Executioner caspase activation", latex: "Caspase3/7_{pro} \\xrightarrow{Casp9} Caspase3/7_{active}" },
        { step: 8, event: "Substrate cleavage → Cell death", latex: "Substrates \\xrightarrow{Casp3/7} Cell\\ Death" }
      ],
      
      mathematicalModel: {
        latex: "\\frac{d[Caspase3^*]}{dt} = k_{act}[Apoptosome] - k_{inh}[XIAP][Caspase3^*]",
        evidence: "established"
      }
    },
    
    extrinsicPathway: {
      name: "Extrinsic (Death Receptor) Pathway",
      description: "Activated by external death ligands",
      
      receptors: {
        tnfr1: { ligand: "TNF-α", adaptor: "TRADD → FADD" },
        fas: { ligand: "FasL (CD95L)", adaptor: "FADD" },
        trailR: { ligand: "TRAIL", adaptor: "FADD" }
      },
      
      sequence: [
        { step: 1, event: "Death ligand binding", latex: "FasL + Fas \\rightarrow Fas_3" },
        { step: 2, event: "DISC formation", latex: "Fas_3 + FADD + Caspase8 \\rightarrow DISC" },
        { step: 3, event: "Caspase-8 activation", latex: "Caspase8_{pro} \\rightarrow Caspase8_{active}" },
        { step: 4, event: "Direct executioner activation OR Bid cleavage", latex: "Caspase8 \\rightarrow Caspase3\\ OR\\ tBid" }
      ],
      
      typeIvsII: {
        typeI: "High caspase-8, direct caspase-3 activation (hepatocytes)",
        typeII: "Low caspase-8, requires mitochondrial amplification via Bid (most cells)"
      }
    },
    
    caspaseCascade: {
      name: "Caspase Cascade",
      description: "Proteolytic cascade executing apoptosis",
      
      initiators: ["Caspase-8", "Caspase-9", "Caspase-10"],
      executioners: ["Caspase-3", "Caspase-6", "Caspase-7"],
      
      substrates: {
        dnaRepair: ["PARP", "DNA-PKcs"],
        nuclear: ["Lamin A/C", "Nuclear pore proteins"],
        cytoskeletal: ["Actin", "Fodrin", "Gelsolin"],
        cellCycle: ["Rb", "p27"],
        survival: ["Bcl-2", "Bid"]
      },
      
      amplificationLoop: {
        latex: "Caspase3 + Caspase9_{pro} \\rightarrow Caspase9_{active} \\rightarrow more\\ Caspase3",
        evidence: "established"
      }
    },
    
    apoptosisVsNecrosis: {
      apoptosis: {
        features: ["ATP-dependent", "Cell shrinkage", "Chromatin condensation", "Apoptotic bodies", "No inflammation"],
        detection: ["Annexin V+/PI-", "TUNEL", "Caspase activity"]
      },
      necrosis: {
        features: ["ATP-independent", "Cell swelling", "Membrane rupture", "Inflammation"],
        detection: ["PI+", "LDH release"]
      },
      necroptosis: {
        description: "Programmed necrosis via RIPK1/RIPK3/MLKL",
        features: ["Caspase-8 inhibited", "Inflammatory", "Regulated"]
      }
    },
    
    clinicalRelevance: {
      excessApoptosis: ["Neurodegeneration", "HIV/AIDS", "Ischemia-reperfusion"],
      deficientApoptosis: ["Cancer", "Autoimmunity"],
      therapeuticTargets: ["BH3 mimetics (venetoclax)", "Caspase inhibitors", "Death receptor agonists"]
    }
  },

  // =========================================================================
  // COAGULATION CASCADE
  // =========================================================================
  coagulationCascade: {
    name: "Coagulation Cascade",
    description: "Blood clotting pathways - critical in cardiovascular disease",
    
    intrinsicPathway: {
      name: "Intrinsic Pathway (Contact Activation)",
      trigger: "Contact with negatively charged surfaces",
      factors: ["XII → XIIa", "XI → XIa", "IX → IXa", "VIII (cofactor)"],
      test: "aPTT (activated partial thromboplastin time)"
    },
    
    extrinsicPathway: {
      name: "Extrinsic Pathway (Tissue Factor)",
      trigger: "Tissue factor exposure from injury",
      factors: ["TF + VIIa complex", "X → Xa"],
      test: "PT/INR (prothrombin time)"
    },
    
    commonPathway: {
      sequence: [
        { step: 1, event: "Factor X activation", latex: "X \\xrightarrow{IXa/VIIIa\\ or\\ TF/VIIa} Xa" },
        { step: 2, event: "Prothrombinase complex", latex: "Xa + Va + Ca^{2+} + PL \\rightarrow Prothrombinase" },
        { step: 3, event: "Prothrombin → Thrombin", latex: "Prothrombin \\xrightarrow{Xa/Va} Thrombin" },
        { step: 4, event: "Fibrinogen → Fibrin", latex: "Fibrinogen \\xrightarrow{Thrombin} Fibrin" },
        { step: 5, event: "Fibrin crosslinking", latex: "Fibrin \\xrightarrow{XIIIa} Crosslinked\\ Fibrin" }
      ]
    },
    
    anticoagulantSystems: {
      antithrombin: {
        target: "Thrombin, Xa, IXa",
        potentiation: "Heparin (1000x enhancement)",
        latex: "AT + Thrombin \\xrightarrow{Heparin} AT:Thrombin_{inactive}"
      },
      proteinC: {
        activation: "Thrombin-thrombomodulin complex",
        targets: "Va, VIIIa inactivation",
        cofactor: "Protein S"
      },
      tfpi: {
        target: "TF-VIIa-Xa complex"
      }
    },
    
    fibrinolysis: {
      plasminogen: {
        activation: "tPA, uPA → Plasmin",
        latex: "Plasminogen \\xrightarrow{tPA} Plasmin"
      },
      plasmin: {
        action: "Fibrin degradation → FDPs, D-dimer",
        latex: "Fibrin \\xrightarrow{Plasmin} D-dimer + FDPs"
      },
      inhibitors: ["PAI-1", "α2-antiplasmin"]
    },
    
    clinicalRelevance: {
      thrombosis: ["DVT", "PE", "Stroke", "MI"],
      bleeding: ["Hemophilia A (VIII)", "Hemophilia B (IX)", "von Willebrand disease"],
      therapeutics: {
        anticoagulants: ["Heparin (AT potentiation)", "Warfarin (vitamin K antagonist)", "DOACs (Xa or thrombin inhibitors)"],
        antiplatelets: ["Aspirin (COX-1)", "P2Y12 inhibitors (clopidogrel)"],
        thrombolytics: ["tPA (alteplase)", "Tenecteplase"]
      }
    }
  }
};

export default BIOCHEMISTRY;
