import type { Metadata } from "next";
import { CONFIG } from "@/config";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Uniplexa handles the email address and building details you share with us.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <a href="/" className="font-bold tracking-tight">
            Uniplexa
          </a>
          <a href="/" className="text-sm text-muted hover:text-ink">
            ← Back
          </a>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-16">
        <div className="stamp-label text-muted">Privacy policy</div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          What we do with your information
        </h1>
        <p className="mt-2 text-sm text-muted">Plain and short, on purpose.</p>

        <div className="mt-10 space-y-8 leading-relaxed text-ink">
          <section>
            <h2 className="font-bold">What we collect</h2>
            <p className="mt-2 text-muted">
              Only what you type into this site: the email address you give us to
              receive your penalty report, and — if you choose to add it — your
              building&rsquo;s address and the figures you entered into the
              calculator. We also collect basic, privacy-friendly usage analytics
              (page views, which sections you reach, whether the calculator was
              used) with no cross-site tracking.
            </p>
          </section>

          <section>
            <h2 className="font-bold">Why we collect it</h2>
            <p className="mt-2 text-muted">
              To send you the report you asked for, to follow up about your
              LL97 exposure, and to understand whether this tool is useful. That
              is the whole list.
            </p>
          </section>

          <section>
            <h2 className="font-bold">What we don&rsquo;t do</h2>
            <p className="mt-2 text-muted">
              We don&rsquo;t sell or rent your information. We don&rsquo;t share it
              with advertisers. We don&rsquo;t add you to lists you didn&rsquo;t
              ask to be on.
            </p>
          </section>

          <section>
            <h2 className="font-bold">Deletion</h2>
            <p className="mt-2 text-muted">
              Email{" "}
              <a
                href={`mailto:${CONFIG.contactEmail}`}
                className="text-stamp underline underline-offset-2"
              >
                {CONFIG.contactEmail}
              </a>{" "}
              and we&rsquo;ll delete everything we hold about you, no questions
              asked.
            </p>
          </section>

          <section>
            <h2 className="font-bold">Contact</h2>
            <p className="mt-2 text-muted">
              Questions about any of this go to the same address:{" "}
              <a
                href={`mailto:${CONFIG.contactEmail}`}
                className="text-stamp underline underline-offset-2"
              >
                {CONFIG.contactEmail}
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
