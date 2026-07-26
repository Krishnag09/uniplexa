/**
 * Single source of external configuration for the Uniplexa validation site.
 * Everything a non-developer might need to change lives here.
 *
 * Values can be overridden at build time with NEXT_PUBLIC_* env vars so the
 * repo never has to hold real secrets. If a value is left blank the code
 * degrades gracefully (analytics logs to console, leads queue in localStorage).
 */

export const CONFIG = {
  // Where "Book a free penalty review" sends people. Cal.com or Calendly URL.
  bookingUrl:
    process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://cal.com/uniplexa/penalty-review",

  // Public contact address shown in the footer + privacy page.
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "founders@uniplexa.com",

  // Lead sink. Point this at a Google Sheets webhook (Apps Script) or a
  // Formspree/Basin endpoint. Leave blank locally — leads still queue in
  // localStorage and the submit flow is fully testable.
  leadWebhookUrl: process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL ?? "",

  // Analytics is handled by PostHog (already wired in instrumentation-client.ts).
  // If no PostHog token is set, events log to the console instead so every
  // conversion code-path stays testable.
  analyticsEnabled: Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN),
} as const;

export type AppConfig = typeof CONFIG;
