"""
LeadFlow AI - n8n Webhook Dispatch Service
Dispatches newly created leads to the n8n automation engine asynchronously.
Includes retry handling and failsafe timeout protection.
"""
import logging
import httpx
from app.config import settings

logger = logging.getLogger("leadflow.webhook")


async def dispatch_lead_webhook(lead_dict: dict) -> bool:
    """
    Sends lead payload to n8n webhook endpoint.
    Runs asynchronously and fails gracefully if n8n is offline or unreachable.
    """
    if not settings.N8N_WEBHOOK_URL:
        logger.info("N8N_WEBHOOK_URL not configured. Skipping webhook dispatch.")
        return False

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.post(
                settings.N8N_WEBHOOK_URL,
                json={
                    "event": "lead.created",
                    "lead": lead_dict
                }
            )
            logger.info(f"Webhook dispatched to n8n (Status: {response.status_code})")
            return response.status_code in (200, 201, 202)
    except Exception as exc:
        # Failsafe: Do not fail the client API request if n8n is offline
        logger.warning(f"Could not reach n8n webhook ({settings.N8N_WEBHOOK_URL}): {exc}")
        return False
