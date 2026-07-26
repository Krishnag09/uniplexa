# Uniplexa — Strategy Context

_A briefing document for future Claude sessions. Captures the current codebase state, the strategic direction we've converged on, and open decisions. Date: July 2026._

---

## 1. What Uniplexa is today

Three pieces:

- **`src/`** — FastAPI (Python) backend. Routers: `auth`, `buildings`, `service_requests`, `ai_voice`, `access_roles`. SQLAlchemy models for `UserModel`, `BuildingModel`, `ServiceRequestModel`. AI services in `services/voice_methods.py` (voice intake) and `services/service_request.py`. `services/chat.py` is currently empty.
- **`app/`** — Expo React Native mobile app. **Resident-facing only** — 12 screens (login, signup, onboarding, check-health, etc.). No manager screens.
- **`website/`** — Next.js 14 marketing site with a strong AI-property-management landing page in `components/landing-page.tsx`. Uses Tailwind with custom tokens (`ink`, `muted`, `line`, `mist`, `ocean`, `sage`, `ember`). Font: Aptos.

**Users modeled today:** `renter`, `manager`, `admin` (see `src/models/enums.py`).

**What works end-to-end:** resident submits a service request (voice or chat), AI summarizes and categorizes it, ticket lands in the database with pending status. Managers can update status via `PATCH /service-request/{id}`. Buildings CRUD is behind admin auth.

## 2. Manager dashboard demo (built July 2026)

Extended `website/` with a `/dashboard` route to give property managers a demoable view. All data is mocked in `website/lib/demo-data.ts` — deterministic for sales calls, not wired to FastAPI yet.

Pages built:
- `/dashboard` — overview (KPIs, attention feed, AI activity, buildings)
- `/dashboard/requests` — filterable list of service requests
- `/dashboard/requests/[id]` — request detail with AI summary + activity feed
- `/dashboard/conversations` — live resident/AI chat threads (the "money screen" for demos)
- `/dashboard/buildings` — portfolio building cards

Components in `website/components/dashboard/`: `sidebar`, `topbar`, `kpi-card`, `status-badge`, `priority-dot`, `conversations-view`.

Landing page has a `See dashboard preview →` link next to the primary CTA.

**Known gaps in the demo:** the framing is still "ticketing UI for a manager." See §4 for the reframe we agreed on.

## 3. Backend gaps (for demo → real data)

These need to be added before wiring the dashboard to FastAPI:

| Need | Add |
|---|---|
| Portfolio-wide request list | `GET /service-requests?building_id=&status=&category=&limit=` |
| Dashboard KPIs | `GET /dashboard/metrics?building_id=` |
| Assignee routing | `assigned_to_user_id` column on `ServiceRequestModel` + PATCH field |
| Priority | `priority` enum on `ServiceRequestModel` (AI sets at intake) |
| Conversation history | `GET /conversations?building_id=` + `GET /conversations/{id}/messages` |

## 4. The strategic reframe: from resident tool to building OS

Initial framing was "AI resident concierge + service request platform." That's a **feature**, not a moat, and every incumbent-adjacent startup (EliseAI, Colleen, Meru, etc.) is fighting there.

The reframe we landed on: **treat every building as a business unit and supply the operating system that runs it.** The competitive gap isn't better chat — it's that no one owns the operator's brain. Incumbents are siloed (AppFolio = accounting, BuildingLink = comms, Property Meld = work orders). Uniplexa's opportunity is to be the layer that **reasons across silos** with AI.

## 5. Market pick: mid-market multifamily PM in the US

Filtering by "not niche + growing":

- **Segment:** mid-market multifamily property management (10–100 properties per firm)
- **Buyer pool:** ~13,000 firms managing ~15M units
- **Tailwinds:** NOI compression (rates + insurance + labor), on-site labor shortage, AI adoption inflection point in the vertical

Explicitly avoiding:
- AI leasing agents (EliseAI owns it)
- Resident portals (BuildingLink, Livly, ButterflyMX are sticky)
- Accounting (AppFolio/Yardi impossible to dislodge)
- STR tools (Guesty owns it)

## 6. The wedge: LL97-style climate & energy compliance

Refining further to **"niche but growing"** and **"manager-critical"** — meaning something the manager is *forced* to buy by law, insurers, or lenders, not something they'd buy for productivity.

**The wedge is municipal climate laws (LL97 and its clones).**

Why this specifically:
- **Legally forced.** NYC LL97 penalty period started; first fines mail 2027 based on 2026 data. Boston BERDO 2.0, Denver E+P, DC BEPS, Seattle BEPS all in force or phasing. CA statewide SB253/261 coming. The buying window is right now.
- **Massive fines.** LL97: $268/ton CO2 over budget, per year. A mid-size NYC building can face $50k–$500k/year.
- **The manager is on the hook operationally** — running compliance, filing reports, planning retrofits. Owners will fire PMs who miss this.
- **Big buyer pool per city.** NYC LL97 alone covers ~50,000 buildings under ~20,000 owners/managers.
- **No dominant vendor.** Aris, Cardinal, Willow, Runwise are point solutions. Fragmented and shallow.
- **AI-shaped work.** Parsing utility bills, modeling retrofit scenarios, drafting compliance narratives, generating annual filings, projecting capex to avoid future penalties — all LLM sweet spots.
- **Natural wedge into the OS.** Once you own the building's utility data + capex plan + energy strategy, you're one step from asset lifecycle, capex planning, and owner reporting.

**ROI pitch:**
> "For a 150-unit LL97-covered building, projected 2030 penalty is $180k/year at current emissions. Uniplexa builds your compliance path — $8k software + retrofit plan — and eliminates the penalty."

**Positioning line:**
> "Uniplexa is the compliance and capex brain for buildings under LL97 and its clones. We read your utility bills, project your penalties, plan your retrofits, and file your reports."

**Runner-up wedges (kept in reserve):**
1. Insurance-driven operational compliance (documented PM, incident logs, COIs) — universal but harder to quantify ROI
2. Rent-stabilization administration (NYC, CA, OR, WA) — big markets but geo-specific and Yardi has a weak module
3. AI-drafted owner reports — high ROI for fee PMs but doesn't apply to owner-operators

## 7. The dashboard reframe (what to change in what's built)

Same code, different framing. The KPI row becomes NOI/compliance-first:

```
Elm Tower                                July 2026
─────────────────────────────────────────────────
LL97 penalty forecast   $0 through 2029  ✓ compliant
2030 projected penalty  $47k             ⚠ plan needed
Energy YoY              -8%              ✓ on track
Capex reserve gap       $180k            ⚠ vs refi target
─────────────────────────────────────────────────
Open resident requests  8                (was the whole product)
```

Resident-side stuff (chat, tickets) becomes a KPI row, not the headline. That's the reframe that turns Uniplexa from "AI chatbot vendor" into "the operating brain the owner requires."

## 8. What to build next (open decision)

Two candidates to sketch before writing code:

1. **LL97 compliance module** — data model (utility bills, emissions targets, retrofit scenarios), screens (compliance forecast per building, retrofit plan builder, filing generator), demo flow. This is the recommended path.
2. **AI-drafted owner report generator** — extends the summarization skill they already have, universal appeal (both fee PMs and owner-operators), lower urgency but broader market.

## 9. Key insights worth preserving

- **"Building as a business unit."** Every building has a P&L. The dashboard should show P&L health, not ticket counts.
- **Wedge → OS sequence.** Land with one painkiller that forces the customer to pipe their data to you. Each new module compounds because you already have the data.
- **The moat is cross-silo reasoning.** No incumbent can do this without a data-model rewrite. That is the defensibility story.
- **Sell fear, not features, to property managers.** They buy to avoid catastrophe (fines, lawsuits, owner losing trust). Productivity is secondary.
- **The "AI in PM is at inflection point" window.** The market has been educated that AI works in this vertical (EliseAI etc.), but no category leader has locked in across the operating stack. Now is the moment.

## 10. Open questions

- Geo focus for LL97 wedge — NYC-only for v1, or NYC + Boston + Denver + DC as one product?
- Do we target fee PMs or owner-operators first? (Different sales motion.)
- Pricing model — per-building SaaS, % of penalty avoided, or % of retrofit spend managed?
- Do we build the compliance module inside the existing dashboard, or as a separate product line that shares the AI backend?
- What partnerships de-risk the go-to-market — energy consultants, engineering firms, insurance brokers?
