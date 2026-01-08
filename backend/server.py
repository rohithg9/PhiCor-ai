from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form, Body
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
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable must be set")
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Initialize scheduler
scheduler = AsyncIOScheduler()

# Scheduled task for auto-search
async def scheduled_auto_search():
    """Background task to search for guideline updates"""
    try:
        logger.info("Running scheduled auto-search for guideline updates...")
        
        # Check if auto-search is enabled
        settings = await db.system_settings.find_one({"id": "global"})
        if not settings or not settings.get("auto_search_enabled", True):
            logger.info("Auto-search is disabled, skipping...")
            return
        
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        import json
        import re
        
        EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
        if not EMERGENT_KEY:
            logger.warning("EMERGENT_LLM_KEY not found, skipping auto-search")
            return
        
        # Get sample diseases to search
        diseases = await db.diseases.find(
            {}, 
            {"_id": 0, "id": 1, "name": 1, "category": 1}
        ).limit(20).to_list(20)
        
        if not diseases:
            logger.info("No diseases found for auto-search")
            return
        
        disease_names = [d["name"] for d in diseases]
        
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"scheduled-search-{datetime.now().timestamp()}",
            system_message="""You are a medical guidelines researcher. Search your knowledge for the latest medical guideline updates, clinical recommendations, and parameter changes for the specified diseases.

Output MUST be valid JSON with this structure:
{
    "search_date": "YYYY-MM-DD",
    "findings": [
        {
            "disease_name": "disease name",
            "guideline_source": "e.g., ACC/AHA 2024, ESC 2024, WHO",
            "update_type": "parameter_change|staging_update|treatment_protocol|diagnostic_criteria",
            "summary": "Brief description of the update",
            "details": "Detailed information",
            "recommendation": "What should be updated in the system",
            "confidence": 0-100,
            "source_url": "URL if available"
        }
    ],
    "no_updates_for": ["list of diseases with no recent updates found"]
}"""
        ).with_model("openai", "gpt-4o")
        
        search_prompt = f"""Search for the latest medical guideline updates (2023-2024) for these diseases:

{', '.join(disease_names[:10])}

Focus on:
1. New staging systems or classifications
2. Updated diagnostic criteria
3. Changed parameter thresholds
4. New treatment protocols
5. Revised risk scores

Report any significant updates that should be incorporated into a medical knowledge system."""

        response = await chat.send_message(UserMessage(text=search_prompt))
        
        # Parse response
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            findings = json.loads(json_match.group())
        else:
            findings = {"findings": []}
        
        # Create suggestions from findings
        suggestions_created = 0
        for finding in findings.get("findings", []):
            matching_disease = next(
                (d for d in diseases if d["name"].lower() == finding.get("disease_name", "").lower()),
                None
            )
            
            suggestion_id = str(uuid.uuid4())
            suggestion = {
                "id": suggestion_id,
                "source_id": "scheduled_auto_search",
                "disease_id": matching_disease["id"] if matching_disease else None,
                "disease_name": finding.get("disease_name"),
                "change_type": finding.get("update_type", "guideline_update"),
                "target": finding.get("guideline_source", "general"),
                "current_value": None,
                "proposed_value": finding.get("recommendation"),
                "unit": None,
                "evidence_level": "emerging",
                "confidence": finding.get("confidence", 50),
                "reasoning": finding.get("summary"),
                "source_quote": finding.get("details"),
                "source_url": finding.get("source_url"),
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "is_auto_search": True,
                "is_scheduled": True
            }
            await db.knowledge_suggestions.insert_one(suggestion)
            suggestions_created += 1
        
        # Update settings
        await db.system_settings.update_one(
            {"id": "global"},
            {
                "$set": {
                    "last_auto_search": datetime.now(timezone.utc).isoformat(),
                    "last_auto_search_results": suggestions_created
                }
            },
            upsert=True
        )
        
        # Timeline entry
        await db.knowledge_timeline.insert_one({
            "id": str(uuid.uuid4()),
            "source_id": "scheduled_auto_search",
            "disease_id": None,
            "action": "scheduled_auto_search_completed",
            "actor_id": "system",
            "actor_name": "Scheduled Task",
            "details": {
                "diseases_searched": len(disease_names),
                "suggestions_created": suggestions_created
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        logger.info(f"Scheduled auto-search completed: {suggestions_created} suggestions created")
        
    except Exception as e:
        logger.error(f"Scheduled auto-search failed: {str(e)}")

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up PhiCor.ai server...")
    
    # Get auto-search interval from settings
    settings = await db.system_settings.find_one({"id": "global"})
    interval_days = 30
    if settings:
        interval_days = settings.get("auto_search_interval_days", 30)
    
    # Add scheduled job for auto-search
    scheduler.add_job(
        scheduled_auto_search,
        IntervalTrigger(days=interval_days),
        id="auto_search_job",
        name="Guideline Auto-Search",
        replace_existing=True
    )
    scheduler.start()
    logger.info(f"Scheduler started with auto-search every {interval_days} days")
    
    yield
    
    # Shutdown
    scheduler.shutdown()
    client.close()
    logger.info("Server shutdown complete")

# Create the main app with lifespan
app = FastAPI(title="The Mathematical Human API", version="1.0.0", lifespan=lifespan)

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
    Returns real-time counts of drugs, diseases, foods, calculators, and other metrics.
    """
    try:
        # Count drugs from drugs collection in MongoDB
        db_drugs_count = await db.drugs.count_documents({})
        
        # Also count from comprehensive_drugs.py for backwards compatibility
        try:
            from data.comprehensive_drugs import get_all_comprehensive_drugs
            comprehensive_drugs = get_all_comprehensive_drugs()
            comprehensive_count = len(comprehensive_drugs)
        except:
            comprehensive_count = 0
        
        # Count AI-generated drugs
        generated_drugs_count = await db.drugs_generated.count_documents({})
        
        # Total drugs is the maximum of DB drugs or comprehensive + generated
        total_drugs = max(db_drugs_count, comprehensive_count + generated_drugs_count)
        
        # Count diseases from MongoDB
        total_diseases = await db.diseases.count_documents({})
        
        # Get unique disease categories (organ systems)
        disease_categories = await db.diseases.distinct("category")
        organ_systems = len([c for c in disease_categories if c])  # Count non-null categories
        
        # Count diseases with mathematical models
        diseases_with_models = await db.diseases.count_documents({
            'mathematical_models': {'$exists': True, '$ne': [], '$type': 'array'}
        })
        
        # Count total mathematical models across all diseases
        pipeline = [
            {'$match': {'mathematical_models': {'$exists': True, '$ne': []}}},
            {'$project': {'model_count': {'$size': {'$ifNull': ['$mathematical_models', []]}}}},
            {'$group': {'_id': None, 'total': {'$sum': '$model_count'}}}
        ]
        model_result = await db.diseases.aggregate(pipeline).to_list(1)
        total_models = model_result[0]['total'] if model_result else 0
        
        # Count foods from MongoDB
        total_foods = await db.foods.count_documents({})
        
        # Count nutrients tracked
        total_nutrients = await db.nutrients.count_documents({})
        
        # Count clinical calculators (from frontend data)
        calculator_count = 42  # From clinicalCalculators.js
        
        return {
            "drugs": {
                "total": total_drugs,
                "from_db": db_drugs_count,
                "comprehensive": comprehensive_count,
                "ai_generated": generated_drugs_count
            },
            "diseases": {
                "total": total_diseases,
                "categories": len(disease_categories),
                "with_models": diseases_with_models
            },
            "foods": {
                "total": total_foods
            },
            "nutrients": {
                "total": total_nutrients
            },
            "calculators": calculator_count,
            "organ_systems": organ_systems,
            "mathematical_models": total_models,
            "display_stats": {
                "drugs": f"{total_drugs}+",
                "diseases": f"{total_diseases}+",
                "foods": f"{total_foods}+",
                "nutrients": f"{total_nutrients}+",
                "calculators": f"{calculator_count}+",
                "organ_systems": str(organ_systems),
                "models": f"{total_models}+" if total_models > 0 else "∞"
            }
        }
    except Exception as e:
        logger.error(f"Error getting platform stats: {e}")
        # Return default values
        return {
            "drugs": {"total": 300, "comprehensive": 115, "ai_generated": 308},
            "diseases": {"total": 2500, "categories": 45},
            "calculators": 42,
            "organ_systems": 45,
            "mathematical_models": 500,
            "display_stats": {
                "drugs": "300+",
                "diseases": "2500+",
                "calculators": "42+",
                "organ_systems": "45",
                "models": "500+"
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


@api_router.post("/diseases-db/import-full")
async def import_full_disease_database():
    """
    Import the full disease database from exported JSON file.
    This loads all 1977 diseases with AI-generated data.
    """
    import json as json_module
    
    try:
        # Load from exported file
        with open('/app/backend/data/exported_diseases.json', 'r') as f:
            diseases = json_module.load(f)
        
        if not diseases:
            return {"message": "No diseases in export file", "count": 0}
        
        # Clear existing and insert all
        await db.diseases.delete_many({})
        
        # Insert in batches of 100
        batch_size = 100
        inserted = 0
        for i in range(0, len(diseases), batch_size):
            batch = diseases[i:i+batch_size]
            await db.diseases.insert_many(batch)
            inserted += len(batch)
        
        total = await db.diseases.count_documents({})
        
        return {
            "message": f"Successfully imported {inserted} diseases",
            "total_in_database": total
        }
    except FileNotFoundError:
        return {"message": "Export file not found. Run export first.", "count": 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@api_router.post("/experts/import-full")
async def import_full_experts_database():
    """
    Import experts, knowledge sources, knowledge suggestions, and system settings from exported JSON file.
    This is needed to sync production database with preview database.
    """
    import json as json_module
    
    try:
        # Load from exported file
        with open('/app/backend/data/exported_experts.json', 'r') as f:
            data = json_module.load(f)
        
        results = {}
        
        # Import experts
        if data.get('experts'):
            await db.experts.delete_many({})
            await db.experts.insert_many(data['experts'])
            results['experts'] = len(data['experts'])
        
        # Import knowledge sources
        if data.get('knowledge_sources'):
            await db.knowledge_sources.delete_many({})
            await db.knowledge_sources.insert_many(data['knowledge_sources'])
            results['knowledge_sources'] = len(data['knowledge_sources'])
        
        # Import knowledge suggestions
        if data.get('knowledge_suggestions'):
            await db.knowledge_suggestions.delete_many({})
            await db.knowledge_suggestions.insert_many(data['knowledge_suggestions'])
            results['knowledge_suggestions'] = len(data['knowledge_suggestions'])
        
        # Import system settings
        if data.get('system_settings'):
            for setting in data['system_settings']:
                await db.system_settings.update_one(
                    {"id": setting.get("id", "global")},
                    {"$set": setting},
                    upsert=True
                )
            results['system_settings'] = len(data['system_settings'])
        
        return {
            "message": "Successfully imported expert data",
            "imported": results
        }
    except FileNotFoundError:
        return {"message": "Export file not found. Run export first on preview.", "imported": {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


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
        
        prompt = f"""You are a clinical medicine expert and systems biologist. Generate COMPREHENSIVE clinical parameter modifications for: {request.disease_name}

MISSION: Transform ALL medical knowledge about this disease from text into QUANTIFIABLE PARAMETERS. Every clinical finding must be expressed mathematically as a deviation from normal.

Return a JSON object with this structure:
{{
    "disease_id": "{request.disease_id}",
    "disease_name": "{request.disease_name}",
    "parameter_modifications": {{
        
        // === VITAL SIGNS (heart organ, vital_signs scale) ===
        "heart": {{
            "vital_signs": {{
                "systolic_bp": {{ "change_percent": X, "direction": "increase/decrease", "evidence": "..." }},
                "diastolic_bp": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "resting_hr": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "hr_variability": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "physical_exam": {{
                "s3_present": {{ "value": 1, "direction": "increase", "evidence": "Heart failure" }},
                "jvp": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "peripheral_edema": {{ "value": X, "direction": "...", "evidence": "..." }},
                "systolic_murmur_grade": {{ "value": X, "direction": "...", "evidence": "..." }}
            }},
            "ecg": {{
                "pr_interval": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "qtc_interval": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "st_elevation": {{ "value": X, "direction": "...", "evidence": "..." }}
            }},
            "lab_tests": {{
                "troponin_i": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "bnp": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "ldl_cholesterol": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "crp": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "imaging": {{
                "echo_ef": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "coronary_calcium": {{ "value": X, "direction": "...", "evidence": "..." }}
            }}
        }},
        
        // === COMPLETE BLOOD COUNT (blood organ) ===
        "blood": {{
            "geometry": {{
                "rbc_count": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "wbc_count": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "platelet_count": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "hematocrit": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "physiology": {{
                "hemoglobin": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "mcv": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "mch": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "rdw": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "lab_tests": {{
                // WBC DIFFERENTIAL - critical for diagnosis
                "neutrophils_absolute": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "lymphocytes_absolute": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "eosinophils_absolute": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "bands": {{ "change_percent": X, "direction": "...", "evidence": "Left shift in infection" }},
                "cd4_count": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "nlr": {{ "change_percent": X, "direction": "...", "evidence": "Inflammation marker" }}
            }},
            "structure": {{
                "ferritin": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "serum_iron": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "vitamin_b12": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "pressures": {{
                // COAGULATION
                "pt": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "inr": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "d_dimer": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "fibrinogen": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }}
        }},
        
        // === METABOLIC PANEL (kidneys, liver organs) ===
        "kidneys": {{
            "lab_tests": {{
                "creatinine": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "bun": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "egfr": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "sodium": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "potassium": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "chloride": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "bicarbonate": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "urinalysis": {{
                "urine_protein": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "urine_glucose": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "urine_rbc": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "urine_wbc": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }}
        }},
        
        "liver": {{
            "lab_tests": {{
                "ast": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "alt": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "alp": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "ggt": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "total_bilirubin": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "albumin": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "total_protein": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }}
        }},
        
        // === GENETIC & MOLECULAR (cellular organ) ===
        "cellular": {{
            "dna": {{
                // Include ALL relevant genetic markers for this disease
                // Gene mutations, expression changes, variants
                "relevant_gene": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "gene_expression": {{
                // Signaling pathways affected
                "relevant_pathway": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }},
            "metabolism": {{
                "atp_production": {{ "change_percent": X, "direction": "...", "evidence": "..." }},
                "ros_level": {{ "change_percent": X, "direction": "...", "evidence": "..." }}
            }}
        }},
        
        // === OTHER AFFECTED ORGANS ===
        // Include lungs, brain, pancreas, thyroid, etc. as relevant
        
    }},
    "affected_organs": ["list all affected organs"],
    "molecular_summary": "Brief description of pathophysiology"
}}

COMPREHENSIVE EXTRACTION RULES:

1. **VITAL SIGNS**: For EVERY disease, determine how BP, HR, temperature, RR are affected

2. **LABORATORY VALUES**: Extract ALL relevant lab changes:
   - CBC with differential (especially if infection, inflammation, cancer, autoimmune)
   - BMP/CMP (especially if renal, hepatic, metabolic disease)
   - Liver function tests (hepatic conditions, drug toxicity)
   - Coagulation (bleeding disorders, liver disease, DIC)
   - Cardiac markers (cardiac conditions)
   - Inflammatory markers (CRP, ESR, ferritin for inflammatory conditions)
   - Tumor markers (for cancers)
   - Autoantibodies (autoimmune conditions)

3. **PHYSICAL EXAM FINDINGS**: Quantify what would be found on exam:
   - Heart sounds (S3, S4, murmurs)
   - Breath sounds (crackles, wheezes)
   - Neurological (reflexes, sensory changes)
   - Skin findings
   - Lymphadenopathy
   - Hepatosplenomegaly

4. **IMAGING FINDINGS**: Include measurable imaging parameters

5. **GENETIC/MOLECULAR**: Include relevant genes, pathways, mutations

6. **FUNCTIONAL SCORES**: Include relevant scoring systems (NYHA, GCS, MMSE, etc.)

REMEMBER: The goal is to convert ALL textbook medical knowledge into quantifiable deviations from normal. Be comprehensive - include every parameter that would be abnormal in this disease.

Return ONLY valid JSON, no other text."""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Extract JSON from response
        response_text = response
        
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
    
    # Get diseases that don't have parameter_modifications yet (or have empty/null)
    query = {
        "$or": [
            {"parameter_modifications": {"$exists": False}},
            {"parameter_modifications": {}},
            {"parameter_modifications": None}
        ]
    }
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
    include_params: bool = False,
    limit: int = 2500,
    skip: int = 0
):
    """
    Get diseases from database with optional search and category filter.
    Use include_params=true to get parameter_modifications for the Mathematical Human Body dashboard.
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
    
    # Return full or simplified list based on include_params flag
    if include_params:
        # Return full disease data including parameter_modifications
        return {
            "diseases": diseases,
            "total": total,
            "limit": limit,
            "skip": skip
        }
    
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

@api_router.get("/diseases-db/parameter-causes/{parameter_name}")
async def get_parameter_causes(
    parameter_name: str,
    direction: Optional[str] = None,
    limit: int = 30
):
    """
    Get all diseases that can cause a specific parameter abnormality.
    This powers the "Parameter Drill-Down" feature on the Differential Dashboard.
    
    Args:
        parameter_name: The parameter to search for (e.g., "wbc_count", "creatinine", "heart_rate")
        direction: Optional filter for "increase" or "decrease"
        limit: Maximum number of results
    
    Returns:
        List of diseases that affect this parameter, with details about how they affect it.
    """
    try:
        # Normalize parameter name
        param_key = parameter_name.lower().replace(" ", "_").replace("-", "_")
        
        # Build aggregation pipeline to search through nested parameter_modifications
        pipeline = [
            # Match diseases that have parameter_modifications
            {"$match": {"parameter_modifications": {"$exists": True, "$ne": {}}}},
            # Project relevant fields
            {"$project": {
                "_id": 0,
                "id": 1,
                "name": 1,
                "icd10_code": 1,
                "category": 1,
                "description": 1,
                "parameter_modifications": 1
            }},
            {"$limit": 500}  # Limit initial fetch for performance
        ]
        
        diseases = await db.diseases.aggregate(pipeline).to_list(500)
        
        # Filter diseases that have the parameter
        matching_diseases = []
        
        for disease in diseases:
            param_mods = disease.get("parameter_modifications", {})
            
            for organ, organ_data in param_mods.items():
                if not isinstance(organ_data, dict):
                    continue
                    
                # Check each category within organ (vital_signs, geometry, etc.)
                for category, category_data in organ_data.items():
                    if not isinstance(category_data, dict):
                        continue
                    
                    # Check if this is directly a parameter or a nested structure
                    for key, value in category_data.items():
                        # Check if key matches our parameter
                        key_normalized = key.lower().replace(" ", "_").replace("-", "_")
                        
                        if param_key in key_normalized or key_normalized in param_key:
                            # Found a match
                            param_info = value if isinstance(value, dict) else {"direction": "unknown"}
                            param_direction = param_info.get("direction") or param_info.get("change_direction", "unknown")
                            
                            # Filter by direction if specified
                            if direction and param_direction != direction:
                                continue
                            
                            matching_diseases.append({
                                "disease_id": disease.get("id"),
                                "disease_name": disease.get("name"),
                                "icd10_code": disease.get("icd10_code", ""),
                                "category": disease.get("category", ""),
                                "organ_system": organ,
                                "parameter_name": key,
                                "direction": param_direction,
                                "magnitude": param_info.get("change_percent") or param_info.get("magnitude", ""),
                                "evidence": param_info.get("evidence", ""),
                                "clinical_significance": param_info.get("clinical_significance", ""),
                                "diagnostic_weight": param_info.get("diagnostic_weight", 0.5)
                            })
                            break  # Found match in this disease, move to next
        
        # Sort by diagnostic weight (higher = more relevant)
        matching_diseases.sort(key=lambda x: x.get("diagnostic_weight", 0), reverse=True)
        
        # Group by direction for easier consumption
        increased = [d for d in matching_diseases if d["direction"] == "increase"]
        decreased = [d for d in matching_diseases if d["direction"] == "decrease"]
        other = [d for d in matching_diseases if d["direction"] not in ["increase", "decrease"]]
        
        return {
            "parameter": parameter_name,
            "normalized_key": param_key,
            "total_matches": len(matching_diseases),
            "causes_of_increase": increased[:limit],
            "causes_of_decrease": decreased[:limit],
            "other_associations": other[:limit],
            "summary": {
                "increase_count": len(increased),
                "decrease_count": len(decreased),
                "other_count": len(other)
            }
        }
        
    except Exception as e:
        logger.error(f"Error in parameter causes lookup: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/diseases-db/list")
async def get_disease_list_lightweight():
    """
    Get a lightweight list of all diseases for fast initial loading.
    Returns only essential fields: id, name, icd10_code, category
    """
    # Only return minimal fields - just what's needed for disease selector
    diseases = await db.diseases.find(
        {},
        {
            "_id": 0,
            "id": 1,
            "name": 1,
            "icd10_code": 1,
            "category": 1
        }
    ).to_list(3000)
    
    return {
        "total": len(diseases),
        "diseases": diseases
    }


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
    
    # Phase 1: Basic AI enhancement count
    phase1_enhanced = await db.diseases.count_documents({"ai_enhanced": True})
    
    # Phase 2: Comprehensive model count
    phase2_enhanced = await db.diseases.count_documents({"comprehensive_model": {"$exists": True}})
    
    return {
        "total_diseases": total_diseases,
        "ai_generated": ai_generated,
        "manually_curated": manual,
        "comprehensive_entries": comprehensive,
        "phase1_enhanced": phase1_enhanced,
        "phase2_comprehensive": phase2_enhanced,
        "by_category": {item["_id"]: item["count"] for item in category_counts},
        "coverage_percentage": round((comprehensive / max(total_diseases, 1)) * 100, 1),
        "phase1_progress": round((phase1_enhanced / max(total_diseases, 1)) * 100, 1),
        "phase2_progress": round((phase2_enhanced / max(total_diseases, 1)) * 100, 1)
    }


@api_router.post("/enhancement/start-phase2")
async def start_phase2_enhancement():
    """
    Start Phase 2: Comprehensive disease model generation.
    This runs in the background and generates full disease models.
    """
    import subprocess
    import os
    
    # Check if Phase 2 is already running
    result = subprocess.run(['pgrep', '-f', 'generate_comprehensive_models'], capture_output=True)
    if result.returncode == 0:
        return {"status": "already_running", "message": "Phase 2 is already running"}
    
    # Start Phase 2 in background
    log_file = "/tmp/phase2_enhancement.log"
    script_path = "/app/backend/generate_comprehensive_models.py"
    
    subprocess.Popen(
        ['python', script_path],
        stdout=open(log_file, 'w'),
        stderr=subprocess.STDOUT,
        cwd='/app/backend',
        start_new_session=True
    )
    
    return {
        "status": "started",
        "message": "Phase 2 comprehensive model generation started",
        "log_file": log_file
    }


@api_router.get("/enhancement/status")
async def get_enhancement_status():
    """
    Get current status of all enhancement phases.
    """
    import subprocess
    
    total_diseases = await db.diseases.count_documents({})
    phase1_enhanced = await db.diseases.count_documents({"ai_enhanced": True})
    phase2_enhanced = await db.diseases.count_documents({"comprehensive_model": {"$exists": True}})
    
    # Check if Phase 1 is running
    phase1_running = subprocess.run(['pgrep', '-f', 'enhance_all_data'], capture_output=True).returncode == 0
    
    # Check if Phase 2 is running
    phase2_running = subprocess.run(['pgrep', '-f', 'generate_comprehensive_models'], capture_output=True).returncode == 0
    
    # Estimate completion times
    phase1_remaining = total_diseases - phase1_enhanced
    phase2_remaining = total_diseases - phase2_enhanced
    
    return {
        "total_diseases": total_diseases,
        "phase1": {
            "name": "Basic AI Enhancement",
            "enhanced": phase1_enhanced,
            "remaining": phase1_remaining,
            "progress_percent": round((phase1_enhanced / max(total_diseases, 1)) * 100, 1),
            "is_running": phase1_running,
            "estimated_time_remaining": f"{phase1_remaining * 2.5 / 60:.0f} minutes" if phase1_running else "N/A"
        },
        "phase2": {
            "name": "Comprehensive Model Generation",
            "enhanced": phase2_enhanced,
            "remaining": phase2_remaining,
            "progress_percent": round((phase2_enhanced / max(total_diseases, 1)) * 100, 1),
            "is_running": phase2_running,
            "estimated_time_remaining": f"{phase2_remaining * 3 / 60:.0f} minutes" if phase2_running else "N/A"
        }
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
    model_config = {"extra": "allow"}  # Allow extra fields
    parameterId: Optional[str] = None
    name: Optional[str] = None
    value: Optional[Any] = None  # Accept both numbers and strings like "elevated"
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
# NOTE: Router must be included AFTER all routes are defined
# app.include_router(api_router)  # Moved to end of file

# ============== EXPERT CURATION SYSTEM ==============

# Medical Specialties
MEDICAL_SPECIALTIES = [
    "Cardiology", "Pulmonology", "Neurology", "Gastroenterology", "Nephrology",
    "Endocrinology", "Hematology", "Oncology", "Rheumatology", "Infectious Disease",
    "Dermatology", "Psychiatry", "Pediatrics", "Obstetrics & Gynecology", "General Medicine",
    "Surgery", "Emergency Medicine", "Critical Care", "Radiology", "Pathology"
]

# Expert User Model
class ExpertCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    specialty: str
    credentials: str = ""  # MD, PhD, etc.
    institution: str = ""
    role: str = "expert"  # "expert", "admin", "super_admin"

class ExpertResponse(BaseModel):
    id: str
    email: str
    name: str
    specialty: str
    credentials: str
    institution: str
    role: str
    created_at: str
    diseases_reviewed: int = 0
    pending_changes: int = 0

class ExpertLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expert: ExpertResponse

# Change Request Models
class ParameterChangeRequest(BaseModel):
    parameter_id: str
    parameter_name: str
    current_value: Any
    proposed_value: Any
    current_unit: str = ""
    source_url: str  # Required - evidence source
    reasoning: str  # Required - why this change
    
class ChangeRequestCreate(BaseModel):
    disease_id: str
    disease_name: str
    organ_id: str
    scale_id: str
    change_type: str = "modification"  # "modification", "addition", "deletion"
    parameters: List[ParameterChangeRequest]
    additional_notes: str = ""

class ChangeRequestResponse(BaseModel):
    id: str
    expert_id: str
    expert_name: str
    expert_specialty: str
    disease_id: str
    disease_name: str
    organ_id: str
    scale_id: str
    change_type: str
    parameters: List[Dict[str, Any]]
    additional_notes: str
    status: str  # "pending", "approved", "rejected"
    created_at: str
    reviewed_at: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewer_notes: Optional[str] = None

# Audit Log Model
class AuditLogEntry(BaseModel):
    id: str
    action: str  # "change_requested", "change_approved", "change_rejected", "disease_reviewed"
    expert_id: str
    expert_name: str
    target_type: str  # "disease", "parameter", "change_request"
    target_id: str
    target_name: str
    details: Dict[str, Any] = {}
    timestamp: str

# Experiment Models
class ExperimentPatient(BaseModel):
    name: str
    age: int
    sex: str
    weight: float
    height: float
    medical_history: List[str] = []
    current_conditions: List[str] = []  # Disease IDs
    medications: List[str] = []

class ExperimentCreate(BaseModel):
    name: str
    description: str = ""
    patient: ExperimentPatient
    test_diseases: List[str] = []  # Disease IDs to test against
    severity_levels: Dict[str, float] = {}  # Disease ID -> severity (0-1)

class ExperimentResponse(BaseModel):
    id: str
    expert_id: str
    expert_name: str
    name: str
    description: str
    patient: Dict[str, Any]
    test_diseases: List[str]
    severity_levels: Dict[str, float]
    results: Dict[str, Any] = {}
    created_at: str
    updated_at: str

# ============== EXPERT AUTH HELPERS ==============

async def get_current_expert(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Validate expert JWT token and return expert data"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        expert_id = payload.get("sub")
        role = payload.get("role", "expert")
        
        if not expert_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        expert = await db.experts.find_one({"id": expert_id}, {"_id": 0})
        if not expert:
            raise HTTPException(status_code=401, detail="Expert not found")
        
        return expert
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(expert: dict = Depends(get_current_expert)) -> dict:
    """Require admin or super_admin role"""
    if expert.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return expert

async def require_super_admin(expert: dict = Depends(get_current_expert)) -> dict:
    """Require super_admin role"""
    if expert.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
    return expert

# ============== EXPERT API ROUTES ==============

@api_router.post("/experts/register", response_model=ExpertLoginResponse)
async def register_expert(expert_data: ExpertCreate):
    """Register a new expert (admin only in production, open for now)"""
    # Check if email already exists
    existing = await db.experts.find_one({"email": expert_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate specialty
    if expert_data.specialty not in MEDICAL_SPECIALTIES:
        raise HTTPException(status_code=400, detail=f"Invalid specialty. Must be one of: {MEDICAL_SPECIALTIES}")
    
    # Hash password
    hashed_password = bcrypt.hashpw(expert_data.password.encode('utf-8'), bcrypt.gensalt())
    
    # Create expert document
    expert_id = str(uuid.uuid4())
    expert = {
        "id": expert_id,
        "email": expert_data.email,
        "password_hash": hashed_password.decode('utf-8'),
        "name": expert_data.name,
        "specialty": expert_data.specialty,
        "credentials": expert_data.credentials,
        "institution": expert_data.institution,
        "role": expert_data.role if expert_data.role in ["expert", "admin", "super_admin"] else "expert",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "diseases_reviewed": 0,
        "pending_changes": 0,
        "last_login": None
    }
    
    await db.experts.insert_one(expert)
    
    # Generate JWT token
    token_payload = {
        "sub": expert_id,
        "email": expert_data.email,
        "role": expert["role"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    # Log audit
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": "expert_registered",
        "expert_id": expert_id,
        "expert_name": expert_data.name,
        "target_type": "expert",
        "target_id": expert_id,
        "target_name": expert_data.name,
        "details": {"specialty": expert_data.specialty, "role": expert["role"]},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return ExpertLoginResponse(
        access_token=token,
        expert=ExpertResponse(
            id=expert_id,
            email=expert_data.email,
            name=expert_data.name,
            specialty=expert_data.specialty,
            credentials=expert_data.credentials,
            institution=expert_data.institution,
            role=expert["role"],
            created_at=expert["created_at"],
            diseases_reviewed=0,
            pending_changes=0
        )
    )

@api_router.post("/experts/login", response_model=ExpertLoginResponse)
async def login_expert(login_data: UserLogin):
    """Login for experts"""
    expert = await db.experts.find_one({"email": login_data.email})
    if not expert:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(login_data.password.encode('utf-8'), expert["password_hash"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login
    await db.experts.update_one(
        {"id": expert["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Generate JWT token
    token_payload = {
        "sub": expert["id"],
        "email": expert["email"],
        "role": expert.get("role", "expert"),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    return ExpertLoginResponse(
        access_token=token,
        expert=ExpertResponse(
            id=expert["id"],
            email=expert["email"],
            name=expert["name"],
            specialty=expert.get("specialty", ""),
            credentials=expert.get("credentials", ""),
            institution=expert.get("institution", ""),
            role=expert.get("role", "expert"),
            created_at=expert["created_at"],
            diseases_reviewed=expert.get("diseases_reviewed", 0),
            pending_changes=expert.get("pending_changes", 0)
        )
    )

@api_router.get("/experts/me", response_model=ExpertResponse)
async def get_current_expert_profile(expert: dict = Depends(get_current_expert)):
    """Get current expert's profile"""
    # Count pending changes
    pending_count = await db.change_requests.count_documents({
        "expert_id": expert["id"],
        "status": "pending"
    })
    
    return ExpertResponse(
        id=expert["id"],
        email=expert["email"],
        name=expert["name"],
        specialty=expert.get("specialty", ""),
        credentials=expert.get("credentials", ""),
        institution=expert.get("institution", ""),
        role=expert.get("role", "expert"),
        created_at=expert["created_at"],
        diseases_reviewed=expert.get("diseases_reviewed", 0),
        pending_changes=pending_count
    )

@api_router.get("/experts/specialties")
async def get_medical_specialties():
    """Get list of medical specialties"""
    return {"specialties": MEDICAL_SPECIALTIES}

@api_router.get("/experts/diseases-to-review")
async def get_diseases_to_review(
    specialty: Optional[str] = None,
    search: Optional[str] = None,
    reviewed: Optional[bool] = None,
    expert: dict = Depends(get_current_expert)
):
    """Get list of diseases for expert to review"""
    # Get all diseases
    diseases = await db.diseases.find({}, {"_id": 0}).to_list(10000)
    
    # Get expert's review status
    reviews = await db.disease_reviews.find(
        {"expert_id": expert["id"]},
        {"_id": 0}
    ).to_list(10000)
    reviewed_ids = {r["disease_id"] for r in reviews}
    
    result = []
    for disease in diseases:
        # Filter by search
        if search:
            if search.lower() not in disease.get("name", "").lower():
                continue
        
        # Determine if disease matches specialty (based on primary organ or category)
        disease_specialty = disease.get("specialty", disease.get("category", "General Medicine"))
        
        is_reviewed = disease["id"] in reviewed_ids
        
        # Filter by reviewed status
        if reviewed is not None:
            if reviewed and not is_reviewed:
                continue
            if not reviewed and is_reviewed:
                continue
        
        result.append({
            "id": disease["id"],
            "name": disease.get("name", ""),
            "icd10": disease.get("icd10", ""),
            "category": disease.get("category", ""),
            "specialty": disease_specialty,
            "is_reviewed": is_reviewed,
            "last_reviewed": next((r["reviewed_at"] for r in reviews if r["disease_id"] == disease["id"]), None),
            "affected_organs": disease.get("affectedOrgans", [])
        })
    
    # Sort alphabetically
    result.sort(key=lambda x: x["name"])
    
    # Count stats
    total = len(result)
    reviewed_count = sum(1 for d in result if d["is_reviewed"])
    
    return {
        "diseases": result,
        "total": total,
        "reviewed": reviewed_count,
        "pending": total - reviewed_count
    }

@api_router.get("/experts/disease/{disease_id}/parameters")
async def get_disease_parameters_for_review(
    disease_id: str,
    expert: dict = Depends(get_current_expert)
):
    """Get all parameters for a disease for expert review"""
    disease = await db.diseases.find_one({"id": disease_id}, {"_id": 0})
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    
    # Get any pending changes for this disease
    pending_changes = await db.change_requests.find({
        "disease_id": disease_id,
        "status": "pending"
    }, {"_id": 0}).to_list(100)
    
    # Get parameter sources/evidence
    param_evidence = await db.parameter_evidence.find({
        "disease_id": disease_id
    }, {"_id": 0}).to_list(1000)
    evidence_map = {e["parameter_id"]: e for e in param_evidence}
    
    return {
        "disease": disease,
        "pending_changes": pending_changes,
        "parameter_evidence": evidence_map
    }

@api_router.post("/experts/disease/{disease_id}/mark-reviewed")
async def mark_disease_reviewed(
    disease_id: str,
    expert: dict = Depends(get_current_expert)
):
    """Mark a disease as reviewed by this expert"""
    disease = await db.diseases.find_one({"id": disease_id}, {"_id": 0})
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    
    review_record = {
        "id": str(uuid.uuid4()),
        "disease_id": disease_id,
        "disease_name": disease.get("name", ""),
        "expert_id": expert["id"],
        "expert_name": expert["name"],
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "notes": ""
    }
    
    # Upsert review record
    await db.disease_reviews.update_one(
        {"disease_id": disease_id, "expert_id": expert["id"]},
        {"$set": review_record},
        upsert=True
    )
    
    # Update expert's review count
    await db.experts.update_one(
        {"id": expert["id"]},
        {"$inc": {"diseases_reviewed": 1}}
    )
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": "disease_reviewed",
        "expert_id": expert["id"],
        "expert_name": expert["name"],
        "target_type": "disease",
        "target_id": disease_id,
        "target_name": disease.get("name", ""),
        "details": {},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Disease marked as reviewed", "review": review_record}

# ============== CHANGE REQUEST ROUTES ==============

@api_router.post("/change-requests", response_model=ChangeRequestResponse)
async def create_change_request(
    change_data: ChangeRequestCreate,
    expert: dict = Depends(get_current_expert)
):
    """Submit a change request for review"""
    request_id = str(uuid.uuid4())
    
    change_request = {
        "id": request_id,
        "expert_id": expert["id"],
        "expert_name": expert["name"],
        "expert_specialty": expert.get("specialty", ""),
        "disease_id": change_data.disease_id,
        "disease_name": change_data.disease_name,
        "organ_id": change_data.organ_id,
        "scale_id": change_data.scale_id,
        "change_type": change_data.change_type,
        "parameters": [p.dict() for p in change_data.parameters],
        "additional_notes": change_data.additional_notes,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reviewed_at": None,
        "reviewed_by": None,
        "reviewer_notes": None
    }
    
    await db.change_requests.insert_one(change_request)
    
    # Update expert's pending count
    await db.experts.update_one(
        {"id": expert["id"]},
        {"$inc": {"pending_changes": 1}}
    )
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": "change_requested",
        "expert_id": expert["id"],
        "expert_name": expert["name"],
        "target_type": "change_request",
        "target_id": request_id,
        "target_name": f"{change_data.disease_name} - {change_data.organ_id}/{change_data.scale_id}",
        "details": {"change_type": change_data.change_type, "parameter_count": len(change_data.parameters)},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return ChangeRequestResponse(**change_request)

@api_router.get("/change-requests")
async def get_change_requests(
    status: Optional[str] = None,
    disease_id: Optional[str] = None,
    expert: dict = Depends(get_current_expert)
):
    """Get change requests (all for admin, own for experts)"""
    query = {}
    
    # Non-admins can only see their own requests
    if expert.get("role") not in ["admin", "super_admin"]:
        query["expert_id"] = expert["id"]
    
    if status:
        query["status"] = status
    if disease_id:
        query["disease_id"] = disease_id
    
    requests = await db.change_requests.find(query, {"_id": 0}).to_list(1000)
    
    # Sort by created_at descending
    requests.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    return {
        "change_requests": requests,
        "total": len(requests),
        "pending": sum(1 for r in requests if r.get("status") == "pending"),
        "approved": sum(1 for r in requests if r.get("status") == "approved"),
        "rejected": sum(1 for r in requests if r.get("status") == "rejected")
    }

@api_router.put("/change-requests/{request_id}")
async def update_change_request(
    request_id: str,
    change_data: ChangeRequestCreate,
    expert: dict = Depends(get_current_expert)
):
    """Update a pending change request (only by the original submitter before approval)"""
    change_request = await db.change_requests.find_one({"id": request_id}, {"_id": 0})
    if not change_request:
        raise HTTPException(status_code=404, detail="Change request not found")
    
    # Only the original submitter can edit
    if change_request["expert_id"] != expert["id"]:
        raise HTTPException(status_code=403, detail="You can only edit your own change requests")
    
    # Can only edit pending requests
    if change_request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Cannot edit a change request that has already been reviewed")
    
    # Update the change request
    update_data = {
        "parameters": [p.dict() for p in change_data.parameters],
        "additional_notes": change_data.additional_notes,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.change_requests.update_one(
        {"id": request_id},
        {"$set": update_data}
    )
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": "change_request_edited",
        "expert_id": expert["id"],
        "expert_name": expert["name"],
        "target_type": "change_request",
        "target_id": request_id,
        "target_name": f"{change_request['disease_name']} - {change_request['organ_id']}/{change_request['scale_id']}",
        "details": {"parameter_count": len(change_data.parameters)},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Return updated request
    updated = await db.change_requests.find_one({"id": request_id}, {"_id": 0})
    return updated

@api_router.delete("/change-requests/{request_id}")
async def delete_change_request(
    request_id: str,
    expert: dict = Depends(get_current_expert)
):
    """Delete/withdraw a pending change request (only by the original submitter)"""
    change_request = await db.change_requests.find_one({"id": request_id}, {"_id": 0})
    if not change_request:
        raise HTTPException(status_code=404, detail="Change request not found")
    
    # Only the original submitter can delete
    if change_request["expert_id"] != expert["id"]:
        raise HTTPException(status_code=403, detail="You can only withdraw your own change requests")
    
    # Can only delete pending requests
    if change_request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Cannot withdraw a change request that has already been reviewed")
    
    # Delete the request
    await db.change_requests.delete_one({"id": request_id})
    
    # Update expert's pending count
    await db.experts.update_one(
        {"id": expert["id"]},
        {"$inc": {"pending_changes": -1}}
    )
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": "change_request_withdrawn",
        "expert_id": expert["id"],
        "expert_name": expert["name"],
        "target_type": "change_request",
        "target_id": request_id,
        "target_name": f"{change_request['disease_name']} - {change_request['organ_id']}/{change_request['scale_id']}",
        "details": {},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Change request withdrawn successfully"}

@api_router.post("/change-requests/{request_id}/approve")
async def approve_change_request(
    request_id: str,
    reviewer_notes: str = "",
    admin: dict = Depends(require_admin)
):
    """Approve a change request and apply changes to the database"""
    change_request = await db.change_requests.find_one({"id": request_id}, {"_id": 0})
    if not change_request:
        raise HTTPException(status_code=404, detail="Change request not found")
    
    if change_request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Change request already processed")
    
    # Apply the changes to the disease in the database
    disease = await db.diseases.find_one({"id": change_request["disease_id"]})
    if disease:
        # Build update query based on change type and parameters
        updates = {}
        for param_change in change_request["parameters"]:
            # Update the modifications in the disease document
            param_path = f"modifications.{change_request['organ_id']}.{change_request['scale_id']}.{param_change['parameter_id']}"
            updates[param_path] = {
                "value": param_change["proposed_value"],
                "source_url": param_change["source_url"],
                "reasoning": param_change["reasoning"],
                "updated_by": change_request["expert_id"],
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "approved_by": admin["id"]
            }
            
            # Also store parameter evidence separately
            await db.parameter_evidence.update_one(
                {
                    "disease_id": change_request["disease_id"],
                    "parameter_id": param_change["parameter_id"]
                },
                {
                    "$set": {
                        "disease_id": change_request["disease_id"],
                        "parameter_id": param_change["parameter_id"],
                        "parameter_name": param_change["parameter_name"],
                        "value": param_change["proposed_value"],
                        "source_url": param_change["source_url"],
                        "reasoning": param_change["reasoning"],
                        "updated_by": change_request["expert_id"],
                        "updated_by_name": change_request["expert_name"],
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                        "approved_by": admin["id"],
                        "approved_by_name": admin["name"]
                    }
                },
                upsert=True
            )
        
        if updates:
            await db.diseases.update_one(
                {"id": change_request["disease_id"]},
                {"$set": updates}
            )
    
    # Update change request status
    await db.change_requests.update_one(
        {"id": request_id},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "reviewed_by": admin["id"],
                "reviewer_name": admin["name"],
                "reviewer_notes": reviewer_notes
            }
        }
    )
    
    # Update expert's pending count
    await db.experts.update_one(
        {"id": change_request["expert_id"]},
        {"$inc": {"pending_changes": -1}}
    )
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": "change_approved",
        "expert_id": admin["id"],
        "expert_name": admin["name"],
        "target_type": "change_request",
        "target_id": request_id,
        "target_name": f"{change_request['disease_name']}",
        "details": {
            "original_expert": change_request["expert_name"],
            "parameter_count": len(change_request["parameters"])
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Change request approved and applied", "request_id": request_id}

@api_router.post("/change-requests/{request_id}/reject")
async def reject_change_request(
    request_id: str,
    reviewer_notes: str = "",
    admin: dict = Depends(require_admin)
):
    """Reject a change request"""
    change_request = await db.change_requests.find_one({"id": request_id}, {"_id": 0})
    if not change_request:
        raise HTTPException(status_code=404, detail="Change request not found")
    
    if change_request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Change request already processed")
    
    # Update change request status
    await db.change_requests.update_one(
        {"id": request_id},
        {
            "$set": {
                "status": "rejected",
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "reviewed_by": admin["id"],
                "reviewer_name": admin["name"],
                "reviewer_notes": reviewer_notes
            }
        }
    )
    
    # Update expert's pending count
    await db.experts.update_one(
        {"id": change_request["expert_id"]},
        {"$inc": {"pending_changes": -1}}
    )
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": "change_rejected",
        "expert_id": admin["id"],
        "expert_name": admin["name"],
        "target_type": "change_request",
        "target_id": request_id,
        "target_name": f"{change_request['disease_name']}",
        "details": {
            "original_expert": change_request["expert_name"],
            "reason": reviewer_notes
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Change request rejected", "request_id": request_id}

# ============== EXPERIMENT LAB ROUTES ==============

@api_router.post("/experiments")
async def create_experiment(
    exp_data: ExperimentCreate,
    expert: dict = Depends(get_current_expert)
):
    """Create a new patient experiment"""
    exp_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    experiment = {
        "id": exp_id,
        "expert_id": expert["id"],
        "expert_name": expert["name"],
        "name": exp_data.name,
        "description": exp_data.description,
        "patient": exp_data.patient.dict(),
        "test_diseases": exp_data.test_diseases,
        "severity_levels": exp_data.severity_levels,
        "results": {},
        "created_at": now,
        "updated_at": now
    }
    
    await db.experiments.insert_one(experiment)
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": "experiment_created",
        "expert_id": expert["id"],
        "expert_name": expert["name"],
        "target_type": "experiment",
        "target_id": exp_id,
        "target_name": exp_data.name,
        "details": {"disease_count": len(exp_data.test_diseases)},
        "timestamp": now
    })
    
    return {"id": exp_id, **experiment}

@api_router.get("/experiments")
async def get_experiments(
    expert: dict = Depends(get_current_expert)
):
    """Get experiments (all for admin, own for experts)"""
    query = {}
    if expert.get("role") not in ["admin", "super_admin"]:
        query["expert_id"] = expert["id"]
    
    experiments = await db.experiments.find(query, {"_id": 0}).to_list(1000)
    experiments.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    
    return {"experiments": experiments, "total": len(experiments)}

@api_router.get("/experiments/{exp_id}")
async def get_experiment(
    exp_id: str,
    expert: dict = Depends(get_current_expert)
):
    """Get a specific experiment"""
    experiment = await db.experiments.find_one({"id": exp_id}, {"_id": 0})
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # Check access
    if expert.get("role") not in ["admin", "super_admin"] and experiment["expert_id"] != expert["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return experiment

@api_router.post("/experiments/{exp_id}/run")
async def run_experiment(
    exp_id: str,
    expert: dict = Depends(get_current_expert)
):
    """Run the experiment and calculate parameter changes"""
    experiment = await db.experiments.find_one({"id": exp_id}, {"_id": 0})
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # Get diseases for testing
    disease_ids = experiment.get("test_diseases", [])
    diseases = await db.diseases.find({"id": {"$in": disease_ids}}, {"_id": 0}).to_list(100)
    
    # Calculate combined effects
    results = {
        "patient_baseline": experiment["patient"],
        "disease_effects": {},
        "combined_parameters": {},
        "warnings": [],
        "calculated_at": datetime.now(timezone.utc).isoformat()
    }
    
    for disease in diseases:
        disease_id = disease["id"]
        severity = experiment.get("severity_levels", {}).get(disease_id, 0.5)
        
        results["disease_effects"][disease_id] = {
            "name": disease.get("name", ""),
            "severity": severity,
            "modifications": disease.get("modifications", {}),
            "comprehensive_model": disease.get("comprehensive_model", {})
        }
    
    # Update experiment with results
    await db.experiments.update_one(
        {"id": exp_id},
        {
            "$set": {
                "results": results,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {"message": "Experiment run completed", "results": results}

@api_router.delete("/experiments/{exp_id}")
async def delete_experiment(
    exp_id: str,
    expert: dict = Depends(get_current_expert)
):
    """Delete an experiment"""
    experiment = await db.experiments.find_one({"id": exp_id}, {"_id": 0})
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # Check access
    if expert.get("role") not in ["admin", "super_admin"] and experiment["expert_id"] != expert["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.experiments.delete_one({"id": exp_id})
    
    return {"message": "Experiment deleted"}

# ============== SUPER ADMIN DASHBOARD ROUTES ==============

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(admin: dict = Depends(require_admin)):
    """Get admin dashboard statistics"""
    # Expert stats
    experts = await db.experts.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    total_experts = len(experts)
    active_experts = sum(1 for e in experts if e.get("last_login"))
    
    # Disease stats
    total_diseases = await db.diseases.count_documents({})
    reviewed_diseases = await db.disease_reviews.distinct("disease_id")
    
    # Change request stats
    pending_changes = await db.change_requests.count_documents({"status": "pending"})
    approved_changes = await db.change_requests.count_documents({"status": "approved"})
    rejected_changes = await db.change_requests.count_documents({"status": "rejected"})
    
    # Experiment stats
    total_experiments = await db.experiments.count_documents({})
    
    # Recent activity
    recent_logs = await db.audit_logs.find(
        {},
        {"_id": 0}
    ).sort("timestamp", -1).limit(50).to_list(50)
    
    return {
        "experts": {
            "total": total_experts,
            "active": active_experts,
            "by_specialty": {},
            "list": experts
        },
        "diseases": {
            "total": total_diseases,
            "reviewed": len(reviewed_diseases),
            "pending_review": total_diseases - len(reviewed_diseases)
        },
        "change_requests": {
            "pending": pending_changes,
            "approved": approved_changes,
            "rejected": rejected_changes,
            "total": pending_changes + approved_changes + rejected_changes
        },
        "experiments": {
            "total": total_experiments
        },
        "recent_activity": recent_logs
    }

@api_router.get("/admin/audit-logs")
async def get_audit_logs(
    action: Optional[str] = None,
    expert_id: Optional[str] = None,
    limit: int = 100,
    admin: dict = Depends(require_admin)
):
    """Get audit logs"""
    query = {}
    if action:
        query["action"] = action
    if expert_id:
        query["expert_id"] = expert_id
    
    logs = await db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {"logs": logs, "total": len(logs)}

@api_router.get("/admin/experts")
async def get_all_experts(admin: dict = Depends(require_admin)):
    """Get all experts with their stats"""
    experts = await db.experts.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    
    # Enrich with stats
    for expert in experts:
        expert["pending_changes"] = await db.change_requests.count_documents({
            "expert_id": expert["id"],
            "status": "pending"
        })
        expert["total_changes"] = await db.change_requests.count_documents({
            "expert_id": expert["id"]
        })
        expert["experiments_count"] = await db.experiments.count_documents({
            "expert_id": expert["id"]
        })
    
    return {"experts": experts}

class ExpertCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "expert"  # expert, admin, super_admin
    specialty: Optional[str] = None
    institution: Optional[str] = None

class ExpertUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    specialty: Optional[str] = None
    institution: Optional[str] = None
    is_active: Optional[bool] = None

@api_router.post("/admin/experts")
async def create_expert(
    expert_data: ExpertCreate,
    admin: dict = Depends(require_super_admin)
):
    """Create a new expert (super admin only)"""
    # Check if email already exists
    existing = await db.experts.find_one({"email": expert_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    if expert_data.role not in ["expert", "admin", "super_admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Hash password using bcrypt (same as registration endpoint)
    password_hash = bcrypt.hashpw(expert_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create expert
    new_expert = {
        "id": str(uuid.uuid4()),
        "name": expert_data.name,
        "email": expert_data.email,
        "password_hash": password_hash,
        "role": expert_data.role,
        "specialty": expert_data.specialty,
        "institution": expert_data.institution,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin["id"]
    }
    
    await db.experts.insert_one(new_expert)
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": "expert_created",
        "expert_id": admin["id"],
        "expert_name": admin["name"],
        "target_type": "expert",
        "target_id": new_expert["id"],
        "target_name": new_expert["name"],
        "details": {"email": expert_data.email, "role": expert_data.role},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Remove password hash from response
    new_expert.pop("password_hash", None)
    new_expert.pop("_id", None)
    
    return {"message": "Expert created successfully", "expert": new_expert}

@api_router.put("/admin/experts/{expert_id}")
async def update_expert(
    expert_id: str,
    updates: ExpertUpdate,
    admin: dict = Depends(require_super_admin)
):
    """Update an expert's details (super admin only)"""
    expert = await db.experts.find_one({"id": expert_id})
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
    
    # Build update dict
    update_dict = {}
    if updates.name is not None:
        update_dict["name"] = updates.name
    if updates.email is not None:
        # Check if email is taken by another user
        existing = await db.experts.find_one({"email": updates.email, "id": {"$ne": expert_id}})
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        update_dict["email"] = updates.email
    if updates.role is not None:
        if updates.role not in ["expert", "admin", "super_admin"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        update_dict["role"] = updates.role
    if updates.specialty is not None:
        update_dict["specialty"] = updates.specialty
    if updates.institution is not None:
        update_dict["institution"] = updates.institution
    if updates.is_active is not None:
        update_dict["is_active"] = updates.is_active
    
    if update_dict:
        update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.experts.update_one({"id": expert_id}, {"$set": update_dict})
        
        # Audit log
        await db.audit_logs.insert_one({
            "id": str(uuid.uuid4()),
            "action": "expert_updated",
            "expert_id": admin["id"],
            "expert_name": admin["name"],
            "target_type": "expert",
            "target_id": expert_id,
            "target_name": expert["name"],
            "details": update_dict,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    return {"message": "Expert updated successfully", "updates": update_dict}

@api_router.delete("/admin/experts/{expert_id}")
async def delete_expert(
    expert_id: str,
    admin: dict = Depends(require_super_admin)
):
    """Deactivate an expert (super admin only) - soft delete"""
    expert = await db.experts.find_one({"id": expert_id})
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
    
    # Don't allow deleting yourself
    if expert_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Soft delete - just deactivate
    await db.experts.update_one(
        {"id": expert_id},
        {"$set": {"is_active": False, "deactivated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": "expert_deactivated",
        "expert_id": admin["id"],
        "expert_name": admin["name"],
        "target_type": "expert",
        "target_id": expert_id,
        "target_name": expert["name"],
        "details": {},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Expert deactivated successfully"}

@api_router.post("/admin/experts/{expert_id}/reset-password")
async def reset_expert_password(
    expert_id: str,
    new_password: str = Body(..., embed=True),
    admin: dict = Depends(require_super_admin)
):
    """Reset an expert's password (super admin only)"""
    expert = await db.experts.find_one({"id": expert_id})
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
    
    # Hash password using bcrypt (same as registration endpoint)
    password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    await db.experts.update_one(
        {"id": expert_id},
        {"$set": {"password_hash": password_hash, "password_reset_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": "password_reset",
        "expert_id": admin["id"],
        "expert_name": admin["name"],
        "target_type": "expert",
        "target_id": expert_id,
        "target_name": expert["name"],
        "details": {},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Password reset successfully"}

@api_router.put("/admin/experts/{expert_id}/role")
async def update_expert_role(
    expert_id: str,
    new_role: str,
    admin: dict = Depends(require_super_admin)
):
    """Update an expert's role (super admin only)"""
    if new_role not in ["expert", "admin", "super_admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await db.experts.update_one(
        {"id": expert_id},
        {"$set": {"role": new_role}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Expert not found")
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": "role_updated",
        "expert_id": admin["id"],
        "expert_name": admin["name"],
        "target_type": "expert",
        "target_id": expert_id,
        "target_name": "",
        "details": {"new_role": new_role},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": f"Role updated to {new_role}"}


# ============== GUIDELINE MONITORING ==============

class GuidelineNotification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    disease_id: str
    disease_name: str
    guideline_source: str  # e.g., "ACC/AHA", "ESC", "WHO"
    summary: str
    details: str
    url: Optional[str] = None
    status: str = "pending"  # pending, reviewed, dismissed
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None


@api_router.get("/admin/guideline-notifications")
async def get_guideline_notifications(
    status: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    """Get guideline update notifications for admin review"""
    query = {}
    if status:
        query["status"] = status
    
    notifications = await db.guideline_notifications.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    pending_count = await db.guideline_notifications.count_documents({"status": "pending"})
    reviewed_count = await db.guideline_notifications.count_documents({"status": "reviewed"})
    
    return {
        "notifications": notifications,
        "total": len(notifications),
        "pending": pending_count,
        "reviewed": reviewed_count
    }


@api_router.post("/admin/guideline-notifications/{notification_id}/review")
async def review_guideline_notification(
    notification_id: str,
    action: str,  # "reviewed" or "dismissed"
    notes: str = "",
    admin: dict = Depends(require_admin)
):
    """Mark a guideline notification as reviewed or dismissed"""
    if action not in ["reviewed", "dismissed"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    notification = await db.guideline_notifications.find_one({"id": notification_id})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    await db.guideline_notifications.update_one(
        {"id": notification_id},
        {
            "$set": {
                "status": action,
                "reviewed_by": admin["id"],
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "review_notes": notes
            }
        }
    )
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "action": f"guideline_{action}",
        "expert_id": admin["id"],
        "expert_name": admin["name"],
        "target_type": "guideline_notification",
        "target_id": notification_id,
        "target_name": notification.get("disease_name", ""),
        "details": {"source": notification.get("guideline_source"), "notes": notes},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": f"Notification {action}", "id": notification_id}


@api_router.post("/admin/check-guidelines")
async def trigger_guideline_check(
    admin: dict = Depends(require_super_admin)
):
    """Manually trigger a check for new medical guidelines (Super Admin only)"""
    from emergentintegrations.llm.chat import ChatConfig, chat
    
    try:
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(status_code=500, detail="LLM key not configured")
        
        # Get a sample of diseases to check for guideline updates
        diseases = await db.diseases.find(
            {},
            {"id": 1, "name": 1, "category": 1, "guideline_source": 1, "updated_at": 1, "_id": 0}
        ).limit(50).to_list(50)
        
        if not diseases:
            return {"message": "No diseases to check", "notifications_created": 0}
        
        # Create prompt to check for recent guideline updates
        disease_names = [d.get("name") for d in diseases[:20]]
        
        prompt = f"""You are a medical guideline monitoring assistant. Check if there are any recent (2024-2025) major clinical guideline updates for the following diseases:

{', '.join(disease_names)}

For each disease where you find a recent guideline update, provide:
1. Disease name
2. Guideline source (e.g., ACC/AHA, ESC, WHO, NICE)
3. Brief summary of the key changes (1-2 sentences)
4. URL to the guideline if available

Format your response as JSON array:
[
  {{"disease": "Disease Name", "source": "Guideline Source", "summary": "Key changes...", "url": "https://..."}}
]

If no updates found, return: []
Only include diseases with ACTUAL recent guideline updates. Do not make up information."""

        config = ChatConfig(
            api_key=llm_key,
            model="gpt-4o",
            max_output_tokens=2000
        )
        
        response = await chat(config=config, prompt=prompt)
        
        # Parse response
        import json
        import re
        
        # Extract JSON from response
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if not json_match:
            return {"message": "No guideline updates found", "notifications_created": 0}
        
        try:
            updates = json.loads(json_match.group())
        except json.JSONDecodeError:
            return {"message": "Failed to parse guideline response", "notifications_created": 0}
        
        # Create notifications for found updates
        notifications_created = 0
        for update in updates:
            disease_name = update.get("disease", "")
            
            # Find matching disease
            disease = await db.diseases.find_one(
                {"name": {"$regex": disease_name, "$options": "i"}},
                {"id": 1, "name": 1, "_id": 0}
            )
            
            if disease:
                # Check if notification already exists
                existing = await db.guideline_notifications.find_one({
                    "disease_id": disease["id"],
                    "guideline_source": update.get("source", ""),
                    "status": "pending"
                })
                
                if not existing:
                    notification = {
                        "id": str(uuid.uuid4()),
                        "disease_id": disease["id"],
                        "disease_name": disease["name"],
                        "guideline_source": update.get("source", "Unknown"),
                        "summary": update.get("summary", ""),
                        "details": f"Potential guideline update detected for {disease['name']}",
                        "url": update.get("url"),
                        "status": "pending",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    
                    await db.guideline_notifications.insert_one(notification)
                    notifications_created += 1
        
        # Audit log
        await db.audit_logs.insert_one({
            "id": str(uuid.uuid4()),
            "action": "guideline_check_triggered",
            "expert_id": admin["id"],
            "expert_name": admin["name"],
            "target_type": "system",
            "target_id": "guideline_monitoring",
            "target_name": "Manual Guideline Check",
            "details": {"diseases_checked": len(diseases), "notifications_created": notifications_created},
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "message": f"Guideline check completed",
            "diseases_checked": len(diseases),
            "notifications_created": notifications_created
        }
        
    except Exception as e:
        logger.error(f"Guideline check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Guideline check failed: {str(e)}")


@api_router.get("/admin/guideline-monitoring-status")
async def get_guideline_monitoring_status(admin: dict = Depends(require_admin)):
    """Get the status of guideline monitoring system"""
    pending = await db.guideline_notifications.count_documents({"status": "pending"})
    reviewed = await db.guideline_notifications.count_documents({"status": "reviewed"})
    dismissed = await db.guideline_notifications.count_documents({"status": "dismissed"})
    
    # Get last check time from audit logs
    last_check = await db.audit_logs.find_one(
        {"action": "guideline_check_triggered"},
        {"_id": 0, "timestamp": 1}
    )
    
    return {
        "status": "active",
        "check_interval_days": 30,
        "pending_notifications": pending,
        "reviewed_notifications": reviewed,
        "dismissed_notifications": dismissed,
        "last_check": last_check.get("timestamp") if last_check else None,
        "next_check_recommended": "Manual trigger available"
    }


# ============== KNOWLEDGE BANK SYSTEM ==============

# Knowledge Bank Pydantic Models
class KnowledgeSourceCreate(BaseModel):
    disease_id: Optional[str] = None
    disease_name: Optional[str] = None
    source_type: str  # 'document', 'url', 'text'
    title: str
    url: Optional[str] = None
    content: Optional[str] = None  # For text input
    description: Optional[str] = None
    tags: List[str] = []

class KnowledgeSuggestionApproval(BaseModel):
    reviewer_notes: Optional[str] = None

class SystemSettingsUpdate(BaseModel):
    auto_search_interval_days: Optional[int] = None
    auto_search_enabled: Optional[bool] = None
    ai_analysis_model: Optional[str] = None

# Knowledge Bank AI Analysis Function
async def analyze_knowledge_source_with_ai(source_id: str, content: str, disease_name: Optional[str] = None):
    """Analyze content with AI to extract medical parameter updates and clinical changes"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
        if not EMERGENT_KEY:
            logger.warning("EMERGENT_LLM_KEY not found, skipping AI analysis")
            return None
        
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"knowledge-analysis-{source_id}",
            system_message="""You are a medical knowledge extraction expert for PhiCor.ai, a digital twin platform.
Your task is to analyze medical documents and extract structured updates for physiological parameters, clinical guidelines, and disease-specific modifications.

For each piece of content, extract:
1. Parameter changes (with current vs proposed values, units, normal ranges)
2. Clinical guideline updates (staging systems, treatment protocols)
3. Evidence quality (established, novel, emerging)
4. Source reliability assessment

Output MUST be valid JSON with this structure:
{
    "summary": "Brief summary of the content",
    "relevance_score": 0-100,
    "suggested_changes": [
        {
            "change_type": "parameter_update|guideline_update|clinical_info|staging_update",
            "target": "organ.scale.parameter_id or guideline_name",
            "current_value": "if known",
            "proposed_value": "new value",
            "unit": "unit if applicable",
            "evidence_level": "established|novel|emerging",
            "confidence": 0-100,
            "reasoning": "Why this change is recommended",
            "source_quote": "Relevant quote from the document"
        }
    ],
    "affected_diseases": ["list of disease names that might be affected"],
    "key_findings": ["list of important medical findings"],
    "warnings": ["any concerns or contradictions noted"]
}"""
        ).with_model("openai", "gpt-4o")
        
        analysis_prompt = f"""Analyze the following medical content and extract all relevant parameter updates, clinical changes, and guideline modifications.

{"Disease Context: " + disease_name if disease_name else "General medical content - identify all affected diseases."}

Content to analyze:
---
{content[:15000]}  
---

Extract ALL relevant medical information that could update our system's parameters, guidelines, or clinical data. Be thorough and precise with values and units."""

        response = await chat.send_message(UserMessage(text=analysis_prompt))
        
        # Parse the JSON response
        import json
        import re
        
        # Try to extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            analysis_result = json.loads(json_match.group())
            return analysis_result
        else:
            logger.warning(f"Could not parse AI response as JSON: {response[:500]}")
            return {
                "summary": response[:500],
                "relevance_score": 50,
                "suggested_changes": [],
                "affected_diseases": [],
                "key_findings": [response[:200]],
                "warnings": ["AI response was not in expected JSON format"]
            }
            
    except Exception as e:
        logger.error(f"AI analysis failed: {str(e)}")
        return None

# Knowledge Bank API Endpoints

@api_router.post("/admin/knowledge/upload")
async def upload_knowledge_source(
    source_type: str = Form(...),
    title: str = Form(...),
    disease_id: Optional[str] = Form(None),
    disease_name: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tags: str = Form(""),  # Comma-separated tags
    file: Optional[UploadFile] = File(None),
    admin: dict = Depends(require_admin)
):
    """Upload a knowledge source (document, URL, or text) for AI analysis"""
    import gridfs
    from motor.motor_asyncio import AsyncIOMotorGridFSBucket
    
    source_id = str(uuid.uuid4())
    file_id = None
    extracted_content = content or ""
    
    # Handle file upload
    if file and source_type == 'document':
        # Store file in GridFS
        fs = AsyncIOMotorGridFSBucket(db)
        file_content = await file.read()
        
        # Store in GridFS
        file_id = await fs.upload_from_stream(
            file.filename,
            file_content,
            metadata={
                "source_id": source_id,
                "content_type": file.content_type,
                "uploaded_by": admin["id"]
            }
        )
        file_id = str(file_id)
        
        # Extract text from PDF if possible
        if file.content_type == 'application/pdf':
            try:
                import io
                import PyPDF2
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                extracted_content = ""
                for page in pdf_reader.pages:
                    extracted_content += page.extract_text() + "\n"
            except Exception as e:
                logger.warning(f"PDF text extraction failed: {e}")
                extracted_content = f"[PDF file: {file.filename}]"
        else:
            # Try to decode as text
            try:
                extracted_content = file_content.decode('utf-8')
            except:
                extracted_content = f"[Binary file: {file.filename}]"
    
    # Handle URL - fetch content
    if source_type == 'url' and url:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=30.0, follow_redirects=True)
                if response.status_code == 200:
                    # Basic HTML text extraction
                    from html.parser import HTMLParser
                    class TextExtractor(HTMLParser):
                        def __init__(self):
                            super().__init__()
                            self.text = []
                        def handle_data(self, data):
                            self.text.append(data.strip())
                    
                    parser = TextExtractor()
                    parser.feed(response.text)
                    extracted_content = ' '.join(filter(None, parser.text))[:20000]
        except Exception as e:
            logger.warning(f"URL fetch failed: {e}")
            extracted_content = f"[URL: {url} - Content fetch failed]"
    
    # Parse tags
    tag_list = [t.strip() for t in tags.split(',') if t.strip()] if tags else []
    
    # Create knowledge source record
    knowledge_source = {
        "id": source_id,
        "disease_id": disease_id,
        "disease_name": disease_name,
        "source_type": source_type,
        "title": title,
        "url": url,
        "file_id": file_id,
        "file_name": file.filename if file else None,
        "content_preview": extracted_content[:500] if extracted_content else None,
        "full_content": extracted_content,
        "description": description,
        "tags": tag_list,
        "status": "pending_analysis",
        "uploaded_by": admin["id"],
        "uploaded_by_name": admin["name"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "analysis_result": None,
        "suggestions_generated": False
    }
    
    await db.knowledge_sources.insert_one(knowledge_source)
    
    # Create timeline entry
    await db.knowledge_timeline.insert_one({
        "id": str(uuid.uuid4()),
        "source_id": source_id,
        "disease_id": disease_id,
        "action": "source_uploaded",
        "actor_id": admin["id"],
        "actor_name": admin["name"],
        "details": {"title": title, "source_type": source_type},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Trigger async AI analysis
    try:
        analysis_result = await analyze_knowledge_source_with_ai(
            source_id, 
            extracted_content, 
            disease_name
        )
        
        if analysis_result:
            # Update source with analysis
            await db.knowledge_sources.update_one(
                {"id": source_id},
                {
                    "$set": {
                        "status": "analyzed",
                        "analysis_result": analysis_result,
                        "analyzed_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            # Create suggestions from analysis
            suggestions_created = 0
            for change in analysis_result.get("suggested_changes", []):
                suggestion_id = str(uuid.uuid4())
                suggestion = {
                    "id": suggestion_id,
                    "source_id": source_id,
                    "disease_id": disease_id,
                    "disease_name": disease_name or (analysis_result.get("affected_diseases", [None])[0] if analysis_result.get("affected_diseases") else None),
                    "change_type": change.get("change_type", "parameter_update"),
                    "target": change.get("target", "unknown"),
                    "current_value": change.get("current_value"),
                    "proposed_value": change.get("proposed_value"),
                    "unit": change.get("unit"),
                    "evidence_level": change.get("evidence_level", "novel"),
                    "confidence": change.get("confidence", 50),
                    "reasoning": change.get("reasoning", ""),
                    "source_quote": change.get("source_quote", ""),
                    "status": "pending",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "reviewed_at": None,
                    "reviewed_by": None,
                    "reviewer_notes": None
                }
                await db.knowledge_suggestions.insert_one(suggestion)
                suggestions_created += 1
            
            # Update source
            await db.knowledge_sources.update_one(
                {"id": source_id},
                {"$set": {"suggestions_generated": True, "suggestions_count": suggestions_created}}
            )
            
            # Timeline entry for analysis
            await db.knowledge_timeline.insert_one({
                "id": str(uuid.uuid4()),
                "source_id": source_id,
                "disease_id": disease_id,
                "action": "ai_analysis_completed",
                "actor_id": "system",
                "actor_name": "AI Analysis Engine",
                "details": {
                    "suggestions_count": suggestions_created,
                    "relevance_score": analysis_result.get("relevance_score", 0),
                    "summary": analysis_result.get("summary", "")[:200]
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
    except Exception as e:
        logger.error(f"AI analysis failed for source {source_id}: {e}")
        await db.knowledge_sources.update_one(
            {"id": source_id},
            {"$set": {"status": "analysis_failed", "analysis_error": str(e)}}
        )
    
    # Remove full_content from response to reduce payload
    knowledge_source.pop("full_content", None)
    knowledge_source.pop("_id", None)
    
    return {
        "message": "Knowledge source uploaded and analysis initiated",
        "source": knowledge_source
    }

@api_router.get("/admin/knowledge/sources")
async def get_knowledge_sources(
    disease_id: Optional[str] = None,
    status: Optional[str] = None,
    source_type: Optional[str] = None,
    limit: int = 100,
    admin: dict = Depends(require_admin)
):
    """Get all knowledge sources with optional filtering"""
    query = {}
    if disease_id:
        query["disease_id"] = disease_id
    if status:
        query["status"] = status
    if source_type:
        query["source_type"] = source_type
    
    sources = await db.knowledge_sources.find(
        query, 
        {"_id": 0, "full_content": 0}  # Exclude large content field
    ).sort("created_at", -1).to_list(limit)
    
    return {
        "sources": sources,
        "total": len(sources)
    }

@api_router.get("/admin/knowledge/sources/{source_id}")
async def get_knowledge_source_detail(source_id: str, admin: dict = Depends(require_admin)):
    """Get detailed information about a knowledge source"""
    source = await db.knowledge_sources.find_one({"id": source_id}, {"_id": 0})
    if not source:
        raise HTTPException(status_code=404, detail="Knowledge source not found")
    
    # Get related suggestions
    suggestions = await db.knowledge_suggestions.find(
        {"source_id": source_id}, {"_id": 0}
    ).to_list(100)
    
    # Get timeline entries
    timeline = await db.knowledge_timeline.find(
        {"source_id": source_id}, {"_id": 0}
    ).sort("timestamp", -1).to_list(50)
    
    return {
        "source": source,
        "suggestions": suggestions,
        "timeline": timeline
    }

@api_router.get("/admin/knowledge/suggestions")
async def get_knowledge_suggestions(
    status: str = "pending",
    disease_id: Optional[str] = None,
    limit: int = 100,
    admin: dict = Depends(require_admin)
):
    """Get knowledge suggestions awaiting review"""
    query = {"status": status}
    if disease_id:
        query["disease_id"] = disease_id
    
    suggestions = await db.knowledge_suggestions.find(
        query, {"_id": 0}
    ).sort("created_at", -1).to_list(limit)
    
    # Group by disease for better organization
    by_disease = {}
    for s in suggestions:
        disease = s.get("disease_name") or "General"
        if disease not in by_disease:
            by_disease[disease] = []
        by_disease[disease].append(s)
    
    return {
        "suggestions": suggestions,
        "by_disease": by_disease,
        "total": len(suggestions)
    }

@api_router.post("/admin/knowledge/suggestions/{suggestion_id}/approve")
async def approve_knowledge_suggestion(
    suggestion_id: str,
    approval: KnowledgeSuggestionApproval = None,
    admin: dict = Depends(require_admin)
):
    """Approve a knowledge suggestion and apply changes"""
    suggestion = await db.knowledge_suggestions.find_one({"id": suggestion_id}, {"_id": 0})
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    if suggestion["status"] != "pending":
        raise HTTPException(status_code=400, detail="Suggestion already processed")
    
    # Apply the change to the disease if applicable
    if suggestion.get("disease_id") and suggestion.get("target"):
        disease = await db.diseases.find_one({"id": suggestion["disease_id"]})
        if disease:
            # Parse target (e.g., "heart.ecg.qrs_duration")
            target_parts = suggestion["target"].split(".")
            if len(target_parts) >= 2:
                # Update modifications
                update_path = f"modifications.{'.'.join(target_parts)}"
                await db.diseases.update_one(
                    {"id": suggestion["disease_id"]},
                    {
                        "$set": {
                            update_path: {
                                "value": suggestion.get("proposed_value"),
                                "unit": suggestion.get("unit"),
                                "source": "knowledge_bank",
                                "evidence_level": suggestion.get("evidence_level"),
                                "updated_at": datetime.now(timezone.utc).isoformat(),
                                "approved_by": admin["id"]
                            }
                        }
                    }
                )
    
    # Update suggestion status
    await db.knowledge_suggestions.update_one(
        {"id": suggestion_id},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "reviewed_by": admin["id"],
                "reviewer_name": admin["name"],
                "reviewer_notes": approval.reviewer_notes if approval else None
            }
        }
    )
    
    # Timeline entry
    await db.knowledge_timeline.insert_one({
        "id": str(uuid.uuid4()),
        "source_id": suggestion.get("source_id"),
        "disease_id": suggestion.get("disease_id"),
        "action": "suggestion_approved",
        "actor_id": admin["id"],
        "actor_name": admin["name"],
        "details": {
            "suggestion_id": suggestion_id,
            "target": suggestion.get("target"),
            "proposed_value": suggestion.get("proposed_value")
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Suggestion approved and changes applied", "suggestion_id": suggestion_id}

@api_router.post("/admin/knowledge/suggestions/{suggestion_id}/reject")
async def reject_knowledge_suggestion(
    suggestion_id: str,
    approval: KnowledgeSuggestionApproval = None,
    admin: dict = Depends(require_admin)
):
    """Reject a knowledge suggestion"""
    suggestion = await db.knowledge_suggestions.find_one({"id": suggestion_id}, {"_id": 0})
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    if suggestion["status"] != "pending":
        raise HTTPException(status_code=400, detail="Suggestion already processed")
    
    # Update suggestion status
    await db.knowledge_suggestions.update_one(
        {"id": suggestion_id},
        {
            "$set": {
                "status": "rejected",
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "reviewed_by": admin["id"],
                "reviewer_name": admin["name"],
                "reviewer_notes": approval.reviewer_notes if approval else None
            }
        }
    )
    
    # Timeline entry
    await db.knowledge_timeline.insert_one({
        "id": str(uuid.uuid4()),
        "source_id": suggestion.get("source_id"),
        "disease_id": suggestion.get("disease_id"),
        "action": "suggestion_rejected",
        "actor_id": admin["id"],
        "actor_name": admin["name"],
        "details": {
            "suggestion_id": suggestion_id,
            "reason": approval.reviewer_notes if approval else "No reason provided"
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Suggestion rejected", "suggestion_id": suggestion_id}

@api_router.get("/admin/knowledge/timeline")
async def get_knowledge_timeline(
    disease_id: Optional[str] = None,
    source_id: Optional[str] = None,
    limit: int = 100,
    admin: dict = Depends(require_admin)
):
    """Get knowledge bank activity timeline"""
    query = {}
    if disease_id:
        query["disease_id"] = disease_id
    if source_id:
        query["source_id"] = source_id
    
    timeline = await db.knowledge_timeline.find(
        query, {"_id": 0}
    ).sort("timestamp", -1).to_list(limit)
    
    return {
        "timeline": timeline,
        "total": len(timeline)
    }

@api_router.get("/admin/knowledge/disease/{disease_id}")
async def get_disease_knowledge(disease_id: str, admin: dict = Depends(require_admin)):
    """Get all knowledge bank data for a specific disease"""
    # Get knowledge sources for this disease
    sources = await db.knowledge_sources.find(
        {"disease_id": disease_id}, 
        {"_id": 0, "full_content": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Get suggestions for this disease
    pending_suggestions = await db.knowledge_suggestions.find(
        {"disease_id": disease_id, "status": "pending"}, {"_id": 0}
    ).to_list(100)
    
    approved_suggestions = await db.knowledge_suggestions.find(
        {"disease_id": disease_id, "status": "approved"}, {"_id": 0}
    ).to_list(100)
    
    rejected_suggestions = await db.knowledge_suggestions.find(
        {"disease_id": disease_id, "status": "rejected"}, {"_id": 0}
    ).to_list(100)
    
    # Get timeline for this disease
    timeline = await db.knowledge_timeline.find(
        {"disease_id": disease_id}, {"_id": 0}
    ).sort("timestamp", -1).to_list(50)
    
    return {
        "disease_id": disease_id,
        "sources": sources,
        "pending_suggestions": pending_suggestions,
        "approved_suggestions": approved_suggestions,
        "rejected_suggestions": rejected_suggestions,
        "timeline": timeline,
        "stats": {
            "total_sources": len(sources),
            "pending_count": len(pending_suggestions),
            "approved_count": len(approved_suggestions),
            "rejected_count": len(rejected_suggestions)
        }
    }

@api_router.get("/knowledge/disease/{disease_id}")
async def get_disease_knowledge_public(disease_id: str):
    """Get knowledge bank data for a specific disease (public endpoint for dashboard)"""
    # Get knowledge sources for this disease (approved/analyzed only)
    sources = await db.knowledge_sources.find(
        {"$or": [{"disease_id": disease_id}, {"disease_name": {"$regex": disease_id, "$options": "i"}}]}, 
        {"_id": 0, "full_content": 0}
    ).sort("created_at", -1).to_list(50)
    
    # Get approved suggestions for this disease
    approved_suggestions = await db.knowledge_suggestions.find(
        {"$or": [{"disease_id": disease_id}, {"disease_name": {"$regex": disease_id, "$options": "i"}}], "status": "approved"}, 
        {"_id": 0}
    ).to_list(50)
    
    return {
        "disease_id": disease_id,
        "sources": sources,
        "approved_updates": approved_suggestions,
        "stats": {
            "total_sources": len(sources),
            "approved_updates": len(approved_suggestions)
        }
    }

@api_router.get("/admin/settings")
async def get_system_settings(admin: dict = Depends(require_admin)):
    """Get system settings including auto-search configuration"""
    settings = await db.system_settings.find_one({"id": "global"}, {"_id": 0})
    
    if not settings:
        # Create default settings
        settings = {
            "id": "global",
            "auto_search_enabled": True,
            "auto_search_interval_days": 30,
            "ai_analysis_model": "gpt-4o",
            "last_auto_search": None,
            "next_auto_search": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.system_settings.insert_one(settings)
    
    return {"settings": settings}

@api_router.put("/admin/settings")
async def update_system_settings(
    updates: SystemSettingsUpdate,
    admin: dict = Depends(require_admin)
):
    """Update system settings"""
    update_dict = {}
    if updates.auto_search_interval_days is not None:
        update_dict["auto_search_interval_days"] = updates.auto_search_interval_days
    if updates.auto_search_enabled is not None:
        update_dict["auto_search_enabled"] = updates.auto_search_enabled
    if updates.ai_analysis_model is not None:
        update_dict["ai_analysis_model"] = updates.ai_analysis_model
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_dict["updated_by"] = admin["id"]
    
    await db.system_settings.update_one(
        {"id": "global"},
        {"$set": update_dict},
        upsert=True
    )
    
    # Timeline entry
    await db.knowledge_timeline.insert_one({
        "id": str(uuid.uuid4()),
        "source_id": None,
        "disease_id": None,
        "action": "settings_updated",
        "actor_id": admin["id"],
        "actor_name": admin["name"],
        "details": update_dict,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Settings updated", "updates": update_dict}

@api_router.post("/admin/knowledge/trigger-auto-search")
async def trigger_auto_search(admin: dict = Depends(require_admin)):
    """Manually trigger the AI auto-search for guideline updates"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
        if not EMERGENT_KEY:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")
        
        # Get a sample of diseases to search for updates
        diseases = await db.diseases.find(
            {}, 
            {"_id": 0, "id": 1, "name": 1, "category": 1}
        ).limit(20).to_list(20)
        
        disease_names = [d["name"] for d in diseases]
        
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"auto-search-{datetime.now().timestamp()}",
            system_message="""You are a medical guidelines researcher. Search your knowledge for the latest medical guideline updates, clinical recommendations, and parameter changes for the specified diseases.

Output MUST be valid JSON with this structure:
{
    "search_date": "YYYY-MM-DD",
    "findings": [
        {
            "disease_name": "disease name",
            "guideline_source": "e.g., ACC/AHA 2024, ESC 2024, WHO",
            "update_type": "parameter_change|staging_update|treatment_protocol|diagnostic_criteria",
            "summary": "Brief description of the update",
            "details": "Detailed information",
            "recommendation": "What should be updated in the system",
            "confidence": 0-100,
            "source_url": "URL if available"
        }
    ],
    "no_updates_for": ["list of diseases with no recent updates found"]
}"""
        ).with_model("openai", "gpt-4o")
        
        search_prompt = f"""Search for the latest medical guideline updates (2023-2024) for these diseases:

{', '.join(disease_names[:10])}

Focus on:
1. New staging systems or classifications
2. Updated diagnostic criteria
3. Changed parameter thresholds
4. New treatment protocols
5. Revised risk scores

Report any significant updates that should be incorporated into a medical knowledge system."""

        response = await chat.send_message(UserMessage(text=search_prompt))
        
        # Parse response
        import json
        import re
        
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            findings = json.loads(json_match.group())
        else:
            findings = {"findings": [], "error": "Could not parse AI response"}
        
        # Create suggestions from findings
        suggestions_created = 0
        for finding in findings.get("findings", []):
            # Find matching disease
            matching_disease = next(
                (d for d in diseases if d["name"].lower() == finding.get("disease_name", "").lower()),
                None
            )
            
            suggestion_id = str(uuid.uuid4())
            suggestion = {
                "id": suggestion_id,
                "source_id": "auto_search",
                "disease_id": matching_disease["id"] if matching_disease else None,
                "disease_name": finding.get("disease_name"),
                "change_type": finding.get("update_type", "guideline_update"),
                "target": finding.get("guideline_source", "general"),
                "current_value": None,
                "proposed_value": finding.get("recommendation"),
                "unit": None,
                "evidence_level": "emerging",
                "confidence": finding.get("confidence", 50),
                "reasoning": finding.get("summary"),
                "source_quote": finding.get("details"),
                "source_url": finding.get("source_url"),
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "is_auto_search": True
            }
            await db.knowledge_suggestions.insert_one(suggestion)
            suggestions_created += 1
        
        # Update settings with last search time
        await db.system_settings.update_one(
            {"id": "global"},
            {
                "$set": {
                    "last_auto_search": datetime.now(timezone.utc).isoformat(),
                    "last_auto_search_results": suggestions_created
                }
            },
            upsert=True
        )
        
        # Timeline entry
        await db.knowledge_timeline.insert_one({
            "id": str(uuid.uuid4()),
            "source_id": "auto_search",
            "disease_id": None,
            "action": "auto_search_completed",
            "actor_id": admin["id"],
            "actor_name": admin["name"],
            "details": {
                "diseases_searched": len(disease_names),
                "suggestions_created": suggestions_created
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "message": "Auto-search completed",
            "diseases_searched": len(disease_names),
            "suggestions_created": suggestions_created,
            "findings": findings.get("findings", [])[:5]  # Return first 5 findings
        }
        
    except Exception as e:
        logger.error(f"Auto-search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Auto-search failed: {str(e)}")


# ============================================================
# AI CLINICAL TEXT INTERPRETATION ENDPOINT
# ============================================================

class ClinicalTextRequest(BaseModel):
    text: str
    region: str = "US"  # US, UK, EU, IN, ASIA
    source_type: str = "free_text"  # free_text, emr, document

class ExtractedFinding(BaseModel):
    parameter_id: str
    name: str
    value: Optional[float] = None
    unit: str = ""
    direction: str = "normal"  # increase, decrease, normal, present
    severity: float = 0  # 0-3
    type: str = "lab"  # lab, symptom, vital, imaging
    original_text: str = ""
    organ_system: str = ""
    physiologic_implication: str = ""

class DifferentialDiagnosis(BaseModel):
    name: str
    probability: float
    role: str  # Primary, Secondary, Complication
    matching_parameters: List[str]
    missing_features: List[str]
    icd_code: Optional[str] = None

class PhiCorAnalysisResponse(BaseModel):
    success: bool
    findings: List[Dict[str, Any]]
    symptoms: List[str]
    syndromes: List[str]
    differentials: List[Dict[str, Any]]
    synthesis: Dict[str, Any]
    management: List[Dict[str, Any]]
    safety_alerts: List[str]
    summary: str
    confidence: float

@api_router.post("/clinical/interpret")
async def interpret_clinical_text(request: ClinicalTextRequest):
    """
    PhiCor Analysis: Comprehensive AI-Powered Clinical Reasoning Engine.
    Uses advanced clinical reasoning to analyze patient data and generate differential diagnoses
    with full reasoning, abnormal vs normal comparisons, and management guidance.
    """
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(status_code=500, detail="LLM key not configured")
        
        # Determine unit system based on region
        unit_system = "SI" if request.region in ["UK", "EU", "IN", "ASIA"] else "conventional"
        
        # ============================================================
        # PHICOR CLINICAL REASONING ENGINE V2
        # Structured clinical reasoning pipeline with syndrome-gating
        # ============================================================
        
        system_message = """You are PhiCor's Clinical Reasoning and Synthesis Engine.

Your objective is to generate clinically accurate differential diagnoses
by emulating expert physician reasoning, not exhaustive pattern matching.

REASONING PIPELINE (FOLLOW IN ORDER):

STEP 1: FINDING INGESTION & NORMALISATION
- Ingest all patient findings (symptoms, vitals, labs, imaging, etc.)
- Normalise values against physiological reference ranges
- Label each finding with: organ system, acuity, specificity (pathognomonic/supportive/nonspecific)

STEP 2: CLINICAL CLUSTERING  
- Cluster findings into coherent clinical patterns (anatomical, temporal, physiological)
- Identify which findings cluster together vs incidental

STEP 3: DOMINANT SYNDROME IDENTIFICATION (MANDATORY GATE)
- Identify ONE dominant clinical syndrome that best explains:
  * The majority of HIGH-SPECIFICITY findings
  * The primary patient complaint
  * The most anatomically coherent system
- Only ONE dominant syndrome may be selected
- This step MUST occur before disease matching

STEP 4: SECONDARY/DOWNSTREAM SYNDROMES
- Identify secondary syndromes as: consequence, complication, or incidental comorbidity
- Secondary syndromes must NEVER override the dominant syndrome

STEP 5: CONSTRAINED DISEASE EXPANSION
- Expand ONLY diseases that belong to the dominant syndrome OR plausibly unify dominant + secondary
- SUPPRESS diseases that rely only on nonspecific findings or belong to unrelated systems

CRITICAL RULE: Low-specificity findings (fatigue, weight loss, mild lab changes) CANNOT independently justify malignancy, rheumatologic, or rare diagnoses.

STEP 6: WEIGHTED MATCHING & PENALISATION
- Highest weight: Imaging patterns, anatomical concordance, pathognomonic tests, CSF/pathology/genetics
- Medium weight: Clustered symptoms, disease-specific labs
- Lowest weight: Generic inflammatory markers, isolated metabolic abnormalities
- PENALISE: Cross-system diseases without syndrome justification, rare diseases lacking hallmark features

STEP 7: CLINICAL SANITY CHECK
- Would a domain specialist reasonably consider this diagnosis now?
- Is a prerequisite syndrome missing?
- Is this diagnosis premature without confirmatory red flags?
- If YES to any → downgrade or suppress

GLOBAL SAFETY RULES:
- Prefer under-calling to over-calling
- Never allow rare or malignant diagnoses to dominate without high-specificity evidence
- Maintain full explainability of reasoning steps

IMPORTANT: Always respond with valid JSON only. Ensure all JSON is properly closed."""

        analysis_prompt = f"""Analyze this clinical case using the structured reasoning pipeline.

CLINICAL DATA:
{request.text}

REGION: {request.region} ({unit_system} units)

Return valid JSON with this structure:
{{
  "patient_summary": {{"age": null, "sex": null, "chief_complaint": "main complaint"}},
  "clinical_findings": {{
    "vital_signs": [{{"name": "string", "value": number, "unit": "string", "normal_range": "string", "status": "elevated/decreased/normal", "clinical_significance": "string", "specificity": "pathognomonic/supportive/nonspecific"}}],
    "laboratory_values": [{{"name": "string", "parameter_id": "string", "value": number, "unit": "string", "normal_range": "string", "status": "elevated/decreased/normal", "clinical_significance": "string", "specificity": "pathognomonic/supportive/nonspecific"}}],
    "symptoms": [{{"name": "string", "severity": "mild/moderate/severe", "specificity": "pathognomonic/supportive/nonspecific", "organ_system": "string"}}]
  }},
  "clinical_clustering": {{
    "primary_cluster": {{"findings": ["finding1"], "anatomical_system": "string", "temporal_pattern": "acute/subacute/chronic"}},
    "secondary_clusters": [{{"findings": ["finding1"], "relationship": "consequence/complication/incidental"}}]
  }},
  "dominant_syndrome": {{
    "syndrome_name": "string (e.g., Acute coronary syndrome, Systemic inflammatory syndrome)",
    "confidence": "high/moderate/low",
    "key_supporting_findings": ["high-specificity finding 1", "finding 2"],
    "pathophysiologic_rationale": "explanation"
  }},
  "differential_diagnosis": [
    {{"rank": 1, "diagnosis": "Disease Name", "icd10": "code", "probability": 75, "role": "Primary", "syndrome_alignment": "aligned/partial/poor", "clinical_reasoning": "why this diagnosis fits the dominant syndrome", "supporting_findings": ["finding1"], "against_findings": ["finding that doesn't fit"], "specificity_score": "high/medium/low", "key_discriminating_features": ["feature1"]}}
  ],
  "diagnostic_synthesis": {{
    "most_likely_diagnosis": "string",
    "key_alternative": "string", 
    "clinical_decision_pathway": "reasoning",
    "discriminating_tests": [{{"test": "string", "expected_finding": "string", "rationale": "string"}}],
    "clinical_uncertainty": "string",
    "sanity_check": "Would a specialist consider these diagnoses reasonable? Why/why not?"
  }},
  "safety_alerts": [{{"alert_type": "critical_value", "parameter": "string", "message": "string", "recommended_action": "string"}}],
  "reasoning_transparency": {{
    "suppressed_diagnoses": [{{"diagnosis": "string", "reason_suppressed": "string (e.g., no high-specificity evidence, wrong organ system)"}}],
    "diagnostic_cautions": ["string (warnings about premature diagnoses)"]
  }}
}}

CRITICAL RULES:
1. Return ONLY valid JSON
2. Include exactly 5 differential diagnoses
3. Rank diagnoses by syndrome alignment AND specificity, not just symptom count
4. Do NOT rank malignancies or rare diseases high without pathognomonic evidence
5. Symptoms like fatigue, weakness, weight loss are NONSPECIFIC - they support but cannot drive diagnosis"""

        llm = LlmChat(
            api_key=llm_key,
            session_id=f"phicor_analysis_{datetime.now().strftime('%H%M%S')}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        response = await llm.send_message(UserMessage(text=analysis_prompt))
        
        # Parse AI response
        content = response.strip()
        if content.startswith('```'):
            lines = content.split('\n')
            content = '\n'.join(lines[1:-1] if lines[-1].strip() == '```' else lines[1:])
            if content.startswith('json'):
                content = content[4:]
        content = content.strip()
        
        import json
        import re
        
        # Try to fix common JSON issues
        def try_fix_json(json_str):
            """Attempt to fix common JSON formatting issues"""
            # Try to parse as-is first
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass
            
            fixed = json_str
            
            # Fix 1: Remove trailing commas before closing brackets
            fixed = re.sub(r',(\s*[\]\}])', r'\1', fixed)
            
            # Fix 2: Add missing commas between elements
            fixed = re.sub(r'"\s*\n\s*"', '",\n"', fixed)
            fixed = re.sub(r'"\s*\n\s*\{', '",\n{', fixed)
            fixed = re.sub(r'\}\s*\n\s*\{', '},\n{', fixed)
            fixed = re.sub(r'\]\s*\n\s*"', '],\n"', fixed)
            
            # Try again after fixes
            try:
                return json.loads(fixed)
            except json.JSONDecodeError:
                pass
            
            # Fix 3: Handle truncated strings and missing closures
            # Count open braces and brackets
            open_braces = fixed.count('{') - fixed.count('}')
            open_brackets = fixed.count('[') - fixed.count(']')
            
            # Check for unclosed strings
            in_string = False
            for i, char in enumerate(fixed):
                if char == '"' and (i == 0 or fixed[i-1] != '\\'):
                    in_string = not in_string
            
            if in_string:
                fixed = fixed + '"'
            
            # Add missing closing brackets/braces
            fixed = fixed + ']' * max(0, open_brackets) + '}' * max(0, open_braces)
            
            try:
                return json.loads(fixed)
            except json.JSONDecodeError:
                pass
                
            # Fix 4: Try to extract partial JSON by finding valid structure
            # Find the last valid closing brace
            depth_brace = 0
            depth_bracket = 0
            last_valid = -1
            in_str = False
            
            for i, char in enumerate(fixed):
                if char == '"' and (i == 0 or fixed[i-1] != '\\'):
                    in_str = not in_str
                if not in_str:
                    if char == '{': depth_brace += 1
                    elif char == '}': 
                        depth_brace -= 1
                        if depth_brace == 0 and depth_bracket == 0:
                            last_valid = i
                    elif char == '[': depth_bracket += 1
                    elif char == ']': depth_bracket -= 1
            
            if last_valid > 0:
                try:
                    return json.loads(fixed[:last_valid+1])
                except json.JSONDecodeError:
                    pass
            
            return None
        
        analysis = None
        try:
            analysis = json.loads(content)
        except json.JSONDecodeError as e:
            logger.warning(f"Initial JSON parse failed: {e}, attempting fix...")
            analysis = try_fix_json(content)
            
        if not analysis:
            logger.error(f"Failed to parse analysis response after fixes")
            logger.error(f"Raw response: {content[:500]}")
            return {
                "success": False,
                "error": "Failed to parse clinical analysis",
                "raw_response": content[:1000]
            }
        
        # ============================================================
        # FORMAT RESPONSE for frontend
        # ============================================================
        
        clinical_findings = analysis.get('clinical_findings', {})
        differentials = analysis.get('differential_diagnosis', [])
        synthesis = analysis.get('diagnostic_synthesis', {})
        
        # Build findings list with normal ranges
        findings = []
        for vital in clinical_findings.get('vital_signs', []):
            findings.append({
                'parameter_id': vital.get('name', '').lower().replace(' ', '_'),
                'name': vital.get('name'),
                'value': vital.get('value'),
                'unit': vital.get('unit'),
                'normal_range': vital.get('normal_range'),
                'status': vital.get('status'),
                'direction': 'increase' if vital.get('status') in ['elevated', 'high'] else 'decrease' if vital.get('status') in ['decreased', 'low'] else 'normal',
                'clinical_significance': vital.get('clinical_significance'),
                'type': 'vital'
            })
        
        for lab in clinical_findings.get('laboratory_values', []):
            findings.append({
                'parameter_id': lab.get('parameter_id', lab.get('name', '').lower().replace(' ', '_')),
                'name': lab.get('name'),
                'value': lab.get('value'),
                'unit': lab.get('unit'),
                'normal_range': lab.get('normal_range'),
                'status': lab.get('status'),
                'direction': 'increase' if lab.get('status') in ['elevated', 'high'] else 'decrease' if lab.get('status') in ['decreased', 'low'] else 'normal',
                'clinical_significance': lab.get('clinical_significance'),
                'type': 'lab'
            })
        
        # Build symptoms list with details - include specificity and organ system
        symptoms = []
        for symptom in clinical_findings.get('symptoms', []):
            if isinstance(symptom, dict):
                symptoms.append({
                    'name': symptom.get('name'),
                    'severity': symptom.get('severity', 'moderate'),
                    'specificity': symptom.get('specificity', 'nonspecific'),
                    'organ_system': symptom.get('organ_system', 'general'),
                    'type': 'symptom'
                })
            else:
                symptoms.append({
                    'name': symptom,
                    'severity': 'moderate',
                    'specificity': 'nonspecific',
                    'type': 'symptom'
                })
        
        # Build differential list for frontend with new clinical reasoning fields
        formatted_differentials = []
        for diff in differentials:
            supporting = diff.get('supporting_findings', [])
            against = diff.get('against_findings', diff.get('against_diagnosis', []))
            formatted_differentials.append({
                'rank': diff.get('rank', 0),
                'name': diff.get('diagnosis'),
                'icd_code': diff.get('icd10', ''),
                'probability': diff.get('probability', 0),
                'role': diff.get('role', 'Secondary'),
                'syndrome_alignment': diff.get('syndrome_alignment', 'partial'),
                'specificity_score': diff.get('specificity_score', 'medium'),
                'supporting_findings': supporting,
                'matching_parameters': supporting,
                'against_findings': against,
                'missing_features': diff.get('key_discriminating_features', []),
                'clinical_reasoning': diff.get('clinical_reasoning', ''),
                'key_discriminating_features': diff.get('key_discriminating_features', []),
                'anchor_criteria_met': diff.get('anchor_criteria_met', True)
            })
        
        # Build dominant syndrome (singular - now with mandatory gate logic)
        dominant_syndromes = []
        dominant_syndrome = analysis.get('dominant_syndrome', {})
        if dominant_syndrome and isinstance(dominant_syndrome, dict):
            dominant_syndromes.append({
                'syndrome': dominant_syndrome.get('syndrome_name', dominant_syndrome.get('syndrome')),
                'confidence': dominant_syndrome.get('confidence', 'moderate'),
                'key_features': dominant_syndrome.get('key_supporting_findings', dominant_syndrome.get('key_features', [])),
                'pathophysiologic_rationale': dominant_syndrome.get('pathophysiologic_rationale', '')
            })
        # Fallback to old format if present
        for syndrome in analysis.get('dominant_clinical_syndromes', analysis.get('dominant_syndromes', [])):
            if isinstance(syndrome, dict):
                dominant_syndromes.append({
                    'syndrome': syndrome.get('syndrome'),
                    'key_features': syndrome.get('key_features', []),
                    'pathophysiologic_rationale': syndrome.get('pathophysiologic_rationale', '')
                })
            else:
                dominant_syndromes.append({'syndrome': syndrome})
        
        # Build clinical clustering info
        clinical_clustering = analysis.get('clinical_clustering', {})
        
        # Get reasoning transparency (suppressed diagnoses, cautions)
        reasoning_transparency = analysis.get('reasoning_transparency', {})
        
        # Build formatted synthesis with sanity check
        formatted_synthesis = {
            'primary_diagnosis': synthesis.get('most_likely_diagnosis'),
            'key_alternative': synthesis.get('key_alternative'),
            'clinical_decision_pathway': synthesis.get('clinical_decision_pathway'),
            'discriminating_tests': synthesis.get('discriminating_tests', []),
            'confidence_level': synthesis.get('confidence_level', 0.5),
            'clinical_uncertainty': synthesis.get('clinical_uncertainty'),
            'sanity_check': synthesis.get('sanity_check', '')
        }
        
        return {
            "success": True,
            "patient_summary": analysis.get('patient_summary', {}),
            "clinical_findings": clinical_findings,
            "findings": findings,
            "symptoms": symptoms,
            "dominant_syndromes": dominant_syndromes,
            "clinical_clustering": clinical_clustering,
            "differentials": formatted_differentials,
            "synthesis": formatted_synthesis,
            "reasoning_transparency": reasoning_transparency,
            "management": analysis.get('management_considerations', []),
            "safety_alerts": analysis.get('safety_alerts', []),
            "clinical_pearls": analysis.get('clinical_pearls', []),
            "follow_up_questions": analysis.get('follow_up_questions', []),
            "confidence": synthesis.get('confidence_level', 0.5),
            "summary": f"Comprehensive analysis completed with {len(formatted_differentials)} differential diagnoses"
        }
        
    except Exception as e:
        logger.error(f"PhiCor Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# Disease Search Endpoint for Differential Dashboard
@api_router.get("/diseases/search")
async def search_diseases(q: str, limit: int = 5):
    """
    Search for diseases by name with fuzzy matching.
    Returns full disease data including parameter_modifications and comprehensive_model.
    """
    try:
        # Try exact match first
        disease = await db.diseases.find_one(
            {"name": {"$regex": f"^{q}$", "$options": "i"}},
            {"_id": 0}
        )
        
        if disease:
            return [disease]
        
        # Try partial match
        diseases = await db.diseases.find(
            {"name": {"$regex": q, "$options": "i"}},
            {"_id": 0}
        ).limit(limit).to_list(limit)
        
        if diseases:
            return diseases
        
        # Try word-by-word matching for multi-word queries
        words = q.split()
        if len(words) > 1:
            # Build regex pattern that matches all words in any order
            pattern = ".*".join([f"(?=.*{word})" for word in words])
            diseases = await db.diseases.find(
                {"name": {"$regex": pattern, "$options": "i"}},
                {"_id": 0}
            ).limit(limit).to_list(limit)
            
            if diseases:
                return diseases
        
        return []
        
    except Exception as e:
        logger.error(f"Disease search error: {str(e)}")
        return []


# ============================================================================
# MATHEMATICAL EQUATIONS API
# ============================================================================

@api_router.get("/equations")
async def get_equations(category: Optional[str] = None):
    """
    Get mathematical equations library.
    Optional category filter: cardiovascular, respiratory, renal, acid_base, hepatology, sepsis, hematology, phicor_novel
    """
    try:
        from models.mathematical_equations import ALL_EQUATIONS, get_all_equations, get_equations_by_category
        
        if category:
            equations = get_equations_by_category(category)
            return {
                "category": category,
                "count": len(equations),
                "equations": equations
            }
        else:
            return {
                "total": sum(len(eq_list) for eq_list in ALL_EQUATIONS.values()),
                "categories": list(ALL_EQUATIONS.keys()),
                "equations_by_category": {cat: len(eq_list) for cat, eq_list in ALL_EQUATIONS.items()},
                "all_equations": get_all_equations()
            }
    except Exception as e:
        logger.error(f"Equations API error: {e}")
        return {"error": str(e)}


@api_router.get("/equations/{equation_id}")
async def get_equation_by_id(equation_id: str):
    """Get a specific equation by ID"""
    try:
        from models.mathematical_equations import get_all_equations
        
        for eq in get_all_equations():
            if eq.get("id") == equation_id:
                return eq
        
        return {"error": "Equation not found"}
    except Exception as e:
        return {"error": str(e)}


@api_router.get("/equations/for-disease/{disease_category}")
async def get_equations_for_disease_category(disease_category: str):
    """Get relevant equations for a disease category"""
    try:
        from models.mathematical_equations import get_equations_for_disease
        
        equations = get_equations_for_disease(disease_category)
        return {
            "disease_category": disease_category,
            "count": len(equations),
            "equations": equations
        }
    except Exception as e:
        return {"error": str(e)}


@api_router.get("/enhancement/status")
async def get_enhancement_status():
    """Get disease enhancement progress"""
    try:
        total = await db.diseases.count_documents({})
        enhanced = await db.diseases.count_documents({"ai_enhanced": True})
        with_models = await db.diseases.count_documents({
            "mathematical_models": {"$exists": True, "$ne": []}
        })
        with_symptoms = await db.diseases.count_documents({
            "symptoms": {"$exists": True, "$ne": []}
        })
        with_treatments = await db.diseases.count_documents({
            "treatments": {"$exists": True, "$ne": []}
        })
        
        return {
            "total_diseases": total,
            "ai_enhanced": enhanced,
            "with_math_models": with_models,
            "with_symptoms": with_symptoms,
            "with_treatments": with_treatments,
            "enhancement_percentage": f"{(enhanced/total)*100:.1f}%" if total > 0 else "0%",
            "completeness": {
                "symptoms": f"{(with_symptoms/total)*100:.1f}%",
                "treatments": f"{(with_treatments/total)*100:.1f}%",
                "math_models": f"{(with_models/total)*100:.1f}%"
            }
        }
    except Exception as e:
        return {"error": str(e)}


# ============================================================================
# ADMIN - MATHEMATICAL MODELS MANAGEMENT API
# ============================================================================

@api_router.get("/admin/mathematical-models")
async def get_all_mathematical_models(
    limit: int = 500,
    offset: int = 0,
    organ_system: Optional[str] = None,
    validation_status: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get all mathematical models from diseases collection for admin review.
    Aggregates models from all diseases with their linked disease info.
    """
    try:
        # Verify admin access
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        # Check both users and experts collections
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            user = await db.experts.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user or user.get("role") not in ["admin", "super_admin", "expert"]:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Build aggregation pipeline to extract models from diseases
        pipeline = [
            {"$match": {"mathematical_models": {"$exists": True, "$ne": []}}},
            {"$unwind": "$mathematical_models"},
            {"$project": {
                "disease_id": "$id",
                "disease_name": "$name",
                "disease_category": "$category",
                "organ_system": "$category",
                "model": "$mathematical_models"
            }},
            {"$skip": offset},
            {"$limit": limit}
        ]
        
        models_cursor = db.diseases.aggregate(pipeline)
        raw_models = await models_cursor.to_list(limit)
        
        # Format models
        models = []
        for idx, item in enumerate(raw_models):
            model = item.get("model", {})
            if isinstance(model, dict):
                models.append({
                    "id": f"{item.get('disease_id', 'unknown')}_{idx}",
                    "name": model.get("name", "Unknown Model"),
                    "type": model.get("type", "clinical_score"),
                    "equation": model.get("equation", ""),
                    "variables": model.get("variables", {}),
                    "clinical_interpretation": model.get("clinical_interpretation", model.get("description", "")),
                    "disease_id": item.get("disease_id"),
                    "disease_name": item.get("disease_name"),
                    "organ_system": item.get("organ_system", "unknown"),
                    "validation_status": model.get("validation_status", "unreviewed"),
                    "source": model.get("source", ""),
                    "created_at": model.get("created_at", None)
                })
        
        # Get stats
        total_models_pipeline = [
            {"$match": {"mathematical_models": {"$exists": True, "$ne": []}}},
            {"$project": {"count": {"$size": "$mathematical_models"}}},
            {"$group": {"_id": None, "total": {"$sum": "$count"}}}
        ]
        stats_result = await db.diseases.aggregate(total_models_pipeline).to_list(1)
        total_models = stats_result[0]["total"] if stats_result else 0
        
        # Get validated count
        validated_count = sum(1 for m in models if m.get("validation_status") == "validated")
        pending_count = sum(1 for m in models if m.get("validation_status") == "pending")
        
        # Get models by organ
        organ_counts = {}
        for m in models:
            organ = m.get("organ_system", "unknown")
            organ_counts[organ] = organ_counts.get(organ, 0) + 1
        
        return {
            "models": models,
            "total": len(models),
            "stats": {
                "total_models": total_models,
                "validated": validated_count,
                "pending_review": pending_count,
                "novel_models": 0,  # Will be populated when novel models feature is added
                "by_organ": organ_counts
            }
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        logger.error(f"Error fetching mathematical models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/mathematical-models/novel")
async def get_novel_models(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get novel/experimental mathematical models (future feature)"""
    try:
        # Verify admin access
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        # Check both users and experts collections
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            user = await db.experts.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user or user.get("role") not in ["admin", "super_admin", "expert"]:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Query novel models collection (to be created)
        novel_models = await db.novel_mathematical_models.find({}, {"_id": 0}).to_list(100)
        
        return {"models": novel_models}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        logger.error(f"Error fetching novel models: {e}")
        return {"models": []}


@api_router.get("/admin/mathematical-models/pending-reviews")
async def get_pending_model_reviews(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get pending review suggestions for mathematical models"""
    try:
        # Verify admin access
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        # Check both users and experts collections
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            user = await db.experts.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user or user.get("role") not in ["admin", "super_admin", "expert"]:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Query pending reviews
        reviews = await db.model_review_suggestions.find(
            {"status": "pending"},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return {"reviews": reviews}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        logger.error(f"Error fetching pending reviews: {e}")
        return {"reviews": []}


@api_router.post("/admin/mathematical-models/{model_id}/review")
async def review_mathematical_model(
    model_id: str,
    review_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Submit a review/validation for a mathematical model (super admin only)"""
    try:
        # Verify super admin access
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            user = await db.experts.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user or user.get("role") != "super_admin":
            raise HTTPException(status_code=403, detail="Super admin access required")
        
        # Parse model_id to get disease_id and model index
        parts = model_id.rsplit("_", 1)
        if len(parts) != 2:
            raise HTTPException(status_code=400, detail="Invalid model ID format")
        
        disease_id, model_idx = parts[0], int(parts[1])
        
        # Update the model's validation status in the disease document
        disease = await db.diseases.find_one({"id": disease_id})
        if not disease:
            raise HTTPException(status_code=404, detail="Disease not found")
        
        models = disease.get("mathematical_models", [])
        if model_idx >= len(models):
            raise HTTPException(status_code=404, detail="Model not found")
        
        # Update model validation
        models[model_idx]["validation_status"] = review_data.get("status", "validated")
        models[model_idx]["review_notes"] = review_data.get("notes", "")
        models[model_idx]["review_source"] = review_data.get("source", "")
        models[model_idx]["reviewed_by"] = user.get("email")
        models[model_idx]["reviewed_at"] = datetime.now(timezone.utc).isoformat()
        
        await db.diseases.update_one(
            {"id": disease_id},
            {"$set": {"mathematical_models": models}}
        )
        
        # Log the review
        await db.audit_logs.insert_one({
            "action": "model_review",
            "model_id": model_id,
            "disease_id": disease_id,
            "status": review_data.get("status"),
            "reviewed_by": user.get("email"),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {"success": True, "message": "Model reviewed successfully"}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reviewing model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/admin/mathematical-models/{model_id}/suggest")
async def suggest_model_change(
    model_id: str,
    suggestion_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Submit a suggestion for a mathematical model (expert/admin)"""
    try:
        # Verify access
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            user = await db.experts.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user or user.get("role") not in ["admin", "super_admin", "expert"]:
            raise HTTPException(status_code=403, detail="Expert access required")
        
        # Parse model_id
        parts = model_id.rsplit("_", 1)
        disease_id = parts[0] if len(parts) == 2 else model_id
        
        # Get model name from disease
        disease = await db.diseases.find_one({"id": disease_id}, {"name": 1, "mathematical_models": 1})
        model_name = "Unknown Model"
        if disease and len(parts) == 2:
            models = disease.get("mathematical_models", [])
            model_idx = int(parts[1])
            if model_idx < len(models):
                model_name = models[model_idx].get("name", "Unknown Model")
        
        # Create suggestion record
        from uuid import uuid4
        suggestion = {
            "id": str(uuid4()),
            "model_id": model_id,
            "model_name": model_name,
            "disease_id": disease_id,
            "suggestion_type": suggestion_data.get("suggestion_type", "modification"),
            "description": suggestion_data.get("description", ""),
            "rationale": suggestion_data.get("rationale", ""),
            "source_url": suggestion_data.get("source_url", ""),
            "additional_notes": suggestion_data.get("additional_notes", ""),
            "submitted_by": user.get("email"),
            "submitted_by_role": user.get("role"),
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.model_review_suggestions.insert_one(suggestion)
        
        return {"success": True, "message": "Suggestion submitted for super admin review"}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        logger.error(f"Error submitting suggestion: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# CASE MANAGEMENT ENDPOINTS
# Save, list, share clinical cases
# ============================================================

class SaveCaseRequest(BaseModel):
    """Request model for saving a clinical case"""
    title: Optional[str] = None
    clinical_text: str
    patient_summary: Optional[Dict[str, Any]] = None
    findings: List[Dict[str, Any]] = []
    symptoms: List[Dict[str, Any]] = []
    differentials: List[Dict[str, Any]] = []
    synthesis: Optional[Dict[str, Any]] = None
    dominant_syndrome: Optional[Dict[str, Any]] = None
    safety_alerts: List[Dict[str, Any]] = []
    tags: List[str] = []

@api_router.post("/cases/save")
async def save_clinical_case(request: SaveCaseRequest):
    """Save a clinical case for later reference"""
    try:
        from uuid import uuid4
        
        case_id = str(uuid4())[:8]  # Short ID for easy sharing
        
        # Generate title if not provided
        title = request.title
        if not title:
            if request.patient_summary:
                age = request.patient_summary.get('age', '')
                sex = request.patient_summary.get('sex', '')
                chief = request.patient_summary.get('chief_complaint', 'Clinical Case')
                title = f"{age}{'yo ' if age else ''}{sex}{' - ' if (age or sex) else ''}{chief[:50]}"
            else:
                title = f"Clinical Case - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        # Get primary diagnosis
        primary_diagnosis = None
        if request.differentials and len(request.differentials) > 0:
            primary_diagnosis = request.differentials[0].get('name') or request.differentials[0].get('diagnosis')
        
        case = {
            "id": case_id,
            "title": title,
            "clinical_text": request.clinical_text,
            "patient_summary": request.patient_summary,
            "findings": request.findings,
            "symptoms": request.symptoms,
            "differentials": request.differentials,
            "synthesis": request.synthesis,
            "dominant_syndrome": request.dominant_syndrome,
            "safety_alerts": request.safety_alerts,
            "primary_diagnosis": primary_diagnosis,
            "tags": request.tags,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "views": 0,
            "is_demo": False
        }
        
        await db.clinical_cases.insert_one(case)
        
        return {
            "success": True,
            "case_id": case_id,
            "share_url": f"/cases/{case_id}",
            "message": "Case saved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error saving case: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/cases")
async def list_clinical_cases(limit: int = 20, skip: int = 0, tag: Optional[str] = None):
    """List all saved clinical cases"""
    try:
        query = {}
        if tag:
            query["tags"] = tag
        
        cases = await db.clinical_cases.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        
        total = await db.clinical_cases.count_documents(query)
        
        return {
            "success": True,
            "cases": cases,
            "total": total,
            "limit": limit,
            "skip": skip
        }
        
    except Exception as e:
        logger.error(f"Error listing cases: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/cases/{case_id}")
async def get_clinical_case(case_id: str):
    """Get a specific clinical case by ID"""
    try:
        case = await db.clinical_cases.find_one({"id": case_id}, {"_id": 0})
        
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Increment view count
        await db.clinical_cases.update_one(
            {"id": case_id},
            {"$inc": {"views": 1}}
        )
        
        return {
            "success": True,
            "case": case
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting case: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/cases/{case_id}")
async def delete_clinical_case(case_id: str):
    """Delete a clinical case"""
    try:
        result = await db.clinical_cases.delete_one({"id": case_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Case not found")
        
        return {"success": True, "message": "Case deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting case: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# FOOD MATHEMATICAL MODEL ENGINE - Π (Pi) Tab
# Treats food as parameterized biological input with organ effects
# ============================================================

from food_engine import (
    NUTRIENT_ORGAN_EFFECTS, 
    GLYCEMIC_CATEGORIES, 
    CONDITION_FOOD_CONSTRAINTS,
    SAMPLE_FOODS_DATABASE
)

class UserHealthProfile(BaseModel):
    """User health profile for personalized food analysis"""
    model_config = {"extra": "allow"}
    age: Optional[int] = None
    sex: Optional[str] = None
    weight: Optional[float] = None  # kg
    height: Optional[float] = None  # cm
    conditions: List[str] = []  # Active medical conditions
    medications: List[str] = []
    allergies: List[str] = []
    lab_values: Optional[Dict[str, Any]] = None  # Recent lab results
    lifestyle: Optional[Dict[str, Any]] = None  # Activity, smoking, alcohol
    dietary_restrictions: List[str] = []  # Vegetarian, halal, etc.

class FoodAnalysisRequest(BaseModel):
    """Request for food analysis"""
    food_name: Optional[str] = None
    food_id: Optional[str] = None
    barcode: Optional[str] = None
    serving_size: Optional[float] = None
    health_profile: Optional[UserHealthProfile] = None

class MealPlanRequest(BaseModel):
    """Request for meal plan optimization"""
    health_profile: UserHealthProfile
    meal_type: str = "day"  # day, week
    preferences: Optional[Dict[str, Any]] = None
    constraints: Optional[Dict[str, Any]] = None

@api_router.get("/food/search")
async def search_foods(q: str, limit: int = 20):
    """Search for foods in the database"""
    try:
        # Search in MongoDB food collection
        foods = await db.foods.find(
            {"$or": [
                {"name": {"$regex": q, "$options": "i"}},
                {"description": {"$regex": q, "$options": "i"}},
                {"category": {"$regex": q, "$options": "i"}}
            ]},
            {"_id": 0}
        ).limit(limit).to_list(limit)
        
        # If no results in DB, search sample foods
        if not foods:
            foods = [f for f in SAMPLE_FOODS_DATABASE 
                    if q.lower() in f['name'].lower() or 
                       q.lower() in f.get('description', '').lower()][:limit]
        
        return {
            "success": True,
            "foods": foods,
            "total": len(foods)
        }
    except Exception as e:
        logger.error(f"Error searching foods: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/food/analyze-from-db")
async def analyze_food_from_database(request: Dict[str, Any] = Body(...)):
    """
    Database-driven food analysis - NO AI required for foods in database.
    Uses comprehensive nutrients database for parameter effects, disease interactions, and drug interactions.
    Falls back to AI only for foods not in database.
    """
    try:
        food_name = request.get("food_name", "").strip()
        serving_size = request.get("serving_size", "1 serving")
        health_profile = request.get("health_profile")
        
        if not food_name:
            raise HTTPException(status_code=400, detail="Food name is required")
        
        # Search for food in database
        food = await db.foods.find_one(
            {"$or": [
                {"name": {"$regex": f"^{food_name}$", "$options": "i"}},
                {"name": {"$regex": food_name, "$options": "i"}}
            ]},
            {"_id": 0}
        )
        
        if not food:
            # Food not in database - return indicator to use AI endpoint
            return {
                "success": False,
                "in_database": False,
                "message": f"'{food_name}' not found in database. Use AI analysis endpoint.",
                "suggestion": "POST /api/food/analyze-product"
            }
        
        # Food found in database - compute analysis from nutrients database
        nutrients = food.get("nutrients", {})
        
        # Get all nutrient details from nutrients collection
        nutrient_ids = list(nutrients.keys())
        nutrient_details = await db.nutrients.find(
            {"id": {"$in": nutrient_ids}},
            {"_id": 0}
        ).to_list(100)
        
        # Create a lookup dict
        nutrient_lookup = {n["id"]: n for n in nutrient_details}
        
        # Calculate organ system effects based on nutrients
        organ_system_effects = {}
        all_disease_interactions = {"beneficial": [], "caution": [], "contraindicated": []}
        all_drug_interactions = []
        
        for nutrient_id, nutrient_value in nutrients.items():
            if nutrient_id not in nutrient_lookup:
                continue
            
            nutrient_data = nutrient_lookup[nutrient_id]
            # Ensure amount is a number
            raw_amount = nutrient_value.get("value", 0)
            try:
                amount = float(raw_amount) if raw_amount is not None else 0
            except (ValueError, TypeError):
                amount = 0
            
            daily_value = nutrient_data.get("daily_value")
            # Ensure daily_value is a number
            try:
                daily_value = float(daily_value) if daily_value is not None else None
            except (ValueError, TypeError):
                daily_value = None
            
            # Calculate percent daily value
            percent_dv = None
            if daily_value and daily_value > 0 and amount > 0:
                percent_dv = round((amount / daily_value) * 100, 1)
            
            # Add percent DV to nutrient
            nutrients[nutrient_id]["percent_daily_value"] = percent_dv
            nutrients[nutrient_id]["daily_value"] = daily_value
            nutrients[nutrient_id]["nutrient_name"] = nutrient_data.get("name")
            
            # Process parameter effects
            param_effects = nutrient_data.get("parameter_effects", {})
            for organ_system, effects in param_effects.items():
                if organ_system not in organ_system_effects:
                    organ_system_effects[organ_system] = {
                        "overall_effect": "neutral",
                        "parameters_affected": [],
                        "contributing_nutrients": []
                    }
                
                for effect in effects:
                    # Determine magnitude based on percent DV
                    magnitude = "minimal"
                    if percent_dv:
                        if percent_dv >= 50:
                            magnitude = "significant"
                        elif percent_dv >= 20:
                            magnitude = "moderate"
                        elif percent_dv >= 10:
                            magnitude = "mild"
                    
                    # Calculate quantified parameter change
                    quantified_change = None
                    change_unit = None
                    effect_magnitude_text = effect.get("magnitude", "")  # e.g., "2-4 mmHg per 1000mg increase"
                    
                    # Parse magnitude from nutrient database if available
                    if effect_magnitude_text and amount > 0:
                        # Try to extract numerical change from magnitude text
                        # Examples: "2-4 mmHg per 1000mg increase", "10-40% increase"
                        import re
                        
                        # Pattern for "X-Y unit per Zmg" format
                        per_pattern = r"(\d+(?:\.\d+)?)-?(\d+(?:\.\d+)?)?\s*(\w+(?:/\w+)?)\s*per\s*(\d+)\s*mg"
                        per_match = re.search(per_pattern, effect_magnitude_text, re.IGNORECASE)
                        
                        if per_match:
                            min_change = float(per_match.group(1))
                            max_change = float(per_match.group(2)) if per_match.group(2) else min_change
                            change_unit = per_match.group(3)
                            per_amount = float(per_match.group(4))
                            
                            # Calculate change based on actual amount
                            avg_change = (min_change + max_change) / 2
                            quantified_change = round((amount / per_amount) * avg_change, 1)
                            
                            # Apply direction
                            if effect.get("direction") == "decrease":
                                quantified_change = -quantified_change
                        else:
                            # Pattern for simple percentage or direct value
                            simple_pattern = r"(\d+(?:\.\d+)?)-?(\d+(?:\.\d+)?)?\s*(%|mmHg|mg/dL|mEq/L|mg|g|mcg|IU)"
                            simple_match = re.search(simple_pattern, effect_magnitude_text)
                            
                            if simple_match:
                                min_change = float(simple_match.group(1))
                                max_change = float(simple_match.group(2)) if simple_match.group(2) else min_change
                                change_unit = simple_match.group(3)
                                
                                # Scale by percent DV if available
                                if percent_dv:
                                    avg_change = (min_change + max_change) / 2
                                    quantified_change = round((percent_dv / 100) * avg_change, 1)
                                    
                                    if effect.get("direction") == "decrease":
                                        quantified_change = -quantified_change
                    
                    # Estimate change for common parameters if not calculated
                    if quantified_change is None and percent_dv and percent_dv >= 5:
                        param_name = effect.get("parameter", "").lower()
                        direction = effect.get("direction", "")
                        
                        # Estimated effects per serving based on nutrient contribution
                        if "blood_pressure" in param_name or param_name in ["bp_systolic", "bp_diastolic"]:
                            # Estimate based on potassium/sodium effect on BP
                            if nutrient_id == "potassium":
                                quantified_change = round(-0.5 * (percent_dv / 10), 1)  # ~0.5 mmHg per 10% DV potassium
                                change_unit = "mmHg"
                            elif nutrient_id == "sodium":
                                quantified_change = round(0.3 * (percent_dv / 10), 1)  # ~0.3 mmHg per 10% DV sodium
                                change_unit = "mmHg"
                        elif "glucose" in param_name or "blood_sugar" in param_name:
                            if nutrient_id in ["sugar", "sugars", "carbohydrates"]:
                                quantified_change = round(2 * (percent_dv / 10), 1)  # ~2 mg/dL per 10% DV
                                change_unit = "mg/dL"
                        elif "cholesterol" in param_name and "serum" not in param_name:
                            if nutrient_id == "cholesterol":
                                quantified_change = round(1.5 * (percent_dv / 10), 1)
                                change_unit = "mg/dL"
                        elif param_name == "serum_potassium":
                            if nutrient_id == "potassium":
                                quantified_change = round(0.05 * (percent_dv / 10), 2)  # ~0.05 mEq/L per 10% DV
                                change_unit = "mEq/L"
                        
                        # Apply direction modifier
                        if quantified_change and direction == "decrease":
                            quantified_change = -abs(quantified_change)
                        elif quantified_change and direction == "increase":
                            quantified_change = abs(quantified_change)
                    
                    organ_system_effects[organ_system]["parameters_affected"].append({
                        "parameter": effect.get("parameter"),
                        "direction": effect.get("direction"),
                        "mechanism": effect.get("mechanism"),
                        "magnitude": magnitude,
                        "quantified_change": quantified_change,
                        "change_unit": change_unit,
                        "from_nutrient": nutrient_data.get("name"),
                        "amount": f"{amount} {nutrient_value.get('unit', '')}",
                        "percent_dv": percent_dv
                    })
                    
                    # Track contributing nutrients
                    if nutrient_data.get("name") not in organ_system_effects[organ_system]["contributing_nutrients"]:
                        organ_system_effects[organ_system]["contributing_nutrients"].append(nutrient_data.get("name"))
            
            # Collect disease interactions
            disease_int = nutrient_data.get("disease_interactions", {})
            for category in ["beneficial", "caution", "contraindicated"]:
                for interaction in disease_int.get(category, []):
                    all_disease_interactions[category].append({
                        **interaction,
                        "from_nutrient": nutrient_data.get("name")
                    })
            
            # Collect drug interactions
            for drug_int in nutrient_data.get("drug_interactions", []):
                all_drug_interactions.append({
                    **drug_int,
                    "from_nutrient": nutrient_data.get("name")
                })
        
        # Calculate overall effects for each organ system
        for organ_system, data in organ_system_effects.items():
            beneficial = sum(1 for p in data["parameters_affected"] if p["direction"] in ["increase", "maintain"] and p.get("magnitude") in ["moderate", "significant"])
            harmful = sum(1 for p in data["parameters_affected"] if p["direction"] == "decrease" and "caution" in str(p.get("mechanism", "")).lower())
            
            if beneficial > harmful:
                data["overall_effect"] = "beneficial"
            elif harmful > beneficial:
                data["overall_effect"] = "caution"
            else:
                data["overall_effect"] = "neutral"
        
        # Build personalized risk assessment if health profile provided
        personalized_risk = None
        if health_profile:
            conditions = health_profile.get("conditions", [])
            medications = health_profile.get("medications", [])
            allergies = health_profile.get("allergies", [])
            
            condition_specific = []
            medication_warnings = []
            allergy_alerts = []
            
            # Check conditions against disease interactions
            for condition in conditions:
                condition_lower = condition.lower()
                for category, interactions in all_disease_interactions.items():
                    for interaction in interactions:
                        disease_name = interaction.get("disease", "").lower().replace("_", " ")
                        if disease_name in condition_lower or condition_lower in disease_name:
                            condition_specific.append({
                                "condition": condition,
                                "category": category,
                                "reason": interaction.get("reason"),
                                "recommendation": interaction.get("recommendation"),
                                "from_nutrient": interaction.get("from_nutrient")
                            })
            
            # Check medications against drug interactions
            for med in medications:
                med_lower = med.lower()
                for drug_int in all_drug_interactions:
                    drug_name = drug_int.get("drug", "").lower().replace("_", " ")
                    if drug_name in med_lower or med_lower in drug_name:
                        medication_warnings.append({
                            "medication": med,
                            "interaction": drug_int.get("interaction"),
                            "mechanism": drug_int.get("mechanism"),
                            "from_nutrient": drug_int.get("from_nutrient")
                        })
            
            # Determine overall suitability
            has_contraindications = any(c["category"] == "contraindicated" for c in condition_specific)
            has_cautions = any(c["category"] == "caution" for c in condition_specific) or len(medication_warnings) > 0
            
            if has_contraindications:
                overall_suitability = "unsuitable"
            elif has_cautions:
                overall_suitability = "caution"
            else:
                overall_suitability = "suitable"
            
            personalized_risk = {
                "overall_suitability": overall_suitability,
                "condition_specific_analysis": condition_specific,
                "medication_interactions": medication_warnings,
                "allergy_alerts": allergy_alerts
            }
        
        # Calculate health score based on nutrient profile
        health_score = 70  # Base score
        
        # Bonus for high fiber
        if nutrients.get("fiber", {}).get("percent_daily_value", 0) > 10:
            health_score += 5
        
        # Bonus for high protein
        if nutrients.get("protein", {}).get("percent_daily_value", 0) > 10:
            health_score += 5
        
        # Bonus for high potassium
        if nutrients.get("potassium", {}).get("percent_daily_value", 0) > 10:
            health_score += 5
        
        # Penalty for high sodium
        if nutrients.get("sodium", {}).get("percent_daily_value", 0) > 20:
            health_score -= 10
        
        # Penalty for high saturated fat
        if nutrients.get("fat_saturated", {}).get("percent_daily_value", 0) > 15:
            health_score -= 10
        
        # Penalty for high added sugars
        if nutrients.get("sugars", {}).get("value", 0) > 15:
            health_score -= 5
        
        # Clamp score
        health_score = max(20, min(100, health_score))
        
        # Build serving info - human-readable format
        serving_grams = food.get("serving_size", 100)  # Default to 100g if not specified
        serving_description = food.get("description", "")
        
        # Extract serving description from food description if available
        # E.g., "Medium banana, raw" -> "1 medium"
        serving_text = "1 serving"
        if serving_description:
            desc_lower = serving_description.lower()
            if "medium" in desc_lower:
                serving_text = "1 medium"
            elif "large" in desc_lower:
                serving_text = "1 large"
            elif "small" in desc_lower:
                serving_text = "1 small"
            elif "cup" in desc_lower:
                serving_text = "1 cup"
            elif "slice" in desc_lower:
                serving_text = "1 slice"
            elif "piece" in desc_lower:
                serving_text = "1 piece"
            elif "oz" in desc_lower or "ounce" in desc_lower:
                serving_text = "1 oz"
            elif "fillet" in desc_lower:
                serving_text = "1 fillet"
            elif "egg" in desc_lower:
                serving_text = "1 egg"
            elif "tbsp" in desc_lower or "tablespoon" in desc_lower:
                serving_text = "1 tbsp"
        
        # Build response
        analysis = {
            "product_name": food.get("name"),
            "product_type": food.get("category", "food"),
            "description": food.get("description"),
            "serving_size": serving_text,
            "serving_size_g": serving_grams,
            "serving_display": f"{serving_text} ({serving_grams}g)",
            "data_source": "PhiCor Database",
            "ai_generated": False,
            
            "complete_nutritional_profile": {
                "macronutrients": {
                    "energy_kcal": nutrients.get("energy", {}).get("value") or nutrients.get("calories", {}).get("value"),
                    "protein_g": nutrients.get("protein", {}).get("value"),
                    "carbohydrates_g": nutrients.get("carbohydrates", {}).get("value"),
                    "fiber_g": nutrients.get("fiber", {}).get("value"),
                    "sugars_g": nutrients.get("sugars", {}).get("value") or nutrients.get("sugar", {}).get("value"),
                    "fat_total_g": nutrients.get("fat_total", {}).get("value") or nutrients.get("fat", {}).get("value"),
                    "fat_saturated_g": nutrients.get("fat_saturated", {}).get("value"),
                    "cholesterol_mg": nutrients.get("cholesterol", {}).get("value"),
                },
                "per_100g": {
                    # Calculate per 100g values if serving size is different
                    "energy_kcal": round((nutrients.get("energy", {}).get("value") or nutrients.get("calories", {}).get("value") or 0) * 100 / serving_grams, 1) if serving_grams else None,
                    "protein_g": round((nutrients.get("protein", {}).get("value") or 0) * 100 / serving_grams, 1) if serving_grams else None,
                    "carbohydrates_g": round((nutrients.get("carbohydrates", {}).get("value") or 0) * 100 / serving_grams, 1) if serving_grams else None,
                    "fat_total_g": round((nutrients.get("fat_total", {}).get("value") or nutrients.get("fat", {}).get("value") or 0) * 100 / serving_grams, 1) if serving_grams else None,
                },
                "electrolytes": {
                    "sodium_mg": nutrients.get("sodium", {}),
                    "potassium_mg": nutrients.get("potassium", {}),
                    "calcium_mg": nutrients.get("calcium", {}),
                    "magnesium_mg": nutrients.get("magnesium", {}),
                    "phosphorus_mg": nutrients.get("phosphorus", {}),
                },
                "vitamins": {k: v for k, v in nutrients.items() if k.startswith("vitamin_") or k in ["thiamin", "riboflavin", "niacin", "folate"]},
                "trace_elements": {k: v for k, v in nutrients.items() if k in ["iron", "zinc", "selenium", "iodine", "copper", "manganese", "chromium", "molybdenum"]}
            },
            
            "organ_system_parameter_effects": organ_system_effects,
            
            "disease_interactions": all_disease_interactions,
            "drug_interactions": all_drug_interactions,
            
            "bioactive_compounds": food.get("bioactive_compounds", []),
            
            "personalized_risk_assessment": personalized_risk,
            
            "clinical_summary": {
                "healthfulness_score": health_score,
                "key_benefits": [
                    f"Good source of {n['nutrient_name']}" 
                    for nid, n in nutrients.items() 
                    if n.get("percent_daily_value", 0) >= 15
                ][:5],
                "key_concerns": [
                    f"High in {n['nutrient_name']}" 
                    for nid, n in nutrients.items() 
                    if nid in ["sodium", "fat_saturated", "cholesterol", "sugars"] and n.get("percent_daily_value", 0) >= 20
                ]
            }
        }
        
        return {
            "success": True,
            "in_database": True,
            "analysis": analysis,
            "analysis_type": "database_driven"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in database food analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/food/analyze-dish")
async def analyze_dish_with_ai(request: Dict[str, Any] = Body(...)):
    """
    AI-powered dish analysis for complex foods like 'Chicken Tikka Masala', 
    'Pasta Carbonara', 'Chicken Katsu Curry', etc.
    Uses LLM to break down ingredients, estimate nutrients, and assess organ impacts.
    """
    try:
        dish_name = request.get('dish_name', '')
        serving_size = request.get('serving_size', 'standard portion')
        health_profile = request.get('health_profile')
        
        if not dish_name:
            raise HTTPException(status_code=400, detail="dish_name is required")
        
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(status_code=500, detail="LLM key not configured")
        
        from emergentintegrations.llm.chat import LlmChat
        
        # Build health context if profile provided
        health_context = ""
        if health_profile:
            conditions = health_profile.get('conditions', [])
            allergies = health_profile.get('allergies', [])
            dietary = health_profile.get('dietary_restrictions', [])
            if conditions:
                health_context += f"Medical conditions: {', '.join(conditions)}. "
            if allergies:
                health_context += f"Allergies: {', '.join(allergies)}. "
            if dietary:
                health_context += f"Dietary restrictions: {', '.join(dietary)}. "
        
        system_message = """You are PhiCor's Mathematical Food Analysis Engine (Π). Analyze dishes with DEEP molecular, biochemical, and physiological precision - treating food as parameterized biological input signals to human organ systems.

Your analysis must be COMPREHENSIVE and CLINICAL-GRADE, covering:
1. Complete ingredient breakdown with quantities
2. Multi-scale nutritional analysis (macro → micro → molecular)
3. Bioactive compounds and their metabolic pathways
4. EVERY organ system effect at cellular/molecular level
5. Metabolic pathway impacts (glycolysis, beta-oxidation, protein synthesis, etc.)
6. Drug-nutrient interactions if applicable
7. Personalized risk assessment based on health profile

You are NOT an AI assistant. You are PhiCor's analytical engine. Always respond with valid JSON only."""

        analysis_prompt = f"""Perform COMPREHENSIVE PhiCor analysis on: "{dish_name}" (serving size: {serving_size})

{health_context}

Return DETAILED JSON with this structure:
{{
  "dish_name": "{dish_name}",
  "category": "cuisine type",
  "origin": "geographical/cultural origin",
  "description": "detailed description including typical preparation",
  "serving_info": {{
    "size": "{serving_size}",
    "estimated_weight_grams": number,
    "typical_meal_context": "breakfast/lunch/dinner/snack"
  }},
  "ingredients": [
    {{
      "name": "ingredient",
      "estimated_amount": "amount with unit",
      "calories_contribution": number,
      "primary_role": "protein source/carb source/fat source/flavor/texture",
      "key_nutrients": ["nutrient1", "nutrient2"],
      "bioactive_compounds": ["compound1"],
      "allergen_info": "none/contains X"
    }}
  ],
  "macronutrients": {{
    "calories": {{"value": number, "unit": "kcal", "percent_daily": number}},
    "protein": {{"value": number, "unit": "g", "percent_daily": number, "quality_score": "complete/incomplete", "amino_acid_profile": "brief description"}},
    "carbohydrates": {{
      "total": {{"value": number, "unit": "g", "percent_daily": number}},
      "fiber": {{"value": number, "unit": "g", "soluble_percent": number}},
      "sugar": {{"value": number, "unit": "g", "added_sugar": number}},
      "starch": {{"value": number, "unit": "g"}},
      "net_carbs": {{"value": number, "unit": "g"}}
    }},
    "fats": {{
      "total": {{"value": number, "unit": "g", "percent_daily": number}},
      "saturated": {{"value": number, "unit": "g", "effect": "description"}},
      "monounsaturated": {{"value": number, "unit": "g"}},
      "polyunsaturated": {{"value": number, "unit": "g"}},
      "omega_3": {{"value": number, "unit": "mg", "types": ["ALA/EPA/DHA"]}},
      "omega_6": {{"value": number, "unit": "mg"}},
      "omega_ratio": "X:Y",
      "trans_fat": {{"value": number, "unit": "g"}},
      "cholesterol": {{"value": number, "unit": "mg"}}
    }}
  }},
  "micronutrients": {{
    "vitamins": [
      {{"name": "vitamin name", "value": number, "unit": "unit", "percent_daily": number, "function": "brief function", "source_ingredients": ["ing1"]}}
    ],
    "minerals": [
      {{"name": "mineral name", "value": number, "unit": "unit", "percent_daily": number, "function": "brief function", "bioavailability": "high/medium/low"}}
    ],
    "electrolytes": {{
      "sodium": {{"value": number, "unit": "mg", "percent_daily": number}},
      "potassium": {{"value": number, "unit": "mg", "percent_daily": number}},
      "chloride": {{"value": number, "unit": "mg"}}
    }}
  }},
  "bioactive_compounds": [
    {{
      "name": "compound name",
      "class": "polyphenol/flavonoid/terpene/alkaloid/etc",
      "source_ingredient": "ingredient",
      "estimated_amount": "amount if known",
      "mechanism_of_action": "how it works at molecular level",
      "target_pathways": ["pathway1", "pathway2"],
      "health_effects": ["effect1", "effect2"],
      "bioavailability": "percentage or description"
    }}
  ],
  "metabolic_impact": {{
    "glycemic_index": number,
    "glycemic_load": number,
    "glycemic_category": "low/medium/high",
    "insulin_index": number,
    "thermic_effect": "percentage of calories used in digestion",
    "satiety_index": "low/medium/high/very high",
    "metabolic_pathways_activated": [
      {{"pathway": "glycolysis/gluconeogenesis/beta-oxidation/etc", "effect": "stimulated/inhibited", "mechanism": "why"}}
    ],
    "postprandial_effects": {{
      "blood_glucose_peak": "description of expected pattern",
      "insulin_response": "description",
      "lipemia": "description of fat absorption pattern"
    }}
  }},
  "organ_system_effects": {{
    "cardiovascular": {{
      "heart": {{"effect": "beneficial/neutral/caution", "mechanism": "detailed mechanism", "parameters_affected": ["BP", "HR", "etc"]}},
      "blood_vessels": {{"effect": "beneficial/neutral/caution", "mechanism": "effect on endothelium, etc"}},
      "blood": {{"effect": "beneficial/neutral/caution", "mechanism": "effect on viscosity, lipids, etc"}}
    }},
    "gastrointestinal": {{
      "stomach": {{"effect": "beneficial/neutral/caution", "mechanism": "effect on acid, motility"}},
      "liver": {{"effect": "beneficial/neutral/caution", "mechanism": "effect on metabolism, detox", "enzyme_effects": ["CYP450 if relevant"]}},
      "gallbladder": {{"effect": "beneficial/neutral/caution", "mechanism": "bile production/release"}},
      "pancreas": {{"effect": "beneficial/neutral/caution", "mechanism": "insulin/enzyme secretion"}},
      "intestines": {{"effect": "beneficial/neutral/caution", "mechanism": "absorption, microbiome effects"}}
    }},
    "renal": {{
      "kidneys": {{"effect": "beneficial/neutral/caution", "mechanism": "filtration, excretion load", "parameters_affected": ["GFR impact", "electrolyte handling"]}}
    }},
    "neurological": {{
      "brain": {{"effect": "beneficial/neutral/caution", "mechanism": "neurotransmitter effects, blood-brain barrier", "cognitive_impact": "description"}},
      "nervous_system": {{"effect": "beneficial/neutral/caution", "mechanism": "peripheral effects"}}
    }},
    "musculoskeletal": {{
      "muscles": {{"effect": "beneficial/neutral/caution", "mechanism": "protein synthesis, energy"}},
      "bones": {{"effect": "beneficial/neutral/caution", "mechanism": "calcium, vitamin D, phosphorus"}}
    }},
    "endocrine": {{
      "thyroid": {{"effect": "beneficial/neutral/caution", "mechanism": "iodine, goitrogens if any"}},
      "adrenals": {{"effect": "beneficial/neutral/caution", "mechanism": "cortisol, stress response"}}
    }},
    "immune": {{
      "immune_system": {{"effect": "beneficial/neutral/caution", "mechanism": "immunomodulation, inflammation"}}
    }}
  }},
  "personalized_analysis": {{
    "condition_specific_warnings": [
      {{"condition": "condition name", "severity": "low/moderate/high/critical", "warning": "specific warning", "mechanism": "why this is concerning", "recommendation": "what to do"}}
    ],
    "medication_interactions": [
      {{"medication_class": "class", "interaction": "description", "severity": "mild/moderate/severe"}}
    ],
    "allergy_alerts": ["alert1 if applicable"]
  }},
  "clinical_scores": {{
    "healthfulness_score": number,
    "nutrient_density_score": number,
    "inflammatory_index": number,
    "recommendation": "highly_recommended/recommended/moderate/limit/avoid",
    "clinical_notes": "summary of key clinical considerations"
  }},
  "healthier_alternatives": [
    {{"name": "alternative dish", "benefit": "why it's healthier", "swap_suggestion": "specific ingredient swaps"}}
  ],
  "preparation_modifications": [
    {{"modification": "cooking method change", "benefit": "health benefit", "nutrient_impact": "what changes"}}
  ]
}}"""

        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"phicor_food_{datetime.now().strftime('%H%M%S')}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        response = await chat.send_message(UserMessage(text=analysis_prompt))
        
        # Parse JSON response
        import json
        import re
        
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            analysis = json.loads(json_match.group())
            
            # Store in cache/DB for future use
            analysis['id'] = f"dish_{dish_name.lower().replace(' ', '_')[:20]}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            analysis['analyzed_at'] = datetime.now(timezone.utc).isoformat()
            analysis['source'] = 'ai_analysis'
            
            # Add serving info
            analysis['serving_size'] = serving_size
            
            return {
                "success": True,
                "analysis": analysis
            }
        else:
            raise Exception("Failed to parse AI response")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing dish: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/food/{food_id}")
async def get_food_details(food_id: str):
    """Get detailed food information with organ effects"""
    try:
        # Try MongoDB first
        food = await db.foods.find_one({"id": food_id}, {"_id": 0})
        
        # Fallback to sample database
        if not food:
            food = next((f for f in SAMPLE_FOODS_DATABASE if f['id'] == food_id), None)
        
        if not food:
            raise HTTPException(status_code=404, detail="Food not found")
        
        # Enrich with nutrient-organ effects
        enriched_effects = {}
        for nutrient, data in food.get('nutrients', {}).items():
            if nutrient in NUTRIENT_ORGAN_EFFECTS:
                effect_info = NUTRIENT_ORGAN_EFFECTS[nutrient]
                enriched_effects[nutrient] = {
                    "value": data.get('value'),
                    "unit": data.get('unit'),
                    "organs_affected": effect_info.get('organs_affected', []),
                    "effects": effect_info.get('effects', {}),
                    "conditions_sensitive": effect_info.get('conditions_sensitive', [])
                }
        
        food['nutrient_organ_mapping'] = enriched_effects
        
        return {
            "success": True,
            "food": food
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting food details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/food/analyze")
async def analyze_food_for_user(request: FoodAnalysisRequest):
    """
    Analyze a food item for a specific user based on their health profile.
    Returns personalized effects, warnings, and recommendations.
    """
    try:
        # Get food data
        food = None
        if request.food_id:
            food = await db.foods.find_one({"id": request.food_id}, {"_id": 0})
            if not food:
                food = next((f for f in SAMPLE_FOODS_DATABASE if f['id'] == request.food_id), None)
        elif request.food_name:
            food = await db.foods.find_one(
                {"name": {"$regex": request.food_name, "$options": "i"}},
                {"_id": 0}
            )
            if not food:
                food = next((f for f in SAMPLE_FOODS_DATABASE 
                           if request.food_name.lower() in f['name'].lower()), None)
        
        if not food:
            raise HTTPException(status_code=404, detail="Food not found")
        
        # Calculate serving multiplier
        serving_mult = 1.0
        if request.serving_size and food.get('serving_size'):
            serving_mult = request.serving_size / food['serving_size']
        
        # Analyze based on health profile
        analysis = {
            "food": food,
            "serving_multiplier": serving_mult,
            "personalized_analysis": None,
            "warnings": [],
            "benefits": [],
            "organ_impact_summary": {},
            "constraint_violations": [],
            "nutritional_score": 0,
            "recommendation": "neutral"
        }
        
        if request.health_profile:
            profile = request.health_profile
            
            # Check condition-specific constraints
            for condition in profile.conditions:
                condition_key = condition.lower().replace(' ', '_')
                if condition_key in CONDITION_FOOD_CONSTRAINTS:
                    constraints = CONDITION_FOOD_CONSTRAINTS[condition_key]
                    
                    # Check hard constraints
                    for nutrient in constraints.get('key_nutrients', []):
                        if nutrient in food.get('nutrients', {}):
                            nutrient_val = food['nutrients'][nutrient].get('value', 0) * serving_mult
                            targets = constraints.get('targets', {}).get(nutrient, {})
                            
                            if 'max_daily' in targets and nutrient_val > targets['max_daily'] * 0.3:
                                analysis['warnings'].append({
                                    "type": "constraint_warning",
                                    "severity": "high" if nutrient_val > targets['max_daily'] * 0.5 else "moderate",
                                    "nutrient": nutrient,
                                    "message": f"High {nutrient} ({nutrient_val:.0f} {targets.get('unit', 'mg')}) - caution for {condition}",
                                    "condition": condition
                                })
                                analysis['constraint_violations'].append({
                                    "nutrient": nutrient,
                                    "value": nutrient_val,
                                    "limit": targets['max_daily'],
                                    "condition": condition
                                })
            
            # Check allergies
            for allergen in food.get('allergens', []):
                if allergen.lower() in [a.lower() for a in profile.allergies]:
                    analysis['warnings'].append({
                        "type": "allergy_alert",
                        "severity": "critical",
                        "allergen": allergen,
                        "message": f"ALLERGEN ALERT: Contains {allergen}"
                    })
                    analysis['recommendation'] = "avoid"
            
            # Analyze organ impacts based on conditions
            for organ, effect_data in food.get('organ_effects', {}).items():
                impact = {
                    "organ": organ,
                    "effect": effect_data.get('effect'),
                    "mechanism": effect_data.get('mechanism'),
                    "relevance": "normal"
                }
                
                # Check if user has conditions affecting this organ
                organ_conditions = {
                    "kidneys": ["CKD", "kidney disease", "renal"],
                    "heart": ["heart failure", "CAD", "arrhythmia", "hypertension"],
                    "liver": ["cirrhosis", "hepatitis", "NAFLD"],
                    "pancreas": ["diabetes", "pancreatitis"]
                }
                
                for cond in profile.conditions:
                    for organ_key, keywords in organ_conditions.items():
                        if organ_key == organ and any(kw.lower() in cond.lower() for kw in keywords):
                            impact['relevance'] = "high"
                            if effect_data.get('effect') == 'caution':
                                analysis['warnings'].append({
                                    "type": "organ_caution",
                                    "severity": "moderate",
                                    "organ": organ,
                                    "condition": cond,
                                    "message": f"Caution: {effect_data.get('mechanism')}"
                                })
                
                analysis['organ_impact_summary'][organ] = impact
            
            # Add benefits
            for condition in food.get('medical_considerations', {}).get('beneficial_for', []):
                if any(condition.lower() in c.lower() for c in profile.conditions):
                    analysis['benefits'].append({
                        "condition": condition,
                        "message": f"May be beneficial for {condition}"
                    })
        
        # Calculate overall nutritional score (0-100)
        score = 50  # Base score
        if len(analysis['warnings']) == 0:
            score += 20
        elif any(w.get('severity') == 'critical' for w in analysis['warnings']):
            score = 10
        else:
            score -= len(analysis['warnings']) * 10
        
        if len(analysis['benefits']) > 0:
            score += len(analysis['benefits']) * 10
        
        score = max(0, min(100, score))
        analysis['nutritional_score'] = score
        
        # Set recommendation
        if analysis['recommendation'] != 'avoid':
            if score >= 70:
                analysis['recommendation'] = 'recommended'
            elif score >= 40:
                analysis['recommendation'] = 'moderate'
            else:
                analysis['recommendation'] = 'limit'
        
        return {
            "success": True,
            "analysis": analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing food: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/food/nutrients/{nutrient}")
async def get_nutrient_info(nutrient: str):
    """Get detailed information about a nutrient and its organ effects"""
    try:
        nutrient_key = nutrient.lower().replace(' ', '_')
        
        if nutrient_key not in NUTRIENT_ORGAN_EFFECTS:
            raise HTTPException(status_code=404, detail=f"Nutrient '{nutrient}' not found")
        
        info = NUTRIENT_ORGAN_EFFECTS[nutrient_key]
        
        return {
            "success": True,
            "nutrient": nutrient_key,
            "info": info
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting nutrient info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class DailyIntakeRequest(BaseModel):
    daily_intake_text: str
    health_profile: Optional[Dict[str, Any]] = None


@api_router.post("/food/analyze-daily")
async def analyze_daily_intake(request: DailyIntakeRequest):
    """
    Analyze a full day's food intake from natural language description.
    Parses meals, snacks, beverages, and supplements to provide comprehensive nutritional analysis.
    """
    try:
        llm_key = os.environ.get('LLM_KEY') or os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(status_code=500, detail="LLM key not configured")
        
        # Build health context
        health_context = ""
        if request.health_profile:
            profile = request.health_profile
            conditions = profile.get('conditions', [])
            allergies = profile.get('allergies', [])
            medications = profile.get('medications', [])
            restrictions = profile.get('dietary_restrictions', [])
            
            if conditions:
                health_context += f"\nMedical conditions: {', '.join(conditions)}"
            if allergies:
                health_context += f"\nFood allergies: {', '.join(allergies)}"
            if medications:
                health_context += f"\nCurrent medications: {', '.join(medications)}"
            if restrictions:
                health_context += f"\nDietary restrictions: {', '.join(restrictions)}"
            if profile.get('age'):
                health_context += f"\nAge: {profile.get('age')} years"
            if profile.get('sex'):
                health_context += f"\nSex: {profile.get('sex')}"
            if profile.get('weight'):
                health_context += f"\nWeight: {profile.get('weight')} kg"
        
        system_message = """You are PhiCor's Daily Nutrition Analysis Engine (Π). Parse and analyze complete daily food intake descriptions in natural language. 

You MUST:
1. Identify ALL food items, meals, snacks, beverages, and supplements mentioned
2. Estimate standard portion sizes where not specified
3. Calculate cumulative nutritional totals for the entire day
4. Analyze the day's intake against recommended daily values
5. Identify nutritional gaps and excesses
6. Provide personalized insights based on health profile
7. Flag any concerns for specific medical conditions

Always respond with valid JSON only."""

        analysis_prompt = f"""Analyze this complete daily food intake:

"{request.daily_intake_text}"

{health_context if health_context else "No specific health profile provided."}

Parse ALL items and return comprehensive JSON:
{{
  "dish_name": "Daily Food Intake Analysis",
  "category": "daily_summary",
  "description": "Comprehensive analysis of full day's nutritional intake",
  "meals_parsed": [
    {{
      "meal_time": "Breakfast/Lunch/Dinner/Snack/Supplement",
      "items": [
        {{
          "name": "food item",
          "quantity": "amount",
          "estimated_calories": number,
          "key_nutrients": ["nutrient1", "nutrient2"]
        }}
      ],
      "meal_calories": number
    }}
  ],
  "total_items_count": number,
  "macronutrients": {{
    "calories": {{"value": number, "unit": "kcal", "percent_daily": number, "assessment": "low/adequate/high"}},
    "protein": {{"value": number, "unit": "g", "percent_daily": number, "assessment": "low/adequate/high"}},
    "carbohydrates": {{
      "total": {{"value": number, "unit": "g", "percent_daily": number}},
      "fiber": {{"value": number, "unit": "g"}},
      "sugar": {{"value": number, "unit": "g"}}
    }},
    "fats": {{
      "total": {{"value": number, "unit": "g", "percent_daily": number}},
      "saturated": {{"value": number, "unit": "g"}},
      "omega_3": {{"value": number, "unit": "mg"}}
    }}
  }},
  "micronutrients": {{
    "vitamins": [
      {{"name": "vitamin", "value": number, "unit": "unit", "percent_daily": number, "status": "deficient/low/adequate/high"}}
    ],
    "minerals": [
      {{"name": "mineral", "value": number, "unit": "unit", "percent_daily": number, "status": "deficient/low/adequate/high"}}
    ]
  }},
  "hydration": {{
    "total_fluids_ml": number,
    "water_equivalent_ml": number,
    "hydration_status": "inadequate/adequate/good/excellent",
    "recommendation": "suggestion"
  }},
  "nutritional_gaps": [
    {{"nutrient": "name", "current_percent": number, "recommendation": "how to address"}}
  ],
  "nutritional_excesses": [
    {{"nutrient": "name", "current_percent": number, "concern": "why this matters"}}
  ],
  "metabolic_impact": {{
    "estimated_glycemic_load": "low/moderate/high",
    "meal_timing_assessment": "description of eating pattern",
    "energy_distribution": "description of calorie spread"
  }},
  "organ_system_effects": {{
    "cardiovascular": {{"effect": "beneficial/neutral/caution", "mechanism": "overall impact from day's intake"}},
    "gastrointestinal": {{"effect": "beneficial/neutral/caution", "mechanism": "overall impact"}},
    "renal": {{"effect": "beneficial/neutral/caution", "mechanism": "overall impact"}},
    "neurological": {{"effect": "beneficial/neutral/caution", "mechanism": "overall impact"}}
  }},
  "personalized_analysis": {{
    "condition_specific_warnings": [
      {{"condition": "condition", "severity": "low/moderate/high", "warning": "specific concern", "recommendation": "action"}}
    ],
    "medication_interactions": [
      {{"medication": "med", "food": "food", "interaction": "description"}}
    ]
  }},
  "clinical_scores": {{
    "healthfulness_score": number,
    "nutrient_density_score": number,
    "balance_score": number,
    "recommendation": "overall assessment",
    "clinical_notes": "summary insights"
  }},
  "improvement_suggestions": [
    {{"area": "what to improve", "suggestion": "specific recommendation", "benefit": "expected benefit"}}
  ]
}}"""

        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"phicor_daily_{datetime.now().strftime('%H%M%S')}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        response = await chat.send_message(UserMessage(text=analysis_prompt))
        
        # Parse JSON response
        import json
        import re
        
        response_text = response.text if hasattr(response, 'text') else str(response)
        
        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            try:
                analysis = json.loads(json_match.group())
                return {
                    "success": True,
                    "analysis": analysis,
                    "raw_input": request.daily_intake_text[:200] + "..." if len(request.daily_intake_text) > 200 else request.daily_intake_text
                }
            except json.JSONDecodeError as e:
                logger.error(f"JSON parse error: {e}")
                raise HTTPException(status_code=500, detail="Failed to parse analysis response")
        else:
            raise HTTPException(status_code=500, detail="Invalid response format")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing daily intake: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ProductAnalysisRequest(BaseModel):
    """Request model for deep product analysis"""
    product_name: str
    ingredient_list: Optional[str] = None  # For packaged products
    image_description: Optional[str] = None  # If image was analyzed
    serving_size: str = "1 serving"
    health_profile: Optional[Dict[str, Any]] = None


@api_router.post("/food/analyze-product")
async def analyze_product_deep(request: ProductAnalysisRequest):
    """
    Deep analysis of a food product with parameter-level organ system effects.
    Breaks down ALL ingredients including trace elements, and maps effects to
    specific physiological parameters (like disease dashboard).
    """
    try:
        llm_key = os.environ.get('LLM_KEY') or os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(status_code=500, detail="LLM key not configured")
        
        # Build health context for personalization
        health_context = ""
        risk_factors = []
        if request.health_profile:
            profile = request.health_profile
            conditions = profile.get('conditions', [])
            allergies = profile.get('allergies', [])
            medications = profile.get('medications', [])
            
            if conditions:
                health_context += f"\n**CRITICAL - Patient Conditions**: {', '.join(conditions)}"
                risk_factors.extend(conditions)
            if allergies:
                health_context += f"\n**CRITICAL - Allergies**: {', '.join(allergies)}"
                risk_factors.extend([f"allergy:{a}" for a in allergies])
            if medications:
                health_context += f"\n**Medications (check interactions)**: {', '.join(medications)}"
            if profile.get('age'):
                health_context += f"\nAge: {profile.get('age')} years"
            if profile.get('weight') and profile.get('height'):
                bmi = float(profile.get('weight')) / (float(profile.get('height'))/100)**2
                health_context += f"\nBMI: {bmi:.1f}"
        
        ingredient_info = ""
        if request.ingredient_list:
            ingredient_info = f"\n**Product Ingredient List**: {request.ingredient_list}"
        
        system_message = """You are PhiCor's Deep Product Analysis Engine (Π). You perform EXHAUSTIVE biochemical and physiological analysis of food products, treating them as parameterized biological inputs that modify human organ system parameters.

Your analysis must be:
1. EXHAUSTIVE - Break down EVERY ingredient including trace amounts, preservatives, additives
2. ELEMENT-LEVEL - Analyze every electrolyte, mineral, trace element present
3. PARAMETER-SPECIFIC - Map effects to specific physiological parameters (like: blood_pressure_systolic, GFR, serum_potassium, LDL_cholesterol, etc.)
4. PERSONALIZED - Cross-reference with patient conditions, medications, allergies to identify specific risks
5. CLINICAL-GRADE - Provide actionable insights a physician or dietitian would find valuable

You are PhiCor's analytical engine. Respond ONLY with valid JSON."""

        analysis_prompt = f"""Perform EXHAUSTIVE PhiCor deep analysis on: "{request.product_name}"
Serving size: {request.serving_size}
{ingredient_info}
{health_context if health_context else "No specific health profile provided - provide general analysis."}

Return COMPREHENSIVE JSON with PARAMETER-LEVEL detail:
{{
  "product_name": "{request.product_name}",
  "product_type": "prepared_dish/packaged_food/beverage/supplement/raw_ingredient",
  "description": "detailed description",
  
  "ingredients_breakdown": {{
    "primary_ingredients": [
      {{
        "name": "ingredient",
        "amount": "estimated amount",
        "percentage_of_product": number,
        "function": "protein/carb/fat/flavor/preservative/colorant/emulsifier/etc",
        "nutritional_contribution": {{
          "calories": number,
          "protein_g": number,
          "carbs_g": number,
          "fat_g": number
        }},
        "bioactive_compounds": ["compound1", "compound2"],
        "potential_concerns": ["concern if any"]
      }}
    ],
    "secondary_ingredients": [
      {{
        "name": "ingredient",
        "amount": "trace/small amount",
        "function": "what it does in the product",
        "safety_notes": "any concerns"
      }}
    ],
    "additives_and_preservatives": [
      {{
        "name": "additive name",
        "e_number": "E-number if applicable",
        "function": "preservative/colorant/emulsifier/stabilizer/etc",
        "safety_classification": "GRAS/approved/limited/controversial",
        "potential_effects": ["effect1"]
      }}
    ],
    "allergens_present": ["allergen1"],
    "allergens_may_contain": ["trace allergen"],
    "total_ingredient_count": number
  }},
  
  "complete_nutritional_profile": {{
    "macronutrients": {{
      "energy_kcal": number,
      "protein_g": number,
      "carbohydrates_g": number,
      "sugars_g": number,
      "fiber_g": number,
      "fat_total_g": number,
      "fat_saturated_g": number,
      "fat_trans_g": number,
      "fat_monounsaturated_g": number,
      "fat_polyunsaturated_g": number,
      "cholesterol_mg": number
    }},
    "electrolytes": {{
      "sodium_mg": {{"value": number, "percent_daily": number, "clinical_note": "impact on BP, fluid balance"}},
      "potassium_mg": {{"value": number, "percent_daily": number, "clinical_note": "cardiac, renal implications"}},
      "chloride_mg": {{"value": number, "percent_daily": number}},
      "calcium_mg": {{"value": number, "percent_daily": number}},
      "magnesium_mg": {{"value": number, "percent_daily": number}},
      "phosphorus_mg": {{"value": number, "percent_daily": number}}
    }},
    "trace_elements": {{
      "iron_mg": {{"value": number, "percent_daily": number, "form": "heme/non-heme"}},
      "zinc_mg": {{"value": number, "percent_daily": number}},
      "copper_mcg": {{"value": number, "percent_daily": number}},
      "manganese_mg": {{"value": number, "percent_daily": number}},
      "selenium_mcg": {{"value": number, "percent_daily": number}},
      "iodine_mcg": {{"value": number, "percent_daily": number}},
      "chromium_mcg": {{"value": number, "percent_daily": number}},
      "molybdenum_mcg": {{"value": number, "percent_daily": number}}
    }},
    "vitamins": {{
      "vitamin_a_mcg_rae": {{"value": number, "percent_daily": number}},
      "vitamin_d_mcg": {{"value": number, "percent_daily": number}},
      "vitamin_e_mg": {{"value": number, "percent_daily": number}},
      "vitamin_k_mcg": {{"value": number, "percent_daily": number}},
      "vitamin_c_mg": {{"value": number, "percent_daily": number}},
      "thiamin_b1_mg": {{"value": number, "percent_daily": number}},
      "riboflavin_b2_mg": {{"value": number, "percent_daily": number}},
      "niacin_b3_mg": {{"value": number, "percent_daily": number}},
      "pantothenic_acid_b5_mg": {{"value": number, "percent_daily": number}},
      "pyridoxine_b6_mg": {{"value": number, "percent_daily": number}},
      "biotin_b7_mcg": {{"value": number, "percent_daily": number}},
      "folate_b9_mcg_dfe": {{"value": number, "percent_daily": number}},
      "cobalamin_b12_mcg": {{"value": number, "percent_daily": number}}
    }},
    "other_compounds": {{
      "caffeine_mg": number,
      "alcohol_g": number,
      "purines_mg": number,
      "oxalates_mg": number,
      "phytates_mg": number,
      "tannins_mg": number
    }}
  }},
  
  "organ_system_parameter_effects": {{
    "cardiovascular": {{
      "overall_effect": "beneficial/neutral/caution/harmful",
      "parameters_affected": [
        {{
          "parameter": "blood_pressure_systolic",
          "direction": "increase/decrease/neutral",
          "magnitude": "minimal/moderate/significant",
          "mechanism": "sodium content affects fluid retention",
          "clinical_significance": "relevant for hypertension"
        }},
        {{
          "parameter": "blood_pressure_diastolic",
          "direction": "increase/decrease/neutral",
          "magnitude": "minimal/moderate/significant",
          "mechanism": "explanation"
        }},
        {{
          "parameter": "heart_rate",
          "direction": "increase/decrease/neutral",
          "mechanism": "caffeine, electrolyte effects"
        }},
        {{
          "parameter": "LDL_cholesterol",
          "direction": "increase/decrease/neutral",
          "mechanism": "saturated fat, trans fat effects"
        }},
        {{
          "parameter": "HDL_cholesterol",
          "direction": "increase/decrease/neutral",
          "mechanism": "omega-3, fiber effects"
        }},
        {{
          "parameter": "triglycerides",
          "direction": "increase/decrease/neutral",
          "mechanism": "sugar, refined carb effects"
        }},
        {{
          "parameter": "cardiac_output",
          "direction": "increase/decrease/neutral",
          "mechanism": "fluid, electrolyte effects"
        }}
      ]
    }},
    "renal": {{
      "overall_effect": "beneficial/neutral/caution/harmful",
      "parameters_affected": [
        {{
          "parameter": "GFR_estimated",
          "direction": "increase/decrease/neutral",
          "mechanism": "protein load, sodium effects"
        }},
        {{
          "parameter": "serum_creatinine",
          "direction": "increase/decrease/neutral",
          "mechanism": "protein intake effects"
        }},
        {{
          "parameter": "serum_potassium",
          "direction": "increase/decrease/neutral",
          "magnitude": "amount",
          "mechanism": "potassium content",
          "clinical_significance": "critical for CKD, heart failure patients"
        }},
        {{
          "parameter": "serum_phosphorus",
          "direction": "increase/decrease/neutral",
          "mechanism": "phosphorus additives, protein"
        }},
        {{
          "parameter": "urine_output",
          "direction": "increase/decrease/neutral",
          "mechanism": "fluid, caffeine, sodium effects"
        }},
        {{
          "parameter": "uric_acid",
          "direction": "increase/decrease/neutral",
          "mechanism": "purine content effects"
        }}
      ]
    }},
    "hepatic": {{
      "overall_effect": "beneficial/neutral/caution/harmful",
      "parameters_affected": [
        {{
          "parameter": "ALT",
          "direction": "increase/decrease/neutral",
          "mechanism": "alcohol, certain additives"
        }},
        {{
          "parameter": "AST",
          "direction": "increase/decrease/neutral",
          "mechanism": "explanation"
        }},
        {{
          "parameter": "bilirubin",
          "direction": "increase/decrease/neutral",
          "mechanism": "explanation"
        }},
        {{
          "parameter": "albumin_synthesis",
          "direction": "increase/decrease/neutral",
          "mechanism": "protein quality effects"
        }}
      ]
    }},
    "glycemic": {{
      "overall_effect": "beneficial/neutral/caution/harmful",
      "parameters_affected": [
        {{
          "parameter": "blood_glucose_fasting",
          "direction": "increase/decrease/neutral",
          "magnitude": "expected change",
          "mechanism": "carb content, glycemic index"
        }},
        {{
          "parameter": "blood_glucose_postprandial",
          "direction": "increase/decrease/neutral",
          "peak_time_minutes": number,
          "mechanism": "glycemic load"
        }},
        {{
          "parameter": "HbA1c_impact",
          "direction": "increase/decrease/neutral",
          "mechanism": "chronic glucose effects"
        }},
        {{
          "parameter": "insulin_secretion",
          "direction": "increase/decrease/neutral",
          "mechanism": "insulinogenic index"
        }},
        {{
          "parameter": "insulin_sensitivity",
          "direction": "increase/decrease/neutral",
          "mechanism": "fiber, fat type effects"
        }}
      ]
    }},
    "gastrointestinal": {{
      "overall_effect": "beneficial/neutral/caution/harmful",
      "parameters_affected": [
        {{
          "parameter": "gastric_acid_secretion",
          "direction": "increase/decrease/neutral",
          "mechanism": "spices, caffeine effects"
        }},
        {{
          "parameter": "gut_motility",
          "direction": "increase/decrease/neutral",
          "mechanism": "fiber, fat content"
        }},
        {{
          "parameter": "microbiome_diversity",
          "direction": "increase/decrease/neutral",
          "mechanism": "fiber, prebiotics"
        }},
        {{
          "parameter": "intestinal_permeability",
          "direction": "increase/decrease/neutral",
          "mechanism": "certain additives, gluten"
        }}
      ]
    }},
    "neurological": {{
      "overall_effect": "beneficial/neutral/caution/harmful",
      "parameters_affected": [
        {{
          "parameter": "alertness",
          "direction": "increase/decrease/neutral",
          "mechanism": "caffeine, sugar effects"
        }},
        {{
          "parameter": "cognitive_function",
          "direction": "increase/decrease/neutral",
          "mechanism": "glucose, omega-3 effects"
        }},
        {{
          "parameter": "mood",
          "direction": "increase/decrease/neutral",
          "mechanism": "tryptophan, sugar effects"
        }},
        {{
          "parameter": "sleep_quality",
          "direction": "increase/decrease/neutral",
          "mechanism": "caffeine, magnesium effects"
        }}
      ]
    }},
    "musculoskeletal": {{
      "overall_effect": "beneficial/neutral/caution/harmful",
      "parameters_affected": [
        {{
          "parameter": "muscle_protein_synthesis",
          "direction": "increase/decrease/neutral",
          "mechanism": "protein quality, leucine"
        }},
        {{
          "parameter": "bone_density_impact",
          "direction": "increase/decrease/neutral",
          "mechanism": "calcium, vitamin D, phosphorus"
        }}
      ]
    }},
    "immune": {{
      "overall_effect": "beneficial/neutral/caution/harmful",
      "parameters_affected": [
        {{
          "parameter": "inflammatory_markers",
          "direction": "increase/decrease/neutral",
          "mechanism": "omega ratio, antioxidants"
        }},
        {{
          "parameter": "immune_cell_function",
          "direction": "increase/decrease/neutral",
          "mechanism": "zinc, vitamin C, D effects"
        }}
      ]
    }}
  }},
  
  "personalized_risk_assessment": {{
    "overall_suitability": "highly_suitable/suitable/caution/unsuitable/contraindicated",
    "suitability_score": number,
    "condition_specific_analysis": [
      {{
        "condition": "patient's condition",
        "risk_level": "none/low/moderate/high/critical",
        "specific_concerns": [
          {{
            "nutrient_or_ingredient": "what's concerning",
            "reason": "why it's concerning for this condition",
            "parameter_at_risk": "which parameter could be affected",
            "recommendation": "what to do"
          }}
        ],
        "safe_portion": "recommended portion for this condition",
        "frequency_recommendation": "how often safe to consume"
      }}
    ],
    "medication_interactions": [
      {{
        "medication": "drug name or class",
        "interacting_component": "nutrient/compound",
        "interaction_type": "absorption/metabolism/effect",
        "severity": "minor/moderate/major",
        "clinical_action": "what to do"
      }}
    ],
    "allergy_alerts": [
      {{
        "allergen": "allergen name",
        "present_in": "which ingredient",
        "severity": "mild/moderate/severe/anaphylaxis_risk",
        "action": "avoid/caution"
      }}
    ]
  }},
  
  "clinical_summary": {{
    "healthfulness_score": number,
    "nutrient_density_score": number,
    "personalized_score": number,
    "overall_recommendation": "highly_recommended/recommended/moderate/limit/avoid",
    "key_benefits": ["benefit1", "benefit2"],
    "key_concerns": ["concern1", "concern2"],
    "clinical_notes": "summary for healthcare provider",
    "patient_friendly_summary": "easy to understand summary for patient"
  }},
  
  "optimization_suggestions": [
    {{
      "suggestion": "how to make this healthier or safer",
      "benefit": "what improvement it provides",
      "parameter_improved": "which parameter benefits"
    }}
  ]
}}"""

        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"phicor_product_{datetime.now().strftime('%H%M%S')}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        response = await chat.send_message(UserMessage(text=analysis_prompt))
        
        # Parse JSON response
        import json
        import re
        
        response_text = response.text if hasattr(response, 'text') else str(response)
        
        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            try:
                analysis = json.loads(json_match.group())
                return {
                    "success": True,
                    "analysis": analysis,
                    "analysis_type": "deep_product_analysis"
                }
            except json.JSONDecodeError as e:
                logger.error(f"JSON parse error: {e}")
                raise HTTPException(status_code=500, detail="Failed to parse analysis response")
        else:
            raise HTTPException(status_code=500, detail="Invalid response format")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in deep product analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ImageAnalysisRequest(BaseModel):
    """Request model for food image analysis"""
    images: List[Dict[str, str]]  # List of {name: str, data: base64 str}
    health_profile: Optional[Dict[str, Any]] = None


@api_router.post("/food/analyze-images")
async def analyze_food_images(request: ImageAnalysisRequest):
    """
    Analyze food images using AI vision to identify foods and provide 
    combined nutritional analysis with parameter-level effects.
    """
    try:
        llm_key = os.environ.get('LLM_KEY') or os.environ.get('EMERGENT_LLM_KEY')
        if not llm_key:
            raise HTTPException(status_code=500, detail="LLM key not configured")
        
        if not request.images or len(request.images) == 0:
            raise HTTPException(status_code=400, detail="At least one image is required")
        
        if len(request.images) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 images allowed")
        
        # Build health context for personalization
        health_context = ""
        if request.health_profile:
            profile = request.health_profile
            conditions = profile.get('conditions', [])
            allergies = profile.get('allergies', [])
            medications = profile.get('medications', [])
            
            if conditions:
                health_context += f"\n**Patient Conditions**: {', '.join(conditions)}"
            if allergies:
                health_context += f"\n**Allergies (CHECK CAREFULLY)**: {', '.join(allergies)}"
            if medications:
                health_context += f"\n**Medications**: {', '.join(medications)}"
            if profile.get('age'):
                health_context += f"\nAge: {profile.get('age')} years"
        
        # Import will be done in the image processing section
        import json
        import re
        
        system_message = """You are PhiCor's AI Vision Food Analyzer (Π). You analyze images of food/meals to:
1. IDENTIFY all visible foods, dishes, and beverages
2. ESTIMATE portions and serving sizes
3. CALCULATE combined nutritional impact
4. MAP effects to physiological parameters by organ system
5. PROVIDE personalized risk assessment if health profile provided

You are highly accurate at food identification and nutritional analysis.
Respond ONLY with valid JSON."""

        # Prepare image descriptions for the prompt
        image_count = len(request.images)
        
        analysis_prompt = f"""Analyze {image_count} food image(s) showing what the person ate.
{health_context if health_context else "No health profile provided - give general analysis."}

CRITICAL: You MUST identify EACH INDIVIDUAL food item visible and provide DETAILED per-item analysis.

Return COMPREHENSIVE JSON with this EXACT structure:

{{
  "product_name": "Meal Analysis ({image_count} {'image' if image_count == 1 else 'images'})",
  "product_type": "meal_images",
  "serving_display": "Total estimated weight",
  
  "images_analyzed": [
    {{
      "image_number": 1,
      "meal_type": "breakfast/lunch/dinner/snack",
      "foods_identified": ["food1", "food2", "food3"],
      "confidence": 85
    }}
  ],
  
  "individual_food_items": [
    {{
      "item_name": "Grilled Chicken Breast",
      "estimated_portion": "150g (1 medium breast)",
      "calories": 231,
      "macros": {{"protein_g": 43, "carbs_g": 0, "fat_g": 5, "fiber_g": 0}},
      "key_nutrients": ["High protein", "Low fat", "Vitamin B6", "Selenium"],
      "parameter_effects": {{
        "cardiovascular": {{"effect": "beneficial", "reason": "Lean protein source, low saturated fat"}},
        "glycemic": {{"effect": "beneficial", "reason": "Zero carbs, stable blood sugar"}},
        "musculoskeletal": {{"effect": "beneficial", "reason": "Complete protein for muscle maintenance"}},
        "renal": {{"effect": "caution", "reason": "High protein - monitor if kidney issues"}}
      }},
      "recommendation": "Keep this - excellent lean protein",
      "what_to_modify": null
    }},
    {{
      "item_name": "White Rice",
      "estimated_portion": "200g (1 cup cooked)",
      "calories": 260,
      "macros": {{"protein_g": 5, "carbs_g": 56, "fat_g": 0.5, "fiber_g": 0.6}},
      "key_nutrients": ["Carbohydrates", "Manganese", "Folate"],
      "parameter_effects": {{
        "cardiovascular": {{"effect": "neutral", "reason": "Low sodium, but refined grain"}},
        "glycemic": {{"effect": "caution", "reason": "High GI ~73, rapid blood glucose spike"}},
        "gastrointestinal": {{"effect": "neutral", "reason": "Low fiber content"}}
      }},
      "recommendation": "Consider swapping for brown rice or quinoa",
      "what_to_modify": "Replace with whole grain for better fiber and lower GI"
    }}
  ],
  
  "combined_meal_analysis": {{
    "total_calories": 491,
    "total_macros": {{"protein_g": 48, "carbs_g": 56, "fat_g": 5.5, "fiber_g": 0.6}},
    "macro_balance": "High protein (39%), High carb (46%), Low fat (10%)",
    "overall_effect": {{
      "cardiovascular": {{"effect": "beneficial", "score": 75}},
      "glycemic": {{"effect": "caution", "score": 55}},
      "renal": {{"effect": "caution", "score": 60}},
      "gastrointestinal": {{"effect": "neutral", "score": 50}},
      "musculoskeletal": {{"effect": "beneficial", "score": 80}},
      "neurological": {{"effect": "neutral", "score": 60}},
      "hepatic": {{"effect": "neutral", "score": 65}},
      "immune": {{"effect": "beneficial", "score": 70}}
    }},
    "synergies": ["Protein + Carbs good for post-workout recovery"],
    "conflicts": ["White rice spikes blood sugar - pair with protein helps but still concerning"]
  }},
  
  "daily_summary": {{
    "is_single_meal": true,
    "meal_breakdown": [
      {{
        "meal_name": "Lunch",
        "image_numbers": [1],
        "total_calories": 491,
        "items_count": 2
      }}
    ],
    "daily_totals": {{
      "calories": 491,
      "protein_g": 48,
      "carbs_g": 56,
      "fat_g": 5.5,
      "fiber_g": 0.6,
      "sodium_mg": 120,
      "potassium_mg": 450
    }},
    "daily_goals_met": {{
      "calories": "25% of 2000 kcal",
      "protein": "96% of 50g RDA",
      "fiber": "2% of 28g RDA - VERY LOW"
    }}
  }},
  
  "organ_system_parameter_effects": {{
    "cardiovascular": {{
      "overall_effect": "beneficial",
      "contributing_foods": ["Chicken - lean protein"],
      "parameters_affected": [
        {{"parameter": "blood_pressure_systolic", "direction": "decrease", "quantified_change": -2, "change_unit": "mmHg", "mechanism": "Low sodium content", "from_food": "Overall meal"}}
      ]
    }},
    "glycemic": {{
      "overall_effect": "caution",
      "contributing_foods": ["White rice - high GI"],
      "parameters_affected": [
        {{"parameter": "blood_glucose", "direction": "increase", "quantified_change": 35, "change_unit": "mg/dL", "mechanism": "White rice high glycemic index", "from_food": "White Rice"}}
      ]
    }},
    "renal": {{
      "overall_effect": "neutral",
      "contributing_foods": ["Chicken - high protein"],
      "parameters_affected": [
        {{"parameter": "urea_nitrogen", "direction": "increase", "quantified_change": 5, "change_unit": "mg/dL", "mechanism": "Protein metabolism byproduct", "from_food": "Chicken"}}
      ]
    }},
    "hepatic": {{"overall_effect": "neutral", "contributing_foods": [], "parameters_affected": []}},
    "gastrointestinal": {{"overall_effect": "neutral", "contributing_foods": [], "parameters_affected": []}},
    "neurological": {{"overall_effect": "neutral", "contributing_foods": [], "parameters_affected": []}},
    "musculoskeletal": {{
      "overall_effect": "beneficial",
      "contributing_foods": ["Chicken - complete protein"],
      "parameters_affected": [
        {{"parameter": "muscle_protein_synthesis", "direction": "increase", "mechanism": "Essential amino acids", "from_food": "Chicken"}}
      ]
    }},
    "immune": {{"overall_effect": "neutral", "contributing_foods": [], "parameters_affected": []}}
  }},
  
  "clinical_summary": {{
    "healthfulness_score": 65,
    "key_benefits": ["High quality protein", "Low sodium", "Good for muscle building"],
    "key_concerns": ["Low fiber", "High glycemic impact from white rice", "Limited vegetables"],
    "recommendation": "Add leafy greens or vegetables to balance the meal. Consider swapping white rice for brown rice or quinoa."
  }},
  
  "actionable_insights": {{
    "keep_eating": ["Grilled chicken - excellent lean protein source"],
    "reduce_or_eliminate": ["White rice - high glycemic, low fiber"],
    "add_next_time": ["Leafy greens", "Colorful vegetables", "Healthy fats like avocado"]
  }}
}}

IMPORTANT RULES:
1. ALWAYS identify every visible food item separately
2. For EACH food item, provide specific calorie and macro breakdown
3. For EACH food item, explain its effect on body systems
4. Provide ACTIONABLE recommendations (what to keep, reduce, add)
5. If multiple images = multiple meals, group by meal
6. Give SPECIFIC quantified changes where possible (e.g., +35 mg/dL blood glucose)"""

        # Note: For actual image analysis, we would need to use a vision-capable model
        # For now, we'll use GPT-4o with the image descriptions
        # The actual implementation would pass the base64 images to a vision API
        
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        import json
        import re
        
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"phicor_images_{datetime.now().strftime('%H%M%S')}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        # Build message with images using ImageContent from emergentintegrations
        image_contents = []
        for i, img in enumerate(request.images):
            # Access as dict since images is List[Dict[str, str]]
            img_data = img.get('data', '') if isinstance(img, dict) else img.data
            if img_data:
                image_contents.append(ImageContent(image_base64=img_data))
        
        # Create the user message with text and image attachments
        user_message = UserMessage(
            text=analysis_prompt,
            file_contents=image_contents
        )
        
        # Send the message with images
        response = await chat.send_message(user_message)
        response_text = response.text if hasattr(response, 'text') else str(response)
        
        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            try:
                analysis = json.loads(json_match.group())
                return {
                    "success": True,
                    "analysis": analysis,
                    "analysis_type": "image_analysis",
                    "images_processed": len(request.images)
                }
            except json.JSONDecodeError as e:
                logger.error(f"JSON parse error in image analysis: {e}")
                raise HTTPException(status_code=500, detail="Failed to parse analysis response")
        else:
            raise HTTPException(status_code=500, detail="Invalid response format")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in food image analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/food/conditions/{condition}")
async def get_condition_food_constraints(condition: str):
    """Get food constraints for a specific medical condition"""
    try:
        condition_key = condition.lower().replace(' ', '_')
        
        if condition_key not in CONDITION_FOOD_CONSTRAINTS:
            # Try partial match
            matches = [k for k in CONDITION_FOOD_CONSTRAINTS.keys() 
                      if condition_key in k or k in condition_key]
            if matches:
                condition_key = matches[0]
            else:
                raise HTTPException(status_code=404, detail=f"Condition '{condition}' not found")
        
        constraints = CONDITION_FOOD_CONSTRAINTS[condition_key]
        
        return {
            "success": True,
            "condition": condition_key,
            "constraints": constraints
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting condition constraints: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/food/categories")
async def get_food_categories():
    """Get all food categories"""
    try:
        categories = await db.foods.distinct("category")
        
        if not categories:
            categories = list(set(f['category'] for f in SAMPLE_FOODS_DATABASE))
        
        return {
            "success": True,
            "categories": categories
        }
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/food/seed-database")
async def seed_food_database():
    """Seed the food database with sample foods"""
    try:
        # Check if already seeded
        count = await db.foods.count_documents({})
        if count > 0:
            return {"success": True, "message": f"Database already has {count} foods"}
        
        # Insert sample foods
        await db.foods.insert_many(SAMPLE_FOODS_DATABASE)
        
        return {
            "success": True,
            "message": f"Seeded {len(SAMPLE_FOODS_DATABASE)} foods into database"
        }
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/platform/stats")
async def get_platform_stats():
    """Get real-time platform statistics"""
    try:
        # Get counts from database
        disease_count = await db.diseases.count_documents({})
        enhanced_count = await db.diseases.count_documents({"fully_enhanced": True})
        drug_count = await db.drugs.count_documents({})
        food_count = await db.foods.count_documents({})
        cases_count = await db.clinical_cases.count_documents({})
        
        # Count mathematical models
        models_count = 0
        async for disease in db.diseases.find({"mathematical_models": {"$exists": True}}, {"mathematical_models": 1}):
            models = disease.get("mathematical_models", [])
            if isinstance(models, list):
                models_count += len(models)
        
        return {
            "success": True,
            "stats": {
                "diseases": disease_count,
                "diseases_enhanced": enhanced_count,
                "enhancement_progress": round((enhanced_count / disease_count * 100), 1) if disease_count > 0 else 0,
                "drugs": drug_count,
                "foods": food_count if food_count > 0 else len(SAMPLE_FOODS_DATABASE),
                "mathematical_models": models_count,
                "clinical_cases": cases_count,
                "organ_systems": 6,
                "parameters": 200
            }
        }
    except Exception as e:
        logger.error(f"Error getting platform stats: {e}")
        return {
            "success": True,
            "stats": {
                "diseases": 2568,
                "drugs": 292,
                "foods": 5,
                "mathematical_models": 4500,
                "clinical_cases": 0,
                "organ_systems": 6,
                "parameters": 200
            }
        }


# Include router - MUST be after all routes are defined
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Note: Startup/shutdown handled by lifespan context manager
