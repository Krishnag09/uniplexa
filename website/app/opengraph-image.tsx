import { ImageResponse } from "next/og";

/**
 * OG image generated from the design system: paper ledger, a big stamp-red
 * dollar figure, and the hero line. Rendered to a static PNG at build time.
 */
export const dynamic = "force-static";
export const alt = "What will Local Law 97 cost your building?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F2F1EA",
          padding: "72px",
          fontFamily: "monospace",
          color: "#17181C",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#6A6C64",
          }}
        >
          <span style={{ fontWeight: 700, color: "#17181C" }}>UNIPLEXA</span>
          <span style={{ color: "#D8351B" }}>NYC Local Law 97</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, color: "#6A6C64", marginBottom: 12 }}>
            Projected LL97 penalty from 2030
          </div>
          <div
            style={{
              fontSize: 190,
              fontWeight: 800,
              color: "#D8351B",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            $42,000
          </div>
          <div style={{ fontSize: 34, color: "#17181C", marginTop: 20 }}>
            What will Local Law 97 cost your building?
          </div>
        </div>

        <div style={{ fontSize: 24, color: "#6A6C64" }}>
          63% of NYC buildings are over their 2030 cap. Find your number — free.
        </div>
      </div>
    ),
    size,
  );
}
