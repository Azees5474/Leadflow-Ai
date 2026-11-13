# LeadFlow AI

LeadFlow AI is a local dashboard for capturing inbound leads, ranking them by urgency, and drafting outreach. A React interface sends leads to a FastAPI backend that validates them and saves them in SQLite. Ollama handles qualification, and the backend uses keyword-based scoring when Ollama is unavailable. An optional n8n workflow triggers the analysis after intake.

## Quick start on Windows

Use Python 3.12 or newer and Node.js 22 or newer. Run the commands from the repository root in two PowerShell windows.

**Terminal 1 — backend**

```powershell
Set-Location backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8010
```

**Terminal 2 — frontend**

```powershell
Set-Location frontend
Copy-Item .env.example .env
npm ci
npm run dev -- --host 127.0.0.1
```

Open the [dashboard](http://127.0.0.1:5173) or the [interactive API docs](http://127.0.0.1:8010/docs). SQLite creates its database on startup.

## Try a sample lead

The backend and frontend are enough for this walkthrough. Keep n8n stopped for the demo. With Ollama stopped, the sample also demonstrates the rule-based fallback.

1. In the dashboard, open **Add Lead**. Use `Demo Buyer`, `buyer@example.com`, and the requirement `Urgent enterprise pilot with budget approval this week`.
2. Submit the lead and confirm it appears in **Leads**. Without n8n, it starts with the `PENDING` priority.
3. In the API docs, expand `POST /api/leads/{lead_id}/analyze`, click **Try it out**, and enter the lead ID from `GET /api/leads`. With Ollama stopped, the sample is classified `HIGH`.
4. Refresh the dashboard to see the new priority. The API response includes the reason, suggested next step, and email draft. The manual analysis endpoint does not send email.

## Optional integrations

- **Ollama:** Install [Ollama](https://ollama.com/), start it, and run `ollama pull qwen2.5:3b`. The API uses the model configured as `OLLAMA_MODEL` in `backend/.env`.
- **n8n:** Import [the workflow](n8n/lead_automation.json) into a local n8n instance. Follow the [workflow setup](n8n/README.md) before publishing it. The email branch needs SMTP credentials and a sender address you control. Use a test inbox you own when trying the email branch.

## Development checks

- Backend: from `backend/`, run `.\.venv\Scripts\python.exe -m pytest`.
- Frontend: from `frontend/`, run `npm run build`.
- See the [architecture](docs/architecture.md) for how intake, analysis, and automation fit together.
