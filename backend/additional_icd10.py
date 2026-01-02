"""
Additional ICD-10 conditions for underrepresented chapters:
- H: Eye and Ear disorders
- O: Pregnancy, childbirth, puerperium  
- P: Perinatal conditions
- Z: Health status factors
"""

ADDITIONAL_CATEGORIES = [
    # ============ EYE DISORDERS (H00-H59) ============
    {"name": "Cataracts", "icd10": "H25.9", "category": "ophthalmology"},
    {"name": "Glaucoma", "icd10": "H40.9", "category": "ophthalmology"},
    {"name": "Age-Related Macular Degeneration", "icd10": "H35.30", "category": "ophthalmology"},
    {"name": "Diabetic Retinopathy", "icd10": "H36.0", "category": "ophthalmology"},
    {"name": "Retinal Detachment", "icd10": "H33.0", "category": "ophthalmology"},
    {"name": "Conjunctivitis", "icd10": "H10.9", "category": "ophthalmology"},
    {"name": "Uveitis", "icd10": "H20.9", "category": "ophthalmology"},
    {"name": "Keratitis", "icd10": "H16.9", "category": "ophthalmology"},
    {"name": "Optic Neuritis", "icd10": "H46.9", "category": "ophthalmology"},
    {"name": "Central Retinal Artery Occlusion", "icd10": "H34.1", "category": "ophthalmology"},
    {"name": "Central Retinal Vein Occlusion", "icd10": "H34.81", "category": "ophthalmology"},
    
    # ============ EAR DISORDERS (H60-H95) ============
    {"name": "Otitis Media", "icd10": "H66.9", "category": "otolaryngology"},
    {"name": "Otitis Externa", "icd10": "H60.9", "category": "otolaryngology"},
    {"name": "Meniere's Disease", "icd10": "H81.0", "category": "otolaryngology"},
    {"name": "Benign Paroxysmal Positional Vertigo (BPPV)", "icd10": "H81.1", "category": "otolaryngology"},
    {"name": "Sensorineural Hearing Loss", "icd10": "H90.5", "category": "otolaryngology"},
    {"name": "Tinnitus", "icd10": "H93.1", "category": "otolaryngology"},
    {"name": "Acoustic Neuroma", "icd10": "D33.3", "category": "otolaryngology"},
    {"name": "Cholesteatoma", "icd10": "H71.9", "category": "otolaryngology"},
    {"name": "Mastoiditis", "icd10": "H70.9", "category": "otolaryngology"},
    {"name": "Vestibular Neuritis", "icd10": "H81.2", "category": "otolaryngology"},
    
    # ============ PREGNANCY (O00-O9A) ============
    {"name": "Ectopic Pregnancy", "icd10": "O00.9", "category": "obstetrics"},
    {"name": "Spontaneous Abortion (Miscarriage)", "icd10": "O03.9", "category": "obstetrics"},
    {"name": "Preeclampsia", "icd10": "O14.9", "category": "obstetrics"},
    {"name": "Eclampsia", "icd10": "O15.9", "category": "obstetrics"},
    {"name": "HELLP Syndrome", "icd10": "O14.2", "category": "obstetrics"},
    {"name": "Gestational Diabetes", "icd10": "O24.4", "category": "obstetrics"},
    {"name": "Placenta Previa", "icd10": "O44.1", "category": "obstetrics"},
    {"name": "Placental Abruption", "icd10": "O45.9", "category": "obstetrics"},
    {"name": "Postpartum Hemorrhage", "icd10": "O72.1", "category": "obstetrics"},
    {"name": "Hyperemesis Gravidarum", "icd10": "O21.1", "category": "obstetrics"},
    {"name": "Preterm Labor", "icd10": "O60.0", "category": "obstetrics"},
    {"name": "Premature Rupture of Membranes", "icd10": "O42.9", "category": "obstetrics"},
    {"name": "Chorioamnionitis", "icd10": "O41.1", "category": "obstetrics"},
    {"name": "Intrauterine Growth Restriction", "icd10": "O36.5", "category": "obstetrics"},
    {"name": "Postpartum Depression", "icd10": "O90.6", "category": "obstetrics"},
    {"name": "Deep Vein Thrombosis in Pregnancy", "icd10": "O22.3", "category": "obstetrics"},
    {"name": "Pulmonary Embolism in Pregnancy", "icd10": "O88.2", "category": "obstetrics"},
    
    # ============ PERINATAL CONDITIONS (P00-P96) ============
    {"name": "Neonatal Respiratory Distress Syndrome", "icd10": "P22.0", "category": "neonatology"},
    {"name": "Neonatal Jaundice", "icd10": "P59.9", "category": "neonatology"},
    {"name": "Neonatal Sepsis", "icd10": "P36.9", "category": "neonatology"},
    {"name": "Necrotizing Enterocolitis", "icd10": "P77.9", "category": "neonatology"},
    {"name": "Intraventricular Hemorrhage (Newborn)", "icd10": "P52.3", "category": "neonatology"},
    {"name": "Periventricular Leukomalacia", "icd10": "P91.2", "category": "neonatology"},
    {"name": "Retinopathy of Prematurity", "icd10": "H35.1", "category": "neonatology"},
    {"name": "Bronchopulmonary Dysplasia", "icd10": "P27.1", "category": "neonatology"},
    {"name": "Meconium Aspiration Syndrome", "icd10": "P24.0", "category": "neonatology"},
    {"name": "Hypoxic-Ischemic Encephalopathy", "icd10": "P91.6", "category": "neonatology"},
    {"name": "Transient Tachypnea of Newborn", "icd10": "P22.1", "category": "neonatology"},
    {"name": "Persistent Pulmonary Hypertension of Newborn", "icd10": "P29.3", "category": "neonatology"},
    
    # ============ GYNECOLOGY ============
    {"name": "Endometriosis", "icd10": "N80.9", "category": "gynecology"},
    {"name": "Uterine Fibroids", "icd10": "D25.9", "category": "gynecology"},
    {"name": "Polycystic Ovary Syndrome", "icd10": "E28.2", "category": "gynecology"},
    {"name": "Pelvic Inflammatory Disease", "icd10": "N73.9", "category": "gynecology"},
    {"name": "Ovarian Cyst", "icd10": "N83.2", "category": "gynecology"},
    {"name": "Ovarian Torsion", "icd10": "N83.5", "category": "gynecology"},
    {"name": "Dysfunctional Uterine Bleeding", "icd10": "N93.9", "category": "gynecology"},
    {"name": "Menopause", "icd10": "N95.1", "category": "gynecology"},
    {"name": "Vulvovaginal Candidiasis", "icd10": "B37.3", "category": "gynecology"},
    {"name": "Bacterial Vaginosis", "icd10": "N76.0", "category": "gynecology"},
    
    # ============ UROLOGY/MALE HEALTH ============
    {"name": "Benign Prostatic Hyperplasia", "icd10": "N40.0", "category": "urology"},
    {"name": "Prostate Cancer", "icd10": "C61", "category": "urology"},
    {"name": "Erectile Dysfunction", "icd10": "N52.9", "category": "urology"},
    {"name": "Testicular Torsion", "icd10": "N44.0", "category": "urology"},
    {"name": "Epididymitis", "icd10": "N45.1", "category": "urology"},
    {"name": "Testicular Cancer", "icd10": "C62.9", "category": "urology"},
    {"name": "Urinary Incontinence", "icd10": "R32", "category": "urology"},
    {"name": "Interstitial Cystitis", "icd10": "N30.1", "category": "urology"},
    
    # ============ DERMATOLOGY (L00-L99) ============
    {"name": "Psoriasis", "icd10": "L40.9", "category": "dermatological"},
    {"name": "Atopic Dermatitis (Eczema)", "icd10": "L20.9", "category": "dermatological"},
    {"name": "Contact Dermatitis", "icd10": "L25.9", "category": "dermatological"},
    {"name": "Seborrheic Dermatitis", "icd10": "L21.9", "category": "dermatological"},
    {"name": "Acne Vulgaris", "icd10": "L70.0", "category": "dermatological"},
    {"name": "Rosacea", "icd10": "L71.9", "category": "dermatological"},
    {"name": "Vitiligo", "icd10": "L80", "category": "dermatological"},
    {"name": "Alopecia Areata", "icd10": "L63.9", "category": "dermatological"},
    {"name": "Urticaria (Hives)", "icd10": "L50.9", "category": "dermatological"},
    {"name": "Herpes Zoster (Shingles)", "icd10": "B02.9", "category": "dermatological"},
    {"name": "Impetigo", "icd10": "L01.0", "category": "dermatological"},
    {"name": "Tinea Infections", "icd10": "B35.9", "category": "dermatological"},
    {"name": "Scabies", "icd10": "B86", "category": "dermatological"},
    {"name": "Pressure Ulcers", "icd10": "L89.9", "category": "dermatological"},
    {"name": "Stevens-Johnson Syndrome", "icd10": "L51.1", "category": "dermatological"},
    {"name": "Toxic Epidermal Necrolysis", "icd10": "L51.2", "category": "dermatological"},
    
    # ============ MUSCULOSKELETAL (M00-M99) ============
    {"name": "Osteoarthritis", "icd10": "M19.9", "category": "musculoskeletal"},
    {"name": "Rheumatoid Arthritis", "icd10": "M06.9", "category": "musculoskeletal"},
    {"name": "Gout", "icd10": "M10.9", "category": "musculoskeletal"},
    {"name": "Osteoporosis", "icd10": "M81.0", "category": "musculoskeletal"},
    {"name": "Fibromyalgia", "icd10": "M79.7", "category": "musculoskeletal"},
    {"name": "Low Back Pain", "icd10": "M54.5", "category": "musculoskeletal"},
    {"name": "Herniated Disc", "icd10": "M51.1", "category": "musculoskeletal"},
    {"name": "Spinal Stenosis", "icd10": "M48.0", "category": "musculoskeletal"},
    {"name": "Rotator Cuff Tear", "icd10": "M75.1", "category": "musculoskeletal"},
    {"name": "Frozen Shoulder", "icd10": "M75.0", "category": "musculoskeletal"},
    {"name": "Plantar Fasciitis", "icd10": "M72.2", "category": "musculoskeletal"},
    {"name": "Tendinitis", "icd10": "M77.9", "category": "musculoskeletal"},
    {"name": "Bursitis", "icd10": "M71.9", "category": "musculoskeletal"},
]

def get_additional_icd10_conditions():
    return ADDITIONAL_CATEGORIES
