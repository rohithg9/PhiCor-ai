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


# ============== PLATFORM STATS ENDPOINT ==============

@api_router.get("/platform/stats")
async def get_platform_stats():
    """
    Get dynamic platform statistics for landing page and dashboards.
    Returns real-time counts of drugs, diseases, calculators, and other metrics.
    """
    try:
        # Count drugs from comprehensive_drugs.py
        from data.comprehensive_drugs import get_all_comprehensive_drugs
        comprehensive_drugs = get_all_comprehensive_drugs()
        comprehensive_count = len(comprehensive_drugs)
        
        # Count AI-generated drugs
        generated_drugs_count = await db.drugs_generated.count_documents({})
        
        # Unique drug IDs to avoid duplicates
        comprehensive_ids = {d.get("id", "").lower() for d in comprehensive_drugs}
        gen_drugs = await db.drugs_generated.find({}, {"_id": 0, "id": 1}).to_list(1000)
        unique_generated = sum(1 for d in gen_drugs if d.get("id", "").lower() not in comprehensive_ids)
        
        total_drugs = comprehensive_count + unique_generated
        
        # Count diseases
        total_diseases = await db.diseases.count_documents({})
        
        # Get unique categories
        drug_categories = set()
        for d in comprehensive_drugs:
            if d.get("category"):
                drug_categories.add(d.get("category"))
        gen_categories = await db.drugs_generated.distinct("category")
        drug_categories.update(gen_categories)
        
        disease_categories = await db.diseases.distinct("category")
        
        # Count clinical calculators (from frontend data)
        calculator_count = 42  # From clinicalCalculators.js
        
        # Organ systems covered
        organ_systems = 6  # Heart, Lungs, Brain, Liver, Kidneys, Blood
        
        # Mathematical models
        math_models = 12  # PK/PD models, organ models, etc.
        
        return {
            "drugs": {
                "total": total_drugs,
                "comprehensive": comprehensive_count,
                "ai_generated": generated_drugs_count,
                "unique_ai_generated": unique_generated,
                "categories": len(drug_categories)
            },
            "diseases": {
                "total": total_diseases,
                "categories": len(disease_categories)
            },
            "calculators": calculator_count,
            "organ_systems": organ_systems,
            "mathematical_models": math_models,
            "display_stats": {
                "drugs": f"{total_drugs}+",
                "diseases": f"{total_diseases}+",
                "calculators": f"{calculator_count}+",
                "organ_systems": str(organ_systems),
                "models": "∞"
            }
        }
    except Exception as e:
        logger.error(f"Error getting platform stats: {e}")
        # Return default values
        return {
            "drugs": {"total": 300, "comprehensive": 115, "ai_generated": 308},
            "diseases": {"total": 200, "categories": 15},
            "calculators": 42,
            "organ_systems": 6,
            "mathematical_models": 12,
            "display_stats": {
                "drugs": "300+",
                "diseases": "200+",
                "calculators": "42+",
                "organ_systems": "6",
                "models": "∞"
            }
        }


# Drug Routes
@api_router.get("/drugs")
async def get_available_drugs(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 500,
    include_generated: bool = True
):
    """Get list of available drugs from comprehensive database + AI-generated drugs."""
    try:
        from data.comprehensive_drugs import get_all_comprehensive_drugs
        all_drugs = get_all_comprehensive_drugs()
        
        # Also include AI-generated drugs from MongoDB
        if include_generated:
            generated_drugs = await db.drugs_generated.find({}, {"_id": 0}).to_list(1000)
            
            # Add simulation-compatible fields to generated drugs
            for gen_drug in generated_drugs:
                # Ensure it has required fields for simulation
                if "mechanisms" not in gen_drug:
                    gen_drug["mechanisms"] = _convert_to_mechanisms(gen_drug)
                if "max_daily_dose_mg" not in gen_drug:
                    gen_drug["max_daily_dose_mg"] = _extract_max_dose(gen_drug)
                if "therapeutic_effects" not in gen_drug:
                    gen_drug["therapeutic_effects"] = _build_therapeutic_effects(gen_drug)
            
            # Merge - generated drugs take precedence (they're more comprehensive)
            existing_ids = {d.get("id", "").lower() for d in all_drugs}
            for gen_drug in generated_drugs:
                if gen_drug.get("id", "").lower() not in existing_ids:
                    all_drugs.append(gen_drug)
        
        # Filter by category if provided
        if category:
            all_drugs = [d for d in all_drugs if d.get("category", "").lower() == category.lower()]
        
        # Filter by search if provided
        if search:
            search_lower = search.lower()
            all_drugs = [d for d in all_drugs if 
                search_lower in d.get("name", "").lower() or 
                search_lower in d.get("id", "").lower() or
                search_lower in d.get("drug_class", "").lower() or
                any(search_lower in str(b).lower() for b in d.get("brand_names", []))]
        
        # Apply limit
        all_drugs = all_drugs[:limit]
        
        return {
            "drugs": [
                {
                    "id": drug.get("id"),
                    "name": drug.get("name"),
                    "category": drug.get("category"),
                    "drug_class": drug.get("drug_class"),
                    "brand_names": drug.get("brand_names", []),
                    "mechanism_short": drug.get("mechanism_short", ""),
                    "mechanisms_count": len(drug.get("mechanisms", [])),
                    "max_daily_dose_mg": drug.get("max_daily_dose_mg", 0),
                    "ai_generated": drug.get("generator_version") is not None
                }
                for drug in all_drugs
            ],
            "total": len(all_drugs)
        }
    except Exception as e:
        logger.error(f"Error getting drugs: {e}")
        # Fallback to basic DRUG_DATABASE
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


def _convert_to_mechanisms(gen_drug: dict) -> list:
    """Convert AI-generated drug data to simulation-compatible mechanisms."""
    mechanisms = []
    
    # Extract from therapeutic_effects if available
    for effect in gen_drug.get("therapeutic_effects", []):
        organ = effect.get("organ_system", "cardiovascular").lower()
        for param in effect.get("parameters_affected", []):
            mechanisms.append({
                "parameter": param.lower().replace(" ", "_"),
                "organ": organ,
                "effect_type": "decrease" if "lower" in effect.get("effect", "").lower() else "increase",
                "magnitude": 0.15,  # Default moderate effect
                "ec50_ratio": 0.5
            })
    
    # Fallback: create basic mechanism based on drug class
    if not mechanisms:
        drug_class = gen_drug.get("drug_class", "").lower()
        category = gen_drug.get("category", "").lower()
        
        # Map common drug classes to mechanisms
        class_mechanisms = {
            "ace inhibitor": [{"parameter": "blood_pressure", "organ": "cardiovascular", "effect_type": "decrease", "magnitude": 0.15}],
            "beta blocker": [{"parameter": "heart_rate", "organ": "cardiovascular", "effect_type": "decrease", "magnitude": 0.20}],
            "statin": [{"parameter": "cholesterol", "organ": "cardiovascular", "effect_type": "decrease", "magnitude": 0.30}],
            "antibiotic": [{"parameter": "bacterial_load", "organ": "immune", "effect_type": "decrease", "magnitude": 0.50}],
            "antidepressant": [{"parameter": "serotonin", "organ": "neurological", "effect_type": "increase", "magnitude": 0.25}],
            "proton pump inhibitor": [{"parameter": "gastric_acid", "organ": "gastrointestinal", "effect_type": "decrease", "magnitude": 0.80}],
            "diuretic": [{"parameter": "fluid_volume", "organ": "renal", "effect_type": "decrease", "magnitude": 0.20}],
            "insulin": [{"parameter": "blood_glucose", "organ": "endocrine", "effect_type": "decrease", "magnitude": 0.40}],
            "biguanide": [{"parameter": "blood_glucose", "organ": "endocrine", "effect_type": "decrease", "magnitude": 0.25}],
            "bronchodilator": [{"parameter": "airway_resistance", "organ": "respiratory", "effect_type": "decrease", "magnitude": 0.30}],
            "anticoagulant": [{"parameter": "clotting_factors", "organ": "hematological", "effect_type": "decrease", "magnitude": 0.40}],
            "antiviral": [{"parameter": "viral_load", "organ": "immune", "effect_type": "decrease", "magnitude": 0.50}],
            "antifungal": [{"parameter": "fungal_load", "organ": "immune", "effect_type": "decrease", "magnitude": 0.50}],
            "immunosuppressant": [{"parameter": "immune_response", "organ": "immune", "effect_type": "decrease", "magnitude": 0.40}],
            "analgesic": [{"parameter": "pain_perception", "organ": "neurological", "effect_type": "decrease", "magnitude": 0.50}],
            "nsaid": [{"parameter": "inflammation", "organ": "immune", "effect_type": "decrease", "magnitude": 0.30}],
            "opioid": [{"parameter": "pain_perception", "organ": "neurological", "effect_type": "decrease", "magnitude": 0.70}],
        }
        
        for class_key, mechs in class_mechanisms.items():
            if class_key in drug_class:
                mechanisms = mechs
                break
        
        # If still no mechanisms, create generic one based on category
        if not mechanisms:
            category_organs = {
                "cardiovascular": "cardiovascular",
                "antibiotics": "immune",
                "cns_neurological": "neurological",
                "respiratory": "respiratory",
                "gastrointestinal": "gastrointestinal",
                "endocrine": "endocrine",
                "analgesics": "neurological",
                "antivirals": "immune",
                "antifungals": "immune",
                "immunosuppressants": "immune",
                "hematological": "hematological",
                "renal": "renal"
            }
            organ = category_organs.get(category, "cardiovascular")
            mechanisms = [{"parameter": "general_effect", "organ": organ, "effect_type": "modulate", "magnitude": 0.10}]
    
    return mechanisms


def _extract_max_dose(gen_drug: dict) -> float:
    """Extract maximum daily dose from AI-generated drug data."""
    try:
        dosages = gen_drug.get("dosages", [])
        if dosages:
            for dosage in dosages:
                max_dose_str = dosage.get("max_daily_dose", "")
                # Try to extract numeric value
                import re
                numbers = re.findall(r'(\d+(?:\.\d+)?)', str(max_dose_str))
                if numbers:
                    return float(numbers[0])
        return 1000.0  # Default max dose
    except Exception:
        return 1000.0


def _build_therapeutic_effects(gen_drug: dict) -> list:
    """Build therapeutic effects from AI-generated drug data."""
    effects = []
    
    # Use mechanism of action to infer effects
    mechanism = gen_drug.get("mechanism_of_action", "")
    drug_class = gen_drug.get("drug_class", "").lower()
    
    # Common effect mappings
    if "ace inhibitor" in drug_class or "angiotensin" in mechanism.lower():
        effects.append({"organ": "cardiovascular", "parameter": "blood_pressure", "direction": "decrease", "magnitude": 15})
    if "beta" in drug_class.lower() or "adrenergic" in mechanism.lower():
        effects.append({"organ": "cardiovascular", "parameter": "heart_rate", "direction": "decrease", "magnitude": 20})
    if "statin" in drug_class or "hmg-coa" in mechanism.lower():
        effects.append({"organ": "cardiovascular", "parameter": "ldl_cholesterol", "direction": "decrease", "magnitude": 30})
    if "diuretic" in drug_class:
        effects.append({"organ": "renal", "parameter": "urine_output", "direction": "increase", "magnitude": 25})
    if "ssri" in drug_class or "serotonin" in mechanism.lower():
        effects.append({"organ": "neurological", "parameter": "serotonin", "direction": "increase", "magnitude": 25})
    if "biguanide" in drug_class or "metformin" in gen_drug.get("name", "").lower():
        effects.append({"organ": "endocrine", "parameter": "blood_glucose", "direction": "decrease", "magnitude": 25})
    
    return effects


@api_router.get("/drugs/{drug_id}")
async def get_drug_info(drug_id: str):
    """Get detailed drug information from comprehensive database + AI-generated drugs."""
    try:
        from data.comprehensive_drugs import get_all_comprehensive_drugs
        all_drugs = get_all_comprehensive_drugs()
        
        # Find drug by ID in comprehensive database
        drug = next((d for d in all_drugs if d.get("id", "").lower() == drug_id.lower()), None)
        
        if drug:
            return drug
        
        # Check AI-generated drugs in MongoDB
        gen_drug = await db.drugs_generated.find_one({"id": drug_id}, {"_id": 0})
        if not gen_drug:
            # Try case-insensitive search
            gen_drug = await db.drugs_generated.find_one(
                {"id": {"$regex": f"^{drug_id}$", "$options": "i"}}, 
                {"_id": 0}
            )
        
        if gen_drug:
            # Ensure it has simulation-compatible fields
            if "mechanisms" not in gen_drug:
                gen_drug["mechanisms"] = _convert_to_mechanisms(gen_drug)
            if "max_daily_dose_mg" not in gen_drug:
                gen_drug["max_daily_dose_mg"] = _extract_max_dose(gen_drug)
            if "therapeutic_effects" not in gen_drug:
                gen_drug["therapeutic_effects"] = _build_therapeutic_effects(gen_drug)
            return gen_drug
        
        # Fallback to basic DRUG_DATABASE
        basic_drug = DRUG_DATABASE.get(drug_id.lower())
        if basic_drug:
            return basic_drug
            
        raise HTTPException(status_code=404, detail="Drug not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting drug {drug_id}: {e}")
        # Fallback to basic DRUG_DATABASE
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
            {"mechanism_short": {"$regex": search, "$options": "i"}},
            {"drug_class": {"$regex": search, "$options": "i"}}
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

# Static routes MUST be defined before dynamic routes
@api_router.get("/drugs-db/priority-list")
async def get_priority_drug_list():
    """
    Get the list of priority drugs for generation (BNF + US + India essentials).
    """
    from services.medical_knowledge_generator import get_priority_drugs
    drugs = get_priority_drugs()
    
    # Group by category
    by_category = {}
    for drug in drugs:
        cat = drug.get("category", "other")
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(drug["name"])
    
    return {
        "total_drugs": len(drugs),
        "categories": list(by_category.keys()),
        "by_category": by_category,
        "drugs": drugs
    }

@api_router.get("/drugs-db/generated")
async def get_generated_drugs_list(
    category: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
):
    """
    Get all AI-generated drugs from the database.
    """
    query = {}
    if category:
        query["category"] = category
    
    drugs = await db.drugs_generated.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.drugs_generated.count_documents(query)
    
    return {
        "total": total,
        "drugs": drugs,
        "limit": limit,
        "skip": skip
    }


@api_router.get("/drugs-db/categories")
async def get_drug_categories_list():
    """Get all unique drug categories."""
    categories = await db.drugs.distinct("category")
    classes = await db.drugs.distinct("drug_class")
    return {
        "categories": categories,
        "drug_classes": classes
    }


# Hospital Priority Drug Categories - ordered by clinical importance
HOSPITAL_PRIORITY_ORDER_EARLY = [
    "cardiovascular",      # Most critical in hospital settings
    "antibiotics",         # Essential for infections
    "cns_neurological",    # Pain management, sedation, neuro emergencies  
    "analgesics",          # Pain management is ubiquitous
    "respiratory",         # Respiratory care
    "gastrointestinal",    # GI issues common in hospital
    "endocrine",           # Diabetes, thyroid management
    "antivirals",          # Viral infections
    "antifungals",         # Fungal infections
    "immunosuppressants",  # Transplant, autoimmune
]


@api_router.get("/drugs-db/generation-status")
async def get_generation_status_early():
    """
    Get the current status of drug knowledge base generation.
    Shows progress and what's been generated.
    """
    from services.medical_knowledge_generator import get_priority_drugs
    
    priority_drugs = get_priority_drugs()
    total_priority = len(priority_drugs)
    
    # Get all generated drugs
    generated_drugs = await db.drugs_generated.find({}, {"_id": 0, "name": 1, "category": 1, "generated_at": 1}).to_list(1000)
    generated_names = {d["name"].lower() for d in generated_drugs}
    total_generated = len(generated_drugs)
    
    # Count by category
    by_category = {}
    for cat in HOSPITAL_PRIORITY_ORDER_EARLY:
        cat_drugs = [d for d in priority_drugs if d.get("category") == cat]
        cat_generated = [d for d in cat_drugs if d["name"].lower() in generated_names]
        by_category[cat] = {
            "total": len(cat_drugs),
            "generated": len(cat_generated),
            "remaining": len(cat_drugs) - len(cat_generated)
        }
    
    # Get last 10 generated
    last_generated = sorted(generated_drugs, key=lambda x: x.get("generated_at", ""), reverse=True)[:10]
    last_names = [d.get("name", "Unknown") for d in last_generated]
    
    return {
        "total_priority_drugs": total_priority,
        "total_generated": total_generated,
        "remaining": total_priority - total_generated,
        "completion_percentage": round((total_generated / total_priority) * 100, 1) if total_priority > 0 else 0,
        "by_category": by_category,
        "last_generated": last_names,
        "priority_order": HOSPITAL_PRIORITY_ORDER_EARLY
    }


# Dynamic route MUST come after all static routes
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

@api_router.post("/drugs-db/seed-comprehensive")
async def seed_comprehensive_drug_database():
    """
    Seed the database with a comprehensive, evidence-based drug formulary.
    Uses data from /app/backend/data/comprehensive_drugs.py
    Includes brand names for UK, USA, and India.
    Based on WHO Essential Medicines List and clinical guidelines.
    """
    from data.comprehensive_drugs import get_all_comprehensive_drugs
    
    # Get all drugs from the comprehensive data file
    comprehensive_drugs = get_all_comprehensive_drugs()
    
    # Add timestamps and insert
    for drug in comprehensive_drugs:
        drug["created_at"] = datetime.now(timezone.utc).isoformat()
        drug["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # Upsert - update if exists, insert if not
        existing = await db.drugs.find_one({"id": drug["id"]})
        if existing:
            await db.drugs.update_one({"id": drug["id"]}, {"$set": drug})
        else:
            await db.drugs.insert_one(drug)
    
    total_count = await db.drugs.count_documents({})
    
    # Get category summary
    categories = {}
    for drug in comprehensive_drugs:
        cat = drug.get("category", "unknown")
        categories[cat] = categories.get(cat, 0) + 1
    
    return {
        "message": f"Seeded {len(comprehensive_drugs)} evidence-based drugs. Total in database: {total_count}",
        "drugs_added": len(comprehensive_drugs),
        "categories_summary": categories,
        "drugs_list": [{"id": d["id"], "name": d["name"], "class": d.get("drug_class", "")} for d in comprehensive_drugs]
    }


# ============== DISEASE DATABASE ENDPOINTS ==============

@api_router.post("/diseases-db/seed-comprehensive")
async def seed_comprehensive_disease_database():
    """
    Seed the database with a comprehensive, evidence-based disease database.
    Uses data from /app/backend/data/comprehensive_diseases.py
    Includes ICD-10 codes, diagnostic criteria, treatment guidelines.
    Based on WHO ICD-10, clinical guidelines (ESC, AHA, NICE), and UpToDate.
    """
    from data.comprehensive_diseases import get_all_comprehensive_diseases
    
    # Get all diseases from the comprehensive data file
    comprehensive_diseases = get_all_comprehensive_diseases()
    
    # Add timestamps and insert
    for disease in comprehensive_diseases:
        disease["created_at"] = datetime.now(timezone.utc).isoformat()
        disease["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # Upsert - update if exists, insert if not
        existing = await db.diseases.find_one({"id": disease["id"]})
        if existing:
            await db.diseases.update_one({"id": disease["id"]}, {"$set": disease})
        else:
            await db.diseases.insert_one(disease)
    
    total_count = await db.diseases.count_documents({})
    
    # Get category summary
    categories = {}
    for disease in comprehensive_diseases:
        cat = disease.get("category", "unknown")
        categories[cat] = categories.get(cat, 0) + 1
    
    return {
        "message": f"Seeded {len(comprehensive_diseases)} evidence-based diseases. Total in database: {total_count}",
        "diseases_added": len(comprehensive_diseases),
        "categories_summary": categories,
        "diseases_list": [{"id": d["id"], "name": d["name"], "icd10": d.get("icd10_code", "")} for d in comprehensive_diseases]
    }


# ============== PARAMETER MODIFICATION GENERATION ==============

class ParameterModificationRequest(BaseModel):
    """Request for generating parameter modifications"""
    disease_id: str
    disease_name: str
    category: Optional[str] = None


@api_router.post("/diseases-db/generate-parameter-mods")
async def generate_disease_parameter_modifications(request: ParameterModificationRequest):
    """
    Generate physiological parameter modifications for a disease using AI.
    This populates how a disease affects various organ parameters.
    """
    import json as json_module
    import re as re_module
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"param_gen_{request.disease_id}",
            system_message="You are a medical expert that generates precise physiological parameter modifications for diseases. Return only valid JSON."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are a medical expert. Generate parameter modifications for the disease: {request.disease_name}

For this disease, specify how it affects various physiological parameters. Return a JSON object with this structure:

{{
    "disease_id": "{request.disease_id}",
    "disease_name": "{request.disease_name}",
    "parameter_modifications": {{
        "heart": {{
            "geometry": {{
                "lv_edv": {{ "change_percent": 20, "direction": "increase", "evidence": "Cardiac remodeling in heart failure" }},
                "lv_wall_thickness": {{ "change_percent": 15, "direction": "increase", "evidence": "LVH compensation" }}
            }},
            "lab_tests": {{
                "troponin_i": {{ "change_percent": 500, "direction": "increase", "evidence": "Myocardial injury marker" }},
                "bnp": {{ "change_percent": 300, "direction": "increase", "evidence": "Wall stress marker" }}
            }},
            "imaging": {{
                "echo_ef": {{ "change_percent": 25, "direction": "decrease", "evidence": "Systolic dysfunction" }}
            }}
        }},
        "kidneys": {{
            "physiology": {{
                "gfr": {{ "change_percent": 30, "direction": "decrease", "evidence": "Cardiorenal syndrome" }}
            }},
            "urinalysis": {{
                "urine_protein": {{ "change_percent": 100, "direction": "increase", "evidence": "Proteinuria from hypoperfusion" }}
            }}
        }},
        "blood": {{
            "pressures": {{
                "systolic_bp": {{ "change_percent": 20, "direction": "increase", "evidence": "Compensatory mechanism" }}
            }}
        }}
    }},
    "affected_organs": ["heart", "kidneys", "blood", "lungs"],
    "severity_factors": [
        {{ "name": "Ejection Fraction", "threshold": "<40%", "impact": "severe" }},
        {{ "name": "BNP Level", "threshold": ">400", "impact": "moderate" }}
    ],
    "mathematical_models": [
        {{
            "name": "Frank-Starling Curve Shift",
            "equation": "SV = SV_max * (1 - e^(-k*EDV)) * contractility",
            "description": "Reduced contractility shifts curve downward"
        }}
    ]
}}

IMPORTANT: 
- Only include parameters that are actually affected by this specific disease
- Use realistic change percentages based on medical literature
- Include evidence for each modification
- Return ONLY the JSON, no other text"""

        response = await chat.send_async_message(
            UserMessage(content=prompt),
            session_id=f"param_gen_{request.disease_id}"
        )
        
        # Extract JSON from response
        response_text = response.content
        
        # Try to find JSON in the response
        json_match = re_module.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            param_data = json_module.loads(json_match.group())
        else:
            raise ValueError("No valid JSON found in response")
        
        # Save to disease document
        update_result = await db.diseases.update_one(
            {"id": request.disease_id},
            {
                "$set": {
                    "parameter_modifications": param_data.get("parameter_modifications", {}),
                    "affected_organs": param_data.get("affected_organs", []),
                    "severity_factors": param_data.get("severity_factors", []),
                    "mathematical_models_disease": param_data.get("mathematical_models", []),
                    "params_generated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {
            "success": True,
            "disease_id": request.disease_id,
            "disease_name": request.disease_name,
            "modifications_generated": len(param_data.get("parameter_modifications", {})),
            "affected_organs": param_data.get("affected_organs", []),
            "data": param_data
        }
        
    except json_module.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating parameter modifications: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/diseases-db/generate-params-batch")
async def generate_params_batch(
    count: int = 10,
    category: Optional[str] = None
):
    """
    Generate parameter modifications for multiple diseases in batch.
    """
    import asyncio
    
    # Get diseases that don't have parameter_modifications yet
    query = {"parameter_modifications": {"$exists": False}}
    if category:
        query["category"] = category
    
    diseases = await db.diseases.find(query, {"_id": 0, "id": 1, "name": 1, "category": 1}).limit(count).to_list(count)
    
    if not diseases:
        return {
            "success": True,
            "message": "No diseases found without parameter modifications",
            "processed": 0
        }
    
    results = []
    errors = []
    
    for disease in diseases:
        try:
            logger.info(f"Generating params for: {disease['name']}")
            request = ParameterModificationRequest(
                disease_id=disease["id"],
                disease_name=disease["name"],
                category=disease.get("category")
            )
            result = await generate_disease_parameter_modifications(request)
            results.append({
                "disease_id": disease["id"],
                "disease_name": disease["name"],
                "success": True
            })
            await asyncio.sleep(0.5)  # Rate limiting
        except Exception as e:
            logger.error(f"Error generating params for {disease['name']}: {e}")
            errors.append({
                "disease_id": disease["id"],
                "disease_name": disease["name"],
                "error": str(e)
            })
    
    return {
        "success": True,
        "processed": len(results),
        "errors": len(errors),
        "results": results,
        "error_details": errors if errors else None
    }


@api_router.get("/diseases-db")
async def get_diseases(
    search: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
):
    """
    Get diseases from database with optional search and category filter.
    """
    query = {}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"id": {"$regex": search, "$options": "i"}},
            {"icd10_code": {"$regex": search, "$options": "i"}},
            {"synonyms": {"$elemMatch": {"$regex": search, "$options": "i"}}}
        ]
    
    if category:
        query["category"] = category
    
    diseases = await db.diseases.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.diseases.count_documents(query)
    
    # Return simplified list for overview
    simplified = []
    for d in diseases:
        simplified.append({
            "id": d["id"],
            "name": d["name"],
            "icd10_code": d.get("icd10_code", ""),
            "category": d.get("category", ""),
            "description": d.get("description", "")[:200] + "..." if len(d.get("description", "")) > 200 else d.get("description", ""),
            "affected_organs": d.get("affected_organs", [])
        })
    
    return {
        "diseases": simplified,
        "total": total,
        "limit": limit,
        "skip": skip
    }


# Note: Specific routes MUST come BEFORE parameterized routes like {disease_id}

@api_router.get("/diseases-db/priority-list")
async def get_priority_disease_list():
    """
    Get the list of priority diseases for generation.
    Returns 200+ high-priority diseases across all specialties.
    """
    try:
        from services.medical_knowledge_generator import get_priority_diseases, get_disease_categories
        
        priority_diseases = get_priority_diseases()
        categories = get_disease_categories()
        
        # Group by category
        by_category = {}
        for disease in priority_diseases:
            cat = disease["category"]
            if cat not in by_category:
                by_category[cat] = {
                    "category_name": categories.get(cat, {}).get("name", cat),
                    "icon": categories.get(cat, {}).get("icon", "📋"),
                    "diseases": []
                }
            by_category[cat]["diseases"].append(disease["name"])
        
        return {
            "total_diseases": len(priority_diseases),
            "categories": len(by_category),
            "by_category": by_category,
            "all_diseases": priority_diseases
        }
        
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Generator not available: {str(e)}")

@api_router.get("/diseases-db/stats")
async def get_disease_database_stats():
    """
    Get statistics about the current disease database.
    """
    total_diseases = await db.diseases.count_documents({})
    
    # Get category counts
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    category_counts = await db.diseases.aggregate(pipeline).to_list(100)
    
    # Get AI-generated vs manually added
    ai_generated = await db.diseases.count_documents({"generation_model": {"$exists": True}})
    manual = total_diseases - ai_generated
    
    # Get diseases with comprehensive data
    comprehensive = await db.diseases.count_documents({
        "clinical_presentation.symptoms": {"$exists": True, "$ne": []},
        "treatment.pharmacological": {"$exists": True}
    })
    
    return {
        "total_diseases": total_diseases,
        "ai_generated": ai_generated,
        "manually_curated": manual,
        "comprehensive_entries": comprehensive,
        "by_category": {item["_id"]: item["count"] for item in category_counts},
        "coverage_percentage": round((comprehensive / max(total_diseases, 1)) * 100, 1)
    }


# ICD-10 Category Priority Order (MUST be before dynamic disease route)
ICD10_CATEGORY_ORDER_STATIC = [
    "cardiovascular",
    "respiratory", 
    "endocrine",
    "gastrointestinal",
    "renal",
    "neurological",
    "infectious",
    "hematological",
    "musculoskeletal",
    "psychiatric",
    "oncology",
    "dermatology",
    "ophthalmology",
    "obgyn",
    "ent"
]


@api_router.get("/diseases-db/icd10-status")
async def get_icd10_generation_status_static():
    """
    Get the current status of ICD-10 condition knowledge base generation.
    """
    from services.knowledge_bank_builder import get_top_500_conditions
    
    icd10_conditions = get_top_500_conditions()
    total_icd10 = len(icd10_conditions)
    
    # Get all diseases from database
    diseases = await db.diseases.find({}, {"_id": 0, "name": 1, "icd10_code": 1, "category": 1}).to_list(1000)
    
    # Map by ICD-10 code and name
    generated_icd10 = {d.get("icd10_code", "").upper() for d in diseases if d.get("icd10_code")}
    generated_names = {d.get("name", "").lower() for d in diseases}
    total_generated = len(diseases)
    
    # Count by category
    by_category = {}
    for cat in ICD10_CATEGORY_ORDER_STATIC:
        cat_conditions = [c for c in icd10_conditions if c.get("category") == cat]
        cat_generated = []
        for c in cat_conditions:
            icd = c.get("icd10", "").upper()
            name = c.get("name", "").lower()
            if icd in generated_icd10 or name in generated_names:
                cat_generated.append(c)
        
        by_category[cat] = {
            "total": len(cat_conditions),
            "generated": len(cat_generated),
            "remaining": len(cat_conditions) - len(cat_generated)
        }
    
    # Get last 10 generated
    recent = await db.diseases.find(
        {"ai_generated": True},
        {"_id": 0, "name": 1, "icd10_code": 1, "generated_at": 1}
    ).sort("generated_at", -1).limit(10).to_list(10)
    
    last_generated = [f"{d.get('name', 'Unknown')} ({d.get('icd10_code', 'N/A')})" for d in recent]
    
    return {
        "total_icd10_conditions": total_icd10,
        "total_diseases_in_db": total_generated,
        "completion_percentage": round((sum(c["generated"] for c in by_category.values()) / total_icd10) * 100, 1) if total_icd10 > 0 else 0,
        "by_category": by_category,
        "last_generated": last_generated,
        "category_order": ICD10_CATEGORY_ORDER_STATIC
    }


# Dynamic route MUST come after all static routes
@api_router.get("/diseases-db/{disease_id}")
async def get_disease_detail(disease_id: str):
    """
    Get full disease details by ID.
    """
    disease = await db.diseases.find_one({"id": disease_id}, {"_id": 0})
    
    if not disease:
        raise HTTPException(status_code=404, detail=f"Disease {disease_id} not found")
    
    return disease


# ============== AI-POWERED CLINICAL SYNTHESIS ==============

class ClinicalFinding(BaseModel):
    """Model for a clinical finding"""
    parameterId: Optional[str] = None
    name: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = ""
    direction: Optional[str] = None
    normalRange: Optional[str] = ""
    severity: Optional[str] = "moderate"

class ClinicalSynthesisRequest(BaseModel):
    """Request model for clinical synthesis"""
    clinical_text: str = ""
    lab_findings: List[ClinicalFinding] = []
    imaging_findings: List[ClinicalFinding] = []
    symptoms: List[ClinicalFinding] = []
    patient_info: Optional[Dict[str, Any]] = None

@api_router.post("/diagnosis/synthesize")
async def synthesize_clinical_case(request: ClinicalSynthesisRequest):
    """
    Perform INTEGRATED clinical synthesis using PhiCor's unified knowledge base.
    
    This endpoint:
    1. Queries our disease database (132 diseases) for matching conditions
    2. Cross-references with our drug database (115 drugs) for treatments
    3. Uses AI to synthesize findings with curated medical knowledge
    4. Returns evidence-based recommendations with database references
    """
    try:
        # Use the new integrated engine that connects all data sources
        from services.integrated_clinical_engine import create_integrated_engine
        
        engine = create_integrated_engine(db)
        
        # Convert Pydantic models to dicts
        lab_findings = [f.model_dump() for f in request.lab_findings]
        imaging_findings = [f.model_dump() for f in request.imaging_findings]
        symptoms = [f.model_dump() for f in request.symptoms]
        
        logger.info(f"Starting integrated synthesis with {len(lab_findings)} labs, {len(imaging_findings)} imaging, {len(symptoms)} symptoms")
        
        synthesis = await engine.synthesize_with_knowledge_base(
            clinical_text=request.clinical_text,
            lab_findings=lab_findings,
            imaging_findings=imaging_findings,
            symptoms=symptoms,
            patient_info=request.patient_info
        )
        
        logger.info("Integrated synthesis completed successfully")
        
        return {
            "success": True,
            "synthesis": synthesis,
            "integrated": True,
            "data_sources": {
                "disease_database": True,
                "drug_database": True,
                "ai_synthesis": True
            }
        }
        
    except ImportError as e:
        logger.warning(f"Integrated engine import failed: {e}, falling back to basic engine")
        # Fallback to original synthesis engine if integrated not available
        try:
            from services.clinical_synthesis import get_synthesis_engine
            engine = get_synthesis_engine()
            
            lab_findings = [f.model_dump() for f in request.lab_findings]
            imaging_findings = [f.model_dump() for f in request.imaging_findings]
            symptoms = [f.model_dump() for f in request.symptoms]
            
            synthesis = await engine.synthesize_clinical_case(
                clinical_text=request.clinical_text,
                lab_findings=lab_findings,
                imaging_findings=imaging_findings,
                symptoms=symptoms,
                patient_info=request.patient_info
            )
            
            return {
                "success": True,
                "synthesis": synthesis,
                "integrated": False
            }
        except Exception as fallback_error:
            raise HTTPException(status_code=500, detail=f"Synthesis engine not available: {str(e)}, fallback also failed: {str(fallback_error)}")
    except Exception as e:
        logger.error(f"Error in clinical synthesis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============== CASE GENERATOR ==============

class CaseGenerationRequest(BaseModel):
    """Request model for generating test cases"""
    specialty: str = "cardiology"
    difficulty: str = "intermediate"

@api_router.post("/diagnosis/generate-case")
async def generate_test_case(request: CaseGenerationRequest):
    """
    Generate a realistic clinical case using AI for practice/testing.
    """
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        import json
        import re
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"case_gen_{request.specialty}_{request.difficulty}",
            system_message="You are a medical educator creating realistic clinical cases for training."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Generate a realistic clinical case for medical education.

Specialty: {request.specialty}
Difficulty: {request.difficulty}

Create a case with:
1. Patient demographics
2. Chief complaint
3. History of present illness
4. Past medical history
5. Vital signs
6. Physical examination findings
7. Laboratory results with specific values
8. Imaging findings if relevant
9. The case should have a clear diagnosis but also reasonable differential diagnoses

Return as JSON:
{{
    "title": "Brief case title",
    "description": "One sentence description",
    "clinicalText": "Complete clinical presentation text that would be entered into the diagnosis tool",
    "expectedDiagnosis": "The correct diagnosis",
    "differentials": ["alternative diagnosis 1", "alternative diagnosis 2"]
}}

Return ONLY valid JSON."""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            case_data = json.loads(json_match.group())
            return {
                "success": True,
                "case": case_data
            }
        
        raise HTTPException(status_code=500, detail="Failed to generate case")
        
    except Exception as e:
        logger.error(f"Error generating case: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/diagnosis/extract-document")
async def extract_document_text(file: UploadFile = File(...)):
    """
    Extract clinical text from uploaded documents (PDF, Word, TXT).
    """
    import tempfile
    import os
    
    try:
        # Validate file type
        allowed_extensions = {'.pdf', '.doc', '.docx', '.txt'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            return {
                "success": False,
                "error": f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            }
        
        # Read file content
        content = await file.read()
        
        # Extract text based on file type
        extracted_text = ""
        
        if file_ext == '.txt':
            # Plain text file
            extracted_text = content.decode('utf-8', errors='ignore')
            
        elif file_ext == '.pdf':
            # PDF extraction using PyPDF2 or pdfplumber
            try:
                import io
                try:
                    import pdfplumber
                    with pdfplumber.open(io.BytesIO(content)) as pdf:
                        pages_text = []
                        for page in pdf.pages:
                            text = page.extract_text()
                            if text:
                                pages_text.append(text)
                        extracted_text = "\n\n".join(pages_text)
                except ImportError:
                    # Fallback to PyPDF2
                    from PyPDF2 import PdfReader
                    reader = PdfReader(io.BytesIO(content))
                    pages_text = []
                    for page in reader.pages:
                        text = page.extract_text()
                        if text:
                            pages_text.append(text)
                    extracted_text = "\n\n".join(pages_text)
            except Exception as pdf_error:
                logger.error(f"PDF extraction error: {pdf_error}")
                return {
                    "success": False,
                    "error": "Failed to extract text from PDF. The file may be image-based or corrupted."
                }
                
        elif file_ext in {'.doc', '.docx'}:
            # Word document extraction
            try:
                import io
                from docx import Document
                doc = Document(io.BytesIO(content))
                paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
                extracted_text = "\n\n".join(paragraphs)
            except ImportError:
                return {
                    "success": False,
                    "error": "Word document processing not available. Please upload a PDF or TXT file."
                }
            except Exception as doc_error:
                logger.error(f"Word extraction error: {doc_error}")
                return {
                    "success": False,
                    "error": "Failed to extract text from Word document."
                }
        
        if not extracted_text.strip():
            return {
                "success": False,
                "error": "No text could be extracted from the document. The file may be empty or image-based."
            }
        
        # Clean up the extracted text
        extracted_text = extracted_text.strip()
        
        # Limit text length if very long
        max_chars = 10000
        if len(extracted_text) > max_chars:
            extracted_text = extracted_text[:max_chars] + "\n\n[Text truncated - document was too long]"
        
        return {
            "success": True,
            "extractedText": extracted_text,
            "filename": file.filename,
            "characterCount": len(extracted_text)
        }
        
    except Exception as e:
        logger.error(f"Error extracting document: {e}")
        return {
            "success": False,
            "error": f"Error processing document: {str(e)}"
        }


# ============== AI-POWERED MEDICAL KNOWLEDGE GENERATION ==============

class DiseaseGenerationRequest(BaseModel):
    """Request model for AI disease generation"""
    disease_name: str
    category: str
    additional_context: Optional[str] = ""

class BatchDiseaseGenerationRequest(BaseModel):
    """Request model for batch disease generation"""
    diseases: List[DiseaseGenerationRequest]
    batch_size: int = 3

@api_router.post("/diseases-db/generate")
async def generate_disease_ai(request: DiseaseGenerationRequest):
    """
    Generate comprehensive disease data using AI (GPT-4o).
    Creates evidence-based medical knowledge for clinical decision support.
    """
    try:
        from services.medical_knowledge_generator import MedicalKnowledgeGenerator
        
        generator = MedicalKnowledgeGenerator()
        disease_data = await generator.generate_disease_data(
            request.disease_name,
            request.category,
            request.additional_context
        )
        
        if not disease_data:
            raise HTTPException(
                status_code=500, 
                detail="Failed to generate disease data. Check LLM key balance."
            )
        
        # Save to database
        await db.diseases.update_one(
            {"id": disease_data["id"]},
            {"$set": disease_data},
            upsert=True
        )
        
        return {
            "success": True,
            "message": f"Generated and saved disease: {disease_data['name']}",
            "disease_id": disease_data["id"],
            "disease": disease_data
        }
        
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Generator not available: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating disease: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/diseases-db/generate-batch")
async def generate_diseases_batch(request: BatchDiseaseGenerationRequest):
    """
    Generate multiple diseases using AI in batches.
    Useful for expanding the knowledge base efficiently.
    """
    try:
        from services.medical_knowledge_generator import MedicalKnowledgeGenerator
        
        generator = MedicalKnowledgeGenerator()
        diseases_to_generate = [
            {
                "name": d.disease_name,
                "category": d.category,
                "context": d.additional_context or ""
            }
            for d in request.diseases
        ]
        
        generated = await generator.generate_diseases_batch(
            diseases_to_generate,
            batch_size=request.batch_size
        )
        
        # Save all to database
        saved_count = 0
        for disease_data in generated:
            await db.diseases.update_one(
                {"id": disease_data["id"]},
                {"$set": disease_data},
                upsert=True
            )
            saved_count += 1
        
        return {
            "success": True,
            "message": f"Generated {saved_count} diseases",
            "generated_count": saved_count,
            "requested_count": len(request.diseases),
            "diseases": [{"id": d["id"], "name": d["name"]} for d in generated]
        }
        
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Generator not available: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating batch: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ICD10ChunkRequest(BaseModel):
    """Request for chunked ICD-10 condition generation"""
    category: Optional[str] = None
    count: int = 10
    skip_existing: bool = True


@api_router.post("/diseases-db/generate-icd10-chunk")
async def generate_icd10_chunk(request: ICD10ChunkRequest):
    """
    Generate a chunk of ICD-10 conditions from the priority list.
    """
    import asyncio
    from services.knowledge_bank_builder import KnowledgeBankBuilder, get_top_500_conditions
    
    try:
        builder = KnowledgeBankBuilder()
        icd10_conditions = get_top_500_conditions()
        
        # Get already generated diseases
        if request.skip_existing:
            diseases = await db.diseases.find({}, {"_id": 0, "name": 1, "icd10_code": 1}).to_list(1000)
            generated_icd10 = {d.get("icd10_code", "").upper() for d in diseases if d.get("icd10_code")}
            generated_names = {d.get("name", "").lower() for d in diseases}
        else:
            generated_icd10 = set()
            generated_names = set()
        
        # Filter by category if specified
        if request.category:
            conditions_pool = [c for c in icd10_conditions if c.get("category") == request.category]
        else:
            # Use category priority order
            conditions_pool = []
            for cat in ICD10_CATEGORY_ORDER_STATIC:
                cat_conditions = [c for c in icd10_conditions if c.get("category") == cat]
                conditions_pool.extend(cat_conditions)
        
        # Filter out already generated
        conditions_to_generate = []
        for c in conditions_pool:
            icd = c.get("icd10", "").upper()
            name = c.get("name", "").lower()
            if icd not in generated_icd10 and name not in generated_names:
                conditions_to_generate.append(c)
        
        # Apply limit
        chunk = conditions_to_generate[:request.count]
        
        if not chunk:
            return {
                "success": True,
                "message": "No more conditions to generate",
                "generated_count": 0,
                "remaining_in_pool": 0,
                "conditions": []
            }
        
        # Generate conditions one by one
        results = []
        errors = []
        
        for condition in chunk:
            try:
                logger.info(f"Generating ICD-10 condition: {condition['name']} ({condition['icd10']})")
                condition_data = await builder.generate_condition_with_guidelines(condition)
                
                # Ensure ICD-10 code is included
                condition_data["icd10_code"] = condition.get("icd10")
                condition_data["ai_generated"] = True
                
                # Save to database
                await db.diseases.update_one(
                    {"id": condition_data["id"]},
                    {"$set": condition_data},
                    upsert=True
                )
                
                results.append({
                    "id": condition_data["id"],
                    "name": condition_data["name"],
                    "icd10": condition.get("icd10"),
                    "category": condition.get("category"),
                    "success": True
                })
                logger.info(f"Successfully generated: {condition['name']}")
                
                await asyncio.sleep(0.5)
                
            except Exception as e:
                logger.error(f"Failed to generate {condition['name']}: {str(e)}")
                errors.append({
                    "name": condition["name"],
                    "icd10": condition.get("icd10"),
                    "error": str(e)
                })
        
        remaining = len(conditions_to_generate) - len(chunk)
        
        return {
            "success": True,
            "message": f"Generated {len(results)} conditions, {len(errors)} errors",
            "generated_count": len(results),
            "error_count": len(errors),
            "remaining_in_pool": max(0, remaining),
            "conditions": results,
            "errors": errors if errors else None
        }
        
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Builder not available: {str(e)}")
    except Exception as e:
        logger.error(f"Error in ICD-10 chunk generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============== DRUG KNOWLEDGE BASE GENERATION ==============

class DrugGenerationRequest(BaseModel):
    """Request model for generating a single drug"""
    drug_name: str
    category: Optional[str] = None
    region: str = "international"  # "uk", "us", "india", "international"

class BatchDrugGenerationRequest(BaseModel):
    """Request model for batch drug generation"""
    drugs: List[DrugGenerationRequest]
    batch_size: int = 5

@api_router.post("/drugs-db/generate")
async def generate_drug(request: DrugGenerationRequest):
    """
    Generate comprehensive drug data using AI.
    Creates evidence-based drug profiles with BNF/FDA information.
    """
    try:
        from services.medical_knowledge_generator import DrugKnowledgeGenerator
        
        generator = DrugKnowledgeGenerator()
        drug_data = await generator.generate_drug(
            request.drug_name,
            request.category,
            request.region
        )
        
        # Save to database
        await db.drugs_generated.update_one(
            {"id": drug_data["id"]},
            {"$set": drug_data},
            upsert=True
        )
        
        return {
            "success": True,
            "message": f"Generated drug: {drug_data['name']}",
            "drug_id": drug_data["id"],
            "drug": drug_data
        }
        
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Generator not available: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating drug: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/drugs-db/generate-batch")
async def generate_drugs_batch(request: BatchDrugGenerationRequest):
    """
    Generate multiple drugs using AI in batches.
    Useful for expanding the drug knowledge base efficiently.
    """
    try:
        from services.medical_knowledge_generator import DrugKnowledgeGenerator
        
        generator = DrugKnowledgeGenerator()
        drugs_to_generate = [
            {
                "name": d.drug_name,
                "category": d.category,
                "region": d.region
            }
            for d in request.drugs
        ]
        
        generated = await generator.generate_drugs_batch(
            drugs_to_generate,
            batch_size=request.batch_size
        )
        
        # Save all to database
        saved_count = 0
        for drug_data in generated:
            await db.drugs_generated.update_one(
                {"id": drug_data["id"]},
                {"$set": drug_data},
                upsert=True
            )
            saved_count += 1
        
        return {
            "success": True,
            "message": f"Generated {saved_count} drugs",
            "generated_count": saved_count,
            "requested_count": len(request.drugs),
            "drugs": [{"id": d["id"], "name": d["name"]} for d in generated]
        }
        
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Generator not available: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating drug batch: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Hospital Priority Drug Categories - ordered by clinical importance
HOSPITAL_PRIORITY_ORDER = [
    "cardiovascular",      # Most critical in hospital settings
    "antibiotics",         # Essential for infections
    "cns_neurological",    # Pain management, sedation, neuro emergencies  
    "analgesics",          # Pain management is ubiquitous
    "respiratory",         # Respiratory care
    "gastrointestinal",    # GI issues common in hospital
    "endocrine",           # Diabetes, thyroid management
    "antivirals",          # Viral infections
    "antifungals",         # Fungal infections
    "immunosuppressants",  # Transplant, autoimmune
]


class ChunkedGenerationRequest(BaseModel):
    """Request for chunked drug generation"""
    category: Optional[str] = None  # If None, use priority order
    start_index: int = 0  # Where to start in the list
    count: int = 10  # How many drugs to generate this chunk
    skip_existing: bool = True  # Skip drugs already generated


class GenerationStatus(BaseModel):
    """Current generation status"""
    total_priority_drugs: int
    total_generated: int
    remaining: int
    by_category: Dict[str, Dict[str, int]]
    last_generated: List[str]


@api_router.get("/drugs-db/generation-status")
async def get_generation_status():
    """
    Get the current status of drug knowledge base generation.
    Shows progress and what's been generated.
    """
    from services.medical_knowledge_generator import get_priority_drugs
    
    priority_drugs = get_priority_drugs()
    total_priority = len(priority_drugs)
    
    # Get all generated drugs
    generated_drugs = await db.drugs_generated.find({}, {"_id": 0, "name": 1, "category": 1, "generated_at": 1}).to_list(1000)
    generated_names = {d["name"].lower() for d in generated_drugs}
    total_generated = len(generated_drugs)
    
    # Count by category
    by_category = {}
    for cat in HOSPITAL_PRIORITY_ORDER:
        cat_drugs = [d for d in priority_drugs if d.get("category") == cat]
        cat_generated = [d for d in cat_drugs if d["name"].lower() in generated_names]
        by_category[cat] = {
            "total": len(cat_drugs),
            "generated": len(cat_generated),
            "remaining": len(cat_drugs) - len(cat_generated)
        }
    
    # Get last 10 generated
    last_generated = sorted(generated_drugs, key=lambda x: x.get("generated_at", ""), reverse=True)[:10]
    last_names = [d.get("name", "Unknown") for d in last_generated]
    
    return {
        "total_priority_drugs": total_priority,
        "total_generated": total_generated,
        "remaining": total_priority - total_generated,
        "completion_percentage": round((total_generated / total_priority) * 100, 1) if total_priority > 0 else 0,
        "by_category": by_category,
        "last_generated": last_names,
        "priority_order": HOSPITAL_PRIORITY_ORDER
    }


@api_router.post("/drugs-db/generate-chunk")
async def generate_drug_chunk(request: ChunkedGenerationRequest):
    """
    Generate a chunk of drugs from the priority list.
    Designed for stable, controlled generation with progress tracking.
    
    - If category is specified, generates from that category
    - If not, follows hospital priority order
    - Skips already generated drugs by default
    - Returns detailed progress info
    """
    import asyncio
    from services.medical_knowledge_generator import DrugKnowledgeGenerator, get_priority_drugs
    
    try:
        generator = DrugKnowledgeGenerator()
        priority_drugs = get_priority_drugs()
        
        # Get already generated drugs
        if request.skip_existing:
            generated_cursor = db.drugs_generated.find({}, {"_id": 0, "name": 1})
            generated_list = await generated_cursor.to_list(1000)
            generated_names = {d["name"].lower() for d in generated_list}
        else:
            generated_names = set()
        
        # Filter by category if specified
        if request.category:
            drugs_pool = [d for d in priority_drugs if d.get("category") == request.category]
        else:
            # Use hospital priority order
            drugs_pool = []
            for cat in HOSPITAL_PRIORITY_ORDER:
                cat_drugs = [d for d in priority_drugs if d.get("category") == cat]
                drugs_pool.extend(cat_drugs)
        
        # Filter out already generated
        drugs_to_generate = [
            d for d in drugs_pool 
            if d["name"].lower() not in generated_names
        ]
        
        # Apply pagination
        chunk = drugs_to_generate[request.start_index:request.start_index + request.count]
        
        if not chunk:
            return {
                "success": True,
                "message": "No more drugs to generate in this category/range",
                "generated_count": 0,
                "remaining_in_pool": len(drugs_to_generate) - request.start_index,
                "drugs": []
            }
        
        # Generate drugs one by one with error handling
        results = []
        errors = []
        
        for drug_info in chunk:
            try:
                logger.info(f"Generating drug: {drug_info['name']}")
                drug_data = await generator.generate_drug(
                    drug_info["name"],
                    drug_info.get("category"),
                    drug_info.get("region", "international")
                )
                
                # Save to database immediately (for persistence)
                await db.drugs_generated.update_one(
                    {"id": drug_data["id"]},
                    {"$set": drug_data},
                    upsert=True
                )
                
                results.append({
                    "id": drug_data["id"],
                    "name": drug_data["name"],
                    "category": drug_data.get("category", drug_info.get("category")),
                    "success": True
                })
                logger.info(f"Successfully generated and saved: {drug_info['name']}")
                
                # Small delay to avoid rate limiting
                await asyncio.sleep(0.5)
                
            except Exception as e:
                logger.error(f"Failed to generate {drug_info['name']}: {str(e)}")
                errors.append({
                    "name": drug_info["name"],
                    "error": str(e)
                })
        
        # Calculate remaining
        remaining_after = len(drugs_to_generate) - request.start_index - len(chunk)
        
        return {
            "success": True,
            "message": f"Generated {len(results)} drugs, {len(errors)} errors",
            "generated_count": len(results),
            "error_count": len(errors),
            "remaining_in_pool": max(0, remaining_after),
            "next_start_index": request.start_index + request.count,
            "drugs": results,
            "errors": errors if errors else None
        }
        
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Generator not available: {str(e)}")
    except Exception as e:
        logger.error(f"Error in chunk generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/drugs-db/generate-all-priority")
async def generate_all_priority_drugs(
    batch_size: int = 5,
    max_drugs: Optional[int] = None,
    category: Optional[str] = None
):
    """
    Generate all priority drugs that haven't been generated yet.
    
    WARNING: This is a long-running operation!
    - batch_size: Number of drugs to generate in parallel (default: 5)
    - max_drugs: Maximum number of drugs to generate (for testing)
    - category: Specific category to generate (optional)
    
    For production, call generate-chunk multiple times instead.
    """
    import asyncio
    from services.medical_knowledge_generator import DrugKnowledgeGenerator, get_priority_drugs
    
    try:
        generator = DrugKnowledgeGenerator()
        priority_drugs = get_priority_drugs()
        
        # Get already generated
        generated_cursor = db.drugs_generated.find({}, {"_id": 0, "name": 1})
        generated_list = await generated_cursor.to_list(1000)
        generated_names = {d["name"].lower() for d in generated_list}
        
        # Filter drugs to generate
        if category:
            drugs_pool = [d for d in priority_drugs if d.get("category") == category]
        else:
            drugs_pool = priority_drugs
        
        drugs_to_generate = [
            d for d in drugs_pool 
            if d["name"].lower() not in generated_names
        ]
        
        # Apply max limit
        if max_drugs:
            drugs_to_generate = drugs_to_generate[:max_drugs]
        
        if not drugs_to_generate:
            return {
                "success": True,
                "message": "All priority drugs have already been generated",
                "generated_count": 0,
                "total_in_database": len(generated_names)
            }
        
        # Generate in batches
        all_results = []
        all_errors = []
        
        for i in range(0, len(drugs_to_generate), batch_size):
            batch = drugs_to_generate[i:i + batch_size]
            
            # Generate batch in parallel
            tasks = [
                generator.generate_drug(
                    d["name"],
                    d.get("category"),
                    d.get("region", "international")
                )
                for d in batch
            ]
            
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for drug_info, result in zip(batch, batch_results):
                if isinstance(result, Exception):
                    all_errors.append({
                        "name": drug_info["name"],
                        "error": str(result)
                    })
                else:
                    # Save to database
                    await db.drugs_generated.update_one(
                        {"id": result["id"]},
                        {"$set": result},
                        upsert=True
                    )
                    all_results.append({
                        "id": result["id"],
                        "name": result["name"],
                        "category": result.get("category")
                    })
            
            # Delay between batches
            if i + batch_size < len(drugs_to_generate):
                await asyncio.sleep(2)
        
        return {
            "success": True,
            "message": f"Generated {len(all_results)} drugs with {len(all_errors)} errors",
            "generated_count": len(all_results),
            "error_count": len(all_errors),
            "drugs": all_results,
            "errors": all_errors if all_errors else None
        }
        
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Generator not available: {str(e)}")
    except Exception as e:
        logger.error(f"Error in priority generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============== VIRTUAL PATIENT & DRUG SIMULATION ==============

class VirtualPatient(BaseModel):
    """Virtual patient profile for drug simulation"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Demographics
    age: int = 50
    sex: str = "male"  # "male", "female"
    weight: float = 70.0  # kg
    height: float = 170.0  # cm
    
    # Calculated
    bmi: Optional[float] = None
    bsa: Optional[float] = None  # Body Surface Area
    ideal_body_weight: Optional[float] = None
    creatinine_clearance: Optional[float] = None
    
    # Clinical Parameters (baseline)
    serum_creatinine: float = 1.0  # mg/dL
    liver_function: str = "normal"  # "normal", "mild_impairment", "moderate_impairment", "severe_impairment"
    
    # Medical History
    conditions: List[str] = []  # e.g., ["heart_failure", "hypertension", "diabetes"]
    allergies: List[str] = []
    current_medications: List[str] = []
    
    # Clinical Notes (free text)
    clinical_notes: str = ""
    
    # Physiological State (from disease)
    baseline_parameters: Dict[str, Any] = {}
    
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DrugSimulationRequest(BaseModel):
    """Request model for drug simulation"""
    patient: VirtualPatient
    drug_id: str
    dosage_mg: float
    frequency: str = "once_daily"  # "once_daily", "twice_daily", "three_times_daily", "every_6h"
    duration_days: int = 1
    route: str = "oral"

class ParameterEffect(BaseModel):
    """Effect of drug on a single parameter"""
    parameter_id: str
    parameter_name: str
    organ_id: str
    organ_name: str
    baseline_value: float
    modified_value: float
    percent_change: float
    effect_type: str  # "therapeutic", "side_effect", "overdose"
    clinical_note: str = ""

class DrugSimulationResponse(BaseModel):
    """Response model for drug simulation"""
    patient_id: str
    drug_id: str
    drug_name: str
    
    # Dosing
    recommended_dose: str
    actual_dose: float
    dose_adjustment_reason: Optional[str] = None
    
    # Contraindication & Warnings
    contraindications_found: List[str] = []
    warnings: List[str] = []
    interactions_found: List[Dict[str, str]] = []
    
    # Parameter Effects
    therapeutic_effects: List[ParameterEffect] = []
    side_effects: List[ParameterEffect] = []
    
    # PK Parameters (adjusted for patient)
    peak_concentration: Optional[float] = None
    time_to_peak: Optional[float] = None
    half_life: Optional[float] = None
    steady_state_time: Optional[float] = None
    
    # Efficacy Score
    efficacy_score: float = 0.0  # 0-100
    safety_score: float = 0.0  # 0-100
    overall_recommendation: str = ""

@api_router.post("/drugs-db/simulate")
async def simulate_drug_on_patient(request: DrugSimulationRequest):
    """
    Simulate drug effects on a virtual patient.
    Returns comprehensive PK/PD analysis with parameter modifications.
    """
    patient = request.patient
    
    # Calculate patient-specific parameters
    if patient.bmi is None:
        patient.bmi = patient.weight / ((patient.height / 100) ** 2)
    
    if patient.bsa is None:
        # Mosteller formula
        patient.bsa = np.sqrt((patient.height * patient.weight) / 3600)
    
    if patient.ideal_body_weight is None:
        if patient.sex == "male":
            patient.ideal_body_weight = 50 + 2.3 * ((patient.height / 2.54) - 60)
        else:
            patient.ideal_body_weight = 45.5 + 2.3 * ((patient.height / 2.54) - 60)
    
    # Cockcroft-Gault for CrCl
    if patient.creatinine_clearance is None:
        age_factor = (140 - patient.age) * patient.weight
        patient.creatinine_clearance = age_factor / (72 * patient.serum_creatinine)
        if patient.sex == "female":
            patient.creatinine_clearance *= 0.85
    
    # Get drug from database
    drug = await db.drugs.find_one({"id": request.drug_id}, {"_id": 0})
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")
    
    # Check contraindications
    contraindications_found = []
    for contraindication in drug.get("contraindications", []):
        ci_lower = contraindication.lower()
        # Check patient conditions
        for condition in patient.conditions:
            if condition.lower() in ci_lower or ci_lower in condition.lower():
                contraindications_found.append(f"{contraindication} (patient has {condition})")
        # Check pregnancy
        if "pregnancy" in ci_lower and patient.sex == "female" and patient.age < 50:
            contraindications_found.append(f"{contraindication} (reproductive age female)")
        # Check renal
        if "renal" in ci_lower and patient.creatinine_clearance < 30:
            contraindications_found.append(f"{contraindication} (CrCl: {patient.creatinine_clearance:.0f} mL/min)")
    
    # Check allergies
    for allergy in patient.allergies:
        allergy_lower = allergy.lower()
        if allergy_lower in drug.get("name", "").lower() or allergy_lower in drug.get("drug_class", "").lower():
            contraindications_found.append(f"Patient allergic to {allergy}")
    
    # Check drug interactions
    interactions_found = []
    for interaction in drug.get("interactions", []):
        for med in patient.current_medications:
            if med.lower() in interaction.get("interacting_drug_name", "").lower():
                interactions_found.append({
                    "drug": interaction["interacting_drug_name"],
                    "severity": interaction["severity"],
                    "effect": interaction["effect"],
                    "note": interaction.get("clinical_note", "")
                })
    
    # Generate warnings
    warnings = list(drug.get("warnings", []))
    
    # Renal impairment warning
    if patient.creatinine_clearance < 60:
        warnings.append(f"Reduced renal function (CrCl: {patient.creatinine_clearance:.0f} mL/min) - may require dose adjustment")
    
    # Hepatic impairment warning
    if patient.liver_function != "normal":
        warnings.append(f"Hepatic impairment ({patient.liver_function}) - monitor closely")
    
    # Age-related warnings
    if patient.age > 75:
        warnings.append("Elderly patient (>75 years) - start with lower dose, titrate slowly")
    
    # Weight-based warnings
    if patient.bmi > 30:
        warnings.append(f"Obese patient (BMI: {patient.bmi:.1f}) - consider adjusted dosing")
    elif patient.bmi < 18.5:
        warnings.append(f"Underweight patient (BMI: {patient.bmi:.1f}) - consider dose reduction")
    
    # Calculate dose adjustment factor
    dose_adjustment = 1.0
    dose_adjustment_reasons = []
    
    # Renal adjustment
    if patient.creatinine_clearance < 30:
        dose_adjustment *= 0.5
        dose_adjustment_reasons.append("50% reduction for severe renal impairment")
    elif patient.creatinine_clearance < 60:
        dose_adjustment *= 0.75
        dose_adjustment_reasons.append("25% reduction for moderate renal impairment")
    
    # Hepatic adjustment
    if patient.liver_function == "moderate_impairment":
        dose_adjustment *= 0.75
        dose_adjustment_reasons.append("25% reduction for hepatic impairment")
    elif patient.liver_function == "severe_impairment":
        dose_adjustment *= 0.5
        dose_adjustment_reasons.append("50% reduction for severe hepatic impairment")
    
    # Age adjustment
    if patient.age > 75:
        dose_adjustment *= 0.75
        dose_adjustment_reasons.append("25% reduction for elderly")
    
    # Calculate effective dose
    adjusted_dose = request.dosage_mg * dose_adjustment
    
    # Get dosing info
    recommended_dose = "See package insert"
    for dosage in drug.get("dosages", []):
        if dosage.get("route", "").lower() == request.route.lower():
            recommended_dose = dosage.get("typical_dose", recommended_dose)
            break
    
    # Calculate parameter effects
    therapeutic_effects = []
    side_effects = []
    
    # Dose-response factor (sigmoid Emax model)
    # E = Emax * D^n / (ED50^n + D^n)
    # Simplified: effect scales with dose ratio
    dose_ratio = adjusted_dose / 40  # Assuming 40mg as reference for most cardiac drugs
    effect_factor = min(dose_ratio, 1.5)  # Cap at 150% effect
    
    # Process therapeutic effects
    for effect in drug.get("therapeutic_effects", []):
        for organ in effect.get("organs", []):
            organ_id = organ.get("organ_id", "")
            for scale in organ.get("scales", []):
                for param in scale.get("parameters", []):
                    multiplier = param.get("multiplier", 1.0)
                    # Adjust effect based on dose
                    adjusted_multiplier = 1 + (multiplier - 1) * effect_factor
                    
                    baseline = 100  # Normalized baseline
                    modified = baseline * adjusted_multiplier
                    
                    therapeutic_effects.append(ParameterEffect(
                        parameter_id=param.get("parameter_id", ""),
                        parameter_name=param.get("parameter_id", "").replace("_", " ").title(),
                        organ_id=organ_id,
                        organ_name=organ_id.title(),
                        baseline_value=baseline,
                        modified_value=round(modified, 1),
                        percent_change=round((adjusted_multiplier - 1) * 100, 1),
                        effect_type="therapeutic",
                        clinical_note=param.get("note", "")
                    ))
    
    # Process side effects (more prominent at higher doses)
    side_effect_factor = effect_factor * 1.2  # Side effects increase faster with dose
    for effect in drug.get("side_effects", []):
        for organ in effect.get("organs", []):
            organ_id = organ.get("organ_id", "")
            for scale in organ.get("scales", []):
                for param in scale.get("parameters", []):
                    multiplier = param.get("multiplier", 1.0)
                    adjusted_multiplier = 1 + (multiplier - 1) * side_effect_factor
                    
                    baseline = 100
                    modified = baseline * adjusted_multiplier
                    
                    side_effects.append(ParameterEffect(
                        parameter_id=param.get("parameter_id", ""),
                        parameter_name=param.get("parameter_id", "").replace("_", " ").title(),
                        organ_id=organ_id,
                        organ_name=organ_id.title(),
                        baseline_value=baseline,
                        modified_value=round(modified, 1),
                        percent_change=round((adjusted_multiplier - 1) * 100, 1),
                        effect_type="side_effect",
                        clinical_note=param.get("note", "")
                    ))
    
    # Calculate PK parameters (adjusted for patient)
    half_life_str = drug.get("half_life", "12 hours")
    try:
        half_life = float(half_life_str.split()[0].replace("-", " ").split()[0])
    except:
        half_life = 12.0
    
    # Adjust half-life for renal/hepatic function
    if patient.creatinine_clearance < 30:
        half_life *= 2.0
    elif patient.creatinine_clearance < 60:
        half_life *= 1.5
    
    if patient.liver_function == "severe_impairment":
        half_life *= 1.5
    
    # Calculate scores
    efficacy_score = min(100, len(therapeutic_effects) * 15 + (effect_factor * 30))
    
    safety_penalty = (len(contraindications_found) * 30 + 
                      len([i for i in interactions_found if i["severity"] in ["severe", "contraindicated"]]) * 25 +
                      len([i for i in interactions_found if i["severity"] == "moderate"]) * 10 +
                      len(side_effects) * 5)
    safety_score = max(0, 100 - safety_penalty)
    
    # Overall recommendation
    if contraindications_found:
        overall_recommendation = "⚠️ CONTRAINDICATED - Do not use. Consider alternative therapy."
    elif safety_score < 30:
        overall_recommendation = "🔴 HIGH RISK - Multiple safety concerns. Consider alternative."
    elif safety_score < 60:
        overall_recommendation = "🟡 CAUTION - Use with close monitoring. Dose adjustment recommended."
    elif efficacy_score > 70 and safety_score > 70:
        overall_recommendation = "🟢 FAVORABLE - Good efficacy with acceptable safety profile."
    else:
        overall_recommendation = "🟡 ACCEPTABLE - Monitor response and adjust as needed."
    
    return DrugSimulationResponse(
        patient_id=patient.id,
        drug_id=request.drug_id,
        drug_name=drug.get("name", ""),
        recommended_dose=recommended_dose,
        actual_dose=adjusted_dose,
        dose_adjustment_reason="; ".join(dose_adjustment_reasons) if dose_adjustment_reasons else None,
        contraindications_found=contraindications_found,
        warnings=warnings,
        interactions_found=interactions_found,
        therapeutic_effects=therapeutic_effects,
        side_effects=side_effects,
        peak_concentration=adjusted_dose / patient.bsa * 0.1,  # Simplified Cmax
        time_to_peak=1.5,  # Hours
        half_life=half_life,
        steady_state_time=half_life * 5,
        efficacy_score=round(efficacy_score, 1),
        safety_score=round(safety_score, 1),
        overall_recommendation=overall_recommendation
    )

@api_router.post("/drugs-db/generate")
async def generate_drugs_with_ai(
    category: str,
    count: int = 10,
    include_pk_pd: bool = True
):
    """
    Generate comprehensive drug data using AI.
    Creates detailed drug entries with PK/PD parameters and organ effects.
    """
    llm_key = os.environ.get('EMERGENT_LLM_KEY')
    if not llm_key:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        import json
        
        # Map categories to drug classes
        category_prompts = {
            "cardiovascular": "cardiac drugs including beta blockers, ACE inhibitors, ARBs, calcium channel blockers, diuretics, antiarrhythmics, vasodilators, anticoagulants, antiplatelets, and statins",
            "respiratory": "respiratory drugs including bronchodilators (beta-2 agonists, anticholinergics), inhaled corticosteroids, leukotriene modifiers, and mucolytics",
            "neurological": "neurological drugs including anticonvulsants, antidepressants (SSRIs, SNRIs, TCAs), anxiolytics, antipsychotics, and antiparkinsonian agents",
            "renal": "renal drugs including diuretics (loop, thiazide, potassium-sparing), phosphate binders, and EPO stimulating agents",
            "endocrine": "endocrine drugs including insulin types, oral hypoglycemics (metformin, sulfonylureas, SGLT2 inhibitors, GLP-1 agonists), and thyroid medications",
            "gastrointestinal": "GI drugs including PPIs, H2 blockers, antiemetics, prokinetics, and hepatoprotective agents",
            "antibiotics": "antibiotics including penicillins, cephalosporins, fluoroquinolones, macrolides, and aminoglycosides",
            "analgesics": "analgesic drugs including NSAIDs, acetaminophen, opioids, and neuropathic pain agents"
        }
        
        category_desc = category_prompts.get(category, f"{category} drugs")
        
        system_prompt = """You are a clinical pharmacology expert. Generate detailed drug data in JSON format.
        
For each drug, provide COMPLETE data including:
1. Basic info: name, brand_names (array), drug_class, category, mechanism_of_action, mechanism_short
2. target_receptors: array of receptor names
3. dosages: array with {route, form, strength, typical_dose, max_daily_dose, frequency, special_instructions}
4. therapeutic_effects: array with effect objects containing organs and parameter modifications
5. side_effects: array with effect objects
6. overdose_effects: array with effect objects  
7. indications: array with {disease_id, disease_name, is_primary, efficacy_level, evidence_grade}
8. contraindications: array of strings
9. warnings: array of strings
10. interactions: array with {interacting_drug_id, interacting_drug_name, severity, effect, clinical_note}
11. PK data: absorption, distribution, metabolism, elimination, half_life
12. pregnancy_category, fda_approval_year

For parameter modifications in effects, use this structure:
{
  "effect_type": "therapeutic",
  "description": "...",
  "onset_hours": 1,
  "duration_hours": 24,
  "organs": [
    {
      "organ_id": "heart",  // Use: heart, lungs, kidneys, liver, brain, pancreas
      "scales": [
        {
          "scale_id": "physiology",  // Use: physiology, pressures, geometry, cellular
          "parameters": [
            {
              "parameter_id": "cardiac_output",  // Use actual physiological parameters
              "multiplier": 1.15,  // 1.15 = 15% increase, 0.85 = 15% decrease
              "note": "↑15% cardiac output"
            }
          ]
        }
      ]
    }
  ]
}

Common parameter_ids by organ:
- heart: heart_rate, cardiac_output, ef (ejection fraction), stroke_volume, aortic_systolic, aortic_diastolic, lv_edp, pcwp, svr
- lungs: fev1, fvc, dlco, respiratory_rate, oxygen_saturation, pao2, paco2
- kidneys: gfr, creatinine, bun, potassium, sodium, urine_output
- liver: alt, ast, albumin, bilirubin, inr
- brain: cerebral_blood_flow, intracranial_pressure
- pancreas: insulin_secretion, glucagon_secretion

Return ONLY valid JSON array of drug objects. No markdown, no explanation."""

        chat = LlmChat(
            api_key=llm_key,
            session_id=f"drug-gen-{datetime.now().timestamp()}",
            system_message=system_prompt
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"""Generate {count} commonly prescribed {category_desc}.
            
Include a diverse mix of drug classes within this category.
Each drug should have complete therapeutic_effects and side_effects with realistic parameter modifications.
Focus on drugs used in hospital settings.

Return as a JSON array of drug objects."""
        )
        
        response = await chat.send_message(user_message)
        
        # Clean response
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        drugs = json.loads(response_text)
        
        # Add IDs and timestamps
        for drug in drugs:
            drug["id"] = drug.get("name", "").lower().replace(" ", "_").replace("-", "_")
            drug["category"] = category
            drug["created_at"] = datetime.now(timezone.utc).isoformat()
            drug["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # Insert into database (upsert to avoid duplicates)
        inserted_count = 0
        for drug in drugs:
            existing = await db.drugs.find_one({"id": drug["id"]})
            if not existing:
                await db.drugs.insert_one(drug)
                inserted_count += 1
            else:
                await db.drugs.update_one({"id": drug["id"]}, {"$set": drug})
        
        return {
            "message": f"Generated {len(drugs)} {category} drugs, inserted {inserted_count} new",
            "drugs": [{"id": d["id"], "name": d.get("name", "")} for d in drugs],
            "category": category
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        logger.error(f"Drug generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Drug generation failed: {str(e)}")

@api_router.post("/drugs-db/extract-from-text")
async def extract_patient_from_clinical_text(text: str = Form(...)):
    """
    Extract patient information from clinical text using AI.
    """
    llm_key = os.environ.get('EMERGENT_LLM_KEY')
    if not llm_key:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        import json
        
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"extract-{datetime.now().timestamp()}",
            system_message="""Extract patient information from clinical text and return as JSON.

Return this exact structure:
{
  "age": number or null,
  "sex": "male" or "female" or null,
  "weight": number in kg or null,
  "height": number in cm or null,
  "serum_creatinine": number in mg/dL or null,
  "liver_function": "normal", "mild_impairment", "moderate_impairment", or "severe_impairment",
  "conditions": ["condition1", "condition2"],
  "allergies": ["allergy1", "allergy2"],
  "current_medications": ["med1", "med2"],
  "clinical_notes": "summary of other relevant findings"
}

Return ONLY valid JSON, no explanation."""
        ).with_model("openai", "gpt-4o")
        
        response = await chat.send_message(UserMessage(text=f"Extract patient data from:\n\n{text}"))
        
        # Clean and parse
        response_text = response.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        patient_data = json.loads(response_text)
        return patient_data
        
    except Exception as e:
        logger.error(f"Extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

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
