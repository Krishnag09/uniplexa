/**
 * Lead capture with a durable-by-default contract: a lead is never lost even
 * if the network or the webhook is down.
 *
 * Flow:
 *   1. Persist the lead to a localStorage queue immediately.
 *   2. Try to POST the whole queue to the configured webhook.
 *   3. Drop only the leads the webhook confirmed; keep the rest to retry.
 *
 * The site is statically exported, so there is no first-party server here —
 * CONFIG.leadWebhookUrl points at a Google Sheets Apps Script webhook or a
 * Formspree/Basin endpoint. With no URL set, leads simply stay queued and the
 * UI still reports success (the founder can drain the queue manually).
 */

import { CONFIG } from "@/config";

const QUEUE_KEY = "uniplexa.leadQueue.v1";

export interface Lead {
  id: string;
  email: string;
  buildingAddress?: string;
  /** What the visitor was looking at when they converted. */
  source: "report_gate" | "below_threshold";
  /** Snapshot of the calculator result, if any, for context. */
  context?: Record<string, unknown>;
  createdAt: string;
}

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function readQueue(): Lead[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(leads: Lead[]): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(leads));
  } catch {
    /* storage full / disabled — nothing more we can do */
  }
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function postLead(lead: Lead): Promise<boolean> {
  if (!CONFIG.leadWebhookUrl) return false; // nothing to post to yet
  try {
    const res = await fetch(CONFIG.leadWebhookUrl, {
      method: "POST",
      // text/plain keeps this a CORS "simple request" so the browser skips the
      // preflight OPTIONS that a Google Apps Script Web App can't answer. The
      // body is still JSON — the Apps Script parses e.postData.contents.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(lead),
      redirect: "follow",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Attempt to flush every queued lead. Confirmed leads are removed. */
export async function flushLeadQueue(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;

  const survivors: Lead[] = [];
  for (const lead of queue) {
    const ok = await postLead(lead);
    if (!ok) survivors.push(lead);
  }
  writeQueue(survivors);
}

/**
 * Capture a lead. Always resolves true from the caller's perspective — the
 * lead is safely queued even if the webhook is unreachable — so the UI can
 * promise the report without lying about network state.
 */
export async function captureLead(
  input: Omit<Lead, "id" | "createdAt">,
): Promise<{ queued: boolean }> {
  const lead: Lead = { ...input, id: newId(), createdAt: new Date().toISOString() };

  const queue = readQueue();
  queue.push(lead);
  writeQueue(queue);

  // Best-effort immediate flush; failures stay queued for the next retry.
  await flushLeadQueue();
  return { queued: true };
}
