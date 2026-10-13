"""
MEDIQ Medical Records Service

Handles:
- Longitudinal patient medication records
- PDF and image upload processing
- Historical prescription tracking
- Patient medication timeline
"""

from datetime import datetime, timezone
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field, asdict
from enum import Enum
import hashlib
import json
import base64
import re


class RecordType(Enum):
    PRESCRIPTION = "prescription"
    DISCHARGE_SUMMARY = "discharge_summary"
    MEDICATION_LIST = "medication_list"
    LAB_RESULTS = "lab_results"
    CLINICAL_NOTE = "clinical_note"


class ExtractionSource(Enum):
    MANUAL_ENTRY = "manual_entry"
    IMAGE_OCR = "image_ocr"
    PDF_EXTRACTION = "pdf_extraction"
    API_IMPORT = "api_import"


@dataclass
class ExtractedMedication:
    """A medication extracted from a medical record"""
    generic_name: str
    brand_name: Optional[str] = None
    strength: Optional[str] = None
    dose: Optional[str] = None
    route: str = "oral"
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    prescriber: Optional[str] = None
    confidence: str = "HIGH"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: bool = True
    
    def to_dict(self) -> Dict:
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class MedicalRecord:
    """A medical record containing medications and patient data"""
    record_id: str
    patient_id: Optional[str]
    record_type: str
    source: str
    created_at: str
    
    # Extracted data
    medications: List[Dict] = field(default_factory=list)
    patient_context: Dict = field(default_factory=dict)
    
    # Original document info
    document_name: Optional[str] = None
    document_hash: Optional[str] = None
    document_type: Optional[str] = None  # image/pdf
    
    # Extraction metadata
    extraction_confidence: str = "MEDIUM"
    extraction_issues: List[str] = field(default_factory=list)
    raw_text: Optional[str] = None
    
    # Analysis results
    analysis_performed: bool = False
    analysis_results: Optional[Dict] = None
    
    def to_dict(self) -> Dict:
        return {
            "record_id": self.record_id,
            "patient_id": self.patient_id,
            "record_type": self.record_type,
            "source": self.source,
            "created_at": self.created_at,
            "medications": self.medications,
            "patient_context": self.patient_context,
            "document_name": self.document_name,
            "document_hash": self.document_hash,
            "document_type": self.document_type,
            "extraction_confidence": self.extraction_confidence,
            "extraction_issues": self.extraction_issues,
            "analysis_performed": self.analysis_performed,
            "analysis_results": self.analysis_results
        }


def generate_record_id() -> str:
    """Generate a unique record ID"""
    timestamp = datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')
    return f"MR-{timestamp[:14]}"


def compute_document_hash(data: bytes) -> str:
    """Compute SHA256 hash of document for deduplication"""
    return hashlib.sha256(data).hexdigest()[:16]


def is_pdf_data(data: str) -> bool:
    """Check if data URL or base64 is a PDF"""
    if data.startswith('data:application/pdf'):
        return True
    # Check for PDF magic bytes in base64
    if data.startswith('data:'):
        base64_data = data.split(',')[1] if ',' in data else data
    else:
        base64_data = data
    
    try:
        decoded = base64.b64decode(base64_data[:100])
        return decoded[:4] == b'%PDF'
    except Exception:
        return False


def extract_text_from_pdf_base64(pdf_base64: str) -> Optional[str]:
    """
    Extract text from a PDF using basic parsing.
    For production, use PyMuPDF or similar library.
    Returns extracted text or None if extraction fails.
    """
    try:
        # Remove data URL prefix if present
        if pdf_base64.startswith('data:'):
            pdf_base64 = pdf_base64.split(',')[1] if ',' in pdf_base64 else pdf_base64
        
        # Decode base64
        pdf_bytes = base64.b64decode(pdf_base64)
        
        # Very basic text extraction - look for text streams
        # In production, use PyMuPDF: import fitz; doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_parts = []
        
        # Look for text objects in PDF
        pdf_str = pdf_bytes.decode('latin-1', errors='ignore')
        
        # Extract text between BT (begin text) and ET (end text) markers
        bt_pattern = r'BT(.*?)ET'
        matches = re.findall(bt_pattern, pdf_str, re.DOTALL)
        
        for match in matches:
            # Extract text from Tj and TJ operators
            tj_pattern = r'\((.*?)\)\s*Tj'
            tj_matches = re.findall(tj_pattern, match)
            text_parts.extend(tj_matches)
        
        if text_parts:
            return ' '.join(text_parts)
        
        # If no text found, return None (will use Vision OCR instead)
        return None
        
    except Exception as e:
        return None


class MedicalRecordsService:
    """Service for managing medical records with MongoDB"""
    
    def __init__(self, db):
        self.db = db
        self.collection_name = "mediq_records"
    
    async def ensure_collection(self):
        """Ensure the collection exists with proper indexes"""
        collection = self.db[self.collection_name]
        
        # Create indexes for efficient queries
        await collection.create_index("record_id", unique=True)
        await collection.create_index("patient_id")
        await collection.create_index("created_at")
        await collection.create_index("document_hash")
        
        return collection
    
    async def save_record(self, record: MedicalRecord) -> Dict:
        """Save a medical record to MongoDB"""
        collection = await self.ensure_collection()
        
        record_dict = record.to_dict()
        
        # Check for duplicate document
        if record.document_hash:
            existing = await collection.find_one({"document_hash": record.document_hash})
            if existing:
                return {
                    "success": False,
                    "error": "duplicate_document",
                    "message": "This document has already been uploaded",
                    "existing_record_id": existing.get("record_id")
                }
        
        # Insert the record
        result = await collection.insert_one(record_dict)
        
        return {
            "success": True,
            "record_id": record.record_id,
            "inserted_id": str(result.inserted_id)
        }
    
    async def get_record(self, record_id: str) -> Optional[Dict]:
        """Get a single record by ID"""
        collection = await self.ensure_collection()
        record = await collection.find_one(
            {"record_id": record_id},
            {"_id": 0}
        )
        return record
    
    async def get_patient_records(self, patient_id: str, limit: int = 50) -> List[Dict]:
        """Get all records for a patient, sorted by date"""
        collection = await self.ensure_collection()
        
        cursor = collection.find(
            {"patient_id": patient_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit)
        
        records = await cursor.to_list(length=limit)
        return records
    
    async def get_patient_medication_timeline(self, patient_id: str) -> Dict:
        """
        Build a longitudinal medication timeline for a patient.
        Returns all medications with start/end dates and current status.
        """
        records = await self.get_patient_records(patient_id)
        
        medication_map = {}  # Track medications by generic name
        
        for record in records:
            record_date = record.get("created_at", "")
            
            for med in record.get("medications", []):
                generic = med.get("generic_name", "").lower()
                if not generic:
                    continue
                
                if generic not in medication_map:
                    medication_map[generic] = {
                        "generic_name": generic,
                        "brand_names": set(),
                        "strengths": set(),
                        "first_seen": record_date,
                        "last_seen": record_date,
                        "occurrences": 0,
                        "is_current": False,
                        "records": []
                    }
                
                entry = medication_map[generic]
                entry["occurrences"] += 1
                entry["last_seen"] = max(entry["last_seen"], record_date)
                entry["first_seen"] = min(entry["first_seen"], record_date)
                
                if med.get("brand_name"):
                    entry["brand_names"].add(med["brand_name"])
                if med.get("strength"):
                    entry["strengths"].add(med["strength"])
                
                entry["records"].append({
                    "record_id": record.get("record_id"),
                    "date": record_date,
                    "strength": med.get("strength"),
                    "frequency": med.get("frequency")
                })
        
        # Convert sets to lists and determine current medications
        # (medications seen in the last record are considered current)
        latest_record = records[0] if records else None
        latest_meds = set()
        
        if latest_record:
            for med in latest_record.get("medications", []):
                latest_meds.add(med.get("generic_name", "").lower())
        
        timeline = []
        for generic, data in medication_map.items():
            data["brand_names"] = list(data["brand_names"])
            data["strengths"] = list(data["strengths"])
            data["is_current"] = generic in latest_meds
            timeline.append(data)
        
        # Sort by most recent first
        timeline.sort(key=lambda x: x["last_seen"], reverse=True)
        
        return {
            "patient_id": patient_id,
            "total_records": len(records),
            "unique_medications": len(timeline),
            "current_medications": sum(1 for m in timeline if m["is_current"]),
            "timeline": timeline
        }
    
    async def get_recent_records(self, limit: int = 20) -> List[Dict]:
        """Get most recent records across all patients"""
        collection = await self.ensure_collection()
        
        cursor = collection.find(
            {},
            {"_id": 0, "raw_text": 0}  # Exclude large fields
        ).sort("created_at", -1).limit(limit)
        
        records = await cursor.to_list(length=limit)
        return records
    
    async def update_analysis_results(self, record_id: str, analysis_results: Dict) -> bool:
        """Update a record with analysis results"""
        collection = await self.ensure_collection()
        
        result = await collection.update_one(
            {"record_id": record_id},
            {
                "$set": {
                    "analysis_performed": True,
                    "analysis_results": analysis_results,
                    "analyzed_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return result.modified_count > 0


# Allergy cross-reactivity helper functions
def get_allergy_warnings(allergies: List[str], medications: List[str]) -> List[Dict]:
    """
    Check medications against patient allergies for cross-reactivity warnings.
    Uses the ALLERGY_CROSS_REACTIVITY database from mediq_adverse_effects.py
    """
    from mediq_adverse_effects import check_allergy_cross_reactivity, ALLERGY_CROSS_REACTIVITY, DRUG_CLASSES
    
    warnings = []
    
    # Use the existing check function
    cross_reactivity_alerts = check_allergy_cross_reactivity(allergies, medications)
    
    for alert in cross_reactivity_alerts:
        warning = {
            "type": "allergy_cross_reactivity",
            "severity": alert.get("severity", "high"),
            "allergy": alert.get("allergy"),
            "medication": alert.get("medication"),
            "cross_reactivity_type": alert.get("type"),
            "message": alert.get("message"),
            "recommendation": alert.get("recommendation"),
            "icon": "AlertTriangle"
        }
        warnings.append(warning)
    
    # Also check for direct allergy matches
    for allergy in allergies:
        allergy_lower = allergy.lower().strip()
        for med in medications:
            med_lower = med.lower().strip()
            
            # Direct match
            if allergy_lower in med_lower or med_lower in allergy_lower:
                warnings.append({
                    "type": "direct_allergy_match",
                    "severity": "critical",
                    "allergy": allergy,
                    "medication": med,
                    "message": f"ALLERGY ALERT: Patient is allergic to {allergy}. {med} contains or is this allergen.",
                    "recommendation": "DO NOT administer. Find alternative medication.",
                    "icon": "XCircle"
                })
    
    return warnings


def get_allergy_family_info(allergy: str) -> Optional[Dict]:
    """
    Get information about an allergy family and all cross-reactive drugs.
    Useful for displaying allergy cards in the UI.
    """
    from mediq_adverse_effects import ALLERGY_CROSS_REACTIVITY, DRUG_CLASSES
    
    allergy_lower = allergy.lower().strip()
    
    # Check if allergy is in our database
    for key, info in ALLERGY_CROSS_REACTIVITY.items():
        if allergy_lower in key or key in allergy_lower:
            return {
                "allergy": allergy,
                "family": key,
                "cross_reactive_drugs": info.get("cross_reactive", []),
                "possible_cross_reactive": info.get("possible_cross", []),
                "risk_level": info.get("risk_level", "unknown"),
                "notes": info.get("notes", ""),
                "avoid_all": info.get("risk_level") == "high"
            }
    
    # Check if allergy matches a drug in a class
    for drug_class, drugs in DRUG_CLASSES.items():
        if allergy_lower in drugs:
            return {
                "allergy": allergy,
                "family": drug_class,
                "cross_reactive_drugs": drugs,
                "possible_cross_reactive": [],
                "risk_level": "moderate",
                "notes": f"Patient allergic to {allergy} which is in the {drug_class.replace('_', ' ')} class. Other drugs in this class may also cause reactions.",
                "avoid_all": False
            }
    
    return None
