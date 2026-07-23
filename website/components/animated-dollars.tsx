"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { formatDollars } from "@/lib/ll97";

/**
 * The one orchestrated moment on the site: the penalty figure counts up from
 * zero when it first appears, then holds. Respects prefers-reduced-motion by
 * rendering the final value immediately.
 */
export default function AnimatedDollars({
  value,
  className,
  duration = 1.1,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, reduce, duration]);

  return (
    <span className={className} aria-label={formatDollars(value)}>
      <span aria-hidden="true" className="tnum">
        {formatDollars(display)}
      </span>
    </span>
  );
}
