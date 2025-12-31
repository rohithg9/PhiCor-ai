from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from scipy.integrate import odeint
import numpy as np
import tempfile
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'mathematical-human-secret-key-2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="The Mathematical Human API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== PYDANTIC MODELS ==============

# Auth Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Patient Profile Models
class PatientProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    age: int
    sex: str
    weight: float  # kg
    height: float  # cm
    medical_history: List[str] = []
    current_medications: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PatientProfileCreate(BaseModel):
    name: str
    age: int
    sex: str
    weight: float
    height: float
    medical_history: List[str] = []
    current_medications: List[str] = []

# Physiological State Models
class PhysiologicalState(BaseModel):
    # Cardiovascular
    heart_rate: float = 70.0  # bpm
    systolic_bp: float = 120.0  # mmHg
    diastolic_bp: float = 80.0  # mmHg
    cardiac_output: float = 5.0  # L/min
    stroke_volume: float = 70.0  # mL
    total_peripheral_resistance: float = 1.0  # normalized
    
    # Respiratory
    respiratory_rate: float = 14.0  # breaths/min
    tidal_volume: float = 500.0  # mL
    oxygen_saturation: float = 98.0  # %
    pao2: float = 95.0  # mmHg
    paco2: float = 40.0  # mmHg
    
    # Renal
    gfr: float = 100.0  # mL/min
    creatinine: float = 1.0  # mg/dL
    bun: float = 15.0  # mg/dL
    urine_output: float = 1500.0  # mL/day
    
    # Hepatic
    alt: float = 30.0  # U/L
    ast: float = 25.0  # U/L
    albumin: float = 4.0  # g/dL
    bilirubin: float = 0.8  # mg/dL
    
    # Glucose-Insulin
    glucose: float = 90.0  # mg/dL
    insulin: float = 10.0  # μU/mL
    hba1c: float = 5.5  # %
    
    # Electrolytes
    sodium: float = 140.0  # mEq/L
    potassium: float = 4.0  # mEq/L
    chloride: float = 100.0  # mEq/L
    bicarbonate: float = 24.0  # mEq/L
    
    # Body Temperature
    temperature: float = 37.0  # °C

# Simulation Models
class SimulationCreate(BaseModel):
    patient_id: str
    name: str
    description: str = ""
    influences: List[Dict[str, Any]] = []

class Simulation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    patient_id: str
    name: str
    description: str = ""
    baseline_state: Dict[str, float] = {}
    current_state: Dict[str, float] = {}
    influences: List[Dict[str, Any]] = []
    timeline: List[Dict[str, Any]] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Drug Influence Models
class DrugInfluence(BaseModel):
    drug_name: str
    dosage: float  # mg
    frequency: str  # "once", "every_6h", "every_8h", "every_12h", "daily"
    duration_hours: float
    route: str = "oral"  # "oral", "iv", "im", "sc"

# AI Chat Models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    simulation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str] = []

# ============== DRUG DATABASE MODELS ==============

class ParameterModification(BaseModel):
    """Defines how a drug modifies a physiological parameter"""
    parameter_id: str  # e.g., "ef", "heart_rate", "gfr"
    multiplier: Optional[float] = None  # Multiplicative factor (e.g., 1.2 = 20% increase)
    absolute: Optional[float] = None  # Absolute value change
    note: str = ""

class ScaleModifications(BaseModel):
    """Modifications to parameters within a scale (e.g., physiology, pressures)"""
    scale_id: str  # e.g., "physiology", "pressures", "geometry"
    parameters: List[ParameterModification] = []

class OrganModifications(BaseModel):
    """Modifications to an organ"""
    organ_id: str  # e.g., "heart", "lungs", "kidneys"
    scales: List[ScaleModifications] = []

class DrugEffect(BaseModel):
    """Complete effect profile for a drug effect type"""
    effect_type: str  # "therapeutic", "side_effect", "overdose"
    organs: List[OrganModifications] = []
    description: str = ""
    onset_hours: Optional[float] = None
    duration_hours: Optional[float] = None

class DrugInteraction(BaseModel):
    """Drug-drug interaction information"""
    interacting_drug_id: str
    interacting_drug_name: str
    severity: str  # "mild", "moderate", "severe", "contraindicated"
    effect: str  # Description of the interaction
    clinical_note: str = ""

class DrugDosage(BaseModel):
    """Dosage information"""
    route: str  # "oral", "iv", "im", "sc", "topical", "inhaled"
    form: str  # "tablet", "capsule", "injection", "solution"
    strength: str  # e.g., "10mg", "25mg", "100mg"
    typical_dose: str  # e.g., "10-20mg once daily"
    max_daily_dose: str  # e.g., "40mg"
    frequency: str  # e.g., "once daily", "twice daily", "every 6 hours"
    special_instructions: str = ""

class DrugIndication(BaseModel):
    """Disease indication for a drug"""
    disease_id: str  # Reference to disease model
    disease_name: str
    is_primary: bool = False
    efficacy_level: str = "moderate"  # "low", "moderate", "high"
    evidence_grade: str = "B"  # A, B, C, D
    notes: str = ""

class Drug(BaseModel):
    """Complete drug model for the database"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Basic identification
    name: str  # Generic name
    brand_names: List[str] = []
    drug_class: str  # e.g., "ACE Inhibitor", "Beta Blocker", "Diuretic"
    category: str  # e.g., "cardiovascular", "respiratory", "renal"
    
    # Mechanism
    mechanism_of_action: str
    mechanism_short: str = ""  # Brief description for UI
    target_receptors: List[str] = []  # e.g., ["AT1", "beta-1", "ACE"]
    
    # Dosing
    dosages: List[DrugDosage] = []
    
    # Effects on physiological parameters (THIS IS THE KEY FEATURE)
    therapeutic_effects: List[DrugEffect] = []
    side_effects: List[DrugEffect] = []
    overdose_effects: List[DrugEffect] = []
    
    # Indications and contraindications
    indications: List[DrugIndication] = []
    contraindications: List[str] = []
    warnings: List[str] = []
    
    # Interactions
    interactions: List[DrugInteraction] = []
    
    # Pharmacokinetics
    absorption: str = ""
    distribution: str = ""
    metabolism: str = ""
    elimination: str = ""
    half_life: str = ""
    
    # Metadata
    fda_approval_year: Optional[int] = None
    pregnancy_category: str = ""  # A, B, C, D, X
    controlled_substance: bool = False
    schedule: Optional[str] = None  # I, II, III, IV, V
    
    # System fields
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DrugCreate(BaseModel):
    """Model for creating a new drug"""
    name: str
    brand_names: List[str] = []
    drug_class: str
    category: str
    mechanism_of_action: str
    mechanism_short: str = ""
    target_receptors: List[str] = []
    dosages: List[DrugDosage] = []
    therapeutic_effects: List[DrugEffect] = []
    side_effects: List[DrugEffect] = []
    overdose_effects: List[DrugEffect] = []
    indications: List[DrugIndication] = []
    contraindications: List[str] = []
    warnings: List[str] = []
    interactions: List[DrugInteraction] = []
    absorption: str = ""
    distribution: str = ""
    metabolism: str = ""
    elimination: str = ""
    half_life: str = ""
    fda_approval_year: Optional[int] = None
    pregnancy_category: str = ""
    controlled_substance: bool = False
    schedule: Optional[str] = None

class DrugSummary(BaseModel):
    """Summary model for drug list views"""
    id: str
    name: str
    brand_names: List[str]
    drug_class: str
    category: str
    mechanism_short: str
    indication_count: int
    interaction_count: int

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============== PHYSIOLOGICAL KERNEL ==============

class PhysiologicalKernel:
    """
    Mathematical kernel for human physiology simulation.
    Implements research-grade ODEs for cardiovascular, respiratory, renal, and metabolic systems.
    """
    
    @staticmethod
    def cardiovascular_ode(y, t, params):
        """
        Windkessel model for cardiovascular dynamics.
        
        Equations:
        dP/dt = (Q - P/R) / C
        
        Where:
        - P: arterial pressure
        - Q: cardiac output
        - R: total peripheral resistance
        - C: arterial compliance
        """
        P = y[0]  # Arterial pressure
        
        Q = params.get('cardiac_output', 5.0)  # L/min
        R = params.get('tpr', 1.0)  # Peripheral resistance (normalized)
        C = params.get('compliance', 1.5)  # Arterial compliance
        
        # Windkessel equation
        dPdt = (Q - P/R) / C
        
        return [dPdt]
    
    @staticmethod
    def frank_starling(edv: float, contractility: float = 1.0) -> float:
        """
        Frank-Starling mechanism: stroke volume as function of end-diastolic volume.
        
        SV = SV_max * (1 - exp(-k * EDV)) * contractility
        
        Evidence: Guyton & Hall Textbook of Medical Physiology
        """
        sv_max = 120.0  # Maximum stroke volume (mL)
        k = 0.02  # Sensitivity coefficient
        
        sv = sv_max * (1 - np.exp(-k * edv)) * contractility
        return max(0, min(sv, sv_max))
    
    @staticmethod
    def glucose_insulin_ode(y, t, params):
        """
        Minimal model of glucose-insulin dynamics (Bergman et al.).
        
        dG/dt = -p1 * (G - Gb) - X * G + Ra
        dX/dt = -p2 * X + p3 * (I - Ib)
        dI/dt = -n * I + γ * (G - h)^+ * t
        
        Evidence: Bergman RN, Am J Physiol 1981
        """
        G, X, I = y  # Glucose, insulin action, insulin
        
        Gb = params.get('glucose_basal', 90.0)  # mg/dL
        Ib = params.get('insulin_basal', 10.0)  # μU/mL
        p1 = params.get('p1', 0.028)  # Glucose effectiveness
        p2 = params.get('p2', 0.025)  # Insulin action decay
        p3 = params.get('p3', 0.000013)  # Insulin action sensitivity
        n = params.get('n', 0.23)  # Insulin clearance
        gamma = params.get('gamma', 0.004)  # Pancreatic responsivity
        h = params.get('h', 100.0)  # Glucose threshold
        Ra = params.get('glucose_input', 0.0)  # Exogenous glucose
        
        dGdt = -p1 * (G - Gb) - X * G + Ra
        dXdt = -p2 * X + p3 * (I - Ib)
        
        # Pancreatic insulin secretion (only when G > h)
        secretion = gamma * max(0, G - h) if G > h else 0
        dIdt = -n * I + secretion
        
        return [dGdt, dXdt, dIdt]
    
    @staticmethod
    def gfr_calculation(map_pressure: float, kidney_function: float = 1.0) -> float:
        """
        Glomerular Filtration Rate calculation using autoregulation model.
        
        GFR = GFR_normal * autoregulation_factor * kidney_function
        
        Autoregulation maintains GFR constant for MAP 80-180 mmHg
        
        Evidence: KDOQI Clinical Practice Guidelines
        """
        gfr_normal = 100.0  # mL/min (normal adult)
        
        # Autoregulation curve (sigmoid)
        if map_pressure < 80:
            autoregulation = map_pressure / 80.0
        elif map_pressure > 180:
            autoregulation = 1.0 + 0.1 * (map_pressure - 180) / 20
        else:
            autoregulation = 1.0
        
        gfr = gfr_normal * autoregulation * kidney_function
        return max(0, gfr)
    
    @staticmethod
    def hepatic_clearance(drug_concentration: float, liver_function: float = 1.0, 
                          extraction_ratio: float = 0.5) -> float:
        """
        First-pass hepatic metabolism using well-stirred model.
        
        Cl_H = Q_H * E
        
        Where E = fu * Cl_int / (Q_H + fu * Cl_int)
        
        Evidence: Rowland & Tozer, Clinical Pharmacokinetics
        """
        q_hepatic = 1500.0  # Hepatic blood flow (mL/min)
        fu = 0.1  # Fraction unbound (typical)
        cl_int = 1000.0 * liver_function  # Intrinsic clearance
        
        E = (fu * cl_int) / (q_hepatic + fu * cl_int)
        clearance = q_hepatic * E * extraction_ratio
        
        return clearance

    @staticmethod
    def thermoregulation(current_temp: float, metabolic_rate: float = 1.0,
                        ambient_temp: float = 25.0) -> float:
        """
        Heat balance equation for body temperature regulation.
        
        dT/dt = (M - E - R - C - K) / (m * c)
        
        Evidence: ASHRAE Fundamentals Handbook
        """
        m = 70.0  # Body mass (kg)
        c = 3.49  # Specific heat of body (kJ/kg·°C)
        
        # Metabolic heat production
        M = 80.0 * metabolic_rate  # W (resting)
        
        # Heat loss mechanisms
        E = 20.0  # Evaporative (W)
        R = 30.0  # Radiative (W)
        C = 10.0 * (current_temp - ambient_temp)  # Convective (W)
        K = 5.0  # Conductive (W)
        
        # Temperature change rate
        dTdt = (M - E - R - C - K) / (m * c * 1000)  # °C/s
        
        return dTdt

kernel = PhysiologicalKernel()

# ============== DRUG EFFECTS ==============

DRUG_DATABASE = {
    "paracetamol": {
        "name": "Paracetamol (Acetaminophen)",
        "mechanisms": [
            {"target": "cox_inhibition", "effect": -0.3, "description": "COX-2 inhibition in CNS"},
            {"target": "temperature", "effect": -0.5, "description": "Antipyretic effect via hypothalamus"},
            {"target": "pain_perception", "effect": -0.4, "description": "Analgesic effect"},
            {"target": "liver_function", "effect": -0.05, "description": "Minor hepatotoxicity at therapeutic doses"}
        ],
        "pk_params": {
            "bioavailability": 0.85,
            "half_life_hours": 2.5,
            "volume_distribution": 0.9,  # L/kg
            "protein_binding": 0.25
        },
        "max_daily_dose": 4000,  # mg
        "therapeutic_range": {"min": 10, "max": 25},  # μg/mL
        "evidence": ["FDA Label", "Goodman & Gilman's"]
    },
    "metformin": {
        "name": "Metformin",
        "mechanisms": [
            {"target": "hepatic_glucose_output", "effect": -0.3, "description": "Reduces hepatic gluconeogenesis"},
            {"target": "insulin_sensitivity", "effect": 0.25, "description": "Improves peripheral insulin sensitivity"},
            {"target": "intestinal_glucose_absorption", "effect": -0.1, "description": "Reduces glucose absorption"},
            {"target": "lactate_production", "effect": 0.1, "description": "Increases lactate (lactic acidosis risk)"}
        ],
        "pk_params": {
            "bioavailability": 0.55,
            "half_life_hours": 5.0,
            "volume_distribution": 1.12,
            "protein_binding": 0.0
        },
        "max_daily_dose": 2550,
        "therapeutic_range": {"min": 1, "max": 2},  # μg/mL
        "evidence": ["UKPDS Study", "ADA Guidelines 2024"]
    },
    "lisinopril": {
        "name": "Lisinopril",
        "mechanisms": [
            {"target": "ace_inhibition", "effect": -0.8, "description": "ACE inhibition"},
            {"target": "blood_pressure", "effect": -0.15, "description": "Reduces systemic vascular resistance"},
            {"target": "cardiac_remodeling", "effect": -0.2, "description": "Prevents cardiac hypertrophy"},
            {"target": "renal_protection", "effect": 0.1, "description": "Reduces proteinuria"},
            {"target": "potassium", "effect": 0.05, "description": "May increase serum potassium"}
        ],
        "pk_params": {
            "bioavailability": 0.25,
            "half_life_hours": 12.0,
            "volume_distribution": 0.7,
            "protein_binding": 0.0
        },
        "max_daily_dose": 80,
        "therapeutic_range": {"min": 20, "max": 70},  # ng/mL
        "evidence": ["HOPE Trial", "ACC/AHA Guidelines"]
    },
    "aspirin": {
        "name": "Aspirin (Acetylsalicylic Acid)",
        "mechanisms": [
            {"target": "cox1_inhibition", "effect": -0.95, "description": "Irreversible COX-1 inhibition"},
            {"target": "platelet_aggregation", "effect": -0.8, "description": "Antiplatelet effect"},
            {"target": "inflammation", "effect": -0.3, "description": "Anti-inflammatory (high dose)"},
            {"target": "gastric_protection", "effect": -0.2, "description": "GI bleeding risk"}
        ],
        "pk_params": {
            "bioavailability": 0.70,
            "half_life_hours": 0.25,  # Short for aspirin itself
            "volume_distribution": 0.15,
            "protein_binding": 0.80
        },
        "max_daily_dose": 4000,
        "therapeutic_range": {"min": 150, "max": 300},  # μg/mL (anti-inflammatory)
        "evidence": ["ASCEND Trial", "USPSTF Guidelines"]
    },
    "atorvastatin": {
        "name": "Atorvastatin",
        "mechanisms": [
            {"target": "hmgcoa_reductase", "effect": -0.9, "description": "HMG-CoA reductase inhibition"},
            {"target": "ldl_cholesterol", "effect": -0.50, "description": "Reduces LDL 50%"},
            {"target": "hdl_cholesterol", "effect": 0.05, "description": "Modest HDL increase"},
            {"target": "triglycerides", "effect": -0.20, "description": "Reduces triglycerides"},
            {"target": "liver_enzymes", "effect": 0.02, "description": "May elevate transaminases"}
        ],
        "pk_params": {
            "bioavailability": 0.14,
            "half_life_hours": 14.0,
            "volume_distribution": 5.6,
            "protein_binding": 0.98
        },
        "max_daily_dose": 80,
        "therapeutic_range": {"min": 5, "max": 30},  # ng/mL
        "evidence": ["CARDS Trial", "ACC/AHA Cholesterol Guidelines"]
    }
}

def calculate_drug_effects(drug_name: str, dosage: float, duration_hours: float, 
                          baseline_state: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculate multi-factorial drug effects on physiological state.
    Returns modified state and attribution breakdown.
    """
    drug = DRUG_DATABASE.get(drug_name.lower())
    if not drug:
        return {"error": f"Drug {drug_name} not found in database"}
    
    pk = drug["pk_params"]
    
    # Calculate plasma concentration using one-compartment model
    # C(t) = (F * D / Vd) * e^(-t/τ)
    bioavailability = pk["bioavailability"]
    half_life = pk["half_life_hours"]
    vd = pk["volume_distribution"]
    
    # Peak concentration estimate
    c_peak = (bioavailability * dosage) / (vd * 70)  # Assuming 70kg patient
    
    # Average concentration over duration
    elimination_constant = 0.693 / half_life
    c_avg = c_peak * (1 - np.exp(-elimination_constant * duration_hours)) / (elimination_constant * duration_hours)
    
    # Apply effects based on mechanisms
    effects = {}
    attributions = []
    modified_state = baseline_state.copy()
    
    for mechanism in drug["mechanisms"]:
        target = mechanism["target"]
        effect_magnitude = mechanism["effect"] * (c_avg / drug["therapeutic_range"]["max"])
        effect_magnitude = max(-1, min(1, effect_magnitude))  # Clamp
        
        # Map mechanisms to state variables
        state_mappings = {
            "temperature": "temperature",
            "blood_pressure": "systolic_bp",
            "insulin_sensitivity": "insulin",
            "hepatic_glucose_output": "glucose",
            "potassium": "potassium",
            "liver_enzymes": "alt",
            "liver_function": "alt"
        }
        
        if target in state_mappings:
            state_var = state_mappings[target]
            if state_var in modified_state:
                original = modified_state[state_var]
                change = original * effect_magnitude
                modified_state[state_var] = original + change
                
                attributions.append({
                    "mechanism": mechanism["description"],
                    "target": state_var,
                    "change": change,
                    "percent_contribution": abs(effect_magnitude) * 100,
                    "evidence": drug["evidence"]
                })
    
    return {
        "drug": drug["name"],
        "dosage_mg": dosage,
        "estimated_concentration": c_avg,
        "modified_state": modified_state,
        "attributions": attributions,
        "warnings": [] if c_avg < drug["therapeutic_range"]["max"] else ["Concentration exceeds therapeutic range"]
    }

# ============== API ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "The Mathematical Human API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({'email': user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        'id': user_id,
        'email': user_data.email,
        'name': user_data.name,
        'password_hash': hash_password(user_data.password),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    
    token = create_token(user_id, user_data.email)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            created_at=user['created_at']
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({'email': credentials.email}, {'_id': 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            name=user['name'],
            created_at=user['created_at']
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user['id'],
        email=current_user['email'],
        name=current_user['name'],
        created_at=current_user['created_at']
    )

# Patient Routes
@api_router.post("/patients", response_model=PatientProfile)
async def create_patient(patient_data: PatientProfileCreate, current_user: dict = Depends(get_current_user)):
    patient = PatientProfile(
        user_id=current_user['id'],
        **patient_data.model_dump()
    )
    
    await db.patients.insert_one(patient.model_dump())
    return patient

@api_router.get("/patients", response_model=List[PatientProfile])
async def get_patients(current_user: dict = Depends(get_current_user)):
    patients = await db.patients.find(
        {'user_id': current_user['id']}, 
        {'_id': 0}
    ).to_list(100)
    return patients

@api_router.get("/patients/{patient_id}", response_model=PatientProfile)
async def get_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    patient = await db.patients.find_one(
        {'id': patient_id, 'user_id': current_user['id']}, 
        {'_id': 0}
    )
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

# Simulation Routes
@api_router.post("/simulations", response_model=Simulation)
async def create_simulation(sim_data: SimulationCreate, current_user: dict = Depends(get_current_user)):
    # Get patient
    patient = await db.patients.find_one(
        {'id': sim_data.patient_id, 'user_id': current_user['id']},
        {'_id': 0}
    )
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Create baseline state
    baseline = PhysiologicalState().model_dump()
    
    simulation = Simulation(
        user_id=current_user['id'],
        patient_id=sim_data.patient_id,
        name=sim_data.name,
        description=sim_data.description,
        baseline_state=baseline,
        current_state=baseline.copy(),
        influences=sim_data.influences
    )
    
    await db.simulations.insert_one(simulation.model_dump())
    return simulation

@api_router.get("/simulations", response_model=List[Simulation])
async def get_simulations(current_user: dict = Depends(get_current_user)):
    simulations = await db.simulations.find(
        {'user_id': current_user['id']},
        {'_id': 0}
    ).to_list(100)
    return simulations

@api_router.get("/simulations/{simulation_id}", response_model=Simulation)
async def get_simulation(simulation_id: str, current_user: dict = Depends(get_current_user)):
    simulation = await db.simulations.find_one(
        {'id': simulation_id, 'user_id': current_user['id']},
        {'_id': 0}
    )
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return simulation

# Physiological Calculation Routes
@api_router.post("/calculate/cardiovascular")
async def calculate_cardiovascular(params: Dict[str, float]):
    """Calculate cardiovascular dynamics using Windkessel model."""
    initial_pressure = params.get('initial_pressure', 100.0)
    time_points = np.linspace(0, 10, 100)
    
    solution = odeint(kernel.cardiovascular_ode, [initial_pressure], time_points, args=(params,))
    
    return {
        "model": "Windkessel 2-Element",
        "equation": "dP/dt = (Q - P/R) / C",
        "parameters": params,
        "time_points": time_points.tolist(),
        "pressure_curve": solution[:, 0].tolist(),
        "evidence": ["Westerhof N, Arterial System Dynamics, 2005"]
    }

@api_router.post("/calculate/glucose-insulin")
async def calculate_glucose_insulin(params: Dict[str, float]):
    """Calculate glucose-insulin dynamics using Bergman minimal model."""
    G0 = params.get('glucose_initial', 90.0)
    X0 = params.get('insulin_action_initial', 0.0)
    I0 = params.get('insulin_initial', 10.0)
    
    time_points = np.linspace(0, 180, 180)  # 3 hours in minutes
    
    solution = odeint(kernel.glucose_insulin_ode, [G0, X0, I0], time_points, args=(params,))
    
    return {
        "model": "Bergman Minimal Model",
        "equations": [
            "dG/dt = -p1*(G-Gb) - X*G + Ra",
            "dX/dt = -p2*X + p3*(I-Ib)",
            "dI/dt = -n*I + γ*max(0,G-h)"
        ],
        "parameters": params,
        "time_minutes": time_points.tolist(),
        "glucose": solution[:, 0].tolist(),
        "insulin_action": solution[:, 1].tolist(),
        "insulin": solution[:, 2].tolist(),
        "evidence": ["Bergman RN, Am J Physiol 1981", "MINMOD Software Documentation"]
    }

@api_router.post("/calculate/gfr")
async def calculate_gfr(params: Dict[str, float]):
    """Calculate GFR with autoregulation."""
    map_pressure = params.get('mean_arterial_pressure', 90.0)
    kidney_function = params.get('kidney_function', 1.0)
    
    gfr = kernel.gfr_calculation(map_pressure, kidney_function)
    
    # Calculate creatinine from GFR (simplified Cockcroft-Gault inverse)
    age = params.get('age', 40)
    weight = params.get('weight', 70)
    creatinine = (140 - age) * weight / (72 * gfr) if gfr > 0 else 10.0
    
    return {
        "model": "GFR Autoregulation Model",
        "equation": "GFR = GFR_normal * autoregulation(MAP) * kidney_function",
        "parameters": params,
        "gfr_ml_min": round(gfr, 2),
        "estimated_creatinine_mg_dl": round(creatinine, 2),
        "ckd_stage": get_ckd_stage(gfr),
        "evidence": ["KDOQI Guidelines 2012", "Cockcroft-Gault Formula"]
    }

def get_ckd_stage(gfr: float) -> str:
    if gfr >= 90:
        return "G1 - Normal or high"
    elif gfr >= 60:
        return "G2 - Mildly decreased"
    elif gfr >= 45:
        return "G3a - Mildly to moderately decreased"
    elif gfr >= 30:
        return "G3b - Moderately to severely decreased"
    elif gfr >= 15:
        return "G4 - Severely decreased"
    else:
        return "G5 - Kidney failure"

@api_router.post("/calculate/frank-starling")
async def calculate_frank_starling(params: Dict[str, float]):
    """Calculate stroke volume using Frank-Starling mechanism."""
    edv = params.get('end_diastolic_volume', 120.0)
    contractility = params.get('contractility', 1.0)
    
    sv = kernel.frank_starling(edv, contractility)
    
    # Generate Frank-Starling curve
    edv_range = np.linspace(50, 200, 50)
    sv_curve = [kernel.frank_starling(e, contractility) for e in edv_range]
    
    return {
        "model": "Frank-Starling Mechanism",
        "equation": "SV = SV_max * (1 - exp(-k * EDV)) * contractility",
        "parameters": params,
        "stroke_volume_ml": round(sv, 2),
        "cardiac_output_l_min": round(sv * params.get('heart_rate', 70) / 1000, 2),
        "curve": {
            "edv_ml": edv_range.tolist(),
            "sv_ml": sv_curve
        },
        "evidence": ["Guyton & Hall, Textbook of Medical Physiology, Ch. 9"]
    }

# Drug Routes
@api_router.get("/drugs")
async def get_available_drugs():
    """Get list of available drugs in the database."""
    return {
        "drugs": [
            {
                "id": key,
                "name": drug["name"],
                "mechanisms_count": len(drug["mechanisms"]),
                "max_daily_dose_mg": drug["max_daily_dose"]
            }
            for key, drug in DRUG_DATABASE.items()
        ]
    }

@api_router.get("/drugs/{drug_id}")
async def get_drug_info(drug_id: str):
    """Get detailed drug information."""
    drug = DRUG_DATABASE.get(drug_id.lower())
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")
    return drug

class DrugSimulationRequest(BaseModel):
    drug_name: str
    dosage: float
    frequency: str = "once"
    duration_hours: float = 24
    route: str = "oral"
    baseline: Optional[Dict[str, float]] = None

@api_router.post("/drugs/simulate")
async def simulate_drug_effect(request: DrugSimulationRequest):
    """Simulate drug effects on physiological state."""
    baseline = request.baseline if request.baseline else PhysiologicalState().model_dump()
    
    result = calculate_drug_effects(
        request.drug_name,
        request.dosage,
        request.duration_hours,
        baseline
    )
    
    return result

# AI Chat Routes
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """Chat with AI assistant for physiological explanations."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(status_code=500, detail="LLM key not configured")
        
        system_message = """You are an expert assistant for The Mathematical Human platform - a digital physiology simulation system. Your role is to:

1. Explain physiological equations and models in clear, accessible language
2. Provide insights about drug mechanisms and interactions
3. Help interpret simulation results
4. Suggest relevant simulations or parameter adjustments
5. Link explanations to scientific evidence when possible

You have deep knowledge of:
- Cardiovascular physiology (Frank-Starling, Windkessel models)
- Glucose-insulin dynamics (Bergman minimal model)
- Renal physiology (GFR, autoregulation)
- Pharmacokinetics and pharmacodynamics
- Multi-system interactions

Always be precise but accessible. When explaining equations, break them down step by step. 
Mention relevant evidence sources when appropriate."""

        chat = LlmChat(
            api_key=llm_key,
            session_id=f"user-{current_user['id']}-{datetime.now().timestamp()}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        # Build context-aware message
        message_text = request.message
        if request.context:
            context_str = f"\n\nCurrent simulation context:\n{request.context}"
            message_text += context_str
        
        user_message = UserMessage(text=message_text)
        response = await chat.send_message(user_message)
        
        # Generate suggestions based on response
        suggestions = []
        if "glucose" in request.message.lower() or "insulin" in request.message.lower():
            suggestions.append("Simulate glucose response to meal")
            suggestions.append("Compare insulin sensitivity scenarios")
        if "blood pressure" in request.message.lower() or "cardiovascular" in request.message.lower():
            suggestions.append("Run Windkessel simulation")
            suggestions.append("Analyze Frank-Starling response")
        if "drug" in request.message.lower() or "medication" in request.message.lower():
            suggestions.append("Simulate drug interaction")
            suggestions.append("View drug mechanisms")
        
        return ChatResponse(response=response, suggestions=suggestions[:3])
        
    except ImportError:
        # Fallback response if LLM not available
        return ChatResponse(
            response="I can help explain physiological models and simulations. The AI assistant requires the Emergent LLM key to be configured. For now, please explore the simulation tools directly.",
            suggestions=["View cardiovascular models", "Explore drug database", "Create patient profile"]
        )
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return ChatResponse(
            response=f"I encountered an issue processing your request. Please try again or explore the simulation tools directly.",
            suggestions=["View available drugs", "Run cardiovascular simulation"]
        )

# Equations Reference
@api_router.get("/equations")
async def get_equations_reference():
    """Get all mathematical equations used in the system."""
    return {
        "cardiovascular": {
            "windkessel": {
                "name": "Windkessel Model (2-Element)",
                "equation": "dP/dt = (Q - P/R) / C",
                "variables": {
                    "P": "Arterial pressure (mmHg)",
                    "Q": "Cardiac output (L/min)",
                    "R": "Total peripheral resistance",
                    "C": "Arterial compliance"
                },
                "evidence": ["Westerhof N et al., 2005"]
            },
            "frank_starling": {
                "name": "Frank-Starling Mechanism",
                "equation": "SV = SV_max × (1 - e^(-k × EDV)) × contractility",
                "variables": {
                    "SV": "Stroke volume (mL)",
                    "SV_max": "Maximum stroke volume (120 mL)",
                    "EDV": "End-diastolic volume (mL)",
                    "k": "Sensitivity coefficient (0.02)",
                    "contractility": "Myocardial contractility factor"
                },
                "evidence": ["Guyton & Hall, Textbook of Medical Physiology"]
            },
            "cardiac_output": {
                "name": "Cardiac Output",
                "equation": "CO = SV × HR",
                "variables": {
                    "CO": "Cardiac output (L/min)",
                    "SV": "Stroke volume (mL)",
                    "HR": "Heart rate (bpm)"
                },
                "evidence": ["Basic cardiovascular physiology"]
            },
            "mean_arterial_pressure": {
                "name": "Mean Arterial Pressure",
                "equation": "MAP = DBP + (1/3) × (SBP - DBP)",
                "variables": {
                    "MAP": "Mean arterial pressure (mmHg)",
                    "SBP": "Systolic blood pressure (mmHg)",
                    "DBP": "Diastolic blood pressure (mmHg)"
                },
                "evidence": ["Standard clinical calculation"]
            }
        },
        "glucose_insulin": {
            "bergman_model": {
                "name": "Bergman Minimal Model",
                "equations": [
                    "dG/dt = -p₁(G - Gᵦ) - X·G + Rₐ",
                    "dX/dt = -p₂X + p₃(I - Iᵦ)",
                    "dI/dt = -nI + γ·max(0, G - h)"
                ],
                "variables": {
                    "G": "Plasma glucose (mg/dL)",
                    "X": "Insulin action (remote insulin effect)",
                    "I": "Plasma insulin (μU/mL)",
                    "Gᵦ": "Basal glucose",
                    "Iᵦ": "Basal insulin",
                    "p₁": "Glucose effectiveness (0.028)",
                    "p₂": "Insulin action decay (0.025)",
                    "p₃": "Insulin sensitivity (0.000013)",
                    "n": "Insulin clearance (0.23)",
                    "γ": "Pancreatic responsivity (0.004)",
                    "h": "Glucose threshold (100 mg/dL)",
                    "Rₐ": "Rate of glucose appearance"
                },
                "evidence": ["Bergman RN, Am J Physiol 1981", "MINMOD"]
            }
        },
        "renal": {
            "gfr_autoregulation": {
                "name": "GFR with Autoregulation",
                "equation": "GFR = GFR_normal × autoregulation(MAP) × kidney_function",
                "variables": {
                    "GFR": "Glomerular filtration rate (mL/min)",
                    "GFR_normal": "Normal GFR (100 mL/min)",
                    "MAP": "Mean arterial pressure (mmHg)",
                    "autoregulation": "Sigmoid function maintaining GFR 80-180 mmHg"
                },
                "evidence": ["KDOQI Guidelines", "Brenner & Rector's The Kidney"]
            },
            "creatinine_clearance": {
                "name": "Cockcroft-Gault Equation",
                "equation": "CrCl = [(140 - age) × weight] / (72 × Cr) × 0.85 (if female)",
                "variables": {
                    "CrCl": "Creatinine clearance (mL/min)",
                    "age": "Age (years)",
                    "weight": "Weight (kg)",
                    "Cr": "Serum creatinine (mg/dL)"
                },
                "evidence": ["Cockcroft DW, Gault MH, 1976"]
            }
        },
        "pharmacokinetics": {
            "one_compartment": {
                "name": "One-Compartment Model",
                "equation": "C(t) = (F × D / Vd) × e^(-k_el × t)",
                "variables": {
                    "C(t)": "Plasma concentration at time t",
                    "F": "Bioavailability",
                    "D": "Dose",
                    "Vd": "Volume of distribution",
                    "k_el": "Elimination rate constant (0.693/t½)"
                },
                "evidence": ["Rowland & Tozer, Clinical Pharmacokinetics"]
            },
            "hepatic_clearance": {
                "name": "Well-Stirred Hepatic Clearance Model",
                "equation": "Cl_H = Q_H × E, where E = (f_u × Cl_int) / (Q_H + f_u × Cl_int)",
                "variables": {
                    "Cl_H": "Hepatic clearance",
                    "Q_H": "Hepatic blood flow (~1500 mL/min)",
                    "E": "Extraction ratio",
                    "f_u": "Fraction unbound",
                    "Cl_int": "Intrinsic clearance"
                },
                "evidence": ["Rowland M, 1973"]
            }
        },
        "thermoregulation": {
            "heat_balance": {
                "name": "Heat Balance Equation",
                "equation": "dT/dt = (M - E - R - C - K) / (m × c)",
                "variables": {
                    "T": "Body temperature (°C)",
                    "M": "Metabolic heat production (W)",
                    "E": "Evaporative heat loss (W)",
                    "R": "Radiative heat loss (W)",
                    "C": "Convective heat loss (W)",
                    "K": "Conductive heat loss (W)",
                    "m": "Body mass (kg)",
                    "c": "Specific heat of body (3.49 kJ/kg·°C)"
                },
                "evidence": ["ASHRAE Handbook"]
            }
        }
    }

# Transcription endpoint for Medical Scribe
# Clinical Analysis endpoint
@api_router.post("/analyze-clinical")
async def analyze_clinical_text(request: Dict[str, Any]):
    """
    Analyze clinical text to extract findings and generate differential diagnosis.
    Uses AI to enhance the analysis with clinical reasoning.
    """
    try:
        clinical_text = request.get("text", "")
        include_reasoning = request.get("include_reasoning", True)
        
        if not clinical_text:
            raise HTTPException(status_code=400, detail="Clinical text is required")
        
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        
        if llm_key and include_reasoning:
            try:
                from emergentintegrations.llm.chat import LlmChat, UserMessage
                
                chat = LlmChat(
                    api_key=llm_key,
                    session_id=f"clinical-{datetime.now().timestamp()}",
                    system_message="""You are an expert clinical reasoning assistant. Analyze the provided clinical information and:

1. Extract key findings (symptoms, signs, lab values)
2. Identify abnormal values and their clinical significance
3. Generate a differential diagnosis with reasoning
4. Suggest additional questions to ask
5. Recommend diagnostic tests

Format your response as JSON with these keys:
- findings: array of {name, value, unit, status: "normal"|"abnormal", significance}
- differential: array of {diagnosis, probability, icd10, reasoning}
- questions: array of suggested follow-up questions
- tests: array of recommended diagnostic tests
- clinical_impression: brief summary
"""
                ).with_model("openai", "gpt-4o")
                
                user_message = UserMessage(text=f"Analyze this clinical information:\n\n{clinical_text}")
                response = await chat.send_message(user_message)
                
                # Try to parse as JSON, otherwise return as text
                try:
                    import json
                    analysis = json.loads(response)
                    return {"analysis": analysis, "raw_response": None}
                except json.JSONDecodeError:
                    return {"analysis": None, "raw_response": response}
                    
            except ImportError:
                pass
        
        # Fallback: Basic extraction without AI
        return {
            "analysis": {
                "findings": [],
                "differential": [],
                "questions": [
                    "When did symptoms begin?",
                    "Any associated symptoms?",
                    "Past medical history?",
                    "Current medications?",
                    "Allergies?"
                ],
                "tests": ["CBC", "BMP", "Urinalysis"],
                "clinical_impression": "Further analysis requires AI integration"
            },
            "raw_response": None
        }
        
    except Exception as e:
        logger.error(f"Clinical analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# ============== DRUG DATABASE API (MongoDB-based) ==============

@api_router.get("/drugs-db")
async def get_drugs_from_db(
    category: Optional[str] = None,
    drug_class: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    Get drugs from MongoDB database with filtering.
    This is the new endpoint that uses MongoDB for comprehensive drug data.
    """
    query = {}
    
    if category:
        query["category"] = category
    if drug_class:
        query["drug_class"] = {"$regex": drug_class, "$options": "i"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"brand_names": {"$regex": search, "$options": "i"}},
            {"mechanism_short": {"$regex": search, "$options": "i"}}
        ]
    
    drugs = await db.drugs.find(query, {"_id": 0}).skip(offset).limit(limit).to_list(limit)
    total = await db.drugs.count_documents(query)
    
    # Return summary format for list
    summaries = []
    for drug in drugs:
        summaries.append({
            "id": drug.get("id"),
            "name": drug.get("name"),
            "brand_names": drug.get("brand_names", []),
            "drug_class": drug.get("drug_class"),
            "category": drug.get("category"),
            "mechanism_short": drug.get("mechanism_short", ""),
            "indication_count": len(drug.get("indications", [])),
            "interaction_count": len(drug.get("interactions", []))
        })
    
    return {
        "drugs": summaries,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@api_router.get("/drugs-db/{drug_id}")
async def get_drug_detail(drug_id: str):
    """Get complete drug details from MongoDB."""
    drug = await db.drugs.find_one({"id": drug_id}, {"_id": 0})
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")
    return drug

@api_router.post("/drugs-db")
async def create_drug(drug: DrugCreate):
    """Create a new drug in the database."""
    drug_dict = drug.model_dump()
    drug_dict["id"] = str(uuid.uuid4())
    drug_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    drug_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.drugs.insert_one(drug_dict)
    return {"id": drug_dict["id"], "message": "Drug created successfully"}

@api_router.put("/drugs-db/{drug_id}")
async def update_drug(drug_id: str, drug: DrugCreate):
    """Update an existing drug."""
    existing = await db.drugs.find_one({"id": drug_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Drug not found")
    
    drug_dict = drug.model_dump()
    drug_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.drugs.update_one({"id": drug_id}, {"$set": drug_dict})
    return {"message": "Drug updated successfully"}

@api_router.delete("/drugs-db/{drug_id}")
async def delete_drug(drug_id: str):
    """Delete a drug from the database."""
    result = await db.drugs.delete_one({"id": drug_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Drug not found")
    return {"message": "Drug deleted successfully"}

@api_router.get("/drugs-db/categories")
async def get_drug_categories():
    """Get all unique drug categories."""
    categories = await db.drugs.distinct("category")
    classes = await db.drugs.distinct("drug_class")
    return {
        "categories": categories,
        "drug_classes": classes
    }

@api_router.get("/drugs-db/by-disease/{disease_id}")
async def get_drugs_for_disease(disease_id: str):
    """Get all drugs indicated for a specific disease."""
    drugs = await db.drugs.find(
        {"indications.disease_id": disease_id},
        {"_id": 0}
    ).to_list(100)
    return {"drugs": drugs, "count": len(drugs)}

@api_router.post("/drugs-db/seed")
async def seed_drug_database():
    """
    Seed the drug database with initial cardiac-focused drugs.
    This creates comprehensive drug entries that match the organ model parameters.
    """
    # Check if already seeded
    count = await db.drugs.count_documents({})
    if count > 0:
        return {"message": f"Database already has {count} drugs. Use force=true to reseed."}
    
    # Comprehensive cardiac drug data
    cardiac_drugs = [
        {
            "id": "lisinopril",
            "name": "Lisinopril",
            "brand_names": ["Prinivil", "Zestril"],
            "drug_class": "ACE Inhibitor",
            "category": "cardiovascular",
            "mechanism_of_action": "Inhibits angiotensin-converting enzyme (ACE), preventing conversion of angiotensin I to angiotensin II. This leads to vasodilation, reduced aldosterone secretion, and decreased sympathetic activity.",
            "mechanism_short": "ACE inhibitor → ↓ angiotensin II → vasodilation",
            "target_receptors": ["ACE"],
            "dosages": [
                {
                    "route": "oral",
                    "form": "tablet",
                    "strength": "2.5mg, 5mg, 10mg, 20mg, 40mg",
                    "typical_dose": "10-40mg once daily",
                    "max_daily_dose": "80mg",
                    "frequency": "once daily",
                    "special_instructions": "Can be taken with or without food"
                }
            ],
            "therapeutic_effects": [
                {
                    "effect_type": "therapeutic",
                    "description": "Reduces afterload and preload, improving cardiac output",
                    "onset_hours": 1,
                    "duration_hours": 24,
                    "organs": [
                        {
                            "organ_id": "heart",
                            "scales": [
                                {
                                    "scale_id": "pressures",
                                    "parameters": [
                                        {"parameter_id": "aortic_systolic", "multiplier": 0.85, "note": "↓15% systolic BP"},
                                        {"parameter_id": "aortic_diastolic", "multiplier": 0.88, "note": "↓12% diastolic BP"},
                                        {"parameter_id": "lv_edp", "multiplier": 0.80, "note": "↓20% preload"}
                                    ]
                                },
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "cardiac_output", "multiplier": 1.15, "note": "↑15% CO from afterload reduction"},
                                        {"parameter_id": "svr", "multiplier": 0.75, "note": "↓25% systemic vascular resistance"}
                                    ]
                                }
                            ]
                        },
                        {
                            "organ_id": "kidneys",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "gfr", "multiplier": 0.95, "note": "Initial ↓ GFR, then stabilizes (nephroprotective long-term)"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "side_effects": [
                {
                    "effect_type": "side_effect",
                    "description": "Common side effects include dry cough (10-15%), hyperkalemia",
                    "organs": [
                        {
                            "organ_id": "kidneys",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "potassium", "multiplier": 1.10, "note": "↑10% serum K+ (hyperkalemia risk)"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "overdose_effects": [
                {
                    "effect_type": "overdose",
                    "description": "Severe hypotension, renal failure",
                    "organs": [
                        {
                            "organ_id": "heart",
                            "scales": [
                                {
                                    "scale_id": "pressures",
                                    "parameters": [
                                        {"parameter_id": "aortic_systolic", "multiplier": 0.50, "note": "Severe hypotension"},
                                        {"parameter_id": "aortic_diastolic", "multiplier": 0.55, "note": "Severe hypotension"}
                                    ]
                                }
                            ]
                        },
                        {
                            "organ_id": "kidneys",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "gfr", "multiplier": 0.30, "note": "Acute kidney injury"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "indications": [
                {"disease_id": "heart_failure", "disease_name": "Heart Failure (HFrEF)", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
                {"disease_id": "hypertension", "disease_name": "Essential Hypertension", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
                {"disease_id": "diabetic_nephropathy", "disease_name": "Diabetic Nephropathy", "is_primary": False, "efficacy_level": "high", "evidence_grade": "A"}
            ],
            "contraindications": ["Pregnancy", "History of angioedema", "Bilateral renal artery stenosis"],
            "warnings": ["Monitor renal function and potassium", "Risk of angioedema (higher in Black patients)"],
            "interactions": [
                {"interacting_drug_id": "spironolactone", "interacting_drug_name": "Spironolactone", "severity": "moderate", "effect": "Additive hyperkalemia risk", "clinical_note": "Monitor K+ closely"},
                {"interacting_drug_id": "nsaids", "interacting_drug_name": "NSAIDs", "severity": "moderate", "effect": "Reduced antihypertensive effect, increased renal risk", "clinical_note": "Avoid combination if possible"}
            ],
            "absorption": "25% bioavailability, not affected by food",
            "distribution": "Low protein binding, crosses blood-brain barrier minimally",
            "metabolism": "Not metabolized (prodrug form doesn't require conversion)",
            "elimination": "Renal excretion (unchanged)",
            "half_life": "12 hours",
            "fda_approval_year": 1987,
            "pregnancy_category": "D",
            "controlled_substance": False
        },
        {
            "id": "metoprolol",
            "name": "Metoprolol",
            "brand_names": ["Lopressor", "Toprol-XL"],
            "drug_class": "Beta Blocker (β1-selective)",
            "category": "cardiovascular",
            "mechanism_of_action": "Selectively blocks β1-adrenergic receptors in the heart, reducing heart rate, contractility, and myocardial oxygen demand. At higher doses, may also block β2 receptors.",
            "mechanism_short": "β1 blocker → ↓ HR, ↓ contractility, ↓ O₂ demand",
            "target_receptors": ["β1-adrenergic"],
            "dosages": [
                {
                    "route": "oral",
                    "form": "tablet (immediate-release)",
                    "strength": "25mg, 50mg, 100mg",
                    "typical_dose": "25-100mg twice daily",
                    "max_daily_dose": "400mg",
                    "frequency": "twice daily",
                    "special_instructions": "Take with food"
                },
                {
                    "route": "oral",
                    "form": "tablet (extended-release)",
                    "strength": "25mg, 50mg, 100mg, 200mg",
                    "typical_dose": "25-200mg once daily",
                    "max_daily_dose": "400mg",
                    "frequency": "once daily",
                    "special_instructions": "Do not crush or chew"
                }
            ],
            "therapeutic_effects": [
                {
                    "effect_type": "therapeutic",
                    "description": "Reduces heart rate and contractility, improving myocardial oxygen supply-demand balance",
                    "onset_hours": 1,
                    "duration_hours": 12,
                    "organs": [
                        {
                            "organ_id": "heart",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "heart_rate", "multiplier": 0.75, "note": "↓25% heart rate"},
                                        {"parameter_id": "cardiac_output", "multiplier": 0.90, "note": "↓10% CO initially"},
                                        {"parameter_id": "ef", "multiplier": 1.10, "note": "↑10% EF in HFrEF (long-term)"},
                                        {"parameter_id": "myocardial_o2", "multiplier": 0.70, "note": "↓30% myocardial O₂ demand"}
                                    ]
                                },
                                {
                                    "scale_id": "pressures",
                                    "parameters": [
                                        {"parameter_id": "aortic_systolic", "multiplier": 0.90, "note": "↓10% systolic BP"},
                                        {"parameter_id": "aortic_diastolic", "multiplier": 0.92, "note": "↓8% diastolic BP"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "side_effects": [
                {
                    "effect_type": "side_effect",
                    "description": "Fatigue, bradycardia, cold extremities, bronchospasm (rare at β1-selective doses)",
                    "organs": [
                        {
                            "organ_id": "heart",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "heart_rate", "multiplier": 0.65, "note": "Excessive bradycardia possible"}
                                    ]
                                }
                            ]
                        },
                        {
                            "organ_id": "lungs",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "fev1", "multiplier": 0.95, "note": "Mild bronchospasm risk"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "indications": [
                {"disease_id": "heart_failure", "disease_name": "Heart Failure (HFrEF)", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
                {"disease_id": "hypertension", "disease_name": "Essential Hypertension", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
                {"disease_id": "atrial_fibrillation", "disease_name": "Atrial Fibrillation", "is_primary": False, "efficacy_level": "moderate", "evidence_grade": "B"},
                {"disease_id": "angina", "disease_name": "Stable Angina", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"}
            ],
            "contraindications": ["Severe bradycardia", "Heart block (2nd/3rd degree)", "Cardiogenic shock", "Decompensated heart failure"],
            "warnings": ["Do not stop abruptly (rebound tachycardia)", "Mask hypoglycemia symptoms in diabetics"],
            "interactions": [
                {"interacting_drug_id": "verapamil", "interacting_drug_name": "Verapamil", "severity": "severe", "effect": "Additive AV nodal depression, severe bradycardia", "clinical_note": "Avoid combination"},
                {"interacting_drug_id": "clonidine", "interacting_drug_name": "Clonidine", "severity": "moderate", "effect": "Rebound hypertension if clonidine stopped", "clinical_note": "Taper clonidine first"}
            ],
            "half_life": "3-7 hours (immediate-release), 3-7 hours effective (extended-release)",
            "fda_approval_year": 1978,
            "pregnancy_category": "C",
            "controlled_substance": False
        },
        {
            "id": "furosemide",
            "name": "Furosemide",
            "brand_names": ["Lasix"],
            "drug_class": "Loop Diuretic",
            "category": "cardiovascular",
            "mechanism_of_action": "Inhibits Na-K-2Cl cotransporter (NKCC2) in the thick ascending limb of the loop of Henle, causing profound natriuresis and diuresis. Also increases venous capacitance.",
            "mechanism_short": "Loop diuretic → ↓ preload, ↓ fluid overload",
            "target_receptors": ["NKCC2"],
            "dosages": [
                {
                    "route": "oral",
                    "form": "tablet",
                    "strength": "20mg, 40mg, 80mg",
                    "typical_dose": "20-80mg once or twice daily",
                    "max_daily_dose": "600mg",
                    "frequency": "once or twice daily",
                    "special_instructions": "Take in morning to avoid nocturia"
                },
                {
                    "route": "iv",
                    "form": "injection",
                    "strength": "10mg/mL",
                    "typical_dose": "20-80mg IV",
                    "max_daily_dose": "600mg",
                    "frequency": "as needed",
                    "special_instructions": "Infuse over 1-2 minutes"
                }
            ],
            "therapeutic_effects": [
                {
                    "effect_type": "therapeutic",
                    "description": "Rapid diuresis reducing preload and pulmonary congestion",
                    "onset_hours": 0.5,
                    "duration_hours": 6,
                    "organs": [
                        {
                            "organ_id": "heart",
                            "scales": [
                                {
                                    "scale_id": "pressures",
                                    "parameters": [
                                        {"parameter_id": "pcwp", "multiplier": 0.60, "note": "↓40% pulmonary wedge pressure"},
                                        {"parameter_id": "lv_edp", "multiplier": 0.70, "note": "↓30% preload"},
                                        {"parameter_id": "ra_pressure", "multiplier": 0.65, "note": "↓35% RA pressure"}
                                    ]
                                },
                                {
                                    "scale_id": "geometry",
                                    "parameters": [
                                        {"parameter_id": "lv_edv", "multiplier": 0.85, "note": "↓15% LV volume"}
                                    ]
                                }
                            ]
                        },
                        {
                            "organ_id": "kidneys",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "urine_output", "multiplier": 3.0, "note": "↑200% urine output"},
                                        {"parameter_id": "sodium_excretion", "multiplier": 2.5, "note": "↑150% sodium excretion"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "side_effects": [
                {
                    "effect_type": "side_effect",
                    "description": "Electrolyte depletion (hypokalemia, hyponatremia), ototoxicity at high doses",
                    "organs": [
                        {
                            "organ_id": "kidneys",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "potassium", "multiplier": 0.80, "note": "↓20% serum K+ (hypokalemia)"},
                                        {"parameter_id": "magnesium", "multiplier": 0.85, "note": "↓15% serum Mg (hypomagnesemia)"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "indications": [
                {"disease_id": "heart_failure", "disease_name": "Heart Failure (Acute/Chronic)", "is_primary": True, "efficacy_level": "high", "evidence_grade": "B"},
                {"disease_id": "edema", "disease_name": "Peripheral Edema", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
                {"disease_id": "pulmonary_edema", "disease_name": "Pulmonary Edema", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"}
            ],
            "contraindications": ["Anuria", "Severe hypokalemia", "Sulfonamide allergy (cross-reactivity)"],
            "warnings": ["Monitor electrolytes regularly", "Ototoxicity with rapid IV administration"],
            "interactions": [
                {"interacting_drug_id": "digoxin", "interacting_drug_name": "Digoxin", "severity": "moderate", "effect": "Hypokalemia increases digoxin toxicity risk", "clinical_note": "Monitor K+ and digoxin levels"},
                {"interacting_drug_id": "aminoglycosides", "interacting_drug_name": "Aminoglycosides", "severity": "moderate", "effect": "Additive ototoxicity", "clinical_note": "Avoid combination if possible"}
            ],
            "half_life": "1-2 hours",
            "fda_approval_year": 1966,
            "pregnancy_category": "C",
            "controlled_substance": False
        },
        {
            "id": "digoxin",
            "name": "Digoxin",
            "brand_names": ["Lanoxin"],
            "drug_class": "Cardiac Glycoside",
            "category": "cardiovascular",
            "mechanism_of_action": "Inhibits Na+/K+-ATPase in cardiac myocytes, leading to increased intracellular calcium and enhanced contractility. Also increases vagal tone, slowing AV conduction.",
            "mechanism_short": "Na+/K+-ATPase inhibitor → ↑ contractility, ↓ AV conduction",
            "target_receptors": ["Na+/K+-ATPase"],
            "dosages": [
                {
                    "route": "oral",
                    "form": "tablet",
                    "strength": "0.125mg, 0.25mg",
                    "typical_dose": "0.125-0.25mg once daily",
                    "max_daily_dose": "0.5mg",
                    "frequency": "once daily",
                    "special_instructions": "Narrow therapeutic index - monitor levels"
                }
            ],
            "therapeutic_effects": [
                {
                    "effect_type": "therapeutic",
                    "description": "Positive inotrope and rate control in atrial fibrillation",
                    "onset_hours": 2,
                    "duration_hours": 36,
                    "organs": [
                        {
                            "organ_id": "heart",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "cardiac_output", "multiplier": 1.20, "note": "↑20% cardiac output"},
                                        {"parameter_id": "ef", "multiplier": 1.10, "note": "↑10% ejection fraction"},
                                        {"parameter_id": "heart_rate", "multiplier": 0.85, "note": "↓15% ventricular rate (in AFib)"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "side_effects": [
                {
                    "effect_type": "side_effect",
                    "description": "GI disturbances, visual changes (yellow-green halos), arrhythmias",
                    "organs": [
                        {
                            "organ_id": "heart",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "heart_rate", "multiplier": 0.50, "note": "Bradycardia at toxic levels"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "overdose_effects": [
                {
                    "effect_type": "overdose",
                    "description": "Life-threatening arrhythmias, severe bradycardia, cardiac arrest",
                    "organs": [
                        {
                            "organ_id": "heart",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "heart_rate", "multiplier": 0.30, "note": "Severe bradycardia/asystole"},
                                        {"parameter_id": "cardiac_output", "multiplier": 0.40, "note": "Severe pump failure"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "indications": [
                {"disease_id": "heart_failure", "disease_name": "Heart Failure (HFrEF)", "is_primary": False, "efficacy_level": "moderate", "evidence_grade": "B"},
                {"disease_id": "atrial_fibrillation", "disease_name": "Atrial Fibrillation (rate control)", "is_primary": True, "efficacy_level": "moderate", "evidence_grade": "B"}
            ],
            "contraindications": ["Ventricular fibrillation", "Hypertrophic cardiomyopathy", "WPW syndrome"],
            "warnings": ["Narrow therapeutic index (0.8-2.0 ng/mL)", "Toxicity increased by hypokalemia"],
            "interactions": [
                {"interacting_drug_id": "amiodarone", "interacting_drug_name": "Amiodarone", "severity": "severe", "effect": "↑50% digoxin levels", "clinical_note": "Reduce digoxin dose by 50%"},
                {"interacting_drug_id": "verapamil", "interacting_drug_name": "Verapamil", "severity": "moderate", "effect": "↑50% digoxin levels, additive AV block", "clinical_note": "Reduce digoxin dose"}
            ],
            "half_life": "36-48 hours",
            "fda_approval_year": 1954,
            "pregnancy_category": "C",
            "controlled_substance": False
        },
        {
            "id": "spironolactone",
            "name": "Spironolactone",
            "brand_names": ["Aldactone"],
            "drug_class": "Mineralocorticoid Receptor Antagonist (MRA)",
            "category": "cardiovascular",
            "mechanism_of_action": "Competitively blocks aldosterone at the mineralocorticoid receptor, reducing sodium retention and potassium excretion. Also blocks cardiac remodeling effects of aldosterone.",
            "mechanism_short": "Aldosterone antagonist → ↓ Na retention, ↓ cardiac fibrosis",
            "target_receptors": ["Mineralocorticoid receptor"],
            "dosages": [
                {
                    "route": "oral",
                    "form": "tablet",
                    "strength": "25mg, 50mg, 100mg",
                    "typical_dose": "12.5-50mg once daily",
                    "max_daily_dose": "100mg (HF), 400mg (other)",
                    "frequency": "once daily",
                    "special_instructions": "Take with food to improve absorption"
                }
            ],
            "therapeutic_effects": [
                {
                    "effect_type": "therapeutic",
                    "description": "Reduces mortality in HFrEF by blocking aldosterone-mediated cardiac fibrosis and mild diuresis",
                    "onset_hours": 24,
                    "duration_hours": 48,
                    "organs": [
                        {
                            "organ_id": "heart",
                            "scales": [
                                {
                                    "scale_id": "pressures",
                                    "parameters": [
                                        {"parameter_id": "lv_edp", "multiplier": 0.90, "note": "↓10% preload"},
                                        {"parameter_id": "pcwp", "multiplier": 0.90, "note": "↓10% wedge pressure"}
                                    ]
                                },
                                {
                                    "scale_id": "cellular",
                                    "parameters": [
                                        {"parameter_id": "fibrosis_rate", "multiplier": 0.50, "note": "↓50% cardiac fibrosis progression"}
                                    ]
                                }
                            ]
                        },
                        {
                            "organ_id": "kidneys",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "potassium", "multiplier": 1.15, "note": "↑15% serum K+ (potassium-sparing)"},
                                        {"parameter_id": "sodium_excretion", "multiplier": 1.20, "note": "↑20% sodium excretion"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "side_effects": [
                {
                    "effect_type": "side_effect",
                    "description": "Hyperkalemia, gynecomastia (anti-androgen effect), menstrual irregularities",
                    "organs": [
                        {
                            "organ_id": "kidneys",
                            "scales": [
                                {
                                    "scale_id": "physiology",
                                    "parameters": [
                                        {"parameter_id": "potassium", "multiplier": 1.25, "note": "Significant hyperkalemia risk"}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "indications": [
                {"disease_id": "heart_failure", "disease_name": "Heart Failure (HFrEF)", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"},
                {"disease_id": "hypertension", "disease_name": "Resistant Hypertension", "is_primary": False, "efficacy_level": "high", "evidence_grade": "A"},
                {"disease_id": "cirrhosis_ascites", "disease_name": "Cirrhosis with Ascites", "is_primary": True, "efficacy_level": "high", "evidence_grade": "A"}
            ],
            "contraindications": ["Hyperkalemia (K+ >5.5)", "Severe renal impairment (CrCl <30)", "Addison's disease"],
            "warnings": ["Monitor potassium closely, especially with ACEi/ARB", "Avoid potassium supplements"],
            "interactions": [
                {"interacting_drug_id": "lisinopril", "interacting_drug_name": "Lisinopril", "severity": "moderate", "effect": "Additive hyperkalemia risk", "clinical_note": "Monitor K+ weekly initially"},
                {"interacting_drug_id": "potassium_supplements", "interacting_drug_name": "Potassium Supplements", "severity": "severe", "effect": "Severe hyperkalemia", "clinical_note": "Avoid combination"}
            ],
            "half_life": "1.4 hours (active metabolites: 10-35 hours)",
            "fda_approval_year": 1960,
            "pregnancy_category": "C",
            "controlled_substance": False
        }
    ]
    
    # Add timestamps
    for drug in cardiac_drugs:
        drug["created_at"] = datetime.now(timezone.utc).isoformat()
        drug["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Insert into database
    await db.drugs.insert_many(cardiac_drugs)
    
    return {
        "message": f"Successfully seeded {len(cardiac_drugs)} cardiac drugs",
        "drugs": [d["name"] for d in cardiac_drugs]
    }

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
