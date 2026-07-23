import type { Config } from "tailwindcss";

/**
 * Design system: "municipal document, redesigned by a good studio."
 * Ledger paper, meter-reading numerals, filing-stamp accent. Exactly one
 * accent color (stamp) is reserved for dollar figures and CTAs — nothing else
 * in the UI is allowed to use it.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F2F1EA", // warm ledger background
        card: "#FBFAF5", // slightly lifted document surface
        ink: "#17181C", // near-black body text
        muted: "#6A6C64", // secondary / captions
        line: "#DAD8CE", // hairline rules, like a form's grid
        stamp: "#D8351B", // THE accent — dollars + CTAs only
        stampInk: "#8F2314", // pressed/hover state of the accent
      },
      fontFamily: {
        // Everything is monospace-forward: this is paperwork, not a brand site.
        sans: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      boxShadow: {
        doc: "0 1px 0 rgba(23, 24, 28, 0.06), 0 18px 40px -24px rgba(23, 24, 28, 0.35)",
      },
      letterSpacing: {
        stamp: "0.14em",
      },
    },
  },
  plugins: [],
};

export default config;
