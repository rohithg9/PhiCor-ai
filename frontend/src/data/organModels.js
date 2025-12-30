// Complete Multi-Scale Mathematical Model of the Human Body
// Each organ modeled at: Geometry → Structure → Physiology → Cellular levels

export const ORGAN_MODELS = {
  heart: {
    name: "Heart",
    icon: "❤️",
    category: "cardiovascular",
    
    // GEOMETRY & DIMENSIONS
    geometry: {
      title: "Geometry & Dimensions",
      parameters: [
        { id: "lv_edv", name: "LV End-Diastolic Volume", value: 120, unit: "mL", range: [70, 160], evidence: "established" },
        { id: "lv_esv", name: "LV End-Systolic Volume", value: 50, unit: "mL", range: [20, 70], evidence: "established" },
        { id: "rv_edv", name: "RV End-Diastolic Volume", value: 110, unit: "mL", range: [60, 150], evidence: "established" },
        { id: "rv_esv", name: "RV End-Systolic Volume", value: 40, unit: "mL", range: [15, 60], evidence: "established" },
        { id: "la_volume", name: "Left Atrial Volume", value: 28, unit: "mL", range: [18, 40], evidence: "established" },
        { id: "ra_volume", name: "Right Atrial Volume", value: 25, unit: "mL", range: [15, 35], evidence: "established" },
        { id: "lv_wall_thickness", name: "LV Wall Thickness", value: 10, unit: "mm", range: [6, 12], evidence: "established" },
        { id: "rv_wall_thickness", name: "RV Wall Thickness", value: 4, unit: "mm", range: [2, 5], evidence: "established" },
        { id: "ivs_thickness", name: "Interventricular Septum", value: 10, unit: "mm", range: [6, 12], evidence: "established" },
        { id: "lv_mass", name: "LV Mass", value: 150, unit: "g", range: [100, 200], evidence: "established" },
        { id: "lv_length", name: "LV Long Axis", value: 90, unit: "mm", range: [70, 100], evidence: "established" },
        { id: "aortic_root", name: "Aortic Root Diameter", value: 32, unit: "mm", range: [26, 38], evidence: "established" },
      ],
      equations: [
        { 
          id: "lv_mass_calc", 
          name: "LV Mass (ASE)", 
          latex: "M_{LV} = 0.8 \\times 1.04 \\times [(IVS + LVID + PWT)^3 - LVID^3] + 0.6",
          description: "LV mass from linear dimensions",
          evidence: "established",
          source: "ASE Guidelines 2015"
        },
        {
          id: "sphericity_index",
          name: "Sphericity Index",
          latex: "SI = \\frac{V_{ED}^{2/3}}{L_{long} \\times L_{short}}",
          description: "Deviation from normal ellipsoid shape (↑ in remodeling)",
          evidence: "novel",
          source: "Derived from geometric principles"
        },
        {
          id: "relative_wall_thickness",
          name: "Relative Wall Thickness",
          latex: "RWT = \\frac{2 \\times PWT}{LVID_d}",
          description: "Concentric (>0.42) vs eccentric (<0.42) geometry",
          evidence: "established",
          source: "ASE Guidelines"
        }
      ]
    },

    // PRESSURES & GRADIENTS
    pressures: {
      title: "Pressures & Gradients",
      parameters: [
        { id: "lv_sys_p", name: "LV Systolic Pressure", value: 120, unit: "mmHg", range: [90, 140], evidence: "established" },
        { id: "lv_edp", name: "LV End-Diastolic Pressure", value: 12, unit: "mmHg", range: [5, 16], evidence: "established" },
        { id: "rv_sys_p", name: "RV Systolic Pressure", value: 25, unit: "mmHg", range: [15, 30], evidence: "established" },
        { id: "rv_edp", name: "RV End-Diastolic Pressure", value: 5, unit: "mmHg", range: [2, 8], evidence: "established" },
        { id: "la_pressure", name: "LA Pressure (Mean)", value: 8, unit: "mmHg", range: [4, 12], evidence: "established" },
        { id: "ra_pressure", name: "RA Pressure (Mean)", value: 5, unit: "mmHg", range: [2, 8], evidence: "established" },
        { id: "pa_sys", name: "PA Systolic Pressure", value: 25, unit: "mmHg", range: [15, 30], evidence: "established" },
        { id: "pa_dia", name: "PA Diastolic Pressure", value: 10, unit: "mmHg", range: [5, 15], evidence: "established" },
        { id: "pcwp", name: "Pulmonary Capillary Wedge", value: 10, unit: "mmHg", range: [6, 15], evidence: "established" },
        { id: "aortic_gradient", name: "Aortic Valve Gradient", value: 5, unit: "mmHg", range: [0, 10], evidence: "established" },
        { id: "mitral_gradient", name: "Mitral Valve Gradient", value: 2, unit: "mmHg", range: [0, 5], evidence: "established" },
      ],
      equations: [
        {
          id: "wall_stress",
          name: "Wall Stress (Laplace)",
          latex: "\\sigma = \\frac{P \\times r}{2h}",
          description: "Circumferential wall stress",
          evidence: "established",
          source: "Law of Laplace"
        },
        {
          id: "transmural_gradient",
          name: "Transmural Pressure Gradient",
          latex: "\\Delta P_{tm} = P_{cavity} - P_{pericardial}",
          description: "Pressure across myocardial wall",
          evidence: "established",
          source: "Basic physics"
        },
        {
          id: "dp_dt",
          name: "Rate of Pressure Rise",
          latex: "\\frac{dP}{dt}_{max} = \\frac{\\Delta P}{\\Delta t}_{isovolumic}",
          description: "Index of contractility (normal >1200 mmHg/s)",
          evidence: "established",
          source: "Cardiac catheterization"
        },
        {
          id: "pressure_volume_area",
          name: "Pressure-Volume Area",
          latex: "PVA = PE + SW = \\frac{1}{2} E_{es}(V_{es} - V_0)^2 + \\oint P \\, dV",
          description: "Total mechanical energy per beat (correlates with O₂ consumption)",
          evidence: "novel",
          source: "Suga-Sagawa framework extended"
        }
      ]
    },

    // STRUCTURE & TISSUE
    structure: {
      title: "Structure & Tissue",
      parameters: [
        { id: "myocyte_density", name: "Cardiomyocyte Density", value: 20, unit: "×10⁶/g", range: [15, 25], evidence: "established" },
        { id: "collagen_fraction", name: "Collagen Volume Fraction", value: 3, unit: "%", range: [1, 6], evidence: "established" },
        { id: "fibrosis_percent", name: "Fibrosis Percentage", value: 2, unit: "%", range: [0, 5], evidence: "established" },
        { id: "fiber_angle_endo", name: "Fiber Angle (Endocardium)", value: 60, unit: "°", range: [50, 80], evidence: "established" },
        { id: "fiber_angle_epi", name: "Fiber Angle (Epicardium)", value: -60, unit: "°", range: [-80, -50], evidence: "established" },
        { id: "capillary_density", name: "Capillary Density", value: 3000, unit: "/mm²", range: [2500, 3500], evidence: "established" },
        { id: "mitochondria_volume", name: "Mitochondrial Volume", value: 35, unit: "%", range: [30, 40], evidence: "established" },
      ],
      equations: [
        {
          id: "fiber_stress_distribution",
          name: "Fiber Stress Distribution",
          latex: "\\sigma_f(\\theta) = \\sigma_{max} \\cos^2(\\theta - \\theta_{fiber})",
          description: "Stress distribution based on fiber orientation",
          evidence: "novel",
          source: "Biomechanical modeling"
        },
        {
          id: "collagen_stiffness",
          name: "Collagen-Dependent Stiffness",
          latex: "E_{tissue} = E_{myocyte}(1-f_c) + E_{collagen} \\cdot f_c^{1.5}",
          description: "Tissue stiffness as function of collagen fraction",
          evidence: "novel",
          source: "Composite material theory"
        },
        {
          id: "oxygen_diffusion",
          name: "Oxygen Diffusion Capacity",
          latex: "D_{O2} = \\frac{n_{cap} \\cdot \\pi r_{cap}^2 \\cdot D_{tissue}}{d_{intercap}}",
          description: "O₂ supply capacity based on capillary geometry",
          evidence: "novel",
          source: "Krogh cylinder model extended"
        }
      ]
    },

    // PHYSIOLOGY & FUNCTION
    physiology: {
      title: "Physiology & Function",
      parameters: [
        { id: "ef", name: "Ejection Fraction", value: 60, unit: "%", range: [55, 70], evidence: "established" },
        { id: "stroke_volume", name: "Stroke Volume", value: 70, unit: "mL", range: [55, 100], evidence: "established" },
        { id: "cardiac_output", name: "Cardiac Output", value: 5.0, unit: "L/min", range: [4.0, 8.0], evidence: "established" },
        { id: "cardiac_index", name: "Cardiac Index", value: 2.8, unit: "L/min/m²", range: [2.5, 4.0], evidence: "established" },
        { id: "heart_rate", name: "Heart Rate", value: 70, unit: "bpm", range: [60, 100], evidence: "established" },
        { id: "e_a_ratio", name: "E/A Ratio", value: 1.2, unit: "", range: [0.8, 2.0], evidence: "established" },
        { id: "e_e_prime", name: "E/e' Ratio", value: 8, unit: "", range: [4, 14], evidence: "established" },
        { id: "gls", name: "Global Longitudinal Strain", value: -20, unit: "%", range: [-22, -18], evidence: "established" },
        { id: "tapse", name: "TAPSE", value: 20, unit: "mm", range: [16, 25], evidence: "established" },
      ],
      equations: [
        {
          id: "ejection_fraction",
          name: "Ejection Fraction",
          latex: "EF = \\frac{EDV - ESV}{EDV} \\times 100",
          description: "Percentage of blood ejected per beat",
          evidence: "established",
          source: "Basic definition"
        },
        {
          id: "cardiac_output",
          name: "Cardiac Output",
          latex: "CO = SV \\times HR = (EDV - ESV) \\times HR",
          description: "Blood volume pumped per minute",
          evidence: "established",
          source: "Basic definition"
        },
        {
          id: "frank_starling",
          name: "Frank-Starling Relationship",
          latex: "SV = SV_{max} \\cdot (1 - e^{-k \\cdot (EDV - V_0)})",
          description: "Preload-stroke volume relationship",
          evidence: "established",
          source: "Frank-Starling Law"
        },
        {
          id: "contractility_index",
          name: "Contractility Index (Novel)",
          latex: "CI = \\frac{dP/dt_{max}}{P_{developed}} \\times \\frac{V_{wall}}{M_{LV}}",
          description: "Normalized contractility accounting for geometry",
          evidence: "novel",
          source: "Derived to normalize for LV size"
        },
        {
          id: "myocardial_efficiency",
          name: "Myocardial Efficiency",
          latex: "\\eta = \\frac{SW}{MVO_2 \\times 20} = \\frac{\\oint P \\, dV}{MVO_2 \\times 20}",
          description: "Mechanical work per O₂ consumed",
          evidence: "novel",
          source: "Thermodynamic principles"
        },
        {
          id: "filling_pressure_estimate",
          name: "Filling Pressure Estimate",
          latex: "LVEDP \\approx 1.24 \\times (E/e') + 1.9",
          description: "Non-invasive estimate of filling pressure",
          evidence: "established",
          source: "Nagueh et al."
        }
      ]
    },

    // CELLULAR & MOLECULAR
    cellular: {
      title: "Cellular & Molecular",
      parameters: [
        { id: "sarcomere_length", name: "Sarcomere Length", value: 2.0, unit: "μm", range: [1.8, 2.4], evidence: "established" },
        { id: "calcium_transient", name: "Ca²⁺ Transient Peak", value: 1.0, unit: "μM", range: [0.5, 1.5], evidence: "established" },
        { id: "atp_concentration", name: "ATP Concentration", value: 5, unit: "mM", range: [4, 7], evidence: "established" },
        { id: "action_potential", name: "Action Potential Duration", value: 300, unit: "ms", range: [250, 350], evidence: "established" },
        { id: "conduction_velocity", name: "Conduction Velocity", value: 0.5, unit: "m/s", range: [0.3, 1.0], evidence: "established" },
        { id: "troponin_sensitivity", name: "Troponin Ca²⁺ Sensitivity", value: 1.0, unit: "relative", range: [0.5, 1.5], evidence: "established" },
        { id: "crossbridge_cycling", name: "Crossbridge Cycling Rate", value: 10, unit: "s⁻¹", range: [5, 20], evidence: "established" },
      ],
      equations: [
        {
          id: "force_calcium",
          name: "Force-Calcium Relationship",
          latex: "F = F_{max} \\cdot \\frac{[Ca^{2+}]^n}{[Ca^{2+}]^n + K_d^n}",
          description: "Hill equation for Ca²⁺-dependent force",
          evidence: "established",
          source: "Hill equation"
        },
        {
          id: "sarcomere_force",
          name: "Sarcomere Length-Force",
          latex: "F_{sarc} = F_{opt} \\cdot \\left(1 - \\left(\\frac{L - L_{opt}}{w}\\right)^2\\right)",
          description: "Force as function of sarcomere length",
          evidence: "established",
          source: "Gordon-Huxley-Julian"
        },
        {
          id: "atp_consumption",
          name: "ATP Consumption Rate",
          latex: "\\frac{d[ATP]}{dt} = -k_{cycle} \\cdot N_{bridges} \\cdot f_{active}",
          description: "ATP hydrolysis during contraction",
          evidence: "novel",
          source: "Crossbridge energetics model"
        },
        {
          id: "electrical_propagation",
          name: "Electrical Propagation",
          latex: "\\frac{\\partial V}{\\partial t} = D \\nabla^2 V - \\frac{I_{ion}}{C_m}",
          description: "Cable equation for action potential spread",
          evidence: "established",
          source: "Hodgkin-Huxley framework"
        }
      ]
    }
  },

  lungs: {
    name: "Lungs",
    icon: "🫁",
    category: "respiratory",
    
    geometry: {
      title: "Geometry & Dimensions",
      parameters: [
        { id: "total_lung_capacity", name: "Total Lung Capacity", value: 6000, unit: "mL", range: [5000, 7000], evidence: "established" },
        { id: "vital_capacity", name: "Vital Capacity", value: 4800, unit: "mL", range: [4000, 5500], evidence: "established" },
        { id: "residual_volume", name: "Residual Volume", value: 1200, unit: "mL", range: [1000, 1500], evidence: "established" },
        { id: "frc", name: "Functional Residual Capacity", value: 2400, unit: "mL", range: [2000, 3000], evidence: "established" },
        { id: "alveolar_surface", name: "Alveolar Surface Area", value: 70, unit: "m²", range: [50, 100], evidence: "established" },
        { id: "alveolar_count", name: "Number of Alveoli", value: 480, unit: "×10⁶", range: [400, 600], evidence: "established" },
        { id: "alveolar_diameter", name: "Alveolar Diameter", value: 250, unit: "μm", range: [200, 300], evidence: "established" },
        { id: "airway_generations", name: "Airway Generations", value: 23, unit: "", range: [23, 23], evidence: "established" },
        { id: "capillary_blood_volume", name: "Pulmonary Capillary Blood Volume", value: 70, unit: "mL", range: [60, 100], evidence: "established" },
      ],
      equations: [
        {
          id: "lung_compliance",
          name: "Lung Compliance",
          latex: "C_L = \\frac{\\Delta V}{\\Delta P} = \\frac{V_T}{P_{plat} - PEEP}",
          description: "Volume change per unit pressure",
          evidence: "established",
          source: "Respiratory mechanics"
        },
        {
          id: "alveolar_surface_tension",
          name: "Surface Tension Equation",
          latex: "P = \\frac{2\\gamma}{r} \\cdot (1 - \\alpha \\cdot surfactant)",
          description: "Laplace equation modified by surfactant",
          evidence: "novel",
          source: "Modified Laplace with surfactant term"
        },
        {
          id: "airway_resistance_model",
          name: "Total Airway Resistance",
          latex: "R_{total} = \\sum_{i=1}^{23} \\frac{8\\mu L_i}{\\pi r_i^4 \\cdot n_i}",
          description: "Poiseuille resistance across all generations",
          evidence: "novel",
          source: "Weibel model integration"
        }
      ]
    },

    pressures: {
      title: "Pressures & Gradients",
      parameters: [
        { id: "atmospheric", name: "Atmospheric Pressure", value: 760, unit: "mmHg", range: [760, 760], evidence: "established" },
        { id: "alveolar_pressure", name: "Alveolar Pressure (end-exp)", value: 0, unit: "cmH₂O", range: [-2, 2], evidence: "established" },
        { id: "pleural_pressure", name: "Pleural Pressure (end-exp)", value: -5, unit: "cmH₂O", range: [-8, -3], evidence: "established" },
        { id: "transpulmonary", name: "Transpulmonary Pressure", value: 5, unit: "cmH₂O", range: [3, 8], evidence: "established" },
        { id: "pao2", name: "Arterial PO₂", value: 95, unit: "mmHg", range: [80, 100], evidence: "established" },
        { id: "paco2", name: "Arterial PCO₂", value: 40, unit: "mmHg", range: [35, 45], evidence: "established" },
        { id: "pvo2", name: "Venous PO₂", value: 40, unit: "mmHg", range: [35, 45], evidence: "established" },
        { id: "pvco2", name: "Venous PCO₂", value: 46, unit: "mmHg", range: [42, 50], evidence: "established" },
      ],
      equations: [
        {
          id: "alveolar_gas_equation",
          name: "Alveolar Gas Equation",
          latex: "P_AO_2 = F_iO_2(P_B - P_{H2O}) - \\frac{P_ACO_2}{R}",
          description: "Alveolar oxygen tension calculation",
          evidence: "established",
          source: "Classic respiratory physiology"
        },
        {
          id: "aa_gradient",
          name: "A-a Gradient",
          latex: "A\\text{-}a = P_AO_2 - P_aO_2 = [F_iO_2(760-47) - \\frac{P_aCO_2}{0.8}] - P_aO_2",
          description: "Alveolar-arterial oxygen difference",
          evidence: "established",
          source: "Clinical calculation"
        },
        {
          id: "diffusion_capacity",
          name: "Diffusion Capacity",
          latex: "D_L = \\frac{V_{gas}}{P_A - P_c} = \\frac{A \\cdot D}{T} \\cdot (P_A - P_c)",
          description: "Fick's law for gas diffusion",
          evidence: "established",
          source: "Fick's law"
        }
      ]
    },

    structure: {
      title: "Structure & Tissue",
      parameters: [
        { id: "alveolar_wall_thickness", name: "Alveolar Wall Thickness", value: 0.5, unit: "μm", range: [0.2, 1.0], evidence: "established" },
        { id: "type1_cells", name: "Type I Pneumocytes", value: 95, unit: "% surface", range: [93, 97], evidence: "established" },
        { id: "type2_cells", name: "Type II Pneumocytes", value: 60, unit: "% count", range: [55, 65], evidence: "established" },
        { id: "surfactant_pool", name: "Surfactant Pool", value: 10, unit: "mg/kg", range: [5, 15], evidence: "established" },
        { id: "elastin_content", name: "Elastin Content", value: 30, unit: "%", range: [25, 35], evidence: "established" },
        { id: "collagen_content", name: "Collagen Content", value: 15, unit: "%", range: [10, 20], evidence: "established" },
      ],
      equations: [
        {
          id: "surfactant_dynamics",
          name: "Surfactant Dynamics",
          latex: "\\frac{dS}{dt} = k_{syn} \\cdot N_{typeII} - k_{clear} \\cdot S - k_{inact} \\cdot S \\cdot stress",
          description: "Surfactant production, clearance, inactivation",
          evidence: "novel",
          source: "Multi-compartment surfactant model"
        },
        {
          id: "lung_elastic_recoil",
          name: "Elastic Recoil Pressure",
          latex: "P_{el} = E_{elastin} \\cdot \\epsilon + E_{collagen} \\cdot \\epsilon^2 + P_{surface}",
          description: "Total elastic recoil from tissue and surface tension",
          evidence: "novel",
          source: "Composite tissue mechanics"
        }
      ]
    },

    physiology: {
      title: "Physiology & Function",
      parameters: [
        { id: "respiratory_rate", name: "Respiratory Rate", value: 14, unit: "/min", range: [12, 20], evidence: "established" },
        { id: "tidal_volume", name: "Tidal Volume", value: 500, unit: "mL", range: [400, 600], evidence: "established" },
        { id: "minute_ventilation", name: "Minute Ventilation", value: 7, unit: "L/min", range: [5, 10], evidence: "established" },
        { id: "alveolar_ventilation", name: "Alveolar Ventilation", value: 4.2, unit: "L/min", range: [3.5, 5.5], evidence: "established" },
        { id: "dead_space", name: "Dead Space", value: 150, unit: "mL", range: [120, 180], evidence: "established" },
        { id: "vq_ratio", name: "V/Q Ratio (overall)", value: 0.8, unit: "", range: [0.7, 1.0], evidence: "established" },
        { id: "spo2", name: "Oxygen Saturation", value: 98, unit: "%", range: [95, 100], evidence: "established" },
        { id: "fev1", name: "FEV₁", value: 3.5, unit: "L", range: [3.0, 4.5], evidence: "established" },
        { id: "fev1_fvc", name: "FEV₁/FVC Ratio", value: 80, unit: "%", range: [75, 85], evidence: "established" },
      ],
      equations: [
        {
          id: "minute_ventilation",
          name: "Minute Ventilation",
          latex: "V_E = V_T \\times RR",
          description: "Total ventilation per minute",
          evidence: "established",
          source: "Basic definition"
        },
        {
          id: "alveolar_ventilation",
          name: "Alveolar Ventilation",
          latex: "V_A = (V_T - V_D) \\times RR",
          description: "Effective gas exchange ventilation",
          evidence: "established",
          source: "Basic definition"
        },
        {
          id: "oxygen_content",
          name: "Oxygen Content",
          latex: "C_aO_2 = (1.34 \\times Hb \\times S_aO_2) + (0.003 \\times P_aO_2)",
          description: "Total oxygen in blood",
          evidence: "established",
          source: "Oxygen carrying capacity"
        },
        {
          id: "shunt_equation",
          name: "Shunt Fraction",
          latex: "\\frac{Q_s}{Q_t} = \\frac{C_cO_2 - C_aO_2}{C_cO_2 - C_vO_2}",
          description: "Proportion of blood bypassing ventilated alveoli",
          evidence: "established",
          source: "Berggren equation"
        },
        {
          id: "vq_mismatch_model",
          name: "V/Q Distribution Model",
          latex: "P_aO_2 = \\sum_{i=1}^{n} f_i \\cdot P_cO_2(V_i/Q_i)",
          description: "Arterial PO₂ from V/Q distribution",
          evidence: "novel",
          source: "Multi-compartment V/Q model"
        }
      ]
    },

    cellular: {
      title: "Cellular & Molecular",
      parameters: [
        { id: "hemoglobin", name: "Hemoglobin P50", value: 27, unit: "mmHg", range: [25, 29], evidence: "established" },
        { id: "dpg", name: "2,3-DPG Level", value: 5, unit: "mmol/L", range: [4, 6], evidence: "established" },
        { id: "carbonic_anhydrase", name: "Carbonic Anhydrase Activity", value: 1.0, unit: "relative", range: [0.8, 1.2], evidence: "established" },
      ],
      equations: [
        {
          id: "oxyhemoglobin_dissociation",
          name: "Oxyhemoglobin Dissociation",
          latex: "S_aO_2 = \\frac{P_O2^n}{P_{50}^n + P_O2^n}",
          description: "Hill equation for O₂-Hb binding",
          evidence: "established",
          source: "Hill equation"
        },
        {
          id: "bohr_effect",
          name: "Bohr Effect",
          latex: "P_{50,adjusted} = P_{50} \\times 10^{0.48(pH - 7.4)} \\times 10^{0.024(T - 37)}",
          description: "P50 shift with pH and temperature",
          evidence: "established",
          source: "Severinghaus equation"
        }
      ]
    }
  },

  kidneys: {
    name: "Kidneys",
    icon: "💜",
    category: "renal",
    
    geometry: {
      title: "Geometry & Dimensions",
      parameters: [
        { id: "kidney_length", name: "Kidney Length", value: 11, unit: "cm", range: [10, 12], evidence: "established" },
        { id: "kidney_width", name: "Kidney Width", value: 5, unit: "cm", range: [4, 6], evidence: "established" },
        { id: "kidney_weight", name: "Kidney Weight (each)", value: 150, unit: "g", range: [120, 180], evidence: "established" },
        { id: "nephron_count", name: "Nephron Count (per kidney)", value: 1000000, unit: "", range: [800000, 1200000], evidence: "established" },
        { id: "glomerular_diameter", name: "Glomerular Diameter", value: 200, unit: "μm", range: [150, 250], evidence: "established" },
        { id: "cortex_thickness", name: "Cortex Thickness", value: 10, unit: "mm", range: [8, 12], evidence: "established" },
        { id: "medulla_thickness", name: "Medulla Thickness", value: 15, unit: "mm", range: [12, 18], evidence: "established" },
        { id: "filtration_surface", name: "Filtration Surface Area", value: 1.5, unit: "m²", range: [1.0, 2.0], evidence: "established" },
      ],
      equations: [
        {
          id: "kidney_volume",
          name: "Kidney Volume (Ellipsoid)",
          latex: "V = \\frac{\\pi}{6} \\times L \\times W \\times D",
          description: "Kidney volume from dimensions",
          evidence: "established",
          source: "Geometric formula"
        },
        {
          id: "nephron_function_reserve",
          name: "Nephron Functional Reserve",
          latex: "GFR_{potential} = N_{nephron} \\times SNGFR_{max} \\times f_{functional}",
          description: "Total potential filtration from nephron count",
          evidence: "novel",
          source: "Functional nephron theory"
        }
      ]
    },

    pressures: {
      title: "Pressures & Gradients",
      parameters: [
        { id: "glomerular_cap_p", name: "Glomerular Capillary Pressure", value: 60, unit: "mmHg", range: [50, 70], evidence: "established" },
        { id: "bowman_p", name: "Bowman's Capsule Pressure", value: 18, unit: "mmHg", range: [15, 22], evidence: "established" },
        { id: "oncotic_p", name: "Glomerular Oncotic Pressure", value: 32, unit: "mmHg", range: [28, 36], evidence: "established" },
        { id: "net_filtration_p", name: "Net Filtration Pressure", value: 10, unit: "mmHg", range: [5, 15], evidence: "established" },
        { id: "renal_perfusion_p", name: "Renal Perfusion Pressure", value: 100, unit: "mmHg", range: [80, 120], evidence: "established" },
        { id: "tubular_pressure", name: "Tubular Fluid Pressure", value: 15, unit: "mmHg", range: [10, 20], evidence: "established" },
        { id: "medullary_osmolality", name: "Medullary Osmolality (max)", value: 1200, unit: "mOsm/kg", range: [900, 1400], evidence: "established" },
      ],
      equations: [
        {
          id: "net_filtration_pressure",
          name: "Net Filtration Pressure",
          latex: "P_{nf} = P_{GC} - P_{BC} - \\pi_{GC}",
          description: "Starling forces across glomerulus",
          evidence: "established",
          source: "Starling equation"
        },
        {
          id: "autoregulation",
          name: "Renal Autoregulation",
          latex: "RBF = \\frac{P_{renal} - P_{venous}}{R_{afferent} + R_{efferent}} \\times f_{auto}(MAP)",
          description: "Blood flow with autoregulation",
          evidence: "novel",
          source: "Myogenic + TGF mechanism model"
        },
        {
          id: "countercurrent_multiplier",
          name: "Countercurrent Multiplier",
          latex: "Osm(x) = Osm_{cortex} + \\frac{Osm_{max} - Osm_{cortex}}{1 + e^{-k(x-x_0)}}",
          description: "Medullary osmolality gradient",
          evidence: "novel",
          source: "Sigmoid approximation of gradient"
        }
      ]
    },

    physiology: {
      title: "Physiology & Function",
      parameters: [
        { id: "gfr", name: "GFR", value: 120, unit: "mL/min", range: [90, 140], evidence: "established" },
        { id: "rbf", name: "Renal Blood Flow", value: 1200, unit: "mL/min", range: [1000, 1400], evidence: "established" },
        { id: "rpf", name: "Renal Plasma Flow", value: 660, unit: "mL/min", range: [550, 750], evidence: "established" },
        { id: "filtration_fraction", name: "Filtration Fraction", value: 0.2, unit: "", range: [0.15, 0.25], evidence: "established" },
        { id: "urine_output", name: "Urine Output", value: 1.5, unit: "L/day", range: [0.8, 2.5], evidence: "established" },
        { id: "creatinine", name: "Serum Creatinine", value: 1.0, unit: "mg/dL", range: [0.7, 1.3], evidence: "established" },
        { id: "bun", name: "BUN", value: 15, unit: "mg/dL", range: [7, 20], evidence: "established" },
        { id: "sodium_excretion", name: "Sodium Excretion", value: 150, unit: "mEq/day", range: [100, 200], evidence: "established" },
      ],
      equations: [
        {
          id: "gfr_starling",
          name: "GFR (Starling)",
          latex: "GFR = K_f \\times P_{nf} = K_f \\times (P_{GC} - P_{BC} - \\pi_{GC})",
          description: "GFR from Starling forces",
          evidence: "established",
          source: "Starling equation"
        },
        {
          id: "filtration_fraction",
          name: "Filtration Fraction",
          latex: "FF = \\frac{GFR}{RPF}",
          description: "Fraction of plasma filtered",
          evidence: "established",
          source: "Basic definition"
        },
        {
          id: "creatinine_clearance",
          name: "Creatinine Clearance",
          latex: "CrCl = \\frac{U_{Cr} \\times V}{P_{Cr}}",
          description: "Classic clearance equation",
          evidence: "established",
          source: "Clearance definition"
        },
        {
          id: "cockroft_gault",
          name: "Cockcroft-Gault",
          latex: "CrCl = \\frac{(140-age) \\times weight}{72 \\times Cr} \\times 0.85_{(female)}",
          description: "Estimated CrCl from demographics",
          evidence: "established",
          source: "Cockcroft-Gault 1976"
        },
        {
          id: "tubular_reabsorption",
          name: "Tubular Reabsorption Model",
          latex: "R = R_{max} \\times \\frac{[S]}{K_m + [S]} \\times f_{flow}(GFR)",
          description: "Saturable reabsorption with flow dependence",
          evidence: "novel",
          source: "Michaelis-Menten + flow term"
        }
      ]
    },

    cellular: {
      title: "Cellular & Molecular",
      parameters: [
        { id: "podocyte_count", name: "Podocyte Count per Glomerulus", value: 500, unit: "", range: [400, 600], evidence: "established" },
        { id: "slit_diaphragm_width", name: "Slit Diaphragm Width", value: 40, unit: "nm", range: [35, 45], evidence: "established" },
        { id: "na_k_atpase", name: "Na⁺/K⁺-ATPase Activity", value: 1.0, unit: "relative", range: [0.8, 1.2], evidence: "established" },
        { id: "renin_activity", name: "Plasma Renin Activity", value: 1.5, unit: "ng/mL/hr", range: [0.5, 3.5], evidence: "established" },
        { id: "aldosterone", name: "Aldosterone Level", value: 10, unit: "ng/dL", range: [5, 20], evidence: "established" },
      ],
      equations: [
        {
          id: "glomerular_permeability",
          name: "Glomerular Permeability",
          latex: "P_s = P_0 \\times e^{-\\alpha \\cdot r_s / r_{pore}} \\times (1 - charge_{factor})",
          description: "Size and charge selectivity of filtration barrier",
          evidence: "novel",
          source: "Pore theory extended"
        },
        {
          id: "raas_activation",
          name: "RAAS Activation Model",
          latex: "Renin = R_0 \\times f(\\downarrow NaCl_{MD}) \\times f(\\downarrow P_{afferent}) \\times f(\\uparrow \\beta_1)",
          description: "Renin release from 3 stimuli",
          evidence: "novel",
          source: "Multi-input RAAS model"
        }
      ]
    }
  },

  liver: {
    name: "Liver",
    icon: "🔴",
    category: "hepatic",
    
    geometry: {
      title: "Geometry & Dimensions",
      parameters: [
        { id: "liver_weight", name: "Liver Weight", value: 1500, unit: "g", range: [1200, 1800], evidence: "established" },
        { id: "liver_volume", name: "Liver Volume", value: 1500, unit: "mL", range: [1200, 1800], evidence: "established" },
        { id: "hepatocyte_count", name: "Hepatocyte Count", value: 100, unit: "×10⁹", range: [80, 130], evidence: "established" },
        { id: "lobule_count", name: "Lobule Count", value: 1000000, unit: "", range: [500000, 1500000], evidence: "established" },
        { id: "sinusoid_length", name: "Sinusoid Length", value: 250, unit: "μm", range: [200, 300], evidence: "established" },
        { id: "sinusoid_diameter", name: "Sinusoid Diameter", value: 10, unit: "μm", range: [7, 15], evidence: "established" },
        { id: "bile_duct_length", name: "Common Bile Duct Length", value: 7, unit: "cm", range: [5, 9], evidence: "established" },
      ],
      equations: [
        {
          id: "liver_volume_bsa",
          name: "Liver Volume from BSA",
          latex: "V_{liver} = 706.2 \\times BSA + 2.4",
          description: "Standard liver volume estimation",
          evidence: "established",
          source: "CT volumetry studies"
        }
      ]
    },

    physiology: {
      title: "Physiology & Function",
      parameters: [
        { id: "hepatic_blood_flow", name: "Hepatic Blood Flow", value: 1500, unit: "mL/min", range: [1200, 1800], evidence: "established" },
        { id: "portal_flow", name: "Portal Vein Flow", value: 1000, unit: "mL/min", range: [800, 1200], evidence: "established" },
        { id: "hepatic_artery_flow", name: "Hepatic Artery Flow", value: 500, unit: "mL/min", range: [400, 600], evidence: "established" },
        { id: "bile_production", name: "Bile Production", value: 600, unit: "mL/day", range: [500, 1000], evidence: "established" },
        { id: "albumin_synthesis", name: "Albumin Synthesis", value: 12, unit: "g/day", range: [10, 15], evidence: "established" },
        { id: "alt", name: "ALT", value: 25, unit: "U/L", range: [7, 56], evidence: "established" },
        { id: "ast", name: "AST", value: 22, unit: "U/L", range: [8, 48], evidence: "established" },
        { id: "albumin", name: "Serum Albumin", value: 4.0, unit: "g/dL", range: [3.5, 5.0], evidence: "established" },
        { id: "bilirubin", name: "Total Bilirubin", value: 0.8, unit: "mg/dL", range: [0.1, 1.2], evidence: "established" },
        { id: "inr", name: "INR", value: 1.0, unit: "", range: [0.9, 1.1], evidence: "established" },
      ],
      equations: [
        {
          id: "hepatic_clearance",
          name: "Hepatic Clearance",
          latex: "Cl_H = Q_H \\times E = Q_H \\times \\frac{f_u \\cdot Cl_{int}}{Q_H + f_u \\cdot Cl_{int}}",
          description: "Well-stirred model of hepatic clearance",
          evidence: "established",
          source: "Rowland 1973"
        },
        {
          id: "extraction_ratio",
          name: "Extraction Ratio",
          latex: "E = \\frac{C_{in} - C_{out}}{C_{in}}",
          description: "Fraction of drug removed in single pass",
          evidence: "established",
          source: "Basic definition"
        },
        {
          id: "michaelis_menten",
          name: "Enzyme Kinetics",
          latex: "v = \\frac{V_{max} \\times [S]}{K_m + [S]}",
          description: "Saturable metabolism",
          evidence: "established",
          source: "Michaelis-Menten"
        },
        {
          id: "hepatic_reserve",
          name: "Hepatic Functional Reserve",
          latex: "HFR = \\frac{Cl_{measured}}{Cl_{max}} \\times \\frac{Albumin}{Albumin_0} \\times \\frac{INR_0}{INR}",
          description: "Composite liver function score",
          evidence: "novel",
          source: "Multi-parameter reserve model"
        },
        {
          id: "first_pass",
          name: "First Pass Effect",
          latex: "F = 1 - E = \\frac{Q_H}{Q_H + f_u \\cdot Cl_{int}}",
          description: "Bioavailability after first pass",
          evidence: "established",
          source: "Well-stirred model"
        }
      ]
    },

    cellular: {
      title: "Cellular & Molecular",
      parameters: [
        { id: "cyp3a4", name: "CYP3A4 Content", value: 30, unit: "% of CYP", range: [25, 40], evidence: "established" },
        { id: "cyp2d6", name: "CYP2D6 Content", value: 2, unit: "% of CYP", range: [1, 5], evidence: "established" },
        { id: "glycogen_stores", name: "Glycogen Stores", value: 100, unit: "g", range: [70, 120], evidence: "established" },
        { id: "kupffer_cells", name: "Kupffer Cell Fraction", value: 15, unit: "%", range: [10, 20], evidence: "established" },
      ],
      equations: [
        {
          id: "cyp_induction",
          name: "CYP Induction Model",
          latex: "V_{max,induced} = V_{max,0} \\times (1 + \\frac{I_{max} \\times [Inducer]}{EC_{50} + [Inducer]})",
          description: "Enzyme induction kinetics",
          evidence: "novel",
          source: "PXR-mediated induction model"
        },
        {
          id: "glycogen_dynamics",
          name: "Glycogen Dynamics",
          latex: "\\frac{dG}{dt} = k_{syn} \\times [Insulin] \\times [Glucose] - k_{glyc} \\times [Glucagon]",
          description: "Glycogen synthesis/breakdown balance",
          evidence: "novel",
          source: "Hormonal control model"
        }
      ]
    }
  },

  brain: {
    name: "Brain",
    icon: "🧠",
    category: "neurological",
    
    geometry: {
      title: "Geometry & Dimensions",
      parameters: [
        { id: "brain_weight", name: "Brain Weight", value: 1400, unit: "g", range: [1200, 1600], evidence: "established" },
        { id: "brain_volume", name: "Brain Volume", value: 1350, unit: "mL", range: [1100, 1500], evidence: "established" },
        { id: "neuron_count", name: "Neuron Count", value: 86, unit: "×10⁹", range: [80, 100], evidence: "established" },
        { id: "synapse_count", name: "Synapse Count", value: 100, unit: "×10¹²", range: [80, 150], evidence: "established" },
        { id: "csf_volume", name: "CSF Volume", value: 150, unit: "mL", range: [120, 180], evidence: "established" },
        { id: "gray_matter", name: "Gray Matter Volume", value: 600, unit: "mL", range: [500, 700], evidence: "established" },
        { id: "white_matter", name: "White Matter Volume", value: 500, unit: "mL", range: [400, 600], evidence: "established" },
        { id: "cortical_thickness", name: "Cortical Thickness", value: 2.5, unit: "mm", range: [2.0, 3.0], evidence: "established" },
      ],
      equations: [
        {
          id: "brain_volume_age",
          name: "Brain Volume with Age",
          latex: "V(age) = V_{max} \\times (1 - k_{atrophy} \\times (age - 25)_{+})",
          description: "Age-related volume decline after 25",
          evidence: "novel",
          source: "Cross-sectional MRI studies"
        }
      ]
    },

    pressures: {
      title: "Pressures & Gradients",
      parameters: [
        { id: "icp", name: "Intracranial Pressure", value: 10, unit: "mmHg", range: [5, 15], evidence: "established" },
        { id: "cpp", name: "Cerebral Perfusion Pressure", value: 80, unit: "mmHg", range: [60, 100], evidence: "established" },
        { id: "csf_pressure", name: "CSF Pressure", value: 12, unit: "cmH₂O", range: [8, 18], evidence: "established" },
        { id: "venous_pressure", name: "Cerebral Venous Pressure", value: 5, unit: "mmHg", range: [3, 8], evidence: "established" },
      ],
      equations: [
        {
          id: "cpp_equation",
          name: "Cerebral Perfusion Pressure",
          latex: "CPP = MAP - ICP",
          description: "Driving pressure for cerebral blood flow",
          evidence: "established",
          source: "Basic definition"
        },
        {
          id: "monro_kellie",
          name: "Monro-Kellie Doctrine",
          latex: "V_{brain} + V_{blood} + V_{CSF} = V_{skull} = constant",
          description: "Fixed intracranial volume",
          evidence: "established",
          source: "Classic neurophysiology"
        },
        {
          id: "icp_compliance",
          name: "ICP-Volume Relationship",
          latex: "ICP = ICP_0 \\times e^{(V - V_0)/PVI}",
          description: "Exponential pressure-volume curve",
          evidence: "established",
          source: "Marmarou model"
        }
      ]
    },

    physiology: {
      title: "Physiology & Function",
      parameters: [
        { id: "cbf", name: "Cerebral Blood Flow", value: 50, unit: "mL/100g/min", range: [40, 60], evidence: "established" },
        { id: "cmro2", name: "Cerebral O₂ Consumption", value: 3.5, unit: "mL/100g/min", range: [3.0, 4.0], evidence: "established" },
        { id: "glucose_consumption", name: "Glucose Consumption", value: 30, unit: "μmol/100g/min", range: [25, 35], evidence: "established" },
        { id: "csf_production", name: "CSF Production", value: 500, unit: "mL/day", range: [400, 600], evidence: "established" },
        { id: "body_temp", name: "Core Temperature", value: 37.0, unit: "°C", range: [36.5, 37.5], evidence: "established" },
      ],
      equations: [
        {
          id: "cbf_equation",
          name: "Cerebral Blood Flow",
          latex: "CBF = \\frac{CPP}{CVR}",
          description: "Flow from pressure and resistance",
          evidence: "established",
          source: "Ohm's law analog"
        },
        {
          id: "cbf_autoregulation",
          name: "CBF Autoregulation",
          latex: "CBF = CBF_0 \\times \\begin{cases} \\frac{CPP}{50} & CPP < 50 \\\\ 1 & 50 \\leq CPP \\leq 150 \\\\ 1 + 0.01(CPP-150) & CPP > 150 \\end{cases}",
          description: "Autoregulation plateau and failure",
          evidence: "novel",
          source: "Piecewise autoregulation model"
        },
        {
          id: "fick_brain",
          name: "Cerebral Oxygen Consumption",
          latex: "CMRO_2 = CBF \\times (C_aO_2 - C_vO_2)",
          description: "Fick principle for brain",
          evidence: "established",
          source: "Fick equation"
        },
        {
          id: "temperature_cbf",
          name: "Temperature Effect on Metabolism",
          latex: "CMRO_2(T) = CMRO_{2,37} \\times Q_{10}^{(T-37)/10}",
          description: "Q10 relationship (typically 2-3)",
          evidence: "established",
          source: "van 't Hoff equation"
        }
      ]
    },

    cellular: {
      title: "Cellular & Molecular",
      parameters: [
        { id: "resting_potential", name: "Resting Membrane Potential", value: -70, unit: "mV", range: [-80, -60], evidence: "established" },
        { id: "action_potential_amp", name: "Action Potential Amplitude", value: 100, unit: "mV", range: [90, 110], evidence: "established" },
        { id: "conduction_velocity_axon", name: "Axon Conduction Velocity", value: 50, unit: "m/s", range: [30, 100], evidence: "established" },
        { id: "glutamate", name: "Synaptic Glutamate", value: 1, unit: "mM", range: [0.5, 2], evidence: "established" },
        { id: "gaba", name: "Synaptic GABA", value: 0.5, unit: "mM", range: [0.2, 1], evidence: "established" },
      ],
      equations: [
        {
          id: "nernst",
          name: "Nernst Equation",
          latex: "E_{ion} = \\frac{RT}{zF} \\ln \\frac{[ion]_{out}}{[ion]_{in}}",
          description: "Equilibrium potential for ion",
          evidence: "established",
          source: "Nernst equation"
        },
        {
          id: "goldman",
          name: "Goldman Equation",
          latex: "V_m = \\frac{RT}{F} \\ln \\frac{P_K[K^+]_o + P_{Na}[Na^+]_o + P_{Cl}[Cl^-]_i}{P_K[K^+]_i + P_{Na}[Na^+]_i + P_{Cl}[Cl^-]_o}",
          description: "Membrane potential from ion permeabilities",
          evidence: "established",
          source: "Goldman-Hodgkin-Katz"
        },
        {
          id: "hodgkin_huxley",
          name: "Hodgkin-Huxley",
          latex: "C_m \\frac{dV}{dt} = -g_{Na}m^3h(V-E_{Na}) - g_Kn^4(V-E_K) - g_L(V-E_L) + I_{ext}",
          description: "Action potential generation",
          evidence: "established",
          source: "Hodgkin-Huxley 1952"
        }
      ]
    }
  },

  pancreas: {
    name: "Pancreas",
    icon: "🥢",
    category: "metabolic",
    
    geometry: {
      title: "Geometry & Dimensions",
      parameters: [
        { id: "pancreas_weight", name: "Pancreas Weight", value: 100, unit: "g", range: [70, 130], evidence: "established" },
        { id: "pancreas_length", name: "Pancreas Length", value: 15, unit: "cm", range: [12, 18], evidence: "established" },
        { id: "islet_count", name: "Islet Count", value: 1000000, unit: "", range: [500000, 1500000], evidence: "established" },
        { id: "beta_cell_mass", name: "β-Cell Mass", value: 1.5, unit: "g", range: [1, 2], evidence: "established" },
        { id: "islet_diameter", name: "Islet Diameter", value: 150, unit: "μm", range: [100, 200], evidence: "established" },
      ],
      equations: [
        {
          id: "beta_cell_function",
          name: "β-Cell Functional Capacity",
          latex: "Ins_{max} = k \\times M_{\\beta} \\times f_{viability} \\times f_{exhaustion}",
          description: "Maximum insulin secretion from β-cell mass",
          evidence: "novel",
          source: "Functional mass model"
        }
      ]
    },

    physiology: {
      title: "Physiology & Function",
      parameters: [
        { id: "fasting_glucose", name: "Fasting Glucose", value: 90, unit: "mg/dL", range: [70, 100], evidence: "established" },
        { id: "fasting_insulin", name: "Fasting Insulin", value: 10, unit: "μU/mL", range: [5, 20], evidence: "established" },
        { id: "hba1c", name: "HbA1c", value: 5.5, unit: "%", range: [4.5, 5.7], evidence: "established" },
        { id: "homa_ir", name: "HOMA-IR", value: 2.0, unit: "", range: [0.5, 2.5], evidence: "established" },
        { id: "homa_b", name: "HOMA-β", value: 100, unit: "%", range: [80, 200], evidence: "established" },
        { id: "insulin_secretion", name: "First Phase Insulin", value: 50, unit: "μU/mL", range: [30, 100], evidence: "established" },
        { id: "glucagon", name: "Fasting Glucagon", value: 70, unit: "pg/mL", range: [50, 100], evidence: "established" },
      ],
      equations: [
        {
          id: "homa_ir_calc",
          name: "HOMA-IR",
          latex: "HOMA\\text{-}IR = \\frac{Glucose \\times Insulin}{405}",
          description: "Insulin resistance index",
          evidence: "established",
          source: "Matthews et al. 1985"
        },
        {
          id: "homa_beta",
          name: "HOMA-β",
          latex: "HOMA\\text{-}\\beta = \\frac{360 \\times Insulin}{Glucose - 63}",
          description: "β-cell function index",
          evidence: "established",
          source: "Matthews et al. 1985"
        },
        {
          id: "bergman_glucose",
          name: "Glucose Dynamics (Bergman)",
          latex: "\\frac{dG}{dt} = -p_1(G - G_b) - X \\cdot G + R_a",
          description: "Glucose disappearance and appearance",
          evidence: "established",
          source: "Bergman 1981"
        },
        {
          id: "bergman_insulin_action",
          name: "Insulin Action (Bergman)",
          latex: "\\frac{dX}{dt} = -p_2 X + p_3(I - I_b)",
          description: "Remote insulin effect",
          evidence: "established",
          source: "Bergman 1981"
        },
        {
          id: "insulin_secretion_model",
          name: "Insulin Secretion Model",
          latex: "\\frac{dI}{dt} = \\gamma \\cdot \\max(0, G-h)^\\alpha - n \\cdot I",
          description: "Glucose-stimulated insulin secretion",
          evidence: "novel",
          source: "Modified minimal model"
        },
        {
          id: "disposition_index",
          name: "Disposition Index",
          latex: "DI = S_I \\times AIR_g = \\frac{\\text{Insulin Sensitivity} \\times \\text{Acute Insulin Response}}{1}",
          description: "β-cell compensation for insulin resistance",
          evidence: "established",
          source: "Bergman concept"
        }
      ]
    },

    cellular: {
      title: "Cellular & Molecular",
      parameters: [
        { id: "atp_adp_ratio", name: "ATP/ADP Ratio (β-cell)", value: 10, unit: "", range: [5, 15], evidence: "established" },
        { id: "katp_channels", name: "K-ATP Channel Activity", value: 1.0, unit: "relative", range: [0.5, 1.5], evidence: "established" },
        { id: "calcium_beta", name: "β-Cell [Ca²⁺]", value: 0.1, unit: "μM", range: [0.05, 0.2], evidence: "established" },
        { id: "glut2_expression", name: "GLUT2 Expression", value: 1.0, unit: "relative", range: [0.7, 1.3], evidence: "established" },
      ],
      equations: [
        {
          id: "katp_glucose",
          name: "K-ATP Channel Regulation",
          latex: "P_{open} = \\frac{1}{1 + ([ATP]/K_{ATP})^n \\times (K_{ADP}/[ADP])^m}",
          description: "Channel gating by nucleotide ratio",
          evidence: "novel",
          source: "Metabolic coupling model"
        },
        {
          id: "calcium_exocytosis",
          name: "Ca²⁺-Dependent Exocytosis",
          latex: "Rate_{release} = k_{exo} \\times [Ca^{2+}]^4 \\times N_{granules}",
          description: "Insulin granule release rate",
          evidence: "novel",
          source: "Cooperative Ca²⁺ binding model"
        }
      ]
    }
  }
};

export default ORGAN_MODELS;
