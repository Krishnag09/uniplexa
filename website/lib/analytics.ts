/**
 * Thin analytics wrapper. Uses PostHog when a project token is configured
 * (see instrumentation-client.ts); otherwise logs to the console so every
 * conversion code-path is observable in development.
 *
 * The event names map 1:1 to the brief's conversion funnel.
 */

import posthog from "posthog-js";
import { CONFIG } from "@/config";

export type AnalyticsEvent =
  | "calculator_started"
  | "calculator_completed"
  | "report_gate_submitted"
  | "below_threshold_lead"
  | "book_review_clicked";

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
): void {
  if (CONFIG.analyticsEnabled && typeof posthog.capture === "function") {
    posthog.capture(event, properties);
  } else if (typeof console !== "undefined") {
    // Fallback: keep the funnel testable without an analytics key.
    console.info(`[analytics] ${event}`, properties ?? {});
  }
}
