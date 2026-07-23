"use client";

import { CONFIG } from "@/config";
import { track } from "@/lib/analytics";

/** Secondary CTA. Fires the conversion event, then opens the booking page. */
export default function BookReviewButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={CONFIG.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("book_review_clicked")}
      className={className}
    >
      {children}
    </a>
  );
}
