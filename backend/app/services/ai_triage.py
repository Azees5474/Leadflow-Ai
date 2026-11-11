"""
LeadFlow AI - Local Ollama AI Integration & Rule-Based Fallback Service
Provides privacy-first, zero-cloud-cost lead qualification, classification reasoning,
and personalized GTM email draft generation.
"""
import json
import logging
from typing import Dict, Any, Optional
import httpx
from pydantic import ValidationError

from app.config import settings
from app.models.lead import AIAnalysisSchema, EmailDraft, LeadPriority

logger = logging.getLogger("leadflow.ai")


async def check_ollama_health() -> Dict[str, Any]:
    """
    Checks if local Ollama daemon is reachable and lists loaded models.
    """
    url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags"
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                models = [m.get("name") for m in data.get("models", [])]
                model_ready = any(settings.OLLAMA_MODEL in m for m in models)
                return {
                    "online": True,
                    "target_model": settings.OLLAMA_MODEL,
                    "model_installed": model_ready,
                    "available_models": models,
                    "endpoint": settings.OLLAMA_BASE_URL
                }
    except Exception as exc:
        logger.debug(f"Ollama health check failed: {exc}")

    return {
        "online": False,
        "target_model": settings.OLLAMA_MODEL,
        "model_installed": False,
        "available_models": [],
        "endpoint": settings.OLLAMA_BASE_URL,
        "fallback_active": True
    }


def rule_based_fallback_triage(name: str, company: Optional[str], requirements: str) -> AIAnalysisSchema:
    """
    Deterministic rule-based qualification used when Ollama is offline or times out.
    Guarantees that lead qualification never crashes and provides consistent results.
    """
    req_lower = requirements.lower()

    # High Intent Keywords (Enterprise, budget, urgency, compliance, scale)
    high_keywords = [
        "urgent", "enterprise", "budget", "rfp", "5000+", "1000+", "500+", "sdr team",
        "compliance", "hipaa", "soc2", "immediately", "procurement", "purchase",
        "pilot", "contract", "license", "production"
    ]
    # Low Intent Keywords (Free tier, personal hobby, student, zero budget)
    low_keywords = [
        "free forever", "student", "personal project", "just browsing",
        "solo", "freelance", "hobby", "no budget", "free tier"
    ]

    is_high = any(k in req_lower for k in high_keywords)
    is_low = any(k in req_lower for k in low_keywords)

    if is_high and not is_low:
        priority = LeadPriority.HIGH
        explanation = (
            "Enterprise intent detected: High volume inquiry, urgent timeline, "
            "or regulatory compliance requirement identified."
        )
        action = (
            "Assign to Senior Enterprise AE within 30 minutes. Offer technical "
            "architecture deep-dive on local deployment."
        )
    elif is_low:
        priority = LeadPriority.LOW
        explanation = (
            "Personal or hobbyist usage detected: Inquiring about free tier or personal "
            "use with low near-term commercial conversion potential."
        )
        action = (
            "Enroll in self-serve open-source newsletter and community documentation cadence."
        )
    else:
        priority = LeadPriority.MEDIUM
        explanation = (
            "Standard B2B commercial evaluation: Demonstrates genuine business requirement "
            "and team evaluation interest."
        )
        action = (
            "Send personalized product walkthrough demo video and invite to sandbox environment."
        )

    company_name = company or "your organization"
    email_subject = f"Accelerating {company_name}'s Lead Qualification with LeadFlow AI"
    email_body = f"""Hi {name},

Thank you for reaching out to us regarding your lead automation initiatives at {company_name}.

I reviewed your stated requirements: "{requirements.strip()[:140]}...".

LeadFlow AI is designed specifically for teams seeking on-premise AI qualification with zero cloud data leaks and sub-second webhook automation.

Would you be open to a 15-minute introductory walkthrough this week to explore how we can support your deployment?

Best regards,
VisAI Labs GTM Engineering Team
leadflow@visailabs.com"""

    return AIAnalysisSchema(
        priority=priority,
        explanation=explanation,
        recommended_action=action,
        email_draft=EmailDraft(subject=email_subject, body=email_body),
        source="rule_based_fallback"
    )


async def triage_lead_with_ollama(name: str, company: Optional[str], requirements: str) -> AIAnalysisSchema:
    """
    Classifies an inbound lead using the locally hosted Ollama model (e.g. qwen2.5-coder:7b or qwen2.5:3b).
    Strictly validates the model's output schema with Pydantic.
    Falls back gracefully to deterministic rule-based analysis if Ollama is unreachable.
    """
    # 1. Sanitization / Privacy: Never expose unnecessary private tokens
    sanitized_name = name.strip()
    sanitized_company = (company or "Not Specified").strip()
    sanitized_req = requirements.strip()

    prompt = f"""You are an expert B2B Go-To-Market (GTM) Sales Qualification AI.
Analyze the following customer inquiry and generate a structured qualification evaluation.

Contact: {sanitized_name}
Company: {sanitized_company}
Customer Requirements: {sanitized_req}

Evaluation Guidelines:
1. "priority": Choose strictly one of: "HIGH", "MEDIUM", "LOW".
   - HIGH: Large scale (1,000+ leads), explicit budget, urgent timeline, compliance (HIPAA, SOC2, local LLM, data residency).
   - MEDIUM: General business evaluation, standard SDR team requirement, exploring options.
   - LOW: Students, hobbyists, solo personal projects, or zero budget.
2. "explanation": 1-2 concise sentences explaining why this priority was assigned.
3. "recommended_action": Concrete next step for the sales/GTM engineer.
4. "email_draft": A personalized outreach email containing "subject" and "body".

You MUST return ONLY valid JSON matching this exact structure:
{{
  "priority": "HIGH",
  "explanation": "...",
  "recommended_action": "...",
  "email_draft": {{
    "subject": "...",
    "body": "..."
  }}
}}"""

    url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    try:
        # Timeout set to 25s for local laptop inference
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                result_json = response.json()
                raw_response = result_json.get("response", "{}")

                # Parse JSON string
                parsed = json.loads(raw_response)

                # Validate priority string format
                raw_priority = str(parsed.get("priority", "MEDIUM")).upper().strip()
                if raw_priority not in ("HIGH", "MEDIUM", "LOW"):
                    raw_priority = "MEDIUM"
                parsed["priority"] = raw_priority
                parsed["source"] = f"ollama_{settings.OLLAMA_MODEL}"

                # Strict validation with Pydantic
                validated_result = AIAnalysisSchema.model_validate(parsed)
                logger.info(f"Ollama successfully triaged lead '{sanitized_name}' as {validated_result.priority}")
                return validated_result

    except httpx.ConnectError:
        logger.warning(f"Ollama server not reachable at {settings.OLLAMA_BASE_URL}. Falling back to rule-based triage.")
    except httpx.TimeoutException:
        logger.warning("Ollama inference timed out. Falling back to rule-based triage.")
    except (json.JSONDecodeError, ValidationError) as val_err:
        logger.warning(f"Ollama output validation failed ({val_err}). Falling back to rule-based triage.")
    except Exception as exc:
        logger.error(f"Unexpected error during Ollama inference: {exc}. Falling back to rule-based triage.")

    # Rule-based fallback guarantees zero downtime and 100% test reliability
    return rule_based_fallback_triage(sanitized_name, sanitized_company, sanitized_req)
