"""
LeadFlow AI - Lead SQLAlchemy Model and Pydantic Schemas
"""
from datetime import datetime, timezone
from typing import Optional
from enum import Enum
from sqlalchemy import Column, Integer, String, Text, DateTime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class LeadPriority(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    PENDING = "PENDING"


class LeadStatus(str, Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    QUALIFIED = "QUALIFIED"
    CONVERTED = "CONVERTED"
    CLOSED = "CLOSED"


# --- SQLAlchemy Database Model ---
class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    company = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    requirements = Column(Text, nullable=False)
    priority = Column(String(20), default=LeadPriority.PENDING.value, index=True)
    status = Column(String(20), default=LeadStatus.NEW.value, index=True)
    ai_analysis = Column(Text, nullable=True)
    email_sent_at = Column(String(40), nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)


# --- Pydantic Request / Response Schemas ---
class EmailDraft(BaseModel):
    subject: str = Field(..., min_length=3, description="Personalized outreach subject line")
    body: str = Field(..., min_length=10, description="Personalized outreach email body")


class AIAnalysisSchema(BaseModel):
    priority: LeadPriority = Field(..., description="Classified lead priority (HIGH, MEDIUM, LOW)")
    explanation: str = Field(..., min_length=5, description="AI rationale for priority assignment")
    recommended_action: str = Field(..., min_length=5, description="Actionable next step for GTM team")
    email_draft: EmailDraft = Field(..., description="Personalized outreach email draft")
    source: str = Field(default="ollama", description="Inference source: Ollama model or rule-based fallback")


class LeadBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of lead")
    email: EmailStr = Field(..., description="Valid work or business email")
    company: Optional[str] = Field(None, max_length=150, description="Company name")
    phone: Optional[str] = Field(None, max_length=50, description="Phone or mobile contact")
    requirements: str = Field(..., min_length=5, description="Business requirements / inquiry details")


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    company: Optional[str] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=50)
    requirements: Optional[str] = Field(None, min_length=5)
    priority: Optional[LeadPriority] = None
    status: Optional[LeadStatus] = None
    ai_analysis: Optional[str] = None


class LeadResponse(LeadBase):
    id: int
    priority: str
    status: str
    ai_analysis: Optional[str] = None
    email_sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmailSendConfirmation(BaseModel):
    accepted: list[EmailStr]
