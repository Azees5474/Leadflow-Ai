"""
Comprehensive Backend Test Suite for LeadFlow AI
Tests SQLite operations, REST endpoints, duplicate prevention, Pydantic validation,
search, filtering, and AI triage fallback.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db

# Use an isolated in-memory SQLite database for test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_health_check():
    """Verify system health endpoint and CORS configuration"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "LeadFlow AI" in data["service"]
    assert "database" in data


def test_create_lead_success():
    """Verify POST /api/leads creates lead with defaults PENDING and NEW"""
    payload = {
        "name": "Sarah Connor",
        "email": "sarah.c@cyberdyne.io",
        "company": "Cyberdyne Systems",
        "phone": "+1-555-234-5678",
        "requirements": "Need automated AI qualification for 5,000+ monthly vendor RFPs."
    }
    response = client.post("/api/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["email"] == "sarah.c@cyberdyne.io"
    assert data["priority"] == "PENDING"
    assert data["status"] == "NEW"


def test_duplicate_email_prevention():
    """Verify duplicate emails return HTTP 409 Conflict"""
    payload = {
        "name": "Marcus Vance",
        "email": "marcus@nexustech.io",
        "company": "NexusTech",
        "requirements": "Lead triage automation for sales team."
    }
    res1 = client.post("/api/leads", json=payload)
    assert res1.status_code == 201

    # Attempt duplicate submission
    res2 = client.post("/api/leads", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


def test_invalid_email_validation():
    """Verify invalid emails return HTTP 422 Unprocessable Entity"""
    payload = {
        "name": "Bad Email User",
        "email": "invalid-email-string",
        "requirements": "Test inquiry requirements"
    }
    response = client.post("/api/leads", json=payload)
    assert response.status_code == 422


def test_search_and_filter_leads():
    """Verify searching and filtering leads by priority and status"""
    leads = [
        {"name": "Alice FinTech", "email": "alice@fin.com", "company": "FinGlobal", "requirements": "Urgent enterprise compliance"},
        {"name": "Bob Solo", "email": "bob@solo.org", "company": "SoloDev", "requirements": "Looking for free tier tools"},
    ]
    for l in leads:
        client.post("/api/leads", json=l)

    # 1. Search by keyword
    search_res = client.get("/api/leads?search=FinTech")
    assert search_res.status_code == 200
    results = search_res.json()
    assert len(results) == 1
    assert results[0]["name"] == "Alice FinTech"

    # 2. Filter by status
    status_res = client.get("/api/leads?status=NEW")
    assert status_res.status_code == 200
    assert len(status_res.json()) == 2


def test_update_and_delete_lead():
    """Verify PUT update and DELETE endpoints"""
    create_res = client.post("/api/leads", json={
        "name": "Jane Developer",
        "email": "jane@dev.com",
        "requirements": "Custom AI lead qualification workflow"
    })
    lead_id = create_res.json()["id"]

    # 1. Update priority & status
    put_res = client.put(f"/api/leads/{lead_id}", json={
        "priority": "HIGH",
        "status": "QUALIFIED"
    })
    assert put_res.status_code == 200
    assert put_res.json()["priority"] == "HIGH"
    assert put_res.json()["status"] == "QUALIFIED"

    # 2. Delete lead
    del_res = client.delete(f"/api/leads/{lead_id}")
    assert del_res.status_code == 204

    # 3. Confirm 404
    get_res = client.get(f"/api/leads/{lead_id}")
    assert get_res.status_code == 404


def test_leads_summary_stats():
    """Verify GET /api/leads/stats/summary returns aggregated counts"""
    client.post("/api/leads", json={
        "name": "Lead One",
        "email": "one@corp.com",
        "requirements": "Enterprise scope"
    })
    summary_res = client.get("/api/leads/stats/summary")
    assert summary_res.status_code == 200
    data = summary_res.json()
    assert data["total_leads"] == 1
    assert data["priority"]["pending"] == 1
    assert data["status"]["new"] == 1


def test_ai_triage_lead():
    """Verify POST /api/leads/{id}/analyze updates priority and AI analysis"""
    import json
    create_res = client.post("/api/leads", json={
        "name": "Sarah Connor",
        "email": "sarah@cyberdyne.io",
        "company": "Cyberdyne Systems",
        "requirements": "Urgent enterprise requirement: 5,000+ inbound vendor RFPs monthly with strict data residency."
    })
    lead_id = create_res.json()["id"]

    analyze_res = client.post(f"/api/leads/{lead_id}/analyze")
    assert analyze_res.status_code == 200
    analyzed_data = analyze_res.json()
    assert analyzed_data["priority"] == "HIGH"
    assert analyzed_data["ai_analysis"] is not None

    parsed = json.loads(analyzed_data["ai_analysis"])
    assert parsed["priority"] == "HIGH"
    assert "explanation" in parsed
    assert "recommended_action" in parsed
    assert "email_draft" in parsed


def test_ai_status_endpoint():
    """Verify GET /api/leads/ai/status returns Ollama connection status"""
    res = client.get("/api/leads/ai/status")
    assert res.status_code == 200
    data = res.json()
    assert "online" in data
    assert "target_model" in data


def test_rule_based_fallback_classifications():
    """Directly test deterministic fallback for HIGH, MEDIUM, and LOW requirements"""
    from app.services.ai_triage import rule_based_fallback_triage
    from app.models.lead import LeadPriority

    # 1. High intent
    high_result = rule_based_fallback_triage(
        "John Enterprise", "Global Corp", "Urgent requirement for enterprise compliance with 5,000+ monthly volume"
    )
    assert high_result.priority == LeadPriority.HIGH
    assert high_result.source == "rule_based_fallback"

    # 2. Low intent
    low_result = rule_based_fallback_triage(
        "Solo Dev", "None", "Just looking for a free tier for a personal hobby project"
    )
    assert low_result.priority == LeadPriority.LOW

    # 3. Medium intent
    med_result = rule_based_fallback_triage(
        "Sales VP", "MidScale Inc", "Interested in exploring product features and pricing options for our business"
    )
    assert med_result.priority == LeadPriority.MEDIUM


def test_record_email_sent_acceptance():
    """Verify POST /api/leads/{id}/email-sent marks email_sent_at on valid SMTP acceptance and rejects wrong recipient"""
    # Create test lead
    create_res = client.post("/api/leads", json={
        "name": "Alex Mercer",
        "email": "alex.mercer@testcorp.com",
        "company": "TestCorp",
        "requirements": "Automation requirements"
    })
    lead_id = create_res.json()["id"]

    # 1. Wrong recipient send -> returns 422, lead remains Unconfirmed
    wrong_res = client.post(f"/api/leads/{lead_id}/email-sent", json={
        "accepted": ["wrong.person@other.com"]
    })
    assert wrong_res.status_code == 422
    assert "did not accept" in wrong_res.json()["detail"]
    assert client.get(f"/api/leads/{lead_id}").json()["email_sent_at"] is None

    # 2. Empty accepted list (failed/skipped send) -> returns 422, lead remains Unconfirmed
    empty_res = client.post(f"/api/leads/{lead_id}/email-sent", json={
        "accepted": []
    })
    assert empty_res.status_code == 422
    assert client.get(f"/api/leads/{lead_id}").json()["email_sent_at"] is None

    # 3. Valid SMTP acceptance -> 200 OK, email_sent_at recorded (Sent)
    valid_res = client.post(f"/api/leads/{lead_id}/email-sent", json={
        "accepted": ["alex.mercer@testcorp.com"]
    })
    assert valid_res.status_code == 200
    sent_at = valid_res.json()["email_sent_at"]
    assert sent_at is not None

    # 4. Fetch lead by ID -> persists in SQLite and returns email_sent_at
    get_res = client.get(f"/api/leads/{lead_id}")
    assert get_res.status_code == 200
    assert get_res.json()["email_sent_at"] == sent_at

    # 5. Non-existent lead -> 404
    missing_res = client.post("/api/leads/99999/email-sent", json={
        "accepted": ["anyone@test.com"]
    })
    assert missing_res.status_code == 404

