"use client";

import { useState } from "react";
import { CONFIG } from "@/config";

const ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Who does LL97 apply to?",
    a: (
      <>
        Most NYC buildings over 25,000 gross square feet — and clusters of
        smaller buildings on the same lot that add up past it. If that&rsquo;s
        you, you have both an emissions cap and an annual filing obligation.
      </>
    ),
  },
  {
    q: "What happens if I do nothing?",
    a: (
      <>
        Two separate costs. Emissions over your cap are fined $268 per metric ton
        of CO₂e, every year, and the caps tighten sharply in 2030. Separately,
        missing the annual filing costs $0.50 per square foot per month — often
        larger than the emissions fine itself.
      </>
    ),
  },
  {
    q: "I already have a consultant — why this?",
    a: (
      <>
        A consultant report is a snapshot: accurate the day it&rsquo;s written,
        stale by the next billing cycle, and $5,000–$25,000 each time. We track
        your emissions against your cap continuously, so your number is current
        when you actually need to make a decision.
      </>
    ),
  },
  {
    q: "What data do you need from me?",
    a: (
      <>
        To start, a utility bill — a phone photo is fine — or your ENERGY STAR
        Portfolio Manager account. That&rsquo;s enough to place you against your
        cap and project your penalty. No site visit, no engineering audit to get
        your number.
      </>
    ),
  },
  {
    q: "How much will this cost?",
    a: (
      <>
        Early buildings get founder pricing. The honest anchor: less than one
        month of your 2030 fine. If knowing your exposure and filing on time is
        worth that, we should talk.
      </>
    ),
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-semibold text-ink">{item.q}</span>
                <span
                  aria-hidden="true"
                  className="text-xl text-muted transition-transform"
                  style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                >
                  +
                </span>
              </button>
            </h3>
            {isOpen && (
              <p className="max-w-2xl pb-5 leading-relaxed text-muted">{item.a}</p>
            )}
          </div>
        );
      })}
      <p className="py-5 text-sm text-muted">
        Still have a question?{" "}
        <a
          href={`mailto:${CONFIG.contactEmail}`}
          className="text-stamp underline underline-offset-2"
        >
          {CONFIG.contactEmail}
        </a>
      </p>
    </div>
  );
}
