# SAFAR — सफर
### Autonomous Protection Agent for Nepali Migrant Workers

> *"Safar" means journey in Nepali. Every migrant worker begins one. SAFAR makes sure they don't face it alone.*

---

## Hackathon
**Google Cloud Rapid Agent Hackathon** | May 5 – June 11, 2026
**Track**: MongoDB · Elastic · Fivetran · Arize
**Origin**: Nepal 🇳🇵 | **Impact**: Global

---

## The Crisis in One Paragraph

Nepal sends **4.4 million workers** abroad every year — to Qatar, UAE, Saudi Arabia, Malaysia, Kuwait. These workers send home **$11 billion annually**, which is **33% of Nepal's entire GDP**. Without them, the country's economy collapses. Yet once they land abroad, they are largely invisible: passports confiscated, wages withheld, contracts changed, isolated in labor camps with no way to ask for help. Over **14,000 Nepalis have died abroad in the last 15 years**. Most of these deaths were preventable. The gap between something going wrong and help arriving can be **weeks or months**. SAFAR closes that gap to **minutes**.

---

## What SAFAR Does

SAFAR is an autonomous AI agent — not a chatbot, not a hotline — that:

1. **Travels with every worker** from pre-departure to return
2. **Listens in Nepali via voice** — no literacy required
3. **Detects distress** before the worker can formally ask for help
4. **Acts autonomously** — alerts family, prepares legal documents, routes to the right NGO
5. **Learns across all workers** — builds a community-powered recruiter accountability database

**SAFAR turns a vulnerable, isolated individual into someone with an invisible expert advisor standing next to them at all times.**

---

## How It Works — 30-Second Version

```
Worker sends a voice note in Nepali
        ↓
Gemini processes speech, detects situation + severity
        ↓
Agent cross-references contract, employer history, destination country laws
        ↓
Green → Weekly check-in logged
Yellow → Family notified, action checklist sent to worker
Red    → Embassy alerted, NGO case file created, legal docs prepared
Emergency → Dead-man's switch triggers — silence itself is the signal
```

No forms. No legal knowledge. No literacy needed.

---

## Why This Is an Agent, Not a Chatbot

| Chatbot | SAFAR Agent |
|---|---|
| Waits for a question | Proactively monitors every worker |
| Answers one message | Executes a full multi-step response chain |
| Forgets context | Maintains complete worker history from pre-departure |
| Requires user to know what to ask | Detects what's wrong before the user can articulate it |
| One user, one session | Learns from 4.4 million workers collectively |

---

## Quick Start

```bash
git clone https://github.com/[your-username]/safar-agent
cd safar-agent
cp .env.example .env
# Add your Google Cloud, MongoDB, Elastic, Fivetran, Arize credentials
docker-compose up
```

See [docs/SETUP.md](docs/SETUP.md) for full installation guide.

---

## Documentation Index

| Document | What It Covers |
|---|---|
| [Problem Statement](docs/PROBLEM_STATEMENT.md) | The migrant worker crisis — data, laws, system failures |
| [Solution Architecture](docs/SOLUTION_ARCHITECTURE.md) | How SAFAR works — agent design, data flows, intelligence layers |
| [User Flows](docs/USER_FLOWS.md) | Step-by-step journeys for Worker, Family, and Support Network |
| [Technical Stack](docs/TECHNICAL_STACK.md) | Google Cloud, Gemini, MCP partners, APIs, infrastructure |
| [Demo Script](docs/DEMO_SCRIPT.md) | Full 3-minute hackathon demo narrative with screenshots |
| [Roadmap](docs/ROADMAP.md) | Post-hackathon vision — from MVP to global deployment |

---

## Impact at Scale

| Metric | Value |
|---|---|
| Nepali workers abroad (2026) | 4.4 million |
| Global migrant workers | 169 million |
| Nepal remittance dependency | 33% of GDP |
| Nepali deaths abroad (15 years) | 14,000+ |
| Current time to mobilize help | 2–8 weeks |
| SAFAR target response time | Under 15 minutes |

---

## Technology Stack

```
Core AI        →  Google Gemini (multilingual, voice, reasoning)
Agent Builder  →  Google Cloud Agent Builder
Database       →  MongoDB (worker profiles, employer intelligence)
Search         →  Elastic MCP (real-time employer/news/case search)
Data Pipelines →  Fivetran MCP (ILO, government, NGO data ingestion)
AI Monitoring  →  Arize MCP (model accuracy — false negatives cost lives)
Interface      →  WhatsApp Business API + Progressive Web App
Languages      →  Nepali (primary) + English
```

---

## Open Source

SAFAR is fully open source under the **MIT License**.

This project was born in Nepal. It belongs to the workers it protects.
We welcome contributions from developers, NGOs, researchers, and returned migrants worldwide.

---

## Team

Built for the **Google Cloud Rapid Agent Hackathon 2026**
Origin: Kathmandu, Nepal

---

*"The system failed Ram Bahadur. SAFAR is what should have existed."*
