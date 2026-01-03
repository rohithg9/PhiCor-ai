#!/usr/bin/env python3
"""
Phase 2: Comprehensive Static Disease Model Generator
================================================================================
Generates detailed disease models following the exact diseaseModels.js format:
- All organ system modifications (geometry, pressures, structure, physiology, cellular, DNA)
- Mathematical models and novel equations
- DNA/genetic aberrations
- Disease progression stages
- Clinical presentation with treatments

Output: 
1. Merges into /app/frontend/src/data/diseaseModels.js
2. Stores in MongoDB for dynamic loading
================================================================================
"""

import asyncio
import os
import json
import re
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

DISEASE_MODELS_FILE = "/app/frontend/src/data/diseaseModels.js"

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    HAS_LLM = True
except ImportError:
    HAS_LLM = False
    print("ERROR: LLM not available. Install emergentintegrations.")

# Priority order for disease categories
CATEGORY_PRIORITY = [
    "cardiac", "cardiovascular", "cardiomyopathy", "arrhythmia", "valvular", "ischemic", "heartFailure",
    "respiratory", "pulmonary",
    "neurological", "cerebrovascular",
    "oncology", "oncological", "hematological_malignancy",
    "renal", "nephrology",
    "hepatic", "liver",
    "metabolic", "endocrine",
    "hematological",
    "infectious",
    "autoimmune", "rheumatological", "rheumatic",
    "gastrointestinal",
    "psychiatric",
    "genetic",
    "dermatological", "dermatology",
    "musculoskeletal",
    "ophthalmology",
    "otolaryngology", "ent",
    "urology",
    "obstetric_gynecologic", "obstetrics", "gynecology", "obgyn",
    "pediatric", "neonatology",
    "geriatric",
    "emergency", "acute",
    "general"
]

# Complete parameter structure for each organ system
ORGAN_PARAMETER_TEMPLATE = {
    "heart": {
        "geometry": {
            "params": ["lv_edv", "lv_esv", "lv_wall_thickness", "lv_mass", "la_volume", "rv_edv", "rv_esv", "aortic_root", "lv_long_axis", "ivs_thickness", "pw_thickness", "la_diameter"],
            "units": {"lv_edv": "mL", "lv_esv": "mL", "lv_wall_thickness": "mm", "lv_mass": "g", "la_volume": "mL", "rv_edv": "mL", "rv_esv": "mL", "aortic_root": "mm", "lv_long_axis": "mm", "ivs_thickness": "mm", "pw_thickness": "mm", "la_diameter": "mm"}
        },
        "pressures": {
            "params": ["lv_edp", "systolic_bp", "diastolic_bp", "map", "pa_sys", "pa_dia", "pa_mean", "pcwp", "la_pressure", "cvp", "aortic_gradient", "rv_sys_pressure"],
            "units": {"lv_edp": "mmHg", "systolic_bp": "mmHg", "diastolic_bp": "mmHg", "map": "mmHg", "pa_sys": "mmHg", "pa_dia": "mmHg", "pa_mean": "mmHg", "pcwp": "mmHg", "la_pressure": "mmHg", "cvp": "mmHg", "aortic_gradient": "mmHg", "rv_sys_pressure": "mmHg"}
        },
        "structure": {
            "params": ["collagen_fraction", "myocyte_density", "capillary_density", "fibrosis_percent", "fat_infiltration", "myofibril_density", "mitochondria_density", "intercalated_disc_integrity"],
            "units": {"collagen_fraction": "%", "myocyte_density": "cells/mm²", "capillary_density": "vessels/mm²", "fibrosis_percent": "%", "fat_infiltration": "%", "myofibril_density": "%", "mitochondria_density": "%", "intercalated_disc_integrity": "%"}
        },
        "physiology": {
            "params": ["ef", "cardiac_output", "stroke_volume", "cardiac_index", "gls", "e_a_ratio", "e_e_prime", "deceleration_time", "ivrt", "tapse", "sv_variation", "dp_dt"],
            "units": {"ef": "%", "cardiac_output": "L/min", "stroke_volume": "mL", "cardiac_index": "L/min/m²", "gls": "%", "e_a_ratio": "ratio", "e_e_prime": "ratio", "deceleration_time": "ms", "ivrt": "ms", "tapse": "mm", "sv_variation": "%", "dp_dt": "mmHg/s"}
        },
        "cellular": {
            "params": ["sarcomere_length", "calcium_transient", "atp_concentration", "apd", "conduction_velocity", "crossbridge_cycling", "troponin_sensitivity", "serca_activity", "ryr_activity", "ncx_activity"],
            "units": {"sarcomere_length": "μm", "calcium_transient": "μM", "atp_concentration": "mM", "apd": "ms", "conduction_velocity": "m/s", "crossbridge_cycling": "s⁻¹", "troponin_sensitivity": "relative", "serca_activity": "%", "ryr_activity": "%", "ncx_activity": "%"}
        },
        "lab_tests": {
            "params": ["troponin_i", "troponin_t", "bnp", "nt_probnp", "ck_mb", "ldh", "hs_crp", "homocysteine", "lp_a"],
            "units": {"troponin_i": "ng/mL", "troponin_t": "ng/mL", "bnp": "pg/mL", "nt_probnp": "pg/mL", "ck_mb": "ng/mL", "ldh": "U/L", "hs_crp": "mg/L", "homocysteine": "μmol/L", "lp_a": "nmol/L"}
        },
        "ecg": {
            "params": ["pr_interval", "qrs_duration", "qtc_interval", "qt_interval", "heart_rate", "p_wave_duration", "st_deviation", "t_wave_amplitude"],
            "units": {"pr_interval": "ms", "qrs_duration": "ms", "qtc_interval": "ms", "qt_interval": "ms", "heart_rate": "bpm", "p_wave_duration": "ms", "st_deviation": "mm", "t_wave_amplitude": "mm"}
        },
        "imaging": {
            "params": ["lvef_echo", "lv_strain", "rv_strain", "wall_motion_score", "valve_regurgitation", "pericardial_effusion", "lge_extent"],
            "units": {"lvef_echo": "%", "lv_strain": "%", "rv_strain": "%", "wall_motion_score": "score", "valve_regurgitation": "grade", "pericardial_effusion": "mm", "lge_extent": "%"}
        }
    },
    "lungs": {
        "geometry": {
            "params": ["total_lung_capacity", "vital_capacity", "tidal_volume", "residual_volume", "frc", "inspiratory_capacity"],
            "units": {"total_lung_capacity": "L", "vital_capacity": "L", "tidal_volume": "mL", "residual_volume": "L", "frc": "L", "inspiratory_capacity": "L"}
        },
        "pressures": {
            "params": ["alveolar_pressure", "pleural_pressure", "transpulmonary_pressure", "airway_resistance", "peak_inspiratory_pressure", "plateau_pressure", "peep"],
            "units": {"alveolar_pressure": "cmH2O", "pleural_pressure": "cmH2O", "transpulmonary_pressure": "cmH2O", "airway_resistance": "cmH2O/L/s", "peak_inspiratory_pressure": "cmH2O", "plateau_pressure": "cmH2O", "peep": "cmH2O"}
        },
        "structure": {
            "params": ["alveolar_surface_area", "alveolar_wall_thickness", "capillary_density", "fibrosis_score", "emphysema_index", "bronchial_wall_thickness", "mucus_gland_hyperplasia"],
            "units": {"alveolar_surface_area": "m²", "alveolar_wall_thickness": "μm", "capillary_density": "vessels/mm²", "fibrosis_score": "grade", "emphysema_index": "%", "bronchial_wall_thickness": "mm", "mucus_gland_hyperplasia": "%"}
        },
        "physiology": {
            "params": ["fev1", "fvc", "fev1_fvc_ratio", "dlco", "dlco_va", "vq_ratio", "pao2", "paco2", "spo2", "respiratory_rate", "minute_ventilation", "compliance"],
            "units": {"fev1": "L", "fvc": "L", "fev1_fvc_ratio": "%", "dlco": "mL/min/mmHg", "dlco_va": "mL/min/mmHg/L", "vq_ratio": "ratio", "pao2": "mmHg", "paco2": "mmHg", "spo2": "%", "respiratory_rate": "/min", "minute_ventilation": "L/min", "compliance": "mL/cmH2O"}
        },
        "cellular": {
            "params": ["surfactant_level", "type1_pneumocytes", "type2_pneumocytes", "alveolar_macrophages", "inflammatory_cells", "mast_cells", "goblet_cells"],
            "units": {"surfactant_level": "mg/mL", "type1_pneumocytes": "cells/field", "type2_pneumocytes": "cells/field", "alveolar_macrophages": "cells/field", "inflammatory_cells": "cells/field", "mast_cells": "cells/field", "goblet_cells": "cells/field"}
        },
        "lab_tests": {
            "params": ["arterial_ph", "bicarbonate", "base_excess", "lactate", "d_dimer", "pro_bnp", "procalcitonin"],
            "units": {"arterial_ph": "pH", "bicarbonate": "mEq/L", "base_excess": "mEq/L", "lactate": "mmol/L", "d_dimer": "ng/mL", "pro_bnp": "pg/mL", "procalcitonin": "ng/mL"}
        },
        "imaging": {
            "params": ["ground_glass_opacity", "consolidation", "nodules", "fibrosis_extent", "emphysema_extent", "bronchiectasis", "pleural_effusion"],
            "units": {"ground_glass_opacity": "%", "consolidation": "%", "nodules": "count", "fibrosis_extent": "%", "emphysema_extent": "%", "bronchiectasis": "grade", "pleural_effusion": "mL"}
        }
    },
    "kidneys": {
        "geometry": {
            "params": ["kidney_length", "kidney_width", "cortical_thickness", "parenchymal_volume", "pelvis_diameter"],
            "units": {"kidney_length": "cm", "kidney_width": "cm", "cortical_thickness": "mm", "parenchymal_volume": "mL", "pelvis_diameter": "mm"}
        },
        "pressures": {
            "params": ["glomerular_cap_pressure", "tubular_pressure", "renal_perfusion_pressure", "bowmans_capsule_pressure", "peritubular_cap_pressure"],
            "units": {"glomerular_cap_pressure": "mmHg", "tubular_pressure": "mmHg", "renal_perfusion_pressure": "mmHg", "bowmans_capsule_pressure": "mmHg", "peritubular_cap_pressure": "mmHg"}
        },
        "structure": {
            "params": ["glomerular_count", "glomerulosclerosis", "tubular_atrophy", "interstitial_fibrosis", "vascular_sclerosis", "podocyte_density"],
            "units": {"glomerular_count": "per kidney", "glomerulosclerosis": "%", "tubular_atrophy": "%", "interstitial_fibrosis": "%", "vascular_sclerosis": "%", "podocyte_density": "cells/glomerulus"}
        },
        "physiology": {
            "params": ["gfr", "egfr", "creatinine_clearance", "rbf", "filtration_fraction", "urine_output", "urine_concentration", "sodium_excretion", "potassium_excretion"],
            "units": {"gfr": "mL/min/1.73m²", "egfr": "mL/min/1.73m²", "creatinine_clearance": "mL/min", "rbf": "mL/min", "filtration_fraction": "%", "urine_output": "mL/day", "urine_concentration": "mOsm/kg", "sodium_excretion": "mEq/day", "potassium_excretion": "mEq/day"}
        },
        "cellular": {
            "params": ["podocyte_foot_process", "mesangial_expansion", "tubular_cell_injury", "endothelial_function", "raas_activity"],
            "units": {"podocyte_foot_process": "nm", "mesangial_expansion": "%", "tubular_cell_injury": "%", "endothelial_function": "%", "raas_activity": "%"}
        },
        "lab_tests": {
            "params": ["creatinine", "bun", "cystatin_c", "uric_acid", "phosphorus", "potassium", "sodium", "calcium", "magnesium", "albumin"],
            "units": {"creatinine": "mg/dL", "bun": "mg/dL", "cystatin_c": "mg/L", "uric_acid": "mg/dL", "phosphorus": "mg/dL", "potassium": "mEq/L", "sodium": "mEq/L", "calcium": "mg/dL", "magnesium": "mg/dL", "albumin": "g/dL"}
        },
        "urinalysis": {
            "params": ["proteinuria", "albuminuria", "hematuria", "upcr", "uacr", "specific_gravity", "urine_ph", "casts", "crystals"],
            "units": {"proteinuria": "mg/day", "albuminuria": "mg/day", "hematuria": "RBC/hpf", "upcr": "mg/g", "uacr": "mg/g", "specific_gravity": "ratio", "urine_ph": "pH", "casts": "per lpf", "crystals": "per hpf"}
        }
    },
    "liver": {
        "geometry": {
            "params": ["liver_span", "liver_volume", "spleen_size", "portal_vein_diameter", "hepatic_vein_diameter"],
            "units": {"liver_span": "cm", "liver_volume": "mL", "spleen_size": "cm", "portal_vein_diameter": "mm", "hepatic_vein_diameter": "mm"}
        },
        "pressures": {
            "params": ["portal_pressure", "hepatic_vein_pressure", "hvpg", "wedge_pressure", "sinusoidal_pressure"],
            "units": {"portal_pressure": "mmHg", "hepatic_vein_pressure": "mmHg", "hvpg": "mmHg", "wedge_pressure": "mmHg", "sinusoidal_pressure": "mmHg"}
        },
        "structure": {
            "params": ["fibrosis_stage", "steatosis_grade", "inflammation_grade", "ballooning", "mallory_bodies", "bile_duct_proliferation"],
            "units": {"fibrosis_stage": "F0-F4", "steatosis_grade": "S0-S3", "inflammation_grade": "grade", "ballooning": "grade", "mallory_bodies": "present", "bile_duct_proliferation": "%"}
        },
        "physiology": {
            "params": ["hepatic_blood_flow", "bile_flow", "albumin_synthesis", "clotting_factor_synthesis", "drug_metabolism", "bilirubin_conjugation", "ammonia_clearance"],
            "units": {"hepatic_blood_flow": "mL/min", "bile_flow": "mL/day", "albumin_synthesis": "g/day", "clotting_factor_synthesis": "%", "drug_metabolism": "%", "bilirubin_conjugation": "%", "ammonia_clearance": "%"}
        },
        "cellular": {
            "params": ["hepatocyte_function", "kupffer_cell_activity", "stellate_cell_activation", "cholangiocyte_function", "sinusoidal_endothelium"],
            "units": {"hepatocyte_function": "%", "kupffer_cell_activity": "%", "stellate_cell_activation": "%", "cholangiocyte_function": "%", "sinusoidal_endothelium": "%"}
        },
        "lab_tests": {
            "params": ["alt", "ast", "alp", "ggt", "bilirubin_total", "bilirubin_direct", "albumin", "total_protein", "pt_inr", "ammonia", "ldh"],
            "units": {"alt": "U/L", "ast": "U/L", "alp": "U/L", "ggt": "U/L", "bilirubin_total": "mg/dL", "bilirubin_direct": "mg/dL", "albumin": "g/dL", "total_protein": "g/dL", "pt_inr": "INR", "ammonia": "μmol/L", "ldh": "U/L"}
        }
    },
    "brain": {
        "geometry": {
            "params": ["brain_volume", "gray_matter_volume", "white_matter_volume", "ventricle_size", "cortical_thickness", "hippocampal_volume", "corpus_callosum_area"],
            "units": {"brain_volume": "mL", "gray_matter_volume": "mL", "white_matter_volume": "mL", "ventricle_size": "mL", "cortical_thickness": "mm", "hippocampal_volume": "mL", "corpus_callosum_area": "mm²"}
        },
        "pressures": {
            "params": ["intracranial_pressure", "cerebral_perfusion_pressure", "csf_pressure", "venous_pressure"],
            "units": {"intracranial_pressure": "mmHg", "cerebral_perfusion_pressure": "mmHg", "csf_pressure": "cmH2O", "venous_pressure": "mmHg"}
        },
        "structure": {
            "params": ["white_matter_integrity", "gray_matter_density", "lesion_load", "microbleeds", "lacunar_infarcts", "perivascular_spaces"],
            "units": {"white_matter_integrity": "FA", "gray_matter_density": "g/mL", "lesion_load": "mL", "microbleeds": "count", "lacunar_infarcts": "count", "perivascular_spaces": "grade"}
        },
        "physiology": {
            "params": ["cerebral_blood_flow", "cerebral_metabolic_rate", "glucose_metabolism", "oxygen_extraction", "neurotransmitter_dopamine", "neurotransmitter_serotonin", "neurotransmitter_gaba"],
            "units": {"cerebral_blood_flow": "mL/100g/min", "cerebral_metabolic_rate": "mL O2/100g/min", "glucose_metabolism": "mg/100g/min", "oxygen_extraction": "%", "neurotransmitter_dopamine": "relative", "neurotransmitter_serotonin": "relative", "neurotransmitter_gaba": "relative"}
        },
        "cellular": {
            "params": ["neuronal_density", "glial_activation", "synaptic_density", "amyloid_load", "tau_protein", "alpha_synuclein", "microglial_activation", "astrocyte_reactivity"],
            "units": {"neuronal_density": "neurons/mm³", "glial_activation": "%", "synaptic_density": "synapses/μm³", "amyloid_load": "SUVR", "tau_protein": "SUVR", "alpha_synuclein": "pg/mL", "microglial_activation": "%", "astrocyte_reactivity": "%"}
        },
        "lab_tests": {
            "params": ["csf_protein", "csf_glucose", "csf_cell_count", "csf_oligoclonal_bands", "neurofilament_light", "s100b", "nse"],
            "units": {"csf_protein": "mg/dL", "csf_glucose": "mg/dL", "csf_cell_count": "cells/μL", "csf_oligoclonal_bands": "bands", "neurofilament_light": "pg/mL", "s100b": "μg/L", "nse": "ng/mL"}
        },
        "neurological": {
            "params": ["gcs", "nihss", "mmse", "moca", "updrs", "edss", "barthel_index"],
            "units": {"gcs": "score", "nihss": "score", "mmse": "score", "moca": "score", "updrs": "score", "edss": "score", "barthel_index": "score"}
        }
    },
    "blood": {
        "cbc": {
            "params": ["hemoglobin", "hematocrit", "rbc_count", "wbc_count", "platelet_count", "mcv", "mch", "mchc", "rdw", "mpv"],
            "units": {"hemoglobin": "g/dL", "hematocrit": "%", "rbc_count": "×10⁶/μL", "wbc_count": "×10³/μL", "platelet_count": "×10³/μL", "mcv": "fL", "mch": "pg", "mchc": "g/dL", "rdw": "%", "mpv": "fL"}
        },
        "differential": {
            "params": ["neutrophils", "lymphocytes", "monocytes", "eosinophils", "basophils", "bands", "atypical_lymphocytes"],
            "units": {"neutrophils": "%", "lymphocytes": "%", "monocytes": "%", "eosinophils": "%", "basophils": "%", "bands": "%", "atypical_lymphocytes": "%"}
        },
        "coagulation": {
            "params": ["pt", "ptt", "inr", "fibrinogen", "d_dimer", "bleeding_time", "antithrombin", "protein_c", "protein_s"],
            "units": {"pt": "seconds", "ptt": "seconds", "inr": "ratio", "fibrinogen": "mg/dL", "d_dimer": "ng/mL", "bleeding_time": "minutes", "antithrombin": "%", "protein_c": "%", "protein_s": "%"}
        },
        "chemistry": {
            "params": ["glucose", "hba1c", "total_protein", "globulin", "iron", "ferritin", "tibc", "transferrin_sat", "b12", "folate", "reticulocyte_count"],
            "units": {"glucose": "mg/dL", "hba1c": "%", "total_protein": "g/dL", "globulin": "g/dL", "iron": "μg/dL", "ferritin": "ng/mL", "tibc": "μg/dL", "transferrin_sat": "%", "b12": "pg/mL", "folate": "ng/mL", "reticulocyte_count": "%"}
        },
        "inflammatory": {
            "params": ["esr", "crp", "procalcitonin", "il6", "tnf_alpha", "il1_beta", "il10"],
            "units": {"esr": "mm/hr", "crp": "mg/L", "procalcitonin": "ng/mL", "il6": "pg/mL", "tnf_alpha": "pg/mL", "il1_beta": "pg/mL", "il10": "pg/mL"}
        }
    },
    "cellular": {
        "dna": {
            "params": ["telomere_length", "dna_methylation_global", "mtdna_copy_number", "somatic_mutation_burden", "chromosomal_instability", "dna_damage_8ohdg", "gamma_h2ax_foci"],
            "units": {"telomere_length": "bp", "dna_methylation_global": "%", "mtdna_copy_number": "copies/cell", "somatic_mutation_burden": "mut/Mb", "chromosomal_instability": "index", "dna_damage_8ohdg": "ng/mL", "gamma_h2ax_foci": "foci/cell"}
        },
        "genetics": {
            "params": ["brca1_status", "brca2_status", "tp53_status", "kras_status", "egfr_status", "her2_status", "msh2_status", "mlh1_status", "apc_status", "rb1_status", "vhl_status", "myh7_status", "mybpc3_status", "scn5a_status", "lmna_status", "ttn_status"],
            "units": {"brca1_status": "status", "brca2_status": "status", "tp53_status": "status", "kras_status": "status", "egfr_status": "status", "her2_status": "status", "msh2_status": "status", "mlh1_status": "status", "apc_status": "status", "rb1_status": "status", "vhl_status": "status", "myh7_status": "status", "mybpc3_status": "status", "scn5a_status": "status", "lmna_status": "status", "ttn_status": "status"}
        },
        "gene_expression": {
            "params": ["transcription_rate", "mrna_stability", "protein_translation", "post_translational_mod", "protein_degradation"],
            "units": {"transcription_rate": "relative", "mrna_stability": "hours", "protein_translation": "relative", "post_translational_mod": "index", "protein_degradation": "relative"}
        },
        "metabolism": {
            "params": ["atp_level", "adp_level", "amp_level", "nad_nadh_ratio", "ros_level", "lactate_cellular", "pyruvate_cellular", "citrate_level", "succinate_level"],
            "units": {"atp_level": "mM", "adp_level": "mM", "amp_level": "mM", "nad_nadh_ratio": "ratio", "ros_level": "relative", "lactate_cellular": "mM", "pyruvate_cellular": "mM", "citrate_level": "mM", "succinate_level": "mM"}
        },
        "cell_cycle": {
            "params": ["proliferation_rate", "apoptosis_rate", "necrosis_rate", "senescence_markers", "autophagy_flux", "cell_cycle_g1", "cell_cycle_s", "cell_cycle_g2m"],
            "units": {"proliferation_rate": "%/day", "apoptosis_rate": "%", "necrosis_rate": "%", "senescence_markers": "index", "autophagy_flux": "relative", "cell_cycle_g1": "%", "cell_cycle_s": "%", "cell_cycle_g2m": "%"}
        }
    },
    "pancreas": {
        "physiology": {
            "params": ["insulin_secretion", "glucagon_secretion", "somatostatin_secretion", "beta_cell_function", "insulin_sensitivity", "first_phase_insulin", "second_phase_insulin"],
            "units": {"insulin_secretion": "μU/mL", "glucagon_secretion": "pg/mL", "somatostatin_secretion": "pg/mL", "beta_cell_function": "%", "insulin_sensitivity": "index", "first_phase_insulin": "μU/mL", "second_phase_insulin": "μU/mL"}
        },
        "structure": {
            "params": ["islet_mass", "beta_cell_count", "alpha_cell_count", "delta_cell_count", "islet_amyloid", "pancreatic_fibrosis"],
            "units": {"islet_mass": "mg", "beta_cell_count": "×10⁶", "alpha_cell_count": "×10⁶", "delta_cell_count": "×10⁶", "islet_amyloid": "%", "pancreatic_fibrosis": "%"}
        },
        "lab_tests": {
            "params": ["fasting_glucose", "fasting_insulin", "c_peptide", "homa_ir", "homa_b", "amylase", "lipase", "trypsin"],
            "units": {"fasting_glucose": "mg/dL", "fasting_insulin": "μU/mL", "c_peptide": "ng/mL", "homa_ir": "index", "homa_b": "%", "amylase": "U/L", "lipase": "U/L", "trypsin": "ng/mL"}
        }
    },
    "thyroid": {
        "physiology": {
            "params": ["t4_production", "t3_production", "t3_conversion", "tsh_response", "thyroglobulin_synthesis", "iodine_uptake"],
            "units": {"t4_production": "μg/day", "t3_production": "μg/day", "t3_conversion": "%", "tsh_response": "mU/L", "thyroglobulin_synthesis": "ng/mL", "iodine_uptake": "%"}
        },
        "structure": {
            "params": ["thyroid_volume", "nodule_count", "nodule_size", "vascularity", "echogenicity"],
            "units": {"thyroid_volume": "mL", "nodule_count": "count", "nodule_size": "mm", "vascularity": "grade", "echogenicity": "grade"}
        },
        "lab_tests": {
            "params": ["tsh", "free_t4", "free_t3", "total_t4", "total_t3", "thyroglobulin", "tpo_antibodies", "trab", "thyroglobulin_ab"],
            "units": {"tsh": "mU/L", "free_t4": "ng/dL", "free_t3": "pg/mL", "total_t4": "μg/dL", "total_t3": "ng/dL", "thyroglobulin": "ng/mL", "tpo_antibodies": "IU/mL", "trab": "IU/L", "thyroglobulin_ab": "IU/mL"}
        }
    }
}


async def generate_comprehensive_model(disease_name: str, icd10: str, category: str, existing_mods: dict = None) -> dict:
    """Generate a comprehensive disease model using GPT-4o"""
    if not HAS_LLM or not EMERGENT_LLM_KEY:
        print("ERROR: LLM not available")
        return None
    
    # Determine affected organs based on category
    category_to_organs = {
        "cardiac": ["heart", "lungs", "kidneys", "blood", "cellular"],
        "cardiovascular": ["heart", "lungs", "kidneys", "blood", "cellular"],
        "cardiomyopathy": ["heart", "lungs", "kidneys", "liver", "cellular"],
        "arrhythmia": ["heart", "brain", "blood", "cellular"],
        "respiratory": ["lungs", "heart", "blood", "cellular"],
        "renal": ["kidneys", "heart", "blood", "cellular"],
        "hepatic": ["liver", "blood", "kidneys", "cellular"],
        "neurological": ["brain", "cellular", "blood"],
        "metabolic": ["pancreas", "liver", "kidneys", "heart", "blood", "cellular"],
        "endocrine": ["thyroid", "pancreas", "blood", "cellular"],
        "hematological": ["blood", "cellular"],
        "oncology": ["cellular", "blood", "liver"],
        "infectious": ["blood", "lungs", "liver", "cellular"],
        "autoimmune": ["blood", "cellular", "kidneys"],
        "gastrointestinal": ["liver", "blood", "cellular"],
    }
    
    organs = category_to_organs.get(category, ["heart", "lungs", "kidneys", "blood", "cellular"])
    
    prompt = f"""You are a medical expert generating comprehensive clinical models for EMR integration.

Disease: {disease_name}
ICD-10: {icd10}
Category: {category}

Return a JSON object with this EXACT structure. This data will be used to analyze patient records and correlate symptoms/signs with disease severity.

{{
  "primaryOrgan": "{organs[0]}",
  "affectedOrgans": {json.dumps(organs)},
  
  "progression": [
    {{"stage": 1, "name": "Early/Subclinical", "severity": 0.2, "description": "Initial changes", "yearsFromOnset": "0-2", "clinicalCriteria": "Criteria for this stage"}},
    {{"stage": 2, "name": "Mild", "severity": 0.4, "description": "Early symptoms", "yearsFromOnset": "2-5", "clinicalCriteria": "Criteria for this stage"}},
    {{"stage": 3, "name": "Moderate", "severity": 0.6, "description": "Progressive disease", "yearsFromOnset": "5-10", "clinicalCriteria": "Criteria for this stage"}},
    {{"stage": 4, "name": "Severe/End-stage", "severity": 0.9, "description": "Advanced disease", "yearsFromOnset": ">10", "clinicalCriteria": "Criteria for this stage"}}
  ],
  
  "clinicalPresentation": {{
    "symptoms": [
      {{"name": "Symptom name", "severity_grades": [{{"grade": 1, "description": "Mild - on exertion only"}}, {{"grade": 2, "description": "Moderate - limits daily activities"}}, {{"grade": 3, "description": "Severe - at rest"}}, {{"grade": 4, "description": "Critical - constant"}}], "frequency": "Common/Uncommon/Rare", "onset": "Acute/Gradual", "progression_with_disease": "Worsens with disease stage"}},
      // Include 5-8 symptoms with severity grades
    ],
    "signs": [
      {{"name": "Clinical sign name", "how_to_detect": "Physical exam method", "severity_grades": [{{"grade": "Mild", "criteria": "Specific criteria"}}, {{"grade": "Moderate", "criteria": "Specific criteria"}}, {{"grade": "Severe", "criteria": "Specific criteria"}}], "sensitivity": "85%", "specificity": "70%", "associated_with_stage": "Stage 2-4"}},
      // Include 5-10 clinical signs with detection methods and severity grades
    ],
    "labTests": [
      {{"name": "Test name", "normal_range": "Normal values", "abnormal_in_disease": "Expected abnormal values", "significance": "Clinical meaning", "sensitivity": "80%", "specificity": "75%", "when_to_order": "Initial workup/Monitoring/Suspected complication"}}
    ],
    "imaging": [
      {{"type": "Imaging modality", "findings": "Expected findings", "severity_correlation": "Findings correlate with disease severity", "sensitivity": "90%", "specificity": "85%", "when_to_order": "Indication"}}
    ],
    "treatments": [
      {{"category": "Medications", "items": ["drug1", "drug2"], "evidence_level": "Class I/II/III", "when_to_use": "Indication"}},
      {{"category": "Procedures", "items": ["procedure1"], "evidence_level": "Class I/II/III", "when_to_use": "Indication"}},
      {{"category": "Lifestyle", "items": ["modification1"]}}
    ]
  }},
  
  "diagnosticCriteria": {{
    "major": ["Major criterion 1", "Major criterion 2"],
    "minor": ["Minor criterion 1", "Minor criterion 2"],
    "diagnosis_rule": "Diagnosis requires X major + Y minor criteria"
  }},
  
  "clinicalGuidelines": {{
    "diagnosis": {{
      "initial_workup": ["Step 1", "Step 2"],
      "confirmatory_tests": ["Test 1", "Test 2"],
      "differential_diagnosis": ["Condition 1", "Condition 2"]
    }},
    "treatment": {{
      "first_line": ["Treatment 1"],
      "second_line": ["Treatment 2"],
      "refractory": ["Treatment for refractory cases"]
    }},
    "monitoring": {{
      "frequency": "Every X months",
      "parameters_to_monitor": ["Parameter 1", "Parameter 2"],
      "warning_signs": ["Sign of deterioration 1"]
    }}
  }},
  
  "symptomSeverityModels": [
    {{
      "symptom": "Dyspnea",
      "mathematical_model": {{
        "name": "NYHA-Based Dyspnea Severity Model",
        "latex": "Severity = \\\\frac{{NYHA\\\\_Class - 1}}{{3}} \\\\times 100",
        "variables": {{"NYHA_Class": "1-4"}},
        "interpretation": "0% = asymptomatic, 100% = symptoms at rest"
      }}
    }}
  ],
  
  "modifications": {{
    // For each organ, include ALL scales with specific parameter changes
    // Use multiplier: >1.0 for increase, <1.0 for decrease
    // Example for heart:
    "heart": {{
      "geometry": {{
        "lv_edv": {{"multiplier": 1.2, "absolute": null, "note": "Dilation"}},
        "lv_wall_thickness": {{"multiplier": 0.9, "absolute": null, "note": "Thinning"}}
      }},
      "pressures": {{
        "lv_edp": {{"multiplier": 1.5, "absolute": null, "note": "Elevated filling pressure"}}
      }},
      "physiology": {{
        "ef": {{"multiplier": 0.7, "absolute": null, "note": "Reduced systolic function"}}
      }},
      "cellular": {{
        "calcium_transient": {{"multiplier": 0.8, "absolute": null, "note": "Impaired calcium handling"}}
      }},
      "lab_tests": {{
        "bnp": {{"multiplier": 3.0, "absolute": null, "note": "Elevated natriuretic peptide"}}
      }}
    }},
    // Include similar structure for: {', '.join(organs)}
  }},
  
  "geneticFactors": {{
    "genes": ["relevant_gene1", "relevant_gene2"],
    "snps": ["rs12345", "rs67890"],
    "heritability": 0.4,
    "penetrance": "Variable/High/Low",
    "inheritance_pattern": "Autosomal dominant/recessive/X-linked/Polygenic"
  }},
  
  "riskFactors": {{
    "modifiable": ["Risk factor 1", "Risk factor 2"],
    "non_modifiable": ["Age", "Family history", "Genetics"],
    "protective": ["Protective factor 1"]
  }},
  
  "complications": [
    {{"name": "Complication 1", "risk": "20%", "prevention": "How to prevent", "early_signs": ["Sign 1"]}},
    {{"name": "Complication 2", "risk": "10%", "prevention": "How to prevent", "early_signs": ["Sign 1"]}}
  ],
  
  "novelEquations": [
    {{
      "id": "disease_severity_score",
      "name": "Disease Severity Score",
      "latex": "Severity = w_1 \\\\cdot Symptoms + w_2 \\\\cdot Signs + w_3 \\\\cdot Labs",
      "description": "Composite score combining symptoms, signs, and lab values",
      "evidence": "novel",
      "variables": {{"w_1": "0.3", "w_2": "0.3", "w_3": "0.4"}}
    }},
    {{
      "id": "progression_rate",
      "name": "Disease Progression Rate",
      "latex": "\\\\frac{{dS}}{{dt}} = k \\\\cdot S \\\\cdot (1 - \\\\frac{{S}}{{S_{{max}}}})",
      "description": "Logistic model for disease progression over time",
      "evidence": "novel"
    }}
  ]
}}

REQUIREMENTS:
1. Include modifications for ALL organs: {', '.join(organs)}
2. For each organ, include at least: geometry, pressures, physiology, cellular, lab_tests
3. Use medically accurate multiplier values (typical ranges: 0.3-3.0)
4. Include relevant genetic factors for this specific disease
5. Add 2-3 novel equations for disease severity and progression modeling
6. CRITICAL: Include detailed symptoms WITH severity grades (Grade 1-4)
7. CRITICAL: Include clinical signs WITH detection methods and severity criteria
8. Include diagnostic criteria with major/minor criteria
9. Include clinical guidelines for diagnosis, treatment, and monitoring
10. Include symptom-severity mathematical models for EMR correlation
11. Return ONLY valid JSON, no markdown or explanations"""

    try:
        llm = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"comprehensive_{disease_name[:15]}_{datetime.now().strftime('%H%M%S')}",
            system_message="You are a medical expert. Return only valid JSON with comprehensive disease models."
        ).with_model("openai", "gpt-4o")
        
        user_msg = UserMessage(text=prompt)
        response = await llm.send_message(user_msg)
        
        # Clean response
        content = response.strip()
        if content.startswith('```'):
            lines = content.split('\n')
            content = '\n'.join(lines[1:-1] if lines[-1] == '```' else lines[1:])
            if content.startswith('json'):
                content = content[4:]
        content = content.strip()
        
        model = json.loads(content)
        return model
        
    except json.JSONDecodeError as e:
        print(f"  JSON parse error: {str(e)[:50]}")
        return None
    except Exception as e:
        print(f"  AI error: {str(e)[:50]}")
        return None


def read_existing_disease_models():
    """Read existing models from diseaseModels.js"""
    try:
        with open(DISEASE_MODELS_FILE, 'r') as f:
            content = f.read()
        
        # Extract the DISEASE_MODELS object
        match = re.search(r'export const DISEASE_MODELS = ({[\s\S]*?});', content)
        if match:
            # This is tricky because it's JS not JSON, but we'll parse what we can
            return {}  # We'll append new models rather than parse existing
        return {}
    except Exception as e:
        print(f"Error reading disease models: {e}")
        return {}


def append_to_disease_models_file(new_models: dict):
    """Append new disease models to diseaseModels.js"""
    try:
        with open(DISEASE_MODELS_FILE, 'r') as f:
            content = f.read()
        
        # Find the closing of DISEASE_MODELS
        # Look for the pattern: };\n\nexport default
        insert_point = content.rfind('};\n\nexport default')
        if insert_point == -1:
            insert_point = content.rfind('};')
        
        if insert_point == -1:
            print("ERROR: Could not find insert point in diseaseModels.js")
            return False
        
        # Generate new model entries
        new_entries = ""
        for model_id, model_data in new_models.items():
            # Convert to JS format
            model_js = json.dumps(model_data, indent=2)
            # Add proper JS formatting
            new_entries += f"\n\n  // AUTO-GENERATED: {model_data.get('name', model_id)}\n"
            new_entries += f"  {model_id}: {model_js},"
        
        # Insert before the closing
        new_content = content[:insert_point] + new_entries + content[insert_point:]
        
        with open(DISEASE_MODELS_FILE, 'w') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"Error appending to disease models: {e}")
        return False


async def save_to_mongodb(disease_id: str, model: dict, db):
    """Save comprehensive model to MongoDB"""
    try:
        # Update the disease document with comprehensive model
        await db.diseases.update_one(
            {'id': disease_id},
            {'$set': {
                'comprehensive_model': model,
                'model_version': '2.0',
                'model_generated_at': datetime.now(timezone.utc).isoformat(),
                'has_progression': 'progression' in model,
                'has_genetics': 'geneticFactors' in model,
                'has_equations': 'novelEquations' in model and len(model.get('novelEquations', [])) > 0
            }}
        )
        return True
    except Exception as e:
        print(f"  MongoDB save error: {e}")
        return False


async def run_phase2_generation(batch_size=5, start_from=0, max_diseases=None):
    """Run Phase 2: Comprehensive model generation for all diseases"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("\n" + "=" * 70)
    print("PHASE 2: COMPREHENSIVE DISEASE MODEL GENERATION")
    print("=" * 70)
    print(f"Started at: {datetime.now().isoformat()}")
    print(f"Using GPT-4o for medical accuracy")
    print("=" * 70)
    
    # Get all diseases, sorted by priority category
    all_diseases = await db.diseases.find({}, {'_id': 0}).to_list(None)
    
    # Sort by category priority
    def get_priority(d):
        cat = d.get('category', 'general').lower()
        for i, c in enumerate(CATEGORY_PRIORITY):
            if c in cat or cat in c:
                return i
        return len(CATEGORY_PRIORITY)
    
    sorted_diseases = sorted(all_diseases, key=get_priority)
    
    if start_from > 0:
        sorted_diseases = sorted_diseases[start_from:]
    if max_diseases:
        sorted_diseases = sorted_diseases[:max_diseases]
    
    total = len(sorted_diseases)
    print(f"Total diseases to process: {total}")
    
    generated = 0
    failed = 0
    batch_models = {}
    
    for i, disease in enumerate(sorted_diseases):
        disease_name = disease.get('name', 'Unknown')
        disease_id = disease.get('id', disease_name.lower().replace(' ', '_').replace(',', '').replace('-', '_'))
        icd10 = disease.get('icd10_code', '')
        category = disease.get('category', 'general')
        
        print(f"\n[{start_from + i + 1}/{start_from + total}] {disease_name} ({category})")
        
        # Check if already has comprehensive model
        existing = disease.get('comprehensive_model')
        if existing and existing.get('modifications') and len(existing.get('modifications', {})) >= 3:
            print(f"  ⏭ Already has comprehensive model, skipping")
            continue
        
        # Generate comprehensive model
        model = await generate_comprehensive_model(disease_name, icd10, category)
        
        if model:
            # Add metadata
            model['name'] = disease_name
            model['icd10'] = icd10
            model['category'] = category
            model['description'] = model.get('description', f"Comprehensive model for {disease_name}")
            
            # Save to MongoDB
            if await save_to_mongodb(disease_id, model, db):
                generated += 1
                batch_models[disease_id] = model
                print(f"  ✓ Generated & saved ({len(model.get('modifications', {}))} organs)")
            else:
                failed += 1
                print(f"  ✗ MongoDB save failed")
        else:
            failed += 1
            print(f"  ✗ Generation failed")
        
        # Progress reporting every 20 models
        if generated > 0 and generated % 20 == 0:
            print(f"\n  📊 Progress: {generated} comprehensive models saved to MongoDB")
        
        # Rate limiting (GPT-4o has lower rate limits)
        await asyncio.sleep(2.0)
    
    print(f"\n{'=' * 70}")
    print(f"PHASE 2 COMPLETE")
    print(f"Generated: {generated}")
    print(f"Failed: {failed}")
    print(f"All comprehensive models saved to MongoDB")
    print(f"Completed at: {datetime.now().isoformat()}")
    print(f"{'=' * 70}")
    
    client.close()
    return generated, failed


async def main():
    """Main entry point"""
    import sys
    
    start_from = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    max_diseases = int(sys.argv[2]) if len(sys.argv) > 2 else None
    
    await run_phase2_generation(start_from=start_from, max_diseases=max_diseases)


if __name__ == "__main__":
    asyncio.run(main())
