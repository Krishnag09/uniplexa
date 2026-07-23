import Calculator from "@/components/calculator";
import Faq from "@/components/faq";
import BookReviewButton from "@/components/book-review-button";
import { CONFIG } from "@/config";

export default function Home() {
  return (
    <main className="bg-paper text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <a href="#top" className="font-bold tracking-tight">
            Uniplexa
          </a>
          <a
            href="#calculator"
            className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
          >
            Estimate my penalty
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="ledger border-b border-line">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <div className="stamp-label text-stamp">
            <span className="h-2 w-2 rounded-full bg-stamp" aria-hidden="true" />
            NYC Local Law 97
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            What will Local Law 97 cost your building?
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Most NYC buildings are over their 2030 emissions cap and don&rsquo;t
            know it. Find your number in 60 seconds — free.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#calculator"
              className="rounded-md bg-stamp px-6 py-4 text-center text-base font-bold text-white transition-colors hover:bg-stampInk"
            >
              Estimate my penalty
            </a>
            <BookReviewButton className="rounded-md border border-line px-6 py-4 text-center text-base font-semibold text-ink transition-colors hover:border-ink">
              Book a free penalty review
            </BookReviewButton>
          </div>
          <p className="mt-10 max-w-xl border-l-2 border-stamp pl-4 text-sm text-muted">
            Roughly 63% of NYC buildings exceed their 2030 caps. A typical 50-unit
            building goes from about $6,000 a year in fines today to about $42,000
            a year in 2030.
          </p>
        </div>
      </section>

      {/* Calculator — the centerpiece */}
      <Calculator />

      {/* How it will work */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
          <div className="stamp-label text-muted">How it will work</div>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
            From a photo of a bill to your cheapest path under the cap.
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Forward us a utility bill — a photo is fine.",
                d: "No account setup, no engineering audit to get your number.",
              },
              {
                n: "02",
                t: "We track your emissions against your cap, continuously.",
                d: "Not once a year in a report that's stale by the next bill.",
              },
              {
                n: "03",
                t: "You get your penalty exposure, your filings, and the cheapest path under the cap.",
                d: "The dollar figure, the deadlines, and what to do about them.",
              },
            ].map((s) => (
              <li key={s.n}>
                <div className="text-sm font-bold text-stamp tnum">{s.n}</div>
                <p className="mt-3 font-semibold text-ink">{s.t}</p>
                <p className="mt-2 text-sm text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
            We&rsquo;re onboarding a limited group of early buildings now.
          </p>
        </div>
      </section>

      {/* The math nobody shows you */}
      <section className="border-b border-line bg-card">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
          <div className="stamp-label text-muted">The math nobody shows you</div>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
            A 50,000 sq ft multifamily building, before and after 2030.
          </h2>

          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
            <div className="bg-paper p-6">
              <div className="stamp-label text-muted">Today · 2024–2029</div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight text-ink tnum sm:text-4xl">
                ~$5,900
              </div>
              <p className="mt-1 text-sm text-muted">per year in emissions fines</p>
            </div>
            <div className="bg-paper p-6">
              <div className="stamp-label text-stamp">From 2030</div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight text-stamp tnum sm:text-4xl">
                ~$42,000
              </div>
              <p className="mt-1 text-sm text-muted">
                per year — a 7× jump as the cap tightens
              </p>
            </div>
            <div className="bg-paper p-6">
              <div className="stamp-label text-muted">If you miss the filing</div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight text-ink tnum sm:text-4xl">
                $25,000
              </div>
              <p className="mt-1 text-sm text-muted">
                per month — $0.50/sq ft, separate from the fine
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-sm text-muted">
            The non-filing penalty is often worse than the emissions fine itself —
            and it&rsquo;s entirely avoidable.
          </p>
        </div>
      </section>

      {/* How the calculator works — methodology / credibility for SEO */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
          <div className="stamp-label text-muted">Methodology</div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            How this Local Law 97 penalty calculator works
          </h2>
          <div className="mt-6 space-y-4 leading-relaxed text-muted">
            <p>
              Local Law 97 sets an annual carbon cap for most NYC buildings over
              25,000 square feet, and fines every metric ton of CO₂e over that cap
              at <span className="font-semibold text-ink tnum">$268</span>. This
              LL97 penalty calculator turns your building&rsquo;s energy use into
              an estimated fine for two compliance periods: 2024&ndash;2029, and
              the much tighter 2030&ndash;2034 limits.
            </p>
            <p>
              We convert your electricity, natural gas, fuel oil, and district
              steam into emissions using the coefficients published for LL97 —
              for example, 0.000288962 tCO₂e per kWh of electricity — then compare
              your total against the cap for your building type. Multifamily,
              office, retail, and hotel each get their own occupancy-group cap;
              &ldquo;other&rdquo; uses office limits and is labeled approximate.
            </p>
            <p>
              The result is an estimate to show you the order of magnitude and
              which side of the cap you&rsquo;re on — not a certified compliance
              filing. Your actual obligation depends on your building&rsquo;s
              specific characteristics, adjustments, and credits.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
          <div className="stamp-label text-muted">Questions</div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            The five we get asked most.
          </h2>
          <div className="mt-8">
            <Faq />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
            Want a person to walk you through your number?
          </h2>
          <div className="mt-6">
            <BookReviewButton className="inline-block rounded-md bg-stamp px-6 py-4 text-base font-bold text-white transition-colors hover:bg-stampInk">
              Book a free penalty review
            </BookReviewButton>
          </div>
          <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-bold text-ink">Uniplexa</span> · Compliance
              and energy intelligence for mid-size buildings.
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <a
                href={`mailto:${CONFIG.contactEmail}`}
                className="hover:text-ink"
              >
                {CONFIG.contactEmail}
              </a>
              <a href="/privacy/" className="hover:text-ink">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
