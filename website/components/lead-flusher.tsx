"use client";

import { useEffect } from "react";
import { flushLeadQueue } from "@/lib/leads";

/**
 * On every load, retry any leads still queued in localStorage from a previous
 * session where the webhook was unreachable. Fire-and-forget.
 */
export default function LeadFlusher() {
  useEffect(() => {
    void flushLeadQueue();
  }, []);
  return null;
}
