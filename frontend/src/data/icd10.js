// ICD-10-CM Classification Structure
// International Classification of Diseases, 10th Revision, Clinical Modification
// High-level structure for mapping diseases to mathematical models

export const ICD10_CHAPTERS = {
  // Chapter 1: Certain infectious and parasitic diseases (A00-B99)
  infectious: {
    code: "A00-B99",
    chapter: 1,
    name: "Certain Infectious and Parasitic Diseases",
    icon: "🦠",
    description: "Diseases caused by pathogenic microorganisms",
    subcategories: [
      { code: "A00-A09", name: "Intestinal infectious diseases" },
      { code: "A15-A19", name: "Tuberculosis" },
      { code: "A20-A28", name: "Certain zoonotic bacterial diseases" },
      { code: "A30-A49", name: "Other bacterial diseases" },
      { code: "A50-A64", name: "Infections with a predominantly sexual mode of transmission" },
      { code: "A65-A69", name: "Other spirochetal diseases" },
      { code: "A70-A74", name: "Other diseases caused by chlamydiae" },
      { code: "A75-A79", name: "Rickettsioses" },
      { code: "A80-A89", name: "Viral infections of the central nervous system" },
      { code: "A90-A99", name: "Arthropod-borne viral fevers and viral hemorrhagic fevers" },
      { code: "B00-B09", name: "Viral infections characterized by skin and mucous membrane lesions" },
      { code: "B10-B10", name: "Other human herpesviruses" },
      { code: "B15-B19", name: "Viral hepatitis" },
      { code: "B20-B20", name: "Human immunodeficiency virus [HIV] disease" },
      { code: "B25-B34", name: "Other viral diseases" },
      { code: "B35-B49", name: "Mycoses" },
      { code: "B50-B64", name: "Protozoal diseases" },
      { code: "B65-B83", name: "Helminthiases" },
      { code: "B85-B89", name: "Pediculosis, acariasis and other infestations" },
      { code: "B90-B94", name: "Sequelae of infectious and parasitic diseases" },
      { code: "B95-B97", name: "Bacterial, viral and other infectious agents" },
      { code: "B99-B99", name: "Other infectious diseases" },
    ],
    commonConditions: ["sepsis", "pneumonia", "tuberculosis", "HIV", "hepatitis_b", "hepatitis_c"],
    affectedSystems: ["immune", "respiratory", "hepatic", "cardiovascular"]
  },

  // Chapter 2: Neoplasms (C00-D49)
  neoplasms: {
    code: "C00-D49",
    chapter: 2,
    name: "Neoplasms",
    icon: "🔬",
    description: "New abnormal growth of tissue (tumors)",
    subcategories: [
      { code: "C00-C14", name: "Malignant neoplasms of lip, oral cavity and pharynx" },
      { code: "C15-C26", name: "Malignant neoplasms of digestive organs" },
      { code: "C30-C39", name: "Malignant neoplasms of respiratory and intrathoracic organs" },
      { code: "C40-C41", name: "Malignant neoplasms of bone and articular cartilage" },
      { code: "C43-C44", name: "Melanoma and other malignant neoplasms of skin" },
      { code: "C45-C49", name: "Malignant neoplasms of mesothelial and soft tissue" },
      { code: "C50-C50", name: "Malignant neoplasms of breast" },
      { code: "C51-C58", name: "Malignant neoplasms of female genital organs" },
      { code: "C60-C63", name: "Malignant neoplasms of male genital organs" },
      { code: "C64-C68", name: "Malignant neoplasms of urinary tract" },
      { code: "C69-C72", name: "Malignant neoplasms of eye, brain and other parts of CNS" },
      { code: "C73-C75", name: "Malignant neoplasms of thyroid and other endocrine glands" },
      { code: "C76-C80", name: "Malignant neoplasms of ill-defined, secondary and unspecified sites" },
      { code: "C81-C96", name: "Malignant neoplasms of lymphoid, hematopoietic and related tissue" },
      { code: "D00-D09", name: "In situ neoplasms" },
      { code: "D10-D36", name: "Benign neoplasms" },
      { code: "D37-D48", name: "Neoplasms of uncertain behavior" },
      { code: "D49-D49", name: "Neoplasms of unspecified behavior" },
    ],
    commonConditions: ["lung_cancer", "breast_cancer", "colon_cancer", "leukemia", "lymphoma"],
    affectedSystems: ["multiple_organ"]
  },

  // Chapter 3: Diseases of the blood and blood-forming organs (D50-D89)
  blood: {
    code: "D50-D89",
    chapter: 3,
    name: "Diseases of the Blood and Blood-forming Organs",
    icon: "🩸",
    description: "Hematological and immunological disorders",
    subcategories: [
      { code: "D50-D53", name: "Nutritional anemias" },
      { code: "D55-D59", name: "Hemolytic anemias" },
      { code: "D60-D64", name: "Aplastic and other anemias" },
      { code: "D65-D69", name: "Coagulation defects, purpura and other hemorrhagic conditions" },
      { code: "D70-D77", name: "Other diseases of blood and blood-forming organs" },
      { code: "D78-D78", name: "Intraoperative and postprocedural complications of spleen" },
      { code: "D80-D89", name: "Certain disorders involving the immune mechanism" },
    ],
    commonConditions: ["iron_deficiency_anemia", "sickle_cell", "hemophilia", "thrombocytopenia", "immunodeficiency"],
    affectedSystems: ["hematologic", "immune"]
  },

  // Chapter 4: Endocrine, nutritional and metabolic diseases (E00-E89)
  endocrine: {
    code: "E00-E89",
    chapter: 4,
    name: "Endocrine, Nutritional and Metabolic Diseases",
    icon: "⚗️",
    description: "Hormonal, nutritional and metabolic disorders",
    subcategories: [
      { code: "E00-E07", name: "Disorders of thyroid gland" },
      { code: "E08-E13", name: "Diabetes mellitus" },
      { code: "E15-E16", name: "Other disorders of glucose regulation and pancreatic internal secretion" },
      { code: "E20-E35", name: "Disorders of other endocrine glands" },
      { code: "E36-E36", name: "Intraoperative complications of endocrine system" },
      { code: "E40-E46", name: "Malnutrition" },
      { code: "E50-E64", name: "Other nutritional deficiencies" },
      { code: "E65-E68", name: "Overweight, obesity and other hyperalimentation" },
      { code: "E70-E88", name: "Metabolic disorders" },
      { code: "E89-E89", name: "Postprocedural endocrine and metabolic complications" },
    ],
    commonConditions: ["type2_diabetes", "type1_diabetes", "hypothyroidism", "hyperthyroidism", "obesity", "metabolic_syndrome", "cushing_syndrome", "addison_disease"],
    affectedSystems: ["endocrine", "metabolic", "cardiovascular", "renal"]
  },

  // Chapter 5: Mental, Behavioral and Neurodevelopmental disorders (F01-F99)
  mental: {
    code: "F01-F99",
    chapter: 5,
    name: "Mental, Behavioral and Neurodevelopmental Disorders",
    icon: "🧠",
    description: "Psychiatric and neurodevelopmental conditions",
    subcategories: [
      { code: "F01-F09", name: "Mental disorders due to known physiological conditions" },
      { code: "F10-F19", name: "Mental and behavioral disorders due to psychoactive substance use" },
      { code: "F20-F29", name: "Schizophrenia, schizotypal, delusional, and other psychotic disorders" },
      { code: "F30-F39", name: "Mood [affective] disorders" },
      { code: "F40-F48", name: "Anxiety, dissociative, stress-related and somatoform disorders" },
      { code: "F50-F59", name: "Behavioral syndromes associated with physiological disturbances" },
      { code: "F60-F69", name: "Disorders of adult personality and behavior" },
      { code: "F70-F79", name: "Intellectual disabilities" },
      { code: "F80-F89", name: "Pervasive and specific developmental disorders" },
      { code: "F90-F98", name: "Behavioral and emotional disorders with onset in childhood/adolescence" },
      { code: "F99-F99", name: "Unspecified mental disorder" },
    ],
    commonConditions: ["depression", "anxiety", "schizophrenia", "bipolar_disorder", "adhd", "dementia", "substance_use_disorder"],
    affectedSystems: ["neurological", "endocrine"]
  },

  // Chapter 6: Diseases of the nervous system (G00-G99)
  nervous: {
    code: "G00-G99",
    chapter: 6,
    name: "Diseases of the Nervous System",
    icon: "⚡",
    description: "Neurological disorders",
    subcategories: [
      { code: "G00-G09", name: "Inflammatory diseases of the central nervous system" },
      { code: "G10-G14", name: "Systemic atrophies primarily affecting CNS" },
      { code: "G20-G26", name: "Extrapyramidal and movement disorders" },
      { code: "G30-G32", name: "Other degenerative diseases of the nervous system" },
      { code: "G35-G37", name: "Demyelinating diseases of the central nervous system" },
      { code: "G40-G47", name: "Episodic and paroxysmal disorders" },
      { code: "G50-G59", name: "Nerve, nerve root and plexus disorders" },
      { code: "G60-G65", name: "Polyneuropathies and other disorders of peripheral nervous system" },
      { code: "G70-G73", name: "Diseases of myoneural junction and muscle" },
      { code: "G80-G83", name: "Cerebral palsy and other paralytic syndromes" },
      { code: "G89-G99", name: "Other disorders of the nervous system" },
    ],
    commonConditions: ["parkinsons", "alzheimers", "epilepsy", "multiple_sclerosis", "migraine", "neuropathy", "stroke"],
    affectedSystems: ["neurological", "musculoskeletal"]
  },

  // Chapter 7: Diseases of the eye and adnexa (H00-H59)
  eye: {
    code: "H00-H59",
    chapter: 7,
    name: "Diseases of the Eye and Adnexa",
    icon: "👁️",
    description: "Ophthalmological disorders",
    subcategories: [
      { code: "H00-H05", name: "Disorders of eyelid, lacrimal system and orbit" },
      { code: "H10-H11", name: "Disorders of conjunctiva" },
      { code: "H15-H22", name: "Disorders of sclera, cornea, iris and ciliary body" },
      { code: "H25-H28", name: "Disorders of lens" },
      { code: "H30-H36", name: "Disorders of choroid and retina" },
      { code: "H40-H42", name: "Glaucoma" },
      { code: "H43-H44", name: "Disorders of vitreous body and globe" },
      { code: "H46-H47", name: "Disorders of optic nerve and visual pathways" },
      { code: "H49-H52", name: "Disorders of ocular muscles, binocular movement, accommodation" },
      { code: "H53-H54", name: "Visual disturbances and blindness" },
      { code: "H55-H57", name: "Other disorders of eye and adnexa" },
      { code: "H59-H59", name: "Intraoperative and postprocedural complications of eye" },
    ],
    commonConditions: ["cataracts", "glaucoma", "macular_degeneration", "diabetic_retinopathy", "conjunctivitis"],
    affectedSystems: ["ophthalmologic"]
  },

  // Chapter 8: Diseases of the ear and mastoid process (H60-H95)
  ear: {
    code: "H60-H95",
    chapter: 8,
    name: "Diseases of the Ear and Mastoid Process",
    icon: "👂",
    description: "Otological disorders",
    subcategories: [
      { code: "H60-H62", name: "Diseases of external ear" },
      { code: "H65-H75", name: "Diseases of middle ear and mastoid" },
      { code: "H80-H83", name: "Diseases of inner ear" },
      { code: "H90-H94", name: "Other disorders of ear" },
      { code: "H95-H95", name: "Intraoperative and postprocedural complications of ear" },
    ],
    commonConditions: ["hearing_loss", "tinnitus", "otitis_media", "vertigo", "menieres_disease"],
    affectedSystems: ["otologic"]
  },

  // Chapter 9: Diseases of the circulatory system (I00-I99) - CRITICAL FOR THIS APP
  circulatory: {
    code: "I00-I99",
    chapter: 9,
    name: "Diseases of the Circulatory System",
    icon: "❤️",
    description: "Cardiovascular disorders",
    subcategories: [
      { code: "I00-I02", name: "Acute rheumatic fever" },
      { code: "I05-I09", name: "Chronic rheumatic heart diseases" },
      { code: "I10-I16", name: "Hypertensive diseases" },
      { code: "I20-I25", name: "Ischemic heart diseases" },
      { code: "I26-I28", name: "Pulmonary heart disease and diseases of pulmonary circulation" },
      { code: "I30-I52", name: "Other forms of heart disease" },
      { code: "I60-I69", name: "Cerebrovascular diseases" },
      { code: "I70-I79", name: "Diseases of arteries, arterioles and capillaries" },
      { code: "I80-I89", name: "Diseases of veins, lymphatic vessels and lymph nodes" },
      { code: "I95-I99", name: "Other and unspecified disorders of the circulatory system" },
    ],
    commonConditions: [
      "hypertension", 
      "hypertrophic_cardiomyopathy", 
      "dilated_cardiomyopathy",
      "heart_failure",
      "acute_mi",
      "atrial_fibrillation",
      "aortic_stenosis",
      "mitral_regurgitation",
      "coronary_artery_disease",
      "peripheral_artery_disease",
      "deep_vein_thrombosis",
      "pulmonary_embolism",
      "stroke"
    ],
    affectedSystems: ["cardiovascular", "cerebrovascular", "peripheral_vascular"]
  },

  // Chapter 10: Diseases of the respiratory system (J00-J99)
  respiratory: {
    code: "J00-J99",
    chapter: 10,
    name: "Diseases of the Respiratory System",
    icon: "🫁",
    description: "Pulmonary disorders",
    subcategories: [
      { code: "J00-J06", name: "Acute upper respiratory infections" },
      { code: "J09-J18", name: "Influenza and pneumonia" },
      { code: "J20-J22", name: "Other acute lower respiratory infections" },
      { code: "J30-J39", name: "Other diseases of upper respiratory tract" },
      { code: "J40-J47", name: "Chronic lower respiratory diseases" },
      { code: "J60-J70", name: "Lung diseases due to external agents" },
      { code: "J80-J84", name: "Other respiratory diseases principally affecting interstitium" },
      { code: "J85-J86", name: "Suppurative and necrotic conditions of lower respiratory tract" },
      { code: "J90-J94", name: "Other diseases of pleura" },
      { code: "J95-J95", name: "Intraoperative and postprocedural complications of respiratory system" },
      { code: "J96-J99", name: "Other diseases of the respiratory system" },
    ],
    commonConditions: ["copd", "asthma", "pneumonia", "ards", "pulmonary_fibrosis", "pulmonary_hypertension", "sleep_apnea", "lung_cancer"],
    affectedSystems: ["respiratory", "cardiovascular"]
  },

  // Chapter 11: Diseases of the digestive system (K00-K95)
  digestive: {
    code: "K00-K95",
    chapter: 11,
    name: "Diseases of the Digestive System",
    icon: "🫃",
    description: "Gastrointestinal disorders",
    subcategories: [
      { code: "K00-K14", name: "Diseases of oral cavity, salivary glands and jaws" },
      { code: "K20-K31", name: "Diseases of esophagus, stomach and duodenum" },
      { code: "K35-K38", name: "Diseases of appendix" },
      { code: "K40-K46", name: "Hernia" },
      { code: "K50-K52", name: "Noninfective enteritis and colitis" },
      { code: "K55-K64", name: "Other diseases of intestines" },
      { code: "K65-K68", name: "Diseases of peritoneum and retroperitoneum" },
      { code: "K70-K77", name: "Diseases of liver" },
      { code: "K80-K87", name: "Disorders of gallbladder, biliary tract and pancreas" },
      { code: "K90-K95", name: "Other diseases of the digestive system" },
    ],
    commonConditions: ["cirrhosis", "hepatitis", "gerd", "peptic_ulcer", "crohns_disease", "ulcerative_colitis", "pancreatitis", "gallstones", "fatty_liver"],
    affectedSystems: ["hepatic", "gastrointestinal"]
  },

  // Chapter 12: Diseases of the skin and subcutaneous tissue (L00-L99)
  skin: {
    code: "L00-L99",
    chapter: 12,
    name: "Diseases of the Skin and Subcutaneous Tissue",
    icon: "🧴",
    description: "Dermatological disorders",
    subcategories: [
      { code: "L00-L08", name: "Infections of the skin and subcutaneous tissue" },
      { code: "L10-L14", name: "Bullous disorders" },
      { code: "L20-L30", name: "Dermatitis and eczema" },
      { code: "L40-L45", name: "Papulosquamous disorders" },
      { code: "L49-L54", name: "Urticaria and erythema" },
      { code: "L55-L59", name: "Radiation-related disorders of the skin" },
      { code: "L60-L75", name: "Disorders of skin appendages" },
      { code: "L76-L76", name: "Intraoperative and postprocedural complications" },
      { code: "L80-L99", name: "Other disorders of skin and subcutaneous tissue" },
    ],
    commonConditions: ["psoriasis", "eczema", "acne", "cellulitis", "dermatitis", "skin_cancer"],
    affectedSystems: ["dermatologic"]
  },

  // Chapter 13: Diseases of the musculoskeletal system (M00-M99)
  musculoskeletal: {
    code: "M00-M99",
    chapter: 13,
    name: "Diseases of the Musculoskeletal System and Connective Tissue",
    icon: "🦴",
    description: "Orthopedic and rheumatological disorders",
    subcategories: [
      { code: "M00-M02", name: "Infectious arthropathies" },
      { code: "M04-M04", name: "Autoinflammatory syndromes" },
      { code: "M05-M14", name: "Inflammatory polyarthropathies" },
      { code: "M15-M19", name: "Osteoarthritis" },
      { code: "M20-M25", name: "Other joint disorders" },
      { code: "M26-M27", name: "Dentofacial anomalies and jaw disorders" },
      { code: "M30-M36", name: "Systemic connective tissue disorders" },
      { code: "M40-M43", name: "Deforming dorsopathies" },
      { code: "M45-M49", name: "Spondylopathies" },
      { code: "M50-M54", name: "Other dorsopathies" },
      { code: "M60-M63", name: "Disorders of muscles" },
      { code: "M65-M67", name: "Disorders of synovium and tendon" },
      { code: "M70-M79", name: "Other soft tissue disorders" },
      { code: "M80-M85", name: "Disorders of bone density and structure" },
      { code: "M86-M90", name: "Other osteopathies" },
      { code: "M91-M94", name: "Chondropathies" },
      { code: "M95-M95", name: "Other disorders of musculoskeletal system" },
      { code: "M96-M96", name: "Intraoperative and postprocedural complications" },
      { code: "M97-M97", name: "Periprosthetic fracture around internal prosthetic joint" },
      { code: "M99-M99", name: "Biomechanical lesions, not elsewhere classified" },
    ],
    commonConditions: ["osteoarthritis", "rheumatoid_arthritis", "osteoporosis", "gout", "lupus", "fibromyalgia", "back_pain"],
    affectedSystems: ["musculoskeletal", "immune"]
  },

  // Chapter 14: Diseases of the genitourinary system (N00-N99)
  genitourinary: {
    code: "N00-N99",
    chapter: 14,
    name: "Diseases of the Genitourinary System",
    icon: "🫘",
    description: "Urological and gynecological disorders",
    subcategories: [
      { code: "N00-N08", name: "Glomerular diseases" },
      { code: "N10-N16", name: "Renal tubulo-interstitial diseases" },
      { code: "N17-N19", name: "Acute kidney failure and chronic kidney disease" },
      { code: "N20-N23", name: "Urolithiasis" },
      { code: "N25-N29", name: "Other disorders of kidney and ureter" },
      { code: "N30-N39", name: "Other diseases of urinary system" },
      { code: "N40-N53", name: "Diseases of male genital organs" },
      { code: "N60-N65", name: "Disorders of breast" },
      { code: "N70-N77", name: "Inflammatory diseases of female pelvic organs" },
      { code: "N80-N98", name: "Noninflammatory disorders of female genital tract" },
      { code: "N99-N99", name: "Intraoperative and postprocedural complications" },
    ],
    commonConditions: ["ckd", "acute_kidney_injury", "glomerulonephritis", "kidney_stones", "uti", "bph", "prostate_cancer", "endometriosis"],
    affectedSystems: ["renal", "urological", "reproductive"]
  },

  // Chapter 15: Pregnancy, childbirth and the puerperium (O00-O9A)
  pregnancy: {
    code: "O00-O9A",
    chapter: 15,
    name: "Pregnancy, Childbirth and the Puerperium",
    icon: "🤰",
    description: "Obstetric conditions",
    subcategories: [
      { code: "O00-O08", name: "Pregnancy with abortive outcome" },
      { code: "O09-O09", name: "Supervision of high risk pregnancy" },
      { code: "O10-O16", name: "Edema, proteinuria and hypertensive disorders in pregnancy" },
      { code: "O20-O29", name: "Other maternal disorders predominantly related to pregnancy" },
      { code: "O30-O48", name: "Maternal care related to fetus and amniotic cavity" },
      { code: "O60-O77", name: "Complications of labor and delivery" },
      { code: "O80-O82", name: "Encounter for delivery" },
      { code: "O85-O92", name: "Complications predominantly related to the puerperium" },
      { code: "O94-O9A", name: "Other obstetric conditions, not elsewhere classified" },
    ],
    commonConditions: ["preeclampsia", "gestational_diabetes", "ectopic_pregnancy", "placenta_previa", "postpartum_hemorrhage"],
    affectedSystems: ["reproductive", "cardiovascular", "renal"]
  },

  // Chapter 16: Certain conditions originating in the perinatal period (P00-P96)
  perinatal: {
    code: "P00-P96",
    chapter: 16,
    name: "Certain Conditions Originating in the Perinatal Period",
    icon: "👶",
    description: "Neonatal disorders",
    subcategories: [
      { code: "P00-P04", name: "Newborn affected by maternal factors and complications" },
      { code: "P05-P08", name: "Disorders related to length of gestation and fetal growth" },
      { code: "P09-P09", name: "Abnormal findings on neonatal screening" },
      { code: "P10-P15", name: "Birth trauma" },
      { code: "P19-P29", name: "Respiratory and cardiovascular disorders" },
      { code: "P35-P39", name: "Infections specific to the perinatal period" },
      { code: "P50-P61", name: "Hemorrhagic and hematological disorders of newborn" },
      { code: "P70-P74", name: "Transitory endocrine and metabolic disorders" },
      { code: "P76-P78", name: "Digestive system disorders of newborn" },
      { code: "P80-P83", name: "Conditions involving the integument and temperature" },
      { code: "P84-P84", name: "Other problems with newborn" },
      { code: "P90-P96", name: "Other disorders originating in the perinatal period" },
    ],
    commonConditions: ["prematurity", "respiratory_distress_syndrome", "neonatal_jaundice", "birth_asphyxia"],
    affectedSystems: ["neonatal", "respiratory", "neurological"]
  },

  // Chapter 17: Congenital malformations (Q00-Q99)
  congenital: {
    code: "Q00-Q99",
    chapter: 17,
    name: "Congenital Malformations, Deformations and Chromosomal Abnormalities",
    icon: "🧬",
    description: "Birth defects and genetic conditions",
    subcategories: [
      { code: "Q00-Q07", name: "Congenital malformations of the nervous system" },
      { code: "Q10-Q18", name: "Congenital malformations of eye, ear, face and neck" },
      { code: "Q20-Q28", name: "Congenital malformations of the circulatory system" },
      { code: "Q30-Q34", name: "Congenital malformations of the respiratory system" },
      { code: "Q35-Q37", name: "Cleft lip and cleft palate" },
      { code: "Q38-Q45", name: "Other congenital malformations of the digestive system" },
      { code: "Q50-Q56", name: "Congenital malformations of genital organs" },
      { code: "Q60-Q64", name: "Congenital malformations of the urinary system" },
      { code: "Q65-Q79", name: "Congenital malformations and deformations of musculoskeletal system" },
      { code: "Q80-Q89", name: "Other congenital malformations" },
      { code: "Q90-Q99", name: "Chromosomal abnormalities, not elsewhere classified" },
    ],
    commonConditions: ["down_syndrome", "congenital_heart_defects", "spina_bifida", "cystic_fibrosis", "cleft_palate"],
    affectedSystems: ["genetic", "multiple_organ"]
  },

  // Chapter 18: Symptoms, signs and abnormal clinical findings (R00-R99)
  symptoms: {
    code: "R00-R99",
    chapter: 18,
    name: "Symptoms, Signs and Abnormal Clinical and Laboratory Findings",
    icon: "🔍",
    description: "Clinical findings not elsewhere classified",
    subcategories: [
      { code: "R00-R09", name: "Symptoms and signs involving the circulatory and respiratory systems" },
      { code: "R10-R19", name: "Symptoms and signs involving the digestive system and abdomen" },
      { code: "R20-R23", name: "Symptoms and signs involving the skin and subcutaneous tissue" },
      { code: "R25-R29", name: "Symptoms and signs involving the nervous and musculoskeletal systems" },
      { code: "R30-R39", name: "Symptoms and signs involving the genitourinary system" },
      { code: "R40-R46", name: "Symptoms and signs involving cognition, perception and emotional state" },
      { code: "R47-R49", name: "Symptoms and signs involving speech and voice" },
      { code: "R50-R69", name: "General symptoms and signs" },
      { code: "R70-R79", name: "Abnormal findings on examination of blood, without diagnosis" },
      { code: "R80-R82", name: "Abnormal findings on examination of urine, without diagnosis" },
      { code: "R83-R89", name: "Abnormal findings on examination of other body fluids" },
      { code: "R90-R94", name: "Abnormal findings on diagnostic imaging and function studies" },
      { code: "R97-R97", name: "Abnormal tumor markers" },
      { code: "R99-R99", name: "Ill-defined and unknown cause of mortality" },
    ],
    commonConditions: ["chest_pain", "dyspnea", "fatigue", "fever", "syncope", "edema"],
    affectedSystems: ["nonspecific"]
  },

  // Chapter 19: Injury, poisoning and external causes (S00-T88)
  injury: {
    code: "S00-T88",
    chapter: 19,
    name: "Injury, Poisoning and Certain Other Consequences of External Causes",
    icon: "🩹",
    description: "Trauma and toxic effects",
    subcategories: [
      { code: "S00-S09", name: "Injuries to the head" },
      { code: "S10-S19", name: "Injuries to the neck" },
      { code: "S20-S29", name: "Injuries to the thorax" },
      { code: "S30-S39", name: "Injuries to the abdomen, lower back, lumbar spine and pelvis" },
      { code: "S40-S49", name: "Injuries to the shoulder and upper arm" },
      { code: "S50-S59", name: "Injuries to the elbow and forearm" },
      { code: "S60-S69", name: "Injuries to the wrist, hand and fingers" },
      { code: "S70-S79", name: "Injuries to the hip and thigh" },
      { code: "S80-S89", name: "Injuries to the knee and lower leg" },
      { code: "S90-S99", name: "Injuries to the ankle and foot" },
      { code: "T07-T07", name: "Injuries involving multiple body regions" },
      { code: "T14-T14", name: "Injury of unspecified body region" },
      { code: "T15-T19", name: "Effects of foreign body entering through natural orifice" },
      { code: "T20-T32", name: "Burns and corrosions" },
      { code: "T33-T34", name: "Frostbite" },
      { code: "T36-T50", name: "Poisoning by drugs, medicaments and biological substances" },
      { code: "T51-T65", name: "Toxic effects of substances chiefly nonmedicinal as to source" },
      { code: "T66-T78", name: "Other and unspecified effects of external causes" },
      { code: "T79-T79", name: "Certain early complications of trauma" },
      { code: "T80-T88", name: "Complications of surgical and medical care, not elsewhere classified" },
    ],
    commonConditions: ["fractures", "burns", "head_trauma", "poisoning", "drug_overdose"],
    affectedSystems: ["trauma", "multiple_organ"]
  },

  // Chapter 20: External causes of morbidity (V00-Y99)
  external: {
    code: "V00-Y99",
    chapter: 20,
    name: "External Causes of Morbidity",
    icon: "⚠️",
    description: "Environmental and circumstantial causes",
    subcategories: [
      { code: "V00-V99", name: "Transport accidents" },
      { code: "W00-X58", name: "Other external causes of accidental injury" },
      { code: "X71-X83", name: "Intentional self-harm" },
      { code: "X92-Y09", name: "Assault" },
      { code: "Y21-Y33", name: "Event of undetermined intent" },
      { code: "Y35-Y38", name: "Legal intervention, operations of war, military operations, terrorism" },
      { code: "Y62-Y84", name: "Complications of medical and surgical care" },
      { code: "Y90-Y99", name: "Supplementary factors related to causes of morbidity" },
    ],
    commonConditions: [],
    affectedSystems: ["external"]
  },

  // Chapter 21: Factors influencing health status (Z00-Z99)
  healthStatus: {
    code: "Z00-Z99",
    chapter: 21,
    name: "Factors Influencing Health Status and Contact with Health Services",
    icon: "📋",
    description: "Health encounters and status codes",
    subcategories: [
      { code: "Z00-Z13", name: "Persons encountering health services for examinations" },
      { code: "Z14-Z15", name: "Genetic carrier and genetic susceptibility to disease" },
      { code: "Z16-Z16", name: "Resistance to antimicrobial drugs" },
      { code: "Z17-Z17", name: "Estrogen receptor status" },
      { code: "Z18-Z18", name: "Retained foreign body fragments" },
      { code: "Z19-Z19", name: "Hormone sensitivity malignancy status" },
      { code: "Z20-Z29", name: "Persons with potential health hazards related to communicable diseases" },
      { code: "Z30-Z39", name: "Persons encountering health services for reproduction" },
      { code: "Z40-Z53", name: "Encounters for other specific health care" },
      { code: "Z55-Z65", name: "Persons with potential health hazards related to socioeconomic factors" },
      { code: "Z66-Z66", name: "Do not resuscitate status" },
      { code: "Z67-Z67", name: "Blood type" },
      { code: "Z68-Z68", name: "Body mass index" },
      { code: "Z69-Z76", name: "Persons encountering health services in other circumstances" },
      { code: "Z77-Z99", name: "Persons with potential health hazards related to family and personal history" },
    ],
    commonConditions: [],
    affectedSystems: ["administrative"]
  }
};

// Common conditions mapped to ICD-10 codes with mathematical model references
export const COMMON_CONDITIONS = {
  // CARDIOVASCULAR (I00-I99)
  hypertension: {
    icd10: "I10",
    name: "Essential Hypertension",
    chapter: "circulatory",
    modelRef: "hypertension",
    prevalence: "~30% adults",
    description: "Persistently elevated blood pressure"
  },
  hypertrophic_cardiomyopathy: {
    icd10: "I42.1",
    name: "Hypertrophic Cardiomyopathy",
    chapter: "circulatory",
    modelRef: "hypertrophic_cardiomyopathy",
    prevalence: "1:500",
    description: "Genetic disease causing abnormal heart muscle thickening"
  },
  dilated_cardiomyopathy: {
    icd10: "I42.0",
    name: "Dilated Cardiomyopathy",
    chapter: "circulatory",
    modelRef: "dilated_cardiomyopathy",
    prevalence: "1:2500",
    description: "Heart muscle disease with ventricular dilation"
  },
  heart_failure: {
    icd10: "I50",
    name: "Heart Failure",
    chapter: "circulatory",
    modelRef: "heart_failure",
    prevalence: "~2% adults",
    description: "Inability of heart to meet metabolic demands"
  },
  acute_mi: {
    icd10: "I21",
    name: "Acute Myocardial Infarction",
    chapter: "circulatory",
    modelRef: "acute_mi",
    prevalence: "~800,000/year (US)",
    description: "Acute coronary occlusion with myocardial necrosis"
  },
  atrial_fibrillation: {
    icd10: "I48",
    name: "Atrial Fibrillation",
    chapter: "circulatory",
    modelRef: "atrial_fibrillation",
    prevalence: "~2% adults",
    description: "Irregular atrial rhythm with rapid ventricular response"
  },
  aortic_stenosis: {
    icd10: "I35.0",
    name: "Aortic Stenosis",
    chapter: "circulatory",
    modelRef: "aortic_stenosis",
    prevalence: "2-7% >65yo",
    description: "Narrowing of aortic valve opening"
  },

  // METABOLIC (E00-E89)
  type2_diabetes: {
    icd10: "E11",
    name: "Type 2 Diabetes Mellitus",
    chapter: "endocrine",
    modelRef: "type2_diabetes",
    prevalence: "~10% adults",
    description: "Insulin resistance with relative insulin deficiency"
  },
  type1_diabetes: {
    icd10: "E10",
    name: "Type 1 Diabetes Mellitus",
    chapter: "endocrine",
    modelRef: "type1_diabetes",
    prevalence: "~0.5%",
    description: "Autoimmune destruction of pancreatic beta cells"
  },
  hypothyroidism: {
    icd10: "E03",
    name: "Hypothyroidism",
    chapter: "endocrine",
    modelRef: "hypothyroidism",
    prevalence: "~5%",
    description: "Deficient thyroid hormone production"
  },
  hyperthyroidism: {
    icd10: "E05",
    name: "Hyperthyroidism",
    chapter: "endocrine",
    modelRef: "hyperthyroidism",
    prevalence: "~1%",
    description: "Excess thyroid hormone production"
  },
  obesity: {
    icd10: "E66",
    name: "Obesity",
    chapter: "endocrine",
    modelRef: "obesity",
    prevalence: "~40% adults",
    description: "Excess body fat accumulation"
  },
  metabolic_syndrome: {
    icd10: "E88.81",
    name: "Metabolic Syndrome",
    chapter: "endocrine",
    modelRef: "metabolic_syndrome",
    prevalence: "~35% adults",
    description: "Cluster of cardiometabolic risk factors"
  },

  // RESPIRATORY (J00-J99)
  copd: {
    icd10: "J44",
    name: "Chronic Obstructive Pulmonary Disease",
    chapter: "respiratory",
    modelRef: "copd",
    prevalence: "~6% adults",
    description: "Chronic airflow limitation"
  },
  asthma: {
    icd10: "J45",
    name: "Asthma",
    chapter: "respiratory",
    modelRef: "asthma",
    prevalence: "~8%",
    description: "Chronic airway inflammation with reversible obstruction"
  },
  pneumonia: {
    icd10: "J18",
    name: "Pneumonia",
    chapter: "respiratory",
    modelRef: "pneumonia",
    prevalence: "~1% annually",
    description: "Lung parenchymal infection"
  },
  ards: {
    icd10: "J80",
    name: "Acute Respiratory Distress Syndrome",
    chapter: "respiratory",
    modelRef: "ards",
    prevalence: "~200,000/year (US)",
    description: "Severe inflammatory lung injury"
  },
  pulmonary_fibrosis: {
    icd10: "J84.1",
    name: "Idiopathic Pulmonary Fibrosis",
    chapter: "respiratory",
    modelRef: "pulmonary_fibrosis",
    prevalence: "~50/100,000",
    description: "Progressive scarring of lung tissue"
  },

  // RENAL (N00-N99)
  ckd: {
    icd10: "N18",
    name: "Chronic Kidney Disease",
    chapter: "genitourinary",
    modelRef: "ckd",
    prevalence: "~15% adults",
    description: "Progressive loss of kidney function"
  },
  acute_kidney_injury: {
    icd10: "N17",
    name: "Acute Kidney Injury",
    chapter: "genitourinary",
    modelRef: "acute_kidney_injury",
    prevalence: "~5% hospitalized",
    description: "Rapid decline in kidney function"
  },
  glomerulonephritis: {
    icd10: "N05",
    name: "Glomerulonephritis",
    chapter: "genitourinary",
    modelRef: "glomerulonephritis",
    prevalence: "~0.2%",
    description: "Inflammation of kidney glomeruli"
  },

  // HEPATIC (K70-K77)
  cirrhosis: {
    icd10: "K74",
    name: "Cirrhosis",
    chapter: "digestive",
    modelRef: "cirrhosis",
    prevalence: "~0.3%",
    description: "End-stage liver fibrosis"
  },
  fatty_liver: {
    icd10: "K76.0",
    name: "Non-alcoholic Fatty Liver Disease",
    chapter: "digestive",
    modelRef: "fatty_liver",
    prevalence: "~25%",
    description: "Hepatic steatosis without significant alcohol use"
  },
  hepatitis_b: {
    icd10: "B18.1",
    name: "Chronic Hepatitis B",
    chapter: "infectious",
    modelRef: "hepatitis_b",
    prevalence: "~0.3% (US), higher globally",
    description: "Chronic HBV infection"
  },
  hepatitis_c: {
    icd10: "B18.2",
    name: "Chronic Hepatitis C",
    chapter: "infectious",
    modelRef: "hepatitis_c",
    prevalence: "~1%",
    description: "Chronic HCV infection"
  },

  // NEUROLOGICAL (G00-G99)
  parkinsons: {
    icd10: "G20",
    name: "Parkinson's Disease",
    chapter: "nervous",
    modelRef: "parkinsons",
    prevalence: "~1% >60yo",
    description: "Dopaminergic neurodegeneration"
  },
  alzheimers: {
    icd10: "G30",
    name: "Alzheimer's Disease",
    chapter: "nervous",
    modelRef: "alzheimers",
    prevalence: "~10% >65yo",
    description: "Progressive neurodegenerative dementia"
  },
  epilepsy: {
    icd10: "G40",
    name: "Epilepsy",
    chapter: "nervous",
    modelRef: "epilepsy",
    prevalence: "~1%",
    description: "Recurrent unprovoked seizures"
  },
  multiple_sclerosis: {
    icd10: "G35",
    name: "Multiple Sclerosis",
    chapter: "nervous",
    modelRef: "multiple_sclerosis",
    prevalence: "~0.1%",
    description: "Autoimmune demyelinating disease"
  },
  stroke: {
    icd10: "I63",
    name: "Ischemic Stroke",
    chapter: "circulatory",
    modelRef: "stroke",
    prevalence: "~800,000/year (US)",
    description: "Acute cerebral ischemia"
  },

  // INFECTIOUS (A00-B99)
  sepsis: {
    icd10: "A41",
    name: "Sepsis",
    chapter: "infectious",
    modelRef: "sepsis",
    prevalence: "~1.7M/year (US)",
    description: "Life-threatening organ dysfunction from infection"
  },

  // HEMATOLOGIC (D50-D89)
  iron_deficiency_anemia: {
    icd10: "D50",
    name: "Iron Deficiency Anemia",
    chapter: "blood",
    modelRef: "iron_deficiency_anemia",
    prevalence: "~5-10%",
    description: "Anemia from inadequate iron"
  },
  sickle_cell: {
    icd10: "D57",
    name: "Sickle Cell Disease",
    chapter: "blood",
    modelRef: "sickle_cell",
    prevalence: "~0.1% (higher in certain populations)",
    description: "Genetic hemoglobinopathy"
  },

  // AUTOIMMUNE/RHEUMATIC (M00-M99)
  rheumatoid_arthritis: {
    icd10: "M05",
    name: "Rheumatoid Arthritis",
    chapter: "musculoskeletal",
    modelRef: "rheumatoid_arthritis",
    prevalence: "~1%",
    description: "Chronic inflammatory joint disease"
  },
  osteoarthritis: {
    icd10: "M15-M19",
    name: "Osteoarthritis",
    chapter: "musculoskeletal",
    modelRef: "osteoarthritis",
    prevalence: "~30% >60yo",
    description: "Degenerative joint disease"
  },
  osteoporosis: {
    icd10: "M81",
    name: "Osteoporosis",
    chapter: "musculoskeletal",
    modelRef: "osteoporosis",
    prevalence: "~10%",
    description: "Reduced bone mineral density"
  },
  lupus: {
    icd10: "M32",
    name: "Systemic Lupus Erythematosus",
    chapter: "musculoskeletal",
    modelRef: "lupus",
    prevalence: "~0.1%",
    description: "Systemic autoimmune disease"
  },
  gout: {
    icd10: "M10",
    name: "Gout",
    chapter: "musculoskeletal",
    modelRef: "gout",
    prevalence: "~4%",
    description: "Crystal arthropathy from uric acid"
  }
};

// Helper function to get diseases by chapter
export const getDiseasesByChapter = (chapterKey) => {
  return Object.entries(COMMON_CONDITIONS)
    .filter(([_, disease]) => disease.chapter === chapterKey)
    .map(([key, disease]) => ({ id: key, ...disease }));
};

// Helper function to get all modeled diseases
export const getModeledDiseases = () => {
  return Object.entries(COMMON_CONDITIONS)
    .filter(([_, disease]) => disease.modelRef)
    .map(([key, disease]) => ({ id: key, ...disease }));
};

// Helper function to look up ICD-10 code
export const lookupICD10 = (code) => {
  // Find in common conditions
  const condition = Object.entries(COMMON_CONDITIONS)
    .find(([_, disease]) => disease.icd10 === code || disease.icd10.includes(code));
  
  if (condition) {
    return { type: 'condition', data: { id: condition[0], ...condition[1] } };
  }
  
  // Find chapter
  const chapter = Object.entries(ICD10_CHAPTERS)
    .find(([_, ch]) => {
      const [start, end] = ch.code.split('-');
      return code >= start && code <= end;
    });
  
  if (chapter) {
    return { type: 'chapter', data: { id: chapter[0], ...chapter[1] } };
  }
  
  return null;
};

export default { ICD10_CHAPTERS, COMMON_CONDITIONS, getDiseasesByChapter, getModeledDiseases, lookupICD10 };
