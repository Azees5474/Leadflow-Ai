/**
 * Realistic Demo Data for LeadFlow AI
 * Represents realistic B2B enterprise inquiries for GTM demonstration
 */

export const INITIAL_DEMO_LEADS = [
  {
    id: 1,
    name: 'Sarah Connor',
    email: 'sarah.c@cyberdyne-defense.com',
    company: 'Cyberdyne Systems',
    phone: '+1 (555) 234-5678',
    requirements: 'Urgent enterprise requirement: Looking for an automated AI qualification pipeline for 5,000+ inbound vendor RFPs monthly. Must support local data residency and on-premise LLM inference with zero cloud data leak.',
    priority: 'HIGH',
    status: 'NEW',
    ai_analysis: 'High intent: Mentions 5,000+ monthly RFP volume, explicit enterprise security constraints, and urgent timeline. On-premise Ollama architecture matches their strict data residency requirements perfectly.',
    recommended_action: 'Direct SDR executive outreach within 30 minutes; offer architectural deep-dive demo with Solutions Engineer.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 2,
    name: 'Marcus Vance',
    email: 'marcus.vance@nexustech.io',
    company: 'NexusTech Solutions',
    phone: '+1 (555) 876-5432',
    requirements: 'We are expanding our B2B sales team with 15 new SDRs next quarter. Need to automate lead triage from our landing pages into our CRM with sentiment analysis and follow-up email generation.',
    priority: 'HIGH',
    status: 'CONTACTED',
    ai_analysis: 'High intent: Expanding sales headcount (15 SDRs) in upcoming quarter. High budget availability and concrete workflow automation requirements.',
    recommended_action: 'Send custom demo video showing n8n CRM ingestion + automated draft generation.',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 3,
    name: 'Dr. Aris Thorne',
    email: 'a.thorne@biovance-health.org',
    company: 'BioVance Health',
    phone: '+1 (555) 345-9876',
    requirements: 'Evaluating HIPAA-compliant lead routing tools for healthcare clinic partnerships. Need webhook notifications for our clinical coordination team.',
    priority: 'MEDIUM',
    status: 'QUALIFIED',
    ai_analysis: 'Medium intent: Strong compliance consideration (HIPAA). Clinical coordination team needs webhook integration. Moderate sales cycle anticipated due to healthcare compliance reviews.',
    recommended_action: 'Provide compliance and security whitepaper along with local deployment architecture guide.',
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 4,
    name: 'Emily Watson',
    email: 'emily@finflow-payments.co',
    company: 'FinFlow Global',
    phone: '+44 20 7946 0912',
    requirements: 'Looking into lead scoring automation for our fintech merchant signup form. We receive approximately 300 signups a week.',
    priority: 'MEDIUM',
    status: 'NEW',
    ai_analysis: 'Medium intent: Stable inbound velocity (300/week) and relevant domain (Fintech). Ready to test automation within 30 days.',
    recommended_action: 'Invite to live weekly group demo and provide trial access sandbox.',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 5,
    name: 'Julian Hayes',
    email: 'julian@soloconsulting.dev',
    company: 'Hayes Dev Advisory',
    phone: '+1 (555) 432-1098',
    requirements: 'Just exploring tools for solo developers. Does your platform have a free forever tier for personal projects?',
    priority: 'LOW',
    status: 'CLOSED',
    ai_analysis: 'Low intent: Single freelance practitioner looking for free personal tier. Low commercial conversion potential for enterprise GTM motion.',
    recommended_action: 'Enroll in open-source newsletter cadence and self-serve documentation drip.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 50).toISOString(),
  },
  {
    id: 6,
    name: 'Priya Sharma',
    email: 'priya.s@cloudscale-analytics.com',
    company: 'CloudScale Analytics',
    phone: '+91 98200 12345',
    requirements: 'Evaluating automated email draft generation and prioritization for inbound partnership inquiries. Expecting 1,000+ leads per month.',
    priority: 'HIGH',
    status: 'QUALIFIED',
    ai_analysis: 'High intent: Significant lead volume (1,000+/month) and explicit focus on automated email draft generation matching LeadFlow AI core capabilities.',
    recommended_action: 'Schedule technical integration call to demonstrate custom email personalization.',
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 80).toISOString(),
  }
];

export const DEMO_AUTOMATION_HISTORY = [
  {
    id: 'exec_9841',
    workflow: 'Lead Intake & AI Scoring',
    trigger: 'FastAPI Webhook',
    lead_name: 'Sarah Connor',
    status: 'SUCCESS',
    duration: '1.24s',
    ai_model: 'Ollama qwen2.5:3b',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'exec_9840',
    workflow: 'Lead Intake & AI Scoring',
    trigger: 'FastAPI Webhook',
    lead_name: 'Marcus Vance',
    status: 'SUCCESS',
    duration: '1.42s',
    ai_model: 'Ollama qwen2.5:3b',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'exec_9839',
    workflow: 'CRM Notification Webhook',
    trigger: 'Condition (Priority == HIGH)',
    lead_name: 'Marcus Vance',
    status: 'SUCCESS',
    duration: '0.45s',
    ai_model: 'N/A',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'exec_9838',
    workflow: 'Lead Intake & AI Scoring',
    trigger: 'FastAPI Webhook',
    lead_name: 'Dr. Aris Thorne',
    status: 'SUCCESS',
    duration: '1.18s',
    ai_model: 'Ollama qwen2.5:3b',
    timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
  {
    id: 'exec_9837',
    workflow: 'Lead Intake & AI Scoring',
    trigger: 'FastAPI Webhook',
    lead_name: 'Julian Hayes',
    status: 'SUCCESS',
    duration: '0.98s',
    ai_model: 'Ollama qwen2.5:3b',
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
  }
];

export const EMAIL_TEMPLATES_CATALOG = [
  {
    id: 'high_priority',
    name: 'High Priority Enterprise Executive Outreach',
    targetPriority: 'HIGH',
    subject: 'Accelerating {{company}}\'s Lead Qualification with Local AI Architecture',
    body: `Hi {{name}},

I reviewed your inquiry regarding {{requirements_summary}}.

Given your focus on local data governance and high inbound volume, LeadFlow AI\'s on-premise Ollama pipeline is tailored specifically for {{company}}\'s requirements. Our architecture guarantees zero third-party cloud data leak while providing sub-second lead classification and automated GTM dispatching.

Would you be open to a brief 15-minute technical walkthrough with our Lead Solutions Architect this Thursday?

Best regards,

Azees S
Lead GTM Solutions Engineer | VisAI Labs
leadflow@visailabs.com`
  },
  {
    id: 'medium_priority',
    name: 'Medium Priority - Product Demo & Sandbox Invite',
    targetPriority: 'MEDIUM',
    subject: 'Streamlining Inbound Sales Automation for {{company}}',
    body: `Hi {{name}},

Thanks for reaching out to us regarding your sales automation initiatives at {{company}}.

We have helped teams with similar requirements (such as {{requirements_summary}}) eliminate manual triage and accelerate lead response time by 80% using our FastAPI and n8n orchestration engine.

Here is an interactive 3-minute demo video showing our workflow: https://leadflow.visailabs.com/demo

Let me know if you would like sandbox credentials to test the ingestion pipeline directly.

Best regards,

Azees S
GTM Engineering Team | VisAI Labs`
  },
  {
    id: 'low_priority',
    name: 'Low Priority / Educational Nurture',
    targetPriority: 'LOW',
    subject: 'Resources & Architecture Guide for AI-Powered Lead Automation',
    body: `Hi {{name}},

Thank you for your interest in LeadFlow AI!

We have compiled our open-source architectural guide and developer documentation for engineers exploring local LLM lead scoring and workflow pipelines:

• Local Ollama Setup & Model Evaluation Guide: https://docs.leadflow.ai/ollama-guide
• n8n Webhook Integration Blueprints: https://docs.leadflow.ai/n8n-blueprints

Feel free to reply if your project scope expands or if you need help scaling your workflows in the future.

Best regards,

The LeadFlow AI Team`
  }
];
