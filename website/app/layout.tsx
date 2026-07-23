import type { Metadata } from "next";
import "./globals.css";
import LeadFlusher from "@/components/lead-flusher";
import { CONFIG } from "@/config";

const siteUrl = "https://uniplexa.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "LL97 Penalty Calculator — What Local Law 97 Will Cost Your Building | Uniplexa",
    template: "%s | Uniplexa",
  },
  description:
    "Free Local Law 97 (LL97) penalty calculator for NYC buildings. About 63% exceed their 2030 emissions caps — estimate your LL97 penalty for the 2024–2029 and 2030 periods in 60 seconds, no signup.",
  keywords: [
    "LL97 penalty calculator",
    "Local Law 97 penalty calculator",
    "Local Law 97 calculator",
    "LL97 calculator",
    "LL97 fine calculator",
    "Local Law 97 penalty estimator",
    "NYC LL97 calculator",
    "Local Law 97 2030 penalty",
    "LL97 filing deadline",
    "NYC emissions cap",
    "building emissions fine calculator",
    "NYC building compliance",
    "multifamily emissions compliance",
    "Local Law 97",
    "LL97",
  ],
  applicationName: "Uniplexa",
  authors: [{ name: "Uniplexa" }],
  creator: "Uniplexa",
  publisher: "Uniplexa",
  category: "Real Estate",
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg" }],
  },
  // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to your Search Console token so
  // Google can verify the property (required to submit the sitemap for indexing).
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    title: "What will Local Law 97 cost your building?",
    description:
      "Most NYC buildings are over their 2030 emissions cap and don't know it. Find your LL97 penalty in 60 seconds — free.",
    url: siteUrl,
    type: "website",
    siteName: "Uniplexa",
  },
  twitter: {
    card: "summary_large_image",
    title: "What will Local Law 97 cost your building?",
    description:
      "63% of NYC buildings exceed their 2030 LL97 caps. Find your penalty number in 60 seconds — free.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Uniplexa",
      url: siteUrl,
      email: CONFIG.contactEmail,
      description:
        "Uniplexa is a compliance and energy intelligence platform for mid-size buildings, starting with NYC Local Law 97 penalty management.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Uniplexa — LL97 Penalty Calculator",
      url: siteUrl,
      description:
        "Estimate what NYC Local Law 97 will cost your building, and track your emissions against your cap.",
      inLanguage: "en-US",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: "LL97 Penalty Calculator — What Local Law 97 Will Cost Your Building",
      description:
        "Free Local Law 97 (LL97) penalty calculator for NYC buildings, covering the 2024–2029 and 2030 compliance periods.",
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#calculator` },
      primaryImageOfPage: `${siteUrl}/opengraph-image`,
      inLanguage: "en-US",
    },
    {
      // The calculator itself — targets "LL97 penalty calculator" queries and
      // is eligible for the free-tool rich result.
      "@type": ["WebApplication", "SoftwareApplication"],
      "@id": `${siteUrl}/#calculator`,
      name: "LL97 Penalty Calculator",
      alternateName: "Local Law 97 Penalty Calculator",
      url: siteUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Runs entirely in your browser.",
      description:
        "A free calculator that estimates NYC Local Law 97 (LL97) penalties for the 2024–2029 and 2030–2034 compliance periods, using the published emissions coefficients, per-building-type caps, and the $268-per-ton fine rate.",
      featureList: [
        "Estimate LL97 penalties for both the 2024–2029 and 2030 compliance periods",
        "10-year cumulative penalty exposure",
        "Building-type caps for multifamily, office, retail, and hotel",
        "Typical-building defaults if you don't have your usage handy",
      ],
      isPartOf: { "@id": `${siteUrl}/#website` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Who does LL97 apply to?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most NYC buildings over 25,000 gross square feet — and clusters of smaller buildings on the same lot that add up past it. If that's you, you have both an emissions cap and an annual filing obligation.",
          },
        },
        {
          "@type": "Question",
          name: "What happens if I do nothing?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Two separate costs. Emissions over your cap are fined $268 per metric ton of CO2e, every year, and the caps tighten sharply in 2030. Separately, missing the annual filing costs $0.50 per square foot per month — often larger than the emissions fine itself.",
          },
        },
        {
          "@type": "Question",
          name: "I already have a consultant — why this?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A consultant report is a snapshot: accurate the day it's written, stale by the next billing cycle, and $5,000–$25,000 each time. We track your emissions against your cap continuously, so your number is current when you actually need to make a decision.",
          },
        },
        {
          "@type": "Question",
          name: "What data do you need from me?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "To start, a utility bill — a phone photo is fine — or your ENERGY STAR Portfolio Manager account. That's enough to place you against your cap and project your penalty. No site visit, no engineering audit to get your number.",
          },
        },
        {
          "@type": "Question",
          name: "How much will this cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Early buildings get founder pricing. The honest anchor: less than one month of your 2030 fine.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://us.i.posthog.com" />
        <link rel="preconnect" href="https://us-assets.i.posthog.com" />
      </head>
      <body className="bg-paper font-sans text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <LeadFlusher />
        {children}
      </body>
    </html>
  );
}
