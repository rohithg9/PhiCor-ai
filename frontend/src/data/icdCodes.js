// ICD-10 Disease Classification Structure
// Complete mapping of diseases to mathematical model perturbations

export const ICD_CATEGORIES = {
  // Chapter I: Infectious Diseases (A00-B99)
  "A00-B99": {
    chapter: "I",
    name: "Certain Infectious and Parasitic Diseases",
    subcategories: {
      "A00-A09": "Intestinal infectious diseases",
      "A15-A19": "Tuberculosis",
      "A20-A28": "Certain zoonotic bacterial diseases",
      "A30-A49": "Other bacterial diseases",
      "A50-A64": "Infections with predominantly sexual mode of transmission",
      "A65-A69": "Other spirochetal diseases",
      "A70-A74": "Other diseases caused by chlamydiae",
      "A75-A79": "Rickettsioses",
      "A80-A89": "Viral infections of central nervous system",
      "A90-A99": "Arthropod-borne viral fevers and viral hemorrhagic fevers",
      "B00-B09": "Viral infections characterized by skin and mucous membrane lesions",
      "B15-B19": "Viral hepatitis",
      "B20-B24": "Human immunodeficiency virus [HIV] disease",
      "B25-B34": "Other viral diseases",
      "B35-B49": "Mycoses",
      "B50-B64": "Protozoal diseases",
      "B65-B83": "Helminthiases",
      "B85-B89": "Pediculosis, acariasis and other infestations",
      "B90-B94": "Sequelae of infectious and parasitic diseases",
      "B95-B98": "Bacterial, viral and other infectious agents",
      "B99": "Other infectious diseases"
    }
  },

  // Chapter II: Neoplasms (C00-D49)
  "C00-D49": {
    chapter: "II",
    name: "Neoplasms",
    subcategories: {
      "C00-C14": "Malignant neoplasms of lip, oral cavity and pharynx",
      "C15-C26": "Malignant neoplasms of digestive organs",
      "C30-C39": "Malignant neoplasms of respiratory and intrathoracic organs",
      "C40-C41": "Malignant neoplasms of bone and articular cartilage",
      "C43-C44": "Melanoma and other malignant neoplasms of skin",
      "C45-C49": "Malignant neoplasms of mesothelial and soft tissue",
      "C50": "Malignant neoplasm of breast",
      "C51-C58": "Malignant neoplasms of female genital organs",
      "C60-C63": "Malignant neoplasms of male genital organs",
      "C64-C68": "Malignant neoplasms of urinary tract",
      "C69-C72": "Malignant neoplasms of eye, brain and other parts of CNS",
      "C73-C75": "Malignant neoplasms of thyroid and other endocrine glands",
      "C76-C80": "Malignant neoplasms of ill-defined, secondary and unspecified sites",
      "C81-C96": "Malignant neoplasms of lymphoid, hematopoietic and related tissue",
      "D00-D09": "In situ neoplasms",
      "D10-D36": "Benign neoplasms",
      "D37-D48": "Neoplasms of uncertain behavior",
      "D49": "Neoplasms of unspecified behavior"
    }
  },

  // Chapter III: Blood Diseases (D50-D89)
  "D50-D89": {
    chapter: "III",
    name: "Diseases of Blood and Blood-forming Organs",
    subcategories: {
      "D50-D53": "Nutritional anemias",
      "D55-D59": "Hemolytic anemias",
      "D60-D64": "Aplastic and other anemias",
      "D65-D69": "Coagulation defects, purpura and other hemorrhagic conditions",
      "D70-D77": "Other diseases of blood and blood-forming organs",
      "D78": "Intraoperative and postprocedural complications of spleen",
      "D80-D89": "Certain disorders involving the immune mechanism"
    }
  },

  // Chapter IV: Endocrine, Nutritional, Metabolic (E00-E89)
  "E00-E89": {
    chapter: "IV",
    name: "Endocrine, Nutritional and Metabolic Diseases",
    subcategories: {
      "E00-E07": "Disorders of thyroid gland",
      "E08-E13": "Diabetes mellitus",
      "E15-E16": "Other disorders of glucose regulation and pancreatic internal secretion",
      "E20-E35": "Disorders of other endocrine glands",
      "E36": "Intraoperative complications of endocrine system",
      "E40-E46": "Malnutrition",
      "E50-E64": "Other nutritional deficiencies",
      "E65-E68": "Overweight, obesity and other hyperalimentation",
      "E70-E88": "Metabolic disorders",
      "E89": "Postprocedural endocrine and metabolic complications"
    }
  },

  // Chapter V: Mental and Behavioral (F01-F99)
  "F01-F99": {
    chapter: "V",
    name: "Mental, Behavioral and Neurodevelopmental Disorders",
    subcategories: {
      "F01-F09": "Mental disorders due to known physiological conditions",
      "F10-F19": "Mental and behavioral disorders due to psychoactive substance use",
      "F20-F29": "Schizophrenia, schizotypal, delusional, and other psychotic disorders",
      "F30-F39": "Mood [affective] disorders",
      "F40-F48": "Anxiety, dissociative, stress-related, somatoform disorders",
      "F50-F59": "Behavioral syndromes associated with physiological disturbances",
      "F60-F69": "Disorders of adult personality and behavior",
      "F70-F79": "Intellectual disabilities",
      "F80-F89": "Pervasive and specific developmental disorders",
      "F90-F98": "Behavioral and emotional disorders with onset in childhood",
      "F99": "Unspecified mental disorder"
    }
  },

  // Chapter VI: Nervous System (G00-G99)
  "G00-G99": {
    chapter: "VI",
    name: "Diseases of the Nervous System",
    subcategories: {
      "G00-G09": "Inflammatory diseases of the central nervous system",
      "G10-G14": "Systemic atrophies primarily affecting the CNS",
      "G20-G26": "Extrapyramidal and movement disorders",
      "G30-G32": "Other degenerative diseases of the nervous system",
      "G35-G37": "Demyelinating diseases of the CNS",
      "G40-G47": "Episodic and paroxysmal disorders",
      "G50-G59": "Nerve, nerve root and plexus disorders",
      "G60-G65": "Polyneuropathies and other disorders of peripheral nervous system",
      "G70-G73": "Diseases of myoneural junction and muscle",
      "G80-G83": "Cerebral palsy and other paralytic syndromes",
      "G89-G99": "Other disorders of the nervous system"
    }
  },

  // Chapter VII: Eye (H00-H59)
  "H00-H59": {
    chapter: "VII",
    name: "Diseases of the Eye and Adnexa",
    subcategories: {
      "H00-H05": "Disorders of eyelid, lacrimal system and orbit",
      "H10-H11": "Disorders of conjunctiva",
      "H15-H22": "Disorders of sclera, cornea, iris and ciliary body",
      "H25-H28": "Disorders of lens",
      "H30-H36": "Disorders of choroid and retina",
      "H40-H42": "Glaucoma",
      "H43-H44": "Disorders of vitreous body and globe",
      "H46-H47": "Disorders of optic nerve and visual pathways",
      "H49-H52": "Disorders of ocular muscles, binocular movement, accommodation",
      "H53-H54": "Visual disturbances and blindness",
      "H55-H57": "Other disorders of eye and adnexa",
      "H59": "Intraoperative and postprocedural complications of eye"
    }
  },

  // Chapter VIII: Ear (H60-H95)
  "H60-H95": {
    chapter: "VIII",
    name: "Diseases of the Ear and Mastoid Process",
    subcategories: {
      "H60-H62": "Diseases of external ear",
      "H65-H75": "Diseases of middle ear and mastoid",
      "H80-H83": "Diseases of inner ear",
      "H90-H94": "Other disorders of ear",
      "H95": "Intraoperative and postprocedural complications of ear"
    }
  },

  // Chapter IX: Circulatory System (I00-I99) - MAJOR FOCUS
  "I00-I99": {
    chapter: "IX",
    name: "Diseases of the Circulatory System",
    subcategories: {
      "I00-I02": "Acute rheumatic fever",
      "I05-I09": "Chronic rheumatic heart diseases",
      "I10-I16": "Hypertensive diseases",
      "I20-I25": "Ischemic heart diseases",
      "I26-I28": "Pulmonary heart disease and diseases of pulmonary circulation",
      "I30-I52": "Other forms of heart disease",
      "I60-I69": "Cerebrovascular diseases",
      "I70-I79": "Diseases of arteries, arterioles and capillaries",
      "I80-I89": "Diseases of veins, lymphatic vessels and lymph nodes",
      "I95-I99": "Other and unspecified disorders of the circulatory system"
    }
  },

  // Chapter X: Respiratory System (J00-J99)
  "J00-J99": {
    chapter: "X",
    name: "Diseases of the Respiratory System",
    subcategories: {
      "J00-J06": "Acute upper respiratory infections",
      "J09-J18": "Influenza and pneumonia",
      "J20-J22": "Other acute lower respiratory infections",
      "J30-J39": "Other diseases of upper respiratory tract",
      "J40-J47": "Chronic lower respiratory diseases",
      "J60-J70": "Lung diseases due to external agents",
      "J80-J84": "Other respiratory diseases principally affecting the interstitium",
      "J85-J86": "Suppurative and necrotic conditions of lower respiratory tract",
      "J90-J94": "Other diseases of the pleura",
      "J95": "Intraoperative and postprocedural complications of respiratory system",
      "J96-J99": "Other diseases of the respiratory system"
    }
  },

  // Chapter XI: Digestive System (K00-K95)
  "K00-K95": {
    chapter: "XI",
    name: "Diseases of the Digestive System",
    subcategories: {
      "K00-K14": "Diseases of oral cavity, salivary glands and jaws",
      "K20-K31": "Diseases of esophagus, stomach and duodenum",
      "K35-K38": "Diseases of appendix",
      "K40-K46": "Hernia",
      "K50-K52": "Noninfective enteritis and colitis",
      "K55-K64": "Other diseases of intestines",
      "K65-K68": "Diseases of peritoneum and retroperitoneum",
      "K70-K77": "Diseases of liver",
      "K80-K87": "Disorders of gallbladder, biliary tract and pancreas",
      "K90-K95": "Other diseases of the digestive system"
    }
  },

  // Chapter XII: Skin (L00-L99)
  "L00-L99": {
    chapter: "XII",
    name: "Diseases of the Skin and Subcutaneous Tissue",
    subcategories: {
      "L00-L08": "Infections of the skin and subcutaneous tissue",
      "L10-L14": "Bullous disorders",
      "L20-L30": "Dermatitis and eczema",
      "L40-L45": "Papulosquamous disorders",
      "L49-L54": "Urticaria and erythema",
      "L55-L59": "Radiation-related disorders of the skin and subcutaneous tissue",
      "L60-L75": "Disorders of skin appendages",
      "L76": "Intraoperative and postprocedural complications of skin",
      "L80-L99": "Other disorders of the skin and subcutaneous tissue"
    }
  },

  // Chapter XIII: Musculoskeletal (M00-M99)
  "M00-M99": {
    chapter: "XIII",
    name: "Diseases of the Musculoskeletal System and Connective Tissue",
    subcategories: {
      "M00-M02": "Infectious arthropathies",
      "M04": "Autoinflammatory syndromes",
      "M05-M14": "Inflammatory polyarthropathies",
      "M15-M19": "Osteoarthritis",
      "M20-M25": "Other joint disorders",
      "M26-M27": "Dentofacial anomalies and disorders of jaw",
      "M30-M36": "Systemic connective tissue disorders",
      "M40-M43": "Deforming dorsopathies",
      "M45-M49": "Spondylopathies",
      "M50-M54": "Other dorsopathies",
      "M60-M63": "Disorders of muscles",
      "M65-M67": "Disorders of synovium and tendon",
      "M70-M79": "Other soft tissue disorders",
      "M80-M85": "Disorders of bone density and structure",
      "M86-M90": "Other osteopathies",
      "M91-M94": "Chondropathies",
      "M95": "Other disorders of the musculoskeletal system and connective tissue",
      "M96": "Intraoperative and postprocedural complications of musculoskeletal system",
      "M97": "Periprosthetic fracture around internal prosthetic joint",
      "M99": "Biomechanical lesions, not elsewhere classified"
    }
  },

  // Chapter XIV: Genitourinary (N00-N99)
  "N00-N99": {
    chapter: "XIV",
    name: "Diseases of the Genitourinary System",
    subcategories: {
      "N00-N08": "Glomerular diseases",
      "N10-N16": "Renal tubulo-interstitial diseases",
      "N17-N19": "Acute kidney failure and chronic kidney disease",
      "N20-N23": "Urolithiasis",
      "N25-N29": "Other disorders of kidney and ureter",
      "N30-N39": "Other diseases of the urinary system",
      "N40-N53": "Diseases of male genital organs",
      "N60-N65": "Disorders of breast",
      "N70-N77": "Inflammatory diseases of female pelvic organs",
      "N80-N98": "Noninflammatory disorders of female genital tract",
      "N99": "Intraoperative and postprocedural complications of genitourinary system"
    }
  },

  // Chapter XV: Pregnancy (O00-O9A)
  "O00-O9A": {
    chapter: "XV",
    name: "Pregnancy, Childbirth and the Puerperium",
    subcategories: {
      "O00-O08": "Pregnancy with abortive outcome",
      "O09": "Supervision of high risk pregnancy",
      "O10-O16": "Edema, proteinuria and hypertensive disorders in pregnancy",
      "O20-O29": "Other maternal disorders predominantly related to pregnancy",
      "O30-O48": "Maternal care related to the fetus and amniotic cavity",
      "O60-O77": "Complications of labor and delivery",
      "O80-O82": "Encounter for delivery",
      "O85-O92": "Complications predominantly related to the puerperium",
      "O94-O9A": "Other obstetric conditions"
    }
  },

  // Chapter XVI: Perinatal (P00-P96)
  "P00-P96": {
    chapter: "XVI",
    name: "Certain Conditions Originating in the Perinatal Period",
    subcategories: {
      "P00-P04": "Newborn affected by maternal factors and complications of pregnancy/delivery",
      "P05-P08": "Disorders related to length of gestation and fetal growth",
      "P09": "Abnormal findings on neonatal screening",
      "P10-P15": "Birth trauma",
      "P19-P29": "Respiratory and cardiovascular disorders specific to perinatal period",
      "P35-P39": "Infections specific to the perinatal period",
      "P50-P61": "Hemorrhagic and hematological disorders of newborn",
      "P70-P74": "Transitory endocrine and metabolic disorders specific to newborn",
      "P76-P78": "Digestive system disorders of newborn",
      "P80-P83": "Conditions involving integument and temperature regulation of newborn",
      "P84": "Other problems with newborn",
      "P90-P96": "Other disorders originating in the perinatal period"
    }
  },

  // Chapter XVII: Congenital (Q00-Q99)
  "Q00-Q99": {
    chapter: "XVII",
    name: "Congenital Malformations, Deformations and Chromosomal Abnormalities",
    subcategories: {
      "Q00-Q07": "Congenital malformations of the nervous system",
      "Q10-Q18": "Congenital malformations of eye, ear, face and neck",
      "Q20-Q28": "Congenital malformations of the circulatory system",
      "Q30-Q34": "Congenital malformations of the respiratory system",
      "Q35-Q37": "Cleft lip and cleft palate",
      "Q38-Q45": "Other congenital malformations of the digestive system",
      "Q50-Q56": "Congenital malformations of genital organs",
      "Q60-Q64": "Congenital malformations of the urinary system",
      "Q65-Q79": "Congenital malformations and deformations of musculoskeletal system",
      "Q80-Q89": "Other congenital malformations",
      "Q90-Q99": "Chromosomal abnormalities"
    }
  },

  // Chapter XVIII: Symptoms, Signs (R00-R99)
  "R00-R99": {
    chapter: "XVIII",
    name: "Symptoms, Signs and Abnormal Clinical and Laboratory Findings",
    subcategories: {
      "R00-R09": "Symptoms and signs involving the circulatory and respiratory systems",
      "R10-R19": "Symptoms and signs involving the digestive system and abdomen",
      "R20-R23": "Symptoms and signs involving the skin and subcutaneous tissue",
      "R25-R29": "Symptoms and signs involving the nervous and musculoskeletal systems",
      "R30-R39": "Symptoms and signs involving the genitourinary system",
      "R40-R46": "Symptoms and signs involving cognition, perception, emotional state",
      "R47-R49": "Symptoms and signs involving speech and voice",
      "R50-R69": "General symptoms and signs",
      "R70-R79": "Abnormal findings on examination of blood",
      "R80-R82": "Abnormal findings on examination of urine",
      "R83-R89": "Abnormal findings on examination of other body fluids",
      "R90-R94": "Abnormal findings on diagnostic imaging and function studies",
      "R97": "Abnormal tumor markers",
      "R99": "Ill-defined and unknown cause of mortality"
    }
  },

  // Chapter XIX: Injury, Poisoning (S00-T88)
  "S00-T88": {
    chapter: "XIX",
    name: "Injury, Poisoning and Certain Other Consequences of External Causes",
    subcategories: {
      "S00-S09": "Injuries to the head",
      "S10-S19": "Injuries to the neck",
      "S20-S29": "Injuries to the thorax",
      "S30-S39": "Injuries to the abdomen, lower back, lumbar spine, pelvis",
      "S40-S49": "Injuries to the shoulder and upper arm",
      "S50-S59": "Injuries to the elbow and forearm",
      "S60-S69": "Injuries to the wrist, hand and fingers",
      "S70-S79": "Injuries to the hip and thigh",
      "S80-S89": "Injuries to the knee and lower leg",
      "S90-S99": "Injuries to the ankle and foot",
      "T07": "Unspecified multiple injuries",
      "T14": "Injury of unspecified body region",
      "T15-T19": "Effects of foreign body entering through natural orifice",
      "T20-T32": "Burns and corrosions",
      "T33-T34": "Frostbite",
      "T36-T50": "Poisoning by drugs, medicaments and biological substances",
      "T51-T65": "Toxic effects of substances chiefly nonmedicinal",
      "T66-T78": "Other and unspecified effects of external causes",
      "T79": "Certain early complications of trauma",
      "T80-T88": "Complications of surgical and medical care"
    }
  },

  // Chapter XX: External Causes (V00-Y99)
  "V00-Y99": {
    chapter: "XX",
    name: "External Causes of Morbidity",
    subcategories: {
      "V00-V99": "Transport accidents",
      "W00-X58": "Other external causes of accidental injury",
      "X71-X83": "Intentional self-harm",
      "X92-Y09": "Assault",
      "Y21-Y33": "Event of undetermined intent",
      "Y35-Y38": "Legal intervention, operations of war, military operations, terrorism",
      "Y62-Y84": "Complications of medical and surgical care",
      "Y90-Y99": "Supplementary factors related to causes of morbidity"
    }
  },

  // Chapter XXI: Health Status (Z00-Z99)
  "Z00-Z99": {
    chapter: "XXI",
    name: "Factors Influencing Health Status and Contact with Health Services",
    subcategories: {
      "Z00-Z13": "Persons encountering health services for examinations",
      "Z14-Z15": "Genetic carrier and genetic susceptibility to disease",
      "Z16": "Resistance to antimicrobial drugs",
      "Z17": "Estrogen receptor status",
      "Z18": "Retained foreign body fragments",
      "Z19": "Hormone sensitivity malignancy status",
      "Z20-Z29": "Persons with potential health hazards related to communicable diseases",
      "Z30-Z39": "Persons encountering health services for reproductive circumstances",
      "Z40-Z53": "Encounters for other specific health care",
      "Z55-Z65": "Persons with potential health hazards related to socioeconomic factors",
      "Z66": "Do not resuscitate",
      "Z67": "Blood type",
      "Z68": "Body mass index",
      "Z69-Z76": "Persons encountering health services in other circumstances",
      "Z77-Z99": "Persons with potential health hazards related to family and personal history"
    }
  }
};

// Detailed disease entries with mathematical model perturbations
export const ICD_DISEASES = {
  // =========================================================================
  // CARDIOVASCULAR (I00-I99)
  // =========================================================================
  
  // I10-I16: Hypertensive diseases
  "I10": {
    code: "I10",
    name: "Essential (Primary) Hypertension",
    category: "I10-I16",
    chapter: "IX",
    description: "Persistently elevated arterial blood pressure without identifiable cause",
    
    prevalence: "~30% of adults",
    
    affectedOrgans: ["heart", "kidneys", "brain", "eyes"],
    affectedSystems: ["cardiovascular", "renal", "neurological"],
    
    biochemicalChanges: {
      raas: {
        description: "Often inappropriately normal/elevated RAAS activity",
        changes: {
          renin: "Variable",
          angiotensin_ii: "↑ or normal",
          aldosterone: "↑ or normal"
        }
      },
      endothelial: {
        no_bioavailability: "↓",
        endothelin_1: "↑",
        oxidative_stress: "↑"
      },
      sympathetic: {
        catecholamines: "↑",
        heart_rate_variability: "↓"
      }
    },
    
    modelPerturbations: {
      heart: {
        geometry: {
          lv_wall_thickness: { multiplier: 1.3, note: "Concentric LVH" },
          lv_mass: { multiplier: 1.4, note: "Pressure overload hypertrophy" }
        },
        pressures: {
          lv_sys_p: { absolute: 160, note: "Elevated systolic" },
          aortic_gradient: { multiplier: 1.2, note: "Increased afterload" }
        },
        physiology: {
          e_a_ratio: { multiplier: 0.8, note: "Diastolic dysfunction" },
          gls: { multiplier: 0.9, note: "Subclinical systolic dysfunction" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { multiplier: 0.85, note: "Hypertensive nephrosclerosis" },
          filtration_fraction: { multiplier: 1.15, note: "Efferent constriction" }
        },
        structure: {
          glomerulosclerosis: "Progressive"
        }
      },
      brain: {
        pressures: {
          cpp: { multiplier: 1.2, note: "Elevated but autoregulated" }
        },
        physiology: {
          cbf: { note: "Autoregulation curve shifted right" }
        }
      }
    },
    
    equations: {
      modified: [
        {
          original: "MAP = DBP + (1/3)(SBP - DBP)",
          modified: "MAP = DBP + (1/3)(SBP - DBP) ≈ 110-130 mmHg",
          evidence: "established"
        },
        {
          original: "SVR = (MAP - CVP) / CO",
          modified: "SVR_{HTN} = SVR_0 × (1 + α_{remodeling} + α_{endothelial})",
          note: "Increased due to vascular remodeling",
          evidence: "novel"
        }
      ],
      novel: [
        {
          name: "LVH Development Rate",
          latex: "\\frac{dM_{LV}}{dt} = k_{pressure} \\times (MAP - MAP_0) \\times (1 - \\frac{M_{LV}}{M_{max}})",
          description: "LV mass increases with sustained pressure",
          evidence: "novel"
        },
        {
          name: "Vascular Remodeling Index",
          latex: "VRI = \\frac{Wall_{thickness}}{Lumen_{diameter}} \\times (1 + \\int_0^t MAP(\\tau) d\\tau)",
          description: "Progressive wall-to-lumen ratio increase",
          evidence: "novel"
        }
      ]
    },
    
    severity: {
      stage1: { sbp: "130-139", dbp: "80-89", description: "Stage 1 HTN" },
      stage2: { sbp: "≥140", dbp: "≥90", description: "Stage 2 HTN" },
      crisis: { sbp: ">180", dbp: ">120", description: "Hypertensive crisis" }
    }
  },

  // I21: Acute Myocardial Infarction
  "I21": {
    code: "I21",
    name: "Acute Myocardial Infarction",
    category: "I20-I25",
    chapter: "IX",
    description: "Acute coronary syndrome with myocardial necrosis",
    
    affectedOrgans: ["heart", "kidneys", "lungs"],
    
    biochemicalChanges: {
      cardiac_biomarkers: {
        troponin_i: "↑↑↑ (peaks 12-24h)",
        troponin_t: "↑↑↑",
        ck_mb: "↑↑ (peaks 12-24h)",
        myoglobin: "↑ (early, peaks 6-8h)"
      },
      inflammatory: {
        crp: "↑↑",
        il_6: "↑↑",
        tnf_alpha: "↑"
      },
      metabolic: {
        lactate: "↑ (ischemic tissue)",
        glucose: "↑ (stress response)",
        ffa: "↑"
      }
    },
    
    modelPerturbations: {
      heart: {
        geometry: {
          lv_wall_thickness: { 
            multiplier: 0.7, 
            note: "Infarct zone thinning (regional)" 
          }
        },
        pressures: {
          lv_edp: { multiplier: 2.0, note: "Acute diastolic dysfunction" },
          dp_dt: { multiplier: 0.5, note: "Reduced contractility" }
        },
        structure: {
          myocyte_density: { multiplier: 0.6, note: "Necrosis in infarct zone" },
          collagen_fraction: { multiplier: 3.0, note: "Scar formation" }
        },
        physiology: {
          ef: { multiplier: 0.6, note: "Depends on infarct size" },
          cardiac_output: { multiplier: 0.65, note: "Pump failure" },
          gls: { multiplier: 0.5, note: "Regional wall motion abnormality" }
        },
        cellular: {
          atp_concentration: { multiplier: 0.3, note: "Severe ischemia" },
          calcium_transient: { multiplier: 0.4, note: "Impaired" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { multiplier: 0.75, note: "Cardiorenal" }
        }
      },
      lungs: {
        pressures: {
          pcwp: { multiplier: 2.0, note: "Pulmonary edema risk" }
        }
      }
    },
    
    equations: {
      novel: [
        {
          name: "Infarct Size Evolution",
          latex: "IS(t) = IS_{max} \\times (1 - e^{-t/\\tau_{necrosis}}) \\times (1 - f_{reperfusion}(t_{door-to-balloon}))",
          description: "Infarct size depends on time to reperfusion",
          evidence: "novel"
        },
        {
          name: "Troponin Release Kinetics",
          latex: "[TnI](t) = [TnI]_{max} \\times \\frac{t}{\\tau_1}e^{1-t/\\tau_1} \\times \\frac{IS}{100}",
          description: "Troponin curve correlates with infarct size",
          evidence: "novel"
        },
        {
          name: "Stunned Myocardium Recovery",
          latex: "EF(t) = EF_{nadir} + (EF_{final} - EF_{nadir})(1 - e^{-t/\\tau_{stunning}})",
          description: "Gradual recovery of stunned myocardium",
          evidence: "novel"
        }
      ]
    },
    
    subtypes: {
      "I21.0": "STEMI of anterior wall",
      "I21.1": "STEMI of inferior wall",
      "I21.2": "STEMI of other sites",
      "I21.3": "STEMI of unspecified site",
      "I21.4": "NSTEMI"
    }
  },

  // I50: Heart Failure
  "I50": {
    code: "I50",
    name: "Heart Failure",
    category: "I30-I52",
    chapter: "IX",
    description: "Syndrome of inadequate cardiac output for metabolic demands",
    
    affectedOrgans: ["heart", "lungs", "kidneys", "liver", "brain"],
    
    biochemicalChanges: {
      neurohormonal: {
        bnp: "↑↑↑",
        nt_pro_bnp: "↑↑↑",
        norepinephrine: "↑↑",
        renin: "↑↑",
        angiotensin_ii: "↑↑",
        aldosterone: "↑↑",
        endothelin_1: "↑"
      },
      metabolic: {
        sodium: "↓ (dilutional)",
        lactate: "↑ (if low output)"
      }
    },
    
    modelPerturbations: {
      heart: {
        geometry: {
          lv_edv: { multiplier: 1.6, note: "Dilation (HFrEF)" },
          lv_esv: { multiplier: 2.2, note: "Severely increased" },
          la_volume: { multiplier: 1.5, note: "LA dilation" }
        },
        pressures: {
          lv_edp: { multiplier: 2.5, note: "Elevated filling pressures" },
          la_pressure: { multiplier: 2.0, note: "Elevated" },
          pcwp: { multiplier: 2.0, note: "Congestion" }
        },
        physiology: {
          ef: { multiplier: 0.5, note: "HFrEF: EF <40%" },
          cardiac_output: { multiplier: 0.6, note: "Low output" },
          cardiac_index: { multiplier: 0.6 }
        },
        cellular: {
          calcium_transient: { multiplier: 0.5 },
          atp_concentration: { multiplier: 0.7 }
        }
      },
      lungs: {
        pressures: {
          pcwp: { multiplier: 2.0 },
          pa_sys: { multiplier: 1.6 }
        },
        physiology: {
          vq_ratio: { multiplier: 0.7 }
        }
      },
      kidneys: {
        physiology: {
          gfr: { multiplier: 0.6, note: "Cardiorenal syndrome" },
          rbf: { multiplier: 0.5 }
        }
      },
      liver: {
        physiology: {
          hepatic_blood_flow: { multiplier: 0.6 },
          bilirubin: { multiplier: 1.8 }
        }
      }
    },
    
    equations: {
      novel: [
        {
          name: "BNP Release",
          latex: "[BNP] = k_{wall-stress} \\times \\sigma_{wall} + k_{volume} \\times \\frac{EDV}{EDV_0}",
          description: "BNP correlates with wall stress and volume",
          evidence: "novel"
        },
        {
          name: "Cardiorenal Interaction",
          latex: "GFR_{HF} = GFR_0 \\times \\frac{CO}{CO_0} \\times (1 - \\alpha \\cdot \\frac{CVP}{CVP_0})",
          description: "GFR depends on forward flow AND venous congestion",
          evidence: "novel"
        }
      ]
    },
    
    subtypes: {
      "I50.1": "Left ventricular failure",
      "I50.2": "Systolic (congestive) heart failure",
      "I50.3": "Diastolic (congestive) heart failure",
      "I50.4": "Combined systolic and diastolic heart failure",
      "I50.9": "Heart failure, unspecified"
    }
  },

  // =========================================================================
  // ENDOCRINE/METABOLIC (E00-E89)
  // =========================================================================
  
  // E11: Type 2 Diabetes Mellitus
  "E11": {
    code: "E11",
    name: "Type 2 Diabetes Mellitus",
    category: "E08-E13",
    chapter: "IV",
    description: "Metabolic disorder characterized by insulin resistance and progressive β-cell failure",
    
    affectedOrgans: ["pancreas", "kidneys", "heart", "liver", "brain", "eyes"],
    
    biochemicalChanges: {
      glucose_metabolism: {
        fasting_glucose: "↑ (>126 mg/dL)",
        hba1c: "↑ (>6.5%)",
        postprandial_glucose: "↑↑"
      },
      insulin: {
        fasting_insulin: "↑ (early), ↓ (late)",
        c_peptide: "↑ (early), ↓ (late)",
        insulin_sensitivity: "↓↓"
      },
      lipids: {
        triglycerides: "↑↑",
        hdl: "↓",
        ldl: "↑ (small dense)",
        ffa: "↑"
      },
      inflammatory: {
        crp: "↑",
        adiponectin: "↓",
        leptin: "↑"
      }
    },
    
    modelPerturbations: {
      pancreas: {
        geometry: {
          beta_cell_mass: { multiplier: 0.4, note: "Progressive loss" }
        },
        physiology: {
          fasting_glucose: { absolute: 140, note: "Hyperglycemia" },
          fasting_insulin: { multiplier: 1.8, note: "Compensatory (early)" },
          hba1c: { absolute: 8.0 },
          homa_ir: { multiplier: 4.0 },
          homa_b: { multiplier: 0.4 },
          insulin_secretion: { multiplier: 0.3, note: "Lost first-phase" }
        }
      },
      kidneys: {
        physiology: {
          gfr: { multiplier: 0.7, note: "Diabetic nephropathy" }
        }
      },
      heart: {
        structure: {
          collagen_fraction: { multiplier: 1.5 }
        },
        physiology: {
          e_a_ratio: { multiplier: 0.7 }
        }
      },
      liver: {
        physiology: {
          alt: { multiplier: 1.5, note: "NAFLD" }
        }
      }
    },
    
    equations: {
      novel: [
        {
          name: "β-Cell Decline Model",
          latex: "\\frac{dM_{\\beta}}{dt} = -k_{gluco} \\cdot (G-100)_{+}^2 - k_{lipo} \\cdot [FFA] - k_{age} + k_{regen}",
          description: "β-cell mass decline from multiple stressors",
          evidence: "novel"
        },
        {
          name: "Insulin Resistance Progression",
          latex: "IR(t) = IR_0 \\times (1 + \\alpha \\cdot BMI + \\beta \\cdot Visceral_{fat} + \\gamma \\cdot inflammation)",
          description: "Multi-factorial insulin resistance",
          evidence: "novel"
        }
      ]
    },
    
    subtypes: {
      "E11.0": "With hyperosmolarity",
      "E11.1": "With ketoacidosis",
      "E11.2": "With kidney complications",
      "E11.3": "With ophthalmic complications",
      "E11.4": "With neurological complications",
      "E11.5": "With peripheral circulatory complications",
      "E11.6": "With other specified complications",
      "E11.8": "With unspecified complications",
      "E11.9": "Without complications"
    }
  },

  // =========================================================================
  // RENAL (N00-N99)
  // =========================================================================
  
  // N18: Chronic Kidney Disease
  "N18": {
    code: "N18",
    name: "Chronic Kidney Disease",
    category: "N17-N19",
    chapter: "XIV",
    description: "Progressive loss of kidney function over months to years",
    
    affectedOrgans: ["kidneys", "heart", "brain", "bone"],
    
    biochemicalChanges: {
      uremia: {
        creatinine: "↑↑↑",
        bun: "↑↑↑",
        uric_acid: "↑",
        phosphate: "↑",
        pth: "↑↑ (secondary hyperparathyroidism)"
      },
      anemia: {
        hemoglobin: "↓ (EPO deficiency)",
        iron: "Variable"
      },
      electrolytes: {
        potassium: "↑",
        bicarbonate: "↓ (metabolic acidosis)",
        calcium: "↓"
      }
    },
    
    modelPerturbations: {
      kidneys: {
        geometry: {
          kidney_length: { multiplier: 0.8 },
          nephron_count: { multiplier: 0.3, note: "Stage 4-5" },
          cortex_thickness: { multiplier: 0.6 }
        },
        physiology: {
          gfr: { absolute: 25, note: "Stage 4 example" },
          creatinine: { absolute: 3.5 },
          bun: { absolute: 45 }
        }
      },
      heart: {
        geometry: {
          lv_mass: { multiplier: 1.4 }
        }
      }
    },
    
    stages: {
      "N18.1": { gfr: "≥90", description: "Stage 1 - Normal GFR with kidney damage" },
      "N18.2": { gfr: "60-89", description: "Stage 2 - Mild" },
      "N18.3": { gfr: "30-59", description: "Stage 3 - Moderate" },
      "N18.4": { gfr: "15-29", description: "Stage 4 - Severe" },
      "N18.5": { gfr: "<15", description: "Stage 5 - Kidney failure" },
      "N18.6": { gfr: "<15", description: "Stage 5 requiring dialysis" }
    }
  },

  // =========================================================================
  // RESPIRATORY (J00-J99)
  // =========================================================================
  
  // J44: COPD
  "J44": {
    code: "J44",
    name: "Chronic Obstructive Pulmonary Disease",
    category: "J40-J47",
    chapter: "X",
    description: "Progressive airflow limitation not fully reversible",
    
    affectedOrgans: ["lungs", "heart"],
    
    biochemicalChanges: {
      inflammatory: {
        neutrophils: "↑ in airways",
        il_8: "↑",
        tnf_alpha: "↑"
      },
      oxidative_stress: "↑↑",
      proteases: "↑ (elastase, MMP-9)"
    },
    
    modelPerturbations: {
      lungs: {
        geometry: {
          residual_volume: { multiplier: 2.0 },
          frc: { multiplier: 1.5 },
          alveolar_surface: { multiplier: 0.5 }
        },
        physiology: {
          fev1: { multiplier: 0.4, note: "GOLD 3-4" },
          fev1_fvc: { absolute: 55 },
          spo2: { absolute: 88 }
        }
      },
      heart: {
        geometry: {
          rv_wall_thickness: { multiplier: 1.5 }
        },
        pressures: {
          pa_sys: { multiplier: 1.8 }
        }
      }
    },
    
    subtypes: {
      "J44.0": "With acute lower respiratory infection",
      "J44.1": "With acute exacerbation",
      "J44.9": "Unspecified"
    }
  }
};

export default { ICD_CATEGORIES, ICD_DISEASES };
