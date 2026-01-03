// Complete Multi-Scale Mathematical Model of the Human Body
// Each organ modeled at: Geometry → Structure → Physiology → Cellular levels

// Distinct organ icons - using minimalistic symbols
const ORGAN_ICONS = {
  heart: "🫀",      // Anatomical heart
  lungs: "🫁",      // Lungs
  kidneys: "🫘",    // Bean shape for kidneys
  liver: "🔶",      // Orange diamond for liver
  brain: "🧠",      // Brain
  pancreas: "🔹",   // Blue diamond for pancreas
  blood: "🩸",      // Blood drop
  bone_marrow: "🦴", // Bone
  spleen: "🟣",     // Purple circle
  thyroid: "🦋",    // Butterfly shape
  adrenal: "🔺",    // Triangle for adrenal
  lymph: "💧",      // Droplet for lymphatic
  muscle: "💪",     // Muscle
  skin: "🧴",       // Skin/skincare
  eye: "👁️",       // Eye
  stomach: "🫃",    // Stomach area
  intestines: "🔄", // Coiled
  cellular: "🔬"    // Microscope for cellular
};

export const ORGAN_MODELS = {
  heart: {
    name: "Heart",
    icon: ORGAN_ICONS.heart,
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
        },
        {
          id: "fick_cardiac_output",
          name: "Fick Principle (CO)",
          latex: "CO = \\frac{VO_2}{C_aO_2 - C_vO_2} = \\frac{VO_2}{(1.34 \\times Hb \\times (S_aO_2 - S_vO_2))}",
          description: "Gold standard CO measurement from O₂ consumption",
          evidence: "established",
          source: "Fick 1870"
        },
        {
          id: "cardiac_index",
          name: "Cardiac Index",
          latex: "CI = \\frac{CO}{BSA} = \\frac{SV \\times HR}{BSA}",
          description: "CO normalized to body size (normal 2.5-4.0 L/min/m²)",
          evidence: "established",
          source: "Clinical cardiology"
        },
        {
          id: "mean_arterial_pressure",
          name: "Mean Arterial Pressure",
          latex: "MAP = DBP + \\frac{1}{3}(SBP - DBP) = \\frac{SBP + 2 \\times DBP}{3}",
          description: "Average arterial pressure during cardiac cycle",
          evidence: "established",
          source: "Basic hemodynamics"
        },
        {
          id: "systemic_vascular_resistance",
          name: "Systemic Vascular Resistance",
          latex: "SVR = \\frac{(MAP - CVP) \\times 80}{CO}",
          description: "Afterload in dyn·s/cm⁵ (normal 800-1200)",
          evidence: "established",
          source: "Ohm's law for circulation"
        },
        {
          id: "pulmonary_vascular_resistance",
          name: "Pulmonary Vascular Resistance",
          latex: "PVR = \\frac{(mPAP - PCWP) \\times 80}{CO}",
          description: "RV afterload (normal <250 dyn·s/cm⁵)",
          evidence: "established",
          source: "Pulmonary hemodynamics"
        },
        {
          id: "coronary_flow_reserve",
          name: "Coronary Flow Reserve",
          latex: "CFR = \\frac{CBF_{hyperemia}}{CBF_{baseline}}",
          description: "Coronary vasodilator capacity (normal >2.0)",
          evidence: "established",
          source: "Coronary physiology"
        },
        {
          id: "fractional_flow_reserve",
          name: "Fractional Flow Reserve",
          latex: "FFR = \\frac{P_d}{P_a}",
          description: "Pd/Pa at maximal hyperemia (<0.80 = significant stenosis)",
          evidence: "established",
          source: "FAME trial"
        },
        {
          id: "qrs_duration_mortality",
          name: "QRS-Mortality Risk",
          latex: "HR_{death} = 1.5^{(QRS - 100)/30}",
          description: "Mortality hazard ratio from QRS widening",
          evidence: "novel",
          source: "Heart failure studies"
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
    },

    // LAB TESTS - Cardiac biomarkers
    lab_tests: {
      title: "Laboratory Tests",
      parameters: [
        // === CARDIAC BIOMARKERS ===
        { id: "troponin_i", name: "Troponin I", value: 0.01, unit: "ng/mL", range: [0, 0.04], evidence: "established" },
        { id: "troponin_t", name: "Troponin T (hs)", value: 10, unit: "ng/L", range: [0, 14], evidence: "established" },
        { id: "bnp", name: "BNP", value: 50, unit: "pg/mL", range: [0, 100], evidence: "established" },
        { id: "nt_probnp", name: "NT-proBNP", value: 100, unit: "pg/mL", range: [0, 300], evidence: "established" },
        { id: "ck_mb", name: "CK-MB", value: 3, unit: "ng/mL", range: [0, 5], evidence: "established" },
        { id: "myoglobin", name: "Myoglobin", value: 50, unit: "ng/mL", range: [25, 72], evidence: "established" },
        { id: "ldh", name: "LDH", value: 200, unit: "U/L", range: [140, 280], evidence: "established" },
        
        // === COAGULATION ===
        { id: "d_dimer", name: "D-Dimer", value: 200, unit: "ng/mL", range: [0, 500], evidence: "established" },
        { id: "pt", name: "Prothrombin Time (PT)", value: 12, unit: "sec", range: [11, 13.5], evidence: "established" },
        { id: "inr", name: "INR", value: 1.0, unit: "ratio", range: [0.9, 1.1], evidence: "established" },
        { id: "ptt", name: "PTT", value: 30, unit: "sec", range: [25, 35], evidence: "established" },
        { id: "fibrinogen", name: "Fibrinogen", value: 300, unit: "mg/dL", range: [200, 400], evidence: "established" },
        
        // === LIPID PANEL ===
        { id: "total_cholesterol", name: "Total Cholesterol", value: 180, unit: "mg/dL", range: [0, 200], evidence: "established" },
        { id: "ldl_cholesterol", name: "LDL Cholesterol", value: 100, unit: "mg/dL", range: [0, 100], evidence: "established" },
        { id: "hdl_cholesterol", name: "HDL Cholesterol", value: 55, unit: "mg/dL", range: [40, 80], evidence: "established" },
        { id: "triglycerides", name: "Triglycerides", value: 120, unit: "mg/dL", range: [0, 150], evidence: "established" },
        { id: "vldl", name: "VLDL", value: 24, unit: "mg/dL", range: [5, 40], evidence: "established" },
        { id: "lpa", name: "Lipoprotein(a)", value: 20, unit: "mg/dL", range: [0, 30], evidence: "established" },
        { id: "apob", name: "Apolipoprotein B", value: 90, unit: "mg/dL", range: [50, 130], evidence: "established" },
        { id: "apoa1", name: "Apolipoprotein A1", value: 150, unit: "mg/dL", range: [100, 200], evidence: "established" },
        
        // === INFLAMMATORY MARKERS ===
        { id: "crp", name: "C-Reactive Protein", value: 1.0, unit: "mg/L", range: [0, 3], evidence: "established" },
        { id: "hs_crp", name: "High-Sensitivity CRP", value: 1.0, unit: "mg/L", range: [0, 3], evidence: "established" },
        { id: "esr", name: "ESR", value: 10, unit: "mm/hr", range: [0, 20], evidence: "established" },
        { id: "homocysteine", name: "Homocysteine", value: 10, unit: "µmol/L", range: [5, 15], evidence: "established" },
        
        // === METABOLIC MARKERS ===
        { id: "glucose_fasting", name: "Fasting Glucose", value: 90, unit: "mg/dL", range: [70, 100], evidence: "established" },
        { id: "hba1c", name: "HbA1c", value: 5.4, unit: "%", range: [4, 5.6], evidence: "established" },
        { id: "uric_acid", name: "Uric Acid", value: 5.5, unit: "mg/dL", range: [3.5, 7.2], evidence: "established" },
      ],
      equations: [
        {
          id: "troponin_kinetics",
          name: "Troponin Release Kinetics",
          latex: "cTn(t) = cTn_{peak} \\times (e^{-k_1 t} - e^{-k_2 t})",
          description: "Troponin rise and fall after MI",
          evidence: "established",
          source: "Cardiology"
        },
        {
          id: "framingham_risk",
          name: "Framingham Risk Score",
          latex: "Risk = 1 - S_0^{e^{\\sum \\beta_i X_i - \\bar{X}}}",
          description: "10-year CVD risk from lipids, BP, age, smoking",
          evidence: "established",
          source: "Framingham Heart Study"
        },
        {
          id: "ldl_friedewald",
          name: "LDL (Friedewald)",
          latex: "LDL = TC - HDL - \\frac{TG}{5}",
          description: "Calculated LDL from lipid panel",
          evidence: "established",
          source: "Friedewald 1972"
        },
        {
          id: "non_hdl",
          name: "Non-HDL Cholesterol",
          latex: "NonHDL = TC - HDL",
          description: "All atherogenic lipoproteins",
          evidence: "established",
          source: "ACC/AHA Guidelines"
        }
      ]
    },

    // VITAL SIGNS - Cardiovascular vitals
    vital_signs: {
      title: "Vital Signs & Hemodynamics",
      parameters: [
        // === BLOOD PRESSURE ===
        { id: "systolic_bp", name: "Systolic Blood Pressure", value: 120, unit: "mmHg", range: [90, 130], evidence: "established" },
        { id: "diastolic_bp", name: "Diastolic Blood Pressure", value: 80, unit: "mmHg", range: [60, 85], evidence: "established" },
        { id: "mean_arterial_pressure", name: "Mean Arterial Pressure", value: 93, unit: "mmHg", range: [70, 105], evidence: "established" },
        { id: "pulse_pressure", name: "Pulse Pressure", value: 40, unit: "mmHg", range: [30, 50], evidence: "established" },
        { id: "bp_variability", name: "BP Variability (SD)", value: 10, unit: "mmHg", range: [5, 15], evidence: "established" },
        
        // === HEART RATE ===
        { id: "resting_hr", name: "Resting Heart Rate", value: 70, unit: "bpm", range: [60, 100], evidence: "established" },
        { id: "hr_variability", name: "Heart Rate Variability (SDNN)", value: 100, unit: "ms", range: [50, 150], evidence: "established" },
        { id: "rmssd", name: "HRV (RMSSD)", value: 40, unit: "ms", range: [20, 75], evidence: "established" },
        { id: "max_hr", name: "Maximum Heart Rate", value: 180, unit: "bpm", range: [150, 200], evidence: "established" },
        { id: "hr_recovery_1min", name: "HR Recovery (1 min)", value: 25, unit: "bpm", range: [12, 40], evidence: "established" },
        
        // === ADVANCED HEMODYNAMICS ===
        { id: "cvp", name: "Central Venous Pressure", value: 6, unit: "mmHg", range: [2, 8], evidence: "established" },
        { id: "pcwp", name: "Pulmonary Capillary Wedge Pressure", value: 10, unit: "mmHg", range: [6, 12], evidence: "established" },
        { id: "pap_systolic", name: "PA Systolic Pressure", value: 25, unit: "mmHg", range: [15, 30], evidence: "established" },
        { id: "pap_diastolic", name: "PA Diastolic Pressure", value: 10, unit: "mmHg", range: [4, 12], evidence: "established" },
        { id: "pap_mean", name: "Mean PA Pressure", value: 15, unit: "mmHg", range: [10, 20], evidence: "established" },
        { id: "svr", name: "Systemic Vascular Resistance", value: 1000, unit: "dyn·s/cm⁵", range: [800, 1200], evidence: "established" },
        { id: "pvr", name: "Pulmonary Vascular Resistance", value: 100, unit: "dyn·s/cm⁵", range: [20, 250], evidence: "established" },
      ],
      equations: [
        {
          id: "map_calc",
          name: "Mean Arterial Pressure",
          latex: "MAP = DBP + \\frac{1}{3}(SBP - DBP)",
          description: "Average arterial pressure during cardiac cycle",
          evidence: "established",
          source: "Hemodynamics"
        },
        {
          id: "svr_calc",
          name: "Systemic Vascular Resistance",
          latex: "SVR = \\frac{(MAP - CVP) \\times 80}{CO}",
          description: "Afterload in dyn·s/cm⁵",
          evidence: "established",
          source: "Hemodynamics"
        }
      ]
    },

    // PHYSICAL EXAM - Heart sounds and findings
    physical_exam: {
      title: "Physical Examination",
      parameters: [
        // === HEART SOUNDS ===
        { id: "s1_intensity", name: "S1 Intensity", value: 1.0, unit: "scale", range: [0.5, 1.5], evidence: "established" },
        { id: "s2_intensity", name: "S2 Intensity", value: 1.0, unit: "scale", range: [0.5, 1.5], evidence: "established" },
        { id: "s2_splitting", name: "S2 Splitting", value: 0.04, unit: "sec", range: [0.02, 0.08], evidence: "established" },
        { id: "s3_present", name: "S3 Gallop Present", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "s4_present", name: "S4 Gallop Present", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        
        // === MURMURS ===
        { id: "systolic_murmur_grade", name: "Systolic Murmur Grade", value: 0, unit: "/6", range: [0, 6], evidence: "established" },
        { id: "diastolic_murmur_grade", name: "Diastolic Murmur Grade", value: 0, unit: "/4", range: [0, 4], evidence: "established" },
        
        // === JVP & EDEMA ===
        { id: "jvp", name: "JVP Height", value: 3, unit: "cm H2O", range: [1, 5], evidence: "established" },
        { id: "peripheral_edema", name: "Peripheral Edema", value: 0, unit: "scale 0-4", range: [0, 4], evidence: "established" },
        { id: "hepatojugular_reflux", name: "Hepatojugular Reflux", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        
        // === PULSES ===
        { id: "carotid_pulse_quality", name: "Carotid Pulse Quality", value: 2, unit: "scale 0-4", range: [2, 3], evidence: "established" },
        { id: "radial_pulse_quality", name: "Radial Pulse Quality", value: 2, unit: "scale 0-4", range: [2, 3], evidence: "established" },
        { id: "pulsus_paradoxus", name: "Pulsus Paradoxus", value: 5, unit: "mmHg", range: [0, 10], evidence: "established" },
        { id: "pulsus_alternans", name: "Pulsus Alternans Present", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        
        // === PMI ===
        { id: "pmi_location", name: "PMI Location (intercostal space)", value: 5, unit: "ICS", range: [4, 5], evidence: "established" },
        { id: "pmi_size", name: "PMI Size", value: 2, unit: "cm", range: [1, 3], evidence: "established" },
        { id: "pmi_sustained", name: "PMI Sustained/Heaving", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
      ],
      equations: [
        {
          id: "jvp_estimate",
          name: "CVP from JVP",
          latex: "CVP \\approx JVP_{cm} + 5",
          description: "Estimate CVP from JVP height above sternal angle",
          evidence: "established",
          source: "Clinical cardiology"
        }
      ]
    },

    // ECG PARAMETERS
    ecg: {
      title: "ECG & Electrophysiology",
      parameters: [
        // === INTERVALS ===
        { id: "pr_interval", name: "PR Interval", value: 160, unit: "ms", range: [120, 200], evidence: "established" },
        { id: "qrs_duration", name: "QRS Duration", value: 90, unit: "ms", range: [60, 100], evidence: "established" },
        { id: "qtc_interval", name: "QTc Interval", value: 420, unit: "ms", range: [350, 450], evidence: "established" },
        { id: "qt_interval", name: "QT Interval", value: 380, unit: "ms", range: [350, 440], evidence: "established" },
        
        // === AXIS & MORPHOLOGY ===
        { id: "p_wave_axis", name: "P Wave Axis", value: 60, unit: "degrees", range: [0, 75], evidence: "established" },
        { id: "qrs_axis", name: "QRS Axis", value: 60, unit: "degrees", range: [-30, 90], evidence: "established" },
        { id: "t_wave_axis", name: "T Wave Axis", value: 45, unit: "degrees", range: [15, 75], evidence: "established" },
        
        // === VOLTAGE ===
        { id: "sokolow_lyon", name: "Sokolow-Lyon (SV1+RV5)", value: 25, unit: "mm", range: [0, 35], evidence: "established" },
        { id: "cornell_voltage", name: "Cornell Voltage", value: 18, unit: "mm", range: [0, 28], evidence: "established" },
        
        // === ST SEGMENT ===
        { id: "st_elevation", name: "ST Elevation", value: 0, unit: "mm", range: [-0.5, 1], evidence: "established" },
        { id: "st_depression", name: "ST Depression", value: 0, unit: "mm", range: [-1, 0.5], evidence: "established" },
        
        // === RHYTHM ===
        { id: "sinus_rhythm", name: "Sinus Rhythm Present", value: 1, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "atrial_rate", name: "Atrial Rate", value: 70, unit: "bpm", range: [60, 100], evidence: "established" },
        { id: "ventricular_rate", name: "Ventricular Rate", value: 70, unit: "bpm", range: [60, 100], evidence: "established" },
      ],
      equations: [
        {
          id: "qtc_bazett",
          name: "QTc (Bazett)",
          latex: "QTc = \\frac{QT}{\\sqrt{RR}}",
          description: "Rate-corrected QT interval",
          evidence: "established",
          source: "Bazett 1920"
        },
        {
          id: "qtc_fridericia",
          name: "QTc (Fridericia)",
          latex: "QTc = \\frac{QT}{\\sqrt[3]{RR}}",
          description: "More accurate at extreme HRs",
          evidence: "established",
          source: "Fridericia 1920"
        }
      ]
    },

    // IMAGING - Cardiac imaging parameters
    imaging: {
      title: "Imaging",
      parameters: [
        { id: "echo_ef", name: "Ejection Fraction (Echo)", value: 60, unit: "%", range: [55, 70], evidence: "established" },
        { id: "echo_e_e_prime", name: "E/e' Ratio", value: 8, unit: "ratio", range: [6, 14], evidence: "established" },
        { id: "echo_tapse", name: "TAPSE", value: 22, unit: "mm", range: [17, 30], evidence: "established" },
        { id: "coronary_calcium", name: "Coronary Calcium Score", value: 0, unit: "Agatston", range: [0, 100], evidence: "established" },
        { id: "mri_native_t1", name: "Native T1 (CMR)", value: 1000, unit: "ms", range: [900, 1100], evidence: "established" },
        { id: "mri_ecv", name: "ECV (CMR)", value: 25, unit: "%", range: [20, 30], evidence: "established" },
        { id: "lvef_muga", name: "LVEF (MUGA)", value: 60, unit: "%", range: [55, 70], evidence: "established" },
      ],
      equations: [
        {
          id: "ejection_fraction",
          name: "Ejection Fraction",
          latex: "EF = \\frac{EDV - ESV}{EDV} \\times 100",
          description: "Systolic function quantification",
          evidence: "established",
          source: "Cardiology"
        }
      ]
    }
  },

  lungs: {
    name: "Lungs",
    icon: ORGAN_ICONS.lungs,
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
        { id: "spo2", name: "Oxygen Saturation (SpO₂)", value: 98, unit: "%", range: [95, 100], evidence: "established" },
        { id: "fev1", name: "FEV₁", value: 3.5, unit: "L", range: [3.0, 4.5], evidence: "established" },
        { id: "fev1_fvc", name: "FEV₁/FVC Ratio", value: 80, unit: "%", range: [75, 85], evidence: "established" },
        { id: "fvc", name: "Forced Vital Capacity", value: 4.5, unit: "L", range: [3.8, 5.5], evidence: "established" },
        { id: "pef", name: "Peak Expiratory Flow", value: 500, unit: "L/min", range: [400, 650], evidence: "established" },
        { id: "fef_25_75", name: "FEF 25-75%", value: 3.5, unit: "L/sec", range: [2.5, 4.5], evidence: "established" },
        { id: "dlco", name: "DLCO (Diffusion Capacity)", value: 25, unit: "mL/min/mmHg", range: [20, 30], evidence: "established" },
        { id: "dlco_va", name: "DLCO/VA (KCO)", value: 5, unit: "mL/min/mmHg/L", range: [4, 6], evidence: "established" },
        { id: "tlc", name: "Total Lung Capacity", value: 6, unit: "L", range: [5, 7], evidence: "established" },
        { id: "rv_tlc", name: "RV/TLC Ratio", value: 25, unit: "%", range: [20, 35], evidence: "established" },
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
        },
        {
          id: "bohr_dead_space",
          name: "Bohr Dead Space",
          latex: "\\frac{V_D}{V_T} = \\frac{P_ACO_2 - P_ECO_2}{P_ACO_2}",
          description: "Physiologic dead space fraction",
          evidence: "established",
          source: "Bohr equation"
        },
        {
          id: "pf_ratio",
          name: "P/F Ratio",
          latex: "P/F = \\frac{P_aO_2}{F_iO_2}",
          description: "Oxygenation efficiency (ARDS: <300 mild, <200 moderate, <100 severe)",
          evidence: "established",
          source: "Berlin Definition"
        },
        {
          id: "oxygenation_index",
          name: "Oxygenation Index",
          latex: "OI = \\frac{MAP \\times F_iO_2 \\times 100}{P_aO_2}",
          description: "ARDS severity (MAP = mean airway pressure)",
          evidence: "established",
          source: "Pediatric ARDS"
        },
        {
          id: "oxygen_delivery",
          name: "Oxygen Delivery",
          latex: "DO_2 = CO \\times C_aO_2 \\times 10 = CO \\times (1.34 \\times Hb \\times S_aO_2 + 0.003 \\times P_aO_2) \\times 10",
          description: "Total O₂ delivered to tissues (mL/min)",
          evidence: "established",
          source: "Clinical physiology"
        },
        {
          id: "oxygen_extraction_ratio",
          name: "Oxygen Extraction Ratio",
          latex: "O_2ER = \\frac{VO_2}{DO_2} = \\frac{C_aO_2 - C_vO_2}{C_aO_2}",
          description: "Tissue O₂ extraction (normal 25-30%)",
          evidence: "established",
          source: "Critical care"
        },
        {
          id: "respiratory_quotient",
          name: "Respiratory Quotient",
          latex: "RQ = \\frac{VCO_2}{VO_2}",
          description: "CO₂ produced per O₂ consumed (normal ~0.8)",
          evidence: "established",
          source: "Metabolism"
        },
        {
          id: "airway_resistance",
          name: "Airway Resistance",
          latex: "R_{aw} = \\frac{PIP - P_{plat}}{\\dot{V}}",
          description: "Flow resistance in airways",
          evidence: "established",
          source: "Mechanical ventilation"
        },
        {
          id: "static_compliance",
          name: "Static Compliance",
          latex: "C_{st} = \\frac{V_T}{P_{plat} - PEEP}",
          description: "Lung-thorax compliance (normal 50-80 mL/cmH₂O)",
          evidence: "established",
          source: "Mechanical ventilation"
        },
        {
          id: "equation_of_motion",
          name: "Equation of Motion",
          latex: "P_{vent} + P_{mus} = (R \\times \\dot{V}) + \\frac{V}{C} + PEEP",
          description: "Pressure balance during breathing",
          evidence: "established",
          source: "Respiratory mechanics"
        },
        {
          id: "rapid_shallow_breathing",
          name: "Rapid Shallow Breathing Index",
          latex: "RSBI = \\frac{RR}{V_T(L)}",
          description: "Weaning predictor (>105 = failure likely)",
          evidence: "established",
          source: "Tobin index"
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
    },

    // PHYSICAL EXAM - Respiratory findings
    physical_exam: {
      title: "Physical Examination",
      parameters: [
        // === INSPECTION ===
        { id: "respiratory_effort", name: "Respiratory Effort", value: 0, unit: "scale 0-3", range: [0, 3], evidence: "established" },
        { id: "accessory_muscle_use", name: "Accessory Muscle Use", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "nasal_flaring", name: "Nasal Flaring Present", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "intercostal_retractions", name: "Intercostal Retractions", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "tripod_position", name: "Tripod Position", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "cyanosis", name: "Central Cyanosis", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "clubbing", name: "Digital Clubbing", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        
        // === BREATH SOUNDS ===
        { id: "breath_sounds_intensity", name: "Breath Sound Intensity", value: 1.0, unit: "scale", range: [0.5, 1.5], evidence: "established" },
        { id: "crackles_present", name: "Crackles (Rales) Present", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "crackles_location", name: "Crackles Location Score", value: 0, unit: "zones", range: [0, 6], evidence: "established" },
        { id: "wheezes_present", name: "Wheezes Present", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "wheeze_timing", name: "Wheeze Timing (exp/insp)", value: 0, unit: "score", range: [0, 2], evidence: "established" },
        { id: "rhonchi_present", name: "Rhonchi Present", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "stridor_present", name: "Stridor Present", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "pleural_rub", name: "Pleural Friction Rub", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "bronchial_breath_sounds", name: "Bronchial Breath Sounds", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "diminished_breath_sounds", name: "Diminished Breath Sounds", value: 0, unit: "zones", range: [0, 6], evidence: "established" },
        
        // === PERCUSSION & PALPATION ===
        { id: "percussion_dullness", name: "Percussion Dullness", value: 0, unit: "zones", range: [0, 6], evidence: "established" },
        { id: "hyperresonance", name: "Hyperresonance Present", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "tactile_fremitus", name: "Tactile Fremitus", value: 1.0, unit: "scale", range: [0.5, 1.5], evidence: "established" },
        { id: "chest_expansion", name: "Chest Expansion (asymmetry)", value: 0, unit: "cm difference", range: [0, 3], evidence: "established" },
        { id: "tracheal_deviation", name: "Tracheal Deviation", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        
        // === COUGH & SPUTUM ===
        { id: "cough_severity", name: "Cough Severity", value: 0, unit: "scale 0-10", range: [0, 10], evidence: "established" },
        { id: "sputum_production", name: "Sputum Production", value: 0, unit: "mL/day", range: [0, 100], evidence: "established" },
        { id: "sputum_purulence", name: "Sputum Purulence Score", value: 0, unit: "scale 1-3", range: [0, 3], evidence: "established" },
      ],
      equations: [
        {
          id: "curb_65",
          name: "CURB-65 Score",
          latex: "CURB65 = Confusion + Urea>7 + RR>30 + BP<90 + Age\\geq65",
          description: "Pneumonia severity (0-1 outpt, 2 short stay, 3+ ICU)",
          evidence: "established",
          source: "BTS Guidelines"
        }
      ]
    },

    // ARTERIAL BLOOD GAS & LABS
    lab_tests: {
      title: "Blood Gases & Respiratory Labs",
      parameters: [
        // === ARTERIAL BLOOD GAS ===
        { id: "ph", name: "Arterial pH", value: 7.40, unit: "", range: [7.35, 7.45], evidence: "established" },
        { id: "paco2", name: "PaCO₂", value: 40, unit: "mmHg", range: [35, 45], evidence: "established" },
        { id: "pao2", name: "PaO₂", value: 95, unit: "mmHg", range: [80, 100], evidence: "established" },
        { id: "hco3", name: "HCO₃⁻ (Bicarbonate)", value: 24, unit: "mEq/L", range: [22, 26], evidence: "established" },
        { id: "base_excess", name: "Base Excess", value: 0, unit: "mEq/L", range: [-2, 2], evidence: "established" },
        { id: "sao2", name: "SaO₂ (ABG)", value: 97, unit: "%", range: [95, 100], evidence: "established" },
        { id: "aa_gradient", name: "A-a Gradient", value: 10, unit: "mmHg", range: [5, 15], evidence: "established" },
        { id: "pf_ratio", name: "P/F Ratio", value: 450, unit: "", range: [400, 500], evidence: "established" },
        
        // === DERIVED VALUES ===
        { id: "anion_gap", name: "Anion Gap", value: 10, unit: "mEq/L", range: [8, 12], evidence: "established" },
        { id: "delta_delta", name: "Delta-Delta Ratio", value: 1.0, unit: "ratio", range: [1, 2], evidence: "established" },
        { id: "expected_pco2", name: "Expected PaCO₂ (for HCO3)", value: 40, unit: "mmHg", range: [35, 45], evidence: "established" },
        
        // === RESPIRATORY BIOMARKERS ===
        { id: "procalcitonin", name: "Procalcitonin", value: 0.1, unit: "ng/mL", range: [0, 0.5], evidence: "established" },
        { id: "lactate", name: "Lactate", value: 1.0, unit: "mmol/L", range: [0.5, 2.0], evidence: "established" },
        { id: "bnp_respiratory", name: "BNP (for CHF eval)", value: 50, unit: "pg/mL", range: [0, 100], evidence: "established" },
        
        // === SPUTUM ANALYSIS ===
        { id: "sputum_wbc", name: "Sputum WBC Count", value: 0, unit: "/hpf", range: [0, 25], evidence: "established" },
        { id: "sputum_gram_positive", name: "Gram Positive Organisms", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "sputum_gram_negative", name: "Gram Negative Organisms", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
      ],
      equations: [
        {
          id: "henderson_hasselbalch",
          name: "Henderson-Hasselbalch",
          latex: "pH = 6.1 + \\log\\frac{[HCO_3^-]}{0.03 \\times P_aCO_2}",
          description: "Relationship between pH, HCO3, and CO2",
          evidence: "established",
          source: "Acid-base physiology"
        },
        {
          id: "winters_formula",
          name: "Winter's Formula",
          latex: "Expected\\ P_aCO_2 = 1.5 \\times [HCO_3] + 8 \\pm 2",
          description: "Expected respiratory compensation in metabolic acidosis",
          evidence: "established",
          source: "Acid-base calculations"
        }
      ]
    },

    // IMAGING - Chest imaging parameters
    imaging: {
      title: "Imaging Parameters",
      parameters: [
        { id: "chest_xray_opacity", name: "CXR Opacity Score", value: 0, unit: "quadrants", range: [0, 4], evidence: "established" },
        { id: "ct_consolidation", name: "CT Consolidation %", value: 0, unit: "%", range: [0, 100], evidence: "established" },
        { id: "ground_glass_opacity", name: "Ground Glass Opacity %", value: 0, unit: "%", range: [0, 100], evidence: "established" },
        { id: "pleural_effusion", name: "Pleural Effusion Size", value: 0, unit: "mm", range: [0, 100], evidence: "established" },
        { id: "pneumothorax", name: "Pneumothorax %", value: 0, unit: "%", range: [0, 100], evidence: "established" },
        { id: "nodule_size", name: "Pulmonary Nodule Size", value: 0, unit: "mm", range: [0, 30], evidence: "established" },
        { id: "emphysema_score", name: "Emphysema Score (CT)", value: 0, unit: "%", range: [0, 100], evidence: "established" },
        { id: "bronchial_wall_thickening", name: "Bronchial Wall Thickening", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "cardiomegaly", name: "Cardiomegaly (CTR)", value: 45, unit: "%", range: [30, 50], evidence: "established" },
      ],
      equations: []
    }
  },

  kidneys: {
    name: "Kidneys",
    icon: ORGAN_ICONS.kidneys,
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

    structure: {
      title: "Structure & Tissue",
      parameters: [
        { id: "cortex_volume", name: "Cortex Volume", value: 70, unit: "%", range: [65, 75], evidence: "established" },
        { id: "medulla_volume", name: "Medulla Volume", value: 30, unit: "%", range: [25, 35], evidence: "established" },
        { id: "glomerular_basement", name: "Glomerular Basement Membrane", value: 300, unit: "nm", range: [250, 350], evidence: "established" },
        { id: "podocyte_foot_process", name: "Podocyte Foot Process Width", value: 500, unit: "nm", range: [400, 600], evidence: "established" },
        { id: "tubular_epithelium", name: "Tubular Epithelium Height", value: 20, unit: "μm", range: [15, 25], evidence: "established" },
        { id: "interstitial_volume", name: "Interstitial Volume", value: 8, unit: "%", range: [5, 12], evidence: "established" },
        { id: "vascular_density", name: "Peritubular Capillary Density", value: 0.3, unit: "per tubule", range: [0.2, 0.4], evidence: "established" },
      ],
      equations: [
        {
          id: "gbm_permeability",
          name: "GBM Permeability",
          latex: "P_{GBM} = P_0 \\times e^{-\\alpha \\cdot thickness} \\times (1 - \\sigma_{charge})",
          description: "Filtration barrier permeability model",
          evidence: "novel",
          source: "Combined thickness and charge model"
        },
        {
          id: "fibrosis_progression",
          name: "Fibrosis Progression",
          latex: "\\frac{dF}{dt} = k_{TGF\\beta} \\cdot [TGF\\beta] - k_{MMP} \\cdot [MMP] \\cdot F",
          description: "Interstitial fibrosis dynamics",
          evidence: "novel",
          source: "TGF-β/MMP balance model"
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
        },
        {
          id: "ckd_epi_2021",
          name: "CKD-EPI 2021 (Race-Free)",
          latex: "eGFR = 142 \\times min(SCr/\\kappa, 1)^\\alpha \\times max(SCr/\\kappa, 1)^{-1.200} \\times 0.9938^{Age} \\times 1.012_{female}",
          description: "Race-free GFR estimation (κ=0.7F/0.9M, α=-0.241F/-0.302M)",
          evidence: "established",
          source: "NKF/ASN 2021"
        },
        {
          id: "mdrd_gfr",
          name: "MDRD Study GFR",
          latex: "eGFR = 175 \\times SCr^{-1.154} \\times Age^{-0.203} \\times 0.742_{female}",
          description: "4-variable MDRD equation (IDMS-traceable)",
          evidence: "established",
          source: "MDRD Study"
        },
        {
          id: "bun_creatinine_ratio",
          name: "BUN/Creatinine Ratio",
          latex: "\\frac{BUN}{Cr} = \\frac{[BUN]}{[Creatinine]}",
          description: "Prerenal (>20:1) vs intrinsic renal (<15:1) AKI",
          evidence: "established",
          source: "Clinical nephrology"
        },
        {
          id: "anion_gap",
          name: "Anion Gap",
          latex: "AG = Na^+ - (Cl^- + HCO_3^-)",
          description: "Normal 8-12 mEq/L; elevated in metabolic acidosis",
          evidence: "established",
          source: "Acid-base"
        },
        {
          id: "osmolar_gap",
          name: "Osmolar Gap",
          latex: "OG = Osm_{measured} - Osm_{calc} = Osm_{measured} - [2Na + \\frac{Glucose}{18} + \\frac{BUN}{2.8}]",
          description: "Elevated (>10) suggests toxic alcohols",
          evidence: "established",
          source: "Toxicology"
        },
        {
          id: "transtubular_k_gradient",
          name: "Transtubular K Gradient",
          latex: "TTKG = \\frac{U_K / P_K}{U_{osm} / P_{osm}}",
          description: "Aldosterone activity assessment",
          evidence: "established",
          source: "Nephrology"
        },
        {
          id: "kidney_failure_risk",
          name: "Kidney Failure Risk",
          latex: "Risk = 1 - 0.9961^{e^{X\\beta}}",
          description: "2-year ESRD risk from GFR, ACR, age, sex",
          evidence: "established",
          source: "Tangri 2016"
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
    },

    // URINALYSIS - Kidney output parameters
    urinalysis: {
      title: "Urinalysis",
      parameters: [
        { id: "urine_volume_24h", name: "24-Hour Urine Volume", value: 1500, unit: "mL/day", range: [800, 2500], evidence: "established" },
        { id: "urine_specific_gravity", name: "Specific Gravity", value: 1.020, unit: "", range: [1.003, 1.030], evidence: "established" },
        { id: "urine_osmolality", name: "Urine Osmolality", value: 600, unit: "mOsm/kg", range: [300, 1200], evidence: "established" },
        { id: "urine_ph", name: "Urine pH", value: 6.0, unit: "", range: [4.5, 8.0], evidence: "established" },
        { id: "urine_protein", name: "Urine Protein", value: 0, unit: "mg/dL", range: [0, 30], evidence: "established" },
        { id: "urine_albumin", name: "Urine Albumin", value: 10, unit: "mg/L", range: [0, 30], evidence: "established" },
        { id: "urine_glucose", name: "Urine Glucose", value: 0, unit: "mg/dL", range: [0, 15], evidence: "established" },
        { id: "urine_ketones", name: "Urine Ketones", value: 0, unit: "mg/dL", range: [0, 5], evidence: "established" },
        { id: "urine_blood", name: "Urine Blood", value: 0, unit: "scale", range: [0, 3], evidence: "established" },
        { id: "urine_rbc", name: "Urine RBCs", value: 2, unit: "/HPF", range: [0, 5], evidence: "established" },
        { id: "urine_wbc", name: "Urine WBCs", value: 3, unit: "/HPF", range: [0, 5], evidence: "established" },
        { id: "urine_casts", name: "Urine Casts", value: 0, unit: "/LPF", range: [0, 2], evidence: "established" },
        { id: "fena", name: "FENa", value: 1.0, unit: "%", range: [0.5, 2.0], evidence: "established" },
      ],
      equations: [
        {
          id: "fena_calc",
          name: "Fractional Excretion of Sodium",
          latex: "FE_{Na} = \\frac{U_{Na} \\times P_{Cr}}{P_{Na} \\times U_{Cr}} \\times 100",
          description: "Prerenal (<1%) vs intrinsic renal (>2%) AKI",
          evidence: "established",
          source: "Nephrology"
        },
        {
          id: "albumin_creatinine_ratio",
          name: "Albumin-Creatinine Ratio",
          latex: "ACR = \\frac{U_{albumin}}{U_{creatinine}}",
          description: "Microalbuminuria screening (mg/g)",
          evidence: "established",
          source: "Diabetes guidelines"
        },
        {
          id: "free_water_clearance",
          name: "Free Water Clearance",
          latex: "C_{H_2O} = V(1 - \\frac{U_{osm}}{P_{osm}})",
          description: "Electrolyte-free water excretion",
          evidence: "established",
          source: "Renal physiology"
        }
      ]
    },

    // IMAGING - Kidney imaging parameters
    imaging: {
      title: "Imaging",
      parameters: [
        { id: "us_kidney_echogenicity", name: "Echogenicity (US)", value: 1, unit: "grade", range: [1, 4], evidence: "established" },
        { id: "us_resistive_index", name: "Resistive Index", value: 0.60, unit: "index", range: [0.50, 0.70], evidence: "established" },
        { id: "gfr_dtpa", name: "GFR (DTPA scan)", value: 100, unit: "mL/min", range: [80, 120], evidence: "established" },
        { id: "split_function", name: "Split Renal Function", value: 50, unit: "%", range: [45, 55], evidence: "established" },
      ],
      equations: [
        {
          id: "resistive_index",
          name: "Resistive Index",
          latex: "RI = \\frac{V_{systolic} - V_{diastolic}}{V_{systolic}}",
          description: "Intrarenal vascular resistance",
          evidence: "established",
          source: "Renal Doppler"
        }
      ]
    }
  },

  liver: {
    name: "Liver",
    icon: ORGAN_ICONS.liver,
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

    pressures: {
      title: "Pressures & Gradients",
      parameters: [
        { id: "portal_pressure", name: "Portal Vein Pressure", value: 7, unit: "mmHg", range: [5, 10], evidence: "established" },
        { id: "hepatic_venous_pressure", name: "Hepatic Venous Pressure", value: 5, unit: "mmHg", range: [3, 7], evidence: "established" },
        { id: "hvpg", name: "Hepatic Venous Pressure Gradient", value: 3, unit: "mmHg", range: [1, 5], evidence: "established" },
        { id: "sinusoidal_pressure", name: "Sinusoidal Pressure", value: 6, unit: "mmHg", range: [4, 8], evidence: "established" },
        { id: "hepatic_artery_pressure", name: "Hepatic Artery Pressure", value: 90, unit: "mmHg", range: [80, 100], evidence: "established" },
        { id: "bile_duct_pressure", name: "Bile Duct Pressure", value: 10, unit: "cmH₂O", range: [5, 15], evidence: "established" },
      ],
      equations: [
        {
          id: "hvpg_calc",
          name: "HVPG Calculation",
          latex: "HVPG = WHVP - FHVP",
          description: "Wedged minus free hepatic venous pressure",
          evidence: "established",
          source: "Portal hypertension definition"
        },
        {
          id: "portal_flow_resistance",
          name: "Portal Flow Resistance",
          latex: "R_{portal} = \\frac{\\Delta P}{Q} = \\frac{P_{portal} - P_{hepatic vein}}{Q_{portal}}",
          description: "Hepatic vascular resistance",
          evidence: "established",
          source: "Ohm's law analog"
        }
      ]
    },

    structure: {
      title: "Structure & Tissue",
      parameters: [
        { id: "hepatocyte_size", name: "Hepatocyte Diameter", value: 25, unit: "μm", range: [20, 30], evidence: "established" },
        { id: "sinusoid_fenestration", name: "Sinusoidal Fenestration", value: 100, unit: "nm", range: [50, 150], evidence: "established" },
        { id: "space_of_disse", name: "Space of Disse Width", value: 1, unit: "μm", range: [0.5, 1.5], evidence: "established" },
        { id: "kupffer_cells", name: "Kupffer Cell Density", value: 15, unit: "% of liver cells", range: [10, 20], evidence: "established" },
        { id: "stellate_cells", name: "Hepatic Stellate Cells", value: 5, unit: "% of liver cells", range: [3, 8], evidence: "established" },
        { id: "bile_canaliculi", name: "Bile Canaliculi Width", value: 1.5, unit: "μm", range: [1, 2], evidence: "established" },
        { id: "collagen_content", name: "Collagen Content (normal)", value: 3, unit: "% of dry weight", range: [2, 5], evidence: "established" },
      ],
      equations: [
        {
          id: "fibrosis_score",
          name: "Fibrosis Progression Model",
          latex: "F_{score} = \\frac{[Collagen]}{[Collagen]_0} \\times (1 + k_{inflammation} \\cdot I)",
          description: "Fibrosis progression with inflammation",
          evidence: "novel",
          source: "Multi-hit fibrosis model"
        },
        {
          id: "portal_hypertension",
          name: "Portal Hypertension Development",
          latex: "HVPG = HVPG_0 \\times (1 + \\alpha \\cdot F_{score}^2)",
          description: "HVPG increases with fibrosis squared",
          evidence: "novel",
          source: "Cirrhosis progression model"
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
        },
        {
          id: "meld_score",
          name: "MELD Score",
          latex: "MELD = 3.78 \\times ln(Bili) + 11.2 \\times ln(INR) + 9.57 \\times ln(Cr) + 6.43",
          description: "Model for End-Stage Liver Disease (6-40 scale)",
          evidence: "established",
          source: "UNOS"
        },
        {
          id: "child_pugh",
          name: "Child-Pugh Score",
          latex: "Score = Bili_{pts} + Alb_{pts} + INR_{pts} + Ascites_{pts} + Enceph_{pts}",
          description: "Cirrhosis prognosis (A: 5-6, B: 7-9, C: 10-15)",
          evidence: "established",
          source: "Child-Pugh 1973"
        },
        {
          id: "apri_score",
          name: "APRI Score",
          latex: "APRI = \\frac{AST / AST_{ULN}}{Platelets (10^9/L)} \\times 100",
          description: "AST-to-Platelet Ratio Index (<0.5 rules out cirrhosis)",
          evidence: "established",
          source: "HCV fibrosis"
        },
        {
          id: "fib4_score",
          name: "FIB-4 Index",
          latex: "FIB4 = \\frac{Age \\times AST}{Platelets \\times \\sqrt{ALT}}",
          description: "Fibrosis staging (<1.3 F0-1, >2.67 F3-4)",
          evidence: "established",
          source: "Sterling 2006"
        },
        {
          id: "maddrey_df",
          name: "Maddrey Discriminant Function",
          latex: "MDF = 4.6 \\times (PT_{patient} - PT_{control}) + Bilirubin",
          description: "Alcoholic hepatitis severity (>32 = severe)",
          evidence: "established",
          source: "Maddrey 1978"
        },
        {
          id: "r_ratio",
          name: "R Ratio (Injury Pattern)",
          latex: "R = \\frac{ALT / ALT_{ULN}}{ALP / ALP_{ULN}}",
          description: "Hepatocellular (>5), cholestatic (<2), mixed (2-5)",
          evidence: "established",
          source: "ACG guidelines"
        },
        {
          id: "half_life_liver",
          name: "Drug Half-Life (Hepatic)",
          latex: "t_{1/2} = \\frac{0.693 \\times V_d}{Cl_H}",
          description: "Elimination half-life in liver disease",
          evidence: "established",
          source: "Pharmacokinetics"
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
    icon: ORGAN_ICONS.brain,
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

    structure: {
      title: "Structure & Tissue",
      parameters: [
        { id: "neuron_density", name: "Cortical Neuron Density", value: 16, unit: "×10⁹/cm³", range: [12, 20], evidence: "established" },
        { id: "glia_ratio", name: "Glia to Neuron Ratio", value: 1.0, unit: "", range: [0.8, 1.2], evidence: "established" },
        { id: "myelin_volume", name: "Myelin Volume Fraction", value: 35, unit: "%", range: [30, 40], evidence: "established" },
        { id: "bbb_thickness", name: "Blood-Brain Barrier Thickness", value: 300, unit: "nm", range: [200, 400], evidence: "established" },
        { id: "capillary_density", name: "Capillary Density", value: 400, unit: "per mm²", range: [300, 500], evidence: "established" },
        { id: "astrocyte_coverage", name: "Astrocyte Coverage of Capillaries", value: 99, unit: "%", range: [98, 100], evidence: "established" },
        { id: "ventricle_volume", name: "Ventricular Volume", value: 25, unit: "mL", range: [15, 40], evidence: "established" },
      ],
      equations: [
        {
          id: "bbb_permeability",
          name: "BBB Permeability",
          latex: "P = P_0 \\times MW^{-0.6} \\times f_{lipophilicity}",
          description: "Permeability decreases with molecular weight",
          evidence: "novel",
          source: "Lipinski-like BBB model"
        },
        {
          id: "neurodegeneration",
          name: "Neurodegeneration Model",
          latex: "\\frac{dN}{dt} = -k_{death} \\cdot N \\cdot (1 + \\alpha_{amyloid}[A\\beta] + \\alpha_{tau}[\\tau_p])",
          description: "Neuron loss accelerated by protein aggregates",
          evidence: "novel",
          source: "Amyloid-tau cascade model"
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
        },
        {
          id: "gcs_mortality",
          name: "GCS-Mortality Relationship",
          latex: "Mortality \\% \\approx 100 - (GCS \\times 6.67)",
          description: "Rough mortality estimate from Glasgow Coma Scale",
          evidence: "novel",
          source: "TBI studies"
        },
        {
          id: "brain_compliance",
          name: "Brain Compliance",
          latex: "C = \\frac{\\Delta V}{\\Delta ICP} = \\frac{PVI}{ICP}",
          description: "Volume buffering capacity (normal ~25 mL)",
          evidence: "established",
          source: "Pressure-volume index"
        },
        {
          id: "csf_dynamics",
          name: "CSF Dynamics",
          latex: "ICP = \\frac{(I_f - Q_o)}{C_b} + P_v",
          description: "ICP from formation, absorption, and compliance",
          evidence: "established",
          source: "Davson equation"
        },
        {
          id: "co2_reactivity",
          name: "CO₂ Reactivity",
          latex: "\\frac{\\Delta CBF}{\\Delta PaCO_2} \\approx 3\\% / mmHg",
          description: "CBF change per mmHg CO₂ change",
          evidence: "established",
          source: "Cerebrovascular physiology"
        },
        {
          id: "ischemic_threshold",
          name: "Ischemic Threshold",
          latex: "CBF_{threshold} = \\begin{cases} 22 & \\text{EEG slowing} \\\\ 15 & \\text{Isoelectric EEG} \\\\ <10 & \\text{Cell death} \\end{cases}",
          description: "CBF thresholds for neuronal function (mL/100g/min)",
          evidence: "established",
          source: "Stroke studies"
        },
        {
          id: "penumbra_model",
          name: "Ischemic Penumbra",
          latex: "Penumbra = V_{CBF<22} - V_{CBF<10}",
          description: "Tissue at risk (salvageable with reperfusion)",
          evidence: "established",
          source: "Stroke imaging"
        },
        {
          id: "osmotic_effect",
          name: "Osmotic Effect on ICP",
          latex: "\\Delta ICP \\propto \\Delta Osm \\times \\sigma_{brain}",
          description: "ICP reduction from hyperosmolar therapy",
          evidence: "established",
          source: "Mannitol/hypertonic saline"
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
    icon: ORGAN_ICONS.pancreas,
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

    pressures: {
      title: "Pressures & Gradients",
      parameters: [
        { id: "pancreatic_duct_pressure", name: "Pancreatic Duct Pressure", value: 15, unit: "cmH₂O", range: [10, 20], evidence: "established" },
        { id: "sphincter_oddi", name: "Sphincter of Oddi Pressure", value: 10, unit: "mmHg", range: [5, 15], evidence: "established" },
        { id: "interstitial_pressure", name: "Interstitial Pressure", value: 5, unit: "mmHg", range: [3, 8], evidence: "established" },
        { id: "portal_venous_drainage", name: "Portal Venous Drainage Pressure", value: 7, unit: "mmHg", range: [5, 10], evidence: "established" },
      ],
      equations: [
        {
          id: "ductal_flow",
          name: "Ductal Flow",
          latex: "Q_{duct} = \\frac{\\Delta P}{R_{duct}} = \\frac{P_{duct} - P_{duodenum}}{R_{sphincter}}",
          description: "Pancreatic secretion flow",
          evidence: "established",
          source: "Fluid mechanics"
        }
      ]
    },

    structure: {
      title: "Structure & Tissue",
      parameters: [
        { id: "acinar_cell_fraction", name: "Acinar Cell Fraction", value: 80, unit: "%", range: [75, 85], evidence: "established" },
        { id: "islet_fraction", name: "Islet Fraction", value: 2, unit: "%", range: [1, 3], evidence: "established" },
        { id: "ductal_fraction", name: "Ductal Cell Fraction", value: 5, unit: "%", range: [3, 7], evidence: "established" },
        { id: "beta_cell_fraction", name: "β-Cells in Islets", value: 60, unit: "%", range: [50, 70], evidence: "established" },
        { id: "alpha_cell_fraction", name: "α-Cells in Islets", value: 25, unit: "%", range: [20, 30], evidence: "established" },
        { id: "islet_vascular_density", name: "Islet Vascular Density", value: 5, unit: "× body average", range: [4, 7], evidence: "established" },
      ],
      equations: [
        {
          id: "beta_cell_replication",
          name: "β-Cell Replication Model",
          latex: "\\frac{dM_\\beta}{dt} = r \\cdot M_\\beta \\cdot (1 - \\frac{M_\\beta}{K}) - \\delta \\cdot M_\\beta \\cdot [Glucose]^n",
          description: "β-cell mass dynamics (replication, apoptosis)",
          evidence: "novel",
          source: "Glucotoxicity model"
        },
        {
          id: "islet_architecture",
          name: "Islet Architecture Score",
          latex: "IAS = \\frac{\\beta_{central}}{\\alpha_{peripheral}} \\times f_{vascular}",
          description: "Architectural disruption in diabetes",
          evidence: "novel",
          source: "Histomorphometry"
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
  },

  blood: {
    name: "Blood",
    icon: ORGAN_ICONS.blood,
    category: "hematological",
    
    geometry: {
      title: "Blood Volume & Composition",
      parameters: [
        { id: "total_blood_volume", name: "Total Blood Volume", value: 5000, unit: "mL", range: [4500, 5500], evidence: "established" },
        { id: "plasma_volume", name: "Plasma Volume", value: 3000, unit: "mL", range: [2700, 3300], evidence: "established" },
        { id: "rbc_volume", name: "RBC Volume", value: 2000, unit: "mL", range: [1800, 2200], evidence: "established" },
        { id: "rbc_count", name: "RBC Count", value: 5.0, unit: "×10¹²/L", range: [4.5, 5.5], evidence: "established" },
        { id: "wbc_count", name: "WBC Count", value: 7.0, unit: "×10⁹/L", range: [4.0, 11.0], evidence: "established" },
        { id: "platelet_count", name: "Platelet Count", value: 250, unit: "×10⁹/L", range: [150, 400], evidence: "established" },
        { id: "hematocrit", name: "Hematocrit", value: 45, unit: "%", range: [40, 50], evidence: "established" },
        { id: "mpv", name: "Mean Platelet Volume", value: 9.5, unit: "fL", range: [7.5, 11.5], evidence: "established" },
      ],
      equations: [
        {
          id: "blood_volume_estimation",
          name: "Blood Volume Estimation",
          latex: "BV = 70 \\times Weight_{kg} \\text{ (adult male)}",
          description: "Approximate blood volume from body weight",
          evidence: "established",
          source: "Clinical estimation"
        }
      ]
    },

    physiology: {
      title: "Hemoglobin & Oxygen",
      parameters: [
        { id: "hemoglobin", name: "Hemoglobin", value: 14.5, unit: "g/dL", range: [12.0, 17.0], evidence: "established" },
        { id: "mcv", name: "MCV (Mean Corpuscular Volume)", value: 90, unit: "fL", range: [80, 100], evidence: "established" },
        { id: "mch", name: "MCH (Mean Corpuscular Hgb)", value: 30, unit: "pg", range: [27, 33], evidence: "established" },
        { id: "mchc", name: "MCHC", value: 34, unit: "g/dL", range: [32, 36], evidence: "established" },
        { id: "rdw", name: "RDW (Red Cell Distribution Width)", value: 13, unit: "%", range: [11.5, 14.5], evidence: "established" },
        { id: "reticulocyte_count", name: "Reticulocyte Count", value: 1.0, unit: "%", range: [0.5, 2.0], evidence: "established" },
        { id: "reticulocyte_absolute", name: "Absolute Reticulocyte Count", value: 50000, unit: "/μL", range: [25000, 100000], evidence: "established" },
        { id: "esr", name: "ESR", value: 10, unit: "mm/hr", range: [0, 20], evidence: "established" },
      ],
      equations: [
        {
          id: "oxygen_content",
          name: "Oxygen Content",
          latex: "CaO_2 = (1.34 \\times Hgb \\times SaO_2) + (0.003 \\times PaO_2)",
          description: "Total oxygen content of arterial blood",
          evidence: "established",
          source: "Fick principle"
        }
      ]
    },

    // WBC DIFFERENTIAL - Critical for diagnosis
    lab_tests: {
      title: "WBC Differential & CBC",
      parameters: [
        // === ABSOLUTE WBC DIFFERENTIAL ===
        { id: "neutrophils_absolute", name: "Neutrophils (Absolute)", value: 4.0, unit: "×10⁹/L", range: [1.8, 7.7], evidence: "established" },
        { id: "lymphocytes_absolute", name: "Lymphocytes (Absolute)", value: 2.0, unit: "×10⁹/L", range: [1.0, 4.8], evidence: "established" },
        { id: "monocytes_absolute", name: "Monocytes (Absolute)", value: 0.4, unit: "×10⁹/L", range: [0.2, 0.8], evidence: "established" },
        { id: "eosinophils_absolute", name: "Eosinophils (Absolute)", value: 0.2, unit: "×10⁹/L", range: [0.04, 0.4], evidence: "established" },
        { id: "basophils_absolute", name: "Basophils (Absolute)", value: 0.04, unit: "×10⁹/L", range: [0.01, 0.1], evidence: "established" },
        
        // === PERCENTAGE WBC DIFFERENTIAL ===
        { id: "neutrophils_percent", name: "Neutrophils (%)", value: 60, unit: "%", range: [40, 70], evidence: "established" },
        { id: "lymphocytes_percent", name: "Lymphocytes (%)", value: 30, unit: "%", range: [20, 45], evidence: "established" },
        { id: "monocytes_percent", name: "Monocytes (%)", value: 6, unit: "%", range: [2, 10], evidence: "established" },
        { id: "eosinophils_percent", name: "Eosinophils (%)", value: 3, unit: "%", range: [1, 6], evidence: "established" },
        { id: "basophils_percent", name: "Basophils (%)", value: 0.5, unit: "%", range: [0, 2], evidence: "established" },
        
        // === BAND FORMS & IMMATURE ===
        { id: "bands", name: "Band Neutrophils", value: 3, unit: "%", range: [0, 5], evidence: "established" },
        { id: "metamyelocytes", name: "Metamyelocytes", value: 0, unit: "%", range: [0, 0], evidence: "established" },
        { id: "myelocytes", name: "Myelocytes", value: 0, unit: "%", range: [0, 0], evidence: "established" },
        { id: "blasts", name: "Blasts", value: 0, unit: "%", range: [0, 0], evidence: "established" },
        
        // === LYMPHOCYTE SUBSETS ===
        { id: "cd4_count", name: "CD4+ T-Cells", value: 800, unit: "/μL", range: [500, 1500], evidence: "established" },
        { id: "cd8_count", name: "CD8+ T-Cells", value: 400, unit: "/μL", range: [200, 800], evidence: "established" },
        { id: "cd4_cd8_ratio", name: "CD4/CD8 Ratio", value: 2.0, unit: "ratio", range: [1.0, 3.0], evidence: "established" },
        { id: "nk_cells", name: "NK Cells", value: 200, unit: "/μL", range: [100, 400], evidence: "established" },
        { id: "b_cells", name: "B-Cells (CD19+)", value: 200, unit: "/μL", range: [100, 500], evidence: "established" },
        
        // === SPECIAL STAINS & MORPHOLOGY ===
        { id: "nucleated_rbc", name: "Nucleated RBCs", value: 0, unit: "/100 WBC", range: [0, 0], evidence: "established" },
        { id: "atypical_lymphocytes", name: "Atypical Lymphocytes", value: 0, unit: "%", range: [0, 3], evidence: "established" },
        { id: "toxic_granulation", name: "Toxic Granulation", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "dohle_bodies", name: "Döhle Bodies Present", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        
        // === DERIVED INDICES ===
        { id: "nlr", name: "Neutrophil-Lymphocyte Ratio", value: 2.0, unit: "ratio", range: [1.0, 3.5], evidence: "established" },
        { id: "plr", name: "Platelet-Lymphocyte Ratio", value: 125, unit: "ratio", range: [50, 200], evidence: "established" },
        { id: "mlr", name: "Monocyte-Lymphocyte Ratio", value: 0.2, unit: "ratio", range: [0.1, 0.4], evidence: "established" },
      ],
      equations: [
        {
          id: "nlr_calculation",
          name: "Neutrophil-Lymphocyte Ratio",
          latex: "NLR = \\frac{ANC}{ALC}",
          description: "Marker of systemic inflammation (elevated in sepsis, cancer, CVD)",
          evidence: "established",
          source: "Clinical inflammation marker"
        },
        {
          id: "reticulocyte_index",
          name: "Reticulocyte Production Index",
          latex: "RPI = \\frac{Retic\\% \\times (Hct/45)}{Maturation_{factor}}",
          description: "Corrected reticulocyte count for anemia",
          evidence: "established",
          source: "Hematology standard"
        }
      ]
    },

    structure: {
      title: "Iron & Nutrients",
      parameters: [
        { id: "serum_iron", name: "Serum Iron", value: 100, unit: "μg/dL", range: [60, 170], evidence: "established" },
        { id: "ferritin", name: "Ferritin", value: 100, unit: "ng/mL", range: [20, 300], evidence: "established" },
        { id: "tibc", name: "TIBC", value: 300, unit: "μg/dL", range: [250, 400], evidence: "established" },
        { id: "transferrin_sat", name: "Transferrin Saturation", value: 30, unit: "%", range: [20, 50], evidence: "established" },
        { id: "soluble_transferrin_receptor", name: "Soluble Transferrin Receptor", value: 3, unit: "mg/L", range: [2, 5], evidence: "established" },
        { id: "vitamin_b12", name: "Vitamin B12", value: 400, unit: "pg/mL", range: [200, 900], evidence: "established" },
        { id: "folate", name: "Folate", value: 10, unit: "ng/mL", range: [3, 17], evidence: "established" },
        { id: "rbc_folate", name: "RBC Folate", value: 300, unit: "ng/mL", range: [140, 628], evidence: "established" },
        { id: "erythropoietin", name: "Erythropoietin", value: 10, unit: "mIU/mL", range: [4, 20], evidence: "established" },
        { id: "haptoglobin", name: "Haptoglobin", value: 100, unit: "mg/dL", range: [30, 200], evidence: "established" },
        { id: "ldh", name: "LDH", value: 200, unit: "U/L", range: [140, 280], evidence: "established" },
        { id: "indirect_bilirubin", name: "Indirect Bilirubin", value: 0.4, unit: "mg/dL", range: [0.1, 0.7], evidence: "established" },
      ],
      equations: [
        {
          id: "transferrin_saturation",
          name: "Transferrin Saturation",
          latex: "TSAT = \\frac{Serum\\ Iron}{TIBC} \\times 100",
          description: "Percentage of transferrin bound to iron",
          evidence: "established",
          source: "Iron studies calculation"
        }
      ]
    },

    pressures: {
      title: "Coagulation & Hemostasis",
      parameters: [
        // === PRIMARY COAGULATION TESTS ===
        { id: "pt", name: "Prothrombin Time (PT)", value: 12, unit: "sec", range: [11, 14], evidence: "established" },
        { id: "inr", name: "INR", value: 1.0, unit: "", range: [0.9, 1.1], evidence: "established" },
        { id: "ptt", name: "PTT", value: 30, unit: "sec", range: [25, 35], evidence: "established" },
        { id: "aptt", name: "aPTT", value: 30, unit: "sec", range: [25, 35], evidence: "established" },
        { id: "fibrinogen", name: "Fibrinogen", value: 300, unit: "mg/dL", range: [200, 400], evidence: "established" },
        { id: "thrombin_time", name: "Thrombin Time", value: 15, unit: "sec", range: [14, 19], evidence: "established" },
        { id: "d_dimer", name: "D-Dimer", value: 0.3, unit: "μg/mL", range: [0, 0.5], evidence: "established" },
        
        // === CLOTTING FACTORS ===
        { id: "factor_viii", name: "Factor VIII Activity", value: 100, unit: "%", range: [50, 150], evidence: "established" },
        { id: "factor_ix", name: "Factor IX Activity", value: 100, unit: "%", range: [50, 150], evidence: "established" },
        { id: "von_willebrand", name: "von Willebrand Factor", value: 100, unit: "%", range: [50, 200], evidence: "established" },
        { id: "vwf_antigen", name: "vWF Antigen", value: 100, unit: "%", range: [50, 200], evidence: "established" },
        { id: "factor_v_leiden", name: "Factor V Leiden Mutation", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        
        // === ANTICOAGULANT PROTEINS ===
        { id: "protein_c", name: "Protein C Activity", value: 100, unit: "%", range: [70, 140], evidence: "established" },
        { id: "protein_s", name: "Protein S Activity", value: 100, unit: "%", range: [60, 140], evidence: "established" },
        { id: "antithrombin_iii", name: "Antithrombin III", value: 100, unit: "%", range: [80, 120], evidence: "established" },
        
        // === PLATELET FUNCTION ===
        { id: "bleeding_time", name: "Bleeding Time", value: 5, unit: "min", range: [2, 9], evidence: "established" },
        { id: "pfa_100", name: "PFA-100 Closure Time", value: 100, unit: "sec", range: [70, 150], evidence: "established" },
        { id: "platelet_aggregation", name: "Platelet Aggregation (%)", value: 80, unit: "%", range: [60, 100], evidence: "established" },
        
        // === FIBRINOLYSIS ===
        { id: "fibrin_degradation", name: "Fibrin Degradation Products", value: 5, unit: "μg/mL", range: [0, 10], evidence: "established" },
        { id: "plasminogen", name: "Plasminogen Activity", value: 100, unit: "%", range: [75, 135], evidence: "established" },
        { id: "alpha2_antiplasmin", name: "α2-Antiplasmin", value: 100, unit: "%", range: [85, 115], evidence: "established" },
        
        // === SPECIAL TESTS ===
        { id: "lupus_anticoagulant", name: "Lupus Anticoagulant", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "anticardiolipin_igg", name: "Anticardiolipin IgG", value: 10, unit: "GPL", range: [0, 20], evidence: "established" },
        { id: "beta2_glycoprotein", name: "β2-Glycoprotein I Ab", value: 10, unit: "U/mL", range: [0, 20], evidence: "established" },
      ],
      equations: [
        {
          id: "inr_calculation",
          name: "INR Calculation",
          latex: "INR = \\left(\\frac{PT_{patient}}{PT_{normal}}\\right)^{ISI}",
          description: "International Normalized Ratio for warfarin monitoring",
          evidence: "established",
          source: "WHO standardization"
        },
        {
          id: "coagulation_cascade",
          name: "Coagulation Cascade Summary",
          latex: "\\text{Intrinsic: XII} \\rightarrow \\text{XI} \\rightarrow \\text{IX} \\rightarrow \\text{X} \\rightarrow \\text{Thrombin}",
          description: "Simplified intrinsic pathway",
          evidence: "established",
          source: "Coagulation physiology"
        }
      ]
    },

    cellular: {
      title: "WBC Differential",
      parameters: [
        { id: "neutrophils", name: "Neutrophils", value: 60, unit: "%", range: [40, 70], evidence: "established" },
        { id: "lymphocytes", name: "Lymphocytes", value: 30, unit: "%", range: [20, 40], evidence: "established" },
        { id: "monocytes", name: "Monocytes", value: 6, unit: "%", range: [2, 8], evidence: "established" },
        { id: "eosinophils", name: "Eosinophils", value: 3, unit: "%", range: [1, 4], evidence: "established" },
        { id: "basophils", name: "Basophils", value: 1, unit: "%", range: [0, 2], evidence: "established" },
        { id: "absolute_neutrophil", name: "ANC (Absolute Neutrophil)", value: 4200, unit: "/μL", range: [1500, 8000], evidence: "established" },
        { id: "absolute_lymphocyte", name: "ALC (Absolute Lymphocyte)", value: 2100, unit: "/μL", range: [1000, 4800], evidence: "established" },
      ],
      equations: [
        {
          id: "anc_calculation",
          name: "ANC Calculation",
          latex: "ANC = WBC \\times (\\%Neutrophils + \\%Bands) / 100",
          description: "Absolute neutrophil count",
          evidence: "established",
          source: "Clinical calculation"
        }
      ]
    }
  },

  bonemarrow: {
    name: "Bone Marrow",
    icon: ORGAN_ICONS.bone_marrow,
    category: "hematological",
    
    geometry: {
      title: "Marrow Composition",
      parameters: [
        { id: "marrow_cellularity", name: "Marrow Cellularity", value: 50, unit: "%", range: [30, 70], evidence: "established" },
        { id: "me_ratio", name: "M:E Ratio", value: 3, unit: "", range: [2, 4], evidence: "established" },
        { id: "blast_percentage", name: "Blast Percentage", value: 2, unit: "%", range: [0, 5], evidence: "established" },
        { id: "megakaryocytes", name: "Megakaryocyte Count", value: 5, unit: "per HPF", range: [2, 10], evidence: "established" },
        { id: "iron_stores", name: "Iron Stores (Grade)", value: 2, unit: "0-6", range: [1, 4], evidence: "established" },
      ],
      equations: [
        {
          id: "expected_cellularity",
          name: "Expected Cellularity by Age",
          latex: "Cellularity\\% \\approx 100 - Age",
          description: "Rule of thumb for age-adjusted cellularity",
          evidence: "established",
          source: "Hematopathology"
        }
      ]
    },

    physiology: {
      title: "Hematopoiesis",
      parameters: [
        { id: "erythroid_precursors", name: "Erythroid Precursors", value: 25, unit: "%", range: [15, 30], evidence: "established" },
        { id: "myeloid_precursors", name: "Myeloid Precursors", value: 60, unit: "%", range: [50, 70], evidence: "established" },
        { id: "lymphoid_precursors", name: "Lymphoid Precursors", value: 10, unit: "%", range: [5, 15], evidence: "established" },
        { id: "plasma_cells", name: "Plasma Cells", value: 2, unit: "%", range: [0, 5], evidence: "established" },
        { id: "stem_cell_frequency", name: "HSC Frequency", value: 0.01, unit: "%", range: [0.005, 0.02], evidence: "established" },
      ],
      equations: [
        {
          id: "hematopoietic_output",
          name: "Daily Hematopoietic Output",
          latex: "Output = 10^{11-12} \\text{ cells/day}",
          description: "Total daily blood cell production",
          evidence: "established",
          source: "Hematology textbooks"
        }
      ]
    },

    cellular: {
      title: "Maturation Stages",
      parameters: [
        { id: "promyelocytes", name: "Promyelocytes", value: 5, unit: "%", range: [2, 8], evidence: "established" },
        { id: "myelocytes", name: "Myelocytes", value: 15, unit: "%", range: [10, 20], evidence: "established" },
        { id: "metamyelocytes", name: "Metamyelocytes", value: 15, unit: "%", range: [10, 20], evidence: "established" },
        { id: "bands", name: "Bands", value: 15, unit: "%", range: [10, 20], evidence: "established" },
        { id: "proerythroblasts", name: "Proerythroblasts", value: 1, unit: "%", range: [0, 2], evidence: "established" },
        { id: "ring_sideroblasts", name: "Ring Sideroblasts", value: 0, unit: "%", range: [0, 5], evidence: "established" },
      ],
      equations: [
        {
          id: "maturation_index",
          name: "Maturation Index",
          latex: "MI = \\frac{Mature\\ cells}{Immature\\ cells}",
          description: "Assessment of orderly maturation",
          evidence: "novel",
          source: "Pathology assessment"
        }
      ]
    }
  },

  spleen: {
    name: "Spleen",
    icon: ORGAN_ICONS.spleen,
    category: "hematological",
    
    geometry: {
      title: "Spleen Dimensions",
      parameters: [
        { id: "spleen_length", name: "Spleen Length", value: 11, unit: "cm", range: [9, 13], evidence: "established" },
        { id: "spleen_width", name: "Spleen Width", value: 7, unit: "cm", range: [5, 9], evidence: "established" },
        { id: "spleen_thickness", name: "Spleen Thickness", value: 4, unit: "cm", range: [3, 5], evidence: "established" },
        { id: "spleen_volume", name: "Spleen Volume", value: 200, unit: "mL", range: [100, 300], evidence: "established" },
        { id: "spleen_weight", name: "Spleen Weight", value: 150, unit: "g", range: [100, 200], evidence: "established" },
      ],
      equations: [
        {
          id: "splenic_index",
          name: "Splenic Index",
          latex: "SI = Length \\times Width \\times Thickness",
          description: "Volumetric estimate of spleen size",
          evidence: "established",
          source: "Radiology"
        }
      ]
    },

    physiology: {
      title: "Splenic Function",
      parameters: [
        { id: "splenic_blood_flow", name: "Splenic Blood Flow", value: 300, unit: "mL/min", range: [200, 400], evidence: "established" },
        { id: "rbc_sequestration", name: "RBC Sequestration", value: 30, unit: "%", range: [20, 40], evidence: "established" },
        { id: "platelet_sequestration", name: "Platelet Sequestration", value: 30, unit: "%", range: [20, 40], evidence: "established" },
        { id: "filtration_rate", name: "Filtration Rate", value: 1, unit: "relative", range: [0.8, 1.2], evidence: "established" },
      ],
      equations: [
        {
          id: "hypersplenism_effect",
          name: "Hypersplenism Effect",
          latex: "Cytopenias \\propto Spleen\\ Size \\times Sequestration\\ Rate",
          description: "Relationship between splenomegaly and blood counts",
          evidence: "novel",
          source: "Clinical observation"
        }
      ]
    }
  },

  lymphatic: {
    name: "Lymphatic System",
    icon: ORGAN_ICONS.thyroid,
    category: "hematological",
    
    geometry: {
      title: "Lymph Node Dimensions",
      parameters: [
        { id: "lymph_node_size", name: "Normal Lymph Node Size", value: 1.0, unit: "cm", range: [0.5, 1.5], evidence: "established" },
        { id: "lymph_node_count", name: "Total Lymph Nodes", value: 600, unit: "", range: [500, 700], evidence: "established" },
        { id: "lymph_volume", name: "Daily Lymph Volume", value: 3, unit: "L", range: [2, 4], evidence: "established" },
        { id: "thoracic_duct_flow", name: "Thoracic Duct Flow", value: 2, unit: "L/day", range: [1, 4], evidence: "established" },
      ],
      equations: [
        {
          id: "lymph_flow",
          name: "Lymph Flow",
          latex: "Q_{lymph} = K_f \\times (P_c - P_i) - \\sigma \\times \\Delta\\pi",
          description: "Starling forces in lymph formation",
          evidence: "established",
          source: "Starling equation"
        }
      ]
    },

    physiology: {
      title: "Immune Parameters",
      parameters: [
        { id: "cd4_count", name: "CD4+ T Cells", value: 1000, unit: "/μL", range: [500, 1500], evidence: "established" },
        { id: "cd8_count", name: "CD8+ T Cells", value: 500, unit: "/μL", range: [200, 800], evidence: "established" },
        { id: "cd4_cd8_ratio", name: "CD4/CD8 Ratio", value: 2.0, unit: "", range: [1.0, 3.0], evidence: "established" },
        { id: "b_cells", name: "B Cells", value: 200, unit: "/μL", range: [100, 400], evidence: "established" },
        { id: "nk_cells", name: "NK Cells", value: 200, unit: "/μL", range: [100, 400], evidence: "established" },
        { id: "igg", name: "IgG", value: 1200, unit: "mg/dL", range: [700, 1600], evidence: "established" },
        { id: "iga", name: "IgA", value: 200, unit: "mg/dL", range: [70, 400], evidence: "established" },
        { id: "igm", name: "IgM", value: 100, unit: "mg/dL", range: [40, 230], evidence: "established" },
      ],
      equations: [
        {
          id: "immune_ratio",
          name: "CD4/CD8 Ratio Significance",
          latex: "\\text{Normal: } 1.0-3.0, \\text{ Low in HIV, High in autoimmune}",
          description: "Clinical interpretation of T cell ratio",
          evidence: "established",
          source: "Immunology"
        }
      ]
    }
  },

  thyroid: {
    name: "Thyroid",
    icon: ORGAN_ICONS.adrenal,
    category: "endocrine",
    
    geometry: {
      title: "Thyroid Dimensions",
      parameters: [
        { id: "thyroid_volume", name: "Thyroid Volume", value: 15, unit: "mL", range: [10, 20], evidence: "established" },
        { id: "thyroid_weight", name: "Thyroid Weight", value: 20, unit: "g", range: [15, 25], evidence: "established" },
        { id: "isthmus_thickness", name: "Isthmus Thickness", value: 4, unit: "mm", range: [2, 6], evidence: "established" },
        { id: "lobe_length", name: "Lobe Length", value: 5, unit: "cm", range: [4, 6], evidence: "established" },
        { id: "lobe_width", name: "Lobe Width", value: 2, unit: "cm", range: [1.5, 2.5], evidence: "established" },
      ],
      equations: [
        {
          id: "thyroid_volume_calc",
          name: "Thyroid Volume Calculation",
          latex: "V = 0.479 \\times L \\times W \\times D \\text{ (per lobe)}",
          description: "Ellipsoid volume estimation",
          evidence: "established",
          source: "Ultrasound guidelines"
        }
      ]
    },

    physiology: {
      title: "Thyroid Function",
      parameters: [
        { id: "tsh", name: "TSH", value: 2.0, unit: "mIU/L", range: [0.4, 4.0], evidence: "established" },
        { id: "free_t4", name: "Free T4", value: 1.2, unit: "ng/dL", range: [0.8, 1.8], evidence: "established" },
        { id: "free_t3", name: "Free T3", value: 3.0, unit: "pg/mL", range: [2.3, 4.2], evidence: "established" },
        { id: "total_t4", name: "Total T4", value: 8.0, unit: "μg/dL", range: [5.0, 12.0], evidence: "established" },
        { id: "total_t3", name: "Total T3", value: 120, unit: "ng/dL", range: [80, 180], evidence: "established" },
        { id: "thyroglobulin", name: "Thyroglobulin", value: 15, unit: "ng/mL", range: [3, 40], evidence: "established" },
        { id: "tpo_antibody", name: "TPO Antibodies", value: 10, unit: "IU/mL", range: [0, 35], evidence: "established" },
        { id: "trab", name: "TSH Receptor Antibodies", value: 0.5, unit: "IU/L", range: [0, 1.75], evidence: "established" },
      ],
      equations: [
        {
          id: "hpt_axis",
          name: "HPT Axis Feedback",
          latex: "TSH \\propto \\frac{1}{T4 + T3}",
          description: "Negative feedback regulation",
          evidence: "established",
          source: "Endocrinology"
        },
        {
          id: "t4_to_t3",
          name: "T4 to T3 Conversion",
          latex: "T3 = k_{deiodinase} \\times T4",
          description: "Peripheral conversion by deiodinases",
          evidence: "established",
          source: "Thyroid physiology"
        }
      ]
    },

    cellular: {
      title: "Iodine Metabolism",
      parameters: [
        { id: "iodine_uptake", name: "Radioiodine Uptake (24h)", value: 20, unit: "%", range: [10, 30], evidence: "established" },
        { id: "iodine_clearance", name: "Thyroid Iodine Clearance", value: 15, unit: "mL/min", range: [10, 25], evidence: "established" },
        { id: "colloid_volume", name: "Colloid Volume", value: 30, unit: "%", range: [20, 40], evidence: "established" },
      ],
      equations: [
        {
          id: "iodine_kinetics",
          name: "Iodine Kinetics",
          latex: "Uptake = \\frac{Thyroid\\ counts - Background}{Administered\\ dose} \\times 100",
          description: "Radioiodine uptake calculation",
          evidence: "established",
          source: "Nuclear medicine"
        }
      ]
    }
  },

  gi_tract: {
    name: "GI Tract",
    icon: ORGAN_ICONS.stomach,
    category: "gastrointestinal",
    
    geometry: {
      title: "GI Dimensions",
      parameters: [
        { id: "small_bowel_length", name: "Small Bowel Length", value: 600, unit: "cm", range: [500, 700], evidence: "established" },
        { id: "colon_length", name: "Colon Length", value: 150, unit: "cm", range: [120, 180], evidence: "established" },
        { id: "gastric_volume", name: "Gastric Volume (empty)", value: 50, unit: "mL", range: [25, 75], evidence: "established" },
        { id: "gastric_capacity", name: "Gastric Capacity (max)", value: 1500, unit: "mL", range: [1000, 2000], evidence: "established" },
        { id: "villous_surface", name: "Villous Surface Area", value: 200, unit: "m²", range: [150, 250], evidence: "established" },
      ],
      equations: [
        {
          id: "transit_time",
          name: "Total GI Transit",
          latex: "T_{total} = T_{gastric} + T_{small\\ bowel} + T_{colon}",
          description: "Sum of segmental transit times",
          evidence: "established",
          source: "GI physiology"
        }
      ]
    },

    physiology: {
      title: "GI Function",
      parameters: [
        { id: "gastric_acid_output", name: "Gastric Acid Output", value: 5, unit: "mEq/hr", range: [2, 10], evidence: "established" },
        { id: "gastric_ph", name: "Gastric pH", value: 2.0, unit: "", range: [1.5, 3.5], evidence: "established" },
        { id: "gastric_emptying", name: "Gastric Emptying (solids)", value: 90, unit: "min", range: [60, 120], evidence: "established" },
        { id: "small_bowel_transit", name: "Small Bowel Transit", value: 4, unit: "hrs", range: [2, 6], evidence: "established" },
        { id: "colonic_transit", name: "Colonic Transit", value: 36, unit: "hrs", range: [24, 72], evidence: "established" },
        { id: "stool_frequency", name: "Stool Frequency", value: 1, unit: "/day", range: [0.5, 3], evidence: "established" },
      ],
      equations: [
        {
          id: "gastric_emptying_kinetics",
          name: "Gastric Emptying Kinetics",
          latex: "V(t) = V_0 \\times e^{-kt}",
          description: "Exponential emptying for liquids",
          evidence: "established",
          source: "GI motility"
        }
      ]
    },

    structure: {
      title: "Tumor Markers",
      parameters: [
        { id: "cea", name: "CEA", value: 2.0, unit: "ng/mL", range: [0, 5.0], evidence: "established" },
        { id: "ca_19_9", name: "CA 19-9", value: 15, unit: "U/mL", range: [0, 37], evidence: "established" },
        { id: "calprotectin", name: "Fecal Calprotectin", value: 30, unit: "μg/g", range: [0, 50], evidence: "established" },
        { id: "occult_blood", name: "Fecal Occult Blood", value: 0, unit: "positive/negative", range: [0, 0], evidence: "established" },
      ],
      equations: [
        {
          id: "cea_doubling",
          name: "CEA Doubling Time",
          latex: "T_d = \\frac{t \\times \\ln(2)}{\\ln(CEA_2/CEA_1)}",
          description: "Tumor marker kinetics",
          evidence: "established",
          source: "Oncology monitoring"
        }
      ]
    }
  },

  breast: {
    name: "Breast",
    icon: ORGAN_ICONS.intestines,
    category: "oncology",
    
    geometry: {
      title: "Breast Imaging",
      parameters: [
        { id: "breast_density", name: "Breast Density (BI-RADS)", value: 2, unit: "A-D", range: [1, 4], evidence: "established" },
        { id: "lesion_size", name: "Lesion Size", value: 0, unit: "cm", range: [0, 10], evidence: "established" },
        { id: "tumor_volume", name: "Tumor Volume", value: 0, unit: "cm³", range: [0, 100], evidence: "established" },
      ],
      equations: [
        {
          id: "tumor_volume_calc",
          name: "Tumor Volume",
          latex: "V = \\frac{4}{3}\\pi r^3 \\approx 0.52 \\times L \\times W \\times H",
          description: "Ellipsoid tumor volume estimation",
          evidence: "established",
          source: "Radiology"
        }
      ]
    },

    physiology: {
      title: "Breast Cancer Markers",
      parameters: [
        { id: "ca_15_3", name: "CA 15-3", value: 15, unit: "U/mL", range: [0, 30], evidence: "established" },
        { id: "ca_27_29", name: "CA 27.29", value: 20, unit: "U/mL", range: [0, 38], evidence: "established" },
        { id: "er_status", name: "ER Status", value: 1, unit: "+/-", range: [0, 1], evidence: "established" },
        { id: "pr_status", name: "PR Status", value: 1, unit: "+/-", range: [0, 1], evidence: "established" },
        { id: "her2_status", name: "HER2 Status", value: 0, unit: "0-3+", range: [0, 3], evidence: "established" },
        { id: "ki67", name: "Ki-67 Proliferation Index", value: 15, unit: "%", range: [0, 100], evidence: "established" },
      ],
      equations: [
        {
          id: "oncotype_dx",
          name: "Recurrence Score Concept",
          latex: "RS = f(ER, PR, HER2, Ki67, Grade)",
          description: "Multi-gene recurrence score model",
          evidence: "established",
          source: "Oncotype DX"
        }
      ]
    }
  },

  prostate: {
    name: "Prostate",
    icon: ORGAN_ICONS.lymph,
    category: "oncology",
    
    geometry: {
      title: "Prostate Dimensions",
      parameters: [
        { id: "prostate_volume", name: "Prostate Volume", value: 25, unit: "mL", range: [15, 35], evidence: "established" },
        { id: "prostate_length", name: "Prostate Length", value: 4, unit: "cm", range: [3, 5], evidence: "established" },
        { id: "prostate_width", name: "Prostate Width", value: 4, unit: "cm", range: [3, 5], evidence: "established" },
        { id: "transition_zone_vol", name: "Transition Zone Volume", value: 10, unit: "mL", range: [5, 20], evidence: "established" },
      ],
      equations: [
        {
          id: "prostate_volume_calc",
          name: "Prostate Volume",
          latex: "V = 0.52 \\times H \\times W \\times L",
          description: "Ellipsoid volume formula",
          evidence: "established",
          source: "Urology guidelines"
        }
      ]
    },

    physiology: {
      title: "Prostate Markers",
      parameters: [
        { id: "psa", name: "PSA (Total)", value: 1.5, unit: "ng/mL", range: [0, 4.0], evidence: "established" },
        { id: "free_psa", name: "Free PSA", value: 25, unit: "%", range: [15, 35], evidence: "established" },
        { id: "psa_density", name: "PSA Density", value: 0.06, unit: "ng/mL/cm³", range: [0, 0.15], evidence: "established" },
        { id: "psa_velocity", name: "PSA Velocity", value: 0.3, unit: "ng/mL/yr", range: [0, 0.75], evidence: "established" },
        { id: "phi_score", name: "PHI Score", value: 30, unit: "", range: [0, 55], evidence: "established" },
        { id: "gleason_score", name: "Gleason Score", value: 6, unit: "", range: [6, 10], evidence: "established" },
      ],
      equations: [
        {
          id: "psa_density_calc",
          name: "PSA Density",
          latex: "PSAD = \\frac{PSA}{Prostate\\ Volume}",
          description: "PSA normalized to gland size",
          evidence: "established",
          source: "Urology"
        },
        {
          id: "psa_doubling",
          name: "PSA Doubling Time",
          latex: "PSADT = \\frac{\\ln(2) \\times t}{\\ln(PSA_2/PSA_1)}",
          description: "Rate of PSA rise",
          evidence: "established",
          source: "Oncology monitoring"
        }
      ]
    }
  },

  // ============== ADRENAL GLANDS ==============
  adrenals: {
    name: "Adrenal Glands",
    icon: ORGAN_ICONS.muscle,
    category: "endocrine",
    
    geometry: {
      title: "Adrenal Dimensions",
      parameters: [
        { id: "adrenal_length", name: "Adrenal Length", value: 4.5, unit: "cm", range: [3, 6], evidence: "established" },
        { id: "adrenal_width", name: "Adrenal Width", value: 3, unit: "cm", range: [2, 4], evidence: "established" },
        { id: "adrenal_thickness", name: "Adrenal Thickness", value: 1, unit: "cm", range: [0.5, 1.5], evidence: "established" },
        { id: "cortex_thickness", name: "Cortex Thickness", value: 2, unit: "mm", range: [1, 3], evidence: "established" },
      ],
      equations: [
        {
          id: "adrenal_ratio",
          name: "Adrenal-to-Kidney Ratio",
          latex: "R_{AK} = \\frac{L_{adrenal}}{L_{kidney}}",
          description: "Normal <0.3, elevated in hyperplasia",
          evidence: "established",
          source: "Radiology guidelines"
        }
      ]
    },

    physiology: {
      title: "Hormonal Parameters",
      parameters: [
        { id: "cortisol_am", name: "Cortisol (8 AM)", value: 15, unit: "μg/dL", range: [6, 23], evidence: "established" },
        { id: "cortisol_pm", name: "Cortisol (4 PM)", value: 8, unit: "μg/dL", range: [3, 16], evidence: "established" },
        { id: "acth", name: "ACTH", value: 25, unit: "pg/mL", range: [10, 60], evidence: "established" },
        { id: "aldosterone", name: "Aldosterone", value: 8, unit: "ng/dL", range: [2, 16], evidence: "established" },
        { id: "renin", name: "Plasma Renin Activity", value: 1.5, unit: "ng/mL/hr", range: [0.5, 3.5], evidence: "established" },
        { id: "dhea_s", name: "DHEA-S", value: 200, unit: "μg/dL", range: [80, 560], evidence: "established" },
        { id: "epinephrine", name: "Epinephrine (plasma)", value: 50, unit: "pg/mL", range: [10, 100], evidence: "established" },
        { id: "norepinephrine", name: "Norepinephrine (plasma)", value: 200, unit: "pg/mL", range: [80, 520], evidence: "established" },
        { id: "metanephrines", name: "Plasma Metanephrines", value: 50, unit: "pg/mL", range: [12, 100], evidence: "established" },
      ],
      equations: [
        {
          id: "aldo_renin_ratio",
          name: "Aldosterone:Renin Ratio",
          latex: "ARR = \\frac{Aldosterone\\ (ng/dL)}{PRA\\ (ng/mL/hr)}",
          description: "Primary hyperaldosteronism screen: >30 suspicious",
          evidence: "established",
          source: "Endocrine Society"
        },
        {
          id: "cortisol_circadian",
          name: "Circadian Cortisol Index",
          latex: "CCI = \\frac{Cortisol_{PM}}{Cortisol_{AM}} \\times 100",
          description: "Normal <50%, loss of rhythm in Cushing's",
          evidence: "established",
          source: "Endocrinology"
        },
        {
          id: "pheochromocytoma_index",
          name: "Pheochromocytoma Index (PhiCor)",
          latex: "PI = \\log_{10}\\left(\\frac{Metanephrines}{ULN}\\right) \\times \\frac{Tumor\\ Size}{1cm}",
          description: "Risk stratification for pheochromocytoma",
          evidence: "novel",
          source: "PhiCor derived"
        }
      ]
    },

    cellular: {
      title: "Cellular Markers",
      parameters: [
        { id: "chromogranin_a", name: "Chromogranin A", value: 50, unit: "ng/mL", range: [25, 140], evidence: "established" },
        { id: "synaptophysin", name: "Synaptophysin Expression", value: 1, unit: "", range: [0, 1], evidence: "established" },
      ],
      equations: []
    }
  },

  // ============== MUSCULOSKELETAL SYSTEM ==============
  musculoskeletal: {
    name: "Musculoskeletal",
    icon: ORGAN_ICONS.bone_marrow,
    category: "rheumatological",
    
    geometry: {
      title: "Bone Measurements",
      parameters: [
        { id: "bmd_spine", name: "BMD L1-L4 Spine", value: 1.0, unit: "g/cm²", range: [0.8, 1.2], evidence: "established" },
        { id: "bmd_hip", name: "BMD Total Hip", value: 0.9, unit: "g/cm²", range: [0.7, 1.1], evidence: "established" },
        { id: "t_score", name: "T-Score (Spine)", value: 0, unit: "SD", range: [-4, 2], evidence: "established" },
        { id: "trabecular_score", name: "Trabecular Bone Score", value: 1.35, unit: "", range: [1.0, 1.5], evidence: "established" },
        { id: "cortical_thickness", name: "Cortical Thickness", value: 4, unit: "mm", range: [2, 6], evidence: "established" },
      ],
      equations: [
        {
          id: "frax_hip",
          name: "FRAX 10-Year Hip Fracture Risk",
          latex: "FRAX_{hip} = f(age, BMI, BMD, risk\\ factors)",
          description: "WHO fracture risk assessment",
          evidence: "established",
          source: "FRAX Tool"
        },
        {
          id: "bone_remodeling",
          name: "Bone Remodeling Balance (PhiCor)",
          latex: "BRB = \\frac{P1NP}{CTX} \\times \\frac{BMD_{current}}{BMD_{reference}}",
          description: "Formation:resorption ratio",
          evidence: "novel",
          source: "PhiCor derived"
        }
      ]
    },

    physiology: {
      title: "Bone Turnover Markers",
      parameters: [
        { id: "ctx", name: "CTX (C-telopeptide)", value: 0.3, unit: "ng/mL", range: [0.1, 0.6], evidence: "established" },
        { id: "p1np", name: "P1NP", value: 40, unit: "ng/mL", range: [15, 80], evidence: "established" },
        { id: "osteocalcin", name: "Osteocalcin", value: 15, unit: "ng/mL", range: [8, 32], evidence: "established" },
        { id: "alkaline_phos", name: "Bone-Specific ALP", value: 12, unit: "μg/L", range: [6, 20], evidence: "established" },
        { id: "vitamin_d", name: "25-OH Vitamin D", value: 40, unit: "ng/mL", range: [30, 100], evidence: "established" },
        { id: "pth", name: "Parathyroid Hormone", value: 40, unit: "pg/mL", range: [15, 65], evidence: "established" },
        { id: "calcium", name: "Serum Calcium", value: 9.5, unit: "mg/dL", range: [8.5, 10.5], evidence: "established" },
        { id: "phosphorus", name: "Serum Phosphorus", value: 3.5, unit: "mg/dL", range: [2.5, 4.5], evidence: "established" },
      ],
      equations: [
        {
          id: "corrected_calcium",
          name: "Corrected Calcium",
          latex: "Ca_{corr} = Ca_{measured} + 0.8 \\times (4.0 - Albumin)",
          description: "Albumin-corrected calcium",
          evidence: "established",
          source: "Endocrinology"
        },
        {
          id: "ca_phos_product",
          name: "Calcium-Phosphorus Product",
          latex: "CaP = Ca \\times P",
          description: ">55 mg²/dL² associated with vascular calcification",
          evidence: "established",
          source: "Nephrology"
        }
      ]
    },

    structure: {
      title: "Joint Assessment",
      parameters: [
        { id: "das28", name: "DAS28-CRP", value: 2.5, unit: "", range: [0, 10], evidence: "established" },
        { id: "cdai", name: "CDAI Score", value: 5, unit: "", range: [0, 76], evidence: "established" },
        { id: "sharp_score", name: "Modified Sharp Score", value: 0, unit: "", range: [0, 448], evidence: "established" },
        { id: "joint_space_width", name: "Joint Space Width", value: 4, unit: "mm", range: [2, 6], evidence: "established" },
        { id: "synovial_thickness", name: "Synovial Thickness", value: 2, unit: "mm", range: [1, 4], evidence: "established" },
      ],
      equations: [
        {
          id: "das28_formula",
          name: "DAS28-CRP Formula",
          latex: "DAS28 = 0.56\\sqrt{TJC28} + 0.28\\sqrt{SJC28} + 0.36\\ln(CRP+1) + 0.014\\times VAS",
          description: "Disease activity score for RA",
          evidence: "established",
          source: "EULAR"
        },
        {
          id: "erosion_progression",
          name: "Erosion Progression Rate (PhiCor)",
          latex: "EPR = \\frac{\\Delta Sharp}{\\Delta time} \\times \\frac{DAS28}{2.6}",
          description: "Adjusted erosion progression",
          evidence: "novel",
          source: "PhiCor derived"
        }
      ]
    }
  },

  // ============== SKIN ==============
  skin: {
    name: "Skin",
    icon: ORGAN_ICONS.skin,
    category: "dermatological",
    
    geometry: {
      title: "Skin Measurements",
      parameters: [
        { id: "epidermis_thickness", name: "Epidermis Thickness", value: 0.1, unit: "mm", range: [0.05, 0.2], evidence: "established" },
        { id: "dermis_thickness", name: "Dermis Thickness", value: 2, unit: "mm", range: [1, 4], evidence: "established" },
        { id: "bsa_affected", name: "BSA Affected", value: 0, unit: "%", range: [0, 100], evidence: "established" },
      ],
      equations: [
        {
          id: "bsa_formula",
          name: "Body Surface Area",
          latex: "BSA = \\sqrt{\\frac{Height\\ (cm) \\times Weight\\ (kg)}{3600}}",
          description: "Mosteller formula",
          evidence: "established",
          source: "Dermatology"
        }
      ]
    },

    physiology: {
      title: "Skin Function",
      parameters: [
        { id: "pasi_score", name: "PASI Score", value: 0, unit: "", range: [0, 72], evidence: "established" },
        { id: "dlqi", name: "DLQI Score", value: 0, unit: "", range: [0, 30], evidence: "established" },
        { id: "scorad", name: "SCORAD Index", value: 0, unit: "", range: [0, 103], evidence: "established" },
        { id: "easi", name: "EASI Score", value: 0, unit: "", range: [0, 72], evidence: "established" },
        { id: "tewl", name: "Trans-Epidermal Water Loss", value: 10, unit: "g/m²/hr", range: [5, 15], evidence: "established" },
      ],
      equations: [
        {
          id: "pasi_formula",
          name: "PASI Calculation",
          latex: "PASI = 0.1(E_h + I_h + D_h)A_h + 0.2(E_t + I_t + D_t)A_t + 0.3(E_u + I_u + D_u)A_u + 0.4(E_l + I_l + D_l)A_l",
          description: "Psoriasis severity index",
          evidence: "established",
          source: "Dermatology"
        }
      ]
    }
  },

  // ============== CELLULAR & MOLECULAR LEVEL ==============
  cellular: {
    name: "Cellular & Molecular",
    icon: ORGAN_ICONS.cellular,
    category: "molecular",
    
    // DNA & GENETICS
    dna: {
      title: "DNA & Genetic Parameters",
      parameters: [
        // === CHROMOSOMAL & GENOMIC STABILITY ===
        { id: "telomere_length", name: "Telomere Length", value: 7000, unit: "bp", range: [4000, 15000], evidence: "established" },
        { id: "dna_methylation_global", name: "Global DNA Methylation", value: 4.5, unit: "%", range: [3, 6], evidence: "established" },
        { id: "mitochondrial_dna_copy", name: "mtDNA Copy Number", value: 500, unit: "copies/cell", range: [100, 1000], evidence: "established" },
        { id: "mutation_burden", name: "Somatic Mutation Burden", value: 1.5, unit: "mut/Mb", range: [0.5, 10], evidence: "established" },
        { id: "microsatellite_instability", name: "Microsatellite Instability", value: 0, unit: "score", range: [0, 3], evidence: "established" },
        { id: "chromosomal_instability", name: "Chromosomal Instability Index", value: 0.1, unit: "fraction", range: [0, 1], evidence: "novel" },
        { id: "dna_damage_markers", name: "γH2AX Foci", value: 5, unit: "foci/cell", range: [0, 20], evidence: "established" },
        { id: "8ohdg", name: "8-OHdG (Oxidative DNA Damage)", value: 5, unit: "ng/mL", range: [2, 15], evidence: "established" },
        { id: "chromosome_count", name: "Chromosome Count", value: 46, unit: "", range: [45, 47], evidence: "established" },
        { id: "karyotype_abnormalities", name: "Karyotype Abnormalities", value: 0, unit: "count", range: [0, 5], evidence: "established" },
        { id: "copy_number_variants", name: "CNV Count", value: 10, unit: "count", range: [5, 50], evidence: "established" },
        
        // === HEMOGLOBIN & BLOOD GENES ===
        { id: "hbb_gene_expression", name: "HBB Gene (β-globin)", value: 1.0, unit: "fold", range: [0, 1.2], evidence: "established" },
        { id: "hba_gene_expression", name: "HBA Gene (α-globin)", value: 1.0, unit: "fold", range: [0.5, 1.5], evidence: "established" },
        { id: "alpha_beta_globin_ratio", name: "α/β Globin Ratio", value: 1.0, unit: "ratio", range: [0.8, 1.2], evidence: "established" },
        { id: "hbs_variant", name: "HbS (Sickle) Variant", value: 0, unit: "%", range: [0, 100], evidence: "established" },
        { id: "hbe_variant", name: "HbE Variant", value: 0, unit: "%", range: [0, 100], evidence: "established" },
        { id: "hbf_level", name: "Fetal Hemoglobin (HbF)", value: 1, unit: "%", range: [0, 100], evidence: "established" },
        
        // === TUMOR SUPPRESSORS ===
        { id: "tp53_status", name: "TP53 (p53) Status", value: 100, unit: "%function", range: [0, 100], evidence: "established" },
        { id: "brca1_function", name: "BRCA1 Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "brca2_function", name: "BRCA2 Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "rb1_function", name: "RB1 (Retinoblastoma) Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "apc_function", name: "APC Gene Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "pten_function", name: "PTEN Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "cdkn2a_function", name: "CDKN2A (p16) Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "vhl_function", name: "VHL Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "mlh1_function", name: "MLH1 (Lynch) Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "msh2_function", name: "MSH2 Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        
        // === ONCOGENES ===
        { id: "kras_mutation", name: "KRAS Mutation Status", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "egfr_amplification", name: "EGFR Amplification", value: 1.0, unit: "fold", range: [1, 10], evidence: "established" },
        { id: "her2_amplification", name: "HER2/ERBB2 Amplification", value: 1.0, unit: "fold", range: [1, 10], evidence: "established" },
        { id: "myc_amplification", name: "MYC Amplification", value: 1.0, unit: "fold", range: [1, 20], evidence: "established" },
        { id: "pik3ca_mutation", name: "PIK3CA Mutation", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "braf_mutation", name: "BRAF Mutation (V600E)", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "alk_fusion", name: "ALK Fusion Status", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "ret_mutation", name: "RET Mutation/Fusion", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "bcr_abl_fusion", name: "BCR-ABL Fusion (Philadelphia)", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        
        // === METABOLIC GENES (Diabetes, Obesity, Lipids) ===
        { id: "tcf7l2_variant", name: "TCF7L2 Risk Variant", value: 0, unit: "copies", range: [0, 2], evidence: "established" },
        { id: "pparg_function", name: "PPARG Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "kcnj11_variant", name: "KCNJ11 (Kir6.2) Variant", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "hnf1a_function", name: "HNF1A Function (MODY3)", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "gck_function", name: "GCK Function (MODY2)", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "irs1_function", name: "IRS1 Signaling", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "adipoq_expression", name: "Adiponectin (ADIPOQ) Expression", value: 1.0, unit: "fold", range: [0.5, 1.5], evidence: "established" },
        { id: "lep_expression", name: "Leptin (LEP) Expression", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "fto_variant", name: "FTO Obesity Variant", value: 0, unit: "copies", range: [0, 2], evidence: "established" },
        { id: "mc4r_function", name: "MC4R Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        
        // === CARDIOVASCULAR GENES ===
        { id: "ldlr_function", name: "LDL Receptor Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "apob_variant", name: "APOB Variant", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "pcsk9_activity", name: "PCSK9 Activity", value: 1.0, unit: "fold", range: [0.5, 2], evidence: "established" },
        { id: "ace_activity", name: "ACE Gene Activity", value: 1.0, unit: "fold", range: [0.5, 2], evidence: "established" },
        { id: "agt_expression", name: "Angiotensinogen (AGT) Expression", value: 1.0, unit: "fold", range: [0.5, 2], evidence: "established" },
        { id: "scn5a_function", name: "SCN5A (Sodium Channel) Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "kcnq1_function", name: "KCNQ1 (Long QT) Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "mybpc3_function", name: "MYBPC3 (HCM) Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        
        // === NEUROPSYCHIATRIC GENES ===
        { id: "comt_activity", name: "COMT Activity (Val/Met)", value: 1.0, unit: "fold", range: [0.5, 1.5], evidence: "established" },
        { id: "disc1_function", name: "DISC1 Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "nrg1_expression", name: "Neuregulin-1 (NRG1) Expression", value: 1.0, unit: "fold", range: [0.5, 2], evidence: "established" },
        { id: "dtnbp1_expression", name: "Dysbindin (DTNBP1) Expression", value: 1.0, unit: "fold", range: [0.5, 1.5], evidence: "established" },
        { id: "bdnf_expression", name: "BDNF Expression", value: 1.0, unit: "fold", range: [0.5, 2], evidence: "established" },
        { id: "slc6a4_function", name: "Serotonin Transporter (5-HTTLPR)", value: 1.0, unit: "fold", range: [0.5, 1.5], evidence: "established" },
        { id: "drd2_expression", name: "Dopamine D2 Receptor (DRD2)", value: 1.0, unit: "fold", range: [0.5, 2], evidence: "established" },
        { id: "drd4_variant", name: "DRD4 Variant (7R)", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "htr2a_expression", name: "5-HT2A Receptor Expression", value: 1.0, unit: "fold", range: [0.5, 2], evidence: "established" },
        { id: "grin2a_function", name: "GRIN2A (NMDA) Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "chrna7_function", name: "CHRNA7 (Nicotinic) Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "maoa_activity", name: "MAO-A Activity", value: 1.0, unit: "fold", range: [0.5, 2], evidence: "established" },
        
        // === NEURODEGENERATIVE GENES ===
        { id: "apoe4_copies", name: "APOE4 Allele Copies", value: 0, unit: "copies", range: [0, 2], evidence: "established" },
        { id: "app_mutation", name: "APP Mutation Status", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "psen1_mutation", name: "PSEN1 Mutation", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "psen2_mutation", name: "PSEN2 Mutation", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "mapt_mutation", name: "MAPT (Tau) Mutation", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "snca_expression", name: "α-Synuclein (SNCA) Expression", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "lrrk2_mutation", name: "LRRK2 Mutation", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "gba_function", name: "GBA (Glucocerebrosidase) Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "park2_function", name: "Parkin (PARK2) Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "htt_cag_repeats", name: "HTT CAG Repeats (Huntington)", value: 20, unit: "repeats", range: [10, 36], evidence: "established" },
        { id: "sod1_function", name: "SOD1 Function (ALS)", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "c9orf72_expansion", name: "C9orf72 Expansion (ALS/FTD)", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        
        // === INFLAMMATORY & IMMUNE GENES ===
        { id: "il6_expression", name: "IL-6 Gene Expression", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "tnf_expression", name: "TNF-α Gene Expression", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "il1b_expression", name: "IL-1β Gene Expression", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "nfkb_activity", name: "NF-κB Activity", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "hla_b27_status", name: "HLA-B27 Status", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "hla_dr4_status", name: "HLA-DR4 Status", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "ptpn22_variant", name: "PTPN22 Risk Variant", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "stat4_variant", name: "STAT4 Risk Variant", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        { id: "tgfb1_expression", name: "TGF-β1 Expression", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "ifng_expression", name: "IFN-γ Expression", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        
        // === CYSTIC FIBROSIS & ION CHANNELS ===
        { id: "cftr_function", name: "CFTR Channel Function", value: 100, unit: "%", range: [0, 100], evidence: "established" },
        { id: "cftr_f508del", name: "CFTR F508del Mutation", value: 0, unit: "binary", range: [0, 1], evidence: "established" },
        
        // === HORMONE RECEPTORS (Cancer) ===
        { id: "esr1_expression", name: "Estrogen Receptor (ESR1)", value: 1.0, unit: "fold", range: [0, 3], evidence: "established" },
        { id: "pgr_expression", name: "Progesterone Receptor (PGR)", value: 1.0, unit: "fold", range: [0, 3], evidence: "established" },
        { id: "ar_expression", name: "Androgen Receptor (AR)", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
      ],
      equations: [
        {
          id: "biological_age_dna",
          name: "DNA Methylation Age (Horvath Clock)",
          latex: "Age_{DNA} = \\sum_{i=1}^{353} w_i \\cdot \\beta_i + intercept",
          description: "Epigenetic clock predicting biological age from CpG methylation",
          evidence: "established",
          source: "Horvath 2013"
        },
        {
          id: "telomere_attrition",
          name: "Telomere Attrition Rate",
          latex: "\\frac{dL}{dt} = -k_{loss} + k_{telomerase} \\cdot [TERT]",
          description: "Rate of telomere shortening with age",
          evidence: "established",
          source: "Blackburn et al."
        },
        {
          id: "mutation_accumulation",
          name: "Somatic Mutation Accumulation",
          latex: "M(t) = M_0 + \\mu \\cdot N_{divisions} \\cdot t",
          description: "Linear accumulation of somatic mutations with age",
          evidence: "established",
          source: "Welch et al. 2012"
        },
        {
          id: "dna_repair_kinetics",
          name: "DNA Repair Kinetics",
          latex: "\\frac{d[DSB]}{dt} = k_{damage} - k_{NHEJ}[DSB] - k_{HR}[DSB]",
          description: "Double-strand break repair dynamics (NHEJ and HR pathways)",
          evidence: "established",
          source: "DNA repair biology"
        },
        {
          id: "mismatch_repair",
          name: "Mismatch Repair Efficiency",
          latex: "\\eta_{MMR} = 1 - \\frac{Mutations_{observed}}{Mutations_{expected}}",
          description: "Efficiency of mismatch repair (deficient in Lynch syndrome)",
          evidence: "established",
          source: "Cancer genetics"
        },
        {
          id: "cpg_methylation",
          name: "CpG Island Methylation",
          latex: "\\beta = \\frac{M}{M + U + 100}",
          description: "Methylation β-value from methylated/unmethylated signal",
          evidence: "established",
          source: "Epigenetics"
        },
        {
          id: "copy_number_variation",
          name: "Copy Number Variation (CNV)",
          latex: "CNV = \\log_2\\frac{Sample_{intensity}}{Reference_{intensity}}",
          description: "Log-ratio for detecting genomic amplifications/deletions",
          evidence: "established",
          source: "Cytogenetics"
        },
        {
          id: "hardy_weinberg",
          name: "Hardy-Weinberg Equilibrium",
          latex: "p^2 + 2pq + q^2 = 1",
          description: "Allele frequency equilibrium in populations",
          evidence: "established",
          source: "Population genetics"
        },
        {
          id: "globin_chain_balance",
          name: "Globin Chain Imbalance",
          latex: "Imbalance = |\\frac{[\\alpha]}{[\\beta]} - 1| \\times 100\\%",
          description: "Excess α-chains precipitate in β-thalassemia",
          evidence: "established",
          source: "Hematology"
        },
        {
          id: "sickling_threshold",
          name: "HbS Polymerization Threshold",
          latex: "P_{sickle} = \\frac{[HbS]^n}{K_s^n + [HbS]^n} \\times f(PO_2, pH, 2,3-DPG)",
          description: "HbS polymerization dependent on concentration and deoxygenation",
          evidence: "established",
          source: "Sickle cell pathophysiology"
        },
        {
          id: "trisomy_gene_dosage",
          name: "Trisomy Gene Dosage Effect",
          latex: "Expression_{trisomy} = 1.5 \\times Expression_{diploid}",
          description: "Expected 1.5-fold increase in gene expression from trisomy",
          evidence: "established",
          source: "Cytogenetics"
        }
      ]
    },

    // GENE EXPRESSION
    gene_expression: {
      title: "Gene Expression & Signaling Pathways",
      parameters: [
        // === CELL CYCLE & APOPTOSIS ===
        { id: "p53_expression", name: "p53 Expression Level", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "bcl2_expression", name: "BCL-2 (Anti-apoptotic)", value: 1.0, unit: "fold", range: [0.2, 3], evidence: "established" },
        { id: "bax_expression", name: "BAX (Pro-apoptotic)", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "caspase3_activity", name: "Caspase-3 Activity", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "cyclin_d1_expression", name: "Cyclin D1 Expression", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "p21_expression", name: "p21 (CDKN1A) Expression", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        
        // === GROWTH FACTORS & ANGIOGENESIS ===
        { id: "vegf_expression", name: "VEGF Expression", value: 1.0, unit: "fold", range: [0.5, 10], evidence: "established" },
        { id: "egf_expression", name: "EGF Expression", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "igf1_expression", name: "IGF-1 Expression", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "tgfb_expression", name: "TGF-β Expression", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "pdgf_expression", name: "PDGF Expression", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "fgf_expression", name: "FGF Expression", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "hif1a_expression", name: "HIF-1α Expression", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        
        // === MAJOR SIGNALING PATHWAYS ===
        { id: "mtor_activity", name: "mTOR Pathway Activity", value: 1.0, unit: "fold", range: [0.3, 3], evidence: "established" },
        { id: "pi3k_akt_activity", name: "PI3K/AKT Pathway", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "mapk_erk_activity", name: "MAPK/ERK Pathway", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "wnt_beta_catenin", name: "Wnt/β-Catenin Pathway", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "notch_activity", name: "Notch Pathway", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "hedgehog_activity", name: "Hedgehog Pathway", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "jak_stat_activity", name: "JAK/STAT Pathway", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "nfkb_activity", name: "NF-κB Pathway", value: 1.0, unit: "fold", range: [0.5, 10], evidence: "established" },
        { id: "ampk_activity", name: "AMPK Activity", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        
        // === METABOLIC REGULATORS ===
        { id: "sirt1_expression", name: "SIRT1 Expression", value: 1.0, unit: "fold", range: [0.3, 2], evidence: "established" },
        { id: "pgc1a_expression", name: "PGC-1α Expression", value: 1.0, unit: "fold", range: [0.3, 3], evidence: "established" },
        { id: "ppar_gamma_activity", name: "PPAR-γ Activity", value: 1.0, unit: "fold", range: [0.5, 2], evidence: "established" },
        { id: "foxo_activity", name: "FOXO Activity", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "srebp_activity", name: "SREBP Activity", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        
        // === INSULIN SIGNALING ===
        { id: "insulin_receptor_expression", name: "Insulin Receptor Expression", value: 1.0, unit: "fold", range: [0.3, 1.5], evidence: "established" },
        { id: "irs_phosphorylation", name: "IRS Phosphorylation", value: 1.0, unit: "fold", range: [0.3, 1.5], evidence: "established" },
        { id: "glut4_expression", name: "GLUT4 Expression", value: 1.0, unit: "fold", range: [0.3, 1.5], evidence: "established" },
        
        // === NEUROTRANSMITTER SIGNALING ===
        { id: "dopamine_signaling", name: "Dopamine Signaling", value: 1.0, unit: "fold", range: [0.3, 3], evidence: "established" },
        { id: "serotonin_signaling", name: "Serotonin Signaling", value: 1.0, unit: "fold", range: [0.3, 3], evidence: "established" },
        { id: "gaba_signaling", name: "GABA Signaling", value: 1.0, unit: "fold", range: [0.3, 2], evidence: "established" },
        { id: "glutamate_signaling", name: "Glutamate Signaling", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "acetylcholine_signaling", name: "Acetylcholine Signaling", value: 1.0, unit: "fold", range: [0.3, 2], evidence: "established" },
        
        // === IMMUNE/INFLAMMATORY SIGNALING ===
        { id: "tlr_signaling", name: "TLR Signaling", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "inflammasome_activity", name: "Inflammasome Activity", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "complement_activity", name: "Complement Activation", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        
        // === EXTRACELLULAR MATRIX ===
        { id: "mmp_activity", name: "MMP Activity", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "timp_expression", name: "TIMP Expression", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "collagen_expression", name: "Collagen Expression", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
        { id: "fibronectin_expression", name: "Fibronectin Expression", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "established" },
      ],
      equations: [
        {
          id: "gene_regulation",
          name: "Hill Equation (Gene Regulation)",
          latex: "\\frac{d[mRNA]}{dt} = \\frac{V_{max} \\cdot [TF]^n}{K_d^n + [TF]^n} - k_{deg} \\cdot [mRNA]",
          description: "Transcription factor-mediated gene regulation",
          evidence: "established",
          source: "Systems Biology"
        },
        {
          id: "protein_synthesis",
          name: "Protein Synthesis Rate",
          latex: "\\frac{d[P]}{dt} = k_{trans} \\cdot [mRNA] - k_{deg} \\cdot [P]",
          description: "mRNA to protein translation kinetics",
          evidence: "established",
          source: "Molecular Biology"
        },
        {
          id: "p53_activation",
          name: "p53 Activation Dynamics",
          latex: "\\frac{d[p53^*]}{dt} = k_{act}[DNA_{damage}] - k_{MDM2}[p53^*][MDM2]",
          description: "p53 activation by DNA damage and inhibition by MDM2",
          evidence: "established",
          source: "Tumor suppressor biology"
        },
        {
          id: "nfkb_signaling",
          name: "NF-κB Signaling Cascade",
          latex: "[NF\\kappa B]_{nuclear} = \\frac{[NF\\kappa B]_0}{1 + [I\\kappa B]/K_d}",
          description: "Nuclear translocation gated by IκB degradation",
          evidence: "established",
          source: "Inflammatory signaling"
        },
        {
          id: "hypoxia_response",
          name: "HIF-1α Hypoxia Response",
          latex: "[HIF1\\alpha] = \\frac{k_{synth}}{k_{deg} \\cdot f([O_2])}",
          description: "HIF-1α stabilization under low oxygen",
          evidence: "established",
          source: "Hypoxia biology"
        }
      ]
    },

    // CELLULAR METABOLISM
    metabolism: {
      title: "Cellular Metabolism",
      parameters: [
        { id: "atp_production", name: "ATP Production Rate", value: 100, unit: "μmol/min/g", range: [50, 200], evidence: "established" },
        { id: "nad_ratio", name: "NAD+/NADH Ratio", value: 3, unit: "ratio", range: [1, 10], evidence: "established" },
        { id: "ros_level", name: "ROS Level", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "glutathione_ratio", name: "GSH/GSSG Ratio", value: 100, unit: "ratio", range: [30, 300], evidence: "established" },
        { id: "lactate_pyruvate", name: "Lactate/Pyruvate Ratio", value: 10, unit: "ratio", range: [5, 25], evidence: "established" },
        { id: "oxygen_consumption", name: "O₂ Consumption Rate", value: 250, unit: "mL/min", range: [150, 400], evidence: "established" },
        { id: "mitochondrial_membrane_potential", name: "ΔΨm (Mitochondrial)", value: -180, unit: "mV", range: [-200, -140], evidence: "established" },
        { id: "autophagy_flux", name: "Autophagy Flux", value: 1.0, unit: "fold", range: [0.5, 3], evidence: "novel" },
      ],
      equations: [
        {
          id: "michaelis_menten",
          name: "Michaelis-Menten Kinetics",
          latex: "v = \\frac{V_{max} \\cdot [S]}{K_m + [S]}",
          description: "Enzyme reaction velocity",
          evidence: "established",
          source: "Biochemistry"
        },
        {
          id: "warburg_effect",
          name: "Warburg Effect Index",
          latex: "WEI = \\frac{Glycolysis_{rate}}{OXPHOS_{rate}} \\times \\frac{[Lactate]}{[Pyruvate]}",
          description: "Metabolic shift toward aerobic glycolysis",
          evidence: "established",
          source: "Cancer metabolism"
        }
      ]
    },

    // CELL CYCLE & PROLIFERATION
    cell_cycle: {
      title: "Cell Cycle & Proliferation",
      parameters: [
        { id: "ki67_index", name: "Ki-67 Proliferation Index", value: 5, unit: "%", range: [1, 90], evidence: "established" },
        { id: "mitotic_index", name: "Mitotic Index", value: 2, unit: "%", range: [0, 10], evidence: "established" },
        { id: "apoptotic_index", name: "Apoptotic Index", value: 1, unit: "%", range: [0, 10], evidence: "established" },
        { id: "cell_cycle_time", name: "Cell Cycle Time", value: 24, unit: "hours", range: [12, 72], evidence: "established" },
        { id: "s_phase_fraction", name: "S-Phase Fraction", value: 10, unit: "%", range: [5, 30], evidence: "established" },
        { id: "ploidy", name: "DNA Ploidy (DI)", value: 1.0, unit: "index", range: [0.9, 2.5], evidence: "established" },
        { id: "senescence_markers", name: "Senescent Cell Fraction", value: 5, unit: "%", range: [1, 30], evidence: "novel" },
        { id: "g1_phase_duration", name: "G1 Phase Duration", value: 11, unit: "hours", range: [6, 24], evidence: "established" },
        { id: "s_phase_duration", name: "S Phase Duration", value: 8, unit: "hours", range: [4, 12], evidence: "established" },
        { id: "g2_phase_duration", name: "G2 Phase Duration", value: 4, unit: "hours", range: [2, 8], evidence: "established" },
        { id: "m_phase_duration", name: "M Phase Duration", value: 1, unit: "hours", range: [0.5, 2], evidence: "established" },
        { id: "p21_expression", name: "p21 Expression (CDK Inhibitor)", value: 1.0, unit: "fold", range: [0.5, 10], evidence: "established" },
        { id: "cyclin_d1", name: "Cyclin D1 Level", value: 1.0, unit: "fold", range: [0.5, 5], evidence: "established" },
        { id: "rb_phosphorylation", name: "Rb Phosphorylation", value: 0.3, unit: "fraction", range: [0.1, 0.9], evidence: "established" },
      ],
      equations: [
        {
          id: "doubling_time",
          name: "Population Doubling Time",
          latex: "T_d = \\frac{\\ln(2)}{\\mu} = \\frac{t \\cdot \\ln(2)}{\\ln(N/N_0)}",
          description: "Time for cell population to double",
          evidence: "established",
          source: "Cell biology"
        },
        {
          id: "growth_fraction",
          name: "Growth Fraction (GF)",
          latex: "GF = \\frac{N_{cycling}}{N_{total}} = \\frac{Ki67^+}{Total\\ cells}",
          description: "Fraction of cells actively in cycle",
          evidence: "established",
          source: "Oncology"
        },
        {
          id: "cell_loss_factor",
          name: "Cell Loss Factor (φ)",
          latex: "\\phi = 1 - \\frac{T_d^{actual}}{T_d^{potential}}",
          description: "Fraction of cells lost (apoptosis, necrosis, differentiation)",
          evidence: "established",
          source: "Tumor kinetics"
        },
        {
          id: "gompertz_growth",
          name: "Gompertz Tumor Growth",
          latex: "V(t) = V_0 \\times e^{\\frac{A}{B}(1-e^{-Bt})}",
          description: "Tumor volume over time with growth deceleration",
          evidence: "established",
          source: "Cancer biology"
        },
        {
          id: "rb_checkpoint",
          name: "Rb Checkpoint Regulation",
          latex: "G1 \\rightarrow S = f(\\frac{[CyclinD \\cdot CDK4]}{[p16] + [p21]})",
          description: "G1/S transition gated by Rb phosphorylation",
          evidence: "established",
          source: "Cell cycle regulation"
        },
        {
          id: "apoptosis_rate",
          name: "Apoptosis Rate",
          latex: "k_{apoptosis} = k_0 \\times \\frac{[Bax]}{[Bcl2]} \\times f([p53])",
          description: "Rate of programmed cell death",
          evidence: "established",
          source: "Apoptosis signaling"
        }
      ]
    }
  }
};

export default ORGAN_MODELS;
