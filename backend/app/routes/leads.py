"""
LeadFlow AI - Leads API Routes
Handles CRUD operations, search, filters, validation, background webhooks, and AI analysis.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.database import get_db
from app.models.lead import (
    Lead,
    EmailSendConfirmation,
    get_utc_now,
    LeadCreate,
    LeadUpdate,
    LeadResponse,
    LeadPriority,
    LeadStatus
)
from app.services.webhook import dispatch_lead_webhook
from app.services.ai_triage import triage_lead_with_ollama, check_ollama_health
import json

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.post("/{lead_id}/email-sent", response_model=LeadResponse)
def confirm_email_sent(lead_id: int, confirmation: EmailSendConfirmation, db: Session = Depends(get_db)):
    lead = db.get(Lead, lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found.")

    accepted = {address.casefold() for address in confirmation.accepted}
    if lead.email.casefold() not in accepted:
        raise HTTPException(status_code=422, detail="The mail server did not accept the lead's email address.")

    db.query(Lead).filter(Lead.id == lead_id, Lead.email_sent_at.is_(None)).update(
        {Lead.email_sent_at: get_utc_now().isoformat()}, synchronize_session=False
    )
    db.commit()
    db.refresh(lead)
    return lead


@router.get(
    "/ai/status",
    summary="Check local Ollama AI health",
    description="Checks if the local Ollama server is responding and reports available models and target model status."
)
async def get_ai_status() -> Dict[str, Any]:
    return await check_ollama_health()


@router.post(
    "",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new lead",
    description="Validates lead information using Pydantic, checks for duplicate email addresses, stores the record in SQLite, and dispatches a background webhook event to n8n."
)
def create_lead(
    lead_in: LeadCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    1. Check for Duplicate Email:
       Ensures no existing lead has the same email. If found, returns 409 Conflict.
    2. Persist Lead in SQLite:
       Inserts the record with initial priority 'PENDING' and status 'NEW'.
    3. Asynchronous Webhook Dispatch:
       Emits a notification to n8n in a non-blocking background task.
    """
    normalized_email = lead_in.email.lower().strip()

    # 1. Duplicate check
    existing_lead = db.query(Lead).filter(Lead.email == normalized_email).first()
    if existing_lead:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A lead with email '{lead_in.email}' already exists (ID: {existing_lead.id})."
        )

    # 2. Instantiate and persist model
    lead = Lead(
        name=lead_in.name.strip(),
        email=normalized_email,
        company=lead_in.company.strip() if lead_in.company else None,
        phone=lead_in.phone.strip() if lead_in.phone else None,
        requirements=lead_in.requirements.strip(),
        priority=LeadPriority.PENDING.value,
        status=LeadStatus.NEW.value
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    # 3. Schedule non-blocking webhook to n8n
    lead_dict = {
        "id": lead.id,
        "name": lead.name,
        "email": lead.email,
        "company": lead.company,
        "phone": lead.phone,
        "requirements": lead.requirements,
        "priority": lead.priority,
        "status": lead.status,
        "created_at": lead.created_at.isoformat()
    }
    background_tasks.add_task(dispatch_lead_webhook, lead_dict)

    return lead


@router.get(
    "",
    response_model=List[LeadResponse],
    summary="List and filter leads",
    description="Retrieve all leads with optional full-text keyword search and filtering by priority or status."
)
def list_leads(
    search: Optional[str] = Query(None, description="Search across name, email, company, and requirements"),
    priority: Optional[LeadPriority] = Query(None, description="Filter by lead priority (HIGH, MEDIUM, LOW, PENDING)"),
    status_filter: Optional[LeadStatus] = Query(None, alias="status", description="Filter by status (NEW, CONTACTED, QUALIFIED, CONVERTED, CLOSED)"),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=200, description="Limit records returned"),
    db: Session = Depends(get_db)
):
    """
    Constructs a dynamic SQLAlchemy query based on provided filter parameters.
    Supports case-insensitive substring searching across multiple textual columns.
    """
    query = db.query(Lead)

    if priority:
        query = query.filter(Lead.priority == priority.value)

    if status_filter:
        query = query.filter(Lead.status == status_filter.value)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Lead.name.ilike(search_term),
                Lead.email.ilike(search_term),
                Lead.company.ilike(search_term),
                Lead.requirements.ilike(search_term)
            )
        )

    return query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()


@router.get(
    "/stats/summary",
    summary="Get aggregated lead statistics",
    description="Returns aggregate counts grouped by priority and lifecycle status for executive dashboard reporting."
)
def get_leads_summary(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Performs fast SQL count aggregations across priority and status groups.
    """
    total = db.query(func.count(Lead.id)).scalar() or 0

    priority_counts = {}
    for p in LeadPriority:
        count = db.query(func.count(Lead.id)).filter(Lead.priority == p.value).scalar() or 0
        priority_counts[p.value.lower()] = count

    status_counts = {}
    for s in LeadStatus:
        count = db.query(func.count(Lead.id)).filter(Lead.status == s.value).scalar() or 0
        status_counts[s.value.lower()] = count

    return {
        "total_leads": total,
        "priority": priority_counts,
        "status": status_counts
    }


@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Get lead details",
    description="Retrieve full details for a single lead by its unique primary key ID."
)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} was not found."
        )
    return lead


@router.put(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Update an existing lead",
    description="Update lead details, priority status, or AI analysis notes."
)
def update_lead(lead_id: int, lead_in: LeadUpdate, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} was not found."
        )

    update_data = lead_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            if isinstance(value, (LeadPriority, LeadStatus)):
                setattr(lead, field, value.value)
            else:
                setattr(lead, field, value)

    db.commit()
    db.refresh(lead)
    return lead


@router.delete(
    "/{lead_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a lead",
    description="Permanently delete a lead by its unique ID."
)
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} was not found."
        )
    db.delete(lead)
    db.commit()
    return None


@router.post(
    "/{lead_id}/analyze",
    response_model=LeadResponse,
    summary="Run AI lead triage",
    description="Invokes Ollama AI (or rule-based fallback if Ollama is offline) to classify the lead and update its priority and explanation in SQLite."
)
async def analyze_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} was not found."
        )

    triage_result = await triage_lead_with_ollama(
        name=lead.name,
        company=lead.company or "",
        requirements=lead.requirements
    )

    lead.priority = triage_result.priority.value
    # Persist structured analysis JSON
    lead.ai_analysis = json.dumps(triage_result.model_dump(), default=str)

    db.commit()
    db.refresh(lead)
    return lead
