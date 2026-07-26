# Uniplexa — LL97 penalty validation site

A single-page marketing + lead-capture site built to answer one question:
**will NYC building owners give us their email to learn their Local Law 97
penalty number?** It is not the product — it's a demand test with one real,
client-side interactive tool (the penalty calculator).

## Stack

Next.js 15 (static export) · TypeScript · Tailwind · PostHog analytics. The
whole site is prerendered to static HTML (`output: "export"`) — fast, cheap, and
deployable anywhere.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export → ./out
```

## Configuration — the one file that matters

All external config lives in [`config.ts`](./config.ts) at the repo root, and
every value can be overridden with a `NEXT_PUBLIC_*` env var (see
`.env.example`). Nothing here is secret.

| Setting | Env var | What it does |
| --- | --- | --- |
| `bookingUrl` | `NEXT_PUBLIC_BOOKING_URL` | Cal.com/Calendly link for "Book a free penalty review". |
| `contactEmail` | `NEXT_PUBLIC_CONTACT_EMAIL` | Public contact address (footer, privacy page). |
| `leadWebhookUrl` | `NEXT_PUBLIC_LEAD_WEBHOOK_URL` | Where leads are POSTed (Google Sheets Apps Script or Formspree/Basin). |
| analytics token | `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | PostHog project token; blank ⇒ events log to the console. |

### Lead capture

The site is statically exported, so there is no first-party server. Leads are
POSTed directly to `leadWebhookUrl` **and** written to a `localStorage` queue
first, so a failed request is never a lost lead — the queue is retried on the
next page load and after each new submission. With no webhook set, leads simply
stay queued (drain them from the browser's localStorage under
`uniplexa.leadQueue.v1`) and the UI still confirms success.

To wire up a sink:

- **Google Sheets** — publish an Apps Script Web App that appends the JSON body
  to a sheet, and paste its `/exec` URL into `NEXT_PUBLIC_LEAD_WEBHOOK_URL`.
- **Formspree / Basin** — create a form and use its endpoint URL.

### Analytics events (the funnel)

Fired via `lib/analytics.ts` (PostHog, or console when no token):

- `calculator_started` — first interaction with any calculator field
- `calculator_completed` — a penalty result was produced
- `report_gate_submitted` — email submitted for the full report
- `below_threshold_lead` — email submitted from the sub-25k-sq-ft path
- `book_review_clicked` — secondary CTA clicked

## The calculator math

Lives in [`lib/ll97.ts`](./lib/ll97.ts): published LL97 emission coefficients,
per-building-type caps for the 2024–2029 and 2030–2034 periods, penalty at
$268/tCO₂e, and the 2026–2035 cumulative exposure. Pure functions, no I/O.

## Deploy to Vercel

Import the repo, set the env vars above, and deploy — Vercel detects Next.js and
serves the static export. No serverless runtime required.

## Structure

```
config.ts                 external config (edit me)
app/
  page.tsx                the single page (hero, how-it-works, math, FAQ, footer)
  privacy/page.tsx        privacy policy
  layout.tsx              SEO metadata + structured data
  opengraph-image.tsx     OG image generated from the design system
components/
  calculator.tsx          the centerpiece
  animated-dollars.tsx    the count-up number reveal
  faq.tsx  book-review-button.tsx  lead-flusher.tsx
lib/
  ll97.ts  analytics.ts  leads.ts
```

See [`VALIDATION.md`](./VALIDATION.md) for what to watch and when to change
course.
