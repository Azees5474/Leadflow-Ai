# LeadFlow AI - n8n Workflow Automation

This directory contains the workflow definitions and execution assets for n8n.

## Planned Workflow: `lead_automation.json`
- **Trigger:** Webhook from FastAPI backend (`POST /webhook/lead-intake`)
- **Step 1:** Payload validation & normalization
- **Step 2:** Request to local Ollama API (`POST http://localhost:11434/api/generate` or `/api/chat`)
- **Step 3:** Conditional IF branching based on priority score (HIGH, MEDIUM, LOW)
- **Step 4:** Outreach draft assembly
- **Step 5:** Callback to FastAPI (`PUT /api/leads/{id}`) with updated `priority` and `ai_analysis`
- **Fallback:** Rule-based heuristic scoring if Ollama is unreachable

## Record email status in LeadFlow

In the active workflow, add an **HTTP Request** node after **Send an Email**. Leave the email node's **On Error** setting at **Stop Workflow**. Configure the callback as follows:

| Field | Value |
| --- | --- |
| Method | `POST` |
| URL (Expression) | `{{ 'http://127.0.0.1:8010/api/leads/' + $('HTTP Request').first().json.id + '/email-sent' }}` |
| Send Body | On |
| Body Content Type | JSON |
| Specify Body | Using JSON |
| JSON (Expression) | `{{ { accepted: $json.accepted ?? [] } }}` |

`HTTP Request` in the URL refers to the existing lead-analysis node. Use its actual name if renamed. Set **To Email** on the email node to `{{ $json.email }}`. To test, submit a fresh lead with an inbox you control as its email address. Restart FastAPI to apply the SQLite schema change, then publish the workflow.

The callback records the first SMTP acceptance of the lead's address. A failed send, a skipped send, or a send to another address leaves the status **Unconfirmed**. SMTP acceptance does not establish inbox delivery. In the dashboard, **Leads** shows the status and **Lead Details** shows the recorded time.
