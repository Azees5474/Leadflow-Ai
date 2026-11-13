# LeadFlow AI workflow

1. Start FastAPI on port `8010` and open your local n8n instance on port `5678`.
2. Import [`lead_automation.json`](lead_automation.json). It receives `POST /webhook/lead-intake`, calls the lead analysis endpoint, and branches on the returned priority.
3. For analysis only, disconnect the email branch before publishing. To test email, select your SMTP credential in **Send an Email** and replace the sender with the address authorized by that credential. Publish the workflow to enable the production webhook.
4. Submit a fresh lead using an inbox you control when testing the email branch. The workflow sends an acknowledgement for high- and medium-priority leads. Its final HTTP Request reports the SMTP server's accepted recipients to `POST /api/leads/{id}/email-sent`.

The backend records the first SMTP acceptance of the lead's address. If the send is skipped, fails, or is accepted for another address, the dashboard shows **Unconfirmed**. An accepted recipient confirms SMTP acceptance only.

The imported workflow uses `http://127.0.0.1:8010` in its HTTP Request nodes. If n8n runs in a container or on another host, change those URLs to an address reachable from n8n.
