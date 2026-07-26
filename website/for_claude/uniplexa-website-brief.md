# Uniplexa — Validation Website Brief

A complete brief for building the first public website. Goal: test demand for the product before it exists, and capture qualified leads. This is a marketing + lead-capture site with one interactive tool. It is NOT the product.

---

## 1. Company context (read this first)

**Uniplexa** is a compliance and energy intelligence platform for mid-size buildings (roughly 25,000–500,000 sq ft). The wedge product: NYC Local Law 97 (LL97) penalty management.

The problem, in one paragraph: NYC's LL97 fines buildings $268 per metric ton of CO2 over their emissions cap. Caps tighten sharply in 2030 — a typical 50-unit / 50,000 sq ft multifamily building goes from ~$6k/year in fines today to ~$42k/year in 2030. Roughly 63% of NYC buildings exceed their 2030 caps, and most owners do not know their number. Today they manage this with spreadsheets, annual consultant reports ($5k–25k, instantly stale), or denial. Separately, missing the annual filing costs $0.50/sq ft/month — often worse than the emissions fine itself.

The product (future): forward us your utility bills (photo/PDF/email) or connect your ENERGY STAR Portfolio Manager account → we continuously track your emissions vs. your cap, project your penalty in dollars, flag consumption anomalies, generate your filings, and rank the cheapest paths under the cap. Multi-jurisdiction later (Boston BERDO, DC BEPS, Washington State, EU).

Target visitor for this site: NYC building owners and property managers of buildings over 25,000 sq ft. They are non-technical, busy, skeptical of software, and motivated by exactly one thing: a dollar figure with their building's name on it.

## 2. Site goal and success metrics

Primary goal: capture qualified leads (email + building address) to validate demand before building the product.

The site succeeds if it answers: "Will building owners give us their email to learn their penalty number?"

Instrument these conversion events:
1. Penalty calculator started
2. Calculator completed → email submitted to get full report ("report gate")
3. "Book a free penalty review" call scheduled (secondary CTA, links to a Cal.com/Calendly URL — leave as configurable constant)
4. Scroll depth + time on page (basic analytics)

Use a privacy-friendly analytics snippet (Plausible or umami — configurable; if no key is set, log events to console so the code paths are testable).

## 3. Pages and structure

Single-page site plus one legal page. Sections in order:

### 3.1 Hero
- Headline (use exactly): **"What will Local Law 97 cost your building?"**
- Subhead: "Most NYC buildings are over their 2030 emissions cap and don't know it. Find your number in 60 seconds — free."
- Primary CTA button: "Estimate my penalty" → scrolls to calculator.
- No stock photos. No generic city skyline. See design direction (§6).

### 3.2 The penalty calculator (the centerpiece — spend most effort here)
Interactive tool, works entirely client-side with the math below. Flow:

1. Inputs: building type (dropdown: Multifamily / Office / Retail / Hotel / Other), gross square footage (number), and either (a) annual energy use — electricity kWh + natural gas therms + optional fuel oil gallons and district steam Mlbs — or (b) a "use a typical building like mine" toggle that fills type-appropriate defaults.
2. Compute annual emissions (tCO2e) with these coefficients:
   - Electricity: 0.000288962 tCO2e per kWh
   - Natural gas: 0.00005311 tCO2e per kBtu (1 therm = 100 kBtu)
   - #2 fuel oil: 0.00007421 tCO2e per kBtu (1 gallon ≈ 138 kBtu)
   - District steam: 0.00004493 tCO2e per kBtu (1 Mlb ≈ 1,194 kBtu)
3. Compute caps for two periods using tCO2e per sq ft limits:
   - Multifamily (R-2): 2024–2029 = 0.00675; 2030–2034 = 0.00407
   - Office (B): 2024–2029 = 0.00846; 2030–2034 = 0.00453
   - Retail (M): 2024–2029 = 0.01181; 2030–2034 = 0.00403
   - Hotel (R-1): 2024–2029 = 0.00987; 2030–2034 = 0.00526
   - Other: use Office values and label the result "approximate"
4. Penalty = max(0, emissions − cap) × $268, shown for BOTH periods side by side. The 2030 number is the emotional payload — make it typographically dominant.
5. Also show the 10-year cumulative exposure (2026–2035, assuming flat usage) as a single large dollar figure.
6. Results end with the report gate: "Get the full breakdown for your building — including the filing deadlines you're on the hook for — free." Email + optional building address form. On submit: store the lead (see §5), show a success state promising the report within one business day (founder sends it manually — concierge validation).
7. Required disclaimer under results (small, always visible): "Estimates based on published LL97 coefficients and limits. Actual obligations depend on your building's specific characteristics, adjustments, and credits. This is not legal or engineering advice."

Edge cases: sq ft under 25,000 → show a friendly "Your building is likely below LL97's threshold — but thresholds tend to ratchet down. Leave your email and we'll alert you if that changes." (still a lead!). Zero/absurd inputs → inline validation, no alerts/popups.

### 3.3 "How it will work" (3 steps, honest about stage)
1. "Forward us a utility bill — a photo is fine."
2. "We track your emissions against your cap, continuously — not once a year."
3. "You get your penalty exposure, your filings, and the cheapest path under the cap."
Include one line of honest framing: "We're onboarding a limited group of early buildings now." Do not fake logos, testimonials, or team size. No invented press mentions.

### 3.4 "The math nobody shows you" (credibility section)
Short worked example for a 50,000 sq ft multifamily building: ~$5,900/yr fine today → ~$42,000/yr from 2030, plus the $25,000/month non-filing penalty. Present as a simple before/after — this section exists to prove we know the domain cold.

### 3.5 FAQ (accordion, 5 items)
Write concise answers for: Who does LL97 apply to? / What happens if I do nothing? / I already have a consultant — why this? / What data do you need from me? / How much will this cost? (answer: early buildings get founder pricing; anchor "less than one month of your 2030 fine").

### 3.6 Footer
Secondary CTA ("Book a free penalty review"), contact email (placeholder constant), and link to a plain privacy policy page (generate a simple, honest one: we store the email/address you give us to contact you; no resale; deletion on request).

## 4. Copy rules
- Every claim of fact above is sourced from our research; do not invent statistics beyond what's in this brief.
- Voice: plain, direct, a little dry. Write like a sharp building engineer, not a SaaS brand. No "revolutionize," "seamless," "empower," "AI-powered" anywhere.
- Dollars beat adjectives. Wherever there's a choice between describing pain and quantifying it, quantify.
- Sentence case everywhere, including buttons.

## 5. Tech requirements
- Stack: Astro or plain Vite + vanilla TS (site is 95% static; keep it fast). Tailwind is fine but not required. No heavy framework, no CMS.
- Lead storage: POST to a single serverless endpoint (provide both a Vercel function and a fallback that writes to a Google Sheets webhook URL constant). Also fire the analytics event. Never lose a lead if the endpoint fails — queue in localStorage and retry. [Note: localStorage is fine here — this is a deployed website, not a Claude artifact.]
- All external config (analytics key, lead endpoint, Calendly URL, contact email) in one constants file at the top level.
- Lighthouse targets: 95+ performance and accessibility. Semantic HTML, visible keyboard focus, calculator fully operable by keyboard, prefers-reduced-motion respected.
- Responsive down to 360px — most property managers will open this on a phone.
- SEO: title "LL97 Penalty Calculator — What Local Law 97 Will Cost Your Building | Uniplexa"; meta description with the 63%-over-cap stat; OG image generated from the design system showing a big dollar figure; sitemap; deploy-ready for Vercel.

## 6. Design direction
- The signature element is the penalty number itself: the moment the calculator returns, the 2030 dollar figure should land like a utility-bill shock — oversized tabular numerals, counting up briefly, everything else quiet around it.
- Aesthetic direction: draw from the building's own paperwork world — utility bills, meter readings, boiler-room placards, city filing stamps. Monospaced/tabular numerals for all figures. Think "municipal document redesigned by a very good studio," not "climate-tech SaaS."
- Deliberately avoid: cream background + serif + terracotta accent; black background + acid green; generic gradient meshes; stock skyline photos; emoji.
- Palette and type: designer's choice within the direction above — pick something specific and commit. One accent color reserved exclusively for dollar figures and CTAs.
- Motion: one orchestrated moment (the number reveal). Nothing else animated beyond subtle hovers.

## 7. Out of scope (do not build)
- No login, no dashboard, no actual bill upload/parsing, no payment, no blog, no multi-page architecture, no cookie banner beyond what analytics choice requires, no chatbot.

## 8. Deliverables
1. Deploy-ready repo with README (setup, where to set the constants, how to deploy to Vercel).
2. The single-page site + privacy page per this brief.
3. A `VALIDATION.md` noting the metrics to watch weekly (calculator starts, completion rate, report-gate conversion, calls booked) and the decision rule: if fewer than ~5% of calculator completions convert to the report gate after ~200 visitors, revisit the offer copy before revisiting the product thesis.
