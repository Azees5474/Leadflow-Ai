# LeadFlow AI architecture

LeadFlow AI captures inbound sales leads, qualifies them, and drafts outreach. The core app runs locally. n8n and email sending are optional.

```mermaid
flowchart TD
    UI["React dashboard"] -->|Submit or read leads| API["FastAPI on port 8010"]
    API -->|Read and write| DB[("SQLite")]
    API -->|Lead created webhook| N8N["n8n on port 5678"]
    N8N -->|Request analysis| API
    API -->|Request qualification| AI["Ollama on port 11434"]
    API -->|Ollama unavailable| FALLBACK["Rule-based qualification"]
    N8N -->|High or medium priority| SMTP["SMTP"]
    N8N -->|Record SMTP acceptance| API
```

1. FastAPI validates and saves the lead before dispatching the webhook. Intake still works if n8n is offline. In that case, trigger analysis manually through `POST /api/leads/{lead_id}/analyze`.
2. Analysis uses Ollama with `qwen2.5:3b` by default. If the model is unavailable or the request fails, the API uses rule-based scoring and stores the result in SQLite.
3. With SMTP configured, the imported workflow sends an acknowledgement for high- and medium-priority leads. The email callback records SMTP acceptance for the lead's address. The generated outreach draft is available in the analysis response.

See the [quick start](../README.md) and the [n8n setup](../n8n/README.md).
